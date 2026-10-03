export const BillFrequency = {
  Once: 1,
  Monthly: 2,
  EveryNMonths: 3,
  Yearly: 4,
  Weekly: 5,
} as const;

export type BillFrequency = (typeof BillFrequency)[keyof typeof BillFrequency];

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  token: string;
}

export interface BillOccurrence {
  billId: string;
  billTitle: string;
  expectedAmount: number;
  frequency: BillFrequency;
  dueDate: string;
  isPaid: boolean;
  executionId?: string | null;
  paymentDate?: string | null;
  paidAmount?: number | null;
  notes?: string | null;
  paymentLink?: string | null;
}

export interface Bill {
  id: string;
  userId: string;
  title: string;
  expectedAmount: number;
  frequency: BillFrequency;
  startDate: string;
  dueDate?: string | null;
  dayOfMonth?: number | null;
  monthOfYear?: number | null;
  intervalMonths?: number | null;
  dayOfWeek?: number | null;
  notes?: string | null;
  paymentLink?: string | null;
  createdAtUtc: string;
}

export interface CreateBillPayload {
  title: string;
  expectedAmount: number;
  frequency: BillFrequency;
  startDate: string;
  dueDate?: string | null;
  dayOfMonth?: number | null;
  monthOfYear?: number | null;
  intervalMonths?: number | null;
  dayOfWeek?: number | null;
  notes?: string | null;
  paymentLink?: string | null;
}

export type UpdateBillPayload = CreateBillPayload;

export interface RegisterExecutionPayload {
  paymentDate: string;
  paidAmount: number;
  referenceDueDate?: string | null;
  notes?: string | null;
}

export interface OccurrencesFilterParams {
  filterType: 'none' | 'month' | 'next_days';
  year?: number;
  month?: number;
  days?: number;
  refDate?: string;
}

const TOKEN_KEY = 'paythebills_auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const getHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

console.log('API_BASE_URL:');

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body && body.message) {
        errorMsg = body.message;
      }
    } catch {
      // not json
    }
    throw new Error(errorMsg);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
};

export const api = {
  async register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders(),
    });
    return handleResponse<User>(res);
  },

  async getOccurrences(params: OccurrencesFilterParams): Promise<BillOccurrence[]> {
    const query = new URLSearchParams();
    query.set('filterType', params.filterType);
    if (params.year) query.set('year', params.year.toString());
    if (params.month) query.set('month', params.month.toString());
    if (params.days) query.set('days', params.days.toString());
    if (params.refDate) query.set('refDate', params.refDate);

    const res = await fetch(`/api/bills?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse<BillOccurrence[]>(res);
  },

  async getBills(): Promise<Bill[]> {
    const res = await fetch('/api/bills/list', {
      headers: getHeaders(),
    });
    return handleResponse<Bill[]>(res);
  },

  async getBillById(billId: string): Promise<Bill> {
    const res = await fetch(`/api/bills/${billId}`, {
      headers: getHeaders(),
    });
    return handleResponse<Bill>(res);
  },

  async createBill(data: CreateBillPayload): Promise<Bill> {
    const res = await fetch('/api/bills', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Bill>(res);
  },

  async updateBill(billId: string, data: UpdateBillPayload): Promise<Bill> {
    const res = await fetch(`/api/bills/${billId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Bill>(res);
  },

  async registerExecution(billId: string, data: RegisterExecutionPayload): Promise<unknown> {
    const res = await fetch(`/api/bills/${billId}/executions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<unknown>(res);
  },

  async deleteExecution(executionId: string): Promise<void> {
    const res = await fetch(`/api/bills/executions/${executionId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<void>(res);
  },

  async deleteBill(billId: string): Promise<void> {
    const res = await fetch(`/api/bills/${billId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<void>(res);
  },
};
