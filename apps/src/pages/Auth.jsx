import React, { useEffect, useState } from "react";
import "../App.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store.js";
import { toast } from "react-toastify";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const isLogin = mode === "login";

  useEffect(() => {
    if (location.pathname === "/signup") {
      setMode("signup");
    } else {
      setMode("login");
    }
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    };

    try {
      if (isLogin) {
        await login({ email: payload.email, password: payload.password });
        toast.success("Logged in successfully");
        navigate("/home");
      } else {
        await register(payload);
        toast.success("Account created. Please log in.");
        navigate("/login");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-panel">
          <p className="auth-kicker">Notely</p>
          <h1>{isLogin ? "Welcome back." : "Create your space."}</h1>
          <p className="auth-lead">
            {isLogin
              ? "Pick up where you left off. Your notes, ideas, and tasks are ready."
              : "Build a calm, focused place for every thought—without the clutter."}
          </p>
          <div className="auth-metrics">
            <div>
              <span>Fast</span>
              <p>Lightweight, instant search.</p>
            </div>
            <div>
              <span>Secure</span>
              <p>Private by default, always yours.</p>
            </div>
            <div>
              <span>Organized</span>
              <p>Tags, favorites, and pinned notes.</p>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={isLogin ? "active" : ""}
              onClick={() => {
                setMode("login");
                navigate("/login");
              }}
              type="button"
            >
              Login
            </button>
            <button
              className={!isLogin ? "active" : ""}
              onClick={() => {
                setMode("signup");
                navigate("/signup");
              }}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <label>
                Full name
                <input name="name" type="text" placeholder="Jane Doe" />
              </label>
            )}

            <label>
              Email address
              <input name="email" type="email" placeholder="you@example.com" />
            </label>

            <label>
              Password
              <input name="password" type="password" placeholder="••••••••" />
            </label>

            <button className="auth-submit" type="submit">
              {isLogin ? "Log in" : "Create account"}
            </button>

            <p className="auth-foot">
              {isLogin ? "New here?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  const next = isLogin ? "signup" : "login";
                  setMode(next);
                  navigate(next === "login" ? "/login" : "/signup");
                }}
              >
                {isLogin ? "Create one" : "Log in"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
