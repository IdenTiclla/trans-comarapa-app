import { useState, useRef, useCallback, useId, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface FormFileUploadProps {
  value?: File | File[] | null
  onChange?: (files: File | File[] | null) => void
  label?: string
  accept?: string
  multiple?: boolean
  required?: boolean
  disabled?: boolean
  error?: string
  helpText?: string
  maxSize?: number
  maxFiles?: number
  onError?: (message: string) => void
  id?: string
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(file: File) {
  return file.type.startsWith('image/')
}

export default function FormFileUpload({
  value,
  onChange,
  label,
  accept = '',
  multiple = false,
  required,
  disabled,
  error,
  helpText,
  maxSize = 5 * 1024 * 1024,
  maxFiles = 5,
  onError,
  id: propId,
}: FormFileUploadProps) {
  const autoId = useId()
  const id = propId ?? autoId
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDragOver, setIsDragOver] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  // Sync files from value prop
  useEffect(() => {
    if (!value) { setFiles([]); return }
    if (Array.isArray(value)) setFiles(value)
    else setFiles([value])
  }, [value])

  const isFileTypeAccepted = useCallback(
    (file: File): boolean => {
      if (!accept) return true
      const types = accept.split(',').map((t) => t.trim())
      return types.some((type) => {
        if (type.startsWith('.')) return `.${file.name.split('.').pop()?.toLowerCase()}` === type.toLowerCase()
        if (type.endsWith('/*')) return file.type.startsWith(type.split('/')[0] + '/')
        return file.type === type
      })
    },
    [accept]
  )

  const validateFiles = useCallback(
    (fileList: FileList | File[]) => {
      const valid: File[] = []
      const arr = Array.from(fileList)

      if (multiple && arr.length + files.length > maxFiles) {
        onError?.(`No puedes subir más de ${maxFiles} archivos.`)
        return valid
      }

      for (const file of arr) {
        if (file.size > maxSize) {
          onError?.(`El archivo "${file.name}" excede el tamaño máximo de ${formatFileSize(maxSize)}.`)
          continue
        }
        if (accept && !isFileTypeAccepted(file)) {
          onError?.(`El archivo "${file.name}" no es de un tipo permitido.`)
          continue
        }
        valid.push(file)
      }
      return valid
    },
    [files.length, multiple, maxFiles, maxSize, accept, isFileTypeAccepted, onError]
  )

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      if (disabled) return
      const valid = validateFiles(fileList)
      if (!valid.length) return

      if (multiple) {
        const newFiles = [...files, ...valid]
        setFiles(newFiles)
        onChange?.(newFiles)
      } else {
        setFiles([valid[0]])
        onChange?.(valid[0])
      }
    },
    [disabled, validateFiles, multiple, files, onChange]
  )

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onChange?.(multiple ? newFiles : null)
  }

  const previewImage = (file: File) => {
    if (!isImage(file)) return
    const reader = new FileReader()
    reader.onload = (e) => setPreviewSrc(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const helperText = (() => {
    let text = multiple ? `Máximo ${maxFiles} archivos` : 'Solo un archivo'
    text += ` (máx. ${formatFileSize(maxSize)})`
    if (accept) {
      text += ` - ${accept.split(',').map((t) => t.trim().replace('.', '').toUpperCase()).join(', ')}`
    }
    return text
  })()

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className={cn('block text-sm font-medium text-gray-700 mb-1', error && 'text-red-600')}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={cn(
          'mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md',
          error ? 'border-red-300' : isDragOver ? 'border-blue-300 bg-blue-50' : 'border-gray-300',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
        )}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragOver(true) }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false) }}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="space-y-1 text-center">
          <svg
            className={cn('mx-auto h-12 w-12', error ? 'text-red-400' : isDragOver ? 'text-blue-400' : 'text-gray-400')}
            stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"
          >
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex text-sm text-gray-600">
            <span className={cn('font-medium', error ? 'text-red-500' : isDragOver ? 'text-blue-600' : 'text-blue-500')}>
              {multiple ? 'Subir archivos' : 'Subir archivo'}
            </span>
            <p className="pl-1">o arrastra y suelta</p>
          </div>
          <p className="text-xs text-gray-500">{helperText}</p>
          <input
            id={id}
            ref={fileInputRef}
            type="file"
            className="sr-only"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(e) => { if (e.target.files) { handleFiles(e.target.files); e.target.value = '' } }}
          />
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Archivos seleccionados:</h4>
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
            {files.map((file, index) => (
              <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                <div className="w-0 flex-1 flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    {isImage(file) ? (
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    )}
                  </svg>
                  <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                </div>
                <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                  {isImage(file) && !disabled && (
                    <button type="button" className="text-blue-600 hover:text-blue-800" onClick={(e) => { e.stopPropagation(); previewImage(file) }}>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  {!disabled && (
                    <button type="button" className="text-red-600 hover:text-red-800" onClick={(e) => { e.stopPropagation(); removeFile(index) }}>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}

      {previewSrc && (
        <div className="fixed inset-0 modal-overlay-bokeh flex items-center justify-center z-50" onClick={() => setPreviewSrc(null)}>
          <div className="max-w-3xl max-h-[90vh] p-2 bg-white rounded-lg shadow-xl">
            <img src={previewSrc} className="max-w-full max-h-[80vh] object-contain" alt="Vista previa" />
            <div className="mt-2 flex justify-end">
              <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" onClick={(e) => { e.stopPropagation(); setPreviewSrc(null) }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
