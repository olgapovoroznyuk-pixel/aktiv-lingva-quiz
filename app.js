'use strict';

const STORAGE_KEY = 'al_quiz_draft_v1';
const OPTION_KEYS = ['1', '2', '3', '4'];
const LABEL_NEXT = 'Далее';
const LABEL_FINISH = 'Узнать результат';
const COPY_HEADER = 'Актив Лингва — тест уровня английского';
const COPY_GROUP_PREFIX = 'Рекомендуемая группа: ';
const COPY_SKILLS_PREFIX = 'Баллы по блокам: ';
const COPY_BULLETS_TITLE = 'Что проходит группа:';
const STATUS_COPIED = 'Результат скопирован в буфер обмена';
const STATUS_COPY_FALLBACK = 'Скопировано через запасной способ. Текст также выделен — можно нажать Ctrl+C.';
const STATUS_COPY_FAIL = 'Не удалось скопировать автоматически. Текст выделен — нажмите Ctrl+C.';

let state = { screen: 'start', index: 0, answers: {} };
let draft = null;
let lastResult = null;
let els = {};

function cacheElements() {
  els.screens = {
    start: document.getElementById('screen-start'),
    quiz: document.getElementById('screen-quiz'),
    result: document.getElementById('screen-result')
  };
  els.btnStart = document.getElementById('btn-start');
  els.btnContinue = document.getElementById('btn-continue');
  els.btnBack = document.getElementById('btn-back');
  els.btnNext = document.getElementById('btn-next');
  els.btnCopy = document.getElementById('btn-copy');
  els.btnRestart = document.getElementById('btn-restart');
  els.progress = document.getElementById('progress');
  els.progressFill = document.getElementById('progress-fill');
  els.progressLabel = document.getElementById('progress-label');
  els.questionBox = document.getElementById('question-box');
  els.passage = document.getElementById('question-passage');
  els.questionText = document.getElementById('question-text');
  els.options = document.getElementById('options');
  els.levelTitle = document.getElementById('level-title');
  els.levelPercent = document.getElementById('level-percent');
  els.levelScore = document.getElementById('level-score');
  els.groupTitle = document.getElementById('group-title');
  els.groupDesc = document.getElementById('group-desc');
  els.groupList = document.getElementById('group-list');
  els.skillBars = document.getElementById('skill-bars');
  els.weakWarnings = document.getElementById('weak-warnings');
  els.disclaimer = document.getElementById('disclaimer');
  els.copyStatus = document.getElementById('copy-status');
  els.resultCard = document.getElementById('result-card');
}

function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (err) {
    return null;
  }
}

function safeRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    return null;
  }
}

function loadDraft() {
  const raw = safeGet(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.a || typeof parsed.a !== 'object') {
      return null;
    }
    const index = typeof parsed.i === 'number' && parsed.i >= 0 ? Math.floor(parsed.i) : 0;
    const answers = {};
    Object.keys(parsed.a).forEach(function (id) {
      const value = parsed.a[id];
      if (typeof value === 'number' && value >= 0 && value < 4) {
        answers[id] = value;
      }
    });
    return { index: index, answers: answers };
  } catch (err) {
    return null;
  }
}

function saveDraft() {
  safeSet(STORAGE_KEY, JSON.stringify({ i: state.index, a: state.answers }));
}

function clearDraft() {
  safeRemove(STORAGE_KEY);
}

function hasProgress(value) {
  return Boolean(value && (value.index > 0 || Object.keys(value.answers).length > 0));
}

function restoreDraft() {
  draft = loadDraft();
  if (!hasProgress(draft) || draft.index >= QUESTIONS.length) {
    draft = null;
    safeRemove(STORAGE_KEY);
    return;
  }
  els.btnContinue.hidden = false;
}

function showScreen(name) {
  state.screen = name;
  Object.keys(els.screens).forEach(function (key) {
    els.screens[key].classList.toggle('screen--active', key === name);
  });
  window.scrollTo(0, 0);
}

function startFresh() {
  clearDraft();
  draft = null;
  els.btnContinue.hidden = true;
  state.index = 0;
  state.answers = {};
  showScreen('quiz');
  renderQuestion();
}

