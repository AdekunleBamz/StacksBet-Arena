import React, { useState, useCallback, useMemo } from 'react'
import { HiSearch, HiX, HiFilter, HiSortAscending, HiSortDescending, HiViewGrid, HiViewList } from 'react-icons/hi'

/**
 * Market filtering and search component
 * Provides search, category filter, sort options, and view toggle
 */

const MarketFilters = ({ 
  markets = [],
  onFilterChange,
  categories = ['All', 'Crypto', 'Sports', 'Finance', 'Politics', 'Entertainment', 'Technology', 'Other'],
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [sortOrder, setSortOrder] = useState('desc')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'ending', label: 'Ending Soon' },
    { value: 'volume', label: 'Highest Volume' },
    { value: 'liquidity', label: 'Most Liquidity' },
    { value: 'participants', label: 'Most Active' },
  ]

  // Apply filters and sort
  const filteredMarkets = useMemo(() => {
    let result = [...markets]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(market => 
        market.title?.toLowerCase().includes(query) ||
        market.description?.toLowerCase().includes(query) ||
        market.category?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(market => market.category === selectedCategory)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'newest':
          comparison = (b.createdAt || 0) - (a.createdAt || 0)
          break
        case 'ending':
          comparison = (a.endTime || 0) - (b.endTime || 0)
          break
        case 'volume':
          comparison = (b.volume || 0) - (a.volume || 0)
          break
        case 'liquidity':
          comparison = (b.liquidity || 0) - (a.liquidity || 0)
          break
        case 'participants':
          comparison = (b.participants || 0) - (a.participants || 0)
          break
        default:
          comparison = 0
      }
      return sortOrder === 'desc' ? comparison : -comparison
    })

    return result
  }, [markets, searchQuery, selectedCategory, sortBy, sortOrder])

  // Debounced search
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [])

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
  }

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSortBy('newest')
    setSortOrder('desc')
  }

  // Notify parent of filter changes
  React.useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        filteredMarkets,
        searchQuery,
        selectedCategory,
        sortBy,
        sortOrder,
        viewMode
      })
    }
  }, [filteredMarkets, searchQuery, selectedCategory, sortBy, sortOrder, viewMode, onFilterChange])

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || sortBy !== 'newest'

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search markets..."
            className="input-field w-full pl-12 pr-10 py-3 rounded-xl text-white"
            aria-label="Search markets"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <HiX className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-arena-purple text-white'
                : 'glass-card hover:bg-arena-purple/20'
            }`}
            aria-expanded={showFilters}
            aria-label="Toggle filters"
          >
            <HiFilter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                {[searchQuery, selectedCategory !== 'All', sortBy !== 'newest'].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* View Toggle */}
          <div className="glass-card rounded-xl flex overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-3 transition-colors ${
                viewMode === 'grid' ? 'bg-arena-purple text-white' : 'hover:bg-arena-purple/20'
              }`}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <HiViewGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-3 transition-colors ${
                viewMode === 'list' ? 'bg-arena-purple text-white' : 'hover:bg-arena-purple/20'
              }`}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <HiViewList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {showFilters && (
        <div className="glass-card p-4 rounded-xl space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      selectedCategory === category
                        ? 'bg-arena-purple text-white'
                        : 'bg-arena-purple/20 hover:bg-arena-purple/30 text-gray-300'
                    }`}
                    aria-pressed={selectedCategory === category}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="sm:w-64">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field flex-1 px-3 py-2 rounded-xl text-white bg-arena-darker"
                  aria-label="Sort by"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={toggleSortOrder}
                  className="glass-card px-3 py-2 rounded-xl hover:bg-arena-purple/20 transition-colors"
                  aria-label={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
                >
                  {sortOrder === 'desc' ? (
                    <HiSortDescending className="w-5 h-5" />
                  ) : (
                    <HiSortAscending className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-arena-cyan hover:text-arena-pink transition-colors"
            >
              Reset all filters
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <p>
          Showing <span className="text-white font-medium">{filteredMarkets.length}</span> of{' '}
          <span className="text-white font-medium">{markets.length}</span> markets
          {selectedCategory !== 'All' && (
            <span className="ml-1">
              in <span className="text-arena-cyan">{selectedCategory}</span>
            </span>
          )}
        </p>
        {searchQuery && (
          <p>
            Results for "<span className="text-arena-cyan">{searchQuery}</span>"
          </p>
        )}
      </div>
    </div>
  )
}

export default MarketFilters
