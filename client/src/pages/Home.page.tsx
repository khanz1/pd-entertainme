import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { RecommendedMovies } from "@/features/movies/components/RecommendedMovies";
import { MovieFilters } from "@/features/movies/components/MovieFilters";
import { MovieGrid } from "@/features/movies/components/MovieGrid";
import { Film, TrendingUp, Sparkles } from "lucide-react";
import type { MovieCategory } from "@/features/movies/movie.type";
import {
  setCurrentCategory,
  setSearchQuery,
  incrementPage,
  setHasMore,
} from "@/features/movies/movie.slice";
import { useGetMoviesQuery } from "@/features/movies/movie.api";
import { useAppSelector } from "@/hooks/useRedux";

export function HomePage() {
  const dispatch = useDispatch();
  const { currentCategory, searchQuery, currentPage, hasMore } = useAppSelector(
    (state) => state.movies
  );

  const {
    data: movieResponse,
    isLoading,
    isFetching,
  } = useGetMoviesQuery({
    page: currentPage,
    type: currentCategory,
    search: searchQuery || undefined,
  });

  const movies = movieResponse?.data || [];
  const totalPages = movieResponse?.totalPages || 0;

  // Handle category change
  const handleCategoryChange = useCallback(
    (category: MovieCategory) => {
      dispatch(setCurrentCategory(category));
    },
    [dispatch]
  );

  // Handle search
  const handleSearchChange = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  // Handle load more for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages && hasMore && !isFetching) {
      dispatch(incrementPage());
    } else if (currentPage >= totalPages) {
      dispatch(setHasMore(false));
    }
  }, [currentPage, totalPages, hasMore, isFetching, dispatch]);

  // Update hasMore when data changes
  useEffect(() => {
    if (movieResponse) {
      dispatch(setHasMore(currentPage < totalPages));
    }
  }, [movieResponse, currentPage, totalPages, dispatch]);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Film className="h-10 w-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Discover Amazing Movies
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore thousands of movies, get personalized recommendations, and
          never run out of something great to watch.
        </p>
      </div>

      {/* AI Recommended Movies - Horizontal Scroll */}
      <RecommendedMovies />

      {/* Discover Movies Section */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Discover Movies</h2>
        </div>

        <MovieFilters
          activeCategory={currentCategory}
          searchQuery={searchQuery}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
        />
      </div>

      {/* Movie Grid with Infinite Scroll */}
      <div className="bg-card/30 backdrop-blur-sm rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : currentCategory === "now_playing"
              ? "Now Playing"
              : currentCategory === "top_rated"
              ? "Top Rated Movies"
              : "Popular Movies"}
          </h3>
          {movieResponse && (
            <span className="text-sm text-muted-foreground ml-auto">
              {movieResponse.totalResults.toLocaleString()} movies found
            </span>
          )}
        </div>

        <MovieGrid
          movies={movies}
          loading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      </div>
    </main>
  );
}
