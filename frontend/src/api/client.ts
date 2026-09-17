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

const API_BASE = ''; // Proxied via Vite to http://127.0.0.1:8000

export async function loginWithGoogle(credential: string, householdCode?: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, household_code: householdCode })
  });
  if (!res.ok) throw new Error('Google authentication failed');
  const data = await res.json();
  return data.user;
}

export async function joinHousehold(userId: number, householdCode: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/join-household`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, household_code: householdCode })
  });
  if (!res.ok) throw new Error('Failed to join family household');
  const data = await res.json();
  return data.user;
}

export async function createHousehold(userId: number, customCode?: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/create-household`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, custom_code: customCode })
  });
  if (!res.ok) throw new Error('Failed to create new household code');
  const data = await res.json();
  return data.user;
}

export async function switchLedgerMode(userId: number, mode: 'PERSONAL' | 'FAMILY'): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/switch-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, mode })
  });
  if (!res.ok) throw new Error('Failed to switch ledger mode');
  const data = await res.json();
  return data.user;
}

export async function fetchUsers(householdCode?: string): Promise<User[]> {
  const url = householdCode ? `${API_BASE}/api/users?household_code=${householdCode}` : `${API_BASE}/api/users`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function createUser(data: { name: string; role?: string; avatar_color?: string; household_code?: string }): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}

export async function resetAllData(householdCode?: string): Promise<void> {
  const url = householdCode ? `${API_BASE}/api/users/reset-data?household_code=${householdCode}` : `${API_BASE}/api/users/reset-data`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset sample data');
}

export async function fetchInflows(monthYear?: string, householdCode?: string): Promise<InflowPool[]> {
  const params = new URLSearchParams();
  if (monthYear) params.append('month_year', monthYear);
  if (householdCode) params.append('household_code', householdCode);

  const res = await fetch(`${API_BASE}/api/inflows?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch inflow pools');
  return res.json();
}

export async function createInflow(data: { title: string; amount: number; month_year: string; household_code?: string }): Promise<InflowPool> {
  const res = await fetch(`${API_BASE}/api/inflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create inflow pool');
  return res.json();
}

export async function updateInflow(id: number, data: { title?: string; amount?: number; month_year?: string }): Promise<InflowPool> {
  const res = await fetch(`${API_BASE}/api/inflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update inflow pool');
  return res.json();
}

export async function deleteInflow(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/inflows/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete inflow');
}

export async function fetchExpenses(params?: {
  month_year?: string;
  category?: string;
  funding_source?: string;
  search?: string;
  household_code?: string;
}): Promise<Expense[]> {
  const query = new URLSearchParams();
  if (params?.month_year) query.append('month_year', params.month_year);
  if (params?.category) query.append('category', params.category);
  if (params?.funding_source) query.append('funding_source', params.funding_source);
  if (params?.search) query.append('search', params.search);
  if (params?.household_code) query.append('household_code', params.household_code);

  const res = await fetch(`${API_BASE}/api/expenses?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json();
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
  const res = await fetch(`${API_BASE}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create expense');
  return res.json();
}

export async function deleteExpense(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/expenses/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete expense');
}

export async function uploadReceipt(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/expenses/upload-receipt`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload receipt');
  return res.json();
}

export async function fetchErrands(category?: string, status?: string, householdCode?: string): Promise<ErrandItem[]> {
  const query = new URLSearchParams();
  if (category) query.append('category', category);
  if (status) query.append('status', status);
  if (householdCode) query.append('household_code', householdCode);

  const res = await fetch(`${API_BASE}/api/errands?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch errands');
  return res.json();
}

export async function createErrand(data: { name: string; category: string; added_by_id: number; household_code?: string }): Promise<ErrandItem> {
  const res = await fetch(`${API_BASE}/api/errands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create errand');
  return res.json();
}

export async function updateErrand(id: number, data: { status?: string; name?: string; category?: string }): Promise<ErrandItem> {
  const res = await fetch(`${API_BASE}/api/errands/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update errand');
  return res.json();
}

export async function deleteErrand(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/errands/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete errand');
}

export async function fetchMarketStatuses(): Promise<MarketStatus[]> {
  const res = await fetch(`${API_BASE}/api/market-status`);
  if (!res.ok) throw new Error('Failed to fetch market statuses');
  return res.json();
}

export async function toggleMarketStatus(userId: number, isActive?: boolean): Promise<MarketStatus> {
  const res = await fetch(`${API_BASE}/api/market-status/toggle/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: isActive !== undefined ? JSON.stringify({ is_active: isActive }) : undefined
  });
  if (!res.ok) throw new Error('Failed to toggle market status');
  return res.json();
}

export async function fetchNetDues(householdCode?: string): Promise<NetBalanceItem[]> {
  const url = householdCode ? `${API_BASE}/api/dues/net?household_code=${householdCode}` : `${API_BASE}/api/dues/net`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch net dues');
  return res.json();
}

export async function recordSettlement(data: {
  payer_id: number;
  receiver_id: number;
  amount: number;
  notes?: string;
  household_code?: string;
}): Promise<Settlement> {
  const res = await fetch(`${API_BASE}/api/settlements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to record settlement');
  return res.json();
}

export async function fetchSettlementHistory(householdCode?: string): Promise<Settlement[]> {
  const url = householdCode ? `${API_BASE}/api/settlements?household_code=${householdCode}` : `${API_BASE}/api/settlements`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch settlement history');
  return res.json();
}

export async function fetchDashboardStats(monthYear: string, householdCode?: string): Promise<DashboardStats> {
  const url = householdCode ? `${API_BASE}/api/stats?month_year=${monthYear}&household_code=${householdCode}` : `${API_BASE}/api/stats?month_year=${monthYear}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}
