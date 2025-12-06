import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import {
  Download,
  Plus,
  Trash2,
  Trophy,
  Calendar,
  History,
  TrendingUp,
  BarChart2,
  LogOut,
} from "lucide-react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import Swal from "sweetalert2";

// --- Types ---
interface ScoreData {
  id?: number; // הוספנו ID שמגיע מהדאטהבייס
  date: string;
  score: number;
}

interface LevelData {
  min: number;
  max: number;
  name: string;
  courses: number;
  color: string;
  bg: string;
  barColor: string;
}

// --- Constants ---
const LEVELS: LevelData[] = [
  {
    min: 134,
    max: 150,
    name: "פטור מלא",
    courses: 0,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    barColor: "bg-emerald-400",
  },
  {
    min: 120,
    max: 133,
    name: "מתקדמים ב'",
    courses: 1,
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    barColor: "bg-yellow-400",
  },
  {
    min: 100,
    max: 119,
    name: "מתקדמים א'",
    courses: 2,
    color: "text-orange-700",
    bg: "bg-orange-50",
    barColor: "bg-orange-400",
  },
  {
    min: 85,
    max: 99,
    name: "בסיסי",
    courses: 3,
    color: "text-red-700",
    bg: "bg-red-50",
    barColor: "bg-red-400",
  },
  {
    min: 0,
    max: 84,
    name: "טרום בסיסי",
    courses: 4,
    color: "text-gray-700",
    bg: "bg-gray-50",
    barColor: "bg-gray-300",
  },
];

const getLevelInfo = (score: number) =>
  LEVELS.find((l) => score >= l.min && score <= l.max) ||
  LEVELS[LEVELS.length - 1];

// --- Sub-Components ---
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass?: string;
}> = ({ title, value, icon: Icon, colorClass = "text-gray-900" }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-300">
    <div>
      <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
      <h3 className={`text-3xl font-bold ${colorClass}`}>{value}</h3>
    </div>
    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
      <Icon size={24} />
    </div>
  </div>
);

