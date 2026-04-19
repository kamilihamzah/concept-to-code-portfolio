// --- THEME TOGGLE ---
const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;

if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    toggleBtn.innerHTML = '☀️';
}

toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    toggleBtn.innerHTML = isDark ? '☀️' : '🌙';
});

// --- DYNAMIC DESCRIPTION & PRICE LOGIC ---
function updatePackageDescription() {
    const pkgSelect = document.getElementById('package');
    const selectedOption = pkgSelect.options[pkgSelect.selectedIndex];
    const desc = selectedOption.getAttribute('data-desc');
    const descDiv = document.getElementById('package-desc');
    if (desc) {
        descDiv.innerHTML = `<span>ℹ️</span> ${desc}`;
        descDiv.classList.remove('hidden');
    } else {
        descDiv.classList.add('hidden');
    }
}

function updatePrices() {
    const pkgSelect = document.getElementById('package');
    const promoInput = document.getElementById('promoCode');
    const descDiv = document.getElementById('package-desc');
    const promo = promoInput.value.trim().toUpperCase();
    
    // Ensure config exists from sdc.js
    const config = window.DISCOUNT_CONFIG || {};
    let discountFound = false;

    for (let opt of pkgSelect.options) {
        let basePrice = parseFloat(opt.getAttribute('value'));
        if (isNaN(basePrice)) continue;

        let finalPrice = basePrice;

        // Apply Discount Logic
        if (config.free && promo === config.free.code) {
            finalPrice = 0;
            discountFound = true;
        } else if (config.kash && promo === config.kash.code) {
            finalPrice = Math.round(basePrice * (1 - config.kash.rate));
            discountFound = true;
        } else if (config.quick && promo === config.quick.code) {
            finalPrice = Math.round(basePrice * (1 - config.quick.rate));
            discountFound = true;
        } else if (config.special && promo === config.special.code) {
            finalPrice = config.special.target;
            discountFound = true;
        }

        // --- FIXED NAMES TO PREVENT OVERLAP ---
        let originalName = "";
        const val = opt.value;

        if (opt.classList.contains('audit-price')) {
            originalName = (val === "25") ? "HTML & CSS Optimization" : "WordPress Optimization";
        } else {
            if (val === "200") originalName = "Landing Page Build";
            else if (val === "500") originalName = "Business Website";
            else if (val === "1000") originalName = "Enterprise Solution";
        }

        // Update display: $Price / ₹Rupees
        opt.text = `${originalName} ($${finalPrice} / ₹${Math.round(finalPrice * 83)})`;
        
        if (opt.selected) {
            document.getElementById('formspreeTotal').value = `$${finalPrice}`;
        }
    }

    // Success Message Feedback
    if (discountFound && promo !== "") {
        descDiv.innerHTML = `<span style="color: #4ade80; font-weight: bold;">✅ Discount Applied!</span>`;
        descDiv.classList.remove('hidden');
    } else {
        updatePackageDescription(); 
    }
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    const promoElement = document.getElementById('promoCode');
    const pkgElement = document.getElementById('package');

    if(promoElement) promoElement.addEventListener('input', updatePrices);
    if(pkgElement) pkgElement.addEventListener('change', updatePrices);
});

// --- OPTION TOGGLE (Quick Audit vs Build) ---
function toggleOption(type) {
    const isQuick = type === 'quick';
    document.getElementById('quick-fields').classList.toggle('hidden', !isQuick);
    document.getElementById('custom-fields').classList.toggle('hidden', isQuick);
    
    const options = document.getElementById('package').options;
    for (let opt of options) {
        const isAudit = opt.classList.contains('audit-price');
        opt.hidden = isQuick ? !isAudit : isAudit;
        opt.disabled = isQuick ? !isAudit : isAudit;
    }
    document.getElementById('package').value = isQuick ? "25" : "200";
    updatePrices();
}

// --- FORM FLOW & CHECKOUT ---
function expandForm() {
    const email = document.getElementById('userEmail').value;
    if (!email) { alert("Email is required"); return; }
    
    updatePrices(); 
    
    const pkgSelect = document.getElementById('package');
    const selectedText = pkgSelect.options[pkgSelect.selectedIndex].text;
    const priceMatch = selectedText.match(/\$(\d+)/);
    const price = priceMatch ? priceMatch[1] : "0";
    
    const paymentArea = document.getElementById('payment-area');
    
    // Check if the price is 0 for free codes
    if (price === "0") {
        paymentArea.innerHTML = `
            <div class="checkout-summary">
                <h4>Order Summary</h4>
                <p style="color: #4ade80; font-weight: bold;">Claimed for FREE!</p>
            </div>
            <button type="submit" class="btn-main" style="background: #4ade80 !important; color: white;">Complete Free Order</button>
        `;
    } else {
        paymentArea.innerHTML = `
            <div class="checkout-summary">
                <h4>Order Summary</h4>
                <p style="font-weight: 600; color: var(--primary);">${selectedText}</p>
            </div>
            <button type="button" class="btn-paypal-branded" onclick="payWithPayPal()">
                <span class="paypal-text">Pay with <span>Pay</span><span>Pal</span></span>
            </button>
        `;
    }

    document.getElementById('step-2').classList.remove('hidden');
    document.getElementById('step-1').style.opacity = '0.4';
    document.getElementById('step-1').style.pointerEvents = 'none';
    document.getElementById('step-2').scrollIntoView({ behavior: 'smooth' });
}

function payWithPayPal() {
    const pkgSelect = document.getElementById('package');
    const selectedText = pkgSelect.options[pkgSelect.selectedIndex].text;
    // Extract numerical price only
    const cleanText = selectedText.replace(/,/g, '');
    const priceMatch = cleanText.match(/\$(\d+)/);
    const price = priceMatch ? priceMatch[1] : pkgSelect.value;
    
    window.open(`https://www.paypal.me/talentedtechguy/${price}`, '_blank');
}

function cancelCheckout() {
    document.getElementById('step-2').classList.add('hidden');
    const step1 = document.getElementById('step-1');
    step1.style.opacity = '1';
    step1.style.pointerEvents = 'auto';
    document.getElementById('payment-area').innerHTML = '';
    step1.scrollIntoView({ behavior: 'smooth' });
}

function quickFill(suffix) {
    const emailInput = document.getElementById('userEmail');
    if (emailInput) {
        emailInput.value += suffix; 
        emailInput.focus();
        emailInput.dispatchEvent(new Event('input'));
    }
}