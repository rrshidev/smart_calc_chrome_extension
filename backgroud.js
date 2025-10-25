// Background script for Smart Business Calculator
// Currently minimal as most functionality is in popup and options

chrome.runtime.onInstalled.addListener(() => {
    console.log('Smart Business Calculator installed');
    
    // Initialize default settings
    chrome.storage.local.get(['settings', 'theme'], (result) => {
        if (!result.settings) {
            const defaultSettings = {
                theme: 'light',
                autoCopy: false,
                saveHistory: true
            };
            chrome.storage.local.set({ settings: defaultSettings });
        }
        
        if (!result.theme) {
            chrome.storage.local.set({ theme: 'light' });
        }
    });
});

// Handle extension icon click (if needed for future features)
chrome.action.onClicked.addListener((tab) => {
    // This could be used for additional functionality
    console.log('Extension icon clicked');
});

// Listen for messages from content scripts or other parts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getSettings':
            chrome.storage.local.get(['settings'], (result) => {
                sendResponse(result.settings);
            });
            return true; // Will respond asynchronously
        
        case 'showNotification':
            // Could implement desktop notifications here
            break;
    }
});