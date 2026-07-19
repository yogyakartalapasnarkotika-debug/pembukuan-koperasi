import React, { useState } from 'react';
import { Member, PertokoanProduct, PertokoanSale, PertokoanSaleItem, WartelRecord } from '../types';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Coins, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Package,
  ArrowUpRight,
  Sparkles,
  Ticket,
  Check,
  TrendingUp,
  TrendingDown,
  User,
  Sliders,
  DollarSign,
  X,
  PhoneCall,
  Smartphone,
  Gamepad2,
  Database,
  Layers
} from 'lucide-react';

interface PertokoanUnitProps {
  members: Member[];
  products: PertokoanProduct[];
  sales: PertokoanSale[];
  wartelRecords?: WartelRecord[];
  onAddSale: (newSale: PertokoanSale) => void;
  onUpdateProductStock: (productId: string, quantityToDeduct: number) => void;
  activeSubTab?: string;
  onGenerateVouchers?: (amount: number) => void;
  onAddTransaction?: (tx: any) => void;
  onAddProduct: (newProduct: PertokoanProduct) => void;
  onEditProduct: (updatedProduct: PertokoanProduct) => void;
  onDeleteProduct: (productId: string) => void;
}

interface BagiHasilToko {
  id: string;
  date: string;
  type: 'pendapatan' | 'pengeluaran';
  amount: number;
  partnerName: string;
  description: string;
}

