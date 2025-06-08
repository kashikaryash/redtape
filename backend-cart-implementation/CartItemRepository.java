package com.redtape.repository;

import com.redtape.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    /**
     * Find cart item by cart ID and product model number
     */
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.modelNo = :modelNo")
    Optional<CartItem> findByCartIdAndProductModelNo(@Param("cartId") Long cartId, @Param("modelNo") String modelNo);
    
    /**
     * Find all cart items by cart ID
     */
    List<CartItem> findByCartId(Long cartId);
    
    /**
     * Delete all cart items by cart ID
     */
    void deleteByCartId(Long cartId);
    
    /**
     * Find cart item by ID and cart user email (for security)
     */
    @Query("SELECT ci FROM CartItem ci WHERE ci.id = :itemId AND ci.cart.userEmail = :userEmail")
    Optional<CartItem> findByIdAndCartUserEmail(@Param("itemId") Long itemId, @Param("userEmail") String userEmail);
}
