import HeroSection from "@/components/HeroSection";
import DreamAnalyzer from "@/components/DreamAnalyzer";
import DreamJourneyBackground from "@/components/DreamJourneyBackground";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card dark:from-gray-900 dark:to-gray-800 relative">
      <DreamJourneyBackground />
      <div className="relative z-10">
        <HeroSection />
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div id="dream-analyzer">
            <DreamAnalyzer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

