package com.redtape.repository;

import com.redtape.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    /**
     * Find cart by user email
     */
    Optional<Cart> findByUserEmail(String userEmail);
    
    /**
     * Check if cart exists for user email
     */
    boolean existsByUserEmail(String userEmail);
    
    /**
     * Delete cart by user email
     */
    void deleteByUserEmail(String userEmail);
    
    /**
     * Find cart with items by user email
     */
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items ci LEFT JOIN FETCH ci.product WHERE c.userEmail = :userEmail")
    Optional<Cart> findByUserEmailWithItems(@Param("userEmail") String userEmail);
}
