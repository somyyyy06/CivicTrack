
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

type User = {
  id: string;
  name: string;
  email: string;
  role: "reporter" | "admin";
} | null;

interface AuthContextType {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demonstration
const MOCK_USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@civicspot.com",
    password: "password123",
    role: "admin" as const,
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@civicspot.com",
    password: "password123",
    role: "reporter" as const,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("civicspot_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // Remove password before storing the user
      const { password: _, ...secureUser } = foundUser;
      
      localStorage.setItem("civicspot_user", JSON.stringify(secureUser));
      setUser(secureUser);
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${secureUser.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if user already exists
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error("Email already in use");
      }
      
      // In a real app, we would create the user in the database
      const newUser = {
        id: String(MOCK_USERS.length + 1),
        name,
        email,
        role: "reporter" as const,
      };
      
      localStorage.setItem("civicspot_user", JSON.stringify(newUser));
      setUser(newUser);
      
      toast({
        title: "Account created",
        description: "Welcome to CivicSpot!",
      });
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("civicspot_user");
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
