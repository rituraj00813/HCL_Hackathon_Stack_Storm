package com.retail.ordering.exception;

/**
 * Thrown when an order is not found in the DB.
 */
public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(Long orderId) {
        super("Order not found with ID: " + orderId);
    }
    public OrderNotFoundException(String userName) {
        super("No orders found for user: " + userName);
    }
}
