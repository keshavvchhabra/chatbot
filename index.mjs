import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({apiKey :process.env.GEMINI_API_KEY});
const app = express()

app.use(express.json())
app.use(cors())
app.post("/chat",async (req,res)=>{
    const {message} = req.body
    const ask = "Answer in plain text only. No markdown formatting."
    const prompt = ask+message
    try{
    const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    })
    const cleanText = response.text.replace(/\*\*/g, "");
    res.json({ reply: cleanText });
    }catch(error){
        console.log(error)
    }
})

app.listen(3000, () => {
  console.log("Server running on port 3000");
});