
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminIssueTable from "@/components/admin/AdminIssueTable";
import { useIssues } from "@/contexts/IssueContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const { issues } = useIssues();
  const navigate = useNavigate();

  // Redirect if not an admin
  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin()) return null;

  const openIssues = issues.filter((issue) => issue.status === "open");
  const inProgressIssues = issues.filter((issue) => issue.status === "in_progress");
  const resolvedIssues = issues.filter((issue) => issue.status === "resolved");
  
  const stats = [
    { 
      title: "Open Issues", 
      value: openIssues.length, 
      description: "Awaiting review and action", 
      icon: <AlertCircle className="h-4 w-4 text-civic-red" />,
      iconBg: "bg-red-100",
    },
    { 
      title: "In Progress", 
      value: inProgressIssues.length, 
      description: "Currently being addressed", 
      icon: <Loader2 className="h-4 w-4 text-civic-yellow animate-spin" />,
      iconBg: "bg-yellow-100",
    },
    { 
      title: "Resolved", 
      value: resolvedIssues.length, 
      description: "Successfully completed", 
      icon: <CheckCircle2 className="h-4 w-4 text-civic-green" />,
      iconBg: "bg-green-100",
    },
    { 
      title: "Total Issues", 
      value: issues.length, 
      description: "Overall count", 
      icon: null,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage and oversee all reported community issues
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon && (
                  <div className={`p-2 rounded-full ${stat.iconBg}`}>
                    {stat.icon}
                  </div>
                )}
              </div>
              <CardDescription>{stat.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue Management</CardTitle>
          <CardDescription>
            View, filter, and update status for all reported issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Issues</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <AdminIssueTable />
            </TabsContent>
            <TabsContent value="open">
              <AdminIssueTable />
            </TabsContent>
            <TabsContent value="in_progress">
              <AdminIssueTable />
            </TabsContent>
            <TabsContent value="resolved">
              <AdminIssueTable />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
