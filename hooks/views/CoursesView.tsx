
import React, { useState, useEffect } from 'react';
import api from '../../services/mockApi';
import type { Course } from '../../types';
import CourseCard from '../../contexts/components/CourseCard';
import RegistrationModal from '../../contexts/components/RegistrationModal';
import LoadingSpinner from '../../contexts/components/LoadingSpinner';

const CoursesView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | Course['status']>('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleRegisterClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value as 'all' | Course['status']);
  };

  const filteredCourses = courses.filter(course => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const matchesSearchTerm =
      course.courseName.toLowerCase().includes(lowerCaseSearchTerm) ||
      course.description.toLowerCase().includes(lowerCaseSearchTerm) ||
      course.location.toLowerCase().includes(lowerCaseSearchTerm) ||
      course.instructor.toLowerCase().includes(lowerCaseSearchTerm) ||
      course.courseGen.toLowerCase().includes(lowerCaseSearchTerm);

    const matchesStatus =
      selectedStatus === 'all' || course.status === selectedStatus;

    return matchesSearchTerm && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">หลักสูตรที่เปิดรับสมัคร</h2>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="ค้นหาหลักสูตร..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full sm:flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
          aria-label="ค้นหาหลักสูตร"
        />
        <select
          value={selectedStatus}
          onChange={handleStatusChange}
          className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
          aria-label="กรองตามสถานะ"
        >
          <option value="all">ทั้งหมด</option>
          <option value="active">เปิดรับสมัคร</option>
          <option value="upcoming">เร็วๆ นี้</option>
          <option value="closed">ปิดรับสมัคร</option>
        </select>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <CourseCard 
                key={course.courseId} 
                course={course} 
                onRegisterClick={handleRegisterClick} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">ไม่พบหลักสูตรที่ตรงกับเงื่อนไขการค้นหา</p>
        </div>
      )}

      {selectedCourse && (
        <RegistrationModal 
            course={selectedCourse} 
            onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default CoursesView;
