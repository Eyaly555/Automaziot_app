// Vercel serverless function for Zoho Deals operations
import { searchDeals, getDeal, updateDeal, createDeal } from './service.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { dealId } = req.query;

    switch (req.method) {
      case 'GET':
        if (dealId) {
          // Get specific deal
          const deal = await getDeal(dealId);
          return res.status(200).json(deal);
        } else {
          // Search deals
          const { criteria } = req.query;
          const deals = await searchDeals(criteria || {});
          return res.status(200).json(deals);
        }

      case 'POST':
        // Create new deal
        const newDeal = await createDeal(req.body);
        return res.status(201).json(newDeal);

      case 'PUT':
        if (!dealId) {
          return res.status(400).json({ error: 'Deal ID is required for updates' });
        }
        // Update deal
        const updatedDeal = await updateDeal(dealId, req.body);
        return res.status(200).json(updatedDeal);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Zoho Deals API error:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      message: error.message
    });
  }
}