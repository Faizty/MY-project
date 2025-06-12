package com.example.today.Repository;

import com.example.today.Model.Cart;
import com.example.today.Model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCart(Cart cart);
    Optional<CartItem> findByIdAndCartId(Long id, Long cartId);
    void deleteByCartId(Long cartId);
    int countByCartId(Long cartId);
}