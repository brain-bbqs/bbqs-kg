import { KnowledgeGraphEntry, CommunityMember } from './types';

// Client-side function to fetch data from API
export async function fetchCommunityMembers(): Promise<{members: CommunityMember[], categories: string[]}> {
  try {
    // For static export, we'll use a different approach
    if (process.env.NODE_ENV === 'production') {
      // In production (GitHub Pages), load from static data file
      const response = await fetch('/static-data.json');
      if (!response.ok) {
        throw new Error('Failed to fetch static data');
      }
      const data = await response.json();
      return {
        members: data.materials || [],
        categories: data.categories || []
      };
    }
    
    // In development, use the API route
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    return {
      members: data.materials || [],
      categories: data.categories || []
    };
  } catch (error) {
    console.error('Error fetching community members:', error);
    return { members: [], categories: [] };
  }
}
