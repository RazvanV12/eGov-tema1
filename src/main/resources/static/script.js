// API Base URL
const API_BASE_URL = '/api';

// Form elements
const form = document.getElementById('plataAmendaForm');
const btnCalculeaza = document.getElementById('btnCalculeaza');
const btnGenereazaOrdin = document.getElementById('btnGenereazaOrdin');
const btnSubmit = document.getElementById('btnSubmit');
const messageDiv = document.getElementById('message');

// Input fields
const numarProcesVerbalInput = document.getElementById('numarProcesVerbal');
const valoareAmendaInput = document.getElementById('valoareAmenda');
const dataEmiteriiInput = document.getElementById('dataEmiterii');
const numeInput = document.getElementById('nume');
const prenumeInput = document.getElementById('prenume');
const cnpSauCuiInput = document.getElementById('cnpSauCui');
const emailInput = document.getElementById('email');
const adresaPostalaInput = document.getElementById('adresaPostala');
const ibanInput = document.getElementById('iban');
const bancaPlatitoruluiInput = document.getElementById('bancaPlatitorului');
const descrierePlataInput = document.getElementById('descrierePlata');

// Calculation display elements
const valoareInitiataSpan = document.getElementById('valoareInitiata');
const zileScurseSpan = document.getElementById('zileScurse');
const tipCalculSpan = document.getElementById('tipCalcul');
const reducerePenalitateSpan = document.getElementById('reducerePenalitate');
const sumaTotalaSpan = document.getElementById('sumaTotala');

// State
let currentAmenda = null;
let calculatedSum = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupValidation();
    
    // Set today's date as default for data emiterii
    const today = new Date().toISOString().split('T')[0];
    dataEmiteriiInput.value = today;
});

function setupEventListeners() {
    // When proces verbal number is entered, try to fetch amenda
    numarProcesVerbalInput.addEventListener('blur', async () => {
        const numarPV = numarProcesVerbalInput.value;
        if (numarPV && numarPV > 0) {
            await loadAmendaByPV(numarPV);
        }
    });

    // Calculate button
    btnCalculeaza.addEventListener('click', () => {
        calculateAmounts();
    });

    // Generate payment order button
    btnGenereazaOrdin.addEventListener('click', () => {
        generatePaymentOrder();
    });

    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitForm();
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function setupValidation() {
    // CNP validation - only numbers, exactly 13 digits
    cnpSauCuiInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 13);
    });

    // IBAN validation - format RO
    ibanInput.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase().replace(/\s/g, '');
        e.target.value = value;
    });
}

