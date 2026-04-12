import { useState, useEffect } from "react";
import { FaShareAlt, FaThumbtack } from "react-icons/fa";
import { MdDelete, MdClose } from "react-icons/md";
import { createShareLink, createNotes } from "../api/note";
import { toast } from "react-toastify";
import RichTextEditor from "./RichTextEditor";
import { getAvatarUrl } from "../avatar/avatar";

const Notes = ({ note, isLoading, onUpdate, onDelete, selectedNoteId, onSelectNote, onNoteCreated, quickTodoNote, onQuickTodoChanged }) => {
  const QUICK_TODO_KEY = "notely_quick_todo";
  const [draft, setDraft] = useState(null);
  const [quickTodo, setQuickTodo] = useState({
    todos: [{ text: "", completed: false }],
    isTodoCompleted: false,
  });
  const [quickTodoId, setQuickTodoId] = useState(null);

  const stripHtml = (html) => {
    if (!html) return "";
    if (typeof document === "undefined") return String(html);
    const div = document.createElement("div");
    // Add newlines to common block tags before stripping HTML to preserve some breaks
    let processedHtml = html.replace(/<br\s*\/?>/gi, "\n");
    processedHtml = processedHtml.replace(/<\/p>/gi, "\n");
    processedHtml = processedHtml.replace(/<\/div>/gi, "\n");
    processedHtml = processedHtml.replace(/<\/li>/gi, "\n");
    div.innerHTML = processedHtml;
    return (div.textContent || div.innerText || "").trim();
  };

  useEffect(() => {
    if (!selectedNoteId || !note) {
      setDraft(null);
      return;
    }
    const n = note.find((x) => x._id === selectedNoteId);
    if (!n) {
      setDraft(null);
      return;
    }

    const derivedTodos =
      Array.isArray(n.todos) && n.todos.length > 0
        ? n.todos
            .map((t) => (typeof t === "string" ? { text: t, completed: false } : t))
        : String(n.content || "")
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
            .map((text) => ({ text, completed: false }));

    let rawContent = n.content || "";
    if (rawContent && !/<[a-z][\s\S]*>/i.test(rawContent)) {
      rawContent = rawContent.replace(/\n/g, "<br />");
    }
    const plainContent = stripHtml(rawContent);

    setDraft({
      _id: n._id,
      name: n.name || "",
      title: n.title || "",
      content: rawContent,
      contentPlain: plainContent,
      type: n.type || "normal",
      todos: derivedTodos.length ? derivedTodos : [{ text: "", completed: false }],
      isTodoCompleted: n.isTodoCompleted || false,
      isPinned: n.isPinned,
      isCollaborated: n.isCollaborated,
      collaborator: n.owner || n.collaborator || (n.collaborators && n.collaborators[0]) || null,
    });
  }, [selectedNoteId, note]);

  useEffect(() => {
    const todoSource = quickTodoNote || null;
    setQuickTodoId(todoSource?._id || null);

    const list =
      Array.isArray(todoSource?.todos) && todoSource.todos.length
        ? todoSource.todos
        : String(todoSource?.content || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

    const mapped = (list || []).map((text) => ({ text, completed: false }));
    setQuickTodo({ 
      todos: mapped.length ? mapped : [{ text: "", completed: false }],
      isTodoCompleted: todoSource?.isTodoCompleted || false
    });
  }, [quickTodoNote]);

  const saveEdit = (e) => {
    if (e) e.preventDefault();
    if (!draft) return;
    const cleanedTodos = (draft.todos || [])
      .map((t) => (typeof t === "string" ? t : t?.text || ""))
      .map((text) => String(text).trim())
      .filter(Boolean);
    const payload = {
      name: draft.name,
      title: draft.title,
      type: draft.type,
      todos: draft.type === "todo" ? cleanedTodos : undefined,
      content:
        draft.type === "todo" ? cleanedTodos.join("\n") : draft.content,
    };
    if (onUpdate) onUpdate(draft._id, payload);
  };

  const handleKeySave = (e) => {
    if (e.key === "Escape") {
      if (onSelectNote) onSelectNote(null);
    }
  };

  const updateTodo = (idx, text) => {
    setDraft((prev) => ({
      ...prev,
      todos: prev.todos.map((t, i) => (i === idx ? { ...t, text } : t)),
    }));
  };

  const toggleTodo = (idx) => {
    setDraft((prev) => ({
      ...prev,
      todos: prev.todos.map((t, i) => (i === idx ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const addTodo = () =>
    setDraft((prev) => ({ ...prev, todos: [...prev.todos, { text: "", completed: false }] }));

  const removeTodo = (idx) => {
    setDraft((prev) => {
      if (prev.todos.length === 1) {
        return { ...prev, todos: [{ text: "", completed: false }] };
      }
      return { ...prev, todos: prev.todos.filter((_, i) => i !== idx) };
    });
  };

  const handleQuickTodoSave = async (e) => {
    if (e) e.preventDefault();
    const cleanedTodos = (quickTodo.todos || [])
      .map((t) => (typeof t === "string" ? t : t?.text || ""))
      .map((text) => String(text).trim())
      .filter(Boolean);
    if (cleanedTodos.length === 0) {
      toast.error("Please add at least one task");
      return;
    }
    
    try {
      const payload = {
        name: QUICK_TODO_KEY,
        title: "Quick Todo",
        type: "todo",
        todos: cleanedTodos,
        content: cleanedTodos.join("\n"),
        isTodoCompleted: quickTodo.isTodoCompleted,
      };

      if (quickTodoId && onUpdate) {
        await onUpdate(quickTodoId, payload);
        return;
      }

      const res = await createNotes(payload);
      const newNote = res?.data?.note || res?.data || res?.note || res;
      const newId = newNote?._id || newNote?.id;
      if (newId) setQuickTodoId(newId);
      toast.success("Quick Todo created!");
      if (onQuickTodoChanged) await onQuickTodoChanged();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save todo");
    }
  };

  const handleShare = async (id) => {
    if (!id) {
      toast.error("No note selected to share");
      return;
    }
    let share;
    try {
      share = await createShareLink(id);
    } catch (error) {
      console.error("Share error:", error);
      toast.error(error.response?.data?.message || "Failed to create share link");
      return;
    }

    if (!share?.shareToken) return;
    const url = `${window.location.origin}/shared/${share.shareToken}`;

    // 1. Always copy the link to the clipboard first
    try {
      // Check if the modern clipboard API is available and we are in a secure context (HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for non-secure contexts (HTTP)
        const temp = document.createElement("input");
        temp.value = url;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      }
      toast.success("Share link copied!");
    } catch (error) {
      console.error("Copy failed", error);
      toast.error("Failed to copy link");
    }

    // 2. Then optionally open the native OS share sheet if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: draft?.title || "Shared Note",
          text: "Check out this note on Notely:",
          url: url,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Share API failed", error);
        }
      }
    }
  };
  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full animate-pulse flex-col rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#12161d] p-6">
        <div className="h-4 w-32 rounded-full bg-gray-200 dark:bg-white/10" />
        <div className="mt-6 h-8 w-1/2 rounded-full bg-gray-200 dark:bg-white/10" />
        <div className="mt-8 h-full w-full rounded-xl bg-gray-200 dark:bg-white/10" />
      </div>
    );
  }

  const renderEditorOrEmpty = () => {
    if (!selectedNoteId || !draft) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center dark:border-white/15 dark:bg-[#10141b]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-white/40">
            {(!Array.isArray(note) || note.length === 0) ? "Your canvas is clear" : "No note selected"}
          </p>
          <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
            {(!Array.isArray(note) || note.length === 0) 
              ? "Start with a quick thought, a to-do, or a tiny spark." 
              : "Select a note from the sidebar to view or edit."}
          </p>
        </div>
      );
    }

    return (
      <div className="relative flex h-full w-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#12161d]">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-white/40">
            <span>Note Editor</span>
            {draft.isCollaborated && (
              <div className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 py-0.5 pl-1 pr-2 dark:border-white/10 dark:bg-white/5">
                <img
                  src={getAvatarUrl(draft.collaborator?.avatarId || draft.collaborator?._id || draft.collaborator?.id)}
                  alt="Collaborator avatar"
                  className="h-4 w-4 rounded-full object-cover"
                />
                <span className="text-[10px] text-gray-600 dark:text-white/60">
                  Collaborated with {draft.collaborator?.name || "Someone"}
                </span>
              </div>
            )}
          
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10"
              aria-label="Share note"
              onClick={() => handleShare(draft._id)}
            >
              <FaShareAlt />
            </button>
            <button
              type="button"
              className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10"
              aria-label="Delete note"
              onClick={() => {
                onDelete(draft._id);
                if (onSelectNote) onSelectNote(null);
              }}
            >
              <MdDelete className="text-xl" />
            </button>
            <button
              type="button"
              className="ml-2 rounded-md border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
              onClick={saveEdit}
            >
              Save
            </button>
            <button
              type="button"
              className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10"
              aria-label="Close"
              onClick={() => {
                if (onSelectNote) onSelectNote(null);
              }}
            >
              <MdClose className="text-xl" />
            </button>
          </div>
        </div>

        <form key={draft._id} className="flex-1 overflow-auto pr-4" onSubmit={saveEdit}>
          <input
            type="text"
            placeholder="Name"
            value={draft.name}
            onChange={(e) => setDraft((prev) => prev ? { ...prev, name: e.target.value } : null)}
            className="w-full bg-transparent text-xs font-semibold uppercase tracking-wide text-gray-600 outline-none placeholder:text-gray-400 dark:text-white/60 dark:placeholder:text-white/30"
            onKeyDown={handleKeySave}
          />
          <input
            type="text"
            placeholder="Title"
            value={draft.title}
            onChange={(e) => setDraft((prev) => prev ? { ...prev, title: e.target.value } : null)}
            className="mt-3 w-full bg-transparent text-3xl font-semibold text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-white/30"
            onKeyDown={handleKeySave}
          />

          {draft.type === "todo" ? (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-end mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-white/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.isTodoCompleted || false}
                    onChange={(e) => setDraft(prev => prev ? { ...prev, isTodoCompleted: e.target.checked } : null)}
                    className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                  Mark entire list as completed
                </label>
              </div>
              {draft.todos.map((todo, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleTodo(idx)}
                    className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                      (draft.isTodoCompleted || todo.completed) ? "border-green-500 bg-green-500" : "border-gray-400 hover:border-gray-600 dark:border-white/40 dark:hover:border-white/70"
                    }`}
                  >
                    {(draft.isTodoCompleted || todo.completed) && <span className="text-[10px] text-white">✓</span>}
                  </button>
                  <input
                    type="text"
                    value={todo.text}
                    onChange={(e) => updateTodo(idx, e.target.value)}
                    placeholder={`Todo ${idx + 1}`}
                    className={`w-full bg-transparent text-base outline-none placeholder:text-gray-400 dark:placeholder:text-white/30 ${(draft.isTodoCompleted || todo.completed) ? 'text-gray-400 line-through dark:text-white/40' : 'text-gray-700 dark:text-white/70'}`}
                    onKeyDown={handleKeySave}
                  />
                  <button
                    type="button"
                    onClick={() => removeTodo(idx)}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10"
                    aria-label="Remove todo"
                  >
                    –
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTodo}
                className="mt-4 w-full rounded-md border border-gray-300 bg-gray-50 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
              >
                + Add another item
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <RichTextEditor
                value={draft.content}
                onChange={(value) =>
                  setDraft((prev) => prev ? { ...prev, content: value } : null)
                }
                placeholder="Write your note..."
                minHeight={400}
              />
            </div>
          )}
        </form>
      </div>
    );
  };

  return (
    <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* Note Editor - fills remaining space */}
      <div className="min-w-0">
        <div className="h-[calc(100vh-200px)] min-h-100">
          {renderEditorOrEmpty()}
        </div>
      </div>

      {/* Quick Todo - stays to the right */}
      <div>
        <div className="sticky top-4 h-[calc(100vh-200px)] min-h-100 w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#12161d] overflow-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-white/40">
              <span>Quick Todo</span>
            </div>
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
              onClick={handleQuickTodoSave}
            >
              Save
            </button>
          </div>
          
          <form className="flex-1 overflow-auto" onSubmit={handleQuickTodoSave}>
            <div className="mt-2 space-y-3">
             
              {quickTodo.todos.map((todo, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <button
                    type="button" 
                    onClick={() => {
                      setQuickTodo(prev => ({
                        ...prev,
                        todos: prev.todos.map((t, i) => i === idx ? { ...t, completed: !t.completed } : t)
                      }));
                    }}
                    className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                      (quickTodo.isTodoCompleted || todo.completed) ? "border-green-500 bg-green-500" : "border-gray-400 hover:border-gray-600 dark:border-white/40 dark:hover:border-white/70"
                    }`}
                  >
                    {(quickTodo.isTodoCompleted || todo.completed) && <span className="text-[10px] text-white">✓</span>}
                  </button>
                  <input
                    type="text"
                    value={todo.text}
                    onChange={(e) => {
                      setQuickTodo(prev => ({
                        ...prev,
                        todos: prev.todos.map((t, i) => i === idx ? { ...t, text: e.target.value } : t)
                      }));
                    }}
                    placeholder={`Todo ${idx + 1}`}
                    className={`w-full bg-transparent text-base outline-none placeholder:text-gray-400 dark:placeholder:text-white/30 ${(quickTodo.isTodoCompleted || todo.completed) ? 'text-gray-400 line-through dark:text-white/40' : 'text-gray-700 dark:text-white/70'}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setQuickTodo(prev => {
                        if (prev.todos.length === 1) return { ...prev, todos: [{ text: "", completed: false }] };
                        return { ...prev, todos: prev.todos.filter((_, i) => i !== idx) };
                      });
                    }}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10"
                    aria-label="Remove todo"
                  >
                    –
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setQuickTodo(prev => ({ ...prev, todos: [...prev.todos, { text: "", completed: false }] }));
                }}
                className="mt-4 w-full rounded-md border border-gray-300 bg-gray-50 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
              >
                + Add another item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Notes;
