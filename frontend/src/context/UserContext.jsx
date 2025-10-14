import { createContext, useState, useEffect, useMemo } from "react";
import API from "../api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    await API.post("/logout");
  };

  // check if user already logged in
  useEffect(() => {
    API.get("/me")
      .then((res) => {
        if (res.data.user) login(res.data.user);
        else if (res.data.admin) login(res.data.admin);
      })
      .catch(() => {});
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
