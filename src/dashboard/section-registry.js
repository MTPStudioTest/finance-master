export function createSectionRenderer(renderers, renderSectionHeading) {
    const pages = {
        ledger: {
            title: 'Flow',
            copy: 'The working inbox for money movement: records, expected income, matching, and review work.',
            sections: ['ledger']
        },
        review: {
            title: 'Logbook',
            copy: 'Saved checkpoints, review notes, account checks, and the history that unlocks pattern memory.',
            sections: ['reviewQueue', 'obligationReview', 'tensionSignals', 'weeklyReview']
        },
        reports: {
            title: 'Signals',
            copy: 'Interpretation, diagnosis, risks, patterns, and decision simulations from current local data.',
            sections: ['reports']
        },
        data: {
            title: 'Settings',
            copy: 'Data safety, imports, backups, restore, reset, local app health, and app-level preferences.',
            sections: ['data', 'settings']
        },
        reserves: {
            title: 'Map',
            copy: 'Accounts, reserves, obligations, recurring burn, debts, payment plans, goals, and allocation structure.',
            sections: ['reserves']
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
                `</div>`
            ];
        }
        return [
            renderSectionHeading(page.title, page.copy),
            ...page.sections.map((section) => renderers[section]())
        ];
    };
}
