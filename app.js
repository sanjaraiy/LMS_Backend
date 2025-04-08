const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const userRouter = require('./routes/userRouter');
const courseRouter = require('./routes/courseRouter');
const paymentRouter = require('./routes/paymentRoute');

const errorMiddleware = require('./middlewares/errorMiddleware');


const app = express();

//============ default middleware ============
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}))
app.use(morgan('dev'));
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));

//=============== Routes ==================
app.use('/api/v1/user', userRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/payments', paymentRouter);

app.use('/ping', function(req, res){
     res.send('/pong');
});

app.all('*', (req, res) => {
    res.status(404).send('OOPS!! 404 page not found');
});


app.use(errorMiddleware);



module.exports = app;
