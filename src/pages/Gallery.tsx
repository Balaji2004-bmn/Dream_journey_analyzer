import { useState } from "react";
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
  Star
} from "lucide-react";

interface DreamVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  createdAt: string;
  tags: string[];
  views: number;
  likes: number;
  description: string;
  isLiked: boolean;
}

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock data for dream videos
  const dreamVideos: DreamVideo[] = [
    {
      id: "1",
      title: "Flying Over Ocean Dreams",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      duration: "2:34",
      createdAt: "2 days ago",
      tags: ["flying", "ocean", "freedom"],
      views: 245,
      likes: 18,
      description: "A breathtaking journey through endless blue skies and crystal waters",
      isLiked: true
    },
    {
      id: "2", 
      title: "Mystical Forest Adventure",
      thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop",
      duration: "3:12",
      createdAt: "5 days ago",
      tags: ["forest", "mystery", "adventure"],
      views: 189,
      likes: 24,
      description: "Walking through an enchanted forest filled with magical creatures",
      isLiked: false
    },
    {
      id: "3",
      title: "Cosmic Journey to Stars",
      thumbnail: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop",
      duration: "4:05",
      createdAt: "1 week ago", 
      tags: ["space", "stars", "cosmic"],
      views: 312,
      likes: 42,
      description: "Traveling through galaxies and dancing among the stars",
      isLiked: true
    },
    {
      id: "4",
      title: "Underwater Palace Dreams",
      thumbnail: "https://images.unsplash.com/photo-1559827260-dc66d2c9cd16?w=400&h=300&fit=crop",
      duration: "2:58",
      createdAt: "1 week ago",
      tags: ["underwater", "palace", "mystery"],
      views: 156,
      likes: 15,
      description: "Exploring magnificent underwater kingdoms and coral cities",
      isLiked: false
    },
    {
      id: "5",
      title: "Mountain Peak Ascension",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      duration: "3:45",
      createdAt: "2 weeks ago",
      tags: ["mountains", "adventure", "achievement"],
      views: 278,
      likes: 31,
      description: "Climbing to the highest peaks and touching the clouds",
      isLiked: true
    },
    {
      id: "6",
      title: "Time Travel Paradox",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      duration: "5:22",
      createdAt: "3 weeks ago",
      tags: ["time", "paradox", "surreal"],
      views: 423,
      likes: 56,
      description: "Moving through different time periods in a single dream",
      isLiked: false
    }
  ];

  const filterOptions = [
    { value: "all", label: "All Dreams" },
    { value: "recent", label: "Recent" },
    { value: "popular", label: "Most Popular" },
    { value: "liked", label: "Liked" }
  ];

  const filteredVideos = dreamVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "liked" && video.isLiked) ||
                         (selectedFilter === "popular" && video.views > 200) ||
                         (selectedFilter === "recent" && video.createdAt.includes("days"));
    
    return matchesSearch && matchesFilter;
  });

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <DreamCard key={video.id} className="group cursor-pointer hover:scale-105 transition-all duration-300">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center">
                    <Button size="icon" variant="cosmic" className="w-12 h-12">
                      <Play className="w-6 h-6" />
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                
                <DreamCardHeader>
                  <DreamCardTitle className="text-lg line-clamp-2">
                    {video.title}
                  </DreamCardTitle>
                </DreamCardHeader>
                
                <DreamCardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {video.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {video.tags.map((tag) => (
                      <Badge key={tag} variant="cosmic" className="text-xs">
                        {tag}
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
                      {video.createdAt}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </DreamCardContent>
              </DreamCard>
            ))}
          </div>

          {filteredVideos.length === 0 && (
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