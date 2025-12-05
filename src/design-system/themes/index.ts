/**
 * Medical Design System - Theme Configurations
 * Role-based themes for CareHealth
 */

import { medicalColors, roleColors } from '../tokens'
import type { User } from '@/store/auth.store'

export type UserRole = User['role']

export interface ThemeConfig {
  primary: string
  secondary: string
  sidebarBg: string
  headerClass: string
  accent: string
  gradient: string
}

export const roleThemes: Record<UserRole, ThemeConfig> = {
  admin: {
    primary: roleColors.admin,
    secondary: medicalColors.purple[400],
    sidebarBg: 'bg-gradient-to-b from-purple-900 to-purple-800',
    headerClass: 'bg-white border-b border-purple-200',
    accent: medicalColors.purple[500],
    gradient: 'from-purple-50 to-purple-100',
  },
  doctor: {
    primary: roleColors.doctor,
    secondary: medicalColors.blue[400],
    sidebarBg: 'bg-gradient-to-b from-blue-900 to-blue-800',
    headerClass: 'bg-white border-b border-blue-200',
    accent: medicalColors.blue[500],
    gradient: 'from-medical-blue-50 to-medical-blue-100',
  },
  nurse: {
    primary: roleColors.nurse,
    secondary: medicalColors.green[400],
    sidebarBg: 'bg-gradient-to-b from-green-900 to-green-800',
    headerClass: 'bg-white border-b border-green-200',
    accent: medicalColors.green[500],
    gradient: 'from-medical-green-50 to-medical-green-100',
  },
  patient: {
    primary: roleColors.patient,
    secondary: medicalColors.sky[400],
    sidebarBg: 'bg-gradient-to-b from-sky-900 to-sky-800',
    headerClass: 'bg-white border-b border-sky-200',
    accent: medicalColors.sky[500],
    gradient: 'from-sky-50 to-sky-100',
  },
  pharmacist: {
    primary: roleColors.pharmacist,
    secondary: medicalColors.amber[400],
    sidebarBg: 'bg-gradient-to-b from-amber-900 to-amber-800',
    headerClass: 'bg-white border-b border-amber-200',
    accent: medicalColors.amber[500],
    gradient: 'from-amber-50 to-amber-100',
  },
  lab_technician: {
    primary: roleColors.lab_technician,
    secondary: medicalColors.indigo[400],
    sidebarBg: 'bg-gradient-to-b from-indigo-900 to-indigo-800',
    headerClass: 'bg-white border-b border-indigo-200',
    accent: medicalColors.indigo[500],
    gradient: 'from-indigo-50 to-indigo-100',
  },
  receptionist: {
    primary: roleColors.receptionist,
    secondary: medicalColors.blue[400],
    sidebarBg: 'bg-gradient-to-b from-blue-900 to-blue-800',
    headerClass: 'bg-white border-b border-blue-200',
    accent: medicalColors.blue[500],
    gradient: 'from-medical-blue-50 to-medical-blue-100',
  },
}

export const getThemeForRole = (role: UserRole): ThemeConfig => {
  return roleThemes[role] || roleThemes.patient
}

