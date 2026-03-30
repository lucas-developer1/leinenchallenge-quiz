
document.addEventListener('DOMContentLoaded', function () {
  function setupSwipeToCloseStep1(stepId) {
    const modal = document.getElementById(stepId);
    if (!modal) return;
    
    const content = modal.querySelector('.f_p-wrapper-step1-popup');
    if (!content) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let isAtTop = true;
    const threshold = 200;

    function closeModal() {
      modal.style.transform = 'translateY(100%)';
      setTimeout(() => {
        modal.classList.remove('is-open');
        modal.style.transform = '';
      }, 300);
    }

    modal.addEventListener('touchstart', (e) => {
      if (!modal.classList.contains('is-open')) return;
      startY = e.touches[0].clientY;
      isAtTop = content.scrollTop <= 0;
    });

    modal.addEventListener('touchmove', (e) => {
      if (!modal.classList.contains('is-open')) return;
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      if (deltaY > 0 && isAtTop) {
        e.preventDefault();
        isDragging = true;
        modal.style.transform = `translateY(${deltaY}px)`;
      }
    }, { passive: false });

    modal.addEventListener('touchend', () => {
      if (!modal.classList.contains('is-open') || !isDragging) return;
      const deltaY = currentY - startY;
      if (deltaY > threshold) {
        closeModal();
      } else {
        modal.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        modal.style.transform = 'translateY(0)';
        setTimeout(() => { modal.style.transition = ''; }, 250);
      }
      isDragging = false;
    });
  }

  setupSwipeToCloseStep1('checkout-step-1');
  setupSwipeToCloseStep1('checkout-step-1-mobile');
});


  
!function(){
  window.finishPayState = {
    isCheckoutOpen: false,
    currentStep: null,
    lastStep: null,
    formData: {},
    bumperActive: false,
    hasBumper: false,
    removeOverlayActive: false,
    avatarOverlayActive: false,
    cardElementState: {
      "": { complete: false },
      "-mobile": { complete: false }
    }
  };
  function setupForms() {
    function setupForm(suffix) {
      var nameInput = document.getElementById("input-first-last-name" + suffix);
      var emailInput = document.getElementById("input-email" + suffix);
      var nextBtn = document.getElementById("next-button-step1" + suffix);
      var form = document.getElementById("f_p-checkout-step1-form" + suffix);
      if (!nameInput || !emailInput || !nextBtn) return;
      function handleSubmit(e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        var name = nameInput.value.trim();
        var email = emailInput.value.trim();
        var nameError = document.getElementById("input-name-field-error" + suffix);
        var emailError = document.getElementById("input-mail-field-error" + suffix);
        var hasError = false;
        if (!name || name.split(/\s+/).length < 2) {
          nameInput.classList.add("is-error");
          if (nameError) nameError.style.display = "block";
          hasError = true;
        } else {
          nameInput.classList.remove("is-error");
          if (nameError) nameError.style.display = "none";
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          emailInput.classList.add("is-error");
          if (emailError) emailError.style.display = "block";
          hasError = true;
        } else {
          emailInput.classList.remove("is-error");
          if (emailError) emailError.style.display = "none";
        }
        if (!hasError) {
          window.finishPayState.formData = { name: name, email: email };
          if (window.finishPayLoaded) {
            window.showStep2(suffix, name, email);
          } else {
            nextBtn.disabled = true;
            nextBtn.innerHTML = '<span class="fp-spinner"></span> Wird geladen...';
            window.finishPayPendingStep1 = { suffix: suffix, name: name, email: email };
          }
        }
        return false;
      }
      nextBtn.addEventListener("click", function(e) { e.preventDefault(); handleSubmit(e); });
      if (form) {
        form.removeAttribute("action");
        form.setAttribute("data-action", "none");
        form.onsubmit = function() { return false; };
        form.addEventListener("submit", function(e) {
          e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); return false;
        }, true);
      }
      [nameInput, emailInput].forEach(function(input) {
        input.addEventListener("keydown", function(e) {
          if (e.key === "Enter" || e.keyCode === 13) {
            e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
            handleSubmit(e); return false;
          }
        });
      });
    }
    setupForm("");
    setupForm("-mobile");
    ["fp_btn_1","fp_btn_2","fp_btn_3","fp_btn_4","fp_btn_5","fp_btn_6","fp_btn_7","fp_btn_8","fp_btn_9",
     "fp_btn_1-mobile","fp_btn_2-mobile","fp_btn_3-mobile","fp_btn_4-mobile","fp_btn_5-mobile",
     "fp_btn_6-mobile","fp_btn_7-mobile","fp_btn_8-mobile","fp_btn_9-mobile"].forEach(function(id) {
      var btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", function() {
          var suffix = id.includes("-mobile") ? "-mobile" : "";
          window.finishPayState.isCheckoutOpen = true;
          var lastStep = window.finishPayState.lastStep;
          if (lastStep) {
            var lastSuffix = lastStep.includes("-mobile") ? "-mobile" : "";
            if (lastSuffix === suffix) {
              var stepEl = document.querySelector(lastStep);
              if (stepEl) {
                stepEl.classList.add("is-open");
                window.finishPayState.currentStep = lastStep;
                return;
              }
            }
          }
          var step1 = document.getElementById("checkout-step-1" + suffix);
          if (step1) {
            step1.classList.add("is-open");
            window.finishPayState.currentStep = "#checkout-step-1" + suffix;
            setTimeout(function() {
              var input = document.getElementById("input-first-last-name" + suffix);
              if (input) input.focus();
            }, 100);
          }
        });
      }
    });
  }
  function setupCloseButtons() {
    var closeIds = [
      "close-step-1", "close-step-1-mobile",
      "close-step-2", "close-step-2-mobile",
      "close-step-3", "close-step-3-mobile",
      "close-step-4", "close-step-4-mobile",
      "close-step-card", "close-step-card-mobile"
    ];
    function attachCloseHandler(id) {
      var btn = document.getElementById(id);
      if (!btn) return;
      var newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        var currentOpen = document.querySelector('.is-open[id*="checkout-step"]');
        if (currentOpen) {
          window.finishPayState.lastStep = "#" + currentOpen.id;
          currentOpen.classList.remove("is-open");
        }
        window.finishPayState.isCheckoutOpen = false;
      });
    }
    closeIds.forEach(attachCloseHandler);
    setTimeout(function() { closeIds.forEach(attachCloseHandler); }, 1000);
    function attachAvatarCloseHandler(id) {
      var btn = document.getElementById(id);
      if (!btn) return;
      var newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        var suffix = id.includes("-mobile") ? "-mobile" : "";
        var avatarStep = document.getElementById("checkout-change-avatar" + suffix);
        if (avatarStep) avatarStep.classList.remove("is-open");
      });
    }
    ["close-change-avatar", "close-change-avatar-mobile"].forEach(attachAvatarCloseHandler);
    setTimeout(function() {
      ["close-change-avatar", "close-change-avatar-mobile"].forEach(attachAvatarCloseHandler);
    }, 1000);
  }
  window.showStep2 = function(suffix, name, email) {
    if (!window.finishPayState.hasBumper) {
      window.showStep3(suffix, name, email);
      return;
    }
    var current = document.querySelector('.is-open[id*="checkout-step"]');
    if (current) current.classList.remove("is-open");
    var step2 = document.getElementById("checkout-step-2" + suffix);
    if (step2) {
      step2.classList.add("is-open");
      window.finishPayState.currentStep = "#checkout-step-2" + suffix;
    }
    setTimeout(function() {
      var n = document.getElementById("input-name-changed" + suffix);
      var e = document.getElementById("input-email-changed" + suffix);
      if (n && name) n.value = name;
      if (e && email) e.value = email;
      var nameDisplay = document.getElementById("avatar-name-display" + suffix);
      var emailDisplay = document.getElementById("avatar-email-display" + suffix);
      if (nameDisplay && name) nameDisplay.textContent = name;
      if (emailDisplay && email) emailDisplay.textContent = email;
    }, 50);
  };
  window.showStep3 = function(suffix, name, email) {
    var current = document.querySelector('.is-open[id*="checkout-step"]');
    if (current) current.classList.remove("is-open");
    var step3 = document.getElementById("checkout-step-3" + suffix);
    if (step3) {
      step3.classList.add("is-open");
      window.finishPayState.currentStep = "#checkout-step-3" + suffix;
    }
    setTimeout(function() {
      var n = document.getElementById("input-name-changed" + suffix);
      var e = document.getElementById("input-email-changed" + suffix);
      if (n && name) n.value = name;
      if (e && email) e.value = email;
      var nameDisplay = document.getElementById("avatar-name-display" + suffix);
      var emailDisplay = document.getElementById("avatar-email-display" + suffix);
      if (nameDisplay && name) nameDisplay.textContent = name;
      if (emailDisplay && email) emailDisplay.textContent = email;
    }, 50);
  };
  function init() {
    setupForms();
    setupCloseButtons();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}();
