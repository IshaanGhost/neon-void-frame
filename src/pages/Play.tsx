import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Gamepad2, Flag } from "lucide-react";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import PhaserGame from "@/components/PhaserGame";

export default function Play() {
  const { session } = useAuth();
  const phaserGameRef = useRef(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);

  const submitHighScore = useCallback(async (score: number) => {
    if (!session) {
      console.warn("User must be logged in to submit a high score.");
      return;
    }

    const { error } = await supabase.from("high_scores").insert({
      score,
      user_id: session.user.id,
    });

    if (error) {
      console.error("Failed to submit high score:", error.message);
    } else {
      console.log("High score submitted successfully:", score);
    }
  }, [session]);

  const processGameOver = useCallback(
    (finalScore: number) => {
      setIsGameRunning(false);
      setCurrentScore(finalScore);
      setBestScore((prev) => Math.max(prev, finalScore));
      console.log("Game Over! Final Score:", finalScore);
      void submitHighScore(finalScore);
    },
    [submitHighScore],
  );

  const handleStartGame = useCallback(() => {
    phaserGameRef.current?.startGame?.();
    setAttempts((prev) => prev + 1);
    setIsGameRunning(true);
    setCurrentScore(0);
  }, []);

  const handleManualGameOver = useCallback(() => {
    if (!isGameRunning) return;
    const finalScore = phaserGameRef.current?.getScore?.() ?? currentScore;
    phaserGameRef.current?.resetGame?.();
    processGameOver(finalScore);
  }, [currentScore, isGameRunning, processGameOver]);

  const handleReset = useCallback(() => {
    phaserGameRef.current?.resetGame?.();
    setIsGameRunning(false);
    setCurrentScore(0);
  }, []);

  const handleScoreChange = useCallback((scoreValue: number) => {
    setCurrentScore(scoreValue);
  }, []);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Game Canvas Area */}
          <div className="flex-1">
            <Card className="card-glow border-border">
              <CardHeader>
                <CardTitle className="text-2xl">Game Arena</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] bg-muted/50 rounded-lg border-2 border-primary/30 relative overflow-hidden">
                  <PhaserGame
                    ref={phaserGameRef}
                    onScoreChange={handleScoreChange}
                    onGameOver={processGameOver}
                  />
                </div>
                
                <div className="mt-4 flex gap-3">
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={handleStartGame}
                    disabled={isGameRunning}
                  >
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Start Game
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleManualGameOver}
                    disabled={!isGameRunning}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    End Run
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Score Panel */}
          <div className="lg:w-80">
            <Card className="card-glow border-border sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Current Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Score</p>
                  <p className="text-5xl font-bold text-glow gradient-text">
                    {currentScore}
                  </p>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">High Score</span>
                    <span className="text-lg font-semibold text-primary">
                      {bestScore}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Attempts</span>
                    <span className="text-lg font-semibold">{attempts}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Global Rank</span>
                    <span className="text-lg font-semibold text-secondary">--</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    💡 Tip: Sign in to save your progress and compete on the leaderboard
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
