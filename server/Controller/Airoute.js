import { GoogleGenerativeAI } from '@google/generative-ai'; 
async function correctText(req,res,next)
{
    try {
        let formdata = req.body?.text.trim();

        if(!formdata)
        {
            return res.json({corrected:"Please enter some text" , originalText:formdata})

        }
        // init Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-flash-latest",
        }); // text model
        const prompt = `Check and Correct the following text with including spelling, grammer and return only the corrected text without any explanation: ${formdata}`;

        const result = await model.generateContent(prompt);
        const correctedText = result.response.text().trim();
       return res.json({ corrected: correctedText, originalText: formdata });
    } catch (error) {
        console.error("Error:", error);
        return res.json({
          corrected: "An error occurred. Please try again.",
          originalText: formdata,
        }); 
    }
}

export {correctText};