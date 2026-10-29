import {
  User,
  InflowPool,
  Expense,
  ErrandItem,
  MarketStatus,
  Settlement,
  NetBalanceItem,
  DashboardStats
} from '../types';

import {
  offlineQuickLogin,
  offlineFetchUsers,
  offlineFetchInflows,
  offlineCreateInflow,
  offlineDeleteInflow,
  offlineFetchExpenses,
  offlineCreateExpense,
  offlineDeleteExpense,
  offlineFetchErrands,
  offlineCreateErrand,
  offlineUpdateErrand,
  offlineDeleteErrand,
  offlineToggleMarketStatus,
  offlineCalculateNetDues,
  offlineRecordSettlement,
  offlineFetchSettlementHistory,
  offlineFetchDashboardStats,
  getOfflineStore,
  saveOfflineStore
} from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function loginWithGoogle(credential: string, householdCode?: string): Promise<User> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, household_code: householdCode })
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (err) {
    console.warn('Backend unavailable, using offline login:', err);
  }
  return offlineQuickLogin('Suhird Singh', householdCode);
}

export async function quickLogin(name: string, householdCode?: string): Promise<User> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/quick-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, household_code: householdCode })
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (err) {
    console.warn('Backend unavailable for quick-login, falling back to local storage:', err);
  }
  return offlineQuickLogin(name, householdCode);
}

export async function joinHousehold(userId: number, householdCode: string): Promise<User> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/join-household`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, household_code: householdCode })
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (err) {
    console.warn('Backend unavailable for joinHousehold:', err);
  }
  const store = getOfflineStore();
  const u = store.users.find((user) => user.id === userId);
  if (u) {
    u.household_code = householdCode.trim().toUpperCase();
    saveOfflineStore(store);
    return u;
  }
  throw new Error('User not found');
}

export async function createHousehold(userId: number, customCode?: string): Promise<User> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/create-household`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, custom_code: customCode })
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (err) {
    console.warn('Backend unavailable for createHousehold:', err);
  }
  const store = getOfflineStore();
  const u = store.users.find((user) => user.id === userId);
  if (u) {
    const code = (customCode || `GHAR-${Math.floor(1000 + Math.random() * 9000)}`).trim().toUpperCase();
    u.household_code = code;
    u.family_household_code = code;
    saveOfflineStore(store);
    return u;
  }
  throw new Error('User not found');
}

export async function switchLedgerMode(userId: number, mode: 'PERSONAL' | 'FAMILY'): Promise<User> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/switch-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, mode })
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (err) {
    console.warn('Backend unavailable for switchLedgerMode:', err);
  }
  const store = getOfflineStore();
  const u = store.users.find((user) => user.id === userId);
  if (u) {
    u.active_mode = mode;
    u.household_code = mode === 'PERSONAL' ? u.personal_household_code || `GHAR-PERS-${u.id}` : u.family_household_code || 'GHAR-SINGHFAMILY';
    saveOfflineStore(store);
    return u;
  }
  throw new Error('User not found');
}

export async function fetchUsers(householdCode?: string): Promise<User[]> {
  try {
    const url = householdCode ? `${API_BASE}/api/users?household_code=${householdCode}` : `${API_BASE}/api/users`;
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Fall back silently
  }
  return offlineFetchUsers(householdCode);
}

export async function createUser(data: { name: string; role?: string; avatar_color?: string; household_code?: string }): Promise<User> {
  try {
    const res = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend unavailable for createUser:', err);
  }
  return offlineQuickLogin(data.name, data.household_code);
}

export async function deleteUser(userId: number): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/users/${userId}`, { method: 'DELETE' });
    if (res.ok) return;
  } catch (err) {}
  const store = getOfflineStore();
  store.users = store.users.filter((u) => u.id !== userId);
  saveOfflineStore(store);
}

export async function resetAllData(householdCode?: string): Promise<void> {
  try {
    const url = householdCode ? `${API_BASE}/api/users/reset-data?household_code=${householdCode}` : `${API_BASE}/api/users/reset-data`;
    await fetch(url, { method: 'POST' });
  } catch (err) {}
  localStorage.removeItem('gharkhata_offline_store_v2');
}

export async function fetchInflows(monthYear?: string, householdCode?: string): Promise<InflowPool[]> {
  try {
    const params = new URLSearchParams();
    if (monthYear) params.append('month_year', monthYear);
    if (householdCode) params.append('household_code', householdCode);

    const res = await fetch(`${API_BASE}/api/inflows?${params.toString()}`);
    if (res.ok) return await res.json();
  } catch (err) {}
  return offlineFetchInflows(monthYear);
}

export async function createInflow(data: { title: string; amount: number; month_year: string; household_code?: string }): Promise<InflowPool> {
  try {
    const res = await fetch(`${API_BASE}/api/inflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch (err) {}
  return offlineCreateInflow(data);
}

