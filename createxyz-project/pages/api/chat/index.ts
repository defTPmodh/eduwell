import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Fallback responses for when API is unavailable
const getFallbackResponse = (message: string) => {
  const fallbackResponses = {
    meditation: `Take a deep breath in through your nose for 4 counts.
Hold your breath for 4 counts.
Now exhale slowly through your mouth for 6 counts.
Continue this breathing pattern as we begin our meditation.
Focus on the present moment, letting go of any thoughts or worries.
Feel the calm energy flowing through your body with each breath.`,
    breathing: `Welcome to this breathing exercise.
Breathe in deeply through your nose for 4 seconds.
Hold your breath gently for 4 seconds.
Exhale slowly through your mouth for 6 seconds.
Let's continue this pattern together.`,
    default: `I understand you're looking for support. While I'm currently experiencing technical limitations, here are some general wellness tips:
1. Take deep, calming breaths
2. Practice mindfulness by focusing on the present moment
3. Consider talking to a trusted friend or professional
4. Remember that it's okay to take breaks when needed
5. Stay hydrated and maintain regular sleep patterns

Would you like to try a simple breathing exercise together?`
  };

  // Check message content to determine response type
  if (message.toLowerCase().includes('meditation')) {
    return fallbackResponses.meditation;
  } else if (message.toLowerCase().includes('breath')) {
    return fallbackResponses.breathing;
  }
  return fallbackResponses.default;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { message } = req.body;

    try {
      // Create the system prompt
      const systemPrompt = `You are a supportive mental health counselor. Keep responses concise, friendly, and use emojis. 
      Format your responses as a single coherent message, not broken into parts. 
      For example: "😊 Hello! How can I help you today?" or "🌿 That sounds challenging. Let's work through this together."
      Keep responses under 50 words and always start with an emoji.`;

      // Get response from Replicate
      const response = await replicate.run(
        "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
        {
          input: {
            prompt: `User: ${message}\nAssistant: Let me respond with a single, friendly message starting with an emoji.`,
            system_prompt: systemPrompt,
            temperature: 0.7,
            max_new_tokens: 100,
            top_p: 0.9,
            repetition_penalty: 1.1,
            stream: false,
          },
        }
      );

      // Clean and format the response
      let cleanResponse = '';
      if (Array.isArray(response)) {
        cleanResponse = response.join('').trim();
      } else if (typeof response === 'string') {
        cleanResponse = response.trim();
      }

      // Remove any "Assistant:" prefix
      cleanResponse = cleanResponse.replace(/^Assistant:\s*/i, '');
      
      // Ensure it starts with an emoji if it doesn't already
      if (!cleanResponse.match(/^\p{Emoji}/u)) {
        cleanResponse = '🌿 ' + cleanResponse;
      }

      return res.json({ content: cleanResponse });

    } catch (error) {
      console.error('Llama API error:', error);
      
      // Use a simple fallback response
      return res.json({ 
        content: "🌿 I'm here to help! Would you like to try a quick meditation or breathing exercise together?"
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
} 