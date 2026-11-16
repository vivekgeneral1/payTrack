package com.paytrack.integration.razorpay;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/razorpay")
@RequiredArgsConstructor
public class RazorpayWebhookController {

    private final RazorpayWebhookService webhookService;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(HttpServletRequest request) throws IOException {
        String payload = new String(request.getInputStream().readAllBytes());
        String signature = request.getHeader("X-Razorpay-Signature");
        boolean accepted = webhookService.processWebhook(payload, signature);
        return accepted ? ResponseEntity.ok("ok") : ResponseEntity.status(400).body("invalid signature");
    }
}
