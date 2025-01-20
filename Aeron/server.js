const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
const MONGO_URI = 'mongodb://localhost:27017/answerEngine';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
const faqSchema = new mongoose.Schema({
    question: {type: String, required: true, unique: true },
    answer: {type: String, required: true},
    timestamp: {type: Date, default: Date.now}
});
const FAQ = mongoose.model('FAQ', faqSchema);
const GEMINI_API_KEY = 'AIzaSyC94irT8ejOFMs1Tp4LWtDejY54LinYXLg';
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.post('/api/search', async (req, res) => {
    const userQuestion = req.body.query.toLowerCase();
    try {
        let faq = await FAQ.findOne({ question: userQuestion });

        if (faq) {
            faq.timestamp = Date.now();
            await faq.save();
            return res.json({ result: faq.answer });
        }
        const query = `Important note: (Don't use complex words and vocabularies. Keep it simple and short, as it's for a 10-year-old.). Answer the question: ${userQuestion} in a way that even a 10-year-old can easily understand in 10 to 15 lines`;
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(query);
        const generatedAnswer = result.response.text();
        const count = await FAQ.countDocuments();
        if (count >= 4) {
            const oldest = await FAQ.findOne().sort({ timestamp: 1 });  
            await FAQ.deleteOne({ _id: oldest._id });
        }
        await FAQ.create({ question: userQuestion, answer: generatedAnswer });
        res.json({ result: generatedAnswer });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error generating content' });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
