package com.paytrack.integration.razorpay;

import com.razorpay.RazorpayClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorpayClientConfig {

    @Bean
    public RazorpayClient razorpayClient(@Value("${paytrack.razorpay.key-id}") String keyId,
                                          @Value("${paytrack.razorpay.key-secret}") String keySecret) throws Exception {
        return new RazorpayClient(keyId, keySecret);
    }
}
