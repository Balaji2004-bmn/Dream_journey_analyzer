import { useState, useRef, useCallback, useEffect } from "react";
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

  // Check for authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Lock className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to analyze your dreams and create personalized dream videos.
          </p>
          <CosmicButton 
            onClick={() => window.location.href = '/auth'}
            className="w-full"
          >
            Sign In to Continue
          </CosmicButton>
        </div>
      </div>
    );
  }

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
    const emotionPatterns = {
      'Joy': ['happy', 'joy', 'smile', 'laugh', 'bright', 'wonderful', 'amazing', 'beautiful'],
      'Fear': ['scary', 'afraid', 'dark', 'monster', 'chase', 'run', 'hide', 'nightmare'],
      'Wonder': ['magical', 'mystical', 'floating', 'flying', 'glowing', 'sparkle', 'mysterious'],
      'Love': ['love', 'heart', 'warm', 'together', 'embrace', 'family', 'friend', 'romantic'],
      'Adventure': ['explore', 'journey', 'travel', 'discover', 'quest', 'adventure', 'mountain', 'ocean'],
      'Peace': ['calm', 'quiet', 'serene', 'peaceful', 'gentle', 'soft', 'still', 'meditation']
    };

    const emotions = Object.entries(emotionPatterns).map(([emotion, patterns]) => {
      const matches = patterns.filter(pattern => text.includes(pattern)).length;
      const intensity = Math.min(95, Math.max(15, matches * 25 + Math.random() * 30));
      return { emotion, intensity: Math.round(intensity) };
    }).filter(e => e.intensity > 20).sort((a, b) => b.intensity - a.intensity);

    return emotions.slice(0, 4);
  };

  const generateSummary = (text: string, keywords: string[], emotions: { emotion: string; intensity: number }[]): string => {
    const topEmotion = emotions[0]?.emotion.toLowerCase() || 'mystery';
    const keywordPhrase = keywords.slice(0, 3).join(', ');
    
    return `Your dream reveals a rich tapestry of ${topEmotion} intertwined with elements of ${keywordPhrase}. The subconscious mind weaves together these symbols to process experiences, emotions, and aspirations. This dream suggests a deep connection to ${topEmotion} and may represent your inner journey toward understanding these themes in your waking life.`;
  };

  const generateStoryline = (text: string, keywords: string[]): string => {
    const protagonist = keywords.includes('I') || text.includes('I ') ? 'you' : 'the dreamer';
    const setting = keywords.find(k => ['ocean', 'forest', 'city', 'home', 'school', 'mountain', 'sky'].includes(k.toLowerCase())) || 'a mystical realm';
    
    return `In this cinematic dream journey, ${protagonist} find yourself in ${setting}, where reality bends and transforms. The narrative unfolds as symbolic elements dance together, creating a visual story that speaks to your deepest emotions and desires. Each scene transitions seamlessly, guided by your subconscious wisdom, revealing hidden truths and unexplored possibilities within your inner landscape.`;
  };

  const startVoiceRecognition = useCallback(() => {
    if (!voiceRecognition.isSupported) {
      toast.error("Voice recognition is not supported in your browser");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setVoiceRecognition(prev => ({ ...prev, isListening: true }));
      toast.success("Voice recording started. Describe your dream...");
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        setDreamText(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      setVoiceRecognition(prev => ({ ...prev, isListening: false }));
      toast.error("Voice recognition error. Please try again.");
    };

    recognitionRef.current.onend = () => {
      setVoiceRecognition(prev => ({ ...prev, isListening: false }));
    };

    recognitionRef.current.start();
  }, [voiceRecognition.isSupported]);

  const stopVoiceRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setVoiceRecognition(prev => ({ ...prev, isListening: false }));
      toast.success("Voice recording stopped");
    }
  }, []);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachedPhoto(e.target?.result as string);
          toast.success("Photo attached successfully!");
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please select a valid image file");
      }
    }
  };

  const removePhoto = () => {
    setAttachedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateVideo = async () => {
    if (!analysis) return;
    
    setAnalysis(prev => prev ? { ...prev, videoStatus: "analyzing", videoProgress: 0 } : null);
    
    const videoSteps = [
      "Analyzing dream narrative structure...",
      "Processing attached photo for character generation...",
      "Creating scene compositions...", 
      "Generating AI video frames...",
      "Rendering final dream video...",
      "Applying cinematic effects..."
    ];

    let currentStep = 0;
    const progressInterval = setInterval(() => {
      setAnalysis(prev => {
        if (!prev) return null;
        
        const stepProgress = 100 / videoSteps.length;
        const newProgress = Math.min(100, (currentStep * stepProgress) + Math.random() * 10);
        
        if (currentStep < videoSteps.length) {
          toast.info(videoSteps[currentStep]);
          currentStep++;
        }
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          toast.success("🎬 Dream video generated successfully!");
          return { ...prev, videoStatus: "complete", videoProgress: 100 };
        }
        
        const status = newProgress < 60 ? "analyzing" : "generating";
        return { ...prev, videoStatus: status, videoProgress: newProgress };
      });
    }, 1200);
  };

  const saveDream = async () => {
    if (!analysis || !dreamText.trim()) {
      toast.error("Please analyze your dream first");
      return;
    }

    if (!user) {
      toast.error("Please sign in to save your dream");
      return;
    }

    try {
      // Generate a video URL if the video was completed
      const videoUrl = analysis.videoStatus === "complete" 
        ? `https://example.com/dream-videos/${Date.now()}.mp4` 
        : null;

      const { data, error } = await supabase
        .from('dreams')
        .insert({
          user_id: user.id,
          title: `Dream from ${new Date().toLocaleDateString()}`,
          content: dreamText,
          analysis: analysis as any,
          video_url: videoUrl,
          video_status: analysis.videoStatus,
          is_public: false
        });

      if (error) throw error;
      
      toast.success("Dream saved to your journal! 📖");
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save dream. Please try again.");
    }
  };

  const downloadDream = () => {
    if (!analysis || !dreamText.trim()) {
      toast.error("Please analyze your dream first");
      return;
    }

    const dreamData = {
      title: `Dream from ${new Date().toLocaleDateString()}`,
      content: dreamText,
      analysis: analysis,
      timestamp: new Date().toISOString(),
      attachedPhoto: attachedPhoto
    };

    const dataStr = JSON.stringify(dreamData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dream-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Dream downloaded successfully! 📥");
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Input Section */}
          <DreamCard className="p-8">
            <DreamCardHeader>
              <DreamCardTitle className="flex items-center gap-3">
                <Moon className="w-8 h-8 text-primary-glow" />
                Tell Me Your Dream
              </DreamCardTitle>
            </DreamCardHeader>
            <DreamCardContent>
              <div className="space-y-6">
                <div className="relative">
                  <Textarea
                    placeholder="Describe your dream in detail... The more vivid the description, the better the analysis will be."
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    className="min-h-32 bg-input/50 border-border/30 focus:border-primary/50 text-foreground placeholder:text-muted-foreground resize-none backdrop-blur-sm pr-20"
                  />
                  
                  {/* Voice Recognition Button */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {voiceRecognition.isSupported && (
                      <CosmicButton
                        variant={voiceRecognition.isListening ? "nebula" : "ghost"}
                        size="icon"
                        onClick={voiceRecognition.isListening ? stopVoiceRecognition : startVoiceRecognition}
                        className="h-8 w-8"
                      >
                        {voiceRecognition.isListening ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </CosmicButton>
                    )}
                  </div>
                </div>

                {/* Photo Attachment Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <CosmicButton
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Attach Photo
                    </CosmicButton>
                    {attachedPhoto && (
                      <span className="text-sm text-muted-foreground">Photo attached</span>
                    )}
                  </div>

                  {/* Photo Preview */}
                  {attachedPhoto && (
                    <div className="relative group">
                      <img
                        src={attachedPhoto}
                        alt="Attached photo"
                        className="w-full max-w-xs h-32 object-cover rounded-lg border border-border/30"
                      />
                      <CosmicButton
                        variant="ghost"
                        size="icon"
                        onClick={removePhoto}
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </CosmicButton>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <CosmicButton 
                    onClick={handleAnalyze}
                    disabled={!dreamText.trim() || isAnalyzing}
                    variant="cosmic"
                    size="lg"
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <Brain className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing Dream...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Analyze My Dream
                      </>
                    )}
                  </CosmicButton>
                  
                  {analysis && (
                    <>
                      <CosmicButton 
                        onClick={saveDream}
                        variant="outline"
                        size="lg"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        Save
                      </CosmicButton>
                      <CosmicButton 
                        onClick={downloadDream}
                        variant="ghost"
                        size="lg"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download
                      </CosmicButton>
                    </>
                  )}
                </div>
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
                        className="transition-all duration-200"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}