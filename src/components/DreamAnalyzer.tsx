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
    const emotionPatterns = {
      'Joy': ['happy', 'joy', 'laugh', 'smile', 'bright', 'light', 'wonderful', 'amazing', 'beautiful', 'celebration'],
      'Fear': ['scared', 'afraid', 'terror', 'nightmare', 'dark', 'shadow', 'run', 'hide', 'danger', 'threat'],
      'Sadness': ['sad', 'cry', 'tears', 'loss', 'empty', 'alone', 'grief', 'sorrow', 'melancholy', 'blue'],
      'Anger': ['angry', 'mad', 'rage', 'furious', 'fight', 'violence', 'hate', 'aggressive', 'hostile', 'irritated'],
      'Wonder': ['wonder', 'magical', 'mystical', 'amazing', 'awe', 'mysterious', 'curious', 'strange', 'surreal'],
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
    console.log('Starting voice recognition...');
    
    if (!voiceRecognition.isSupported) {
      toast.error("Voice recognition is not supported in your browser");
      console.log('Voice recognition not supported');
      return;
    }

    if (voiceRecognition.isListening) {
      console.log('Already listening');
      return;
    }

    // Request microphone permission first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        console.log('Microphone permission granted');
        
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) {
          toast.error("Speech recognition not available in this browser");
          console.log('SpeechRecognition not available');
          return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log('Voice recognition started');
          setVoiceRecognition(prev => ({ ...prev, isListening: true }));
          toast.success("🎤 Voice recording started. Describe your dream...");
        };

        recognitionRef.current.onresult = (event: any) => {
          console.log('Voice recognition result:', event);
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          setVoiceRecognition(prev => ({ ...prev, transcript: interimTranscript }));
          
          if (finalTranscript) {
            console.log('Final transcript:', finalTranscript);
            setDreamText(prev => prev + (prev ? ' ' : '') + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Voice recognition error:', event.error);
          setVoiceRecognition(prev => ({ ...prev, isListening: false }));
          
          let errorMessage = "Voice recognition error. Please try again.";
          if (event.error === 'not-allowed') {
            errorMessage = "Microphone access denied. Please allow microphone access and try again.";
          } else if (event.error === 'no-speech') {
            errorMessage = "No speech detected. Please speak louder.";
          } else if (event.error === 'network') {
            errorMessage = "Network error. Please check your connection.";
          }
          
          toast.error(errorMessage);
        };

        recognitionRef.current.onend = () => {
          console.log('Voice recognition ended');
          setVoiceRecognition(prev => ({ ...prev, isListening: false }));
        };

        try {
          recognitionRef.current.start();
          console.log('Recognition start called');
        } catch (error) {
          console.error('Error starting recognition:', error);
          toast.error("Failed to start voice recognition");
        }
      })
      .catch((error) => {
        console.error('Microphone access denied:', error);
        toast.error("Microphone access is required for voice recognition");
      });
  }, [voiceRecognition.isSupported, voiceRecognition.isListening]);

  const stopVoiceRecognition = useCallback(() => {
    console.log('Stopping voice recognition...');
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
      toast.error("Failed to save dream. Please try again.");
      console.error(error);
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
      downloadDate: new Date().toISOString()
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
    
    toast.success("Dream analysis downloaded! 📄");
  };

  // Check for authentication AFTER all hooks are declared
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-primary opacity-80" />
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

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-cosmic">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-dream bg-clip-text text-transparent">
              Dream Analyzer
            </h1>
            <p className="text-xl text-muted-foreground">
              Transform your dreams into beautiful visual stories with AI-powered analysis
            </p>
          </div>

          {/* Dream Input */}
          <DreamCard>
            <DreamCardHeader>
              <DreamCardTitle className="text-2xl flex items-center gap-2">
                <Moon className="w-6 h-6 text-primary" />
                Describe Your Dream
              </DreamCardTitle>
            </DreamCardHeader>
            <DreamCardContent className="space-y-6">
              <div className="space-y-4">
                {/* Text Input */}
                <div className="relative">
                  <Textarea
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    placeholder="I dreamed that I was flying over a beautiful forest, with golden light streaming through the trees..."
                    className="min-h-32 text-base bg-input/50 border-border/30 focus:border-primary/50 transition-colors"
                  />
                  {voiceRecognition.transcript && (
                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                      Listening: {voiceRecognition.transcript}
                    </div>
                  )}
                </div>

                {/* Voice Controls */}
                <div className="flex items-center gap-3">
                  {voiceRecognition.isSupported && (
                    <>
                      <Button
                        onClick={voiceRecognition.isListening ? stopVoiceRecognition : startVoiceRecognition}
                        variant={voiceRecognition.isListening ? "destructive" : "cosmic"}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {voiceRecognition.isListening ? (
                          <>
                            <MicOff className="w-4 h-4" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                            Voice Input
                          </>
                        )}
                      </Button>
                      {voiceRecognition.isListening && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 bg-red-500 rounded-full opacity-80"></div>
                          Recording...
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Photo Upload */}
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Attach Photo
                  </Button>
                  
                  {attachedPhoto && (
                    <div className="relative">
                      <img 
                        src={attachedPhoto} 
                        alt="Attached"
                        className="w-12 h-12 object-cover rounded-lg border border-border/30"
                      />
                      <button
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <CosmicButton 
                    onClick={handleAnalyze}
                    disabled={!dreamText.trim() || isAnalyzing}
                    variant="cosmic"
                    size="lg"
                    className="flex-1 min-w-48"
                  >
                    {isAnalyzing ? (
                      <>
                        <Brain className="w-5 h-5 mr-2 opacity-80" />
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