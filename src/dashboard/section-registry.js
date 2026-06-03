export function createSectionRenderer(renderers, renderSectionHeading) {
    const pages = {
        ledger: {
            title: 'Transactions',
            copy: 'Clean daily view, focused review work, and raw audit evidence when you need it.',
            sections: ['ledger']
        },
        invoices: {
            title: 'Invoices',
            copy: 'Expected income, confidence, overdue follow-up, and settlement into real cash.',
            sections: ['invoices']
        },
        planning: {
            title: 'Cashflow Plan',
            copy: 'Baseline, expected month, and conservative or optimistic scenarios for the next decisions.',
            sections: ['scenarioOutcomes', 'cashCalendar', 'pipelineTabs', 'goals', 'projection', 'scenarioLab']
        },
        review: {
            title: 'Monthly Review',
            copy: 'Resolve unclear items, reconcile accounts, and close the operating loop.',
            sections: ['reviewQueue', 'obligationReview', 'paymentReview', 'tensionSignals', 'weeklyReview']
        },
        reports: {
            title: 'Reports',
            copy: 'Patterns across cash rhythm, reserves, income concentration, and financial health.',
            sections: ['reports']
        },
        data: {
            title: 'Import & Backup',
            copy: 'Local imports, backups, import batches, and sample ledger controls.',
            sections: ['data']
        },
        settings: {
            title: 'Settings',
            copy: 'System preferences and local display controls.',
            sections: ['settings']
        },
        reserves: {
            title: 'Cash & Reserves',
            copy: 'Operating cash, tax reserves, and buffer accounts.',
            sections: ['reserves']
        },
        fixedCosts: {
            title: 'Fixed Costs & Debt',
            copy: 'Monthly burn rate, subscriptions, and outstanding debt.',
            sections: ['fixedCosts']
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
                renderers.attentionQueue(),
                renderers.next30Days(),
                `</div>`
            ];
        }
        return [
            renderSectionHeading(page.title, page.copy),
            ...page.sections.map((section) => renderers[section]())
        ];
    };
}
