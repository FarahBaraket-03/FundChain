require('dotenv').config();
const ganacheService = require('../src/services/ganacheService');
const { sequelize } = require('../src/models');

async function syncGanache() {
  try {
    console.log('🔄 Starting Ganache sync...');
    
    // Connect DB
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Sync campaigns
    await ganacheService.syncAllCampaigns();
    
    // Start event listeners for real-time updates
    ganacheService.startEventListeners();
    
    console.log('✅ Ganache sync completed and listening for events');
    
    // Keep running for event listeners
    process.stdin.resume();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping Ganache sync...');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncGanache();