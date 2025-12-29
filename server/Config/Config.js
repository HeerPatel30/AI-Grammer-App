import nodemailer from "nodemailer";
import { client } from "../Redis/redisconnect.js";
import brevo from "@getbrevo/brevo"

// const transporter = nodemailer.createTransport({
//   service: "gmail", // or use your SMTP config
//   auth: {
//     user: "heerpatel879@gmail.com",
//     pass: "gxza uzma buwk fsxm" // use App Password if Gmail
//   }
// });


let apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey( 
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

async function sendemail(to, subject, text) {
  try {
    let sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail = {
      to: [{ email: to }],
      sender: { email: "heerpatel879@gmail.com" },
      subject: subject,
      textContent: text,
    };
    const data = apiInstance.sendTransacEmail(sendSmtpEmail);
   
    return { success: true, messageId: data.messageId };
  } catch (error) {
   
    return { success: false, message: error.message };
  }
}


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




export {generatesixdigitsid, Generatekey,sendemail};
