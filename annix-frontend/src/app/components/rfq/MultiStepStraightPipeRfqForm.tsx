'use client';

import React, { useState, useEffect } from 'react';
import { useRfqForm, StraightPipeEntry } from '@/app/lib/hooks/useRfqForm';
import { rfqApi } from '@/app/lib/api/client';
import { 
  validatePage1RequiredFields, 
  validatePage2Specifications, 
  validatePage3Items,
  canProceedToNextStep 
} from '@/app/lib/utils/validation';
import { 
  generateSystemReferenceNumber,
  generateItemNumber,
  generatePipeDescription,
  calculateScheduleFromPressureAndNB,
  calculateWallThicknessFromPressureAndNB,
  updateQuantityOrTotalLength,
  getAvailableFlangeClasses
} from '@/app/lib/utils/systemUtils';

interface Props {
  onSuccess: (rfqId: string) => void;
  onCancel: () => void;
}

// Master data structure for API integration
interface MasterData {
  steelSpecs: Array<{ id: number; steelSpecName: string }>;
  flangeStandards: Array<{ id: number; code: string }>;
  pressureClasses: Array<{ id: number; designation: string }>;
  nominalBores?: Array<{ id: number; nominal_diameter_mm: number; outside_diameter_mm: number }>;
}

// Pipe end configuration options
const PIPE_END_OPTIONS = [
  { value: 'PE', label: 'PE - Plain ended' },
  { value: 'FOE', label: 'FOE - Flanged one end' },
  { value: 'FBE', label: 'FBE - Flanged both ends' },
  { value: 'FOE_LF', label: 'FOE + L/F - Flanged one end + loose flange for site weld' },
  { value: 'FOE_RF', label: 'FOE + R/F - Flanged one end + Rotating flange' },
  { value: '2X_RF', label: '2 x R/F - Rotating flanges both ends' },
] as const;

