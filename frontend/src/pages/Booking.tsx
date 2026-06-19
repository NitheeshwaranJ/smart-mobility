import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { CreditCard, CheckCircle2, Loader2, Zap } from "lucide-react";

export default function Booking() {
  const { id } = useParams();
  const nav = useNavigate();
  const [v, setV] = useState<any>(null);
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [dates, setDates] = useState({ start_date: today, end_date: tomorrow });
  const [pickup, setPickup] = useState("");
  const [step, setStep] = useState<"select"|"pay"|"done">("select");
  const [booking, setBooking] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const { data } = await api.get(`/api/vehicles/${id}`, { params: dates });
    setV(data);
    setPickup(data.location);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, dates.start_date, dates.end_date]);

  async function confirm() {
    setErr(null); setLoading(true);
    try {
      const { data } = await api.post("/api/bookings", { vehicle_id: Number(id), ...dates, pickup_location: pickup });
      setBooking(data); setStep("pay");
    } catch (e: any) { setErr(e?.response?.data?.detail ?? "Booking failed"); }
    finally { setLoading(false); }
  }

  async function pay() {
    setLoading(true);
    try {
      const { data } = await api.post("/api/payments", { booking_id: booking.id, method: "mock_card" });
      setPayment(data); setStep("done");
    } finally { setLoading(false); }
  }

  if (!v) return <div className="text-muted">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-6">
        <h1 className="text-xl font-bold">Book {v.brand} {v.model}</h1>
        <p className="text-sm text-muted">{v.location}</p>
      </div>

      {step === "select" && (
        <div className="card p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Start date</label>
              <input type="date" className="input" min={today} value={dates.start_date}
                     onChange={(e) => setDates({...dates, start_date: e.target.value})} /></div>
            <div><label className="label">End date</label>
              <input type="date" className="input" min={dates.start_date} value={dates.end_date}
                     onChange={(e) => setDates({...dates, end_date: e.target.value})} /></div>
          </div>
          <div><label className="label">Pickup location</label>
            <input className="input" value={pickup} onChange={(e) => setPickup(e.target.value)} /></div>

          <div className="border-t border-border pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-muted"><span>Base price</span><span>${v.base_price_per_day} × {Math.max(1,(new Date(dates.end_date).getTime()-new Date(dates.start_date).getTime())/86400000)} days</span></div>
            <div className={`flex justify-between ${v.ai_adjustment >= 0 ? "text-warn" : "text-success"}`}>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" />AI adjustment</span>
              <span>{v.ai_adjustment >= 0 ? "+" : ""}{v.ai_adjustment}%</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2"><span>Total</span><span className="grad-text">${v.ai_price}</span></div>
            <div className="text-xs text-muted">{v.pricing_reason}</div>
          </div>

          {err && <div className="text-sm text-danger">{err}</div>}
          <button className="btn-primary w-full" disabled={loading} onClick={confirm}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm booking"}
          </button>
        </div>
      )}

      {step === "pay" && booking && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4" /> Mock payment</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="input" placeholder="Card number" defaultValue="4242 4242 4242 4242" />
            <input className="input" placeholder="Name on card" defaultValue="Recruiter Demo" />
            <input className="input" placeholder="Expiry" defaultValue="12/29" />
            <input className="input" placeholder="CVV" defaultValue="123" />
          </div>
          <div className="text-sm text-muted">No real charge — simulation only.</div>
          <button className="btn-primary w-full" disabled={loading} onClick={pay}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay $${booking.total_price}`}
          </button>
        </div>
      )}

      {step === "done" && payment && (
        <div className="card p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
          <h2 className="text-xl font-semibold mt-3">Payment successful</h2>
          <p className="text-sm text-muted mt-1">Transaction <span className="font-mono">{payment.transaction_id}</span></p>
          <div className="mt-6 flex gap-3 justify-center">
            <button className="btn-primary" onClick={() => nav("/app/trips")}>View my trips</button>
            <button className="btn-outline" onClick={() => nav("/app/vehicles")}>Browse more</button>
          </div>
        </div>
      )}
    </div>
  );
}
