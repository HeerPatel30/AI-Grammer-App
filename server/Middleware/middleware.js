import jwt from "jsonwebtoken";
import { client } from "../Redis/redisconnect.js";
import user from "../Models/user.js";

// async function limitUsage(req, res, next) {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     let key;
//     let limit;
//     console.log("Token:", token);
//     if (token) {
//       // Logged-in user
//       const decoded = jwt.verify(token, process.env.TOKEN_KEY);
//       console.log("Decoded:", decoded);
//       if (decoded.uid === req.headers["uid"] && decoded.unqkey === req.headers["unqkey"]) {
//         req.user = decoded;

//         key = `usage:user:${decoded.uid}`; // count per user
//         limit = 20; // logged-in users can hit 50/day
//       } else {
//         return res.status(401).json({ message: "Invalid token" });
//       }
//     } else {
//       // Anonymous user
//       const ip = req.ip;
//       key = `usage:ip:${ip}`;
//       limit = 5; // anonymous users can hit 5/day
//     }

//     let count = await client.get(key);
//     count = count ? parseInt(count) : 0;
//     if(req.headers['uid'])
//     {
//         //  finding uid 
//         let finduser = await user.findById(req.headers['uid']);
//         if(!finduser)
//         {
//             return res.status(401).json({ message: "Invalid User" });
//         }
//         if(finduser.dailycount && finduser.dailycount >= limit)
//         {
//             return res.status(429).json({
//                 message: `Daily limit reached. ${
//                   token ? "Please wait until tomorrow." : "Please sign up to continue."
//                 }`,
//               });
//         }   
        
//         let updateuser = await user.findByIdAndUpdate(req.headers['uid'],{ $set: { dailycount : count } });
//     }
//     if (count >= limit) {
//       return res.status(429).json({
//         message: `Daily limit reached. ${
//           token ? "Please wait until tomorrow." : "Please sign up to continue."
//         }`,
//       });
//     }

//     await client.set(key, count + 1, { EX: 86400 }); // expire in 1 day
//     next();
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server error" });
//   }
// }
async function limitUsage(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    let limit;

    if (token) {
      // Logged-in user
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      
      if (decoded.uid !== req.headers["uid"] || decoded.unqkey !== req.headers["unqkey"]) {
        return res.status(401).json({ message: "Invalid token", success: false });
      }

      // Find and validate user
      const finduser = await user.findById(req.headers['uid']);
      if (!finduser) {
        return res.status(401).json({ message: "Invalid User", success: false });
      }

      // Check daily limit from database
      if (finduser.dailycount >= 50) {
        return res.status(429).json({
          message: "Daily limit reached. Please wait until tomorrow.",
          success: false
        });
      }

      // Increment count in database
      await user.findByIdAndUpdate(req.headers['uid'], { 
        $inc: { dailycount: 1 } 
      });

    } else {
      // Anonymous user - require device ID
      const deviceId = req.headers['x-device-id'];
      
      if (!deviceId) {
        return res.status(400).json({ 
          message: "Device identifier required. Please refresh the page.",
          success: false 
        });
      }

      console.log("Device ID:", deviceId);
      const key = `usage:device:${deviceId}`;
      limit = 5;

      let count = await client.get(key);
      count = count ? parseInt(count) : 0;
      console.log(count)
      if (count >= limit) {
        return res.status(429).json({
          message: "Daily limit reached. Please sign up to continue.",
          success: false
        });
      }

      await client.set(key, count + 1, { EX: 86400 }); // expire in 1 day
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
}

export { limitUsage };