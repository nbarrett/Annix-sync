'use client';

import React, { useState, useEffect } from 'react';
import { useRfqForm, StraightPipeEntry } from '@/app/lib/hooks/useRfqForm';
import { rfqApi } from '@/app/lib/api/client';

interface Props {
  onSuccess: (rfqId: string) => void;
  onCancel: () => void;
}

// Test data for development
const TEST_MASTER_DATA = {
  steelSpecs: [
    { id: 1, steelSpecName: 'SABS 719 (Carbon Steel)' },
    { id: 2, steelSpecName: 'ASTM A106 Grade B' },
    { id: 3, steelSpecName: 'SABS 62 (Stainless Steel)' },
  ],
  flangeStandards: [
    { id: 1, code: 'SABS 1123' },
    { id: 2, code: 'ANSI B16.5' },
    { id: 3, code: 'DIN EN 1092' }
  ],
  pressureClasses: [
    { id: 1, designation: 'Class 150' },
    { id: 2, designation: 'Class 300' },
    { id: 3, designation: 'Class 600' },
    { id: 4, designation: 'PN 10' },
    { id: 5, designation: 'PN 16' },
    { id: 6, designation: 'PN 25' }
  ]
};

function ProjectDetailsStep({ rfqData, onUpdate, errors }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Details</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={rfqData.projectName}
            onChange={(e) => onUpdate('projectName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="Enter project name"
          />
          {errors.projectName && (
            <p className="mt-2 text-sm text-red-600">{errors.projectName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Project Description
          </label>
          <textarea
            value={rfqData.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="Brief description of the project requirements"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              value={rfqData.customerName}
              onChange={(e) => onUpdate('customerName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Customer or company name"
            />
            {errors.customerName && (
              <p className="mt-2 text-sm text-red-600">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Customer Email
            </label>
            <input
              type="email"
              value={rfqData.customerEmail}
              onChange={(e) => onUpdate('customerEmail', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="customer@company.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Customer Phone
            </label>
            <input
              type="tel"
              value={rfqData.customerPhone}
              onChange={(e) => onUpdate('customerPhone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="+27 11 555 0123"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Required Date
            </label>
            <input
              type="date"
              value={rfqData.requiredDate}
              onChange={(e) => onUpdate('requiredDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Additional Notes
          </label>
          <textarea
            value={rfqData.notes}
            onChange={(e) => onUpdate('notes', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="Any special requirements, delivery instructions, or other important information"
          />
        </div>
      </div>
    </div>
  );
}

function PipeSpecificationsStep({ entries, masterData, onAddEntry, onUpdateEntry, onRemoveEntry, errors }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Straight Pipe Specifications</h2>
        <button
          onClick={() => onAddEntry()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
        >
          + Add Another Pipe
        </button>
      </div>

      <div className="space-y-6">
        {entries.map((entry: StraightPipeEntry, index: number) => (
          <div key={entry.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Pipe #{index + 1}</h3>
              {entries.length > 1 && (
                <button
                  onClick={() => onRemoveEntry(entry.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Pipe Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Pipe Description *
                </label>
                <input
                  type="text"
                  value={entry.description}
                  onChange={(e) => onUpdateEntry(entry.id, { description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., 500NB Sch20 Straight Pipe for 10 Bar Pipeline"
                />
                {errors[`pipe_${index}_description`] && (
                  <p className="mt-2 text-sm text-red-600">{errors[`pipe_${index}_description`]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Nominal Bore */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nominal Bore (mm) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={entry.specs.nominalBoreMm}
                    onChange={(e) => onUpdateEntry(entry.id, { 
                      specs: { ...entry.specs, nominalBoreMm: Number(e.target.value) }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="500"
                  />
                  {errors[`pipe_${index}_nb`] && (
                    <p className="mt-2 text-sm text-red-600">{errors[`pipe_${index}_nb`]}</p>
                  )}
                </div>

                {/* Working Pressure */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Working Pressure (bar) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={entry.specs.workingPressureBar}
                    onChange={(e) => onUpdateEntry(entry.id, { 
                      specs: { ...entry.specs, workingPressureBar: Number(e.target.value) }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="10"
                  />
                  {errors[`pipe_${index}_pressure`] && (
                    <p className="mt-2 text-sm text-red-600">{errors[`pipe_${index}_pressure`]}</p>
                  )}
                </div>

                {/* Working Temperature */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Working Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={entry.specs.workingTemperatureC || ''}
                    onChange={(e) => onUpdateEntry(entry.id, { 
                      specs: { ...entry.specs, workingTemperatureC: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="120"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Schedule Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Schedule Type *
                  </label>
                  <select
                    value={entry.specs.scheduleType}
                    onChange={(e) => onUpdateEntry(entry.id, { 
                      specs: { ...entry.specs, scheduleType: e.target.value as 'schedule' | 'wall_thickness' }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="schedule">Schedule Number</option>
                    <option value="wall_thickness">Wall Thickness</option>
                  </select>
                </div>

                {/* Schedule Number or Wall Thickness */}
                {entry.specs.scheduleType === 'schedule' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Schedule Number *
                    </label>
                    <select
                      value={entry.specs.scheduleNumber || ''}
                      onChange={(e) => onUpdateEntry(entry.id, { 
                        specs: { ...entry.specs, scheduleNumber: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="">Select Schedule</option>
                      <option value="Sch10">Sch10</option>
                      <option value="Sch20">Sch20</option>
                      <option value="Sch40">Sch40</option>
                      <option value="Sch80">Sch80</option>
                      <option value="Sch120">Sch120</option>
                      <option value="Sch160">Sch160</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Wall Thickness (mm) *
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={entry.specs.wallThicknessMm || ''}
                      onChange={(e) => onUpdateEntry(entry.id, { 
                        specs: { ...entry.specs, wallThicknessMm: e.target.value ? Number(e.target.value) : undefined }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="15.09"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Steel Specification */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Steel Specification
                  </label>
                  <select
                    value={entry.specs.steelSpecificationId || ''}
                    onChange={(e) => onUpdateEntry(entry.id, { 
                      specs: { ...entry.specs, steelSpecificationId: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Select steel spec...</option>
                    {masterData.steelSpecs.map((spec: any) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.steelSpecName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Flange Standard */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Flange Standard
                  </label>
                  <select
                    value={entry.specs.flangeStandardId || ''}
                    onChange={(e) => onUpdateEntry(entry.id, { 
                      specs: { ...entry.specs, flangeStandardId: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Select flange standard...</option>
                    {masterData.flangeStandards.map((standard: any) => (
                      <option key={standard.id} value={standard.id}>
                        {standard.code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Flange Pressure Class */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Pressure Class
                  </label>
                  <select
                    value={entry.specs.flangePressureClassId || ''}
                    onChange={(e) => onUpdateEntry(entry.id, { 
                      specs: { ...entry.specs, flangePressureClassId: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Select pressure class...</option>
                    {masterData.pressureClasses.map((pc: any) => (
                      <option key={pc.id} value={pc.id}>
                        {pc.designation}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={entry.notes || ''}
                  onChange={(e) => onUpdateEntry(entry.id, { notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Special requirements, testing notes, etc."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuantitiesCalculationsStep({ entries, onUpdateEntry, onCalculate, errors, loading }: any) {
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculateAll = async () => {
    setIsCalculating(true);
    try {
      await onCalculate();
    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const formatWeight = (weight: number | undefined) => {
    if (weight === undefined) return 'Not calculated';
    return `${weight.toFixed(2)} kg`;
  };

  const getTotalWeight = () => {
    return entries.reduce((total: number, entry: StraightPipeEntry) => {
      const entryTotal = (entry.calculation?.totalPipeWeight || 0);
      return total + entryTotal;
    }, 0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quantities & Calculations</h2>
        <button
          onClick={handleCalculateAll}
          disabled={isCalculating || loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalculating || loading ? 'Calculating...' : '🔄 Calculate All'}
        </button>
      </div>

      <div className="space-y-6">
        {entries.map((entry: StraightPipeEntry, index: number) => (
          <div key={entry.id} className="border border-gray-200 rounded-lg p-6 bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Pipe #{index + 1}: {entry.description}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {entry.specs.nominalBoreMm}mm NB • {entry.specs.workingPressureBar} bar • {entry.specs.scheduleNumber || `${entry.specs.wallThicknessMm}mm WT`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantities Input */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Quantities
                </h4>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Total Length (m) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={entry.specs.quantityValue}
                    onChange={(e) => onUpdateEntry(entry.id, { 
                      specs: { ...entry.specs, quantityValue: Number(e.target.value) }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="8000"
                  />
                  {errors[`pipe_${index}_length`] && (
                    <p className="mt-2 text-sm text-red-600">{errors[`pipe_${index}_length`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Individual Pipe Length (m) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={entry.specs.individualPipeLength}
                    onChange={(e) => onUpdateEntry(entry.id, { 
                      specs: { ...entry.specs, individualPipeLength: Number(e.target.value) }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="12.192"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Standard pipe length per joint
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Quantity Type
                  </label>
                  <select
                    value={entry.specs.quantityType}
                    onChange={(e) => onUpdateEntry(entry.id, { 
                      specs: { ...entry.specs, quantityType: e.target.value as 'total_length' | 'number_of_pipes' }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="total_length">Total Length Required</option>
                    <option value="number_of_pipes">Number of Pipes</option>
                  </select>
                </div>
              </div>

              {/* Calculations Display */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Calculated Results
                </h4>

                {entry.calculation ? (
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-900">Outside Diameter:</span>
                        <span className="text-sm font-bold text-blue-900">
                          {entry.calculation.outsideDiameterMm?.toFixed(2) || 'N/A'} mm
                        </span>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-900">Wall Thickness:</span>
                        <span className="text-sm font-bold text-green-900">
                          {entry.calculation.wallThicknessMm?.toFixed(3) || 'N/A'} mm
                        </span>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-purple-900">Weight per Meter:</span>
                        <span className="text-sm font-bold text-purple-900">
                          {entry.calculation.pipeWeightPerMeter?.toFixed(3) || 'N/A'} kg/m
                        </span>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-900">Total Weight:</span>
                        <span className="text-lg font-bold text-orange-900">
                          {formatWeight(entry.calculation.totalPipeWeight)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-700">Number of Pipes:</span>
                        <span className="text-xs text-gray-700">
                          {entry.calculation.calculatedPipeCount || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">
                      No calculations available yet.
                      <br />
                      Click "Calculate All" to generate weight calculations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Total Summary */}
        <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Project Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-blue-700">Total Pipe Entries</p>
              <p className="text-2xl font-bold text-blue-900">{entries.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-blue-700">Total Length</p>
              <p className="text-2xl font-bold text-blue-900">
                {entries.reduce((total: number, entry: StraightPipeEntry) => total + entry.specs.quantityValue, 0).toFixed(1)} m
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-blue-700">Total Weight</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatWeight(getTotalWeight())}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSubmitStep({ entries, rfqData, onSubmit, errors, loading }: any) {
  const getTotalWeight = () => {
    return entries.reduce((total: number, entry: StraightPipeEntry) => {
      return total + (entry.calculation?.totalPipeWeight || 0);
    }, 0);
  };

  const getTotalLength = () => {
    return entries.reduce((total: number, entry: StraightPipeEntry) => {
      return total + entry.specs.quantityValue;
    }, 0);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit RFQ</h2>
      
      <div className="space-y-8">
        {/* Project Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Project Name</p>
              <p className="font-medium text-gray-900">{rfqData.projectName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium text-gray-900">{rfqData.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Required Date</p>
              <p className="font-medium text-gray-900">{rfqData.requiredDate || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Email</p>
              <p className="font-medium text-gray-900">{rfqData.customerEmail || 'Not provided'}</p>
            </div>
          </div>
          {rfqData.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium text-gray-900">{rfqData.description}</p>
            </div>
          )}
        </div>

        {/* Pipe Entries Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Straight Pipe Requirements</h3>
          <div className="space-y-4">
            {entries.map((entry: StraightPipeEntry, index: number) => (
              <div key={entry.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800">Pipe #{index + 1}</h4>
                  <span className="text-sm text-gray-600">
                    {entry.calculation ? 
                      `${entry.calculation.totalPipeWeight.toFixed(2)} kg` : 
                      'Not calculated'
                    }
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                  <div>NB: {entry.specs.nominalBoreMm}mm</div>
                  <div>Pressure: {entry.specs.workingPressureBar} bar</div>
                  <div>Schedule: {entry.specs.scheduleNumber || `${entry.specs.wallThicknessMm}mm WT`}</div>
                  <div>Length: {entry.specs.quantityValue}m</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Total Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-blue-700">Total Entries</p>
              <p className="text-2xl font-bold text-blue-900">{entries.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-blue-700">Total Length</p>
              <p className="text-2xl font-bold text-blue-900">{getTotalLength().toFixed(1)} m</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-blue-700">Total Weight</p>
              <p className="text-2xl font-bold text-blue-900">
                {getTotalWeight().toFixed(2)} kg
              </p>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={onSubmit}
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting RFQ...' : '📨 Submit RFQ for Quotation'}
            </button>
          </div>
          
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</p>
              <ul className="text-sm text-red-600 space-y-1">
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key}>• {message as string}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MultiStepStraightPipeRfqForm({ onSuccess, onCancel }: Props) {
  const {
    currentStep,
    rfqData,
    updateRfqField,
    addStraightPipeEntry,
    updateStraightPipeEntry,
    removeStraightPipeEntry,
    updateEntryCalculation,
    getTotalWeight,
    getTotalValue,
    nextStep,
    prevStep,
  } = useRfqForm();

  const [masterData, setMasterData] = useState(TEST_MASTER_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Add initial entry if none exist
  useEffect(() => {
    if (rfqData.straightPipeEntries.length === 0) {
      addStraightPipeEntry();
    }
  }, [rfqData.straightPipeEntries.length, addStraightPipeEntry]);

  const handleCalculateAll = async () => {
    try {
      for (const entry of rfqData.straightPipeEntries) {
        const result = await rfqApi.calculate(entry.specs);
        updateEntryCalculation(entry.id, result);
      }
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement submission logic
      console.log('Submitting RFQ:', rfqData);
      onSuccess('temp-rfq-id');
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Project Details', description: 'Basic project information' },
    { number: 2, title: 'Pipe Specifications', description: 'Technical requirements' },
    { number: 3, title: 'Quantities & Calculations', description: 'Measurements and weights' },
    { number: 4, title: 'Review & Submit', description: 'Final review and submission' }
  ];

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectDetailsStep
            rfqData={rfqData}
            onUpdate={updateRfqField}
            errors={validationErrors}
          />
        );
      case 2:
        return (
          <PipeSpecificationsStep
            entries={rfqData.straightPipeEntries}
            masterData={masterData}
            onAddEntry={addStraightPipeEntry}
            onUpdateEntry={updateStraightPipeEntry}
            onRemoveEntry={removeStraightPipeEntry}
            errors={validationErrors}
          />
        );
      case 3:
        return (
          <QuantitiesCalculationsStep
            entries={rfqData.straightPipeEntries}
            onUpdateEntry={updateStraightPipeEntry}
            onCalculate={handleCalculateAll}
            errors={validationErrors}
            loading={false}
          />
        );
      case 4:
        return (
          <ReviewSubmitStep
            entries={rfqData.straightPipeEntries}
            rfqData={rfqData}
            onSubmit={handleSubmit}
            errors={validationErrors}
            loading={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Create Straight Pipe RFQ - test2
              </h1>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.number === currentStep
                        ? 'bg-blue-600 text-white'
                        : step.number < currentStep
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.number < currentStep ? '✓' : step.number}
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden sm:block w-16 h-0.5 mx-4 ${
                        step.number < currentStep ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-8">
            {renderCurrentStep()}
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              ← Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                Next →
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}