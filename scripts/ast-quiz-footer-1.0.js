/**
 * AST Quiz Pitch - Footer Script V1.0
 */

// ===== NEUER SPINNER LOADING SYSTEM =====
(function() {
  'use strict';
  
  // Konfiguration
  const CONFIG = {
    step1: {
      targetPercent: 24,
      duration: 2500
    },
    step2: {
      targetPercent: 60,
      duration: 3500
    },
    step3: {
      targetPercent: 100,
      duration: 6500
    },
    blinkInterval: 500,
    grayColor: '#9ca3af',
    darkGrayColor: '#6b7280'
  };

  let currentStep = 0;
  let currentPercent = 0;
  let blinkIntervalId = null;
  let isBlinkDark = false;
  let spinnerInitialized = false;
  let completedSteps = [];
  
  // Progress Circle aktualisieren - Mobile-kompatibel
  function updateProgressCircle(percent) {
    const progressCircle = document.getElementById('progress-circle');
    const progressPercentage = document.getElementById('progress-percentage');
    
    if (!progressCircle || !progressPercentage) return;
    
    const computedRadius = parseFloat(window.getComputedStyle(progressCircle).r) || 
                           parseFloat(progressCircle.getAttribute('r')) || 
                           65;
    
    const circumference = 2 * Math.PI * computedRadius;
    const offset = circumference * (1 - percent / 100);
    
    progressCircle.setAttribute('stroke-dasharray', circumference);
    progressCircle.setAttribute('stroke-dashoffset', offset);
    
    progressPercentage.textContent = Math.round(percent) + '%';
  }

  // Schritt-Text blinken lassen
  function startBlinking(stepNumber) {
    const stepElement = document.querySelector(`[data-loading-step="${stepNumber}"]`);
    if (!stepElement) return;
    
    document.querySelectorAll('[data-loading-step]').forEach(el => {
      const elStepNumber = parseInt(el.getAttribute('data-loading-step'));
      
      if (elStepNumber !== stepNumber && !completedSteps.includes(elStepNumber)) {
        el.style.color = CONFIG.grayColor;
      }
    });
    
    if (blinkIntervalId) clearInterval(blinkIntervalId);
    
    blinkIntervalId = setInterval(() => {
      isBlinkDark = !isBlinkDark;
      stepElement.style.color = isBlinkDark ? CONFIG.darkGrayColor : CONFIG.grayColor;
      stepElement.style.transition = 'color 0.2s ease-in-out';
    }, CONFIG.blinkInterval);
  }

  // Blinken stoppen und Schritt als fertig markieren
  function stopBlinkingAndMarkDone(stepNumber) {
    console.log(`🎯 Markiere Schritt ${stepNumber} als fertig`);
    
    if (blinkIntervalId) {
      clearInterval(blinkIntervalId);
      blinkIntervalId = null;
    }
    
    if (!completedSteps.includes(stepNumber)) {
      completedSteps.push(stepNumber);
    }
    
    const stepElement = document.querySelector(`[data-loading-step="${stepNumber}"]`);
    if (stepElement) {
      console.log(`✅ Setze Text ${stepNumber} auf schwarz`);
      stepElement.style.color = '#000000';
      stepElement.style.transition = 'color 0.3s ease-in-out';
    } else {
      console.warn(`⚠️ Text-Element für Schritt ${stepNumber} nicht gefunden`);
    }
    
    const grayIcon = document.querySelector(`[data-loading-icon="${stepNumber}"][data-icon-state="gray"]`);
    const greenIcon = document.querySelector(`[data-loading-icon="${stepNumber}"][data-icon-state="green"]`);
    
    if (grayIcon && greenIcon) {
      console.log(`✅ Wechsle Icon ${stepNumber} von grau zu grün`);
      grayIcon.style.display = 'none';
      greenIcon.style.display = 'block';
    } else {
      console.warn(`⚠️ Icons für Schritt ${stepNumber} nicht gefunden`);
    }
  }

  // Progress animieren
  function animateProgress(targetPercent, duration, onComplete) {
    const startPercent = currentPercent;
    const startTime = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
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
      startStep3();
      return;
    }
    
    popup.style.display = 'flex';
    setTimeout(() => {
      popup.style.opacity = '1';
    }, 50);
    
    const radioButtons = popup.querySelectorAll('[data-popup-choice]');
    radioButtons.forEach(radio => {
      radio.addEventListener('click', handlePopupChoice, { once: true });
    });
  }
  
  // Popup-Auswahl behandeln
  function handlePopupChoice(event) {
    const choice = event.target.getAttribute('data-popup-choice');
    
    localStorage.setItem('lq_popup_answer', choice);
    console.log('✅ Popup-Antwort gespeichert:', choice);
    
    hidePopup();
    
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
    
    const earlyMarkDoneDelay = CONFIG.step1.duration - 300;
    
    setTimeout(() => {
      stopBlinkingAndMarkDone(1);
    }, earlyMarkDoneDelay);
    
    animateProgress(CONFIG.step1.targetPercent, CONFIG.step1.duration, () => {
      console.log('✅ Schritt 1 fertig');
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
    
    const earlyMarkDoneDelay = CONFIG.step2.duration - 300;
    
    setTimeout(() => {
      stopBlinkingAndMarkDone(2);
    }, earlyMarkDoneDelay);
    
    animateProgress(CONFIG.step2.targetPercent, CONFIG.step2.duration, () => {
      console.log('✅ Schritt 2 fertig');
      
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
    
    const earlyMarkDoneDelay = CONFIG.step3.duration - 800;
    
    setTimeout(() => {
      stopBlinkingAndMarkDone(3);
    }, earlyMarkDoneDelay);
    
    animateProgress(CONFIG.step3.targetPercent, CONFIG.step3.duration, () => {
      console.log('✅ Schritt 3 fertig - 100% erreicht');
      
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
  
  // Prüfen ob Animation laufen soll
  function shouldRunSpinnerAnimation() {
    const currentInputFlowStep = getCurrentInputFlowStep();
    return currentInputFlowStep === 1;
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
    
    if (!shouldRunSpinnerAnimation()) {
      return;
    }
    
    spinnerInitialized = true;
    completedSteps = [];
    
    document.querySelectorAll('[data-loading-step]').forEach(el => {
      el.style.color = CONFIG.grayColor;
    });

    document.querySelectorAll('[data-icon-state="green"]').forEach(icon => {
      icon.style.display = 'none';
    });

    document.querySelectorAll('[data-icon-state="gray"]').forEach(icon => {
      icon.style.display = 'block';
    });

    const popup = document.querySelector('[data-loading-popup="true"]');
    if (popup) {
      popup.style.display = 'none';
      popup.style.opacity = '0';
    }
    
    const progressCircle = document.getElementById('progress-circle');
    if (progressCircle) {
      const radius = parseFloat(window.getComputedStyle(progressCircle).r) || 
                     parseFloat(progressCircle.getAttribute('r')) || 
                     65;
      const circumference = 2 * Math.PI * radius;
      
      progressCircle.setAttribute('stroke-dasharray', circumference);
      progressCircle.setAttribute('stroke-dashoffset', circumference);
    }

    const progressPercentage = document.getElementById('progress-percentage');
    if (progressPercentage) {
      progressPercentage.textContent = '0%';
    }

    setTimeout(() => {
      updateProgressCircle(0);
    }, 50);
    
    setTimeout(() => {
      startStep1();
    }, 500);
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
      initializeSpinnerSystem();
    }, 300);
  });
  
  document.addEventListener('quizDataLoaded', function(event) {
    console.log('📊 Quiz-Daten geladen (Spinner läuft bereits)');
  });

  window.testLoadingSpinner = function() {
    spinnerInitialized = false;
    currentPercent = 0;
    updateProgressCircle(0);
    initializeSpinnerSystem();
  };
  
})();


// ============================================
// STRESSLEVEL-ALGORITHMUS (AST) - PDF VERSION
// EXAKT nach Stress-Score-Algorithmus.pdf
// ============================================

const SCORING_CONFIG = {
  q_restless: { weight: 1.5, invert: false },
  q_follow: { weight: 1.0, invert: false },
  q_attention: { weight: 1.5, invert: false },
  q_visitors: { weight: 1.0, invert: false },
  q_sounds: { weight: 1.0, invert: false },
  q_walk_start: { weight: 1.0, invert: false },
  q_walk_after: { weight: 1.5, invert: false },
  q_alone: { weight: 1.0, invert: false },
  q_rest_hours: { weight: 1.5, invert: true },
  q_retreat: { weight: 1.0, invert: true },
  q_structure: { weight: 1.0, invert: true },
  q_control: { weight: 1.5, invert: false },
  q_ignore: { weight: 1.0, invert: true }
};

window.calculateStresslevel = function() {
  if (!window.quizData) {
    console.warn('⚠️ Keine Quiz-Daten für Stresslevel-Berechnung');
    return null;
  }
  
  function getQuizAnswer(key) {
    const answer = window.quizData[key];
    return answer ? String(answer).trim() : null;
  }
  
  // Normalisierung für robustes Matching
  function normalizeString(str) {
    if (!str) return '';
    return String(str).trim().toLowerCase().replace(/\s+/g, ' ');
  }
  
  // Antworten zu Punkten mappen (EXAKT nach PDF Seite 3-4)
  function mapAnswerToPoints(qId, answer) {
    if (!answer) {
      console.warn(`⚠️ Keine Antwort für ${qId}`);
      return 0;
    }
    
    const normalized = normalizeString(answer);
    
    // EXAKT nach PDF - Seite 3-4
    const mappings = {
      // q_restless: A=3, B=2, C=1, D=0
      q_restless: {
        'ständig': 3,
        'häufig': 2,
        'manchmal': 1,
        'selten oder nie': 0
      },
      
      // q_follow: A=3, B=2, C=1, D=0
      q_follow: {
        'ja, ständig': 3,
        'häufig': 2,
        'manchmal': 1,
        'nein, fast nie': 0
      },
      
      // q_attention: A=3, B=2, C=1, D=0
      q_attention: {
        'sehr oft': 3,
        'häufig': 2,
        'manchmal': 1,
        'selten oder nie': 0
      },
      
      // q_visitors: A=3, B=2, C=1, D=0
      q_visitors: {
        'dreht komplett durch': 3,
        'ist aufgeregt, klebt am besuch': 2,
        'geht kurz hin, beruhigt sich': 1,
        'bleibt entspannt': 0
      },
      
      // q_sounds: A=3, B=2, C=1, D=0
      q_sounds: {
        'reagiert stark': 3,
        'wird nervös': 2,
        'wird kurz aufmerksam': 1,
        'bleibt gelassen': 0
      },
      
      // q_walk_start: A=3, B=2, C=1, D=0
      q_walk_start: {
        'dreht durch, kaum zu bremsen': 3,
        'sehr aufgeregt, zieht zur tür': 2,
        'wird etwas aufgeregt': 1,
        'wartet entspannt': 0
      },
      
      // q_walk_after: A=3, B=2, C=1, D=0
      q_walk_after: {
        'noch nervöser als davor': 3,
        'ist noch aufgedreht': 2,
        'braucht zeit zum abschalten': 1,
        'müde und entspannt': 0
      },
      
      // q_alone: A=3, B=2, C=1, D=0
      q_alone: {
        'geht überhaupt nicht': 3,
        'hat schwierigkeiten': 2,
        'geht meistens gut': 1,
        'kein problem': 0
      },
      
      // q_rest_hours (INVERTIERT): A=3, B=2, C=1, D=0, E=1.5
      q_rest_hours: {
        'unter 10 stunden': 3,
        '10-14 stunden': 2,
        '14-18 stunden': 1,
        '18-20+ stunden': 0,
        '18-20 stunden oder mehr': 0,
        'nicht sicher': 1.5
      },
      
      // q_retreat (INVERTIERT): A=3, B=2, C=1, D=0
      q_retreat: {
        'nein, kein fester platz': 3,
        'liegt mal hier, mal dort': 2,
        'ja, aber mitten im wohnbereich': 1,
        'ja, ruhiger platz abseits': 0
      },
      
      // q_structure (INVERTIERT): A=3, B=2, C=1, D=0
      q_structure: {
        'gar nicht strukturiert': 3,
        'wenig strukturiert': 2,
        'eher strukturiert': 1,
        'sehr strukturiert': 0
      },
      
      // q_control: A=3, B=2, C=1, D=0
      q_control: {
        'fast immer name': 3,
        'meistens name': 2,
        'ausgeglichen': 1,
        'meistens ich': 0
      },
      
      // q_ignore (INVERTIERT): A=3, B=2, C=1, D=0
      q_ignore: {
        'nein, schaffe ich nicht': 3,
        'selten': 2,
        'manchmal, nicht konsequent': 1,
        'ja, klappt gut': 0
      }
    };
    
    const questionMappings = mappings[qId];
    if (!questionMappings) {
      console.warn(`⚠️ Keine Mappings für Frage: ${qId}`);
      return 0;
    }
    
    const points = questionMappings[normalized];
    
    if (points === undefined) {
      console.warn(`⚠️ Unbekannte Antwort für ${qId}: "${answer}"`);
      console.log(`   Normalized: "${normalized}"`);
      console.log('   Verfügbare Optionen:', Object.keys(questionMappings));
      return 0;
    }
    
    console.log(`✅ ${qId}: "${answer}" → ${points} Punkte (weight: ${SCORING_CONFIG[qId].weight}x)`);
    return points;
  }
  
  // Schritt 1: Gewichtete Summe berechnen (PDF Seite 5)
  let weightedSum = 0;
  let maxPossible = 0;
  const details = {};
  
  console.log('=== STRESSLEVEL BERECHNUNG (PDF-Algorithmus) ===');
  
  for (const [qId, config] of Object.entries(SCORING_CONFIG)) {
    const answer = getQuizAnswer(qId);
    let points = mapAnswerToPoints(qId, answer);
    
    weightedSum += points * config.weight;
    maxPossible += 3 * config.weight;
    
    details[qId] = {
      answer: answer || 'Keine Antwort',
      points: points,
      weight: config.weight,
      weighted: points * config.weight
    };
  }
  
  console.log('📊 Gewichtete Summe:', weightedSum.toFixed(2));
  console.log('📊 Max möglich:', maxPossible.toFixed(2), '(13 Fragen × 3 × Gewicht)');
  
  // Schritt 2: Basis-Score (0-100) - PDF Seite 5
  let baseScore = (weightedSum / maxPossible) * 100;
  console.log('📊 Basis-Score:', baseScore.toFixed(2) + '%');
  
  // Schritt 3: Trigger-Bonus (+5 Punkte) - PDF Seite 5
  const triggerAnswer = getQuizAnswer('q_trigger');
  let triggerBonus = 0;
  if (triggerAnswer && normalizeString(triggerAnswer) === 'eigentlich fast immer') {
    triggerBonus = 5;
    baseScore += triggerBonus;
    console.log('✅ Trigger-Bonus: +5 Punkte (q_trigger = "Eigentlich fast immer")');
  }
  
  // Schritt 4: Alters-Modifikator (+10%) - PDF Seite 5
  const age = getQuizAnswer('q_age');
  let ageModifier = 1.0;
  if (age) {
    const normalizedAge = normalizeString(age);
    if (normalizedAge.includes('welpe') || normalizedAge.includes('senior')) {
      ageModifier = 1.1;
      baseScore *= ageModifier;
      console.log('✅ Alters-Modifikator: ×1.1 (+10% für Welpe/Senior)');
    }
  }
  
  // Schritt 5: Grenzen setzen (Min 15, Max 100) - PDF Seite 5
  const finalScore = Math.min(100, Math.max(15, Math.round(baseScore)));
  console.log('📊 Final Score:', finalScore, '(min: 15, max: 100)');
  
  // Stresslevel bestimmen (PDF Seite 1)
  let stresslevel = 'low';
  let stresslevelText = 'Niedrig';
  let color = '#4CAF50';
  
  if (finalScore >= 76) {
    stresslevel = 'high';
    stresslevelText = 'Hoch';
    color = '#F44336';
  } else if (finalScore >= 51) {
    stresslevel = 'elevated';
    stresslevelText = 'Erhöht';
    color = '#FF9800';
  } else if (finalScore >= 26) {
    stresslevel = 'medium';
    stresslevelText = 'Moderat';
    color = '#FFC107';
  }
  
  const result = {
    score: finalScore,
    stresslevel: stresslevel,
    stresslevelText: stresslevelText,
    color: color,
    baseScore: Math.round(baseScore),
    triggerBonus: triggerBonus,
    ageModifier: ageModifier,
    details: details
  };
  
  console.log('=== ERGEBNIS ===');
  console.log('Score:', finalScore);
  console.log('Level:', stresslevel);
  console.log('Label:', stresslevelText);
  console.log('Farbe:', color);
  console.log('================');
  
  return result;
};


// ============================================
// HELPER FUNCTIONS
// ============================================

window.getStresslevel = function() {
  return window.stresslevelResult ? window.stresslevelResult.stresslevel : null;
};

window.getStresslevelScore = function() {
  return window.stresslevelResult ? window.stresslevelResult.score : null;
};

window.getStresslevelText = function() {
  return window.stresslevelResult ? window.stresslevelResult.stresslevelText : 'Unbekannt';
};

window.getStresslevelColor = function() {
  return window.stresslevelResult ? window.stresslevelResult.color : '#999';
};


// ============================================
// CONTENT ANZEIGEN
// ============================================

window.showStresslevelContent = function() {
  const stresslevel = window.getStresslevel();
  
  if (!stresslevel) {
    console.warn('⚠️ Kein Stresslevel berechnet');
    return;
  }
  
  console.log('📊 Zeige Content für Stresslevel:', stresslevel);
  
  function hideElements(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.style.display = 'none';
    });
  }
  
  function showElements(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.style.display = 'block';
    });
  }
  
  // Alle verstecken
  hideElements('[data-stresslevel-content]');
  
  // Spezifischen anzeigen (WICHTIG: PDF verwendet "low", "medium", "elevated", "high")
  showElements(`[data-stresslevel-content="${stresslevel}"]`);
  
  // Score einsetzen
  const scoreSpans = document.querySelectorAll('[data-stresslevel-score="true"]');
  scoreSpans.forEach(span => {
    span.textContent = window.getStresslevelScore();
  });
  
  // Text einsetzen
  const textSpans = document.querySelectorAll('[data-stresslevel-text="true"]');
  textSpans.forEach(span => {
    span.textContent = window.getStresslevelText();
  });
  
  // Kategorie einsetzen
  const categorySpans = document.querySelectorAll('[data-stresslevel-category="true"]');
  categorySpans.forEach(span => {
    span.textContent = stresslevel;
  });
  
  // Farbe einsetzen
  const colorSpans = document.querySelectorAll('[data-stresslevel-color="true"]');
  colorSpans.forEach(span => {
    span.style.color = window.getStresslevelColor();
  });
  
  console.log('✅ Stresslevel-Content angezeigt');
};


