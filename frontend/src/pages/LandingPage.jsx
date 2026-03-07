import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── Inline styles as JS objects ──────────────────────────────────────────────
const GOLD = "#FFC107";
const GOLD_LIGHT = "#FFD54F";
const DARK = "#111111";
const DARKEST = "#0d0d0d";
const CARD = "#1e1e1e";
const MUTED = "#888888";
const DIM = "#444444";
const GREEN = "#4CAF50";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: ${DARK}; color: #fff; overflow-x: hidden; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.45; transform: scale(1.5); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }

  .fade-up-1 { animation: fadeUp .55s ease .05s both; }
  .fade-up-2 { animation: fadeUp .55s ease .15s both; }
  .fade-up-3 { animation: fadeUp .55s ease .25s both; }
  .fade-up-4 { animation: fadeUp .55s ease .35s both; }
  .fade-up-5 { animation: fadeUp .55s ease .45s both; }

  .reveal { opacity: 0; transform: translateY(30px); transition: opacity .65s ease, transform .65s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-d1 { transition-delay: .1s; }
  .reveal-d2 { transition-delay: .2s; }
  .reveal-d3 { transition-delay: .3s; }
  .reveal-d4 { transition-delay: .4s; }
  .reveal-d5 { transition-delay: .5s; }

  /* nav */
  .nav-link { color: ${MUTED}; text-decoration: none; font-size: .9rem; font-weight: 500; transition: color .2s; cursor: pointer; }
  .nav-link:hover { color: #fff; }

  /* buttons */
  .btn-gold { background: ${GOLD}; color: #111; font-weight: 700; border: none; cursor: pointer; transition: background .2s, transform .2s, box-shadow .2s; }
  .btn-gold:hover { background: ${GOLD_LIGHT}; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,193,7,.35); }
  .btn-outline-gold { background: transparent; color: ${GOLD}; border: 1px solid rgba(255,193,7,.4); font-weight: 600; cursor: pointer; transition: background .2s, border-color .2s; }
  .btn-outline-gold:hover { background: rgba(255,193,7,.08); border-color: ${GOLD}; }
  .btn-ghost { background: rgba(255,255,255,.04); color: #fff; border: 1px solid rgba(255,255,255,.12); font-weight: 600; cursor: pointer; transition: background .2s, border-color .2s; }
  .btn-ghost:hover { background: rgba(255,255,255,.09); border-color: rgba(255,255,255,.22); }

  /* feature card */
  .feature-card { background: ${CARD}; border: 1px solid rgba(255,193,7,.12); border-radius: 16px; padding: 34px 30px; transition: border-color .3s, transform .3s, box-shadow .3s; position: relative; overflow: hidden; }
  .feature-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top left, rgba(255,193,7,.06) 0%, transparent 60%); opacity: 0; transition: opacity .3s; }
  .feature-card:hover { border-color: rgba(255,193,7,.35); transform: translateY(-5px); box-shadow: 0 22px 44px rgba(0,0,0,.45); }
  .feature-card:hover::before { opacity: 1; }
  .feature-card.featured { background: linear-gradient(135deg, rgba(255,193,7,.1) 0%, rgba(255,193,7,.03) 100%); border-color: rgba(255,193,7,.28); }

  /* testi card */
  .testi-card { background: ${CARD}; border: 1px solid rgba(255,193,7,.12); border-radius: 16px; transition: border-color .3s, transform .3s; }
  .testi-card:hover { border-color: rgba(255,193,7,.32); transform: translateY(-4px); }

  /* mock table */
  .mock-table { border-radius: 10px; padding: 12px; text-align: center; border: 2px solid transparent; font-size: .75rem; transition: border-color .2s; }
  .mock-table.occupied { background: rgba(255,193,7,.06); border-color: rgba(255,193,7,.3); }
  .mock-table.available { background: rgba(76,175,80,.05); border-color: rgba(76,175,80,.22); }
  .mock-table.reserved { background: rgba(244,67,54,.05); border-color: rgba(244,67,54,.2); }

  /* footer links */
  .footer-link { color: ${MUTED}; text-decoration: none; font-size: .88rem; transition: color .2s; display: block; margin-bottom: 10px; cursor: pointer; }
  .footer-link:hover { color: ${GOLD}; }

  /* scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${DARKEST}; }
  ::-webkit-scrollbar-thumb { background: rgba(255,193,7,.3); border-radius: 3px; }
`;

// ── useReveal hook ────────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Navbar({ scrolled }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const navBg = scrolled
    ? "rgba(10,10,10,.98)"
    : "rgba(17,17,17,.9)";
  
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleScrollTo = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 60px",
      background: navBg,
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,193,7,.1)",
      transition: "background .3s, box-shadow .3s",
      boxShadow: scrolled ? "0 2px 30px rgba(0,0,0,.5)" : "none",
    }}>
      {/* Logo - click to go to home */}
      <div onClick={() => handleNavigation("/")} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", cursor: "pointer" }}>
        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          border: `2px solid ${GOLD}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, background: DARKEST,
        }}>🍴</div>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.65rem", fontWeight: 900, color: "#fff",
        }}>Dine<span style={{ color: GOLD }}>Flow</span></span>
      </div>

      {/* Desktop links */}
      <ul style={{ display: "flex", gap: 32, listStyle: "none" }}>
        {["Features","Preview","Reviews"].map((item) => (
          <li key={item}>
            <div onClick={() => handleScrollTo(item.toLowerCase())} className="nav-link">{item}</div>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div style={{ display: "flex", gap: 12 }}>
        <div 
          onClick={() => handleNavigation("/auth")} 
          className="btn-outline-gold" 
          style={{ padding: "9px 22px", borderRadius: 8, fontSize: ".88rem", textDecoration: "none", cursor: "pointer" }}
        >
          Sign In
        </div>
        <div 
          onClick={() => handleNavigation("/auth")} 
          className="btn-gold" 
          style={{ padding: "9px 22px", borderRadius: 8, fontSize: ".88rem", textDecoration: "none", cursor: "pointer" }}
        >
          Get Started Free
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section style={{
      minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr",
    }}>
      {/* Left — restaurant photo */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `
            linear-gradient(to right, rgba(17,17,17,0) 55%, rgba(17,17,17,.98) 100%),
            linear-gradient(to top,   rgba(17,17,17,.85) 0%, rgba(17,17,17,.1) 50%),
            url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80') center/cover no-repeat
          `,
        }} />
        {/* Quote */}
        <div style={{
          position: "absolute", bottom: 60, left: 50, right: 40, zIndex: 2,
        }}>
          <p style={{
            fontStyle: "italic", fontSize: "1.05rem", lineHeight: 1.75,
            color: "rgba(255,255,255,.88)", marginBottom: 14, maxWidth: 420,
          }}>
            "Serve customers the best food with prompt and friendly service in a welcoming atmosphere, and they'll keep coming back."
          </p>
          <p style={{ color: GOLD, fontSize: ".9rem", fontWeight: 600 }}>— Team DineFlow</p>
        </div>
      </div>

      {/* Right — CTA */}
      <div style={{
        background: DARKEST,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "120px 56px 80px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Glow */}
        <div style={{
          position: "absolute", top: -200, right: -200,
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,193,7,.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <h1 className="fade-up-2" style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(2.4rem, 3.5vw, 3.5rem)",
          fontWeight: 900, lineHeight: 1.15,
          textAlign: "center", marginBottom: 20,
        }}>
          The Smarter Way<br />to Run Your{" "}
          <span style={{ color: GOLD }}>Restaurant</span>
        </h1>

        <p className="fade-up-3" style={{
          fontSize: "1rem", lineHeight: 1.7, color: MUTED,
          textAlign: "center", maxWidth: 370, marginBottom: 40,
        }}>
          DineFlow is a powerful all-in-one POS system built for modern restaurants — manage orders, tables, staff, and analytics from one seamless platform.
        </p>

        <div className="fade-up-4" style={{ marginBottom: 52 }}>
          <div 
            onClick={() => navigate("/auth")} 
            className="btn-gold" 
            style={{ padding: "13px 42px", borderRadius: 10, fontSize: ".95rem", textDecoration: "none", cursor: "pointer", display: "inline-block" }}
          >
            Get Started
          </div>
        </div>

        {/* Stats */}
        <div className="fade-up-5" style={{
          display: "flex", gap: 36,
          borderTop: "1px solid rgba(255,255,255,.07)",
          paddingTop: 36,
        }}>
          {[
            { num: "5,000+", label: "Restaurants" },
            { num: "2.4M+",  label: "Orders Processed" },
            { num: "99.9%",  label: "Uptime SLA" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700, color: GOLD, display: "block" }}>
                {s.num}
              </span>
              <span style={{ fontSize: ".8rem", color: MUTED }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Strip() {
  const items = [
    { icon: "⚡", label: "Real-time Orders" },
    { icon: "🍽", label: "Table Management" },
    { icon: "📊", label: "Live Analytics" },
    { icon: "👥", label: "Staff Controls" },
    { icon: "💳", label: "Multi-Payment" },
    { icon: "📱", label: "Any Device" },
    { icon: "🔒", label: "Enterprise Security" },
  ];

  return (
    <div style={{
      background: "rgba(255,193,7,.03)",
      borderTop: "1px solid rgba(255,193,7,.1)",
      borderBottom: "1px solid rgba(255,193,7,.1)",
      padding: "12px 20px",
      overflow: "hidden",
      width: "100%",
    }}>
      {/* Desktop View - Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "8px",
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        {items.map((item) => (
          <div key={item.label} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontSize: ".8rem",
            fontWeight: 500,
            color: MUTED,
            whiteSpace: "nowrap",
            padding: "4px",
          }}>
            <span style={{ color: GOLD, fontSize: "1rem" }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Mobile View - Scrolling Marquee */}
      <div style={{
        display: "none",
      }} className="mobile-strip">
        <div style={{
          display: "flex",
          gap: "24px",
          animation: "scroll 25s linear infinite",
          width: "fit-content",
        }}>
          {[...items, ...items].map((item, index) => (
            <div key={`${item.label}-${index}`} style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: ".8rem",
              fontWeight: 500,
              color: MUTED,
              whiteSpace: "nowrap",
            }}>
              <span style={{ color: GOLD, fontSize: "1rem" }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-strip {
            display: block !important;
            position: relative;
            overflow: hidden;
          }
          .mobile-strip > div {
            display: flex !important;
          }
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        }
      `}</style>
    </div>
  );
}

