const API_BASE_URL = 'https://fakestoreapi.com'

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export function getCategories() {
  return fetchJson(`${API_BASE_URL}/products/categories`)
}

export function getAllProducts() {
  return fetchJson(`${API_BASE_URL}/products`)
}

export function getProductsByCategory(category) {
  return fetchJson(
    `${API_BASE_URL}/products/category/${encodeURIComponent(category)}`,
  )
}
