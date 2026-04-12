import { create } from "zustand";
import axios from "../axios/axios.js";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const pickUser = (data) => {
  const source = data?.user ?? data ?? {};
  const user = {
    id: source._id || source.id || source.user_id || null,
    name: source.name || null,
    email: source.email || null,
    avatarId: source.avatarId || null,
  };
  return user.name || user.email || user.id ? user : null;
};
export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem("access_token") || null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem("access_token", token);
    else localStorage.removeItem("access_token");
    set({ token });
  },
  register: async (data) => {
    const response = await axios.post("/auth/register", data);
    const user = pickUser(response.data);
    if (user) localStorage.setItem("user", JSON.stringify(user));
    set({ user });
    return response.data;
  },
  login: async (data) => {
    const response = await axios.post("/auth/login", data);
    const token = response.data.token || response.data.accessToken;
    if (token) localStorage.setItem("access_token", token);
    const user = pickUser(response.data);
    if (user) localStorage.setItem("user", JSON.stringify(user));
    set({ user, token });
    return response.data;
  },
  updateAvatar: async (avatarId) => {
    const user = getStoredUser();
    const userId = user?.id || user?._id || user?.user_id;
    await axios.put("/auth/avatar", { avatarId, userId });
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, avatarId };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  }
}));
