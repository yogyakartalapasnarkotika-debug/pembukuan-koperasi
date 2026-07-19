import React, { useState } from 'react';
import { Member, WartelRecord, Transaction, PertokoanProduct } from '../types';
import { 
  PhoneCall, 
  Smartphone, 
  Database, 
  Gamepad2, 
  Menu, 
  Plus, 
  Search, 
  Coins, 
  TrendingUp, 
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Trash2,
  Percent,
  Sliders,
  DollarSign,
  Printer,
  Edit2,
  Package,
  Layers,
  Check
} from 'lucide-react';

interface WartelUnitProps {
  members: Member[];
  records: WartelRecord[];
  onAddWartelRecord: (newRecord: WartelRecord) => void;
  activeSubTab?: string;
  onAddTransaction?: (tx: Transaction) => void;
  products?: PertokoanProduct[];
  onUpdateProduct?: (updatedProduct: PertokoanProduct) => void;
}

interface WartelExpense {
  id: string;
  date: string;
  category: 'atk' | 'pulsa' | 'internet' | 'pnbp' | 'server' | 'lainnya';
  amount: number;
  description: string;
}

export default function WartelUnit({
  members,
  records,
  onAddWartelRecord,
  activeSubTab = 'kasir',
  onAddTransaction,
  products = [],
  onUpdateProduct
}: WartelUnitProps) {
  // --- Local sub-navigation tab ---
  const [localTab, setLocalTab] = useState<'kasir' | 'pengeluaran' | 'laporan'>(activeSubTab as any || 'kasir');

  // Sync with parent sidebar navigation changes
  React.useEffect(() => {
    if (activeSubTab === 'kasir' || activeSubTab === 'laporan') {
      setLocalTab(activeSubTab as any);
    }
  }, [activeSubTab]);

  // --- Service forms state ---
  const [serviceType, setServiceType] = useState<'telepon' | 'pulsa' | 'paket_data' | 'voucher_game' | 'lainnya'>('pulsa');

  // Auto-fill cost & selling prices based on the synced products list
  React.useEffect(() => {
    const matched = products.find(p => p.wartelServiceType === serviceType);
    if (matched) {
      setCostPrice(matched.costPrice);
      setSellingPrice(matched.sellingPrice);
    }
  }, [serviceType, products]);

  // --- State for Sync Product Update ---
  const [editingProduct, setEditingProduct] = useState<PertokoanProduct | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editCostPrice, setEditCostPrice] = useState<number>(0);
  const [editSellingPrice, setEditSellingPrice] = useState<number>(0);
  const [editProductName, setEditProductName] = useState<string>('');

  const handleOpenEditProduct = (prod: PertokoanProduct) => {
    setEditingProduct(prod);
    setEditStock(prod.stock);
    setEditCostPrice(prod.costPrice);
    setEditSellingPrice(prod.sellingPrice);
    setEditProductName(prod.name);
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !onUpdateProduct) return;

    const updated: PertokoanProduct = {
      ...editingProduct,
      name: editProductName,
      stock: Number(editStock),
      costPrice: Number(editCostPrice),
      sellingPrice: Number(editSellingPrice)
    };

    onUpdateProduct(updated);
    setEditingProduct(null);
  };

  const [customerType, setCustomerType] = useState<'guest' | 'member'>('guest');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'deposit'>('cash');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // --- Expenses state ---
  const [expenses, setExpenses] = useState<WartelExpense[]>(() => {
    const saved = localStorage.getItem('kop_wartel_expenses');
    return saved ? JSON.parse(saved) : [
      { id: 'wexp-1', date: '2026-07-15 10:00:00', category: 'atk', amount: 45000, description: 'Beli kertas hvs, pen & map ATK' },
      { id: 'wexp-2', date: '2026-07-16 14:30:00', category: 'internet', amount: 150000, description: 'Langganan wifi modem harian' },
      { id: 'wexp-3', date: '2026-07-17 11:20:00', category: 'server', amount: 250000, description: 'Sewa server / API gateway h2h' },
      { id: 'wexp-4', date: '2026-07-18 09:15:00', category: 'pnbp', amount: 100000, description: 'Setoran PNBP telekomunikasi' }
    ];
  });

  // --- Profit sharing percent state (4 items: Mitra/Vendor, Koperasi Primer, Inkopasindo, Unit Pengelola) ---
  const [sharingPercentages, setSharingPercentages] = useState<{
    vendor: number;
    koperasiPrimer: number;
    inkopasindo: number;
    pengelola: number;
  }>(() => {
    const saved = localStorage.getItem('kop_wartel_sharing_percents_4');
    return saved ? JSON.parse(saved) : {
      vendor: 40,
      koperasiPrimer: 30,
      inkopasindo: 15,
      pengelola: 15
    };
  });

  // --- Expenses form state ---
  const [expCategory, setExpCategory] = useState<'atk' | 'pulsa' | 'internet' | 'pnbp' | 'server' | 'lainnya'>('atk');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expDesc, setExpDesc] = useState<string>('');
  const [expError, setExpError] = useState<string>('');
  const [expSuccess, setExpSuccess] = useState<string>('');

  // Save changes to localStorage
  React.useEffect(() => {
    localStorage.setItem('kop_wartel_expenses', JSON.stringify(expenses));
  }, [expenses]);

  React.useEffect(() => {
    localStorage.setItem('kop_wartel_sharing_percents_4', JSON.stringify(sharingPercentages));
  }, [sharingPercentages]);

  // --- Financial Calculations ---
  const totalRevenue = records.reduce((sum, r) => sum + r.sellingPrice, 0);
  const totalCost = records.reduce((sum, r) => sum + r.costPrice, 0);
  const grossProfit = records.reduce((sum, r) => sum + r.profit, 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpensesAmount;

  // Split calculations (4 items)
  const vendorShare = Math.max(0, netProfit) * sharingPercentages.vendor / 100;
  const coopPrimerShare = Math.max(0, netProfit) * sharingPercentages.koperasiPrimer / 100;
  const inkopasindoShare = Math.max(0, netProfit) * sharingPercentages.inkopasindo / 100;
  const pengelolaShare = Math.max(0, netProfit) * sharingPercentages.pengelola / 100;
  const totalPercentSum = sharingPercentages.vendor + sharingPercentages.koperasiPrimer + sharingPercentages.inkopasindo + sharingPercentages.pengelola;

  // Breakdown by Service Type
  const revenueByType = (type: string) => records.filter(r => r.serviceType === type).reduce((sum, r) => sum + r.sellingPrice, 0);
  const costByType = (type: string) => records.filter(r => r.serviceType === type).reduce((sum, r) => sum + r.costPrice, 0);

  // Breakdown by Expense Category
  const expenseByCategory = (cat: string) => expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Find active member
  const activeMember = customerType === 'member' 
    ? members.find(m => m.memberId === selectedMemberId) 
    : null;

  // Handle service submission
  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (customerType === 'member' && !selectedMemberId) {
      setErrorMsg('Pilih ID Anggota terlebih dahulu!');
      return;
    }
    if (customerType === 'member' && !activeMember) {
      setErrorMsg('Anggota tidak ditemukan!');
      return;
    }
    if (customerType === 'guest' && !guestName) {
      setErrorMsg('Masukkan nama pelanggan umum!');
      return;
    }
    if (sellingPrice <= 0 || costPrice < 0) {
      setErrorMsg('Masukkan harga modal dan harga jual yang valid!');
      return;
    }

    const totalSellingPrice = Number(sellingPrice) * quantity;
    const totalCostPrice = Number(costPrice) * quantity;
    const totalProfit = totalSellingPrice - totalCostPrice;

    // Check member balance for deposit payment method
    if (customerType === 'member' && activeMember && paymentMethod === 'deposit') {
      if (activeMember.savings.sukarela < totalSellingPrice) {
        setErrorMsg(`Saldo Simpanan Sukarela Anggota tidak mencukupi! (Saldo: ${formatIDR(activeMember.savings.sukarela)})`);
        return;
      }
    }

    const finalCustName = customerType === 'member' && activeMember ? activeMember.name : guestName;

    const newRecord: WartelRecord = {
      id: `wrec-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      serviceType,
      customerName: finalCustName,
      memberId: customerType === 'member' ? selectedMemberId : undefined,
      costPrice: totalCostPrice,
      sellingPrice: totalSellingPrice,
      profit: totalProfit,
      paymentMethod,
      description,
      quantity: Number(quantity)
    };

    onAddWartelRecord(newRecord);

    // Sync to general ledger of Coop
    if (onAddTransaction) {
      onAddTransaction({
        id: `tx-wartel-${Date.now()}`,
        date: newRecord.date,
        type: 'kas_masuk',
        amount: totalSellingPrice,
        category: 'Penjualan Wartel',
        description: `Penjualan ${serviceType.toUpperCase()} (${quantity}x) - ${finalCustName}`,
        unit: 'wartel',
        paymentMethod: paymentMethod === 'cash' ? 'cash' : 'deposit'
      });
      // Cost HPP
      if (totalCostPrice > 0) {
        onAddTransaction({
          id: `tx-wartel-hpp-${Date.now()}`,
          date: newRecord.date,
          type: 'kas_keluar',
          amount: totalCostPrice,
          category: 'Biaya Operasional',
          description: `HPP / Modal ${serviceType.toUpperCase()} (${quantity}x) - ${finalCustName}`,
          unit: 'wartel',
          paymentMethod: 'cash'
        });
      }
    }
    
    setSuccessMsg(`Sukses menyimpan transaksi ${quantity}x penjualan senilai ${formatIDR(totalSellingPrice)}!`);
    
    setCostPrice(0);
    setSellingPrice(0);
    setDescription('');
    setSelectedMemberId('');
    setGuestName('');
    setQuantity(1);
  };

  // Handle Expense submission
  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpError('');
    setExpSuccess('');

    if (expAmount <= 0 || !expDesc.trim()) {
      setExpError('Masukkan jumlah nominal dan keterangan pengeluaran!');
      return;
    }

    const newExp: WartelExpense = {
      id: `wexp-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      category: expCategory,
      amount: Number(expAmount),
      description: expDesc.trim()
    };

    setExpenses(prev => [newExp, ...prev]);

    // Sync expense to main ledger
    if (onAddTransaction) {
      onAddTransaction({
        id: `tx-wartel-exp-${Date.now()}`,
        date: newExp.date,
        type: 'kas_keluar',
        amount: Number(expAmount),
        category: 'Biaya Operasional',
        description: `Beban Wartel (${expCategory.toUpperCase()}): ${expDesc.trim()}`,
        unit: 'wartel',
        paymentMethod: 'cash'
      });
    }

    setExpSuccess(`Sukses menyimpan pengeluaran ${expCategory.toUpperCase()} senilai ${formatIDR(expAmount)}!`);
    setExpAmount(0);
    setExpDesc('');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6" id="wartel-panel">
      
      {/* Local Sub Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex gap-1 shadow-3xs print:hidden">
        <button
          onClick={() => setLocalTab('kasir')}
          className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            localTab === 'kasir' 
              ? 'bg-blue-600 text-white shadow-2xs' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Smartphone size={15} />
          Loket & Kasir Wartel
        </button>
        <button
          onClick={() => setLocalTab('pengeluaran')}
          className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            localTab === 'pengeluaran' 
              ? 'bg-blue-600 text-white shadow-2xs' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <TrendingDown size={15} />
          Beban Pengeluaran ATK / Server
        </button>
        <button
          onClick={() => setLocalTab('laporan')}
          className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            localTab === 'laporan' 
              ? 'bg-blue-600 text-white shadow-2xs' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FileText size={15} />
          Laporan Bagi Hasil & Laba Rugi
        </button>
      </div>

      {/* TAB 1: KASIR */}
      {localTab === 'kasir' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="wartel-kasir-view">
          
          {/* Left Input Form Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider block">Loket Pelayanan</span>
              <h3 className="font-black text-slate-900 text-sm">Entri Transaksi Baru</h3>
              <p className="text-xs text-slate-400 font-medium">Catat penjualan pulsa elektrik atau jasa bilik telepon</p>
            </div>

            <form onSubmit={handleSubmitRecord} className="space-y-4 text-xs text-slate-700">
              <div className="space-y-2">
                <label className="font-bold text-slate-600 block">Jenis Layanan</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'pulsa', label: 'Pulsa', icon: Smartphone },
                    { id: 'paket_data', label: 'Paket Data', icon: Database },
                    { id: 'telepon', label: 'Telp Bilik', icon: PhoneCall },
                    { id: 'voucher_game', label: 'Voucher', icon: Gamepad2 },
                    { id: 'lainnya', label: 'Lainnya', icon: Menu }
                  ].map((item) => {
                    const IconComponent = item.icon;
                    const isSelected = serviceType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setServiceType(item.id as any)}
                        className={`p-2.5 rounded-lg border text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-extrabold shadow-2xs' 
                            : 'border-slate-150 bg-slate-50/50 text-slate-500 hover:border-slate-250 hover:bg-slate-50'
                        }`}
                      >
                        <IconComponent size={16} />
                        <span className="text-[10px] tracking-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-600 block">Kategori Pelanggan</label>
                <div className="bg-slate-100 p-0.5 rounded-lg flex">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType('guest');
                      setPaymentMethod('cash');
                    }}
                    className={`flex-1 py-1.5 text-center rounded-md font-bold text-xs transition-all cursor-pointer ${
                      customerType === 'guest' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Pelanggan Umum
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerType('member')}
                    className={`flex-1 py-1.5 text-center rounded-md font-bold text-xs transition-all cursor-pointer ${
                      customerType === 'member' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Anggota Koperasi
                  </button>
                </div>
              </div>

              {customerType === 'member' ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 block">ID Anggota</label>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="">-- Pilih ID Anggota --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.memberId}>
                          {m.memberId} - {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 block">Pemberlakuan Pembayaran</label>
                    <div className="bg-slate-100 p-0.5 rounded-lg flex text-[10px]">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex-1 py-1.5 text-center rounded-md font-bold transition-all cursor-pointer ${
                          paymentMethod === 'cash' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500'
                        }`}
                      >
                        Tunai (Cash)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('deposit')}
                        className={`flex-1 py-1.5 text-center rounded-md font-bold transition-all cursor-pointer ${
                          paymentMethod === 'deposit' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500'
                        }`}
                      >
                        Voucher / Tabungan
                      </button>
                    </div>
                    {paymentMethod === 'deposit' && activeMember && (
                      <span className="text-[10px] text-blue-700 block mt-1">Saldo Tabungan Sukarela: <strong>{formatIDR(activeMember.savings.sukarela)}</strong></span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Nama Pembeli Umum</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ibu Ani"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              )}

               <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 space-y-1.5">
                  <label className="font-bold text-slate-600 block">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>
                <div className="col-span-1 space-y-1.5">
                  <label className="font-bold text-slate-600 block">Modal Satuan</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Modal"
                    value={costPrice || ''}
                    onChange={(e) => setCostPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>
                <div className="col-span-1 space-y-1.5">
                  <label className="font-bold text-slate-600 block">Jual Satuan</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Jual"
                    value={sellingPrice || ''}
                    onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>
              </div>

              {sellingPrice > 0 && (
                <div className={`p-2.5 rounded-lg text-[11px] font-bold space-y-1 ${
                  sellingPrice - costPrice >= 0 ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-rose-50 text-rose-800 border border-rose-100'
                }`}>
                  <div className="flex justify-between items-center">
                    <span>Estimasi Laba Satuan:</span>
                    <span className="font-mono font-bold">{formatIDR(sellingPrice - costPrice)}</span>
                  </div>
                  {quantity > 1 && (
                    <>
                      <div className="flex justify-between items-center border-t border-emerald-200/50 pt-1 mt-1">
                        <span>Total Modal ({quantity}x):</span>
                        <span className="font-mono text-slate-500">{formatIDR(costPrice * quantity)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Jual ({quantity}x):</span>
                        <span className="font-mono text-slate-500">{formatIDR(sellingPrice * quantity)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-emerald-200 pt-1 mt-1 font-black text-xs text-emerald-900">
                        <span>Total Laba Bersih:</span>
                        <span className="font-mono">{formatIDR((sellingPrice - costPrice) * quantity)}</span>
                      </div>
                    </>
                  )}
                  {quantity === 1 && (
                    <div className="flex justify-between items-center border-t border-emerald-200/50 pt-1 mt-1">
                      <span>Total Laba Bersih:</span>
                      <span className="font-mono font-black">{formatIDR(sellingPrice - costPrice)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Nomor HP / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pulsa Telkomsel ke 0812..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              {errorMsg && (
                <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-rose-800 text-[11px] font-semibold flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                Simpan Transaksi Jurnal Wartel
              </button>
            </form>
          </div>

          {/* Right Quick Table List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-6">
            
            {/* Real-time Synced Products Stock & Values */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <div className="flex items-center gap-1.5 text-blue-800">
                  <Package size={16} className="text-blue-600 animate-pulse" />
                  <span className="font-extrabold text-xs">Sinkronisasi Otomatis Unit Wartel & Pertokoan</span>
                </div>
                <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Stok Terhubung</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                {products.filter(p => p.wartelServiceType).map(prod => {
                  return (
                    <div key={prod.id} className="bg-white border border-slate-150 p-2.5 rounded-lg shadow-3xs hover:shadow-2xs transition-all space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-slate-400 font-mono font-medium">{prod.code}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            prod.stock > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {prod.stock} {prod.unit}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs mt-1 truncate" title={prod.name}>
                          {prod.name.replace(' (Wartel)', '')}
                        </h4>
                      </div>
                      
                      <div className="border-t border-slate-100 pt-1.5 space-y-0.5 text-[10px]">
                        <div className="flex justify-between text-slate-400">
                          <span>Pokok:</span>
                          <span className="font-mono text-slate-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(prod.costPrice)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Jual:</span>
                          <span className="font-mono font-bold text-blue-700">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(prod.sellingPrice)}</span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleOpenEditProduct(prod)}
                        className="w-full mt-1 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-extrabold text-[10px] rounded flex items-center justify-center gap-1 transition-all cursor-pointer border border-transparent hover:border-blue-150"
                      >
                        <Edit2 size={10} />
                        Update Produk
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Sirkulasi Transaksi Terbaru</h3>
                <p className="text-xs text-slate-400 font-medium">Buku pantau transaksi counter pulsa dan bilik telepon harian</p>
              </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Layanan</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3 text-center">Jumlah</th>
                    <th className="p-3 text-right">Modal</th>
                    <th className="p-3 text-right">Harga Jual</th>
                    <th className="p-3 text-right">Laba Jual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Belum ada penjualan terekam hari ini.
                      </td>
                    </tr>
                  ) : (
                    records.slice(-8).reverse().map((rec) => {
                      const typeMap: Record<string, string> = {
                        pulsa: 'Pulsa',
                        paket_data: 'Data',
                        telepon: 'Bilik Telp',
                        voucher_game: 'Voucher',
                        lainnya: 'Lain-lain'
                      };
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-mono text-[10px] text-slate-500">
                            {rec.date.substring(11, 16)}
                          </td>
                          <td className="p-3">
                            <span className="bg-blue-50 text-blue-800 border border-blue-100 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              {typeMap[rec.serviceType] || rec.serviceType}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800 block">{rec.customerName}</span>
                            {rec.memberId && <span className="font-mono text-[9px] font-bold text-slate-400">{rec.memberId}</span>}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-800">
                            {rec.quantity || 1}x
                          </td>
                          <td className="p-3 text-right font-mono text-slate-500">
                            {formatIDR(rec.costPrice)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">
                            {formatIDR(rec.sellingPrice)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-600">
                            +{formatIDR(rec.profit)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        </div>
      )}

      {/* TAB 2: PENGELUARAN */}
      {localTab === 'pengeluaran' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="wartel-expenses-view">
          
          {/* Left Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-wider block font-black">Biaya Operasional</span>
              <h3 className="font-black text-slate-900 text-sm">Input Pengeluaran Wartel</h3>
              <p className="text-xs text-slate-400 font-medium">Catat pengeluaran seperti ATK, pulsa operasional, modem internet, pnbp, server</p>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-4 text-xs text-slate-700">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Kategori Biaya</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="atk">ATK / Kebutuhan Kantor</option>
                  <option value="pulsa">Pulsa / Stok Chip</option>
                  <option value="internet">Kebutuhan Internet & Wifi</option>
                  <option value="pnbp">Pajak Retribusi / PNBP Negara</option>
                  <option value="server">Sewa Server & API H2H</option>
                  <option value="lainnya">Beban Operasional Lain-lain</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Nominal Biaya (Rupiah)</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="Contoh: 150000"
                  value={expAmount || ''}
                  onChange={(e) => setExpAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Deskripsi Detail Pengeluaran</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Pembelian kertas struk thermal 10 roll"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              {expError && (
                <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-rose-800 text-[11px] font-semibold flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{expError}</span>
                </div>
              )}
              {expSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>{expSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                Simpan Jurnal Pengeluaran
              </button>
            </form>
          </div>

          {/* Right Log list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Riwayat Buku Pengeluaran</h3>
              <p className="text-xs text-slate-400 font-medium">Buku log pengeluaran sirkulasi unit usaha telekomunikasi</p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Deskripsi</th>
                    <th className="p-3 text-right">Nominal</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Belum ada catatan pengeluaran terekam.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => {
                      const catLabels: Record<string, string> = {
                        atk: 'ATK Kertas',
                        pulsa: 'Pulsa Listrik',
                        internet: 'Internet Wifi',
                        pnbp: 'Retribusi PNBP',
                        server: 'Server H2H',
                        lainnya: 'Lain-lain'
                      };
                      return (
                        <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                            {exp.date.substring(5, 16)}
                          </td>
                          <td className="p-3">
                            <span className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded text-[10px] font-bold">
                              {catLabels[exp.category] || exp.category}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-850">
                            {exp.description}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-red-600">
                            {formatIDR(exp.amount)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1 text-slate-300 hover:text-red-500 cursor-pointer transition-colors"
                              title="Hapus Pengeluaran"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: LAPORAN (LABA RUGI & BAGI HASIL) */}
      {localTab === 'laporan' && (
        <div className="space-y-6 animate-fade-in" id="wartel-laporan-view">
          
          {/* Controls: 4-item Profit Sharing Percentage Configuration */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 print:hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sliders size={18} className="text-blue-600" />
                  <h4 className="font-extrabold text-slate-900 text-sm">Persentase Bagi Hasil Mitra (4 Item)</h4>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Ubah persentase bagi hasil bersih dari unit usaha telekomunikasi (Wartel) untuk masing-masing pihak (semua dapat diedit).</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${totalPercentSum === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'}`}>
                  Total: {totalPercentSum}% {totalPercentSum === 100 ? '✓ Sinkron' : '✗ Harus 100%'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Item 1: Mitra / Vendor */}
              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wide block">1. Mitra / Vendor</label>
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-3xs">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={sharingPercentages.vendor}
                    onChange={(e) => setSharingPercentages(prev => ({ ...prev, vendor: Math.max(0, Number(e.target.value)) }))}
                    className="w-full font-mono font-black text-xs text-blue-700 text-center bg-transparent focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>

              {/* Item 2: Koperasi Primer */}
              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wide block">2. Koperasi Primer</label>
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-3xs">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={sharingPercentages.koperasiPrimer}
                    onChange={(e) => setSharingPercentages(prev => ({ ...prev, koperasiPrimer: Math.max(0, Number(e.target.value)) }))}
                    className="w-full font-mono font-black text-xs text-blue-700 text-center bg-transparent focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>

              {/* Item 3: Inkopasindo */}
              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wide block">3. Inkopasindo</label>
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-3xs">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={sharingPercentages.inkopasindo}
                    onChange={(e) => setSharingPercentages(prev => ({ ...prev, inkopasindo: Math.max(0, Number(e.target.value)) }))}
                    className="w-full font-mono font-black text-xs text-blue-700 text-center bg-transparent focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>

              {/* Item 4: Unit Pengelola / Operator */}
              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wide block">4. Unit Pengelola / Operator</label>
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-3xs">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={sharingPercentages.pengelola}
                    onChange={(e) => setSharingPercentages(prev => ({ ...prev, pengelola: Math.max(0, Number(e.target.value)) }))}
                    className="w-full font-mono font-black text-xs text-blue-700 text-center bg-transparent focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>
            </div>

            {totalPercentSum !== 100 && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-semibold shadow-3xs">
                <AlertCircle size={15} className="text-amber-600 shrink-0" />
                <span>Peringatan: Total dari keempat persentase bagi hasil di atas adalah {totalPercentSum}%. Silakan sesuaikan agar total persentase sama dengan 100% agar perhitungan hasil keuangan tepat.</span>
              </div>
            )}
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 print:hidden">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide font-extrabold block">Akumulasi Omzet</span>
              <span className="text-lg font-mono font-black text-slate-850 block mt-1">{formatIDR(totalRevenue)}</span>
              <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5 leading-tight">Total Penjualan Jasa</span>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide font-extrabold block">Beban HPP</span>
              <span className="text-lg font-mono font-black text-slate-850 block mt-1">{formatIDR(totalCost)}</span>
              <span className="text-[9px] text-red-500 font-semibold block mt-0.5 leading-tight">Beban Kulakan Pulsa/Voucher</span>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide font-extrabold block">Beban Operasional</span>
              <span className="text-lg font-mono font-black text-red-600 block mt-1">{formatIDR(totalExpensesAmount)}</span>
              <span className="text-[9px] text-red-500 font-semibold block mt-0.5 leading-tight">ATK, internet, server, pnbp</span>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs bg-blue-50/50 border-blue-100">
              <span className="text-[10px] text-blue-600 uppercase tracking-wide font-extrabold block">Laba Bersih Bersama</span>
              <span className="text-lg font-mono font-black text-blue-750 block mt-1">{formatIDR(netProfit)}</span>
              <span className="text-[9px] text-blue-600 font-semibold block mt-0.5 leading-tight">Setelah dikurangi beban-beban</span>
            </div>
          </div>

          {/* Printable Report Layout - "Contoh Lapor" style */}
          <div className="bg-white border border-slate-300 p-8 shadow-sm rounded-2xl max-w-3xl mx-auto space-y-6 relative" id="printable-wartel-report">
            {/* Print trigger button */}
            <button
              onClick={() => window.print()}
              className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 text-xs font-bold print:hidden"
            >
              <Printer size={15} />
              Cetak Laporan
            </button>

            {/* Report Header */}
            <div className="text-center space-y-1.5 border-b-2 border-slate-900 pb-4">
              <h2 className="text-md font-black uppercase tracking-wider text-slate-900">Koperasi Karya Mukti</h2>
              <h1 className="text-lg font-black uppercase tracking-tight text-slate-900">Laporan Keuangan Laba / Rugi Unit Telekomunikasi (Wartel)</h1>
              <p className="text-[11px] font-semibold text-slate-500">Periode Pelaporan Terintegrasi Buku Aktif 2026</p>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="space-y-4 text-xs">
              
              {/* Section 1: Income */}
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <h3 className="font-extrabold text-slate-950">I. PENDAPATAN JASA LAYANAN WARTEL</h3>
                  <span className="font-bold text-slate-400 font-mono">RUPIAH</span>
                </div>
                <div className="pl-4 space-y-1.5">
                  <div className="flex justify-between">
                    <span>- Penjualan Pulsa Elektrik</span>
                    <span className="font-mono">{formatIDR(revenueByType('pulsa'))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Penjualan Paket Data</span>
                    <span className="font-mono">{formatIDR(revenueByType('paket_data'))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Jasa Bilik Telepon</span>
                    <span className="font-mono">{formatIDR(revenueByType('telepon'))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Voucher Game Online</span>
                    <span className="font-mono">{formatIDR(revenueByType('voucher_game'))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Layanan Telekomunikasi Lainnya</span>
                    <span className="font-mono">{formatIDR(revenueByType('lainnya'))}</span>
                  </div>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold pl-4">
                  <span>TOTAL PENDAPATAN JASA KOTOR:</span>
                  <span className="font-mono text-slate-900">{formatIDR(totalRevenue)}</span>
                </div>
              </div>

              {/* Section 2: HPP */}
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <h3 className="font-extrabold text-slate-950">II. HARGA POKOK PENJUALAN (HPP) / MODAL LAYANAN</h3>
                </div>
                <div className="pl-4 space-y-1.5">
                  <div className="flex justify-between">
                    <span>- Pembelian Stok Chip Pulsa / Operator</span>
                    <span className="font-mono text-slate-500">({formatIDR(totalCost)})</span>
                  </div>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 font-black pl-4 bg-slate-50/50 p-1">
                  <span>LABA KOTOR OPERASIONAL WARTEL (Gross Margin):</span>
                  <span className="font-mono text-emerald-700">{formatIDR(grossProfit)}</span>
                </div>
              </div>

              {/* Section 3: Expenses */}
              <div className="space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <h3 className="font-extrabold text-slate-950">III. BIAYA - BIAYA OPERASIONAL UNIT</h3>
                </div>
                <div className="pl-4 space-y-1.5 text-red-700">
                  <div className="flex justify-between">
                    <span className="text-slate-700">- Biaya Alat Tulis Kantor (ATK) & Kertas Struk</span>
                    <span className="font-mono">({formatIDR(expenseByCategory('atk'))})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">- Biaya Kuota Pulsa & Stok Operasional</span>
                    <span className="font-mono">({formatIDR(expenseByCategory('pulsa'))})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">- Biaya Langganan Jaringan Internet & Wifi</span>
                    <span className="font-mono">({formatIDR(expenseByCategory('internet'))})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">- Biaya Setoran PNBP Retribusi Telekomunikasi</span>
                    <span className="font-mono">({formatIDR(expenseByCategory('pnbp'))})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">- Biaya Sewa Server / API Gateway H2H</span>
                    <span className="font-mono">({formatIDR(expenseByCategory('server'))})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">- Biaya Pengeluaran Lain-lain</span>
                    <span className="font-mono">({formatIDR(expenseByCategory('lainnya'))})</span>
                  </div>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold pl-4">
                  <span>TOTAL BIAYA OPERASIONAL UNIT:</span>
                  <span className="font-mono text-red-600">({formatIDR(totalExpensesAmount)})</span>
                </div>
              </div>

              {/* Section 4: Laba Bersih */}
              <div className="border-t-2 border-slate-900 pt-2.5 space-y-2">
                <div className="flex justify-between font-black text-sm p-1.5 bg-blue-50 text-blue-950 rounded-lg">
                  <span>IV. SISA MARGIN KEUNTUNGAN BERSIH (Net Income):</span>
                  <span className="font-mono decoration-double underline">{formatIDR(netProfit)}</span>
                </div>
              </div>

              {/* Section 5: Profit Sharing Calculation */}
              <div className="space-y-2 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
                <h4 className="font-extrabold text-slate-900 text-xs">V. PERHITUNGAN REPARTISI BAGI HASIL UNIT (4 ITEM)</h4>
                <div className="space-y-2 pl-2 text-[11px]">
                  <div className="flex justify-between font-semibold">
                    <span>1. Hak Mitra / Vendor (Porsi {sharingPercentages.vendor}%)</span>
                    <span className="font-mono text-slate-800 font-bold">{formatIDR(vendorShare)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>2. Hak Koperasi Primer (Porsi {sharingPercentages.koperasiPrimer}%)</span>
                    <span className="font-mono text-slate-800 font-bold">{formatIDR(coopPrimerShare)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>3. Hak Inkopasindo (Porsi {sharingPercentages.inkopasindo}%)</span>
                    <span className="font-mono text-slate-800 font-bold">{formatIDR(inkopasindoShare)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>4. Hak Unit Pengelola / Operator (Porsi {sharingPercentages.pengelola}%)</span>
                    <span className="font-mono text-slate-800 font-bold">{formatIDR(pengelolaShare)}</span>
                  </div>
                  {totalPercentSum !== 100 && (
                    <div className="border-t border-rose-200 pt-1.5 text-rose-600 font-extrabold text-[10px] flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>* Peringatan: Total persentase ({totalPercentSum}%) tidak sama dengan 100%. Laba rekap tidak sinkron.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Signatures Section / Lembar Pengesahan */}
            <div className="pt-10 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-800">
              <div className="space-y-12">
                <span>Dibuat Oleh,<br /><strong>Staff / Operator Unit</strong></span>
                <div className="space-y-0.5">
                  <div className="w-2/3 mx-auto border-b border-slate-900"></div>
                  <span className="text-[9px] text-slate-400">Pencatat Keuangan</span>
                </div>
              </div>
              <div className="space-y-12">
                <span>Diperiksa Oleh,<br /><strong>Bendahara Koperasi</strong></span>
                <div className="space-y-0.5">
                  <div className="w-2/3 mx-auto border-b border-slate-900"></div>
                  <span className="text-[9px] text-slate-400">Hendra Wijaya</span>
                </div>
              </div>
              <div className="space-y-12">
                <span>Mengetahui,<br /><strong>Ketua Koperasi</strong></span>
                <div className="space-y-0.5">
                  <div className="w-2/3 mx-auto border-b border-slate-900"></div>
                  <span className="text-[9px] text-slate-400">Danang Andriyanto</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal Edit Produk Sinkronisasi */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="text-blue-600" size={18} />
                <h3 className="font-extrabold text-slate-900 text-sm">Update Nilai & Stok Produk</h3>
              </div>
              <button 
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 font-extrabold text-lg"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSaveProductEdit} className="p-6 space-y-4 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 block">Kode Barang</label>
                <div className="p-2.5 bg-slate-100 border border-slate-150 rounded-lg text-slate-600 font-mono font-bold">
                  {editingProduct.code}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Nama Barang / Layanan</label>
                <input
                  type="text"
                  required
                  value={editProductName}
                  onChange={(e) => setEditProductName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Stok Barang ({editingProduct.unit})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Satuan Unit</label>
                  <div className="p-2.5 bg-slate-100 border border-slate-150 rounded-lg text-slate-600 font-bold">
                    {editingProduct.unit}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Harga Pokok (Modal)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Harga Jual</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/60 text-[10px] text-blue-800 leading-relaxed">
                Perubahan ini akan memperbarui data master barang di <strong>Etalase Ritel & POS Kasir</strong> dan merevisi nilai sirkulasi secara otomatis.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer transition-colors text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer transition-colors text-center"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
