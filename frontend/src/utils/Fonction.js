// fonctions.js
import Web3 from 'web3';


const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
const CONTRACT_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "campaignId",
				"type": "uint256"
			}
		],
		"name": "CampaignCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "campaignId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "target",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			}
		],
		"name": "CampaignCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "campaignId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "CampaignEnded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "cancelCampaign",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "claimRefundAfterCancellation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "claimRefundIfGoalNotMet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_target",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_deadline",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_image",
				"type": "string"
			}
		],
		"name": "createCampaign",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "campaignId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newDeadline",
				"type": "uint256"
			}
		],
		"name": "DeadlineUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "donateToCampaign",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "campaignId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "donor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "DonationMade",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "campaignId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "FundsWithdrawn",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "campaignId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "donor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "RefundClaimed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "refundDonation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_newDeadline",
				"type": "uint256"
			}
		],
		"name": "updateDeadline",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "withdrawFunds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "campaigns",
		"outputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "target",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amountCollected",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "image",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "fundsWithdrawn",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "canWithdraw",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "donorContributions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "getAvailableFunds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "getCampaignDetails",
		"outputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "target",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amountCollected",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "image",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "fundsWithdrawn",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCampaigns",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "owner",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "title",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "target",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "deadline",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "amountCollected",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "image",
						"type": "string"
					},
					{
						"internalType": "address[]",
						"name": "donators",
						"type": "address[]"
					},
					{
						"internalType": "uint256[]",
						"name": "donations",
						"type": "uint256[]"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "fundsWithdrawn",
						"type": "uint256"
					}
				],
				"internalType": "struct CrowdFunding.Campaign[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "getDonators",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_campaignId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_donor",
				"type": "address"
			}
		],
		"name": "getDonorContribution",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_campaignId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_donor",
				"type": "address"
			}
		],
		"name": "isRefundClaimed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "numberOfCampaigns",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "refundClaimed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] ;



class ContractFunctions {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.account = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('🔄 Initialisation de Web3...');
            
            if (typeof window.ethereum !== 'undefined') {
                this.web3 = new Web3(window.ethereum);
                console.log('✅ Web3 initialisé');
                
                // Demander la connexion au compte
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                this.account = accounts[0];
                console.log('✅ Compte connecté:', this.getShortAddress(this.account));
                
                // Initialiser le contrat
                console.log('Contrat:',  CONTRACT_ABI.length);
                this.contract = new this.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
                this.isInitialized = true;
                console.log('✅ Contrat initialisé avec succès');
                
                return true;
            } else {
                throw new Error('MetaMask non détecté. Veuillez installer MetaMask.');
            }
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    async connectWallet() {
        try {
            if (!this.isInitialized) {
                await this.init();
            }
            return this.account;
        } catch (error) {
            console.error('❌ Erreur connexion portefeuille:', error);
            throw error;
        }
    }


    async getCampaigns() {
        
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            console.log('🔄 Récupération des campagnes...');
            
            // D'abord, obtenir le nombre de campagnes
            const numberOfCampaigns = await this.contract.methods.numberOfCampaigns().call();
        console.log('Nombre de campagnes:', numberOfCampaigns);

            // Ensuite, obtenir toutes les campagnes
            const campaigns = await this.contract.methods.getCampaigns().call();
            console.log('Campagnes brutes:', campaigns);
            
            const parsedCampaigns = campaigns.map((campaign, i) => {
                // Vérifier si la campagne existe (champs non vides)
                if (!campaign.owner || campaign.owner === '0x0000000000000000000000000000000000000000') {
                    return null;
                }

                return {
                    id: i,
                    owner: campaign.owner,
                    title: campaign.title || 'Untitled',
                    description: campaign.description || 'No description',
                    target: this.web3.utils.fromWei(campaign.target.toString(), 'ether'),
                    deadline: campaign.deadline,
                    amountCollected: this.web3.utils.fromWei(campaign.amountCollected.toString(), 'ether'),
                    image: campaign.image || 'https://via.placeholder.com/600x400?text=No+Image',
                    isActive: campaign.isActive,
                    fundsWithdrawn: this.web3.utils.fromWei(campaign.fundsWithdrawn.toString(), 'ether'),
                    pId: i
                };
            }).filter(campaign => campaign !== null); // Filtrer les campagnes null

            console.log('Campagnes parsées:', parsedCampaigns);
            return parsedCampaigns;
        } catch (error) {
            console.error('❌ Erreur dans getCampaigns:', error);
            throw error;
        }
    }

    async getUserCampaigns(ownerAddress = null) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            const allCampaigns = await this.getCampaigns();
            const accountToUse = ownerAddress || this.account;

            if (!accountToUse) {
                console.warn('getUserCampaigns: aucune adresse fournie ni compte connecté — retournement d\'un tableau vide');
                return [];
            }

            const filteredCampaigns = allCampaigns.filter((campaign) => {
                try {
                    return campaign.owner && campaign.owner.toLowerCase() === accountToUse.toLowerCase();
                } catch (err) {
                    return false;
                }
            });
            
            console.log('Campagnes utilisateur pour', accountToUse, ':', filteredCampaigns);
            return filteredCampaigns;
        } catch (error) {
            console.error('❌ Erreur getUserCampaigns:', error);
            throw error;
        }
    }

   async donate(pId, amount) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        // Vérifier qu'on a un compte connecté
        if (!this.account) {
            throw new Error('Veuillez vous connecter avec MetaMask pour effectuer un don');
        }

        // Convertir le montant en wei
        const amountWei = this.web3.utils.toWei(amount, 'ether');
        const amountInEther = parseFloat(amount);
        
        console.log(`🔄 Don de ${amount} ETH (${amountWei} wei) à la campagne ${pId}`);

        // Validation: vérifier que la campagne existe et est active
        const campaign = await this.getCampaignDetails(pId);
        if (!campaign) {
            throw new Error('Campagne non trouvée');
        }
        
        if (!campaign.isActive) {
            throw new Error('Impossible de faire un don à une campagne inactive');
        }

        // Validation: vérifier que la deadline n'est pas dépassée
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > Number(campaign.deadline)) {
            throw new Error('Impossible de faire un don à une campagne terminée');
        }

        // Validation: vérifier le solde de l'utilisateur
        const balance = await this.web3.eth.getBalance(this.account);
        const balanceInEth = this.web3.utils.fromWei(balance, 'ether');
        
        if (parseFloat(balanceInEth) < amountInEther ) {
            throw new Error(`Solde insuffisant. Vous avez ${balanceInEth} ETH, besoin de ${amountInEther} ETH + frais de transaction`);
        }

        // 1. Effectuer le don sur la blockchain
        const transaction = await this.contract.methods
            .donateToCampaign(pId)
            .send({
                from: this.account,
                value: amountWei,
                gas: 300000
            });

        console.log('✅ Don effectué sur la blockchain:', {
            transactionHash: transaction.transactionHash,
            blockNumber: transaction.blockNumber, // ← IMPORTANT
            amount: amount,
            campaignId: pId
        });

        // 2. Vérifier que blockNumber est disponible
        if (!transaction.blockNumber) {
            console.warn('⚠️ blockNumber non disponible, tentative de récupération...');
            // Attendre un peu et réessayer
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            try {
                const txReceipt = await this.web3.eth.getTransactionReceipt(transaction.transactionHash);
                if (txReceipt && txReceipt.blockNumber) {
                    transaction.blockNumber = txReceipt.blockNumber;
                    console.log('✅ blockNumber récupéré:', txReceipt.blockNumber);
                }
            } catch (error) {
                console.warn('⚠️ Impossible de récupérer blockNumber:', error);
            }
        }

        // 3. Récupérer les détails du don
        let donationDetails = {
            transaction_hash: transaction.transactionHash,
            donor_address: this.account,
            amount: amount,
            campaign_id: pId,
            block_number: transaction.blockNumber || 0, // ← AJOUTÉ, avec fallback
            timestamp: Math.floor(Date.now() / 1000)
        };

        // 4. Extraire des infos supplémentaires des événements si disponible
        if (transaction.events) {
            for (const [eventName, event] of Object.entries(transaction.events)) {
                if (event.returnValues) {
                    if (event.returnValues.donor) {
                        donationDetails.donor_address = event.returnValues.donor;
                    }
                    if (event.returnValues.amount) {
                        donationDetails.amount = this.web3.utils.fromWei(
                            event.returnValues.amount.toString(), 
                            'ether'
                        );
                    }
                    if (event.returnValues.campaignId) {
                        donationDetails.campaign_id = parseInt(event.returnValues.campaignId);
                    }
                }
            }
        }

        console.log('📋 Détails complets du don:', donationDetails);

        // 5. Synchroniser avec le backend
        const syncResult = await this.syncDonationToBackend(donationDetails);
        
        if (!syncResult.success) {
            console.warn('⚠️ Sync backend échoué, mais don blockchain effectué');
        }

        // 6. Mettre à jour le montant collecté de la campagne
        await this.syncCampaignAmountCollected(pId);

        return {
            blockchain: transaction,
            donation: donationDetails,
            backend: syncResult
        };
    } catch (error) {
        console.error('❌ Erreur donation:', error);
        
        if (error.message.includes('user rejected') || error.message.includes('denied transaction')) {
            throw new Error('Transaction annulée par l\'utilisateur');
        }
        
        if (error.message.includes('insufficient funds') || error.message.includes('balance')) {
            throw new Error('Solde insuffisant pour effectuer ce don');
        }
        
        if (error.message.includes('gas')) {
            throw new Error('Erreur de gas. Essayez d\'augmenter le gas limit ou le prix du gas.');
        }
        
        throw error;
    }
}
// Fonction pour synchroniser le don avec le backend

