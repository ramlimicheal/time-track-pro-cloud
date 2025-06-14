
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Search, Filter, X } from "lucide-react";
import { format } from "date-fns";

interface FilterState {
  search: string;
  status: string[];
  dateRange: { from: Date | null; to: Date | null };
  hoursRange: { min: number | null; max: number | null };
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export const AdvancedFilters = ({ onFilterChange }: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    dateRange: { from: null, to: null },
    hoursRange: { min: null, max: null }
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      status: [],
      dateRange: { from: null, to: null },
      hoursRange: { min: null, max: null }
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilters({ status: newStatus });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.hoursRange.min !== null || filters.hoursRange.max !== null) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Search - Always Visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search descriptions, remarks..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        {/* Status Filter - Always Visible */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <div className="flex flex-wrap gap-2">
            {["approved", "pending", "rejected", "draft"].map(status => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={status}
                  checked={filters.status.includes(status)}
                  onCheckedChange={() => toggleStatus(status)}
                />
                <label
                  htmlFor={status}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {status}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <>
            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? format(filters.dateRange.from, "MMM d, yyyy") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from || undefined}
                      onSelect={(date) => updateFilters({ 
                        dateRange: { ...filters.dateRange, from: date || null }
                      })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? format(filters.dateRange.to, "MMM d, yyyy") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to || undefined}
                      onSelect={(date) => updateFilters({ 
                        dateRange: { ...filters.dateRange, to: date || null }
                      })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Hours Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hours Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    placeholder="Min hours"
                    value={filters.hoursRange.min || ""}
                    onChange={(e) => updateFilters({
                      hoursRange: {
                        ...filters.hoursRange,
                        min: e.target.value ? parseFloat(e.target.value) : null
                      }
                    })}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Max hours"
                    value={filters.hoursRange.max || ""}
                    onChange={(e) => updateFilters({
                      hoursRange: {
                        ...filters.hoursRange,
                        max: e.target.value ? parseFloat(e.target.value) : null
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Quick Filter Presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Filters</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({
                    dateRange: {
                      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      to: new Date()
                    }
                  })}
                >
                  Last 30 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({
                    hoursRange: { min: 8, max: null }
                  })}
                >
                  8+ Hours
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({
                    status: ["pending"]
                  })}
                >
                  Pending Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({
                    status: ["approved"]
                  })}
                >
                  Approved Only
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: "{filters.search}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({ search: "" })}
                  />
                </Badge>
              )}
              {filters.status.map(status => (
                <Badge key={status} variant="outline" className="flex items-center gap-1">
                  Status: {status}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleStatus(status)}
                  />
                </Badge>
              ))}
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Date Range
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({ dateRange: { from: null, to: null } })}
                  />
                </Badge>
              )}
              {(filters.hoursRange.min !== null || filters.hoursRange.max !== null) && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Hours: {filters.hoursRange.min || "0"}-{filters.hoursRange.max || "∞"}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({ hoursRange: { min: null, max: null } })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
