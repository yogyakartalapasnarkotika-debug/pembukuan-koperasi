import React, { useState } from 'react';
import { Member, Loan, Transaction, ApprovalStep, UserAccount } from '../types';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calculator, 
  UserCheck, 
  History, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  X, 
  FileText, 
  Info,
  DollarSign,
  Briefcase,
  Wallet,
  Edit2,
  Trash2
} from 'lucide-react';

export interface CapitalContribution {
  id: string;
  date: string;
  amount: number;
  source: string;
  officer: string;
  notes: string;
}

interface SimpanPinjamUnitProps {
  members: Member[];
  loans: Loan[];
  currentUser: UserAccount | null;
  onUpdateSavings: (memberId: string, type: 'setor' | 'tarik', amount: number) => void;
  onApplyLoan: (newLoan: Loan) => void;
  onApproveLoan: (loanId: string, level: 'staff' | 'manager' | 'chairman', decision: 'approved' | 'rejected', notes: string, officerName?: string) => void;
  onPayInstallment: (loanId: string, amountPaid: number) => void;
  activeSubTab?: string;
  onAddTransaction?: (tx: Transaction) => void;
}

export default function SimpanPinjamUnit({
  members,
  loans,
  currentUser,
  onUpdateSavings,
  onApplyLoan,
  onApproveLoan,
  onPayInstallment,
  activeSubTab = 'pengurus',
  onAddTransaction
}: SimpanPinjamUnitProps) {
  
  // --- Active Testing Role for Approvals ---
  const [currentRole, setCurrentRole] = useState<'operator_sp' | 'verifikator_ketua' | 'verifikator_bendahara'>(() => {
    if (currentUser) {
      if (currentUser.role === 'verifikator_ketua') return 'verifikator_ketua';
      if (currentUser.role === 'verifikator_bendahara') return 'verifikator_bendahara';
      return 'operator_sp';
    }
    return 'operator_sp';
  });
  
  // Track authenticated roles
  const [authenticatedRoles, setAuthenticatedRoles] = useState<Record<string, boolean>>({
    operator_sp: false,
    verifikator_ketua: false,
    verifikator_bendahara: false
  });

  // Track PIN input
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const roleCredentials: Record<string, { name: string; title: string; pin: string }> = {
    operator_sp: { name: 'Siti Aminah', title: 'Operator Simpan Pinjam', pin: '4444' },
    verifikator_ketua: { name: 'Danang Andriyanto', title: 'Ketua Koperasi', pin: '3333' },
    verifikator_bendahara: { name: 'Hendra Wijaya', title: 'Bendahara Koperasi', pin: '2222' }
  };

  const handleVerifyPIN = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPinError('');
    
    const cred = roleCredentials[currentRole];
    if (cred && pinInput === cred.pin) {
      setAuthenticatedRoles(prev => ({ ...prev, [currentRole]: true }));
      setPinInput('');
    } else if (currentUser && pinInput === currentUser.pin && currentUser.role === currentRole) {
      setAuthenticatedRoles(prev => ({ ...prev, [currentRole]: true }));
      setPinInput('');
    } else if (currentUser?.role === 'admin' && pinInput === '9999') {
      setAuthenticatedRoles(prev => ({ ...prev, [currentRole]: true }));
      setPinInput('');
    } else {
      setPinError('PIN yang Anda masukkan salah! Silakan coba lagi.');
    }
  };

  const handleRoleSwitch = (role: 'operator_sp' | 'verifikator_ketua' | 'verifikator_bendahara') => {
    setCurrentRole(role);
    setPinInput('');
    setPinError('');
  };

  // --- Savings Form States ---
  const [savingsMemberId, setSavingsMemberId] = useState('');
  const [savingsTxType, setSavingsTxType] = useState<'setor' | 'tarik'>('setor');
  const [savingsAmount, setSavingsAmount] = useState(0);
  const [savingsNotes, setSavingsNotes] = useState('');
  const [savingsSuccess, setSavingsSuccess] = useState('');
  const [savingsError, setSavingsError] = useState('');

  // --- Calculator Form States ---
  const [calcAmount, setCalcAmount] = useState(5000000);
  const [calcTenor, setCalcTenor] = useState(12); // months
  const [calcInterest, setCalcInterest] = useState(1.2); // flat per month

  // --- Loan Apply Form States ---
  const [applyMemberId, setApplyMemberId] = useState('');
  const [applyPurpose, setApplyPurpose] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  // --- Approval Form Notes State ---
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});

  // --- Repayment Form State ---
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [repaySuccess, setRepaySuccess] = useState('');
  const [repayError, setRepayError] = useState('');

  // --- USP Settings States ---
  const [adminFee, setAdminFee] = useState(() => {
    const s = localStorage.getItem('usp_settings_admin_fee');
    const val = s ? Number(s) : 50000;
    return val < 100 ? 50000 : val;
  });
  const [interestRate, setInterestRate] = useState(() => {
    const s = localStorage.getItem('usp_settings_interest_rate');
    return s ? Number(s) : 0.00;
  });
  const [maxTenor, setMaxTenor] = useState(() => {
    const s = localStorage.getItem('usp_settings_max_tenor');
    return s ? Number(s) : 10;
  });
  const [maxPlafon, setMaxPlafon] = useState(() => {
    const s = localStorage.getItem('usp_settings_max_plafon');
    return s ? Number(s) : 3000000;
  });

  // --- Capital Contribution States ---
  const [capitalContributions, setCapitalContributions] = useState<CapitalContribution[]>(() => {
    const saved = localStorage.getItem('usp_capital_contributions');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'cap-1',
        date: '2026-07-04',
        amount: 15000000,
        source: 'Koperasi Karya Mukti Pusat',
        officer: 'Drs. H. Mulyono (Ketua Koperasi)',
        notes: 'Penyertaan Modal Operasional Tahap 1'
      }
    ];
  });

  const [showAddModalForm, setShowAddModalForm] = useState(false);
  const [modalAmount, setModalAmount] = useState(10000000);
  const [modalSource, setModalSource] = useState('Koperasi Karya Mukti Pusat');
  const [modalDate, setModalDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [modalNotes, setModalNotes] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  // --- Edit Capital Contribution States ---
  const [editingCapital, setEditingCapital] = useState<CapitalContribution | null>(null);
  const [editCapitalAmount, setEditCapitalAmount] = useState<number>(0);
  const [editCapitalSource, setEditCapitalSource] = useState('');
  const [editCapitalDate, setEditCapitalDate] = useState('');
  const [editCapitalNotes, setEditCapitalNotes] = useState('');

  const handleOpenEditCapital = (c: CapitalContribution) => {
    setEditingCapital(c);
    setEditCapitalAmount(c.amount);
    setEditCapitalSource(c.source);
    setEditCapitalDate(c.date);
    setEditCapitalNotes(c.notes);
  };

  const handleSaveEditCapital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCapital) return;

    if (editCapitalAmount <= 0) {
      alert('Nominal modal disetor harus lebih dari Rp 0!');
      return;
    }
    if (!editCapitalSource) {
      alert('Tentukan sumber dana penyertaan modal!');
      return;
    }

    const updated = capitalContributions.map(c => {
      if (c.id === editingCapital.id) {
        return {
          ...c,
          amount: Number(editCapitalAmount),
          source: editCapitalSource,
          date: editCapitalDate,
          notes: editCapitalNotes
        };
      }
      return c;
    });

    setCapitalContributions(updated);
    localStorage.setItem('usp_capital_contributions', JSON.stringify(updated));
    setEditingCapital(null);
  };

  const handleApplyCapital = (e: React.FormEvent) => {
    e.preventDefault();
    setModalSuccess('');
    setModalError('');

    if (modalAmount <= 0) {
      setModalError('Nominal modal disetor harus lebih dari Rp 0!');
      return;
    }
    if (!modalSource) {
      setModalError('Tentukan sumber dana penyertaan modal!');
      return;
    }

    const newContrib: CapitalContribution = {
      id: `cap-${Date.now()}`,
      date: modalDate,
      amount: modalAmount,
      source: modalSource,
      officer: roleCredentials[currentRole]?.name || 'Staff Koperasi',
      notes: modalNotes || 'Penyertaan Modal Operasional Tambahan'
    };

    const updated = [...capitalContributions, newContrib];
    setCapitalContributions(updated);
    localStorage.setItem('usp_capital_contributions', JSON.stringify(updated));

    // Also register a real cash transaction if callback is available
    if (onAddTransaction) {
      const nowStr = `${modalDate} ${new Date().toTimeString().split(' ')[0]}`;
      onAddTransaction({
        id: `tx-capital-${Date.now()}`,
        date: nowStr,
        type: 'kas_masuk',
        amount: modalAmount,
        unit: 'simpan_pinjam',
        category: 'Penyertaan Modal',
        description: `Penyertaan Modal: ${modalSource} (${newContrib.notes})`,
        paymentMethod: 'cash'
      });
    }

    setModalSuccess(`Berhasil merekam penyertaan modal baru senilai ${formatIDR(modalAmount)} dari ${modalSource}!`);
    setModalNotes('');
    setTimeout(() => {
      setShowAddModalForm(false);
      setModalSuccess('');
    }, 2000);
  };

  const handleDeleteCapital = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan penyertaan modal ini?')) {
      const updated = capitalContributions.filter(c => c.id !== id);
      setCapitalContributions(updated);
      localStorage.setItem('usp_capital_contributions', JSON.stringify(updated));
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const selectedSavingsMember = members.find(m => m.memberId === savingsMemberId);
  const selectedApplyMember = members.find(m => m.memberId === applyMemberId);

  // --- Calculator Formula ---
  const computeInstallments = (amount: number, months: number, ratePercent: number) => {
    const monthlyPrincipal = amount / months;
    const monthlyInterest = amount * (ratePercent / 100);
    const monthlyTotal = monthlyPrincipal + monthlyInterest;
    const totalRepay = monthlyTotal * months;
    return {
      monthlyPrincipal,
      monthlyInterest,
      monthlyTotal,
      totalRepay
    };
  };

  const calcDetails = computeInstallments(calcAmount, calcTenor, calcInterest);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('usp_settings_admin_fee', adminFee.toString());
    localStorage.setItem('usp_settings_interest_rate', interestRate.toString());
    localStorage.setItem('usp_settings_max_tenor', maxTenor.toString());
    localStorage.setItem('usp_settings_max_plafon', maxPlafon.toString());
    alert('Pengaturan regulasi unit simpan pinjam berhasil disimpan!');
  };

  // --- Handles ---
  const handleSavingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingsSuccess('');
    setSavingsError('');

    if (!savingsMemberId) {
      setSavingsError('Pilih ID Anggota terlebih dahulu!');
      return;
    }
    if (!selectedSavingsMember) {
      setSavingsError('Anggota tidak terdaftar!');
      return;
    }
    if (savingsAmount <= 0) {
      setSavingsError('Nominal transaksi harus lebih dari Rp 0!');
      return;
    }

    if (savingsTxType === 'tarik') {
      if (selectedSavingsMember.savings.sukarela < savingsAmount) {
        setSavingsError(`Penarikan gagal! Saldo Simpanan Sukarela Anggota tidak mencukupi (Saldo: ${formatIDR(selectedSavingsMember.savings.sukarela)}).`);
        return;
      }
    }

    onUpdateSavings(savingsMemberId, savingsTxType, Number(savingsAmount));
    
    setSavingsSuccess(`Sukses mencatat ${savingsTxType === 'setor' ? 'Setor' : 'Tarik'} Simpanan Sukarela senilai ${formatIDR(savingsAmount)} untuk ${selectedSavingsMember.name}!`);
    setSavingsAmount(0);
    setSavingsNotes('');
  };

  const handleApplyLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplySuccess('');
    setApplyError('');

    if (!applyMemberId) {
      setApplyError('Pilih Anggota pengaju kredit!');
      return;
    }
    if (!selectedApplyMember) {
      setApplyError('Anggota tidak terdaftar!');
      return;
    }
    if (!applyPurpose) {
      setApplyError('Sebutkan tujuan penggunaan pinjaman!');
      return;
    }

    if (calcAmount > maxPlafon) {
      setApplyError(`Nominal melebihi batas maksimal regulasi pengurus saat ini (${formatIDR(maxPlafon)})!`);
      return;
    }

    if (calcTenor > maxTenor) {
      setApplyError(`Tenor pinjaman melebihi batas regulasi (${maxTenor} Bulan)!`);
      return;
    }

    // Check if member already has an active loan
    const hasActiveLoan = loans.some(l => l.memberId === applyMemberId && l.status === 'aktif');
    if (hasActiveLoan) {
      setApplyError('Anggota masih memiliki kontrak pinjaman AKTIF. Lunasi kontrak sebelumnya terlebih dahulu!');
      return;
    }

    const { monthlyTotal, totalRepay } = computeInstallments(calcAmount, calcTenor, calcInterest);

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      memberId: applyMemberId,
      memberName: selectedApplyMember.name,
      amountRequested: Number(calcAmount),
      interestRate: Number(calcInterest),
      tenor: Number(calcTenor),
      monthlyInstallment: Math.round(monthlyTotal),
      totalRepayment: Math.round(totalRepay),
      remainingBalance: Math.round(totalRepay),
      purpose: applyPurpose,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'diajukan',
      approvalWorkflow: {
        staff: { status: 'pending', officerName: 'Andi Kusuma (Staff Kredit)' },
        manager: { status: 'pending', officerName: 'Hendra Wijaya (Manajer Operasional)' },
        chairman: { status: 'pending', officerName: 'Drs. H. Mulyono (Ketua Koperasi)' }
      },
      repaymentHistory: []
    };

    onApplyLoan(newLoan);
    setApplySuccess(`Pengajuan kredit baru atas nama ${selectedApplyMember.name} sebesar ${formatIDR(calcAmount)} BERHASIL dikirim ke antrean verifikasi berjenjang!`);
    setApplyPurpose('');
  };

  const handleApproveAction = (loanId: string, decision: 'approved' | 'rejected') => {
    const note = approvalNotes[loanId] || (decision === 'approved' ? 'Kelayakan disetujui sesuai regulasi' : 'Ditolak berdasarkan pertimbangan profil risiko');
    
    let levelKey: 'staff' | 'chairman' | 'manager' = 'staff';
    if (currentRole === 'verifikator_ketua') {
      levelKey = 'chairman';
    } else if (currentRole === 'verifikator_bendahara') {
      levelKey = 'manager';
    } else if (currentRole === 'operator_sp') {
      levelKey = 'staff';
    }

    const activeTitle = roleCredentials[currentRole]?.title || 'Staff';
    const activeName = roleCredentials[currentRole]?.name || 'Petugas';
    const officerName = currentUser 
      ? `${currentUser.name} (${currentUser.role === 'admin' ? 'Super Admin' : activeTitle})` 
      : `${activeName} (${activeTitle})`;

    onApproveLoan(loanId, levelKey, decision, note, officerName);
    
    // Clear comment input
    setApprovalNotes(prev => {
      const copy = { ...prev };
      delete copy[loanId];
      return copy;
    });
  };

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRepaySuccess('');
    setRepayError('');

    if (!selectedLoanId) {
      setRepayError('Pilih kontrak pinjaman yang akan dibayar!');
      return;
    }

    const loan = loans.find(l => l.id === selectedLoanId);
    if (!loan) {
      setRepayError('Kontrak pinjaman tidak ditemukan!');
      return;
    }

    const payAmount = Math.min(loan.monthlyInstallment, loan.remainingBalance);

    onPayInstallment(selectedLoanId, payAmount);
    setRepaySuccess(`Angsuran sebesar ${formatIDR(payAmount)} untuk ${loan.memberName} berhasil didebet. Sisa pinjaman: ${formatIDR(loan.remainingBalance - payAmount)}.`);
  };

  return (
    <div className="space-y-6" id="simpan-pinjam-panel">
      
      {/* 1. Pengurus Sub-tab */}
      {activeSubTab === 'pengurus' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="usp-pengurus-view animate-fade-in">
          {/* Left panel: Info Modal Kerja */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider block">Unit Simpan Pinjam (USP)</span>
              <h3 className="font-black text-slate-900 text-lg">Modal Kerja Unit Simpan Pinjam</h3>
              <p className="text-xs text-slate-400 font-medium">Ringkasan kas operasional, pinjaman aktif, dan estimasi total piutang berjalan.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Kas Tersedia */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg border border-emerald-100">
                    <Wallet size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">Kas Tersedia USP</span>
                    <span className="text-[11px] text-slate-500 block">Batas penarikan likuiditas harian</span>
                  </div>
                </div>
                <span className="font-mono font-black text-slate-800 text-sm">Rp 60.000</span>
              </div>

              {/* Pinjaman Aktif */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 text-blue-700 p-2.5 rounded-lg border border-blue-100">
                    <Coins size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">Total Pinjaman Aktif</span>
                    <span className="text-[11px] text-slate-500 block">Kontrak berjalan saat ini</span>
                  </div>
                </div>
                <span className="font-mono font-black text-slate-800 text-sm">{loans.filter(l => l.status === 'aktif').length} pinjaman</span>
              </div>

              {/* Piutang Berjalan */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-50 text-sky-700 p-2.5 rounded-lg border border-sky-100">
                    <Coins size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">Total Piutang Berjalan</span>
                    <span className="text-[11px] text-slate-500 block">Sisa tagihan terutang outstanding</span>
                  </div>
                </div>
                <span className="font-mono font-black text-blue-700 text-sm">
                  {formatIDR(loans.filter(l => l.status === 'aktif').reduce((sum, l) => sum + l.remainingBalance, 0))}
                </span>
              </div>
            </div>

            {/* Riwayat Modal dari Koperasi */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Riwayat Modal dari Koperasi</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                <div className="p-3.5 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-700 block">Modal disetor ke USP Tahap 1</span>
                    <span className="text-[10px] text-slate-400 font-medium">04 Juli 2026</span>
                  </div>
                  <span className="font-mono font-extrabold text-emerald-600">+Rp 15.000.000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Form Pengaturan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider block">Pengaturan Regulasi</span>
              <h3 className="font-black text-slate-900 text-base">Pengaturan Unit Simpan Pinjam</h3>
              <p className="text-xs text-slate-400 font-medium">Batasan admin fee, suku bunga, tenor, dan plafon kredit anggota</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">BIAYA ADMIN (RP)</label>
                  <input
                    type="number"
                    step="1000"
                    placeholder="Contoh: 50000"
                    value={adminFee}
                    onChange={(e) => setAdminFee(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:border-blue-500 font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">BUNGA (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:border-blue-500 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">MAKS LAMA PINJAM (BLN)</label>
                  <input
                    type="number"
                    value={maxTenor}
                    onChange={(e) => setMaxTenor(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:border-blue-500 font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">MAKS PLAFON/ANGGOTA (RP)</label>
                  <input
                    type="number"
                    value={maxPlafon}
                    onChange={(e) => setMaxPlafon(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:border-blue-500 font-bold text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
              >
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Anggota Sub-tab */}
      {activeSubTab === 'anggota' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fade-in" id="usp-anggota-view">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Transparansi Saldo Simpanan Anggota</h3>
            <p className="text-xs text-slate-400 font-medium">Buku konsolidasi simpanan pokok, wajib, dan sukarela per anggota</p>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-3">Anggota</th>
                  <th className="p-3 text-right">Pokok (S1)</th>
                  <th className="p-3 text-right">Wajib (S2)</th>
                  <th className="p-3 text-right">Sukarela (S3)</th>
                  <th className="p-3 text-right font-bold text-slate-700">Total Simpanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {members.map(m => {
                  const total = m.savings.pokok + m.savings.wajib + m.savings.sukarela;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <span className="font-bold text-slate-800 block">{m.name}</span>
                        <span className="font-mono text-[9px] font-bold text-slate-400">{m.memberId}</span>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">
                        {formatIDR(m.savings.pokok)}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">
                        {formatIDR(m.savings.wajib)}
                      </td>
                      <td className="p-3 text-right font-mono text-blue-700 font-bold">
                        {formatIDR(m.savings.sukarela)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-800 bg-slate-50/30">
                        {formatIDR(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Simpanan Sub-tab */}
      {activeSubTab === 'simpanan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="usp-simpanan-view">
          {/* Loket Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Loket Setoran & Penarikan</h3>
              <p className="text-xs text-slate-400 font-medium">Ubah saldo tabungan sukarela anggota secara instan</p>
            </div>
            
            <form onSubmit={handleSavingsSubmit} className="space-y-4 text-xs text-slate-700">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Pilih Anggota</label>
                <select
                  value={savingsMemberId}
                  onChange={(e) => {
                    setSavingsMemberId(e.target.value);
                    setSavingsSuccess('');
                    setSavingsError('');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-all text-slate-800"
                >
                  <option value="">-- Pilih ID Anggota --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.memberId}>
                      {m.memberId} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSavingsMember && (
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5 text-[11px] text-slate-600 shadow-2xs">
                  <div className="font-bold text-slate-800">{selectedSavingsMember.name}</div>
                  <div className="grid grid-cols-2 gap-1 pt-1.5 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 block uppercase text-[8px] font-bold">Simpanan Wajib</span>
                      <span className="font-extrabold text-slate-700">{formatIDR(selectedSavingsMember.savings.wajib)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[8px] font-bold">Simpanan Sukarela</span>
                      <span className="font-extrabold text-blue-700">{formatIDR(selectedSavingsMember.savings.sukarela)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Jenis Transaksi</label>
                <div className="bg-slate-100 p-0.5 rounded-lg flex">
                  <button
                    type="button"
                    onClick={() => setSavingsTxType('setor')}
                    className={`flex-1 py-1.5 text-center rounded-md font-bold transition-all cursor-pointer text-xs ${
                      savingsTxType === 'setor' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Setor (Simpan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSavingsTxType('tarik')}
                    className={`flex-1 py-1.5 text-center rounded-md font-bold transition-all cursor-pointer text-xs ${
                      savingsTxType === 'tarik' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Tarik (Ambil)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Nominal Rupiah (Rp)</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="Contoh: 50000"
                  value={savingsAmount || ''}
                  onChange={(e) => setSavingsAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Catatan / Keterangan</label>
                <input
                  type="text"
                  placeholder="Setoran tunai, penarikan harian, dll."
                  value={savingsNotes}
                  onChange={(e) => setSavingsNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-850"
                />
              </div>

              {savingsError && (
                <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-rose-800 font-semibold flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  <span>{savingsError}</span>
                </div>
              )}
              {savingsSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-emerald-800 font-semibold flex items-center gap-1.5">
                  <Check size={14} />
                  <span>{savingsSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                {savingsTxType === 'setor' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                Proses Transaksi Simpanan
              </button>
            </form>
          </div>

          {/* Table summary of balances */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Monitoring Saldo Buku Tabungan</h3>
              <p className="text-xs text-slate-400 font-medium">Buku pantau saldo Tabungan Sukarela (S3) masing-masing Anggota</p>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Anggota</th>
                    <th className="p-3 text-right">Sukarela (S3)</th>
                    <th className="p-3 text-right font-bold text-slate-700">Total Simpanan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {members.map(m => {
                    const total = m.savings.pokok + m.savings.wajib + m.savings.sukarela;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-slate-800 block">{m.name}</span>
                          <span className="font-mono text-[9px] font-bold text-slate-400">{m.memberId}</span>
                        </td>
                        <td className="p-3 text-right font-mono text-blue-750 font-bold">
                          {formatIDR(m.savings.sukarela)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800 bg-slate-50/30">
                          {formatIDR(total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Penyertaan Modal Sub-tab */}
      {activeSubTab === 'penyertaan_modal' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in" id="usp-modal-view">
          <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wide block">Penyertaan Modal Koperasi</span>
              <h3 className="font-black text-slate-900 text-lg">Aliran Dana Penyertaan Modal USP</h3>
              <p className="text-xs text-slate-400 font-medium">Buku pantau modal disetor dari Koperasi Karya Mukti Pusat untuk modal operasional penyaluran kredit.</p>
            </div>
            {!showAddModalForm && (
              <button
                onClick={() => setShowAddModalForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors self-start cursor-pointer shadow-xs"
              >
                <Coins size={14} />
                Input Modal Awal
              </button>
            )}
          </div>

          {/* Form Input Modal Awal / Tambahan */}
          {showAddModalForm && (
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs animate-fade-in">
              <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Form Input Modal Awal / Tambahan</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Penyertaan dana tambahan dari pengurus untuk modal operasional simpan pinjam</p>
                </div>
                <button
                  onClick={() => setShowAddModalForm(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              
              <form onSubmit={handleApplyCapital} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Nominal Rupiah (Rp)</label>
                  <input
                    type="number"
                    min="100000"
                    required
                    placeholder="Contoh: 10000000"
                    value={modalAmount || ''}
                    onChange={(e) => setModalAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Sumber Modal / Penyetor</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Koperasi Karya Mukti Pusat"
                    value={modalSource}
                    onChange={(e) => setModalSource(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Tanggal Penerimaan</label>
                  <input
                    type="date"
                    required
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Catatan / Keterangan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Setoran modal awal pendirian, dana talangan pengurus, dll."
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                
                {modalError && (
                  <div className="md:col-span-2 bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-rose-800 font-semibold flex items-center gap-1.5">
                    <ShieldAlert size={14} />
                    <span>{modalError}</span>
                  </div>
                )}
                {modalSuccess && (
                  <div className="md:col-span-2 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-emerald-800 font-semibold flex items-center gap-1.5">
                    <Check size={14} />
                    <span>{modalSuccess}</span>
                  </div>
                )}
                
                <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModalForm(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Coins size={14} />
                    Simpan Penyertaan Modal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Modal Awal Disetor</span>
              <span className="text-base font-black font-mono text-slate-800 block">
                {formatIDR(capitalContributions.reduce((sum, c) => sum + c.amount, 0))}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Total modal terkumpul disetor</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Penyaluran Kredit</span>
              <span className="text-base font-black font-mono text-blue-700 block">
                {formatIDR(loans.filter(l => l.status === 'aktif').reduce((sum, l) => sum + l.amountRequested, 0))}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Total pinjaman aktif beredar</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Sisa Alokasi Modal</span>
              <span className="text-base font-black font-mono text-emerald-600 block">
                {formatIDR(Math.max(0, capitalContributions.reduce((sum, c) => sum + c.amount, 0) - loans.filter(l => l.status === 'aktif').reduce((sum, l) => sum + l.amountRequested, 0)))}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Sisa kas modal belum tersalurkan</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Histori Jurnal Transaksi Modal</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              {capitalContributions.map((c) => (
                <div key={c.id} className="p-3.5 bg-slate-50/20 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">{c.source}</span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 font-medium">
                      <span>Tanggal: {c.date}</span>
                      <span>Otorisasi: {c.officer}</span>
                      {c.notes && <span className="italic">"{c.notes}"</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-extrabold text-emerald-600 mr-2">+{formatIDR(c.amount)}</span>
                    <button
                      onClick={() => handleOpenEditCapital(c)}
                      className="text-amber-600 hover:text-amber-700 p-1.5 rounded-md hover:bg-amber-50 cursor-pointer transition-colors"
                      title="Edit penyertaan modal"
                    >
                      <Edit2 size={12} />
                    </button>
                    {c.id !== 'cap-1' && (
                      <button
                        onClick={() => handleDeleteCapital(c.id)}
                        className="text-rose-600 hover:text-rose-700 p-1.5 rounded-md hover:bg-rose-50 cursor-pointer transition-colors"
                        title="Hapus penyertaan modal"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Penarikan & Pengajuan Sub-tab */}
      {activeSubTab === 'penarikan_pengajuan' && (
        <div className="space-y-6 animate-fade-in" id="usp-penarikan-pengajuan-view">
          {/* Credit Simulator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Simulator */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-sm">Simulasi Pengajuan Kredit Baru</h3>
                <p className="text-xs text-slate-400 font-medium font-bold">Simulasi amortisasi cicilan flat berlandaskan prinsip koperasi</p>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Plafond Pengajuan (Rupiah)</label>
                  <input
                    type="number"
                    step="500000"
                    min="1000000"
                    max="100000000"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Math.max(1000000, Number(e.target.value)))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-blue-500 font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 block font-medium">Batas regulasi maks: {formatIDR(maxPlafon)}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Tenor Pembayaran (Bulan)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={calcTenor}
                    onChange={(e) => setCalcTenor(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-blue-500 font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Suku Bunga Bulanan (% Flat)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.0"
                    max="3.0"
                    value={calcInterest}
                    onChange={(e) => setCalcInterest(Math.max(0.0, Number(e.target.value)))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:outline-none text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 block font-medium">Aturan pengurus: {interestRate}%</span>
                </div>
              </div>
            </div>

            {/* Application submit and output */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-sm">Detail Amortisasi & Pengajuan</h3>
                <p className="text-xs text-slate-400 font-medium">Kalkulasi cicilan bulanan yang harus dipenuhi</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pokok / Bulan:</span>
                    <span className="font-mono font-bold text-slate-700">{formatIDR(calcDetails.monthlyPrincipal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bunga / Bulan:</span>
                    <span className="font-mono font-bold text-slate-700">{formatIDR(calcDetails.monthlyInterest)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-blue-700 text-xs">
                    <span>Total / Bulan:</span>
                    <span className="font-mono">{formatIDR(calcDetails.monthlyTotal)}</span>
                  </div>
                </div>

                <div className="space-y-2 border-l border-slate-250 pl-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wide font-bold block">Biaya Administrasi (RP)</span>
                    <span className="text-xs font-bold text-slate-800 font-mono block">
                      {formatIDR(adminFee)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wide font-bold block">Pencairan Bersih (Net)</span>
                    <span className="text-xs font-black text-emerald-600 font-mono block">
                      {formatIDR(Math.max(0, calcAmount - adminFee))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form direct apply */}
              <form onSubmit={handleApplyLoanSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Pilih Anggota Pengaju Kredit</label>
                  <select
                    value={applyMemberId}
                    onChange={(e) => setApplyMemberId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none text-slate-800"
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
                  <label className="font-bold text-slate-600 block">Tujuan Penggunaan Pinjaman</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Renovasi Rumah, Biaya Sekolah Anak"
                    value={applyPurpose}
                    onChange={(e) => setApplyPurpose(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                {applyError && (
                  <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-rose-800 font-semibold flex items-center gap-1.5">
                    <ShieldAlert size={14} />
                    <span>{applyError}</span>
                  </div>
                )}
                {applySuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-emerald-800 font-semibold flex items-center gap-1.5">
                    <Check size={14} />
                    <span>{applySuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Ajukan Berkas Pengajuan Kredit
                </button>
              </form>
            </div>
          </div>

          {/* Otoritas Multi-level Section */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 rounded-2xl text-white space-y-4 shadow-sm border border-slate-800" id="multi-level-auth-section">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/50 pb-4">
              <div>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block">Panel Verifikasi Berjenjang</span>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Briefcase size={16} className="text-blue-400" />
                  Otoritas Pengurus: <span className="text-blue-400 capitalize">{roleCredentials[currentRole]?.title || 'Staff'}</span>
                </h3>
                {authenticatedRoles[currentRole] && (
                  <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                    ● Terverifikasi: {roleCredentials[currentRole].name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-700/40 p-0.5 rounded-lg flex border border-slate-700/50">
                  {[
                    { id: 'operator_sp', label: '1. Operator SP' },
                    { id: 'verifikator_ketua', label: '2. Ketua Koperasi' },
                    { id: 'verifikator_bendahara', label: '3. Bendahara' }
                  ].map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSwitch(role.id as any)}
                      className={`text-[10px] font-bold px-2.5 py-1 text-center rounded-md cursor-pointer whitespace-nowrap transition-all ${
                        currentRole === role.id ? 'bg-blue-600 text-white font-extrabold shadow-sm' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
                {authenticatedRoles[currentRole] && (
                  <button
                    onClick={() => setAuthenticatedRoles(prev => ({ ...prev, [currentRole]: false }))}
                    className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 rounded-lg text-slate-400 transition-colors border border-slate-700 cursor-pointer text-xs"
                    title="Kunci Otoritas (Logout)"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* If NOT authenticated for the selected role */}
            {!authenticatedRoles[currentRole] ? (
              <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6 text-center max-w-md mx-auto space-y-4 my-2 animate-fade-in" id="auth-verification-form">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <UserCheck size={22} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-100">Verifikasi Kode PIN Pengurus</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Masukkan PIN Otoritas Anda untuk menandatangani dokumen persetujuan kredit ini secara digital.
                  </p>
                </div>

                <div className="p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl text-left">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Pengurus Terpilih:</span>
                  <span className="font-bold text-xs text-blue-400 block">{roleCredentials[currentRole]?.name || 'Petugas'}</span>
                  <span className="text-[10px] text-slate-300 font-medium block mt-0.5">{roleCredentials[currentRole]?.title || 'Jabatan'}</span>
                </div>

                <form onSubmit={handleVerifyPIN} className="space-y-3">
                  <div className="space-y-1">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="• • • •"
                      value={pinInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPinInput(val);
                      }}
                      className="w-32 tracking-widest text-center text-lg font-mono font-black p-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {pinError && (
                    <p className="text-[10px] text-rose-400 font-bold">{pinError}</p>
                  )}

                  <div className="flex gap-2 justify-center">
                    <button
                      type="submit"
                      className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm"
                    >
                      Konfirmasi PIN
                    </button>
                  </div>
                </form>

                <div className="text-[9px] text-slate-500 pt-3 border-t border-slate-800/80">
                  <span className="font-bold block text-slate-400">Petunjuk Simulasi PIN Pengurus Baru:</span>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1 text-slate-400">
                    <span>Operator SP: <strong className="font-mono text-blue-400">4444</strong></span>
                    <span>Ketua: <strong className="font-mono text-blue-400">3333</strong></span>
                    <span>Bendahara: <strong className="font-mono text-blue-400">2222</strong></span>
                    <span>Admin: <strong className="font-mono text-blue-400">9999</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              /* Approvals table / list */
              loans.filter(l => l.status !== 'aktif' && l.status !== 'lunas' && l.status !== 'ditolak').length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center gap-1 animate-fade-in" id="empty-verification-queue">
                  <ShieldCheck size={32} className="text-emerald-400" />
                  <p className="font-bold text-slate-200">Antrean Verifikasi Kosong</p>
                  <p className="text-[11px] text-slate-400">Tidak ada pengajuan kredit yang memerlukan otorisasi saat ini.</p>
                </div>
              ) : (
                <div className="space-y-4 text-slate-900 animate-fade-in" id="verification-queue-list">
                  {loans
                    .filter(l => l.status !== 'aktif' && l.status !== 'lunas' && l.status !== 'ditolak')
                    .map(loan => {
                      const isStaffApproved = loan.approvalWorkflow.staff.status === 'approved';
                      const isChairmanApproved = loan.approvalWorkflow.chairman.status === 'approved';
                      const isManagerApproved = loan.approvalWorkflow.manager.status === 'approved';

                      const isStaffPending = loan.approvalWorkflow.staff.status === 'pending';
                      const isChairmanPending = loan.approvalWorkflow.chairman.status === 'pending';
                      const isManagerPending = loan.approvalWorkflow.manager.status === 'pending';

                      let canCurrentRoleApprove = false;
                      let blockReason = '';

                      if (currentRole === 'operator_sp') {
                        if (isStaffPending) {
                          canCurrentRoleApprove = true;
                        } else {
                          blockReason = 'Langkah Operator Simpan Pinjam sudah diselesaikan.';
                        }
                      } else if (currentRole === 'verifikator_ketua') {
                        if (!isStaffApproved) {
                          blockReason = 'Menunggu persetujuan Operator SP terlebih dahulu.';
                        } else if (isChairmanPending) {
                          canCurrentRoleApprove = true;
                        } else {
                          blockReason = 'Langkah Ketua Koperasi sudah diselesaikan.';
                        }
                      } else if (currentRole === 'verifikator_bendahara') {
                        if (!isStaffApproved) {
                          blockReason = 'Menunggu persetujuan Operator SP terlebih dahulu.';
                        } else if (!isChairmanApproved) {
                          blockReason = 'Menunggu persetujuan Ketua Koperasi terlebih dahulu.';
                        } else if (isManagerPending) {
                          canCurrentRoleApprove = true;
                        } else {
                          blockReason = 'Langkah Bendahara sudah diselesaikan.';
                        }
                      }

                      return (
                        <div key={loan.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white space-y-3" id={`loan-verification-card-${loan.id}`}>
                          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <div>
                              <h4 className="font-bold text-xs">{loan.memberName} <span className="font-mono text-slate-400">({loan.memberId})</span></h4>
                              <p className="text-[10px] text-slate-400">"{loan.purpose}"</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black font-mono text-blue-400">{formatIDR(loan.amountRequested)}</span>
                              <span className="text-[9px] text-slate-400 block">{loan.tenor} Bulan | Bunga: {loan.interestRate}%</span>
                            </div>
                          </div>

                          {/* Workflow steps visual */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[10px]">
                            <div className={`p-2 rounded border ${isStaffApproved ? 'bg-blue-950/40 border-blue-800 text-blue-200' : loan.approvalWorkflow.staff.status === 'rejected' ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-slate-850 border-slate-700 text-slate-400'}`}>
                              <span className="font-bold">1. Operator SP: {loan.approvalWorkflow.staff.status.toUpperCase()}</span>
                              {loan.approvalWorkflow.staff.officerName && <span className="block text-[9px] text-slate-400 truncate">{loan.approvalWorkflow.staff.officerName}</span>}
                            </div>
                            <div className={`p-2 rounded border ${isChairmanApproved ? 'bg-blue-950/40 border-blue-800 text-blue-200' : loan.approvalWorkflow.chairman.status === 'rejected' ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-slate-850 border-slate-700 text-slate-400'}`}>
                              <span className="font-bold">2. Ketua Koperasi: {loan.approvalWorkflow.chairman.status.toUpperCase()}</span>
                              {loan.approvalWorkflow.chairman.officerName && <span className="block text-[9px] text-slate-400 truncate">{loan.approvalWorkflow.chairman.officerName}</span>}
                            </div>
                            <div className={`p-2 rounded border ${isManagerApproved ? 'bg-blue-950/40 border-blue-800 text-blue-200' : loan.approvalWorkflow.manager.status === 'rejected' ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-slate-850 border-slate-700 text-slate-400'}`}>
                              <span className="font-bold">3. Bendahara: {loan.approvalWorkflow.manager.status.toUpperCase()}</span>
                              {loan.approvalWorkflow.manager.officerName && <span className="block text-[9px] text-slate-400 truncate">{loan.approvalWorkflow.manager.officerName}</span>}
                            </div>
                          </div>

                          {/* Approve controls */}
                          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                            {canCurrentRoleApprove ? (
                              <>
                                <input
                                  type="text"
                                  placeholder="Masukkan catatan kelayakan..."
                                  value={approvalNotes[loan.id] || ''}
                                  onChange={(e) => setApprovalNotes({ ...approvalNotes, [loan.id]: e.target.value })}
                                  className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs focus:outline-none text-white"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleApproveAction(loan.id, 'rejected')}
                                    className="bg-rose-900/50 hover:bg-rose-900 text-rose-200 border border-rose-800 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
                                  >
                                    Tolak
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveAction(loan.id, 'approved')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
                                  >
                                    Setujui
                                  </button>
                                </div>
                              </>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic">Otoritas dinonaktifkan: {blockReason}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* 6. Laporan Sub-tab */}
      {activeSubTab === 'laporan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="usp-laporan-view">
          {/* Repay desk */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Loket Pembayaran Angsuran</h3>
              <p className="text-xs text-slate-400 font-medium">Setor angsuran berjalan untuk melunasi outstanding pinjaman</p>
            </div>

            <form onSubmit={handleRepaySubmit} className="space-y-4 text-xs text-slate-700">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Pilih Kontrak Pinjaman Aktif</label>
                <select
                  value={selectedLoanId}
                  onChange={(e) => {
                    setSelectedLoanId(e.target.value);
                    setRepaySuccess('');
                    setRepayError('');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-all text-slate-800"
                >
                  <option value="">-- Pilih Berkas Pinjaman --</option>
                  {loans
                    .filter(l => l.status === 'aktif')
                    .map(l => (
                      <option key={l.id} value={l.id}>
                        {l.memberId} - {l.memberName} (Sisa: {formatIDR(l.remainingBalance)})
                      </option>
                    ))}
                </select>
              </div>

              {selectedLoanId && (() => {
                const loan = loans.find(l => l.id === selectedLoanId);
                if (!loan) return null;
                const nextInstNum = loan.repaymentHistory.length + 1;

                return (
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2.5 text-[11px] text-slate-600 shadow-2xs">
                    <div className="font-bold text-slate-800">{loan.memberName} ({loan.memberId})</div>
                    <div className="space-y-1.5 pt-2 border-t border-slate-250">
                      <div className="flex justify-between">
                        <span>Plafond Pokok Awal:</span>
                        <span className="font-extrabold text-slate-700">{formatIDR(loan.amountRequested)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Angsuran Ke:</span>
                        <span className="font-extrabold text-blue-800">{nextInstNum} dari {loan.tenor}</span>
                      </div>
                      <div className="flex justify-between font-bold text-blue-700">
                        <span>Tagihan Bulan Ini:</span>
                        <span>{formatIDR(Math.min(loan.monthlyInstallment, loan.remainingBalance))}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {repayError && (
                <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-rose-800 font-semibold flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  <span>{repayError}</span>
                </div>
              )}
              {repaySuccess && (
                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-emerald-800 font-semibold flex items-center gap-1.5">
                  <Check size={14} />
                  <span>{repaySuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                Bayar Tagihan Angsuran
              </button>
            </form>
          </div>

          {/* Active loans table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Portofolio Pinjaman Berjalan</h3>
              <p className="text-xs text-slate-400 font-medium">Buku pantau amortisasi kredit anggota yang beredar</p>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    <th className="p-3">Anggota Peminjam</th>
                    <th className="p-3 text-right">Plafond Awal</th>
                    <th className="p-3 text-right">Sisa Tagihan</th>
                    <th className="p-3 text-center">Angsuran Paid</th>
                    <th className="p-3 text-right">Cicilan / Bln</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loans.filter(l => l.status === 'aktif' || l.status === 'lunas').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Tidak ada kontrak pinjaman berjalan pada sistem saat ini.
                      </td>
                    </tr>
                  ) : (
                    loans
                      .filter(l => l.status === 'aktif' || l.status === 'lunas')
                      .map(l => (
                        <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-slate-800 block">{l.memberName}</span>
                            <span className="font-mono text-[9px] font-bold text-slate-400">{l.memberId}</span>
                          </td>
                          <td className="p-3 text-right font-mono text-slate-500">
                            {formatIDR(l.amountRequested)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">
                            {formatIDR(l.remainingBalance)}
                          </td>
                          <td className="p-3 text-center font-mono text-[10px] font-bold text-slate-500">
                            {l.repaymentHistory.length} / {l.tenor} Bln
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-blue-750">
                            {formatIDR(l.monthlyInstallment)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              l.status === 'lunas' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}>
                              {l.status === 'lunas' ? 'Lunas' : 'Aktif'}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Capital Contribution Modal */}
      {editingCapital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4" id="capital-edit-modal">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 w-full max-w-md p-6 space-y-4 animate-fade-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-850 text-sm">Formulir Edit Data Transaksi Modal</h3>
                <p className="text-[10px] text-slate-400 font-medium">Ubah rincian penyertaan modal koperasi</p>
              </div>
              <button 
                onClick={() => setEditingCapital(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditCapital} className="space-y-4 text-xs text-slate-700">
              
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 block">Nominal Rupiah (Rp) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="100000"
                  required
                  placeholder="Contoh: 10000000"
                  value={editCapitalAmount || ''}
                  onChange={(e) => setEditCapitalAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 block">Sumber Modal / Penyetor <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Koperasi Karya Mukti Pusat"
                  value={editCapitalSource}
                  onChange={(e) => setEditCapitalSource(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 block">Tanggal Penerimaan <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  value={editCapitalDate}
                  onChange={(e) => setEditCapitalDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 block">Catatan / Keterangan</label>
                <input
                  type="text"
                  placeholder="Keterangan transaksi modal"
                  value={editCapitalNotes}
                  onChange={(e) => setEditCapitalNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCapital(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check size={14} /> Simpan Perubahan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
