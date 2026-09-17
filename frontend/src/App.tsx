import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { FloatingActionButton } from './components/FloatingActionButton';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ExpenseDiaryView } from './components/ExpenseDiary/ExpenseDiaryView';
import { ErrandTrackerView } from './components/ErrandTracker/ErrandTrackerView';
import { DuesLedgerView } from './components/DuesLedger/DuesLedgerView';
import { LoginScreen } from './components/Auth/LoginScreen';

import { AddExpenseModal } from './components/Modals/AddExpenseModal';
import { AddInflowModal } from './components/Modals/AddInflowModal';
import { AddErrandModal } from './components/Modals/AddErrandModal';
import { SettleModal } from './components/Modals/SettleModal';
import { QuickExpenseFromErrandModal } from './components/Modals/QuickExpenseFromErrandModal';
import { HouseholdModal } from './components/Modals/HouseholdModal';
import { ReportExportModal } from './components/Modals/ReportExportModal';

const AppContent: React.FC = () => {
  const { currentUser, activeTab, isReportExportOpen, setIsReportExportOpen } = useApp();

  // Mandatory Authentication Guard
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="px-4 py-4 max-w-xl mx-auto pb-24">
        {activeTab === 'home' && <DashboardView />}
        {activeTab === 'diary' && <ExpenseDiaryView />}
        {activeTab === 'market' && <ErrandTrackerView />}
        {activeTab === 'dues' && <DuesLedgerView />}
      </main>
      <FloatingActionButton />
      <BottomNav />

      {/* Global Slide-Up Bottom Sheet Drawers */}
      <AddExpenseModal />
      <AddInflowModal />
      <AddErrandModal />
      <SettleModal />
      <QuickExpenseFromErrandModal />
      <HouseholdModal />
      <ReportExportModal isOpen={isReportExportOpen} onClose={() => setIsReportExportOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
