/**
 * Leinenchallenge Quiz Pitch - Footer Script V1.5
 * NEU: Spinner Loading Animation (ersetzt alte Progress Bars)
 * Ziehgrad-Berechnung, Quiz-Daten, Timer System
 */

// ===== NEUER SPINNER LOADING SYSTEM =====
(function() {
  'use strict';
  
  // Konfiguration
  const CONFIG = {
    step1: {
      targetPercent: 16, // 15-17%
      duration: 1800 // 1.8 Sekunden
    },
    step2: {
      targetPercent: 40,
      duration: 2500 // 2.5 Sekunden
    },
    step3: {
      targetPercent: 100,
      duration: 5700 // 5.7 Sekunden
    },
    blinkInterval: 500, // 0.5 Sekunden
    grayColor: '#9ca3af',
    darkGrayColor: '#6b7280'
  };
  
  let currentStep = 0;
  let currentPercent = 0;
  let blinkIntervalId = null;
  let isBlinkDark = false;
  let spinnerInitialized = false;
  
  // Progress Circle aktualisieren
  function updateProgressCircle(percent) {
    const progressCircle = document.getElementById('progress-circle');
    const progressPercentage = document.getElementById('progress-percentage');
    
    if (!progressCircle || !progressPercentage) return;
    
    const radius = 65;
    const circumference = 2 * Math.PI * radius; // 408.4
    const offset = circumference - (percent / 100) * circumference;
    
    progressCircle.style.strokeDashoffset = offset;
    progressPercentage.textContent = Math.round(percent) + '%';
  }
  
  // Schritt-Text blinken lassen
  function startBlinking(stepNumber) {
    const stepElement = document.querySelector(`[data-loading-step="${stepNumber}"]`);
    if (!stepElement) return;
    
    // Alle anderen Schritte auf grau setzen
    document.querySelectorAll('[data-loading-step]').forEach(el => {
      if (el.getAttribute('data-loading-step') !== stepNumber.toString()) {
        el.style.color = CONFIG.grayColor;
      }
    });
    
    // Blinken starten
    if (blinkIntervalId) clearInterval(blinkIntervalId);
    
    blinkIntervalId = setInterval(() => {
      isBlinkDark = !isBlinkDark;
      stepElement.style.color = isBlinkDark ? CONFIG.darkGrayColor : CONFIG.grayColor;
      stepElement.style.transition = 'color 0.2s ease-in-out';
    }, CONFIG.blinkInterval);
  }
  
// Blinken stoppen und Schritt als fertig markieren (schwarz + Icon-Wechsel)
function stopBlinkingAndMarkDone(stepNumber) {
  if (blinkIntervalId) {
    clearInterval(blinkIntervalId);
    blinkIntervalId = null;
  }
  
  // Text auf Schwarz setzen
  const stepElement = document.querySelector(`[data-loading-step="${stepNumber}"]`);
  if (stepElement) {
    stepElement.style.color = '#000000';
    stepElement.style.transition = 'color 0.3s ease-in-out';
  }
  
  // Icon von grau auf grün wechseln
  const grayIcon = document.querySelector(`[data-loading-icon="${stepNumber}"][data-icon-state="gray"]`);
  const greenIcon = document.querySelector(`[data-loading-icon="${stepNumber}"][data-icon-state="green"]`);
  
  if (grayIcon) {
    grayIcon.style.display = 'none';
  }
  
  if (greenIcon) {
    greenIcon.style.display = 'block';
  }
}

  
  // Progress animieren
  function animateProgress(targetPercent, duration, onComplete) {
    const startPercent = currentPercent;
    const startTime = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      currentPercent = startPercent + (targetPercent - startPercent) * easedProgress;
      updateProgressCircle(currentPercent);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        currentPercent = targetPercent;
        updateProgressCircle(currentPercent);
        if (onComplete) onComplete();
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  // Popup anzeigen
  function showPopup() {
    const popup = document.querySelector('[data-loading-popup="true"]');
    
    if (!popup) {
      console.warn('⚠️ Popup nicht gefunden');
      startStep3(); // Fallback: direkt weiter
      return;
    }
    
    popup.style.display = 'flex';
    setTimeout(() => {
      popup.style.opacity = '1';
    }, 50);
    
    // Radio Button Event Listener
    const radioButtons = popup.querySelectorAll('[data-popup-choice]');
    radioButtons.forEach(radio => {
      radio.addEventListener('click', handlePopupChoice, { once: true });
    });
  }
  
  // Popup-Auswahl behandeln
  function handlePopupChoice(event) {
    const choice = event.target.getAttribute('data-popup-choice');
    
    // Antwort speichern
    localStorage.setItem('lq_popup_answer', choice);
    console.log('✅ Popup-Antwort gespeichert:', choice);
    
    // Popup ausblenden
    hidePopup();
    
    // Schritt 3 starten
    setTimeout(() => {
      startStep3();
    }, 300);
  }
  
  // Popup ausblenden
  function hidePopup() {
    const popup = document.querySelector('[data-loading-popup="true"]');
    if (!popup) return;
    
    popup.style.opacity = '0';
    setTimeout(() => {
      popup.style.display = 'none';
    }, 300);
  }
  
  // Schritt 1
  function startStep1() {
    currentStep = 1;
    console.log('🚀 Schritt 1 startet');
    startBlinking(1);
    
    animateProgress(CONFIG.step1.targetPercent, CONFIG.step1.duration, () => {
      console.log('✅ Schritt 1 fertig');
      stopBlinkingAndMarkDone(1);
      setTimeout(() => {
        startStep2();
      }, 200);
    });
  }
  
  // Schritt 2
  function startStep2() {
    currentStep = 2;
    console.log('🚀 Schritt 2 startet');
    startBlinking(2);
    
    animateProgress(CONFIG.step2.targetPercent, CONFIG.step2.duration, () => {
      console.log('✅ Schritt 2 fertig');
      stopBlinkingAndMarkDone(2);
      
      // Popup anzeigen
      setTimeout(() => {
        showPopup();
      }, 300);
    });
  }
  
  // Schritt 3
  function startStep3() {
    currentStep = 3;
    console.log('🚀 Schritt 3 startet');
    startBlinking(3);
    
    animateProgress(CONFIG.step3.targetPercent, CONFIG.step3.duration, () => {
      console.log('✅ Schritt 3 fertig - 100% erreicht');
      stopBlinkingAndMarkDone(3);
      
      // Automatisch zum nächsten Finish-Flow Step
      setTimeout(() => {
        triggerNextStep();
      }, 500);
    });
  }
  
  // Next Step triggern
  function triggerNextStep() {
    const selectors = [
      '[data-next-button]',
      '[data-form-step] button',
      '.next-btn',
      '#next-button',
      'button[type="submit"]'
    ];
    
    for (let selector of selectors) {
      const nextButton = document.querySelector(selector);
      if (nextButton) {
        console.log('🎯 Klicke Next Button:', selector);
        nextButton.click();
        return;
      }
    }
    
    console.warn('⚠️ Kein Next Button gefunden');
  }
  
  // Prüfen ob Animation laufen soll (nur bei Step 1 + gültige Namen)
  function shouldRunSpinnerAnimation() {
    const currentInputFlowStep = getCurrentInputFlowStep();
    const dogName = getDogName();
    const firstName = getFirstName();
    
    const hasValidDogName = dogName && dogName !== 'Dein Hund' && dogName.trim() !== '';
    const hasValidFirstName = firstName && firstName !== 'Du' && firstName.trim() !== '';
    
    return currentInputFlowStep === 1 && hasValidDogName && hasValidFirstName;
  }
  
  // Aktuellen InputFlow Step ermitteln
  function getCurrentInputFlowStep() {
    const visibleStep = document.querySelector('[data-form-step][style*="display: block"], [data-form-step]:not([style*="display: none"])');
    if (visibleStep) {
      const stepNumber = visibleStep.getAttribute('data-form-step');
      return parseInt(stepNumber) || 1;
    }
    
    const inputflowProgress = localStorage.getItem('inputflow_progress');
    if (inputflowProgress) {
      try {
        const progress = JSON.parse(inputflowProgress);
        return progress.currentStep || 1;
      } catch (e) {
        return 1;
      }
    }
    
    return 1;
  }
  
  // Initialisierung des Spinner-Systems
  function initializeSpinnerSystem() {
    if (spinnerInitialized) return;
    
    // Prüfen ob alle Bedingungen erfüllt sind
    if (!shouldRunSpinnerAnimation()) {
      console.log('⏭️ Spinner-Animation übersprungen (nicht bei Step 1 oder Namen fehlen)');
      return;
    }
    
    spinnerInitialized = true;
    
    // Initial: Alle Schritte grau
    document.querySelectorAll('[data-loading-step]').forEach(el => {
      el.style.color = CONFIG.grayColor;
    });

    // Initial: Alle grünen Icons verstecken, graue Icons zeigen
document.querySelectorAll('[data-icon-state="green"]').forEach(icon => {
  icon.style.display = 'none';
});

document.querySelectorAll('[data-icon-state="gray"]').forEach(icon => {
  icon.style.display = 'block';
});

    // Popup initial verstecken
    const popup = document.querySelector('[data-loading-popup="true"]');
    if (popup) {
      popup.style.display = 'none';
      popup.style.opacity = '0';
    }
    
    // Progress Circle initial setzen
    updateProgressCircle(0);
    
    // Schritt 1 starten
    setTimeout(() => {
      startStep1();
    }, 500);
  }
  
  // Event Listener für Make-Daten
  document.addEventListener('quizDataLoaded', function(event) {
    console.log('📊 Quiz-Daten geladen, prüfe Spinner-Start');
    setTimeout(() => {
      initializeSpinnerSystem();
    }, 300);
  });
  
  // Initial Check beim Laden
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
      initializeSpinnerSystem();
    }, 800);
  });
  
  // Test-Funktion für Debugging
  window.testLoadingSpinner = function() {
    spinnerInitialized = false;
    currentPercent = 0;
    updateProgressCircle(0);
    initializeSpinnerSystem();
  };
  
})();


