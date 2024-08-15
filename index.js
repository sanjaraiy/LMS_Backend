const app = require('./app');
const env = require('dotenv');
const connectionDB = require('./config/dbConnection');
const {v2} = require('cloudinary');
const Razorpay = require('razorpay');


env.config();
const PORT = process.env.PORT || 5000;

//Cloudinary configuration
v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Instance of Razorpay
export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});


app.listen(PORT,async()=>{
    console.log(`Server is running at port: ${PORT}`);
    await connectionDB();
})