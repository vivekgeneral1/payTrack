package com.paytrack.integration.razorpay;

import com.paytrack.integration.razorpay.dto.CreateOrderRequest;
import com.paytrack.integration.razorpay.dto.OrderResponse;
import com.paytrack.security.CurrentUserId;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/razorpay")
@RequiredArgsConstructor
public class RazorpayOrderController {

    private final RazorpayOrderService razorpayOrderService;

    @PostMapping("/orders")
    public OrderResponse createOrder(@CurrentUserId UUID userId, @Valid @RequestBody CreateOrderRequest request) {
        return razorpayOrderService.createOrder(userId, request);
    }

    @GetMapping("/orders/{id}/status")
    public OrderResponse getStatus(@CurrentUserId UUID userId, @PathVariable UUID id) {
        return razorpayOrderService.getStatus(userId, id);
    }
}
