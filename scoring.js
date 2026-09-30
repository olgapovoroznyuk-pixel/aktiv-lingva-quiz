'use strict';

const SCORE_MAX = 30;
const LEVEL_RULES = [
  { key: 'beginner', title: 'Начальный', max: 11 },
  { key: 'intermediate', title: 'Средний', max: 22 },
  { key: 'advanced', title: 'Продвинутый', max: SCORE_MAX }
];
const BLOCK_LABELS = {
  grammar: 'Грамматика',
  lexis: 'Лексика',
  reading: 'Чтение',
  self: 'Самооценка'
};
const DIAGNOSTIC_BLOCKS = ['grammar', 'lexis', 'reading'];
const WEAK_RATIO = 0.5;
const DISCLAIMER = 'Уровень примерный и не является сертификацией. Точный уровень определит преподаватель на бесплатном вводном уроке.';

function pickQuestions(questions) {
  if (questions && questions.length) {
    return questions;
  }
  if (typeof QUESTIONS !== 'undefined' && QUESTIONS && QUESTIONS.length) {
    return QUESTIONS;
  }
  return [];
}

function pickGroups(groups) {
  if (groups && typeof groups === 'object') {
    return groups;
  }
  if (typeof GROUPS !== 'undefined' && GROUPS && typeof GROUPS === 'object') {
    return GROUPS;
  }
  return {};
}

function questionMax(question) {
  let max = 0;
  question.options.forEach(function (option) {
    if (typeof option.points === 'number' && option.points > max) {
      max = option.points;
    }
  });
  return max;
}

function optionPoints(question, answerIndex) {
  if (typeof answerIndex !== 'number' || answerIndex < 0 || answerIndex >= question.options.length) {
    return 0;
  }
  const points = question.options[answerIndex].points;
  return typeof points === 'number' ? points : 0;
}

function resolveLevel(score) {
  for (let i = 0; i < LEVEL_RULES.length; i++) {
    if (score <= LEVEL_RULES[i].max) {
      return LEVEL_RULES[i];
    }
  }
  return LEVEL_RULES[LEVEL_RULES.length - 1];
}

function computeResult(answers, questions, groups) {
  const qs = pickQuestions(questions);
  const gs = pickGroups(groups);
  const given = answers && typeof answers === 'object' ? answers : {};
  const bySkill = {};
  let score = 0;
  let maxScore = 0;

  qs.forEach(function (question) {
    const points = optionPoints(question, given[question.id]);
    const block = questionMax(question);
    score += points;
    maxScore += block;
    if (!bySkill[question.skill]) {
      bySkill[question.skill] = {
        label: BLOCK_LABELS[question.skill] || question.skill,
        score: 0,
        max: 0
      };
    }
    bySkill[question.skill].score += points;
    bySkill[question.skill].max += block;
  });

  const safeMax = maxScore > 0 ? maxScore : SCORE_MAX;
  const levelRule = resolveLevel(score);
  const percent = Math.round((score / safeMax) * 100);
  const groupSource = gs[levelRule.key] || { title: '', description: '', bullets: [] };
  const weakBlocks = DIAGNOSTIC_BLOCKS.filter(function (key) {
    const block = bySkill[key];
    return Boolean(block && block.max > 0 && block.score <= block.max * WEAK_RATIO);
  }).map(function (key) {
    const label = bySkill[key].label;
    return {
      key: key,
      label: label,
      message: 'Рекомендуется дополнительная диагностика по блоку «' + label + '».'
    };
  });

  return {
    level: levelRule.key,
    levelTitle: levelRule.title,
    score: score,
    maxScore: safeMax,
    percent: percent,
    group: {
      title: groupSource.title || '',
      description: groupSource.description || '',
      bullets: Array.isArray(groupSource.bullets) ? groupSource.bullets.slice() : []
    },
    bySkill: bySkill,
    weakBlocks: weakBlocks,
    disclaimer: DISCLAIMER
  };
}

if (typeof module === 'object' && module.exports) {
  module.exports = {
    computeResult: computeResult,
    resolveLevel: resolveLevel,
    SCORE_MAX: SCORE_MAX,
    LEVEL_RULES: LEVEL_RULES,
    BLOCK_LABELS: BLOCK_LABELS,
    DISCLAIMER: DISCLAIMER
  };
}
