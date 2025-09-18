import { Link } from "react-router";
import { Star, Calendar, Eye } from "lucide-react";
import type { Movie } from "../movie.type";

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className = "" }: MovieCardProps) {
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const formatDate = (dateString: string) => {
    if (dateString === "Invalid date") return "TBA";
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  const formatVoteCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <Link to={`/movies/${movie.id}`} className={`group ${className}`}>
      <div className="bg-card h-full rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform">
        {/* Movie Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={
              movie.posterPath?.includes("null")
                ? "/placeholder-movie.jpg"
                : movie.posterPath
            }
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-101"
            loading="lazy"
          />

          {/* Rating Badge */}
          {movie.voteAverage > 0 && (
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-white text-xs font-medium">
                {formatRating(movie.voteAverage)}
              </span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center p-4">
              <Eye className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">View Details</p>
            </div>
          </div>
        </div>

        {/* Movie Info */}
        <div className="p-4 h-full">
          <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {movie.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(movie.releaseDate)}</span>
            </div>

            {movie.voteCount > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{formatVoteCount(movie.voteCount)}</span>
              </div>
            )}
          </div>

          {movie.overview && (
            <p className="text-xs text-muted-foreground line-clamp-3">
              {movie.overview}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
