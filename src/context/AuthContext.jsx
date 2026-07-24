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

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
