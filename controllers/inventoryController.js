const db = require('../models/db');

exports.getInventory = async (req, res) => {
    try {
      // Get raw data from database
      const [items] = await db.query('SELECT * FROM HD_DISPLAY');
      const [totals] = await db.query(`
        SELECT 
          SUM(NU_QTY) as total_items,
          SUM(NU_LINE_TOTAL * NU_DISCOUNT/100) as total_discount,
          SUM(NU_LINE_TOTAL) as total_price
        FROM HD_DISPLAY
      `);
  
      // Convert all numeric strings to proper numbers
      const processedItems = items.map(item => ({
        ...item,
        NU_QTY: Number(item.NU_QTY),
        NU_DISCOUNT: Number(item.NU_DISCOUNT),
        NU_ITEM_PRICE: Number(item.NU_ITEM_PRICE),
        NU_LINE_TOTAL: Number(item.NU_LINE_TOTAL),
        NU_VAT_AMOUNT: Number(item.NU_VAT_AMOUNT || 0)
      }));
  
      // Process totals
      const processedTotals = totals[0] ? {
        total_items: Number(totals[0].total_items),
        total_discount: Number(totals[0].total_discount),
        total_price: Number(totals[0].total_price)
      } : {
        total_items: 0,
        total_discount: 0,
        total_price: 0
      };
  
      res.json({ 
        items: processedItems, 
        totals: processedTotals
      });
    } catch (error) {
      console.error('Inventory Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
};

exports.sseInventory = async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendData = async () => {
        try {
            const [items] = await db.query('SELECT * FROM HD_DISPLAY');
            const [totals] = await db.query(`
                SELECT 
                    SUM(NU_QTY) as total_items,
                    SUM(NU_LINE_TOTAL * NU_DISCOUNT/100) as total_discount,
                    SUM(NU_LINE_TOTAL) as total_price
                FROM HD_DISPLAY
            `);

            const data = {
                items,
                totals: totals[0] || {
                    total_items: 0,
                    total_discount: 0,
                    total_price: 0
                }
            };

            res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
            console.error(error);
        }
    };

    // Send initial data
    await sendData();

    // Update every second
    const interval = setInterval(sendData, 1000);

    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
};

// Add this to your existing inventoryController.js
exports.sseInventoryUpdates = async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
  
    const sendUpdate = async () => {
      try {
        const [items] = await db.query('SELECT * FROM HD_DISPLAY');
        const [totals] = await db.query(`
          SELECT 
            SUM(NU_QTY) as total_items,
            SUM(NU_LINE_TOTAL * NU_DISCOUNT/100) as total_discount,
            SUM(NU_LINE_TOTAL) as total_price
          FROM HD_DISPLAY
        `);
  
        const data = {
          items: items.map(item => ({
            ...item,
            NU_QTY: Number(item.NU_QTY),
            NU_DISCOUNT: Number(item.NU_DISCOUNT),
            NU_ITEM_PRICE: Number(item.NU_ITEM_PRICE),
            NU_LINE_TOTAL: Number(item.NU_LINE_TOTAL)
          })),
          totals: totals[0] ? {
            total_items: Number(totals[0].total_items),
            total_discount: Number(totals[0].total_discount),
            total_price: Number(totals[0].total_price)
          } : {
            total_items: 0,
            total_discount: 0,
            total_price: 0
          }
        };
  
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.error('SSE Error:', error);
      }
    };
  
    // Send initial data immediately
    await sendUpdate();
  
    // Check for updates every 2 seconds
    const interval = setInterval(sendUpdate, 2000);
  
    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  };