import React, { useState } from 'react'
import { HiChevronUp, HiChevronDown, HiSelector } from 'react-icons/hi'

/**
 * Table component with sorting, selection, and responsive design
 */

// Main Table Component
const Table = ({
  columns = [],
  data = [],
  sortable = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  striped = false,
  hoverable = true,
  stickyHeader = false,
  emptyMessage = 'No data available',
  loading = false,
  className = ''
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

  const handleSort = (key) => {
    if (!sortable) return
    
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null
    }
    
    setSortConfig({ key: direction ? key : null, direction })
  }

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange?.(data.map((_, i) => i))
    } else {
      onSelectionChange?.([])
    }
  }

  const handleSelectRow = (index) => {
    if (selectedRows.includes(index)) {
      onSelectionChange?.(selectedRows.filter(i => i !== index))
    } else {
      onSelectionChange?.([...selectedRows, index])
    }
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <HiSelector className="w-4 h-4 text-gray-500" />
    }
    if (sortConfig.direction === 'asc') {
      return <HiChevronUp className="w-4 h-4 text-arena-purple" />
    }
    return <HiChevronDown className="w-4 h-4 text-arena-purple" />
  }

  if (loading) {
    return <TableSkeleton columns={columns.length} rows={5} />
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
          <tr className="bg-gray-800/50 border-b border-gray-700">
            {selectable && (
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 
                           text-arena-purple focus:ring-arena-purple/50"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable !== false && handleSort(column.key)}
                className={`
                  px-4 py-3 text-left text-sm font-semibold text-gray-300
                  ${sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-700/50' : ''}
                  ${column.width ? `w-[${column.width}]` : ''}
                  ${column.align === 'center' ? 'text-center' : ''}
                  ${column.align === 'right' ? 'text-right' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {sortable && column.sortable !== false && (
                    <SortIcon columnKey={column.key} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick?.(row, rowIndex)}
                className={`
                  border-b border-gray-700/50 transition-colors
                  ${striped && rowIndex % 2 === 1 ? 'bg-gray-800/30' : ''}
                  ${hoverable ? 'hover:bg-gray-700/30' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                  ${selectedRows.includes(rowIndex) ? 'bg-arena-purple/10' : ''}
                `}
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(rowIndex)}
                      onChange={() => handleSelectRow(rowIndex)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 
                               text-arena-purple focus:ring-arena-purple/50"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      px-4 py-3 text-sm text-gray-300
                      ${column.align === 'center' ? 'text-center' : ''}
                      ${column.align === 'right' ? 'text-right' : ''}
                    `}
                  >
                    {column.render 
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// Table Skeleton for loading
const TableSkeleton = ({ columns = 4, rows = 5 }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-800/50 border-b border-gray-700">
          {[...Array(columns)].map((_, i) => (
            <th key={i} className="px-4 py-3">
              <div className="h-4 bg-gray-700 rounded w-20 animate-pulse" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(rows)].map((_, rowIndex) => (
          <tr key={rowIndex} className="border-b border-gray-700/50">
            {[...Array(columns)].map((_, colIndex) => (
              <td key={colIndex} className="px-4 py-3">
                <div className="h-4 bg-gray-700 rounded w-full animate-pulse" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// Card Table (for mobile-first design)
export const CardTable = ({
  data = [],
  renderCard,
  columns = 1,
  gap = 'md',
  emptyMessage = 'No data available',
  className = ''
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-12 text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {data.map((item, index) => renderCard(item, index))}
    </div>
  )
}

// DataGrid (enhanced table with more features)
export const DataGrid = ({
  columns,
  data,
  pageSize = 10,
  currentPage = 1,
  totalItems,
  onPageChange,
  onSort,
  sortColumn,
  sortDirection,
  className = ''
}) => {
  return (
    <div className={`bg-arena-card border border-gray-700/50 rounded-xl overflow-hidden ${className}`}>
      <Table
        columns={columns}
        data={data}
        sortable
        stickyHeader
      />
      
      {/* Pagination */}
      {totalItems > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
          <span className="text-sm text-gray-400">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </span>
          
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg text-sm text-gray-400 
                       hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage * pageSize >= totalItems}
              className="px-3 py-1 rounded-lg text-sm text-gray-400 
                       hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Leaderboard Table (specific to StacksBet)
export const LeaderboardTable = ({
  data = [],
  onTraderClick,
  className = ''
}) => {
  const columns = [
    {
      key: 'rank',
      header: '#',
      width: '60px',
      render: (value, row) => {
        if (value === 1) return <span className="text-yellow-400">🥇</span>
        if (value === 2) return <span className="text-gray-300">🥈</span>
        if (value === 3) return <span className="text-amber-600">🥉</span>
        return <span className="text-gray-500">{value}</span>
      }
    },
    {
      key: 'address',
      header: 'Trader',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-arena-purple to-arena-pink
                        flex items-center justify-center text-white text-xs font-bold">
            {value.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-mono text-sm">{`${value.slice(0, 6)}...${value.slice(-4)}`}</span>
        </div>
      )
    },
    {
      key: 'totalBets',
      header: 'Bets',
      align: 'right'
    },
    {
      key: 'winRate',
      header: 'Win Rate',
      align: 'right',
      render: (value) => <span className="text-arena-cyan">{value}%</span>
    },
    {
      key: 'profit',
      header: 'Profit',
      align: 'right',
      render: (value) => (
        <span className={value >= 0 ? 'text-arena-green' : 'text-red-400'}>
          {value >= 0 ? '+' : ''}{value} STX
        </span>
      )
    }
  ]

  return (
    <Table
      columns={columns}
      data={data}
      sortable
      hoverable
      onRowClick={(row) => onTraderClick?.(row)}
      className={className}
    />
  )
}

// Markets Table
export const MarketsTable = ({
  data = [],
  onMarketClick,
  className = ''
}) => {
  const columns = [
    {
      key: 'title',
      header: 'Market',
      render: (value, row) => (
        <div className="max-w-md">
          <p className="font-medium text-white truncate">{value}</p>
          <p className="text-xs text-gray-500">{row.category}</p>
        </div>
      )
    },
    {
      key: 'yesPercentage',
      header: 'Odds',
      render: (value, row) => (
        <div className="flex gap-2">
          <span className="px-2 py-0.5 rounded bg-arena-green/20 text-arena-green text-xs">
            {value}% Yes
          </span>
          <span className="px-2 py-0.5 rounded bg-arena-pink/20 text-arena-pink text-xs">
            {row.noPercentage}% No
          </span>
        </div>
      )
    },
    {
      key: 'volume',
      header: 'Volume',
      align: 'right',
      render: (value) => <span>{value.toLocaleString()} STX</span>
    },
    {
      key: 'endTime',
      header: 'Ends',
      align: 'right',
      render: (value) => <span className="text-gray-400">{value}</span>
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (value) => (
        <span className={`
          px-2 py-0.5 rounded-full text-xs font-medium
          ${value === 'active' 
            ? 'bg-arena-green/20 text-arena-green' 
            : 'bg-gray-700 text-gray-400'}
        `}>
          {value === 'active' ? '● Live' : value}
        </span>
      )
    }
  ]

  return (
    <Table
      columns={columns}
      data={data}
      sortable
      hoverable
      onRowClick={(row) => onMarketClick?.(row)}
      className={className}
    />
  )
}

// Simple Key-Value Table
export const KeyValueTable = ({
  data = [],
  className = ''
}) => {
  return (
    <div className={`divide-y divide-gray-700/50 ${className}`}>
      {data.map((item, index) => (
        <div key={index} className="flex justify-between py-3">
          <span className="text-gray-400">{item.label}</span>
          <span className="text-white font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

// Responsive Table Container
export const ResponsiveTable = ({
  children,
  mobileCardView,
  breakpoint = 'md',
  className = ''
}) => {
  return (
    <div className={className}>
      {/* Desktop view */}
      <div className={`hidden ${breakpoint}:block`}>
        {children}
      </div>
      
      {/* Mobile card view */}
      <div className={`${breakpoint}:hidden`}>
        {mobileCardView}
      </div>
    </div>
  )
}

export default Table
