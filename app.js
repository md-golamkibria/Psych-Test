// Rorschach Test Web - client-side implementation
// Entertainment only; mirrors rorschach_test.py rules

const TOTAL_CARDS = 10;

const cardQuestions = {
  1: "What might this be?",
  2: "This is the Violence interpersonal communication & Domination test. what you see in this picture?",
  3: "This is the sexual preferences test. What you see in this picture?",
  4: "This is a Authority indication test. What you see in this picture?",
  5: "This is a Hostility Castration complex & Schizophrenia test. What you see in this picture?",
  6: "This is a Subconscious sexual association. What you see in this picture?",
  7: "This is a individual’s feeling about female figures in his or her life test. What you see in this picture?",
  8: "This is a Animal not cat or dog. For legged animal test. What you see in this picture?",
  9: "This is a Social interaction test. what you see in this picture?",
  10: "This is a Oral Fixation test. What you see in this picture?",
};

// Rules ported from rorschach_test.py
const rorschachRules = {
  1: {
    [JSON.stringify(["bat", "butterfly", "moth", "female figure", "girl figure"])]: "normal/average",
    [JSON.stringify(["jack-o-lantern", "mask", "animal face"])]: "sense of paranoia",
    [JSON.stringify(["derogatory", "insulting", "ugly", "fat", "disgusting", "bad body"])]: "you have negative feelings about your own body image",
  },
  2: {
    [JSON.stringify(["butterfly", "moth"])]: "normal/average",
    [JSON.stringify(["blood"])]: "you have difficulty controlling your anger",
    [JSON.stringify(["two people"])]: "you may have trouble communicating with others",
    [JSON.stringify(["animal"])]: "you may have strong desire to dominate others",
  },
  3: {
    [JSON.stringify(["two male", "two men"])]: "you probably have heterosexual inclination",
    [JSON.stringify(["two females", "two women", "androgynous"])]: "you likely have some homosexual tendencies",
  },
  4: {
    [JSON.stringify(["bear", "gorilla", "man"])]: "you are confident person",
    [JSON.stringify([
      "menacing male", "angry man",
      "male monster", "male monsters",
      "male giant", "male giants",
      "male evil",
      "male demon", "male demons",
      "male beast", "male beasts",
      "male creature", "male creatures",
      "male ogre", "male ogres",
      "male troll", "male trolls",
      "male villain", "male villains",
      "male devil", "male devils",
      "male ghost", "male ghosts",
      "male ghoul", "male ghouls",
      "male phantom", "male phantoms",
      "male spirit", "male spirits"
    ])]: "you have feelings of inferiority and issues with authority",
    [JSON.stringify([
      "menacing female", "angry woman",
      "female monster", "female monsters",
      "female giant", "female giants",
      "female evil",
      "female demon", "female demons",
      "female beast", "female beasts",
      "female creature", "female creatures",
      "female ogre", "female ogres",
      "female troll", "female trolls",
      "female villain", "female villains",
      "female devil", "female devils",
      "female ghost", "female ghosts",
      "female ghoul", "female ghouls",
      "female phantom", "female phantoms",
      "female spirit", "female spirits"
    ])]: "you have issues with your mother or other female authority figures",
  },
  5: {
    [JSON.stringify(["butterfly", "moth"])]: "average/normal",
    [JSON.stringify(["bat wings", "alligator"])]: "you may have an innate hostility toward others",
    [JSON.stringify(["moving picture", "moving", "picture is moving"])]: "you may be at risk of schizophrenia",
    [JSON.stringify(["saw", "scissors", "cutting instrument"])]: "you have a castration complex",
  },
  6: {
    [JSON.stringify(["animal hide", "animal skin"])]: "you may have a particular inclination toward tactile sensations, possibly even to the point of fetish",
    [JSON.stringify(["boat", "submarine", "person with pronounced features", "long beard", "big nose"])]: "you are sexually dominant, and possibly takes a very active role in your or your sexual persuits",
    [JSON.stringify(["rug"])]: "you probably find it necessary to be in a relationship at all times, and likely finds it hard to be alone.",
    [JSON.stringify(["mushroom", "mushroom cloud"])]: "you might have been high when you looked at the card",
  },
  7: {
    [JSON.stringify(["difficulty defining", "hard to see", "unclear"])]: "you have difficulty relating to females (especially with regard to you or your mother)",
    [JSON.stringify(["female figures", "children", "faces"])]: "you probably do not have significant mother issues",
    [JSON.stringify(["women fighting", "girls fighting", "women gossiping", "girls gossiping", "negatively associated activity"])]: "you have serious relationship issues with women in your life (this sometimes originates from strain in the relationship with your mother)",
    [JSON.stringify(["thunder clouds", "storm clouds"])]: "you might feel anxiety when dealing with females",
    [JSON.stringify(["oil lamp"])]: "you may be at risk for schizophrenia",
  },
  8: {
    [JSON.stringify(["four-legged animal", "four legged animal"])]: "normal/average",
    [JSON.stringify(["not a four-legged animal", "not four legged"])]: "you find emotions distressing or difficult to handle.",
    [JSON.stringify(["unsettling", "difficulty recognizing", "hard to recognize"])]: "you have cognitive problems processing complex situation",
  },
  9: {
    [JSON.stringify(["explosion", "fire", "smoke", "blooming shapes"])]: "You have trouble defining anything at all and most likely have an extreme aversion to unstructured data, random information, or randomness in general. Anything lacking structure tends to throw these types of people off balance.",
    [JSON.stringify(["cloud on middle line", "cloud in the middle"])]: "you have paranoia",
    [JSON.stringify(["monster", "fighting"])]: "you may have problems with social interaction",
  },
  10: {
    [JSON.stringify(["crab", "lobster", "rabbit’s head", "spider"])]: "you are relatively satisfied with your present situation",
    [JSON.stringify(["caterpillars", "worms", "snakes"])]: "you feel as though you are losing control over your life",
    [JSON.stringify(["dislike card", "trouble dealing", "faces", "bubbles", "smoking"])]: "you have an oral fixation",
  },
};

