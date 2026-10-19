package com.imhere.backend.modules.evidence;

import com.imhere.backend.common.ApiResponse;
import com.imhere.backend.config.security.CustomUserDetails;
import com.imhere.backend.modules.evidence.dto.EvidenceResponse;
import com.imhere.backend.modules.evidence.dto.ReviewEvidenceRequest;
import com.imhere.backend.modules.evidence.dto.SubmitEvidenceRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "04 — Evidence & QA Review", description = "Nộp bằng chứng thực địa (Anti-Fraud GPS) và thẩm định chất lượng")
public class EvidenceController {

    private final EvidenceService evidenceService;

    @PostMapping("/tasks/{taskId}/submit")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Người làm nộp bằng chứng thực địa (Checklist & Ảnh kèm toạ độ GPS)")
    public ResponseEntity<ApiResponse<EvidenceResponse>> submitEvidence(
            @PathVariable Long taskId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody SubmitEvidenceRequest request
    ) {
        EvidenceResponse response = evidenceService.submitEvidence(taskId, userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Nộp bằng chứng thành công", response));
    }

    @GetMapping("/tasks/{taskId}/evidences")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xem danh sách bằng chứng đã nộp của một nhiệm vụ")
    public ResponseEntity<ApiResponse<List<EvidenceResponse>>> getTaskEvidences(
            @PathVariable Long taskId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<EvidenceResponse> evidences = evidenceService.getEvidencesByTaskId(taskId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(evidences));
    }

    @PostMapping("/evidences/{evidenceId}/review")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Phê duyệt hoặc từ chối bằng chứng (Người đăng tin hoặc Admin nghiệm thu)")
    public ResponseEntity<ApiResponse<EvidenceResponse>> reviewEvidence(
            @PathVariable Long evidenceId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ReviewEvidenceRequest request
    ) {
        EvidenceResponse response = evidenceService.reviewEvidence(evidenceId, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Đã hoàn tất đánh giá bằng chứng", response));
    }

    @GetMapping("/evidences/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin xem toàn bộ bằng chứng đang chờ thẩm duyệt")
    public ResponseEntity<ApiResponse<List<EvidenceResponse>>> getPendingEvidences() {
        List<EvidenceResponse> evidences = evidenceService.getPendingEvidences();
        return ResponseEntity.ok(ApiResponse.success(evidences));
    }
}
