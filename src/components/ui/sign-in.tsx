import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  logoSrc?: string;
  testimonial?: {
    text: string;
    authorName: string;
    authorTitle: string;
    authorAvatar?: string;
  };
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  isLoading?: boolean;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  title = "Welcome back",
  description = "Sign in to your account",
  logoSrc,
  testimonial,
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Left column */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-8">
          {logoSrc && <img src={logoSrc} alt="Logo" className="h-10 w-auto" />}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </div>

          <button
            type="button"
            onClick={onGoogleSignIn}
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

          <form onSubmit={onSignIn} className="space-y-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button type="button" onClick={onResetPassword} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button type="button" onClick={onCreateAccount} className="font-medium text-foreground hover:underline">
              Create account
            </button>
          </p>
        </div>
      </div>

      {/* Right column */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-foreground p-12">
        {testimonial && (
          <div className="max-w-lg space-y-8">
            <span className="text-4xl text-muted-foreground/50">"</span>
            <p className="text-2xl font-medium leading-relaxed text-background">
              {testimonial.text}
            </p>
            <div className="flex items-center gap-3">
              {testimonial.authorAvatar && (
                <img src={testimonial.authorAvatar} alt={testimonial.authorName} className="h-10 w-10 rounded-full border-2 border-background/20" />
              )}
              <div>
                <p className="font-medium text-background">{testimonial.authorName}</p>
                <p className="text-sm text-background/60">{testimonial.authorTitle}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
