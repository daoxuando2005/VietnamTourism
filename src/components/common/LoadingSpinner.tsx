interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function LoadingSpinner({ size = 'md', label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status">
      <div
        className={[
          'animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600',
          sizeStyles[size],
        ].join(' ')}
        aria-hidden="true"
      />
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  )
}
