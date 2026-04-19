export const receiptPrintStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
  .receipt-container { max-width: 800px; margin: 0 auto; }

  .grid { display: grid; }
  .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
  .grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
  .col-span-2 { grid-column: span 2; }
  .col-span-3 { grid-column: span 3; }
  .col-span-7 { grid-column: span 7; }
  .col-span-9 { grid-column: span 9; }
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .justify-center { justify-content: center; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }

  .gap-1 { gap: 0.25rem; }
  .gap-2 { gap: 0.5rem; }
  .gap-4 { gap: 1rem; }
  .space-x-2 > * + * { margin-left: 0.5rem; }
  .space-y-1 > * + * { margin-top: 0.25rem; }
  .space-y-3 > * + * { margin-top: 0.75rem; }
  .p-1 { padding: 0.25rem; }
  .p-2 { padding: 0.5rem; }
  .p-4 { padding: 1rem; }
  .p-6 { padding: 1.5rem; }
  .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
  .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
  .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
  .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
  .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 0.75rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mb-6 { margin-bottom: 1.5rem; }
  .mr-4 { margin-right: 1rem; }
  .mr-6 { margin-right: 1.5rem; }
  .mt-2 { margin-top: 0.5rem; }
  .-mt-1 { margin-top: -0.25rem; }
  .-mt-2 { margin-top: -0.5rem; }

  .bg-white { background-color: white; }
  .bg-gray-50 { background-color: #f9fafb; }
  .bg-blue-50 { background-color: #eff6ff; }
  .bg-blue-800 { background-color: #1e40af; }
  .bg-gradient-blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
  .bg-gradient-blue-header { background: linear-gradient(to right, #1e40af, #1d4ed8); }
  .bg-gradient-blue-light { background: linear-gradient(to right, #dbeafe, #eff6ff); }
  .bg-gradient-yellow { background: linear-gradient(to right, #fefce8, #fef3c7); }
  .bg-red-600 { background-color: #dc2626; }
  .text-white { color: white; }
  .text-gray-600 { color: #4b5563; }
  .text-blue-700 { color: #1d4ed8; }
  .text-blue-800 { color: #1e40af; }
  .text-blue-900 { color: #1e3a8a; }
  .text-yellow-800 { color: #92400e; }

  .border { border-width: 1px; }
  .border-4 { border-width: 4px; }
  .border-2 { border-width: 2px; }
  .border-blue-800 { border-color: #1e40af; }
  .border-gray-600 { border-color: #4b5563; }
  .border-gray-300 { border-color: #d1d5db; }
  .border-gray-200 { border-color: #e5e7eb; }
  .border-yellow-500 { border-color: #eab308; }
  .border-l-4 { border-left-width: 4px; }
  .border-t { border-top-width: 1px; }
  .border-t-2 { border-top-width: 2px; }
  .border-t-4 { border-top-width: 4px; }
  .border-b { border-bottom-width: 1px; }
  .border-b-2 { border-bottom-width: 2px; }
  .border-dotted { border-style: dotted; }
  .border-gray-400 { border-color: #9ca3af; }
  .border-gray-500 { border-color: #6b7280; }
  .rounded { border-radius: 0.25rem; }
  .rounded-sm { border-radius: 0.125rem; }
  .rounded-lg { border-radius: 0.5rem; }
  .rounded-xl { border-radius: 0.75rem; }
  .rounded-t { border-top-left-radius: 0.25rem; border-top-right-radius: 0.25rem; }
  .rounded-r-lg { border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; }

  .font-black { font-weight: 900; }
  .font-bold { font-weight: 700; }
  .font-semibold { font-weight: 600; }
  .font-medium { font-weight: 500; }
  .text-\\[10px\\] { font-size: 10px; }
  .text-\\[11px\\] { font-size: 11px; }
  .text-xs { font-size: 0.75rem; }
  .text-sm { font-size: 0.875rem; }
  .text-base { font-size: 1rem; }
  .text-lg { font-size: 1.125rem; }
  .text-xl { font-size: 1.25rem; }
  .text-2xl { font-size: 1.5rem; }
  .text-3xl { font-size: 1.875rem; }
  .text-4xl { font-size: 2.25rem; }
  .text-5xl { font-size: 3rem; }
  .tracking-wide { letter-spacing: 0.025em; }
  .tracking-wider { letter-spacing: 0.05em; }
  .leading-relaxed { line-height: 1.625; }

  .w-12 { width: 3rem; }
  .w-20 { width: 5rem; }
  .w-24 { width: 6rem; }
  .w-28 { width: 7rem; }
  .w-64 { width: 16rem; }
  .w-1\\/3 { width: 33.333333%; }
  .w-2\\/3 { width: 66.666667%; }
  .h-8 { height: 2rem; }
  .h-12 { height: 3rem; }
  .h-20 { height: 5rem; }
  .w-full { width: 100%; }
  .flex-1 { flex: 1; }

  .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
  .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
  .relative { position: relative; }
  .absolute { position: absolute; }
  .inset-x-0 { left: 0; right: 0; }
  .bottom-0 { bottom: 0; }
  .z-10 { z-index: 10; }
  .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  @media print {
    body { margin: 0; color: black; }
    .receipt-container { max-width: none; }
    .shadow-lg, .shadow-sm { box-shadow: none; }
    .bg-gradient-blue { background: #1e40af !important; }
    .bg-gradient-blue-header { background: #1e40af !important; }
    .bg-gradient-blue-light { background: #eff6ff !important; }
    .bg-gradient-yellow { background: #fefce8 !important; }
  }
`
