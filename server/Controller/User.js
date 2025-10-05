import jwt from "jsonwebtoken";
import { Generatekey, generatesixdigitsid, transporter } from "../Config/Config.js";
import user from "../Models/user.js";
import md5 from "md5";
import Token from "../Models/token.js";
import { client } from "../Redis/redisconnect.js";
async function usersignup(req,res,next)
{
    try {
         const { name, email, password, phoneno , username } = req.body;
         //  all field required
         if (
           !name &&
           name.trim() === "" &&
           !email &&
           email.trim() === "" &&
           !password &&
           password.trim() === "" &&
          !phoneno &&
           phoneno.trim() === "" &&
           !username &&
           username.trim() === ""
         ) {
           return res.status(400).json({ message: "All fields are required" });
         }
         //  check if user already exists
         const existinguser = await user.findOne({ email: email });
         if (existinguser) {
           return res.status(400).json({ message: "User already exists" });
         }
         //  inserting the user
         req.body.userid = generatesixdigitsid();
        //   encrypting the password
         req.body.password = md5(password);

         const newuser = new user(req.body);
         let adduser = await newuser.save();
         
         //  generating jwt token
         let payload = {
           unqkey: Generatekey(12),
           uid: adduser._id,
         };
         console.log(payload);
         const token = jwt.sign(payload, process.env.TOKEN_KEY, {
           expiresIn: "1d",
         });
         if (!token) {
           return res
             .status(500)
             .json({ message: "Error occurred, please try again." });
         }
         let tokendata = {
           token: token,
           uid: adduser._id,
           unqkey: payload.unqkey,
         };
         let savetoken = await Token.create(tokendata);
         await savetoken.save();
         //  sending token in header
         res.set("token", token);
         res.set("uid", adduser._id.toString());
         res.set("unqkey", payload.unqkey);
         return res.status(201).json({ user: adduser }); 
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function userlogin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const encpassword = md5(password);
    const existinguser = await user.findOne({
      $or: [{ email: username }, { username: username }],
      password: encpassword,
    });

    if (!existinguser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // removing the token if already exists
    let existingtoken = await Token.findOne({ uid: existinguser._id });
    if (existingtoken) {
         await Token.deleteOne({ uid: existinguser._id });
     }

    // Generate new token
    const payload = { uid: existinguser._id, unqkey: Generatekey(12) };

    const token = jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: "1d" });

    // store token 
    let tokendata = {
      token: token,
      uid: existinguser._id,
      unqkey: payload.unqkey,
    };
    let savetoken = await Token.create(tokendata);
    console.log(savetoken);
    await savetoken.save();
    res.set("token", token);
    res.set("uid", existinguser._id.toString());
    res.set("unqkey", payload.unqkey);
    // return response
    return res.status(200).json({
      message: "Login successful",
      user: existinguser,
      token,
      uid: existinguser._id,
      unqkey: payload.unqkey,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}


async function userlogout(req,res,next){
    try {
      //    fetching the uid from headers
      let uid = req.headers["uid"];

      //   checking if token exists for the user
      let usertoken = await Token.findOne({ uid: uid });
      if (!usertoken) {
        return res.status(400).json({ message: "User already logged out." });
      }
      //   deleting the token
      let deletetoken = await Token.deleteOne({ uid: uid });
      if (deletetoken.deletedCount === 0) {
        return res.status(400).json({ message: "User already logged out." });
      }
      return res.status(200).json({ message: "Logout Successfully." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function forgotpassword(req,res,next)
{
    try {
        const {email, newpassword , phoneno , confirmnewpassword} = req.body;

        //  all field required
        if(((email && email.trim() === "") || (phoneno && phoneno.trim() === "")) && ((!newpassword && newpassword.trim() === "") || (!confirmnewpassword && confirmnewpassword.trim() === ""))) 
        {
            return res.status(400).json({ message: "All fields are required" });
        }
      
        //  checking if user exists
        let pipeline 
        if(email && email!="")
        {
            pipeline = { email: email };
        }   
        else {
            pipeline= { phoneno: phoneno };
        }
        const existinguser = await user.findOne(pipeline);
        if (!existinguser) {
          return res.status(401).json({ message: "User does not exists" });
        }
        if(newpassword !== confirmnewpassword)
        {
            return res.status(400).json({message : "New password and confirm new password must be same."})
        }
        let encpassword = md5(newpassword);
        let updateuser = await user.updateOne(pipeline, { $set: { password: encpassword } });
        if(updateuser.modifiedCount === 0)
        {
            return res.status(500).json({message : "Error occurred, please try again."})
        }
        return res.status(200).json({message :"Password updated successfully."}); 

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
async function sendotp(req,res,next){
  try {
  let email = req.body.email;
  let otp = generatesixdigitsid();

   await client.setEx(`otp:${email}`, 300, otp);
  //  send otp to email
  let info = await transporter.sendMail({
    from: "heerpatel879@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp} . It is valid for 5 minutes.`,
  });
  let updateuser = await user.updateOne({email:email},{$set : { otp : otp }});
  if(info.accepted.length > 0)
  {
     return res.json({ success: true, message: "OTP sent successfully" });
  }
  return res.json({ success: false, message: "Error sending OTP" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

async function verifyotp(req,res,next) {
  try {
    const { email, otp } = req.body;
    const storedOtp = await client.get(`otp:${email}`);
    if (!storedOtp) {
      return res.json({ success: false, message: "OTP expired or not found" });
    }
    if (storedOtp === otp) {
      // OTP matched → delete from Redis
    await client.del(`otp:${email}`);
    let updateuser = await user.updateOne({email:email},{$set : { otp : "" }});
    return res.json({ success: true, message: "OTP verified successfully" });
  } else {
    return res.json({ success: false, message: "Invalid OTP" });
  }
} catch (error) {
  return res.json({ success: false, message: error.message });
  }
}




export { usersignup, userlogin, userlogout, forgotpassword, sendotp, verifyotp };