class UserDTO {
    constructor(user) {
        this.id = user._id;
        this.name = user.name;
        this.email = user.email;
        this.role = user.role;
        this.wishlist = user.wishlist;
        this.createdAt = user.createdAt;
    }
}

class AuthDTO {
    constructor(user, token) {
        this.id = user._id;
        this.name = user.name;
        this.email = user.email;
        this.role = user.role;
        this.token = token;
    }
}

module.exports = { UserDTO, AuthDTO };