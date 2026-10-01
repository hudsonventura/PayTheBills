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
    createAccountPrompt: 'Cadastre-se gratuitamente',
    loginPrompt: 'Faça login aqui',
    logout: 'Sair',
    welcomeUser: 'Olá, {name}',

    // Bills & Recurrences
    billsTitle: 'Suas Contas e Promessas de Pagamento',
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
    startDate: 'Data de início',
    dueDate: 'Data de vencimento',
    dayOfMonth: 'Dia do mês para vencimento (1 a 31)',
    intervalMonths: 'Intervalo de meses (ex: 3 para trimestral)',
    monthOfYear: 'Mês do ano para vencimento',
    notes: 'Observações (opcional)',
    notesPlaceholder: 'Anotações sobre a conta, link para boleto, etc.',
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
    createAccountPrompt: 'Sign up for free',
    loginPrompt: 'Log in here',
    logout: 'Log Out',
    welcomeUser: 'Hello, {name}',

    // Bills & Recurrences
    billsTitle: 'Your Bills & Payment Promises',
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
    startDate: 'Start date',
    dueDate: 'Due date',
    dayOfMonth: 'Due day of month (1 to 31)',
    intervalMonths: 'Month interval (e.g. 3 for quarterly)',
    monthOfYear: 'Due month of the year',
    notes: 'Notes (optional)',
    notesPlaceholder: 'Payment details, confirmation codes, etc.',
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
