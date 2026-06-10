import { useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import { api } from '../../services/api'

const MODULE_META = {
  pricing: {
    icon: '💰',
    desc: '根據 STL 模型體積、支撐量、列印時間自動計算報價，客戶即時取得估算結果，減少來回溝通成本。',
    tags: ['報價', '自動化'],
  },
  render: {
    icon: '🎨',
    desc: '上傳 STL/OBJ 後於瀏覽器即時 3D 預覽，客戶確認外觀與方向後再送出詢價，降低溝通誤差。',
    tags: ['WebGL', '3D 預覽'],
  },
  file_checker: {
    icon: '🔍',
    desc: '自動偵測非流形網格、薄壁、飛邊等常見列印問題，提供修復建議，減少退件率。',
    tags: ['品質', '前處理'],
  },
  slicer: {
    icon: '⚙️',
    desc: '後台整合切片引擎，自動取得列印時間與耗材重量，作為正式報價的計算依據。',
    tags: ['FDM', '切片'],
  },
  model_analyzer: {
    icon: '📐',
    desc: '解析模型尺寸、體積、面數，輸出列印可行性報告，協助客戶優化設計。',
    tags: ['STL', 'OBJ', '分析'],
  },
}

function ModuleCard({ id, module }) {
  const meta = MODULE_META[id] || {}
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden">
      {/* Coming soon ribbon */}
      <div className="absolute top-4 right-4">
        <span className="bg-zinc-800 text-zinc-500 text-xs font-medium px-2 py-0.5 rounded-full border border-zinc-700">
          Phase {module.phase}
        </span>
      </div>

      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0">{meta.icon || '📦'}</div>
        <div>
          <h3 className="text-white font-semibold">{module.name}</h3>
          <p className="text-zinc-500 text-sm mt-1 leading-relaxed">{meta.desc}</p>
        </div>
      </div>

      {meta.tags?.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {meta.tags.map(t => (
            <span key={t} className="bg-zinc-800 text-zinc-500 text-xs px-2 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zinc-600" />
          <span className="text-zinc-600 text-xs">即將推出</span>
        </div>
        <span className="text-zinc-700 text-xs">尚未開放</span>
      </div>
    </div>
  )
}

export default function AdminModules() {
  const { data, execute, loading } = useApi(api.getModules)

  useEffect(() => {
    execute().catch(() => {})
  }, [execute])

  const modules = data?.modules ? Object.entries(data.modules) : []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">未來模組</h1>
        <p className="text-zinc-500 text-sm mt-1">Phase 2 功能規劃，目前尚在開發中</p>
      </div>

      {/* Roadmap banner */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 mb-8 flex items-start gap-4">
        <span className="text-2xl flex-shrink-0">🚀</span>
        <div>
          <p className="text-orange-300 font-medium text-sm">Phase 2 開發中</p>
          <p className="text-zinc-400 text-sm mt-1">
            以下模組將在 Phase 2 陸續推出，目標是讓詢價流程從手動溝通演進為自動化估價＋即時 3D 預覽。
            目前僅顯示規劃方向，功能尚未啟用。
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-zinc-500 text-sm">載入中…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {modules.map(([id, module]) => (
            <ModuleCard key={id} id={id} module={module} />
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-5">開發里程碑</h2>
        <ol className="flex flex-col gap-4">
          {[
            { phase: 'Phase 1', label: '品牌網站 + 詢價系統', done: true },
            { phase: 'Phase 1.5', label: '後台管理：詢價管理、分析報表、帳號權限', done: true },
            { phase: 'Phase 2', label: 'STL/OBJ 分析 + 檔案檢查 + 模型預覽', done: false },
            { phase: 'Phase 2', label: '自動估價引擎 + FDM 切片整合', done: false },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-4">
              <div className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.done ? 'bg-green-500' : 'bg-zinc-700'}`} />
              <div>
                <span className={`text-xs font-medium ${item.done ? 'text-green-400' : 'text-zinc-600'}`}>
                  {item.phase}
                </span>
                <p className={`text-sm mt-0.5 ${item.done ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {item.label}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
