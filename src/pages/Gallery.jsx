import { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from "@/components/ui/dream-card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Play, Heart, Share2, Download, Trash2, Search, Filter, Eye, Clock, Mail, Lock, Shield, Sparkles, Moon, Loader2, Brain, Pause, Star, EyeOff, Zap, Key, AlertTriangle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import EmailVerificationModal from '@/components/EmailVerificationModal';
import { toast } from "sonner";
import { getRandomDemoVideo } from "@/utils/demoVideos";

// TypeScript interface removed - using plain JavaScript objects

export default function Gallery() {
  const { user, session, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [dreamVideos, setDreamVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [hasPrivateAccess, setHasPrivateAccess] = useState(false);
  const [showSecurityCodeModal, setShowSecurityCodeModal] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [privateAccessExpires, setPrivateAccessExpires] = useState(null);

  useEffect(() => {
    fetchDreamVideos();

    // Listen for dream saved events to refresh the gallery
    const handleDreamSaved = () => {
      fetchDreamVideos();
    };

    window.addEventListener('dreamSaved', handleDreamSaved);

    return () => {
      window.removeEventListener('dreamSaved', handleDreamSaved);
    };
  }, []);

  useEffect(() => {
    if (user) {
      setIsEmailVerified(user.email_confirmed_at !== null);
      checkPrivateAccess();
    }
  }, [user, session]);

  const checkPrivateAccess = async () => {
    if (!user || !session) return;

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/email/private-dream-access`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHasPrivateAccess(data.hasAccess);
        if (data.expiresAt) {
          setPrivateAccessExpires(new Date(data.expiresAt));
        }
      }
    } catch (error) {
      console.error('Error checking private access:', error);
    }
  };

  const requestSecurityCode = async () => {
    if (!user || !session) {
      toast.error("Please sign in to request access to private dreams");
      return;
    }

    setIsRequestingCode(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/email/send-private-dream-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        if (data.demo) {
          // In demo mode, show the code
          toast.info(`Demo Code: ${data.code}`, { duration: 10000 });
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send security code");
      }
    } catch (error) {
      console.error('Error requesting security code:', error);
      toast.error("Failed to send security code. Please try again.");
    } finally {
      setIsRequestingCode(false);
    }
  };

  const verifySecurityCode = async () => {
    if (!securityCode.trim()) {
      toast.error("Please enter the security code");
      return;
    }

    setIsVerifyingCode(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/email/verify-private-dream-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ code: securityCode.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setHasPrivateAccess(true);
        setPrivateAccessExpires(new Date(Date.now() + (data.expiresIn * 1000)));
        setShowSecurityCodeModal(false);
        setSecurityCode("");
        // Refresh dreams to show private ones
        fetchDreamVideos();
      } else {
        const error = await response.json();
        toast.error(error.message || "Invalid security code");
      }
    } catch (error) {
      console.error('Error verifying security code:', error);
      toast.error("Failed to verify security code. Please try again.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const fetchDreamVideos = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

      // Fetch public dreams
      const publicResponse = await fetch(`${backendUrl}/api/dreams/public/gallery`);
      let allDreams = [];

      if (publicResponse.ok) {
        const publicResult = await publicResponse.json();
        if (publicResult.success && Array.isArray(publicResult.dreams)) {
          allDreams = publicResult.dreams;
        }
      }

      // If user is logged in, also fetch their own dreams (both public and private)
      if (user && session) {
        try {
          const userResponse = await fetch(`${backendUrl}/api/dreams`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });

          if (userResponse.ok) {
            const userResult = await userResponse.json();
            if (userResult.success && Array.isArray(userResult.dreams)) {
              // Merge user dreams with public dreams, avoiding duplicates
              const userDreamIds = new Set(userResult.dreams.map(d => d.id));
              const uniquePublicDreams = allDreams.filter(d => !userDreamIds.has(d.id));
              allDreams = [...uniquePublicDreams, ...userResult.dreams];
            }
          }
        } catch (userError) {
          console.warn('Failed to fetch user dreams:', userError);
          // Continue with just public dreams
        }
      }

      if (allDreams.length > 0) {
        const processedDreams = allDreams.map(dream => ({
          ...dream,
          created_at: new Date(dream.created_at).toLocaleDateString(),
          isOwner: user && (dream.user_id === user.id || dream.user_id === 'demo-user'),
          isLiked: false, // Default value
          isPlaying: false // Default value
        }));
        setDreamVideos(processedDreams);
      }
      
      // Fallback to local demo data if API fails or returns no data
      console.warn('Backend API returned no data, using local fallback data');
      const fallbackDemoVideos = [
          {
            id: 'demo-1',
            title: 'Dancing in Space',
            thumbnail_url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            content: 'I was floating weightlessly in a starry cosmos, dancing with planets and comets. Each movement created colorful ripples through space-time, and I could feel the music of the spheres flowing through my body.',
            created_at: new Date().toLocaleDateString(),
            analysis: {
              keywords: ['space', 'dancing', 'cosmos', 'planets', 'music', 'weightless'],
              emotions: [
                { emotion: 'euphoria', intensity: 96 },
                { emotion: 'freedom', intensity: 91 },
                { emotion: 'cosmic connection', intensity: 87 }
              ]
            },
            views: 342,
            likes: 28,
            isLiked: false,
            isPlaying: false,
            is_public: true,
            isOwner: user && user.id === 'demo-user',
            user_id: 'demo-user'
          },
          {
            id: 'demo-2',
            title: 'Magical Library Adventure',
            thumbnail_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            content: 'I discovered a vast library where books flew around like birds. When I opened one, I was instantly transported into its story - becoming a pirate, then a wizard, then an explorer.',
            created_at: new Date().toLocaleDateString(),
            analysis: {
              keywords: ['library', 'books', 'flying', 'stories', 'portals', 'adventure'],
              emotions: [
                { emotion: 'wonder', intensity: 93 },
                { emotion: 'curiosity', intensity: 89 },
                { emotion: 'excitement', intensity: 85 }
              ]
            },
            views: 287,
            likes: 35,
            isLiked: false,
            isPlaying: false,
            is_public: true,
            isOwner: user && user.id === 'demo-user',
            user_id: 'demo-user'
          },
          {
            id: 'demo-3',
            title: 'Crystal Cave Symphony',
            thumbnail_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            content: 'I found myself in a cave filled with singing crystals. Each crystal produced a different musical note when touched, and together they created the most beautiful symphony I had ever heard.',
            created_at: new Date().toLocaleDateString(),
            analysis: {
              keywords: ['crystals', 'music', 'cave', 'rainbow', 'harmony', 'singing'],
              emotions: [
                { emotion: 'serenity', intensity: 94 },
                { emotion: 'awe', intensity: 88 },
                { emotion: 'harmony', intensity: 86 }
              ]
            },
            views: 198,
            likes: 22,
            isLiked: false,
            isPlaying: false,
            is_public: true,
            isOwner: user && user.id === 'demo-user',
            user_id: 'demo-user'
          },
          {
            id: 'demo-4',
            title: 'Underwater Crystal Palace',
            thumbnail_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            content: 'I discovered a magnificent crystal palace beneath the ocean, with glowing fish swimming around ancient pillars. The water was so clear I could see every detail of the underwater architecture.',
            created_at: new Date(Date.now() - 86400000).toLocaleDateString(),
            analysis: {
              keywords: ['underwater', 'crystal', 'palace', 'ancient', 'ocean', 'fish'],
              emotions: [
                { emotion: 'awe', intensity: 95 },
                { emotion: 'mystery', intensity: 80 },
                { emotion: 'peace', intensity: 88 }
              ]
            },
            views: 156,
            likes: 19,
            isLiked: false,
            isPlaying: false,
            is_public: true,
            isOwner: user && user.id === 'demo-user',
            user_id: 'demo-user'
          },
          {
            id: 'demo-5',
            title: 'Dragon Companion Flight',
            thumbnail_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            content: 'A magnificent dragon with scales that changed colors like an aurora landed beside me. Without fear, I climbed onto its back and we soared through clouds, over mountains, and across oceans.',
            created_at: new Date(Date.now() - 172800000).toLocaleDateString(),
            analysis: {
              keywords: ['dragon', 'flying', 'aurora', 'mountains', 'telepathy', 'companion'],
              emotions: [
                { emotion: 'courage', intensity: 95 },
                { emotion: 'friendship', intensity: 89 },
                { emotion: 'adventure', intensity: 92 }
              ]
            },
            views: 423,
            likes: 41,
            isLiked: false,
            isPlaying: false,
            is_public: true,
            isOwner: user && user.id === 'demo-user',
            user_id: 'demo-user'
          },
          {
            id: 'demo-6',
            title: 'Time Garden Journey',
            thumbnail_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            content: 'I walked through a garden where each flower showed a different moment in time. Past flowers were sepia-toned, present flowers bloomed in vivid colors, and future flowers shimmered with unknown hues.',
            created_at: new Date(Date.now() - 259200000).toLocaleDateString(),
            analysis: {
              keywords: ['garden', 'time', 'flowers', 'past', 'future', 'moments'],
              emotions: [
                { emotion: 'nostalgia', intensity: 90 },
                { emotion: 'contemplation', intensity: 87 },
                { emotion: 'hope', intensity: 84 }
              ]
            },
            views: 234,
            likes: 31,
            isLiked: false,
            isPlaying: false,
            is_public: true,
            isOwner: user && user.id === 'demo-user',
            user_id: 'demo-user'
          },
          {
            id: 'demo-private-1',
            title: 'Secret Moon Garden',
            thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            content: 'I discovered a hidden garden on the moon where silver flowers bloomed under the Earth\'s light. The flowers whispered secrets of the universe to me in a language I somehow understood.',
            created_at: new Date(Date.now() - 345600000).toLocaleDateString(),
            analysis: {
              keywords: ['moon', 'garden', 'secrets', 'silver', 'flowers', 'whispers'],
              emotions: [
                { emotion: 'mystery', intensity: 92 },
                { emotion: 'wonder', intensity: 88 },
                { emotion: 'connection', intensity: 85 }
              ]
            },
            views: 89,
            likes: 12,
            isLiked: false,
            isPlaying: false,
            is_public: false,
            requiresVerification: !isEmailVerified,
            isOwner: user && user.id === 'demo-user',
            user_id: 'demo-user'
          },
          {
            id: 'demo-private-2',
            title: 'Phoenix Rebirth Ceremony',
            thumbnail_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            content: 'I witnessed a phoenix rising from its own ashes in a sacred ceremony. The flames were not hot but warm and comforting, and I felt my own spirit being renewed in the process.',
            created_at: new Date(Date.now() - 432000000).toLocaleDateString(),
            analysis: {
              keywords: ['phoenix', 'rebirth', 'flames', 'sacred', 'ceremony', 'renewal'],
              emotions: [
                { emotion: 'transformation', intensity: 96 },
                { emotion: 'hope', intensity: 91 },
                { emotion: 'renewal', intensity: 88 }
              ]
            },
            views: 67,
            likes: 8,
            isLiked: false,
            isPlaying: false,
            is_public: false,
            requiresVerification: !isEmailVerified,
            isOwner: user && user.id === 'demo-user',
            user_id: 'demo-user'
          }
        ];
        console.log('Setting fallback demo videos:', fallbackDemoVideos);
        setDreamVideos(fallbackDemoVideos);
    } catch (error) {
      console.error('Error fetching dreams:', error);
      toast.error("Failed to load dream videos from server, using demo data");
      
      // Set fallback data even on error - use the same enhanced demo data
      const errorFallbackVideos = [
        {
          id: 'demo-1',
          title: 'Dancing in Space',
          thumbnail_url: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          content: 'I was floating weightlessly in a starry cosmos, dancing with planets and comets. Each movement created colorful ripples through space-time, and I could feel the music of the spheres flowing through my body.',
          created_at: new Date().toLocaleDateString(),
          analysis: {
            keywords: ['space', 'dancing', 'cosmos', 'planets', 'music', 'weightless'],
            emotions: [
              { emotion: 'euphoria', intensity: 96 },
              { emotion: 'freedom', intensity: 91 },
              { emotion: 'cosmic connection', intensity: 87 }
            ]
          },
          views: 342,
          likes: 28,
          isLiked: false,
          isPlaying: false,
          is_public: true
        },
        {
          id: 'demo-2',
          title: 'Magical Library Adventure',
          thumbnail_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          content: 'I discovered a vast library where books flew around like birds. When I opened one, I was instantly transported into its story - becoming a pirate, then a wizard, then an explorer.',
          created_at: new Date().toLocaleDateString(),
          analysis: {
            keywords: ['library', 'books', 'flying', 'stories', 'portals', 'adventure'],
            emotions: [
              { emotion: 'wonder', intensity: 93 },
              { emotion: 'curiosity', intensity: 89 },
              { emotion: 'excitement', intensity: 85 }
            ]
          },
          views: 287,
          likes: 35,
          isLiked: false,
          isPlaying: false,
          is_public: true
        },
        {
          id: 'demo-3',
          title: 'Crystal Cave Symphony',
          thumbnail_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          content: 'I found myself in a cave filled with singing crystals. Each crystal produced a different musical note when touched, and together they created the most beautiful symphony I had ever heard.',
          created_at: new Date().toLocaleDateString(),
          analysis: {
            keywords: ['crystals', 'music', 'cave', 'rainbow', 'harmony', 'singing'],
            emotions: [
              { emotion: 'serenity', intensity: 94 },
              { emotion: 'awe', intensity: 88 },
              { emotion: 'harmony', intensity: 86 }
            ]
          },
          views: 198,
          likes: 22,
          isLiked: false,
          isPlaying: false,
          is_public: true
        }
      ];
      setDreamVideos(errorFallbackVideos);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { value: "all", label: "All Dreams", icon: Star, color: "text-yellow-400" },
    { value: "private", label: hasPrivateAccess ? "My Private Dreams" : "Private Dreams (Locked)", icon: hasPrivateAccess ? EyeOff : Lock, color: hasPrivateAccess ? "text-orange-400" : "text-gray-400" },
    { value: "public", label: "Public Dreams", icon: Eye, color: "text-green-400" },
    { value: "recent", label: "Recent", icon: Clock, color: "text-cyan-400" },
    { value: "popular", label: "Most Popular", icon: Heart, color: "text-pink-400" },
    { value: "liked", label: "Liked", icon: Heart, color: "text-red-400" }
  ];

  const getKeywordsFromAnalysis = (analysis) => {
    return analysis?.keywords || [];
  };

  const filteredVideos = dreamVideos.filter(video => {
    const keywords = getKeywordsFromAnalysis(video.analysis);
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          video.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = selectedFilter === "all" ||
                          (selectedFilter === "private" && video.is_public === false && video.isOwner) ||
                          (selectedFilter === "public" && video.is_public !== false) ||
                          (selectedFilter === "liked" && video.isLiked) ||
                          (selectedFilter === "popular" && video.views && video.views > 200) ||
                          (selectedFilter === "recent" && new Date(video.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Enhanced privacy filter: only show public dreams, user's own dreams, or private dreams if access granted
    const isVisible = video.is_public !== false || video.isOwner || (video.is_public === false && hasPrivateAccess);

    console.log(`Filtering video ${video.id}: search=${matchesSearch}, filter=${matchesFilter}, visible=${isVisible}, hasPrivateAccess=${hasPrivateAccess}`);

    return matchesSearch && matchesFilter && isVisible;
  });
  
  console.log('Total dreamVideos:', dreamVideos.length);
  console.log('Filtered videos:', filteredVideos.length);
  console.log('dreamVideos array:', dreamVideos);
  console.log('filteredVideos array:', filteredVideos);

  const handlePlayVideo = (videoId) => {
    const video = dreamVideos.find(v => v.id === videoId);
    
    // Check if this is a private video that requires verification
    if (video && video.requiresVerification && !video.is_public) {
      setShowVerificationModal(true);
      return;
    }
    
    if (video && video.video_url && video.video_url !== '#') {
      // Create a video modal or embed player instead of opening new tab
      const videoElement = document.createElement('video');
      videoElement.src = video.video_url;
      videoElement.controls = true;
      videoElement.autoplay = true;
      videoElement.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; max-width: 90vw; max-height: 90vh; background: black;';
      
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 9998; display: flex; align-items: center; justify-content: center;';
      
      overlay.onclick = () => {
        document.body.removeChild(overlay);
      };
      
      overlay.appendChild(videoElement);
      document.body.appendChild(overlay);
      
      toast.success("Playing dream video!");
    } else {
      toast.info("Demo video - actual video generation requires API keys");
    }
  };

  const handleVerificationSuccess = () => {
    setIsEmailVerified(true);
    setShowVerificationModal(false);
    // Refresh the videos to remove verification requirements
    fetchDreamVideos();
  };

  const handleDownload = (video) => {
    const dreamData = {
      title: video.title,
      content: video.content,
      analysis: video.analysis,
      created_at: video.created_at
    };
    
    const blob = new Blob([JSON.stringify(dreamData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dream-${video.title.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Dream downloaded successfully!");
  };

  const handleLike = async (video) => {
    if (!user) {
      toast.error("Please sign in to like dreams");
      return;
    }

    try {
      const newLikedState = !video.isLiked;
      
      // Toggle like status locally first for immediate feedback
      setDreamVideos(dreamVideos.map(v => 
        v.id === video.id 
          ? { 
              ...v, 
              isLiked: newLikedState, 
              likes: newLikedState ? v.likes + 1 : v.likes - 1 
            }
          : v
      ));

      // Send to backend (optional - for persistence)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/dreams/${video.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || 'demo-token'}`
        },
        body: JSON.stringify({
          isLiked: newLikedState
        })
      });

      if (response.ok) {
        toast.success(newLikedState ? "Dream liked! ❤️" : "Dream unliked!");
      } else {
        // Revert on server error
        setDreamVideos(dreamVideos.map(v => 
          v.id === video.id 
            ? { 
                ...v, 
                isLiked: video.isLiked, 
                likes: video.likes 
              }
            : v
        ));
        toast.error("Failed to update like status");
      }

    } catch (error) {
      console.error('Like error:', error);
      // Revert the optimistic update on error
      setDreamVideos(dreamVideos.map(v => 
        v.id === video.id 
          ? { 
              ...v, 
              isLiked: video.isLiked, 
              likes: video.likes 
            }
          : v
      ));
      toast.error("Failed to update like status");
    }
  };

  const handleShare = async (video) => {
    const shareData = {
      title: `Dream: ${video.title}`,
      text: video.content.slice(0, 100) + '...',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Dream shared successfully!");
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
        toast.success("Dream link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy to clipboard");
      }
    }
  };

  const handleEmailVideo = async (video) => {
    if (!user) {
      toast.error("Please sign in to email dreams");
      return;
    }

    if (!user.email) {
      toast.error("No email address found in your profile");
      return;
    }

    try {
      toast.info("Sending dream video to your email...");

      // Send email via backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/email/send-dream-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || 'demo-token'}`
        },
        body: JSON.stringify({
          email: user.email,
          dreamTitle: video.title,
          dreamContent: video.content,
          videoUrl: video.video_url,
          thumbnailUrl: video.thumbnail_url,
          analysis: video.analysis
        })
      });

      console.log('Email response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Email error data:', errorData);
        const errorText = errorData.message || errorData.error || 'Failed to send email';
        toast.error(errorText);
        return;
      }

      const responseData = await response.json();
      console.log('Email response data:', responseData);
      toast.success(`Dream video sent to ${user.email}! 📧`);

    } catch (error) {
      console.error('Email error:', error);
      toast.error("Failed to send email. Please try again.");
    }
  };

  const handleDelete = async (video) => {
    if (!user) {
      toast.error("Please sign in to delete dreams");
      return;
    }

    if (!video.isOwner && !video.id.startsWith('demo-') && video.user_id !== user.id) {
      toast.error("You can only delete your own dreams");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${video.title}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      
      // Try backend deletion first
      const response = await fetch(`${backendUrl}/api/dreams/${video.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || 'demo-token'}`
        }
      });

      if (response.ok) {
        // Remove from local state
        setDreamVideos(dreamVideos.filter(v => v.id !== video.id));
        toast.success("Dream deleted successfully!");
        return;
      }

      // Fallback to direct database deletion if backend fails
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      // Try deleting from dreams table first
      let { error } = await supabase
        .from('dreams')
        .delete()
        .eq('id', video.id)
        .eq('user_id', user.id);

      // If dreams table doesn't work, try demo_dreams
      if (error) {
        const { error: demoError } = await supabase
          .from('demo_dreams')
          .delete()
          .eq('id', video.id);

        if (demoError) {
          throw demoError;
        }
      }

      // Remove from local state
      setDreamVideos(dreamVideos.filter(v => v.id !== video.id));
      toast.success("Dream deleted successfully!");

    } catch (error) {
      console.error('Delete error:', error);
      
      // For demo videos, allow local deletion
      if (video.id.startsWith('demo-')) {
        setDreamVideos(dreamVideos.filter(v => v.id !== video.id));
        toast.success("Demo dream removed from view!");
      } else {
        toast.error("Failed to delete dream. Please try again.");
      }
    }
  };

  // Auth guard
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading) {
    return (
      <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="flex items-center gap-3 opacity-80 text-purple-600 dark:text-purple-400">
          <Brain className="w-6 h-6 animate-pulse" />
          Loading gallery...
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Dream Gallery
            </h1>
            <Moon className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-xl text-muted-foreground">
            Explore a collection of beautiful AI-generated dream videos
          </p>
        </div>

        {/* Search and Filter */}
        <DreamCard className="p-6 bg-gradient-to-r from-purple-500/5 to-cyan-500/5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search dreams by title, content, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-purple-300/30 focus:border-purple-400/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedFilter === option.value ? "cosmic" : "outline"}
                  onClick={() => {
                    if (option.value === "private" && !hasPrivateAccess) {
                      setShowSecurityCodeModal(true);
                    } else {
                      setSelectedFilter(option.value);
                    }
                  }}
                  className={`flex items-center gap-2 ${
                    selectedFilter === option.value
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : `border-purple-300/30 ${option.color} hover:bg-purple-500/10`
                  }`}
                  disabled={option.value === "private" && !hasPrivateAccess && selectedFilter !== "private"}
                >
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </Button>
              ))}

              {/* Private Dream Access Button */}
              {user && (
                <Button
                  variant={hasPrivateAccess ? "default" : "outline"}
                  onClick={() => {
                    if (hasPrivateAccess) {
                      toast.success("You already have access to private dreams");
                    } else {
                      setShowSecurityCodeModal(true);
                    }
                  }}
                  className={`flex items-center gap-2 ${
                    hasPrivateAccess
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'border-orange-400/30 text-orange-600 hover:bg-orange-500/10'
                  }`}
                >
                  {hasPrivateAccess ? (
                    <>
                      <Shield className="w-4 h-4" />
                      Private Access Granted
                      {privateAccessExpires && (
                        <span className="text-xs ml-1">
                          ({Math.max(0, Math.floor((privateAccessExpires - new Date()) / (1000 * 60)))}m left)
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Unlock Private Dreams
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DreamCard>

        {/* Videos Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <Brain className="w-6 h-6 text-purple-400" />
              Loading dream collection...
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <Moon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No dreams found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <DreamCard key={video.id} className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5">
                {/* Thumbnail */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={video.thumbnail_url} 
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => handlePlayVideo(video.id)}
                      size="lg"
                      className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    >
                      {video.isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Dream Video
                  </div>
                  {video.is_public === false && video.isOwner && (
                    <div className="absolute top-2 left-2 bg-orange-500/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Private
                    </div>
                  )}
                </div>
                
                <DreamCardHeader>
                  <DreamCardTitle className="text-lg line-clamp-2 text-foreground">
                    {video.title}
                  </DreamCardTitle>
                </DreamCardHeader>
                
                <DreamCardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {video.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {getKeywordsFromAnalysis(video.analysis).map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-300/30">
                        <Zap className="w-3 h-3 mr-1 text-purple-400" />
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Eye className="w-3 h-3" />
                        {video.views}
                      </span>
                      <button 
                        onClick={() => handleLike(video)}
                        className="flex items-center gap-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Heart className={`w-3 h-3 ${video.isLiked ? 'fill-red-500 text-red-500' : 'text-pink-400 hover:text-red-400'}`} />
                        <span className={video.isLiked ? 'text-red-400' : 'text-pink-400'}>{video.likes}</span>
                      </button>
                    </div>
                    <span className="flex items-center gap-1 text-violet-400">
                      <Clock className="w-3 h-3" />
                      {video.created_at}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      onClick={() => handlePlayVideo(video.id)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {video.isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                    {video.isOwner && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEmailVideo(video)}
                        className="px-3 border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
                        title="Send to Email"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleShare(video)}
                      className="px-3 border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownload(video)}
                      className="px-3 border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {video.isOwner && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(video)}
                        className="px-3 border-red-400/30 text-red-400 hover:bg-red-400/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    {video.requiresVerification && !video.is_public && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowVerificationModal(true)}
                        className="px-3 border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                        title="Verify Email to Access"
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </DreamCardContent>
              </DreamCard>
            ))}
          </div>
        )}

        {/* Security Code Modal for Private Dream Access */}
        <Dialog open={showSecurityCodeModal} onOpenChange={setShowSecurityCodeModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                Private Dream Access
              </DialogTitle>
              <DialogDescription>
                Enter the security code sent to your email to access private dreams.
                This code expires in 15 minutes and can only be used once.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="security-code" className="text-sm font-medium">
                  Security Code
                </label>
                <Input
                  id="security-code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={requestSecurityCode}
                  variant="outline"
                  disabled={isRequestingCode}
                  className="flex-1"
                >
                  {isRequestingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Code
                    </>
                  )}
                </Button>
                <Button
                  onClick={verifySecurityCode}
                  disabled={isVerifyingCode || securityCode.length !== 6}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {isVerifyingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Verify
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                For your security, codes expire quickly and can only be used once.
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <EmailVerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onVerified={handleVerificationSuccess}
        />
      </div>
    </div>
  );
}
