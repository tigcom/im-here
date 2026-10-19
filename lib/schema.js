/**
 * ĐỊNH NGHĨA THỰC THỂ (JSDoc — dự án dùng JSX thuần, không TypeScript)
 *
 * Đây là hợp đồng dữ liệu của nền tảng. Khi chuyển sang backend thật, các
 * @typedef dưới đây là cơ sở để sinh migration DB.
 *
 * QUY ƯỚC BẮT BUỘC:
 *   • Tiền  = number, đơn vị VNĐ nguyên. Format bằng formatVnd().
 *   • Ngày  = chuỗi ISO 8601. Format bằng formatDate()/formatDateTime().
 *   • Enum  = lấy từ lib/constants.js, không gõ chuỗi trực tiếp.
 */

/**
 * @typedef {Object} KYC
 * @property {'UNVERIFIED'|'PENDING_REVIEW'|'VERIFIED'|'REJECTED'} status
 * @property {string|null} idCardNumber   Số CCCD
 * @property {string|null} idCardFrontUrl
 * @property {string|null} idCardBackUrl
 * @property {string|null} selfieUrl
 * @property {number|null} faceMatchScore  Điểm khớp khuôn mặt (0–100)
 * @property {string|null} submittedAt
 * @property {string|null} verifiedAt
 * @property {string|null} reviewedBy      adminId
 * @property {string} rejectReason
 */

/**
 * @typedef {Object} UserStats
 * @property {number} completedCount   Số việc đã hoàn thành
 * @property {number} approvalRate     Tỉ lệ được xác nhận (0–100)
 * @property {number} onTimeRate       Tỉ lệ đúng hạn (0–100)
 * @property {number} cancelledCount
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {'looker'|'client'|'admin'} role
 * @property {string} name
 * @property {string} phone
 * @property {string} email
 * @property {string} avatar
 * @property {KYC} kyc
 * @property {boolean} isLocked
 * @property {number} rating
 * @property {UserStats} stats
 * @property {string} createdAt
 *
 * // riêng looker:
 * @property {string} [province]
 * @property {string[]} [serviceAreas]        Quận/huyện nhận việc
 * @property {string[]} [interestCategoryIds] Danh mục quan tâm (KHÔNG chặn nhận việc)
 * @property {{bank:string, accountNumber:string, holder:string}} [bankAccount]
 *
 * // riêng client:
 * @property {'INDIVIDUAL'|'ORGANIZATION'} [hirerType]
 * @property {{name:string, taxId:string, address:string, representative:string, webhookUrl:string}} [organization]
 *
 * // riêng admin:
 * @property {string} [title]
 * @property {string[]} [permissions]
 */

/**
 * NGHI THỨC — cấu hình quyết định một loại việc cần gì.
 * Đây là thứ khiến "việc đơn giản thì đơn giản": mọi cờ mặc định false.
 *
 * @typedef {Object} Protocol
 * @property {string} id
 * @property {string} name
 * @property {boolean} requireGps            Bắt check-in vị trí
 * @property {number}  gpsRadiusMeters       Bán kính hợp lệ
 * @property {boolean} requirePhoto          Bắt chụp ít nhất một ảnh
 * @property {number}  photoMinCount
 * @property {boolean} requireStepPhotos     Bắt chụp theo từng bước đã liệt kê
 * @property {boolean} requireAnswers        Bắt trả lời câu hỏi của người đăng
 * @property {'PHOTO'|'VIDEO'|'SIGNATURE'|'RECEIPT'|'NOTE'}[] evidenceTypes
 * @property {boolean} requireAdminReview    Qua trạm duyệt của nền tảng
 * @property {boolean} requireHirerApproval  Người đăng xác nhận
 * @property {number}  minReward
 * @property {number}  maxReward
 * @property {number}  platformFeeRate       Tỉ lệ phí nền tảng (0.1 = 10%)
 * @property {number}  slaMinutes            Hạn hoàn thành mặc định
 * @property {boolean} allowMultiplePoints   Cho phép gom nhiều địa điểm vào một đơn
 * @property {number}  version
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {'ERRAND'|'DELIVERY'|'ASSIST'|'VERIFICATION'} group
 * @property {string} icon            Tên icon lucide-react
 * @property {string} description
 * @property {string} protocolId      Nghi thức mặc định
 * @property {string[]} examples      Ví dụ việc, hiển thị ở màn đăng tin
 * @property {boolean} isActive
 * @property {number} sortOrder
 */

/**
 * @typedef {Object} RequirementItem
 * @property {string} id
 * @property {number} order
 * @property {'PHOTO'|'VIDEO'|'TEXT'|'NUMBER'|'CHOICE'|'CHECKBOX'|'SIGNATURE'|'RECEIPT'|'NOTE'} type
 * @property {string} title
 * @property {string[]} [options]     Dùng khi type = CHOICE
 * @property {boolean} required
 */

/**
 * @typedef {Object} GeoPoint
 * @property {string} address
 * @property {string} province
 * @property {string} [district]
 * @property {string} [ward]
 * @property {number|null} lat
 * @property {number|null} lng
 * @property {string} [note]          Chỉ dẫn thêm ("cổng phụ đường hẻm")
 */

