# PayTheBills 💳

> Sistema moderno, autossuficiente e portátil para gestão e controle de contas a pagar, vencimentos e recorrências financeiras.

---

## 🎯 Objetivo do Sistema

### O que é o PayTheBills?
O **PayTheBills** é um projeto pessoal para solucionar um problema contante. Uma aplicação completa de gestão financeira pessoal e empresarial focada no controle de contas, boletos e despesas recorrentes. Desenvolvido com base nos princípios da **Clean Architecture**, o sistema unifica em uma experiência ágil tanto o agendamento quanto o histórico de pagamentos realizados.

### O que ele resolve?
- **Falta de visibilidade financeira:** Apresenta claramente quais contas já foram quitadas, quais estão pendentes e seus históricos de execução com valores efetivamente pagos.
- **Complexidade de implantação:** Elimina configurações complexas de múltiplos servidores e provedores de banco de dados externos. O sistema é **totalmente portátil**: com um único comando Docker, frontend e backend sobem unificados com persistência de dados local via SQLite.

---

## 🚀 Getting Started

### Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/) instalados (para execução via container), **ou**
- [.NET 10 SDK](https://dotnet.microsoft.com/) e [Node.js 22+](https://nodejs.org/) (para execução em ambiente de desenvolvimento local).

---

### Executando com Docker (Recomendado)

O projeto foi projetado para portabilidade total em um único container unificado:

1. Clone o repositório:
   ```bash
   git clone https://github.com/hudsonventura/PayTheBills.git
   cd PayTheBills
   ```

2. Suba o container com o Docker Compose:
   ```bash
   docker compose up -d
   ```

3. Acesse a aplicação no seu navegador:
   - **Interface Gráfica & API:** [http://localhost:5000](http://localhost:5000)
   - **Porta alternativa (padrão Vite):** [http://localhost:5173](http://localhost:5173)

4. **Credenciais Padrão (Seed Automático):**
   - **E-mail / Usuário:** `admin`
   - **Senha:** `admin`

> 💾 **Persistência de Dados:** O banco de dados SQLite é gerado e mantido fora do container no diretório `./data/paythebills.db`. Suas alterações sobrevivem a paradas, remoções ou atualizações do container.

---

### Executando em Desenvolvimento Local (Sem Docker)

Se desejar executar backend e frontend separadamente para desenvolvimento:

#### 1. Backend (.NET 10)
```bash
cd server
dotnet restore
dotnet run
```
*O servidor iniciará escutando em `http://localhost:5000` e criará o arquivo SQLite em `server/data/paythebills.db`.*

#### 2. Frontend (React + Vite)
```bash
cd client
npm install
npm run dev
```
*O Vite iniciará em `http://localhost:5173`.*

#### 3. Executando os Testes Automatizados
```bash
dotnet test
```

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Backend** | .NET 10 / C# 14 | ASP.NET Core Minimal APIs de alta performance |
| **Banco de Dados** | SQLite com EF Core | Entity Framework Core com migrações nativas |
| **Identificadores** | SnowflakeGuid | GUIDs sequenciais e ordenáveis no tempo |
| **Segurança** | PBKDF2 + Salt Criptográfico | Hashing com 100.000 iterações SHA-256 e salts de 16 caracteres aleatórios |
| **Autenticação** | JWT (JSON Web Tokens) | Autenticação stateless via Bearer Token |
| **Frontend** | React 19 + TypeScript | SPA com tipagem estática e reatividade nativa |
| **Build & Tooling** | Vite + Tailwind CSS | Build ultra-rápido com estilo utilitário moderno |
| **Ícones** | Lucide React | Conjunto limpo e consistente de ícones |
| **Containerização** | Docker Multi-Stage | Compilação conjunta do client e server em runtime unificado |

---

## 🏛️ Arquitetura e Design Patterns

O backend do PayTheBills foi concebido sob as diretrizes da **Clean Architecture** (Arquitetura Limpa), garantindo que as regras de negócio permaneçam isoladas e imunes a detalhes de infraestrutura ou frameworks.

```
server/
├── Domain/                   # Regras de Negócio Empresariais e Entidades
│   ├── Entities/             # User, Bill, BillExecution
│   ├── Enums/                # Frequency (Once, Daily, Monthly, etc.)
│   └── Services/             # RecurrenceCalculator (Cálculo de vencimentos)
├── Application/              # Casos de Uso e Contratos
│   ├── DTOs/                 # Objetos de transferência de dados (Request/Response)
│   ├── Interfaces/           # IAppDbContext, IPasswordHasher, ITokenService
│   └── UseCases/             # AuthUseCases, BillUseCases
├── Infrastructure/           # Implementação de detalhes de I/O e persistência
│   ├── Persistence/          # AppDbContext, Mapeamentos EF Core, Migrations SQLite
│   └── Security/             # Pbkdf2PasswordHasher, JwtTokenService
├── Endpoints/                # Camada de Apresentação / Transporte (Minimal APIs)
│   ├── AuthEndpoints.cs
│   └── BillEndpoints.cs
└── Extensions/               # Configuração do Pipeline e Injeção de Dependências
```

### Principais Padrões de Projeto (Design Patterns) Aplicados

1. **Clean Architecture / Dependency Inversion Principle (DIP):**
   - As camadas de `Domain` e `Application` não dependem de SQLite, PostgreSQL ou ASP.NET Core. 
   - A prova prática: a transição de PostgreSQL para SQLite exigiu **zero** alterações nas regras de negócio e casos de uso, limitando-se apenas à camada de infraestrutura.

2. **Use Case Pattern (Application Services):**
   - Operações do sistema (`AuthUseCases`, `BillUseCases`) centralizam o fluxo de orquestração de negócios, mantendo os endpoints HTTP enxutos e focados apenas em serialização e status codes.

3. **Repository / Unit of Work (via EF Core DbContext):**
   - O contrato `IAppDbContext` abstrai o acesso às coleções de dados, permitindo testabilidade sem acoplamento a um banco de dados físico.

4. **Domain Service Pattern (`RecurrenceCalculator`):**
   - Lógica de cálculo de datas recorrentes isolada em um serviço de domínio puro, testada com cobertura unitária exaustiva.

5. **Strategy / Provider Pattern de Criptografia:**
   - A interface `IPasswordHasher` padroniza a geração de salts criptográficos e verificação de hashes.

6. **Single Point of Failure / Centralized API Client (Frontend):**
   - No cliente React, todas as chamadas HTTP convergem no utilitário `client.ts`, que gerencia automaticamente a base URL, injeção de tokens JWT, tratamento de respostas e redirecionamentos.

7. **Multi-Stage Build Pattern (Docker):**
   - O `Dockerfile` é estruturado em estágios (`client-builder`, `server-builder` e `runtime`), gerando uma imagem final mínima que serve tanto os endpoints REST quanto os arquivos estáticos do SPA através do middleware do Kestrel.

---

## 🔒 Regras de Segurança Implementadas

- **Salt Criptográfico (BR-AUTH-02):**
  - Cada senha possui um salt único gerado com 16 caracteres aleatórios, incluindo no mínimo 6 caracteres especiais.
  - O cálculo do hash utiliza `PBKDF2` com `HMACSHA256` e 100.000 iterações.
  - A comparação de hashes na autenticação é realizada com `CryptographicOperations.FixedTimeEquals` para prevenir ataques de análise de tempo (*timing attacks*).
- **Isolamento de Dados:**
  - Todas as consultas de contas e pagamentos são estritamente filtradas pelo `UserId` extraído das claims do token JWT autenticado.

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para obter mais informações.
