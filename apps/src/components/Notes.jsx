import { useState } from "react";
import { FaLink, FaThumbtack } from "react-icons/fa";
import { MdDelete, MdOpenInFull, MdClose } from "react-icons/md";
import { createShareLink } from "../api/note";
import { toast } from "react-toastify";
import RichTextEditor from "./RichTextEditor";
const Notes = ({ note, isLoading, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [fullscreenId, setFullscreenId] = useState(null);
  const [draft, setDraft] = useState({
    name: "",
    title: "",
    content: "",
    contentPlain: "",
    type: "normal",
    todos: [""],
  });

  const stripHtml = (html) => {
    if (!html) return "";
    if (typeof document === "undefined") return String(html);
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const startEdit = (n, index) => {
    const derivedTodos =
      Array.isArray(n.todos) && n.todos.length > 0
        ? n.todos
        : String(n.content || "")
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean);
    setEditingId(index);
    const rawContent = n.content || "";
    const plainContent = stripHtml(rawContent);
    setDraft({
      name: n.name || "",
      title: n.title || "",
      content: rawContent,
      contentPlain: plainContent,
      type: n.type || "normal",
      todos: derivedTodos.length ? derivedTodos : [""],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (e, index, id, options = {}) => {
    e.preventDefault();
    const cleanedTodos = draft.todos.map((t) => t.trim()).filter(Boolean);
    const usePlain = options.usePlain === true;
    const payload = {
      name: draft.name,
      title: draft.title,
      type: draft.type,
      todos: draft.type === "todo" ? cleanedTodos : undefined,
      content:
        draft.type === "todo"
          ? cleanedTodos.join("\n")
          : usePlain
            ? draft.contentPlain
            : draft.content,
    };
    if (onUpdate) onUpdate(id, payload);
    setEditingId(null);
    if (fullscreenId === index) setFullscreenId(null);
  };
  const handleKeySave = (e, index) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    cancelEdit();
    if (fullscreenId === index) setFullscreenId(null);
  };
  const openFullscreen = (n, index) => {
    if (editingId !== index) startEdit(n, index);
    setDraft((prev) => ({
      ...prev,
      content: prev.contentPlain || prev.content,
    }));
    setFullscreenId(index);
  };
  const closeFullscreen = () => {
    setFullscreenId(null);
    setEditingId(null);
  };
  const updateTodo = (idx, value) => {
    setDraft((prev) => ({
      ...prev,
      todos: prev.todos.map((t, i) => (i === idx ? value : t)),
    }));
  };
  const addTodo = () =>
    setDraft((prev) => ({ ...prev, todos: [...prev.todos, ""] }));
  const removeTodo = (idx) => {
    setDraft((prev) => {
      if (prev.todos.length === 1) {
        return { ...prev, todos: [""] };
      }
      return { ...prev, todos: prev.todos.filter((_, i) => i !== idx) };
    });
  };
  const handleCopyLink = async (id) => {
    const share = await createShareLink(id);
    if (!share?.shareToken) return;
    const url = `${window.location.origin}/shared/${share.shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const temp = document.createElement("input");
      temp.value = url;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }
    toast.success("Share link copied!");
  };

  const formatContent = (content) => {
    if (!content) return "";
    if (/<[a-z][\s\S]*>/i.test(content)) return content;
    return content.replace(/\n/g, "<br />");
  };

  const renderEditor = (n, index, { fullscreen }) => {
    const wrapperClass = fullscreen
      ? "h-[70vh] overflow-auto pr-2"
      : "h-full overflow-auto pr-8";
    const nameClass = fullscreen
      ? "w-full bg-transparent text-xs font-semibold uppercase tracking-wide text-white/60 outline-none placeholder:text-white/30"
      : `w-full bg-transparent text-xs font-semibold uppercase tracking-wide text-white/60 outline-none placeholder:text-white/30 ${n.isCollaborated ? "mt-2" : ""}`;
    const titleClass = fullscreen
      ? "mt-2 w-full bg-transparent text-2xl font-semibold text-white outline-none placeholder:text-white/30"
      : "mt-2 w-full bg-transparent text-xl font-semibold text-white outline-none placeholder:text-white/30";
    return (
      <form
        onSubmit={(e) => saveEdit(e, index, n._id, { usePlain: !fullscreen })}
        className={wrapperClass}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => handleKeySave(e, index)}
      >
        {n.isCollaborated && (
          <div className="flex flex-col gap-1">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
              Collaborated
            </span>
          </div>
        )}
        <input
          type="text"
          placeholder="Name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className={nameClass}
          onKeyDown={(e) => handleKeySave(e, index)}
        />
        <input
          type="text"
          placeholder="Title"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className={titleClass}
          onKeyDown={(e) => handleKeySave(e, index)}
        />
        {draft.type === "todo" ? (
          <div className="mt-4 space-y-2">
            {draft.todos.map((todo, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/40" />
                <input
                  type="text"
                  value={todo}
                  onChange={(e) => updateTodo(idx, e.target.value)}
                  placeholder={`Todo ${idx + 1}`}
                  className="w-full bg-transparent text-sm text-white/70 outline-none placeholder:text-white/30"
                  onKeyDown={(e) => handleKeySave(e, index)}
                />
                <button
                  type="button"
                  onClick={() => removeTodo(idx)}
                  className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/60 hover:bg-white/10"
                  aria-label="Remove todo"
                >
                  –
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTodo}
              className="w-full rounded-md border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
            >
              Add another item
            </button>
          </div>
        ) : fullscreen ? (
          <div className="mt-4">
            <RichTextEditor
              value={draft.content}
              onChange={(value) => setDraft({ ...draft, content: value })}
              placeholder="Write your note..."
              minHeight={360}
            />
          </div>
        ) : (
          <textarea
            rows={4}
            placeholder="Content"
            value={draft.contentPlain}
            onChange={(e) =>
              setDraft({
                ...draft,
                contentPlain: e.target.value,
                content: e.target.value,
              })
            }
            className="mt-3 w-full resize-none bg-transparent text-sm text-white/70 outline-none placeholder:text-white/30"
            onKeyDown={(e) => handleKeySave(e, index)}
          />
        )}
        {!fullscreen && (
          <div className="mt-4 flex items-center gap-2">
            <button
              type="submit"
              className="rounded-md border border-white/10 px-3 py-1 text-xs font-semibold text-white/70 hover:bg-white/10"
            >
              Save
            </button>
            <button
              type="button"
              className="rounded-md border border-white/10 px-3 py-1 text-xs font-semibold text-white/50 hover:bg-white/10"
              onClick={(e) => {
                e.preventDefault();
                cancelEdit();
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="min-h-56 animate-pulse rounded-2xl border border-white/10 bg-[#12161d] p-5"
          >
            <div className="h-3 w-20 rounded-full bg-white/10" />
            <div className="mt-4 h-5 w-3/4 rounded-full bg-white/10" />
            <div className="mt-4 h-4 w-full rounded-full bg-white/10" />
            <div className="mt-2 h-4 w-5/6 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    );
  }
  if (!Array.isArray(note) || note.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-[#10141b] p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
          Your canvas is clear
        </p>
        <p className="mt-3 text-lg font-semibold text-white">
          Start with a quick thought, a to-do, or a tiny spark.
        </p>
        <p className="mt-2 text-sm text-white/55">
          Hit the plus button and your first note appears here.
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ">
        {note.map((n, index) => {
          return (
            <div key={index}>
            <div className="group relative h-64 overflow-hidden rounded-xl border border-white/10 bg-[#12161d] p-5 transition-transform duration-150 ease-in-out hover:-translate-y-0.5">
              <div className="relative h-full">
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-full p-1 text-white/70 hover:bg-white/10"
                      aria-label="Edit note full screen"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFullscreen(n, index);
                      }}
                    >
                    <MdOpenInFull />
                  </button>
                    <button
                      type="button"
                      className={`rounded-full p-1 transition-colors ${n.isPinned ? "text-yellow-400" : "text-white/30 hover:text-white/70"}`}
                      aria-label="Pin note"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate(n._id, { isPinned: !n.isPinned });
                        toast.success(
                          !n.isPinned ? "Note pinned" : "Note unpinned"
                        );
                      }}
                    >
                      <FaThumbtack className={n.isPinned ? "" : "-rotate-45"} />
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-1 text-white/70 hover:bg-white/10"
                      aria-label="Copy note link"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(n._id);
                      }}
                    >
                      <FaLink />
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-1 text-white/70 hover:bg-white/10"
                      aria-label="Delete note"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(n._id);
                      }}
                    >
                      <MdDelete className="text-2xl" />
                    </button>
                  </div>
                <div className="h-full overflow-auto pr-8">
                  {n.isCollaborated && (
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
                        Collaborated
                      </span>
                    </div>
                  )}
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide text-white/50 ${n.isCollaborated ? "mt-2" : ""}`}
                  >
                    {n.name}
                  </p>
                  <h2 className="text-xl font-semibold mt-2 text-white">
                    {n.title}
                  </h2>
                  {n.type === "todo" ? (
                    <ul className="mt-3 space-y-2 text-white/70">
                      {(n.todos && n.todos.length > 0
                        ? n.todos
                        : String(n.content || "")
                            .split("\n")
                            .map((item) => item.trim())
                            .filter(Boolean)
                      ).map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-white/40" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div
                      className="mt-3 text-white/65 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: formatContent(n.content || ""),
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        })}
      </div>
      {fullscreenId !== null && note[fullscreenId] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={closeFullscreen}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-[#12161d] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                Fullscreen note
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-white/10 px-3 py-1 text-xs font-semibold text-white/70 hover:bg-white/10"
                  onClick={(e) =>
                    saveEdit(e, fullscreenId, note[fullscreenId]._id)
                  }
                >
                  Save
                </button>
                <button
                  type="button"
                  className="rounded-full p-2 text-white/70 hover:bg-white/10"
                  aria-label="Close fullscreen"
                  onClick={closeFullscreen}
                >
                  <MdClose />
                </button>
              </div>
            </div>
            {renderEditor(note[fullscreenId], fullscreenId, { fullscreen: true })}
          </div>
        </div>
      )}
    </>
  );
};
export default Notes;
