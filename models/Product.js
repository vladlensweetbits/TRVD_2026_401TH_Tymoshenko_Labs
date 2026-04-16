const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case', 'Cooling']
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    images: [{
        type: String
    }],
    specs: {
        type: Map,
        of: String
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);