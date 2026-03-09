"use client";

import React, { useState, useEffect } from "react";
import {
  HardDrive,
  Monitor,
  Users,
  Clock,
  Trash2,
  Star,
  RefreshCw,
  Cloud,
  Settings,
  Bell,
  HelpCircle,
  Search,
  LayoutGrid,
  Info,
  Menu,
  FileText,
  FileSpreadsheet,
  X,
  Moon,
  Sun,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/providers/ThemeProvider";

// Header Component (Internal to be used in Layout)
const Header = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const searchablePages = [
    { name: "Dashboard", href: "/", icon: HardDrive, description: "Main Overview" },
    { name: "Syllabus", href: "/syllabus", icon: BookOpen, description: "Exam Syllabi & Topics" },
    { name: "Content Maker", href: "/content-maker", icon: FileText, description: "Create Content from PDFs" },
    { name: "APS/PS Full Mock", href: "/api-full-mock", icon: FileSpreadsheet, description: "Generate & Edit Mock Tests" },
    { name: "Topic Wise Mock", href: "/topic-wise-mock", icon: BookOpen, description: "Custom Subject Mock Tests" },
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchablePages.filter(page => 
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowResults(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-white dark:bg-gray-800 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        className="p-2 mr-4 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full md:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl hidden md:block search-container relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors duration-300" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowResults(true)}
            className="block w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 shadow-sm hover:shadow-md"
            placeholder="Search Drive..."
          />
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery("");
                setShowResults(false);
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto z-50">
            {searchResults.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Pages & Features
                </div>
                {searchResults.map((result, index) => (
                  <Link 
                    key={index} 
                    href={result.href}
                    onClick={() => {
                      setShowResults(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg mr-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                      <result.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{result.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{result.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4 md:space-x-6 ml-auto md:ml-8">
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </button>
        <button className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400">
          <Bell className="h-6 w-6" />
        </button>
        <button className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400">
          <HelpCircle className="h-6 w-6" />
        </button>
        <button className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400">
          <Settings className="h-6 w-6" />
        </button>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Jessica</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 cursor-pointer hover:scale-105 transition-transform duration-300">
            J
          </div>
        </div>
      </div>
    </header>
  );
};

// Sidebar Component
const Sidebar = ({ className = "", onClose }) => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("My Drive");

  const menuItems = [
    { name: "Dashboard", icon: HardDrive, href: "/" },
    { name: "Syllabus", icon: BookOpen, href: "/syllabus" },
    { name: "Content Maker", icon: FileText, href: "/content-maker" },
    { name: "APS/PS Full Mock", icon: FileSpreadsheet, href: "/api-full-mock" },
    { name: "Topic Wise Mock", icon: BookOpen, href: "/topic-wise-mock" },
  ];

  useEffect(() => {
    const item = menuItems.find((item) => item.href === pathname);
    if (item) {
      setActiveItem(item.name);
    }
  }, [pathname]);

  return (
    <div className={`w-72 bg-blue-600 dark:bg-gray-900 text-white flex flex-col h-screen relative overflow-hidden rounded-tr-[50px] transition-all duration-300 ${className}`}>
        {/* Mobile Close Button */}
        {onClose && (
            <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white md:hidden">
                <X className="h-6 w-6" />
            </button>
        )}

        {/* Background Decorative Circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-400 dark:bg-blue-800 blur-3xl"></div>
        </div>

      {/* Logo Area */}
      <div className="p-8 flex items-center space-x-3 z-10">
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg transition-colors duration-300">
             <Cloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <Link href="/">
          <h1 className="text-2xl font-bold tracking-tight cursor-pointer">Rapid Drive</h1>
        </Link>
      </div>


      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto z-10 custom-scrollbar">
        {menuItems.map((item) => (
          item.href ? (
            <Link key={item.name} href={item.href}>
               <div
                onClick={() => setActiveItem(item.name)}
                className={`w-full flex items-center space-x-4 px-6 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden cursor-pointer
                  ${
                    activeItem === item.name
                      ? "bg-gradient-to-r from-green-400 to-green-600 dark:from-green-600 dark:to-green-800 shadow-lg shadow-green-900/20 text-white"
                      : "text-blue-100 dark:text-gray-400 hover:bg-gradient-to-r hover:from-green-400 hover:to-green-600 dark:hover:from-green-600 dark:hover:to-green-800 hover:text-white hover:shadow-md"
                  }
                `}
              >
                <item.icon className={`h-5 w-5 ${activeItem === item.name ? "text-white" : "text-blue-200 dark:text-gray-500 group-hover:text-white"}`} />
                <span className="font-medium tracking-wide">{item.name}</span>
                
                {/* Active Indicator Line */}
                {activeItem === item.name && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white rounded-r-full"></div>
                )}
              </div>
            </Link>
          ) : (
            <button
              key={item.name}
              onClick={() => setActiveItem(item.name)}
              className={`w-full flex items-center space-x-4 px-6 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
                ${
                  activeItem === item.name
                    ? "bg-gradient-to-r from-green-400 to-green-600 dark:from-green-600 dark:to-green-800 shadow-lg shadow-green-900/20 text-white"
                    : "text-blue-100 dark:text-gray-400 hover:bg-gradient-to-r hover:from-green-400 hover:to-green-600 dark:hover:from-green-600 dark:hover:to-green-800 hover:text-white hover:shadow-md"
                }
              `}
            >
              <item.icon className={`h-5 w-5 ${activeItem === item.name ? "text-white" : "text-blue-200 dark:text-gray-500 group-hover:text-white"}`} />
              <span className="font-medium tracking-wide">{item.name}</span>
              
              {/* Active Indicator Line */}
              {activeItem === item.name && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white rounded-r-full"></div>
              )}
            </button>
          )
        ))}
      </nav>

    </div>
  );
};

// Main Layout Component
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-300">
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
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900 h-screen w-full transition-colors duration-300">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-4 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
