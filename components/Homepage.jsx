"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MessageCircle, Users, Shield, Zap } from "lucide-react";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">ChatApp</h1>
          </div>

          {/* Tagline */}
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Connect with friends in real-time
            </h2>
            <p className="text-xl text-muted-foreground">
              A modern, secure chat application that brings people together.
              Start conversations, build communities, and stay connected.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto min-w-32">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-32">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h3 className="text-2xl font-bold text-center text-foreground mb-12">
            Why choose ChatApp?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Real-time messaging with instant delivery and minimal latency
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  End-to-end encryption ensures your conversations stay private
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Easy to Use</CardTitle>
                <CardDescription>
                  Intuitive interface designed for seamless communication
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to start chatting?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of users who trust ChatApp for their daily communications
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Create Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                    Already have an account?
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}