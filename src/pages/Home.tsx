import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Trophy, Zap, Users } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative flex items-center justify-center min-h-[600px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container px-4 text-center z-10">
          <div className="animate-float">
            <Gamepad2 className="h-20 w-20 mx-auto mb-6 text-primary" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-glow">
            Welcome to <span className="gradient-text">GameVerse</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the ultimate browser gaming platform. Compete with players worldwide, 
            climb the leaderboards, and become a legend.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/play">
              <Button variant="hero" size="lg" className="text-lg">
                <Zap className="h-5 w-5" />
                Play Now
              </Button>
            </Link>
            
            <Link to="/leaderboard">
              <Button variant="outline" size="lg" className="text-lg">
                <Trophy className="h-5 w-5" />
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why <span className="gradient-text">GameVerse</span>?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-glow hover:card-glow-hover transition-all duration-300 border-border">
              <CardContent className="pt-6">
                <div className="rounded-full w-12 h-12 bg-primary/20 flex items-center justify-center mb-4">
                  <Gamepad2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Play</h3>
                <p className="text-muted-foreground">
                  Jump right into the action. No downloads, no installations. 
                  Just pure gaming fun directly in your browser.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-glow hover:card-glow-hover transition-all duration-300 border-border">
              <CardContent className="pt-6">
                <div className="rounded-full w-12 h-12 bg-secondary/20 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Global Rankings</h3>
                <p className="text-muted-foreground">
                  Compete with players worldwide and climb the leaderboards. 
                  Track your progress and become the ultimate champion.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-glow hover:card-glow-hover transition-all duration-300 border-border">
              <CardContent className="pt-6">
                <div className="rounded-full w-12 h-12 bg-neon-magenta/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-neon-magenta" />
                </div>
                <h3 className="text-xl font-bold mb-2">Community Driven</h3>
                <p className="text-muted-foreground">
                  Join a thriving community of gamers. Share strategies, 
                  make friends, and enjoy the competitive spirit together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-primary/5">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of players already competing for the top spot. Your adventure begins now.
          </p>
          
          <Link to="/auth/signup">
            <Button variant="hero" size="lg" className="text-lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
