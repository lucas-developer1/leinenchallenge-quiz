/**
 * Leinenchallenge Quiz Pitch - Footer Script
 * Progress Animation, Ziehgrad-Berechnung, Quiz-Daten, Timer System
 */

document.addEventListener("DOMContentLoaded", function() {
  let animationStarted = false;
  let makeDataLoaded = false;
  
  // ===== NEU: Funktion zum Prüfen des aktuellen InputFlow Steps =====
  function getCurrentInputFlowStep() {
    // Option 1: Prüfe welcher Step aktuell sichtbar ist
    const visibleStep = document.querySelector('[data-form-step][style*="display: block"], [data-form-step]:not([style*="display: none"])');
    if (visibleStep) {
      const stepNumber = visibleStep.getAttribute('data-form-step');
      return parseInt(stepNumber) || 1;
    }
    
    // Option 2: Fallback - prüfe InputFlow LocalStorage
    const inputflowProgress = localStorage.getItem('inputflow_progress');
    if (inputflowProgress) {
      try {
        const progress = JSON.parse(inputflowProgress);
        return progress.currentStep || 1;
      } catch (e) {
        return 1;
      }
    }
    
    // Default: Step 1
    return 1;
  }
  
  // ===== NEU: Prüfe ob Animation überhaupt laufen soll =====
  function shouldRunAnimation() {
    const currentStep = getCurrentInputFlowStep();
    console.log('🔍 Aktueller InputFlow Step:', currentStep);
    
    // NUR bei Step 1 Animation starten
    if (currentStep === 1) {
      console.log('✅ Step 1 erkannt - Animation läuft');
      return true;
    } else {
      console.log('⏭️ Step ' + currentStep + ' erkannt - Animation übersprungen');
      return false;
    }
  }

  // Initial Setup - erweitert um Heading-Verstecken
  function setupInitialState() {
    const step2 = document.querySelector('[data-progress-step="2"]');
    
    // Step verstecken mit smootheren Transitions
    if (step2) {
      step2.style.opacity = '0';
      step2.style.transition = 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    // HEADINGS INITIAL VERSTECKEN
    const headings = document.querySelectorAll('[data-heading-with-name="true"]');
    headings.forEach(heading => {
      heading.style.opacity = '0';
      heading.style.transition = 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    // Alle Divs initial positionieren (nur noch 1 und 2)
    const allDivs = document.querySelectorAll('[data-progress-div]');
    allDivs.forEach((div, index) => {
      div.style.display = 'none';
      div.style.position = 'relative';
      div.style.opacity = '0';
      div.style.transform = 'translateX(100px)'; // Startet rechts
      div.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
    });
    
    // Progress Bars auf 0 setzen (nur noch 1 und 2)
    const bars = document.querySelectorAll('[data-progress-bar]');
    const texts = document.querySelectorAll('[data-progress-text]');
    
    bars.forEach(bar => {
      bar.style.width = '0%';
      bar.style.transition = 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    texts.forEach(text => {
      text.textContent = '0%';
      text.style.transition = 'all 0.3s ease-out';
    });
  }

  // Verbesserte Check-Funktion mit strengerer Validierung
  function checkDataAndShowContent() {
    const dogName = getDogName();
    const firstName = getFirstName();
    
    // STRENGERE VALIDIERUNG
    const hasValidDogName = dogName && dogName !== 'Dein Hund' && dogName.trim() !== '';
    const hasValidFirstName = firstName && firstName !== 'Du' && firstName.trim() !== '';
    const hasValidNames = hasValidDogName && hasValidFirstName;
    
    const hasMakeData = !!window.quizData;
    
    // ===== NEU: Prüfe ob Animation laufen soll =====
    const shouldAnimate = shouldRunAnimation();
    
    // NUR wenn BEIDE Namen gültig sind UND Step 1 aktiv ist
    if (hasValidNames && !animationStarted && shouldAnimate) {
      showHeading(); // Heading wird sichtbar
      
      // Animation startet
      makeDataLoaded = true;
      setTimeout(() => {
        showWrapperAndStartAnimation();
      }, 300);
    } else if (hasValidNames) {
      // Wenn nicht Step 1: Nur Heading anzeigen, keine Animation
      showHeading();
    } else {
      // Wenn Namen fehlen: Heading versteckt halten
      hideHeading();
    }
    
    // Make-Daten-Verarbeitung läuft parallel im Hintergrund
    if (hasMakeData) {
      processQuizDataInBackground();
    }
  }

  // Neue Funktion: Heading verstecken
  function hideHeading() {
    const headings = document.querySelectorAll('[data-heading-with-name="true"]');
    headings.forEach(heading => {
      heading.style.opacity = '0';
    });
  }

  // Hintergrund-Verarbeitung der Make-Daten (parallel zur Animation)
  function processQuizDataInBackground() {
    // Ziehgrad berechnen
    const ziehgradResult = calculateZiehgrad();
    if (ziehgradResult) {
      window.ziehgradResult = ziehgradResult;
      
      // Ziehgrad-Content vorbereiten (wird später angezeigt)
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
    
    // ===== NEU: Conditional Content anzeigen =====
    setTimeout(() => {
      showConditionalContent();
    }, 400);
  }

  // Bestehende showHeading Funktion (bleibt gleich)
  function showHeading() {
    const headings = document.querySelectorAll('[data-heading-with-name="true"]');
    headings.forEach(heading => {
      heading.style.opacity = '1';
      heading.style.transition = 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Namen in die Spans einsetzen
      const nameSpans = heading.querySelectorAll('[data-first-name="true"]');
      nameSpans.forEach(span => {
        span.textContent = getFirstName();
      });
      
      const dogNameSpans = heading.querySelectorAll('[data-dog-name="true"]');
      dogNameSpans.forEach(span => {
        span.textContent = getDogName();
      });
    });
  }
  
  function showWrapperAndStartAnimation() {
    if (animationStarted) {
      return;
    }
    
    animationStarted = true;
    
    const wrapper = document.querySelector('[data-progress-wrapper="true"]');
    if (!wrapper) {
      return;
    }
    
    wrapper.style.opacity = '1';
    wrapper.style.transition = 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
      startProgressSequence();
    }, 400);
  }
  
  function startProgressSequence() {
    // Step 1: Div 1 von rechts rein + Progress Bar parallel animieren
    animateStepWithSlider(1, 5000).then(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    }).then(() => {
      // Step 2: Div 1 raus, Div 2 rein + Progress Bar animieren (FINALER STEP)
      return showStepAndAnimateWithSlider(2, 6000);
    }).then(() => {
      // Nach Step 2 direkt weiter (kein Step 3 mehr)
      setTimeout(() => {
        // ===== NEU: Nochmal prüfen ob wir noch bei Step 1 sind =====
        const currentStep = getCurrentInputFlowStep();
        if (currentStep === 1) {
          console.log('✅ Trigger Next Step (noch bei Step 1)');
          triggerNextStep();
        } else {
          console.log('⚠️ Step hat sich geändert - kein Auto-Advance');
        }
      }, 200);
    });
  }

  function showStepAndAnimateWithSlider(stepNumber, duration) {
    return new Promise((resolve) => {
      const stepWrapper = document.querySelector(`[data-progress-step="${stepNumber}"]`);
      
      if (!stepWrapper) {
        animateStepWithSlider(stepNumber, duration).then(resolve);
        return;
      }
      
      // Step-Wrapper smoother einblenden
      stepWrapper.style.opacity = '1';
      
      setTimeout(() => {
        animateStepWithSlider(stepNumber, duration).then(resolve);
      }, 200);
    });
  }
  
  function animateStepWithSlider(stepNumber, duration) {
    return new Promise((resolve) => {
      // SOFORT: Slider-Wechsel starten
      slideToDiv(stepNumber);
      
      // PARALLEL: Progress Bar Animation
      animateProgressBarSmooth(stepNumber, duration).then(() => {
        // Am Ende der Progress Animation: Aktuelles Div vorbereiten für Slide-out
        if (stepNumber < 2) { // Nur Step 1 bereitet sich für Slide-out vor
          prepareCurrentDivForSlideOut(stepNumber);
        }
        
        resolve();
      });
    });
  }
  
  // PERFEKT SYNCHRONISIERTE Progress Bar Animation
  function animateProgressBarSmooth(barNumber, duration) {
    return new Promise((resolve) => {
      const bar = document.querySelector(`[data-progress-bar="${barNumber}"]`);
      const text = document.querySelector(`[data-progress-text="${barNumber}"]`);
      
      if (!bar) {
        resolve();
        return;
      }
      
      const steps = 100; // 100 Steps für 100%
      const stepTime = duration / steps;
      
      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }
      
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        const t = currentStep / steps;
        const easedProgress = easeOutCubic(t) * 100;
        
        // SYNCHRONISIERTE UPDATES - beide verwenden den gleichen Wert
        const progressValue = Math.round(easedProgress);
        
        bar.style.width = `${progressValue}%`;
        if (text) {
          text.textContent = `${progressValue}%`;
        }
        
        // Ende bei 100%
        if (currentStep >= steps) {
          // FINALE WERTE - garantiert beide auf 100%
          bar.style.width = '100%';
          if (text) text.textContent = '100%';
          clearInterval(interval);
          resolve();
        }
      }, stepTime);
    });
  }

  // Slider-Animation: Div von rechts rein
  function slideToDiv(targetDivNumber) {
    // Erst vorheriges Div raus animieren (falls vorhanden)
    if (targetDivNumber > 1) {
      slideOutPreviousDiv(targetDivNumber).then(() => {
        // Dann neues Div rein animieren
        slideInNewDiv(targetDivNumber);
      });
    } else {
      // Für Div 1: Direkt rein animieren
      slideInNewDiv(targetDivNumber);
    }
  }
  
  // Aktuelles Div für Slide-out vorbereiten
  function prepareCurrentDivForSlideOut(currentDivNumber) {
    const currentDiv = document.querySelector(`[data-progress-div="${currentDivNumber}"]`);
    if (!currentDiv) return;
    
    // Div ist bereit für Slide-out beim nächsten Wechsel
    currentDiv.setAttribute('data-ready-for-slideout', 'true');
  }
  
  // Vorheriges Div nach links raus animieren
  function slideOutPreviousDiv(currentDivNumber) {
    return new Promise((resolve) => {
      const previousDivNumber = currentDivNumber - 1;
      const previousDiv = document.querySelector(`[data-progress-div="${previousDivNumber}"]`);
      
      if (!previousDiv) {
        resolve();
        return;
      }
      
      // Nach links raus animieren mit Opacity fade
      previousDiv.style.opacity = '0';
      previousDiv.style.transform = 'translateX(-100px)';
      
      // Nach Animation verstecken
      setTimeout(() => {
        previousDiv.style.display = 'none';
        previousDiv.style.transform = 'translateX(100px)'; // Reset für später
        resolve();
      }, 400);
    });
  }

  // Neues Div von rechts rein animieren
  function slideInNewDiv(targetDivNumber) {
    const targetDiv = document.querySelector(`[data-progress-div="${targetDivNumber}"]`);
    
    if (!targetDiv) {
      return;
    }
    
    // Ziel-Div vorbereiten
    targetDiv.style.display = 'block';
    targetDiv.style.opacity = '0';
    targetDiv.style.transform = 'translateX(100px)'; // Startet rechts
    
    // Von rechts rein animieren
    setTimeout(() => {
      targetDiv.style.opacity = '1';
      targetDiv.style.transform = 'translateX(0px)';
    }, targetDivNumber > 1 ? 100 : 50);
  }

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
  
  // Event-Handler für Make-Daten (nur noch für Hintergrund-Verarbeitung)
  document.addEventListener('quizDataLoaded', function(event) {
    // Keine Animation-Logik mehr hier - nur Daten verarbeiten
    checkDataAndShowContent(); // Ruft processQuizDataInBackground auf
  });

  // Initial Setup und Check
  setTimeout(() => {
    setupInitialState();
    checkDataAndShowContent();
  }, 500);
  
  // Test-Funktion
  window.testProgressSystem = function() {
    animationStarted = false;
    setupInitialState();
    showWrapperAndStartAnimation();
  };
 
 
 
 // NEUER ZIEHGRAD-ALGORITHMUS
// ZIEHGRAD-ALGORITHMUS
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
  // Aktuelles Datum direkt verwenden (Browser verwendet lokale Zeit)
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
  // Monat in 42 Tagen
  const monthSpans = document.querySelectorAll('[data-date-month-30="true"]');
  monthSpans.forEach(span => {
    span.textContent = monthYearIn30Days;
  });
  
  // Datum in 7 Tagen
  const date7Spans = document.querySelectorAll('[data-date-7-days="true"]');
  date7Spans.forEach(span => {
    span.textContent = dateIn7Days;
  });
  
  // Wochentag in 7 Tagen
  const weekday7Spans = document.querySelectorAll('[data-weekday-7-days="true"]');
  weekday7Spans.forEach(span => {
    span.textContent = weekdayIn7Days;
  });
};

  // NEUE FUNKTION: Conditional Content basierend auf Quiz-Antworten
  window.showConditionalContent = function() {
    if (!window.quizData) {
      return;
    }
    
    // Alle Elemente mit data-answer-content durchgehen
    const allContentElements = document.querySelectorAll('[data-answer-content]');
    
    allContentElements.forEach(element => {
      const contentRule = element.getAttribute('data-answer-content');
      
      // Format: "feldname:antwort"
      const [fieldName, expectedAnswer] = contentRule.split(':');
      
      if (!fieldName || !expectedAnswer) {
        return;
      }
      
      // Tatsächliche Antwort aus Quiz-Daten holen
      const actualAnswer = getQuizAnswer(fieldName.trim());
      
      // Vergleich: Wenn Antwort übereinstimmt, Element anzeigen
      if (actualAnswer && actualAnswer.trim() === expectedAnswer.trim()) {
        element.style.display = 'flex';
        // Optional: Fade-in Animation
        element.style.opacity = '0';
        setTimeout(() => {
          element.style.transition = 'opacity 0.6s ease-in';
          element.style.opacity = '1';
        }, 50);
      } else {
        // Sonst versteckt lassen
        element.style.display = 'none';
      }
    });
  };
  
// ===== TIMER SYSTEM MIT RELOAD-PERSISTENZ =====
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
  
  // ===== WICHTIG: Timer-Daten löschen =====
  localStorage.removeItem(TIMER_STORAGE_KEY);
  timerStarted = false;
  
  // Weiterleitung
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

});  // <- Schließt DOMContentLoaded



