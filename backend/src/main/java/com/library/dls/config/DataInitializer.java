package com.library.dls.config;

import com.library.dls.entity.Category;
import com.library.dls.entity.Role;
import com.library.dls.entity.User;
import com.library.dls.repository.CategoryRepository;
import com.library.dls.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a default admin + reader account and a few categories on first run so
 * the application is immediately usable for the demo. Idempotent: it only
 * creates records that do not already exist.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(new User(
                    "admin",
                    "admin@library.com",
                    passwordEncoder.encode("admin123"),
                    Role.ADMIN));
        }
        if (!userRepository.existsByUsername("reader")) {
            userRepository.save(new User(
                    "reader",
                    "reader@library.com",
                    passwordEncoder.encode("reader123"),
                    Role.READER));
        }

        seedCategory("Programming", "Software development and programming languages");
        seedCategory("Science", "Physics, chemistry, biology and more");
        seedCategory("History", "World history and historical analysis");
    }

    private void seedCategory(String name, String description) {
        if (!categoryRepository.existsByName(name)) {
            categoryRepository.save(new Category(name, description));
        }
    }
}
