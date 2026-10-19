package com.imhere.backend.modules.task;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.client LEFT JOIN FETCH t.assignedShepherd WHERE t.status = :status ORDER BY t.createdAt DESC")
    List<Task> findByStatus(@Param("status") TaskStatus status);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.client LEFT JOIN FETCH t.assignedShepherd WHERE t.client.id = :clientId ORDER BY t.createdAt DESC")
    List<Task> findByClientId(@Param("clientId") Long clientId);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.client LEFT JOIN FETCH t.assignedShepherd WHERE t.assignedShepherd.id = :shepherdId ORDER BY t.createdAt DESC")
    List<Task> findByAssignedShepherdId(@Param("shepherdId") Long shepherdId);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.client LEFT JOIN FETCH t.assignedShepherd WHERE t.assignedShepherd.id = :shepherdId AND t.status IN :statuses ORDER BY t.createdAt DESC")
    List<Task> findByAssignedShepherdIdAndStatusIn(@Param("shepherdId") Long shepherdId, @Param("statuses") List<TaskStatus> statuses);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.client LEFT JOIN FETCH t.assignedShepherd ORDER BY t.createdAt DESC")
    List<Task> findAllWithAssociations();

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.client LEFT JOIN FETCH t.assignedShepherd WHERE t.id = :id")
    Optional<Task> findByIdWithAssociations(@Param("id") Long id);

    long countByStatus(TaskStatus status);

    long countByAssignedShepherdIdAndStatusIn(Long shepherdId, List<TaskStatus> statuses);

    List<Task> findByStatusAndDeadlineBefore(TaskStatus status, java.time.Instant deadline);
    List<Task> findByStatusInAndDeadlineBefore(List<TaskStatus> statuses, java.time.Instant deadline);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Task t WHERE t.id = :id")
    Optional<Task> findByIdWithLock(@Param("id") Long id);
}
