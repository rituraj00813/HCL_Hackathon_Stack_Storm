package com.retail.ordering.exception;

/**
 * Thrown when an item does not have enough stock to fulfill the order.
 */
public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String itemName, int available, int requested) {
        super("Insufficient stock for '" + itemName + "'. Available: " + available + ", Requested: " + requested);
    }
}
