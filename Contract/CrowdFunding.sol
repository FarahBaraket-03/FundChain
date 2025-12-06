// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract CrowdFunding {
    
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        bool isActive;
        uint256 fundsWithdrawn;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public donorContributions;
    mapping(uint256 => mapping(address => bool)) public refundClaimed;

    uint256 public numberOfCampaigns = 0;

    event CampaignCreated(uint256 indexed campaignId, address indexed owner, uint256 target, uint256 deadline);
    event DonationMade(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed owner, uint256 amount);
    event RefundClaimed(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event CampaignCancelled(uint256 indexed campaignId);
    event DeadlineUpdated(uint256 indexed campaignId, uint256 newDeadline);
    event CampaignEnded(uint256 indexed campaignId, string reason);

    modifier onlyCampaignOwner(uint256 _id) {
        require(campaigns[_id].owner == msg.sender, "Only campaign owner can perform this action");
        _;
    }

    modifier campaignExists(uint256 _id) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        _;
    }

    function createCampaign(address _owner, string memory _title, string memory _description, uint256 _target, uint256 _deadline, string memory _image) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];

        require(_deadline > block.timestamp, "The deadline should be a date in the future.");
        require(_target > 0, "Target must be greater than 0");

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.isActive = true;
        campaign.fundsWithdrawn = 0;

        uint256 campaignId = numberOfCampaigns;
        numberOfCampaigns++;

        emit CampaignCreated(campaignId, _owner, _target, _deadline);
        return campaignId;
    }


    function updateDeadline(uint256 _id, uint256 _newDeadline) public campaignExists(_id) onlyCampaignOwner(_id) {
        Campaign storage campaign = campaigns[_id];
        
        require(campaign.isActive, "Campaign is not active");
        require(_newDeadline > block.timestamp, "New deadline must be in the future");
        require(_newDeadline > campaign.deadline, "New deadline must be after current deadline");
        require(block.timestamp < campaign.deadline, "Cannot update deadline after campaign has ended");

        campaign.deadline = _newDeadline;

        emit DeadlineUpdated(_id, _newDeadline);
    }


    function donateToCampaign(uint256 _id) public payable campaignExists(_id) {
        Campaign storage campaign = campaigns[_id];
        
        require(campaign.isActive, "Campaign is not active");
        require(block.timestamp <= campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Donation amount must be greater than 0");

        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);
        campaign.amountCollected += msg.value;
        
        donorContributions[_id][msg.sender] += msg.value;

        emit DonationMade(_id, msg.sender, msg.value);
    }

    // Logique de remboursement si le donateur change d'avis (dans un délai limité)
    function refundDonation(uint256 _id) public campaignExists(_id) {
        Campaign storage campaign = campaigns[_id];
        
        require(campaign.isActive, "Campaign is not active");
        require(block.timestamp <= campaign.deadline, "Refund period ended");
        require(donorContributions[_id][msg.sender] > 0, "No donations to refund");
        require(!refundClaimed[_id][msg.sender], "Refund already claimed");

        uint256 refundAmount = donorContributions[_id][msg.sender];
        
        // Mettre à jour les statistiques de la campagne
        campaign.amountCollected -= refundAmount;
        donorContributions[_id][msg.sender] = 0;
        refundClaimed[_id][msg.sender] = true;

        // Retirer le donateur de la liste (simplifié)
        _removeDonator(_id, msg.sender);

        // Effectuer le remboursement
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit RefundClaimed(_id, msg.sender, refundAmount);
    }

    // Remboursement automatique si la campagne n'atteint pas son objectif
    function claimRefundIfGoalNotMet(uint256 _id) public campaignExists(_id) {
        Campaign storage campaign = campaigns[_id];
        
        require(block.timestamp > campaign.deadline, "Campaign not ended yet");
        require(campaign.amountCollected < campaign.target, "Campaign reached its goal");
        require(donorContributions[_id][msg.sender] > 0, "No donations to refund");
        require(!refundClaimed[_id][msg.sender], "Refund already claimed");

        uint256 refundAmount = donorContributions[_id][msg.sender];
        
        donorContributions[_id][msg.sender] = 0;
        refundClaimed[_id][msg.sender] = true;

        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit RefundClaimed(_id, msg.sender, refundAmount);
    }

    function withdrawFunds(uint256 _id) public campaignExists(_id) onlyCampaignOwner(_id) {
        Campaign storage campaign = campaigns[_id];
    
        require(campaign.isActive, "Campaign is not active");
        require(campaign.amountCollected > campaign.fundsWithdrawn, "No funds to withdraw");
    
        // Vérifier les conditions de retrait
        bool goalReached = campaign.amountCollected >= campaign.target;
        bool deadlinePassed = block.timestamp > campaign.deadline;
    
        // Le propriétaire peut retirer si :
        // 1. L'objectif est atteint (peu importe la deadline)
        // 2. OU la deadline est passée ET il y a des fonds (même si objectif non atteint)
        require(
            goalReached || deadlinePassed,
            "Cannot withdraw: goal not reached and campaign still active"
        );

        uint256 availableAmount = campaign.amountCollected - campaign.fundsWithdrawn;
        campaign.fundsWithdrawn += availableAmount;

        // Si la campagne a atteint son objectif ou est terminée, on peut la marquer comme inactive
        if (goalReached || deadlinePassed) {
            campaign.isActive = false;
        }

        (bool success, ) = payable(msg.sender).call{value: availableAmount}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(_id, msg.sender, availableAmount);
    
        // Émettre un événement supplémentaire si la campagne est désactivée
        if (!campaign.isActive) {
            emit CampaignEnded(_id, goalReached ? "goal_reached" : "deadline_passed");
        }
    }

