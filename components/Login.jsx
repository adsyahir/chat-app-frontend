"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores";
import { authAPI, socketAPI } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser, setIsAuthenticated, setIsLoading } = useAuthStore(); // ✅ Hooks at top level

  const router = useRouter(); // Initialize router
  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const data = await authAPI.login(email, password);
      
      // ❌ WRONG: useAuthStore.setState().setUser(data.user);
      // ✅ CORRECT: Use the store's action directly
      setUser(data.user);
      setIsAuthenticated(true);
      setIsLoading(false);
 
      socketAPI.connect();
      router.refresh(); 
    } catch (err) {
      setError(err);
      console.error("Login error:", err);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Link href={"/signup"}>
            <Button variant="link">Sign Up</Button>
          </Link>
        </CardAction>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-5">
              <AlertCircleIcon />
              <AlertTitle>Unsucessful login</AlertTitle>
              <AlertDescription>{error.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2 mt-8">
          <Button type="submit" className="w-full">
            Login
          </Button>
          {/* <Button variant="outline" className="w-full">
            Login with Google
          </Button> */}
        </CardFooter>
      </form>
    </Card>
  );
}
