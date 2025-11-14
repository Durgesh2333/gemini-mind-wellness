import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StressAnalysis {
  stressScore: number;
  stressFactors: string[];
  wellnessTips: string[];
}

interface HistoryEntry {
  text: string;
  analysis: StressAnalysis;
  timestamp: string;
}

const Index = () => {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<StressAnalysis | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const { toast } = useToast();

  const getStressLevel = (score: number): { label: string; color: string; emoji: string } => {
    if (score < 30) return { label: "Low", color: "success", emoji: "🌤️" };
    if (score < 60) return { label: "Moderate", color: "warning", emoji: "😊" };
    if (score < 80) return { label: "High", color: "warning", emoji: "😐" };
    return { label: "Very High", color: "danger", emoji: "😰" };
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Please enter your thoughts",
        description: "Tell us how you're feeling today to get personalized insights.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-stress', {
        body: { text }
      });

      if (error) throw error;

      setCurrentAnalysis(data);
      
      // Add to history (keep last 7 entries)
      const newEntry: HistoryEntry = {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        analysis: data,
        timestamp: new Date().toISOString(),
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 7));
      
      toast({
        title: "Analysis Complete!",
        description: "Your stress analysis is ready.",
      });
    } catch (error) {
      console.error('Error analyzing stress:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const stressLevel = currentAnalysis ? getStressLevel(currentAnalysis.stressScore) : null;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-calm rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                AI Stress Detector for Students
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Powered by Google Gemini AI for advanced stress detection and mental wellness advice
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* About Section */}
        <Card className="mb-8 shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="text-primary">Welcome to Your Mental Wellness Companion</CardTitle>
            <CardDescription className="text-base">
              Share how you're feeling today, and let AI help you understand and manage your stress levels. 
              Get personalized insights and actionable wellness tips designed specifically for students.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Input Section */}
        <Card className="mb-8 shadow-card border-border/50">
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
            <CardDescription>
              Be honest and specific. The more details you share, the better insights you'll receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="I'm feeling overwhelmed with my upcoming exams. I have three tests next week and I'm not sure where to start..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[150px] resize-none text-base"
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              className="w-full md:w-auto bg-gradient-calm hover:opacity-90 transition-opacity"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze My Stress
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {currentAnalysis && stressLevel && (
          <Card className="mb-8 shadow-soft border-border/50 animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="text-2xl">Your Stress Analysis</CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{stressLevel.emoji}</span>
                  <div>
                    <Badge 
                      variant="outline"
                      className={`text-lg px-4 py-1 ${
                        stressLevel.color === 'success' ? 'bg-success/10 text-success border-success' :
                        stressLevel.color === 'warning' ? 'bg-warning/10 text-warning border-warning' :
                        'bg-danger/10 text-danger border-danger'
                      }`}
                    >
                      {stressLevel.label} Stress
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Score: {currentAnalysis.stressScore}/100
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stress Factors */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">Main Stress Factors</h3>
                <ul className="space-y-2">
                  {currentAnalysis.stressFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Wellness Tips */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg text-foreground">AI Suggestions by Gemini</h3>
                </div>
                <div className="space-y-3">
                  {currentAnalysis.wellnessTips.map((tip, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg border border-border/50">
                      <p className="text-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Your Recent Check-ins</CardTitle>
              <CardDescription>Last 7 mood entries and wellness insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((entry, index) => {
                  const level = getStressLevel(entry.analysis.stressScore);
                  return (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="text-sm text-muted-foreground flex-1">{entry.text}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xl">{level.emoji}</span>
                          <Badge 
                            variant="outline"
                            className={`${
                              level.color === 'success' ? 'bg-success/10 text-success border-success' :
                              level.color === 'warning' ? 'bg-warning/10 text-warning border-warning' :
                              'bg-danger/10 text-danger border-danger'
                            }`}
                          >
                            {entry.analysis.stressScore}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-sm text-center text-muted-foreground">
            <strong>Disclaimer:</strong> This tool is not a medical diagnostic and is for wellness support only. 
            If you're experiencing severe stress or mental health concerns, please seek professional help.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
