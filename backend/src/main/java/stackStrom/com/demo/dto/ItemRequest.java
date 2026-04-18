package stackStrom.com.demo.dto;

import lombok.Data;

/**
 * DTO: Request body for POST /api/items (Admin only — add new menu item)
 */
@Data
public class ItemRequest {
    private String name;
    private String category; // PIZZA, DRINK, BREAD
    private Double price;
    private Integer stock;
}