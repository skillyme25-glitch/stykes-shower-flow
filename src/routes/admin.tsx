import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Lock, Loader2, Search, RefreshCw, LogOut, Package, Users, ListChecks, BarChart3, Check, UserCheck, Wrench, MessageCircle, ShieldCheck, X, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { SLOT_LABELS, formatKES } from "@/lib/kenya";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Stykes Aquasmart" }] }),
  component: AdminPage,
});

const ADMIN_PASSWORD = "stykes2026";
const STORAGE = "stykes_admin_ok";

type Order = any;
type Product = { id: string; name: string; price_kes: number; stock_count: number; is_available: boolean; image_url: string };
type Tech = { id: string; name: string; phone: string; is_available: boolean };

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  useEffect(() => { if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE) === "1") setAuthed(true); }, []);
  if (!authed) return <Login onSubmit={(v) => {
    if (v === ADMIN_PASSWORD) { sessionStorage.setItem(STORAGE, "1"); setAuthed(true); toast.success("Welcome back"); }
    else toast.error("Wrong password");
  }} pwd={pwd} setPwd={setPwd} />;
  return <Dashboard onLogout={() => { sessionStorage.removeItem(STORAGE); setAuthed(false); }} />;
}

function Login({ onSubmit, pwd, setPwd }: { onSubmit: (v: string) => void; pwd: string; setPwd: (v: string) => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-hero p-6">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(pwd); }} className="glass w-full max-w-sm rounded-3xl p-8 shadow-elegant">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <h1 className="text-center font-display text-2xl font-bold">Admin Access</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Enter the staff password</p>
        <div className="relative mt-6">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="password" autoFocus value={pwd} onChange={(e) => setPwd(e.target.value)}
            className="w-full rounded-xl border bg-card py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan focus:ring-4 focus:ring-cyan/15" placeholder="Password" />
        </div>
        <button type="submit" className="mt-5 w-full rounded-full bg-cyan-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow">Sign In</button>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"orders" | "verify" | "stock" | "techs" | "summary">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [techs, setTechs] = useState<Tech[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const [{ data: o }, { data: p }, { data: t }] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("name"),
      supabase.from("technicians").select("*").order("name"),
    ]);
    setOrders(o ?? []); setProducts((p ?? []) as Product[]); setTechs((t ?? []) as Tech[]); setLoading(false);
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    const ch = supabase.channel("admin-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
      refresh(); toast.info("Orders updated");
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const verifyCount = orders.filter((o) => Array.isArray(o.bathroom_photos) && o.bathroom_photos.length > 0 && o.verification_status === "pending").length;

  const tabs = [
    { k: "orders" as const, l: "Orders", icon: ListChecks, badge: 0 },
    { k: "verify" as const, l: "Verification Queue", icon: ShieldCheck, badge: verifyCount },
    { k: "stock" as const, l: "Stock / Catalogue", icon: Package, badge: 0 },
    { k: "techs" as const, l: "Technicians", icon: Users, badge: 0 },
    { k: "summary" as const, l: "Summary", icon: BarChart3, badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="glass sticky top-0 z-30 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4"><Logo /><span className="hidden rounded-full bg-cyan-gradient px-3 py-0.5 text-xs font-semibold text-white sm:inline">Admin</span></div>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-muted"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
            <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-muted"><LogOut className="h-3.5 w-3.5" /> Logout</button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 pb-2">
          {tabs.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${tab === t.k ? "bg-cyan-gradient text-white shadow-glow" : "text-muted-foreground hover:bg-muted"}`}>
              <t.icon className="h-4 w-4" /> {t.l}
              {t.badge > 0 && (
                <span className="inline-grid h-5 min-w-5 place-items-center rounded-full bg-[oklch(0.62_0.22_25)] px-1 text-[10px] font-bold text-white">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {tab === "orders" && <OrdersTab orders={orders} techs={techs} products={products} refresh={refresh} />}
        {tab === "verify" && <VerificationTab orders={orders} refresh={refresh} />}
        {tab === "stock" && <StockTab products={products} refresh={refresh} />}
        {tab === "techs" && <TechsTab techs={techs} orders={orders} refresh={refresh} />}
        {tab === "summary" && <SummaryTab orders={orders} />}
      </main>
    </div>
  );
}

function OrdersTab({ orders, techs, products, refresh }: { orders: Order[]; techs: Tech[]; products: Product[]; refresh: () => void }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const filtered = useMemo(() => orders.filter((o) => {
    const matchQ = !q || o.customer_name.toLowerCase().includes(q.toLowerCase()) || o.order_code.toLowerCase().includes(q.toLowerCase());
    const matchS = status === "all" || o.status === status;
    return matchQ && matchS;
  }), [orders, q, status]);

  async function confirmOrder(o: Order) {
    const product = products.find((p) => p.id === o.product_id);
    if (product && product.stock_count < o.quantity) return toast.error("Not enough stock");
    const { error } = await supabase.from("orders").update({ status: "confirmed" }).eq("id", o.id);
    if (error) return toast.error(error.message);
    if (product) await supabase.from("products").update({ stock_count: product.stock_count - o.quantity }).eq("id", product.id);
    toast.success(`Order ${o.order_code} confirmed`);
    refresh();
  }

  async function assignTech(o: Order, techId: string) {
    const tech = techs.find((t) => t.id === techId);
    if (!tech) return;
    const { error } = await supabase.from("orders").update({ status: "assigned", technician_id: tech.id, technician_name: tech.name }).eq("id", o.id);
    if (error) return toast.error(error.message);
    toast.success(`Assigned to ${tech.name}`);
    refresh();
  }

  async function complete(o: Order) {
    const { error } = await supabase.from("orders").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", o.id);
    if (error) return toast.error(error.message);
    const { data: code } = await supabase.rpc("generate_receipt_code");
    await supabase.from("receipts").insert({ receipt_code: code as unknown as string, order_id: o.id, kind: "completion", payload: { order: o } });
    toast.success("Marked complete & certificate generated");
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or order ID…" className="w-full rounded-xl border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-cyan" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border bg-card px-3 py-2.5 text-sm">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="verification_pending">Verify Photos</option>
          <option value="confirmed">Confirmed</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Order</th><th className="p-3 text-left">Customer</th><th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Location</th><th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Ordered</th><th className="p-3 text-left">Install</th>
                <th className="p-3 text-left">Status</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs font-semibold">{o.order_code}</td>
                  <td className="p-3">{o.customer_name}</td>
                  <td className="p-3"><a href={`https://wa.me/${o.whatsapp.replace("+","")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan hover:underline"><MessageCircle className="h-3 w-3" />{o.whatsapp}</a></td>
                  <td className="p-3 text-xs">{o.county}<br /><span className="text-muted-foreground">{o.address}</span></td>
                  <td className="p-3">{o.product_name} <span className="text-muted-foreground">×{o.quantity}</span><br /><span className="text-xs font-semibold text-gradient-gold">{formatKES(o.total_kes)}</span></td>
                  <td className="p-3 text-xs">{new Date(o.created_at).toLocaleDateString("en-KE")}</td>
                  <td className="p-3 text-xs">{o.installation_date}<br /><span className="text-muted-foreground">{SLOT_LABELS[o.installation_slot]}</span></td>
                  <td className="p-3"><StatusPill status={o.status} /></td>
                  <td className="p-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {o.status === "pending" && <button onClick={() => confirmOrder(o)} className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.95_0.05_240)] px-3 py-1 text-xs font-semibold text-[oklch(0.30_0.12_240)] hover:opacity-90"><Check className="h-3 w-3" />Confirm</button>}
                      {o.status === "confirmed" && (
                        <select onChange={(e) => e.target.value && assignTech(o, e.target.value)} defaultValue="" className="rounded-full border bg-white px-2 py-1 text-xs">
                          <option value="">Assign tech…</option>
                          {techs.filter((t) => t.is_available).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      )}
                      {o.status === "assigned" && <button onClick={() => complete(o)} className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.95_0.06_140)] px-3 py-1 text-xs font-semibold text-[oklch(0.35_0.12_140)] hover:opacity-90"><UserCheck className="h-3 w-3" />Complete</button>}
                      <a href={`/receipt/${o.id}`} target="_blank" className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-muted">Receipt</a>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} className="p-12 text-center text-sm text-muted-foreground">No orders match.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StockCard({ p, onRefresh }: { p: Product; onRefresh: () => void }) {
  const [stockInput, setStockInput] = useState(String(p.stock_count));
  useEffect(() => { setStockInput(String(p.stock_count)); }, [p.stock_count]);

  async function toggle() { await supabase.from("products").update({ is_available: !p.is_available }).eq("id", p.id); toast.success("Updated"); onRefresh(); }
  async function saveStock() {
    const n = Math.max(0, Number(stockInput));
    if (n === p.stock_count) return;
    await supabase.from("products").update({ stock_count: n }).eq("id", p.id);
    onRefresh();
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className="aspect-[4/3] bg-muted"><img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /></div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div><h3 className="font-semibold">{p.name}</h3><div className="text-sm text-gradient-gold font-bold">{formatKES(p.price_kes)}</div></div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.is_available && p.stock_count > 0 ? "bg-[oklch(0.95_0.06_140)] text-[oklch(0.35_0.12_140)]" : "bg-[oklch(0.95_0.04_25)] text-[oklch(0.45_0.18_25)]"}`}>
            {p.is_available && p.stock_count > 0 ? "Available" : "Out of stock"}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Stock</label>
          <input type="number" min={0} value={stockInput}
            onChange={(e) => setStockInput(e.target.value)}
            onBlur={saveStock}
            onKeyDown={(e) => e.key === "Enter" && saveStock()}
            className="w-20 rounded-lg border bg-white px-2 py-1 text-sm" />
          <button onClick={toggle} className="ml-auto rounded-full border px-3 py-1 text-xs font-semibold hover:bg-muted">{p.is_available ? "Mark Out" : "Mark Available"}</button>
        </div>
      </div>
    </div>
  );
}

function StockTab({ products, refresh }: { products: Product[]; refresh: () => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => <StockCard key={p.id} p={p} onRefresh={refresh} />)}
    </div>
  );
}

function TechsTab({ techs, orders, refresh }: { techs: Tech[]; orders: Order[]; refresh: () => void }) {
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  async function add() {
    if (!name || !phone) return toast.error("Name & phone required");
    await supabase.from("technicians").insert({ name, phone }); setName(""); setPhone(""); toast.success("Technician added"); refresh();
  }
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <h3 className="mb-3 font-semibold">Add technician</h3>
        <div className="flex flex-wrap gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="flex-1 min-w-[200px] rounded-xl border bg-white px-3 py-2 text-sm" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254712345678" className="rounded-xl border bg-white px-3 py-2 text-sm" />
          <button onClick={add} className="rounded-full bg-cyan-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow">Add</button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {techs.map((t) => {
          const current = orders.filter((o) => o.technician_id === t.id && o.status === "assigned");
          const past = orders.filter((o) => o.technician_id === t.id && o.status === "completed");
          return (
            <div key={t.id} className="rounded-2xl border bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-gradient text-white shadow-glow"><Wrench className="h-5 w-5" /></div>
                <div><div className="font-semibold">{t.name}</div><div className="text-xs text-muted-foreground">{t.phone}</div></div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg bg-muted p-2"><div className="text-lg font-bold">{current.length}</div><div className="text-muted-foreground">Active</div></div>
                <div className="rounded-lg bg-muted p-2"><div className="text-lg font-bold">{past.length}</div><div className="text-muted-foreground">Completed</div></div>
              </div>
              {current[0] && <div className="mt-3 rounded-lg bg-cyan/10 p-2 text-xs"><strong>Now:</strong> {current[0].order_code} — {current[0].customer_name}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryTab({ orders }: { orders: Order[] }) {
  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0,0,0,0);
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now); startOfMonth.setDate(now.getDate() - 30);
  const today = orders.filter((o) => new Date(o.created_at) >= startOfDay);
  const week = orders.filter((o) => new Date(o.created_at) >= startOfWeek);
  const month = orders.filter((o) => new Date(o.created_at) >= startOfMonth);
  const revenue = orders.filter((o) => o.status === "completed").reduce((s, o) => s + o.total_kes, 0);

  const buckets: Record<string, number> = { pending: 0, verification_pending: 0, confirmed: 0, assigned: 0, completed: 0, cancelled: 0 };
  orders.forEach((o) => { buckets[o.status] = (buckets[o.status] ?? 0) + 1; });
  const total = orders.length || 1;

  const colorMap: Record<string, string> = {
    pending: "oklch(0.80 0.15 78)", verification_pending: "oklch(0.72 0.20 290)",
    confirmed: "oklch(0.62 0.16 230)", assigned: "oklch(0.72 0.18 50)",
    completed: "oklch(0.65 0.16 145)", cancelled: "oklch(0.62 0.22 25)",
  };
  const statusLabels: Record<string, string> = {
    pending: "Pending", verification_pending: "Verify Photos",
    confirmed: "Confirmed", assigned: "Assigned",
    completed: "Completed", cancelled: "Cancelled",
  };
  let acc = 0;
  const segs = Object.entries(buckets).map(([k, v]) => {
    const start = (acc / total) * 100; acc += v; const end = (acc / total) * 100;
    return { k, v, start, end, color: colorMap[k] };
  }).filter((s) => s.v > 0);
  const conicGradient = `conic-gradient(${segs.map((s) => `${s.color} ${s.start}% ${s.end}%`).join(",")})`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Orders Today", v: today.length },
          { l: "This Week", v: week.length },
          { l: "This Month", v: month.length },
          { l: "Revenue (Completed)", v: formatKES(revenue) },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-2 font-display text-3xl font-bold text-gradient-cyan">{s.v}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="mb-5 font-semibold">Orders by status</h3>
          <div className="flex items-center gap-8">
            <div className="relative h-44 w-44 rounded-full" style={{ background: segs.length ? conicGradient : "var(--muted)" }}>
              <div className="absolute inset-4 grid place-items-center rounded-full bg-card text-center"><div><div className="text-2xl font-bold">{orders.length}</div><div className="text-xs text-muted-foreground">total</div></div></div>
            </div>
            <ul className="space-y-2 text-sm">
              {Object.entries(buckets).map(([k, v]) => (
                <li key={k} className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ background: colorMap[k] }} /><span>{statusLabels[k] ?? k}</span><span className="ml-auto font-semibold">{v}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="mb-3 font-semibold">Recent activity</h3>
          <ul className="space-y-2 text-sm">
            {orders.slice(0, 8).map((o) => (
              <li key={o.id} className="flex items-center justify-between border-b py-2 last:border-0">
                <span><span className="font-mono text-xs font-semibold">{o.order_code}</span> · {o.customer_name}</span>
                <StatusPill status={o.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { l: string; cls: string }> = {
    pending:   { l: "Pending",   cls: "bg-[oklch(0.97_0.07_85)] text-[oklch(0.40_0.12_60)]" },
    verification_pending: { l: "Verify Photos", cls: "bg-[oklch(0.93_0.10_290)] text-[oklch(0.35_0.18_290)]" },
    confirmed: { l: "Confirmed", cls: "bg-[oklch(0.95_0.05_240)] text-[oklch(0.30_0.12_240)]" },
    assigned:  { l: "Assigned",  cls: "bg-[oklch(0.95_0.07_50)] text-[oklch(0.40_0.15_40)]" },
    completed: { l: "Completed", cls: "bg-[oklch(0.95_0.06_140)] text-[oklch(0.35_0.12_140)]" },
    cancelled: { l: "Cancelled", cls: "bg-[oklch(0.95_0.04_25)] text-[oklch(0.45_0.18_25)]" },
  };
  const s = map[status] ?? map.pending;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.l}</span>;
}

function VerificationTab({ orders, refresh }: { orders: Order[]; refresh: () => void }) {
  const [selected, setSelected] = useState<Order | null>(null);
  const queue = useMemo(() => orders.filter((o: Order) => {
    const photos = Array.isArray(o.bathroom_photos) ? o.bathroom_photos : [];
    return photos.length > 0 && o.verification_status === "pending";
  }), [orders]);
  const all = useMemo(() => orders.filter((o: Order) => (Array.isArray(o.bathroom_photos) ? o.bathroom_photos.length : 0) > 0), [orders]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Pending review" value={queue.length} accent="cyan" />
        <Stat label="Verified" value={all.filter((o) => o.verification_status === "verified").length} accent="green" />
        <Stat label="Needs clarification" value={all.filter((o) => o.verification_status === "requires_clarification").length} accent="gold" />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <div className="border-b bg-muted/40 px-5 py-3 text-sm font-semibold">Pending verification ({queue.length})</div>
        {queue.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No orders waiting for photo verification.</div>
        ) : (
          <div className="divide-y">
            {queue.map((o) => {
              const photos: string[] = o.bathroom_photos ?? [];
              return (
                <button key={o.id} onClick={() => setSelected(o)} className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-muted/30">
                  <div className="flex -space-x-2">
                    {photos.slice(0, 4).map((u, i) => (
                      <img key={i} src={u} alt="" className="h-14 w-14 rounded-lg border-2 border-white object-cover shadow" />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{o.customer_name} <span className="ml-2 font-mono text-xs text-muted-foreground">{o.order_code}</span></div>
                    <div className="text-xs text-muted-foreground">{o.county} · {o.address} · {o.product_name} ×{o.quantity}</div>
                  </div>
                  <span className="hidden rounded-full bg-cyan-gradient px-3 py-1 text-xs font-semibold text-white sm:inline">Review →</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && <VerifyModal order={selected} onClose={() => setSelected(null)} onDone={() => { setSelected(null); refresh(); }} />}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: "cyan" | "green" | "gold" }) {
  const cls = accent === "cyan" ? "text-gradient-cyan" : accent === "green" ? "text-[oklch(0.55_0.16_145)]" : "text-gradient-gold";
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-3xl font-bold ${cls}`}>{value}</div>
    </div>
  );
}

function VerifyModal({ order, onClose, onDone }: { order: Order; onClose: () => void; onDone: () => void }) {
  const photos: string[] = order.bathroom_photos ?? [];
  const [notes, setNotes] = useState<string>(order.verification_notes ?? "");
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const [clarMsg, setClarMsg] = useState("Hi! We reviewed your bathroom photos and need a few more details:\n\n- ");
  const [showClar, setShowClar] = useState(false);

  async function approve() {
    setBusy(true);
    const { data: product } = await supabase.from("products").select("stock_count").eq("id", order.product_id).single();
    if (product && product.stock_count < order.quantity) {
      setBusy(false);
      return toast.error("Not enough stock to confirm this order");
    }
    const { error } = await supabase.from("orders").update({
      verification_status: "verified",
      verification_notes: notes,
      verified_at: new Date().toISOString(),
      status: "confirmed",
    }).eq("id", order.id);
    if (error) { setBusy(false); return toast.error(error.message); }
    if (product) {
      await supabase.from("products").update({ stock_count: Math.max(0, product.stock_count - order.quantity) }).eq("id", order.product_id);
    }
    setBusy(false);
    toast.success("Verified & confirmed");
    onDone();
  }

  async function requestClar() {
    if (!clarMsg.trim()) return toast.error("Type a message to the customer");
    setBusy(true);
    const { error } = await supabase.from("orders").update({
      verification_status: "requires_clarification",
      verification_notes: clarMsg,
    }).eq("id", order.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    const wa = `https://wa.me/${order.whatsapp.replace("+", "")}?text=${encodeURIComponent(clarMsg)}`;
    window.open(wa, "_blank");
    toast.success("Clarification requested");
    onDone();
  }

  async function reject() {
    if (!notes.trim()) return toast.error("Please add a rejection reason in the notes");
    if (!confirm("Reject this order? This marks it cannot be fulfilled.")) return;
    setBusy(true);
    const { error } = await supabase.from("orders").update({
      verification_status: "rejected",
      verification_notes: notes,
      status: "cancelled",
    }).eq("id", order.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Order rejected & refund flagged");
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b bg-hero p-5 text-white">
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan">Site verification</div>
            <div className="font-display text-xl font-bold">{order.customer_name} · <span className="font-mono text-sm">{order.order_code}</span></div>
            <div className="text-xs text-white/70">{order.county}, {order.address} · {order.product_name} ×{order.quantity}</div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Customer photos ({photos.length})</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((u, i) => (
              <button key={i} onClick={() => setZoom(u)} className="aspect-square overflow-hidden rounded-xl border bg-muted shadow-card transition hover:scale-[1.02]">
                <img src={u} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Internal verification notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5}
                className="w-full rounded-xl border bg-card p-3 text-sm outline-none focus:border-cyan"
                placeholder="Wall condition, inlet compatibility, ceiling height, etc." />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Order details</label>
              <div className="rounded-xl border bg-muted/30 p-3 text-xs">
                <div className="flex justify-between py-1"><span className="text-muted-foreground">WhatsApp</span><span>{order.whatsapp}</span></div>
                <div className="flex justify-between py-1"><span className="text-muted-foreground">Installation</span><span>{order.installation_date} · {SLOT_LABELS[order.installation_slot]}</span></div>
                <div className="flex justify-between py-1"><span className="text-muted-foreground">Total</span><span className="font-semibold">{formatKES(order.total_kes)}</span></div>
              </div>
            </div>
          </div>

          {showClar && (
            <div className="mt-4 rounded-xl border border-cyan/40 bg-cyan/5 p-3">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Message to customer (WhatsApp)</label>
              <textarea value={clarMsg} onChange={(e) => setClarMsg(e.target.value)} rows={4}
                className="w-full rounded-xl border bg-white p-3 text-sm outline-none focus:border-cyan" />
              <p className="mt-1 text-xs text-muted-foreground">Will open WhatsApp with this pre-filled message.</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t bg-muted/30 p-4">
          <button onClick={onClose} className="rounded-full border px-4 py-2 text-sm font-semibold hover:bg-muted">Close</button>
          <button onClick={reject} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.62_0.22_25)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
            <X className="h-4 w-4" /> Reject
          </button>
          {!showClar ? (
            <button onClick={() => setShowClar(true)} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.78_0.15_78)] px-4 py-2 text-sm font-semibold text-[oklch(0.30_0.12_60)] hover:opacity-90 disabled:opacity-60">
              <AlertTriangle className="h-4 w-4" /> Request Clarification
            </button>
          ) : (
            <button onClick={requestClar} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.78_0.15_78)] px-4 py-2 text-sm font-semibold text-[oklch(0.30_0.12_60)] hover:opacity-90 disabled:opacity-60">
              <MessageCircle className="h-4 w-4" /> Send via WhatsApp
            </button>
          )}
          <button onClick={approve} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-cyan-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow hover:scale-[1.02] disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Verify & Approve
          </button>
        </div>

        {zoom && (
          <div className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-4" onClick={() => setZoom(null)}>
            <img src={zoom} alt="Full size" className="max-h-[92vh] max-w-full rounded-xl shadow-elegant" />
            <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"><X className="h-5 w-5" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
