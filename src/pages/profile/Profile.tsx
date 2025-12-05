import { useState, useMemo, memo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Lock,
  Settings,
  Activity,
  FileText,
  Save,
  Download,
  Bell,
  Globe,
  Moon,
  Sun,
  Shield,
  CheckCircle2,
} from 'lucide-react'
import { PageLayout } from '@/components/layouts/PageLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { SecuritySessions } from '@/components/profile/SecuritySessions'
import { ActivityFeed } from '@/components/profile/ActivityFeed'
import { RoleSpecificPanel } from '@/components/profile/RoleSpecificPanel'
import { authService } from '@/api/auth.service'
import { usersService } from '@/api/users.service'
import { appointmentsService } from '@/api/appointments.service'
import { pharmacyService } from '@/api/pharmacy.service'
import { documentsService } from '@/api/documents.service'
import { useApiError } from '@/hooks/useApiError'
import { useAuth } from '@/hooks/useAuth'
import { formatPhoneNumber } from '@/utils/helpers'
import { cn } from '@/libs/utils'
import type { User as UserType } from '@/store/auth.store'

// Validation schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
})

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, 'Le mot de passe actuel est requis'),
    newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(8, 'La confirmation est requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>
type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

const Profile = memo(() => {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  // Fetch user profile
  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const response = await authService.getMe()
      return response.data
    },
  })

  // Fetch upcoming appointments (for patients/doctors)
  const { data: appointmentsData } = useQuery({
    queryKey: ['appointments', 'upcoming', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return { appointments: [] }
      const response = await appointmentsService.getAppointments({
        limit: 10,
        ...(currentUser.role === 'patient' ? { patientId: currentUser.id } : { doctorId: currentUser.id }),
      })
      return response.data
    },
    enabled: !!currentUser?.id && (currentUser.role === 'patient' || currentUser.role === 'doctor'),
  })

  // Fetch active prescriptions (for patients)
  const { data: prescriptionsData } = useQuery({
    queryKey: ['prescriptions', 'active', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id || currentUser.role !== 'patient') return { prescriptions: [] }
      const response = await pharmacyService.getPrescriptions({
        patientId: currentUser.id,
        status: 'active',
        limit: 10,
      })
      return response.data
    },
    enabled: !!currentUser?.id && currentUser.role === 'patient',
  })

  // Personal info form
  const personalInfoForm = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: useMemo(
      () => ({
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        email: userData?.email || '',
        phone: userData?.profile?.phone || '',
        address: userData?.profile?.address || '',
        specialization: userData?.profile?.specialization || '',
        licenseNumber: userData?.profile?.licenseNumber || '',
      }),
      [userData]
    ),
  })

  // Password change form
  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: PersonalInfoFormData) => {
      if (!userData?.id) throw new Error('User ID is required')
      const response = await usersService.updateUser(userData.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        profile: {
          phone: data.phone,
          address: data.address,
          specialization: data.specialization,
          licenseNumber: data.licenseNumber,
        },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      setIsEditing(false)
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChangeFormData) => {
      // TODO: Implement password change endpoint
      // For now, this is a placeholder
      return Promise.resolve()
    },
    onSuccess: () => {
      passwordForm.reset()
    },
  })

  const errorMessage = useApiError(error)
  const user = userData || currentUser

  // Mock sessions data (would come from API)
  const sessions = useMemo(
    () => [
      {
        id: '1',
        device: 'Windows Desktop',
        browser: 'Chrome 120.0',
        location: 'Paris, France',
        ipAddress: '192.168.1.1',
        lastActive: new Date().toISOString(),
        isCurrent: true,
      },
    ],
    []
  )

  // Mock activities (would come from API)
  const activities = useMemo(
    () => [
      {
        id: '1',
        type: 'login' as const,
        title: 'Connexion réussie',
        description: 'Connexion depuis Chrome sur Windows',
        timestamp: new Date().toISOString(),
      },
    ],
    []
  )

  const handlePersonalInfoSubmit = (data: PersonalInfoFormData) => {
    updateProfileMutation.mutate(data)
  }

  const handlePasswordSubmit = (data: PasswordChangeFormData) => {
    changePasswordMutation.mutate(data)
  }

  const handleAvatarChange = (file: File) => {
    // TODO: Implement avatar upload
    console.log('Avatar upload:', file)
  }

  if (isLoading) {
    return (
      <PageLayout title="Profil" description="Gérez votre profil utilisateur">
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-1/4 rounded bg-gray-200" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-3/4 rounded bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageLayout>
    )
  }

  if (isError || !user) {
    return (
      <PageLayout title="Profil" description="Gérez votre profil utilisateur">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-sm text-red-600">
              {errorMessage || 'Une erreur est survenue lors du chargement du profil.'}
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Profil" description="Gérez votre profil utilisateur">
      <div className="space-y-6">
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          onEditClick={() => setIsEditing(!isEditing)}
          onAvatarChange={handleAvatarChange}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="personal">Personnel</TabsTrigger>
                <TabsTrigger value="security">Sécurité</TabsTrigger>
                <TabsTrigger value="preferences">Préférences</TabsTrigger>
                <TabsTrigger value="activity">Activité</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations Personnelles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={personalInfoForm.handleSubmit(handlePersonalInfoSubmit)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Prénom
                          </label>
                          <Input
                            {...personalInfoForm.register('firstName')}
                            disabled={!isEditing}
                            className={personalInfoForm.formState.errors.firstName ? 'border-red-500' : ''}
                          />
                          {personalInfoForm.formState.errors.firstName && (
                            <p className="mt-1 text-xs text-red-600">
                              {personalInfoForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Nom</label>
                          <Input
                            {...personalInfoForm.register('lastName')}
                            disabled={!isEditing}
                            className={personalInfoForm.formState.errors.lastName ? 'border-red-500' : ''}
                          />
                          {personalInfoForm.formState.errors.lastName && (
                            <p className="mt-1 text-xs text-red-600">
                              {personalInfoForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                        <Input
                          type="email"
                          {...personalInfoForm.register('email')}
                          disabled={!isEditing}
                          className={personalInfoForm.formState.errors.email ? 'border-red-500' : ''}
                        />
                        {personalInfoForm.formState.errors.email && (
                          <p className="mt-1 text-xs text-red-600">
                            {personalInfoForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Téléphone
                        </label>
                        <Input
                          type="tel"
                          {...personalInfoForm.register('phone')}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Adresse</label>
                        <Input
                          {...personalInfoForm.register('address')}
                          disabled={!isEditing}
                        />
                      </div>
                      {user.role === 'doctor' && (
                        <>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Spécialisation
                            </label>
                            <Input
                              {...personalInfoForm.register('specialization')}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Numéro de licence
                            </label>
                            <Input
                              {...personalInfoForm.register('licenseNumber')}
                              disabled={!isEditing}
                            />
                          </div>
                        </>
                      )}
                      {isEditing && (
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false)
                              personalInfoForm.reset()
                            }}
                          >
                            Annuler
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="bg-medical-blue-500 hover:bg-medical-blue-600 text-white"
                          >
                            <Save className="h-4 w-4" />
                            {updateProfileMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                          </Button>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="mt-6">
                <div className="space-y-6">
                  {/* Change Password */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Changer le mot de passe</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                        className="space-y-4"
                      >
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Mot de passe actuel
                          </label>
                          <Input
                            type="password"
                            {...passwordForm.register('currentPassword')}
                            className={passwordForm.formState.errors.currentPassword ? 'border-red-500' : ''}
                          />
                          {passwordForm.formState.errors.currentPassword && (
                            <p className="mt-1 text-xs text-red-600">
                              {passwordForm.formState.errors.currentPassword.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Nouveau mot de passe
                          </label>
                          <Input
                            type="password"
                            {...passwordForm.register('newPassword')}
                            className={passwordForm.formState.errors.newPassword ? 'border-red-500' : ''}
                          />
                          {passwordForm.formState.errors.newPassword && (
                            <p className="mt-1 text-xs text-red-600">
                              {passwordForm.formState.errors.newPassword.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Confirmer le mot de passe
                          </label>
                          <Input
                            type="password"
                            {...passwordForm.register('confirmPassword')}
                            className={passwordForm.formState.errors.confirmPassword ? 'border-red-500' : ''}
                          />
                          {passwordForm.formState.errors.confirmPassword && (
                            <p className="mt-1 text-xs text-red-600">
                              {passwordForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                        <Button
                          type="submit"
                          disabled={changePasswordMutation.isPending}
                          className="bg-medical-blue-500 hover:bg-medical-blue-600 text-white"
                        >
                          <Lock className="h-4 w-4" />
                          {changePasswordMutation.isPending ? 'Changement...' : 'Changer le mot de passe'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Active Sessions */}
                  <SecuritySessions sessions={sessions} />
                </div>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Préférences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Notifications */}
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                        <Bell className="h-5 w-5 text-medical-blue-600" />
                        Notifications
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Notifications par email</span>
                          <input type="checkbox" defaultChecked className="h-4 w-4" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Notifications SMS</span>
                          <input type="checkbox" className="h-4 w-4" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Notifications push</span>
                          <input type="checkbox" defaultChecked className="h-4 w-4" />
                        </label>
                      </div>
                    </div>

                    {/* Language & Theme */}
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                        <Globe className="h-5 w-5 text-medical-blue-600" />
                        Langue & Thème
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="mb-2 block text-sm text-gray-700">Langue</label>
                          <select className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                            <option>Français</option>
                            <option>English</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-gray-700">Thème</label>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Sun className="h-4 w-4" />
                              Clair
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Moon className="h-4 w-4" />
                              Sombre
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Export Data */}
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                        <Download className="h-5 w-5 text-medical-blue-600" />
                        Données personnelles
                      </h3>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4" />
                        Exporter toutes mes données (GDPR)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-6">
                <ActivityFeed activities={activities} />
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-sm text-gray-500">
                      {user.role === 'patient' || user.role === 'doctor'
                        ? 'Vos documents seront affichés ici'
                        : 'Aucun document disponible pour votre rôle'}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <RoleSpecificPanel
              user={user}
              upcomingAppointments={appointmentsData?.appointments || []}
              activePrescriptions={prescriptionsData?.prescriptions || []}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  )
})

Profile.displayName = 'Profile'

export { Profile }

