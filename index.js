const app = require('./app');
const env = require('dotenv');
const connectionDB = require('./config/dbConnection');

env.config();
const PORT = process.env.PORT || 5000;






app.listen(PORT,async()=>{
    // await connectionDB();
    console.log(`Server is running at port: ${PORT}`);
})