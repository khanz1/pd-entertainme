import { FavoriteMovieCard } from "@/features/movies/components/favorite/FavoriteMovie.card";
import { FavoritesEmptyState } from "@/features/movies/components/favorite/FavoriteEmptyState";
import { Heart } from "lucide-react";
import {
  useGetFavoritesQuery,
  useRemoveFavoriteMutation,
} from "@/features/movies/movie.api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuthError } from "@/hooks/useAuthError";

export function FavoritePage() {
  const { data: favoritesResponse, isLoading, error } = useGetFavoritesQuery();
  const { requireAuth } = useAuthError();

  const [removeFavorite] = useRemoveFavoriteMutation();

  const favorites = favoritesResponse?.data || [];

  const handleRemoveFavorite = async (favoriteId: number) => {
    requireAuth(async () => {
      try {
        await removeFavorite(favoriteId).unwrap();
        toast("Movie removed from favorites");
      } catch (err: any) {
        console.error("Failed to remove favorite:", err);
        toast(err?.data?.message || "Failed to remove movie from favorites");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <main className="container m-auto py-8">
          <div className="flex items-center gap-3 mb-8">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-48" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-card/50 backdrop-blur-sm rounded-xl border p-6"
              >
                <div className="flex gap-6">
                  <Skeleton className="w-20 h-28 rounded" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <main className="container m-auto py-8">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">My Favorites</h1>
          </div>

          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">
              Failed to Load Favorites
            </h2>
            <p className="text-muted-foreground">
              Sorry, we couldn't load your favorite movies. Please try again
              later.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="container m-auto py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-6 w-6 text-primary fill-current" />
          <h1 className="text-3xl font-bold">My Favorites</h1>
          {favorites.length > 0 && (
            <span className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
              {favorites.length} {favorites.length === 1 ? "movie" : "movies"}
            </span>
          )}
        </div>

        {favorites.length === 0 ? (
          <FavoritesEmptyState />
        ) : (
          <div className="space-y-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-card/50 backdrop-blur-sm rounded-xl border p-6 hover:bg-card/80 transition-all duration-300"
              >
                <FavoriteMovieCard
                  movie={favorite.movie}
                  favorite={favorite}
                  onRemove={handleRemoveFavorite}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
