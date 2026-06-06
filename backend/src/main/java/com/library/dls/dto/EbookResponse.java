package com.library.dls.dto;

import com.library.dls.entity.Ebook;

import java.time.Instant;

public record EbookResponse(
        Long id,
        String title,
        String author,
        String description,
        Long categoryId,
        String categoryName,
        String originalFileName,
        Long fileSize,
        boolean hasFile,
        Instant uploadedAt
) {
    public static EbookResponse from(Ebook ebook) {
        Long categoryId = ebook.getCategory() != null ? ebook.getCategory().getId() : null;
        String categoryName = ebook.getCategory() != null ? ebook.getCategory().getName() : null;
        return new EbookResponse(
                ebook.getId(),
                ebook.getTitle(),
                ebook.getAuthor(),
                ebook.getDescription(),
                categoryId,
                categoryName,
                ebook.getOriginalFileName(),
                ebook.getFileSize(),
                ebook.getFileName() != null,
                ebook.getUploadedAt());
    }
}
