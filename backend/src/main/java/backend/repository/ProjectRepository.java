package backend.repository;

import java.util.UUID;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    Optional<Project> findByIdAndOwner_Id(UUID id, UUID ownerId);

    Page<Project> findAllByOwner_Id(UUID ownerId, Pageable pageable);
}
