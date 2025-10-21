const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

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
};

export const authApi = {
  login: (email: string, password: string) => apiClient.login(email, password),
  logout: () => apiClient.clearToken(),
};