// ===== ZIEHGRAD-ALGORITHMUS =====
window.calculateZiehgrad = function() {
  if (!window.quizData) {
    return null;
  }
  
  let totalScore = 0;
  let multiplier = 1.0;
  
  // Frage 1: Wie oft zieht dein Hund?
  const haeufigkeit = getQuizAnswer('haeufigkeit_ziehen');
  let score1 = 0;
  switch(haeufigkeit) {
    case 'Bei jedem Spaziergang': score1 = 25; break;
    case 'Mehrmals pro Woche': score1 = 18; break;
    case 'Nur in bestimmten Situationen': score1 = 12; break;
    case 'Selten, aber dann heftig': score1 = 15; break;
    default: score1 = 0;
  }
  
  // Frage 2: Wie stark zieht dein Hund?
  const staerke = getQuizAnswer('staerke_ziehen');
  let score2 = 0;
  switch(staerke) {
    case 'So stark, dass ich die Balance verliere': score2 = 25; break;
    case 'Mein Arm tut danach weh': score2 = 20; break;
    case 'Es ist unangenehm, aber aushaltbar': score2 = 12; break;
    case 'Nur leichtes Ziehen': score2 = 5; break;
    default: score2 = 0;
  }
  
  // Frage 3: Wie leicht lässt sich [NAME] draußen ablenken?
  const ablenkbarkeit = getQuizAnswer('leichte_ablenkung');
  let score3 = 0;
  switch(ablenkbarkeit) {
    case 'Extrem': score3 = 20; break;
    case 'Stark': score3 = 16; break;
    case 'Mittel': score3 = 10; break;
    case 'Wenig': score3 = 4; break;
    default: score3 = 0;
  }
  
  // Frage 4: Wenn [NAME] abgelenkt ist – bekommst du die Aufmerksamkeit zurück?
  const aufmerksamkeit = getQuizAnswer('wenn_abgelenkt');
  let score4 = 0;
  switch(aufmerksamkeit) {
    case 'Fast nie': score4 = 20; break;
    case 'Selten': score4 = 15; break;
    case 'Manchmal': score4 = 9; break;
    case 'Meistens': score4 = 5; break;
    default: score4 = 0;
  }
  
  // Frage 5: Wie lange kämpfst du schon damit?
  const dauer = getQuizAnswer('wie_lange_schon');
  let score5 = 0;
  switch(dauer) {
    case 'Schon immer': score5 = 15; break;
    case 'Seit über einem Jahr': score5 = 12; break;
    case 'Seit einigen Monaten': score5 = 7; break;
    case 'Seit einigen Wochen': score5 = 3; break;
    default: score5 = 0;
  }
  
  // Frage 6: Bist du schon mal gestürzt oder fast gestürzt?
  const gestuerzt = getQuizAnswer('schon_gestuerzt');
  let score6 = 0;
  switch(gestuerzt) {
    case 'Ja, ich bin bereits gestürzt': score6 = 15; break;
    case 'Fast – ich hatte Glück': score6 = 10; break;
    case 'Nein, noch nicht': score6 = 2; break;
    default: score6 = 0;
  }
  
  // Grundscore berechnen
  totalScore = score1 + score2 + score3 + score4 + score5 + score6;
  
  // Multiplikatoren anwenden
  const bedingung1 = (haeufigkeit === 'Bei jedem Spaziergang') && 
                     (dauer === 'Schon immer' || dauer === 'Seit über einem Jahr');
  
  const bedingung2 = (staerke === 'So stark, dass ich die Balance verliere' || staerke === 'Mein Arm tut danach weh') &&
                     (aufmerksamkeit === 'Fast nie' || aufmerksamkeit === 'Selten');
  
  if (bedingung1) {
    multiplier *= 1.1;
  }
  
  if (bedingung2) {
    multiplier *= 1.1;
  }
  
  const finalScore = Math.round(totalScore * multiplier);
  
  // Ziehgrad bestimmen
  let ziehgrad = 'niedrig';
  let ziehgradText = 'Niedrig';
  if (finalScore >= 106) {
    ziehgrad = 'sehr_hoch';
    ziehgradText = 'Sehr hoch';
  } else if (finalScore >= 86) {
    ziehgrad = 'hoch';
    ziehgradText = 'Hoch';
  } else if (finalScore >= 56) {
    ziehgrad = 'mittel';
    ziehgradText = 'Mittel';
  }
  
  const result = {
    score: finalScore,
    ziehgrad: ziehgrad,
    ziehgradText: ziehgradText,
    multiplier: multiplier,
    details: {
      haeufigkeit: { answer: haeufigkeit, points: score1 },
      staerke: { answer: staerke, points: score2 },
      ablenkbarkeit: { answer: ablenkbarkeit, points: score3 },
      aufmerksamkeit: { answer: aufmerksamkeit, points: score4 },
      dauer: { answer: dauer, points: score5 },
      gestuerzt: { answer: gestuerzt, points: score6 }
    }
  };
  
  return result;
};

