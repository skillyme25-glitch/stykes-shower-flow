import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2, User, Package, Calendar, Camera, X, ImagePlus } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { supabase } from "@/integrations/supabase/client";
import { KENYAN_COUNTIES, SLOT_LABELS, formatKES } from "@/lib/kenya";

export const Route = createFileRoute("/order")({
  head: () => ({ meta: [{ title: "Place Your Order — Stykes Aquasmart" }] }),
  component: OrderPage,
});

type Product = { id: string; name: string; description: string; price_kes: number; image_url: string; stock_count: number; is_available: boolean };
type Slot = "morning" | "afternoon" | "evening";
type PendingPhoto = { id: string; file: File; preview: string };
const MAX_PHOTOS = 4;
const MAX_BYTES = 10 * 1024 * 1024;

function OrderPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    customer_name: "",
    whatsapp: "+254",
    email: "",
    county: "",
    address: "",
    product_id: "",
    quantity: 1,
    notes: "",
    installation_date: "",
    installation_slot: "" as Slot | "",
    confirm: false,
    prefer_whatsapp_photos: false,
  });

  useEffect(() => {
    supabase.from("products").select("*").order("name").then(({ data }) => setProducts((data ?? []) as Product[]));
  }, []);

  useEffect(() => () => { photos.forEach((p) => URL.revokeObjectURL(p.preview)); }, [photos]);

  const today = new Date().toISOString().split("T")[0];
  const product = products.find((p) => p.id === form.product_id);
  const total = product ? product.price_kes * form.quantity : 0;

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const next: PendingPhoto[] = [];
    Array.from(files).forEach((f) => {
      if (photos.length + next.length >= MAX_PHOTOS) return toast.error(`Maximum ${MAX_PHOTOS} photos`);
      if (f.size > MAX_BYTES) return toast.error(`${f.name} exceeds 10MB`);
      const ok = /image\/(jpeg|jpg|png|heic|heif)/i.test(f.type) || /\.(jpe?g|png|heic|heif)$/i.test(f.name);
      if (!ok) return toast.error(`${f.name}: only JPG, PNG, HEIC allowed`);
      next.push({ id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f) });
    });
    if (next.length) setPhotos((p) => [...p, ...next].slice(0, MAX_PHOTOS));
  }
  function removePhoto(id: string) {
    setPhotos((p) => {
      const found = p.find((x) => x.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return p.filter((x) => x.id !== id);
    });
  }

  function validateStep(): boolean {
    if (step === 1) {
      if (!form.customer_name.trim()) return toast.error("Please enter your full name"), false;
      if (!/^\+254\d{9}$/.test(form.whatsapp)) return toast.error("Use Kenyan format: +254XXXXXXXXX"), false;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return toast.error("Enter a valid email"), false;
      if (!form.county) return toast.error("Select your county"), false;
      if (!form.address.trim()) return toast.error("Enter your address / estate"), false;
    }
    if (step === 2) {
      if (!form.product_id) return toast.error("Please select a product"), false;
      if (form.quantity < 1) return toast.error("Quantity must be at least 1"), false;
    }
    if (step === 3) {
      if (!form.installation_date) return toast.error("Pick an installation date"), false;
      if (form.installation_date < today) return toast.error("Date cannot be in the past"), false;
      if (!form.installation_slot) return toast.error("Pick a time slot"), false;
      if (!form.confirm) return toast.error("Please confirm your details"), false;
    }
    return true;
  }

  async function submit() {
    if (!validateStep() || !product || !form.installation_slot) return;
    setSubmitting(true);
    try {
      const { data: codeRow } = await supabase.rpc("generate_order_code");
      const order_code = codeRow as unknown as string;

      const hasPhotos = photos.length > 0;
      const initialStatus = hasPhotos ? "verification_pending" : "pending";
      const verificationStatus = hasPhotos ? "pending" : "not_required";

      const { data: order, error } = await supabase.from("orders").insert({
        order_code,
        customer_name: form.customer_name,
        whatsapp: form.whatsapp,
        email: form.email,
        county: form.county,
        address: form.address,
        product_id: product.id,
        product_name: product.name,
        unit_price_kes: product.price_kes,
        quantity: form.quantity,
        total_kes: total,
        notes: form.notes,
        installation_date: form.installation_date,
        installation_slot: form.installation_slot,
        status: initialStatus,
        verification_status: verificationStatus,
        prefer_whatsapp_photos: form.prefer_whatsapp_photos,
      }).select().single();
      if (error) throw error;

      // Upload photos to storage
      const photoUrls: string[] = [];
      if (hasPhotos) {
        for (const p of photos) {
          const ext = (p.file.name.split(".").pop() || "jpg").toLowerCase();
          const path = `${order.id}/${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await supabase.storage.from("bathroom-photos").upload(path, p.file, {
            contentType: p.file.type || "image/jpeg",
            upsert: false,
          });
          if (upErr) {
            toast.error(`Photo upload failed: ${upErr.message}`);
            continue;
          }
          const { data: pub } = supabase.storage.from("bathroom-photos").getPublicUrl(path);
          photoUrls.push(pub.publicUrl);
        }
        if (photoUrls.length) {
          await supabase.from("orders").update({ bathroom_photos: photoUrls }).eq("id", order.id);
        }
      }

      const { data: receiptCode } = await supabase.rpc("generate_receipt_code");
      await supabase.from("receipts").insert({
        receipt_code: receiptCode as unknown as string,
        order_id: order.id,
        kind: "order",
        payload: { order: { ...order, bathroom_photos: photoUrls } },
      });

      if (hasPhotos) {
        toast.success("Order placed! Our team will review your photos within 2 hours.");
      } else {
        toast.success(`Order ${order_code} placed! Send photos to WhatsApp 0704 624 888 within 24h.`);
      }
      navigate({ to: "/receipt/$orderId", params: { orderId: order.id } });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    { n: 1, label: "Your Details", icon: User },
    { n: 2, label: "Choose Product", icon: Package },
    { n: 3, label: "Schedule", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-hero py-12 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Place your order</h1>
          <p className="mt-2 text-white/70">Three quick steps. We'll confirm on WhatsApp within 2 hours.</p>
        </div>
      </section>

      <div className="mx-auto -mt-10 max-w-4xl px-6 pb-24">
        <div className="glass mb-8 rounded-2xl p-6 shadow-elegant">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => {
              const done = step > s.n;
              const active = step === s.n;
              return (
                <div key={s.n} className="flex flex-1 items-center">
                  <div className={`grid h-10 w-10 place-items-center rounded-full border-2 transition ${done ? "border-cyan bg-cyan-gradient text-white" : active ? "border-cyan bg-white text-cyan shadow-glow" : "border-border bg-muted text-muted-foreground"}`}>
                    {done ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Step {s.n}</div>
                    <div className={`text-sm font-semibold ${active || done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                  </div>
                  {i < steps.length - 1 && <div className={`mx-3 h-0.5 flex-1 ${done ? "bg-cyan" : "bg-border"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-card sm:p-10">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-bold">Your details</h2>
              <Field label="Full Name">
                <input className="ip" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Jane Doe" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="WhatsApp Phone (+254...)">
                  <input className="ip" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+254712345678" />
                </Field>
                <Field label="Email Address">
                  <input className="ip" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                </Field>
              </div>
              <Field label="County">
                <select className="ip" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })}>
                  <option value="">Select your county…</option>
                  {KENYAN_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Specific Address / Estate">
                <input className="ip" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Kileleshwa, Apartment 5B" />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Choose your product</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {products.map((p) => {
                  const selected = form.product_id === p.id;
                  const oos = !p.is_available || p.stock_count <= 0;
                  return (
                    <button key={p.id} type="button" disabled={oos}
                      onClick={() => setForm({ ...form, product_id: p.id })}
                      className={`group overflow-hidden rounded-2xl border bg-card text-left transition ${selected ? "border-cyan ring-2 ring-cyan shadow-glow" : "hover:border-cyan/50 hover:shadow-card"} ${oos ? "opacity-60" : ""}`}>
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                        {oos && <div className="absolute inset-0 grid place-items-center bg-black/50 text-sm font-semibold text-white">Out of stock</div>}
                        {selected && <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-cyan-gradient text-white shadow-glow"><Check className="h-4 w-4" /></div>}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">{p.name}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                        <div className="mt-3 font-bold text-gradient-gold">{formatKES(p.price_kes)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Quantity">
                  <input className="ip" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })} />
                </Field>
                {product && (
                  <div className="rounded-xl bg-muted/60 p-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Total</div>
                    <div className="text-2xl font-bold text-gradient-cyan">{formatKES(total)}</div>
                  </div>
                )}
              </div>
              <Field label="Special requests / notes (optional)">
                <textarea className="ip min-h-[100px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything we should know?" />
              </Field>

              {/* Site Photos */}
              <div className="rounded-2xl border-2 border-dashed border-cyan/40 bg-cyan/5 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-cyan" />
                  <h3 className="font-display text-lg font-bold">Site Photos <span className="text-xs font-normal text-muted-foreground">(optional, strongly encouraged)</span></h3>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Upload clear photos of your bathroom showing the existing shower area, wall conditions, water inlet points, and ceiling. This helps us verify compatibility and prepare for a smooth installation. <strong className="text-foreground">Recommended: 2 wide-angle shots and 2 close-ups of the water inlets.</strong>
                </p>

                {photos.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {photos.map((p) => (
                      <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl border bg-muted shadow-card">
                        <img src={p.preview} alt="bathroom" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removePhoto(p.id)}
                          className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white shadow-lg transition hover:bg-red-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {photos.length < MAX_PHOTOS && (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-full bg-cyan-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow">
                      <Camera className="h-4 w-4" /> Take Photo
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-cyan bg-white px-4 py-2.5 text-sm font-semibold text-cyan">
                      <ImagePlus className="h-4 w-4" /> Choose from Gallery
                    </button>
                    <span className="self-center text-xs text-muted-foreground">{photos.length}/{MAX_PHOTOS} • JPG/PNG/HEIC • max 10MB each</span>
                  </div>
                )}

                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif" multiple className="hidden"
                  onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />

                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3">
                  <input type="checkbox" checked={form.prefer_whatsapp_photos}
                    onChange={(e) => setForm({ ...form, prefer_whatsapp_photos: e.target.checked })}
                    className="mt-0.5 h-4 w-4 accent-[oklch(0.72_0.14_220)]" />
                  <span className="text-sm">I prefer to send photos via WhatsApp after ordering</span>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-bold">Schedule installation</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Preferred Installation Date">
                  <input className="ip" type="date" min={today} value={form.installation_date} onChange={(e) => setForm({ ...form, installation_date: e.target.value })} />
                </Field>
                <Field label="Preferred Time Slot">
                  <select className="ip" value={form.installation_slot} onChange={(e) => setForm({ ...form, installation_slot: e.target.value as Slot })}>
                    <option value="">Choose a slot…</option>
                    {Object.entries(SLOT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </Field>
              </div>

              <div className="rounded-2xl border bg-muted/40 p-5 text-sm">
                <h3 className="mb-3 font-semibold">Order summary</h3>
                <Row k="Customer" v={form.customer_name} />
                <Row k="WhatsApp" v={form.whatsapp} />
                <Row k="Location" v={`${form.county}, ${form.address}`} />
                {product && <Row k="Product" v={`${product.name} × ${form.quantity}`} />}
                <Row k="Site photos" v={photos.length > 0 ? `${photos.length} attached (verification pending)` : form.prefer_whatsapp_photos ? "Will send via WhatsApp" : "Not uploaded"} />
                <Row k="Total" v={<span className="font-bold text-gradient-gold">{formatKES(total)}</span>} />
              </div>

              <label className="flex items-start gap-3 rounded-xl border bg-card p-4">
                <input type="checkbox" checked={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.checked })} className="mt-1 h-4 w-4 accent-[oklch(0.72_0.14_220)]" />
                <span className="text-sm text-muted-foreground">I confirm the above details are correct and I authorise Stykes Aquasmart to contact me to schedule installation.</span>
              </label>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between">
            <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold disabled:opacity-40">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < 3 ? (
              <button onClick={() => validateStep() && setStep((s) => s + 1)}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.03]">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-2.5 text-sm font-semibold text-[oklch(0.14_0.04_250)] shadow-gold transition hover:scale-[1.03] disabled:opacity-60">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Place Order
              </button>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
      <WhatsAppFloat />
      <style>{`.ip{width:100%;border:1px solid var(--color-border);background:var(--color-card);padding:.7rem .9rem;border-radius:.75rem;font-size:.95rem;outline:none;transition:.15s}.ip:focus{border-color:var(--cyan);box-shadow:0 0 0 4px oklch(0.72 0.14 220 / .15)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between border-b border-dashed py-1.5 last:border-0"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}
