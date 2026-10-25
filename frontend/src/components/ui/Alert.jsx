import { AlertCircle, CheckCircle, XCircle, X } from 'lucide-react'

const variants = {
  error:   { bg: 'bg-red-50 border-red-200',     text: 'text-red-700',   Icon: XCircle },
  success: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', Icon: CheckCircle },
  info:    { bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-700',  Icon: AlertCircle },
}

export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null
  const { bg, text, Icon } = variants[type] || variants.error

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${bg} ${text}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
