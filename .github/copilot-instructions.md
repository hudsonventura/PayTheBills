# Instrucoes do Projeto

Estas instrucoes se aplicam a toda solicitacao neste repositorio.

## Consulta obrigatoria aos agentes

- Antes de agir em qualquer solicitacao, leia todos os arquivos `.github/agents/*.agent.md` e respeite suas regras.
- Para tarefas de implementacao, aplique tambem os criterios do agente `clean-architecture`.
- Para mudancas que afetem regras de negocio, consulte e atualize o agente `business-rules` na mesma alteracao.
- Quando a solicitacao envolver revisao ou seguranca, aplique os criterios dos agentes correspondentes.
- Se uma regra ainda nao estiver definida, nao a invente: explicite a lacuna e solicite esclarecimento quando ela impedir uma decisao correta.

## Projeto

- A solucao existente e uma API ASP.NET Core em `server/`, atualmente no .NET 10.
- Examine o codigo existente antes de propor ou fazer mudancas; nao presuma que endpoints de exemplo sejam funcionalidades de negocio.
- Preserve o escopo da solicitacao e adicione testes para comportamento novo ou alterado quando houver infraestrutura de testes.
- Responda em portugues, salvo quando o usuario pedir outro idioma.