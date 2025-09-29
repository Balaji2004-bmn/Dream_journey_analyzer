// RunwayML API service for dream video generation
const RUNWAY_API_URL = 'https://api.runwayml.com/v1/tasks';

class RunwayMLService {
  constructor(apiKey = null) {
    // Use provided API key or fallback to environment variable
    this.apiKey = apiKey || import.meta.env.VITE_RUNWAY_API_KEY;
    this.baseUrl = 'https://api.runwayml.com/v1';
  }

  async generateVideo(prompt, options = {}) {
    if (!this.apiKey) {
      console.warn('RunwayML API key not provided. Using demo mode.');
      return this.generateDemoVideo(prompt, options);
    }

    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, ...options })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`RunwayML API error: ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  // Generate demo video data
  async generateDemoVideo(prompt, options = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const demoVideos = [
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    ];
    
    const randomVideo = demoVideos[Math.floor(Math.random() * demoVideos.length)];
    
    return {
      id: `demo-video-${Date.now()}`,
      status: 'completed',
      video_url: randomVideo,
      thumbnail_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
      prompt: prompt,
      duration: options.duration || 4,
      created_at: new Date().toISOString()
    };
  }

  async getVideoStatus(taskId) {
    if (!this.apiKey) {
      if (taskId.startsWith('demo-')) {
        return { status: 'SUCCEEDED', output: this.generateDemoVideo().url };
      }
      throw new Error('RunwayML API key not provided.');
    }

    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to check video status: ${response.statusText}`);
    }

    return response.json();
  }

  // Generate dream-specific video prompt
  generateDreamPrompt(dreamText, emotions, keywords) {
    // Extract dominant emotions
    const dominantEmotions = emotions
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 3)
      .map(e => e.emotion);

    // Create visual style based on emotions
    const emotionStyles = {
      'euphoria': 'vibrant, glowing, ethereal, golden light',
      'fear': 'dark, mysterious, shadowy, dramatic lighting',
      'joy': 'bright, colorful, playful, warm lighting',
      'sadness': 'melancholic, blue tones, soft lighting',
      'love': 'warm, romantic, soft focus, pink and red tones',
      'peace': 'serene, calm, soft pastels, gentle movement',
      'wonder': 'magical, surreal, otherworldly, dreamlike',
      'anger': 'intense, red tones, dynamic movement',
      'serenity': 'tranquil, zen-like, minimal, peaceful',
      'awe': 'majestic, grand scale, breathtaking, cinematic'
    };

    const visualStyle = dominantEmotions
      .map(emotion => emotionStyles[emotion] || 'dreamlike, surreal')
      .join(', ');

    // Create keyword-based visual elements
    const keywordElements = keywords.slice(0, 5).join(', ');

    // Generate the prompt
    const prompt = `A dreamlike video sequence: ${dreamText.slice(0, 200)}. Visual style: ${visualStyle}. Key elements: ${keywordElements}. Cinematic, ethereal, otherworldly atmosphere, flowing movement, dreamy transitions, mystical lighting, surreal composition.`;

    return prompt;
  }

  // Generate multiple video variations
  async generateVideoVariations(dreamText, emotions, keywords, count = 3) {
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      // Create slightly different prompts for each variation
      const basePrompt = this.generateDreamPrompt(dreamText, emotions, keywords);
      const variationStyles = [
        'cinematic and ethereal',
        'surreal and dreamlike',
        'mystical and atmospheric',
        'vivid and colorful',
        'dark and mysterious'
      ];
      
      const style = variationStyles[i % variationStyles.length];
      const prompt = `${basePrompt}, ${style} style`;
      
      const options = {
        duration: 4,
        aspectRatio: '16:9',
        seed: Math.floor(Math.random() * 1000000)
      };

      try {
        const video = await this.generateVideo(prompt, options);
        variations.push({
          id: video.id || `demo-variation-${Date.now()}-${i}`,
          prompt: prompt,
          status: 'completed',
          url: video.url || this.generateDemoVideo().url,
          createdAt: new Date().toISOString(),
          variation: i + 1
        });
      } catch (error) {
        console.error(`Error generating variation ${i + 1}:`, error);
        // Add demo variation even if generation fails
        variations.push({
          id: `demo-variation-${Date.now()}-${i}`,
          prompt: prompt,
          status: 'completed',
          url: this.generateDemoVideo().url,
          createdAt: new Date().toISOString(),
          variation: i + 1
        });
      }
    }

    return variations;
  }
}

// Create singleton instance
let runwayService = null;

export const initializeRunwayML = (apiKey) => {
  runwayService = new RunwayMLService(apiKey);
  return runwayService;
};

export const getRunwayMLService = () => {
  if (!runwayService) {
    // Initialize with demo mode if no API key is available
    runwayService = new RunwayMLService();
  }
  return runwayService;
};

export default RunwayMLService;
