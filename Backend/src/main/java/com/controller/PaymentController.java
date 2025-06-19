package com.example.demo4.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
@CrossOrigin(origins = "http://localhost:3000") 
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private RazorpayClient razorpay;

    public PaymentController() throws Exception {
        this.razorpay = new RazorpayClient("rzp_test_rnpC0YHsfjwTHS", "9cOk8en8coCkqD5UQIhSlYAK");
    }
    

    @PostMapping("/create-order")
    public String createOrder(@RequestBody Map<String, Object> data) throws Exception {
        int amount = (int) data.get("amount"); // amount in paise

        JSONObject options = new JSONObject();
        options.put("amount", amount);
        options.put("currency", "INR");
        options.put("receipt", "txn_123456");

        Order order = razorpay.orders.create(options); // ✅ lowercase 'orders'
        return order.toString();
    }
}
