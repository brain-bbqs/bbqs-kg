import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { KnowledgeGraphEntry, CommunityMember } from '@/lib/types';

async function loadKnowledgeGraphData(): Promise<KnowledgeGraphEntry[]> {
  try {
    // Use environment variable for data path, fallback to default
    const dataPath = process.env.DATA_PATH || path.join(process.cwd(), 'data', 'output_kg.jsonl');
    
    // If DATA_PATH is provided as a relative path, resolve it from the project root
    const resolvedPath = path.isAbsolute(dataPath) 
      ? dataPath 
      : path.join(process.cwd(), dataPath);
    
    console.log(`Loading data from: ${resolvedPath}`);
    
    if (!fs.existsSync(resolvedPath)) {
      console.error(`Data file not found at: ${resolvedPath}`);
      return [];
    }
    
    const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading knowledge graph data:', error);
    return [];
  }
}

function transformToCommunityMembers(data: KnowledgeGraphEntry[]): CommunityMember[] {
  return data
    .filter(entry => entry.fields.Name) // Only include entries with names
    .map((entry, index) => {
      const expertise = entry.fields.Expertise || '';
      const interest = entry.fields.Interest || '';
      const role = entry.fields.Role || '';
      const note = entry.fields.Note || '';
      
      // Extract keywords from mappings
      const keywords = [
        ...(entry.mappings.Expertise?.map(m => m.concept_label).filter(Boolean) || []),
        ...(entry.mappings.Interest?.map(m => m.concept_label).filter(Boolean) || []),
        ...(entry.mappings.Role?.map(m => m.concept_label).filter(Boolean) || [])
      ];

      // Determine type based on role/expertise
      let type = 'Community Member';
      if (role.toLowerCase().includes('student') || role.toLowerCase().includes('graduate')) {
        type = 'Student';
      } else if (role.toLowerCase().includes('researcher') || role.toLowerCase().includes('research')) {
        type = 'Researcher';
      } else if (role.toLowerCase().includes('professor') || role.toLowerCase().includes('faculty')) {
        type = 'Faculty';
      } else if (role.toLowerCase().includes('developer') || role.toLowerCase().includes('engineer')) {
        type = 'Developer';
      }



      // Determine programming language
      let programmingLanguage = '';
      if (expertise.toLowerCase().includes('python') || interest.toLowerCase().includes('python')) {
        programmingLanguage = 'Python';
      } else if (expertise.toLowerCase().includes('r') || interest.toLowerCase().includes('r')) {
        programmingLanguage = 'R';
      } else if (expertise.toLowerCase().includes('matlab') || interest.toLowerCase().includes('matlab')) {
        programmingLanguage = 'MATLAB';
      } else if (expertise.toLowerCase().includes('git') || interest.toLowerCase().includes('git')) {
        programmingLanguage = 'Git';
      }

      // Determine platform
      let platform = 'NA';
      if (expertise.toLowerCase().includes('jupyter') || interest.toLowerCase().includes('jupyter')) {
        platform = 'Jupyter';
      } else if (expertise.toLowerCase().includes('rstudio') || interest.toLowerCase().includes('rstudio')) {
        platform = 'RStudio';
      } else if (expertise.toLowerCase().includes('matlab') || interest.toLowerCase().includes('matlab')) {
        platform = 'MATLAB';
      }

      // Determine quadrants based on what they want to share/learn
      const quadrants = [];
      if (expertise.toLowerCase().includes('reference') || interest.toLowerCase().includes('reference')) {
        quadrants.push('information-oriented (reference)');
      }
      if (expertise.toLowerCase().includes('explanation') || interest.toLowerCase().includes('explanation')) {
        quadrants.push('understanding-oriented (explanation)');
      }
      if (expertise.toLowerCase().includes('tutorial') || interest.toLowerCase().includes('tutorial')) {
        quadrants.push('learning-oriented (tutorials)');
      }
      if (expertise.toLowerCase().includes('guide') || interest.toLowerCase().includes('guide')) {
        quadrants.push('problem-oriented (how to guides)');
      }

      // Create description from role, expertise, and interests
      const description = note || `${role ? `Role: ${role}. ` : ''}${expertise ? `Expertise: ${expertise}. ` : ''}${interest ? `Interests: ${interest}` : ''}`.trim();

      return {
        id: `member-${index}`,
        title: entry.fields.Name || 'Anonymous Member',
        description: description,
        type,
        keywords: Array.from(new Set(keywords.filter(Boolean))) as string[],
        programmingLanguage,
        platform,
        originalData: entry // Include the original data for ontology mappings
      };
    });
}

export async function GET() {
  try {
    const kgData = await loadKnowledgeGraphData();
    const communityMembers = transformToCommunityMembers(kgData);
    
    // Extract all unique categories from mappings
    const allCategories = new Set<string>();
    
    kgData.forEach(entry => {
      // Extract concept labels from all mapping fields
      Object.values(entry.mappings).forEach(mappingArray => {
        if (Array.isArray(mappingArray)) {
          mappingArray.forEach(mapping => {
            if (mapping.concept_label) {
              allCategories.add(mapping.concept_label);
            }
          });
        }
      });
    });
    
    const categories = Array.from(allCategories).sort();
    
    return NextResponse.json({ 
      materials: communityMembers,
      categories: categories
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
