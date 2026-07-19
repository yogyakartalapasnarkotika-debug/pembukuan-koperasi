import React, { useState } from 'react';
import { Member, Transaction, Loan, PertokoanProduct, WartelRecord, PertokoanSale } from '../types';
import { 
  FileText, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShieldCheck,
  Scale,
  Download,
  Coins,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Users,
  Check,
  Plus,
  Trash2
} from 'lucide-react';

interface FinancialReportsProps {
  members: Member[];
  transactions: Transaction[];
  loans: Loan[];
  products: PertokoanProduct[];
  wartelRecords: WartelRecord[];
  sales: PertokoanSale[];
  activeSubTab?: string;
  onDistributeSHU?: (distributions: { memberId: string; amount: number }[]) => void;
}

export default function FinancialReports({
  members,
  transactions,
  loans,
  products,
  wartelRecords,
  sales,
  activeSubTab = 'kas_harian',
  onDistributeSHU
}: FinancialReportsProps) {
  const [reportTab, setReportTab] = useState<'kas' | 'rugilaba' | 'konsolidasi' | 'shu'>('kas');

  React.useEffect(() => {
    if (activeSubTab === 'kas_harian') {
      setReportTab('kas');
    } else if (activeSubTab === 'laba_rugi') {
      setReportTab('rugilaba');
    } else if (activeSubTab === 'neraca') {
      setReportTab('konsolidasi');
    }
  }, [activeSubTab]);
  
  // --- Daily Cash Flow Date State ---
  const [selectedDate, setSelectedDate] = useState('2026-07-18');

  // --- SHU State & Parameters ---
  const [bagiHasilPortions, setBagiHasilPortions] = useState([
    { id: 'jasa_modal', name: 'Jasa Modal (Simpanan)', percent: 20 },
    { id: 'jasa_usaha', name: 'Jasa Usaha (Transaksi)', percent: 20 },
    { id: 'cadangan', name: 'Dana Cadangan Koperasi', percent: 30 },
    { id: 'pengurus', name: 'Dana Pengurus & Pengawas', percent: 10 },
    { id: 'pendidikan', name: 'Dana Pendidikan', percent: 10 },
    { id: 'sosial', name: 'Dana Sosial & Pembangunan', percent: 10 },
  ]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [shuSuccessMsg, setShuSuccessMsg] = useState('');

  const handleUpdatePortionName = (id: string, newName: string) => {
    setBagiHasilPortions(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const handleUpdatePortionPercent = (id: string, newPercent: number) => {
    const clamped = Math.max(0, Math.min(100, newPercent));
    setBagiHasilPortions(prev => prev.map(p => p.id === id ? { ...p, percent: clamped } : p));
  };

  const handleAddPortion = () => {
    const newId = `custom_${Date.now()}`;
    setBagiHasilPortions(prev => [...prev, { id: newId, name: 'Porsi Alokasi Baru', percent: 0 }]);
  };

  const handleDeletePortion = (id: string) => {
    if (id === 'jasa_modal' || id === 'jasa_usaha') {
      alert('Porsi utama Jasa Modal dan Jasa Usaha tidak boleh dihapus agar perhitungan SHU anggota tetap berfungsi!');
      return;
    }
    setBagiHasilPortions(prev => prev.filter(p => p.id !== id));
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // --- 1. DAILY CASH FLOW CALCULATIONS ---
  const dailyTransactions = transactions.filter(t => t.date.startsWith(selectedDate));
  const dailyInflow = dailyTransactions
    .filter(t => t.type === 'kas_masuk')
    .reduce((sum, t) => sum + t.amount, 0);
  const dailyOutflow = dailyTransactions
    .filter(t => t.type === 'kas_keluar')
    .reduce((sum, t) => sum + t.amount, 0);
  const dailyNet = dailyInflow - dailyOutflow;

  const uniqueDates = Array.from(new Set(transactions.map(t => t.date.split(' ')[0]))).sort().reverse();

  // --- 2. RUGI LABA (INCOME STATEMENT) ---
  // Wartel Unit
  const wartelRevenues = wartelRecords.reduce((sum, r) => sum + r.sellingPrice, 0);
  const wartelCost = wartelRecords.reduce((sum, r) => sum + r.costPrice, 0);
  const wartelNetProfit = wartelRevenues - wartelCost;

  // Simpan Pinjam Unit (Interest Earned)
  const spRevenues = loans.reduce((sum, l) => {
    return sum + l.repaymentHistory.reduce((s, r) => s + r.interestPaid, 0);
  }, 0);
  const spNetProfit = spRevenues;

  // Pertokoan Unit
  const tokoRevenues = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const tokoCost = sales.reduce((sum, s) => {
    return sum + s.items.reduce((sc, item) => sc + (item.costPrice * item.quantity), 0);
  }, 0);
  const tokoNetProfit = tokoRevenues - tokoCost;

  // Allocated Operasional Costs
  const allocatedOperasional = transactions
    .filter(t => t.unit === 'umum' && t.category === 'Biaya Operasional')
    .reduce((sum, t) => sum + t.amount, 0);

  const consolidatedRevenue = wartelRevenues + spRevenues + tokoRevenues;
  const consolidatedCOGS = wartelCost + tokoCost;
  const consolidatedGrossProfit = consolidatedRevenue - consolidatedCOGS;
  const consolidatedNetProfit = consolidatedGrossProfit - allocatedOperasional;

  // --- 3. CONSOLIDATED BALANCE SHEET ---
  const cashOnHand = transactions
    .reduce((sum, t) => sum + (t.type === 'kas_masuk' ? t.amount : -t.amount), 0);
  const receivablesLoans = loans
    .filter(l => l.status === 'aktif')
    .reduce((sum, l) => sum + l.remainingBalance, 0);
  const inventoryAssetVal = products
    .reduce((sum, p) => sum + (p.costPrice * p.stock), 0);
  const totalAssets = cashOnHand + receivablesLoans + inventoryAssetVal;

  const liabilitiesSavingsSukarela = members.reduce((sum, m) => sum + m.savings.sukarela, 0);
  const totalLiabilities = liabilitiesSavingsSukarela;

  const equitySavingsPokok = members.reduce((sum, m) => sum + m.savings.pokok, 0);
  const equitySavingsWajib = members.reduce((sum, m) => sum + m.savings.wajib, 0);
  const equityReserves = totalAssets - totalLiabilities - equitySavingsPokok - equitySavingsWajib;
  const totalEquity = equitySavingsPokok + equitySavingsWajib + equityReserves;

  // --- 4. SHU MEMBER MATHEMATICS ---
  const jasaModalPortion = bagiHasilPortions.find(p => p.id === 'jasa_modal') || { percent: 0, name: 'Jasa Modal' };
  const jasaUsahaPortion = bagiHasilPortions.find(p => p.id === 'jasa_usaha') || { percent: 0, name: 'Jasa Usaha' };

  const poolJasaModal = Math.max(0, consolidatedNetProfit) * (jasaModalPortion.percent / 100);
  const poolJasaUsaha = Math.max(0, consolidatedNetProfit) * (jasaUsahaPortion.percent / 100);
  const memberSHUPool = poolJasaModal + poolJasaUsaha;
  const alokasiSHUPercent = jasaModalPortion.percent + jasaUsahaPortion.percent;

  // Backward compatibility relative ratios within the member SHU pool
  const jasaModalPercent = alokasiSHUPercent > 0 ? (jasaModalPortion.percent / alokasiSHUPercent) * 100 : 0;
  const jasaUsahaPercent = alokasiSHUPercent > 0 ? (jasaUsahaPortion.percent / alokasiSHUPercent) * 100 : 0;

  // Calculate sum of active savings (Pokok + Wajib)
  const totalSavingsAllMembers = members.reduce((sum, m) => sum + m.savings.pokok + m.savings.wajib, 0);

  // Calculate member transaction volumes
  const memberTransactionsMap: Record<string, number> = {};
  members.forEach(m => {
    // 1. Purchases in Toko
    const purchases = sales
      .filter(s => s.memberId === m.memberId)
      .reduce((sum, s) => sum + s.totalAmount, 0);
    // 2. Interest Paid in Simpan Pinjam
    const interest = loans
      .filter(l => l.memberId === m.memberId)
      .reduce((sum, l) => sum + l.repaymentHistory.reduce((s, r) => s + r.interestPaid, 0), 0);
    // 3. Wartel Record Usage
    const wartel = wartelRecords
      .filter(w => w.memberId === m.memberId)
      .reduce((sum, w) => sum + w.sellingPrice, 0);

    memberTransactionsMap[m.memberId] = purchases + interest + wartel;
  });

  const totalTransactionsAllMembers = Object.values(memberTransactionsMap).reduce((sum, v) => sum + v, 0);

  // Generate detailed SHU array for each member
  const shuList = members.map(m => {
    const savingsWeight = m.savings.pokok + m.savings.wajib;
    const transactionWeight = memberTransactionsMap[m.memberId] || 0;

    const shuModal = totalSavingsAllMembers > 0 
      ? (savingsWeight / totalSavingsAllMembers) * poolJasaModal 
      : 0;

    const shuUsaha = totalTransactionsAllMembers > 0 
      ? (transactionWeight / totalTransactionsAllMembers) * poolJasaUsaha 
      : 0;

    const totalSHU = shuModal + shuUsaha;

    return {
      memberId: m.memberId,
      name: m.name,
      savingsWeight,
      transactionWeight,
      shuModal,
      shuUsaha,
      totalSHU
    };
  });

  const handleSelectAllMembers = () => {
    setSelectedMemberIds(members.map(m => m.memberId));
  };

  const handleResetSelectedMembers = () => {
    setSelectedMemberIds([]);
  };

  const handleSelectSingleMember = (memberId: string) => {
    if (memberId) {
      setSelectedMemberIds([memberId]);
    } else {
      setSelectedMemberIds([]);
    }
  };

  const handleToggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleDistributeSelectedSHU = () => {
    if (selectedMemberIds.length === 0) {
      alert('Pilih minimal satu anggota untuk membagikan SHU!');
      return;
    }

    const distributions = shuList
      .filter(s => selectedMemberIds.includes(s.memberId))
      .map(s => ({
        memberId: s.memberId,
        amount: Math.round(s.totalSHU)
      }));

    if (onDistributeSHU) {
      onDistributeSHU(distributions);
    }

    const totalSharedAmount = distributions.reduce((sum, d) => sum + d.amount, 0);
    setShuSuccessMsg(`Sukses membagikan SHU sebesar ${formatIDR(totalSharedAmount)} ke Tabungan Sukarela untuk ${distributions.length} Anggota terpilih!`);
    
    // Clear selection
    setSelectedMemberIds([]);
    setTimeout(() => setShuSuccessMsg(''), 6000);
  };

  // --- 5. EXPORT / DOWNLOADS IN VARIOUS FORMATS ---
  const handleDownloadCSV = () => {
    let csvContent = "";
    let fileName = "";

    if (reportTab === 'kas') {
      fileName = `Laporan_Arus_Kas_${selectedDate}.csv`;
      csvContent += `"LAPORAN ARUS KAS HARIAN - KOPERASI KARYA MUKTI"\n`;
      csvContent += `"Tanggal Laporan:","${selectedDate}"\n`;
      csvContent += `"Total Kas Masuk:","${formatIDR(dailyInflow).replace(/"/g, '""')}"\n`;
      csvContent += `"Total Kas Keluar:","${formatIDR(dailyOutflow).replace(/"/g, '""')}"\n`;
      csvContent += `"Selisih Bersih (Net):","${formatIDR(dailyNet).replace(/"/g, '""')}"\n\n`;
      csvContent += `"LOG TRANSAKSI HARIAN"\n`;
      csvContent += `"Waktu","Tipe","Unit Bisnis","Kategori","Keterangan","Nominal"\n`;
      dailyTransactions.forEach(t => {
        const time = t.date.split(' ')[1] || '';
        csvContent += `"${time}","${t.type === 'kas_masuk' ? 'Kas Masuk' : 'Kas Keluar'}","${t.unit.toUpperCase()}","${t.category}","${t.description.replace(/"/g, '""')}","${formatIDR(t.amount).replace(/"/g, '""')}"\n`;
      });
    } else if (reportTab === 'rugilaba') {
      fileName = `Laporan_Rugi_Laba_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent += `"LAPORAN RUGI LABA KONSOLIDASI - KOPERASI KARYA MUKTI"\n\n`;
      csvContent += `"Sektor Bisnis","Pendapatan Bruto","Harga Pokok (HPP)","Laba Margin Bersih"\n`;
      csvContent += `"Unit Telekomunikasi (Wartel)","${formatIDR(wartelRevenues)}","${formatIDR(wartelCost)}","${formatIDR(wartelNetProfit)}"\n`;
      csvContent += `"Unit Ritel (Pertokoan)","${formatIDR(tokoRevenues)}","${formatIDR(tokoCost)}","${formatIDR(tokoNetProfit)}"\n`;
      csvContent += `"Unit Simpan Pinjam (USP)","${formatIDR(spRevenues)}","Rp 0","${formatIDR(spNetProfit)}"\n\n`;
      csvContent += `"Konsolidasi Gabungan"\n`;
      csvContent += `"Total Omzet Bersama","${formatIDR(consolidatedRevenue)}"\n`;
      csvContent += `"Total HPP Bersama","${formatIDR(consolidatedCOGS)}"\n`;
      csvContent += `"Laba Kotor Konsolidasi","${formatIDR(consolidatedGrossProfit)}"\n`;
      csvContent += `"Biaya Operasional Kantor","${formatIDR(allocatedOperasional)}"\n`;
      csvContent += `"LABA BERSIH SISA HASIL USAHA","${formatIDR(consolidatedNetProfit)}"\n`;
    } else if (reportTab === 'konsolidasi') {
      fileName = `Laporan_Neraca_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent += `"LAPORAN NERACA BULANAN - KOPERASI KARYA MUKTI"\n\n`;
      csvContent += `"AKTIVA (ASSETS)","RUPIAH","","PASIVA (LIABILITIES & EQUITY)","RUPIAH"\n`;
      csvContent += `"Aset Lancar - Kas Utama","${formatIDR(cashOnHand)}","","Kewajiban - Simpanan Sukarela","${formatIDR(liabilitiesSavingsSukarela)}"\n`;
      csvContent += `"Piutang Kredit S&P","${formatIDR(receivablesLoans)}","","Simpanan Pokok Anggota","${formatIDR(equitySavingsPokok)}"\n`;
      csvContent += `"Nilai Stok Barang Toko","${formatIDR(inventoryAssetVal)}","","Simpanan Wajib Anggota","${formatIDR(equitySavingsWajib)}"\n`;
      csvContent += `"","","","Cadangan Kas (SHU Berjalan)","${formatIDR(equityReserves)}"\n`;
      csvContent += `"TOTAL AKTIVA","${formatIDR(totalAssets)}","","TOTAL PASIVA","${formatIDR(totalLiabilities + totalEquity)}"\n`;
    } else {
      fileName = `Perhitungan_SHU_Anggota_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent += `"DAFTAR REPARTISI SHU ANGGOTA - KOPERASI KARYA MUKTI"\n`;
      csvContent += `"Total Laba Bersih Koperasi:","${formatIDR(consolidatedNetProfit)}"\n`;
      csvContent += `"Alokasi Anggota (${alokasiSHUPercent}%):","${formatIDR(memberSHUPool)}"\n\n`;
      csvContent += `"ID Anggota","Nama Anggota","Simpanan Weight (Pokok+Wajib)","Partisipasi Transaksi","SHU Jasa Modal","SHU Jasa Usaha","Total SHU Diterima"\n`;
      shuList.forEach(s => {
        csvContent += `"${s.memberId}","${s.name}","${formatIDR(s.savingsWeight)}","${formatIDR(s.transactionWeight)}","${formatIDR(s.shuModal)}","${formatIDR(s.shuUsaha)}","${formatIDR(s.totalSHU)}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.click();
  };

  const handleDownloadJSON = () => {
    let dataToExport: any = {};
    let fileName = `Laporan_${reportTab}_${new Date().toISOString().split('T')[0]}.json`;

    if (reportTab === 'kas') {
      dataToExport = {
        title: "Arus Kas Harian Koperasi Karya Mukti",
        date: selectedDate,
        inflow: dailyInflow,
        outflow: dailyOutflow,
        net: dailyNet,
        transactions: dailyTransactions
      };
    } else if (reportTab === 'rugilaba') {
      dataToExport = {
        title: "Laba Rugi Konsolidasi",
        units: {
          wartel: { revenues: wartelRevenues, cost: wartelCost, net: wartelNetProfit },
          toko: { revenues: tokoRevenues, cost: tokoCost, net: tokoNetProfit },
          simpan_pinjam: { revenues: spRevenues, net: spNetProfit }
        },
        consolidated: {
          totalRevenue: consolidatedRevenue,
          totalCOGS: consolidatedCOGS,
          grossProfit: consolidatedGrossProfit,
          operationalCosts: allocatedOperasional,
          netProfit: consolidatedNetProfit
        }
      };
    } else if (reportTab === 'konsolidasi') {
      dataToExport = {
        title: "Neraca Keuangan Koperasi",
        assets: { cash: cashOnHand, loansOutstanding: receivablesLoans, inventory: inventoryAssetVal, total: totalAssets },
        liabilities: { savingsSukarela: liabilitiesSavingsSukarela, total: totalLiabilities },
        equity: { pokok: equitySavingsPokok, wajib: equitySavingsWajib, reserves: equityReserves, total: totalEquity }
      };
    } else {
      dataToExport = {
        title: "Repartisi SHU Anggota Koperasi",
        pool: { netProfit: consolidatedNetProfit, memberPool: memberSHUPool, jasaModal: poolJasaModal, jasaUsaha: poolJasaUsaha },
        distributions: shuList
      };
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.click();
  };

  // --- DOWNLOAD TXT FORMAT ---
  const handleDownloadTXT = () => {
    let textContent = "";
    let fileName = `Laporan_${reportTab}_${new Date().toISOString().split('T')[0]}.txt`;

    textContent += "==================================================\n";
    textContent += "              KOPERASI KARYA MUKTI               \n";
    textContent += "==================================================\n\n";

    if (reportTab === 'kas') {
      textContent += `LAPORAN MUTASI ARUS KAS HARIAN\n`;
      textContent += `Tanggal Buku: ${selectedDate}\n`;
      textContent += "--------------------------------------------------\n";
      textContent += `KAS MASUK (INFLOW)     : ${formatIDR(dailyInflow)}\n`;
      textContent += `KAS KELUAR (OUTFLOW)   : ${formatIDR(dailyOutflow)}\n`;
      textContent += `SELISIH BERSIH (NET)   : ${formatIDR(dailyNet)}\n`;
      textContent += "--------------------------------------------------\n\n";
      textContent += `LOG TRANSAKSI AKTIF:\n`;
      dailyTransactions.forEach((t, i) => {
        textContent += `${i+1}. [${t.date.split(' ')[1] || ''}] [${t.type === 'kas_masuk' ? 'MASUK' : 'KELUAR'}] [${t.unit.toUpperCase()}] ${t.category}: ${t.description} (${formatIDR(t.amount)})\n`;
      });
    } else if (reportTab === 'rugilaba') {
      textContent += `LAPORAN RUGI LABA KONSOLIDASI GABUNGAN\n`;
      textContent += "--------------------------------------------------\n";
      textContent += `1. UNIT WARTEL / TELEKOMUNIKASI\n`;
      textContent += `   - Pendapatan Jasa    : ${formatIDR(wartelRevenues)}\n`;
      textContent += `   - Modal Jasa (HPP)   : (${formatIDR(wartelCost)})\n`;
      textContent += `   - Laba Bersih        : ${formatIDR(wartelNetProfit)}\n\n`;
      textContent += `2. UNIT PERTOKOAN RETAIL\n`;
      textContent += `   - Pendapatan Toko    : ${formatIDR(tokoRevenues)}\n`;
      textContent += `   - Modal Barang (HPP) : (${formatIDR(tokoCost)})\n`;
      textContent += `   - Laba Bersih        : ${formatIDR(tokoNetProfit)}\n\n`;
      textContent += `3. UNIT SIMPAN PINJAM (USP)\n`;
      textContent += `   - Pendapatan Bunga   : ${formatIDR(spRevenues)}\n`;
      textContent += `   - Laba Bersih        : ${formatIDR(spNetProfit)}\n\n`;
      textContent += "--------------------------------------------------\n";
      textContent += `TOTAL OMZET GABUNGAN    : ${formatIDR(consolidatedRevenue)}\n`;
      textContent += `TOTAL HPP GABUNGAN      : (${formatIDR(consolidatedCOGS)})\n`;
      textContent += `LABA KOTOR GABUNGAN     : ${formatIDR(consolidatedGrossProfit)}\n`;
      textContent += `BEBAN OPERASIONAL UMUM  : (${formatIDR(allocatedOperasional)})\n`;
      textContent += `LABA BERSIH KOPERASI    : ${formatIDR(consolidatedNetProfit)}\n`;
      textContent += "--------------------------------------------------\n";
    } else if (reportTab === 'konsolidasi') {
      textContent += `LAPORAN NERACA BULANAN KONSOLIDASI\n`;
      textContent += "--------------------------------------------------\n";
      textContent += `AKTIVA (ASET HARTA):\n`;
      textContent += `- Kas Utama              : ${formatIDR(cashOnHand)}\n`;
      textContent += `- Piutang Anggota (S&P)  : ${formatIDR(receivablesLoans)}\n`;
      textContent += `- Nilai Persediaan Barang: ${formatIDR(inventoryAssetVal)}\n`;
      textContent += `TOTAL AKTIVA             : ${formatIDR(totalAssets)}\n\n`;
      textContent += `PASIVA (KEWAJIBAN & EKUITAS):\n`;
      textContent += `- Simpanan Sukarela      : ${formatIDR(liabilitiesSavingsSukarela)}\n`;
      textContent += `- Simpanan Pokok         : ${formatIDR(equitySavingsPokok)}\n`;
      textContent += `- Simpanan Wajib         : ${formatIDR(equitySavingsWajib)}\n`;
      textContent += `- Cadangan Laba (SHU)    : ${formatIDR(equityReserves)}\n`;
      textContent += `TOTAL PASIVA             : ${formatIDR(totalLiabilities + totalEquity)}\n`;
      textContent += "--------------------------------------------------\n";
    } else {
      textContent += `REPARTISI PERHITUNGAN SHU ANGGOTA\n`;
      textContent += `Total Laba Bersih Koperasi : ${formatIDR(consolidatedNetProfit)}\n`;
      textContent += `Porsi SHU Anggota (${alokasiSHUPercent}%)    : ${formatIDR(memberSHUPool)}\n`;
      textContent += "--------------------------------------------------\n";
      shuList.forEach((s, idx) => {
        textContent += `${idx+1}. Anggota ID: ${s.memberId} - ${s.name}\n`;
        textContent += `   - Total Simpanan (Pokok+Wajib): ${formatIDR(s.savingsWeight)}\n`;
        textContent += `   - Volume Jasa Transaksi       : ${formatIDR(s.transactionWeight)}\n`;
        textContent += `   - Penerimaan SHU Modal        : ${formatIDR(s.shuModal)}\n`;
        textContent += `   - Penerimaan SHU Transaksi    : ${formatIDR(s.shuUsaha)}\n`;
        textContent += `   - TOTAL SHU YANG DITERIMA     : ${formatIDR(s.totalSHU)}\n\n`;
      });
    }

    textContent += "\nKoperasi Karya Mukti - Sistem Pembukuan Digital Tangguh 2026\n";

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.click();
  };

  // --- DOWNLOAD HTML FORMAT ---
  const handleDownloadHTML = () => {
    let fileName = `Laporan_${reportTab}_${new Date().toISOString().split('T')[0]}.html`;
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Keuangan - Koperasi Karya Mukti</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; padding: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 20px; margin-bottom: 30px; }
        h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
        h2 { margin: 5px 0; font-size: 16px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
        th { background: #f4f4f4; border: 1px solid #ddd; padding: 10px; font-weight: bold; }
        td { border: 1px solid #ddd; padding: 10px; }
        .text-right { text-align: right; font-family: monospace; }
        .bold { font-weight: bold; }
        .bg-total { background-color: #f9f9f9; font-weight: bold; }
        .footer { margin-top: 50px; font-size: 11px; text-align: center; color: #777; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Koperasi Karya Mukti</h1>
        <h2>Sistem Pembukuan Keuangan Digital</h2>
        <p>Laporan pembukuan dicetak pada: ${new Date().toISOString().split('T')[0]}</p>
      </div>
    `;

    if (reportTab === 'kas') {
      htmlContent += `
        <h3>Laporan Arus Kas Harian (Tanggal: ${selectedDate})</h3>
        <table>
          <tr><td>Total Kas Masuk (Inflow)</td><td class="text-right bold" style="color: green;">${formatIDR(dailyInflow)}</td></tr>
          <tr><td>Total Kas Keluar (Outflow)</td><td class="text-right bold" style="color: red;">${formatIDR(dailyOutflow)}</td></tr>
          <tr class="bg-total"><td>Selisih Bersih (Net)</td><td class="text-right font-black">${formatIDR(dailyNet)}</td></tr>
        </table>
        
        <h3>Log Riwayat Mutasi Buku Kas</h3>
        <table>
          <thead>
            <tr><th>Waktu</th><th>Tipe</th><th>Unit Bisnis</th><th>Kategori</th><th>Keterangan</th><th>Nominal</th></tr>
          </thead>
          <tbody>
      `;
      dailyTransactions.forEach(t => {
        const time = t.date.split(' ')[1] || '';
        htmlContent += `
          <tr>
            <td>${time}</td>
            <td class="bold" style="color: ${t.type === 'kas_masuk' ? 'green' : 'red'};">${t.type === 'kas_masuk' ? 'MASUK' : 'KELUAR'}</td>
            <td>${t.unit.toUpperCase()}</td>
            <td>${t.category}</td>
            <td>${t.description}</td>
            <td class="text-right bold">${formatIDR(t.amount)}</td>
          </tr>
        `;
      });
      htmlContent += `</tbody></table>`;
    } else if (reportTab === 'rugilaba') {
      htmlContent += `
        <h3>Laporan Rugi Laba Konsolidasi Gabungan</h3>
        <table>
          <thead>
            <tr><th>Deskripsi Divisi Usaha</th><th>Pendapatan Bruto</th><th>Modal Jasa (HPP)</th><th>Laba Bersih Sektor</th></tr>
          </thead>
          <tbody>
            <tr><td>Unit Telekomunikasi (Wartel)</td><td class="text-right">${formatIDR(wartelRevenues)}</td><td class="text-right">${formatIDR(wartelCost)}</td><td class="text-right bold text-emerald">${formatIDR(wartelNetProfit)}</td></tr>
            <tr><td>Unit Ritel (Pertokoan)</td><td class="text-right">${formatIDR(tokoRevenues)}</td><td class="text-right">${formatIDR(tokoCost)}</td><td class="text-right bold text-emerald">${formatIDR(tokoNetProfit)}</td></tr>
            <tr><td>Unit Simpan Pinjam (USP)</td><td class="text-right">${formatIDR(spRevenues)}</td><td class="text-right">Rp 0</td><td class="text-right bold text-emerald">${formatIDR(spNetProfit)}</td></tr>
            <tr class="bg-total"><td>Total Konsolidasi Operasional</td><td class="text-right">${formatIDR(consolidatedRevenue)}</td><td class="text-right">${formatIDR(consolidatedCOGS)}</td><td class="text-right text-emerald">${formatIDR(consolidatedGrossProfit)}</td></tr>
            <tr><td>Biaya Operasional Umum Koperasi</td><td colspan="2"></td><td class="text-right bold" style="color: red;">(${formatIDR(allocatedOperasional)})</td></tr>
            <tr class="bg-total" style="font-size: 15px; background: #eef; border-top: 2px solid #000;"><td>SISA HASIL USAHA BERSIH KOPERASI</td><td colspan="2"></td><td class="text-right font-black" style="color: blue;">${formatIDR(consolidatedNetProfit)}</td></tr>
          </tbody>
        </table>
      `;
    } else if (reportTab === 'konsolidasi') {
      htmlContent += `
        <h3>Laporan Neraca Bulanan Konsolidasi</h3>
        <table>
          <thead>
            <tr><th>AKTIVA (HARTA KEKAYAAN)</th><th>RUPIAH</th><th>PASIVA (KEWAJIBAN & EKUITAS)</th><th>RUPIAH</th></tr>
          </thead>
          <tbody>
            <tr><td>Aset Lancar - Kas Utama</td><td class="text-right">${formatIDR(cashOnHand)}</td><td>Kewajiban - Simpanan Sukarela</td><td class="text-right">${formatIDR(liabilitiesSavingsSukarela)}</td></tr>
            <tr><td>Piutang Anggota outstanding Simpan Pinjam</td><td class="text-right">${formatIDR(receivablesLoans)}</td><td>Ekuitas - Simpanan Pokok Anggota</td><td class="text-right">${formatIDR(equitySavingsPokok)}</td></tr>
            <tr><td>Aset Persediaan Ritel (Stok Toko)</td><td class="text-right">${formatIDR(inventoryAssetVal)}</td><td>Ekuitas - Simpanan Wajib Anggota</td><td class="text-right">${formatIDR(equitySavingsWajib)}</td></tr>
            <tr><td></td><td></td><td>Cadangan Kas & Laba Berjalan (SHU)</td><td class="text-right">${formatIDR(equityReserves)}</td></tr>
            <tr class="bg-total"><td>TOTAL AKTIVA (ASSETS)</td><td class="text-right text-blue">${formatIDR(totalAssets)}</td><td>TOTAL PASIVA (LIABILITIES & EQUITY)</td><td class="text-right text-blue">${formatIDR(totalLiabilities + totalEquity)}</td></tr>
          </tbody>
        </table>
      `;
    } else {
      htmlContent += `
        <h3>Lembar Perhitungan Repartisi SHU Anggota</h3>
        <p><b>Total Laba Bersih Koperasi:</b> ${formatIDR(consolidatedNetProfit)}</p>
        <p><b>Alokasi Repartisi SHU Anggota (${alokasiSHUPercent}%):</b> ${formatIDR(memberSHUPool)}</p>
        <p><b>Jasa Modal Modal (${jasaModalPercent}%):</b> ${formatIDR(poolJasaModal)} | <b>Jasa Transaksi Usaha (${jasaUsahaPercent}%):</b> ${formatIDR(poolJasaUsaha)}</p>
        
        <table>
          <thead>
            <tr><th>ID Anggota</th><th>Nama Anggota</th><th>Total Simpanan (Pokok+Wajib)</th><th>Partisipasi Jasa Transaksi</th><th>SHU Modal (Simpanan)</th><th>SHU Usaha (Transaksi)</th><th>Total SHU Diterima</th></tr>
          </thead>
          <tbody>
      `;
      shuList.forEach(s => {
        htmlContent += `
          <tr>
            <td>${s.memberId}</td>
            <td class="bold">${s.name}</td>
            <td class="text-right">${formatIDR(s.savingsWeight)}</td>
            <td class="text-right">${formatIDR(s.transactionWeight)}</td>
            <td class="text-right">${formatIDR(s.shuModal)}</td>
            <td class="text-right">${formatIDR(s.shuUsaha)}</td>
            <td class="text-right bold" style="color: blue;">${formatIDR(s.totalSHU)}</td>
          </tr>
        `;
      });
      htmlContent += `</tbody></table>`;
    }

    htmlContent += `
      <div class="footer">
        <p>Laporan ini dihasilkan secara sah oleh Sistem Akuntansi Terpadu Koperasi Karya Mukti.</p>
      </div>
    </body>
    </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.click();
  };

  return (
    <div className="space-y-6" id="reports-panel">
      
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3 print:hidden" id="reports-tab-container">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Laporan Keuangan & Konsolidasi</h2>
          <p className="text-xs text-slate-400">Arus kas harian, rugi laba per divisi, neraca gabungan, dan perhitungan SHU anggota</p>
        </div>

        <div className="bg-slate-100 p-0.5 rounded-lg flex flex-wrap gap-0.5 self-start sm:self-center">
          <button
            onClick={() => setReportTab('kas')}
            className={`text-xs px-3 py-1.5 rounded-md font-extrabold transition-all cursor-pointer ${
              reportTab === 'kas' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Arus Kas Harian
          </button>
          <button
            onClick={() => setReportTab('rugilaba')}
            className={`text-xs px-3 py-1.5 rounded-md font-extrabold transition-all cursor-pointer ${
              reportTab === 'rugilaba' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Rugi Laba Unit Usaha
          </button>
          <button
            onClick={() => setReportTab('konsolidasi')}
            className={`text-xs px-3 py-1.5 rounded-md font-extrabold transition-all cursor-pointer ${
              reportTab === 'konsolidasi' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Neraca Konsolidasi Bulanan
          </button>
          <button
            onClick={() => setReportTab('shu')}
            className={`text-xs px-3 py-1.5 rounded-md font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
              reportTab === 'shu' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Coins size={12} />
            Perhitungan SHU Anggota
          </button>
        </div>
      </div>

      {/* Export & Download Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs print:hidden animate-fade-in" id="reports-export-bar">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100 shadow-2xs">
            <FileText size={16} />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 block">Ekspor & Download Laporan</span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Unduh laporan pembukuan aktif: <span className="font-bold text-blue-600 uppercase">
                {reportTab === 'kas' ? 'Arus Kas Harian' : reportTab === 'rugilaba' ? 'Rugi Laba' : reportTab === 'konsolidasi' ? 'Neraca Konsolidasi' : 'Repartisi SHU Anggota'}
              </span>
            </span>
          </div>
        </div>

        {/* Variety of downloadable formats (CSV, JSON, TXT, HTML) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-3xs text-[11px]"
          >
            <Download size={13} className="text-emerald-600" />
            CSV
          </button>
          <button
            onClick={handleDownloadJSON}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-3xs text-[11px]"
          >
            <Download size={13} className="text-blue-600" />
            JSON
          </button>
          <button
            onClick={handleDownloadTXT}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-3xs text-[11px]"
          >
            <Download size={13} className="text-amber-600" />
            Text (.txt)
          </button>
          <button
            onClick={handleDownloadHTML}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-3xs text-[11px]"
          >
            <Download size={13} className="text-rose-600" />
            Web (.html)
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs text-[11px]"
          >
            <Printer size={13} />
            Cetak PDF
          </button>
        </div>
      </div>

      {/* --- REPORT VIEW 1: DAILY CASH FLOWS --- */}
      {reportTab === 'kas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="rep-daily-cash">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4" id="cash-setup-card">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Pilih Tanggal Laporan</h3>
              <p className="text-xs text-slate-400 font-medium">Saring mutasi kas berdasarkan kalender akuntansi</p>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Pilih dari Tanggal Aktif</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                >
                  {uniqueDates.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Atau Input Tanggal Manual</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <Calendar size={14} />
                  </span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) setSelectedDate(e.target.value);
                    }}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 pt-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Rekapitulasi Arus Kas Harian</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Kas Masuk (Inflow):</span>
                    <span className="font-mono font-bold text-blue-600">+{formatIDR(dailyInflow)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Kas Keluar (Outflow):</span>
                    <span className="font-mono font-bold text-rose-500">-{formatIDR(dailyOutflow)}</span>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-850">
                    <span>Selisih Bersih (Net):</span>
                    <span className={`font-mono ${dailyNet >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                      {dailyNet >= 0 ? '+' : ''}{formatIDR(dailyNet)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4" id="cash-ledger-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Buku Jurnal Kas Harian</h3>
                <p className="text-xs text-slate-400 font-medium">Buku log harian kas masuk dan keluar koperasi tanggal <strong className="text-slate-700 font-mono font-bold">{selectedDate}</strong></p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl" id="daily-tx-table-container">
              <table className="w-full text-left border-collapse" id="daily-tx-table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Divisi</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Deskripsi Transaksi</th>
                    <th className="p-3 text-right">Jumlah Uang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {dailyTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-slate-400">
                        Tidak ada catatan mutasi kas masuk/keluar untuk tanggal {selectedDate}.
                      </td>
                    </tr>
                  ) : (
                    dailyTransactions.map(tx => {
                      const unitMeta: Record<string, string> = {
                        wartel: 'bg-indigo-50 text-indigo-800 border-indigo-100/50',
                        simpan_pinjam: 'bg-blue-50 text-blue-800 border-blue-100/50',
                        pertokoan: 'bg-slate-100 text-slate-800 border-slate-200',
                        umum: 'bg-slate-50 text-slate-600 border-slate-200'
                      };

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                            {tx.date.split(' ')[1] || '00:00:00'}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${unitMeta[tx.unit] || 'bg-slate-50'}`}>
                              {tx.unit === 'simpan_pinjam' ? 'S&P' : tx.unit}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-800">{tx.category}</td>
                          <td className="p-3 text-slate-500 font-medium">{tx.description}</td>
                          <td className={`p-3 text-right font-mono font-extrabold ${tx.type === 'kas_masuk' ? 'text-blue-600' : 'text-rose-600'}`}>
                            {tx.type === 'kas_masuk' ? '+' : '-'}{formatIDR(tx.amount)}
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

      {/* --- REPORT VIEW 2: RUGI LABA --- */}
      {reportTab === 'rugilaba' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in" id="rep-income-statement">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Laporan Performa Keuntungan Bersih (Rugi Laba)</h3>
              <p className="text-xs text-slate-400 font-medium font-bold">Laporan rincian omzet, HPP, beban operasional, dan hasil sisa usaha bersih koperasi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="income-unit-breakdowns">
            <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50 space-y-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wide text-indigo-700">1. Unit Telekomunikasi (Wartel)</span>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs text-slate-500">Total Omzet:</span>
                <span className="font-mono text-xs font-bold text-slate-800">{formatIDR(wartelRevenues)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500">Harga Pokok (HPP):</span>
                <span className="font-mono text-xs text-slate-400">({formatIDR(wartelCost)})</span>
              </div>
              <div className="border-t border-slate-250 pt-2 flex justify-between items-baseline font-black text-xs text-slate-900">
                <span>Margin Keuntungan:</span>
                <span className="font-mono text-emerald-600">+{formatIDR(wartelNetProfit)}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50 space-y-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wide text-blue-700">2. Unit Simpan Pinjam (USP)</span>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs text-slate-500">Pendapatan Bunga S&P:</span>
                <span className="font-mono text-xs font-bold text-slate-800">{formatIDR(spRevenues)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500">Harga Pokok (HPP):</span>
                <span className="font-mono text-xs text-slate-400">Rp 0</span>
              </div>
              <div className="border-t border-slate-250 pt-2 flex justify-between items-baseline font-black text-xs text-slate-900">
                <span>Margin Keuntungan:</span>
                <span className="font-mono text-emerald-600">+{formatIDR(spNetProfit)}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50 space-y-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wide text-slate-600">3. Unit Ritel (Pertokoan)</span>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs text-slate-500">Omzet Belanja:</span>
                <span className="font-mono text-xs font-bold text-slate-800">{formatIDR(tokoRevenues)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500">Beban Stok Ritel (HPP):</span>
                <span className="font-mono text-xs text-slate-400">({formatIDR(tokoCost)})</span>
              </div>
              <div className="border-t border-slate-250 pt-2 flex justify-between items-baseline font-black text-xs text-slate-900">
                <span>Margin Keuntungan:</span>
                <span className="font-mono text-emerald-600">+{formatIDR(tokoNetProfit)}</span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-5.5 bg-slate-50/20 space-y-3.5 max-w-xl mx-auto" id="income-consolidation-summary">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block">Konsolidasi Pembukuan Gabungan</span>
            
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Total Omzet Gabungan (Wartel + Toko + USP):</span>
                <span className="font-mono font-bold">{formatIDR(consolidatedRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Beban Pokok Jasa & Barang Dagang (HPP):</span>
                <span className="font-mono text-slate-500">({formatIDR(consolidatedCOGS)})</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                <span>LABA KOTOR KONSOLIDASI (Gross Operating Profit):</span>
                <span className="font-mono text-emerald-600">+{formatIDR(consolidatedGrossProfit)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Beban Biaya Umum & Operasional Kantor:</span>
                <span className="font-mono">({formatIDR(allocatedOperasional)})</span>
              </div>
              
              <div className="pt-3 border-t-2 border-slate-800 flex justify-between items-center text-sm font-black text-slate-900">
                <span>SISA HASIL USAHA BERSIH KOPERASI (Net Profit):</span>
                <span className="font-mono text-blue-700 font-extrabold decoration-double underline">{formatIDR(consolidatedNetProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- REPORT VIEW 3: CONSOLIDATED BALANCE SHEET --- */}
      {reportTab === 'konsolidasi' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 animate-fade-in" id="rep-balance-sheet">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Laporan Neraca Konsolidasi Bulanan</h3>
              <p className="text-xs text-slate-400 font-medium">Buku keselarasan aset, kewajiban tabungan, dan modal ekuitas koperasi</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 text-blue-800 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-center shadow-xs">
              <Scale size={13} className="text-blue-600" />
              <span>Sistem Seimbang (Balanced Ledger)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="balance-double-entry">
            <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/10 space-y-4">
              <div className="border-b border-slate-150 pb-2">
                <h4 className="font-extrabold text-slate-850 text-xs uppercase tracking-wide">1. Aktiva / Aset (Harta)</h4>
              </div>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-700 block">Aset Lancar - Kas Utama</span>
                    <span className="text-[10px] text-slate-400">Kas likuid di tangan & kasir</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">{formatIDR(cashOnHand)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-700 block">Piutang Anggota - Outstanding S&P</span>
                    <span className="text-[10px] text-slate-400">Kontrak kredit bergulir aktif</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">{formatIDR(receivablesLoans)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-700 block">Persediaan Barang Dagang Gudang</span>
                    <span className="text-[10px] text-slate-400">Nilai aset modal stok toko retail</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">{formatIDR(inventoryAssetVal)}</span>
                </div>
                <div className="pt-3.5 border-t border-slate-200 flex justify-between items-center font-bold text-slate-800 text-xs">
                  <span>TOTAL AKTIVA (ASSETS)</span>
                  <span className="font-mono font-black text-sm text-blue-700">{formatIDR(totalAssets)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/10 space-y-3">
                <div className="border-b border-slate-150 pb-2">
                  <h4 className="font-extrabold text-slate-850 text-xs uppercase tracking-wide">2. Kewajiban (Liabilities)</h4>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-700 block">Kewajiban Lancar - Simpanan Sukarela</span>
                      <span className="text-[10px] text-slate-400">Saldo tabungan fleksibel anggota</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">{formatIDR(liabilitiesSavingsSukarela)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                    <span>TOTAL KEWAJIBAN</span>
                    <span className="font-mono font-black">{formatIDR(totalLiabilities)}</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/10 space-y-3">
                <div className="border-b border-slate-150 pb-2">
                  <h4 className="font-extrabold text-slate-850 text-xs uppercase tracking-wide">3. Modal / Ekuitas (Equity)</h4>
                </div>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-700 block">Simpanan Pokok Anggota</span>
                      <span className="text-[10px] text-slate-400">Disetor sekali saat pendaftaran</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">{formatIDR(equitySavingsPokok)}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-700 block">Simpanan Wajib Anggota</span>
                      <span className="text-[10px] text-slate-400">Kewajiban setoran iuran bulanan</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">{formatIDR(equitySavingsWajib)}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-700 block">Cadangan Kas & Laba Berjalan (SHU)</span>
                      <span className="text-[10px] text-slate-400">SHU ditahan dari performa unit</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">{formatIDR(equityReserves)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                    <span>TOTAL EKUITAS</span>
                    <span className="font-mono font-black">{formatIDR(totalEquity)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-4.5 rounded-xl text-white flex flex-col sm:flex-row justify-between items-center gap-3 border border-slate-800 shadow-lg" id="double-entry-footer">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-[10px] uppercase font-semibold text-blue-400 block">Persamaan Dasar Akuntansi</span>
              <span className="text-xs font-bold font-sans tracking-wide">ASET GABUNGAN = KEWAJIBAN + MODAL EKUITAS</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono font-bold bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700">
              <div className="text-center">
                <span className="text-[9px] text-blue-400 uppercase block">Total Aktiva</span>
                <span className="text-blue-300">{formatIDR(totalAssets)}</span>
              </div>
              <span className="text-blue-500 text-lg font-sans">=</span>
              <div className="text-center">
                <span className="text-[9px] text-blue-400 uppercase block">Pasiva (Kewajiban + Modal)</span>
                <span className="text-blue-300">{formatIDR(totalLiabilities + totalEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- NEW REPORT VIEW 4: MEMBER SHU CALCULATIONS --- */}
      {reportTab === 'shu' && (
        <div className="space-y-6 animate-fade-in" id="rep-shu-calculator">
          
          {/* Controls Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="text-blue-600" size={18} />
                  <h3 className="font-black text-slate-900 text-sm">Pengaturan Porsi Pembagian & Alokasi SHU</h3>
                </div>
                <p className="text-xs text-slate-400 font-medium">Ubah nama porsi dan persentase pembagian sisa hasil usaha (SHU) berdasarkan laba bersih koperasi</p>
              </div>
              <button
                type="button"
                onClick={handleAddPortion}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-3xs"
              >
                <Plus size={14} />
                Tambah Alokasi Porsi
              </button>
            </div>

            {/* Portions Input Table */}
            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Kategori Porsi Bagi Hasil</th>
                    <th className="p-3 w-32 text-center">Persentase (%)</th>
                    <th className="p-3 text-right">Proyeksi Nilai Alokasi (Rupiah)</th>
                    <th className="p-3 w-20 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700">
                  {bagiHasilPortions.map((p) => {
                    const isSystemPortion = p.id === 'jasa_modal' || p.id === 'jasa_usaha';
                    const portionAmount = Math.max(0, consolidatedNetProfit) * (p.percent / 100);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <input
                              type="text"
                              value={p.name}
                              onChange={(e) => handleUpdatePortionName(p.id, e.target.value)}
                              className="flex-1 min-w-[200px] px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              placeholder="Nama porsi..."
                            />
                            {isSystemPortion && (
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[8px] font-black uppercase tracking-wider self-start sm:self-center">
                                Integrasi Anggota
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 max-w-[120px] mx-auto">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={p.percent}
                              onChange={(e) => handleUpdatePortionPercent(p.id, Number(e.target.value))}
                              className="w-full text-center bg-transparent border-none text-xs font-mono font-bold focus:outline-none"
                            />
                            <span className="text-slate-400 font-bold font-mono">%</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800">
                          {formatIDR(portionAmount)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            disabled={isSystemPortion}
                            onClick={() => handleDeletePortion(p.id)}
                            className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            title={isSystemPortion ? "Porsi utama tidak boleh dihapus" : "Hapus porsi alokasi ini"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total Indicator & Summary Alert */}
            {(() => {
              const totalPercentSum = bagiHasilPortions.reduce((sum, p) => sum + p.percent, 0);
              const isPerfectSum = totalPercentSum === 100;

              return (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-3.5 text-xs font-bold transition-all bg-slate-50 border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg text-white ${isPerfectSum ? 'bg-emerald-600' : 'bg-amber-500'}`}>
                        <Check size={14} />
                      </div>
                      <div>
                        <span className="text-slate-700 block leading-tight">Total Akumulasi Alokasi</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Seluruh porsi pembagian wajib berjumlah 100%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`text-sm font-mono font-black ${isPerfectSum ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {totalPercentSum}% / 100%
                        </span>
                        {!isPerfectSum && (
                          <span className="text-[10px] text-amber-500 font-bold block">
                            {totalPercentSum > 100 ? `Kelebihan ${totalPercentSum - 100}%` : `Kurang ${100 - totalPercentSum}%`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Calculations Summary Pool */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Laba Bersih Koperasi (SHU Bersama)</span>
                      <span className="font-mono font-black text-slate-850 text-sm block mt-1">{formatIDR(consolidatedNetProfit)}</span>
                    </div>
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                      <span className="text-[9px] text-blue-600 font-extrabold uppercase tracking-wider block">Total Pool SHU Anggota ({alokasiSHUPercent}%)</span>
                      <span className="font-mono font-black text-blue-800 text-sm block mt-1">{formatIDR(memberSHUPool)}</span>
                    </div>
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                      <span className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-wider block">Pool Jasa Modal ({jasaModalPercent.toFixed(1)}%)</span>
                      <span className="font-mono font-black text-indigo-800 text-sm block mt-1">{formatIDR(poolJasaModal)}</span>
                    </div>
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                      <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider block">Pool Jasa Usaha ({jasaUsahaPercent.toFixed(1)}%)</span>
                      <span className="font-mono font-black text-emerald-800 text-sm block mt-1">{formatIDR(poolJasaUsaha)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Member selector and calculators table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-start justify-between w-full lg:w-auto">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Simulasi & Pembagian SHU per Anggota</h3>
                  <p className="text-xs text-slate-400 font-medium font-sans">Centang boks anggota di bawah untuk melakukan pembagian SHU langsung ke rekening Simpanan Sukarela mereka</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="lg:hidden p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  title="Cetak Simulasi SHU"
                >
                  <Printer size={16} />
                </button>
              </div>

              {/* Selection Controls */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="hidden lg:flex px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-3xs"
                >
                  <Printer size={13} />
                  Cetak Simulasi SHU
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllMembers}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Pilih Seluruh Anggota
                </button>
                <button
                  type="button"
                  onClick={handleResetSelectedMembers}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Bersihkan Pilihan
                </button>
                
                {/* Single Selector dropdown */}
                <select
                  onChange={(e) => handleSelectSingleMember(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-250 text-slate-750 font-bold rounded-lg text-xs"
                  value={selectedMemberIds.length === 1 ? selectedMemberIds[0] : ''}
                >
                  <option value="">-- Pilih Satu Anggota --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.memberId}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3 text-center w-12">Pilih</th>
                    <th className="p-3">ID / Nama Anggota</th>
                    <th className="p-3 text-right">Simpanan Weight (Pokok+Wajib)</th>
                    <th className="p-3 text-right">Partisipasi Transaksi</th>
                    <th className="p-3 text-right">SHU Jasa Modal</th>
                    <th className="p-3 text-right">SHU Jasa Usaha</th>
                    <th className="p-3 text-right font-bold text-blue-700">Total Hak SHU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {shuList.map((s) => {
                    const isChecked = selectedMemberIds.includes(s.memberId);
                    return (
                      <tr key={s.memberId} className={`hover:bg-slate-50/50 transition-colors ${isChecked ? 'bg-blue-50/20' : ''}`}>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleMemberSelection(s.memberId)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-850 block">{s.name}</span>
                          <span className="font-mono text-[9px] font-bold text-slate-400">{s.memberId}</span>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-500">
                          {formatIDR(s.savingsWeight)}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-500" title="Pembelian toko + Bunga simpan pinjam + Pemakaian wartel">
                          {formatIDR(s.transactionWeight)}
                        </td>
                        <td className="p-3 text-right font-mono text-indigo-600">
                          {formatIDR(s.shuModal)}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-600">
                          {formatIDR(s.shuUsaha)}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-blue-700">
                          {formatIDR(s.totalSHU)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Distribution controls */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-800">
                  Anggota Terpilih untuk Dibagikan SHU: <span className="font-mono text-sm font-black text-blue-600">{selectedMemberIds.length}</span> Orang
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Dana SHU akan otomatis didepositokan ke Saldo Simpanan Sukarela masing-masing anggota terpilih.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedMemberIds.length === 0}
                  onClick={handleDistributeSelectedSHU}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black rounded-xl cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Check size={16} />
                  Bagikan SHU Terpilih ke Tabungan Sukarela
                </button>
              </div>
            </div>

            {shuSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-start gap-2.5 shadow-2xs animate-fade-in">
                <CheckCircle2 size={16} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                <span>{shuSuccessMsg}</span>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
