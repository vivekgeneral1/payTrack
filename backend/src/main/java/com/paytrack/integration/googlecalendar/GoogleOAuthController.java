package com.paytrack.integration.googlecalendar;

import com.paytrack.security.CurrentUserId;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/integrations/google")
@RequiredArgsConstructor
public class GoogleOAuthController {

    private final GoogleTokenService googleTokenService;

    @Value("${paytrack.cors.allowed-origins}")
    private String frontendOrigin;

    @GetMapping("/connect")
    public Map<String, String> connect(@CurrentUserId UUID userId) {
        return Map.of("authorizationUrl", googleTokenService.buildConsentUrl(userId));
    }

    @GetMapping("/callback")
    public void callback(@RequestParam("state") String state, @RequestParam("code") String code,
                          HttpServletResponse response) throws IOException {
        UUID userId = UUID.fromString(state);
        googleTokenService.handleCallback(userId, code);
        response.sendRedirect(frontendOrigin.split(",")[0] + "/settings/integrations?google=connected");
    }

    @GetMapping("/status")
    public Map<String, Boolean> status(@CurrentUserId UUID userId) {
        return Map.of("connected", googleTokenService.isConnected(userId));
    }

    @DeleteMapping("/disconnect")
    public void disconnect(@CurrentUserId UUID userId) {
        googleTokenService.disconnect(userId);
    }
}
