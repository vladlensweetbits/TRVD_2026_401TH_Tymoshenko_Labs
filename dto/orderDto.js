class OrderItemDTO {
    constructor(item) {
        this.product = item.product;
        this.quantity = item.quantity;
        this.price = item.price;
    }
}

class OrderDTO {
    constructor(order) {
        this.id = order._id;
        this.user = order.user;
        this.items = order.items.map(item => new OrderItemDTO(item));
        this.totalPrice = order.totalPrice;
        this.status = order.status;
        this.isPaid = order.isPaid;
        this.address = order.address;
        this.createdAt = order.createdAt;
    }
}

module.exports = { OrderDTO };