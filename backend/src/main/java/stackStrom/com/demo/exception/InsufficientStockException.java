package com.retail.ordering.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String itemName, int available, int requested) {
        super("Insufficient stock for '" + itemName + "'. Available: " + available + ", Requested: " + requested);
    }
}
