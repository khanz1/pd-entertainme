import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Heart, Film } from "lucide-react";

export function FavoritesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
          <Heart className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
          <Film className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">No Favorites Yet</h2>
        <p className="text-muted-foreground max-w-md">
          Start building your movie collection by adding films you love to your
          favorites. Click the heart icon on any movie to save it here.
        </p>
      </div>

      <Button asChild size="lg">
        <Link to="/">
          <Film className="mr-2 h-5 w-5" />
          Discover Movies
        </Link>
      </Button>
    </div>
  );
}
