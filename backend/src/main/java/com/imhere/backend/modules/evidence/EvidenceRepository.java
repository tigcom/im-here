package com.imhere.backend.modules.evidence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.time.Instant;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {

    @Query("SELECT e FROM Evidence e LEFT JOIN FETCH e.task LEFT JOIN FETCH e.shepherd LEFT JOIN FETCH e.reviewedBy WHERE e.task.id = :taskId ORDER BY e.submittedAt DESC")
    List<Evidence> findByTaskIdOrderBySubmittedAtDesc(@Param("taskId") Long taskId);

    @Query("SELECT e FROM Evidence e LEFT JOIN FETCH e.task LEFT JOIN FETCH e.shepherd LEFT JOIN FETCH e.reviewedBy WHERE e.shepherd.id = :shepherdId ORDER BY e.submittedAt DESC")
    List<Evidence> findByShepherdId(@Param("shepherdId") Long shepherdId);

    @Query("SELECT e FROM Evidence e LEFT JOIN FETCH e.task LEFT JOIN FETCH e.shepherd LEFT JOIN FETCH e.reviewedBy WHERE e.status = :status ORDER BY e.submittedAt DESC")
    List<Evidence> findByStatus(@Param("status") EvidenceStatus status);

    @Query("SELECT e FROM Evidence e LEFT JOIN FETCH e.task LEFT JOIN FETCH e.shepherd LEFT JOIN FETCH e.reviewedBy WHERE e.id = :id")
    Optional<Evidence> findByIdWithAssociations(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Evidence e JOIN FETCH e.task WHERE e.id = :id")
    Optional<Evidence> findByIdForUpdate(@Param("id") Long id);

    List<Evidence> findByStatusAndSubmittedAtBefore(EvidenceStatus status, Instant submittedAt);
}
