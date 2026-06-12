const express = require('express');
const router = express.Router();

const NP_API_KEY = process.env.NOVA_POSHTA_API_KEY || '';

router.post('/cities', async (req, res) => {
    try {
        if (!query || query.trim().length < 2) {
            return res.json({ success: true, data: [] });
        }

        const { query } = req.body;
        const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: NP_API_KEY,
                modelName: 'Address',
                calledMethod: 'getCities',
                methodProperties: { FindByString: query, Limit: 10 },
            }),
        });
        const data = await response.json();
        console.log('Cities:', data.success, data.data?.length, data.errors);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'API error' });
    }
});

router.post('/warehouses', async (req, res) => {
    try {
        const { cityRef, query } = req.body;
        const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: NP_API_KEY,
                modelName: 'Address',
                calledMethod: 'getWarehouses',
                methodProperties: { CityRef: cityRef, FindByString: query || '', Limit: 20 },
            }),
        });
        const data = await response.json();
        console.log('Warehouses:', data.success, data.data?.length, data.errors);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'API error' });
    }
});

module.exports = router;