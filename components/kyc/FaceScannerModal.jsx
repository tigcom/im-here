'use client';

import AttendanceCapture from '@/components/attendance/AttendanceCapture';

export default function FaceScannerModal({ isOpen, onClose, onCaptureComplete }) {
  const handleCaptureComplete = (result) => {
    if (onCaptureComplete) {
      onCaptureComplete({
        file: result.file,
        previewUrl: result.base64,
      });
    }
  };

  return (
    <AttendanceCapture
      isOpen={isOpen}
      onClose={onClose}
      onCaptureComplete={handleCaptureComplete}
      title="Quét Chân Dung Sinh Trắc Học eKYC"
      subtitle="Tự động phân tích 468 mốc khuôn mặt, độ nét & ánh sáng"
      workerName="Xác thực danh tính eKYC"
      shiftOrTask="Đối chiếu sinh trắc học CCCD"
      defaultFacingMode="user"
    />
  );
}
