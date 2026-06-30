"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceAssistantProps {
  userName: string;
  onMealLogged?: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: { [index: number]: { transcript: string } };
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function VoiceAssistant({ userName, onMealLogged }: VoiceAssistantProps) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(
      (v) => v.lang.startsWith("es") && v.name.includes("Female")
    ) ?? voices.find((v) => v.lang.startsWith("es"));
    if (spanishVoice) utterance.voice = spanishVoice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const processVoiceInput = useCallback(
    async (text: string) => {
      const lower = text.toLowerCase();

      const mealPatterns = [
        /(?:comí|comi|desayuné|desayune|almorcé|almorce|cené|cene|tomé|tome|bebí|bebi)\s+(.+)/i,
        /registra\s+(?:que\s+)?(?:comí|comi|desayuné|desayune)\s+(.+)/i,
      ];

      for (const pattern of mealPatterns) {
        const match = text.match(pattern);
        if (match?.[1]) {
          const mealName = match[1].trim();
          await fetch("/api/meals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: mealName, type: "comida" }),
          });
          const msg = `${userName}, registré que comiste ${mealName}. ¿Algo más?`;
          setResponse(msg);
          speak(msg);
          onMealLogged?.();
          return;
        }
      }

      const glucoseMatch = lower.match(/(?:glucosa|nivel|sugar)\s*(?:de|es|en|a)?\s*(\d{2,3})/i)
        ?? lower.match(/(\d{2,3})\s*(?:mg|miligramos|de glucosa)/i);

      if (glucoseMatch?.[1]) {
        const value = parseInt(glucoseMatch[1], 10);
        if (value >= 40 && value <= 500) {
          await fetch("/api/glucose", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value, source: "voz" }),
          });
          const res = await fetch("/api/recommendations");
          const data = await res.json();
          const msg = data.recommendation?.message ?? `${userName}, glucosa registrada: ${value}.`;
          setResponse(msg);
          speak(msg);
          onMealLogged?.();
          return;
        }
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const msg = data.message?.content ?? `${userName}, no pude procesar eso. ¿Puedes repetir?`;
      setResponse(msg);
      speak(msg);
    },
    [userName, speak, onMealLogged]
  );

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setResponse("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1]?.[0]?.transcript ?? "";
      setTranscript(result);
      if (event.results[event.results.length - 1]?.[0]) {
        finalTranscriptRef.current = result;
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => {
      setListening(false);
      const text = finalTranscriptRef.current;
      finalTranscriptRef.current = "";
      if (text) {
        processVoiceInput(text);
      }
    };

    recognitionRef.current = recognition;
    setListening(true);
    setTranscript("");
    finalTranscriptRef.current = "";
    recognition.start();
  }, [processVoiceInput]);

  useEffect(() => {
    if (open) {
      fetch("/api/voice")
        .then((r) => r.json())
        .then((d) => {
          setResponse(d.greeting);
          speak(d.greeting);
        })
        .catch(() => {});
    } else {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
      setListening(false);
      setSpeaking(false);
    }
  }, [open, speak]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95 touch-manipulation",
          "mb-[env(safe-area-inset-bottom,0px)]",
          speaking || listening
            ? "bg-gradient-to-br from-teal-500 to-emerald-600 pulse-ring"
            : "bg-gradient-to-br from-emerald-500 to-teal-600"
        )}
        title="Asistente de voz"
      >
        <Volume2 className="w-7 h-7 text-white" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                Asistente de voz
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Habla con {userName} — tu asistente personal
              </p>
            </div>

            <div className="flex items-center justify-center gap-1 h-16 mb-6">
              {(speaking || listening) &&
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-emerald-500 rounded-full voice-wave"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              {!speaking && !listening && (
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Mic className="w-8 h-8 text-emerald-600" />
                </div>
              )}
            </div>

            {transcript && (
              <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 mb-3 text-center">
                &ldquo;{transcript}&rdquo;
              </p>
            )}

            {response && (
              <p className="text-sm text-emerald-800 bg-emerald-50 rounded-xl p-3 mb-4 text-center leading-relaxed">
                {response}
              </p>
            )}

            <button
              onClick={startListening}
              disabled={listening || speaking}
              className={cn(
                "w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition",
                listening
                  ? "bg-red-100 text-red-700"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              )}
            >
              {listening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  Escuchando...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Hablar
                </>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center mt-4">
              Prueba: &ldquo;Comí ensalada con pollo&rdquo; o &ldquo;Mi glucosa es 130&rdquo;
            </p>
          </div>
        </div>
      )}
    </>
  );
}
