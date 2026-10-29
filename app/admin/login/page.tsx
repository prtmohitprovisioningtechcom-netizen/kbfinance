"use client";

import { useState, useEffect } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState("");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (!data.db) setDbStatus(data.error || "Database is not connected on live.");
      })
      .catch(() => setDbStatus("Could not reach server health check."));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast({
          title: "Access Denied",
          description: "Invalid admin credentials.",
          variant: "destructive",
        });
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role !== "ADMIN") {
        await signOut({ redirect: false });
        toast({
          title: "Access Denied",
          description: "This portal is only for administrators.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome Back",
        description: "Opening the admin dashboard...",
      });
      router.push("/admin");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#1952B3] rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#D4AF37] rounded-full blur-[100px] opacity-10"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Website
        </Link>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-[#1952B3]/20 rounded-full flex items-center justify-center mb-4 border border-[#1952B3]/50">
              <ShieldAlert className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-blue-200 text-sm">Secure access for authorized personnel only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {dbStatus && (
              <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                {dbStatus} Admin login still works after deploy with the setup admin email/password. Register needs a reachable MySQL database.
              </p>
            )}
            <div className="space-y-2">
              <Label className="text-blue-100">Administrator Email</Label>
              <Input
                type="email"
                placeholder="admin@kbfinancial.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-blue-100">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0A2540] font-bold text-lg rounded-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Secure Login"
              )}
            </Button>
          </form>



          <div className="mt-6 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-white/40">
              Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
