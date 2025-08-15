'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Clock, ExternalLink, Eye, Edit, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CommunityMember } from '@/lib/types';
import { useFilters } from '@/contexts/FilterContext';

interface CommunityMembersListProps {
  materials: CommunityMember[];
}

export default function CommunityMembersList({ materials }: CommunityMembersListProps) {
  const { filters } = useFilters();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState<CommunityMember | null>(null);
  const [showRawData, setShowRawData] = useState(false);
  const itemsPerPage = 9;

  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      // Search filter
      if (filters.searchTerm && !material.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !material.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !material.keywords.some(keyword => keyword.toLowerCase().includes(filters.searchTerm.toLowerCase()))) {
        return false;
      }



      // Categories filter - check if any of the material's keywords match selected categories
      if (filters.selectedCategories.length > 0) {
        const materialCategories = [
          ...material.keywords,
          material.programmingLanguage,
          material.platform
        ].filter(Boolean);
        
        const hasMatchingCategory = filters.selectedCategories.some(cat => 
          materialCategories.some(mc => mc && mc.toLowerCase() === cat.toLowerCase())
        );
        
        if (!hasMatchingCategory) {
          return false;
        }
      }

      return true;
    });
  }, [materials, filters]);

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters.searchTerm, filters.selectedQuadrants, filters.selectedCategories]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaterials = filteredMaterials.slice(startIndex, endIndex);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hands-on tutorial / notebooks':
        return <BookOpen className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'workshop':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {filteredMaterials.length} Community Members
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentMaterials.map((material) => (
          <div key={material.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">
                    {material.title.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {material.title}
                  </h3>
                  <p className="text-sm text-gray-500">{material.type}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {material.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {material.description}
              </p>
            )}



            {/* Keywords */}
            {material.keywords.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {material.keywords.slice(0, 4).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                    >
                      {keyword}
                    </span>
                  ))}
                  {material.keywords.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{material.keywords.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button 
                onClick={() => setSelectedMaterial(material)}
                className="flex-1 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Eye className="w-4 h-4 inline mr-1" />
                View Profile & Expertise
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                currentPage === page
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No community members found matching your criteria.</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedMaterial.title.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{selectedMaterial.title}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-primary-100">{selectedMaterial.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRawData(!showRawData)}
                    className="px-3 py-1 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors text-sm"
                  >
                    {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMaterial(null);
                      setShowRawData(false);
                    }}
                    className="text-white hover:text-primary-100 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              {showRawData ? (
                /* Raw Data View */
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Raw Data</h3>
                    <pre className="text-sm text-gray-700 bg-white p-4 rounded border overflow-x-auto">
                      {JSON.stringify(selectedMaterial.originalData?.fields || {}, null, 2)}
                    </pre>
                  </div>
                  
                  {selectedMaterial.originalData && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Ontology Mappings</h3>
                      <pre className="text-sm text-gray-700 bg-white p-4 rounded border overflow-x-auto">
                        {JSON.stringify(selectedMaterial.originalData.mappings || {}, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                                /* Clean Profile View */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Profile Info */}
                  <div className="space-y-4">
                                      {/* About - Only show if it's unique and not just repeating other data */}
                    {selectedMaterial.description && 
                     !selectedMaterial.description.toLowerCase().includes('role:') &&
                     !selectedMaterial.description.toLowerCase().includes('expertise:') &&
                     !selectedMaterial.description.toLowerCase().includes('interests:') &&
                     selectedMaterial.description !== selectedMaterial.originalData?.fields?.Note && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          About
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{selectedMaterial.description}</p>
                      </div>
                    )}



                  {/* Keywords */}
                  {selectedMaterial.keywords.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Expertise Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMaterial.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}


                  {/* Additional Information */}
                  {selectedMaterial.originalData && selectedMaterial.originalData.fields.Note && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Additional Information
                      </h3>
                      <p className="text-gray-700">{selectedMaterial.originalData.fields.Note}</p>
                    </div>
                  )}
                </div>

                  {/* Center Column - Expertise Areas & Role */}
                  <div className="space-y-4">


                    {/* Role Information */}
                    {selectedMaterial.originalData && selectedMaterial.originalData.fields.Role && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Current Role
                        </h3>
                        <p className="text-gray-700 mb-3">{selectedMaterial.originalData.fields.Role}</p>
                        
                        {selectedMaterial.originalData.mappings.Role && 
                         selectedMaterial.originalData.mappings.Role.length > 0 &&
                         selectedMaterial.originalData.mappings.Role.some(mapping => 
                           mapping.concept_label || mapping.ontology_id || mapping.confidence || mapping.explanation
                         ) && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-800 text-sm">Ontology Mappings:</h4>
                            {selectedMaterial.originalData.mappings.Role
                              .filter(mapping => mapping.concept_label || mapping.ontology_id || mapping.confidence || mapping.explanation)
                              .map((mapping, index) => (
                              <div key={index} className="bg-white p-3 rounded border border-gray-200">
                                {mapping.concept_label && (
                                  <div className="font-medium text-gray-900 text-sm">{mapping.concept_label}</div>
                                )}
                                {mapping.ontology_id && (
                                  <div className="text-xs text-gray-500">ID: {mapping.ontology_id}</div>
                                )}
                                {mapping.confidence && (
                                  <div className="text-xs text-gray-500">Confidence: {(mapping.confidence * 100).toFixed(1)}%</div>
                                )}
                                {mapping.explanation && (
                                  <div className="text-xs text-gray-600 mt-1 italic">{mapping.explanation}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column - Expertise & Interests */}
                  <div className="space-y-4">

                  {/* Expertise Information */}
                  {selectedMaterial.originalData && selectedMaterial.originalData.fields.Expertise && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Knowledge to Share
                      </h3>
                      <p className="text-gray-700 mb-3">{selectedMaterial.originalData.fields.Expertise}</p>
                      
                      {selectedMaterial.originalData.mappings.Expertise && 
                       selectedMaterial.originalData.mappings.Expertise.length > 0 &&
                       selectedMaterial.originalData.mappings.Expertise.some(mapping => 
                         mapping.concept_label || mapping.ontology_id || mapping.confidence || mapping.explanation
                       ) && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-800 text-sm">Ontology Mappings:</h4>
                          {selectedMaterial.originalData.mappings.Expertise
                            .filter(mapping => mapping.concept_label || mapping.ontology_id || mapping.confidence || mapping.explanation)
                            .map((mapping, index) => (
                            <div key={index} className="bg-white p-3 rounded border border-gray-200">
                              {mapping.concept_label && (
                                <div className="font-medium text-gray-900 text-sm">{mapping.concept_label}</div>
                              )}
                              {mapping.ontology_id && (
                                <div className="text-xs text-gray-500">ID: {mapping.ontology_id}</div>
                              )}
                              {mapping.confidence && (
                                <div className="text-xs text-gray-500">Confidence: {(mapping.confidence * 100).toFixed(1)}%</div>
                              )}
                              {mapping.explanation && (
                                <div className="text-xs text-gray-600 mt-1 italic">{mapping.explanation}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interest Information */}
                  {selectedMaterial.originalData && selectedMaterial.originalData.fields.Interest && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Learning Interests
                      </h3>
                      <p className="text-gray-700 mb-3">{selectedMaterial.originalData.fields.Interest}</p>
                      
                      {selectedMaterial.originalData.mappings.Interest && selectedMaterial.originalData.mappings.Interest.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-800 text-sm">Ontology Mappings:</h4>
                          {selectedMaterial.originalData.mappings.Interest.map((mapping, index) => (
                            <div key={index} className="bg-white p-3 rounded border border-gray-200">
                              {mapping.concept_label && (
                                <div className="font-medium text-gray-900 text-sm">{mapping.concept_label}</div>
                              )}
                              {mapping.ontology_id && (
                                <div className="text-xs text-gray-500">ID: {mapping.ontology_id}</div>
                              )}
                              {mapping.confidence && (
                                <div className="text-xs text-gray-500">Confidence: {(mapping.confidence * 100).toFixed(1)}%</div>
                              )}
                              {mapping.explanation && (
                                <div className="text-xs text-gray-600 mt-1 italic">{mapping.explanation}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}


                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
