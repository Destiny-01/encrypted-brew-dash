import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletConnect } from '@/components/WalletConnect';
import { Leaderboard } from '@/components/Leaderboard';
import { PotionGrid } from '@/components/PotionGrid';
import { submitPotion, getUserStats, type UserStats } from '@/lib/contract';
import { useToast } from '@/hooks/use-toast';
import { 
  Beaker, 
  ArrowLeft, 
  Sparkles, 
  Trophy, 
  TrendingUp,
  Loader2
} from 'lucide-react';

export const Game = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  const [selectedPotions, setSelectedPotions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);

  // Fetch user stats when connected
  useEffect(() => {
    if (address && isConnected) {
      getUserStats(address).then(setUserStats);
    }
  }, [address, isConnected]);

  const handlePotionSelect = (potionId: number) => {
    setSelectedPotions(prev => {
      if (prev.includes(potionId)) {
        return prev.filter(id => id !== potionId);
      } else {
        return [...prev, potionId];
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
    
    try {
      const result = await submitPotion(selectedPotions);
      
      if (result.success && result.score) {
        setLastScore(result.score);
        toast({
          title: "Potion Brewed Successfully! 🧪",
          description: `You scored ${result.score.toLocaleString()} points!`,
        });
        
        // Update user stats if connected
        if (address && isConnected) {
          const updatedStats = await getUserStats(address);
          setUserStats(updatedStats);
        }
        
        // Clear selection
        setSelectedPotions([]);
      } else {
        throw new Error(result.error || 'Failed to brew potion');
      }
    } catch (error) {
      toast({
        title: "Brewing Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
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
            <WalletConnect />
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
                        <p className="text-sm text-muted-foreground">Connected Alchemist:</p>
                        <p className="font-mono text-foreground">{address}</p>
                      </div>
                      <Badge variant="secondary" className="bg-magic-purple/20 text-magic-purple">
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
                    {selectedPotions.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {selectedPotions.length} selected
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Select potions to combine them into a powerful elixir. Each combination yields different scores!
                  </p>
                </CardHeader>
                <CardContent>
                  <PotionGrid
                    selectedPotions={selectedPotions}
                    onPotionSelect={handlePotionSelect}
                    disabled={isSubmitting}
                  />
                  
                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={handleBrewPotion}
                      disabled={selectedPotions.length === 0 || isSubmitting}
                      size="lg"
                      className="magical-button gap-3 text-lg px-8"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Brewing...
                        </>
                      ) : (
                        <>
                          <Beaker className="h-5 w-5" />
                          Brew Potion ({selectedPotions.length})
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* TODO: Zama encryption notice */}
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground text-center">
                      🔒 <strong>Coming Soon:</strong> Your potion combinations will be encrypted using Zama's FHE technology before scoring
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Last Score Display */}
              {lastScore && (
                <Card className="potion-card animate-glow">
                  <CardContent className="p-6 text-center">
                    <div className="mb-2">
                      <Trophy className="h-8 w-8 text-magic-gold mx-auto" />
                    </div>
                    <h3 className="text-2xl font-bold text-magic-gold mb-1">
                      Latest Score: {lastScore.toLocaleString()}
                    </h3>
                    <p className="text-muted-foreground">Your brewing mastery grows stronger!</p>
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
                      <span className="text-muted-foreground">Highest Score:</span>
                      <Badge variant="secondary" className="text-magic-gold font-bold">
                        {userStats.highestScore.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Current Rank:</span>
                      <Badge variant="outline">
                        #{userStats.currentRank}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Games Played:</span>
                      <span className="font-semibold">{userStats.totalGames}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Leaderboard */}
              <Leaderboard title="🏆 Top Brewers" showTop={10} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};