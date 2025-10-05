import mongoose from "mongoose";

let tokenSchema = new mongoose.Schema(
    {
        token: { type: String, required: true },
        uid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        unqkey : { type: String, required: true }, // Unique key for the token
        createdAt: { type: Date, default: Date.now, expires: '1d' }, // Token expires in 1 day
    },
    {
        timestamps: true,
    }
);

let Token = mongoose.model("Token", tokenSchema);
export default Token;   
