import sequelize from '../config/database.js';
import Category from './Category.js';  // Default import
import Campaign from './Campaign.js';  // Default import
import Donation from './Donation.js';  // Default import
import Withdrawal from './Withdrawal.js';  // Default import

// Set up associations
Category.hasMany(Campaign, { 
  foreignKey: 'category_id',
  as: 'campaigns'
});

Campaign.belongsTo(Category, { 
  foreignKey: 'category_id',
  as: 'category'
});

Campaign.hasMany(Donation, { 
  foreignKey: 'campaign_id',
  sourceKey: 'blockchain_id',
  as: 'donations'
});

Donation.belongsTo(Campaign, { 
  foreignKey: 'campaign_id',
  targetKey: 'blockchain_id',
  as: 'campaign'
});

Campaign.hasMany(Withdrawal, { 
  foreignKey: 'campaign_id',
  sourceKey: 'blockchain_id',
  as: 'withdrawals'
});

Withdrawal.belongsTo(Campaign, { 
  foreignKey: 'campaign_id',
  targetKey: 'blockchain_id',
  as: 'campaign'
});

export {
  sequelize,
  Category,
  Campaign,
  Donation,
  Withdrawal
};

export default {
  sequelize,
  Category,
  Campaign,
  Donation,
  Withdrawal
};