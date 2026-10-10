import {
  createContext,
  useEffect,
  useState,
} from "react";

import { getProfile } from "@/services/authService";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await getProfile();

      if (response?.token) {
        localStorage.setItem("accessToken", response.token);
      }

      setUser(response.data);
    } catch (error) {
      console.error(error);

      localStorage.removeItem("accessToken");

      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");

    setUser(null);
  };

  useEffect(() => {
    const loadUser = async () => {
      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);

        return;
      }

      await refreshUser();

      setLoading(false);
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;