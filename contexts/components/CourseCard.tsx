
import React from 'react';
import type { Course } from '../../types';

interface CourseCardProps {
  course: Course;
  onRegisterClick: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onRegisterClick }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date to start of day for consistent comparison

  const regStart = new Date(course.registrationStart);
  regStart.setHours(0, 0, 0, 0);
  const regEnd = new Date(course.registrationEnd);
  regEnd.setHours(23, 59, 59, 999); // Normalize to end of day
  const courseStart = new Date(course.startDate);
  courseStart.setHours(0, 0, 0, 0);
  const courseEnd = new Date(course.endDate);
  courseEnd.setHours(23, 59, 59, 999); // Normalize to end of day
  
  const statusDefinitions = {
    openForRegistration: {
      text: 'เปิดรับสมัคร', // Open for Registration
      class: 'bg-green-600 text-white',
      canRegister: true,
    },
    upcomingRegistration: {
      text: 'เปิดรับสมัครเร็วๆ นี้', // Upcoming Registration
      class: 'bg-yellow-500 text-white',
      canRegister: false,
    },
    registrationClosed: {
      text: 'ปิดรับสมัครแล้ว', // Registration Closed
      class: 'bg-red-500 text-white',
      canRegister: false,
    },
    courseOngoing: {
      text: 'กำลังดำเนินการ', // Course Ongoing
      class: 'bg-blue-600 text-white',
      canRegister: false,
    },
    courseEnded: {
      text: 'หลักสูตรสิ้นสุดแล้ว', // Course Ended
      class: 'bg-gray-500 text-white',
      canRegister: false,
    },
  };

  let currentStatus = statusDefinitions.registrationClosed; // Default status

  if (today >= regStart && today <= regEnd) {
      currentStatus = statusDefinitions.openForRegistration;
  } else if (today < regStart) {
      currentStatus = statusDefinitions.upcomingRegistration;
  } else if (today > courseEnd) {
      currentStatus = statusDefinitions.courseEnded;
  } else if (today > regEnd && today >= courseStart && today <= courseEnd) {
      currentStatus = statusDefinitions.courseOngoing;
  } else if (today > regEnd && today < courseStart) {
      currentStatus = statusDefinitions.registrationClosed;
  }

  const statusClass = currentStatus.class;
  const statusText = currentStatus.text;
  const canRegister = currentStatus.canRegister;

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  return (
    <div className="bg-white dark:bg-gray-600 rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 duration-300 flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight">{course.courseName}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass} whitespace-nowrap`}>
            {statusText}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 min-h-[2rem]">{course.description}</p>

        <div className="my-4 p-3 bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                ช่วงเวลารับสมัคร:
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
                {formatDate(course.registrationStart)} - {formatDate(course.registrationEnd)}
            </p>
        </div>
        
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
           <p><strong>รุ่นที่:</strong> {course.courseGen}</p>
           <p><strong>อบรม:</strong> {formatDate(course.startDate)} - {formatDate(course.endDate)}</p>
           <p><strong>สถานที่:</strong> {course.location}</p>
           <p><strong>วิทยากร:</strong> {course.instructor}</p>
        </div>
      </div>
      
      <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                รับสมัคร: {course.currentParticipants}/{course.maxParticipants}
            </span>
            <button 
                onClick={() => onRegisterClick(course)}
                disabled={!canRegister}
                className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors duration-300 ${
                    canRegister 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
                ลงทะเบียน
            </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;