const { User, Address } = require('../models/userModel')
const { Genre, Author, Book } = require('../models/bookModel'); 
const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')


const insertToCart = async (req, res) => {
    try {
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
                items: []
            });
        }
        const existingCartItem = cart.items.find(item => item.product.toString() === id);
        if (existingCartItem) {
            existingCartItem.quantity++;
            existingCartItem.price = parseInt(book.price)*existingCartItem.quantity;
        } else {
            cart.items.push({
                product: id,
                quantity: 1, 
                price:book.price
            });
        }
        const totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
        const amountToPay = totalPrice-cart.discount;
        await cart.save();
        let cartData = await Cart.findOne({ user: userId }).populate('items.product');
        res.render('cart', {cart:cartData, totalPrice, amountToPay})
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-page')
    }
};

const loadCart = async (req, res) => {
    try {
        const userId = req.session.user_id; 
        let cart = await Cart.findOne({ user: userId });
        const totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
        const amountToPay = totalPrice-cart.discount;
        let cartData = await Cart.findOne({ user: userId }).populate('items.product');
        res.render('cart', {cart:cartData,totalPrice,amountToPay});
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-page')

    }
};

const removeItem = async (req, res) => {
    try {
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
        const previousPrice = cart.items.reduce((total, item) => total + item.price, 0);
        const totalPrice = previousPrice - parseInt(priceOfItemToRemove)
        const amountToPay = totalPrice-cart.discount;
        await cartData.save()
        if (cartData) {
            res.render('cart', {cart:cartData,totalPrice,amountToPay})
        } else {
            res.render('cart', {cart:cartData})
        }
    } catch (error) {
        console.log(error.message)
        res.redirect('/error-page')
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
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-page')
    }
};

const loadAddCoupon = async (req,res)=>{
    try {
        res.render('add-coupon')  
    } catch (error) {
        console.log(error.nessage)
        res.redirect('/error-page')
    }
}

const addCoupon = async (req, res) => {
    try {
        const { code, discount, expirationDate, minimumOrderAmount, isActive } = req.body;

        // Validate if the required fields are present in the request
        if (!code || !discount || !expirationDate) {
            return res.status(400).render('add-coupon', { message: 'Code, discount, and expiration date are required' });
        }

        const existCoupon = await Coupon.findOne({ code });

        if (existCoupon) {
            console.log('Coupon already exists');
            return res.render('add-coupon', { message: 'Coupon already exists' });
        }

        const newCoupon = new Coupon({
            code,
            discount,
            expirationDate,
            minimumOrderAmount: minimumOrderAmount || 0, // Default to 0 if not provided
            isActive: isActive || 1, // Default to 1 if not provided
        });

        const couponData = await newCoupon.save();

        if (couponData) {
            res.render('add-coupon', { message: 'Coupon added successfully' });
        } else {
            res.render('add-coupon', { message: 'Unable to add new coupon' });
        }
    } catch (error) {
        console.error(error.message);
        res.redirect('/error-page');
    }
};



const deactivateCoupon = async(req,res)=>{
    try {
         await Coupon.findByIdAndUpdate({_id:req.query.id},{$set:{isActive:0}})
         res.redirect('/admin/list-coupons')
    } catch(error) {
        console.log(error.message);
        res.redirect('/error-page')
    }
}

const reactivateCoupon = async(req,res)=>{
    try {
         await Coupon.findByIdAndUpdate({_id:req.query.id},{$set:{isActive:1}})
         res.redirect('/admin/list-coupons')
    } catch(error) {
        console.log(error.message);
        res.redirect('/error-page')
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
