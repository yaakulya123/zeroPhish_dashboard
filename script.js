// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    initNavigation();
    
    // Tabs
    initTabs();
    
    // Charts
    initDashboardCharts();
    initReportCharts();
    
    // UI interactions
    initUIInteractions();
});

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.content-section');
    const pageTitle = document.querySelector('.page-title');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state in navigation
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            const targetSection = this.getAttribute('data-section');
            pageSections.forEach(section => section.classList.remove('active'));
            document.getElementById(`${targetSection}-section`).classList.add('active');
            
            // Update page title
            updatePageTitle(targetSection);
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
        
        pageTitle.textContent = titles[section] || 'Dashboard';
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
                
                tabContents.forEach(content => content.classList.remove('active'));
                parentSection.querySelector(`#${targetContent}-content`).classList.add('active');
            });
        });
    });
}

// Chart initialization
function initDashboardCharts() {
    // Campaign Performance Chart
    if (document.getElementById('campaignPerformanceChart')) {
        const campaignCtx = document.getElementById('campaignPerformanceChart').getContext('2d');
        new Chart(campaignCtx, {
            type: 'line',
            data: {
                labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                datasets: [
                    {
                        label: 'Click Rate',
                        data: [32, 29, 25, 20, 18, 15],
                        borderColor: '#EA4335',
                        backgroundColor: 'rgba(234, 67, 53, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Report Rate',
                        data: [5, 8, 12, 18, 25, 32],
                        borderColor: '#34A853',
                        backgroundColor: 'rgba(52, 168, 83, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 50,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Employee Vulnerability Chart
    if (document.getElementById('vulnerabilityChart')) {
        const vulnerabilityCtx = document.getElementById('vulnerabilityChart').getContext('2d');
        new Chart(vulnerabilityCtx, {
            type: 'bar',
            data: {
                labels: ['Executive', 'IT', 'Finance', 'HR', 'Marketing', 'Sales'],
                datasets: [{
                    label: 'Vulnerability Score',
                    data: [25, 12, 18, 27, 35, 28],
                    backgroundColor: [
                        'rgba(26, 115, 232, 0.7)',
                        'rgba(26, 115, 232, 0.7)',
                        'rgba(26, 115, 232, 0.7)',
                        'rgba(26, 115, 232, 0.7)',
                        'rgba(26, 115, 232, 0.7)',
                        'rgba(26, 115, 232, 0.7)'
                    ],
                    borderColor: [
                        'rgba(26, 115, 232, 1)',
                        'rgba(26, 115, 232, 1)',
                        'rgba(26, 115, 232, 1)',
                        'rgba(26, 115, 232, 1)',
                        'rgba(26, 115, 232, 1)',
                        'rgba(26, 115, 232, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 50,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Training Metrics Chart
    if (document.getElementById('trainingMetricsChart')) {
        const trainingCtx = document.getElementById('trainingMetricsChart').getContext('2d');
        new Chart(trainingCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Not Started'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: [
                        '#34A853',
                        '#FBBC05',
                        '#EA4335'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20
                        }
                    }
                }
            }
        });
    }
}

function initReportCharts() {
    // Campaign Effectiveness Chart
    if (document.getElementById('campaignEffectivenessChart')) {
        const effectivenessCtx = document.getElementById('campaignEffectivenessChart').getContext('2d');
        new Chart(effectivenessCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                datasets: [
                    {
                        label: 'Phishing Success Rate',
                        data: [38, 35, 32, 28, 25, 22, 18, 15],
                        borderColor: '#EA4335',
                        backgroundColor: 'rgba(234, 67, 53, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Training Effectiveness',
                        data: [40, 45, 50, 60, 65, 70, 78, 82],
                        borderColor: '#34A853',
                        backgroundColor: 'rgba(52, 168, 83, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Attack Vector Chart
    if (document.getElementById('attackVectorChart')) {
        const vectorCtx = document.getElementById('attackVectorChart').getContext('2d');
        new Chart(vectorCtx, {
            type: 'radar',
            data: {
                labels: ['Password Reset', 'Account Alert', 'Invoice', 'Shared Document', 'Executive Request', 'IT Support'],
                datasets: [{
                    label: 'Success Rate',
                    data: [65, 40, 35, 50, 75, 45],
                    backgroundColor: 'rgba(66, 133, 244, 0.2)',
                    borderColor: 'rgba(66, 133, 244, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(66, 133, 244, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(66, 133, 244, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                }
            }
        });
    }
    
    // Risk Score Chart
    if (document.getElementById('riskScoreChart')) {
        const riskCtx = document.getElementById('riskScoreChart').getContext('2d');
        new Chart(riskCtx, {
            type: 'line',
            data: {
                labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                datasets: [{
                    label: 'Risk Score',
                    data: [78, 75, 70, 68, 65, 62],
                    borderColor: '#FBBC05',
                    backgroundColor: 'rgba(251, 188, 5, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        min: 50,
                        max: 100
                    }
                }
            }
        });
    }
    
    // Training Effectiveness Chart
    if (document.getElementById('trainingEffectivenessChart')) {
        const trainingEffCtx = document.getElementById('trainingEffectivenessChart').getContext('2d');
        new Chart(trainingEffCtx, {
            type: 'bar',
            data: {
                labels: ['Phishing Basics', 'Password Security', 'Social Engineering', 'Mobile Security'],
                datasets: [
                    {
                        label: 'Before Training',
                        data: [65, 55, 70, 60],
                        backgroundColor: 'rgba(234, 67, 53, 0.7)'
                    },
                    {
                        label: 'After Training',
                        data: [25, 20, 35, 30],
                        backgroundColor: 'rgba(52, 168, 83, 0.7)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.raw + '% vulnerability';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Department Comparison Chart
    if (document.getElementById('departmentComparisonChart')) {
        const deptCtx = document.getElementById('departmentComparisonChart').getContext('2d');
        new Chart(deptCtx, {
            type: 'bar',
            data: {
                labels: ['Executive', 'IT', 'Finance', 'HR', 'Marketing', 'Sales'],
                datasets: [
                    {
                        label: 'Oct 2024',
                        data: [42, 18, 35, 48, 55, 38],
                        backgroundColor: 'rgba(66, 133, 244, 0.7)',
                    },
                    {
                        label: 'Mar 2025',
                        data: [25, 8, 20, 30, 35, 22],
                        backgroundColor: 'rgba(52, 168, 83, 0.7)',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
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
            } else {
                label.textContent = 'Disabled';
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
        });
    });
    
    // Campaign Progress Animation
    animateProgressBars();
    
    // Circular Progress Animation
    animateCircleProgress();
    
    // Modal functionality
    initModalFunctionality();
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
        }, 100);
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
        }, 300);
    });
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

// Add fake real-time data updates
let updateCounter = 0;
setInterval(() => {
    updateCounter++;
    
    // Update notification count
    if (updateCounter % 10 === 0) {
        const badge = document.querySelector('.notifications .badge');
        if (badge) {
            let count = parseInt(badge.textContent);
            count = (count + 1) % 10;
            badge.textContent = count;
        }
    }
    
    // Randomly update a metric
    if (updateCounter % 5 === 0) {
        const metrics = document.querySelectorAll('.metric-value');
        if (metrics.length) {
            const randomMetric = metrics[Math.floor(Math.random() * metrics.length)];
            
            // Create a subtle pulse animation
            randomMetric.style.transition = 'transform 0.2s ease-in-out';
            randomMetric.style.transform = 'scale(1.05)';
            
            setTimeout(() => {
                randomMetric.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    // Add a new activity every 30 seconds
    if (updateCounter % 30 === 0) {
        addRandomActivity();
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
            activityList.removeChild(items[items.length - 1]);
        }
    }
}

// Demo simulation - Phishing alert simulation
setTimeout(() => {
    showPhishingAlert();
}, 15000);

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
    alertElement.style.backgroundColor = 'white';
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
    titleStyle.color = '#202124';
    
    const descStyle = alertElement.querySelector('.alert-message p').style;
    descStyle.fontSize = '14px';
    descStyle.margin = '0';
    descStyle.color = '#5F6368';
    
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
    }, 8000);
}