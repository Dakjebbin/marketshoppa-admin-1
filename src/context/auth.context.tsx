"use client";

import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

interface User {
  fullName: string;
  email: string;
  address: string;
  createdAt: string;
  _id: string;
  updatedAt: string;
  role: string
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

axios.defaults.withCredentials = true;

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_BASE_URL || "/api";

  useEffect(() => {
    const validResponse = async () => {
      try {
        const response = await axios.get(`${baseUrl}/authUser/validate`, {
          withCredentials: true,
        });

        if (response.data.success === true) {
          setUser(response?.data?.validUser);
        } else {
          console.error("An error Occured");
        }
      } catch (error) {
        if (error instanceof axios.AxiosError) {
          if (error?.response?.data) {
            console.error(error?.response?.data?.message);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    validResponse();
  }, [baseUrl]);

  const contextValue = useMemo<AuthContextType>(
    () => ({ user, setUser }),
    [user]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {loading ? <div>Loading...</div> : <div> {children} </div>}
    </AuthContext.Provider>
  );
};
