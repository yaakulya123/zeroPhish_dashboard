// GoPhish API Configuration
const API_BASE_URL = 'https://13.48.140.162:3333/api';
const API_KEY = '62eebca8cceddcfc38bb24b0527ae43d439e8ab0e95f2fdf36ffc9f84fc59528';

// API Helper Function
async function apiRequest(endpoint, method = 'GET', data = null) {
    // Add trailing slash if needed
    if (!endpoint.endsWith('/') && !endpoint.includes('/complete')) {
        endpoint = endpoint + '/';
    }
    
    const url = `${API_BASE_URL}/${endpoint}`;
    
    const options = {
        method: method,
        headers: {
            'Authorization': `Api-Key ${API_KEY}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        console.log(`Making API request to: ${url}`, options);
        const response = await fetch(url, options);
        
        // Log response status
        console.log('Response status:', response.status);
        
        // Try to get response text
        const responseText = await response.text();
        console.log('Response preview:', responseText.substring(0, 200));
        
        // Try to parse JSON regardless of status
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            jsonResponse = null;
        }
        
        if (!response.ok) {
            // If we have a JSON response with an error message, use it
            if (jsonResponse && jsonResponse.message) {
                throw new Error(jsonResponse.message);
            } else {
                console.error(`API Error: Status ${response.status}`);
                throw new Error(`API Error: ${response.status} - ${responseText}`);
            }
        }
        
        // Return the already parsed JSON or the raw text
        return jsonResponse || responseText;
    } catch (error) {
        console.error('API Request Failed:', error);
        showToast('API Error', error.message, 'error');
        throw error; // Re-throw to allow caller to handle
    }
}

// API Functions for different GoPhish resources
async function fetchCampaigns() {
    console.log("Fetching campaigns...");
    return await apiRequest('campaigns');
}

async function createCampaign(campaignData) {
    console.log("Creating campaign with data:", campaignData);
    try {
        // Ensure template is properly formatted
        if (!campaignData.template || !campaignData.template.id) {
            showToast('Error', 'Email template is required', 'error');
            return null;
        }
        
        const result = await apiRequest('campaigns', 'POST', campaignData);
        console.log("Campaign creation response:", result);
        
        if (result && !result.error) {
            showToast('Success', 'Campaign created successfully', 'success');
            return result;
        } else {
            // If result has an error message, show it
            const errorMsg = result && result.message ? result.message : 'Unknown error';
            showToast('Error', `Failed to create campaign: ${errorMsg}`, 'error');
            return null;
        }
    } catch (error) {
        console.error("Campaign creation failed:", error);
        showToast('Error', `Failed to create campaign: ${error.message}`, 'error');
        return null;
    }
}

async function completeCampaign(campaignId) {
    try {
        console.log(`Completing campaign with ID: ${campaignId}`);
        // GoPhish API uses a POST request to the /campaigns/{id}/complete endpoint
        const result = await apiRequest(`campaigns/${campaignId}/complete`, 'POST');
        console.log('Campaign completion response:', result);
        if (!result.success) {
            throw new Error(result.message || 'Failed to complete campaign');
        }
        return result;
    } catch (error) {
        console.error('Campaign completion error:', error);
        throw error;
    }
}

async function fetchGroups() {
    return await apiRequest('groups');
}

async function createGroup(groupData) {
    return await apiRequest('groups', 'POST', groupData);
}

async function fetchTemplates() {
    const templates = await apiRequest('templates');
    
    if (templates && Array.isArray(templates)) {
        // For each template, fetch its full details if needed
        for (let i = 0; i < templates.length; i++) {
            // If the template doesn't have full details, fetch them
            if (!templates[i].html) {
                try {
                    const fullTemplate = await apiRequest(`templates/${templates[i].id}`);
                    if (fullTemplate) {
                        templates[i] = fullTemplate;
                    }
                } catch (error) {
                    console.error(`Error fetching details for template ${templates[i].id}:`, error);
                }
            }
        }
    }
    
    return templates;
}

async function createTemplate(templateData) {
    return await apiRequest('templates', 'POST', templateData);
}

async function fetchPages() {
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
            initCampaignFunctionality();
            
            // Advanced visualizations with actual data
            initDashboardCharts(campaigns);
            
            // Initialize all modal buttons
            initModalButtons();
            
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
            initCampaignFunctionality();
            
            // Initialize charts with no data
            initDashboardCharts(null);
            
            // Initialize all modal buttons
            initModalButtons();
            
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
                
                // Refresh data when navigating to campaigns
                if (targetSection === 'campaigns') {
                    refreshCampaigns();
                }
                
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

// Connect Campaign Functionality
function initCampaignFunctionality() {
    // Connect "New Campaign" button to show campaign form
    const newCampaignBtns = document.querySelectorAll('.btn.btn-primary.pulsate-once');
    
    newCampaignBtns.forEach(btn => {
        // Only connect if it's in the campaigns section or has a specific attribute
        if (btn.closest('#campaigns-section') || btn.getAttribute('data-action') === 'new-campaign') {
            btn.addEventListener('click', loadCampaignFormData);
        }
    });
    
    // Connect the form submission handlers
    const createBtn = document.getElementById('create-campaign');
    if (createBtn) {
        createBtn.addEventListener('click', handleCampaignSubmit);
    }
    
    const cancelBtn = document.getElementById('cancel-campaign');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            const modal = document.getElementById('new-campaign-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Also connect the close button (x)
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Connect campaign action buttons
    document.addEventListener('click', function(e) {
        // Check if the clicked element is a campaign action button or its child
        const actionBtn = e.target.closest('.action-buttons .btn-icon');
        if (actionBtn) {
            const campaignId = actionBtn.getAttribute('data-campaign-id');
            const action = actionBtn.getAttribute('title');
            
            if (campaignId && action) {
                handleCampaignAction(campaignId, action);
            }
        }
    });
}

// Function to load data for campaign form
async function loadCampaignFormData() {
    showLoading();
    
    try {
        // Fetch all required data in parallel
        const [templates, pages, profiles, groups] = await Promise.all([
            fetchTemplates(),
            fetchPages(),
            fetchSendingProfiles(),
            fetchGroups()
        ]);
        
        console.log('Form data loaded:', { templates, pages, profiles, groups });
        
        // Prepare modal content with form
        const modalBody = document.querySelector('#new-campaign-modal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <form id="campaign-form">
                    <div class="form-group">
                        <label for="campaign-name">Name:</label>
                        <input type="text" id="campaign-name" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="campaign-template">Email Template:</label>
                        <select id="campaign-template" name="template" required>
                            <option value="">Select Email Template</option>
                            ${templates && templates.map(template => `
                                <option value="${template.id}">${template.name}</option>
                            `).join('') || ''}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="campaign-page">Landing Page:</label>
                        <select id="campaign-page" name="page" required>
                            <option value="">Select Landing Page</option>
                            ${pages && pages.map(page => `
                                <option value="${page.id}">${page.name}</option>
                            `).join('') || ''}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="campaign-url">URL:</label>
                        <input type="url" id="campaign-url" name="url" value="https://13.48.140.162" required>
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
                    
                    <div class="form-group">
                        <label for="campaign-profile">Sending Profile:</label>
                        <select id="campaign-profile" name="profile" required>
                            <option value="">Select Sending Profile</option>
                            ${profiles && profiles.map(profile => `
                                <option value="${profile.id}">${profile.name}</option>
                            `).join('') || ''}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="campaign-group">Target Group:</label>
                        <select id="campaign-group" name="group" required>
                            <option value="">Select Group</option>
                            ${groups && groups.map(group => `
                                <option value="${group.id}">${group.name}</option>
                            `).join('') || ''}
                        </select>
                    </div>
                </form>
            `;
            
            // Set default date to today and time to current time + 15 minutes
            const now = new Date();
            now.setMinutes(now.getMinutes() + 15);

            const launchDateInput = document.getElementById('campaign-launch-date');
            if (launchDateInput) {
                launchDateInput.valueAsDate = now;
                
                // Set time to current time + 15 minutes
                const launchTimeInput = document.getElementById('campaign-launch-time');
                if (launchTimeInput) {
                    const hours = now.getHours().toString().padStart(2, '0');
                    const minutes = now.getMinutes().toString().padStart(2, '0');
                    launchTimeInput.value = `${hours}:${minutes}`;
                }
            }
        }
        
        // Show the modal
        const modal = document.getElementById('new-campaign-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        console.error('Failed to load campaign form data:', error);
        showToast('Error', 'Failed to load data for campaign creation', 'error');
    } finally {
        hideLoading();
    }
}

// Add a fallback function with hardcoded template name as a last resort
async function createCampaignWithHardcodedTemplate(name, templateId, pageId, url, profileId, launchDate, groupIds) {
    const apiUrl = `${API_BASE_URL}/campaigns/`;
    
    // Get template name from select element
    const templateSelect = document.getElementById('template');
    const templateName = templateSelect ? 
        templateSelect.options[templateSelect.selectedIndex].textContent : 
        'Template';
    
    // Build a minimal request based on known GoPhish API format
    const campaignData = {
        name: name,
        template: {
            name: templateName,
            id: Number(templateId)
        },
        url: url,
        page: {
            id: Number(pageId)
        },
        smtp: {
            id: Number(profileId)
        },
        launch_date: launchDate,
        groups: groupIds.map(id => ({ id: Number(id) }))
    };
    
    console.log("Fallback campaign data:", JSON.stringify(campaignData));
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(campaignData)
        });
        
        const responseText = await response.text();
        console.log("Fallback response:", responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse fallback response:", e);
            result = null;
        }
        
        if (response.ok && result && !result.error) {
            showToast('Success', 'Campaign created successfully', 'success');
            return result;
        } else {
            const errorMsg = result && result.message 
                ? result.message 
                : `Failed with status ${response.status}`;
            
            showToast('Error', `Fallback creation failed: ${errorMsg}`, 'error');
            return null;
        }
    } catch (error) {
        console.error("Fallback campaign creation failed:", error);
        showToast('Error', `Fallback failed: ${error.message}`, 'error');
        return null;
    }
}

