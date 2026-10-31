"use client";

import { useEffect, useRef, useState } from "react";

type Tick = "sent" | "delivered" | "read";
type Bubble = {
  from: "bot" | "customer";
  text: string;
  time: string;
  tick?: Tick;
};

const SCRIPT = ["hi", "4", "1", "2"]; // Greeting -> North Indian -> Paneer Butter Masala -> qty 2
const BUSINESS_NAME = "Leaf Veg Restaurant";
const BUSINESS_INITIALS = "LV";
const BUSINESS_AVATAR_COLOR = "#2E7D32";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function Tail({ side }: { side: "left" | "right" }) {
  const style =
    side === "right"
      ? { right: -6, borderLeft: "8px solid #dcf8c6", borderBottom: "8px solid transparent" }
      : { left: -6, borderRight: "8px solid #ffffff", borderBottom: "8px solid transparent" };
  return <span className="absolute bottom-0 h-0 w-0" style={style} />;
}

function Ticks({ tick }: { tick?: Tick }) {
  if (!tick) return null;
  const color = tick === "read" ? "#53bdeb" : "#8696a0";
  const double = tick !== "sent";
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" className="inline-block align-text-bottom">
      <path
        d={double ? "M1 5.5L4.5 9L11 2" : "M2 5.5L5.5 9L12 2"}
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {double && (
        <path d="M5 5.5L8.5 9L15 2" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function DemoPage() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [typing, setTyping] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const phoneRef = useRef<string>("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles, typing]);

  function updateLastTick(tick: Tick) {
    setBubbles((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].from === "customer") {
          next[i] = { ...next[i], tick };
          break;
        }
      }
      return next;
    });
  }

  async function play() {
    setPlaying(true);
    setBubbles([]);
    setDocumentUrl(null);
    phoneRef.current = `+1555${Math.floor(1000000 + Math.random() * 8999999)}`;

    for (const input of SCRIPT) {
      const label = input === "hi" ? "Hi!" : input;
      setBubbles((prev) => [...prev, { from: "customer", text: label, time: now(), tick: "sent" }]);
      await sleep(350);
      updateLastTick("delivered");

      setTyping(true);
      await sleep(900);

      const res = await fetch("/api/whatsapp/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneRef.current, body: input }),
      });
      const data = await res.json();

      updateLastTick("read");
      setTyping(false);

      for (const reply of data.replies as string[]) {
        setBubbles((prev) => [...prev, { from: "bot", text: reply, time: now() }]);
        await sleep(600);
      }
      if (data.documentUrl) setDocumentUrl(data.documentUrl);
      await sleep(500);
    }
    setPlaying(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 bg-zinc-100 py-8">
      <h1 className="text-lg font-semibold text-zinc-700">WhatsApp Ordering Bot — Live Demo</h1>

      {/* Phone frame */}
      <div className="w-[390px] overflow-hidden rounded-[2.5rem] border-[10px] border-black bg-black shadow-2xl">
        <div className="flex h-[760px] flex-col overflow-hidden rounded-[1.8rem] bg-white">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-[#075E54] px-5 pb-1 pt-2 text-[11px] font-medium text-white">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>

          {/* WhatsApp header */}
          <div className="flex items-center gap-3 bg-[#075E54] px-3 py-2 text-white">
            <span className="text-xl leading-none">‹</span>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: BUSINESS_AVATAR_COLOR }}
            >
              {BUSINESS_INITIALS}
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-medium leading-tight">{BUSINESS_NAME}</div>
              <div className="text-[12px] text-white/80">{typing ? "typing…" : "online"}</div>
            </div>
            <div className="flex items-center gap-4 pr-1 text-base">
              <span>📹</span>
              <span>📞</span>
            </div>
          </div>

          {/* Chat area */}
          <div
            ref={chatRef}
            className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3"
            style={{
              backgroundColor: "#ECE5DD",
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.02) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(0,0,0,0.02) 0, transparent 40%)",
            }}
          >
            {bubbles.length === 0 && !playing && (
              <p className="m-auto max-w-[220px] text-center text-sm text-zinc-500">
                Press play below to watch a real order happen, start to finish.
              </p>
            )}

            {bubbles.map((b, i) => (
              <div key={i} className={`message-in flex ${b.from === "customer" ? "justify-end" : "justify-start"}`}>
                <div
                  className="relative max-w-[78%] rounded-lg px-2.5 py-1.5 text-[13.5px] leading-snug shadow-sm"
                  style={{ backgroundColor: b.from === "customer" ? "#dcf8c6" : "#ffffff" }}
                >
                  <Tail side={b.from === "customer" ? "right" : "left"} />
                  <span className="whitespace-pre-wrap">{b.text}</span>
                  <span className="float-right ml-2 mt-1 flex items-center gap-1 text-[10px] text-zinc-500">
                    {b.time}
                    {b.from === "customer" && <Ticks tick={b.tick} />}
                  </span>
                </div>
              </div>
            ))}

            {typing && (
              <div className="message-in flex justify-start">
                <div className="relative flex items-center gap-1 rounded-lg bg-white px-3 py-2.5 shadow-sm">
                  <Tail side="left" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-zinc-400" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-zinc-400" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-zinc-400" />
                </div>
              </div>
            )}
          </div>

          {/* Fake input bar */}
          <div className="flex items-center gap-2 bg-[#F0F0F0] px-2 py-2">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-zinc-400 shadow-inner">
              <span>😊</span>
              <span>Type a message</span>
              <span className="ml-auto">📎</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#075E54] text-white">🎤</div>
          </div>
        </div>
      </div>

      <button
        onClick={play}
        disabled={playing}
        className="rounded-full bg-[#25D366] px-6 py-2.5 font-medium text-white shadow disabled:opacity-50"
      >
        {playing ? "Playing…" : "▶ Play demo conversation"}
      </button>

      {documentUrl && (
        <div className="message-in flex w-[390px] flex-col gap-2">
          <p className="text-center text-sm font-medium text-zinc-600">📄 Auto-generated bill, sent back instantly</p>
          <div className="overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-lg">
            <iframe src={documentUrl} className="h-[480px] w-full" title="Order confirmation PDF" />
          </div>
          <a
            href={documentUrl}
            target="_blank"
            rel="noreferrer"
            className="mx-auto rounded-full border border-green-600 px-5 py-2 text-center text-sm font-medium text-green-700"
          >
            Open full PDF →
          </a>
        </div>
      )}
    </div>
  );
}
