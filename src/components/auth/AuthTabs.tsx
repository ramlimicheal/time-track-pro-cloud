
import { useState } from "react";
import { User } from "lucide-react";

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
            ? "border-b-2 border-timetrack-blue text-timetrack-blue font-medium"
            : "text-gray-500"
        }`}
        onClick={() => onTabChange("employee")}
      >
        <User size={18} />
        Employee Login
      </button>
      <button
        className={`flex items-center gap-2 py-2 px-4 ${
          activeTab === "admin"
            ? "border-b-2 border-timetrack-blue text-timetrack-blue font-medium"
            : "text-gray-500"
        }`}
        onClick={() => onTabChange("admin")}
      >
        <User size={18} />
        Admin Login
      </button>
    </div>
  );
};