function getImageUrl(cardNumber){
  // Prefer jpg, then jpeg. Works on static hosting.
  const base = `Rorschach cards/card ${cardNumber}`;
  return detectExisting([`${base}.jpg`, `${base}.jpeg`]);
}

function detectExisting(candidates){
  // We cannot sync check; we try first candidate; if load fails we switch
  return candidates[0];
}

function computeInterpretation(cardNumber, userText){
  const words = userText.toLowerCase().split(/\s+/).filter(Boolean);
  const rules = rorschachRules[cardNumber] || {};
  const scores = new Map();

  const closeMatch = (word, candidates) => {
    // simple levenshtein-like via Dice coefficient between strings
    const best = candidates.some(k => similarity(word, k) >= 0.8);
    return best;
  };

  for(const key of Object.keys(rules)){
    const keywords = JSON.parse(key); // array of phrases
    // break phrases into words to mirror python's logic
    const allWords = keywords.flatMap(p => p.split(/\s+/));
    let score = 0;
    for(const w of words){
      if(closeMatch(w, allWords)) score += 1;
    }
    if(score > 0){
      scores.set(rules[key], score);
    }
  }
  if(scores.size === 0){
    return "No interpretation available for that response.";
  }
  let bestInterp = null; let bestScore = -1;
  for(const [interp, sc] of scores){
    if(sc > bestScore){ bestScore = sc; bestInterp = interp; }
  }
  return bestInterp;
}

function similarity(a, b){
  // Sørensen–Dice coefficient on bigrams
  if(a === b) return 1;
  if(a.length < 2 || b.length < 2) return a === b ? 1 : 0;
  const bigrams = s => {
    const arr = [];
    for(let i=0;i<s.length-1;i++){ arr.push(s.slice(i,i+2)); }
    return arr;
  };
  const arrA = bigrams(a);
  const arrB = bigrams(b);
  const set = new Map();
  for(const g of arrA){ set.set(g, (set.get(g)||0)+1); }
  let intersection = 0;
  for(const g of arrB){
    const n = set.get(g)||0;
    if(n>0){ intersection++; set.set(g, n-1); }
  }
  return (2*intersection)/(arrA.length + arrB.length);
}

// App state
let state = {
  card: 1,
  results: [], // {card, answer, interpretation}
};

