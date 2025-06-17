package com.redtape.controller;

import com.redtape.dto.AddToCartRequest;
import com.redtape.dto.UpdateCartItemQuantityRequest;
import com.redtape.entity.Cart;
import com.redtape.entity.CartItem;
import com.redtape.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // Get or create a cart for the user
    @GetMapping("/user/{email}")
    public ResponseEntity<Cart> getCartByUserEmail(@PathVariable String email) {
        Cart cart = cartService.getOrCreateCartByEmail(email);
        return ResponseEntity.ok(cart);
    }

    // Save or update the full cart (not used much by frontend)
    @PostMapping
    public ResponseEntity<Cart> createOrUpdateCart(@RequestBody Cart cart) {
        Cart updatedCart = cartService.saveOrUpdateCart(cart);
        return ResponseEntity.ok(updatedCart);
    }

    // ✅ Add an item to the cart
    @PostMapping("/user/{email}/add")
    public ResponseEntity<Cart> addItemToCart(@PathVariable String email,
                                              @RequestBody AddToCartRequest request) {
        Cart updatedCart = cartService.addItemToCartByEmail(email, request.getModelNo(), request.getQuantity());
        return ResponseEntity.ok(updatedCart);
    }

    // ✅ Update the quantity of a specific item in the cart
    @PutMapping("/user/{email}/items/{modelNo}")
    public ResponseEntity<Cart> updateItemQuantity(@PathVariable String email,
                                                   @PathVariable Long modelNo,
                                                   @RequestBody UpdateCartItemQuantityRequest request) {
        Cart updatedCart = cartService.updateItemQuantityByEmail(email, modelNo, request.getQuantity());
        return ResponseEntity.ok(updatedCart);
    }

    // ✅ Remove an item from the cart
    @DeleteMapping("/user/{email}/remove/{modelNo}")
    public ResponseEntity<Cart> removeItemFromCart(@PathVariable String email,
                                                   @PathVariable Long modelNo) {
        Cart updatedCart = cartService.removeItemFromCartByEmail(email, modelNo);
        return ResponseEntity.ok(updatedCart);
    }

    // ✅ Clear all items from cart
    @DeleteMapping("/user/{email}/clear")
    public ResponseEntity<Void> clearCartByEmail(@PathVariable String email) {
        cartService.clearCartByEmail(email);
        return ResponseEntity.noContent().build();
    }

    // ✅ Get all cart items for user
    @GetMapping("/user/{email}/items")
    public ResponseEntity<List<CartItem>> getAllItems(@PathVariable String email) {
        List<CartItem> items = cartService.getAllItemsByEmail(email);
        return ResponseEntity.ok(items);
    }
}
