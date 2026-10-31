import { User, InflowPool, Expense, ErrandItem, MarketStatus, Settlement, DashboardStats, NetBalanceItem } from '../types';

interface OfflineStore {
  users: User[];
  inflows: InflowPool[];
  expenses: Expense[];
  errands: ErrandItem[];
  market_statuses: MarketStatus[];
  settlements: Settlement[];
}

const STORAGE_KEY = 'gharkhata_offline_store_v3';

const SEED_DATA: OfflineStore = {
  users: [
    {
      id: 1,
      name: 'Suhird Singh',
      role: 'Admin',
      avatar_color: '#3B82F6',
      email: 'suhird.sethi@gmail.com',
      household_code: 'GHAR-SINGHFAMILY',
      family_household_code: 'GHAR-SINGHFAMILY',
      personal_household_code: 'GHAR-PERS-1',
      active_mode: 'FAMILY',
      created_at: '2026-09-01T00:00:00'
    },
    {
      id: 2,
      name: 'Aman Sharma',
      role: 'Member',
      avatar_color: '#10B981',
      email: 'aman@gmail.com',
      household_code: 'GHAR-SINGHFAMILY',
      family_household_code: 'GHAR-SINGHFAMILY',
      personal_household_code: 'GHAR-PERS-2',
      active_mode: 'FAMILY',
      created_at: '2026-09-01T00:00:00'
    },
    {
      id: 3,
      name: 'Priya Verma',
      role: 'Member',
      avatar_color: '#EC4899',
      email: 'priya@gmail.com',
      household_code: 'GHAR-SINGHFAMILY',
      family_household_code: 'GHAR-SINGHFAMILY',
      personal_household_code: 'GHAR-PERS-3',
      active_mode: 'FAMILY',
      created_at: '2026-09-01T00:00:00'
    }
  ],
  inflows: [
    {
      id: 1,
      title: 'Ground Floor Rent - Flat 101',
      amount: 35000.0,
      month_year: '2026-10',
      household_code: 'GHAR-SINGHFAMILY',
      created_at: '2026-10-01T00:00:00'
    },
    {
      id: 2,
      title: 'First Floor Rent - Flat 201',
      amount: 25000.0,
      month_year: '2026-10',
      household_code: 'GHAR-SINGHFAMILY',
      created_at: '2026-10-01T00:00:00'
    },
    {
      id: 3,
      title: 'Ground Floor Rent - Flat 101',
      amount: 35000.0,
      month_year: '2026-09',
      household_code: 'GHAR-SINGHFAMILY',
      created_at: '2026-09-01T00:00:00'
    },
    {
      id: 4,
      title: 'First Floor Rent - Flat 201',
      amount: 25000.0,
      month_year: '2026-09',
      household_code: 'GHAR-SINGHFAMILY',
      created_at: '2026-09-01T00:00:00'
    }
  ],
  expenses: [
    {
      id: 1,
      title: 'Monthly Milk Token (Mother Dairy)',
      amount: 4200.0,
      category: 'Groceries',
      payer_id: 1,
      funding_source: 'RENTAL_POOL',
      split_type: 'EQUAL',
      date: '2026-10-02',
      receipt_note: 'Paid from central rental cash reserve',
      household_code: 'GHAR-SINGHFAMILY',
      created_at: '2026-10-02T10:00:00',
      splits: []
    },
    {
      id: 2,
      title: 'BSES Electricity Bill (Whole House)',
      amount: 7850.0,
      category: 'Utilities',
      payer_id: 1,
      funding_source: 'RENTAL_POOL',
      split_type: 'EQUAL',
      date: '2026-10-05',
      receipt_note: 'Paid online via net banking',
      household_code: 'GHAR-SINGHFAMILY',
      created_at: '2026-10-05T12:00:00',
      splits: []
    },
    {
      id: 3,
      title: 'Weekly Fresh Veggies & Fruits (Local Mandi)',
      amount: 1800.0,
      category: 'Groceries',
      payer_id: 1,
      funding_source: 'PERSONAL',
      split_type: 'EQUAL',
      date: '2026-10-12',
      receipt_note: 'Paid cash out-of-pocket by Suhird',
      household_code: 'GHAR-SINGHFAMILY',
      created_at: '2026-10-12T14:00:00',
      splits: [
        { id: 1, expense_id: 3, user_id: 1, share_amount: 600.0, is_settled: false },
        { id: 2, expense_id: 3, user_id: 2, share_amount: 600.0, is_settled: false },
        { id: 3, expense_id: 3, user_id: 3, share_amount: 600.0, is_settled: false }
      ]
    },
    {
      id: 4,
      title: 'Fresh Milk 2L & Paneer',
      amount: 400.0,
      category: 'Groceries',
      payer_id: 1,
      funding_source: 'RENTAL_POOL',
      split_type: 'EQUAL',
      date: '2026-10-28',
      receipt_note: 'Quick daily grocery',
      household_code: 'GHAR-SINGHFAMILY',
      created_at: '2026-10-28T07:00:00',
      splits: []
    }
  ],
  errands: [
    {
      id: 1,
      name: 'Fresh Tomatoes & Spinach (2 kg)',
      category: 'Vegetables & Fruit',
      status: 'PENDING',
      added_by_id: 1,
      household_code: 'GHAR-SINGHFAMILY',
      created_at: '2026-10-28T09:00:00'
    },
    {
      id: 2,
      name: 'Full Cream Milk (2 Packets)',
      category: 'Dairy & Bread',
      status: 'IN_CART',
      added_by_id: 3,
      household_code: 'GHAR-SINGHFAMILY',
      created_at: '2026-10-28T10:00:00'
    },
    {
      id: 3,
      name: 'Dishwasher Bar & Sponge Scrub',
      category: 'Household & Cleaning',
      status: 'BOUGHT',
      added_by_id: 2,
      household_code: 'GHAR-SINGHFAMILY',
      created_at: '2026-10-28T11:00:00'
    }
  ],
  market_statuses: [
    { id: 1, user_id: 1, is_active: false, household_code: 'GHAR-SINGHFAMILY', updated_at: '2026-10-28T09:00:00' },
    { id: 2, user_id: 2, is_active: true, household_code: 'GHAR-SINGHFAMILY', updated_at: '2026-10-28T10:30:00' },
    { id: 3, user_id: 3, is_active: false, household_code: 'GHAR-SINGHFAMILY', updated_at: '2026-10-28T09:00:00' }
  ],
  settlements: [
    {
      id: 1,
      payer_id: 2,
      receiver_id: 1,
      amount: 500.0,
      notes: 'UPI transfer for last weekend groceries',
      household_code: 'GHAR-SINGHFAMILY',
      created_at: '2026-10-15T15:30:00'
    }
  ]
};