export default function PertokoanUnit({
  members,
  products,
  sales,
  wartelRecords = [],
  onAddSale,
  onUpdateProductStock,
  activeSubTab = 'order',
  onGenerateVouchers,
  onAddTransaction,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}: PertokoanUnitProps) {
  // --- Local sub-navigation tab ---
  const [localTab, setLocalTab] = useState<'order' | 'master_barang' | 'generate_voucher' | 'laporan' | 'bagi_hasil' | 'penjualan_wartel'>(activeSubTab as any || 'order');

  // Sync with parent sidebar navigation changes
  React.useEffect(() => {
    if (['order', 'master_barang', 'generate_voucher', 'laporan', 'bagi_hasil', 'penjualan_wartel'].includes(activeSubTab)) {
      setLocalTab(activeSubTab as any);
    }
  }, [activeSubTab]);
  
  // --- POS Cashier States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ product: PertokoanProduct; quantity: number }[]>([]);
  const [customerType, setCustomerType] = useState<'guest' | 'member'>('guest');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'deposit'>('cash');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // --- Voucher Generator States ---
  const [selectedMonth, setSelectedMonth] = useState('Juli');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [voucherNotes, setVoucherNotes] = useState('Voucher Belanja Bulanan');
  const [voucherSuccess, setVoucherSuccess] = useState('');

  // --- Third Party Bagi Hasil States ---
  const [bagiHasilRecords, setBagiHasilRecords] = useState<BagiHasilToko[]>(() => {
    const saved = localStorage.getItem('kop_toko_bagi_hasil');
    return saved ? JSON.parse(saved) : [
      { id: 'bh-1', date: '2026-07-15 09:00:00', type: 'pendapatan', amount: 1500000, partnerName: 'CV. Sinar Abadi (Vendor Mart)', description: 'Bagi hasil keuntungan penjualan mingguan minimarket' },
      { id: 'bh-2', date: '2026-07-16 11:30:00', type: 'pengeluaran', amount: 300000, partnerName: 'CV. Sinar Abadi (Vendor Mart)', description: 'Beban maintenance mesin barcode POS kasir toko' }
    ];
  });

  // Bagi hasil form state
  const [bhType, setBhType] = useState<'pendapatan' | 'pengeluaran'>('pendapatan');
  const [bhPartner, setBhPartner] = useState('CV. Sinar Abadi (Vendor Mart)');
  const [bhAmount, setBhAmount] = useState<number>(0);
  const [bhDesc, setBhDesc] = useState('');
  const [bhError, setBhError] = useState('');
  const [bhSuccess, setBhSuccess] = useState('');

  // Sync bagi hasil to local storage
  React.useEffect(() => {
    localStorage.setItem('kop_toko_bagi_hasil', JSON.stringify(bagiHasilRecords));
  }, [bagiHasilRecords]);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // --- Product CRUD States & Handlers ---
  const [showProductForm, setShowProductForm] = useState<'none' | 'add' | 'edit'>('none');
  const [productFormId, setProductFormId] = useState('');
  const [productFormCode, setProductFormCode] = useState('');
  const [productFormName, setProductFormName] = useState('');
  const [productFormCategory, setProductFormCategory] = useState('Sembako');
  const [productFormStock, setProductFormStock] = useState<number>(0);
  const [productFormCost, setProductFormCost] = useState<number>(0);
  const [productFormSelling, setProductFormSelling] = useState<number>(0);
  const [productFormUnit, setProductFormUnit] = useState('pcs');
  const [productFormError, setProductFormError] = useState('');
  const [productFormSuccess, setProductFormSuccess] = useState('');

  const handleOpenAddProduct = () => {
    setProductFormError('');
    setProductFormSuccess('');
    setProductFormId('');
    
    // Generate a secure, sequential-like next product code starting with PRD-
    const nextCodeNum = products.length > 0 ? Math.max(...products.map(p => {
      const parsed = parseInt(p.code.replace('PRD-', ''));
      return isNaN(parsed) ? 0 : parsed;
    })) + 1 : 101;
    
    setProductFormCode(`PRD-${nextCodeNum}`);
    setProductFormName('');
    setProductFormCategory('Sembako');
    setProductFormStock(10);
    setProductFormCost(5000);
    setProductFormSelling(6000);
    setProductFormUnit('pcs');
    setShowProductForm('add');
  };

  const handleOpenEditProduct = (prod: PertokoanProduct) => {
    setProductFormError('');
    setProductFormSuccess('');
    setProductFormId(prod.id);
    setProductFormCode(prod.code);
    setProductFormName(prod.name);
    setProductFormCategory(prod.category);
    setProductFormStock(prod.stock);
    setProductFormCost(prod.costPrice);
    setProductFormSelling(prod.sellingPrice);
    setProductFormUnit(prod.unit);
    setShowProductForm('edit');
  };

  const handleConfirmDeleteProduct = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}" dari Master Barang?`)) {
      onDeleteProduct(id);
    }
  };

  const handleProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError('');
    setProductFormSuccess('');

    if (!productFormCode.trim()) {
      setProductFormError('Kode barang tidak boleh kosong!');
      return;
    }
    if (!productFormName.trim()) {
      setProductFormError('Nama produk tidak boleh kosong!');
      return;
    }
    if (productFormCost < 0 || productFormSelling < 0) {
      setProductFormError('Harga pokok dan harga jual tidak boleh negatif!');
      return;
    }
    if (productFormStock < 0) {
      setProductFormError('Stok gudang tidak boleh negatif!');
      return;
    }

    if (showProductForm === 'add') {
      if (products.some(p => p.code.toLowerCase() === productFormCode.trim().toLowerCase())) {
        setProductFormError('Kode barang sudah terdaftar untuk produk lain!');
        return;
      }

      const newProd: PertokoanProduct = {
        id: `prd-${Date.now()}`,
        code: productFormCode.trim(),
        name: productFormName.trim(),
        category: productFormCategory,
        stock: Number(productFormStock),
        costPrice: Number(productFormCost),
        sellingPrice: Number(productFormSelling),
        unit: productFormUnit.trim() || 'pcs'
      };

      onAddProduct(newProd);
      setProductFormSuccess('Berhasil menambahkan produk baru ke Master Barang!');
      setTimeout(() => setShowProductForm('none'), 1500);
    } else if (showProductForm === 'edit') {
      if (products.some(p => p.id !== productFormId && p.code.toLowerCase() === productFormCode.trim().toLowerCase())) {
        setProductFormError('Kode barang sudah terdaftar untuk produk lain!');
        return;
      }

      const updatedProd: PertokoanProduct = {
        id: productFormId,
        code: productFormCode.trim(),
        name: productFormName.trim(),
        category: productFormCategory,
        stock: Number(productFormStock),
        costPrice: Number(productFormCost),
        sellingPrice: Number(productFormSelling),
        unit: productFormUnit.trim() || 'pcs'
      };

      onEditProduct(updatedProd);
      setProductFormSuccess('Berhasil memperbarui data produk!');
      setTimeout(() => setShowProductForm('none'), 1500);
    }
  };

  // --- Filtered products for POS ---
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMember = members.find(m => m.memberId === selectedMemberId);

  // --- Cart Calculations ---
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
  const cartTotalProfit = cart.reduce((sum, item) => {
    const itemMargin = item.product.sellingPrice - item.product.costPrice;
    return sum + (itemMargin * item.quantity);
  }, 0);

  // --- POS Cart Operations ---
  const handleAddToCart = (product: PertokoanProduct) => {
    if (product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Limit to available stock
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) return item; // limit to stock
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as { product: PertokoanProduct; quantity: number }[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // --- POS Checkout Submit ---
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (cart.length === 0) {
      setErrorMsg('Keranjang belanja kosong! Tambahkan barang terlebih dahulu.');
      return;
    }
    if (customerType === 'member' && !selectedMemberId) {
      setErrorMsg('Pilih ID Anggota pembeli!');
      return;
    }
    if (customerType === 'member' && !activeMember) {
      setErrorMsg('Anggota tidak ditemukan!');
      return;
    }
    if (customerType === 'guest' && !guestName) {
      setErrorMsg('Masukkan nama pembeli umum!');
      return;
    }

    // Verify member balance for deposit billing
    if (customerType === 'member' && activeMember && paymentMethod === 'deposit') {
      if (activeMember.savings.sukarela < cartTotal) {
        setErrorMsg(`Simpanan Sukarela Anggota tidak mencukupi untuk pembayaran potong saldo! (Sisa: ${formatIDR(activeMember.savings.sukarela)})`);
        return;
      }
    }

    // Prepare sale items
    const saleItems: PertokoanSaleItem[] = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.sellingPrice,
      subtotal: item.product.sellingPrice * item.quantity
    }));

    const finalCustName = customerType === 'member' && activeMember ? activeMember.name : guestName;

    const newSale: PertokoanSale = {
      id: `sale-${Date.now()}`,
      invoiceNumber: `INV-TK-${Date.now().toString().substring(7)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      customerName: finalCustName,
      memberId: customerType === 'member' ? selectedMemberId : undefined,
      items: saleItems,
      totalAmount: cartTotal,
      profit: cartTotalProfit,
      paymentMethod
    };

    // Callback to App component state
    onAddSale(newSale);

    // Sync to main cooperative Cash Ledger
    if (onAddTransaction) {
      onAddTransaction({
        id: `tx-toko-${Date.now()}`,
        date: newSale.date,
        type: 'kas_masuk',
        amount: cartTotal,
        category: 'Toko - POS Kasir',
        description: `Penjualan Retail - ${newSale.invoiceNumber} - ${finalCustName}`,
        unit: 'pertokoan',
        paymentMethod: paymentMethod === 'cash' ? 'tunai' : 'transfer'
      });
      // Deduct cost of products as cost of goods sold (HPP)
      const costTotal = cart.reduce((sum, item) => sum + (item.product.costPrice * item.quantity), 0);
      if (costTotal > 0) {
        onAddTransaction({
          id: `tx-toko-hpp-${Date.now()}`,
          date: newSale.date,
          type: 'kas_keluar',
          amount: costTotal,
          category: 'Toko - HPP Retail',
          description: `HPP untuk penjualan ${newSale.invoiceNumber}`,
          unit: 'pertokoan',
          paymentMethod: 'tunai'
        });
      }
    }

    // Deduct stocks
    cart.forEach(item => {
      onUpdateProductStock(item.product.id, item.quantity);
    });

    setSuccessMsg(`Transaksi checkout selesai! Invoice ${newSale.invoiceNumber} senilai ${formatIDR(cartTotal)} terekam.`);
    setCart([]);
    setSelectedMemberId('');
    setGuestName('');
  };

  // --- Voucher Generator Submit ---
  const handleVoucherGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherSuccess('');

    // Hardcoded amount Rp 230.000 x 6 members = Rp 1.380.000
    if (onGenerateVouchers) {
      onGenerateVouchers(1380000);
    }

    setVoucherSuccess(`Sukses men-generate Voucher Belanja periode ${selectedMonth} ${selectedYear} senilai total Rp 1.380.000 (Rp 230.000 per Anggota) untuk seluruh Anggota Koperasi!`);
  };

  // --- Bagi Hasil Form Submit ---
  const handleBhSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBhError('');
    setBhSuccess('');

    if (bhAmount <= 0 || !bhPartner.trim() || !bhDesc.trim()) {
      setBhError('Semua kolom wajib diisi dengan valid!');
      return;
    }

    const newRecord: BagiHasilToko = {
      id: `bh-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: bhType,
      amount: Number(bhAmount),
      partnerName: bhPartner.trim(),
      description: bhDesc.trim()
    };

    setBagiHasilRecords(prev => [newRecord, ...prev]);

    // Register with main cooperative general ledger
    if (onAddTransaction) {
      onAddTransaction({
        id: `tx-toko-bh-${Date.now()}`,
        date: newRecord.date,
        type: bhType === 'pendapatan' ? 'kas_masuk' : 'kas_keluar',
        amount: Number(bhAmount),
        category: `Toko - Bagi Hasil ${bhType.toUpperCase()}`,
        description: `Bagi Hasil Kemitraan: ${bhDesc.trim()} (${bhPartner.trim()})`,
        unit: 'pertokoan',
        paymentMethod: 'tunai'
      });
    }

    setBhSuccess(`Sukses merekam transaksi bagi hasil ${bhType.toUpperCase()} senilai ${formatIDR(bhAmount)}!`);
    setBhAmount(0);
    setBhDesc('');
  };

  const handleBhDelete = (id: string) => {
    setBagiHasilRecords(prev => prev.filter(r => r.id !== id));
  };

  // Calculations for Bagi Hasil
  const totalBhIn = bagiHasilRecords.filter(r => r.type === 'pendapatan').reduce((sum, r) => sum + r.amount, 0);
  const totalBhOut = bagiHasilRecords.filter(r => r.type === 'pengeluaran').reduce((sum, r) => sum + r.amount, 0);
  const netBhCoop = totalBhIn - totalBhOut;

  return (
    <div className="space-y-6" id="pertokoan-panel">
      
      {/* Local Sub-tab Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex gap-1 shadow-3xs print:hidden overflow-x-auto">
        {[
          { id: 'order', label: 'Kasir & Order (POS)', icon: ShoppingCart },
          { id: 'master_barang', label: 'Master Barang Toko', icon: Package },
          { id: 'generate_voucher', label: 'Voucher Belanja', icon: Ticket },
          { id: 'penjualan_wartel', label: 'Penjualan Produk Wartel (Sync)', icon: Coins },
          { id: 'bagi_hasil', label: 'Bagi Hasil Pihak ke-3', icon: Sliders },
          { id: 'laporan', label: 'Laporan Penjualan', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = localTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setLocalTab(tab.id as any)}
              className={`py-2 px-3.5 rounded-lg font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                isSelected 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. Generate Voucher Sub-tab */}
      {localTab === 'generate_voucher' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" id="toko-tab-generate-voucher">
          {/* Left: Generator Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider block">Insentif Kesejahteraan</span>
              <h3 className="font-black text-slate-900 text-base">Penjatahan Voucher Belanja Bulanan</h3>
              <p className="text-xs text-slate-400 font-medium">Generate voucher belanja bulanan otomatis untuk memicu omzet toko koperasi</p>
            </div>

            <form onSubmit={handleVoucherGenerate} className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Bulan</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                  >
                    <option value="Januari">Januari</option>
                    <option value="Februari">Februari</option>
                    <option value="Maret">Maret</option>
                    <option value="April">April</option>
                    <option value="Mei">Mei</option>
                    <option value="Juni">Juni</option>
                    <option value="Juli">Juli</option>
                    <option value="Agustus">Agustus</option>
                    <option value="September">September</option>
                    <option value="Oktober">Oktober</option>
                    <option value="November">November</option>
                    <option value="Desember">Desember</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Tahun</label>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Keterangan / Notes</label>
                <input
                  type="text"
                  value={voucherNotes}
                  onChange={(e) => setVoucherNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  placeholder="Keterangan voucher..."
                />
              </div>

              {/* Summary calculations */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Batas Nominal per Anggota:</span>
                  <span className="font-mono font-extrabold text-blue-900">{formatIDR(230000)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Jumlah Anggota Aktif:</span>
                  <span className="font-mono font-extrabold text-blue-900">{members.length} Orang</span>
                </div>
                <div className="border-t border-blue-100 pt-2 flex justify-between items-center text-xs font-bold text-blue-950">
                  <span>Estimasi Total Subsidi Voucher:</span>
                  <span className="font-mono font-black text-sm">{formatIDR(230000 * members.length)}</span>
                </div>
              </div>

              {voucherSuccess && (
                <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 p-3 rounded-lg text-[11px] font-semibold flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                  <span>{voucherSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles size={16} />
                Generate Voucher Anggota ({formatIDR(1380000)})
              </button>
            </form>
          </div>

          {/* Right: Description of terms */}
          <div className="bg-slate-900 text-slate-300 border border-slate-800 rounded-2xl p-6.5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-blue-400 font-extrabold uppercase block tracking-wider font-black">Regulasi Koperasi</span>
                <h3 className="text-white font-extrabold text-base">Syarat Penarikan Voucher Belanja</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="p-1 rounded bg-blue-950 text-blue-400 font-bold text-[9px] mt-0.5">1</span>
                  <span>Setiap awal bulan koperasi mengalokasikan stimulus subsidi sebesar <strong>Rp 230.000 per anggota</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="p-1 rounded bg-blue-950 text-blue-400 font-bold text-[9px] mt-0.5">2</span>
                  <span>Voucher otomatis masuk dan meng-kredit saldo <strong>Simpanan Sukarela Anggota</strong> untuk langsung dibelanjakan di toko.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="p-1 rounded bg-blue-950 text-blue-400 font-bold text-[9px] mt-0.5">3</span>
                  <span>Belanja dengan voucher menggunakan metode pembayaran <strong>Potong Saldo (Deposit)</strong> saat checkout POS Kasir.</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Kondisi Kasir Saat Ini:</span>
              <span className="text-xs text-slate-300">Seluruh anggota koperasi memiliki total simpanan sukarela aktif yang siap dibelanjakan.</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Master Barang Sub-tab */}
      {localTab === 'master_barang' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fade-in" id="toko-tab-master">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Gudang & Master Barang Toko</h3>
              <p className="text-xs text-slate-400 font-medium">Buku pantau stok ritel dan margin keuntungan per barang</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Input bar */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kode atau nama barang..."
                  className="pl-9 pr-4 py-2 w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              {/* Tambah Produk Button */}
              <button
                onClick={handleOpenAddProduct}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-3xs transition-colors whitespace-nowrap"
              >
                <Plus size={14} />
                Tambah Produk
              </button>
            </div>
          </div>

          {/* Inline Product Form for Add/Edit */}
          {showProductForm !== 'none' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                  {showProductForm === 'add' ? 'Tambah Produk Baru' : 'Edit Produk / Barang'}
                </h4>
                <button
                  onClick={() => setShowProductForm('none')}
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleProductFormSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-700">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Kode Barang</label>
                  <input
                    type="text"
                    required
                    value={productFormCode}
                    onChange={(e) => setProductFormCode(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-850 font-mono font-bold"
                    placeholder="CONTOH: PRD-101"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-slate-600 block">Nama Produk / Barang</label>
                  <input
                    type="text"
                    required
                    value={productFormName}
                    onChange={(e) => setProductFormName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-850 font-semibold"
                    placeholder="Contoh: Beras Pandan Wangi 5kg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Kategori</label>
                  <select
                    value={productFormCategory}
                    onChange={(e) => setProductFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-850 font-semibold"
                  >
                    <option value="Sembako">Sembako</option>
                    <option value="Makanan & Minuman">Makanan & Minuman</option>
                    <option value="Kebutuhan Harian">Kebutuhan Harian</option>
                    <option value="Alat Tulis & Kantor">Alat Tulis & Kantor</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Stok Gudang</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productFormStock}
                    onChange={(e) => setProductFormStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-850 font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Satuan Barang</label>
                  <input
                    type="text"
                    required
                    value={productFormUnit}
                    onChange={(e) => setProductFormUnit(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-850 font-semibold"
                    placeholder="Contoh: pcs, kg, box, sachet"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Harga Pokok (Modal) Rp</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productFormCost}
                    onChange={(e) => setProductFormCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-850 font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Harga Jual Rp</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productFormSelling}
                    onChange={(e) => setProductFormSelling(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-850 font-mono font-bold text-blue-750"
                  />
                </div>

                {productFormError && (
                  <div className="md:col-span-4 bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-rose-800 font-semibold flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-rose-600" />
                    <span>{productFormError}</span>
                  </div>
                )}

                {productFormSuccess && (
                  <div className="md:col-span-4 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-emerald-800 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>{productFormSuccess}</span>
                  </div>
                )}

                <div className="md:col-span-4 flex justify-end gap-2 border-t border-slate-200 pt-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowProductForm('none')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Package size={14} />
                    {showProductForm === 'add' ? 'Simpan Produk Baru' : 'Perbarui Produk'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Master Table Grid */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-3">Kode Barang</th>
                  <th className="p-3">Nama Produk</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-right">Harga Pokok (Modal)</th>
                  <th className="p-3 text-right">Harga Jual</th>
                  <th className="p-3 text-right">Keuntungan (Margin)</th>
                  <th className="p-3 text-center">Stok Gudang</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Tidak ada barang/produk yang sesuai kata pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const margin = prod.sellingPrice - prod.costPrice;
                    const isOutOfStock = prod.stock <= 0;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-mono text-[10px] text-slate-500 font-semibold">{prod.code}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-850 block">{prod.name}</span>
                          <span className="text-[9px] text-slate-400 block">{prod.unit}</span>
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {prod.category}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-500">{formatIDR(prod.costPrice)}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-850">{formatIDR(prod.sellingPrice)}</td>
                        <td className="p-3 text-right font-mono font-semibold text-emerald-600">
                          +{formatIDR(margin)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            isOutOfStock 
                              ? 'bg-red-50 text-red-700 border border-red-100' 
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {prod.stock} {prod.unit}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                              title="Edit Produk"
                            >
                              <Sliders size={13} />
                            </button>
                            <button
                              onClick={() => handleConfirmDeleteProduct(prod.id, prod.name)}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                              title="Hapus Produk"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
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

      {/* 3. Kasir & Order POS Sub-tab */}
      {localTab === 'order' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="toko-tab-pos">
          
          {/* Left Column: Product Picker */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-150 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Etalase Ritel & POS Kasir</h3>
                <p className="text-xs text-slate-400 font-medium">Klik produk ritel di bawah untuk memasukkan ke keranjang belanjaan pembeli</p>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Search size={13} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari barang..."
                  className="pl-8 pr-3 py-1.5 w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => {
                const isInCart = cart.find(item => item.product.id === prod.id);
                const isOutOfStock = prod.stock <= 0;
                return (
                  <button
                    key={prod.id}
                    onClick={() => handleAddToCart(prod)}
                    disabled={isOutOfStock}
                    className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer group ${
                      isInCart 
                        ? 'border-blue-600 bg-blue-50/50' 
                        : 'border-slate-150 hover:border-slate-350 bg-slate-50/20 hover:bg-slate-50/50'
                    } disabled:opacity-50`}
                  >
                    <div className="space-y-1 w-2/3">
                      <span className="text-[10px] font-mono text-slate-400 font-bold block">{prod.code}</span>
                      <span className="font-extrabold text-xs text-slate-850 block leading-snug group-hover:text-blue-900 truncate">
                        {prod.name}
                      </span>
                      <span className="font-mono text-xs font-black text-slate-900 block">{formatIDR(prod.sellingPrice)}</span>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className="text-[9px] text-slate-400 font-medium">{prod.category}</span>
                      <span className={`px-2 py-0.2 rounded font-mono text-[9px] font-extrabold border ${
                        isOutOfStock 
                          ? 'bg-rose-50 text-rose-700 border-rose-150' 
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        Stok: {prod.stock}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Cart Checkout */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Struk Checkout POS</h3>
                <p className="text-xs text-slate-400 font-medium">Buku draf item keranjang belanja</p>
              </div>
              <ShoppingCart size={18} className="text-blue-600" />
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-1">
                <p className="font-bold text-xs">Keranjang Belanja Kosong</p>
                <p className="text-[10px] text-slate-400">Pilih barang ritel di etalase kiri</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex justify-between items-center gap-2">
                      <div className="space-y-0.5 w-1/2">
                        <span className="font-extrabold text-slate-800 block truncate">{item.product.name}</span>
                        <span className="font-mono text-[10px] text-slate-500 font-bold block">
                          {formatIDR(item.product.sellingPrice)} / {item.product.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.product.id, -1)}
                          className="p-1 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 cursor-pointer"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="font-mono font-black text-xs text-slate-800 w-5 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.product.id, 1)}
                          className="p-1 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 cursor-pointer"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="text-slate-350 hover:text-red-500 cursor-pointer transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Subtotals card */}
                <div className="border-t border-slate-200 pt-3 space-y-1.5 font-semibold text-slate-700">
                  <div className="flex justify-between items-center text-xs">
                    <span>Jumlah Total Transaksi:</span>
                    <span className="font-mono font-black text-slate-900 text-sm">{formatIDR(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-emerald-600">
                    <span>Estimasi Profit Toko:</span>
                    <span className="font-mono font-bold">+{formatIDR(cartTotalProfit)}</span>
                  </div>
                </div>

                {/* Checkout Buyer Form */}
                <form onSubmit={handleCheckout} className="border-t border-slate-150 pt-3 space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block mb-1">Kategori Pembeli</label>
                    <div className="bg-slate-100 p-0.5 rounded-lg flex text-[10px]">
                      <button
                        type="button"
                        onClick={() => setCustomerType('guest')}
                        className={`flex-1 py-1 text-center rounded font-bold transition-all cursor-pointer ${
                          customerType === 'guest' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500'
                        }`}
                      >
                        Pelanggan Umum
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerType('member')}
                        className={`flex-1 py-1 text-center rounded font-bold transition-all cursor-pointer ${
                          customerType === 'member' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500'
                        }`}
                      >
                        Anggota Koperasi
                      </button>
                    </div>
                  </div>

                  {customerType === 'member' ? (
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block mb-0.5">Nama / ID Anggota</label>
                        <select
                          required
                          value={selectedMemberId}
                          onChange={(e) => setSelectedMemberId(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                        >
                          <option value="">-- Pilih ID Anggota --</option>
                          {members.map(m => (
                            <option key={m.id} value={m.memberId}>
                              {m.memberId} - {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block mb-0.5">Metode Billing</label>
                        <div className="bg-slate-100 p-0.5 rounded-lg flex text-[9px]">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('cash')}
                            className={`flex-1 py-1.5 text-center rounded font-bold transition-all cursor-pointer ${
                              paymentMethod === 'cash' ? 'bg-blue-600 text-white shadow-3xs' : 'text-slate-500'
                            }`}
                          >
                            Tunai (Cash)
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('deposit')}
                            className={`flex-1 py-1.5 text-center rounded font-bold transition-all cursor-pointer ${
                              paymentMethod === 'deposit' ? 'bg-indigo-600 text-white shadow-3xs' : 'text-slate-500'
                            }`}
                          >
                            Potong Voucher (Tabung)
                          </button>
                        </div>
                        {paymentMethod === 'deposit' && activeMember && (
                          <div className="text-[10px] text-blue-700 font-bold mt-1">
                            Saldo Tabungan Sukarela: {formatIDR(activeMember.savings.sukarela)}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 block mb-0.5">Nama Pembeli Umum</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Bpk Budi"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                      />
                    </div>
                  )}

                  {errorMsg && (
                    <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-rose-850 font-semibold flex items-center gap-1.5">
                      <AlertCircle size={14} className="flex-shrink-0 text-rose-500" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                  {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-emerald-800 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="flex-shrink-0 text-emerald-600" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Check size={16} />
                    Selesaikan Pembelian
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Riwayat Nota Belanja Sub-tab */}
      {localTab === 'laporan' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fade-in" id="toko-tab-riwayat">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Riwayat Nota Belanja (Invoices)</h3>
              <p className="text-xs text-slate-400 font-medium font-bold font-sans">Log riwayat transaksi checkout mesin kasir pertokoan</p>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
              {sales.length} Nota Selesai
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs" id="riwayat-table-container">
            <table className="w-full text-left border-collapse" id="riwayat-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-3">No. Nota</th>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Pembeli / Anggota</th>
                  <th className="p-3">Daftar Barang Belanjaan</th>
                  <th className="p-3 text-right">Metode</th>
                  <th className="p-3 text-right font-bold text-slate-800">Total Belanja</th>
                  <th className="p-3 text-right font-bold text-blue-700">Laba Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Belum ada nota penjualan toko terekam.
                    </td>
                  </tr>
                ) : (
                  sales.slice().reverse().map(sale => (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-800">{sale.invoiceNumber}</td>
                      <td className="p-3 whitespace-nowrap font-mono text-[10px] text-slate-500">
                        {sale.date.substring(5, 16)}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800 block">{sale.customerName}</span>
                        {sale.memberId ? (
                          <span className="font-mono text-[9px] font-bold text-blue-600 block">{sale.memberId}</span>
                        ) : (
                          <span className="text-[9px] text-slate-400 block">Umum</span>
                        )}
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="space-y-0.5">
                          {sale.items.map((item, idx) => (
                            <div key={idx} className="text-[10px] text-slate-500 truncate flex justify-between">
                              <span>• {item.name} ({item.quantity}x)</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium text-[10px] uppercase text-slate-500">
                        {sale.paymentMethod === 'deposit' ? 'VOUCHER' : 'TUNAI'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-850">
                        {formatIDR(sale.totalAmount)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-blue-600">
                        +{formatIDR(sale.profit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. BAGI HASIL PIHAK KETIGA SUB-TAB (NEW!) */}
      {localTab === 'bagi_hasil' && (
        <div className="space-y-6 animate-fade-in" id="toko-tab-bagi-hasil">
          
          {/* Summary metrics of Bagi Hasil */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide font-extrabold block">Bagi Hasil Masuk (Pendapatan)</span>
              <span className="text-xl font-mono font-black text-emerald-600 block mt-1">{formatIDR(totalBhIn)}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Penerimaan kas bagi hasil ritel dari pihak ketiga</span>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide font-extrabold block">Bagi Hasil Keluar (Pengeluaran/Beban)</span>
              <span className="text-xl font-mono font-black text-red-600 block mt-1">{formatIDR(totalBhOut)}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Beban sirkulasi kemitraan pengelolaan toko</span>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs bg-blue-50/50 border-blue-100">
              <span className="text-[10px] text-blue-600 uppercase tracking-wide font-extrabold block">Sisa Bagi Hasil Bersih Koperasi</span>
              <span className="text-xl font-mono font-black text-blue-750 block mt-1">{formatIDR(netBhCoop)}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Kontribusi bersih kemitraan ritel untuk koperasi</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Input Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] text-blue-600 font-extrabold uppercase block font-black">Input Rekap Jurnal Kemitraan</span>
                <h3 className="font-black text-slate-900 text-sm">Bagi Hasil Pengelolaan</h3>
                <p className="text-xs text-slate-400 font-medium font-sans">Catat pendapatan atau pengeluaran bagi hasil toko dengan pihak ketiga</p>
              </div>

              <form onSubmit={handleBhSubmit} className="space-y-4 text-xs text-slate-700">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Jenis Aliran Dana</label>
                  <select
                    value={bhType}
                    onChange={(e) => setBhType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="pendapatan">Pendapatan Bagi Hasil (Dana Masuk)</option>
                    <option value="pengeluaran">Pengeluaran / Biaya Bagi Hasil (Dana Keluar)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Nama Pihak Ketiga (Mitra)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: CV. Sinar Abadi (Vendor Mart)"
                    value={bhPartner}
                    onChange={(e) => setBhPartner(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Nominal Dana (Rupiah)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Contoh: 1500000"
                    value={bhAmount || ''}
                    onChange={(e) => setBhAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Keterangan / Deskripsi</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Contoh: Pembagian laba operasional toko mini market minggu pertama Juli"
                    value={bhDesc}
                    onChange={(e) => setBhDesc(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                </div>

                {bhError && (
                  <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-rose-800 text-[11px] font-semibold flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    <span>{bhError}</span>
                  </div>
                )}
                {bhSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>{bhSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-xs"
                >
                  Simpan Jurnal Bagi Hasil
                </button>
              </form>
            </div>

            {/* Right: Table list of Bagi Hasil logs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Buku Jurnal Kemitraan Toko</h3>
                <p className="text-xs text-slate-400 font-medium">Buku pantau transaksi kerja sama bagi hasil pengelolaan toko dengan pihak ketiga</p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-3">Waktu</th>
                      <th className="p-3">Pihak Ketiga (Mitra)</th>
                      <th className="p-3">Aliran</th>
                      <th className="p-3">Keterangan</th>
                      <th className="p-3 text-right">Nominal</th>
                      <th className="p-3 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {bagiHasilRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          Belum ada jurnal bagi hasil terekam.
                        </td>
                      </tr>
                    ) : (
                      bagiHasilRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                            {r.date.substring(5, 16)}
                          </td>
                          <td className="p-3 font-bold text-slate-850 whitespace-nowrap">
                            {r.partnerName}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              r.type === 'pendapatan' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                              {r.type === 'pendapatan' ? 'MASUK' : 'KELUAR'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 font-medium max-w-xs truncate" title={r.description}>
                            {r.description}
                          </td>
                          <td className={`p-3 text-right font-mono font-bold whitespace-nowrap ${
                            r.type === 'pendapatan' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {r.type === 'pendapatan' ? '+' : '-'}{formatIDR(r.amount)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleBhDelete(r.id)}
                              className="p-1 text-slate-300 hover:text-red-500 cursor-pointer transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 4. Penjualan Produk Wartel Sub-tab */}
      {localTab === 'penjualan_wartel' && (
        <div className="space-y-6 animate-fade-in" id="toko-tab-penjualan-wartel">
          {/* Synchronized Alert Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-800">
                <Layers className="text-blue-600 animate-pulse animate-duration-1000" size={18} />
                <h4 className="font-extrabold text-xs uppercase tracking-wider">Sinkronisasi Otomatis Unit Wartel & Pertokoan</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                Setiap transaksi penjualan pulsa, paket data, telepon bilik, voucher, dan lainnya yang diinput oleh operator di <span className="text-blue-700 font-extrabold">Unit Wartel</span> akan secara otomatis tercatat dan masuk ke dalam pembukuan saldo/omzet <span className="text-blue-700 font-extrabold">Unit Pertokoan</span> di bawah ini secara real-time.
              </p>
            </div>
            <div className="bg-white px-3.5 py-1.5 rounded-lg border border-blue-150 shadow-3xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-[10px] font-black text-slate-800 tracking-wider uppercase">Tersinkronisasi Live</span>
            </div>
          </div>

          {/* KPI Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { 
                label: 'Total Omzet', 
                val: wartelRecords.reduce((s, r) => s + r.sellingPrice, 0), 
                color: 'from-blue-600 to-indigo-600 text-white',
                count: wartelRecords.length,
                icon: Coins 
              },
              { 
                label: 'Pulsa', 
                val: wartelRecords.filter(r => r.serviceType === 'pulsa').reduce((s, r) => s + r.sellingPrice, 0), 
                color: 'bg-white border border-slate-200 text-slate-800',
                count: wartelRecords.filter(r => r.serviceType === 'pulsa').length,
                icon: Smartphone 
              },
              { 
                label: 'Paket Data', 
                val: wartelRecords.filter(r => r.serviceType === 'paket_data').reduce((s, r) => s + r.sellingPrice, 0), 
                color: 'bg-white border border-slate-200 text-slate-800',
                count: wartelRecords.filter(r => r.serviceType === 'paket_data').length,
                icon: Layers 
              },
              { 
                label: 'Telepon Bilik', 
                val: wartelRecords.filter(r => r.serviceType === 'telepon').reduce((s, r) => s + r.sellingPrice, 0), 
                color: 'bg-white border border-slate-200 text-slate-800',
                count: wartelRecords.filter(r => r.serviceType === 'telepon').length,
                icon: PhoneCall 
              },
              { 
                label: 'Voucher', 
                val: wartelRecords.filter(r => r.serviceType === 'voucher_game').reduce((s, r) => s + r.sellingPrice, 0), 
                color: 'bg-white border border-slate-200 text-slate-800',
                count: wartelRecords.filter(r => r.serviceType === 'voucher_game').length,
                icon: Gamepad2 
              },
              { 
                label: 'Lain-lain', 
                val: wartelRecords.filter(r => r.serviceType === 'lainnya').reduce((s, r) => s + r.sellingPrice, 0), 
                color: 'bg-white border border-slate-200 text-slate-800',
                count: wartelRecords.filter(r => r.serviceType === 'lainnya').length,
                icon: Database 
              },
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className={`rounded-2xl p-4.5 shadow-3xs space-y-2 flex flex-col justify-between ${kpi.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-90 block">{kpi.label}</span>
                    <Icon size={16} className="opacity-80" />
                  </div>
                  <div>
                    <span className="font-mono text-sm font-black block leading-tight">{formatIDR(kpi.val)}</span>
                    <span className="text-[9px] font-semibold block mt-0.5 opacity-75">{kpi.count} Transaksi</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Rincian Transaksi Produk Wartel Terhubung</h3>
                <p className="text-xs text-slate-400 font-medium font-bold">Log riwayat penjualan produk wartel yang otomatis disinkronkan ke dalam sistem kas pertokoan</p>
              </div>

              {/* Simple Search Input */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Cari nama atau deskripsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-60 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Jenis Produk</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Harga Modal (HPP)</th>
                    <th className="p-3 text-right">Harga Jual</th>
                    <th className="p-3 text-right text-emerald-600">Keuntungan</th>
                    <th className="p-3">Pembayaran</th>
                    <th className="p-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {wartelRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                        Belum ada penjualan produk wartel yang tersinkron.
                      </td>
                    </tr>
                  ) : (
                    wartelRecords
                      .filter(r => 
                        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((r) => {
                        const typeMeta: Record<string, { label: string, color: string }> = {
                          pulsa: { label: 'Pulsa', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                          paket_data: { label: 'Paket Data', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                          telepon: { label: 'Bilik Telepon', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
                          voucher_game: { label: 'Voucher', color: 'bg-amber-50 text-amber-700 border-amber-100' },
                          lainnya: { label: 'Lainnya', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                        };
                        const meta = typeMeta[r.serviceType] || typeMeta.lainnya;
                        
                        return (
                          <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                              {r.date}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.color}`}>
                                {meta.label} {r.quantity && r.quantity > 1 ? `(${r.quantity}x)` : ''}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-800 whitespace-nowrap">
                              {r.customerName}
                            </td>
                            <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                              {formatIDR(r.costPrice)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                              {formatIDR(r.sellingPrice)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                              +{formatIDR(r.profit)}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                                r.paymentMethod === 'deposit' 
                                  ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {r.paymentMethod}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 max-w-xs truncate" title={r.description}>
                              {r.description}
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

    </div>
  );
}
