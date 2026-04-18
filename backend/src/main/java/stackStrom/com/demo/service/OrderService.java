package com.retail.ordering.service;

import com.retail.ordering.dto.OrderRequest;
import com.retail.ordering.dto.OrderResponse;
import com.retail.ordering.exception.InsufficientStockException;
import com.retail.ordering.exception.InvalidOrderException;
import com.retail.ordering.exception.ItemNotFoundException;
import com.retail.ordering.exception.OrderNotFoundException;
import com.retail.ordering.model.Item;
import com.retail.ordering.model.Order;
import com.retail.ordering.model.OrderItem;
import com.retail.ordering.model.User;
import com.retail.ordering.repository.ItemRepository;
import com.retail.ordering.repository.OrderRepository;
import com.retail.ordering.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;


    @Transactional
    public OrderResponse placeOrder(String userEmail, OrderRequest request) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new InvalidOrderException("Authenticated user not found."));

        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());
        String paymentStatus = normalizePaymentStatus(request.getPaymentStatus());
        String paymentSummary = buildPaymentSummary(paymentMethod, paymentStatus, request.getPaymentDetails());

        // 1. Validate: items list must not be empty
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new InvalidOrderException("Order must contain at least one item.");
        }

        // 2. Validate: quantities must be positive
        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new InvalidOrderException("Quantity must be greater than 0 for item ID: " + itemReq.getItemId());
            }
        }

        // 3. Validate items exist and check stock
        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {

            // Check item exists in DB
            Item item = itemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new ItemNotFoundException(itemReq.getItemId()));

            // Check stock availability
            if (item.getStock() < itemReq.getQuantity()) {
                throw new InsufficientStockException(item.getName(), item.getStock(), itemReq.getQuantity());
            }

            // Calculate subtotal for this line item
            totalAmount += item.getPrice() * itemReq.getQuantity();

            // Build OrderItem entity
            OrderItem orderItem = new OrderItem();
            orderItem.setItem(item);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItems.add(orderItem);
        }

        // 4. Build and save the Order
        Order order = new Order();
        order.setUser(user);
        order.setCustomerName(
                request.getCustomerName() != null && !request.getCustomerName().isBlank()
                        ? request.getCustomerName().trim()
                        : user.getName());
        order.setTotalAmount(totalAmount);
        order.setStatus("PLACED");
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(paymentStatus);
        order.setPaymentSummary(paymentSummary);

        // Link each orderItem back to the parent order
        for (OrderItem orderItem : orderItems) {
            orderItem.setOrder(order);
        }
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // 5. Reduce stock AFTER saving (only if save succeeds)
        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Item item = itemRepository.findById(itemReq.getItemId()).get(); // already validated above
            item.setStock(item.getStock() - itemReq.getQuantity());
            itemRepository.save(item);
        }

        // 6. Map to response DTO and return
        return mapToResponse(savedOrder);
    }


    public OrderResponse getOrderById(String userEmail, Long orderId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new InvalidOrderException("Authenticated user not found."));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        validateOrderOwnership(user, order);
        return mapToResponse(order);
    }


    public List<OrderResponse> getOrdersForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new InvalidOrderException("Authenticated user not found."));
        List<Order> orders = orderRepository.findOrdersForUser(user.getId());
        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getLatestOrderForUser(String userEmail) {
        List<OrderResponse> orders = getOrdersForUser(userEmail);
        if (orders.isEmpty()) {
            throw new OrderNotFoundException(userEmail);
        }
        return orders.stream()
                .max((left, right) -> left.getCreatedAt().compareTo(right.getCreatedAt()))
                .orElseThrow(() -> new OrderNotFoundException(userEmail));
    }


    private OrderResponse mapToResponse(Order order) {
        List<OrderResponse.OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(oi -> new OrderResponse.OrderItemResponse(
                        oi.getItem().getId(),
                        oi.getItem().getName(),
                        oi.getItem().getCategory(),
                        oi.getItem().getPrice(),
                        oi.getQuantity(),
                        oi.getItem().getPrice() * oi.getQuantity()
                ))
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getCustomerName(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getPaymentSummary(),
                order.getCreatedAt(),
                itemResponses
        );
    }

    private void validateOrderOwnership(User user, Order order) {
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            return;
        }
        if (!order.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to access this order.");
        }
    }

    private String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new InvalidOrderException("Payment method is required.");
        }

        String normalized = paymentMethod.trim().toUpperCase();
        if (!normalized.equals("ONLINE") && !normalized.equals("CASH_ON_DELIVERY")) {
            throw new InvalidOrderException("Payment method must be ONLINE or CASH_ON_DELIVERY.");
        }
        return normalized;
    }

    private String normalizePaymentStatus(String paymentStatus) {
        if (paymentStatus == null || paymentStatus.isBlank()) {
            throw new InvalidOrderException("Payment status is required.");
        }

        String normalized = paymentStatus.trim().toUpperCase();
        if (!normalized.equals("PAID") && !normalized.equals("PENDING")) {
            throw new InvalidOrderException("Payment status must be PAID or PENDING.");
        }
        return normalized;
    }

    private String buildPaymentSummary(
            String paymentMethod,
            String paymentStatus,
            OrderRequest.PaymentDetails paymentDetails) {

        if (paymentDetails == null) {
            throw new InvalidOrderException("Payment details are required.");
        }

        if ("ONLINE".equals(paymentMethod)) {
            if (!"PAID".equals(paymentStatus)) {
                throw new InvalidOrderException("Online orders must be marked as PAID before placing the order.");
            }

            String payerName = requireValue(paymentDetails.getPayerName(), "Payer name is required for online payment.");
            String transactionReference = requireValue(
                    paymentDetails.getTransactionReference(),
                    "Transaction reference is required for online payment.");

            boolean hasUpi = paymentDetails.getUpiId() != null && !paymentDetails.getUpiId().isBlank();
            boolean hasCard = paymentDetails.getCardHolderName() != null && !paymentDetails.getCardHolderName().isBlank()
                    && paymentDetails.getCardLastFourDigits() != null && !paymentDetails.getCardLastFourDigits().isBlank();

            if (!hasUpi && !hasCard) {
                throw new InvalidOrderException("Provide either UPI ID or card holder name with last 4 digits for online payment.");
            }

            if (hasCard && paymentDetails.getCardLastFourDigits().trim().length() != 4) {
                throw new InvalidOrderException("Card last four digits must contain exactly 4 digits.");
            }

            if (hasUpi) {
                return "ONLINE / PAID / UPI / " + payerName + " / " + paymentDetails.getUpiId().trim()
                        + " / REF " + transactionReference.trim();
            }

            return "ONLINE / PAID / CARD / " + payerName + " / " + paymentDetails.getCardHolderName().trim()
                    + " / ****" + paymentDetails.getCardLastFourDigits().trim()
                    + " / REF " + transactionReference.trim();
        }

        String deliveryAddress = requireValue(
                paymentDetails.getDeliveryAddress(),
                "Delivery address is required for cash on delivery.");
        String phoneNumber = requireValue(
                paymentDetails.getPhoneNumber(),
                "Phone number is required for cash on delivery.");

        if (!"PENDING".equals(paymentStatus)) {
            throw new InvalidOrderException("Cash on delivery orders must use payment status PENDING.");
        }

        return "CASH_ON_DELIVERY / PENDING / " + deliveryAddress.trim() + " / " + phoneNumber.trim();
    }

    private String requireValue(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new InvalidOrderException(message);
        }
        return value.trim();
    }
}
