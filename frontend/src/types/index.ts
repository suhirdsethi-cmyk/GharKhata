export type UserRole = 'Admin' | 'Member';

export interface User {
  id: number;
  name: string;
  role: UserRole;
  avatar_color: string;
  email?: string;
  picture?: string;
  household_code?: string;
  personal_household_code?: string;
  family_household_code?: string;
  active_mode?: 'PERSONAL' | 'FAMILY';
  created_at: string;
}

export interface InflowPool {
  id: number;
  title: string;
  amount: number;
  month_year: string;
  created_at: string;
}

export type FundingSource = 'RENTAL_POOL' | 'PERSONAL';
export type SplitType = 'EQUAL' | 'CUSTOM' | 'FULL_BEHALF';

export interface ExpenseSplit {
  id: number;
  expense_id: number;
  user_id: number;
  share_amount: number;
  is_settled: boolean;
  user?: User;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  payer_id: number;
  funding_source: FundingSource;
  split_type: SplitType;
  date: string;
  receipt_note?: string;
  image_url?: string;
  created_at: string;
  payer?: User;
  splits: ExpenseSplit[];
}

export type ErrandStatus = 'PENDING' | 'IN_CART' | 'BOUGHT';

export interface ErrandItem {
  id: number;
  name: string;
  category: string;
  status: ErrandStatus;
  added_by_id: number;
  created_at: string;
  added_by?: User;
}

export interface MarketStatus {
  id: number;
  user_id: number;
  is_active: boolean;
  updated_at: string;
  user?: User;
}

export interface Settlement {
  id: number;
  payer_id: number;
  receiver_id: number;
  amount: number;
  notes?: string;
  created_at: string;
  payer?: User;
  receiver?: User;
}

export interface NetBalanceItem {
  from_user_id: number;
  from_user_name: string;
  to_user_id: number;
  to_user_name: string;
  amount: number;
}

export interface DashboardStats {
  total_monthly_inflow: number;
  spent_from_pool: number;
  remaining_rental_balance: number;
  total_personal_expenses: number;
  net_dues_list: NetBalanceItem[];
  active_market_beacons: MarketStatus[];
  category_breakdown?: Record<string, number>;
}
