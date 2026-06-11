# Goianita Novo de novo - Comodato & Consignação
> **Base de Conhecimento do Projeto**
> - **Login da Planilha Google**: `goianitabr@gmail.com`
> - **Link da Planilha**: [Planilha de Controle](https://docs.google.com/spreadsheets/d/1M7vl4afuq1lziBeq2QUZ3ieEN3HyGTW7BqUCmfXp3_8/edit?gid=0#gid=0)

---

## 1. Como Funciona a Sincronização com a Planilha?

A sincronização entre o aplicativo local e a Planilha Google ocorre de forma **assíncrona** e automática em background sempre que um cadastro é criado, alterado ou excluído. 

### Fluxo Técnico:
1. **Gravação Local**: Qualquer operação (adicionar cliente, cadastrar produto, registrar pagamento, simular venda) atualiza a base no `localStorage` do navegador do usuário.
2. **Exportação de Payload**: O aplicativo empacota toda a base local (`clientes`, `produtos` e `pagamentos`) em um JSON estruturado.
3. **Envio via Webhook**: O aplicativo faz uma requisição `HTTP POST` para o endpoint do **Google Apps Script** implantado na planilha do cliente.
4. **Atualização das Abas**: O script do Google Apps Script intercepta o payload JSON e reescreve automaticamente as abas correspondentes (**Clientes**, **Produtos**, **Pagamentos**), mantendo a planilha 100% atualizada sem necessidade de intervenção humana.
5. **Comportamento Off-line**: A chamada é feita com `mode: 'no-cors'` e em background. Se a rede falhar, o app continua funcionando normalmente salvando as alterações locais.

---

## 2. Configurando o Google Apps Script (Sincronização Real)

Para que a planilha sincronize de fato com as alterações do app, siga estes passos:

1. Abra a planilha [https://docs.google.com/spreadsheets/d/1M7vl4afuq1lziBeq2QUZ3ieEN3HyGTW7BqUCmfXp3_8/edit](https://docs.google.com/spreadsheets/d/1M7vl4afuq1lziBeq2QUZ3ieEN3HyGTW7BqUCmfXp3_8/edit) logado com a conta `goianitabr@gmail.com`.
2. No menu superior, clique em **Extensões** > **Apps Script**.
3. Apague qualquer código existente e cole o código abaixo:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Sincronizar Clientes
    if (data.clientes) {
      var sheetCli = getOrCreateSheet(ss, "Clientes");
      sheetCli.clear();
      sheetCli.appendRow(["ID", "Nome", "CPF", "Telefone", "Email", "Tipo PIX", "Chave PIX", "Comissão Padrão (%)", "Data Cadastro"]);
      data.clientes.forEach(function(c) {
        sheetCli.appendRow([c.id, c.nome, c.cpf, c.telefone, c.email, c.chavePixType, c.chavePix, c.comissaoPadrao, c.dataCadastro]);
      });
    }
    
    // 2. Sincronizar Produtos
    if (data.produtos) {
      var sheetProd = getOrCreateSheet(ss, "Produtos");
      sheetProd.clear();
      sheetProd.appendRow(["ID", "SKU", "Nome", "Descrição", "Categoria", "Subcategoria", "Marca", "EAN", "Conservação", "Preço Venda", "Comissão (%)", "ID Fornecedor", "Data Entrada", "Data Limite", "Status", "Obs Internas"]);
      data.produtos.forEach(function(p) {
        sheetProd.appendRow([p.id, p.sku, p.nome, p.descricao, p.categoria, p.subcategoria, p.marca, p.ean, p.conservacao, p.precoVenda, p.comissao, p.clienteId, p.dataEntrada, p.dataLimite, p.status, p.obsInternas]);
      });
    }
    
    // 3. Sincronizar Pagamentos
    if (data.pagamentos) {
      var sheetPag = getOrCreateSheet(ss, "Pagamentos");
      sheetPag.clear();
      sheetPag.appendRow(["ID", "ID Cliente", "Valor (R$)", "Data", "Chave PIX", "Status", "Comprovante"]);
      data.pagamentos.forEach(function(p) {
        sheetPag.appendRow([p.id, p.clienteId, p.valor, p.data, p.chavePix, p.status, p.comprovante]);
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}
```

4. Clique no ícone de salvar (disquete).
5. Clique no botão **Implantar** (no canto superior direito) > **Nova implantação**.
6. Selecione o tipo de implantação: **App da Web**.
7. Preencha as configurações:
   - **Descrição**: Sincronizador Goianita Novo de novo
   - **Executar como**: Eu (seu e-mail `goianitabr@gmail.com`)
   - **Quem tem acesso**: Qualquer pessoa (isso é vital para permitir o envio do app cliente-side)
8. Clique em **Implantar**. Autorize as permissões da sua conta caso o Google solicite.
9. Copie a **URL do URL do aplicativo da Web** gerada.
10. Substitua esta URL no arquivo `js/db.js` na variável `webAppUrl` (linha ~290).

---

## 3. Preparando para Publicação em Produção e GitHub

Como este é um aplicativo SPA (Single Page Application) estático escrito em Vanilla HTML, CSS e JS, ele pode ser hospedado de forma **totalmente gratuita e segura** em servidores de produção como o **GitHub Pages**, **Vercel** ou **Netlify**.

### Passo a Passo para GitHub:

1. **Inicializar Repositório Git**:
   Caso ainda não tenha inicializado o repositório git na pasta `consignacao-app`:
   ```bash
   git init
   git add .
   git commit -m "feat: release MVP Goianita Novo de novo com importador e novas logos"
   ```

2. **Criar Repositório no GitHub**:
   - Vá para o seu GitHub e crie um novo repositório chamado `goianita-novo-de-novo`.
   - Adicione a URL remota no seu terminal:
     ```bash
     git remote add origin https://github.com/SEU_USUARIO/goianita-novo-de-novo.git
     git branch -M main
     git push -u origin main
     ```

3. **Publicar no GitHub Pages (Produção)**:
   - No painel do seu repositório no GitHub, vá em **Settings** > **Pages**.
   - Em **Build and deployment** > **Source**, selecione **Deploy from a branch**.
   - Em **Branch**, selecione `main` e a pasta `/` (root), depois clique em **Save**.
   - Em alguns minutos, seu app estará no ar no link: `https://SEU_USUARIO.github.io/goianita-novo-de-novo/`.

---

## 4. Estrutura dos Dados para Importação Planilha

### Clientes/Fornecedores:
| Nome | CPF | Telefone | Email | Tipo Chave PIX | Chave PIX | Comissão Padrão (%) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Maria Edite | 123.456.789-00 | (62) 99988-7766 | maria@gmail.com | CPF | 123.456.789-00 | 20 |

### Produtos Consignados:
| CPF Fornecedor | Nome do Produto | Preço Venda | Comissão | Conservação | Categoria | Descrição | Marca |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 123.456.789-00 | Aparelho Porto Brasil 30 Peças | 399.00 | 20 | Excelente | Cozinha e Mesa | Aparelho completo | Porto Brasil |