// ===== ZWEITER SCRIPT BLOCK: QUIZ DATA MANAGEMENT =====
document.addEventListener("DOMContentLoaded", function() {
  let quizData = null;
  
  // URL-Parameter extrahieren
  function getEmailFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('email');
  }
  
  // URL von email-Parameter bereinigen
  function cleanURLFromEmailParam() {
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);
    
    if (params.has('email')) {
      params.delete('email');
      url.search = params.toString();
      
      // URL im Browser aktualisieren ohne Reload
      window.history.replaceState({}, document.title, url.toString());
    }
  }
  
  // Email aus URL oder localStorage holen (URL hat Priorität)
  function getEmailFromStorage() {
    // Zuerst URL-Parameter prüfen
    const urlEmail = getEmailFromURL();
    if (urlEmail) {
      return urlEmail;
    }
    
    // Fallback auf localStorage
    const email = localStorage.getItem('email') || 
                 localStorage.getItem('lc_useremail') || 
                 localStorage.getItem('encryptedEmail');
    return email;
  }
  
  // Sofort lokale Daten laden und anzeigen
  function loadLocalDataImmediately() {
    // Verschiedene mögliche Keys für Hundename prüfen
    const localDogName = localStorage.getItem('dogName') || 
                        localStorage.getItem('dog_name') || 
                        localStorage.getItem('name_dog');
    
    // Verschiedene mögliche Keys für Vorname prüfen
    const localFirstName = localStorage.getItem('fn') || 
                          localStorage.getItem('first_name') || 
                          localStorage.getItem('firstName');
    
    // Sofort Spans mit lokalen Daten füllen
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
  
  // Hilfsfunktion: Vorname abrufen (mit korrigierten Fallbacks)
  window.getFirstName = function() {
    // Zuerst aus Make-Daten
    if (window.quizData && window.quizData.first_name) {
      return window.quizData.first_name;
    }
    // Fallback auf localStorage mit korrigierten Keys
    return localStorage.getItem('fn') || 
           localStorage.getItem('first_name') || 
           localStorage.getItem('firstName') || 
           'Du';
  };
  
  // Prüfen ob Make-Daten geladen sind und Name verfügbar ist
  function checkDataAndShowContent() {
    const currentDogName = getDogName();
    const currentFirstName = getFirstName();
    const hasName = currentDogName !== 'Dein Hund' || currentFirstName !== 'Du';
    const hasMakeData = !!window.quizData;
    
    if (hasName) {
      // Heading mit Namen anzeigen
      showHeadingWithName();
    }
    
    if (hasMakeData && hasName) {
      makeDataLoaded = true;
      showProgressWrapper();
    }
  }
  
  // Quiz-Daten von Make abrufen
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
  
  // Quiz-Daten global verfügbar machen
  function makeDataAvailable(data) {
    // In globalem Objekt speichern
    window.quizData = data;
    
    // In localStorage für Persistenz (als Backup)
    localStorage.setItem('quizData', JSON.stringify(data));
    
    // Custom Event für andere Scripts
    const event = new CustomEvent('quizDataLoaded', { 
      detail: data 
    });
    document.dispatchEvent(event);
  }
  
  // Hilfsfunktion: Quiz-Antwort abrufen
  window.getQuizAnswer = function(questionKey) {
    if (!window.quizData) {
      return null;
    }
    return window.quizData[questionKey] || null;
  };
  
  // Hilfsfunktion: Hundename abrufen (mit Fallback auf localStorage)
  window.getDogName = function() {
    // Zuerst aus Make-Daten
    if (window.quizData && window.quizData.dog_name) {
      return window.quizData.dog_name;
    }
    // Fallback auf localStorage
    return localStorage.getItem('dogName') || localStorage.getItem('dog_name') || 'Dein Hund';
  };
  
  // Hilfsfunktion: Vorname abrufen (mit Fallback auf localStorage)
  window.getFirstName = function() {
    // Zuerst aus Make-Daten
    if (window.quizData && window.quizData.first_name) {
      return window.quizData.first_name;
    }
    // Fallback auf localStorage
    return localStorage.getItem('first_name') || localStorage.getItem('firstName') || 'Du';
  };
  
  // Erweiterte Hilfsfunktionen
  window.getQuizData = {
    // Grunddaten
    getEmail: () => getQuizAnswer('email'),
    getFirstName: () => getFirstName(),
    getDogName: () => getDogName(),
    
    // Quiz-Antworten
    getGeschlecht: () => getQuizAnswer('geschlecht'),
    getAlter: () => getQuizAnswer('alter'),
    getZiehenHaeufigkeit: () => getQuizAnswer('haeufigkeit_ziehen'),
    getZiehenStaerke: () => getQuizAnswer('staerke_ziehen'),
    getMotivation: () => getQuizAnswer('motivation'),
    getZeitVerfuegbar: () => getQuizAnswer('zeit_verfuegbar'),
    
    // Problemanalyse
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
  
  // Algorithmus für Inhaltsanpassung (nur mit Make-Daten)
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
    
    // Problem-Level berechnen
    let problemScore = 0;
    if (getQuizData.istStarkerZieher()) problemScore += 3;
    if (getQuizData.istHaeufigerZieher()) problemScore += 2;
    if (getQuizAnswer('schon_gestuerzt') === 'Ja, ich bin bereits gestürzt') problemScore += 3;
    if (getQuizAnswer('verspannung') === 'Ja, manchmal') problemScore += 1;
    
    if (problemScore >= 5) profile.problemLevel = 'hoch';
    else if (problemScore >= 3) profile.problemLevel = 'mittel';
    
    // Trainingsintensität
    if (getQuizData.istSehrMotiviert() && getQuizData.hatVielZeit()) {
      profile.trainingsIntensitaet = 'intensiv';
    } else if (getQuizData.istSehrMotiviert()) {
      profile.trainingsIntensitaet = 'erhöht';
    }
    
    // Fokusbereich
    if (getQuizAnswer('grosse_ablenkung') === 'Andere Hunde') {
      profile.fokusBereich = 'hundebegegnungen';
    } else if (getQuizAnswer('grosse_ablenkung') && getQuizAnswer('grosse_ablenkung').includes('Menschen')) {
      profile.fokusBereich = 'menschenbegegnungen';
    }
    
    // Empfohlene Dauer
    if (profile.problemLevel === 'hoch') profile.empfohlenesDauer = '4-6 Wochen';
    else if (profile.problemLevel === 'mittel') profile.empfohlenesDauer = '2-4 Wochen';
    
    return profile;
  };
  
  // Inhalte basierend auf Profil anzeigen
  window.showContentBasedOnProfile = function(profile) {
    if (!profile) return;
    
    // Problem-Level Content
    if (profile.problemLevel === 'hoch') {
      showElements('[data-content="high-problem"]');
      hideElements('[data-content="low-problem"]');
    }
    
    // Trainingsintensität Content
    if (profile.trainingsIntensitaet === 'intensiv') {
      showElements('[data-content="intensive-training"]');
    }
    
    // Fokusbereich Content
    if (profile.fokusBereich === 'hundebegegnungen') {
      showElements('[data-content="dog-encounters"]');
    }
    
    // Zeitbasierte Inhalte
    if (getQuizData.hatVielZeit()) {
      showElements('[data-content="extended-training"]');
    } else {
      showElements('[data-content="quick-training"]');
    }
  };
  
  // Alle dynamischen Inhalte aktualisieren
  function updateAllDynamicContent() {
    // Hundename überall einsetzen (mit aktuellen Daten)
    const dogNameSpans = document.querySelectorAll('[data-dog-name="true"]');
    dogNameSpans.forEach(span => {
      span.textContent = getDogName();
    });
    
    // Vorname überall einsetzen (mit aktuellen Daten)
    const firstNameSpans = document.querySelectorAll('[data-first-name="true"]');
    firstNameSpans.forEach(span => {
      span.textContent = getFirstName();
    });
  }
  
  // Debug-Funktion
  window.showQuizData = function() {
    console.log("Aktuelle Quiz-Daten:", window.quizData);
    console.log("Email aus URL:", getEmailFromURL());
    console.log("localStorage Email:", localStorage.getItem('email'));
    console.log("localStorage Hundename:", localStorage.getItem('dogName'));
    console.log("localStorage Vorname:", localStorage.getItem('first_name'));
  };
  
  // Test-Funktion
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
  
  // Hauptfunktion ausführen
  async function initializeQuizData() {
    const email = getEmailFromStorage();
    
    // URL bereinigen wenn email-Parameter vorhanden war
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
  
  // Event-Handler für geladene Quiz-Daten von Make
  document.addEventListener('quizDataLoaded', function(event) {
    const quizData = event.detail;
    
    // Dynamische Inhalte mit Make-Daten aktualisieren
    updateAllDynamicContent();
    
    // User-Profil berechnen (nur mit Make-Daten möglich)
    const userProfile = calculateUserProfile();
    
    // Inhalte anpassen
    showContentBasedOnProfile(userProfile);
    
    // Profil global verfügbar machen
    window.userProfile = userProfile;
  });
  
  // SOFORT beim Laden: Lokale Daten verwenden
  loadLocalDataImmediately();
  
  // DANN: Make-Daten laden (asynchron)
  initializeQuizData();
});

// Hilfsfunktionen für Element-Management (außerhalb von DOMContentLoaded)
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
