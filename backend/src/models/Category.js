import { DataTypes } from 'sequelize';
import { define } from '../config/database.js';

const Category = define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'name'
  }
}, {
  tableName: 'categories',
  timestamps: false,
  underscored: true
});

export default Category;