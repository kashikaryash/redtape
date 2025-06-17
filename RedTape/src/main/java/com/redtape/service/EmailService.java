package com.redtape.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.Data;

@Service
@Data
public class EmailService {

    @Autowired
    private final JavaMailSender mailSender;

    // Method to send OTP email
    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("OTP Verification - RedTape");
        message.setText("Your OTP is: " + otp);
        mailSender.send(message);
    }
}
