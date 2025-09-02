import { useEffect, useState } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDelay: number;
}

interface CloudParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export default function DreamJourneyBackground() {
  const [stars, setStars] = useState<Star[]>([]);
  const [clouds, setClouds] = useState<CloudParticle[]>([]);

  useEffect(() => {
    // Create stars
    const initialStars: Star[] = [];
    for (let i = 0; i < 50; i++) {
      initialStars.push({
        id: i,
        x: Math.random() * 100, // percentage
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleDelay: Math.random() * 4
      });
    }
    setStars(initialStars);

    // Create floating dream particles
    const initialClouds: CloudParticle[] = [];
    for (let i = 0; i < 8; i++) {
      initialClouds.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 60 + 40,
        speed: Math.random() * 0.1 + 0.02,
        opacity: Math.random() * 0.1 + 0.05
      });
    }
    setClouds(initialClouds);

    // Animate clouds
    const animateClouds = () => {
      setClouds(prev => prev.map(cloud => ({
        ...cloud,
        x: cloud.x + cloud.speed > 100 ? -10 : cloud.x + cloud.speed
      })));
    };

    const interval = setInterval(animateClouds, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Night sky gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-900 opacity-20" />
      
      {/* Twinkling stars */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute w-1 h-1 bg-white rounded-full animate-gentle-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            opacity: star.opacity,
            transform: `scale(${star.size})`,
            animationDelay: `${star.twinkleDelay}s`,
            animationDuration: '3s'
          }}
        />
      ))}

      {/* Floating dream clouds */}
      {clouds.map(cloud => (
        <div
          key={cloud.id}
          className="absolute rounded-full bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-3xl"
          style={{
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.6}px`,
            opacity: cloud.opacity,
            filter: 'blur(1px)'
          }}
        />
      ))}

      {/* Subtle aurora effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-full h-32 bg-gradient-to-r from-transparent via-primary/5 to-transparent transform -rotate-12 animate-gentle-float opacity-30" />
        <div className="absolute top-1/3 right-0 w-full h-24 bg-gradient-to-r from-transparent via-accent/5 to-transparent transform rotate-12 animate-gentle-float opacity-20" style={{ animationDelay: '2s' }} />
      </div>

      {/* Cosmic dust particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-primary-glow/30 rounded-full animate-gentle-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>
    </div>
  );
}