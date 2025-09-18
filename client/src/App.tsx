import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Route, Routes } from "react-router";
import { RegisterPage } from "./pages/Register.page";
import { Provider } from "react-redux";
import { store } from "./store";
import { LoginPage } from "./pages/Login.page";
import { HomePage } from "./pages/Home.page";
import { FavoritePage } from "./pages/Favorite.page";
import { MovieDetailPage } from "./pages/MovieDetail.page";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/components/theme-provider";
import { RootLayout } from "./layouts/RootLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { UnAuthLayout } from "./layouts/UnAuthLayout";
import { ProfilePage } from "./pages/Profile.page";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="moviehub-ui-theme">
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route element={<UnAuthLayout />}>
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/login"
                element={
                  <GoogleOAuthProvider
                    clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                  >
                    <LoginPage />
                  </GoogleOAuthProvider>
                }
              />
            </Route>
            <Route element={<RootLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies/:id" element={<MovieDetailPage />} />
              <Route element={<AuthLayout />}>
                <Route path="/favorites" element={<FavoritePage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>

        <Toaster />
      </Provider>
    </ThemeProvider>
  );
}

export default App;
