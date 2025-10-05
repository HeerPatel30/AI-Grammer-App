import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username : { type:String ,trim : true},
    name : { type: String , trim : true},
    email: { type: String , trim : true, unique : true},
    password: { type: String },
    phoneno: {type: String, trim : true, unique : true},
    userid : { type: String},
    otp : { type: String , default : ""} ,// for forgot password
    dailycount : { type: Number , default : 0} // to track daily usage
},{
    timestamps: true ,
})

export default mongoose.model("User", userSchema);