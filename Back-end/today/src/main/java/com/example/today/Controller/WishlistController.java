package com.example.today.Controller;

import com.example.today.Model.WishlistItem;
import com.example.today.Service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.example.today.Model.User;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {
    private final WishlistService wishlistService;

    @Autowired
    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    // Add to wishlist (requires Content-Type: application/json)
    @PostMapping("/items")
    public ResponseEntity<Map<String, Object>> addToWishlist(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Long> request) {

        Long productId = request.get("product_id");
        WishlistItem item = wishlistService.addItemToWishlist(user.getId(), String.valueOf(productId));

        return ResponseEntity.ok(buildWishlistItemResponse(item));
    }

    // Get wishlist (only requires Authorization header)
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getWishlist(
            @AuthenticationPrincipal User user) {

        List<WishlistItem> wishlist = wishlistService.getWishlist(user.getId());

        List<Map<String, Object>> response = wishlist.stream()
                .map(this::buildWishlistItemResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Remove from wishlist (only requires Authorization header)
    @DeleteMapping("/items/{product_id}")
    public ResponseEntity<Map<String, Object>> removeFromWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable("product_id") Long productId) {

        wishlistService.removeItemFromWishlist(user.getId(), productId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Product removed from wishlist successfully");
        response.put("product_id", productId);

        return ResponseEntity.ok(response);
    }

    // Response builder method
    private Map<String, Object> buildWishlistItemResponse(WishlistItem item) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", item.getId());
        response.put("user_id", item.getUserId());
        response.put("product_id", item.getProduct().getId());
        response.put("created_at", item.getCreatedAt());

        // Build product details
        Map<String, Object> productDetails = new HashMap<>();
        productDetails.put("id", item.getProduct().getId());
        productDetails.put("name", item.getProduct().getName());
        productDetails.put("description", item.getProduct().getDescription());
        productDetails.put("price", item.getProduct().getPrice());
        productDetails.put("discount", item.getProduct().getDiscount());
        productDetails.put("image", item.getProduct().getImage());
        productDetails.put("category", item.getProduct().getCategory());
        productDetails.put("brand", item.getProduct().getBrand());
        productDetails.put("rating", item.getProduct().getRating());
        productDetails.put("stock", item.getProduct().getStock());

        response.put("product", productDetails);
        return response;
    }
}