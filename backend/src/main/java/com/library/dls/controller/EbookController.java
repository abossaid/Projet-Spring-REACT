package com.library.dls.controller;

import com.library.dls.dto.EbookResponse;
import com.library.dls.entity.Ebook;
import com.library.dls.service.EbookService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ebooks")
public class EbookController {

    private final EbookService ebookService;

    public EbookController(EbookService ebookService) {
        this.ebookService = ebookService;
    }

    @GetMapping
    public List<EbookResponse> getAll() {
        return ebookService.findAll();
    }

    @GetMapping("/{id}")
    public EbookResponse getOne(@PathVariable Long id) {
        return ebookService.findById(id);
    }

    /** Simple category-based recommendations (no AI). */
    @GetMapping("/recommended/{categoryId}")
    public List<EbookResponse> recommended(@PathVariable Long categoryId) {
        return ebookService.recommendByCategory(categoryId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EbookResponse> create(
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        EbookResponse created = ebookService.create(title, author, description, categoryId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public EbookResponse update(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        return ebookService.update(id, title, author, description, categoryId, file);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ebookService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Download the PDF as an attachment. */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Ebook ebook = ebookService.getEntity(id);
        Resource resource = ebookService.loadFile(id);
        String filename = ebook.getOriginalFileName() != null
                ? ebook.getOriginalFileName() : "ebook-" + id + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    /** View the PDF inline in the browser. */
    @GetMapping("/{id}/view")
    public ResponseEntity<Resource> view(@PathVariable Long id) {
        Ebook ebook = ebookService.getEntity(id);
        Resource resource = ebookService.loadFile(id);
        String filename = ebook.getOriginalFileName() != null
                ? ebook.getOriginalFileName() : "ebook-" + id + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
