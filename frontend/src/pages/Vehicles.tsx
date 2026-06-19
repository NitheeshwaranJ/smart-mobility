import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { Search, Star, MapPin, Zap, Filter } from "lucide-react";

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  category: string;
  year: number;
  seats: number;
  location: string;
  base_price_per_day: number;
  image_url: string;
  features: string;
  rating: number;
  ai_price: number;
  ai_adjustment: number;
  pricing_reason: string;
}

const CATEGORIES = ["", "sedan", "suv", "hatchback", "luxury", "electric"];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ location: "", category: "", max_price: "" });

  async function load() {
    setLoading(true);
    const params: any = {};
    if (filters.location) params.location = filters.location;
    if (filters.category) params.category = filters.category;
    if (filters.max_price) params.max_price = filters.max_price;
    const { data } = await api.get("/api/vehicles", { params });
    setVehicles(data);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Find your vehicle</h1>
          <p className="text-sm text-muted mt-1">{vehicles.length} cars available · AI-priced in real time</p>
        </div>
      </div>

      <div className="card p-4 lg:p-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <label className="label">Location</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input className="input pl-9" placeholder="e.g. Bangalore"
                   value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})} />
          </div>
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c ? c[0].toUpperCase() + c.slice(1) : "All"}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Max price/day ($)</label>
          <input type="number" className="input" placeholder="200"
                 value={filters.max_price} onChange={(e) => setFilters({...filters, max_price: e.target.value})} />
        </div>
        <div className="sm:col-span-4 flex justify-end">
          <button onClick={load} className="btn-primary text-sm"><Filter className="w-4 h-4" /> Apply filters</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted">Loading…</div>
      ) : vehicles.length === 0 ? (
        <div className="card p-10 text-center text-muted">No vehicles match your filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <Link key={v.id} to={`/app/vehicles/${v.id}`} className="card overflow-hidden group hover:border-primary/60 transition">
              <div className="aspect-[16/10] bg-surface2 overflow-hidden">
                <img src={v.image_url} alt={`${v.brand} ${v.model}`}
                     className="w-full h-full object-cover group-hover:scale-105 transition"
                     onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"; }} />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{v.brand} {v.model}</div>
                    <div className="text-xs text-muted flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {v.location} · {v.year} · {v.seats} seats
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-warn text-sm">
                    <Star className="w-4 h-4 fill-warn" /> {v.rating}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="chip capitalize">{v.category}</span>
                  <div className="text-right">
                    <div className="text-xs text-muted line-through">${v.base_price_per_day}/day</div>
                    <div className="text-lg font-bold grad-text flex items-center gap-1">
                      <Zap className="w-4 h-4 text-accent" />${v.ai_price}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-muted mt-2 truncate">{v.pricing_reason}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
