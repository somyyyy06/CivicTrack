import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";

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

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export const useIssues = () => {
  const context = useContext(IssueContext);
  if (context === undefined) {
    throw new Error("useIssues must be used within an IssueProvider");
  }
  return context;
};

// Helper function to get dates within the last week
const getRecentDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Sample issues with India-specific locations and recent dates
const sampleIssues: Issue[] = [
  {
    id: "1",
    title: "Pothole on MG Road near Central Mall",
    description:
      "Large pothole causing traffic congestion and vehicle damage. Located near the Central Mall intersection on MG Road.",
    category: "roads",
    status: "open",
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      address: "MG Road, Bangalore, Karnataka",
    },
    reporter: {
      id: "user1",
      name: "Rahul Sharma",
      isAnonymous: false,
    },
    createdAt: getRecentDate(2),
    updatedAt: getRecentDate(2),
    images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400"],
    priority: "high",
    upvotes: 15,
    downvotes: 2,
    isFlagged: false,
    statusLog: [
      {
        status: "open",
        timestamp: getRecentDate(2),
      },
    ],
  },
  {
    id: "2",
    title: "Street Light Not Working in Sector 15",
    description:
      "Multiple street lights are not functioning in Sector 15 residential area, making it unsafe for pedestrians at night.",
    category: "lighting",
    status: "in_progress",
    location: {
      latitude: 28.7041,
      longitude: 77.1025,
      address: "Sector 15, Noida, Uttar Pradesh",
    },
    reporter: {
      id: "user2",
      name: "Priya Patel",
      isAnonymous: false,
    },
    createdAt: getRecentDate(4),
    updatedAt: getRecentDate(1),
    images: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",
    ],
    priority: "medium",
    upvotes: 8,
    downvotes: 1,
    isFlagged: false,
    statusLog: [
      {
        status: "open",
        timestamp: getRecentDate(4),
      },
      {
        status: "in_progress",
        timestamp: getRecentDate(1),
        note: "Work order issued to electrical department",
      },
    ],
  },
  {
    id: "3",
    title: "Water Pipeline Leak in Andheri West",
    description:
      "Major water pipeline leak near Andheri station causing water wastage and road damage. Water flowing onto the main road.",
    category: "water",
    status: "resolved",
    location: {
      latitude: 19.1197,
      longitude: 72.8464,
      address: "Andheri West, Mumbai, Maharashtra",
    },
    reporter: {
      id: "user3",
      name: "Anonymous",
      isAnonymous: true,
    },
    createdAt: getRecentDate(6),
    updatedAt: getRecentDate(1),
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
    priority: "high",
    upvotes: 23,
    downvotes: 0,
    isFlagged: false,
    statusLog: [
      {
        status: "open",
        timestamp: getRecentDate(6),
      },
      {
        status: "in_progress",
        timestamp: getRecentDate(3),
        note: "BMC team dispatched for repair",
      },
      {
        status: "resolved",
        timestamp: getRecentDate(1),
        note: "Pipeline repaired and water supply restored",
      },
    ],
  },
  {
    id: "4",
    title: "Garbage Dumping in Park Area",
    description:
      "Illegal garbage dumping in the children's park near Lake Gardens. Plastic waste and construction debris scattered around.",
    category: "cleanliness",
    status: "open",
    location: {
      latitude: 22.5726,
      longitude: 88.3639,
      address: "Lake Gardens, Kolkata, West Bengal",
    },
    reporter: {
      id: "user4",
      name: "Amit Kumar",
      isAnonymous: false,
    },
    createdAt: getRecentDate(1),
    updatedAt: getRecentDate(1),
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
    priority: "medium",
    upvotes: 12,
    downvotes: 3,
    isFlagged: false,
    statusLog: [
      {
        status: "open",
        timestamp: getRecentDate(1),
      },
    ],
  },
  {
    id: "5",
    title: "Broken Traffic Signal at T Nagar Junction",
    description:
      "Traffic signal not working at the busy T Nagar junction causing traffic chaos during peak hours.",
    category: "public_safety",
    status: "in_progress",
    location: {
      latitude: 13.0827,
      longitude: 80.2707,
      address: "T Nagar Junction, Chennai, Tamil Nadu",
    },
    reporter: {
      id: "user5",
      name: "Lakshmi Devi",
      isAnonymous: false,
    },
    createdAt: getRecentDate(3),
    updatedAt: getRecentDate(1),
    images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400"],
    priority: "high",
    upvotes: 19,
    downvotes: 1,
    isFlagged: false,
    statusLog: [
      {
        status: "open",
        timestamp: getRecentDate(3),
      },
      {
        status: "in_progress",
        timestamp: getRecentDate(1),
        note: "Traffic police deployed, repair team scheduled",
      },
    ],
  },
  {
    id: "6",
    title: "Fallen Tree Blocking Road in Banjara Hills",
    description:
      "Large tree branch fallen on the main road in Banjara Hills, blocking traffic completely. Needs immediate removal.",
    category: "obstructions",
    status: "resolved",
    location: {
      latitude: 17.385,
      longitude: 78.4867,
      address: "Banjara Hills, Hyderabad, Telangana",
    },
    reporter: {
      id: "user6",
      name: "Anonymous",
      isAnonymous: true,
    },
    createdAt: getRecentDate(5),
    updatedAt: getRecentDate(1),
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
    priority: "high",
    upvotes: 7,
    downvotes: 0,
    isFlagged: false,
    statusLog: [
      {
        status: "open",
        timestamp: getRecentDate(5),
      },
      {
        status: "in_progress",
        timestamp: getRecentDate(2),
        note: "Municipal team dispatched for tree removal",
      },
      {
        status: "resolved",
        timestamp: getRecentDate(1),
        note: "Tree branch removed and road cleared",
      },
    ],
  },
  {
    id: "7",
    title: "Sewage Overflow in Indiranagar",
    description:
      "Sewage water overflowing from manhole in Indiranagar residential area, creating health hazard and foul smell.",
    category: "cleanliness",
    status: "open",
    location: {
      latitude: 12.9789,
      longitude: 77.5917,
      address: "Indiranagar, Bangalore, Karnataka",
    },
    reporter: {
      id: "user7",
      name: "Meera Iyer",
      isAnonymous: false,
    },
    createdAt: getRecentDate(2),
    updatedAt: getRecentDate(2),
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
    priority: "high",
    upvotes: 31,
    downvotes: 2,
    isFlagged: false,
    statusLog: [
      {
        status: "open",
        timestamp: getRecentDate(2),
      },
    ],
  },
  {
    id: "8",
    title: "Broken Sidewalk in Connaught Place",
    description:
      "Large cracks and broken tiles on the sidewalk in Connaught Place, making it difficult for pedestrians and elderly people.",
    category: "roads",
    status: "in_progress",
    location: {
      latitude: 28.6324,
      longitude: 77.2188,
      address: "Connaught Place, New Delhi",
    },
    reporter: {
      id: "user8",
      name: "Rajesh Malhotra",
      isAnonymous: false,
    },
    createdAt: getRecentDate(4),
    updatedAt: getRecentDate(1),
    images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400"],
    priority: "medium",
    upvotes: 14,
    downvotes: 1,
    isFlagged: false,
    statusLog: [
      {
        status: "open",
        timestamp: getRecentDate(4),
      },
      {
        status: "in_progress",
        timestamp: getRecentDate(1),
        note: "Municipal corporation has started repair work",
      },
    ],
  },
];

