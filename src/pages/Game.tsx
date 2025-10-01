import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletButton } from "@/components/WalletConnect";
import { Leaderboard } from "@/components/Leaderboard";
import { PotionGrid } from "@/components/PotionGrid";
import { type UserStats, LeaderboardEntry } from "@/lib/contract";
import { useToast } from "@/hooks/use-toast";
import {
  Beaker,
  ArrowLeft,
  Sparkles,
  Trophy,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { usePotionContract } from "@/hooks/usePotionContract";
import { initializeFHE } from "@/lib/fhe";

export const Game = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { isLoading, submitPotion, fetchLeaderboard } = usePotionContract();

  const [selectedPotions, setSelectedPotions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const MAX_SELECTION = 5;

  /**
   * Fetch and update leaderboard data
   * Updates both global leaderboard and user-specific stats
   */
  const retrieveLB = useCallback(() => {
    fetchLeaderboard().then((results) => {
      if (!results) return;
      const newEntries = results
        .sort((a, b) => b.guess - a.guess)
        .map((result, i) => ({
          address: result.player,
          score: result.guess,
          rank: i + 1,
        }));
      setEntries(newEntries);
      const user = newEntries.find(
        (entry) => entry.address?.toLowerCase() === address?.toLowerCase()
      );
      if (user) {
        setUserStats({
          address: address!,
          highestScore: user.score,
          currentRank: user.rank,
        });
      }
    });
  }, [address, fetchLeaderboard]);

  useEffect(() => {
    initializeFHE()
      .then(() => retrieveLB())
      .catch((error) => {
        toast({
          title: "Initialization Error",
          description:
            "Failed to initialize encryption system. Please refresh the page.",
          variant: "destructive",
        });
      });
  }, [retrieveLB, toast]);

  // Fetch user stats when connected
  useEffect(() => {
    if (address && isConnected) {
      retrieveLB();
    }
  }, [address, isConnected, retrieveLB]);

  const handlePotionSelect = (potionId: number) => {
    setSelectedPotions((prev) => {
      if (prev.includes(potionId)) {
        return prev.filter((id) => id !== potionId);
      } else if (prev.length < MAX_SELECTION) {
        return [...prev, potionId];
      } else {
        toast({
          title: "Maximum potions selected",
          description: `You can only select up to ${MAX_SELECTION} potions!`,
          variant: "destructive",
        });
        return prev;
      }
    });
  };

  const handleBrewPotion = async () => {
    if (selectedPotions.length === 0) {
      toast({
        title: "No potions selected",
        description: "Please select at least one potion to brew!",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsNewHighScore(false);

    try {
      const { decrypted: result } = await submitPotion(selectedPotions);
      const isHighest =
        userStats?.highestScore && Number(result) > userStats.highestScore;

      if (result) {
        setLastScore(Number(result));
        setIsNewHighScore(isHighest);

        if (isHighest) {
          toast({
            title: "🎉 NEW HIGH SCORE! 🎉",
            description: `Legendary brew! You scored ${Number(
              result
            ).toLocaleString()} points!`,
          });
        } else {
          toast({
            title: "Potion Brewed Successfully",
            description: `You scored ${Number(
              result
            ).toLocaleString()} points. Keep experimenting to beat your high score!`,
          });
        }

        // Update user stats if connected
        if (address && isConnected) {
          retrieveLB();
        }

        // Clear selection
        setSelectedPotions([]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Transaction failed";
      toast({
        title: "Brewing Failed",
        description: errorMessage.includes("rejected")
          ? "Transaction was rejected. Please try again."
          : "Failed to brew potion. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Beaker className="h-6 w-6 text-magic-purple animate-glow" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-magic-purple to-magic-gold bg-clip-text text-transparent">
                  Alchemy Workshop
                </h1>
              </div>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Connected Wallet Display */}
              {isConnected && address && (
                <Card className="potion-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Connected Alchemist:
                        </p>
                        <p className="font-mono text-foreground">{address}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-magic-purple/20 text-magic-purple"
                      >
                        ⚡ Connected
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Potion Selection */}
              <Card className="potion-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-magic-gold" />
                    Mix Your Potion
                    <Badge variant="secondary" className="ml-auto">
                      {selectedPotions.length}/{MAX_SELECTION}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Select up to {MAX_SELECTION} potions to combine into a
                    powerful elixir. Each unique combination yields different
                    scores!
                  </p>
                </CardHeader>
                <CardContent>
                  <PotionGrid
                    selectedPotions={selectedPotions}
                    onPotionSelect={handlePotionSelect}
                    disabled={isSubmitting}
                  />

                  <div className="mt-6 flex flex-col items-center gap-4">
                    <Button
                      onClick={handleBrewPotion}
                      disabled={selectedPotions.length === 0 || isSubmitting}
                      size="lg"
                      className="magical-button gap-3 text-lg px-8"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Brewing Your Potion...
                        </>
                      ) : (
                        <>
                          <Beaker className="h-5 w-5" />
                          Brew Potion ({selectedPotions.length}/{MAX_SELECTION})
                        </>
                      )}
                    </Button>

                    {isSubmitting && (
                      <p className="text-sm text-muted-foreground animate-pulse">
                        🔮 Mixing magical ingredients...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Last Score Display */}
              {lastScore !== null && (
                <Card
                  className={`potion-card ${
                    isNewHighScore ? "animate-glow border-magic-gold" : ""
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-2">
                      <Trophy
                        className={`h-8 w-8 mx-auto ${
                          isNewHighScore
                            ? "text-magic-gold"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-2xl font-bold mb-1 ${
                        isNewHighScore ? "text-magic-gold" : "text-foreground"
                      }`}
                    >
                      {isNewHighScore
                        ? "🎉 NEW HIGH SCORE! 🎉"
                        : "Latest Score"}
                    </h3>
                    <p className="text-3xl font-bold text-magic-purple mb-2">
                      {lastScore.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                      {isNewHighScore
                        ? "Legendary brew! You've surpassed your previous best!"
                        : "Keep experimenting with different combinations!"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Stats */}
              {userStats && (
                <Card className="potion-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-magic-purple" />
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Highest Score:
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-magic-gold font-bold"
                      >
                        {userStats.highestScore.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Current Rank:
                      </span>
                      <Badge variant="outline">#{userStats.currentRank}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Leaderboard */}
              <Leaderboard entries={entries} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
