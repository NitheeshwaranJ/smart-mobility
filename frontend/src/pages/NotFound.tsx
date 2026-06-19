import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text p-6">
      <div className="text-center">
        <div className="text-7xl font-bold grad-text">404</div>
        <p className="mt-3 text-muted">Page not found</p>
        <Link to="/" className="btn-primary mt-6">Go home</Link>
      </div>
    </div>
  );
}
