'use client';

import { useState, useCallback } from 'react';
import { CreateStraightPipeRfqDto, StraightPipeCalculationResult } from '@/app/lib/api/client';

export interface StraightPipeEntry {
  id: string;
  description: string;
  clientItemNumber?: string;
  specs: CreateStraightPipeRfqDto;
  calculation?: StraightPipeCalculationResult;
  calculatedPipes?: number;
  notes?: string;
}

export interface GlobalSpecs {
  workingPressureBar?: number;
  workingTemperatureC?: number;
  steelSpecificationId?: number;
  flangeStandardId?: number;
  flangePressureClassId?: number;
}

export interface RfqFormData {
  projectName: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  requiredDate: string;
  notes: string;
  globalSpecs: GlobalSpecs;
  straightPipeEntries: StraightPipeEntry[];
}

const DEFAULT_PIPE_SPECS: CreateStraightPipeRfqDto = {
  nominalBoreMm: 500,
  scheduleType: 'schedule',
  scheduleNumber: 'Sch20',
  individualPipeLength: 12.192,
  lengthUnit: 'meters',
  quantityType: 'total_length',
  quantityValue: 8000,
  workingPressureBar: 10,
  workingTemperatureC: 120,
  steelSpecificationId: 1,
};

export const useRfqForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [rfqData, setRfqData] = useState<RfqFormData>({
    projectName: '500NB Pipeline Extension Project',
    description: 'Extension of existing pipeline system with carbon steel pipe',
    customerName: 'Acme Industrial Solutions',
    customerEmail: 'procurement@acme-industrial.co.za',
    customerPhone: '+27 11 555 0123',
    requiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Urgent delivery required by month end',
    globalSpecs: {},
    straightPipeEntries: [],
  });

  const updateRfqField = useCallback((field: keyof Omit<RfqFormData, 'straightPipeEntries'>, value: string) => {
    setRfqData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const addStraightPipeEntry = useCallback((description?: string) => {
    const newEntry: StraightPipeEntry = {
      id: Date.now().toString(),
      description: description || `${DEFAULT_PIPE_SPECS.nominalBoreMm}NB ${DEFAULT_PIPE_SPECS.scheduleNumber} Straight Pipe`,
      specs: { ...DEFAULT_PIPE_SPECS },
      notes: 'All pipes to be hydrostatically tested before delivery',
    };

    setRfqData(prev => ({
      ...prev,
      straightPipeEntries: [...prev.straightPipeEntries, newEntry],
    }));

    return newEntry.id;
  }, []);

  const updateStraightPipeEntry = useCallback((
    id: string, 
    updates: Partial<Omit<StraightPipeEntry, 'id'>>
  ) => {
    setRfqData(prev => ({
      ...prev,
      straightPipeEntries: prev.straightPipeEntries.map(entry =>
        entry.id === id ? { ...entry, ...updates } : entry
      ),
    }));
  }, []);

  const removeStraightPipeEntry = useCallback((id: string) => {
    setRfqData(prev => ({
      ...prev,
      straightPipeEntries: prev.straightPipeEntries.filter(entry => entry.id !== id),
    }));
  }, []);

  const updateEntryCalculation = useCallback((id: string, calculation: StraightPipeCalculationResult) => {
    updateStraightPipeEntry(id, { calculation });
  }, [updateStraightPipeEntry]);

  const getTotalWeight = useCallback(() => {
    return rfqData.straightPipeEntries.reduce((total, entry) => {
      return total + (entry.calculation?.totalPipeWeight || 0);
    }, 0);
  }, [rfqData.straightPipeEntries]);

  const getTotalValue = useCallback(() => {
    return rfqData.straightPipeEntries.reduce((total, entry) => {
      return total + (entry.calculation?.calculatedTotalLength || 0);
    }, 0);
  }, [rfqData.straightPipeEntries]);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const updateGlobalSpecs = useCallback((specs: GlobalSpecs) => {
    setRfqData(prev => ({
      ...prev,
      globalSpecs: specs,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setRfqData({
      projectName: '',
      description: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      requiredDate: '',
      notes: '',
      globalSpecs: {},
      straightPipeEntries: [],
    });
  }, []);

  return {
    currentStep,
    setCurrentStep,
    rfqData,
    updateRfqField,
    updateGlobalSpecs,
    addStraightPipeEntry,
    updateStraightPipeEntry,
    removeStraightPipeEntry,
    updateEntryCalculation,
    getTotalWeight,
    getTotalValue,
    nextStep,
    prevStep,
    resetForm,
  };
};