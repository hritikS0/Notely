import React from "react";
import { MdClose } from "react-icons/md";

const FullScreen = ({ isOpen, onClose, title, children, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#f8f9fa]/50 backdrop-blur-md dark:bg-[#0b0e13]/50">
      {/* Header simulating Google Docs */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-300 bg-white px-4 shadow-sm dark:border-white/10 dark:bg-[#10141b]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-600 text-white shadow-sm">
            <span className="text-xl font-bold">N</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium leading-tight text-gray-900 dark:text-white">
              {title || "Untitled Document"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Save
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10"
            aria-label="Exit full screen"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="mx-auto min-h-[1056px] w-full max-w-[816px] bg-white px-8 py-12 shadow-lg dark:bg-[#12161d] sm:px-16 sm:py-16">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FullScreen;