function continueDraft() {
  if (!draft) {
    startFresh();
    return;
  }
  state.index = Math.min(draft.index, QUESTIONS.length - 1);
  state.answers = draft.answers;
  showScreen('quiz');
  renderQuestion();
}

function renderQuestion() {
  const question = QUESTIONS[state.index];
  const total = QUESTIONS.length;
  const selected = state.answers[question.id];
  const hasAnswer = typeof selected === 'number';

  els.progressLabel.textContent = 'Вопрос ' + (state.index + 1) + ' из ' + total;
  els.progressFill.style.width = ((state.index + 1) / total) * 100 + '%';
  els.progress.setAttribute('aria-valuemax', String(total));
  els.progress.setAttribute('aria-valuenow', String(state.index + 1));

  if (question.passage) {
    els.passage.textContent = question.passage;
    els.passage.hidden = false;
  } else {
    els.passage.textContent = '';
    els.passage.hidden = true;
  }

  els.questionText.textContent = question.text;
  els.options.innerHTML = '';

  question.options.forEach(function (option, index) {
    const label = document.createElement('label');
    label.className = 'option' + (hasAnswer && selected === index ? ' option--selected' : '');

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = String(index);
    if (hasAnswer && selected === index) {
      input.checked = true;
    }

    const key = document.createElement('span');
    key.className = 'option__key';
    key.textContent = OPTION_KEYS[index] || String(index + 1);

    const text = document.createElement('span');
    text.className = 'option__text';
    text.textContent = option.text;

    label.appendChild(input);
    label.appendChild(key);
    label.appendChild(text);
    input.addEventListener('change', function () {
      selectOption(index);
    });
    els.options.appendChild(label);
  });

  els.btnBack.hidden = state.index === 0;
  els.btnNext.disabled = !hasAnswer;
  els.btnNext.textContent = state.index === total - 1 ? LABEL_FINISH : LABEL_NEXT;

  els.questionBox.classList.remove('q-anim');
  void els.questionBox.offsetWidth;
  els.questionBox.classList.add('q-anim');
}

function selectOption(index) {
  const question = QUESTIONS[state.index];
  if (index < 0 || index >= question.options.length) {
    return;
  }
  state.answers[question.id] = index;
  const labels = els.options.querySelectorAll('.option');
  labels.forEach(function (label, i) {
    const input = label.querySelector('input');
    const active = i === index;
    label.classList.toggle('option--selected', active);
    if (input) {
      input.checked = active;
    }
  });
  els.btnNext.disabled = false;
  saveDraft();
}

function goNext() {
  const question = QUESTIONS[state.index];
  if (typeof state.answers[question.id] !== 'number') {
    return;
  }
  if (state.index >= QUESTIONS.length - 1) {
    finishQuiz();
    return;
  }
  state.index += 1;
  saveDraft();
  renderQuestion();
}

function goBack() {
  if (state.index === 0) {
    return;
  }
  state.index -= 1;
  saveDraft();
  renderQuestion();
}

function finishQuiz() {
  lastResult = computeResult(state.answers);
  clearDraft();
  renderResult(lastResult);
  showScreen('result');
}

function renderResult(result) {
  els.levelTitle.textContent = result.levelTitle;
  els.levelPercent.textContent = result.percent + '%';
  els.levelScore.textContent = 'Набрано ' + result.score + ' из ' + result.maxScore + ' баллов';
  els.groupTitle.textContent = result.group.title;
  els.groupDesc.textContent = result.group.description;

  els.groupList.innerHTML = '';
  result.group.bullets.forEach(function (bullet) {
    const item = document.createElement('li');
    item.textContent = bullet;
    els.groupList.appendChild(item);
  });

  els.skillBars.innerHTML = '';
  Object.keys(result.bySkill).forEach(function (key) {
    const block = result.bySkill[key];
    const percent = block.max > 0 ? Math.round((block.score / block.max) * 100) : 0;
    const wrap = document.createElement('div');
    wrap.className = 'bar';

    const head = document.createElement('div');
    head.className = 'bar__head';
    const label = document.createElement('span');
    label.textContent = block.label;
    const value = document.createElement('span');
    value.className = 'bar__value';
    value.textContent = block.score + ' / ' + block.max;
    head.appendChild(label);
    head.appendChild(value);

    const track = document.createElement('div');
    track.className = 'bar__track';
    const fill = document.createElement('div');
    fill.className = 'bar__fill';
    track.appendChild(fill);

    wrap.appendChild(head);
    wrap.appendChild(track);
    els.skillBars.appendChild(wrap);
    requestAnimationFrame(function () {
      fill.style.width = percent + '%';
    });
  });

  els.weakWarnings.innerHTML = '';
  if (result.weakBlocks.length > 0) {
    result.weakBlocks.forEach(function (block) {
      const warning = document.createElement('p');
      warning.className = 'warning';
      warning.textContent = block.message;
      els.weakWarnings.appendChild(warning);
    });
    els.weakWarnings.hidden = false;
  } else {
    els.weakWarnings.hidden = true;
  }

  els.disclaimer.textContent = result.disclaimer;
  els.copyStatus.textContent = '';
}

