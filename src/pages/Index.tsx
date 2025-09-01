import HeroSection from "@/components/HeroSection";
import DreamAnalyzer from "@/components/DreamAnalyzer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <HeroSection />
      <div id="dream-analyzer">
        <DreamAnalyzer />
      </div>
    </div>
  );
};

export default Index;
