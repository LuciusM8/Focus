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

const starterHabits = [
  { name: "Levantarse a las 6", icon: "🌅", target: "Lun a vie", weekly_goal: 5 },
  { name: "Gym", icon: "🏋️", target: "3x por semana", weekly_goal: 3 },
  { name: "Leer / estudiar", icon: "📚", target: "30 min diarios", weekly_goal: 5 },
  { name: "Devocional", icon: "🙏", target: "Diario", weekly_goal: 7 },
  { name: "Menos redes", icon: "📵", target: "Máx. 1h 30m", weekly_goal: 5 },
];

const defaultBiblePlan = [
  {
    day: 1,
    title: "Dios crea y ordena",
    reading: "Génesis 1–2",
    focus: "Empezar mirando a Dios como Creador, fuente de orden, propósito y descanso.",
  },
  {
    day: 2,
    title: "Caída y promesa",
    reading: "Génesis 3; Romanos 5:12–21",
    focus: "Ver la necesidad humana y la promesa de restauración que apunta a Cristo.",
  },
  {
    day: 3,
    title: "Fe y obediencia",
    reading: "Génesis 12; Hebreos 11:8–16",
    focus: "Aprender de Abraham: caminar por fe incluso cuando no está todo claro.",
  },
  {
    day: 4,
    title: "Dios libera",
    reading: "Éxodo 3; Éxodo 14",
    focus: "Recordar que Dios escucha, llama, guía y abre camino donde parece imposible.",
  },
  {
    day: 5,
    title: "Corazón y adoración",
    reading: "Salmo 23; Salmo 51",
    focus: "Orar con honestidad: confianza, arrepentimiento y dependencia de Dios.",
  },
  {
    day: 6,
    title: "Sabiduría diaria",
    reading: "Proverbios 3; Santiago 1",
    focus: "Buscar sabiduría práctica para decisiones, hábitos, palabras y prioridades.",
  },
  {
    day: 7,
    title: "Jesús, el centro",
    reading: "Juan 1; Colosenses 1:15–23",
    focus: "Contemplar quién es Cristo y por qué todo encuentra sentido en Él.",
  },
  {
    day: 8,
    title: "El Sermón del Monte",
    reading: "Mateo 5",
    focus: "Revisar el carácter del Reino: humildad, pureza, misericordia y luz.",
  },
  {
    day: 9,
    title: "Oración y confianza",
    reading: "Mateo 6",
    focus: "Ordenar deseos, ansiedad y prioridades delante del Padre.",
  },
  {
    day: 10,
    title: "Amar como Jesús",
    reading: "Lucas 10:25–42; Juan 13:1–17",
    focus: "Pasar de la intención al servicio concreto y humilde.",
  },
  {
    day: 11,
    title: "Gracia y salvación",
    reading: "Efesios 2; Tito 3:3–8",
    focus: "Descansar en la gracia: no ganamos el amor de Dios, respondemos a él.",
  },
  {
    day: 12,
    title: "Vida en el Espíritu",
    reading: "Romanos 8; Gálatas 5:16–26",
    focus: "Identificar qué fruto necesita crecer más en esta etapa.",
  },
  {
    day: 13,
    title: "Disciplina y perseverancia",
    reading: "Hebreos 12:1–13; 1 Corintios 9:24–27",
    focus: "Conectar fe, constancia y entrenamiento espiritual.",
  },
  {
    day: 14,
    title: "Esperanza final",
    reading: "Apocalipsis 21–22",
    focus: "Terminar mirando la esperanza: Dios restaura todas las cosas.",
  },
];

function createPsalmsPlan() {
  return Array.from({ length: 30 }, (_, index) => {
    const start = index * 5 + 1;
    const end = Math.min(start + 4, 150);
    return {
      day: index + 1,
      title: `Salmos ${start}–${end}`,
      reading: start === end ? `Salmo ${start}` : `Salmos ${start}–${end}`,
      focus: "Leer despacio: adoración, honestidad, confianza, arrepentimiento y esperanza delante de Dios.",
    };
  });
}

