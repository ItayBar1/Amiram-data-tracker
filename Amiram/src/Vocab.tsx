import React, { useEffect, useMemo, useState } from "react";
import { type Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { Loader2, Plus, RefreshCcw } from "lucide-react";

export type VocabWord = {
  id: string;
  user_id: string;
  english_word: string;
  hebrew_word: string;
  created_at: string;
};

interface VocabPageProps {
  session: Session;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const VocabPage: React.FC<VocabPageProps> = ({ session }) => {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [englishWord, setEnglishWord] = useState("");
  const [hebrewWord, setHebrewWord] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "cards">("list");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchWords();
  }, [session]);

  const fetchWords = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("vocab_words")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError("שגיאה בטעינת אוצר המילים. נסה שוב מאוחר יותר.");
    } else if (data) {
      setWords(data);
    }

    setIsLoading(false);
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEnglish = englishWord.trim();
    const trimmedHebrew = hebrewWord.trim();

    if (!trimmedEnglish || !trimmedHebrew) {
      setError("אנא מלא את שני השדות לפני ההוספה.");
      return;
    }

    setError(null);

    const { data, error } = await supabase
      .from("vocab_words")
      .insert([
        {
          english_word: trimmedEnglish,
          hebrew_word: trimmedHebrew,
          user_id: session.user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      setError("שגיאה בהוספת המילה. אנא נסה שוב.");
      return;
    }

    if (data) {
      setWords((prev) => [data, ...prev]);
      setEnglishWord("");
      setHebrewWord("");
    }
  };

  const toggleCard = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sortedWords = useMemo(() => words, [words]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">אוצר מילים</h1>
        <p className="text-gray-600">
          שמור, ארגן ושנן מילים חדשות בעזרת טבלת מילים וכרטיסיות הפוכות.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-blue-50 text-blue-600">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">הוספת מילה חדשה</h2>
              <p className="text-sm text-gray-500">שני השדות הם חובה.</p>
            </div>
          </div>

          <form onSubmit={handleAddWord} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                English word
              </label>
              <input
                type="text"
                dir="ltr"
                value={englishWord}
                onChange={(e) => setEnglishWord(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="example"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מילה בעברית
              </label>
              <input
                type="text"
                dir="rtl"
                value={hebrewWord}
                onChange={(e) => setHebrewWord(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="דוגמה"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> הוסף מילה
              </button>
              <button
                type="button"
                onClick={fetchWords}
                className="border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCcw size={16} /> רענן
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
              <button
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === "list"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("list")}
              >
                רשימה
              </button>
              <button
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === "cards"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("cards")}
              >
                כרטיסיות
              </button>
            </div>

            <div className="text-sm text-gray-500">
              סה"כ מילים: <span className="font-bold text-gray-800">{words.length}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="animate-spin mr-2" /> טוען אוצר מילים...
            </div>
          ) : words.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              לא הוספת עדיין מילים.
            </div>
          ) : activeTab === "list" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50 text-right text-sm text-gray-500">
                    <th className="px-4 py-3 font-semibold">אנגלית</th>
                    <th className="px-4 py-3 font-semibold">עברית</th>
                    <th className="px-4 py-3 font-semibold">תאריך יצירה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {sortedWords.map((word) => (
                    <tr key={word.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900" dir="ltr">
                        {word.english_word}
                      </td>
                      <td className="px-4 py-3 text-gray-800" dir="rtl">
                        {word.hebrew_word}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(word.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedWords.map((word) => {
                const isFlipped = flippedCards[word.id];
                return (
                  <div
                    key={word.id}
                    className={`flashcard h-44 cursor-pointer`}
                    onClick={() => toggleCard(word.id)}
                  >
                    <div
                      className={`flashcard-inner bg-white rounded-2xl border border-gray-100 shadow-sm h-full ${
                        isFlipped ? "flipped" : ""
                      }`}
                    >
                      <div className="flashcard-face flex items-center justify-center h-full p-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-2">English</p>
                          <p className="text-xl font-bold text-gray-900" dir="ltr">
                            {word.english_word}
                          </p>
                        </div>
                      </div>
                      <div className="flashcard-face flashcard-back flex items-center justify-center h-full p-4 bg-blue-50">
                        <div className="text-center">
                          <p className="text-xs text-blue-500 mb-2">עברית</p>
                          <p className="text-xl font-bold text-blue-900" dir="rtl">
                            {word.hebrew_word}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabPage;
