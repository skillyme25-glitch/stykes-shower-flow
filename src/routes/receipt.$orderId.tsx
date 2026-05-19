import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, MessageCircle, Loader2, ArrowLeft, ShieldCheck, CheckCircle2, Camera, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { SLOT_LABELS, formatKES } from "@/lib/kenya";
import { downloadReceiptPDF } from "@/lib/receipt-pdf";

export const Route = createFileRoute("/receipt/$orderId")({
  head: () => ({ meta: [{ title: "Order Receipt — Stykes Aquasmart" }] }),
  component: ReceiptPage,
});

type Order = any;
type Receipt = { id: string; receipt_code: string; kind: string; created_at: string };

function ReceiptPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderReceipt, setOrderReceipt] = useState<Receipt | null>(null);
  const [completionReceipt, setCompletionReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    (async () => {
      const { data: o } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
      setOrder(o);
      const { data: rs } = await supabase.from("receipts").select("*").eq("order_id", orderId);
      const list = (rs ?? []) as Receipt[];
      setOrderReceipt(list.find((r) => r.kind === "order") ?? null);
      setCompletionReceipt(list.find((r) => r.kind === "completion") ?? null);
    })();
  }, [orderId]);

  if (!order) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-cyan" /></div>;
  }

  const waMessage = encodeURIComponent(
    `Hello Stykes! I just placed an order. Receipt No: ${orderReceipt?.receipt_code ?? order.order_code}. Name: ${order.customer_name}. Product: ${order.product_name} x${order.quantity}. Installation: ${order.installation_date} ${SLOT_LABELS[order.installation_slot]}. Please confirm. Thank you!`,
  );

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Home</Link>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => downloadReceiptPDF("receipt-doc", `Stykes-Receipt-${order.order_code}.pdf`)}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.03]">
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <a href={`https://wa.me/254704624888?text=${waMessage}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.70_0.18_150)] px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.03]">
              <MessageCircle className="h-4 w-4" /> Share on WhatsApp
            </a>
          </div>
        </div>

        {completionReceipt && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[oklch(0.78_0.15_140)] bg-[oklch(0.96_0.05_140)] p-4 text-sm text-[oklch(0.30_0.10_140)]">
            <CheckCircle2 className="h-5 w-5" /> Installation completed. A completion certificate is also available below.
          </div>
        )}

        <div id="receipt-doc" className="overflow-hidden rounded-3xl border bg-white shadow-elegant">
          {/* Top */}
          <div className="flex items-start justify-between gap-4 bg-hero p-8 text-white">
            <Logo light />
            <div className="text-right">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan">Official Order Receipt</div>
              <div className="mt-1 font-display text-2xl font-bold">{orderReceipt?.receipt_code ?? order.order_code}</div>
              <div className="mt-1 text-xs text-white/70">{new Date(order.created_at).toLocaleString("en-KE")}</div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between border-b bg-muted/30 px-8 py-4">
            <span className="text-sm text-muted-foreground">Order ID: <span className="font-mono font-semibold text-foreground">{order.order_code}</span></span>
            <StatusBadge status={order.status} />
          </div>

          {/* Body */}
          <div className="space-y-8 p-8">
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Customer</h3>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <KV k="Name" v={order.customer_name} />
                <KV k="WhatsApp" v={order.whatsapp} />
                <KV k="Email" v={order.email} />
                <KV k="County" v={order.county} />
                <KV k="Address" v={order.address} className="sm:col-span-2" />
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Order details</h3>
              <table className="w-full overflow-hidden rounded-xl text-sm">
                <thead className="bg-muted/60">
                  <tr><th className="p-3 text-left">Product</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Unit (KES)</th><th className="p-3 text-right">Total (KES)</th></tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-3 font-medium">{order.product_name}</td><td className="p-3 text-right">{order.quantity}</td><td className="p-3 text-right">{order.unit_price_kes.toLocaleString()}</td><td className="p-3 text-right font-semibold">{order.total_kes.toLocaleString()}</td></tr>
                  <tr><td className="p-3 text-right font-semibold" colSpan={3}>Grand Total</td><td className="p-3 text-right text-lg font-bold text-[oklch(0.30_0.10_220)]">{formatKES(order.total_kes)}</td></tr>
                </tbody>
              </table>
              {order.notes && <p className="mt-3 text-xs text-muted-foreground"><strong>Notes:</strong> {order.notes}</p>}
            </section>

            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Installation</h3>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <KV k="Scheduled date" v={order.installation_date} />
                <KV k="Time slot" v={SLOT_LABELS[order.installation_slot]} />
                {order.technician_name && <KV k="Technician" v={order.technician_name} />}
              </div>
            </section>

            {order.status === "pending" && (
              <div className="rounded-xl bg-[oklch(0.97_0.04_85)] p-4 text-sm text-[oklch(0.40_0.12_60)]">
                Thank you! For a smooth installation, please send photos of your bathroom to our WhatsApp <strong>0704 624 888</strong> within 24 hours. Our team will reach out to confirm your order.
              </div>
            )}
            {order.status === "verification_pending" && (
              <div className="rounded-xl bg-[oklch(0.95_0.07_290)] p-4 text-sm text-[oklch(0.35_0.18_290)]">
                Thank you! Our team will review your bathroom photos within <strong>2 hours</strong> and confirm your installation can proceed as scheduled.
              </div>
            )}

            {/* Site Verification */}
            <SiteVerification order={order} />
          </div>

          <div className="border-t bg-muted/30 p-6 text-center text-xs text-muted-foreground">
            Thank you for choosing <strong>Stykes Aquasmart</strong> — Kenya's Premium Shower Specialists | 0704 624 888 | www.stykes.co.ke
          </div>
        </div>

        {/* Completion Certificate */}
        {completionReceipt && (
          <div className="mt-10">
            <div className="mb-3 flex justify-end">
              <button onClick={() => downloadReceiptPDF("completion-doc", `Stykes-Completion-${order.order_code}.pdf`)}
                className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-[oklch(0.14_0.04_250)] shadow-gold">
                <Download className="h-4 w-4" /> Download Certificate
              </button>
            </div>
            <div id="completion-doc" className="overflow-hidden rounded-3xl border-4 border-double border-[oklch(0.80_0.15_78)] bg-white p-10 shadow-elegant">
              <div className="text-center">
                <Logo />
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[oklch(0.96_0.06_140)] px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[oklch(0.40_0.15_140)]">
                  <ShieldCheck className="h-4 w-4" /> Paid & Completed
                </div>
                <h2 className="mt-4 font-display text-3xl font-bold">Installation Completion Certificate</h2>
                <p className="mt-1 text-sm text-muted-foreground">Certificate No: {completionReceipt.receipt_code}</p>
              </div>
              <div className="mt-8 grid gap-3 rounded-2xl border bg-muted/30 p-6 text-sm sm:grid-cols-2">
                <KV k="Customer" v={order.customer_name} />
                <KV k="Order ID" v={order.order_code} />
                <KV k="Product" v={`${order.product_name} × ${order.quantity}`} />
                <KV k="Total Paid" v={formatKES(order.total_kes)} />
                <KV k="Technician" v={order.technician_name ?? "—"} />
                <KV k="Completed" v={order.completed_at ? new Date(order.completed_at).toLocaleString("en-KE") : "—"} />
              </div>
              <p className="mt-6 text-center text-sm italic text-muted-foreground">
                Stykes Aquasmart guarantees workmanship for <strong>6 months</strong> from installation date.
              </p>
              <p className="mt-2 text-center text-xs text-muted-foreground">Thank you for trusting Kenya's premium shower specialists.</p>
            </div>
          </div>
        )}
      </div>
      <WhatsAppFloat />
    </div>
  );
}

function KV({ k, v, className = "" }: { k: string; v: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:   { label: "🟡 Pending Confirmation", cls: "bg-[oklch(0.97_0.07_85)] text-[oklch(0.40_0.12_60)]" },
    verification_pending: { label: "🟣 Photo Verification Pending", cls: "bg-[oklch(0.95_0.07_290)] text-[oklch(0.35_0.18_290)]" },
    confirmed: { label: "🔵 Confirmed",            cls: "bg-[oklch(0.95_0.05_240)] text-[oklch(0.30_0.12_240)]" },
    assigned:  { label: "🟠 Technician Assigned",  cls: "bg-[oklch(0.95_0.07_50)]  text-[oklch(0.40_0.15_40)]"  },
    completed: { label: "🟢 Completed",            cls: "bg-[oklch(0.95_0.06_140)] text-[oklch(0.35_0.12_140)]" },
    cancelled: { label: "❌ Cancelled",             cls: "bg-[oklch(0.95_0.04_25)]  text-[oklch(0.45_0.18_25)]"  },
  };
  const s = map[status] ?? map.pending;
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

function SiteVerification({ order }: { order: any }) {
  const photos: string[] = Array.isArray(order.bathroom_photos) ? order.bathroom_photos : [];
  if (photos.length === 0 && order.verification_status === "not_required") return null;
  const vs = order.verification_status;

  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Site Verification</h3>

      {vs === "verified" && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[oklch(0.96_0.05_140)] px-3 py-1 text-sm font-semibold text-[oklch(0.35_0.12_140)]">
          <ShieldCheck className="h-4 w-4" /> Site verified ✅ — ready for installation
        </div>
      )}
      {vs === "pending" && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[oklch(0.95_0.07_290)] px-3 py-1 text-sm font-semibold text-[oklch(0.35_0.18_290)]">
          <Camera className="h-4 w-4" /> Site photos received — verification pending
        </div>
      )}
      {vs === "requires_clarification" && (
        <div className="mb-3 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.97_0.07_85)] px-3 py-1 text-sm font-semibold text-[oklch(0.40_0.12_60)]">
            <AlertTriangle className="h-4 w-4" /> Additional info requested
          </div>
          {order.verification_notes && (
            <div className="rounded-xl border border-[oklch(0.80_0.15_78)] bg-[oklch(0.98_0.05_85)] p-3 text-sm text-[oklch(0.35_0.12_60)]">
              <p className="whitespace-pre-wrap">{order.verification_notes}</p>
              <a href={`https://wa.me/254704624888?text=${encodeURIComponent(`Hi! Re order ${order.order_code}, sending additional photos.`)}`}
                target="_blank" rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-cyan-gradient px-4 py-1.5 text-xs font-semibold text-white shadow-glow">
                <MessageCircle className="h-3.5 w-3.5" /> Send photos via WhatsApp
              </a>
            </div>
          )}
        </div>
      )}
      {vs === "rejected" && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[oklch(0.95_0.04_25)] px-3 py-1 text-sm font-semibold text-[oklch(0.45_0.18_25)]">
          <AlertTriangle className="h-4 w-4" /> Site not suitable — see notes
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {photos.map((u, i) => (
            <a key={i} href={u} target="_blank" rel="noreferrer" className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img src={u} alt={`Site ${i + 1}`} className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