// Hilfsfunktionen für Ziehgrad-basierte Anzeigen
window.getZiehgrad = function() {
  return window.ziehgradResult ? window.ziehgradResult.ziehgrad : null;
};

window.getZiehgradScore = function() {
  return window.ziehgradResult ? window.ziehgradResult.score : null;
};

window.getZiehgradText = function() {
  return window.ziehgradResult ? window.ziehgradResult.ziehgradText : 'Unbekannt';
};

// Content basierend auf Ziehgrad anzeigen
window.showZiehgradContent = function() {
  const ziehgrad = getZiehgrad();
  if (!ziehgrad) return;
  
  // Alle Ziehgrad-Inhalte verstecken
  hideElements('[data-ziehgrad-content]');
  
  // Spezifischen Ziehgrad-Inhalt anzeigen
  showElements(`[data-ziehgrad-content="${ziehgrad}"]`);
  
  // Score in Spans einsetzen
  const scoreSpans = document.querySelectorAll('[data-ziehgrad-score="true"]');
  scoreSpans.forEach(span => {
    span.textContent = getZiehgradScore();
  });
  
 // Ziehgrad-Text in Spans einsetzen
  const textSpans = document.querySelectorAll('[data-ziehgrad-text="true"]');
  textSpans.forEach(span => {
    span.textContent = getZiehgradText();
  });
};

