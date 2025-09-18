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
  const routeParams = useParams();
  const navigateToPage = useNavigate();
  const movieId = Number.parseInt(routeParams.id as string);

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isAddingMovieToFavorites, setIsAddingMovieToFavorites] =
    useState(false);

  const {
    data: movieDetailResponse,
    isLoading: isLoadingMovieDetail,
    error: movieDetailError,
  } = useGetMovieDetailQuery(movieId);

  const [addMovieToFavorites] = useAddFavoriteMutation();

  const movieDetail = movieDetailResponse?.data;

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      toast("Please login to add movies to favorites");
      return;
    }

    if (!movieDetail) return;

    setIsAddingMovieToFavorites(true);
    try {
      await addMovieToFavorites({ tmdbId: movieDetail.id }).unwrap();
      toast("Movie added to favorites!");
      navigateToPage("/favorites");
    } catch (error: any) {
      console.error("Failed to add to favorites:", error);
      toast(error?.data?.message || "Failed to add movie to favorites");
    } finally {
      setIsAddingMovieToFavorites(false);
    }
  };

  if (isLoadingMovieDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container m-auto pt-4">
          <Skeleton className="h-10 w-32 mb-6" />
        </div>

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

  if (movieDetailError || !movieDetail) {
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
              <Button onClick={() => navigateToPage(-1)} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={() => navigateToPage("/")}>Browse Movies</Button>
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
      <div className="relative mb-12">
        {/* <Button
          onClick={() => navigate(-1)}
          className="mb-4 absolute top-0 left-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Movies
        </Button> */}
        {movieDetail.backdropPath &&
          !movieDetail.backdropPath.includes("null") && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${movieDetail.backdropPath})`,
              }}
            />
          )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />

        <div className="relative container m-auto py-16">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-shrink-0">
              <img
                src={
                  movieDetail.posterPath?.includes("null")
                    ? "/placeholder-movieDetail.jpg"
                    : movieDetail.posterPath
                }
                alt={movieDetail.title}
                className="w-64 h-96 object-cover rounded-lg shadow-2xl"
              />
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                  {movieDetail.title}
                </h1>
                {movieDetail.originalTitle !== movieDetail.title && (
                  <p className="text-xl text-muted-foreground">
                    {movieDetail.originalTitle}
                  </p>
                )}
                {movieDetail.tagline && (
                  <p className="text-lg italic text-primary mt-2">
                    "{movieDetail.tagline}"
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">
                    {movieDetail.voteAverage.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({movieDetail.voteCount.toLocaleString()} votes)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(movieDetail.releaseDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatRuntime(movieDetail.runtime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{movieDetail.originalLanguage.toUpperCase()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {movieDetail.genres.map(
                  (genre: { id: number; name: string }) => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  )
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {movieDetail.overview || "No overview available."}
                </p>
              </div>

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
                    disabled={isAddingMovieToFavorites}
                  >
                    {isAddingMovieToFavorites ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className="h-4 w-4" />
                    )}
                    {isAddingMovieToFavorites
                      ? "Adding..."
                      : "Add to Favorites"}
                  </Button>
                )}
                <Button variant="outline" size="lg" className="gap-2">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                {movieDetail.homepage && (
                  <Button variant="outline" size="lg" className="gap-2" asChild>
                    <a
                      href={movieDetail.homepage}
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

      <div className="container m-auto pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {movieDetail.belongsToCollection && (
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Part of Collection
                </h3>
                <div className="flex items-center gap-4">
                  <img
                    src={
                      movieDetail.belongsToCollection.posterPath?.includes(
                        "null"
                      )
                        ? "/placeholder-movieDetail.jpg"
                        : movieDetail.belongsToCollection.posterPath
                    }
                    alt={movieDetail.belongsToCollection.name}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium">
                      {movieDetail.belongsToCollection.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      View Collection
                    </p>
                  </div>
                </div>
              </div>
            )}

            {movieDetail.productionCompanies.length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Production Companies
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {movieDetail.productionCompanies.map(
                    (company: {
                      id: number;
                      name: string;
                      logoPath: string;
                      originCountry: string;
                    }) => (
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
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Movie Facts</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm">Status</h4>
                  <p className="text-muted-foreground">{movieDetail.status}</p>
                </div>

                {movieDetail.budget > 0 && (
                  <div>
                    <h4 className="font-medium text-sm">Budget</h4>
                    <p className="text-muted-foreground">
                      {formatCurrency(movieDetail.budget)}
                    </p>
                  </div>
                )}

                {movieDetail.revenue > 0 && (
                  <div>
                    <h4 className="font-medium text-sm">Revenue</h4>
                    <p className="text-muted-foreground">
                      {formatCurrency(movieDetail.revenue)}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-sm">Original Language</h4>
                  <p className="text-muted-foreground">
                    {movieDetail.originalLanguage.toUpperCase()}
                  </p>
                </div>

                {movieDetail.imdbId && (
                  <div>
                    <h4 className="font-medium text-sm">IMDB ID</h4>
                    <a
                      href={`https://www.imdb.com/title/${movieDetail.imdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {movieDetail.imdbId}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {movieDetail.spokenLanguages.length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-4">Languages</h3>
                <div className="space-y-2">
                  {movieDetail.spokenLanguages.map(
                    (
                      language: { englishName: string; name: string },
                      index: number
                    ) => (
                      <div key={index}>
                        <p className="font-medium text-sm">
                          {language.englishName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {language.name}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {movieDetail.productionCountries.length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Production Countries
                </h3>
                <div className="space-y-1">
                  {movieDetail.productionCountries.map(
                    (country: { name: string }, index: number) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {country.name}
                      </p>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
