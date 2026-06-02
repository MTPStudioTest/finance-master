export {};

declare global {
  type FinanceScope = 'personal' | 'business' | 'shared';
  type FinanceScopeFilter = 'all' | FinanceScope;

  interface Window {
    CoreDashboardHero?: {
      renderHero(options: Record<string, unknown>): string;
      bindDetailsPersistence(root: Element, domain: string): void;
    };
    FinanceCommandService?: Record<string, (...args: any[]) => any>;
    FinanceCompute?: {
      computeFinancialContext(events: FinanceEvent[], settings: FinanceSettings): FinanceContext;
    };
    FinanceEvents?: {
      createId(): string;
      sortFinancialEvents(events: FinanceEvent[]): FinanceEvent[];
    };
    FinanceLedger?: {
      appendEvents(events: FinanceEvent[], drafts: FinanceEventDraft[], settings: FinanceSettings, options?: Record<string, unknown>): {
        events: FinanceEvent[];
        appended: FinanceEvent[];
      };
      reverseEvent(events: FinanceEvent[], eventId: string, reason: string, settings: FinanceSettings, options?: Record<string, unknown>): {
        events: FinanceEvent[];
        appended: FinanceEvent[];
      };
      getActiveEvents(events: FinanceEvent[]): FinanceEvent[];
      isPipelineActive(stage: unknown): boolean;
    };
    FinancialEngine?: Record<string, (...args: any[]) => any>;
    FinancialMode?: {
      init(): void;
      render(): void;
      openAddModal(type: string, id?: string): void;
    };
    Store: FinanceStore;
    closeModal(): void;
    deleteInvoice(id: string): void;
    markAsPaid(id: string): void;
    openEditModal(type: string, options?: { id?: string }): void;
    renderSAGIcon?: (icon: string, options?: Record<string, string>) => string;
  }

  interface FinanceEventDraft {
    type: string;
    amount: number;
    currency: string;
    timestamp: string;
    related_entity_id?: string;
    metadata?: Record<string, unknown>;
  }

  interface FinanceEvent extends FinanceEventDraft {
    id: string;
    created_at: string;
  }

  interface FinanceSettings {
    baseCurrency: string;
    forecastDays: number;
    nowIso?: string;
  }

  interface FinanceContext {
    snapshot: Record<string, any>;
    readModel: Record<string, any>;
    invariants?: Record<string, any>;
    confidence?: Record<string, any>;
    diagnostics?: Record<string, any>;
  }

  interface FinanceUiSettings {
    appearance: 'aurora' | 'midnight' | 'bright';
    reducedMotion: boolean;
    scopeFilter: FinanceScopeFilter;
    walletPriceSource: 'manual' | 'coingecko';
    scenario: {
      marketMajors: number;
      burnDelta: number;
      probFloor: number;
    };
  }

  interface FinanceStore {
    initialize(): Promise<void>;
    appendFinanceEvent(draft: FinanceEventDraft, context?: Record<string, unknown>): FinanceEvent | null;
    appendFinanceEvents(drafts: FinanceEventDraft[], context?: Record<string, unknown>): FinanceEvent[];
    clearAndReseedDemo(): void;
    completeWeeklyReview(input?: {
      accounts?: Array<{ accountId: string; balance: number }>;
      recurringCosts?: boolean;
      pipeline?: boolean;
      signals?: boolean;
      notes?: string;
    }): import('./finance').FinanceReviewState;
    computeFinanceContext(force?: boolean, filter?: FinanceScopeFilter): FinanceContext;
    deleteSampleData(): void;
    deactivateDebtAccount(id: string, options?: Record<string, unknown>): FinanceEvent[];
    deactivateDefiPosition(id: string, options?: Record<string, unknown>): FinanceEvent[];
    deactivateFiatAccount(id: string, options?: Record<string, unknown>): FinanceEvent[];
    deactivateRecurringExpense(id: string, options?: Record<string, unknown>): FinanceEvent[];
    deactivateWeb3Position(id: string, options?: Record<string, unknown>): FinanceEvent[];
    deleteInvoice(id: string, options?: Record<string, unknown>): FinanceEvent[];
    getActiveFinanceEvents(): FinanceEvent[];
    getFinanceLedger(): FinanceEvent[];
    getFinanceSettings(): FinanceSettings;
    getFinancialReadModel(force?: boolean, filter?: FinanceScopeFilter): Record<string, any>;
    getFinancialSnapshot(force?: boolean, filter?: FinanceScopeFilter): Record<string, any>;
    getImportState(): import('./finance').FinanceImportState;
    getGoals(): import('./finance').FinanceGoalState;
    getGoalProgress(filter?: FinanceScopeFilter): import('./finance').FinanceGoalProgress[];
    getPriceCache(): import('./finance').FinancePriceCache;
    getReviewState(): import('./finance').FinanceReviewState;
    getUiSettings(): FinanceUiSettings;
    importCsvTransactions(rows: import('./finance').CsvTransactionRow[], options: { accountId: string; sourceFile?: string }): import('./finance').CsvImportSummary;
    markPipelineItemPaid(id: string, context?: Record<string, unknown>): FinanceEvent[];
    recordTransaction(input: {
      description: string;
      amount: number;
      timestamp: string;
      accountId: string;
      categoryId?: string;
      scope?: FinanceScope;
      source?: string;
      importBatchId?: string;
      fingerprint?: string;
      sourceFile?: string;
    }): FinanceEvent[];
    reverseFinanceEvent(id: string, reason?: string): FinanceEvent | null;
    saveGoal(input: {
      id?: string;
      name: string;
      type: import('./finance').FinanceGoal['type'];
      targetAmount: number;
      targetDate?: string;
      scope?: FinanceScope;
      linkedAccountIds?: string[];
    }): import('./finance').FinanceGoal;
    deleteGoal(id: string): import('./finance').FinanceGoalState;
    exportBackup(): import('./finance').FinanceBackupV2;
    refreshCryptoPrices(): Promise<{ updated: number; source: string }>;
    restoreBackup(input: unknown): import('./finance').FinanceBackupV2;
    saveFinanceSettings(settings: Partial<FinanceSettings>): FinanceSettings;
    saveUiSettings(settings: Partial<FinanceUiSettings>): FinanceUiSettings;
    seedDemoIfNeeded(force?: boolean): void;
    undoImportBatch(batchId: string): FinanceEvent[];
  }
}
