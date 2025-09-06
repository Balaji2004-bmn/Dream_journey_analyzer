import { useState, useEffect } from "react";
import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from "@/components/ui/dream-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Play, 
  Heart, 
  Share2, 
  Download,
  Clock,
  Eye,
  Star,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Loader2,
  Sparkles,
  Moon,
  Zap,
  Brain
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DreamVideo {
  id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  content: string;
  created_at: string;
  analysis: any;
  views?: number;
  likes?: number;
  isLiked?: boolean;
  isPlaying?: boolean;
}

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [dreamVideos, setDreamVideos] = useState<DreamVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchDreamVideos();
  }, []);

  const fetchDreamVideos = async () => {
    try {
      // Fetch both demo dreams and user dreams
      const [demoDreamsResult, userDreamsResult] = await Promise.all([
        supabase.from('demo_dreams').select('*').order('created_at', { ascending: false }),
        supabase.from('dreams').select('*').eq('is_public', true).order('created_at', { ascending: false })
      ]);

      if (demoDreamsResult.error) throw demoDreamsResult.error;

      const demoVideos: DreamVideo[] = demoDreamsResult.data?.map(dream => ({
        id: dream.id,
        title: dream.title,
        thumbnail_url: dream.thumbnail_url,
        video_url: dream.video_url,
        content: dream.content,
        created_at: new Date(dream.created_at).toLocaleDateString(),
        analysis: dream.analysis,
        views: Math.floor(Math.random() * 500) + 50,
        likes: Math.floor(Math.random() * 50) + 5,
        isLiked: Math.random() > 0.5,
        isPlaying: false
      })) || [];

      const userVideos: DreamVideo[] = userDreamsResult.data?.map(dream => ({
        id: dream.id,
        title: dream.title,
        thumbnail_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
        video_url: dream.video_url || '#',
        content: dream.content,
        created_at: new Date(dream.created_at).toLocaleDateString(),
        analysis: dream.analysis,
        views: Math.floor(Math.random() * 100) + 10,
        likes: Math.floor(Math.random() * 20) + 2,
        isLiked: false,
        isPlaying: false
      })) || [];

      // Combine and sort all videos
      const allVideos = [...demoVideos, ...userVideos].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setDreamVideos(allVideos);
    } catch (error) {
      console.error('Error fetching dreams:', error);
      toast.error("Failed to load dream videos");
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { value: "all", label: "All Dreams", icon: Star, color: "text-yellow-400" },
    { value: "recent", label: "Recent", icon: Clock, color: "text-cyan-400" },
    { value: "popular", label: "Most Popular", icon: Heart, color: "text-pink-400" },
    { value: "liked", label: "Liked", icon: Heart, color: "text-red-400" }
  ];

  const getKeywordsFromAnalysis = (analysis: any): string[] => {
    return analysis?.keywords || [];
  };

  const filteredVideos = dreamVideos.filter(video => {
    const keywords = getKeywordsFromAnalysis(video.analysis);
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "liked" && video.isLiked) ||
                         (selectedFilter === "popular" && video.views && video.views > 200) ||
                         (selectedFilter === "recent" && new Date(video.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesFilter;
  });

  const handleVideoPlay = (videoId: string) => {
    setDreamVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, isPlaying: !video.isPlaying }
        : { ...video, isPlaying: false }
    ));
    
    const video = dreamVideos.find(v => v.id === videoId);
    if (video && video.video_url) {
      window.open(video.video_url, '_blank');
    }
    
    toast.success("Playing dream video!");
  };

  const handleDownload = (video: DreamVideo) => {
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

  const handleShare = async (video: DreamVideo) => {
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

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-cosmic">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-dream bg-clip-text text-transparent">
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
                  onClick={() => setSelectedFilter(option.value)}
                  className={`flex items-center gap-2 ${
                    selectedFilter === option.value 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : `border-purple-300/30 ${option.color} hover:bg-purple-500/10`
                  }`}
                >
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </Button>
              ))}
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
                      onClick={() => handleVideoPlay(video.id)}
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
                      <span className="flex items-center gap-1">
                        <Heart className={`w-3 h-3 ${video.isLiked ? 'fill-red-500 text-red-500' : 'text-pink-400'}`} />
                        <span className={video.isLiked ? 'text-red-400' : 'text-pink-400'}>{video.likes}</span>
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-violet-400">
                      <Clock className="w-3 h-3" />
                      {video.created_at}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleVideoPlay(video.id)}
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleShare(video)}
                      className="px-3 border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownload(video)}
                      className="px-3 border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </DreamCardContent>
              </DreamCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}