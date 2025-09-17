"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2 } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Movie } from "@/features/movies/movie.type";

interface MovieGridProps {
  movies: Movie[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function MovieGrid({
  movies,
  loading,
  hasMore,
  onLoadMore,
}: MovieGridProps) {
  if (loading && movies.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!movies.length && !loading) {
    return (
      <div className="text-center py-20">
        <div className="text-muted-foreground mb-2">No movies found</div>
        <p className="text-muted-foreground text-sm">
          Try selecting a different category or search term.
        </p>
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={movies.length}
      next={onLoadMore}
      hasMore={hasMore}
      loader={
        <div className="col-span-full flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
      endMessage={
        <div className="col-span-full text-center py-8 text-muted-foreground">
          <p>You've reached the end! 🎬</p>
        </div>
      }
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
      {movies.map((movie: Movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </InfiniteScroll>
  );
}
