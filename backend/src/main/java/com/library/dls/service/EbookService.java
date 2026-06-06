package com.library.dls.service;

import com.library.dls.dto.EbookResponse;
import com.library.dls.entity.Category;
import com.library.dls.entity.Ebook;
import com.library.dls.exception.BadRequestException;
import com.library.dls.exception.ResourceNotFoundException;
import com.library.dls.repository.CategoryRepository;
import com.library.dls.repository.EbookRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class EbookService {

    private final EbookRepository ebookRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public EbookService(EbookRepository ebookRepository,
                        CategoryRepository categoryRepository,
                        FileStorageService fileStorageService) {
        this.ebookRepository = ebookRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<EbookResponse> findAll() {
        return ebookRepository.findAll().stream().map(EbookResponse::from).toList();
    }

    public EbookResponse findById(Long id) {
        return EbookResponse.from(getEntity(id));
    }

    /**
     * Recommendations: other ebooks sharing the given category. Simple,
     * category-based — no AI involved, as required.
     */
    public List<EbookResponse> recommendByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category", categoryId);
        }
        return ebookRepository.findByCategoryId(categoryId).stream()
                .map(EbookResponse::from)
                .toList();
    }

    public EbookResponse create(String title, String author, String description,
                                Long categoryId, MultipartFile file) {
        Ebook ebook = new Ebook();
        applyMetadata(ebook, title, author, description, categoryId);
        if (file != null && !file.isEmpty()) {
            attachFile(ebook, file);
        }
        return EbookResponse.from(ebookRepository.save(ebook));
    }

    public EbookResponse update(Long id, String title, String author, String description,
                                Long categoryId, MultipartFile file) {
        Ebook ebook = getEntity(id);
        applyMetadata(ebook, title, author, description, categoryId);
        if (file != null && !file.isEmpty()) {
            // Replace the previously stored file, if any.
            fileStorageService.delete(ebook.getFileName());
            attachFile(ebook, file);
        }
        return EbookResponse.from(ebookRepository.save(ebook));
    }

    public void delete(Long id) {
        Ebook ebook = getEntity(id);
        fileStorageService.delete(ebook.getFileName());
        ebookRepository.delete(ebook);
    }

    public Resource loadFile(Long id) {
        Ebook ebook = getEntity(id);
        if (ebook.getFileName() == null) {
            throw new ResourceNotFoundException("No PDF uploaded for ebook with id " + id);
        }
        return fileStorageService.loadAsResource(ebook.getFileName());
    }

    public Ebook getEntity(Long id) {
        return ebookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ebook", id));
    }

    private void applyMetadata(Ebook ebook, String title, String author, String description, Long categoryId) {
        if (!StringUtils.hasText(title)) {
            throw new BadRequestException("Title is required");
        }
        if (!StringUtils.hasText(author)) {
            throw new BadRequestException("Author is required");
        }
        ebook.setTitle(title);
        ebook.setAuthor(author);
        ebook.setDescription(description);

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
            ebook.setCategory(category);
        } else {
            ebook.setCategory(null);
        }
    }

    private void attachFile(Ebook ebook, MultipartFile file) {
        String storedName = fileStorageService.store(file);
        ebook.setFileName(storedName);
        ebook.setOriginalFileName(file.getOriginalFilename());
        ebook.setContentType("application/pdf");
        ebook.setFileSize(file.getSize());
    }
}
