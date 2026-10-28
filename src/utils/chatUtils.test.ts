/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateTitle,
  estimateTokenCount,
  detectLanguage,
  buildSystemPrompt,
  formatMessageTime,
  PRESET_PERSONAS,
  DEFAULT_PERSONA_CONFIG,
  PersonaConfig
} from './chatUtils';

test('generateTitle handles empty and short inputs', () => {
  assert.equal(generateTitle(''), 'New Conversation');
  assert.equal(generateTitle('   '), 'New Conversation');
  assert.equal(generateTitle('Hello Tony AI'), 'Hello Tony AI');
});

test('generateTitle truncates long prompts gracefully', () => {
  const longPrompt = 'Can you help me design an entire solar panel charging circuit with battery management?';
  const title = generateTitle(longPrompt);
  assert.ok(title.length <= 32, `Title length should be <= 32, got ${title.length}`);
  assert.ok(title.includes('Can you help'));
});

test('estimateTokenCount estimates proportional token counts', () => {
  assert.equal(estimateTokenCount(''), 0);
  assert.equal(estimateTokenCount('test'), 1);
  assert.equal(estimateTokenCount('12345678'), 2);
  assert.equal(estimateTokenCount('This is a longer message that should have around 15 tokens or so.'), 17);
});

test('detectLanguage identifies Sheng, Kiswahili, and English', () => {
  assert.equal(detectLanguage('Niaje msee, rada ni gani leo?'), 'sheng');
  assert.equal(detectLanguage('Buda uko fiti ama form ni gani?'), 'sheng');
  assert.equal(detectLanguage('Habari ya asubuhi rafiki yangu?'), 'sw');
  assert.equal(detectLanguage('Tafadhali nisaidie na kazi ya leo'), 'sw');
  assert.equal(detectLanguage('Hello Tony, can you explain quantum computing?'), 'en');
});

test('PRESET_PERSONAS contains valid presets including urban, coach, teacher, dev, and diplomat', () => {
  assert.ok(PRESET_PERSONAS.length >= 5);
  const ids = PRESET_PERSONAS.map(p => p.id);
  assert.ok(ids.includes('tony-urban'));
  assert.ok(ids.includes('tony-coach'));
  assert.ok(ids.includes('tony-teacher'));
  assert.ok(ids.includes('tony-dev'));
  assert.ok(ids.includes('tony-diplomat'));
});

test('buildSystemPrompt supports PersonaConfig objects', () => {
  const customPersona: PersonaConfig = {
    presetId: 'tony-coach',
    name: 'Tony Mwamba',
    avatarStyle: 'amber',
    avatarIcon: 'flame',
    formality: 'casual',
    directness: 'punchy',
    shengLevel: 'heavy',
    customToneNote: 'Keep user motivated for daily fitness goals'
  };

  const prompt = buildSystemPrompt(customPersona);
  assert.ok(prompt.includes('Tony Mwamba'));
  assert.ok(prompt.includes('CASUAL'));
  assert.ok(prompt.includes('PUNCHY'));
  assert.ok(prompt.includes('HEAVY'));
  assert.ok(prompt.includes('fitness goals'));
  assert.ok(prompt.includes('friendly, direct, sharp'));
});

test('buildSystemPrompt preserves legacy string tones', () => {
  const promptDefault = buildSystemPrompt('balanced');
  assert.ok(promptDefault.includes('TONY AI'));
  assert.ok(promptDefault.includes('Kiswahili'));
  assert.ok(promptDefault.includes('Sheng'));

  const promptSheng = buildSystemPrompt('sheng');
  assert.ok(promptSheng.includes('Kenyan Sheng vibe active'));
});

test('buildSystemPrompt injects trained user knowledge and rules', () => {
  const sampleTrainings: any = [
    {
      id: 't1',
      type: 'fact',
      title: 'Company Name',
      prompt: 'My business',
      response: 'NaiBites Fresh Deliveries',
      enabled: true,
      createdAt: 1000,
      updatedAt: 1000
    },
    {
      id: 't2',
      type: 'vocabulary',
      title: 'Slang word',
      prompt: 'ndoko',
      response: 'money / cash',
      enabled: true,
      createdAt: 1000,
      updatedAt: 1000
    },
    {
      id: 't3',
      type: 'qa',
      title: 'Secret passcode',
      prompt: 'What is the secret phrase?',
      response: 'Hakuna Matata 254',
      enabled: false, // disabled should not appear
      createdAt: 1000,
      updatedAt: 1000
    }
  ];

  const prompt = buildSystemPrompt('balanced', sampleTrainings);
  assert.ok(prompt.includes('USER-TRAINED KNOWLEDGE & MEMORY'));
  assert.ok(prompt.includes('NaiBites Fresh Deliveries'));
  assert.ok(prompt.includes('ndoko'));
  assert.ok(!prompt.includes('Hakuna Matata 254'), 'Disabled training should not be included');
});

test('formatMessageTime returns formatted time string', () => {
  const timestamp = new Date('2026-10-27T14:30:00Z').getTime();
  const formatted = formatMessageTime(timestamp);
  assert.ok(typeof formatted === 'string' && formatted.length > 0);
});
