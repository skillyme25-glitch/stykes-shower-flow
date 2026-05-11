import { Droplet } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-cyan-gradient shadow-glow">
        <Droplet className="h-5 w-5 text-white" fill="white" />
      </div>
      <div className="leading-tight">
        <div className={`font-display text-lg font-bold tracking-tight ${light ? "text-white" : "text-foreground"}`}>
          SK <span className="text-gradient-cyan">STYKES</span>
        </div>
        <div className={`text-[10px] uppercase tracking-[0.22em] ${light ? "text-white/70" : "text-muted-foreground"}`}>
          Aquasmart
        </div>
      </div>
    </div>
  );
}
