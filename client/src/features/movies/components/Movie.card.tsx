"use client";

import type React from "react";

import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";
import type { Movie } from "@/features/movies/movie.type";
import { useState } from "react";

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  const [isMovieFavorite, setIsMovieFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg ${className}`}
    >
      <Link to={`/movie/${movie.id}`}>
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={"/placeholder.svg"}
            alt={movie.title}
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Favorite button */}
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            onClick={handleFavoriteClick}
          >
            <Heart
              className={`h-4 w-4 ${
                isMovieFavorite ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </Button>

          {/* Rating badge */}
          <Badge className="absolute bottom-2 left-2 bg-black/70 text-white">
            <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
            {movie.vote_average.toFixed(1)}
          </Badge>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/movie/${movie.id}`}>
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            {new Date(movie.release_date).getFullYear()}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-3">
            {movie.overview}
          </p>
        </Link>
      </CardContent>
    </Card>
  );
}
