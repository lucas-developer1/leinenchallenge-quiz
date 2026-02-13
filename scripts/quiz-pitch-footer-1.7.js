/**
 * Leinenchallenge Quiz Pitch - Footer Script V1.7
 * NEU: Simple Spinner Advance-Logik (ersetzt alten 3-Schritt-Spinner)
 * Ziehgrad-Berechnung, Quiz-Daten, Timer System
 */


// ===== SIMPLE SPINNER ADVANCE LOGIK =====
(function() {
  var advanced = false;
  var minDisplayTime = 1500;  // Min. 1.5s Spinner anzeigen
  var maxWaitTime = 8000;     // Max. 8s warten
  var startTime = Date.now();

  function advanceToNextStep() {
    if (advanced) return;
    advanced = true;

    // Strategie 1: [data-next-button] im sichtbaren Step
    var steps = document.querySelectorAll('[data-form-step]');
    for (var i = 0; i < steps.length; i++) {
      var step = steps[i];
      var display = step.style.display || window.getComputedStyle(step).display;
      if (display !== 'none') {
        var btn = step.querySelector('[data-next-button]');
        if (btn) {
          btn.click();
          return;
        }
      }
    }

    // Strategie 2: Erster [data-next-button] auf der Seite
    var fallbackBtn = document.querySelector('[data-next-button]');
    if (fallbackBtn) {
      fallbackBtn.click();
      return;
    }

    // Strategie 3: FinishFlow Event
    document.dispatchEvent(new CustomEvent('finishflow:next'));

    // Strategie 4: Manueller Step-Wechsel
    setTimeout(function() {
      var step1 = document.querySelector('[data-form-step="1"]');
      var step2 = document.querySelector('[data-form-step="2"]');
      if (step1 && step2) {
        step1.style.display = 'none';
        step2.style.display = 'block';
      }
    }, 300);
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
  
  if (bedingung1) multiplier *= 1.1;
  if (bedingung2) multiplier *= 1.1;
  
  const finalScore = Math.round(totalScore * multiplier);
  
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

window.showZiehgradContent = function() {
  const ziehgrad = getZiehgrad();
  if (!ziehgrad) return;
  
  hideElements('[data-ziehgrad-content]');
  showElements(`[data-ziehgrad-content="${ziehgrad}"]`);
  
  document.querySelectorAll('[data-ziehgrad-score="true"]').forEach(span => {
    span.textContent = getZiehgradScore();
  });
  
  document.querySelectorAll('[data-ziehgrad-text="true"]').forEach(span => {
    span.textContent = getZiehgradText();
  });
};

// Quiz-Antworten in Spans
window.showQuizAnswersInSpans = function() {
  if (!window.quizData) return;
  
  const answerMappings = {
    'motivation': 'motivation',
    'wichtigster_punkt': 'wichtigster_punkt',
    'alter': 'alter',
    'geschlecht': 'geschlecht',
    'haeufigkeit_ziehen': 'haeufigkeit_ziehen',
    'staerke_ziehen': 'staerke_ziehen',
    'zeit_verfuegbar': 'zeit_verfuegbar',
    'ziel_30_tage': 'ziel_30_tage',
    'woher_hund': 'woher_hund',
    'wie_lange_schon': 'wie_lange_schon'
  };
  
  Object.keys(answerMappings).forEach(key => {
    document.querySelectorAll(`[data-quiz-answer="${key}"]`).forEach(span => {
      span.textContent = getQuizAnswer(answerMappings[key]) || 'Unbekannt';
    });
  });
};

// Hundegewicht
window.showDogWeightInSpans = function() {
  const dogWeight = getDogWeight();
  document.querySelectorAll('[data-quiz-answer="dog_weight"]').forEach(span => {
    span.textContent = dogWeight || 'Unbekannt';
  });
};

window.getDogWeight = function() {
  if (window.quizData && window.quizData.dog_weight) return window.quizData.dog_weight;
  return localStorage.getItem('dog_weight') || null;
};

window.writeZiehgradToInput = function() {
  const inputField = document.getElementById('input-ziehgrad');
  if (!inputField) return;
  const ziehgradText = getZiehgradText();
  if (ziehgradText && ziehgradText !== 'Unbekannt') inputField.value = ziehgradText;
};


// Datum-Berechnungen
window.calculateDatesFromQuiz = function() {
  const startDate = new Date();
  
  const date30DaysLater = new Date(startDate);
  date30DaysLater.setDate(startDate.getDate() + 42);

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const monthYearIn30Days = `${monthNames[date30DaysLater.getMonth()]} ${date30DaysLater.getFullYear()}`;
  
  const date7DaysLater = new Date(startDate);
  date7DaysLater.setDate(startDate.getDate() + 7);
  
  const dateIn7Days = `${String(date7DaysLater.getDate()).padStart(2, '0')}.${String(date7DaysLater.getMonth() + 1).padStart(2, '0')}.`;
  
  const weekdayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const weekdayIn7Days = weekdayNames[date7DaysLater.getDay()];
  
  document.querySelectorAll('[data-date-month-30="true"]').forEach(span => {
    span.textContent = monthYearIn30Days;
  });
  
  document.querySelectorAll('[data-date-7-days="true"]').forEach(span => {
    span.textContent = dateIn7Days;
  });
  
  document.querySelectorAll('[data-weekday-7-days="true"]').forEach(span => {
    span.textContent = weekdayIn7Days;
  });
};

// Conditional Content
window.showConditionalContent = function() {
  if (!window.quizData && !localStorage.getItem('dog_weight')) return;
  
  document.querySelectorAll('[data-answer-content]').forEach(element => {
    const contentRule = element.getAttribute('data-answer-content');
    const [fieldName, expectedAnswer] = contentRule.split(':');
    
    if (!fieldName || !expectedAnswer) return;
    
    let actualAnswer = null;
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
    document.querySelectorAll('[data-timer-display="true"]').forEach(span => {
      span.textContent = formatTime(remainingSeconds);
    });
  }

  function saveTimerToStorage() {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
      startTime: timerStartTime,
      remainingSeconds: remainingSeconds,
      timerStarted: timerStarted,
      lastUpdate: Date.now()
    }));
  }

  function loadTimerFromStorage() {
    const stored = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!stored) return null;
    try { return JSON.parse(stored); } catch (e) { return null; }
  }

  function restoreTimerFromStorage() {
    const timerData = loadTimerFromStorage();
    if (!timerData || !timerData.timerStarted) return false;
    
    const elapsedSeconds = Math.floor((Date.now() - timerData.lastUpdate) / 1000);
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
    if (timerInterval) clearInterval(timerInterval);
    localStorage.removeItem(TIMER_STORAGE_KEY);
    timerStarted = false;
    window.location.href = 'https://www.hundetraining.de/ll/lc/authentifizierung?target=video1';
  }

  function startTimerCountdown() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplay();
      saveTimerToStorage();
      if (remainingSeconds <= 0) handleTimerExpired();
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
    document.querySelectorAll('[data-add-time="true"]').forEach(button => {
      button.addEventListener('click', function() {
        if (!timerStarted) return;
        remainingSeconds += 10 * 60;
        updateTimerDisplay();
        saveTimerToStorage();
        document.querySelectorAll('[data-add-time="true"]').forEach(btn => {
          btn.style.display = 'none';
        });
      });
    });
  }

  function initializeTimerSystem() {
    const restored = restoreTimerFromStorage();
    if (!restored) updateTimerDisplay();
    initializeTimer();
    initializeAddTimeButtons();
  }

  setTimeout(() => { initializeTimerSystem(); }, 100);
});


