package com.imhere.backend.modules.media;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {
    List<MediaFile> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<MediaFile> findByLinkedEntityTypeAndLinkedEntityId(String linkedEntityType, Long linkedEntityId);
    Optional<MediaFile> findByObjectKey(String objectKey);
}
