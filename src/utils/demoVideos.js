// Demo video URLs for dream analysis
export const DEMO_VIDEOS = [
  // Cosmic and Space Dreams
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  
  // Nature and Adventure Dreams
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  
  // Mystical and Fantasy Dreams
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
];

// Get a random demo video URL
export const getRandomDemoVideo = () => {
  const randomIndex = Math.floor(Math.random() * DEMO_VIDEOS.length);
  return DEMO_VIDEOS[randomIndex];
};

// Get a specific demo video by index (for consistent demo dreams)
export const getDemoVideoByIndex = (index) => {
  const safeIndex = index % DEMO_VIDEOS.length;
  return DEMO_VIDEOS[safeIndex];
};

// Get multiple random videos (for gallery)
export const getRandomDemoVideos = (count = 5) => {
  const shuffled = [...DEMO_VIDEOS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, DEMO_VIDEOS.length));
};