export function getOfflineStore(): OfflineStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.users || parsed.users.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    return parsed;
  } catch (e) {
    return SEED_DATA;
  }
}

export function saveOfflineStore(store: OfflineStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function generateHouseholdCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `GHAR-${digits}`;
}

export function offlineQuickLogin(name: string, householdCode?: string, isCreatingNewHousehold = false): User {
  const store = getOfflineStore();
  const cleanName = (name || '').trim();

  let targetCode = householdCode ? householdCode.trim().toUpperCase() : '';

  // If user explicitly chose to create a new household or didn't provide any code, generate a unique code
  if (isCreatingNewHousehold || !targetCode) {
    if (!targetCode) {
      targetCode = generateHouseholdCode();
    }
  }

  // Look for existing user with this name in this household
  const existing = store.users.find(
    (u) =>
      u.name.toLowerCase() === cleanName.toLowerCase() &&
      (u.household_code === targetCode || u.family_household_code === targetCode)
  );

  if (existing) {
    return existing;
  }

  const newId = store.users.length > 0 ? Math.max(...store.users.map((u) => u.id)) + 1 : 1;
  const isFirstInHousehold = !store.users.some(
    (u) => u.household_code === targetCode || u.family_household_code === targetCode
  );

  const newUser: User = {
    id: newId,
    name: cleanName || `User ${newId}`,
    role: isFirstInHousehold || isCreatingNewHousehold ? 'Admin' : 'Member',
    avatar_color: newId % 2 === 1 ? '#3B82F6' : '#10B981',
    household_code: targetCode,
    family_household_code: targetCode,
    personal_household_code: `GHAR-PERS-${newId}`,
    active_mode: 'FAMILY',
    created_at: new Date().toISOString()
  };

  store.users.push(newUser);
  store.market_statuses.push({
    id: newId,
    user_id: newId,
    household_code: targetCode,
    is_active: false,
    updated_at: new Date().toISOString()
  });
  saveOfflineStore(store);
  return newUser;
}

export function offlineFetchUsers(householdCode?: string): User[] {
  const store = getOfflineStore();
  if (!householdCode) return store.users;
  const code = householdCode.trim().toUpperCase();
  return store.users.filter(
    (u) =>
      u.household_code === code ||
      u.family_household_code === code ||
      u.personal_household_code === code
  );
}

