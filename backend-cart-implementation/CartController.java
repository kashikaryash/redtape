package com.redtape.controller;

import com.redtape.model.Cart;
import com.redtape.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    /**
     * Get cart by user email
     * GET /api/cart/getCartByUserEmail/{email}
     */
    @GetMapping("/getCartByUserEmail/{email}")
    public ResponseEntity<?> getCartByUserEmail(@PathVariable String email) {
        try {
            Optional<Cart> cart = cartService.getCartByUserEmail(email);
            if (cart.isPresent()) {
                return ResponseEntity.ok(cart.get());
            } else {
                // Return empty cart structure
                Cart emptyCart = new Cart(email);
                return ResponseEntity.ok(emptyCart);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching cart: " + e.getMessage());
        }
    }
    
    /**
     * Add item to cart
     * POST /api/cart/{email}/items
     */
    @PostMapping("/{email}/items")
    public ResponseEntity<?> addItemToCart(@PathVariable String email, @RequestBody Map<String, Object> request) {
        try {
            // Extract product model number and quantity from request
            Map<String, Object> product = (Map<String, Object>) request.get("product");
            String modelNo = (String) product.get("modelNo");
            Integer quantity = (Integer) request.get("quantity");
            
            if (modelNo == null || quantity == null) {
                return ResponseEntity.badRequest().body("Product modelNo and quantity are required");
            }
            
            Cart updatedCart = cartService.addItemToCart(email, modelNo, quantity);
            return ResponseEntity.ok(updatedCart);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding item to cart: " + e.getMessage());
        }
    }
    
    /**
     * Update item quantity in cart
     * PUT /api/cart/{email}/items/{itemId}?quantity={quantity}
     */
    @PutMapping("/{email}/items/{itemId}")
    public ResponseEntity<?> updateItemQuantity(
            @PathVariable String email,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        try {
            Cart updatedCart = cartService.updateItemQuantity(email, itemId, quantity);
            return ResponseEntity.ok(updatedCart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating item quantity: " + e.getMessage());
        }
    }
    
    /**
     * Remove item from cart
     * DELETE /api/cart/{email}/items/{itemId}
     */
    @DeleteMapping("/{email}/items/{itemId}")
    public ResponseEntity<?> removeItemFromCart(@PathVariable String email, @PathVariable Long itemId) {
        try {
            Cart updatedCart = cartService.removeItemFromCart(email, itemId);
            return ResponseEntity.ok(updatedCart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error removing item from cart: " + e.getMessage());
        }
    }
    
    /**
     * Clear all items from cart
     * DELETE /api/cart/clearByEmail/{email}
     */
    @DeleteMapping("/clearByEmail/{email}")
    public ResponseEntity<?> clearCart(@PathVariable String email) {
        try {
            Cart clearedCart = cartService.clearCart(email);
            return ResponseEntity.ok(clearedCart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error clearing cart: " + e.getMessage());
        }
    }
    
    /**
     * Get cart items count
     * GET /api/cart/{email}/count
     */
    @GetMapping("/{email}/count")
    public ResponseEntity<?> getCartItemsCount(@PathVariable String email) {
        try {
            Optional<Cart> cart = cartService.getCartByUserEmail(email);
            int count = cart.map(Cart::getTotalItems).orElse(0);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting cart count: " + e.getMessage());
        }
    }
    
    /**
     * Get cart total price
     * GET /api/cart/{email}/total
     */
    @GetMapping("/{email}/total")
    public ResponseEntity<?> getCartTotal(@PathVariable String email) {
        try {
            Optional<Cart> cart = cartService.getCartByUserEmail(email);
            double total = cart.map(Cart::getTotalPrice).orElse(0.0);
            return ResponseEntity.ok(Map.of("total", total));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting cart total: " + e.getMessage());
        }
    }
}
