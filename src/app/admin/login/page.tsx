"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, LogIn, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { signIn, user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.push("/admin");
    }
  }, [user, isAdmin, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      router.push("/admin");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-primary/5 -skew-y-12 transform origin-top-left" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-primary/[0.02] skew-y-12 transform origin-bottom-right" />
      
      <Card className="relative w-full max-w-md border shadow-2xl rounded-3xl bg-card">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground uppercase tracking-tight">
              SS <span className="text-primary">Construction</span>
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">Admin Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@ssconstruction.com"
                className="h-12 rounded-xl border-border bg-muted/20 font-medium px-4 focus-visible:ring-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="h-12 rounded-xl border-border bg-muted/20 font-medium px-4 pr-12 focus-visible:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase text-xs tracking-[0.2em] shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Logging in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   Sign In <LogIn className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <p className="text-[10px] font-medium text-muted-foreground/60 text-center mt-8 uppercase tracking-widest italic">
            SECURE ACCESS ONLY • AUTHORIZED PERSONNEL
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
