const userService = require('../services/UserService');
const { toUserDTO, toAuthDTO, toUserDTOList } = require('../mappers/userMapper');

class UserController {
    async register(req, res) {
        try {
            const user = await userService.register(req.body);
            res.status(201).json({ success: true, data: toUserDTO(user) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { user, token } = await userService.login(email, password);
            res.status(200).json({ success: true, data: toAuthDTO(user, token) });
        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    }

    async getUserById(req, res) {
        try {
            const user = await userService.getUserById(req.params.id);
            res.status(200).json({ success: true, data: toUserDTO(user) });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await userService.getAllUsers();
            res.status(200).json({ success: true, data: toUserDTOList(users) });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            const user = await userService.updateUser(req.params.id, req.body);
            res.status(200).json({ success: true, data: toUserDTO(user) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            await userService.deleteUser(req.params.id);
            res.status(200).json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async addToWishlist(req, res) {
        try {
            const user = await userService.addToWishlist(req.params.id, req.body.productId);
            res.status(200).json({ success: true, data: toUserDTO(user) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async removeFromWishlist(req, res) {
        try {
            const user = await userService.removeFromWishlist(req.params.id, req.body.productId);
            res.status(200).json({ success: true, data: toUserDTO(user) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateRole(req, res) {
        try {
            const user = await userService.updateUser(req.params.id, { role: req.body.role });
            res.status(200).json({ success: true, data: toUserDTO(user) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async searchUsers(req, res) {
        try {
            const users = await userService.getAllUsers();
            const query = (req.query.q || '').toLowerCase();
            const filtered = users.filter(u =>
                u.name?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query)
            );
            res.status(200).json({ success: true, data: toUserDTOList(filtered) });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new UserController();