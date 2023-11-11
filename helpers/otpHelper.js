const twilio = require('twilio');
const dotenv = require('dotenv');
dotenv.config();

const sid = process.env.TWILIO_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const phone = process.env.TWILIO_PHONE_NUMBER;
console.log(token,phone);
if (!sid || !token || !phone) {
    console.error("Twilio credentials or phone number missing in .env file.");
    process.exit(1);
  }

const client = twilio(sid, token);

const sendOTP = async (phoneNumber,res) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const message = `Your OTP is: ${otp}`;

        await client.messages.create({
            body: message,
            from: phone,
            to: '+91'+phoneNumber
        });
  console.log(otp);
        return otp

    } catch (error) {
        console.log(error.message)
    }
};

const checkOTP = (otp, expectedToken) => {
    return  otp === expectedToken;
} 

module.exports = {
    sendOTP,
    checkOTP
}