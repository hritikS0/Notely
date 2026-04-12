import { useEffect, useRef, useState } from "react";
import Quill from "quill";

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ align: [] }],
  ["blockquote", "code-block"],
  ["link"],
  ["clean"],
];

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write something...",
  minHeight = 180,
  className = "",
}) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const valueRef = useRef(value || "");
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(max-width: 768px)").matches;
  });
  const [toolbarOpen, setToolbarOpen] = useState(() => !isMobile);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(max-width: 768px)");

    const apply = (matches) => {
      setIsMobile(matches);
      setToolbarOpen(!matches);
    };

    apply(media.matches);

    const onMediaChange = (e) => apply(e.matches);
    if (media.addEventListener) {
      media.addEventListener("change", onMediaChange);
      return () => media.removeEventListener("change", onMediaChange);
    }

    media.addListener(onMediaChange);
    return () => media.removeListener(onMediaChange);
  }, []);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;
    const editor = new Quill(containerRef.current, {
      theme: "snow",
      placeholder,
      modules: { toolbar: TOOLBAR },
    });
    quillRef.current = editor;
    if (valueRef.current) {
      editor.clipboard.dangerouslyPasteHTML(valueRef.current);
    }
    editor.on("text-change", () => {
      const html = editor.root.innerHTML;
      const next = html === "<p><br></p>" ? "" : html;
      valueRef.current = next;
      if (onChange) onChange(next);
    });
  }, [onChange, placeholder]);

  useEffect(() => {
    const editor = quillRef.current;
    if (!editor) return;
    const next = value || "";
    if (next === valueRef.current) return;
    valueRef.current = next;
    editor.clipboard.dangerouslyPasteHTML(next);
  }, [value]);

  return (
    <div
      className={`rich-editor ${className} ${
        isMobile ? (toolbarOpen ? "toolbar-open" : "toolbar-closed") : ""
      }`}
      style={{ "--min-h": `${minHeight}px` }}
    >
      {isMobile && (
        <div className="toolbar-toggle-bar">
          <button
            type="button"
            className="three-dots-btn"
            aria-label="Formatting options"
            aria-expanded={toolbarOpen}
            onClick={() => setToolbarOpen((v) => !v)}
            title="Formatting options"
          >
            ⋮
          </button>
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
};

export default RichTextEditor;
