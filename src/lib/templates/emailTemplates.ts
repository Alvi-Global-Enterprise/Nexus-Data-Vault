import { EmailTemplate } from '@/types/api';

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'saas_launch',
    name: 'SaaS Feature Launch & Product Announcement',
    badge: 'PRODUCT UPDATE',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    category: 'newsletter',
    description: 'Modern, high-converting product release template with feature highlights and primary CTA.',
    subjectDefault: '🚀 Introducing MailForge 2.0: Instant High-Converting Email AI',
    previewSnippet: 'We have completely re-engineered our platform to deliver 3x faster delivery and smarter AI copy...',
    textContent: `Hi {{firstName}},

We're thrilled to introduce our major upgrade: MailForge AI 2.0!

Key Highlights:
- 10x Faster Queue Processing
- Built-in Gemini & OpenAI Copywriting Engine
- Deep Delivery Analytics & Live Status Tracking

Get started today and scale your campaigns with zero downtime.

Best regards,
The Product Team`,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px; color: #e2e8f0; }
    .container { max-width: 580px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%); padding: 36px 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; letter-spacing: 1px; }
    .content { padding: 32px; font-size: 15px; line-height: 1.6; color: #94a3b8; }
    .content p { margin: 0 0 18px; }
    .highlight-box { background: rgba(6, 182, 212, 0.06); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0; }
    .feature-item { display: flex; margin-bottom: 12px; color: #cbd5e1; }
    .feature-item:last-child { margin-bottom: 0; }
    .cta-container { text-align: center; margin: 32px 0 12px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4); }
    .footer { border-top: 1px solid #1e293b; padding: 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Major Release</div>
      <h1>Next-Gen Intelligence is Here</h1>
    </div>
    <div class="content">
      <p style="color: #f8fafc; font-size: 17px; font-weight: 600;">Hello {{firstName}},</p>
      <p>We are thrilled to roll out our latest platform release designed specifically to accelerate your marketing pipeline.</p>
      <div class="highlight-box">
        <div style="font-weight: 700; color: #38bdf8; margin-bottom: 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">What's New in Version 2.0</div>
        <div class="feature-item">⚡ <strong>10x Faster Ingestion:</strong> Seamless drag-and-drop spreadsheets with auto-mapping.</div>
        <div class="feature-item">🤖 <strong>Built-in AI Copywriting:</strong> Instant headline generation and tone calibration.</div>
        <div class="feature-item">📊 <strong>Live Telemetry:</strong> Track sends, bounces, and queue progress in real time.</div>
      </div>
      <p>Everything is live right now in your account dashboard. Jump in and try it out on your next campaign:</p>
      <div class="cta-container">
        <a href="https://app.example.com" class="cta-btn">Explore New Dashboard &rarr;</a>
      </div>
    </div>
    <div class="footer">
      Sent to {{email}} · <a href="#" style="color: #64748b;">Unsubscribe</a> · Privacy Policy
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'crypto_alpha',
    name: 'Crypto & Market Intelligence Report',
    badge: 'MARKET ALPHA',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    category: 'crypto',
    description: 'Finance and crypto investor newsletter with metric tickers, alpha insights, and risk disclosures.',
    subjectDefault: '📈 Weekly Alpha: Bitcoin Liquidity Surge & Top Institutional Movements',
    previewSnippet: 'Institutional inflows hit record numbers this week as ETF volumes cross new thresholds...',
    textContent: `Hi {{firstName}},

Here is your private weekly crypto briefing:

MARKET SNAPSHOT:
- BTC Dominance: 58.4%
- Total Net Inflows: +$1.84B
- On-chain Velocity: Bullish Breakout

Key Takeaway:
Large-scale institutional accumulation is accelerating across top custodians. Check out our in-depth analysis on the portal.

Stay safe and manage risk,
Alpha Research Desk`,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070b16; margin: 0; padding: 24px; color: #e2e8f0; }
    .container { max-width: 580px; margin: 0 auto; background: #0c1224; border: 1px solid #1a2542; border-radius: 16px; overflow: hidden; }
    .header { border-bottom: 1px solid #1a2542; padding: 28px; background: #0e162e; display: flex; justify-content: space-between; align-items: center; }
    .header-title { font-size: 20px; font-weight: 800; color: #10b981; margin: 0; letter-spacing: -0.5px; }
    .metrics-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 8px; margin: 20px 0; }
    .metric-col { display: table-cell; width: 33.33%; background: #131d38; border: 1px solid #1f2f59; border-radius: 10px; padding: 14px; text-align: center; }
    .metric-val { font-size: 18px; font-weight: 800; color: #f8fafc; font-family: monospace; }
    .metric-lbl { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 4px; }
    .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #94a3b8; }
    .alpha-card { background: rgba(16, 185, 129, 0.05); border-left: 3px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 0 10px 10px 0; }
    .cta-btn { display: inline-block; background: #10b981; color: #022c22 !important; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 28px; border-radius: 8px; }
    .footer { border-top: 1px solid #1a2542; padding: 24px; text-align: center; font-size: 11px; color: #475569; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 class="header-title">⚡ CRYPTO ALPHA BRIEFING</h2>
    </div>
    <div class="content">
      <p style="color: #f1f5f9; font-size: 15px; font-weight: 600;">Dear {{firstName}},</p>
      <p>Institutional accumulation reached a 6-month high over the past 72 hours. Here is the distilled summary of key on-chain indicators:</p>
      
      <div class="metrics-grid">
        <div class="metric-col">
          <div class="metric-val" style="color: #34d399;">58.4%</div>
          <div class="metric-lbl">BTC Dominance</div>
        </div>
        <div class="metric-col">
          <div class="metric-val" style="color: #38bdf8;">+$1.84B</div>
          <div class="metric-lbl">Net ETF Inflow</div>
        </div>
        <div class="metric-col">
          <div class="metric-val" style="color: #a78bfa;">74 / 100</div>
          <div class="metric-lbl">Greed Index</div>
        </div>
      </div>

      <div class="alpha-card">
        <strong style="color: #34d399;">Key Tactical Takeaway:</strong>
        <p style="margin: 6px 0 0; color: #cbd5e1;">Exchange reserves across top platforms have dropped by 18,200 BTC, signaling long-term self-custody movement.</p>
      </div>

      <p>For the complete analytical breakdown with on-chain charts, access your member dashboard below:</p>
      <div style="text-align: center; margin: 28px 0 8px;">
        <a href="https://example.com/reports" class="cta-btn">ACCESS FULL ALPHA REPORT &rarr;</a>
      </div>
    </div>
    <div class="footer">
      Disclaimers: Informational only. Not financial advice. Sent to {{email}}.
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'executive_letter',
    name: 'Executive Direct Outreach & Letter',
    badge: 'HIGH CONVERSION',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    category: 'outreach',
    description: 'Personalized, distraction-free direct letter style crafted for B2B founders and decision makers.',
    subjectDefault: 'Quick question regarding your growth at {{company}}',
    previewSnippet: 'I came across your work at {{company}} and wanted to reach out directly with an observation...',
    textContent: `Hi {{firstName}},

I hope you're having a productive week.

I noticed your recent developments at {{company}} and wanted to send a quick note. We recently helped a team in your sector reduce pipeline delivery friction by 40%.

Would you be open to a 10-minute chat this Thursday to see how this could look for {{company}}?

Best regards,
Fahad Alvi
Founder, Alvi Global Enterprise`,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, 'Times New Roman', Times, serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-size: 16px; line-height: 1.7; }
    p { margin: 0 0 20px; }
    .signature { margin-top: 36px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #475569; }
    .btn { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <p>Hi {{firstName}},</p>
    <p>I hope you're having a strong week.</p>
    <p>I've been following your recent moves in the industry and wanted to reach out directly. Over the last quarter, we assisted several organizations in optimizing customer communication pipelines, resulting in a 38% bump in active engagement.</p>
    <p>Given your focus at {{company}}, I believe a few of these specific strategies could unlock noticeable returns for your team.</p>
    <p>Would you have 10 minutes open later this week for a brief conversation?</p>
    <p><a href="https://calendly.com" class="btn">View Open Times &rarr;</a></p>
    
    <div class="signature">
      <strong>Fahad Alvi</strong><br>
      Founder &amp; Principal Director<br>
      <span style="color: #64748b;">Alvi Global Enterprise</span>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'promo_vip',
    name: 'VIP Limited-Time Discount & Exclusive Voucher',
    badge: 'VIP OFFER',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    category: 'promotional',
    description: 'High-urgency promotional email template with discount voucher card and bold glow styling.',
    subjectDefault: '⚡ Exclusive 40% Off VIP Pass — 48 Hours Only!',
    previewSnippet: 'As one of our priority subscribers, we are granting you immediate access to our VIP pricing...',
    textContent: `Hi {{firstName}},

You've been selected for our VIP Private Access!

Use code: VIP40 at checkout to claim 40% off your entire order.
Offer expires in 48 hours.

Claim your discount now: https://example.com/claim

Cheers,
The VIP Concierge Team`,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0d17; margin: 0; padding: 24px; color: #f8fafc; }
    .container { max-width: 580px; margin: 0 auto; background: #121626; border: 1px solid #232b45; border-radius: 20px; overflow: hidden; text-align: center; }
    .banner { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 32px 24px; }
    .banner h1 { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .pill { display: inline-block; background: rgba(0,0,0,0.3); color: #fef3c7; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 9999px; margin-bottom: 12px; letter-spacing: 1px; }
    .content { padding: 36px 32px; font-size: 15px; line-height: 1.6; color: #cbd5e1; }
    .voucher-card { background: #1a2138; border: 2px dashed #f59e0b; border-radius: 14px; padding: 24px; margin: 28px auto; max-width: 360px; }
    .voucher-code { font-size: 28px; font-weight: 900; color: #fbbf24; letter-spacing: 4px; font-family: monospace; }
    .voucher-sub { font-size: 12px; color: #94a3b8; margin-top: 6px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 15px; padding: 15px 36px; border-radius: 12px; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4); }
    .timer-badge { display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; font-size: 12px; font-weight: 700; padding: 6px 16px; border-radius: 8px; margin-bottom: 24px; }
    .footer { border-top: 1px solid #232b45; padding: 24px; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">
      <div class="pill">PRIORITY ACCESS</div>
      <h1>YOUR 40% VIP PASS</h1>
    </div>
    <div class="content">
      <div class="timer-badge">⏳ Strictly Valid for the Next 48 Hours</div>
      <p style="font-size: 17px; color: #ffffff; font-weight: 600; margin-bottom: 8px;">Exclusive Offer for {{firstName}}</p>
      <p>As one of our top community members, we are granting you immediate access to our VIP pricing tier before it closes.</p>
      
      <div class="voucher-card">
        <div class="voucher-code">VIP40</div>
        <div class="voucher-sub">Apply voucher code at checkout to unlock 40% discount</div>
      </div>

      <div style="margin: 32px 0 16px;">
        <a href="https://example.com/checkout?code=VIP40" class="cta-btn">REDEEM YOUR VOUCHER NOW &rarr;</a>
      </div>
    </div>
    <div class="footer">
      Sent to {{email}} · Terms apply · <a href="#" style="color: #94a3b8;">Manage preferences</a>
    </div>
  </div>
</body>
</html>`
  }
];

export default EMAIL_TEMPLATES;
