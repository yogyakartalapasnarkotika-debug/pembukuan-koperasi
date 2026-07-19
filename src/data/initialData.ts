import { Member, PertokoanProduct, Loan, Transaction, WartelRecord, PertokoanSale } from '../types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    memberId: 'KOP-001',
    name: 'H. Ahmad Subardjo',
    phone: '081234567890',
    address: 'Jl. Merdeka No. 12, Sleman',
    joinDate: '2025-01-10',
    savings: { pokok: 100000, wajib: 360000, sukarela: 2450000 },
    status: 'aktif'
  },
  {
    id: 'm2',
    memberId: 'KOP-002',
    name: 'Budi Santoso',
    phone: '085722334455',
    address: 'Sariharjo, Ngaglik, Sleman',
    joinDate: '2025-02-15',
    savings: { pokok: 100000, wajib: 300000, sukarela: 450000 },
    status: 'aktif'
  },
  {
    id: 'm3',
    memberId: 'KOP-003',
    name: 'Siti Rahmawati',
    phone: '081987654321',
    address: 'Sinduharjo, Ngaglik, Sleman',
    joinDate: '2025-03-05',
    savings: { pokok: 100000, wajib: 280000, sukarela: 5800000 },
    status: 'aktif'
  },
  {
    id: 'm4',
    memberId: 'KOP-004',
    name: 'Dian Wijaya',
    phone: '082133445566',
    address: 'Jl. Kaliurang KM 10, Sleman',
    joinDate: '2025-04-01',
    savings: { pokok: 100000, wajib: 240000, sukarela: 850000 },
    status: 'aktif'
  },
  {
    id: 'm5',
    memberId: 'KOP-005',
    name: 'Eko Prasetyo',
    phone: '081399887766',
    address: 'Condongcatur, Depok, Sleman',
    joinDate: '2025-05-12',
    savings: { pokok: 100000, wajib: 200000, sukarela: 150000 },
    status: 'aktif'
  },
  {
    id: 'm6',
    memberId: 'KOP-006',
    name: 'Rina Amelia',
    phone: '087811223344',
    address: 'Caturtunggal, Depok, Sleman',
    joinDate: '2026-06-01',
    savings: { pokok: 100000, wajib: 40000, sukarela: 1200000 },
    status: 'aktif'
  }
];

export const INITIAL_PRODUCTS: PertokoanProduct[] = [
  { id: 'p1', code: 'BRS01', name: 'Beras Premium C4 5kg', category: 'Sembako', stock: 45, costPrice: 62000, sellingPrice: 69000, unit: 'pack' },
  { id: 'p2', code: 'MYK01', name: 'Minyak Goreng Bimoli 2L', category: 'Sembako', stock: 60, costPrice: 31500, sellingPrice: 35500, unit: 'botol' },
  { id: 'p3', code: 'GLA01', name: 'Gula Pasir Gulaku 1kg', category: 'Sembako', stock: 80, costPrice: 14800, sellingPrice: 17200, unit: 'pcs' },
  { id: 'p4', code: 'IND01', name: 'Indomie Goreng Spesial', category: 'Makanan', stock: 240, costPrice: 2650, sellingPrice: 3100, unit: 'pcs' },
  { id: 'p5', code: 'IND02', name: 'Indomie Soto Mie', category: 'Makanan', stock: 180, costPrice: 2550, sellingPrice: 3000, unit: 'pcs' },
  { id: 'p6', code: 'TLR01', name: 'Telur Ayam Ras 1kg', category: 'Sembako', stock: 35, costPrice: 25000, sellingPrice: 28500, unit: 'kg' },
  { id: 'p7', code: 'KPI01', name: 'Kopi Kapal Api 165g', category: 'Minuman', stock: 50, costPrice: 13000, sellingPrice: 15500, unit: 'pcs' },
  { id: 'p8', code: 'THS01', name: 'Teh Celup Sariwangi (25)', category: 'Minuman', stock: 75, costPrice: 5800, sellingPrice: 7200, unit: 'pcs' },
  { id: 'p9', code: 'SBN01', name: 'Sabun Cair Lifebuoy 400ml', category: 'Kebutuhan Mandi', stock: 40, costPrice: 22000, sellingPrice: 26000, unit: 'pcs' },
  { id: 'p10', code: 'RNS01', name: 'Deterjen Rinso Molto 770g', category: 'Kebutuhan Mandi', stock: 28, costPrice: 20500, sellingPrice: 24500, unit: 'pcs' }
];

