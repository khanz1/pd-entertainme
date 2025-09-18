import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { RecommendedMovies } from "@/features/movies/components/RecommendedMovies";
import { MovieFilters } from "@/features/movies/components/MovieFilters";
import { MovieGrid } from "@/features/movies/components/MovieGrid";
import { TrendingUp, Sparkles } from "lucide-react";
import type { MovieCategory } from "@/features/movies/movie.type";
import {
  setCurrentCategory,
  setSearchQuery,
  incrementPage,
  setHasMoreMovies,
} from "@/features/movies/movie.slice";
import { useGetMoviesQuery } from "@/features/movies/movie.api";
import { useAppSelector } from "@/hooks/useRedux";

export function HomePage() {
  const reduxDispatch = useDispatch();
  const { currentCategory, searchQuery, currentPage, hasMoreMovies } =
    useAppSelector((state) => state.movies);

  const {
    data: moviesListResponse,
    isLoading: isLoadingMovies,
    isFetching: isFetchingMoreMovies,
  } = useGetMoviesQuery({
    page: currentPage,
    type: currentCategory,
    search: searchQuery || undefined,
  });

  const moviesList = moviesListResponse?.data || [];
  const totalMoviePages = moviesListResponse?.totalPages || 0;

  const handleCategoryChange = useCallback(
    (category: MovieCategory) => {
      reduxDispatch(setCurrentCategory(category));
    },
    [reduxDispatch]
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      reduxDispatch(setSearchQuery(query));
    },
    [reduxDispatch]
  );

  const handleLoadMoreMovies = useCallback(() => {
    if (
      currentPage < totalMoviePages &&
      hasMoreMovies &&
      !isFetchingMoreMovies
    ) {
      reduxDispatch(incrementPage());
    } else if (currentPage >= totalMoviePages) {
      reduxDispatch(setHasMoreMovies(false));
    }
  }, [
    currentPage,
    totalMoviePages,
    hasMoreMovies,
    isFetchingMoreMovies,
    reduxDispatch,
  ]);

  useEffect(() => {
    if (moviesListResponse) {
      reduxDispatch(setHasMoreMovies(currentPage < totalMoviePages));
    }
  }, [moviesListResponse, currentPage, totalMoviePages, reduxDispatch]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Your Gateway to Cinematic Excellence
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover, explore, and collect your favorite movies with AI-powered
          recommendations. Never run out of something amazing to watch.
        </p>
      </div>

      <RecommendedMovies />

      <div className="py-6 mb-8">
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
        {moviesListResponse && (
          <span className="text-sm text-muted-foreground ml-auto">
            {moviesListResponse.totalResults.toLocaleString()} movies found
          </span>
        )}
      </div>

      <MovieGrid
        movies={moviesList}
        loading={isLoadingMovies}
        hasMore={hasMoreMovies}
        onLoadMore={handleLoadMoreMovies}
      />
    </main>
  );
}
