'use strict';

const QUESTIONS = [
  {
    id: 'Q1',
    skill: 'grammar',
    text: 'Choose the correct sentence. (Выберите грамматически правильное предложение.)',
    passage: 'Anna ___ to work by train, but today she ___ by bus.',
    options: [
      { text: 'go / is going', points: 1 },
      { text: 'goes / is going', points: 4 },
      { text: 'is going / goes', points: 2 },
      { text: 'goes / go', points: 0 }
    ]
  },
  {
    id: 'Q2',
    skill: 'lexis',
    text: 'What does the word “gloomy” mean in this sentence? (Какое значение имеет слово «gloomy»?)',
    passage: '“The weather forecast was rather gloomy, so we decided to stay at home.”',
    options: [
      { text: 'bright and cheerful', points: 0 },
      { text: 'cold and windy', points: 1 },
      { text: 'dark and depressing', points: 3 },
      { text: 'short and unclear', points: 0 }
    ]
  },
  {
    id: 'Q3',
    skill: 'reading',
    text: 'Why did Tom get up so early this morning? (Почему Том встал сегодня так рано?)',
    passage: 'Tom usually gets up at seven o’clock, but this morning he got up at five because he had to catch an early train to Bristol. He left home without breakfast and reached the station with only two minutes to spare.',
    options: [
      { text: 'He wanted to go for a morning run.', points: 1 },
      { text: 'He had to catch an early train.', points: 5 },
      { text: 'His alarm clock did not work.', points: 2 },
      { text: 'He was staying at a hotel nearby.', points: 0 }
    ]
  },
  {
    id: 'Q4',
    skill: 'grammar',
    text: 'Choose the correct option. (Выберите правильный предлог.)',
    passage: 'I have lived in London ___ 2019.',
    options: [
      { text: 'since', points: 3 },
      { text: 'from', points: 1 },
      { text: 'for', points: 1 },
      { text: 'in', points: 0 }
    ]
  },
  {
    id: 'Q5',
    skill: 'grammar',
    text: 'Choose the correct sentence. (Past Perfect или Past Simple?)',
    passage: 'By the time we ___ at the cinema, the film ___.',
    options: [
      { text: 'arrived / already started', points: 2 },
      { text: 'had arrived / had already started', points: 0 },
      { text: 'arrived / had already started', points: 5 },
      { text: 'arrived / was already starting', points: 1 }
    ]
  },
  {
    id: 'Q6',
    skill: 'lexis',
    text: 'Choose the correct phrasal verb. (Выберите подходящий фразовый глагол.)',
    passage: 'My computer ___ yesterday, and I lost all my unsaved work.',
    options: [
      { text: 'broke down', points: 3 },
      { text: 'broke up', points: 1 },
      { text: 'broke out', points: 0 },
      { text: 'broke in', points: 0 }
    ]
  },
  {
    id: 'Q7',
    skill: 'reading',
    text: 'What can we conclude from the text? (Что можно заключить из текста?)',
    passage: 'Although the new library opened only six months ago, it has already become the most popular place in town. Its café stays busy until the evening, and the weekend writing workshops are always fully booked. The council now plans to build two more libraries in the district.',
    options: [
      { text: 'The town does not have enough books for its residents.', points: 1 },
      { text: 'The new library has exceeded the council’s expectations.', points: 5 },
      { text: 'The council wants to close the old libraries.', points: 0 },
      { text: 'Most residents prefer reading at home.', points: 0 }
    ]
  },
  {
    id: 'Q8',
    skill: 'self',
    text: 'How freely can you speak English about everyday topics? (Насколько свободно вы говорите по-английски на бытовые темы?)',
    passage: '',
    options: [
      { text: 'I know a few words and the alphabet.', points: 0 },
      { text: 'I can read simple texts with a dictionary.', points: 1 },
      { text: 'I can hold a simple conversation on familiar topics.', points: 1 },
      { text: 'I can speak freely on most topics and discuss news or work.', points: 2 }
    ]
  }
];

const GROUPS = {
  beginner: {
    title: 'Старт: с нуля',
    description: 'Группа для начинающих: алфавит, базовая лексика и простые предложения.',
    bullets: [
      'Алфавит, произношение и базовый словарный запас',
      'Простые предложения и время Present Simple',
      'Короткие диалоги на бытовые темы'
    ]
  },
  intermediate: {
    title: 'Интерактив: уверенный средний',
    description: 'Свободное чтение, разговорные темы и подтягивание грамматики до уверенного уровня.',
    bullets: [
      'Разговорные темы: путешествия, работа, хобби',
      'Времена глагола и типичные грамматические ошибки',
      'Тексты средней сложности почти без словаря'
    ]
  },
  advanced: {
    title: 'Продвинутая / подготовительная',
    description: 'Подготовка к экзаменам, деловой язык и тонкие случаи грамматики.',
    bullets: [
      'Подготовка к экзаменам (IELTS, ОГЭ, ЕГЭ)',
      'Деловая переписка и переговоры',
      'Тонкие случаи грамматики и идиоматика'
    ]
  }
};

if (typeof module === 'object' && module.exports) {
  module.exports = { QUESTIONS: QUESTIONS, GROUPS: GROUPS };
}
