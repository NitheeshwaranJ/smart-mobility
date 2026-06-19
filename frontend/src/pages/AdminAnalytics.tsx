import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Users, Car, CalendarCheck, Activity, Users2, DollarSign } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#3B82F6", "#22D3EE", "#10B981", "#F59E0B", "#A78BFA"];

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api.get("/api/analytics").then(r => setData(r.data)); }, []);
  if (!data) return <div className="text-muted">Loading analytics…</div>;

  const kpis = [
    { label: "Total Users", value: data.total_users, icon: Users, color: "from-blue-500 to-cyan-400" },
    { label: "Total Vehicles", value: data.total_vehicles, icon: Car, color: "from-emerald-500 to-teal-400" },
    { label: "Total Bookings", value: data.total_bookings, icon: CalendarCheck, color: "from-violet-500 to-fuchsia-400" },
    { label: "Active Trips", value: data.active_trips, icon: Activity, color: "from-amber-500 to-orange-400" },
    { label: "Carpool Matches", value: data.carpool_matches, icon: Users2, color: "from-pink-500 to-rose-400" },
    { label: "Revenue (sim)", value: `$${Number(data.revenue_simulation).toFixed(0)}`, icon: DollarSign, color: "from-green-500 to-lime-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="card p-4">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${k.color} flex items-center justify-center text-white`}>
              <k.icon className="w-4 h-4" />
            </div>
            <div className="mt-3 text-xl font-bold">{k.value}</div>
            <div className="text-xs text-muted">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold mb-3">User growth</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={data.user_growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2A40" />
                <XAxis dataKey="week" stroke="#8A93A6" fontSize={12} />
                <YAxis stroke="#8A93A6" fontSize={12} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1F2A40", borderRadius: 8 }} />
                <Line type="monotone" dataKey="users" stroke="#22D3EE" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Revenue trends</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data.revenue_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2A40" />
                <XAxis dataKey="week" stroke="#8A93A6" fontSize={12} />
                <YAxis stroke="#8A93A6" fontSize={12} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1F2A40", borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Vehicle usage by category</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.vehicle_usage} dataKey="bookings" nameKey="category" outerRadius={90} label>
                  {data.vehicle_usage.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1F2A40", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Popular locations</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data.popular_locations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2A40" />
                <XAxis type="number" stroke="#8A93A6" fontSize={12} />
                <YAxis dataKey="location" type="category" stroke="#8A93A6" fontSize={12} width={110} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1F2A40", borderRadius: 8 }} />
                <Bar dataKey="bookings" fill="#22D3EE" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
