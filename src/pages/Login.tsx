import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { signInWithEmail, isAdminUser } from "@/services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const user = useUser();

  useEffect(() => {
    if (user) {
      if (isAdminUser(user.email || "")) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, navigate]);

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmail(email, password);
      // The useEffect will handle redirection when the user object is updated.
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[hsl(var(--background))]">
      <Card className="w-full max-w-sm card-professional">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.jpg" 
              alt="Conglomerate Realty Logo" 
              className="h-24 w-auto object-contain"
              onError={(e) => {
                // Fallback if logo.jpg doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">Welcome Back</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">Sign in to your account</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-[hsl(var(--foreground))]">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="input-professional"
              placeholder="Enter your email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-[hsl(var(--foreground))]">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="input-professional"
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <div className="bg-[hsl(var(--professional-red))]/10 border border-[hsl(var(--professional-red))]/20 rounded-lg p-3">
              <p className="text-sm text-[hsl(var(--professional-red))]">{error}</p>
            </div>
          )}
          <Button 
            className="w-full btn-primary" 
            onClick={submit} 
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Please wait...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </CardContent>
      </Card>
      <div className="mt-6 text-center">
        <Link to="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}