async syncDonationToBackend(donationData) {
    const API_URL = 'http://localhost:3001/api/donations';
    
    try {
        console.log('📤 Synchronisation du don avec le backend...', donationData);

        // Créer un message à signer pour l'authentification
        const timestamp = Date.now();
        const message = `Donation to campaign ${donationData.campaign_id} at ${timestamp}`;
        
        // Signer le message avec web3
        const signature = await this.web3.eth.personal.sign(
            message,
            this.account,
            ''
        );

        // Préparer les données pour l'API - CORRESPOND AU MODÈLE
        const donationForBackend = {
            transaction_hash: donationData.transaction_hash,
            donor_address: donationData.donor_address.toLowerCase(),
            amount: parseFloat(donationData.amount),
            campaign_id: parseInt(donationData.campaign_id), // ← IMPORTANT: doit être un number
            block_number: parseInt(donationData.block_number || 0) // ← OBLIGATOIRE, en number
        };

        console.log('📤 Données envoyées au backend:', donationForBackend);

        // Envoyer la requête au backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
                'message': message,
                'address': this.account.toLowerCase()
            },
            body: JSON.stringify(donationForBackend)
        });

        // Lire la réponse complète
        const responseText = await response.text();
        console.log('📩 Réponse backend (raw):', responseText.substring(0, 500));

        if (!response.ok) {
            console.error('❌ Erreur HTTP:', response.status, response.statusText);
            
            try {
                const errorData = JSON.parse(responseText);
                console.error('❌ Erreur backend:', errorData);
                throw new Error(errorData.error || `Échec de la synchronisation: ${response.status}`);
            } catch (parseError) {
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }
        }

        const result = JSON.parse(responseText);
        console.log('✅ Don synchronisé avec le backend:', result);
        return { success: true, ...result };
        
    } catch (error) {
        console.error('⚠️ Échec de la synchronisation du don avec le backend:', error);
        console.error('Stack:', error.stack);
        
        return { 
            success: false, 
            error: error.message,
            storedForRetry: true 
        };
    }
}

// Fonction pour mettre à jour le montant collecté de la campagne
async syncCampaignAmountCollected(campaignId) {
    try {
        console.log(`🔄 Mise à jour montant collecté campagne ${campaignId}...`);
        
        // Récupérer le montant depuis la blockchain
        const campaign = await this.getCampaignDetails(campaignId);
        if (!campaign) {
            console.warn(`Campagne ${campaignId} non trouvée`);
            return;
        }

        console.log(`Montant brut depuis getCampaignDetails pour ${campaignId}:`, campaign.amountCollected);

        // getCampaignDetails returns numeric ETH values for amountCollected when possible
        const rawAmount = campaign.amountCollected;
        console.log(`Montant brut depuis blockchain pour ${campaignId}:`, rawAmount);
        let amountInEth = 0;
        try {
            if (typeof rawAmount === 'number' && !Number.isNaN(rawAmount)) {
                amountInEth = rawAmount;
            } else if (typeof rawAmount === 'string') {
                const parsed = parseFloat(rawAmount);
                if (!Number.isNaN(parsed)) {
                    amountInEth = parsed;
                } else {
                    // Fallback: treat as wei string
                    amountInEth = parseFloat(this.web3.utils.fromWei(rawAmount.toString(), 'ether'));
                }
            } else if (rawAmount && rawAmount.toString) {
                amountInEth = parseFloat(this.web3.utils.fromWei(rawAmount.toString(), 'ether'));
            }

            amountInEth = parseFloat(Number(amountInEth).toFixed(8));
        } catch (convError) {
            console.warn(`Erreur conversion montant ${campaignId}:`, convError);
            amountInEth = 0;
        }

        console.log(`💰 Campagne ${campaignId}: ${amountInEth} ETH collectés`);

        // Synchroniser avec le backend
        const timestamp = Date.now();
        const message = `Sync amount ${campaignId} ${timestamp}`;
        
        const signature = await this.web3.eth.personal.sign(message, this.account, '');
        
        const response = await fetch('http://localhost:3001/api/campaigns/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
                'message': message,
                'address': this.account.toLowerCase()
            },
            body: JSON.stringify({
                blockchain_id: parseInt(campaignId),
                amount_collected: amountInEth, // Nombre, pas string
                // Champs minimaux requis pour l'upsert
                owner_address: campaign.owner || this.account,
                title: campaign.title || '',
                target_amount: parseFloat(campaign.target || 0),
                deadline: parseInt(campaign.deadline || 0)
            })
        });

        if (response.ok) {
            console.log(`✅ Montant synchronisé pour ${campaignId}`);
        } else {
            const error = await response.json();
            console.error(`❌ Erreur sync ${campaignId}:`, error);
        }
        
    } catch (error) {
        console.warn(`⚠️ Sync montant échoué ${campaignId}:`, error.message);
    }
}

    async getDonations(pId) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            console.log('🔄 Récupération des donateurs pour campagne:', pId);
            const donations = await this.contract.methods.getDonators(pId).call();
            console.log('Donateurs bruts:', donations);

            const numberOfDonations = donations[0].length;
            const parsedDonations = [];

            for (let i = 0; i < numberOfDonations; i++) {
                parsedDonations.push({
                    donator: donations[0][i],
                    donation: this.web3.utils.fromWei(donations[1][i].toString(), 'ether')
                });
            }

            console.log('Donateurs parsés:', parsedDonations);
            return parsedDonations;
        } catch (error) {
            console.error('❌ Erreur getDonations:', error);
            // Retourner un tableau vide en cas d'erreur
            return [];
        }
    }

    async getCampaignDetails(pId) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé');
        }

        console.log('🔄 Récupération détails campagne:', pId);
        const details = await this.contract.methods.getCampaignDetails(pId).call();

        // ✅ Maintenant 10 valeurs au lieu de 9
        const parsedDetails = {
            owner: details.owner,
            title: details.title || 'Untitled',
            description: details.description || 'No description',
            target: parseFloat(this.web3.utils.fromWei(details.target.toString(), 'ether')),
            deadline: details.deadline,
            amountCollected: parseFloat(this.web3.utils.fromWei(details.amountCollected.toString(), 'ether')),
            image: details.image || 'https://via.placeholder.com/600x400?text=No+Image',
            isActive: details.isActive,
            fundsWithdrawn: parseFloat(this.web3.utils.fromWei(details.fundsWithdrawn.toString(), 'ether')),
            isVerified: details.isVerified, // ✅ NOUVEAU CHAMP
            pId: parseInt(pId)
        };

        return parsedDetails;
    } catch (error) {
        console.error('❌ Erreur getCampaignDetails:', error);
        throw error;
    }
}

    async refundDonation(pId) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            console.log('🔄 Remboursement pour campagne:', pId);
            const result = await this.contract.methods
                .refundDonation(pId)
                .send({ from: this.account });
            
            console.log('✅ Remboursement effectué avec succès:', result);
            return result;
        } catch (error) {
            console.error('❌ Erreur refundDonation:', error);
            throw error;
        }
    }

    async claimRefundIfGoalNotMet(pId) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            console.log('🔄 Remboursement objectif non atteint pour campagne:', pId);
            const result = await this.contract.methods
                .claimRefundIfGoalNotMet(pId)
                .send({ from: this.account });
            
            console.log('✅ Remboursement effectué avec succès:', result);
            return result;
        } catch (error) {
            console.error('❌ Erreur claimRefundIfGoalNotMet:', error);
            throw error;
        }
    }

    async claimRefundAfterCancellation(pId) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        console.log('🔄 Récupération fonds après annulation pour campagne:', pId);
        
        // Vérifier que l'utilisateur a effectué un don
        const contribution = await this.getDonorContribution(pId, this.account);
        if (parseFloat(contribution) === 0) {
            throw new Error('Aucun don trouvé pour cette campagne');
        }

        // Vérifier que la campagne est annulée
        const campaign = await this.getCampaignDetails(pId);
        if (campaign.isActive) {
            throw new Error('La campagne doit être annulée pour récupérer les fonds');
        }

        const result = this.contract.methods.claimRefundAfterCancellation(pId).send({ from: this.account });
        
        
        console.log('✅ Fonds récupérés avec succès:', result);
        return result;
    } catch (error) {
        console.error('❌ Erreur claimRefundAfterCancellation:', error);
        throw error;
    }
}

    async createCampaign(form) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        const targetWei = this.web3.utils.toWei(form.target, 'ether');
        const deadlineTimestamp = Math.floor(new Date(form.deadline).getTime() / 1000);

        console.log('🔄 Création de la campagne...');

        // Appel au contrat blockchain
        const result = await this.contract.methods
            .createCampaign(
                this.account,
                form.title,
                form.description ,
                targetWei,
                deadlineTimestamp,
                form.image 
            )
            .send({ from: this.account });

        console.log('✅ Résultat de la transaction:', result);
        
        // DEBUG: Afficher tous les événements
        console.log('🔍 Événements disponibles:', Object.keys(result.events || {}));
        
        if (result.events) {
            for (const [eventName, eventData] of Object.entries(result.events)) {
                console.log(`📋 Événement "${eventName}":`, eventData);
                if (eventData.returnValues) {
                    console.log(`   Return values:`, eventData.returnValues);
                }
            }
        }

        // Essayer plusieurs noms d'événements possibles
        let event = null;
        let blockchainId = null;
        
        // Chercher l'événement avec différents noms possibles
        if (result.events) {
            event = result.events.CampaignCreated || 
                   result.events.campaignCreated ||
                   result.events.CampaignCreated ||
                   result.events['0'] || // Parfois indexé par 0
                   Object.values(result.events)[0]; // Premier événement
        }
        
        if (event && event.returnValues) {
            // Chercher l'ID dans différentes propriétés possibles
            blockchainId = event.returnValues.id || 
                          event.returnValues.campaignId ||
                          event.returnValues.campaignID ||
                          event.returnValues[0]; // Premier paramètre
        }
        
        if (!blockchainId) {
            console.warn('⚠️ Impossible de trouver l\'ID dans les événements, tentative alternative...');
            
            // Option 1: Essayer de parser les logs
            if (result.logs && result.logs.length > 0) {
                console.log('📋 Logs de transaction:', result.logs);
                // Votre logique pour parser les logs ici
            }
            
            // Option 2: Récupérer via une autre méthode
            // Si votre contrat a une fonction pour récupérer la dernière campagne créée
            // blockchainId = await this.contract.methods.getLastCampaignId().call();
            
            throw new Error('Impossible de récupérer l\'ID de la campagne');
        }
        
        blockchainId = parseInt(blockchainId);
        console.log('📋 ID de campagne récupéré:', blockchainId);

        // Synchroniser avec le backend
        await this.syncToBackend(
            {
                blockchainId: blockchainId,
                ownerAddress: this.account,
                deadline: deadlineTimestamp
            },
            form
        );

        return {
            ...result,
            campaignId: blockchainId
        };
    } catch (error) {
        console.error('❌ Erreur création campagne:', error);
        throw error;
    }
}

