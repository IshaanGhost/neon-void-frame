import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/supabaseClient";

type LeaderboardEntry = {
  score: number;
  created_at: string | null;
  profiles: {
    username: string | null;
  } | null;
};

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-primary" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3:
        return <Award className="h-5 w-5 text-secondary" />;
      default:
        return <span className="text-muted-foreground font-semibold">#{rank}</span>;
    }
  };

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch with profile join first
      const { data, error } = await supabase
        .from("high_scores")
        .select("score, created_at, profiles(username)")
        .order("score", { ascending: false })
        .limit(50);

      if (error) {
        // If the relationship doesn't exist, try without the join
        if (error.message.includes("relationship") || error.message.includes("profiles")) {
          console.warn("Profile relationship not found, fetching scores without usernames");
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("high_scores")
            .select("score, created_at")
            .order("score", { ascending: false })
            .limit(50);

          if (fallbackError) {
            setError(fallbackError.message);
            setEntries([]);
          } else {
            // Map to expected format with null profiles
            setEntries(
              (fallbackData ?? []).map((entry) => ({
                ...entry,
                profiles: null,
              }))
            );
          }
        } else {
          setError(error.message);
          setEntries([]);
        }
      } else {
        setEntries(data ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaderboard");
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Global High Scores</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Compete with the best players from around the world
          </p>
        </div>

        <Card className="card-glow border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Top Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-24">Rank</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        Loading leaderboard...
                      </TableCell>
                    </TableRow>
                  ) : entries.length > 0 ? (
                    entries.map((entry, index) => {
                      const rank = index + 1;
                      const username = entry.profiles?.username ?? "Anonymous";
                      const formattedScore = entry.score.toLocaleString();
                      const timestamp = entry.created_at
                        ? new Date(entry.created_at).toLocaleString()
                        : "--";

                      return (
                        <TableRow
                          key={`${entry.profiles?.username ?? "user"}-${entry.created_at ?? index}`}
                          className="hover:bg-primary/5 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getRankIcon(rank)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {username}
                              {rank <= 3 && (
                                <Badge
                                  variant="outline"
                                  className={
                                    rank === 1
                                      ? "border-primary text-primary"
                                      : rank === 2
                                      ? "border-muted-foreground text-muted-foreground"
                                      : "border-secondary text-secondary"
                                  }
                                >
                                  Top {rank}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-bold text-primary text-lg">
                              {formattedScore}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {timestamp}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        No scores yet. Play a game to claim the top spot!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                💡 Your rank will appear here after you complete your first game
              </p>
            </div>

            {error && (
              <div className="mt-4 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
