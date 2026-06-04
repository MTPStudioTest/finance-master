import { createSectionRenderer } from './section-registry.js';
import {
    escapeActionArg,
    escapeHtml,
    formatShortDate,
    pluralize,
    renderCompactEmpty,
    renderSectionHeading,
    renderStatusPill,
    scopeFilterOptions
} from './finance-ui.js';
import { buildMonthCloseSummary } from '../finance/month-close.js';
import { buildFinanceForecast, buildRoadmapFinanceMetrics } from '../finance/forecast.js';

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
    let currentExplanations = {};
    let currentForecast = null;
    let currentRoadmapMetrics = null;
    let currentHasFinanceData = false;
    let adviceExpanded = false;
    let ledgerMoreFiltersOpen = false;
    let monthlyReviewError = '';
    let insightsScenarioState = {
        flexCut: 0,
        debtReduction: 0,
        recurringIncome: 0,
        protectPct: 0,
        pauseSavings: false,
        reserveContribution: 0
    };

    const UI_KEYS = {
        focusMode: 'finance-master.layout.focus-mode',
        pipelineTab: 'finance-master.layout.pipeline-tab',
        ledgerView: 'finance-master.layout.ledger-view',
        ledgerFilters: 'finance-master.layout.ledger-filters',
        selectedTransaction: 'finance-master.layout.selected-transaction',
        invoicesView: 'finance-master.layout.invoices-view',
        treasuryProject: 'finance-master.layout.treasury-project',
        activeSection: 'finance-master.layout.active-section'
    };

    const SECTIONS = ['dashboard', 'flow', 'plan', 'radar', 'review', 'logbook', 'settings'];
    const SECTION_ALIASES = {
        overview: 'dashboard',
        today: 'dashboard',
        pulse: 'dashboard',
        flow: 'flow',
        cashflow: 'flow',
        planning: 'flow',
        income: 'flow',
        invoices: 'flow',
        transactions: 'logbook',
        ledger: 'logbook',
        'cash-movement': 'logbook',
        cashmovement: 'logbook',
        cashMovement: 'logbook',
        logbook: 'logbook',
        review: 'review',
        'monthly-review': 'review',
        monthlyreview: 'review',
        monthlyReview: 'review',
        'month-close': 'review',
        monthclose: 'review',
        monthClose: 'review',
        plan: 'plan',
        map: 'plan',
        treasury: 'plan',
        reserves: 'plan',
        obligations: 'plan',
        fixedcosts: 'plan',
        fixedCosts: 'plan',
        radar: 'radar',
        signals: 'radar',
        reports: 'radar',
        insights: 'radar',
        system: 'settings',
        data: 'settings',
        import: 'settings',
        backup: 'settings',
        settings: 'settings'
    };

    // Elements
    const elements = {
        container: document.getElementById('dashboard-financial'),
        content: document.getElementById('fin-content-area'),
        switchBtns: document.querySelectorAll('.fin-switch-btn'),
        mobileNavToggle: document.querySelector('[data-action="FinancialMode.toggleMobileNav"]'),
        sidebar: document.querySelector('.finance-master-sidebar')
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

    function normalizeSection(section) {
        const raw = String(section || 'dashboard').trim();
        const lower = raw.toLowerCase();
        const alias = SECTION_ALIASES[raw] || SECTION_ALIASES[lower];
        const next = alias || raw;
        return SECTIONS.indexOf(next) !== -1 ? next : 'dashboard';
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
            return normalizeSection(localStorage.getItem(UI_KEYS.activeSection) || 'dashboard');
        } catch (error) {
            return 'dashboard';
        }
    }

    function setActiveSection(section) {
        const safeSection = normalizeSection(section);
        try {
            localStorage.setItem(UI_KEYS.activeSection, safeSection);
        } catch (error) {
            // noop
        }
        closeMobileNav();
        render();
    }

    function getLedgerView() {
        try {
            const raw = String(localStorage.getItem(UI_KEYS.ledgerView) || 'clean').toLowerCase();
            if (raw === 'clean' || raw === 'work' || raw === 'expected' || raw === 'matched') return raw;
        } catch (error) {
            // noop
        }
        return 'clean';
    }

    function setLedgerView(view) {
        const safe = String(view || 'clean').toLowerCase();
        if (safe !== 'clean' && safe !== 'work' && safe !== 'expected' && safe !== 'matched') return;
        try {
            localStorage.setItem(UI_KEYS.ledgerView, safe);
        } catch (error) {
            // noop
        }
    }

    function getInvoicesView() {
        try {
            const raw = String(localStorage.getItem(UI_KEYS.invoicesView) || 'open').toLowerCase();
            if (raw === 'open' || raw === 'settled' || raw === 'all') return raw;
        } catch (error) {
            // noop
        }
        return 'open';
    }

    function setInvoicesView(view) {
        const safe = String(view || 'open').toLowerCase();
        if (safe !== 'open' && safe !== 'settled' && safe !== 'all') return;
        try {
            localStorage.setItem(UI_KEYS.invoicesView, safe);
        } catch (error) {
            // noop
        }
    }

    function getTreasuryProjectView() {
        try {
            return String(localStorage.getItem(UI_KEYS.treasuryProject) || 'all').trim() || 'all';
        } catch (error) {
            return 'all';
        }
    }

    function setTreasuryProjectView(value) {
        const safe = String(value || 'all').trim() || 'all';
        try {
            localStorage.setItem(UI_KEYS.treasuryProject, safe);
        } catch (error) {
            // noop
        }
    }

    function defaultLedgerFilters() {
        return {
            search: '',
            accountId: 'all',
            scope: 'all',
            categoryId: '',
            type: 'all',
            reviewStatus: 'all',
            source: 'all',
            importBatchId: 'all',
            linkState: 'all',
            amountMin: '',
            amountMax: '',
            dateFrom: '',
            dateTo: ''
        };
    }

    function getLedgerFilters() {
        try {
            const parsed = JSON.parse(localStorage.getItem(UI_KEYS.ledgerFilters) || '{}');
            return Object.assign(defaultLedgerFilters(), parsed && typeof parsed === 'object' ? parsed : {});
        } catch (error) {
            return defaultLedgerFilters();
        }
    }

    function setLedgerFilters(filters) {
        try {
            localStorage.setItem(UI_KEYS.ledgerFilters, JSON.stringify(Object.assign(defaultLedgerFilters(), filters || {})));
        } catch (error) {
            // noop
        }
    }

    function clearLedgerFilters() {
        try {
            localStorage.removeItem(UI_KEYS.ledgerFilters);
        } catch (error) {
            // noop
        }
    }

    function getSelectedLedgerTransactionId() {
        try {
            return String(localStorage.getItem(UI_KEYS.selectedTransaction) || '').trim();
        } catch (error) {
            return '';
        }
    }

    function setSelectedLedgerTransactionId(id) {
        try {
            if (id) localStorage.setItem(UI_KEYS.selectedTransaction, String(id));
            else localStorage.removeItem(UI_KEYS.selectedTransaction);
        } catch (error) {
            // noop
        }
    }

    function ledgerAccountOptions(selected) {
        const accounts = safeArray(currentData && currentData.fiatAccounts);
        return [
            `<option value="all"${selected === 'all' || !selected ? ' selected' : ''}>All accounts</option>`,
            ...accounts.map((account) => `<option value="${escapeHtml(account.id)}"${String(selected) === String(account.id) ? ' selected' : ''}>${escapeHtml(account.name || 'Account')}</option>`)
        ].join('');
    }

    function updateTopNavigation(section) {
        document.querySelectorAll('[data-fin-nav]').forEach((button) => {
            const active = String(button.getAttribute('data-fin-nav') || '') === section;
            button.classList.toggle('active', active);
            button.setAttribute('aria-current', active ? 'page' : 'false');
        });
    }

    function renderQuickActionButton(action) {
        return `
            <button type="button" data-action="${escapeHtml(action.action)}"${action.args ? ` data-action-args="${escapeHtml(action.args)}"` : ''}>
                <strong>${escapeHtml(action.label)}</strong>
                <span>${escapeHtml(action.copy)}</span>
            </button>
        `;
    }

    function updateQuickActions(section) {
        const button = document.querySelector('.fin-fab-add');
        const menu = document.getElementById('quick-action-menu');
        if (!button || !menu) return;
        const actionsBySection = {
            dashboard: [
                { label: 'Add transaction', copy: 'Record cash movement', action: 'openEditModal', args: "'transaction', 'expense'" },
                { label: 'Add expected income', copy: 'Sharpen the next 30 days', action: 'openEditModal', args: "'income'" },
                { label: 'Open Flow', copy: 'Review the forecast timeline', action: 'FinancialMode.setSection', args: "'flow'" }
            ],
            flow: [
                { label: 'Add expected income', copy: 'Invoice, retainer, or likely payment', action: 'openEditModal', args: "'income'" },
                { label: 'Add recurring cost', copy: 'Update baseline burn', action: 'openEditModal', args: "'expense'" },
                { label: 'Open Logbook', copy: 'Inspect raw transaction records', action: 'FinancialMode.setSection', args: "'logbook'" }
            ],
            logbook: [
                { label: 'Add transaction', copy: 'Income, expense, or transfer', action: 'openEditModal', args: "'transaction', 'expense'" },
                { label: 'Import CSV', copy: 'Bring in local transaction records', action: 'openEditModal', args: "'csvImport'" }
            ],
            plan: [
                { label: 'Add cash account', copy: 'Track a real liquid balance', action: 'openEditModal', args: "'fiatAccount'" },
                { label: 'Add recurring cost', copy: 'Add pressure to monthly burn', action: 'openEditModal', args: "'expense'" },
                { label: 'Add debt item', copy: 'Track liability and payment plan', action: 'FinancialMode.openAddModal', args: "'debtAdd'" },
                { label: 'Add reserve bucket', copy: 'Protect tax, VAT, health, or buffer cash', action: 'openEditModal', args: "'reserveBucket'" }
            ],
            radar: [
                { label: 'Open Review', copy: 'Resolve the most important signal', action: 'FinancialMode.setSection', args: "'review'" },
                { label: 'Open Plan', copy: 'Adjust structure behind the signal', action: 'FinancialMode.setSection', args: "'plan'" }
            ],
            review: [
                { label: 'Save checkpoint', copy: 'Review accounts and leave a note', action: 'FinancialMode.setSection', args: "'review'" },
                { label: 'Add transaction', copy: 'Resolve an unclear item', action: 'openEditModal', args: "'transaction', 'expense'" }
            ],
            settings: [
                { label: 'Import CSV', copy: 'Bring in local transaction records', action: 'openEditModal', args: "'csvImport'" },
                { label: 'Restore backup', copy: 'Preview before replacing local data', action: 'openEditModal', args: "'backupRestore'" }
            ]
        };
        const actions = actionsBySection[section] || [];
        button.classList.toggle('fin-fab-add--hidden', actions.length === 0);
        button.setAttribute('aria-hidden', actions.length === 0 ? 'true' : 'false');
        button.tabIndex = actions.length === 0 ? -1 : 0;
        if (!actions.length) {
            menu.classList.remove('active');
            menu.setAttribute('aria-hidden', 'true');
            button.setAttribute('aria-expanded', 'false');
        }
        menu.innerHTML = actions.map(renderQuickActionButton).join('');
    }

    function setMobileNavOpen(open) {
        const isOpen = Boolean(open);
        const isMobile = typeof window.matchMedia === 'function'
            ? window.matchMedia('(max-width: 760px)').matches
            : false;
        document.body.classList.toggle('finance-nav-open', isOpen);
        if (elements.mobileNavToggle) {
            elements.mobileNavToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            elements.mobileNavToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
        }
        if (elements.sidebar) {
            if (isMobile && !isOpen) {
                elements.sidebar.setAttribute('aria-hidden', 'true');
                elements.sidebar.setAttribute('inert', '');
            } else {
                elements.sidebar.removeAttribute('aria-hidden');
                elements.sidebar.removeAttribute('inert');
            }
        }
    }

    function toggleMobileNav() {
        setMobileNavOpen(!document.body.classList.contains('finance-nav-open'));
    }

    function closeMobileNav() {
        setMobileNavOpen(false);
    }

    function isSectionCollapsed(sectionId) {
        return readStoredBoolean(collapsedKey(sectionId), true);
    }

    function setSectionCollapsed(sectionId, collapsed) {
        writeStoredBoolean(collapsedKey(sectionId), Boolean(collapsed));
    }

    function safeArray(value) {
        return Array.isArray(value) ? value : [];
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
        if (!rhythm.hasData) return renderCompactEmpty('No cashflow history. Record your first operating month to unlock rhythms.');
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
        bindUiInteractions();

        window.addEventListener('mode-changed', (e) => {
            if (e.detail.mode === 'financial') {
                render();
            }
        });

        window.addEventListener('finance:updated', render);
        window.addEventListener('resize', () => {
            setMobileNavOpen(document.body.classList.contains('finance-nav-open'));
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeMobileNav();
        });
        closeMobileNav();
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

            if (action === 'select-ledger-transaction') {
                if (actionEl.classList.contains('fin-transaction-row') && event.target.closest('button, a, input, select, textarea')) return;
                const id = String(actionEl.getAttribute('data-fin-transaction-id') || '').trim();
                if (!id) return;
                setSelectedLedgerTransactionId(id);
                render();
                return;
            }

            if (action === 'clear-selected-ledger-transaction') {
                setSelectedLedgerTransactionId('');
                render();
                return;
            }

            if (action === 'toggle-ledger-more-filters') {
                ledgerMoreFiltersOpen = !ledgerMoreFiltersOpen;
                render();
                return;
            }

            if (action === 'apply-ledger-filters') {
                setLedgerFilters({
                    search: String(document.getElementById('fin-ledger-search')?.value || ''),
                    accountId: String(document.getElementById('fin-ledger-account')?.value || 'all'),
                    scope: String(document.getElementById('fin-ledger-scope')?.value || 'all'),
                    categoryId: String(document.getElementById('fin-ledger-category')?.value || ''),
                    type: String(document.getElementById('fin-ledger-type')?.value || 'all'),
                    reviewStatus: String(document.getElementById('fin-ledger-review')?.value || 'all'),
                    source: String(document.getElementById('fin-ledger-source')?.value || 'all'),
                    importBatchId: String(document.getElementById('fin-ledger-import-batch')?.value || 'all'),
                    linkState: String(document.getElementById('fin-ledger-link-state')?.value || 'all'),
                    amountMin: String(document.getElementById('fin-ledger-amount-min')?.value || ''),
                    amountMax: String(document.getElementById('fin-ledger-amount-max')?.value || ''),
                    dateFrom: String(document.getElementById('fin-ledger-date-from')?.value || ''),
                    dateTo: String(document.getElementById('fin-ledger-date-to')?.value || '')
                });
                render();
                return;
            }

            if (action === 'clear-ledger-filters') {
                clearLedgerFilters();
                ledgerMoreFiltersOpen = false;
                render();
                return;
            }

            if (action === 'set-treasury-project') {
                setTreasuryProjectView(actionEl.getAttribute('data-fin-project') || 'all');
                render();
                return;
            }

            if (action === 'set-insights-scenario') {
                const key = String(actionEl.getAttribute('data-fin-scenario-key') || '').trim();
                if (key === 'reset') {
                    insightsScenarioState = {
                        flexCut: 0,
                        debtReduction: 0,
                        recurringIncome: 0,
                        protectPct: 0,
                        pauseSavings: false,
                        reserveContribution: 0
                    };
                } else if (key === 'pauseSavings') {
                    insightsScenarioState.pauseSavings = !insightsScenarioState.pauseSavings;
                } else if (Object.prototype.hasOwnProperty.call(insightsScenarioState, key)) {
                    insightsScenarioState[key] = Math.max(0, Number(actionEl.getAttribute('data-fin-scenario-value') || '0') || 0);
                }
                render();
                return;
            }

            if (action === 'open-treasury-panel') {
                const sectionId = String(actionEl.getAttribute('data-fin-section') || '').trim();
                if (sectionId) setSectionCollapsed(sectionId, false);
                render();
                return;
            }

            if (action === 'rename-import-profile') {
                const id = String(actionEl.getAttribute('data-fin-profile-id') || '').trim();
                const input = Array.from(elements.content.querySelectorAll('[data-fin-profile-name]'))
                    .find((node) => String(node.getAttribute('data-fin-profile-name') || '') === id);
                const name = String(input && input.value || '').trim();
                if (id && name && window.Store && typeof window.Store.renameCsvImportProfile === 'function') {
                    window.Store.renameCsvImportProfile(id, name);
                    render();
                }
                return;
            }

            if (action === 'delete-import-profile') {
                const id = String(actionEl.getAttribute('data-fin-profile-id') || '').trim();
                if (id && window.Store && typeof window.Store.deleteCsvImportProfile === 'function') {
                    window.Store.deleteCsvImportProfile(id);
                    render();
                }
                return;
            }

            if (action === 'complete-monthly-review-inline') {
                completeMonthlyReviewInline();
                return;
            }

            if (action === 'set-invoices-view') {
                const view = String(actionEl.getAttribute('data-fin-invoices-view') || 'open').trim();
                setInvoicesView(view);
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
        currentExplanations = context.explanations || {};
        currentDiagnostics = context.diagnostics || {};
        currentReview = window.Store.getReviewState();
        currentForecast = buildFinanceForecast({
            readModel: currentData || {},
            snapshot: currentSnapshot || {},
            treasury: currentTreasury || {},
            nowIso: new Date().toISOString(),
        });
        currentRoadmapMetrics = buildRoadmapFinanceMetrics({
            readModel: currentData || {},
            snapshot: currentSnapshot || {},
            treasury: currentTreasury || {},
            nowIso: new Date().toISOString(),
        });
        currentHasFinanceData = Number(currentData && currentData.eventsCount) > 0;
        currentMetrics = window.FinancialEngine.compute({
            financeSnapshot: currentSnapshot,
            financeReadModel: currentData
        });

        if (!elements.content) return;

        const activeSection = getActiveSection();
        const focusMode = getFocusMode();
        updateTopNavigation(activeSection);
        updateQuickActions(activeSection);
        const sections = renderSection(activeSection, focusMode);

        elements.content.classList.toggle('fin-focus-mode', activeSection === 'dashboard' && focusMode);
        elements.content.innerHTML = sections.join('');
        attachCharts();

        // Post-render attachments
        if (window.CoreDashboardLayout && typeof window.CoreDashboardLayout.refresh === 'function') {
            window.CoreDashboardLayout.refresh();
        }
    }

    /* --- IA Layer Renderers --- */

    function renderSection(activeSection) {
        return createSectionRenderer({
            ledger: renderLedgerSection,
            invoices: renderInvoicesSection,
            goals: renderGoals,
            reviewQueue: renderReviewQueue,
            obligationReview: renderObligationReviewSection,
            paymentReview: renderPaymentReviewSection,
            tensionSignals: renderTensionSignals,
            weeklyReview: renderWeeklyReviewSection,
            reports: renderReportsSection,
            data: renderDataSection,
            settings: renderSettingsSection,
            reserves: renderReservesSection,
            fixedCosts: renderFixedCostsSection,
            cashCalendar: renderCashCalendar,
            scenarioOutcomes: renderScenarioOutcomes,
            pipelineTabs: renderPipelineTabs,
            projection: renderProjection,
            observatoryHeader: renderObservatoryHeader,
            dashboardCockpit: renderDashboardCockpit,
            todaysDecision: renderTodaysDecision,
            next30Days: renderNext30Days,
            nextActions: renderNextActions,
            strategicPicture: renderStrategicPicture
        }, renderSectionHeading)(activeSection);
    }

    function renderLedgerSection() {
        const allTransactions = safeArray(currentData && currentData.transactions)
            .slice()
            .sort((a, b) => Date.parse(String(b && b.timestamp || '')) - Date.parse(String(a && a.timestamp || '')));
        const filters = getLedgerFilters();
        const search = String(filters.search || '').trim().toLowerCase();
        const amountMin = Number(filters.amountMin);
        const amountMax = Number(filters.amountMax);
        const sourceOptions = Array.from(new Set(allTransactions.map((entry) => String(entry && entry.source || '').trim()).filter(Boolean))).sort();
        const importBatchOptions = Array.from(new Set(allTransactions.map((entry) => String(entry && entry.importBatchId || '').trim()).filter(Boolean))).sort();
        const transactions = allTransactions.filter((entry) => {
            const date = window.FinanceDates?.toDateOnly?.(entry && entry.timestamp) || String(entry && entry.timestamp || '').slice(0, 10);
            const signed = ledgerSignedAmount(entry);
            const absoluteAmount = Math.abs(signed);
            const linked = ledgerHasLink(entry);
            const accountMatch = filters.accountId === 'all'
                || String(entry && entry.accountId || '') === String(filters.accountId)
                || String(entry && entry.fromAccountId || '') === String(filters.accountId)
                || String(entry && entry.toAccountId || '') === String(filters.accountId);
            const scopeMatch = filters.scope === 'all' || String(entry && entry.scope || 'shared') === String(filters.scope);
            const typeMatch = filters.type === 'all' || String(entry && entry.ledgerType || '').toLowerCase() === String(filters.type).toLowerCase();
            const reviewMatch = filters.reviewStatus === 'all' || String(entry && entry.reviewStatus || 'clear') === String(filters.reviewStatus);
            const sourceMatch = !filters.source || filters.source === 'all' || String(entry && entry.source || '') === String(filters.source);
            const importBatchMatch = !filters.importBatchId || filters.importBatchId === 'all' || String(entry && entry.importBatchId || '') === String(filters.importBatchId);
            const linkMatch = !filters.linkState || filters.linkState === 'all' || (filters.linkState === 'linked' ? linked : !linked);
            const categoryMatch = !String(filters.categoryId || '').trim()
                || String(entry && entry.categoryId || '').toLowerCase().includes(String(filters.categoryId).trim().toLowerCase());
            const amountMinMatch = !String(filters.amountMin || '').trim() || !Number.isFinite(amountMin) || absoluteAmount >= amountMin;
            const amountMaxMatch = !String(filters.amountMax || '').trim() || !Number.isFinite(amountMax) || absoluteAmount <= amountMax;
            const dateMatch = (!filters.dateFrom || date >= filters.dateFrom) && (!filters.dateTo || date <= filters.dateTo);
            const searchMatch = !search || [
                entry && entry.description,
                entry && entry.accountName,
                entry && entry.fromAccountName,
                entry && entry.toAccountName,
                entry && entry.categoryId,
                entry && entry.source,
                entry && entry.id,
                entry && entry.transactionEntityId
            ].some((part) => String(part || '').toLowerCase().includes(search));
            return accountMatch && scopeMatch && typeMatch && reviewMatch && sourceMatch && importBatchMatch && linkMatch && categoryMatch && amountMinMatch && amountMaxMatch && dateMatch && searchMatch;
        });
        const view = getLedgerView();
        const reviewTransactions = transactions.filter(isLedgerReviewItem);
        const matchedTransactions = transactions.filter((entry) => ledgerHasLink(entry));
        const uncategorized = transactions.filter((entry) => ledgerNeedsCategory(entry));
        const unmatchedPayments = transactions.filter((entry) => ledgerNeedsMatch(entry));
        const missingReceipts = transactions.filter((entry) => ledgerNeedsReceiptCheck(entry));
        const matchedPayments = matchedTransactions.length;
        const netMovement = transactions.reduce((sum, entry) => sum + ledgerSignedAmount(entry), 0);
        const selectedTransactionId = getSelectedLedgerTransactionId();
        const selectedTransaction = allTransactions.find((entry) => ledgerTransactionId(entry) === selectedTransactionId) || null;
        const recurringCandidates = buildLedgerRecurringCandidates(allTransactions);
        const statusStrip = `
            <div class="fin-ledger-status-strip" aria-label="Record status">
                <div><span>Records</span><strong>${transactions.length}</strong><small>${allTransactions.length} total</small></div>
                <div><span>Net movement</span><strong class="${netMovement >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${netMovement >= 0 ? '+' : '-'}${formatCurrency(Math.abs(netMovement))}</strong><small>Current filters</small></div>
                <div><span>Open items</span><strong>${reviewTransactions.length}</strong><small>Classification or evidence</small></div>
                <div><span>Matched payments</span><strong>${matchedPayments}</strong><small>Linked obligations</small></div>
            </div>
        `;
        const renderLedgerRowDetails = (entry, mode = 'ledger') => {
            const id = ledgerTransactionId(entry);
            const signed = ledgerSignedAmount(entry);
            const reviewState = String(entry && entry.reviewStatus || 'clear').toLowerCase();
            const accountLabel = entry.accountName || entry.fromAccountName || entry.toAccountName || 'Account';
            const matchSuggestions = ledgerPaymentMatchSuggestions(entry);
            const incomeSuggestions = ledgerIncomeMatchSuggestions(entry);
            const ledgerType = String(entry && (entry.ledgerType || entry.type) || 'record').replace(/[._-]/g, ' ');
            const linkedItem = (() => {
                if (entry.obligationId || entry.linkedObligationTitle || entry.obligationTitle) {
                    return {
                        label: 'Linked to',
                        title: entry.linkedObligationTitle || entry.obligationTitle || entry.obligationId,
                        copy: 'Payment matched to monthly obligation.',
                        actionLabel: 'Open obligation',
                        action: 'openEditModal',
                        args: `'obligationPayment', '${escapeActionArg(entry.obligationId || id)}'`,
                    };
                }
                if (entry.linkedIncomeTitle || entry.linkedIncomeId) {
                    return {
                        label: 'Linked to',
                        title: entry.linkedIncomeTitle || entry.linkedIncomeId,
                        copy: 'Payment matched to expected income.',
                        actionLabel: 'Open income',
                        action: 'openEditModal',
                        args: `'income', '${escapeActionArg(entry.linkedIncomeId || id)}'`,
                    };
                }
                if (entry.linkedDebtTitle || entry.linkedDebtId) {
                    return {
                        label: 'Linked to',
                        title: entry.linkedDebtTitle || entry.linkedDebtId,
                        copy: 'Payment connected to debt pressure.',
                        actionLabel: 'Open debt',
                        action: 'openEditModal',
                        args: `'debt', '${escapeActionArg(entry.linkedDebtId)}'`,
                    };
                }
                const reserveMovement = ledgerReserveMovementLabel(entry);
                if (reserveMovement) {
                    return {
                        label: 'Reserve movement',
                        title: reserveMovement,
                        copy: 'This movement affects protected cash.',
                        actionLabel: 'Open Plan',
                        action: 'FinancialMode.setSection',
                        args: "'plan'",
                    };
                }
                if (entry.reversalOf || entry.reversedBy) {
                    return {
                        label: 'Reversal',
                        title: entry.reversalOf ? 'This reverses another record' : 'This record was reversed',
                        copy: entry.reversalOf ? 'A correction was recorded for an earlier transaction.' : 'A later correction reversed this transaction.',
                    };
                }
                return null;
            })();
            const explanation = linkedItem
                ? `${entry.description || 'This record'} ${linkedItem.copy.charAt(0).toLowerCase()}${linkedItem.copy.slice(1)}`
                : (reviewState === 'needs_review'
                    ? 'This record needs your eyes before it can support the forecast.'
                    : 'This record is part of your local cash movement history.');
            const chips = [
                reviewState === 'needs_review' ? 'Needs review' : 'Reviewed',
                linkedItem ? 'Matched' : '',
                ledgerType,
                entry.scope || 'shared',
            ].filter(Boolean);
            const primaryEdit = ledgerNeedsMatch(entry)
                ? financeIconButton({ action: 'openEditModal', args: `'paymentMatch', '${escapeActionArg(id)}'`, label: 'Edit payment match', icon: 'link', tone: 'success' })
                : financeIconButton({ action: 'openEditModal', args: `'transactionReview', '${escapeActionArg(id)}'`, label: 'Edit transaction review' });
            const matchLinkButton = ledgerNeedsMatch(entry) || linkedItem ? '' : financeIconButton({ action: 'openEditModal', args: `'paymentMatch', '${escapeActionArg(id)}'`, label: 'Match / link', icon: 'link', tone: 'muted' });
            const rowClasses = [
                'fin-transaction-row',
                mode === 'review' ? 'fin-transaction-row--review' : '',
                linkedItem ? 'fin-transaction-row--linked' : '',
                id === selectedTransactionId ? 'active' : ''
            ].filter(Boolean).join(' ');
            return `
                <div class="${rowClasses}" data-fin-action="select-ledger-transaction" data-fin-transaction-id="${escapeHtml(id)}" role="button" tabindex="0" aria-label="Open record detail">
                    <div class="fin-transaction-row-main">
                        <div class="fin-transaction-row-frame">
                            <span>
                                <strong>${escapeHtml(entry.description || 'Transaction')}</strong>
                                <small>${escapeHtml([formatShortDate(entry.timestamp), accountLabel].filter(Boolean).join(' · '))}</small>
                            </span>
                            <span class="fin-transaction-row-primary">
                                <strong class="${signed >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${signed >= 0 ? '+' : '-'}${formatCurrency(Math.abs(signed), entry.currency)}</strong>
                                ${matchLinkButton}
                                ${primaryEdit}
                            </span>
                        </div>
                        <div class="fin-chip-row">${chips.map((chip) => `<span class="fin-status-pill">${escapeHtml(chip)}</span>`).join('')}</div>
                        <p class="fin-transaction-human-copy">${escapeHtml(explanation)}</p>
                        ${linkedItem ? `
                            <button class="fin-transaction-link-line" type="button" data-action="${escapeHtml(linkedItem.action || 'openEditModal')}" data-action-args="${escapeHtml(linkedItem.args || `'paymentMatch', '${escapeActionArg(id)}'`)}" aria-label="${escapeHtml(linkedItem.actionLabel || `Open ${linkedItem.title}`)}">
                                ${renderSAGGlyph('link', { size: 'xs', tone: 'success' })}
                                <span>
                                    <span>${escapeHtml(linkedItem.label)}</span>
                                    <strong>${escapeHtml(linkedItem.title)}</strong>
                                </span>
                            </button>
                        ` : ''}
                        ${matchSuggestions.length ? `
                            <div class="fin-transaction-suggestion">
                                <span class="fin-eyebrow">Suggested match</span>
                                ${matchSuggestions.map((suggestion) => `<strong>${escapeHtml(suggestion.title)}</strong><small>${escapeHtml(suggestion.reason)}</small>`).join('')}
                            </div>
                        ` : ''}
                        ${incomeSuggestions.length ? `
                            <div class="fin-transaction-suggestion">
                                <span class="fin-eyebrow">Suggested income match</span>
                                ${incomeSuggestions.map((suggestion) => `<strong>${escapeHtml(suggestion.title)}</strong><small>${escapeHtml(suggestion.reason)}</small>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        };
        const renderLedgerRow = (entry) => renderLedgerRowDetails(entry, 'ledger');
        const renderReviewRow = (entry) => renderLedgerRowDetails(entry, 'review');
        const expectedIncomeRows = getActivePipelineDeals()
            .slice()
            .sort((a, b) => (Date.parse(String(a && a.expectedDateISO || '')) || Number.MAX_SAFE_INTEGER) - (Date.parse(String(b && b.expectedDateISO || '')) || Number.MAX_SAFE_INTEGER));
        const renderExpectedIncomeRow = (deal) => {
            const status = incomeStatusFromDeal(deal);
            const probability = Number(deal && deal.probability);
            const safeProbability = Number.isFinite(probability) ? Math.max(0, Math.min(1, probability)) : 0;
            const amount = Number(deal && deal.value) || 0;
            const vatAmount = Number(deal && deal.vatAmount) || 0;
            const vatRate = Number(deal && deal.vatRate) || 0;
            return `
                <div class="fin-transaction-row">
                    <div class="fin-transaction-row-main">
                        <div class="fin-transaction-row-frame">
                            <span>
                                <strong>${escapeHtml(deal && deal.title || 'Expected income')}</strong>
                                <small>${escapeHtml([formatShortDate(deal && deal.expectedDateISO), incomeReliabilityLabel({ status, dueState: incomeDueStateFromDeal(deal, status), incomeType: deal && deal.incomeType })].filter(Boolean).join(' · '))}</small>
                                ${vatAmount > 0 ? `<small>VAT ${formatCurrency(vatAmount)} (${escapeHtml(String(vatRate || 0))}%) on top</small>` : ''}
                            </span>
                            <span class="fin-transaction-row-primary">
                                <strong class="fin-val-pos">${formatCurrency(amount)}</strong>
                                ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'income', '${escapeActionArg(deal && deal.id || '')}'`, label: `Edit ${deal && deal.title || 'expected income'}` })}
                            </span>
                        </div>
                        <div class="fin-chip-row">
                            ${renderStatusPill(status)}
                            ${renderStatusPill(incomeDueStateFromDeal(deal, status))}
                            <span class="fin-status-pill">${Math.round(safeProbability * 100)}% reliable</span>
                        </div>
                        <p class="fin-transaction-human-copy">Expected income supports the forecast, but does not count as actual cash until it is received.</p>
                    </div>
                </div>
            `;
        };
        const sourceFilter = sourceOptions.length ? `
            <select id="fin-ledger-source" aria-label="Filter records by source">
                <option value="all"${filters.source === 'all' || !filters.source ? ' selected' : ''}>All sources</option>
                ${sourceOptions.map((source) => `<option value="${escapeHtml(source)}"${String(filters.source) === source ? ' selected' : ''}>${escapeHtml(source)}</option>`).join('')}
            </select>
        ` : `<input id="fin-ledger-source" aria-label="Filter records by source" value="all" type="hidden" />`;
        const importBatchFilter = importBatchOptions.length ? `
            <select id="fin-ledger-import-batch" aria-label="Filter records by import batch">
                <option value="all"${filters.importBatchId === 'all' || !filters.importBatchId ? ' selected' : ''}>All import batches</option>
                ${importBatchOptions.map((batchId) => {
            const batch = ledgerImportBatch({ importBatchId: batchId });
            const label = batch && batch.sourceFile ? `${batch.sourceFile} · ${batchId}` : batchId;
            return `<option value="${escapeHtml(batchId)}"${String(filters.importBatchId) === batchId ? ' selected' : ''}>${escapeHtml(label)}</option>`;
        }).join('')}
            </select>
        ` : `<input id="fin-ledger-import-batch" aria-label="Filter records by import batch" value="all" type="hidden" />`;
        const chips = renderLedgerFilterChips(filters);
        const filtersHtml = `
            <div class="fin-ledger-toolbar" aria-label="Record filters">
                <div class="fin-ledger-filter-bar">
                    <input id="fin-ledger-search" aria-label="Search records" value="${escapeHtml(filters.search)}" placeholder="Search note, account, category, source" />
                    <select id="fin-ledger-account" aria-label="Filter records by account">${ledgerAccountOptions(filters.accountId)}</select>
                    <input id="fin-ledger-category" aria-label="Filter records by category" value="${escapeHtml(filters.categoryId)}" placeholder="Category" />
                    <input id="fin-ledger-date-from" aria-label="Record date from" type="date" value="${escapeHtml(filters.dateFrom)}" />
                    <input id="fin-ledger-date-to" aria-label="Record date to" type="date" value="${escapeHtml(filters.dateTo)}" />
                    <button class="fin-mini-btn" type="button" data-fin-action="toggle-ledger-more-filters" aria-expanded="${ledgerMoreFiltersOpen ? 'true' : 'false'}">More filters</button>
                    <button class="fin-mini-btn fin-mini-btn--primary" type="button" data-fin-action="apply-ledger-filters">Apply filters</button>
                </div>
                ${ledgerMoreFiltersOpen ? `
                <div class="fin-ledger-filter-advanced" aria-label="Advanced record filters">
                    <select id="fin-ledger-scope" aria-label="Filter records by scope">${scopeFilterOptions(filters.scope)}</select>
                    <select id="fin-ledger-type" aria-label="Filter records by type">
                        <option value="all"${filters.type === 'all' ? ' selected' : ''}>All types</option>
                        <option value="income"${filters.type === 'income' ? ' selected' : ''}>Income</option>
                        <option value="expense"${filters.type === 'expense' ? ' selected' : ''}>Expense</option>
                        <option value="transfer"${filters.type === 'transfer' ? ' selected' : ''}>Transfer</option>
                        <option value="adjustment"${filters.type === 'adjustment' ? ' selected' : ''}>Adjustment</option>
                    </select>
                    <select id="fin-ledger-review" aria-label="Filter records by review status">
                        <option value="all"${filters.reviewStatus === 'all' ? ' selected' : ''}>All review states</option>
                        <option value="clear"${filters.reviewStatus === 'clear' ? ' selected' : ''}>Clear</option>
                        <option value="needs_review"${filters.reviewStatus === 'needs_review' ? ' selected' : ''}>Needs review</option>
                        <option value="reviewed"${filters.reviewStatus === 'reviewed' ? ' selected' : ''}>Reviewed</option>
                    </select>
                    ${sourceFilter}
                    ${importBatchFilter}
                    <select id="fin-ledger-link-state" aria-label="Filter records by link state">
                        <option value="all"${filters.linkState === 'all' ? ' selected' : ''}>All link states</option>
                        <option value="linked"${filters.linkState === 'linked' ? ' selected' : ''}>Linked records</option>
                        <option value="unlinked"${filters.linkState === 'unlinked' ? ' selected' : ''}>Unlinked records</option>
                    </select>
                    <input id="fin-ledger-amount-min" aria-label="Record amount minimum" type="number" min="0" step="0.01" value="${escapeHtml(filters.amountMin)}" placeholder="Minimum amount" />
                    <input id="fin-ledger-amount-max" aria-label="Record amount maximum" type="number" min="0" step="0.01" value="${escapeHtml(filters.amountMax)}" placeholder="Maximum amount" />
                    <button class="fin-mini-btn" type="button" data-fin-action="clear-ledger-filters">Reset filters</button>
                </div>
                ` : `
                    <input id="fin-ledger-scope" value="${escapeHtml(filters.scope)}" type="hidden" />
                    <input id="fin-ledger-type" value="${escapeHtml(filters.type)}" type="hidden" />
                    <input id="fin-ledger-review" value="${escapeHtml(filters.reviewStatus)}" type="hidden" />
                    <input id="fin-ledger-source" value="${escapeHtml(filters.source)}" type="hidden" />
                    <input id="fin-ledger-import-batch" value="${escapeHtml(filters.importBatchId)}" type="hidden" />
                    <input id="fin-ledger-link-state" value="${escapeHtml(filters.linkState)}" type="hidden" />
                    <input id="fin-ledger-amount-min" value="${escapeHtml(filters.amountMin)}" type="hidden" />
                    <input id="fin-ledger-amount-max" value="${escapeHtml(filters.amountMax)}" type="hidden" />
                `}
                ${chips}
            </div>
        `;
        const utilityStrip = `
            <div class="fin-logbook-utility-grid" aria-label="Logbook utilities">
                <div class="fin-logbook-utility-card">
                    <span class="fin-eyebrow">Import / Add Entry</span>
                    <strong>${allTransactions.length} records</strong>
                    <p>Bring in CSV evidence or add one local transaction.</p>
                    <div class="fin-action-row fin-action-row--inline">
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'csvImport'">Import CSV</button>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transaction', 'expense'">Add transaction</button>
                    </div>
                </div>
                <div class="fin-logbook-utility-card">
                    <span class="fin-eyebrow">Category Cleanup</span>
                    <strong>${uncategorized.length} need category</strong>
                    <p>${unmatchedPayments.length} unmatched payments · ${missingReceipts.length} receipt checks.</p>
                    <button class="fin-mini-btn" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="work">Review records</button>
                </div>
                <div class="fin-logbook-utility-card">
                    <span class="fin-eyebrow">Recurring Detection</span>
                    <strong>${recurringCandidates.length} candidates</strong>
                    <p>${recurringCandidates[0] ? `${escapeHtml(recurringCandidates[0].label)} appears ${recurringCandidates[0].count} times.` : 'Repeated expenses will appear here once enough records exist.'}</p>
                    <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Add recurring cost</button>
                </div>
            </div>
        `;
        let panelHtml = '';
        if (view === 'work') {
            panelHtml = `
                <div class="fin-review-summary-line">
                    <strong>${uncategorized.length}</strong> need category
                    <span>${unmatchedPayments.length} unmatched payments</span>
                    <span>${missingReceipts.length} receipt checks</span>
                    <span>${transactions.length} filtered records</span>
                </div>
                ${reviewTransactions.length ? reviewTransactions.map(renderReviewRow).join('') : renderCompactEmpty('No transactions need review for the current filters.')}
            `;
        } else if (view === 'matched') {
            panelHtml = matchedTransactions.length
                ? matchedTransactions.map(renderLedgerRow).join('')
                : renderCompactEmpty('Matched payments will appear here after records are linked to obligations, income, debt, or reserves.');
        } else if (view === 'expected') {
            panelHtml = expectedIncomeRows.length
                ? expectedIncomeRows.map(renderExpectedIncomeRow).join('')
                : renderCompactEmpty('Expected income will appear here. Add upcoming invoices, retainers, confirmed income, proposals, or overdue payments.');
        } else {
            panelHtml = transactions.length ? transactions.map(renderLedgerRow).join('') : renderCompactEmpty('Begin tracking. Add your first payment or sync a CSV.');
        }
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-ledger-workspace-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Transaction Log</div>
                            <div class="fin-helper-text">Raw records live here for review, matching, categorization, import inspection, and detail checks.</div>
                        </div>
                        <div class="fin-action-row">
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'csvImport'">Import CSV</button>
                            <button class="fin-mini-btn" type="button" data-action="exportTransactionsCsv">Export</button>
                            <button class="fin-mini-btn fin-mini-btn--primary" type="button" data-action="openEditModal" data-action-args="'transaction', 'expense'">Add transaction</button>
                        </div>
                    </div>
                    ${utilityStrip}
                    ${statusStrip}
                    ${filtersHtml}
                    <div class="fin-tabs" role="tablist" aria-label="Logbook zones">
                        <button class="fin-tab-btn ${view === 'clean' ? 'active' : ''}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="clean">Inbox</button>
                        <button class="fin-tab-btn ${view === 'expected' ? 'active' : ''}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="expected">Expected</button>
                        <button class="fin-tab-btn ${view === 'matched' ? 'active' : ''}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="matched">Matched</button>
                        <button class="fin-tab-btn ${view === 'work' ? 'active' : ''}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="work">Review Needed</button>
                    </div>
                    <div class="fin-ledger-workspace-grid">
                        <div class="fin-tab-panel">
                            ${panelHtml}
                        </div>
                        ${renderLedgerDetailDrawer(selectedTransaction)}
                    </div>
                </div>
            </section>
        `;
    }

    function buildLedgerRecurringCandidates(transactions) {
        const grouped = new Map();
        safeArray(transactions).forEach((entry) => {
            const signed = ledgerSignedAmount(entry);
            if (signed >= 0) return;
            const label = String(entry && (entry.description || entry.source || entry.categoryId) || '').trim();
            if (!label) return;
            const key = label.toLowerCase().replace(/\s+\d{1,2}[./-]\d{1,2}.*/, '').replace(/\s+/g, ' ');
            const row = grouped.get(key) || { label, count: 0, total: 0, latest: '' };
            row.count += 1;
            row.total += Math.abs(signed);
            const date = window.FinanceDates?.toDateOnly?.(entry && entry.timestamp) || String(entry && entry.timestamp || '').slice(0, 10);
            if (date > row.latest) row.latest = date;
            grouped.set(key, row);
        });
        return Array.from(grouped.values())
            .filter((row) => row.count >= 2)
            .sort((a, b) => b.count - a.count || b.total - a.total)
            .slice(0, 4);
    }

    function renderLedgerDetailDrawer(entry) {
        if (!entry) {
            return `
                <aside class="fin-ledger-detail-drawer" aria-label="Record detail drawer">
                    <span class="fin-eyebrow">Record Detail Drawer</span>
                    ${renderCompactEmpty('Select a record to inspect evidence, links, import data, and cleanup actions.')}
                </aside>
            `;
        }
        const id = ledgerTransactionId(entry);
        const signed = ledgerSignedAmount(entry);
        const batch = ledgerImportBatch(entry);
        const fields = [
            ['Date', formatShortDate(entry.timestamp)],
            ['Amount', `${signed >= 0 ? '+' : '-'}${formatCurrency(Math.abs(signed), entry.currency)}`],
            ['Type', String(entry.ledgerType || entry.type || 'record').replace(/[._-]/g, ' ')],
            ['Category', entry.categoryId || 'Uncategorized'],
            ['Account', entry.accountName || entry.fromAccountName || entry.toAccountName || 'Account'],
            ['Review state', entry.reviewStatus || 'clear'],
            ['Source', entry.source || 'Manual'],
            ['Import batch', batch ? `${batch.sourceFile || 'CSV import'} · ${entry.importBatchId}` : 'None'],
            ['Record ID', id],
        ];
        return `
            <aside class="fin-ledger-detail-drawer" aria-label="Record detail drawer">
                <div class="fin-section-heading-row">
                    <div>
                        <span class="fin-eyebrow">Record Detail Drawer</span>
                        <strong>${escapeHtml(entry.description || 'Transaction')}</strong>
                    </div>
                    <button class="fin-mini-btn" type="button" data-fin-action="clear-selected-ledger-transaction">Close</button>
                </div>
                <div class="fin-ledger-detail-grid">
                    ${fields.map(([label, value]) => `
                        <div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>
                    `).join('')}
                </div>
                <div class="fin-action-row fin-action-row--inline">
                    <button class="fin-mini-btn fin-mini-btn--primary" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${escapeActionArg(id)}'">Review record</button>
                    <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'paymentMatch', '${escapeActionArg(id)}'">Match / link</button>
                </div>
            </aside>
        `;
    }

    function ledgerTransactionId(entry) {
        return String(entry && (entry.id || entry.transactionEntityId) || '').trim();
    }

    function ledgerSignedAmount(entry) {
        const amount = Number(entry && entry.signedAmount);
        if (Number.isFinite(amount)) return amount;
        const fallback = Number(entry && entry.amount);
        if (!Number.isFinite(fallback)) return 0;
        const type = String(entry && (entry.ledgerType || entry.type) || '').toLowerCase();
        return type.indexOf('expense') !== -1 ? -Math.abs(fallback) : fallback;
    }

    function ledgerNeedsCategory(entry) {
        const category = String(entry && entry.categoryId || '').toLowerCase();
        const review = String(entry && entry.reviewStatus || '').toLowerCase();
        return !category || category === 'uncategorized' || review === 'needs_review';
    }

    function ledgerNeedsMatch(entry) {
        return String(entry && entry.type) === 'expense.recorded'
            && !String(entry && entry.obligationId || '').trim()
            && String(entry && entry.categoryId || '').toLowerCase() === 'obligation';
    }

    function ledgerNeedsReceiptCheck(entry) {
        return String(entry && entry.type) === 'expense.recorded'
            && !String(entry && entry.receiptUrl || '').trim()
            && String(entry && entry.categoryId || '').toLowerCase() !== 'transfer';
    }

    function ledgerHasLink(entry) {
        return Boolean(
            String(entry && entry.obligationId || '').trim()
            || String(entry && entry.linkedIncomeId || '').trim()
            || String(entry && entry.linkedReserveId || '').trim()
            || String(entry && entry.reversalOf || '').trim()
            || String(entry && entry.reversedBy || '').trim()
        );
    }

    function isLedgerReviewItem(entry) {
        return ledgerNeedsCategory(entry) || ledgerNeedsMatch(entry) || ledgerNeedsReceiptCheck(entry);
    }

    function ledgerReviewReason(entry) {
        if (ledgerNeedsCategory(entry)) return 'Needs category';
        if (ledgerNeedsMatch(entry)) return 'Match obligation';
        if (ledgerNeedsReceiptCheck(entry)) return 'Receipt check';
        const review = String(entry && entry.reviewStatus || 'Needs review').replace(/_/g, ' ');
        return review.charAt(0).toUpperCase() + review.slice(1);
    }

    function ledgerEvidenceLabel(entry) {
        const parts = [
            entry && entry.importBatchId ? `Import ${entry.importBatchId}` : '',
            entry && entry.sourceRowId ? `Row ${entry.sourceRowId}` : '',
            entry && entry.reversalOf ? `Reversal of ${entry.reversalOf}` : '',
            entry && entry.reversedBy ? `Reversed by ${entry.reversedBy}` : '',
            entry && entry.reviewStatus ? entry.reviewStatus : ''
        ].filter(Boolean);
        return parts.join(' · ') || 'Local entry';
    }

    function ledgerTokens(value) {
        return String(value || '')
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .map((token) => token.trim())
            .filter((token) => token.length >= 4);
    }

    function ledgerDaysBetween(left, right) {
        const leftTs = Date.parse(String(left || ''));
        const rightTs = Date.parse(String(right || ''));
        if (!Number.isFinite(leftTs) || !Number.isFinite(rightTs)) return Number.POSITIVE_INFINITY;
        return Math.abs(leftTs - rightTs) / 86400000;
    }

    function ledgerPaymentMatchSuggestions(entry) {
        if (!entry || String(entry.type) !== 'expense.recorded' || String(entry.obligationId || '').trim()) return [];
        const amount = Math.abs(Number(entry.amount) || Number(entry.signedAmount) || 0);
        const txTokens = new Set(ledgerTokens(entry.description));
        return treasuryArray('obligations')
            .filter((item) => String(item && item.status || '') !== 'paid' && String(item && item.type || '') !== 'debt')
            .map((item) => {
                const itemAmount = Math.abs(Number(item && item.amount) || 0);
                const amountDelta = Math.abs(itemAmount - amount);
                const dayDelta = ledgerDaysBetween(entry.timestamp, item && item.dueDate);
                const tokenMatch = ledgerTokens(item && item.title).filter((token) => txTokens.has(token)).length;
                let score = 0;
                const reasons = [];
                if (amountDelta < 0.01) {
                    score += 6;
                    reasons.push('same amount');
                } else if (amountDelta <= Math.max(5, amount * 0.05)) {
                    score += 3;
                    reasons.push('similar amount');
                }
                if (dayDelta <= 3) {
                    score += 4;
                    reasons.push('near due date');
                } else if (dayDelta <= 10) {
                    score += 2;
                    reasons.push('close date');
                }
                if (tokenMatch) {
                    score += tokenMatch * 2;
                    reasons.push('matching description');
                }
                return {
                    id: String(item && item.id || ''),
                    title: String(item && item.title || 'Obligation'),
                    reason: reasons.join(' + ') || 'possible obligation',
                    score
                };
            })
            .filter((item) => item.id && item.score > 0)
            .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
            .slice(0, 2);
    }

    function ledgerIncomeMatchSuggestions(entry) {
        if (!entry || String(entry.type) !== 'income.received' || String(entry.linkedIncomeId || '').trim()) return [];
        const amount = Math.abs(Number(entry.amount) || Number(entry.signedAmount) || 0);
        const txTokens = new Set(ledgerTokens(entry.description));
        return safeArray(currentData && currentData.pipelineDeals)
            .filter((item) => {
                const status = String(item && item.status || '').toLowerCase();
                return status !== 'paid' && status !== 'closed' && status !== 'lost' && status !== 'cancelled' && status !== 'deleted';
            })
            .map((item) => {
                const itemAmount = Math.abs(Number(item && item.value) || 0);
                const amountDelta = Math.abs(itemAmount - amount);
                const dayDelta = ledgerDaysBetween(entry.timestamp, item && item.expectedDateISO);
                const tokenMatch = ledgerTokens(`${item && item.title || ''} ${item && item.client || ''}`).filter((token) => txTokens.has(token)).length;
                let score = 0;
                const reasons = [];
                if (amountDelta < 0.01) {
                    score += 6;
                    reasons.push('same amount');
                } else if (amountDelta <= Math.max(10, amount * 0.05)) {
                    score += 3;
                    reasons.push('similar amount');
                }
                if (dayDelta <= 7) {
                    score += 3;
                    reasons.push('near expected date');
                } else if (dayDelta <= 21) {
                    score += 1;
                    reasons.push('close date');
                }
                if (tokenMatch) {
                    score += tokenMatch * 2;
                    reasons.push('matching description');
                }
                return {
                    id: String(item && item.id || ''),
                    title: String(item && item.title || 'Expected income'),
                    reason: reasons.join(' + ') || 'possible income match',
                    score
                };
            })
            .filter((item) => item.id && item.score > 0)
            .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
            .slice(0, 2);
    }

    function ledgerImportBatch(entry) {
        const batchId = String(entry && entry.importBatchId || '').trim();
        if (!batchId || !window.Store || typeof window.Store.getImportState !== 'function') return null;
        const state = window.Store.getImportState();
        return safeArray(state && state.batches).find((batch) => String(batch && batch.id || '') === batchId) || null;
    }

    function ledgerReserveMovementLabel(entry) {
        if (!entry) return '';
        const linkedReserve = String(entry.linkedReserveId || '').trim();
        if (linkedReserve) return `Linked reserve ${linkedReserve}`;
        const type = String(entry.ledgerType || entry.type || '').toLowerCase();
        if (type !== 'transfer') return '';
        const accounts = safeArray(currentData && currentData.fiatAccounts);
        const from = accounts.find((account) => String(account && account.id || '') === String(entry.fromAccountId || ''));
        const to = accounts.find((account) => String(account && account.id || '') === String(entry.toAccountId || ''));
        const protectedSide = [from, to].filter((account) => account && (account.reserved || String(account.bucket || '') !== 'available'));
        if (!protectedSide.length) return '';
        return protectedSide.map((account) => `${account.name || 'Protected account'} (${account.bucket || 'reserve'})`).join(' · ');
    }

    function renderLedgerFilterChips(filters) {
        const labels = [];
        if (String(filters.search || '').trim()) labels.push(`Search: ${filters.search}`);
        if (filters.accountId && filters.accountId !== 'all') labels.push('Account filter');
        if (String(filters.categoryId || '').trim()) labels.push(`Category: ${filters.categoryId}`);
        if (filters.dateFrom) labels.push(`From ${filters.dateFrom}`);
        if (filters.dateTo) labels.push(`To ${filters.dateTo}`);
        if (filters.scope && filters.scope !== 'all') labels.push(`Scope: ${filters.scope}`);
        if (filters.type && filters.type !== 'all') labels.push(`Type: ${filters.type}`);
        if (filters.reviewStatus && filters.reviewStatus !== 'all') labels.push(`Review: ${String(filters.reviewStatus).replace(/_/g, ' ')}`);
        if (filters.source && filters.source !== 'all') labels.push(`Source: ${filters.source}`);
        if (filters.importBatchId && filters.importBatchId !== 'all') labels.push(`Import batch: ${filters.importBatchId}`);
        if (filters.linkState && filters.linkState !== 'all') labels.push(filters.linkState === 'linked' ? 'Linked records' : 'Unlinked records');
        if (String(filters.amountMin || '').trim()) labels.push(`Min ${filters.amountMin}`);
        if (String(filters.amountMax || '').trim()) labels.push(`Max ${filters.amountMax}`);
        if (!labels.length) return '';
        return `
            <div class="fin-ledger-filter-chips" aria-label="Active record filters">
                ${labels.map((label) => `<span class="fin-status-pill">${escapeHtml(label)}</span>`).join('')}
                <button class="fin-mini-btn" type="button" data-fin-action="clear-ledger-filters">Clear all</button>
            </div>
        `;
    }

    function completeMonthlyReviewInline() {
        const accountChecks = Array.from(document.querySelectorAll('.monthly-review-account-check'));
        const reviewChecks = Array.from(document.querySelectorAll('.monthly-review-check'));
        if (!accountChecks.length) {
            monthlyReviewError = 'Add a cash account before saving a checkpoint.';
            render();
            return;
        }
        if (accountChecks.some((input) => !input.checked) || reviewChecks.some((input) => !input.checked)) {
            monthlyReviewError = 'Confirm each account and each review step before saving a checkpoint.';
            render();
            return;
        }
        const accounts = accountChecks.map((input) => {
            const index = String(input.getAttribute('data-review-index') || '');
            const balanceInput = document.getElementById(`monthly-review-balance-${index}`);
            return {
                accountId: String(input.getAttribute('data-account-id') || ''),
                balance: Number(balanceInput && balanceInput.value)
            };
        });
        if (accounts.some((account) => !account.accountId || !Number.isFinite(account.balance))) {
            monthlyReviewError = 'Enter a valid reconciled balance for every account.';
            render();
            return;
        }
        try {
            if (window.Store && typeof window.Store.completeWeeklyReview === 'function') {
                window.Store.completeWeeklyReview({
                    accounts,
                    unresolvedItems: true,
                    matchPayments: true,
                    confirmObligations: true,
                    reviewSignals: true,
                    closeMonth: true,
                    notes: String(document.getElementById('monthly-review-notes')?.value || '')
                });
            }
            monthlyReviewError = '';
            render();
        } catch (error) {
            monthlyReviewError = error instanceof Error ? error.message : 'Could not complete this review.';
            render();
        }
    }

    function renderMonthCloseSummary() {
        const summary = buildMonthCloseSummary({
            readModel: currentData || {},
            snapshot: currentSnapshot || {},
            treasury: currentTreasury || {},
            reviewQueue: treasuryArray('reviewQueue'),
            forecast: currentForecast,
            nowIso: new Date().toISOString(),
        });
        const runwayLabel = Number.isFinite(Number(summary.runwayNow)) ? `${Number(summary.runwayNow).toFixed(1)} months` : 'Unknown';
        return `
            <div class="fin-monthly-review-panel fin-monthly-review-summary" aria-label="Checkpoint summary">
                <div class="fin-eyebrow">Checkpoint summary</div>
                <div class="backup-preview-card">
                    <div><span>Net movement</span><strong class="${summary.netMovement >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${summary.netMovement >= 0 ? '+' : '-'}${formatCurrency(Math.abs(summary.netMovement))}</strong></div>
                    <div><span>Income received</span><strong>${formatCurrency(summary.incomeReceived)}</strong></div>
                    <div><span>Expenses paid</span><strong>${formatCurrency(summary.expensesPaid)}</strong></div>
                    <div><span>Obligations reviewed</span><strong>${summary.obligationsReviewed}</strong></div>
                    <div><span>Reserve movements</span><strong>${summary.reserveMovements}</strong></div>
                    <div><span>Runway now</span><strong>${escapeHtml(runwayLabel)}</strong></div>
                    <div><span>Unresolved items</span><strong>${summary.unresolvedItems}</strong></div>
                    <div><span>Reserve / burn check</span><strong>${formatCurrency(summary.protectedCash)} protected · ${formatCurrency(summary.monthlyBurn)}/mo burn</strong></div>
                    <div><span>30-day forecast</span><strong>${summary.forecastExpectedCash == null ? 'Unknown' : formatCurrency(summary.forecastExpectedCash)}</strong></div>
                </div>
                <div class="fin-helper-text">${escapeHtml(summary.mainRisk)} ${escapeHtml(summary.mainAction)}</div>
            </div>
        `;
    }

    function renderMonthCloseHistory() {
        const history = safeArray(currentReview && currentReview.history).slice(0, 3);
        return `
            <div class="fin-monthly-review-panel" aria-label="Saved checkpoints">
                <div class="fin-eyebrow">Saved checkpoints</div>
                ${history.length ? history.map((entry) => {
                    const summary = entry.summary || {};
                    const runway = Number(summary.runwayNow);
                    const runwayLabel = Number.isFinite(runway) ? `${runway.toFixed(1)} months` : 'Unknown';
                    const forecastLabel = summary.forecastExpectedCash == null ? '' : ` · 30-day ${formatCurrency(summary.forecastExpectedCash)}`;
                    return `
                        <div class="fin-review-check-row is-ready">
                            <span>
                                <strong>${escapeHtml(entry.monthKey || 'Checkpoint')}</strong>
                                <small>Saved ${formatShortDate(entry.closedAt)}${escapeHtml(forecastLabel)} · ${escapeHtml(summary.mainRisk || 'No major checkpoint risk detected.')}</small>
                                <small>${escapeHtml(summary.mainAction || 'Keep next month reviewed on the same cadence.')}</small>
                            </span>
                            <span class="fin-status-pill">${summary.unresolvedItems || 0} open · ${escapeHtml(runwayLabel)}</span>
                            <strong class="${Number(summary.netMovement) >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${Number(summary.netMovement) >= 0 ? '+' : '-'}${formatCurrency(Math.abs(Number(summary.netMovement) || 0))}</strong>
                        </div>
                    `;
                }).join('') : renderCompactEmpty('Save a checkpoint to start the local review history.')}
            </div>
        `;
    }

    function financeIconButton({ action, args, label, icon = 'edit', tone = 'muted', extraClass = '', attrs = '', local = false }) {
        const actionAttr = local
            ? `data-fin-action="${escapeHtml(action)}"`
            : `data-action="${escapeHtml(action)}"${args ? ` data-action-args="${escapeHtml(args)}"` : ''}`;
        return `
            <button class="fin-mini-btn fin-icon-btn ${extraClass}" type="button" ${actionAttr} ${attrs} aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">
                ${renderSAGGlyph(icon, { size: 'xs', tone })}
            </button>
        `;
    }

    function financeTransactionIconButton({ action, transactionId, label, icon = 'attention', tone = 'muted', extraClass = '' }) {
        return `
            <button class="fin-mini-btn fin-icon-btn ${extraClass}" type="button" data-fin-action="${escapeHtml(action)}" data-fin-transaction-id="${escapeHtml(transactionId)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">
                ${renderSAGGlyph(icon, { size: 'xs', tone })}
            </button>
        `;
    }

    function reviewIconButton(options) {
        return financeIconButton(options);
    }

    function renderWeeklyReviewSection() {
        const reviewDue = isWeeklyReviewDue();
        const accounts = safeArray(currentData && currentData.fiatAccounts);
        const queue = treasuryArray('reviewQueue');
        const dueObligations = treasuryArray('obligations').filter((entry) => ['overdue', 'due_soon', 'needs_review'].includes(String(entry && entry.status || '')));
        const runwayReady = Number(currentSnapshot && currentSnapshot.runwayMonths) >= 3;
        const checks = [
            ['unresolvedItems', 'Resolve unclear items', queue.filter((item) => String(item && item.kind) === 'transaction' || String(item && item.kind) === 'payment').length === 0, 'Classify or match records that affect the ledger.'],
            ['matchPayments', 'Match payments', queue.filter((item) => String(item && item.kind) === 'payment').length === 0, 'Tie payments to obligations when there is a clear match.'],
            ['confirmObligations', 'Confirm obligations', dueObligations.length === 0, 'Pay, defer, or keep due costs flagged for review.'],
            ['reviewSignals', 'Review signals', runwayReady, 'Read runway, low points, and missing inputs before saving.'],
            ['closeMonth', 'Save checkpoint', true, 'Save the review note and reset the operating loop.']
        ];
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-monthly-review-workspace">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">${reviewDue ? 'Checkpoint recommended' : 'Checkpoint saved'}</div>
                            <div class="fin-helper-text">Keep Flow updated weekly. Save checkpoints when you want history, pattern memory, or a review note.</div>
                            <div class="fin-operating-meta">Last reviewed ${formatShortDate(currentReview && currentReview.lastReviewedAt)}</div>
                        </div>
                        <button class="fin-mini-btn fin-mini-btn--primary" type="button" data-fin-action="complete-monthly-review-inline">Save checkpoint</button>
                    </div>
                    <div class="fin-monthly-review-grid">
                        <div class="fin-monthly-review-panel">
                            <div class="fin-eyebrow">Cash accounts</div>
                            ${accounts.length ? accounts.map((account, index) => `
                                <label class="fin-review-check-row">
                                    <input class="monthly-review-account-check" type="checkbox" data-account-id="${escapeHtml(account.id)}" data-review-index="${index}" />
                                    <span><strong>${escapeHtml(account.name || 'Account')}</strong><small>${escapeHtml(account.scope || 'shared')} · Confirm live balance</small></span>
                                    <input id="monthly-review-balance-${index}" aria-label="${escapeHtml(account.name || 'Account')} reconciled balance" type="number" step="0.01" value="${escapeHtml(account.balance)}" />
                                </label>
                            `).join('') : renderCompactEmpty('Add a cash account before completing a review.')}
                        </div>
                        <div class="fin-monthly-review-panel">
                            <div class="fin-eyebrow">Review steps</div>
                            ${checks.map(([id, label, ready, note]) => `
                                <label class="fin-review-check-row ${ready ? 'is-ready' : ''}">
                                    <input id="monthly-review-${id}" class="monthly-review-check" type="checkbox" />
                                    <span><strong>${escapeHtml(label)}</strong><small>${escapeHtml(note)}</small></span>
                                    <span class="fin-status-pill">${ready ? 'Ready' : 'Check'}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    ${renderMonthCloseSummary()}
                    ${renderMonthCloseHistory()}
                    <label class="fin-review-notes">
                        <span class="fin-eyebrow">Review note</span>
                        <textarea id="monthly-review-notes" rows="3" placeholder="What changed, what needs attention?">${escapeHtml(currentReview && currentReview.notes || '')}</textarea>
                    </label>
                    ${monthlyReviewError ? `<div class="fin-inline-error" role="alert">${escapeHtml(monthlyReviewError)}</div>` : ''}
                </div>
            </section>
        `;
    }

    function renderReviewRow(item, actionHtml) {
        return `
            <div class="fin-review-row">
                <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.reason)} · ${escapeHtml(item.kind || 'review')}</small></span>
                <span>${renderStatusPill(item.tone === 'urgent' ? 'overdue' : 'needs_review')}</span>
                <span class="fin-review-row-action">${actionHtml}</span>
            </div>
        `;
    }

    function renderObligationRow(entry, actionHtml) {
        return `
            <div class="fin-review-row">
                <span><strong>${escapeHtml(entry.title)}</strong><small>${entry.dueDate ? formatShortDate(entry.dueDate) : 'No due date'} · ${escapeHtml(entry.scope || 'shared')}</small></span>
                <span>${renderStatusPill(entry.status)} ${formatCurrency(entry.amount)}</span>
                <span class="fin-review-row-action">${actionHtml}</span>
            </div>
        `;
    }

    function renderPaymentRow(entry, actionHtml) {
        const matched = Boolean(entry.obligationId);
        return `
            <div class="fin-review-row">
                <span><strong>${escapeHtml(entry.description || 'Payment')}</strong><small>${formatShortDate(entry.timestamp)} · ${escapeHtml(entry.accountName || 'Account')} · ${escapeHtml(entry.categoryId || 'uncategorized')}</small></span>
                <span>${renderStatusPill(matched ? 'paid' : 'needs_review')} ${formatCurrency(entry.amount, entry.currency)}</span>
                <span class="fin-review-row-action">${actionHtml}</span>
            </div>
        `;
    }

    function renderImportProfileRows(profiles) {
        if (!profiles.length) return renderCompactEmpty('Saved CSV mappings will appear here after a successful import.');
        return `
            <div class="fin-import-profile-list" aria-label="Saved CSV profiles">
                ${profiles.map((profile) => {
                    const mapping = profile.mapping || {};
                    const mapped = ['date', 'description', 'amount', 'debit', 'credit', 'category', 'scope']
                        .filter((key) => String(mapping[key] || '').trim()).length;
                    return `
                        <div class="fin-import-profile-row">
                            <div class="fin-import-profile-main">
                                <input data-fin-profile-name="${escapeHtml(profile.id)}" aria-label="CSV profile name" value="${escapeHtml(profile.name || 'CSV mapping')}" />
                                <small>${safeArray(profile.headers).length} headers · ${mapped} mapped · ${escapeHtml(profile.defaultCategory || 'uncategorized')} · ${escapeHtml(profile.defaultScope || 'business')} · updated ${formatShortDate(profile.updatedAt)}</small>
                            </div>
                            <div class="fin-ledger-actions">
                                ${financeIconButton({ action: 'rename-import-profile', label: `Rename ${profile.name || 'CSV profile'}`, icon: 'success', tone: 'success', attrs: `data-fin-profile-id="${escapeHtml(profile.id)}"`, local: true })}
                                ${financeIconButton({ action: 'delete-import-profile', label: `Delete ${profile.name || 'CSV profile'}`, icon: 'close', tone: 'danger', attrs: `data-fin-profile-id="${escapeHtml(profile.id)}"`, local: true })}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderImportBatchRows(batches) {
        if (!batches.length) return renderCompactEmpty('No local imports found. Bring in your bank statements (CSV).');
        return `
            <div class="fin-import-profile-list" aria-label="CSV import batches">
                ${batches.slice().reverse().slice(0, 4).map((batch, index) => {
                    const imported = Number(batch.importedCount ?? safeArray(batch.fingerprints).length) || 0;
                    const duplicateCount = Number(batch.duplicateCount || 0);
                    const duplicateImported = Number(batch.duplicateImportedCount || 0);
                    const rejected = Number(batch.rejectedCount || 0);
                    const policy = batch.duplicatePolicy === 'import' ? 'duplicates imported' : 'duplicates skipped';
                    const dateRange = batch.dateFrom && batch.dateTo
                        ? (batch.dateFrom === batch.dateTo ? batch.dateFrom : `${batch.dateFrom} to ${batch.dateTo}`)
                        : 'date range unknown';
                    const totalLine = `${formatCurrency(Number(batch.incomeTotal || 0))} in · ${formatCurrency(Number(batch.expenseTotal || 0))} out`;
                    const activeRows = safeArray(currentData && currentData.transactions).filter((entry) => String(entry && entry.importBatchId || '') === String(batch.id)).length;
                    return `
                        <div class="fin-import-profile-row">
                            <div class="fin-import-profile-main">
                                <strong>${index === 0 ? 'Latest CSV batch' : 'CSV batch'}</strong>
                                <small>${escapeHtml(batch.sourceFile || 'CSV import')} · ${imported} imported · ${duplicateCount} duplicate${duplicateCount === 1 ? '' : 's'} (${policy}) · ${rejected} rejected</small>
                                <small>${escapeHtml(dateRange)} · ${totalLine}${duplicateImported ? ` · ${duplicateImported} duplicate${duplicateImported === 1 ? '' : 's'} included` : ''} · ${activeRows ? `${activeRows} active` : 'undo applied'}</small>
                                <small>Batch ID ${escapeHtml(batch.id)}</small>
                            </div>
                            <div class="fin-ledger-actions">
                                <button class="fin-mini-btn" type="button" data-action="undoImportBatch" data-action-args="'${escapeActionArg(batch.id)}'">Undo</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderDataSection() {
        const importState = window.Store && typeof window.Store.getImportState === 'function'
            ? window.Store.getImportState()
            : { batches: [], profiles: [] };
        const batches = safeArray(importState.batches);
        const profiles = safeArray(importState.profiles);
        const dataHealth = window.Store && typeof window.Store.getLocalDataHealth === 'function'
            ? window.Store.getLocalDataHealth()
            : { ok: true, issues: [], eventCount: 0, latestEventAt: null, storageStatus: 'healthy', schemaLabel: 'unknown', backupVersion: 0, lastBackupAt: null, privateModeWarning: false, migrationStatus: 'current' };
        const storageStatus = String(dataHealth.storageStatus || 'healthy');
        const storageLabel = storageStatus === 'unavailable' ? 'Unavailable' : (storageStatus === 'limited' ? 'Limited' : 'Healthy');
        const backupLabel = dataHealth.lastBackupAt ? formatShortDate(dataHealth.lastBackupAt) : 'Never';
        return `
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Imports and Backups</div>
                        <div class="fin-helper-text">Everything stays local. Use exports before big changes or device moves.</div>
                        ${renderImportBatchRows(batches)}
                        <div class="fin-action-row">
                            <button class="fin-action-btn" type="button" data-action="openEditModal" data-action-args="'csvImport'">Import CSV</button>
                            <button class="fin-action-btn" type="button" data-action="exportTransactionsCsv">Export transactions CSV</button>
                            <button class="fin-action-btn" type="button" data-action="exportFinanceBackup">Export backup</button>
                            <button class="fin-action-btn" type="button" data-action="openEditModal" data-action-args="'backupRestore'">Restore backup</button>
                        </div>
                        <div class="fin-subsection-block">
                            <div class="fin-eyebrow">Saved CSV profiles</div>
                            ${renderImportProfileRows(profiles)}
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Local Data Health</div>
                        <div class="fin-helper-text">${dataHealth.ok ? 'Local finance data is readable and backup-ready.' : 'Some local Finance Master data needs attention.'}</div>
                        <div class="modal-list-row">
                            <span><strong>${dataHealth.ok ? 'Healthy' : 'Needs attention'}</strong><br><small>${Number(dataHealth.eventCount || 0)} finance events${dataHealth.latestEventAt ? ` · latest ${formatShortDate(dataHealth.latestEventAt)}` : ''}</small></span>
                            <span>${dataHealth.issues.length} issue${dataHealth.issues.length === 1 ? '' : 's'}</span>
                        </div>
                        <div class="backup-preview-card">
                            <div><span>Storage</span><strong>${storageLabel}</strong></div>
                            <div><span>Last backup</span><strong>${backupLabel}</strong></div>
                            <div><span>Schema</span><strong>${escapeHtml(dataHealth.schemaLabel || 'unknown')}</strong></div>
                            <div><span>Migration</span><strong>${escapeHtml(dataHealth.migrationStatus || 'current')}</strong></div>
                        </div>
                        ${dataHealth.privateModeWarning ? `
                            <div class="fin-compact-empty">Your browser may not keep local data permanently in this mode. Export a backup before closing this window.</div>
                        ` : ''}
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

    function normalizeMonthlyEquivalent(amount, frequency = 'monthly') {
        const value = Math.abs(Number(amount) || 0);
        const raw = String(frequency || 'monthly').toLowerCase().replace(/[\s-]+/g, '_');
        if (raw === 'weekly' || raw === 'week') return value * 52 / 12;
        if (raw === 'biweekly' || raw === 'two_weekly' || raw === 'every_two_weeks' || raw === 'fortnightly') return value * 26 / 12;
        if (raw === 'quarterly' || raw === 'quarter') return value / 3;
        if (raw === 'yearly' || raw === 'annual' || raw === 'annually') return value / 12;
        return value;
    }

    function treasuryDebtMonthlyPayment(debt) {
        const normalized = Number(debt && debt.minimumPaymentMonthly);
        if (Number.isFinite(normalized)) return Math.max(0, normalized);
        return normalizeMonthlyEquivalent(debt && debt.minimumPayment, debt && debt.frequency);
    }

    function treasuryDebtHasPlan(debt) {
        return Boolean(
            (debt && debt.planType === 'custom' && safeArray(debt.installments).length > 0)
            || treasuryDebtMonthlyPayment(debt) > 0
            || String(debt && debt.paymentPlanNote || '').trim()
        );
    }

    function treasuryReserveGap(buckets) {
        return safeArray(buckets).reduce((sum, bucket) => {
            const target = Math.max(0, Number(bucket && bucket.targetAmount) || 0);
            const current = Math.max(0, Number(bucket && bucket.currentAmount) || 0);
            return sum + Math.max(0, target - current);
        }, 0);
    }

    function sortedTreasuryExpenses(expenses) {
        const orderMap = {};
        try {
            const raw = localStorage.getItem('finance-master.ui.expenseOrder');
            if (raw) JSON.parse(raw).forEach((id, idx) => { orderMap[id] = idx; });
        } catch (error) {}
        return safeArray(expenses).slice().sort((a, b) => {
            const posA = Object.prototype.hasOwnProperty.call(orderMap, a && a.id) ? orderMap[a.id] : 99999;
            const posB = Object.prototype.hasOwnProperty.call(orderMap, b && b.id) ? orderMap[b.id] : 99999;
            return posA - posB;
        });
    }

    function treasuryFlowPercent(value, maxValue) {
        const max = Math.max(1, Math.abs(Number(maxValue) || 0));
        return Math.max(6, Math.min(100, (Math.abs(Number(value) || 0) / max) * 100));
    }

    function renderTreasuryCostRows(costs, label) {
        return safeArray(costs).length ? safeArray(costs).map((expense) => `
            <div class="fin-treasury-compact-row">
                <span>
                    <strong>${escapeHtml(expense.category || 'Recurring cost')}</strong>
                    <small>Due day ${escapeHtml(String(expense.dueDay || 'not set'))} · ${escapeHtml(expense.scope || 'shared')} · ${escapeHtml(label)}</small>
                </span>
                <span>
                    <strong>${formatCurrency(expense.monthlyAmount)} / mo</strong>
                    ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'expense', '${escapeActionArg(expense.id)}'`, label: `Edit ${expense.category || 'recurring cost'}` })}
                </span>
            </div>
        `).join('') : renderCompactEmpty(`No ${label.toLowerCase()} costs recorded.`);
    }

    function renderTreasuryReserveCards(buckets) {
        return safeArray(buckets).length ? safeArray(buckets).map((bucket) => {
            const current = Math.max(0, Number(bucket.currentAmount) || 0);
            const target = Math.max(0, Number(bucket.targetAmount) || 0);
            const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 100;
            const status = pct >= 100 ? 'Protected' : (pct >= 50 ? 'Building' : 'Below target');
            return `
                <div class="fin-treasury-reserve-card">
                    <div class="fin-treasury-reserve-head">
                        <span>
                            <strong>${escapeHtml(bucket.name || 'Reserve bucket')}</strong>
                            <small>${escapeHtml(String(bucket.purpose || 'reserve').replace(/_/g, ' '))} · ${escapeHtml(bucket.scope || 'shared')}</small>
                        </span>
                        ${renderStatusPill(status)}
                    </div>
                    <div class="fin-treasury-reserve-value">
                        <strong>${formatCurrency(current)}</strong>
                        <small>of ${formatCurrency(target)}</small>
                    </div>
                    <div class="fin-treasury-meter"><span style="width:${pct}%"></span></div>
                    <div class="fin-treasury-row-actions">
                        ${financeIconButton({ action: 'openEditModal', args: `'reserveBucket', '${escapeActionArg(bucket.id)}'`, label: `Adjust target for ${bucket.name || 'reserve bucket'}` })}
                    </div>
                </div>
            `;
        }).join('') : renderCompactEmpty('Protect your runway. Create your first reserve bucket, such as taxes or buffer.');
    }

    function renderTreasuryDebtCards(debts, limit = 3) {
        const list = safeArray(debts)
            .filter((debt) => Math.max(0, Number(debt && debt.outstanding) || 0) > 0)
            .sort((a, b) => treasuryDebtMonthlyPayment(b) - treasuryDebtMonthlyPayment(a))
            .slice(0, limit);
        return list.length ? list.map((debt) => {
            const outstanding = Math.max(0, Number(debt.outstanding) || 0);
            const totalAdded = Math.max(0, Number(debt.totalAdded) || 0);
            const paid = Math.max(0, Number(debt.totalPaid) || 0);
            const pct = totalAdded > 0 ? Math.min(100, Math.round((paid / totalAdded) * 100)) : 0;
            const monthly = treasuryDebtMonthlyPayment(debt);
            const hasPlan = treasuryDebtHasPlan(debt);
            return `
                <div class="fin-treasury-debt-card">
                    <div class="fin-treasury-debt-head">
                        <span>
                            <strong>${escapeHtml(debt.name || 'Debt item')}</strong>
                            <small>${debt.dueDate ? `Due ${formatShortDate(debt.dueDate)} · ` : ''}${escapeHtml(debt.scope || 'shared')}</small>
                        </span>
                        ${renderStatusPill(hasPlan ? 'Reviewed' : 'Needs review')}
                    </div>
                    <div class="fin-treasury-debt-main">
                        <strong>${formatCurrency(outstanding)}</strong>
                        <span>${monthly > 0 ? `${formatCurrency(monthly)} / mo pressure` : 'No monthly plan'}</span>
                    </div>
                    <div class="fin-treasury-meter fin-treasury-meter--debt"><span style="width:${pct}%"></span></div>
                    <div class="fin-treasury-debt-foot">
                        <small>${paid > 0 ? `${formatCurrency(paid)} paid` : 'Repayment not started'}</small>
                        <small>${debt.estimatedPayoffDate ? `Projected payoff ${formatShortDate(debt.estimatedPayoffDate)}` : 'Payoff timeline needs plan'}</small>
                    </div>
                    <div class="fin-treasury-row-actions">
                        ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'debtPlan', '${escapeActionArg(debt.id)}'`, label: `Edit payment plan for ${debt.name || 'debt item'}` })}
                    </div>
                </div>
            `;
        }).join('') : renderCompactEmpty('Debt-free operations.');
    }

    function renderTreasuryDebtDetailRows(debts) {
        const list = safeArray(debts)
            .filter((debt) => Math.max(0, Number(debt && debt.outstanding) || 0) > 0)
            .sort((a, b) => String(a && a.name || '').localeCompare(String(b && b.name || '')));
        return list.length ? list.map((debt) => {
            const outstanding = Math.max(0, Number(debt && debt.outstanding) || 0);
            const monthly = treasuryDebtMonthlyPayment(debt);
            const hasPlan = treasuryDebtHasPlan(debt);
            const planLabel = hasPlan ? 'Plan reviewed' : 'Payment plan missing';
            const fields = [
                ['Outstanding', formatCurrency(outstanding)],
                ['Monthly pressure', monthly > 0 ? `${formatCurrency(monthly)} / month` : 'Not set'],
                ['Next due', debt && debt.dueDate ? formatShortDate(debt.dueDate) : 'Not set'],
                ['Payoff estimate', debt && debt.estimatedPayoffDate ? formatShortDate(debt.estimatedPayoffDate) : 'Needs plan'],
                ['Scope', debt && debt.scope ? String(debt.scope) : 'shared'],
                ['Plan note', debt && debt.paymentPlanNote ? String(debt.paymentPlanNote) : '']
            ].filter((item) => String(item[1] || '').trim());
            return `
                <div class="fin-treasury-detail-row">
                    <div class="fin-treasury-detail-head">
                        <span>
                            <strong>${escapeHtml(debt && debt.name || 'Debt item')}</strong>
                            <small>${escapeHtml(planLabel)}</small>
                        </span>
                        ${renderStatusPill(hasPlan ? 'Reviewed' : 'Needs review')}
                    </div>
                    <div class="fin-treasury-detail-grid">
                        ${fields.map(([label, value]) => `
                            <div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('') : renderCompactEmpty('Debt-free operations.');
    }

    function activeTreasuryProjects() {
        return safeArray(currentData?.projectProfiles)
            .filter((profile) => profile && String(profile.status || 'active') !== 'archived')
            .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    }

    function treasuryProjectId(entry) {
        return String(entry && entry.projectId || '').trim();
    }

    function treasuryProjectMatches(entry, selectedProject) {
        const selected = String(selectedProject || 'all');
        if (selected === 'all') return true;
        const id = treasuryProjectId(entry);
        if (selected === 'unassigned') return !id;
        return id === selected;
    }

    function sumMoney(items, selector) {
        return safeArray(items).reduce((sum, item) => sum + (Number(selector(item)) || 0), 0);
    }

    function getTreasuryProjectContext() {
        const projects = activeTreasuryProjects();
        const rawSelected = getTreasuryProjectView();
        const project = projects.find((profile) => String(profile.id) === rawSelected) || null;
        const selected = rawSelected === 'unassigned' || project ? rawSelected : 'all';
        if (selected !== rawSelected) setTreasuryProjectView(selected);
        const isProjectView = selected !== 'all';
        const label = selected === 'all'
            ? 'All Plan'
            : (selected === 'unassigned' ? 'Unassigned' : String(project?.name || 'Project plan'));
        const filter = (items) => safeArray(items).filter((entry) => treasuryProjectMatches(entry, selected));
        const fiatAccounts = filter(currentData?.fiatAccounts);
        const reserveBuckets = filter(currentData?.reserveBuckets);
        const recurringExpenses = filter(currentData?.recurringExpenses);
        const debtAccounts = filter(currentData?.debtAccounts);
        const pipelineDeals = filter(currentData?.pipelineDeals);
        const invoices = filter(currentData?.invoices);
        const transactions = filter(currentData?.transactions);
        const accountIds = new Set(fiatAccounts.map((account) => String(account.id || '')).filter(Boolean));
        return {
            selected,
            label,
            project,
            projects,
            isProjectView,
            fiatAccounts,
            reserveBuckets,
            recurringExpenses,
            debtAccounts,
            pipelineDeals,
            invoices,
            transactions,
            accountIds
        };
    }

    function renderTreasuryProjectStrip(context) {
        const projects = safeArray(context?.projects);
        const selected = String(context?.selected || 'all');
        const profileButton = (id, label, meta = '') => `
            <button class="fin-treasury-profile-btn ${selected === id ? 'active' : ''}" type="button" data-fin-action="set-treasury-project" data-fin-project="${escapeHtml(id)}" aria-pressed="${selected === id ? 'true' : 'false'}">
                <span>${escapeHtml(label)}</span>
                ${meta ? `<small>${escapeHtml(meta)}</small>` : ''}
            </button>
        `;
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-treasury-profiles">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Plan Profiles</div>
                            <div class="fin-helper-text">Tagged views for projects, clients, and individual wallets. The full Plan stays canonical.</div>
                        </div>
                        <div class="fin-treasury-profile-actions">
                            ${context?.project && selected !== 'unassigned' ? financeIconButton({ action: 'openEditModal', args: `'projectProfile', '${escapeActionArg(context.project.id)}'`, label: `Edit ${context.project.name || 'project plan'}` }) : ''}
                            <button class="fin-mini-btn fin-mini-btn--primary" type="button" data-action="openEditModal" data-action-args="'projectProfile'">Add project</button>
                        </div>
                    </div>
                    <div class="fin-treasury-profile-strip" role="list" aria-label="Plan profile views">
                        ${profileButton('all', 'All Plan', 'Full system')}
                        ${projects.map((profile) => profileButton(String(profile.id), profile.name || 'Project plan', profile.clientOrPurpose || 'Project view')).join('')}
                        ${profileButton('unassigned', 'Unassigned', 'No project tag')}
                    </div>
                </div>
            </section>
        `;
    }

    function renderReservesSection() {
        const projectContext = getTreasuryProjectContext();
        const fiatAccounts = safeArray(projectContext.fiatAccounts);
        const buckets = safeArray(projectContext.reserveBuckets);
        const debts = safeArray(projectContext.debtAccounts);
        const expenses = sortedTreasuryExpenses(projectContext.recurringExpenses);
        const essentialCosts = expenses.filter((expense) => expense && expense.essential);
        const flexibleCosts = expenses.filter((expense) => !expense || !expense.essential);
        const essentialTotal = essentialCosts.reduce((sum, expense) => sum + (Number(expense.monthlyAmount) || 0), 0);
        const flexibleTotal = flexibleCosts.reduce((sum, expense) => sum + (Number(expense.monthlyAmount) || 0), 0);
        const debtMonthlyPressure = debts.reduce((sum, debt) => sum + treasuryDebtMonthlyPayment(debt), 0);
        const projectActualCash = sumMoney(fiatAccounts, (account) => account.balance);
        const projectProtectedCash = sumMoney(buckets, (bucket) => bucket.currentAmount);
        const projectCommittedObligations = essentialTotal + flexibleTotal + debtMonthlyPressure;
        const projectAvailableCash = projectActualCash - projectProtectedCash - projectCommittedObligations;
        const actualCash = projectContext.isProjectView
            ? projectActualCash
            : treasuryNumber('actualCash', treasuryNumber('totalCash', Number(currentSnapshot?.realBalance) || 0));
        const protectedCash = projectContext.isProjectView
            ? projectProtectedCash
            : treasuryNumber('protectedCash', treasuryNumber('reservedCash', Number(currentSnapshot?.reservedCash) || 0));
        const committedObligations = projectContext.isProjectView
            ? projectCommittedObligations
            : treasuryNumber('committedShortTermObligations', 0);
        const availableCash = projectContext.isProjectView
            ? projectAvailableCash
            : treasuryNumber('availableCash', Number.isFinite(Number(currentSnapshot?.availableCash)) ? Number(currentSnapshot.availableCash) : actualCash - protectedCash);
        const monthlyBurn = projectContext.isProjectView
            ? projectCommittedObligations
            : treasuryNumber('totalMonthlyBurn', Number(currentSnapshot?.monthlyBurn) || (essentialTotal + flexibleTotal + debtMonthlyPressure));
        const runway = projectContext.isProjectView
            ? (monthlyBurn > 0 ? availableCash / monthlyBurn : null)
            : Number(currentTreasury?.runwayMonths ?? currentSnapshot?.runwayMonths);
        const runwayLabel = Number.isFinite(runway) ? `${runway.toFixed(1)} months` : 'Unknown';
        const activeDebts = debts.filter((debt) => Math.max(0, Number(debt && debt.outstanding) || 0) > 0);
        const totalDebt = projectContext.isProjectView
            ? activeDebts.reduce((sum, debt) => sum + (Number(debt.outstanding) || 0), 0)
            : treasuryNumber('debtRemaining', explanationNumber('debtBurden', activeDebts.reduce((sum, debt) => sum + (Number(debt.outstanding) || 0), 0)));
        const missingPlans = activeDebts.filter((debt) => !treasuryDebtHasPlan(debt));
        const reserveTarget = buckets.reduce((sum, bucket) => sum + Math.max(0, Number(bucket.targetAmount) || 0), 0);
        const reserveGap = treasuryReserveGap(buckets);
        const flowResult = availableCash - essentialTotal - flexibleTotal - debtMonthlyPressure;
        const maxFlowValue = Math.max(1, Math.abs(availableCash), essentialTotal, flexibleTotal, debtMonthlyPressure, protectedCash, Math.abs(flowResult));
        let goals = typeof window.Store.getGoalProgress === 'function'
            ? window.Store.getGoalProgress(window.Store.getUiSettings().scopeFilter || 'all')
            : [];
        if (projectContext.isProjectView) {
            goals = safeArray(goals).filter((goal) => safeArray(goal.linkedAccountIds).some((id) => projectContext.accountIds.has(String(id))));
        }
        let pulseStatus = { label: 'Stable', className: 'is-stable', copy: 'Plan has breathing room.' };
        if (availableCash < 0 || flowResult < 0) {
            pulseStatus = { label: 'Critical shortfall', className: 'is-critical', copy: 'Near-term obligations need coverage before future goals.' };
        } else if (Number.isFinite(runway) && runway < 2) {
            pulseStatus = { label: 'Tight runway', className: 'is-watch', copy: 'Cash covers a thin operating window.' };
        } else if (missingPlans.length) {
            pulseStatus = { label: 'Needs plan', className: 'is-watch', copy: 'Debt plans need confirmation for reliable burn.' };
        } else if (reserveGap > 0) {
            pulseStatus = { label: 'Needs protection', className: 'is-watch', copy: 'Reserve targets are not fully protected yet.' };
        }
        let nextMove = {
            title: 'Keep Plan reviewed',
            body: 'Your main structure is in shape. Keep the checkpoint loop current.',
            primaryLabel: 'Open Review',
            primaryAction: 'FinancialMode.setSection',
            primaryArgs: "'review'",
            secondary: []
        };
        if (availableCash < 0 || flowResult < 0) {
            nextMove = {
                title: 'Cover near-term obligations before funding savings goals',
                body: 'Free cash is under pressure. Stabilize the next 30 days before adding to future goals.',
                primaryLabel: 'Allocate available cash',
                primaryAction: 'openEditModal',
                primaryArgs: "'allocateReserves'",
                secondary: [
                    { label: 'Review flexible costs', localAction: 'open-treasury-panel', section: 'treasury-burn-flexible' },
                    ...(activeDebts.length ? [{ label: 'Open debt planner', action: 'FinancialMode.openAddModal', args: `'debtPlan', '${escapeActionArg((missingPlans[0] || activeDebts[0] || {}).id || '')}'` }] : [])
                ]
            };
        } else if (missingPlans.length) {
            nextMove = {
                title: 'Confirm debt payment plans',
                body: 'Monthly pressure is clearer once every liability has a payment plan.',
                primaryLabel: 'Open debt planner',
                primaryAction: 'FinancialMode.openAddModal',
                primaryArgs: `'debtPlan', '${escapeActionArg(missingPlans[0].id)}'`,
                secondary: [{ label: 'Review debt pressure', localAction: 'open-treasury-panel', section: 'treasury-debt-details' }]
            };
        } else if (reserveGap > 0) {
            nextMove = {
                title: 'Protect priority reserves',
                body: 'Some money still needs a job. Fund the most important bucket first.',
                primaryLabel: 'Add reserve bucket',
                primaryAction: 'openEditModal',
                primaryArgs: "'reserveBucket'",
                secondary: [{ label: 'Allocate cash', action: 'openEditModal', args: "'allocateReserves'" }]
            };
        } else if (flexibleTotal > essentialTotal * 0.35 && flexibleTotal > 0) {
            nextMove = {
                title: 'Review flexible costs',
                body: 'A small cut to discretionary burn can extend your breathing room.',
                primaryLabel: 'Review flexible costs',
                primaryLocalAction: 'open-treasury-panel',
                primarySection: 'treasury-burn-flexible',
                secondary: [{ label: 'Add recurring cost', action: 'FinancialMode.openAddModal', args: "'expense'" }]
            };
        }
        const primaryButton = nextMove.primaryLocalAction
            ? `<button class="fin-mini-btn fin-mini-btn--primary" type="button" data-fin-action="${escapeHtml(nextMove.primaryLocalAction)}" data-fin-section="${escapeHtml(nextMove.primarySection)}">${escapeHtml(nextMove.primaryLabel)}</button>`
            : `<button class="fin-mini-btn fin-mini-btn--primary" type="button" data-action="${escapeHtml(nextMove.primaryAction)}" data-action-args="${escapeHtml(nextMove.primaryArgs || '')}">${escapeHtml(nextMove.primaryLabel)}</button>`;
        const secondaryButtons = safeArray(nextMove.secondary).map((button) => button.localAction
            ? `<button class="fin-mini-btn" type="button" data-fin-action="${escapeHtml(button.localAction)}" data-fin-section="${escapeHtml(button.section || '')}">${escapeHtml(button.label)}</button>`
            : `<button class="fin-mini-btn" type="button" data-action="${escapeHtml(button.action)}" data-action-args="${escapeHtml(button.args || '')}">${escapeHtml(button.label)}</button>`
        ).join('');
        const flowItems = [
            { label: 'Cash available', value: availableCash, tone: 'safe' },
            { label: 'Essential costs', value: -essentialTotal, tone: 'essential' },
            { label: 'Flexible costs', value: -flexibleTotal, tone: 'flexible' },
            { label: 'Debt pressure', value: -debtMonthlyPressure, tone: 'debt' },
            { label: 'Protected reserves', value: protectedCash, tone: 'protected' },
            { label: flowResult >= 0 ? 'Resulting surplus' : 'Resulting shortfall', value: flowResult, tone: flowResult >= 0 ? 'safe' : 'critical' },
        ];

        return `
            ${renderTreasuryProjectStrip(projectContext)}

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-treasury-pulse ${pulseStatus.className}">
                    <div class="fin-treasury-pulse-main">
                        <span class="fin-eyebrow">Money Plan</span>
                        <div class="fin-treasury-profile-context">${escapeHtml(projectContext.label)}${projectContext.isProjectView ? ' project view totals' : ' canonical totals'}</div>
                        <div class="fin-treasury-free-cash">
                            <span>${projectContext.isProjectView ? 'Project available cash' : 'Available cash after protection'}</span>
                            <strong class="${availableCash < 0 ? 'fin-val-neg' : 'fin-val-pos'}">${formatCurrency(availableCash)}</strong>
                        </div>
                        <p>Rules, containers, obligations, and commitments that shape the live cockpit.</p>
                    </div>
                    <div class="fin-treasury-pulse-side">
                        <div class="fin-treasury-status-chip">Structure</div>
                        <div class="fin-treasury-pulse-grid">
                            <div><span>Cash accounts</span><strong>${fiatAccounts.length}</strong></div>
                            <div><span>Recurring costs</span><strong>${expenses.length}</strong></div>
                            <div><span>Reserve buckets</span><strong>${buckets.length}</strong></div>
                            <div><span>Debt plans</span><strong>${activeDebts.length - missingPlans.length}/${activeDebts.length}</strong></div>
                            <div><span>Protected</span><strong>${formatCurrency(protectedCash)}</strong></div>
                            <div><span>Monthly burn</span><strong>${formatCurrency(monthlyBurn)}</strong></div>
                        </div>
                    </div>
                    <div class="fin-treasury-next-move">
                        <span class="fin-eyebrow">Payment plan rule</span>
                        <strong>Only active recurring debt plans affect burn.</strong>
                        <p>The full debt balance stays visible as liability. Monthly, quarterly, yearly, weekly, or biweekly plan payments are normalized into burn.</p>
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-treasury-flow-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Cash Structure</div>
                            <div class="fin-helper-text">How real balances, protected buckets, near-term obligations, and payment plans shape availability.</div>
                        </div>
                        <span class="fin-status-pill">Planned</span>
                    </div>
                    <div class="fin-treasury-pulse-grid">
                        <div><span>Actual cash</span><strong>${formatCurrency(actualCash)}</strong></div>
                        <div><span>Protected cash</span><strong>${formatCurrency(protectedCash)}</strong></div>
                        <div><span>Due in 30 days</span><strong>${formatCurrency(committedObligations)}</strong></div>
                        <div><span>Payment-plan burn</span><strong>${formatCurrency(debtMonthlyPressure)}</strong></div>
                        <div><span>Total liability</span><strong>${formatCurrency(totalDebt)}</strong></div>
                        <div><span>Structural runway</span><strong>${escapeHtml(runwayLabel)}</strong></div>
                    </div>
                    <div class="fin-treasury-flow">
                        ${flowItems.map((item) => `
                            <div class="fin-treasury-flow-step is-${escapeHtml(item.tone)}">
                                <div class="fin-treasury-flow-label"><span>${escapeHtml(item.label)}</span><strong>${item.value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(item.value))}</strong></div>
                                <div class="fin-treasury-flow-track"><span style="width:${treasuryFlowPercent(item.value, maxFlowValue)}%"></span></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-treasury-vault">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Protected Money</div>
                            <div class="fin-helper-text">Reserve buckets are money with a job. They should feel protected, not spare.</div>
                        </div>
                        <div class="fin-action-row">
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'allocateReserves'">Allocate cash</button>
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'reserveBucket'">Add reserve bucket</button>
                        </div>
                    </div>
                    <div class="fin-treasury-vault-summary">
                        <div><span>Total protected</span><strong>${formatCurrency(protectedCash)}</strong></div>
                        <div><span>Reserve target</span><strong>${formatCurrency(reserveTarget)}</strong></div>
                        <div><span>Still to protect</span><strong>${formatCurrency(reserveGap)}</strong></div>
                    </div>
                    <div class="fin-treasury-reserve-grid">
                        ${renderTreasuryReserveCards(buckets)}
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-treasury-burn">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Recurring Burn</div>
                            <div class="fin-helper-text">Monthly outflow by pressure type. Details stay tucked away until you need them.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Add recurring cost</button>
                    </div>
                    <div class="fin-treasury-burn-grid">
                        <div><span>Total monthly burn</span><strong>${formatCurrency(monthlyBurn)}</strong></div>
                        <div><span>Essential</span><strong>${formatCurrency(essentialTotal)}</strong><small>${pluralize(essentialCosts.length, 'item')}</small></div>
                        <div><span>Flexible</span><strong>${formatCurrency(flexibleTotal)}</strong><small>${pluralize(flexibleCosts.length, 'item')}</small></div>
                        <div><span>Debt payment plans</span><strong>${formatCurrency(debtMonthlyPressure)}</strong><small>${pluralize(activeDebts.length, 'liability', 'liabilities')}</small></div>
                    </div>
                    ${renderCollapsible('treasury-burn-essential', 'Essential Costs', `${formatCurrency(essentialTotal)} / month · ${pluralize(essentialCosts.length, 'item')}`, renderTreasuryCostRows(essentialCosts, 'Essential'))}
                    ${renderCollapsible('treasury-burn-flexible', 'Flexible Costs', `${formatCurrency(flexibleTotal)} / month · ${pluralize(flexibleCosts.length, 'item')}`, renderTreasuryCostRows(flexibleCosts, 'Flexible'))}
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-treasury-debt">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Debt & Payment Plans</div>
                            <div class="fin-helper-text">The liability balance is separate from the active payment plan pressure added to burn.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtAdd'">Add debt item</button>
                    </div>
                    <div class="fin-treasury-pressure-line">
                        <div><span>Total debt</span><strong>${formatCurrency(totalDebt)}</strong></div>
                        <div><span>Payment-plan burn</span><strong>${formatCurrency(debtMonthlyPressure)}</strong></div>
                        <div><span>Liabilities</span><strong>${activeDebts.length}</strong></div>
                        <div><span>Plans missing</span><strong>${missingPlans.length}</strong></div>
                    </div>
                    <div class="fin-treasury-debt-grid">${renderTreasuryDebtCards(activeDebts, 3)}</div>
                    ${renderCollapsible('treasury-debt-details', 'Debt Details', `${formatCurrency(totalDebt)} open · ${formatCurrency(debtMonthlyPressure)} / month`, renderTreasuryDebtDetailRows(activeDebts))}
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-treasury-goals">
                    <div class="fin-goals-heading">
                        <div>
                            <div class="widget-title ui-title">Savings & Future Goals</div>
                            <div class="fin-helper-text">${availableCash < 0 ? 'Pause future goals until the current shortfall is covered.' : 'Future goals sit below immediate Plan pressure.'}</div>
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
                    ` : renderCompactEmpty('Set one useful future goal after the current Plan pressure is understood.')}
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-treasury-accounts">
                    ${renderCollapsible('treasury-accounts', 'Account Details', `${formatCurrency(actualCash)} across ${pluralize(fiatAccounts.length, 'cash account')}`, `
                        <div class="fin-section-heading-row">
                            <div>
                                <div class="fin-helper-text">Manage real-world cash accounts without letting rows dominate Plan.</div>
                            </div>
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'fiatAccount'">Add cash account</button>
                        </div>
                        ${fiatAccounts.length ? fiatAccounts.map((acc) => `
                            <div class="fin-treasury-compact-row">
                                <span>
                                    <strong>${escapeHtml(acc.name)}</strong>
                                    <small>${escapeHtml(acc.scope || 'shared')} · ${acc.reserved ? 'protected cash' : 'available cash'}${acc.bucket ? ` · ${escapeHtml(String(acc.bucket).replace(/_/g, ' '))}` : ''}${acc.projectId ? ' · project plan' : ''}</small>
                                </span>
                                <span>
                                    <strong>${formatCurrency(acc.balance)}</strong>
                                    ${financeIconButton({ action: 'openEditModal', args: `'fiatAccount', '${escapeActionArg(acc.id)}'`, label: `Edit ${acc.name || 'cash account'}` })}
                                </span>
                            </div>
                        `).join('') : renderCompactEmpty('Establish your plan. Add your primary operating account.')}
                    `)}
                </div>
            </section>
        `;
    }

    function renderFixedCostsSection() {
        const expenses = safeArray(currentData?.recurringExpenses);
        const debts = safeArray(currentData?.debtAccounts);
        
        const orderMap = {};
        try {
            const raw = localStorage.getItem('finance-master.ui.expenseOrder');
            if (raw) {
                const arr = JSON.parse(raw);
                arr.forEach((id, idx) => orderMap[id] = idx);
            }
        } catch (e) {}
        
        expenses.sort((a, b) => {
            const posA = orderMap.hasOwnProperty(a.id) ? orderMap[a.id] : 99999;
            const posB = orderMap.hasOwnProperty(b.id) ? orderMap[b.id] : 99999;
            return posA - posB;
        });

        const recurringBurn = expenses.reduce((sum, e) => sum + (Number(e.monthlyAmount) || 0), 0);
        const totalBurn = treasuryNumber('totalMonthlyBurn', Number(currentSnapshot?.monthlyBurn) || recurringBurn);
        const essentialCosts = expenses.filter(e => e.essential);
        const flexCosts = expenses.filter(e => !e.essential);
        const essentialTotal = essentialCosts.reduce((sum, e) => sum + (Number(e.monthlyAmount) || 0), 0);
        const flexTotal = flexCosts.reduce((sum, e) => sum + (Number(e.monthlyAmount) || 0), 0);
        const totalDebt = explanationNumber('debtBurden', debts.reduce((sum, d) => sum + (Number(d.outstanding) || 0), 0));
        const totalMinPayments = debts.reduce((sum, d) => sum + (Number(d.minimumPayment) || 0), 0);
        
        return `
            <section class="fin-section">
                <!-- Summary KPIs -->
                <div class="fin-snapshot-grid fin-snapshot-grid--cockpit">
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Monthly burn</div>
                        <div class="fin-tile-value">${formatCurrency(totalBurn)}</div>
                        <div class="fin-tile-subline">${pluralize(expenses.length, 'recurring cost')}</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Essential</div>
                        <div class="fin-tile-value">${formatCurrency(essentialTotal)}</div>
                        <div class="fin-tile-subline">${pluralize(essentialCosts.length, 'item')} · cannot cut</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Flexible</div>
                        <div class="fin-tile-value">${formatCurrency(flexTotal)}</div>
                        <div class="fin-tile-subline">${pluralize(flexCosts.length, 'item')} · can reduce</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Total debt</div>
                        <div class="fin-tile-value fin-text-med">${formatCurrency(totalDebt)}</div>
                        <div class="fin-tile-subline">${pluralize(debts.length, 'liability', 'liabilities')}</div>
                    </div>
                </div>
            </section>

            <!-- Essential Costs -->
            <section class="fin-section">
                <div class="fin-section-heading-row">
                    <div>
                        <div class="widget-title ui-title">Essential Costs</div>
                        <div class="fin-helper-text">Non-negotiable monthly obligations. These define your survival burn rate.</div>
                    </div>
                    <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Add recurring cost</button>
                </div>
                ${essentialCosts.length ? essentialCosts.map((expense, i) => `
                    <div class="widget ui-card glass fin-card fin-list-item">
                        <div class="fin-list-item-main">
                            <strong>${escapeHtml(expense.category)}</strong>
                            <div class="fin-list-item-sub">Due day ${escapeHtml(String(expense.dueDay))} · ${escapeHtml(expense.scope || 'shared')} · Essential</div>
                        </div>
                        <div class="fin-list-item-actions">
                            <div class="fin-list-item-val">${formatCurrency(expense.monthlyAmount)} / mo</div>
                            <div class="fin-inline-icon-actions">
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${escapeActionArg(expense.id)}', '-1'" ${i === 0 ? 'disabled style="opacity:0.3"' : ''}>▲</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${escapeActionArg(expense.id)}', '1'" ${i === essentialCosts.length - 1 ? 'disabled style="opacity:0.3"' : ''}>▼</button>
                                ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'expense', '${escapeActionArg(expense.id)}'`, label: `Edit ${expense.category || 'recurring cost'}` })}
                            </div>
                        </div>
                    </div>
                `).join('') : renderCompactEmpty('Define your survival burn. What fixed costs keep the business alive?')}
            </section>

            <!-- Flexible Costs -->
            <section class="fin-section">
                <div class="fin-section-heading-row">
                    <div>
                        <div class="widget-title ui-title">Flexible Costs</div>
                        <div class="fin-helper-text">Subscriptions and discretionary spend. These are your first candidates for cutting.</div>
                    </div>
                </div>
                ${flexCosts.length ? flexCosts.map((expense, i) => `
                    <div class="widget ui-card glass fin-card fin-list-item">
                        <div class="fin-list-item-main">
                            <strong>${escapeHtml(expense.category)}</strong>
                            <div class="fin-list-item-sub">Due day ${escapeHtml(String(expense.dueDay))} · ${escapeHtml(expense.scope || 'shared')} · Flex</div>
                        </div>
                        <div class="fin-list-item-actions">
                            <div class="fin-list-item-val">${formatCurrency(expense.monthlyAmount)} / mo</div>
                            <div class="fin-inline-icon-actions">
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${escapeActionArg(expense.id)}', '-1'" ${i === 0 ? 'disabled style="opacity:0.3"' : ''}>▲</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${escapeActionArg(expense.id)}', '1'" ${i === flexCosts.length - 1 ? 'disabled style="opacity:0.3"' : ''}>▼</button>
                                ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'expense', '${escapeActionArg(expense.id)}'`, label: `Edit ${expense.category || 'recurring cost'}` })}
                            </div>
                        </div>
                    </div>
                `).join('') : renderCompactEmpty('Define your comfort burn. What costs are nice-to-have?')}
            </section>

            <!-- Debt Items -->
            <section class="fin-section">
                <div class="fin-section-heading-row">
                    <div>
                        <div class="widget-title ui-title">Debt & Liabilities</div>
                        <div class="fin-helper-text">Credit lines, loans, and other negative balances.${totalMinPayments > 0 ? ` Combined minimum payments: ${formatCurrency(totalMinPayments)} / mo.` : ''}</div>
                    </div>
                    <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtAdd'">Add debt item</button>
                </div>
                ${debts.length ? debts.map(debt => {
                    const hasPlan = (debt.planType === 'custom' && debt.installments?.length > 0) || (Number(debt.minimumPayment) || 0) > 0 || String(debt.paymentPlanNote || '').trim();
                    const progressPct = debt.totalAdded > 0 ? Math.min(100, Math.round(((debt.totalPaid || 0) / debt.totalAdded) * 100)) : 0;
                    return `
                    <div class="widget ui-card glass fin-card fin-debt-card">
                        <div class="fin-debt-header">
                            <div class="fin-list-item-main">
                                <strong>${escapeHtml(debt.name)}</strong>
                                <div class="fin-list-item-sub">${escapeHtml(debt.scope || 'shared')}${debt.dueDate ? ` · Due ${formatShortDate(debt.dueDate)}` : ''}</div>
                            </div>
                            <div class="fin-list-item-actions" style="flex-direction: column; align-items: flex-end; gap: 0.25rem;">
                                <div class="fin-inline-icon-actions">
                                    ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'debtPayment', '${escapeActionArg(debt.id)}'`, label: `Record payment for ${debt.name || 'debt item'}`, icon: 'success', tone: 'success' })}
                                    ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'debtPlan', '${escapeActionArg(debt.id)}'`, label: `Edit payment plan for ${debt.name || 'debt item'}` })}
                                    ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'debtAdd', '${escapeActionArg(debt.id)}'`, label: `Edit ${debt.name || 'debt item'}` })}
                                </div>
                                <div class="fin-list-item-val fin-text-med">${formatCurrency(debt.outstanding)}</div>
                            </div>
                        </div>
                        ${debt.totalAdded > 0 ? `
                        <div class="fin-debt-progress">
                            <div class="fin-debt-bar-track">
                                <div class="fin-debt-bar-fill" style="width: ${progressPct}%"></div>
                            </div>
                            <div class="fin-debt-bar-label">${formatCurrency(debt.totalPaid || 0)} paid of ${formatCurrency(debt.totalAdded)} · ${progressPct}%</div>
                        </div>
                        ` : ''}
                        <div class="fin-debt-details">
                            ${debt.planType === 'custom' 
                                ? `<span>Custom Plan: ${debt.installments?.length || 0} installments</span>` 
                                : ((Number(debt.minimumPayment) || 0) > 0 
                                    ? `<span>${(debt.frequency || 'monthly').charAt(0).toUpperCase() + (debt.frequency || 'monthly').slice(1)} payment: ${formatCurrency(debt.minimumPayment)}</span>` 
                                    : '')
                            }
                            ${String(debt.paymentPlanNote || '').trim() ? `<span>Plan note: ${escapeHtml(debt.paymentPlanNote)}</span>` : ''}
                            ${debt.estimatedPayoffDate ? `<span>Projected payoff: ${formatShortDate(debt.estimatedPayoffDate)}${Number.isFinite(Number(debt.estimatedPayoffMonths)) && Number(debt.estimatedPayoffMonths) > 0 ? ` · ${Number(debt.estimatedPayoffMonths)} months` : ''}</span>` : ''}
                            ${!hasPlan ? `<span style="color: var(--negative, #ff4b4b); font-weight: 500; display: inline-flex; align-items: center; gap: 0.25rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Missing payment plan</span>` : ''}
                        </div>
                    </div>
                `}).join('') : renderCompactEmpty('Debt-free operations.')}
            </section>
        `;
    }

    function renderSettingsSection() {
        const financeSettings = window.Store.getFinanceSettings();
        const uiSettings = window.Store.getUiSettings();
        return `
            <section class="fin-section">
                <!-- App Preferences -->
                <div class="widget ui-card glass fin-card fin-settings-card">
                    <div class="widget-title ui-title">App Preferences</div>
                    <div class="fin-settings-form">
                        <div class="form-group">
                            <label for="page-settings-currency">Base currency</label>
                            <input id="page-settings-currency" value="${escapeHtml(financeSettings.baseCurrency || 'EUR')}" />
                        </div>
                        <div class="form-group">
                            <label for="page-settings-forecast">Forecast horizon (days)</label>
                            <input id="page-settings-forecast" type="number" value="${escapeHtml(financeSettings.forecastDays || 90)}" />
                        </div>
                        <div class="form-group">
                            <label for="page-settings-scope">Default scope filter</label>
                            <select id="page-settings-scope">
                                <option value="all"${uiSettings.scopeFilter === 'all' ? ' selected' : ''}>All scopes</option>
                                <option value="business"${uiSettings.scopeFilter === 'business' ? ' selected' : ''}>Business only</option>
                                <option value="personal"${uiSettings.scopeFilter === 'personal' ? ' selected' : ''}>Personal only</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="page-settings-appearance">Visual mode</label>
                            <select id="page-settings-appearance">
                                <option value="dark-editorial"${uiSettings.appearance === 'dark-editorial' ? ' selected' : ''}>Dark Editorial</option>
                                <option value="dark-restrained"${uiSettings.appearance === 'dark-restrained' ? ' selected' : ''}>Dark Restrained</option>
                                <option value="bright-editorial"${uiSettings.appearance === 'bright-editorial' ? ' selected' : ''}>Bright Editorial</option>
                                <option value="bright-minimal"${uiSettings.appearance === 'bright-minimal' ? ' selected' : ''}>Bright Minimal</option>
                                <option value="color-field"${uiSettings.appearance === 'color-field' ? ' selected' : ''}>Color Field</option>
                                <option value="monochrome-focus"${uiSettings.appearance === 'monochrome-focus' ? ' selected' : ''}>Monochrome Focus</option>
                            </select>
                        </div>
                        <label class="settings-check">
                            <input id="page-settings-reduced-motion" type="checkbox"${uiSettings.reducedMotion ? ' checked' : ''} />
                            <span>Reduced motion</span>
                        </label>
                        <div class="fin-settings-actions">
                            <button class="ui-btn ui-btn--primary" type="button" data-action="FinancialMode.saveSettingsPage">Apply preferences</button>
                        </div>
                    </div>
                </div>

                <div class="widget ui-card glass fin-card fin-settings-card">
                    <div class="widget-title ui-title">Product boundaries</div>
                    <div class="fin-helper-text">
                        Finance Master stays local-first. Backup, restore, CSV import, sample data, reset controls, and app preferences live in Settings.
                    </div>
                    <div class="fin-integrations-grid">
                        <div class="fin-integration-item">
                            <strong>Market Portfolio</strong>
                            <span>Postponed. Live quotes do not serve daily cashflow.</span>
                        </div>
                        <div class="fin-integration-item">
                            <strong>Web3 / DeFi</strong>
                            <span>Postponed. Outside the core operating loop.</span>
                        </div>
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

    function explanationNumber(key, fallback = 0) {
        const value = Number(currentExplanations && currentExplanations[key] && currentExplanations[key].value);
        return Number.isFinite(value) ? value : fallback;
    }

    function operationLabel(operation) {
        if (operation === 'subtract') return 'Subtract';
        if (operation === 'divide') return 'Divide by';
        if (operation === 'multiply') return 'Multiply by';
        return 'Add';
    }

    function explanationValue(explanation, value) {
        const key = String(explanation && explanation.key || '');
        const amount = Number(value) || 0;
        if (key === 'runway') return `${amount.toFixed(1)} months`;
        if (key === 'forecastConfidence') return `${Math.round(amount)}%`;
        return formatCurrency(amount);
    }

    function renderMetricExplanation(key) {
        const explanation = currentExplanations && currentExplanations[key];
        if (!explanation || !Array.isArray(explanation.parts)) return '';
        return `
            <details class="fin-metric-explainer" data-fin-explainer="${escapeHtml(key)}">
                <summary>How calculated</summary>
                <div class="fin-confidence-list">
                    ${explanation.parts.map((part) => `
                        <div class="fin-confidence-row">
                            <span class="fin-muted">${operationLabel(part.operation)} ${escapeHtml(part.label)}</span>
                            <strong>${explanationValue(explanation, part.value)}</strong>
                        </div>
                    `).join('')}
                    ${safeArray(explanation.warnings).map((warning) => `
                        <div class="fin-confidence-row">
                            <span class="fin-text-med">${escapeHtml(warning)}</span>
                        </div>
                    `).join('')}
                </div>
            </details>
        `;
    }

    function incomeStatusFromDeal(deal) {
        const raw = String(deal && (deal.status || deal.stage) || 'expected').toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
        if (raw === 'open' || raw === 'manual_expected_income') return 'expected';
        if (raw === 'signed' || raw === 'verbal_commitment') return 'confirmed';
        if (raw === 'invoice_sent' || raw === 'sent') return 'invoiced';
        if (raw === 'received' || raw === 'settled' || raw === 'closed') return 'paid';
        if (raw === 'deleted') return 'cancelled';
        if (raw === 'opportunity') return 'lead';
        return ['lead', 'proposal', 'expected', 'confirmed', 'invoiced', 'due', 'overdue', 'paid', 'cancelled', 'lost', 'risky'].includes(raw) ? raw : 'expected';
    }

    function incomeDueStateFromDeal(deal, status) {
        const explicit = String(deal && deal.dueState || '').toLowerCase();
        if (explicit) return explicit;
        if (status === 'paid') return 'settled';
        if (status === 'cancelled' || status === 'lost') return 'inactive';
        const due = window.FinanceDates?.toDateOnly?.(deal && deal.expectedDateISO) || String(deal && deal.expectedDateISO || '').slice(0, 10);
        const today = window.FinanceDates?.todayDateOnly?.() || new Date().toISOString().slice(0, 10);
        if (!due || !today) return 'upcoming';
        if (due < today) {
            const overdueMs = Date.parse(`${today}T00:00:00.000Z`) - Date.parse(`${due}T00:00:00.000Z`);
            return overdueMs > 14 * 24 * 60 * 60 * 1000 ? 'severely_overdue' : 'overdue';
        }
        if (due === today || status === 'due') return 'due_today';
        const dueSoonEnd = window.FinanceDates?.addDaysDateOnly?.(today, 7) || '';
        return dueSoonEnd && due <= dueSoonEnd ? 'due_soon' : 'upcoming';
    }

    function incomeProjectLabel(projectId) {
        const id = String(projectId || '').trim();
        if (!id) return '';
        const project = safeArray(currentData && currentData.projectProfiles)
            .find((entry) => String(entry && entry.id || '') === id);
        return project ? String(project.name || '') : 'Project plan';
    }

    function incomeReliabilityLabel(row) {
        const status = String(row && row.status || '');
        const dueState = String(row && row.dueState || '');
        if (status === 'paid') return 'Settled';
        if (status === 'cancelled' || status === 'lost') return 'Inactive';
        if (dueState === 'severely_overdue') return 'Severely overdue';
        if (dueState === 'overdue') return 'Overdue';
        if (dueState === 'due_today') return 'Due today';
        if (dueState === 'due_soon') return 'Due soon';
        if (['confirmed', 'invoiced', 'due', 'overdue'].includes(status)) return 'High reliability';
        if (status === 'expected' || row.incomeType === 'retainer' || row.incomeType === 'recurring') return 'Expected';
        return 'Early signal';
    }

    function renderInvoicesSection(options = {}) {
        const compact = Boolean(options && options.compact);
        const view = getInvoicesView();
        const active = getActivePipelineDeals()
            .map((deal) => {
                const status = incomeStatusFromDeal(deal);
                const probability = Number(deal && deal.probability);
                const safeProbability = Number.isFinite(probability) ? Math.max(0, Math.min(1, probability)) : 0;
                return {
                    id: String(deal && deal.id || ''),
                    title: String(deal && deal.title || 'Expected income'),
                    amount: Number(deal && deal.value) || 0,
                    netAmount: Number.isFinite(Number(deal && deal.netAmount)) ? Number(deal.netAmount) : null,
                    vatRate: Number.isFinite(Number(deal && deal.vatRate)) ? Number(deal.vatRate) : 0,
                    vatAmount: Number.isFinite(Number(deal && deal.vatAmount)) ? Number(deal.vatAmount) : 0,
                    grossAmount: Number.isFinite(Number(deal && deal.grossAmount)) ? Number(deal.grossAmount) : (Number(deal && deal.value) || 0),
                    probability: safeProbability,
                    weightedAmount: Number.isFinite(Number(deal && deal.weightedAmount)) ? Number(deal.weightedAmount) : ((Number(deal && deal.value) || 0) * safeProbability),
                    expectedDateISO: deal && deal.expectedDateISO,
                    settlementAccount: String(deal && deal.destinationAccountName || deal && deal.destinationAccountId || ''),
                    incomeType: String(deal && deal.incomeType || 'one_off'),
                    status,
                    dueState: incomeDueStateFromDeal(deal, status),
                    projectLabel: incomeProjectLabel(deal && deal.projectId)
                };
            });
        const paid = safeArray(currentData && currentData.invoices)
            .filter((entry) => String(entry && entry.status || '').toLowerCase() === 'paid')
            .slice(0, 8)
            .map((entry) => ({
                id: String(entry && entry.id || ''),
                title: String(entry && (entry.client || entry.title) || 'Paid income'),
                amount: Number(entry && entry.amount) || 0,
                probability: 1,
                weightedAmount: Number(entry && entry.amount) || 0,
                expectedDateISO: entry && (entry.paidAt || entry.sentAt),
                settlementAccount: String(entry && entry.destinationAccountName || ''),
                incomeType: 'one_off',
                status: 'paid',
                dueState: 'settled',
                projectLabel: incomeProjectLabel(entry && entry.projectId)
            }));
        
        let displayRows = [];
        if (view === 'open') {
            displayRows = active.sort((a, b) => (Date.parse(a.expectedDateISO || '') || Number.MAX_SAFE_INTEGER) - (Date.parse(b.expectedDateISO || '') || Number.MAX_SAFE_INTEGER));
        } else if (view === 'settled') {
            displayRows = paid.sort((a, b) => (Date.parse(b.expectedDateISO || '') || 0) - (Date.parse(a.expectedDateISO || '') || 0));
        } else {
            displayRows = active.concat(paid).sort((a, b) => (Date.parse(b.expectedDateISO || '') || 0) - (Date.parse(a.expectedDateISO || '') || 0));
        }

        const totals = active.reduce((acc, row) => {
            const status = String(row.status || '');
            if (['confirmed', 'invoiced', 'due', 'overdue'].includes(status)) acc.reliable += row.amount;
            if (status === 'expected' || row.incomeType === 'retainer' || row.incomeType === 'recurring') acc.expected += row.amount;
            if (status === 'proposal' || status === 'lead' || status === 'risky') acc.early += row.amount;
            if (row.dueState === 'overdue' || row.dueState === 'severely_overdue') acc.overdue += row.amount;
            return acc;
        }, { reliable: 0, expected: 0, early: 0, overdue: 0 });
        
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card ${compact ? 'fin-income-lane-card' : ''}">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Invoice Status</div>
                            <div class="fin-helper-text">Expected income lives beside real cash movement. Settlement turns expected money into account cash.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'income'">Add expected income</button>
                    </div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card">${renderStatusPill('confirmed')}<strong>${formatCurrency(totals.reliable)}</strong><span>Confirmed, invoiced, due, or overdue</span></div>
                        <div class="fin-status-card">${renderStatusPill('expected')}<strong>${formatCurrency(totals.expected)}</strong><span>Expected, retainer, or recurring income</span></div>
                        <div class="fin-status-card">${renderStatusPill('proposal')}<strong>${formatCurrency(totals.early)}</strong><span>Proposal, lead, or legacy low-confidence income</span></div>
                        <div class="fin-status-card">${renderStatusPill('overdue')}<strong>${formatCurrency(totals.overdue)}</strong><span>Needs follow-up</span></div>
                    </div>
                    
                    <div class="fin-tabs" role="tablist" aria-label="Income view modes">
                        <button class="fin-tab-btn ${view === 'open' ? 'active' : ''}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="open">Open Income</button>
                        <button class="fin-tab-btn ${view === 'settled' ? 'active' : ''}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="settled">Settled</button>
                        <button class="fin-tab-btn ${view === 'all' ? 'active' : ''}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="all">All</button>
                    </div>

                    <div class="fin-table-wrap" style="margin-top: 1rem;">
                        ${displayRows.length ? `
                            <table class="fin-table fin-table--compact">
                                <thead><tr><th>Source</th><th>Status</th><th>Due state</th><th>Expected / paid</th><th>Reliability</th><th style="text-align:right">Weighted</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>
                                <tbody>
                                    ${displayRows.map((row) => `
                                        <tr>
                                            <td>${escapeHtml(row.title)}<small>${escapeHtml([row.incomeType === 'retainer' ? 'retainer' : row.incomeType === 'recurring' ? 'recurring' : '', row.projectLabel, row.settlementAccount].filter(Boolean).join(' · '))}</small>${Number(row.vatAmount) > 0 ? `<small>VAT ${formatCurrency(row.vatAmount)} (${escapeHtml(String(row.vatRate || 0))}%) on top</small>` : ''}</td>
                                            <td>${renderStatusPill(row.status)}</td>
                                            <td>${renderStatusPill(row.dueState)}</td>
                                            <td>${row.expectedDateISO ? formatShortDate(row.expectedDateISO) : 'No date'}</td>
                                            <td>${Math.round(row.probability * 100)}%<small>${escapeHtml(incomeReliabilityLabel(row))}</small></td>
                                            <td style="text-align:right">${formatCurrency(row.weightedAmount)}</td>
                                            <td style="text-align:right">${formatCurrency(row.amount)}</td>
                                            <td style="text-align:right">
                                                ${row.status === 'paid' ? '' : `
                                                    <span class="fin-inline-icon-actions fin-inline-icon-actions--right">
                                                        ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'income', '${escapeActionArg(row.id)}'`, label: `Edit ${row.title || 'expected income'}` })}
                                                        ${financeIconButton({ action: 'markAsPaid', args: `'${escapeActionArg(row.id)}'`, label: `Mark ${row.title || 'expected income'} as received`, icon: 'success', tone: 'success' })}
                                                    </span>
                                                `}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : renderCompactEmpty('Forecast future income. What is the next expected payment?')}
                    </div>
                </div>
            </section>
        `;
    }

    function insightsLevelRank(level) {
        const ranks = { Low: 0, Medium: 1, High: 2, Critical: 3 };
        return ranks[level] ?? 0;
    }

    function insightsRiskPill(level) {
        const safe = String(level || 'Low');
        return `<span class="fin-insights-risk-pill is-${escapeHtml(safe.toLowerCase())}">${escapeHtml(safe)}</span>`;
    }

    function insightsPercent(value, total) {
        const number = Number(value);
        const denominator = Number(total);
        if (!Number.isFinite(number) || !Number.isFinite(denominator) || denominator <= 0) return 0;
        return Math.max(0, Math.min(100, Math.round((number / denominator) * 100)));
    }

    function insightsAddMonths(months) {
        const value = Number(months);
        if (!Number.isFinite(value) || value <= 0) return '';
        const date = new Date();
        date.setMonth(date.getMonth() + Math.ceil(value));
        return date.toISOString().slice(0, 10);
    }

    function insightsDebtPayoffDate(debt, monthlyOverride) {
        const existing = String(debt && (debt.estimatedPayoffDate || debt.payoffDate || debt.debtFreeDate) || '');
        if (existing) return existing;
        const outstanding = Math.max(0, Number(debt && debt.outstanding) || 0);
        const monthly = Number.isFinite(Number(monthlyOverride)) ? Number(monthlyOverride) : treasuryDebtMonthlyPayment(debt);
        if (outstanding <= 0) return new Date().toISOString().slice(0, 10);
        if (monthly <= 0) return '';
        return insightsAddMonths(Math.ceil(outstanding / monthly));
    }

    function buildInsightsIncomeDependency() {
        const grouped = new Map();
        const add = (source, amount, kind) => {
            const key = String(source || 'Unknown source').trim() || 'Unknown source';
            const value = Math.max(0, Number(amount) || 0);
            if (value <= 0) return;
            const entry = grouped.get(key) || { source: key, amount: 0, count: 0, kinds: new Set() };
            entry.amount += value;
            entry.count += 1;
            if (kind) entry.kinds.add(kind);
            grouped.set(key, entry);
        };

        safeArray(currentData && currentData.invoices).forEach((item) => {
            const status = String(item && item.status || '').toLowerCase();
            if (status === 'cancelled' || status === 'lost' || status === 'deleted') return;
            add(item && (item.client || item.source || item.title), item && item.amount, status === 'paid' ? 'paid' : 'invoice');
        });
        safeArray(currentData && currentData.pipelineDeals).forEach((item) => {
            const status = String(item && item.status || '').toLowerCase();
            if (status === 'cancelled' || status === 'lost' || status === 'deleted') return;
            add(item && (item.client || item.source || item.title), item && (item.value || item.amount), status || 'expected');
        });

        if (!grouped.size) {
            safeArray(currentData && currentData.transactions).forEach((tx) => {
                const type = String(tx && (tx.ledgerType || tx.type) || '').toLowerCase();
                const signed = Number(tx && (tx.signedAmount ?? tx.amount));
                if (!type.includes('income') && signed <= 0) return;
                add(tx && (tx.client || tx.source || tx.note || tx.description || tx.categoryId), Math.abs(signed || 0), 'recorded');
            });
        }

        const total = Array.from(grouped.values()).reduce((sum, row) => sum + row.amount, 0);
        const rows = Array.from(grouped.values())
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((row) => ({
                source: row.source,
                amount: row.amount,
                pct: insightsPercent(row.amount, total),
                count: row.count,
                kinds: Array.from(row.kinds).slice(0, 3).join(', ')
            }));
        const top = rows[0] || null;
        const risk = top && top.pct >= 80 ? 'Critical' : top && top.pct >= 55 ? 'High' : top && top.pct >= 40 ? 'Medium' : 'Low';
        const interpretation = top
            ? `${top.pct}% of tracked income comes from ${top.source}. ${top.pct > 50 ? 'Efficient short-term, fragile long-term.' : 'Dependency is within a healthier range.'}`
            : 'Income dependency becomes visible once expected or settled income is tracked.';
        return { total, rows, top, risk, interpretation };
    }

    function buildInsightsExpenseGravity() {
        const expenses = sortedTreasuryExpenses(currentData && currentData.recurringExpenses);
        const essential = expenses.filter((expense) => expense && expense.essential);
        const flexible = expenses.filter((expense) => !expense || !expense.essential);
        const essentialTotal = essential.reduce((sum, expense) => sum + (Number(expense.monthlyAmount) || 0), 0);
        const flexibleTotal = flexible.reduce((sum, expense) => sum + (Number(expense.monthlyAmount) || 0), 0);
        const debtMonthly = safeArray(currentData && currentData.debtAccounts).reduce((sum, debt) => sum + treasuryDebtMonthlyPayment(debt), 0);
        const taxReserveGap = safeArray(currentData && currentData.reserveBuckets)
            .filter((bucket) => /tax|vat/i.test(String((bucket && (bucket.purpose || bucket.name)) || '')))
            .reduce((sum, bucket) => sum + Math.max(0, (Number(bucket.targetAmount) || 0) - (Number(bucket.currentAmount) || 0)), 0);
        const biggestFixed = essential[0] || null;
        const biggestFlexible = flexible[0] || null;
        const largestPressure = [
            { label: 'non-negotiable costs', value: essentialTotal },
            { label: 'adjustable costs', value: flexibleTotal },
            { label: 'debt payment pressure', value: debtMonthly }
        ].sort((a, b) => b.value - a.value)[0];
        return {
            essential,
            flexible,
            essentialTotal,
            flexibleTotal,
            debtMonthly,
            taxReserveGap,
            biggestFixed,
            biggestFlexible,
            potentialImpact: Math.min(Math.max(0, flexibleTotal), 200),
            interpretation: largestPressure && largestPressure.value > 0
                ? `${largestPressure.label.charAt(0).toUpperCase()}${largestPressure.label.slice(1)} is the strongest monthly pull right now.`
                : 'Expense gravity becomes clearer once recurring costs and debt plans are added.'
        };
    }

    function buildInsightsDebtIntelligence(expenseGravity) {
        const debts = safeArray(currentData && currentData.debtAccounts)
            .filter((debt) => Math.max(0, Number(debt && debt.outstanding) || 0) > 0);
        const totalDebt = treasuryNumber('debtRemaining', debts.reduce((sum, debt) => sum + (Number(debt.outstanding) || 0), 0));
        const monthlyPressure = Number(expenseGravity && expenseGravity.debtMonthly) || debts.reduce((sum, debt) => sum + treasuryDebtMonthlyPayment(debt), 0);
        const largest = debts.slice().sort((a, b) => (Number(b && b.outstanding) || 0) - (Number(a && a.outstanding) || 0))[0] || null;
        const payoffDate = largest ? insightsDebtPayoffDate(largest) : '';
        const income30 = Number(currentData && currentData.incomeReceivedLast30Days) || 0;
        const realistic = monthlyPressure <= Math.max(1, income30 * 0.35);
        return {
            debts,
            totalDebt,
            monthlyPressure,
            largest,
            payoffDate,
            realistic,
            interpretation: debts.length
                ? (realistic ? 'Payment pressure appears manageable against recent income rhythm.' : 'Payment pressure may be heavy for the current income rhythm.')
                : 'No active debt pressure is visible.'
        };
    }

    function buildInsightsReserveDiscipline() {
        const buckets = safeArray(currentData && currentData.reserveBuckets);
        const protectedCash = treasuryNumber('protectedCash', Number(currentSnapshot && currentSnapshot.reservedCash) || 0);
        const target = buckets.reduce((sum, bucket) => sum + Math.max(0, Number(bucket && bucket.targetAmount) || 0), 0);
        const gap = buckets.reduce((sum, bucket) => sum + Math.max(0, (Number(bucket && bucket.targetAmount) || 0) - (Number(bucket && bucket.currentAmount) || 0)), 0);
        const coverage = target > 0 ? Math.round((protectedCash / target) * 100) : 0;
        const taxBucket = buckets.find((bucket) => /tax|vat/i.test(String((bucket && (bucket.purpose || bucket.name)) || '')));
        const emergencyBucket = buckets.find((bucket) => /emergency|buffer|safety/i.test(String((bucket && (bucket.purpose || bucket.name)) || '')));
        const availableCash = treasuryNumber('availableCash', Number(currentSnapshot && currentSnapshot.availableCash) || 0);
        let recommendation = 'Build a €500 micro-buffer before larger savings goals.';
        if (availableCash < 0) recommendation = 'Pause future savings goals until the current shortfall is covered.';
        else if (coverage >= 100) recommendation = 'Keep reserve discipline steady and review targets monthly.';
        return { buckets, protectedCash, target, gap, coverage, taxBucket, emergencyBucket, recommendation };
    }

    function buildInsightsRiskRadar({ dependency, expenseGravity, debt, reserve }) {
        const availableCash = treasuryNumber('availableCash', Number(currentSnapshot && currentSnapshot.availableCash) || 0);
        const committed = treasuryNumber('committedShortTermObligations', 0);
        const monthlyBurn = treasuryNumber('totalMonthlyBurn', Number(currentSnapshot && currentSnapshot.monthlyBurn) || 0);
        const historyCount = safeArray(currentReview && currentReview.history).length;
        const rhythm = buildCashflowRhythmData();
        const taxGap = Number(expenseGravity && expenseGravity.taxReserveGap) || 0;
        const risks = [
            {
                name: 'Liquidity risk',
                level: availableCash < 0 ? 'Critical' : availableCash < committed ? 'High' : availableCash < monthlyBurn ? 'Medium' : 'Low',
                metric: formatCurrency(availableCash),
                explanation: availableCash < 0 ? 'Available cash is negative after protected cash and upcoming obligations.' : 'Available cash covers the current short-term view.'
            },
            {
                name: 'Debt pressure',
                level: debt.monthlyPressure > expenseGravity.essentialTotal ? 'High' : debt.monthlyPressure > monthlyBurn * 0.25 ? 'Medium' : 'Low',
                metric: formatCurrency(debt.monthlyPressure),
                explanation: debt.monthlyPressure > 0 ? 'Monthly debt plans add recurring pressure to burn.' : 'No active monthly debt pressure is visible.'
            },
            {
                name: 'Income concentration',
                level: dependency.risk,
                metric: dependency.top ? `${dependency.top.pct}%` : 'No signal',
                explanation: dependency.top ? `${dependency.top.source} is the largest tracked source.` : 'Track income sources to detect dependency.'
            },
            {
                name: 'Reserve coverage',
                level: reserve.target <= 0 || reserve.coverage <= 0 ? 'High' : reserve.coverage < 50 ? 'Medium' : 'Low',
                metric: reserve.target > 0 ? `${reserve.coverage}%` : 'No target',
                explanation: reserve.protectedCash > 0 ? 'Some money is protected for future obligations.' : 'No protected reserve cash is visible yet.'
            },
            {
                name: 'Expense flexibility',
                level: expenseGravity.flexibleTotal <= 0 && monthlyBurn > 0 ? 'High' : expenseGravity.flexibleTotal < monthlyBurn * 0.15 ? 'Medium' : 'Low',
                metric: formatCurrency(expenseGravity.flexibleTotal),
                explanation: expenseGravity.flexibleTotal > 0 ? 'There is some adjustable monthly spend.' : 'Most visible burn appears fixed or debt-driven.'
            },
            {
                name: 'Cashflow rhythm',
                level: historyCount <= 0 && !rhythm.hasData ? 'Medium' : 'Low',
                metric: historyCount ? `${historyCount} checkpoints` : 'No checkpoints',
                explanation: historyCount ? 'Saved checkpoints can show pattern changes.' : 'Save one checkpoint to unlock trend memory.'
            },
            {
                name: 'Tax exposure',
                level: taxGap > 0 && !reserve.taxBucket ? 'High' : taxGap > 0 ? 'Medium' : 'Low',
                metric: taxGap > 0 ? formatCurrency(taxGap) : (reserve.taxBucket ? 'Tracked' : 'No target'),
                explanation: reserve.taxBucket ? 'A tax or VAT reserve is tracked.' : 'No explicit tax or VAT reserve is visible.'
            }
        ];
        return risks.sort((a, b) => insightsLevelRank(b.level) - insightsLevelRank(a.level));
    }

    function buildInsightsDiagnosis(risks, dependency, expenseGravity, debt, reserve) {
        const topRisk = risks[0] || { name: 'Financial clarity', level: 'Low', explanation: 'Nothing major is visible.' };
        const availableCash = treasuryNumber('availableCash', Number(currentSnapshot && currentSnapshot.availableCash) || 0);
        const runway = Number((currentTreasury && currentTreasury.runwayMonths) ?? (currentSnapshot && currentSnapshot.runwayMonths));
        let headline = 'Stable, keep the cadence';
        if (!currentHasFinanceData) headline = 'Unclear until core inputs exist';
        else if (!safeArray(currentReview && currentReview.history).length) headline = 'Based on live data only';
        else if (availableCash < 0 || topRisk.level === 'Critical') headline = 'Tight, but recoverable';
        else if (dependency.top && dependency.top.pct >= 55) headline = 'Stable with concentration risk';
        else if (Number.isFinite(runway) && runway < 4) headline = 'Tight, needs attention';

        const forces = risks
            .filter((risk) => insightsLevelRank(risk.level) >= 1)
            .slice(0, 3)
            .map((risk) => `${risk.name}: ${risk.explanation}`);
        while (forces.length < 3) {
            const fallback = buildStrategicAdviceItems()[forces.length] || 'Keep the review loop current.';
            forces.push(fallback);
        }

        let mainLever = 'Keep Flow and Plan current';
        if (availableCash < 0) mainLever = 'Cover near-term obligations';
        else if (debt.monthlyPressure > expenseGravity.flexibleTotal && debt.monthlyPressure > 0) mainLever = 'Debt plan + flexible cost reduction';
        else if (reserve.coverage < 50) mainLever = 'Protect priority reserves';
        else if (dependency.top && dependency.top.pct >= 55) mainLever = 'Diversify recurring income';

        let opportunity = 'Use checkpoints to build pattern memory';
        if (dependency.top && dependency.top.pct >= 55) opportunity = 'Create one additional recurring income source';
        else if (expenseGravity.potentialImpact > 0) opportunity = `Trim ${formatCurrency(expenseGravity.potentialImpact)} of flexible burn`;
        else if (reserve.gap > 0) opportunity = 'Build a first reserve buffer';

        return {
            headline,
            forces,
            mainRisk: topRisk.name,
            mainLever,
            opportunity
        };
    }

    function buildInsightsPatternMemory() {
        const history = safeArray(currentReview && currentReview.history).slice(0, 3);
        if (!history.length) return { history, rows: [] };
        const latest = history[0] || {};
        const previous = history[1] || {};
        const latestSummary = latest.summary || {};
        const previousSummary = previous.summary || {};
        const delta = (key) => {
            const current = Number(latestSummary[key]);
            const before = Number(previousSummary[key]);
            if (!Number.isFinite(current)) return null;
            if (!Number.isFinite(before)) return current;
            return current - before;
        };
        return {
            history,
            rows: [
                { label: 'Cash rhythm', value: delta('netMovement'), copy: 'Net movement since the prior checkpoint.' },
                { label: 'Income reliability', value: delta('incomeReceived'), copy: 'Received income compared with the prior checkpoint.' },
                { label: 'Burn trend', value: delta('expensesPaid'), copy: 'Paid expenses compared with the prior checkpoint.' },
                { label: 'Reserve discipline', value: delta('protectedCash'), copy: 'Protected cash change.' },
                { label: 'Runway', value: delta('runwayNow'), copy: 'Runway change in months.', plain: true }
            ]
        };
    }

    function buildInsightsScenario({ expenseGravity, debt, reserve }) {
        const monthlyBurn = treasuryNumber('totalMonthlyBurn', Number(currentSnapshot && currentSnapshot.monthlyBurn) || 0);
        const availableCash = treasuryNumber('availableCash', Number(currentSnapshot && currentSnapshot.availableCash) || 0);
        const forecast30 = Number(currentForecast && currentForecast.byHorizon && currentForecast.byHorizon['30'] && currentForecast.byHorizon['30'].expected);
        const baseSurplus = Number.isFinite(forecast30) ? forecast30 : availableCash;
        const protectedFutureIncome = Math.max(0, Number(insightsScenarioState.recurringIncome) || 0) * ((Number(insightsScenarioState.protectPct) || 0) / 100);
        const savingsPauseGain = insightsScenarioState.pauseSavings ? Math.min(Math.max(0, reserve.gap), 250) : 0;
        const adjustedBurn = Math.max(0, monthlyBurn
            - Math.min(Number(insightsScenarioState.flexCut) || 0, Math.max(0, expenseGravity.flexibleTotal))
            - Math.min(Number(insightsScenarioState.debtReduction) || 0, Math.max(0, debt.monthlyPressure))
            + (Number(insightsScenarioState.reserveContribution) || 0));
        const adjustedSurplus = baseSurplus
            + (Number(insightsScenarioState.flexCut) || 0)
            + (Number(insightsScenarioState.debtReduction) || 0)
            + (Number(insightsScenarioState.recurringIncome) || 0)
            + savingsPauseGain
            - protectedFutureIncome
            - (Number(insightsScenarioState.reserveContribution) || 0);
        const adjustedRunway = adjustedBurn > 0 ? availableCash / adjustedBurn : null;
        const monthlyReserveContribution = Math.max(0, Number(insightsScenarioState.reserveContribution) || 0) + protectedFutureIncome;
        const monthsToTarget = reserve.gap > 0 && monthlyReserveContribution > 0 ? Math.ceil(reserve.gap / monthlyReserveContribution) : null;
        const adjustedDebtPayment = Math.max(0, debt.monthlyPressure - (Number(insightsScenarioState.debtReduction) || 0));
        const debtFreeDate = debt.totalDebt > 0 && adjustedDebtPayment > 0 ? insightsAddMonths(Math.ceil(debt.totalDebt / adjustedDebtPayment)) : '';
        const health = adjustedSurplus < 0 ? 'Still tight' : adjustedRunway != null && adjustedRunway < 3 ? 'Improving but thin' : 'More stable';
        return { adjustedBurn, adjustedSurplus, adjustedRunway, monthsToTarget, debtFreeDate, health };
    }

    function buildInsightsRecommendedMoves({ risks, dependency, debt, reserve, scenario }) {
        const moves = [];
        const availableCash = treasuryNumber('availableCash', Number(currentSnapshot && currentSnapshot.availableCash) || 0);
        if (availableCash < 0 || risks.some((risk) => risk.name === 'Liquidity risk' && insightsLevelRank(risk.level) >= 2)) {
            moves.push({ title: 'Stabilize the next 30 days', why: 'Available cash is under near-term pressure.', effect: 'Reduces immediate liquidity risk.', label: 'Open Plan', action: 'FinancialMode.setSection', args: "'plan'" });
        }
        if (debt.monthlyPressure > 0 && insightsLevelRank((risks.find((risk) => risk.name === 'Debt pressure') || {}).level) >= 1) {
            moves.push({ title: 'Review debt pressure', why: 'Debt plans are part of monthly burn.', effect: `Pressure visible: ${formatCurrency(debt.monthlyPressure)} / month.`, label: 'Open debt planner', action: 'FinancialMode.setSection', args: "'plan'" });
        }
        if (reserve.protectedCash <= 0 || reserve.coverage < 50) {
            moves.push({ title: 'Build a €500 micro-buffer', why: 'A small protected buffer makes delayed invoices less disruptive.', effect: 'Improves reserve discipline.', label: 'Add reserve bucket', action: 'FinancialMode.openAddModal', args: "'reserveBucket'" });
        }
        if (dependency.top && dependency.top.pct >= 55) {
            moves.push({ title: 'Diversify income over 90 days', why: `${dependency.top.source} carries ${dependency.top.pct}% of tracked income.`, effect: 'Lowers concentration risk.', label: 'Open Flow', action: 'FinancialMode.setSection', args: "'flow'" });
        }
        if (!safeArray(currentReview && currentReview.history).length) {
            moves.push({ title: 'Save your first checkpoint', why: 'Pattern detection starts after a saved checkpoint.', effect: 'Unlocks cash rhythm and trend memory.', label: 'Open Review', action: 'FinancialMode.setSection', args: "'review'" });
        }
        if (!moves.length) {
            moves.push({ title: 'Keep the operating loop current', why: 'The current diagnosis has no urgent imbalance.', effect: scenario.health, label: 'Open Review', action: 'FinancialMode.setSection', args: "'review'" });
        }
        return moves.slice(0, 5);
    }

    function renderInsightsMetricRow(label, value, copy, options = {}) {
        return `
            <div class="fin-insights-metric-row">
                <span>${escapeHtml(label)}</span>
                <strong>${options.plain ? escapeHtml(String(value == null ? '—' : value)) : formatCurrency(value)}</strong>
                <small>${escapeHtml(copy || '')}</small>
            </div>
        `;
    }

    function renderReportsSection() {
        const dependency = buildInsightsIncomeDependency();
        const expenseGravity = buildInsightsExpenseGravity();
        const debt = buildInsightsDebtIntelligence(expenseGravity);
        const reserve = buildInsightsReserveDiscipline();
        const risks = buildInsightsRiskRadar({ dependency, expenseGravity, debt, reserve });
        const diagnosis = buildInsightsDiagnosis(risks, dependency, expenseGravity, debt, reserve);
        const memory = buildInsightsPatternMemory();
        const scenario = buildInsightsScenario({ expenseGravity, debt, reserve });
        const moves = buildInsightsRecommendedMoves({ risks, dependency, debt, reserve, scenario });
        const maxGravity = Math.max(1, expenseGravity.essentialTotal, expenseGravity.flexibleTotal, debt.monthlyPressure, expenseGravity.taxReserveGap);

        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-insights-hero">
                    <div class="fin-insights-hero-main">
                        <span class="fin-eyebrow">Radar Diagnosis</span>
                        <strong>${escapeHtml(diagnosis.headline)}</strong>
                        <p>${escapeHtml((risks[0] && risks[0].explanation) || 'Your local finance picture is ready for review.')}</p>
                    </div>
                    <div class="fin-insights-forces">
                        <span class="fin-eyebrow">Top forces</span>
                        ${diagnosis.forces.map((force) => `<div class="fin-insights-force">${escapeHtml(force)}</div>`).join('')}
                    </div>
                    <div class="fin-insights-hero-summary">
                        <div><span>Main risk</span><strong>${escapeHtml(diagnosis.mainRisk)}</strong></div>
                        <div><span>Main lever</span><strong>${escapeHtml(diagnosis.mainLever)}</strong></div>
                        <div><span>Main opportunity</span><strong>${escapeHtml(diagnosis.opportunity)}</strong></div>
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="fin-insights-grid fin-insights-grid--radar">
                    <div class="widget ui-card glass fin-card fin-insights-radar">
                        <div class="widget-title ui-title">Risk Radar</div>
                        <div class="fin-helper-text">Ranked risks from the current local data. Each row explains the why, not just the label.</div>
                        <div class="fin-insights-risk-list">
                            ${risks.map((risk) => `
                                <div class="fin-insights-risk-row">
                                    <div>
                                        <strong>${escapeHtml(risk.name)}</strong>
                                        <span>${escapeHtml(risk.explanation)}</span>
                                    </div>
                                    <div>
                                        ${insightsRiskPill(risk.level)}
                                        <small>${escapeHtml(risk.metric)}</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card fin-insights-memory">
                        <div class="widget-title ui-title">Pattern Memory</div>
                        ${memory.history.length ? `
                            <div class="fin-helper-text">What changed across recent saved checkpoints.</div>
                            <div class="fin-insights-memory-list">
                                ${memory.rows.map((row) => renderInsightsMetricRow(row.label, row.value, row.copy, { plain: row.plain })).join('')}
                            </div>
                        ` : `
                            <div class="fin-insights-empty-state">
                                <strong>Not enough history yet</strong>
                                <span>Save a checkpoint after your next weekly or monthly review to unlock trend memory.</span>
                                <div class="fin-insights-locked-rows">
                                    ${['Cash rhythm', 'Burn trend', 'Income reliability', 'Debt velocity', 'Reserve discipline'].map((label) => `<div><span>${escapeHtml(label)}</span><small>Locked</small></div>`).join('')}
                                </div>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'review'">Open Review</button>
                            </div>
                        `}
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="fin-insights-grid">
                    <div class="widget ui-card glass fin-card fin-insights-panel">
                        <div class="widget-title ui-title">Income Dependency</div>
                        <div class="fin-helper-text">${escapeHtml(dependency.interpretation)} Healthy target: no single client above 40–50% of recurring income.</div>
                        ${dependency.rows.length ? `
                            <div class="fin-insights-source-list">
                                ${dependency.rows.map((row) => `
                                    <div class="fin-insights-source-row">
                                        <div><strong>${escapeHtml(row.source)}</strong><span>${escapeHtml(pluralize(row.count, 'item'))}${row.kinds ? ` · ${escapeHtml(row.kinds)}` : ''}</span></div>
                                        <div class="fin-insights-bar"><span style="width:${row.pct}%"></span></div>
                                        <strong>${row.pct}%</strong>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="fin-insights-recommendation">Suggested move: create one additional recurring income stream or convert another client into a retainer.</div>
                        ` : renderCompactEmpty('Add expected or settled income to reveal dependency risk.')}
                    </div>
                    <div class="widget ui-card glass fin-card fin-insights-panel">
                        <div class="widget-title ui-title">Expense Gravity</div>
                        <div class="fin-helper-text">${escapeHtml(expenseGravity.interpretation)}</div>
                        <div class="fin-insights-gravity-list">
                            ${[
            ['Non-negotiable gravity', expenseGravity.essentialTotal],
            ['Adjustable gravity', expenseGravity.flexibleTotal],
            ['Debt/payment pressure', debt.monthlyPressure],
            ['Reserve/tax obligations', expenseGravity.taxReserveGap]
        ].map(([label, value]) => `
                                <div class="fin-insights-gravity-row">
                                    <div><span>${escapeHtml(label)}</span><strong>${formatCurrency(value)}</strong></div>
                                    <div class="fin-insights-bar"><span style="width:${treasuryFlowPercent(value, maxGravity)}%"></span></div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="fin-insights-recommendation">Most realistic lever: ${expenseGravity.potentialImpact > 0 ? `${formatCurrency(expenseGravity.potentialImpact)} flexible burn reduction` : 'confirm debt plans and recurring costs first'}.</div>
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="fin-insights-grid">
                    <div class="widget ui-card glass fin-card fin-insights-panel fin-insights-debt">
                        <div class="widget-title ui-title">Debt Intelligence</div>
                        <div class="fin-helper-text">${escapeHtml(debt.interpretation)}</div>
                        <div class="fin-insights-stat-grid">
                            <div><span>Total debt</span><strong>${formatCurrency(debt.totalDebt)}</strong></div>
                            <div><span>Monthly minimum pressure</span><strong>${formatCurrency(debt.monthlyPressure)}</strong></div>
                            <div><span>Liabilities</span><strong>${debt.debts.length}</strong></div>
                            <div><span>Largest debt</span><strong>${escapeHtml(debt.largest && debt.largest.name || 'None')}</strong></div>
                        </div>
                        ${debt.largest ? `<div class="fin-insights-recommendation">Projected payoff: ${debt.payoffDate ? formatShortDate(debt.payoffDate) : 'Add a payment plan to estimate this.'}</div>` : ''}
                    </div>
                    <div class="widget ui-card glass fin-card fin-insights-panel">
                        <div class="widget-title ui-title">Reserve Discipline</div>
                        <div class="fin-helper-text">${escapeHtml(reserve.recommendation)}</div>
                        <div class="fin-insights-stat-grid">
                            <div><span>Protected money</span><strong>${formatCurrency(reserve.protectedCash)}</strong></div>
                            <div><span>Reserve target</span><strong>${formatCurrency(reserve.target)}</strong></div>
                            <div><span>Coverage</span><strong>${reserve.target > 0 ? `${reserve.coverage}%` : 'No target'}</strong></div>
                            <div><span>Emergency buffer</span><strong>${reserve.emergencyBucket ? 'Tracked' : 'Missing'}</strong></div>
                        </div>
                        <div class="fin-insights-meter"><span style="width:${Math.min(100, reserve.coverage)}%"></span></div>
                        <div class="fin-insights-recommendation">Tax reserve: ${reserve.taxBucket ? 'tracked' : 'not visible yet'}.</div>
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-insights-scenario">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Scenario Lab</div>
                            <div class="fin-helper-text">Simple deterministic previews. Nothing here changes stored finance data.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-fin-action="set-insights-scenario" data-fin-scenario-key="reset">Reset</button>
                    </div>
                    <div class="fin-insights-scenario-grid">
                        <div class="fin-insights-scenario-controls">
                            <div>
                                <span>Cut flexible costs</span>
                                ${[50, 100, 150, 200].map((value) => `<button class="fin-mini-btn ${insightsScenarioState.flexCut === value ? 'active' : ''}" type="button" data-fin-action="set-insights-scenario" data-fin-scenario-key="flexCut" data-fin-scenario-value="${value}">${formatCurrency(value).replace(/([.,]00)$/, '')}</button>`).join('')}
                            </div>
                            <div>
                                <span>Reduce debt pressure</span>
                                ${[100, 250].map((value) => `<button class="fin-mini-btn ${insightsScenarioState.debtReduction === value ? 'active' : ''}" type="button" data-fin-action="set-insights-scenario" data-fin-scenario-key="debtReduction" data-fin-scenario-value="${value}">${formatCurrency(value).replace(/([.,]00)$/, '')}</button>`).join('')}
                            </div>
                            <div>
                                <span>Add recurring income</span>
                                ${[1000, 1500].map((value) => `<button class="fin-mini-btn ${insightsScenarioState.recurringIncome === value ? 'active' : ''}" type="button" data-fin-action="set-insights-scenario" data-fin-scenario-key="recurringIncome" data-fin-scenario-value="${value}">+${formatCurrency(value).replace(/([.,]00)$/, '')}</button>`).join('')}
                            </div>
                            <div>
                                <span>Protect future income</span>
                                ${[10, 20].map((value) => `<button class="fin-mini-btn ${insightsScenarioState.protectPct === value ? 'active' : ''}" type="button" data-fin-action="set-insights-scenario" data-fin-scenario-key="protectPct" data-fin-scenario-value="${value}">${value}%</button>`).join('')}
                            </div>
                            <div>
                                <span>Reserve discipline</span>
                                <button class="fin-mini-btn ${insightsScenarioState.pauseSavings ? 'active' : ''}" type="button" data-fin-action="set-insights-scenario" data-fin-scenario-key="pauseSavings">Pause savings goal</button>
                                ${[100, 250].map((value) => `<button class="fin-mini-btn ${insightsScenarioState.reserveContribution === value ? 'active' : ''}" type="button" data-fin-action="set-insights-scenario" data-fin-scenario-key="reserveContribution" data-fin-scenario-value="${value}">+${formatCurrency(value).replace(/([.,]00)$/, '')} reserve</button>`).join('')}
                            </div>
                        </div>
                        <div class="fin-insights-scenario-result">
                            <span class="fin-eyebrow">Preview result</span>
                            <strong>${escapeHtml(scenario.health)}</strong>
                            <div class="fin-insights-stat-grid">
                                <div><span>Adjusted burn</span><strong>${formatCurrency(scenario.adjustedBurn)}</strong></div>
                                <div><span>30-day surplus / shortfall</span><strong>${formatCurrency(scenario.adjustedSurplus)}</strong></div>
                                <div><span>Runway preview</span><strong>${scenario.adjustedRunway != null ? `${scenario.adjustedRunway.toFixed(1)} months` : 'Unknown'}</strong></div>
                                <div><span>Months to reserve target</span><strong>${scenario.monthsToTarget != null ? scenario.monthsToTarget : '—'}</strong></div>
                            </div>
                            <div class="fin-insights-recommendation">Debt-free date preview: ${scenario.debtFreeDate ? formatShortDate(scenario.debtFreeDate) : 'Add or keep a payment plan to estimate this.'}</div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-insights-moves">
                    <div class="widget-title ui-title">Recommended Moves</div>
                    <div class="fin-helper-text">Prioritized actions that improve the diagnosis fastest.</div>
                    <div class="fin-insights-move-list">
                        ${moves.map((move, index) => `
                            <div class="fin-insights-move-row">
                                <div class="fin-insights-move-index">${index + 1}</div>
                                <div>
                                    <strong>${escapeHtml(move.title)}</strong>
                                    <span>${escapeHtml(move.why)}</span>
                                    <small>${escapeHtml(move.effect)}</small>
                                </div>
                                <button class="fin-mini-btn" type="button" data-action="${escapeHtml(move.action)}" data-action-args="${escapeHtml(move.args || '')}">${escapeHtml(move.label)}</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    function renderObservatoryHeader() {
        const reviewCount = treasuryArray('reviewQueue').length;
        const reviewDue = isWeeklyReviewDue();
            
        return `
            <section class="fin-section fin-section--toolbar">
                <div class="fin-ui-toolbar">
                    <div class="fin-operating-meta">
                        <span>Last updated: ${formatShortDate(currentDiagnostics.latestEventTimestamp) || 'Never'}</span>
                        <span>Unreviewed: ${reviewCount}</span>
                        ${reviewDue ? '<span class="fin-text-high">Review due today</span>' : ''}
                        <span>Data: Local only</span>
                    </div>
                    <div class="fin-toolbar-actions">
                        <select id="fin-scope-filter" class="fin-scope-filter" aria-label="Treasury scope">${scopeFilterOptions(window.Store.getUiSettings().scopeFilter || 'all')}</select>
                    </div>
                </div>
            </section>
        `;
    }

    function overviewExpectedMonthEnd() {
        const value = Number(currentForecast && currentForecast.byHorizon && currentForecast.byHorizon['30'] && currentForecast.byHorizon['30'].expected);
        if (Number.isFinite(value)) return value;
        const scenarios = currentTreasury?.incomeScenarios || {};
        const scenarioValue = Number(scenarios.expected);
        if (Number.isFinite(scenarioValue)) return scenarioValue;
        const projected = Number(currentSnapshot?.projectedBalance);
        return Number.isFinite(projected) ? projected : treasuryNumber('availableCash', 0);
    }

    function overviewRunwayValue() {
        return currentTreasury?.runwayMonths != null ? currentTreasury.runwayMonths : currentSnapshot?.runwayMonths;
    }

    function overviewButton(label, action, args = '', variant = '') {
        const extra = variant ? ` ${variant}` : '';
        return `<button class="fin-mini-btn${extra}" type="button" data-action="${escapeHtml(action)}"${args ? ` data-action-args="${escapeHtml(args)}"` : ''}>${escapeHtml(label)}</button>`;
    }

    function overviewActionForItem(item) {
        const type = String(item && item.type || '');
        const id = escapeActionArg(item && item.id || '');
        if (String(item && item.id) === 'month-end-gap') return { label: 'Adjust reserves', action: 'FinancialMode.setSection', args: "'plan'" };
        if (String(item && item.id) === 'monthly-review') return { label: 'Save checkpoint', action: 'FinancialMode.setSection', args: "'review'" };
        if (type === 'Overdue') return { label: 'Review income', action: 'FinancialMode.setSection', args: "'flow'" };
        if (type === 'Due soon') return { label: 'Review obligation', action: 'FinancialMode.setSection', args: "'review'" };
        if (type === 'Missing forecast input') return { label: 'Add income', action: 'FinancialMode.openAddModal', args: "'income'" };
        if (type === 'Missing plan' && /reserve/i.test(String(item && item.title || ''))) {
            return { label: 'Add reserve', action: 'FinancialMode.openAddModal', args: "'reserveBucket'" };
        }
        if (type === 'Missing plan') return { label: 'Confirm plan', action: 'openEditModal', args: `'debtPlan', '${id}'` };
        if (type === 'Needs review') return { label: 'Categorize', action: 'FinancialMode.setSection', args: "'review'" };
        return { label: 'Review', action: 'FinancialMode.setSection', args: "'review'" };
    }

    function overviewGroupForItem(item) {
        const type = String(item && item.type || '');
        const id = String(item && item.id || '');
        if (id === 'month-end-gap' || type === 'Overdue') return 'Critical';
        if (type === 'Due soon' || type === 'Missing plan') return 'Needs review';
        return 'Housekeeping';
    }

    function overviewReasonForItem(item) {
        const type = String(item && item.type || '');
        const id = String(item && item.id || '');
        if (id === 'month-end-gap') return 'Current plan closes short in the next 30 days.';
        if (id === 'monthly-review') return 'Close the monthly loop when you have a minute.';
        if (type === 'Overdue') return 'Expected income or payment is past its date.';
        if (type === 'Due soon') return 'A confirmed obligation needs a decision.';
        if (type === 'Missing plan') return 'Add a plan so burn and runway stay accurate.';
        if (type === 'Missing forecast input') return 'Add expected income to sharpen the forecast.';
        if (type === 'Needs review') return 'Classify this item so totals stay clean.';
        return 'Small cleanup that improves the cockpit.';
    }

    function buildOverviewActionItems() {
        const expectedMonthEnd = overviewExpectedMonthEnd();
        const reviewDue = isWeeklyReviewDue();
        const sourceItems = safeArray(currentSnapshot?.attentionQueue);
        const reviewItems = treasuryArray('reviewQueue')
            .filter((item) => !sourceItems.some((source) => String(source && source.id || '') === String(item && item.id || '')))
            .map((item) => ({
                type: item && item.tone === 'urgent' ? 'Overdue' : (item && item.kind === 'transaction' ? 'Needs review' : 'Missing plan'),
                title: item && item.title,
                amount: item && item.amount,
                action: item && item.actionLabel,
                id: item && (item.targetId || item.id),
                original: item
            }));

        const rows = [
            ...(expectedMonthEnd < 0 ? [{
                type: 'Critical',
                title: 'Projected month-end gap',
                amount: -Math.abs(expectedMonthEnd),
                action: 'Adjust reserves',
                id: 'month-end-gap'
            }] : []),
            ...(reviewDue ? [{
                type: 'Needs review',
                title: 'Checkpoint',
                amount: null,
                action: 'Save checkpoint',
                id: 'monthly-review'
            }] : []),
            ...sourceItems,
            ...reviewItems
        ].map((item) => {
            const group = overviewGroupForItem(item);
            const button = overviewActionForItem(item);
            return {
                id: String(item && item.id || item && item.title || group),
                group,
                title: String(item && item.title || 'Review item'),
                amount: item && item.amount,
                reason: overviewReasonForItem(item),
                button
            };
        });

        const groupOrder = { 'Critical': 0, 'Needs review': 1, 'Housekeeping': 2 };
        return rows
            .sort((a, b) => (groupOrder[a.group] ?? 9) - (groupOrder[b.group] ?? 9))
            .slice(0, 5);
    }

    function overviewPercent(value, total) {
        const number = Number(value);
        const denominator = Number(total);
        if (!Number.isFinite(number) || !Number.isFinite(denominator) || denominator <= 0) return 0;
        return Math.max(0, Math.min(100, (number / denominator) * 100));
    }

    function overviewRunwayStatus(runway) {
        const value = Number(runway);
        if (!Number.isFinite(value)) return { label: 'Unknown', className: 'is-watch' };
        if (value < 3) return { label: 'Thin', className: 'is-critical' };
        if (value < 6) return { label: 'Watch', className: 'is-watch' };
        return { label: 'Stable', className: 'is-steady' };
    }

    function pulseSafetyStateLabel(weatherState, safeToSpend, monthlyBurn) {
        const state = String(weatherState || '').toLowerCase();
        if (Number(safeToSpend) < 0 || state === 'stormy') return 'risky';
        if (state === 'tight') return 'tight';
        if (state === 'watchful' || Number(safeToSpend) < Math.max(250, Number(monthlyBurn) || 0)) return 'watchful';
        return 'safe';
    }

    function pulseSafetyClass(label) {
        if (label === 'risky') return 'is-critical';
        if (label === 'tight' || label === 'watchful') return 'is-watch';
        return 'is-steady';
    }

    function pulseNextIncome() {
        const active = getActivePipelineDeals()
            .filter((deal) => {
                const status = incomeStatusFromDeal(deal);
                return status !== 'lead' && status !== 'proposal' && status !== 'risky';
            })
            .sort((a, b) => (Date.parse(String(a && a.expectedDateISO || '')) || Number.MAX_SAFE_INTEGER) - (Date.parse(String(b && b.expectedDateISO || '')) || Number.MAX_SAFE_INTEGER));
        return active[0] || null;
    }

    function pulseNextObligations(limit = 5) {
        return treasuryArray('obligations')
            .filter((entry) => String(entry && entry.status || '') !== 'paid')
            .sort((a, b) => (Date.parse(String(a && a.dueDate || '')) || Number.MAX_SAFE_INTEGER) - (Date.parse(String(b && b.dueDate || '')) || Number.MAX_SAFE_INTEGER))
            .slice(0, limit);
    }

    function renderPulseNextIncomeCard(deal) {
        if (!deal) {
            return `
                <div class="fin-pulse-mini-card">
                    <span class="fin-eyebrow">Next Money In</span>
                    ${renderCompactEmpty('Add confirmed or expected income in Flow.')}
                    <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'income'">Add income</button>
                </div>
            `;
        }
        const status = incomeStatusFromDeal(deal);
        const probability = Number.isFinite(Number(deal.probability)) ? Math.round(Number(deal.probability) * 100) : 0;
        return `
            <div class="fin-pulse-mini-card">
                <span class="fin-eyebrow">Next Money In</span>
                <strong>${escapeHtml(deal.title || 'Expected income')}</strong>
                <div class="fin-pulse-line"><span>${formatCurrency(Number(deal.value) || 0)}</span><small>${formatShortDate(deal.expectedDateISO)} · ${escapeHtml(status)} · ${probability}%</small></div>
                <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'flow'">Open Flow</button>
            </div>
        `;
    }

    function renderPulseObligationsCard(items) {
        return `
            <div class="fin-pulse-mini-card">
                <span class="fin-eyebrow">Next Obligations</span>
                ${items.length ? `
                    <div class="fin-pulse-obligation-list">
                        ${items.map((entry) => `
                            <div class="fin-pulse-obligation">
                                <span><strong>${escapeHtml(entry.title || 'Obligation')}</strong><small>${escapeHtml(entry.type === 'debt' ? 'Debt payment plan' : 'Recurring obligation')} · ${formatShortDate(entry.dueDate)}</small></span>
                                <strong>${formatCurrency(entry.amount)}</strong>
                            </div>
                        `).join('')}
                    </div>
                ` : renderCompactEmpty('Add fixed costs or debt payment plans in Plan.')}
                <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'plan'">Open Plan</button>
            </div>
        `;
    }

    function renderOverviewForecastLine(expectedMonthEnd) {
        const calendar = buildCashCalendar(30);
        const availableCash = treasuryNumber('availableCash', 0);
        const events = safeArray(calendar && calendar.events).slice(0, 10);
        const values = [availableCash];
        let running = availableCash;
        events.forEach((event) => {
            running += Number(event && event.amount) || 0;
            values.push(running);
        });
        if (Number.isFinite(Number(expectedMonthEnd))) values.push(Number(expectedMonthEnd));
        while (values.length < 5) values.push(values[values.length - 1] || 0);

        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = Math.max(1, max - min);
        const width = 360;
        const height = 84;
        const points = values.map((value, index) => {
            const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width;
            const y = height - ((value - min) / range) * 56 - 14;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        });
        const splitIndex = Math.max(1, points.length - 2);
        const solidPoints = points.slice(0, splitIndex + 1).join(' ');
        const projectedPoints = points.slice(splitIndex).join(' ');
        const endPoint = points[points.length - 1] || `${width},${height / 2}`;
        const [endX, endY] = endPoint.split(',');

        return `
            <svg class="fin-money-trend" viewBox="0 0 ${width} ${height}" role="img" aria-label="30-day cash movement trend">
                <polyline class="fin-money-trend-line" points="${solidPoints}"></polyline>
                <polyline class="fin-money-trend-line fin-money-trend-line--projected" points="${projectedPoints}"></polyline>
                <circle class="fin-money-trend-dot" cx="${endX}" cy="${endY}" r="4.5"></circle>
            </svg>
        `;
    }

    function renderDashboardCockpit() {
        const totalCash = treasuryNumber('actualCash', treasuryNumber('totalCash', Number(currentSnapshot?.realBalance) || 0));
        const reservedCash = treasuryNumber('protectedCash', treasuryNumber('reservedCash', Number(currentSnapshot?.reservedCash) || 0));
        const snapshotAvailableCash = Number(currentSnapshot?.availableCash);
        const availableCash = treasuryNumber('availableCash', Number.isFinite(snapshotAvailableCash) ? snapshotAvailableCash : treasuryNumber('trulyAvailableCash', totalCash - reservedCash));
        const safeToSpend = treasuryNumber('safeToSpend', Number.isFinite(Number(currentSnapshot?.safeToSpend)) ? Number(currentSnapshot.safeToSpend) : availableCash);
        const shortTermPressure = treasuryNumber('committedShortTermObligations', Number(currentSnapshot?.committedShortTermObligations) || 0);
        const debtPressure = treasuryNumber('debtPaymentsDueSoon', Number(currentSnapshot?.debtPaymentsDueSoon) || 0);
        const minimumBuffer = treasuryNumber('minimumBuffer', Number(currentSnapshot?.minimumBuffer) || 0);
        const minimumBufferDays = treasuryNumber('minimumBufferDays', Number(currentSnapshot?.minimumBufferDays) || 7);
        const monthlyBurn = treasuryNumber('totalMonthlyBurn', Number(currentSnapshot?.monthlyBurn) || 0);
        const runway = overviewRunwayValue();
        const runwayLabel = runway == null ? '—' : `${Number(runway).toFixed(1)}`;
        const runwayStatus = overviewRunwayStatus(runway);
        const weather = currentRoadmapMetrics?.financialWeather || {};
        const safeLabel = pulseSafetyStateLabel(weather.state, safeToSpend, monthlyBurn);
        const safeClass = pulseSafetyClass(safeLabel);
        const runwayCopy = runway == null
            ? 'Add recurring burn and cash accounts to calculate runway.'
            : `Available cash covers ${Number(runway).toFixed(1)} months at the current monthly burn.`;
        const mainAmount = safeToSpend < 0 ? `Short by ${formatCurrency(Math.abs(safeToSpend))}` : formatCurrency(safeToSpend);
        const safeCopy = currentHasFinanceData
            ? `After protected cash, confirmed obligations, debt pressure, and a ${minimumBufferDays}-day buffer.`
            : 'Add cash accounts and recurring pressure to reveal what is safe to use.';

        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-money-picture fin-pulse-hero" data-fin-command-summary>
                    <div class="fin-money-picture-head">
                        <div>
                            <div class="widget-title ui-title">Safe-to-Spend</div>
                            <div class="fin-helper-text">The amount available for the next 30 days after protected cash, obligations, debt plans, and buffer.</div>
                        </div>
                    </div>
                    <div class="fin-money-picture-grid">
                        <div class="fin-money-safe ${safeClass}">
                            <span>Safe to spend</span>
                            <strong>${currentHasFinanceData ? mainAmount : '—'}</strong>
                            <div class="fin-runway-pill"><span></span>${escapeHtml(safeLabel)}</div>
                            <p>${escapeHtml(safeCopy)}</p>
                            <details class="fin-safe-breakdown-details">
                                <summary>How this is calculated</summary>
                                <div class="fin-safe-breakdown" aria-label="Safe-to-Spend formula">
                                    <div><span>Actual cash</span><strong>${formatCurrency(totalCash)}</strong></div>
                                    <div><span>Protected cash</span><strong>-${formatCurrency(reservedCash)}</strong></div>
                                    <div><span>Confirmed obligations</span><strong>-${formatCurrency(shortTermPressure)}</strong></div>
                                    <div><span>Debt due soon</span><strong>-${formatCurrency(debtPressure)}</strong></div>
                                    <div><span>${minimumBufferDays}-day buffer</span><strong>-${formatCurrency(minimumBuffer)}</strong></div>
                                </div>
                            </details>
                        </div>
                        <div class="fin-pulse-secondary">
                            <div class="fin-money-result">
                                <span>Current cash</span>
                                <strong>${currentHasFinanceData ? formatCurrency(totalCash) : '—'}</strong>
                                <p>${formatCurrency(reservedCash)} protected · ${formatCurrency(availableCash)} available after near-term pressure.</p>
                                <details class="fin-safe-breakdown-details">
                                    <summary>Account split</summary>
                                    <div class="fin-safe-breakdown">
                                        ${safeArray(currentData && currentData.fiatAccounts).slice(0, 4).map((account) => `
                                            <div><span>${escapeHtml(account.name || 'Cash account')}</span><strong>${formatCurrency(account.balance)}</strong></div>
                                        `).join('') || '<div><span>No cash accounts</span><strong>—</strong></div>'}
                                    </div>
                                </details>
                            </div>
                            <div class="fin-money-runway ${runwayStatus.className}">
                                <span>Runway</span>
                                <strong>${runwayLabel}<small> months</small></strong>
                                <div class="fin-runway-pill"><span></span>${escapeHtml(runwayStatus.label)}</div>
                                <p>${escapeHtml(runwayCopy)}</p>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'flow'">Open Flow</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    function renderTodaysDecision() {
        const expectedMonthEnd = overviewExpectedMonthEnd();
        const actions = buildOverviewActionItems();
        const overdue = actions.find((item) => item.group === 'Critical' && item.id !== 'month-end-gap');
        const missingPlan = actions.find((item) => item.group === 'Needs review' && /plan/i.test(item.title + item.reason));
        const missingInput = actions.find((item) => /income|reserve/i.test(item.title + item.reason));
        let decision = {
            title: 'No urgent decision',
            body: 'The cockpit is steady. A short checkpoint will keep it that way.',
            buttons: [{ label: 'Open Review', action: 'FinancialMode.setSection', args: "'review'" }]
        };

        if (expectedMonthEnd < 0) {
            decision = {
                title: `Projected month-end gap: ${formatCurrency(Math.abs(expectedMonthEnd))}`,
                body: 'Confirm expected income or adjust reserves before reviewing smaller obligations.',
                buttons: [
                    { label: 'Review income', action: 'FinancialMode.setSection', args: "'flow'" },
                    { label: 'Adjust reserves', action: 'FinancialMode.setSection', args: "'plan'" },
                    { label: 'Open Flow', action: 'FinancialMode.setSection', args: "'flow'" }
                ]
            };
        } else if (overdue) {
            decision = {
                title: overdue.title,
                body: overdue.reason,
                buttons: [{ label: 'Open Review', action: 'FinancialMode.setSection', args: "'review'" }]
            };
        } else if (missingPlan) {
            decision = {
                title: missingPlan.title,
                body: 'Confirm the payment plan so monthly burn and runway stay accurate.',
                buttons: [missingPlan.button]
            };
        } else if (isWeeklyReviewDue()) {
            decision = {
                title: 'Checkpoint is ready',
                body: 'Save the operating loop before making smaller adjustments.',
                buttons: [{ label: 'Save checkpoint', action: 'FinancialMode.setSection', args: "'review'" }]
            };
        } else if (missingInput) {
            decision = {
                title: missingInput.title,
                body: missingInput.reason,
                buttons: [missingInput.button]
            };
        }

        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-today-decision">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Today’s Finance Focus</div>
                            <div class="fin-helper-text">One next move, not the whole backlog.</div>
                        </div>
                    </div>
                    <div class="fin-decision-focus">
                        <div>
                            <strong>${escapeHtml(decision.title)}</strong>
                            <p>${escapeHtml(decision.body)}</p>
                        </div>
                        <div class="fin-decision-focus-actions">
                            ${decision.buttons.map((button, index) => overviewButton(button.label, button.action, button.args, index === 0 ? 'fin-mini-btn--primary' : '')).join('')}
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    function renderDashboardAction(item) {
        if (String(item && item.kind) === 'weekly_review') {
            return `<button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'review'">Save checkpoint</button>`;
        }
        return renderReviewQueueActions(item);
    }

    function renderNextActions() {
        const weather = currentRoadmapMetrics?.financialWeather || { state: 'Stable', reason: 'The current local finance picture is ready for review.', suggestedAction: 'Keep the weekly review cadence.' };
        const signals = safeArray(currentRoadmapMetrics?.topSignals).slice(0, 3);
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-financial-weather">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Financial Weather</div>
                            <div class="fin-helper-text">A data-backed condition, not a mood decoration.</div>
                        </div>
                        <span class="fin-runway-pill"><span></span>${escapeHtml(weather.state || 'Stable')}</span>
                    </div>
                    <div class="fin-weather-body">
                        <div>
                            <strong>${escapeHtml(weather.reason || 'No major imbalance detected.')}</strong>
                            <span>${escapeHtml(weather.suggestedAction || 'Keep the weekly review cadence.')}</span>
                        </div>
                        <div class="fin-weather-signals">
                            ${signals.map((signal) => `
                                <div class="fin-weather-signal">
                                    <span>${escapeHtml(signal.source || 'Radar')} · ${escapeHtml(signal.severity || 'info')}</span>
                                    <strong>${escapeHtml(signal.title)}</strong>
                                    <small>${escapeHtml(signal.reason)}</small>
                                </div>
                            `).join('') || renderCompactEmpty('No major signals.')}
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    function renderNext30Days() {
        const nextIncome = pulseNextIncome();
        const obligations = pulseNextObligations(5);
        return `
            <section class="fin-section">
                <div class="fin-pulse-two-col">
                    ${renderPulseNextIncomeCard(nextIncome)}
                    ${renderPulseObligationsCard(obligations)}
                </div>
            </section>
        `;
    }

    function renderStrategicPicture() {
        const monthlyBurn = treasuryNumber('totalMonthlyBurn', Number(currentSnapshot?.monthlyBurn) || 0);
        const expectedMonthEnd = overviewExpectedMonthEnd();
        const reserveHealth = currentRoadmapMetrics?.reserveHealth || {};
        const danger = currentRoadmapMetrics?.dangerZone || {};
        const trends = [
            { label: '30-day net', value: `${expectedMonthEnd >= 0 ? '+' : ''}${formatCurrency(expectedMonthEnd)}`, route: 'flow', tone: expectedMonthEnd < 0 ? 'fin-val-neg' : 'fin-text-safe' },
            { label: 'Monthly burn', value: formatCurrency(monthlyBurn), route: 'plan' },
            { label: 'Reserves funded', value: `${Number(reserveHealth.coveragePercent || 0)}%`, route: 'plan' },
            { label: 'Forecast low', value: danger.lowestAmount == null ? '—' : formatCurrency(danger.lowestAmount), route: 'flow', tone: Number(danger.lowestAmount) < 0 ? 'fin-val-neg' : '' },
        ];
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-tiny-trend-strip">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Tiny Trend Strip</div>
                            <div class="fin-helper-text">Small signals only. Open the source board for detail.</div>
                        </div>
                    </div>
                    <div class="fin-trend-strip-grid">
                        ${trends.slice(0, 4).map((trend) => `
                            <button class="fin-trend-strip-item" type="button" data-action="FinancialMode.setSection" data-action-args="'${escapeActionArg(trend.route)}'">
                                <span>${escapeHtml(trend.label)}</span>
                                <strong class="${escapeHtml(trend.tone || '')}">${escapeHtml(trend.value)}</strong>
                            </button>
                        `).join('')}
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
                                            <td>
                                                ${escapeHtml(entry.title)}
                                                ${Number(entry.vatAmount) > 0 ? `<small>VAT ${formatCurrency(entry.vatAmount)} (${escapeHtml(String(entry.vatRate || 0))}%) on top</small>` : ''}
                                            </td>
                                            <td>${renderStatusPill(entry.status)}</td>
                                            <td>${entry.dueDate ? formatShortDate(entry.dueDate) : 'No date'}</td>
                                            <td>${formatCurrency(entry.amount)}</td>
                                            <td style="text-align:right">
                                                <span class="fin-inline-icon-actions fin-inline-icon-actions--right">
                                                    ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'income', '${escapeActionArg(entry.id)}'`, label: `Edit ${entry.title || 'income'}` })}
                                                    ${financeIconButton({ action: 'markAsPaid', args: `'${escapeActionArg(entry.id)}'`, label: `Mark ${entry.title || 'income'} as received`, icon: 'success', tone: 'success' })}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : renderCompactEmpty('Forecast future income. Add upcoming invoices to project runway.')}
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
                    `).join('') : renderCompactEmpty('Add fixed costs to see what is due next.')}
                    ${overdue.length + dueSoon.length + upcoming.length > obligations.length ? '<div class="fin-helper-text">Open Review to resolve the full obligation queue.</div>' : ''}
                </div>
            </section>
        `;
    }

    function renderReviewQueue() {
        const queue = treasuryArray('reviewQueue');
        const unresolvedCount = queue.length;
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-review-list-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Review Queue</div>
                            <div class="fin-helper-text">${unresolvedCount} unresolved · Only items that need a classification, decision, or check.</div>
                        </div>
                        <button class="ui-btn ui-btn--secondary" type="button" data-action="FinancialMode.setSection" data-action-args="'logbook'">Open Logbook</button>
                    </div>
                    ${queue.length ? queue.map((item) => renderReviewRow(item, renderReviewQueueActions(item))).join('') : renderCompactEmpty('All items reviewed and reconciled.')}
                </div>
            </section>
        `;
    }

    function renderReviewQueueActions(item) {
        const kind = String(item && item.kind || 'setup');
        const id = escapeActionArg(item && (item.targetId || item.id) || '');
        if (kind === 'transaction') {
            return reviewIconButton({ action: 'openEditModal', args: `'transactionReview', '${id}'`, label: 'Edit transaction review' });
        }
        if (kind === 'payment') {
            return reviewIconButton({ action: 'openEditModal', args: `'paymentMatch', '${id}'`, label: 'Edit payment match' });
        }
        if (kind === 'pipeline') {
            return reviewIconButton({ action: 'openEditModal', args: `'pipelineReview', '${id}'`, label: 'Edit income review' });
        }
        if (kind === 'debt') {
            return reviewIconButton({ action: 'openEditModal', args: `'debtPlan', '${id}'`, label: 'Edit payment plan' });
        }
        if (kind === 'obligation') {
            return reviewIconButton({ action: 'openEditModal', args: `'obligationPayment', '${id}'`, label: 'Edit obligation review' });
        }
        if (String(item && item.id) === 'missing-cash') {
            return reviewIconButton({ action: 'FinancialMode.openAddModal', args: "'fiatAccount'", label: 'Edit cash accounts' });
        }
        if (String(item && item.id) === 'missing-burn') {
            return reviewIconButton({ action: 'FinancialMode.openAddModal', args: "'expense'", label: 'Edit recurring costs' });
        }
        return reviewIconButton({ action: 'FinancialMode.setSection', args: "'review'", label: escapeHtml(item && item.actionLabel || 'Review item') });
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
                            <div class="widget-title ui-title">Obligation Review</div>
                            <div class="fin-helper-text">Resolve due costs here: pay, defer, or keep them flagged for review.</div>
                        </div>
                        ${reviewIconButton({ action: 'FinancialMode.openAddModal', args: "'expense'", label: 'Edit recurring costs' })}
                    </div>
                    ${obligations.length ? obligations.map((entry) => `
                        ${renderObligationRow(entry, reviewIconButton({ action: 'openEditModal', args: `'obligationPayment', '${escapeActionArg(entry.id)}'`, label: 'Edit obligation review' }))}
                    `).join('') : renderCompactEmpty('No pressing obligations. You are in the clear.')}
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
                            <div class="widget-title ui-title">Payment Matching</div>
                            <div class="fin-helper-text">Payments booked into the ledger. Matched payments are tied to an obligation; the rest are review material.</div>
                        </div>
                        ${reviewIconButton({ action: 'openEditModal', args: "'transaction'", label: 'Edit payments' })}
                    </div>
                    ${payments.length ? payments.map((entry) => {
                const matched = Boolean(entry.obligationId);
                const action = matched
                    ? reviewIconButton({ action: 'openEditModal', args: `'transactionReview', '${escapeActionArg(entry.id)}'`, label: 'Edit transaction review' })
                    : reviewIconButton({ action: 'openEditModal', args: `'paymentMatch', '${escapeActionArg(entry.id)}'`, label: 'Edit payment match' });
                return renderPaymentRow(entry, action);
            }).join('') : renderCompactEmpty('Awaiting payments. Book transactions to match them against expectations.')}
                </div>
            </section>
        `;
    }

    function renderScenarioOutcomes() {
        const forecast = currentForecast || buildFinanceForecast({
            readModel: currentData || {},
            snapshot: currentSnapshot || {},
            treasury: currentTreasury || {},
            nowIso: new Date().toISOString(),
        });
        const horizons = [7, 30, 60, 90, 180]
            .map((days) => forecast.byHorizon && forecast.byHorizon[String(days)])
            .filter(Boolean);
        const warnings = safeArray(forecast.warnings).slice(0, 4);
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-flow-scenarios-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Scenario Pressure</div>
                            <div class="fin-helper-text">Conservative, expected, and optimistic cash paths using current obligations, payment plans, reserves, and expected income.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'plan'">Edit Plan inputs</button>
                    </div>
                    <div class="fin-status-grid fin-flow-scenario-grid">
                        ${horizons.map((entry) => `
                            <div class="fin-status-card">
                                <span class="fin-muted">${entry.days} days</span>
                                <strong>${formatCurrency(entry.expected)}</strong>
                                <span>${formatCurrency(entry.conservative)} conservative · ${formatCurrency(entry.optimistic)} optimistic</span>
                                <small>${formatCurrency(entry.components.recurringObligations)} obligations · ${formatCurrency(entry.components.expectedIncome)} expected income</small>
                            </div>
                        `).join('')}
                    </div>
                    ${warnings.length ? `
                        <div class="fin-forecast-warning-list" aria-label="Forecast warnings">
                            ${warnings.map((warning) => `<div class="fin-confidence-row"><span class="fin-text-med">${escapeHtml(warning)}</span></div>`).join('')}
                        </div>
                    ` : ''}
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
                        `).join('') : renderCompactEmpty('Add operating cash.')}
                        <button class="fin-action-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'fiatAccount'">Add cash account</button>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Recurring Costs & Debt</div>
                        ${safeArray(currentData && currentData.recurringExpenses).slice(0, 5).map((expense) => `
                            <div class="modal-list-row">
                                <span><strong>${escapeHtml(expense.category)}</strong><br><small>Due day ${escapeHtml(expense.dueDay)} · ${escapeHtml(expense.scope || 'shared')}</small></span>
                                <span>${formatCurrency(expense.monthlyAmount)}</span>
                            </div>
                        `).join('') || renderCompactEmpty('Add recurring costs.')}
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
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'review'">Open Review</button>
                    </div>
                </div>
                ${reviewDue ? `
                    <div class="widget ui-card glass fin-card fin-review-prompt">
                        <div>
                            <div class="widget-title ui-title">Checkpoint recommended</div>
                            <div class="fin-helper-text">Reconcile cash accounts, scan costs and pipeline, then leave one note for the week ahead.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'review'">Save checkpoint</button>
                    </div>
                ` : ''}
            </section>
        `;
    }

    function isWeeklyReviewDue() {
        const reviewed = Date.parse(String(currentReview && currentReview.lastReviewedAt || ''));
        return !Number.isFinite(reviewed) || Date.now() - reviewed >= 7 * 24 * 60 * 60 * 1000;
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

        safeArray(currentData && currentData.debtAccounts).forEach((debt) => {
            const amount = Math.max(0, Number(debt && debt.minimumPaymentMonthly) || 0);
            if (!amount) return;
            const baseDue = new Date(debt && debt.dueDate || start);
            for (let monthOffset = 0; monthOffset < 4; monthOffset += 1) {
                const due = new Date(start.getFullYear(), start.getMonth() + monthOffset, Math.max(1, Math.min(28, Number.isFinite(baseDue.getTime()) ? baseDue.getDate() : 1)), 12);
                if (due < start || due > end) continue;
                events.push({ date: due, label: debt.name || 'Debt payment', amount: -amount, kind: 'Debt plan' });
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
            let balance = treasuryNumber('availableCash', Number(currentSnapshot && currentSnapshot.availableCash) || Number(currentSnapshot && currentSnapshot.realBalance) || 0);
            let low = balance;
            events.filter((entry) => entry.date <= horizonEnd).forEach((entry) => {
                balance += entry.amount;
                low = Math.min(low, balance);
            });
            return { horizon, low, ending: balance };
        });
        return { events, lows };
    }

    function flowEventTone(event) {
        const amount = Number(event && event.amount) || 0;
        if (amount >= 0) return 'income';
        if (String(event && event.kind || '').toLowerCase().includes('debt')) return 'debt';
        return 'outflow';
    }

    function renderCashCalendar() {
        const calendar = buildCashCalendar();
        const forecast30 = currentForecast?.byHorizon?.['30'] || null;
        const weather = currentRoadmapMetrics?.financialWeather || {};
        const danger = currentRoadmapMetrics?.dangerZone || {};
        const availableCash = treasuryNumber('availableCash', Number(currentSnapshot?.availableCash) || 0);
        const expectedLanding = Number.isFinite(Number(forecast30?.expected)) ? Number(forecast30.expected) : calendar.lows.find((entry) => entry.horizon === 30)?.ending;
        const nextIncome = calendar.events.find((entry) => Number(entry.amount) > 0);
        const nextOutflow = calendar.events.find((entry) => Number(entry.amount) < 0);
        const nextEvents = calendar.events.slice(0, 7);
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-calendar-card fin-flow-timeline-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Flow Timeline</div>
                            <div class="fin-helper-text">Upcoming income, obligations, payment plans, and low points from the current forecast.</div>
                        </div>
                        <span class="fin-runway-pill"><span></span>${escapeHtml(weather.state || 'Stable')}</span>
                    </div>
                    <div class="fin-flow-hero-grid">
                        <div class="fin-flow-hero-main">
                            <span>30-day expected landing</span>
                            <strong class="${Number(expectedLanding) < 0 ? 'fin-val-neg' : ''}">${Number.isFinite(Number(expectedLanding)) ? formatCurrency(expectedLanding) : '—'}</strong>
                            <small>Starts from ${formatCurrency(availableCash)} available cash. Expected income remains forecasted until settled.</small>
                        </div>
                        <div class="fin-flow-next-pair">
                            <div><span>Next money in</span><strong>${nextIncome ? formatCurrency(nextIncome.amount) : '—'}</strong><small>${nextIncome ? `${escapeHtml(nextIncome.label)} · ${formatShortDate(nextIncome.date)}` : 'No dated income'}</small></div>
                            <div><span>Next obligation</span><strong>${nextOutflow ? formatCurrency(Math.abs(nextOutflow.amount)) : '—'}</strong><small>${nextOutflow ? `${escapeHtml(nextOutflow.label)} · ${formatShortDate(nextOutflow.date)}` : 'No dated outflow'}</small></div>
                            <div><span>Forecast low</span><strong class="${Number(danger.lowestAmount) < 0 ? 'fin-val-neg' : ''}">${danger.lowestAmount == null ? '—' : formatCurrency(danger.lowestAmount)}</strong><small>${danger.firstNegativeDate ? `First shortfall ${formatShortDate(danger.firstNegativeDate)}` : 'No dated shortfall in view'}</small></div>
                        </div>
                    </div>
                    <div class="fin-calendar-lows">
                        ${calendar.lows.map((entry) => `<div><span>${entry.horizon}d low</span><strong class="${entry.low < 0 ? 'fin-val-neg' : ''}">${formatCurrency(entry.low)}</strong><small>Ends ${formatCurrency(entry.ending)}</small></div>`).join('')}
                    </div>
                    <div class="fin-calendar-events">
                        ${nextEvents.length ? nextEvents.map((entry) => `
                            <div class="fin-calendar-event is-${flowEventTone(entry)}">
                                <span><strong>${escapeHtml(entry.label)}</strong><small>${escapeHtml(entry.kind)} · ${formatShortDate(entry.date)}</small></span>
                                <span class="${entry.amount >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${entry.amount >= 0 ? '+' : '-'}${formatCurrency(Math.abs(entry.amount))}</span>
                            </div>
                        `).join('') : renderCompactEmpty('Add dated income, recurring costs, or payment plans to shape the Flow timeline.')}
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
                    ` : renderCompactEmpty('Set a safety buffer to build peace of mind.')}
                </div>
            </section>
        `;
    }

    function computeHybridTotals() {
        const accountCash = safeArray(currentData && currentData.fiatAccounts)
            .reduce((sum, account) => sum + (Number(account && account.balance) || 0), 0);
        const fiatTotal = treasuryNumber('actualCash', accountCash);
        const liabilities = Math.max(0, explanationNumber('debtBurden', Number(currentSnapshot && currentSnapshot.totalDebt) || 0));
        const snapshotAvailableCash = Number(currentSnapshot && currentSnapshot.availableCash);
        return {
            fiatTotal,
            liabilities,
            availableCash: treasuryNumber('availableCash', Number.isFinite(snapshotAvailableCash) ? snapshotAvailableCash : fiatTotal),
            reservedCash: treasuryNumber('protectedCash', Number(currentSnapshot && currentSnapshot.reservedCash) || 0)
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
                                <span>Available Cash</span>
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
                                        ${financeIconButton({ action: 'deleteInvoice', args: `'${escapeActionArg(item.id)}'`, label: `Remove ${item.client || 'settled income'} from history`, icon: 'warning', tone: 'muted' })}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `
                : renderCompactEmpty('No settled income yet.');
        } else if (tab === 'cashflow') {
            panelHtml = renderCashflowRhythm(rhythmData);
        } else {
            panelHtml = `
                ${deals.length ? `
                    <table class="fin-table fin-table--compact">
                        <thead><tr><th>Source</th><th>Status</th><th>Due state</th><th>Expected date</th><th>Prob.</th><th>Weighted</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${deals.map((deal) => {
                                const status = incomeStatusFromDeal(deal);
                                const dueState = incomeDueStateFromDeal(deal, status);
                                const probability = Number(deal.probability || 0);
                                const projectLabel = incomeProjectLabel(deal.projectId);
                                return `
                                <tr>
                                    <td>${escapeHtml(deal.title || 'Pipeline item')}<small>${escapeHtml([deal.incomeType === 'retainer' ? 'retainer' : deal.incomeType === 'recurring' ? 'recurring' : '', projectLabel].filter(Boolean).join(' · '))}</small></td>
                                    <td>${renderStatusPill(status)}</td>
                                    <td>${renderStatusPill(dueState)}</td>
                                    <td>${deal.expectedDateISO ? formatShortDate(deal.expectedDateISO) : 'No date'}</td>
                                    <td>${(probability * 100).toFixed(0)}%</td>
                                    <td class="fin-val-pos">${formatCurrency((Number(deal.value) || 0) * probability)}</td>
                                    <td style="text-align:right">
                                        <span class="fin-inline-icon-actions fin-inline-icon-actions--right">
                                            ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'income', '${escapeActionArg(deal.id)}'`, label: `Edit ${deal.title || 'pipeline item'}` })}
                                            ${financeIconButton({ action: 'markAsPaid', args: `'${escapeActionArg(deal.id)}'`, label: `Mark ${deal.title || 'pipeline item'} as received`, icon: 'success', tone: 'success' })}
                                            ${financeIconButton({ action: 'deleteInvoice', args: `'${escapeActionArg(deal.id)}'`, label: `Archive ${deal.title || 'pipeline item'}`, icon: 'warning', tone: 'muted' })}
                                        </span>
                                    </td>
                                </tr>
                            `;
                            }).join('')}
                        </tbody>
                    </table>
                ` : renderCompactEmpty(currentHasFinanceData ? 'Forecast future income. What is the next likely incoming payment?' : 'Begin tracking. Add your first entry.')}
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
	                    <div class="widget-title ui-title">Income Timing</div>
                        <div class="fin-helper-text">Expected money stays forecasted here until it settles into an account.</div>
	                    <div class="fin-tabs" role="tablist" aria-label="Income timing tabs">
	                        <button class="fin-tab-btn ${tab === 'pipeline' ? 'active' : ''}" type="button" data-fin-action="set-tab" data-fin-tab="pipeline">Expected</button>
	                        <button class="fin-tab-btn ${tab === 'history' ? 'active' : ''}" type="button" data-fin-action="set-tab" data-fin-tab="history">History</button>
	                        <button class="fin-tab-btn ${tab === 'cashflow' ? 'active' : ''}" type="button" data-fin-action="set-tab" data-fin-tab="cashflow">Rhythm</button>
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
                    <div class="widget-title ui-title">Runway Projection</div>
                    <div class="fin-helper-text">A 12-month visual forecast. Use Flow for timing and Plan for the structural inputs behind the line.</div>
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
                    <div class="widget-title ui-title">Review Signals</div>
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

    function attachCharts() {
        const svg = document.getElementById('fin-projection-svg');
        if (!svg || !window.FinancialEngine || typeof window.FinancialEngine.generateProjections !== 'function') return;
        const projections = window.FinancialEngine.generateProjections({
            financeSnapshot: currentSnapshot,
            financeReadModel: currentData
        }, { burnChange: 0, probFloor: 0.5, marketShift: 0 });
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

    function saveSettingsPage() {
        if (!window.Store) return;
        
        const currencyEl = document.getElementById('page-settings-currency');
        const forecastEl = document.getElementById('page-settings-forecast');
        const scopeEl = document.getElementById('page-settings-scope');
        const appearanceEl = document.getElementById('page-settings-appearance');
        const reducedMotionEl = document.getElementById('page-settings-reduced-motion');
        
        if (currencyEl && forecastEl && scopeEl && appearanceEl && reducedMotionEl) {
            try {
                window.Store.saveFinanceSettings({ 
                    baseCurrency: currencyEl.value || 'EUR', 
                    forecastDays: Number(forecastEl.value) || 90 
                });
                
                window.Store.saveUiSettings({
                    appearance: appearanceEl.value || 'dark-editorial',
                    reducedMotion: reducedMotionEl.checked,
                    scopeFilter: scopeEl.value || 'all',
                });
                
                if (window.applyAppearance) {
                    window.applyAppearance(window.Store);
                }
                
                // Show brief visual feedback if desired, or just refresh
                window.FinancialMode.render();
                
            } catch (error) {
                console.error('Failed to save settings:', error);
                if (window.showModalError) {
                    window.showModalError(error.message || 'Could not save settings.');
                }
            }
        }
    }

    function moveExpense(id, direction) {
        const expenses = safeArray(currentData?.recurringExpenses);
        const target = expenses.find(e => String(e.id) === String(id));
        if (!target) return;
        
        const isEssential = target.essential;
        const bucket = expenses.filter(e => e.essential === isEssential);
        
        const orderMap = {};
        try {
            const raw = localStorage.getItem('finance-master.ui.expenseOrder');
            if (raw) {
                const arr = JSON.parse(raw);
                arr.forEach((aid, idx) => orderMap[aid] = idx);
            }
        } catch (e) {}
        
        bucket.sort((a, b) => {
            const posA = orderMap.hasOwnProperty(a.id) ? orderMap[a.id] : 99999;
            const posB = orderMap.hasOwnProperty(b.id) ? orderMap[b.id] : 99999;
            return posA - posB;
        });
        
        const idx = bucket.findIndex(e => String(e.id) === String(id));
        if (idx === -1) return;
        const swapIdx = idx + Number(direction);
        if (swapIdx < 0 || swapIdx >= bucket.length) return;
        
        const temp = bucket[idx];
        bucket[idx] = bucket[swapIdx];
        bucket[swapIdx] = temp;
        
        const otherBucket = expenses.filter(e => e.essential !== isEssential);
        otherBucket.sort((a, b) => {
            const posA = orderMap.hasOwnProperty(a.id) ? orderMap[a.id] : 99999;
            const posB = orderMap.hasOwnProperty(b.id) ? orderMap[b.id] : 99999;
            return posA - posB;
        });
        
        const newOrder = [...(isEssential ? bucket : otherBucket), ...(isEssential ? otherBucket : bucket)].map(e => String(e.id));
        try {
            localStorage.setItem('finance-master.ui.expenseOrder', JSON.stringify(newOrder));
        } catch (e) {}
        
        render();
    }

    return {
        init,
        render,
        setSection: setActiveSection,
        toggleMobileNav,
        closeMobileNav,
        setFocusMode,
        setPipelineTab,
        openAddModal,
        saveSettingsPage,
        moveExpense
    };
})();

// Initialize on load
