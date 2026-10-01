# Instrucoes para Gemini

Estas regras se aplicam a toda solicitacao feita por Gemini neste repositorio.

- No inicio de cada solicitacao, leia todos os arquivos `.github/agents/*.agent.md` e siga as orientacoes pertinentes antes de pesquisar, responder ou editar.
- Em implementacoes, use o agente `implementation` e verifique os limites definidos pelo agente `clean-architecture`.
- Em revisoes, consulte `code-review`; em analises de seguranca, consulte `security`; em qualquer alteracao que envolva dominio, consulte `business-rules`.
- O arquivo `.github/agents/business-rules.agent.md` e o registro autoritativo das regras de negocio conhecidas. Toda mudanca, inclusao ou remocao de regra deve atualizar a secao de regras registradas desse arquivo no mesmo conjunto de alteracoes, alem dos testes e codigo afetados.
- Nao invente regras de negocio ausentes. Registre a duvida e peca esclarecimento se ela bloquear uma implementacao correta.
- Preserve alteracoes existentes e mantenha cada solicitacao no menor escopo que a resolva.