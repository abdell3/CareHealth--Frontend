/**
 * API Response Types
 * Centralized type definitions for all API responses
 */

import { type User } from '@/store/auth.store'

// Base API Response wrapper
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

// Error Response
export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

// Auth API Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: User['role']
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RequestPasswordResetRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

// User API Types
export interface UserResponse extends User {}

export interface UsersListResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

// Patient API Types
export interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  address?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  medicalHistory?: string[]
  allergies?: string[]
  createdAt: string
  updatedAt: string
}

export interface PatientsListResponse {
  patients: Patient[]
  total: number
  page: number
  limit: number
}

// Appointment API Types
export interface Appointment {
  id: string
  patientId: string
  patient?: Patient
  doctorId: string
  doctor?: User
  date: string
  time: string
  duration: number // in minutes
  type: 'consultation' | 'follow-up' | 'emergency' | 'surgery'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AppointmentsListResponse {
  appointments: Appointment[]
  total: number
  page: number
  limit: number
}

export interface CreateAppointmentRequest {
  patientId: string
  doctorId: string
  date: string
  time: string
  duration: number
  type: Appointment['type']
  notes?: string
}

// Prescription API Types
export interface Prescription {
  id: string
  patientId: string
  patient?: Patient
  doctorId: string
  doctor?: User
  medications: Medication[]
  instructions: string
  startDate: string
  endDate?: string
  status: 'active' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export interface PrescriptionsListResponse {
  prescriptions: Prescription[]
  total: number
  page: number
  limit: number
}

export interface CreatePrescriptionRequest {
  patientId: string
  medications: Medication[]
  instructions: string
  startDate: string
  endDate?: string
}

// Lab Order API Types
export interface LabOrder {
  id: string
  patientId: string
  patient?: Patient
  doctorId: string
  doctor?: User
  tests: LabTest[]
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  notes?: string
  results?: LabResult[]
  createdAt: string
  updatedAt: string
}

export interface LabTest {
  name: string
  code: string
  category: string
}

export interface LabResult {
  testName: string
  value: string | number
  unit?: string
  referenceRange?: string
  status: 'normal' | 'abnormal' | 'critical'
}

export interface LabOrdersListResponse {
  orders: LabOrder[]
  total: number
  page: number
  limit: number
}

export interface CreateLabOrderRequest {
  patientId: string
  tests: LabTest[]
  notes?: string
}

// Document API Types
export interface Document {
  id: string
  patientId?: string
  patient?: Patient
  uploadedBy: string
  uploadedByUser?: User
  name: string
  type: string
  size: number
  url: string
  category: 'medical-record' | 'prescription' | 'lab-result' | 'image' | 'other'
  createdAt: string
  updatedAt: string
}

export interface DocumentsListResponse {
  documents: Document[]
  total: number
  page: number
  limit: number
}

export interface UploadDocumentRequest {
  file: File
  patientId?: string
  category: Document['category']
}

