import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Star,
  Globe,
  Play,
  Heart,
  Share,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  useGetMovieDetailQuery,
  useAddFavoriteMutation,
} from "@/features/movies/movie.api";
import { useAppSelector } from "@/hooks/useRedux";
import { toast } from "sonner";

export function MovieDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const movieId = Number.parseInt(params.id as string);

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);

  const {
    data: movieResponse,
    isLoading,
    error,
  } = useGetMovieDetailQuery(movieId);

  const [addFavorite] = useAddFavoriteMutation();

  const movie = movieResponse?.data;

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      toast("Please login to add movies to favorites");
      return;
    }

    if (!movie) return;

    setIsAddingToFavorites(true);
    try {
      await addFavorite({ tmdbId: movie.id }).unwrap();
      toast("Movie added to favorites!");
      navigate("/favorites");
    } catch (err: any) {
      console.error("Failed to add to favorites:", err);
      toast(err?.data?.message || "Failed to add movie to favorites");
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container m-auto pt-4">
          <Skeleton className="h-10 w-32 mb-6" />
        </div>

        {/* Hero Skeleton */}
        <div className="relative">
          <Skeleton className="h-[60vh] w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0">
            <div className="container m-auto">
              <div className="flex flex-col md:flex-row gap-6">
                <Skeleton className="w-64 h-96 rounded-lg" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-12 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="container m-auto py-12 space-y-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold">Movie Not Found</h2>
            <p className="text-muted-foreground">
              Sorry, we couldn't find the movie you're looking for. It might
              have been removed or doesn't exist.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={() => navigate("/")}>Browse Movies</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative mb-12">
        {/* Back Button */}
        {/* <Button
          onClick={() => navigate(-1)}
          className="mb-4 absolute top-0 left-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Movies
        </Button> */}
        {/* Background Image */}
        {movie.backdropPath && !movie.backdropPath.includes("null") && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${movie.backdropPath})`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />

        {/* Content */}
        <div className="relative container m-auto py-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={
                  movie.posterPath?.includes("null")
                    ? "/placeholder-movie.jpg"
                    : movie.posterPath
                }
                alt={movie.title}
                className="w-64 h-96 object-cover rounded-lg shadow-2xl"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                  {movie.title}
                </h1>
                {movie.originalTitle !== movie.title && (
                  <p className="text-xl text-muted-foreground">
                    {movie.originalTitle}
                  </p>
                )}
                {movie.tagline && (
                  <p className="text-lg italic text-primary mt-2">
                    "{movie.tagline}"
                  </p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">
                    {movie.voteAverage.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({movie.voteCount.toLocaleString()} votes)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(movie.releaseDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{movie.originalLanguage.toUpperCase()}</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>

              {/* Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {movie.overview || "No overview available."}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2">
                  <Play className="h-4 w-4" />
                  Watch Trailer
                </Button>
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    onClick={handleAddToFavorites}
                    disabled={isAddingToFavorites}
                  >
                    {isAddingToFavorites ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className="h-4 w-4" />
                    )}
                    {isAddingToFavorites ? "Adding..." : "Add to Favorites"}
                  </Button>
                )}
                <Button variant="outline" size="lg" className="gap-2">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                {movie.homepage && (
                  <Button variant="outline" size="lg" className="gap-2" asChild>
                    <a
                      href={movie.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="container m-auto pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Collection */}
            {movie.belongsToCollection && (
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Part of Collection
                </h3>
                <div className="flex items-center gap-4">
                  <img
                    src={
                      movie.belongsToCollection.posterPath?.includes("null")
                        ? "/placeholder-movie.jpg"
                        : movie.belongsToCollection.posterPath
                    }
                    alt={movie.belongsToCollection.name}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium">
                      {movie.belongsToCollection.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      View Collection
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Production Companies */}
            {movie.productionCompanies.length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Production Companies
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {movie.productionCompanies.map((company) => (
                    <div key={company.id} className="text-center">
                      {company.logoPath &&
                        !company.logoPath.includes("null") && (
                          <img
                            src={company.logoPath}
                            alt={company.name}
                            className="h-12 mx-auto mb-2 object-contain"
                          />
                        )}
                      <p className="text-sm font-medium">{company.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {company.originCountry}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Movie Facts */}
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Movie Facts</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm">Status</h4>
                  <p className="text-muted-foreground">{movie.status}</p>
                </div>

                {movie.budget > 0 && (
                  <div>
                    <h4 className="font-medium text-sm">Budget</h4>
                    <p className="text-muted-foreground">
                      {formatCurrency(movie.budget)}
                    </p>
                  </div>
                )}

                {movie.revenue > 0 && (
                  <div>
                    <h4 className="font-medium text-sm">Revenue</h4>
                    <p className="text-muted-foreground">
                      {formatCurrency(movie.revenue)}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-sm">Original Language</h4>
                  <p className="text-muted-foreground">
                    {movie.originalLanguage.toUpperCase()}
                  </p>
                </div>

                {movie.imdbId && (
                  <div>
                    <h4 className="font-medium text-sm">IMDB ID</h4>
                    <a
                      href={`https://www.imdb.com/title/${movie.imdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {movie.imdbId}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Languages */}
            {movie.spokenLanguages.length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-4">Languages</h3>
                <div className="space-y-2">
                  {movie.spokenLanguages.map((language, index) => (
                    <div key={index}>
                      <p className="font-medium text-sm">
                        {language.englishName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Countries */}
            {movie.productionCountries.length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Production Countries
                </h3>
                <div className="space-y-1">
                  {movie.productionCountries.map((country, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {country.name}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
