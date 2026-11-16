package com.paytrack.category;

import com.paytrack.category.dto.CategoryDto;
import com.paytrack.category.dto.CategoryRequest;
import com.paytrack.security.CurrentUserId;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public List<CategoryDto> list(@CurrentUserId UUID userId) {
        return categoryService.listForUser(userId);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> create(@CurrentUserId UUID userId, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.create(userId, request));
    }

    @PutMapping("/{id}")
    public CategoryDto update(@CurrentUserId UUID userId, @PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        return categoryService.update(userId, id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@CurrentUserId UUID userId, @PathVariable UUID id) {
        categoryService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
