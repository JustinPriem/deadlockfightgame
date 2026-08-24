// Item-Wordle: Rate-Logik + DOM-Rendering. Bewusst ohne Phaser/Canvas -
// ein Texteingabe-Raetsel ist mit normalem HTML/CSS einfacher und
// zugaenglicher umzusetzen als in einem Spiel-Canvas.
(function () {
  const MAX_GUESSES = 10; // grosser Item-Pool (~170) -> etwas mehr Versuche als ein klassisches Wordle

  let target = null;
  let guesses = [];
  let finished = false;

  const el = {
    form: document.getElementById('guess-form'),
    input: document.getElementById('guess-input'),
    datalist: document.getElementById('items-datalist'),
    rows: document.getElementById('guess-rows'),
    error: document.getElementById('guess-error'),
    remaining: document.getElementById('guesses-remaining'),
    resultBanner: document.getElementById('result-banner'),
    restartBtn: document.getElementById('restart-btn')
  };

  function findItemByName(name) {
    const normalized = name.trim().toLowerCase();
    return ITEMS.find((it) => it.name.toLowerCase() === normalized) || null;
  }

  function pickTarget() {
    let candidate;
    do {
      candidate = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    } while (ITEMS.length > 1 && target && candidate.id === target.id);
    return candidate;
  }

  // Tier-Reihenfolge fuers Hoeher/Niedriger-Feedback. Legendary hat keinen
  // festen Seelenpreis, wird fuers Raetsel aber als "hoechste Stufe" einsortiert.
  const TIER_ORDER = [1, 2, 3, 4, 'Legendary'];

  function compareTier(guessTier, targetTier) {
    if (guessTier === targetTier) return 'match';
    const gi = TIER_ORDER.indexOf(guessTier);
    const ti = TIER_ORDER.indexOf(targetTier);
    return ti > gi ? 'higher' : 'lower';
  }

  function firstLetter(name) {
    return name.trim().charAt(0).toUpperCase();
  }

  function wordCount(name) {
    return name.trim().split(/\s+/).length;
  }

  function compareItems(guess, targetItem) {
    const result = {};

    result.category = guess.category === targetItem.category ? 'match' : 'diff';
    result.tier = compareTier(guess.tier, targetItem.tier);
    result.firstLetter = firstLetter(guess.name) === firstLetter(targetItem.name) ? 'match' : 'diff';

    const gw = wordCount(guess.name);
    const tw = wordCount(targetItem.name);
    result.wordCount = gw === tw ? 'match' : tw > gw ? 'higher' : 'lower';

    return result;
  }

  function cellClass(kind) {
    if (kind === 'match') return 'cell match';
    if (kind === 'partial') return 'cell partial';
    if (kind === 'higher' || kind === 'lower') return 'cell arrow';
    return 'cell diff';
  }

  function tierLabel(tier) {
    return tier === 'Legendary' ? 'LEG' : 'T' + tier;
  }

  function cellContent(field, kind, guess) {
    if (field === 'tier') {
      const label = tierLabel(guess.tier);
      if (kind === 'match') return label + ' ✓';
      return label + (kind === 'higher' ? ' ▲' : ' ▼');
    }
    if (field === 'category') return guess.category;
    if (field === 'firstLetter') return firstLetter(guess.name);
    if (field === 'wordCount') {
      const n = wordCount(guess.name);
      const suffix = n === 1 ? ' Wort' : ' Woerter';
      return n + suffix;
    }
    return '';
  }

  function renderRow(guess, cmp) {
    const row = document.createElement('div');
    row.className = 'guess-row';

    const nameCell = document.createElement('div');
    nameCell.className = 'cell name';
    nameCell.textContent = guess.name;
    row.appendChild(nameCell);

    ['category', 'tier', 'firstLetter', 'wordCount'].forEach((field) => {
      const c = document.createElement('div');
      c.className = cellClass(cmp[field]);
      c.textContent = cellContent(field, cmp[field], guess);
      row.appendChild(c);
    });

    el.rows.prepend(row);
  }

  function updateRemaining() {
    const left = MAX_GUESSES - guesses.length;
    el.remaining.textContent = 'Versuche uebrig: ' + left + ' / ' + MAX_GUESSES;
  }

  function endGame(won) {
    finished = true;
    el.input.disabled = true;
    el.form.querySelector('button[type="submit"]').disabled = true;
    el.resultBanner.classList.remove('hidden');
    el.resultBanner.classList.toggle('win', won);
    el.resultBanner.classList.toggle('lose', !won);
    el.resultBanner.textContent = won
      ? '✅ Richtig! Gesucht war: ' + target.name
      : '❌ Verloren. Gesucht war: ' + target.name;
    el.restartBtn.classList.remove('hidden');
  }

  function handleGuess(name) {
    if (finished) return;
    const item = findItemByName(name);
    if (!item) {
      el.error.textContent = 'Item "' + name + '" nicht in der Liste gefunden.';
      return;
    }
    if (guesses.find((g) => g.id === item.id)) {
      el.error.textContent = 'Schon geraten.';
      return;
    }
    el.error.textContent = '';
    guesses.push(item);

    const cmp = compareItems(item, target);
    renderRow(item, cmp);
    updateRemaining();

    if (item.id === target.id) {
      endGame(true);
    } else if (guesses.length >= MAX_GUESSES) {
      endGame(false);
    }
  }

  function populateDatalist() {
    el.datalist.innerHTML = '';
    ITEMS.slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((it) => {
        const opt = document.createElement('option');
        opt.value = it.name;
        el.datalist.appendChild(opt);
      });
  }

  function newRound() {
    target = pickTarget();
    guesses = [];
    finished = false;
    el.rows.innerHTML = '';
    el.error.textContent = '';
    el.resultBanner.classList.add('hidden');
    el.restartBtn.classList.add('hidden');
    el.input.disabled = false;
    el.input.value = '';
    el.form.querySelector('button[type="submit"]').disabled = false;
    updateRemaining();
    el.input.focus();
  }

  el.form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleGuess(el.input.value);
    el.input.value = '';
    el.input.focus();
  });

  el.restartBtn.addEventListener('click', newRound);

  populateDatalist();
  newRound();
})();
