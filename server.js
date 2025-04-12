const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require("./config/connectDB");
const userRouter = require("./routes/userRoute");

dotenv.config();

connectDB();

const app = express();

app.use(cors({origin: "https://finance-management-portal-frontend.vercel.app"}));
app.use(express.json());
app.use(morgan('dev'));
app.use(userRouter);

app.use('/api/v1/users', require('./routes/userRoute'));
app.use('/api/v1/transactions', require('./routes/transactionRoute'));

const port =  8080 || process.env.PORT;

app.listen(port, () =>{
    console.log(`App running on port ${port}`);
})

module.exports = app;