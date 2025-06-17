package com.redtape.service;

import com.redtape.entity.Cart;
import com.redtape.entity.CartItem;
import com.redtape.entity.Product;
import com.redtape.entity.User;
import com.redtape.repository.CartRepository;
import com.redtape.repository.ProductRepository;
import com.redtape.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public Cart getOrCreateCartByEmail(String email) {
        return cartRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.getUserByEmail(email)
                            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setTotalAmount(0.0);
                    return cartRepository.save(newCart);
                });
    }

    public Cart saveOrUpdateCart(Cart cart) {
        return cartRepository.save(cart);
    }

    public Cart addItemToCartByEmail(String email, Long modelNo, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be greater than 0");

        Cart cart = getOrCreateCartByEmail(email);
        Product product = productRepository.findById(modelNo)
                .orElseThrow(() -> new RuntimeException("Product not found with modelNo: " + modelNo));

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> modelNo.equals(item.getProduct().getModelNo()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            existingItem.setPrice(product.getPrice() * existingItem.getQuantity());
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setPrice(product.getPrice() * quantity);
            cart.getItems().add(newItem);
        }

        recalculateTotal(cart);
        return cartRepository.save(cart);
    }

    public Cart updateItemQuantityByEmail(String email, Long modelNo, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be greater than 0");

        Cart cart = getOrCreateCartByEmail(email);

        cart.getItems().forEach(item -> {
            if (modelNo.equals(item.getProduct().getModelNo())) {
                item.setQuantity(quantity);
                item.setPrice(item.getProduct().getPrice() * quantity);
            }
        });

        recalculateTotal(cart);
        return cartRepository.save(cart);
    }

    public Cart removeItemFromCartByEmail(String email, Long modelNo) {
        Cart cart = getOrCreateCartByEmail(email);

        cart.getItems().removeIf(item -> modelNo.equals(item.getProduct().getModelNo()));

        recalculateTotal(cart);
        return cartRepository.save(cart);
    }

    public List<CartItem> getAllItemsByEmail(String email) {
        return getOrCreateCartByEmail(email).getItems();
    }

    public void clearCartByEmail(String email) {
        Cart cart = getOrCreateCartByEmail(email);
        cart.getItems().clear();
        cart.setTotalAmount(0.0);
        cartRepository.save(cart);
    }

    private void recalculateTotal(Cart cart) {
        double total = cart.getItems().stream()
                .mapToDouble(CartItem::getPrice)
                .sum();
        cart.setTotalAmount(total);
    }
}
