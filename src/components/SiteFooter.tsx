import { Phone, Globe, MapPin } from "lucide-react";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="bg-hero text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Kenya's premium shower specialists — supply, install, and guarantee your shower experience.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/80">Contact</h4>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan" /> 0704 624 888</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan" /> 0738 878 383</li>
            <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-cyan" /> www.stykes.co.ke</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan" /> Nairobi, Kenya</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/80">Why Stykes</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>Premium-grade products</li>
            <li>Certified installers</li>
            <li>6-month workmanship warranty</li>
            <li>Nationwide delivery</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Stykes Aquasmart. All rights reserved.
      </div>
    </footer>
  );
}