// Create an entirely new direct approach
async function createCampaignDirectRequest(name, templateId, pageId, url, profileId, launchDate, groupIds) {
    const apiUrl = `${API_BASE_URL}/campaigns/`;
    
    // Format exactly as GoPhish expects - simplified structure
    const campaignData = {
        name: name,
        template_id: Number(templateId),  // CRITICAL: Use template_id not template.id
        page_id: Number(pageId),          // CRITICAL: Use page_id not page.id
        url: url,
        smtp_id: Number(profileId),       // CRITICAL: Use smtp_id not smtp.id
        launch_date: launchDate
    };
    
    // Add groups if present
    if (groupIds && groupIds.length > 0) {
        campaignData.groups = groupIds.map(id => ({ id: Number(id) }));
    } else {
        campaignData.groups = [];
    }
    
    console.log("Direct request data:", JSON.stringify(campaignData));
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(campaignData)
        });
        
        const responseText = await response.text();
        console.log("Direct request response:", responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse response:", e);
            result = null;
        }
        
        if (response.ok && result && !result.error) {
            showToast('Success', 'Campaign created successfully', 'success');
            return result;
        } else {
            const errorMsg = result && result.message 
                ? result.message 
                : `Failed with status ${response.status}`;
            
            showToast('Error', `Direct creation failed: ${errorMsg}`, 'error');
            return null;
        }
    } catch (error) {
        console.error("Direct campaign creation failed:", error);
        showToast('Error', `Direct creation failed: ${error.message}`, 'error');
        return null;
    }
}