// ============================================
// QUIZ-ANTWORTEN IN SPANS ANZEIGEN (AST)
// ============================================

window.showQuizAnswersInSpans = function() {
  if (!window.quizData) {
    console.warn('⚠️ showQuizAnswersInSpans: Keine Quiz-Daten vorhanden');
    return;
  }
  
  function getQuizAnswer(key) {
    return window.quizData[key] || 'Unbekannt';
  }
  
  const answerMappings = {
    'geschlecht': getQuizAnswer('geschlecht'),
    'alter': getQuizAnswer('alter'),
    'haeufigkeit_unruhe': getQuizAnswer('haeufigkeit_unruhe'),
    'groesster_stressor': getQuizAnswer('groesster_stressor'),
    'wie_lange_problem': getQuizAnswer('wie_lange_problem'),
    'laeuft_hinterher': getQuizAnswer('laeuft_hinterher'),
    'fordert_aufmerksamkeit': getQuizAnswer('fordert_aufmerksamkeit'),
    'besuch_reaktion': getQuizAnswer('besuch_reaktion'),
    'geraeusch_reaktion': getQuizAnswer('geraeusch_reaktion'),
    'anfang_spaziergang': getQuizAnswer('anfang_spaziergang'),
    'nach_spaziergang': getQuizAnswer('nach_spaziergang'),
    'alleine_bleiben': getQuizAnswer('alleine_bleiben'),
    'ruhezeit_stunden': getQuizAnswer('ruhezeit_stunden'),
    'rueckzugsort': getQuizAnswer('rueckzugsort'),
    'tagesablauf_struktur': getQuizAnswer('tagesablauf_struktur'),
    'wer_bestimmt': getQuizAnswer('wer_bestimmt'),
    'ignorieren_koennen': getQuizAnswer('ignorieren_koennen'),
    'wie_lange_kampf': getQuizAnswer('wie_lange_kampf'),
    'ueberfordert': getQuizAnswer('ueberfordert'),
    'auswirkung_beziehung': getQuizAnswer('auswirkung_beziehung'),
    'sorgen_gesundheit': getQuizAnswer('sorgen_gesundheit'),
    'bereits_versucht': getQuizAnswer('bereits_versucht'),
    'erfolg_versuche': getQuizAnswer('erfolg_versuche'),
    'wissen_stress': getQuizAnswer('wissen_stress'),
    'ziel_6_wochen': getQuizAnswer('ziel_6_wochen'),
    'wichtigster_punkt': getQuizAnswer('wichtigster_punkt'),
    'zeit_verfuegbar': getQuizAnswer('zeit_verfuegbar'),
    'motivation': getQuizAnswer('motivation')
  };
  
  Object.keys(answerMappings).forEach(key => {
    const spans = document.querySelectorAll(`[data-quiz-answer="${key}"]`);
    spans.forEach(span => {
      span.textContent = answerMappings[key];
    });
  });
  
  console.log('✅ Quiz-Antworten in Spans geladen');
};


