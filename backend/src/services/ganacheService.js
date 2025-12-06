const Web3 = require('web3');
const { Campaign, Donation, Withdrawal } = require('../models');

class GanacheService {
  constructor() {
    this.web3 = new Web3(process.env.WEB3_PROVIDER_URL || 'http://localhost:8545');
    this.contract = null;
    this.contractABI = require('../../contracts/Crowdfunding.json'); // Votre ABI
    this.initContract();
    this.setupAccounts();
  }

  async initContract() {
    try {
      // Obtenir le contrat déployé
      const networkId = await this.web3.eth.net.getId();
      const deployedNetwork = this.contractABI.networks[networkId];
      
      if (deployedNetwork) {
        this.contract = new this.web3.eth.Contract(
          this.contractABI.abi,
          deployedNetwork.address
        );
        console.log('✅ Contrat connecté à Ganache:', deployedNetwork.address);
      } else {
        console.log('⚠️ Contrat non déployé sur Ganache');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation contrat:', error);
    }
  }

  async setupAccounts() {
    try {
      const accounts = await this.web3.eth.getAccounts();
      console.log(`✅ ${accounts.length} comptes Ganache disponibles`);
      
      // Premier compte pour les transactions admin
      this.defaultAccount = accounts[0];
      
      // Récupérer les balances
      for (let i = 0; i < Math.min(accounts.length, 3); i++) {
        const balance = await this.web3.eth.getBalance(accounts[i]);
        console.log(`  Account ${i}: ${accounts[i]} - ${this.web3.utils.fromWei(balance, 'ether')} ETH`);
      }
    } catch (error) {
      console.error('❌ Erreur setup accounts:', error);
    }
  }

  // Synchroniser toutes les campagnes depuis Ganache
  async syncAllCampaigns() {
    if (!this.contract) {
      console.error('❌ Contrat non initialisé');
      return;
    }

    try {
      const campaignCount = await this.contract.methods.numberOfCampaigns().call();
      console.log(`🔄 Synchronisation de ${campaignCount} campagnes depuis Ganache...`);

      for (let i = 0; i < campaignCount; i++) {
        await this.syncCampaign(i);
      }

      console.log('✅ Synchronisation terminée');
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    }
  }

  async syncCampaign(campaignId) {
    try {
      console.log(`🔄 Syncing campaign ${campaignId}...`);
      
      const campaignData = await this.contract.methods.getCampaignDetails(campaignId).call();
      
      // Convertir les valeurs wei -> ether
      const targetAmount = this.web3.utils.fromWei(campaignData.target, 'ether');
      const amountCollected = this.web3.utils.fromWei(campaignData.amountCollected, 'ether');
      const fundsWithdrawn = this.web3.utils.fromWei(campaignData.fundsWithdrawn, 'ether');

      const [campaign, created] = await Campaign.upsert({
        blockchain_id: campaignId,
        owner_address: campaignData.owner.toLowerCase(),
        title: campaignData.title || 'Sans titre',
        description: campaignData.description || '',
        target_amount: targetAmount,
        deadline: campaignData.deadline,
        amount_collected: amountCollected,
        image_url: campaignData.image || '',
        is_active: campaignData.isActive,
        is_verified: campaignData.isVerified || false,
        funds_withdrawn: fundsWithdrawn
      });

      console.log(`  ${created ? 'Créée' : 'Mise à jour'} campagne ${campaignId}: ${campaign.title}`);

      // Synchroniser les dons
      await this.syncCampaignDonations(campaignId);
    } catch (error) {
      console.error(`❌ Erreur sync campagne ${campaignId}:`, error.message);
    }
  }

  async syncCampaignDonations(campaignId) {
    try {
      const donations = await this.contract.methods.getDonators(campaignId).call();
      const donators = donations[0];
      const amounts = donations[1];

      console.log(`  ${donators.length} donateurs pour campagne ${campaignId}`);

      for (let i = 0; i < donators.length; i++) {
        const amount = this.web3.utils.fromWei(amounts[i], 'ether');
        
        // Pour Ganache, on crée un hash de transaction simulé
        const transactionHash = `ganache_sync_${campaignId}_${i}_${Date.now()}`;
        
        await Donation.findOrCreate({
          where: {
            campaign_id: campaignId,
            donor_address: donators[i].toLowerCase(),
            transaction_hash: transactionHash
          },
          defaults: {
            amount: amount,
            block_number: 0 // Pas de block number en sync
          }
        });
      }
    } catch (error) {
      console.error(`  Erreur sync dons campagne ${campaignId}:`, error.message);
    }
  }

  // Écouter les événements en temps réel
  startEventListeners() {
    if (!this.contract) return;

    console.log('🎧 Démarrage écouteurs d\'événements Ganache...');

    // Événement Nouvelle Campagne
    this.contract.events.CampaignCreated({
      fromBlock: 'latest'
    })
    .on('data', async (event) => {
      console.log('🎉 Nouvelle campagne créée sur Ganache:', event.returnValues);
      await this.syncCampaign(event.returnValues.campaignId);
    })
    .on('error', console.error);

    // Événement Don
    this.contract.events.DonationMade({
      fromBlock: 'latest'
    })
    .on('data', async (event) => {
      console.log('💸 Don reçu sur Ganache:', event.returnValues);
      await this.handleNewDonation(event);
    })
    .on('error', console.error);

    // Événement Retrait
    this.contract.events.FundsWithdrawn({
      fromBlock: 'latest'
    })
    .on('data', async (event) => {
      console.log('💰 Retrait effectué sur Ganache:', event.returnValues);
      await this.handleNewWithdrawal(event);
    })
    .on('error', console.error);

    console.log('✅ Écouteurs d\'événements démarrés');
  }

  async handleNewDonation(event) {
    try {
      const { campaignId, donor, amount } = event.returnValues;
      const donationAmount = this.web3.utils.fromWei(amount, 'ether');

      const donation = await Donation.create({
        campaign_id: campaignId,
        donor_address: donor.toLowerCase(),
        amount: donationAmount,
        transaction_hash: event.transactionHash,
        block_number: event.blockNumber
      });

      // Mettre à jour la campagne
      await Campaign.increment('amount_collected', {
        by: donationAmount,
        where: { blockchain_id: campaignId }
      });

      console.log(`✅ Don enregistré: ${donationAmount} ETH par ${donor}`);
    } catch (error) {
      console.error('❌ Erreur traitement don:', error);
    }
  }

  async handleNewWithdrawal(event) {
    try {
      const { campaignId, recipient, amount } = event.returnValues;
      const withdrawalAmount = this.web3.utils.fromWei(amount, 'ether');

      const withdrawal = await Withdrawal.create({
        campaign_id: campaignId,
        recipient_address: recipient.toLowerCase(),
        amount: withdrawalAmount,
        transaction_hash: event.transactionHash,
        block_number: event.blockNumber
      });

      // Mettre à jour la campagne
      await Campaign.increment('funds_withdrawn', {
        by: withdrawalAmount,
        where: { blockchain_id: campaignId }
      });

      console.log(`✅ Retrait enregistré: ${withdrawalAmount} ETH vers ${recipient}`);
    } catch (error) {
      console.error('❌ Erreur traitement retrait:', error);
    }
  }

  // Méthode utilitaire pour signer des messages (pour les tests)
  async signMessage(message, accountIndex = 0) {
    const accounts = await this.web3.eth.getAccounts();
    const account = accounts[accountIndex];
    
    return await this.web3.eth.personal.sign(
      message,
      account,
      '' // password
    );
  }

  // Obtenir un compte pour les tests
  async getTestAccount(index = 0) {
    const accounts = await this.web3.eth.getAccounts();
    return accounts[index];
  }

  // Transfert ETH entre comptes (pour tests)
  async transferETH(fromIndex, toAddress, amountETH) {
    const accounts = await this.web3.eth.getAccounts();
    const from = accounts[fromIndex];
    
    const amountWei = this.web3.utils.toWei(amountETH, 'ether');
    
    const tx = await this.web3.eth.sendTransaction({
      from: from,
      to: toAddress,
      value: amountWei,
      gas: 21000
    });
    
    return tx.transactionHash;
  }
}

module.exports = new GanacheService();