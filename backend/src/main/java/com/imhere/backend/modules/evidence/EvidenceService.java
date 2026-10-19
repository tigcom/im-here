package com.imhere.backend.modules.evidence;

import com.imhere.backend.modules.evidence.dto.EvidenceResponse;
import com.imhere.backend.modules.evidence.dto.ReviewEvidenceRequest;
import com.imhere.backend.modules.evidence.dto.SubmitEvidenceRequest;

import java.util.List;

public interface EvidenceService {
    EvidenceResponse submitEvidence(Long taskId, Long shepherdId, SubmitEvidenceRequest request);
    EvidenceResponse reviewEvidence(Long evidenceId, Long reviewerId, ReviewEvidenceRequest request);
    List<EvidenceResponse> getEvidencesByTaskId(Long taskId, Long requesterId);
    List<EvidenceResponse> getPendingEvidences();
}
