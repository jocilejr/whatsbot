# WhatsApp Bot Management System

Sistema completo de gestão de chatbot do WhatsApp com interface web moderna e responsiva.

## 🚀 Características

- **Interface Web Moderna**: Interface responsiva com design profissional
- **Gestão de Usuários**: Sistema multi-usuário com autenticação simples
- **Números Conectados**: Gerenciamento de múltiplas instâncias do WhatsApp
- **Central de Mensagens**: Interface de chat em tempo real
- **Campanhas**: Sistema de envio em massa
- **Dashboard**: Métricas e estatísticas em tempo real
- **API REST**: API completa para integração externa

## 📋 Requisitos

- Python 3.8+
- Navegador web moderno

## ⚡ Instalação e Execução

### Modo Simples (Recomendado)

```bash
# Clone ou baixe o projeto
cd whatsapp-bot-system

# Execute o sistema (instala dependências automaticamente)
python main.py
```

O sistema estará disponível em: **http://78.46.250.112/**

### Opções de Execução

```bash
# Servidor padrão (acesso: http://78.46.250.112/)
python main.py

# Porta customizada
python main.py --port 8080

# Definir explicitamente o IP do servidor
python main.py --host 78.46.250.112

# Definir URL pública personalizada
python main.py --public-url http://meuservidor.com/

# Modo desenvolvimento (auto-reload)
python main.py --dev

# Pular instalação automática de dependências
python main.py --skip-install
```

### Instalação Manual de Dependências

Se preferir instalar as dependências manualmente:

```bash
pip install fastapi uvicorn python-dotenv pydantic python-multipart
python main.py --skip-install
```

## 🎯 Como Usar

### 1. Primeiro Acesso

1. Abra **http://78.46.250.112/** no navegador
2. Clique no rodapé da sidebar para criar seu primeiro usuário
3. Preencha nome, usuário e senha
4. Pronto! Você estará logado no sistema

### 2. Conectar Números do WhatsApp

1. Navegue para **"Números Conectados"**
2. Clique em **"Conectar Número"**
3. Adicione um apelido e telefone
4. Use **"Reconectar"** para simular a conexão (em produção seria o QR Code)

### 3. Gerenciar Conversas

1. Vá para **"Central de Mensagens"**
2. Clique em **"Nova Conversa"**
3. Selecione o número, adicione contato
4. Comece a trocar mensagens

### 4. Criar Campanhas

1. Acesse **"Campanhas"**
2. Clique em **"Nova Campanha"**
3. Configure nome, mensagem e número de envio
4. Gerencie suas campanhas de envio em massa

## 🏗️ Arquitetura

### Backend (FastAPI)
- **API REST**: Endpoints completos para todas as funcionalidades
- **Persistência**: Dados salvos em JSON (facilmente migrável para BD)
- **Modelos**: Estrutura de dados bem definida com Pydantic
- **CORS**: Configurado para desenvolvimento e produção

### Frontend (Vanilla JS)
- **SPA**: Single Page Application sem frameworks pesados
- **Responsivo**: Design adaptativo para desktop e mobile
- **Modal System**: Sistema de modais nativo sem dependências
- **API Integration**: Comunicação completa com o backend

### Estrutura de Arquivos

```
whatsapp-bot-system/
├── main.py                 # Launcher principal
├── backend/
│   ├── server.py          # Servidor FastAPI
│   ├── models.py          # Modelos Pydantic
│   └── database.py        # Sistema de persistência
├── static/
│   ├── index.html         # Interface principal
│   └── app.js             # JavaScript da aplicação
├── whatsapp_bot_data.json # Dados do sistema (criado automaticamente)
└── README.md              # Esta documentação
```

## 🔧 API Endpoints

### Usuários
- `POST /api/users` - Criar usuário
- `GET /api/users` - Listar usuários
- `GET /api/users/{id}` - Obter usuário
- `PUT /api/users/{id}` - Atualizar usuário
- `DELETE /api/users/{id}` - Excluir usuário

### Instâncias do WhatsApp
- `POST /api/users/{user_id}/instances` - Criar instância
- `GET /api/users/{user_id}/instances` - Listar instâncias
- `PUT /api/users/{user_id}/instances/{id}` - Atualizar instância
- `POST /api/users/{user_id}/instances/{id}/reconnect` - Reconectar
- `POST /api/users/{user_id}/instances/{id}/disconnect` - Desconectar
- `DELETE /api/users/{user_id}/instances/{id}` - Excluir instância

### Conversas
- `GET /api/users/{user_id}/conversations` - Listar conversas
- `POST /api/users/{user_id}/conversations` - Criar conversa
- `POST /api/users/{user_id}/conversations/{id}/messages` - Enviar mensagem
- `DELETE /api/users/{user_id}/conversations/{id}` - Excluir conversa

### Campanhas
- `GET /api/users/{user_id}/campaigns` - Listar campanhas
- `POST /api/users/{user_id}/campaigns` - Criar campanha
- `PUT /api/users/{user_id}/campaigns/{id}` - Atualizar campanha
- `DELETE /api/users/{user_id}/campaigns/{id}` - Excluir campanha

### Dashboard
- `GET /api/users/{user_id}/dashboard` - Dados do dashboard

## 📊 Dados e Persistência

Os dados são salvos automaticamente no arquivo `whatsapp_bot_data.json`. A estrutura é facilmente migrável para bancos de dados como MongoDB, PostgreSQL ou MySQL.

### Estrutura dos Dados

```json
{
  "users": [
    {
      "id": "user_id",
      "name": "Nome do Usuário",
      "username": "usuario",
      "password": "senha",
      "created_at": "2024-01-01T00:00:00",
      "instances": [...]
    }
  ],
  "conversations": {
    "user_id": [...]
  },
  "campaigns": {
    "user_id": [...]
  }
}
```

## 🚀 Produção

Para uso em produção, considere:

1. **Banco de Dados**: Migrar para PostgreSQL/MongoDB
2. **Autenticação**: Implementar JWT tokens
3. **HTTPS**: Usar certificados SSL
4. **Proxy Reverso**: Nginx ou Apache
5. **Monitoramento**: Logs e métricas
6. **Backup**: Sistema de backup dos dados

## 🔐 Segurança

⚠️ **Importante**: Este é um sistema de demonstração. Para produção:

- Implementar hash de senhas
- Usar JWT para autenticação
- Configurar CORS adequadamente
- Implementar rate limiting
- Validar todas as entradas
- Usar HTTPS

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se está usando Python 3.8+
2. Certifique-se que todas as dependências estão instaladas
3. Verifique se a porta 8000 não está em uso
4. Consulte os logs do terminal para erros específicos

## 🎉 Próximas Funcionalidades

- [ ] Integração real com WhatsApp Business API
- [ ] Sistema de templates de mensagem  
- [ ] Agendamento de mensagens
- [ ] Relatórios avançados
- [ ] Sistema de plugins
- [ ] Webhooks
- [ ] Chatbot com IA
- [ ] Suporte a múltiplos idiomas

---

**Desenvolvido com ❤️ para facilitar a gestão de chatbots do WhatsApp**