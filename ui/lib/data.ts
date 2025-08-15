import { KnowledgeGraphEntry, CommunityMember } from './types';

// Client-side function to fetch data from API
export async function fetchCommunityMembers(): Promise<{members: CommunityMember[], categories: string[]}> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
    // For static export, we'll use a different approach
            if (process.env.NODE_ENV === 'production') {
          // In production (GitHub Pages), load from static data file
          // IMPORTANT: no hardcoded leading slash without basePath
          const response = await fetch(`${base}/data.jsonl`);
          if (!response.ok) {
            throw new Error('Failed to fetch static data');
          }
          const text = await response.text();
          const lines = text.trim().split('\n');
      
      // Parse JSONL data
      const kgData = lines.map(line => JSON.parse(line));
      
      // Transform to community members
      const members: CommunityMember[] = [];
      const allCategories = new Set<string>();
      
      kgData.forEach((entry, index) => {
        if (!entry.fields?.Name) return;
        
        // Extract keywords from mappings
        const keywords: string[] = [];
        Object.values(entry.mappings).forEach((mappingArray: any) => {
          if (Array.isArray(mappingArray)) {
            mappingArray.forEach((mapping: any) => {
              if (mapping.concept_label) {
                keywords.push(mapping.concept_label);
                allCategories.add(mapping.concept_label);
              }
            });
          }
        });
        
        members.push({
          id: `member-${index}`,
          title: entry.fields.Name,
          description: entry.fields.Note || '',
          type: 'Community Member',
          keywords,
          originalData: entry
        });
      });
      
      return {
        members,
        categories: Array.from(allCategories).sort()
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
