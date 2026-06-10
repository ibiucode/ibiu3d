export default function FormSelect({ label, error, required, options = [], className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm text-zinc-300">
          {label}{required && <span className="text-orange-400 ml-1">*</span>}
        </label>
      )}
      <select
        className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-colors appearance-none"
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
