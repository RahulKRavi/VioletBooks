const { User, Address } = require('../models/userModel')
const { Genre, Author, Book } = require('../models/bookModel'); 
const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')


const insertToCart = async (req, res) => {
    try {
        const genres = await Genre.find()
        const id = req.body.book_id;
        const book = await Book.findById(id);       
        if (!book) {
            return res.status(404).send('Book not found');
        }
        const userId = req.session.user_id; 
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [],
                total: 0
            });
        }
        const existingCartItem = cart.items.find(item => item.product.toString() === id);
        if (existingCartItem) {
            existingCartItem.quantity++;
            existingCartItem.price += parseInt(book.price);
        } else {
            cart.items.push({
                product: id,
                quantity: 1, 
                price: book.price 
            });
        }
        cart.total += parseInt(book.price);
        cart.amount = cart.total-cart.discount;
        await cart.save();
        let cartData = await Cart.findOne({ user: userId }).populate('items.product');
        res.render('cart', {cart:cartData, genres})
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const loadCart = async (req, res) => {
    try {
        const genres = await Genre.find()
        const userId = req.session.user_id; 
        let cartData = await Cart.findOne({ user: userId }).populate('items.product');
        res.render('cart', {cart:cartData, genres});
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const removeItem = async (req, res) => {
    try{
        const id = req.query.id;
        const userId = req.session.user_id;
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
          console.log(`User with ID ${userId} not found.`);
          return;
        }
      
        const itemToRemove = cart.items.find(item => item._id.toString() === id);
      
        if (!itemToRemove) {
          console.log(`Item with product ID ${id} not found in the cart.`);
          return;
        }
      
        const priceOfItemToRemove = itemToRemove.price;
        const cartData = await Cart.findOneAndUpdate({user:userId},{ $pull: { items: { _id:id} }},{ new: true }). populate('items.product')
        cartData.total -=parseInt(priceOfItemToRemove)
        await cartData.save()
        if(cartData){
            res.render('cart', {cart:cartData})
        }
        else{
            res.render('cart', {cart:cartData})
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

const loadListCouponsForAdmin = async (req, res) => {
    try {
        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }
        let query = {};
        if (search) {
            query.$or = [
                { code: { $regex: '.*' + search + '.*' } }
            ];
        }
        const couponData = await Coupon.find(query);
        res.render('list-coupons', { coupons: couponData });
    } 
    catch (error) {
        console.log(error.message);
    }
};

const loadAddCoupon = async (req,res)=>{
    try {
        res.render('add-coupon')  
    } catch (error) {
        console.log(error.nessage)
    }
}

const addCoupon = async(req,res)=>{
    try {
        const existCoupon = await Coupon.findOne({code:req.body.code})
        if(existCoupon){
            console.log('Coupon already exists')
            return res.render('add-coupon', {message:'Coupon already exists'})
        }
        const newCoupon = new Coupon({  
            code: req.body.code,
            discount: req.body.discount
        })
        const couponData = await newCoupon.save()
        if(couponData){
            res.redirect('/admin/list-coupons')
        }
        else{
            res.render('add-coupon', {message:'Unable to add New Coupon'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const deactivateCoupon = async(req,res)=>{
    try{
         await Coupon.findByIdAndUpdate({_id:req.query.id},{$set:{isActive:0}})
         res.redirect('/admin/list-coupons')
    }
    catch(error){
        console.log(error.message);
    }
}

const reactivateCoupon = async(req,res)=>{
    try{
         await Coupon.findByIdAndUpdate({_id:req.query.id},{$set:{isActive:1}})
         res.redirect('/admin/list-coupons')
    }
    catch(error){
        console.log(error.message);
    }
}
module.exports = {
    insertToCart,
    loadCart,
    removeItem,
    loadListCouponsForAdmin,
    loadAddCoupon,
    addCoupon,
    deactivateCoupon,
    reactivateCoupon
}
