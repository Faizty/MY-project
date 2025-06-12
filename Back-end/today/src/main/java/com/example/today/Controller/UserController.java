package com.example.today.Controller;

import com.example.today.Model.User;
import com.example.today.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    @Value("${avatar.upload.dir}") // Configured in application.properties
    private String uploadDir;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1. Update Profile
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> updates) {

        updates.forEach((key, value) -> {
            switch (key) {
                case "name" -> currentUser.setName(value);
                case "phone" -> currentUser.setPhone(value);
                case "address" -> currentUser.setAddress(value);
                case "bio" -> currentUser.setBio(value);
                // "avatar" excluded (handled separately)
            }
        });

        User updatedUser = userRepository.save(currentUser);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile updated successfully",
                "user", updatedUser
        ));
    }

    // 2. Upload Avatar
    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("avatar") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        if (!file.getContentType().startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only images are allowed"));
        }

        try {
            // Delete old avatar
            if (currentUser.getAvatar() != null) {
                Path oldFilePath = Paths.get(uploadDir, extractFileName(currentUser.getAvatar()));
                Files.deleteIfExists(oldFilePath);
            }

            // Save new avatar
            String fileExtension = getFileExtension(file.getOriginalFilename());
            String fileName = "user_" + currentUser.getId() + fileExtension;
            Path filePath = Paths.get(uploadDir, fileName);
            Files.createDirectories(filePath.getParent()); // Ensure directory exists
            Files.write(filePath, file.getBytes());

            // Update user entity
            String fileUrl = "/static/avatars/" + fileName;
            currentUser.setAvatar(fileUrl);
            userRepository.save(currentUser);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Avatar uploaded successfully",
                    "avatarUrl", fileUrl
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload avatar"));
        }
    }

    // 3. Get Avatar by User ID
    @GetMapping("/{userId}/avatar")
    public ResponseEntity<byte[]> getAvatar(@PathVariable Long userId) { // ✅ userId is Long
        Optional<User> userOptional = userRepository.findById(userId); // ✅ Now matches Long ID

        if (userOptional.isEmpty() || userOptional.get().getAvatar() == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            String fileName = extractFileName(userOptional.get().getAvatar());
            Path filePath = Paths.get(uploadDir, fileName);
            byte[] imageBytes = Files.readAllBytes(filePath);

            // Determine content type dynamically
            String extension = getFileExtension(fileName).toLowerCase();
            MediaType mediaType = switch (extension) {
                case ".png" -> MediaType.IMAGE_PNG;
                case ".gif" -> MediaType.IMAGE_GIF;
                default -> MediaType.IMAGE_JPEG; // Default to JPEG
            };

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(imageBytes);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Helper methods (unchanged)
    private String extractFileName(String fileUrl) {
        return fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}