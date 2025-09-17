import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Film, Heart, LogOut, User } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import { logout, setCredentials } from "@/features/movies/movie.slice";
import { useGetUserMeQuery } from "@/features/movies/movie.api";

export function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch user data when authenticated
  const { data: userResponse, isFetching } = useGetUserMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Update user data when fetched
  useEffect(() => {
    if (userResponse?.data?.user && isAuthenticated) {
      dispatch(
        setCredentials({
          user: userResponse.data.user,
          accessToken: localStorage.getItem("accessToken") || "",
        })
      );
    }
  }, [userResponse, isAuthenticated, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container m-auto flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">MovieHub</span>
        </Link>

        <nav className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {!isFetching &&
            (isAuthenticated && user ? (
              <>
                {/* User Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.profilePict || "/placeholder.svg"}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.profilePict || "/placeholder.svg"}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="w-[180px] truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />

                    {/* Profile Link */}
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    {/* Favorites Link */}
                    <DropdownMenuItem asChild>
                      <Link to="/favorites" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        My Favorites
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Logout */}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Authentication Buttons */
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            ))}
        </nav>
      </div>
    </header>
  );
}
