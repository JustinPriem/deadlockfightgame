// Item-Wordle: Rate-Logik + DOM-Rendering. Bewusst ohne Phaser/Canvas -
// ein Texteingabe-Raetsel ist mit normalem HTML/CSS einfacher und
// zugaenglicher umzusetzen als in einem Spiel-Canvas.
(function () {
  const MAX_GUESSES = 8;

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

  function compareItems(guess, targetItem) {
    const result = {};

    result.category = guess.category === targetItem.category ? 'match' : 'diff';

    if (guess.tier === targetItem.tier) {
      result.tier = 'match';
    } else {
      result.tier = targetItem.tier > guess.tier ? 'higher' : 'lower';
    }

    result.activeOrPassive = guess.activeOrPassive === targetItem.activeOrPassive ? 'match' : 'diff';

    const guessTags = new Set(guess.tags);
    const targetTags = new Set(targetItem.tags);
    const overlap = [...guessTags].filter((t) => targetTags.has(t));
    const sameSize = guessTags.size === targetTags.size;
    if (overlap.length > 0 && overlap.length === guessTags.size && sameSize) {
      result.tags = 'match';
    } else if (overlap.length > 0) {
      result.tags = 'partial';
    } else {
      result.tags = 'diff';
    }

    return result;
  }

  function cellClass(kind) {
    if (kind === 'match') return 'cell match';
    if (kind === 'partial') return 'cell partial';
    if (kind === 'higher' || kind === 'lower') return 'cell arrow';
    return 'cell diff';
  }

  function cellContent(field, kind, guess) {
    if (field === 'tier') {
      if (kind === 'match') return 'T' + guess.tier + ' ✓';
      return 'T' + guess.tier + (kind === 'higher' ? ' ▲' : ' ▼');
    }
    if (field === 'category') return guess.category;
    if (field === 'activeOrPassive') return guess.activeOrPassive;
    if (field === 'tags') return guess.tags.join(', ');
    return '';
  }

  function renderRow(guess, cmp) {
    const row = document.createElement('div');
    row.className = 'guess-row';

    const nameCell = document.createElement('div');
    nameCell.className = 'cell name';
    nameCell.textContent = guess.name;
    row.appendChild(nameCell);

    ['category', 'tier', 'activeOrPassive', 'tags'].forEach((field) => {
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
