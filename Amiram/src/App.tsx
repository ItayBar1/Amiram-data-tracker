import React, { useEffect, useState } from "react";
import { type Session } from "@supabase/supabase-js";
import { BarChart3, BookOpen, LogOut } from "lucide-react";
import Auth from "./Auth";
import TrackerPage from "./TrackerPage";
import VocabPage from "./Vocab";
import { supabase } from "./supabase";

const NavItem: React.FC<{
  label: string;
  path: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: (path: string) => void;
}> = ({ label, path, icon: Icon, isActive, onClick }) => (
  <button
    onClick={() => onClick(path)}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
      isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path === currentPath) return;
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        טוען...
      </div>
    );

  if (!session) return <Auth />;

  const isVocab = currentPath === "/vocab" || currentPath === "/words";

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xl font-extrabold text-blue-700">Amiram</div>
            <div className="flex gap-2">
              <NavItem
                label="דשבורד"
                path="/"
                icon={BarChart3}
                isActive={!isVocab}
                onClick={navigate}
              />
              <NavItem
                label="אוצר מילים"
                path="/vocab"
                icon={BookOpen}
                isActive={isVocab}
                onClick={navigate}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">שלום, {session.user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-700 hover:text-red-600 px-3 py-1 rounded-lg hover:bg-gray-50"
            >
              <LogOut size={16} /> התנתק
            </button>
          </div>
        </div>
      </header>

      {isVocab ? <VocabPage session={session} /> : <TrackerPage session={session} />}
    </div>
  );
}
