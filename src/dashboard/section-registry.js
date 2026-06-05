export function createSectionRenderer(renderers, renderSectionHeading) {
    const pages = {
        decisions: {
            title: 'Decision Lab',
            copy: 'Test spending, payment, income, and project decisions before acting.',
            sections: ['decisionBoard']
        },
        flow: {
            title: 'Cash Timeline',
            copy: 'Upcoming income, obligations, payment plans, low points, and runway over time.',
            sections: ['cashCalendar', 'scenarioOutcomes', 'projection', 'invoices']
        },
        plan: {
            title: 'Money Plan',
            copy: 'Accounts, reserves, recurring costs, debts, payment plans, and project cash.',
            sections: ['reserves']
        },
        radar: {
            title: 'Risk Radar',
            copy: 'Early warnings, weak assumptions, concentration risks, and opportunities.',
            sections: ['reports']
        },
        review: {
            title: 'Reality Check',
            copy: 'A lightweight loop to confirm the numbers still reflect reality.',
            sections: ['reviewQueue', 'obligationReview', 'paymentReview', 'tensionSignals', 'weeklyReview']
        },
        logbook: {
            title: 'Records',
            copy: 'Imports, transactions, matching evidence, cleanup, and detailed records.',
            sections: ['ledger']
        },
        settings: {
            title: 'Settings',
            copy: 'App behavior, local data and privacy, backup/restore, defaults, and display preferences.',
            sections: ['data', 'settings']
        }
    };

    return function renderSection(activeSection) {
        const page = pages[activeSection];
        if (!page) {
            return [
                `<div class="fin-dashboard-main">`,
                renderSectionHeading('Money Status', 'Your current financial condition, safe-to-spend, runway, and next move.'),
                renderers.observatoryHeader(),
                renderers.dashboardCockpit(),
                renderers.nextActions(),
                renderers.todaysDecision(),
                renderers.next30Days(),
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
