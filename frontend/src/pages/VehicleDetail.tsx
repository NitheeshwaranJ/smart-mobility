import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/api/client";
import { Star, MapPin, Users, Calendar, Zap, ArrowLeft, MessageSquare } from "lucide-react";

export default function VehicleDetail() {
  const { id } = useParams();
  const [v, setV] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  async function load() {
    const { data } = await api.get(`/api/vehicles/${id}`);
    setV(data);
    const r = await api.get(`/api/reviews/vehicle/${id}`);
    setReviews(r.data);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function postReview(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/reviews", { vehicle_id: Number(id), ...newReview });
    setNewReview({ rating: 5, comment: "" });
    load();
  }

  if (!v) return <div className="text-muted">Loading…</div>;

  return (
    <div className="space-y-6">
      <Link to="/app/vehicles" className="text-sm text-muted hover:text-text inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to vehicles
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card overflow-hidden">
          <img src={v.image_url} alt={`${v.brand} ${v.model}`} className="w-full aspect-[16/9] object-cover" />
          <div className="p-6">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold">{v.brand} {v.model}</h1>
                <div className="text-sm text-muted mt-1 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {v.location}</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {v.seats} seats</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {v.year}</span>
                  <span className="chip capitalize">{v.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-warn">
                <Star className="w-5 h-5 fill-warn" /> <span className="font-semibold">{v.rating}</span>
                <span className="text-muted text-sm">({reviews.length} reviews)</span>
              </div>
            </div>
            {v.features && (
              <div className="mt-4 flex flex-wrap gap-2">
                {v.features.split(",").map((f: string) => (
                  <span key={f} className="chip">{f.trim()}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 h-fit sticky top-20">
          <div className="text-xs text-muted">Base price</div>
          <div className="text-muted line-through">${v.base_price_per_day}/day</div>
          <div className="mt-2 text-3xl font-bold grad-text flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" /> ${v.ai_price}
            <span className="text-sm font-normal text-muted">/day</span>
          </div>
          <div className={`text-xs mt-1 ${v.ai_adjustment >= 0 ? "text-warn" : "text-success"}`}>
            AI adjustment: {v.ai_adjustment >= 0 ? "+" : ""}{v.ai_adjustment}%
          </div>
          <p className="text-xs text-muted mt-3">{v.pricing_reason}</p>
          <Link to={`/app/book/${v.id}`} className="btn-primary w-full mt-5">Book this vehicle</Link>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Reviews</h2>
        <form onSubmit={postReview} className="mt-4 grid sm:grid-cols-[auto_1fr_auto] gap-3 items-end">
          <div>
            <label className="label">Rating</label>
            <select className="input" value={newReview.rating}
                    onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}>
              {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} ★</option>)}
            </select>
          </div>
          <div>
            <label className="label">Comment</label>
            <input className="input" placeholder="Share your experience…"
                   value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} />
          </div>
          <button className="btn-primary">Post</button>
        </form>
        <div className="mt-6 space-y-3">
          {reviews.length === 0 && <div className="text-sm text-muted">No reviews yet.</div>}
          {reviews.map((r) => (
            <div key={r.id} className="border-t border-border pt-3">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 fill-warn text-warn" /> {r.rating}
                <span className="text-muted text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <div className="text-sm mt-1">{r.comment}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
