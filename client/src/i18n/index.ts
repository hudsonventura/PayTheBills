export type Language = 'pt' | 'en';

export const translations = {
  pt: {
    appTitle: 'PayTheBills',
    appSubtitle: 'Checklist e acompanhamento de pagamento de contas',
    switchLanguage: 'English',
    login: 'Entrar',
    register: 'Criar Conta',
    loginTitle: 'Acesse sua conta',
    registerTitle: 'Crie seu cadastro',
    name: 'Nome Completo',
    email: 'E-mail',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    passwordsMismatch: 'As senhas informadas não conferem.',
    dontHaveAccount: 'Ainda não possui conta?',
    alreadyHaveAccount: 'Já possui uma conta?',
    createAccountPrompt: 'Cadastre-se aqui',
    loginPrompt: 'Faça login aqui',
    logout: 'Sair',
    welcomeUser: 'Olá, {name}',

    // Navigation
    navExecutions: 'Execuções',
    navBills: 'Contas',
    navComparison: 'Comparativo',

    // Monthly Comparison View
    comparisonTitle: 'Comparativo Mensal de Gastos',
    comparisonSubtitle: 'Comparação de gastos entre os meses anteriores e o mês atual',
    filterByBill: 'Filtrar por Conta:',
    selectAllBills: 'Marcar Todas',
    deselectAllBills: 'Desmarcar Todas',
    billsSelectedCount: '{selected} de {total} contas selecionadas',
    periodLabel: 'Período:',
    last6Months: 'Últimos 6 meses',
    last12Months: 'Últimos 12 meses',
    totalSpentPeriod: 'Total Pago no Período',
    monthlyAverage: 'Média Mensal',
    currentMonth: 'Mês Atual ({month})',
    previousMonth: 'Mês Anterior',
    diffVsPreviousMonth: 'Variação vs Mês Anterior',
    peakMonth: 'Maior Gasto',
    showPaid: 'Valores Pagos',
    showExpected: 'Valores Previstos',
    paidAmountLabel: 'Valor Pago',
    expectedAmountLabel: 'Valor Previsto',
    currentMonthBadge: 'Mês Atual',
    breakdownTableTitle: 'Detalhamento Mensal',
    tableMonth: 'Mês',
    tablePaid: 'Total Pago',
    tableExpected: 'Total Previsto',
    tableVariation: 'Variação',
    noBillsToCompare: 'Nenhuma conta encontrada para o comparativo.',
    noSelectedBillsWarning: 'Selecione pelo menos uma conta para visualizar o gráfico.',

    // Executions View
    executionsTitle: 'Execuções de Pagamento',
    executionsSubtitle: 'Acompanhamento e baixa das ocorrências de contas',

    // Bills Management (CRUD)
    billsManagementTitle: 'Cadastro de Contas',
    billsManagementSubtitle: 'Gerenciamento de contas e regras de recorrência',
    billsTableTitle: 'Título',
    billsTableExpectedAmount: 'Valor Esperado',
    billsTableFrequency: 'Frequência',
    billsTableRule: 'Regra de Vencimento',
    billsTableStartDate: 'Início',
    billsTablePaymentLink: 'Boleto / Link',
    billsTableNotes: 'Observações',
    billsTableActions: 'Ações',
    noBillsRegistered: 'Nenhuma conta cadastrada.',
    noBillsRegisteredPrompt: 'Clique em "+ Nova Conta" para cadastrar sua primeira conta recorrente ou pontual!',
    ruleMonthly: 'Dia {day} de cada mês',
    ruleEveryNMonths: 'A cada {interval} meses no dia {day}',
    ruleYearly: '{month}, dia {day}',
    ruleWeekly: 'Semanalmente ({day})',
    ruleOnce: 'Vence em {date}',
    editBillAction: 'Editar Conta',
    edit: 'Editar',
    goToBills: 'Ir para Cadastro de Contas',

    // Bills & Recurrences (Existing / occurrences)
    billsTitle: 'Execuções de Pagamento',
    newBillBtn: '+ Nova Conta',
    filterLabel: 'Filtro de visualização:',
    filterNone: 'Sem filtro (Próximas 10 ocorrências de cada conta)',
    filterMonth: 'Contas dentro do mês',
    filterNextDays: 'Próximos N dias',
    daysCount: 'Quantidade de dias',
    monthSelect: 'Selecione o mês',
    referenceDate: 'Data de referência',

    // Bill Form / Modal
    createBillTitle: 'Cadastrar Nova Conta',
    editBillTitle: 'Editar Conta',
    billTitle: 'Título da Conta',
    billTitlePlaceholder: 'Ex: Conta de Luz, Aluguel, Seguro...',
    expectedAmount: 'Valor Esperado',
    frequency: 'Frequência',
    freqOnce: 'Única',
    freqMonthly: 'Mensal (em dia específico do mês)',
    freqEveryNMonths: 'A cada N meses (em dia específico)',
    freqYearly: 'Anual',
    freqWeekly: 'Semanal (em dia específico da semana)',
    startDate: 'Data de início',
    dueDate: 'Data de vencimento',
    dayOfMonth: 'Dia do mês para vencimento (1 a 31)',
    dayOfWeek: 'Dia da semana para vencimento',
    intervalMonths: 'Intervalo de meses (ex: 3 para trimestral)',
    monthOfYear: 'Mês do ano para vencimento',
    notes: 'Observações (opcional)',
    notesPlaceholder: 'Anotações gerais sobre a conta...',
    paymentLink: 'Link para geração do boleto (opcional)',
    paymentLinkPlaceholder: 'Ex: https://banco.com/segunda-via-boleto...',
    openBoletoAction: 'Abrir Boleto',
    newBillShortcutHint: 'Atalho: Ctrl+Shift++',
    saveBill: 'Salvar Conta',
    cancel: 'Cancelar',

    // Checklist and Occurrence
    status: 'Status',
    statusPending: 'Pendente',
    statusPaid: 'Pago',
    dueAt: 'Vencimento',
    payAction: 'Marcar como Pago',
    undoPayAction: 'Desfazer Pagamento',
    deleteBillAction: 'Excluir Conta',
    confirmDeleteBill: 'Tem certeza que deseja excluir esta conta e suas execuções?',
    confirmUndoPayment: 'Tem certeza que deseja desfazer o registro deste pagamento?',

    // Payment Modal
    paymentModalTitle: 'Registrar Pagamento',
    paymentDate: 'Data do Pagamento',
    paidAmount: 'Valor Efetivamente Pago',
    paymentNotes: 'Observações do Pagamento',
    paymentNotesPlaceholder: 'Comprovante, código Pix, etc.',
    confirmPayment: 'Confirmar Pagamento',

    // Summary Card
    summaryTitle: 'Resumo do Período',
    summaryTotalExpected: 'Total Esperado',
    summaryTotalPaid: 'Total Pago',
    summaryTotalPending: 'Pendente',
    summaryOccurrencesCount: 'Ocorrências',

    // Months
    months: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],

    // Days of week (0 = Domingo to 6 = Sábado)
    daysOfWeek: [
      'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
      'Quinta-feira', 'Sexta-feira', 'Sábado'
    ],

    // Empty state & alerts
    noBillsFound: 'Nenhuma promessa de pagamento encontrada para o filtro selecionado.',
    noBillsPrompt: 'Clique em "+ Nova Conta" acima para cadastrar sua primeira conta!',
    loading: 'Carregando...',
    errorOccurred: 'Ocorreu um erro:',
  },
  en: {
    appTitle: 'PayTheBills',
    appSubtitle: 'Bill payment checklist and tracker',
    switchLanguage: 'Português',
    login: 'Log In',
    register: 'Create Account',
    loginTitle: 'Access your account',
    registerTitle: 'Create your account',
    name: 'Full Name',
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    passwordsMismatch: 'Passwords do not match.',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    createAccountPrompt: 'Create you account here',
    loginPrompt: 'Log in here',
    logout: 'Log Out',
    welcomeUser: 'Hello, {name}',

    // Navigation
    navExecutions: 'Executions',
    navBills: 'Bills',
    navComparison: 'Comparison',

    // Monthly Comparison View
    comparisonTitle: 'Monthly Spending Comparison',
    comparisonSubtitle: 'Compare expenses across previous months and current month',
    filterByBill: 'Filter by Bill:',
    selectAllBills: 'Select All',
    deselectAllBills: 'Deselect All',
    billsSelectedCount: '{selected} of {total} bills selected',
    periodLabel: 'Period:',
    last6Months: 'Last 6 months',
    last12Months: 'Last 12 months',
    totalSpentPeriod: 'Total Paid in Period',
    monthlyAverage: 'Monthly Average',
    currentMonth: 'Current Month ({month})',
    previousMonth: 'Previous Month',
    diffVsPreviousMonth: 'Change vs Previous Month',
    peakMonth: 'Peak Month',
    showPaid: 'Paid Amounts',
    showExpected: 'Expected Amounts',
    paidAmountLabel: 'Amount Paid',
    expectedAmountLabel: 'Expected Amount',
    currentMonthBadge: 'Current Month',
    breakdownTableTitle: 'Monthly Breakdown',
    tableMonth: 'Month',
    tablePaid: 'Total Paid',
    tableExpected: 'Total Expected',
    tableVariation: 'Change',
    noBillsToCompare: 'No bills found for comparison.',
    noSelectedBillsWarning: 'Select at least one bill to view the chart.',

    // Executions View
    executionsTitle: 'Payment Executions',
    executionsSubtitle: 'Track and pay recurring and scheduled bills',

    // Bills Management (CRUD)
    billsManagementTitle: 'Bills Management',
    billsManagementSubtitle: 'Manage recurring and one-time bill templates',
    billsTableTitle: 'Title',
    billsTableExpectedAmount: 'Expected Amount',
    billsTableFrequency: 'Frequency',
    billsTableRule: 'Due Rule',
    billsTableStartDate: 'Start Date',
    billsTablePaymentLink: 'Invoice / Link',
    billsTableNotes: 'Notes',
    billsTableActions: 'Actions',
    noBillsRegistered: 'No bills registered yet.',
    noBillsRegisteredPrompt: 'Click on "+ New Bill" to register your first bill template!',
    ruleMonthly: 'Day {day} of every month',
    ruleEveryNMonths: 'Every {interval} months on day {day}',
    ruleYearly: '{month}, day {day}',
    ruleWeekly: 'Weekly ({day})',
    ruleOnce: 'Due on {date}',
    editBillAction: 'Edit Bill',
    edit: 'Edit',
    goToBills: 'Go to Bills Management',

    // Bills & Recurrences
    billsTitle: 'Payment Executions',
    newBillBtn: '+ New Bill',
    filterLabel: 'View filter:',
    filterNone: 'No filter (Next 10 recurrences of each bill)',
    filterMonth: 'Bills within month',
    filterNextDays: 'Next N days',
    daysCount: 'Number of days',
    monthSelect: 'Select month',
    referenceDate: 'Reference date',

    // Bill Form / Modal
    createBillTitle: 'Create New Bill',
    editBillTitle: 'Edit Bill',
    billTitle: 'Bill Title',
    billTitlePlaceholder: 'E.g., Electric bill, Rent, Insurance...',
    expectedAmount: 'Expected Amount',
    frequency: 'Frequency',
    freqOnce: 'Once',
    freqMonthly: 'Monthly (on a specific day of month)',
    freqEveryNMonths: 'Every N months (on a specific day)',
    freqYearly: 'Yearly',
    freqWeekly: 'Weekly (on a specific day of week)',
    startDate: 'Start date',
    dueDate: 'Due date',
    dayOfMonth: 'Due day of month (1 to 31)',
    dayOfWeek: 'Due day of week',
    intervalMonths: 'Month interval (e.g. 3 for quarterly)',
    monthOfYear: 'Due month of the year',
    notes: 'Notes (optional)',
    notesPlaceholder: 'General notes about the bill...',
    paymentLink: 'Link to generate/view bill (optional)',
    paymentLinkPlaceholder: 'E.g., https://bank.com/invoice...',
    openBoletoAction: 'Open Boleto',
    newBillShortcutHint: 'Shortcut: Ctrl+Shift++',
    saveBill: 'Save Bill',
    cancel: 'Cancel',

    // Checklist and Occurrence
    status: 'Status',
    statusPending: 'Pending',
    statusPaid: 'Paid',
    dueAt: 'Due on',
    payAction: 'Mark as Paid',
    undoPayAction: 'Undo Payment',
    deleteBillAction: 'Delete Bill',
    confirmDeleteBill: 'Are you sure you want to delete this bill and all its executions?',
    confirmUndoPayment: 'Are you sure you want to undo this payment record?',

    // Payment Modal
    paymentModalTitle: 'Register Payment',
    paymentDate: 'Payment Date',
    paidAmount: 'Amount Paid',
    paymentNotes: 'Payment Notes',
    paymentNotesPlaceholder: 'Receipt, transaction code, etc.',
    confirmPayment: 'Confirm Payment',

    // Summary Card
    summaryTitle: 'Period Summary',
    summaryTotalExpected: 'Total Expected',
    summaryTotalPaid: 'Total Paid',
    summaryTotalPending: 'Pending',
    summaryOccurrencesCount: 'Occurrences',

    // Months
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],

    // Days of week (0 = Sunday to 6 = Saturday)
    daysOfWeek: [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday'
    ],

    // Empty state & alerts
    noBillsFound: 'No payment promises found for the selected filter.',
    noBillsPrompt: 'Click on "+ New Bill" above to register your first bill!',
    loading: 'Loading...',
    errorOccurred: 'An error occurred:',
  },
};

export const detectBrowserLanguage = (): Language => {
  try {
    const saved = localStorage.getItem('paythebills_language');
    if (saved === 'pt' || saved === 'en') {
      return saved;
    }

    const browserLangs = navigator.languages || [navigator.language];
    for (const l of browserLangs) {
      if (l.toLowerCase().startsWith('pt')) return 'pt';
      if (l.toLowerCase().startsWith('en')) return 'en';
    }
  } catch {
    // fallback if localStorage not accessible
  }
  return 'en';
};

export const formatCurrency = (amount: number, lang: Language): string => {
  const currency = lang === 'pt' ? 'BRL' : 'USD';
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

export const formatDate = (dateStr: string, lang: Language): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day);
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