// Funktion für direkte Quiz-Antworten in Spans
window.showQuizAnswersInSpans = function() {
  if (!window.quizData) {
    return;
  }
  
  // Motivation
  const motivationSpans = document.querySelectorAll('[data-quiz-answer="motivation"]');
  motivationSpans.forEach(span => {
    span.textContent = getQuizAnswer('motivation') || 'Unbekannt';
  });
  
  // Was am wichtigsten ist
  const wichtigstesSpans = document.querySelectorAll('[data-quiz-answer="wichtigster_punkt"]');
  wichtigstesSpans.forEach(span => {
    span.textContent = getQuizAnswer('wichtigster_punkt') || 'Unbekannt';
  });
  
  // Hundealter
  const alterSpans = document.querySelectorAll('[data-quiz-answer="alter"]');
  alterSpans.forEach(span => {
    span.textContent = getQuizAnswer('alter') || 'Unbekannt';
  });
  
  // Hundegeschlecht
  const geschlechtSpans = document.querySelectorAll('[data-quiz-answer="geschlecht"]');
  geschlechtSpans.forEach(span => {
    span.textContent = getQuizAnswer('geschlecht') || 'Unbekannt';
  });
  
  // Ziehen-Häufigkeit
  const haeufigkeitSpans = document.querySelectorAll('[data-quiz-answer="haeufigkeit_ziehen"]');
  haeufigkeitSpans.forEach(span => {
    span.textContent = getQuizAnswer('haeufigkeit_ziehen') || 'Unbekannt';
  });
  
  // Ziehen-Stärke
  const staerkeSpans = document.querySelectorAll('[data-quiz-answer="staerke_ziehen"]');
  staerkeSpans.forEach(span => {
    span.textContent = getQuizAnswer('staerke_ziehen') || 'Unbekannt';
  });
  
  // Verfügbare Zeit
  const zeitSpans = document.querySelectorAll('[data-quiz-answer="zeit_verfuegbar"]');
  zeitSpans.forEach(span => {
    span.textContent = getQuizAnswer('zeit_verfuegbar') || 'Unbekannt';
  });
  
  // Ziel in 30 Tagen
  const zielSpans = document.querySelectorAll('[data-quiz-answer="ziel_30_tage"]');
  zielSpans.forEach(span => {
    span.textContent = getQuizAnswer('ziel_30_tage') || 'Unbekannt';
  });
  
  // Woher der Hund kommt
  const woherSpans = document.querySelectorAll('[data-quiz-answer="woher_hund"]');
  woherSpans.forEach(span => {
    span.textContent = getQuizAnswer('woher_hund') || 'Unbekannt';
  });
  
  // Seit wann das Problem besteht
  const seitWannSpans = document.querySelectorAll('[data-quiz-answer="wie_lange_schon"]');
  seitWannSpans.forEach(span => {
    span.textContent = getQuizAnswer('wie_lange_schon') || 'Unbekannt';
  });
};

