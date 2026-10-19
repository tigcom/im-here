package com.imhere.backend.modules.evidence;

import com.imhere.backend.common.ApiResponse;
import com.imhere.backend.config.security.CustomUserDetails;
import com.imhere.backend.modules.media.MediaPurpose;
import com.imhere.backend.modules.media.MediaStorageService;
import com.imhere.backend.modules.media.dto.MediaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@Tag(name = "06 — File & Image Upload (Legacy Gateway)", description = "Cổng upload chuyển tiếp qua hệ thống Secure Media Storage")
public class FileUploadController {

    private final MediaStorageService mediaStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tải lên hình ảnh bằng chứng hoặc tài liệu thực địa (Ủy quyền qua Media Storage)")
    public ResponseEntity<ApiResponse<UploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "purpose", required = false) MediaPurpose purpose,
            @RequestParam(value = "taskId", required = false) Long taskId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        MediaResponse media = mediaStorageService.uploadMedia(file, purpose != null ? purpose : MediaPurpose.GENERAL, userDetails.getId(), taskId);
        return ResponseEntity.ok(ApiResponse.success(
                "Tải tệp lên thành công",
                new UploadResponse(media.getId(), media.getAccessUrl(), media.getOriginalFileName(), String.valueOf(media.getId()), media.getByteSize())
        ));
    }

    public record UploadResponse(Long id, String url, String originalName, String storedName, long size) {}
}
