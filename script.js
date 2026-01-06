// ===========================
// Global Variables
// ===========================

let comparisonChart = null;

// Campaign constants
const CAMPAIGN_COST = 15000;
const REACH = 150000;
const CTR = 0.032;
const VISITS = REACH * CTR; // 4,800

const TEST_CAMPAIGN_COST = 3000;

// ===========================
// Initialize on Page Load
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // Set up input listeners
    setupInputListeners();

    // Initial calculation
    calculateROI();

    // Initialize chart
    initializeChart();
});

// ===========================
// Input Listeners
// ===========================

function setupInputListeners() {
    const inputs = {
        aov: document.getElementById('aov'),
        ltv: document.getElementById('ltv'),
        cac: document.getElementById('cac'),
        budget: document.getElementById('budget'),
        conversion: document.getElementById('conversion')
    };

    // Add event listeners to all sliders
    Object.keys(inputs).forEach(key => {
        inputs[key].addEventListener('input', function() {
            updateValueDisplay(key, this.value);
            calculateROI();
        });
    });
}

// ===========================
// Update Value Displays
// ===========================

function updateValueDisplay(inputName, value) {
    const valueElement = document.getElementById(`${inputName}-value`);

    switch(inputName) {
        case 'aov':
        case 'ltv':
        case 'cac':
            valueElement.textContent = `$${parseInt(value).toLocaleString()}`;
            break;
        case 'budget':
            valueElement.textContent = `$${parseInt(value).toLocaleString()}`;
            break;
        case 'conversion':
            valueElement.textContent = `${parseFloat(value).toFixed(1)}%`;
            break;
    }
}

// ===========================
// Main ROI Calculation
// ===========================

function calculateROI() {
    // Get input values
    const aov = parseFloat(document.getElementById('aov').value);
    const ltv = parseFloat(document.getElementById('ltv').value);
    const conversionRate = parseFloat(document.getElementById('conversion').value);

    // Calculate metrics
    const customers = VISITS * (conversionRate / 100);
    const campaignCAC = CAMPAIGN_COST / customers;
    const firstOrderRevenue = customers * aov;
    const ltvRevenue = customers * ltv;
    const roiPercentage = ((ltvRevenue - CAMPAIGN_COST) / CAMPAIGN_COST) * 100;
    const roiMultiple = ltvRevenue / CAMPAIGN_COST;

    // Calculate breakeven timeline (assuming customers repurchase based on LTV/AOV ratio)
    const purchasesPerYear = ltv / aov;
    const monthlyRevenue = (ltvRevenue - firstOrderRevenue) / 12;
    const remainingCost = CAMPAIGN_COST - firstOrderRevenue;
    const breakevenMonths = remainingCost > 0 ? Math.ceil(remainingCost / monthlyRevenue) : 0;

    // Update DOM
    updateResults({
        customers: Math.round(customers),
        campaignCAC: campaignCAC,
        firstOrderRevenue: firstOrderRevenue,
        ltvRevenue: ltvRevenue,
        roiPercentage: roiPercentage,
        roiMultiple: roiMultiple,
        breakevenMonths: breakevenMonths
    });

    // Update objections section
    updateObjections(conversionRate, aov, ltv);

    // Update chart
    updateChart(campaignCAC, roiMultiple);
}

// ===========================
// Update Results Display
// ===========================

function updateResults(metrics) {
    document.getElementById('customers').textContent = metrics.customers.toLocaleString();
    document.getElementById('campaign-cac').textContent = `$${Math.round(metrics.campaignCAC).toLocaleString()}`;
    document.getElementById('first-order-revenue').textContent = `$${Math.round(metrics.firstOrderRevenue).toLocaleString()}`;
    document.getElementById('ltv-revenue').textContent = `$${Math.round(metrics.ltvRevenue).toLocaleString()}`;
    document.getElementById('roi-percentage').textContent = `${Math.round(metrics.roiPercentage)}%`;
    document.getElementById('roi-multiple').textContent = `${metrics.roiMultiple.toFixed(1)}x`;

    // Breakeven timeline
    const breakevenText = metrics.breakevenMonths === 0
        ? 'Immediate'
        : `${metrics.breakevenMonths} ${metrics.breakevenMonths === 1 ? 'month' : 'months'}`;
    document.getElementById('breakeven').textContent = breakevenText;
}

// ===========================
// Update Objections Section
// ===========================

