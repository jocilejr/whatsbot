/* ======================================================
   WhatsApp Bot Management System - Frontend JavaScript
   ====================================================== */

// API Configuration
const API_BASE = '/api';

// Global App State
window.AppState = {
  currentUserId: null,
  users: [],
  currentUser: null,
  conversations: [],
  campaigns: [],
  instances: []
};

// Utility functions
function uid() { 
  return 'id_' + Math.random().toString(36).slice(2,9) + Date.now().toString(36); 
}

function esc(s='') { 
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;'); 
}

function formatTime(date) {
  if (!date) return '--:--';
  const d = new Date(date);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(timestamp) {
  if (!timestamp) return '—';
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  
  const days = Math.floor(hours / 24);
  return `${days} d`;
}

// API Functions
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    await uiAlert(`Erro na API: ${error.message}`);
    throw error;
  }
}

// Modal System
function ensureModalInfra() {
  if (!document.getElementById('modal-root')) {
    const root = document.createElement('div');
    root.id = 'modal-root';
    document.body.appendChild(root);
  }
}

function mountModal({ title='Atenção', html='', buttons=[], dismissible=true }) {
  ensureModalInfra();
  return new Promise((resolve, reject) => {
    const root = document.getElementById('modal-root');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    
    const box = document.createElement('div');
    box.className = 'modal-box';
    box.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="modal-close" aria-label="Fechar">&times;</button>
      </div>
      <div class="modal-body">${html}</div>
      <div class="modal-footer"></div>
    `;
    
    const footer = box.querySelector('.modal-footer');
    buttons.forEach(btn => {
      const el = document.createElement('button');
      el.className = btn.variant === 'primary' ? 'btn-primary' : 'btn-ghost';
      el.type = 'button';
      el.innerHTML = btn.icon ? `<i class="${btn.icon}"></i> ${btn.text}` : btn.text;
      el.onclick = () => close('resolve', btn.value);
      footer.appendChild(el);
    });
    
    function close(kind='resolve', val=null) {
      overlay.removeEventListener('click', onOverlay);
      document.removeEventListener('keydown', onEsc);
      root.removeChild(overlay);
      kind === 'resolve' ? resolve(val) : reject(val);
    }
    
    function onOverlay(e) { 
      if (!dismissible) return; 
      if (e.target === overlay) close('reject', null); 
    }
    
    function onEsc(e) { 
      if (e.key === 'Escape' && dismissible) close('reject', null); 
    }
    
    overlay.appendChild(box);
    root.appendChild(overlay);
    overlay.addEventListener('click', onOverlay);
    document.addEventListener('keydown', onEsc);
    box.querySelector('.modal-close').onclick = () => close('reject', null);
    
    setTimeout(() => {
      const focusEl = box.querySelector('input,select,textarea,button.btn-primary') || box;
      focusEl.focus?.();
    }, 10);
  });
}

function uiAlert(message, title='Atenção') {
  return mountModal({
    title,
    html: `<p style="line-height:1.55">${String(message).replaceAll('\n','<br>')}</p>`,
    buttons: [{text:'OK', variant:'primary', value:true}]
  });
}

function uiConfirm(message, title='Confirmar') {
  return mountModal({
    title,
    html: `<p style="line-height:1.55">${String(message).replaceAll('\n','<br>')}</p>`,
    buttons: [
      {text:'Cancelar', variant:'ghost', value:false},
      {text:'Confirmar', variant:'primary', value:true}
    ]
  });
}

function uiForm(title='Formulário', fields=[], submitLabel='Confirmar') {
  ensureModalInfra();
  const id = 'f_' + Math.random().toString(36).slice(2,8);
  
  const body = fields.map(f => {
    if (f.type === 'textarea') {
      return `<div class="form-row"><label>${f.label||f.name}</label><textarea name="${f.name}" placeholder="${f.placeholder||''}">${f.value||''}</textarea></div>`;
    }
    if (f.type === 'select') {
      const opts = (f.options||[]).map(o => `<option value="${o.value}" ${o.value==f.value?'selected':''}>${o.label}</option>`).join('');
      return `<div class="form-row"><label>${f.label||f.name}</label><select name="${f.name}">${opts}</select></div>`;
    }
    return `<div class="form-row"><label>${f.label||f.name}</label><input type="${f.type||'text'}" name="${f.name}" placeholder="${f.placeholder||''}" value="${f.value||''}" ${f.required?'required':''}/></div>`;
  }).join('');
  
  const html = `<form id="${id}" class="modal-form">${body}</form>`;
  
  return mountModal({
    title, html, dismissible: false,
    buttons: [
      {text:'Cancelar', variant:'ghost', value:null},
      {text:submitLabel, variant:'primary', value:'_submit_'}
    ]
  }).then(v => {
    if (v === '_submit_') {
      const form = document.getElementById(id);
      const data = {};
      fields.forEach(f => {
        const el = form.querySelector(`[name="${f.name}"]`);
        data[f.name] = el ? el.value : null;
      });
      return data;
    }
    return null;
  });
}

// Layout Functions
function toggleSidebar(force) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (!sidebar || !overlay) return;
  
  const willShow = typeof force === 'boolean' ? force : !sidebar.classList.contains('active');
  sidebar.classList.toggle('active', willShow);
  overlay.classList.toggle('active', willShow);
}

function toggleInstanceMenu(force) {
  const dd = document.getElementById('instanceDropdown');
  const arrow = document.getElementById('instanceArrow');
  if (!dd) return;
  
  const willShow = typeof force === 'boolean' ? force : !dd.classList.contains('active');
  dd.classList.toggle('active', willShow);
  if (arrow) arrow.classList.toggle('active', willShow);
}

// User Management
async function loadUsers() {
  try {
    AppState.users = await apiCall('/users');
  } catch (error) {
    AppState.users = [];
  }
}

function getCurrentUser() {
  return AppState.users.find(u => u.id === AppState.currentUserId) || null;
}

async function userNew() {
  const v = await uiForm('Novo Usuário', [
    {name:'name', label:'Nome / Apelido', type:'text', required:true, placeholder:'Ex.: Comercial'},
    {name:'username', label:'Usuário (login)', type:'text', required:true, placeholder:'ex.: comercial01'},
    {name:'password', label:'Senha', type:'password', required:true, placeholder:'••••••••'}
  ], 'Criar');
  
  if (!v) return;
  
  try {
    const user = await apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(v)
    });
    
    AppState.users.push(user);
    AppState.currentUserId = user.id;
    AppState.currentUser = user;
    renderUserUI();
    changeTab('dashboard');
  } catch (error) {
    // Error already handled by apiCall
  }
}

async function userEditActive() {
  const u = getCurrentUser();
  if (!u) {
    await uiAlert('Nenhum usuário selecionado.');
    return;
  }
  
  const v = await uiForm('Configurar Usuário', [
    {name:'name', label:'Nome / Apelido', type:'text', value:u.name, required:true},
    {name:'username', label:'Usuário (login)', type:'text', value:u.username, required:true},
    {name:'password', label:'Senha', type:'password', value:u.password, required:true}
  ], 'Salvar');
  
  if (!v) return;
  
  try {
    const updatedUser = await apiCall(`/users/${u.id}`, {
      method: 'PUT',
      body: JSON.stringify(v)
    });
    
    const userIndex = AppState.users.findIndex(user => user.id === u.id);
    if (userIndex >= 0) {
      AppState.users[userIndex] = updatedUser;
      AppState.currentUser = updatedUser;
    }
    
    renderUserUI();
  } catch (error) {
    // Error already handled by apiCall
  }
}

function selectUser(id) {
  AppState.currentUserId = id;
  AppState.currentUser = AppState.users.find(u => u.id === id);
  renderUserUI();
  toggleInstanceMenu(false);
  changeTab('dashboard');
}

function renderUserUI() {
  const nameEl = document.getElementById('currentInstanceName');
  const typeEl = document.getElementById('currentInstanceType');
  const listEl = document.getElementById('instanceList');
  
  if (!nameEl || !typeEl || !listEl) return;
  
  const u = getCurrentUser();
  nameEl.textContent = u ? u.name : 'Sem usuário';
  typeEl.textContent = u ? '@' + u.username : '—';
  
  listEl.innerHTML = '';
  
  if (!AppState.users.length) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:16px 20px;color:#64748b;font-size:13px;';
    empty.textContent = 'Nenhum usuário criado.';
    listEl.appendChild(empty);
    return;
  }
  
  AppState.users.forEach(us => {
    const item = document.createElement('div');
    item.className = 'instance-item' + (us.id === AppState.currentUserId ? ' active' : '');
    item.onclick = () => selectUser(us.id);
    item.innerHTML = `
      <div class="instance-avatar-small">
        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=faces" alt="Avatar">
        <div class="status-dot ${us.id === AppState.currentUserId ? 'active' : 'offline'}"></div>
      </div>
      <div class="instance-details">
        <div class="name">${esc(us.name)}</div>
        <div class="type">@${esc(us.username)}</div>
      </div>
      ${us.id === AppState.currentUserId ? '<i class="fas fa-check instance-check"></i>' : ''}
    `;
    listEl.appendChild(item);
  });
}

// Router
function changeTab(tabName, el) {
  // Mark nav active
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
  
  const container = document.getElementById('mainContainer');
  if (!container) return;
  
  const user = getCurrentUser();
  
  if (tabName === 'dashboard') {
    renderDashboard(user);
  } else if (tabName === 'numbers') {
    renderNumbers(user);
  } else if (tabName === 'messages') {
    renderMessages(user);
  } else if (tabName === 'campaigns') {
    renderCampaigns(user);
  } else {
    container.innerHTML = renderPlaceholder(getTabTitle(tabName));
  }
  
  if (window.innerWidth <= 768) toggleSidebar(false);
}

function getTabTitle(tabName) {
  const titles = {
    'contacts': 'Contatos',
    'groups': 'Gerenciar Grupos',
    'finances': 'Finanças',
    'settings': 'Configurações do Sistema',
    'macros': 'Gerenciar Macros',
    'chatbot': 'Configurar Chatbot',
    'schedules': 'Agendamentos',
    'reports': 'Relatórios e Analytics'
  };
  return titles[tabName] || 'Página em Desenvolvimento';
}

// Render Functions
function renderPlaceholder(titulo) {
  return `
    <div class="header">
      <h1><i class="fas fa-wrench"></i> ${esc(titulo)}</h1>
    </div>
    <div style="text-align:center;padding:60px 20px;background:rgba(255,255,255,.95);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.1);">
      <i class="fas fa-code" style="font-size:64px;color:#9ca3af;margin-bottom:20px;"></i>
      <h2 style="margin:0 0 10px 0;color:#4b5563;">Em construção</h2>
      <p style="margin:0;color:#6b7280;">Conteúdo será adicionado nas próximas versões.</p>
    </div>
  `;
}

async function renderDashboard(user) {
  const container = document.getElementById('mainContainer');
  
  if (!user) {
    container.innerHTML = `
      <div class="header">
        <h1><i class="fas fa-chart-pie"></i> Dashboard</h1>
      </div>
      <div style="text-align:center;padding:60px 20px;background:rgba(255,255,255,.95);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.1);">
        <i class="fas fa-user-slash" style="font-size:64px;color:#9ca3af;margin-bottom:20px;"></i>
        <h2 style="margin:0 0 10px 0;color:#4b5563;">Nenhum usuário selecionado</h2>
        <p style="margin:0;color:#6b7280;">Crie ou selecione um usuário no rodapé.</p>
      </div>
    `;
    return;
  }
  
  try {
    const dashboardData = await apiCall(`/users/${user.id}/dashboard`);
    const metrics = dashboardData.metrics;
    
    container.innerHTML = `
      <div class="header">
        <h1><i class="fas fa-chart-pie"></i> Dashboard — ${esc(user.name)}</h1>
      </div>

      <div class="dashboard-metrics">
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-title">Usuário ativo</div>
            <div class="metric-icon"><i class="fas fa-user"></i></div>
          </div>
          <div class="metric-value">${esc(user.username)}</div>
          <div class="metric-subtitle">logado</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-title">Números conectados</div>
            <div class="metric-icon"><i class="fas fa-phone"></i></div>
          </div>
          <div class="metric-value">${metrics.total_instances}</div>
          <div class="metric-subtitle">${metrics.active_instances} ativos</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-title">Conversas ativas</div>
            <div class="metric-icon"><i class="fas fa-comments"></i></div>
          </div>
          <div class="metric-value">${metrics.total_conversations}</div>
          <div class="metric-subtitle">${metrics.unread_messages} não lidas</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-title">Campanhas</div>
            <div class="metric-icon"><i class="fas fa-bullhorn"></i></div>
          </div>
          <div class="metric-value">${metrics.active_campaigns}</div>
          <div class="metric-subtitle">ativas</div>
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = renderPlaceholder('Dashboard - Erro ao carregar dados');
  }
}

async function renderNumbers(user) {
  const container = document.getElementById('mainContainer');
  
  if (!user) {
    container.innerHTML = `
      <div class="header">
        <h1><i class="fas fa-phone"></i> Números Conectados</h1>
      </div>
      <div style="text-align:center;padding:60px 20px;background:rgba(255,255,255,.95);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.1);">
        <i class="fas fa-user-slash" style="font-size:64px;color:#9ca3af;margin-bottom:20px;"></i>
        <h2 style="margin:0 0 10px 0;color:#4b5563;">Nenhum usuário selecionado</h2>
        <p style="margin:0;color:#6b7280;">Crie ou selecione um usuário no rodapé.</p>
      </div>
    `;
    return;
  }
  
  try {
    const instances = await apiCall(`/users/${user.id}/instances`);
    const sortedInstances = instances.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    
    container.innerHTML = `
      <div class="header">
        <h1><i class="fas fa-phone"></i> Números Conectados</h1>
        <button class="btn-primary" onclick="numbersNew()"><i class="fas fa-plus"></i> Conectar Número</button>
      </div>

      <div class="content-grid">
        ${sortedInstances.length ? sortedInstances.map(n => numberCard(n)).join('') :
          '<div style="grid-column:1/-1">' + emptyCard('Nenhum número cadastrado') + '</div>'}
      </div>
    `;
  } catch (error) {
    container.innerHTML = renderPlaceholder('Números - Erro ao carregar dados');
  }
}

function emptyCard(text) {
  return `
    <div class="content-card">
      <div class="card-header"><h3 class="card-title">${esc(text)}</h3></div>
      <p class="card-subtitle">Crie um número clicando em "Conectar Número".</p>
    </div>
  `;
}

function numberCard(n) {
  const statusClass = n.status === 'active' ? 'status-active' : (n.status === 'pending' ? 'status-pending' : 'status-offline');
  const statusText = n.status === 'active' ? 'Online' : (n.status === 'pending' ? 'Aguardando' : 'Offline');
  const msgsToday = n.metrics?.today ?? 0;
  const groups = n.metrics?.groups ?? 0;
  const lastAccess = n.last_access ? formatTime(n.last_access) : '—';

  return `
    <div class="content-card">
      <div class="card-status ${statusClass}">${statusText}</div>
      <div class="card-header">
        <div>
          <h3 class="card-title">${esc(n.name || '(sem apelido)')} ${n.phone ? `• ${esc(n.phone)}` : ''}</h3>
          <p class="card-subtitle">Criado há ${timeAgo(n.created_at)} • Último acesso ${esc(lastAccess)}</p>
        </div>
      </div>

      <div class="metric-breakdown">
        <div class="breakdown-item"><span class="breakdown-label">Mensagens hoje</span><span class="breakdown-value">${msgsToday}</span></div>
        <div class="breakdown-item"><span class="breakdown-label">Grupos ativos</span><span class="breakdown-value">${groups}</span></div>
      </div>

      <div class="card-actions" style="display:flex;gap:8px;margin-top:15px;">
        <button class="btn-action btn-edit" onclick="numbersEdit('${n.id}')"><i class="fas fa-cog"></i> Configurar</button>
        ${n.status !== 'active'
          ? `<button class="btn-action btn-connect" onclick="numbersReconnect('${n.id}')"><i class="fas fa-link"></i> Reconectar</button>`
          : `<button class="btn-action btn-delete" onclick="numbersDisconnect('${n.id}')"><i class="fas fa-unlink"></i> Desconectar</button>`}
        <button class="btn-action btn-delete" onclick="numbersRemove('${n.id}')"><i class="fas fa-trash"></i> Remover</button>
      </div>
    </div>
  `;
}

// Instance Management
async function numbersNew() {
  const u = getCurrentUser();
  if (!u) {
    await uiAlert('Selecione ou crie um usuário primeiro.');
    return;
  }
  
  const v = await uiForm('Conectar Número', [
    {name:'name', label:'Apelido', type:'text', required:true, placeholder:'Ex.: Comercial 01'},
    {name:'phone', label:'Telefone (com DDI/DDD)', type:'text', required:true, placeholder:'+55 31 99999-0000'}
  ], 'Conectar');
  
  if (!v) return;
  
  try {
    await apiCall(`/users/${u.id}/instances`, {
      method: 'POST',
      body: JSON.stringify(v)
    });
    
    await uiAlert('Número criado.\nGere o QR Code em "Reconectar" para finalizar a conexão.', 'Conexão pendente');
    renderNumbers(u);
  } catch (error) {
    // Error already handled by apiCall
  }
}

async function numbersEdit(id) {
  const u = getCurrentUser();
  if (!u) return;
  
  try {
    const instances = await apiCall(`/users/${u.id}/instances`);
    const n = instances.find(x => x.id === id);
    if (!n) return;
    
    const v = await uiForm('Configurar Número', [
      {name:'name', label:'Apelido', type:'text', value:n.name, required:true},
      {name:'phone', label:'Telefone', type:'text', value:n.phone, required:true}
    ], 'Salvar');
    
    if (!v) return;
    
    await apiCall(`/users/${u.id}/instances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(v)
    });
    
    renderNumbers(u);
  } catch (error) {
    // Error already handled by apiCall
  }
}

async function numbersReconnect(id) {
  const u = getCurrentUser();
  if (!u) return;
  
  const ok = await uiConfirm('Gerar novo QR Code e marcar como Online?');
  if (!ok) return;
  
  try {
    await apiCall(`/users/${u.id}/instances/${id}/reconnect`, {
      method: 'POST'
    });
    renderNumbers(u);
  } catch (error) {
    // Error already handled by apiCall
  }
}

async function numbersDisconnect(id) {
  const u = getCurrentUser();
  if (!u) return;
  
  const ok = await uiConfirm('Desconectar este número (ficará Offline)?');
  if (!ok) return;
  
  try {
    await apiCall(`/users/${u.id}/instances/${id}/disconnect`, {
      method: 'POST'
    });
    renderNumbers(u);
  } catch (error) {
    // Error already handled by apiCall
  }
}

async function numbersRemove(id) {
  const u = getCurrentUser();
  if (!u) return;
  
  const ok = await uiConfirm('Remover definitivamente este número?');
  if (!ok) return;
  
  try {
    await apiCall(`/users/${u.id}/instances/${id}`, {
      method: 'DELETE'
    });
    renderNumbers(u);
  } catch (error) {
    // Error already handled by apiCall
  }
}

// Messages System
async function renderMessages(user) {
  const container = document.getElementById('mainContainer');
  
  if (!user) {
    container.innerHTML = `
      <div class="header">
        <h1><i class="fas fa-comments"></i> Central de Mensagens</h1>
      </div>
      <div style="text-align:center;padding:60px 20px;background:rgba(255,255,255,.95);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.1);">
        <i class="fas fa-user-slash" style="font-size:64px;color:#9ca3af;margin-bottom:20px;"></i>
        <h2 style="margin:0 0 10px 0;color:#4b5563;">Nenhum usuário selecionado</h2>
        <p style="margin:0;color:#6b7280;">Crie ou selecione um usuário no rodapé.</p>
      </div>
    `;
    return;
  }
  
  try {
    const [conversations, instances] = await Promise.all([
      apiCall(`/users/${user.id}/conversations`),
      apiCall(`/users/${user.id}/instances`)
    ]);
    
    container.innerHTML = `
      <div class="header">
        <h1><i class="fas fa-comments"></i> Central de Mensagens</h1>
        <button class="btn-primary" onclick="newConversationPrompt()">
          <i class="fas fa-plus"></i> Nova Conversa
        </button>
      </div>

      <div style="display:flex; gap:0; background: rgba(255,255,255,.95); border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.1); height:78vh;">
        <!-- Lista -->
        <div style="width:380px; border-right:1px solid #e5e7eb; display:flex; flex-direction:column; min-width:320px;">
          <div style="padding:16px 18px; border-bottom:1px solid #e5e7eb; background:#f8fafc;">
            <h3 style="margin:0; font-size:16px; color:#1f2937;">Conversas</h3>
            <p style="margin:6px 0 0 0; font-size:12px; color:#64748b;">${conversations.filter(c => c.unread > 0).length} não lidas</p>
          </div>
          <div style="flex:1; overflow-y:auto;">
            ${conversations.length ? conversations.map(c => conversationListItem(c, instances)).join('') : '<div style="padding:20px;color:#64748b;font-size:13px;">Nenhuma conversa</div>'}
          </div>
        </div>

        <!-- Chat -->
        <div style="flex:1; display:flex; flex-direction:column; min-width:500px;">
          <div style="padding:18px; border-bottom:1px solid #e5e7eb; background:#f8fafc;">
            <h3 style="margin:0; font-size:16px; color:#1f2937;">Selecione uma conversa</h3>
            <p style="margin:2px 0 0 0; font-size:12px; color:#64748b;">Crie ou selecione uma conversa na coluna à esquerda.</p>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = renderPlaceholder('Mensagens - Erro ao carregar dados');
  }
}

function conversationListItem(c, instances) {
  const badge = c.unread > 0 ? `<span style="background:#ef4444;color:#fff;font-size:10px;padding:2px 6px;border-radius:10px;">${c.unread}</span>` : '';
  const initials = (c.name || '?').split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() || '?';
  const inst = instances.find(i => i.id === c.instance_id);
  const instName = inst ? inst.name : '—';
  const time = c.updated_at ? formatTime(c.updated_at) : '--:--';
  const last = esc(c.messages?.slice(-1)[0]?.text || '');
  
  return `
    <div style="display:flex; align-items:center; padding:14px 16px; cursor:pointer; border-bottom:1px solid #f1f5f9;">
      <div style="width:44px;height:44px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;margin-right:10px;">${initials}</div>
      <div style="flex:1;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-size:14px; color:#1f2937; font-weight:600;">${esc(c.name || 'Sem nome')}</h4>
          <span style="font-size:11px; color:#64748b;">${time}</span>
        </div>
        <p style="margin:2px 0 0 0; font-size:12px; color:#6b7280; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${last}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
          <span style="font-size:10px; color:#64748b;">${esc(instName)}</span>
          ${badge}
        </div>
      </div>
    </div>
  `;
}

async function newConversationPrompt() {
  const u = getCurrentUser();
  if (!u) {
    await uiAlert('Crie/seleciona um usuário primeiro.');
    return;
  }
  
  try {
    const instances = await apiCall(`/users/${u.id}/instances`);
    if (!instances.length) {
      await uiAlert('Crie ao menos um número na aba "Números Conectados".');
      return;
    }
    
    const v = await uiForm('Nova Conversa', [
      {name:'instance_id', label:'Enviar pelo número', type:'select', value: instances[0].id, options: instances.map(i => ({label: `${i.name}${i.phone ? ' • ' + i.phone : ''}`, value: i.id}))},
      {name:'name', label:'Nome do contato', type:'text', required:true, placeholder:'Ex.: João'},
      {name:'phone', label:'Telefone (opcional)', type:'text', placeholder:'+55 31 99999-0000'}
    ], 'Criar');
    
    if (!v) return;
    
    await apiCall(`/users/${u.id}/conversations`, {
      method: 'POST',
      body: JSON.stringify(v)
    });
    
    renderMessages(u);
  } catch (error) {
    // Error already handled by apiCall
  }
}

// Campaigns System
async function renderCampaigns(user) {
  const container = document.getElementById('mainContainer');
  
  if (!user) {
    container.innerHTML = `
      <div class="header">
        <h1><i class="fas fa-bullhorn"></i> Campanhas</h1>
      </div>
      <div style="text-align:center;padding:60px 20px;background:rgba(255,255,255,.95);border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.1);">
        <i class="fas fa-user-slash" style="font-size:64px;color:#9ca3af;margin-bottom:20px;"></i>
        <h2 style="margin:0 0 10px 0;color:#4b5563;">Nenhum usuário selecionado</h2>
        <p style="margin:0;color:#6b7280;">Crie ou selecione um usuário no rodapé.</p>
      </div>
    `;
    return;
  }
  
  try {
    const campaigns = await apiCall(`/users/${user.id}/campaigns`);
    const sortedCampaigns = campaigns.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    
    container.innerHTML = `
      <div class="header">
        <h1><i class="fas fa-bullhorn"></i> Campanhas</h1>
        <button class="btn-primary" onclick="campaignNew()"><i class="fas fa-plus"></i> Nova Campanha</button>
      </div>

      <div class="content-grid">
        ${sortedCampaigns.length ? sortedCampaigns.map(c => campaignCard(c)).join('') :
          '<div style="grid-column:1/-1">' + emptyCard('Nenhuma campanha criada') + '</div>'}
      </div>
    `;
  } catch (error) {
    container.innerHTML = renderPlaceholder('Campanhas - Erro ao carregar dados');
  }
}

function campaignCard(c) {
  const statusClass = c.status === 'active' ? 'status-active' : (c.status === 'draft' ? 'status-pending' : 'status-offline');
  const statusText = c.status === 'active' ? 'Ativa' : (c.status === 'draft' ? 'Rascunho' : 'Concluída');
  
  return `
    <div class="content-card">
      <div class="card-status ${statusClass}">${statusText}</div>
      <div class="card-header">
        <div>
          <h3 class="card-title">${esc(c.name || '(sem nome)')}</h3>
          <p class="card-subtitle">Criada há ${timeAgo(c.created_at)}</p>
        </div>
      </div>

      <div style="margin:15px 0;">
        <p style="font-size:14px;color:#374151;line-height:1.4;">${esc(c.message?.slice(0, 100) || '')}${c.message?.length > 100 ? '...' : ''}</p>
      </div>

      <div class="metric-breakdown">
        <div class="breakdown-item"><span class="breakdown-label">Grupos alvo</span><span class="breakdown-value">${c.target_groups?.length || 0}</span></div>
        <div class="breakdown-item"><span class="breakdown-label">Agendamento</span><span class="breakdown-value">${c.scheduled_at ? formatTime(c.scheduled_at) : 'Imediato'}</span></div>
      </div>

      <div class="card-actions" style="display:flex;gap:8px;margin-top:15px;">
        <button class="btn-action btn-edit" onclick="campaignEdit('${c.id}')"><i class="fas fa-edit"></i> Editar</button>
        <button class="btn-action btn-delete" onclick="campaignRemove('${c.id}')"><i class="fas fa-trash"></i> Remover</button>
      </div>
    </div>
  `;
}

async function campaignNew() {
  const u = getCurrentUser();
  if (!u) {
    await uiAlert('Selecione ou crie um usuário primeiro.');
    return;
  }
  
  try {
    const instances = await apiCall(`/users/${u.id}/instances`);
    if (!instances.length) {
      await uiAlert('Crie ao menos um número na aba "Números Conectados".');
      return;
    }
    
    const v = await uiForm('Nova Campanha', [
      {name:'name', label:'Nome da campanha', type:'text', required:true, placeholder:'Ex.: Promoção de Natal'},
      {name:'message', label:'Mensagem', type:'textarea', required:true, placeholder:'Digite a mensagem que será enviada...'},
      {name:'instance_id', label:'Enviar pelo número', type:'select', value: instances[0].id, options: instances.map(i => ({label: `${i.name}${i.phone ? ' • ' + i.phone : ''}`, value: i.id}))}
    ], 'Criar');
    
    if (!v) return;
    
    await apiCall(`/users/${u.id}/campaigns`, {
      method: 'POST',
      body: JSON.stringify({...v, target_groups: []})
    });
    
    renderCampaigns(u);
  } catch (error) {
    // Error already handled by apiCall
  }
}

async function campaignEdit(id) {
  const u = getCurrentUser();
  if (!u) return;
  
  try {
    const [campaigns, instances] = await Promise.all([
      apiCall(`/users/${u.id}/campaigns`),
      apiCall(`/users/${u.id}/instances`)
    ]);
    
    const c = campaigns.find(x => x.id === id);
    if (!c) return;
    
    const v = await uiForm('Editar Campanha', [
      {name:'name', label:'Nome da campanha', type:'text', value:c.name, required:true},
      {name:'message', label:'Mensagem', type:'textarea', value:c.message, required:true},
      {name:'instance_id', label:'Enviar pelo número', type:'select', value:c.instance_id, options: instances.map(i => ({label: `${i.name}${i.phone ? ' • ' + i.phone : ''}`, value: i.id}))}
    ], 'Salvar');
    
    if (!v) return;
    
    await apiCall(`/users/${u.id}/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify({...v, target_groups: c.target_groups || []})
    });
    
    renderCampaigns(u);
  } catch (error) {
    // Error already handled by apiCall
  }
}

async function campaignRemove(id) {
  const u = getCurrentUser();
  if (!u) return;
  
  const ok = await uiConfirm('Remover definitivamente esta campanha?');
  if (!ok) return;
  
  try {
    await apiCall(`/users/${u.id}/campaigns/${id}`, {
      method: 'DELETE'
    });
    renderCampaigns(u);
  } catch (error) {
    // Error already handled by apiCall
  }
}

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  await loadUsers();
  renderUserUI();
  changeTab('dashboard');

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sidebar-footer')) {
      toggleInstanceMenu(false);
    }
  });
});