package com.example.today.Service;

import com.example.today.Model.Product;
import com.example.today.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Product productDetails) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Update only fields present in the request
        if (productDetails.getName() != null) existingProduct.setName(productDetails.getName());
        if (productDetails.getDescription() != null) existingProduct.setDescription(productDetails.getDescription());
        if (productDetails.getFullDescription() != null) existingProduct.setFullDescription(productDetails.getFullDescription());
        if (productDetails.getPrice() != null) existingProduct.setPrice(productDetails.getPrice());
        if (productDetails.getDiscount() != null) existingProduct.setDiscount(productDetails.getDiscount());
        if (productDetails.getImage() != null) existingProduct.setImage(productDetails.getImage());
        if (productDetails.getImages() != null) existingProduct.setImages(productDetails.getImages());
        if (productDetails.getCategory() != null) existingProduct.setCategory(productDetails.getCategory());
        if (productDetails.getBrand() != null) existingProduct.setBrand(productDetails.getBrand());
        if (productDetails.getRating() != null) existingProduct.setRating(productDetails.getRating());
        if (productDetails.getReviews() != null) existingProduct.setReviews(productDetails.getReviews());
        if (productDetails.getStock() != null) existingProduct.setStock(productDetails.getStock());
        if (productDetails.getSpecifications() != null) existingProduct.setSpecifications(productDetails.getSpecifications());
        if (productDetails.getSeller_id() != null) existingProduct.setSeller_id(productDetails.getSeller_id());

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }
}