export function offlineFetchInflows(monthYear?: string, householdCode?: string): InflowPool[] {
  const store = getOfflineStore();
  let list = store.inflows;
  if (householdCode) {
    const code = householdCode.trim().toUpperCase();
    list = list.filter((i) => (i.household_code || 'GHAR-SINGHFAMILY').toUpperCase() === code);
  }
  if (monthYear) {
    list = list.filter((i) => i.month_year === monthYear);
  }
  return list;
}

export function offlineCreateInflow(data: { title: string; amount: number; month_year: string; household_code?: string }): InflowPool {
  const store = getOfflineStore();
  const newId = store.inflows.length > 0 ? Math.max(...store.inflows.map((i) => i.id)) + 1 : 1;
  const newInflow: InflowPool = {
    id: newId,
    title: data.title,
    amount: Number(data.amount),
    month_year: data.month_year,
    household_code: (data.household_code || 'GHAR-SINGHFAMILY').trim().toUpperCase(),
    created_at: new Date().toISOString()
  };
  store.inflows.unshift(newInflow);
  saveOfflineStore(store);
  return newInflow;
}

export function offlineDeleteInflow(id: number): void {
  const store = getOfflineStore();
  store.inflows = store.inflows.filter((i) => i.id !== id);
  saveOfflineStore(store);
}

export function offlineFetchExpenses(params?: {
  month_year?: string;
  category?: string;
  search?: string;
  household_code?: string;
}): Expense[] {
  const store = getOfflineStore();
  let list = [...store.expenses];

  if (params?.household_code) {
    const code = params.household_code.trim().toUpperCase();
    list = list.filter((e) => (e.household_code || 'GHAR-SINGHFAMILY').toUpperCase() === code);
  }
  if (params?.month_year) {
    list = list.filter((e) => e.date.startsWith(params.month_year!));
  }
  if (params?.category && params.category !== 'ALL') {
    list = list.filter((e) => e.category.toLowerCase() === params.category!.toLowerCase());
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter((e) => e.title.toLowerCase().includes(q) || (e.receipt_note && e.receipt_note.toLowerCase().includes(q)));
  }

  // Populate payer info
  return list.map((e) => ({
    ...e,
    payer: store.users.find((u) => u.id === e.payer_id),
    splits: (e.splits || []).map((s) => ({
      ...s,
      user: store.users.find((u) => u.id === s.user_id)
    }))
  }));
}

export function offlineCreateExpense(data: {
  title: string;
  amount: number;
  category: string;
  payer_id: number;
  funding_source: any;
  split_type: any;
  date: string;
  receipt_note?: string;
  image_url?: string;
  household_code?: string;
  splits?: { user_id: number; share_amount: number }[];
}): Expense {
  const store = getOfflineStore();
  const newId = store.expenses.length > 0 ? Math.max(...store.expenses.map((e) => e.id)) + 1 : 1;

  const splits = (data.splits || []).map((s, idx) => ({
    id: idx + 1,
    expense_id: newId,
    user_id: s.user_id,
    share_amount: Number(s.share_amount),
    is_settled: false
  }));

  const targetCode = (data.household_code || 'GHAR-SINGHFAMILY').trim().toUpperCase();

  const newExp: Expense = {
    id: newId,
    title: data.title,
    amount: Number(data.amount),
    category: data.category,
    payer_id: data.payer_id,
    funding_source: data.funding_source,
    split_type: data.split_type,
    date: data.date,
    receipt_note: data.receipt_note,
    image_url: data.image_url,
    household_code: targetCode,
    created_at: new Date().toISOString(),
    splits
  };

  store.expenses.unshift(newExp);
  saveOfflineStore(store);
  return {
    ...newExp,
    payer: store.users.find((u) => u.id === newExp.payer_id)
  };
}

export function offlineDeleteExpense(id: number): void {
  const store = getOfflineStore();
  store.expenses = store.expenses.filter((e) => e.id !== id);
  saveOfflineStore(store);
}

export function offlineFetchErrands(category?: string, status?: string, householdCode?: string): ErrandItem[] {
  const store = getOfflineStore();
  let list = [...store.errands];

  if (householdCode) {
    const code = householdCode.trim().toUpperCase();
    list = list.filter((e) => (e.household_code || 'GHAR-SINGHFAMILY').toUpperCase() === code);
  }
  if (category && category !== 'ALL') {
    list = list.filter((item) => item.category === category);
  }
  if (status && status !== 'ALL') {
    list = list.filter((item) => item.status === status);
  }
  return list.map((item) => ({
    ...item,
    added_by: store.users.find((u) => u.id === item.added_by_id)
  }));
}

