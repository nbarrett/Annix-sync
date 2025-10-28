const API_BASE_URL = 'http://localhost:4001';

// Types based on our backend DTOs
export interface CreateRfqDto {
  projectName: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  requiredDate?: string;
  status?: 'draft' | 'pending' | 'quoted' | 'accepted' | 'rejected' | 'cancelled';
  notes?: string;
}

export interface CreateStraightPipeRfqDto {
  nominalBoreMm: number;
  scheduleType: 'schedule' | 'wall_thickness';
  scheduleNumber?: string;
  wallThicknessMm?: number;
  pipeEndConfiguration?: 'FBE' | 'FOE' | 'PE' | 'FOE_LF' | 'FOE_RF' | '2X_RF'; // NEW FIELD
  individualPipeLength: number;
  lengthUnit: 'meters' | 'feet';
  quantityType: 'total_length' | 'number_of_pipes';
  quantityValue: number;
  workingPressureBar: number;
  workingTemperatureC?: number;
  steelSpecificationId?: number;
  flangeStandardId?: number;
  flangePressureClassId?: number;
}

export interface CreateStraightPipeRfqWithItemDto {
  rfq: CreateRfqDto;
  straightPipe: CreateStraightPipeRfqDto;
  itemDescription: string;
  itemNotes?: string;
}

export interface StraightPipeCalculationResult {
  outsideDiameterMm: number;
  wallThicknessMm: number;
  pipeWeightPerMeter: number;
  totalPipeWeight: number;
  calculatedPipeCount: number;
  calculatedTotalLength: number;
  numberOfFlanges: number;
  numberOfButtWelds: number;
  totalButtWeldLength: number;
  numberOfFlangeWelds: number;
  totalFlangeWeldLength: number;
}

export interface RfqResponse {
  id: number;
  rfqNumber: string;
  projectName: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  requiredDate?: Date;
  status: string;
  notes?: string;
  totalWeightKg?: number;
  totalCost?: number;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
}

export interface SteelSpecification {
  id: number;
  steelSpecName: string;
}

export interface FlangeStandard {
  id: number;
  code: string;
}

export interface FlangePressureClass {
  id: number;
  designation: string;
  standard?: FlangeStandard;
}

export interface NominalOutsideDiameter {
  id: number;
  nominal_diameter_mm: number;
  outside_diameter_mm: number;
}

export interface PipeDimension {
  id: number;
  wallThicknessMm: number;
  internalDiameterMm?: number;
  massKgm: number;
  scheduleDesignation?: string;
  scheduleNumber?: number;
  nominalOutsideDiameter: NominalOutsideDiameter;
  steelSpecification: SteelSpecification;
}

