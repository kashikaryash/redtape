package com.redtape.dto;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Long modelNo;
    private int quantity;
}
