import React, { useState } from "react";
import { supabase } from "./supabase";
import { Target, Lock, Mail, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Swal.fire({
          title: "ההרשמה בוצעה בהצלחה!",
          text: "נשלח אליך מייל לאישור החשבון. עליך לאשר את הכתובת לפני שתוכל להתחבר.",
          icon: "success",
          confirmButtonText: "מעבר להתחברות",
          confirmButtonColor: "#3085d6",
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            window.location.href = "/login";
          }
        });
      }
    } catch (error: any) {
      if (
        error.message === "Email not confirmed" ||
        error.response.data === "Email not confirmed"
      ) {
        Swal.fire({
          title: "דרוש אישור מייל",
          text: "טרם אישרת את כתובת המייל שלך. אנא בדוק את תיבת הדואר ולחץ על הקישור שנשלח אליך.",
          icon: "warning",
          confirmButtonText: "הבנתי",
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          title: "שגיאה בהתחברות",
          text: "שם המשתמש או הסיסמה שגויים",
          icon: "error",
          confirmButtonText: "נסה שוב",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Target size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ברוכים הבאים</h1>
          <p className="text-gray-500 mt-2">מערכת מעקב מבחן אמיר״ם</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              אימייל
            </label>
            <div className="relative">
              <Mail
                className="absolute right-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סיסמה
            </label>
            <div className="relative">
              <Lock
                className="absolute right-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="******"
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {isLogin ? "התחבר" : "הרשם"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "אין לך חשבון? " : "יש לך כבר חשבון? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-bold hover:underline"
          >
            {isLogin ? "הירשם כאן" : "התחבר כאן"}
          </button>
        </div>
      </div>
    </div>
  );
}
