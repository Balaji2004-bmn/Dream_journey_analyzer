import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from "@/components/ui/dream-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, Video, Heart, Zap, Moon, Mic, MicOff, Camera, Upload, X } from "lucide-react";
import { CosmicButton } from "@/components/ui/cosmic-button";
import { toast } from "sonner";

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

                <CosmicButton 
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
                </CosmicButton>
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
                        className="transition-all duration-300 hover:scale-105"
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