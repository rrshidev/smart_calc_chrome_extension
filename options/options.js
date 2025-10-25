class OptionsManager {
    constructor() {
        this.settings = {
            theme: 'light',
            autoCopy: false,
            saveHistory: true
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.loadHistory();
        this.calculateStorageSize();
    }

    loadSettings() {
        chrome.storage.local.get(['settings', 'theme'], (result) => {
            if (result.settings) {
                this.settings = { ...this.settings, ...result.settings };
            }
            if (result.theme) {
                this.settings.theme = result.theme;
            }
            this.applySettings();
        });
    }

    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Settings controls
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.saveSettings();
            this.applyTheme();
        });

        document.getElementById('autoCopy').addEventListener('change', (e) => {
            this.settings.autoCopy = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('saveHistory').addEventListener('change', (e) => {
            this.settings.saveHistory = e.target.checked;
            this.saveSettings();
        });

        // Action buttons
        document.getElementById('exportHistory').addEventListener('click', () => {
            this.exportHistory();
        });

        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });

        document.getElementById('clearData').addEventListener('click', () => {
            this.clearAllData();
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }

    applySettings() {
        // Theme
        document.getElementById('themeSelect').value = this.settings.theme;
        this.applyTheme();

        // Checkboxes
        document.getElementById('autoCopy').checked = this.settings.autoCopy;
        document.getElementById('saveHistory').checked = this.settings.saveHistory;
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        // Also update theme in popup if it's open
        chrome.storage.local.set({ theme: this.settings.theme });
    }

    saveSettings() {
        chrome.storage.local.set({ 
            settings: this.settings,
            theme: this.settings.theme
        });
    }

    loadHistory() {
        chrome.storage.local.get(['history'], (result) => {
            const history = result.history || [];
            this.displayHistory(history);
        });
    }

    displayHistory(history) {
        const container = document.getElementById('historyList');
        
        if (history.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>История расчетов пуста</p>
                </div>
            `;
            return;
        }

        container.innerHTML = history.map((item, index) => this.createHistoryItem(item, index)).join('');
        
        // Add event listeners for action buttons
        this.setupHistoryActions();
    }

    createHistoryItem(item, index) {
        const calculatorNames = {
            'percentOf': 'Процент от числа',
            'whatPercent': 'Сколько процентов составляет',
            'percentageChange': 'Изменение в процентах',
            'compoundInterest': 'Сложный процент',
            'loanPayment': 'Платеж по кредиту',
            'breakEven': 'Точка безубыточности',
            'roi': 'ROI (Окупаемость)'
        };

        const date = new Date(item.timestamp);
        const formattedDate = date.toLocaleDateString('ru-RU');
        const formattedTime = date.toLocaleTimeString('ru-RU');

        return `
            <div class="history-item" data-index="${index}">
                <div class="history-content">
                    <div class="history-type">${calculatorNames[item.type] || item.type}</div>
                    <div class="history-result">${item.result}</div>
                    <div class="history-inputs">
                        Входные данные: ${Object.entries(item.inputs).map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </div>
                    <div class="history-time">${formattedDate} в ${formattedTime}</div>
                </div>
                <div class="history-actions">
                    <button class="copy-history" title="Копировать результат">📋</button>
                    <button class="delete-history" title="Удалить">🗑️</button>
                </div>
            </div>
        `;
    }

    setupHistoryActions() {
        // Copy history items
        document.querySelectorAll('.copy-history').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const historyItem = e.target.closest('.history-item');
                const result = historyItem.querySelector('.history-result').textContent;
                this.copyToClipboard(result);
            });
        });

        // Delete history items
        document.querySelectorAll('.delete-history').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const historyItem = e.target.closest('.history-item');
                const index = parseInt(historyItem.dataset.index);
                this.deleteHistoryItem(index);
            });
        });
    }

    exportHistory() {
        chrome.storage.local.get(['history'], (result) => {
            const history = result.history || [];
            
            if (history.length === 0) {
                this.showNotification('Нет данных для экспорта', 'error');
                return;
            }

            const csv = this.convertToCSV(history);
            this.downloadCSV(csv, 'calculator-history.csv');
            this.showNotification('История экспортирована в CSV');
        });
    }

    convertToCSV(history) {
        const headers = ['Тип расчета', 'Результат', 'Входные данные', 'Дата и время'];
        const rows = history.map(item => [
            item.type,
            `"${item.result.replace(/\n/g, ' ')}"`,
            `"${Object.entries(item.inputs).map(([k, v]) => `${k}: ${v}`).join(', ')}"`,
            new Date(item.timestamp).toLocaleString('ru-RU')
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    clearHistory() {
        if (!confirm('Вы уверены, что хотите очистить всю историю расчетов?')) {
            return;
        }

        chrome.storage.local.set({ history: [] }, () => {
            this.loadHistory();
            this.showNotification('История очищена');
            this.calculateStorageSize();
        });
    }

    deleteHistoryItem(index) {
        chrome.storage.local.get(['history'], (result) => {
            const history = result.history || [];
            history.splice(index, 1);
            
            chrome.storage.local.set({ history }, () => {
                this.loadHistory();
                this.showNotification('Запись удалена');
                this.calculateStorageSize();
            });
        });
    }

    clearAllData() {
        if (!confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
            return;
        }

        chrome.storage.local.clear(() => {
            this.settings = {
                theme: 'light',
                autoCopy: false,
                saveHistory: true
            };
            this.applySettings();
            this.saveSettings();
            this.loadHistory();
            this.showNotification('Все данные очищены');
            this.calculateStorageSize();
        });
    }

    calculateStorageSize() {
        chrome.storage.local.getBytesInUse(null, (bytes) => {
            const kb = (bytes / 1024).toFixed(2);
            document.getElementById('storageSize').textContent = `${kb} KB`;
        });
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Результат скопирован');
        }).catch(err => {
            this.showNotification('Ошибка копирования', 'error');
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

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OptionsManager();
});