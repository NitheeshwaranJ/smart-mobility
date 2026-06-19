import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { useAuth } from "@/store/auth";
import { Sparkles, Loader2 } from "lucide-react";

export default function Signup() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "customer" as "customer" | "owner",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setSession = useAuth((s) => s.setSession);
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const { data } = await api.post("/api/auth/signup", form);
      setSession(data.access_token, data.user);
      nav("/app");
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Sign up failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg bg-grad-hero p-4">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="font-semibold">Smart<span className="grad-text">Mobility</span></span>
        </div>
        <h1 className="text-2xl font-semibold">Create your account</h1>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required minLength={2} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
          </div>
          <div>
            <label className="label">Password (min 6)</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required minLength={6} />
          </div>
          <div>
            <label className="label">Account type</label>
            <select className="input" value={form.role} onChange={(e) => setForm({...form, role: e.target.value as any})}>
              <option value="customer">Customer (rent & carpool)</option>
              <option value="owner">Vehicle Owner (list cars)</option>
            </select>
          </div>
          {err && <div className="text-sm text-danger">{err}</div>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-sm text-muted text-center">
          Have an account? <Link to="/login" className="text-accent">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
