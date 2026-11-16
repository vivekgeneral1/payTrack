package com.paytrack.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    @Query("select c from Category c where c.userId = :userId or c.userId is null order by c.isSystem desc, c.name asc")
    List<Category> findAllVisibleToUser(@Param("userId") UUID userId);

    @Query("select c from Category c where c.id = :id and (c.userId = :userId or c.userId is null)")
    Optional<Category> findByIdVisibleToUser(@Param("id") UUID id, @Param("userId") UUID userId);
}
