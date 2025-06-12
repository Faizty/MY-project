package com.example.today.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path uploadDir;

    public FileStorageService(@Value("${UPLOAD_DIR:uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }

    public String storeBase64File(byte[] fileData, String extension) throws IOException {
        String fileName = UUID.randomUUID() + "." + extension;
        Path targetLocation = this.uploadDir.resolve(fileName);
        Files.write(targetLocation, fileData);
        return fileName;
    }
}