// CMS 主題：將 site_settings 的顏色（經 hex 驗證）套到 :root CSS variables。
// 無效色值會被忽略，沿用 index.css 的 fallback 預設值，避免破壞畫面。

export function isValidHex(value) {
  return typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())
}

const VAR_MAP = {
  '--color-primary': 'primary_color',
  '--color-secondary': 'secondary_color',
  '--color-background': 'background_color',
  '--color-surface': 'surface_color',
  '--color-text': 'text_color',
  '--color-accent': 'accent_color',
  '--color-border': 'border_color',
}

export function applyTheme(settings) {
  if (!settings || typeof settings !== 'object') return
  const root = document.documentElement
  for (const [cssVar, field] of Object.entries(VAR_MAP)) {
    const val = settings[field]
    if (isValidHex(val)) root.style.setProperty(cssVar, val.trim())
  }
}
