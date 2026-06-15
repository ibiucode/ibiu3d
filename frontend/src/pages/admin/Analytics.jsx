import { useEffect, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { api } from '../../services/api'

const PAGE_LABEL = {
  '/': '首頁',
  '/about': '關於我們',
  '/services': '服務項目',
  '/services/fdm': 'FDM 列印',
  '/services/sla': 'SLA 列印',
  '/materials': '材料介紹',
  '/gallery': '作品集',
  '/faq': '常見問題',
  '/contact': '聯絡我們',
  '/quote': '模型預覽',
  '/privacy': '隱私政策',
}

function StatCard({ label, value, color = 'text-white', sub }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className={`text-3xl font-black mb-1 ${color}`}>{value ?? '—'}</div>
      <div className="text-zinc-500 text-sm">{label}</div>
      {sub && <div className="text-zinc-600 text-xs mt-1">{sub}</div>}
    </div>
  )
}

function BarChart({ data }) {
  if (!data?.length || data.every(d => d.views === 0)) {
    return <div className="h-20 flex items-center justify-center text-zinc-600 text-xs">尚無瀏覽資料</div>
  }
  const max = Math.max(...data.map(d => d.views), 1)
  return (
    <div className="flex items-end gap-px h-20" title="">
      {data.map(d => (
        <div
          key={d.date}
          title={`${d.date}：${d.views} 次`}
          className="flex-1 bg-orange-500/50 hover:bg-orange-500 rounded-sm transition-colors cursor-default"
          style={{ height: `${Math.max(3, (d.views / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

function FunnelStep({ label, value, base, color }) {
  const pct = base > 0 ? Math.round((value / base) * 100) : 0
  const width = base > 0 ? Math.max(8, pct) : 100
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-zinc-400 text-xs flex-shrink-0 text-right">{label}</div>
      <div className="flex-1 bg-zinc-800 rounded-full h-5 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500 flex items-center justify-end pr-2`}
          style={{ width: `${width}%` }}
        >
          <span className="text-white text-xs font-medium">{value}</span>
        </div>
      </div>
      <div className="w-12 text-zinc-500 text-xs flex-shrink-0">
        {base > 0 && value !== base ? `${pct}%` : ''}
      </div>
    </div>
  )
}

const DAY_OPTIONS = [7, 14, 30, 90]

export default function AdminAnalytics() {
  const [days, setDays] = useState(30)
  const { data: summary, execute: fetchSummary, loading: sumLoading } = useApi(api.getAnalyticsSummary)
  const { data: pages, execute: fetchPages } = useApi(api.getPopularPages)
  const { data: trend, execute: fetchTrend } = useApi(api.getDailyTrend)

  useEffect(() => {
    fetchSummary(days).catch(() => {})
    fetchPages(days).catch(() => {})
    fetchTrend(days).catch(() => {})
  }, [days])

  const maxPageViews = pages?.length ? Math.max(...pages.map(p => p.views), 1) : 1

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">分析報表</h1>
          <p className="text-zinc-500 text-sm mt-1">網站訪客與詢價行為統計</p>
        </div>
        <div className="flex gap-1.5">
          {DAY_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                days === d
                  ? 'bg-orange-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {d} 天
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="總瀏覽次數" value={sumLoading ? '…' : summary?.total_pageviews} color="text-blue-400" />
        <StatCard label="不重複訪客" value={sumLoading ? '…' : summary?.unique_sessions} color="text-purple-400" />
        <StatCard label="詢價按鈕點擊" value={sumLoading ? '…' : summary?.quote_clicks} color="text-yellow-400" />
        <StatCard label="表單送出" value={sumLoading ? '…' : summary?.form_submits} color="text-green-400" />
        <StatCard label="詢價單建立" value={sumLoading ? '…' : summary?.total_inquiries} color="text-orange-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: trend + popular pages */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Daily trend */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">每日瀏覽趨勢</h2>
            <BarChart data={trend} />
            {trend?.length > 0 && (
              <div className="flex justify-between mt-2 text-zinc-600 text-xs">
                <span>{trend[0]?.date}</span>
                <span>{trend[trend.length - 1]?.date}</span>
              </div>
            )}
          </div>

          {/* Popular pages */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">熱門頁面</h2>
            {!pages?.length ? (
              <p className="text-zinc-600 text-sm">尚無資料</p>
            ) : (
              <div className="flex flex-col gap-3">
                {pages.map((p, i) => (
                  <div key={p.page} className="flex items-center gap-3">
                    <span className="text-zinc-600 text-xs w-4 flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-zinc-300 text-xs truncate">
                          {PAGE_LABEL[p.page] || p.page}
                        </span>
                        <span className="text-zinc-400 text-xs ml-2 flex-shrink-0">{p.views}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500/60 rounded-full"
                          style={{ width: `${(p.views / maxPageViews) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: conversion funnel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-fit">
          <h2 className="text-white font-semibold mb-5">轉換漏斗</h2>
          {!summary ? (
            <p className="text-zinc-600 text-sm">載入中…</p>
          ) : (
            <div className="flex flex-col gap-3">
              <FunnelStep
                label="頁面瀏覽"
                value={summary.total_pageviews}
                base={summary.total_pageviews}
                color="bg-blue-500"
              />
              <FunnelStep
                label="點擊詢價"
                value={summary.quote_clicks}
                base={summary.total_pageviews}
                color="bg-purple-500"
              />
              <FunnelStep
                label="送出表單"
                value={summary.form_submits}
                base={summary.total_pageviews}
                color="bg-yellow-500"
              />
              <FunnelStep
                label="詢價建立"
                value={summary.total_inquiries}
                base={summary.total_pageviews}
                color="bg-orange-500"
              />
            </div>
          )}
          {summary && summary.total_pageviews > 0 && (
            <div className="mt-5 pt-5 border-t border-zinc-800">
              <p className="text-zinc-500 text-xs">整體轉換率</p>
              <p className="text-2xl font-black text-orange-400 mt-1">
                {((summary.total_inquiries / summary.total_pageviews) * 100).toFixed(1)}%
              </p>
              <p className="text-zinc-600 text-xs mt-0.5">瀏覽 → 詢價</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
