import * as React from 'react'
import { useState } from 'react'
import { Camera, CheckCircle2, Edit } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getUserInitials } from '@/utils/helpers'
import { cn } from '@/libs/utils'
import type { User } from '@/store/auth.store'

interface ProfileHeaderProps {
  user: User
  onEditClick?: () => void
  onAvatarChange?: (file: File) => void
  className?: string
}

const roleColors = {
  admin: 'bg-purple-100 text-purple-700 border-purple-300',
  doctor: 'bg-medical-blue-100 text-medical-blue-700 border-medical-blue-300',
  nurse: 'bg-medical-green-100 text-medical-green-700 border-medical-green-300',
  patient: 'bg-green-100 text-green-700 border-green-300',
  receptionist: 'bg-gray-100 text-gray-700 border-gray-300',
}

const roleLabels = {
  admin: 'Administrateur',
  doctor: 'Médecin',
  nurse: 'Infirmier(ère)',
  patient: 'Patient',
  receptionist: 'Réceptionniste',
}

export const ProfileHeader = React.forwardRef<HTMLDivElement, ProfileHeaderProps>(
  ({ user, onEditClick, onAvatarChange, className }, ref) => {
    const [isHovering, setIsHovering] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && onAvatarChange) {
        onAvatarChange(file)
      }
    }

    return (
      <Card
        ref={ref}
        className={cn(
          'border-medical-blue-200 bg-gradient-to-r from-medical-blue-50/50 to-medical-green-50/50 shadow-medical-card',
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Avatar Section */}
            <div className="relative">
              <div
                className="relative"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <Avatar
                  initials={getUserInitials(user.firstName, user.lastName)}
                  src={user.profile?.avatar}
                  size="xl"
                  className={cn(
                    'transition-all duration-300',
                    isHovering && 'scale-105 shadow-lg'
                  )}
                />
                {/* Role Badge */}
                <div
                  className={cn(
                    'absolute -bottom-2 -right-2 rounded-full border-2 border-white px-2 py-1 text-xs font-semibold',
                    roleColors[user.role]
                  )}
                >
                  {roleLabels[user.role]}
                </div>
                {/* Upload Overlay */}
                {onAvatarChange && (
                  <label
                    className={cn(
                      'absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 transition-opacity',
                      isHovering ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <Camera className="h-6 w-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="info" className={cn(roleColors[user.role])}>
                      {roleLabels[user.role]}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Email vérifié</span>
                    </div>
                  </div>
                </div>
                {onEditClick && (
                  <Button variant="outline" onClick={onEditClick}>
                    <Edit className="h-4 w-4" />
                    Modifier le profil
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
                {user.profile?.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium text-gray-900">{user.profile.phone}</p>
                  </div>
                )}
                {user.profile?.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="font-medium text-gray-900">{user.profile.address}</p>
                  </div>
                )}
                {user.profile?.specialization && (
                  <div>
                    <p className="text-sm text-gray-500">Spécialisation</p>
                    <p className="font-medium text-gray-900">{user.profile.specialization}</p>
                  </div>
                )}
                {user.profile?.licenseNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Numéro de licence</p>
                    <p className="font-medium text-gray-900">{user.profile.licenseNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
ProfileHeader.displayName = 'ProfileHeader'