export interface PipePressure {
  id: number;
  temperatureC?: number;
  maxWorkingPressureMpa?: number;
  allowableStressMpa: number;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    
    // Try to get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`API Request: ${url}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Skip authentication for now
    // if (this.token) {
    //   headers['Authorization'] = `Bearer ${this.token}`;
    // }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ access_token: string }> {
    const result = await this.request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(result.access_token);
    return result;
  }

  // RFQ endpoints
  async calculateStraightPipe(
    data: CreateStraightPipeRfqDto
  ): Promise<StraightPipeCalculationResult> {
    return this.request<StraightPipeCalculationResult>('/rfq/straight-pipe/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createStraightPipeRfq(
    data: CreateStraightPipeRfqWithItemDto
  ): Promise<{ rfq: any; calculation: StraightPipeCalculationResult }> {
    return this.request('/rfq/straight-pipe', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRfqs(): Promise<RfqResponse[]> {
    return this.request<RfqResponse[]>('/rfq');
  }

  async getRfqById(id: number): Promise<any> {
    return this.request(`/rfq/${id}`);
  }

  // Master data endpoints
  async getSteelSpecifications(): Promise<SteelSpecification[]> {
    return this.request<SteelSpecification[]>('/steel-specification');
  }

  async getFlangeStandards(): Promise<FlangeStandard[]> {
    return this.request<FlangeStandard[]>('/flange-standard');
  }

  async getFlangePressureClasses(): Promise<FlangePressureClass[]> {
    return this.request<FlangePressureClass[]>('/flange-pressure-class');
  }

  // Pipe data endpoints
  async getPipeDimensions(
    nominalBore?: number,
    steelSpecId?: number,
    minPressure?: number,
    temperature?: number
  ): Promise<PipeDimension[]> {
    const params = new URLSearchParams();
    if (nominalBore) params.append('nominalBore', nominalBore.toString());
    if (steelSpecId) params.append('steelSpecId', steelSpecId.toString());
    if (minPressure) params.append('minPressure', minPressure.toString());
    if (temperature) params.append('temperature', temperature.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<PipeDimension[]>(`/pipe-dimensions${query}`);
  }

  async getNominalBores(steelSpecId?: number): Promise<NominalOutsideDiameter[]> {
    const query = steelSpecId ? `?steelSpecId=${steelSpecId}` : '';
    return this.request<NominalOutsideDiameter[]>(`/nominal-outside-diameter-mm${query}`);
  }

  async getRecommendedSpecs(
    nominalBore: number,
    workingPressure: number,
    temperature?: number,
    steelSpecId?: number
  ): Promise<{
    pipeDimension: PipeDimension;
    schedule?: string;
    wallThickness: number;
    maxPressure: number;
    availableUpgrades?: PipeDimension[];
  }> {
    return this.request('/pipe-dimensions/recommend', {
      method: 'POST',
      body: JSON.stringify({
        nominalBore,
        workingPressure,
        temperature: temperature || 20,
        steelSpecId
      }),
    });
  }

  async getHigherSchedules(
    nominalBore: number,
    currentWallThickness: number,
    workingPressure: number,
    temperature: number = 20,
    steelSpecId?: number
  ): Promise<PipeDimension[]> {
    const params = new URLSearchParams({
      nominalBore: nominalBore.toString(),
      currentWallThickness: currentWallThickness.toString(),
      workingPressure: workingPressure.toString(),
      temperature: temperature.toString(),
    });
    
    if (steelSpecId) {
      params.append('steelSpecId', steelSpecId.toString());
    }

    return this.request<PipeDimension[]>(`/pipe-dimensions/higher-schedules?${params}`);
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient();

// Export individual API functions for convenience
export const rfqApi = {
  calculate: (data: CreateStraightPipeRfqDto) => 
    apiClient.calculateStraightPipe(data),
  create: (data: CreateStraightPipeRfqWithItemDto) => 
    apiClient.createStraightPipeRfq(data),
  getAll: () => apiClient.getRfqs(),
  getById: (id: number) => apiClient.getRfqById(id),
};

export const masterDataApi = {
  getSteelSpecifications: () => apiClient.getSteelSpecifications(),
  getFlangeStandards: () => apiClient.getFlangeStandards(),
  getFlangePressureClasses: () => apiClient.getFlangePressureClasses(),
  getPipeDimensions: (nominalBore?: number, steelSpecId?: number, minPressure?: number, temperature?: number) => 
    apiClient.getPipeDimensions(nominalBore, steelSpecId, minPressure, temperature),
  getNominalBores: (steelSpecId?: number) => apiClient.getNominalBores(steelSpecId),
  getRecommendedSpecs: (nominalBore: number, workingPressure: number, temperature?: number, steelSpecId?: number) =>
    apiClient.getRecommendedSpecs(nominalBore, workingPressure, temperature, steelSpecId),
  getHigherSchedules: (nominalBore: number, currentWallThickness: number, workingPressure: number, temperature?: number, steelSpecId?: number) =>
    apiClient.getHigherSchedules(nominalBore, currentWallThickness, workingPressure, temperature, steelSpecId),
};

export const authApi = {
  login: (email: string, password: string) => apiClient.login(email, password),
  logout: () => apiClient.clearToken(),
};
