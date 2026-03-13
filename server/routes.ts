import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";

async function sendTelegramNotification(body: Record<string, string>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram env vars not set — skipping notification");
    return;
  }

  const orderId = body.orderId || "N/A";

  const caption = [
    `🚨 <b>NEW ORDER: ${orderId}</b>`,
    "",
    `📦 <b>Product:</b> ${body.productName || "—"} ${body.planName || ""}`.trim(),
    `💰 <b>Price:</b> ${body.price || "—"}`,
    `📱 <b>Contact:</b> ${body.contactPlatform || "—"} → @${body.contactUsername || "—"}`,
    `💳 <b>Payment:</b> ${body.paymentMethod || "—"}`,
  ].join("\n");

  if (body.paymentScreenshot) {
    const base64 = body.paymentScreenshot.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    const blob = new Blob([buffer], { type: "image/jpeg" });

    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("photo", blob, "payment_screenshot.jpg");
    form.append("caption", caption);
    form.append("parse_mode", "HTML");

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendPhoto`,
      { method: "POST", body: form }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Telegram sendPhoto failed: ${err}`);
    }
  } else {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: caption, parse_mode: "HTML" }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Telegram sendMessage failed: ${err}`);
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/config", (_req, res) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: "Supabase config not set" });
    }

    res.json({ supabaseUrl, supabaseAnonKey });
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(data);

      try {
        await sendTelegramNotification(req.body);
      } catch (telegramErr) {
        console.error("Telegram notification failed (order still saved):", telegramErr);
      }

      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      console.error("Error creating order:", err);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(data);
      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      console.error("Error creating order:", err);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const allOrders = await storage.getOrders();
      res.json(allOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["pending", "confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const order = await storage.updateOrderStatus(id, status);
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (err) {
      console.error("Error updating order:", err);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  return httpServer;
}