async syncToBackend(data, form) {
    const API_URL = 'http://localhost:3001/api/campaigns/sync';
    
    
    try {
        console.log("lien : ",form.link);
        // Transformer l'objet frontend vers le format backend
        const campaignData = {
            blockchain_id: data.blockchainId,
            owner_address: data.ownerAddress,
            title: form.title || 'Sans titre',
            description: form.description || '',
            target_amount: parseFloat(form.target) || 0, // Convertir en number
            deadline: data.deadline, // Déjà en timestamp Unix
            amount_collected: 0,
            image_url: form.image || '',
            is_active: true,
            is_verified: true,
            funds_withdrawn: 0,
            category_id: form.category,
            social_links: form.link 
        };

        console.log('📤 Données transformées pour le backend:', campaignData);

        // Créer un message à signer pour l'authentification
        const timestamp = Date.now();
        const message = `Authentication required at ${timestamp}`;
        
        // Signer le message avec web3
        const signature = await this.web3.eth.personal.sign(
            message,
            this.account,
            '' // mot de passe (peut être vide pour MetaMask)
        );

        // Envoyer la requête au backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
                'message': message,
                'address': this.account.toLowerCase() // Important : lowercase
            },
            body: JSON.stringify(campaignData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Échec de la synchronisation: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Synchronisation réussie:', result);
        return result;
    } catch (error) {
        console.error('⚠️ Échec de la synchronisation avec le backend:', error);
        // Continuer même si la synchronisation échoue
        // Vous pourriez implémenter une logique de retry ici
        return null;
    }
}


    // Version ultra-simplifiée sans besoin du nom de méthode
async sendTransactionUltraSimple(transaction, from, value = null) {
    try {
        const txOptions = { from };
        
        if (value) {
            txOptions.value = value;
        }
        
        // Utiliser une limite de gas fixe pour toutes les opérations
        // 300000 est généralement suffisant pour la plupart des opérations
        txOptions.gas = '300000';
        
        console.log('🔄 Envoi transaction ultra simple:', {
            from: this.getShortAddress(from),
            value: value ? `${this.web3.utils.fromWei(value, 'ether')} ETH` : '0 ETH',
            gas: txOptions.gas
        });
        
        return await transaction.send(txOptions);
        
    } catch (error) {
        console.error('❌ Erreur transaction ultra simple:', error);
        
        // Si erreur de gas, essayer avec une limite plus élevée
        if (error.message.includes('gas') || error.message.includes('out of gas')) {
            console.log('🔄 Tentative avec plus de gas (500000)...');
            try {
                const txOptionsRetry = { from };
                if (value) txOptionsRetry.value = value;
                txOptionsRetry.gas = '500000';
                
                return await transaction.send(txOptionsRetry);
            } catch (retryError) {
                console.error('❌ Erreur retry transaction:', retryError);
                throw retryError;
            }
        }
        
        throw error;
    }
}

   // Fonction.js - Méthode updateDeadline avec gestion RPC améliorée
