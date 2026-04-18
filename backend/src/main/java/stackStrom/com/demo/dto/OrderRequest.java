package stackStrom.com.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private String customerName;
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        private Long itemId;
        private Integer quantity;
    }
}
