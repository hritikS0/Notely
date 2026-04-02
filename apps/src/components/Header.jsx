import React, { useState } from "react";
import { FaRegUserCircle, FaSearch } from "react-icons/fa";
import ProfileDropDown from "./ProfileDropDown";
import { useAuthStore } from "../store/auth.store";

const Header = ({ searchValue, onSearchChange, filterValue, onFilterChange }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const toggleProfile = () => setIsProfileOpen((open) => !open);
  const closeProfile = () => setIsProfileOpen(false);
const userName = user?.name || "Guest";
  return (
    // MAKE NAV STICKY
    <nav className="sticky top-0 z-50 flex flex-col gap-4 rounded-xl border border-white/10 bg-[#10141b] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-6">
      <div>
        <div className="inline-flex items-baseline gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Notely</h1>
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40 sm:text-xs">studio</span>
        </div>
        <p className="mt-2 max-w-md text-xs text-white/50 sm:text-sm">
          A playful space to keep ideas, lists, and tiny sparks organized.
        </p>
      </div>
      <div className="flex w-full flex-1 flex-col gap-3 sm:mx-4 sm:max-w-sm">
        <div className="relative w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs" />
          <input
            type="text"
            placeholder="Search your sparks..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white outline-none focus:border-white/20 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => onFilterChange("all")}
            className={`whitespace-nowrap rounded-full border border-white/10 px-3 py-1 text-white/60 hover:bg-white/10 ${filterValue === "all" ? "bg-white/10 text-white" : ""}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("pinned")}
            className={`whitespace-nowrap rounded-full border border-white/10 px-3 py-1 text-white/60 hover:bg-white/10 ${filterValue === "pinned" ? "bg-white/10 text-white" : ""}`}
          >
            Pinned
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("shared")}
            className={`whitespace-nowrap rounded-full border border-white/10 px-3 py-1 text-white/60 hover:bg-white/10 ${filterValue === "shared" ? "bg-white/10 text-white" : ""}`}
          >
            Shared
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("todos")}
            className={`whitespace-nowrap rounded-full border border-white/10 px-3 py-1 text-white/60 hover:bg-white/10 ${filterValue === "todos" ? "bg-white/10 text-white" : ""}`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("notes")}
            className={`whitespace-nowrap rounded-full border border-white/10 px-3 py-1 text-white/60 hover:bg-white/10 ${filterValue === "notes" ? "bg-white/10 text-white" : ""}`}
          >
            Notes
          </button>
        </div>
      </div>
      <div className="relative flex w-full items-center gap-3 sm:w-auto">
        <button onClick={toggleProfile} aria-expanded={isProfileOpen}>
          <FaRegUserCircle className="text-3xl text-white/80" />
        </button>
        <ProfileDropDown isOpen={isProfileOpen} onClose={closeProfile} />
        <div>
          <p className="text-xs uppercase tracking-widest text-white/40">Signed in</p>
          <p className="text-sm font-medium text-white">{userName}</p>
        </div>
      </div>
    </nav>
  );
};

export default Header;
