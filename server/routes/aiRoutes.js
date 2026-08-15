const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// AI Repair Advisor
// Uses Hugging Face Inference Providers so the app does not depend on an OpenAI API key.
router.post('/repair-advice', protect, async (req, res) => {
  try {
    const { deviceType, brand, model, symptoms } = req.body;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ success: false, message: 'Please describe the repair symptoms.' });
    }

    if (!process.env.HF_TOKEN) {
      return res.status(503).json({
        success: false,
        message: 'AI is not configured yet. Add HF_TOKEN to server/.env.',
      });
    }

    const prompt = `You are an electronics repair shop assistant. Analyze the customer's repair description and help a technician.

Device type: ${deviceType || 'Unknown'}
Brand: ${brand || 'Unknown'}
Model: ${model || 'Unknown'}
Symptoms: ${symptoms}

Give a concise practical response with exactly these sections:
1. Likely causes (2-4 bullets)
2. Recommended checks (3-5 bullets)
3. Possible repair (1-3 bullets)
4. Safety/handling note (1 bullet)
5. Confidence (Low/Medium/High with one short reason)
Do not claim certainty and do not invent device-specific specifications.`;

    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
      },
      body: JSON.stringify({
        model: process.env.HF_MODEL || 'Qwen/Qwen2.5-7B-Instruct-1M',
        messages: [
          {
            role: 'system',
            content: 'You are a careful electronics repair assistant. Give practical diagnostic guidance, not certainty.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 700,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Hugging Face AI Error]:', data);
      return res.status(502).json({
        success: false,
        message: data?.error?.message || data?.message || 'AI service request failed.',
      });
    }

    const text = data?.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return res.status(502).json({ success: false, message: 'AI returned an empty response.' });
    }

    res.json({ success: true, advice: text });
  } catch (error) {
    console.error('[AI Repair Advisor Error]:', error.message);
    res.status(500).json({ success: false, message: 'Unable to generate AI advice right now.' });
  }
});

module.exports = router;