export function offlineCreateErrand(data: { name: string; category: string; added_by_id: number; household_code?: string }): ErrandItem {
  const store = getOfflineStore();
  const newId = store.errands.length > 0 ? Math.max(...store.errands.map((e) => e.id)) + 1 : 1;
  const targetCode = (data.household_code || 'GHAR-SINGHFAMILY').trim().toUpperCase();

  const newErrand: ErrandItem = {
    id: newId,
    name: data.name,
    category: data.category,
    status: 'PENDING',
    added_by_id: data.added_by_id,
    household_code: targetCode,
    created_at: new Date().toISOString()
  };
  store.errands.unshift(newErrand);
  saveOfflineStore(store);
  return {
    ...newErrand,
    added_by: store.users.find((u) => u.id === newErrand.added_by_id)
  };
}

export function offlineUpdateErrand(id: number, data: { status?: any; name?: string; category?: string }): ErrandItem {
  const store = getOfflineStore();
  const item = store.errands.find((e) => e.id === id);
  if (item) {
    if (data.status) item.status = data.status;
    if (data.name) item.name = data.name;
    if (data.category) item.category = data.category;
    saveOfflineStore(store);
  }
  return item || { id, name: '', category: '', status: 'PENDING', added_by_id: 1, created_at: '' };
}

export function offlineDeleteErrand(id: number): void {
  const store = getOfflineStore();
  store.errands = store.errands.filter((e) => e.id !== id);
  saveOfflineStore(store);
}

export function offlineFetchMarketStatuses(householdCode?: string): MarketStatus[] {
  const store = getOfflineStore();
  let list = store.market_statuses;
  if (householdCode) {
    const code = householdCode.trim().toUpperCase();
    list = list.filter((m) => (m.household_code || 'GHAR-SINGHFAMILY').toUpperCase() === code);
  }
  return list.map((ms) => ({
    ...ms,
    user: store.users.find((u) => u.id === ms.user_id)
  }));
}

export function offlineToggleMarketStatus(userId: number, isActive?: boolean): MarketStatus {
  const store = getOfflineStore();
  let ms = store.market_statuses.find((m) => m.user_id === userId);
  const user = store.users.find((u) => u.id === userId);
  const nextActive = isActive !== undefined ? isActive : ms ? !ms.is_active : true;

  if (!ms) {
    ms = {
      id: userId,
      user_id: userId,
      household_code: user?.household_code || 'GHAR-SINGHFAMILY',
      is_active: nextActive,
      updated_at: new Date().toISOString()
    };
    store.market_statuses.push(ms);
  } else {
    ms.is_active = nextActive;
    ms.updated_at = new Date().toISOString();
  }
  saveOfflineStore(store);
  return {
    ...ms,
    user
  };
}

