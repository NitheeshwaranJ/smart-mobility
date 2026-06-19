import { useState, useRef, useEffect } from "react";
import { api } from "@/api/client";
import { Bot, Send, Loader2, User } from "lucide-react";

interface Msg { role: "user" | "assistant"; content: string }

export default function Assistant() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm MobilityAI. Ask me to pick a car, explain pricing, or find you a carpool." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    if (!input.trim()) return;
    const next = [...msgs, { role: "user" as const, content: input }];
    setMsgs(next); setInput(""); setLoading(true);
    try {
      const { data } = await api.post("/api/ai/chat", { messages: next });
      setMsgs(m => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Sorry, I'm temporarily unavailable." }]);
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-4"><Bot className="w-5 h-5 text-accent"/> AI Assistant</h1>
      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role==="user" ? "bg-grad-primary" : "bg-surface2 border border-border"}`}>
                {m.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-accent" />}
              </div>
              <div className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm whitespace-pre-wrap ${m.role==="user" ? "bg-grad-primary text-white" : "bg-surface2 border border-border"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-muted text-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Thinking…</div>}
          <div ref={endRef} />
        </div>
        <div className="border-t border-border p-3 flex gap-2">
          <input className="input flex-1" placeholder="Ask anything…" value={input}
                 onChange={e=>setInput(e.target.value)}
                 onKeyDown={e => e.key === "Enter" && send()} />
          <button className="btn-primary" onClick={send} disabled={loading}><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
