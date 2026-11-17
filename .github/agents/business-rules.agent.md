---
name: business-rules
description: "Use whenever a task reads, implements, reviews, tests, adds, changes, or removes PayTheBills domain or business behavior. This file is the authoritative business-rules register."
tools: [read, search]
user-invocable: true
---
Voce e o agente responsavel pelas regras de negocio do PayTheBills. Este arquivo e o registro autoritativo e versionado das regras conhecidas do sistema.

## Regras registradas

### Regras confirmadas

- **BR-AUTH-01 (Usuário Inicial / Seed)**: Quando o banco de dados for inicializado ou estiver vazio, deve existir automaticamente um usuário administrador inicial com email/login `admin` e senha `admin`.
- **BR-AUTH-02 (Salt de Senha)**:
  - Todo usuário possui um salt de senha associado de exatamente 16 caracteres aleatórios, contendo no mínimo 6 caracteres especiais pertencentes ao conjunto `!@#$%^&*()_+-=[]{}|;:,.<>?`.
  - O salt é persistido na entidade do usuário no banco de dados (`PasswordSalt`).
  - O hash de senha é gerado a partir da concatenação do salt com a senha (`salt + password`) utilizando PBKDF2 com SHA-256 e 100.000 iterações.
  - No fluxo de login, o sistema busca o usuário pelo identificador/email, obtém seu `PasswordSalt` e valida a senha recebida utilizando esse salt contra o `PasswordHash` armazenado.
- **BR-BILL-01 (Link para Boleto / Pagamento)**:
  - Cada conta pode possuir opcionalmente um link (`PaymentLink`) para eventual geração ou visualização do boleto/pagamento da conta.
  - O campo é opcional (pode ser nulo ou vazio). Quando informado, o valor tem tamanho máximo de 1000 caracteres.
  - O link é persistido na entidade `Bill` (tabela `bills`), propagado nas ocorrências calculadas (`BillOccurrence`) e exibido na interface para facilitar a geração/pagamento do boleto.
- **BR-BILL-02 (Contas vs Execuções e Ocorrências Virtuais)**:
  - O cadastro de contas (`Bill`) é persistido no banco de dados e representa as definições/recorrências de compromissos financeiros. Suporta operações de CRUD (criação, listagem, atualização e exclusão).
  - As pendências/ocorrências de pagamento (`BillOccurrence`) são virtuais: são calculadas dinamicamente sob demanda com base nas regras de recorrência e não existem fisicamente na base de dados.
  - Somente quando uma ocorrência é paga (executada), cria-se um registro concreto no banco de dados na tabela de execuções (`bill_executions`). A tela principal destina-se ao acompanhamento dessas execuções/pagamentos, enquanto o cadastro e gestão de contas ocorre em tela própria.
- **BR-BILL-03 (Frequência Semanal e Dia da Semana)**:
  - O sistema passa a suportar a frequência de pagamentos semanal (`Weekly`).
  - Para contas com frequência semanal, é obrigatório informar o dia da semana (`DayOfWeek`) em que o pagamento acontecerá, admitindo valores de domingo a sábado (0 a 6, correspondendo a domingo = 0 até sábado = 6).
  - Para contas que não possuam frequência semanal, o campo `DayOfWeek` não é aplicável e permanece nulo.
  - O cálculo de ocorrências para contas semanais projeta as datas a cada 7 dias no dia da semana especificado a partir da data de início (`StartDate`), não gerando ocorrências com datas anteriores à data de início.
- **BR-BILL-04 (Comparativo Mensal de Gastos e Filtros)**:
  - O sistema disponibiliza consulta analítica/comparativa mensal de gastos históricos e do mês atual.
  - O valor pago de cada mês reflete os pagamentos concretizados (execuções) pertinentes àquele período.
  - O comparativo suporta tanto a visão geral (soma de todas as contas do usuário) quanto a visão discriminada por conta (filtrando uma ou mais contas).
  - Na interface, todas as contas iniciam selecionadas por padrão, e há um botão dedicado para marcar e desmarcar todas simultaneamente.
- **BR-CARD-01 (Cartões de Crédito)**:
  - O sistema permite o cadastro de múltiplos cartões de crédito vinculados ao usuário autenticado.
  - Cada cartão possui nome/identificador (obrigatório), dia de fechamento (1 a 31), dia de vencimento (1 a 31) e uma cor de identificação visual.
- **BR-CARD-02 (Compras Parceladas de Cartão)**:
  - Representa exclusivamente gastos parcelados associados a um cartão de crédito do usuário.
  - Campos obrigatórios: Cartão (`CreditCardId`), Descrição/Título, Data da Compra (`PurchaseDate`), Valor Total (`TotalAmount > 0`), Quantidade de Parcelas (`TotalInstallments >= 1`), e Mês de Início da 1ª Parcela (`FirstInstallmentMonth`).
  - O valor da parcela é calculado (`TotalAmount / TotalInstallments`), admitindo eventual ajuste pelo usuário.
- **BR-CARD-03 (Linha do Tempo Gantt e Projeção Mensal de Parcelas)**:
  - A projeção mensal é calculada a partir do mês atual (`CurrentYear`/`CurrentMonth`) até o último mês em que houver qualquer parcela ativa (`MaxMonth`).
  - Para cada mês da projeção, calcula-se:
    - O número de itens parcelados ativos incidindo naquele mês.
    - O valor total a pagar naquele mês (somatório das parcelas devidas).
    - Os itens participantes com a respectiva identificação da parcela (ex: parcela `i` de `N`).
  - No gráfico Gantt, cada compra é representada por uma barra horizontal contínua estendendo-se do mês de início ao mês de término, destacando visualmente as parcelas passadas, a parcela do mês atual e as parcelas futuras.

## Protocolo obrigatorio para mudancas de regra

1. Identifique se a solicitacao altera, adiciona ou remove comportamento de negocio; diferencie regra de dominio de detalhe tecnico.
2. Se faltar uma decisao necessaria, registre a pergunta e nao escolha uma politica por conta propria.
3. Quando a regra for confirmada, atualize esta secao neste arquivo na mesma alteracao do codigo. Descreva condicao, resultado esperado, excecoes e data ou referencia da decisao, se fornecida.
4. Atualize ou crie testes que expressem a regra, e verifique que o codigo implementa a mesma versao registrada.
5. Em revisoes futuras, compare codigo e testes com este registro e sinalize divergencias.

## Limites

- Nao invente nem amplie regras por convencao tecnica, nome de produto ou expectativa comum.
- Nao apague uma regra antiga silenciosamente: registre a substituicao ou remocao e preserve contexto suficiente para manutencao.
- Esta secao deve permanecer atualizada; toda modificacao de regra deve ser informada aqui para futuras manutencoes.