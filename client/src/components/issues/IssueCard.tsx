import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  MapPin,
  Clock,
  User,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Issue } from "@/contexts/IssueContext";
import { cn } from "@/lib/utils";

interface IssueCardProps {
  issue: Issue;
  onUpvote?: (issueId: string) => void;
  onDownvote?: (issueId: string) => void;
  onFlag?: (issueId: string) => void;
  showActions?: boolean;
}

const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onUpvote,
  onDownvote,
  onFlag,
  showActions = true,
}) => {
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "roads":
        return "🛣️";
      case "lighting":
        return "💡";
      case "water":
        return "💧";
      case "cleanliness":
        return "🧹";
      case "public_safety":
        return "🛡️";
      case "obstructions":
        return "🚧";
      default:
        return "📍";
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
  };

  return (
    <>
      <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold mb-2">
                {issue.title}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {getCategoryIcon(issue.category)}
                </span>
                <Badge variant="outline" className="capitalize">
                  {issue.category.replace("_", " ")}
                </Badge>
                <Badge className={getStatusColor(issue.status)}>
                  {issue.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
            {showActions && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpvote?.(issue.id);
                  }}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{issue.upvotes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownvote?.(issue.id);
                  }}
                  className="flex items-center gap-1"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>{issue.downvotes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFlag?.(issue.id);
                  }}
                  className={cn(
                    "flex items-center gap-1",
                    issue.isFlagged && "text-red-500"
                  )}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-gray-600 mb-4 line-clamp-3">{issue.description}</p>

          {/* Image Gallery */}
          {issue.images && issue.images.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Images ({issue.images.length})
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {issue.images.slice(0, 3).map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      src={image}
                      alt={`Issue ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 2 && issue.images.length > 3 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          +{issue.images.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate max-w-32">
                  {issue.location.address}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(issue.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>
                  {issue.reporter.isAnonymous
                    ? "Anonymous"
                    : issue.reporter.name}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/issues/${issue.id}`)}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Modal */}
      {selectedImageIndex !== null && issue.images && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeImageModal}
              className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="flex items-center justify-center">
              <img
                src={issue.images[selectedImageIndex]}
                alt={`Issue ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
            {issue.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {issue.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-colors",
                      index === selectedImageIndex
                        ? "bg-white"
                        : "bg-white bg-opacity-50"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default IssueCard;
