package com.example.demo4.controller;

import com.example.demo4.model.User;
import com.example.demo4.repository.UserRepository;
import com.example.demo4.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email").toLowerCase().trim();

        if (!email.endsWith("@gmail.com")) {
            return ResponseEntity.badRequest().body("Invalid email address.");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered.");
        }

        otpService.sendOtp(email);
        return ResponseEntity.ok("OTP sent successfully to " + email);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email").toLowerCase().trim();
        String otp = body.get("otp");

        if (!otpService.verifyOtp(email, otp)) {
            return ResponseEntity.badRequest().body("Invalid OTP.");
        }

        return ResponseEntity.ok("OTP verified successfully.");
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email").toLowerCase().trim();
        String password = body.get("password");

        if (!otpService.isEmailVerified(email)) {
            return ResponseEntity.badRequest().body("OTP not verified.");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered.");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);

        otpService.clearVerification(email);

        return ResponseEntity.ok("User registered successfully.");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> body) {
        String email = body.get("email").toLowerCase().trim();
        String password = body.get("password");

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.ok("Login successful");
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<String> sendForgotPasswordOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email").toLowerCase().trim();

        if (!userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email not registered.");
        }

        otpService.sendOtp(email);
        return ResponseEntity.ok("OTP sent to " + email);
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<String> verifyForgotPasswordOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email").toLowerCase().trim();
        String otp = body.get("otp");

        if (!otpService.verifyOtp(email, otp)) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP.");
        }

        return ResponseEntity.ok("OTP verified.");
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email").toLowerCase().trim();
        String newPassword = body.get("newPassword");
        String otp = body.get("otp");

        if (!otpService.verifyOtp(email, otp)) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP.");
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok("Password reset successful.");
    }
}
