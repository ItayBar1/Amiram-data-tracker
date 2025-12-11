import React, { useEffect, useState } from "react"; 

import { type Session } from "@supabase/supabase-js"; 

import { BarChart3, BookOpen, LogOut, User } from "lucide-react"; 

import Auth from "./Auth"; 

import TrackerPage from "./TrackerPage"; 

import VocabPage from "./Vocab"; 

import { supabase } from "./supabase"; 

 

// --- רכיב כפתור ניווט לדסקטופ --- 

const DesktopNavItem: React.FC<{ 

  label: string; 

  path: string; 

  icon: React.ElementType; 

  isActive: boolean; 

  onClick: (path: string) => void; 

}> = ({ label, path, icon: Icon, isActive, onClick }) => ( 

  <button 

    onClick={() => onClick(path)} 

    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${ 

      isActive 

        ? "bg-blue-600 text-white shadow-md shadow-blue-200" 

        : "text-gray-500 hover:bg-gray-50 hover:text-blue-600" 

    }`} 

  > 

    <Icon size={18} /> 

    {label} 

  </button> 

); 

 

// --- רכיב כפתור ניווט למובייל (תחתון) --- 

const MobileNavItem: React.FC<{ 

  label: string; 

  path: string; 

  icon: React.ElementType; 

  isActive: boolean; 

  onClick: (path: string) => void; 

}> = ({ label, path, icon: Icon, isActive, onClick }) => ( 

  <button 

    onClick={() => onClick(path)} 

    className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${ 

      isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600" 

    }`} 

  > 

    <div className={`p-1 rounded-full ${isActive ? "bg-blue-50" : ""}`}> 

      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} /> 

    </div> 

    <span className="text-[10px] font-medium mt-1">{label}</span> 

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

      <div className="min-h-screen flex items-center justify-center text-gray-600 bg-[#f3f4f6]"> 

        טוען... 

      </div> 

    ); 

 

  if (!session) return <Auth />; 

 

  const isVocab = currentPath === "/vocab" || currentPath === "/words"; 

 

  return ( 

    <div className="min-h-screen bg-[#f3f4f6] pb-20 md:pb-0"> 

       

      {/* --- HEADER DESKTOP (מוסתר במובייל) --- */} 

      <header className="hidden md:block bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50"> 

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"> 

          <div className="flex items-center gap-8"> 

            <div className="text-2xl font-extrabold text-blue-700 tracking-tight"> 

              Amiram 

            </div> 

            <div className="flex gap-2 bg-gray-50/50 p-1 rounded-2xl border border-gray-100"> 

              <DesktopNavItem 

                label="דשבורד" 

                path="/" 

                icon={BarChart3} 

                isActive={!isVocab} 

                onClick={navigate} 

              /> 

              <DesktopNavItem 

                label="אוצר מילים" 

                path="/vocab" 

                icon={BookOpen} 

                isActive={isVocab} 

                onClick={navigate} 

              /> 

            </div> 

          </div> 

          <div className="flex items-center gap-4"> 

            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100"> 

              <User size={14} /> 

              <span className="max-w-[150px] truncate" dir="ltr">{session.user.email}</span> 

            </div> 

            <button 

              onClick={handleLogout} 

              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors" 

            > 

              <LogOut size={18} /> 

              <span>התנתק</span> 

            </button> 

          </div> 

        </div> 

      </header> 

 

      {/* --- HEADER MOBILE (מוסתר בדסקטופ) --- */} 

      <header className="md:hidden bg-white shadow-sm border-b border-gray-100 px-4 py-3 flex justify-between items-center sticky top-0 z-50"> 

        <div className="text-xl font-extrabold text-blue-700">Amiram</div> 

        <button 

          onClick={handleLogout} 

          className="text-gray-400 hover:text-red-500 p-2" 

        > 

          <LogOut size={20} /> 

        </button> 

      </header> 

 

      {/* --- CONTENT --- */} 

      {isVocab ? ( 

        <VocabPage session={session} /> 

      ) : ( 

        <TrackerPage session={session} /> 

      )} 

 

      {/* --- BOTTOM NAVIGATION MOBILE (מוסתר בדסקטופ) --- */} 

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center h-16"> 

        <MobileNavItem 

          label="ראשי" 

          path="/" 

          icon={BarChart3} 

          isActive={!isVocab} 

          onClick={navigate} 

        /> 

        <div className="w-px h-8 bg-gray-100"></div> 

        <MobileNavItem 

          label="מילים" 

          path="/vocab" 

          icon={BookOpen} 

          isActive={isVocab} 

          onClick={navigate} 

        /> 

      </nav> 

    </div> 

  ); 

} 
