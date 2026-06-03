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
    let currentHasFinanceData = false;
    let labState = { marketMajors: 0, burnDelta: 0, probFloor: 50 };
    let adviceExpanded = false;

    const UI_KEYS = {
        focusMode: 'finance-master.layout.focus-mode',
        pipelineTab: 'finance-master.layout.pipeline-tab',
        ledgerView: 'finance-master.layout.ledger-view',
        ledgerFilters: 'finance-master.layout.ledger-filters',
        invoicesView: 'finance-master.layout.invoices-view',
        activeSection: 'finance-master.layout.active-section'
    };

    const SECTIONS = ['dashboard', 'ledger', 'invoices', 'planning', 'review', 'reports', 'data', 'settings', 'reserves', 'fixedCosts'];
    const SECTION_ALIASES = {
        today: 'dashboard',
        transactions: 'ledger',
        income: 'invoices',
        invoices: 'invoices',
        cashflow: 'planning',
        planning: 'planning',
        import: 'data',
        obligations: 'fixedCosts',
        fixedcosts: 'fixedCosts',
        fixedCosts: 'fixedCosts'
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

            if (action === 'apply-ledger-filters') {
                setLedgerFilters({
                    search: String(document.getElementById('fin-ledger-search')?.value || ''),
                    accountId: String(document.getElementById('fin-ledger-account')?.value || 'all'),
                    scope: String(document.getElementById('fin-ledger-scope')?.value || 'all'),
                    categoryId: String(document.getElementById('fin-ledger-category')?.value || ''),
                    type: String(document.getElementById('fin-ledger-type')?.value || 'all'),
                    reviewStatus: String(document.getElementById('fin-ledger-review')?.value || 'all'),
                    dateFrom: String(document.getElementById('fin-ledger-date-from')?.value || ''),
                    dateTo: String(document.getElementById('fin-ledger-date-to')?.value || '')
                });
                render();
                return;
            }

            if (action === 'clear-ledger-filters') {
                clearLedgerFilters();
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
            attentionQueue: renderAttentionQueue,
            next30Days: renderNext30Days,
            strategicPicture: renderStrategicPicture
        }, renderSectionHeading)(activeSection);
    }

    function renderLedgerSection() {
        const allTransactions = safeArray(currentData && currentData.transactions)
            .slice()
            .sort((a, b) => Date.parse(String(b && b.timestamp || '')) - Date.parse(String(a && a.timestamp || '')));
        const filters = getLedgerFilters();
        const search = String(filters.search || '').trim().toLowerCase();
        const transactions = allTransactions.filter((entry) => {
            const date = window.FinanceDates?.toDateOnly?.(entry && entry.timestamp) || String(entry && entry.timestamp || '').slice(0, 10);
            const accountMatch = filters.accountId === 'all'
                || String(entry && entry.accountId || '') === String(filters.accountId)
                || String(entry && entry.fromAccountId || '') === String(filters.accountId)
                || String(entry && entry.toAccountId || '') === String(filters.accountId);
            const scopeMatch = filters.scope === 'all' || String(entry && entry.scope || 'shared') === String(filters.scope);
            const typeMatch = filters.type === 'all' || String(entry && entry.ledgerType || '').toLowerCase() === String(filters.type).toLowerCase();
            const reviewMatch = filters.reviewStatus === 'all' || String(entry && entry.reviewStatus || 'clear') === String(filters.reviewStatus);
            const categoryMatch = !String(filters.categoryId || '').trim()
                || String(entry && entry.categoryId || '').toLowerCase().includes(String(filters.categoryId).trim().toLowerCase());
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
            return accountMatch && scopeMatch && typeMatch && reviewMatch && categoryMatch && dateMatch && searchMatch;
        });
        const view = getLedgerView();
        const uncategorized = allTransactions.filter((entry) => String(entry && entry.categoryId || '').toLowerCase() === 'uncategorized'
            || String(entry && entry.reviewStatus || '').toLowerCase() === 'needs_review');
        const unmatchedPayments = allTransactions.filter((entry) => String(entry && entry.type) === 'expense.recorded'
            && !String(entry && entry.obligationId || '').trim()
            && String(entry && entry.categoryId || '').toLowerCase() === 'obligation');
        const missingReceipts = allTransactions.filter((entry) => String(entry && entry.type) === 'expense.recorded'
            && !String(entry && entry.receiptUrl || '').trim()
            && String(entry && entry.categoryId || '').toLowerCase() !== 'transfer');
        const netMovement = transactions.reduce((sum, entry) => {
            const amount = Number(entry && entry.signedAmount);
            return sum + (Number.isFinite(amount) ? amount : Number(entry && entry.amount) || 0);
        }, 0);
        const ledgerActions = (entry) => {
            const id = escapeActionArg(entry && (entry.id || entry.transactionEntityId) || '');
            const isExpense = String(entry && entry.type) === 'expense.recorded';
            const matched = Boolean(String(entry && entry.obligationId || '').trim());
            return `
                <div class="fin-ledger-actions">
                    <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${id}'">Categorize</button>
                    ${isExpense && !matched ? `<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'paymentMatch', '${id}'">Match</button>` : ''}
                    <button class="fin-mini-btn" type="button" data-fin-action="reverse-ledger-transaction" data-fin-transaction-id="${id}">Reverse</button>
                </div>
            `;
        };
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
        const filtersHtml = `
            <div class="fin-ledger-toolbar" aria-label="Ledger filters">
                <div class="fin-ledger-filter-grid">
                    <input id="fin-ledger-search" aria-label="Search ledger" value="${escapeHtml(filters.search)}" placeholder="Search note, account, category, source" />
                    <select id="fin-ledger-account" aria-label="Filter ledger by account">${ledgerAccountOptions(filters.accountId)}</select>
                    <select id="fin-ledger-scope" aria-label="Filter ledger by scope">${scopeFilterOptions(filters.scope)}</select>
                    <input id="fin-ledger-category" aria-label="Filter ledger by category" value="${escapeHtml(filters.categoryId)}" placeholder="Category" />
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
                    <input id="fin-ledger-date-from" aria-label="Ledger date from" type="date" value="${escapeHtml(filters.dateFrom)}" />
                    <input id="fin-ledger-date-to" aria-label="Ledger date to" type="date" value="${escapeHtml(filters.dateTo)}" />
                </div>
                <div class="fin-action-row fin-action-row--inline">
                    <button class="fin-action-btn" type="button" data-fin-action="apply-ledger-filters">Apply filters</button>
                    <button class="fin-action-btn" type="button" data-fin-action="clear-ledger-filters">Clear filters</button>
                </div>
            </div>
        `;
        let panelHtml = '';
        if (view === 'audit') {
            panelHtml = transactions.length ? `
                <table class="fin-table fin-table--compact">
                    <thead><tr><th>Date</th><th>Type</th><th>ID / source</th><th>Account</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>
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
                                    <td style="text-align:right">${ledgerActions(entry)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            ` : renderCompactEmpty('Audit log is clean.');
        } else if (view === 'work') {
            panelHtml = `
                <div class="fin-status-grid">
                    <div class="fin-status-card"><span>Needs category</span><strong>${uncategorized.length}</strong><span>Transactions to classify</span></div>
                    <div class="fin-status-card"><span>Unmatched payments</span><strong>${unmatchedPayments.length}</strong><span>Obligation payments to connect</span></div>
                    <div class="fin-status-card"><span>Missing receipt check</span><strong>${missingReceipts.length}</strong><span>Expense records to review</span></div>
                    <div class="fin-status-card"><span>Filtered records</span><strong>${transactions.length}</strong><span>${allTransactions.length} total movements</span></div>
                </div>
                ${transactions.length ? `
                    <table class="fin-table fin-table--compact">
                        <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Review</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${transactions.map((entry) => {
                                const amount = Number(entry && entry.signedAmount);
                                const signed = Number.isFinite(amount) ? amount : Number(entry && entry.amount) || 0;
                                return `
                                <tr>
                                    <td>${formatShortDate(entry.timestamp)}</td>
                                    <td>${escapeHtml(entry.description || 'Transaction')}</td>
                                    <td>${escapeHtml(entry.categoryId || 'uncategorized')}</td>
                                    <td>${escapeHtml(entry.reviewStatus || 'clear')}</td>
                                    <td style="text-align:right" class="${signed >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${signed >= 0 ? '+' : '-'}${formatCurrency(Math.abs(signed), entry.currency)}</td>
                                    <td style="text-align:right">${ledgerActions(entry)}</td>
                                </tr>
                            `; }).join('')}
                        </tbody>
                    </table>
                ` : renderCompactEmpty('Begin tracking. Add your first payment.')}
            `;
        } else {
            panelHtml = transactions.length ? cleanRows : renderCompactEmpty('Begin tracking. Add your first payment or sync a CSV.');
        }
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Transactions</div>
                            <div class="fin-helper-text">A full page ledger workspace: scan daily movement, classify work items, and inspect raw local evidence without opening a mega-modal.</div>
                        </div>
                        <div class="fin-action-row">
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transaction', 'expense'">Add transaction</button>
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'csvImport'">Import CSV</button>
                            <button class="fin-mini-btn" type="button" data-action="exportTransactionsCsv">Export CSV</button>
                        </div>
                    </div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card"><span>Total records</span><strong>${allTransactions.length}</strong><span>Active local ledger entries</span></div>
                        <div class="fin-status-card"><span>Filtered movement</span><strong class="${netMovement >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${netMovement >= 0 ? '+' : '-'}${formatCurrency(Math.abs(netMovement))}</strong><span>Current filter result</span></div>
                        <div class="fin-status-card"><span>Needs review</span><strong>${uncategorized.length}</strong><span>Category or review work</span></div>
                        <div class="fin-status-card"><span>Matched payments</span><strong>${allTransactions.filter((entry) => String(entry && entry.obligationId || '').trim()).length}</strong><span>Linked to obligations</span></div>
                    </div>
                    ${filtersHtml}
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
                        <div class="widget-title ui-title">${reviewDue ? 'Monthly review due' : 'Monthly review current'}</div>
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
                        ${latestImport ? `
                            <div class="modal-list-row">
                                <span><strong>Latest CSV batch</strong><br><small>${escapeHtml(latestImport.sourceFile)} · ${latestImport.fingerprints.length} rows · ${formatShortDate(latestImport.importedAt)}</small></span>
                                <button class="fin-mini-btn" type="button" data-action="undoImportBatch" data-action-args="'${escapeActionArg(latestImport.id)}'">Undo</button>
                            </div>
                        ` : renderCompactEmpty('No local imports found. Bring in your bank statements (CSV).')}
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

    function renderReservesSection() {
        const fiatAccounts = safeArray(currentData?.fiatAccounts).filter(acc => !acc.bucket || acc.bucket === 'available');
        const buckets = safeArray(currentData?.reserveBuckets);
        const actualCash = treasuryNumber('actualCash', treasuryNumber('totalCash', Number(currentSnapshot?.realBalance) || 0));
        const protectedCash = treasuryNumber('protectedCash', treasuryNumber('reservedCash', Number(currentSnapshot?.reservedCash) || 0));
        const availableCash = treasuryNumber('availableCash', Number.isFinite(Number(currentSnapshot?.availableCash)) ? Number(currentSnapshot.availableCash) : actualCash - protectedCash);
        const cashAfterReserves = treasuryNumber('trulyAvailableCash', actualCash - protectedCash);
        const committedObligations = treasuryNumber('committedShortTermObligations', 0);
        
        return `
            <section class="fin-section">
                <div class="fin-section-heading-row">
                    <div>
                        <div class="widget-title ui-title">Operating Cash</div>
                        <div class="fin-helper-text">Liquid funds spread across your real-world accounts.</div>
                    </div>
                    <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'fiatAccount'">Add cash account</button>
                </div>
                ${fiatAccounts.length ? fiatAccounts.map(acc => `
                    <div class="widget ui-card glass fin-card fin-list-item">
                        <div class="fin-list-item-main">
                            <strong>${escapeHtml(acc.name)}</strong>
                            <div class="fin-list-item-sub">${escapeHtml(acc.scope || 'shared')}</div>
                        </div>
                        <div class="fin-list-item-actions">
                            <div class="fin-list-item-val">${formatCurrency(acc.balance)}</div>
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'fiatAccount', '${escapeHtml(acc.id)}'">Edit</button>
                        </div>
                    </div>
                `).join('') : renderCompactEmpty('Establish your treasury. Add your primary operating account.')}
                
                <div class="widget ui-card glass fin-card" style="margin-top: 1rem; padding: 1.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-size: 0.8rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-secondary);">Available Cash</div>
                            <div style="font-size: 2rem; font-family:var(--font-mono); font-weight:600; margin-top:0.25rem;">${formatCurrency(availableCash)}</div>
                            <div class="fin-helper-text" style="margin-top:0.35rem;">${formatCurrency(cashAfterReserves)} after reserves · ${formatCurrency(committedObligations)} due within 30 days</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'allocateReserves'">Allocate cash</button>
                    </div>
                </div>

                <div class="fin-section-heading-row" style="margin-top: 2rem;">
                    <div>
                        <div class="widget-title ui-title">Reserve Buckets</div>
                        <div class="fin-helper-text">Money assigned a job: taxes, VAT, health insurance, and buffer.</div>
                    </div>
                    <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'reserveBucket'">Add reserve bucket</button>
                </div>
                ${buckets.length ? buckets.map(bucket => {
                    const pct = bucket.targetAmount > 0 ? Math.min(100, Math.round((bucket.currentAmount / bucket.targetAmount) * 100)) : 100;
                    return `
                    <div class="widget ui-card glass fin-card fin-list-item" style="flex-direction:column; align-items:stretch; gap:1rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div class="fin-list-item-main">
                                <strong>${escapeHtml(bucket.name)}</strong>
                                <div class="fin-list-item-sub">${escapeHtml(bucket.purpose || 'Reserve').replace('_', ' ')}</div>
                            </div>
                            <div class="fin-list-item-actions">
                                <div class="fin-list-item-val">${formatCurrency(bucket.currentAmount)} <span style="font-size:0.8rem; color:var(--text-secondary); font-weight:normal;">of ${formatCurrency(bucket.targetAmount)}</span></div>
                                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'reserveBucket', '${escapeHtml(bucket.id)}'">Edit</button>
                            </div>
                        </div>
                        <div class="fin-stacked-bar" style="height: 8px;">
                            <div class="fin-bar-segment fin-bar-protected" style="width: ${pct}%; background:var(--interactive-primary);"></div>
                        </div>
                    </div>
                `;
                }).join('') : renderCompactEmpty('Protect your runway. Create your first reserve bucket (e.g., Taxes).')}
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
                            <div style="display:flex; gap:0.25rem;">
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${escapeActionArg(expense.id)}', '-1'" ${i === 0 ? 'disabled style="opacity:0.3"' : ''}>▲</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${escapeActionArg(expense.id)}', '1'" ${i === essentialCosts.length - 1 ? 'disabled style="opacity:0.3"' : ''}>▼</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense', '${escapeActionArg(expense.id)}'">Edit</button>
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
                            <div style="display:flex; gap:0.25rem;">
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${escapeActionArg(expense.id)}', '-1'" ${i === 0 ? 'disabled style="opacity:0.3"' : ''}>▲</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${escapeActionArg(expense.id)}', '1'" ${i === flexCosts.length - 1 ? 'disabled style="opacity:0.3"' : ''}>▼</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense', '${escapeActionArg(expense.id)}'">Edit</button>
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
                                <div style="display:flex; gap:0.25rem; justify-content: flex-end;">
                                    <button class="fin-mini-btn" style="padding: 0 4px; height: 20px; min-width: 20px;" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtPayment', '${escapeActionArg(debt.id)}'" title="Record payment">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    </button>
                                    <button class="fin-mini-btn" style="padding: 0 4px; height: 20px; min-width: 20px;" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtPlan', '${escapeActionArg(debt.id)}'" title="Update plan">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    </button>
                                    <button class="fin-mini-btn" style="padding: 0 4px; height: 20px; min-width: 20px;" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtAdd', '${escapeActionArg(debt.id)}'" title="Edit account">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                    </button>
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
                        Finance Master stays local-first. Backup, restore, CSV import, sample data, and reset controls live in Import & Backup.
                    </div>
                    <div class="fin-settings-actions">
                        <button class="ui-btn ui-btn--secondary" type="button" data-action="FinancialMode.setSection" data-action-args="'data'">Open Import & Backup</button>
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
        if (status === 'paid' || status === 'received') return 'paid';
        if (due && due < today) return 'overdue';
        if (status === 'confirmed' || probability >= 0.8) return 'confirmed';
        if (status === 'risky' || probability < 0.5) return 'uncertain';
        return 'likely';
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
                        <div class="fin-status-card">${renderStatusPill('confirmed')}<strong>${formatCurrency(totals.confirmed || 0)}</strong><span>Signed or high-confidence income</span></div>
                        <div class="fin-status-card">${renderStatusPill('likely')}<strong>${formatCurrency(totals.likely || 0)}</strong><span>Expected but not guaranteed</span></div>
                        <div class="fin-status-card">${renderStatusPill('uncertain')}<strong>${formatCurrency(totals.uncertain || 0)}</strong><span>Lower-confidence assumptions</span></div>
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

    function renderDashboardCockpit() {
        const totalCash = treasuryNumber('actualCash', treasuryNumber('totalCash', Number(currentSnapshot?.realBalance) || 0));
        const reservedCash = treasuryNumber('protectedCash', treasuryNumber('reservedCash', Number(currentSnapshot?.reservedCash) || 0));
        const snapshotAvailableCash = Number(currentSnapshot?.availableCash);
        const availableCash = treasuryNumber('availableCash', Number.isFinite(snapshotAvailableCash) ? snapshotAvailableCash : treasuryNumber('trulyAvailableCash', totalCash - reservedCash));
        const monthlyBurn = treasuryNumber('totalMonthlyBurn', Number(currentSnapshot?.monthlyBurn) || 0);
        const scenarios = currentTreasury?.incomeScenarios || {};
        const expectedMonthEnd = Number.isFinite(Number(scenarios.expected))
            ? Number(scenarios.expected)
            : Number(currentSnapshot?.projectedBalance) || availableCash;

        const runway = currentTreasury?.runwayMonths != null ? currentTreasury.runwayMonths : currentSnapshot?.runwayMonths;
        const runwayLabel = runway == null ? '—' : `${Number(runway).toFixed(1)}`;
        const runwayClass = runway == null || Number(runway) < 3 ? 'stress-high' : (Number(runway) < 6 ? 'stress-medium' : 'stress-low');
        const runwayStatus = runway == null ? 'No data' : (Number(runway) < 3 ? 'Vulnerable' : (Number(runway) < 6 ? 'Stable' : 'Safe to operate'));

        const buckets = treasuryArray('reserveBuckets')
            .filter((bucket) => ['tax_reserve', 'vat_reserve', 'health_insurance', 'debt_repayment', 'buffer'].includes(String(bucket.bucket)))
            .filter((bucket) => Number(bucket.amount) > 0);

        const next30 = currentTreasury?.dashboardSummary?.next30Days || {};
        const incoming = Number(next30.confirmedIncoming) || 0;
        const obligations = Number(next30.obligationsDue) || 0;
        const netFlow = incoming - obligations - monthlyBurn;

        // Cash breakdown bar percentages
        const cashTotal = totalCash || 1; // avoid division by zero
        const availPct = Math.max(0, Math.min(100, Math.round((Math.max(0, availableCash) / cashTotal) * 100)));
        const protectedPct = Math.max(0, Math.min(100 - availPct, Math.round((reservedCash / cashTotal) * 100)));

        // Month-end copy
        let monthEndCopy = '';
        if (expectedMonthEnd < 0) {
            monthEndCopy = `Projected to close ${formatCurrency(expectedMonthEnd)}. Action needed.`;
        } else {
            monthEndCopy = `On track to close with ${formatCurrency(expectedMonthEnd)} surplus.`;
        }

        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-cockpit-overview">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Current Status</div>
                            <div class="fin-helper-text">Available cash, protected money, runway, and monthly burn from the central calculation engine.</div>
                        </div>
                    </div>

                    <!-- Hero: Runway + Burn -->
                    <div class="fin-cockpit-hero">
                        <div class="fin-runway-gauge">
                            <div class="fin-runway-label">Runway</div>
                            <div class="fin-runway-value ${runwayClass}">${runwayLabel}<span style="font-size: 1.2rem; opacity: 0.6; margin-left: 0.25rem;">${runway != null ? 'months' : ''}</span></div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${runwayStatus}</div>
                            ${renderMetricExplanation('runway')}
                        </div>
                        <div class="fin-cockpit-burn">
                            <div class="fin-burn-label">Monthly burn</div>
                            <div class="fin-burn-value">${currentHasFinanceData ? formatCurrency(monthlyBurn) : '—'}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.15rem;">Recurring costs</div>
                            ${renderMetricExplanation('monthlyBurnRate')}
                        </div>
                    </div>

                    <hr class="fin-divider">

                    <!-- Cash Breakdown -->
                    <div class="fin-cockpit-cash">
                        <div class="fin-cash-header"><span>Total Cash</span><strong>${currentHasFinanceData ? formatCurrency(totalCash) : '—'}</strong></div>
                        <div class="fin-stacked-bar">
                            <div class="fin-bar-segment fin-bar-available" style="width: ${availPct}%; transition: width 0.6s ease;"></div>
                            <div class="fin-bar-segment fin-bar-protected" style="width: ${protectedPct}%; transition: width 0.6s ease;"></div>
                        </div>
                        <div class="fin-cash-legend">
                            <div class="fin-legend-item">
                                <span class="fin-dot fin-dot-available"></span>
                                <span class="fin-legend-val">${formatCurrency(availableCash)}</span>
                                <span class="fin-legend-lbl">Available</span>
                                ${renderMetricExplanation('availableCash')}
                            </div>
                            <div class="fin-legend-item">
                                <span class="fin-dot fin-dot-protected"></span>
                                <span class="fin-legend-val">${formatCurrency(reservedCash)}</span>
                                <span class="fin-legend-lbl">Protected</span>
                                ${renderMetricExplanation('protectedCash')}
                            </div>
                        </div>
                        ${buckets.length ? `
                            <div class="fin-reserve-mini-grid">
                                ${buckets.map((bucket) => `
                                    <div style="display:flex; justify-content:space-between; gap: 0.5rem;">
                                        <span>${escapeHtml(bucket.label)}</span>
                                        <strong style="font-family: var(--font-mono);">${formatCurrency(bucket.amount)}</strong>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <hr class="fin-divider">

                    <!-- Cashflow Outlook -->
                    <div class="fin-cockpit-cashflow">
                        <div class="fin-cashflow-header">30-Day Outlook</div>
                        <div class="fin-cashflow-grid">
                            <div>
                                <span>Incoming</span>
                                <strong style="color: rgba(168, 230, 207, 0.95);">${formatCurrency(incoming)}</strong>
                            </div>
                            <div>
                                <span>Obligations</span>
                                <strong style="color: rgba(241, 185, 167, 0.95);">${formatCurrency(obligations)}</strong>
                            </div>
                            <div>
                                <span>Month-end</span>
                                <strong class="${expectedMonthEnd < 0 ? 'fin-val-neg' : ''}">${currentHasFinanceData ? formatCurrency(expectedMonthEnd) : '—'}</strong>
                            </div>
                        </div>
                        <div class="fin-cashflow-copy">${monthEndCopy}</div>
                    </div>
                </div>
            </section>
        `;
    }


    function renderAttentionQueue() {
        const items = safeArray(currentSnapshot?.attentionQueue);
        const reviewDue = isWeeklyReviewDue();
        
        const scenarios = currentTreasury?.incomeScenarios || {};
        const expectedMonthEnd = Number.isFinite(Number(scenarios.expected)) ? Number(scenarios.expected) : (Number(currentSnapshot?.projectedBalance) || 0);
        
        const rows = [
            ...(reviewDue ? [{
                type: 'Monthly review',
                title: 'Review not started',
                action: 'Close month',
                id: 'monthly-review',
            }] : []),
            ...(expectedMonthEnd < 0 ? [{
                type: 'Due soon',
                title: `Month-end gap: ${formatCurrency(Math.abs(expectedMonthEnd))}`,
                action: 'Adjust reserves',
                id: 'month-end-gap',
            }] : []),
            ...items
        ].slice(0, 10);
        
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Attention Queue</div>
                            <div class="fin-helper-text">Unresolved items, overdue payments, and missing plans.</div>
                        </div>
                    </div>
                    ${rows.length ? `<ul class="fin-decision-list" style="gap:0.75rem;">` + rows.map((item) => `
                        <li>
                            <div class="fin-decision-header">
                                <div>
                                    <strong>${escapeHtml(item.title)} ${item.amount != null ? formatCurrency(item.amount) : ''}</strong>
                                    <div class="fin-decision-reason" style="text-transform:uppercase; font-size:0.7rem; font-family:var(--font-mono);">${escapeHtml(item.type)}</div>
                                </div>
                            </div>
                            <div class="fin-decision-actions">
                                <button class="fin-mini-btn" type="button" data-action="${item.id === 'monthly-review' ? 'openEditModal' : 'FinancialMode.setSection'}" data-action-args="${item.id === 'monthly-review' ? "'weeklyReview'" : "'review'"}">${escapeHtml(item.action || 'Resolve item')}</button>
                            </div>
                        </li>
                    `).join('') + `</ul>` : renderCompactEmpty('Attention queue is clear. Smooth sailing.')}
                </div>
            </section>
        `;
    }

    function renderDashboardAction(item) {
        if (String(item && item.kind) === 'weekly_review') {
            return `<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">Close monthly review</button>`;
        }
        return renderReviewQueueActions(item);
    }

    function renderNext30Days() {
        const next30 = currentTreasury?.dashboardSummary?.next30Days || {};
        const pipelineDeals = getActivePipelineDeals();
        const confirmed = pipelineDeals.filter(d => (d.probability || 0) >= 0.8).reduce((acc, d) => acc + (Number(d.value) || 0), 0);
        const likely = pipelineDeals.filter(d => (d.probability || 0) >= 0.5 && (d.probability || 0) < 0.8).reduce((acc, d) => acc + (Number(d.value) || 0), 0);
        const unconfirmed = pipelineDeals.filter(d => (d.probability || 0) < 0.5).reduce((acc, d) => acc + (Number(d.value) || 0), 0);
        
        return `
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Near Future</div>
                            <div class="fin-helper-text">Expected income and confirmed obligations in the next 30 days.</div>
                        </div>
                    </div>
                    <div class="fin-confidence-list">
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Forecast Confidence</span>
                            <strong>${explanationValue((currentExplanations && currentExplanations.forecastConfidence) || { key: 'forecastConfidence' }, explanationNumber('forecastConfidence', Math.round((Number(currentSnapshot?.confidenceScore) || 0) * 100)))}</strong>
                        </div>
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Expected weighted</span>
                            <strong class="fin-text-primary">${formatCurrency(next30.expectedWeightedIncoming)}</strong>
                        </div>
                        <div class="fin-divider-line"></div>
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Confirmed</span>
                            <strong class="fin-text-safe">${formatCurrency(confirmed)}</strong>
                        </div>
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Likely</span>
                            <strong class="fin-text-med">${formatCurrency(likely)}</strong>
                        </div>
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Unconfirmed</span>
                            <strong class="fin-text-high">${formatCurrency(unconfirmed)}</strong>
                        </div>
                    </div>
                    ${renderMetricExplanation('forecastConfidence')}
                    <div class="fin-action-row">
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'income'">Confirm income</button>
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
                    `).join('') : renderCompactEmpty('Map out your obligations. Add fixed costs to see what is due next.')}
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
                    `).join('') : renderCompactEmpty('All items reviewed and reconciled.')}
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
            }).join('') : renderCompactEmpty('Awaiting payments. Book transactions to match them against expectations.')}
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
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">Open weekly review</button>
                    </div>
                </div>
                ${reviewDue ? `
                    <div class="widget ui-card glass fin-card fin-review-prompt">
                        <div>
                            <div class="widget-title ui-title">Monthly review due</div>
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
                                        <button class="fin-mini-btn" data-action="deleteInvoice" data-action-args="'${escapeActionArg(item.id)}'" title="Remove from history">×</button>
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
                                        <button class="fin-mini-btn" data-action="FinancialMode.openAddModal" data-action-args="'income', '${escapeActionArg(deal.id)}'" title="Edit">${renderSAGGlyph('edit', { size: 'xs', tone: 'muted' })}</button>
                                        <button class="fin-mini-btn" data-action="markAsPaid" data-action-args="'${escapeActionArg(deal.id)}'" title="Mark as paid">${renderSAGGlyph('success', { size: 'xs', tone: 'success' })}</button>
                                        <button class="fin-mini-btn" data-action="deleteInvoice" data-action-args="'${escapeActionArg(deal.id)}'" title="Archive">×</button>
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
        const adviceItems = buildStrategicAdviceItems();
        const visibleAdvice = adviceExpanded ? adviceItems : adviceItems.slice(0, 2);
        const showToggle = adviceItems.length > 2;

        return `
            <section class="fin-section">
                <div class="fin-lab-grid">
                    <div class="widget ui-card glass fin-card">
                        <div class="drag-handle">⋮⋮</div>
                        <div class="widget-title ui-title">Simulator Lab</div>
                        <div class="fin-helper-text">Stress-test your runway with freelancer-specific scenarios.</div>
                        
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
