import { useState, useCallback } from 'react';
import { getRunwayMLService } from '@/services/runwayML';
import { toast } from 'sonner';

export const useVideoGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);

  const generateDreamVideo = useCallback(async (dreamText, emotions, keywords) => {
    if (!dreamText || !emotions || !keywords) {
      throw new Error('Missing required parameters for video generation');
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentTask(null);

    try {
      const runwayService = getRunwayMLService();
      
      // Generate the dream prompt
      const prompt = runwayService.generateDreamPrompt(dreamText, emotions, keywords);
      
      toast.info('🎬 Starting dream video generation...');
      
      // Start video generation
      const videoTask = await runwayService.generateVideo(prompt, {
        duration: 4,
        aspectRatio: '16:9'
      });

      setCurrentTask(videoTask);
      setGenerationProgress(10);

      // Poll for completion
      const pollForCompletion = async () => {
        const status = await runwayService.getVideoStatus(videoTask.id);

        if (status.status === 'SUCCEEDED') {
          setIsGenerating(false);
          setGenerationProgress(100);
          const newVideo = {
            id: videoTask.id,
            url: status.output,
            prompt: prompt,
            status: 'completed',
            createdAt: new Date().toISOString(),
            duration: 4
          };
          setGeneratedVideos(prev => [newVideo, ...prev]);
          toast.success('🎉 Dream video generated successfully!');
          return true; // Polling complete
        } else if (status.status === 'FAILED') {
          setIsGenerating(false);
          setGenerationProgress(0);
          toast.error('Video generation failed. Please try again.');
          return true; // Polling complete
        } else {
          // Update progress
          const progress = Math.min(90, 10 + (Date.now() - new Date(videoTask.createdAt).getTime()) / 1000 * 2);
          setGenerationProgress(progress);
          return false; // Continue polling
        }
      };

      const pollInterval = setInterval(async () => {
        try {
          const isComplete = await pollForCompletion();
          if (isComplete) {
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Error polling video status:', error);
          clearInterval(pollInterval);
          setIsGenerating(false);
          toast.error('Error checking video generation status');
        }
      }, 3000);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isGenerating) {
          setIsGenerating(false);
          toast.error('Video generation timed out. Please try again.');
        }
      }, 300000);

    } catch (error) {
      setIsGenerating(false);
      setGenerationProgress(0);
      console.error('Video generation error:', error);
      
      if (error.message.includes('API key')) {
        toast.error('RunwayML API key not configured. Please add your API key in settings.');
      } else {
        toast.error(`Video generation failed: ${error.message}`);
      }
      
      throw error;
    }
  }, [isGenerating]);

  const generateMultipleVariations = useCallback(async (dreamText, emotions, keywords, count = 3) => {
    if (!dreamText || !emotions || !keywords) {
      throw new Error('Missing required parameters for video generation');
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const runwayService = getRunwayMLService();
      
      toast.info(`🎬 Generating ${count} dream video variations...`);
      
      // Generate multiple variations
      const variations = await runwayService.generateVideoVariations(
        dreamText, 
        emotions, 
        keywords, 
        count
      );

      setGeneratedVideos(prev => [...variations, ...prev]);
      setIsGenerating(false);
      setGenerationProgress(100);
      
      toast.success(`🎉 Generated ${variations.length} video variations!`);

    } catch (error) {
      setIsGenerating(false);
      setGenerationProgress(0);
      console.error('Multiple video generation error:', error);
      toast.error(`Video generation failed: ${error.message}`);
      throw error;
    }
  }, []);

  const clearGeneratedVideos = useCallback(() => {
    setGeneratedVideos([]);
    setCurrentTask(null);
  }, []);

  const getVideoById = useCallback((videoId) => {
    return generatedVideos.find(video => video.id === videoId);
  }, [generatedVideos]);

  return {
    isGenerating,
    generationProgress,
    generatedVideos,
    currentTask,
    generateDreamVideo,
    generateMultipleVariations,
    clearGeneratedVideos,
    getVideoById
  };
};