</script>
<script>
!function(){
  // ── CONFIGURATION ─────────────────────────────────────────────
  var FP_CONFIG = {
    apiKey: "ft_pub_live_027863637884361a17ad99c73f767998_d63e2b88",
    productId: "prod_g6h7i8j9k0l1m2n3o4p5q6r7",
    planId: "plan_h7i8j9k0l1m2n3o4p5q6r7s8",
    originalPriceMain: 19900,
    // bumperProductId: "prod_...",
    // bumperPlanId: "plan_...",
    // originalPriceBumper: 0,
  };
  var SDK_URL = "https://cdn.api-finish.com/finish-pay.min.js?v=8";
  var TRANSIT_URL = "https://golftraining.de/sichere-weiterleitung";
  // ── END CONFIGURATION ─────────────────────────────────────────

  var cardsInitialized = { "": false, "-mobile": false };
  var productPlanReady = false;
  var bumperReady = false;
  var mainPlanData = null;
  var bumperData = null;
  var COUNTRY_MAP = {
    "Deutschland": "DE", "Österreich": "AT", "Schweiz": "CH",
    "Frankreich": "FR", "Italien": "IT", "Spanien": "ES",
    "Niederlande": "NL", "Belgien": "BE", "Polen": "PL",
    "Tschechien": "CZ", "Dänemark": "DK", "Schweden": "SE",
    "Norwegen": "NO", "Finnland": "FI", "Portugal": "PT",
    "Griechenland": "GR", "Irland": "IE", "Luxemburg": "LU",
    "Vereinigtes Königreich": "GB", "Vereinigte Staaten": "US",
    "Kanada": "CA", "Australien": "AU", "Japan": "JP"
  };
  function getFP() {
    return window.FinishPay.default || window.FinishPay;
  }
  function formatPriceFull(amountCents, currency) {
    var amount = (amountCents / 100).toFixed(2).replace('.', ',');
    if (currency === 'EUR') return amount + '\u00A0€';
    return amount + '\u00A0' + currency;
  }
  function formatPrice(amountCents, currency) {
    var euros = Math.floor(amountCents / 100);
    var cents = amountCents % 100;
    if (cents === 0) {
      if (currency === 'EUR') return euros + '\u00A0€';
      return euros + '\u00A0' + currency;
    }
    var amount = (amountCents / 100).toFixed(2).replace('.', ',');
    if (currency === 'EUR') return amount + '\u00A0€';
    return amount + '\u00A0' + currency;
  }
  function updateAllPrices() {
    if (!mainPlanData) return;
    var currency = mainPlanData.currency || 'EUR';
    var actualPriceMain = mainPlanData.amount_cents;
    var actualPriceBumper = (window.finishPayState.bumperActive && bumperData) ? bumperData.plan.amount_cents : 0;
    var totalActual = actualPriceMain + actualPriceBumper;
    var originalPriceMain = FP_CONFIG.originalPriceMain;
    var originalPriceBumper = window.finishPayState.bumperActive ? FP_CONFIG.originalPriceBumper : 0;
    var subtotal = originalPriceMain + originalPriceBumper;
    var discountMain = originalPriceMain - actualPriceMain;
    var discountBumper = window.finishPayState.bumperActive ? (FP_CONFIG.originalPriceBumper - bumperData.plan.amount_cents) : 0;
    var totalDiscount = discountMain + discountBumper;
    document.querySelectorAll('[data-fp-subtotal]').forEach(function(el) {
      el.textContent = formatPriceFull(subtotal, currency);
    });
    document.querySelectorAll('[data-fp-discount]').forEach(function(el) {
      el.textContent = totalDiscount > 0 ? '-' + formatPriceFull(totalDiscount, currency) : formatPriceFull(0, currency);
    });
    document.querySelectorAll('[data-fp-total-price]').forEach(function(el) {
      el.textContent = formatPrice(totalActual, currency);
    });
    document.querySelectorAll('[data-fp-main-original]').forEach(function(el) {
      el.textContent = formatPrice(originalPriceMain, currency);
    });
    document.querySelectorAll('[data-fp-main-price]').forEach(function(el) {
      el.textContent = formatPrice(actualPriceMain, currency);
    });
    document.querySelectorAll('[data-fp-main-discount]').forEach(function(el) {
      el.textContent = discountMain > 0 ? '-' + formatPrice(discountMain, currency) : formatPrice(0, currency);
    });
    document.querySelectorAll('[data-fp-bumper-original]').forEach(function(el) {
      el.textContent = formatPrice(FP_CONFIG.originalPriceBumper, currency);
    });
    document.querySelectorAll('[data-fp-bumper-price], [data-bumper-price]').forEach(function(el) {
      el.textContent = formatPrice(bumperData ? bumperData.plan.amount_cents : 0, currency);
    });
    document.querySelectorAll('[data-fp-bumper-discount]').forEach(function(el) {
      var bumperDiscount = bumperData ? (FP_CONFIG.originalPriceBumper - bumperData.plan.amount_cents) : 0;
      el.textContent = bumperDiscount > 0 ? '-' + formatPrice(bumperDiscount, currency) : formatPrice(0, currency);
    });
    ["", "-mobile"].forEach(function(suffix) {
      var basePriceEl = document.getElementById("checkout-base-price" + suffix);
      if (basePriceEl) basePriceEl.textContent = formatPrice(actualPriceMain, currency);
      var bumperPriceEl = document.getElementById("bumper-price" + suffix);
      if (bumperPriceEl && bumperData) bumperPriceEl.textContent = formatPrice(bumperData.plan.amount_cents, currency);
      var totalPriceEl = document.getElementById("checkout-total-price" + suffix);
      if (totalPriceEl) totalPriceEl.textContent = formatPrice(totalActual, currency);
      var subtotalEl = document.getElementById("checkout-subtotal" + suffix);
      if (subtotalEl) subtotalEl.textContent = formatPriceFull(subtotal, currency);
      var discountEl = document.getElementById("checkout-discount" + suffix);
      if (discountEl) discountEl.textContent = totalDiscount > 0 ? '-' + formatPriceFull(totalDiscount, currency) : formatPriceFull(0, currency);
    });
  }
  function updateBumperInfoDisplay() {
    if (!bumperData) return;
    var priceText = formatPrice(bumperData.plan.amount_cents, bumperData.plan.currency || 'EUR');
    var originalPriceText = formatPrice(FP_CONFIG.originalPriceBumper, bumperData.plan.currency || 'EUR');
    var nameText = bumperData.product.name || "";
    var descriptionText = bumperData.product.description || "";
    var planNameText = bumperData.plan.name || "";
    document.querySelectorAll('[data-bumper-price]').forEach(function(el) { el.textContent = priceText; });
    document.querySelectorAll('[data-bumper-original]').forEach(function(el) { el.textContent = originalPriceText; });
    document.querySelectorAll('[data-bumper-name]').forEach(function(el) { el.textContent = nameText; });
    document.querySelectorAll('[data-bumper-description]').forEach(function(el) { el.textContent = descriptionText; });
    document.querySelectorAll('[data-bumper-plan-name]').forEach(function(el) { el.textContent = planNameText; });
    ["", "-mobile"].forEach(function(suffix) {
      var priceEl = document.getElementById("bumper-price" + suffix);
      if (priceEl) priceEl.textContent = priceText;
      var nameEl = document.getElementById("bumper-name" + suffix);
      if (nameEl) nameEl.textContent = nameText;
      var descEl = document.getElementById("bumper-description" + suffix);
      if (descEl) descEl.textContent = descriptionText;
    });
  }
  function updateMainProductInfoDisplay() {
    var FP = getFP();
    var product = FP.getProduct();
    if (!product) return;
    var nameText = product.name || "";
    var descriptionText = product.description || "";
    var priceText = mainPlanData ? formatPrice(mainPlanData.amount_cents, mainPlanData.currency || 'EUR') : "";
    var originalPriceText = formatPrice(FP_CONFIG.originalPriceMain, 'EUR');
    document.querySelectorAll('[data-main-name]').forEach(function(el) { el.textContent = nameText; });
    document.querySelectorAll('[data-main-description]').forEach(function(el) { el.textContent = descriptionText; });
    document.querySelectorAll('[data-main-price]').forEach(function(el) { el.textContent = priceText; });
    document.querySelectorAll('[data-main-original]').forEach(function(el) { el.textContent = originalPriceText; });
  }
  window.updateOrderBumpDisplay = function(suffix) {
    var orderBump = document.getElementById("order-bump-1" + suffix);
    if (!orderBump) orderBump = document.getElementById("order-bump-1");
    var isActive = window.finishPayState.bumperActive && bumperReady;
    if (!orderBump) return;
    if (isActive && bumperData) {
      orderBump.style.display = "grid";
      orderBump.style.visibility = "visible";
      orderBump.style.opacity = "1";
      var priceEl = orderBump.querySelector('[data-bumper-price]');
      if (priceEl) priceEl.textContent = formatPrice(bumperData.plan.amount_cents, bumperData.plan.currency || 'EUR');
      var nameEl = orderBump.querySelector('[data-bumper-name]');
      if (nameEl) nameEl.textContent = bumperData.product.name;
    } else {
      orderBump.style.display = "none";
    }
    updateAllPrices();
  };
  function setupRemoveOverlay() {
    ["", "-mobile"].forEach(function(suffix) {
      var openBtn = document.getElementById("f_p-remove-button-1" + suffix);
      if (openBtn) {
        var newOpenBtn = openBtn.cloneNode(true);
        openBtn.parentNode.replaceChild(newOpenBtn, openBtn);
        newOpenBtn.addEventListener("click", function(e) {
          e.preventDefault(); e.stopPropagation();
          var overlay = document.getElementById("overlay-remove-product-1" + suffix);
          if (!overlay) overlay = document.getElementById("overlay-remove-product-1");
          if (overlay) {
            overlay.classList.add("is-open");
            window.finishPayState.removeOverlayActive = true;
          }
        });
      }
      var overlay = document.getElementById("overlay-remove-product-1" + suffix);
      if (overlay) {
        overlay.addEventListener("click", function(e) {
          if (e.target === overlay || e.target.closest('#overlay-remove-product-1' + suffix) === overlay) {
            e.preventDefault(); e.stopPropagation();
            overlay.classList.remove("is-open");
            window.finishPayState.removeOverlayActive = false;
            deactivateBumper();
          }
        });
      }
    });
    document.addEventListener("click", function(e) {
      if (!window.finishPayState.removeOverlayActive) return;
      var overlay = document.getElementById("overlay-remove-product-1");
      var overlayMobile = document.getElementById("overlay-remove-product-1-mobile");
      var openBtn = document.getElementById("f_p-remove-button-1");
      var openBtnMobile = document.getElementById("f_p-remove-button-1-mobile");
      var clickedOnOverlay = (overlay && (e.target === overlay || overlay.contains(e.target))) ||
                             (overlayMobile && (e.target === overlayMobile || overlayMobile.contains(e.target)));
      var clickedOnOpenBtn = (openBtn && (e.target === openBtn || openBtn.contains(e.target))) ||
                             (openBtnMobile && (e.target === openBtnMobile || openBtnMobile.contains(e.target)));
      if (!clickedOnOverlay && !clickedOnOpenBtn) {
        if (overlay) overlay.classList.remove("is-open");
        if (overlayMobile) overlayMobile.classList.remove("is-open");
        window.finishPayState.removeOverlayActive = false;
      }
    });
  }
  function setupChangeAvatarOverlay() {
    ["", "-mobile"].forEach(function(suffix) {
      var openBtn = document.getElementById("change-avatar-button" + suffix);
      if (openBtn) {
        var newOpenBtn = openBtn.cloneNode(true);
        openBtn.parentNode.replaceChild(newOpenBtn, openBtn);
        newOpenBtn.addEventListener("click", function(e) {
          e.preventDefault(); e.stopPropagation();
          var ov = document.getElementById("overlay-change-avatar" + suffix);
          if (!ov) ov = document.getElementById("overlay-change-avatar");
          if (ov) {
            ov.classList.add("is-open");
            window.finishPayState.avatarOverlayActive = true;
          }
        });
      }
      var overlay = document.getElementById("overlay-change-avatar" + suffix);
      if (overlay) {
        overlay.addEventListener("click", function(e) {
          if (e.target === overlay || e.target.closest('#overlay-change-avatar' + suffix) === overlay) {
            e.preventDefault(); e.stopPropagation();
            overlay.classList.remove("is-open");
            window.finishPayState.avatarOverlayActive = false;
            var step = document.getElementById("checkout-change-avatar" + suffix);
            if (step) step.classList.add("is-open");
          }
        });
      }
    });
    document.addEventListener("click", function(e) {
      if (!window.finishPayState.avatarOverlayActive) return;
      var overlay = document.getElementById("overlay-change-avatar");
      var overlayMobile = document.getElementById("overlay-change-avatar-mobile");
      var openBtn = document.getElementById("change-avatar-button");
      var openBtnMobile = document.getElementById("change-avatar-button-mobile");
      var clickedOnOverlay = (overlay && (e.target === overlay || overlay.contains(e.target))) ||
                             (overlayMobile && (e.target === overlayMobile || overlayMobile.contains(e.target)));
      var clickedOnOpenBtn = (openBtn && (e.target === openBtn || openBtn.contains(e.target))) ||
                             (openBtnMobile && (e.target === openBtnMobile || openBtnMobile.contains(e.target)));
      if (!clickedOnOverlay && !clickedOnOpenBtn) {
        if (overlay) overlay.classList.remove("is-open");
        if (overlayMobile) overlayMobile.classList.remove("is-open");
        window.finishPayState.avatarOverlayActive = false;
      }
    });
  }
  function activateBumper() {
    if (!bumperReady) return;
    var FP = getFP();
    if (FP.activateBumper) FP.activateBumper();
    window.finishPayState.bumperActive = true;
    window.updateOrderBumpDisplay("");
    window.updateOrderBumpDisplay("-mobile");
    updateAllPrices();
  }
  function deactivateBumper() {
    var FP = getFP();
    if (bumperReady && FP.deactivateBumper) FP.deactivateBumper();
    window.finishPayState.bumperActive = false;
    ["", "-mobile"].forEach(function(suffix) {
      var orderBump = document.getElementById("order-bump-1" + suffix);
      if (orderBump) orderBump.style.display = "none";
    });
    updateAllPrices();
  }
  function getCustomerData(suffix) {
    var nameEl = document.getElementById("input-name-changed" + suffix);
    var emailEl = document.getElementById("input-email-changed" + suffix);
    var countryEl = document.getElementById("input-country-changed" + suffix);
    var name = nameEl && nameEl.value ? nameEl.value.trim() : "";
    var email = emailEl && emailEl.value ? emailEl.value.trim() : "";
    var country = countryEl && countryEl.value ? countryEl.value.trim() : "Deutschland";
    var countryCode = COUNTRY_MAP[country] || "DE";
    var parts = name.trim().split(/\s+/);
    var lastName = parts.length > 1 ? parts.pop() : "";
    var firstName = parts.join(" ");
    return { name: name, email: email, country: country, countryCode: countryCode, firstName: firstName, lastName: lastName };
  }
  function showError(suffix, msg) {
    var overlay = document.getElementById("overlay-safe-connection" + suffix);
    if (overlay) overlay.classList.remove("is-open");
    alert("Zahlungsfehler: " + msg);
  }
  function setButtonLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn._origHTML = btn.innerHTML;
      btn.innerHTML = '<span class="fp-spinner"></span> Verarbeitung...';
      btn.disabled = true;
    } else {
      if (btn._origHTML) btn.innerHTML = btn._origHTML;
      btn.disabled = false;
    }
  }
  function initCardElement(suffix) {
    if (cardsInitialized[suffix]) return;
    cardsInitialized[suffix] = true;
    var FP = getFP();
    var containerId = suffix === "-mobile" ? "stripe-card-element-mobile" : "stripe-card-element";
    try {
      var card = FP.mountCardElement(containerId, { hidePostalCode: true, suffix: suffix });
      card.on("change", function(event) {
        window.dispatchEvent(new CustomEvent("cardStateChanged", { detail: { suffix: suffix, complete: event.complete } }));
      });
    } catch (err) {
      console.error("[FinishPay] Card mount error:", err);
    }
  }
  function updateCardButtonState(suffix, complete) {
    var btn = document.getElementById("next-button-step4" + suffix);
    if (btn) {
      if (complete) { btn.style.opacity = "1"; btn.style.cursor = "pointer"; }
      else { btn.style.opacity = "0.5"; btn.style.cursor = "not-allowed"; }
    }
  }
  function handlePayment(method, suffix) {
    if (!productPlanReady) {
      showError(suffix, "Produkt oder Zahlungsplan konnte nicht geladen werden. Bitte Seite neu laden.");
      return;
    }
    var FP = getFP();
    var customer = getCustomerData(suffix);
    var overlay = document.getElementById("overlay-safe-connection" + suffix);
    if (overlay) overlay.classList.add("is-open");
    (async function() {
      try {
        var intent = await FP.createPaymentIntent({
          email: customer.email,
          name: customer.name,
          country: customer.countryCode,
          payment_method_type: method === "applepay" || method === "googlepay" ? "card" : method,
        });
        if (!intent || !intent.client_secret) throw new Error("Kein PaymentIntent erhalten");
        var result;
        if (method === "card") {
          result = await FP.confirmCardPayment(intent.client_secret, {
            name: customer.name, email: customer.email, address: { country: customer.countryCode }
          }, suffix);
        } else if (method === "paypal") {
          result = await FP.confirmPayPalPayment(intent.client_secret, TRANSIT_URL);
        } else if (method === "klarna") {
          result = await FP.confirmKlarnaPayment(intent.client_secret, {
            email: customer.email, name: customer.name, address: { country: customer.countryCode }
          }, TRANSIT_URL);
        } else if (method === "applepay" || method === "googlepay") {
          var cart = FP.getCartTotal();
          result = await FP.processWalletPayment(intent.client_secret, {
            amount: cart.amount_cents, currency: cart.currency, label: "Bezahlung", country: customer.countryCode,
          });
        }
        if (result && result.success) {
          window.location.href = TRANSIT_URL + "?payment_intent=" + encodeURIComponent(intent.payment_intent_id) + "&redirect_status=succeeded";
        } else if (result && result.error) {
          showError(suffix, result.error);
        }
      } catch (err) {
        console.error("[FinishPay] Payment error:", err);
        showError(suffix, err.message || "Zahlung fehlgeschlagen");
      }
    })();
  }
  function setupPaymentButtons() {
    ["", "-mobile"].forEach(function(suffix) {
      ["applepay", "googlepay", "paypal", "klarna"].forEach(function(method) {
        var btn = document.getElementById("button-method-" + method + suffix);
        if (btn) {
          btn.addEventListener("click", function(e) {
            e.preventDefault(); e.stopPropagation();
            var current = document.querySelector('.is-open[id*="checkout-step"]');
            if (current) current.classList.remove("is-open");
            var step4 = document.getElementById("checkout-step-4" + suffix);
            if (step4) {
              step4.classList.add("is-open");
              window.finishPayState.currentStep = "#checkout-step-4" + suffix;
              ["card","applepay","googlepay","paypal","klarna"].forEach(function(m) {
                var el = document.getElementById("checkout-finish-" + m + suffix);
                if (el) el.style.display = "none";
              });
              var finishBtn = document.getElementById("checkout-finish-" + method + suffix);
              if (finishBtn) finishBtn.style.display = "flex";
              window.updateOrderBumpDisplay(suffix);
            }
          });
        }
      });
      var cardBtn = document.getElementById("button-method-card" + suffix);
      if (cardBtn) {
        cardBtn.addEventListener("click", function(e) {
          e.preventDefault(); e.stopPropagation();
          var current = document.querySelector('.is-open[id*="checkout-step"]');
          if (current) current.classList.remove("is-open");
          var stepCard = document.getElementById("checkout-step-card" + suffix);
          if (stepCard) {
            stepCard.classList.add("is-open");
            window.finishPayState.currentStep = "#checkout-step-card" + suffix;
            initCardElement(suffix);
          }
        });
      }
      var nextStep4Btn = document.getElementById("next-button-step4" + suffix);
      if (nextStep4Btn) {
        var newBtn = nextStep4Btn.cloneNode(true);
        nextStep4Btn.parentNode.replaceChild(newBtn, nextStep4Btn);
        newBtn.addEventListener("click", function(e) {
          e.preventDefault(); e.stopPropagation();
          var cardState = window.finishPayState.cardElementState[suffix];
          if (cardState && cardState.complete) {
            var current = document.querySelector('.is-open[id*="checkout-step"]');
            if (current) current.classList.remove("is-open");
            var step4 = document.getElementById("checkout-step-4" + suffix);
            if (step4) {
              step4.classList.add("is-open");
              window.finishPayState.currentStep = "#checkout-step-4" + suffix;
              ["card","applepay","googlepay","paypal","klarna"].forEach(function(m) {
                var el = document.getElementById("checkout-finish-" + m + suffix);
                if (el) el.style.display = "none";
              });
              var cardFinish = document.getElementById("checkout-finish-card" + suffix);
              if (cardFinish) cardFinish.style.display = "flex";
              window.updateOrderBumpDisplay(suffix);
            }
          } else {
            alert("Bitte geben Sie gültige Kartendaten ein.");
          }
        });
      }
      ["card", "applepay", "googlepay", "paypal", "klarna"].forEach(function(method) {
        var btn = document.getElementById("checkout-finish-" + method + suffix);
        if (btn) {
          var newBtn = btn.cloneNode(true);
          btn.parentNode.replaceChild(newBtn, btn);
          newBtn.addEventListener("click", function(e) {
            e.preventDefault(); e.stopPropagation();
            setButtonLoading(newBtn, true);
            handlePayment(method, suffix);
            setTimeout(function() { setButtonLoading(newBtn, false); }, 10000);
          });
        }
      });
    });
  }
  function setupBumperButtons() {
    ["", "-mobile"].forEach(function(suffix) {
      var yesBtn = document.getElementById("next-button-step2" + suffix);
      if (yesBtn) {
        var newYesBtn = yesBtn.cloneNode(true);
        yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
        newYesBtn.addEventListener("click", function(e) {
          e.preventDefault(); e.stopPropagation();
          activateBumper();
          var formData = window.finishPayState.formData;
          window.showStep3(suffix, formData.name, formData.email);
        });
      }
      var noBtn = document.getElementById("no-next-button-step2" + suffix);
      if (noBtn) {
        var newNoBtn = noBtn.cloneNode(true);
        noBtn.parentNode.replaceChild(newNoBtn, noBtn);
        newNoBtn.addEventListener("click", function(e) {
          e.preventDefault(); e.stopPropagation();
          deactivateBumper();
          var formData = window.finishPayState.formData;
          window.showStep3(suffix, formData.name, formData.email);
        });
      }
    });
  }
  function setupBackButtons() {
    ["", "-mobile"].forEach(function(suffix) {
      var back2 = document.getElementById("back-step-2" + suffix);
      if (back2) {
        var nb = back2.cloneNode(true); back2.parentNode.replaceChild(nb, back2);
        nb.addEventListener("click", function(e) {
          e.preventDefault(); e.stopPropagation();
          var c = document.querySelector('.is-open[id*="checkout-step"]'); if (c) c.classList.remove("is-open");
          var s1 = document.getElementById("checkout-step-1" + suffix);
          if (s1) { s1.classList.add("is-open"); window.finishPayState.currentStep = "#checkout-step-1" + suffix; }
        });
      }
      var back3 = document.getElementById("back-step-3" + suffix);
      if (back3) {
        var nb = back3.cloneNode(true); back3.parentNode.replaceChild(nb, back3);
        nb.addEventListener("click", function(e) {
          e.preventDefault(); e.stopPropagation();
          var c = document.querySelector('.is-open[id*="checkout-step"]'); if (c) c.classList.remove("is-open");
          if (window.finishPayState.hasBumper) {
            var s2 = document.getElementById("checkout-step-2" + suffix);
            if (s2) { s2.classList.add("is-open"); window.finishPayState.currentStep = "#checkout-step-2" + suffix; }
          } else {
            var s1 = document.getElementById("checkout-step-1" + suffix);
            if (s1) { s1.classList.add("is-open"); window.finishPayState.currentStep = "#checkout-step-1" + suffix; }
          }
        });
      }
      var backCard = document.getElementById("back-step-card" + suffix);
      if (backCard) {
        var nb = backCard.cloneNode(true); backCard.parentNode.replaceChild(nb, backCard);
        nb.addEventListener("click", function(e) {
          e.preventDefault(); e.stopPropagation();
          var c = document.querySelector('.is-open[id*="checkout-step"]'); if (c) c.classList.remove("is-open");
          var s3 = document.getElementById("checkout-step-3" + suffix);
          if (s3) { s3.classList.add("is-open"); window.finishPayState.currentStep = "#checkout-step-3" + suffix; }
        });
      }
      var back4 = document.getElementById("back-step-4" + suffix);
      if (back4) {
        var nb = back4.cloneNode(true); back4.parentNode.replaceChild(nb, back4);
        nb.addEventListener("click", function(e) {
          e.preventDefault(); e.stopPropagation();
          var c = document.querySelector('.is-open[id*="checkout-step"]'); if (c) c.classList.remove("is-open");
          var s3 = document.getElementById("checkout-step-3" + suffix);
          if (s3) { s3.classList.add("is-open"); window.finishPayState.currentStep = "#checkout-step-3" + suffix; }
        });
      }
      var backAvatar = document.getElementById("back-change-avatar" + suffix);
      if (backAvatar) {
        var nb = backAvatar.cloneNode(true); backAvatar.parentNode.replaceChild(nb, backAvatar);
        nb.addEventListener("click", function(e) {
          e.preventDefault(); e.stopPropagation();
          var avatarStep = document.getElementById("checkout-change-avatar" + suffix);
          if (avatarStep) avatarStep.classList.remove("is-open");
        });
      }
      var saveAvatar = document.getElementById("safe-change-avatar" + suffix);
      if (saveAvatar) {
        var nb = saveAvatar.cloneNode(true); saveAvatar.parentNode.replaceChild(nb, saveAvatar);
        nb.addEventListener("click", function(e) {
          e.preventDefault(); e.stopPropagation();
          var nameEl = document.getElementById("input-name-changed" + suffix);
          var emailEl = document.getElementById("input-email-changed" + suffix);
          var newName = nameEl && nameEl.value ? nameEl.value.trim() : "";
          var newEmail = emailEl && emailEl.value ? emailEl.value.trim() : "";
          if (newName) window.finishPayState.formData.name = newName;
          if (newEmail) window.finishPayState.formData.email = newEmail;
          var nameDisplay = document.getElementById("avatar-name-display" + suffix);
          var emailDisplay = document.getElementById("avatar-email-display" + suffix);
          if (nameDisplay && newName) nameDisplay.textContent = newName;
          if (emailDisplay && newEmail) emailDisplay.textContent = newEmail;
          var avatarStep = document.getElementById("checkout-change-avatar" + suffix);
          if (avatarStep) avatarStep.classList.remove("is-open");
        });
      }
    });
  }
  var script = document.createElement("script");
  script.src = SDK_URL;
  script.async = true;
  script.onload = function() {
    var FP = getFP();
    var initSDK = async function() {
      try {
        await FP.init({ apiKey: FP_CONFIG.apiKey });
        try {
          await FP.setProduct(FP_CONFIG.productId);
          await FP.setPaymentPlan(FP_CONFIG.planId);
          mainPlanData = FP.getPaymentPlan();
          productPlanReady = true;
          updateMainProductInfoDisplay();
          if (FP_CONFIG.bumperProductId && FP_CONFIG.bumperPlanId) {
            try {
              await FP.setBumper(FP_CONFIG.bumperProductId, FP_CONFIG.bumperPlanId);
              bumperData = FP.getBumper();
              bumperReady = true;
              window.finishPayState.hasBumper = true;
              updateBumperInfoDisplay();
              updateAllPrices();
            } catch (bumperErr) {
              console.warn("[FinishPay] Bumper setup failed:", bumperErr.message);
            }
          }
        } catch (err) {
          console.error("[FinishPay] Product/plan setup failed:", err.message);
        }
        try {
          if (typeof FP.checkWalletAvailability === "function") {
            var wallets = await FP.checkWalletAvailability();
            if (!wallets.applePay) {
              document.querySelectorAll('[id*="button-method-applepay"], [id*="checkout-finish-applepay"]').forEach(function(el) { el.style.display = "none"; });
            }
            if (!wallets.googlePay) {
              document.querySelectorAll('[id*="button-method-googlepay"], [id*="checkout-finish-googlepay"]').forEach(function(el) { el.style.display = "none"; });
            }
          }
        } catch (err) {}
        try {
          if (typeof FP.getCountryFromIP === "function") {
            FP.getCountryFromIP().then(function(country) {
              ["input-country-changed", "input-country-changed-mobile", "input-country", "input-country-mobile"].forEach(function(id) {
                var el = document.getElementById(id);
                if (el && !el.value) el.value = country;
              });
            }).catch(function() {});
          }
        } catch (err) {}
      } catch (error) {
        console.error("[FinishPay] Init error:", error);
      }
      window.finishPayLoaded = true;
      setupPaymentButtons();
      setupBumperButtons();
      setupBackButtons();
      setupRemoveOverlay();
      setupChangeAvatarOverlay();
      if (window.finishPayPendingStep1) {
        var p = window.finishPayPendingStep1;
        window.showStep2(p.suffix, p.name, p.email);
        var pendingBtn = document.getElementById("next-button-step1" + p.suffix);
        if (pendingBtn) { pendingBtn.disabled = false; pendingBtn.textContent = "Weiter"; }
        delete window.finishPayPendingStep1;
      }
    };
    initSDK();
  };
  document.head.appendChild(script);
  window.addEventListener("cardStateChanged", function(e) {
    updateCardButtonState(e.detail.suffix, e.detail.complete);
    if (window.finishPayState.cardElementState[e.detail.suffix]) {
      window.finishPayState.cardElementState[e.detail.suffix].complete = e.detail.complete;
    }
  });
  window.addEventListener("beforeunload", function() {
    setTimeout(function() {
      var o = document.getElementById("overlay-safe-connection");
      var om = document.getElementById("overlay-safe-connection-mobile");
      if (o) o.classList.remove("is-open");
      if (om) om.classList.remove("is-open");
    }, 3000);
  });
}();











                                                      
// ============================================================
// FINISH PAY EXTENSIONS
// Nach dem bestehenden finish_pay Script einfügen
// ============================================================
document.addEventListener('DOMContentLoaded', function () {

  // ── 1. STEP 1 VORAUSFÜLLEN ───────────────────────────────
  // Liest aus Quiz-Inputs, dann localStorage als Fallback
  function prefillStep1() {
    // Vorname: Quiz-Input → localStorage
    var firstNameEl = document.getElementById('first_name');
    var firstName   = (firstNameEl && firstNameEl.value.trim())
                      || localStorage.getItem('firstName')
                      || '';

    // Email: Quiz-Input → localStorage
    var emailEl  = document.getElementById('email_adress');
    var email    = (emailEl && emailEl.value.trim())
                   || localStorage.getItem('lc_useremail')
                   || '';

    ['', '-mobile'].forEach(function (suffix) {
      var nameInput  = document.getElementById('input-first-last-name' + suffix);
      var emailInput = document.getElementById('input-email' + suffix);

      // Nur vorausfüllen wenn noch leer
      if (nameInput && !nameInput.value && firstName) {
        nameInput.value = firstName;
      }
      if (emailInput && !emailInput.value && email) {
        emailInput.value = email;
      }

      // Live-Sync: Wenn Name geändert → Avatar aktualisieren
      if (nameInput) {
        nameInput.addEventListener('input', function () {
          updateAvatarName(nameInput.value.trim(), suffix);
        });
      }
    });
  }

  // Sofort versuchen + nochmal nach kurzer Verzögerung
  // (falls finish_pay die Inputs noch nicht gerendert hat)
  prefillStep1();
  setTimeout(prefillStep1, 600);


  // ── 2. AVATAR NAME SYNC ──────────────────────────────────
  function updateAvatarName(name, suffix) {
    var display = document.getElementById('avatar-name-display' + suffix);
    if (display && name) display.textContent = name;
  }


  // ── 3. NEUER NACHNAME-STEP (vor Karten-Step) ────────────
  // Webflow-Elemente die du anlegen musst:
  //   checkout-step-lastname        / checkout-step-lastname-mobile
  //   input-lastname                / input-lastname-mobile
  //   input-lastname-error          / input-lastname-error-mobile
  //   next-button-step-lastname     / next-button-step-lastname-mobile
  //   back-step-lastname            / back-step-lastname-mobile

  function setupLastnameStep() {
    ['', '-mobile'].forEach(function (suffix) {

      var step     = document.getElementById('checkout-step-lastname' + suffix);
      var input    = document.getElementById('input-lastname' + suffix);
      var nextBtn  = document.getElementById('next-button-step-lastname' + suffix);
      var backBtn  = document.getElementById('back-step-lastname' + suffix);
      var closeBtn = document.getElementById('close-step-lastname' + suffix);
      var errorEl  = document.getElementById('input-lastname-error' + suffix);

      if (!step || !nextBtn) return;

      // ── Close-Button ─────────────────────────────────────
      if (closeBtn) {
        var newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

        newCloseBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          step.classList.remove('is-open');
          if (window.finishPayState) {
            window.finishPayState.lastStep = '#checkout-step-lastname' + suffix;
            window.finishPayState.isCheckoutOpen = false;
          }
        });
      }

      // ── Email Display befüllen ────────────────────────────
      // Wird beim Öffnen des Steps gesetzt (siehe overrideCardButton)

      // ── Weiter-Button ─────────────────────────────────────
      var newNextBtn = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

      newNextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var lastName = input ? input.value.trim() : '';

        if (!lastName) {
          if (input)   input.classList.add('is-error');
          if (errorEl) errorEl.style.display = 'block';
          return;
        }

        if (input)   input.classList.remove('is-error');
        if (errorEl) errorEl.style.display = 'none';

        // Vollen Namen zusammensetzen
        var firstNameInput = document.getElementById('input-first-last-name' + suffix);
        var firstName      = firstNameInput ? firstNameInput.value.trim() : '';
        var fullName       = (firstName + ' ' + lastName).trim();

        var nameChangedEl = document.getElementById('input-name-changed' + suffix);
        if (nameChangedEl) nameChangedEl.value = fullName;

        updateAvatarName(fullName, suffix);

        if (window.finishPayState) {
          window.finishPayState.formData.name = fullName;
        }

        // Zum Karten-Step wechseln
        var current = document.querySelector('.is-open[id*="checkout-step"]');
        if (current) current.classList.remove('is-open');

        var cardStep = document.getElementById('checkout-step-card' + suffix);
        if (cardStep) {
          cardStep.classList.add('is-open');
          if (window.finishPayState) {
            window.finishPayState.currentStep = '#checkout-step-card' + suffix;
          }
          var evt = new CustomEvent('fp:initCard', { detail: { suffix: suffix } });
          window.dispatchEvent(evt);
        }
      });

      // ── Zurück-Button ─────────────────────────────────────
      if (backBtn) {
        var newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);

        newBackBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();

          var current = document.querySelector('.is-open[id*="checkout-step"]');
          if (current) current.classList.remove('is-open');

          var step3 = document.getElementById('checkout-step-3' + suffix);
          if (step3) {
            step3.classList.add('is-open');
            if (window.finishPayState) {
              window.finishPayState.currentStep = '#checkout-step-3' + suffix;
            }
          }
        });
      }
    });
  }

  // Warten bis finish_pay vollständig geladen ist
  function waitForFinishPay(callback) {
    if (window.finishPayLoaded) {
      callback();
    } else {
      var interval = setInterval(function () {
        if (window.finishPayLoaded) {
          clearInterval(interval);
          callback();
        }
      }, 100);
    }
  }

  // ── 4. KARTEN-BUTTON → NACHNAME-STEP UMLEITEN ───────────
  // Überschreibt den bestehenden card-Button Click-Handler
  function overrideCardButton() {
    ['', '-mobile'].forEach(function (suffix) {
      var cardBtn = document.getElementById('button-method-card' + suffix);
      if (!cardBtn) return;

      var lastnameStep = document.getElementById('checkout-step-lastname' + suffix);

      // Nur umleiten wenn Nachname-Step existiert
      if (!lastnameStep) return;

      var newCardBtn = cardBtn.cloneNode(true);
      cardBtn.parentNode.replaceChild(newCardBtn, cardBtn);

      newCardBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var current = document.querySelector('.is-open[id*="checkout-step"]');
        if (current) current.classList.remove('is-open');

        // Vorname aus Step-1-Input in Lastname-Step übertragen
        var firstNameInput = document.getElementById('input-first-last-name' + suffix);
        if (firstNameInput) {
          var firstNameDisplay = document.getElementById('input-firstname-display' + suffix);
          if (firstNameDisplay) firstNameDisplay.textContent = firstNameInput.value.trim();
        }

        // Email in Lastname-Step anzeigen
        var emailInput = document.getElementById('input-email' + suffix);
        if (emailInput) {
          var emailDisplay = document.getElementById('input-email-display' + suffix);
          if (emailDisplay) emailDisplay.textContent = emailInput.value.trim();
        }

        lastnameStep.classList.add('is-open');
        if (window.finishPayState) {
          window.finishPayState.currentStep = '#checkout-step-lastname' + suffix;
        }

        // Lastname-Input fokussieren
        setTimeout(function () {
          var lastnameInput = document.getElementById('input-lastname' + suffix);
          if (lastnameInput) lastnameInput.focus();
        }, 100);
      });
    });
  }

  // ── fp:initCard Event → initCardElement aufrufen ─────────
  window.addEventListener('fp:initCard', function (e) {
    var suffix = e.detail.suffix;
    // initCardElement ist im originalen Script definiert
    // wir triggern es über den bestehenden Mechanismus
    var cardBtn = document.getElementById('button-method-card' + suffix);
    if (cardBtn && window.finishPayState) {
      // Karten-Element direkt initialisieren
      var containerId = suffix === '-mobile' ? 'stripe-card-element-mobile' : 'stripe-card-element';
      try {
        var FP = window.FinishPay.default || window.FinishPay;
        if (FP && FP.mountCardElement && !window._cardsInitialized?.[suffix]) {
          window._cardsInitialized = window._cardsInitialized || {};
          window._cardsInitialized[suffix] = true;
          var card = FP.mountCardElement(containerId, { hidePostalCode: true, suffix: suffix });
          card.on('change', function (event) {
            window.dispatchEvent(new CustomEvent('cardStateChanged', {
              detail: { suffix: suffix, complete: event.complete }
            }));
          });
        }
      } catch (err) {
        console.warn('[FinishPay] Card init via extension:', err.message);
      }
    }
  });

  // ── INITIALISIERUNG ──────────────────────────────────────
  waitForFinishPay(function () {
    setupLastnameStep();
    overrideCardButton();
  });

});
