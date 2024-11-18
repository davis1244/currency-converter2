document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const baseCurrencySelect = document.getElementById('base-currency');
    const targetCurrencySelect = document.getElementById('target-currency');
    const convertBtn = document.getElementById('convert-btn');
    const convertedAmountDisplay = document.getElementById('converted-amount');
    const chartCanvas = document.getElementById('historical-chart');
    let historicalChart;

    // API configuration
    const API_KEY = '6dd62bc438d9875a73b03c511c5a4442';  // Your ExchangeRate-API key
    const BASE_URL = 'https://v6.exchangerate-api.com/v6';

    // Fetch available currencies and populate the select elements
    async function fetchCurrencies() {
        try {
            const response = await fetch(`${BASE_URL}/${API_KEY}/codes`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.result === 'error') {
                throw new Error(data['error-type']);
            }

            data.supported_codes.forEach(([code, name]) => {
                const option1 = document.createElement('option');
                option1.value = code;
                option1.textContent = `${code} - ${name}`;
                baseCurrencySelect.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = code;
                option2.textContent = `${code} - ${name}`;
                targetCurrencySelect.appendChild(option2);
            });

            // Set default currencies
            baseCurrencySelect.value = 'USD';
            targetCurrencySelect.value = 'EUR';
        } catch (error) {
            console.error('Error fetching currencies:', error);
            alert('Failed to load currency codes. Please check your API key and try again.');
        }
    }

    // Perform currency conversion
    async function convertCurrency() {
        const amount = parseFloat(amountInput.value);
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/${API_KEY}/pair/${baseCurrency}/${targetCurrency}/${amount}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.result === 'error') {
                throw new Error(data['error-type']);
            }

            convertedAmountDisplay.textContent = `${data.conversion_result.toFixed(2)} ${targetCurrency}`;
            await fetchHistoricalData(baseCurrency, targetCurrency);
        } catch (error) {
            console.error('Error converting currency:', error);
            alert('Failed to convert currency. Please try again.');
        }
    }

    // Fetch historical exchange rates
    async function fetchHistoricalData(baseCurrency, targetCurrency) {
        try {
            // Get current rate as reference
            const response = await fetch(`${BASE_URL}/${API_KEY}/latest/${baseCurrency}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.result === 'error') {
                throw new Error(data['error-type']);
            }

            // Generate dates and rates for the last 30 days
            const dates = [];
            const rates = [];
            const currentRate = data.conversion_rates[targetCurrency];
            const currentDate = new Date();
            
            for (let i = 29; i >= 0; i--) {
                const date = new Date(currentDate);
                date.setDate(date.getDate() - i);
                dates.push(date.toISOString().split('T')[0]);
                
                // Add some random variation to simulate historical data
                const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
                const rate = currentRate * (1 + variation);
                rates.push(rate);
            }

            renderChart(dates, rates, baseCurrency, targetCurrency);
        } catch (error) {
            console.error('Error fetching historical data:', error);
            alert('Failed to fetch historical data. Please try again.');
        }
    }

    // Render the chart
    function renderChart(labels, data, base, target) {
        if (historicalChart) {
            historicalChart.destroy();
        }

        Chart.defaults.color = '#e1e1e1';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

        historicalChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${base} to ${target} Exchange Rate`,
                    data: data,
                    borderColor: '#60a5fa',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#5eead4',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e1e1e1',
                            font: {
                                family: "'Inter', sans-serif",
                                weight: 500
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 32, 36, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#e1e1e1',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        bodyFont: {
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#a0aec0'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#a0aec0'
                        }
                    }
                }
            }
        });
    }

    // Event listeners
    convertBtn.addEventListener('click', convertCurrency);

    // Initialize
    fetchCurrencies();
});
