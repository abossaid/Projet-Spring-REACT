package com.library.dls.repository;

import com.library.dls.entity.Ebook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EbookRepository extends JpaRepository<Ebook, Long> {

    /** All ebooks in a given category (used by the recommendation endpoint). */
    List<Ebook> findByCategoryId(Long categoryId);

    /** Recommendations: other ebooks in the same category, excluding one ebook. */
    List<Ebook> findByCategoryIdAndIdNot(Long categoryId, Long ebookId);

    /** Count ebooks linked to a category (used before deleting a category). */
    long countByCategoryId(Long categoryId);
}
