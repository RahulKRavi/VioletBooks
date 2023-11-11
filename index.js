const dotenv = require('dotenv');
dotenv.config({"path":".env"});

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_UR).then().catch((err)=>{
    console.log(err);
})

const express = require('express');
const app = express();

const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');

app.use('/', userRoute);
app.use('/admin', adminRoute);

app.listen(3000, async  function(){
    console.log("Server is Started");
});
