const app = require('./app');
const env = require('dotenv');
const connectionDB = require('./config/dbConnection');
const {v2} = require('cloudinary');


env.config();
const PORT = process.env.PORT || 5000;

//Cloudinary configuration
v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});





app.listen(PORT,async()=>{
    // await connectionDB();
    console.log(`Server is running at port: ${PORT}`);
})