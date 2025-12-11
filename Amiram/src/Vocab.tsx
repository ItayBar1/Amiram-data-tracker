import React, { useEffect, useMemo, useState } from "react";
import { type Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
// Added Shuffle icon for the reshuffle button
import { Loader2, Plus, Trash2, History, Brain, Book, Shuffle } from "lucide-react";
import Swal from "sweetalert2";

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
  const [englishWord, setEnglishWord] = useState("");
  const [hebrewWord, setHebrewWord] = useState("");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // New state to hold the specific 9 words currently displayed in the grid
  const [displayedWords, setDisplayedWords] = useState<VocabWord[]>([]);

  useEffect(() => {
    fetchWords();
  }, [session]);

  // Effect: When the full word list changes (load/add/delete), select a new random set of 9
  useEffect(() => {
    if (words.length > 0) {
      reshuffleCards();
    } else {
      setDisplayedWords([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

  // Helper function to shuffle and pick 9 distinct words
  const reshuffleCards = () => {
    // Create a shallow copy to shuffle
    const shuffled = [...words];
    
    // Fisher-Yates Shuffle Algorithm for unbiased random selection
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Take the first 9 items (or less if there aren't 9 words yet)
    setDisplayedWords(shuffled.slice(0, 9));
    
    // Reset flipped state so new cards start facing front
    setFlippedCards({});
  };

  const fetchWords = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("user_words")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching words:", error);
      Swal.fire({
        text: "שגיאה בטעינת המילים",
        icon: "error",
        confirmButtonText: "אישור",
      });
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
        Swal.fire({
            text: "אנא מלא את שני השדות",
            icon: "warning",
            confirmButtonText: "הבנתי",
        });
        return;
    }

    const { data, error } = await supabase
      .from("user_words")
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
      Swal.fire({
        text: "שגיאה בהוספת המילה",
        icon: "error",
        confirmButtonText: "אישור",
      });
    } else if (data) {
      setWords((prev) => [data, ...prev]);
      setEnglishWord("");
      setHebrewWord("");
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      Toast.fire({
        icon: 'success',
        title: 'המילה נוספה בהצלחה'
      })
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "למחוק את המילה?",
      text: "הפעולה לא ניתנת לביטול",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "כן, מחק",
      cancelButtonText: "ביטול",
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase.from("user_words").delete().eq("id", id);

    if (error) {
      Swal.fire({
        text: "שגיאה במחיקת המילה",
        icon: "error",
        confirmButtonText: "הבנתי",
      });
    } else {
      setWords((prev) => prev.filter((item) => item.id !== id));
      Swal.fire({
        title: "נמחק!",
        text: "המילה הוסרה בהצלחה",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const toggleCard = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // We keep 'sortedWords' (full list) for the sidebar, while the grid uses 'displayedWords'
  const sortedWords = useMemo(() => words, [words]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-right" dir="rtl">
      {/* Header Section (Matching TrackerPage styling) */}
      <div className="bg-[#3b5bdb] pb-24 pt-10 px-4 relative shadow-lg">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            אוצר מילים אישי
          </h1>
          
          <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl min-w-[300px] mt-6">
            <p className="text-blue-100 text-sm mb-1">
              כמות המילים שנצברו
            </p>
            <h2 className="text-3xl font-bold text-white mb-1">
              {words.length}
            </h2>
            <p className="text-blue-200 text-sm">
              {words.length > 0 ? "המשך כך! תרגול מביא לשלמות 🧠" : "הוסף מילים כדי להתחיל לתרגל"}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Column - Cards & Add Form (Center/Right) */}
          <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
            
            {/* Flashcards Area */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
              
              {/* Header with Title and Reshuffle Button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                  <Brain className="text-blue-500" size={20} /> כרטיסיות תרגול
                </h2>

                {words.length > 0 && (
                    <button 
                        onClick={reshuffleCards}
                        className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-bold"
                        title="החלף מילים לתרגול"
                    >
                        <Shuffle size={16} />
                        ערבב מחדש
                    </button>
                )}
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <Loader2 className="animate-spin mr-2" /> טוען כרטיסיות...
                </div>
              ) : words.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Book size={48} className="mx-auto mb-4 opacity-20" />
                  <p>הרשימה ריקה. הוסף מילים למטה כדי לראות כרטיסיות.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Using displayedWords (random 9) instead of sortedWords (full list) */}
                  {displayedWords.map((word) => {
                    const isFlipped = flippedCards[word.id];
                    return (
                      <div
                        key={word.id}
                        className={`flashcard h-40 cursor-pointer select-none`}
                        onClick={() => toggleCard(word.id)}
                      >
                        <div
                          className={`flashcard-inner bg-white rounded-xl border border-gray-200 shadow-sm h-full hover:shadow-md transition-shadow ${
                            isFlipped ? "flipped" : ""
                          }`}
                        >
                          {/* Front - English */}
                          <div className="flashcard-face flex items-center justify-center h-full p-4">
                            <div className="text-center">
                              <p className="text-xs text-gray-400 mb-1 font-medium tracking-wider">ENGLISH</p>
                              <p className="text-lg font-bold text-gray-800" dir="ltr">
                                {word.english_word}
                              </p>
                            </div>
                          </div>
                          
                          {/* Back - Hebrew */}
                          <div className="flashcard-face flashcard-back flex items-center justify-center h-full p-4 bg-blue-50/50">
                            <div className="text-center">
                              <p className="text-xs text-blue-500 mb-1 font-medium">עברית</p>
                              <p className="text-lg font-bold text-blue-900" dir="rtl">
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

            {/* Add Word Form (Blue Bar Style) */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="bg-blue-600 p-2 rounded-full text-white">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900">הוספת מילה</h3>
                </div>
              </div>
              
              <form
                onSubmit={handleAddWord}
                className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center bg-white p-2 rounded-xl shadow-sm border border-blue-100"
              >
                <input
                  type="text"
                  dir="ltr"
                  placeholder="English Word"
                  className="bg-transparent outline-none px-3 py-1 w-full sm:w-40 text-sm font-medium"
                  value={englishWord}
                  onChange={(e) => setEnglishWord(e.target.value)}
                  required
                />
                <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="תרגום לעברית"
                  className="bg-transparent outline-none px-3 py-1 w-full sm:w-40 text-sm font-medium text-right"
                  value={hebrewWord}
                  onChange={(e) => setHebrewWord(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto shrink-0"
                >
                  שמור
                </button>
              </form>
            </div>
          </div>

          {/* Side Column - List (History Style) */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <History size={16} /> רשימת מילים ({words.length})
                </h3>
              </div>
              
              <div className="overflow-y-auto p-3 space-y-2 custom-scrollbar flex-1">
                {words.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                    אין מילים ברשימה
                  </div>
                ) : (
                    words.map((word) => (
                    <div
                        key={word.id}
                        className="group flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                    >
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center w-full">
                                <span className="font-bold text-gray-800 text-sm" dir="ltr">{word.english_word}</span>
                                <span className="text-sm text-gray-600">{word.hebrew_word}</span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                                {formatDate(word.created_at)}
                            </span>
                        </div>
                        
                        <div className="mr-3 border-r border-gray-200 pr-2">
                            <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(word.id);
                            }}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            title="מחק מילה"
                            >
                            <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default VocabPage;