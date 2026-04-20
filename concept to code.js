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
    
    const config = window.DISCOUNT_CONFIG || {};
    let discountFound = false;

    for (let opt of pkgSelect.options) {
        let basePrice = parseFloat(opt.getAttribute('value'));
        if (isNaN(basePrice)) continue;

        let finalPrice = basePrice;

        // Dynamic Discount Check (Checks all codes in sdc.js including IRAN786)
        for (let key in config) {
            if (promo === config[key].code) {
                if (config[key].rate) {
                    finalPrice = Math.round(basePrice * (1 - config[key].rate));
                } else if (config[key].target) {
                    finalPrice = config[key].target;
                }
                discountFound = true;
                break;
            }
        }

        let originalName = opt.classList.contains('audit-price') ? 
            (opt.value === "25" ? "HTML & CSS Optimization" : "WordPress Optimization") :
            (opt.value === "200" ? "Landing Page Build" : opt.value === "500" ? "Business Website" : "Enterprise Solution");

        // Simple display (keeps dropdown clean)
        opt.text = `${originalName} ($${finalPrice})`;
        
        if (opt.selected) {
            document.getElementById('formspreeTotal').value = `$${finalPrice}`;
        }
    }

    if (discountFound && promo !== "") {
        descDiv.innerHTML = `<span style="color: #4ade80; font-weight: bold;">✅ Discount Applied!</span>`;
        descDiv.classList.remove('hidden');
    } else {
        updatePackageDescription(); 
    }
}

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
    const urlInput = document.getElementById('siteUrl');
    const currency = document.querySelector('input[name="currency"]:checked').value;
    
    if (!email) { alert("Email is required"); return; }

    const isOptimize = document.querySelector('input[name="Project Scope"]:checked').value === 'Optimize Existing';
    if (isOptimize && (!urlInput || !urlInput.value.trim())) {
        alert("Please provide the Website URL you want optimized.");
        if(urlInput) urlInput.focus();
        return;
    }

    updatePrices(); 
    
    const pkgSelect = document.getElementById('package');
    const selectedText = pkgSelect.options[pkgSelect.selectedIndex].text;
    const priceMatch = selectedText.match(/\$(\d+)/);
    const priceUSD = priceMatch ? parseInt(priceMatch[1]) : 0;
    
    const paymentArea = document.getElementById('payment-area');
    
    if (priceUSD === 0) {
        paymentArea.innerHTML = `
            <div class="checkout-summary">
                <h4>Order Summary</h4>
                <p style="color: #4ade80; font-weight: bold;">Claimed for FREE!</p>
            </div>
            <button type="submit" class="btn-main" style="background: #4ade80 !important; color: white;">Complete Free Order</button>
        `;
    } else if (currency === 'USD') {
        paymentArea.innerHTML = `
            <div class="checkout-summary">
                <h4>PayPal Checkout</h4>
                <p style="font-weight: 600;">${selectedText}</p>
            </div>
            <button type="button" class="btn-paypal-branded" onclick="payWithPayPal()">
                <span class="paypal-text">Pay with <span>Pay</span><span>Pal</span></span>
            </button>
        `;
    } else {
        const priceINR = priceUSD * 83;
        paymentArea.innerHTML = `
            <div class="checkout-summary">
                <h4>UPI Payment (India)</h4>
                <p style="font-size: 1.2rem; font-weight: 800;">₹${priceINR.toLocaleString('en-IN')}</p>
                <h2 style="background: var(--accent); padding: 10px; border-radius: 5px; font-size: 1.1rem; margin-top: 10px;">
                    UPI ID: talentedtechguy@upi
                </h2>
            </div>
            <button type="submit" class="btn-main">Submit Project & Pay via UPI</button>
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
    const priceMatch = selectedText.match(/\$(\d+)/);
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

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const promoElement = document.getElementById('promoCode');
    const pkgElement = document.getElementById('package');
    if(promoElement) promoElement.addEventListener('input', updatePrices);
    if(pkgElement) pkgElement.addEventListener('change', updatePrices);
});
