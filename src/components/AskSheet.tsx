"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SR = any;

export function AskSheet({
  open,
  onClose,
  onResult,
}: {
  open: boolean;
  onClose: () => void;
  onResult: (query: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SR>(null);

  useEffect(() => {
    if (!open) {
      recognitionRef.current?.abort();
      setListening(false);
      setTranscript("");
      setError(null);
      return;
    }
    startListening();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function startListening() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input isn't supported in this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onstart = () => { setListening(true); setError(null); };

    rec.onresult = (e: SR) => {
      const t = Array.from(e.results as SR[])
        .map((r: SR) => r[0].transcript as string)
        .join("");
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        setListening(false);
        onResult(t);
        setTimeout(onClose, 500);
      }
    };

    rec.onerror = () => {
      setListening(false);
      setError("Couldn't hear you — tap to try again.");
    };

    rec.onend = () => setListening(false);

    rec.start();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 pointer-events-none"
          >
            <button
              onClick={onClose}
              className="pointer-events-auto absolute top-14 right-6 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            <p className="text-white/40 text-sm tracking-wide">
              {listening ? "Listening…" : transcript ? "" : "What are you buying?"}
            </p>

            <motion.button
              onClick={listening ? undefined : startListening}
              className="pointer-events-auto relative w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-2xl"
              whileTap={listening ? {} : { scale: 0.94 }}
            >
              {listening && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white/40"
                    animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white/20"
                    animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "easeOut", delay: 0.3 }}
                  />
                </>
              )}
              <Mic className={`w-11 h-11 ${listening ? "text-red-500" : "text-black"}`} />
            </motion.button>

            <div className="pointer-events-auto text-center px-10 min-h-[28px]">
              {transcript ? (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white font-medium text-lg"
                >
                  {transcript}
                </motion.p>
              ) : error ? (
                <p className="text-red-400 text-sm">{error}</p>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
