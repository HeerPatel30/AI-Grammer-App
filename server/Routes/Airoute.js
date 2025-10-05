import express from 'express';
import { chathistory, correctText } from '../Controller/Airoute.js';
import { limitUsage } from '../Middleware/middleware.js';

const airouter = express.Router();

airouter.post("/correct", limitUsage, correctText);
airouter.post("/history", chathistory);

export default airouter;