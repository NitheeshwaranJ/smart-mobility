import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { CalendarCheck, MapPin, X } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "text-warn border-warn/30",
  confirmed: "text-accent border-accent/30",
  active: "text-success border-success/30",
  completed: "text-muted border-border",
  cancelled: "text-danger border-danger/30",
};

export default function Trips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");

  async function load() {
    const { data } = await api.get("/api/bookings/mine");
    setTrips(data);
  }
  useEffect(() => { load(); }, []);

  async function cancel(id: number) {
    if (!confirm("Cancel this booking?")) return;
    await api.post(`/api/bookings/${id}/cancel`);
    load();
  }

  const filtered = filter === "all" ? trips : trips.filter(t => t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">My Trips</h1>
        <div className="flex gap-2 flex-wrap">
          {["all","pending","confirmed","active","completed","cancelled"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`chip capitalize ${filter===s ? "border-primary text-primary" : ""}`}>{s}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-muted">No trips here yet.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(t => (
            <div key={t.id} className="card p-4 lg:p-5 flex flex-col lg:flex-row gap-4">
              {t.vehicle?.image_url && (
                <img src={t.vehicle.image_url} alt="" className="w-full lg:w-40 h-32 object-cover rounded-lg" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-semibold">{t.vehicle?.brand} {t.vehicle?.model}</div>
                    <div className="text-sm text-muted flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {t.pickup_location}
                    </div>
                    <div className="text-sm text-muted flex items-center gap-1 mt-1">
                      <CalendarCheck className="w-3 h-3" /> {t.start_date} → {t.end_date}
                    </div>
                  </div>
                  <span className={`chip capitalize ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs text-muted">Total </span>
                    <span className="font-bold grad-text">${t.total_price}</span>
                    <span className="text-xs text-muted ml-2">(AI {t.ai_adjustment >= 0 ? "+" : ""}{t.ai_adjustment.toFixed(1)}%)</span>
                  </div>
                  {(t.status === "pending" || t.status === "confirmed") && (
                    <button onClick={() => cancel(t.id)} className="btn-ghost text-sm text-danger">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
