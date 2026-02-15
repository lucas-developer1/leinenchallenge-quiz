/**
 * Leinenchallenge Quiz Pitch - Head Script v1.7
 * GEÄNDERT: A/B-Test entfernt, Zahlungsplan wird per Checkbox gewählt
 * Checkout Preloading, Redirect, Webhook, Button Loader
 */

document.addEventListener('DOMContentLoaded', function() {

  // ===== PLAN KONFIGURATION =====
  let selectedPlan = null;  // Wird durch Checkbox gesetzt

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
  function buildRedirectURL(ft_anonymous_id, ft_session_id, email, firstName, planId) {
    const baseURL = 'https://start.hundetraining.de/product/598602';
    const customParam = `LC25-${ft_anonymous_id}-${ft_session_id}`;
    
    let url = `${baseURL}?`;
    
    if (planId) {
      url += `plan=${planId}&`;
    }
    
    url += `hide_plans&custom=${encodeURIComponent(customParam)}`;
    
    if (email) {
      url += `&email=${encodeURIComponent(email)}`;
    }
    
    if (firstName) {
      url += `&first_name=${encodeURIComponent(firstName)}`;
    }
    
    return url;
  }

  // ===== PRELOADING =====
  function preloadCheckoutPageOptimized() {
    const { ft_anonymous_id, ft_session_id } = getStorageValues();
    const email = getEmailFromStorage();
    const firstName = getFirstName();
    
    const redirectURL = buildRedirectURL(ft_anonymous_id, ft_session_id, email, firstName, selectedPlan);
    
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
  function sendWebhookAsync(email, planId) {
    if (!email) return;

    fetch('https://hook.eu2.make.com/bvwwlwpf8e55ta97akfieabw39309o5c', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        action: 'checkout_redirect_clicked',
        plan_id: planId || 'none',
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

  // ===== REDIRECT AUSFÜHREN =====
  function executeRedirect(planId, triggerElement) {
    if (triggerElement) {
      showButtonLoader(triggerElement);
    }

    const { ft_anonymous_id, ft_session_id } = getStorageValues();
    const email = getEmailFromStorage();
    const firstName = getFirstName();

    sendWebhookAsync(email, planId);

    const redirectURL = buildRedirectURL(ft_anonymous_id, ft_session_id, email, firstName, planId);
    window.location.href = redirectURL;
  }

 // ===== CHECKBOX PLAN-AUSWAHL (nur Auswahl, kein Redirect) =====
  var planCheckboxes = document.querySelectorAll('[data-checkout-plan]');

  planCheckboxes.forEach(function(label) {
    var input = label.querySelector('input[type="checkbox"]');
    if (!input) return;

    // Klick abfangen BEVOR die Checkbox sich ändert
    input.addEventListener('click', function(e) {
      // Wenn gerade gecheckt und abgewählt werden soll → prüfen
      if (input.checked) {
        var anyOtherChecked = false;
        planCheckboxes.forEach(function(otherLabel) {
          var otherInput = otherLabel.querySelector('input[type="checkbox"]');
          if (otherInput && otherInput !== input && otherInput.checked) anyOtherChecked = true;
        });

        if (!anyOtherChecked) {
          e.preventDefault();
          console.log('🔒 Mindestens eine Option muss gewählt sein');
          return;
        }
      }
    });

    // Change für Radio-Verhalten + Plan setzen
    input.addEventListener('change', function() {
      if (!input.checked) {
        if (selectedPlan === label.getAttribute('data-checkout-plan')) {
          selectedPlan = null;
        }
        return;
      }

      // Alle anderen unchecken
      planCheckboxes.forEach(function(otherLabel) {
        var otherInput = otherLabel.querySelector('input[type="checkbox"]');
        if (otherInput && otherInput !== input) {
          otherInput.checked = false;
          var customCheck = otherLabel.querySelector('.w-checkbox-input--inputType-custom');
          if (customCheck) {
            customCheck.classList.remove('w--redirected-checked');
          }
        }
      });

      selectedPlan = label.getAttribute('data-checkout-plan');
      console.log('✅ Plan gewählt:', selectedPlan);
    });
  });

  // Initial: selectedPlan aus vorausgewählter Checkbox setzen
  planCheckboxes.forEach(function(label) {
    var input = label.querySelector('input[type="checkbox"]');
    if (input && input.checked) {
      selectedPlan = label.getAttribute('data-checkout-plan');
      console.log('🔄 Initial Plan gesetzt:', selectedPlan);
    }
  });

  // ===== PRELOAD TRIGGER =====
  const preloadButton = document.getElementById('quiz_btn_step34');
  if (preloadButton) {
    preloadButton.addEventListener('click', function() {
      setTimeout(preloadCheckoutPageOptimized, 300);
    });
  }

  // ===== BESTEHENDE CHECKOUT BUTTONS (als Fallback) =====
  const checkoutButtons = document.querySelectorAll('[data-checkout-redirect="true"]');
  
  checkoutButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      executeRedirect(selectedPlan, button);
    });
  });

});

// Spinner CSS
const style = document.createElement('style');
style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);
