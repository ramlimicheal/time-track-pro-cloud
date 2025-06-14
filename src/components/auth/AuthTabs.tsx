
import { useState } from "react";
import { User, Shield } from "lucide-react";

interface AuthTabsProps {
  activeTab: "employee" | "admin";
  onTabChange: (tab: "employee" | "admin") => void;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex bg-gray-100/80 backdrop-blur-sm rounded-xl p-1 mb-6">
      <button
        className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all duration-300 flex-1 justify-center relative overflow-hidden group ${
          activeTab === "employee"
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
            : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
        }`}
        onClick={() => onTabChange("employee")}
      >
        {activeTab === "employee" && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/20 animate-pulse"></div>
        )}
        <User size={18} className={`relative z-10 transition-transform duration-300 ${
          activeTab === "employee" ? "scale-110" : "group-hover:scale-105"
        }`} />
        <span className="relative z-10">Employee Login</span>
        {activeTab === "employee" && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white/60 rounded-full"></div>
        )}
      </button>
      
      <button
        className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all duration-300 flex-1 justify-center relative overflow-hidden group ${
          activeTab === "admin"
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105"
            : "text-gray-600 hover:text-red-600 hover:bg-white/50"
        }`}
        onClick={() => onTabChange("admin")}
      >
        {activeTab === "admin" && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 animate-pulse"></div>
        )}
        <Shield size={18} className={`relative z-10 transition-transform duration-300 ${
          activeTab === "admin" ? "scale-110" : "group-hover:scale-105"
        }`} />
        <span className="relative z-10">Admin Login</span>
        {activeTab === "admin" && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white/60 rounded-full"></div>
        )}
      </button>
    </div>
  );
};
