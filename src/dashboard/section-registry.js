export function createSectionRenderer(renderers, renderSectionHeading) {
    const pages = {
        ledger: {
            title: 'Cash Movement',
            copy: 'Transactions, expected income, review work, matching, and evidence in one workspace.',
            sections: ['ledger']
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
            sections: ['reserves']
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
