import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store.js";
import { IoIosLogOut } from "react-icons/io";
import { FaRegUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { getAvatarUrl } from "../avatar/avatar";

const ProfileDropDown = ({ isOpen, onClose, className = "absolute right-0 top-12" }) => {
  const { user, logout } = useAuthStore((s) => s);
  const navigate = useNavigate();
  const avatarUrl = getAvatarUrl(user?.avatarId || user?.id || user?._id);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
    onClose?.();
  };

  const handleChangeAvatar = () => {
    navigate("/avatar");
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className={`${className} z-50 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl transition-all dark:border-white/10 dark:bg-[#10141b]`}>
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-white/10">
        <img src={avatarUrl} alt="Profile" className="h-9 w-9 rounded-full border border-gray-200 object-cover dark:border-white/10" />
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{user?.name || "Guest"}</span>
          <span className="truncate text-xs text-gray-500 dark:text-white/40">{user?.email || "No email"}</span>
        </div>
      </div>
      <ul className="py-2 text-sm text-gray-700 dark:text-white/80">
        <li
          className="cursor-pointer px-4 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
          onClick={handleChangeAvatar}
        >
          <div className="flex items-center gap-3">
            <FaRegUserCircle className="text-lg text-gray-500 dark:text-white/60" />
            <span>Change Avatar</span>
          </div>
        </li>
        <li
          className="cursor-pointer px-4 py-2 text-red-600 transition-colors hover:bg-gray-100 dark:text-red-400 dark:hover:bg-white/10"
          onClick={handleLogout}
        >
          <div className="flex items-center gap-3">
            <IoIosLogOut className="text-lg" />
            <span>Logout</span>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default ProfileDropDown;
