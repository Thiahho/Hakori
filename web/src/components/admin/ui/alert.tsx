import { AlertTriangleIcon } from "./icons";

type Tone = "error" | "success";

const TONES: Record<Tone, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function Alert({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <div className={`mb-5 flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${TONES[tone]}`}>
      {tone === "error" && <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}
