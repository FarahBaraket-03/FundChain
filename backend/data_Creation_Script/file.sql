-- Supprimer les tables existantes (attention: cela efface les données)
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Recréer les tables avec le bon schéma
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    blockchain_id INTEGER NOT NULL UNIQUE,
    owner_address VARCHAR(42) NOT NULL,
    
    -- Données de base (smart contract)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(18, 8) NOT NULL,
    deadline BIGINT NOT NULL,  -- Unix timestamp
    amount_collected DECIMAL(18, 8) DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    funds_withdrawn DECIMAL(18, 8) DEFAULT 0,
    
    -- Catégorie
    category_id INTEGER REFERENCES categories(id),
    
    -- Liens sociaux
    social_links TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE donations (
    id BIGSERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL,
    donor_address VARCHAR(42) NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Clé étrangère vers blockchain_id
    FOREIGN KEY (campaign_id) REFERENCES campaigns(blockchain_id) ON DELETE CASCADE
);

CREATE TABLE withdrawals (
    id BIGSERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL,
    recipient_address VARCHAR(42) NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Clé étrangère vers blockchain_id
    FOREIGN KEY (campaign_id) REFERENCES campaigns(blockchain_id) ON DELETE CASCADE
);

-- Insertion des catégories
INSERT INTO categories (name) VALUES
    ('Charity & Non-Profit'),
    ('Startup & Business'),
    ('Community Projects'),
    ('Technology & Innovation'),
    ('Art & Creative'),
    ('Education & Research'),
    ('Environment & Sustainability'),
    ('Health & Wellness'),
    ('Gaming & Entertainment'),
    ('Other');

-- Indexes
CREATE INDEX idx_campaigns_owner ON campaigns(owner_address);
CREATE INDEX idx_campaigns_category ON campaigns(category_id);
CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_donor ON donations(donor_address);
CREATE INDEX idx_withdrawals_campaign ON withdrawals(campaign_id);
CREATE INDEX idx_withdrawals_recipient ON withdrawals(recipient_address);


select * from campaigns;

select * from donations;

select * from withdrawals;

select * from categories ;

-- Index pour la recherche
CREATE INDEX idx_campaigns_title ON campaigns(title);
CREATE INDEX idx_campaigns_deadline ON campaigns(deadline);