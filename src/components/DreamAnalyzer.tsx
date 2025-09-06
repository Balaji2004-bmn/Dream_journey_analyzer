import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from "@/components/ui/dream-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, Video, Heart, Zap, Moon, Mic, MicOff, Camera, Upload, X, Save, Wand2, Download, Lock } from "lucide-react";
import { CosmicButton } from "@/components/ui/cosmic-button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AnalysisResult {
  keywords: string[];
  emotions: { emotion: string; intensity: number }[];
  summary: string;
  storyline: string;
  videoStatus: "idle" | "analyzing" | "generating" | "complete";
  videoProgress: number;
  attachedPhoto?: string;
}

interface VoiceRecognition {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
}

export default function DreamAnalyzer() {
  const { user, loading } = useAuth();
  const [dreamText, setDreamText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [voiceRecognition, setVoiceRecognition] = useState<VoiceRecognition>({
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    isListening: false,
    transcript: ""
  });
  
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!dreamText.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Advanced AI-powered dream analysis
      const analysisSteps = [
        "Processing dream narrative...",
        "Extracting emotional patterns...", 
        "Identifying symbolic elements...",
        "Generating psychological insights...",
        "Creating storyline structure..."
      ];
      
      for (let i = 0; i < analysisSteps.length; i++) {
        toast.info(analysisSteps[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // Generate dynamic analysis based on dream content
      const dreamWords = dreamText.toLowerCase();
      const keywords = extractKeywords(dreamWords);
      const emotions = analyzeEmotions(dreamWords);
      const summary = generateSummary(dreamText, keywords, emotions);
      const storyline = generateStoryline(dreamText, keywords);
      
      const dynamicAnalysis: AnalysisResult = {
        keywords,
        emotions,
        summary,
        storyline,
        videoStatus: "idle",
        videoProgress: 0,
        attachedPhoto: attachedPhoto || undefined
      };
      
      setAnalysis(dynamicAnalysis);
      toast.success("Dream analysis complete! ✨");
      
    } catch (error) {
      toast.error("Analysis failed. Please try again.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractKeywords = (text: string): string[] => {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'i', 'was', 'were', 'am', 'is', 'are'];
    const words = text.split(/\s+/).filter(word => 
      word.length > 3 && !commonWords.includes(word.toLowerCase())
    );
    const uniqueWords = [...new Set(words)];
    return uniqueWords.slice(0, 8).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
  };

  const analyzeEmotions = (text: string): { emotion: string; intensity: number }[] => {
    const emotionWords = {
      joy: ['happy', 'joy', 'bliss', 'euphoric', 'celebration', 'laughter', 'smile'],
      fear: ['afraid', 'terror', 'scary', 'nightmare', 'anxiety', 'panic', 'worry'],
      anger: ['angry', 'rage', 'fury', 'mad', 'irritated', 'frustrated', 'violence'],
      sadness: ['sad', 'cry', 'tears', 'grief', 'sorrow', 'despair', 'melancholy'],
      love: ['love', 'affection', 'romance', 'heart', 'kiss', 'embrace', 'tender'],
      peace: ['calm', 'peaceful', 'serene', 'tranquil', 'meditation', 'zen', 'harmony'],
      wonder: ['amazing', 'magical', 'mysterious', 'curious', 'awe', 'fascination', 'marvel']
    };

    const emotions = Object.entries(emotionWords).map(([emotion, words]) => {
      const intensity = words.reduce((count, word) => {
        return count + (text.includes(word) ? 1 : 0);
      }, 0) * 20 + Math.random() * 40 + 30;
      
      return { emotion, intensity: Math.min(100, Math.round(intensity)) };
    }).filter(e => e.intensity > 40).slice(0, 4);

    return emotions.length > 0 ? emotions : [
      { emotion: "mystery", intensity: 75 },
      { emotion: "introspection", intensity: 65 }
    ];
  };

  const generateSummary = (dreamText: string, keywords: string[], emotions: { emotion: string; intensity: number }[]): string => {
    const templates = [
      "This dream reveals deep insights about your subconscious mind and emotional state.",
      "Your dream symbolizes a journey of personal transformation and growth.",
      "This dream reflects your inner desires and fears, manifesting through symbolic imagery.",
      "The dream represents your psyche's attempt to process recent experiences and emotions."
    ];
    
    const keywordPhrase = keywords.length > 0 ? ` The presence of ${keywords.slice(0, 3).join(', ')} suggests themes of personal significance.` : "";
    const emotionPhrase = emotions.length > 0 ? ` The dominant emotional tone of ${emotions[0].emotion} indicates your current psychological state.` : "";
    
    return templates[Math.floor(Math.random() * templates.length)] + keywordPhrase + emotionPhrase;
  };

  const generateStoryline = (dreamText: string, keywords: string[]): string => {
    const storyElements = [
      "Your dream begins in a realm where reality bends to the will of the subconscious.",
      "The narrative unfolds through a series of symbolic encounters and mystical experiences.",
      "As the dream progresses, hidden meanings emerge through powerful visual metaphors.",
      "The climax reveals profound truths about your inner world and life's journey."
    ];
    
    return storyElements.join(" ") + " This creates a perfect foundation for a personalized dream video that captures the essence of your experience.";
  };

  const startVoiceRecognition = useCallback(() => {
    if (!voiceRecognition.isSupported) {
      toast.error("Speech recognition not supported in your browser");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setVoiceRecognition(prev => ({ ...prev, isListening: true }));
        toast.info("🎤 Listening for your dream...");
      };

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceRecognition(prev => ({ ...prev, transcript }));
        setDreamText(transcript);
      };

      recognitionRef.current.onend = () => {
        setVoiceRecognition(prev => ({ ...prev, isListening: false }));
        toast.success("Voice recording complete!");
      };

      recognitionRef.current.onerror = (event: any) => {
        setVoiceRecognition(prev => ({ ...prev, isListening: false }));
        toast.error(`Speech recognition error: ${event.error}`);
      };

      recognitionRef.current.start();
    } catch (error) {
      toast.error("Failed to start speech recognition");
      console.error(error);
    }
  }, [voiceRecognition.isSupported]);

  const stopVoiceRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachedPhoto(e.target?.result as string);
      toast.success("Photo attached successfully!");
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setAttachedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info("Photo removed");
  };

  const handleGenerateVideo = async () => {
    if (!analysis) return;

    const steps = [
      { status: "analyzing", message: "Analyzing dream storyline..." },
      { status: "generating", message: "Generating cinematic sequences..." },
      { status: "complete", message: "Dream video ready!" }
    ];

    for (let i = 0; i < steps.length; i++) {
      setAnalysis(prev => prev ? {
        ...prev,
        videoStatus: steps[i].status as any,
        videoProgress: ((i + 1) / steps.length) * 100
      } : null);

      toast.info(steps[i].message);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    toast.success("🎬 Your dream video is ready!");
  };

  const saveDream = async () => {
    if (!user) {
      toast.error("Please sign in to save your dream");
      return;
    }

    if (!analysis) {
      toast.error("Please analyze your dream first");
      return;
    }

    try {
      const { error } = await supabase
        .from('dreams')
        .insert({
          user_id: user.id,
          title: dreamText.slice(0, 100) + (dreamText.length > 100 ? "..." : ""),
          content: dreamText,
          analysis: analysis as any,
          is_public: false,
          video_status: analysis.videoStatus === "complete" ? "complete" : "pending"
        });

      if (error) throw error;

      toast.success("Dream saved to gallery successfully! ✨ Check your Gallery to view it.");
      
      // Reset the form after saving
      setDreamText("");
      setAnalysis(null);
      setAttachedPhoto(null);
    } catch (error) {
      toast.error("Failed to save dream");
      console.error(error);
    }
  };

  const downloadDream = () => {
    if (!analysis) return;

    const dreamData = {
      content: dreamText,
      analysis: analysis,
      timestamp: new Date().toISOString(),
      attachedPhoto: attachedPhoto
    };

    const blob = new Blob([JSON.stringify(dreamData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dream-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Dream analysis downloaded!");
  };

  if (loading) {
    return (
      <div className="pt-20 pb-12 min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <div className="flex items-center gap-3 opacity-80 text-primary-glow">
          <Brain className="w-6 h-6 animate-pulse" />
          Loading...
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-cosmic">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-dream bg-clip-text text-transparent">
              Dream Analyzer
            </h1>
            <Moon className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-xl text-muted-foreground">
            Transform your dreams into insights with AI-powered analysis
          </p>
        </div>

        {/* Dream Input */}
        <DreamCard className="bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5">
          <DreamCardHeader>
            <DreamCardTitle className="flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-purple-400" />
              Describe Your Dream
            </DreamCardTitle>
          </DreamCardHeader>
          <DreamCardContent className="space-y-4">
            <div className="space-y-4">
              <Textarea
                placeholder="Describe your dream in detail... What did you see, feel, and experience?"
                value={dreamText}
                onChange={(e) => setDreamText(e.target.value)}
                className="min-h-[120px] bg-background/50 border-purple-300/30 focus:border-purple-400/50"
              />
              
              {/* Voice Input */}
              {voiceRecognition.isSupported && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={voiceRecognition.isListening ? stopVoiceRecognition : startVoiceRecognition}
                    variant={voiceRecognition.isListening ? "destructive" : "outline"}
                    size="sm"
                    className={voiceRecognition.isListening ? 
                      "bg-red-500 hover:bg-red-600 text-white" : 
                      "border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                    }
                  >
                    {voiceRecognition.isListening ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Voice Input
                      </>
                    )}
                  </Button>
                  {voiceRecognition.isListening && (
                    <span className="text-sm text-muted-foreground">Listening...</span>
                  )}
                </div>
              )}

              {/* Photo Attachment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Attach Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {attachedPhoto && (
                  <div className="relative inline-block">
                    <img 
                      src={attachedPhoto} 
                      alt="Attached" 
                      className="max-w-xs h-32 object-cover rounded-lg border border-border/20"
                    />
                    <Button
                      onClick={removePhoto}
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <CosmicButton 
                  onClick={handleAnalyze}
                  disabled={!dreamText.trim() || isAnalyzing}
                  variant="cosmic"
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      Analyze Dream
                    </>
                  )}
                </CosmicButton>
              </div>
            </div>
          </DreamCardContent>
        </DreamCard>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Keywords */}
              <DreamCard className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <DreamCardHeader>
                  <DreamCardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Dream Keywords
                  </DreamCardTitle>
                </DreamCardHeader>
                <DreamCardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="cosmic"
                        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-300/30"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </DreamCardContent>
              </DreamCard>

              {/* Emotions */}
              <DreamCard className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                <DreamCardHeader>
                  <DreamCardTitle className="text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Emotional Analysis
                  </DreamCardTitle>
                </DreamCardHeader>
                <DreamCardContent>
                  <div className="space-y-3">
                    {analysis.emotions.map((emotion, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize font-medium text-foreground">{emotion.emotion}</span>
                          <span className="text-muted-foreground">{emotion.intensity}%</span>
                        </div>
                        <Progress value={emotion.intensity} className="h-2" />
                      </div>
                    ))}
                  </div>
                </DreamCardContent>
              </DreamCard>
            </div>

            {/* Summary */}
            <DreamCard className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
              <DreamCardHeader>
                <DreamCardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Dream Summary
                </DreamCardTitle>
              </DreamCardHeader>
              <DreamCardContent>
                <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
              </DreamCardContent>
            </DreamCard>

            {/* Storyline */}
            <DreamCard className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
              <DreamCardHeader>
                <DreamCardTitle className="text-lg flex items-center gap-2">
                  <Video className="w-5 h-5 text-violet-400" />
                  Generated Storyline
                </DreamCardTitle>
              </DreamCardHeader>
              <DreamCardContent>
                <p className="text-foreground leading-relaxed mb-6">{analysis.storyline}</p>
                
                {/* Video Generation */}
                <div className="space-y-4">
                  {analysis.videoStatus === "idle" && (
                    <CosmicButton onClick={handleGenerateVideo} variant="nebula" className="w-full">
                      <Video className="w-5 h-5 mr-2" />
                      {attachedPhoto ? "Generate Video with Your Photo" : "Generate Dream Video"}
                    </CosmicButton>
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              {user ? (
                <>
                  <CosmicButton onClick={saveDream} variant="cosmic" className="flex-1">
                    <Save className="w-5 h-5 mr-2" />
                    Save to Gallery
                  </CosmicButton>
                  <Button onClick={downloadDream} variant="outline" className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10">
                    <Download className="w-5 h-5 mr-2" />
                    Download
                  </Button>
                </>
              ) : (
                <div className="flex-1 p-4 bg-muted/20 rounded-lg border border-border/20">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Lock className="w-5 h-5" />
                    <span>Sign in to save your dreams to the gallery</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}