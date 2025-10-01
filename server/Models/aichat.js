import mongoose from "mongoose";

const aichatSchema = new mongoose.Schema({
    originalText: { type:String },
    correctedText: { type:String },
    
})