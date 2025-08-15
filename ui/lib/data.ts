import { KnowledgeGraphEntry, CommunityMember } from './types';

// Client-side function to fetch data from API
export async function fetchCommunityMembers(): Promise<{members: CommunityMember[], categories: string[], quadrants: string[]}> {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    return {
      members: data.materials || [],
      categories: data.categories || [],
      quadrants: data.quadrants || []
    };
  } catch (error) {
    console.error('Error fetching community members:', error);
    return { members: [], categories: [], quadrants: [] };
  }
}
