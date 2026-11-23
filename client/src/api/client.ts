import {
  Equipment,
  AccessRequest,
  SchedulingConflict,
  AIResolutionPlan,
  AIDiscoveryResult,
  AnalyticsSummary,
  CreateRequestPayload,
} from '../types/index.js';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(public message: string, public status?: number, public issues?: any[]) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}: ${response.statusText}`;
    throw new ApiError(errorMsg, response.status, data.issues);
  }

  return data;
}

export const api = {
  // Equipment
  async getEquipment(params?: {
    search?: string;
    department?: string;
    category?: string;
    status?: string;
  }): Promise<Equipment[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department && params.department !== 'All') query.append('department', params.department);
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.status && params.status !== 'All') query.append('status', params.status);

    const res = await request<{ success: boolean; data: Equipment[] }>(
      `/equipment?${query.toString()}`
    );
    return res.data;
  },

  async getEquipmentById(id: string): Promise<Equipment> {
    const res = await request<{ success: boolean; data: Equipment }>(`/equipment/${id}`);
    return res.data;
  },

  async getSuggestedOpenSlots(
    equipmentId: string,
    date: string
  ): Promise<Array<{ startTime: string; endTime: string }>> {
    const res = await request<{
      success: boolean;
      openSlots: Array<{ startTime: string; endTime: string }>;
    }>(`/equipment/${equipmentId}/open-slots?date=${encodeURIComponent(date)}`);
    return res.openSlots;
  },

  // Requests
  async getRequests(filters?: {
    status?: string;
    department?: string;
    studentEmail?: string;
  }): Promise<AccessRequest[]> {
    const query = new URLSearchParams();
    if (filters?.status && filters.status !== 'All') query.append('status', filters.status);
    if (filters?.department && filters.department !== 'All') query.append('department', filters.department);
    if (filters?.studentEmail) query.append('studentEmail', filters.studentEmail);

    const res = await request<{ success: boolean; data: AccessRequest[] }>(
      `/requests?${query.toString()}`
    );
    return res.data;
  },

  async checkSlotOverlap(
    equipmentId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeRequestId?: string
  ): Promise<{ hasConflict: boolean; conflictingRequests: AccessRequest[] }> {
    const query = new URLSearchParams({
      equipmentId,
      date,
      startTime,
      endTime,
    });
    if (excludeRequestId) query.append('excludeRequestId', excludeRequestId);

    const res = await request<{
      success: boolean;
      hasConflict: boolean;
      conflictingRequests: AccessRequest[];
    }>(`/requests/check-overlap?${query.toString()}`);
    return { hasConflict: res.hasConflict, conflictingRequests: res.conflictingRequests };
  },

  async createRequest(payload: CreateRequestPayload): Promise<{
    request: AccessRequest;
    conflictDetected: boolean;
    conflict?: SchedulingConflict;
    message: string;
  }> {
    const res = await request<{
      success: boolean;
      data: AccessRequest;
      conflictDetected: boolean;
      conflict?: SchedulingConflict;
      message: string;
    }>('/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      request: res.data,
      conflictDetected: res.conflictDetected,
      conflict: res.conflict,
      message: res.message,
    };
  },

  async facultyAction(
    requestId: string,
    action: 'approve' | 'reject',
    remarks?: string,
    facultyName = 'Faculty Evaluator'
  ): Promise<AccessRequest> {
    const res = await request<{ success: boolean; data: AccessRequest }>(
      `/requests/${requestId}/action`,
      {
        method: 'POST',
        headers: {
          'x-faculty-name': facultyName,
        },
        body: JSON.stringify({ action, remarks }),
      }
    );
    return res.data;
  },

  // Conflicts
  async getConflicts(): Promise<SchedulingConflict[]> {
    const res = await request<{ success: boolean; data: SchedulingConflict[] }>('/conflicts');
    return res.data;
  },

  async resolveConflict(conflictId: string): Promise<AIResolutionPlan> {
    const res = await request<{ success: boolean; data: AIResolutionPlan }>(
      `/conflicts/${conflictId}/resolve`,
      {
        method: 'POST',
      }
    );
    return res.data;
  },

  async applyConflictResolution(
    conflictId: string,
    facultyName = 'Prof. Dean (Academic Chair)'
  ): Promise<{ conflict: SchedulingConflict; priorityReq: AccessRequest; secondaryReq: AccessRequest }> {
    const res = await request<{
      success: boolean;
      message: string;
      data: {
        conflict: SchedulingConflict;
        priorityReq: AccessRequest;
        secondaryReq: AccessRequest;
      };
    }>(`/conflicts/${conflictId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ facultyName }),
    });
    return res.data;
  },

  // AI Discovery
  async discoverEquipment(prompt: string, department?: string): Promise<AIDiscoveryResult> {
    const res = await request<{ success: boolean; data: AIDiscoveryResult }>('/ai/discover', {
      method: 'POST',
      body: JSON.stringify({ prompt, department }),
    });
    return res.data;
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await request<{ success: boolean; data: AnalyticsSummary }>('/analytics');
    return res.data;
  },

  async resetData(): Promise<AnalyticsSummary> {
    const res = await request<{ success: boolean; data: AnalyticsSummary }>('/analytics/reset', {
      method: 'POST',
    });
    return res.data;
  },

  // Health
  async getHealth(): Promise<{
    status: string;
    geminiConfigured: boolean;
    model: string;
  }> {
    return request('/health');
  },
};
