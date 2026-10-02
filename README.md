# 🍕 Bella Massa — Sistema de Pizzaria

Sistema completo de gestão para a pizzaria **Bella Massa**, com totem de autoatendimento, painel do chef, garçom, caixa e dashboard gerencial.

🔗 **Site em produção:** [pizzaria-cavaleiros.vercel.app](https://pizzaria-cavaleiros.vercel.app)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## 🎯 Sobre o Projeto

O Seu Giuseppe enfrentava um problema clássico: **comandas de papel** que se perdiam, pedidos errados e clientes insatisfeitos. Este sistema **elimina o papel** e automatiza todo o fluxo do restaurante.

### O que ele resolve

- ✅ Cliente faz o pedido direto no **tablet da mesa**
- ✅ Chef recebe os pedidos **em ordem** com timer visual
- ✅ Garçom é notificado quando a pizza está pronta
- ✅ Caixa vê tudo em tempo real
- ✅ Gerente acompanha **estatísticas** do dia

---

## 👥 Perfis de Acesso

| Perfil | Acesso | Função |
|--------|--------|--------|
| 👨‍🍳 **Chef** | `chef.html` | Vê fila de pedidos, marca como pronta |
| 🛎️ **Garçom** | `garcom.html` | Vê pedidos prontos, marca como entregue |
| 💳 **Caixa** | `caixa.html` | Vê contas das mesas, confirma pagamentos |
| 📊 **Gerente** | `dashboard.html` + `cadastro.html` | Dashboard + cadastro de funcionários |
| 📱 **Cliente** | `index.html` | Tablet da mesa (sem login) |

---

## 🚀 Tecnologias

| Categoria | Tecnologia |
|-----------|------------|
| **Front-end** | HTML5, CSS3, JavaScript (ES Modules) |
| **Autenticação** | Firebase Authentication |
| **Banco de dados** | Firebase Firestore |
| **Gráficos** | Chart.js |
| **Deploy** | Vercel |
| **Versionamento** | Git + GitHub |

---

## 📁 Estrutura do Projeto

```
pizzaria-cavaleiros/
│
├── index.html              ← Tablet do cliente
├── login.html              ← Login dos funcionários
├── cadastro.html           ← Cadastro (só gerente)
├── chef.html               ← Painel do chef
├── garcom.html             ← Painel do garçom
├── caixa.html              ← Painel do caixa
├── dashboard.html          ← Dashboard gerencial
├── README.md
├── firebase.json           ← Configuração do Firebase
├── firestore.rules         ← Regras do Firestore
├── firestore.indexes.json  ← Índices do Firestore
├── .firebaserc             ← Projeto vinculado
├── .gitignore              ← Arquivos ignorados
│
└── src/
    ├── css/
    │   ├── global.css      ← Estilos compartilhados
    │   ├── index.css       ← Tablet do cliente
    │   ├── login.css       ← Tela de login
    │   ├── cadastro.css    ← Tela de cadastro
    │   ├── chef.css        ← Painel do chef
    │   ├── garcom.css      ← Painel do garçom
    │   ├── caixa.css       ← Painel do caixa
    │   └── dashboard.css   ← Dashboard
    │
    ├── js/
    │   ├── firebase-config.js  ← Config do Firebase
    │   ├── dados.js            ← Cardápio + CRUD + helpers
    │   ├── auth.js             ← Route Guard
    │   ├── login.js            ← Lógica de login
    │   ├── cadastro.js         ← Cadastro de funcionários
    │   ├── index.js            ← Lógica do tablet
    │   ├── chef.js             ← Lógica do chef
    │   ├── garcom.js           ← Lógica do garçom
    │   ├── caixa.js            ← Lógica do caixa
    │   └── dashboard.js        ← Lógica do dashboard
    │
    └── img/
        └── bella.png           ← Logo e fundo
```

---

## 🔐 Segurança

- **Firebase Authentication** (e-mail + senha)
- **Firestore Rules** (regras por perfil)
- **Route Guards** (bloqueio entre telas)
- **Log de auditoria** (toda ação é registrada)
- **Verificação de perfil no Firestore** (não é só pelo e-mail)

---

## 🎬 Fluxo do Sistema

```
1. CLIENTE acessa index.html no tablet
   ↓
2. Escolhe nome + mesa + itens
   ↓
3. Envia pedido → Firestore (coleção "pedidos")
   ↓
4. CHEF vê o pedido em chef.html
   ↓
5. Marca como "pronto"
   ↓
6. GARÇOM vê o pedido em garcom.html
   ↓
7. Marca como "entregue"
   ↓
8. TABLET muda automaticamente para tela de pagamento
   ↓
9. Cliente paga (Pix / Cartão / Dinheiro)
   ↓
10. CAIXA confirma o pagamento
    ↓
11. GERENTE vê tudo no dashboard.html
```

---

## 📊 Dashboard

O dashboard do gerente inclui:

- 💰 Faturamento total
- 📦 Total de pedidos
- 🍕 Pizzas vendidas
- 🥤 Bebidas vendidas
- 📈 Ticket médio
- ⏱️ Tempo médio de espera
- 📊 Gráfico de barras (Top 5 pizzas)
- 🥧 Gráfico de rosca (formas de pagamento)
- 📈 Gráfico de linha (faturamento por hora)
- 📊 Gráfico de barras (faturamento por mesa)
- 📋 Resumo detalhado

Tudo atualizado **em tempo real**.

---

## 🧪 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/rkryanx7209/pizzaria-cavaleiros.git
   cd pizzaria-cavaleiros
   ```

2. **Abra com o Live Server do VS Code:**
   - Instale a extensão **Live Server**
   - Clique com botão direito no `index.html` → **Open with Live Server**

3. **Acesse no navegador:**
   ```
   http://127.0.0.1:5501/index.html
   ```

> ⚠️ **Importante:** o Firebase Auth exige que `127.0.0.1` esteja nos **domínios autorizados** do Firebase Console.

---

## 🎨 Design

- **Fonte títulos:** Fraunces (serifada)
- **Fonte corpo:** Poppins / System UI
- **Cores:**
  - 🔴 Vermelho: `#c4302b`
  - 🟢 Verde: `#2f7d4f`
  - 🟡 Dourado: `#e0a21a`
  - ⚫ Escuro: `#1f2a24`
- **Background:** imagem rústica de pizzaria italiana
- **Ícone:** logotipo Bella Massa

---

## 🚀 Deploy

| Serviço | Link |
|---------|------|
| **GitHub** | [github.com/rkryanx7209/pizzaria-cavaleiros](https://github.com/rkryanx7209/pizzaria-cavaleiros) |
| **Vercel** | [pizzaria-cavaleiros.vercel.app](https://pizzaria-cavaleiros.vercel.app) |

O deploy é **automático** — sempre que há um push para a `main`, o Vercel rebuilda o site.

---

## 📝 Licença

Este é um projeto **educacional** desenvolvido para a disciplina de **Programação Front-End** do curso **Técnico em Desenvolvimento de Sistemas** — SESI Pindamonhangaba.

---

## 👥 Autores

- **Ryan** — Desenvolvimento completo

---

## 🎯 Conclusão

O sistema **Bella Massa** resolve o problema real de uma pizzaria com:

- Automação completa do fluxo
- Interface intuitiva para cada perfil
- Segurança real com Firebase
- Dashboard gerencial
- Design profissional

> 💡 *"Não existe segurança no Front-End puro. Existe segurança em regras bem definidas no Back-End."*

---

🍕 **Bom apetite!**
