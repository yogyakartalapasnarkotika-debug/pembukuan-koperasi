export interface Member {
  id: string;
  memberId: string;
  name: string;
  phone: string;
  address: string;
  joinDate: string;
  savings: {
    pokok: number; // Simpanan Pokok (paid once on join, e.g. Rp 100,000)
    wajib: number;  // Simpanan Wajib (paid monthly, e.g. Rp 20,000/month)
    sukarela: number; // Simpanan Sukarela (flexible, withdrawable like savings)
  };
  status: 'aktif' | 'non-aktif';
}

export interface ApprovalStep {
  status: 'pending' | 'approved' | 'rejected';
  officerName: string;
  date?: string;
  notes?: string;
}

export interface Repayment {
  id: string;
  date: string;
  amount: number;
  principalPaid: number;
  interestPaid: number;
  installmentNumber: number;
}

export interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  amountRequested: number;
  interestRate: number; // percentage per month, e.g. 1.2%
  tenor: number; // months
  monthlyInstallment: number;
  totalRepayment: number;
  remainingBalance: number;
  purpose: string;
  applicationDate: string;
  startDate?: string;
  status: 'diajukan' | 'disetujui_staff' | 'disetujui_manajer' | 'aktif' | 'ditolak' | 'lunas';
  approvalWorkflow: {
    staff: ApprovalStep;
    manager: ApprovalStep;
    chairman: ApprovalStep;
  };
  repaymentHistory: Repayment[];
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD HH:mm:ss or YYYY-MM-DD
  type: 'kas_masuk' | 'kas_keluar';
  amount: number;
  unit: 'umum' | 'wartel' | 'simpan_pinjam' | 'pertokoan';
  category: 
    | 'Simpanan Pokok'
    | 'Simpanan Wajib'
    | 'Simpanan Sukarela'
    | 'Penarikan Sukarela'
    | 'Pencairan Pinjaman'
    | 'Angsuran Pinjaman'
    | 'Penyertaan Modal'
    | 'Penjualan Wartel'
    | 'Penjualan Toko'
    | 'Biaya Operasional'
    | 'Pembelian Inventaris'
    | 'Bagi Hasil'
    | 'Lain-lain';
  description: string;
  referenceId?: string; // loanId, invoiceId, memberId, etc.
  paymentMethod: 'cash' | 'deposit' | 'piutang'; // deposit uses sukarela savings
}

export interface WartelRecord {
  id: string;
  date: string;
  serviceType: 'telepon' | 'pulsa' | 'paket_data' | 'voucher_game' | 'lainnya';
  customerName: string;
  memberId?: string; // If general public, leave undefined
  costPrice: number; // modal
  sellingPrice: number; // harga jual
  profit: number;
  description: string;
  paymentMethod: 'cash' | 'deposit';
  quantity?: number;
}

export interface PertokoanProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
  unit: string; // kg, pcs, botol, dll.
  wartelServiceType?: 'telepon' | 'pulsa' | 'paket_data' | 'voucher_game' | 'lainnya';
}

export interface PertokoanSaleItem {
  productId: string;
  name: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  subtotal: number;
}

export interface PertokoanSale {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  memberId?: string;
  items: PertokoanSaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'deposit';
  profit: number;
}

export interface FinancialSummary {
  cashBalance: number;
  totalSavingsPokok: number;
  totalSavingsWajib: number;
  totalSavingsSukarela: number;
  totalLoansOutstanding: number;
  totalRevenueWartel: number;
  totalRevenueToko: number;
  totalRevenueSimpanPinjam: number; // from loan interests
}

export interface UserAccount {
  username: string;
  name: string;
  role: 'admin' | 'operator_sp' | 'operator_toko' | 'operator_wartel' | 'verifikator_bendahara' | 'verifikator_ketua';
  pin: string;
}

