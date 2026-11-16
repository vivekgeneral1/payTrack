package com.paytrack.category;

import com.paytrack.category.dto.CategoryDto;
import com.paytrack.category.dto.CategoryRequest;
import com.paytrack.common.exception.BadRequestException;
import com.paytrack.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDto> listForUser(UUID userId) {
        return categoryRepository.findAllVisibleToUser(userId).stream().map(this::toDto).toList();
    }

    @Transactional
    public CategoryDto create(UUID userId, CategoryRequest request) {
        Category category = Category.builder()
                .userId(userId)
                .name(request.name())
                .icon(request.icon())
                .color(request.color())
                .isSystem(false)
                .build();
        return toDto(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDto update(UUID userId, UUID categoryId, CategoryRequest request) {
        Category category = findOwned(userId, categoryId);
        category.setName(request.name());
        category.setIcon(request.icon());
        category.setColor(request.color());
        return toDto(categoryRepository.save(category));
    }

    @Transactional
    public void delete(UUID userId, UUID categoryId) {
        Category category = findOwned(userId, categoryId);
        categoryRepository.delete(category);
    }

    private Category findOwned(UUID userId, UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (category.isSystem() || category.getUserId() == null) {
            throw new BadRequestException("System categories cannot be modified");
        }
        if (!category.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Category not found");
        }
        return category;
    }

    private CategoryDto toDto(Category category) {
        return new CategoryDto(category.getId(), category.getName(), category.getIcon(),
                category.getColor(), category.isSystem());
    }
}
