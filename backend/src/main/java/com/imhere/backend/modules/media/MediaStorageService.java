package com.imhere.backend.modules.media;

import com.imhere.backend.common.CustomException;
import com.imhere.backend.config.security.CustomUserDetails;
import com.imhere.backend.modules.evidence.Evidence;
import com.imhere.backend.modules.evidence.EvidenceRepository;
import com.imhere.backend.modules.media.dto.MediaResponse;
import com.imhere.backend.modules.task.Task;
import com.imhere.backend.modules.task.TaskRepository;
import com.imhere.backend.modules.user.Role;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaStorageService {

    private final MediaFileRepository mediaFileRepository;
    private final UserRepository userRepository;
    private final EvidenceRepository evidenceRepository;
    private final TaskRepository taskRepository;

    @Value("${supabase.storage.url:}")
    private String supabaseUrl;

    @Value("${supabase.storage.service-role-key:}")
    private String supabaseServiceRoleKey;

    @Value("${supabase.storage.kyc-bucket:imhere-kyc-private}")
    private String kycBucket;

    @Value("${supabase.storage.evidence-bucket:imhere-evidence-private}")
    private String evidenceBucket;

    @Value("${supabase.storage.signed-url-expires-in-seconds:900}")
    private int signedUrlExpiresInSeconds;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    private final Path localUploadDir = Paths.get("uploads").toAbsolutePath().normalize();
    private static final long MAX_IMAGE_SIZE_BYTES = 10L * 1024 * 1024; // 10MB

    // Whitelist mime-types an toàn
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    // RestTemplate với timeout rõ ràng để tránh treo thread
    private final RestTemplate restTemplate = createTimeoutRestTemplate();

    private static RestTemplate createTimeoutRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(15).toMillis());
        return new RestTemplate(factory);
    }

    /**
     * Tải lên và đăng ký bản ghi Media với kiểm tra Magic Bytes và Ownership
     */
    @Transactional
    public MediaResponse uploadMedia(MultipartFile file, MediaPurpose purpose, Long ownerId, Long linkedTaskId) {
        if (file == null || file.isEmpty()) {
            throw new CustomException("Vui lòng chọn tệp hình ảnh để tải lên", HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new CustomException("Ảnh tải lên không được vượt quá 10 MB", HttpStatus.BAD_REQUEST);
        }

        // 1. Kiểm tra Magic Bytes & Header Content-Type thực tế
        validateImageMagicBytes(file);

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin người dùng", HttpStatus.NOT_FOUND));

        String extension = getFileExtension(file.getOriginalFilename());
        String objectKey = UUID.randomUUID().toString() + extension;
        MediaPurpose targetPurpose = purpose != null ? purpose : MediaPurpose.GENERAL;

        // Xác định Private Bucket theo mục đích tệp
        boolean isKyc = targetPurpose == MediaPurpose.KYC_FRONT || targetPurpose == MediaPurpose.KYC_BACK || targetPurpose == MediaPurpose.KYC_FACE;
        String selectedBucket = isKyc ? kycBucket : evidenceBucket;

        boolean isSupabaseConfigured = supabaseUrl != null && !supabaseUrl.isBlank()
                && supabaseServiceRoleKey != null && !supabaseServiceRoleKey.isBlank();

        MediaStorageType storageType;
        if (isSupabaseConfigured) {
            // Upload lên Supabase Private Storage bằng Service Role Key
            uploadToSupabasePrivate(file, selectedBucket, objectKey);
            storageType = MediaStorageType.SUPABASE_PRIVATE;
        } else {
            // Kiểm tra môi trường: Cấm fallback local disk nếu chạy profile production
            if ("prod".equalsIgnoreCase(activeProfile) || "production".equalsIgnoreCase(activeProfile)) {
                throw new CustomException("Dịch vụ lưu trữ đám mây chưa được cấu hình cho môi trường Production. Không thể lưu file.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            // Môi trường Dev/Local: Cho phép lưu tạm disk
            uploadToLocalDisk(file, objectKey);
            storageType = MediaStorageType.LOCAL_DISK;
        }

        // 2. Tạo bản ghi MediaFile
        MediaFile mediaFile = MediaFile.builder()
                .owner(owner)
                .purpose(targetPurpose)
                .storageType(storageType)
                .bucketName(selectedBucket)
                .objectKey(objectKey)
                .originalFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : objectKey)
                .contentType(file.getContentType())
                .byteSize(file.getSize())
                .linkedEntityType(isKyc ? "USER_KYC" : (linkedTaskId != null ? "TASK_EVIDENCE" : null))
                .linkedEntityId(isKyc ? ownerId : linkedTaskId)
                .build();

        MediaFile saved = mediaFileRepository.save(mediaFile);

        // Tạo signed URL hoặc proxy URL
        String accessUrl = generateAccessUrl(saved);
        return MediaResponse.fromEntity(saved, accessUrl);
    }

    /**
     * Xác thực Magic Bytes thực sự của file ảnh (Chống giả mạo đuôi file / SVG XSS)
     */
    private void validateImageMagicBytes(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new CustomException("Định dạng tệp không được hỗ trợ. Chỉ chấp nhận ảnh JPEG, PNG, WEBP.", HttpStatus.BAD_REQUEST);
        }

        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[12];
            int bytesRead = is.read(header);
            if (bytesRead < 4) {
                throw new CustomException("Tệp tải lên không hợp lệ hoặc bị rỗng", HttpStatus.BAD_REQUEST);
            }

            boolean isJpeg = (header[0] == (byte) 0xFF && header[1] == (byte) 0xD8);
            boolean isPng = (header[0] == (byte) 0x89 && header[1] == (byte) 0x50 && header[2] == (byte) 0x4E && header[3] == (byte) 0x47);
            boolean isWebp = (header[0] == (byte) 0x52 && header[1] == (byte) 0x49 && header[2] == (byte) 0x46 && header[3] == (byte) 0x46);

            if (!isJpeg && !isPng && !isWebp) {
                throw new CustomException("Nội dung tệp không phải là ảnh hợp lệ (Magic Bytes kiểm tra thất bại)", HttpStatus.BAD_REQUEST);
            }
        } catch (IOException e) {
            throw new CustomException("Không thể đọc tệp để kiểm tra định dạng", HttpStatus.BAD_REQUEST);
        }
    }

    private void uploadToSupabasePrivate(MultipartFile file, String bucket, String objectKey) {
        try {
            String cleanUrl = supabaseUrl.replaceAll("/+$", "");
            String endpoint = cleanUrl + "/storage/v1/object/" + bucket + "/" + objectKey;

            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseServiceRoleKey);
            headers.set("Authorization", "Bearer " + supabaseServiceRoleKey);
            headers.setContentType(MediaType.parseMediaType(file.getContentType()));

            // Stream body bằng ByteArrayResource để giảm memory copy
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return objectKey;
                }
            };

            HttpEntity<ByteArrayResource> requestEntity = new HttpEntity<>(resource, headers);
            ResponseEntity<String> response = restTemplate.exchange(endpoint, HttpMethod.POST, requestEntity, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("Supabase Private Upload failed with status: {}, body: {}", response.getStatusCode(), response.getBody());
                throw new CustomException("Tải ảnh lên Supabase Storage thất bại (" + response.getStatusCode() + ")", HttpStatus.BAD_GATEWAY);
            }
        } catch (CustomException ce) {
            throw ce;
        } catch (Exception e) {
            log.error("Lỗi kết nối tới Supabase Storage: ", e);
            throw new CustomException("Lỗi kết nối lưu trữ đám mây: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    private void uploadToLocalDisk(MultipartFile file, String objectKey) {
        try {
            Files.createDirectories(localUploadDir);
            Path targetLocation = localUploadDir.resolve(objectKey);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new CustomException("Lỗi ghi file vào thư mục cục bộ: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Tạo Signed URL ngắn hạn từ Supabase Storage hoặc Local API URL
     */
    public String generateAccessUrl(MediaFile mediaFile) {
        if (mediaFile.getStorageType() == MediaStorageType.SUPABASE_PRIVATE) {
            return generateSupabaseSignedUrl(mediaFile.getBucketName(), mediaFile.getObjectKey(), signedUrlExpiresInSeconds);
        } else {
            return "/api/media/" + mediaFile.getId() + "/content";
        }
    }

    /**
     * Yêu cầu Supabase sinh Signed URL có thời hạn (vd 900 giây)
     */
    public String generateSupabaseSignedUrl(String bucket, String objectKey, int expiresInSeconds) {
        try {
            String cleanUrl = supabaseUrl.replaceAll("/+$", "");
            String endpoint = cleanUrl + "/storage/v1/object/sign/" + bucket + "/" + objectKey;

            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseServiceRoleKey);
            headers.set("Authorization", "Bearer " + supabaseServiceRoleKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of("expiresIn", expiresInSeconds);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(endpoint, HttpMethod.POST, requestEntity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String signedPath = (String) response.getBody().get("signedURL");
                if (signedPath != null) {
                    if (signedPath.startsWith("http")) return signedPath;
                    return cleanUrl + "/storage/v1" + (signedPath.startsWith("/") ? signedPath : "/" + signedPath);
                }
            }
            throw new CustomException("Không thể tạo liên kết truy cập tệp tạm thời", HttpStatus.BAD_GATEWAY);
        } catch (Exception e) {
            log.error("Lỗi sinh Supabase Signed URL: ", e);
            throw new CustomException("Lỗi sinh link truy cập bảo mật: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    /**
     * Kiểm tra quyền truy cập Media (Chỉ Owner, Task Client, Looker nhận task hoặc Admin mới được xem)
     */
    @Transactional(readOnly = true)
    public MediaFile getAuthorizedMedia(Long mediaId, CustomUserDetails currentUser) {
        MediaFile media = mediaFileRepository.findById(mediaId)
                .orElseThrow(() -> new CustomException("Không tìm thấy tệp tin", HttpStatus.NOT_FOUND));

        if (currentUser == null) {
            throw new CustomException("Yêu cầu xác thực tài khoản để truy cập tệp", HttpStatus.UNAUTHORIZED);
        }

        // 1. Admin toàn quyền truy cập
        if (currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(Role.ROLE_ADMIN.name()))) {
            return media;
        }

        // 2. Chủ sở hữu tệp (Uploader) có quyền xem
        if (media.getOwner() != null && media.getOwner().getId().equals(currentUser.getId())) {
            return media;
        }

        // 3. Nếu là bằng chứng thực địa (TASK_EVIDENCE), người thuê của Task hoặc Shepherd được phân công có quyền xem
        if (media.getLinkedEntityId() != null && "TASK_EVIDENCE".equals(media.getLinkedEntityType())) {
            Optional<Task> taskOpt = taskRepository.findById(media.getLinkedEntityId());
            if (taskOpt.isPresent()) {
                Task task = taskOpt.get();
                boolean isClient = task.getClient() != null && task.getClient().getId().equals(currentUser.getId());
                boolean isShepherd = task.getAssignedShepherd() != null && task.getAssignedShepherd().getId().equals(currentUser.getId());
                if (isClient || isShepherd) {
                    return media;
                }
            }
        }

        throw new CustomException("Bạn không có quyền truy cập tệp tin định danh hoặc bằng chứng này", HttpStatus.FORBIDDEN);
    }

    /**
     * Đọc nội dung tệp local (Khi chạy chế độ dev/local)
     */
    public ResponseEntity<Resource> getLocalFileContent(MediaFile media) {
        try {
            Path filePath = localUploadDir.resolve(media.getObjectKey()).normalize();
            if (!filePath.startsWith(localUploadDir)) {
                return ResponseEntity.badRequest().build();
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(media.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + media.getOriginalFileName() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf("."));
        }
        return ".jpg";
    }
}
