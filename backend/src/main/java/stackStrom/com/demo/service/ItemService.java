package stackStrom.com.demo.service;

import com.retail.ordering.dto.ItemRequest;
import com.retail.ordering.exception.InvalidOrderException;
import com.retail.ordering.exception.ItemNotFoundException;
import com.retail.ordering.model.Item;
import com.retail.ordering.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }


    public List<Item> getItemsByCategory(String category) {
        return itemRepository.findByCategory(category.toUpperCase());
    }


    public Item addItem(ItemRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new InvalidOrderException("Item name is required.");
        }
        if (request.getCategory() == null || request.getCategory().isBlank()) {
            throw new InvalidOrderException("Item category is required (PIZZA, DRINK, BREAD).");
        }
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new InvalidOrderException("Item price must be greater than 0.");
        }
        if (request.getStock() == null || request.getStock() < 0) {
            throw new InvalidOrderException("Item stock cannot be negative.");
        }

        Item item = new Item();
        item.setName(request.getName());
        item.setCategory(request.getCategory().toUpperCase());
        item.setPrice(request.getPrice());
        item.setStock(request.getStock());

        return itemRepository.save(item);
    }
    public void deleteItem(Long itemId) {
        if (!itemRepository.existsById(itemId)) {
            throw new ItemNotFoundException(itemId);
        }
        itemRepository.deleteById(itemId);
    }
}