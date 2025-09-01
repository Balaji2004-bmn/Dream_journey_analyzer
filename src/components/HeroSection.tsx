import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Video } from "lucide-react";
import cosmicHero from "@/assets/cosmic-hero.jpg";

export default function HeroSection() {
  const scrollToAnalyzer = () => {
    const analyzer = document.getElementById('dream-analyzer');
    if (analyzer) {
      analyzer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${cosmicHero})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-cosmic opacity-80" />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="space-y-8 animate-float">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-dream bg-clip-text text-transparent">
              Dream Journey
            </h1>
            <h2 className="text-3xl md:text-5xl font-semibold bg-gradient-nebula bg-clip-text text-transparent">
              Analyzer
            </h2>
          </div>
          
          <p className="text-xl md:text-2xl text-foreground/90 max-w-2xl mx-auto leading-relaxed">
            Transform your dreams into vivid stories and stunning AI-generated videos. 
            Discover the hidden meanings and emotions within your subconscious mind.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 border border-border/20">
              <Brain className="w-4 h-4" />
              NLP Analysis
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 border border-border/20">
              <Sparkles className="w-4 h-4" />
              Emotion Detection
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 border border-border/20">
              <Video className="w-4 h-4" />
              AI Video Generation
            </div>
          </div>
          
          <div className="pt-8">
            <Button 
              onClick={scrollToAnalyzer}
              variant="cosmic" 
              size="lg"
              className="text-lg px-8 py-6 h-auto animate-pulse-glow"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Start Your Dream Journey
            </Button>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary-glow rounded-full animate-float opacity-60" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-3 h-3 bg-accent rounded-full animate-float opacity-70" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-20 w-5 h-5 bg-secondary rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-primary-glow rounded-full animate-float opacity-80" style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  );
}