// Elements
const appRoot = document.getElementById('app');
const screenWelcome = document.getElementById('screen-welcome');
const screenTest = document.getElementById('screen-test');
const screenResults = document.getElementById('screen-results');
const screenSzondi = document.getElementById('screen-szondi');
const startRorschachBtn = document.getElementById('start-rorschach-btn');
const startSzondiBtn = document.getElementById('start-szondi-btn');
const cardNumberEl = document.getElementById('card-number');
const cardImageEl = document.getElementById('card-image');
const imageFallbackEl = document.getElementById('image-fallback');
const questionEl = document.getElementById('question');
const formEl = document.getElementById('answer-form');
const inputEl = document.getElementById('answer-input');
const interpEl = document.getElementById('interpretation');
const nextBtn = document.getElementById('next-btn');
const resultsListEl = document.getElementById('results-list');
const restartBtn = document.getElementById('restart-btn');
const genderPromptEl = document.getElementById('gender-prompt');
const genderMaleBtn = document.getElementById('gender-male');
const genderFemaleBtn = document.getElementById('gender-female');
const themeToggleBtn = document.getElementById('theme-toggle');
const progressFillEl = document.getElementById('progress-bar');

// Holds the user's ambiguous answer for card 4 until gender is selected
let pendingGenderAnswer = null;

function showScreen(which){
  for(const el of [screenWelcome, screenTest, screenResults, screenSzondi]){ if(el) el.classList.remove('active'); }
  which.classList.add('active');
  // Ensure gender prompt never appears outside the test screen
  if(which !== screenTest && genderPromptEl){
    genderPromptEl.hidden = true;
    pendingGenderAnswer = null;
  }
}

function startTest(){
  state = { card: 1, results: [] };
  appRoot.classList.add('align-top');
  showScreen(screenTest);
  loadCard(state.card);
}

function goHome(){
  appRoot.classList.remove('align-top');
  showScreen(screenWelcome);
}

function loadCard(n){
  cardNumberEl.textContent = String(n);
  questionEl.textContent = cardQuestions[n] || 'What do you see?';
  interpEl.hidden = true; interpEl.textContent = '';
  nextBtn.hidden = true;
  inputEl.value = '';
  inputEl.focus();

  // Try multiple formats in order: jpg -> jpeg -> png -> webp -> svg
  const candidates = [
    `Rorschach cards/card ${n}.jpg`,
    `Rorschach cards/card ${n}.jpeg`,
    `Rorschach cards/card ${n}.png`,
    `Rorschach cards/card ${n}.webp`,
    `Rorschach cards/card ${n}.svg`,
  ];
  let index = 0;

  imageFallbackEl.hidden = true;
  cardImageEl.removeAttribute('src');

  // Reset gender prompt state for each card
  pendingGenderAnswer = null;
  if(genderPromptEl){ genderPromptEl.hidden = true; }

  const imageWrapEl = document.querySelector('#screen-test .image-wrap');

  const tryNext = () => {
    if(index >= candidates.length){
      imageFallbackEl.hidden = false;
      return;
    }
    const src = candidates[index++];
    cardImageEl.onerror = tryNext;
    cardImageEl.onload = () => {
      imageFallbackEl.hidden = true;
      // Determine orientation (portrait vs landscape)
      try{
        const w = cardImageEl.naturalWidth || cardImageEl.width;
        const h = cardImageEl.naturalHeight || cardImageEl.height;
        if(imageWrapEl && w && h){
          imageWrapEl.classList.remove('portrait','landscape');
          imageWrapEl.classList.add(h >= w ? 'portrait' : 'landscape');
        }
      }catch(e){ /* noop */ }
    };
    cardImageEl.src = src;
  };

  // Reset orientation classes on wrapper
  if(imageWrapEl){ imageWrapEl.classList.remove('portrait','landscape'); }

  tryNext();
  updateProgress();
}

function isAmbiguousCard4Answer(answer){
  const text = (answer || '').toLowerCase();
  const tokens = text.split(/[^a-z]+/).filter(Boolean);
  const genderWords = new Set(["male","female","man","woman","men","women","boy","girl","boys","girls"]);
  const targetWords = new Set([
    "monster","monsters",
    "giant","giants",
    "evil",
    "demon","demons",
    "beast","beasts",
    "creature","creatures",
    "ogre","ogres",
    "troll","trolls",
    "villain","villains",
    "devil","devils",
    "ghost","ghosts",
    "ghoul","ghouls",
    "phantom","phantoms",
    "spirit","spirits"
  ]);
  const hasTarget = tokens.some(t => targetWords.has(t));
  const hasGender = tokens.some(t => genderWords.has(t));
  return hasTarget && !hasGender;
}

