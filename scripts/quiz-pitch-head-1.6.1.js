/**
 * Leinenchallenge Quiz Pitch - Head Script v1.8
 * MIT A/B-TEST FÜR ZAHLUNGSPLÄNE
 */

document.addEventListener('DOMContentLoaded', function() {

  // ===== NEU: A/B-TEST KONFIGURATION =====
  const PAYMENT_PLAN_TEST = {
    testName: 'checkout_plan_test',
    variants: ['A', 'B', 'C'],
    plans: {
      'A': '1371536',  // Zahlungsplan A
      'B': '1338353',  // Zahlungsplan B
      'C': '1371557'   // Zahlungsplan C
    },
    split: [33, 33, 34]  // Prozentuale Verteilung
  };

  // ===== NEU: Variante ermitteln oder zuweisen =====
  function getOrAssignVariant() {
    const storageKey = `ab_${PAYMENT_PLAN_TEST.testName}`;
    
    // 1. Prüfe URL-Parameter (für Testing)
    const urlParams = new URLSearchParams(window.location.search);
    const urlVariant = urlParams.get('variant');
    if (urlVariant && PAYMENT_PLAN_TEST.variants.includes(urlVariant)) {
      localStorage.setItem(storageKey, urlVariant);
      setCookie(storageKey, urlVariant, 30);
      console.log('🎯 A/B Variante aus URL:', urlVariant);
      return urlVariant;
    }
    
    // 2. Prüfe Cookie
    const cookieVariant = getCookie(storageKey);
    if (cookieVariant && PAYMENT_PLAN_TEST.variants.includes(cookieVariant)) {
      console.log('🎯 A/B Variante aus Cookie:', cookieVariant);
      return cookieVariant;
    }
    
    // 3. Prüfe localStorage
    const storedVariant = localStorage.getItem(storageKey);
    if (storedVariant && PAYMENT_PLAN_TEST.variants.includes(storedVariant)) {
      console.log('🎯 A/B Variante aus localStorage:', storedVariant);
      return storedVariant;
    }
    
    // 4. Neue Variante zuweisen
    const newVariant = assignRandomVariant();
    localStorage.setItem(storageKey, newVariant);
    setCookie(storageKey, newVariant, 30);
    console.log('🎲 Neue A/B Variante zugewiesen:', newVariant);
    
    // Tracking an FinishTrack senden (falls vorhanden)
    if (typeof FinishTrack !== 'undefined' && FinishTrack.experiment) {
      FinishTrack.experiment(PAYMENT_PLAN_TEST.testName, newVariant);
    }
    
    return newVariant;
  }

  function assignRandomVariant() {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (let i = 0; i < PAYMENT_PLAN_TEST.split.length; i++) {
      cumulative += PAYMENT_PLAN_TEST.split[i];
      if (random < cumulative) {
        return PAYMENT_PLAN_TEST.variants[i];
      }
    }
    return PAYMENT_PLAN_TEST.variants[0];
  }

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  // ===== BESTEHENDE FUNKTIONEN (unverändert) =====
  function getStorageValues() {
    const ft_anonymous_id = localStorage.getItem('ft_anonymous_id') || '';
    const ft_session_id = localStorage.getItem('ft_session_id') || '';
    return { ft_anonymous_id, ft_session_id }; 
  }

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

  function getFirstName() {
    if (window.quizData && window.quizData.first_name) {
      return window.quizData.first_name;
    }
    return localStorage.getItem('fn') || 
           localStorage.getItem('first_name') || 
           localStorage.getItem('firstName') || 
           '';
  }

  // ✅ GEÄNDERT: Redirect-URL mit A/B-Test Zahlungsplan
  function buildRedirectURL(ft_anonymous_id, ft_session_id, email, firstName) {
    const baseURL = 'https://start.hundetraining.de/product/598602';
    const customParam = `LC25-${ft_anonymous_id}-${ft_session_id}`;
    
    // ===== NEU: Zahlungsplan basierend auf Variante =====
    const variant = getOrAssignVariant();
    const planId = PAYMENT_PLAN_TEST.plans[variant];
    
    let url = `${baseURL}?plan=${planId}&hide_plans&custom=${encodeURIComponent(customParam)}`;
    
    if (email) {
      url += `&email=${encodeURIComponent(email)}`;
    }
    
    if (firstName) {
      url += `&first_name=${encodeURIComponent(firstName)}`;
    }
    
    console.log(`🔗 Redirect URL gebaut (Variante ${variant}, Plan ${planId}):`, url);
    
    return url;
  }

  // ===== REST DES CODES BLEIBT UNVERÄNDERT =====
  
  function preloadCheckoutPageOptimized() {
    const { ft_anonymous_id, ft_session_id } = getStorageValues();
    const email = getEmailFromStorage();
    const firstName = getFirstName();
    
    const redirectURL = buildRedirectURL(ft_anonymous_id, ft_session_id, email, firstName);
    
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

  function sendWebhookAsync(email) {
    if (!email) return;

    // ===== NEU: Variante im Webhook mitsenden =====
    const variant = getOrAssignVariant();

    fetch('https://hook.eu2.make.com/bvwwlwpf8e55ta97akfieabw39309o5c', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        action: 'checkout_redirect_clicked',
        ab_variant: variant,  // NEU
        ab_test: PAYMENT_PLAN_TEST.testName,  // NEU
        timestamp: new Date().toISOString()
      }),
      keepalive: true
    }).catch(() => {});
  }

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

  const preloadButton = document.getElementById('quiz_btn_step34');
  if (preloadButton) {
    preloadButton.addEventListener('click', function(event) {
      setTimeout(() => {
        preloadCheckoutPageOptimized();
      }, 300);
    });
  }

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

  // ===== NEU: Debug-Funktion für A/B-Test =====
  window.debugABTest = function() {
    const storageKey = `ab_${PAYMENT_PLAN_TEST.testName}`;
    console.log('=== A/B TEST DEBUG ===');
    console.log('Test Name:', PAYMENT_PLAN_TEST.testName);
    console.log('Aktuelle Variante:', getOrAssignVariant());
    console.log('Zahlungsplan:', PAYMENT_PLAN_TEST.plans[getOrAssignVariant()]);
    console.log('Cookie:', getCookie(storageKey));
    console.log('localStorage:', localStorage.getItem(storageKey));
  };

  // ===== NEU: Variante manuell setzen (für Testing) =====
  window.setABVariant = function(variant) {
    if (!PAYMENT_PLAN_TEST.variants.includes(variant)) {
      console.error('Ungültige Variante. Erlaubt:', PAYMENT_PLAN_TEST.variants);
      return;
    }
    const storageKey = `ab_${PAYMENT_PLAN_TEST.testName}`;
    localStorage.setItem(storageKey, variant);
    setCookie(storageKey, variant, 30);
    console.log('✅ Variante gesetzt:', variant);
    console.log('🔄 Seite neu laden um Änderung zu sehen');
  };

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