function updateObjections(currentConversion, aov, ltv) {
    // Card 1: Breakeven conversion rate
    const breakevenConversion = (CAMPAIGN_COST / (VISITS * ltv)) * 100;
    const confidenceMargin = ((currentConversion - breakevenConversion) / currentConversion) * 100;

    document.getElementById('breakeven-conversion').textContent = `${breakevenConversion.toFixed(1)}%`;
    document.getElementById('breakeven-conversion-text').textContent = `${breakevenConversion.toFixed(1)}%`;
    document.getElementById('current-conversion-text').textContent = `${currentConversion.toFixed(1)}%`;
    document.getElementById('confidence-margin').textContent = `${Math.round(confidenceMargin)}%`;

    // Update confidence bar
    const confidenceFill = document.getElementById('confidence-fill');
    confidenceFill.style.width = `${Math.min(confidenceMargin, 100)}%`;

    // Card 3: Test campaign metrics
    const testCustomers = (REACH * 0.2) * CTR * (currentConversion / 100); // 20% of reach for classified ad
    const testLtvRevenue = testCustomers * ltv;
    const testRoiPercentage = ((testLtvRevenue - TEST_CAMPAIGN_COST) / TEST_CAMPAIGN_COST) * 100;
    const testRoiMultiple = testLtvRevenue / TEST_CAMPAIGN_COST;

    document.getElementById('test-customers').textContent = Math.round(testCustomers);
    document.getElementById('test-roi').textContent = `${Math.round(testRoiPercentage)}%`;
    document.getElementById('test-multiple').textContent = `${testRoiMultiple.toFixed(1)}x`;
}

// ===========================
// Chart Initialization
// ===========================

function initializeChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');

    // Initial data
    const initialData = {
        cacs: [82, 95, 140, 125], // Meta, Google, Influencer, DTC Newsletter
        rois: [1.8, 2.1, 1.4, 2.7]
    };

    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Meta Ads', 'Google Search', 'Influencer Marketing', 'DTC Newsletter'],
            datasets: [
                {
                    label: 'CAC ($)',
                    data: initialData.cacs,
                    backgroundColor: [
                        'rgba(66, 103, 178, 0.8)',
                        'rgba(234, 67, 53, 0.8)',
                        'rgba(251, 188, 5, 0.8)',
                        'rgba(255, 107, 53, 0.8)'
                    ],
                    borderColor: [
                        'rgba(66, 103, 178, 1)',
                        'rgba(234, 67, 53, 1)',
                        'rgba(251, 188, 5, 1)',
                        'rgba(255, 107, 53, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    yAxisID: 'y'
                },
                {
                    label: 'ROI Multiple (x)',
                    data: initialData.rois,
                    backgroundColor: [
                        'rgba(26, 26, 46, 0.8)',
                        'rgba(26, 26, 46, 0.8)',
                        'rgba(26, 26, 46, 0.8)',
                        'rgba(255, 107, 53, 0.8)'
                    ],
                    borderColor: [
                        'rgba(26, 26, 46, 1)',
                        'rgba(26, 26, 46, 1)',
                        'rgba(26, 26, 46, 1)',
                        'rgba(255, 107, 53, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            weight: '600',
                            family: 'Inter'
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.95)',
                    titleFont: {
                        size: 14,
                        weight: '600',
                        family: 'Inter'
                    },
                    bodyFont: {
                        size: 13,
                        family: 'Inter'
                    },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 0) {
                                label += '$' + context.parsed.y.toFixed(0);
                            } else {
                                label += context.parsed.y.toFixed(1) + 'x';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Customer Acquisition Cost ($)',
                        font: {
                            size: 13,
                            weight: '600',
                            family: 'Inter'
                        },
                        color: '#1a1a2e'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: 'Inter'
                        },
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'ROI Multiple',
                        font: {
                            size: 13,
                            weight: '600',
                            family: 'Inter'
                        },
                        color: '#1a1a2e'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: 'Inter'
                        },
                        callback: function(value) {
                            return value.toFixed(1) + 'x';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: '500',
                            family: 'Inter'
                        }
                    }
                }
            }
        }
    });
}

// ===========================
// Update Chart
// ===========================

function updateChart(dtcCAC, dtcROI) {
    if (comparisonChart) {
        // Update DTC Newsletter data (index 3)
        comparisonChart.data.datasets[0].data[3] = Math.round(dtcCAC);
        comparisonChart.data.datasets[1].data[3] = parseFloat(dtcROI.toFixed(1));

        // Animate the update
        comparisonChart.update('active');
    }
}

// ===========================
// CTA Button Handler
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Placeholder for scheduling functionality
            alert('Thank you for your interest! In a production environment, this would open a scheduling modal or redirect to a booking page.');
            // You can integrate with Calendly, HubSpot, or another scheduling tool here
            // Example: window.open('https://calendly.com/your-link', '_blank');
        });
    }
});

// ===========================
// Smooth Scrolling (Optional Enhancement)
// ===========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===========================
// Format Number Helper
// ===========================

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function formatPercent(value) {
    return `${value.toFixed(1)}%`;
}

// ===========================
// Export for Testing (Optional)
// ===========================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateROI,
        updateResults,
        updateObjections,
        formatCurrency,
        formatPercent
    };
}
