import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Ingresar · Hakori Admin" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ink">Hakori</span>
          <span className="text-sm text-neutral-400">Admin</span>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
