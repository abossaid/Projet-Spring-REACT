package com.library.dls.service;

import com.library.dls.dto.UserCreateRequest;
import com.library.dls.dto.UserResponse;
import com.library.dls.dto.UserUpdateRequest;
import com.library.dls.entity.User;
import com.library.dls.exception.BadRequestException;
import com.library.dls.exception.ResourceNotFoundException;
import com.library.dls.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse findById(Long id) {
        return UserResponse.from(getEntity(id));
    }

    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered");
        }
        User user = new User(
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password()),
                request.role());
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = getEntity(id);

        if (StringUtils.hasText(request.email()) && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new BadRequestException("Email is already registered");
            }
            user.setEmail(request.email());
        }

        user.setRole(request.role());

        if (StringUtils.hasText(request.password())) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        return UserResponse.from(userRepository.save(user));
    }

    public void delete(Long id, String currentUsername) {
        User user = getEntity(id);
        if (user.getUsername().equals(currentUsername)) {
            throw new BadRequestException("You cannot delete your own account");
        }
        userRepository.delete(user);
    }

    private User getEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
