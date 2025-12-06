import { DataTypes } from 'sequelize';
import { define } from '../config/database.js';

const Donation = define('Donation', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  campaign_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'campaigns',
      key: 'blockchain_id'
    },
    field: 'campaign_id'
  },
  donor_address: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    },
    field: 'donor_address'
  },
  amount: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
    field: 'amount'
  },
  transaction_hash: {
    type: DataTypes.STRING(66),
    allowNull: false,
    unique: true,
    field: 'transaction_hash'
  },
  block_number: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'block_number'
  }
}, {
  tableName: 'donations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
});

export default Donation;