import * as React from 'react'
import { cn } from '@/libs/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials?: string
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, initials, src, alt, size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-br from-medical-blue-400 to-medical-green-400 font-semibold text-white shadow-sm',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt} className="h-full w-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export { Avatar }

