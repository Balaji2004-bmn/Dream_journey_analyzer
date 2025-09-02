import HeroSection from "@/components/HeroSection";
import DreamAnalyzer from "@/components/DreamAnalyzer";
import DreamJourneyBackground from "@/components/DreamJourneyBackground";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic relative">
      <DreamJourneyBackground />
      <div className="relative z-10">
        <HeroSection />
        <div id="dream-analyzer">
          <DreamAnalyzer />
        </div>
      </div>
    </div>
  );
};

export default Index;
