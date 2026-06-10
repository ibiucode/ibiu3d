export default function Card({ children, className = '', hover = false }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-6 ${hover ? 'hover:border-zinc-600 transition-colors' : ''} ${className}`}>
      {children}
    </div>
  )
}