async updateDeadline(pId, newDeadline) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        // Vérifier qu'on a un compte connecté (nécessaire pour les transactions)
        if (!this.account) {
            throw new Error('Veuillez vous connecter avec MetaMask pour effectuer cette action');
        }

        // Convertir la date en timestamp
        const newDeadlineTimestamp = Math.floor(new Date(newDeadline).getTime() / 1000);
        const deadlineString = newDeadlineTimestamp.toString();
        
        console.log('🔄 Mise à jour deadline campagne:', {
            pId: pId,
            newDeadline: newDeadline,
            timestamp: deadlineString,
            account: this.getShortAddress(this.account)
        });

        // Validations
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (newDeadlineTimestamp <= currentTimestamp) {
            throw new Error('La nouvelle date doit être dans le futur');
        }

        const campaign = await this.getCampaignDetails(pId);
        if (!campaign) {
            throw new Error('Campagne non trouvée');
        }
        
        if (campaign.owner.toLowerCase() !== this.account.toLowerCase()) {
            throw new Error('Seul le propriétaire peut modifier la date limite');
        }

        if (!campaign.isActive) {
            throw new Error('Impossible de modifier une campagne annulée');
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > Number(campaign.deadline)) {
            throw new Error('Impossible de modifier la date d\'une campagne déjà terminée');
        }

        // 1. Mise à jour sur la blockchain
        const transaction = await this.contract.methods.updateDeadline(pId, deadlineString).send({ from: this.account });
        
        console.log('✅ Deadline mise à jour sur la blockchain:', transaction);

        // 2. Synchroniser avec le backend
        await this.syncDeadlineToBackend(pId, newDeadlineTimestamp);

        // 3. Retourner les deux résultats
        return {
            blockchain: transaction,
            backend: { success: true, message: 'Deadline synchronisée avec le backend' }
        };
    } catch (error) {
        console.error('❌ Erreur updateDeadline:', error);
        
        // Suggestions basées sur le type d'erreur
        if (error.message.includes('RPC') || error.message.includes('endpoint')) {
            throw new Error('Problème de connexion réseau. Veuillez réessayer dans quelques minutes ou changer de réseau dans MetaMask.');
        }
        
        throw error;
    }
}

// Nouvelle fonction pour synchroniser la deadline avec le backend
async syncDeadlineToBackend(campaignId, deadlineTimestamp) {
    const API_URL = `http://localhost:3001/api/campaigns/${campaignId}/deadline`;
    
    try {
        console.log(`📤 Synchronisation deadline avec le backend pour la campagne ${campaignId}...`);

        // Créer un message à signer pour l'authentification
        const timestamp = Date.now();
        const message = `Update deadline for campaign ${campaignId} at ${timestamp}`;
        
        // Signer le message avec web3
        const signature = await this.web3.eth.personal.sign(
            message,
            this.account,
            '' // mot de passe (peut être vide pour MetaMask)
        );

        // Données à envoyer
        const updateData = {
            deadline: deadlineTimestamp
        };

        // Envoyer la requête au backend
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
                'message': message,
                'address': this.account.toLowerCase()
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erreur backend:', errorData);
            throw new Error(errorData.error || `Échec de la synchronisation: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Deadline synchronisée avec le backend:', result);
        return result;
    } catch (error) {
        console.error('⚠️ Échec de la synchronisation deadline avec le backend:', error);
        
        // Option 1: Retry plus tard
        // this.scheduleDeadlineRetry(campaignId, deadlineTimestamp, error);
        
        // Option 2: Retourner une erreur partielle
        throw new Error(`Mise à jour blockchain réussie, mais échec de la synchronisation avec le backend: ${error.message}`);
    }
}

    async getDonorContribution(campaignId, donorAddress) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            const contribution = await this.contract.methods
                .getDonorContribution(campaignId, donorAddress)
                .call();
            
            return this.web3.utils.fromWei(contribution.toString(), 'ether');
        } catch (error) {
            console.error('❌ Erreur getDonorContribution:', error);
            throw error;
        }
    }

    async isRefundClaimed(campaignId, donorAddress) {
        try {
            if (!this.isInitialized || !this.contract) {
                throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
            }

            const isClaimed = await this.contract.methods
                .isRefundClaimed(campaignId, donorAddress)
                .call();
            
            return isClaimed;
        } catch (error) {
            console.error('❌ Erreur isRefundClaimed:', error);
            return false;
        }
    }

    getShortAddress(address) {
        return address ? `${address.substring(0, 6)}...${address.substring(38)}` : '';
    }

    // Méthode pour vérifier l'état de la connexion
    getConnectionStatus() {
        return {
            isInitialized: this.isInitialized,
            account: this.account,
            web3: !!this.web3,
            contract: !!this.contract
        };
    }

    // Dans la classe ContractFunctions - Ajouter ces méthodes


async getWithdrawableCampaigns() {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        console.log('🔄 Récupération des campagnes éligibles au retrait...');
        
        const allCampaigns = await this.getCampaigns();
        const withdrawableCampaigns = [];
        
        for (const campaign of allCampaigns) {
            
            const canWithdraw = await this.isCampaignWithdrawable(campaign.id );
            if (canWithdraw.withdrawable) {
                withdrawableCampaigns.push(campaign);
            }
        }

        console.log(`📊 ${withdrawableCampaigns.length} campagne(s) éligible(s) au retrait`);
        return withdrawableCampaigns;
    } catch (error) {
        console.error('❌ Erreur getWithdrawableCampaigns:', error);
        throw error;
    }
}


// Fonction pour vérifier si une campagne est éligible au retrait - CORRIGÉE
async isCampaignWithdrawable(_id) {
    try {
        // Utiliser la fonction canWithdraw du smart contract
        const canWithdrawResult = await this.contract.methods.canWithdraw(_id).call();
        console.log(`🔍 Résultat canWithdraw pour campagne ${_id}:`, canWithdrawResult);
        const reason = canWithdrawResult[1];
        const canWithdrawBool = canWithdrawResult[0];
        
        if (!canWithdrawBool) {
            return {
                withdrawable: false,
                details: {
                    reason: reason,
                    canWithdraw: false
                }
            };
        }

        // Récupérer les détails pour plus d'informations
        const campaign = await this.getCampaignDetails(_id);
        if (!campaign) return { withdrawable: false, details: { error: 'Campagne non trouvée' } };
        
        const isOwner = campaign.owner.toLowerCase() === this.account.toLowerCase();
        const isEnded = Math.floor(Date.now() / 1000) > Number(campaign.deadline);
        // `campaign.amountCollected` and `campaign.target` are already converted to ETH strings
        const amountCollected = parseFloat(campaign.amountCollected);
        const targetAmount = parseFloat(campaign.target);
        const goalReached = amountCollected >= targetAmount;
        
        const fundsWithdrawn = parseFloat(campaign.fundsWithdrawn || 0);
        const hasAvailableFunds = amountCollected > fundsWithdrawn;
        const isActive = campaign.isActive !== false;
        
        const availableAmount = await this.contract.methods.getAvailableFunds(_id).call();
        const availableAmountEth = parseFloat(this.web3.utils.fromWei(availableAmount, 'ether'));
        
        return {
            withdrawable: canWithdrawBool && isOwner,
            details: {
                isOwner,
                isEnded,
                goalReached,
                hasAvailableFunds,
                isActive,
                amountCollected,
                targetAmount,
                fundsWithdrawn,
                availableFunds: availableAmountEth,
                reason: reason
            }
        };
    } catch (error) {
        console.error('❌ Erreur vérification éligibilité retrait:', error);
        return { withdrawable: false, error: error.message };
    }
}

// Fonction pour effectuer un retrait - CORRIGÉE
async withdrawFunds(_id) {  // Changé de withdrawFunds(pId, amount) à withdrawFunds(_id)
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        if (!this.account) {
            throw new Error('Veuillez vous connecter avec MetaMask');
        }
        
        console.log(`🔄 Retrait des fonds de la campagne ${_id}`);

        // Utiliser la fonction canWithdraw du smart contract pour vérifier
        const canWithdrawResult = await this.contract.methods.canWithdraw(_id).call();
        if (!canWithdrawResult[0]) {  // canWithdraw retourne un tuple (bool, string)
            throw new Error(canWithdrawResult[1] || 'Non éligible au retrait');
        }

        // Récupérer le montant disponible
        const availableAmount = await this.contract.methods.getAvailableFunds(_id).call();
        const availableAmountEth = parseFloat(this.web3.utils.fromWei(availableAmount, 'ether'));
        
        if (availableAmountEth <= 0) {
            throw new Error('Aucun fonds disponible pour le retrait');
        }

        console.log(`💰 Montant disponible: ${availableAmountEth} ETH`);

        // Appeler la fonction withdrawFunds du smart contract (sans paramètre de montant)
        const transaction = await this.contract.methods
            .withdrawFunds(_id)  // Changé de withdrawFromCampaign à withdrawFunds
            .send({
                from: this.account,
                gas: 300000
            });

        console.log('✅ Retrait effectué sur la blockchain:', {
            transactionHash: transaction.transactionHash,
            blockNumber: transaction.blockNumber,
            campaignId: _id
        });

        // Récupérer les détails du retrait depuis l'événement
        let withdrawalDetails = {
            transaction_hash: transaction.transactionHash,
            recipient_address: this.account,
            amount: availableAmountEth,
            campaign_id: parseInt(_id),
            block_number: transaction.blockNumber || 0
        };

        // Extraire des infos des événements
        if (transaction.events && transaction.events.FundsWithdrawn) {
            const event = transaction.events.FundsWithdrawn;
            if (event.returnValues) {
                withdrawalDetails = {
                    ...withdrawalDetails,
                    recipient_address: event.returnValues.owner,
                    amount: parseFloat(this.web3.utils.fromWei(event.returnValues.amount, 'ether')),
                    campaign_id: parseInt(event.returnValues.campaignId)
                };
            }
        }

        console.log('📋 Détails du retrait:', withdrawalDetails);

        // Synchroniser avec le backend
        const syncResult = await this.syncWithdrawalToBackend(withdrawalDetails);
        
        if (!syncResult.success) {
            console.warn('⚠️ Sync backend échoué, mais retrait blockchain effectué');
        }

        // Mettre à jour les fonds retirés de la campagne
        await this.syncCampaignFundsWithdrawn(_id);

        return {
            blockchain: transaction,
            withdrawal: withdrawalDetails,
            backend: syncResult
        };
    } catch (error) {
        console.error('❌ Erreur retrait:', error);
        
        if (error.message.includes('user rejected') || error.message.includes('denied transaction')) {
            throw new Error('Transaction annulée par l\'utilisateur');
        }
        
        if (error.message.includes('insufficient funds')) {
            throw new Error('Fonds insuffisants pour effectuer cette transaction');
        }
        
        if (error.message.includes('gas')) {
            throw new Error('Erreur de gas. Essayez d\'augmenter le gas limit ou le prix du gas.');
        }
        
        throw error;
    }
}



async getWithdrawalStats() {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        const userCampaigns = await this.getUserCampaigns();
        
        let totalAvailable = 0;
        let totalWithdrawn = 0;
        let withdrawableCampaigns = 0;

        for (const campaign of userCampaigns) {
            try {
                const campaignId = campaign.id ;
                const canWithdrawResult = await this.contract.methods.canWithdraw(campaignId).call();
                
                if (canWithdrawResult[0]) {
                    const availableAmount = await this.contract.methods.getAvailableFunds(campaignId).call();
                    const availableAmountEth = parseFloat(this.web3.utils.fromWei(availableAmount, 'ether'));
                    
                    totalAvailable += availableAmountEth;
                    totalWithdrawn += parseFloat(campaign.fundsWithdrawn );
                    withdrawableCampaigns++;
                } else {
                    totalWithdrawn += parseFloat(campaign.fundsWithdrawn );
                }
            } catch (error) {
                console.warn(`⚠️ Erreur lors de l'analyse de la campagne ${campaign.id}:`, error.message);
            }
        }

        return {
            totalAvailable: totalAvailable.toFixed(4),
            totalWithdrawn: totalWithdrawn.toFixed(4),
            withdrawableCampaigns,
            totalCampaigns: userCampaigns.length
        };
    } catch (error) {
        console.error('❌ Erreur getWithdrawalStats:', error);
        throw error;
    }
}

