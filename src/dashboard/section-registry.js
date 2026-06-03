export function createSectionRenderer(renderers, renderSectionHeading) {
    const pages = {
        ledger: {
            title: 'Transactions',
            copy: 'Clean daily view, focused review work, and raw audit evidence when you need it.',
            sections: ['ledger']
        },
        invoices: {
            title: 'Income',
            copy: 'Expected, confirmed, overdue, and settled income separated from real cash.',
            sections: ['invoices']
        },
        planning: {
            title: 'Cashflow',
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
            title: 'Reserves',
            copy: 'Protected cash, reserve buckets, and allocation between available and spoken-for money.',
            sections: ['reserves']
        },
        fixedCosts: {
            title: 'Obligations',
            copy: 'Recurring obligations, minimum payments, and debt plans that shape monthly burn.',
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
                renderers.todaysDecision(),
                renderers.next30Days(),
                renderers.nextActions(),
                renderers.strategicPicture(),
                `</div>`
            ];
        }
        return [
            renderSectionHeading(page.title, page.copy),
            ...page.sections.map((section) => renderers[section]())
        ];
    };
}
