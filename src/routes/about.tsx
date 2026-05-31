import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplet, ShieldCheck, Wrench, Sparkles, ArrowRight, Phone, MapPin, Star, Users, Home, Award } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Stykes Aquasmart" },
      { name: "description", content: "Learn about Stykes Aquasmart — Kenya's premier shower installation specialists with 500+ installations across 47 counties." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/90 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Our Story
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-5xl">
              Kenya's Most Trusted<br />
              <span className="text-gradient-cyan">Shower Specialists</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
              From a single van and a passion for quality plumbing, Stykes Aquasmart has grown into the go-to partner for premium shower supply and installation across all 47 counties of Kenya.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border md:grid-cols-4">
          {[
            { n: "500+", l: "Installations completed" },
            { n: "47", l: "Counties served" },
            { n: "6-Month", l: "Workmanship warranty" },
            { n: "2 hrs", l: "Average quote turnaround" },
          ].map((s) => (
            <div key={s.l} className="px-6 py-10 text-center">
              <div className="font-display text-3xl font-bold text-gradient-cyan sm:text-4xl">{s.n}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-16 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Who we are</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Built on quality, driven by service</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Stykes Aquasmart was founded with one simple belief — every Kenyan home deserves a shower experience that works perfectly, looks beautiful, and lasts for years. We noticed that too many homeowners were settling for poor installations done by unqualified technicians using substandard products.
              </p>
              <p>
                We set out to change that. Today, Stykes Aquasmart is synonymous with premium shower products, professional installation, and honest after-sale service. Every technician on our team is certified, experienced, and held to the highest standards.
              </p>
              <p>
                Whether you're in Nairobi, Mombasa, Kisumu, or any corner of Kenya — we deliver and install with the same level of care and professionalism.
              </p>
            </div>
            <Link to="/order"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.03]">
              Order your shower <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Values */}
          <div className="space-y-4">
            {[
              { icon: Sparkles, title: "Premium Products", desc: "We hand-pick every shower system we stock — energy-efficient, durable, and from world-class brands that stand the test of time.", grad: "bg-cyan-gradient" },
              { icon: Wrench, title: "Expert Installation", desc: "Our technicians carry 5+ years of hands-on experience and undergo regular training to stay ahead of modern plumbing standards.", grad: "bg-gold-gradient" },
              { icon: ShieldCheck, title: "After-Sale Support", desc: "We don't disappear after installation. Our 6-month workmanship warranty and dedicated WhatsApp support line mean you're covered.", grad: "bg-cyan-gradient" },
              { icon: Home, title: "Nationwide Reach", desc: "With logistics partners across Kenya, we deliver and install in all 47 counties — urban or rural, no location is too far.", grad: "bg-gold-gradient" },
            ].map((v) => (
              <div key={v.title} className="glass flex items-start gap-4 rounded-2xl p-5 shadow-card">
                <div className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl ${v.grad} text-white shadow-glow`}>
                  <v.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-muted/40 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Our mission</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Making great showers accessible to every Kenyan home</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            We believe quality shouldn't be a luxury reserved for high-end developments. Stykes Aquasmart exists to bring premium shower technology — combined with honest pricing and professional service — to homeowners across Kenya, regardless of location or budget.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Award, title: "Quality first", desc: "Every product we sell meets our strict quality benchmark before it reaches your home." },
              { icon: Users, title: "People-centred", desc: "From order placement to installation day, our team keeps you informed at every step." },
              { icon: Star, title: "Integrity", desc: "Transparent pricing, honest timelines, and no hidden charges — ever." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border bg-card p-6 shadow-card text-left">
                <p.icon className="h-7 w-7 text-cyan" />
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan">What our customers say</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Trusted by homeowners across Kenya</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: "Wanjiru K.", city: "Nairobi", text: "The installation was flawless. My new rain shower feels like a 5-star hotel! Stykes delivered exactly what they promised." },
            { name: "Daniel O.", city: "Mombasa", text: "Stykes delivered same day and their technician was courteous, fast, and left the bathroom cleaner than he found it." },
            { name: "Faith M.", city: "Kisumu", text: "Premium quality at fair prices. The follow-up support is the best I've ever seen from any contractor in Kenya." },
          ].map((t) => (
            <div key={t.name} className="glass rounded-2xl p-6 shadow-card">
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
              <div className="mt-4 text-sm font-semibold">{t.name} <span className="font-normal text-muted-foreground">— {t.city}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & CTA */}
      <section className="bg-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Get in touch</p>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Ready to upgrade your shower?</h2>
              <p className="mt-4 text-white/80">Our team is available 7 days a week. Reach us on WhatsApp or phone and we'll give you a same-day quote.</p>
              <ul className="mt-6 space-y-3 text-sm text-white/80">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan" /> 0704 624 888</li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan" /> 0738 878 383</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan" /> Nairobi, Kenya — serving all 47 counties</li>
              </ul>
            </div>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center md:justify-end">
              <Link to="/order"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-gradient px-8 py-4 text-base font-semibold text-white shadow-glow transition hover:scale-[1.04]">
                <Droplet className="h-5 w-5" fill="white" /> Order Now
              </Link>
              <a href="https://wa.me/254704624888" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
