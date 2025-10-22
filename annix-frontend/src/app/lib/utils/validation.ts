'use client';

/**
 * Validation utilities for RFQ form
 */

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validate Page 1 required fields
 * @param email - Customer email
 * @param contactNumber - Customer phone
 * @param requiredDate - Required date
 * @returns Object with validation errors
 */
export function validatePage1RequiredFields(
  email: string,
  contactNumber: string,
  requiredDate: string
): ValidationErrors {
  const errors: ValidationErrors = {};

  // Email validation
  if (!email) {
    errors.customerEmail = 'Email address is required';
  } else if (!isValidEmail(email)) {
    errors.customerEmail = 'Please enter a valid email address';
  }

  // Phone validation
  if (!contactNumber) {
    errors.customerPhone = 'Contact number is required';
  } else if (!isValidPhoneNumber(contactNumber)) {
    errors.customerPhone = 'Please enter a valid phone number';
  }

  // Required date validation
  if (!requiredDate) {
    errors.requiredDate = 'Required date is required';
  } else if (!isValidDate(requiredDate)) {
    errors.requiredDate = 'Please enter a valid date';
  } else if (new Date(requiredDate) < new Date()) {
    errors.requiredDate = 'Required date cannot be in the past';
  }

  return errors;
}

/**
 * Validate Page 2 specifications
 * @param globalSpecs - Global specifications object
 * @returns Object with validation errors
 */
export function validatePage2Specifications(globalSpecs: any): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!globalSpecs.workingPressureBar) {
    errors.workingPressure = 'Working pressure is required';
  }

  if (!globalSpecs.workingTemperatureC) {
    errors.workingTemperature = 'Working temperature is required';
  }

  return errors;
}

/**
 * Validate Page 3 item specifications
 * @param entries - Array of pipe entries
 * @returns Object with validation errors
 */
export function validatePage3Items(entries: any[]): ValidationErrors {
  const errors: ValidationErrors = {};

  entries.forEach((entry, index) => {
    if (!entry.specs.nominalBoreMm) {
      errors[`pipe_${index}_nb`] = 'Nominal bore is required';
    }

    if (!entry.specs.individualPipeLength) {
      errors[`pipe_${index}_length`] = 'Pipe length is required';
    } else if (entry.specs.individualPipeLength <= 0) {
      errors[`pipe_${index}_length`] = 'Pipe length must be greater than 0';
    }

    if (!entry.specs.quantityValue) {
      errors[`pipe_${index}_quantity`] = 'Quantity or total length is required';
    } else if (entry.specs.quantityValue <= 0) {
      errors[`pipe_${index}_quantity`] = 'Quantity must be greater than 0';
    }

    if (!entry.specs.scheduleNumber && !entry.specs.wallThicknessMm) {
      errors[`pipe_${index}_schedule`] = 'Schedule or wall thickness is required';
    }
  });

  return errors;
}

/**
 * Email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone number validation (South African format)
 */
function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // South African phone formats:
  // +27xxxxxxxxx (11-12 digits including country code)
  // 0xxxxxxxxxx (10-11 digits)
  // Cell: 07x, 08x, 06x
  // Landline: 01x, 02x, 03x, 04x, 05x
  
  if (digitsOnly.startsWith('27') && digitsOnly.length >= 11 && digitsOnly.length <= 12) {
    return true; // International format
  }
  
  if (digitsOnly.startsWith('0') && digitsOnly.length >= 10 && digitsOnly.length <= 11) {
    return true; // Local format
  }
  
  return false;
}

/**
 * Date validation
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if all required fields are valid for progression
 * @param step - Current step number
 * @param formData - Form data object
 * @returns boolean indicating if can proceed
 */
export function canProceedToNextStep(step: number, formData: any): boolean {
  switch (step) {
    case 1:
      const page1Errors = validatePage1RequiredFields(
        formData.customerEmail,
        formData.customerPhone,
        formData.requiredDate
      );
      return Object.keys(page1Errors).length === 0;

    case 2:
      const page2Errors = validatePage2Specifications(formData.globalSpecs);
      return Object.keys(page2Errors).length === 0;

    case 3:
      const page3Errors = validatePage3Items(formData.straightPipeEntries);
      return Object.keys(page3Errors).length === 0;

    default:
      return true;
  }
}