// Datum-Berechnungen basierend auf AKTUELLEM deutschen Datum
window.calculateDatesFromQuiz = function() {
  const startDate = new Date();
  
  // 42 Tage später (für Monat + Jahr)
  const date30DaysLater = new Date(startDate);
  date30DaysLater.setDate(startDate.getDate() + 42);

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const monthIn30Days = monthNames[date30DaysLater.getMonth()];
  const yearIn30Days = date30DaysLater.getFullYear();
  const monthYearIn30Days = `${monthIn30Days} ${yearIn30Days}`;
  
  // 7 Tage später (für Datum im Format XX.XX.)
  const date7DaysLater = new Date(startDate);
  date7DaysLater.setDate(startDate.getDate() + 7);
  
  const day7Later = String(date7DaysLater.getDate()).padStart(2, '0');
  const month7Later = String(date7DaysLater.getMonth() + 1).padStart(2, '0');
  const dateIn7Days = `${day7Later}.${month7Later}.`;
  
  // Wochentag in 7 Tagen
  const weekdayNames = [
    'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 
    'Donnerstag', 'Freitag', 'Samstag'
  ];
  
  const weekdayIn7Days = weekdayNames[date7DaysLater.getDay()];
  
  // In Spans einsetzen
  const monthSpans = document.querySelectorAll('[data-date-month-30="true"]');
  monthSpans.forEach(span => {
    span.textContent = monthYearIn30Days;
  });
  
  const date7Spans = document.querySelectorAll('[data-date-7-days="true"]');
  date7Spans.forEach(span => {
    span.textContent = dateIn7Days;
  });
  
  const weekday7Spans = document.querySelectorAll('[data-weekday-7-days="true"]');
  weekday7Spans.forEach(span => {
    span.textContent = weekdayIn7Days;
  });
};

// Conditional Content basierend auf Quiz-Antworten
window.showConditionalContent = function() {
  if (!window.quizData) {
    return;
  }
  
  const allContentElements = document.querySelectorAll('[data-answer-content]');
  
  allContentElements.forEach(element => {
    const contentRule = element.getAttribute('data-answer-content');
    const [fieldName, expectedAnswer] = contentRule.split(':');
    
    if (!fieldName || !expectedAnswer) {
      return;
    }
    
    const actualAnswer = getQuizAnswer(fieldName.trim());
    
    if (actualAnswer && actualAnswer.trim() === expectedAnswer.trim()) {
      element.style.display = 'flex';
      element.style.opacity = '0';
      setTimeout(() => {
        element.style.transition = 'opacity 0.6s ease-in';
        element.style.opacity = '1';
      }, 50);
    } else {
      element.style.display = 'none';
    }
  });
};

