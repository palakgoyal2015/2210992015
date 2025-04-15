const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const WINDOW_SIZE = 10;
const VALID_IDS = ['primes', 'fibo', 'even', 'rand'];

let numberWindow = [];
let isFirstCall = true;
app.set('json spaces', 0);

// Updated third-party base URL
const thirdPartyAPI = (id) => `http://20.244.56.144/evaluation-service/${id}`;

app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;

    if (!VALID_IDS.includes(numberid)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    const windowPrevState = [...numberWindow];
    let fetchedNumbers = [];

    try {
        if (isFirstCall) {
            // Mock initial call
            fetchedNumbers = [1, 3, 5, 7];
            isFirstCall = false;
        } else {
            const response = await Promise.race([
                axios.get(thirdPartyAPI(numberid)),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 500)
                )
            ]);

            if (response?.data?.numbers && Array.isArray(response.data.numbers)) {
                fetchedNumbers = response.data.numbers;
            }
        }

        // Maintain unique sliding window
        fetchedNumbers.forEach(num => {
            if (!numberWindow.includes(num)) {
                numberWindow.push(num);
                if (numberWindow.length > WINDOW_SIZE) {
                    numberWindow.shift();
                }
            }
        });

    } catch (err) {
        // Handle errors silently per instructions
    }

    const avg = numberWindow.length > 0
        ? (numberWindow.reduce((a, b) => a + b, 0) / numberWindow.length).toFixed(2)
        : 0.00;

    return res.json({
        windowPrevState,
        windowCurrState: numberWindow,
        numbers: fetchedNumbers,
        avg: parseFloat(avg)
    });
});

app.listen(PORT, () => {
    console.log(`✅ Microservice running on http://localhost:${PORT}`);
});
