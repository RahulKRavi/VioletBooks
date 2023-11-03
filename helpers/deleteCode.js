const orderData = orders.map((order) => ({
    ...order.toObject(),
    orderDate: moment(order.orderDate).format('DD-MM-YYYY HH:mm:ss')
}));