function ProjectDetailsStep({ rfqData, onUpdate, errors }: any) {
  const [additionalNotes, setAdditionalNotes] = useState<string[]>([]);
  
  const commonNotes = [
    "All pipes to be hydrostatically tested before delivery",
    "Material certificates required (EN 10204 3.1)",
    "Pipes to be supplied with protective end caps",
    "Delivery required to site in South Africa",
    "All flanges to be raised face (RF) unless specified",
    "Pipes to comply with SABS/SANS standards",
    "Mill test certificates required for all items",
    "Surface preparation: Shot blast to SA2.5 standard",
    "Urgent delivery required - please expedite",
    "Client inspection required before dispatch"
  ];

  // Auto-generate RFQ number if field is empty
  useEffect(() => {
    if (!rfqData.projectName || rfqData.projectName.trim() === '') {
      const autoGenNumber = generateSystemReferenceNumber();
      onUpdate('projectName', autoGenNumber);
    }
  }, []);

  const addNote = (note: string) => {
    if (note && !additionalNotes.includes(note)) {
      const newNotes = [...additionalNotes, note];
      setAdditionalNotes(newNotes);
      const currentNotes = rfqData.notes || '';
      const updatedNotes = currentNotes ? `${currentNotes}\n• ${note}` : `• ${note}`;
      onUpdate('notes', updatedNotes);
    }
  };

  const removeNote = (noteToRemove: string) => {
    const newNotes = additionalNotes.filter(note => note !== noteToRemove);
    setAdditionalNotes(newNotes);
    const updatedNotes = newNotes.length > 0 ? newNotes.map(note => `• ${note}`).join('\n') : '';
    onUpdate('notes', updatedNotes);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Project/RFQ Details</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Project/RFQ Name
          </label>
          <input
            type="text"
            value={rfqData.projectName}
            onChange={(e) => onUpdate('projectName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="Enter project/RFQ name (auto-generated if left empty)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave empty for system-generated RFQ number (e.g., RFQ-2025-001)
          </p>
          {errors.projectName && (
            <p className="mt-2 text-sm text-red-600">{errors.projectName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            RFQ Description
          </label>
          <textarea
            value={rfqData.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="Brief description of the RFQ requirements"
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
              Customer Email *
            </label>
            <input
              type="email"
              value={rfqData.customerEmail}
              onChange={(e) => onUpdate('customerEmail', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="customer@company.com"
              required
            />
            {errors.customerEmail && (
              <p className="mt-2 text-sm text-red-600">{errors.customerEmail}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Customer Phone *
            </label>
            <input
              type="tel"
              value={rfqData.customerPhone}
              onChange={(e) => onUpdate('customerPhone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="+27 11 555 0123"
              required
            />
            {errors.customerPhone && (
              <p className="mt-2 text-sm text-red-600">{errors.customerPhone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Required Date *
            </label>
            <input
              type="date"
              value={rfqData.requiredDate}
              onChange={(e) => onUpdate('requiredDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
            {errors.requiredDate && (
              <p className="mt-2 text-sm text-red-600">{errors.requiredDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Additional Notes
            <button
              type="button"
              className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
              title="Common notes available"
            >
              ⓘ
            </button>
          </label>
          
          {/* Common Notes Dropdown */}
          <div className="mb-3">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addNote(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
            >
              <option value="">Select common note to add...</option>
              {commonNotes.map((note, index) => (
                <option key={index} value={note} disabled={additionalNotes.includes(note)}>
                  {note}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Notes Display */}
          {additionalNotes.length > 0 && (
            <div className="mb-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">Selected Notes:</p>
              {additionalNotes.map((note, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                  <span className="text-sm text-blue-800">• {note}</span>
                  <button
                    type="button"
                    onClick={() => removeNote(note)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Custom Notes Textarea */}
          <textarea
            value={rfqData.notes}
            onChange={(e) => onUpdate('notes', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="Enter any additional custom requirements, delivery instructions, or other important information..."
          />
          
          <p className="mt-1 text-xs text-gray-500">
            Use the dropdown above to quickly add common notes, or type custom notes here.
          </p>
        </div>
      </div>
    </div>
  );
}

function SpecificationsStep({ globalSpecs, onUpdateGlobalSpecs, masterData, errors }: any) {
  const workingPressures = [6, 10, 16, 25, 40, 63, 100, 160, 250, 320, 400, 630]; // Bar values
  const workingTemperatures = [-29, -20, 0, 20, 50, 80, 120, 150, 200, 250, 300, 350, 400, 450, 500]; // Celsius values

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
      <p className="text-gray-600 mb-8">
        Define the working conditions and material specifications for your RFQ. These will be applied to all items unless overridden.
      </p>

      <div className="space-y-8">
        {/* Working Conditions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Working Conditions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Working Pressure */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Working Pressure (bar) *
              </label>
              <select
                value={globalSpecs?.workingPressureBar || ''}
                onChange={(e) => onUpdateGlobalSpecs({
                  ...globalSpecs,
                  workingPressureBar: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              >
                <option value="">Select pressure...</option>
                {workingPressures.map((pressure) => (
                  <option key={pressure} value={pressure}>
                    {pressure} bar
                  </option>
                ))}
              </select>
              {errors.workingPressure && (
                <p className="mt-2 text-sm text-red-600">{errors.workingPressure}</p>
              )}
            </div>

            {/* Working Temperature */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Working Temperature (°C) *
              </label>
              <select
                value={globalSpecs?.workingTemperatureC || ''}
                onChange={(e) => onUpdateGlobalSpecs({
                  ...globalSpecs,
                  workingTemperatureC: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              >
                <option value="">Select temperature...</option>
                {workingTemperatures.map((temp) => (
                  <option key={temp} value={temp}>
                    {temp}°C
                  </option>
                ))}
              </select>
              {errors.workingTemperature && (
                <p className="mt-2 text-sm text-red-600">{errors.workingTemperature}</p>
              )}
            </div>
          </div>
        </div>

        {/* Material Specifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Material Specifications</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Steel Specification */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Steel Specification
              </label>
              <select
                value={globalSpecs?.steelSpecificationId || ''}
                onChange={(e) => onUpdateGlobalSpecs({
                  ...globalSpecs,
                  steelSpecificationId: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Select steel specification...</option>
                {masterData.steelSpecs.map((spec: any) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.steelSpecName || spec.steel_spec_name || `Steel Spec ${spec.id}`}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to specify per item on the next page
              </p>
            </div>

            {/* Flange Standard */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Flange Standard
              </label>
              <select
                value={globalSpecs?.flangeStandardId || ''}
                onChange={(e) => onUpdateGlobalSpecs({
                  ...globalSpecs,
                  flangeStandardId: e.target.value ? Number(e.target.value) : undefined
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
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to specify per item on the next page
              </p>
            </div>
          </div>
        </div>

        {/* Future Additions Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Coming Soon</h3>
          <p className="text-blue-700 text-sm">
            Additional specifications will be added here in future updates:
          </p>
          <ul className="text-blue-600 text-sm mt-2 space-y-1">
            <li>• Surface Protection requirements</li>
            <li>• Design Factors</li>
            <li>• Additional material specifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ItemUploadStep({ entries, globalSpecs, masterData, onAddEntry, onUpdateEntry, onRemoveEntry, onCalculate, errors, loading }: any) {
  const [isCalculating, setIsCalculating] = useState(false);

  // Use nominal bores from master data, fallback to hardcoded values
  // Remove duplicates using Set and sort
  const nominalBores = (masterData.nominalBores?.length > 0 
    ? Array.from(new Set(masterData.nominalBores.map((nb: any) => nb.nominal_diameter_mm as number))).sort((a, b) => (a as number) - (b as number))
    : [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000]) as number[]; // fallback values

  // Check for potentially invalid schedules (Sch10, Sch20, Sch30, etc. that don't exist for all NBs)
  const hasInvalidSchedules = entries.some((entry: StraightPipeEntry) => {
    const schedule = entry.specs.scheduleNumber;
    return schedule && (schedule === 'Sch10' || schedule === 'Sch20' || schedule === 'Sch30' || schedule === 'Sch5');
  });

  const fixInvalidSchedules = () => {
    entries.forEach((entry: StraightPipeEntry) => {
      const schedule = entry.specs.scheduleNumber;
      if (schedule === 'Sch10' || schedule === 'Sch20' || schedule === 'Sch30' || schedule === 'Sch5') {
        onUpdateEntry(entry.id, {
          specs: { ...entry.specs, scheduleNumber: 'STD' } // Default to STD
        });
      }
    });
    alert('Invalid schedules have been changed to STD. Please review and adjust if needed.');
  };

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
      const entryTotal = (entry.calculation?.totalSystemWeight || 0);
      return total + entryTotal;
    }, 0);
  };

  const generateItemDescription = (entry: any) => {
    return generatePipeDescription(
      entry.specs.nominalBoreMm,
      entry.specs.scheduleNumber,
      entry.specs.wallThicknessMm,
      undefined, // Steel spec name - would need to lookup from masterData
      globalSpecs?.workingPressureBar || entry.specs.workingPressureBar
    );
  };

  // Auto-calculate schedule and wall thickness when pressure and NB are available
  const autoCalculateSpecs = async (entry: any) => {
    const pressure = globalSpecs?.workingPressureBar;
    const nominalBore = entry.specs.nominalBoreMm;
    const steelSpecId = globalSpecs?.steelSpecificationId;
    
    if (pressure && nominalBore) {
      try {
        const { masterDataApi } = await import('@/app/lib/api/client');
        
        const recommended = await masterDataApi.getRecommendedSpecs(
          nominalBore,
          pressure,
          entry.specs.workingTemperatureC || globalSpecs?.workingTemperatureC || 20,
          steelSpecId
        );
        
        return {
          scheduleNumber: recommended.schedule,
          wallThicknessMm: recommended.wallThickness,
          workingPressureBar: pressure,
          minimumSchedule: recommended.schedule,
          minimumWallThickness: recommended.wallThickness,
          availableUpgrades: recommended.availableUpgrades || [],
          isScheduleOverridden: false
        };
      } catch (error) {
        console.error('Error auto-calculating specs:', error);
        return {};
      }
    }
    return {};
  };

  const calculateQuantities = (entry: any, field: string, value: number) => {
    const pipeLength = entry.specs.individualPipeLength || 12.192;
    
    if (field === 'totalLength') {
      // User changed total length -> calculate quantity
      const quantity = Math.ceil(value / pipeLength);
      return {
        ...entry,
        specs: {
          ...entry.specs,
          quantityValue: value,
          quantityType: 'total_length'
        },
        calculatedPipes: quantity
      };
    } else if (field === 'numberOfPipes') {
      // User changed quantity -> calculate total length
      const totalLength = value * pipeLength;
      return {
        ...entry,
        specs: {
          ...entry.specs,
          quantityValue: value,  // Store number of pipes
          quantityType: 'number_of_pipes'  // Set correct type
        },
        calculatedPipes: value
      };
    }
    return entry;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Item Upload</h2>
        <div className="flex gap-3">
          {hasInvalidSchedules && (
            <button
              onClick={fixInvalidSchedules}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-sm"
              title="Some items have invalid schedules (Sch10, Sch20, etc.) that may not exist in the database"
            >
              ⚠️ Fix Invalid Schedules
            </button>
          )}
          <button
            onClick={() => onAddEntry()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            + Add Another Item
          </button>
          <button
            onClick={handleCalculateAll}
            disabled={isCalculating || loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating || loading ? 'Calculating...' : '🔄 Calculate All'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {entries.map((entry: StraightPipeEntry, index: number) => (
          <div key={entry.id} className="border border-gray-200 rounded-md p-3 bg-white">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-semibold text-gray-800">Item #{index + 1}</h3>
              {entries.length > 1 && (
                <button
                  onClick={() => onRemoveEntry(entry.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove Item
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Item Description - Editable with Auto-generation */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Item Description *
                </label>
                <textarea
                  value={entry.description || generateItemDescription(entry)}
                  onChange={(e) => onUpdateEntry(entry.id, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 min-h-[60px]"
                  placeholder="Enter item description..."
                  required
                />
                <div className="flex justify-between items-center mt-0.5">
                  <p className="text-xs text-gray-700">
                    Edit the description or use the auto-generated one
                  </p>
                  {entry.description && entry.description !== generateItemDescription(entry) && (
                    <button
                      type="button"
                      onClick={() => onUpdateEntry(entry.id, { description: generateItemDescription(entry) })}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Reset to Auto-generated
                    </button>
                  )}
                </div>
              </div>

              {/* Client Item Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Client Item Number
                </label>
                <input
                  type="text"
                  value={entry.clientItemNumber || ''}
                  onChange={(e) => onUpdateEntry(entry.id, { clientItemNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Leave empty for auto-generated number (e.g., ITM-001)"
                />
                <p className="mt-0.5 text-xs text-gray-700">
                  Your reference number for this item (auto-generated if left empty)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column - Item Specifications */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">
                    Item Specifications
                  </h4>

                  {/* Nominal Bore */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Nominal Bore (mm) *
                    </label>
                    <select
                      value={entry.specs.nominalBoreMm}
                      onChange={async (e) => {
                        const nominalBore = Number(e.target.value);
                        
                        // First update with the nominal bore
                        onUpdateEntry(entry.id, {
                          specs: { 
                            ...entry.specs, 
                            nominalBoreMm: nominalBore
                          }
                        });
                        
                        // Then calculate auto specs asynchronously
                        try {
                          const autoSpecs = await autoCalculateSpecs({ 
                            specs: { ...entry.specs, nominalBoreMm: nominalBore } 
                          });
                          
                          const updatedEntry = {
                            ...entry,
                            specs: { 
                              ...entry.specs, 
                              nominalBoreMm: nominalBore,
                              ...autoSpecs
                            }
                          };
                          
                          updatedEntry.description = generateItemDescription(updatedEntry);
                          onUpdateEntry(entry.id, updatedEntry);
                        } catch (error) {
                          console.error('Error auto-calculating specs:', error);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    >
                      <option value="">Select nominal bore...</option>
                      {nominalBores.map((nb: number) => (
                        <option key={nb} value={nb}>
                          {nb}mm NB
                        </option>
                      ))}
                    </select>
                    {errors[`pipe_${index}_nb`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`pipe_${index}_nb`]}</p>
                    )}
                  </div>

                  {/* Schedule/Wall Thickness - Auto/Manual with Upgrade Option */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Schedule/Wall Thickness
                      {globalSpecs?.workingPressureBar ? (
                        <span className="text-green-600 text-xs ml-2">(Automated)</span>
                      ) : (
                        <span className="text-orange-600 text-xs ml-2">(Manual Selection Required)</span>
                      )}
                      {entry.isScheduleOverridden && (
                        <span className="text-blue-600 text-xs ml-2 font-bold">(User Override)</span>
                      )}
                    </label>
                    
                    {globalSpecs?.workingPressureBar && entry.specs.nominalBoreMm ? (
                      <>
                        <div className="bg-green-50 p-2 rounded-md space-y-2">
                          <p className="text-green-800 font-medium text-xs mb-2">
                            Auto-calculated based on {globalSpecs.workingPressureBar} bar and {entry.specs.nominalBoreMm}mm NB
                            {entry.minimumSchedule && (
                              <span className="block text-green-700 mt-0.5">
                                Minimum recommended: {entry.minimumSchedule} ({entry.minimumWallThickness}mm)
                              </span>
                            )}
                          </p>

                          {/* Editable Schedule */}
                          <div>
                            <label className="block text-xs font-medium text-black mb-1">
                              Current Schedule *
                            </label>
                            <select
                              value={entry.specs.scheduleNumber || ''}
                              onChange={(e) => {
                                const newSchedule = e.target.value;
                                // Check if it's a downgrade
                                const isDowngrade = entry.minimumSchedule && newSchedule && 
                                  entry.availableUpgrades && 
                                  !entry.availableUpgrades.some((u: any) => 
                                    (u.schedule_designation || u.schedule_number?.toString()) === newSchedule
                                  ) && newSchedule !== entry.minimumSchedule;
                                
                                if (isDowngrade) {
                                  alert(`Cannot downgrade below minimum recommended schedule (${entry.minimumSchedule})`);
                                  return;
                                }
                                
                                onUpdateEntry(entry.id, {
                                  specs: { ...entry.specs, scheduleNumber: newSchedule },
                                  isScheduleOverridden: newSchedule !== entry.minimumSchedule
                                });
                              }}
                              className="w-full px-2 py-1.5 text-black border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select schedule...</option>
                              <option value="STD">STD (Standard)</option>
                              <option value="XS">XS (Extra Strong)</option>
                              <option value="XXS">XXS (Double Extra Strong)</option>
                              <option value="40">Schedule 40</option>
                              <option value="80">Schedule 80</option>
                              <option value="120">Schedule 120</option>
                              <option value="160">Schedule 160</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HEAVY">Heavy</option>
                            </select>
                          </div>

                          {/* Editable Wall Thickness */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Wall Thickness (mm) *
                            </label>
                            <input
                              type="number"
                              step="0.001"
                              value={entry.specs.wallThicknessMm || ''}
                              onChange={(e) => {
                                const newWT = Number(e.target.value);
                                // Check if it's below minimum
                                if (entry.minimumWallThickness && newWT < entry.minimumWallThickness) {
                                  alert(`Wall thickness cannot be less than minimum recommended (${entry.minimumWallThickness}mm)`);
                                  return;
                                }
                                onUpdateEntry(entry.id, {
                                  specs: { ...entry.specs, wallThicknessMm: newWT },
                                  isScheduleOverridden: true
                                });
                              }}
                              className="w-full px-2 py-1.5 text-black border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="e.g., 12.7"
                            />
                          </div>

                          {/* Upgrade Suggestions */}
                          {entry.availableUpgrades && entry.availableUpgrades.length > 0 && (
                            <div className="border-t border-green-200 pt-2 mt-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                💡 Available Upgrades
                              </label>
                              <div className="text-xs text-gray-600 space-y-1">
                                {entry.availableUpgrades.slice(0, 3).map((upgrade: any) => (
                                  <button
                                    key={upgrade.id}
                                    type="button"
                                    onClick={() => {
                                      onUpdateEntry(entry.id, {
                                        ...entry,
                                        specs: {
                                          ...entry.specs,
                                          scheduleNumber: upgrade.schedule_designation || upgrade.schedule_number?.toString(),
                                          wallThicknessMm: upgrade.wall_thickness_mm,
                                        },
                                        isScheduleOverridden: true
                                      });
                                    }}
                                    className="block w-full text-left px-2 py-1 hover:bg-green-100 rounded text-xs"
                                  >
                                    → {upgrade.schedule_designation || upgrade.schedule_number?.toString()} ({upgrade.wall_thickness_mm}mm)
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 mt-1">
                          Values can be edited manually. Cannot go below minimum recommended.
                        </p>
                      </>
                    ) : (
                      <>
                        <select
                          value={entry.specs.scheduleNumber || ''}
                          onChange={(e) => onUpdateEntry(entry.id, { 
                            specs: { ...entry.specs, scheduleNumber: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        >
                          <option value="">Select schedule...</option>
                          <option value="STD">STD (Standard)</option>
                          <option value="XS">XS (Extra Strong)</option>
                          <option value="XXS">XXS (Double Extra Strong)</option>
                          <option value="40">Schedule 40</option>
                          <option value="80">Schedule 80</option>
                          <option value="120">Schedule 120</option>
                          <option value="160">Schedule 160</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HEAVY">Heavy</option>
                        </select>
                        <p className="mt-0.5 text-xs text-gray-700">
                          Select a standard schedule. If the combination is not available in the database, you'll see an error when calculating.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Pipe Lengths */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Length of Each Pipe (m) *
                    </label>
                    <div className="flex gap-2 mb-1">
                      <button
                        type="button"
                        onClick={() => onUpdateEntry(entry.id, { specs: { ...entry.specs, individualPipeLength: 6.1 } })}
                        className="px-2 py-1 text-black text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                      >
                        6.1m
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateEntry(entry.id, { specs: { ...entry.specs, individualPipeLength: 9.144 } })}
                        className="px-2 py-1 text-black ext-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                      >
                        9.144m
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateEntry(entry.id, { specs: { ...entry.specs, individualPipeLength: 12.192 } })}
                        className="px-2 py-1 text-black text-xs bg-blue-100 hover:bg-blue-200 rounded border border-blue-300 font-medium"
                      >
                        12.192m (Standard)
                      </button>
                    </div>
                    <input
                      type="number"
                      step="0.001"
                      value={entry.specs.individualPipeLength}
                      onChange={(e) => onUpdateEntry(entry.id, { 
                        specs: { ...entry.specs, individualPipeLength: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="12.192"
                      required
                    />
                    <p className="mt-0.5 text-xs text-gray-700">
                      Standard imported lengths: 6.1m, 9.144m, or 12.192m (can be custom)
                    </p>
                  </div>
                </div>

                {/* Right Column - Quantities */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">
                    Quantities & Calculations
                  </h4>

                  {/* Pipe End Configuration - NEW FIELD */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Pipe End Configuration *
                    </label>
                    <select
                      value={entry.specs.pipeEndConfiguration || 'PE'}
                      onChange={(e) => onUpdateEntry(entry.id, {
                        specs: { ...entry.specs, pipeEndConfiguration: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    >
                      {PIPE_END_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <p className="mt-0.5 text-xs text-gray-700">
                      Select how the pipe ends should be configured
                    </p>
                  </div>

                  {/* Total Length - MOVED ABOVE QUANTITY */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Total Length of Line (m) *
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={
                        entry.specs.quantityType === 'total_length' 
                          ? entry.specs.quantityValue || 0
                          : (entry.calculatedPipes || 0) * (entry.specs.individualPipeLength || 12.192)
                      }
                      onChange={(e) => {
                        const totalLength = Number(e.target.value);
                        const updatedEntry = calculateQuantities(entry, 'totalLength', totalLength);
                        onUpdateEntry(entry.id, updatedEntry);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="8000"
                      required
                    />
                    <p className="mt-0.5 text-xs text-gray-700">
                      Total pipeline length required
                    </p>
                  </div>

                  {/* Quantity of Items - MOVED BELOW TOTAL LENGTH */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Quantity of Items (Each) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={
                        entry.specs.quantityType === 'number_of_pipes'
                          ? entry.specs.quantityValue || 0
                          : entry.calculatedPipes || Math.ceil((entry.specs.quantityValue || 0) / (entry.specs.individualPipeLength || 12.192))
                      }
                      onChange={(e) => {
                        const numberOfPipes = Number(e.target.value);
                        const updatedEntry = calculateQuantities(entry, 'numberOfPipes', numberOfPipes);
                        onUpdateEntry(entry.id, updatedEntry);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="1000"
                      required
                    />
                    <p className="mt-0.5 text-xs text-gray-700">
                      Number of individual pipes required
                    </p>
                  </div>

                  {/* Flange Information */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Flanges
                      {globalSpecs?.flangeStandardId ? (
                        <span className="text-green-600 text-xs ml-2">(From Global Specs)</span>
                      ) : (
                        <span className="text-orange-600 text-xs ml-2">(Item Specific)</span>
                      )}
                    </label>
                    
                    {globalSpecs?.flangeStandardId ? (
                      <div className="bg-green-50 p-2 rounded-md">
                        <p className="text-green-800 text-xs">
                          Using global flange standard from specifications page
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <select
                          value={entry.specs.flangeStandardId || ''}
                          onChange={(e) => onUpdateEntry(entry.id, { 
                            specs: { ...entry.specs, flangeStandardId: e.target.value ? Number(e.target.value) : undefined }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        >
                          <option value="">Select flange standard...</option>
                          {masterData.flangeStandards.map((standard: any) => (
                            <option key={standard.id} value={standard.id}>
                              {standard.code}
                            </option>
                          ))}
                        </select>
                        
                        <select
                          value={entry.specs.flangePressureClassId || ''}
                          onChange={(e) => onUpdateEntry(entry.id, { 
                            specs: { ...entry.specs, flangePressureClassId: e.target.value ? Number(e.target.value) : undefined }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        >
                          <option value="">Select pressure class...</option>
                          {masterData.pressureClasses.map((pc: any) => (
                            <option key={pc.id} value={pc.id}>
                              {pc.designation}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Calculation Results */}
                  {entry.calculation && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-md space-y-2">
                      <h5 className="text-sm font-semibold text-blue-900 mb-2 border-b border-blue-200 pb-1">
                        📊 Calculated Results
                      </h5>
                      
                      {/* Pipe Quantities */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-700 font-medium">Quantity of Pipes</p>
                          <p className="text-lg font-bold text-gray-900">{entry.calculation.calculatedPipeCount}</p>
                          <p className="text-xs text-gray-700">pieces</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-700 font-medium">Total Length</p>
                          <p className="text-lg font-bold text-gray-900">{entry.calculation.calculatedTotalLength?.toFixed(2)}</p>
                          <p className="text-xs text-gray-700">meters</p>
                        </div>
                      </div>

                      {/* Weight */}
                      <div className="bg-white p-2 rounded">
                        <p className="text-xs text-gray-700 font-medium mb-1">Total System Weight</p>
                        <p className="text-xl font-bold text-blue-900">{formatWeight(entry.calculation.totalSystemWeight)}</p>
                        <div className="text-xs text-gray-700 mt-0.5 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Pipes:</span>
                            <span>{formatWeight(entry.calculation.totalPipeWeight)}</span>
                          </div>
                          {entry.calculation.totalFlangeWeight > 0 && (
                            <div className="flex justify-between">
                              <span>Flanges:</span>
                              <span>{formatWeight(entry.calculation.totalFlangeWeight)}</span>
                            </div>
                          )}
                          {entry.calculation.totalBoltWeight > 0 && (
                            <div className="flex justify-between">
                              <span>Bolts:</span>
                              <span>{formatWeight(entry.calculation.totalBoltWeight)}</span>
                            </div>
                          )}
                          {entry.calculation.totalNutWeight > 0 && (
                            <div className="flex justify-between">
                              <span>Nuts:</span>
                              <span>{formatWeight(entry.calculation.totalNutWeight)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Flanges */}
                      <div className="bg-white p-2 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-700 font-medium">Flanges Required</p>
                            <p className="text-lg font-bold text-gray-900">{entry.calculation.numberOfFlanges}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-700 font-medium">Flange Welds</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {entry.calculation.numberOfFlangeWelds} ({entry.calculation.totalFlangeWeldLength?.toFixed(2)}m)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Butt Welds */}
                      <div className="bg-white p-2 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-700 font-medium">Butt Welds</p>
                            <p className="text-lg font-bold text-gray-900">{entry.calculation.numberOfButtWelds}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-700 font-medium">Total Weld Length</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {entry.calculation.totalButtWeldLength?.toFixed(2)}m
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Summary Note */}
                      <p className="text-xs text-blue-900 font-medium bg-blue-100 p-2 rounded mt-2">
                        💡 Based on {entry.specs.individualPipeLength}m pipe lengths with {entry.specs.pipeEndConfiguration || 'PE'} configuration
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Total Summary */}
        <div className="border-2 border-blue-200 rounded-md p-3 bg-blue-50">
          <h3 className="text-base font-bold text-blue-900 mb-2">Project Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs font-medium text-blue-700">Total Pipe Entries</p>
              <p className="text-lg font-bold text-blue-900">{entries.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-blue-700">Total Length</p>
              <p className="text-lg font-bold text-blue-900">
                {entries.reduce((total: number, entry: StraightPipeEntry) => total + entry.specs.quantityValue, 0).toFixed(1)} m
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-blue-700">Total Weight</p>
              <p className="text-lg font-bold text-blue-900">
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
      return total + (entry.calculation?.totalSystemWeight || 0);
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
                      `${entry.calculation.totalSystemWeight.toFixed(2)} kg` : 
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
    updateGlobalSpecs,
    addStraightPipeEntry,
    updateStraightPipeEntry,
    removeStraightPipeEntry,
    updateEntryCalculation,
    getTotalWeight,
    getTotalValue,
    nextStep: originalNextStep,
    prevStep,
  } = useRfqForm();

  const [masterData, setMasterData] = useState<MasterData>({
    steelSpecs: [],
    flangeStandards: [],
    pressureClasses: [],
    nominalBores: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(true);

  // Load master data from API
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setIsLoadingMasterData(true);
        const { masterDataApi } = await import('@/app/lib/api/client');
        
        const [steelSpecs, flangeStandards, pressureClasses, nominalBores] = await Promise.all([
          masterDataApi.getSteelSpecifications(),
          masterDataApi.getFlangeStandards(),
          masterDataApi.getFlangePressureClasses(),
          masterDataApi.getNominalBores()
        ]);

        setMasterData({
          steelSpecs,
          flangeStandards,
          pressureClasses,
          nominalBores
        });
      } catch (error) {
        console.error('Error loading master data:', error);
        // Fallback to empty arrays
        setMasterData({
          steelSpecs: [],
          flangeStandards: [],
          pressureClasses: [],
          nominalBores: []
        });
      } finally {
        setIsLoadingMasterData(false);
      }
    };

    loadMasterData();
  }, []);

  // Enhanced next step function with validation
  const nextStep = () => {
    // Validate current step before proceeding
    let errors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1:
        errors = validatePage1RequiredFields(
          rfqData.customerEmail,
          rfqData.customerPhone,
          rfqData.requiredDate
        );
        break;
      case 2:
        errors = validatePage2Specifications(rfqData.globalSpecs);
        break;
      case 3:
        errors = validatePage3Items(rfqData.straightPipeEntries);
        break;
    }

    setValidationErrors(errors);

    // Only proceed if no validation errors
    if (Object.keys(errors).length === 0) {
      originalNextStep();
    }
  };

  // Add initial entry if none exist
  useEffect(() => {
    if (rfqData.straightPipeEntries.length === 0) {
      addStraightPipeEntry();
    }
  }, [rfqData.straightPipeEntries.length, addStraightPipeEntry]);

  // Auto-generate item numbers for entries without client item numbers
  useEffect(() => {
    rfqData.straightPipeEntries.forEach((entry) => {
      if (!entry.clientItemNumber || entry.clientItemNumber.trim() === '') {
        const autoGenNumber = generateItemNumber();
        updateStraightPipeEntry(entry.id, { clientItemNumber: autoGenNumber });
      }
    });
  }, [rfqData.straightPipeEntries, updateStraightPipeEntry]);

  const handleCalculateAll = async () => {
    try {
      for (const entry of rfqData.straightPipeEntries) {
        try {
          const result = await rfqApi.calculate(entry.specs);
          updateEntryCalculation(entry.id, result);
        } catch (error: any) {
          console.error(`Calculation error for entry ${entry.id}:`, error);
          
          // Show user-friendly error message
          const errorMessage = error.message || String(error);
          if (errorMessage.includes('404') || errorMessage.includes('not found')) {
            alert(`Could not calculate for item: ${entry.description || 'Untitled'}\n\nThe combination of ${entry.specs.nominalBoreMm}NB with schedule ${entry.specs.scheduleNumber} is not available in the database.\n\nPlease select a different schedule (STD, XS, XXS, 40, 80, 120, 160, MEDIUM, or HEAVY) or use the automated calculation by setting working pressure.`);
          } else {
            alert(`Calculation error for item: ${entry.description || 'Untitled'}\n\n${errorMessage}`);
          }
        }
      }
    } catch (error) {
      console.error('Calculation error:', error);
      alert('An unexpected error occurred during calculation. Please check your inputs and try again.');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setValidationErrors({});
    
    try {
      // Validate we have at least one item
      if (rfqData.straightPipeEntries.length === 0) {
        setValidationErrors({ submit: 'Please add at least one pipe item before submitting.' });
        setIsSubmitting(false);
        return;
      }

      // Import the API client
      const { rfqApi } = await import('@/app/lib/api/client');
      
      // For now, we'll submit each item as a separate RFQ
      // In the future, this can be enhanced to create one RFQ with multiple items
      const results = [];
      
      for (let i = 0; i < rfqData.straightPipeEntries.length; i++) {
        const entry = rfqData.straightPipeEntries[i];
        
        // Validate entry has calculation results
        if (!entry.calculation) {
          setValidationErrors({ 
            submit: `Item #${i + 1} (${entry.description}) has not been calculated. Please click "Calculate All" before submitting.` 
          });
          setIsSubmitting(false);
          return;
        }

        // Prepare the RFQ data
        const rfqPayload = {
          rfq: {
            projectName: rfqData.straightPipeEntries.length > 1 
              ? `${rfqData.projectName} - Item ${i + 1}/${rfqData.straightPipeEntries.length}`
              : rfqData.projectName,
            description: rfqData.description,
            customerName: rfqData.customerName,
            customerEmail: rfqData.customerEmail,
            customerPhone: rfqData.customerPhone,
            requiredDate: rfqData.requiredDate,
            status: 'draft' as const,
            notes: rfqData.notes,
          },
          straightPipe: {
            ...entry.specs,
          },
          itemDescription: entry.description || `Item ${i + 1}`,
          itemNotes: entry.notes,
        };

        console.log(`Submitting Item #${i + 1}:`, rfqPayload);
        
        // Submit to backend
        const result = await rfqApi.create(rfqPayload);
        results.push(result);
        
        console.log(`Item #${i + 1} submitted successfully:`, result);
      }

      // All items submitted successfully
      alert(`✅ Success! ${results.length} RFQ${results.length > 1 ? 's' : ''} created successfully!\n\n${results.map((r, i) => `Item ${i + 1}: RFQ #${r.rfq?.rfqNumber || r.rfq?.id || 'Created'}`).join('\n')}`);
      
      // Call the success callback with the first RFQ ID
      onSuccess(results[0]?.rfq?.id || 'success');
      
    } catch (error: any) {
      console.error('Submission error:', error);
      
      // Extract error message
      let errorMessage = 'Failed to submit RFQ. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setValidationErrors({ submit: errorMessage });
      
      alert(`❌ Submission failed:\n\n${errorMessage}\n\nPlease check the console for more details.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Project/RFQ Details', description: 'Basic project and customer information' },
    { number: 2, title: 'Specifications', description: 'Working conditions and material specs' },
    { number: 3, title: 'Item Upload', description: 'Pipe details and quantities' },
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
          <SpecificationsStep
            globalSpecs={rfqData.globalSpecs}
            onUpdateGlobalSpecs={updateGlobalSpecs}
            masterData={masterData}
            errors={validationErrors}
          />
        );
      case 3:
        return (
          <ItemUploadStep
            entries={rfqData.straightPipeEntries}
            globalSpecs={rfqData.globalSpecs}
            masterData={masterData}
            onAddEntry={addStraightPipeEntry}
            onUpdateEntry={updateStraightPipeEntry}
            onRemoveEntry={removeStraightPipeEntry}
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
                Create Straight Pipe RFQ
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
            {isLoadingMasterData ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading system data...</span>
                </div>
              </div>
            ) : (
              renderCurrentStep()
            )}
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