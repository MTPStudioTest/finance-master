export function createSectionRenderer(renderers, renderSectionHeading) {
    const pages = {
        decisions: {
            title: 'Decisions',
            copy: 'A deterministic decision board for focus, pressure, opportunities, and what can safely wait.',
            sections: ['decisionBoard']
        },
        flow: {
            title: 'Flow',
            copy: 'The timeline and forecast view for upcoming income, obligations, burn, and cash pressure.',
            sections: ['cashCalendar', 'scenarioOutcomes', 'projection', 'invoices', 'pipelineTabs']
        },
        plan: {
            title: 'Plan',
            copy: 'The structural money map: accounts, reserves, baseline costs, debts, payment plans, goals, and project cash.',
            sections: ['reserves']
        },
        radar: {
            title: 'Radar',
            copy: 'Actionable risks, opportunities, concentration, reserve health, and scenario suggestions.',
            sections: ['reports']
        },
        review: {
            title: 'Review',
            copy: 'A lightweight maintenance loop for keeping the financial picture trustworthy without turning it into homework.',
            sections: ['reviewQueue', 'obligationReview', 'paymentReview', 'tensionSignals', 'weeklyReview']
        },
        logbook: {
            title: 'Logbook',
            copy: 'The raw record utility for transactions, imported rows, matching evidence, cleanup, and detail inspection.',
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
                renderSectionHeading('Pulse', 'The live financial cockpit for Safe-to-Spend, runway, pressure, and the next move.'),
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
