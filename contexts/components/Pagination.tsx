import React from 'react';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const renderPageNumbers = () => {
    // Only show a subset of page numbers around the current page for large totalPages
    if (totalPages <= 7) { // Arbitrary number, adjust as needed
      return pageNumbers;
    }

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    const displayedPages = [];

    if (startPage > 1) {
      displayedPages.push(1);
      if (startPage > 2) displayedPages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      displayedPages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) displayedPages.push('...');
      displayedPages.push(totalPages);
    }

    return displayedPages;
  };

  if (totalItems <= itemsPerPage) {
    return null; // No pagination needed if all items fit on one page
  }

  return (
    <nav className="flex justify-center items-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      {renderPageNumbers().map((number, index) => (
        <React.Fragment key={index}>
          {typeof number === 'string' ? (
            <span className="px-3 py-1 text-gray-500 dark:text-gray-400">...</span>
          ) : (
            <button
              onClick={() => onPageChange(number as number)}
              className={`px-3 py-1 rounded-md ${
                number === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {number}
            </button>
          )}
        </React.Fragment>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;