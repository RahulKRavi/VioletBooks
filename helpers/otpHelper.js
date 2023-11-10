const twilio = require('twilio');

const TWILIO_SID = "ACceb5fc6dace3c795bd750246608e6cab";
const TWILIO_AUTH_TOKEN = "cd5be99c8b37c554a1e0482170a8ded3";
const TWILIO_PHONE_NUMBER = "+16562162811";

const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

const sendOTP = async (phoneNumber,res) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const message = `Your OTP is: ${otp}`;

        await client.messages.create({
            body: message,
            from: TWILIO_PHONE_NUMBER,
            to: '+91'+phoneNumber
        });

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