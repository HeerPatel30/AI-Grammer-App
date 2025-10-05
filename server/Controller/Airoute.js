import { GoogleGenerativeAI } from '@google/generative-ai'; 
import aichat from '../Models/aichat.js';
import mongoose from 'mongoose';
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
        
        //  saving to chat 
        let payload = {
          originalText: formdata,
          correctedText: correctedText,
          userId : req.user ? req.user.uid : null
        }
        let savechat = await aichat.create(payload);
        await savechat.save();
       return res.json({ corrected: correctedText, originalText: formdata });
    } catch (error) {
        console.error("Error:", error);
        return res.json({
          corrected: "An error occurred. Please try again.",
          originalText: formdata,
        }); 
    }
}

async function chathistory(req,res,next)
{
  try { 
    let uid = req.headers['uid'];
    if(!uid)
    {
      return res.json({history:[]})
    }
    let pipeline = [{
      $match : {userId :  new mongoose.Types.ObjectId(uid)}
    },{
      $addFields : {
        date : {
          $dateToString : {format : "%Y-%m-%d", date : "$createdAt"}
        }
      }
    },{
      $group:{
        _id :"$date",
        chats : {$push : "$$ROOT"}
      }
    }
  ]
    let history = await aichat.aggregate(pipeline)
    if(history && history.length > 0)
    {
      return res.json({history:history})
    }
    return res.json({history:[]})
  }
  catch (error) {
    console.error("Error:", error);
    return res.json({history:[]});
  }

}
export {correctText,chathistory};