const FEATURES = [
  { icon: "🍽", title: "Smart Table Management", desc: "Visual floor plan with real-time table status — occupied, available, or reserved. Drag-and-drop assignment for seamless service flow.", featured: true },
  { icon: "⚡", title: "Lightning-Fast Orders", desc: "Take, modify, and send orders to the kitchen in seconds. Built-in modifier support, special instructions, and split-bill functionality." },
  { icon: "📊", title: "Live Analytics & Reports", desc: "Track revenue, top-selling items, peak hours, and staff performance in real-time. Export custom reports in one click." },
  { icon: "👥", title: "Staff & Role Control", desc: "Set granular permissions per role — admin, manager, cashier, or waiter. Track attendance, shifts, and performance metrics." },
  { icon: "📋", title: "Dynamic Menu Management", desc: "Update your menu instantly across all devices. Add categories, variants, pricing, images, and availability schedules." },
  { icon: "💳", title: "Flexible Payments", desc: "Accept cash, card, UPI, and digital wallets. Split bills by seat or item. Built-in tax, tips, and discount support." },
];

function FeaturesSection() {
  return (
    <section id="features" style={{ padding: "100px 60px", background: DARKEST }}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, letterSpacing: 2, color: GOLD, textTransform: "uppercase", marginBottom: 14 }}>Core Features</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,3.5vw,2.8rem)", fontWeight: 900, marginBottom: 16 }}>
          Everything You Need to Run<br />a Flawless Restaurant
        </h2>
        <p style={{ color: MUTED, fontSize: "1rem", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
          From table management to real-time analytics — DineFlow covers every aspect of your restaurant operations.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 1200, margin: "0 auto" }}>
        {FEATURES.map((f, i) => (
          <div key={f.title} className={`feature-card${f.featured ? " featured" : ""} reveal reveal-d${(i % 3) + 1}`}>
            <div style={{
              width: 52, height: 52, background: "rgba(255,193,7,.1)", border: "1px solid rgba(255,193,7,.2)",
              borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem", marginBottom: 22,
            }}>{f.icon}</div>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 10 }}>{f.title}</div>
            <p style={{ fontSize: ".9rem", color: MUTED, lineHeight: 1.65 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MockTopbar({ title, status, statusColor }) {
  return (
    <div style={{
      background: "#1a1a1a", borderBottom: "1px solid rgba(255,255,255,.06)",
      padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", gap: 6 }}>
        {["#FF5F57","#FFBD2E","#28CA41"].map((c) => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{ fontSize: ".8rem", color: MUTED, fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: ".75rem", color: statusColor }}>● {status}</div>
    </div>
  );
}

function TablePreview() {
  const tables = [
    { id: "T1", type: "occupied" }, { id: "T2", type: "available" },
    { id: "T3", type: "occupied" }, { id: "T4", type: "reserved" },
    { id: "T5", type: "available" }, { id: "T6", type: "occupied" },
    { id: "T7", type: "occupied" }, { id: "T8", type: "available" },
  ];
  const statusColor = { occupied: GOLD, available: GREEN, reserved: "#F44336" };
  const statusLabel = { occupied: "Occupied", available: "Available", reserved: "Reserved" };
  const statsBg = { occupied: "rgba(255,193,7,.12)", available: "rgba(76,175,80,.1)", reserved: "rgba(244,67,54,.1)" };

  return (
    <div style={{ background: CARD, border: "1px solid rgba(255,193,7,.15)", borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
      <MockTopbar title="DineFlow — Table Management" status="Live" statusColor={GOLD} />
      <div style={{ padding: 24 }}>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Total Tables", val: "24", color: "#fff" },
            { label: "Occupied", val: "14", color: GOLD },
            { label: "Available", val: "8",  color: GREEN },
            { label: "Reserved",  val: "2",  color: "#F44336" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: ".68rem", color: MUTED, marginBottom: 5 }}>{s.label}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
        {/* Table grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {tables.map((t) => (
            <div key={t.id} className={`mock-table ${t.type}`}>
              <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>{t.id}</div>
              <div style={{ fontSize: ".62rem", padding: "2px 6px", borderRadius: 100, display: "inline-block", background: statsBg[t.type], color: statusColor[t.type] }}>
                {statusLabel[t.type]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderPreview() {
  const items = [
    { name: "Grilled Chicken Pasta", sub: "Qty: 1 · Extra cheese", price: "₹499" },
    { name: "Margherita Pizza (L)",   sub: "Qty: 2 · Thin crust",   price: "₹798" },
    { name: "Mango Lassi",            sub: "Qty: 2",                 price: "₹198" },
  ];
  return (
    <div style={{ background: CARD, border: "1px solid rgba(255,193,7,.15)", borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
      <MockTopbar title="Order — Table 6" status="Active" statusColor={GREEN} />
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: ".9rem", fontWeight: 600 }}>Current Order</span>
          <span style={{ background: "rgba(255,193,7,.15)", color: GOLD, fontSize: ".7rem", fontWeight: 600, padding: "4px 12px", borderRadius: 100 }}>3 Items</span>
        </div>
        {items.map((item) => (
          <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
            <div>
              <div style={{ fontSize: ".82rem", color: "#ddd" }}>{item.name}</div>
              <div style={{ fontSize: ".72rem", color: MUTED, marginTop: 2 }}>{item.sub}</div>
            </div>
            <div style={{ color: GOLD, fontWeight: 600, fontSize: ".82rem" }}>{item.price}</div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem", color: MUTED, padding: "10px 0 4px" }}>
          <span>Subtotal</span><span>₹1,495</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem", color: MUTED, padding: "4px 0 10px" }}>
          <span>GST (5%)</span><span>₹74.75</span>
        </div>
        <div style={{ background: GOLD, color: "#111", padding: 12, borderRadius: 8, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: ".9rem" }}>
          <span>Total</span><span>₹1,569.75</span>
        </div>
      </div>
    </div>
  );
}

function PreviewSection() {
  return (
    <section id="preview" style={{ padding: "100px 60px", background: DARK }}>
      {/* Table management */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 80, alignItems: "center", maxWidth: 1200, margin: "0 auto 100px" }}>
        <div>
          <div className="reveal" style={{ fontSize: ".78rem", fontWeight: 700, letterSpacing: 2, color: GOLD, textTransform: "uppercase", marginBottom: 14 }}>Table Management</div>
          <h2 className="reveal" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            See Every Table<br />at a Glance
          </h2>
          <p className="reveal" style={{ fontSize: "1rem", color: MUTED, lineHeight: 1.7, maxWidth: 380, marginBottom: 28 }}>
            Your floor plan comes alive — instantly see which tables are occupied, available, or reserved. Assign servers, track cover counts, and handle walk-ins effortlessly.
          </p>
          {["Visual real-time floor plan", "One-tap table status updates", "Reservation calendar & walk-in queue"].map((item) => (
            <div key={item} className="reveal" style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12, fontSize: ".9rem", color: "#ccc" }}>
              <span style={{ color: GOLD, fontWeight: 700, flexShrink: 0 }}>✓</span> {item}
            </div>
          ))}
        </div>
        <div className="reveal reveal-d2"><TablePreview /></div>
      </div>

      {/* Order management */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 80, alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
        <div className="reveal reveal-d2"><OrderPreview /></div>
        <div>
          <div className="reveal" style={{ fontSize: ".78rem", fontWeight: 700, letterSpacing: 2, color: GOLD, textTransform: "uppercase", marginBottom: 14 }}>Order Management</div>
          <h2 className="reveal" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
            From Order to Kitchen<br />in Seconds
          </h2>
          <p className="reveal" style={{ fontSize: "1rem", color: MUTED, lineHeight: 1.7, maxWidth: 380, marginBottom: 28 }}>
            Build orders with ease using our intuitive interface. Add items, apply modifiers, handle special requests, and send directly to the kitchen — all from one screen.
          </p>
          {["Instant kitchen display sync", "Item modifiers & special instructions", "Split bill by item or seat"].map((item) => (
            <div key={item} className="reveal" style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12, fontSize: ".9rem", color: "#ccc" }}>
              <span style={{ color: GOLD, fontWeight: 700, flexShrink: 0 }}>✓</span> {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: "1", title: "Create Account",    desc: "Sign up in 60 seconds. No credit card required for the 14-day free trial." },
    { num: "2", title: "Set Up Your Menu",  desc: "Add categories, items, modifiers, and pricing. Import from a spreadsheet or build from scratch." },
    { num: "3", title: "Configure Tables",  desc: "Map your floor plan, add tables, and assign sections to your serving staff.", active: true },
    { num: "4", title: "Start Serving",     desc: "You're live. Take orders, process payments, and watch real-time analytics roll in." },
  ];
  return (
    <section style={{ padding: "100px 60px", background: DARKEST, textAlign: "center" }}>
      <div className="reveal" style={{ marginBottom: 64 }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, letterSpacing: 2, color: GOLD, textTransform: "uppercase", marginBottom: 14 }}>Process</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,3.5vw,2.8rem)", fontWeight: 900, marginBottom: 16 }}>Up & Running in Minutes</h2>
        <p style={{ color: MUTED, fontSize: "1rem", lineHeight: 1.7, maxWidth: 460, margin: "0 auto" }}>
          No complex setup. No hardware dependency. DineFlow is ready the moment you sign up.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", maxWidth: 1000, margin: "0 auto", position: "relative" }}>
        {/* Connector line */}
        <div style={{ position: "absolute", top: 35, left: "12.5%", right: "12.5%", height: 1, background: "linear-gradient(to right, transparent, rgba(255,193,7,.25) 30%, rgba(255,193,7,.25) 70%, transparent)" }} />
        {steps.map((s, i) => (
          <div key={s.num} className={`reveal reveal-d${i + 1}`} style={{ padding: "0 20px", position: "relative", zIndex: 1 }}>
            <div style={{
              width: 70, height: 70, borderRadius: "50%",
              background: s.active ? GOLD : CARD,
              border: s.active ? `2px solid ${GOLD}` : "2px solid rgba(255,193,7,.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 900,
              color: s.active ? "#111" : GOLD,
              boxShadow: s.active ? "0 0 0 8px rgba(255,193,7,.12)" : "none",
            }}>{s.num}</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
            <p style={{ fontSize: ".85rem", color: MUTED, lineHeight: 1.6 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  { initial: "R", name: "Rahul Mehta",  role: "Owner, The Spice Garden · Mumbai",  quote: '"DineFlow transformed how we run our restaurant. Table management is so intuitive — our staff got comfortable in under an hour. Orders are faster, mistakes are fewer."' },
  { initial: "P", name: "Priya Nair",   role: "Manager, Coastal Kitchen · Kochi",   quote: '"The analytics alone are worth it. I can see which dishes are selling, which staff are performing, and where we can cut costs — all in real time. Game changer."' },
  { initial: "A", name: "Arjun Sharma", role: "CEO, Dhaba 360 · Delhi NCR",          quote: '"We run 3 branches and DineFlow manages all from one dashboard. Setup took less than a day. Support team is incredibly responsive. Highly recommended."' },
];

function TestimonialsSection() {
  return (
    <section id="reviews" style={{ padding: "100px 60px", background: DARKEST }}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ fontSize: ".78rem", fontWeight: 700, letterSpacing: 2, color: GOLD, textTransform: "uppercase", marginBottom: 14 }}>Testimonials</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,3.5vw,2.8rem)", fontWeight: 900, marginBottom: 16 }}>Loved by Restaurant Owners</h2>
        <p style={{ color: MUTED, fontSize: "1rem", lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>Thousands of restaurants trust DineFlow to run their daily operations smoothly.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
        {TESTIMONIALS.map((t, i) => (
          <div key={t.name} className={`testi-card reveal reveal-d${i + 1}`} style={{ padding: 32 }}>
            <div style={{ color: GOLD, fontSize: ".9rem", letterSpacing: 2, marginBottom: 16 }}>★★★★★</div>
            <p style={{ fontSize: ".92rem", lineHeight: 1.75, color: "#ccc", marginBottom: 24, fontStyle: "italic" }}>{t.quote}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "rgba(255,193,7,.12)", border: "1px solid rgba(255,193,7,.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: GOLD,
              }}>{t.initial}</div>
              <div>
                <div style={{ fontSize: ".9rem", fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: ".78rem", color: MUTED }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  const navigate = useNavigate();
  const cols = [
    { title: "Product",  links: ["Features","Changelog","Roadmap"] },
    { title: "Company",  links: ["About Us","Blog","Careers","Contact"] },
    { title: "Support",  links: ["Help Center","API Docs","Status","Community"] },
  ];

  const handleFooterClick = (section) => {
    if (section === "Features") {
      const element = document.getElementById(section.toLowerCase());
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else if (section === "Contact") {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } else {
      navigate("/");
    }
  };

  return (
    <footer style={{ background: DARKEST, borderTop: "1px solid rgba(255,255,255,.05)", padding: "60px 60px 36px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
        <div>
          <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, background: DARKEST }}>🍴</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 900, color: "#fff" }}>Dine<span style={{ color: GOLD }}>Flow</span></span>
          </div>
          <p style={{ fontSize: ".88rem", color: MUTED, lineHeight: 1.65, maxWidth: 280 }}>
            The all-in-one POS system for modern restaurants. Streamline orders, manage tables, and grow your business with powerful insights.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <div style={{ fontSize: ".82rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>{col.title}</div>
            {col.links.map((link) => (
              <div key={link} onClick={() => handleFooterClick(link)} className="footer-link">{link}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,.05)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: ".83rem", color: DIM }}>© 2025 DineFlow. All rights reserved.</div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy Policy","Terms of Service","Cookie Policy"].map((l) => (
            <div key={l} onClick={() => navigate("/")} style={{ fontSize: ".83rem", color: DIM, textDecoration: "none", transition: "color .2s", cursor: "pointer" }}
              onMouseEnter={(e) => e.target.style.color = MUTED}
              onMouseLeave={(e) => e.target.style.color = DIM}
            >{l}</div>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DineFlowLanding() {
  const [scrolled, setScrolled] = useState(false);
  useReveal();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <style>{css}</style>
      <Navbar scrolled={scrolled} />
      <HeroSection />
      <Strip />
      <FeaturesSection />
      <PreviewSection />
      <HowItWorks />
      <TestimonialsSection />
      <Footer />
    </>
  );
}