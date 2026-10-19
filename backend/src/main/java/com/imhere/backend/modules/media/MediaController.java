package com.imhere.backend.modules.media;

import com.imhere.backend.common.ApiResponse;
import com.imhere.backend.config.security.CustomUserDetails;
import com.imhere.backend.modules.media.dto.MediaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
@Tag(name = "06 — Secure Media & Storage", description = "Quản lý tải lên, cấp quyền truy cập Signed URL cho CCCD và Bằng chứng thực địa")
public class MediaController {

    private final MediaStorageService mediaStorageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tải lên tệp ảnh (Ghi nhận metadata, audit uploader, magic bytes check)")
    public ResponseEntity<ApiResponse<MediaResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "purpose", required = false, defaultValue = "GENERAL") MediaPurpose purpose,
            @RequestParam(value = "taskId", required = false) Long taskId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        MediaResponse response = mediaStorageService.uploadMedia(file, purpose, userDetails.getId(), taskId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tải tệp lên thành công", response));
    }

    @GetMapping("/{id}/signed-url")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy liên kết Signed URL ngắn hạn để xem ảnh bảo mật (chỉ Owner/Task Client/Admin)")
    public ResponseEntity<ApiResponse<Map<String, String>>> getSignedUrl(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        MediaFile media = mediaStorageService.getAuthorizedMedia(id, userDetails);
        String signedUrl = mediaStorageService.generateAccessUrl(media);
        return ResponseEntity.ok(ApiResponse.success("Lấy link truy cập thành công", Map.of(
                "url", signedUrl,
                "purpose", media.getPurpose().name(),
                "fileName", media.getOriginalFileName()
        )));
    }

    @GetMapping("/{id}/content")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tải/Xem nội dung tệp (Kiểm tra quyền sở hữu đối với storage local)")
    public ResponseEntity<?> getFileContent(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        MediaFile media = mediaStorageService.getAuthorizedMedia(id, userDetails);

        if (media.getStorageType() == MediaStorageType.SUPABASE_PRIVATE) {
            // Chuyển hướng tới Signed URL
            String signedUrl = mediaStorageService.generateAccessUrl(media);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(signedUrl))
                    .build();
        }

        // Chế độ Local: Đọc từ disk
        return mediaStorageService.getLocalFileContent(media);
    }
}
