"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Clock, Calendar, Globe } from "lucide-react";
import type { ITMDBMovieDetail } from "@/features/movies/movie.type";

interface MovieDetailHeroProps {
  movie: ITMDBMovieDetail;
}

export function MovieDetailHero({ movie }: MovieDetailHeroProps) {
  const handleFavoriteClick = () => {
    const movieData = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      overview: movie.overview,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      genre_ids: movie.genres.map((g) => g.id),
    };
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="relative">
      {/* Backdrop Image */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={
            `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` ||
            "/placeholder.svg"
          }
          alt={movie.title}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="relative w-48 md:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={
                    `https://image.tmdb.org/t/p/w500${movie.poster_path}` ||
                    "/placeholder.svg"
                  }
                  alt={movie.title}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Movie Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-lg text-gray-300 italic">
                    {movie.tagline}
                  </p>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>

              {/* Rating and Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-white">
                    {movie.vote_average.toFixed(1)}
                  </span>
                  <span>({movie.vote_count.toLocaleString()} votes)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{movie.origin_country.join(", ")}</span>
                </div>
              </div>

              {/* Overview */}
              <p className="text-gray-200 text-base leading-relaxed max-w-3xl">
                {movie.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={handleFavoriteClick}
                  variant={"outline"}
                >
                  <Heart className={`mr-2 h-5 w-5`} />
                </Button>
                {movie.homepage && (
                  <Button size="lg" variant="outline" asChild>
                    <a
                      href={movie.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
