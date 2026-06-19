import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Vehicles from "@/pages/Vehicles";
import VehicleDetail from "@/pages/VehicleDetail";
import Booking from "@/pages/Booking";
import Trips from "@/pages/Trips";
import Payments from "@/pages/Payments";
import Carpool from "@/pages/Carpool";
import Assistant from "@/pages/Assistant";
import OwnerPanel from "@/pages/OwnerPanel";
import AdminAnalytics from "@/pages/AdminAnalytics";
import NotFound from "@/pages/NotFound";

function Protected({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const { token, user } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/app" element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="vehicles/:id" element={<VehicleDetail />} />
        <Route path="book/:id" element={<Booking />} />
        <Route path="trips" element={<Trips />} />
        <Route path="payments" element={<Payments />} />
        <Route path="carpool" element={<Carpool />} />
        <Route path="assistant" element={<Assistant />} />
        <Route
          path="owner"
          element={<Protected roles={["owner", "admin"]}><OwnerPanel /></Protected>}
        />
        <Route
          path="admin"
          element={<Protected roles={["admin"]}><AdminAnalytics /></Protected>}
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