// Try a final approach with the exact documented GoPhish API structure
async function createCampaignFinalAttempt(name, templateId, pageId, url, profileId, launchDate, groupIds) {
    const apiUrl = `${API_BASE_URL}/campaigns/`;
    
    // Format according to GoPhish API documentation
    const campaignData = {
        name: name,
        url: url,
        launch_date: launchDate,
        send_by_date: null,
        template: { id: Number(templateId) },
        page: { id: Number(pageId) },
        smtp: { id: Number(profileId) },
        groups: groupIds && groupIds.length > 0 ? groupIds.map(id => ({ id: Number(id) })) : []
    };
    
    console.log("Final attempt data:", JSON.stringify(campaignData));
    
    try {
        // Get the actual template and page to check they exist
        const template = await apiRequest(`templates/${templateId}`);
        const page = await apiRequest(`pages/${pageId}`);
        
        console.log("Template verification:", template);
        console.log("Page verification:", page);
        
        if (!template || !template.id) {
            showToast('Error', 'Invalid template ID or template not found', 'error');
            return null;
        }
        
        if (!page || !page.id) {
            showToast('Error', 'Invalid page ID or page not found', 'error');
            return null;
        }
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(campaignData)
        });
        
        const responseText = await response.text();
        console.log("Final attempt response:", responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse response:", e);
            result = null;
        }
        
        if (response.ok && result && !result.error) {
            showToast('Success', 'Campaign created successfully', 'success');
            return result;
        } else {
            const errorMsg = result && result.message 
                ? result.message 
                : `Failed with status ${response.status}`;
            
            showToast('Error', `Final attempt failed: ${errorMsg}`, 'error');
            return null;
        }
    } catch (error) {
        console.error("Final attempt failed:", error);
        showToast('Error', `Final attempt failed: ${error.message}`, 'error');
        return null;
    }
}

