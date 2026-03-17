import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import angelflowsLogo from "@/assets/angelflows-logo.png";
import aydenAvatar from "@/assets/ayden-avatar.png";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const TESTIMONIAL = {
  text: "We started AngelFlows to give companies an unfair advantage at targeting high-intent customers. We help you not only find them, but sync them into platforms so you can skip the learning phase.",
  authorName: "AngelFlows",
  authorTitle: "Intent-Powered Advertising",
};

export default function AuthPage() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (mode === "signup") {
      const fullName = formData.get("fullName") as string;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We sent you a verification link." });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    const email = (document.getElementById("email") as HTMLInputElement)?.value;
    if (!email) {
      toast({ title: "Enter your email", description: "Type your email address first.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "Password reset link sent." });
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left column */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-6">
          <img src={angelflowsLogo} alt="AngelFlows" className="h-10 w-auto" loading="eager" decoding="async" />

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {mode === "signup" ? "Create Account" : "Welcome back"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signup" ? "Get started with AngelFlows" : "Sign in to your AngelFlows account"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-input bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-sm font-medium text-foreground">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@company.com"
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "signin" && (
              <div className="flex justify-end">
                <button type="button" onClick={handleForgotPassword} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Please wait..." : mode === "signup" ? "Create account →" : "Sign in"}
            </button>
          </form>

          {mode === "signup" && (
            <p className="text-center text-xs text-muted-foreground">
              By clicking "Create account" you agree to AngelFlows'{" "}
              <a href="#" className="underline">Privacy Policy & Terms of Service</a>
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-semibold text-foreground hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create account"}
            </button>
          </p>
        </div>
      </div>

      {/* Right column - dark testimonial */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-foreground p-12">
        <div className="max-w-lg space-y-8">
          <span className="text-5xl font-serif text-background/30">❝</span>
          <p className="text-2xl font-medium leading-relaxed text-background">
            "{TESTIMONIAL.text}"
          </p>
          <div className="flex items-center gap-3">
            <img src={angelflowsLogo} alt="AngelFlows" className="h-8 w-8 rounded-full bg-background/10 p-1" />
            <div>
              <p className="font-medium text-background">{TESTIMONIAL.authorName}</p>
              <p className="text-sm text-background/60">{TESTIMONIAL.authorTitle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