async function loadAmendaByPV(numarPV) {
    try {
        showMessage('Se încarcă datele amenzii...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/amenzi/pv/${numarPV}`);
        if (response.ok) {
            currentAmenda = await response.json();
            valoareAmendaInput.value = currentAmenda.valoareAmenda || '';
            if (currentAmenda.dataOra) {
                // Convert LocalDateTime to date format
                const dateStr = currentAmenda.dataOra.split('T')[0];
                dataEmiteriiInput.value = dateStr;
            }
            clearMessage();
            enableCalculateButton();
        } else {
            const errorMessage = await response.text();
            showMessage('Amenda nu a fost găsită pentru proces verbal ' + numarPV + ': ' + errorMessage, 'error');
            // Still enable calculate button so user can enter manually
            enableCalculateButton();
        }
    } catch (error) {
        showMessage('Eroare la încărcarea datelor amenzii: ' + error.message, 'error');
        // Still enable calculate button so user can enter manually
        enableCalculateButton();
    }
}

function calculateAmounts() {
    const valoareAmenda = parseFloat(valoareAmendaInput.value) || 0;
    const dataEmiterii = dataEmiteriiInput.value;
    
    if (!valoareAmenda || !dataEmiterii) {
        showMessage('Vă rugăm să introduceți valoarea amenzii și data emiterii', 'error');
        return;
    }

    // Calculate days since emission
    const dataEmiteriiDate = new Date(dataEmiterii);
    const dataCompletariiDate = new Date();
    const diffTime = Math.abs(dataCompletariiDate - dataEmiteriiDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let sumaTotala = 0;
    let tipCalcul = '';
    let reducerePenalitate = 0;

    // Logic from PlataAmendaService
    if (diffDays <= 30) {
        // 50% reduction if paid within 30 days
        sumaTotala = Math.round(valoareAmenda / 2.0);
        tipCalcul = 'Reducere 50% (plătit în termen de 30 zile)';
        reducerePenalitate = valoareAmenda - sumaTotala;
    } else {
        // Penalty: 1% per month of delay after 30 days
        const luniIntarziere = Math.max(0, Math.floor((diffDays - 30) / 30));
        const procent = 1.0 * luniIntarziere;
        sumaTotala = Math.round(valoareAmenda * (1 + procent / 100.0));
        tipCalcul = `Penalitate ${procent}% (${luniIntarziere} luni întârziere)`;
        reducerePenalitate = sumaTotala - valoareAmenda;
    }

    // Update display
    valoareInitiataSpan.textContent = valoareAmenda.toFixed(2) + ' RON';
    zileScurseSpan.textContent = diffDays + ' zile';
    tipCalculSpan.textContent = tipCalcul;
    
    if (diffDays <= 30) {
        reducerePenalitateSpan.textContent = '-' + reducerePenalitate.toFixed(2) + ' RON';
        reducerePenalitateSpan.style.color = '#28a745';
    } else {
        reducerePenalitateSpan.textContent = '+' + reducerePenalitate.toFixed(2) + ' RON';
        reducerePenalitateSpan.style.color = '#dc3545';
    }
    
    sumaTotalaSpan.textContent = sumaTotala.toFixed(2) + ' RON';
    calculatedSum = sumaTotala;

    // Enable buttons
    btnGenereazaOrdin.disabled = false;
    enableSubmitButton();
    
    showMessage('Calculul a fost efectuat cu succes!', 'success');
}

function generatePaymentOrder() {
    if (!form.checkValidity()) {
        showMessage('Vă rugăm să completați toate câmpurile obligatorii', 'error');
        return;
    }

    const formData = collectFormData();
    
    // Generate TXT payment order
    const paymentOrder = generatePaymentOrderTxt(formData);
    
    // Download as file
    downloadFile(paymentOrder, `ordin_plata_PV${formData.numarProcesVerbal}.txt`, 'text/plain');
    
    showMessage('Ordinul de plată a fost generat cu succes!', 'success');
}

function generatePaymentOrderTxt(formData) {
    const today = new Date().toLocaleDateString('ro-RO');
    const lines = [
        '================================================================',
        '                   ORDIN DE PLATĂ',
        '================================================================',
        '',
        `Număr ordin: ${Date.now()}`,
        `Data emiterii: ${today}`,
        '',
        'PLĂTITOR:',
        `  Nume: ${formData.nume} ${formData.prenume}`,
        `  CNP/CUI: ${formData.cnpSauCui}`,
        `  Email: ${formData.email || 'N/A'}`,
        `  Adresă: ${formData.adresaPostala}`,
        `  IBAN: ${formData.IBAN}`,
        `  Bancă (BIC): ${formData.bancaPlatitorului}`,
        '',
        'BENEFICIAR:',
        '  Primăria Municipiului București - Serviciul Amenzi Parcare',
        '  Cod Fiscal: 43210000',
        '  IBAN: RO49BBBB1B31007593841111',
        '  Bancă: BBBRO22',
        '',
        'DETALII PLATĂ:',
        `  Număr Proces Verbal: ${formData.numarProcesVerbal}`,
        `  Valoare Amenda Inițială: ${valoareAmendaInput.value} RON`,
        `  Suma Totală de Plată: ${calculatedSum.toFixed(2)} RON`,
        `  Descriere: ${formData.descrierePlata || 'Plată amendă parcare'}`,
        '',
        '================================================================',
        `Generat la: ${new Date().toLocaleString('ro-RO')}`,
        '================================================================'
    ];
    
    return lines.join('\n');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

async function submitForm() {
    if (!validateForm()) {
        showMessage('Vă rugăm să corectați erorile din formular', 'error');
        return;
    }

    if (calculatedSum === 0) {
        showMessage('Vă rugăm să calculați mai întâi suma de plată', 'error');
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Se trimite...';

    try {
        const formData = collectFormData();
        
        const response = await fetch(`${API_BASE_URL}/plati`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            showMessage('Formularul a fost trimis cu succes! Datele au fost înregistrate și ordinul de plată XML a fost generat.', 'success');
            
            // Generate and download payment order
            generatePaymentOrder();
            
            // Reset form after successful submission
            setTimeout(() => {
                form.reset();
                resetCalculations();
                const today = new Date().toISOString().split('T')[0];
                dataEmiteriiInput.value = today;
            }, 2000);
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Eroare necunoscută' }));
            showMessage('Eroare la trimiterea formularului: ' + (errorData.message || errorData.error || 'Eroare necunoscută'), 'error');
        }
    } catch (error) {
        showMessage('Eroare de conexiune: ' + error.message, 'error');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Trimite Formular';
    }
}

function collectFormData() {
    return {
        nume: numeInput.value.trim(),
        prenume: prenumeInput.value.trim(),
        cnpSauCui: cnpSauCuiInput.value.trim(),
        email: emailInput.value.trim() || null,
        adresaPostala: adresaPostalaInput.value.trim(),
        IBAN: ibanInput.value.trim(),
        bancaPlatitorului: bancaPlatitoruluiInput.value.trim(),
        numarProcesVerbal: parseInt(numarProcesVerbalInput.value),
        descrierePlata: descrierePlataInput.value.trim() || null
    };
}

function validateForm() {
    let isValid = true;
    
    // Validate all required fields
    const requiredFields = [
        { input: numeInput, errorId: 'nume-error', message: 'Numele este obligatoriu' },
        { input: prenumeInput, errorId: 'prenume-error', message: 'Prenumele este obligatoriu' },
        { input: cnpSauCuiInput, errorId: 'cnpSauCui-error', message: 'CNP/CUI este obligatoriu (13 cifre)' },
        { input: adresaPostalaInput, errorId: 'adresaPostala-error', message: 'Adresa poștală este obligatorie' },
        { input: ibanInput, errorId: 'iban-error', message: 'IBAN-ul este obligatoriu' },
        { input: bancaPlatitoruluiInput, errorId: 'bancaPlatitorului-error', message: 'Banca plătitorului este obligatorie' },
        { input: numarProcesVerbalInput, errorId: 'numarProcesVerbal-error', message: 'Numărul procesului verbal este obligatoriu' },
        { input: valoareAmendaInput, errorId: null, message: 'Valoarea amenzii este obligatorie' },
        { input: dataEmiteriiInput, errorId: 'dataEmiterii-error', message: 'Data emiterii este obligatorie' }
    ];

    requiredFields.forEach(({ input, errorId, message }) => {
        if (!validateField(input)) {
            if (errorId) {
                showFieldError(input, message);
            }
            isValid = false;
        }
    });

    // Validate CNP format
    if (cnpSauCuiInput.value && cnpSauCuiInput.value.length !== 13) {
        showFieldError(cnpSauCuiInput, 'CNP/CUI trebuie să aibă exact 13 cifre');
        isValid = false;
    }

    // Validate email format if provided
    if (emailInput.value && !isValidEmail(emailInput.value)) {
        showFieldError(emailInput, 'Format email invalid');
        isValid = false;
    }

    return isValid;
}

function validateField(field) {
    clearFieldError(field);
    
    if (field.hasAttribute('required') && !field.value.trim()) {
        return false;
    }

    if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
        return false;
    }

    if (field.id === 'cnpSauCui' && field.value && field.value.length !== 13) {
        return false;
    }

    if (field.id === 'numarProcesVerbal' && field.value && (isNaN(field.value) || parseInt(field.value) <= 0)) {
        return false;
    }

    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(field, message) {
    field.classList.add('error');
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function enableCalculateButton() {
    btnCalculeaza.disabled = false;
}

function enableSubmitButton() {
    if (validateForm()) {
        btnSubmit.disabled = false;
    }
}

function resetCalculations() {
    valoareInitiataSpan.textContent = '0.00 RON';
    zileScurseSpan.textContent = '0 zile';
    tipCalculSpan.textContent = '-';
    reducerePenalitateSpan.textContent = '0.00 RON';
    sumaTotalaSpan.textContent = '0.00 RON';
    calculatedSum = 0;
    btnGenereazaOrdin.disabled = true;
    btnSubmit.disabled = true;
}

function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    
    if (type === 'info') {
        messageDiv.style.display = 'block';
        messageDiv.style.backgroundColor = '#d1ecf1';
        messageDiv.style.color = '#0c5460';
        messageDiv.style.border = '1px solid #bee5eb';
    }
}

function clearMessage() {
    messageDiv.style.display = 'none';
}

