import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletButton } from "@/components/WalletConnect";
import { Leaderboard } from "@/components/Leaderboard";
import { Sparkles, Beaker, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { LeaderboardEntry } from "@/lib/contract";
import { usePotionContract } from "@/hooks/usePotionContract";

export const Landing = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const { fetchLeaderboard, isLoading } = usePotionContract();

  useEffect(() => {
    let isMounted = true;
    
    fetchLeaderboard().then((results) => {
      if (!isMounted || !results) return;
      
      const newEntries = results
        .sort((a, b) => b.guess - a.guess)
        .map((result, i) => ({
          address: result.player,
          score: result.guess,
          rank: i + 1,
        }));
      setEntries(newEntries);
    }).catch(() => {
      // Silently fail on landing page - leaderboard will show empty state
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Beaker className="h-8 w-8 text-magic-purple animate-glow" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-magic-purple to-magic-gold bg-clip-text text-transparent">
                Encrypted Potion Leaderboard
              </h1>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <Sparkles className="h-16 w-16 text-magic-gold mx-auto mb-4 animate-float" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-magic-purple via-magic-glow to-magic-gold bg-clip-text text-transparent">
              Master the Art of Alchemy
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Combine mystical potions to create powerful elixirs. Your brewing
              skills determine your score in this enchanted competition powered
              by encrypted blockchain technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/game">
                <Button
                  size="lg"
                  className="magical-button text-lg px-8 py-6 gap-3"
                >
                  <Target className="h-6 w-6" />
                  Start Brewing
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-magic-purple rounded-full animate-pulse"></div>
                Connect wallet to save your progress
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="potion-card text-center">
              <CardHeader>
                <Beaker className="h-12 w-12 text-magic-purple mx-auto mb-2" />
                <CardTitle>Mix & Match</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Select from 8 unique magical potions, each with different
                  rarities and hidden values.
                </p>
              </CardContent>
            </Card>

            <Card className="potion-card text-center">
              <CardHeader>
                <Sparkles className="h-12 w-12 text-magic-gold mx-auto mb-2" />
                <CardTitle>Encrypted Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your combinations are encrypted before scoring, ensuring fair
                  and tamper-proof results.
                </p>
              </CardContent>
            </Card>

            <Card className="potion-card text-center">
              <CardHeader>
                <Target className="h-12 w-12 text-magic-purple mx-auto mb-2" />
                <CardTitle>Compete Globally</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Climb the leaderboard and prove you're the ultimate potion
                  master in the realm.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Section */}
          <div className="max-w-2xl mx-auto">
            <Leaderboard entries={entries} isLoading={isLoading} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Built with 🧪 for the future of gaming • Powered by encrypted
            blockchain technology
          </p>
        </div>
      </footer>
    </div>
  );
};
