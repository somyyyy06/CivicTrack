import React from "react";
import { IssueCategory, IssueStatus } from "@/contexts/IssueContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface IssueFilterControlProps {
  onChange: (filters: {
    category?: IssueCategory;
    status?: IssueStatus;
  }) => void;
}

const IssueFilterControl: React.FC<IssueFilterControlProps> = ({
  onChange,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<
    IssueCategory | ""
  >("");
  const [selectedStatus, setSelectedStatus] = React.useState<IssueStatus | "">(
    ""
  );

  const handleCategoryChange = (value: string) => {
    const category = value as IssueCategory;
    setSelectedCategory(category);
    onChange({
      category: category || undefined,
      status: selectedStatus || undefined,
    });
  };

  const handleStatusChange = (value: string) => {
    const status = value as IssueStatus;
    setSelectedStatus(status);
    onChange({
      category: selectedCategory || undefined,
      status: status || undefined,
    });
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedStatus("");
    onChange({});
  };

  const hasActiveFilters = selectedCategory || selectedStatus;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Category
          </label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="roads">Roads</SelectItem>
              <SelectItem value="lighting">Lighting</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="cleanliness">Cleanliness</SelectItem>
              <SelectItem value="public_safety">Public Safety</SelectItem>
              <SelectItem value="obstructions">Obstructions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Status
          </label>
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default IssueFilterControl;
