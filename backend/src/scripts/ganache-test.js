require('dotenv').config();
const ganacheService = require('../src/services/ganacheService');
const { sequelize } = require('../src/models');

async function testGanache() {
  try {
    console.log('🧪 Test Ganache Connection...');
    
    // Test connection Web3
    const networkId = await ganacheService.web3.eth.net.getId();
    console.log('✅ Network ID:', networkId);
    
    // Test accounts
    const accounts = await ganacheService.web3.eth.getAccounts();
    console.log('✅ Accounts:', accounts.length);
    console.log('  Default account:', accounts[0]);
    
    // Test balance
    const balance = await ganacheService.web3.eth.getBalance(accounts[0]);
    console.log('✅ Balance account 0:', ganacheService.web3.utils.fromWei(balance, 'ether'), 'ETH');
    
    // Test contrat
    if (ganacheService.contract) {
      console.log('✅ Contract address:', ganacheService.contract.options.address);
      
      // Test méthode simple
      try {
        const campaignCount = await ganacheService.contract.methods.numberOfCampaigns().call();
        console.log('✅ Number of campaigns:', campaignCount);
      } catch (error) {
        console.log('ℹ️ No campaigns yet');
      }
    }
    
    // Test DB
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    console.log('🎉 All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testGanache();