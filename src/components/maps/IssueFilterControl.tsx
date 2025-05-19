
import React, { useState } from 'react';
import { IssueCategory, IssueStatus } from '@/contexts/IssueContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface IssueFilterControlProps {
  onChange: (filters: { category?: IssueCategory; status?: IssueStatus }) => void;
}

const IssueFilterControl: React.FC<IssueFilterControlProps> = ({ onChange }) => {
  const [category, setCategory] = useState<IssueCategory | undefined>(undefined);
  const [status, setStatus] = useState<IssueStatus | undefined>(undefined);

  const handleCategoryChange = (value: string) => {
    const newCategory = value === 'all' ? undefined : value as IssueCategory;
    setCategory(newCategory);
    onChange({ category: newCategory, status });
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value === 'all' ? undefined : value as IssueStatus;
    setStatus(newStatus);
    onChange({ category, status: newStatus });
  };

  const handleReset = () => {
    setCategory(undefined);
    setStatus(undefined);
    onChange({});
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <Select value={category || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger id="category-filter">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="road_damage">Road Damage</SelectItem>
            <SelectItem value="sanitation">Sanitation</SelectItem>
            <SelectItem value="lighting">Lighting</SelectItem>
            <SelectItem value="graffiti">Graffiti</SelectItem>
            <SelectItem value="sidewalk">Sidewalk</SelectItem>
            <SelectItem value="vegetation">Vegetation</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status
        </label>
        <Select value={status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={handleReset}>
        Reset Filters
      </Button>
    </div>
  );
};

export default IssueFilterControl;
