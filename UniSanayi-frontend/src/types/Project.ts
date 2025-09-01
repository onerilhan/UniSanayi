export interface Project {
  id: string;
  title: string;
  description: string;
  projectType: string;
  durationDays: number;
  budgetAmount?: number;
  currency?: string;
  locationCity?: string;
  locationRequirement?: string;
  applicationDeadline?: string;
  companyName: string;
  companyIndustry?: string;
  viewCount: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  timestamp: string;
}