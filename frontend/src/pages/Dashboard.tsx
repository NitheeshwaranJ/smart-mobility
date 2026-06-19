import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { useAuth } from "@/store/auth";
import { Car, CalendarCheck, Users2, Sparkles, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{vehicles: number; trips: number; carpool: number}>({ vehicles: 0, trips: 0, carpool: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [v, t, c] = await Promise.all([
          api.get("/api/vehicles"),
          api.get("/api/bookings/mine"),
          api.get("/api/carpool/mine"),
        ]);
        setStats({ vehicles: v.data.length, trips: t.data.length, carpool: c.data.length });
      } catch {}
    })();
  }, []);

  const cards = [
    { label: "Available Vehicles", value: stats.vehicles, icon: Car, to: "/app/vehicles", color: "from-blue-500 to-cyan-400" },
    { label: "My Trips", value: stats.trips, icon: CalendarCheck, to: "/app/trips", color: "from-emerald-500 to-teal-400" },
    { label: "Carpool Requests", value: stats.carpool, icon: Users2, to: "/app/carpool", color: "from-violet-500 to-fuchsia-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="card p-6 lg:p-8 bg-grad-hero">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <span className="chip text-accent border-accent/30"><Sparkles className="w-3 h-3" /> AI-powered</span>
            <h1 className="text-2xl lg:text-3xl font-bold mt-3">Hello {user?.name?.split(" ")[0]} 👋</h1>
            <p className="text-muted mt-1 max-w-xl">Find a car, book a trip, or share a ride. Our AI helps you save time and money.</p>
          </div>
          <Link to="/app/vehicles" className="btn-primary">Browse vehicles <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="card p-5 hover:border-primary/60 transition group">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-white`}>
                <c.icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent transition" />
            </div>
            <div className="mt-4 text-3xl font-bold">{c.value}</div>
            <div className="text-sm text-muted">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-semibold">Try AI Carpool matching</h3>
          <p className="text-sm text-muted mt-1">Enter a trip and instantly see compatible riders with cost & CO₂ savings.</p>
          <Link to="/app/carpool" className="btn-outline mt-4 text-sm">Open Carpool</Link>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold">Chat with the AI Assistant</h3>
          <p className="text-sm text-muted mt-1">Ask for recommendations, pricing explanations, or carpool tips.</p>
          <Link to="/app/assistant" className="btn-outline mt-4 text-sm">Open Assistant</Link>
        </div>
      </div>
    </div>
  );
}