// Fonction helper pour obtenir les campagnes de l'utilisateur
async getUserCampaigns() {
    try {
        const allCampaigns = await this.getCampaigns();
        return allCampaigns.filter(campaign => 
            campaign.owner.toLowerCase() === this.account.toLowerCase()
        );
    } catch (error) {
        console.error('❌ Erreur getUserCampaigns:', error);
        throw error;
    }
}



// Fonction pour synchroniser le retrait avec le backend
async syncWithdrawalToBackend(withdrawalData) {
    const API_URL = 'http://localhost:3001/api/withdrawals';
    
    try {
        console.log('📤 Synchronisation du retrait avec le backend...', withdrawalData);

        // Créer un message à signer pour l'authentification
        const timestamp = Date.now();
        const message = `Withdrawal from campaign ${withdrawalData.campaign_id} at ${timestamp}`;
        
        // Signer le message avec web3
        const signature = await this.web3.eth.personal.sign(
            message,
            this.account,
            ''
        );

        // Préparer les données pour l'API - CORRESPOND AU MODÈLE
        const withdrawalForBackend = {
            transaction_hash: withdrawalData.transaction_hash,
            recipient_address: withdrawalData.recipient_address.toLowerCase(),
            amount: parseFloat(withdrawalData.amount),
            campaign_id: parseInt(withdrawalData.campaign_id),
            block_number: parseInt(withdrawalData.block_number || 0)
        };

        console.log('📤 Données envoyées au backend:', withdrawalForBackend);

        // Envoyer la requête au backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
                'message': message,
                'address': this.account.toLowerCase()
            },
            body: JSON.stringify(withdrawalForBackend)
        });

        // Lire la réponse complète
        const responseText = await response.text();
        console.log('📩 Réponse backend (raw):', responseText.substring(0, 500));

        if (!response.ok) {
            console.error('❌ Erreur HTTP:', response.status, response.statusText);
            
            try {
                const errorData = JSON.parse(responseText);
                console.error('❌ Erreur backend:', errorData);
                throw new Error(errorData.error || `Échec de la synchronisation: ${response.status}`);
            } catch (parseError) {
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }
        }

        const result = JSON.parse(responseText);
        console.log('✅ Retrait synchronisé avec le backend:', result);
        return { success: true, ...result };
        
    } catch (error) {
        console.error('⚠️ Échec de la synchronisation du retrait avec le backend:', error);
        console.error('Stack:', error.stack);
        
        return { 
            success: false, 
            error: error.message,
            storedForRetry: true 
        };
    }
}

// Fonction pour mettre à jour les fonds retirés d'une campagne
async syncCampaignFundsWithdrawn(campaignId) {
    try {
        console.log(`🔄 Mise à jour funds_withdrawn pour la campagne ${campaignId}...`);
        
        // Récupérer la campagne depuis la blockchain
        const campaign = await this.getCampaignDetails(campaignId);
        if (!campaign) return;
        
        // Récupérer les fonds retirés (peut être dans fundsWithdrawn ou funds_withdrawn)
        let fundsWithdrawn = campaign.fundsWithdrawn || campaign.funds_withdrawn || 0;
        
        // Convertir en ETH si nécessaire
        let fundsWithdrawnEth;
        if (typeof fundsWithdrawn === 'string') {
            if (fundsWithdrawn.includes('.')) {
                fundsWithdrawnEth = parseFloat(fundsWithdrawn);
            } else {
                fundsWithdrawnEth = parseFloat(this.web3.utils.fromWei(fundsWithdrawn, 'ether'));
            }
        } else {
            fundsWithdrawnEth = parseFloat(this.web3.utils.fromWei(fundsWithdrawn.toString(), 'ether'));
        }
        
        console.log(`💰 Fonds retirés: ${fundsWithdrawnEth} ETH pour campagne ${campaignId}`);

        // Créer un message à signer
        const timestamp = Date.now();
        const message = `Update funds withdrawn for campaign ${campaignId} at ${timestamp}`;
        
        let signature;
        try {
            signature = await this.web3.eth.personal.sign(message, this.account, '');
        } catch (signError) {
            console.warn(`⚠️ Impossible de signer pour ${campaignId}:`, signError);
            return;
        }

        // Utiliser la route de sync pour mettre à jour
        const updateData = {
            blockchain_id: parseInt(campaignId),
            funds_withdrawn: fundsWithdrawnEth,
            // Inclure les champs obligatoires
            owner_address: campaign.owner || this.account,
            title: campaign.title || 'Campaign',
            // `campaign.target` and `campaign.amountCollected` are already ETH strings
            target_amount: parseFloat(campaign.target || 0),
            deadline: parseInt(campaign.deadline),
            amount_collected: parseFloat(campaign.amountCollected || 0)
        };

        const response = await fetch('http://localhost:3001/api/campaigns/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
                'message': message,
                'address': this.account.toLowerCase()
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            console.log(`✅ Funds_withdrawn mis à jour pour la campagne ${campaignId}`);
        } else {
            const errorText = await response.text();
            console.error(`❌ Erreur mise à jour funds_withdrawn:`, errorText);
        }
        
    } catch (error) {
        console.warn(`⚠️ Échec de la mise à jour funds_withdrawn pour ${campaignId}:`, error.message);
    }
}





