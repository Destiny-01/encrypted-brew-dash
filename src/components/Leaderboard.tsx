import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Trophy, Medal, Loader2 } from "lucide-react";
import { type LeaderboardEntry } from "@/lib/contract";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
}

export const Leaderboard = ({ entries, isLoading }: LeaderboardProps) => {
  const title = "Top Brewers";

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-magic-gold" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-lg font-bold text-muted-foreground">
            #{rank}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className="potion-card">
        <CardHeader>
          <CardTitle className="text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading leaderboard...
            </div>
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
          {entries?.length > 0 &&
            entries.map((entry) => (
              <div
                key={entry.address}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(entry.rank)}
                  <div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="secondary"
                    className={`${
                      entry.rank <= 3 ? "rank-gold" : "text-accent"
                    } font-bold text-lg`}
                  >
                    {entry.score.toLocaleString()}
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};
