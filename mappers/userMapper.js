const { UserDTO, AuthDTO } = require('../dto/userDto');

const toUserDTO = (user) => new UserDTO(user);

const toAuthDTO = (user, token) => new AuthDTO(user, token);

const toUserDTOList = (users) => users.map(toUserDTO);

module.exports = { toUserDTO, toAuthDTO, toUserDTOList };