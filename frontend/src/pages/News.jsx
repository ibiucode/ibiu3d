import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { usePublicContent } from '../hooks/usePublicContent'
import { useAnalytics } from '../hooks/useAnalytics'
import Badge from '../components/ui/Badge'

function formatDate(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('zh-TW') } catch { return '' }
}

export default function News() {
  const { trackPageView } = useAnalytics()
  const { content: posts, loading } = usePublicContent(api.getPublicNews, [])

  useEffect(() => { trackPageView('/news') }, [trackPageView])

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">最新消息</h1>
        <p className="text-zinc-400 text-lg">工作坊公告、活動與最新動態</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-zinc-500 text-sm">載入中…</div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-zinc-400">目前尚無最新消息，敬請期待。</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map(post => (
            <Link
              key={post.id ?? post.slug}
              to={`/news/${post.slug}`}
              className="block bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                {post.is_pinned && <Badge variant="orange">置頂</Badge>}
                {post.category && <Badge variant="default">{post.category}</Badge>}
                <span className="text-zinc-500 text-xs ml-auto">{formatDate(post.published_at)}</span>
              </div>
              <h2 className="text-white font-semibold text-lg mb-1">{post.title}</h2>
              {post.summary && <p className="text-zinc-400 text-sm leading-relaxed">{post.summary}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
