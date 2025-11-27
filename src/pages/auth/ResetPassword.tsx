import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/api/axios'
import { endpoints } from '@/api/endpoints'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(8, 'La confirmation du mot de passe est requise'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token de réinitialisation manquant')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await api.post(endpoints.auth.resetPassword, {
        token,
        password: data.password,
      })
      setIsSubmitted(true)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(
        axiosError?.response?.data?.message ||
        'Une erreur est survenue. Veuillez réessayer.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Mot de passe réinitialisé
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          Votre mot de passe a été réinitialisé avec succès.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Se connecter
        </Link>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Token invalide</h2>
        <p className="mb-6 text-sm text-gray-600">
          Le lien de réinitialisation est invalide ou expiré.
        </p>
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        Réinitialiser le mot de passe
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Entrez votre nouveau mot de passe ci-dessous.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Réinitialisation...
            </>
          ) : (
            'Réinitialiser le mot de passe'
          )}
        </button>
      </form>

      {/* Back to login */}
      <Link
        to="/login"
        className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la connexion
      </Link>
    </div>
  )
}


