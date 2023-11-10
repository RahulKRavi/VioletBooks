const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express');
const app = express();

const userRoute = require('./routes/userRoute');
app.use('/', userRoute);

const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute);

app.listen(3000, function(){
    console.log("Server is Started");
});