export const INITIAL_LOANS: Loan[] = [
  {
    id: 'l1',
    memberId: 'KOP-002',
    memberName: 'Budi Santoso',
    amountRequested: 5000000,
    interestRate: 1.2, // 1.2% per month
    tenor: 10, // 10 months
    monthlyInstallment: 560000, // Rp 500k principal + Rp 60k interest (1.2% of 5M)
    totalRepayment: 5600000,
    remainingBalance: 3920000, // 7 installments left (3 paid)
    purpose: 'Modal Tambahan Usaha Kelontong',
    applicationDate: '2026-03-10',
    startDate: '2026-03-15',
    status: 'aktif',
    approvalWorkflow: {
      staff: { status: 'approved', officerName: 'Andi Kusuma (Staff)', date: '2026-03-11', notes: 'Persyaratan berkas lengkap' },
      manager: { status: 'approved', officerName: 'Hendra Wijaya (Manajer)', date: '2026-03-12', notes: 'Kapasitas usaha memadai' },
      chairman: { status: 'approved', officerName: 'Drs. H. Mulyono (Ketua Koperasi)', date: '2026-03-14', notes: 'Disetujui rapat pengurus' }
    },
    repaymentHistory: [
      { id: 'r1', date: '2026-04-15', amount: 560000, principalPaid: 500000, interestPaid: 60000, installmentNumber: 1 },
      { id: 'r2', date: '2026-05-15', amount: 560000, principalPaid: 500000, interestPaid: 60000, installmentNumber: 2 },
      { id: 'r3', date: '2026-06-15', amount: 560000, principalPaid: 500000, interestPaid: 60000, installmentNumber: 3 }
    ]
  },
  {
    id: 'l2',
    memberId: 'KOP-004',
    memberName: 'Dian Wijaya',
    amountRequested: 10000000,
    interestRate: 1.2,
    tenor: 12,
    monthlyInstallment: 953333, // Rp 833.3k + Rp 120k interest flat-simplified
    totalRepayment: 11440000,
    remainingBalance: 9533334, // 10 installments left (2 paid)
    purpose: 'Biaya Pendidikan Anak Kuliah',
    applicationDate: '2026-04-20',
    startDate: '2026-04-25',
    status: 'aktif',
    approvalWorkflow: {
      staff: { status: 'approved', officerName: 'Andi Kusuma (Staff)', date: '2026-04-21', notes: 'Gaji pokok mencukupi' },
      manager: { status: 'approved', officerName: 'Hendra Wijaya (Manajer)', date: '2026-04-22', notes: 'Rekam jejak anggota sangat baik' },
      chairman: { status: 'approved', officerName: 'Drs. H. Mulyono (Ketua Koperasi)', date: '2026-04-24', notes: 'Plafon sesuai batas wewenang' }
    },
    repaymentHistory: [
      { id: 'r4', date: '2026-05-25', amount: 953333, principalPaid: 833333, interestPaid: 120000, installmentNumber: 1 },
      { id: 'r5', date: '2026-06-25', amount: 953333, principalPaid: 833333, interestPaid: 120000, installmentNumber: 2 }
    ]
  },
  {
    id: 'l3',
    memberId: 'KOP-005',
    memberName: 'Eko Prasetyo',
    amountRequested: 15000000,
    interestRate: 1.0, // 1.0% per month
    tenor: 15,
    monthlyInstallment: 1150000, // Rp 1.0M + Rp 150k
    totalRepayment: 17250000,
    remainingBalance: 17250000,
    purpose: 'Renovasi Atap Rumah Tinggal',
    applicationDate: '2026-07-15',
    status: 'diajukan', // Needs 3-level approval!
    approvalWorkflow: {
      staff: { status: 'pending', officerName: 'Andi Kusuma (Staff)' },
      manager: { status: 'pending', officerName: 'Hendra Wijaya (Manajer)' },
      chairman: { status: 'pending', officerName: 'Drs. H. Mulyono (Ketua Koperasi)' }
    },
    repaymentHistory: []
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Day 1 (5 days ago: 2026-07-13)
  { id: 't1', date: '2026-07-13 09:15:00', type: 'kas_masuk', amount: 1000000, unit: 'simpan_pinjam', category: 'Simpanan Sukarela', description: 'Simpanan Sukarela H. Ahmad Subardjo', referenceId: 'KOP-001', paymentMethod: 'cash' },
  { id: 't2', date: '2026-07-13 11:30:00', type: 'kas_masuk', amount: 350000, unit: 'pertokoan', category: 'Penjualan Toko', description: 'Penjualan Retail Kasir - Invoice #INV-0012', paymentMethod: 'cash' },
  { id: 't3', date: '2026-07-13 15:45:00', type: 'kas_masuk', amount: 85000, unit: 'wartel', category: 'Penjualan Wartel', description: 'Log Wartel Telepon & Voucher Pulsa XL', paymentMethod: 'cash' },
  
  // Day 2 (4 days ago: 2026-07-14)
  { id: 't4', date: '2026-07-14 08:30:00', type: 'kas_masuk', amount: 150000, unit: 'simpan_pinjam', category: 'Simpanan Wajib', description: 'Simpanan Wajib Anggota Bulanan', paymentMethod: 'cash' },
  { id: 't5', date: '2026-07-14 10:15:00', type: 'kas_masuk', amount: 1250000, unit: 'pertokoan', category: 'Penjualan Toko', description: 'Belanja Bulanan Kelompok - Invoice #INV-0013', paymentMethod: 'cash' },
  { id: 't6', date: '2026-07-14 14:00:00', type: 'kas_masuk', amount: 120000, unit: 'wartel', category: 'Penjualan Wartel', description: 'Pengisian Kuota Data Simpati & Voucher Game', paymentMethod: 'cash' },
  { id: 't7', date: '2026-07-14 16:30:00', type: 'kas_keluar', amount: 250000, unit: 'umum', category: 'Biaya Operasional', description: 'Tagihan Listrik PLN Bulanan Kantor Koperasi', paymentMethod: 'cash' },

  // Day 3 (3 days ago: 2026-07-15)
  { id: 't8', date: '2026-07-15 09:00:00', type: 'kas_masuk', amount: 560000, unit: 'simpan_pinjam', category: 'Angsuran Pinjaman', description: 'Angsuran Pinjaman Budi Santoso Ke-3', referenceId: 'l1', paymentMethod: 'cash' },
  { id: 't9', date: '2026-07-15 11:00:00', type: 'kas_masuk', amount: 780000, unit: 'pertokoan', category: 'Penjualan Toko', description: 'Penjualan Sembako - Invoice #INV-0014', paymentMethod: 'cash' },
  { id: 't10', date: '2026-07-15 14:30:00', type: 'kas_masuk', amount: 95000, unit: 'wartel', category: 'Penjualan Wartel', description: 'Sewa Bilik Telepon & Pengisian Pulsa Indosat', paymentMethod: 'cash' },
  { id: 't11', date: '2026-07-15 15:00:00', type: 'kas_keluar', amount: 500000, unit: 'simpan_pinjam', category: 'Penarikan Sukarela', description: 'Penarikan Tabungan Sukarela Siti Rahmawati', referenceId: 'KOP-003', paymentMethod: 'cash' },

  // Day 4 (2 days ago: 2026-07-16)
  { id: 't12', date: '2026-07-16 10:00:00', type: 'kas_masuk', amount: 1100000, unit: 'pertokoan', category: 'Penjualan Toko', description: 'Belanja Sembako Anggota - Potong Simpanan Sukarela', referenceId: 'KOP-003', paymentMethod: 'deposit' },
  { id: 't13', date: '2026-07-16 13:15:00', type: 'kas_masuk', amount: 150000, unit: 'wartel', category: 'Penjualan Wartel', description: 'Penjualan Paket Internet Telkomsel Orbit', paymentMethod: 'cash' },
  { id: 't14', date: '2026-07-16 16:00:00', type: 'kas_keluar', amount: 120000, unit: 'umum', category: 'Biaya Operasional', description: 'Pembelian Kertas A4 & ATK Operasional Kantor', paymentMethod: 'cash' },

  // Day 5 (Yesterday: 2026-07-17)
  { id: 't15', date: '2026-07-17 09:30:00', type: 'kas_masuk', amount: 953333, unit: 'simpan_pinjam', category: 'Angsuran Pinjaman', description: 'Angsuran Pinjaman Dian Wijaya Ke-2', referenceId: 'l2', paymentMethod: 'cash' },
  { id: 't16', date: '2026-07-17 11:45:00', type: 'kas_masuk', amount: 890000, unit: 'pertokoan', category: 'Penjualan Toko', description: 'Penjualan Retail Kasir - Invoice #INV-0015', paymentMethod: 'cash' },
  { id: 't17', date: '2026-07-17 15:00:00', type: 'kas_masuk', amount: 110000, unit: 'wartel', category: 'Penjualan Wartel', description: 'Log Sewa Bilik & Pulsa Smartfren', paymentMethod: 'cash' },

  // Day 6 (Today: 2026-07-18)
  { id: 't18', date: '2026-07-18 08:45:00', type: 'kas_masuk', amount: 200000, unit: 'simpan_pinjam', category: 'Simpanan Sukarela', description: 'Simpanan Sukarela Tambahan Rina Amelia', referenceId: 'KOP-006', paymentMethod: 'cash' },
  { id: 't19', date: '2026-07-18 10:30:00', type: 'kas_masuk', amount: 420000, unit: 'pertokoan', category: 'Penjualan Toko', description: 'Penjualan Sembako Kasir - Invoice #INV-0016', paymentMethod: 'cash' },
  { id: 't20', date: '2026-07-18 11:15:00', type: 'kas_masuk', amount: 65000, unit: 'wartel', category: 'Penjualan Wartel', description: 'Pengisian Pulsa Tri & Telepon Wartel', paymentMethod: 'cash' }
];

export const INITIAL_WARTEL_RECORDS: WartelRecord[] = [
  { id: 'w1', date: '2026-07-13 15:45:00', serviceType: 'telepon', customerName: 'Pak Joko (Non-Anggota)', costPrice: 15000, sellingPrice: 25000, profit: 10000, description: 'Sewa Bilik Telepon Wartel Koperasi 30 menit', paymentMethod: 'cash' },
  { id: 'w2', date: '2026-07-13 16:10:00', serviceType: 'pulsa', customerName: 'H. Ahmad Subardjo', memberId: 'KOP-001', costPrice: 50000, sellingPrice: 60000, profit: 10000, description: 'Isi Pulsa XL Combo Lite', paymentMethod: 'cash' },
  { id: 'w3', date: '2026-07-14 14:00:00', serviceType: 'paket_data', customerName: 'Siti Rahmawati', memberId: 'KOP-003', costPrice: 100000, sellingPrice: 120000, profit: 20000, description: 'Pembelian Paket Data Simpati Gigamax', paymentMethod: 'cash' },
  { id: 'w4', date: '2026-07-15 14:30:00', serviceType: 'telepon', customerName: 'Bu Ani (Non-Anggota)', costPrice: 45000, sellingPrice: 95000, profit: 50000, description: 'Sewa Bilik Telepon SLI Koperasi', paymentMethod: 'cash' },
  { id: 'w5', date: '2026-07-16 13:15:00', serviceType: 'paket_data', customerName: 'Budi Santoso', memberId: 'KOP-002', costPrice: 125000, sellingPrice: 150000, profit: 25000, description: 'Paket Data Orbit Wifi', paymentMethod: 'cash' },
  { id: 'w6', date: '2026-07-17 15:00:00', serviceType: 'voucher_game', customerName: 'Dian Wijaya', memberId: 'KOP-004', costPrice: 95000, sellingPrice: 110000, profit: 15000, description: 'Voucher Google Play Gift Card', paymentMethod: 'cash' },
  { id: 'w7', date: '2026-07-18 11:15:00', serviceType: 'pulsa', customerName: 'Rina Amelia', memberId: 'KOP-006', costPrice: 55000, sellingPrice: 65000, profit: 10000, description: 'Pengisian Pulsa Tri Kuota Utama', paymentMethod: 'cash' }
];

export const INITIAL_SHOP_SALES: PertokoanSale[] = [
  {
    id: 's1',
    invoiceNumber: 'INV-0012',
    date: '2026-07-13 11:30:00',
    customerName: 'Joko Widodo (Umum)',
    items: [
      { productId: 'p1', name: 'Beras Premium C4 5kg', quantity: 2, costPrice: 62000, sellingPrice: 69000, subtotal: 138000 },
      { productId: 'p2', name: 'Minyak Goreng Bimoli 2L', quantity: 3, costPrice: 31500, sellingPrice: 35500, subtotal: 106500 },
      { productId: 'p3', name: 'Gula Pasir Gulaku 1kg', quantity: 6, costPrice: 14800, sellingPrice: 17200, subtotal: 103200 },
      { productId: 'p4', name: 'Indomie Goreng Spesial', quantity: 10, costPrice: 2650, sellingPrice: 3100, subtotal: 31000 }
    ],
    totalAmount: 378700,
    paymentMethod: 'cash',
    profit: 46800 // derived: sum(selling - cost) * qty
  },
  {
    id: 's2',
    invoiceNumber: 'INV-0013',
    date: '2026-07-14 10:15:00',
    customerName: 'Budi Santoso',
    memberId: 'KOP-002',
    items: [
      { productId: 'p1', name: 'Beras Premium C4 5kg', quantity: 5, costPrice: 62000, sellingPrice: 69000, subtotal: 345000 },
      { productId: 'p2', name: 'Minyak Goreng Bimoli 2L', quantity: 4, costPrice: 31500, sellingPrice: 35500, subtotal: 142000 },
      { productId: 'p6', name: 'Telur Ayam Ras 1kg', quantity: 10, costPrice: 25000, sellingPrice: 28500, subtotal: 285000 },
      { productId: 'p10', name: 'Deterjen Rinso Molto 770g', quantity: 5, costPrice: 20500, sellingPrice: 24500, subtotal: 122500 }
    ],
    totalAmount: 894500,
    paymentMethod: 'cash',
    profit: 109000
  },
  {
    id: 's3',
    invoiceNumber: 'INV-0015',
    date: '2026-07-17 11:45:00',
    customerName: 'Siti Rahmawati',
    memberId: 'KOP-003',
    items: [
      { productId: 'p1', name: 'Beras Premium C4 5kg', quantity: 3, costPrice: 62000, sellingPrice: 69000, subtotal: 207000 },
      { productId: 'p2', name: 'Minyak Goreng Bimoli 2L', quantity: 5, costPrice: 31500, sellingPrice: 35500, subtotal: 177500 },
      { productId: 'p3', name: 'Gula Pasir Gulaku 1kg', quantity: 10, costPrice: 14800, sellingPrice: 17200, subtotal: 172000 },
      { productId: 'p9', name: 'Sabun Cair Lifebuoy 400ml', quantity: 4, costPrice: 22000, sellingPrice: 26000, subtotal: 104000 }
    ],
    totalAmount: 660500,
    paymentMethod: 'deposit', // uses her sukarela savings!
    profit: 78500
  }
];
