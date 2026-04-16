const userRepository = require('../repositories/UserRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserService {
    async register(userData) {
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const user = await userRepository.create({
            ...userData,
            password: hashedPassword
        });

        return user;
    }

    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '60m' }
        );  

        return { user, token };
    }

    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async getAllUsers() {
        return await userRepository.findAll();
    }

    async updateUser(id, updateData) {
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const user = await userRepository.update(id, updateData);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async deleteUser(id) {
        const user = await userRepository.delete(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async addToWishlist(userId, productId) {
        return await userRepository.addToWishlist(userId, productId);
    }

    async removeFromWishlist(userId, productId) {
        return await userRepository.removeFromWishlist(userId, productId);
    }
}

module.exports = new UserService();