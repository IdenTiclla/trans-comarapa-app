/**
 * Devuelve los números de página a mostrar, con elipsis cuando son muchas.
 * Convención: máximo 5 botones de página visibles a la vez.
 */
export function computeDisplayedPages(totalPages: number, currentPage: number): (number | string)[] {
  const pages: (number | string)[] = []
  const maxPagesToShow = 5

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  let startPage = Math.max(2, currentPage - 1)
  let endPage = Math.min(totalPages - 1, currentPage + 1)

  if (currentPage <= 2) endPage = 4
  else if (currentPage >= totalPages - 1) startPage = totalPages - 3

  if (startPage > 2) pages.push('...')
  for (let i = startPage; i <= endPage; i++) pages.push(i)
  if (endPage < totalPages - 1) pages.push('...')
  pages.push(totalPages)
  return pages
}
