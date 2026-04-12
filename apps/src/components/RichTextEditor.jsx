import { useEffect, useRef } from "react";
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
      className={`rich-editor ${className}`}
      style={{ "--min-h": `${minHeight}px` }}
    >
      <div ref={containerRef} />
    </div>
  );
};

export default RichTextEditor;