interface IssueProviderProps {
  children: ReactNode;
}

export const IssueProvider: React.FC<IssueProviderProps> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>(sampleIssues);
  const { toast } = useToast();

  const addIssue = (
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
    const issue: Issue = {
      ...newIssue,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      isFlagged: false,
      statusLog: [
        {
          status: "open",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setIssues((prev) => [issue, ...prev]);
    toast({
      title: "Issue reported successfully!",
      description: "Your issue has been submitted and is being reviewed.",
    });
  };

  const updateIssueStatus = (
    issueId: string,
    status: IssueStatus,
    note?: string
  ) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            status,
            updatedAt: new Date().toISOString(),
            statusLog: [
              ...issue.statusLog,
              {
                status,
                timestamp: new Date().toISOString(),
                note,
              },
            ],
          };
        }
        return issue;
      })
    );

    toast({
      title: "Status updated",
      description: `Issue status changed to ${status.replace("_", " ")}.`,
    });
  };

  const upvoteIssue = (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return { ...issue, upvotes: issue.upvotes + 1 };
        }
        return issue;
      })
    );
  };

  const downvoteIssue = (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return { ...issue, downvotes: issue.downvotes + 1 };
        }
        return issue;
      })
    );
  };

  const flagIssue = (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return { ...issue, isFlagged: !issue.isFlagged };
        }
        return issue;
      })
    );

    toast({
      title: "Issue flagged",
      description: "This issue has been flagged for review by administrators.",
    });
  };

  const getIssueById = (id: string) => {
    return issues.find((issue) => issue.id === id);
  };

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