// Add a diagnostic test function
async function testGoPhishAPI() {
    console.log('Running GoPhish API diagnostics...');
    
    try {
        // Test API connectivity
        console.log('Testing API connectivity...');
        
        // Test basic connectivity first
        try {
            const pingResult = await apiRequest('', 'GET');
            console.log('Basic API connectivity test:', pingResult);
        } catch (error) {
            console.error('Basic API connectivity failed:', error);
            return { 
                success: false, 
                error: `Could not connect to the GoPhish API server: ${error.message}` 
            };
        }
        
        // Check for templates
        console.log('Fetching templates...');
        let templates = [];
        try {
            templates = await apiRequest('templates');
            console.log(`Found ${templates.length} templates`);
            if (!templates.length) {
                return { 
                    success: false, 
                    error: 'No email templates found. Please create at least one template first.' 
                };
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
            return { 
                success: false, 
                error: `Failed to fetch templates: ${error.message}` 
            };
        }
        
        // Check for landing pages
        console.log('Fetching landing pages...');
        let pages = [];
        try {
            pages = await apiRequest('pages');
            console.log(`Found ${pages.length} landing pages`);
            if (!pages.length) {
                return { 
                    success: false, 
                    error: 'No landing pages found. Please create at least one landing page first.' 
                };
            }
        } catch (error) {
            console.error('Failed to fetch landing pages:', error);
            return { 
                success: false, 
                error: `Failed to fetch landing pages: ${error.message}` 
            };
        }
        
        // Check for sending profiles
        console.log('Fetching SMTP profiles...');
        let smtpProfiles = [];
        try {
            smtpProfiles = await apiRequest('smtp');
            console.log(`Found ${smtpProfiles.length} SMTP profiles`);
            if (!smtpProfiles.length) {
                return { 
                    success: false, 
                    error: 'No sending profiles found. Please create at least one sending profile first.' 
                };
            }
        } catch (error) {
            console.error('Failed to fetch SMTP profiles:', error);
            return { 
                success: false, 
                error: `Failed to fetch SMTP profiles: ${error.message}` 
            };
        }
        
        // Check for target groups
        console.log('Fetching groups...');
        let groups = [];
        try {
            groups = await apiRequest('groups');
            console.log(`Found ${groups.length} groups`);
            if (!groups.length) {
                return { 
                    success: false, 
                    error: 'No target groups found. Please create at least one group first.' 
                };
            }
        } catch (error) {
            console.error('Failed to fetch groups:', error);
            return { 
                success: false, 
                error: `Failed to fetch groups: ${error.message}` 
            };
        }
        
        // Create test campaign with correct field names
        const testCampaignData = {
            name: 'API Test Campaign',
            url: 'https://example.com',
            launch_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year in future
            template_id: templates[0].id,
            page_id: pages[0].id,
            smtp_id: smtpProfiles[0].id,
            groups: [{ id: groups[0].id }]
        };
        
        console.log('Creating test campaign with data:', JSON.stringify(testCampaignData));
        
        // Create test campaign
        let testResponse;
        try {
            testResponse = await apiRequest('campaigns', 'POST', testCampaignData);
            console.log('Test campaign creation response:', testResponse);
            
            if (!testResponse.success) {
                return { 
                    success: false, 
                    error: `API test failed: ${testResponse.message || 'Unable to create test campaign'}` 
                };
            }
            
            // Clean up - delete the test campaign
            console.log('Cleaning up - deleting test campaign...');
            await apiRequest(`campaigns/${testResponse.id}`, 'DELETE');
            
        } catch (error) {
            console.error('Failed to create test campaign:', error);
            return { 
                success: false, 
                error: `Failed to create test campaign: ${error.message}` 
            };
        }
        
        return { 
            success: true,
            message: 'All GoPhish API tests passed successfully',
            details: {
                templates: templates.length,
                pages: pages.length,
                smtpProfiles: smtpProfiles.length,
                groups: groups.length
            }
        };
    } catch (error) {
        console.error('API diagnostic error:', error);
        return { 
            success: false, 
            error: `API test failed: ${error.message || 'Unknown error'}` 
        };
    }
}

// Handle campaign form submission
async function handleCampaignSubmit(e) {
    if (e) e.preventDefault();
    
    try {
        showLoading();
        
        // Get form data
        const name = document.getElementById('campaign-name').value.trim();
        const templateId = parseInt(document.getElementById('campaign-template').value);
        const pageId = parseInt(document.getElementById('campaign-page').value);
        const url = document.getElementById('campaign-url').value.trim();
        const profileId = parseInt(document.getElementById('campaign-profile').value);
        
        // Get launch date/time and create ISO string
        const launchDate = document.getElementById('campaign-launch-date').value;
        const launchTime = document.getElementById('campaign-launch-time').value || '08:00';
        const launchDateTime = new Date(`${launchDate}T${launchTime}`);
        
        // Get selected groups from dropdown
        const groupSelect = document.getElementById('campaign-group');
        const groupId = parseInt(groupSelect.value);
        
        // Validate required fields
        if (!name || !templateId || !pageId || !url || !profileId) {
            showToast('Error', 'Please fill in all required fields', 'error');
            hideLoading();
            return;
        }
        
        if (!groupId) {
            showToast('Error', 'Please select a target group', 'error');
            hideLoading();
            return;
        }
        
        console.log('Form data:', { 
            name, 
            templateId, 
            pageId, 
            url, 
            profileId, 
            launchDateTime: launchDateTime.toISOString(),
            groupId
        });
        
        // Prepare campaign data exactly as GoPhish expects it
        const campaignData = {
            name: name,
            template: {
                id: templateId
            },
            url: url,
            page: {
                id: pageId
            },
            smtp: {
                id: profileId
            },
            launch_date: launchDateTime.toISOString(),
            groups: [{ id: groupId }]
        };
        
        // Submit to API
        console.log('Creating campaign with:', campaignData);
        const response = await createCampaign(campaignData);
        
        if (response) {
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
        }
    } catch (error) {
        console.error('Campaign creation error:', error);
        showToast('Error', `Error creating campaign: ${error.message || 'Unknown error'}`, 'error');
    } finally {
        hideLoading();
    }
}

// Handle campaign actions (view, edit, etc.)
function handleCampaignAction(campaignId, action) {
    console.log(`Campaign action: ${action} for campaign ID: ${campaignId}`);
    
    switch (action) {
        case 'View Results':
        case 'View Details':
            // Redirect to GoPhish campaign results page
            window.open(`https://${window.location.hostname}:3333/campaigns/${campaignId}`, '_blank');
            break;
            
        case 'Complete Campaign':
            // Complete the campaign via API
            completeCampaign(campaignId)
                .then(() => {
                    showToast('Success', 'Campaign marked as complete', 'success');
                    refreshCampaigns();
                })
                .catch(error => {
                    console.error('Error completing campaign:', error);
                    showToast('Error', 'Failed to complete campaign', 'error');
                });
            break;
            
        default:
            showToast('Info', `Action "${action}" not implemented yet`, 'info');
            break;
    }
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
            
            // Determine status
            let status = 'In Progress';
            let statusClass = 'in-progress';
            
            if (campaign.status === 'Completed') {
                status = 'Completed';
                statusClass = 'completed';
            } else if (new Date(campaign.launch_date) > new Date()) {
                status = 'Scheduled';
                statusClass = 'pending';
            }
            
            row.innerHTML = `
                <td>${campaign.name}</td>
                <td>${campaign.groups && campaign.groups.length > 0 ? campaign.groups.map(g => g.name).join(', ') : 'All Users'}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
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
                        <button class="btn-icon" title="View Results" data-tooltip="View campaign results" data-campaign-id="${campaign.id}"><i class="fas fa-chart-bar"></i></button>
                        <button class="btn-icon" title="View Details" data-tooltip="View campaign details" data-campaign-id="${campaign.id}"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon" title="Complete Campaign" data-tooltip="Complete campaign" data-campaign-id="${campaign.id}"><i class="fas fa-check-circle"></i></button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    // Animate progress bars
    animateProgressBars();
}

// Advanced Dashboard Charts
async function initDashboardCharts(campaigns) {
    showLoading();
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
    } finally {
        hideLoading();
    }
}

// Helper function to update metrics with real data
function updateDashboardMetrics(campaigns) {
    // Update active campaigns count
    const activeCampaignsMetric = document.querySelector('.metric-card:nth-child(1) .metric-value');
    if (activeCampaignsMetric) {
        const activeCampaigns = campaigns.filter(c => !c.completed || c.status !== 'Completed');
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

    try {
        // Check if ApexCharts is available
        if (typeof ApexCharts !== 'undefined') {
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

            const chart = new ApexCharts(element, options);
            chart.render();
            
            // Add animation
            setTimeout(() => {
                chart.updateSeries([Math.round(score)]);
            }, 500);
        } else {
            console.warn('ApexCharts not available for Security Posture Gauge');
            element.innerHTML = `<div style="text-align: center; padding: 20px;">Security Posture: ${score}/100</div>`;
        }
    } catch (error) {
        console.error('Error rendering Security Posture Gauge:', error);
        element.innerHTML = `<div style="text-align: center; padding: 20px;">Error displaying chart</div>`;
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
    
    try {
        // Check if ApexCharts is available
        if (typeof ApexCharts !== 'undefined') {
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

            const chart = new ApexCharts(element, options);
            chart.render();
        } else {
            console.warn('ApexCharts not available for Campaign Performance Chart');
            element.innerHTML = `<div style="text-align: center; padding: 20px;">Campaign data available but chart library not loaded</div>`;
        }
    } catch (error) {
        console.error('Error rendering Campaign Performance Chart:', error);
        element.innerHTML = `<div style="text-align: center; padding: 20px;">Error displaying chart</div>`;
    }
}

function initVulnerabilityChart() {
    const element = document.getElementById('vulnerabilityChart');
    if (!element) return;
    
    try {
        // Check if ApexCharts is available
        if (typeof ApexCharts !== 'undefined') {
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

            const chart = new ApexCharts(element, options);
            chart.render();
        } else {
            console.warn('ApexCharts not available for Vulnerability Chart');
            element.innerHTML = `<div style="text-align: center; padding: 20px;">Vulnerability data not available</div>`;
        }
    } catch (error) {
        console.error('Error rendering Vulnerability Chart:', error);
        element.innerHTML = `<div style="text-align: center; padding: 20px;">Error displaying chart</div>`;
    }
}

function initTrainingFunnelChart() {
    const element = document.getElementById('trainingFunnelChart');
    if (!element) return;
    
    try {
        // Check if ApexCharts is available
        if (typeof ApexCharts !== 'undefined') {
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

            const chart = new ApexCharts(element, options);
            chart.render();
        } else {
            console.warn('ApexCharts not available for Training Funnel Chart');
            element.innerHTML = `<div style="text-align: center; padding: 20px;">Training data not available</div>`;
        }
    } catch (error) {
        console.error('Error rendering Training Funnel Chart:', error);
        element.innerHTML = `<div style="text-align: center; padding: 20px;">Error displaying chart</div>`;
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

// Refresh Campaigns
function refreshCampaigns() {
    showLoading();
    fetchCampaigns()
        .then(campaigns => {
            updateCampaignsTable(campaigns);
            updateDashboardMetrics(campaigns);
            hideLoading();
        })
        .catch(error => {
            console.error('Error refreshing campaigns:', error);
            hideLoading();
            showToast('Error', 'Failed to refresh campaign data', 'error');
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

async function displayResult(result, section) {
    const resultElement = document.getElementById(`${section}-result`);
    if (!resultElement) return;
    
    resultElement.innerHTML = '';
    resultElement.classList.remove('success', 'error');
    
    if (result.success) {
        resultElement.classList.add('success');
        resultElement.textContent = '✓ Connection successful';
    } else {
        resultElement.classList.add('error');
        
        // Create main error message
        const errorMsg = document.createElement('div');
        errorMsg.textContent = `✗ ${result.error || 'Connection failed'}`;
        resultElement.appendChild(errorMsg);
        
        // If it's an API test failure, add more diagnostic info
        if (section === 'api' && result.error) {
            // Add troubleshooting tips
            const tipsList = document.createElement('ul');
            tipsList.style.marginTop = '10px';
            tipsList.style.fontSize = '0.9em';
            
            const tips = [
                "Ensure your API Key is correct",
                "Check that GoPhish server is running",
                "Verify API endpoint URL is correct",
                "Make sure you have created the necessary resources (templates, pages, profiles, groups)",
                "Check browser console for detailed error messages"
            ];
            
            tips.forEach(tip => {
                const li = document.createElement('li');
                li.textContent = tip;
                tipsList.appendChild(li);
            });
            
            resultElement.appendChild(tipsList);
            
            // Add a "View Console" message
            const consoleMsg = document.createElement('div');
            consoleMsg.style.marginTop = '10px';
            consoleMsg.style.fontStyle = 'italic';
            consoleMsg.textContent = 'For detailed error information, check your browser console (F12)';
            resultElement.appendChild(consoleMsg);
        }
    }
}

// Helper function for alerts (alias for showToast)
function showAlert(type, message) {
    // Map alert types to toast titles
    const titles = {
        'success': 'Success',
        'error': 'Error',
        'warning': 'Warning',
        'info': 'Information'
    };
    
    // Get title based on type, or use default
    const title = titles[type] || 'Notification';
    
    // Call showToast with appropriate parameters
    showToast(title, message, type);
}

// Connect all the modal buttons
function initModalButtons() {
    // New Campaign button
    const newCampaignBtn = document.getElementById('new-campaign-btn');
    if (newCampaignBtn) {
        newCampaignBtn.addEventListener('click', loadCampaignFormData);
    }
    
    // Campaign create button
    const createCampaignBtn = document.getElementById('create-campaign');
    if (createCampaignBtn) {
        createCampaignBtn.addEventListener('click', handleCampaignSubmit);
    }
    
    // Campaign cancel button
    const cancelCampaignBtn = document.getElementById('cancel-campaign');
    if (cancelCampaignBtn) {
        cancelCampaignBtn.addEventListener('click', function() {
            const modal = document.getElementById('new-campaign-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // New template button
    const newTemplateBtn = document.getElementById('new-template-btn');
    if (newTemplateBtn) {
        newTemplateBtn.addEventListener('click', function() {
            // Show template modal
            const modal = document.getElementById('new-template-modal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // New page button
    const newPageBtn = document.getElementById('new-page-btn');
    if (newPageBtn) {
        newPageBtn.addEventListener('click', function() {
            // Show page modal
            const modal = document.getElementById('new-page-modal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // New user button
    const newUserBtn = document.getElementById('new-user-btn');
    if (newUserBtn) {
        newUserBtn.addEventListener('click', function() {
            // Show user modal
            const modal = document.getElementById('new-user-modal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // New group button
    const newGroupBtn = document.getElementById('new-group-btn');
    if (newGroupBtn) {
        newGroupBtn.addEventListener('click', function() {
            // Show group modal
            const modal = document.getElementById('new-group-modal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // New profile button
    const newProfileBtn = document.getElementById('new-profile-btn');
    if (newProfileBtn) {
        newProfileBtn.addEventListener('click', function() {
            // Show profile modal
            const modal = document.getElementById('new-profile-modal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // Connect all close buttons
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Copy API key button
    const copyApiKeyBtn = document.getElementById('copy-api-key');
    if (copyApiKeyBtn) {
        copyApiKeyBtn.addEventListener('click', function() {
            const apiKeyInput = document.getElementById('api-key');
            if (apiKeyInput) {
                apiKeyInput.select();
                document.execCommand('copy');
                showToast('Copied', 'API key copied to clipboard', 'success');
            }
        });
    }
    
    // Save settings button
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            const apiUrl = document.getElementById('api-url').value;
            // Save the new API URL
            localStorage.setItem('api-url', apiUrl);
            showToast('Settings Saved', 'Your settings have been saved', 'success');
        });
    }
}