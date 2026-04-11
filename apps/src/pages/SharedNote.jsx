import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSharedNote, joinShare } from "../api/note";
import { useAuthStore } from "../store/auth.store";

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
      setNote(data);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0e13] px-6 py-16 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#10141b] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
            Share link
          </p>
          <h1 className="mt-3 text-2xl font-semibold">{error}</h1>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-[#0b0e13] px-6 py-16 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#10141b] p-8">
          <p className="text-sm text-white/60">Loading shared note…</p>
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
    <div className="min-h-screen bg-[#0b0e13] px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#10141b] p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
            Shared note
          </p>
          {authToken ? (
            <button
              type="button"
              onClick={handleJoin}
              disabled={isJoining}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isJoining ? "Joining..." : "Join note"}
            </button>
          ) : (
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">
              <button
                onClick={handleLogin}
                className="cursor-pointer border p-2"
              >
                Login to join
              </button>
            </p>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-semibold">{note.title}</h1>
        <p className="mt-2 text-sm text-white/60">{note.name}</p>
        {note.type === "todo" ? (
          <ul className="mt-6 space-y-2 text-white/75">
            {(note.todos || [])
              .map((item) => String(item).trim())
              .filter(Boolean)
              .map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-white/40" />
                  <span>{item}</span>
                </li>
              ))}
          </ul>
        ) : (
          <div
            className="mt-6 text-white/75 leading-relaxed"
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
