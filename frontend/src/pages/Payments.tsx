import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Receipt } from "lucide-react";

export default function Payments() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get("/api/payments/mine").then(r => setRows(r.data)); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Receipt className="w-5 h-5" /> Payment history</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface2 text-muted text-xs uppercase">
              <tr><th className="text-left px-4 py-3">Transaction</th><th className="text-left px-4 py-3">Method</th><th className="text-left px-4 py-3">Status</th><th className="text-right px-4 py-3">Amount</th><th className="text-right px-4 py-3">Date</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted py-10">No payments yet.</td></tr>
              )}
              {rows.map(r => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{r.transaction_id}</td>
                  <td className="px-4 py-3 capitalize">{r.method.replace("_"," ")}</td>
                  <td className="px-4 py-3"><span className={`chip capitalize ${r.status==="success" ? "text-success border-success/30" : ""}`}>{r.status}</span></td>
                  <td className="px-4 py-3 text-right font-semibold">${r.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
