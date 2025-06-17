package com.redtape.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Data
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The owner of the cart
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // List of items in the cart
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<CartItem> items;

    // Optional: Total amount (can be computed or stored)
    @Column(nullable = false)
    private double totalAmount;
}
