// categoryController.js
import { Category } from '../models/index.js';

class CategoryController {
  // Récupérer toutes les catégories
  async getAll(req, res) {
    try {
      const categories = await Category.findAll({
        order: [['name', 'ASC']]
      });
      res.json(categories);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des catégories:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Récupérer une catégorie spécifique
  async getOne(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({ error: 'Catégorie non trouvée' });
      }

      res.json(category);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la catégorie:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // Créer une catégorie (admin)
  async create(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Le nom de la catégorie est requis' });
      }

      const category = await Category.create({ name });
      res.status(201).json(category);
    } catch (error) {
      console.error('❌ Erreur lors de la création de la catégorie:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Catégorie déjà existante' });
      }
      
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

export default new CategoryController();