import express from 'express';
import { correctText } from '../Controller/Airoute.js';

let airouter = express.Router();

airouter.post("/correct", correctText)


export default airouter;