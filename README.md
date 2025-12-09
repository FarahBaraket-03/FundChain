# 🌐 FundChain - Decentralized Crowdfunding Platform

<div align="center">

![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum-blue?style=for-the-badge&logo=ethereum)
![Solidity](https://img.shields.io/badge/Solidity-Smart_Contracts-purple?style=for-the-badge&logo=solidity)
![React](https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react)
![Web3](https://img.shields.io/badge/Web3.js-Integration-orange?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
[![n8n](https://img.shields.io/badge/Automation-n8n-purple?style=for-the-badge&logo=n8n&logoColor=pink)](https://n8n.io)

**A transparent and secure blockchain-based crowdfunding platform powered by smart contracts**

</div>

## 🎯 What We're Building

**FundChain** is a decentralized crowdfunding platform that leverages blockchain technology to create a trustless, transparent fundraising ecosystem. The platform combines:

- 🔐 **Smart Contract Security**: All transactions governed by immutable Ethereum smart contracts
- 💰 **Transparent Funding**: Real-time tracking of donations and fund allocation
- 🔄 **Automated Refunds**: Smart contract-based refund mechanism for failed campaigns
- 📊 **Dual Database Architecture**: Blockchain for transactions, PostgreSQL for metadata
- 🎨 **Modern UI/UX**: Built with React and TailwindCSS for seamless user experience

---

## 📚 What You'll Find

<table>
<tr>
<td width="50%">

### 🏗️ **Core Features**
- ✨ **Campaign Creation & Management**
- 🤖 **AI-Powered Description Generator**
- 🔍 **Advanced Search & Filtering**
- 💳 **Cryptocurrency Donations**
- 📈 **Real-time Progress Tracking**
- 🔒 **Secure Withdrawal System**
- ♻️ **Automatic Refund Processing**

</td>
<td width="50%">

### 🛠️ **Technical Stack**
- ⚛️ **React + Vite Frontend**
- 📜 **Solidity Smart Contracts**
- 🌐 **Web3.js Integration**
- 🗄️ **PostgreSQL + Sequelize ORM**
- 🚀 **Express.js Backend**
- 🤖 **n8n AI Workflow Automation**
- 🎨 **TailwindCSS Styling**

</td>
</tr>
</table>


---

## 🚀 Prerequisites

Before we start, make sure you have:

<table>
<tr>
<td>

**📦 Required Software**
- [Node.js & npm](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (v12+)
- [Ganache](https://trufflesuite.com/ganache/) (Local Ethereum Blockchain)
- [n8n](https://n8n.io/) (Workflow Automation)
- Git

</td>
<td>

**🔑 Required Tools**
- MetaMask or compatible Web3 wallet
- Truffle or Hardhat (for smart contract deployment)
- OpenAI API Key or Ollama (for AI descriptions)
- Code editor (VS Code recommended)

</td>
</tr>
</table>

---

## ⚡ Quick Start

### 📥 **Step 1: Clone & Install**

```bash
# Clone the repository
git clone https://github.com/FarahBaraket-03/FundChain.git
cd FundChain

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 🗄️ **Step 2: Database Setup**

```bash
# Create PostgreSQL database
createdb fundchain_db

# Run the database creation script
cd backend/data_Creation_Script
psql -U postgres -d fundchain_db -f file.sql
```

### 🤖 **Step 3: n8n AI Assistant Setup**

```bash
# Install n8n globally (or use Docker)
npm install -g n8n

# Start n8n
n8n start

# n8n will be available at http://localhost:5678
```

**Import the AI Workflow:**
1. Open n8n at `http://localhost:5678`
2. Create a new workflow or import `n8n-workflows/campaign-description-generator.json`
3. Configure your AI provider (OpenAI/Ollama) credentials
4. Activate the webhook endpoint
5. Copy the webhook URL to your backend `.env` file

<details>
<summary>🔍 What does the n8n workflow do?</summary>

- 📝 **Receives** campaign title, category, and basic details via webhook
- 🤖 **Processes** input through AI model (GPT-4, Mistral, or Llama)
- ✨ **Generates** compelling, emotionally engaging descriptions
- 📊 **Enhances** with persuasive language and call-to-action
- 🎯 **Returns** professionally written campaign description
- 🌍 **Supports** multiple languages and tones

</details>

### 🔧 **Step 4: Environment Configuration**

**Backend Environment** - Create `.env` file in `backend` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fundchain_db
DB_USER=postgres
DB_PASSWORD=your_password

# Blockchain Configuration
WEB3_PROVIDER_URL=http://localhost:7545  # Ganache default port
CONTRACT_ADDRESS=your_deployed_contract_address
CHAIN_ID=1337  # Ganache Chain ID

# CORS
CORS_ORIGIN=http://localhost:5173

# Ganache Configuration
GANACHE_MNEMONIC=your_ganache_mnemonic
GANACHE_ACCOUNTS=10

# n8n AI Assistant Configuration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/generate-description
OPENAI_API_KEY=your_openai_api_key  # Or use Ollama
```

**Frontend Environment** - Create `.env` file in `frontend` directory:

```env
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_CHAIN_ID=1337
VITE_API_URL=http://localhost:3001/api
```

### ⛓️ **Step 5: Deploy Smart Contract**

```bash
# Start Ganache (GUI or CLI)
ganache-cli -p 7545 -i 1337

# Deploy the smart contract (in Contract directory)
# Using Truffle:
truffle migrate --network development

# Or using Hardhat:
npx hardhat run scripts/deploy.js --network localhost

# Copy the deployed contract address to your .env files
```

### 🚀 **Step 6: Start the Application**

**Terminal 1 - n8n Workflow:**
```bash
n8n start
```
n8n will run on `http://localhost:5678` 🤖

**Terminal 2 - Backend Server:**
```bash
cd backend
npm start
```
Backend will run on `http://localhost:3001` 🎉

**Terminal 3 - Frontend Development Server:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173` 🎨

### 🔗 **Step 7: Connect MetaMask**

1. Open MetaMask and add Ganache network:
   - Network Name: `Ganache Local`
   - RPC URL: `http://localhost:7545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

2. Import a Ganache account using its private key
3. Visit `http://localhost:5173` and connect your wallet

---

## 🏗️ Architecture Overview

<div align="center">

### **System Architecture - Hybrid Blockchain + Traditional Backend**

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[🎨 React + Vite UI]
        RC[📱 React Router]
        TW[💅 TailwindCSS]
    end
    
    subgraph "Blockchain Layer"
        MM[🦊 MetaMask Wallet]
        W3[🌐 Web3.js / Ethers.js]
        SC[📜 Smart Contract<br/>CrowdFunding.sol]
        BC[⛓️ Ganache Blockchain<br/>Local Ethereum Network]
    end
    
    subgraph "Backend Layer - Node.js"
        API[🚀 Express.js API Server]
        MW[🔐 Middlewares<br/>Web3Auth + Ganache]
        CTRL[🎮 Controllers]
        SRV[⚙️ Services<br/>Ganache Sync]
        N8N[🤖 n8n AI Workflow<br/>Description Generator]
    end
    
    subgraph "Data Layer"
        SEQ[🔄 Sequelize ORM]
        DB[(🗄️ PostgreSQL<br/>Campaign Metadata)]
        MODELS[📦 Models<br/>Campaign | Donation<br/>Withdrawal | Category]
    end
    
    UI --> RC
    UI --> TW
    UI --> MM
    MM --> W3
    UI --> API
    
    W3 --> SC
    SC --> BC
    
    API --> MW
    MW --> CTRL
    CTRL --> SRV
    CTRL --> SEQ
    CTRL -."Generate Description".-> N8N
    SEQ --> MODELS
    MODELS --> DB
    
    SRV -."Sync Transactions".-> BC
    SRV -."Update DB".-> SEQ
    N8N -."AI-Enhanced Text".-> CTRL
    
    style UI fill:#e3f2fd
    style MM fill:#fff3e0
    style W3 fill:#f3e5f5
    style SC fill:#e8f5e9
    style BC fill:#fff9c4
    style API fill:#fce4ec
    style DB fill:#e0f2f1
    style MW fill:#ffeaa7
    style SRV fill:#fab1a0
```

</div>

### 🔄 **Data Flow**xplained**

#### 1️⃣ **Campaign Creation Flow**
```
User (Frontend) → MetaMask Sign → Smart Contract.createCampaign() 
→ Blockchain Transaction → Backend API /api/campaigns 
→ PostgreSQL Store Metadata → Frontend Update
```

#### 2️⃣ **Donation Flow**
```
Donor → Campaign Details → Donate Button → MetaMask Confirm 
→ Smart Contract.donateToCampaign() → ETH Transfer to Contract 
→ Ganache Sync Service → Backend API Record → DB Update 
→ Real-time Progress Update
```

#### 3️⃣ **Withdrawal Flow**
```
Campaign Owner → Withdrawal Request → Smart Contract Validation 
→ Check: Is Owner? Is Goal Met? → Transfer ETH to Owner 
→ Backend API /api/withdrawals → Update Campaign Status 
→ Frontend Confirmation
```

#### 4️⃣ **Refund Flow**
```
Deadline Expired + Goal Not Met → Smart Contract.endCampaignAndRefund() 
→ Donors Call claimRefund() → Automatic ETH Return 
→ Backend Sync → DB Update Status → Frontend Notification
```

### 🔗 **Technology Integration Points**

| Component | Technology | Purpose |
|-----------|------------|----------|
| **Wallet Connection** | MetaMask + Web3.js | User authentication & transaction signing |
| **Smart Contract Interaction** | Ethers.js / Web3.js | Read/Write blockchain data |
| **Backend Sync** | Ganache Service | Keep DB in sync with blockchain |
| **API Layer** | Express + Sequelize | CRUD operations for metadata |
| **State Management** | React Context | Global state (wallet, campaigns) |
| **Routing** | React Router | SPA navigation |

---

## 🌟 Key Features

<table>
<tr>
<td width="33%">

### 🎯 **Campaign Management**
- Create fundraising campaigns
- **AI-powered description generation**
- Set funding goals & deadlines
- Category-based organization
- Rich media support (images, descriptions)
- Campaign status tracking

</td>
<td width="33%">

### 💳 **Smart Donations**
- ETH-based contributions
- Real-time progress updates
- Transparent transaction history
- Donor tracking
- Contribution verification

</td>
<td width="33%">

### 🔒 **Secure Operations**
- Smart contract-based security
- Owner-only withdrawals
- Automated refund system
- Blockchain immutability
- Web3 authentication

</td>
</tr>
</table>

---

## 📁 Project Structure

```
FundChain/
├── backend/                    # Express.js Backend
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # API controllers
│   │   ├── middlewares/       # Authentication & Web3
│   │   ├── models/            # Sequelize models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Ganache sync service
│   │   └── scripts/           # Utility scripts
│   ├── data_Creation_Script/  # SQL database setup
│   └── package.json
│
├── n8n-workflows/              # AI Workflow Automation
│   └── campaign-description-generator.json
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React Context (Web3)
│   │   ├── services/          # API service layer
│   │   ├── utils/             # Helper functions
│   │   └── assets/            # Static assets
│   ├── tailwind.config.js     # TailwindCSS config
│   └── package.json
│
└── Contract/                   # Smart Contracts
    └── CrowdFunding.sol       # Main crowdfunding contract
```

---

## 🛠️ API Endpoints

### Campaign Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/campaigns` | Get all campaigns |
| `GET` | `/api/campaigns/:id` | Get campaign by ID |
| `POST` | `/api/campaigns` | Create new campaign |
| `PUT` | `/api/campaigns/:id` | Update campaign |
| `DELETE` | `/api/campaigns/:id` | Delete campaign |

### Donation Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/donations` | Get all donations |
| `GET` | `/api/donations/campaign/:campaignId` | Get campaign donations |
| `POST` | `/api/donations` | Record new donation |

### Withdrawal Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/withdrawals` | Get all withdrawals |
| `POST` | `/api/withdrawals` | Create withdrawal request |

### Category Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories` | Get all categories |
| `POST` | `/api/categories` | Create new category |

### AI Assistant Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/generate-description` | Generate AI-powered campaign description |
| `POST` | `/api/ai/enhance-description` | Enhance existing description |

---

## 📜 Smart Contract Functions

### Main Contract Functions

```solidity
// Campaign Management
createCampaign(owner, title, description, target, deadline, image)
updateDeadline(campaignId, newDeadline)
cancelCampaign(campaignId)

// Donations
donateToCampaign(campaignId) payable
getDonators(campaignId)

// Withdrawals
withdrawFunds(campaignId, amount)
withdrawPartialFunds(campaignId, amount)

// Refunds
claimRefund(campaignId)
endCampaignAndRefund(campaignId)

// Getters
getCampaigns()
getCampaignDetails(campaignId)
```

---

## 🔧 Technical Stack Details

<table>
<tr>
<td width="33%">

### 🎨 **Frontend**
- **React 18.2**: UI framework
- **Vite**: Build tool
- **Web3.js 4.16**: Blockchain interaction
- **Ethers.js 6.16**: Ethereum library
- **React Router 6**: Navigation
- **TailwindCSS 3.2**: Styling
- **Axios**: HTTP client

</td>
<td width="33%">

### ⚙️ **Backend**
- **Express 5.2**: Web framework
- **Sequelize 6.37**: ORM
- **PostgreSQL**: Database
- **Web3.js 4.16**: Blockchain sync
- **n8n**: AI workflow automation
- **OpenAI/Ollama**: AI models
- **Helmet**: Security headers
- **CORS**: Cross-origin support
- **Nodemon**: Auto-restart

</td>
<td width="33%">

### ⛓️ **Blockchain**
- **Solidity 0.8.28**: Smart contracts
- **Ganache**: Local blockchain
- **Web3 Provider**: RPC connection
- **MetaMask**: Wallet integration
- **Ethereum**: Blockchain platform

</td>
</tr>
</table>

---

## 🧪 Testing the Application

### 🎬 **Create Your First Campaign**

1. Connect MetaMask wallet
2. Navigate to "Create Campaign"
3. Fill in campaign details:
   - Title
   - Category
   - **Click "Generate AI Description"** 🤖
   - Review and edit AI-generated description
   - Funding target (in ETH)
   - Deadline
   - Image URL
4. Submit and confirm MetaMask transaction

### 💰 **Make a Donation**

1. Browse campaigns on home page
2. Click on a campaign
3. Enter donation amount
4. Confirm transaction in MetaMask
5. View updated progress bar

### 🏦 **Withdraw Funds (Campaign Owner)**

1. Navigate to "My Campaigns"
2. Select successful campaign
3. Click "Withdraw Funds"
4. Specify amount (partial or full)
5. Confirm withdrawal

---

## 🔐 Security Features

- ✅ **Smart Contract Validation**: All operations validated on-chain
- ✅ **Owner-Only Actions**: Modifier-based access control
- ✅ **Deadline Enforcement**: Automatic campaign lifecycle management
- ✅ **Refund Protection**: Guaranteed refunds for failed campaigns
- ✅ **Web3 Authentication**: Signature-based user verification
- ✅ **SQL Injection Prevention**: Sequelize ORM parameterized queries
- ✅ **CORS Protection**: Configured origin restrictions

---

## 🚧 Development Scripts

### Backend
```bash
npm start          # Start server with nodemon
npm test           # Run tests
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 🎯 What Makes FundChain Different?

| 🏦 **Traditional Crowdfunding** | 🌐 **FundChain (Blockchain)** |
|--------------------------------|-------------------------------|
| Centralized control | Decentralized & transparent |
| Platform fees (5-10%) | Minimal gas fees only |
| Trust-based system | Trustless smart contracts |
| Delayed refunds | Automatic refunds |
| Opaque fund management | 100% transparent on blockchain |
| Geographic restrictions | Global accessibility |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Team

**Author**: Farah Baraket  
**Repository**: [FundChain](https://github.com/FarahBaraket-03/FundChain)

---

## 📞 Support

For issues and questions:
- 🐛 [Report a Bug](https://github.com/FarahBaraket-03/FundChain/issues)
- 💬 [Discussions](https://github.com/FarahBaraket-03/FundChain/discussions)

---

<div align="center">

⭐ **Star this repo if you found it helpful!** ⭐

**Built with ❤️ using Blockchain Technology**

</div>
