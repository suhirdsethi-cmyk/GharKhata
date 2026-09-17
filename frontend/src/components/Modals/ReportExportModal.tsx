import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Share2, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  Landmark, 
  Scale, 
  CheckCircle2 
} from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ isOpen, onClose }) => {
  const { stats, activeMonth, currentUser } = useApp();
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen || !stats) return null;

  const inflow = stats.total_monthly_inflow || 0;
  const spentPool = stats.spent_from_pool || 0;
  const remaining = stats.remaining_rental_balance || 0;
  const personalTotal = stats.total_personal_expenses || 0;
  const categories = stats.category_breakdown || {};

  // Formatted WhatsApp Summary Text
  const generateWhatsAppMessage = () => {
    let msg = `🏡 *GHARKHATA MONTHLY STATEMENT (${activeMonth})*\n`;
    msg += `Household Code: *${currentUser?.household_code || 'GHAR-MAIN'}*\n`;
    msg += `----------------------------------------\n`;
    msg += `💰 *Rental Reserve Inflow:* ₹${inflow.toLocaleString('en-IN')}\n`;
    msg += `📉 *Spent from Pool:* ₹${spentPool.toLocaleString('en-IN')}\n`;
    msg += `✅ *Remaining Reserve:* ₹${remaining.toLocaleString('en-IN')}\n\n`;

    msg += `📊 *Category Spending:* \n`;
    const sortedCats = (Object.entries(categories) as [string, number][]).sort(([, a], [, b]) => b - a);
    if (sortedCats.length === 0) {
      msg += `• No logged category expenses\n`;
    } else {
      sortedCats.forEach(([cat, amount]) => {
        msg += `• ${cat}: ₹${amount.toLocaleString('en-IN')}\n`;
      });
    }

    msg += `\n⚖️ *Out-of-Pocket Dues:* ₹${personalTotal.toLocaleString('en-IN')}\n`;
    if (stats.net_dues_list && stats.net_dues_list.length > 0) {
      msg += `*Net Balances:*\n`;
      stats.net_dues_list.forEach(item => {
        msg += `• ${item.from_user_name.split(' ')[0]} owes ${item.to_user_name.split(' ')[0]}: ₹${item.amount.toLocaleString('en-IN')}\n`;
      });
    } else {
      msg += `• All member dues are fully settled! 🎉\n`;
    }

    msg += `----------------------------------------\n`;
    msg += `_Generated via GharKhata App_`;

    return msg;
  };

  const whatsappText = generateWhatsAppMessage();

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print animate-in fade-in duration-200">
      
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4 border border-slate-100 z-10 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900">Export & Share Report</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. WHATSAPP FAMILY GROUP SHARE CARD */}
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Share Statement on WhatsApp</span>
            </span>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              {activeMonth}
            </span>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 text-[11px] font-mono text-slate-700 whitespace-pre-line max-h-36 overflow-y-auto">
            {whatsappText}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send WhatsApp</span>
            </button>
            <button
              onClick={handleCopyWhatsApp}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {/* 2. PRINTABLE PDF REPORT CARD */}
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>Printable PDF Ledger Statement</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            Generates a clean, formatted monthly financial statement ready to save as PDF or print.
          </p>

          <button
            onClick={handlePrintPDF}
            className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
