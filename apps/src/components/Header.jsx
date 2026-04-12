import React, { useState, useEffect } from "react";
import { FaRegUserCircle, FaSearch, FaSun, FaMoon } from "react-icons/fa";
import ProfileDropDown from "./ProfileDropDown";
import { useAuthStore } from "../store/auth.store";
import { getAvatarUrl } from "../avatar/avatar";

const Header = ({ filterValue, onFilterChange }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const user = useAuthStore((state) => state.user);
  const toggleProfile = () => setIsProfileOpen((open) => !open);
  const closeProfile = () => setIsProfileOpen(false);
  const userName = user?.name || "Guest";
  const avatarUrl = getAvatarUrl(user?.avatarId || user?.id || user?._id);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setIsDarkMode(savedTheme === "dark");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newTheme;
    });
  };

  return (
    // MAKE NAV STICKY
    <nav className="sticky top-0 z-50 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#10141b] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-6 transition-colors duration-200">
      <div>
        <div className="inline-flex items-baseline gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">Notely</h1>
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gray-500 dark:text-white/40 sm:text-xs">studio</span>
        </div>
        <p className="mt-2 max-w-md text-xs text-gray-600 dark:text-white/50 sm:text-sm">
          A playful space to keep ideas, lists, and tiny sparks organized.
        </p>
      </div>
      <div className="flex w-full flex-1 items-center justify-center sm:mx-4 sm:max-w-sm">
        <div className="flex w-full gap-2 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* <button
            type="button"
            onClick={() => onFilterChange("all")}
            className={`whitespace-nowrap rounded-full border px-3 py-1 hover:bg-gray-100 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10 transition-colors ${filterValue === "all" ? "border-gray-300 bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white" : "border-gray-200 text-gray-600"}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("pinned")}
            className={`whitespace-nowrap rounded-full border px-3 py-1 hover:bg-gray-100 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10 transition-colors ${filterValue === "pinned" ? "border-gray-300 bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white" : "border-gray-200 text-gray-600"}`}
          >
            Pinned
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("shared")}
            className={`whitespace-nowrap rounded-full border px-3 py-1 hover:bg-gray-100 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10 transition-colors ${filterValue === "shared" ? "border-gray-300 bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white" : "border-gray-200 text-gray-600"}`}
          >
            Shared
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("todos")}
            className={`whitespace-nowrap rounded-full border px-3 py-1 hover:bg-gray-100 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10 transition-colors ${filterValue === "todos" ? "border-gray-300 bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white" : "border-gray-200 text-gray-600"}`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("notes")}
            className={`whitespace-nowrap rounded-full border px-3 py-1 hover:bg-gray-100 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10 transition-colors ${filterValue === "notes" ? "border-gray-300 bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white" : "border-gray-200 text-gray-600"}`}
          >
            Notes
          </button> */}
        </div>
      </div>
      <div className="relative flex w-full items-center gap-3 sm:w-auto">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-white/80 dark:hover:bg-white/10 transition-colors"
        >
          {isDarkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
        </button>
        <button onClick={toggleProfile} aria-expanded={isProfileOpen}>
          <img 
            src={avatarUrl} 
            alt="Profile" 
            className="h-8 w-8 rounded-full border border-gray-200 object-cover dark:border-white/10" 
          />
        </button>
        <ProfileDropDown isOpen={isProfileOpen} onClose={closeProfile} />
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/40">Signed in</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
        </div>
      </div>
    </nav>
  );
};

export default Header;
