package com.paytrack.user;

import com.paytrack.security.CurrentUserId;
import com.paytrack.user.dto.UpdateUserRequest;
import com.paytrack.user.dto.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserDto me(@CurrentUserId UUID userId) {
        return userService.getById(userId);
    }

    @PatchMapping("/me")
    public UserDto updateMe(@CurrentUserId UUID userId, @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(userId, request);
    }
}
