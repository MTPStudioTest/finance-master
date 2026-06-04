import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDecisionEngine } from '../src/finance/decision-engine.js';

const nowIso = '2026-06-04T10:00:00.000Z';

function baseInput(overrides = {}) {
  return {
    nowIso,
    readModel: {
      pipelineDeals: [],
      reserveBuckets: [],
      debtAccounts: [],
      recurringExpenses: [],
      obligations: [],
      transactions: [],
      ...(overrides.readModel || {}),
    },
    snapshot: {
      realBalance: 5000,
      availableCash: 4000,
      safeToSpend: 3000,
      monthlyBurn: 1000,
      runwayMonths: 4,
      ...(overrides.snapshot || {}),
    },
    treasury: {
      actualCash: 5000,
      availableCash: 4000,
      safeToSpend: 3000,
      totalMonthlyBurn: 1000,
      runwayMonths: 4,
      confirmedShortTermObligations: 500,
      minimumBuffer: 250,
      ...(overrides.treasury || {}),
    },
    forecast: {
      byHorizon: {
        '30': { components: { expectedIncome: 1200 } },
      },
      warnings: [],
      ...(overrides.forecast || {}),
    },
    reviewState: { lastReviewedAt: '2026-06-01T10:00:00.000Z', ...(overrides.reviewState || {}) },
    settings: { riskTolerance: 'balanced', ...(overrides.settings || {}) },
  };
}

function cardIds(result) {
  return result.decisionCards.map((card) => card.id);
}

test('decision engine marks runway below one month as critical', () => {
  const result = buildDecisionEngine(baseInput({
    snapshot: { runwayMonths: 0.7 },
    treasury: { runwayMonths: 0.7 },
  }));

  assert.equal(result.status.label, 'Critical');
  assert(cardIds(result).includes('low-runway-critical'));
  assert.equal(result.weeklyFocus.length <= 3, true);
});

test('decision engine detects safe-to-spend and runway mismatch', () => {
  const result = buildDecisionEngine(baseInput({
    snapshot: { safeToSpend: 900, runwayMonths: 1.6 },
    treasury: { safeToSpend: 900, runwayMonths: 1.6 },
  }));

  assert.equal(result.status.key, 'fragile');
  assert(cardIds(result).includes('safe-spend-runway-mismatch'));
});

test('decision engine flags future, paused, irregular, and missing debt pressure states', () => {
  const result = buildDecisionEngine(baseInput({
    readModel: {
      debtAccounts: [
        { id: 'future', name: 'Future plan', outstanding: 1200, planStatus: 'starts_later', startDate: '2026-06-20', paymentAmount: 300, paymentFrequency: 'monthly' },
        { id: 'paused', name: 'Paused plan', outstanding: 900, planStatus: 'on_hold', minimumPaymentMonthly: 120 },
        { id: 'irregular', name: 'Irregular plan', outstanding: 700, planStatus: 'irregular' },
        { id: 'missing', name: 'Missing plan', outstanding: 600, planStatus: 'missing' },
      ],
    },
  }));

  assert(cardIds(result).some((id) => id.startsWith('debt-starts-future')));
  assert(cardIds(result).some((id) => id.startsWith('debt-on-hold-paused')));
  assert(cardIds(result).some((id) => id.startsWith('debt-irregular-irregular')));
  assert(cardIds(result).some((id) => id.startsWith('debt-missing-plan-missing')));
  assert.equal(result.pressureTimeline['30d'].some((item) => item.kind === 'Debt starts'), true);
});

test('decision engine warns when tax reserve is missing or underfunded for business income', () => {
  const result = buildDecisionEngine(baseInput({
    readModel: {
      pipelineDeals: [{ id: 'biz-income', title: 'Client project', value: 3000, status: 'confirmed', probability: 0.9, expectedDateISO: '2026-06-15', scope: 'business' }],
      reserveBuckets: [{ id: 'vat', name: 'VAT reserve', currentAmount: 100, targetAmount: 1000, active: true }],
    },
  }));

  assert(cardIds(result).includes('tax-reserve-underfunded'));
  assert.equal(result.warnings.some((card) => card.affectedMetric === 'Protected cash'), true);
});

test('decision engine flags overloaded 30-day obligations', () => {
  const result = buildDecisionEngine(baseInput({
    snapshot: { safeToSpend: 800 },
    treasury: { safeToSpend: 800, confirmedShortTermObligations: 1500 },
  }));

  assert(cardIds(result).includes('overloaded-month'));
  assert.equal(result.weeklyFocus[0].sourceCardId, 'overloaded-month');
});

test('decision engine flags positive cash with weak monthly structure', () => {
  const result = buildDecisionEngine(baseInput({
    snapshot: { realBalance: 7000, monthlyBurn: 2600, runwayMonths: 3 },
    treasury: { actualCash: 7000, totalMonthlyBurn: 2600, runwayMonths: 3 },
    forecast: { byHorizon: { '30': { components: { expectedIncome: 900 } } } },
  }));

  assert(cardIds(result).includes('positive-cash-negative-structure'));
});

test('decision engine ranks opportunity impact by runway and keeps scenario shortcuts display-only', () => {
  const result = buildDecisionEngine(baseInput({
    readModel: {
      pipelineDeals: [
        { id: 'retainer', title: 'Design retainer', value: 4500, status: 'proposal', probability: 0.7, expectedDateISO: '2026-06-25', scope: 'business' },
      ],
    },
    treasury: { totalMonthlyBurn: 1500, runwayMonths: 5, safeToSpend: 3000 },
    snapshot: { monthlyBurn: 1500, runwayMonths: 5, safeToSpend: 3000 },
  }));

  assert.equal(result.opportunities.length, 1);
  assert.equal(result.opportunities[0].metricImpact, '+2.1 months runway');
  assert.equal(result.scenarioShortcuts.every((shortcut) => shortcut.mode === 'display_only'), true);
});
