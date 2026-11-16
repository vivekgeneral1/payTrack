import { apiClient } from '@/lib/api-client'
import type { Category } from '@/types/api'

export async function fetchCategories() {
  const { data } = await apiClient.get<Category[]>('/categories')
  return data
}

export async function createCategory(input: { name: string; icon?: string; color?: string }) {
  const { data } = await apiClient.post<Category>('/categories', input)
  return data
}

export async function deleteCategory(id: string) {
  await apiClient.delete(`/categories/${id}`)
}
