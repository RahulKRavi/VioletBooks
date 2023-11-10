const express = require('express')
const admin_route = express()


admin_route.set('view engine', 'ejs')
admin_route.set('views', './views/admin')
admin_route.use(express.static('public'))
admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}))


const nocache = require('nocache')
admin_route.use(nocache())


const config = require('../config/sessionConfig')
const session = require('express-session')
admin_route.use(session({
    secret:config.sessionSecret,
    saveUninitialized:true,
    resave:false
}))


const auth = require('../middlewares/adminAuth')
const { authorUpload,bookUpload,bannerUpload } = require('../config/multerConfig')
const adminAuthController = require('../controllers/adminAuthController')
const genreController = require('../controllers/genreController')
const authorController = require('../controllers/authorController')
const bookController = require('../controllers/bookController')
const bannerController = require('../controllers/bannerController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')



admin_route.get('/', auth.isLogout, adminAuthController.loadLogin)
admin_route.post('/', adminAuthController.verifyLogin)
admin_route.get('/home', auth.isLogin, adminAuthController.loadHome)
admin_route.get('/list-users', auth.isLogin, adminAuthController.loadListUsers)
admin_route.get('/deactivate-user', auth.isLogin, adminAuthController.deactivateUser)
admin_route.get('/reactivate-user', auth.isLogin, adminAuthController.reactivateUser)
admin_route.get('/error-page', auth.isLogin, adminAuthController.loadError)


admin_route.get('/list-genres', auth.isLogin, genreController.loadListGenresForAdmin)
admin_route.get('/add-genre', auth.isLogin, genreController.loadAddGenre)
admin_route.post('/add-genre', genreController.addGenre)
admin_route.get('/edit-genre', auth.isLogin, genreController.loadEditGenre)
admin_route.post('/edit-genre', genreController.editGenre)
admin_route.get('/deactivate-genre', auth.isLogin, genreController.deactivateGenre)
admin_route.get('/reactivate-genre', auth.isLogin, genreController.reactivateGenre)

admin_route.get('/list-authors', auth.isLogin, authorController.loadListAuthorsForAdmin)
admin_route.get('/add-author', auth.isLogin, authorController.loadAddAuthor)
admin_route.post('/add-author', authorUpload.single('image'), authorController.addAuthor)
admin_route.get('/edit-author', auth.isLogin, authorController.loadEditAuthor)
admin_route.post('/edit-author', authorUpload.single('image'), authorController.editAuthor)
admin_route.get('/deactivate-author', auth.isLogin, authorController.deactivateAuthor)
admin_route.get('/reactivate-author', auth.isLogin, authorController.reactivateAuthor)

admin_route.get('/list-books', auth.isLogin, bookController.loadListBooksForAdmin)
admin_route.get('/add-book', auth.isLogin, bookController.loadAddBook)
admin_route.post('/add-book', bookUpload.single('image'), bookController.addBook)
admin_route.get('/edit-book', auth.isLogin, bookController.loadEditBook)
admin_route.post('/edit-book', bookUpload.single('image'), bookController.editBook)
admin_route.get('/deactivate-book', auth.isLogin, bookController.deactivateBook)
admin_route.get('/reactivate-book', auth.isLogin, bookController.reactivateBook)

admin_route.get('/list-banners', auth.isLogin, bannerController.loadListBannersForAdmin)
admin_route.get('/add-banner', auth.isLogin, bannerController.loadAddBanner)
admin_route.post('/add-banner', bannerUpload.single('image'), bannerController.addBanner)
admin_route.get('/edit-banner', auth.isLogin, bannerController.loadEditBanner)
admin_route.post('/edit-banner', bannerUpload.single('image'), bannerController.editBanner)
admin_route.get('/deactivate-banner', auth.isLogin, bannerController.deactivateBanner)
admin_route.get('/reactivate-banner', auth.isLogin, bannerController.reactivateBanner)

admin_route.get('/list-orders', auth.isLogin, orderController.loadListOrdersForAdmin)
admin_route.get('/view-order', auth.isLogin, orderController.loadViewOrder)
admin_route.get('/change-status', auth.isLogin, orderController.changeStatus)

admin_route.get('/list-coupons', auth.isLogin, cartController.loadListCouponsForAdmin)
admin_route.get('/add-coupon', auth.isLogin, cartController.loadAddCoupon)
admin_route.post('/add-coupon', cartController.addCoupon)
admin_route.get('/deactivate-coupon', auth.isLogin, cartController.deactivateCoupon)
admin_route.get('/reactivate-coupon', auth.isLogin, cartController.reactivateCoupon)

admin_route.get('/logout', auth.isLogin, adminAuthController.logout);
admin_route.get('*', (req, res) => {
    res.redirect('/404')
})


module.exports = admin_route