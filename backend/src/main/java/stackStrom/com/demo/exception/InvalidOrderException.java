package com.retail.ordering.exception;

/**
 * Thrown when an order request is invalid (e.g. empty items list).
 */
public class InvalidOrderException extends RuntimeException {
    public InvalidOrderException(String message) {
        super(message);
    }
}
