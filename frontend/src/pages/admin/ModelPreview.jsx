import ModelUploadTool from '../../components/ModelUploadTool'

export default function AdminModelPreview() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">模型預覽</h1>
        <p className="text-zinc-500 text-sm mt-1">上傳 STL / OBJ 在瀏覽器檢視外觀與尺寸（檔案不上傳伺服器，僅供檢視）</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <ModelUploadTool />
      </div>
    </div>
  )
}
