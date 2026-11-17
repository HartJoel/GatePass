import { Bell, Briefcase, Building2, ClipboardList, LayoutDashboard, Settings as SettingsIcon, ShieldCheck, Ticket, Users } from 'lucide-react'
import type { NavItem } from '@/components/layout/navigation'

export const companyNav: (NavItem & { id: 'overview' | 'estates' | 'members' | 'audit-log' | 'settings' })[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'estates', label: 'Estates', icon: Building2 },
  { id: 'members', label: 'People', icon: Users },
  { id: 'audit-log', label: 'Audit log', icon: ClipboardList },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

export const platformNav: (NavItem & { id: 'overview' | 'companies' })[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'companies', label: 'Companies', icon: Briefcase },
]

export const residentNav: (NavItem & { id: 'home' | 'passes' | 'notifications' })[] = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'passes', label: 'Passes', icon: Ticket },
  { id: 'notifications', label: 'Alerts', icon: Bell },
]

export const guardNav: (NavItem & { id: 'verify' | 'history' })[] = [
  { id: 'verify', label: 'Verify', icon: ShieldCheck },
  { id: 'history', label: 'History', icon: LayoutDashboard },
]
