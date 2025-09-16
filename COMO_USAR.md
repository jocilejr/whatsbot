# 🚀 Como Usar o WhatsApp Bot Management System

## Início Rápido

### 1. Executar o Sistema

```bash
python main.py
```

O sistema será iniciado em **http://78.46.250.112/**

### 2. Primeiro Acesso

1. **Abra o navegador** em `http://78.46.250.112/`
2. **Clique no rodapé** da sidebar (área do usuário)
3. **Clique em "Novo usuário"**
4. **Preencha os dados:**
   - Nome: `Administrador`
   - Usuário: `admin`
   - Senha: `123456`
5. **Clique em "Criar"**

Pronto! Você estará logado no sistema.

## 📱 Funcionalidades Principais

### Dashboard
- Visão geral do sistema
- Métricas em tempo real
- Status dos números conectados

### Números Conectados
1. **Conectar novo número:**
   - Clique em "Conectar Número"
   - Adicione apelido (ex: "Vendas")
   - Adicione telefone (ex: "+55 11 99999-0000")
   - Clique em "Conectar"

2. **Gerenciar números:**
   - **Configurar**: Editar dados do número
   - **Reconectar**: Simular nova conexão WhatsApp
   - **Desconectar**: Colocar número offline
   - **Remover**: Excluir número definitivamente

### Central de Mensagens
1. **Nova conversa:**
   - Clique em "Nova Conversa"
   - Selecione o número para envio
   - Adicione nome do contato
   - Adicione telefone (opcional)

2. **Enviar mensagens:**
   - Selecione uma conversa
   - Digite a mensagem
   - Pressione Enter ou clique no botão enviar

### Campanhas
1. **Nova campanha:**
   - Clique em "Nova Campanha"
   - Nome da campanha (ex: "Promoção Black Friday")
   - Mensagem a ser enviada
   - Selecione número para envio

2. **Gerenciar campanhas:**
   - Editar conteúdo da campanha
   - Remover campanhas antigas

## 🔧 Opções Avançadas

### Executar em porta diferente
```bash
python main.py --port 8080
```

alterar-ip-de-acesso-para-78.46.250.112-gi6zdu
### Definir explicitamente o IP do servidor
```bash
python main.py --host 78.46.250.112

```

### Modo desenvolvimento (auto-reload)
```bash
python main.py --dev
```

### Pular instalação de dependências
```bash
python main.py --skip-install
```

### Definir URL pública personalizada
```bash
python main.py --public-url http://meuservidor.com/
```

## 🌐 Acessos Importantes

- **Sistema Principal**: http://78.46.250.112/
- **API Docs (Swagger)**: http://78.46.250.112/docs
- **API Docs (ReDoc)**: http://78.46.250.112/redoc

## 📁 Estrutura de Arquivos

```
whatsapp-bot-system/
├── main.py                 # ⭐ Execute este arquivo
├── backend/                # Código do servidor
├── static/                 # Interface web
├── whatsapp_bot_data.json  # Dados do sistema
└── README.md               # Documentação completa
```

## 🔑 Dados de Exemplo

### Usuário de Teste
- **Nome**: Administrador
- **Usuário**: admin
- **Senha**: 123456

### Número de Exemplo
- **Apelido**: Vendas Principal
- **Telefone**: +55 11 99999-0000

### Conversa de Exemplo
- **Contato**: João Silva
- **Telefone**: +55 11 88888-8888

## ❓ Problemas Comuns

### Erro "Porta em uso"
```bash
python main.py --port 8080
```

### Erro de dependências
```bash
pip install fastapi uvicorn python-dotenv pydantic python-multipart
python main.py --skip-install
```

### Problemas no navegador
- Limpe o cache (Ctrl+F5)
- Tente outro navegador
- Verifique se JavaScript está habilitado

## 🎯 Próximos Passos

1. **Explore todas as funcionalidades**
2. **Crie múltiplos usuários**
3. **Teste o sistema de mensagens**
4. **Configure campanhas**
5. **Monitore o dashboard**

## 🛠️ Personalização

Para personalizar o sistema, edite:
- **Interface**: `/static/index.html` e `/static/app.js`
- **API**: `/backend/server.py`
- **Modelos**: `/backend/models.py`
- **Dados**: `/backend/database.py`

---

**🎉 Divirta-se explorando o sistema!**