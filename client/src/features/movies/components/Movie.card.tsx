import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Movie } from "@/features/movies/movie.type";

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg ${className}`}
    >
      <Link to={`/movies/${movie.id}`}>
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={
              movie.posterPath?.includes("null")
                ? "/placeholder-movie.jpg"
                : movie.posterPath || "/placeholder.svg"
            }
            alt={movie.title}
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Rating badge */}
          <Badge className="absolute bottom-2 left-2 bg-black/70 text-white">
            <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
            {movie.voteAverage.toFixed(1)}
          </Badge>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/movies/${movie.id}`}>
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            {new Date(movie.releaseDate).getFullYear()}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-3">
            {movie.overview}
          </p>
        </Link>
      </CardContent>
    </Card>
  );
}
