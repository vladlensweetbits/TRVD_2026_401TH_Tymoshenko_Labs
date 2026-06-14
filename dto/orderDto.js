class OrderItemDTO {
    constructor(item) {
        this.product = item.product && typeof item.product === 'object' ? {
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            images: item.product.images || [],
        } : item.product;
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
        this.address = {
            street: order.address?.street,
            city: order.address?.city,
            zip: order.address?.zip,
            phone: order.address?.phone,
        };
        this.createdAt = order.createdAt;
    }
}

module.exports = { OrderDTO };