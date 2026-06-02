function offsetIso(days: number, hour = 12): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function dateOnly(days: number): string {
  return offsetIso(days).slice(0, 10);
}

export function createDemoDrafts(currency: string): FinanceEventDraft[] {
  const at = (days: number) => offsetIso(days);
  return [
    {
      type: 'asset.account_set',
      amount: 10400,
      currency,
      timestamp: at(-28),
      related_entity_id: 'cash-operating',
      metadata: { name: 'Operating cash', balance: 10400, active: true, scope: 'business', bucket: 'available' },
    },
    {
      type: 'asset.account_set',
      amount: 6200,
      currency,
      timestamp: at(-27),
      related_entity_id: 'reserve-tax',
      metadata: { name: 'Tax reserve', balance: 6200, active: true, scope: 'business', bucket: 'tax_reserve', reserved: true },
    },
    {
      type: 'asset.account_set',
      amount: 2800,
      currency,
      timestamp: at(-26),
      related_entity_id: 'reserve-vat',
      metadata: { name: 'VAT reserve', balance: 2800, active: true, scope: 'business', bucket: 'vat_reserve', reserved: true },
    },
    {
      type: 'asset.account_set',
      amount: 1800,
      currency,
      timestamp: at(-25),
      related_entity_id: 'reserve-health',
      metadata: { name: 'Health insurance reserve', balance: 1800, active: true, scope: 'personal', bucket: 'health_insurance', reserved: true },
    },
    {
      type: 'asset.account_set',
      amount: 3000,
      currency,
      timestamp: at(-24),
      related_entity_id: 'reserve-buffer',
      metadata: { name: 'Studio buffer', balance: 3000, active: true, scope: 'shared', bucket: 'buffer', reserved: true },
    },
    ...[
      ['Housing', 1450, true],
      ['Studio & tools', 420, true],
      ['Living', 1120, true],
      ['Subscriptions', 260, false],
      ['Flexible buffer', 450, false],
    ].map(([category, monthlyAmount, essential], index) => ({
      type: 'expense.recurring_set',
      amount: Number(monthlyAmount),
      currency,
      timestamp: at(-16 + index),
      related_entity_id: `expense-${index + 1}`,
      metadata: { category, monthlyAmount, essential, active: true, dueDay: 1 + (index * 4), frequency: 'monthly', scope: index < 2 ? 'business' : 'personal' },
    })),
    {
      type: 'debt.added',
      amount: 6400,
      currency,
      timestamp: at(-90),
      related_entity_id: 'debt-credit-line',
      metadata: { name: 'Credit line', scope: 'business' },
    },
    {
      type: 'debt.payment_made',
      amount: 1000,
      currency,
      timestamp: at(-15),
      related_entity_id: 'debt-credit-line',
      metadata: { name: 'Credit line', scope: 'business' },
    },
    ...[
      ['Editorial system', 2600, -72],
      ['Advisory sprint', 1750, -39],
      ['Research direction', 3200, -13],
    ].flatMap(([client, amount, days], index) => {
      const id = `settled-${index + 1}`;
      const timestamp = at(Number(days));
      return [
        {
          type: 'invoice.paid',
          amount: Number(amount),
          currency,
          timestamp,
          related_entity_id: id,
          metadata: { client, amount, expectedDate: dateOnly(Number(days)), destinationAccountId: 'cash-operating', scope: 'business' },
        },
        {
          type: 'income.received',
          amount: Number(amount),
          currency,
          timestamp,
          related_entity_id: id,
          metadata: { description: `Invoice paid: ${client}`, invoiceId: id, accountId: 'cash-operating', accountName: 'Operating Cash', categoryId: 'client-income', scope: 'business', source: 'demo' },
        },
      ];
    }),
    ...[
      ['Product strategy retainer', 4200, 0.9, 18, 'confirmed'],
      ['Design systems advisory', 2900, 0.65, 37, 'expected'],
      ['Research collaboration', 5600, 0.35, 64, 'risky'],
    ].map(([title, amount, probability, days, status], index) => ({
      type: 'pipeline.created',
      amount: Number(amount),
      currency,
      timestamp: at(-6 + index),
      related_entity_id: `pipeline-${index + 1}`,
      metadata: {
        title,
        value: amount,
        probability,
        status,
        stage: status,
        expectedDateISO: dateOnly(Number(days)),
        destinationAccountId: 'cash-operating',
        destinationAccountName: 'Operating Cash',
        scope: 'business',
      },
    })),
    {
      type: 'expense.recorded',
      amount: 180,
      currency,
      timestamp: at(-5),
      related_entity_id: 'transaction-research-tools',
      metadata: { description: 'Research tools', accountId: 'cash-operating', accountName: 'Operating Cash', categoryId: 'tools', scope: 'business', source: 'demo' },
    },
  ];
}