// ===== TIMER SYSTEM MIT RELOAD-PERSISTENZ =====
document.addEventListener("DOMContentLoaded", function() {
  let timerInterval = null;
  let remainingSeconds = 0;
  let timerStarted = false;
  let timerStartTime = null;

  const TIMER_STORAGE_KEY = 'lc_timer_data';

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    const timerSpans = document.querySelectorAll('[data-timer-display="true"]');
    timerSpans.forEach(span => {
      span.textContent = formatTime(remainingSeconds);
    });
  }

  function saveTimerToStorage() {
    const timerData = {
      startTime: timerStartTime,
      remainingSeconds: remainingSeconds,
      timerStarted: timerStarted,
      lastUpdate: Date.now()
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerData));
  }

  function loadTimerFromStorage() {
    const stored = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }

  function restoreTimerFromStorage() {
    const timerData = loadTimerFromStorage();
    
    if (!timerData || !timerData.timerStarted) {
      return false;
    }
    
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - timerData.lastUpdate) / 1000);
    
    remainingSeconds = timerData.remainingSeconds - elapsedSeconds;
    
    if (remainingSeconds <= 0) {
      remainingSeconds = 0;
      updateTimerDisplay();
      handleTimerExpired();
      return true;
    }
    
    timerStarted = true;
    timerStartTime = timerData.startTime;
    updateTimerDisplay();
    startTimerCountdown();
    
    return true;
  }

  function handleTimerExpired() {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    localStorage.removeItem(TIMER_STORAGE_KEY);
    timerStarted = false;
    
    window.location.href = 'https://www.hundetraining.de/ll/lc/authentifizierung?target=video1';
  }

  function startTimerCountdown() {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplay();
      saveTimerToStorage();
      
      if (remainingSeconds <= 0) {
        handleTimerExpired();
      }
    }, 1000);
  }

  function initializeTimer() {
    const startButton = document.getElementById('quiz_btn_step34');
    
    if (!startButton) return;
    
    startButton.addEventListener('click', function() {
      if (timerStarted) return;
      
      timerStarted = true;
      timerStartTime = Date.now();
      remainingSeconds = 15 * 60;
      
      updateTimerDisplay();
      saveTimerToStorage();
      startTimerCountdown();
    });
  }

  function initializeAddTimeButtons() {
    const addTimeButtons = document.querySelectorAll('[data-add-time="true"]');
    
    addTimeButtons.forEach(button => {
      button.addEventListener('click', function() {
        if (!timerStarted) return;
        
        remainingSeconds += 10 * 60;
        updateTimerDisplay();
        saveTimerToStorage();
        
        addTimeButtons.forEach(btn => {
          btn.style.display = 'none';
          btn.style.opacity = '0';
          btn.style.transition = 'opacity 0.3s ease-out';
        });
      });
    });
  }

  function initializeTimerSystem() {
    const restored = restoreTimerFromStorage();
    
    if (!restored) {
      updateTimerDisplay();
    }
    
    initializeTimer();
    initializeAddTimeButtons();
  }

  setTimeout(() => {
    initializeTimerSystem();
  }, 100);
});


