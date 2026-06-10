const VARIANTS = {
  default: 'bg-zinc-700 text-zinc-300',
  orange: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  green: 'bg-green-500/20 text-green-400 border border-green-500/30',
  red: 'bg-red-500/20 text-red-400 border border-red-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  )
}
