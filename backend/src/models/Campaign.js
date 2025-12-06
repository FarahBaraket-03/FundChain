import { DataTypes } from 'sequelize';
import { define } from '../config/database.js';

const Campaign = define('Campaign', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  blockchain_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'blockchain_id'
  },
  owner_address: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    },
    field: 'owner_address'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'title'
  },
  description: {
    type: DataTypes.TEXT,
    field: 'description'
  },
  target_amount: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
    field: 'target_amount'
  },
  deadline: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'deadline'
  },
  amount_collected: {
    type: DataTypes.DECIMAL(18, 8),
    defaultValue: 0,
    field: 'amount_collected'
  },
  image_url: {
    type: DataTypes.TEXT,
    field: 'image_url'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified'
  },
  funds_withdrawn: {
    type: DataTypes.DECIMAL(18, 8),
    defaultValue: 0,
    field: 'funds_withdrawn'
  },
  category_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'categories',
      key: 'id'
    },
    field: 'category_id'
  },
  social_links: {
    type: DataTypes.TEXT,
    defaultValue: '',
    field: 'social_links'
  }
}, {
  tableName: 'campaigns',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

export default Campaign;