// ===== QUIZ DATA MANAGEMENT =====
document.addEventListener("DOMContentLoaded", function() {
  let quizData = null;
  
  function getEmailFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('email');
  }
  
  function cleanURLFromEmailParam() {
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);
    
    if (params.has('email')) {
      params.delete('email');
      url.search = params.toString();
      window.history.replaceState({}, document.title, url.toString());
    }
  }
  
  function getEmailFromStorage() {
    const urlEmail = getEmailFromURL();
    if (urlEmail) {
      return urlEmail;
    }
    
    const email = localStorage.getItem('email') || 
                 localStorage.getItem('lc_useremail') || 
                 localStorage.getItem('encryptedEmail');
    return email;
  }
  
  function loadLocalDataImmediately() {
    const localDogName = localStorage.getItem('dogName') || 
                        localStorage.getItem('dog_name') || 
                        localStorage.getItem('name_dog');
    
    const localFirstName = localStorage.getItem('fn') || 
                          localStorage.getItem('first_name') || 
                          localStorage.getItem('firstName');
    
    if (localDogName) {
      const dogNameSpans = document.querySelectorAll('[data-dog-name="true"]');
      dogNameSpans.forEach(span => {
        span.textContent = localDogName;
      });
    }
    
    if (localFirstName) {
      const firstNameSpans = document.querySelectorAll('[data-first-name="true"]');
      firstNameSpans.forEach(span => {
        span.textContent = localFirstName;
      });
    }
  }
  
  window.getFirstName = function() {
    if (window.quizData && window.quizData.first_name) {
      return window.quizData.first_name;
    }
    return localStorage.getItem('fn') || 
           localStorage.getItem('first_name') || 
           localStorage.getItem('firstName') || 
           'Du';
  };
  
  async function fetchQuizData(email) {
    if (!email) {
      return null;
    }
    
    try {
      const response = await fetch('https://hook.eu2.make.com/3m83fp9qnluup12vr8d8donscnuuo4de', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          action: 'get_quiz_data'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data;
    } catch (error) {
      return null;
    }
  }
  
  function makeDataAvailable(data) {
    window.quizData = data;
    localStorage.setItem('quizData', JSON.stringify(data));
    
    const event = new CustomEvent('quizDataLoaded', { 
      detail: data 
    });
    document.dispatchEvent(event);
  }
  
  window.getQuizAnswer = function(questionKey) {
    if (!window.quizData) {
      return null;
    }
    return window.quizData[questionKey] || null;
  };
  
  window.getDogName = function() {
    if (window.quizData && window.quizData.dog_name) {
      return window.quizData.dog_name;
    }
    return localStorage.getItem('dogName') || localStorage.getItem('dog_name') || 'Dein Hund';
  };
  
  window.getQuizData = {
    getEmail: () => getQuizAnswer('email'),
    getFirstName: () => getFirstName(),
    getDogName: () => getDogName(),
    getGeschlecht: () => getQuizAnswer('geschlecht'),
    getAlter: () => getQuizAnswer('alter'),
    getZiehenHaeufigkeit: () => getQuizAnswer('haeufigkeit_ziehen'),
    getZiehenStaerke: () => getQuizAnswer('staerke_ziehen'),
    getMotivation: () => getQuizAnswer('motivation'),
    getZeitVerfuegbar: () => getQuizAnswer('zeit_verfuegbar'),
    
    istStarkerZieher: () => {
      const staerke = getQuizAnswer('staerke_ziehen');
      return staerke === 'So stark dass ich die Balance verliere' || 
             staerke === 'Mein Arm tut danach weh';
    },
    
    istHaeufigerZieher: () => {
      const haeufigkeit = getQuizAnswer('haeufigkeit_ziehen');
      return haeufigkeit === 'Bei jedem Spaziergang' || 
             haeufigkeit === 'Mehrmals pro Woche';
    },
    
    istSehrMotiviert: () => {
      const motivation = getQuizAnswer('motivation');
      return motivation === 'Extrem motiviert' || 
             motivation === 'Sehr motiviert';
    },
    
    hatVielZeit: () => {
      const zeit = getQuizAnswer('zeit_verfuegbar');
      return zeit === '15-20 Minuten' || zeit === 'Unterschiedlich';
    }
  };
  
  window.calculateUserProfile = function() {
    if (!window.quizData) {
      return null;
    }
    
    const profile = {
      problemLevel: 'niedrig',
      trainingsIntensitaet: 'standard',
      fokusBereich: 'grundlagen',
      empfohlenesDauer: '1-2 Wochen'
    };
    
    let problemScore = 0;
    if (getQuizData.istStarkerZieher()) problemScore += 3;
    if (getQuizData.istHaeufigerZieher()) problemScore += 2;
    if (getQuizAnswer('schon_gestuerzt') === 'Ja, ich bin bereits gestürzt') problemScore += 3;
    if (getQuizAnswer('verspannung') === 'Ja, manchmal') problemScore += 1;
    
    if (problemScore >= 5) profile.problemLevel = 'hoch';
    else if (problemScore >= 3) profile.problemLevel = 'mittel';
    
    if (getQuizData.istSehrMotiviert() && getQuizData.hatVielZeit()) {
      profile.trainingsIntensitaet = 'intensiv';
    } else if (getQuizData.istSehrMotiviert()) {
      profile.trainingsIntensitaet = 'erhöht';
    }
    
    if (getQuizAnswer('grosse_ablenkung') === 'Andere Hunde') {
      profile.fokusBereich = 'hundebegegnungen';
    } else if (getQuizAnswer('grosse_ablenkung') && getQuizAnswer('grosse_ablenkung').includes('Menschen')) {
      profile.fokusBereich = 'menschenbegegnungen';
    }
    
    if (profile.problemLevel === 'hoch') profile.empfohlenesDauer = '4-6 Wochen';
    else if (profile.problemLevel === 'mittel') profile.empfohlenesDauer = '2-4 Wochen';
    
    return profile;
  };
  
  window.showContentBasedOnProfile = function(profile) {
    if (!profile) return;
    
    if (profile.problemLevel === 'hoch') {
      showElements('[data-content="high-problem"]');
      hideElements('[data-content="low-problem"]');
    }
    
    if (profile.trainingsIntensitaet === 'intensiv') {
      showElements('[data-content="intensive-training"]');
    }
    
    if (profile.fokusBereich === 'hundebegegnungen') {
      showElements('[data-content="dog-encounters"]');
    }
    
    if (getQuizData.hatVielZeit()) {
      showElements('[data-content="extended-training"]');
    } else {
      showElements('[data-content="quick-training"]');
    }
  };
  
  function updateAllDynamicContent() {
    const dogNameSpans = document.querySelectorAll('[data-dog-name="true"]');
    dogNameSpans.forEach(span => {
      span.textContent = getDogName();
    });
    
    const firstNameSpans = document.querySelectorAll('[data-first-name="true"]');
    firstNameSpans.forEach(span => {
      span.textContent = getFirstName();
    });
  }
  
  window.showQuizData = function() {
    console.log("Aktuelle Quiz-Daten:", window.quizData);
    console.log("Email aus URL:", getEmailFromURL());
    console.log("localStorage Email:", localStorage.getItem('email'));
    console.log("localStorage Hundename:", localStorage.getItem('dogName'));
    console.log("localStorage Vorname:", localStorage.getItem('first_name'));
  };
  
  window.testQuizDataSystem = function() {
    console.log("=== QUIZ DATA SYSTEM TEST ===");
    console.log("Email aus URL:", getEmailFromURL());
    console.log("Email im localStorage:", localStorage.getItem('email'));
    console.log("Verwendete Email:", getEmailFromStorage());
    console.log("Quiz-Daten von Make geladen:", !!window.quizData);
    console.log("Aktueller Hundename:", getDogName());
    console.log("Aktueller Vorname:", getFirstName());
    
    if (window.quizData) {
      console.log("Alle Make Quiz-Daten:", window.quizData);
    } else {
      console.log("Noch keine Make-Daten - verwende localStorage");
    }
  };
  
  async function initializeQuizData() {
    const email = getEmailFromStorage();
    
    if (getEmailFromURL()) {
      cleanURLFromEmailParam();
    }
    
    if (email) {
      const data = await fetchQuizData(email);
      if (data) {
        makeDataAvailable(data);
      }
    }
  }
  
  document.addEventListener('quizDataLoaded', function(event) {
    const quizData = event.detail;
    
    updateAllDynamicContent();
    
    const userProfile = calculateUserProfile();
    showContentBasedOnProfile(userProfile);
    window.userProfile = userProfile;
    
    // Ziehgrad berechnen
    const ziehgradResult = calculateZiehgrad();
    if (ziehgradResult) {
      window.ziehgradResult = ziehgradResult;
      setTimeout(() => {
        showZiehgradContent();
      }, 100);
    }
    
    // Quiz-Antworten in Spans laden
    setTimeout(() => {
      showQuizAnswersInSpans();
    }, 200);
    
    // Datum-Berechnungen
    setTimeout(() => {
      calculateDatesFromQuiz();
    }, 300);
    
    // Conditional Content anzeigen
    setTimeout(() => {
      showConditionalContent();
    }, 400);
  });
  
  loadLocalDataImmediately();
  initializeQuizData();
});

// Hilfsfunktionen für Element-Management
function showElements(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.style.display = 'block';
  });
}

function hideElements(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.style.display = 'none';
  });
}
