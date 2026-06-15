import { useState, useRef, lazy, Suspense } from 'react'

const ModelViewer = lazy(() => import('./three/ModelViewer'))

const ALLOWED = ['.stl', '.obj']
const STEP_HINT = 'STEP 目前無法線上預覽，請上傳 STL 或 OBJ 格式。'

const ext = (f) => '.' + f.name.split('.').pop().toLowerCase()
const idOf = (f) => `${f.name}|${f.size}`

export default function ModelUploadTool() {
  const [parts, setParts] = useState([])        // [{ file, id }]
  const [results, setResults] = useState({})    // id -> { status, dims }
  const [error, setError] = useState('')
  const [over, setOver] = useState(false)
  const inputRef = useRef(null)

  function addFiles(fileList) {
    const arr = Array.from(fileList)
    if (!arr.length) return
    const valid = arr.filter(f => ALLOWED.includes(ext(f)))
    const rejected = arr.filter(f => !ALLOWED.includes(ext(f)))
    setError(rejected.length ? STEP_HINT : '')
    if (!valid.length) return
    setParts(prev => {
      const next = [...prev]
      valid.forEach(f => { if (!next.find(p => p.id === idOf(f))) next.push({ file: f, id: idOf(f) }) })
      return next
    })
  }

  function removePart(id) {
    setParts(prev => prev.filter(p => p.id !== id))
    setResults(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  function handleResult(list) {
    setResults(prev => {
      const n = { ...prev }
      list.forEach(r => { n[r.id] = r })
      return n
    })
  }

  const files = parts.map(p => p.file)

  return (
    <div className="flex flex-col gap-4">
      {/* 上傳區 */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={e => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-colors ${
          over ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-700 hover:border-zinc-500'
        }`}
      >
        <div className="text-3xl mb-2">📦</div>
        <div className="text-zinc-300 text-sm">拖曳模型至此，或點擊選擇檔案</div>
        <div className="text-zinc-500 text-xs mt-1">支援 STL、OBJ｜可同時多檔</div>
        <input
          ref={inputRef}
          type="file"
          accept=".stl,.obj"
          multiple
          className="hidden"
          onChange={e => { addFiles(e.target.files); e.target.value = '' }}
        />
      </div>

      {error && <p className="text-amber-400 text-sm">{error}</p>}

      {/* 零件清單 */}
      {parts.length > 0 && (
        <div className="flex flex-col gap-2">
          {parts.map(p => {
            const r = results[p.id]
            const dims = r?.status === 'ok' ? r.dims : null
            const statusText = !r ? '分析中…' : r.status === 'ok' ? '✓ 正常' : r.status === 'unsupported' ? '不支援預覽' : '✗ 無法解析'
            const statusCls = !r ? 'text-zinc-500' : r.status === 'ok' ? 'text-green-400' : 'text-red-400'
            return (
              <div key={p.id} className="border border-zinc-800 rounded-lg bg-zinc-900/60 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <span>📄</span>
                  <span className="flex-1 text-sm text-zinc-200 truncate" title={p.file.name}>{p.file.name}</span>
                  <span className={`text-xs ${statusCls}`}>{statusText}</span>
                  <button onClick={() => removePart(p.id)} className="text-zinc-600 hover:text-red-400 text-base px-1" title="移除">✕</button>
                </div>
                {dims && (
                  <div className="flex gap-2 px-4 pb-3">
                    {['x', 'y', 'z'].map(ax => (
                      <div key={ax} className="flex-1 text-center bg-zinc-800 rounded-md py-2 border border-zinc-700">
                        <div className="text-[10px] text-zinc-500 font-bold">{ax.toUpperCase()}</div>
                        <div className="text-sm font-bold text-white">{dims[ax]}</div>
                        <div className="text-[10px] text-zinc-500">mm</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 3D 預覽 */}
      {parts.length > 0 && (
        <Suspense fallback={<div className="h-[340px] rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 text-sm">載入 3D 預覽元件中…</div>}>
          <ModelViewer files={files} onResult={handleResult} height={360} />
        </Suspense>
      )}
    </div>
  )
}
