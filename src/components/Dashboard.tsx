import React, { useState } from 'react';
import { Member, Transaction, Loan, PertokoanSale, WartelRecord, UserAccount } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  PhoneCall, 
  ShoppingBag, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Coins,
  History,
  Activity,
  Award,
  CheckCircle2,
  Clock,
  Settings,
  UserPlus
} from 'lucide-react';

interface DashboardProps {
  members: Member[];
  transactions: Transaction[];
  loans: Loan[];
  sales: PertokoanSale[];
  wartelRecords: WartelRecord[];
  cooperativeName: string;
  onUpdateCooperativeName: (name: string) => void;
  accounts: UserAccount[];
  onRegisterAccount: (acc: UserAccount) => void;
  currentUser: UserAccount;
  onNavigate: (tab: string, subTab?: string) => void;
}

export default function Dashboard({
  members,
  transactions,
  loans,
  sales,
  wartelRecords,
  cooperativeName,
  onUpdateCooperativeName,
  accounts,
  onRegisterAccount,
  currentUser,
  onNavigate
}: DashboardProps) {
  const [activeChartTab, setActiveChartTab] = useState<'performa' | 'tren'>('performa');
  const [hoveredData, setHoveredData] = useState<{ label: string; value: number; x: number; y: number } | null>(null);

  // --- Cooperative Settings states ---
  const [editingCoopName, setEditingCoopName] = useState(cooperativeName);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState<string>('operator_sp');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  // --- Financial Calculations ---
  // 1. Cash Balance
  const totalInflow = transactions
    .filter(t => t.type === 'kas_masuk')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = transactions
    .filter(t => t.type === 'kas_keluar')
    .reduce((sum, t) => sum + t.amount, 0);
  const cashBalance = totalInflow - totalOutflow;

  // 2. Member Savings
  const totalSavings = members.reduce((sum, m) => {
    return sum + m.savings.pokok + m.savings.wajib + m.savings.sukarela;
  }, 0);

  // 3. Outstanding Loans (remaining balance on active loans)
  const outstandingLoans = loans
    .filter(l => l.status === 'aktif')
    .reduce((sum, l) => sum + l.remainingBalance, 0);

  // 4. Operational & Units Profit
  // Wartel Profit
  const wartelProfit = wartelRecords.reduce((sum, r) => sum + r.profit, 0);
  const wartelRevenue = wartelRecords.reduce((sum, r) => sum + r.sellingPrice, 0);

  // Pertokoan Profit
  const pertokoanProfit = sales.reduce((sum, s) => sum + s.profit, 0);
  const pertokoanRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  // Simpan Pinjam Interest Profit
  // Interest is paid as part of loan repayments
  const simpanPinjamProfit = loans.reduce((sum, l) => {
    const interestRepaid = l.repaymentHistory.reduce((s, r) => s + r.interestPaid, 0);
    return sum + interestRepaid;
  }, 0);

  // Total cooperative revenues & profit
  const totalCoopProfit = wartelProfit + pertokoanProfit + simpanPinjamProfit;

  // --- Chart 1: Unit Performance Data (Revenue vs Profit) ---
  const unitPerformanceData = [
    { name: 'Wartel', revenue: wartelRevenue, profit: wartelProfit, color: 'emerald' },
    { name: 'S&P (Bunga)', revenue: simpanPinjamProfit * 2, profit: simpanPinjamProfit, color: 'blue' }, // approximate interest revenue scale
    { name: 'Pertokoan', revenue: pertokoanRevenue, profit: pertokoanProfit, color: 'amber' }
  ];

  // --- Chart 2: Daily Cash Flow Trends (Last 7 Days) ---
  const getDailyTrendData = () => {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates.map(date => {
      const dayTx = transactions.filter(t => t.date.startsWith(date));
      const masuk = dayTx.filter(t => t.type === 'kas_masuk').reduce((s, t) => s + t.amount, 0);
      const keluar = dayTx.filter(t => t.type === 'kas_keluar').reduce((s, t) => s + t.amount, 0);
      
      // format date label to "dd MMM"
      const parts = date.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const label = `${parseInt(parts[2])} ${monthNames[parseInt(parts[1]) - 1]}`;

      return { date, label, masuk, keluar };
    });
  };

  const dailyTrendData = getDailyTrendData();

  // --- Formatting Helpers ---
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Top Welcome Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6.5 text-white shadow-lg relative overflow-hidden border border-slate-800" id="dashboard-welcome-panel">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 opacity-5 pointer-events-none">
          <Award size={250} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="bg-blue-600/30 backdrop-blur-xs text-blue-300 text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full inline-block mb-3.5 border border-blue-500/25">
            Sistem Real-Time Koperasi
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-sans">
            Sistem Pembukuan Koperasi Multi-Usaha
          </h1>
          <p className="mt-1.5 text-slate-300 text-sm leading-relaxed">
            Konsolidasikan unit usaha <strong className="text-white">Wartel</strong>, <strong className="text-white">Simpan Pinjam</strong>, dan <strong className="text-white">Pertokoan</strong> secara instan dengan verifikasi kredit berjenjang untuk meminimalkan risiko keuangan.
          </p>
          <div className="mt-4.5 flex flex-wrap gap-2">
            <button 
              onClick={() => onNavigate('simpan_pinjam')} 
              className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              id="btn-quick-sp"
            >
              <Coins size={14} className="text-slate-600" /> Pengajuan Pinjaman
            </button>
            <button 
              onClick={() => onNavigate('pertokoan')} 
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 border border-blue-500/30 shadow-xs"
              id="btn-quick-shop"
            >
              <ShoppingBag size={14} /> Transaksi Toko
            </button>
            <button 
              onClick={() => onNavigate('laporan')} 
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 border border-slate-700/60"
              id="btn-quick-reports"
            >
              <Activity size={14} /> Laporan Arus Kas
            </button>
          </div>
        </div>
      </div>

      {/* Main Financial Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="dashboard-metrics-grid">
        {/* Card 1: Kas Utama */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-start justify-between" id="metric-card-kas">
          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs font-semibold block">Kas Utama Koperasi</span>
            <span className="text-xl font-bold text-slate-900 font-sans tracking-tight block">
              {formatIDR(cashBalance)}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/60 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <ArrowUpRight size={11} /> Sinkron Real-Time
            </span>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-blue-700 shadow-2xs">
            <Wallet size={20} />
          </div>
        </div>

        {/* Card 2: Total Simpanan */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-start justify-between" id="metric-card-simpanan">
          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs font-semibold block">Total Simpanan Anggota</span>
            <span className="text-xl font-bold text-slate-900 font-sans tracking-tight block">
              {formatIDR(totalSavings)}
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100/60 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Users size={11} /> {members.length} Anggota Aktif
            </span>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-indigo-700 shadow-2xs">
            <Users size={20} />
          </div>
        </div>

        {/* Card 3: Pinjaman Beredar */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-start justify-between" id="metric-card-pinjaman">
          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs font-semibold block">Outstanding Pinjaman</span>
            <span className="text-xl font-bold text-slate-900 font-sans tracking-tight block">
              {formatIDR(outstandingLoans)}
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100/60 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Clock size={11} /> {loans.filter(l => l.status === 'aktif').length} Kontrak Aktif
            </span>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-amber-700 shadow-2xs">
            <Percent size={20} />
          </div>
        </div>

        {/* Card 4: Laba Usaha */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-start justify-between" id="metric-card-laba">
          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs font-semibold block">Akumulasi Laba 3 Unit</span>
            <span className="text-xl font-bold text-slate-900 font-sans tracking-tight block">
              {formatIDR(totalCoopProfit)}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/60 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <TrendingUp size={11} /> Konsolidasi Berjalan
            </span>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-emerald-700 shadow-2xs">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Main Charts and Unit Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-graphics-row">
        
        {/* Graphical Financial Monitor */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4" id="dashboard-chart-box">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Monitor Kinerja Keuangan Koperasi</h3>
              <p className="text-xs text-slate-400">Representasi visual omzet dan arus kas real-time</p>
            </div>
            
            {/* Chart Tab Selectors */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex self-start sm:self-center">
              <button
                onClick={() => setActiveChartTab('performa')}
                className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeChartTab === 'performa'
                    ? 'bg-white text-slate-850 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Omzet vs Laba Unit
              </button>
              <button
                onClick={() => setActiveChartTab('tren')}
                className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeChartTab === 'tren'
                    ? 'bg-white text-slate-850 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Arus Kas Harian (7 Hari)
              </button>
            </div>
          </div>

          {/* SVG Visualizations */}
          <div className="relative pt-4 h-64" id="chart-viewport">
            {activeChartTab === 'performa' ? (
              /* Bar Chart: Omzet vs Laba */
              <div className="w-full h-full flex flex-col justify-between">
                <div className="flex items-end justify-around h-44 border-b border-slate-100 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0">
                    <div className="w-full border-t border-slate-100/50 h-0"></div>
                    <div className="w-full border-t border-slate-100/50 h-0"></div>
                    <div className="w-full border-t border-slate-100/50 h-0"></div>
                  </div>

                  {unitPerformanceData.map((unit, idx) => {
                    const maxVal = Math.max(...unitPerformanceData.map(u => u.revenue), 1000000);
                    const revHeight = (unit.revenue / maxVal) * 120; // max height 120px
                    const profitHeight = (unit.profit / maxVal) * 120;

                    // Professional Polish dynamic bar mapping
                    const barColors: Record<string, { bar: string; barBg: string; border: string }> = {
                      orange: { bar: 'bg-amber-500 hover:bg-amber-600', barBg: 'bg-amber-500/15 hover:bg-amber-500/25', border: 'border-amber-500/30' },
                      blue: { bar: 'bg-blue-600 hover:bg-blue-700', barBg: 'bg-blue-600/15 hover:bg-blue-600/25', border: 'border-blue-600/30' },
                      emerald: { bar: 'bg-emerald-600 hover:bg-emerald-700', barBg: 'bg-emerald-600/15 hover:bg-emerald-600/25', border: 'border-emerald-600/30' }
                    };
                    const style = barColors[unit.color] || barColors.blue;

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5 z-10 w-24">
                        {/* Bar Container */}
                        <div className="flex items-end justify-center gap-2 h-36">
                          {/* Revenue Bar */}
                          <div 
                            className={`w-5 ${style.barBg} border-t ${style.border} rounded-t-xs transition-all relative group cursor-pointer`}
                            style={{ height: `${Math.max(revHeight, 8)}px` }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredData({
                                label: `${unit.name} (Omzet)`,
                                value: unit.revenue,
                                x: idx * 140 + 80,
                                y: 120 - revHeight
                              });
                            }}
                            onMouseLeave={() => setHoveredData(null)}
                          ></div>
                          {/* Profit Bar */}
                          <div 
                            className={`w-5 ${style.bar} rounded-t-xs transition-all relative group cursor-pointer shadow-2xs`}
                            style={{ height: `${Math.max(profitHeight, 4)}px` }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredData({
                                label: `${unit.name} (Laba Bersih)`,
                                value: unit.profit,
                                x: idx * 140 + 110,
                                y: 120 - profitHeight
                              });
                            }}
                            onMouseLeave={() => setHoveredData(null)}
                          ></div>
                        </div>
                        {/* X-Label */}
                        <span className="text-[11px] font-medium text-slate-500 tracking-tight text-center truncate w-full">
                          {unit.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Legends */}
                <div className="flex justify-center items-center gap-6 pt-3 text-[11px] font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-slate-200 border border-slate-300 rounded-xs"></span>
                    <span>Omzet Operasional</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-slate-700 rounded-xs"></span>
                    <span>Laba Bersih Per Divisi</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Line Chart: Daily Inflow vs Outflow */
              <div className="w-full h-full flex flex-col justify-between">
                <div className="relative h-44 w-full">
                  {/* SVG Container */}
                  <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1"/>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                      </linearGradient>
                    </defs>

                    {/* Horizontal Gridlines */}
                    <line x1="0" y1="10" x2="500" y2="10" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="#e2e8f0" strokeWidth="1" />

                    {/* Line Math */}
                    {(() => {
                      const maxVal = Math.max(...dailyTrendData.map(d => Math.max(d.masuk, d.keluar)), 500000);
                      const pointsMasuk = dailyTrendData.map((d, i) => {
                        const x = (i / 6) * 460 + 20;
                        const y = 140 - (d.masuk / maxVal) * 120;
                        return { x, y, val: d.masuk, label: d.label };
                      });
                      const pointsKeluar = dailyTrendData.map((d, i) => {
                        const x = (i / 6) * 460 + 20;
                        const y = 140 - (d.keluar / maxVal) * 120;
                        return { x, y, val: d.keluar, label: d.label };
                      });

                      const dMasuk = pointsMasuk.reduce((str, p, i) => `${str}${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                      const dKeluar = pointsKeluar.reduce((str, p, i) => `${str}${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

                      const dMasukArea = `${dMasuk} L ${pointsMasuk[6].x} 150 L ${pointsMasuk[0].x} 150 Z`;
                      const dKeluarArea = `${dKeluar} L ${pointsKeluar[6].x} 150 L ${pointsKeluar[0].x} 150 Z`;

                      return (
                        <>
                          {/* Areas */}
                          <path d={dMasukArea} fill="url(#inflowGrad)" />
                          <path d={dKeluarArea} fill="url(#outflowGrad)" />

                          {/* Lines */}
                          <path d={dMasuk} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d={dKeluar} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" strokeLinejoin="round" />

                          {/* Interactive Hotspots / Dots */}
                          {pointsMasuk.map((p, idx) => (
                            <g key={`m-${idx}`} className="cursor-pointer">
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="4.5" 
                                fill="#ffffff" 
                                stroke="#10b981" 
                                strokeWidth="2.5"
                                onMouseEnter={() => {
                                  setHoveredData({
                                    label: `${p.label} (Uang Masuk)`,
                                    value: p.val,
                                    x: p.x,
                                    y: p.y
                                  });
                                }}
                                onMouseLeave={() => setHoveredData(null)}
                              />
                            </g>
                          ))}
                          {pointsKeluar.map((p, idx) => (
                            <g key={`k-${idx}`} className="cursor-pointer">
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="4" 
                                fill="#ffffff" 
                                stroke="#ef4444" 
                                strokeWidth="2"
                                onMouseEnter={() => {
                                  setHoveredData({
                                    label: `${p.label} (Uang Keluar)`,
                                    value: p.val,
                                    x: p.x,
                                    y: p.y
                                  });
                                }}
                                onMouseLeave={() => setHoveredData(null)}
                              />
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>

                  {/* Dates Axis Labels */}
                  <div className="absolute bottom-0 inset-x-0 flex justify-between px-2 text-[10px] font-medium text-slate-400">
                    {dailyTrendData.map((d, i) => (
                      <span key={i} style={{ width: '14%', textAlign: 'center' }}>
                        {d.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Legends */}
                <div className="flex justify-center items-center gap-6 pt-3 text-[11px] font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-emerald-500 border border-emerald-500 rounded-full inline-block"></span>
                    <span>Kas Masuk (Inflow)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 border-t border-dashed border-red-500 inline-block"></span>
                    <span>Kas Keluar (Outflow)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Float Tooltip */}
            {hoveredData && (
              <div 
                className="absolute z-30 bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col gap-0.5"
                style={{ left: `${hoveredData.x}px`, top: `${hoveredData.y}px` }}
              >
                <span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider">{hoveredData.label}</span>
                <span className="font-mono text-emerald-300 font-bold">{formatIDR(hoveredData.value)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Business Unit Side List */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4" id="dashboard-units-column">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Status Laba Per Unit Usaha</h3>
            <p className="text-xs text-slate-400">Efisiensi keuangan masing-masing divisi</p>
          </div>

          <div className="space-y-4 py-2 flex-1 flex flex-col justify-around">
            {/* 1. Wartel */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg">
                  <PhoneCall size={18} />
                </div>
                <div>
                  <span className="text-slate-800 text-xs font-semibold block">Unit Wartel & Pulsa</span>
                  <span className="text-[10px] text-slate-400 block">{wartelRecords.length} Transaksi terlayani</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 block">{formatIDR(wartelProfit)}</span>
                <span className="text-[9px] font-semibold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  Net Profit
                </span>
              </div>
            </div>

            {/* 2. Simpan Pinjam */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-700 p-2 rounded-lg">
                  <Coins size={18} />
                </div>
                <div>
                  <span className="text-slate-800 text-xs font-semibold block">Unit Simpan Pinjam</span>
                  <span className="text-[10px] text-slate-400 block">{loans.length} Berkas diajukan</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 block">{formatIDR(simpanPinjamProfit)}</span>
                <span className="text-[9px] font-semibold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded-full">
                  Hasil Bunga
                </span>
              </div>
            </div>

            {/* 3. Pertokoan */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 text-amber-700 p-2 rounded-lg">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <span className="text-slate-800 text-xs font-semibold block">Unit Pertokoan</span>
                  <span className="text-[10px] text-slate-400 block">{sales.length} Penjualan selesai</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 block">{formatIDR(pertokoanProfit)}</span>
                <span className="text-[9px] font-semibold text-amber-600 uppercase bg-amber-50 px-1.5 py-0.5 rounded-full">
                  Net Laba
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold">Laba Konsolidasi</span>
            <span className="font-extrabold text-slate-900">{formatIDR(totalCoopProfit)}</span>
          </div>
        </div>
      </div>

      {/* Grid: Pinjaman Menunggu Persetujuan & Aktivitas Transaksi Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-bottom-grid">
        
        {/* Credit Applications Waiting Approval */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4" id="dashboard-pending-loans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Pengajuan Kredit Menunggu Persetujuan</h3>
              <p className="text-xs text-slate-400">Verifikasi berjenjang untuk mencegah risiko gagal bayar</p>
            </div>
            <button 
              onClick={() => onNavigate('simpan_pinjam')} 
              className="text-blue-600 hover:text-blue-700 font-bold text-xs cursor-pointer inline-flex items-center gap-0.5 transition-colors"
            >
              Lihat SP <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="space-y-3">
            {loans.filter(l => l.status !== 'aktif' && l.status !== 'lunas' && l.status !== 'ditolak').length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-1.5">
                <CheckCircle2 size={32} className="text-blue-600" />
                Semua pengajuan kredit telah diproses dengan lengkap.
              </div>
            ) : (
              loans
                .filter(l => l.status !== 'aktif' && l.status !== 'lunas' && l.status !== 'ditolak')
                .map((loan) => {
                  // Determine workflow level progress
                  const approvedCount = [
                    loan.approvalWorkflow.staff.status === 'approved',
                    loan.approvalWorkflow.manager.status === 'approved',
                    loan.approvalWorkflow.chairman.status === 'approved'
                  ].filter(Boolean).length;

                  return (
                    <div key={loan.id} className="border border-slate-100 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-200 transition-all bg-slate-50/20">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 text-xs">{loan.memberName}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-medium">{loan.memberId}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Jumlah: <span className="font-semibold text-slate-700">{formatIDR(loan.amountRequested)}</span>
                          <span className="mx-1.5">•</span>
                          Tenor: <span className="font-semibold text-slate-700">{loan.tenor} Bulan</span>
                        </div>
                        <p className="text-[11px] text-slate-400 italic">"{loan.purpose}"</p>
                      </div>

                      {/* Approval Tracker */}
                      <div className="flex flex-col items-start sm:items-end gap-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                          Verifikasi ({approvedCount}/3)
                        </span>

                        {/* Progress Nodes */}
                        <div className="flex items-center gap-1">
                          <span className={`w-3.5 h-1.5 rounded-full ${loan.approvalWorkflow.staff.status === 'approved' ? 'bg-blue-600' : 'bg-slate-200'}`} title="Staff Approval"></span>
                          <span className={`w-3.5 h-1.5 rounded-full ${loan.approvalWorkflow.manager.status === 'approved' ? 'bg-blue-600' : 'bg-slate-200'}`} title="Manager Approval"></span>
                          <span className={`w-3.5 h-1.5 rounded-full ${loan.approvalWorkflow.chairman.status === 'approved' ? 'bg-blue-600' : 'bg-slate-200'}`} title="Chairman Approval"></span>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Latest Journal Activities */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4" id="dashboard-activities">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Riwayat Aktivitas Keuangan Koperasi</h3>
              <p className="text-xs text-slate-400">Arus kas harian yang tercatat di semua unit usaha</p>
            </div>
            <button 
              onClick={() => onNavigate('laporan')} 
              className="text-blue-600 hover:text-blue-700 font-bold text-xs cursor-pointer inline-flex items-center gap-0.5 transition-colors"
            >
              Lihat Jurnal <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1" id="timeline-scroll">
            {transactions.slice().reverse().slice(0, 5).map((tx) => {
              const unitLabels: Record<string, { name: string; style: string }> = {
                wartel: { name: 'Wartel', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                simpan_pinjam: { name: 'S&P', style: 'bg-blue-50 text-blue-700 border-blue-100' },
                pertokoan: { name: 'Toko', style: 'bg-amber-50 text-amber-700 border-amber-100' },
                umum: { name: 'Umum', style: 'bg-slate-100 text-slate-600 border-slate-200' }
              };

              const unitMeta = unitLabels[tx.unit] || { name: 'Umum', style: 'bg-slate-100 text-slate-600' };

              return (
                <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full border ${tx.type === 'kas_masuk' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                      {tx.type === 'kas_masuk' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-800 block">{tx.description}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className={`px-1.5 py-0.2 rounded-sm border text-[9px] font-semibold tracking-wide ${unitMeta.style}`}>
                          {unitMeta.name}
                        </span>
                        <span>•</span>
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{tx.date.substring(5, 16)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold block ${tx.type === 'kas_masuk' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tx.type === 'kas_masuk' ? '+' : '-'}{formatIDR(tx.amount)}
                    </span>
                    <span className="text-[9px] text-slate-400 capitalize">{tx.paymentMethod}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* --- PENGATURAN KOPERASI & PENDAFTARAN AKUN (BENTO CARD) --- */}
      {currentUser.role === 'admin' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6" id="cooperative-settings-panel">
          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Settings size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Pengaturan Koperasi & Manajemen Akun</h3>
                <p className="text-[10px] font-medium text-slate-400">Atur profil koperasi dan daftarkan akun personil pengelola unit usaha</p>
              </div>
            </div>
            <span className="px-2 py-0.8 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-[9px] font-black uppercase">
              Hak Akses Admin
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Edit Cooperative Name */}
          <div className="space-y-3 bg-slate-50 p-4.5 rounded-xl border border-slate-150">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Nama Koperasi</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Nama Koperasi Utama</label>
                <input 
                  type="text" 
                  value={editingCoopName} 
                  onChange={(e) => setEditingCoopName(e.target.value)}
                  disabled={currentUser.role !== 'admin'}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                  placeholder="Contoh: Koperasi Karya Mukti"
                />
              </div>
              <button
                onClick={() => {
                  if (editingCoopName.trim()) {
                    onUpdateCooperativeName(editingCoopName.trim());
                  }
                }}
                disabled={currentUser.role !== 'admin' || !editingCoopName.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg cursor-pointer transition-all shadow-2xs"
              >
                Simpan Perubahan Nama
              </button>
            </div>
          </div>

          {/* Column 2: Account Registration */}
          <div className="space-y-3 bg-slate-50 p-4.5 rounded-xl border border-slate-150">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus size={15} />
              Pendaftaran Akun Baru
            </h4>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              setRegError(null);
              setRegSuccess(null);

              if (!newUsername.trim() || !newFullName.trim() || !newPin.trim()) {
                setRegError('Semua kolom wajib diisi!');
                return;
              }

              // Check duplicates
              if (accounts.some(a => a.username.toLowerCase() === newUsername.trim().toLowerCase())) {
                setRegError('Username sudah terpakai!');
                return;
              }

              const newAcc: UserAccount = {
                username: newUsername.trim().toLowerCase(),
                name: newFullName.trim(),
                role: newRole as any,
                pin: newPin.trim()
              };

              onRegisterAccount(newAcc);
              setRegSuccess(`Akun "${newAcc.name}" berhasil didaftarkan!`);
              setNewUsername('');
              setNewFullName('');
              setNewPin('');
            }} className="space-y-2.5">
              
              {regSuccess && (
                <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-semibold text-center">
                  {regSuccess}
                </div>
              )}

              {regError && (
                <div className="p-2 bg-red-50 text-red-500 border border-red-100 rounded-lg text-[10px] font-semibold text-center">
                  {regError}
                </div>
              )}

              <div>
                <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Nama Lengkap Pengguna</label>
                <input 
                  type="text" 
                  value={newFullName} 
                  onChange={(e) => setNewFullName(e.target.value)}
                  disabled={currentUser.role !== 'admin'}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                  placeholder="Nama Lengkap"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Username Login</label>
                  <input 
                    type="text" 
                    value={newUsername} 
                    onChange={(e) => setNewUsername(e.target.value)}
                    disabled={currentUser.role !== 'admin'}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                    placeholder="User"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 block mb-0.5">PIN Keamanan (PIN)</label>
                  <input 
                    type="password" 
                    value={newPin} 
                    onChange={(e) => setNewPin(e.target.value)}
                    disabled={currentUser.role !== 'admin'}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                    placeholder="4 Digit PIN"
                    maxLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Kewenangan / Peran Jabatan</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  disabled={currentUser.role !== 'admin'}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                >
                  <option value="operator_sp">Operator Unit Simpan Pinjam (USP)</option>
                  <option value="operator_toko">Operator Unit Pertokoan (Toko)</option>
                  <option value="operator_wartel">Operator Unit Telekomunikasi (Wartel)</option>
                  <option value="verifikator_staff">Verifikator Jabatan Staff</option>
                  <option value="verifikator_bendahara">Verifikator Jabatan Bendahara</option>
                  <option value="verifikator_ketua">Verifikator Jabatan Ketua</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={currentUser.role !== 'admin'}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg cursor-pointer transition-all shadow-2xs"
              >
                Daftarkan Anggota / Akun
              </button>
            </form>
          </div>

          {/* Column 3: Accounts Directory */}
          <div className="space-y-3 bg-slate-50 p-4.5 rounded-xl border border-slate-150">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-extrabold text-slate-850">Daftar Pengguna Aktif</h4>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {accounts.map((acc) => {
                const roleLabel = acc.role
                  .replace('operator_sp', 'Op. Simpan Pinjam')
                  .replace('operator_toko', 'Op. Pertokoan')
                  .replace('operator_wartel', 'Op. Wartel')
                  .replace('verifikator_staff', 'Verifikator Staff')
                  .replace('verifikator_bendahara', 'Verifikator Bendahara')
                  .replace('verifikator_ketua', 'Ketua Koperasi');

                const isVerifier = acc.role.startsWith('verifikator');

                return (
                  <div key={acc.username} className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center gap-2 shadow-2xs">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-slate-850 block leading-tight">{acc.name}</span>
                      <span className="text-[9px] text-slate-500 font-medium block">@{acc.username}</span>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wide leading-none ${
                        isVerifier ? 'bg-indigo-50 text-indigo-600 border border-indigo-150' : 'bg-emerald-50 text-emerald-600 border border-emerald-150'
                      }`}>
                        {roleLabel}
                      </span>
                      <span className="text-[8px] font-mono text-slate-400 font-semibold">PIN: ****</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      )}

    </div>
  );
}
