const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');



const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));



app.use('/ping', function(req, res){
     res.send('/pong');
});

app.all('*',(req, res)=>{
    res.status(404).send('OOPS!! 404 page not found');
});





module.exports = app;
