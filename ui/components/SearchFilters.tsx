'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';

interface SearchFiltersProps {
  categories: string[];
}

export default function SearchFilters({ categories }: SearchFiltersProps) {
  const { filters, setSearchTerm, setSelectedCategories, clearAllFilters } = useFilters();

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.selectedCategories.includes(category) 
      ? filters.selectedCategories.filter(c => c !== category)
      : [...filters.selectedCategories, category];
    setSelectedCategories(newCategories);
  };

  // Reset pagination when filters change
  useEffect(() => {
    // This will trigger a re-render in the parent component
  }, [filters.searchTerm, filters.selectedCategories]);

  const hasActiveFilters = filters.searchTerm || filters.selectedCategories.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">Search & Filters</h2>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search people..."
          value={filters.searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>



      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Active Filters</span>
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                Search: {filters.searchTerm}
                <button onClick={() => setSearchTerm('')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}


            {filters.selectedCategories.map(category => (
              <span key={category} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                {category}
                <button onClick={() => handleCategoryToggle(category)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}





      {/* Categories Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Categories</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.length > 0 ? (
            categories.map((category) => (
              <label key={category} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500">No categories available</p>
          )}
        </div>
      </div>
    </div>
  );
}
