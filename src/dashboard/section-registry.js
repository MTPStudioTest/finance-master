export function createSectionRenderer(renderers, renderSectionHeading) {
    const pages = {
        ledger: {
            title: 'Cash Movement',
            copy: 'Clean daily movement, focused review work, and transaction evidence when you need it.',
            sections: ['ledger']
        },
        planning: {
            title: 'Cashflow',
            copy: 'Expected income, cash calendar, and projections for the next decisions.',
            sections: ['invoices', 'scenarioOutcomes', 'cashCalendar', 'pipelineTabs', 'projection']
        },
        review: {
            title: 'Month Close',
            copy: 'Reconcile accounts, resolve open items, confirm obligations and income, then close the month.',
            sections: ['reviewQueue', 'obligationReview', 'tensionSignals', 'weeklyReview']
        },
        reports: {
            title: 'Insights',
            copy: 'Patterns across cash rhythm, reserves, income concentration, and financial health.',
            sections: ['reports']
        },
        data: {
            title: 'System',
            copy: 'Imports, backups, restore, reset, sample data, and app preferences.',
            sections: ['data', 'settings']
        },
        reserves: {
            title: 'Treasury',
            copy: 'Cash accounts, protected money, reserve targets, obligations, burn, and debt plans.',
            sections: ['reserves', 'goals', 'fixedCosts']
        }
    };

    return function renderSection(activeSection) {
        const page = pages[activeSection];
        if (!page) {
            return [
                `<div class="fin-dashboard-main">`,
                renderSectionHeading('Overview', 'Your local-first treasury cockpit.'),
                renderers.observatoryHeader(),
                renderers.dashboardCockpit(),
                `</div>`
            ];
        }
        return [
            renderSectionHeading(page.title, page.copy),
            ...page.sections.map((section) => renderers[section]())
        ];
    };
}
