"use client";

import { useState } from "react";
import { ShieldCheck, User, Sparkles, SlidersHorizontal, Loader2, CheckCircle2 } from "lucide-react";
import { UserProfile } from "@/types";

interface RoleSwitcherProps {
  currentRole?: string;
  onRoleChange?: (newRole: "superadmin" | "user") => void;
  className?: string;
}

export function RoleSwitcher({
  currentRole = "superadmin",
  onRoleChange,
  className = "",
}: RoleSwitcherProps) {
  const [activeRole, setActiveRole] = useState<string>(currentRole);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isAdmin = activeRole === "superadmin" || activeRole === "admin";

  const handleSwitchRole = async (targetRole: "superadmin" | "user") => {
    if (targetRole === (isAdmin ? "superadmin" : "user") && activeRole) {
      return; // Already in this role
    }

    try {
      setIsUpdating(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });

      const data = await res.json();
      if (data.ok && data.data) {
        setActiveRole(targetRole);
        if (onRoleChange) {
          onRoleChange(targetRole);
        }

        // Broadcast profile update event to Sidebar and other components
        window.dispatchEvent(
          new CustomEvent("tatadana-profile-updated", {
            detail: data.data,
          })
        );
        window.dispatchEvent(new Event("storage"));

        const msg =
          targetRole === "user"
            ? "POV beralih ke User Biasa: Menu 'Superadmin Desk' otomatis disembunyikan dari navigasi."
            : "POV beralih ke Admin: Menu 'Superadmin Desk' aktif dan dapat dibuka.";

        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(data.error || "Gagal mengubah role");
      }
    } catch (err: any) {
      alert(`Error switching role: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`relative flex flex-col items-end gap-1.5 ${className}`}>
      {/* Dev Switcher Pill Container */}
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-1.5 rounded-2xl border border-slate-800 shadow-luxury flex items-center gap-1.5 select-none">
        {/* Label Tag */}
        <div className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-r border-slate-800">
          <SlidersHorizontal className="w-3.5 h-3.5 text-tangerine" />
          <span className="hidden sm:inline">Role Dev</span>
        </div>

        {/* Toggle Option 1: Admin / Superadmin */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleSwitchRole("superadmin")}
          title="Beralih ke hak akses Admin / Superadmin (Superadmin Desk ditampilkan)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
            isAdmin
              ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          {isUpdating && isAdmin ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <ShieldCheck className={`w-3.5 h-3.5 ${isAdmin ? "text-amber-300" : "text-slate-400"}`} />
          )}
          <span>Admin</span>
          {isAdmin && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse hidden sm:inline-block" />
          )}
        </button>

        {/* Toggle Option 2: Standard User */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleSwitchRole("user")}
          title="Beralih ke POV User Biasa (Superadmin Desk disembunyikan)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
            !isAdmin
              ? "bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          {isUpdating && !isAdmin ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <User className={`w-3.5 h-3.5 ${!isAdmin ? "text-emerald-300" : "text-slate-400"}`} />
          )}
          <span>User POV</span>
          {!isAdmin && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block" />
          )}
        </button>
      </div>

      {/* Dynamic Toast Feedback Pill */}
      {toastMessage && (
        <div className="absolute top-full right-0 mt-2 z-50 bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-700 text-[11px] font-medium shadow-2xl flex items-center gap-2 animate-fadeIn max-w-sm whitespace-normal">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-200">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
