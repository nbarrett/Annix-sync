'use client';

import React, { useState } from 'react';
import MultiStepStraightPipeRfqForm from './MultiStepStraightPipeRfqForm';
import MultiStepBendRfqForm from './MultiStepBendRfqForm';

interface Props {
  onSuccess: (rfqId: string) => void;
  onCancel: () => void;
}

// Item types
export type ItemType = 'straight_pipe' | 'bend';

export default function UnifiedMultiStepRfqForm({ onSuccess, onCancel }: Props) {
  const [selectedItemType, setSelectedItemType] = useState<ItemType>('straight_pipe');

  const handleItemTypeChange = (type: ItemType) => {
    setSelectedItemType(type);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Request for Quotation</h1>
        <p className="text-gray-600">Create a comprehensive RFQ for your pipeline project</p>
      </div>

      {/* Item Type Selector */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select RFQ Type</h2>
        <div className="flex gap-4">
          <button
            onClick={() => handleItemTypeChange('straight_pipe')}
            className={`px-6 py-3 rounded-lg border-2 font-medium transition-colors ${
              selectedItemType === 'straight_pipe'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-semibold">Straight Pipe</div>
              <div className="text-sm mt-1">Standard pipeline sections</div>
            </div>
          </button>
          
          <button
            onClick={() => handleItemTypeChange('bend')}
            className={`px-6 py-3 rounded-lg border-2 font-medium transition-colors ${
              selectedItemType === 'bend'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-semibold">Bend Sections</div>
              <div className="text-sm mt-1">Elbows and custom bends</div>
            </div>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg border border-gray-300 min-h-[600px]">
        {selectedItemType === 'straight_pipe' && (
          <MultiStepStraightPipeRfqForm 
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        )}
        
        {selectedItemType === 'bend' && (
          <MultiStepBendRfqForm 
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        )}
      </div>
    </div>
  );
}