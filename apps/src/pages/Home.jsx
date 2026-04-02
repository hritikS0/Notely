import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Notes from '../components/Notes'
import NewNote from "../components/NewNote"
import { fetchNotes, deleteNote ,updateNote, searchNotes } from '../api/note'
import { toast } from 'react-toastify'
const Home = () => {

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterValue]);

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
    await updateNote(id, updated);
    if (Object.keys(updated || {}).length === 1 && "isPinned" in updated) {
      setNotes((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isPinned: updated.isPinned } : n
        )
      );
      return;
    }
    toast.success("Note updated successfully");
    await loadNotes();
  };
  const handleDelete = async(id)=>{
    await deleteNote(id);
    toast.success("Note deleted successfully");
    await loadNotes();
  }
  const handlePageChange = (nextPage) => {
    setIsPageLoading(true);
    setPage(nextPage);
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0e13]">
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
      <div className="pointer-events-none absolute inset-0 bg-[#0b0e13]/70" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-8">
        <Header
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterValue={filterValue}
          onFilterChange={setFilterValue}
        />
        <div className="mt-8">
          <Notes
            note={notes}
            isLoading={isLoading || isPageLoading}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-white/70">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || isPageLoading}
              className="rounded-md border border-white/10 px-3 py-1 disabled:cursor-not-allowed disabled:text-white/30"
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
              className="rounded-md border border-white/10 px-3 py-1 disabled:cursor-not-allowed disabled:text-white/30"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <NewNote
        onCreate={(created) => {  
          if (created) {
            loadNotes({ nextPage: 1 });
          }
        }}
      />
    </div>
  )
}

export default Home
