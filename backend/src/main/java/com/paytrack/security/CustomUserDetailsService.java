package com.paytrack.security;

import com.paytrack.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmailIgnoreCase(email)
                .map(AuthPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("No user with email " + email));
    }

    public UserDetails loadUserById(UUID userId) {
        return userRepository.findById(userId).map(AuthPrincipal::new).orElse(null);
    }
}
