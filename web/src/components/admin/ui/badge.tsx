type Tone = "success" | "warning" | "danger" | "neutral" | "accent";

const TONES: Record<Tone, { bg: string; text: string; dot: string }> = {
  success: { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500" },
  warning: { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500" },
  danger: { bg: "bg-rose-50", text: "text-rose-800", dot: "bg-rose-500" },
  neutral: { bg: "bg-neutral-100", text: "text-neutral-600", dot: "bg-neutral-400" },
  accent: { bg: "bg-accent/10", text: "text-accent", dot: "bg-accent" },
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  const t = TONES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${t.bg} ${t.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden />
      {children}
    </span>
  );
}
