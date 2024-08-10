const  mongoose  = require("mongoose");


//Not a strict-Mode, if any parameter is not passed then it not throw error
mongoose.set('strictQuery', false);

const connectionDB = async () => {
   try {
     const response = await mongoose.connect(process.env.MONGO_URI);
     console.log(`MONGO DB is connected successfully: ${response.connection.host}`);
     
   } catch (error) {
     console.log('ERROR: ', error.message);
     process.exit(1);
   }

}
module.exports = connectionDB;
