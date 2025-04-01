// GoPhish API Configuration
const API_BASE_URL = '/api';
const API_KEY = '62eebca8cceddcfc38bb24b0527ae43d439e8ab0e95f2fdf36ffc9f84fc59528';

// API Helper Function
async function apiRequest(endpoint, method = 'GET', data = null) {
    // Add trailing slash if needed
    if (!endpoint.endsWith('/')) {
        endpoint = endpoint + '/';
    }
    
    const url = `${API_BASE_URL}/${endpoint}`;
    
    const options = {
        method: method,
        headers: {
            'Authorization': API_KEY,
            'Content-Type': 'application/json'
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Request Failed:', error);
        showToast('API Error', error.message, 'error');
        return null;
    }
}

// API Functions for different GoPhish resources
async function fetchCampaigns() {
    return await apiRequest('campaigns');
}

async function fetchGroups() {
    return await apiRequest('groups');
}

async function fetchTemplates() {
    return await apiRequest('templates');
}

async function fetchLandingPages() {
    return await apiRequest('pages');
}

async function fetchSendingProfiles() {
    return await apiRequest('smtp');
}

// DOM Elements and Global Variables
let isDarkMode = false;
let chartsInitialized = false;
let loadingTimeout;

document.addEventListener('DOMContentLoaded', function() {
    // Show loading screen
    showLoading();
    
    // Test API connection
    fetchCampaigns().then(campaigns => {
        console.log('GoPhish Campaigns:', campaigns);
        
        // Initialize components with proper timing
        setTimeout(() => {
            // Core functionality
            initTheme();
            initNavigation();
            initTabs();
            initUIInteractions();
            
            // Advanced visualizations with actual data
            initDashboardCharts(campaigns);
            
            // Hide loading screen
            hideLoading();
            
            // Show welcome toast
            showToast('Welcome to PhishGuard', 'Connected to GoPhish API successfully', 'success');
        }, 800);
    }).catch(error => {
        console.error('API Error:', error);
        
        // Continue initialization even if API fails
        setTimeout(() => {
            // Core functionality
            initTheme();
            initNavigation();
            initTabs();
            initUIInteractions();
            
            // Initialize charts with no data
            initDashboardCharts(null);
            
            // Hide loading screen
            hideLoading();
            
            // Show error toast
            showToast('API Connection Error', 'Could not connect to GoPhish API', 'error');
        }, 800);
    });
});

// Loading Management
function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
    
    // Set timeout for loading (fallback)
    loadingTimeout = setTimeout(() => {
        hideLoading();
    }, 5000);
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
    }
    
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
    }
}

// Theme Management
function initTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    const storedTheme = localStorage.getItem('phishguard-theme');
    
    // Set theme from localStorage if available
    if (storedTheme) {
        setTheme(storedTheme);
    }
    
    // Theme toggle event
    if (themeSwitch) {
        themeSwitch.addEventListener('click', toggleTheme);
    }
    
    // Theme option selection in settings
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            setTheme(this.getAttribute('data-theme'));
        });
    });
    
    // Color accent options
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            setAccentColor(this.getAttribute('data-color'));
        });
    });
}

