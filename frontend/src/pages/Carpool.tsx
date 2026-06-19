import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Users2, Leaf, DollarSign, Route, Loader2 } from "lucide-react";

export default function Carpool() {
  const [mine, setMine] = useState<any[]>([]);
  const [matches, setMatches] = useState<Record<number, any[]>>({});
  const [form, setForm] = useState({
    pickup: "Whitefield", destination: "Electronic City",
    travel_time: new Date(Date.now()+3600_000).toISOString().slice(0,16),
    seats_needed: 1,
  });
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data } = await api.get("/api/carpool/mine");
    setMine(data);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      await api.post("/api/carpool", { ...form, travel_time: new Date(form.travel_time).toISOString() });
      load();
    } finally { setLoading(false); }
  }

  async function findMatches(id: number) {
    const { data } = await api.get(`/api/carpool/${id}/matches`);
    setMatches(m => ({...m, [id]: data}));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Carpool — AI matching</h1>

      <form onSubmit={create} className="card p-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-1"><label className="label">Pickup</label>
          <input className="input" value={form.pickup} onChange={e=>setForm({...form, pickup:e.target.value})} required /></div>
        <div className="lg:col-span-1"><label className="label">Destination</label>
          <input className="input" value={form.destination} onChange={e=>setForm({...form, destination:e.target.value})} required /></div>
        <div className="lg:col-span-2"><label className="label">Travel time</label>
          <input type="datetime-local" className="input" value={form.travel_time} onChange={e=>setForm({...form, travel_time:e.target.value})} required /></div>
        <div><label className="label">Seats</label>
          <input type="number" min={1} max={6} className="input" value={form.seats_needed} onChange={e=>setForm({...form, seats_needed:Number(e.target.value)})} /></div>
        <div className="lg:col-span-5 flex justify-end">
          <button className="btn-primary" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Create request"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {mine.length === 0 && <div className="card p-8 text-center text-muted">No carpool requests yet.</div>}
        {mine.map(r => (
          <div key={r.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold flex items-center gap-2"><Route className="w-4 h-4 text-accent" /> {r.pickup} → {r.destination}</div>
                <div className="text-xs text-muted mt-1">{new Date(r.travel_time).toLocaleString()} · {r.seats_needed} seats</div>
              </div>
              <button onClick={() => findMatches(r.id)} className="btn-outline text-sm"><Users2 className="w-4 h-4"/> Find matches</button>
            </div>
            {matches[r.id] && (
              <div className="mt-4 grid gap-2">
                {matches[r.id].length === 0 && <div className="text-sm text-muted">No matches found yet.</div>}
                {matches[r.id].map((m, i) => (
                  <div key={i} className="border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm">
                      <div className="font-medium">{m.other_request.pickup} → {m.other_request.destination}</div>
                      <div className="text-xs text-muted">{new Date(m.other_request.travel_time).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="chip text-accent border-accent/30">{m.match_score}% match</span>
                      <span className="flex items-center gap-1 text-success"><DollarSign className="w-3 h-3"/>${m.cost_saving}</span>
                      <span className="flex items-center gap-1 text-success"><Leaf className="w-3 h-3"/>{m.co2_saving_kg}kg CO₂</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
