import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { useAuth } from "@/store/auth";
import { Sparkles, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("recruiter@demo.com");
  const [password, setPassword] = useState("demo123");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setSession = useAuth((s) => s.setSession);
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setSession(data.access_token, data.user);
      nav("/app");
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg bg-grad-hero p-4">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="font-semibold">Smart<span className="grad-text">Mobility</span></span>
        </div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted mt-1">Sign in to continue.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {err && <div className="text-sm text-danger">{err}</div>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-sm text-muted text-center">
          New here? <Link to="/signup" className="text-accent">Create an account</Link>
        </div>

        <div className="mt-6 border-t border-border pt-4 text-xs text-muted space-y-1">
          <div className="font-semibold text-text">Demo accounts</div>
          <div>recruiter@demo.com · demo123 (customer)</div>
          <div>owner@demo.com · demo123 (owner)</div>
          <div>admin@demo.com · demo123 (admin)</div>
        </div>
      </div>
    </div>
  );
}
