const axios = require('axios');

const API_BASE = 'https://api.pikapikapika.io/web';

/**
 * Generate a short video from prompt using Pika API Glue
 * @param {string} promptText
 * @returns {Promise<{ video_url: string|null, thumbnail_url: string|null, job_id: string }>} 
 */
async function generateVideoFromPrompt(promptText) {
  const token = process.env.PIKA_API_KEY;
  if (!token) throw new Error('PIKA_API_KEY is not set');
  if (!promptText) throw new Error('promptText is required');

  // Kick off generation
  const genResp = await axios.post(
    `${API_BASE}/generate`,
    {
      promptText,
      model: '1.0',
      options: {
        aspectRatio: '16:9',
        frameRate: 24,
        camera: { rotate: null, zoom: null, tilt: null, pan: null },
        parameters: { guidanceScale: 12, motion: 1, negativePrompt: '', seed: null },
        extend: false
      }
    },
    {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      timeout: 30000
    }
  );

  const job = genResp.data?.job;
  const jobId = job?.id || job?.pikaJobId;
  if (!jobId) throw new Error('Pika: missing job id');

  // Poll for completion
  const started = Date.now();
  const timeoutMs = 90_000;
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  while (Date.now() - started < timeoutMs) {
    const jobResp = await axios.get(`${API_BASE}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 20000
    });

    const videos = jobResp.data?.videos || [];
    if (Array.isArray(videos) && videos.length > 0) {
      const v = videos[0];
      if (String(v.status).toLowerCase() === 'finished' || v.progress === 100) {
        return {
          video_url: v.resultUrl || null,
          thumbnail_url: v.imageThumb || v.videoPoster || null,
          job_id: jobId
        };
      }
    }

    await wait(2000);
  }

  // Timed out
  return { video_url: null, thumbnail_url: null, job_id: jobId };
}

module.exports = { generateVideoFromPrompt };
