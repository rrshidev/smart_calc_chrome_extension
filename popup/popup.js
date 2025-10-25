class PopupManager {
    constructor() {
        this.favorites = new Set();
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.setupAccordions();
        this.loadFavorites();
    }

    loadSettings() {
        chrome.storage.local.get(['theme', 'favorites'], (result) => {
            if (result.theme) {
                this.currentTheme = result.theme;
                this.applyTheme(this.currentTheme);
            }
            if (result.favorites) {
                this.favorites = new Set(result.favorites);
                this.updateFavoriteButtons();
            }
        });
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterCalculators(e.target.value);
        });

        // Quick actions
        document.getElementById('showHistory').addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });

        document.getElementById('openOptions').addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });
    }

    setupAccordions() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', (e) => {
                if (e.target.classList.contains('favorite-btn')) return;
                
                const accordion = header.parentElement;
                const content = accordion.querySelector('.accordion-content');
                const isExpanded = content.classList.contains('expanded');

                // Close all other accordions
                document.querySelectorAll('.accordion-content.expanded').forEach(expandedContent => {
                    if (expandedContent !== content) {
                        expandedContent.classList.remove('expanded');
                    }
                });

                // Toggle current accordion
                content.classList.toggle('expanded', !isExpanded);
            });
        });

        // Favorite buttons
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(btn.dataset.calc);
            });
        });

        // Calculate buttons
        document.querySelectorAll('.calculate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.calculate(e.target.dataset.calc);
            });
        });

        // Copy buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn')) {
                this.copyResult(e.target);
            }
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        // Special handling for favorites tab
        if (tabName === 'favorites') {
            this.showFavorites();
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.saveTheme();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const toggleBtn = document.getElementById('themeToggle');
        toggleBtn.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    saveTheme() {
        chrome.storage.local.set({ theme: this.currentTheme });
    }

    filterCalculators(searchTerm) {
        const calculators = document.querySelectorAll('.calculator-accordion');
        const lowerSearchTerm = searchTerm.toLowerCase();

        calculators.forEach(calc => {
            const title = calc.querySelector('.accordion-header span').textContent.toLowerCase();
            const isVisible = title.includes(lowerSearchTerm);
            calc.style.display = isVisible ? 'block' : 'none';
        });
    }

    toggleFavorite(calculatorId) {
        if (this.favorites.has(calculatorId)) {
            this.favorites.delete(calculatorId);
        } else {
            this.favorites.add(calculatorId);
        }

        this.updateFavoriteButtons();
        this.saveFavorites();

        // If we're on favorites tab, update the display
        if (document.querySelector('.tab.active').dataset.tab === 'favorites') {
            this.showFavorites();
        }
    }

    updateFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const isFavorited = this.favorites.has(btn.dataset.calc);
            btn.textContent = isFavorited ? '★' : '☆';
            btn.classList.toggle('favorited', isFavorited);
        });
    }

    saveFavorites() {
        chrome.storage.local.set({ 
            favorites: Array.from(this.favorites) 
        });
    }

    loadFavorites() {
        chrome.storage.local.get(['favorites'], (result) => {
            if (result.favorites) {
                this.favorites = new Set(result.favorites);
                this.updateFavoriteButtons();
            }
        });
    }

    showFavorites() {
        const container = document.getElementById('favoritesContainer');
        const emptyState = document.getElementById('favoritesEmpty');

        if (this.favorites.size === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        container.innerHTML = '';

        this.favorites.forEach(calcId => {
            const originalCalc = document.querySelector(`[data-calc="${calcId}"]`);
            if (originalCalc) {
                const clone = originalCalc.cloneNode(true);
                container.appendChild(clone);
            }
        });

        // Re-setup event listeners for cloned elements
        this.setupAccordions();
    }

    calculate(calculatorId) {
        let result;
        const inputs = this.getInputValues(calculatorId);

        try {
            switch (calculatorId) {
                case 'percentOf':
                    result = calculatePercentOf(inputs.number, inputs.percent);
                    break;
                case 'whatPercent':
                    result = calculateWhatPercent(inputs.part, inputs.whole);
                    break;
                case 'percentageChange':
                    result = calculatePercentageChange(inputs.oldValue, inputs.newValue);
                    break;
                case 'compoundInterest':
                    result = calculateCompoundInterest(inputs.principal, inputs.rate, inputs.years);
                    break;
                case 'loanPayment':
                    result = calculateLoanPayment(inputs.amount, inputs.rate, inputs.term);
                    break;
                case 'breakEven':
                    result = calculateBreakEven(inputs.fixedCosts, inputs.unitPrice, inputs.variableCosts);
                    break;
                case 'roi':
                    result = calculateROI(inputs.gain, inputs.cost);
                    break;
                default:
                    throw new Error('Unknown calculator');
            }

            this.displayResult(calculatorId, result);
            this.saveToHistory(calculatorId, inputs, result);

        } catch (error) {
            this.showNotification('Ошибка расчета: ' + error.message, 'error');
        }
    }

    getInputValues(calculatorId) {
        const inputs = {};
        
        switch (calculatorId) {
            case 'percentOf':
                inputs.number = parseFloat(document.getElementById('percentOfNumber').value);
                inputs.percent = parseFloat(document.getElementById('percentOfPercent').value);
                break;
            case 'whatPercent':
                inputs.part = parseFloat(document.getElementById('whatPercentPart').value);
                inputs.whole = parseFloat(document.getElementById('whatPercentWhole').value);
                break;
            case 'percentageChange':
                inputs.oldValue = parseFloat(document.getElementById('changeOld').value);
                inputs.newValue = parseFloat(document.getElementById('changeNew').value);
                break;
            case 'compoundInterest':
                inputs.principal = parseFloat(document.getElementById('principal').value);
                inputs.rate = parseFloat(document.getElementById('interestRate').value);
                inputs.years = parseFloat(document.getElementById('years').value);
                break;
            case 'loanPayment':
                inputs.amount = parseFloat(document.getElementById('loanAmount').value);
                inputs.rate = parseFloat(document.getElementById('loanRate').value);
                inputs.term = parseFloat(document.getElementById('loanTerm').value);
                break;
            case 'breakEven':
                inputs.fixedCosts = parseFloat(document.getElementById('fixedCosts').value);
                inputs.unitPrice = parseFloat(document.getElementById('unitPrice').value);
                inputs.variableCosts = parseFloat(document.getElementById('variableCosts').value);
                break;
            case 'roi':
                inputs.gain = parseFloat(document.getElementById('investmentGain').value);
                inputs.cost = parseFloat(document.getElementById('investmentCost').value);
                break;
        }

        // Validate inputs
        for (const [key, value] of Object.entries(inputs)) {
            if (isNaN(value)) {
                throw new Error(`Поле "${key}" содержит неверное значение`);
            }
        }

        return inputs;
    }

    displayResult(calculatorId, result) {
        const resultElement = document.getElementById(`${calculatorId}Result`);
        const copyBtn = resultElement.parentElement.querySelector('.copy-btn');
        
        resultElement.textContent = result;
        copyBtn.classList.remove('hidden');
    }

    copyResult(copyBtn) {
        const resultText = copyBtn.previousElementSibling.textContent;
        navigator.clipboard.writeText(resultText).then(() => {
            this.showNotification('Результат скопирован в буфер обмена!');
        }).catch(err => {
            this.showNotification('Ошибка копирования', 'error');
        });
    }

    saveToHistory(calculatorId, inputs, result) {
        const calculation = {
            type: calculatorId,
            inputs: inputs,
            result: result,
            timestamp: new Date().toISOString()
        };

        chrome.storage.local.get(['history'], (data) => {
            const history = data.history || [];
            history.unshift(calculation);
            
            // Keep only last 50 calculations
            const limitedHistory = history.slice(0, 50);
            
            chrome.storage.local.set({ history: limitedHistory });
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});