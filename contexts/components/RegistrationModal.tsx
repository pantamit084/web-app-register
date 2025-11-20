
import React, { useState, useEffect } from 'react';
import type { Course, Registration } from '../../types';
import { useToast } from '../../hooks/useToast';
import api from '../../services/mockApi';

interface RegistrationModalProps {
  course: Course | null; // Changed to allow null for conditional rendering
  onClose: () => void;
}

// Fix: Changed to named export and added conditional rendering at the top
export const RegistrationModal: React.FC<RegistrationModalProps> = ({ course, onClose }) => {
  if (!course) return null; // Only render if course is provided

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idCard: '',
    birthDate: '',
    phone: '',
    email: '',
    organization: '',
    position: '',
    address: '',
    studentId: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successfulRegistration, setSuccessfulRegistration] = useState<Registration | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const addToast = useToast();

  const MAX_IMAGE_SIZE_BYTES = 300 * 1024; // 300 KB

  const totalSteps = 3;
  const stepTitles = [
    'ข้อมูลส่วนตัว',
    'ข้อมูลติดต่อและองค์กร',
    'อัปโหลดเอกสาร',
  ];

  // For automatic closing after successful registration
  useEffect(() => {
    if (successfulRegistration) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [successfulRegistration, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadedFiles([]);
      setDocumentPreviews([]);
      setError('');
      return;
    }

    setError('');
    const newValidFiles: File[] = [];
    const newPreviews: string[] = [];
    let hasImageSizeError = false;

    // Fix: Explicitly type 'file' as File to resolve type errors
    const fileReadPromises = Array.from(selectedFiles).map((file: File) => {
      return new Promise<void>((resolve) => {
        if (file.type.startsWith('image/')) {
          if (file.size > MAX_IMAGE_SIZE_BYTES) {
            addToast(`ไฟล์ภาพ "${file.name}" มีขนาดเกิน 300 KB.`, 'error');
            hasImageSizeError = true;
            resolve();
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
            newValidFiles.push(file);
            resolve();
          };
          reader.readAsDataURL(file);
        } else {
          newValidFiles.push(file);
          resolve();
        }
      });
    });

    await Promise.all(fileReadPromises);

    setDocumentPreviews(newPreviews);
    setUploadedFiles(newValidFiles);

    if (hasImageSizeError && newValidFiles.length === 0) {
      setError('ไม่สามารถอัปโหลดเอกสารได้ เนื่องจากมีไฟล์ภาพขนาดเกินกำหนด');
    }
  };

  const validateStep = () => {
    setError('');
    switch (currentStep) {
      case 1: // Personal Information
        if (!formData.firstName || !formData.lastName || !formData.idCard || !formData.birthDate || !formData.studentId) {
          setError('กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน');
          return false;
        }
        return true;
      case 2: // Contact & Organization
        if (!formData.phone || !formData.email || !formData.organization || !formData.position || !formData.address) {
          setError('กรุณากรอกข้อมูลติดต่อและองค์กรให้ครบถ้วน');
          return false;
        }
        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('รูปแบบอีเมลไม่ถูกต้อง');
          return false;
        }
        return true;
      case 3: // Document Upload
        if (uploadedFiles.length === 0) {
          setError('กรุณาแนบเอกสารที่จำเป็น');
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(''); // Clear error when going back
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  // Base64 for the college logo (placeholder - replace with actual logo base64)
  // The previous base64 string was truncated and caused a SyntaxError.
  // Please replace this with a full, valid base64 encoded image of your logo.
  const collegeLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // A 1x1 transparent PNG placeholder

  const collegeWebsiteUrl = 'https://www.example.com/college'; // Replace with the actual college website URL
  // Placeholder Base64 for a QR code linking to the college website
  // In a real application, you would use a library like `qrcode.toDataURL` to generate this dynamically.
  const qrCodeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAD/lYCzAAAAAklEQVR4AewaftIAAADTSURBVO3BMQEAAADCoPz2psghDGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgD/eNqj2AAFeX2t+AAAAAElFTkSuQmCC'; // Placeholder QR code to example.com

  // Fix: Ensure the function explicitly returns a string
  const generateRegistrationPdfContent = (registration: Registration): string => {
    const courseDetail = course!; // course is guaranteed not null here due to `if (!course) return null;` at the top
    return `
      <style>
        .pdf-container {
            padding: 20px;
            font-family: 'Kanit', sans-serif; /* Ensure Kanit is available for PDF */
            color: #333;
            line-height: 1.6;
            max-width: 800px;
            margin: auto;
        }
        .pdf-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #eee;
            padding-bottom: 15px;
        }
        .pdf-header img {
            max-width: 80px; /* Adjust logo size as needed */
            height: auto;
            margin-bottom: 10px;
        }
        .pdf-header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #1a202c;
        }
        .pdf-header h2 {
            font-size: 18px;
            color: #2d3748;
        }
        .pdf-title {
            font-size: 22px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 25px;
            color: #2c5282;
        }
        .pdf-section-title {
            font-size: 18px;
            font-weight: bold;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
            color: #4a5568;
        }
        .pdf-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 15px 25px;
            margin-bottom: 20px;
        }
        .pdf-info-item {
            display: flex;
            flex-direction: column;
        }
        .pdf-info-item strong {
            color: #4a5568;
            font-weight: 600;
            margin-bottom: 3px;
            font-size: 14px;
        }
        .pdf-info-item span {
            color: #555;
            font-size: 14px;
        }
        .pdf-course-details {
            border: 1px solid #eee;
            padding: 15px;
            border-radius: 8px;
            background-color: #f9f9f9;
        }
        .pdf-course-details .pdf-info-item strong {
            color: #2c5282;
        }
        .pdf-course-details .pdf-info-item span {
            color: #2c5282;
        }
        .pdf-footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }
        .pdf-qr-code {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px dashed #ccc;
        }
        .pdf-qr-code img {
            max-width: 120px;
            height: auto;
            margin-bottom: 10px;
        }
      </style>
      <div class="pdf-container">
        <div class="pdf-header">
          <img src="${collegeLogoBase64}" alt="College Logo" />
          <h1>วิทยาลัยนักบริหารสาธารณสุข</h1>
          <h2>กระทรวงสาธารณสุข</h2>
        </div>

        <h3 class="pdf-title">เอกสารยืนยันการลงทะเบียนหลักสูตร</h3>

        <div style="text-align: center; margin-bottom: 20px; font-size: 15px;">
            <p><strong>รหัสลงทะเบียน:</strong> ${registration.registrationId}</p>
            <p><strong>วันที่ลงทะเบียน:</strong> ${formatDate(registration.registrationDate)}</p>
        </div>

        <div class="pdf-section-title">ข้อมูลส่วนตัว</div>
        <div class="pdf-info-grid">
          <div class="pdf-info-item"><strong>ชื่อ:</strong> <span>${registration.firstName}</span></div>
          <div class="pdf-info-item"><strong>นามสกุล:</strong> <span>${registration.lastName}</span></div>
          <div class="pdf-info-item"><strong>เลขบัตรประชาชน:</strong> <span>${registration.idCard}</span></div>
          <div class="pdf-info-item"><strong>วันเกิด:</strong> <span>${formatDate(registration.birthDate)}</span></div>
          <div class="pdf-info-item"><strong>รหัสนักศึกษา:</strong> <span>${registration.studentId}</span></div>
        </div>

        <div class="pdf-section-title">ข้อมูลติดต่อและองค์กร</div>
        <div class="pdf-info-grid">
          <div class="pdf-info-item"><strong>เบอร์โทรศัพท์:</strong> <span>${registration.phone}</span></div>
          <div class="pdf-info-item"><strong>อีเมล:</strong> <span>${registration.email}</span></div>
          <div class="pdf-info-item"><strong>องค์กร:</strong> <span>${registration.organization}</span></div>
          <div class="pdf-info-item"><strong>ตำแหน่ง:</strong> <span>${registration.position}</span></div>
          <div class="pdf-info-item full-width"><strong>ที่อยู่:</strong> <span>${registration.address}</span></div>
        </div>

        <div class="pdf-section-title">ข้อมูลหลักสูตร</div>
        <div class="pdf-course-details">
          <div class="pdf-info-grid">
            <div class="pdf-info-item"><strong>ชื่อหลักสูตร:</strong> <span>${courseDetail.courseName}</span></div>
            <div class="pdf-info-item"><strong>รุ่นที่:</strong> <span>${courseDetail.courseGen}</span></div>
            <div class="pdf-info-item"><strong>ช่วงเวลาหลักสูตร:</strong> <span>${formatDate(courseDetail.startDate)} - ${formatDate(courseDetail.endDate)}</span></div>
            <div class="pdf-info-item"><strong>สถานที่:</strong> <span>${courseDetail.location}</span></div>
            <div class="pdf-info-item"><strong>วิทยากร:</strong> <span>${courseDetail.instructor}</span></div>
            <div class="pdf-info-item"><strong>สถานะการลงทะเบียน:</strong> <span>${registration.status}</span></div>
          </div>
          <p style="margin-top: 15px; font-size: 14px; color: #555;">${courseDetail.description}</p>
        </div>

        <div class="pdf-qr-code">
            <img src="${qrCodeBase64}" alt="QR Code" />
            <p style="font-size: 13px; color: #666; margin-top: 5px;">สแกนเพื่อเข้าชมเว็บไซต์วิทยาลัย</p>
            <p style="font-size: 12px; color: #888;">${collegeWebsiteUrl}</p>
        </div>

        <div class="pdf-footer">
          <p>เอกสารนี้เป็นหลักฐานการลงทะเบียนเข้าร่วมหลักสูตร</p>
          <p>กรุณาติดต่อวิทยาลัยนักบริหารสาธารณสุข หากมีข้อสงสัย</p>
          <p>สร้างโดยระบบอัตโนมัติเมื่อวันที่ ${formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    `;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) {
      addToast(error, 'error'); // Show specific error message from validateStep
      return;
    }
    
    // Validate all steps before final submission
    if (currentStep < totalSteps) {
        handleNextStep(); // Move to next step if not last
        return; // Do not submit yet
    }


    setIsSubmitting(true);
    setError('');

    try {
      if (!course) {
        throw new Error("Course information is missing for registration.");
      }

      // Simulate API call to add registration
      const newRegistration = await api.addRegistration({
        courseId: course.courseId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        idCard: formData.idCard,
        birthDate: formData.birthDate,
        phone: formData.phone,
        email: formData.email,
        organization: formData.organization,
        position: formData.position,
        address: formData.address,
        studentId: formData.studentId,
      });

      setSuccessfulRegistration(newRegistration);
      addToast('ลงทะเบียนสำเร็จ! ระบบจะปิดหน้านี้ใน 5 วินาที', 'success');

      // Generate PDF after successful registration
      const pdfContent = generateRegistrationPdfContent(newRegistration);
      const filename = `Registration_Confirmation_${newRegistration.registrationId}.pdf`;
      const opt = {
          margin: 10,
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const pdfWorker = window.html2pdf().from(pdfContent).set(opt);
      await pdfWorker.save();
      addToast('ดาวน์โหลดเอกสารยืนยันการลงทะเบียนสำเร็จ!', 'success');

      // Note: In a real app, `uploadedFiles` would be sent to a file storage service.
      // For this mock, we just acknowledge them.
      console.log("Uploaded files:", uploadedFiles.map(file => file.name));


    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(err.message || 'การลงทะเบียนล้มเหลว กรุณาลองอีกครั้ง');
      addToast(err.message || 'การลงทะเบียนล้มเหลว กรุณาลองอีกครั้ง', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              ลงทะเบียนหลักสูตร: {course.courseName}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 text-3xl">&times;</button>
          </div>

          {!successfulRegistration ? (
            <form onSubmit={handleSubmit}>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {stepTitles.map((title, index) => (
                    <span key={index} className={`font-semibold ${currentStep >= index + 1 ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                      {index + 1}. {title}
                    </span>
                  ))}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">กรุณากรอกข้อมูลส่วนตัวของคุณ</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อ</label>
                      <input type="text" id="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">นามสกุล</label>
                      <input type="text" id="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="idCard" className="block text-sm font-medium text-gray-700 dark:text-gray-300">เลขบัตรประชาชน</label>
                    <input type="text" id="idCard" value={formData.idCard} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">วันเกิด</label>
                    <input type="date" id="birthDate" value={formData.birthDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">รหัสนักศึกษา (ถ้ามี)</label>
                    <input type="text" id="studentId" value={formData.studentId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                  </div>
                </div>
              )}

              {/* Step 2: Contact and Organization */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">กรุณากรอกข้อมูลติดต่อและองค์กรของคุณ</p>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">เบอร์โทรศัพท์</label>
                    <input type="tel" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">อีเมล</label>
                    <input type="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">องค์กร/หน่วยงาน</label>
                    <input type="text" id="organization" value={formData.organization} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ตำแหน่ง</label>
                    <input type="text" id="position" value={formData.position} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ที่อยู่</label>
                    <textarea id="address" value={formData.address} onChange={handleChange} rows={3} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                  </div>
                </div>
              )}

              {/* Step 3: Document Upload */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">กรุณาอัปโหลดเอกสารที่จำเป็น (เช่น สำเนาบัตรประชาชน, วุฒิการศึกษา) ขนาดไฟล์ภาพไม่เกิน 300KB</p>
                  <div>
                    <label htmlFor="documents" className="block text-sm font-medium text-gray-700 dark:text-gray-300">เอกสารประกอบการสมัคร</label>
                    <input
                      type="file"
                      id="documents"
                      onChange={handleFileChange}
                      multiple
                      accept="image/*,.pdf"
                      className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {documentPreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {documentPreviews.map((src, index) => (
                          <img key={index} src={src} alt={`Document Preview ${index + 1}`} className="w-full h-auto rounded-md shadow" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4 gap-2 sm:gap-0 mt-6 pt-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1 || isSubmitting}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ย้อนกลับ
                </button>
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    ถัดไป
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-wait"
                  >
                    {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการลงทะเบียน'}
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="text-center py-10">
              <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">ลงทะเบียนสำเร็จ!</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                รหัสลงทะเบียนของคุณคือ: <span className="font-semibold text-blue-600">{successfulRegistration.registrationId}</span>
              </p>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                ระบบได้ดาวน์โหลดเอกสารยืนยันการลงทะเบียนเป็น PDF ให้คุณแล้ว และจะปิดหน้านี้โดยอัตโนมัติ
              </p>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">ขอบคุณที่ให้ความสนใจในหลักสูตรของเรา</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ปิด
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
