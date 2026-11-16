package com.paytrack.integration.razorpay;

import com.paytrack.common.exception.BadRequestException;
import com.paytrack.common.exception.ResourceNotFoundException;
import com.paytrack.integration.razorpay.dto.CreateOrderRequest;
import com.paytrack.integration.razorpay.dto.OrderResponse;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RazorpayOrderService {

    private final RazorpayClient razorpayClient;
    private final RazorpayOrderRepository razorpayOrderRepository;

    @Value("${paytrack.razorpay.key-id}")
    private String razorpayKeyId;

    @Transactional
    public OrderResponse createOrder(UUID userId, CreateOrderRequest request) {
        try {
            String receipt = "pt_" + UUID.randomUUID().toString().substring(0, 12);
            JSONObject options = new JSONObject();
            // Razorpay expects amounts in the smallest currency unit (e.g. paise for INR).
            options.put("amount", request.amount().multiply(BigDecimal.valueOf(100)).intValue());
            options.put("currency", request.currency());
            options.put("receipt", receipt);

            com.razorpay.Order rpOrder = razorpayClient.orders.create(options);

            RazorpayOrder order = RazorpayOrder.builder()
                    .userId(userId)
                    .paymentId(request.paymentId())
                    .subscriptionId(request.subscriptionId())
                    .razorpayOrderId(rpOrder.get("id"))
                    .amount(request.amount())
                    .currency(request.currency())
                    .receipt(receipt)
                    .status(RazorpayOrderStatus.CREATED)
                    .build();
            order = razorpayOrderRepository.save(order);

            return new OrderResponse(order.getId(), order.getRazorpayOrderId(), razorpayKeyId,
                    order.getAmount(), order.getCurrency(), order.getStatus().name());
        } catch (Exception e) {
            throw new BadRequestException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    public OrderResponse getStatus(UUID userId, UUID orderId) {
        RazorpayOrder order = razorpayOrderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return new OrderResponse(order.getId(), order.getRazorpayOrderId(), razorpayKeyId,
                order.getAmount(), order.getCurrency(), order.getStatus().name());
    }
}
