package com.example.today.Service;

import com.example.today.Model.Product;
import com.example.today.Model.WishlistItem;
import com.example.today.Repository.ProductRepository;
import com.example.today.Repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    @Autowired
    public WishlistService(WishlistRepository wishlistRepository,
                           ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public WishlistItem addItemToWishlist(Long userId, String productId) {
        // Check if already exists
        Optional<WishlistItem> existingItem = wishlistRepository.findByUserIdAndProductId(userId, productId);
        if (existingItem.isPresent()) {
            throw new RuntimeException("Product already in wishlist");
        }

        // Get product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Create new wishlist item
        WishlistItem newItem = new WishlistItem();
        newItem.setUserId(userId);
        newItem.setProduct(product);
        newItem.setCreatedAt(Instant.now());

        return wishlistRepository.save(newItem);
    }

    public List<WishlistItem> getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    @Transactional
    public void removeItemFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, String.valueOf(productId));
    }
}