function toggleTheme() {
    const htmlElement = document.documentElement;
    const themeIcon = document.querySelector('.theme-switch i');
    
    if (htmlElement.getAttribute('data-theme') === 'dark') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

function setTheme(theme) {
    const htmlElement = document.documentElement;
    const themeIcon = document.querySelector('.theme-switch i');
    
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('phishguard-theme', theme);
    
    if (theme === 'dark') {
        isDarkMode = true;
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
    } else {
        isDarkMode = false;
        if (themeIcon) {
            themeIcon.className = 'fas fa-moon';
        }
    }
    
    // Update charts if they're already initialized
    if (chartsInitialized) {
        updateChartsTheme();
    }
}

function setAccentColor(color) {
    const root = document.documentElement;
    root.style.setProperty('--primary', color);
    
    // Create darker shade for hover
    const darkerColor = adjustColor(color, -30);
    root.style.setProperty('--primary-dark', darkerColor);
    
    // Create lighter shade for light variant
    const lighterColor = adjustColor(color, 40, true);
    root.style.setProperty('--primary-light', lighterColor);
    
    localStorage.setItem('phishguard-accent-color', color);
}

function adjustColor(hex, amount, lighten = false) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    if (lighten) {
        r = Math.min(255, r + amount);
        g = Math.min(255, g + amount);
        b = Math.min(255, b + amount);
    } else {
        r = Math.max(0, r + amount);
        g = Math.max(0, g + amount);
        b = Math.max(0, b + amount);
    }
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.content-section');
    const pageTitle = document.querySelector('.page-title');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show loading
            showLoading();
            
            setTimeout(() => {
                // Update active state in navigation
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding section
                const targetSection = this.getAttribute('data-section');
                pageSections.forEach(section => section.classList.remove('active'));
                document.getElementById(`${targetSection}-section`).classList.add('active');
                
                // Update page title
                updatePageTitle(targetSection);
                
                // Hide loading
                hideLoading();
            }, 300);
        });
    });
    
    function updatePageTitle(section) {
        const titles = {
            'dashboard': 'Dashboard Overview',
            'campaigns': 'Campaign Management',
            'employees': 'Employee Management',
            'simulator': 'Email Inbox Simulator',
            'training': 'Training Modules',
            'reports': 'Reports & Analytics',
            'compliance': 'GRC Compliance',
            'settings': 'Platform Settings'
        };
        
        if (pageTitle) {
            pageTitle.textContent = titles[section] || 'Dashboard';
        }
    }
}

// Tab functionality
function initTabs() {
    const tabContainers = document.querySelectorAll('.tabs');
    
    tabContainers.forEach(container => {
        const tabs = container.querySelectorAll('.tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Update active state in tabs
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding content
                const targetContent = this.getAttribute('data-tab');
                const parentSection = container.closest('section');
                const tabContents = parentSection.querySelectorAll('.tab-content');
                
                // Fade out and fade in animation
                tabContents.forEach(content => {
                    if (content.classList.contains('active')) {
                        content.style.opacity = '0';
                        setTimeout(() => {
                            content.classList.remove('active');
                            const newActiveContent = parentSection.querySelector(`#${targetContent}-content`);
                            if (newActiveContent) {
                                newActiveContent.classList.add('active');
                                newActiveContent.style.opacity = '0';
                                setTimeout(() => {
                                    newActiveContent.style.opacity = '1';
                                }, 50);
                            }
                        }, 200);
                    }
                });
            });
        });
    });
}

