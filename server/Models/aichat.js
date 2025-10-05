import mongoose from "mongoose";

const aichatSchema = new mongoose.Schema({
    originalText: { type:String },
    correctedText: { type:String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }  ,
},{
    timestamps: true ,
})

export default mongoose.model("Aichat", aichatSchema);