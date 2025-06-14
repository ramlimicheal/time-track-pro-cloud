
import { useState } from "react";
import { User, Shield } from "lucide-react";

interface AuthTabsProps {
  activeTab: "employee" | "admin";
  onTabChange: (tab: "employee" | "admin") => void;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        className={`flex items-center gap-2 py-2 px-4 ${
          activeTab === "employee"
            ? "border-b-2 border-timetrack-blue text-timetrack-blue font-medium bg-blue-50"
            : "text-gray-500 hover:text-timetrack-blue"
        }`}
        onClick={() => onTabChange("employee")}
      >
        <User size={18} />
        Employee Login
      </button>
      <button
        className={`flex items-center gap-2 py-2 px-4 ${
          activeTab === "admin"
            ? "border-b-2 border-red-600 text-red-600 font-medium bg-red-50"
            : "text-gray-500 hover:text-red-600"
        }`}
        onClick={() => onTabChange("admin")}
      >
        <Shield size={18} />
        Admin Login
      </button>
    </div>
  );
};
