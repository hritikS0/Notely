import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAvatarUrl } from "../avatar/avatar";
import { useAuthStore } from "../store/auth.store";

const AvatarSelection = () => {
  // 🚨 CHANGE THIS to the exact number of avatars you have in your folder
  const totalAvatars = 10; 
  const avatarsList = Array.from({ length: totalAvatars }, (_, i) => i + 1);
  
  const { user, updateAvatar } = useAuthStore((s) => s);
  const navigate = useNavigate();
  
  // Default to 1, or the user's currently saved avatarId if they have one
  const initialAvatar = user?.avatarId ? Number(user.avatarId) : 1;
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar); 
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save as string to match your mongoose schema
      await updateAvatar(String(selectedAvatar)); 

      toast.success("Avatar updated successfully!");
      navigate("/home");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update avatar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-[#0b0e13] transition-colors duration-200">
      <div className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 md:p-12 shadow-2xl dark:border-white/10 dark:bg-[#12161d]">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            Choose your Avatar
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-white/60">
            Pick a profile picture that represents you best.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
          {avatarsList.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setSelectedAvatar(num)}
              className={`group relative flex aspect-square items-center justify-center rounded-2xl border-4 transition-all duration-200 ease-in-out ${
                selectedAvatar === num
                  ? "border-[#2dd4bf] scale-105 shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                  : "border-transparent hover:scale-105 hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              <img
                src={getAvatarUrl(num, totalAvatars)}
                alt={`Avatar ${num}`}
                className="h-full w-full rounded-xl object-cover p-2"
              />
              {selectedAvatar === num && (
                <div className="absolute -bottom-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#2dd4bf] text-white shadow-lg">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full max-w-xs rounded-xl bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] px-6 py-4 text-base font-bold text-gray-900 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isSaving ? "Saving..." : "Save Avatar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelection;