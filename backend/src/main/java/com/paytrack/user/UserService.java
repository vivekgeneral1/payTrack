package com.paytrack.user;

import com.paytrack.common.exception.ResourceNotFoundException;
import com.paytrack.user.dto.UpdateUserRequest;
import com.paytrack.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDto getById(UUID userId) {
        return toDto(findUser(userId));
    }

    @Transactional
    public UserDto update(UUID userId, UpdateUserRequest request) {
        User user = findUser(userId);
        if (StringUtils.hasText(request.fullName())) {
            user.setFullName(request.fullName());
        }
        if (StringUtils.hasText(request.defaultCurrency())) {
            user.setDefaultCurrency(request.defaultCurrency().toUpperCase());
        }
        if (StringUtils.hasText(request.timezone())) {
            user.setTimezone(request.timezone());
        }
        return toDto(userRepository.save(user));
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getFullName(),
                user.getDefaultCurrency(), user.getTimezone());
    }
}
