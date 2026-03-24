import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

let bot: TelegramBot | null = null;

if (token) {
  bot = new TelegramBot(token);
  console.log("✅ Telegram bot initialized");
} else {
  console.warn("⚠️ TELEGRAM_BOT_TOKEN not set — notifications disabled");
}

interface OrderNotification {
  orderId?: string;
  packName: string;
  email: string;
  username: string;
  price: string;
  paymentMethod: string;
  paymentScreenshot?: string | null;
}

export async function sendOrderNotification(order: OrderNotification): Promise<void> {
  if (!token || !adminChatId) {
    console.warn("Telegram bot or admin chat ID not configured — skipping notification");
    return;
  }

  const caption = [
    `🔔 <b>New Order Received!</b>`,
    ``,
    ...(order.orderId ? [`🆔 <b>Order ID:</b> ${order.orderId}`] : []),
    `📦 <b>Pack:</b> ${order.packName}`,
    `📧 <b>Email:</b> ${order.email}`,
    `👤 <b>User:</b> ${order.username}`,
    `💰 <b>Price:</b> ${order.price} KS`,
    `💳 <b>Payment:</b> ${order.paymentMethod}`,
  ].join("\n");

  try {
    if (order.paymentScreenshot) {
      // Strip the base64 data-URI header (e.g. "data:image/png;base64,")
      const base64Match = order.paymentScreenshot.match(/^data:[^;]+;base64,(.+)$/);
      if (base64Match) {
        const imageBuffer = Buffer.from(base64Match[1], "base64");

        // Use Node's built-in FormData + Blob (no manual Content-Type header)
        const blob = new Blob([imageBuffer], { type: "image/png" });
        const form = new FormData();
        form.append("chat_id", adminChatId);
        form.append("photo", blob, "receipt.png");
        form.append("caption", caption);
        form.append("parse_mode", "HTML");

        // POST to Telegram — do NOT set Content-Type; fetch auto-generates it
        const url = `https://api.telegram.org/bot${token}/sendPhoto`;

        const res = await fetch(url, {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Telegram sendPhoto failed (${res.status}): ${errBody}`);
        }

        console.log(`📨 Telegram photo notification sent for order ${order.orderId ?? "N/A"}`);
        return;
      }
    }

    // Fallback: no screenshot — send text only via bot SDK
    if (bot) {
      await bot.sendMessage(adminChatId, caption, { parse_mode: "HTML" });
    }
    console.log(`📨 Telegram text notification sent for order ${order.orderId ?? "N/A"}`);
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
  }
}