// Fonction pour vérifier l'éligibilité au retrait (pour le frontend)
function canWithdraw(uint256 _id) public view returns (bool, string memory) {
    Campaign storage campaign = campaigns[_id];
    
    if (!campaign.isActive) {
        return (false, "Campaign is not active");
    }
    
    if (campaign.amountCollected <= campaign.fundsWithdrawn) {
        return (false, "No funds available to withdraw");
    }
    
    bool goalReached = campaign.amountCollected >= campaign.target;
    bool deadlinePassed = block.timestamp > campaign.deadline;
    
    if (goalReached) {
        return (true, "Goal reached - funds can be withdrawn");
    }
    
    if (deadlinePassed) {
        return (true, "Deadline passed - funds can be withdrawn");
    }
    
    return (false, "Cannot withdraw: goal not reached and campaign still active");
}

// Fonction pour calculer le montant disponible
function getAvailableFunds(uint256 _id) public view returns (uint256) {
    Campaign storage campaign = campaigns[_id];
    
    if (campaign.amountCollected > campaign.fundsWithdrawn) {
        return campaign.amountCollected - campaign.fundsWithdrawn;
    }
    return 0;
}

    // Le propriétaire peut annuler la campagne et rembourser tous les donateurs
    function cancelCampaign(uint256 _id) public campaignExists(_id) onlyCampaignOwner(_id) {
        Campaign storage campaign = campaigns[_id];
        
        require(campaign.isActive, "Campaign already cancelled");
        require(campaign.fundsWithdrawn == 0, "Funds already withdrawn");

        campaign.isActive = false;

        emit CampaignCancelled(_id);
    }

    // Fonction pour que les donateurs récupèrent leurs fonds après annulation
    function claimRefundAfterCancellation(uint256 _id) public campaignExists(_id) {
        Campaign storage campaign = campaigns[_id];
        
        require(!campaign.isActive, "Campaign is still active");
        require(donorContributions[_id][msg.sender] > 0, "No donations to refund");
        require(!refundClaimed[_id][msg.sender], "Refund already claimed");

        uint256 refundAmount = donorContributions[_id][msg.sender];
        
        donorContributions[_id][msg.sender] = 0;
        refundClaimed[_id][msg.sender] = true;

        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit RefundClaimed(_id, msg.sender, refundAmount);
    }

    // Fonction utilitaire pour retirer un donateur de la liste
    function _removeDonator(uint256 _id, address _donator) private { 
        Campaign storage campaign = campaigns[_id]; 
        for (uint256 i = 0; i < campaign.donators.length; i++) 
        {   if (campaign.donators[i] == _donator) 
                { // Remplacer par le dernier élément et réduire la taille 
                    campaign.donators[i] = campaign.donators[campaign.donators.length - 1]; 
                    campaign.donations[i] = campaign.donations[campaign.donations.length - 1]; 
                    campaign.donators.pop(); 
                    campaign.donations.pop(); 
                    break; 
                } 
        } 
    }


    
    // Fonctions view pour lire les données
    
     function getCampaignDetails(uint256 _id) public view campaignExists(_id) returns (
        address owner,
        string memory title,
        string memory description,
        uint256 target,
        uint256 deadline,
        uint256 amountCollected,
        string memory image,
        bool isActive,
        uint256 fundsWithdrawn
    ) {
        Campaign memory campaign = campaigns[_id];
        return (
            campaign.owner,
            campaign.title,
            campaign.description,
            campaign.target,
            campaign.deadline,
            campaign.amountCollected,
            campaign.image,
            campaign.isActive,
            campaign.fundsWithdrawn
        );
    }

    function getDonators(uint256 _id) view public campaignExists(_id) returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for(uint i = 0; i < numberOfCampaigns; i++) {
            allCampaigns[i] = campaigns[i];
        }

        return allCampaigns;
    }

    function getDonorContribution(uint256 _campaignId, address _donor) public view returns (uint256) {
        return donorContributions[_campaignId][_donor];
    }

    function isRefundClaimed(uint256 _campaignId, address _donor) public view returns (bool) {
        return refundClaimed[_campaignId][_donor];
    }
}