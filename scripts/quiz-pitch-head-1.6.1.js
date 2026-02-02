/**
 * Leinenchallenge Quiz Pitch - Head Script v1.6.1
 * MIT A/B-TEST FÜR ZAHLUNGSPLÄNE
 */

document.addEventListener('DOMContentLoaded', function() {

  // ===== ZAHLUNGSPLAN-MAPPING =====
  const PLAN_IDS = {
    'CONTROL': '1371536',
    'VARIANT_A': '1338353',
    'VARIANT_B': '1371557'
  };

  // ===== Variante von FinishFlow holen =====
  function getVariantFromFinishFlow() {
    // Methode 1: Über FinishFlow Instanz
    if (window.finishFlowInstance && typeof window.finishFlowInstance.getVariant === 'function') {
      return window.finishFlowInstance.getVariant();
    }
    
    // Methode 2: Über statische Methode
    if (typeof FinishFlow !== 'undefined' && FinishFlow.getVariant) {
      return FinishFlow.getVariant('checkout_plan_test');
    }
    
    // Methode 3: Direkt aus localStorage/Cookie
    const storageKey = 'ab_checkout_plan_test';
    return localStorage.getItem(storageKey) || getCookie(storageKey) || 'CONTROL';
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  // ===== Bestehende Funktionen =====
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

  // ===== Redirect-URL mit FinishFlow-Variante =====
  function buildRedirectURL(ft_anonymous_id, ft_session_id, email, firstName) {
    const baseURL = 'https://start.hundetraining.de/product/598602';
    const customParam = `LC25-${ft_anonymous_id}-${ft_session_id}`;
    
    // Variante von FinishFlow holen
    const variant = getVariantFromFinishFlow();
    const planId = PLAN_IDS[variant] || PLAN_IDS['CONTROL'];
    
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

  // ===== Preloading =====
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

  // ===== Webhook =====
  function sendWebhookAsync(email) {
    if (!email) return;

    const variant = getVariantFromFinishFlow();

    fetch('https://hook.eu2.make.com/bvwwlwpf8e55ta97akfieabw39309o5c', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        action: 'checkout_redirect_clicked',
        ab_variant: variant,
        ab_test: 'checkout_plan_test',
        timestamp: new Date().toISOString()
      }),
      keepalive: true
    }).catch(() => {});
  }

  // ===== Button Loader =====
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

  // ===== Event Listeners =====
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

  // ===== Debug =====
  window.debugABTest = function() {
    console.log('=== A/B TEST DEBUG ===');
    console.log('FinishFlow Variante:', getVariantFromFinishFlow());
    console.log('Zugeordneter Plan:', PLAN_IDS[getVariantFromFinishFlow()]);
  };

});

// Spinner CSS
const style = document.createElement('style');
style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);
