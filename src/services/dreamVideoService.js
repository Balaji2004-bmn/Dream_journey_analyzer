import { apiClient } from '@/utils/apiClient';

class DreamVideoService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL || 'https://dream-journey-backend.onrender.com/api';
  }

  /**
   * Create a dream with video generation
   */
  async createDreamWithVideo(dreamData) {
    try {
      const response = await apiClient.post('/dreams/with-video', {
        title: dreamData.title,
        content: dreamData.content,
        analysis: dreamData.analysis,
        generateVideo: dreamData.generateVideo || false,
        is_public: dreamData.is_public || false,
        user_id: dreamData.user_id
      });

      return response.data;
    } catch (error) {
      console.error('Error creating dream with video:', error);
      throw new Error(error.response?.data?.message || 'Failed to create dream with video');
    }
  }

  /**
   * Generate video for existing dream
   */
  async generateVideoForDream(dreamId, dreamText, emotions, keywords) {
    try {
      const response = await apiClient.post('/ai/generate-video', {
        dreamId,
        dreamText,
        emotions,
        keywords
      });

      return response.data;
    } catch (error) {
      console.error('Error generating video:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate video');
    }
  }

  /**
   * Store video data for a dream
   */
  async storeVideoForDream(dreamId, videoData) {
    try {
      const response = await apiClient.post('/ai/store-video', {
        dreamId,
        videoUrl: videoData.url,
        thumbnailUrl: videoData.thumbnail_url,
        prompt: videoData.prompt,
        duration: videoData.duration || 4
      });

      return response.data;
    } catch (error) {
      console.error('Error storing video:', error);
      throw new Error(error.response?.data?.message || 'Failed to store video');
    }
  }

  /**
   * Update dream with video data
   */
  async updateDreamWithVideo(dreamId, videoData) {
    try {
      const response = await apiClient.put(`/dreams/${dreamId}`, {
        video_url: videoData.url,
        thumbnail_url: videoData.thumbnail_url,
        video_prompt: videoData.prompt,
        video_duration: videoData.duration || 4
      });

      return response.data;
    } catch (error) {
      console.error('Error updating dream with video:', error);
      throw new Error(error.response?.data?.message || 'Failed to update dream with video');
    }
  }

  /**
   * Create dream and generate video in one flow
   */
  async createDreamAndGenerateVideo(dreamData) {
    try {
      // First create the dream
      const dreamResponse = await this.createDreamWithVideo({
        ...dreamData,
        generateVideo: false // Don't auto-generate yet
      });

      const dream = dreamResponse.dream;

      // Then generate video if requested
      if (dreamData.generateVideo) {
        const videoResponse = await this.generateVideoForDream(
          dream.id,
          dreamData.content,
          dreamData.analysis?.emotions,
          dreamData.analysis?.keywords
        );

        // Update the dream with video data
        if (videoResponse.video) {
          await this.updateDreamWithVideo(dream.id, videoResponse.video);
          dream.video_url = videoResponse.video.url;
          dream.thumbnail_url = videoResponse.video.thumbnail_url;
          dream.video_prompt = videoResponse.video.prompt;
          dream.video_duration = videoResponse.video.duration;
        }

        return {
          success: true,
          dream,
          video: videoResponse.video,
          message: 'Dream created and video generated successfully'
        };
      }

      return dreamResponse;
    } catch (error) {
      console.error('Error in complete dream creation flow:', error);
      throw error;
    }
  }

  /**
   * Handle video generation from frontend RunwayML service
   */
  async handleFrontendVideoGeneration(dreamId, generatedVideo) {
    try {
      // Store the video data generated from frontend
      const storeResponse = await this.storeVideoForDream(dreamId, generatedVideo);
      
      // Update the dream with video data
      const updateResponse = await this.updateDreamWithVideo(dreamId, generatedVideo);

      return {
        success: true,
        stored: storeResponse,
        updated: updateResponse,
        message: 'Frontend generated video stored successfully'
      };
    } catch (error) {
      console.error('Error handling frontend video generation:', error);
      throw error;
    }
  }

  /**
   * Get dreams with video data
   */
  async getDreamsWithVideos(params = {}) {
    try {
      const response = await apiClient.get('/dreams', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching dreams with videos:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch dreams');
    }
  }

  /**
   * Get public dreams for gallery (includes video data)
   */
  async getPublicDreamsWithVideos(params = {}) {
    try {
      const response = await apiClient.get('/dreams/public/gallery', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching public dreams with videos:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch public dreams');
    }
  }
}

// Export singleton instance
export const dreamVideoService = new DreamVideoService();
export default dreamVideoService;
