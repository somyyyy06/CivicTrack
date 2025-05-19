
import React from "react";
import { Link } from "react-router-dom";
import { Issue, IssueStatus } from "@/contexts/IssueContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">Open</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-civic-yellow text-black">In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-civic-green text-white">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const timeAgo = formatDistance(new Date(issue.createdAt), new Date(), {
    addSuffix: true,
  });

  return (
    <Link to={`/issue/${issue.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        {issue.photos.length > 0 && (
          <div className="h-40 overflow-hidden">
            <img
              src={issue.photos[0]}
              alt={issue.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{issue.title}</CardTitle>
            {getStatusBadge(issue.status)}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {issue.description}
          </p>
        </CardContent>
        <CardFooter className="pt-0 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
          <span>{formatCategory(issue.category)}</span>
          <span>{timeAgo}</span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default IssueCard;
