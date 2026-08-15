const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// AI Repair Advisor
// Uses OpenAI when OPENAI_API_KEY is configured.
router.post('/repair-advice', protect, async (req, res) => {
  try {
    const { deviceType, brand, model, symptoms } = req.body;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ success: false, message: 'Please describe the repair symptoms.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI is not configured yet. Add OPENAI_API_KEY to server/.env.',
      });
    }

    const prompt = `You are an electronics repair shop assistant. Analyze the customer's repair description and help a technician.\n\nDevice type: ${deviceType || 'Unknown'}\nBrand: ${brand || 'Unknown'}\nModel: ${model || 'Unknown'}\nSymptoms: ${symptoms}\n\nGive a concise practical response with exactly these sections:\n1. Likely causes (2-4 bullets)\n2. Recommended checks (3-5 bullets)\n3. Possible repair (1-3 bullets)\n4. Safety/handling note (1 bullet)\n5. Confidence (Low/Medium/High with one short reason)\nDo not claim certainty and do not invent device-specific specifications.`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5-mini',
        input: prompt,
        max_output_tokens: 700,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[AI Error]:', data);
      return res.status(502).json({
        success: false,
        message: data?.error?.message || 'AI service request failed.',
      });
    }

    const text = data.output_text || (data.output || [])
      .flatMap((item) => item.content || [])
      .filter((item) => item.type === 'output_text')
      .map((item) => item.text)
      .join('\n');

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