// Update campaigns table with real data
function updateCampaignsTable(campaigns) {
    console.log("Complete campaign data:", JSON.stringify(campaigns, null, 2));
    console.log("Updating campaigns table with:", campaigns);
    const tableBody = document.querySelector('#active-campaigns-content .data-table tbody');
    
    if (!tableBody || !campaigns) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add data rows
    if (campaigns.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="8" style="text-align: center;">No active campaigns found</td>`;
        tableBody.appendChild(emptyRow);
    } else {
        campaigns.forEach(campaign => {
            const row = document.createElement('tr');
            
            // Calculate progress based on time
            let progress = 0;
            if (campaign.launch_date) {
                const start = new Date(campaign.launch_date);
                const now = new Date();
                const elapsed = now - start;
                const daysSinceStart = elapsed / (1000 * 60 * 60 * 24);
                // Assume a 30-day campaign by default
                progress = Math.min(100, Math.max(0, Math.round(daysSinceStart / 30 * 100)));
            }
            
            // Calculate success rate if stats exist
            let successRate = '0%';
            if (campaign.stats) {
                const sent = campaign.stats.sent || 0;
                const clicked = campaign.stats.clicked || 0;
                successRate = sent > 0 ? `${((clicked / sent) * 100).toFixed(1)}%` : '0%';
            }
            
            // Format dates
            const startDate = campaign.launch_date ? new Date(campaign.launch_date).toLocaleDateString() : 'N/A';
            // Use completed_date if available, otherwise assume 30 days after launch
            let endDate = 'Ongoing';
            if (campaign.completed_date) {
                endDate = new Date(campaign.completed_date).toLocaleDateString();
            } else if (campaign.launch_date) {
                const endDateObj = new Date(campaign.launch_date);
                endDateObj.setDate(endDateObj.getDate() + 30);
                endDate = endDateObj.toLocaleDateString();
            }
            
            row.innerHTML = `
                <td>${campaign.name}</td>
                <td>${campaign.groups && campaign.groups.length > 0 ? campaign.groups.map(g => g.name).join(', ') : 'All Users'}</td>
                <td><span class="status-badge in-progress">In Progress</span></td>
                <td>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">${progress}%</div>
                </td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td>${successRate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" title="View Details" data-tooltip="View campaign details"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon" title="Edit Campaign" data-tooltip="Edit campaign settings"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon" title="Pause Campaign" data-tooltip="Pause campaign"><i class="fas fa-pause"></i></button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
}

// Advanced Dashboard Charts
async function initDashboardCharts(campaigns) {
    try {
        // If campaigns weren't passed in, try to fetch them
        if (!campaigns) {
            campaigns = await fetchCampaigns();
            console.log('Fetched campaigns:', campaigns);
        }
        
        // Update campaign table with real data
        updateCampaignsTable(campaigns);
        
        // Update dashboard metrics with real data if available
        if (campaigns && campaigns.length > 0) {
            updateDashboardMetrics(campaigns);
        }
        
        // Only initialize charts if the elements exist
        const securityPostureGauge = document.getElementById('securityPostureGauge');
        if (securityPostureGauge) {
            initSecurityPostureGauge(campaigns);
        }
        
        const campaignPerformanceChart = document.getElementById('campaignPerformanceChart');
        if (campaignPerformanceChart) {
            initCampaignPerformanceChart(campaigns);
        }
        
        const vulnerabilityChart = document.getElementById('vulnerabilityChart');
        if (vulnerabilityChart) {
            initVulnerabilityChart(campaigns);
        }
        
        const trainingFunnelChart = document.getElementById('trainingFunnelChart');
        if (trainingFunnelChart) {
            initTrainingFunnelChart();
        }
        
        // Mark charts as initialized
        chartsInitialized = true;
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        showToast('Error', 'Failed to load dashboard data', 'error');
    }
}

// Helper function to update metrics with real data
function updateDashboardMetrics(campaigns) {
    // Update active campaigns count
    const activeCampaignsMetric = document.querySelector('.metric-card:nth-child(1) .metric-value');
    if (activeCampaignsMetric) {
        const activeCampaigns = campaigns.filter(c => c.status === 'In progress' || !c.completed_date);
        activeCampaignsMetric.textContent = activeCampaigns.length.toString();
    }
    
    // Update phishing success rate if data available
    const phishingRateMetric = document.querySelector('.metric-card:nth-child(2) .metric-value');
    if (phishingRateMetric && campaigns.length > 0) {
        let totalSent = 0;
        let totalClicked = 0;
        
        campaigns.forEach(campaign => {
            if (campaign.stats) {
                totalSent += campaign.stats.sent || 0;
                totalClicked += campaign.stats.clicked || 0;
            }
        });
        
        if (totalSent > 0) {
            const clickRate = (totalClicked / totalSent * 100).toFixed(1);
            phishingRateMetric.textContent = clickRate + '%';
        }
    }
    
    // Update training completion if available 
    const trainingMetric = document.querySelector('.metric-card:nth-child(3) .metric-value');
    if (trainingMetric) {
        // Reset to zero since we don't have real training data yet
        trainingMetric.textContent = '0%';
    }
    
    // Update risk score if available
    const riskMetric = document.querySelector('.metric-card:nth-child(4) .metric-value');
    if (riskMetric) {
        // Real risk score calculation would go here
        // For now, keep it at the default value
    }
}

function initSecurityPostureGauge(campaigns) {
    const element = document.getElementById('securityPostureGauge');
    if (!element) return;

    // Calculate a score based on campaign data or use a default value
    let score = 50; // default score
    
    if (campaigns && campaigns.length > 0) {
        // Simple scoring example: based on click rates
        let totalSent = 0;
        let totalClicked = 0;
        
        campaigns.forEach(campaign => {
            if (campaign.stats) {
                totalSent += campaign.stats.sent || 0;
                totalClicked += campaign.stats.clicked || 0;
            }
        });
        
        if (totalSent > 0) {
            const clickRate = (totalClicked / totalSent) * 100;
            // Higher click rate = lower security score
            score = Math.max(10, Math.min(90, 100 - clickRate));
        }
    }

    const options = {
        series: [Math.round(score)],
        chart: {
            height: 250,
            type: 'radialBar',
            offsetY: -10,
            foreColor: isDarkMode ? '#e0e0e0' : '#333333'
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                hollow: {
                    margin: 0,
                    size: '70%',
                    background: isDarkMode ? '#2a2a2a' : '#fff',
                    image: undefined,
                    imageOffsetX: 0,
                    imageOffsetY: 0,
                    position: 'front'
                },
                track: {
                    background: isDarkMode ? '#444444' : '#f2f2f2',
                    strokeWidth: '67%',
                    margin: 0
                },
                dataLabels: {
                    show: true,
                    name: {
                        show: true,
                        fontSize: '14px',
                        fontWeight: 600,
                        offsetY: -10,
                        color: isDarkMode ? '#e0e0e0' : '#333333'
                    },
                    value: {
                        formatter: function(val) {
                            return parseInt(val) + "/100";
                        },
                        color: isDarkMode ? '#e0e0e0' : '#333333',
                        fontSize: '24px',
                        fontWeight: 700,
                        offsetY: 5
                    }
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: ['#34a853'],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            }
        },
        stroke: {
            lineCap: 'round'
        },
        labels: ['Security Posture'],
        colors: ['#fbbc05'],
        states: {
            hover: {
                filter: {
                    type: 'none'
                }
            }
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light'
        }
    };

    try {
        const chart = new ApexCharts(element, options);
        chart.render();
        
        // Add animation
        setTimeout(() => {
            chart.updateSeries([Math.round(score)]);
        }, 500);
    } catch (error) {
        console.error('Error rendering Security Posture Gauge:', error);
    }
}

function initCampaignPerformanceChart(campaigns) {
    const element = document.getElementById('campaignPerformanceChart');
    if (!element) return;
    
    // Default empty data
    let seriesData = [
        {
            name: 'Click Rate',
            data: []
        },
        {
            name: 'Report Rate',
            data: []
        }
    ];
    
    let categories = [];
    
    // If we have campaign data, use it
    if (campaigns && campaigns.length > 0) {
        // Sort campaigns by date
        const sortedCampaigns = [...campaigns].sort((a, b) => {
            return new Date(a.launch_date) - new Date(b.launch_date);
        });
        
        // Take up to 6 most recent campaigns
        const recentCampaigns = sortedCampaigns.slice(-6);
        
        const clickRates = recentCampaigns.map(campaign => {
            if (campaign.stats && campaign.stats.sent > 0) {
                return parseFloat(((campaign.stats.clicked / campaign.stats.sent) * 100).toFixed(1));
            }
            return 0;
        });
        
        const reportRates = recentCampaigns.map(campaign => {
            if (campaign.stats && campaign.stats.sent > 0) {
                return parseFloat(((campaign.stats.reported / campaign.stats.sent) * 100).toFixed(1));
            }
            return 0;
        });
        
        // Only use real data if we have points
        if (clickRates.length > 0) {
            seriesData = [
                {
                    name: 'Click Rate',
                    data: clickRates
                },
                {
                    name: 'Report Rate',
                    data: reportRates
                }
            ];
            
            // Use campaign names for categories
            categories = recentCampaigns.map(c => {
                // Truncate long names
                return c.name.length > 10 ? c.name.substring(0, 10) + '...' : c.name;
            });
        }
    }
    
    // If no campaigns, show empty state
    if (categories.length === 0) {
        categories = ['No Data'];
        seriesData = [
            {
                name: 'Click Rate',
                data: [0]
            },
            {
                name: 'Report Rate',
                data: [0]
            }
        ];
    }
    
    const options = {
        series: seriesData,
        chart: {
            type: 'area',
            height: 350,
            zoom: {
                enabled: false
            },
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false
                }
            },
            foreColor: isDarkMode ? '#e0e0e0' : '#333333'
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        colors: ['#ea4335', '#34a853'],
        fill: {
            type: 'gradient',
            gradient: {
                opacityFrom: 0.3,
                opacityTo: 0.1
            }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: isDarkMode ? '#e0e0e0' : '#333333'
                }
            }
        },
        yaxis: {
            labels: {
                formatter: function(val) {
                    return val + '%';
                },
                style: {
                    colors: isDarkMode ? '#e0e0e0' : '#333333'
                }
            }
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
            y: {
                formatter: function(val) {
                    return val + '%';
                }
            }
        },
        grid: {
            borderColor: isDarkMode ? '#444444' : '#e0e0e0'
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            labels: {
                colors: isDarkMode ? '#e0e0e0' : '#333333'
            }
        }
    };

    try {
        const chart = new ApexCharts(element, options);
        chart.render();
    } catch (error) {
        console.error('Error rendering Campaign Performance Chart:', error);
    }
}

