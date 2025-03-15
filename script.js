// DOM Elements and Global Variables
let isDarkMode = false;
let chartsInitialized = false;
let loadingTimeout;

document.addEventListener('DOMContentLoaded', function() {
    // Show loading screen
    showLoading();
    
    // Initialize components with proper timing
    setTimeout(() => {
        // Core functionality
        initTheme();
        initNavigation();
        initTabs();
        initUIInteractions();
        
        // Advanced visualizations
        initDashboardCharts();
        initReportCharts();
        initAdvancedCharts();
        
        // Hide loading screen
        hideLoading();
        
        // Show welcome toast
        showToast('Welcome to PhishGuard', 'Security awareness platform loaded successfully', 'success');
    }, 800);
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
                            newActiveContent.classList.add('active');
                            newActiveContent.style.opacity = '0';
                            setTimeout(() => {
                                newActiveContent.style.opacity = '1';
                            }, 50);
                        }, 200);
                    }
                });
            });
        });
    });
}

// Advanced Dashboard Charts
function initDashboardCharts() {
    initSecurityPostureGauge();
    initCampaignPerformanceChart();
    initVulnerabilityChart();
    initTrainingFunnelChart();
    
    // Mark charts as initialized
    chartsInitialized = true;
}

function initSecurityPostureGauge() {
    const element = document.getElementById('securityPostureGauge');
    if (!element) return;
    
    const options = {
        series: [72],
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

    const chart = new ApexCharts(element, options);
    chart.render();
    
    // Add animation
    setTimeout(() => {
        chart.updateSeries([72]);
    }, 500);
}

function initCampaignPerformanceChart() {
    const element = document.getElementById('campaignPerformanceChart');
    if (!element) return;
    
    const options = {
        series: [
            {
                name: 'Click Rate',
                data: [32, 29, 25, 20, 18, 15]
            },
            {
                name: 'Report Rate',
                data: [5, 8, 12, 18, 25, 32]
            }
        ],
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
            categories: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
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

    const chart = new ApexCharts(element, options);
    chart.render();
}

function initVulnerabilityChart() {
    const element = document.getElementById('vulnerabilityChart');
    if (!element) return;
    
    const options = {
        series: [{
            name: 'Vulnerability Score',
            data: [25, 12, 18, 27, 35, 28]
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

    const chart = new ApexCharts(element, options);
    chart.render();
}

function initTrainingFunnelChart() {
    const element = document.getElementById('trainingFunnelChart');
    if (!element) return;
    
    const options = {
        series: [
            {
                name: 'Employees',
                data: [500, 400, 350, 300, 250]
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

    const chart = new ApexCharts(element, options);
    chart.render();
}

// Advanced Charts for Reports
function initReportCharts() {
    if (document.getElementById('campaignEffectivenessChart')) {
        const effectivenessCtx = document.getElementById('campaignEffectivenessChart');
        new ApexCharts(effectivenessCtx, {
            series: [
                {
                    name: 'Phishing Success Rate',
                    data: [38, 35, 32, 28, 25, 22, 18, 15]
                },
                {
                    name: 'Training Effectiveness',
                    data: [40, 45, 50, 60, 65, 70, 78, 82]
                }
            ],
            chart: {
                type: 'area',
                height: 350,
                toolbar: {
                    show: true
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
            fill: {
                type: 'gradient',
                gradient: {
                    opacityFrom: 0.3,
                    opacityTo: 0.1
                }
            },
            colors: ['#ea4335', '#34a853'],
            xaxis: {
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
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
                theme: isDarkMode ? 'dark' : 'light'
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
        }).render();
    }
    
    if (document.getElementById('attackVectorChart')) {
        const vectorCtx = document.getElementById('attackVectorChart');
        new ApexCharts(vectorCtx, {
            series: [
                {
                    name: 'Success Rate',
                    data: [65, 40, 35, 50, 75, 45]
                }
            ],
            chart: {
                type: 'radar',
                height: 350,
                toolbar: {
                    show: false
                },
                foreColor: isDarkMode ? '#e0e0e0' : '#333333'
            },
            xaxis: {
                categories: ['Password Reset', 'Account Alert', 'Invoice', 'Shared Document', 'Executive Request', 'IT Support'],
                labels: {
                    style: {
                        colors: Array(6).fill(isDarkMode ? '#e0e0e0' : '#333333')
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
            fill: {
                opacity: 0.2
            },
            stroke: {
                width: 3
            },
            markers: {
                size: 5
            },
            dataLabels: {
                enabled: true,
                background: {
                    enabled: true,
                    borderRadius: 2
                }
            },
            colors: ['#4285f4'],
            tooltip: {
                theme: isDarkMode ? 'dark' : 'light',
                y: {
                    formatter: function(val) {
                        return val + '% success rate';
                    }
                }
            },
            grid: {
                borderColor: isDarkMode ? '#444444' : '#e0e0e0'
            }
        }).render();
    }
    
    if (document.getElementById('riskScoreChart')) {
        const riskCtx = document.getElementById('riskScoreChart');
        new ApexCharts(riskCtx, {
            series: [
                {
                    name: 'Risk Score',
                    data: [78, 75, 70, 68, 65, 62]
                }
            ],
            chart: {
                type: 'line',
                height: 350,
                toolbar: {
                    show: false
                },
                foreColor: isDarkMode ? '#e0e0e0' : '#333333'
            },
            stroke: {
                curve: 'straight',
                width: 3
            },
            annotations: {
                yaxis: [
                    {
                        y: 70,
                        borderColor: '#fbbc05',
                        label: {
                            text: 'Warning Threshold',
                            style: {
                                color: '#fff',
                                background: '#fbbc05'
                            }
                        }
                    }
                ]
            },
            markers: {
                size: 5
            },
            colors: ['#fbbc05'],
            xaxis: {
                categories: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                labels: {
                    style: {
                        colors: isDarkMode ? '#e0e0e0' : '#333333'
                    }
                }
            },
            yaxis: {
                min: 50,
                max: 100,
                labels: {
                    formatter: function(val) {
                        return val.toFixed(0);
                    },
                    style: {
                        colors: isDarkMode ? '#e0e0e0' : '#333333'
                    }
                }
            },
            tooltip: {
                theme: isDarkMode ? 'dark' : 'light'
            },
            grid: {
                borderColor: isDarkMode ? '#444444' : '#e0e0e0'
            }
        }).render();
    }
    
    if (document.getElementById('trainingEffectivenessChart')) {
        const trainingEffCtx = document.getElementById('trainingEffectivenessChart');
        new ApexCharts(trainingEffCtx, {
            series: [
                {
                    name: 'Before Training',
                    data: [65, 55, 70, 60]
                },
                {
                    name: 'After Training',
                    data: [25, 20, 35, 30]
                }
            ],
            chart: {
                type: 'bar',
                height: 350,
                toolbar: {
                    show: false
                },
                foreColor: isDarkMode ? '#e0e0e0' : '#333333'
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 5
                }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                labels: {
                    colors: isDarkMode ? '#e0e0e0' : '#333333'
                }
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: ['Phishing Basics', 'Password Security', 'Social Engineering', 'Mobile Security'],
                labels: {
                    style: {
                        colors: isDarkMode ? '#e0e0e0' : '#333333'
                    }
                }
            },
            yaxis: {
                max: 100,
                labels: {
                    formatter: function(val) {
                        return val + '%';
                    },
                    style: {
                        colors: isDarkMode ? '#e0e0e0' : '#333333'
                    }
                }
            },
            fill: {
                opacity: 1
            },
            colors: ['#ea4335', '#34a853'],
            tooltip: {
                theme: isDarkMode ? 'dark' : 'light',
                y: {
                    formatter: function(val) {
                        return val + '% vulnerability';
                    }
                }
            },
            grid: {
                borderColor: isDarkMode ? '#444444' : '#e0e0e0'
            }
        }).render();
    }
    
    if (document.getElementById('departmentComparisonChart')) {
        const deptCtx = document.getElementById('departmentComparisonChart');
        new ApexCharts(deptCtx, {
            series: [
                {
                    name: 'Oct 2024',
                    data: [42, 18, 35, 48, 55, 38]
                },
                {
                    name: 'Mar 2025',
                    data: [25, 8, 20, 30, 35, 22]
                }
            ],
            chart: {
                type: 'bar',
                height: 350,
                toolbar: {
                    show: false
                },
                foreColor: isDarkMode ? '#e0e0e0' : '#333333'
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 5
                }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                labels: {
                    colors: isDarkMode ? '#e0e0e0' : '#333333'
                }
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: ['Executive', 'IT', 'Finance', 'HR', 'Marketing', 'Sales'],
                labels: {
                    style: {
                        colors: isDarkMode ? '#e0e0e0' : '#333333'
                    }
                }
            },
            yaxis: {
                max: 100,
                labels: {
                    formatter: function(val) {
                        return val + '%';
                    },
                    style: {
                        colors: isDarkMode ? '#e0e0e0' : '#333333'
                    }
                }
            },
            fill: {
                opacity: 1
            },
            colors: ['#4285f4', '#34a853'],
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
            }
        }).render();
    }
    
    if (document.getElementById('remediationStatusChart')) {
        const remediationCtx = document.getElementById('remediationStatusChart');
        new ApexCharts(remediationCtx, {
            series: [40, 30, 20, 10],
            chart: {
                type: 'donut',
                height: 350,
                foreColor: isDarkMode ? '#e0e0e0' : '#333333'
            },
            labels: ['Completed', 'In Progress', 'Not Started', 'Overdue'],
            colors: ['#34a853', '#4285f4', '#aaaaaa', '#ea4335'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '60%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total Issues',
                                formatter: function (w) {
                                    return w.globals.seriesTotals.reduce((a, b) => {
                                        return a + b;
                                    }, 0);
                                }
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                position: 'bottom',
                labels: {
                    colors: isDarkMode ? '#e0e0e0' : '#333333'
                }
            },
            tooltip: {
                theme: isDarkMode ? 'dark' : 'light',
                y: {
                    formatter: function(val) {
                        return val + ' issues';
                    }
                }
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            height: 250
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            ]
        }).render();
    }
}

// Advanced Visualization Charts
function initAdvancedCharts() {
    initPhishingHeatmapChart();
    initAttackVectorNetworkChart();
}

function initPhishingHeatmapChart() {
    const element = document.getElementById('phishingHeatmapChart');
    if (!element) return;
    
    // Generate data for the heatmap
    function generateData(count, yrange) {
        let i = 0;
        let series = [];
        
        // Departments
        const departments = [
            'Executive', 
            'IT', 
            'Finance', 
            'HR', 
            'Marketing', 
            'Sales'
        ];
        
        // Higher click rates for executives
        const departmentMultipliers = {
            'Executive': 1.5,
            'IT': 0.5,
            'Finance': 1.2,
            'HR': 0.8,
            'Marketing': 1.3,
            'Sales': 1.1
        };
        
        while (i < count) {
            let week = i + 1;
            
            departments.forEach((dept, index) => {
                // Generate a click rate that trends downward over time
                // but varies by department based on multipliers
                let baseVal = Math.max(5, 30 - (i * 0.8));
                let mult = departmentMultipliers[dept];
                let y = baseVal * mult;
                
                // Add randomness
                y = y + (Math.random() * 10 - 5);
                y = Math.max(2, Math.min(y, 65));
                
                series.push({
                    x: `Week ${week}`,
                    y: dept,
                    value: Math.round(y)
                });
            });
            i++;
        }
        return series;
    }

    const options = {
        series: [
            {
                name: 'Click Rate %',
                data: generateData(12, {
                    min: 0,
                    max: 60
                })
            }
        ],
        chart: {
            height: 400,
            type: 'heatmap',
            toolbar: {
                show: true
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            },
            foreColor: isDarkMode ? '#e0e0e0' : '#333333'
        },
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#fff']
            }
        },
        colors: ["#1a73e8"],
        title: {
            text: 'Phishing Click Rate by Department and Time',
            align: 'center',
            style: {
                color: isDarkMode ? '#e0e0e0' : '#333333'
            }
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
            y: {
                formatter: function(val) {
                    return val + '% click rate';
                }
            }
        },
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                radius: 0,
                useFillColorAsStroke: true,
                colorScale: {
                    ranges: [
                        {
                            from: 0,
                            to: 10,
                            name: 'Low',
                            color: '#34a853'
                        },
                        {
                            from: 11,
                            to: 25,
                            name: 'Medium',
                            color: '#fbbc05'
                        },
                        {
                            from: 26,
                            to: 40,
                            name: 'High',
                            color: '#ea4335'
                        },
                        {
                            from: 41,
                            to: 100,
                            name: 'Critical',
                            color: '#990000'
                        }
                    ]
                }
            }
        },
        xaxis: {
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
        stroke: {
            width: 1
        },
        grid: {
            borderColor: isDarkMode ? '#444444' : '#e0e0e0'
        }
    };

    const chart = new ApexCharts(element, options);
    chart.render();
}

function initAttackVectorNetworkChart() {
    const element = document.getElementById('attackVectorNetworkChart');
    if (!element) return;
    
    // Create network graph using D3.js
    const width = element.clientWidth;
    const height = 400;
    
    // Create the SVG container
    const svg = d3.select(element)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Define the data for nodes and links
    const nodes = [
        // Attack vectors (source nodes)
        { id: 1, name: "Password Reset Emails", type: "attack", value: 65 },
        { id: 2, name: "Account Alerts", type: "attack", value: 40 },
        { id: 3, name: "Invoice Emails", type: "attack", value: 35 },
        { id: 4, name: "Shared Documents", type: "attack", value: 50 },
        { id: 5, name: "Executive Requests", type: "attack", value: 75 },
        { id: 6, name: "IT Support", type: "attack", value: 45 },
        
        // Departments (target nodes)
        { id: 7, name: "Executive", type: "dept" },
        { id: 8, name: "IT", type: "dept" },
        { id: 9, name: "Finance", type: "dept" },
        { id: 10, name: "HR", type: "dept" },
        { id: 11, name: "Marketing", type: "dept" },
        { id: 12, name: "Sales", type: "dept" }
    ];
    
    const links = [
        // Password Reset targets
        { source: 1, target: 7, value: 25 },
        { source: 1, target: 8, value: 12 },
        { source: 1, target: 9, value: 18 },
        { source: 1, target: 10, value: 20 },
        { source: 1, target: 11, value: 30 },
        { source: 1, target: 12, value: 25 },
        
        // Account Alerts targets
        { source: 2, target: 7, value: 15 },
        { source: 2, target: 9, value: 35 },
        { source: 2, target: 12, value: 20 },
        
        // Invoice Emails targets
        { source: 3, target: 7, value: 10 },
        { source: 3, target: 9, value: 40 },
        { source: 3, target: 11, value: 5 },
        
        // Shared Documents targets
        { source: 4, target: 7, value: 30 },
        { source: 4, target: 8, value: 10 },
        { source: 4, target: 10, value: 20 },
        { source: 4, target: 11, value: 25 },
        
        // Executive Requests targets
        { source: 5, target: 7, value: 45 },
        { source: 5, target: 9, value: 25 },
        { source: 5, target: 11, value: 15 },
        { source: 5, target: 12, value: 20 },
        
        // IT Support targets
        { source: 6, target: 7, value: 20 },
        { source: 6, target: 8, value: 5 },
        { source: 6, target: 10, value: 30 },
        { source: 6, target: 12, value: 15 }
    ];
    
    // Create a force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(0.1))
        .force("y", d3.forceY(height / 2).strength(0.1));
    
    // Define color scale for nodes
    const nodeColorScale = d3.scaleOrdinal()
        .domain(["attack", "dept"])
        .range([isDarkMode ? "#4285f4" : "#1a73e8", isDarkMode ? "#ea4335" : "#ea4335"]);
    
    // Define color and width scales for links
    const linkColorScale = d3.scaleLinear()
        .domain([0, 45])
        .range([isDarkMode ? "#444444" : "#999999", isDarkMode ? "#ff5252" : "#ea4335"]);
    
    const linkWidthScale = d3.scaleLinear()
        .domain([0, 45])
        .range([1, 5]);
    
    // Create the links
    const link = svg.append("g")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", d => linkColorScale(d.value))
        .attr("stroke-width", d => linkWidthScale(d.value));
    
    // Create the nodes
    const node = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .enter().append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    
    // Add circles to nodes
    node.append("circle")
        .attr("r", d => d.type === "attack" ? 10 + (d.value / 10) : 8)
        .attr("fill", d => nodeColorScale(d.type))
        .attr("stroke", isDarkMode ? "#333" : "#fff")
        .attr("stroke-width", 1.5);
    
    // Add text labels to nodes
    node.append("text")
        .attr("dx", d => d.type === "attack" ? 15 : 12)
        .attr("dy", ".35em")
        .text(d => d.name)
        .style("font-size", "12px")
        .style("fill", isDarkMode ? "#e0e0e0" : "#333");
    
    // Update positions in the simulation
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });
    
    // Define drag functions
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    // Create a legend
    const legend = svg.append("g")
        .attr("transform", "translate(20,20)");
    
    // Attack vector legend item
    legend.append("circle")
        .attr("r", 6)
        .attr("fill", nodeColorScale("attack"))
        .attr("stroke", isDarkMode ? "#333" : "#fff")
        .attr("stroke-width", 1.5);
    
    legend.append("text")
        .attr("x", 15)
        .attr("y", 4)
        .text("Attack Vector")
        .style("font-size", "12px")
        .style("fill", isDarkMode ? "#e0e0e0" : "#333");
    
    // Department legend item
    legend.append("circle")
        .attr("r", 6)
        .attr("cy", 25)
        .attr("fill", nodeColorScale("dept"))
        .attr("stroke", isDarkMode ? "#333" : "#fff")
        .attr("stroke-width", 1.5);
    
    legend.append("text")
        .attr("x", 15)
        .attr("y", 29)
        .text("Department")
        .style("font-size", "12px")
        .style("fill", isDarkMode ? "#e0e0e0" : "#333");
}

// Update chart themes when dark mode changes
function updateChartsTheme() {
    // Recreate all charts with the new theme
    initDashboardCharts();
    initReportCharts();
    initAdvancedCharts();
}

// UI Interactions
function initUIInteractions() {
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
        
        circlePath.style.strokeDasharray = '0, 100';
        setTimeout(() => {
            circlePath.style.transition = 'stroke-dasharray 1.5s ease-in-out';
            circlePath.style.strokeDasharray = `${progress}, 100`;
        }, 500);
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
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
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
        toast.remove();
    }, 300);
}

// Add fake real-time data updates
let updateCounter = 0;
let updateInterval = setInterval(() => {
    updateCounter++;
    
    // Update notification count
    if (updateCounter % 30 === 0) {
        const badge = document.querySelector('.notifications .badge');
        if (badge) {
            let count = parseInt(badge.textContent);
            count = (count + 1) % 10;
            badge.textContent = count;
            
            // Show notification toast
            showToast('New Notification', 'You have a new security alert to review', 'warning');
        }
    }
    
    // Randomly update a metric
    if (updateCounter % 15 === 0) {
        const metrics = document.querySelectorAll('.metric-value');
        if (metrics.length) {
            const randomMetric = metrics[Math.floor(Math.random() * metrics.length)];
            
            // Create a subtle pulse animation
            randomMetric.style.transition = 'transform 0.2s ease-in-out';
            randomMetric.style.transform = 'scale(1.05)';
            randomMetric.style.color = '#1a73e8';
            
            setTimeout(() => {
                randomMetric.style.transform = 'scale(1)';
                randomMetric.style.color = '';
            }, 500);
        }
    }
    
    // Add a new activity every 45 seconds
    if (updateCounter % 45 === 0) {
        addRandomActivity();
    }
    
    // Simulate a phishing alert after 20 seconds
    if (updateCounter === 20) {
        showPhishingAlert();
    }
}, 1000);

function addRandomActivity() {
    const activities = [
        {
            icon: 'fas fa-user-shield',
            title: 'Security Alert',
            desc: 'Multiple failed login attempts detected',
            time: 'Just now',
            class: 'bg-danger'
        },
        {
            icon: 'fas fa-graduation-cap',
            title: 'Training Milestone',
            desc: 'IT Department reached 90% completion rate',
            time: 'Just now',
            class: 'bg-success'
        },
        {
            icon: 'fas fa-rocket',
            title: 'Campaign Update',
            desc: 'Q1 Sales Campaign completed with 22% click rate',
            time: 'Just now',
            class: 'bg-primary'
        }
    ];
    
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        
        const newActivity = document.createElement('div');
        newActivity.className = 'activity-item';
        newActivity.innerHTML = `
            <div class="activity-icon ${randomActivity.class}">
                <i class="${randomActivity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${randomActivity.title}</div>
                <div class="activity-desc">${randomActivity.desc}</div>
                <div class="activity-time">${randomActivity.time}</div>
            </div>
        `;
        
        // Add animation class
        newActivity.style.opacity = '0';
        newActivity.style.transform = 'translateX(-10px)';
        
        // Insert at the top
        if (activityList.firstChild) {
            activityList.insertBefore(newActivity, activityList.firstChild);
        } else {
            activityList.appendChild(newActivity);
        }
        
        // Animation
        setTimeout(() => {
            newActivity.style.transition = 'all 0.3s ease-in-out';
            newActivity.style.opacity = '1';
            newActivity.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove last item if more than 4
        const items = activityList.querySelectorAll('.activity-item');
        if (items.length > 4) {
            items[items.length - 1].style.opacity = '0';
            items[items.length - 1].style.transform = 'translateX(10px)';
            
            setTimeout(() => {
                activityList.removeChild(items[items.length - 1]);
            }, 300);
        }
    }
}

// Demo simulation - Phishing alert simulation
function showPhishingAlert() {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = 'phishing-alert';
    alertElement.innerHTML = `
        <div class="phishing-alert-content">
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-message">
                <h3>High Risk Phishing Attempt Detected</h3>
                <p>Executive team is currently being targeted with a sophisticated spear phishing campaign.</p>
            </div>
            <div class="alert-actions">
                <button class="btn btn-outline alert-dismiss">Dismiss</button>
                <button class="btn btn-primary">View Details</button>
            </div>
        </div>
    `;
    
    // Add styles
    alertElement.style.position = 'fixed';
    alertElement.style.bottom = '30px';
    alertElement.style.right = '30px';
    alertElement.style.backgroundColor = isDarkMode ? '#2a2a2a' : 'white';
    alertElement.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
    alertElement.style.borderRadius = '10px';
    alertElement.style.zIndex = '1000';
    alertElement.style.width = '350px';
    alertElement.style.overflow = 'hidden';
    alertElement.style.transform = 'translateY(100%)';
    alertElement.style.opacity = '0';
    alertElement.style.transition = 'all 0.3s ease-in-out';
    
    // Alert content styles
    const contentStyle = alertElement.querySelector('.phishing-alert-content').style;
    contentStyle.padding = '20px';
    
    // Icon styles
    const iconStyle = alertElement.querySelector('.alert-icon').style;
    iconStyle.backgroundColor = 'rgba(234, 67, 53, 0.1)';
    iconStyle.color = '#EA4335';
    iconStyle.width = '50px';
    iconStyle.height = '50px';
    iconStyle.borderRadius = '50%';
    iconStyle.display = 'flex';
    iconStyle.alignItems = 'center';
    iconStyle.justifyContent = 'center';
    iconStyle.fontSize = '24px';
    iconStyle.marginBottom = '15px';
    
    // Message styles
    const messageStyle = alertElement.querySelector('.alert-message').style;
    messageStyle.marginBottom = '15px';
    
    const titleStyle = alertElement.querySelector('.alert-message h3').style;
    titleStyle.fontSize = '16px';
    titleStyle.marginBottom = '5px';
    titleStyle.color = isDarkMode ? '#e0e0e0' : '#202124';
    
    const descStyle = alertElement.querySelector('.alert-message p').style;
    descStyle.fontSize = '14px';
    descStyle.margin = '0';
    descStyle.color = isDarkMode ? '#b0b0b0' : '#5F6368';
    
    // Action styles
    const actionsStyle = alertElement.querySelector('.alert-actions').style;
    actionsStyle.display = 'flex';
    actionsStyle.justifyContent = 'flex-end';
    actionsStyle.gap = '10px';
    
    // Add to document
    document.body.appendChild(alertElement);
    
    // Animate in
    setTimeout(() => {
        alertElement.style.transform = 'translateY(0)';
        alertElement.style.opacity = '1';
    }, 100);
    
    // Add dismiss functionality
    const dismissBtn = alertElement.querySelector('.alert-dismiss');
    dismissBtn.addEventListener('click', () => {
        alertElement.style.transform = 'translateY(100%)';
        alertElement.style.opacity = '0';
        
        setTimeout(() => {
            document.body.removeChild(alertElement);
        }, 300);
    });
    
    // View details button
    const viewDetailsBtn = alertElement.querySelector('.btn-primary');
    viewDetailsBtn.addEventListener('click', () => {
        // Navigate to reports section
        const reportsLink = document.querySelector('a[data-section="reports"]');
        if (reportsLink) {
            reportsLink.click();
            
            // Show success toast
            showToast('Alert', 'Navigated to Reports section for detailed analysis', 'info');
        }
        
        // Remove the alert
        alertElement.style.transform = 'translateY(100%)';
        alertElement.style.opacity = '0';
        
        setTimeout(() => {
            document.body.removeChild(alertElement);
        }, 300);
    });
    
    // Auto dismiss after 8 seconds
    setTimeout(() => {
        if (document.body.contains(alertElement)) {
            alertElement.style.transform = 'translateY(100%)';
            alertElement.style.opacity = '0';
            
            setTimeout(() => {
                if (document.body.contains(alertElement)) {
                    document.body.removeChild(alertElement);
                }
            }, 300);
        }
    }, 12000);
}