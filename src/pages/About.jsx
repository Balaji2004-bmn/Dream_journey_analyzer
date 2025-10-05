import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from "@/components/ui/dream-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain,
  Video,
  Sparkles,
  Heart,
  Users,
  Zap,
  Target,
  Shield,
  Globe,
  Code,
  Database,
  Palette,
  Moon,
  Star,
  Rocket,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Dream Analysis",
      description: "Advanced NLP algorithms analyze your dreams to extract emotions, keywords, and hidden meanings.",
      color: "text-primary"
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Video Generation",
      description: "Transform your dreams into stunning visual stories with AI-powered video creation.",
      color: "text-highlight"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Emotion Detection",
      description: "Identify and track emotional patterns in your dreams for deeper self-understanding.",
      color: "text-accent"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Pattern Recognition",
      description: "Discover recurring themes and symbols in your dream journey over time.",
      color: "text-primary"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Dream Gallery",
      description: "Share your dream videos with the community and explore others' dream experiences.",
      color: "text-highlight"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Your dreams are personal. We ensure complete privacy and security of your data.",
      color: "text-accent"
    }
  ];

  const techStack = [
    { name: "React", icon: <Code className="w-5 h-5 text-primary" />, description: "Modern UI framework" },
    { name: "JavaScript", icon: <Zap className="w-5 h-5 text-highlight" />, description: "Type-safe development" },
    { name: "Supabase", icon: <Database className="w-5 h-5 text-accent" />, description: "Backend & Authentication" },
    { name: "Tailwind CSS", icon: <Palette className="w-5 h-5 text-primary" />, description: "Beautiful styling" },
    { name: "Python NLP", icon: <Brain className="w-5 h-5 text-highlight" />, description: "AI dream analysis" },
    { name: "Vite", icon: <Rocket className="w-5 h-5 text-accent" />, description: "Fast development" }
  ];

  const stats = [
    { number: "10K+", label: "Dreams Analyzed", icon: <Brain className="w-5 h-5 text-primary" /> },
    { number: "5K+", label: "Videos Generated", icon: <Video className="w-5 h-5 text-highlight" /> },
    { number: "2K+", label: "Active Users", icon: <Users className="w-5 h-5 text-accent" /> },
    { number: "95%", label: "Accuracy Rate", icon: <Target className="w-5 h-5 text-primary" /> }
  ];

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-background to-card dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Moon className="w-10 h-10 text-highlight animate-gentle-float" />
            <h1 className="text-5xl md:text-6xl font-bold text-highlight">
              About Dream Journey Analyzer
            </h1>
            <Star className="w-10 h-10 text-highlight animate-gentle-pulse" />
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Unlock the mysteries of your subconscious mind with cutting-edge AI technology. 
            Transform your dreams into beautiful visual stories and discover the hidden patterns in your sleep.
          </p>
        </div>

        {/* Mission Statement */}
        <DreamCard className="p-8 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-cyan-500/10">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-highlight" />
              <h2 className="text-3xl font-bold text-highlight">
                Our Mission
              </h2>
              <Sparkles className="w-8 h-8 text-highlight" />
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We believe dreams are windows to our inner world. Our mission is to make dream analysis accessible, 
              insightful, and visually stunning through the power of artificial intelligence. Every dream tells a story, 
              and we're here to help you discover yours.
            </p>
          </div>
        </DreamCard>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <DreamCard key={index} className="p-6 text-center">
              <div className="space-y-2">
                <div className="flex items-center justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </DreamCard>
          ))}
        </div>

        {/* Features */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-highlight mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to explore and understand your dreams
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <DreamCard key={index} className="p-6 hover:scale-105 transition-all duration-300">
                <DreamCardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`${feature.color}`}>
                      {feature.icon}
                    </div>
                    <DreamCardTitle className="text-lg">{feature.title}</DreamCardTitle>
                  </div>
                </DreamCardHeader>
                <DreamCardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </DreamCardContent>
              </DreamCard>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <DreamCard className="p-8">
          <DreamCardHeader>
            <div className="text-center mb-6">
              <DreamCardTitle className="text-3xl font-bold text-highlight mb-4">
                Built with Modern Technology
              </DreamCardTitle>
              <p className="text-muted-foreground">
                Powered by cutting-edge tools and frameworks for the best user experience
              </p>
            </div>
          </DreamCardHeader>
          <DreamCardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {techStack.map((tech, index) => (
                <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div>
                    {tech.icon}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{tech.name}</div>
                    <div className="text-xs text-muted-foreground">{tech.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </DreamCardContent>
        </DreamCard>

        {/* How It Works */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-highlight mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple steps to transform your dreams into visual stories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DreamCard className="p-6 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-dream rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold">Share Your Dream</h3>
                <p className="text-muted-foreground">
                  Write down your dream in detail. Include emotions, characters, and settings.
                </p>
              </div>
            </DreamCard>

            <DreamCard className="p-6 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-nebula rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes emotions, extracts keywords, and identifies patterns in your dream.
                </p>
              </div>
            </DreamCard>

            <DreamCard className="p-6 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-cosmic rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold">Visual Story</h3>
                <p className="text-muted-foreground">
                  Watch your dream come to life as a beautiful AI-generated video story.
                </p>
              </div>
            </DreamCard>
          </div>
        </div>

        {/* Call to Action */}
        <DreamCard className="p-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-highlight">
              Ready to Explore Your Dreams?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of dreamers who have discovered the hidden meanings in their sleep. 
              Start your dream journey today and unlock the mysteries of your subconscious mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="cosmic" 
                size="lg"
                onClick={() => navigate('/')}
                className="text-lg px-8"
              >
                Start Dream Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/gallery')}
                className="text-lg px-8"
              >
                <Globe className="w-5 h-5 mr-2" />
                Explore Gallery
              </Button>
            </div>
          </div>
        </DreamCard>
      </div>
    </div>
  );
}

