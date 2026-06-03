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
import { buildFinanceForecast } from '../finance/forecast.js';

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
    let currentHasFinanceData = false;
    let labState = { marketMajors: 0, burnDelta: 0, probFloor: 50 };
    let adviceExpanded = false;
    let ledgerMoreFiltersOpen = false;
    let monthlyReviewError = '';
    let treasuryBurnCut = 0;

    const UI_KEYS = {
        focusMode: 'finance-master.layout.focus-mode',
        pipelineTab: 'finance-master.layout.pipeline-tab',
        ledgerView: 'finance-master.layout.ledger-view',
        ledgerFilters: 'finance-master.layout.ledger-filters',
        selectedTransaction: 'finance-master.layout.selected-transaction',
        invoicesView: 'finance-master.layout.invoices-view',
        activeSection: 'finance-master.layout.active-section'
    };

    const SECTIONS = ['dashboard', 'ledger', 'planning', 'review', 'reserves', 'reports', 'data'];
    const SECTION_ALIASES = {
        overview: 'dashboard',
        today: 'dashboard',
        transactions: 'ledger',
        ledger: 'ledger',
        'cash-movement': 'ledger',
        cashmovement: 'ledger',
        cashMovement: 'ledger',
        income: 'planning',
        invoices: 'planning',
        cashflow: 'planning',
        planning: 'planning',
        review: 'review',
        'monthly-review': 'review',
        monthlyreview: 'review',
        monthlyReview: 'review',
        'month-close': 'review',
        monthclose: 'review',
        monthClose: 'review',
        treasury: 'reserves',
        reserves: 'reserves',
        obligations: 'reserves',
        fixedcosts: 'reserves',
        fixedCosts: 'reserves',
        reports: 'reports',
        insights: 'reports',
        system: 'data',
        data: 'data',
        import: 'data',
        backup: 'data',
        settings: 'data'
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
            if (raw === 'clean' || raw === 'work') return raw;
        } catch (error) {
            // noop
        }
        return 'clean';
    }

    function setLedgerView(view) {
        const safe = String(view || 'clean').toLowerCase();
        if (safe !== 'clean' && safe !== 'work') return;
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

            if (action === 'set-treasury-burn-cut') {
                treasuryBurnCut = Math.max(0, Number(actionEl.getAttribute('data-fin-cut') || '0') || 0);
                render();
                return;
            }

            if (action === 'open-treasury-panel') {
                const sectionId = String(actionEl.getAttribute('data-fin-section') || '').trim();
                if (sectionId) setSectionCollapsed(sectionId, false);
                render();
                return;
            }

            if (action === 'reverse-ledger-transaction') {
                const id = String(actionEl.getAttribute('data-fin-transaction-id') || '').trim();
                if (!id) return;
                if (typeof window.requestDestructiveConfirmation === 'function') {
                    window.requestDestructiveConfirmation({
                        action: 'reverseTransaction',
                        targetId: id,
                        source: 'ledger.page.reverse',
                        title: 'Reverse transaction',
                        copy: 'This reverses the transaction and its linked account balance update.',
                        phrase: 'REVERSE TRANSACTION',
                        buttonLabel: 'Reverse transaction',
                        renderAfter: true
                    });
                }
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
        currentHasFinanceData = Number(currentData && currentData.eventsCount) > 0;
        currentMetrics = window.FinancialEngine.compute({
            financeSnapshot: currentSnapshot,
            financeReadModel: currentData
        });

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

    function renderSection(activeSection) {
        return createSectionRenderer({
            ledger: renderLedgerSection,
            invoices: renderInvoicesSection,
            scenarioOutcomes: renderScenarioOutcomes,
            cashCalendar: renderCashCalendar,
            pipelineTabs: renderPipelineTabs,
            goals: renderGoals,
            projection: renderProjection,
            scenarioLab: renderScenarioLab,
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
        const uncategorized = transactions.filter((entry) => ledgerNeedsCategory(entry));
        const unmatchedPayments = transactions.filter((entry) => ledgerNeedsMatch(entry));
        const missingReceipts = transactions.filter((entry) => ledgerNeedsReceiptCheck(entry));
        const matchedPayments = transactions.filter((entry) => String(entry && entry.obligationId || '').trim()).length;
        const netMovement = transactions.reduce((sum, entry) => sum + ledgerSignedAmount(entry), 0);
        const selectedStoredId = getSelectedLedgerTransactionId();
        const selectedTransaction = transactions.find((entry) => ledgerTransactionId(entry) === selectedStoredId) || transactions[0] || null;
        const selectedId = selectedTransaction ? ledgerTransactionId(selectedTransaction) : '';
        const statusStrip = `
            <div class="fin-ledger-status-strip" aria-label="Ledger status">
                <div><span>Records</span><strong>${transactions.length}</strong><small>${allTransactions.length} total</small></div>
                <div><span>Net movement</span><strong class="${netMovement >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${netMovement >= 0 ? '+' : '-'}${formatCurrency(Math.abs(netMovement))}</strong><small>Current filters</small></div>
                <div><span>Open items</span><strong>${reviewTransactions.length}</strong><small>Classification or evidence</small></div>
                <div><span>Matched payments</span><strong>${matchedPayments}</strong><small>Linked obligations</small></div>
            </div>
        `;
        const renderLedgerRow = (entry) => {
            const id = ledgerTransactionId(entry);
            const signed = ledgerSignedAmount(entry);
            const reviewState = String(entry && entry.reviewStatus || 'clear').toLowerCase();
            const chips = [
                ledgerNeedsCategory(entry) ? 'Needs category' : '',
                reviewState !== 'clear' ? entry.reviewStatus || 'Needs review' : ''
            ].filter(Boolean);
            return `
                <div class="fin-transaction-row ${id === selectedId ? 'active' : ''}" role="button" tabindex="0" data-fin-action="select-ledger-transaction" data-fin-transaction-id="${escapeHtml(id)}">
                    <div class="fin-transaction-row-main">
                        <strong>${escapeHtml(entry.description || 'Transaction')}</strong>
                        <small>${formatShortDate(entry.timestamp)} · ${escapeHtml(entry.categoryId || 'uncategorized')} · ${escapeHtml(entry.accountName || entry.fromAccountName || 'Account')} · ${escapeHtml(entry.scope || 'shared')}</small>
                        <div class="fin-chip-row">${chips.map((chip) => `<span class="fin-status-pill">${escapeHtml(chip)}</span>`).join('')}</div>
                    </div>
                    <div class="fin-transaction-row-side">
                        <span class="${signed >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${signed >= 0 ? '+' : '-'}${formatCurrency(Math.abs(signed), entry.currency)}</span>
                        ${financeTransactionIconButton({ action: 'select-ledger-transaction', transactionId: id, label: 'Inspect transaction' })}
                    </div>
                </div>
            `;
        };
        const renderReviewRow = (entry) => {
            const id = ledgerTransactionId(entry);
            const signed = ledgerSignedAmount(entry);
            const needsCategory = ledgerNeedsCategory(entry);
            const needsMatch = ledgerNeedsMatch(entry);
            const suggestedMatch = needsMatch ? ledgerPaymentMatchSuggestions(entry)[0] : null;
            return `
                <div class="fin-transaction-row fin-transaction-row--review ${id === selectedId ? 'active' : ''}" role="button" tabindex="0" data-fin-action="select-ledger-transaction" data-fin-transaction-id="${escapeHtml(id)}">
                    <div class="fin-transaction-row-main">
                        <strong>${escapeHtml(entry.description || 'Transaction')}</strong>
                        <small>${formatShortDate(entry.timestamp)} · ${ledgerReviewReason(entry)} · ${escapeHtml(entry.accountName || entry.fromAccountName || 'Account')}${suggestedMatch ? ` · suggested ${escapeHtml(suggestedMatch.title)}` : ''}</small>
                    </div>
                    <div class="fin-transaction-row-side">
                        <span class="${signed >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${signed >= 0 ? '+' : '-'}${formatCurrency(Math.abs(signed), entry.currency)}</span>
                        <div class="fin-ledger-actions">
                            ${needsCategory ? financeIconButton({ action: 'openEditModal', args: `'transactionReview', '${escapeActionArg(id)}'`, label: 'Edit transaction review' }) : ''}
                            ${needsMatch ? financeIconButton({ action: 'openEditModal', args: `'paymentMatch', '${escapeActionArg(id)}'`, label: 'Edit payment match', icon: 'success', tone: 'success' }) : ''}
                            ${financeTransactionIconButton({ action: 'select-ledger-transaction', transactionId: id, label: 'Inspect transaction' })}
                        </div>
                    </div>
                </div>
            `;
        };
        const sourceFilter = sourceOptions.length ? `
            <select id="fin-ledger-source" aria-label="Filter ledger by source">
                <option value="all"${filters.source === 'all' || !filters.source ? ' selected' : ''}>All sources</option>
                ${sourceOptions.map((source) => `<option value="${escapeHtml(source)}"${String(filters.source) === source ? ' selected' : ''}>${escapeHtml(source)}</option>`).join('')}
            </select>
        ` : `<input id="fin-ledger-source" aria-label="Filter ledger by source" value="all" type="hidden" />`;
        const importBatchFilter = importBatchOptions.length ? `
            <select id="fin-ledger-import-batch" aria-label="Filter ledger by import batch">
                <option value="all"${filters.importBatchId === 'all' || !filters.importBatchId ? ' selected' : ''}>All import batches</option>
                ${importBatchOptions.map((batchId) => {
            const batch = ledgerImportBatch({ importBatchId: batchId });
            const label = batch && batch.sourceFile ? `${batch.sourceFile} · ${batchId}` : batchId;
            return `<option value="${escapeHtml(batchId)}"${String(filters.importBatchId) === batchId ? ' selected' : ''}>${escapeHtml(label)}</option>`;
        }).join('')}
            </select>
        ` : `<input id="fin-ledger-import-batch" aria-label="Filter ledger by import batch" value="all" type="hidden" />`;
        const chips = renderLedgerFilterChips(filters);
        const filtersHtml = `
            <div class="fin-ledger-toolbar" aria-label="Ledger filters">
                <div class="fin-ledger-filter-bar">
                    <input id="fin-ledger-search" aria-label="Search ledger" value="${escapeHtml(filters.search)}" placeholder="Search note, account, category, source" />
                    <select id="fin-ledger-account" aria-label="Filter ledger by account">${ledgerAccountOptions(filters.accountId)}</select>
                    <input id="fin-ledger-category" aria-label="Filter ledger by category" value="${escapeHtml(filters.categoryId)}" placeholder="Category" />
                    <input id="fin-ledger-date-from" aria-label="Ledger date from" type="date" value="${escapeHtml(filters.dateFrom)}" />
                    <input id="fin-ledger-date-to" aria-label="Ledger date to" type="date" value="${escapeHtml(filters.dateTo)}" />
                    <button class="fin-mini-btn" type="button" data-fin-action="toggle-ledger-more-filters" aria-expanded="${ledgerMoreFiltersOpen ? 'true' : 'false'}">More filters</button>
                    <button class="fin-mini-btn fin-mini-btn--primary" type="button" data-fin-action="apply-ledger-filters">Apply filters</button>
                </div>
                ${ledgerMoreFiltersOpen ? `
                <div class="fin-ledger-filter-advanced" aria-label="Advanced ledger filters">
                    <select id="fin-ledger-scope" aria-label="Filter ledger by scope">${scopeFilterOptions(filters.scope)}</select>
                    <select id="fin-ledger-type" aria-label="Filter ledger by type">
                        <option value="all"${filters.type === 'all' ? ' selected' : ''}>All types</option>
                        <option value="income"${filters.type === 'income' ? ' selected' : ''}>Income</option>
                        <option value="expense"${filters.type === 'expense' ? ' selected' : ''}>Expense</option>
                        <option value="transfer"${filters.type === 'transfer' ? ' selected' : ''}>Transfer</option>
                        <option value="adjustment"${filters.type === 'adjustment' ? ' selected' : ''}>Adjustment</option>
                    </select>
                    <select id="fin-ledger-review" aria-label="Filter ledger by review status">
                        <option value="all"${filters.reviewStatus === 'all' ? ' selected' : ''}>All review states</option>
                        <option value="clear"${filters.reviewStatus === 'clear' ? ' selected' : ''}>Clear</option>
                        <option value="needs_review"${filters.reviewStatus === 'needs_review' ? ' selected' : ''}>Needs review</option>
                        <option value="reviewed"${filters.reviewStatus === 'reviewed' ? ' selected' : ''}>Reviewed</option>
                    </select>
                    ${sourceFilter}
                    ${importBatchFilter}
                    <select id="fin-ledger-link-state" aria-label="Filter ledger by link state">
                        <option value="all"${filters.linkState === 'all' ? ' selected' : ''}>All link states</option>
                        <option value="linked"${filters.linkState === 'linked' ? ' selected' : ''}>Linked records</option>
                        <option value="unlinked"${filters.linkState === 'unlinked' ? ' selected' : ''}>Unlinked records</option>
                    </select>
                    <input id="fin-ledger-amount-min" aria-label="Ledger amount minimum" type="number" min="0" step="0.01" value="${escapeHtml(filters.amountMin)}" placeholder="Minimum amount" />
                    <input id="fin-ledger-amount-max" aria-label="Ledger amount maximum" type="number" min="0" step="0.01" value="${escapeHtml(filters.amountMax)}" placeholder="Maximum amount" />
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
        } else {
            panelHtml = transactions.length ? transactions.map(renderLedgerRow).join('') : renderCompactEmpty('Begin tracking. Add your first payment or sync a CSV.');
        }
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-ledger-workspace-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Ledger Workspace</div>
                            <div class="fin-helper-text">Review cash movement, classify records, and inspect evidence when needed.</div>
                        </div>
                        <div class="fin-action-row">
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'csvImport'">Import CSV</button>
                            <button class="fin-mini-btn" type="button" data-action="exportTransactionsCsv">Export</button>
                            <button class="fin-mini-btn fin-mini-btn--primary" type="button" data-action="openEditModal" data-action-args="'transaction', 'expense'">Add transaction</button>
                        </div>
                    </div>
                    ${statusStrip}
                    ${filtersHtml}
                    <div class="fin-tabs" role="tablist" aria-label="Transaction view modes">
                        <button class="fin-tab-btn ${view === 'clean' ? 'active' : ''}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="clean">Ledger</button>
                        <button class="fin-tab-btn ${view === 'work' ? 'active' : ''}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="work">Review</button>
                    </div>
                    <div class="fin-ledger-workspace-grid">
                        <div class="fin-tab-panel">
                            ${panelHtml}
                        </div>
                        ${renderLedgerInspector(selectedTransaction, view)}
                    </div>
                </div>
            </section>
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

    function ledgerImportBatchSummary(batch) {
        if (!batch) return [];
        const imported = Number(batch.importedCount ?? safeArray(batch.fingerprints).length) || 0;
        const duplicates = Number(batch.duplicateCount || 0);
        const duplicateImported = Number(batch.duplicateImportedCount || 0);
        const rejected = Number(batch.rejectedCount || 0);
        const activeRows = safeArray(currentData && currentData.transactions).filter((entry) => String(entry && entry.importBatchId || '') === String(batch.id || '')).length;
        const policy = batch.duplicatePolicy === 'import' ? 'duplicates imported' : 'duplicates skipped';
        const totals = `${formatCurrency(Number(batch.incomeTotal || 0))} in · ${formatCurrency(Number(batch.expenseTotal || 0))} out`;
        const dateRange = batch.dateFrom && batch.dateTo
            ? (batch.dateFrom === batch.dateTo ? batch.dateFrom : `${batch.dateFrom} to ${batch.dateTo}`)
            : '';
        return [
            ['CSV batch', `${imported} imported · ${duplicates} duplicate${duplicates === 1 ? '' : 's'} (${policy}) · ${rejected} rejected`],
            ['Batch totals', totals],
            ['Batch range', dateRange],
            ['Undo state', activeRows > 0 ? `${activeRows} active record${activeRows === 1 ? '' : 's'}` : 'Undo applied'],
            ['Duplicates included', duplicateImported ? String(duplicateImported) : '']
        ];
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

    function ledgerEvidenceItems(entry) {
        const batch = ledgerImportBatch(entry);
        const reserveMovement = ledgerReserveMovementLabel(entry);
        return [
            ['Source', entry.source || 'local ledger'],
            ['Source file', entry.sourceFile || ''],
            ['Import batch', entry.importBatchId || ''],
            ...ledgerImportBatchSummary(batch),
            ['Fingerprint', entry.fingerprint || ''],
            ['Linked income', entry.linkedIncomeTitle || entry.linkedIncomeId || ''],
            ['Linked obligation', entry.linkedObligationTitle || entry.obligationTitle || entry.obligationId || ''],
            ['Linked debt', entry.linkedDebtTitle || entry.linkedDebtId || ''],
            ['Reserve movement', reserveMovement],
            ['Payment link', entry.obligationId ? 'Matched to obligation' : ''],
            ['Reversal', entry.reversalOf ? `Reversal of ${entry.reversalOf}` : (entry.reversedBy ? `Reversed by ${entry.reversedBy}` : '')],
            ['Record ID', ledgerTransactionId(entry)],
            ['Transaction entity', entry.transactionEntityId || '']
        ].filter((item) => String(item[1] || '').trim());
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
            <div class="fin-ledger-filter-chips" aria-label="Active ledger filters">
                ${labels.map((label) => `<span class="fin-status-pill">${escapeHtml(label)}</span>`).join('')}
                <button class="fin-mini-btn" type="button" data-fin-action="clear-ledger-filters">Clear all</button>
            </div>
        `;
    }

    function renderLedgerInspector(entry, view) {
        if (!entry) {
            return `
                <aside class="fin-transaction-inspector" aria-label="Transaction inspector">
                    <span class="fin-eyebrow">Transaction inspector</span>
                    <strong>Select a transaction</strong>
                    <p>Choose a row to inspect the record, source details, and available actions.</p>
                </aside>
            `;
        }
        const id = ledgerTransactionId(entry);
        const signed = ledgerSignedAmount(entry);
        const isExpense = String(entry && entry.type) === 'expense.recorded';
        const matched = Boolean(String(entry && entry.obligationId || '').trim());
        const evidence = ledgerEvidenceItems(entry);
        const matchSuggestions = ledgerPaymentMatchSuggestions(entry);
        const incomeSuggestions = ledgerIncomeMatchSuggestions(entry);
        const details = [
            ['Type', entry.ledgerType || entry.type || 'transaction'],
            ['Date', formatShortDate(entry.timestamp)],
            ['Account', entry.accountName || entry.fromAccountName || entry.toAccountName || 'Account'],
            ['Category', entry.categoryId || 'uncategorized'],
            ['Scope', entry.scope || 'shared'],
            ['Review state', entry.reviewStatus || 'clear']
        ];
        return `
            <aside class="fin-transaction-inspector" aria-label="Transaction inspector">
                <span class="fin-eyebrow">Transaction inspector</span>
                <div class="fin-inspector-heading">
                    <div>
                        <strong>${escapeHtml(entry.description || 'Transaction')}</strong>
                        <small>${escapeHtml(entry.notes || entry.note || '')}</small>
                    </div>
                    <span class="${signed >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${signed >= 0 ? '+' : '-'}${formatCurrency(Math.abs(signed), entry.currency)}</span>
                </div>
                <dl class="fin-inspector-grid">
                    ${details.map(([label, value]) => `
                        <div>
                            <dt>${escapeHtml(label)}</dt>
                            <dd>${escapeHtml(value)}</dd>
                        </div>
                    `).join('')}
                </dl>
                <div class="fin-inspector-evidence">
                    <span class="fin-eyebrow">Evidence</span>
                    ${evidence.map(([label, value]) => `
                        <div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>
                    `).join('')}
                </div>
                ${matchSuggestions.length ? `
                    <div class="fin-inspector-suggestions">
                        <span class="fin-eyebrow">Suggested match</span>
                        ${matchSuggestions.map((suggestion) => `
                            <div><strong>${escapeHtml(suggestion.title)}</strong><small>${escapeHtml(suggestion.reason)}</small></div>
                        `).join('')}
                    </div>
                ` : ''}
                ${incomeSuggestions.length ? `
                    <div class="fin-inspector-suggestions">
                        <span class="fin-eyebrow">Suggested income match</span>
                        ${incomeSuggestions.map((suggestion) => `
                            <div>
                                <strong>${escapeHtml(suggestion.title)}</strong>
                                <small>${escapeHtml(suggestion.reason)}</small>
                                ${financeIconButton({ action: 'openEditModal', args: `'pipelineReview', '${escapeActionArg(suggestion.id)}'`, label: 'Review expected income match', icon: 'success', tone: 'success' })}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                <div class="fin-inspector-actions">
                    ${financeIconButton({ action: 'openEditModal', args: `'transactionReview', '${escapeActionArg(id)}'`, label: 'Edit transaction review' })}
                    ${isExpense && !matched ? financeIconButton({ action: 'openEditModal', args: `'paymentMatch', '${escapeActionArg(id)}'`, label: 'Edit payment match', icon: 'success', tone: 'success' }) : ''}
                    <button class="fin-mini-btn" type="button" data-fin-action="reverse-ledger-transaction" data-fin-transaction-id="${escapeHtml(id)}">Reverse transaction</button>
                </div>
            </aside>
        `;
    }

    function completeMonthlyReviewInline() {
        const accountChecks = Array.from(document.querySelectorAll('.monthly-review-account-check'));
        const reviewChecks = Array.from(document.querySelectorAll('.monthly-review-check'));
        if (!accountChecks.length) {
            monthlyReviewError = 'Add a cash account before completing a monthly review.';
            render();
            return;
        }
        if (accountChecks.some((input) => !input.checked) || reviewChecks.some((input) => !input.checked)) {
            monthlyReviewError = 'Confirm each account and each review step before closing the month.';
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
            <div class="fin-monthly-review-panel fin-monthly-review-summary" aria-label="Month close summary">
                <div class="fin-eyebrow">Close summary</div>
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
            <div class="fin-monthly-review-panel" aria-label="Previous closes">
                <div class="fin-eyebrow">Previous closes</div>
                ${history.length ? history.map((entry) => {
                    const summary = entry.summary || {};
                    const runway = Number(summary.runwayNow);
                    const runwayLabel = Number.isFinite(runway) ? `${runway.toFixed(1)} months` : 'Unknown';
                    const forecastLabel = summary.forecastExpectedCash == null ? '' : ` · 30-day ${formatCurrency(summary.forecastExpectedCash)}`;
                    return `
                        <div class="fin-review-check-row is-ready">
                            <span>
                                <strong>${escapeHtml(entry.monthKey || 'Closed month')}</strong>
                                <small>Closed ${formatShortDate(entry.closedAt)}${escapeHtml(forecastLabel)} · ${escapeHtml(summary.mainRisk || 'No major close risk detected.')}</small>
                                <small>${escapeHtml(summary.mainAction || 'Keep next month reviewed on the same cadence.')}</small>
                            </span>
                            <span class="fin-status-pill">${summary.unresolvedItems || 0} open · ${escapeHtml(runwayLabel)}</span>
                            <strong class="${Number(summary.netMovement) >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${Number(summary.netMovement) >= 0 ? '+' : '-'}${formatCurrency(Math.abs(Number(summary.netMovement) || 0))}</strong>
                        </div>
                    `;
                }).join('') : renderCompactEmpty('Close this month to start the local review history.')}
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
            ['reviewSignals', 'Review signals', runwayReady, 'Read runway, low points, and missing inputs before closing.'],
            ['closeMonth', 'Close month', true, 'Save the review note and reset the operating loop.']
        ];
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-monthly-review-workspace">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">${reviewDue ? 'Month Close due' : 'Month Close closed'}</div>
                            <div class="fin-helper-text">Reconcile cash accounts, inspect the open queue, and leave one operating note.</div>
                            <div class="fin-operating-meta">Last reviewed ${formatShortDate(currentReview && currentReview.lastReviewedAt)}</div>
                        </div>
                        <button class="fin-mini-btn fin-mini-btn--primary" type="button" data-fin-action="complete-monthly-review-inline">Close month</button>
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
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'allocateReserves'">Protect money</button>
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
                        ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'debtPayment', '${escapeActionArg(debt.id)}'`, label: `Record payment for ${debt.name || 'debt item'}`, icon: 'success', tone: 'success' })}
                        ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'debtPlan', '${escapeActionArg(debt.id)}'`, label: `Edit payment plan for ${debt.name || 'debt item'}` })}
                        ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'debtAdd', '${escapeActionArg(debt.id)}'`, label: `Edit ${debt.name || 'debt item'}` })}
                    </div>
                </div>
            `;
        }).join('') : renderCompactEmpty('Debt-free operations.');
    }

    function renderReservesSection() {
        const fiatAccounts = safeArray(currentData?.fiatAccounts);
        const buckets = safeArray(currentData?.reserveBuckets);
        const debts = safeArray(currentData?.debtAccounts);
        const expenses = sortedTreasuryExpenses(currentData?.recurringExpenses);
        const essentialCosts = expenses.filter((expense) => expense && expense.essential);
        const flexibleCosts = expenses.filter((expense) => !expense || !expense.essential);
        const essentialTotal = essentialCosts.reduce((sum, expense) => sum + (Number(expense.monthlyAmount) || 0), 0);
        const flexibleTotal = flexibleCosts.reduce((sum, expense) => sum + (Number(expense.monthlyAmount) || 0), 0);
        const debtMonthlyPressure = debts.reduce((sum, debt) => sum + treasuryDebtMonthlyPayment(debt), 0);
        const actualCash = treasuryNumber('actualCash', treasuryNumber('totalCash', Number(currentSnapshot?.realBalance) || 0));
        const protectedCash = treasuryNumber('protectedCash', treasuryNumber('reservedCash', Number(currentSnapshot?.reservedCash) || 0));
        const availableCash = treasuryNumber('availableCash', Number.isFinite(Number(currentSnapshot?.availableCash)) ? Number(currentSnapshot.availableCash) : actualCash - protectedCash);
        const committedObligations = treasuryNumber('committedShortTermObligations', 0);
        const monthlyBurn = treasuryNumber('totalMonthlyBurn', Number(currentSnapshot?.monthlyBurn) || (essentialTotal + flexibleTotal + debtMonthlyPressure));
        const runway = Number(currentTreasury?.runwayMonths ?? currentSnapshot?.runwayMonths);
        const runwayLabel = Number.isFinite(runway) ? `${runway.toFixed(1)} months` : 'Unknown';
        const activeDebts = debts.filter((debt) => Math.max(0, Number(debt && debt.outstanding) || 0) > 0);
        const totalDebt = treasuryNumber('debtRemaining', explanationNumber('debtBurden', activeDebts.reduce((sum, debt) => sum + (Number(debt.outstanding) || 0), 0)));
        const missingPlans = activeDebts.filter((debt) => !treasuryDebtHasPlan(debt));
        const reserveTarget = buckets.reduce((sum, bucket) => sum + Math.max(0, Number(bucket.targetAmount) || 0), 0);
        const reserveGap = treasuryReserveGap(buckets);
        const flowResult = availableCash - essentialTotal - flexibleTotal - debtMonthlyPressure;
        const adjustedCut = Math.min(Math.max(0, treasuryBurnCut), Math.max(0, flexibleTotal));
        const adjustedBurn = Math.max(0, monthlyBurn - adjustedCut);
        const adjustedResult = flowResult + adjustedCut;
        const adjustedRunway = adjustedBurn > 0 ? availableCash / adjustedBurn : null;
        const maxFlowValue = Math.max(1, Math.abs(availableCash), essentialTotal, flexibleTotal, debtMonthlyPressure, protectedCash, Math.abs(flowResult));
        const goals = typeof window.Store.getGoalProgress === 'function'
            ? window.Store.getGoalProgress(window.Store.getUiSettings().scopeFilter || 'all')
            : [];
        let pulseStatus = { label: 'Stable', className: 'is-stable', copy: 'Treasury has breathing room.' };
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
            title: 'Keep Treasury reviewed',
            body: 'Your main numbers are in shape. Keep the monthly operating loop current.',
            primaryLabel: 'Open Month Close',
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
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-treasury-pulse ${pulseStatus.className}">
                    <div class="fin-treasury-pulse-main">
                        <span class="fin-eyebrow">Treasury Pulse</span>
                        <div class="fin-treasury-free-cash">
                            <span>Free cash right now</span>
                            <strong class="${availableCash < 0 ? 'fin-val-neg' : 'fin-val-pos'}">${formatCurrency(availableCash)}</strong>
                        </div>
                        <p>${escapeHtml(pulseStatus.copy)}</p>
                    </div>
                    <div class="fin-treasury-pulse-side">
                        <div class="fin-treasury-status-chip">${escapeHtml(pulseStatus.label)}</div>
                        <div class="fin-treasury-pulse-grid">
                            <div><span>Real cash</span><strong>${formatCurrency(actualCash)}</strong></div>
                            <div><span>Due in 30 days</span><strong>${formatCurrency(committedObligations)}</strong></div>
                            <div><span>Protected</span><strong>${formatCurrency(protectedCash)}</strong></div>
                            <div><span>Runway</span><strong>${escapeHtml(runwayLabel)}</strong></div>
                            <div><span>Active liabilities</span><strong>${activeDebts.length}</strong></div>
                            <div><span>Monthly burn</span><strong>${formatCurrency(monthlyBurn)}</strong></div>
                        </div>
                    </div>
                    <div class="fin-treasury-next-move">
                        <span class="fin-eyebrow">Next Best Move</span>
                        <strong>${escapeHtml(nextMove.title)}</strong>
                        <p>${escapeHtml(nextMove.body)}</p>
                        <div class="fin-action-row">${primaryButton}${secondaryButtons}</div>
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-treasury-flow-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Money Flow Map</div>
                            <div class="fin-helper-text">How free cash meets the pressure already visible in Treasury.</div>
                        </div>
                        <span class="fin-status-pill">${flowResult >= 0 ? 'Surplus' : 'Shortfall'}</span>
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
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'reserveBucket'">Add reserve bucket</button>
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
                            <div class="widget-title ui-title">Burn Control</div>
                            <div class="fin-helper-text">Monthly outflow by pressure type. Details stay tucked away until you need them.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Add recurring cost</button>
                    </div>
                    <div class="fin-treasury-burn-grid">
                        <div><span>Total monthly burn</span><strong>${formatCurrency(monthlyBurn)}</strong></div>
                        <div><span>Essential</span><strong>${formatCurrency(essentialTotal)}</strong><small>${pluralize(essentialCosts.length, 'item')}</small></div>
                        <div><span>Flexible</span><strong>${formatCurrency(flexibleTotal)}</strong><small>${pluralize(flexibleCosts.length, 'item')}</small></div>
                        <div><span>Debt minimums</span><strong>${formatCurrency(debtMonthlyPressure)}</strong><small>${pluralize(activeDebts.length, 'liability', 'liabilities')}</small></div>
                    </div>
                    <div class="fin-treasury-simulator" aria-label="Flexible cost reduction simulator">
                        <div>
                            <span class="fin-eyebrow">Flexible cost simulator</span>
                            <strong>${formatCurrency(adjustedBurn)} adjusted burn</strong>
                            <small>${adjustedCut > 0 ? `${formatCurrency(adjustedCut)} cut · ` : ''}${adjustedResult >= 0 ? 'Adjusted surplus' : 'Adjusted shortfall'} ${formatCurrency(Math.abs(adjustedResult))}${adjustedRunway != null ? ` · ${adjustedRunway.toFixed(1)} months preview` : ''}</small>
                        </div>
                        <div class="fin-treasury-simulator-actions">
                            ${[50, 100, 200].map((amount) => `<button class="fin-mini-btn ${treasuryBurnCut === amount ? 'active' : ''}" type="button" data-fin-action="set-treasury-burn-cut" data-fin-cut="${amount}">Cut ${formatCurrency(amount).replace(/([.,]00)$/, '')}</button>`).join('')}
                            <button class="fin-mini-btn" type="button" data-fin-action="set-treasury-burn-cut" data-fin-cut="0">Reset</button>
                        </div>
                    </div>
                    ${renderCollapsible('treasury-burn-essential', 'Essential Costs', `${formatCurrency(essentialTotal)} / month · ${pluralize(essentialCosts.length, 'item')}`, renderTreasuryCostRows(essentialCosts, 'Essential'))}
                    ${renderCollapsible('treasury-burn-flexible', 'Flexible Costs', `${formatCurrency(flexibleTotal)} / month · ${pluralize(flexibleCosts.length, 'item')}`, renderTreasuryCostRows(flexibleCosts, 'Flexible'))}
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-treasury-debt">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Debt Pressure</div>
                            <div class="fin-helper-text">Debt is a monthly pressure system, not just a balance.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtAdd'">Add debt item</button>
                    </div>
                    <div class="fin-treasury-pressure-line">
                        <div><span>Total debt</span><strong>${formatCurrency(totalDebt)}</strong></div>
                        <div><span>Monthly minimum pressure</span><strong>${formatCurrency(debtMonthlyPressure)}</strong></div>
                        <div><span>Liabilities</span><strong>${activeDebts.length}</strong></div>
                        <div><span>Plans missing</span><strong>${missingPlans.length}</strong></div>
                    </div>
                    <div class="fin-treasury-debt-grid">${renderTreasuryDebtCards(activeDebts, 3)}</div>
                    ${renderCollapsible('treasury-debt-details', 'Debt Details', `${formatCurrency(totalDebt)} open · ${formatCurrency(debtMonthlyPressure)} / month`, renderTreasuryDebtCards(activeDebts, 99))}
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-treasury-goals">
                    <div class="fin-goals-heading">
                        <div>
                            <div class="widget-title ui-title">Savings & Future Goals</div>
                            <div class="fin-helper-text">${availableCash < 0 ? 'Pause future goals until the current shortfall is covered.' : 'Future goals sit below immediate Treasury pressure.'}</div>
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
                    ` : renderCompactEmpty('Set one useful future goal after the current Treasury pressure is understood.')}
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-treasury-accounts">
                    ${renderCollapsible('treasury-accounts', 'Account Details', `${formatCurrency(actualCash)} across ${pluralize(fiatAccounts.length, 'cash account')}`, `
                        <div class="fin-section-heading-row">
                            <div>
                                <div class="widget-title ui-title">Account Details</div>
                                <div class="fin-helper-text">Manage real-world cash accounts without letting rows dominate Treasury.</div>
                            </div>
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'fiatAccount'">Add cash account</button>
                        </div>
                        ${fiatAccounts.length ? fiatAccounts.map((acc) => `
                            <div class="fin-treasury-compact-row">
                                <span>
                                    <strong>${escapeHtml(acc.name)}</strong>
                                    <small>${escapeHtml(acc.scope || 'shared')} · ${acc.reserved ? 'protected cash' : 'available cash'}${acc.bucket ? ` · ${escapeHtml(String(acc.bucket).replace(/_/g, ' '))}` : ''}</small>
                                </span>
                                <span>
                                    <strong>${formatCurrency(acc.balance)}</strong>
                                    ${financeIconButton({ action: 'openEditModal', args: `'fiatAccount', '${escapeActionArg(acc.id)}'`, label: `Edit ${acc.name || 'cash account'}` })}
                                </span>
                            </div>
                        `).join('') : renderCompactEmpty('Establish your treasury. Add your primary operating account.')}
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
                <!-- System Preferences -->
                <div class="widget ui-card glass fin-card fin-settings-card">
                    <div class="widget-title ui-title">System Preferences</div>
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
                            <label for="page-settings-appearance">Appearance</label>
                            <select id="page-settings-appearance">
                                <option value="bright"${uiSettings.appearance === 'bright' ? ' selected' : ''}>Bright (Default)</option>
                                <option value="aurora"${uiSettings.appearance === 'aurora' ? ' selected' : ''}>Aurora (Dark)</option>
                                <option value="midnight"${uiSettings.appearance === 'midnight' ? ' selected' : ''}>Midnight (OLED)</option>
                                <option value="twilight"${uiSettings.appearance === 'twilight' ? ' selected' : ''}>Twilight (Deep Blue)</option>
                                <option value="system"${uiSettings.appearance === 'system' ? ' selected' : ''}>Follow System</option>
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
                    <div class="widget-title ui-title">System boundaries</div>
                    <div class="fin-helper-text">
                        Finance Master stays local-first. Backup, restore, CSV import, sample data, reset controls, and app preferences live on this System board.
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

    function invoiceStatusFromDeal(deal) {
        const status = String(deal && (deal.status || deal.stage) || '').toLowerCase();
        const probability = Number(deal && deal.probability);
        const due = window.FinanceDates?.toDateOnly?.(deal && deal.expectedDateISO) || String(deal && deal.expectedDateISO || '').slice(0, 10);
        const today = window.FinanceDates?.todayDateOnly?.() || new Date().toISOString().slice(0, 10);
        const daysUntilDue = due ? Math.ceil(((Date.parse(`${due}T12:00:00.000Z`) || 0) - (Date.parse(`${today}T12:00:00.000Z`) || 0)) / 86400000) : null;
        if (status === 'paid' || status === 'received') return 'paid';
        if (status === 'cancelled' || status === 'lost') return status;
        if (due && due < today) return 'overdue';
        if (status === 'overdue') return 'overdue';
        if (status === 'due' || (Number.isFinite(daysUntilDue) && daysUntilDue <= 7)) return 'due';
        if (status === 'invoiced') return 'invoiced';
        if (status === 'confirmed' || probability >= 0.8) return 'confirmed';
        if (status === 'proposal' || status === 'lead') return status;
        if (status === 'risky' || probability < 0.5) return 'uncertain';
        return status === 'expected' ? 'expected' : 'likely';
    }

    function renderInvoicesSection() {
        const view = getInvoicesView();
        const active = getActivePipelineDeals()
            .map((deal) => ({
                id: String(deal && deal.id || ''),
                title: String(deal && deal.title || 'Expected income'),
                amount: Number(deal && deal.value) || 0,
                probability: Number(deal && deal.probability) || 0,
                expectedDateISO: deal && deal.expectedDateISO,
                settlementAccount: String(deal && deal.destinationAccountName || deal && deal.destinationAccountId || ''),
                incomeType: String(deal && deal.incomeType || 'one_off'),
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
                incomeType: 'one_off',
                status: 'paid'
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
            acc[row.status] = (acc[row.status] || 0) + row.amount;
            return acc;
        }, {});
        
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Income</div>
                            <div class="fin-helper-text">Expected and settled income records. Settlement turns expected money into real account cash.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'income'">Add expected income</button>
                    </div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card">${renderStatusPill('confirmed')}<strong>${formatCurrency((totals.confirmed || 0) + (totals.invoiced || 0) + (totals.due || 0))}</strong><span>Confirmed, invoiced, or due soon</span></div>
                        <div class="fin-status-card">${renderStatusPill('expected')}<strong>${formatCurrency((totals.expected || 0) + (totals.likely || 0))}</strong><span>Expected but not guaranteed</span></div>
                        <div class="fin-status-card">${renderStatusPill('proposal')}<strong>${formatCurrency((totals.proposal || 0) + (totals.lead || 0) + (totals.uncertain || 0))}</strong><span>Early or lower-confidence assumptions</span></div>
                        <div class="fin-status-card">${renderStatusPill('overdue')}<strong>${formatCurrency(totals.overdue || 0)}</strong><span>Follow-up candidates</span></div>
                    </div>
                    
                    <div class="fin-tabs" role="tablist" aria-label="Invoice view modes">
                        <button class="fin-tab-btn ${view === 'open' ? 'active' : ''}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="open">Open Income</button>
                        <button class="fin-tab-btn ${view === 'settled' ? 'active' : ''}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="settled">Settled</button>
                        <button class="fin-tab-btn ${view === 'all' ? 'active' : ''}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="all">All</button>
                    </div>

                    <div class="fin-table-wrap" style="margin-top: 1rem;">
                        ${displayRows.length ? `
                            <table class="fin-table fin-table--compact">
                                <thead><tr><th>Source</th><th>Status</th><th>Expected / paid</th><th>Confidence</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>
                                <tbody>
                                    ${displayRows.map((row) => `
                                        <tr>
                                            <td>${escapeHtml(row.title)}<small>${escapeHtml([row.incomeType === 'retainer' ? 'retainer' : row.incomeType === 'recurring' ? 'recurring' : '', row.settlementAccount].filter(Boolean).join(' · '))}</small></td>
                                            <td>${renderStatusPill(row.status)}</td>
                                            <td>${row.expectedDateISO ? formatShortDate(row.expectedDateISO) : 'No date'}</td>
                                            <td>${Math.round(row.probability * 100)}%</td>
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

    function renderReportsSection() {
        const rhythmData = buildCashflowRhythmData();
        const totalCash = treasuryNumber('actualCash', treasuryNumber('totalCash', Number(currentSnapshot && currentSnapshot.realBalance) || 0));
        const reservedCash = treasuryNumber('protectedCash', treasuryNumber('reservedCash', Number(currentSnapshot && currentSnapshot.reservedCash) || 0));
        const snapshotAvailableCash = Number(currentSnapshot && currentSnapshot.availableCash);
        const availableCash = treasuryNumber('availableCash', Number.isFinite(snapshotAvailableCash) ? snapshotAvailableCash : totalCash - reservedCash);
        const reserveShare = totalCash > 0 ? Math.round((reservedCash / totalCash) * 100) : 0;
        const health = resolveFinancialHeroSignal();
        
        // Client Concentration Pattern
        const incomeSources = {};
        let totalIncome = 0;
        safeArray(currentData?.invoices).concat(safeArray(currentData?.pipelineDeals)).forEach(item => {
            const client = String(item.client || item.title || 'Unknown').trim();
            const amount = Number(item.amount || item.value) || 0;
            if (amount > 0) {
                incomeSources[client] = (incomeSources[client] || 0) + amount;
                totalIncome += amount;
            }
        });
        const concentration = Object.entries(incomeSources)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([client, amount]) => {
                const pct = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0;
                return { client, amount, pct };
            });

        // Expense Patterns
        const expenseCategories = {};
        let totalExpense = 0;
        safeArray(currentData?.transactions).forEach(tx => {
            if (String(tx.type) === 'expense.recorded' || Number(tx.signedAmount || tx.amount) < 0) {
                const cat = String(tx.categoryId || 'Uncategorized').trim();
                const amt = Math.abs(Number(tx.signedAmount || tx.amount) || 0);
                if (amt > 0) {
                    expenseCategories[cat] = (expenseCategories[cat] || 0) + amt;
                    totalExpense += amt;
                }
            }
        });
        const topExpenses = Object.entries(expenseCategories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([cat, amount]) => {
                const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                return { cat, amount, pct };
            });

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
                            <div class="fin-status-card"><span>Available</span><strong>${formatCurrency(availableCash)}</strong><span>After protected cash and 30-day obligations</span></div>
                            <div class="fin-status-card"><span>Reserved</span><strong>${formatCurrency(reservedCash)}</strong><span>${reserveShare}% of total cash</span></div>
                        </div>
                        ${renderCashflowRhythm(rhythmData)}
                    </div>
                </div>
            </section>
            
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Client Concentration</div>
                        <div class="fin-helper-text">Reliance on top income sources. High concentration is a vulnerability.</div>
                        <div class="fin-table-wrap" style="margin-top: 1rem;">
                            ${concentration.length ? `
                                <table class="fin-table fin-table--compact">
                                    <tbody>
                                        ${concentration.map(c => `
                                            <tr>
                                                <td style="width: 40%;"><strong>${escapeHtml(c.client)}</strong></td>
                                                <td>
                                                    <div class="fin-stacked-bar" style="height: 6px; background: rgba(255,255,255,0.05);">
                                                        <div class="fin-bar-segment" style="width: ${c.pct}%; background: var(--interactive-primary);"></div>
                                                    </div>
                                                </td>
                                                <td style="text-align:right; width: 30%;">${formatCurrency(c.amount)} <small>(${c.pct}%)</small></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : renderCompactEmpty('No income data available yet.')}
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Top Expense Categories</div>
                        <div class="fin-helper-text">Where the money flows over time.</div>
                        <div class="fin-table-wrap" style="margin-top: 1rem;">
                            ${topExpenses.length ? `
                                <table class="fin-table fin-table--compact">
                                    <tbody>
                                        ${topExpenses.map(e => `
                                            <tr>
                                                <td style="width: 40%;"><strong>${escapeHtml(e.cat)}</strong></td>
                                                <td>
                                                    <div class="fin-stacked-bar" style="height: 6px; background: rgba(255,255,255,0.05);">
                                                        <div class="fin-bar-segment" style="width: ${e.pct}%; background: var(--negative, #ff4b4b);"></div>
                                                    </div>
                                                </td>
                                                <td style="text-align:right; width: 30%;">${formatCurrency(e.amount)} <small>(${e.pct}%)</small></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : renderCompactEmpty('No expense data available yet.')}
                        </div>
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
        if (String(item && item.id) === 'month-end-gap') return { label: 'Adjust reserves', action: 'FinancialMode.setSection', args: "'reserves'" };
        if (String(item && item.id) === 'monthly-review') return { label: 'Start close', action: 'FinancialMode.setSection', args: "'review'" };
        if (type === 'Overdue') return { label: 'Review income', action: 'FinancialMode.setSection', args: "'planning'" };
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
                title: 'Month Close',
                amount: null,
                action: 'Start close',
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
        const monthlyBurn = treasuryNumber('totalMonthlyBurn', Number(currentSnapshot?.monthlyBurn) || 0);
        const expectedMonthEnd = overviewExpectedMonthEnd();
        const forecastWarning = safeArray(currentForecast && currentForecast.warnings)[0] || '';
        const runway = overviewRunwayValue();
        const runwayLabel = runway == null ? '—' : `${Number(runway).toFixed(1)}`;
        const runwayStatus = overviewRunwayStatus(runway);
        const resultClass = expectedMonthEnd < 0 ? 'is-critical' : 'is-steady';
        const protectedPercent = overviewPercent(reservedCash, totalCash);
        const availablePercent = Math.max(0, 100 - protectedPercent);
        const burnCoverageDays = monthlyBurn > 0 ? Math.round((availableCash / monthlyBurn) * 30) : null;
        const burnPressurePercent = burnCoverageDays == null ? 0 : Math.max(8, Math.min(100, 100 - Math.min(100, (burnCoverageDays / 365) * 100)));
        const runwayCopy = runway == null
            ? 'Add recurring burn and cash accounts to calculate runway.'
            : `Available cash covers ${Number(runway).toFixed(1)} months at the current monthly burn.`;
        const burnDaysLabel = burnCoverageDays == null ? '—' : `${burnCoverageDays} days`;
        const resultLabel = currentHasFinanceData ? `${expectedMonthEnd >= 0 ? '+' : ''}${formatCurrency(expectedMonthEnd)}` : '—';

        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-money-picture" data-fin-command-summary>
                    <div class="fin-money-picture-head">
                        <div>
                            <div class="widget-title ui-title">Money Picture</div>
                            <div class="fin-helper-text">The money picture before any review work.</div>
                        </div>
                    </div>
                    <div class="fin-money-picture-grid">
                        <div class="fin-money-runway ${runwayStatus.className}">
                            <span>Runway</span>
                            <strong>${runwayLabel}<small> months</small></strong>
                            <div class="fin-runway-pill"><span></span>${escapeHtml(runwayStatus.label)}</div>
                            <p>${escapeHtml(runwayCopy)}</p>
                        </div>
                        <div class="fin-money-result ${resultClass}">
                            <span>30-Day Result</span>
                            <strong>${resultLabel}</strong>
                            <p>Projected month-end</p>
                            ${renderOverviewForecastLine(expectedMonthEnd)}
                            <small>Based on confirmed obligations and expected income.</small>
                        </div>
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="fin-money-secondary-grid">
                    <div class="widget ui-card glass fin-card fin-money-panel">
                        <div class="widget-title ui-title">Cash Structure</div>
                        <div class="fin-helper-text">How your cash is allocated.</div>
                        <div class="fin-money-panel-main">
                            <span>Total cash</span>
                            <strong>${currentHasFinanceData ? formatCurrency(totalCash) : '—'}</strong>
                        </div>
                        <div class="fin-money-bar" aria-label="Cash allocation">
                            <span class="fin-money-bar-available" style="width:${availablePercent}%"></span>
                            <span class="fin-money-bar-protected" style="width:${protectedPercent}%"></span>
                        </div>
                        <div class="fin-money-legend">
                            <div><span class="fin-dot fin-dot--safe"></span><span>Available</span><strong>${formatCurrency(availableCash)}</strong><small>${availablePercent.toFixed(1)}%</small></div>
                            <div><span class="fin-dot"></span><span>Protected</span><strong>${formatCurrency(reservedCash)}</strong><small>${protectedPercent.toFixed(1)}%</small></div>
                        </div>
                    </div>

                    <div class="widget ui-card glass fin-card fin-money-panel">
                        <div class="widget-title ui-title">Burn Pressure</div>
                        <div class="fin-helper-text">Your monthly cash outflow.</div>
                        <div class="fin-money-panel-main">
                            <span>Monthly burn</span>
                            <strong>${currentHasFinanceData ? formatCurrency(monthlyBurn) : '—'}<small> / month</small></strong>
                        </div>
                        <div class="fin-money-bar fin-money-bar--burn" aria-label="Burn pressure">
                            <span style="width:${burnPressurePercent}%"></span>
                        </div>
                        <div class="fin-burn-stats">
                            <div>${renderSAGGlyph('attention', { size: 'sm', tone: 'warning' })}<span>Cash out per month</span><strong>${formatCurrency(monthlyBurn)}</strong></div>
                            <div>${renderSAGGlyph('success', { size: 'sm', tone: 'warning' })}<span>Days of coverage</span><strong>${escapeHtml(burnDaysLabel)}</strong></div>
                            <div>${renderSAGGlyph('sprout', { size: 'sm', tone: 'warning' })}<span>Runway</span><strong>${runwayLabel}${runway != null ? ' months' : ''}</strong></div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-money-note">
                    <div class="fin-money-note-icon">${renderSAGGlyph('attention', { size: 'sm', tone: 'muted' })}</div>
                    <div>
                        <strong>This view is based on confirmed data and your current settings.</strong>
                        <span>${escapeHtml(forecastWarning || 'Review items in Cash Movement to keep your numbers accurate.')}</span>
                    </div>
                    <button class="fin-mini-btn fin-mini-btn--primary" type="button" data-action="FinancialMode.setSection" data-action-args="'ledger'">Open Cash Movement</button>
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
            body: 'The cockpit is steady. A short month close will keep it that way.',
            buttons: [{ label: 'Open Month Close', action: 'FinancialMode.setSection', args: "'review'" }]
        };

        if (expectedMonthEnd < 0) {
            decision = {
                title: `Projected month-end gap: ${formatCurrency(Math.abs(expectedMonthEnd))}`,
                body: 'Confirm expected income or adjust reserves before reviewing smaller obligations.',
                buttons: [
                    { label: 'Review income', action: 'FinancialMode.setSection', args: "'planning'" },
                    { label: 'Adjust reserves', action: 'FinancialMode.setSection', args: "'reserves'" },
                    { label: 'Open forecast', action: 'FinancialMode.setSection', args: "'planning'" }
                ]
            };
        } else if (overdue) {
            decision = {
                title: overdue.title,
                body: overdue.reason,
                buttons: [{ label: 'Open Month Close', action: 'FinancialMode.setSection', args: "'review'" }]
            };
        } else if (missingPlan) {
            decision = {
                title: missingPlan.title,
                body: 'Confirm the payment plan so monthly burn and runway stay accurate.',
                buttons: [missingPlan.button]
            };
        } else if (isWeeklyReviewDue()) {
            decision = {
                title: 'Month Close is ready',
                body: 'Close the operating loop before making smaller adjustments.',
                buttons: [{ label: 'Start close', action: 'FinancialMode.setSection', args: "'review'" }]
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
                            <div class="widget-title ui-title">Today’s Financial Decision</div>
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
            return `<button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'review'">Close month</button>`;
        }
        return renderReviewQueueActions(item);
    }

    function renderNextActions() {
        const rows = buildOverviewActionItems();
        const groups = ['Critical', 'Needs review', 'Housekeeping'];
        const grouped = groups.map((group) => ({
            group,
            rows: rows.filter((item) => item.group === group)
        })).filter((entry) => entry.rows.length);

        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-next-actions">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Next Actions</div>
                            <div class="fin-helper-text">Small steps to keep your treasury accurate.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'review'">Open full action list</button>
                    </div>
                    ${grouped.length ? grouped.map((group) => `
                        <div class="fin-action-group" data-fin-action-group="${escapeHtml(group.group)}">
                            <div class="fin-action-group-label">${escapeHtml(group.group)}</div>
                            <div class="fin-action-rows">
                                ${group.rows.map((item) => `
                                    <div class="fin-action-row-card" data-fin-action-row>
                                        <div class="fin-action-row-main">
                                            <strong>${escapeHtml(item.title)}</strong>
                                            <span>${escapeHtml(item.reason)}</span>
                                        </div>
                                        <div class="fin-action-row-meta">
                                            ${item.amount != null ? `<strong class="${Number(item.amount) < 0 ? 'fin-val-neg' : ''}">${formatCurrency(item.amount)}</strong>` : '<span class="fin-muted">Review</span>'}
                                            ${overviewButton(item.button.label, item.button.action, item.button.args)}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('') : renderCompactEmpty('No urgent action. Keep reviewing as you go.')}
                </div>
            </section>
        `;
    }

    function renderNext30Days() {
        const next30 = currentTreasury?.dashboardSummary?.next30Days || {};
        const expectedMonthEnd = overviewExpectedMonthEnd();
        const confidence = explanationNumber('forecastConfidence', Math.round((Number(currentSnapshot?.confidenceScore) || 0) * 100));
        
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">30-Day Outlook</div>
                            <div class="fin-helper-text">Incoming money, committed obligations, and projected month-end result.</div>
                        </div>
                    </div>
                    <div class="fin-outlook-grid">
                        <div class="fin-status-card">
                            <span>Incoming</span>
                            <strong class="fin-text-safe">${formatCurrency(next30.confirmedIncoming)}</strong>
                            <span>Confirmed in the next 30 days</span>
                        </div>
                        <div class="fin-status-card">
                            <span>Obligations</span>
                            <strong class="fin-text-med">${formatCurrency(next30.obligationsDue)}</strong>
                            <span>Due within 30 days</span>
                        </div>
                        <div class="fin-status-card">
                            <span>Projected month-end</span>
                            <strong class="${expectedMonthEnd < 0 ? 'fin-val-neg' : 'fin-text-safe'}">${formatCurrency(expectedMonthEnd)}</strong>
                            <span>${expectedMonthEnd < 0 ? 'Plan closes short' : 'Plan remains positive'}</span>
                        </div>
                        <div class="fin-status-card">
                            <span>Forecast Confidence</span>
                            <strong>${explanationValue((currentExplanations && currentExplanations.forecastConfidence) || { key: 'forecastConfidence' }, confidence)}</strong>
                            <span>Inputs and warning quality</span>
                            ${renderMetricExplanation('forecastConfidence')}
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    function renderStrategicPicture() {
        const actualCash = treasuryNumber('actualCash', treasuryNumber('totalCash', Number(currentSnapshot?.realBalance) || 0));
        const protectedCash = treasuryNumber('protectedCash', treasuryNumber('reservedCash', Number(currentSnapshot?.reservedCash) || 0));
        const monthlyBurn = treasuryNumber('totalMonthlyBurn', Number(currentSnapshot?.monthlyBurn) || 0);
        const debtBurden = explanationNumber('debtBurden', Number(currentSnapshot?.totalDebt) || 0);
        const confidence = explanationNumber('forecastConfidence', Math.round((Number(currentSnapshot?.confidenceScore) || 0) * 100));
        const protectedShare = actualCash > 0 ? Math.round((protectedCash / actualCash) * 100) : 0;
        const activeObligations = safeArray(currentData?.recurringExpenses).filter((entry) => entry && entry.active !== false);
        const obligationsNeedingReview = treasuryArray('overdueObligations').length + treasuryArray('dueSoonObligations').length;

        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Strategic Picture</div>
                            <div class="fin-helper-text">Burn, protected cash, debt pressure, and forecast confidence for slower decisions.</div>
                        </div>
                    </div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card">
                            <span>Monthly burn</span>
                            <strong>${formatCurrency(monthlyBurn)}</strong>
                            <span>Recurring obligations and payment plans</span>
                        </div>
                        <div class="fin-status-card">
                            <span>Debt burden</span>
                            <strong>${formatCurrency(debtBurden)}</strong>
                            <span>This payment plan affects runway when active</span>
                            ${renderMetricExplanation('debtBurden')}
                        </div>
                        <div class="fin-status-card">
                            <span>Protected cash</span>
                            <strong>${formatCurrency(protectedCash)}</strong>
                            <span>${protectedShare}% of actual cash</span>
                        </div>
                        <div class="fin-status-card">
                            <span>Forecast confidence</span>
                            <strong>${explanationValue((currentExplanations && currentExplanations.forecastConfidence) || { key: 'forecastConfidence' }, confidence)}</strong>
                            <span>Based on missing inputs and warnings</span>
                        </div>
                        <div class="fin-status-card">
                            <span>Obligations</span>
                            <strong>${pluralize(activeObligations.length, 'active group')}</strong>
                            <span>${obligationsNeedingReview} need review</span>
                            <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'reserves'">Open Treasury</button>
                        </div>
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
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'review'">Open Month Close</button>
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
                    `).join('') : renderCompactEmpty('Map out your obligations. Add fixed costs to see what is due next.')}
                    ${overdue.length + dueSoon.length + upcoming.length > obligations.length ? '<div class="fin-helper-text">Open Month Close to resolve the full obligation queue.</div>' : ''}
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
                            <div class="widget-title ui-title">Open Items</div>
                            <div class="fin-helper-text">${unresolvedCount} unresolved · Only items that need a classification, decision, or check.</div>
                        </div>
                        <button class="ui-btn ui-btn--secondary" type="button" data-action="FinancialMode.setSection" data-action-args="'ledger'">Open Cash Movement</button>
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
                            <div class="widget-title ui-title">Expected Obligations</div>
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
                            <div class="widget-title ui-title">Actual Payments</div>
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
        const horizons = [7, 30, 90, 180]
            .map((days) => forecast.byHorizon && forecast.byHorizon[String(days)])
            .filter(Boolean);
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="widget-title ui-title">Forecast Scenarios</div>
                    <div class="fin-helper-text">Conservative, expected, and optimistic cash paths using current obligations, payment plans, reserves, and expected income.</div>
                    <div class="fin-status-grid">
                        ${horizons.map((entry) => `
                            <div class="fin-status-card">
                                <span class="fin-muted">${entry.days} days</span>
                                <strong>${formatCurrency(entry.expected)}</strong>
                                <span>${formatCurrency(entry.conservative)} conservative · ${formatCurrency(entry.optimistic)} optimistic</span>
                                <small>${formatCurrency(entry.components.recurringObligations)} obligations · ${formatCurrency(entry.components.expectedIncome)} expected income</small>
                            </div>
                        `).join('')}
                    </div>
                    ${safeArray(forecast.warnings).length ? `<div class="fin-helper-text">${escapeHtml(forecast.warnings[0])}</div>` : ''}
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
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'review'">Open Month Close</button>
                    </div>
                </div>
                ${reviewDue ? `
                    <div class="widget ui-card glass fin-card fin-review-prompt">
                        <div>
                            <div class="widget-title ui-title">Month Close due</div>
                            <div class="fin-helper-text">Reconcile cash accounts, scan costs and pipeline, then leave one note for the week ahead.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.setSection" data-action-args="'review'">Start close</button>
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
                        `).join('') : renderCompactEmpty('Map out upcoming events to shape your cash calendar.')}
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
                                        <span class="fin-inline-icon-actions fin-inline-icon-actions--right">
                                            ${financeIconButton({ action: 'FinancialMode.openAddModal', args: `'income', '${escapeActionArg(deal.id)}'`, label: `Edit ${deal.title || 'pipeline item'}` })}
                                            ${financeIconButton({ action: 'markAsPaid', args: `'${escapeActionArg(deal.id)}'`, label: `Mark ${deal.title || 'pipeline item'} as received`, icon: 'success', tone: 'success' })}
                                            ${financeIconButton({ action: 'deleteInvoice', args: `'${escapeActionArg(deal.id)}'`, label: `Archive ${deal.title || 'pipeline item'}`, icon: 'warning', tone: 'muted' })}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
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
        return `
            <section class="fin-section">
                <div class="fin-lab-grid">
                    <div class="widget ui-card glass fin-card">
                        <div class="drag-handle">⋮⋮</div>
                        <div class="widget-title ui-title">Stress Test</div>
                        <div class="fin-helper-text">Advanced scenario controls for testing runway pressure.</div>
                        
                        <div class="fin-slider-group" style="margin-top: 1rem;">
                            <label class="settings-check">
                                <input type="checkbox" id="fin-lab-client" ${labState.loseClient ? 'checked' : ''} />
                                <span>Lose biggest client</span>
                            </label>
                            ${renderSlider('Delay payments by', 'delay', labState.delayPayments || 0, 0, 90, ' days')}
                            ${renderSlider('Tax rate hike', 'tax', labState.taxHike || 0, 0, 20, '%')}
                            <hr style="border-top: 1px solid var(--border-color); margin: 1rem 0; opacity: 0.5;">
                            ${renderSlider('Income Probability Floor', 'probFloor', labState.probFloor, 0, 100, '%')}
                            ${renderSlider('Monthly Burn Delta', 'burnDelta', labState.burnDelta, -30, 30, '%')}
                        </div>
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
                    appearance: appearanceEl.value || 'bright',
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
