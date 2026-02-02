/**
 * Leinenchallenge Quiz Pitch - Head Script v1.7
 * Checkout Preloading & Redirect Logic
 * GEÄNDERT: anonymous_id & session_id statt f_aid & f_sid
 */

document.addEventListener('DOMContentLoaded', function() {
function getStorageValues() {
    const ft_anonymous_id = localStorage.getItem('ft_anonymous_id') || '';
    const ft_session_id = localStorage.getItem('ft_session_id') || '';
    return { ft_anonymous_id, ft_session_id }; 
}

    // Email mit Fallback-Logik
    function getEmailFromStorage() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlEmail = urlParams.get('email');
        if (urlEmail) {
            return urlEmail;
        }
        
        const email = localStorage.getItem('email') || 
                     localStorage.getItem('lc_useremail') || 
                     localStorage.getItem('encryptedEmail');
        return email || '';
    }

    // Vorname mit Fallback
    function getFirstName() {
        if (window.quizData && window.quizData.first_name) {
            return window.quizData.first_name;
        }
        return localStorage.getItem('fn') || 
               localStorage.getItem('first_name') || 
               localStorage.getItem('firstName') || 
               '';
    }

    // ✅ GEÄNDERT: Redirect-URL bauen (ft_anonymous_id, ft_session_id)
    function buildRedirectURL(ft_anonymous_id, ft_session_id, email, firstName) {
        const baseURL = 'https://start.hundetraining.de/product/598602';
        const customParam = `LC25-${ft_anonymous_id}-${ft_session_id}`;
        
        let url = `${baseURL}?plan=${planId}&hide_plans&custom=${encodeURIComponent(customParam)}`;
        
        if (email) {
            url += `&email=${encodeURIComponent(email)}`;
        }
        
        if (firstName) {
            url += `&first_name=${encodeURIComponent(firstName)}`;
        }
        
        return url;
    }

    // ✅ GEÄNDERT: OPTIMIERTES PRELOADING: DNS + Prefetch + Prerender
    function preloadCheckoutPageOptimized() {
        const { ft_anonymous_id, ft_session_id } = getStorageValues();
        const email = getEmailFromStorage();
        const firstName = getFirstName();
        
        const redirectURL = buildRedirectURL(ft_anonymous_id, ft_session_id, email, firstName);
        
        // 1. DNS-Prefetch (Domain-Lookup beschleunigen)
        const dnsPrefetch = document.createElement('link');
        dnsPrefetch.rel = 'dns-prefetch';
        dnsPrefetch.href = 'https://start.hundetraining.de';
        document.head.appendChild(dnsPrefetch);
        
        // 2. Preconnect (Verbindung aufbauen)
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = 'https://start.hundetraining.de';
        document.head.appendChild(preconnect);
        
        // 3. Prefetch (Ressourcen vorladen)
        const prefetch = document.createElement('link');
        prefetch.rel = 'prefetch';
        prefetch.href = redirectURL;
        prefetch.as = 'document';
        document.head.appendChild(prefetch);
        
        // 4. Prerender (Seite komplett vorrendern - Chrome/Edge)
        const prerender = document.createElement('link');
        prerender.rel = 'prerender';
        prerender.href = redirectURL;
        document.head.appendChild(prerender);
    }

    // Webhook senden (OHNE await - komplett asynchron)
    function sendWebhookAsync(email) {
        if (!email) return;

        fetch('https://hook.eu2.make.com/bvwwlwpf8e55ta97akfieabw39309o5c', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                action: 'checkout_redirect_clicked',
                timestamp: new Date().toISOString()
            }),
            keepalive: true
        }).catch(() => {});
    }

    // Button-Loader-Funktion
    function showButtonLoader(button) {
        button.setAttribute('data-original-text', button.innerHTML);
        
        button.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                <svg width="24" height="24" viewBox="0 0 24 24" style="animation: spin 0.8s linear infinite;">
                    <circle cx="12" cy="12" r="10" stroke="white" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" stroke-dashoffset="0" opacity="0.3"/>
                    <circle cx="12" cy="12" r="10" stroke="white" stroke-width="3" fill="none" stroke-dasharray="15.7 47.1" stroke-linecap="round"/>
                </svg>
                <span style="font-weight: 600;">Weiterleitung läuft...</span>
            </div>
        `;
        
        button.style.pointerEvents = 'none';
        button.style.cursor = 'not-allowed';
    }

    // ✅ v1.7: Button mit ID quiz_btn_step34 - Preloading starten
    const preloadButton = document.getElementById('quiz_btn_step34');
    if (preloadButton) {
        preloadButton.addEventListener('click', function(event) {
            setTimeout(() => {
                preloadCheckoutPageOptimized();
            }, 300);
        });
    }

    // ✅ GEÄNDERT: ALLE Buttons mit data-checkout-redirect: Weiterleitung
    const checkoutButtons = document.querySelectorAll('[data-checkout-redirect="true"]');
    
    checkoutButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            
            showButtonLoader(button);
            
            const { ft_anonymous_id, ft_session_id } = getStorageValues();
            const email = getEmailFromStorage();
            const firstName = getFirstName();
            
            sendWebhookAsync(email);
            
            const redirectURL = buildRedirectURL(ft_anonymous_id, ft_session_id, email, firstName);
            window.location.href = redirectURL;
        });
    });
});

// Spinner-Animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

