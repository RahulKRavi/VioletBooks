const { User, Address } = require('../models/userModel')
const { Book, Genre } = require('../models/bookModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');

const moment = require('moment')
const mongoose = require('mongoose');
require('dotenv').config();

const Razorpay = require('razorpay');
const { Title } = require('chart.js');

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const easyinvoice = require('easyinvoice');

//CONTROLLER FUNCTIONS FOR ADMIN SIDE

//Function to view the orders made by users for admin
const loadListOrdersForAdmin = async (req, res) => {
    try {
        const orders = await Order.aggregate([
        {
            $unwind: '$product'
        },
        {
            $sort: { orderDate: -1 }
        }
        ]);

        const orderData = orders.map((order) => {
            const formattedOrder = moment(order.orderDate).format('DD-MM-YYYY HH:mm');
            if (order.product.deliveryTime && moment(order.product.deliveryTime).isValid()){
                const formattedDelivery = moment(order.product.deliveryTime).format('DD-MM-YYYY HH:mm');
                return {
                    ...order,
                    orderDate: formattedOrder,
                    product: {
                        ...order.product,
                        deliveryTime: formattedDelivery
                    }
                };
            } else {
                return {
                    ...order,
                    orderDate: formattedOrder
                };
            }
        });


        res.render('list-orders', { orders: orderData });
    }
    catch (error) {
        console.log(error.message);
    }
};