// Detect whether the user's card 8 answer refers to a four-legged animal
function detectCard8Category(answer){
  const text = (answer || '').toLowerCase();
  const words = new Set(text.split(/[^a-z]+/).filter(Boolean));
  // Common four-legged animals
  const fourLegged = new Set([
    'tiger','lion','cow','cat','dog','wolf','fox','bear','horse','zebra','giraffe','deer','goat','sheep','buffalo','bison','camel','llama','alpaca','pig','boar','hippo','rhinoceros','rhino','elephant','monkey','leopard','jaguar','cheetah','panther','cougar','puma','lynx','bobcat','donkey','mule','moose','antelope','gazelle','yak','reindeer','otter','badger','beaver','hedgehog','squirrel','rat','mouse','hamster','guinea','guineapig','rabbit','hare','kangaroo','wallaby','coyote','jackal','hyena','warthog'
  ]);
  // Non-four-legged common animals
  const nonFourLegged = new Set([
    'chicken','cock','hen','rooster','duck','goose','geese','swan','turkey','bird','eagle','sparrow','pigeon','parrot','owl','penguin','ostrich','emu','kiwi','bat','snake','python','cobra','viper','fish','shark','whale','dolphin','octopus','squid','jellyfish','spider','crab','lobster','scorpion','ant','bee','wasp','butterfly','moth','worm','caterpillar','snail','slug','seal','sea','starfish','seahorse','jelly','shrimp','prawn','clam','oyster','frog','toad','lizard','crocodile','alligator','turtle','tortoise'
  ]);
  if([...words].some(w => fourLegged.has(w))) return 'four';
  if([...words].some(w => nonFourLegged.has(w))) return 'non';
  return null;
}

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const answer = inputEl.value.trim();
  if(!answer) return;
  // Special handling for Card 4 ambiguous answers that lack gender
  if(state.card === 4 && isAmbiguousCard4Answer(answer)){
    pendingGenderAnswer = answer;
    if(genderPromptEl){
      genderPromptEl.hidden = false;
      if(genderMaleBtn){ genderMaleBtn.focus(); }
    }
    interpEl.hidden = true;
    interpEl.textContent = '';
    nextBtn.hidden = true;
    return;
  }
  // Card 8: map animal names to four-/non-four-legged categories
  let answerForInterpretation = answer;
  if(state.card === 8){
    const category = detectCard8Category(answer);
    if(category === 'four'){ answerForInterpretation = 'four-legged animal'; }
    else if(category === 'non'){ answerForInterpretation = 'not a four-legged animal'; }
  }
  const interpretation = computeInterpretation(state.card, answerForInterpretation);
  interpEl.textContent = `Interpretation: ${interpretation}`;
  interpEl.hidden = false;
  state.results.push({ card: state.card, answer, interpretation });
  nextBtn.hidden = false;
  nextBtn.focus();
});

nextBtn.addEventListener('click', () => {
  if(state.card < TOTAL_CARDS){
    state.card += 1;
    loadCard(state.card);
  } else {
    showResults();
  }
});

function showResults(){
  appRoot.classList.remove('align-top');
  resultsListEl.innerHTML = '';
  for(const item of state.results){
    const li = document.createElement('li');
    li.innerHTML = `<strong>Card ${item.card}:</strong> “${escapeHtml(item.answer)}”<br><span class="muted">${escapeHtml(item.interpretation)}</span>`;
    resultsListEl.appendChild(li);
  }
  showScreen(screenResults);
  restartBtn.focus();
  // Fill progress to 100% when done
  if(progressFillEl) progressFillEl.style.width = '100%';
}

