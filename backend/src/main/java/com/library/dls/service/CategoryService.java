package com.library.dls.service;

import com.library.dls.dto.CategoryRequest;
import com.library.dls.dto.CategoryResponse;
import com.library.dls.entity.Category;
import com.library.dls.exception.BadRequestException;
import com.library.dls.exception.ResourceNotFoundException;
import com.library.dls.repository.CategoryRepository;
import com.library.dls.repository.EbookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final EbookRepository ebookRepository;

    public CategoryService(CategoryRepository categoryRepository, EbookRepository ebookRepository) {
        this.categoryRepository = categoryRepository;
        this.ebookRepository = ebookRepository;
    }

    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::from)
                .toList();
    }

    public CategoryResponse findById(Long id) {
        return CategoryResponse.from(getEntity(id));
    }

    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByName(request.name())) {
            throw new BadRequestException("A category with this name already exists");
        }
        Category category = new Category(request.name(), request.description());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = getEntity(id);
        if (!category.getName().equals(request.name()) && categoryRepository.existsByName(request.name())) {
            throw new BadRequestException("A category with this name already exists");
        }
        category.setName(request.name());
        category.setDescription(request.description());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    public void delete(Long id) {
        Category category = getEntity(id);
        long linkedEbooks = ebookRepository.countByCategoryId(id);
        if (linkedEbooks > 0) {
            throw new BadRequestException(
                    "Cannot delete category: " + linkedEbooks + " ebook(s) still use it");
        }
        categoryRepository.delete(category);
    }

    private Category getEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }
}
