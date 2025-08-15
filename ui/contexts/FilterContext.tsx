'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FilterState {
  searchTerm: string;
  selectedQuadrants: string[];
  selectedCategories: string[];
}

interface FilterContextType {
  filters: FilterState;
  setSearchTerm: (term: string) => void;
  setSelectedQuadrants: (quadrants: string[]) => void;
  setSelectedCategories: (categories: string[]) => void;
  clearAllFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedQuadrants: [],
    selectedCategories: [],
  });

  const setSearchTerm = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };



  const setSelectedQuadrants = (quadrants: string[]) => {
    setFilters(prev => ({ ...prev, selectedQuadrants: quadrants }));
  };

  const setSelectedCategories = (categories: string[]) => {
    setFilters(prev => ({ ...prev, selectedCategories: categories }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      selectedQuadrants: [],
      selectedCategories: [],
    });
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setSearchTerm,
        setSelectedQuadrants,
        setSelectedCategories,
        clearAllFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}

