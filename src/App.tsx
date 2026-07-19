import React, { useState, useEffect } from 'react';
import { Member, Loan, Transaction, WartelRecord, PertokoanSale, PertokoanProduct, UserAccount } from './types';
import { 
  INITIAL_MEMBERS, 
  INITIAL_LOANS, 
  INITIAL_PRODUCTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_WARTEL_RECORDS, 
  INITIAL_SHOP_SALES 
} from './data/initialData';

import Dashboard from './components/Dashboard';
import MemberDatabase from './components/MemberDatabase';
import WartelUnit from './components/WartelUnit';
import SimpanPinjamUnit from './components/SimpanPinjamUnit';
import PertokoanUnit from './components/PertokoanUnit';
import FinancialReports from './components/FinancialReports';
import BendaharaTreasury from './components/BendaharaTreasury';

import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  Coins, 
  ShoppingBag, 
  FileText, 
  Wallet,
  Building,
  Menu,
  X,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [cooperativeName, setCooperativeName] = useState<string>(() => {
    return localStorage.getItem('kop_cooperative_name') || 'Koperasi Karya Mukti';
  });

  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('kop_accounts');
    if (saved) return JSON.parse(saved);
    return [
      { username: 'admin', name: 'Super Admin', role: 'admin', pin: '9999' },
      { username: 'ketua', name: 'Danang Andriyanto', role: 'verifikator_ketua', pin: '3333' },
      { username: 'bendahara', name: 'Hendra Wijaya', role: 'verifikator_bendahara', pin: '2222' },
      { username: 'op_sp', name: 'Siti Aminah', role: 'operator_sp', pin: '4444' },
      { username: 'op_toko', name: 'Budi Santoso', role: 'operator_toko', pin: '5555' },
      { username: 'op_wartel', name: 'Dewi Sartika', role: 'operator_wartel', pin: '6666' }
    ];
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('kop_current_user');
    if (saved) return JSON.parse(saved);
    // Standard default logged-in user is Ketua Koperasi for easy initial audit
    return { username: 'ketua', name: 'Danang Andriyanto', role: 'verifikator_ketua', pin: '3333' };
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<string>('pengurus');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('kop_cooperative_name', cooperativeName);
  }, [cooperativeName]);

  useEffect(() => {
    localStorage.setItem('kop_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kop_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('kop_current_user');
    }
  }, [currentUser]);

  // --- Real-time Local State Persistence ---
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('kop_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('kop_loans');
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [products, setProducts] = useState<PertokoanProduct[]>(() => {
    const saved = localStorage.getItem('kop_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('kop_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [wartelRecords, setWartelRecords] = useState<WartelRecord[]>(() => {
    const saved = localStorage.getItem('kop_wartel');
    return saved ? JSON.parse(saved) : INITIAL_WARTEL_RECORDS;
  });

  const [sales, setSales] = useState<PertokoanSale[]>(() => {
    const saved = localStorage.getItem('kop_sales');
    return saved ? JSON.parse(saved) : INITIAL_SHOP_SALES;
  });

  // --- Auto-save to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('kop_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('kop_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('kop_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kop_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('kop_wartel', JSON.stringify(wartelRecords));
  }, [wartelRecords]);

  useEffect(() => {
    localStorage.setItem('kop_sales', JSON.stringify(sales));
  }, [sales]);

  // Migration effect for verifikator_staff removal
  useEffect(() => {
    const saved = localStorage.getItem('kop_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some((acc: any) => acc.role === 'verifikator_staff')) {
          const fresh = [
            { username: 'admin', name: 'Super Admin', role: 'admin', pin: '9999' },
            { username: 'ketua', name: 'Danang Andriyanto', role: 'verifikator_ketua', pin: '3333' },
            { username: 'bendahara', name: 'Hendra Wijaya', role: 'verifikator_bendahara', pin: '2222' },
            { username: 'op_sp', name: 'Siti Aminah', role: 'operator_sp', pin: '4444' },
            { username: 'op_toko', name: 'Budi Santoso', role: 'operator_toko', pin: '5555' },
            { username: 'op_wartel', name: 'Dewi Sartika', role: 'operator_wartel', pin: '6666' }
          ];
          setAccounts(fresh);
          localStorage.setItem('kop_accounts', JSON.stringify(fresh));

          const savedUser = localStorage.getItem('kop_current_user');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            if (parsedUser.role === 'verifikator_staff') {
              const defaultUser = { username: 'admin', name: 'Super Admin', role: 'admin', pin: '9999' };
              setCurrentUser(defaultUser);
              localStorage.setItem('kop_current_user', JSON.stringify(defaultUser));
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // --- Dynamic Tab Alignments ---
  useEffect(() => {
    if (activeTab === 'simpan_pinjam') {
      const allowed = ['pengurus', 'anggota', 'simpanan', 'penyertaan_modal', 'penarikan_pengajuan', 'laporan'];
      if (!allowed.includes(activeSubTab)) setActiveSubTab('pengurus');
    } else if (activeTab === 'pertokoan') {
      const allowed = ['generate_voucher', 'master_barang', 'order', 'laporan'];
      if (!allowed.includes(activeSubTab)) setActiveSubTab('order');
    } else if (activeTab === 'wartel') {
      const allowed = ['kasir', 'laporan'];
      if (!allowed.includes(activeSubTab)) setActiveSubTab('kasir');
    } else if (activeTab === 'laporan') {
      const allowed = ['kas_harian', 'laba_rugi', 'neraca'];
      if (!allowed.includes(activeSubTab)) setActiveSubTab('kas_harian');
    }
  }, [activeTab]);

  // --- Database Reseeder ---
  const handleResetDatabase = () => {
    if (confirm('Apakah Anda yakin ingin me-reset seluruh database koperasi kembali ke data seed awal? Seluruh perubahan data Anda akan dihapus.')) {
      setMembers(INITIAL_MEMBERS);
      setLoans(INITIAL_LOANS);
      setProducts(INITIAL_PRODUCTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setWartelRecords(INITIAL_WARTEL_RECORDS);
      setSales(INITIAL_SHOP_SALES);
      setActiveTab('dashboard');
    }
  };

  // --- ACTIONS & SYNCHRONIZATION ENGINES ---

  // 1. Add Member
  const handleAddMember = (newMember: Member, initialDeposit: number) => {
    // Append member
    setMembers(prev => [...prev, newMember]);

    // Record automatic cash transactions
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    const txPokok: Transaction = {
      id: `tx-pokok-${Date.now()}`,
      date: nowStr,
      type: 'kas_masuk',
      amount: 100000,
      unit: 'simpan_pinjam',
      category: 'Simpanan Pokok',
      description: `Simpanan Pokok awal pendaftaran anggota: ${newMember.name}`,
      referenceId: newMember.memberId,
      paymentMethod: 'cash'
    };

    const txWajib: Transaction = {
      id: `tx-wajib-${Date.now()}-1`,
      date: nowStr,
      type: 'kas_masuk',
      amount: 20000,
      unit: 'simpan_pinjam',
      category: 'Simpanan Wajib',
      description: `Simpanan Wajib iuran bulan ke-1: ${newMember.name}`,
      referenceId: newMember.memberId,
      paymentMethod: 'cash'
    };

    const extraTxs: Transaction[] = [txPokok, txWajib];

    if (initialDeposit > 0) {
      extraTxs.push({
        id: `tx-sukarela-${Date.now()}`,
        date: nowStr,
        type: 'kas_masuk',
        amount: initialDeposit,
        unit: 'simpan_pinjam',
        category: 'Simpanan Sukarela',
        description: `Simpanan Sukarela setoran awal: ${newMember.name}`,
        referenceId: newMember.memberId,
        paymentMethod: 'cash'
      });
    }

    setTransactions(prev => [...prev, ...extraTxs]);
  };

  // 2. Setor/Tarik Savings
  const handleUpdateSavings = (memberId: string, type: 'setor' | 'tarik', amount: number) => {
    // Update balance
    setMembers(prev => prev.map(m => {
      if (m.memberId === memberId) {
        const delta = type === 'setor' ? amount : -amount;
        return {
          ...m,
          savings: {
            ...m.savings,
            sukarela: m.savings.sukarela + delta
          }
        };
      }
      return m;
    }));

    // Record cash transaction
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const targetMember = members.find(m => m.memberId === memberId);
    const name = targetMember ? targetMember.name : memberId;

    const newTx: Transaction = {
      id: `tx-save-${Date.now()}`,
      date: nowStr,
      type: type === 'setor' ? 'kas_masuk' : 'kas_keluar',
      amount: amount,
      unit: 'simpan_pinjam',
      category: type === 'setor' ? 'Simpanan Sukarela' : 'Penarikan Sukarela',
      description: `${type === 'setor' ? 'Setoran' : 'Penarikan'} Simpanan Sukarela: ${name}`,
      referenceId: memberId,
      paymentMethod: 'cash'
    };

    setTransactions(prev => [...prev, newTx]);
  };

  // 3. Submit credit application
  const handleApplyLoan = (newLoan: Loan) => {
    setLoans(prev => [...prev, newLoan]);
  };

  // 4. Verification approval step
  const handleApproveLoan = (
    loanId: string, 
    level: 'staff' | 'manager' | 'chairman', 
    decision: 'approved' | 'rejected', 
    notes: string,
    officerName?: string
  ) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === loanId) {
        const updatedWorkflow = { ...loan.approvalWorkflow };
        const dateStr = new Date().toISOString().split('T')[0];

        const displayOfficer = officerName || (
          level === 'staff' ? 'Siti Aminah (Operator Simpan Pinjam)' :
          level === 'chairman' ? 'Danang Andriyanto (Ketua Koperasi)' : 'Hendra Wijaya (Bendahara)'
        );

        // 1. Assign values to workflow node
        if (level === 'staff') {
          updatedWorkflow.staff = { status: decision, officerName: displayOfficer, date: dateStr, notes };
        } else if (level === 'manager') {
          updatedWorkflow.manager = { status: decision, officerName: displayOfficer, date: dateStr, notes };
        } else if (level === 'chairman') {
          updatedWorkflow.chairman = { status: decision, officerName: displayOfficer, date: dateStr, notes };
        }

        // 2. Set intermediate or final statuses
        let finalStatus = loan.status;
        if (decision === 'rejected') {
          finalStatus = 'ditolak';
        } else {
          // If approved
          if (level === 'staff') {
            finalStatus = 'disetujui_staff';
          } else if (level === 'chairman') {
            finalStatus = 'disetujui_manajer';
          } else if (level === 'manager') {
            finalStatus = 'aktif'; // APPROVED AND FULLY ACTIVE!
            
            // --- AUTOMATED DISBURSEMENT TRANSACTION ON BENDAHARA'S APPROVAL ---
            const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const disburseTx: Transaction = {
              id: `tx-disburse-${Date.now()}`,
              date: nowStr,
              type: 'kas_keluar',
              amount: loan.amountRequested,
              unit: 'simpan_pinjam',
              category: 'Pencairan Pinjaman',
              description: `Pencairan modal pinjaman baru atas nama: ${loan.memberName}`,
              referenceId: loan.memberId,
              paymentMethod: 'cash'
            };

            // append disburse tx in async-friendly state updater
            setTimeout(() => {
              setTransactions(prevTx => [...prevTx, disburseTx]);
            }, 0);
          }
        }

        return {
          ...loan,
          status: finalStatus,
          approvalWorkflow: updatedWorkflow,
          startDate: level === 'manager' && decision === 'approved' ? dateStr : loan.startDate
        };
      }
      return loan;
    }));
  };

  // 5. Pay Loan Installment
  const handlePayInstallment = (loanId: string, amountPaid: number) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    // Repayment breakdown
    const installmentNum = loan.repaymentHistory.length + 1;
    // Flat approximation of interest vs principal
    const monthlyPrincipal = Math.round(loan.amountRequested / loan.tenor);
    const monthlyInterest = loan.monthlyInstallment - monthlyPrincipal;

    const newRepayment = {
      id: `repay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: amountPaid,
      principalPaid: Math.min(monthlyPrincipal, amountPaid),
      interestPaid: Math.max(0, amountPaid - monthlyPrincipal),
      installmentNumber: installmentNum
    };

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        const nextBalance = l.remainingBalance - amountPaid;
        return {
          ...l,
          remainingBalance: Math.max(0, nextBalance),
          status: nextBalance <= 0 ? 'lunas' : l.status,
          repaymentHistory: [...l.repaymentHistory, newRepayment]
        };
      }
      return l;
    }));

    // Record cash transaction ledger
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const txRepay: Transaction = {
      id: `tx-repay-${Date.now()}`,
      date: nowStr,
      type: 'kas_masuk',
      amount: amountPaid,
      unit: 'simpan_pinjam',
      category: 'Angsuran Pinjaman',
      description: `Penerimaan Angsuran Ke-${installmentNum} dari ${loan.memberName}`,
      referenceId: loan.id,
      paymentMethod: 'cash'
    };

    setTransactions(prev => [...prev, txRepay]);
  };

  // 6. Add Wartel Record
  const handleAddWartelRecord = (newRecord: WartelRecord) => {
    setWartelRecords(prev => [...prev, newRecord]);

    // Record transaction
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const txWartel: Transaction = {
      id: `tx-wartel-${Date.now()}`,
      date: nowStr,
      type: 'kas_masuk',
      amount: newRecord.sellingPrice,
      unit: 'wartel',
      category: 'Penjualan Wartel',
      description: `Omzet Wartel: ${newRecord.customerName} (${newRecord.serviceType})`,
      referenceId: newRecord.memberId || 'guest',
      paymentMethod: newRecord.paymentMethod
    };

    setTransactions(prev => [...prev, txWartel]);

    // Deduct member sukarela savings if they paid using deposit potong tabungan
    if (newRecord.paymentMethod === 'deposit' && newRecord.memberId) {
      setMembers(prevMembers => prevMembers.map(m => {
        if (m.memberId === newRecord.memberId) {
          return {
            ...m,
            savings: {
              ...m.savings,
              sukarela: Math.max(0, m.savings.sukarela - newRecord.sellingPrice)
            }
          };
        }
        return m;
      }));
    }
  };

  // 7. Add Pertokoan Sale POS
  const handleAddSale = (newSale: PertokoanSale) => {
    setSales(prev => [...prev, newSale]);

    // Record transaction ledger
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const txToko: Transaction = {
      id: `tx-toko-${Date.now()}`,
      date: nowStr,
      type: 'kas_masuk',
      amount: newSale.totalAmount,
      unit: 'pertokoan',
      category: 'Penjualan Toko',
      description: `Omzet Pertokoan: ${newSale.customerName} (Nota ${newSale.invoiceNumber})`,
      referenceId: newSale.memberId || 'guest',
      paymentMethod: newSale.paymentMethod
    };

    setTransactions(prev => [...prev, txToko]);

    // Deduct member balance if potong tabungan
    if (newSale.paymentMethod === 'deposit' && newSale.memberId) {
      setMembers(prevMembers => prevMembers.map(m => {
        if (m.memberId === newSale.memberId) {
          return {
            ...m,
            savings: {
              ...m.savings,
              sukarela: Math.max(0, m.savings.sukarela - newSale.totalAmount)
            }
          };
        }
        return m;
      }));
    }
  };

  // 8. Update Product Stock
  const handleUpdateProductStock = (productId: string, quantityToDeduct: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stock: Math.max(0, p.stock - quantityToDeduct)
        };
      }
      return p;
    }));
  };

  // 9. Generate Monthly Vouchers
  const handleGenerateVouchers = (totalAmount: number) => {
    // Generate voucher: add 230,000 IDR to each member's sukarela savings
    setMembers(prev => prev.map(m => ({
      ...m,
      savings: {
        ...m.savings,
        sukarela: m.savings.sukarela + 230000
      }
    })));

    // Record cooperative disburse subsidy
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const txVoucher: Transaction = {
      id: `tx-vch-${Date.now()}`,
      date: nowStr,
      type: 'kas_keluar',
      amount: totalAmount,
      unit: 'pertokoan',
      category: 'Biaya Operasional',
      description: `Disburse Subsidi Voucher Belanja Bulanan Anggota (Rp 230.000 x ${members.length} Anggota)`,
      referenceId: 'voucher_system',
      paymentMethod: 'cash'
    };

    setTransactions(prev => [...prev, txVoucher]);
  };

  // 10. Distribute SHU (Sisa Hasil Usaha) to Selected Members
  const handleDistributeSHU = (distributions: { memberId: string; amount: number }[]) => {
    // Update members savings by adding distributed amount to sukarela
    setMembers(prevMembers => prevMembers.map(m => {
      const dist = distributions.find(d => d.memberId === m.memberId);
      if (dist) {
        return {
          ...m,
          savings: {
            ...m.savings,
            sukarela: m.savings.sukarela + dist.amount
          }
        };
      }
      return m;
    }));

    // Record cash outflow ledger for SHU distribution
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newTransactions: Transaction[] = distributions.map(dist => {
      const memberObj = members.find(m => m.memberId === dist.memberId);
      const mName = memberObj ? memberObj.name : dist.memberId;
      return {
        id: `tx-shu-${Date.now()}-${dist.memberId}-${Math.floor(Math.random() * 1000)}`,
        date: nowStr,
        type: 'kas_keluar',
        amount: dist.amount,
        unit: 'umum',
        category: 'Bagi Hasil',
        description: `Pembagian Sisa Hasil Usaha (SHU) Koperasi ke Tabungan Sukarela Anggota ${mName}`,
        referenceId: dist.memberId,
        paymentMethod: 'cash'
      };
    });

    setTransactions(prev => [...prev, ...newTransactions]);
  };

  // 11. Add, Edit, Delete Products in Pertokoan Unit
  const handleAddProduct = (newProduct: PertokoanProduct) => {
    setProducts(prev => [...prev, newProduct]);
  };

  const handleEditProduct = (updatedProduct: PertokoanProduct) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Live consolidated Cash balance computation for the Header
  const cashBalance = transactions
    .reduce((sum, t) => sum + (t.type === 'kas_masuk' ? t.amount : -t.amount), 0);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const isTabAuthorized = (tab: string) => {
    if (!currentUser) return false;
    const role = currentUser.role;
    if (role === 'admin' || role === 'verifikator_bendahara') return true;
    if (role === 'verifikator_ketua') return ['dashboard', 'simpan_pinjam', 'laporan'].includes(tab);
    if (role === 'operator_sp') return ['dashboard', 'database_anggota', 'simpan_pinjam'].includes(tab);
    if (role === 'operator_toko') return ['dashboard', 'database_anggota', 'pertokoan'].includes(tab);
    if (role === 'operator_wartel') return ['dashboard', 'database_anggota', 'wartel'].includes(tab);
    return false;
  };

  if (currentUser === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 font-sans text-slate-100">
        <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6.5 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 text-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <Building size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">{cooperativeName}</h2>
              <p className="text-xs text-slate-400 font-medium">Masuk ke Sistem Keuangan Terintegrasi</p>
            </div>
          </div>

          {/* Quick Access Grid */}
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block text-center">Login Cepat Akses Kewenangan</span>
            <div className="grid grid-cols-1 gap-2 text-left">
              {accounts.map((acc) => {
                const roleLabel = acc.role
                  .replace('admin', 'Super Administrator (Akses Penuh)')
                  .replace('operator_sp', 'Operator Simpan Pinjam')
                  .replace('operator_toko', 'Operator Pertokoan')
                  .replace('operator_wartel', 'Operator Wartel')
                  .replace('verifikator_staff', 'Verifikator Staff')
                  .replace('verifikator_bendahara', 'Verifikator Bendahara')
                  .replace('verifikator_ketua', 'Ketua Koperasi');

                return (
                  <button
                    key={acc.username}
                    onClick={() => {
                      setCurrentUser(acc);
                      // Reset navigation tab based on authority
                      if (acc.role === 'operator_sp') {
                        setActiveTab('simpan_pinjam');
                        setActiveSubTab('pengurus');
                      } else if (acc.role === 'operator_toko') {
                        setActiveTab('pertokoan');
                        setActiveSubTab('order');
                      } else if (acc.role === 'operator_wartel') {
                        setActiveTab('wartel');
                        setActiveSubTab('kasir');
                      } else {
                        setActiveTab('dashboard');
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-left flex justify-between items-center cursor-pointer group"
                  >
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-[11px] text-white group-hover:text-blue-400 block truncate">
                        {acc.name}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold block uppercase tracking-wide">
                        {roleLabel}
                      </span>
                    </div>
                    <span className="text-[10px] text-blue-500 font-extrabold group-hover:text-blue-400">Masuk &rarr;</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 border-t border-slate-900 pt-3">
            Sistem Pembukuan Koperasi Multi-Usaha Terintegrasi
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="app-root">
      
      {/* Top Banner Navigation Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs print:hidden" id="main-header">
        <div className="flex items-center gap-3">
          {/* Mobile menu trigger */}
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 md:hidden cursor-pointer"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
              <Building size={20} />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm block tracking-tight">{cooperativeName}</span>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">3 Bidang Usaha Terintegrasi</span>
            </div>
          </div>
        </div>

        {/* Live global indicators */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 border border-slate-200 text-slate-800 rounded-lg py-1.5 px-3.5 hidden sm:flex items-center gap-2 shadow-2xs">
            <Wallet size={16} className="text-slate-500" />
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-500 block leading-tight tracking-wider">Kas Utama Koperasi</span>
              <span className="font-mono text-xs font-extrabold leading-none text-emerald-600">{formatIDR(cashBalance)}</span>
            </div>
          </div>

          {/* Active User Indicator and Logout button */}
          <div className="bg-blue-50 border border-blue-150 rounded-lg px-3 py-1.5 flex items-center gap-2.5">
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-900 block leading-tight">{currentUser.name}</span>
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-blue-750 block">
                {currentUser.role
                  .replace('admin', 'Administrator Utama (Akses Penuh)')
                  .replace('operator_sp', 'Op. Simpan Pinjam')
                  .replace('operator_toko', 'Op. Pertokoan')
                  .replace('operator_wartel', 'Op. Wartel')
                  .replace('verifikator_staff', 'Verifikator Staff')
                  .replace('verifikator_bendahara', 'Verifikator Bendahara')
                  .replace('verifikator_ketua', 'Ketua Koperasi')}
              </span>
            </div>
            <button
              onClick={() => {
                setCurrentUser(null);
                setActiveTab('dashboard');
              }}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-bold text-[10px] rounded border border-slate-200 cursor-pointer shadow-3xs transition-all"
            >
              Keluar
            </button>
          </div>

          <button
            onClick={handleResetDatabase}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            title="Reset Database ke Seed Awal"
            id="btn-reset-db"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* Main Grid: Sidebar + Active Window Screen */}
      <div className="flex-1 flex" id="main-app-grid">
        
        {/* --- SIDEBAR PANEL (Desktop & Mobile drawer) --- */}
        <aside 
          className={`bg-slate-900 text-slate-300 w-64 flex flex-col justify-between border-r border-slate-800 fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-200 md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } h-[calc(100vh-65px)] overflow-y-auto print:hidden`}
          id="app-sidebar"
        >
          <div className="p-4 space-y-6">
            
            {/* Mobile Close Button */}
            <div className="flex items-center justify-between md:hidden border-b border-slate-800 pb-3">
              <span className="font-bold text-white text-xs">Menu Navigasi</span>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sidebar Navigation List */}
            <nav className="space-y-5 text-[11px] font-semibold" id="sidebar-nav">
              
              {/* Group 1: PORTAL DASHBOARD */}
              {isTabAuthorized('dashboard') && (
                <div className="space-y-1">
                  <span className="px-3 text-[9px] uppercase font-black text-slate-500 tracking-wider block">Dashboard Utama</span>
                  <button
                    onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'dashboard' 
                        ? 'bg-blue-600 text-white shadow-md font-extrabold' 
                        : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
                    }`}
                  >
                    <LayoutDashboard size={15} />
                    <span>Ringkasan Eksekutif</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('database_anggota'); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'database_anggota' 
                        ? 'bg-blue-600 text-white shadow-md font-extrabold' 
                        : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
                    }`}
                  >
                    <Users size={15} />
                    <span>Database Anggota</span>
                  </button>
                </div>
              )}

              {/* Group 2: UNIT SIMPAN PINJAM (USP) */}
              {isTabAuthorized('simpan_pinjam') && (
                <div className="space-y-1">
                  <span className="px-3 text-[9px] uppercase font-black text-slate-500 tracking-wider block">Unit Simpan Pinjam (USP)</span>
                  
                  {[
                    { id: 'pengurus', label: 'Pengurus (Modal & Regulasi)' },
                    { id: 'anggota', label: 'Daftar Anggota USP' },
                    { id: 'simpanan', label: 'Tabungan & Simpanan' },
                    { id: 'penyertaan_modal', label: 'Penyertaan Modal Koperasi' },
                    { id: 'penarikan_pengajuan', label: 'Penarikan & Pengajuan' },
                    { id: 'laporan', label: 'Laporan & Amortisasi' }
                  ].map(sub => {
                    const isSelected = activeTab === 'simpan_pinjam' && activeSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => { 
                          setActiveTab('simpan_pinjam'); 
                          setActiveSubTab(sub.id); 
                          setSidebarOpen(false); 
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-left ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md font-extrabold' 
                            : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
                        }`}
                      >
                        <Coins size={14} className={isSelected ? 'text-white' : 'text-slate-500'} />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Group 3: UNIT PERTOKOAN */}
              {isTabAuthorized('pertokoan') && (
                <div className="space-y-1">
                  <span className="px-3 text-[9px] uppercase font-black text-slate-500 tracking-wider block">Unit Pertokoan (Retail)</span>
                  
                  {[
                    { id: 'generate_voucher', label: 'Generate Voucher' },
                    { id: 'master_barang', label: 'Master Barang Toko' },
                    { id: 'order', label: 'Order & Kasir (POS)' },
                    { id: 'laporan', label: 'Laporan Penjualan' }
                  ].map(sub => {
                    const isSelected = activeTab === 'pertokoan' && activeSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => { 
                          setActiveTab('pertokoan'); 
                          setActiveSubTab(sub.id); 
                          setSidebarOpen(false); 
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-left ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md font-extrabold' 
                            : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
                        }`}
                      >
                        <ShoppingBag size={14} className={isSelected ? 'text-white' : 'text-slate-500'} />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Group 4: UNIT WARTEL */}
              {isTabAuthorized('wartel') && (
                <div className="space-y-1">
                  <span className="px-3 text-[9px] uppercase font-black text-slate-500 tracking-wider block">Unit Telekomunikasi (Wartel)</span>
                  
                  {[
                    { id: 'kasir', label: 'Kasir Wartel / Pulsa' },
                    { id: 'laporan', label: 'Laporan Jurnal Wartel' }
                  ].map(sub => {
                    const isSelected = activeTab === 'wartel' && activeSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => { 
                          setActiveTab('wartel'); 
                          setActiveSubTab(sub.id); 
                          setSidebarOpen(false); 
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-left ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md font-extrabold' 
                            : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
                        }`}
                      >
                        <PhoneCall size={14} className={isSelected ? 'text-white' : 'text-slate-500'} />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Group 5: PELAPORAN KEUANGAN */}
              {isTabAuthorized('laporan') && (
                <div className="space-y-1">
                  <span className="px-3 text-[9px] uppercase font-black text-slate-500 tracking-wider block">Pelaporan Keuangan</span>
                  
                  {[
                    { id: 'kas_harian', label: 'Laporan Arus Kas Harian' },
                    { id: 'laba_rugi', label: 'Laba Rugi per Unit Usaha' },
                    { id: 'neraca', label: 'Neraca Keuangan Konsolidasi' }
                  ].map(sub => {
                    const isSelected = activeTab === 'laporan' && activeSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => { 
                          setActiveTab('laporan'); 
                          setActiveSubTab(sub.id); 
                          setSidebarOpen(false); 
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-left ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md font-extrabold' 
                            : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
                        }`}
                      >
                        <FileText size={14} className={isSelected ? 'text-white' : 'text-slate-500'} />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Group 6: AKSES KHUSUS BENDAHARA */}
              {(currentUser.role === 'verifikator_bendahara' || currentUser.role === 'admin') && (
                <div className="space-y-1" id="bendahara-special-menu">
                  <span className="px-3 text-[9px] uppercase font-black text-slate-500 tracking-wider block">Otoritas Bendahara</span>
                  <button
                    onClick={() => { 
                      setActiveTab('bendahara_treasury'); 
                      setSidebarOpen(false); 
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer text-left ${
                      activeTab === 'bendahara_treasury' 
                        ? 'bg-blue-600 text-white shadow-md font-extrabold' 
                        : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
                    }`}
                  >
                    <Wallet size={15} className={activeTab === 'bendahara_treasury' ? 'text-white' : 'text-slate-500'} />
                    <span>Buku Kas & Audit Unit</span>
                  </button>
                </div>
              )}

            </nav>
          </div>

          {/* Footer of Sidebar */}
          <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500">
            <div>Sistem Pembukuan Koperasi</div>
            <div className="font-mono text-[9px] mt-0.5">Versi 1.5.0 (Stable)</div>
          </div>
        </aside>

        {/* Overlay background for mobile drawer */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs md:hidden"
          ></div>
        )}

        {/* --- ACTIVE CONTENT WINDOW --- */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6" id="app-main-content">
          
          {activeTab === 'dashboard' && (
            <Dashboard 
              members={members}
              transactions={transactions}
              loans={loans}
              sales={sales}
              wartelRecords={wartelRecords}
              cooperativeName={cooperativeName}
              onUpdateCooperativeName={setCooperativeName}
              accounts={accounts}
              onRegisterAccount={(newAcc) => setAccounts(prev => [...prev, newAcc])}
              currentUser={currentUser}
              onNavigate={(tab, subTab) => {
                setActiveTab(tab);
                if (subTab) setActiveSubTab(subTab);
              }}
            />
          )}

          {activeTab === 'database_anggota' && (
            <MemberDatabase 
              members={members}
              transactions={transactions}
              loans={loans}
              onAddMember={handleAddMember}
            />
          )}

          {activeTab === 'wartel' && (
            <WartelUnit 
              members={members}
              records={wartelRecords}
              onAddWartelRecord={handleAddWartelRecord}
              activeSubTab={activeSubTab}
              onAddTransaction={(tx) => setTransactions(prev => [...prev, tx])}
            />
          )}

          {activeTab === 'simpan_pinjam' && (
            <SimpanPinjamUnit 
              members={members}
              loans={loans}
              currentUser={currentUser}
              onUpdateSavings={handleUpdateSavings}
              onApplyLoan={handleApplyLoan}
              onApproveLoan={handleApproveLoan}
              onPayInstallment={handlePayInstallment}
              activeSubTab={activeSubTab}
              onAddTransaction={(tx) => setTransactions(prev => [...prev, tx])}
            />
          )}

          {activeTab === 'pertokoan' && (
            <PertokoanUnit 
              members={members}
              products={products}
              sales={sales}
              onAddSale={handleAddSale}
              onUpdateProductStock={handleUpdateProductStock}
              activeSubTab={activeSubTab}
              onGenerateVouchers={handleGenerateVouchers}
              onAddTransaction={(tx) => setTransactions(prev => [...prev, tx])}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'laporan' && (
            <FinancialReports 
              members={members}
              transactions={transactions}
              loans={loans}
              products={products}
              wartelRecords={wartelRecords}
              sales={sales}
              activeSubTab={activeSubTab}
              onDistributeSHU={handleDistributeSHU}
            />
          )}

          {activeTab === 'bendahara_treasury' && (
            <BendaharaTreasury
              transactions={transactions}
              members={members}
              sales={sales}
              wartelRecords={wartelRecords}
              loans={loans}
              onAddTransaction={(tx) => setTransactions(prev => [...prev, tx])}
            />
          )}

        </main>

      </div>
    </div>
  );
}