restartBtn.addEventListener('click', () => {
  goHome();
  if(startRorschachBtn) startRorschachBtn.focus();
});

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if(screenWelcome.classList.contains('active')){
    if(e.key === 'Enter'){
      e.preventDefault();
      if(startRorschachBtn) startRorschachBtn.click();
    }
  } else if(screenTest.classList.contains('active')){
    if(e.key === 'Enter' && document.activeElement !== inputEl){
      // Pressing Enter outside input advances if we already answered
      if(!nextBtn.hidden){ nextBtn.click(); }
    }
  } else if(screenSzondi && screenSzondi.classList.contains('active')){
    // No global Enter action on Szondi to avoid accidental choices
  } else if(screenResults.classList.contains('active')){
    if(e.key === 'Enter'){ restartBtn.click(); }
  }
});

if(startRorschachBtn){ startRorschachBtn.addEventListener('click', startTest); }

// Handle gender selection buttons for card 4
function handleGenderSelection(gender){
  if(state.card !== 4 || !pendingGenderAnswer) return;
  const adjusted = `${gender} ${pendingGenderAnswer}`.trim();
  const interpretation = computeInterpretation(4, adjusted);
  interpEl.textContent = `Interpretation: ${interpretation}`;
  interpEl.hidden = false;
  state.results.push({ card: 4, answer: adjusted, interpretation });
  nextBtn.hidden = false;
  nextBtn.focus();
  if(genderPromptEl){ genderPromptEl.hidden = true; }
  pendingGenderAnswer = null;
}

if(genderMaleBtn){ genderMaleBtn.addEventListener('click', () => handleGenderSelection('male')); }
if(genderFemaleBtn){ genderFemaleBtn.addEventListener('click', () => handleGenderSelection('female')); }

function escapeHtml(s){
  return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
}

