package com.example.today.Controller;

import com.example.today.Model.*;
import com.example.today.Service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.example.today.Model.User;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;

    @Autowired
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCart(@AuthenticationPrincipal User user) {
        Cart cart = cartService.getCartByUserId(user.getId());
        return buildSuccessCartResponse(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<Map<String, Object>> addItemToCart(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> request) {

        Long productId = Long.valueOf(request.get("product_id").toString());
        int quantity = (int) request.get("quantity");

        try {
            Cart cart = cartService.addItemToCart(user.getId(), productId, quantity);
            return buildSuccessCartResponse(cart, "Item added to cart successfully");
        } catch (RuntimeException e) {
            return handleCartError(e);
        }
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<Map<String, Object>> updateCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long cartItemId,
            @RequestBody Map<String, Integer> request) {

        int quantity = request.get("quantity");

        try {
            Cart cart = cartService.updateCartItem(user.getId(), cartItemId, quantity);
            return buildSuccessCartResponse(cart, "Cart item updated successfully");
        } catch (RuntimeException e) {
            return handleCartError(e);
        }
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Map<String, Object>> removeCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long cartItemId) {

        try {
            CartItem item = cartService.getCartItemById(cartItemId, user.getId());
            Cart cart = cartService.removeCartItem(user.getId(), cartItemId);

            Map<String, Object> response = buildSuccessCartResponse(cart).getBody();
            response.put("message", "Item removed from cart successfully");

            Map<String, Object> removedItem = new HashMap<>();
            removedItem.put("id", item.getId());
            removedItem.put("product_id", item.getProduct().getId());
            removedItem.put("product_name", item.getProduct().getName());
            removedItem.put("image_url", item.getProduct().getImage());
            removedItem.put("quantity", item.getQuantity());
            response.put("removed_item", removedItem);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return handleCartError(e);
        }
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> clearCart(@AuthenticationPrincipal User user) {
        Cart cart = cartService.clearCart(user.getId());

        Map<String, Object> response = buildSuccessCartResponse(cart).getBody();
        int itemCount = cart.getTotalItems();
        response.put("message", itemCount > 0 ? "Cart cleared successfully" : "Cart was already empty");
        response.put("cleared_items_count", itemCount);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateCart(@AuthenticationPrincipal User user) {
        CartService.CartValidationResult result = cartService.validateCart(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("validation", buildValidationResponse(result));
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> buildSuccessCartResponse(Cart cart) {
        return buildSuccessCartResponse(cart, null);
    }

    private ResponseEntity<Map<String, Object>> buildSuccessCartResponse(Cart cart, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("cart", buildCartResponse(cart));

        if (message != null) {
            response.put("message", message);
        }

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> buildCartResponse(Cart cart) {
        Map<String, Object> cartData = new HashMap<>();
        cartData.put("id", cart.getId());
        cartData.put("user_id", cart.getUserId());
        cartData.put("total_items", cart.getTotalItems());
        cartData.put("subtotal", cart.getSubtotal());
        cartData.put("created_at", cart.getCreatedAt());
        cartData.put("updated_at", cart.getUpdatedAt());

        List<Map<String, Object>> items = new ArrayList<>();
        for (CartItem item : cart.getItems()) {
            items.add(buildCartItemResponse(item));
        }
        cartData.put("items", items);

        return cartData;
    }

    private Map<String, Object> buildCartItemResponse(CartItem item) {
        Map<String, Object> itemData = new HashMap<>();
        itemData.put("id", item.getId());
        itemData.put("quantity", item.getQuantity());
        itemData.put("selected_color", item.getSelectedColor());
        itemData.put("added_at", item.getAddedAt());
        itemData.put("updated_at", item.getUpdatedAt());

        Map<String, Object> productData = new HashMap<>();
        Product product = item.getProduct();
        productData.put("id", product.getId());
        productData.put("name", product.getName());
        productData.put("description", product.getDescription());
        productData.put("price", product.getPrice());
        productData.put("image_url", product.getImage());
        productData.put("stock", product.getStock());
        productData.put("category", product.getCategory());
        productData.put("brand", product.getBrand());

        itemData.put("product", productData);
        return itemData;
    }

    private Map<String, Object> buildValidationResponse(CartService.CartValidationResult result) {
        Map<String, Object> validationData = new HashMap<>();
        validationData.put("valid", result.isValid());

        List<Map<String, Object>> issues = new ArrayList<>();
        if (result.getIssues() != null) {
            for (CartService.CartIssue issue : result.getIssues()) {
                Map<String, Object> issueData = new HashMap<>();
                issueData.put("issue_type", issue.getIssueType());
                issueData.put("message", issue.getMessage());
                issueData.put("cart_item", buildCartItemResponse(issue.getItem()));
                issues.add(issueData);
            }
        }
        validationData.put("issues", issues);

        return validationData;
    }

    private ResponseEntity<Map<String, Object>> handleCartError(RuntimeException e) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);

        if (e.getMessage().contains("not found")) {
            errorResponse.put("error", e.getMessage());
            errorResponse.put("error_code",
                    e.getMessage().contains("Product") ? "PRODUCT_NOT_FOUND" : "CART_ITEM_NOT_FOUND");
            return ResponseEntity.status(404).body(errorResponse);
        } else if (e.getMessage().contains("stock")) {
            errorResponse.put("error", e.getMessage());
            errorResponse.put("error_code", "INSUFFICIENT_STOCK");
            return ResponseEntity.status(400).body(errorResponse);
        } else if (e.getMessage().contains("Invalid quantity")) {
            errorResponse.put("error", e.getMessage());
            errorResponse.put("error_code", "INVALID_QUANTITY");
            return ResponseEntity.status(400).body(errorResponse);
        } else if (e.getMessage().contains("already in cart")) {
            errorResponse.put("error", e.getMessage());
            errorResponse.put("error_code", "PRODUCT_ALREADY_IN_CART");
            return ResponseEntity.status(400).body(errorResponse);
        } else {
            errorResponse.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}