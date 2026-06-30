// /api/send-order.js
// Vercel Serverless Function — forwards website orders to a Telegram chat.
//
// Required environment variables (set in Vercel dashboard → Project → Settings → Environment Variables):
//   TELEGRAM_BOT_TOKEN  → the token you got from @BotFather
//   TELEGRAM_CHAT_ID    → the chat/group/channel ID that should receive orders
//   ORDER_API_SECRET    → any random string you make up yourself (acts as a simple shared password
//                          between your frontend and this function, so random bots/scripts hitting
//                          this URL directly get rejected before reaching Telegram)
//
// Never put these values directly in this file or in any frontend code.

// Very simple in-memory rate limiter. Resets whenever the serverless function
// cold-starts, so it's not perfect, but it stops basic flooding within a
// running instance. For heavier protection, use Vercel's built-in Firewall
// rules or a service like Upstash for persistent rate limiting.
const requestLog = new Map(); // ip -> [timestamps]
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 orders per IP per minute

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // ---- Shared-secret check ----
  // Your frontend sends this header with every request. Anyone calling this
  // endpoint directly without knowing the secret gets rejected immediately.
  const expectedSecret = process.env.ORDER_API_SECRET;
  const providedSecret = req.headers['x-order-secret'];
  if (expectedSecret && providedSecret !== expectedSecret) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  // ---- Basic rate limiting ----
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many orders sent. Please wait a moment and try again.' });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables');
    return res.status(500).json({ ok: false, error: 'Server is not configured correctly' });
  }

  try {
    const { name, phone, method, address, notes, items, drinkTotal } = req.body || {};

    if (!name || !phone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'Missing required order details' });
    }

    // Basic sanity limits to stop abuse via huge/garbage payloads
    if (
      String(name).length > 100 ||
      String(phone).length > 30 ||
      String(address || '').length > 300 ||
      String(notes || '').length > 500 ||
      items.length > 50
    ) {
      return res.status(400).json({ ok: false, error: 'Order details too large' });
    }

    const orderLines = items
      .map((i) => {
        const qty = Number(i.qty) || 1;
        const priceText = i.isFood
          ? '(price on order)'
          : `– GH₵${(Number(i.price) * qty).toFixed(2)}`;
        return `• ${i.name} x${qty} ${priceText}`;
      })
      .join('\n');

    const safeDrinkTotal = Number(drinkTotal) || 0;

    const messageParts = [
      '🍽 *New Order — ESSGRAY Website*',
      '',
      `*Customer:* ${escapeMd(name)}`,
      `*Phone:* ${escapeMd(phone)}`,
      `*Method:* ${escapeMd(method || 'pickup')}`,
    ];

    if (method === 'delivery' && address) {
      messageParts.push(`*Address:* ${escapeMd(address)}`);
    }

    messageParts.push('', '*ORDER:*', orderLines, '', `*Drinks Total: GH₵${safeDrinkTotal.toFixed(2)}*`);

    if (notes) {
      messageParts.push('', `*Notes:* ${escapeMd(notes)}`);
    }

    const message = messageParts.join('\n');

    const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const telegramData = await telegramRes.json();

    if (!telegramData.ok) {
      console.error('Telegram API error:', telegramData);
      return res.status(502).json({ ok: false, error: 'Failed to send message to Telegram' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('send-order error:', err);
    return res.status(500).json({ ok: false, error: 'Unexpected server error' });
  }
}

function escapeMd(text) {
  return String(text).replace(/([_*`\[\]])/g, '\\$1');
}
