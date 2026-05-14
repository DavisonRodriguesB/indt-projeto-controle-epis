PROJETO EPI PIM
Sistema de Gestão de Equipamentos de Proteção Individual - Polo Industrial de Manaus
1. Descrição do Projeto
O EPI PIM é uma plataforma técnica desenvolvida para a gestão centralizada de Equipamentos de Proteção Individual (EPI). O projeto visa solucionar lacunas operacionais na rastreabilidade de dispositivos de segurança, garantindo a conformidade com a norma regulamentadora NR-06. No contexto do Polo Industrial de Manaus, o sistema atua na mitigação de riscos jurídicos e na otimização da logística de suprimentos de segurança.

2. Funcionalidades Operacionais
Painel de Indicadores (Dashboard): Monitorização em tempo real da conformidade global por setor e análise de métricas de proteção.

Controle de Validades: Sistema automatizado de verificação do Certificado de Aprovação (C.A.) e prazos de validade técnica.

Gestão de Protocolos: Registro digitalizado de cautelas, entregas de equipamentos, permitindo auditoria integral do histórico do colaborador.

Gestão de Inventário: Controle de estoques com parametrização de níveis críticos e reposição automatizada.

3. Arquitetura e Stack Tecnológica
Frontend
Framework: Angular Moderno

Arquitetura: Standalone Components / Signals

Estilização: Tailwind CSS (Metodologia Mobile-First)

Backend e Infraestrutura
Ambiente: Node.js e Express

Base de Dados: PostgreSQL

ORM (Object-Relational Mapping): TypeORM

Contentorização: Docker

4. Requisitos e Implementação
A implementação utiliza o Docker para garantir a paridade entre os ambientes de desenvolvimento e produção, isolando a instância do banco de dados PostgreSQL. A comunicação entre o cliente e o servidor é realizada através de uma API RESTful protegida por autenticação JWT (JSON Web Token).

Procedimentos de Execução
Realizar a clonagem do repositório através do sistema de controlo de versões Git.

Inicializar a infraestrutura de base de dados: docker-compose up -d.

Instalar as dependências e executar o serviço de backend: npm run dev.

Compilar e executar a interface do utilizador: ng serve.

5. Informações Complementares
Finalidade: Projeto Final de Capacitação Full Stack.

Instituição: INDT (2025-2026).

Autores: Davison Bentes e Gabriel Oliveira.
