package com.retail.ordering.controller;

import com.retail.ordering.dto.ItemRequest;
import com.retail.ordering.model.Item;
import com.retail.ordering.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller layer for Item APIs.
 *
 * ┌──────────────────────────────────┬────────────────┐
 * │ Endpoint │ Access │
 * ├──────────────────────────────────┼────────────────┤
 * │ GET /api/items │ PUBLIC │
 * │ GET /api/items?category= │ PUBLIC │
 * │ POST /api/items │ ADMIN only │
 * │ DELETE /api/items/{id} │ ADMIN only │
 * └──────────────────────────────────┴────────────────┘
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ItemController {

    @Autowired
    private ItemService itemService;

    // ── PUBLIC: Get all items ────────────────────────────────────────────────
    /**
     * GET /api/items
     * GET /api/items?category=PIZZA
     */
    @GetMapping("/items")
    public ResponseEntity<List<Item>> getItems(
            @RequestParam(required = false) String category) {

        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(itemService.getItemsByCategory(category));
        }
        return ResponseEntity.ok(itemService.getAllItems());
    }

    // ── ADMIN: Add new item ──────────────────────────────────────────────────
    /**
     * POST /api/items
     * Header: Authorization: Bearer <ADMIN_JWT>
     * Body:
     * {
     * "name": "Farmhouse Pizza",
     * "category": "PIZZA",
     * "price": 329.00,
     * "stock": 30
     * }
     */
    @PostMapping({"/items", "/admin/items"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Item> addItem(@RequestBody ItemRequest request) {
        Item saved = itemService.addItem(request);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // ── ADMIN: Delete item ───────────────────────────────────────────────────
    /**
     * DELETE /api/items/{id}
     * Header: Authorization: Bearer <ADMIN_JWT>
     */
    @DeleteMapping({"/items/{id}", "/admin/items/{id}"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok("Item with ID " + id + " deleted successfully.");
    }
}
