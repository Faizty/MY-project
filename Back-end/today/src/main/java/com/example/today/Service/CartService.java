package com.example.today.Service;

import com.example.today.Model.*;
import com.example.today.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Autowired
    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));
    }

    private Cart createNewCart(Long userId) {
        Cart newCart = new Cart();
        newCart.setUserId(userId);
        newCart.setTotalItems(0);
        newCart.setSubtotal(0.0);
        return cartRepository.save(newCart);
    }

    @Transactional
    public Cart addItemToCart(Long userId, Long productId, int quantity) {
        Cart cart = getCartByUserId(userId);
        Product product = productRepository.findById(String.valueOf(productId))
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        // Check if item already exists
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            throw new RuntimeException("Product already in cart. Use update quantity instead.");
        } else {
            // Create new item
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        updateCartTotals(cart);
        return cart;
    }

    @Transactional
    public Cart updateCartItem(Long userId, Long cartItemId, int quantity) {
        if (quantity <= 0) {
            throw new RuntimeException("Invalid quantity");
        }

        Cart cart = getCartByUserId(userId);
        CartItem item = cartItemRepository.findByIdAndCartId(cartItemId, cart.getId())
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (item.getProduct().getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        updateCartTotals(cart);
        return cart;
    }

    @Transactional
    public Cart removeCartItem(Long userId, Long cartItemId) {
        Cart cart = getCartByUserId(userId);
        CartItem item = cartItemRepository.findByIdAndCartId(cartItemId, cart.getId())
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        updateCartTotals(cart);
        return cart;
    }

    public CartItem getCartItemById(Long cartItemId, Long userId) {
        Cart cart = getCartByUserId(userId);
        return cartItemRepository.findByIdAndCartId(cartItemId, cart.getId())
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
    }

    @Transactional
    public Cart clearCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();
        cart.setTotalItems(0);
        cart.setSubtotal(0.0);
        cartRepository.save(cart);
        return cart;
    }

    public CartValidationResult validateCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        CartValidationResult result = new CartValidationResult();
        result.setValid(true);
        result.setIssues(new ArrayList<>());

        for (CartItem item : cart.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElse(null);

            if (product == null) {
                result.addIssue(new CartIssue("out_of_stock", "Product no longer available", item));
                result.setValid(false);
            } else if (product.getStock() < item.getQuantity()) {
                result.addIssue(new CartIssue("insufficient_stock", "Not enough stock available", item));
                result.setValid(false);
            } else if (!product.getPrice().equals(item.getProduct().getPrice())) {
                result.addIssue(new CartIssue("price_changed", "Product price has changed", item));
                result.setValid(false);
            }
        }

        return result;
    }

    private void updateCartTotals(Cart cart) {
        int totalItems = 0;
        double subtotal = 0.0;

        for (CartItem item : cart.getItems()) {
            totalItems += item.getQuantity();
            subtotal += item.getProduct().getPrice() * item.getQuantity();
        }

        cart.setTotalItems(totalItems);
        cart.setSubtotal(subtotal);
        cartRepository.save(cart);
    }

    public static class CartValidationResult {
        private boolean valid;
        private List<CartIssue> issues;

        public boolean isValid() {
            return valid;
        }

        public void setValid(boolean valid) {
            this.valid = valid;
        }

        public List<CartIssue> getIssues() {
            return issues;
        }

        public void setIssues(List<CartIssue> issues) {
            this.issues = issues;
        }

        public void addIssue(CartIssue issue) {
            if (issues == null) {
                issues = new ArrayList<>();
            }
            issues.add(issue);
        }
    }

    public static class CartIssue {
        private String issueType;
        private String message;
        private CartItem item;

        public CartIssue(String issueType, String message, CartItem item) {
            this.issueType = issueType;
            this.message = message;
            this.item = item;
        }

        public String getIssueType() {
            return issueType;
        }

        public String getMessage() {
            return message;
        }

        public CartItem getItem() {
            return item;
        }
    }
}