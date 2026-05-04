import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const todayKey = () => new Date().toISOString().slice(0, 10);
const getMonthKey = (date = new Date()) => date.toISOString().slice(0, 7);
const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
};

const getMonthName = (monthKey = getMonthKey()) => formatMonthLabel(monthKey);
const getWeekKey = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const mondayDiff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayDiff);
  return d.toISOString().slice(0, 10);
};

function getWeekDates(baseDate = new Date()) {
  const now = new Date(baseDate);
  const day = now.getDay();
  const mondayDiff = day === 0 ? -6 : 1 - day;

  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(now);
    d.setDate(now.getDate() + mondayDiff + index);
    return {
      label: weekDays[index],
      key: d.toISOString().slice(0, 10),
      dayNumber: d.getDate(),
    };
  });
}

function getBibleProgress(plan = []) {
  const total = plan.length;
  const completed = plan.filter((day) => day.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percent };
}

function getCurrentBibleDay(plan = []) {
  return plan.find((day) => !day.completed) || plan[plan.length - 1] || null;
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function getFinanceByCategory(transactions = []) {
  return Object.values(
    transactions
      .filter((transaction) => transaction.type === "Gasto")
      .reduce((acc, transaction) => {
        const category = transaction.category || "Otros";
        acc[category] = acc[category] || { category, amount: 0 };
        acc[category].amount += Number(transaction.amount || 0);
        return acc;
      }, {})
  );
}

function getHeatmapDays(total = 35, baseDate = new Date()) {
  const days = [];
  const now = new Date(baseDate);

  for (let i = total - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  return days;
}

function normalizeHabitName(name) {
  return String(name || "").trim().toLowerCase();
}

function dedupeHabitRows(rows = []) {
  const seen = new Set();
  const unique = [];
  const duplicates = [];

  rows.forEach((row) => {
    const key = normalizeHabitName(row.name);
    if (!key) return;

    if (seen.has(key)) {
      duplicates.push(row);
    } else {
      seen.add(key);
      unique.push(row);
    }
  });

  return { unique, duplicates };
}
const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const iconMap = {
  activity: "▦",
  bar: "▥",
  book: "▤",
  check: "✓",
  chevron: "›",
  close: "×",
  flame: "🔥",
  home: "⌂",
  moon: "☾",
  note: "✎",
  piggy: "◈",
  plus: "+",
  shield: "✓",
  sparkles: "✦",
  sun: "☀",
  target: "◎",
  timer: "◷",
  wallet: "$",
  menu: "☰",
  planet: "◉",
};

function Icon({ name, size = 20, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center font-black leading-none ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.9 }}
    >
      {iconMap[name] || "•"}
    </span>
  );
}

function OrbitMark({ size = 56, className = "" }) {
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl" />
      <svg viewBox="0 0 120 120" className="relative h-full w-full overflow-visible drop-shadow-[0_0_18px_rgba(52,211,153,0.45)]">
        <defs>
          <linearGradient id="orvynOrbit" x1="16" y1="18" x2="104" y2="102" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#34D399" />
            <stop offset="0.52" stopColor="#60A5FA" />
            <stop offset="1" stopColor="#A78BFA" />
          </linearGradient>
          <radialGradient id="orvynCore" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#A7F3D0" />
            <stop offset="1" stopColor="#34D399" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="17" fill="url(#orvynCore)" />
        <circle cx="60" cy="60" r="43" fill="none" stroke="rgba(148,163,184,0.34)" strokeWidth="1.5" strokeDasharray="3 6" />
        <path d="M25 77 A42 42 0 1 1 96 42" fill="none" stroke="url(#orvynOrbit)" strokeWidth="12" strokeLinecap="round" />
        <path d="M31 86 A49 49 0 0 0 96 92" fill="none" stroke="url(#orvynOrbit)" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
        <circle cx="98" cy="40" r="7" fill="#34D399" />
        <circle cx="27" cy="88" r="6" fill="#60A5FA" />
      </svg>
    </div>
  );
}

function OrbitalBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute right-0 top-56 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute left-[-12%] top-[18%] h-[520px] w-[820px] rotate-[-18deg] rounded-[50%] border border-emerald-300/10" />
      <div className="absolute right-[-16%] top-[8%] h-[620px] w-[980px] rotate-[22deg] rounded-[50%] border border-blue-300/10" />
      <div className="absolute bottom-[-20%] left-[18%] h-[520px] w-[900px] rotate-[8deg] rounded-[50%] border border-violet-300/10" />
      <div className="absolute left-[12%] top-[30%] h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.9)]" />
      <div className="absolute right-[18%] top-[18%] h-3 w-3 rounded-full bg-blue-300 shadow-[0_0_28px_rgba(96,165,250,0.9)]" />
      <div className="absolute bottom-[14%] left-[46%] h-3 w-3 rounded-full bg-violet-300 shadow-[0_0_28px_rgba(167,139,250,0.9)]" />
    </div>
  );
}

function getStablePlanetColor(planet, index = 0) {
  const allowed = ["orange", "violet", "blue"];
  if (allowed.includes(planet?.color)) return planet.color;

  const source = `${planet?.id || planet?.source_key || planet?.label || "planet"}`;
  const hash = source.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return allowed[(hash + index) % allowed.length];
}

