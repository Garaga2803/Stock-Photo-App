import React from "react";
import API from "../api"; // adjust the path if needed

export default function PaymentButton() {
  const handlePayment = async () => {
    try {
      const res = await API.post("/payment/create-order", { amount: 5000 }); // ₹50
      const order = res.data;

      const options = {
        key: "rzp_test_rnpC0YHsfjwTHS", // 🔁 Replace with your Razorpay test key
        amount: order.amount,
        currency: "INR",
        name: "Stock Photo App",
        description: "Buy premium image",
        order_id: order.id,
        handler: function (response) {
          alert("✅ Payment successful!");
          console.log("Payment ID:", response.razorpay_payment_id);
        },
        prefill: {
          name: "User",
          email: localStorage.getItem("email") || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("❌ Failed to start payment");
      console.error(error);
    }
  };

  return <button onClick={handlePayment}>💰 Buy Image for ₹50</button>;
}
