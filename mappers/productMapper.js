const { ProductDTO } = require('../dto/productDto');

const toProductDTO = (product) => new ProductDTO(product);

const toProductDTOList = (products) => products.map(toProductDTO);

module.exports = { toProductDTO, toProductDTOList };