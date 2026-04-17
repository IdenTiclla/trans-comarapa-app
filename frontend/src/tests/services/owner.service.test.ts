import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ownerService } from '@/services/owner.service'
import { apiFetch } from '@/lib/api'

// Mock the apiFetch utility
vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn()
}))

describe('OwnerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAll should call apiFetch with correct URL', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({ items: [] })
    const result = await ownerService.getAll()
    expect(apiFetch).toHaveBeenCalledWith('/owners', { params: {} })
    expect(result).toEqual({ items: [] })
  })

  it('getById should call apiFetch with correct URL', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({ id: 1, firstname: 'Test' })
    await ownerService.getById(1)
    expect(apiFetch).toHaveBeenCalledWith('/owners/1')
  })

  it('create should call apiFetch with POST', async () => {
    const data = { firstname: 'John', lastname: 'Doe' }
    vi.mocked(apiFetch).mockResolvedValueOnce({ id: 2, ...data })
    await ownerService.create(data)
    expect(apiFetch).toHaveBeenCalledWith('/owners', { method: 'POST', body: data })
  })

  it('update should call apiFetch with PUT', async () => {
    const data = { firstname: 'Jane' }
    vi.mocked(apiFetch).mockResolvedValueOnce({ id: 1, ...data })
    await ownerService.update(1, data)
    expect(apiFetch).toHaveBeenCalledWith('/owners/1', { method: 'PUT', body: data })
  })

  it('delete should call apiFetch with DELETE', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({ success: true })
    await ownerService.delete(1)
    expect(apiFetch).toHaveBeenCalledWith('/owners/1', { method: 'DELETE' })
  })

  it('getFinancials should call apiFetch with correct URL', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({ trips: [] })
    await ownerService.getFinancials(3)
    expect(apiFetch).toHaveBeenCalledWith('/owners/3/financials')
  })

  it('withdraw should call apiFetch with POST and specific payload data', async () => {
    const data = { trip_id: 10, amount: 500.5, office_id: 2 }
    vi.mocked(apiFetch).mockResolvedValueOnce({ success: true })
    await ownerService.withdraw(3, data)
    expect(apiFetch).toHaveBeenCalledWith('/owners/3/withdraw', { method: 'POST', body: data })
  })
})
