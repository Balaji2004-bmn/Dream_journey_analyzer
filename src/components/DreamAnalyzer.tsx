import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from "@/components/ui/dream-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, Video, Heart, Zap, Moon } from "lucide-react";

interface AnalysisResult {
  keywords: string[];
  emotions: { emotion: string; intensity: number }[];
  summary: string;
  storyline: string;
  videoStatus: "idle" | "analyzing" | "generating" | "complete";
  videoProgress: number;
}

export default function DreamAnalyzer() {
  const [dreamText, setDreamText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!dreamText.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis process
    setTimeout(() => {
      const mockAnalysis: AnalysisResult = {
        keywords: ["flying", "ocean", "childhood", "freedom", "adventure", "blue", "wings", "soaring"],
        emotions: [
          { emotion: "Joy", intensity: 85 },
          { emotion: "Wonder", intensity: 78 },
          { emotion: "Nostalgia", intensity: 65 },
          { emotion: "Freedom", intensity: 92 }
        ],
        summary: "A vivid dream about flying over endless blue oceans, representing feelings of liberation and childhood wonder. The dreamer experiences profound joy and connection to their inner child.",
        storyline: "Our story begins with a figure standing at the edge of a cliff, overlooking vast blue waters. Suddenly, magnificent wings unfold, and the journey of flight begins. Soaring through clouds and over waves, the dreamer rediscovers the pure joy of freedom and adventure from their youth.",
        videoStatus: "idle",
        videoProgress: 0
      };
      
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2500);
  };

  const handleGenerateVideo = () => {
    if (!analysis) return;
    
    setAnalysis(prev => prev ? { ...prev, videoStatus: "analyzing", videoProgress: 0 } : null);
    
    const progressInterval = setInterval(() => {
      setAnalysis(prev => {
        if (!prev) return null;
        
        const newProgress = prev.videoProgress + Math.random() * 15;
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return { ...prev, videoStatus: "complete", videoProgress: 100 };
        }
        
        const status = newProgress < 30 ? "analyzing" : "generating";
        return { ...prev, videoStatus: status, videoProgress: newProgress };
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Input Section */}
          <DreamCard className="p-8">
            <DreamCardHeader>
              <DreamCardTitle className="flex items-center gap-3">
                <Moon className="w-8 h-8 text-primary-glow animate-pulse-glow" />
                Tell Me Your Dream
              </DreamCardTitle>
            </DreamCardHeader>
            <DreamCardContent>
              <div className="space-y-6">
                <Textarea
                  placeholder="Describe your dream in detail... The more vivid the description, the better the analysis will be."
                  value={dreamText}
                  onChange={(e) => setDreamText(e.target.value)}
                  className="min-h-32 bg-input/50 border-border/30 focus:border-primary/50 text-foreground placeholder:text-muted-foreground resize-none backdrop-blur-sm"
                />
                <Button 
                  onClick={handleAnalyze}
                  disabled={!dreamText.trim() || isAnalyzing}
                  variant="cosmic"
                  size="lg"
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Brain className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Dream...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze My Dream
                    </>
                  )}
                </Button>
              </div>
            </DreamCardContent>
          </DreamCard>

          {/* Analysis Results */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Keywords */}
              <DreamCard>
                <DreamCardHeader>
                  <DreamCardTitle className="text-lg">Dream Keywords</DreamCardTitle>
                </DreamCardHeader>
                <DreamCardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="cosmic"
                        className="animate-float"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </DreamCardContent>
              </DreamCard>

              {/* Emotions */}
              <DreamCard>
                <DreamCardHeader>
                  <DreamCardTitle className="text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-accent" />
                    Emotional Analysis
                  </DreamCardTitle>
                </DreamCardHeader>
                <DreamCardContent>
                  <div className="space-y-3">
                    {analysis.emotions.map((emotion, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground">{emotion.emotion}</span>
                          <span className="text-muted-foreground">{emotion.intensity}%</span>
                        </div>
                        <Progress 
                          value={emotion.intensity} 
                          className="h-2 bg-muted/30"
                        />
                      </div>
                    ))}
                  </div>
                </DreamCardContent>
              </DreamCard>

              {/* Summary */}
              <DreamCard className="md:col-span-2">
                <DreamCardHeader>
                  <DreamCardTitle className="text-lg">Dream Summary</DreamCardTitle>
                </DreamCardHeader>
                <DreamCardContent>
                  <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
                </DreamCardContent>
              </DreamCard>

              {/* Storyline */}
              <DreamCard className="md:col-span-2">
                <DreamCardHeader>
                  <DreamCardTitle className="text-lg">Generated Storyline</DreamCardTitle>
                </DreamCardHeader>
                <DreamCardContent>
                  <p className="text-foreground leading-relaxed mb-6">{analysis.storyline}</p>
                  
                  {/* Video Generation */}
                  <div className="space-y-4">
                    {analysis.videoStatus === "idle" && (
                      <Button onClick={handleGenerateVideo} variant="nebula" className="w-full">
                        <Video className="w-5 h-5 mr-2" />
                        Generate Dream Video
                      </Button>
                    )}
                    
                    {analysis.videoStatus !== "idle" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Zap className="w-4 h-4" />
                          {analysis.videoStatus === "analyzing" && "Analyzing storyline..."}
                          {analysis.videoStatus === "generating" && "Generating video..."}
                          {analysis.videoStatus === "complete" && "Video generation complete!"}
                        </div>
                        <Progress value={analysis.videoProgress} className="w-full" />
                        
                        {analysis.videoStatus === "complete" && (
                          <div className="mt-4 p-4 bg-gradient-nebula rounded-lg">
                            <p className="text-center text-foreground font-medium mb-2">
                              🎬 Your Dream Video is Ready!
                            </p>
                            <p className="text-center text-sm text-muted-foreground">
                              Video generation complete. In a real app, this would show your personalized dream video.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </DreamCardContent>
              </DreamCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}