export function offlineCalculateNetDues(householdCode?: string): NetBalanceItem[] {
  const store = getOfflineStore();
  const targetCode = householdCode ? householdCode.trim().toUpperCase() : '';

  const relevantUsers = targetCode
    ? store.users.filter(
        (u) =>
          (u.household_code || '').toUpperCase() === targetCode ||
          (u.family_household_code || '').toUpperCase() === targetCode
      )
    : store.users;

  const userMap: { [id: number]: string } = {};
  const netBalances: { [id: number]: number } = {};

  relevantUsers.forEach((u) => {
    userMap[u.id] = u.name;
    netBalances[u.id] = 0.0;
  });

  const relevantExpenses = targetCode
    ? store.expenses.filter((e) => (e.household_code || '').toUpperCase() === targetCode)
    : store.expenses;

  relevantExpenses
    .filter((e) => e.funding_source === 'PERSONAL')
    .forEach((exp) => {
      const payerId = exp.payer_id;
      (exp.splits || []).forEach((split) => {
        if (!split.is_settled && split.user_id !== payerId) {
          if (netBalances[split.user_id] !== undefined) netBalances[split.user_id] -= split.share_amount;
          if (netBalances[payerId] !== undefined) netBalances[payerId] += split.share_amount;
        }
      });
    });

  const relevantSettlements = targetCode
    ? store.settlements.filter((s) => (s.household_code || '').toUpperCase() === targetCode)
    : store.settlements;

  relevantSettlements.forEach((st) => {
    if (netBalances[st.payer_id] !== undefined) netBalances[st.payer_id] += st.amount;
    if (netBalances[st.receiver_id] !== undefined) netBalances[st.receiver_id] -= st.amount;
  });

  const debtors: { id: number; balance: number }[] = [];
  const creditors: { id: number; balance: number }[] = [];

  Object.entries(netBalances).forEach(([uidStr, bal]) => {
    const uid = Number(uidStr);
    const roundBal = Math.round(bal * 100) / 100;
    if (roundBal < -0.01) debtors.push({ id: uid, balance: roundBal });
    else if (roundBal > 0.01) creditors.push({ id: uid, balance: roundBal });
  });

  debtors.sort((a, b) => a.balance - b.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const results: NetBalanceItem[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const amount = Math.min(-debtor.balance, creditor.balance);
    const settleAmt = Math.round(amount * 100) / 100;

    if (settleAmt > 0) {
      results.push({
        from_user_id: debtor.id,
        from_user_name: userMap[debtor.id] || `User ${debtor.id}`,
        to_user_id: creditor.id,
        to_user_name: userMap[creditor.id] || `User ${creditor.id}`,
        amount: settleAmt
      });
    }

    debtor.balance += settleAmt;
    creditor.balance -= settleAmt;

    if (Math.abs(debtor.balance) < 0.01) dIdx++;
    if (Math.abs(creditor.balance) < 0.01) cIdx++;
  }

  return results;
}

export function offlineRecordSettlement(data: {
  payer_id: number;
  receiver_id: number;
  amount: number;
  notes?: string;
  household_code?: string;
}): Settlement {
  const store = getOfflineStore();
  const newId = store.settlements.length > 0 ? Math.max(...store.settlements.map((s) => s.id)) + 1 : 1;
  const targetCode = (data.household_code || 'GHAR-SINGHFAMILY').trim().toUpperCase();

  const newSt: Settlement = {
    id: newId,
    payer_id: data.payer_id,
    receiver_id: data.receiver_id,
    amount: Number(data.amount),
    notes: data.notes,
    household_code: targetCode,
    created_at: new Date().toISOString()
  };
  store.settlements.unshift(newSt);
  saveOfflineStore(store);
  return {
    ...newSt,
    payer: store.users.find((u) => u.id === newSt.payer_id),
    receiver: store.users.find((u) => u.id === newSt.receiver_id)
  };
}

export function offlineFetchSettlementHistory(householdCode?: string): Settlement[] {
  const store = getOfflineStore();
  let list = store.settlements;
  if (householdCode) {
    const code = householdCode.trim().toUpperCase();
    list = list.filter((s) => (s.household_code || 'GHAR-SINGHFAMILY').toUpperCase() === code);
  }
  return list.map((s) => ({
    ...s,
    payer: store.users.find((u) => u.id === s.payer_id),
    receiver: store.users.find((u) => u.id === s.receiver_id)
  }));
}

export function offlineFetchDashboardStats(monthYear: string, householdCode?: string): DashboardStats {
  const store = getOfflineStore();
  const targetCode = householdCode ? householdCode.trim().toUpperCase() : '';

  const monthInflows = store.inflows.filter((i) => {
    const matchMonth = i.month_year === monthYear;
    const matchHouse = !targetCode || (i.household_code || '').toUpperCase() === targetCode;
    return matchMonth && matchHouse;
  });
  const totalInflow = monthInflows.reduce((sum, i) => sum + Number(i.amount), 0);

  const monthExpenses = store.expenses.filter((e) => {
    const matchMonth = e.date.startsWith(monthYear);
    const matchHouse = !targetCode || (e.household_code || '').toUpperCase() === targetCode;
    return matchMonth && matchHouse;
  });

  const poolExpenses = monthExpenses.filter((e) => e.funding_source === 'RENTAL_POOL');
  const spentFromPool = poolExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remainingPool = totalInflow - spentFromPool;

  const personalExpenses = monthExpenses.filter((e) => e.funding_source === 'PERSONAL');
  const totalPersonal = personalExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const netDues = offlineCalculateNetDues(targetCode);

  const relevantBeacons = targetCode
    ? store.market_statuses.filter((m) => (m.household_code || '').toUpperCase() === targetCode)
    : store.market_statuses;

  const activeBeacons: MarketStatus[] = relevantBeacons.map((ms) => ({
    ...ms,
    user: store.users.find((u) => u.id === ms.user_id)
  }));

  const categoryBreakdown: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    const cat = e.category || 'Miscellaneous';
    categoryBreakdown[cat] = Math.round(((categoryBreakdown[cat] || 0) + Number(e.amount)) * 100) / 100;
  });

  return {
    total_monthly_inflow: Math.round(totalInflow * 100) / 100,
    spent_from_pool: Math.round(spentFromPool * 100) / 100,
    remaining_rental_balance: Math.round(remainingPool * 100) / 100,
    total_personal_expenses: Math.round(totalPersonal * 100) / 100,
    net_dues_list: netDues,
    active_market_beacons: activeBeacons,
    category_breakdown: categoryBreakdown
  };
}
