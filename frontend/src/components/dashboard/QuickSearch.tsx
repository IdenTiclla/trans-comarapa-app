import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import PackageReceiptModal from '@/components/packages/PackageReceiptModal'
import ClientViewModal from '@/components/clients/ClientViewModal'
import { SearchTrigger } from './quick-search/SearchTrigger'
import { CategoryPicker } from './quick-search/CategoryPicker'
import { SearchResultsView } from './quick-search/SearchResultsView'
import { useQuickSearch } from './quick-search/use-quick-search'

export default function QuickSearch() {
  const {
    open,
    setOpen,
    viewMode,
    query,
    setQuery,
    selectedCategory,
    results,
    isLoading,
    error,
    selectedItem,
    showDetailModal,
    handleCategorySelect,
    handleItemSelect,
    handleBack,
    handleDetailClose,
    clearQuery,
    navigate,
  } = useQuickSearch()

  return (
    <>
      <SearchTrigger onOpen={() => setOpen(true)} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden" showCloseButton={false}>
          <DialogTitle className="sr-only">Busqueda Rapida</DialogTitle>

          {viewMode === 'category' && <CategoryPicker onSelect={handleCategorySelect} />}

          {viewMode === 'search' && selectedCategory && (
            <SearchResultsView
              categoryId={selectedCategory}
              query={query}
              onQueryChange={setQuery}
              onClear={clearQuery}
              onBack={handleBack}
              onItemSelect={handleItemSelect}
              results={results}
              isLoading={isLoading}
              error={error}
            />
          )}

          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 text-xs">Esc</kbd>
                cerrar
              </span>
            </div>
            <span className="text-gray-400">Trans Comarapa</span>
          </div>
        </DialogContent>
      </Dialog>

      <PackageReceiptModal
        show={showDetailModal && selectedItem?.category === 'package'}
        packageData={selectedItem?.data}
        onClose={handleDetailClose}
      />

      <ClientViewModal
        show={showDetailModal && selectedItem?.category === 'client'}
        client={selectedItem?.data}
        onClose={handleDetailClose}
        onEdit={() => {
          handleDetailClose()
          navigate(`/clients/${selectedItem?.id}/edit`)
        }}
      />
    </>
  )
}
