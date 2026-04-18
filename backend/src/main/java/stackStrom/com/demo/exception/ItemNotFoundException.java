package com.retail.ordering.exception;

/**
 * Thrown when a requested item does not exist in DB.
 */
public class ItemNotFoundException extends RuntimeException {
    public ItemNotFoundException(Long itemId) {
        super("Item not found with ID: " + itemId);
    }
}
