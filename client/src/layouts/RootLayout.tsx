import { Outlet } from "react-router";
import { Header } from "@/components/header";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <Outlet />
    </div>
  );
}