// Fonction pour récupérer l'historique des retraits d'une campagne
async getCampaignWithdrawals(pId) {
    try {
        const API_URL = `http://localhost:3001/api/withdrawals/campaign/${pId}`;
        
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data.withdrawals || [];
        
    } catch (error) {
        console.warn(`⚠️ Impossible de récupérer les retraits de la campagne ${pId}:`, error.message);
        return [];
    }
}





// Méthode utilitaire pour les messages d'erreur
    getWithdrawalErrorMessage(isOwner, isEnded, goalReached, hasAvailableFunds, isActive) {
    if (!isOwner) return "Vous n'êtes pas le propriétaire de cette campagne";
    if (!isActive) return "La campagne n'est plus active";
    if (!isEnded) return "La campagne n'est pas encore terminée";
    if (!goalReached) return "L'objectif de la campagne n'a pas été atteint";
    if (!hasAvailableFunds) return "Aucun fonds disponible pour le retrait";
    return "Retrait non autorisé";
    }





    async sendTransactionWithFallback(transaction, from) {
    try {
        // Estimation du gas
        const gasEstimate = await transaction.estimateGas({ from });

        const gasEstimateNumber = Number(gasEstimate);
        // Envoi avec buffer de sécurité
        return await transaction.send({ 
            from, 
            gas: Math.floor(gasEstimate * 1.2) // 20% de buffer
        });
    } catch (error) {
        console.error('❌ Erreur transaction:', error);
        throw error;
    }
}

// Méthode unique pour retirer les fonds
// async withdrawFunds(pId) {
//     try {
//         if (!this.isInitialized || !this.contract) {
//             throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
//         }

//         console.log('🔄 Retrait des fonds pour campagne:', pId);
        
//         // Vérifier l'éligibilité avant de procéder
//         const eligibility = await this.checkWithdrawalEligibility(pId);
//         if (!eligibility.eligible) {
//             throw new Error(eligibility.message);
//         }

//         const result = this.contract.methods.withdrawFunds(pId).send({ from: this.account });
        
        
//         console.log('✅ Fonds retirés avec succès:', result);
//         return result;
//     } catch (error) {
//         console.error('❌ Erreur withdrawFunds:', error);
//         throw error;
//     }
// }


toBigInt(value) {
        if (typeof value === 'bigint') return value;
        if (typeof value === 'number') return BigInt(Math.floor(value));
        if (typeof value === 'string') {
            // Supprimer les décimales pour les nombres à virgule
            if (value.includes('.')) {
                value = value.split('.')[0];
            }
            return BigInt(value);
        }
        return BigInt(value.toString());
    }

    // Méthode utilitaire pour comparer des BigInt
    compareBigInt(a, b) {
        const bigA = this.toBigInt(a);
        const bigB = this.toBigInt(b);
        if (bigA > bigB) return 1;
        if (bigA < bigB) return -1;
        return 0;
    }

    // Méthode utilitaire pour convertir en nombre sécurisé
    toSafeNumber(value) {
        try {
            if (typeof value === 'bigint') {
                return Number(value.toString());
            }
            if (typeof value === 'string') {
                return parseInt(value, 10);
            }
            return Number(value);
        } catch (error) {
            console.warn('⚠️ Erreur conversion nombre:', error);
            return 0;
        }
    }

// Méthode unique pour annuler une campagne (version corrigée)
async cancelCampaign(pId) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        if (!this.account) {
            throw new Error('Veuillez vous connecter avec MetaMask');
        }

        console.log(`🔄 Tentative d'annulation de la campagne ${pId}`);

        // 1. Vérifier les conditions sur la blockchain
        const campaign = await this.getCampaignDetails(pId);
        if (!campaign) {
            throw new Error('Campagne non trouvée sur la blockchain');
        }

        // Vérifier que l'utilisateur est le propriétaire
        if (campaign.owner.toLowerCase() !== this.account.toLowerCase()) {
            throw new Error('Seul le propriétaire peut annuler cette campagne');
        }

        // Vérifier que la campagne est active
        if (!campaign.isActive) {
            throw new Error('Cette campagne est déjà inactive');
        }

        // 2. Annuler sur la blockchain
        const transaction = await this.contract.methods
            .cancelCampaign(pId)
            .send({ 
                from: this.account,
                gas: 200000 // Limite de gas appropriée
            });

        console.log('✅ Campagne annulée sur la blockchain:', {
            transactionHash: transaction.transactionHash,
            blockNumber: transaction.blockNumber,
            campaignId: pId
        });

        // 3. Synchroniser avec le backend
        const syncResult = await this.syncCampaignCancellation(pId, transaction);

        return {
            blockchain: transaction,
            backend: syncResult,
            message: 'Campagne annulée avec succès'
        };
    } catch (error) {
        console.error('❌ Erreur lors de l\'annulation de la campagne:', error);
        
        // Suggestions basées sur le type d'erreur
        if (error.message.includes('user rejected') || error.message.includes('denied transaction')) {
            throw new Error('Transaction annulée par l\'utilisateur');
        }
        
        if (error.message.includes('not owner') || error.message.includes('only owner')) {
            throw new Error('Seul le propriétaire peut annuler cette campagne');
        }
        
        if (error.message.includes('already inactive') || error.message.includes('not active')) {
            throw new Error('Cette campagne est déjà inactive');
        }
        
        if (error.message.includes('goal reached') || error.message.includes('target met')) {
            throw new Error('Impossible d\'annuler une campagne dont l\'objectif est atteint');
        }
        
        if (error.message.includes('deadline passed')) {
            throw new Error('Impossible d\'annuler une campagne terminée');
        }
        
        if (error.message.includes('funds withdrawn')) {
            throw new Error('Impossible d\'annuler une campagne avec des retraits effectués');
        }
        
        throw error;
    }
}

async syncCampaignCancellation(campaignId, transaction = null) {
    const API_URL = `http://localhost:3001/api/campaigns/${campaignId}/cancel`;
    
    try {
        console.log(`📤 Synchronisation de l'annulation pour la campagne ${campaignId}...`);

        // Créer un message à signer
        const timestamp = Date.now();
        const message = `Cancel campaign ${campaignId} at ${timestamp}`;
        
        // Signer le message
        const signature = await this.web3.eth.personal.sign(
            message,
            this.account,
            ''
        );

        // Préparer les données optionnelles - CONVERTIR LES BigInt EN NOMBRES
        const requestData = {};
        if (transaction) {
            // Convertir BigInt en Number ou String
            requestData.transaction_hash = transaction.transactionHash;
            
            // Si blockNumber est un BigInt, le convertir
            if (transaction.blockNumber !== undefined && transaction.blockNumber !== null) {
                if (typeof transaction.blockNumber === 'bigint') {
                    requestData.block_number = Number(transaction.blockNumber);
                } else if (typeof transaction.blockNumber === 'object' && transaction.blockNumber.toString) {
                    requestData.block_number = parseInt(transaction.blockNumber.toString());
                } else {
                    requestData.block_number = parseInt(transaction.blockNumber);
                }
            }
        }

        console.log('📤 Données à envoyer:', requestData);

        // Envoyer la requête au backend
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
                'message': message,
                'address': this.account.toLowerCase()
            },
            body: Object.keys(requestData).length > 0 ? JSON.stringify(requestData) : undefined
        });

        // Lire la réponse
        const responseText = await response.text();
        console.log('📩 Réponse backend (raw):', responseText.substring(0, 500));
        
        if (!response.ok) {
            console.error('❌ Erreur HTTP:', response.status, response.statusText);
            
            try {
                const errorData = JSON.parse(responseText);
                console.error('❌ Erreur backend:', errorData);
                
                // Si l'erreur est due à des conditions non remplies, ne pas retenter
                if (errorData.error?.includes('déjà inactive') || 
                    errorData.error?.includes('Objectif atteint') ||
                    errorData.error?.includes('Deadline dépassée') ||
                    errorData.error?.includes('Retraits effectués')) {
                    throw new Error(errorData.error);
                }
                
                throw new Error(errorData.error || `Échec de la synchronisation: ${response.status}`);
            } catch (parseError) {
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }
        }

        const result = JSON.parse(responseText);
        console.log('✅ Annulation synchronisée avec le backend:', result);
        return { success: true, ...result };
        
    } catch (error) {
        console.error('⚠️ Échec de la synchronisation de l\'annulation:', error);
        
        // Si l'erreur est une erreur de condition, la propager
        if (error.message.includes('déjà inactive') || 
            error.message.includes('Objectif atteint') ||
            error.message.includes('Deadline dépassée') ||
            error.message.includes('Retraits effectués')) {
            throw error;
        }
        
        // Pour les autres erreurs, stocker pour retry
        
        
        return { 
            success: false, 
            error: error.message,
            storedForRetry: true 
        };
    }
}


