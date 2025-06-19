package com.example.demo4.model;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String contentType;

    private String emailId;
    private boolean isPremium;
    private Double price;
    
    @Lob
    private byte[] data;

    @ManyToOne
    private User uploadedBy;
}


