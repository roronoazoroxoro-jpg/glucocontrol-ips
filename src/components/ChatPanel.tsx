"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface ChatPanelProps {
  userName: string;
}

export function ChatPanel({ userName }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        role: "user",
        content: userMsg,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      if (res.ok) {
        const refresh = await fetch("/api/chat");
        const refreshed = await refresh.json();
        setMessages(refreshed.messages ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  const quickPrompts = [
    "¿Qué puedo comer ahora?",
    "¿Cómo está mi glucosa?",
    "Registra que desayuné avena",
  ];

  return (
    <div className="glass-card rounded-2xl flex flex-col h-[480px]">
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-600" />
          Asistente IA
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Pregúntame sobre tu glucosa, comidas y recomendaciones
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Hola {userName}, ¿en qué puedo ayudarte?
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-2",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-emerald-600 text-white rounded-br-md"
                  : "bg-slate-100 text-slate-700 rounded-bl-md"
              )}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="bg-slate-100 px-4 py-2.5 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
