import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Notes from '../components/Notes'
import { fetchNotes, deleteNote, updateNote, searchNotes, createNotes } from '../api/note'
import Sidebar from '../components/SideBar'
import { toast } from 'react-toastify'
const Home = () => {
  const QUICK_TODO_KEY = "notely_quick_todo";

  const [notes, setNotes] = useState([]);
  const [quickTodoNote, setQuickTodoNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });


  const normalizeResponse = (data) => {
    if (!data) return { items: [], total: 0, totalPages: 0, page: 1 };
    if (Array.isArray(data)) {
      return { items: data, total: data.length, totalPages: 1, page: 1 };
    }
    return {
      items: Array.isArray(data.items) ? data.items : [],
      total: data.total || 0,
      totalPages: data.totalPages || 0,
      page: data.page || 1,
    };
  };

  const loadQuickTodo = async () => {
    try {
      const data = await searchNotes(QUICK_TODO_KEY, { page: 1, limit: 5, filter: "all" });
      const normalized = normalizeResponse(data);
      const found = (normalized.items || []).find(
        (n) => n?.type === "todo" && n?.name === QUICK_TODO_KEY
      );
      if (found) {
        setQuickTodoNote(found);
        return;
      }

      // Back-compat: if user previously created a todo note named "Quick Todo"
      const fallbackData = await searchNotes("Quick Todo", { page: 1, limit: 10, filter: "all" });
      const fallbackNormalized = normalizeResponse(fallbackData);
      const fallback = (fallbackNormalized.items || []).find((n) => n?.type === "todo");
      setQuickTodoNote(fallback || null);
    } catch (e) {
      console.error("Failed to load Quick Todo:", e);
      setQuickTodoNote(null);
    }
  };

  const loadNotes = async ({
    nextPage = page,
    nextSearch = searchQuery,
    nextFilter = filterValue,
    debounced = false,
  } = {}) => {
    const trimmed = nextSearch.trim();
    if (!debounced) {
      setIsLoading(true);
    }
    const params = { page: nextPage, limit, filter: nextFilter };
    const data = trimmed
      ? await searchNotes(trimmed, params)
      : await fetchNotes(params);
    const normalized = normalizeResponse(data);
    setNotes(normalized.items);
    setPagination({
      total: normalized.total,
      totalPages: normalized.totalPages,
    });
    setIsLoading(false);
    setIsPageLoading(false);
  };

  useEffect(() => {
    loadNotes({ nextPage: 1, debounced: false });
    loadQuickTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
    setIsLoading(true);
  }, [filterValue]);

  useEffect(() => {
    let isActive = true;
    const handle = setTimeout(async () => {
      if (!isActive) return;
      await loadNotes({ nextPage: page, debounced: true });
    }, searchQuery.trim() ? 300 : 0);
    return () => {
      isActive = false;
      clearTimeout(handle);
    };
  }, [searchQuery, filterValue, page]);

  const handleUpdate = async (id, updated) => {
    // Optimistically update local notes state for seamless instant feedback
    setNotes((prev) =>
      prev.map((n) => (n._id === id ? { ...n, ...updated } : n))
    );

    await updateNote(id, updated);
    if (Object.keys(updated || {}).length === 1 && "isPinned" in updated) {
      return;
    }
    toast.success("Note updated successfully");
    if (id && quickTodoNote?._id && String(id) === String(quickTodoNote._id)) {
      await loadQuickTodo();
      return;
    }
    // Fetch silently in background without triggering loading skeleton
    await loadNotes({ debounced: true });
  };
  const handleDelete = async(id)=>{
    setNotes((prev) => prev.filter((n) => n._id !== id));
    await deleteNote(id);
    toast.success("Note deleted successfully");
    await loadNotes({ debounced: true });
  }
  const handlePageChange = (nextPage) => {
    setIsPageLoading(true);
    setPage(nextPage);
  };

  const handleCreateNewNote = async () => {
    const payload = {
      name: "Untitled",
      title: "Untitled",
      content: "Start typing...",
      type: "normal",
    };
    try {
      const res = await createNotes(payload);
      toast.success("New note created");
      
      // Clear active filters/searches so the new "Untitled" note isn't hidden
      setSearchQuery("");
      setFilterValue("all");
      setPage(1);

      // Ensure the list reloads immediately with empty filters
      // Skip loading skeleton for seamless creation
      await loadNotes({ nextPage: 1, nextSearch: "", nextFilter: "all", debounced: true });

      // Safely extract the new note's ID from various common API response structures
      const newNote = res?.data?.note || res?.data || res?.note || res;
      const newId = newNote?._id || newNote?.id;

      if (newId) {
        setNotes((prev) => {
          if (prev.some((n) => n._id === newId)) return prev;
          return [{ ...newNote, createdAt: new Date().toISOString() }, ...prev];
        });
        setSelectedNoteId(newId);
      }
    } catch (error) {
      console.error("Create note error:", error);
      toast.error("Failed to create note");
    }
  };

  const visibleNotes = (notes || []).filter((n) => n?.type !== "todo");

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-[#0b0e13] transition-colors duration-200">
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-100"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-white/70 dark:bg-[#0b0e13]/70 transition-colors duration-200" />

      <div className="relative w-full pb-24 pt-6 pr-4 pl-[calc(var(--sidebar-width)+1rem)] sm:pt-8 sm:pr-6 sm:pl-[calc(var(--sidebar-width)+1.5rem)]">

        <Header
          filterValue={filterValue}
          onFilterChange={setFilterValue}
        />
        <Sidebar 
          notes={visibleNotes} 
          selectedNoteId={selectedNoteId} 
          onSelectNote={setSelectedNoteId} 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onUpdate={handleUpdate}
        />
        <div className="mt-8">
          <Notes
            note={visibleNotes}
            isLoading={isLoading || isPageLoading}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            quickTodoNote={quickTodoNote}
            onQuickTodoChanged={loadQuickTodo}
            onNoteCreated={async () => {
              setSearchQuery("");
              setFilterValue("all");
              setPage(1);
            await loadNotes({ nextPage: 1, nextSearch: "", nextFilter: "all", debounced: true });
            }}
          />
        </div>
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-700 dark:text-white/70">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || isPageLoading}
              className="rounded-md border border-gray-300 dark:border-white/10 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                handlePageChange(Math.min(pagination.totalPages, page + 1))
              }
              disabled={page >= pagination.totalPages || isPageLoading}
              className="rounded-md border border-gray-300 dark:border-white/10 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <button
        onClick={handleCreateNewNote}
        aria-label="Create new note"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#ffffff,#d2d2d2,#ffffff)] text-2xl text-black shadow-[0_12px_28px_rgba(0,0,0,0.4)] ring-1 ring-white/30 transition-transform duration-150 ease-in-out hover:scale-105 sm:bottom-10 sm:right-10 sm:h-14 sm:w-14 sm:text-3xl"
      >
        +
      </button>
    </div>
  )
}

export default Home
