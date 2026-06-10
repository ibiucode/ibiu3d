const VARIANTS = {
  primary: 'bg-orange-500 hover:bg-orange-400 text-white',
  secondary: 'bg-zinc-700 hover:bg-zinc-600 text-white',
  outline: 'border border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white',
  ghost: 'text-zinc-400 hover:text-white',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
