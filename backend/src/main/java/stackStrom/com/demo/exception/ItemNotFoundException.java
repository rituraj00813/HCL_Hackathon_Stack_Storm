package com.retail.ordering.exception;

public class ItemNotFoundException extends RuntimeException {
    public ItemNotFoundException(Long itemId) {
        super("Item not found with ID: " + itemId);
    }
}
