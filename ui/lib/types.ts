export interface Mapping {
  concept_label: string | null;
  ontology_id: string | null;
  ontology: string | null;
  confidence: number | null;
  explanation: string | null;
}

export interface Fields {
  Role?: string;
  Expertise?: string;
  Interest?: string;
  Note?: string;
  Name?: string;
  Time?: string;
  [key: string]: any;
}

export interface Mappings {
  Role?: Mapping[];
  Expertise?: Mapping[];
  Interest?: Mapping[];
  [key: string]: Mapping[] | undefined;
}

export interface KnowledgeGraphEntry {
  fields: Fields;
  mappings: Mappings;
}

export interface CommunityMember {
  id: string;
  title: string;
  description?: string;
  type: string;
  keywords: string[];
  programmingLanguage?: string;
  platform?: string;
  accessMaterial?: string;
  originalData?: KnowledgeGraphEntry; // Include original data for ontology mappings
}

export interface FilterState {
  search: string;
  selectedQuadrants: string[];
  selectedCategories: string[];
}
