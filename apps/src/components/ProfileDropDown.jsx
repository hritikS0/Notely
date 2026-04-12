import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store.js";
import { IoIosLogOut } from "react-icons/io";
import { FaRegUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";

const ProfileDropDown = ({ isOpen, onClose }) => {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

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
    <div className="absolute right-0 top-12 z-50 w-44 rounded-xl border border-white/10 bg-[#10141b]">
      <ul className="py-2 text-white">
        <li
          className="px-4 py-2 hover:bg-white/10 cursor-pointer"
          onClick={handleChangeAvatar}
        >
          <div className="flex items-center gap-2">
            <FaRegUserCircle />
            <span>Change Avatar</span>
          </div>
        </li>
        <li
          className="px-4 py-2 hover:bg-white/10 cursor-pointer"
          onClick={handleLogout}
        >
          <div className="flex items-center gap-2">
            <IoIosLogOut />
            <span>Logout</span>
          </div>
        </li>
        <li
          className="px-4 py-2 text-sm text-white/60 hover:bg-white/10 cursor-pointer"
          onClick={onClose}
        >
          Close
        </li>
      </ul>
    </div>
  );
};

export default ProfileDropDown;
