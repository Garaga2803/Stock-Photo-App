package com.example.demo4.controller;

import com.example.demo4.model.Photo;
import com.example.demo4.model.User;
import com.example.demo4.repository.PhotoRepository;
import com.example.demo4.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoRepository photoRepository;
    private final UserRepository userRepository;

    @PostMapping("/upload")
public ResponseEntity<?> uploadMultiple(@RequestParam("files") MultipartFile[] files,
                                        @RequestParam("email") String email,
                                        @RequestParam(value = "isPremium", defaultValue = "false") boolean isPremium,
                                        @RequestParam(value = "price", required = false) Double price) {
    try {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

        List<String> uploadedFileNames = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            Photo photo = new Photo();
            photo.setFileName(file.getOriginalFilename());
            photo.setContentType(file.getContentType());
            photo.setData(file.getBytes());
            photo.setUploadedBy(user);
            photo.setEmailId(email);
            photo.setPremium(isPremium);

            if (isPremium) {
                photo.setPrice(price);
            }

            photoRepository.save(photo);
            uploadedFileNames.add(file.getOriginalFilename());
        }

        if (uploadedFileNames.isEmpty()) {
            return ResponseEntity.badRequest().body("No valid files uploaded.");
        }

        return ResponseEntity.ok("Uploaded: " + String.join(", ", uploadedFileNames));
    } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Upload failed due to IO error: " + e.getMessage());
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Upload failed: " + e.getMessage());
    }
}

    

    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllPhotos() {
        List<Photo> photos = photoRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Photo photo : photos) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", photo.getId());
            item.put("fileName", photo.getFileName());
            item.put("uploadedBy", photo.getEmailId());
            item.put("isPremium", photo.isPremium());
            item.put("price", photo.getPrice());
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        Photo photo = photoRepository.findById(id).orElseThrow();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(photo.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + photo.getFileName() + "\"")
                .body(photo.getData());
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<byte[]> viewPhoto(@PathVariable Long id) {
        Photo photo = photoRepository.findById(id).orElseThrow();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(photo.getContentType()))
                .body(photo.getData());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePhoto(@PathVariable Long id, @RequestParam("email") String email) {
        Optional<Photo> optionalPhoto = photoRepository.findById(id);
        if (optionalPhoto.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Photo photo = optionalPhoto.get();

        if (!photo.getEmailId().equals(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own photo.");
        }

        photoRepository.delete(photo);
        return ResponseEntity.ok("Photo deleted successfully.");
    }
}
