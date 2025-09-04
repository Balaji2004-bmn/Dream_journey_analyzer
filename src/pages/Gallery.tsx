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
  Loader2
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
      const { data, error } = await supabase
        .from('demo_dreams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const videos: DreamVideo[] = data?.map(dream => ({
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

      setDreamVideos(videos);
    } catch (error) {
      console.error('Error fetching dreams:', error);
      toast.error("Failed to load dream videos");
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { value: "all", label: "All Dreams" },
    { value: "recent", label: "Recent" },
    { value: "popular", label: "Most Popular" },
    { value: "liked", label: "Liked" }
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
                         (selectedFilter === "popular" && (video.views || 0) > 200) ||
                         (selectedFilter === "recent" && video.created_at.includes("2025"));
    
    return matchesSearch && matchesFilter;
  });

  const handleVideoPlay = (videoId: string, videoUrl: string) => {
    if (playingVideo === videoId) {
      setPlayingVideo(null);
    } else {
      setPlayingVideo(videoId);
      // For Vimeo URLs, we'll open in a modal or new tab for now
      window.open(videoUrl, '_blank');
    }
  };

  const handleDownload = async (video: DreamVideo) => {
    try {
      const response = await fetch(video.video_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${video.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Dream video download started!");
    } catch (error) {
      toast.error("Download failed. Opening video in new tab...");
      window.open(video.video_url, '_blank');
    }
  };

  const handleShare = async (video: DreamVideo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.content,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${video.title}: ${video.content}`);
        toast.success("Dream content copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(`${video.title}: ${video.content}`);
      toast.success("Dream content copied to clipboard!");
    }
  };

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-cosmic">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-dream bg-clip-text text-transparent">
              Dream Gallery
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore your collection of AI-generated dream videos and discover stories from your subconscious
            </p>
          </div>

          {/* Search and Filter */}
          <DreamCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search dreams by title or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input/50 border-border/30"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <div className="flex gap-2">
                  {filterOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedFilter === option.value ? "cosmic" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedFilter(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DreamCard>

          {/* Video Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-glow" />
              <span className="ml-2 text-muted-foreground">Loading dream videos...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <DreamCard key={video.id} className="group transition-all duration-300 hover:shadow-glow-primary">
                  <div className="relative">
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center">
                      <Button 
                        size="icon" 
                        variant="cosmic" 
                        className="w-12 h-12"
                        onClick={() => handleVideoPlay(video.id, video.video_url)}
                      >
                        {playingVideo === video.id ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      Dream Video
                    </div>
                  </div>
                  
                  <DreamCardHeader>
                    <DreamCardTitle className="text-lg line-clamp-2">
                      {video.title}
                    </DreamCardTitle>
                  </DreamCardHeader>
                  
                  <DreamCardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {video.content}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {getKeywordsFromAnalysis(video.analysis).map((keyword) => (
                        <Badge key={keyword} variant="cosmic" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className={`w-3 h-3 ${video.isLiked ? 'fill-accent text-accent' : ''}`} />
                          {video.likes}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.created_at}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleShare(video)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDownload(video)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </DreamCardContent>
                </DreamCard>
              ))}
            </div>
          )}

          {filteredVideos.length === 0 && !loading && (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No dreams found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms" : "Start creating some dream videos to see them here"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}