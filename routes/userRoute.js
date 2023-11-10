const express = require('express')
const user_route = express()

user_route.set('view engine', 'ejs')
user_route.set('views', './views/users')
user_route.use(express.static('public'))
user_route.use(express.json())
user_route.use(express.urlencoded({extended:true}))

const nocache = require('nocache')
user_route.use(nocache())

const config = require('../config/sessionConfig')
const session = require('express-session')
user_route.use(session({
    secret:config.sessionSecret,
    saveUninitialized:true,
    resave:false
}))
const { Genre } = require('../models/bookModel'); 

const auth = require('../middlewares/userAuth')
const userAuthController = require('../controllers/userAuthController')
const genreController = require('../controllers/genreController')
const bookController = require('../controllers/bookController')
const profileController = require('../controllers/profileController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')


user_route.get('/api/genres', async (req, res) => {
    try {
      const genres = await Genre.find({ isDeleted: 0 }); // Fetch non-deleted genres
      res.json(genres);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
user_route.get('/', auth.isLogout, userAuthController.loadLogin)
user_route.get('/signup', auth.isLogout, userAuthController.loadSignup)
user_route.post('/signup', userAuthController.userRegistration)
user_route.get('/login', auth.isLogout, userAuthController.loadLogin)
user_route.post('/login', userAuthController.verifyLogin)
user_route.get('/login-otp', userAuthController.loadLoginWithOTP)
user_route.post('/login-otp', userAuthController.processMobileAuth)
user_route.get('/forgot-pw', userAuthController.loadForgotPW)
user_route.post('/forgot-pw', userAuthController.processForgotPW)
user_route.get('/verify-otp', auth.isLogout, userAuthController.loadVerifyOTP);
user_route.post('/verify-otp', userAuthController.verifyOTP);
user_route.get('/reset-pw', userAuthController.loadResetPW)
user_route.post('/reset-pw', userAuthController.processResetPW)
user_route.get('/home', auth.isLogin, userAuthController.loadHome)
user_route.get('/logout', auth.isLogin, userAuthController.userLogout)
user_route.get('/error-page', userAuthController.loadError)


user_route.get('/my-account', auth.isLogin, profileController.loadMyAccount)
user_route.post('/my-account', auth.isLogin, profileController.editMyAccount)
user_route.get('/my-address', auth.isLogin, profileController.loadMyAddress)
user_route.get('/delete-address', auth.isLogin, profileController.deleteAddress)
user_route.get('/add-address', auth.isLogin, profileController.loadAddAddress)
user_route.post('/add-address', auth.isLogin, profileController.addAddress)
user_route.get('/edit-address', auth.isLogin, profileController.loadEditAddress)
user_route.post('/edit-address', auth.isLogin, profileController.editAddress)
user_route.get('/choose-address', auth.isLogin, profileController.loadChooseAddress)
user_route.get('/change-password', auth.isLogin, profileController.loadChangePassword)
user_route.post('/change-password', auth.isLogin, profileController.changePassword)

user_route.get('/view-genre', auth.isLogin, genreController.loadViewGenre)
user_route.get('/list-books', auth.isLogin, bookController.loadListBooksForUser)
user_route.get('/view-book', auth.isLogin, bookController.loadViewBook)

user_route.post('/view-book', auth.isLogin, cartController.insertToCart)
user_route.get('/cart', auth.isLogin, cartController.loadCart)
user_route.get('/remove-item', auth.isLogin, cartController.removeItem)


user_route.get('/checkout', auth.isLogin, orderController.loadCheckout)
user_route.post('/apply-coupon', auth.isLogin, orderController.applyCoupon)
user_route.post('/checkout', auth.isLogin, orderController.proceedToPayment)
user_route.get('/order-success', auth.isLogin, orderController.loadOrderSuccess)
user_route.get('/order-failure', auth.isLogin, orderController.loadOrderFailure)
user_route.get('/razorpay-view', auth.isLogin, orderController.loadRazorPay)
user_route.get('/my-orders', auth.isLogin, orderController.loadMyOrders)
user_route.get('/order-details', auth.isLogin, orderController.loadOrderDetails)
user_route.get('/cancel-order', auth.isLogin, orderController.cancelOrder)
user_route.get('/download-invoice', auth.isLogin, orderController.downloadInvoice)


user_route.get('*', (req, res) => {
  res.redirect('/404')
})



module.exports = user_route;