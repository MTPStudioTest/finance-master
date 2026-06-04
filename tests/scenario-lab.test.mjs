import assert from 'node:assert/strict';
import test from 'node:test';
import { buildScenarioLab } from '../src/finance/scenario-lab.js';
import { buildPressureTimeline } from '../src/finance/pressure-timeline.js';

test('scenario lab computes adjusted core metrics from canonical inputs', () => {
  const lab = buildScenarioLab({
    treasury: {
      safeToSpend: 500,
      availableCash: 2000,
      totalMonthlyBurn: 1000,
      debtMonthlyPressure: 300,
      reserveGap: 800,
      protectedCash: 400,
    },
    savedScenarios: [{
      id: 'save-debt',
      name: 'Cut debt pressure',
      type: 'reduce_debt_pressure',
      amount: 100,
      createdAt: '2026-06-04T10:00:00.000Z',
      updatedAt: '2026-06-04T10:00:00.000Z',
    }],
    nowIso: '2026-06-04T10:00:00.000Z',
  });
  const saved = lab.comparable.find((scenario) => scenario.id === 'save-debt');
  assert.equal(saved.adjusted.debtPressure, 200);
  assert.equal(saved.adjusted.monthlyBurn, 900);
  assert.equal(saved.adjusted.safeToSpend, 600);
  assert.equal(saved.adjusted.runway, 2.22);
});

test('scenario comparison ranks highest runway and safety impact first', () => {
  const lab = buildScenarioLab({
    treasury: {
      safeToSpend: -100,
      availableCash: 1000,
      totalMonthlyBurn: 1000,
      debtMonthlyPressure: 100,
      reserveGap: 500,
    },
    savedScenarios: [
      { id: 'small', name: 'Small cut', type: 'reduce_flexible_costs', amount: 50, createdAt: '2026-06-04T10:00:00.000Z', updatedAt: '2026-06-04T10:00:00.000Z' },
      { id: 'income', name: 'Book retainer', type: 'add_recurring_income', amount: 3000, createdAt: '2026-06-04T10:00:00.000Z', updatedAt: '2026-06-04T10:00:00.000Z' },
    ],
    nowIso: '2026-06-04T10:00:00.000Z',
  });
  assert.equal(lab.topScenario.id, 'income');
  assert.equal(lab.topScenario.delta.availableCash, 3000);
  assert.equal(lab.topScenario.delta.runway, 3);
});

test('pressure timeline includes recurring, debt, future starts, income, obligations, and reserve windows', () => {
  const timeline = buildPressureTimeline({
    readModel: {
      recurringExpenses: [{ id: 'rent', category: 'Rent', monthlyAmount: 1000, dueDay: 8 }],
      debtAccounts: [
        { id: 'debt-start', name: 'Future debt', planStatus: 'starts_later', startDate: '2026-06-20', paymentAmount: 250, outstanding: 1000 },
      ],
      pipelineDeals: [{ id: 'income', title: 'Launch income', value: 3000, probability: 0.9, status: 'confirmed', expectedDateISO: '2026-06-18' }],
      reserveBuckets: [{ id: 'tax', name: 'Tax reserve', targetAmount: 1000, currentAmount: 400, active: true }],
    },
    treasury: {
      obligations: [{ id: 'studio-2026-06', sourceId: 'studio', type: 'recurring_cost', title: 'Studio', amount: 300, dueDate: '2026-06-10', status: 'due_soon' }],
    },
    nowIso: '2026-06-04T10:00:00.000Z',
  });
  const monthKinds = timeline['30d'].map((item) => item.kind);
  assert.ok(monthKinds.includes('Recurring cost'));
  assert.ok(monthKinds.includes('Debt starts'));
  assert.ok(monthKinds.includes('Expected income'));
  assert.ok(monthKinds.includes('Reserve gap'));
  assert.ok(timeline['7d'].some((item) => item.label === 'Rent' || item.label === 'Studio'));
  assert.ok(timeline['90d'].length >= timeline['30d'].length);
});
