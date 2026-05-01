const { OrderDTO } = require('../dto/orderDto');

const toOrderDTO = (order) => new OrderDTO(order);

const toOrderDTOList = (orders) => orders.map(toOrderDTO);

module.exports = { toOrderDTO, toOrderDTOList };