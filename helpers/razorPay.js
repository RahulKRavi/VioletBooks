const Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: 'YOUR_KEY_ID',
    key_secret: 'YOUR_KEY_SECRET',
});

var options = {
    amount: 50000,
    currency: "INR",
    receipt: "order_rcptid_11"
};
instance.orders.create(options, function(err, order) {
    console.log(order);
});