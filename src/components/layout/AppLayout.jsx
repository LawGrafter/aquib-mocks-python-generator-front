"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Settings,
  Menu,
  FileText,
  FileSpreadsheet,
  X,
  BookOpen,
  Trophy,
  GraduationCap,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

// Sidebar Component
const Sidebar = ({ className = "", onClose }) => {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Syllabus", icon: BookOpen, href: "/syllabus" },
    { name: "AHC Challenge", icon: Trophy, href: "/ahc-challenge" },
    { name: "Content Maker", icon: FileText, href: "/content-maker" },
    { name: "APS/PS Full Mock", icon: FileSpreadsheet, href: "/api-full-mock" },
    { name: "Topic Wise Mock", icon: GraduationCap, href: "/topic-wise-mock" },
  ];

  return (
    <div className={`w-72 bg-white dark:bg-gray-900 flex flex-col h-screen relative overflow-hidden border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${className}`}>
        {onClose && (
            <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 text-gray-400 hover:text-gray-600 md:hidden">
                <X className="h-6 w-6" />
            </button>
        )}

      {/* Logo */}
      <div className="px-4 pt-5 pb-3 z-10">
        <Link href="/">
          <img
            src="https://ik.imagekit.io/rapidsteno/469f2304-88c0-41aa-9c24-f064049e3015.jpg?updatedAt=1773021702704"
            alt="Rapid Steno"
            className="w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
          />
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-6 mb-4 border-t border-gray-200 dark:border-gray-700"></div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto z-10 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = item.href === pathname;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`w-full flex items-center space-x-4 px-5 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden cursor-pointer
                  ${isActive
                    ? "bg-brand text-white shadow-lg shadow-brand/25"
                    : "text-gray-600 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand/10 hover:text-brand"
                  }
                `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400 dark:text-gray-500 group-hover:text-brand"}`} />
                <span className="font-medium text-sm tracking-wide">{item.name}</span>
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 bg-white rounded-r-full"></div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 z-10 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={() => { if (typeof window !== 'undefined') { localStorage.removeItem('rs_auth'); window.location.href = '/login'; } }}
          className="w-full flex items-center space-x-3 px-5 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all cursor-pointer group"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
        <div className="flex items-center space-x-3 px-3 py-1">
          <Settings className="h-4 w-4 text-gray-300 dark:text-gray-600" />
          <span className="text-xs text-gray-400 dark:text-gray-600">Mock Generator v2.0</span>
        </div>
      </div>
    </div>
  );
};

// Main Layout Component
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans overflow-hidden transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Left (Mobile: Off-canvas, Desktop: Static) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950 h-screen w-full transition-colors duration-300">
        {/* Mobile-only menu button */}
        <div className="md:hidden flex items-center px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-full">
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-4 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