function initVulnerabilityChart() {
    const element = document.getElementById('vulnerabilityChart');
    if (!element) return;
    
    // We don't have real department data yet, so keeping this minimal
    const options = {
        series: [{
            name: 'Vulnerability Score',
            data: [0, 0, 0, 0, 0, 0]
        }],
        chart: {
            type: 'bar',
            height: 250,
            toolbar: {
                show: false
            },
            foreColor: isDarkMode ? '#e0e0e0' : '#333333'
        },
        plotOptions: {
            bar: {
                columnWidth: '60%',
                borderRadius: 5,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return val + '%';
            },
            offsetY: -20,
            style: {
                fontSize: '12px',
                colors: [isDarkMode ? '#e0e0e0' : '#333333']
            }
        },
        colors: ['#1a73e8'],
        xaxis: {
            categories: ['Executive', 'IT', 'Finance', 'HR', 'Marketing', 'Sales'],
            labels: {
                style: {
                    colors: isDarkMode ? '#e0e0e0' : '#333333'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            max: 50,
            labels: {
                formatter: function(val) {
                    return val + '%';
                },
                style: {
                    colors: isDarkMode ? '#e0e0e0' : '#333333'
                }
            }
        },
        grid: {
            borderColor: isDarkMode ? '#444444' : '#e0e0e0'
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
            y: {
                formatter: function(val) {
                    return val + '% vulnerability';
                }
            }
        }
    };

    try {
        const chart = new ApexCharts(element, options);
        chart.render();
    } catch (error) {
        console.error('Error rendering Vulnerability Chart:', error);
    }
}

function initTrainingFunnelChart() {
    const element = document.getElementById('trainingFunnelChart');
    if (!element) return;
    
    // No real training data yet, so using 0s
    const options = {
        series: [
            {
                name: 'Employees',
                data: [0, 0, 0, 0, 0]
            }
        ],
        chart: {
            type: 'bar',
            height: 250,
            toolbar: {
                show: false
            },
            foreColor: isDarkMode ? '#e0e0e0' : '#333333'
        },
        plotOptions: {
            bar: {
                horizontal: true,
                distributed: true,
                dataLabels: {
                    position: 'bottom'
                },
                barHeight: '60%',
                startingShape: 'flat',
                endingShape: 'flat'
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return val;
            },
            textAnchor: 'start',
            offsetX: 5,
            style: {
                fontSize: '12px',
                colors: ['#fff']
            },
            background: {
                enabled: false
            }
        },
        colors: [
            '#1a73e8', 
            '#34a853', 
            '#ea4335', 
            '#fbbc05', 
            '#4285f4'
        ],
        xaxis: {
            categories: [
                'Assigned', 
                'Started', 
                'In Progress', 
                'Completed', 
                'Passed'
            ],
            labels: {
                style: {
                    colors: isDarkMode ? '#e0e0e0' : '#333333'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: isDarkMode ? '#e0e0e0' : '#333333'
                }
            }
        },
        grid: {
            borderColor: isDarkMode ? '#444444' : '#e0e0e0'
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
            y: {
                formatter: function(val) {
                    return val + ' employees';
                }
            }
        }
    };

    try {
        const chart = new ApexCharts(element, options);
        chart.render();
    } catch (error) {
        console.error('Error rendering Training Funnel Chart:', error);
    }
}

// Update chart themes when dark mode changes
function updateChartsTheme() {
    // Recreate charts with the new theme
    fetchCampaigns().then(campaigns => {
        initDashboardCharts(campaigns);
    }).catch(error => {
        console.error('Failed to fetch campaigns for theme update:', error);
        initDashboardCharts(null);
    });
}

// UI Interactions
function initUIInteractions() {
    // Connect New Campaign button to the campaign creation modal
    const newCampaignBtn = document.querySelector('.btn.btn-primary.pulsate-once');
    if (newCampaignBtn) {
        newCampaignBtn.addEventListener('click', function() {
            showCampaignModal();
        });
    }

    // Email Simulator - Template Selection
    const templateItems = document.querySelectorAll('.template-item');
    templateItems.forEach(item => {
        item.addEventListener('click', function() {
            templateItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Toggle switches
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const label = this.nextElementSibling.nextElementSibling;
            if (this.checked) {
                label.textContent = 'Enabled';
                showToast('Setting Updated', 'Feature has been enabled', 'success');
            } else {
                label.textContent = 'Disabled';
                showToast('Setting Updated', 'Feature has been disabled', 'info');
            }
        });
    });
    
    // Checkboxes in tables
    const tableHeaderCheckboxes = document.querySelectorAll('table thead input[type="checkbox"]');
    tableHeaderCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const table = this.closest('table');
            const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = this.checked;
            });
            
            if (this.checked) {
                showToast('Selection Changed', `Selected ${checkboxes.length} items`, 'info');
            } else {
                showToast('Selection Changed', 'All items deselected', 'info');
            }
        });
    });
    
    // Campaign Progress Animation
    animateProgressBars();
    
    // Circular Progress Animation
    animateCircleProgress();
    
    // Add hover effects to action buttons
    addTooltipHoverEffects();
    
    // Modal functionality
    initModalFunctionality();
    
    // Add notification interactions
    initNotificationInteractions();
}

