export const BRAND = {
  name: '職人自造',
  tagline: '精準製造，實現你的設計',
  description: '專業 FDM・SLA 3D 列印服務，提供建模、修模、後處理加工，上傳模型即時估價。',
  email: 'hello@3dworkshop.tw',
  phone: '0912-345-678',
  ig: 'https://instagram.com/3dworkshop_tw',
  line: 'https://line.me/ti/p/~3dworkshop',
}

export const NAV_LINKS = [
  { label: '首頁', path: '/' },
  { label: 'FDM 列印', path: '/services/fdm' },
  { label: 'SLA 列印', path: '/services/sla' },
  { label: '材料介紹', path: '/materials' },
  { label: '作品展示', path: '/gallery' },
  { label: 'FAQ', path: '/faq' },
  { label: '聯絡我們', path: '/contact' },
]

export const SERVICES_LIST = [
  'FDM 3D 列印',
  'SLA 光固化列印',
  '建模服務',
  '修模・分件',
  '後處理加工',
]

export const STATS = [
  { value: '500+', label: '完成件數' },
  { value: '98%', label: '客戶滿意度' },
  { value: '3', label: '機台設備' },
  { value: '24h', label: '快速回報' },
]

export const MATERIALS_FDM = [
  { name: 'PLA', desc: '最常用，易印，適合模型展示品', color: 'text-green-400' },
  { name: 'PETG', desc: '耐衝擊、耐熱，適合功能性零件', color: 'text-blue-400' },
  { name: 'ABS', desc: '高強度、耐高溫，需封閉機台', color: 'text-yellow-400' },
  { name: 'TPU', desc: '彈性材質，適合軟性零件、保護套', color: 'text-purple-400' },
]

export const MATERIALS_SLA = [
  { name: '標準樹脂', desc: '高細節，適合展示模型', color: 'text-orange-400' },
  { name: '工程樹脂', desc: '高強度、耐熱，功能性零件', color: 'text-red-400' },
  { name: '彈性樹脂', desc: '類橡膠質感，柔性應用', color: 'text-teal-400' },
]
