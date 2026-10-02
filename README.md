# 🍕 Bella Massa — Sistema de Pizzaria

Sistema completo de gestão para a pizzaria **Bella Massa**, com totem de autoatendimento, painel do chef, garçom, caixa e dashboard gerencial.

🔗 **Site em produção:** [pizzaria-cavaleiros.vercel.app](https://pizzaria-cavaleiros.vercel.app)

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

## 👥 Perfis de Acesso

| Perfil | Acesso | Função |
|--------|--------|--------|
| 👨‍🍳 **Chef** | `chef.html` | Vê fila de pedidos, marca como pronta |
| 🛎️ **Garçom** | `garcom.html` | Vê pedidos prontos, marca como entregue |
| 💳 **Caixa** | `caixa.html` | Vê contas das mesas, confirma pagamentos |
| 📊 **Gerente** | `dashboard.html` + `cadastro.html` | Dashboard + cadastro de funcionários |
| 📱 **Cliente** | `index.html` | Tablet da mesa (sem login) |

---

## 🔐 Segurança

- **Firebase Authentication** (e-mail + senha)
- **Firestore Rules** (regras por perfil)
- **Route Guards** (bloqueio entre telas)
- **Log de auditoria** (toda ação é registrada)
- **Verificação de perfil no Firestore** (não é só pelo e-mail)

---

## 📁 Estrutura do Projeto