const loadViewOrder = async(req, res) =>{
    try {
        const title = req.query.title;
        const orderId = new mongoose.Types.ObjectId(req.query.orderId);
        const orders = await Order.aggregate([
            { $unwind: '$product'},
            { $match: { _id: orderId, 'product.title': title }},
            { $limit: 1}     
        ])

        const orderData = orders.map((order) => {
            const formattedOrder = moment(order.orderDate).format('DD-MM-YYYY HH:mm');
            if (order.product.deliveryTime && moment(order.product.deliveryTime).isValid()){
                const formattedDelivery = moment(order.product.deliveryTime).format('DD-MM-YYYY HH:mm');
                return {
                    ...order,
                    orderDate: formattedOrder,
                    product: {
                        ...order.product,
                        deliveryTime: formattedDelivery
                    }
                };
            } else {
                return {
                    ...order,
                    orderDate: formattedOrder
                };
            }
        });

        if (orderData) {
            res.render('view-order', { orders: orderData })
        } else {
            res.render('home', { orders: orderData })
        }

    } catch(error){
        console.log(error)
    }
}
//Function to change the status of order by admin
const changeStatus = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.session.user_id);
        const title = req.query.title;
        const status = req.query.status;
        const orderId = new mongoose.Types.ObjectId(req.query.orderId);

        const order = await Order.aggregate([
            { $unwind: '$product'},
            { $match: { _id: orderId, 'product.title': title }},
            { $limit: 1}     
        ])
        if(status==="Cancelled"){
            if (order[0].paymentMethod === 'RazorPay' || order[0].paymentMethod === 'Wallet') {
                const refundAmount = order[0].product.price;
                const user = await User.findById(req.session.user_id);
                user.wallet += parseInt(refundAmount);
                await user.save();
            }
            const quantity = order[0].product.quantity
            await Book.findOneAndUpdate({title: title },{ $inc: { stock: quantity, totalSales: -quantity }});
        }

        let updateOperators = { $set: { 'product.$.orderStatus': status } };

        if (status === 'Delivered') {
            updateOperators.$set['product.$.deliveryTime'] = new Date();

            if (order[0].paymentMethod === 'COD') {
                updateOperators.$set['paymentStatus'] = 'Completed';
            }
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId, 'product.title': title },
            updateOperators,
            { new: true }
        );

        await updatedOrder.save()


        const orders = await Order.aggregate([
            { $unwind: '$product'},
            { $match: { _id: orderId, 'product.title': title }},
            { $limit: 1}     
        ])

        

        const orderData = orders.map((order) => {
            const formattedOrder = moment(order.orderDate).format('DD-MM-YYYY HH:mm');
            if (order.product.deliveryTime && moment(order.product.deliveryTime).isValid()){
                const formattedDelivery = moment(order.product.deliveryTime).format('DD-MM-YYYY HH:mm');
                return {
                    ...order,
                    orderDate: formattedOrder,
                    product: {
                        ...order.product,
                        deliveryTime: formattedDelivery
                    }
                };
            } else {
                return {
                    ...order,
                    orderDate: formattedOrder
                };
            }
        });
        

        if (orderData) {
            res.render('view-order', { orders: orderData })
        } else {
            res.render('view-order', { orders: orderData })
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

//CONTROLLER FUNCTIONS RELATED TO ORDERS FOR USER

//Function to load the checkout view page with the checkout details
const loadCheckout = async (req, res) => {
    try {
        const genres = await Genre.find()
        const userId = req.session.user_id;
        const addressId = req.query.id
        const userData = await User.findOne({ _id: userId })
        const addressData = await Address.findOne({ _id: addressId })
        const cartData = await Cart.findOne({ user: userId }).populate('items.product');
        res.render('checkout', { user: userData, address: addressData, cart: cartData, genres })
    } catch (error) {
        console.log(error.nessage)
    }
}

//Function to apply coupon
const applyCoupon = async (req, res) => {
    try {
        const couponCode = req.body.couponCode;
        const couponData = await Coupon.findOne({ code: couponCode });
        if (couponData) {
            const discount = couponData.discount;
            const cart = await Cart.findById({ _id: req.body.id })
            let orderTotal = cart.total;
            orderTotal -= discount;
            const cartData = await Cart.findByIdAndUpdate({ _id: req.body.id }, {
                $set: {
                    coupon: couponCode,
                    discount: discount,
                    amount: orderTotal,
                }
            }).populate('items.product');
        res.render('cart', { cart: cartData, message: "Coupon Applied Succefully" })
        }
        else {
            res.render('cart', { cart: cartData, message: "Invalid Coupon Code" })
        }
    } catch (error) {
        console.log(error.message)
    }
}

//Function to remove coupon
const removeCoupon = async (req, res) => {
    try {
        const couponCode = req.body.couponCode;
        const couponData = await Coupon.findOne({ code: couponCode });
        if (couponData) {

            const discount = couponData.discount;
            const cart = await Cart.findById({ _id: req.body.id })
            let orderTotal = cart.total;
            orderTotal -= discount;
            const cartData = await Cart.findByIdAndUpdate({ _id: req.body.id }, {
                $set: {
                    coupon: couponCode,
                    discount: discount,
                    amount: orderTotal,
                }
            }).populate('items.product');
            res.render('cart', { cart: cartData, message: "Coupon Applied Succefully" })

        } else {

            res.render('cart', { cart: cartData, message: "Invalid Coupon Code" })

        }
    } catch (error) {
        console.log(error.message)
    }
}

//Function to complete the order process by adding the user, address and product details to order database
const proceedToPayment = async (req, res) => {
    try {
        const genres = await Genre.find()
        const selectedUser = req.session.user_id;
        const selectedAddress = req.body.address_id;
        const selectedCart = req.body.cart_id;

        const userDocument = await User.findById(selectedUser);
        const addressDocument = await Address.findById(selectedAddress);
        const cartDocument = await Cart.findById(selectedCart).populate('items.product');

        const paymentMethod = req.body.payment_method

        // Calculate the order total
        let orderTotal = 0;
        const productDetailsArray = [];

        for (const cartItem of cartDocument.items) {
            const productDetails = {
                title: cartItem.product.title,
                image: cartItem.product.image,
                price: cartItem.product.price,
                quantity: cartItem.quantity,
                orderStatus: 'Pending',
            };

            orderTotal += parseFloat(cartItem.product.price) * cartItem.quantity;
            productDetailsArray.push(productDetails);

            await Book.findOneAndUpdate({ _id: cartItem.product },{ $inc: { stock: -cartItem.quantity, totalSales:cartItem.quantity }});
        }


        const newOrder = new Order({
            user: userDocument,
            address: {
                fname: addressDocument.fname,
                lname: addressDocument.lname,
                house: addressDocument.house,
                street: addressDocument.street,
                city: addressDocument.city,
                pin: addressDocument.pin,
                district: addressDocument.district,
                phone: addressDocument.phone,
            },
            product: productDetailsArray,
            orderTotal: orderTotal,
            paymentMethod: paymentMethod,
            paymentStatus: 'Pending'
        });

        const orderData = await newOrder.save();


        await Cart.updateOne({ _id: selectedCart },{
            $set: {
                items: [],
                total: 0,
                discount: 0,
                amount: 0,
            },
        });

        if (req.body.payment_method === 'COD') {
            res.redirect('order-success');
        } else if (req.body.payment_method === 'RazorPay') {
            const options = {
                amount: orderTotal * 100, // Amount in paise (Indian currency)
                currency: 'INR',
                receipt: `order_rcptid_${orderData._id}`, // Use a unique receipt ID
            };

            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.error('Razorpay order creation error:', err);
                    return res.render('checkout', { message: 'Unable to create Razorpay order' });
                }
                const orderId = order.id
                res.render('razorpay-view', { orderId: orderId, orderTotal })
            });
        } else {
            console.log("Invalid payment method")
            res.render('checkout', { message: 'Invalid payment method' });
        }
        
    } catch (error) {
        console.error(error.message);
        res.render('checkout', { message: 'Something went wrong' });
    }
};

//Function to load the success view page
const loadOrderSuccess = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const paymentId = req.query.paymentId;
        res.render('order-success')
    } catch (error) {
        console.log(error.nessage)
    }
}

const loadOrderFailure = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        res.render('order-failure')
    } catch (error) {
        console.log(error.nessage)
    }
}

const loadRazorPay = async (req, res) => {
    try {
        res.render('razorpay-view')
    } catch (error) {
        console.log(error.nessage)
    }
}

