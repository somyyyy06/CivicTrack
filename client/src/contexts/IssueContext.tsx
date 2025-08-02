import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useToast } from "@/hooks/use-toast";

// Types
export type IssueCategory =
  | "roads"
  | "lighting"
  | "water"
  | "cleanliness"
  | "public_safety"
  | "obstructions";

export type IssueStatus = "open" | "in_progress" | "resolved";

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  reporter: {
    id: string;
    name: string;
    isAnonymous: boolean;
  };
  createdAt: string;
  updatedAt: string;
  images: string[];
  priority: "low" | "medium" | "high";
  upvotes: number;
  downvotes: number;
  isFlagged: boolean;
  statusLog: {
    status: IssueStatus;
    timestamp: string;
    note?: string;
  }[];
}

interface IssueContextType {
  issues: Issue[];
  addIssue: (
    issue: Omit<
      Issue,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "upvotes"
      | "downvotes"
      | "isFlagged"
      | "statusLog"
    >
  ) => void;
  updateIssueStatus: (
    issueId: string,
    status: IssueStatus,
    note?: string
  ) => void;
  upvoteIssue: (issueId: string) => void;
  downvoteIssue: (issueId: string) => void;
  flagIssue: (issueId: string) => void;
  getIssueById: (id: string) => Issue | undefined;
}

interface IssueProviderProps {
  children: ReactNode;
}

// Context
const IssueContext = createContext<IssueContextType | undefined>(undefined);

export const useIssues = () => {
  const context = useContext(IssueContext);
  if (context === undefined) {
    throw new Error("useIssues must be used within an IssueProvider");
  }
  return context;
};

// API URL
const API_URL = "http://localhost:3000";

export const IssueProvider: React.FC<IssueProviderProps> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const { toast } = useToast();

  // Fetch issues from backend
  useEffect(() => {
    fetch(`${API_URL}/api/issues`)
      .then((res) => res.json())
      .then(setIssues)
      .catch(() =>
        toast({ title: "Failed to fetch issues", variant: "destructive" })
      );
  }, []);

  const addIssue = async (
    newIssue: Omit<
      Issue,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "upvotes"
      | "downvotes"
      | "isFlagged"
      | "statusLog"
    >
  ) => {
    const res = await fetch(`${API_URL}/api/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newIssue),
    });
    if (!res.ok) throw new Error("Failed to add issue");
    const issue = await res.json();
    setIssues((prev) => [issue, ...prev]);
    toast({
      title: "Issue reported successfully!",
      description: "Your issue has been submitted and is being reviewed.",
    });
  };

  const updateIssueStatus = async (
    issueId: string,
    status: IssueStatus,
    note?: string
  ) => {
    const res = await fetch(`${API_URL}/api/issues/${issueId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    if (!res.ok) throw new Error("Failed to update issue");
    const updated = await res.json();
    setIssues((prev) =>
      prev.map((issue) => (issue.id === issueId ? updated : issue))
    );
    toast({
      title: "Status updated",
      description: `Issue status changed to ${status.replace("_", " ")}.`,
    });
  };

  const upvoteIssue = async (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, upvotes: issue.upvotes + 1 } : issue
      )
    );
  };

  const downvoteIssue = async (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId
          ? { ...issue, downvotes: issue.downvotes + 1 }
          : issue
      )
    );
  };

  const flagIssue = async (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, isFlagged: !issue.isFlagged } : issue
      )
    );
    toast({
      title: "Issue flagged",
      description: "This issue has been flagged for review by administrators.",
    });
  };

  const getIssueById = (id: string) => issues.find((issue) => issue.id === id);

  const value: IssueContextType = {
    issues,
    addIssue,
    updateIssueStatus,
    upvoteIssue,
    downvoteIssue,
    flagIssue,
    getIssueById,
  };

  return (
    <IssueContext.Provider value={value}>{children}</IssueContext.Provider>
  );
};
