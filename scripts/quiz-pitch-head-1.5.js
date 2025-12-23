/**
 * Leinenchallenge Quiz Pitch - Head Script
 * Checkout Preloading & Redirect Logic
 */

document.addEventListener('DOMContentLoaded', function() {
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

    // ✅ OPTIMIERTES PRELOADING: DNS + Prefetch + Prerender
    function preloadCheckoutPageOptimized() {
        const { f_aid, f_sid } = getStorageValues();
        const email = getEmailFromStorage();
        const firstName = getFirstName();
        
        const redirectURL = buildRedirectURL(f_aid, f_sid, email, firstName);
        
        console.log('🚀 Optimiertes Preloading für:', redirectURL);
        
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
        
        console.log('✅ DNS-Prefetch, Preconnect, Prefetch und Prerender aktiv');
    }

    // Webhook senden (OHNE await - komplett asynchron)
    function sendWebhookAsync(email) {
        if (!email) {
            console.warn('Keine Email für Webhook verfügbar');
            return;
        }

        // ✅ WICHTIG: keepalive = true, damit Request auch nach Navigation weiterläuft
        fetch('https://hook.eu2.make.com/bvwwlwpf8e55ta97akfieabw39309o5c', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                action: 'quiz_step39_clicked',
                timestamp: new Date().toISOString()
            }),
            keepalive: true  // ✅ Request läuft auch nach Page-Wechsel weiter
        }).then(response => {
            console.log('Webhook Status:', response.status);
        }).catch(error => {
            console.error('Webhook-Fehler:', error);
        });
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

    // ✅ Button 33 Handler: Preloading starten
    const button33 = document.getElementById('quiz_btn_step33_b');
    if (button33) {
        button33.addEventListener('click', function(event) {
            console.log('🎯 Button 33 geklickt - starte optimiertes Preloading');
            
            // Optimiertes Preloading im Hintergrund
            setTimeout(() => {
                preloadCheckoutPageOptimized();
            }, 300);
        });
        
        console.log('✅ Button 33 initialisiert - Optimiertes Preloading aktiv');
    } else {
        console.warn('⚠️ Button 33 nicht gefunden');
    }

    // ✅ Button 36 Handler: SOFORTIGE Weiterleitung
    const button36 = document.getElementById('quiz_btn_step36');
if (button36) {
  button36.addEventListener('click', function(event) {
    event.preventDefault();
    
    console.log('🎯 Button 36 geklickt - starte Weiterleitung');
    
    // Button-Loader anzeigen
    showButtonLoader(button36);
    
    const { f_aid, f_sid } = getStorageValues();
    const email = getEmailFromStorage();
    const firstName = getFirstName();
    
    // ✅ Webhook SOFORT starten (blockiert nicht die Navigation)
    sendWebhookAsync(email);
    
    // ✅ SOFORTIGE Navigation (Webhook läuft im Hintergrund weiter)
    const redirectURL = buildRedirectURL(f_aid, f_sid, email, firstName);
    console.log('➡️ Weiterleitung zu:', redirectURL);
    
    // Navigation ohne Delay (Webhook blockiert nicht)
    window.location.href = redirectURL;
  });
  
  console.log('✅ Button 36 initialisiert');
} else {
  console.warn('⚠️ Button 36 nicht gefunden');
}


// Spinner-Animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

