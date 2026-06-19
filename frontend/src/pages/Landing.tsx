import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Brain, Users2, BarChart3, Shield, Car } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-text bg-grad-hero">
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="font-semibold">Smart<span className="grad-text">Mobility</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
          <Link to="/signup" className="btn-primary text-sm">Get started</Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <span className="chip text-accent border-accent/30">AI-Powered · Production-Grade · Live Demo</span>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Smarter rentals.<br />
          <span className="grad-text">Smarter rides together.</span>
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-muted text-lg">
          Rent vehicles with transparent AI dynamic pricing, share trips with intelligent
          carpool matching, and run a real-time mobility business — all in one platform.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup" className="btn-primary">Try the demo <ArrowRight className="w-4 h-4" /></Link>
          <Link to="/login" className="btn-outline">
            Use recruiter@demo.com / demo123
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5">
        {[
          { icon: Brain, title: "AI Dynamic Pricing", body: "Demand, season, availability and popularity drive transparent, bounded price adjustments." },
          { icon: Users2, title: "Intelligent Carpooling", body: "Route similarity + time proximity matching. See match %, cost and CO₂ savings instantly." },
          { icon: BarChart3, title: "Enterprise Analytics", body: "Revenue trends, vehicle usage, popular locations and carpool reach in a real dashboard." },
          { icon: Car, title: "Real Booking Engine", body: "Double-booking prevention, lifecycle states, invoices and a mock payment gateway." },
          { icon: Shield, title: "Role-Based Access", body: "Customer, Owner and Admin roles with JWT auth and bcrypt password hashing." },
          { icon: Sparkles, title: "AI Assistant", body: "In-app assistant explains pricing, suggests vehicles and finds the right carpool." },
        ].map((f) => (
          <div key={f.title} className="card p-6">
            <f.icon className="w-6 h-6 text-accent" />
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        Built with FastAPI · MySQL · React · TailwindCSS — portfolio demo
      </footer>
    </div>
  );
}
