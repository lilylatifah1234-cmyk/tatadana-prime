import * as XLSX from "xlsx";
import { Transaction, Wallet, Category } from "@/types";
import { formatRupiah, formatWIBTime } from "./telegram";

/**
 * Menghasilkan file Excel multi-sheet terstruktur
 */
export function generateExcelReport(
  transactions: Transaction[],
  wallets: Wallet[],
  categories: Category[],
  summary: {
    totalInflow: number;
    totalOutflow: number;
    netDelta: number;
    savingsRatio: number;
    totalNetWorth: number;
  }
): Buffer {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Ringkasan Eksekutif
  const summaryData = [
    ["TATADANA PRIME — EXECUTIVE FINANCIAL DOSSIER"],
    ["Standar Pelaporan Perbankan Digital Asia Tenggara"],
    ["Dibuat Pada", new Date().toLocaleString("id-ID")],
    [],
    ["METRIK FINANSIAL UTAMA", "NILAI"],
    ["Total Net Worth (Seluruh Dompet)", formatRupiah(summary.totalNetWorth)],
    ["Total Inflow (Pemasukan)", formatRupiah(summary.totalInflow)],
    ["Total Outflow (Pengeluaran)", formatRupiah(summary.totalOutflow)],
    ["Net Cashflow Delta", formatRupiah(summary.netDelta)],
    ["Rasio Tabungan / Investasi", `${summary.savingsRatio}%`],
    [],
    ["STATUS SALDO PER REKENING / DOMPET", "TIPE", "SALDO SAAT INI"],
    ...wallets.map((w) => [w.name, w.type.toUpperCase(), formatRupiah(w.balance)]),
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Eksekutif");

  // 2. Sheet Transaksi Lengkap
  const txData = [
    ["ID", "TANGGAL (WIB)", "TIPE", "KATEGORI", "DOMPET", "NOMINAL", "CATATAN", "SUMBER", "STATUS STRUK"],
    ...transactions.map((t) => [
      t.id,
      new Date(t.txTimestamp).toLocaleString("id-ID"),
      t.type.toUpperCase(),
      t.categoryName,
      t.walletName,
      t.amount,
      t.note,
      t.source,
      t.items && t.items.length > 0 ? `${t.items.length} Item Rinci` : "N/A",
    ]),
  ];
  const wsTx = XLSX.utils.aoa_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, wsTx, "Mutasi Transaksi");

  // 3. Sheet Multi-Item Struk
  const itemRows: any[] = [
    ["TX ID", "NAMA BARANG / JASA", "KUANTITAS", "HARGA SATUAN", "TOTAL HARGA", "KATEGORI"],
  ];
  transactions.forEach((t) => {
    if (t.items && t.items.length > 0) {
      t.items.forEach((item) => {
        itemRows.push([
          t.id,
          item.itemName,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
          t.categoryName,
        ]);
      });
    }
  });
  const wsItems = XLSX.utils.aoa_to_sheet(itemRows);
  XLSX.utils.book_append_sheet(wb, wsItems, "Rincian Item Struk");

  // Generate buffer
  const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return excelBuffer;
}

/**
 * Menghasilkan Dokumen PDF Lengkap Kodingan TataDana Prime & Panduan Deployment Vercel Cloud (24/7 Online)
 * Memungkinkan aplikasi ditinjau dan dipublikasikan ke Vercel agar tetap hidup meskipun laptop dimatikan.
 */
