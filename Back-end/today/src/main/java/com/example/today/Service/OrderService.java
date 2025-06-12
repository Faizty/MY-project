package com.example.today.Service;

import com.example.today.Model.*;
import com.example.today.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        ProductRepository productRepository,
                        CartService cartService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
    }

    @Transactional
    public Order createOrder(Long userId, String shippingAddress, String paymentMethod, List<OrderItemRequest> items) {
        Order order = new Order();
        order.setUserId(userId);
        order.setShippingAddress(shippingAddress);
        order.setPaymentMethod(paymentMethod);
        order.setStatus("pending");
        order.setCreatedAt(Instant.now());

        List<OrderItem> orderItems = new ArrayList<>();
        double totalPrice = 0.0;

        for (OrderItemRequest itemRequest : items) {
            Product product = productRepository.findById(String.valueOf(itemRequest.getProductId()))
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(Long.valueOf(product.getId()));
            orderItem.setSellerId(product.getSeller_id());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItem.setImage(product.getImage());
            orderItem.setName(product.getName());
            totalPrice += product.getPrice() * itemRequest.getQuantity();
            orderItems.add(orderItem);

            // Update product stock
            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);
        }

        order.setTotalPrice(totalPrice);
        order.setOrderItems(orderItems);
        orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);
        cartService.clearCart(userId);
        return order;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Validate status transition
        if (!isValidStatusTransition(order.getStatus(), newStatus)) {
            throw new RuntimeException("Invalid status transition from " + order.getStatus() + " to " + newStatus);
        }

        // Handle stock changes for specific status transitions
        if (newStatus.equals("cancelled") && !order.getStatus().equals("cancelled")) {
            restoreProductStock(order);
        } else if (newStatus.equals("sold") && order.getStatus().equals("pending")) {
            validateProductStock(order);
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        // Define allowed status transitions
        Map<String, Set<String>> allowedTransitions = Map.of(
                "pending", Set.of("sold", "cancelled"),
                "sold", Set.of("shipped", "cancelled"),
                "shipped", Set.of("delivered"),
                "cancelled", Set.of("pending")
        );
        return allowedTransitions.getOrDefault(currentStatus, Set.of()).contains(newStatus);
    }

    private void restoreProductStock(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            Product product = productRepository.findById(String.valueOf(item.getProductId()))
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
    }

    private void validateProductStock(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            Product product = productRepository.findById(String.valueOf(item.getProductId()))
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            if (product.getStock() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
        }
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Optional<Order> getOrderById(Long orderId) {
        return orderRepository.findById(orderId);
    }

    public List<OrderItem> getOrderItemsBySeller(Long sellerId) {
        return orderItemRepository.findBySellerId(sellerId);
    }

    public static class OrderItemRequest {
        private Long productId;
        private int quantity;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}