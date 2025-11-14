import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind, Play, Pause, RotateCcw } from "lucide-react";

const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [timeLeft, setTimeLeft] = useState(4);

  const phaseDurations = {
    inhale: 4,
    hold: 4,
    exhale: 6,
  };

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === "inhale") {
            setPhase("hold");
            return phaseDurations.hold;
          } else if (phase === "hold") {
            setPhase("exhale");
            return phaseDurations.exhale;
          } else {
            setPhase("inhale");
            return phaseDurations.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase("inhale");
    setTimeLeft(4);
  };

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case "inhale":
        return "scale-150";
      case "hold":
        return "scale-150";
      case "exhale":
        return "scale-100";
    }
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-primary" />
          <CardTitle>Guided Breathing Exercise</CardTitle>
        </div>
        <CardDescription>
          Take a moment to relax with this 4-4-6 breathing technique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Breathing Circle Animation */}
        <div className="flex items-center justify-center py-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div
              className={`absolute w-32 h-32 rounded-full bg-gradient-calm transition-transform duration-[${
                phase === "inhale" ? "4000" : phase === "hold" ? "0" : "6000"
              }ms] ease-in-out ${isActive ? getCircleScale() : "scale-100"}`}
              style={{
                boxShadow: "0 0 40px hsl(var(--primary) / 0.4)",
              }}
            />
            <div className="relative z-10 text-center">
              <p className="text-2xl font-semibold text-foreground">{getPhaseText()}</p>
              <p className="text-4xl font-bold text-primary mt-2">{timeLeft}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {phase === "inhale" && "Take a slow, deep breath through your nose"}
            {phase === "hold" && "Hold your breath gently"}
            {phase === "exhale" && "Release slowly through your mouth"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleToggle}
            className="bg-gradient-calm hover:opacity-90"
            size="lg"
          >
            {isActive ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start
              </>
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreathingExercise;