// Version simplifiée (sans retry automatique)
async cancelCampaignSimple(pId) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        console.log(`🔄 Annulation de la campagne ${pId}`);

        // Annuler sur la blockchain
        const transaction = await this.contract.methods
            .cancelCampaign(pId)
            .send({ from: this.account });

        console.log('✅ Annulation blockchain réussie');

        // Synchroniser avec le backend en arrière-plan
        this.syncCancellationToBackend(pId, transaction)
            .catch(error => {
                console.warn('⚠️ Sync backend échoué:', error.message);
            });

        return transaction;
    } catch (error) {
        console.error('❌ Erreur annulation:', error);
        throw error;
    }
}

async syncCancellationToBackend(campaignId, transaction) {
    const API_URL = `http://localhost:3001/api/campaigns/${campaignId}/cancel`;
    
    try {
        const timestamp = Date.now();
        const message = `Cancel campaign ${timestamp}`;
        const signature = await this.web3.eth.personal.sign(message, this.account, '');
        
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
                'message': message,
                'address': this.account.toLowerCase()
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.warn(`⚠️ Sync annulation échoué pour ${campaignId}:`, error.message);
        return { success: false, error: error.message };
    }
}

// Fonction pour vérifier si une campagne peut être annulée
async canCancelCampaign(pId) {
    try {
        const campaign = await this.getCampaignDetails(pId);
        if (!campaign) return { canCancel: false, error: 'Campagne non trouvée' };
        
        const isOwner = campaign.owner.toLowerCase() === this.account.toLowerCase();
        const isActive = campaign.isActive;
        
        return {
            canCancel: isOwner && isActive,
            details: {
                isOwner,
                isActive,
                owner: campaign.owner,
                account: this.account
            },
            message: isOwner && isActive 
                ? 'Vous pouvez annuler cette campagne' 
                : !isOwner 
                    ? 'Seul le propriétaire peut annuler' 
                    : 'La campagne est déjà inactive'
        };
    } catch (error) {
        console.error('❌ Erreur vérification annulation:', error);
        return { canCancel: false, error: error.message };
    }
}


// Appeler cette fonction au chargement de l'application
// processPendingCancellations();

// Méthode unique pour récupérer les fonds après annulation


// Amélioration de la vérification d'éligibilité
async checkWithdrawalEligibility(pId) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        if (!this.account) {
            throw new Error('Aucun compte connecté');
        }

        // CONVERTIR L'ID EN NOMBRE
        const campaignId = Number(pId);
        if (isNaN(campaignId)) {
            throw new Error('ID de campagne invalide');
        }

        console.log(`🔍 Vérification éligibilité retrait pour campagne ID: ${campaignId}`);

        // 1. VÉRIFIER LA FONCTION CANWITHDRAW DU CONTRAT
        let canWithdrawResult;
        try {
            canWithdrawResult = await this.contract.methods.canWithdraw(campaignId).call();
            console.log('📋 Résultat canWithdraw:', canWithdrawResult);
        } catch (error) {
            console.error('❌ Erreur appel canWithdraw:', error);
            throw new Error('Impossible de vérifier l\'éligibilité avec le contrat');
        }

        // EXTRAIRE LES VALEURS (format: {0: bool, 1: string})
        const canWithdrawBool = canWithdrawResult[0];
        const contractReason = canWithdrawResult[1] || "Raison non spécifiée";

        // 2. RÉCUPÉRER LES DÉTAILS DE LA CAMPAGNE
        const campaign = await this.getCampaignDetails(campaignId);
        if (!campaign) {
            throw new Error('Campagne non trouvée');
        }

        console.log('📊 Détails campagne:', campaign);

        // 3. VÉRIFIER LES CONDITIONS
        const currentTime = Math.floor(Date.now() / 1000);
        const deadline = Number(campaign.deadline);
        
        const isOwner = campaign.owner.toLowerCase() === this.account.toLowerCase();
        const isEnded = currentTime > deadline;
        // `campaign.amountCollected` and `campaign.target` are already ETH strings (converted in getCampaignDetails)
        const amountCollected = parseFloat(campaign.amountCollected);
        const targetAmount = parseFloat(campaign.target);
        const goalReached = amountCollected >= targetAmount;
        
        // Récupérer les fonds déjà retirés (si le champ existe)
        let fundsWithdrawn = 0;
        if (campaign.fundsWithdrawn !== undefined) {
            // Already in ETH string
            fundsWithdrawn = parseFloat(campaign.fundsWithdrawn || 0);
        }
        
        const hasAvailableFunds = amountCollected > fundsWithdrawn;
        const isActive = campaign.isActive !== false; // Par défaut true si undefined

        // 4. CALCULER LE MONTANT DISPONIBLE
        let availableAmountEth = amountCollected - fundsWithdrawn;
        
        // Si disponible, utiliser la fonction getAvailableFunds du contrat
        try {
            const availableAmount = await this.contract.methods.getAvailableFunds(campaignId).call();
            availableAmountEth = parseFloat(this.web3.utils.fromWei(availableAmount, 'ether'));
            console.log('💰 Fonds disponibles (contrat):', availableAmountEth, 'ETH');
        } catch (error) {
            console.warn('⚠️ Utilisation du calcul manuel pour les fonds disponibles');
        }

        // 5. DÉTERMINER L'ÉLIGIBILITÉ
        // Le contrat a le dernier mot via canWithdrawBool
        const eligible = canWithdrawBool && isOwner;
        
        console.log('🎯 Conditions de vérification:', {
            contractCanWithdraw: canWithdrawBool,
            isOwner,
            isEnded,
            goalReached,
            hasAvailableFunds,
            isActive,
            amountCollected: `${amountCollected} ETH`,
            targetAmount: `${targetAmount} ETH`,
            fundsWithdrawn: `${fundsWithdrawn} ETH`,
            availableAmount: `${availableAmountEth} ETH`,
            contractReason
        });

        // 6. GÉNÉRER LE MESSAGE
        let message;
        if (eligible) {
            message = `✅ Vous pouvez retirer ${availableAmountEth.toFixed(6)} ETH`;
        } else {
            if (!canWithdrawBool) {
                message = `❌ ${contractReason}`;
            } else if (!isOwner) {
                message = '❌ Vous n\'êtes pas le propriétaire de cette campagne';
            } else if (!isEnded) {
                const timeLeft = deadline - currentTime;
                const daysLeft = Math.ceil(timeLeft / (60 * 60 * 24));
                message = `⏳ La campagne n'est pas encore terminée. Fin dans ${daysLeft} jour(s)`;
            } else if (!goalReached) {
                const missingAmount = targetAmount - amountCollected;
                message = `🎯 Objectif non atteint. Il manque ${missingAmount.toFixed(4)} ETH`;
            } else if (!hasAvailableFunds) {
                message = '💰 Tous les fonds ont déjà été retirés';
            } else if (!isActive) {
                message = '🚫 La campagne n\'est plus active';
            } else {
                message = '❌ Non éligible au retrait';
            }
        }

        return {
            eligible,
            isOwner,
            isEnded,
            goalReached,
            hasAvailableFunds,
            isActive,
            contractCanWithdraw: canWithdrawBool,
            contractReason,
            amountCollected: amountCollected.toFixed(6),
            targetAmount: targetAmount.toFixed(6),
            fundsWithdrawn: fundsWithdrawn.toFixed(6),
            availableAmount: availableAmountEth.toFixed(6),
            deadline: new Date(deadline * 1000).toLocaleString(),
            timeLeft: isEnded ? 'Terminée' : `${Math.ceil((deadline - currentTime) / (60 * 60 * 24))} jour(s)`,
            message
        };
    } catch (error) {
        console.error('❌ Erreur checkWithdrawalEligibility:', error);
        return {
            eligible: false,
            error: error.message,
            message: `❌ Erreur: ${error.message}`
        };
    }
}

