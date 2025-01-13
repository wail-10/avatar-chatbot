// backend/src/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios'); 
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ELEVENLABS_API_ENDPOINT = 'https://api.elevenlabs.io/v1/text-to-speech';
const VOICE_ID = 'CwhRBWXzGAHq8TQ4Fs17';

// Prompts for different functionalities
const EMOTION_PROMPT = `
Analyze the following message and detect the primary emotion.
Return ONLY ONE of these emotions without any explanation or additional text:
happy, sad, excited, angry, neutral, curious, anxious, surprised
`;

const TOURIST_GUIDE_PROMPT = `
You are an experienced and friendly tourist guide. The tourist's current emotional state is: {emotion}

Adapt your response based on their emotion:
- Happy/Excited: Share enthusiastic suggestions and upbeat activities
- Sad/Anxious: Recommend peaceful, calming places and reassuring experiences
- Curious: Provide fascinating facts and hidden gems
- Angry: Suggest relaxing destinations and soothing experiences
- Surprised: Share more amazing facts and unique destinations
- Neutral: Give balanced, informative travel advice

Their question is: {message}

Keep your response friendly and concise (2-3 sentences). Focus on providing specific, practical travel recommendations that match their emotional state.
`;

// async function generateLipsync(audioPath) {
//   const outputPath = audioPath + '.txt';
//   await execAsync(`rhubarb -f json ${audioPath} -o ${outputPath}`);
//   const lipsyncData = await fs.promises.readFile(outputPath, 'utf8');
//   await fs.promises.unlink(outputPath); // Clean up
//   return JSON.parse(lipsyncData);
// }

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Detect emotion
    const emotionModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    const emotionPrompt = `${EMOTION_PROMPT}\nMessage: ${message}`;
    const emotionResult = await emotionModel.generateContent(emotionPrompt);
    const emotion = (await emotionResult.response.text()).trim().toLowerCase();

    // 2. Generate tourist guide response
    const guideModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    const guidePrompt = TOURIST_GUIDE_PROMPT
      .replace('{emotion}', emotion)
      .replace('{message}', message);
    
    const result = await guideModel.generateContent(guidePrompt);
    const text = await result.response.text();
    
    // 3. Convert to speech using ElevenLabs
    const textToSpeechResponse = await axios({
      method: 'POST',
      url: `${ELEVENLABS_API_ENDPOINT}/${VOICE_ID}`,
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      },
      responseType: 'arraybuffer'
    });

    // 4. Save audio and generate lipsync
    // const tempDir = path.join(__dirname, 'temp');
    // await fs.mkdir(tempDir, { recursive: true });
    // const audioPath = path.join(tempDir, `audio-${Date.now()}.wav`);
    // await fs.writeFile(audioPath, textToSpeechResponse.data);
    
    // const lipsyncData = await generateLipsync(audioPath);
    // await fs.unlink(audioPath); // Clean up

    // 5. Convert audio to base64
    const audioBase64 = Buffer.from(textToSpeechResponse.data).toString('base64');
    
    // Map emotions to animations
    const emotionToAnimation = {
      happy: "Dancing",
      sad: "Idle",
      excited: "Jumping",
      angry: "CrossArms",
      neutral: "Idle",
      curious: "Looking",
      anxious: "Walking",
      surprised: "Wave"
    };

    // Send complete response
    res.json({ 
      response: text,
      audio: audioBase64,
      emotion: emotion,
      suggestedAnimation: emotionToAnimation[emotion] || "Idle",
      // lipsync: lipsyncData
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// app.post('/api/chat', async (req, res) => {
//   try {
//     const { message } = req.body;
    
//     if (!message) {
//       return res.status(400).json({ error: 'Message is required' });
//     }

//     // 1. Detect emotion
//     const emotionModel = genAI.getGenerativeModel({ model: "gemini-pro" });
//     const emotionPrompt = `${EMOTION_PROMPT}\nMessage: ${message}`;
//     const emotionResult = await emotionModel.generateContent(emotionPrompt);
//     const emotion = (await emotionResult.response.text()).trim().toLowerCase();

//     // 2. Generate tourist guide response based on emotion
//     const guideModel = genAI.getGenerativeModel({ model: "gemini-pro" });
//     const guidePrompt = TOURIST_GUIDE_PROMPT
//       .replace('{emotion}', emotion)
//       .replace('{message}', message);
    
//     const result = await guideModel.generateContent(guidePrompt);
//     const response = await result.response;
//     const text = response.text();
    
//     // 3. Convert response to speech using ElevenLabs API
//     const textToSpeechResponse = await axios({
//       method: 'POST',
//       url: `${ELEVENLABS_API_ENDPOINT}/${VOICE_ID}`,
//       headers: {
//         'Accept': 'audio/mpeg',
//         'xi-api-key': process.env.ELEVENLABS_API_KEY,
//         'Content-Type': 'application/json',
//       },
//       data: {
//         text: text,
//         model_id: 'eleven_monolingual_v1',
//         voice_settings: {
//           stability: 0.5,
//           similarity_boost: 0.5,
//         }
//       },
//       responseType: 'arraybuffer'
//     });

//     // Convert audio buffer to base64
//     const audioBase64 = Buffer.from(textToSpeechResponse.data).toString('base64');
    
//     // Map emotions to avatar animations
//     const emotionToAnimation = {
//       happy: "Dancing",
//       sad: "Idle",
//       excited: "Jumping",
//       angry: "CrossArms",
//       neutral: "Idle",
//       curious: "Looking",
//       anxious: "Walking",
//       surprised: "Wave"
//     };

//     // Send complete response
//     res.json({ 
//       response: text,
//       audio: audioBase64,
//       emotion: emotion,
//       suggestedAnimation: emotionToAnimation[emotion] || "Idle"
//     });

//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Failed to process request' });
//   }
// });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});