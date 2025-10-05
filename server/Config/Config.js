import nodemailer from "nodemailer";
import { client } from "../Redis/redisconnect.js";


const transporter = nodemailer.createTransport({
  service: "gmail", // or use your SMTP config
  auth: {
    user: "heerpatel879@gmail.com",
    pass: "gxza uzma buwk fsxm" // use App Password if Gmail
  }
});



function generatesixdigitsid(){
    return Math.floor(100000 + Math.random() * 900000).toString();
}


function Generatekey(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}




export {generatesixdigitsid, Generatekey,transporter};