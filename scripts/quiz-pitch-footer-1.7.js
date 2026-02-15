/**
 * Leinenchallenge Quiz Pitch - Footer Script V1.7
 * GEÄNDERT: Alter 3-Schritt-Spinner entfernt, ersetzt durch simple Advance-Logik
 * Ziehgrad-Berechnung, Quiz-Daten, Timer System
 */

// Simple Spinner Advance Logic (IIFE)
(function() {
  // Reload-Check: Nicht auto-advancen wenn Seite neu geladen wurde
  var isReload = false;
  try {
    var navEntry = performance.getEntriesByType('navigation')[0];
    isReload = navEntry && navEntry.type === 'reload';
  } catch(e) {
    isReload = performance.navigation && performance.navigation.type === 1;
  }

  if (isReload) {
    console.log('🔄 Reload erkannt – Spinner Auto-Advance übersprungen');
    return;
  }


// ===== SIMPLE SPINNER ADVANCE LOGIK (ersetzt alten 3-Schritt-Spinner) =====
(function() {
  var advanced = false;
  var minDisplayTime = 1500;  // Min. 1.5s Spinner anzeigen
  var maxWaitTime = 8000;     // Max. 8s warten
  var startTime = Date.now();

  function advanceToNextStep() {
    if (advanced) return;
    advanced = true;

    // Next-Button in Step 1 finden und klicken
    var step1 = document.querySelector('[data-form-step="1"]');
    if (step1) {
      var btn = step1.querySelector('[data-next-button]');
      if (btn) {
        btn.click();
        return;
      }
    }

    // Fallback: Erster sichtbarer Step
    var steps = document.querySelectorAll('[data-form-step]');
    for (var i = 0; i < steps.length; i++) {
      var step = steps[i];
      if (window.getComputedStyle(step).display !== 'none') {
        var btn = step.querySelector('[data-next-button]');
        if (btn) {
          btn.click();
          return;
        }
      }
    }
  }

  function tryAdvance() {
    var elapsed = Date.now() - startTime;
    var remaining = Math.max(0, minDisplayTime - elapsed);

    if (remaining > 0) {
      setTimeout(advanceToNextStep, remaining);
    } else {
      advanceToNextStep();
    }
  }

  // Weiter wenn Make-Daten geladen
  document.addEventListener('quizDataLoaded', tryAdvance);

  // Safety Timeout
  setTimeout(function() {
    if (!advanced) {
      advanceToNextStep();
    }
  }, maxWaitTime);
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

// Hundegewicht in Spans anzeigen
window.showDogWeightInSpans = function() {
  const dogWeight = getDogWeight();
  
  const weightSpans = document.querySelectorAll('[data-quiz-answer="dog_weight"]');
  weightSpans.forEach(span => {
    span.textContent = dogWeight || 'Unbekannt';
  });
};

// Hundegewicht abrufen (mit Fallback)
window.getDogWeight = function() {
  // Zuerst aus Make-Daten
  if (window.quizData && window.quizData.dog_weight) {
    return window.quizData.dog_weight;
  }
  // Fallback auf localStorage
  return localStorage.getItem('dog_weight') || null;
};

// Ziehgrad in Input-Field schreiben (falls vorhanden)
window.writeZiehgradToInput = function() {
  const inputField = document.getElementById('input-ziehgrad');
  
  // Wenn Input nicht existiert, einfach return (kein Error)
  if (!inputField) {
    return;
  }
  
  const ziehgradText = getZiehgradText();
  
  if (ziehgradText && ziehgradText !== 'Unbekannt') {
    inputField.value = ziehgradText;
    console.log('✅ Ziehgrad in Input geschrieben:', ziehgradText);
  }
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

const date8days = document.querySelectorAll('[data-date-8days]');
date8days.forEach(el => {
  const d = new Date();
  d.setDate(d.getDate() + 8);
  el.textContent = d.getDate().toString().padStart(2, '0') + '.' + (d.getMonth() + 1).toString().padStart(2, '0');
});

  
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
  if (!window.quizData && !localStorage.getItem('dog_weight')) {
    return;
  }
  
  const allContentElements = document.querySelectorAll('[data-answer-content]');
  
  allContentElements.forEach(element => {
    const contentRule = element.getAttribute('data-answer-content');
    const [fieldName, expectedAnswer] = contentRule.split(':');
    
    if (!fieldName || !expectedAnswer) {
      return;
    }
    
    let actualAnswer = null;
    
    // Spezialfall für dog_weight (kann auch ohne quizData aus localStorage kommen)
    if (fieldName.trim() === 'dog_weight') {
      actualAnswer = getDogWeight();
    } else {
      actualAnswer = getQuizAnswer(fieldName.trim());
    }
    
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
    const startButton = document.getElementById('quiz_btn_step35');
    
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
    console.warn('⚠️ fetchQuizData: Keine Email');
    return null;
  }
  
  console.log('🔍 fetchQuizData: Lade Daten für:', email);
  
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
  // In globalem Objekt speichern
  window.quizData = data;
  
  // In localStorage für Persistenz
  localStorage.setItem('quizData', JSON.stringify(data));
  
  // ===== NEU: Email auch einzeln speichern =====
  if (data.email) {
    localStorage.setItem('email', data.email);
    console.log('✅ Email in localStorage gespeichert:', data.email);
  }
  
  // Custom Event für andere Scripts
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
    
    const userProfile = calculateUserProfile();
    showContentBasedOnProfile(userProfile);
    window.userProfile = userProfile;
    
    // Ziehgrad berechnen
    const ziehgradResult = calculateZiehgrad();
    if (ziehgradResult) {
      window.ziehgradResult = ziehgradResult;
      setTimeout(() => {
        showZiehgradContent();
        writeZiehgradToInput(); // NEU: Ziehgrad in Input schreiben
      }, 100);
    }
    
    // Quiz-Antworten in Spans laden
    setTimeout(() => {
      showQuizAnswersInSpans();
    }, 200);

    // Hundegewicht in Spans laden
    setTimeout(() => {
      showDogWeightInSpans();
    }, 250);
    
    // Datum-Berechnungen
    setTimeout(() => {
      calculateDatesFromQuiz();
    }, 300);
    
    // Conditional Content anzeigen
    setTimeout(() => {
      showConditionalContent();
    }, 400);
  });

  
// Hundegewicht auch sofort laden (falls schon im localStorage)
setTimeout(() => {
  showDogWeightInSpans();
  showConditionalContent(); // Auch Conditional Content initial prüfen
}, 100);

// ===== WICHTIG: initializeQuizData AUFRUFEN =====
setTimeout(async () => {
  console.log('🚀 Starte initializeQuizData');
  await initializeQuizData();
  console.log('✅ initializeQuizData abgeschlossen');
}, 500);

});  // <- Schließt DOMContentLoaded

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
