import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSharedNote, joinShare } from "../api/note";
import { useAuthStore } from "../store/auth.store";
import { getAvatarUrl } from "../avatar/avatar";

const SharedNote = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const authToken = useAuthStore((s) => s.token);
  const [note, setNote] = useState(null);
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);  

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const data = await getSharedNote(token);
      if (!isMounted) return;
      if (data?.message) {
        setError(data.message);
        return;
      }

      // Merge the backend data with your saved local storage progress
      if (data.type === "todo") {
        try {
          const localSaved = localStorage.getItem(`notely_shared_${token}`);
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            if (parsed && Array.isArray(parsed.todos)) {
              data.todos = (data.todos || []).map((t, i) => {
                const text = typeof t === "string" ? t : t.text;
                const backendCompleted = typeof t === "string" ? false : t.completed;
                const localCompleted = parsed.todos[i] ? parsed.todos[i].completed : false;
                return { text, completed: backendCompleted || localCompleted };
              });
              data.isTodoCompleted = data.isTodoCompleted || parsed.isTodoCompleted;
            }
          }
        } catch (err) {
          console.error("Failed to parse local shared note state", err);
        }
      }

      setNote(data);
    };
    load(); 
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Save to local storage whenever you check/uncheck a todo item
  useEffect(() => {
    if (note && note.type === "todo") {
      localStorage.setItem(`notely_shared_${token}`, JSON.stringify({
        isTodoCompleted: note.isTodoCompleted,
        todos: (note.todos || []).map(t => ({ 
          completed: typeof t === 'string' ? false : t.completed 
        }))
      }));
    }
  }, [note, token]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b0e13] px-6 py-16 text-gray-900 dark:text-white transition-colors duration-200">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#10141b] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-white/40">
            Share link
          </p>
          <h1 className="mt-3 text-2xl font-semibold">{error}</h1>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b0e13] px-6 py-16 text-gray-900 dark:text-white transition-colors duration-200">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#10141b] p-8">
          <p className="text-sm text-gray-500 dark:text-white/60">Loading shared note…</p>
        </div>
      </div>
    );
  }
  const formatContent = (content) => {
    if (!content) return "";
    if (/<[a-z][\s\S]*>/i.test(content)) return content;
    return content.replace(/\n/g, "<br />");
  };
  const handleJoin = async () => {
    setIsJoining(true);
    const joined = await joinShare(token);
    setIsJoining(false);
    if (joined?.message) {
      setError(joined.message);
      return;
    }
    navigate("/home");
  };
  const handleLogin = () => {
    navigate("/login");
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0e13] px-6 py-16 text-gray-900 dark:text-white transition-colors duration-200">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#10141b] p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-white/40">
            Shared note
          </p>
          {authToken ? (
            <button
              type="button"
              onClick={handleJoin}
              disabled={isJoining}
              className="rounded-full border border-gray-300 bg-gray-100 dark:border-white/10 dark:bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-gray-600 hover:bg-gray-200 dark:text-white/70 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {isJoining ? "Joining..." : "Join note"}
            </button>
          ) : (
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500 dark:text-white/40">
              <button
                onClick={handleLogin}
                className="cursor-pointer border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 p-2 rounded-md transition-colors"
              >
                Login to join
              </button>
            </p>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-semibold">{note.title}</h1>
        {note.name && <p className="mt-2 text-sm text-gray-600 dark:text-white/60">{note.name}</p>}

        <div className="mt-6 mb-6 flex items-center gap-3 border-b border-gray-200 pb-6 dark:border-white/10">
          <img
            src={getAvatarUrl(note.owner?.avatarId || note.owner?._id || note.owner)}
            alt="Author"
            className="h-10 w-10 rounded-full border border-gray-200 object-cover dark:border-white/10"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {note.owner?.name || "Notely User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-white/40">Shared this note with you</p>
          </div>
        </div>

        {note.type === "todo" ? (
          <ul className="mt-6 space-y-2 text-gray-700 dark:text-white/75">
            {(note.todos || [])
              .map((item, idx) => {
                const text = typeof item === 'string' ? item : item.text;
                if (!text.trim()) return null;
                
                const completed = note.isTodoCompleted || (typeof item === 'string' ? false : item.completed);
                return (
                  <li key={idx} className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setNote((prev) => {
                          if (!prev) return prev;
                          let newTodos = [...(prev.todos || [])];
                          
                          // If the entire list was marked as done, realize that state onto all individual items first
                          if (prev.isTodoCompleted) {
                            newTodos = newTodos.map(t => typeof t === 'string' ? { text: t, completed: true } : { ...t, completed: true });
                          }
                          
                          const currentItem = newTodos[idx];
                          if (typeof currentItem === 'string') {
                            newTodos[idx] = { text: currentItem, completed: true };
                          } else {
                            newTodos[idx] = { ...currentItem, completed: !currentItem.completed };
                          }
                          
                          return { ...prev, todos: newTodos, isTodoCompleted: false };
                        });
                      }}
                      className={`mt-1 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border transition-colors ${completed ? "border-green-500 bg-green-500" : "border-gray-300 hover:border-gray-400 dark:border-white/40 dark:hover:border-white/70"}`}
                    >
                      {completed && <span className="text-[10px] text-white">✓</span>}
                    </button>
                    <span className={completed ? "line-through opacity-50" : ""}>{text}</span>
                  </li>
                );
              })}
          </ul>
        ) : (
          <div
            className="mt-6 text-gray-700 dark:text-white/75 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: formatContent(note.content || ""),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SharedNote;
