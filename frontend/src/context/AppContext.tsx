import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { googleLogout } from '@react-oauth/google';
import { fetchUsers, fetchDashboardStats, toggleMarketStatus, loginWithGoogle, joinHousehold, createHousehold, switchLedgerMode } from '../api/client';
import { User, DashboardStats, InflowPool, ErrandItem, MarketStatus } from '../types';

export type AppTab = 'home' | 'diary' | 'market' | 'dues';

interface AppContextType {
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  loginUserWithGoogle: (credential: string, householdCode?: string) => Promise<User>;
  joinUserHousehold: (householdCode: string) => Promise<User>;
  createGroupHousehold: (customCode?: string) => Promise<User>;
  switchUserMode: (mode: 'PERSONAL' | 'FAMILY') => Promise<User>;
  logoutUser: () => void;
  activeMonth: string;
  setActiveMonth: (month: string) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  stats: DashboardStats | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  
  // Bottom Sheet visibility states
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (open: boolean) => void;
  isAddInflowOpen: boolean;
  setIsAddInflowOpen: (open: boolean) => void;
  editingInflow: InflowPool | null;
  setEditingInflow: (inflow: InflowPool | null) => void;
  isAddErrandOpen: boolean;
  setIsAddErrandOpen: (open: boolean) => void;
  isSettleOpen: boolean;
  setIsSettleOpen: (open: boolean) => void;
  isHouseholdModalOpen: boolean;
  setIsHouseholdModalOpen: (open: boolean) => void;
  isReportExportOpen: boolean;
  setIsReportExportOpen: (open: boolean) => void;
  
  // Errand 1-tap conversion
  quickErrandToExpense: ErrandItem | null;
  setQuickErrandToExpense: (item: ErrandItem | null) => void;

  // Market Beacon toggle
  toggleUserMarketBeacon: () => Promise<void>;
  isCurrentUserAtMarket: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('gharkhata_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [activeMonth, setActiveMonth] = useState<string>('2026-09');
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Bottom Sheet visibility states
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddInflowOpen, setIsAddInflowOpen] = useState(false);
  const [editingInflow, setEditingInflow] = useState<InflowPool | null>(null);
  const [isAddErrandOpen, setIsAddErrandOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isHouseholdModalOpen, setIsHouseholdModalOpen] = useState(false);
  const [isReportExportOpen, setIsReportExportOpen] = useState(false);
  const [quickErrandToExpense, setQuickErrandToExpense] = useState<ErrandItem | null>(null);

  const refreshData = useCallback(async () => {
    if (!currentUser) {
      setUsers([]);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const hCode = currentUser.household_code;
      const fetchedUsers = await fetchUsers(hCode);
      setUsers(fetchedUsers);
      
      const updatedCurrent = fetchedUsers.find(u => u.id === currentUser.id);
      if (updatedCurrent) {
        setCurrentUser(updatedCurrent);
        try {
          localStorage.setItem('gharkhata_current_user', JSON.stringify(updatedCurrent));
        } catch (e) {}
      }

      const fetchedStats = await fetchDashboardStats(activeMonth, hCode);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Error refreshing app data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeMonth, currentUser?.id, currentUser?.household_code]);

  useEffect(() => {
    refreshData();
  }, [activeMonth, currentUser?.id, currentUser?.household_code]);

  // Polling for live market beacon updates
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(async () => {
      try {
        const fetchedStats = await fetchDashboardStats(activeMonth, currentUser.household_code);
        setStats(fetchedStats);
      } catch (e) {
        // Silent poll error handling
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [activeMonth, currentUser?.id, currentUser?.household_code]);

  const isCurrentUserAtMarket = Boolean(
    currentUser &&
    stats?.active_market_beacons.some((b: MarketStatus) => b.user_id === currentUser.id && b.is_active)
  );

  const toggleUserMarketBeacon = async () => {
    if (!currentUser) return;
    try {
      await toggleMarketStatus(currentUser.id, !isCurrentUserAtMarket);
      await refreshData();
    } catch (err) {
      console.error('Error toggling market beacon:', err);
    }
  };

  const loginUserWithGoogle = async (credential: string, householdCode?: string): Promise<User> => {
    const user = await loginWithGoogle(credential, householdCode);
    setCurrentUser(user);
    try {
      localStorage.setItem('gharkhata_current_user', JSON.stringify(user));
    } catch (e) {}
    return user;
  };

  const joinUserHousehold = async (householdCode: string): Promise<User> => {
    if (!currentUser) throw new Error("No logged in user");
    const updatedUser = await joinHousehold(currentUser.id, householdCode);
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('gharkhata_current_user', JSON.stringify(updatedUser));
    } catch (e) {}
    return updatedUser;
  };

  const createGroupHousehold = async (customCode?: string): Promise<User> => {
    if (!currentUser) throw new Error("No logged in user");
    const updatedUser = await createHousehold(currentUser.id, customCode);
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('gharkhata_current_user', JSON.stringify(updatedUser));
    } catch (e) {}
    return updatedUser;
  };

  const switchUserMode = async (mode: 'PERSONAL' | 'FAMILY'): Promise<User> => {
    if (!currentUser) throw new Error("No logged in user");
    const updatedUser = await switchLedgerMode(currentUser.id, mode);
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('gharkhata_current_user', JSON.stringify(updatedUser));
    } catch (e) {}
    return updatedUser;
  };

  const logoutUser = () => {
    googleLogout();
    setCurrentUser(null);
    setUsers([]);
    setStats(null);
    try {
      localStorage.removeItem('gharkhata_current_user');
    } catch (e) {}
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        setCurrentUser,
        loginUserWithGoogle,
        joinUserHousehold,
        createGroupHousehold,
        switchUserMode,
        logoutUser,
        activeMonth,
        setActiveMonth,
        activeTab,
        setActiveTab,
        stats,
        loading,
        refreshData,
        isAddExpenseOpen,
        setIsAddExpenseOpen,
        isAddInflowOpen,
        setIsAddInflowOpen,
        editingInflow,
        setEditingInflow,
        isAddErrandOpen,
        setIsAddErrandOpen,
        isSettleOpen,
        setIsSettleOpen,
        isHouseholdModalOpen,
        setIsHouseholdModalOpen,
        isReportExportOpen,
        setIsReportExportOpen,
        quickErrandToExpense,
        setQuickErrandToExpense,
        toggleUserMarketBeacon,
        isCurrentUserAtMarket
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
