/**
 * Leinenchallenge Quiz Pitch - Head Script v1.6.1
 * MIT A/B-TEST FÜR ZAHLUNGSPLÄNE + FINISHTRACK INTEGRATION
 */

document.addEventListener('DOMContentLoaded', function() {


// ===== A/B-TEST KONFIGURATION =====
const AB_TEST = {
  name: 'checkout_plan_test',
  variants: ['CONTROL', 'VARIANT_A', 'VARIANT_B'],
  plans: {
    'CONTROL': '1338353',
    'VARIANT_A': '1371536',
    'VARIANT_B': '1371557'
  },
  prices: {
    'CONTROL': '98€',
    'VARIANT_A': '78€',
    'VARIANT_B': '128€'
  },
  split: [33, 33, 34]
};

  // ===== COOKIE HELPERS =====
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

  // ===== VARIANTE ZUWEISEN =====
  function assignRandomVariant() {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (let i = 0; i < AB_TEST.split.length; i++) {
      cumulative += AB_TEST.split[i];
      if (random < cumulative) {
        return AB_TEST.variants[i];
      }
    }
    return AB_TEST.variants[0];
  }

  function getOrAssignVariant() {
    const storageKey = `ab_${AB_TEST.name}`;
    
    // 1. URL-Parameter prüfen
    const urlParams = new URLSearchParams(window.location.search);
    const urlVariant = urlParams.get('variant');
    if (urlVariant && AB_TEST.variants.includes(urlVariant)) {
      localStorage.setItem(storageKey, urlVariant);
      setCookie(storageKey, urlVariant, 30);
      return urlVariant;
    }
    
    // 2. Cookie prüfen
    const cookieVariant = getCookie(storageKey);
    if (cookieVariant && AB_TEST.variants.includes(cookieVariant)) {
      return cookieVariant;
    }
    
    // 3. localStorage prüfen
    const storedVariant = localStorage.getItem(storageKey);
    if (storedVariant && AB_TEST.variants.includes(storedVariant)) {
      return storedVariant;
    }
    
    // 4. Neue Variante zuweisen
    const newVariant = assignRandomVariant();
    localStorage.setItem(storageKey, newVariant);
    setCookie(storageKey, newVariant, 30);
    
    return newVariant;
  }

  // ===== FINISHTRACK EXPERIMENT TRACKING =====
  function trackExperimentToFinishTrack(variant) {
    // Warten bis FinishTrack verfügbar
    const maxAttempts = 20;
    let attempts = 0;
    
    const tryTrack = () => {
      attempts++;
      
      if (typeof FinishTrack !== 'undefined') {
        // Methode 1: experiment() falls verfügbar
        if (typeof FinishTrack.experiment === 'function') {
          FinishTrack.experiment(AB_TEST.name, variant);
          console.log('📊 FinishTrack.experiment() gesendet:', AB_TEST.name, variant);
          return;
        }
        
        // Methode 2: track() als Fallback
        if (typeof FinishTrack.track === 'function') {
          FinishTrack.track('experiment_viewed', {
            experiment_id: AB_TEST.name,
            variant_id: variant
          });
          console.log('📊 FinishTrack.track() gesendet:', AB_TEST.name, variant);
          return;
        }
      }
      
      // Retry
      if (attempts < maxAttempts) {
        setTimeout(tryTrack, 200);
      }
    };
    
    tryTrack();
  }

  // ===== STORAGE VALUES =====
  function getStorageValues() {
    const ft_anonymous_id = localStorage.getItem('ft_anonymous_id') || '';
    const ft_session_id = localStorage.getItem('ft_session_id') || '';
    return { ft_anonymous_id, ft_session_id }; 
  }

  function getEmailFromStorage() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlEmail = urlParams.get('email');
    if (urlEmail) return urlEmail;
    
    return localStorage.getItem('email') || 
           localStorage.getItem('lc_useremail') || 
           localStorage.getItem('encryptedEmail') || '';
  }

  function getFirstName() {
    if (window.quizData && window.quizData.first_name) {
      return window.quizData.first_name;
    }
    return localStorage.getItem('fn') || 
           localStorage.getItem('first_name') || 
           localStorage.getItem('firstName') || '';
  }

  // ===== REDIRECT URL BAUEN =====
  function buildRedirectURL(ft_anonymous_id, ft_session_id, email, firstName) {
    const baseURL = 'https://start.hundetraining.de/product/598602';
    const customParam = `LC25-${ft_anonymous_id}-${ft_session_id}`;
    
    const variant = getOrAssignVariant();
    const planId = AB_TEST.plans[variant];
    
    let url = `${baseURL}?plan=${planId}&hide_plans&custom=${encodeURIComponent(customParam)}`;
    
    if (email) {
      url += `&email=${encodeURIComponent(email)}`;
    }
    
    if (firstName) {
      url += `&first_name=${encodeURIComponent(firstName)}`;
    }
    
    console.log(`🔗 Redirect: Variante ${variant} → Plan ${planId}`);
    
    return url;
  }

  // ===== PRELOADING =====
  function preloadCheckoutPageOptimized() {
    const { ft_anonymous_id, ft_session_id } = getStorageValues();
    const email = getEmailFromStorage();
    const firstName = getFirstName();
    
    const redirectURL = buildRedirectURL(ft_anonymous_id, ft_session_id, email, firstName);
    
    ['dns-prefetch', 'preconnect'].forEach(rel => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = 'https://start.hundetraining.de';
      document.head.appendChild(link);
    });
    
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

  // ===== WEBHOOK =====
  function sendWebhookAsync(email) {
    if (!email) return;

    const variant = getOrAssignVariant();

    fetch('https://hook.eu2.make.com/bvwwlwpf8e55ta97akfieabw39309o5c', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        action: 'checkout_redirect_clicked',
        ab_variant: variant,
        ab_test: AB_TEST.name,
        plan_id: AB_TEST.plans[variant],
        timestamp: new Date().toISOString()
      }),
      keepalive: true
    }).catch(() => {});
  }

  // ===== BUTTON LOADER =====
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

  // ===== EVENT LISTENERS =====
  const preloadButton = document.getElementById('quiz_btn_step34');
  if (preloadButton) {
    preloadButton.addEventListener('click', function() {
      setTimeout(preloadCheckoutPageOptimized, 300);
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

  // ===== BEIM LADEN: Variante ermitteln & tracken =====
  const currentVariant = getOrAssignVariant();
  console.log('🎯 A/B-Test Variante:', currentVariant, '→ Plan:', AB_TEST.plans[currentVariant]);

 // ===== PREISE AKTUALISIEREN =====
function updatePriceDisplays() {
  const variant = getOrAssignVariant();
  const price = AB_TEST.prices[variant];
  
  const priceSpans = document.querySelectorAll('[data-ab-price="true"]');
  priceSpans.forEach(span => {
    span.textContent = price;
  });
  
  console.log('💰 Preise aktualisiert:', price, `(${priceSpans.length} Elemente)`);
}
  
  // An FinishTrack senden
  trackExperimentToFinishTrack(currentVariant);

  // ===== DEBUG FUNKTIONEN =====
  window.debugABTest = function() {
    const variant = getOrAssignVariant();
    console.log('=== A/B TEST DEBUG ===');
    console.log('Test:', AB_TEST.name);
    console.log('Variante:', variant);
    console.log('Plan ID:', AB_TEST.plans[variant]);
    console.log('Cookie:', getCookie(`ab_${AB_TEST.name}`));
    console.log('localStorage:', localStorage.getItem(`ab_${AB_TEST.name}`));
  };

  window.setABVariant = function(variant) {
    if (!AB_TEST.variants.includes(variant)) {
      console.error('❌ Ungültig. Erlaubt:', AB_TEST.variants);
      return;
    }
    const key = `ab_${AB_TEST.name}`;
    localStorage.setItem(key, variant);
    setCookie(key, variant, 30);
    console.log('✅ Variante gesetzt:', variant, '- Seite neu laden!');
  };

});

// Spinner CSS
const style = document.createElement('style');
style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);
