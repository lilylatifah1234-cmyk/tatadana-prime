/**
 * TataDana Prime - Telegram Bot Long Polling Runner
 * Berguna untuk development lokal tanpa memerlukan ngrok atau public domain HTTPS.
 * Menarik pesan dari Telegram API dan meneruskannya ke http://localhost:3000/api/telegram/webhook
 */

const fs = require("fs");
const path = require("path");

// Baca .env.local
const envPath = path.resolve(__dirname, "../.env.local");
let token = process.env.TELEGRAM_BOT_TOKEN;

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("TELEGRAM_BOT_TOKEN=")) {
      token = trimmed.split("=")[1]?.trim();
    }
  }
}

if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN tidak ditemukan di .env.local");
  process.exit(1);
}

let offset = 0;
let isRunning = true;

async function checkWebhookDisabled() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await res.json();
    if (data.ok && data.result?.url) {
      console.log(`⚠️ Webhook aktif terdeteksi (${data.result.url}). Menghapus webhook agar long-polling bisa menerima pesan...`);
      await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=false`);
      console.log("✅ Webhook berhasil dihapus. Siap menjalankan polling lokal.");
    }
  } catch (e) {
    console.warn("Gagal mengecek webhook info:", e.message);
  }
}

async function poll() {
  if (!isRunning) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=10`);
    const data = await res.json();

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        offset = update.update_id + 1;
        const msg = update.message;
        const fromName = msg?.from?.first_name || "User";
        const text = msg?.text || msg?.caption || "[Media/Voice]";

        console.log(`📥 [Pesan Masuk] Dari: ${fromName} | Pesan: "${text}" (Update ID: ${update.update_id})`);

        // Teruskan payload ke webhook local
        try {
          const webhookRes = await fetch("http://localhost:3000/api/telegram/webhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(update),
          });
          const result = await webhookRes.json();
          if (result.ok) {
            console.log(`📤 [Balasan Terkirim] ${fromName}: ${result.reply ? result.reply.substring(0, 60) + "..." : "OK"}`);
          }
        } catch (postErr) {
          console.error("❌ Gagal meneruskan ke webhook Next.js:", postErr.message);
        }
      }
    }
  } catch (err) {
    // console.error("Poll error:", err.message);
  }

  if (isRunning) {
    setTimeout(poll, 1000);
  }
}

async function start() {
  console.log("════════════════════════════════════════════════════════════");
  console.log("🤖 TATADANA PRIME - TELEGRAM LOCAL BOT ENGINE");
  console.log("════════════════════════════════════════════════════════════");
  console.log(`Bot: @lilybhotom_bot`);
  console.log(`Target Handler: http://localhost:3000/api/telegram/webhook`);
  console.log(`Status: Mendengarkan pesan chat secara real-time...`);
  console.log("Tekan Ctrl+C untuk menghentikan.");
  console.log("────────────────────────────────────────────────────────────");

  await checkWebhookDisabled();
  poll();
}

start();
