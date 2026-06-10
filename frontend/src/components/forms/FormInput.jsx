export default function FormInput({ label, error, required, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm text-zinc-300">
          {label}{required && <span className="text-orange-400 ml-1">*</span>}
        </label>
      )}
      <input
        className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-colors"
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
