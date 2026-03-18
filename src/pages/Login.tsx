import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { setToken } from "@/lib/auth";
import { api } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // OAuth2PasswordRequestForm expects x-www-form-urlencoded
      const formBody = new URLSearchParams({ username: email, password });
      const res = await fetch(api.auth.login(), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Login failed");
      }

      const data = await res.json();
      setToken(data.access_token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Login failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Brain className="w-7 h-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">DataKu</span>
        </div>

        <h1 className="text-2xl font-bold mb-1 text-center">Sign in</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Welcome back! Enter your credentials to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