// Show Campaign Modal
function showCampaignModal() {
    // First, check if the modal exists
    const modal = document.getElementById('new-campaign-modal');
    if (!modal) {
        // Create a modal if it doesn't exist
        createCampaignModal();
    } else {
        // Show the existing modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Create Campaign Modal
function createCampaignModal() {
    // First fetch groups and templates for the form
    Promise.all([fetchGroups(), fetchTemplates(), fetchLandingPages(), fetchSendingProfiles()])
        .then(([groups, templates, pages, profiles]) => {
            // Create modal HTML
            const modalHtml = `
                <div class="modal" id="new-campaign-modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Create New Campaign</h2>
                            <button class="close-modal"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="modal-body">
                            <form id="new-campaign-form">
                                <div class="form-group">
                                    <label for="campaign-name">Campaign Name</label>
                                    <input type="text" id="campaign-name" name="name" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="campaign-group">Target Group</label>
                                    <select id="campaign-group" name="group" required>
                                        <option value="">Select a group</option>
                                        ${groups && groups.map(group => `
                                            <option value="${group.id}">${group.name}</option>
                                        `).join('') || ''}
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="campaign-template">Email Template</label>
                                    <select id="campaign-template" name="template" required>
                                        <option value="">Select a template</option>
                                        ${templates && templates.map(template => `
                                            <option value="${template.id}">${template.name}</option>
                                        `).join('') || ''}
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="campaign-page">Landing Page</label>
                                    <select id="campaign-page" name="page" required>
                                        <option value="">Select a landing page</option>
                                        ${pages && pages.map(page => `
                                            <option value="${page.id}">${page.name}</option>
                                        `).join('') || ''}
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="campaign-profile">Sending Profile</label>
                                    <select id="campaign-profile" name="profile" required>
                                        <option value="">Select a sending profile</option>
                                        ${profiles && profiles.map(profile => `
                                            <option value="${profile.id}">${profile.name}</option>
                                        `).join('') || ''}
                                    </select>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="campaign-launch-date">Launch Date</label>
                                        <input type="date" id="campaign-launch-date" name="launch_date" required>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="campaign-launch-time">Launch Time</label>
                                        <input type="time" id="campaign-launch-time" name="launch_time" required>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-outline" id="cancel-campaign">Cancel</button>
                            <button class="btn btn-primary" id="create-campaign">Create Campaign</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add modal to the DOM
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Add event listeners
            initModalFunctionality();
            
            // Show the modal
            const modal = document.getElementById('new-campaign-modal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                // Set default launch date to tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                const launchDateInput = document.getElementById('campaign-launch-date');
                if (launchDateInput) {
                    launchDateInput.valueAsDate = tomorrow;
                }
                
                // Add form submission handler
                const createBtn = document.getElementById('create-campaign');
                const cancelBtn = document.getElementById('cancel-campaign');
                
                if (createBtn) {
                    createBtn.addEventListener('click', handleCampaignSubmit);
                }
                
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', function() {
                        modal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error fetching data for campaign modal:', error);
            showToast('Error', 'Failed to load campaign form data', 'error');
        });
}

// Handle Campaign Form Submission
function handleCampaignSubmit() {
    const form = document.getElementById('new-campaign-form');
    if (!form) return;
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Get form data
    const name = document.getElementById('campaign-name').value;
    const groupId = document.getElementById('campaign-group').value;
    const templateId = document.getElementById('campaign-template').value;
    const pageId = document.getElementById('campaign-page').value;
    const profileId = document.getElementById('campaign-profile').value;
    const launchDate = document.getElementById('campaign-launch-date').value;
    const launchTime = document.getElementById('campaign-launch-time').value;
    
    // Combine date and time
    const launchDateTime = new Date(`${launchDate}T${launchTime}`);
    
    // Prepare campaign data
    const campaignData = {
        name: name,
        groups: [{ id: parseInt(groupId) }],
        template: { id: parseInt(templateId) },
        page: { id: parseInt(pageId) },
        smtp: { id: parseInt(profileId) },
        launch_date: launchDateTime.toISOString()
    };
    
    // Show loading
    showLoading();
    
    // Submit to API
    apiRequest('campaigns', 'POST', campaignData)
        .then(response => {
            hideLoading();
            
            // Close modal
            const modal = document.getElementById('new-campaign-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            // Show success message
            showToast('Success', 'Campaign created successfully', 'success');
            
            // Refresh campaign data
            refreshCampaigns();
        })
        .catch(error => {
            hideLoading();
            console.error('Error creating campaign:', error);
            showToast('Error', 'Failed to create campaign', 'error');
        });
}

// Function to create a new campaign
async function createCampaign(campaignData) {
    return await apiRequest('campaigns', 'POST', campaignData);
}

// Refresh Campaigns
function refreshCampaigns() {
    fetchCampaigns()
        .then(campaigns => {
            updateCampaignsTable(campaigns);
            updateDashboardMetrics(campaigns);
        })
        .catch(error => {
            console.error('Error refreshing campaigns:', error);
        });
}

// Animate progress bars
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar .progress');
    progressBars.forEach(progress => {
        const width = progress.style.width;
        progress.style.width = '0';
        setTimeout(() => {
            progress.style.transition = 'width 1s ease-in-out';
            progress.style.width = width;
        }, 300);
    });
}

// Animate circle progress
function animateCircleProgress() {
    const circles = document.querySelectorAll('.circle-progress');
    circles.forEach(circle => {
        const progress = circle.getAttribute('data-progress');
        const circlePath = circle.querySelector('.circle');
        
        if (circlePath) {
            circlePath.style.strokeDasharray = '0, 100';
            setTimeout(() => {
                circlePath.style.transition = 'stroke-dasharray 1.5s ease-in-out';
                circlePath.style.strokeDasharray = `${progress}, 100`;
            }, 500);
        }
    });
}

// Add tooltip hover effects
function addTooltipHoverEffects() {
    const buttons = document.querySelectorAll('.btn-icon[data-tooltip]');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// Notification interactions
function initNotificationInteractions() {
    const notificationsIcon = document.querySelector('.notifications i');
    const notificationItems = document.querySelectorAll('.notification-item');
    
    // Mark notifications as read when clicked
    notificationItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.remove('unread');
            updateNotificationCount();
        });
    });
    
    // Update notification count badge
    function updateNotificationCount() {
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        const badge = document.querySelector('.notifications .badge');
        
        if (badge) {
            badge.textContent = unreadCount;
            if (unreadCount === 0) {
                badge.style.display = 'none';
            } else {
                badge.style.display = 'inline-block';
            }
        }
    }
    
    // Clear all notifications
    const markAllReadBtn = document.querySelector('.notification-header .btn-text');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            notificationItems.forEach(item => {
                item.classList.remove('unread');
            });
            
            updateNotificationCount();
            showToast('Notifications', 'All notifications marked as read', 'success');
        });
    }
}

// Modal functionality
function initModalFunctionality() {
    // Open modal buttons
    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
}

// Toast Notifications
function showToast(title, message, type = 'info', duration = 5000) {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Define icons based on toast type
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Add click event to close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', function() {
        removeToast(toast);
    });
    
    // Auto-remove after duration
    setTimeout(() => {
        removeToast(toast);
    }, duration);
}

function removeToast(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}