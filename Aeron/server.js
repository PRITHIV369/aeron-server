const express = require('express');
const cors = require('cors');
const axios = require('axios'); 
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
const GEMINI_API_KEY = 'AIzaSyC94irT8ejOFMs1Tp4LWtDejY54LinYXLg';
app.post('/api/search', async (req, res) => {
  const userQuestion = req.body.query; 
  const query = `Answer the question:${userQuestion} in a way that even a illiterate (not 10 year old) can easily understand. Use simple language, provide clear examples, and avoid technical jargon or complex terms. Focus on the key points, and explain step-by-step if needed. Keep the explanation fun and engaging so it's easy to follow and remember.The Answer should be very funny.Try to give the answer in paragraph format.`;
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(query);
        console.log('Generated content: ', result.response.text());
        res.json({ result: result.response.text() });
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Error generating content' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
