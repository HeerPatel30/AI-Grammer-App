import express from 'express';
import "dotenv/config";
import connectDB from './Database/Dbconnect.js';
import airouter from './Routes/Airoute.js';
import cors from 'cors';
import userroutes from './Routes/Userroute.js';

const app = express()
const PORT = process.env.PORT || 3000;

//  middlewares
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173', // allow your frontend origin
  credentials: true
}));
app.get('/', (req, res) => {
  res.json({corrected:"" , originalText:""})
})



//  database connection
connectDB()
//  routes 
app.use('/api/ai', airouter);
app.use('/api/user', userroutes);

//  start the  server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
