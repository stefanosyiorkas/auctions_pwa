package com.auction.backend.controller;

import com.auction.backend.config.JwtUtil;
import com.auction.backend.entity.User;
import com.auction.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        Map<String, String> errors = new HashMap<>();
        if (userService.usernameExists(user.getUsername())) {
            errors.put("username", "Username already exists");
        }
        if (userService.emailExists(user.getEmail())) {
            errors.put("email", "Email already exists");
        }
        if (userService.vatExists(user.getVatNumber())) {
            errors.put("vatNumber", "VAT number already exists");
        }
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }
        userService.registerUser(user);
        return ResponseEntity.ok().body("Registration successful");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginData.get("username"),
                    loginData.get("password")
                )
            );
            String token = jwtUtil.generateToken(loginData.get("username"));
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }
}
