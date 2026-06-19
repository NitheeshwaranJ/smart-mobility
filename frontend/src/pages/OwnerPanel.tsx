import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Plus, Trash2, Loader2, Car, DollarSign } from "lucide-react";

const EMPTY = { brand: "", model: "", category: "sedan", year: 2024, seats: 5,
  location: "", base_price_per_day: 50, image_url: "", features: "" };

export default function OwnerPanel() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [form, setForm] = useState<any>(EMPTY);
  const [loading, setLoading] = useState(false);

  async function load() {
    const [v, b] = await Promise.all([
      api.get("/api/vehicles/owner/mine"),
      api.get("/api/bookings/owner"),
    ]);
    setVehicles(v.data); setBookings(b.data);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try { await api.post("/api/vehicles", form); setForm(EMPTY); load(); }
    finally { setLoading(false); }
  }

  async function del(id: number) {
    if (!confirm("Delete vehicle?")) return;
    await api.delete(`/api/vehicles/${id}`); load();
  }

  const revenue = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.total_price, 0);
  const utilization = vehicles.length ? Math.round((bookings.length / (vehicles.length * 10)) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Owner Panel</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5"><Car className="w-5 h-5 text-accent" /><div className="mt-3 text-3xl font-bold">{vehicles.length}</div><div className="text-sm text-muted">Vehicles</div></div>
        <div className="card p-5"><DollarSign className="w-5 h-5 text-success" /><div className="mt-3 text-3xl font-bold">${revenue.toFixed(0)}</div><div className="text-sm text-muted">Simulated revenue</div></div>
        <div className="card p-5"><div className="text-xs text-muted">Utilization</div><div className="mt-3 text-3xl font-bold">{utilization}%</div><div className="text-sm text-muted">{bookings.length} bookings</div></div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4"/> Add a vehicle</h2>
        <form onSubmit={add} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input className="input" placeholder="Brand" value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} required />
          <input className="input" placeholder="Model" value={form.model} onChange={e=>setForm({...form, model:e.target.value})} required />
          <select className="input" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
            {["sedan","suv","hatchback","luxury","electric"].map(c => <option key={c}>{c}</option>)}
          </select>
          <input type="number" className="input" placeholder="Year" value={form.year} onChange={e=>setForm({...form, year:Number(e.target.value)})} />
          <input type="number" className="input" placeholder="Seats" value={form.seats} onChange={e=>setForm({...form, seats:Number(e.target.value)})} />
          <input className="input" placeholder="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} required />
          <input type="number" className="input" placeholder="Price/day $" value={form.base_price_per_day} onChange={e=>setForm({...form, base_price_per_day:Number(e.target.value)})} />
          <input className="input" placeholder="Image URL" value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})} />
          <input className="input lg:col-span-3" placeholder="Features (comma separated)" value={form.features} onChange={e=>setForm({...form, features:e.target.value})} />
          <button className="btn-primary" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Add vehicle"}</button>
        </form>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">My fleet</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {vehicles.map(v => (
            <div key={v.id} className="border border-border rounded-xl overflow-hidden">
              {v.image_url && <img src={v.image_url} alt="" className="w-full h-32 object-cover" />}
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div><div className="font-medium">{v.brand} {v.model}</div><div className="text-xs text-muted">{v.location} · ${v.base_price_per_day}/day</div></div>
                  <button onClick={() => del(v.id)} className="text-danger hover:opacity-80"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">Recent bookings on my vehicles</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted uppercase"><tr><th className="text-left py-2">Vehicle</th><th className="text-left py-2">Dates</th><th className="text-left py-2">Status</th><th className="text-right py-2">Total</th></tr></thead>
            <tbody>
              {bookings.slice(0, 10).map(b => (
                <tr key={b.id} className="border-t border-border">
                  <td className="py-2">{b.vehicle?.brand} {b.vehicle?.model}</td>
                  <td className="py-2 text-muted">{b.start_date} → {b.end_date}</td>
                  <td className="py-2"><span className="chip capitalize">{b.status}</span></td>
                  <td className="py-2 text-right font-semibold">${b.total_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
