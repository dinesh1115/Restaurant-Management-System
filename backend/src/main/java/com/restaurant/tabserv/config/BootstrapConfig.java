package com.restaurant.tabserv.config;

import com.restaurant.tabserv.model.UserDocument;
import com.restaurant.tabserv.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;

@Configuration
public class BootstrapConfig {

    @Bean
    CommandLineRunner bootstrapAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.admin.enabled}") boolean enabled,
            @Value("${app.bootstrap.admin.username}") String username,
            @Value("${app.bootstrap.admin.password}") String password,
            @Value("${app.bootstrap.admin.name}") String name) {
        return args -> {
            if (!enabled || userRepository.existsByUsername(username)) {
                return;
            }
            UserDocument admin = new UserDocument();
            admin.setName(name);
            admin.setUsername(username);
            admin.setHashedPassword(passwordEncoder.encode(password));
            admin.setPrivilege("admin");
            admin.setUserType("admin");
            admin.setDateCreated(Instant.now());
            admin.setEnable(true);
            userRepository.save(admin);
        };
    }
}
