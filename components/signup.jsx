"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircleIcon, Eye, EyeOff, GalleryVerticalEnd, Loader2 } from "lucide-react";

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: { value: "", error: "" },
    username: { value: "", error: "" },
    password: { value: "", error: "", showPassword: false },
    confirmPassword: { value: "", error: "", showPassword: false },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const router = useRouter();

  // Clear all form errors
  const clearErrors = () => {
    setFormData(prev => ({
      ...prev,
      email: { ...prev.email, error: "" },
      username: { ...prev.username, error: "" },
      password: { ...prev.password, error: "" },
      confirmPassword: { ...prev.confirmPassword, error: "" },
    }));
    setGeneralError("");
  };

  // Reset entire form
  const resetForm = () => {
    setFormData({
      email: { value: "", error: "" },
      username: { value: "", error: "" },
      password: { value: "", error: "", showPassword: false },
      confirmPassword: { value: "", error: "", showPassword: false },
    });
    setGeneralError("");
  };

  // Update field value
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], value, error: "" }
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], showPassword: !prev[field].showPassword }
    }));
  };

  // Set field error
  const setFieldError = (field, error) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], error }
    }));
  };

  // Client-side validation
  const validateForm = () => {
    let isValid = true;
    
    // Password confirmation check
    if (formData.password.value !== formData.confirmPassword.value) {
      setFieldError("password", "Passwords do not match");
      setFieldError("confirmPassword", "Passwords do not match");
      isValid = false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.value)) {
      setFieldError("email", "Please enter a valid email address");
      isValid = false;
    }

    // Username validation
    if (formData.username.value.length < 3) {
      setFieldError("username", "Username must be at least 3 characters long");
      isValid = false;
    }

    // Password strength validation
    if (formData.password.value.length < 8) {
      setFieldError("password", "Password must be at least 8 characters long");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.value,
          username: formData.username.value,
          password: formData.password.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle server validation errors
        if (data.errors) {
          Object.entries(data.errors).forEach(([field, error]) => {
            setFieldError(field, error);
          });
        } else {
          setGeneralError(data.message || "Registration failed. Please try again.");
        }
        return;
      }

      // Success
      toast.success("Account created successfully! Welcome to Chatter.");
      resetForm();
      router.push("/"); // Redirect to dashboard or login
      
    } catch (err) {
      console.error("Signup error:", err);
      setGeneralError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center justify-center gap-y-2 mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
              <GalleryVerticalEnd className="size-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-center">Join Chatter</h1>
            <p className="text-sm text-muted-foreground text-center">
              Create your account to get started
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email.value}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="m@example.com"
                required
                className={formData.email.error ? "border-destructive" : ""}
              />
              {formData.email.error && (
                <p className="text-destructive text-sm">{formData.email.error}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username.value}
                onChange={(e) => updateField("username", e.target.value)}
                placeholder="johndoe"
                required
                className={formData.username.error ? "border-destructive" : ""}
              />
              {formData.username.error && (
                <p className="text-destructive text-sm">{formData.username.error}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={formData.password.showPassword ? "text" : "password"}
                  value={formData.password.value}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Enter your password"
                  required
                  className={formData.password.error ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("password")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {formData.password.showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {formData.password.error && (
                <p className="text-destructive text-sm">{formData.password.error}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={formData.confirmPassword.showPassword ? "text" : "password"}
                  value={formData.confirmPassword.value}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className={formData.confirmPassword.error ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {formData.confirmPassword.showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {formData.confirmPassword.error && (
                <p className="text-destructive text-sm">{formData.confirmPassword.error}</p>
              )}
            </div>
          </div>

          {/* General Error */}
          {generalError && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Registration failed</AlertTitle>
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <CardFooter className="px-0">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </CardFooter>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}