// ==========================
// Szondi Test integration
// ==========================
if(startSzondiBtn && screenSzondi){
  const szondiImageEl = document.getElementById('szondi-image');
  const szondiImageFallbackEl = document.getElementById('szondi-image-fallback');
  const szondiChoicesEl = document.getElementById('szondi-choices');
  const szondiResultEl = document.getElementById('szondi-result');
  const szondiBackBtn = document.getElementById('szondi-back-btn');

  const SZONDI_RESULTS = {
    1: { title: "Aggression and Control (sadistic complex)", analysis: "Choosing picture 1 suggests heightened sensitivity to themes of power, domination, and raw assertiveness. In Szondi's framework, fear or fascination with this image may reflect a conflict around anger—how it is expressed, tamed, or turned inward. You may be particularly alert to domineering people or to situations where boundaries are tested. Positively, this can manifest as courage, directness, and the ability to protect yourself and others. The developmental task is to convert force into clear agency: firm limits, clean No's, and ethical use of strength—without sliding into harshness or self-attack." },
    2: { title: "Order, Tension, and Self‑Control (epileptoid complex)", analysis: "Choosing picture 2 often points to a strong pull toward order, precision, and control over impulse. In Szondi's reading, the fear may cluster around losing control—emotional overflow, chaos, or disapproval if rules are broken. This can come with admirable virtues: reliability, persistence, and conscientiousness. Watch for tightened self‑discipline that becomes rigid perfectionism or bottled‑up affect. Growth means making room for spontaneity while keeping the structure that helps you feel safe and effective." },
    3: { title: "Expressiveness and Recognition (histrionic complex)", analysis: "Choosing picture 3 may indicate heightened attunement to visibility, impression, and impact on others. The underlying fear can involve rejection, being unseen, or being evaluated. On the constructive side, this often signals warmth, communicative energy, and creative flair. The edge to watch is dependence on admiration or dramatic swings to secure connection. Development aims at authentic expression—speaking your needs plainly—so attention complements, rather than replaces, genuine intimacy." },
    4: { title: "Rigidity vs. Release (catatonic complex)", analysis: "Choosing picture 4 can reflect a conflict between tight control and sudden release—between freezing and bursting free. In Szondi's terms, fear gathers around passivity, paralysis, or disruptive eruption. Strengths here include endurance, focus, and the capacity to hold steady under pressure. The risk is emotional numbness or delayed action that allows problems to harden. Growth involves graded flexibility: small moves, timed breaks, and embodied practices that let vitality circulate without losing your center." },
    5: { title: "Distance and Inner World (schizoid/fragmentation complex)", analysis: "Choosing picture 5 suggests sensitivity to detachment, strangeness, or being out of sync with others. The fear often concerns losing a sense of coherence or not being understood. Positively, this maps to rich imagination, independent thinking, and comfort with abstraction. Beware of retreating so far inward that isolation grows. The task is to honor solitude and originality while building a few sturdy bridges to shared reality—rituals of contact, collaborative projects, and gentle self‑disclosure." },
    6: { title: "Guilt, Melancholy, and Self‑Worth (depressive complex)", analysis: "Choosing picture 6 may reveal a deep sensitivity to loss, guilt, or the suffering of others. The fear centers on letting people down or being unworthy. Strengths include empathy, loyalty, and moral depth. The hazard is over‑responsibility, rumination, or self‑criticism that dims your vitality. Development means practicing balanced care—naming what is and is not yours to carry—and cultivating daily habits that kindle energy, pleasure, and hope." },
    7: { title: "Drive, Energy, and Risk (manic/hypomanic complex)", analysis: "Choosing picture 7 points to sensitivity around speed, enthusiasm, and the appetite for experience. The fear may involve being swept away by impulses—or, conversely, losing access to your spark. Gifts here are optimism, initiative, and the courage to try. The edge is overreach: scattered commitments, restlessness, or grand plans without recovery time. Growth involves rhythm—bursts of action framed by rest, reflection, and grounded follow‑through." },
    8: { title: "Vigilance and Boundaries (paranoid complex)", analysis: "Choosing picture 8 highlights themes of trust, threat detection, and boundary defense. Fear here concerns betrayal, hidden motives, or loss of control to others. Positively, this becomes prudent risk assessment, keen pattern recognition, and strong self‑protection. Watch for hyper‑vigilance that narrows possibilities or strains relationships. The task is calibrated trust—testing assumptions, clarifying agreements, and letting evidence revise your stance." },
  };

  function startSzondi(){
    // Prepare image from unified folder (no subfolder)
    const candidates = [
      'For Szondi test picture.png',
      'For Szondi test picture.jpg',
      'Screenshot-2025-08-14-at-9.05.37-pm.jpg'
    ];
    let index = 0;
    if(szondiResultEl){ szondiResultEl.hidden = true; szondiResultEl.textContent = ''; }
    if(szondiChoicesEl){
      szondiChoicesEl.innerHTML = '';
      for(let i=1;i<=8;i++){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn';
        btn.textContent = String(i);
        btn.addEventListener('click', () => showSzondiResult(i));
        szondiChoicesEl.appendChild(btn);
      }
    }
    const tryNext = () => {
      if(index >= candidates.length){ if(szondiImageFallbackEl) szondiImageFallbackEl.hidden = false; return; }
      const src = candidates[index++];
      if(szondiImageEl){
        szondiImageEl.onerror = tryNext;
        szondiImageEl.onload = () => { if(szondiImageFallbackEl) szondiImageFallbackEl.hidden = true; };
        szondiImageEl.src = src;
      }
    };
    tryNext();
    appRoot.classList.add('align-top');
    showScreen(screenSzondi);
  }

  function showSzondiResult(choice){
    const res = SZONDI_RESULTS[choice];
    if(!res || !szondiResultEl) return;
    szondiResultEl.hidden = false;
    szondiResultEl.innerHTML = `<strong>Choice ${choice} — ${escapeHtml(res.title)}</strong><br>${escapeHtml(res.analysis)}`;
  }

  startSzondiBtn.addEventListener('click', startSzondi);
  if(szondiBackBtn){ szondiBackBtn.addEventListener('click', goHome); }
}

// Theme toggle and persistence
(function initTheme(){
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const initial = saved || (prefersLight ? 'light' : 'dark');
  root.setAttribute('data-theme', initial);
  if(themeToggleBtn){ themeToggleBtn.textContent = initial === 'light' ? '🌞' : '🌙'; }
})();

if(themeToggleBtn){
  themeToggleBtn.addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggleBtn.textContent = next === 'light' ? '🌞' : '🌙';
  });
}

function updateProgress(){
  if(!progressFillEl) return;
  const pct = Math.min(100, Math.max(0, ((state.card - 1) / TOTAL_CARDS) * 100));
  progressFillEl.style.width = `${pct}%`;
}
