import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, Send, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { axiosInstance } from '@/api/axiosInstance'
import { endpoints } from '@/api/endpoints'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await axiosInstance.post(endpoints.auth.requestPasswordReset, { email: data.email })
      setIsSubmitted(true)
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
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Email envoyé
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          Nous avons envoyé un lien de réinitialisation à votre adresse email.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        Mot de passe oublié
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser
        votre mot de passe.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="votre@email.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
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
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Envoyer le lien
            </>
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


