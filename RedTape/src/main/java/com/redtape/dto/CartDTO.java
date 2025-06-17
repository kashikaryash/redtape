package com.redtape.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartDTO {
    private String userEmail;
    private List<CartItemDTO> items;
    private double totalAmount;
}
