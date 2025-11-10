import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock, Trophy, Target, Zap, Award, Settings, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/supabaseClient";

export default function Profile() {
  const { session, user, isLoading } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    highScore: 0,
    attempts: 0,
    rank: "--",
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [recentActivity, setRecentActivity] = useState<Array<{ score: number; created_at: string }>>([]);

  // Fetch user stats from Supabase
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!session?.user?.id) {
        setIsLoadingStats(false);
        return;
      }

      try {
        // Fetch user's high scores
        const { data: scores, error: scoresError } = await supabase
          .from("high_scores")
          .select("score")
          .eq("user_id", session.user.id)
          .order("score", { ascending: false });

        if (scoresError) {
          console.error("Error fetching scores:", scoresError);
        } else {
          const highScore = scores && scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
          const attempts = scores?.length ?? 0;

          // Calculate global rank based on best score
          let rank = "--";
          if (highScore > 0) {
            // Get all unique users with their best scores
            const { data: allScores, error: rankError } = await supabase
              .from("high_scores")
              .select("user_id, score")
              .order("score", { ascending: false });

            if (!rankError && allScores) {
              // Group by user_id and get each user's best score
              const userBestScores = new Map<string, number>();
              allScores.forEach((entry) => {
                const currentBest = userBestScores.get(entry.user_id) || 0;
                if (entry.score > currentBest) {
                  userBestScores.set(entry.user_id, entry.score);
                }
              });

              // Convert to array and sort by score descending
              const sortedUsers = Array.from(userBestScores.entries())
                .map(([userId, score]) => ({ userId, score }))
                .sort((a, b) => b.score - a.score);

              // Find user's rank
              const userRank = sortedUsers.findIndex(
                (entry) => entry.userId === session.user.id && entry.score === highScore
              );
              
              if (userRank !== -1) {
                rank = (userRank + 1).toString();
              }
            }
          }

          setUserStats({ highScore, attempts, rank });

          // Fetch recent activity (last 10 games)
          const { data: recentScores, error: recentError } = await supabase
            .from("high_scores")
            .select("score, created_at")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(10);

          if (!recentError && recentScores) {
            setRecentActivity(recentScores);
          }
        }
      } catch (err) {
        console.error("Error fetching user stats:", err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchUserStats();
  }, [session]);

  // User data with real stats
  // This hook must be called before any conditional returns
  const userData = useMemo(
    () => ({
      username: user?.user_metadata?.username ?? user?.email?.split("@")[0] ?? "Player",
      highScore: userStats.highScore,
      attempts: userStats.attempts,
      rank: userStats.rank,
      joinDate: new Date(user?.created_at ?? Date.now()).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    }),
    [user, userStats],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your profile…</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container max-w-xl">
          <Card className="card-glow border-border overflow-hidden">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Sign in to view your profile</CardTitle>
              <p className="text-muted-foreground">
                Track your high scores, attempts, and compete on the global leaderboard.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth/login" className="flex-1">
                <Button variant="hero" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link to="/auth/signup" className="flex-1">
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleOpenEditDialog = () => {
    setUsername(userData.username);
    setError(null);
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;
    
    setError(null);
    setIsSaving(true);

    try {
      // Update profile in database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", session.user.id);

      if (updateError) {
        setError(updateError.message);
        setIsSaving(false);
        return;
      }

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { username },
      });

      if (metadataError) {
        setError(metadataError.message);
        setIsSaving(false);
        return;
      }

      setIsEditDialogOpen(false);
      // Reload the page to refresh user data
      window.location.reload();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container max-w-4xl">
        {/* Profile Header */}
        <Card className="card-glow border-border mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                  {userData.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{userData.username}</h1>
                  <Badge variant="outline" className="w-fit mx-auto md:mx-0">
                    Rank #{userData.rank}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Member since {userData.joinDate}
                </p>
                
                <div className="flex gap-2 justify-center md:justify-start">
                  <Button variant="outline" size="sm" onClick={handleOpenEditDialog}>
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Link to="/play">
                    <Button variant="default" size="sm">
                      <Zap className="h-4 w-4" />
                      Play Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="card-glow border-border hover:card-glow-hover transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Personal High Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold gradient-text">
                {userData.highScore.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="card-glow border-border hover:card-glow-hover transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-secondary" />
                Total Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">
                {userData.attempts}
              </p>
            </CardContent>
          </Card>

          <Card className="card-glow border-border hover:card-glow-hover transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-neon-magenta" />
                Global Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-neon-magenta">
                #{userData.rank}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="card-glow border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 mx-auto mb-4 text-muted-foreground animate-spin" />
                <p className="text-muted-foreground">Loading activity...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  No games played yet. Start playing to see your activity here!
                </p>
                <Link to="/play">
                  <Button variant="hero">
                    Start Your First Game
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Score: {activity.score}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={activity.score === userData.highScore ? "default" : "outline"}>
                      {activity.score === userData.highScore ? "Best" : `${activity.score} pts`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your username. This will be displayed on your profile and the leaderboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isSaving}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSaveProfile}
              disabled={isSaving || !username.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