// Fonction d'aide pour les messages d'erreur (conservée pour compatibilité)
getWithdrawalErrorMessage(isOwner, isEnded, goalReached, hasAvailableFunds, isActive) {
    if (!isOwner) return '❌ Vous n\'êtes pas le propriétaire de cette campagne';
    if (!isEnded) return '⏳ La campagne n\'est pas encore terminée';
    if (!goalReached) return '🎯 L\'objectif de la campagne n\'a pas été atteint';
    if (!hasAvailableFunds) return '💰 Tous les fonds ont déjà été retirés';
    if (!isActive) return '🚫 La campagne n\'est plus active';
    return '❌ Non éligible au retrait';
}

// Méthode pour récupérer tous les dons d'un utilisateur
    async getUserDonations() {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }

        console.log('🔄 Récupération des dons de l\'utilisateur...');
        
        // Récupérer toutes les campagnes
        const allCampaigns = await this.getCampaigns();
        const userDonations = [];

        // Parcourir toutes les campagnes pour trouver les dons de l'utilisateur
        for (let i = 0; i < allCampaigns.length; i++) {
            try {
                // Récupérer la contribution de l'utilisateur pour cette campagne
                const contribution = await this.contract.methods
                    .getDonorContribution(i, this.account)
                    .call();
                
                const contributionAmount = this.web3.utils.fromWei(contribution.toString(), 'ether');
                
                // Si l'utilisateur a fait un don à cette campagne
                if (parseFloat(contributionAmount) > 0) {
                    const campaign = allCampaigns[i];
                    const isRefundClaimed = await this.contract.methods
                        .isRefundClaimed(i, this.account)
                        .call();
                    
                    // Déterminer le statut du don
                    let status = 'active';
                    let statusMessage = 'Don actif';
                    
                    if (isRefundClaimed) {
                        status = 'refunded';
                        statusMessage = 'Remboursé';
                    } else if (!campaign.isActive) {
                        status = 'cancelled';
                        statusMessage = 'Campagne annulée';
                    } else if (new Date() > new Date(Number(campaign.deadline) * 1000)) {
                        if (parseFloat(campaign.amountCollected) < parseFloat(campaign.target)) {
                            status = 'failed';
                            statusMessage = 'Objectif non atteint - Remboursable';
                        } else {
                            status = 'success';
                            statusMessage = 'Objectif atteint';
                        }
                    }

                    userDonations.push({
                        campaignId: i,
                        campaignTitle: campaign.title,
                        campaignDescription: campaign.description,
                        campaignImage: campaign.image,
                        campaignOwner: campaign.owner,
                        amountDonated: contributionAmount,
                        campaignTarget: campaign.target,
                        campaignAmountCollected: campaign.amountCollected,
                        // Ajouter le montant déjà retiré par le propriétaire (utile pour la logique de remboursement)
                        campaignFundsWithdrawn: campaign.fundsWithdrawn,
                        campaignDeadline: campaign.deadline,
                        campaignIsActive: campaign.isActive,
                        isRefundClaimed: isRefundClaimed,
                        status: status,
                        statusMessage: statusMessage,
                        canRefund: this.canUserRefund(campaign, isRefundClaimed, contributionAmount),
                        donationDate: this.estimateDonationDate(campaign.deadline) // Estimation
                    });
                }
            } catch (error) {
                console.warn(`Erreur récupération don campagne ${i}:`, error);
                // Continuer avec la campagne suivante
            }
        }

        // Trier par montant décroissant
        userDonations.sort((a, b) => parseFloat(b.amountDonated) - parseFloat(a.amountDonated));

        console.log('Dons utilisateur récupérés:', userDonations);
        return userDonations;
    } catch (error) {
        console.error('❌ Erreur getUserDonations:', error);
        throw error;
    }
    }

    // Méthode pour récupérer les statistiques des dons de l'utilisateur
    async getUserDonationStats() {
    try {
        const userDonations = await this.getUserDonations();
        
        const totalDonated = userDonations.reduce((sum, donation) => 
            sum + parseFloat(donation.amountDonated), 0
        );
        
        const activeDonations = userDonations.filter(d => 
            d.status === 'active' || d.status === 'success'
        ).length;
        
        const refundedDonations = userDonations.filter(d => 
            d.status === 'refunded'
        ).length;
        
        const campaignsSupported = new Set(userDonations.map(d => d.campaignId)).size;

        return {
            totalDonated: totalDonated.toFixed(4),
            totalDonations: userDonations.length,
            activeDonations,
            refundedDonations,
            campaignsSupported,
            averageDonation: userDonations.length > 0 ? (totalDonated / userDonations.length).toFixed(4) : '0'
        };
    } catch (error) {
        console.error('❌ Erreur getUserDonationStats:', error);
        throw error;
    }
    }

// Méthode utilitaire pour déterminer si un utilisateur peut demander un remboursement
    canUserRefund(campaign, isRefundClaimed, contributionAmount) {
    if (isRefundClaimed || parseFloat(contributionAmount) === 0) {
        return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const campaignEnded = currentTime > Number(campaign.deadline);
    const goalNotReached = parseFloat(campaign.amountCollected) < parseFloat(campaign.target);

    // Conditions pour le remboursement :
    // 1. Campagne annulée par le propriétaire
    // Si la campagne est annulée, autoriser le remboursement uniquement si aucun fonds
    // n'a été retiré par le propriétaire (fundsWithdrawn === 0).
    if (!campaign.isActive) {
        const fundsWithdrawn = parseFloat(campaign.fundsWithdrawn || campaign.funds_withdrawn || 0);
        return fundsWithdrawn === 0;
    }
    
    // 2. Campagne terminée et objectif non atteint
    if (campaignEnded && goalNotReached) return true;
    
    // 3. Pendant la durée de la campagne (remboursement standard)
    if (!campaignEnded) return true;

    return false;
    }

// Méthode utilitaire pour estimer la date du don (approximative)
    estimateDonationDate(deadline) {
    // Estimation basée sur la deadline (suppose que le don a été fait récemment)
    const deadlineDate = new Date(Number(deadline) * 1000);
    const estimatedDonationDate = new Date(deadlineDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 jours avant la fin
    return Math.floor(estimatedDonationDate.getTime() / 1000);
    }   



    // Dans la classe ContractFunctions (Fonction.js)
async getDonatorsnum(pId) {
    try {
        if (!this.isInitialized || !this.contract) {
            throw new Error('Contrat non initialisé. Veuillez vous connecter d\'abord.');
        }
        
        console.log('🔄 Récupération du nombre de donateurs pour campagne:', pId);
        
        // Récupération directe du nombre de donateurs (plus efficace)
        const donations = await this.contract.methods.getDonators(pId).call();
        const numberOfDonators = donations[0].length;
        
        console.log(`Nombre de donateurs pour campagne ${pId}:`, numberOfDonators);
        return numberOfDonators;
    } catch (error) {
        console.error('❌ Erreur getDonatorsnum:', error);
        // Retourner 0 en cas d'erreur
        return 0;
    }
}




}


export default new ContractFunctions();