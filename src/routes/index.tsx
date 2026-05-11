import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplet, ShieldCheck, Wrench, Sparkles, ArrowRight, Star, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { supabase } from "@/integrations/supabase/client";
import { formatKES } from "@/lib/kenya";
import heroImg from "@/assets/hero-shower.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stykes Aquasmart — Premium Shower Installation in Kenya" },
      { name: "description", content: "Order premium shower products and expert installation. Nationwide delivery in Kenya. Trusted by hundreds of homes." },
      { property: "og:title", content: "Stykes Aquasmart — Premium Shower Installation" },
      { property: "og:description", content: "Kenya's #1 shower specialists." },
    ],
  }),
  component: Index,
});

type Product = { id: string; name: string; description: string; price_kes: number; image_url: string };

function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    supabase.from("products").select("id,name,description,price_kes,image_url").eq("is_available", true).limit(6)
      .then(({ data }) => setProducts((data ?? []) as Product[]));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero text-white">
        <img src={heroImg} alt="Premium luxury shower" width={1600} height={1024}
             className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.10_0.04_250)] via-[oklch(0.14_0.04_250/0.6)] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 md:py-40">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/90 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Kenya's Premium Shower Specialists
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
              Premium Shower Installation,<br />
              <span className="text-gradient-cyan">Delivered to Your Door.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-white/80 sm:text-lg">
              We supply, install, and guarantee your shower experience. Fast nationwide delivery, certified technicians, 6-month workmanship warranty.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/order"
                className="group inline-flex items-center gap-2 rounded-full bg-cyan-gradient px-8 py-4 text-base font-semibold text-white shadow-glow transition hover:scale-[1.04] animate-pulse-glow">
                <Droplet className="h-5 w-5" fill="white" />
                Order Your Shower Now
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <a href="tel:0704624888" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10">
                <Phone className="h-4 w-4" /> 0704 624 888
              </a>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-cyan" />500+ installations</div>
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-gold" />47 counties served</div>
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-cyan" />Same-day quotes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Why choose us</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Built for the modern Kenyan home</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Premium Products", desc: "Hand-picked, energy-efficient shower systems from world-class brands.", grad: "bg-cyan-gradient" },
            { icon: Wrench, title: "Expert Installation", desc: "Certified technicians with 5+ years of plumbing experience.", grad: "bg-gold-gradient" },
            { icon: ShieldCheck, title: "After-Sale Support", desc: "6-month workmanship warranty plus dedicated WhatsApp support.", grad: "bg-cyan-gradient" },
          ].map((f) => (
            <div key={f.title} className="glass group rounded-2xl p-8 shadow-card transition hover:-translate-y-1 hover:shadow-elegant">
              <div className={`mb-5 inline-grid h-14 w-14 place-items-center rounded-2xl ${f.grad} text-white shadow-glow`}>
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan">How it works</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">From order to hot shower in 4 steps</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { n: "01", title: "Order", desc: "Pick your shower & schedule online." },
              { n: "02", title: "Confirm", desc: "Our team confirms via WhatsApp in 2 hours." },
              { n: "03", title: "Install", desc: "Certified technician installs at your home." },
              { n: "04", title: "Done", desc: "Receive certificate & enjoy your shower." },
            ].map((s, i) => (
              <div key={s.n} className="relative">
                <div className="glass rounded-2xl p-6 shadow-card">
                  <div className="text-4xl font-display font-bold text-gradient-cyan">{s.n}</div>
                  <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </div>
                {i < 3 && <ArrowRight className="absolute -right-4 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-cyan md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Catalogue</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Featured shower products</h2>
          </div>
          <Link to="/order" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan hover:underline">
            View & order all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="group overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-elegant">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-gradient-gold">{formatKES(p.price_kes)}</span>
                  <Link to="/order" className="rounded-full bg-cyan-gradient px-4 py-1.5 text-xs font-semibold text-white shadow-glow">Order</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-hero py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Testimonials</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Loved by homeowners across Kenya</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Wanjiru K.", city: "Nairobi", text: "The installation was flawless. My new rain shower feels like a 5-star hotel!" },
              { name: "Daniel O.", city: "Mombasa", text: "Stykes delivered the same day. Their technician was courteous and fast." },
              { name: "Faith M.", city: "Kisumu", text: "Premium quality at fair prices. The follow-up support is the best I've seen." },
            ].map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6 text-white">
                <div className="flex gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/85">"{t.text}"</p>
                <div className="mt-4 text-sm font-semibold">{t.name} <span className="font-normal text-white/60">— {t.city}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
