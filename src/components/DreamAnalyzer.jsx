import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from "@/components/ui/dream-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Brain, Sparkles, Video, Heart, Zap, Moon, Mic, MicOff, Camera, Upload, X, Save, Wand2, Download, Lock, Eye, EyeOff, Play, Pause } from "lucide-react";
import { CosmicButton } from "@/components/ui/cosmic-button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getRandomDemoVideo } from "@/utils/demoVideos";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import EmailVerificationModal from "@/components/EmailVerificationModal";

// TypeScript interfaces removed - using plain JavaScript objects

export default function DreamAnalyzer() {
  const { user, session, loading } = useAuth();
  const [dreamText, setDreamText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const [isPublic, setIsPublic] = useState(true); // Privacy setting
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [userPrivacySettings, setUserPrivacySettings] = useState({
    allowPrivateDreams: true,
    dreamsPublic: false
  });
  const [voiceRecognition, setVoiceRecognition] = useState({
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    isListening: false,
    transcript: ""
  });

  // Video generation hook
  const {
    isGenerating,
    generationProgress,
    generatedVideos,
    generateDreamVideo,
    generateMultipleVariations,
    clearGeneratedVideos
  } = useVideoGeneration();
  
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load user privacy settings
  useEffect(() => {
    if (user) {
      // Load privacy settings from user metadata
      const privacySettings = user.user_metadata?.privacy || {
        allowPrivateDreams: true,
        dreamsPublic: false
      };
      setUserPrivacySettings(privacySettings);
      setIsPublic(privacySettings.dreamsPublic);
    }
  }, [user]);

  const handleAnalyze = async () => {
    if (!dreamText.trim()) {
      toast.error("Please enter your dream description");
      return;
    }
    
    if (!user || !session?.access_token) {
      toast.error("Please sign in to analyze your dreams");
      return;
    }
    if (!user.email_confirmed_at) {
      setShowVerifyModal(true);
      toast.error("Please verify your email to continue");
      return;
    }
    
    setIsAnalyzing(true);
    toast.info("Starting dream analysis...");
    
    try {
      // First try backend NLP for real analysis
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const aiRes = await fetch(`${backendUrl}/api/ai/analyze-dream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ content: dreamText, title: dreamText.slice(0, 80) })
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const parsed = aiData.analysis || {};
        setAnalysis({
          keywords: parsed.keywords || [],
          emotions: parsed.emotions || [],
          summary: parsed.summary || '',
          storyline: parsed.storyline || generateStoryline(dreamText, parsed.keywords || []),
          videoStatus: 'idle',
          videoProgress: 0,
          attachedPhoto: attachedPhoto || undefined
        });
        toast.success("Dream analysis complete! ✨");
        return;
      }

      // Fallback: client-side varied analysis
      const analysisSteps = [
        "Processing dream narrative...",
        "Extracting emotional patterns...", 
        "Identifying symbolic elements...",
        "Generating psychological insights...",
        "Creating storyline structure..."
      ];
      for (let i = 0; i < analysisSteps.length; i++) {
        toast.info(analysisSteps[i]);
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      const dreamWords = dreamText.toLowerCase();
      const keywords = extractKeywords(dreamWords);
      const emotions = analyzeEmotions(dreamWords);
      const summary = generateSummary(dreamText, keywords, emotions);
      const storyline = generateStoryline(dreamText, keywords);

      setAnalysis({
        keywords,
        emotions,
        summary,
        storyline,
        videoStatus: 'idle',
        videoProgress: 0,
        attachedPhoto: attachedPhoto || undefined
      });
      toast.success("Dream analysis complete! ✨");
      
    } catch (error) {
      toast.error("Analysis failed. Please try again.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate video using Google GenAI Veo 3 via backend
  const handleGenerateVeoVideo = async () => {
    try {
      if (!user || !session?.access_token) {
        toast.error("Please sign in to generate videos");
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

      // Prefer a cinematic storyline if available, else fall back to user text
      const basePrompt = (analysis?.storyline || dreamText || '').trim();
      if (!basePrompt) {
        toast.error('Please enter your dream description first');
        return;
      }

      // Include photo description in prompt if photo is attached
      let enhancedPrompt = basePrompt;
      if (attachedPhoto) {
        const photoDescription = "Include the user's uploaded photo as a key visual element in the video, integrating it naturally into the dream sequence.";
        enhancedPrompt = `${basePrompt}. ${photoDescription}`;
      }

      // Veo prompt must be <= 300 chars
      const prompt = enhancedPrompt.length > 300 ? enhancedPrompt.slice(0, 300) : enhancedPrompt;

      setAnalysis(prev => prev ? {
        ...prev,
        videoStatus: 'generating',
        videoProgress: 0,
        generatedVeoFileId: undefined
      } : {
        videoStatus: 'generating',
        videoProgress: 0,
        generatedVeoFileId: undefined
      });

      const res = await fetch(`${backendUrl}/api/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          prompt,
          attachedPhoto: attachedPhoto // Send photo data to backend
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.fileId) {
        throw new Error(data?.message || 'Failed to generate Veo video');
      }

      setAnalysis(prev => prev ? {
        ...prev,
        videoStatus: 'complete',
        videoProgress: 100,
        generatedVeoFileId: data.fileId
      } : {
        videoStatus: 'complete',
        videoProgress: 100,
        generatedVeoFileId: data.fileId
      });
      toast.success(attachedPhoto ? 'Veo video created with your photo!' : 'Veo video created! File ID saved.');
    } catch (err) {
      console.error('Veo generation error:', err);
      toast.error(err?.message || 'Failed to generate video');
      setAnalysis(prev => prev ? { ...prev, videoStatus: 'idle', videoProgress: 0 } : null);
    }
  };

  const extractKeywords = (text) => {
    const commonWords = new Set(['the','and','or','but','in','on','at','to','for','of','with','by','a','an','i','was','were','am','is','are','this','that','you','your']);
    const freq = new Map();
    text.split(/[^a-zA-Z]+/g).forEach(w => {
      const word = w.trim().toLowerCase();
      if (word.length > 3 && !commonWords.has(word)) {
        freq.set(word, (freq.get(word) || 0) + 1);
      }
    });
    return [...freq.entries()]
      .sort((a,b) => b[1]-a[1])
      .slice(0, 8)
      .map(([w]) => w.charAt(0).toUpperCase()+w.slice(1));
  };

  const analyzeEmotions = (text) => {
    const emotionWords = {
      joy: ['happy','joy','bliss','euphoric','celebration','laughter','smile','delight','glad','cheerful'],
      fear: ['afraid','terror','scary','nightmare','anxiety','panic','worry','fearful','dread','horror'],
      anger: ['angry','rage','fury','mad','irritated','frustrated','violence','resentment','annoyed'],
      sadness: ['sad','cry','tears','grief','sorrow','despair','melancholy','lonely','blue'],
      love: ['love','affection','romance','heart','kiss','embrace','tender','caring','fond'],
      peace: ['calm','peaceful','serene','tranquil','meditation','zen','harmony','quiet','still'],
      wonder: ['amazing','magical','mysterious','curious','awe','fascination','marvel','astonished','surprised']
    };
    const totals = Object.entries(emotionWords).map(([emotion, words]) => {
      const hits = words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
      // Add slight randomness and scale by keyword diversity
      const intensity = Math.min(100, Math.round(hits * 25 + Math.random() * 20 + extractKeywords(text).length * 3));
      return { emotion, intensity };
    }).filter(e => e.intensity > 20);
    const sorted = totals.sort((a,b) => b.intensity - a.intensity).slice(0, 5);
    return sorted.length ? sorted : [{ emotion: 'neutral', intensity: 50 }];
  };

  const generateSummary = (dreamText, keywords, emotions) => {
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

  const generateStoryline = (dreamText, keywords) => {
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
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setVoiceRecognition(prev => ({ ...prev, isListening: true }));
        toast.info("🎤 Listening for your dream...");
      };

      recognitionRef.current.onresult = (event) => {
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

      recognitionRef.current.onerror = (event) => {
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

  const handlePhotoUpload = (event) => {
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
      setAttachedPhoto(e.target?.result);
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

    try {
      // Check if RunwayML is configured via environment variable
      const apiKey = import.meta.env.VITE_RUNWAY_API_KEY;
      if (!apiKey) {
        toast.error("RunwayML API key not configured. Please set VITE_RUNWAY_API_KEY in your .env file.");
        return;
      }

      setAnalysis(prev => prev ? {
        ...prev,
        videoStatus: "generating",
        videoProgress: 0
      } : null);

      // Generate real video using RunwayML
      await generateDreamVideo(dreamText, analysis.emotions, analysis.keywords);

      // Update analysis with generated video
      const latestVideo = generatedVideos[0];
      if (latestVideo && latestVideo.status === 'completed') {
        setAnalysis(prev => prev ? {
          ...prev,
          videoStatus: "complete",
          videoProgress: 100,
          generatedVideoUrl: latestVideo.url,
          videoId: latestVideo.id
        } : null);
      }

    } catch (error) {
      console.error('Video generation error:', error);
      
      // Fallback to demo video
      setAnalysis(prev => prev ? {
        ...prev,
        videoStatus: "complete",
        videoProgress: 100,
        demoVideoUrl: getRandomDemoVideo()
      } : null);
      
      toast.info("Using demo video. Check settings to configure RunwayML API key for real video generation.");
    }
  };

  const handleGenerateVariations = async () => {
    if (!analysis) return;

    try {
      const apiKey = import.meta.env.VITE_RUNWAY_API_KEY;
      if (!apiKey) {
        toast.error("RunwayML API key not configured. Please set VITE_RUNWAY_API_KEY in your .env file.");
        return;
      }

      setAnalysis(prev => prev ? {
        ...prev,
        videoStatus: "generating",
        videoProgress: 0
      } : null);

      // Generate multiple variations
      await generateMultipleVariations(dreamText, analysis.emotions, analysis.keywords, 3);

      setAnalysis(prev => prev ? {
        ...prev,
        videoStatus: "complete",
        videoProgress: 100,
        hasVariations: true
      } : null);

    } catch (error) {
      console.error('Video variations error:', error);
      toast.error("Failed to generate video variations. Please try again.");
    }
  };


  const saveDream = async () => {
    if (!user) {
      toast.error("Please sign in to save your dream");
      return;
    }

    if (!session || !session.access_token) {
      toast.error("Session expired. Please sign in again.");
      return;
    }

    if (!analysis) {
      toast.error("Please analyze your dream first before saving.");
      return;
    }

    try {
      const backendRoot = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

      const dreamData = {
        title: dreamText.slice(0, 80),
        content: dreamText,
        analysis: analysis,
        is_public: isPublic,
        thumbnail_url: analysis.generatedVideoUrl ? analysis.generatedVideoUrl.replace('.mp4', '.jpg') : 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
        video_url: analysis.generatedVideoUrl || analysis.demoVideoUrl || getRandomDemoVideo(),
        video_prompt: analysis.storyline,
        video_duration: 4
      };

      console.log('Saving dream with data:', dreamData);
      console.log('Session token available:', !!session.access_token);

      const response = await fetch(`${backendRoot}/api/dreams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(dreamData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Backend API error:', errorData);
        toast.error(`Failed to save dream: ${errorData.message || 'Unknown error'}`);
        return;
      }

      const result = await response.json();
      console.log('Dream saved successfully via backend:', result);

      if (result.success) {
        toast.success("Dream saved to gallery successfully! ✨");

        // Ask if user wants to email the dream
        if (window.confirm("Would you like to email this dream to yourself or someone else?")) {
          const email = prompt("Enter email address:");
          if (email && email.includes('@')) {
            sendDreamEmail(email, result.dream);
          }
        }

        // Reset the form after saving
        setDreamText("");
        setAnalysis(null);
        setAttachedPhoto(null);

        // Trigger gallery refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('dreamSaved'));
      } else {
        toast.error(`Failed to save dream: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving dream:', error);

      // More specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error("Cannot connect to server. Please ensure the backend is running on port 3001.");
      } else if (error.name === 'SyntaxError') {
        toast.error("Server returned invalid response. Please check server logs.");
      } else {
        toast.error(`Failed to save dream: ${error.message || 'Please check your connection and try again.'}`);
      }
    }
  };

  const sendDreamEmail = async (email, dream) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/email/send-dream-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          dreamTitle: dream.title,
          dreamContent: dream.content,
          videoUrl: dream.video_url,
          thumbnailUrl: dream.thumbnail_url,
          analysis: dream.analysis
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Dream email sent successfully to ${email}! 📧`);
      } else {
        toast.error(`Failed to send email: ${result.message}`);
      }
    } catch (error) {
      console.error('Email sending error:', error);
      toast.error('Failed to send dream email. Please try again.');
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
      <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="flex items-center gap-3 opacity-80 text-purple-600 dark:text-purple-400">
          <Brain className="w-6 h-6 animate-pulse" />
          Loading...
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <EmailVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerified={() => {
          toast.success('Email verified!');
          setShowVerifyModal(false);
        }}
      />
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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

              {/* Privacy Controls */}
              {userPrivacySettings.allowPrivateDreams && (
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/20">
                  <div className="flex items-center space-x-2">
                    {isPublic ? (
                      <Eye className="w-5 h-5 text-green-500" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-orange-500" />
                    )}
                    <Label htmlFor="privacy-toggle" className="text-sm font-medium">
                      {isPublic ? "Public Dream" : "Private Dream"}
                    </Label>
                  </div>
                  <Switch
                    id="privacy-toggle"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {!userPrivacySettings.allowPrivateDreams 
                  ? "Private dreams are disabled in your privacy settings"
                  : isPublic 
                    ? "This dream will be visible to other users in the gallery" 
                    : "This dream will only be visible to you in your private collection"
                }
              </p>

              <div className="flex gap-3">
                <CosmicButton 
                  onClick={handleAnalyze}
                  disabled={!dreamText.trim() || isAnalyzing}
                  variant="cosmic"
                  className="flex-1 hover:scale-105 transition-transform duration-200 disabled:hover:scale-100"
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
                    <div className="space-y-3">
                      <CosmicButton onClick={handleGenerateVideo} variant="nebula" className="w-full">
                        <Video className="w-5 h-5 mr-2" />
                        {attachedPhoto ? "Generate Video with Your Photo" : "Generate Dream Video"}
                      </CosmicButton>
                      <CosmicButton onClick={handleGenerateVeoVideo} variant="cosmic" className="w-full">
                        <Video className="w-5 h-5 mr-2" />
                        Generate with Gemini (Veo 3)
                      </CosmicButton>
                      
                      <Button 
                        onClick={handleGenerateVariations} 
                        variant="outline" 
                        className="w-full border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Multiple Variations
                      </Button>
                    </div>
                  )}
                  
                  {analysis.videoStatus !== "idle" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="w-4 h-4" />
                        {analysis.videoStatus === "analyzing" && "Analyzing storyline..."}
                        {analysis.videoStatus === "generating" && "Generating video..."}
                        {analysis.videoStatus === "complete" && "Video generation complete!"}
                      </div>
                      <Progress value={isGenerating ? generationProgress : analysis.videoProgress} className="w-full" />
                      
                      {analysis.videoStatus === "complete" && (analysis.generatedVideoUrl || analysis.demoVideoUrl) && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-300/30">
                          <p className="text-center text-foreground font-medium mb-3">
                            🎬 Your Dream Video is Ready!
                          </p>
                          <div className="relative">
                            <video 
                              src={analysis.generatedVideoUrl || analysis.demoVideoUrl}
                              controls
                              className="w-full rounded-lg"
                              poster="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop"
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                          <p className="text-center text-sm text-muted-foreground mt-2">
                            {analysis.generatedVideoUrl 
                              ? "AI-generated video based on your dream content!" 
                              : "Demo video generated! For personalized videos, add RunwayML API key."
                            }
                          </p>
                        </div>
                      )}

                      {/* Veo file ID block */}
                      {analysis.videoStatus === "complete" && analysis.generatedVeoFileId && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-lg border border-indigo-300/30">
                          <p className="text-center text-foreground font-medium mb-2">🎥 Veo Video Created</p>
                          <p className="text-sm text-muted-foreground break-all text-center">
                            File ID: <span className="font-mono">{analysis.generatedVeoFileId}</span>
                          </p>
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            You can save now; the file ID will be stored in analysis for later retrieval.
                          </p>
                        </div>
                      )}

                      {/* Show generated video variations */}
                      {analysis.hasVariations && generatedVideos.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="text-sm font-medium text-foreground">Video Variations:</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {generatedVideos.slice(0, 3).map((video, index) => (
                              <div key={video.id} className="p-3 bg-muted/20 rounded-lg border border-border/20">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Variation {index + 1}</span>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {video.status}
                                  </Badge>
                                </div>
                                {video.status === 'completed' && video.url && (
                                  <video src={video.url} controls className="w-full rounded-md" />
                                )}
                                <div className="flex justify-end mt-2">
                                   <Button size="sm" variant="ghost" onClick={() => {
                                     setAnalysis(prev => prev ? { ...prev, generatedVideoUrl: video.url, videoId: video.id } : null);
                                     toast.success(`Variation ${index + 1} selected!`);
                                   }}>
                                     Select this video
                                   </Button>
                                </div>
                              </div>
                            ))}
                          </div>
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
