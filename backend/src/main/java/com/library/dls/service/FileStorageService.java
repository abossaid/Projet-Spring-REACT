package com.library.dls.service;

import com.library.dls.exception.BadRequestException;
import com.library.dls.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Stores uploaded PDF files on the local filesystem and serves them back as
 * Spring {@link Resource}s for download / inline viewing.
 */
@Service
public class FileStorageService {

    private final Path storageRoot;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.storageRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(storageRoot);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory: " + storageRoot, e);
        }
    }

    /** Validates the upload is a PDF and stores it under a unique name. */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        String contentType = file.getContentType();
        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        boolean looksPdf = "application/pdf".equalsIgnoreCase(contentType)
                || original.toLowerCase().endsWith(".pdf");
        if (!looksPdf) {
            throw new BadRequestException("Only PDF files are allowed");
        }

        String storedName = UUID.randomUUID() + ".pdf";
        Path target = storageRoot.resolve(storedName).normalize();
        if (!target.getParent().equals(storageRoot)) {
            throw new BadRequestException("Invalid file path");
        }
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file", e);
        }
        return storedName;
    }

    public Resource loadAsResource(String storedName) {
        try {
            Path file = storageRoot.resolve(storedName).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("File not found: " + storedName);
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File not found: " + storedName);
        }
    }

    public void delete(String storedName) {
        if (storedName == null) {
            return;
        }
        try {
            Files.deleteIfExists(storageRoot.resolve(storedName).normalize());
        } catch (IOException e) {
            // Non-fatal: the DB record is the source of truth.
        }
    }
}
