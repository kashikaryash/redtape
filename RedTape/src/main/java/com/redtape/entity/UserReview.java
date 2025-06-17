package com.redtape.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class UserReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reviewer
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Reviewed product - using modelNo instead of product_id
    @ManyToOne
    @JoinColumn(name = "product_model_no", referencedColumnName = "modelNo", nullable = false)
    private Product product;

    // Rating: e.g., 1 to 5 stars
    @Column(nullable = false)
    @Min(1) @Max(5)
    private int rating;

    // Review text
    @Column(length = 1000)
    private String comment;

    @Column(nullable = false)
    private LocalDateTime reviewDate;

    @PrePersist
    public void onCreate() {
        this.reviewDate = LocalDateTime.now();
    }
}
