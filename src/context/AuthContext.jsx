import { createContext, useContext, useEffect, useState } from "react";
import { isTokenExpired, refreshAccessToken } from "../Api/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser && storedUser !== "undefined") {
        let activeToken = storedToken;
        let parsedUser = null;
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (e) {
          parsedUser = null;
        }

        if (isTokenExpired(storedToken)) {
          try {
            activeToken = await refreshAccessToken();
            setToken(activeToken);
            setUser(parsedUser);
          } catch (refreshErr) {
            localStorage.clear();
            setToken(null);
            setUser(null);
          }
        } else {
          setToken(activeToken);
          setUser(parsedUser);
        }
      } else {
        localStorage.clear();
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

const login = (token, user) => {
  if (!token || !user) return;

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  setToken(token);
  setUser(user);
};

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  // Automatic timeout: sign the user out after 30 minutes without any interaction.
  // A playing audio track or a running breathing/meditation session counts as activity.
  useEffect(() => {
    if (!token) return undefined;
    const IDLE_LIMIT_MS = 30 * 60 * 1000;
    let lastActivity = Date.now();
    const markActive = () => {
      lastActivity = Date.now();
    };
    const events = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, markActive, { passive: true }));

    const interval = setInterval(() => {
      const audioPlaying = Array.from(document.querySelectorAll("audio")).some((a) => !a.paused && !a.ended);
      const sessionOpen = !!document.querySelector('[role="dialog"][aria-label*="session" i]');
      if (audioPlaying || sessionOpen) {
        lastActivity = Date.now();
        return;
      }
      if (Date.now() - lastActivity >= IDLE_LIMIT_MS) {
        sessionStorage.setItem("device_switched_msg", "You were signed out after 30 minutes of inactivity.");
        localStorage.clear();
        setToken(null);
        setUser(null);
      }
    }, 30 * 1000);

    return () => {
      clearInterval(interval);
      events.forEach((ev) => window.removeEventListener(ev, markActive));
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