export async function updateInflow(id: number, data: { title?: string; amount?: number; month_year?: string }): Promise<InflowPool> {
  try {
    const res = await fetch(`${API_BASE}/api/inflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch (err) {}
  const store = getOfflineStore();
  const item = store.inflows.find((i) => i.id === id);
  if (item) {
    if (data.title) item.title = data.title;
    if (data.amount !== undefined) item.amount = Number(data.amount);
    if (data.month_year) item.month_year = data.month_year;
    saveOfflineStore(store);
    return item;
  }
  return { id, title: '', amount: 0, month_year: '', created_at: '' };
}

export async function deleteInflow(id: number): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/inflows/${id}`, { method: 'DELETE' });
    if (res.ok) return;
  } catch (err) {}
  offlineDeleteInflow(id);
}

export async function fetchExpenses(params?: {
  month_year?: string;
  category?: string;
  funding_source?: string;
  search?: string;
  household_code?: string;
}): Promise<Expense[]> {
  try {
    const query = new URLSearchParams();
    if (params?.month_year) query.append('month_year', params.month_year);
    if (params?.category) query.append('category', params.category);
    if (params?.funding_source) query.append('funding_source', params.funding_source);
    if (params?.search) query.append('search', params.search);
    if (params?.household_code) query.append('household_code', params.household_code);

    const res = await fetch(`${API_BASE}/api/expenses?${query.toString()}`);
    if (res.ok) return await res.json();
  } catch (err) {}
  return offlineFetchExpenses(params);
}

export async function createExpense(data: {
  title: string;
  amount: number;
  category: string;
  payer_id: number;
  funding_source: string;
  split_type: string;
  date: string;
  receipt_note?: string;
  image_url?: string;
  household_code?: string;
  splits?: { user_id: number; share_amount: number }[];
}): Promise<Expense> {
  try {
    const res = await fetch(`${API_BASE}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch (err) {}
  return offlineCreateExpense(data);
}

export async function deleteExpense(id: number): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) return;
  } catch (err) {}
  offlineDeleteExpense(id);
}

export async function uploadReceipt(file: File): Promise<{ url: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/expenses/upload-receipt`, {
      method: 'POST',
      body: formData
    });
    if (res.ok) return await res.json();
  } catch (err) {}
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve({ url: reader.result as string });
    reader.readAsDataURL(file);
  });
}

export async function fetchErrands(category?: string, status?: string, householdCode?: string): Promise<ErrandItem[]> {
  try {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (status) query.append('status', status);
    if (householdCode) query.append('household_code', householdCode);

    const res = await fetch(`${API_BASE}/api/errands?${query.toString()}`);
    if (res.ok) return await res.json();
  } catch (err) {}
  return offlineFetchErrands(category, status);
}

export async function createErrand(data: { name: string; category: string; added_by_id: number; household_code?: string }): Promise<ErrandItem> {
  try {
    const res = await fetch(`${API_BASE}/api/errands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch (err) {}
  return offlineCreateErrand(data);
}

export async function updateErrand(id: number, data: { status?: string; name?: string; category?: string }): Promise<ErrandItem> {
  try {
    const res = await fetch(`${API_BASE}/api/errands/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch (err) {}
  return offlineUpdateErrand(id, data);
}

export async function deleteErrand(id: number): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/errands/${id}`, { method: 'DELETE' });
    if (res.ok) return;
  } catch (err) {}
  offlineDeleteErrand(id);
}

export async function fetchMarketStatuses(): Promise<MarketStatus[]> {
  try {
    const res = await fetch(`${API_BASE}/api/market-status`);
    if (res.ok) return await res.json();
  } catch (err) {}
  const store = getOfflineStore();
  return store.market_statuses.map((ms) => ({
    ...ms,
    user: store.users.find((u) => u.id === ms.user_id)
  }));
}

export async function toggleMarketStatus(userId: number, isActive?: boolean): Promise<MarketStatus> {
  try {
    const res = await fetch(`${API_BASE}/api/market-status/toggle/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: isActive !== undefined ? JSON.stringify({ is_active: isActive }) : undefined
    });
    if (res.ok) return await res.json();
  } catch (err) {}
  return offlineToggleMarketStatus(userId, isActive);
}

export async function fetchNetDues(householdCode?: string): Promise<NetBalanceItem[]> {
  try {
    const url = householdCode ? `${API_BASE}/api/dues/net?household_code=${householdCode}` : `${API_BASE}/api/dues/net`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {}
  return offlineCalculateNetDues();
}

export async function recordSettlement(data: {
  payer_id: number;
  receiver_id: number;
  amount: number;
  notes?: string;
  household_code?: string;
}): Promise<Settlement> {
  try {
    const res = await fetch(`${API_BASE}/api/settlements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch (err) {}
  return offlineRecordSettlement(data);
}

export async function fetchSettlementHistory(householdCode?: string): Promise<Settlement[]> {
  try {
    const url = householdCode ? `${API_BASE}/api/settlements?household_code=${householdCode}` : `${API_BASE}/api/settlements`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {}
  return offlineFetchSettlementHistory();
}

export async function fetchDashboardStats(monthYear: string, householdCode?: string): Promise<DashboardStats> {
  try {
    const url = householdCode ? `${API_BASE}/api/stats?month_year=${monthYear}&household_code=${householdCode}` : `${API_BASE}/api/stats?month_year=${monthYear}`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {}
  return offlineFetchDashboardStats(monthYear);
}
