/**
 * FinancialMode — UI Controller for Dashi "Financial Mode (Gravity Treasury)"
 * UI-only refinements: hierarchy, progressive disclosure, and calm interaction.
 */

window.FinancialMode = (function () {
    'use strict';

    let currentData = null;
    let currentSnapshot = null;
    let currentMetrics = null;
    let currentDiagnostics = null;
    let currentReview = null;
    let currentTreasury = null;
    let currentHasFinanceData = false;
    let labState = { marketMajors: 0, burnDelta: 0, probFloor: 50 };
    let adviceExpanded = false;

    const UI_KEYS = {
        focusMode: 'finance-master.layout.focus-mode',
        pipelineTab: 'finance-master.layout.pipeline-tab',
        ledgerView: 'finance-master.layout.ledger-view',
        activeSection: 'finance-master.layout.active-section'
    };

    const SECTIONS = ['dashboard', 'ledger', 'invoices', 'planning', 'review', 'reports', 'data', 'settings'];

    // Elements
    const elements = {
        container: document.getElementById('dashboard-financial'),
        content: document.getElementById('fin-content-area'),
        switchBtns: document.querySelectorAll('.fin-switch-btn')
    };

    function collapsedKey(sectionId) {
        return `finance-master.layout.collapsed.${String(sectionId || '').trim()}`;
    }

    function readStoredBoolean(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (raw == null) return Boolean(fallback);
            if (raw === 'true') return true;
            if (raw === 'false') return false;
        } catch (error) {
            // noop
        }
        return Boolean(fallback);
    }

    function writeStoredBoolean(key, value) {
        try {
            localStorage.setItem(key, value ? 'true' : 'false');
        } catch (error) {
            // noop
        }
    }

    function getFocusMode() {
        return readStoredBoolean(UI_KEYS.focusMode, false);
    }

    function setFocusMode(enabled) {
        writeStoredBoolean(UI_KEYS.focusMode, Boolean(enabled));
    }

    function getPipelineTab() {
        try {
            const raw = String(localStorage.getItem(UI_KEYS.pipelineTab) || 'pipeline').toLowerCase();
            if (raw === 'pipeline' || raw === 'history' || raw === 'cashflow') return raw;
        } catch (error) {
            // noop
        }
        return 'pipeline';
    }

    function setPipelineTab(tab) {
        const value = String(tab || '').toLowerCase();
        if (value !== 'pipeline' && value !== 'history' && value !== 'cashflow') return;
        try {
            localStorage.setItem(UI_KEYS.pipelineTab, value);
        } catch (error) {
            // noop
        }
    }

    function getActiveSection() {
        try {
            const raw = String(localStorage.getItem(UI_KEYS.activeSection) || 'dashboard').toLowerCase();
            if (raw === 'today') return 'dashboard';
            if (raw === 'transactions') return 'ledger';
            if (raw === 'cashflow') return 'planning';
            if (raw === 'import') return 'data';
            return SECTIONS.indexOf(raw) !== -1 ? raw : 'dashboard';
        } catch (error) {
            return 'dashboard';
        }
    }

    function setActiveSection(section) {
        const next = String(section || 'dashboard').toLowerCase();
        const safeSection = SECTIONS.indexOf(next) !== -1 ? next : 'dashboard';
        try {
            localStorage.setItem(UI_KEYS.activeSection, safeSection);
        } catch (error) {
            // noop
        }
        render();
    }

    function getLedgerView() {
        try {
            const raw = String(localStorage.getItem(UI_KEYS.ledgerView) || 'clean').toLowerCase();
            if (raw === 'clean' || raw === 'work' || raw === 'audit') return raw;
        } catch (error) {
            // noop
        }
        return 'clean';
    }

    function setLedgerView(view) {
        const safe = String(view || 'clean').toLowerCase();
        if (safe !== 'clean' && safe !== 'work' && safe !== 'audit') return;
        try {
            localStorage.setItem(UI_KEYS.ledgerView, safe);
        } catch (error) {
            // noop
        }
    }

    function updateTopNavigation(section) {
        document.querySelectorAll('[data-fin-nav]').forEach((button) => {
            const active = String(button.getAttribute('data-fin-nav') || '') === section;
            button.classList.toggle('active', active);
            button.setAttribute('aria-current', active ? 'page' : 'false');
        });
    }

    function isSectionCollapsed(sectionId) {
        return readStoredBoolean(collapsedKey(sectionId), true);
    }

    function setSectionCollapsed(sectionId, collapsed) {
        writeStoredBoolean(collapsedKey(sectionId), Boolean(collapsed));
    }

    function pluralize(count, singular, plural) {
        const value = Number(count) || 0;
        return `${value} ${value === 1 ? singular : (plural || `${singular}s`)}`;
    }

    function scopeFilterOptions(selected) {
        return [
            ['all', 'All scopes'],
            ['business', 'Business'],
            ['personal', 'Personal'],
            ['shared', 'Shared']
        ].map(([value, label]) => `<option value="${value}"${selected === value ? ' selected' : ''}>${label}</option>`).join('');
    }

    function formatShortDate(value) {
        const timestamp = Date.parse(String(value || ''));
        if (!Number.isFinite(timestamp)) return 'Not yet';
        return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function safeArray(value) {
        return Array.isArray(value) ? value : [];
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeActionArg(value) {
        return String(value == null ? '' : value)
            .replace(/\\/g, '\\\\')
            .replace(/'/g, '\\\'');
    }

    function renderSAGGlyph(iconKey, options = {}) {
        if (typeof window.renderSAGIcon === 'function') {
            return window.renderSAGIcon(iconKey, options);
        }
        return '';
    }

    function formatCurrency(val, currency) {
        if (!currentHasFinanceData && (val == null || Number(val) === 0)) return '—';
        if (val == null || !Number.isFinite(Number(val))) return '—';
        const baseCurrency = (window.Store && typeof window.Store.getFinanceSettings === 'function')
            ? window.Store.getFinanceSettings().baseCurrency
            : 'EUR';
        if (window.FinanceFormatting && typeof window.FinanceFormatting.formatCurrencyAmount === 'function') {
            return window.FinanceFormatting.formatCurrencyAmount(val, {
                currency,
                baseCurrency
            });
        }
        const activeCurrency = currency || baseCurrency || 'EUR';
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: activeCurrency || 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(val));
    }

    function confidenceLabel(score) {
        const value = Number(score);
        if (!Number.isFinite(value)) return 'Thin';
        if (value >= 0.75) return 'Steady';
        if (value >= 0.45) return 'Mixed';
        return 'Thin';
    }

    function resolveFinancialHeroSignal() {
        const runway = Number(currentSnapshot && currentSnapshot.runwayMonths);
        const confidence = Number(currentSnapshot && currentSnapshot.confidenceScore);
        const missingInputs = Array.isArray(currentSnapshot && currentSnapshot.missingInputs)
            ? currentSnapshot.missingInputs.length
            : 0;
        const stress = String(currentMetrics && currentMetrics.stressLevel || '').toLowerCase();

        if (!currentHasFinanceData || !Number.isFinite(confidence) || confidence < 0.45 || missingInputs >= 3) {
            return { text: 'Unclear', tone: 'quiet', icon: 'attention' };
        }
        if (!Number.isFinite(runway) || runway < 4 || stress === 'high') {
            return { text: 'Tight', tone: 'fragmented', icon: 'warning' };
        }
        if (runway >= 8 && stress === 'low') {
            return { text: 'Expanding', tone: 'expanding', icon: 'sprout' };
        }
        return { text: 'Stable', tone: 'nourishing', icon: 'success' };
    }

    function renderFinancialHero() {
        const heroSlot = document.getElementById('financial-hero-slot');
        if (!heroSlot || !window.CoreDashboardHero || typeof window.CoreDashboardHero.renderHero !== 'function') return;

        const signal = resolveFinancialHeroSignal();
        heroSlot.innerHTML = window.CoreDashboardHero.renderHero({
            domain: 'financial',
            headline: 'Finance Cockpit',
            signalText: signal.text,
            signalTone: signal.tone,
            signalIcon: signal.icon,
            signalAriaLabel: 'Finance signal: ' + signal.text,
            compact: currentHasFinanceData
        });
        window.CoreDashboardHero.bindDetailsPersistence(heroSlot, 'financial');
    }

    function renderCompactEmpty(text) {
        return `<div class="fin-compact-empty">${text}</div>`;
    }

    function renderCollapsible(sectionId, title, summary, bodyHtml) {
        const collapsed = isSectionCollapsed(sectionId);
        return `
            <div class="fin-collapsible ${collapsed ? 'is-collapsed' : 'is-open'}" data-fin-collapsible="${sectionId}">
                <button class="fin-collapsible-header" type="button" data-fin-action="toggle-collapsible" data-fin-section="${sectionId}" aria-expanded="${collapsed ? 'false' : 'true'}">
                    <div class="fin-collapsible-title-wrap">
                        <div class="fin-title">${title}</div>
                        <div class="fin-summary">${summary}</div>
                    </div>
                    <span class="fin-collapsible-caret" aria-hidden="true">${collapsed ? '▾' : '▴'}</span>
                </button>
                <div class="fin-collapsible-body">
                    ${bodyHtml}
                </div>
            </div>
        `;
    }

    function getActivePipelineDeals() {
        const activeFn = (window.FinanceLedger && typeof window.FinanceLedger.isPipelineActive === 'function')
            ? window.FinanceLedger.isPipelineActive
            : function (stage) {
                const state = String(stage || '').toLowerCase();
                return state !== 'paid' && state !== 'closed' && state !== 'lost' && state !== 'cancelled' && state !== 'deleted';
            };
        return safeArray(currentData && currentData.pipelineDeals).filter((deal) => activeFn(deal && deal.status));
    }

    function buildCashflowRhythmData() {
        const paidInvoices = safeArray(currentData && currentData.invoices)
            .filter((invoice) => String(invoice && invoice.status || '').toLowerCase() === 'paid');

        const buckets = [];
        for (let i = 5; i >= 0; i -= 1) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            buckets.push({ key: key, label: d.toLocaleDateString(undefined, { month: 'short' }), income: 0, expense: 0 });
        }

        const byKey = new Map(buckets.map((entry) => [entry.key, entry]));
        paidInvoices.forEach((invoice) => {
            const ts = Date.parse((invoice && invoice.paidAt) || (invoice && invoice.sentAt) || '');
            if (!Number.isFinite(ts)) return;
            const d = new Date(ts);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const bucket = byKey.get(key);
            if (!bucket) return;
            const amount = Math.abs(Number(invoice && invoice.amount) || 0);
            bucket.income += amount;
        });

        const hasData = buckets.some((entry) => entry.income > 0 || entry.expense > 0);
        const maxValue = Math.max(1, ...buckets.map((entry) => Math.max(entry.income, entry.expense)));
        return { buckets, hasData, maxValue };
    }

    function renderCashflowRhythm(data) {
        const rhythm = data || buildCashflowRhythmData();
        if (!rhythm.hasData) return renderCompactEmpty('No cashflow history yet.');
        const barWidth = 100 / Math.max(1, rhythm.buckets.length);
        return `
            <div class="fin-rhythm">
                <div class="fin-muted fin-rhythm-label">Cashflow Rhythm (6 months)</div>
                <div class="fin-rhythm-bars">
                    ${rhythm.buckets.map((entry) => {
                        const incomePct = entry.income > 0 ? Math.max(2, (entry.income / rhythm.maxValue) * 100) : 0;
                        const expensePct = entry.expense > 0 ? Math.max(2, (entry.expense / rhythm.maxValue) * 100) : 0;
                        return `
                            <div class="fin-rhythm-month">
                                <div class="fin-rhythm-columns" style="--rhythm-width:${barWidth}%">
                                    <span class="fin-rhythm-bar fin-rhythm-income" style="height:${incomePct}%"></span>
                                    <span class="fin-rhythm-bar fin-rhythm-expense" style="height:${expensePct}%"></span>
                                </div>
                                <span class="fin-rhythm-month-label">${entry.label}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Initialize Financial Mode
     */
    function init() {
        console.log('[FinancialMode] Initializing...');
        if (window.Store && typeof window.Store.getUiSettings === 'function') {
            const scenario = window.Store.getUiSettings().scenario || {};
            labState = {
                marketMajors: Number(scenario.marketMajors) || 0,
                burnDelta: Number(scenario.burnDelta) || 0,
                probFloor: Number.isFinite(Number(scenario.probFloor)) ? Number(scenario.probFloor) : 50
            };
        }
        bindUiInteractions();

        window.addEventListener('mode-changed', (e) => {
            if (e.detail.mode === 'financial') {
                render();
            }
        });

        window.addEventListener('finance:updated', render);
        render();
    }

    function bindUiInteractions() {
        if (!elements.content || elements.content.dataset.finUiBound === '1') return;
        elements.content.dataset.finUiBound = '1';

        elements.content.addEventListener('click', (event) => {
            const actionEl = event.target.closest('[data-fin-action]');
            if (!actionEl || !elements.content.contains(actionEl)) return;
            const action = String(actionEl.getAttribute('data-fin-action') || '');

            if (action === 'toggle-focus-mode') {
                const nextFocusMode = !getFocusMode();
                if (nextFocusMode && window.CoreDashboardLayout && typeof window.CoreDashboardLayout.saveCurrent === 'function') {
                    window.CoreDashboardLayout.saveCurrent();
                }
                setFocusMode(nextFocusMode);
                render();
                return;
            }

            if (action === 'toggle-collapsible') {
                const sectionId = String(actionEl.getAttribute('data-fin-section') || '').trim();
                if (!sectionId) return;
                setSectionCollapsed(sectionId, !isSectionCollapsed(sectionId));
                render();
                return;
            }

            if (action === 'set-tab') {
                const tab = String(actionEl.getAttribute('data-fin-tab') || '').trim();
                setPipelineTab(tab);
                render();
                return;
            }

            if (action === 'set-ledger-view') {
                const view = String(actionEl.getAttribute('data-fin-ledger-view') || 'clean').trim();
                setLedgerView(view);
                render();
                return;
            }

            if (action === 'set-scenario-preset') {
                const preset = String(actionEl.getAttribute('data-fin-preset') || 'baseline');
                const presets = {
                    baseline: { marketMajors: 0, burnDelta: 0, probFloor: 50 },
                    conservative: { marketMajors: -15, burnDelta: 10, probFloor: 35 },
                    stretch: { marketMajors: 10, burnDelta: -5, probFloor: 70 }
                };
                labState = presets[preset] || presets.baseline;
                if (window.Store && typeof window.Store.saveUiSettings === 'function') {
                    window.Store.saveUiSettings({ scenario: labState });
                }
                render();
                return;
            }

            if (action === 'toggle-advice') {
                adviceExpanded = !adviceExpanded;
                render();
            }
        });

        elements.content.addEventListener('change', (event) => {
            const target = event.target;
            if (!target || target.id !== 'fin-scope-filter') return;
            if (window.Store && typeof window.Store.saveUiSettings === 'function') {
                window.Store.saveUiSettings({ scopeFilter: String(target.value || 'all') });
            }
            render();
        });
    }

    /**
     * Render the entire dashboard
     */
    function render() {
        const scope = window.Store.getUiSettings().scopeFilter || 'all';
        const context = window.Store.computeFinanceContext(true, scope);
        currentSnapshot = context.snapshot;
        currentData = context.readModel;
        currentTreasury = context.treasury || {};
        currentDiagnostics = context.diagnostics || {};
        currentReview = window.Store.getReviewState();
        currentHasFinanceData = Number(currentData && currentData.eventsCount) > 0;
        currentMetrics = window.FinancialEngine.compute({
            financeSnapshot: currentSnapshot,
            financeReadModel: currentData
        });
        renderFinancialHero();

        if (!elements.content) return;

        const activeSection = getActiveSection();
        const focusMode = getFocusMode();
        updateTopNavigation(activeSection);
        const sections = renderSection(activeSection, focusMode);

        elements.content.classList.toggle('fin-focus-mode', activeSection === 'dashboard' && focusMode);
        elements.content.innerHTML = sections.join('');

        if (activeSection === 'planning') {
            attachCharts();
            attachLabListeners();
        }

        // Post-render attachments
        if (window.CoreDashboardLayout && typeof window.CoreDashboardLayout.refresh === 'function') {
            window.CoreDashboardLayout.refresh();
        }
    }

    /* --- IA Layer Renderers --- */

    function renderSection(activeSection, focusMode) {
        if (activeSection === 'ledger') {
            return [renderSectionHeading('Transactions', 'Clean daily view, focused review work, and raw audit evidence when you need it.'), renderLedgerSection(), renderOperationsInvestmentsRow()];
        }
        if (activeSection === 'invoices') {
            return [renderSectionHeading('Invoices', 'Expected income, confidence, overdue follow-up, and settlement into real cash.'), renderInvoicesSection()];
        }
        if (activeSection === 'planning') {
            return [renderSectionHeading('Cashflow Plan', 'Baseline, expected month, and conservative or optimistic scenarios for the next decisions.'), renderScenarioOutcomes(), renderCashCalendar(), renderPipelineTabs(), renderGoals(), renderOperationsInvestmentsRow(), renderProjection(), renderScenarioLab()];
        }
        if (activeSection === 'review') {
            return [renderSectionHeading('Monthly Review', 'Resolve unclear items, reconcile accounts, and close the operating loop.'), renderReviewQueue(), renderObligationReviewSection(), renderPaymentReviewSection(), renderTensionSignals(), renderWeeklyReviewSection()];
        }
        if (activeSection === 'reports') {
            return [renderSectionHeading('Reports', 'Patterns across cash rhythm, reserves, income concentration, and financial health.'), renderReportsSection()];
        }
        if (activeSection === 'data') {
            return [renderSectionHeading('Import & Backup', 'Local imports, backups, import batches, and sample ledger controls.'), renderDataSection()];
        }
        if (activeSection === 'settings') {
            return [renderSectionHeading('Settings', 'Operational preferences, appearance, scope, and postponed integrations.'), renderSettingsSection()];
        }
        return [
            renderObservatoryHeader(),
            renderSetupChecklist(),
            renderTreasurySnapshot(),
            renderCashReserveBurnRow(),
            renderActionThisWeek(),
            renderNext30Days()
        ];
    }

    function renderSectionHeading(title, copy) {
        return `
            <section class="fin-section fin-section-heading">
                <div class="widget ui-card glass fin-card fin-section-intro">
                    <div class="widget-title ui-title">${title}</div>
                    <div class="fin-helper-text">${copy}</div>
                </div>
            </section>
        `;
    }

    function renderLedgerSection() {
        const transactions = safeArray(currentData && currentData.transactions)
            .slice()
            .sort((a, b) => Date.parse(String(b && b.timestamp || '')) - Date.parse(String(a && a.timestamp || '')))
            .slice(0, 12);
        const view = getLedgerView();
        const uncategorized = transactions.filter((entry) => String(entry && entry.categoryId || '').toLowerCase() === 'uncategorized'
            || String(entry && entry.reviewStatus || '').toLowerCase() === 'needs_review');
        const missingReceipts = transactions.filter((entry) => String(entry && entry.type) === 'expense.recorded'
            && !String(entry && entry.receiptUrl || '').trim()
            && String(entry && entry.categoryId || '').toLowerCase() !== 'transfer');
        const cleanRows = transactions.map((entry) => {
            const amount = Number(entry && entry.signedAmount);
            const signed = Number.isFinite(amount) ? amount : Number(entry && entry.amount) || 0;
            const chips = [
                String(entry && entry.categoryId || '').toLowerCase() === 'uncategorized' ? 'Needs category' : '',
                String(entry && entry.reviewStatus || '').toLowerCase() === 'reviewed' ? 'Reviewed' : '',
                String(entry && entry.obligationId || '').trim() ? 'Matched' : '',
                String(entry && entry.type) === 'expense.recorded' ? 'Tax check' : ''
            ].filter(Boolean);
            return `
                <div class="fin-transaction-row">
                    <div>
                        <strong>${escapeHtml(entry.description || 'Transaction')}</strong>
                        <small>${formatShortDate(entry.timestamp)} · ${escapeHtml(entry.categoryId || 'uncategorized')} · ${escapeHtml(entry.accountName || entry.fromAccountName || 'Account')} · ${escapeHtml(entry.scope || 'shared')}</small>
                        <div class="fin-chip-row">${chips.map((chip) => `<span class="fin-status-pill">${escapeHtml(chip)}</span>`).join('')}</div>
                    </div>
                    <span class="${signed >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${signed >= 0 ? '+' : '-'}${formatCurrency(Math.abs(signed), entry.currency)}</span>
                </div>
            `;
        }).join('');
        let panelHtml = '';
        if (view === 'audit') {
            panelHtml = transactions.length ? `
                <table class="fin-table fin-table--compact">
                    <thead><tr><th>Date</th><th>Type</th><th>ID / source</th><th>Account</th><th style="text-align:right">Amount</th></tr></thead>
                    <tbody>
                        ${transactions.map((entry) => {
                            const amount = Number(entry && entry.signedAmount);
                            const signed = Number.isFinite(amount) ? amount : Number(entry && entry.amount) || 0;
                            return `
                                <tr>
                                    <td>${formatShortDate(entry.timestamp)}</td>
                                    <td>${escapeHtml(entry.type || entry.ledgerType || 'transaction')}</td>
                                    <td>${escapeHtml(entry.id || entry.transactionEntityId || '')}<small>${escapeHtml(entry.source || entry.reviewStatus || 'local ledger')}</small></td>
                                    <td>${escapeHtml(entry.accountName || entry.fromAccountName || entry.toAccountName || 'Account')}</td>
                                    <td style="text-align:right" class="${signed >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${signed >= 0 ? '+' : '-'}${formatCurrency(Math.abs(signed), entry.currency)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            ` : renderCompactEmpty('No audit records yet.');
        } else if (view === 'work') {
            panelHtml = `
                <div class="fin-status-grid">
                    <div class="fin-status-card"><span>Needs category</span><strong>${uncategorized.length}</strong><span>Transactions to classify</span></div>
                    <div class="fin-status-card"><span>Missing receipt check</span><strong>${missingReceipts.length}</strong><span>Expense records to review</span></div>
                    <div class="fin-status-card"><span>Visible records</span><strong>${transactions.length}</strong><span>Latest ledger movements</span></div>
                </div>
                <div class="fin-action-row">
                    <button class="fin-action-btn" type="button" data-action="openEditModal" data-action-args="'financeOverview'">Open full work ledger</button>
                    <button class="fin-action-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'review'">Open review queue</button>
                </div>
                ${transactions.length ? `
                    <table class="fin-table fin-table--compact">
                        <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Review</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${transactions.map((entry) => `
                                <tr>
                                    <td>${formatShortDate(entry.timestamp)}</td>
                                    <td>${escapeHtml(entry.description || 'Transaction')}</td>
                                    <td>${escapeHtml(entry.categoryId || 'uncategorized')}</td>
                                    <td>${escapeHtml(entry.reviewStatus || 'clear')}</td>
                                    <td style="text-align:right"><button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${escapeActionArg(entry.id || entry.transactionEntityId || '')}'">Categorize</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : renderCompactEmpty('No transactions yet.')}
            `;
        } else {
            panelHtml = transactions.length ? cleanRows : renderCompactEmpty('No transactions yet. Start by adding income, an expense, or importing a CSV.');
        }
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Transactions</div>
                            <div class="fin-helper-text">Clean for scanning, Work for categorization, Audit for raw local evidence.</div>
                        </div>
                        <div class="fin-action-row">
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transaction', 'expense'">Add transaction</button>
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'financeOverview'">Open ledger</button>
                            <button class="fin-mini-btn" type="button" data-action="exportTransactionsCsv">Export CSV</button>
                        </div>
                    </div>
                    <div class="fin-tabs" role="tablist" aria-label="Transaction view modes">
                        <button class="fin-tab-btn ${view === 'clean' ? 'active' : ''}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="clean">Clean View</button>
                        <button class="fin-tab-btn ${view === 'work' ? 'active' : ''}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="work">Work View</button>
                        <button class="fin-tab-btn ${view === 'audit' ? 'active' : ''}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="audit">Audit View</button>
                    </div>
                    <div class="fin-tab-panel">
                        ${panelHtml}
                    </div>
                </div>
            </section>
        `;
    }

    function renderWeeklyReviewSection() {
        const reviewDue = isWeeklyReviewDue();
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-review-prompt">
                    <div>
                        <div class="widget-title ui-title">${reviewDue ? 'Weekly review due' : 'Weekly review current'}</div>
                        <div class="fin-helper-text">Reconcile cash accounts, inspect pipeline and recurring costs, then leave one operating note.</div>
                        <div class="fin-operating-meta">Last reviewed ${formatShortDate(currentReview && currentReview.lastReviewedAt)}</div>
                    </div>
                    <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">${reviewDue ? 'Start review' : 'Open review'}</button>
                </div>
            </section>
        `;
    }

    function renderDataSection() {
        const latestImport = window.Store && typeof window.Store.getImportState === 'function'
            ? safeArray(window.Store.getImportState().batches).slice(-1)[0]
            : null;
        const dataHealth = window.Store && typeof window.Store.getLocalDataHealth === 'function'
            ? window.Store.getLocalDataHealth()
            : { ok: true, issues: [], eventCount: 0, latestEventAt: null };
        return `
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Imports and Backups</div>
                        <div class="fin-helper-text">Everything stays local. Use exports before big changes or device moves.</div>
                        ${latestImport ? `
                            <div class="modal-list-row">
                                <span><strong>Latest CSV batch</strong><br><small>${escapeHtml(latestImport.sourceFile)} · ${latestImport.fingerprints.length} rows · ${formatShortDate(latestImport.importedAt)}</small></span>
                                <button class="fin-mini-btn" type="button" data-action="undoImportBatch" data-action-args="'${escapeActionArg(latestImport.id)}'">Undo</button>
                            </div>
                        ` : renderCompactEmpty('No CSV import batches yet.')}
                        <div class="fin-action-row">
                            <button class="fin-action-btn" type="button" data-action="openEditModal" data-action-args="'csvImport'">Import CSV</button>
                            <button class="fin-action-btn" type="button" data-action="exportTransactionsCsv">Export transactions CSV</button>
                            <button class="fin-action-btn" type="button" data-action="exportFinanceBackup">Export backup</button>
                            <button class="fin-action-btn" type="button" data-action="openEditModal" data-action-args="'backupRestore'">Restore backup</button>
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Local Data Health</div>
                        <div class="fin-helper-text">${dataHealth.ok ? 'Local finance data is readable and backup-ready.' : 'Some local Finance Master data needs attention.'}</div>
                        <div class="modal-list-row">
                            <span><strong>${dataHealth.ok ? 'Healthy' : 'Needs attention'}</strong><br><small>${Number(dataHealth.eventCount || 0)} finance events${dataHealth.latestEventAt ? ` · latest ${formatShortDate(dataHealth.latestEventAt)}` : ''}</small></span>
                            <span>${dataHealth.issues.length} issue${dataHealth.issues.length === 1 ? '' : 's'}</span>
                        </div>
                        ${dataHealth.issues.length ? `
                            <div class="fin-compact-empty">${dataHealth.issues.map((entry) => `${escapeHtml(entry.label)}: ${escapeHtml(entry.message)}`).join('<br>')}</div>
                        ` : ''}
                        <div class="fin-action-row">
                            <button class="fin-action-btn" type="button" data-action="openEditModal" data-action-args="'backupRestore'">Restore backup</button>
                            <button class="btn-danger ui-btn" type="button" data-action="resetLocalFinanceData">Reset local data</button>
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Sample Data</div>
                        <div class="fin-helper-text">Use the fictional sample ledger to understand the cockpit, or clear it for your own records.</div>
                        <div class="settings-reset-actions">
                            <button class="ui-btn ui-btn--secondary" type="button" data-action="resetDemoData">Restore sample data</button>
                            <button class="btn-danger ui-btn" type="button" data-action="deleteDemoData">Delete sample data</button>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    function renderSettingsSection() {
        const financeSettings = window.Store.getFinanceSettings();
        const uiSettings = window.Store.getUiSettings();
        return `
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Operating Preferences</div>
                        <div class="modal-list-row"><span>Base currency</span><strong>${escapeHtml(financeSettings.baseCurrency || 'EUR')}</strong></div>
                        <div class="modal-list-row"><span>Forecast horizon</span><strong>${escapeHtml(financeSettings.forecastDays || 90)} days</strong></div>
                        <div class="modal-list-row"><span>Scope filter</span><strong>${escapeHtml(uiSettings.scopeFilter || 'all')}</strong></div>
                        <div class="modal-list-row"><span>Appearance</span><strong>${escapeHtml(uiSettings.appearance || 'aurora')}</strong></div>
                        <div class="modal-list-row"><span>Reduced motion</span><strong>${uiSettings.reducedMotion ? 'On' : 'Off'}</strong></div>
                        <button class="fin-action-btn" type="button" data-action="openEditModal" data-action-args="'settings'">Open settings</button>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Postponed Integrations</div>
                        <div class="fin-helper-text">Market portfolio, Web3, DeFi, and live quote refresh remain compatibility-only. They are kept out of the production flow until they serve treasury decisions clearly.</div>
                    </div>
                </div>
            </section>
        `;
    }

    function treasuryArray(key) {
        return safeArray(currentTreasury && currentTreasury[key]);
    }

    function treasuryNumber(key, fallback = 0) {
        const value = Number(currentTreasury && currentTreasury[key]);
        return Number.isFinite(value) ? value : fallback;
    }

    function statusLabel(value) {
        const raw = String(value || '').replace(/_/g, ' ');
        return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Review';
    }

    function renderStatusPill(status) {
        const safe = String(status || 'needs_review').toLowerCase();
        return `<span class="fin-status-pill fin-status-pill--${escapeHtml(safe)}">${escapeHtml(statusLabel(safe))}</span>`;
    }

    function invoiceStatusFromDeal(deal) {
        const status = String(deal && (deal.status || deal.stage) || '').toLowerCase();
        const probability = Number(deal && deal.probability);
        const due = window.FinanceDates?.toDateOnly?.(deal && deal.expectedDateISO) || String(deal && deal.expectedDateISO || '').slice(0, 10);
        const today = window.FinanceDates?.todayDateOnly?.() || new Date().toISOString().slice(0, 10);
        if (status === 'paid' || status === 'received') return 'paid';
        if (due && due < today) return 'overdue';
        if (status === 'confirmed' || probability >= 0.8) return 'confirmed';
        if (status === 'risky' || probability < 0.5) return 'uncertain';
        return 'likely';
    }

    function renderInvoicesSection() {
        const active = getActivePipelineDeals()
            .map((deal) => ({
                id: String(deal && deal.id || ''),
                title: String(deal && deal.title || 'Expected income'),
                amount: Number(deal && deal.value) || 0,
                probability: Number(deal && deal.probability) || 0,
                expectedDateISO: deal && deal.expectedDateISO,
                settlementAccount: String(deal && deal.destinationAccountName || deal && deal.destinationAccountId || ''),
                status: invoiceStatusFromDeal(deal)
            }));
        const paid = safeArray(currentData && currentData.invoices)
            .filter((entry) => String(entry && entry.status || '').toLowerCase() === 'paid')
            .slice(0, 8)
            .map((entry) => ({
                id: String(entry && entry.id || ''),
                title: String(entry && (entry.client || entry.title) || 'Paid income'),
                amount: Number(entry && entry.amount) || 0,
                probability: 1,
                expectedDateISO: entry && (entry.paidAt || entry.sentAt),
                settlementAccount: String(entry && entry.destinationAccountName || ''),
                status: 'paid'
            }));
        const rows = active.concat(paid).sort((a, b) => {
            const tsA = Date.parse(String(a.expectedDateISO || '')) || Number.MAX_SAFE_INTEGER;
            const tsB = Date.parse(String(b.expectedDateISO || '')) || Number.MAX_SAFE_INTEGER;
            return tsA - tsB;
        });
        const totals = rows.reduce((acc, row) => {
            acc[row.status] = (acc[row.status] || 0) + row.amount;
            return acc;
        }, {});
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Income & Invoices</div>
                            <div class="fin-helper-text">Invoices here are expected income records. Settlement turns them into real account cash.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'income'">Add invoice</button>
                    </div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card">${renderStatusPill('confirmed')}<strong>${formatCurrency(totals.confirmed || 0)}</strong><span>Signed or high-confidence income</span></div>
                        <div class="fin-status-card">${renderStatusPill('likely')}<strong>${formatCurrency(totals.likely || 0)}</strong><span>Expected but not guaranteed</span></div>
                        <div class="fin-status-card">${renderStatusPill('uncertain')}<strong>${formatCurrency(totals.uncertain || 0)}</strong><span>Lower-confidence assumptions</span></div>
                        <div class="fin-status-card">${renderStatusPill('overdue')}<strong>${formatCurrency(totals.overdue || 0)}</strong><span>Follow-up candidates</span></div>
                    </div>
                    <div class="fin-table-wrap">
                        ${rows.length ? `
                            <table class="fin-table fin-table--compact">
                                <thead><tr><th>Source</th><th>Status</th><th>Expected / paid</th><th>Confidence</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>
                                <tbody>
                                    ${rows.map((row) => `
                                        <tr>
                                            <td>${escapeHtml(row.title)}${row.settlementAccount ? `<small>${escapeHtml(row.settlementAccount)}</small>` : ''}</td>
                                            <td>${renderStatusPill(row.status)}</td>
                                            <td>${row.expectedDateISO ? formatShortDate(row.expectedDateISO) : 'No date'}</td>
                                            <td>${Math.round(row.probability * 100)}%</td>
                                            <td style="text-align:right">${formatCurrency(row.amount)}</td>
                                            <td style="text-align:right">
                                                ${row.status === 'paid' ? '' : `
                                                    <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'income', '${escapeActionArg(row.id)}'">Edit</button>
                                                    <button class="fin-mini-btn" type="button" data-action="markAsPaid" data-action-args="'${escapeActionArg(row.id)}'">Received</button>
                                                `}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : renderCompactEmpty('No invoices or expected income yet. Add one expected payment to make cashflow planning useful.')}
                    </div>
                </div>
            </section>
        `;
    }

    function renderReportsSection() {
        const rhythmData = buildCashflowRhythmData();
        const totalCash = treasuryNumber('totalCash', Number(currentSnapshot && currentSnapshot.realBalance) || 0);
        const reservedCash = treasuryNumber('reservedCash', Number(currentSnapshot && currentSnapshot.reservedCash) || 0);
        const availableCash = treasuryNumber('trulyAvailableCash', totalCash - reservedCash);
        const reserveShare = totalCash > 0 ? Math.round((reservedCash / totalCash) * 100) : 0;
        const health = resolveFinancialHeroSignal();
        return `
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Financial Health</div>
                        <div class="fin-health-status ${health.tone}">
                            <span>Status</span>
                            <strong>${escapeHtml(health.text)}</strong>
                            <small>${currentMetrics && currentMetrics.stressLevel ? `Stress level ${escapeHtml(currentMetrics.stressLevel)}` : 'Add core inputs for a clearer reading.'}</small>
                        </div>
                        <ul class="fin-advice-list">
                            ${buildStrategicAdviceItems().slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Reserve Pattern</div>
                        <div class="fin-status-grid">
                            <div class="fin-status-card"><span>Available</span><strong>${formatCurrency(availableCash)}</strong><span>After reserves</span></div>
                            <div class="fin-status-card"><span>Reserved</span><strong>${formatCurrency(reservedCash)}</strong><span>${reserveShare}% of total cash</span></div>
                        </div>
                        ${renderCashflowRhythm(rhythmData)}
                    </div>
                </div>
            </section>
            ${renderScenarioOutcomes()}
        `;
    }

    function renderObservatoryHeader() {
        const reviewCount = treasuryArray('reviewQueue').length;
        return `
            <section class="fin-section">
                <div class="fin-ui-toolbar">
                    <div>
                        <div class="fin-ui-toolbar-copy">Local-first finance cockpit. Start with what is true now, what needs attention, and what to do next.</div>
                        <div class="fin-operating-meta">Last updated ${formatShortDate(currentDiagnostics.latestEventTimestamp)} · Last reviewed ${formatShortDate(currentReview && currentReview.lastReviewedAt)} · ${reviewCount} unresolved review item${reviewCount === 1 ? '' : 's'}</div>
                    </div>
                    <div class="fin-toolbar-actions">
                        <select id="fin-scope-filter" class="fin-scope-filter" aria-label="Treasury scope">${scopeFilterOptions(window.Store.getUiSettings().scopeFilter || 'all')}</select>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'quickAdd'">Add entry</button>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">Monthly review</button>
                    </div>
                </div>
            </section>
        `;
    }

    function renderTreasurySnapshot() {
        const totalCash = treasuryNumber('totalCash', Number(currentSnapshot && currentSnapshot.realBalance) || 0);
        const reservedCash = treasuryNumber('reservedCash', Number(currentSnapshot && currentSnapshot.reservedCash) || 0);
        const availableCash = treasuryNumber('trulyAvailableCash', totalCash - reservedCash);
        const monthlyBurn = treasuryNumber('totalMonthlyBurn', Number(currentSnapshot && currentSnapshot.monthlyBurn) || 0);
        const scenarios = currentTreasury && currentTreasury.incomeScenarios || {};
        const expectedMonthEnd = Number.isFinite(Number(scenarios.expected))
            ? Number(scenarios.expected)
            : Number(currentSnapshot && currentSnapshot.projectedBalance) || availableCash;
        const runway = currentTreasury && currentTreasury.runwayMonths != null
            ? currentTreasury.runwayMonths
            : currentSnapshot.runwayMonths;
        const runwayLabel = runway == null ? 'Unknown' : `${Number(runway).toFixed(1)} mo`;
        const runwayClass = runway == null || Number(runway) < 3 ? 'stress-high' : (Number(runway) < 6 ? 'stress-medium' : 'stress-low');
        const runwayCopy = monthlyBurn > 0
            ? `Runway = actually available / monthly burn = ${formatCurrency(availableCash)} / ${formatCurrency(monthlyBurn)}`
            : 'Runway unknown until recurring costs are added.';
        return `
            <section class="fin-section">
                <div class="fin-snapshot-grid fin-snapshot-grid--treasury">
                    <div class="widget ui-card glass fin-tile fin-tile-primary">
                        <div class="fin-tile-label">Actually available</div>
                        <div class="fin-tile-value">${currentHasFinanceData ? formatCurrency(availableCash) : '—'}</div>
                        <div class="fin-tile-subline">Total cash minus reserved buckets</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Total cash</div>
                        <div class="fin-tile-value">${currentHasFinanceData ? formatCurrency(totalCash) : '—'}</div>
                        <div class="fin-tile-subline">All active cash accounts</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Reserved</div>
                        <div class="fin-tile-value">${currentHasFinanceData ? formatCurrency(reservedCash) : '—'}</div>
                        <div class="fin-tile-subline">Actually available = total cash - reserved</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Expected month-end</div>
                        <div class="fin-tile-value">${currentHasFinanceData ? formatCurrency(expectedMonthEnd) : '—'}</div>
                        <div class="fin-tile-subline">Confirmed + likely income minus scheduled obligations</div>
                    </div>
                    <div class="widget ui-card glass fin-tile fin-tile-runway">
                        <div class="fin-tile-label">Runway</div>
                        <div class="fin-tile-value ${runwayClass}">${runwayLabel}</div>
                        <div class="fin-tile-subline">${escapeHtml(runwayCopy)}</div>
                    </div>
                </div>
            </section>
        `;
    }

    function renderCashReserveBurnRow() {
        const buckets = treasuryArray('reserveBuckets')
            .filter((bucket) => ['tax_reserve', 'vat_reserve', 'health_insurance', 'debt_repayment', 'buffer'].includes(String(bucket.bucket)));
        const visibleBuckets = buckets.filter((bucket) => Number(bucket.amount) > 0);
        const totalCash = treasuryNumber('totalCash', Number(currentSnapshot && currentSnapshot.realBalance) || 0);
        const reservedCash = treasuryNumber('reservedCash', Number(currentSnapshot && currentSnapshot.reservedCash) || 0);
        const availableCash = treasuryNumber('trulyAvailableCash', totalCash - reservedCash);
        const monthlyBurn = treasuryNumber('totalMonthlyBurn', Number(currentSnapshot && currentSnapshot.monthlyBurn) || 0);
        const runway = currentTreasury && currentTreasury.runwayMonths != null
            ? currentTreasury.runwayMonths
            : currentSnapshot.runwayMonths;
        return `
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Cash & Reserves</div>
                        <div class="fin-helper-text">Actually available = total active cash minus reserved buckets.</div>
                        <div class="fin-status-grid">
                            <div class="fin-status-card"><span>Total cash</span><strong>${formatCurrency(totalCash)}</strong><span>All active cash accounts</span></div>
                            <div class="fin-status-card"><span>Reserved</span><strong>${formatCurrency(reservedCash)}</strong><span>Taxes, VAT, health, debt, buffer</span></div>
                            <div class="fin-status-card"><span>Actually available</span><strong>${formatCurrency(availableCash)}</strong><span>Usable after reserves</span></div>
                        </div>
                        ${visibleBuckets.length ? `
                            <div class="fin-reserve-grid">
                                ${visibleBuckets.map((bucket) => `
                                    <div class="fin-reserve-item">
                                        <span>${escapeHtml(bucket.label)}</span>
                                        <strong>${formatCurrency(bucket.amount)}</strong>
                                    </div>
                                `).join('')}
                            </div>
                        ` : renderCompactEmpty('No reserve buckets configured yet. Add a reserve account when money is already spoken for.')}
                        <button class="fin-action-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'fiatAccount'">Add or adjust reserve account</button>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Monthly Burn & Runway</div>
                        <div class="fin-helper-text">${monthlyBurn > 0 ? 'Runway = actually available / monthly burn.' : 'Runway unknown until recurring costs are added.'}</div>
                        <div class="fin-status-grid">
                            <div class="fin-status-card"><span>Personal burn</span><strong>${formatCurrency(treasuryNumber('monthlyPersonalBurn'))}</strong><span>Monthly recurring personal costs</span></div>
                            <div class="fin-status-card"><span>Business burn</span><strong>${formatCurrency(treasuryNumber('monthlyBusinessBurn'))}</strong><span>Monthly recurring business costs</span></div>
                            <div class="fin-status-card"><span>Runway</span><strong>${runway == null ? 'Unknown' : `${Number(runway).toFixed(1)} mo`}</strong><span>${monthlyBurn > 0 ? `${formatCurrency(availableCash)} / ${formatCurrency(monthlyBurn)}` : 'Add recurring costs to calculate'}</span></div>
                        </div>
                        <button class="fin-action-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Add or review recurring costs</button>
                    </div>
                </div>
            </section>
        `;
    }

    function renderActionThisWeek() {
        const summary = currentTreasury && currentTreasury.dashboardSummary && currentTreasury.dashboardSummary.actionThisWeek || {};
        const items = safeArray(summary.items);
        const reviewDue = isWeeklyReviewDue();
        const rows = [
            ...items,
            ...(reviewDue ? [{
                kind: 'weekly_review',
                id: 'weekly-review',
                title: 'Weekly review',
                reason: 'Reconcile cash accounts and close the operating loop',
                actionLabel: 'Start review',
                tone: 'review'
            }] : [])
        ].slice(0, 7);
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Attention Needed</div>
                            <div class="fin-helper-text">${rows.length ? `${rows.length} next best action${rows.length === 1 ? '' : 's'} need a decision, classification, or check.` : 'No action required this week. Keep the next review rhythm.'}</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'review'">Open Monthly Review</button>
                    </div>
                    ${rows.length ? rows.map((item) => `
                        <div class="modal-list-row">
                            <span><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.reason)} · ${escapeHtml(item.kind || 'review')}</small></span>
                            <span>${renderStatusPill(item.tone === 'urgent' ? 'overdue' : 'needs_review')}</span>
                            <span class="goal-modal-actions">${renderDashboardAction(item)}</span>
                        </div>
                    `).join('') : renderCompactEmpty('No action required this week.')}
                </div>
            </section>
        `;
    }

    function renderDashboardAction(item) {
        if (String(item && item.kind) === 'weekly_review') {
            return `<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">Start review</button>`;
        }
        return renderReviewQueueActions(item);
    }

    function renderNext30Days() {
        const next30 = currentTreasury && currentTreasury.dashboardSummary && currentTreasury.dashboardSummary.next30Days || {};
        const net = Number(next30.projectedNetMovement) || 0;
        const netClass = net < 0 ? 'fin-val-neg' : 'fin-val-pos';
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Next 30 Days</div>
                            <div class="fin-helper-text">Confirmed incoming + weighted expected income - obligations due in the next 30 days.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'planning'">Open Planning</button>
                    </div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card"><span>Confirmed incoming</span><strong>${formatCurrency(next30.confirmedIncoming)}</strong><span>Confirmed pipeline due soon</span></div>
                        <div class="fin-status-card"><span>Expected weighted</span><strong>${formatCurrency(next30.expectedWeightedIncoming)}</strong><span>Expected income × probability</span></div>
                        <div class="fin-status-card"><span>Obligations due</span><strong>${formatCurrency(next30.obligationsDue)}</strong><span>${Number(next30.obligationCount || 0)} upcoming item${Number(next30.obligationCount || 0) === 1 ? '' : 's'}</span></div>
                        <div class="fin-status-card"><span>Projected net movement</span><strong class="${netClass}">${formatCurrency(net)}</strong><span>Before risky income</span></div>
                    </div>
                </div>
            </section>
        `;
    }

    function renderIncomePipeline() {
        const income = treasuryArray('income');
        const groups = ['confirmed', 'expected', 'risky'];
        const totals = groups.reduce((acc, status) => {
            acc[status] = income
                .filter((entry) => String(entry.status) === status)
                .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
            return acc;
        }, {});
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Income Pipeline</div>
                            <div class="fin-helper-text">Classify future income by decision quality, not optimism.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'income'">Add income</button>
                    </div>
                    <div class="fin-status-grid">
                        ${groups.map((status) => `
                            <div class="fin-status-card">
                                ${renderStatusPill(status)}
                                <strong>${formatCurrency(totals[status])}</strong>
                                <span>This month: ${formatCurrency(Number(currentTreasury?.incomeThisMonth?.[status]) || 0)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="fin-table-wrap">
                        ${income.length ? `
                            <table class="fin-table fin-table--compact">
                                <thead><tr><th>Source</th><th>Status</th><th>Due</th><th>Amount</th><th style="text-align:right">Actions</th></tr></thead>
                                <tbody>
                                    ${income.slice(0, 8).map((entry) => `
                                        <tr>
                                            <td>${escapeHtml(entry.title)}</td>
                                            <td>${renderStatusPill(entry.status)}</td>
                                            <td>${entry.dueDate ? formatShortDate(entry.dueDate) : 'No date'}</td>
                                            <td>${formatCurrency(entry.amount)}</td>
                                            <td style="text-align:right">
                                                <button class="fin-mini-btn" data-action="FinancialMode.openAddModal" data-action-args="'income', '${escapeActionArg(entry.id)}'">Edit</button>
                                                <button class="fin-mini-btn" data-action="markAsPaid" data-action-args="'${escapeActionArg(entry.id)}'">Received</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : renderCompactEmpty('No future income has been added yet.')}
                    </div>
                </div>
            </section>
        `;
    }

    function renderObligations() {
        const overdue = treasuryArray('overdueObligations');
        const dueSoon = treasuryArray('dueSoonObligations');
        const upcoming = treasuryArray('upcomingObligations');
        const paid = treasuryArray('paidObligations');
        const obligations = overdue.concat(dueSoon).concat(upcoming).slice(0, 5);
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Obligations</div>
                            <div class="fin-helper-text">Costs that are already spoken for. Overdue first, then the next 90 days.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'review'">Open Review</button>
                    </div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card">${renderStatusPill('overdue')}<strong>${overdue.length}</strong><span>${formatCurrency(overdue.reduce((sum, item) => sum + Number(item.amount || 0), 0))}</span></div>
                        <div class="fin-status-card">${renderStatusPill('due_soon')}<strong>${dueSoon.length}</strong><span>Within 7 days</span></div>
                        <div class="fin-status-card">${renderStatusPill('upcoming')}<strong>${upcoming.length}</strong><span>Next 90 days</span></div>
                        <div class="fin-status-card">${renderStatusPill('paid')}<strong>${paid.length}</strong><span>Reviewed payments</span></div>
                    </div>
                    ${obligations.length ? obligations.map((entry) => `
                        <div class="modal-list-row">
                            <span><strong>${escapeHtml(entry.title)}</strong><br><small>${entry.dueDate ? formatShortDate(entry.dueDate) : 'No due date'} · ${escapeHtml(entry.scope || 'shared')}</small></span>
                            <span>${renderStatusPill(entry.status)} ${formatCurrency(entry.amount)}</span>
                        </div>
                    `).join('') : renderCompactEmpty('Add recurring costs or debt items to see upcoming obligations.')}
                    ${overdue.length + dueSoon.length + upcoming.length > obligations.length ? '<div class="fin-helper-text">Open Review to resolve the full obligation queue.</div>' : ''}
                </div>
            </section>
        `;
    }

    function renderReviewQueue() {
        const queue = treasuryArray('reviewQueue');
        const reviewDue = isWeeklyReviewDue();
        const unresolvedCount = queue.length;
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Review Queue</div>
                            <div class="fin-helper-text">${unresolvedCount} unresolved · Only items that need a classification, decision, or check.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">${reviewDue ? 'Start review' : 'Open review'}</button>
                    </div>
                    ${queue.length ? queue.map((item) => `
                        <div class="modal-list-row">
                            <span><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.reason)} · ${escapeHtml(item.kind || 'review')}</small></span>
                            <span>${renderStatusPill(item.tone === 'urgent' ? 'overdue' : 'needs_review')}</span>
                            <span class="goal-modal-actions">${renderReviewQueueActions(item)}</span>
                        </div>
                    `).join('') : renderCompactEmpty('Nothing needs review right now.')}
                </div>
            </section>
        `;
    }

    function renderReviewQueueActions(item) {
        const kind = String(item && item.kind || 'setup');
        const id = escapeActionArg(item && (item.targetId || item.id) || '');
        if (kind === 'transaction') {
            return `<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${id}'">Categorize</button>`;
        }
        if (kind === 'payment') {
            return `
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'paymentMatch', '${id}'">Match</button>
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${id}'">Categorize</button>
            `;
        }
        if (kind === 'pipeline') {
            return `
                <button class="fin-mini-btn" type="button" data-action="markAsPaid" data-action-args="'${id}'">Received</button>
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'pipelineReview', '${id}'">Update</button>
                <button class="fin-mini-btn" type="button" data-action="cancelPipelineFromReview" data-action-args="'${id}'">Cancel</button>
            `;
        }
        if (kind === 'debt') {
            return `<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'debtPlan', '${id}'">Add plan</button>`;
        }
        if (kind === 'obligation') {
            return `
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'obligationPayment', '${id}'">Mark paid</button>
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'obligationDefer', '${id}'">Defer</button>
                <button class="fin-mini-btn" type="button" data-action="markObligationNeedsReview" data-action-args="'${id}'">Review</button>
            `;
        }
        if (String(item && item.id) === 'missing-cash') {
            return `<button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'fiatAccount'">Add account</button>`;
        }
        if (String(item && item.id) === 'missing-burn') {
            return `<button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Add cost</button>`;
        }
        return `<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">${escapeHtml(item && item.actionLabel || 'Review')}</button>`;
    }

    function renderObligationReviewSection() {
        const obligations = treasuryArray('obligations')
            .filter((entry) => ['overdue', 'due_soon', 'needs_review'].includes(String(entry && entry.status || '')))
            .slice(0, 12);
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Expected Obligations</div>
                            <div class="fin-helper-text">Resolve due costs here: pay, defer, or keep them flagged for review.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Add recurring cost</button>
                    </div>
                    ${obligations.length ? obligations.map((entry) => `
                        <div class="modal-list-row">
                            <span><strong>${escapeHtml(entry.title)}</strong><br><small>${entry.dueDate ? formatShortDate(entry.dueDate) : 'No due date'} · ${escapeHtml(entry.scope || 'shared')}</small></span>
                            <span>${renderStatusPill(entry.status)} ${formatCurrency(entry.amount)}</span>
                            <span class="goal-modal-actions">
                                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'obligationPayment', '${escapeActionArg(entry.id)}'">Mark paid</button>
                                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'obligationDefer', '${escapeActionArg(entry.id)}'">Defer</button>
                                <button class="fin-mini-btn" type="button" data-action="markObligationNeedsReview" data-action-args="'${escapeActionArg(entry.id)}'">Review</button>
                            </span>
                        </div>
                    `).join('') : renderCompactEmpty('No overdue or due-soon obligations need action.')}
                </div>
            </section>
        `;
    }

    function renderPaymentReviewSection() {
        const payments = safeArray(currentData && currentData.transactions)
            .filter((entry) => String(entry && entry.type) === 'expense.recorded')
            .slice(0, 8);
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Actual Payments</div>
                            <div class="fin-helper-text">Payments booked into the ledger. Matched payments are tied to an obligation; the rest are review material.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transaction'">Add payment</button>
                    </div>
                    ${payments.length ? payments.map((entry) => {
                const matched = Boolean(entry.obligationId);
                return `
                        <div class="modal-list-row">
                            <span><strong>${escapeHtml(entry.description || 'Payment')}</strong><br><small>${formatShortDate(entry.timestamp)} · ${escapeHtml(entry.accountName || 'Account')} · ${escapeHtml(entry.categoryId || 'uncategorized')}</small></span>
                            <span>${renderStatusPill(matched ? 'paid' : 'needs_review')} ${formatCurrency(entry.amount, entry.currency)}</span>
                            <span class="goal-modal-actions">
                                ${matched ? '' : `<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'paymentMatch', '${escapeActionArg(entry.id)}'">Match</button>`}
                                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${escapeActionArg(entry.id)}'">Categorize</button>
                            </span>
                        </div>
                    `;
            }).join('') : renderCompactEmpty('No actual payments have been booked yet.')}
                </div>
            </section>
        `;
    }

    function renderScenarioOutcomes() {
        const scenarios = currentTreasury && currentTreasury.incomeScenarios || {};
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="widget-title ui-title">Scenarios</div>
                    <div class="fin-helper-text">Three readable forecasts for the current horizon: conservative, realistic, and optimistic.</div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card">
                            <span class="fin-muted">Conservative</span>
                            <strong>${formatCurrency(scenarios.conservative)}</strong>
                            <span>Confirmed income only</span>
                        </div>
                        <div class="fin-status-card">
                            <span class="fin-muted">Realistic</span>
                            <strong>${formatCurrency(scenarios.expected)}</strong>
                            <span>Confirmed + expected</span>
                        </div>
                        <div class="fin-status-card">
                            <span class="fin-muted">Optimistic</span>
                            <strong>${formatCurrency(scenarios.optimistic)}</strong>
                            <span>Confirmed + expected + risky</span>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    function renderLeanRecords() {
        return `
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Cash Accounts</div>
                        ${safeArray(currentData && currentData.fiatAccounts).length ? safeArray(currentData && currentData.fiatAccounts).map((account) => `
                            <div class="modal-list-row">
                                <span><strong>${escapeHtml(account.name)}</strong><br><small>${escapeHtml(account.bucket || 'available')} · ${escapeHtml(account.scope || 'shared')}</small></span>
                                <span>${formatCurrency(account.balance)}</span>
                            </div>
                        `).join('') : renderCompactEmpty('No cash accounts yet.')}
                        <button class="fin-action-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'fiatAccount'">Add cash account</button>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Recurring Costs & Debt</div>
                        ${safeArray(currentData && currentData.recurringExpenses).slice(0, 5).map((expense) => `
                            <div class="modal-list-row">
                                <span><strong>${escapeHtml(expense.category)}</strong><br><small>Due day ${escapeHtml(expense.dueDay)} · ${escapeHtml(expense.scope || 'shared')}</small></span>
                                <span>${formatCurrency(expense.monthlyAmount)}</span>
                            </div>
                        `).join('') || renderCompactEmpty('No recurring costs yet.')}
                        ${treasuryNumber('debtRemaining') > 0 ? `<div class="fin-subdivider"></div><div class="modal-list-row"><span><strong>Debt remaining</strong><br><small>Tracked debt items</small></span><span>${formatCurrency(treasuryNumber('debtRemaining'))}</span></div>` : ''}
                        <div class="fin-action-row">
                            <button class="fin-action-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Add cost</button>
                            <button class="fin-action-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtAdd'">Add debt</button>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    function renderSnapshot(focusMode) {
        const stressClass = `stress-${String(currentMetrics.stressLevel || '').toLowerCase()}`;
        const stressKey = String(currentMetrics.stressLevel || '').toLowerCase();
        const stressText = stressKey === 'low' ? 'Steady' : (stressKey === 'medium' ? 'Mixed' : (stressKey === 'high' ? 'Thin' : String(currentMetrics.stressLevel || '—')));
        const runwayLabel = currentHasFinanceData && currentSnapshot.runwayMonths != null ? `${Number(currentSnapshot.runwayMonths).toFixed(1)} mo` : '—';
        const burnLabel = currentHasFinanceData && currentSnapshot.monthlyBurn != null ? formatCurrency(currentSnapshot.monthlyBurn) : '—';
        const confidence = confidenceLabel(currentSnapshot.confidenceScore);
        const missing = Array.isArray(currentSnapshot.missingInputs) && currentSnapshot.missingInputs.length
            ? currentSnapshot.missingInputs.join(', ')
            : '—';
        const horizonText = runwayLabel === '—'
            ? 'Runway is unknown until burn and recurring costs are noted.'
            : (Number(currentSnapshot.runwayMonths) < 2
                ? 'Runway is very thin. Consider protecting cash and easing burn.'
                : (Number(currentSnapshot.runwayMonths) < 4
                    ? 'Runway is thin. It may help to favor steadier income this cycle.'
                    : 'Runway looks steady. Keep reconciling as you go.'));
        const reviewDue = isWeeklyReviewDue();

        return `
            <section class="fin-section">
                <div class="fin-ui-toolbar">
                    <div>
                        <div class="fin-ui-toolbar-copy">A quieter view, without losing the truth.</div>
                        <div class="fin-operating-meta">Last updated ${formatShortDate(currentDiagnostics.latestEventTimestamp)} · Last reviewed ${formatShortDate(currentReview && currentReview.lastReviewedAt)}</div>
                    </div>
                    <div class="fin-toolbar-actions">
                        <select id="fin-scope-filter" class="fin-scope-filter" aria-label="Treasury scope">${scopeFilterOptions(window.Store.getUiSettings().scopeFilter || 'all')}</select>
                        <button class="fin-focus-toggle ${focusMode ? 'active' : ''}" type="button" data-fin-action="toggle-focus-mode">
                            <span aria-hidden="true">◐</span>
                            <span>${focusMode ? 'Exit quiet view' : 'Quiet view'}</span>
                        </button>
                    </div>
                </div>
                <div class="fin-snapshot-grid">
                    <div class="widget ui-card glass fin-tile">
                        <div class="drag-handle">⋮⋮</div>
                        <div class="fin-tile-label">Real Balance</div>
                        <div class="fin-tile-value">${currentHasFinanceData ? formatCurrency(currentSnapshot.realBalance) : '—'}</div>
                        <div class="fin-tile-subline">Ledger-derived live assets</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="drag-handle">⋮⋮</div>
                        <div class="fin-tile-label">Monthly Burn</div>
                        <div class="fin-tile-value">${burnLabel}</div>
                        <div class="fin-tile-subline">Break-even: ${formatCurrency(currentSnapshot.breakEvenRevenue)}</div>
                    </div>
                    <div class="widget ui-card glass fin-tile fin-tile-runway">
                        <div class="drag-handle">⋮⋮</div>
                        <div class="fin-tile-label">Runway</div>
                        <div class="fin-tile-value ${stressClass}">${runwayLabel}</div>
                        <div class="fin-tile-subline">Time is safety · <span class="${stressClass}">${stressText}</span></div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="drag-handle">⋮⋮</div>
                        <div class="fin-tile-label">Confidence</div>
                        <div class="fin-tile-value">${currentHasFinanceData ? confidence : '—'}</div>
                        <div class="fin-tile-subline">${currentHasFinanceData ? Math.round((Number(currentSnapshot.confidenceScore) || 0) * 100) + '% · Missing: ' + missing : '—'}</div>
                    </div>
                </div>
                <div class="widget ui-card glass fin-card fin-liquidity-panel">
                    <div class="widget-title ui-title">Liquidity Horizon</div>
                    <div class="fin-liquidity-copy">${horizonText}</div>
                    <div class="fin-liquidity-actions">
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Review recurring costs</button>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">Open weekly review</button>
                    </div>
                </div>
                ${reviewDue ? `
                    <div class="widget ui-card glass fin-card fin-review-prompt">
                        <div>
                            <div class="widget-title ui-title">Weekly review due</div>
                            <div class="fin-helper-text">Reconcile cash accounts, scan costs and pipeline, then leave one note for the week ahead.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">Start review</button>
                    </div>
                ` : ''}
            </section>
        `;
    }

    function isWeeklyReviewDue() {
        const reviewed = Date.parse(String(currentReview && currentReview.lastReviewedAt || ''));
        return !Number.isFinite(reviewed) || Date.now() - reviewed >= 7 * 24 * 60 * 60 * 1000;
    }

    function renderSetupChecklist() {
        const steps = [
            { label: 'Choose currency', done: Boolean(window.Store.getFinanceSettings().baseCurrency), type: 'settings' },
            { label: 'Add current balance', done: safeArray(currentData && currentData.fiatAccounts).length > 0, type: 'fiatAccount' },
            { label: 'Separate reserve money', done: treasuryNumber('reservedCash') > 0, type: 'fiatAccount' },
            { label: 'Note fixed monthly costs', done: safeArray(currentData && currentData.recurringExpenses).length > 0, type: 'expense' },
            { label: 'Add expected income', done: getActivePipelineDeals().length > 0, type: 'income' },
            { label: 'Run first review', done: Boolean(currentReview && currentReview.lastReviewedAt), type: 'weeklyReview' }
        ];
        const complete = steps.every((step) => step.done);
        if (complete) return '';
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-setup-card">
                    <div class="widget-title ui-title">Start with a clear baseline</div>
                    <div class="fin-helper-text">Set the essentials once: currency, current cash, money already reserved, fixed costs, expected income, and first review. Your data stays on this device.</div>
                    <div class="fin-setup-grid">
                        ${steps.map((step) => `
                            <button class="fin-setup-step ${step.done ? 'is-complete' : ''}" type="button" data-action="openEditModal" data-action-args="'${step.type}'"${step.done ? ' disabled' : ''}>
                                <span>${step.done ? '✓' : '○'}</span><span>${step.label}</span>
                            </button>
                        `).join('')}
                        <button class="fin-setup-step" type="button" data-action="openEditModal" data-action-args="'csvImport'"><span>↥</span><span>Import a CSV statement</span></button>
                        <button class="fin-setup-step" type="button" data-action="exportFinanceBackup"><span>↧</span><span>Export first backup</span></button>
                    </div>
                </div>
            </section>
        `;
    }

    function buildCashCalendar(days = 90) {
        const start = new Date();
        start.setHours(12, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + days);
        const events = [];

        safeArray(currentData && currentData.recurringExpenses).forEach((expense) => {
            for (let monthOffset = 0; monthOffset < 4; monthOffset += 1) {
                const due = new Date(start.getFullYear(), start.getMonth() + monthOffset, Math.max(1, Math.min(28, Number(expense.dueDay) || 1)), 12);
                if (due < start || due > end) continue;
                events.push({ date: due, label: expense.category, amount: -(Number(expense.monthlyAmount) || 0), kind: 'Cost' });
            }
        });

        getActivePipelineDeals().forEach((deal) => {
            const date = new Date(deal.expectedDateISO || '');
            if (!Number.isFinite(date.getTime()) || date < start || date > end) return;
            events.push({ date, label: deal.title, amount: (Number(deal.value) || 0) * (Number(deal.probability) || 0), kind: 'Expected income' });
        });

        events.sort((a, b) => a.date - b.date);
        const lows = [30, 60, 90].map((horizon) => {
            const horizonEnd = new Date(start);
            horizonEnd.setDate(horizonEnd.getDate() + horizon);
            let balance = Number(currentSnapshot && currentSnapshot.realBalance) || 0;
            let low = balance;
            events.filter((entry) => entry.date <= horizonEnd).forEach((entry) => {
                balance += entry.amount;
                low = Math.min(low, balance);
            });
            return { horizon, low };
        });
        return { events, lows };
    }

    function renderCashCalendar() {
        const calendar = buildCashCalendar();
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-calendar-card">
                    <div class="widget-title ui-title">Cash Calendar</div>
                    <div class="fin-helper-text">Upcoming obligations and probability-weighted income. Start with the next material moments.</div>
                    <div class="fin-calendar-lows">
                        ${calendar.lows.map((entry) => `<div><span>${entry.horizon}d low</span><strong>${formatCurrency(entry.low)}</strong></div>`).join('')}
                    </div>
                    <div class="fin-calendar-events">
                        ${calendar.events.length ? calendar.events.slice(0, 3).map((entry) => `
                            <div class="fin-calendar-event">
                                <span><strong>${entry.label}</strong><small>${entry.kind} · ${formatShortDate(entry.date)}</small></span>
                                <span class="${entry.amount >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${entry.amount >= 0 ? '+' : '-'}${formatCurrency(Math.abs(entry.amount))}</span>
                            </div>
                        `).join('') : renderCompactEmpty('Add recurring costs or pipeline income to shape your cash calendar.')}
                    </div>
                </div>
            </section>
        `;
    }

    function renderGoals() {
        const scope = window.Store.getUiSettings().scopeFilter || 'all';
        const goals = typeof window.Store.getGoalProgress === 'function'
            ? window.Store.getGoalProgress(scope)
            : [];
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-goals-card">
                    <div class="fin-goals-heading">
                        <div>
                            <div class="widget-title ui-title">Savings and Buffer Goals</div>
                            <div class="fin-helper-text">Live progress from linked cash accounts. Keep the targets few and useful.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'${goals.length ? 'goals' : 'goal'}'">${goals.length ? 'Manage goals' : 'Add goal'}</button>
                    </div>
                    ${goals.length ? `
                        <div class="fin-goals-grid">
                            ${goals.map((goal) => `
                                <div class="fin-goal-item">
                                    <div class="fin-goal-meta">
                                        <span><strong>${escapeHtml(goal.name)}</strong><small>${escapeHtml(goal.type)} · ${escapeHtml(goal.scope)}${goal.targetDate ? ' · by ' + formatShortDate(goal.targetDate) : ''}</small></span>
                                        <span>${Math.round(goal.progressPercent)}%</span>
                                    </div>
                                    <div class="fin-goal-track"><span style="width:${goal.progressPercent}%"></span></div>
                                    <div class="fin-goal-values"><span>${formatCurrency(goal.currentAmount)}</span><span>of ${formatCurrency(goal.targetAmount)}</span></div>
                                </div>
                            `).join('')}
                        </div>
                    ` : renderCompactEmpty('Add a safety buffer or savings target when you are ready.')}
                </div>
            </section>
        `;
    }

    function computeHybridTotals() {
        const fiatTotal = safeArray(currentData && currentData.fiatAccounts)
            .reduce((sum, account) => sum + (Number(account && account.balance) || 0), 0);
        const liabilities = Math.max(0, Number(currentSnapshot && currentSnapshot.totalDebt) || 0);
        return {
            fiatTotal,
            liabilities,
            availableCash: Number(currentSnapshot && currentSnapshot.trulyAvailableCash) || fiatTotal,
            reservedCash: Number(currentSnapshot && currentSnapshot.reservedCash) || 0
        };
    }

    function renderHybridTreasury() {
        const totals = computeHybridTotals();
        const liabilitiesLabel = totals.liabilities > 0 ? `-${formatCurrency(totals.liabilities)}` : formatCurrency(0);
        return `
            <section class="fin-section">
                <div class="fin-ledger-grid">
                    <div class="widget ui-card glass fin-card">
                        <div class="drag-handle">⋮⋮</div>
                        <div class="widget-title ui-title">Cash Position</div>
                        <div class="fin-stack-lg">
                            ${renderAllocationItem('Available', totals.availableCash, 'safe')}
                            ${renderAllocationItem('Reserved', totals.reservedCash, 'growth')}
                            ${renderAllocationItem('Debt', totals.liabilities, 'spec')}
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="drag-handle">⋮⋮</div>
                        <div class="widget-title ui-title">Treasury Summary</div>
                        <div class="fin-summary-grid">
                            <div class="fin-summary-row">
                                <span class="fin-muted">Total Cash</span>
                                <span>${formatCurrency(totals.fiatTotal)}</span>
                            </div>
                            <div class="fin-summary-row">
                                <span class="fin-muted">Debt Remaining</span>
                                <span class="fin-val-neg">${liabilitiesLabel}</span>
                            </div>
                            <hr class="fin-divider">
                            <div class="fin-summary-row fin-summary-row--strong">
                                <span>Truly Available</span>
                                <span>${formatCurrency(totals.availableCash)}</span>
                            </div>
                            <div class="fin-summary-row fin-summary-row--sub">
                                <span class="fin-muted">Reserved Cash</span>
                                <span>${formatCurrency(totals.reservedCash)}</span>
                            </div>
                            <div class="fin-summary-row fin-summary-row--sub">
                                <span class="fin-muted">Projected Cashflow (${window.Store.getFinanceSettings().forecastDays}d)</span>
                                <span>${formatCurrency(currentSnapshot.projectedBalance)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    function renderOperationalLedgerCard() {
        const fiatAccounts = safeArray(currentData && currentData.fiatAccounts);
        const fiatTotal = fiatAccounts.reduce((sum, account) => sum + (Number(account && account.balance) || 0), 0);

        const fiatBody = fiatAccounts.length
            ? `
                <table class="fin-table fin-table--compact">
                    <thead><tr><th>Name</th><th>Balance</th><th style="text-align:right">Actions</th></tr></thead>
                    <tbody>
                        ${fiatAccounts.map((account) => `
                            <tr>
                                <td>${account.name}</td>
                                <td>${formatCurrency(account.balance, account.currency)}</td>
                                <td style="text-align:right">
                                    <button class="fin-mini-btn" data-action="FinancialMode.openAddModal" data-action-args="'fiatAccount', '${escapeActionArg(account.id)}'" title="Edit">${renderSAGGlyph('edit', { size: 'xs', tone: 'muted' })}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `
            : renderCompactEmpty('No accounts yet.');

        return `
                <div class="widget ui-card glass fin-card">
                    <div class="drag-handle">⋮⋮</div>
                    <div class="widget-title ui-title">Cash Accounts</div>
                    ${renderCollapsible(
                'fiat-accounts',
                'Accounts',
                `${pluralize(fiatAccounts.length, 'account')} · ${formatCurrency(fiatTotal)} total`,
                `${fiatBody}
                <button class="fin-action-btn" data-action="FinancialMode.openAddModal" data-action-args="'fiatAccount'">+ Add Account</button>`
            )}
                </div>
        `;
    }

    function renderInvestmentsStrategiesCard() {
        const recurringExpenses = safeArray(currentData && currentData.recurringExpenses);
        const debtAccounts = safeArray(currentData && currentData.debtAccounts);
        const recurringTotal = recurringExpenses.reduce((sum, expense) => sum + (Number(expense && expense.monthlyAmount) || 0), 0);
        const debtTotal = debtAccounts.reduce((sum, debt) => sum + (Number(debt && debt.outstanding) || 0), 0);

        const recurringBody = recurringExpenses.length
            ? `
                <table class="fin-table fin-table--compact">
                    <thead><tr><th>Category</th><th>Amount</th><th>Type</th><th style="text-align:right">Actions</th></tr></thead>
                    <tbody>
                        ${recurringExpenses.map((expense) => `
                            <tr>
                                <td>${expense.category}</td>
                                <td>${formatCurrency(expense.monthlyAmount)}</td>
                                <td>${expense.essential ? 'Essential' : 'Flex'}</td>
                                <td style="text-align:right">
                                    <button class="fin-mini-btn" data-action="FinancialMode.openAddModal" data-action-args="'expense', '${escapeActionArg(expense.id)}'" title="Edit">${renderSAGGlyph('edit', { size: 'xs', tone: 'muted' })}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `
            : renderCompactEmpty('No recurring expenses yet.');

        const debtBody = debtAccounts.length
            ? `
                <table class="fin-table fin-table--compact">
                    <thead><tr><th>Name</th><th>Outstanding</th><th style="text-align:right">Actions</th></tr></thead>
                    <tbody>
                        ${debtAccounts.map((debt) => `
                            <tr>
                                <td>${debt.name || 'Debt'}</td>
                                <td>${formatCurrency(debt.outstanding)}</td>
                                <td style="text-align:right">
                                    <button class="fin-mini-btn" data-action="FinancialMode.openAddModal" data-action-args="'debtAdd', '${escapeActionArg(debt.id)}'" title="Edit">${renderSAGGlyph('edit', { size: 'xs', tone: 'muted' })}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `
            : renderCompactEmpty('No debts tracked yet.');

        return `
                <div class="widget ui-card glass fin-card">
                    <div class="drag-handle">⋮⋮</div>
                    <div class="widget-title ui-title">Liabilities</div>
                    ${renderCollapsible(
            'recurring-expenses',
            'Recurring Expenses',
            `${pluralize(recurringExpenses.length, 'entry', 'entries')} · ${formatCurrency(recurringTotal)} / month`,
            `${recurringBody}
            <button class="fin-action-btn" data-action="FinancialMode.openAddModal" data-action-args="'expense'">+ Add Expense</button>`
        )}
                    ${renderCollapsible(
            'debt-liabilities',
            'Debt / Liabilities',
            `${pluralize(debtAccounts.length, 'liability', 'liabilities')} · ${formatCurrency(debtTotal)} outstanding`,
            `${debtBody}
            <div class="fin-action-row">
                <button class="fin-action-btn" data-action="FinancialMode.openAddModal" data-action-args="'debtAdd'">+ Add Debt</button>
                <button class="fin-action-btn" data-action="FinancialMode.openAddModal" data-action-args="'debtPayment'">Record Payment</button>
            </div>`
        )}
                </div>
        `;
    }

    function renderOperationsInvestmentsRow() {
        return `
            <section class="fin-section">
                <div class="fin-operational-row">
                    ${renderOperationalLedgerCard()}
                    ${renderInvestmentsStrategiesCard()}
                </div>
            </section>
        `;
    }

    function renderPipelineTabs() {
        const deals = getActivePipelineDeals();
        const paidHistory = safeArray(currentData && currentData.invoices)
            .filter((item) => String(item && item.status || '').toLowerCase() === 'paid')
            .sort((a, b) => new Date(b.paidAt || b.sentAt || 0) - new Date(a.paidAt || a.sentAt || 0));
        const weightedTotal = deals.reduce((sum, deal) => sum + ((Number(deal.value) || 0) * (Number(deal.probability) || 0)), 0);
        const dependencyRows = deals
            .map((deal) => ({
                title: deal.title || 'Pipeline item',
                weighted: (Number(deal.value) || 0) * (Number(deal.probability) || 0)
            }))
            .sort((a, b) => b.weighted - a.weighted)
            .slice(0, 4);
        const rhythmData = buildCashflowRhythmData();
        const tab = getPipelineTab();

        let panelHtml = '';
        if (tab === 'history') {
            panelHtml = paidHistory.length
                ? `
                    <table class="fin-table fin-table--compact">
                        <thead><tr><th>Source</th><th>Paid date</th><th>Amount</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${paidHistory.map((item) => `
                                <tr>
                                    <td>${item.client || 'Invoice'}</td>
                                    <td>${new Date(item.paidAt || item.sentAt || Date.now()).toLocaleDateString()}</td>
                                    <td>${formatCurrency(item.amount)}</td>
                                    <td style="text-align:right">
                                        <button class="fin-mini-btn" data-action="deleteInvoice" data-action-args="'${escapeActionArg(item.id)}'" title="Remove from history">×</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `
                : renderCompactEmpty('No settlements yet.');
        } else if (tab === 'cashflow') {
            panelHtml = renderCashflowRhythm(rhythmData);
        } else {
            panelHtml = `
                ${deals.length ? `
                    <table class="fin-table fin-table--compact">
                        <thead><tr><th>Source</th><th>Expected date</th><th>Amount</th><th>Prob.</th><th>Weighted</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${deals.map((deal) => `
                                <tr>
                                    <td>${deal.title || 'Pipeline item'}</td>
                                    <td>${deal.expectedDateISO}</td>
                                    <td>${formatCurrency(deal.value)}</td>
                                    <td>${(Number(deal.probability || 0) * 100).toFixed(0)}%</td>
                                    <td class="fin-val-pos">${formatCurrency((Number(deal.value) || 0) * (Number(deal.probability) || 0))}</td>
                                    <td style="text-align:right">
                                        <button class="fin-mini-btn" data-action="FinancialMode.openAddModal" data-action-args="'income', '${escapeActionArg(deal.id)}'" title="Edit">${renderSAGGlyph('edit', { size: 'xs', tone: 'muted' })}</button>
                                        <button class="fin-mini-btn" data-action="markAsPaid" data-action-args="'${escapeActionArg(deal.id)}'" title="Mark as paid">${renderSAGGlyph('success', { size: 'xs', tone: 'success' })}</button>
                                        <button class="fin-mini-btn" data-action="deleteInvoice" data-action-args="'${escapeActionArg(deal.id)}'" title="Archive">×</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : renderCompactEmpty(currentHasFinanceData ? 'No pipeline items right now.' : 'No finance data yet.')}
                ${deals.length && dependencyRows.length ? `
                    <div class="fin-tab-subsection">
                        <div class="fin-muted fin-subtitle">Dependencies</div>
                        ${dependencyRows.map((row) => {
                const share = weightedTotal > 0 ? Math.round((row.weighted / weightedTotal) * 100) : 0;
                return `<div class="fin-row-inline"><span>${row.title}</span><span class="fin-muted">${share}%</span></div>`;
            }).join('')}
                    </div>
                ` : ''}
                <button class="fin-action-btn" data-action="FinancialMode.openAddModal" data-action-args="'income'">+ Add pipeline item</button>
            `;
        }

        return `
	            <section class="fin-section">
	                <div class="widget ui-card glass fin-card">
	                    <div class="drag-handle">⋮⋮</div>
	                    <div class="widget-title ui-title">Pipeline</div>
	                    <div class="fin-tabs" role="tablist" aria-label="Pipeline tabs">
	                        <button class="fin-tab-btn ${tab === 'pipeline' ? 'active' : ''}" type="button" data-fin-action="set-tab" data-fin-tab="pipeline">Pipeline</button>
	                        <button class="fin-tab-btn ${tab === 'history' ? 'active' : ''}" type="button" data-fin-action="set-tab" data-fin-tab="history">History</button>
	                        <button class="fin-tab-btn ${tab === 'cashflow' ? 'active' : ''}" type="button" data-fin-action="set-tab" data-fin-tab="cashflow">Cashflow</button>
	                    </div>
                    <div class="fin-tab-panel">
                        ${panelHtml}
                    </div>
                </div>
            </section>
        `;
    }

    function renderProjection() {
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-projection-card">
                    <div class="drag-handle">⋮⋮</div>
                    <div class="widget-title ui-title">Projection (12‑month runway)</div>
                    <div id="fin-projection-chart" class="fin-chart-container fin-chart-container--subtle">
                        <svg id="fin-projection-svg" width="100%" height="100%" viewBox="0 0 960 280" preserveAspectRatio="none"></svg>
                    </div>
                    <div class="fin-chart-legend">
                        <div class="fin-chart-pill"><span class="fin-chart-dot fin-chart-dot--safe"></span>Safe</div>
                        <div class="fin-chart-pill"><span class="fin-chart-dot fin-chart-dot--realistic"></span>Realistic</div>
                        <div class="fin-chart-pill"><span class="fin-chart-dot fin-chart-dot--optimistic"></span>Optimistic</div>
                    </div>
                </div>
            </section>
        `;
    }

    function buildStrategicAdviceItems() {
        const items = [];
        const runway = Number(currentSnapshot && currentSnapshot.runwayMonths);
        const hasRunway = Number.isFinite(runway);
        const missing = safeArray(currentSnapshot && currentSnapshot.missingInputs);
        const debt = Number(currentSnapshot && currentSnapshot.totalDebt) || 0;
        const balance = Number(currentSnapshot && currentSnapshot.realBalance) || 0;
        const confidence = Number(currentSnapshot && currentSnapshot.confidenceScore);

        if (!hasRunway) {
            items.push('Runway becomes clearer once recurring expenses are noted.');
        } else if (runway < 2) {
            items.push('Runway is very thin. Consider protecting liquidity and easing optional spend.');
        } else if (runway < 4) {
            items.push('Runway is thin. It may help to secure one near‑term paid commitment.');
        } else {
            items.push('Runway looks steady. Keep it simple.');
        }

        if (debt > Math.max(1, balance)) {
            items.push('Debt is high compared to cash on hand. A weekly check-in may help.');
        }

        if (missing.length > 0) {
            items.push(`Missing: ${missing.slice(0, 2).join(', ')}.`);
        }

        if (Number.isFinite(confidence) && confidence < 0.5) {
            items.push('Confidence is thin. Add one recent income or expense to sharpen the picture.');
        }

        if (items.length === 0) {
            items.push('Nothing pressing right now. Keep reconciling as you go.');
        }

        return items;
    }

    function renderScenarioSummary() {
        const burnDelta = Number(labState.burnDelta || 0);
        const market = Number(labState.marketMajors || 0);
        const floor = Number(labState.probFloor || 50);
        return `Scenario: burn ${burnDelta >= 0 ? '+' : ''}${burnDelta}%, market ${market >= 0 ? '+' : ''}${market}%, probability floor ${floor}%.`;
    }

    function renderScenarioLab() {
        const adviceItems = buildStrategicAdviceItems();
        const visibleAdvice = adviceExpanded ? adviceItems : adviceItems.slice(0, 2);
        const showToggle = adviceItems.length > 2;

        return `
            <section class="fin-section">
                <div class="fin-lab-grid">
                    <div class="widget ui-card glass fin-card">
                        <div class="drag-handle">⋮⋮</div>
                        <div class="widget-title ui-title">Simulators</div>
                        <div class="fin-helper-text">Explore without consequence.</div>
                        <div class="fin-scenario-presets">
                            <button class="fin-tab-btn" type="button" data-fin-action="set-scenario-preset" data-fin-preset="baseline">Baseline</button>
                            <button class="fin-tab-btn" type="button" data-fin-action="set-scenario-preset" data-fin-preset="conservative">Conservative</button>
                            <button class="fin-tab-btn" type="button" data-fin-action="set-scenario-preset" data-fin-preset="stretch">Stretch</button>
                        </div>
                        <div class="fin-slider-group">
                            ${renderSlider('Market Volatility (Majors)', 'marketMajors', labState.marketMajors, -50, 50, '%')}
                            ${renderSlider('Monthly Burn Delta', 'burnDelta', labState.burnDelta, -30, 30, '%')}
                            ${renderSlider('Income Probability Floor', 'probFloor', labState.probFloor, 0, 100, '%')}
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="drag-handle">⋮⋮</div>
                        <div class="widget-title ui-title">Strategic Advice</div>
                        <div class="fin-advice-intro">
                            <span class="fin-advice-icon" aria-hidden="true">
                                <svg viewBox="0 0 20 20" class="fin-advice-icon-svg">
                                    <circle cx="10" cy="10" r="6.5"></circle>
                                    <path d="M10 5.2V10l3.2 2.2"></path>
                                </svg>
                            </span>
                            <span>Based on your current state:</span>
                        </div>
                        <ul class="fin-advice-list">
                            ${visibleAdvice.map((item) => `<li>${item}</li>`).join('')}
                        </ul>
                        ${showToggle ? `
                            <button class="fin-inline-link" type="button" data-fin-action="toggle-advice">
                                ${adviceExpanded ? 'Show less' : 'Show more'}
                            </button>
                        ` : ''}
                        <div id="fin-lab-scenario" class="fin-scenario-line">${renderScenarioSummary()}</div>
                    </div>
                </div>
            </section>
        `;
    }

    function renderTensionSignals() {
        const tensionSignals = [];
        const goals = typeof window.Store.getGoalProgress === 'function'
            ? window.Store.getGoalProgress(window.Store.getUiSettings().scopeFilter || 'all')
            : [];
        const buffer = goals.find((goal) => goal.type === 'buffer');
        if (currentSnapshot.runwayMonths == null) {
            tensionSignals.push('Runway is unknown until monthly burn is noted.');
        } else if (Number(currentSnapshot.runwayMonths) < 2) {
            tensionSignals.push('Runway is under 2 months. Consider easing cash outflow.');
        } else if (Number(currentSnapshot.runwayMonths) < 4) {
            tensionSignals.push('Runway is under 4 months. It may help to favor steadier income.');
        }
        if (Number(currentSnapshot.totalDebt) > Math.max(1, Number(currentSnapshot.realBalance))) {
            tensionSignals.push('Debt is higher than cash on hand.');
        }
        const missing = safeArray(currentSnapshot.missingInputs);
        if (missing.length) {
            tensionSignals.push('Missing: ' + missing.slice(0, 3).join(', '));
        }
        if (isWeeklyReviewDue()) {
            tensionSignals.push('Weekly review is due. Reconcile cash accounts and leave a short note.');
        }
        if (buffer && Number(buffer.progressPercent) < 100) {
            tensionSignals.push(`Buffer goal is ${Math.round(Number(buffer.progressPercent) || 0)}% funded.`);
        }
        const tensions = tensionSignals.slice(0, 3);

        const stabilizers = [];
        if (currentSnapshot.runwayMonths != null && Number(currentSnapshot.runwayMonths) >= 4) {
            stabilizers.push('Runway has some breathing room.');
        }
        if (currentSnapshot.monthlyBurn != null) {
            stabilizers.push('Monthly burn is noted.');
        }
        if (!missing.length) {
            stabilizers.push('Core inputs are complete.');
        }
        if (Number(currentSnapshot.totalDebt) <= Math.max(1, Number(currentSnapshot.realBalance))) {
            stabilizers.push('Debt is not outweighing cash on hand.');
        }
        if (!isWeeklyReviewDue()) {
            stabilizers.push('Weekly review is current.');
        }
        if (buffer && Number(buffer.progressPercent) >= 100) {
            stabilizers.push('Safety buffer is funded.');
        }
        const stableRows = stabilizers.slice(0, 3);

        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="drag-handle">⋮⋮</div>
                    <div class="widget-title ui-title">Signals</div>
                    <div class="fin-signals-grid">
                        <div class="fin-signal-column fin-signal-column--stable">
                            <div class="fin-signal-title">Stability</div>
                            <div class="fin-signal-list">
                                ${stableRows.length
                ? stableRows.map((text) => `<div class="fin-signal-row">${text}</div>`).join('')
                : '<div class="fin-compact-empty">No stabilizers yet.</div>'}
                            </div>
                        </div>
                        <div class="fin-signal-column fin-signal-column--tension">
                            <div class="fin-signal-title">Tension</div>
                            <div class="fin-signal-list">
                                ${tensions.length
                ? tensions.map((text) => `<div class="fin-signal-row">${text}</div>`).join('')
                : '<div class="fin-compact-empty">No major tension right now.</div>'}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /* --- Support Functions --- */

    function renderAllocationItem(label, value, type) {
        const total = Number(currentMetrics.allocation.safe) + Number(currentMetrics.allocation.growth) + Number(currentMetrics.allocation.speculative);
        const pct = total > 0 ? (value / total * 100).toFixed(0) : 0;
        return `
            <div class="fin-allocation-item">
                <div class="fin-allocation-row">
                    <span>${label}</span>
                    <span class="fin-muted">${pct}% | ${formatCurrency(value)}</span>
                </div>
                <div class="fin-allocation-track">
                    <div class="fin-allocation-fill fin-allocation-fill--${type}" style="width:${pct}%"></div>
                </div>
            </div>
        `;
    }

    function renderSlider(label, id, value, min, max, unit) {
        return `
            <div class="fin-slider-item">
                <div class="fin-slider-header">
                    <label>${label}</label>
                    <span id="val-${id}">${value}${unit}</span>
                </div>
                <input type="range" class="fin-range" id="slip-${id}" min="${min}" max="${max}" value="${value}">
            </div>
        `;
    }

    function attachCharts() {
        const svg = document.getElementById('fin-projection-svg');
        if (!svg || !window.FinancialEngine || typeof window.FinancialEngine.generateProjections !== 'function') return;
        const projections = window.FinancialEngine.generateProjections({
            financeSnapshot: currentSnapshot,
            financeReadModel: currentData
        }, {
            burnChange: Number(labState.burnDelta || 0) / 100,
            probFloor: Number(labState.probFloor || 50),
            marketShift: Number(labState.marketMajors || 0) / 100
        });
        const safe = projections.safe || [];
        const realistic = projections.realistic || [];
        const optimistic = projections.optimistic || [];
        const allValues = safe.concat(realistic).concat(optimistic);
        const maxValue = Math.max(1, ...allValues);
        const minValue = Math.min(0, ...allValues);
        const width = 960;
        const height = 280;
        const left = 24;
        const right = 12;
        const top = 16;
        const bottom = 28;
        const xStep = (width - left - right) / Math.max(1, (safe.length - 1));
        const yScale = function (value) {
            const span = (maxValue - minValue) || 1;
            return top + ((maxValue - value) / span) * (height - top - bottom);
        };
        const linePath = function (series) {
            return series.map((value, index) => `${index === 0 ? 'M' : 'L'} ${left + (index * xStep)} ${yScale(value)}`).join(' ');
        };
        svg.innerHTML = `
            <rect x="0" y="0" width="${width}" height="${height}" fill="var(--fin-chart-bg)"></rect>
            <line x1="${left}" y1="${yScale(0)}" x2="${width - right}" y2="${yScale(0)}" stroke="var(--fin-chart-grid)" stroke-width="1"></line>
            <path d="${linePath(safe)}" fill="none" stroke="var(--fin-chart-safe)" stroke-width="2.35"></path>
            <path d="${linePath(realistic)}" fill="none" stroke="var(--fin-chart-realistic)" stroke-width="2.35"></path>
            <path d="${linePath(optimistic)}" fill="none" stroke="var(--fin-chart-optimistic)" stroke-width="1.9"></path>
        `;
    }

    function attachLabListeners() {
        const sliderIds = ['marketMajors', 'burnDelta', 'probFloor'];
        sliderIds.forEach((id) => {
            const slider = document.getElementById('slip-' + id);
            if (!slider || slider.dataset.bound === '1') return;
            slider.dataset.bound = '1';
            slider.addEventListener('input', function () {
                labState[id] = Number(slider.value) || 0;
                if (window.Store && typeof window.Store.saveUiSettings === 'function') {
                    window.Store.saveUiSettings({ scenario: labState });
                }
                const valueEl = document.getElementById('val-' + id);
                if (valueEl) valueEl.textContent = slider.value + '%';
                const scenarioEl = document.getElementById('fin-lab-scenario');
                if (scenarioEl) {
                    scenarioEl.textContent = renderScenarioSummary();
                }
                attachCharts();
            });
        });
    }

    function openAddModal(type, id) {
        // Integration with existing Life OS modal system
        console.log('[FinancialMode] Opening modal for:', type);
        if (window.openEditModal) {
            if (id) {
                window.openEditModal(type, { id: String(id) });
            } else {
                window.openEditModal(type);
            }
        }
    }

    return {
        init,
        render,
        setSection: setActiveSection,
        openAddModal
    };
})();

// Initialize on load
