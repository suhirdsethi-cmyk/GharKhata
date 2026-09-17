import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchExpenses, deleteExpense } from '../../api/client';
import { Expense } from '../../types';
import { ReceiptViewModal } from '../Modals/ReceiptViewModal';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  PlusCircle, 
  Trash2, 
  ImageIcon,
  ShoppingBag,
  Zap,
  Wrench,
  Pill,
  HelpCircle,
  Share2,
  Calendar,
  ChevronLeft
} from 'lucide-react';
import { formatDateHuman, getPreviousMonthStr, formatMonthHuman } from '../../utils/dateUtils';

export const ExpenseDiaryView: React.FC = () => {
  const { activeMonth, setActiveMonth, currentUser, setIsAddExpenseOpen, refreshData, setIsReportExportOpen } = useApp();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [fundingFilter, setFundingFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Receipt View Modal
  const [viewingReceipt, setViewingReceipt] = useState<{ url: string; title: string } | null>(null);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await fetchExpenses({
        month_year: activeMonth,
        category: categoryFilter,
        funding_source: fundingFilter,
        search: searchQuery,
        household_code: currentUser?.household_code
      });
      setExpenses(data);
    } catch (err) {
      console.error('Failed loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [activeMonth, categoryFilter, fundingFilter, searchQuery, currentUser?.household_code]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this expense log?')) return;
    try {
      await deleteExpense(id);
      await loadExpenses();
      await refreshData();
    } catch (err) {
      console.error('Failed deleting expense:', err);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Description', 'Category', 'Amount (INR)', 'Paid By', 'Funding Source', 'Notes'];
    const rows = expenses.map(e => [
      e.id,
      e.date,
      `"${e.title.replace(/"/g, '""')}"`,
      e.category,
      e.amount,
      `"${e.payer?.name || e.payer_id}"`,
      e.funding_source,
      `"${(e.receipt_note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Expense_Diary_${activeMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'groceries':
        return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case 'utilities':
        return <Zap className="w-5 h-5 text-amber-600" />;
      case 'maintenance':
      case 'hardware/repairs':
        return <Wrench className="w-5 h-5 text-sky-600" />;
      case 'chemist/pharmacy':
        return <Pill className="w-5 h-5 text-rose-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-indigo-600" />;
    }
  };

  const categories = ['ALL', 'Groceries', 'Utilities', 'Maintenance', 'Chemist/Pharmacy', 'Hardware/Repairs', 'Miscellaneous'];
  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      
      {/* Header & Controls Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Expense Diary</h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsReportExportOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
              title="Share report on WhatsApp or save as PDF"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp / PDF</span>
            </button>
            <button
              onClick={exportToCSV}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Month Switcher Bar */}
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Showing: <strong className="text-indigo-700 font-extrabold">{formatMonthHuman(activeMonth, true)}</strong></span>
          </div>

          <button
            onClick={() => setActiveMonth(getPreviousMonthStr(activeMonth))}
            className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-indigo-700 font-bold rounded-xl flex items-center gap-1 shadow-2xs transition-all text-[11px]"
            title={`Switch to ${formatMonthHuman(getPreviousMonthStr(activeMonth))} expenses`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Check Last Month ({formatMonthHuman(getPreviousMonthStr(activeMonth))})</span>
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search items, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Chips Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-100 font-semibold text-slate-500">
          <span>{expenses.length} Logged Entries</span>
          <span className="text-slate-900 font-black text-sm">Total: ₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Spacious Card-Based Expense List (Replacing Tables) */}
      <div className="space-y-2.5 printable-area">
        {expenses.length > 0 ? (
          expenses.map((exp) => (
            <div 
              key={exp.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-3 light-card-hover"
            >
              {/* Left Side: Category Icon Avatar + Title + Date */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {getCategoryIcon(exp.category)}
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {exp.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100/60">
                      {formatDateHuman(exp.date)}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-600">{exp.category}</span>
                  </div>
                  {exp.receipt_note && (
                    <p className="text-[11px] text-slate-400 italic truncate max-w-[180px] mt-0.5">
                      "{exp.receipt_note}"
                    </p>
                  )}
                </div>
              </div>

              {/* Right Side: Amount + Badge */}
              <div className="flex flex-col items-end shrink-0 gap-1">
                <div className="text-base font-extrabold text-slate-900">
                  ₹{exp.amount.toLocaleString('en-IN')}
                </div>

                {exp.funding_source === 'RENTAL_POOL' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Rental Pool
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Paid by {exp.payer?.name?.split(' ')[0] || 'Member'}
                  </span>
                )}

                <div className="flex items-center gap-1.5 mt-1 no-print">
                  {exp.image_url && (
                    <button
                      onClick={() => setViewingReceipt({ url: exp.image_url!, title: exp.title })}
                      className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Receipt</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400 text-xs">
            {loading ? 'Loading expenses...' : 'No expense entries found for selected filters.'}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <ReceiptViewModal
        imageUrl={viewingReceipt?.url || null}
        title={viewingReceipt?.title || ''}
        onClose={() => setViewingReceipt(null)}
      />

    </div>
  );
};
