const dotenv = require('dotenv');
dotenv.config({"path":".env"});

const mongoose = require('mongoose');

const userRoute = require('./routes/userRoute');
const express = require('express');
const app = express();

 mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });


app.use('/', userRoute);

const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute);

app.listen(3000, async  function(){
    console.log("Server is Started");
});
