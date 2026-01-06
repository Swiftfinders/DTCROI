// ===========================
// Global Variables
// ===========================

let comparisonChart = null;

// Campaign constants (never change)
const CAMPAIGN_COST = 15000;
const REACH = 150000;
const EXPECTED_CTR = 0.032; // 3.2%
const VISITS = REACH * EXPECTED_CTR; // 4,800

const TEST_CAMPAIGN_COST = 3000;
const TEST_REACH = 30000; // Classified ad reach

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
    const userAOV = parseFloat(document.getElementById('aov').value);
    const userLTV = parseFloat(document.getElementById('ltv').value);
    const userCAC = parseFloat(document.getElementById('cac').value);
    const userConversionRate = parseFloat(document.getElementById('conversion').value);

    // STEP-BY-STEP CALCULATIONS (exact formulas)
    // 1. visits = already calculated as VISITS constant (4800)

    // 2. customers = visits * (userConversionRate / 100)
    const customers = VISITS * (userConversionRate / 100);

    // 3. campaign_cac = CAMPAIGN_COST / customers
    const campaignCAC = CAMPAIGN_COST / customers;

    // 4. first_order_revenue = customers * userAOV
    const firstOrderRevenue = customers * userAOV;

    // 5. ltv_revenue = customers * userLTV
    const ltvRevenue = customers * userLTV;

    // 6. immediate_profit = first_order_revenue - CAMPAIGN_COST
    const immediateProfit = firstOrderRevenue - CAMPAIGN_COST;

    // 7. twelve_month_profit = ltv_revenue - CAMPAIGN_COST
    const twelveMonthProfit = ltvRevenue - CAMPAIGN_COST;

    // 8. roi_percentage = (twelve_month_profit / CAMPAIGN_COST) * 100
    const roiPercentage = (twelveMonthProfit / CAMPAIGN_COST) * 100;

    // 9. roi_multiple = ltv_revenue / CAMPAIGN_COST
    const roiMultiple = ltvRevenue / CAMPAIGN_COST;

    // 10. breakeven_conversion = (CAMPAIGN_COST / userLTV / VISITS) * 100
    const breakevenConversion = (CAMPAIGN_COST / userLTV / VISITS) * 100;

    // Update DOM
    updateResults({
        customers: Math.round(customers),
        campaignCAC: campaignCAC,
        userCAC: userCAC,
        firstOrderRevenue: firstOrderRevenue,
        ltvRevenue: ltvRevenue,
        immediateProfit: immediateProfit,
        roiPercentage: roiPercentage,
        roiMultiple: roiMultiple
    });

    // Update objections section
    updateObjections(userConversionRate, userAOV, userLTV, breakevenConversion);

    // Update chart
    updateChart(campaignCAC, roiMultiple);
}

// ===========================
// Update Results Display
// ===========================

function updateResults(metrics) {
    // Update all result fields
    document.getElementById('customers').textContent = metrics.customers.toLocaleString();
    document.getElementById('campaign-cac').textContent = `$${Math.round(metrics.campaignCAC).toLocaleString()}`;
    document.getElementById('cac-comparison').textContent = `$${Math.round(metrics.userCAC).toLocaleString()}`;
    document.getElementById('first-order-revenue').textContent = `$${Math.round(metrics.firstOrderRevenue).toLocaleString()}`;

    // Immediate ROI calculation and display
    const immediateROIPercentage = (metrics.immediateProfit / CAMPAIGN_COST) * 100;
    const immediateROIElement = document.getElementById('immediate-roi');
    immediateROIElement.textContent = `${Math.round(immediateROIPercentage)}%`;

    // Style negative immediate ROI in gray
    const immediateROIParent = immediateROIElement.closest('.result-item');
    if (immediateROIPercentage < 0) {
        immediateROIParent.style.color = '#6B7280';
    } else {
        immediateROIParent.style.color = '';
    }

    document.getElementById('ltv-revenue').textContent = `$${Math.round(metrics.ltvRevenue).toLocaleString()}`;
    document.getElementById('roi-percentage').textContent = `${Math.round(metrics.roiPercentage)}%`;
    document.getElementById('roi-multiple').textContent = `${metrics.roiMultiple.toFixed(1)}x`;
}

// ===========================
// Update Objections Section
// ===========================

function updateObjections(currentConversion, aov, ltv, breakevenConversion) {
    // Card 1: Breakeven conversion rate
    // breakevenConversion is already calculated in calculateROI
    const safetyMargin = ((currentConversion - breakevenConversion) / currentConversion) * 100;

    document.getElementById('breakeven-conversion').textContent = `${breakevenConversion.toFixed(2)}%`;
    document.getElementById('breakeven-conversion-text').textContent = `${breakevenConversion.toFixed(2)}%`;
    document.getElementById('current-conversion-text').textContent = `${currentConversion.toFixed(1)}%`;
    document.getElementById('confidence-margin').textContent = `${Math.round(safetyMargin)}%`;

    // Update confidence bar
    const confidenceFill = document.getElementById('confidence-fill');
    confidenceFill.style.width = `${Math.min(safetyMargin, 100)}%`;

    // Card 3: Test campaign metrics ($3k classified ad)
    const testVisits = TEST_REACH * EXPECTED_CTR; // 30,000 * 0.032 = 960
    const testCustomers = testVisits * (currentConversion / 100);
    const testLtvRevenue = testCustomers * ltv;
    const testTwelveMonthProfit = testLtvRevenue - TEST_CAMPAIGN_COST;
    const testRoiPercentage = (testTwelveMonthProfit / TEST_CAMPAIGN_COST) * 100;
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
                        'rgba(156, 163, 175, 0.7)',  // Gray for Meta
                        'rgba(156, 163, 175, 0.7)',  // Gray for Google
                        'rgba(156, 163, 175, 0.7)',  // Gray for Influencer
                        'rgba(37, 99, 235, 0.8)'     // Blue for DTC Newsletter
                    ],
                    borderColor: [
                        'rgba(107, 114, 128, 1)',    // Gray border for Meta
                        'rgba(107, 114, 128, 1)',    // Gray border for Google
                        'rgba(107, 114, 128, 1)',    // Gray border for Influencer
                        'rgba(37, 99, 235, 1)'       // Blue border for DTC Newsletter
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    yAxisID: 'y'
                },
                {
                    label: 'ROI Multiple (x)',
                    data: initialData.rois,
                    backgroundColor: [
                        'rgba(156, 163, 175, 0.7)',  // Gray for Meta
                        'rgba(156, 163, 175, 0.7)',  // Gray for Google
                        'rgba(156, 163, 175, 0.7)',  // Gray for Influencer
                        'rgba(37, 99, 235, 0.8)'     // Blue for DTC Newsletter
                    ],
                    borderColor: [
                        'rgba(107, 114, 128, 1)',    // Gray border for Meta
                        'rgba(107, 114, 128, 1)',    // Gray border for Google
                        'rgba(107, 114, 128, 1)',    // Gray border for Influencer
                        'rgba(37, 99, 235, 1)'       // Blue border for DTC Newsletter
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
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
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
                        color: '#1F2937'
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
                        color: '#1F2937'
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
