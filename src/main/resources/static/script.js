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
    
    // Set today's date as default for data emiterii (readonly)
    const today = new Date().toISOString().split('T')[0];
    if (dataEmiteriiInput) {
        dataEmiteriiInput.value = today;
        dataEmiteriiInput.readOnly = true;
    }
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
    
    // Generate PDF payment order
    generatePaymentOrderPdf(formData);
    
    showMessage('Ordinul de plată a fost generat cu succes!', 'success');
}

function generatePaymentOrderPdf(formData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const today = new Date().toLocaleDateString('ro-RO');
    const now = new Date().toLocaleString('ro-RO');
    
    let yPos = 20;
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDIN DE PLATĂ', 105, yPos, { align: 'center' });
    
    yPos += 15;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Număr ordin și data
    doc.text(`Număr ordin: ${formData.numarProcesVerbal}`, 20, yPos);
    doc.text(`Data emiterii: ${today}`, 120, yPos);
    yPos += 10;
    
    // Plătitor
    doc.setFont('helvetica', 'bold');
    doc.text('PLĂTITOR:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Nume: ${formData.nume} ${formData.prenume}`, 25, yPos);
    yPos += 6;
    doc.text(`CNP/CUI: ${formData.cnpSauCui}`, 25, yPos);
    yPos += 6;
    doc.text(`Email: ${formData.email || 'N/A'}`, 25, yPos);
    yPos += 6;
    doc.text(`Adresă: ${formData.adresaPostala}`, 25, yPos);
    yPos += 6;
    doc.text(`IBAN: ${formData.IBAN}`, 25, yPos);
    yPos += 6;
    doc.text(`Bancă (BIC): ${formData.bancaPlatitorului}`, 25, yPos);
    yPos += 10;
    
    // Beneficiar
    doc.setFont('helvetica', 'bold');
    doc.text('BENEFICIAR:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text('Primăria Municipiului București - Serviciul Amenzi Parcare', 25, yPos);
    yPos += 6;
    doc.text('Cod Fiscal: 43210000', 25, yPos);
    yPos += 6;
    doc.text('IBAN: RO49BBBB1B31007593841111', 25, yPos);
    yPos += 6;
    doc.text('Bancă: BBBRO22', 25, yPos);
    yPos += 10;
    
    // Detalii plată
    doc.setFont('helvetica', 'bold');
    doc.text('DETALII PLATĂ:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Număr Proces Verbal: ${formData.numarProcesVerbal}`, 25, yPos);
    yPos += 6;
    doc.text(`Valoare Amenda Inițială: ${valoareAmendaInput.value} RON`, 25, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Suma Totală de Plată: ${calculatedSum.toFixed(2)} RON`, 25, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Descriere: ${formData.descrierePlata || 'Plată amendă parcare'}`, 25, yPos);
    yPos += 10;
    
    // Footer
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.text(`Generat la: ${now}`, 20, yPos);
    
    // Save PDF
    doc.save(`ordin_plata_PV${formData.numarProcesVerbal}.pdf`);
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
                if (dataEmiteriiInput) {
                    dataEmiteriiInput.value = today;
                    dataEmiteriiInput.readOnly = true;
                }
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
        { input: valoareAmendaInput, errorId: null, message: 'Valoarea amenzii este obligatorie' }
        // dataEmiterii este automată și readonly, nu trebuie validată
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

// ============================================
// TAB MANAGEMENT
// ============================================

function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    if (tabName === 'creare') {
        document.getElementById('creareAmendaForm').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (tabName === 'plata') {
        document.getElementById('plataAmendaForm').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}

// ============================================
// CREARE AMENDA FORM
// ============================================

let creareAmendaForm;
let btnCreeazaAmenda;
let messageCreare;
let nrInmatriculareMasinaInput;
let zonaAmendaInput;
let codAgentInput;
let valoareAmendaCreareInput;

// Initialize creare amenda form
document.addEventListener('DOMContentLoaded', () => {
    creareAmendaForm = document.getElementById('creareAmendaForm');
    btnCreeazaAmenda = document.getElementById('btnCreeazaAmenda');
    messageCreare = document.getElementById('messageCreare');
    nrInmatriculareMasinaInput = document.getElementById('nrInmatriculareMasina');
    zonaAmendaInput = document.getElementById('zonaAmenda');
    codAgentInput = document.getElementById('codAgent');
    valoareAmendaCreareInput = document.getElementById('valoareAmendaCreare');

    if (creareAmendaForm && btnCreeazaAmenda) {
        creareAmendaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await creeazaAmenda();
        });
        
        // Real-time validation
        if (nrInmatriculareMasinaInput) {
            nrInmatriculareMasinaInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                clearFieldError(e.target);
            });
        }
        
        if (valoareAmendaCreareInput) {
            valoareAmendaCreareInput.addEventListener('input', () => {
                clearFieldError(valoareAmendaCreareInput);
            });
        }
    }
});

async function creeazaAmenda() {
    if (!creareAmendaForm || !btnCreeazaAmenda || !nrInmatriculareMasinaInput || !zonaAmendaInput || !codAgentInput || !valoareAmendaCreareInput) {
        console.error('Formularul de creare amenda nu este inițializat corect');
        return;
    }

    if (!validateCreareAmendaForm()) {
        showMessageCreare('Vă rugăm să completați toate câmpurile obligatorii corect', 'error');
        return;
    }

    btnCreeazaAmenda.disabled = true;
    btnCreeazaAmenda.textContent = 'Se creează...';

    try {
        const amendaData = {
            nrInmatriculareMasina: nrInmatriculareMasinaInput.value.trim().toUpperCase(),
            zona: zonaAmendaInput.value.trim(),
            codAgent: codAgentInput.value.trim(),
            valoareAmenda: parseInt(valoareAmendaCreareInput.value)
        };

        const response = await fetch(`${API_BASE_URL}/amenzi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(amendaData)
        });

        if (response.ok) {
            const result = await response.json();
            showMessageCreare(
                `Amenda a fost creată cu succes! Număr proces verbal: ${result.numarProcesVerbal}`,
                'success'
            );
            
            // Reset form after successful creation
            setTimeout(() => {
                resetCreareAmendaForm();
            }, 2000);
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Eroare necunoscută' }));
            showMessageCreare(
                'Eroare la crearea amenzi: ' + (errorData.message || errorData.error || 'Eroare necunoscută'),
                'error'
            );
        }
    } catch (error) {
        showMessageCreare('Eroare de conexiune: ' + error.message, 'error');
    } finally {
        btnCreeazaAmenda.disabled = false;
        btnCreeazaAmenda.textContent = 'Creează Amenda';
    }
}

function validateCreareAmendaForm() {
    if (!nrInmatriculareMasinaInput || !zonaAmendaInput || !codAgentInput || !valoareAmendaCreareInput) {
        return false;
    }

    let isValid = true;
    
    // Validate nrInmatriculareMasina
    const nrInmatricularePattern = /^(?:[A-Z]{2}\d{2}[A-Z]{3}|B\d{2,3}[A-Z]{3})$/;
    if (!nrInmatriculareMasinaInput.value.trim()) {
        showFieldError(nrInmatriculareMasinaInput, 'Numărul de înmatriculare este obligatoriu');
        isValid = false;
    } else if (!nrInmatricularePattern.test(nrInmatriculareMasinaInput.value.trim().toUpperCase())) {
        showFieldError(nrInmatriculareMasinaInput, 'Format invalid. Format acceptat: B123ABC sau AB12ABC');
        isValid = false;
    }

    // Validate zona
    if (!zonaAmendaInput.value.trim()) {
        showFieldError(zonaAmendaInput, 'Zona este obligatorie');
        isValid = false;
    }

    // Validate codAgent
    if (!codAgentInput.value.trim()) {
        showFieldError(codAgentInput, 'Codul agentului este obligatoriu');
        isValid = false;
    }

    // Validate valoareAmenda
    const valoare = parseInt(valoareAmendaCreareInput.value);
    if (!valoareAmendaCreareInput.value || isNaN(valoare) || valoare <= 0) {
        showFieldError(valoareAmendaCreareInput, 'Valoarea amenzii trebuie să fie un număr pozitiv');
        isValid = false;
    }

    return isValid;
}

function resetCreareAmendaForm() {
    if (creareAmendaForm) {
        creareAmendaForm.reset();
    }
    clearMessageCreare();
    
    // Clear all field errors
    if (nrInmatriculareMasinaInput) clearFieldError(nrInmatriculareMasinaInput);
    if (zonaAmendaInput) clearFieldError(zonaAmendaInput);
    if (codAgentInput) clearFieldError(codAgentInput);
    if (valoareAmendaCreareInput) clearFieldError(valoareAmendaCreareInput);
}

function showMessageCreare(message, type) {
    if (!messageCreare) return;
    
    messageCreare.textContent = message;
    messageCreare.className = `message ${type}`;
    
    if (type === 'info') {
        messageCreare.style.display = 'block';
        messageCreare.style.backgroundColor = '#d1ecf1';
        messageCreare.style.color = '#0c5460';
        messageCreare.style.border = '1px solid #bee5eb';
    }
}

function clearMessageCreare() {
    if (messageCreare) {
        messageCreare.style.display = 'none';
    }
}