function OrbitSystem({ planets = [], moons = [], compact = false, sunColor = "emerald" }) {
  const visiblePlanets = planets.slice(0, compact ? 5 : 10);
  const visibleMoons = moons.slice(0, compact ? 10 : 20);

  const planetLayouts = visiblePlanets.map((planet, index) => {
    const radiusX = compact ? 80 + index * 24 : 120 + index * 42;
    const radiusY = compact ? 48 + index * 14 : 72 + index * 24;

    return {
      planet,
      radiusX,
      radiusY,
      tilt: index % 2 === 0 ? -12 : 12,
      speed: compact ? 14 + index * 2 : 18 + index * 4,
      size: compact ? 14 + (index % 3) * 3 : 20 + (index % 3) * 4,
      reverse: index % 2 === 1,
    };
  });

  const visiblePlanetIds = new Set(visiblePlanets.map((planet) => planet.id));
  const sunClass =
    sunColor === "orange"
      ? "bg-orange-300 shadow-[0_0_48px_rgba(251,146,60,0.62)]"
      : sunColor === "red"
        ? "bg-red-300 shadow-[0_0_48px_rgba(252,165,165,0.62)]"
        : sunColor === "white"
          ? "bg-white shadow-[0_0_54px_rgba(255,255,255,0.74)]"
          : "bg-emerald-300 shadow-[0_0_48px_rgba(52,211,153,0.62)]";

  const normalizedMoons = visibleMoons.map((moon, index) => {
    const rawParentId = moon.metadata?.parent_planet_id;
    const fallbackPlanetId = visiblePlanets.length ? visiblePlanets[index % visiblePlanets.length].id : null;

    return {
      ...moon,
      resolvedPlanetId: visiblePlanetIds.has(rawParentId) ? rawParentId : fallbackPlanetId,
    };
  });

  const moonsWithoutPlanet = normalizedMoons.filter((moon) => !moon.resolvedPlanetId);

  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/40 ${compact ? "h-64" : "min-h-[34rem]"}`}>
      <style>{`
        @keyframes orvyn-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orvyn-spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .orvyn-orbit-spin {
          animation: orvyn-spin var(--orbit-speed, 18s) linear infinite;
        }
        .orvyn-orbit-spin-reverse {
          animation: orvyn-spin-reverse var(--orbit-speed, 18s) linear infinite;
        }
      `}</style>

      <div className={`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full ${sunClass}`} />
      <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-sm" />


      {planetLayouts.map((layout) => {
        const planetColor = getStablePlanetColor(layout.planet, planetLayouts.findIndex((item) => item.planet.id === layout.planet.id));
        const colorClass =
          planetColor === "orange"
            ? "bg-orange-300 shadow-[0_0_28px_rgba(251,146,60,0.75)]"
            : planetColor === "blue"
              ? "bg-blue-300 shadow-[0_0_28px_rgba(96,165,250,0.75)]"
              : "bg-violet-300 shadow-[0_0_28px_rgba(167,139,250,0.75)]";

        const moonsForPlanet = normalizedMoons.filter((moon) => moon.resolvedPlanetId === layout.planet.id);

        return (
          <div
            key={layout.planet.id}
            className={`absolute left-1/2 top-1/2 ${layout.reverse ? "orvyn-orbit-spin-reverse" : "orvyn-orbit-spin"}`}
            style={{
              width: layout.radiusX * 2,
              height: layout.radiusY * 2,
              marginLeft: -layout.radiusX,
              marginTop: -layout.radiusY,
              transformOrigin: "50% 50%",
              transform: `rotate(${layout.tilt}deg)`,
              "--orbit-speed": `${layout.speed}s`,
            }}
          >
            <div
              title={layout.planet.metadata?.habitName || layout.planet.label}
              className={`absolute left-1/2 top-0 rounded-full ${colorClass}`}
              style={{
                width: layout.size,
                height: layout.size,
                marginLeft: -layout.size / 2,
              }}
            >
              {moonsForPlanet.map((moon, moonIndex) => {
                const moonOrbit = layout.size * 1.8 + moonIndex * 10;
                const moonSize = compact ? 5 : 6;

                return (
                  <div
                    key={moon.id}
                    className="orvyn-orbit-spin absolute left-1/2 top-1/2 rounded-full border border-blue-100/15"
                    style={{
                      width: moonOrbit * 2,
                      height: moonOrbit * 2,
                      marginLeft: -moonOrbit,
                      marginTop: -moonOrbit,
                      "--orbit-speed": `${6 + moonIndex * 2}s`,
                    }}
                  >
                    <div
                      className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-blue-100 shadow-[0_0_16px_rgba(191,219,254,0.95)]"
                      style={{ width: moonSize, height: moonSize }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {moonsWithoutPlanet.map((moon, index) => {
        const radiusX = compact ? 76 + index * 18 : 110 + index * 24;
        const radiusY = compact ? 44 + index * 12 : 66 + index * 16;

        return (
          <div
            key={moon.id}
            className="orvyn-orbit-spin absolute left-1/2 top-1/2"
            style={{
              width: radiusX * 2,
              height: radiusY * 2,
              marginLeft: -radiusX,
              marginTop: -radiusY,
              "--orbit-speed": `${10 + index * 2}s`,
            }}
          >
            <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-blue-100 shadow-[0_0_16px_rgba(191,219,254,0.95)]" />
          </div>
        );
      })}

      {visiblePlanets.length === 0 && visibleMoons.length === 0 && (
        <div className="absolute inset-x-6 bottom-6 rounded-[1.5rem] border border-white/10 bg-[#070A12]/70 p-4 text-center text-sm text-slate-400 backdrop-blur">
          Cumplí objetivos semanales para atraer planetas y completá sesiones de enfoque para sumar lunas.
        </div>
      )}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0F172A]/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent" />
      <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-emerald-400/5 blur-2xl" />
      <div className="relative">{children}</div>
    </div>
  );
}

function ProgressRing({ value = 0, label = "" }) {
  const safe = Math.max(0, Math.min(100, Math.round(value || 0)));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = (safe / 100) * circumference;

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
        <circle cx="55" cy="55" r={radius} stroke="currentColor" strokeWidth="10" fill="none" className="text-slate-800" />
        <circle
          cx="55"
          cy="55"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.55)] transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tracking-tight text-white">{safe}%</span>
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, hint }) {
  return (
    <Card className="min-h-32">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{hint}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3 text-emerald-300">
          <Icon name={icon} size={22} />
        </div>
      </div>
    </Card>
  );
}

function NavButton({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] ${
        active
          ? "bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25"
          : "border border-white/5 bg-white/[0.03] text-slate-400 hover:border-white/10 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon name={icon} size={18} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function HabitCard({ habit, weekDates, toggleHabit, updateHabitField, saveHabitField, deleteHabit }) {
  const done = weekDates.reduce((acc, d) => acc + (habit.history?.[d.key] ? 1 : 0), 0);
  const percent = Math.min(100, Math.round((done / Math.max(habit.weeklyGoal, 1)) * 100));

  return (
    <Card className="transition hover:bg-white/[0.08]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-2xl">{habit.icon}</div>
          <div>
            <h3 className="font-bold text-white">{habit.name}</h3>
            <p className="text-sm text-slate-400">{habit.target}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
            {done}/{habit.weeklyGoal}
          </span>
          <button type="button" onClick={() => deleteHabit?.(habit.id)} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-400 hover:bg-red-400/10 hover:text-red-300">
            Borrar
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[80px_1fr_1fr_120px]">
        <input
          value={habit.icon}
          onChange={(e) => updateHabitField?.(habit.id, "icon", e.target.value)}
          onBlur={(e) => saveHabitField?.(habit.id, "icon", e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300/50"
        />
        <input
          value={habit.name}
          onChange={(e) => updateHabitField?.(habit.id, "name", e.target.value)}
          onBlur={(e) => saveHabitField?.(habit.id, "name", e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm font-bold text-white outline-none focus:border-emerald-300/50"
        />
        <input
          value={habit.target || ""}
          onChange={(e) => updateHabitField?.(habit.id, "target", e.target.value)}
          onBlur={(e) => saveHabitField?.(habit.id, "target", e.target.value)}
          placeholder="Meta visible"
          className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50"
        />
        <input
          type="number"
          min="1"
          value={habit.weeklyGoal}
          onChange={(e) => updateHabitField?.(habit.id, "weeklyGoal", e.target.value)}
          onBlur={(e) => saveHabitField?.(habit.id, "weeklyGoal", e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300/50"
        />
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {weekDates.map((d) => {
          const active = !!habit.history?.[d.key];
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => toggleHabit(habit.id, d.key)}
              className={`rounded-2xl border p-2 text-center transition active:scale-95 ${
                active
                  ? "border-emerald-300/60 bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                  : "border-white/10 bg-slate-950/40 text-slate-500 hover:bg-white/10"
              }`}
            >
              <div className="text-[10px] font-bold uppercase">{d.label}</div>
              <div className="mt-1 text-sm font-black">{active ? "✓" : d.dayNumber}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 h-2 rounded-full bg-slate-800">
        <div className="h-2 rounded-full bg-emerald-400 transition-all duration-700" style={{ width: `${percent}%` }} />
      </div>
    </Card>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === "signup" && !result.data.session) {
      setMessage("Cuenta creada. Revisá tu mail para confirmar el registro si Supabase te lo pide.");
    } else {
      onAuth?.(result.data.session);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100">
      <OrbitalBackground />
      <div className="relative mx-auto flex min-h-screen max-w-xl items-center justify-center p-5">
        <Card className="w-full">
          <div className="mb-8 flex items-center gap-4">
            <OrbitMark size={58} />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Orvyn</h1>
              <p className="text-sm text-slate-400">Todo tiene su órbita.</p>
            </div>
          </div>

          <h2 className="text-3xl font-black text-white">{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
          <p className="mt-2 text-sm text-slate-400">
            {mode === "login" ? "Entrá para sincronizar tus datos entre dispositivos." : "Creá una cuenta para guardar tus datos online."}
          </p>

          <form onSubmit={submit} className="mt-6 grid gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              minLength={6}
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50"
            />
            <button disabled={loading} className="rounded-2xl bg-gradient-to-r from-emerald-300 to-emerald-500 px-4 py-3 font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 disabled:opacity-60">
              {loading ? "Cargando..." : mode === "login" ? "Entrar" : "Registrarme"}
            </button>
          </form>

          {message && <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-300">{message}</p>}

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setMessage("");
            }}
            className="mt-5 text-sm font-bold text-emerald-300 hover:text-emerald-200"
          >
            {mode === "login" ? "No tengo cuenta, crear una" : "Ya tengo cuenta, iniciar sesión"}
          </button>
        </Card>
      </div>
    </div>
  );
}

export default function SistemaEnfoqueApp() {
  const loadedUserRef = useRef(null);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [biblePlan, setBiblePlan] = useState([]);
  const [biblePlanId, setBiblePlanId] = useState(null);
  const [biblePlanName, setBiblePlanName] = useState("Plan bíblico de enfoque");
  const [showBible, setShowBible] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [financeForm, setFinanceForm] = useState({ type: "Gasto", category: "Comida", description: "", amount: "" });
  const [bibleForm, setBibleForm] = useState({ title: "", reading: "", focus: "" });
  const [habitForm, setHabitForm] = useState({ name: "", icon: "✅", target: "", weeklyGoal: 1 });
  const [showHabitCreator, setShowHabitCreator] = useState(false);
  const [showFinanceCreator, setShowFinanceCreator] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [sunColor, setSunColor] = useState(() => window.localStorage.getItem("orvyn-sun-color") || "orange");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(0);
  const [focusActive, setFocusActive] = useState(false);
  const [focusFailed, setFocusFailed] = useState(false);
  const [focusSessionId, setFocusSessionId] = useState(null);
  const [orbitRewards, setOrbitRewards] = useState([]);
  const [selectedOrbitMonth, setSelectedOrbitMonth] = useState(getMonthKey());
  const [appError, setAppError] = useState("");

  const updateSunColor = (color) => {
    setSunColor(color);
    window.localStorage.setItem("orvyn-sun-color", color);
  };

  const user = session?.user;
  const weekDates = useMemo(() => getWeekDates(), []);
  const today = todayKey();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const createBiblePlanInDb = async (userId, name, readings) => {
    await supabase.from("bible_plans").update({ active: false }).eq("user_id", userId);

    const { data: plan, error: planError } = await supabase
      .from("bible_plans")
      .insert({ user_id: userId, name, active: true })
      .select()
      .single();

    if (planError) throw planError;

    if (readings.length) {
      const rows = readings.map((item, index) => ({
        user_id: userId,
        plan_id: plan.id,
        day: index + 1,
        title: item.title,
        reading: item.reading,
        focus: item.focus || "",
        completed: item.completed || false,
        notes: item.notes || "",
      }));
      const { error: readingsError } = await supabase.from("bible_readings").insert(rows);
      if (readingsError) throw readingsError;
    }

    return plan;
  };

  const loadUserData = async (currentUser) => {
    if (!currentUser) return;
    setDataLoading(true);
    setAppError("");

    try {
      let { data: habitRows, error: habitError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("active", true)
        .order("created_at", { ascending: true });

      if (habitError) throw habitError;

      if (!habitRows?.length) {
        const { data: insertedHabits, error: insertHabitError } = await supabase
          .from("habits")
          .insert(starterHabits.map((habit) => ({ ...habit, user_id: currentUser.id })))
          .select("*");
        if (insertHabitError) throw insertHabitError;
        habitRows = insertedHabits || [];
      }

      const deduped = dedupeHabitRows(habitRows || []);
      habitRows = deduped.unique;

      if (deduped.duplicates.length) {
        await supabase
          .from("habits")
          .update({ active: false })
          .eq("user_id", currentUser.id)
          .in("id", deduped.duplicates.map((habit) => habit.id));
      }

      const { data: logRows, error: logsError } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("completed", true);
      if (logsError) throw logsError;

      const habitsWithHistory = (habitRows || []).map((habit) => ({
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        target: habit.target,
        weeklyGoal: habit.weekly_goal,
        history: (logRows || [])
          .filter((log) => log.habit_id === habit.id)
          .reduce((acc, log) => ({ ...acc, [log.log_date]: true }), {}),
      }));
      setHabits(habitsWithHistory);

      const { data: taskRows, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });
      if (taskError) throw taskError;
      setTasks(taskRows || []);

      const { data: transactionRows, error: transactionError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });
      if (transactionError) throw transactionError;
      setTransactions(transactionRows || []);

      let { data: planRow, error: planError } = await supabase
        .from("bible_plans")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (planError) throw planError;

      if (!planRow) {
        planRow = await createBiblePlanInDb(currentUser.id, "Plan bíblico de enfoque", defaultBiblePlan);
      }

      setBiblePlanId(planRow.id);
      setBiblePlanName(planRow.name || "Plan bíblico de enfoque");

      const { data: readingRows, error: readingError } = await supabase
        .from("bible_readings")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("plan_id", planRow.id)
        .order("day", { ascending: true });
      if (readingError) throw readingError;
      setBiblePlan(readingRows || []);

      const { data: rewardRows, error: rewardError } = await supabase
        .from("orbit_rewards")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });
      if (rewardError) throw rewardError;
      setOrbitRewards(rewardRows || []);
    } catch (error) {
      setAppError(error.message || "No se pudieron cargar los datos.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const savedBiblePreference = window.localStorage.getItem(`focus-show-bible-${user.id}`);
      setShowBible(savedBiblePreference === null ? true : savedBiblePreference === "true");

      if (loadedUserRef.current !== user.id) {
        loadedUserRef.current = user.id;
        loadUserData(user);
      }
    } else {
      loadedUserRef.current = null;
      setHabits([]);
      setTasks([]);
      setTransactions([]);
      setBiblePlan([]);
      setBiblePlanId(null);
      setOrbitRewards([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!showBible && activeTab === "biblia") {
      setActiveTab("inicio");
    }
  }, [showBible, activeTab]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const toggleBibleModule = () => {
    const next = !showBible;
    setShowBible(next);
    if (user) {
      window.localStorage.setItem(`focus-show-bible-${user.id}`, String(next));
    }
  };

  const toggleHabit = async (habitId, dateKey) => {
    const habit = habits.find((item) => item.id === habitId);
    if (!habit || !user) return;

    const nextCompleted = !habit.history?.[dateKey];
    setHabits((prev) =>
      prev.map((item) =>
        item.id === habitId
          ? {
              ...item,
              history: { ...(item.history || {}), [dateKey]: nextCompleted },
            }
          : item
      )
    );

    if (nextCompleted) {
      const { error } = await supabase.from("habit_logs").upsert(
        {
          user_id: user.id,
          habit_id: habitId,
          log_date: dateKey,
          completed: true,
        },
        { onConflict: "user_id,habit_id,log_date" }
      );
      if (error) setAppError(error.message);
    } else {
      const { error } = await supabase
        .from("habit_logs")
        .delete()
        .eq("user_id", user.id)
        .eq("habit_id", habitId)
        .eq("log_date", dateKey);
      if (error) setAppError(error.message);
    }
  };

  const addHabit = async () => {
    if (!habitForm.name.trim() || !user) return;

    const weeklyGoal = Math.max(1, Number(habitForm.weeklyGoal) || 1);
    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: user.id,
        name: habitForm.name.trim(),
        icon: habitForm.icon.trim() || "✅",
        target: habitForm.target.trim(),
        weekly_goal: weeklyGoal,
        active: true,
      })
      .select("*")
      .single();

    if (error) return setAppError(error.message);

    setHabits((prev) => [
      ...prev,
      {
        id: data.id,
        name: data.name,
        icon: data.icon,
        target: data.target,
        weeklyGoal: data.weekly_goal,
        history: {},
      },
    ]);
    setHabitForm({ name: "", icon: "✅", target: "", weeklyGoal: 1 });
    setShowHabitCreator(false);
  };

  const updateHabitField = (habitId, field, value) => {
    setHabits((prev) => prev.map((habit) => (habit.id === habitId ? { ...habit, [field]: value } : habit)));
  };

  const saveHabitField = async (habitId, field, value) => {
    const dbField = field === "weeklyGoal" ? "weekly_goal" : field;
    const finalValue = field === "weeklyGoal" ? Math.max(1, Number(value) || 1) : value;
    const { error } = await supabase
      .from("habits")
      .update({ [dbField]: finalValue })
      .eq("id", habitId)
      .eq("user_id", user.id);

    if (error) setAppError(error.message);
  };

  const deleteHabit = async (habitId) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
    const { error } = await supabase.from("habits").update({ active: false }).eq("id", habitId).eq("user_id", user.id);
    if (error) setAppError(error.message);
  };

  const addTask = async () => {
    if (!newTask.trim() || !user) return;
    const { data, error } = await supabase
      .from("tasks")
      .insert({ user_id: user.id, title: newTask.trim(), done: false, tag: "Hoy" })
      .select()
      .single();

    if (error) return setAppError(error.message);
    setTasks((prev) => [data, ...prev]);
    setNewTask("");
  };

  const toggleTask = async (taskId) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    const nextDone = !task.done;
    setTasks((prev) => prev.map((item) => (item.id === taskId ? { ...item, done: nextDone } : item)));
    const { error } = await supabase.from("tasks").update({ done: nextDone }).eq("id", taskId).eq("user_id", user.id);
    if (error) setAppError(error.message);
  };

  const deleteTask = async (taskId) => {
    setTasks((prev) => prev.filter((item) => item.id !== taskId));
    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", user.id);
    if (error) setAppError(error.message);
  };

  const clearTasks = async () => {
    setTasks([]);
    const { error } = await supabase.from("tasks").delete().eq("user_id", user.id);
    if (error) setAppError(error.message);
  };

  const addTransaction = async () => {
    const amount = Number(financeForm.amount);
    if (!amount || !financeForm.description.trim() || !user) return;

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        date: today,
        type: financeForm.type,
        category: financeForm.category,
        description: financeForm.description.trim(),
        amount,
      })
      .select()
      .single();

    if (error) return setAppError(error.message);
    setTransactions((prev) => [data, ...prev]);
    setFinanceForm({ type: "Gasto", category: "Comida", description: "", amount: "" });
    setShowFinanceCreator(false);
  };

  const clearFinances = async () => {
    setTransactions([]);
    const { error } = await supabase.from("transactions").delete().eq("user_id", user.id);
    if (error) setAppError(error.message);
  };

  const updateBiblePlanName = async (value) => {
    setBiblePlanName(value);
    if (!biblePlanId) return;
    const { error } = await supabase.from("bible_plans").update({ name: value }).eq("id", biblePlanId).eq("user_id", user.id);
    if (error) setAppError(error.message);
  };

  const toggleBibleDay = async (dayId) => {
    const day = biblePlan.find((item) => item.id === dayId);
    if (!day) return;
    const nextCompleted = !day.completed;
    setBiblePlan((prev) => prev.map((item) => (item.id === dayId ? { ...item, completed: nextCompleted } : item)));
    const { error } = await supabase.from("bible_readings").update({ completed: nextCompleted }).eq("id", dayId).eq("user_id", user.id);
    if (error) setAppError(error.message);
  };

  const updateBibleNotes = async (dayId, notes) => {
    setBiblePlan((prev) => prev.map((day) => (day.id === dayId ? { ...day, notes } : day)));
  };

  const saveBibleField = async (dayId, field, value) => {
    const { error } = await supabase.from("bible_readings").update({ [field]: value }).eq("id", dayId).eq("user_id", user.id);
    if (error) setAppError(error.message);
  };

  const updateBibleDayField = (dayId, field, value) => {
    setBiblePlan((prev) => prev.map((day) => (day.id === dayId ? { ...day, [field]: value } : day)));
  };

  const addBibleReading = async () => {
    if (!bibleForm.title.trim() || !bibleForm.reading.trim() || !biblePlanId || !user) return;
    const nextDay = biblePlan.length + 1;
    const { data, error } = await supabase
      .from("bible_readings")
      .insert({
        user_id: user.id,
        plan_id: biblePlanId,
        day: nextDay,
        title: bibleForm.title.trim(),
        reading: bibleForm.reading.trim(),
        focus: bibleForm.focus.trim() || "Lectura personal: anotar una idea, una oración y una acción concreta.",
        completed: false,
        notes: "",
      })
      .select()
      .single();

    if (error) return setAppError(error.message);
    setBiblePlan((prev) => [...prev, data]);
    setBibleForm({ title: "", reading: "", focus: "" });
  };

  const deleteBibleDay = async (dayId) => {
    const nextPlan = reindexBiblePlan(biblePlan.filter((day) => day.id !== dayId));
    setBiblePlan(nextPlan);
    const { error } = await supabase.from("bible_readings").delete().eq("id", dayId).eq("user_id", user.id);
    if (error) return setAppError(error.message);

    await Promise.all(
      nextPlan.map((day) => supabase.from("bible_readings").update({ day: day.day }).eq("id", day.id).eq("user_id", user.id))
    );
  };

  const resetBiblePlan = async () => {
    const nextPlan = biblePlan.map((day) => ({ ...day, completed: false, notes: "" }));
    setBiblePlan(nextPlan);
    const { error } = await supabase.from("bible_readings").update({ completed: false, notes: "" }).eq("user_id", user.id).eq("plan_id", biblePlanId);
    if (error) setAppError(error.message);
  };

  const replaceBiblePlan = async (name, readings) => {
    try {
      const plan = await createBiblePlanInDb(user.id, name, readings);
      setBiblePlanId(plan.id);
      setBiblePlanName(plan.name);
      const { data, error } = await supabase
        .from("bible_readings")
        .select("*")
        .eq("user_id", user.id)
        .eq("plan_id", plan.id)
        .order("day", { ascending: true });
      if (error) throw error;
      setBiblePlan(data || []);
    } catch (error) {
      setAppError(error.message);
    }
  };

  const loadPsalmsPlan = () => replaceBiblePlan("Salmos completo — 30 días", createPsalmsPlan());
  const clearBiblePlan = () => replaceBiblePlan("Mi nuevo plan bíblico", []);

  const todayDone = habits.filter((habit) => habit.history?.[today]).length;
  const todayPercent = habits.length ? Math.round((todayDone / habits.length) * 100) : 0;
  const weekDone = habits.reduce((sum, habit) => sum + weekDates.reduce((acc, d) => acc + (habit.history?.[d.key] ? 1 : 0), 0), 0);
  const weekGoal = habits.reduce((sum, habit) => sum + Number(habit.weeklyGoal || 0), 0);
  const weekPercent = weekGoal ? Math.round((weekDone / weekGoal) * 100) : 0;

  const income = transactions.filter((t) => t.type === "Ingreso").reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const expenses = transactions.filter((t) => t.type === "Gasto").reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const balance = income - expenses;

  const { total: bibleTotal, completed: bibleCompleted, percent: biblePercent } = getBibleProgress(biblePlan);
  const currentBibleDay = getCurrentBibleDay(biblePlan);
  const financeByCategory = getFinanceByCategory(transactions);

  const weeklyChart = weekDates.map((d) => ({
    day: d.label,
    habitos: habits.reduce((sum, h) => sum + (h.history?.[d.key] ? 1 : 0), 0),
  }));

  const heatmap = getHeatmapDays().map((key) => ({
    key,
    value: habits.reduce((sum, h) => sum + (h.history?.[key] ? 1 : 0), 0),
  }));

  const bestHabit = useMemo(() => {
    return [...habits].sort((a, b) => {
      const aDone = weekDates.reduce((sum, d) => sum + (a.history?.[d.key] ? 1 : 0), 0);
      const bDone = weekDates.reduce((sum, d) => sum + (b.history?.[d.key] ? 1 : 0), 0);
      return bDone - aDone;
    })[0];
  }, [habits, weekDates]);

  const weeklyPlanets = orbitRewards.filter((reward) => reward.type === "planet" && reward.month_key === selectedOrbitMonth);
  const selectedMonthRewards = orbitRewards.filter((reward) => reward.month_key === selectedOrbitMonth);
  const selectedMonthPlanets = selectedMonthRewards.filter((reward) => reward.type === "planet");
  const selectedMonthMoons = selectedMonthRewards.filter((reward) => reward.type === "moon");
  const availableOrbitMonths = Array.from(new Set([getMonthKey(), ...orbitRewards.map((reward) => reward.month_key)])).sort().reverse();

  const categories = ["Comida", "Transporte", "Ocio", "Salud", "Estudio", "Iglesia", "Ahorro", "Trabajo", "Otros"];

  useEffect(() => {
    if (!user || !habits.length) return;

    const currentWeekKey = getWeekKey();
    const currentMonthKey = getMonthKey();

    habits.forEach((habit) => {
      const completed = weekDates.reduce((sum, d) => sum + (habit.history?.[d.key] ? 1 : 0), 0);
      const goal = Number(habit.weeklyGoal || 0);
      const sourceKey = `habit-${habit.id}-${currentWeekKey}`;
      const existingReward = orbitRewards.find((reward) => reward.source_key === sourceKey);

      if (goal > 0 && completed >= goal && !existingReward) {
        const reward = {
          user_id: user.id,
          type: "planet",
          label: `Planeta de ${habit.name}`,
          source_key: sourceKey,
          month_key: currentMonthKey,
          week_key: currentWeekKey,
          habit_id: habit.id,
          metadata: { habitName: habit.name, icon: habit.icon, completed, goal },
          color: ["orange", "violet", "blue"][Math.floor(Math.random() * 3)],
        };

        supabase
          .from("orbit_rewards")
          .upsert(reward, { onConflict: "user_id,source_key" })
          .select()
          .single()
          .then(({ data, error }) => {
            if (error) setAppError(error.message);
            if (data) setOrbitRewards((prev) => (prev.some((item) => item.id === data.id) ? prev : [data, ...prev]));
          });
      }

      if (existingReward && completed < goal) {
        setOrbitRewards((prev) => prev.filter((reward) => reward.id !== existingReward.id));
        supabase
          .from("orbit_rewards")
          .delete()
          .eq("id", existingReward.id)
          .eq("user_id", user.id)
          .then(({ error }) => {
            if (error) setAppError(error.message);
          });
      }
    });
  }, [habits, orbitRewards, user?.id, weekDates]);

  useEffect(() => {
    if (!focusActive || focusFailed) return;

    const interval = window.setInterval(() => {
      setFocusSecondsLeft((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(interval);
          const currentMonthPlanets = orbitRewards.filter((item) => item.month_key === getMonthKey() && item.type === "planet");
          const chosenPlanet = currentMonthPlanets.length
            ? currentMonthPlanets[Math.floor(Math.random() * currentMonthPlanets.length)]
            : null;

          const reward = {
            user_id: user.id,
            type: "moon",
            label: "Luna de enfoque",
            source_key: `focus-${focusSessionId || crypto.randomUUID()}`,
            month_key: getMonthKey(),
            week_key: getWeekKey(),
            metadata: { minutes: focusMinutes, parent_planet_id: chosenPlanet?.id || null },
            color: "blue",
          };

          supabase
            .from("orbit_rewards")
            .upsert(reward, { onConflict: "user_id,source_key" })
            .select()
            .single()
            .then(({ data, error }) => {
              if (error && error.code !== "23505") setAppError(error.message);
              if (data) setOrbitRewards((prev) => (prev.some((item) => item.id === data.id) ? prev : [data, ...prev]));
            });

          setFocusActive(false);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [focusActive, focusFailed, focusMinutes, focusSessionId, orbitRewards, user?.id]);

  useEffect(() => {
    const handleVisibility = () => {
      if (focusActive && document.visibilityState === "hidden") {
        setFocusFailed(true);
        setFocusActive(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [focusActive]);

  const startFocusSession = () => {
    setFocusSessionId(crypto.randomUUID());
    setFocusFailed(false);
    setFocusSecondsLeft(Math.max(1, Number(focusMinutes) || 25) * 60);
    setFocusActive(true);
  };

  const cancelFocusSession = () => {
    setFocusActive(false);
    setFocusFailed(false);
    setFocusSessionId(null);
    setFocusSecondsLeft(0);
  };

  const formatFocusTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070A12] text-white">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-center shadow-2xl shadow-black/20">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-400 text-slate-950">
            <Icon name="sparkles" size={26} />
          </div>
          <p className="font-black">Cargando Focus...</p>
        </div>
      </div>
    );
  }

  if (!session) return <AuthScreen onAuth={setSession} />;

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100">
      <OrbitalBackground />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col p-4 sm:p-6 lg:p-8">
        <header className="relative z-[100] mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[#0F172A]/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <OrbitMark size={58} />
            <div>
              <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">Orvyn</h1>
              <p className="text-sm text-slate-400">Todo tiene su órbita</p>
            </div>
          </div>

          <div className="relative flex justify-end">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white shadow-lg shadow-black/20 transition hover:bg-white/10"
            >
              <Icon name="menu" size={20} />
              <span>Menú</span>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-14 z-[9999] w-72 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0B1220]/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl ring-1 ring-emerald-300/10">
                <div className="p-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Navegación</div>

                {[
                  ["inicio", "home", "Inicio"],
                  ["habitos", "check", "Hábitos"],
                  ["tareas", "target", "Tareas"],
                  ["finanzas", "wallet", "Finanzas"],
                  ["enfoque", "planet", "Modo Enfoque"],
                  ["orbita", "sparkles", "Órbita"],
                ].map(([tab, icon, label]) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      setShowMenu(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                      activeTab === tab ? "bg-emerald-400 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon name={icon} size={18} />
                    {label}
                  </button>
                ))}

                {showBible && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("biblia");
                      setShowMenu(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                      activeTab === "biblia" ? "bg-emerald-400 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon name="book" size={18} />
                    Biblia
                  </button>
                )}

                <div className="my-2 h-px bg-white/10" />
                <div className="p-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Ajustes</div>

                <button
                  type="button"
                  onClick={toggleBibleModule}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    <Icon name="book" size={18} />
                    Módulo Biblia
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs ${showBible ? "bg-emerald-400 text-slate-950" : "bg-white/10 text-slate-400"}`}>
                    {showBible ? "Activo" : "Off"}
                  </span>
                </button>

                <div className="px-2 py-3">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Color del sol</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      ["orange", "bg-orange-300"],
                      ["red", "bg-red-300"],
                      ["white", "bg-white"],
                      ["emerald", "bg-emerald-300"],
                    ].map(([color, bg]) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateSunColor(color)}
                        className={`flex h-10 items-center justify-center rounded-2xl border transition ${sunColor === color ? "border-white/60 bg-white/10" : "border-white/10 bg-white/[0.03] hover:bg-white/10"}`}
                      >
                        <span className={`h-4 w-4 rounded-full ${bg} shadow-[0_0_16px_rgba(255,255,255,0.35)]`} />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-red-200 transition hover:bg-red-400/10 hover:text-red-100"
                >
                  <Icon name="close" size={18} />
                  Salir
                </button>
              </div>
            )}
          </div>
        </header>

        {appError && (
          <div className="mb-5 rounded-3xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
            {appError}
          </div>
        )}

        {dataLoading && (
          <Card className="mb-5">
            <p className="font-bold text-slate-300">Sincronizando datos...</p>
          </Card>
        )}

        {activeTab === "inicio" && (
          <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 lg:grid-cols-12">
            <Card className="lg:col-span-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-emerald-300">Hoy</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Tu tablero diario</h2>
                </div>
                <ProgressRing value={todayPercent} label="cumplido" />
              </div>

              <div className="mt-6 grid gap-3">
                {habits.map((habit) => {
                  const active = !!habit.history?.[today];
                  return (
                    <button
                      key={habit.id}
                      type="button"
                      onClick={() => toggleHabit(habit.id, today)}
                      className={`flex items-center justify-between rounded-3xl border p-4 text-left transition active:scale-[0.98] ${
                        active ? "border-emerald-300/50 bg-emerald-400/15" : "border-white/10 bg-slate-950/40 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{habit.icon}</span>
                        <div>
                          <p className="font-bold text-white">{habit.name}</p>
                          <p className="text-xs text-slate-400">{habit.target}</p>
                        </div>
                      </div>
                      <div className={`rounded-full p-2 ${active ? "bg-emerald-400 text-slate-950" : "bg-white/10 text-slate-500"}`}>
                        <Icon name="check" size={20} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <div className="grid gap-5 lg:col-span-7">
              <Card>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-white">Tu órbita de {formatMonthLabel(getMonthKey())}</h3>
                  </div>
                  <button type="button" onClick={() => setActiveTab("orbita")} className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/20">
                    Ver órbita
                  </button>
                </div>
                <OrbitSystem planets={selectedMonthPlanets} moons={selectedMonthMoons} compact sunColor={sunColor} />
              </Card>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon="flame" label="Semana" value={`${weekPercent}%`} hint={`${weekDone}/${weekGoal} objetivos cumplidos`} />
                {showBible && <StatCard icon="book" label="Plan bíblico" value={`${biblePercent}%`} hint={`${bibleCompleted}/${bibleTotal} lecturas completas`} />}
                <StatCard icon="piggy" label="Balance" value={formatMoney(balance)} hint="Ingresos menos gastos" />
                <StatCard icon="shield" label="Hábito fuerte" value={bestHabit?.icon || "✨"} hint={bestHabit?.name || "Sin datos todavía"} />
              </div>

              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">Ritmo semanal</h3>
                  </div>
                  <Icon name="bar" className="text-emerald-300" size={24} />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyChart}>
                      <defs>
                        <linearGradient id="habitGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                      <XAxis dataKey="day" stroke="#64748b" />
                      <YAxis stroke="#64748b" allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 }} />
                      <Area type="monotone" dataKey="habitos" stroke="#34d399" fill="url(#habitGradient)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <Card className="lg:col-span-12">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Mapa de constancia</h3>
                </div>
                <Icon name="activity" className="text-emerald-300" size={24} />
              </div>
              <div className="grid grid-cols-7 gap-2 sm:grid-cols-[repeat(35,minmax(0,1fr))]">
                {heatmap.map((d) => (
                  <div
                    key={d.key}
                    title={`${d.key}: ${d.value} hábitos`}
                    className={`aspect-square rounded-lg border border-white/5 ${
                      d.value === 0 ? "bg-slate-900" : d.value < 2 ? "bg-emerald-900" : d.value < 4 ? "bg-emerald-600" : "bg-emerald-300"
                    }`}
                  />
                ))}
              </div>
            </Card>
          </motion.main>
        )}

        {activeTab === "enfoque" && (
          <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 lg:grid-cols-12">
            <Card className="lg:col-span-10 lg:col-start-2 xl:col-span-8 xl:col-start-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-emerald-300">Modo Enfoque</p>
                  <h2 className="mt-2 text-4xl font-black tracking-tight text-white">Cultivá tu órbita</h2>
                </div>
                <ProgressRing value={focusActive ? Math.round(((focusMinutes * 60 - focusSecondsLeft) / (focusMinutes * 60)) * 100) : 0} label="sesión" />
              </div>

              <div className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/40 p-8 text-center sm:p-10">
                <div className={`mx-auto flex h-44 w-44 items-center justify-center rounded-full border ${focusFailed ? "border-red-300/30 bg-red-400/10" : focusActive ? "border-emerald-300/30 bg-emerald-400/10" : "border-white/10 bg-white/[0.03]"}`}>
                  <div className={`h-24 w-24 rounded-full ${focusFailed ? "bg-red-300/60" : focusActive ? "bg-emerald-300 shadow-[0_0_35px_rgba(52,211,153,0.55)]" : "bg-slate-700"}`} />
                </div>

                <p className="mt-8 text-7xl font-black tracking-tight text-white sm:text-8xl">{formatFocusTime(focusSecondsLeft || focusMinutes * 60)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {focusFailed ? "Tu planeta se alejó porque saliste de Orvyn." : focusActive ? "No salgas de la app hasta completar la sesión." : "Elegí un tiempo, mantené el foco y atraé una luna a tu órbita."}
                </p>

                {!focusActive && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-4">
                    {[15, 25, 45].map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => setFocusMinutes(minutes)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${focusMinutes === minutes ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-200" : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10"}`}
                      >
                        {minutes} min
                      </button>
                    ))}
                    <input
                      type="number"
                      min="1"
                      value={focusMinutes}
                      onChange={(e) => setFocusMinutes(Math.max(1, Number(e.target.value) || 1))}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-center text-sm font-black text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50"
                      placeholder="Min"
                    />
                  </div>
                )}

                <div className="mt-6 flex justify-center gap-3">
                  {focusActive ? (
                    <button type="button" onClick={cancelFocusSession} className="rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-3 text-sm font-black text-red-200 hover:bg-red-400/20">
                      Cancelar sesión
                    </button>
                  ) : (
                    <button type="button" onClick={startFocusSession} className="rounded-2xl bg-gradient-to-r from-emerald-300 to-emerald-500 px-5 py-3 font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40">
                      Atraer luna
                    </button>
                  )}
                </div>
              </div>
            </Card>

          </motion.main>
        )}

        {activeTab === "orbita" && (
          <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 lg:grid-cols-12">
            <Card className="lg:col-span-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-emerald-300">Tu sistema personal</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Tu órbita</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedOrbitMonth}
                    onChange={(e) => setSelectedOrbitMonth(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-bold text-white outline-none focus:border-emerald-300/50"
                  >
                    {availableOrbitMonths.map((month) => (
                      <option key={month} value={month}>{formatMonthLabel(month)}</option>
                    ))}
                  </select>
                  <span className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-300">{selectedMonthPlanets.length} planetas</span>
                  <span className="rounded-full bg-blue-400/10 px-4 py-2 text-sm font-black text-blue-300">{selectedMonthMoons.length} lunas</span>
                </div>
              </div>

              <div className="mt-8">
                <OrbitSystem planets={selectedMonthPlanets} moons={selectedMonthMoons} sunColor={sunColor} />
              </div>
            </Card>

            <Card className="lg:col-span-6">
              <h3 className="text-xl font-black text-white">Planetas de hábitos</h3>
              <div className="mt-4 space-y-3">
                {selectedMonthPlanets.length === 0 && <p className="text-sm text-slate-400">Todavía no completaste objetivos semanales en este mes.</p>}
                {selectedMonthPlanets.slice(0, 6).map((planet) => (
                  <div key={planet.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <span className="font-bold text-white">{planet.metadata?.icon || "🪐"} {planet.metadata?.habitName || planet.label}</span>
                    <span className="text-sm text-emerald-300">{planet.metadata?.completed || 0}/{planet.metadata?.goal || 0}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="lg:col-span-6">
              <h3 className="text-xl font-black text-white">Lunas de enfoque</h3>
              <div className="mt-4 space-y-3">
                {selectedMonthMoons.length === 0 && <p className="text-sm text-slate-400">Todavía no completaste sesiones de enfoque en este mes.</p>}
                {selectedMonthMoons.map((moon) => (
                  <div key={moon.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <span className="font-bold text-white">Luna de enfoque</span>
                    <span className="text-sm text-blue-300">{moon.metadata?.minutes || 0} min</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.main>
        )}

        {activeTab === "habitos" && (
          <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-white">Hábitos</h2>
                <button
                  type="button"
                  onClick={() => setShowHabitCreator((prev) => !prev)}
                  className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/20"
                >
                  {showHabitCreator ? "Cerrar" : "+ Nuevo hábito"}
                </button>
              </div>

              {showHabitCreator && (
                <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
                  <h3 className="mb-4 text-lg font-black text-white">Crear hábito</h3>
                  <div className="grid gap-3 sm:grid-cols-[90px_1fr_1fr_130px]">
                    <input value={habitForm.icon} onChange={(e) => setHabitForm((form) => ({ ...form, icon: e.target.value }))} placeholder="Icono" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50" />
                    <input value={habitForm.name} onChange={(e) => setHabitForm((form) => ({ ...form, name: e.target.value }))} placeholder="Nombre del hábito" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50" />
                    <input value={habitForm.target} onChange={(e) => setHabitForm((form) => ({ ...form, target: e.target.value }))} placeholder="Meta, ej: 3x por semana" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50" />
                    <input type="number" min="1" value={habitForm.weeklyGoal} onChange={(e) => setHabitForm((form) => ({ ...form, weeklyGoal: e.target.value }))} placeholder="Meta semanal" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50" />
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowHabitCreator(false)} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10">
                      Cancelar
                    </button>
                    <button type="button" onClick={addHabit} className="rounded-2xl bg-gradient-to-r from-emerald-300 to-emerald-500 px-4 py-3 font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40">
                      Guardar hábito
                    </button>
                  </div>
                </div>
              )}
            </Card>

            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} weekDates={weekDates} toggleHabit={toggleHabit} updateHabitField={updateHabitField} saveHabitField={saveHabitField} deleteHabit={deleteHabit} />
            ))}
            </motion.main>
        )}

        {showBible && activeTab === "biblia" && (
          <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 lg:grid-cols-12">
            <Card className="lg:col-span-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-emerald-300">Plan bíblico</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-white">{biblePlanName}</h2>
                  <p className="mt-2 text-sm text-slate-400">Creá, editá y completá tus propios planes de lectura bíblica.</p>
                </div>
                <ProgressRing value={biblePercent} label="del plan" />
              </div>

              <div className="mt-6 grid gap-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Nombre del plan</label>
                <input
                  value={biblePlanName}
                  onChange={(e) => setBiblePlanName(e.target.value)}
                  onBlur={(e) => updateBiblePlanName(e.target.value)}
                  placeholder="Ej: Salmos completo, Evangelio de Juan, Romanos..."
                  className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50"
                />
              </div>

              {currentBibleDay && (
                <div className="mt-6 rounded-[2rem] border border-emerald-300/20 bg-emerald-400/10 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Próxima lectura</p>
                  <h3 className="mt-2 text-2xl font-black text-white">
                    Día {currentBibleDay.day}: {currentBibleDay.title}
                  </h3>
                  <p className="mt-2 font-bold text-emerald-100">{currentBibleDay.reading}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{currentBibleDay.focus}</p>
                  <button type="button" onClick={() => toggleBibleDay(currentBibleDay.id)} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-300 to-emerald-500 px-4 py-3 font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40">
                    {currentBibleDay.completed ? "Marcar como pendiente" : "Marcar lectura completa"}
                  </button>
                </div>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <button type="button" onClick={resetBiblePlan} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10">
                  Reiniciar progreso
                </button>
                <button type="button" onClick={loadPsalmsPlan} className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200 hover:bg-emerald-400/20">
                  Cargar Salmos 30 días
                </button>
                <button type="button" onClick={clearBiblePlan} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10">
                  Crear plan vacío
                </button>
                <button type="button" onClick={() => setActiveTab("inicio")} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10">
                  Volver al inicio
                </button>
              </div>

              <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/40 p-4">
                <h3 className="font-black text-white">Agregar lectura</h3>
                <div className="mt-4 grid gap-3">
                  <input value={bibleForm.title} onChange={(e) => setBibleForm((form) => ({ ...form, title: e.target.value }))} placeholder="Título del día, ej: Alabanza y confianza" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50" />
                  <input value={bibleForm.reading} onChange={(e) => setBibleForm((form) => ({ ...form, reading: e.target.value }))} placeholder="Lectura, ej: Salmos 1–5" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50" />
                  <textarea value={bibleForm.focus} onChange={(e) => setBibleForm((form) => ({ ...form, focus: e.target.value }))} placeholder="Enfoque/reflexión opcional" rows={3} className="resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50" />
                  <button type="button" onClick={addBibleReading} className="rounded-2xl bg-gradient-to-r from-emerald-300 to-emerald-500 px-4 py-3 font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40">
                    Agregar al plan
                  </button>
                </div>
              </div>
            </Card>

            <Card className="lg:col-span-7">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Progreso del plan</h3>
                  <p className="text-sm text-slate-400">Tildá cada lectura y dejá una nota breve de lo que te llevás.</p>
                </div>
                <Icon name="book" className="text-emerald-300" size={24} />
              </div>

              <div className="space-y-3">
                {biblePlan.map((day) => (
                  <div key={day.id} className={`rounded-3xl border p-4 transition ${day.completed ? "border-emerald-300/30 bg-emerald-400/10" : "border-white/10 bg-slate-950/40"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <button type="button" onClick={() => toggleBibleDay(day.id)} className="flex flex-1 items-start gap-3 text-left">
                        <span className={`mt-1 rounded-full p-2 ${day.completed ? "bg-emerald-400 text-slate-950" : "bg-white/10 text-slate-500"}`}>
                          <Icon name="check" size={18} />
                        </span>
                        <span className="flex-1">
                          <span className="block text-xs font-black uppercase tracking-[0.16em] text-slate-500">Día {day.day}</span>
                          <input
                            value={day.title}
                            onChange={(e) => updateBibleDayField(day.id, "title", e.target.value)}
                            onBlur={(e) => saveBibleField(day.id, "title", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-full rounded-xl border border-transparent bg-transparent px-0 py-1 font-black text-white outline-none focus:border-white/10 focus:bg-slate-950/40 focus:px-3"
                          />
                          <input
                            value={day.reading}
                            onChange={(e) => updateBibleDayField(day.id, "reading", e.target.value)}
                            onBlur={(e) => saveBibleField(day.id, "reading", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-full rounded-xl border border-transparent bg-transparent px-0 py-1 text-sm font-bold text-emerald-200 outline-none focus:border-white/10 focus:bg-slate-950/40 focus:px-3"
                          />
                          <textarea
                            value={day.focus || ""}
                            onChange={(e) => updateBibleDayField(day.id, "focus", e.target.value)}
                            onBlur={(e) => saveBibleField(day.id, "focus", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            rows={2}
                            className="mt-1 w-full resize-none rounded-xl border border-transparent bg-transparent px-0 py-1 text-sm text-slate-400 outline-none focus:border-white/10 focus:bg-slate-950/40 focus:px-3"
                          />
                        </span>
                      </button>
                      <button type="button" onClick={() => deleteBibleDay(day.id)} className="rounded-2xl bg-white/10 p-2 text-slate-500 hover:bg-red-400/10 hover:text-red-300">
                        <Icon name="close" size={18} />
                      </button>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <div className="mt-3 rounded-2xl bg-white/10 p-3 text-emerald-300">
                        <Icon name="note" />
                      </div>
                      <textarea
                        value={day.notes || ""}
                        onChange={(e) => updateBibleNotes(day.id, e.target.value)}
                        onBlur={(e) => saveBibleField(day.id, "notes", e.target.value)}
                        placeholder="Nota personal, oración, idea clave..."
                        rows={2}
                        className="min-h-16 flex-1 resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.main>
        )}

        {activeTab === "tareas" && (
          <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 lg:grid-cols-12">
            <Card className="lg:col-span-5">
              <h2 className="text-2xl font-black text-white">Tareas de hoy</h2>
              <div className="mt-5 flex gap-2">
                <input value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="Ej: ordenar escritorio" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50" />
                <button type="button" onClick={addTask} className="rounded-2xl bg-gradient-to-r from-emerald-300 to-emerald-500 px-4 font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40">
                  <Icon name="plus" />
                </button>
              </div>
              <button type="button" onClick={clearTasks} className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10">
                Borrar todas las tareas
              </button>
            </Card>

            <Card className="lg:col-span-7">
              <div className="space-y-3">
                {tasks.length === 0 && <p className="text-sm text-slate-400">Todavía no cargaste tareas.</p>}
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                    <button type="button" onClick={() => toggleTask(task.id)} className="flex items-center gap-3 text-left">
                      <span className={`rounded-full p-2 ${task.done ? "bg-emerald-400 text-slate-950" : "bg-white/10 text-slate-500"}`}>
                        <Icon name="check" size={18} />
                      </span>
                      <span className={task.done ? "text-slate-500 line-through" : "font-bold text-white"}>{task.title}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{task.tag}</span>
                      <button type="button" onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-red-300">
                        <Icon name="close" size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.main>
        )}

        {activeTab === "finanzas" && (
          <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 lg:grid-cols-12">
            <div className="grid gap-5 sm:grid-cols-3 lg:col-span-12">
              <StatCard icon="sun" label="Ingresos" value={formatMoney(income)} hint="Total registrado" />
              <StatCard icon="moon" label="Gastos" value={formatMoney(expenses)} hint="Total del período" />
              <StatCard icon="wallet" label="Disponible" value={formatMoney(balance)} hint="Balance actual" />
            </div>

            <Card className="lg:col-span-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-white">Movimientos</h2>
                <button
                  type="button"
                  onClick={() => setShowFinanceCreator((prev) => !prev)}
                  className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/20"
                >
                  {showFinanceCreator ? "Cerrar" : "+ Nuevo movimiento"}
                </button>
              </div>

              {showFinanceCreator && (
                <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
                  <h3 className="mb-4 text-lg font-black text-white">Cargar movimiento</h3>
                  <div className="grid gap-3">
                    <select value={financeForm.type} onChange={(e) => setFinanceForm((f) => ({ ...f, type: e.target.value }))} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none">
                      <option>Gasto</option>
                      <option>Ingreso</option>
                    </select>
                    <select value={financeForm.category} onChange={(e) => setFinanceForm((f) => ({ ...f, category: e.target.value }))} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none">
                      {categories.map((cat) => <option key={cat}>{cat}</option>)}
                    </select>
                    <input value={financeForm.description} onChange={(e) => setFinanceForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600" />
                    <input value={financeForm.amount} onChange={(e) => setFinanceForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Monto" type="number" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600" />
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setShowFinanceCreator(false)} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10">
                        Cancelar
                      </button>
                      <button type="button" onClick={addTransaction} className="rounded-2xl bg-gradient-to-r from-emerald-300 to-emerald-500 px-4 py-3 font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40">
                        Guardar movimiento
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button type="button" onClick={clearFinances} className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10">
                Borrar movimientos
              </button>
            </Card>

            <Card className="lg:col-span-7">
              <h3 className="text-lg font-black text-white">Gastos por categoría</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financeByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    <XAxis dataKey="category" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 }} />
                    <Bar dataKey="amount" radius={[12, 12, 0, 0]} fill="#34d399" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="lg:col-span-7">
              <h3 className="text-lg font-black text-white">Últimos movimientos</h3>
              <div className="mt-4 space-y-3">
                {transactions.length === 0 && <p className="text-sm text-slate-400">Todavía no cargaste movimientos.</p>}
                {transactions.slice(0, 8).map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                    <div>
                      <p className="font-bold text-white">{t.description}</p>
                      <p className="text-xs text-slate-400">{t.category} • {t.date}</p>
                    </div>
                    <p className={`font-black ${t.type === "Ingreso" ? "text-emerald-300" : "text-red-300"}`}>
                      {t.type === "Ingreso" ? "+" : "-"}{formatMoney(t.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="lg:col-span-5">
              <h3 className="text-lg font-black text-white">Distribución</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={financeByCategory} dataKey="amount" nameKey="category" innerRadius={58} outerRadius={94} paddingAngle={4}>
                      {financeByCategory.map((entry, index) => (
                        <Cell key={entry.category} fill={["#34d399", "#60a5fa", "#a78bfa", "#fbbf24", "#fb7185", "#22d3ee"][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.main>
        )}
      </div>
    </div>
  );
}
