import { useCallback, useRef } from 'react'
import { api } from '@/services/api'

function getSessionId() {
  let sid = sessionStorage.getItem('_sid')
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem('_sid', sid)
  }
  return sid
}

export function useAnalytics() {
  const sessionId = useRef(getSessionId())

  const track = useCallback((eventType, properties = {}) => {
    api.trackEvent({
      session_id: sessionId.current,
      event_type: eventType,
      page_path: window.location.hash.replace('#', '') || '/',
      properties,
    })
  }, [])

  const trackPageView = useCallback((path) => {
    track('page_view', { path })
  }, [track])

  return { track, trackPageView, sessionId: sessionId.current }
}
