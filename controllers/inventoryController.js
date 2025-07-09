const db = require('../models/db');

exports.getInventory = async (req, res) => {
    try {
        const [items] = await db.query('SELECT * FROM HD_DISPLAY');
        const [totals] = await db.query(`
            SELECT 
                SUM(NU_QTY) as total_items,
                SUM(NU_LINE_TOTAL * NU_DISCOUNT/100) as total_discount,
                SUM(NU_LINE_TOTAL) as total_price
            FROM HD_DISPLAY
        `);

        res.json({ items, totals: totals[0] || {
            total_items: 0,
            total_discount: 0,
            total_price: 0
        }});
    } catch (error) {
        console.error(error);
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