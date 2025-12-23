/**
 * Leinenchallenge Quiz Pitch - Head Script V1.5
 * Checkout Preloading & Redirect Logic
 */

(function() {
    'use strict';

    // Storage-Werte abrufen (f_aid, f_sid)
    function getStorageValues() {
        const f_aid = localStorage.getItem('f_aid') || '';
        const f_sid = localStorage.getItem('f_sid') || '';
        return { f_aid, f_sid };
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

    // Redirect-URL bauen
    function buildRedirectURL(f_aid, f_sid, email, firstName) {
        const baseURL = 'https://start.hundetraining.de/product/598602';
        const customParam = `LC25-${f_aid}-${f_sid}`;
        
        let url = `${baseURL}?custom=${encodeURIComponent(customParam)}`;
        
        if (email) {
            url += `&email=${encodeURIComponent(email)}`;
        }
        
        if (firstName) {
            url += `&first_name=${encodeURIComponent(firstName)}`;
        }
        
        return url;
    }

    // OPTIMIERTES PRELOADING
    function preloadCheckoutPageOptimized() {
        const { f_aid, f_sid } = getStorageValues();
        const email = getEmailFromStorage();
        const firstName = getFirstName();
        
        const redirectURL = buildRedirectURL(f_aid, f_sid, email, firstName);
        
        const dnsPrefetch = document.createElement('link');
        dnsPrefetch.rel = 'dns-prefetch';
        dnsPrefetch.href = 'https://start.hundetraining.de';
        document.head.appendChild(dnsPrefetch);
        
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = 'https://start.hundetraining.de';
        document.head.appendChild(preconnect);
        
        const prefetch = document.createElement('link');
        prefetch.rel = 'prefetch';
        prefetch.href = redirectURL;
        prefetch.as = 'document';
        document.head.appendChild(prefetch);
        
        const prerender = document.createElement('link');
        prerender.rel = 'prerender';
        prerender.href = redirectURL;
        document.head.appendChild(prerender);
    }

    // Webhook senden
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

    // Checkout Redirect Buttons initialisieren
    function initCheckoutRedirect() {
        const checkoutButtons = document.querySelectorAll('[data-checkout-redirect="true"]');
        
        if (checkoutButtons.length === 0) return;
        
        checkoutButtons.forEach(button => {
            // Nur einmal initialisieren
            if (button.hasAttribute('data-redirect-init')) return;
            button.setAttribute('data-redirect-init', 'true');
            
            button.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                showButtonLoader(button);
                
                const { f_aid, f_sid } = getStorageValues();
                const email = getEmailFromStorage();
                const firstName = getFirstName();
                
                sendWebhookAsync(email);
                
                const redirectURL = buildRedirectURL(f_aid, f_sid, email, firstName);
                window.location.href = redirectURL;
            });
        });
    }

    // Preload Button (ID-basiert)
    function initPreloadButton() {
        const preloadButton = document.getElementById('quiz_btn_step33_b');
        if (preloadButton && !preloadButton.hasAttribute('data-preload-init')) {
            preloadButton.setAttribute('data-preload-init', 'true');
            preloadButton.addEventListener('click', function(event) {
                setTimeout(() => {
                    preloadCheckoutPageOptimized();
                }, 300);
            });
        }
    }

    // Initialisierung mit mehreren Versuchen
    function tryInitialize() {
        initPreloadButton();
        initCheckoutRedirect();
    }

    // Bei DOM Ready
    document.addEventListener('DOMContentLoaded', tryInitialize);

    // Nochmal nach 500ms
    setTimeout(tryInitialize, 500);

    // Nochmal nach 1500ms
    setTimeout(tryInitialize, 1500);

    // MutationObserver als Fallback
    const observer = new MutationObserver(tryInitialize);
    observer.observe(document.body, {
        childList: true,
        subtree: true
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

})();
