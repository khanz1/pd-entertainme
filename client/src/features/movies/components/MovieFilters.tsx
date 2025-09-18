import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, X, ChevronDown } from "lucide-react";
import type { MovieCategory } from "@/features/movies/movie.type";

interface MovieFiltersProps {
  activeCategory: MovieCategory;
  searchQuery: string;
  onCategoryChange: (category: MovieCategory) => void;
  onSearchChange: (query: string) => void;
}

const categories: { key: MovieCategory; label: string }[] = [
  { key: "now_playing", label: "Now Playing" },
  { key: "popular", label: "Popular" },
  { key: "top_rated", label: "Top Rated" },
  { key: "upcoming", label: "Upcoming" },
];

export function MovieFilters({
  activeCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
}: MovieFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [debouncedSearch] = useDebounce(localSearch, 400);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, searchQuery, onSearchChange]);

  // Sync local search with external search query changes
  useEffect(() => {
    if (searchQuery !== localSearch && searchQuery !== debouncedSearch) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery, localSearch, debouncedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission will use the current localSearch value immediately
    onSearchChange(localSearch);
  };

  const clearSearch = () => {
    setLocalSearch("");
    onSearchChange("");
    onCategoryChange("popular");
  };

  return (
    <div className="space-y-4">
      {/* Search Bar and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search movies..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {(localSearch || searchQuery) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>

        {/* Category Select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-[180px] justify-between"
              disabled={activeCategory === "search" && searchQuery.length > 0}
            >
              {categories.find(
                (cat) =>
                  cat.key ===
                  (activeCategory === "search" ? "popular" : activeCategory)
              )?.label || "Select category"}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[180px]">
            {categories.map((category) => (
              <DropdownMenuItem
                key={category.key}
                onClick={() => onCategoryChange(category.key)}
                className={activeCategory === category.key ? "bg-accent" : ""}
              >
                {category.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Search Indicator */}
      {activeCategory === "search" && searchQuery && (
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-md text-sm w-fit">
          <span className="text-muted-foreground">Searching for:</span>
          <span className="font-medium">"{searchQuery}"</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="h-5 w-5 p-0 hover:bg-transparent ml-1"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
