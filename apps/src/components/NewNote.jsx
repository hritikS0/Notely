import React, { useState } from "react";
import { createNotes } from "../api/note";
import RichTextEditor from "./RichTextEditor";

const NewNote = ({ onCreate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [noteType, setNoteType] = useState("normal");
  const [note, setNote] = useState({
    name: "",
    title: "",
    content: "",
    type: "normal",
  });
  const [todos, setTodos] = useState([""]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const onSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const cleanedTodos = todos.map((t) => t.trim()).filter(Boolean);
    const payload = {
      ...note,
      type: noteType,
      todos: noteType === "todo" ? cleanedTodos : undefined,
      content: noteType === "todo" ? cleanedTodos.join("\n") : note.content,
    };
    const created = await createNotes(payload);
    if (onCreate) {
      onCreate(created || payload);
    }
    setNote({ name: "", title: "", content: "", type: "normal" });
    setTodos([""]);
    setNoteType("normal");
    close();
  };
  const updateTodo = (index, value) => {
    setTodos((prev) => prev.map((t, i) => (i === index ? value : t)));
  };
  const addTodo = () => setTodos((prev) => [...prev, ""]);
  const removeTodo = (index) => {
    setTodos((prev) => {
      if (prev.length === 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <>
      <button
        onClick={open}
        aria-label="Create new note"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#ffffff,#d2d2d2,#ffffff)] text-2xl text-black shadow-[0_12px_28px_rgba(0,0,0,0.4)] ring-1 ring-white/30 transition-transform duration-150 ease-in-out hover:scale-105 sm:bottom-10 sm:right-10 sm:h-14 sm:w-14 sm:text-3xl"
      >
        +
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div onClick={close} className="absolute inset-0 bg-black/60" />

          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-4xl rounded-2xl border border-white/10 bg-[#10141b] p-4 shadow-2xl sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Create Note</h2>
              <button
                onClick={close}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form className="flex h-[75vh] flex-col sm:h-[70vh]">
              <div className="flex-1 space-y-4 overflow-auto pr-1">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-white/70">
                    Note type
                  </span>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-[#0e1116] px-3 py-2 text-white"
                  >
                    <option value="normal">Normal note</option>
                    <option value="todo">Todo list</option>
                  </select>
                </label>
                <input
                  type="text"
                  placeholder="Name"
                  value={note.name}
                  onChange={(e) =>
                    setNote((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-md border border-white/10 bg-[#0e1116] px-3 py-2 text-white placeholder:text-white/40"
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={note.title}
                  onChange={(e) =>
                    setNote((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full rounded-md border border-white/10 bg-[#0e1116] px-3 py-2 text-white placeholder:text-white/40"
                />
                {noteType === "normal" ? (
                  <RichTextEditor
                    value={note.content}
                    onChange={(value) =>
                      setNote((prev) => ({ ...prev, content: value }))
                    }
                    placeholder="Write your note..."
                    minHeight={360}
                  />
                ) : (
                  <div className="space-y-3">
                    {todos.map((todo, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Todo ${index + 1}`}
                          value={todo}
                          onChange={(e) => updateTodo(index, e.target.value)}
                          className="w-full rounded-md border border-white/10 bg-[#0e1116] px-3 py-2 text-white placeholder:text-white/40"
                        />
                        <button
                          type="button"
                          onClick={() => removeTodo(index)}
                          className="rounded-md border border-white/10 px-2 py-2 text-sm text-white/60 hover:bg-white/10"
                          aria-label="Remove todo"
                        >
                          –
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addTodo}
                      className="w-full rounded-md border border-white/10 bg-white/5 py-2 text-sm font-semibold text-white/70 hover:bg-white/10"
                    >
                      Add another item
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onSubmit}
                className="mt-4 w-full rounded-md bg-white py-2 font-semibold text-black hover:bg-white/90"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default NewNote;
