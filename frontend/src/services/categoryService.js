// src/services/categoryService.js
import api from './api';

class CategoryService {
  // Get all categories
  async getAllCategories() {
    return api.request('/categories');
  }

  // Get category by ID
  async getCategory(id) {
    return api.request(`/categories/${id}`);
  }

  // Create category (authenticated)
  async createCategory(name, signer, address) {
    return api.authenticatedRequest('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }, signer, address);
  }
}

export default new CategoryService();