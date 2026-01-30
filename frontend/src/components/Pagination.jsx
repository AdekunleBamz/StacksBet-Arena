import React from 'react'
import { HiChevronLeft, HiChevronRight, HiDotsHorizontal } from 'react-icons/hi'

/**
 * Pagination component for navigating through pages of content
 */

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showPrevNext = true,
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  // Generate page numbers to display
  const generatePages = () => {
    const pages = []
    const leftSibling = Math.max(currentPage - siblingCount, 1)
    const rightSibling = Math.min(currentPage + siblingCount, totalPages)

    const showLeftDots = leftSibling > 2
    const showRightDots = rightSibling < totalPages - 1

    if (showFirstLast && totalPages > 1) {
      pages.push(1)
    }

    if (showLeftDots) {
      pages.push('dots-left')
    }

    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i)
      }
    }

    if (showRightDots) {
      pages.push('dots-right')
    }

    if (showFirstLast && totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const pages = generatePages()

  const sizes = {
    sm: { button: 'w-7 h-7 text-xs', gap: 'gap-1' },
    md: { button: 'w-9 h-9 text-sm', gap: 'gap-1.5' },
    lg: { button: 'w-11 h-11 text-base', gap: 'gap-2' }
  }

  const variants = {
    default: {
      base: 'bg-arena-card border border-gray-700 hover:border-arena-purple/50',
      active: 'bg-arena-purple border-arena-purple text-white',
      disabled: 'opacity-50 cursor-not-allowed'
    },
    outline: {
      base: 'border border-gray-600 hover:border-arena-purple hover:bg-arena-purple/10',
      active: 'border-arena-purple bg-arena-purple/20 text-arena-purple',
      disabled: 'opacity-50 cursor-not-allowed'
    },
    ghost: {
      base: 'hover:bg-gray-700/50',
      active: 'bg-arena-purple/20 text-arena-purple',
      disabled: 'opacity-50 cursor-not-allowed'
    }
  }

  const { button: buttonSize, gap } = sizes[size]
  const { base, active, disabled } = variants[variant]

  const PageButton = ({ page, isActive, isDots, isDisabled, onClick, children }) => {
    if (isDots) {
      return (
        <span className={`${buttonSize} flex items-center justify-center text-gray-500`}>
          <HiDotsHorizontal className="w-4 h-4" />
        </span>
      )
    }

    return (
      <button
        onClick={() => !isDisabled && onClick(page)}
        disabled={isDisabled}
        aria-label={`Page ${page}`}
        aria-current={isActive ? 'page' : undefined}
        className={`
          ${buttonSize} rounded-lg font-medium transition-all duration-200
          ${isActive ? active : base}
          ${isDisabled ? disabled : ''}
          focus:outline-none focus:ring-2 focus:ring-arena-purple/50
        `}
      >
        {children || page}
      </button>
    )
  }

  if (totalPages <= 1) return null

  return (
    <nav 
      className={`flex items-center ${gap} ${className}`}
      aria-label="Pagination"
    >
      {/* Previous button */}
      {showPrevNext && (
        <PageButton
          page={currentPage - 1}
          isDisabled={currentPage === 1}
          onClick={onPageChange}
        >
          <HiChevronLeft className="w-4 h-4" />
        </PageButton>
      )}

      {/* Page numbers */}
      {pages.map((page, index) => (
        <PageButton
          key={`${page}-${index}`}
          page={page}
          isActive={page === currentPage}
          isDots={typeof page === 'string' && page.startsWith('dots')}
          onClick={onPageChange}
        />
      ))}

      {/* Next button */}
      {showPrevNext && (
        <PageButton
          page={currentPage + 1}
          isDisabled={currentPage === totalPages}
          onClick={onPageChange}
        >
          <HiChevronRight className="w-4 h-4" />
        </PageButton>
      )}
    </nav>
  )
}

// Simple pagination (just prev/next)
export const SimplePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageInfo = true,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 rounded-xl
                   bg-arena-card border border-gray-700 text-white
                   hover:border-arena-purple/50 disabled:opacity-50
                   disabled:cursor-not-allowed transition-colors"
      >
        <HiChevronLeft className="w-4 h-4" />
        Previous
      </button>
      
      {showPageInfo && (
        <span className="text-gray-400 text-sm">
          Page <span className="text-white font-medium">{currentPage}</span> of{' '}
          <span className="text-white font-medium">{totalPages}</span>
        </span>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2 rounded-xl
                   bg-arena-card border border-gray-700 text-white
                   hover:border-arena-purple/50 disabled:opacity-50
                   disabled:cursor-not-allowed transition-colors"
      >
        Next
        <HiChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// Load More button (for infinite scroll alternative)
export const LoadMoreButton = ({
  onClick,
  loading = false,
  hasMore = true,
  loadedCount,
  totalCount,
  className = ''
}) => {
  if (!hasMore && loadedCount >= totalCount) {
    return (
      <p className={`text-center text-gray-500 text-sm ${className}`}>
        You've reached the end
      </p>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <button
        onClick={onClick}
        disabled={loading || !hasMore}
        className="px-6 py-2.5 rounded-xl font-semibold text-white
                   bg-arena-purple/20 border border-arena-purple/30
                   hover:bg-arena-purple/30 hover:border-arena-purple/50
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          'Load More'
        )}
      </button>
      
      {loadedCount !== undefined && totalCount !== undefined && (
        <p className="text-sm text-gray-500">
          Showing {loadedCount} of {totalCount}
        </p>
      )}
    </div>
  )
}

// Page Size Selector
export const PageSizeSelector = ({
  pageSize,
  onPageSizeChange,
  options = [10, 25, 50, 100],
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm text-gray-400">Show:</label>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="px-3 py-1.5 rounded-lg text-sm text-white
                   bg-arena-card border border-gray-700
                   focus:border-arena-purple focus:outline-none
                   cursor-pointer"
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-400">per page</span>
    </div>
  )
}

// Complete Pagination with Info and Size
export const PaginationWithInfo = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className = ''
}) => {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      <p className="text-sm text-gray-400">
        Showing <span className="text-white font-medium">{startItem}-{endItem}</span> of{' '}
        <span className="text-white font-medium">{totalItems}</span> items
      </p>
      
      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <PageSizeSelector
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
          />
        )}
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          size="sm"
        />
      </div>
    </div>
  )
}

// Table pagination footer
export const TablePagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className = ''
}) => {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className={`
      flex flex-col sm:flex-row items-center justify-between gap-4
      px-4 py-3 bg-gray-800/50 border-t border-gray-700 rounded-b-xl
      ${className}
    `}>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          {startItem}-{endItem} of {totalItems}
        </span>
        
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 rounded-lg text-sm text-white bg-gray-700 border border-gray-600"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-700 disabled:opacity-50"
          aria-label="First page"
        >
          «
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-700 disabled:opacity-50"
          aria-label="Previous page"
        >
          <HiChevronLeft className="w-4 h-4" />
        </button>
        
        <span className="px-3 text-sm text-white">
          {currentPage} / {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-700 disabled:opacity-50"
          aria-label="Next page"
        >
          <HiChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-700 disabled:opacity-50"
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  )
}

// usePagination hook
export const usePagination = (totalItems, initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(initialPageSize)

  const totalPages = Math.ceil(totalItems / pageSize)

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)
  const firstPage = () => goToPage(1)
  const lastPage = () => goToPage(totalPages)

  const changePageSize = (newSize) => {
    setPageSize(newSize)
    setCurrentPage(1) // Reset to first page when changing size
  }

  // Calculate start and end indices for slicing data
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    changePageSize,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  }
}

export default Pagination
