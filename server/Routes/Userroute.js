import express from 'express';
import { usersignup,userlogin, userlogout, sendotp, verifyotp, forgotpassword } from '../Controller/User.js';
import user from '../Models/user.js';

const userroutes = express.Router();

userroutes.post('/signup', usersignup);
userroutes.post('/login', userlogin);
userroutes.post('/logout',userlogout)
userroutes.post('/sendotp',sendotp  )
userroutes.post('/forgotpassword',forgotpassword)
userroutes.post('/verifyotp',verifyotp)
export default userroutes;