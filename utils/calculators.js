// Basic Calculators
function calculatePercentOf(number, percent) {
    const result = (number * percent) / 100;
    return `${percent}% от ${number} = ${result.toFixed(2)}`;
}

function calculateWhatPercent(part, whole) {
    if (whole === 0) throw new Error('Целое число не может быть нулем');
    const percent = (part / whole) * 100;
    return `${part} составляет ${percent.toFixed(2)}% от ${whole}`;
}

function calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) throw new Error('Исходное значение не может быть нулем');
    const change = ((newValue - oldValue) / oldValue) * 100;
    const direction = change >= 0 ? 'увеличилось' : 'уменьшилось';
    return `Значение ${direction} на ${Math.abs(change).toFixed(2)}% (с ${oldValue} до ${newValue})`;
}

function calculatePercentIncrease(number, percent) {
    const increase = (number * percent) / 100;
    const result = number + increase;
    return `Увеличение ${number} на ${percent}% = ${result.toFixed(2)}`;
}

function calculatePercentDecrease(number, percent) {
    const decrease = (number * percent) / 100;
    const result = number - decrease;
    return `Уменьшение ${number} на ${percent}% = ${result.toFixed(2)}`;
}

// Financial Calculators
function calculateCompoundInterest(principal, annualRate, years) {
    const rate = annualRate / 100;
    const amount = principal * Math.pow(1 + rate, years);
    const interest = amount - principal;
    return `Сумма: ${amount.toFixed(2)} руб.\nПроценты: ${interest.toFixed(2)} руб.\nЗа ${years} лет при ${annualRate}% годовых`;
}

function calculateLoanPayment(principal, annualRate, months) {
    const monthlyRate = annualRate / 100 / 12;
    const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    return `Ежемесячный платеж: ${payment.toFixed(2)} руб.\nОбщая сумма: ${(payment * months).toFixed(2)} руб.`;
}

function calculateFutureValue(payment, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    const futureValue = payment * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    return `Будущая стоимость: ${futureValue.toFixed(2)} руб.\nПри ежемесячном взносе ${payment} руб. на ${years} лет`;
}

// Business Calculators
function calculateBreakEven(fixedCosts, unitPrice, variableCostsPerUnit) {
    const contributionMargin = unitPrice - variableCostsPerUnit;
    if (contributionMargin <= 0) throw new Error('Цена должна быть выше переменных затрат');
    const breakEvenUnits = fixedCosts / contributionMargin;
    const breakEvenRevenue = breakEvenUnits * unitPrice;
    return `Точка безубыточности:\n${breakEvenUnits.toFixed(0)} единиц\nили ${breakEvenRevenue.toFixed(2)} руб. выручки`;
}

function calculateROI(gainFromInvestment, costOfInvestment) {
    if (costOfInvestment === 0) throw new Error('Стоимость инвестиции не может быть нулем');
    const roi = ((gainFromInvestment - costOfInvestment) / costOfInvestment) * 100;
    const netProfit = gainFromInvestment - costOfInvestment;
    return `ROI: ${roi.toFixed(2)}%\nЧистая прибыль: ${netProfit.toFixed(2)} руб.`;
}

function calculateGrossMargin(revenue, cogs) {
    if (revenue === 0) throw new Error('Выручка не может быть нулем');
    const grossProfit = revenue - cogs;
    const grossMargin = (grossProfit / revenue) * 100;
    return `Валовая маржа: ${grossMargin.toFixed(2)}%\nВаловая прибыль: ${grossProfit.toFixed(2)} руб.`;
}

function calculateNetMargin(revenue, expenses) {
    if (revenue === 0) throw new Error('Выручка не может быть нулем');
    const netProfit = revenue - expenses;
    const netMargin = (netProfit / revenue) * 100;
    return `Чистая маржа: ${netMargin.toFixed(2)}%\nЧистая прибыль: ${netProfit.toFixed(2)} руб.`;
}

function calculateMarkup(cost, sellingPrice) {
    if (cost === 0) throw new Error('Себестоимость не может быть нулем');
    const markup = ((sellingPrice - cost) / cost) * 100;
    const profit = sellingPrice - cost;
    return `Наценка: ${markup.toFixed(2)}%\nПрибыль: ${profit.toFixed(2)} руб.`;
}

// Conversion Calculators
function calculateCurrency(amount, exchangeRate) {
    const converted = amount * exchangeRate;
    return `${amount} × ${exchangeRate} = ${converted.toFixed(2)}`;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculatePercentOf,
        calculateWhatPercent,
        calculatePercentageChange,
        calculatePercentIncrease,
        calculatePercentDecrease,
        calculateCompoundInterest,
        calculateLoanPayment,
        calculateFutureValue,
        calculateBreakEven,
        calculateROI,
        calculateGrossMargin,
        calculateNetMargin,
        calculateMarkup,
        calculateCurrency
    };
}