/**
 * TIN ĐĂNG — đơn vị công việc. Mỗi tin ứng với MỘT địa điểm.
 *
 * @typedef {Object} Listing
 * @property {string} id
 * @property {string|null} jobId              Thuộc đơn gom nào (null nếu tin lẻ)
 * @property {string} hirerId
 * @property {string} categoryId
 * @property {Protocol} protocolSnapshot      Bản sao nghi thức lúc đăng (đóng băng)
 * @property {string} title
 * @property {string} description
 * @property {GeoPoint} location
 * @property {number} reward                  VNĐ nguyên
 * @property {RequirementItem[]} requirements Yêu cầu + câu hỏi của người đăng
 * @property {'DRAFT'|'OPEN'|'ASSIGNED'|'IN_PROGRESS'|'SUBMITTED'|'COMPLETED'|'EXPIRED'|'CANCELLED'} status
 * @property {string|null} assignedTo         lookerId
 * @property {string|null} claimedAt
 * @property {string|null} deadlineAt
 * @property {string|null} expiresAt
 * @property {boolean} urgent
 * @property {string} createdAt
 */

/**
 * ĐƠN GOM — container tuỳ chọn khi gom nhiều tin (thay cho "chiến dịch" cũ).
 *
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} hirerId
 * @property {string} categoryId
 * @property {string} title
 * @property {string} description
 * @property {{province:string, district:string}[]} areas
 * @property {'DRAFT'|'ACTIVE'|'PAUSED'|'COMPLETED'|'CANCELLED'} status
 * @property {number} listingCount
 * @property {number} completedCount
 * @property {number} budgetTotal
 * @property {number} budgetSpent
 * @property {number} escrowHeld
 * @property {number} slaMinutes
 * @property {string} startAt
 * @property {string} endAt
 * @property {string} createdAt
 */

/**
 * KẾT QUẢ NỘP — hợp nhất Submission và QAItem cũ.
 *
 * @typedef {Object} Submission
 * @property {string} id
 * @property {string} listingId
 * @property {string|null} jobId
 * @property {string} lookerId
 * @property {string} hirerId
 * @property {{requirementId:string, value:string}[]} answers
 * @property {{requirementId:string, type:string, url:string, watermark:string, capturedAt:string,
 *             gps:{lat:number,lng:number,accuracy:number}|null}[]} evidence
 * @property {{lat:number,lng:number,accuracy:number,distanceToTarget:number,isMockSuspected:boolean}|null} gps
 * @property {string} submittedAt
 * @property {'NOT_REQUIRED'|'PENDING'|'PASSED'|'REJECTED'|'FRAUD_FLAGGED'} qaStatus
 * @property {'PENDING'|'APPROVED'|'REJECTED'} hirerStatus
 * @property {string} reviewNote
 * @property {number} reward
 * @property {string|null} payoutRef
 * @property {string} thumbnail
 */

/**
 * @typedef {Object} FraudAlert
 * @property {string} id
 * @property {'USER'|'SUBMISSION'} subjectType
 * @property {string} subjectId
 * @property {'MOCK_GPS'|'RE_SHOT_SCREEN'|'DEVICE_TAMPER'} type
 * @property {string} title
 * @property {string} details
 * @property {string} location
 * @property {string} detectedAt
 * @property {number} confidence             0–100
 * @property {'ACTIVE'|'DISMISSED'|'LOCKED'} status
 * @property {string|null} actionTaken       Nhãn hành động đã thực hiện
 * @property {string|null} reviewedBy
 * @property {string|null} reviewedAt
 */

/**
 * @typedef {Object} Wallet
 * @property {string} id
 * @property {string} ownerId
 * @property {'looker'|'client'} role
 * @property {number} available
 * @property {number} pending
 * @property {number} escrow
 * @property {string} currency
 */

/**
 * SỔ CÁI GIAO DỊCH — một hệ duy nhất cho mọi vai trò.
 *
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} walletId
 * @property {string} ownerId
 * @property {'looker'|'client'} role
 * @property {'IN'|'OUT'} direction
 * @property {'TOPUP'|'ESCROW_HOLD'|'ESCROW_RELEASE'|'PAYOUT'|'WITHDRAWAL'|'FEE'|'REFUND'} type
 * @property {number} amount                 Luôn dương; chiều do `direction` quyết định
 * @property {number} fee
 * @property {number} balanceAfter
 * @property {'PENDING'|'SUCCESS'|'FAILED'} status
 * @property {string|null} refType
 * @property {string|null} refId
 * @property {string} bankRef
 * @property {string} description
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Withdrawal
 * @property {string} id
 * @property {string} lookerId
 * @property {number} amount
 * @property {string} bankName
 * @property {string} accountNumber
 * @property {'PENDING'|'APPROVED'|'REJECTED'} status
 * @property {string} requestedAt
 * @property {string|null} processedAt
 * @property {string|null} transactionId
 * @property {string} rejectReason
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} userId
 * @property {'looker'|'client'|'admin'} role
 * @property {string} type
 * @property {string} title
 * @property {string} body
 * @property {boolean} read
 * @property {string|null} link
 * @property {string} createdAt
 */

export {};
