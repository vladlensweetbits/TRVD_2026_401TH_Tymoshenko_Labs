const User = require('../models/User');

class UserRepository {
    async create(userData) {
        const user = new User(userData);
        return await user.save();
    }

    async findById(id) {
        return await User.findById(id).select('-password');
    }

    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async findAll() {
        return await User.find().select('-password');
    }

    async update(id, updateData) {
        return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    }

    async delete(id) {
        return await User.findByIdAndDelete(id);
    }

    async addToWishlist(userId, productId) {
        return await User.findByIdAndUpdate(
            userId,
            { $addToSet: { wishlist: productId } },
            { new: true }
        );
    }

    async removeFromWishlist(userId, productId) {
        return await User.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: productId } },
            { new: true }
        );
    }
}

module.exports = new UserRepository();