function buildCopyText(result) {
  const lines = [];
  lines.push(COPY_HEADER);
  lines.push('Уровень: ' + result.levelTitle + ' (' + result.score + '/' + result.maxScore + ', ' + result.percent + '%)');
  lines.push(COPY_GROUP_PREFIX + result.group.title);
  lines.push('');
  lines.push(COPY_BULLETS_TITLE);
  result.group.bullets.forEach(function (bullet) {
    lines.push('— ' + bullet);
  });
  lines.push('');
  const parts = Object.keys(result.bySkill).map(function (key) {
    const block = result.bySkill[key];
    return block.label + ' ' + block.score + '/' + block.max;
  });
  lines.push(COPY_SKILLS_PREFIX + parts.join('; ') + '.');
  lines.push('');
  result.weakBlocks.forEach(function (block) {
    lines.push(block.message);
  });
  lines.push(result.disclaimer);
  return lines.join('\n');
}

function fallbackCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.left = '0';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (err) {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

function selectResultText() {
  try {
    const range = document.createRange();
    range.selectNodeContents(els.resultCard);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (err) {
    return null;
  }
  return window.getSelection().toString();
}

function copyText(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    return navigator.clipboard.writeText(text).then(function () {
      return 'clipboard';
    }).catch(function () {
      return fallbackCopy(text) ? 'fallback' : Promise.reject(new Error('copy failed'));
    });
  }
  return Promise.resolve(fallbackCopy(text) ? 'fallback' : Promise.reject(new Error('copy failed')));
}

function handleCopy() {
  if (!lastResult) {
    return;
  }
  const text = buildCopyText(lastResult);
  copyText(text).then(function (mode) {
    els.copyStatus.textContent = mode === 'clipboard' ? STATUS_COPIED : STATUS_COPY_FALLBACK;
  }).catch(function () {
    selectResultText();
    els.copyStatus.textContent = STATUS_COPY_FAIL;
  });
}

function restart() {
  clearDraft();
  draft = null;
  lastResult = null;
  state.index = 0;
  state.answers = {};
  els.btnContinue.hidden = true;
  els.copyStatus.textContent = '';
  showScreen('start');
}

function onKeydown(event) {
  if (state.screen !== 'quiz') {
    return;
  }
  if (/^[1-4]$/.test(event.key)) {
    event.preventDefault();
    selectOption(Number(event.key) - 1);
    return;
  }
  if (event.key === 'Enter') {
    const active = document.activeElement;
    if (active && active.tagName === 'BUTTON') {
      return;
    }
    event.preventDefault();
    if (!els.btnNext.disabled) {
      goNext();
    }
    return;
  }
  if (event.key === 'Backspace') {
    event.preventDefault();
    goBack();
  }
}

function bindEvents() {
  els.btnStart.addEventListener('click', startFresh);
  els.btnContinue.addEventListener('click', continueDraft);
  els.btnBack.addEventListener('click', goBack);
  els.btnNext.addEventListener('click', goNext);
  els.btnCopy.addEventListener('click', handleCopy);
  els.btnRestart.addEventListener('click', restart);
  document.addEventListener('keydown', onKeydown);
}

function init() {
  cacheElements();
  bindEvents();
  restoreDraft();
  showScreen('start');
}

init();
