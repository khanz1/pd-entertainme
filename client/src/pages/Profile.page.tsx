import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import {
  User,
  Heart,
  Star,
  Calendar,
  Mail,
  Sparkles,
  TrendingUp,
  Film,
  Clock,
  BarChart3,
  Award,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { RootState } from "@/store";
import { useGetUserMeQuery } from "@/features/auth/auth.api";
import {
  useGetFavoritesQuery,
  useGetRecommendationsQuery,
} from "@/features/movies/movie.api";
import { MovieCard } from "@/features/movies/components/MovieCard";
import { FavoritesEmptyState } from "@/features/movies/components/favorite/FavoriteEmptyState";
import { useAuthError } from "@/hooks/useAuthError";

export function ProfilePage() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { handleAuthError } = useAuthError();
  const [activeTab, setActiveTab] = useState<
    "overview" | "favorites" | "recommendations"
  >("overview");

  // Check authentication and redirect if needed
  if (handleAuthError()) {
    return null;
  }

  // Fetch user data
  const { data: userResponse, isLoading: isLoadingUser } = useGetUserMeQuery(
    undefined,
    {
      skip: !isAuthenticated,
    }
  );

  // Fetch favorites
  const { data: favoritesResponse, isLoading: isLoadingFavorites } =
    useGetFavoritesQuery(undefined, {
      skip: !isAuthenticated,
    });

  // Fetch recommendations
  const { data: recommendationsResponse, isLoading: isLoadingRecommendations } =
    useGetRecommendationsQuery(undefined, {
      skip: !isAuthenticated,
    });

  const currentUser = userResponse?.data?.user || user;
  const favorites = favoritesResponse?.data || [];
  const recommendations = recommendationsResponse?.data || [];

  // Calculate statistics
  const totalFavorites = favorites.length;
  const avgRating =
    favorites.length > 0
      ? (
          favorites.reduce((sum, fav) => sum + fav.movie.voteAverage, 0) /
          favorites.length
        ).toFixed(1)
      : "0.0";

  // Get favorite genres
  const genreCount = favorites.reduce((acc, fav) => {
    fav.movie.genres?.forEach((genre) => {
      acc[genre.name] = (acc[genre.name] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topGenres = Object.entries(genreCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name]) => name);

  // Get member since date
  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "Unknown";

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <main className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="flex items-center space-x-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">User not found</h2>
            <p className="text-muted-foreground">
              Unable to load user profile.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage
                  src={currentUser.profilePict || "/placeholder.svg"}
                  alt={currentUser.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{currentUser.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{currentUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Member since {memberSince}</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {totalFavorites} Favorites
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    {avgRating} Avg Rating
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full">
                  <Sparkles className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">
                    {recommendations.length} AI Picks
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <Button variant="outline" size="sm" className="self-start">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: "overview", label: "Overview", icon: BarChart3 },
            { key: "favorites", label: "My Favorites", icon: Heart },
            {
              key: "recommendations",
              label: "AI Recommendations",
              icon: Sparkles,
            },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              onClick={() => setActiveTab(tab.key as any)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content Sections */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Favorites
                    </p>
                    <p className="text-2xl font-bold">{totalFavorites}</p>
                  </div>
                  <Heart className="h-8 w-8 text-primary" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Average Rating
                    </p>
                    <p className="text-2xl font-bold">{avgRating}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      AI Recommendations
                    </p>
                    <p className="text-2xl font-bold">
                      {recommendations.length}
                    </p>
                  </div>
                  <Sparkles className="h-8 w-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Top Genres</p>
                    <p className="text-2xl font-bold">{topGenres.length}</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-500" />
                </div>
              </Card>
            </div>

            {/* Favorite Genres */}
            {topGenres.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Your Favorite Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topGenres.map((genre, index) => (
                    <Badge
                      key={genre}
                      variant={index === 0 ? "default" : "secondary"}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Favorites Preview */}
            {favorites.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Recent Favorites
                  </h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/favorites">View All</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {favorites.slice(0, 6).map((favorite) => (
                    <MovieCard
                      key={favorite.id}
                      movie={favorite.movie}
                      className="w-full"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* AI Recommendations Preview */}
            {recommendations.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-green-500" />
                    AI Recommendations
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("recommendations")}
                  >
                    View All
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {recommendations.slice(0, 6).map((recommendation) => (
                    <MovieCard
                      key={recommendation.id}
                      movie={recommendation.movie}
                      className="w-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div>
            {isLoadingFavorites ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[2/3] w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <FavoritesEmptyState />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Heart className="h-6 w-6 text-primary" />
                    My Favorites ({favorites.length})
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {favorites.map((favorite) => (
                    <MovieCard key={favorite.id} movie={favorite.movie} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "recommendations" && (
          <div>
            {isLoadingRecommendations ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[2/3] w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  No AI Recommendations Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Add some movies to your favorites to get personalized AI
                  recommendations.
                </p>
                <Button asChild>
                  <Link to="/">
                    <Film className="mr-2 h-4 w-4" />
                    Discover Movies
                  </Link>
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-green-500" />
                    AI Recommendations ({recommendations.length})
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {recommendations.map((recommendation) => (
                    <MovieCard
                      key={recommendation.id}
                      movie={recommendation.movie}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