// ============================================
// DATUM-BERECHNUNGEN
// ============================================

window.calculateDatesFromQuiz = function() {
  const startDate = new Date();
  
  const date30DaysLater = new Date(startDate);
  date30DaysLater.setDate(startDate.getDate() + 42);

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const monthIn30Days = monthNames[date30DaysLater.getMonth()];
  const yearIn30Days = date30DaysLater.getFullYear();
  const monthYearIn30Days = `${monthIn30Days} ${yearIn30Days}`;
  
  const date7DaysLater = new Date(startDate);
  date7DaysLater.setDate(startDate.getDate() + 7);
  
  const day7Later = String(date7DaysLater.getDate()).padStart(2, '0');
  const month7Later = String(date7DaysLater.getMonth() + 1).padStart(2, '0');
  const dateIn7Days = `${day7Later}.${month7Later}.`;
  
  const weekdayNames = [
    'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 
    'Donnerstag', 'Freitag', 'Samstag'
  ];
  
  const weekdayIn7Days = weekdayNames[date7DaysLater.getDay()];
  
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


// ============================================
// CONDITIONAL CONTENT
// ============================================

window.showConditionalContent = function() {
  if (!window.quizData) {
    return;
  }
  
  function getQuizAnswer(key) {
    return window.quizData[key] || null;
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
      element.style.display = 'block';
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


// ============================================
// QUIZ DATA MANAGEMENT
// ============================================

document.addEventListener("DOMContentLoaded", function() {
  
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
                 localStorage.getItem('ast_useremail') ||
                 localStorage.getItem('asp_useremail') ||
                 localStorage.getItem('encryptedEmail');
    return email;
  }

  function loadLocalDataImmediately() {
    const localDogName = localStorage.getItem('dogName') || 
                        localStorage.getItem('dog_name') || 
                        localStorage.getItem('name_dog');
    
    const localFirstName = localStorage.getItem('firstName') ||
                          localStorage.getItem('first_name') || 
                          localStorage.getItem('fn');
    
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
  
  window.getDogName = function() {
    if (window.quizData && window.quizData.dog_name) {
      return window.quizData.dog_name;
    }
    return localStorage.getItem('dogName') || 
           localStorage.getItem('dog_name') || 
           'Dein Hund';
  };

  async function fetchQuizData(email) {
    if (!email) {
      console.warn('⚠️ fetchQuizData: Keine Email');
      return null;
    }
    
    console.log('🔍 fetchQuizData: Lade Daten für:', email);
    
    try {
      const response = await fetch('https://hook.eu2.make.com/a2xkzso0codv9xirw9sikxq5to93qqgj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          action: 'get_quiz_data'
        })
      });
      
      console.log('📡 Response Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Daten empfangen:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Fetch Fehler:', error);
      return null;
    }
  }

  function makeDataAvailable(data) {
    window.quizData = data;
    
    localStorage.setItem('quizData', JSON.stringify(data));
    
    if (data.email) {
      localStorage.setItem('email', data.email);
      console.log('✅ Email in localStorage gespeichert:', data.email);
    }
    
    const event = new CustomEvent('quizDataLoaded', { 
      detail: data 
    });
    document.dispatchEvent(event);
  }

  function updateAllDynamicContent() {
    const dogNameSpans = document.querySelectorAll('[data-dog-name="true"]');
    dogNameSpans.forEach(span => {
      span.textContent = window.getDogName();
    });
    
    const firstNameSpans = document.querySelectorAll('[data-first-name="true"]');
    firstNameSpans.forEach(span => {
      span.textContent = window.getFirstName();
    });
  }

  window.testStresslevel = function() {
    console.log('=== STRESSLEVEL TEST ===');
    console.log('Quiz Data:', window.quizData);
    console.log('Stresslevel Result:', window.stresslevelResult);
    console.log('Current Level:', window.getStresslevel());
    console.log('Current Score:', window.getStresslevelScore());
    console.log('Current Text:', window.getStresslevelText());
    
    if (window.stresslevelResult && window.stresslevelResult.details) {
      console.log('Details:', window.stresslevelResult.details);
    }
  };

  async function initializeQuizData() {
    const email = getEmailFromStorage();
    
    console.log('🚀 initializeQuizData: Start mit Email:', email);
    
    if (getEmailFromURL()) {
      console.log('🔄 Bereinige Email aus URL');
      cleanURLFromEmailParam();
    }
    
    if (email) {
      console.log('📞 Rufe fetchQuizData auf für:', email);
      const data = await fetchQuizData(email);
      console.log('📦 Erhaltene Daten:', data);
      
      if (data) {
        console.log('✅ Mache Daten verfügbar');
        makeDataAvailable(data);
      } else {
        console.warn('⚠️ Keine Daten erhalten von Make');
      }
    } else {
      console.warn('⚠️ Keine Email gefunden (weder URL noch localStorage)');
    }
  }

  document.addEventListener('quizDataLoaded', function(event) {
    const quizData = event.detail;
    
    updateAllDynamicContent();
    
    const stresslevelResult = window.calculateStresslevel();
    if (stresslevelResult) {
      window.stresslevelResult = stresslevelResult;
      
      console.log('📊 Stresslevel berechnet:', stresslevelResult);
      
      setTimeout(() => {
        window.showStresslevelContent();
      }, 100);
    }
    
    setTimeout(() => {
      window.showQuizAnswersInSpans();
    }, 200);
    
    setTimeout(() => {
      window.calculateDatesFromQuiz();
    }, 300);
    
    setTimeout(() => {
      window.showConditionalContent();
    }, 400);
  });

  loadLocalDataImmediately();

  setTimeout(async () => {
    console.log('🚀 Starte initializeQuizData');
    await initializeQuizData();
    console.log('✅ initializeQuizData abgeschlossen');
  }, 500);

});
