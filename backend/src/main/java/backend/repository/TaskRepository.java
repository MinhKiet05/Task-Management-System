package backend.repository;

import java.util.UUID;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    Optional<Task> findByIdAndProject_Owner_Id(UUID id, UUID ownerId);

    Page<Task> findAllByProject_IdAndProject_Owner_Id(UUID projectId, UUID ownerId, Pageable pageable);
}
