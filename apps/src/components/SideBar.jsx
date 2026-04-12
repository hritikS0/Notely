import React, { useEffect, useState } from "react";
import { FaRegUserCircle, FaSearch, FaChevronLeft, FaChevronRight, FaStickyNote, FaThumbtack } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/auth.store";
import { getAvatarUrl } from "../avatar/avatar";

const Sidebar = ({ notes = [], selectedNoteId, onSelectNote, searchValue, onSearchChange, onUpdate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {user} = useAuthStore(s => s);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const avatarUrl = getAvatarUrl(user?.avatarId || user?.id || user?._id);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "5rem" : "20rem"
    );
  }, [isCollapsed]);

  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '');
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 h-full border-r border-gray-200 bg-white dark:border-white/10 dark:bg-[#10141b] transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-80"
      }`}
    >
      {/* Collapse Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-6 z-50 rounded-full border border-gray-200 bg-white dark:border-white/10 dark:bg-[#10141b] p-1 text-gray-500 hover:text-gray-900 dark:text-white/60 dark:hover:text-white transition-colors"
      >
        {isCollapsed ? <FaChevronRight className="text-xs" /> : <FaChevronLeft className="text-xs" />}
      </button>

      <div className={`flex h-full flex-col gap-6 overflow-x-hidden overflow-y-auto py-6 ${isCollapsed ? "items-center px-2" : "px-4"}`}>
      {isCollapsed ? (
        <>
          {/* Logo - collapsed */}
          <div className="border-b border-gray-200 dark:border-white/10 pb-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">N</h1>
          </div>

          {/* Search Icon - collapsed */}
          <button className="text-gray-500 hover:text-gray-900 dark:text-white/60 dark:hover:text-white">
            <FaSearch className="text-xl" />
          </button>
             {/* <div className="flex w-full gap-2 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
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
          </button>
        </div> */}
          {/* Notes List - collapsed */}
          <div className="flex flex-col gap-2 w-full">
            <p className="text-[10px] text-gray-400 dark:text-white/40 text-center">NOTES</p>
            {notes.slice(0, 5).map((note) => (
              <button
                key={note._id}
                onClick={() => onSelectNote && onSelectNote(note._id)}
                className={`w-full rounded-lg px-2 py-2 transition-colors group relative ${selectedNoteId === note._id ? 'bg-gray-200 text-gray-900 dark:bg-white/20 dark:text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-white/60 dark:hover:bg-white/10'}`}
                title={note.title}
              >
                <FaStickyNote className="text-lg mx-auto" />
              </button>
            ))}
            {notes.length === 0 && (
              <p className="text-[10px] text-gray-400 dark:text-white/30 text-center">No notes</p>
            )}
          </div>

          {/* User Icon - collapsed */}
          <div className="mt-auto flex flex-col items-center gap-3 border-t border-gray-200 dark:border-white/10 pt-4">
            <button>
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="h-7 w-7 rounded-full border border-gray-200 object-cover dark:border-white/10" 
              />
            </button>
          </div>

        </>
      ) : (
        <div className="flex w-72 flex-1 flex-col gap-6">
          {/* Logo Section */}
          <div className="border-b border-gray-200 dark:border-white/10 pb-4">
            <div className="inline-flex items-baseline gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">Notely</h1>
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gray-500 dark:text-white/40 sm:text-xs">studio</span>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-white/50 sm:text-sm">
              A playful space to keep ideas, lists, and tiny sparks organized.
            </p>
          </div>

          {/* Search Section */}
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 text-xs" />
            <input
              type="text"
              placeholder="Search your sparks..."
                  value={searchValue || ""}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full rounded-full border border-gray-300 bg-gray-50 dark:border-white/10 dark:bg-white/5 py-2 pl-9 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:border-gray-400 dark:focus:border-white/20 transition-colors"
            />
          </div>

          {/* Notes List Section */}
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-white/40 mb-2">
              Your Notes ({notes.length})
            </p>
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {notes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => onSelectNote && onSelectNote(note._id)}
                  className={`group rounded-lg border p-3 transition-colors cursor-pointer ${selectedNoteId === note._id ? 'border-gray-300 bg-gray-100 dark:border-white/30 dark:bg-white/10' : 'border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5'}`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
                      {note.title || "Untitled"}
                    </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUpdate) {
                        onUpdate(note._id, { isPinned: !note.isPinned });
                        toast.success(!note.isPinned ? "Note pinned" : "Note unpinned");
                      }
                    }}
                    className={`ml-2 rounded-full p-1 transition-colors ${
                      note.isPinned
                        ? "text-yellow-500 dark:text-yellow-400"
                        : "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 dark:text-white/30 dark:hover:text-white/70"
                    }`}
                    aria-label={note.isPinned ? "Unpin note" : "Pin note"}
                  >
                    <FaThumbtack className={`text-xs ${note.isPinned ? "" : "-rotate-45"}`} />
                  </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/50 mt-1 line-clamp-2">
                      {stripHtml(note.content || note.description) || "No content"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {note.isShared && (
                      <span className="text-[10px] text-blue-400">Shared</span>
                    )}
                    {note.type === "todo" && (
                      <span className={`text-[10px] ${note.isTodoCompleted ? "text-green-500 font-semibold" : "text-amber-500"}`}>
                          {note.isTodoCompleted ? "Completed" : `${note.todos?.length || 0} items`}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 dark:text-white/30">
                      {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 dark:text-white/40">No notes found</p>
                  <p className="text-xs text-gray-400 dark:text-white/30 mt-1">Create your first note</p>
                </div>
              )}
            </div>
          </div>

          {/* User Profile Section at Bottom */}
          <div className="mt-auto flex items-center gap-3 border-t border-gray-200 dark:border-white/10 pt-4">
            <button>
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="h-9 w-9 rounded-full border border-gray-200 object-cover dark:border-white/10" 
              />
            </button>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/40">Signed in</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || "Guest"}</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </aside>
  );
};

export default Sidebar;
