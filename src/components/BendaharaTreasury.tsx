import React, { useState, useMemo, useRef } from 'react';
import { Transaction, Member, PertokoanSale, WartelRecord, Loan } from '../types';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Printer,
  Download,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Filter,
  Calendar,
  Layers,
  ShoppingBag,
  PhoneCall,
  Coins,
  RefreshCw,
  Search,
  BookOpen,
  PieChart as PieIcon,
  BarChart2,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface BendaharaTreasuryProps {
  transactions: Transaction[];
  members: Member[];
  sales: PertokoanSale[];
  wartelRecords: WartelRecord[];
  loans: Loan[];
  onAddTransaction: (tx: Transaction) => void;
}

export default function BendaharaTreasury({
  transactions,
  members,
  sales,
  wartelRecords,
  loans,
  onAddTransaction
}: BendaharaTreasuryProps) {
  // --- FORM STATES ---
  const [txType, setTxType] = useState<'kas_masuk' | 'kas_keluar'>('kas_masuk');
  const [txUnit, setTxUnit] = useState<'umum' | 'simpan_pinjam' | 'pertokoan' | 'wartel'>('umum');
  const [txCategory, setTxCategory] = useState<Transaction['category']>('Lain-lain');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txDescription, setTxDescription] = useState('');
  const [txMethod, setTxMethod] = useState<'cash' | 'deposit' | 'piutang'>('cash');
  const [txRefId, setTxRefId] = useState('');
  const [txSuccessMsg, setTxSuccessMsg] = useState('');
  const [txErrorMsg, setTxErrorMsg] = useState('');

  // --- FILTER STATES ---
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // --- SUB-TAB (Buku Jurnal vs Rekonsiliasi/Audit vs Grafik Analisis) ---
  const [activeTab, setActiveTab] = useState<'jurnal' | 'reconciliation' | 'grafik'>('jurnal');

  // --- CATEGORIES GROUPED BY TYPE FOR EASY FORM USE ---
  const categoriesByType = {
    kas_masuk: [
      'Simpanan Pokok',
      'Simpanan Wajib',
      'Simpanan Sukarela',
      'Angsuran Pinjaman',
      'Penjualan Toko',
      'Penjualan Wartel',
      'Penyertaan Modal',
      'Lain-lain'
    ] as Transaction['category'][],
    kas_keluar: [
      'Penarikan Sukarela',
      'Pencairan Pinjaman',
      'Biaya Operasional',
      'Pembelian Inventaris',
      'Bagi Hasil',
      'Lain-lain'
    ] as Transaction['category'][]
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Handle transaction form submission
  const handleSubmitTx = (e: React.FormEvent) => {
    e.preventDefault();
    setTxSuccessMsg('');
    setTxErrorMsg('');

    if (txAmount <= 0) {
      setTxErrorMsg('Nominal transaksi harus lebih besar dari Rp 0!');
      return;
    }
    if (!txDescription.trim()) {
      setTxErrorMsg('Deskripsi transaksi wajib diisi!');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newTx: Transaction = {
      id: `tx-manual-${Date.now()}`,
      date: nowStr,
      type: txType,
      amount: txAmount,
      unit: txUnit,
      category: txCategory,
      description: txDescription,
      paymentMethod: txMethod,
      referenceId: txRefId.trim() || undefined
    };

    onAddTransaction(newTx);
    setTxSuccessMsg(`Berhasil mencatatkan transaksi kas ${txType === 'kas_masuk' ? 'masuk' : 'keluar'} senilai ${formatIDR(txAmount)}!`);
    
    // Reset form
    setTxAmount(0);
    setTxDescription('');
    setTxRefId('');
  };

  // Automatically update category when type changes
  const handleTypeChange = (type: 'kas_masuk' | 'kas_keluar') => {
    setTxType(type);
    setTxCategory(categoriesByType[type][0]);
  };

  // --- FILTERED TRANSACTIONS ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterUnit !== 'all' && t.unit !== filterUnit) return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      
      if (filterStartDate) {
        const txDateOnly = t.date.split(' ')[0];
        if (txDateOnly < filterStartDate) return false;
      }
      if (filterEndDate) {
        const txDateOnly = t.date.split(' ')[0];
        if (txDateOnly > filterEndDate) return false;
      }

      if (filterSearch.trim()) {
        const searchLower = filterSearch.toLowerCase();
        const descMatch = t.description.toLowerCase().includes(searchLower);
        const catMatch = t.category.toLowerCase().includes(searchLower);
        const idMatch = t.id.toLowerCase().includes(searchLower);
        const refMatch = t.referenceId?.toLowerCase().includes(searchLower) || false;
        if (!descMatch && !catMatch && !idMatch && !refMatch) return false;
      }

      return true;
    }).sort((a, b) => b.date.localeCompare(a.date)); // Newest first
  }, [transactions, filterUnit, filterType, filterCategory, filterStartDate, filterEndDate, filterSearch]);

  // --- EXCEL / CSV DOWNLOAD ENGINE ---
  const handleDownloadCSV = () => {
    const headers = ['ID', 'Tanggal', 'Jenis', 'Unit', 'Kategori', 'Nominal', 'Metode Pembayaran', 'Deskripsi', 'Referensi ID'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.date,
      t.type === 'kas_masuk' ? 'Masuk' : 'Keluar',
      t.unit.toUpperCase(),
      t.category,
      t.amount,
      t.paymentMethod.toUpperCase(),
      t.description.replace(/,/g, ';'),
      t.referenceId || '-'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Buku_Kas_Bendahara_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- PRINT WINDOW TRIGGER ---
  const handlePrintReport = () => {
    window.print();
  };

  // --- MATHEMETICAL METRICS & SUMMARY CARDS ---
  const totalInflow = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (t.type === 'kas_masuk' ? t.amount : 0), 0);
  }, [filteredTransactions]);

  const totalOutflow = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (t.type === 'kas_keluar' ? t.amount : 0), 0);
  }, [filteredTransactions]);

  const netCashFlow = totalInflow - totalOutflow;

  // Live consolidated ledger cash balance (entire history)
  const ledgerCashBalance = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (t.type === 'kas_masuk' ? t.amount : -t.amount), 0);
  }, [transactions]);


  // --- RECONCILIATION & AUDIT ENGINGE ---
  const auditReport = useMemo(() => {
    // 1. Retail Unit POS vs Ledger Penjualan Toko
    const posRetailTotalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const ledgerRetailTotalSales = transactions
      .filter(t => t.unit === 'pertokoan' && t.type === 'kas_masuk' && t.category === 'Penjualan Toko')
      .reduce((sum, t) => sum + t.amount, 0);
    const retailDiscrepancy = posRetailTotalSales - ledgerRetailTotalSales;

    // 2. Wartel Records vs Ledger Penjualan Wartel
    const wartelTotalSales = wartelRecords.reduce((sum, w) => sum + w.sellingPrice, 0);
    const ledgerWartelTotalSales = transactions
      .filter(t => t.unit === 'wartel' && t.type === 'kas_masuk' && t.category === 'Penjualan Wartel')
      .reduce((sum, t) => sum + t.amount, 0);
    const wartelDiscrepancy = wartelTotalSales - ledgerWartelTotalSales;

    // 3. Simpan Pinjam Unit Actual Logged vs Ledger Bookings
    // Sum of savings on all current members
    const memberActualSavingsPokok = members.reduce((sum, m) => sum + m.savings.pokok, 0);
    const memberActualSavingsWajib = members.reduce((sum, m) => sum + m.savings.wajib, 0);
    const memberActualSavingsSukarela = members.reduce((sum, m) => sum + m.savings.sukarela, 0);
    const totalMemberActualSavings = memberActualSavingsPokok + memberActualSavingsWajib + memberActualSavingsSukarela;

    // Sum of historical transaction ledger for savings
    const ledgerSavingsPokok = transactions.filter(t => t.category === 'Simpanan Pokok' && t.type === 'kas_masuk').reduce((sum, t) => sum + t.amount, 0);
    const ledgerSavingsWajib = transactions.filter(t => t.category === 'Simpanan Wajib' && t.type === 'kas_masuk').reduce((sum, t) => sum + t.amount, 0);
    const ledgerSavingsSukarelaIn = transactions.filter(t => t.category === 'Simpanan Sukarela' && t.type === 'kas_masuk').reduce((sum, t) => sum + t.amount, 0);
    const ledgerSavingsSukarelaOut = transactions.filter(t => t.category === 'Penarikan Sukarela' && t.type === 'kas_keluar').reduce((sum, t) => sum + t.amount, 0);
    const totalLedgerSavings = ledgerSavingsPokok + ledgerSavingsWajib + ledgerSavingsSukarelaIn - ledgerSavingsSukarelaOut;
    
    const savingsDiscrepancy = totalMemberActualSavings - totalLedgerSavings;

    // 4. USP Installment payments
    const actualUspInstallmentPaid = loans.reduce((sum, l) => {
      return sum + l.repaymentHistory.reduce((s, r) => s + r.amount, 0);
    }, 0);
    const ledgerUspInstallments = transactions
      .filter(t => t.category === 'Angsuran Pinjaman' && t.type === 'kas_masuk')
      .reduce((sum, t) => sum + t.amount, 0);
    const installmentDiscrepancy = actualUspInstallmentPaid - ledgerUspInstallments;

    // Grand total discrepancy count
    const hasAnyDiscrepancy = retailDiscrepancy !== 0 || wartelDiscrepancy !== 0 || savingsDiscrepancy !== 0 || installmentDiscrepancy !== 0;
    const totalDiscrepancyVal = Math.abs(retailDiscrepancy) + Math.abs(wartelDiscrepancy) + Math.abs(savingsDiscrepancy) + Math.abs(installmentDiscrepancy);

    return {
      retail: {
        unitLabel: 'Unit Pertokoan (POS Retail)',
        sourceLabel: 'Akumulasi Faktur Penjualan (POS)',
        ledgerLabel: 'Akumulasi Jurnal Kas "Penjualan Toko"',
        sourceVal: posRetailTotalSales,
        ledgerVal: ledgerRetailTotalSales,
        discrepancy: retailDiscrepancy,
        isOk: retailDiscrepancy === 0
      },
      wartel: {
        unitLabel: 'Unit Wartel (Telekomunikasi)',
        sourceLabel: 'Akumulasi Log Transaksi Wartel',
        ledgerLabel: 'Akumulasi Jurnal Kas "Penjualan Wartel"',
        sourceVal: wartelTotalSales,
        ledgerVal: ledgerWartelTotalSales,
        discrepancy: wartelDiscrepancy,
        isOk: wartelDiscrepancy === 0
      },
      savings: {
        unitLabel: 'Tabungan & Simpanan Anggota',
        sourceLabel: 'Total Saldo Simpanan Aktual Database',
        ledgerLabel: 'Nett Aliran Kas Masuk-Keluar Simpanan',
        sourceVal: totalMemberActualSavings,
        ledgerVal: totalLedgerSavings,
        discrepancy: savingsDiscrepancy,
        isOk: savingsDiscrepancy === 0
      },
      installments: {
        unitLabel: 'Angsuran Pinjaman USP',
        sourceLabel: 'Total Angsuran Masuk Kontrak Kredit',
        ledgerLabel: 'Akumulasi Jurnal Kas "Angsuran Pinjaman"',
        sourceVal: actualUspInstallmentPaid,
        ledgerVal: ledgerUspInstallments,
        discrepancy: installmentDiscrepancy,
        isOk: installmentDiscrepancy === 0
      },
      hasAnyDiscrepancy,
      totalDiscrepancyVal
    };
  }, [sales, transactions, wartelRecords, members, loans]);

  // --- CHART DATA GENERATION ---
  // 1. Group daily cashflow
  const dailyChartData = useMemo(() => {
    const datesMap: Record<string, { date: string; masuk: number; keluar: number }> = {};
    
    // Sort transactions chronologically for correct time progression in the chart
    const sortedChrono = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    sortedChrono.forEach(t => {
      const dateStr = t.date.split(' ')[0];
      if (!datesMap[dateStr]) {
        datesMap[dateStr] = { date: dateStr, masuk: 0, keluar: 0 };
      }
      if (t.type === 'kas_masuk') {
        datesMap[dateStr].masuk += t.amount;
      } else {
        datesMap[dateStr].keluar += t.amount;
      }
    });

    return Object.values(datesMap);
  }, [transactions]);

  // 2. Outflows grouped by category for Expense Breakdown
  const expensePieData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.filter(t => t.type === 'kas_keluar').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.keys(categories).map(k => ({ name: k, value: categories[k] }));
  }, [transactions]);

  // 3. Inflows grouped by category for Income Breakdown
  const incomePieData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.filter(t => t.type === 'kas_masuk').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.keys(categories).map(k => ({ name: k, value: categories[k] }));
  }, [transactions]);

  const PIE_COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#ef4444'];

  return (
    <div className="space-y-6">
      
      {/* --- HEADER BANNER --- */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-850 rounded-2xl p-6 text-white shadow-md relative overflow-hidden print:hidden" id="bendahara-banner">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen size={200} />
        </div>
        <div className="space-y-1.5 max-w-xl">
          <span className="text-[10px] bg-blue-500/30 border border-blue-400/20 text-blue-200 font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider inline-block">
            Sistem Kasir Utama & Jurnal Umum
          </span>
          <h2 className="text-xl font-black tracking-tight">Portal Pembukuan Kas & Audit Bendahara</h2>
          <p className="text-xs text-blue-100/80 font-medium">
            Kelola transaksi kas keluar masuk koperasi secara langsung, periksa sinkronisasi data antar unit pertokoan, wartel, dan simpan pinjam, serta cetak laporan audit keuangan resmi.
          </p>
        </div>
      </div>

      {/* --- BENTO STATS SUMMARY --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden" id="bendahara-summary-cards">
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Saldo Kas Utama</span>
            <span className="font-mono font-black text-lg text-slate-900 block">{formatIDR(ledgerCashBalance)}</span>
            <span className="text-[10px] text-emerald-600 font-bold block">● Sinkron Terhadap Ledger</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Wallet size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Total Kas Masuk (Periode)</span>
            <span className="font-mono font-black text-lg text-emerald-600 block">+{formatIDR(totalInflow)}</span>
            <span className="text-[10px] text-slate-400 font-medium block">Dari data buku kas tersaring</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Total Kas Keluar (Periode)</span>
            <span className="font-mono font-black text-lg text-rose-600 block">-{formatIDR(totalOutflow)}</span>
            <span className="text-[10px] text-slate-400 font-medium block">Dari data pengeluaran tersaring</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Arus Kas Bersih (Periode)</span>
            <span className={`font-mono font-black text-lg block ${netCashFlow >= 0 ? 'text-blue-700' : 'text-amber-600'}`}>
              {netCashFlow >= 0 ? '+' : ''}{formatIDR(netCashFlow)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">Nett pemasukan - pengeluaran</span>
          </div>
          <div className={`p-3 rounded-xl ${netCashFlow >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>

      {/* --- LIVE DISCREPANCY AUDIT BANNER ALERT --- */}
      {auditReport.hasAnyDiscrepancy ? (
        <div className="bg-rose-50 border border-rose-250 p-4 rounded-xl flex items-start gap-3 text-xs text-rose-800 print:hidden shadow-3xs animate-pulse">
          <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h4 className="font-black">PERINGATAN AUDIT: TERDAPAT SELISIH PEMBUKUAN UNIT!</h4>
            <p className="text-rose-700/95 font-medium leading-relaxed">
              Terdapat ketidaksesuaian sebesar <strong>{formatIDR(auditReport.totalDiscrepancyVal)}</strong> antara akumulasi log transaksi operasional di masing-masing unit dengan pencatatan pembukuan kas besar di bawah otoritas Bendahara. Silakan periksa tab <strong>"Rekonsiliasi & Audit Sinkronisasi"</strong> untuk menganalisis letak selisih pembukuan.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl flex items-start gap-3 text-xs text-emerald-800 print:hidden shadow-3xs">
          <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h4 className="font-black">STATUS AUDIT: SELURUH PEMBUKUAN SINKRON (SESUAI)</h4>
            <p className="text-emerald-700/95 font-medium leading-relaxed">
              Selamat! Seluruh data transaksi di unit operasional (Simpan Pinjam, Pertokoan, Wartel) telah tercatat dan tersinkronisasi sempurna 100% tanpa adanya selisih pembukuan di buku besar kas Koperasi.
            </p>
          </div>
        </div>
      )}

      {/* --- TAB CONTROL & TRANSACTION FORM GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
        
        {/* LEFT COLUMN: PENCATATAN TRANSAKSI BARU FORM (SPAN 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <PlusCircle className="text-blue-600 animate-bounce" size={18} />
              <h3 className="font-black text-slate-900 text-sm">Pencatatan Kas Keluar Masuk</h3>
            </div>

            {txSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-[11px] font-bold">
                {txSuccessMsg}
              </div>
            )}

            {txErrorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-[11px] font-bold">
                {txErrorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitTx} className="space-y-3.5 text-xs">
              
              {/* Type Switcher */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Jenis Aliran Kas</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-150 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('kas_masuk')}
                    className={`py-1.5 px-3 text-center rounded-md font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      txType === 'kas_masuk'
                        ? 'bg-emerald-600 text-white shadow-3xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ArrowDownLeft size={14} />
                    Kas Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('kas_keluar')}
                    className={`py-1.5 px-3 text-center rounded-md font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      txType === 'kas_keluar'
                        ? 'bg-rose-600 text-white shadow-3xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ArrowUpRight size={14} />
                    Kas Keluar
                  </button>
                </div>
              </div>

              {/* Unit Switcher */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Unit Transaksi Terkait</label>
                <select
                  value={txUnit}
                  onChange={(e) => setTxUnit(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="umum">Kas Umum Koperasi</option>
                  <option value="simpan_pinjam">Unit Simpan Pinjam (USP)</option>
                  <option value="pertokoan">Unit Pertokoan (POS Retail)</option>
                  <option value="wartel">Unit Wartel (Telekomunikasi)</option>
                </select>
              </div>

              {/* Category Dropdown (Contextual based on Type) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Kategori Akun Akuntansi</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {categoriesByType[txType].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Nominal Amount */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Nominal (Rupiah)</label>
                <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-2 items-center gap-2">
                  <span className="font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={txAmount === 0 ? '' : txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    placeholder="Contoh: 150000"
                    className="bg-transparent border-none w-full text-xs font-mono font-bold text-slate-800 focus:outline-none"
                    min="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Keterangan Transaksi</label>
                <textarea
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder="Ketik keterangan jurnal disini..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px]"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Metode Pembayaran</label>
                <select
                  value={txMethod}
                  onChange={(e) => setTxMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="cash">Tunai / Cash</option>
                  <option value="deposit">Deposit Potong Tabungan Sukarela</option>
                  <option value="piutang">Piutang / Kas Bon</option>
                </select>
              </div>

              {/* Reference ID (Optional) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">No. ID Anggota / Referensi (Opsional)</label>
                <input
                  type="text"
                  value={txRefId}
                  onChange={(e) => setTxRefId(e.target.value)}
                  placeholder="KOP-001 / l1 / INV-0012"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-3xs text-xs"
              >
                <PlusCircle size={15} />
                Simpan Transaksi Kas
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: TABS PANEL (Buku Jurnal, Grafik Analisis, Rekonsiliasi Audit) (SPAN 8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            
            {/* Tab Controls Bar */}
            <div className="bg-slate-50 border-b border-slate-150 p-2.5 flex flex-wrap justify-between items-center gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('jurnal')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'jurnal'
                      ? 'bg-white text-blue-700 border border-slate-200 shadow-3xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <BookOpen size={14} />
                  Buku Jurnal Kas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reconciliation')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'reconciliation'
                      ? 'bg-white text-blue-700 border border-slate-200 shadow-3xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <RefreshCw size={14} className={auditReport.hasAnyDiscrepancy ? 'text-rose-500 animate-spin' : ''} />
                  Rekonsiliasi & Audit Unit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('grafik')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'grafik'
                      ? 'bg-white text-blue-700 border border-slate-200 shadow-3xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <BarChart2 size={14} />
                  Grafik Analisis Kas
                </button>
              </div>

              {activeTab === 'jurnal' && (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrintReport}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-3xs cursor-pointer text-slate-700"
                  >
                    <Printer size={13} />
                    Cetak
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCSV}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-3xs cursor-pointer text-slate-700"
                  >
                    <Download size={13} />
                    Unduh CSV
                  </button>
                </div>
              )}
            </div>

            {/* TAB CONTENT: BUKU JURNAL KAS */}
            {activeTab === 'jurnal' && (
              <div className="p-5 space-y-4">
                
                {/* Advanced Search & Filter Controls */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs space-y-3.5">
                  <div className="flex items-center gap-1.5 border-b border-slate-200/50 pb-2">
                    <Filter className="text-blue-600" size={14} />
                    <span className="font-black text-slate-800">Filter Pencarian Jurnal</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    
                    {/* Search query */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Pencarian Kata Kunci</label>
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg">
                        <Search size={13} className="text-slate-400" />
                        <input
                          type="text"
                          value={filterSearch}
                          onChange={(e) => setFilterSearch(e.target.value)}
                          placeholder="Cari deskripsi, KOP ID, dll..."
                          className="bg-transparent border-none w-full text-[11px] focus:outline-none text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Filter Unit */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Berdasarkan Unit</label>
                      <select
                        value={filterUnit}
                        onChange={(e) => setFilterUnit(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1.5 rounded-lg text-[11px] font-semibold focus:outline-none"
                      >
                        <option value="all">Semua Unit Koperasi</option>
                        <option value="umum">Kas Umum Koperasi</option>
                        <option value="simpan_pinjam">Unit Simpan Pinjam</option>
                        <option value="pertokoan">Unit Pertokoan</option>
                        <option value="wartel">Unit Wartel</option>
                      </select>
                    </div>

                    {/* Filter Type */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Jenis Aliran</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1.5 rounded-lg text-[11px] font-semibold focus:outline-none"
                      >
                        <option value="all">Masuk & Keluar</option>
                        <option value="kas_masuk">Kas Masuk saja</option>
                        <option value="kas_keluar">Kas Keluar saja</option>
                      </select>
                    </div>

                    {/* Filter Category */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Kategori Akuntansi</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1.5 rounded-lg text-[11px] font-semibold focus:outline-none"
                      >
                        <option value="all">Semua Kategori</option>
                        <option value="Simpanan Pokok">Simpanan Pokok</option>
                        <option value="Simpanan Wajib">Simpanan Wajib</option>
                        <option value="Simpanan Sukarela">Simpanan Sukarela</option>
                        <option value="Penarikan Sukarela">Penarikan Sukarela</option>
                        <option value="Pencairan Pinjaman">Pencairan Pinjaman</option>
                        <option value="Angsuran Pinjaman">Angsuran Pinjaman</option>
                        <option value="Penyertaan Modal">Penyertaan Modal</option>
                        <option value="Penjualan Toko">Penjualan Toko</option>
                        <option value="Penjualan Wartel">Penjualan Wartel</option>
                        <option value="Biaya Operasional">Biaya Operasional</option>
                        <option value="Pembelian Inventaris">Pembelian Inventaris</option>
                        <option value="Bagi Hasil">Bagi Hasil</option>
                        <option value="Lain-lain">Lain-lain</option>
                      </select>
                    </div>

                  </div>

                  {/* Date range filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 flex items-center gap-1">
                        <Calendar size={12} />
                        Mulai Tanggal
                      </label>
                      <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1.5 rounded-lg text-[11px] font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 flex items-center gap-1">
                        <Calendar size={12} />
                        Sampai Tanggal
                      </label>
                      <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1.5 rounded-lg text-[11px] font-semibold focus:outline-none"
                      />
                    </div>

                    {/* Reset Button */}
                    <div className="flex items-end col-span-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFilterUnit('all');
                          setFilterType('all');
                          setFilterCategory('all');
                          setFilterSearch('');
                          setFilterStartDate('');
                          setFilterEndDate('');
                        }}
                        className="px-4 py-1.8 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded-lg cursor-pointer transition-colors"
                      >
                        Atur Ulang Filter
                      </button>
                    </div>
                  </div>

                </div>

                {/* Ledger Transactions Table */}
                <div className="overflow-x-auto border border-slate-150 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">ID Transaksi</th>
                        <th className="p-3">Unit / Kategori</th>
                        <th className="p-3">Deskripsi / Ref</th>
                        <th className="p-3 text-right">Debit (Kas Masuk)</th>
                        <th className="p-3 text-right">Kredit (Kas Keluar)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                            Tidak ditemukan data transaksi buku kas yang sesuai dengan kriteria filter.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((t) => {
                          const unitBadges = {
                            umum: 'bg-slate-100 text-slate-700 border-slate-200',
                            simpan_pinjam: 'bg-indigo-50 text-indigo-700 border-indigo-150',
                            pertokoan: 'bg-blue-50 text-blue-700 border-blue-150',
                            wartel: 'bg-emerald-50 text-emerald-700 border-emerald-150'
                          };

                          return (
                            <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                              <td className="p-3 font-mono text-[10px] whitespace-nowrap text-slate-500">
                                {t.date}
                              </td>
                              <td className="p-3 font-mono text-[10px] text-slate-400 font-bold">
                                {t.id}
                              </td>
                              <td className="p-3 space-y-0.5">
                                <span className={`px-1.5 py-0.5 border rounded text-[8px] font-black uppercase tracking-wider block w-fit ${unitBadges[t.unit] || 'bg-slate-100 text-slate-700'}`}>
                                  {t.unit.replace('_', ' ')}
                                </span>
                                <span className="font-extrabold text-slate-800 text-[11px] block">
                                  {t.category}
                                </span>
                              </td>
                              <td className="p-3 max-w-xs">
                                <p className="font-semibold text-slate-700 text-[11px] leading-snug">{t.description}</p>
                                {t.referenceId && (
                                  <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded border border-slate-200 mt-0.5 inline-block">
                                    Ref ID: {t.referenceId}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-emerald-600 text-[11px]">
                                {t.type === 'kas_masuk' ? formatIDR(t.amount) : '-'}
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-rose-600 text-[11px]">
                                {t.type === 'kas_keluar' ? formatIDR(t.amount) : '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* TAB CONTENT: REKONSILIASI & AUDIT SINKRONISASI */}
            {activeTab === 'reconciliation' && (
              <div className="p-5 space-y-6">
                
                <div className="space-y-1 bg-blue-50 border border-blue-150 p-4 rounded-xl text-xs text-blue-800">
                  <h4 className="font-black flex items-center gap-1.5">
                    <RefreshCw size={15} />
                    Fungsi Rekonsiliasi Otomatis (Audit Internal)
                  </h4>
                  <p className="text-blue-700/95 font-semibold leading-relaxed">
                    Sistem membandingkan log transaksi harian asli dari masing-masing unit usaha dengan pembukuan kas besar (ledger) di bawah otoritas Bendahara. Jika terdapat ketidaksesuaian (Selisih), berarti ada transaksi kas yang diproses operator namun belum dicatatkan di kas besar (atau terdapat kesalahan penginputan nominal).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(auditReport).filter(([key]) => ['retail', 'wartel', 'savings', 'installments'].includes(key)).map(([key, item]: any) => {
                    const icons = {
                      retail: <ShoppingBag size={18} className="text-blue-600" />,
                      wartel: <PhoneCall size={18} className="text-emerald-600" />,
                      savings: <Coins size={18} className="text-indigo-600" />,
                      installments: <Wallet size={18} className="text-blue-700" />
                    };

                    return (
                      <div key={key} className={`border rounded-xl p-4 space-y-3.5 shadow-3xs transition-all ${item.isOk ? 'bg-emerald-50/20 border-emerald-150' : 'bg-rose-50/20 border-rose-150'}`}>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            {icons[key as keyof typeof icons]}
                            <h4 className="font-black text-slate-850 text-xs">{item.unitLabel}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${item.isOk ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'}`}>
                            {item.isOk ? 'SINKRON' : 'SELISIH'}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center text-slate-500 font-medium">
                            <span>{item.sourceLabel}</span>
                            <span className="font-mono font-bold text-slate-800">{formatIDR(item.sourceVal)}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-500 font-medium">
                            <span>{item.ledgerLabel}</span>
                            <span className="font-mono font-bold text-slate-800">{formatIDR(item.ledgerVal)}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2 text-slate-800 font-bold">
                            <span>Nominal Selisih</span>
                            <span className={`font-mono font-black ${item.isOk ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {item.discrepancy > 0 ? '+' : ''}{formatIDR(item.discrepancy)}
                            </span>
                          </div>
                        </div>

                        {!item.isOk && (
                          <p className="text-[10px] text-rose-500 font-bold leading-normal bg-white p-2 rounded-lg border border-rose-100">
                            * Operator disarankan memposting setoran dari {item.unitLabel} senilai {formatIDR(Math.abs(item.discrepancy))} untuk menyeimbangkan buku besar kas.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Audit Instructions Accordion / Card */}
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 text-xs space-y-3.5">
                  <h4 className="font-black text-slate-850 flex items-center gap-1.5">
                    <AlertCircle size={16} className="text-blue-600" />
                    Panduan Audit & Tindakan Penyelarasan Kas
                  </h4>
                  <ul className="list-decimal list-inside space-y-2 text-slate-600 font-medium leading-relaxed pl-1">
                    <li>
                      Selisih di <strong>Unit Pertokoan</strong> muncul ketika operator kasir retail mencetak nota belanja, namun Bendahara belum membukukan uang setoran kas dari hasil penjualan toko tersebut ke Kas Besar.
                    </li>
                    <li>
                      Selisih di <strong>Unit Wartel</strong> terjadi apabila log penjualan pulsa/telepon tercatat di kasir wartel, namun uang fisiknya belum disetorkan ke brankas utama koperasi.
                    </li>
                    <li>
                      Selisih di <strong>Unit Simpan Pinjam (Angsuran/Simpanan)</strong> mengindikasikan adanya anggota yang menyetor tabungan atau membayar angsuran cicilan kredit namun Bendahara belum mengesahkan tanda terima setoran di buku jurnal kas.
                    </li>
                  </ul>
                </div>

              </div>
            )}

            {/* TAB CONTENT: GRAFIK ANALISIS KAS LENGKAP */}
            {activeTab === 'grafik' && (
              <div className="p-5 space-y-6">
                
                {/* Trend Daily Cash flow */}
                <div className="space-y-2">
                  <h4 className="font-black text-slate-850 text-xs">Tren Arus Kas Harian Koperasi (Inflow vs Outflow)</h4>
                  <div className="h-64 bg-slate-50 border border-slate-150 rounded-xl p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyChartData}>
                        <defs>
                          <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Area type="monotone" name="Kas Masuk" dataKey="masuk" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMasuk)" />
                        <Area type="monotone" name="Kas Keluar" dataKey="keluar" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorKeluar)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sub Pie Charts Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Income pie */}
                  <div className="space-y-2">
                    <h5 className="font-black text-slate-850 text-xs text-center">Komposisi Kas Masuk (Pemasukan)</h5>
                    <div className="h-56 bg-slate-50 border border-slate-150 rounded-xl p-4 flex items-center justify-center">
                      {incomePieData.length === 0 ? (
                        <p className="text-xs text-slate-400 font-bold">Tidak ada data pemasukan</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={incomePieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {incomePieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatIDR(Number(value))} />
                            <Legend wrapperStyle={{ fontSize: 9 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Expense pie */}
                  <div className="space-y-2">
                    <h5 className="font-black text-slate-850 text-xs text-center">Komposisi Kas Keluar (Pengeluaran)</h5>
                    <div className="h-56 bg-slate-50 border border-slate-150 rounded-xl p-4 flex items-center justify-center">
                      {expensePieData.length === 0 ? (
                        <p className="text-xs text-slate-400 font-bold">Tidak ada data pengeluaran</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={expensePieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {expensePieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatIDR(Number(value))} />
                            <Legend wrapperStyle={{ fontSize: 9 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        </div>

      </div>

      {/* --- PRINTABLE VIEW ONLY SHOWN ON PRINT SHEET --- */}
      <div className="hidden print:block space-y-6 bg-white text-slate-900 p-8 text-xs">
        <div className="text-center space-y-2 border-b-2 border-slate-900 pb-4">
          <h2 className="text-lg font-black uppercase tracking-wide">LAPORAN BUKU KAS DAN AUDIT HARIAN KOPERASI</h2>
          <p className="font-mono text-[10px]">Dicetak Tanggal: {new Date().toLocaleString('id-ID')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold block">Status Audit Konsolidasi:</span>
            <span className="text-sm font-black text-indigo-700">
              {auditReport.hasAnyDiscrepancy ? 'TERDAPAT SELISIH PEMBUKUAN' : 'SINKRON (SESUAI 100%)'}
            </span>
          </div>
          <div className="text-right">
            <span className="font-bold block">Saldo Kas Akhir:</span>
            <span className="text-sm font-black font-mono">{formatIDR(ledgerCashBalance)}</span>
          </div>
        </div>

        {/* Audit summary table */}
        <div className="space-y-3">
          <h3 className="font-bold border-b border-slate-350 pb-1">HASIL PERBANDINGAN NILAI UNIT VS LEDGER</h3>
          <table className="w-full text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-[10px] font-bold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300">Unit Usaha</th>
                <th className="p-2 text-right border-r border-slate-300">Nilai Transaksi Unit (POS/Log)</th>
                <th className="p-2 text-right border-r border-slate-300">Nilai Tercatat Buku Kas</th>
                <th className="p-2 text-right">Selisih Pembukuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {Object.entries(auditReport).filter(([key]) => ['retail', 'wartel', 'savings', 'installments'].includes(key)).map(([key, item]: any) => (
                <tr key={key}>
                  <td className="p-2 border-r border-slate-300 font-bold">{item.unitLabel}</td>
                  <td className="p-2 text-right border-r border-slate-300 font-mono">{formatIDR(item.sourceVal)}</td>
                  <td className="p-2 text-right border-r border-slate-300 font-mono">{formatIDR(item.ledgerVal)}</td>
                  <td className="p-2 text-right font-mono font-black">{formatIDR(item.discrepancy)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Printable journal list of filtered ones */}
        <div className="space-y-3">
          <h3 className="font-bold border-b border-slate-350 pb-1">DAFTAR TRANSAKSI JURNAL TERKAIT</h3>
          <table className="w-full text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-[10px] font-bold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300">Tanggal</th>
                <th className="p-2 border-r border-slate-300">Unit</th>
                <th className="p-2 border-r border-slate-300">Kategori / Akun</th>
                <th className="p-2 border-r border-slate-300">Keterangan</th>
                <th className="p-2 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td className="p-2 border-r border-slate-300 font-mono text-[9px]">{t.date}</td>
                  <td className="p-2 border-r border-slate-300 uppercase text-[9px]">{t.unit}</td>
                  <td className="p-2 border-r border-slate-300 font-bold">{t.category}</td>
                  <td className="p-2 border-r border-slate-300">{t.description}</td>
                  <td className="p-2 text-right font-mono font-bold">
                    {t.type === 'kas_masuk' ? '+' : '-'}{formatIDR(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-12 grid grid-cols-2 text-center">
          <div>
            <p className="pb-16 font-bold">Diverifikasi Oleh,</p>
            <p className="font-bold underline">Hendra Wijaya</p>
            <p className="text-[10px] text-slate-500">Bendahara Koperasi</p>
          </div>
          <div>
            <p className="pb-16 font-bold">Mengetahui,</p>
            <p className="font-bold underline">Danang Andriyanto</p>
            <p className="text-[10px] text-slate-500">Ketua Koperasi</p>
          </div>
        </div>
      </div>

    </div>
  );
}
