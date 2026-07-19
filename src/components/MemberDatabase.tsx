import React, { useState } from 'react';
import { Member, Transaction, Loan } from '../types';
import { 
  Search, 
  UserPlus, 
  Eye, 
  Phone, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Coins, 
  FileText, 
  Check, 
  AlertCircle,
  X,
  CreditCard,
  Edit2,
  Trash2
} from 'lucide-react';

interface MemberDatabaseProps {
  members: Member[];
  transactions: Transaction[];
  loans: Loan[];
  onAddMember: (newMember: Member, initialDeposit: number) => void;
  onEditMember?: (updatedMember: Member) => void;
  onDeleteMember?: (memberId: string) => void;
}

export default function MemberDatabase({
  members,
  transactions,
  loans,
  onAddMember,
  onEditMember,
  onDeleteMember
}: MemberDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- New Member Form State ---
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [initialSukarela, setInitialSukarela] = useState(0);

  // --- Edit Member Form State ---
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStatus, setEditStatus] = useState<'aktif' | 'non-aktif'>('aktif');
  const [editPokok, setEditPokok] = useState(0);
  const [editWajib, setEditWajib] = useState(0);
  const [editSukarela, setEditSukarela] = useState(0);

  const handleOpenEditModal = (member: Member) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditPhone(member.phone);
    setEditAddress(member.address);
    setEditStatus(member.status);
    setEditPokok(member.savings.pokok);
    setEditWajib(member.savings.wajib);
    setEditSukarela(member.savings.sukarela);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const updated: Member = {
      ...editingMember,
      name: editName,
      phone: editPhone,
      address: editAddress,
      status: editStatus,
      savings: {
        pokok: Number(editPokok),
        wajib: Number(editWajib),
        sukarela: Number(editSukarela)
      }
    };

    if (onEditMember) {
      onEditMember(updated);
    }
    
    // Update selectedMember if it's currently selected
    if (selectedMember?.id === editingMember.id) {
      setSelectedMember(updated);
    }

    setEditingMember(null);
  };

  // --- Search & Filter ---
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.memberId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Financial calculation for selected member ---
  const getMemberLoans = (memberId: string) => {
    return loans.filter(l => l.memberId === memberId);
  };

  const getMemberTransactions = (memberId: string) => {
    return transactions.filter(t => t.referenceId === memberId);
  };

  const getMemberTotalTransactionsCount = (memberId: string) => {
    // Both referenced transactions AND transactions whose description contains member name
    return transactions.filter(t => t.referenceId === memberId || t.description.includes(memberId)).length;
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // --- Form submission ---
  const handleSubmitNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    const newId = `m${Date.now()}`;
    const nextNum = members.length + 1;
    const formattedId = `KOP-${String(nextNum).padStart(3, '0')}`;

    const newMember: Member = {
      id: newId,
      memberId: formattedId,
      name: formName,
      phone: formPhone,
      address: formAddress || 'Ngaglik, Sleman',
      joinDate: new Date().toISOString().split('T')[0],
      savings: {
        pokok: 100000, // standard Rp 100k
        wajib: 20000,   // standard Rp 20k initial month
        sukarela: Number(initialSukarela) || 0
      },
      status: 'aktif'
    };

    onAddMember(newMember, Number(initialSukarela) || 0);

    // Reset forms
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setInitialSukarela(0);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6" id="member-database-panel">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="member-header-box">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Database Anggota Terpadu</h2>
          <p className="text-xs text-slate-400 font-medium">Database terpusat yang terintegrasi secara real-time ke semua unit usaha</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4.5 py-2.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-center shadow-xs"
          id="btn-register-member"
        >
          <UserPlus size={16} /> Daftar Anggota Baru
        </button>
      </div>

      {/* Main Grid: Member Table & Member Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="member-main-grid">
        
        {/* Left Column: Member List Search & Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4" id="member-list-box">
          
          {/* Search Box */}
          <div className="relative" id="search-input-wrapper">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari anggota berdasarkan nama atau nomor ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              id="member-search-bar"
            />
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs" id="member-table-container">
            <table className="w-full text-left border-collapse" id="member-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  <th className="p-3">ID Anggota</th>
                  <th className="p-3">Nama Lengkap</th>
                  <th className="p-3">Total Tabungan</th>
                  <th className="p-3">Kontrak S&P</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Anggota tidak ditemukan. Silakan tambahkan anggota baru.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => {
                    const totalSavings = m.savings.pokok + m.savings.wajib + m.savings.sukarela;
                    const activeLoans = getMemberLoans(m.memberId).filter(l => l.status === 'aktif');
                    const isSelected = selectedMember?.id === m.id;

                    return (
                      <tr 
                        key={m.id} 
                        className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-blue-50/25 font-semibold' : ''}`}
                      >
                        <td className="p-3 font-mono font-bold text-slate-800">{m.memberId}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{m.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{m.phone}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800">
                          {formatIDR(totalSavings)}
                        </td>
                        <td className="p-3">
                          {activeLoans.length > 0 ? (
                            <span className="bg-blue-55 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full text-[10px] font-bold inline-block">
                              {activeLoans.length} Pinjaman Aktif
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => setSelectedMember(m)}
                              className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-0.5 cursor-pointer hover:underline"
                              id={`btn-view-${m.memberId}`}
                              title="Detail Anggota"
                            >
                              <Eye size={13} /> <span className="sr-only sm:not-sr-only">Detail</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(m)}
                              className="text-amber-600 hover:text-amber-700 font-bold inline-flex items-center gap-0.5 cursor-pointer hover:underline"
                              id={`btn-edit-${m.memberId}`}
                              title="Edit Anggota"
                            >
                              <Edit2 size={13} /> <span className="sr-only sm:not-sr-only">Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus anggota ${m.name} (${m.memberId}) dari database?`)) {
                                  if (onDeleteMember) onDeleteMember(m.id);
                                  if (selectedMember?.id === m.id) setSelectedMember(null);
                                }
                              }}
                              className="text-rose-600 hover:text-rose-700 font-bold inline-flex items-center gap-0.5 cursor-pointer hover:underline"
                              id={`btn-delete-${m.memberId}`}
                              title="Hapus Anggota"
                            >
                              <Trash2 size={13} /> <span className="sr-only sm:not-sr-only">Hapus</span>
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

        {/* Right Column: Member Profile Details Card */}
        <div className="space-y-6" id="member-profile-column">
          {selectedMember ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5" id="member-detail-card">
              
              {/* Profile Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{selectedMember.name}</span>
                    <span className="bg-emerald-50 border border-emerald-150 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      {selectedMember.status}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-600">{selectedMember.memberId}</span>
                </div>
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Personal Info Box */}
              <div className="space-y-2 text-xs text-slate-600" id="personal-info-box">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span>{selectedMember.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{selectedMember.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Bergabung sejak {selectedMember.joinDate}</span>
                </div>
              </div>

              {/* Savings Balance Ledger Sheet */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3.5" id="member-savings-ledger">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Buku Simpanan Anggota</span>
                
                <div className="space-y-2.5 font-medium">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">1. Simpanan Pokok</span>
                    <span className="font-mono font-bold text-slate-800">{formatIDR(selectedMember.savings.pokok)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">2. Simpanan Wajib</span>
                    <span className="font-mono font-bold text-slate-800">{formatIDR(selectedMember.savings.wajib)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">3. Simpanan Sukarela</span>
                    <span className="font-mono font-bold text-emerald-600">{formatIDR(selectedMember.savings.sukarela)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-900">
                    <span>Total Simpanan</span>
                    <span className="font-mono text-slate-900">{formatIDR(selectedMember.savings.pokok + selectedMember.savings.wajib + selectedMember.savings.sukarela)}</span>
                  </div>
                </div>
              </div>

              {/* Active Loan Details */}
              <div className="space-y-2.5" id="member-loan-ledger">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Status Pinjaman</span>
                
                {getMemberLoans(selectedMember.memberId).length === 0 ? (
                  <div className="text-center p-3 border border-dashed border-slate-100 rounded-lg text-slate-400 text-xs">
                    Tidak ada riwayat pinjaman terdaftar.
                  </div>
                ) : (
                  getMemberLoans(selectedMember.memberId).map(loan => {
                    const statusColors = {
                      diajukan: 'bg-amber-50 text-amber-700 border-amber-200',
                      disetujui_staff: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                      disetujui_manajer: 'bg-blue-50 text-blue-700 border-blue-200',
                      aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      ditolak: 'bg-rose-50 text-rose-700 border-rose-200',
                      lunas: 'bg-slate-100 text-slate-600 border-slate-200'
                    };

                    return (
                      <div key={loan.id} className="border border-slate-100 p-3 rounded-lg space-y-1 bg-slate-50/10">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-800">Pinjaman Tenor {loan.tenor} Bln</span>
                          <span className={`text-[9px] font-semibold px-2 py-0.2 rounded-full border ${statusColors[loan.status] || 'bg-slate-100 text-slate-600'}`}>
                            {loan.status === 'aktif' ? 'Belum Lunas' : loan.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Plafond:</span>
                            <span className="font-medium text-slate-700">{formatIDR(loan.amountRequested)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sisa Pokok + Bunga:</span>
                            <span className="font-medium text-slate-700">{formatIDR(loan.remainingBalance)}</span>
                          </div>
                          {loan.status === 'aktif' && (
                            <div className="flex justify-between text-blue-600 font-bold">
                              <span>Angsuran Bulanan:</span>
                              <span>{formatIDR(loan.monthlyInstallment)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Transactions Log Feed */}
              <div className="space-y-2.5" id="member-tx-history">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Riwayat Transaksi Anggota</span>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {getMemberTransactions(selectedMember.memberId).length === 0 ? (
                    <div className="text-center p-3 text-slate-400 text-xs">
                      Belum ada log transaksi.
                    </div>
                  ) : (
                    getMemberTransactions(selectedMember.memberId).slice().reverse().map(tx => (
                      <div key={tx.id} className="text-xs p-2 rounded bg-slate-50/50 flex items-center justify-between border-l-2 border-emerald-600">
                        <div>
                          <span className="font-semibold text-slate-800 block">{tx.description}</span>
                          <span className="text-[10px] text-slate-400">{tx.date.substring(5, 16)} • {tx.category}</span>
                        </div>
                        <span className={`font-mono font-bold ${tx.type === 'kas_masuk' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {tx.type === 'kas_masuk' ? '+' : '-'}{formatIDR(tx.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-xl p-8 shadow-xs text-center text-slate-400 flex flex-col items-center justify-center h-full min-h-64 space-y-2" id="member-no-selection">
              <Coins size={36} className="text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Pilih Anggota</p>
              <p className="text-[11px] max-w-[200px]">Silakan klik tombol "Detail" di samping daftar anggota untuk membuka buku simpanan lengkap.</p>
            </div>
          )}
        </div>

      </div>

      {/* Register Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4" id="member-registration-modal">
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 w-full max-w-md p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Formulir Pendaftaran Anggota Baru</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitNewMember} className="space-y-4 text-xs text-slate-700">
              
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600">Nama Lengkap Sesuai KTP <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Joko Prasetyo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600">Nomor Telepon / WhatsApp <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  placeholder="Contoh: Sleman, Yogyakarta"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Automatic savings explanation */}
              <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3.5 space-y-2 text-[11px] text-blue-800">
                <div className="font-bold flex items-center gap-1">
                  <Check size={14} className="text-blue-600" /> Kewajiban Keuangan Awal Otomatis:
                </div>
                <div className="space-y-1 font-medium text-blue-700">
                  <div className="flex justify-between">
                    <span>• Simpanan Pokok (Bayar 1 Kali):</span>
                    <span className="font-bold">{formatIDR(100000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Simpanan Wajib (Bulan Pertama):</span>
                    <span className="font-bold">{formatIDR(20000)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600">Setoran Simpanan Sukarela Awal (Opsional)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Contoh: 50000"
                  value={initialSukarela || ''}
                  onChange={(e) => setInitialSukarela(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <span className="text-[10px] text-slate-400">Merupakan saldo fleksibel yang bisa ditarik kapan saja atau digunakan berbelanja di unit toko.</span>
              </div>

              <div className="flex items-center gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer inline-flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Check size={14} /> Daftarkan Anggota
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4" id="member-edit-modal">
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 w-full max-w-md p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Formulir Edit Data Anggota</h3>
              <button 
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs text-slate-700">
              
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600">ID Anggota (Tidak dapat diubah)</label>
                <input
                  type="text"
                  disabled
                  value={editingMember.memberId}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600">Nama Lengkap Sesuai KTP <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Joko Prasetyo"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600">Nomor Telepon / WhatsApp <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  placeholder="Contoh: Sleman, Yogyakarta"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600">Status Keanggotaan</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'aktif' | 'non-aktif')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-850"
                >
                  <option value="aktif">Aktif</option>
                  <option value="non-aktif">Non-Aktif</option>
                </select>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2.5">
                <span className="font-bold text-slate-700 block">Koreksi Saldo Simpanan (Khusus Admin/Operator)</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold block">Pokok (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={editPokok}
                      onChange={(e) => setEditPokok(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold block">Wajib (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={editWajib}
                      onChange={(e) => setEditWajib(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold block">Sukarela (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={editSukarela}
                      onChange={(e) => setEditSukarela(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer inline-flex items-center gap-1 shadow-xs transition-colors"
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
