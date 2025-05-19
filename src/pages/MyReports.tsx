
import React from "react";
import { useIssues } from "@/contexts/IssueContext";
import { useAuth } from "@/contexts/AuthContext";
import IssueCard from "@/components/issues/IssueCard";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IssueStatus } from "@/contexts/IssueContext";
import { Plus } from "lucide-react";

const MyReports = () => {
  const { issues } = useIssues();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  const userIssues = issues.filter((issue) => issue.reporterId === user.id);
  
  const getFilteredIssues = (status: IssueStatus) => {
    return userIssues.filter((issue) => issue.status === status);
  };

  const openIssues = getFilteredIssues("open");
  const inProgressIssues = getFilteredIssues("in_progress");
  const resolvedIssues = getFilteredIssues("resolved");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Reports</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all the issues you've reported
          </p>
        </div>
        <Link to="/report">
          <Button className="hidden sm:flex">
            <Plus className="mr-2 h-4 w-4" />
            Report New Issue
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({userIssues.length})</TabsTrigger>
          <TabsTrigger value="open">
            Open ({openIssues.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({inProgressIssues.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedIssues.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {userIssues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <h3 className="text-lg font-medium mb-2">No issues found</h3>
              <p className="text-muted-foreground mb-4">
                You haven't reported any issues yet
              </p>
              <Link to="/report">
                <Button>Report your first issue</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="open">
          {openIssues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {openIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground p-8">
              No open issues found
            </p>
          )}
        </TabsContent>

        <TabsContent value="in_progress">
          {inProgressIssues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground p-8">
              No issues in progress
            </p>
          )}
        </TabsContent>

        <TabsContent value="resolved">
          {resolvedIssues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resolvedIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground p-8">
              No resolved issues yet
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* Mobile fab button */}
      <div className="fixed right-4 bottom-4 sm:hidden">
        <Link to="/report">
          <Button size="lg" className="h-14 w-14 rounded-full">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MyReports;