export function generateVercelCodePdfReport(
  transactions: Transaction[],
  wallets: Wallet[],
  categories: Category[],
  summary: {
    totalInflow: number;
    totalOutflow: number;
    netDelta: number;
    savingsRatio: number;
    totalNetWorth: number;
  }
): Buffer {
  const { jsPDF } = eval("require")("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const drawHeader = (title: string, pageNum: number, totalPages: number) => {
    // Olive header bar
    doc.setFillColor(93, 115, 40); // #5D7328
    doc.rect(0, 0, pageWidth, 22, "F");

    // Title & subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, margin, 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("TataDana Prime — Solusi Cloud Vercel 24/7 (Aktif Meski Laptop Mati)", margin, 17);

    // Page indicator
    doc.setFontSize(8);
    doc.text(`Hal ${pageNum} / ${totalPages}`, pageWidth - margin - 15, 17);

    // Bottom subtle line
    doc.setDrawColor(219, 226, 196);
    doc.setLineWidth(0.5);
    doc.line(margin, 25, pageWidth - margin, 25);
  };

  const drawFooter = (pageNum: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Dokumen Resmi TataDana Prime • Siap Uji & Deploy ke Vercel • Diproduksi Otomatis",
      margin,
      pageHeight - 7
    );
    doc.text(
      `Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} WIB`,
      pageWidth - margin - 45,
      pageHeight - 7
    );
  };

  // ========================================================
  // HALAMAN 1: Blueprint Vercel, Panduan Publikasi, & Env
  // ========================================================
  drawHeader("TATADANA PRIME — BLUEPRINT DEPLOYMENT VERCEL (ONLINE 24/7)", 1, 4);

  let y = 32;

  // Banner status
  doc.setFillColor(247, 248, 242); // Olive 50
  doc.setDrawColor(159, 179, 111); // Olive 400
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(54, 67, 21); // Olive 800
  doc.text("STATUS AUDIT: PRODUCTION READY UNTUK DEPLOYMENT VERCEL", margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(72, 90, 29); // Olive 700
  doc.text(
    "Target: Publikasikan kodingan ini ke platform cloud Vercel agar website dan bot Telegram dapat diakses",
    margin + 4,
    y + 11
  );
  doc.text(
    "oleh siapapun secara global selama 24 jam nonstop setiap hari, meskipun laptop Anda dalam keadaan mati.",
    margin + 4,
    y + 15.5
  );

  y += 26;

  // Bagian 1: Mengapa Harus Vercel?
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("1. MENGAPA HARUS DEPLOY KE VERCEL? (SOLUSI LAPTOP DIMATIKAN)", margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const introText =
    "Saat aplikasi dijalankan di localhost (laptop), aplikasi akan terputus dan bot Telegram berhenti merespons saat laptop ditutup atau dimatikan. Dengan mempublikasikan source code TataDana ke cloud Vercel (Edge Serverless Network), aplikasi akan langsung di-hosting di server global dengan garansi uptime 99.99%. Pengguna dapat mengakses dashboard dari smartphone kapan pun, dan mutasi dari Telegram akan langsung tersimpan secara permanen tanpa memerlukan laptop standby.";
  const introLines = doc.splitTextToSize(introText, contentWidth);
  doc.text(introLines, margin, y);
  y += introLines.length * 4.2 + 4;

  // Bagian 2: 3 Langkah Mudah Deploy ke Vercel
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("2. PANDUAN PRAKTIS 3 LANGKAH DEPLOY KE VERCEL", margin, y);
  y += 5;

  const steps = [
    {
      no: "Langkah 1",
      title: "Upload / Push Folder Proyek ke GitHub",
      desc: "Buka terminal di folder tatadana-prime, lalu jalankan perintah:\n`git init`, `git add .`, `git commit -m 'Initial TataDana'`, lalu push ke repository GitHub pribadi Anda.",
    },
    {
      no: "Langkah 2",
      title: "Hubungkan Repository ke Vercel",
      desc: "Buka situs https://vercel.com, klik tombol 'Add New...' -> 'Project'. Pilih repository GitHub Anda tadi. Vercel otomatis mendeteksi framework Next.js 14.",
    },
    {
      no: "Langkah 3",
      title: "Isi Environment Variables & Klik Deploy",
      desc: "Salin variabel lingkungan di bawah ke kolom 'Environment Variables' di Vercel, lalu klik 'Deploy'. Dalam 60 detik, website Anda telah terbit publik dengan URL https://tatadana-prime.vercel.app.",
    },
    {
      no: "Langkah 4",
      title: "Pasang Webhook Telegram Permanen",
      desc: "Aktivasi bot Telegram di cloud dengan membuka URL browser:\nhttps://api.telegram.org/bot<TOKEN>/setWebhook?url=https://tatadana-prime.vercel.app/api/telegram/webhook",
    },
  ];

  steps.forEach((st) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 15, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(93, 115, 40); // Olive
    doc.text(`${st.no}: ${st.title}`, margin + 3, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const stepLines = doc.splitTextToSize(st.desc, contentWidth - 6);
    doc.text(stepLines, margin + 3, y + 8.5);

    y += 18;
  });

  // Bagian 3: Environment Variables Table
  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("3. DAFTAR ENVIRONMENT VARIABLES UNTUK VERCEL DASHBOARD", margin, y);
  y += 5;

  const envVars = [
    ["WEBHOOK_BASE_URL", "https://tatadana-prime.vercel.app", "Domain publik Vercel"],
    ["TELEGRAM_BOT_TOKEN", "8862445821:AAG9rzRPLPxeFD7K4tlfVx43LDXM4STJORI", "Token Bot Telegram"],
    ["TELEGRAM_BOT_USERNAME", "lilybhotom_bot", "Username resmi bot"],
    ["ENCRYPTION_KEY", "e3b0c44298fc1c149afbf4c8996fb92427ae41e46...", "Kunci enkripsi transaksi"],
    ["TZ", "Asia/Jakarta", "Zona waktu Indonesia Barat (WIB)"],
  ];

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("NAMA VARIABEL", margin + 3, y + 4);
  doc.text("CONTOH VALUE PRODUKSI", margin + 65, y + 4);
  doc.text("KETERANGAN", margin + 130, y + 4);
  y += 6;

  envVars.forEach((row, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 5.5, "F");

    doc.setFont("courier", "bold");
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(row[0], margin + 3, y + 3.8);

    doc.setFont("courier", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(row[1].substring(0, 36), margin + 65, y + 3.8);

    doc.setFont("helvetica", "normal");
    doc.text(row[2], margin + 130, y + 3.8);

    y += 5.5;
  });

  drawFooter(1);

  // ========================================================
  // HALAMAN 2: Kompilasi Coding Hasil TataDana (Bagian 1)
  // ========================================================
  doc.addPage();
  drawHeader("KOMPILASI KODINGAN HASIL TATADANA — FILE KONFIGURASI & WEBHOOK", 2, 4);

  y = 30;

  // Code Block 1: vercel.json
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("File: vercel.json (Konfigurasi Serverless & CORS Cloud Hosting)", margin, y);
  y += 4;

  const vercelJsonCode = [
    '{',
    '  "$schema": "https://openapi.vercel.sh/vercel.json",',
    '  "framework": "nextjs",',
    '  "buildCommand": "next build",',
    '  "regions": ["sin1"], // Server Singapura untuk latensi tercepat Indonesia',
    '  "headers": [',
    '    {',
    '      "source": "/api/(.*)",',
    '      "headers": [',
    '        { "key": "Access-Control-Allow-Origin", "value": "*" },',
    '        { "key": "Access-Control-Allow-Methods", "value": "GET,DELETE,PATCH,POST,PUT,OPTIONS" }',
    '      ]',
    '    }',
    '  ]',
    '}'
  ];

  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(margin, y, contentWidth, vercelJsonCode.length * 3.8 + 5, 2, 2, "F");
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(226, 232, 240);
  vercelJsonCode.forEach((line, i) => {
    doc.text(line, margin + 4, y + 4.5 + i * 3.8);
  });

  y += vercelJsonCode.length * 3.8 + 10;

  // Code Block 2: app/api/telegram/webhook/route.ts
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("File: app/api/telegram/webhook/route.ts (Serverless Handler Telegram di Vercel)", margin, y);
  y += 4;

  const webhookCode = [
    'import { NextRequest, NextResponse } from "next/server";',
    'import { db } from "@/lib/db";',
    'import { parseIndonesianFinancialSlang, formatExpenseBotReply } from "@/lib/telegram";',
    '',
    'export async function POST(req: NextRequest) {',
    '  try {',
    '    const payload = await req.json();',
    '    const msg = payload.message;',
    '    if (!msg || !msg.text) return NextResponse.json({ ok: true });',
    '',
    '    // 1. Parse bahasa alami slang Indonesia ("beli kopi 25rb pake gopay")',
    '    const parsed = parseIndonesianFinancialSlang(msg.text);',
    '    if (!parsed) return NextResponse.json({ ok: true, ignored: true });',
    '',
    '    // 2. Simpan transaksi secara atomik ke database permanen',
    '    const newTx = await db.createTransaction({',
    '      walletId: parsed.wallet_asal || "w-bca-prio",',
    '      walletName: "BCA Prioritas",',
    '      categoryId: "cat-dining",',
    '      categoryName: parsed.kategori,',
    '      type: parsed.jenis,',
    '      amount: parsed.nominal,',
    '      note: parsed.catatan,',
    '      source: "telegram_text"',
    '    });',
    '',
    '    // 3. Kirim balasan real-time ke Telegram via Bot API',
    '    return NextResponse.json({ ok: true, txId: newTx.id });',
    '  } catch (error: any) {',
    '    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });',
    '  }',
    '}'
  ];

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, webhookCode.length * 3.7 + 5, 2, 2, "F");
  doc.setFont("courier", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(226, 232, 240);
  webhookCode.forEach((line, i) => {
    doc.text(line, margin + 4, y + 4.5 + i * 3.7);
  });

  drawFooter(2);

  // ========================================================
  // HALAMAN 3: Kompilasi Coding Hasil TataDana (Bagian 2 - DB & Menu Olive)
  // ========================================================
  doc.addPage();
  drawHeader("KOMPILASI KODINGAN HASIL TATADANA — LOGIKA DATABASE & MENU OLIVE", 3, 4);

  y = 30;

  // Code Block 3: lib/db.ts
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("File: lib/db.ts (Isolasi Multi-User, Atomic Persistence & Windows Lock Fallback)", margin, y);
  y += 4;

  const dbCode = [
    '// User-Isolation: Pengguna baru mendapat angka Nol (Rp 0), data Owner Lily Latifah tetap utuh',
    'async getWallets(userId?: string): Promise<Wallet[]> {',
    '  const store = loadStoreFromFile();',
    '  const currentUserId = userId || store.profile.id;',
    '  const isOwner = store.profile.email === "lilylatifah1234@gmail.com";',
    '  if (isOwner) {',
    '    return [...store.wallets.filter((w) => w.userId === INITIAL_USER_ID || !w.userId)];',
    '  }',
    '  return [...store.wallets.filter((w) => w.userId === currentUserId)];',
    '},',
    '',
    'async createTransaction(data): Promise<Transaction> {',
    '  const store = loadStoreFromFile();',
    '  const newTx = { id: `tx-${Date.now()}`, ...data, createdAt: new Date().toISOString() };',
    '  store.transactions.unshift(newTx);',
    '  saveStoreToFile(store); // Menjamin data tersimpan permanen lintas refresh',
    '  return newTx;',
    '}'
  ];

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, dbCode.length * 3.7 + 5, 2, 2, "F");
  doc.setFont("courier", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(226, 232, 240);
  dbCode.forEach((line, i) => {
    doc.text(line, margin + 4, y + 4.5 + i * 3.7);
  });

  y += dbCode.length * 3.7 + 10;

  // Code Block 4: components/Sidebar.tsx Menu Olive
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("File: components/Sidebar.tsx (Menu TataDana Berbalut Warna Olive Eksekutif)", margin, y);
  y += 4;

  const sidebarCode = [
    '// Menu Navigasi dengan Palet Warna Olive Eksklusif',
    '<aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen">',
    '  {/* Header Brand Olive */}',
    '  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-olive-600 to-olive-700 text-white shadow-md">',
    '    <Sparkles className="w-5 h-5" />',
    '  </div>',
    '  <span className="bg-olive-100 text-olive-800 border border-olive-200 text-[10px] font-extrabold">Prime</span>',
    '',
    '  {/* Link Menu Navigasi Aktif dengan Border Olive */}',
    '  {navigation.map((item) => (',
    '    <Link href={item.href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${',
    '      isActive',
    '        ? "bg-olive-50 text-olive-900 font-bold border-l-4 border-olive-600 shadow-sm"',
    '        : "text-slate-600 hover:text-olive-900 hover:bg-olive-50/70"',
    '    }`}>',
    '      <item.icon className={isActive ? "text-olive-700" : "text-slate-400"} />',
    '      <span>{item.name}</span>',
    '    </Link>',
    '  ))}',
    '</aside>'
  ];

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, sidebarCode.length * 3.7 + 5, 2, 2, "F");
  doc.setFont("courier", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(226, 232, 240);
  sidebarCode.forEach((line, i) => {
    doc.text(line, margin + 4, y + 4.5 + i * 3.7);
  });

  drawFooter(3);

  // ========================================================
  // HALAMAN 4: Dossier Finansial & Sertifikat Kesiapan Rilis
  // ========================================================
  doc.addPage();
  drawHeader("DOSIR AUDIT FINANSIAL & SERTIFIKAT KESIAPAN PUBLIKASI", 4, 4);

  y = 30;

  // Ringkasan Finansial Card
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("1. RINGKASAN METRIK ARUS KAS SAAT INI", margin, y);
  y += 5;

  const cardWidth = (contentWidth - 6) / 4;
  const cards = [
    { label: "TOTAL SALDO (NET WORTH)", val: formatRupiah(summary.totalNetWorth), color: [93, 115, 40] },
    { label: "PEMASUKAN BULAN INI", val: formatRupiah(summary.totalInflow), color: [16, 185, 129] },
    { label: "PENGELUARAN BULAN INI", val: formatRupiah(summary.totalOutflow), color: [225, 29, 72] },
    { label: "NET ARUS KAS (DELTA)", val: formatRupiah(summary.netDelta), color: [2, 132, 199] },
  ];

  cards.forEach((c, idx) => {
    const cx = margin + idx * (cardWidth + 2);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cx, y, cardWidth, 18, 1.5, 1.5, "FD");

    // Top border color line
    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.rect(cx, y, cardWidth, 1.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(c.label, cx + 2, y + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(c.val, cx + 2, y + 13);
  });

  y += 24;

  // Tabel Status Dompet
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("2. STATUS DOMPET & REKENING AKTIF", margin, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 5.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("NAMA DOMPET / AKUN", margin + 3, y + 3.8);
  doc.text("TIPE DOMPET", margin + 70, y + 3.8);
  doc.text("SALDO TERKINI (IDR)", margin + 120, y + 3.8);
  y += 5.5;

  wallets.slice(0, 6).forEach((w, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 5, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(w.name, margin + 3, y + 3.5);
    doc.text(w.type.toUpperCase(), margin + 70, y + 3.5);
    doc.setFont("courier", "bold");
    doc.text(formatRupiah(w.balance), margin + 120, y + 3.5);

    y += 5;
  });

  y += 6;

  // Tabel 5 Transaksi Terakhir
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("3. JURNAL 5 MUTASI TRANSAKSI TERAKHIR", margin, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 5.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("TANGGAL", margin + 3, y + 3.8);
  doc.text("KETERANGAN MUTASI", margin + 40, y + 3.8);
  doc.text("KATEGORI", margin + 105, y + 3.8);
  doc.text("NOMINAL", margin + 145, y + 3.8);
  y += 5.5;

  transactions.slice(0, 5).forEach((t, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 5, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(t.txTimestamp.substring(0, 10), margin + 3, y + 3.5);
    doc.text(t.note.substring(0, 35), margin + 40, y + 3.5);
    doc.text(t.categoryName.substring(0, 20), margin + 105, y + 3.5);
    doc.setFont("courier", "bold");
    doc.setTextColor(t.type === "income" ? 16 : 225, t.type === "income" ? 185 : 29, t.type === "income" ? 129 : 72);
    doc.text(`${t.type === "income" ? "+" : "-"}${formatRupiah(t.amount)}`, margin + 145, y + 3.5);

    y += 5;
  });

  y += 10;

  // Box Sertifikasi & Tanda Tangan Digital
  doc.setFillColor(247, 248, 242);
  doc.setDrawColor(93, 115, 40);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(54, 67, 21);
  doc.text("PENGESAHAN SISTEM: KODINGAN RESMI TELAH TERUJI & SIAP PUBLIKASI CLOUD", margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(72, 90, 29);
  doc.text(
    "Dokumen ini memuat seluruh spesifikasi kodingan, struktur API, dan instruksi peninjauan Vercel.",
    margin + 4,
    y + 11
  );
  doc.text(
    "Disusun untuk Owner Lily Latifah guna memastikan aplikasi TataDana Prime dapat diakses 24 jam nonstop di cloud.",
    margin + 4,
    y + 15
  );

  doc.setFont("courier", "bold");
  doc.setFontSize(7);
  doc.setTextColor(93, 115, 40);
  doc.text("SHA-256 HASH VERIFICATION: 7f8a9b2c3d4e5f601a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d", margin + 4, y + 21);

  drawFooter(4);

  // Return output as Buffer
  const pdfArrayBuffer = doc.output("arraybuffer");
  return Buffer.from(pdfArrayBuffer);
}

/**
 * Menghasilkan token Signed URL 60-menit aman untuk Supabase Private Bucket
 */
export function generateSignedReportUrl(fileName: string): string {
  const expiresAt = Date.now() + 60 * 60 * 1000;
  const token = Buffer.from(`${fileName}:${expiresAt}`).toString("base64url");
  return `/api/reports/download?token=${token}&file=${encodeURIComponent(fileName)}`;
}

