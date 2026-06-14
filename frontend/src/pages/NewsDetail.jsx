import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { useAnalytics } from '../hooks/useAnalytics'
import Badge from '../components/ui/Badge'

function formatDate(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('zh-TW') } catch { return '' }
}

export default function NewsDetail() {
  const { slug } = useParams()
  const { trackPageView } = useAnalytics()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => { trackPageView(`/news/${slug}`) }, [trackPageView, slug])

  useEffect(() => {
    let active = true
    setLoading(true); setNotFound(false)
    api.getPublicNewsDetail(slug)
      .then(p => { if (active) setPost(p) })
      .catch(() => { if (active) setNotFound(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [slug])

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/news" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">← 返回最新消息</Link>

      {loading ? (
        <div className="py-16 text-center text-zinc-500 text-sm">載入中…</div>
      ) : notFound || !post ? (
        <div className="py-16 text-center bg-zinc-900 border border-zinc-800 rounded-xl mt-6">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-zinc-400 mb-4">找不到這則公告，可能已下架。</p>
          <Link to="/news" className="text-orange-400 hover:text-orange-300 text-sm">回最新消息列表</Link>
        </div>
      ) : (
        <article className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            {post.is_pinned && <Badge variant="orange">置頂</Badge>}
            {post.category && <Badge variant="default">{post.category}</Badge>}
            <span className="text-zinc-500 text-xs ml-auto">{formatDate(post.published_at)}</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-6">{post.title}</h1>
          {post.cover_image_url && (
            <img src={post.cover_image_url} alt={post.title} className="w-full rounded-xl border border-zinc-800 mb-6" loading="lazy" />
          )}
          <div className="text-zinc-300 text-base leading-relaxed whitespace-pre-wrap">{post.content}</div>
        </article>
      )}
    </div>
  )
}
