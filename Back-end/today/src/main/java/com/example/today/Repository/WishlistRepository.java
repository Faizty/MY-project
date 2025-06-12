package com.example.today.Repository;

import com.example.today.Model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUserId(Long userId);
    Optional<WishlistItem> findByUserIdAndProductId(Long userId, String productId);
    void deleteByUserIdAndProductId(Long userId, String productId);
}