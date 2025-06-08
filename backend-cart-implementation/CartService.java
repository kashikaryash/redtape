package com.redtape.service;

import com.redtape.model.Cart;
import com.redtape.model.CartItem;
import com.redtape.model.Product;
import com.redtape.repository.CartRepository;
import com.redtape.repository.CartItemRepository;
import com.redtape.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class CartService {
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    /**
     * Get or create cart for user
     */
    public Cart getOrCreateCart(String userEmail) {
        return cartRepository.findByUserEmailWithItems(userEmail)
                .orElseGet(() -> {
                    Cart newCart = new Cart(userEmail);
                    return cartRepository.save(newCart);
                });
    }
    
    /**
     * Get cart by user email
     */
    public Optional<Cart> getCartByUserEmail(String userEmail) {
        return cartRepository.findByUserEmailWithItems(userEmail);
    }
    
    /**
     * Add item to cart
     */
    public Cart addItemToCart(String userEmail, String productModelNo, Integer quantity) {
        Cart cart = getOrCreateCart(userEmail);
        
        // Find the product
        Product product = productRepository.findByModelNo(productModelNo)
                .orElseThrow(() -> new RuntimeException("Product not found with model number: " + productModelNo));
        
        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductModelNo(cart.getId(), productModelNo);
        
        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            // Add new item
            CartItem newItem = new CartItem(cart, product, quantity);
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }
        
        return cartRepository.save(cart);
    }
    
    /**
     * Update item quantity in cart
     */
    public Cart updateItemQuantity(String userEmail, Long itemId, Integer quantity) {
        CartItem item = cartItemRepository.findByIdAndCartUserEmail(itemId, userEmail)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            Cart cart = item.getCart();
            cart.removeItem(item);
            cartItemRepository.delete(item);
            return cartRepository.save(cart);
        } else {
            // Update quantity
            item.setQuantity(quantity);
            cartItemRepository.save(item);
            return cartRepository.save(item.getCart());
        }
    }
    
    /**
     * Remove item from cart
     */
    public Cart removeItemFromCart(String userEmail, Long itemId) {
        CartItem item = cartItemRepository.findByIdAndCartUserEmail(itemId, userEmail)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        Cart cart = item.getCart();
        cart.removeItem(item);
        cartItemRepository.delete(item);
        
        return cartRepository.save(cart);
    }
    
    /**
     * Clear all items from cart
     */
    public Cart clearCart(String userEmail) {
        Cart cart = cartRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userEmail));
        
        cart.clearItems();
        cartItemRepository.deleteByCartId(cart.getId());
        
        return cartRepository.save(cart);
    }
    
    /**
     * Delete cart completely
     */
    public void deleteCart(String userEmail) {
        cartRepository.deleteByUserEmail(userEmail);
    }
}
