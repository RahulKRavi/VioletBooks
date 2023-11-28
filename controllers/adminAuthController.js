const { User } = require('../models/userModel')
const { Book } = require('../models/bookModel')
const Order = require('../models/orderModel')
const bcrypt = require('bcryptjs')


const loadLogin = async(req, res)=>{
    try {
        res.render('login')
    } catch(error) {
        console.log(error.message)
        res.redirect('/admin/error-page')
    }
}

const verifyLogin = async(req, res)=>{
    try {
        const inputEmail = req.body.email
        const inputPassword = req.body.password
        const userData = await User.findOne({email: inputEmail})
        if(userData){
            const passwordMatch = await bcrypt.compare(inputPassword, userData.password)
            if(passwordMatch){
                if(userData.is_admin == 0){
                    res.render('login', {message: "Sorry, this email is not associated with an admin account"})
                }
                else{
                    req.session.admin_id = userData._id
                    res.redirect('/admin/home')
                }
            }
            else{
                res.render('login', {message: "Oops, the password you entered is incorrect"})
            }
        }
        else{
            res.render('login', {message: "The email address you entered is not registered"})
        }
    } catch (error) {
        console.log(error.message)
        res.redirect('/admin/error-page')
    }
}

const loadHome = async(req, res)=>{
    try {
        const bestSellingBooks = await Book.find({ isDeleted: 0 })
            .sort({ totalSales: -1 })
            .limit(5);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const booksToday = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: today, // Find orders with an order date greater than or equal to today.
                    },
                },
            },
            {
                $unwind: { path: '$product', preserveNullAndEmptyArrays: true }, // Preserve documents with no products.
            },
            {
                $group: {
                    _id: null,
                    booksSoldToday: { $sum: { $ifNull: ['$product.quantity', 0] } }, // Use $ifNull to handle null values.
                },
            },
        ])



        const booksTotal = await Order.aggregate([
            {
                $unwind: { path: '$product', preserveNullAndEmptyArrays: true }, 
            },
            {
                $group: {
                    _id: null,
                    booksSoldTotal: {$sum: { $ifNull: ['$product.quantity', 0] } },
                },
            },
        ])



        const revenueToday = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: today, // Find orders with an order date greater than or equal to today.
                    },
                },
            },
            {
                $unwind: { path: '$product', preserveNullAndEmptyArrays: true },  // Split the product array into separate documents.
            },
            {
                $group: {
                    _id: null,
                    revenueToday: {$sum: { $ifNull: ['$totalPrice', 0] } },
                },
            },
        ])



        const revenueTotal = await Order.aggregate([
            {
                $unwind: { path: '$product', preserveNullAndEmptyArrays: true }, 
            },
            {
                $group: {
                    _id: null,
                    revenueTotal: {$sum: { $ifNull: ['$totalPrice', 0] } },
                },
            },
        ])


        res.render('home', {bestSelling:bestSellingBooks,booksToday, booksTotal, revenueToday, revenueTotal})
    } catch (error) {
        console.log(error.message)
        res.redirect('/admin/error-page')
    }
}

const loadListUsers = async(req, res)=>{
    try {
        var search='';
        if(req.query.search){
            search = req.query.search
        }
        const userData  = await User.find({
            is_admin:0,
            $or:[
                {fname:{$regex:'.*'+search+'.*'}},
                {lname:{$regex:'.*'+search+'.*'}},
                {email:{$regex:'.*'+search+'.*'}},
                {mobile:{$regex:'.*'+search+'.*'}}

             ]
        })
        res.render('list-users', {users:userData})  
    } catch (error){
        console.log(error.message)
        res.redirect('/admin/error-page')
    }
}

const deactivateUser = async(req,res)=>{
    try {
        await User.findByIdAndUpdate({_id:req.query.id},{$set:{is_blocked:1}})
        res.redirect('/admin/list-users')
    } catch (error){
        console.log(error.message);
        res.redirect('/admin/error-page')
    }
}

const reactivateUser = async(req,res)=>{
    try {
        await User.findByIdAndUpdate({_id:req.query.id},{$set:{is_blocked:0}})
        res.redirect('/admin/list-users')
    } catch (error){
        console.log(error.message);
        res.redirect('/admin/error-page')
    }
}

const logout = async(req, res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error){
        console.log(error.message)
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
    loadLogin,
    loadHome,
    loadListUsers,
    logout,
    verifyLogin,
    deactivateUser,
    reactivateUser,
    loadError
}