//Function to load the my-orders view page with the previous and current order details
const loadMyOrders = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.session.user_id)

        const orders = await Order.aggregate([
            {
            $match: { user: userId }
            },
            {
                $unwind: '$product'
            },
            {
                $sort: { orderDate: -1 }
            }
        ])

        const orderData = orders.map((order) => {
            const formattedOrder = moment(order.orderDate).format('DD-MM-YYYY HH:mm');
            if (order.product.deliveryTime && moment(order.product.deliveryTime).isValid()){
                const formattedDelivery = moment(order.product.deliveryTime).format('DD-MM-YYYY HH:mm');
                return {
                    ...order,
                    orderDate: formattedOrder,
                    product: {
                        ...order.product,
                        deliveryTime: formattedDelivery
                    }
                };
            } else {
                return {
                    ...order,
                    orderDate: formattedOrder
                };
            }
        });


        if (orderData) {
            res.render('my-orders', { orders: orderData })
        } else {
            res.render('my-orders', { orders: orderData })
        }

    } catch (error) {
        console.log(error.message)
    }
}

const loadOrderDetails = async(req, res) =>{
    try {
        const title = req.query.title;
        const orderId = new mongoose.Types.ObjectId(req.query.orderId);
        const orders = await Order.aggregate([
            { $unwind: '$product'},
            { $match: { _id: orderId, 'product.title': title }},
            { $limit: 1}     
        ])

        const orderData = orders.map((order) => {
            const formattedOrder = moment(order.orderDate).format('DD-MM-YYYY HH:mm');
            if (order.product.deliveryTime && moment(order.product.deliveryTime).isValid()){
                const formattedDelivery = moment(order.product.deliveryTime).format('DD-MM-YYYY HH:mm');
                return {
                    ...order,
                    orderDate: formattedOrder,
                    product: {
                        ...order.product,
                        deliveryTime: formattedDelivery
                    }
                };
            } else {
                return {
                    ...order,
                    orderDate: formattedOrder
                };
            }
        });


        if (orderData) {
            res.render('order-details', { orders: orderData })
        } else {
            res.render('order-details', { orders: orderData })
        }

    } catch(error){
        console.log(error)
    }
}
//Function to Cancel an order recently placed
const cancelOrder = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.session.user_id);
        const title = req.query.title;
        const orderId = new mongoose.Types.ObjectId(req.query.orderId);

        const order = await Order.aggregate([
            { $unwind: '$product'},
            { $match: { _id: orderId, 'product.title': title }},
            { $limit: 1}     
        ])

        if (order[0].paymentMethod === 'RazorPay' || order[0].paymentMethod === 'Wallet') {
            const refundAmount = order[0].product.price;
            const user = await User.findById(req.session.user_id);
            
            console.log("USER ID:"+ req.session.user_id)
            console.log("USER WALLET:"+ user.wallet)
            console.log("REFUND AMOUNT:"+ refundAmount )

            user.wallet += parseInt(refundAmount);

            console.log("USER WALLET:"+ user.wallet)
            await user.save();
        }
        const quantity = order[0].product.quantity
        await Book.findOneAndUpdate({title: title },{ $inc: { stock: quantity, totalSales: -quantity }});

        order[0].product.orderStatus = 'Cancelled';

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId, 'product.title': title },
            { $set: { 'product.$.orderStatus': 'Cancelled' } },
            { new: true }
        );

        const orders = await Order.aggregate([
            { $match: { user: userId } },
            { $unwind: '$product' },
            {
                $sort: { orderDate: -1 }
            }
        ]);

        

        const orderData = orders.map((order) => {
            const formattedOrder = moment(order.orderDate).format('DD-MM-YYYY HH:mm');
            if (order.product.deliveryTime && moment(order.product.deliveryTime).isValid()){
                const formattedDelivery = moment(order.product.deliveryTime).format('DD-MM-YYYY HH:mm');
                return {
                    ...order,
                    orderDate: formattedOrder,
                    product: {
                        ...order.product,
                        deliveryTime: formattedDelivery
                    }
                };
            } else {
                return {
                    ...order,
                    orderDate: formattedOrder
                };
            }
        });


        if (orderData) {
            res.render('my-orders', { orders: orderData })
        } else {
            res.render('my-orders', { orders: orderData })
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const downloadInvoice = async(req, res) =>{
    try {
        var data = {};
        const elementId = 'pdf';
        const result = await easyinvoice.createInvoice(data);
        await easyinvoice.render(elementId, result.pdf);
    } catch {
        console.log(error)
    }
}


module.exports = {
  loadListOrdersForAdmin,
  loadViewOrder,
  changeStatus,
  loadCheckout,
  applyCoupon,
  proceedToPayment,
  loadOrderSuccess,
  loadOrderFailure,
  loadRazorPay,
  loadMyOrders,
  loadOrderDetails,
  cancelOrder,
  downloadInvoice
}