function reindexBiblePlan(plan) {
  return plan.map((item, index) => ({ ...item, day: index + 1 }));
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

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

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

function getFinanceByCategory(transactions) {
  return Object.values(
    transactions
      .filter((t) => t.type === "Gasto")
      .reduce((acc, t) => {
        const category = t.category || "Otros";
        acc[category] = acc[category] || { category, amount: 0 };
        acc[category].amount += Number(t.amount || 0);
        return acc;
      }, {})
  );
}

function getBibleProgress(plan) {
  const total = plan.length;
  const completed = plan.filter((day) => day.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percent };
}

function getCurrentBibleDay(plan) {
  return plan.find((day) => !day.completed) || plan[plan.length - 1] || null;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur ${className}`}>{children}</div>;
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
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
        active ? "bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:bg-white/10 hover:text-white"
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
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-xl items-center justify-center p-5">
        <Card className="w-full">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30">
              <Icon name="sparkles" size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Focus</h1>
              <p className="text-sm text-slate-400">Tu sistema de hábitos, Biblia, tareas y finanzas.</p>
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
            <button disabled={loading} className="rounded-2xl bg-emerald-400 px-4 py-3 font-black text-slate-950 shadow-lg shadow-emerald-500/20 disabled:opacity-60">
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
  const [appError, setAppError] = useState("");

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

  const categories = ["Comida", "Transporte", "Ocio", "Salud", "Estudio", "Iglesia", "Ahorro", "Trabajo", "Otros"];

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
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-0 top-56 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col p-4 sm:p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/20 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30">
              <Icon name="sparkles" size={26} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">Focus</h1>
              <p className="text-sm text-slate-400">Sincronizado como {user?.email}</p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            <NavButton active={activeTab === "inicio"} icon="home" label="Inicio" onClick={() => setActiveTab("inicio")} />
            <NavButton active={activeTab === "habitos"} icon="check" label="Hábitos" onClick={() => setActiveTab("habitos")} />
            {showBible && (
              <NavButton active={activeTab === "biblia"} icon="book" label="Biblia" onClick={() => setActiveTab("biblia")} />
            )}
            <NavButton active={activeTab === "tareas"} icon="target" label="Tareas" onClick={() => setActiveTab("tareas")} />
            <NavButton active={activeTab === "finanzas"} icon="wallet" label="Finanzas" onClick={() => setActiveTab("finanzas")} />
            <button type="button" onClick={toggleBibleModule} className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-400 hover:bg-white/10 hover:text-white">
              {showBible ? "Ocultar Biblia" : "Activar Biblia"}
            </button>
            <button type="button" onClick={signOut} className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-400 hover:bg-white/10 hover:text-white">
              Salir
            </button>
          </nav>
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
                  <p className="mt-2 text-sm text-slate-400">Marcá lo importante y se guarda online para todos tus dispositivos.</p>
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
                    <p className="text-sm text-slate-400">Cantidad de hábitos cumplidos por día.</p>
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
                  <p className="text-sm text-slate-400">Cada cuadrado representa un día. Más intenso = más hábitos cumplidos.</p>
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

        {activeTab === "habitos" && (
          <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <h2 className="text-2xl font-black text-white">Editar hábitos</h2>
              <p className="mt-2 text-sm text-slate-400">Cada usuario puede crear, modificar o borrar sus propios hábitos.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-[90px_1fr_1fr_130px_auto]">
                <input value={habitForm.icon} onChange={(e) => setHabitForm((form) => ({ ...form, icon: e.target.value }))} placeholder="Icono" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50" />
                <input value={habitForm.name} onChange={(e) => setHabitForm((form) => ({ ...form, name: e.target.value }))} placeholder="Nombre del hábito" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50" />
                <input value={habitForm.target} onChange={(e) => setHabitForm((form) => ({ ...form, target: e.target.value }))} placeholder="Meta, ej: 3x por semana" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50" />
                <input type="number" min="1" value={habitForm.weeklyGoal} onChange={(e) => setHabitForm((form) => ({ ...form, weeklyGoal: e.target.value }))} placeholder="Meta semanal" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50" />
                <button type="button" onClick={addHabit} className="rounded-2xl bg-emerald-400 px-4 py-3 font-black text-slate-950 shadow-lg shadow-emerald-500/20">
                  Agregar
                </button>
              </div>
            </Card>

            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} weekDates={weekDates} toggleHabit={toggleHabit} updateHabitField={updateHabitField} saveHabitField={saveHabitField} deleteHabit={deleteHabit} />
            ))}
            <Card className="lg:col-span-2">
              <h3 className="text-lg font-black text-white">Modo enfoque sugerido</h3>
              <p className="mt-2 text-sm text-slate-400">Bloque corto para estudiar, leer o hacer devocional sin entrar en redes.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["25 min", "45 min", "90 min"].map((time) => (
                  <button key={time} type="button" className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/40 p-4 hover:bg-white/10">
                    <span className="flex items-center gap-3 font-bold text-white">
                      <Icon name="timer" className="text-emerald-300" /> {time}
                    </span>
                    <Icon name="chevron" className="text-slate-500" />
                  </button>
                ))}
              </div>
            </Card>
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
                  <button type="button" onClick={() => toggleBibleDay(currentBibleDay.id)} className="mt-5 w-full rounded-2xl bg-emerald-400 px-4 py-3 font-black text-slate-950 shadow-lg shadow-emerald-500/20">
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
                  <button type="button" onClick={addBibleReading} className="rounded-2xl bg-emerald-400 px-4 py-3 font-black text-slate-950 shadow-lg shadow-emerald-500/20">
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
              <p className="mt-2 text-sm text-slate-400">Pequeñas acciones para que la rutina no quede en deseo.</p>
              <div className="mt-5 flex gap-2">
                <input value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="Ej: ordenar escritorio" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50" />
                <button type="button" onClick={addTask} className="rounded-2xl bg-emerald-400 px-4 font-black text-slate-950">
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
              <h2 className="text-2xl font-black text-white">Cargar movimiento</h2>
              <p className="mt-2 text-sm text-slate-400">Anotá ingresos y gastos apenas pasen.</p>
              <div className="mt-5 grid gap-3">
                <select value={financeForm.type} onChange={(e) => setFinanceForm((f) => ({ ...f, type: e.target.value }))} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none">
                  <option>Gasto</option>
                  <option>Ingreso</option>
                </select>
                <select value={financeForm.category} onChange={(e) => setFinanceForm((f) => ({ ...f, category: e.target.value }))} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none">
                  {categories.map((cat) => <option key={cat}>{cat}</option>)}
                </select>
                <input value={financeForm.description} onChange={(e) => setFinanceForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600" />
                <input value={financeForm.amount} onChange={(e) => setFinanceForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Monto" type="number" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600" />
                <button type="button" onClick={addTransaction} className="rounded-2xl bg-emerald-400 px-4 py-3 font-black text-slate-950 shadow-lg shadow-emerald-500/20">
                  Agregar movimiento
                </button>
                <button type="button" onClick={clearFinances} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10">
                  Borrar movimientos
                </button>
              </div>
            </Card>

            <Card className="lg:col-span-7">
              <h3 className="text-lg font-black text-white">Gastos por categoría</h3>
              <p className="mt-1 text-sm text-slate-400">Para ver rápido por dónde se va la plata.</p>
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
