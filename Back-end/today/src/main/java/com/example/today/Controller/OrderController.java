package com.example.today.Controller;

import com.example.today.Model.*;
import com.example.today.Repository.ProductRepository;
import com.example.today.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.example.today.Model.User;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final ProductRepository productRepository;

    @Autowired
    public OrderController(OrderService orderService, ProductRepository productRepository) {
        this.orderService = orderService;
        this.productRepository = productRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> request) {

        String shippingAddress = (String) request.get("shipping_address");
        String paymentMethod = (String) request.get("payment_method");
        List<Map<String, Object>> itemsMap = (List<Map<String, Object>>) request.get("items");

        List<OrderService.OrderItemRequest> items = itemsMap.stream().map(item -> {
            OrderService.OrderItemRequest itemRequest = new OrderService.OrderItemRequest();
            itemRequest.setProductId(Long.valueOf(item.get("product_id").toString()));
            itemRequest.setQuantity((Integer) item.get("quantity"));
            return itemRequest;
        }).collect(Collectors.toList());

        Order order = orderService.createOrder(user.getId(), shippingAddress, paymentMethod, items);
        return ResponseEntity.ok(buildOrderResponse(order));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getOrders(
            @AuthenticationPrincipal User user) {
        List<Order> orders = orderService.getOrdersByUserId(user.getId());
        List<Map<String, Object>> response = orders.stream()
                .map(this::buildOrderResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {
        Optional<Order> order = orderService.getOrderById(orderId);
        if (order.isEmpty() || !order.get().getUserId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(buildOrderResponse(order.get()));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {

        String newStatus = request.get("status");
        Order updatedOrder = orderService.updateOrderStatus(orderId, newStatus);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Order status updated successfully");
        response.put("order_id", orderId);
        response.put("new_status", newStatus);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Map<String, Object>>> getOrdersBySeller(
            @AuthenticationPrincipal User user,
            @PathVariable Long sellerId) {
        if (!user.getId().equals(sellerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<OrderItem> orderItems = orderService.getOrderItemsBySeller(sellerId);
        List<Map<String, Object>> response = orderItems.stream().map(item -> {
            Map<String, Object> itemData = new HashMap<>();
            itemData.put("order_id", item.getOrder().getId());
            itemData.put("order_status", item.getOrder().getStatus()); // Status included here
            itemData.put("product_id", item.getProductId());
            itemData.put("quantity", item.getQuantity());
            itemData.put("price", item.getPrice());
            itemData.put("order_date", item.getOrder().getCreatedAt());

            Optional<Product> product = productRepository.findById(String.valueOf(item.getProductId()));
            if (product.isPresent()) {
                Map<String, Object> productData = new HashMap<>();
                productData.put("name", product.get().getName());
                productData.put("image", product.get().getImage());
                itemData.put("product", productData);
            }

            Map<String, Object> customerInfo = new HashMap<>();
            customerInfo.put("shipping_address", item.getOrder().getShippingAddress());
            itemData.put("customer_info", customerInfo);

            return itemData;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> buildOrderResponse(Order order) {
        Map<String, Object> orderData = new HashMap<>();
        orderData.put("id", order.getId());
        orderData.put("user_id", order.getUserId());
        orderData.put("total_price", order.getTotalPrice());
        orderData.put("shipping_address", order.getShippingAddress());
        orderData.put("payment_method", order.getPaymentMethod());
        orderData.put("status", order.getStatus());
        orderData.put("created_at", order.getCreatedAt());

        List<Map<String, Object>> orderItems = new ArrayList<>();
        for (OrderItem item : order.getOrderItems()) {
            Map<String, Object> itemData = new HashMap<>();
            itemData.put("id", item.getId());
            itemData.put("product_id", item.getProductId());
            itemData.put("seller_id", item.getSellerId());
            itemData.put("quantity", item.getQuantity());
            itemData.put("price", item.getPrice());
            itemData.put("image",item.getImage());
            itemData.put("name",item.getName());



            orderItems.add(itemData);
        }
        orderData.put("order_items", orderItems);

        return orderData;
    }
}