package com.example.demo4.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static class OtpData {
        String otp;
        long timestamp;

        OtpData(String otp, long timestamp) {
            this.otp = otp;
            this.timestamp = timestamp;
        }
    }

    private final ConcurrentHashMap<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lastSentTime = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Boolean> verifiedEmails = new ConcurrentHashMap<>();

    private static final long OTP_EXPIRY_DURATION = 5 * 60 * 1000;
    private static final long OTP_RESEND_DELAY = 60 * 1000;

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtp(String email) {
        email = email.trim().toLowerCase();
        long now = System.currentTimeMillis();

        if (lastSentTime.containsKey(email) && (now - lastSentTime.get(email)) < OTP_RESEND_DELAY) {
            throw new RuntimeException("Please wait before requesting another OTP.");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, new OtpData(otp, now));
        lastSentTime.put(email, now);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your OTP for Account Action");
        message.setText("Your OTP is: " + otp);
        mailSender.send(message);
    }

    public boolean verifyOtp(String email, String otp) {
        email = email.trim().toLowerCase();
        OtpData otpData = otpStorage.get(email);

        if (otpData == null) return false;

        long now = System.currentTimeMillis();
        boolean isValid = otpData.otp.equals(otp) && (now - otpData.timestamp) <= OTP_EXPIRY_DURATION;

        if (isValid) {
            otpStorage.remove(email);
            lastSentTime.remove(email);
            verifiedEmails.put(email, true);
        }

        return isValid;
    }

    public boolean isEmailVerified(String email) {
        return verifiedEmails.getOrDefault(email.trim().toLowerCase(), false);
    }

    public void clearVerification(String email) {
        verifiedEmails.remove(email.trim().toLowerCase());
    }
}
