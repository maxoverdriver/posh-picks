const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const ScraperFactory = require('./scrapers/ScraperFactory');
const ProxyRotatorService = require('./services/ProxyRotatorService');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Initialize services
const initializeServices = async () => {
  try {
    // Initialize proxy service
    if (process.env.PROXY_SERVICE_ENABLED === 'true') {
      await ProxyRotatorService.initialize();
      console.log('Proxy rotation service initialized');
    }
    
    // Initialize scraper factory
    const scraperFactory = new ScraperFactory();
    console.log('Scraper factory initialized');
    
    return { scraperFactory };
  } catch (error) {
    console.error('Error initializing services:', error);
    process.exit(1);
  }
};

// API routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Auto Finder Pro Scraper Service is running',
    environment: process.env.NODE_ENV
  });
});

app.post('/api/scrape', async (req, res) => {
  try {
    const { marketplace, searchParams } = req.body;
    
    if (!marketplace) {
      return res.status(400).json({
        status: 'error',
        message: 'Marketplace is required'
      });
    }
    
    const scraper = services.scraperFactory.getScraper(marketplace);
    
    if (!scraper) {
      return res.status(400).json({
        status: 'error',
        message: `No scraper available for ${marketplace}`
      });
    }
    
    console.log(`Starting scrape for ${marketplace}`);
    const results = await scraper.search(searchParams);
    
    res.status(200).json({
      status: 'success',
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Scrape error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 4000;

let services;

const startServer = async () => {
  await connectDB();
  services = await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`Scraper service running on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});