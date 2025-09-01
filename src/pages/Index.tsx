import HeroSection from "@/components/HeroSection";
import DreamAnalyzer from "@/components/DreamAnalyzer";
import InteractiveBackground from "@/components/InteractiveBackground";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic relative">
      <InteractiveBackground />
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