// --- Main Component ---
export default function AmiramTracker() {
  const [session, setSession] = useState<any>(null);
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newScore, setNewScore] = useState("");

  // 1. בדיקת התחברות
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchScores();
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchScores();
      else setScores([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. שליפת נתונים מה-DB
  const fetchScores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .order("date", { ascending: true });

    if (!error && data) setScores(data);
    setLoading(false);
  };

  // 3. הוספת ציון ל-DB
  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newScore || !session) return;

    const numScore = Number(newScore);
    if (numScore < 50 || numScore > 150)
      return Swal.fire({
        text: "אנא הזן ציון בין 50 ל-150",
        icon: "error",
        confirmButtonText: "אישור",
      });

    const { data, error } = await supabase
      .from("scores")
      .insert([{ user_id: session.user.id, date: newDate, score: numScore }])
      .select();

    if (error)
      Swal.fire({
        text: "שגיאה בהוספת הציון",
        icon: "error",
        confirmButtonText: "אישור",
      });
    else if (data) {
      setScores((prev) => [...prev, data[0]]);
      setNewScore("");
    }
  };

  // 4. מחיקה מה-DB
  const handleDelete = async (id: number) => {
    if (!confirm("למחוק?")) return;

    const { error } = await supabase.from("scores").delete().eq("id", id);

    if (error)
      Swal.fire({
        text: "שגיאה במחיקת הציון",
        icon: "warning",
        confirmButtonText: "הבנתי",
        confirmButtonColor: "#d33",
      });
    else setScores((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- חישובים (ללא שינוי) ---
  const sortedScores = useMemo(
    () =>
      [...scores].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    [scores]
  );

  const stats = useMemo(() => {
    if (scores.length === 0) return null;
    const values = scores.map((s) => Number(s.score));
    const maxScore = Math.max(...values);
    const avgScore = (
      values.reduce((a, b) => a + b, 0) / values.length
    ).toFixed(1);
    const lastScore = values[values.length - 1];
    const last3 = sortedScores.slice(-3);
    const last3Avg =
      last3.length > 0
        ? last3.reduce((sum, item) => sum + Number(item.score), 0) /
          last3.length
        : 0;
    return {
      maxScore,
      avgScore,
      lastScore,
      last3Avg: last3Avg.toFixed(1),
      currentStatus: getLevelInfo(last3Avg),
      count: scores.length,
    };
  }, [scores, sortedScores]);

  // אם לא מחובר - הצג מסך התחברות
  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-right" dir="rtl">
      {/* Header with Logout */}
      <div className="bg-[#3b5bdb] pb-24 pt-6 px-4 relative shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-start mb-4 text-white">
          <div className="text-sm opacity-80">שלום, {session.user.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
          >
            <LogOut size={16} /> התנתק
          </button>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            הדרך לפטור באנגלית
          </h1>

          {/* Main Status Badge */}
          <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl min-w-[300px] mt-6">
            <p className="text-blue-100 text-sm mb-1">
              המצב הנוכחי (לפי ממוצע 3 אחרונים)
            </p>
            <h2 className="text-3xl font-bold text-white mb-1">
              {stats?.currentStatus?.name || "--"}
            </h2>
            <p className="text-blue-200 text-sm">
              {stats?.currentStatus?.courses === 0
                ? "כל הכבוד! הגעת ליעד 🏆"
                : stats
                ? `${stats.currentStatus.courses} קורסים להשלמה`
                : "הזן נתונים כדי להתחיל"}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 pb-12">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="ימי תרגול"
            value={stats?.count || 0}
            icon={Calendar}
          />
          <StatCard
            title="מבחן אחרון"
            value={stats?.lastScore || "-"}
            icon={History}
          />
          <StatCard
            title="ציון שיא"
            value={stats?.maxScore || "-"}
            icon={Trophy}
            colorClass="text-emerald-600"
          />
          <StatCard
            title="ממוצע כולל"
            value={stats?.avgScore || "-"}
            icon={BarChart2}
            colorClass="text-blue-600"
          />
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Right Column (Graph) */}
          <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-6">
                <TrendingUp className="text-blue-500" size={20} /> גרף התקדמות
              </h2>
              <div className="h-[350px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={sortedScores}
                    margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => {
                        const date = new Date(d);
                        return `${date.getDate()}.${date.getMonth() + 1}`;
                      }}
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      domain={[50, 150]}
                      orientation="left"
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        direction: "rtl",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                      labelFormatter={(l) =>
                        new Date(l).toLocaleDateString("he-IL")
                      }
                    />

                    <ReferenceArea
                      y1={134}
                      y2={150}
                      fill="#dcfce7"
                      fillOpacity={0.4}
                      strokeOpacity={0}
                    />
                    <ReferenceArea
                      y1={120}
                      y2={134}
                      fill="#fef9c3"
                      fillOpacity={0.4}
                      strokeOpacity={0}
                    />
                    <ReferenceArea
                      y1={100}
                      y2={120}
                      fill="#ffedd5"
                      fillOpacity={0.4}
                      strokeOpacity={0}
                    />
                    <ReferenceArea
                      y1={85}
                      y2={100}
                      fill="#fee2e2"
                      fillOpacity={0.4}
                      strokeOpacity={0}
                    />
                    <ReferenceArea
                      y1={50}
                      y2={85}
                      fill="#f3f4f6"
                      fillOpacity={0.4}
                      strokeOpacity={0}
                    />

                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        fill: "#fff",
                        stroke: "#2563eb",
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Add Score Form */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="bg-blue-600 p-2 rounded-full text-white">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900">הוספת ציון חדש</h3>
                </div>
              </div>
              <form
                onSubmit={handleAddScore}
                className="flex gap-3 w-full sm:w-auto items-center bg-white p-2 rounded-xl shadow-sm border border-blue-100"
              >
                <input
                  type="number"
                  placeholder="ציון (50-150)"
                  className="bg-transparent outline-none px-2 w-28 text-sm font-medium"
                  min="50"
                  max="150"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  required
                />
                <div className="w-px h-6 bg-gray-200"></div>
                <input
                  type="date"
                  className="bg-transparent outline-none px-2 text-sm text-gray-500"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  שמור
                </button>
              </form>
            </div>
          </div>

          {/* Left Column (History) */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[500px]">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <History size={16} /> היסטוריה
                </h3>
              </div>
              <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {[...sortedScores].reverse().map((item) => {
                  const info = getLevelInfo(item.score);
                  return (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit mb-1 ${info.bg} ${info.color}`}
                        >
                          {info.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.date).toLocaleDateString("he-IL")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-gray-800">
                          {item.score}
                        </span>
                        <button
                          onClick={() => item.id && handleDelete(item.id)}
                          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {scores.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    אין נתונים עדיין
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
