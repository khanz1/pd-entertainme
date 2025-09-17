"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useDispatch } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Film,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useRegisterMutation } from "@/features/movies/movie.api";
import { setCredentials } from "@/features/movies/movie.slice";
import { toast } from "sonner";

const registerFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50, {
      message: "Name must not exceed 50 characters.",
    }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters.",
    })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message:
        "Password must contain uppercase, lowercase, number and special character.",
    }),
  profilePicture: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const [register, { isLoading }] = useRegisterMutation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "Xavier Evans",
      email: "assistance.xavier@gmail.com",
      password: "Admin123!",
      profilePicture: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await register({
        name: values.name,
        email: values.email,
        password: values.password,
        profilePict: values.profilePicture || "",
      }).unwrap();

      // Store credentials in Redux and localStorage
      dispatch(
        setCredentials({
          user: result.data.user,
          accessToken: result.data.accessToken,
        })
      );

      toast("Registration successful! Welcome!");
      // Navigate to home page
      navigate("/");
    } catch (err: any) {
      console.error("Registration failed:", err);
      toast(err?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-8 text-center">
          <div className="relative">
            <div className="w-80 h-80 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-full flex items-center justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-primary/40 to-purple-500/40 rounded-full flex items-center justify-center">
                  <Film className="w-20 h-20 text-primary" />
                </div>
              </div>
            </div>
            <Sparkles className="absolute top-4 right-4 w-8 h-8 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute bottom-8 left-8 w-6 h-6 text-purple-400 animate-pulse delay-300" />
            <Sparkles className="absolute top-1/2 -left-4 w-4 h-4 text-pink-400 animate-pulse delay-500" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Join MovieHub Today
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Discover amazing movies, get personalized recommendations, and
              never run out of great content to watch.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  Unlimited Access
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                <span className="text-sm text-muted-foreground">
                  AI Recommendations
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-xl">
            <CardHeader className="space-y-4 pb-8">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Film className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Create Account
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Start your movie journey today
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Enter your full name"
                              className="pl-10 h-12 border-muted/20 focus:border-primary/50 transition-colors"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10 h-12 border-muted/20 focus:border-primary/50 transition-colors"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              className="pl-10 pr-10 h-12 border-muted/20 focus:border-primary/50 transition-colors"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profilePicture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Profile Picture (Optional)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="url"
                              placeholder="https://example.com/avatar.jpg"
                              className="pl-10 h-12 border-muted/20 focus:border-primary/50 transition-colors"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>

                <CardFooter className="flex flex-col space-y-6 pt-6">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating Your Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Sign in instead
                      </Link>
                    </p>
                  </div>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
