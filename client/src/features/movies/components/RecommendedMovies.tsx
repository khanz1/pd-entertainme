import { useRef, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { MovieCard } from "./MovieCard";
import { ChevronLeft, ChevronRight, Sparkles, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { RootState } from "@/store";
import { useGetRecommendationsQuery } from "../movie.api";

export function RecommendedMovies() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Edge detection state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const {
    data: recommendationsResponse,
    isLoading,
    error,
  } = useGetRecommendationsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const recommendations = recommendationsResponse?.data || [];

  // Update scroll button states
  const updateScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  // Check scroll position when content changes
  useEffect(() => {
    updateScrollButtons();
  }, [recommendations, updateScrollButtons]);

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      return () => container.removeEventListener("scroll", updateScrollButtons);
    }
  }, [updateScrollButtons]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of movie card + gap
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">AI Recommended for You</h2>
        </div>
        <div className="bg-card border rounded-lg p-8 text-center">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Login to Get Personalized Recommendations
          </h3>
          <p className="text-muted-foreground mb-4">
            Discover movies tailored to your taste with our AI-powered
            recommendation system.
          </p>
          <Link to="/login">
            <Button>Sign In to Continue</Button>
          </Link>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">AI Recommended for You</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Failed to load recommended movies. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">AI Recommended for You</h2>
        </div>
        {recommendations.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="h-8 w-8 p-0 transition-opacity duration-200"
              style={{ opacity: canScrollLeft ? 1 : 0.5 }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="h-8 w-8 p-0 transition-opacity duration-200"
              style={{ opacity: canScrollRight ? 1 : 0.5 }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48">
                <Skeleton className="aspect-[2/3] w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          : recommendations.map((recommendation) => (
              <MovieCard
                key={recommendation.id}
                movie={recommendation.movie}
                className="flex-shrink-0 w-48"
              />
            ))}
      </div>

      {!isLoading && recommendations.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No recommendations available yet. Start rating some movies!
          </p>
        </div>
      )}
    </section>
  );
}