// ===== QUIZ DATA MANAGEMENT =====
document.addEventListener("DOMContentLoaded", function() {
  
  function getEmailFromURL() {
    return new URLSearchParams(window.location.search).get('email');
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
    if (urlEmail) return urlEmail;
    return localStorage.getItem('email') || 
           localStorage.getItem('lc_useremail') || 
           localStorage.getItem('encryptedEmail');
  }
  
  function loadLocalDataImmediately() {
    const localDogName = localStorage.getItem('dogName') || 
                        localStorage.getItem('dog_name') || 
                        localStorage.getItem('name_dog');
    
    const localFirstName = localStorage.getItem('fn') || 
                          localStorage.getItem('first_name') || 
                          localStorage.getItem('firstName');
    
    if (localDogName) {
      document.querySelectorAll('[data-dog-name="true"]').forEach(span => {
        span.textContent = localDogName;
      });
    }
    
    if (localFirstName) {
      document.querySelectorAll('[data-first-name="true"]').forEach(span => {
        span.textContent = localFirstName;
      });
    }
  }
  
  window.getFirstName = function() {
    if (window.quizData && window.quizData.first_name) return window.quizData.first_name;
    return localStorage.getItem('fn') || 
           localStorage.getItem('first_name') || 
           localStorage.getItem('firstName') || 
           'Du';
  };
  
  async function fetchQuizData(email) {
    if (!email) return null;
    try {
      const response = await fetch('https://hook.eu2.make.com/3m83fp9qnluup12vr8d8donscnuuo4de', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, action: 'get_quiz_data' })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Fetch Fehler:', error);
      return null;
    }
  }
  
  function makeDataAvailable(data) {
    window.quizData = data;
    localStorage.setItem('quizData', JSON.stringify(data));
    if (data.email) localStorage.setItem('email', data.email);
    document.dispatchEvent(new CustomEvent('quizDataLoaded', { detail: data }));
  }
  
  window.getQuizAnswer = function(questionKey) {
    if (!window.quizData) return null;
    return window.quizData[questionKey] || null;
  };
  
  window.getDogName = function() {
    if (window.quizData && window.quizData.dog_name) return window.quizData.dog_name;
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
    if (!window.quizData) return null;
    
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
    document.querySelectorAll('[data-dog-name="true"]').forEach(span => {
      span.textContent = getDogName();
    });
    document.querySelectorAll('[data-first-name="true"]').forEach(span => {
      span.textContent = getFirstName();
    });
  }
  
  async function initializeQuizData() {
    const email = getEmailFromStorage();
    if (getEmailFromURL()) cleanURLFromEmailParam();
    
    if (email) {
      const data = await fetchQuizData(email);
      if (data) makeDataAvailable(data);
    }
  }
  
  // quizDataLoaded Event Handler
  document.addEventListener('quizDataLoaded', function(event) {
    updateAllDynamicContent();
    
    const userProfile = calculateUserProfile();
    showContentBasedOnProfile(userProfile);
    window.userProfile = userProfile;
    
    const ziehgradResult = calculateZiehgrad();
    if (ziehgradResult) {
      window.ziehgradResult = ziehgradResult;
      setTimeout(() => {
        showZiehgradContent();
        writeZiehgradToInput();
      }, 100);
    }
    
    setTimeout(() => { showQuizAnswersInSpans(); }, 200);
    setTimeout(() => { showDogWeightInSpans(); }, 250);
    setTimeout(() => { calculateDatesFromQuiz(); }, 300);
    setTimeout(() => { showConditionalContent(); }, 400);
  });

  // Sofort laden was aus localStorage geht
  loadLocalDataImmediately();
  
  setTimeout(() => {
    showDogWeightInSpans();
    showConditionalContent();
  }, 100);

  // Quiz-Daten von Make laden
  setTimeout(async () => {
    await initializeQuizData();
  }, 500);

});  // <- Schließt DOMContentLoaded


// Hilfsfunktionen für Element-Management
function showElements(selector) {
  document.querySelectorAll(selector).forEach(el => { el.style.display = 'block'; });
}

function hideElements(selector) {
  document.querySelectorAll(selector).forEach(el => { el.style.display = 'none'; });
}
