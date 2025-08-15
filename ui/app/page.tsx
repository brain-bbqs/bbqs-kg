'use client';

import { useState, useEffect } from 'react';
import SearchFilters from '@/components/SearchFilters';
import CommunityMembersList from '@/components/CommunityManager';
import { FilterProvider } from '@/contexts/FilterContext';
import { fetchCommunityMembers } from '@/lib/data';
import { CommunityMember } from '@/lib/types';

export default function Home() {
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchCommunityMembers();
        setCommunityMembers(data.members);
        setCategories(data.categories);
      } catch (err) {
        setError('Failed to load community members');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <FilterProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              The People of BBQS
            </h1>
            <p className="text-gray-600">
              Explore the expertise and knowledge of BBQS community members
            </p>
          </header>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Search & Filters */}
            <div className="lg:w-1/3">
              <SearchFilters categories={categories} />
            </div>

            {/* Right Main Content - Community Members */}
            <div className="lg:w-2/3">
              <CommunityMembersList materials={communityMembers} />
            </div>
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}
