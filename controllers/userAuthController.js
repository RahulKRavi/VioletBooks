const { User } = require('../models/userModel')
const { Genre, Book } = require('../models/bookModel');
const Cart = require('../models/cartModel')
const bcrypt = require('bcryptjs')
const otpHelper = require('../helpers/otpHelper')
const passwordHelper = require('../helpers/passwordHelper')
require('dotenv').config();


const loadSignup = async (req, res) => {
    try {
        res.render('signup')
    } catch (error) {
        console.log(error.message)
        res.redirect('/error-page')
    }
}

const userRegistration = async (req, res) => {
    try {
        const regEmail = await User.findOne({ email: req.body.email })
        const regMobile = await User.findOne({ phone: req.body.phone })
        if (regEmail) {
            return res.render('signup', { message: "Email already exists" })
        }
        if (regMobile) {
            return res.render('signup', { message: "Phone number already exists" })
        }
        const password = req.body.password
        const confirm = req.body.confirm
        if (password !== confirm) {
            return res.render('signup', { message: "Passwords not matching" })
        }
        const key = await passwordHelper.securePassword(req.body.password)
        const newUser = new User({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            phone: req.body.phone,
            password: key,
            is_admin: 0
        })
        const userData = await newUser.save()
        const userId = userData._id;
        const cart = new Cart({
            user: userId,
            items: [],
            total: 0
        });
        await cart.save();
        if (userData) {
            const otpToken = await otpHelper.sendOTP(req.body.phone, res);
            console.log(otpToken)
            req.session.userData = userData;
            req.session.otpToken = otpToken;
            res.render('verify-otp', { userData: req.session.userData, otpToken: req.session.otpToken })
        } else {
            res.render('signup', { message: "Registration Failed" })
        }
    } catch (error) {
        console.log(error.message)
        res.redirect('/error-page')
    }
}

const loadLogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
        res.redirect('/error-page')
    }
}

const verifyLogin = async (req, res) => {
    try {
        const inputPhone = req.body.phone
        const inputPassword = req.body.password
        const userData = await User.findOne({ phone: inputPhone })
        if (userData) {
            const passwordMatch = await bcrypt.compare(inputPassword, userData.password)
            if (passwordMatch) {
                if (userData.is_blocked === 0) {
                    if (userData.is_verified === 0) {
                        const otpToken = await otpHelper.sendOTP(req.body.phone, res);
                        console.log(otpToken)
                        req.session.userData = userData;
                        req.session.otpToken = otpToken;
                        req.session.loginSource = 'password'
                        res.render('verify-otp')
                    } else {
                        req.session.user_id = userData._id
                        res.redirect('/home')
                    }
                } else {
                    res.render('login', { message: "This account has been blocked" })
                }
            } else {
                res.render('login', { message: "Oops, the password you entered is incorrect" })
            }
        } else {
            res.render('login', { message: "The Phone number you entered is not registered" })
        }
    } catch (error) {
        console.log(error.message)
        res.redirect('/error-page')
    }
}

const loadLoginWithOTP = async (req, res) => {
    try {
        res.render('login-otp');
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-page')
    }
}

const processMobileAuth = async (req, res) => {
    try {
        const userData = await User.findOne({phone:req.body.phone})
        if (userData) {
            if(userData.is_blocked == 0){
                const otpToken = await otpHelper.sendOTP(req.body.phone, res);
                console.log(otpToken)
                req.session.userData = userData;
                req.session.otpToken = otpToken;
                req.session.loginSource = 'otp'
                res.render('verify-otp')
            } else {
                res.render('login-otp', { message: "This account has been blocked" })
            }

        } else {
            res.render('login-otp', { message: "The Phone number you entered is not registered" })
        }

    } catch (error) {
        console.log(error.message)
        res.redirect('/error-page')
    }
}

const loadForgotPW = async (req, res) => {
    try {
        res.render('forgot-pw');
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-page')
    }
}

const processForgotPW = async (req, res) => {
    try {
        const userData = await User.findOne({phone:req.body.phone})
        if (userData) {
            if (userData.is_blocked == 0) {
                const otpToken = await otpHelper.sendOTP(req.body.phone, res);
                console.log('otp',otpToken)
                req.session.userData = userData;
                req.session.otpToken = otpToken;
                req.session.loginSource = 'forgot'
                res.render('verify-otp')
            } else {
                res.render('forgot-pw', { message: "This account has been blocked" })
            }

        } else {
            res.render('forgot-pw', { message: "The Phone number you entered is not registered" })
        }

    } catch (error) {
        console.log(error.message)
        res.redirect('/error-page')
    }
}



const loadVerifyOTP = async (req, res) => {
    try {
        res.render('verify-otp');
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-page')
    }
}

const verifyOTP = async (req, res) => {
    try {
        const otp = req.body.otp;
        const otpToken = req.session.otpToken
        const isOtpValid = otpHelper.checkOTP(otp, otpToken);

        if (!isOtpValid) {
            if (req.session.loginSource === 'otp') {
                return res.render('login-otp', { message: "Invalid OTP" });
            } else if (req.session.loginSource === 'forgot') {
                return res.render('forgot-pw', {message: "Invalid OTP"})
            } else {
                return res.render('login', { message: "Invalid OTP" });
            }
        } else if (req.session.loginSource === 'forgot') {
            return res.render('reset-pw')
        } else {
            req.session.user_id = req.session.userData._id
            await User.findByIdAndUpdate({ _id: req.session.user_id }, { $set: { is_verified: 1 } })
            res.redirect('/home');
        }

    } catch (error) {
        console.log(error.message);
        res.redirect('/error-page')
    }
};

const loadResetPW = async (req, res) => {
    try {
        res.render('reset-pw');
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-page')
    }
}

const processResetPW = async (req, res) =>{
    try {
        const userId = req.session.userData._id; 
        const password = req.body.password
        const confirm = req.body.confirm
        if ( password !== confirm ) {
            return res.render('reset-pw', {message: "Passwords not matching"})
        } else {
            const key =  await passwordHelper.securePassword(req.body.password)
            await User.findByIdAndUpdate({_id:userId},{$set:{password:key}})
            return res.render('login', {message: "Passwords Changed Succesfully"})
        }
    } catch (error) {
        console.log(error.message)
        res.redirect('/error-page')
    }
}


const loadHome = async (req, res) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id })
        const books = await Book.find({ isDeleted: 0 })
        res.render('home', { user: userData, books })
    } catch (error) {
        console.log(error.message)
        res.redirect('/error-page')
    }
}



const userLogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
        res.redirect('/error-page')
    }
}

const loadError = async(req, res)=>{
    try {
        res.render('error-page')
    } catch(error) {
        console.log(error.message)
    }
}

module.exports = {
    loadSignup,
    userRegistration,
    loadLogin,
    verifyLogin,
    loadVerifyOTP,
    verifyOTP,
    loadLoginWithOTP,
    processMobileAuth,
    loadForgotPW,
    processForgotPW,
    loadResetPW,
    processResetPW,
    loadHome,
    userLogout,
    loadError
}