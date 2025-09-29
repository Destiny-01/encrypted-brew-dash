import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, Medal } from 'lucide-react';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/contract';

interface LeaderboardProps {
  title?: string;
  showTop?: number;
}

export const Leaderboard = ({ title = "Leaderboard", showTop = 5 }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setEntries(data.slice(0, showTop));
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [showTop]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-magic-gold" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <Card className="potion-card animate-glow">
        <CardHeader>
          <CardTitle className="text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 animate-pulse">
                <div className="h-4 bg-muted/40 rounded w-1/3"></div>
                <div className="h-4 bg-muted/40 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="potion-card animate-glow">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5 text-magic-gold" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.address}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {getRankIcon(entry.rank)}
                <div>
                  <div className="font-semibold text-foreground">
                    {entry.username}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant="secondary" 
                  className={`${entry.rank <= 3 ? 'rank-gold' : 'text-accent'} font-bold text-lg`}
                >
                  {entry.score.toLocaleString()}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  {entry.lastUpdated.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};