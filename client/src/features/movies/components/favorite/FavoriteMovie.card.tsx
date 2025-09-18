import type React from "react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Star, Calendar, Loader2 } from "lucide-react";
import type { FavoriteMovie, Favorite } from "@/features/movies/movie.type";

interface FavoriteMovieCardProps {
  movie: FavoriteMovie;
  favorite: Favorite;
  onRemove: (favoriteId: number) => Promise<void>;
}

export function FavoriteMovieCard({
  movie,
  favorite,
  onRemove,
}: FavoriteMovieCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsRemoving(true);
    try {
      await onRemove(favorite.id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex gap-6 group">
      {/* Movie Poster */}
      <div className="flex-shrink-0">
        <Link to={`/movies/${movie.tmdbId}`}>
          <img
            src={
              movie.posterPath?.includes("null")
                ? "/placeholder-movie.jpg"
                : movie.posterPath
            }
            alt={movie.title}
            className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Movie Info */}
      <div className="flex-1 space-y-3">
        <div>
          <Link to={`/movies/${movie.tmdbId}`}>
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">
              {movie.title}
            </h3>
          </Link>

          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-medium">
                {movie.voteAverage.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
            </div>
            <span>{movie.voteCount.toLocaleString()} votes</span>
          </div>
        </div>

        <p className="text-muted-foreground line-clamp-3 leading-relaxed">
          {movie.overview}
        </p>

        {/* Genres */}
        <div className="flex flex-wrap gap-2">
          {movie.genres?.slice(0, 3).map((genre) => (
            <Badge key={genre.id} variant="secondary" className="text-xs">
              {genre.name}
            </Badge>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          Added on {new Date(favorite.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col justify-between items-end">
        <Button
          size="sm"
          variant="outline"
          onClick={handleRemoveClick}
          disabled={isRemoving}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {isRemoving ? "Removing..." : "Remove"}
        </Button>
      </div>
    </div>
  );
}
