package stackStrom.com.demo.dto;

import lombok.Data;


@Data
public class ItemRequest {
    private String name;
    private String category; 
    private Double price;
    private Integer stock;
}