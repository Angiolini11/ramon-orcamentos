# Ramon Retoques Automotivos — Orçamentos Digitais

Aplicação web **gratuita e local**, feita para orçamentos presenciais de lanternagem e pintura. Funciona em celular e computador, sem conta, banco de dados nem serviços pagos. Identidade e dados da oficina foram extraídos da logo e do bloco físico fornecidos.

## 1. Como abrir e usar

1. Extraia o arquivo `.zip` inteiro; não retire o `index.html` das pastas `css`, `js` e `assets`.
2. Abra `index.html` no navegador Chrome, Edge ou Safari, ou publique no GitHub Pages (abaixo).
3. Toque em **Novo orçamento** e preencha o **cliente e veículo**.
4. Em **Cliente e veículo**, você pode escolher ou tirar até **10 fotos** do veículo; marque **Incluir fotos no PDF** se desejar anexá-las ao documento.
5. Marque as peças a reparar; informe os tipos de serviço, descrições, valores e, se aplicável, observações.
6. Em **Valores**, informe eventuais serviços gerais, desconto e condições de pagamento.
7. Em **Revisar e PDF**, confira e use **Gerar PDF**. Será gerado um documento A4 com a logo real, dados, tabela de serviços, valores, validade e condições. O arquivo pode ser enviado manualmente ao cliente.
8. Em **Histórico**, você pode abrir, editar, duplicar, excluir ou baixar outro PDF.

### Como funcionam os valores

- **Os valores são determinados pelo profissional** que está avaliando o carro. Não há tabela nem precificação automática.
- Digite, por exemplo, `1.250,50` para significar **R$ 1.250,50**.
- Valor não informado = **A definir**; orçamentos com pendências são identificados no PDF como **preliminares**.
- Quando não houver cobrança de material, marque **Sem cobrança de material** na peça.
- Valor à vista e valor a prazo são **alternativas de pagamento**: não entram novamente na soma do total.
- Os totais são calculados com **centavos inteiros**, incluindo descontos.

## 2. Como preservar os dados

Os dados de texto ficam no `localStorage` e as fotos compactadas ficam no **IndexedDB**, ambos deste **navegador e aparelho**, não na nuvem. Eles **não são sincronizados** entre PC e celular. Apagar dados do navegador, usar modo anônimo ou trocar de aparelho pode eliminar os registros.

- Clique em **Histórico → Backup**, ou **Início → Exportar backup**.
- Guarde o arquivo `.json` fora do dispositivo, em local seguro. **O backup atualizado inclui também as fotos** (o arquivo pode ficar maior).
- Para recuperar, escolha **Importar** no Histórico. **A importação substitui os registros e as configurações existentes** após confirmação.
- Como orçamentos incluem dados pessoais, proteja o telefone/computador e os backups.

Os números dos orçamentos são identificadores **locais**, não uma sequência exclusiva entre dispositivos.

## 3. Como publicar de graça no GitHub Pages

1. Crie um repositório no GitHub, por exemplo `ramon-orcamentos`.
2. Na raiz do repositório, envie `index.html` e as três pastas `css`, `js` e `assets` (incluindo os arquivos dentro delas).
3. Acesse **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**, a branch **main** e a pasta **/(root)**. Salve.
5. O site terá uma URL semelhante a `https://SEU-USUARIO.github.io/ramon-orcamentos/`.
6. Abra o endereço no celular e, se quiser, adicione à tela inicial pelo menu do navegador.

Todos os caminhos são relativos; funciona em repositórios com subpasta. **Hospedar no GitHub Pages não salva dados em nuvem**: a URL distribui somente o site. Cada navegador continua com seus próprios orçamentos.

## 4. PDF e acesso à internet

O PDF fica com uma página sempre que couber. Quando **Incluir fotos no PDF** estiver marcado, ele acrescenta folhas de registro fotográfico (até duas imagens por folha), após o orçamento.

O gerador de PDF vem no próprio projeto (`js/pdf.js`), **sem CDNs nem bibliotecas externas**. Produz PDFs A4 com texto selecionável e logo incorporada. **O layout compacto tenta caber em uma página em orçamentos comuns**; quando o conteúdo é muito longo, o PDF continua em páginas adicionais para não cortar informações. Não cria uma página extra só para repetir a data de validade. O site em si não precisa de internet para gerar um PDF depois de carregado. O site no GitHub Pages precisa de acesso para **abrir a página**; não há service worker, portanto não é garantido que a página volte a abrir sem conexão.

No celular, o botão **Compartilhar PDF** usa o compartilhamento nativo quando disponível. Se não for possível, o PDF é baixado. **Mensagem no WhatsApp** abre uma conversa com texto genérico; o PDF deve ser anexado manualmente.

## 5. O que está implementado

- Fluxo guiado em quatro etapas, adaptado para celular.
- Cliente, telefone, documento e dados do carro.
- Lista completa de peças do bloco físico, lados distintos e itens personalizados.
- Múltiplos tipos de intervenção, descrição livre, valor de serviços, materiais e observação.
- Serviços gerais, desconto, valores à vista/a prazo, formas de pagamento e validade.
- Cálculos automáticos, confirmação de condições divergentes e indicação de valores pendentes.
- PDF paginado A4 com logo, informações da oficina e valores.
- Autosalvamento, histórico local, pesquisa, edição, duplicação, exclusão e backup JSON **com fotos**.
- Até 10 fotos opcionais do veículo, com prévia, exclusão e compressão; opção individual para anexar ou não ao PDF.
- Configurações comerciais e possibilidade de trocar/restaurar a logo.

**Fora desta versão:** fotografias específicas por peça, assinaturas digitais, login, ordens de serviço, banco de dados online, sincronização entre aparelhos, envio automático de arquivos pelo WhatsApp e relatórios financeiros. Essas funções podem ser acrescentadas depois.

## 6. Estrutura de arquivos

```
ramon-orcamentos/
├── index.html
├── css/style.css
├── js/app.js
├── js/pdf.js
├── js/logo-data.js
├── assets/logo-ramon.png
├── assets/favicon.svg
└── README.md
```

`logo-data.js` incorpora uma cópia otimizada da **logo fornecida**, permitindo que a imagem seja incluída no PDF mesmo quando o site é aberto localmente pelo `index.html`. A imagem PNG original está preservada na pasta `assets/`.

## 7. Fotos — atenção

- As fotos são opcionais e armazenadas só no navegador onde foram adicionadas. Elas **não sincronizam** com outros aparelhos.
- Use o botão **Inserir fotos** para escolher da galeria ou, caso o celular ofereça essa opção, tirar uma foto. Depois você pode revisar e apagar imagens antes de gerar o PDF. Cada arquivo é comprimido para JPEG (máximo de 10 fotos por orçamento).
- A caixa **Incluir fotos no PDF** é desmarcada por padrão. Com ela desmarcada, nenhuma foto aparece no documento. Marcada, as imagens são anexadas após o orçamento e podem gerar páginas extras.
- Se você limpar os dados do site no navegador, poderá perder fotos e orçamentos. **Faça backups frequentes** e guarde o arquivo em lugar seguro.
- Fotos não ficam públicas no GitHub: só os arquivos do site são hospedados lá.

## 8. Padrão da logo no PDF

Ao trocar a logo em **Configurações → Trocar imagem**, o sistema **preserva a proporção e ajusta automaticamente** a imagem a uma área fixa no cabeçalho de todas as páginas do PDF (inclusive anexos fotográficos). Logos horizontais, quadradas e verticais são aceitas; nenhuma pode invadir o título ou os dados do orçamento. A prévia em Configurações também contém a logo dentro de um espaço limitado. A imagem não será esticada nem cortada.

No GitHub, atualize `index.html`, `css/style.css`, `js/app.js` e `js/pdf.js` para aplicar a correção. O `index.html` inclui parâmetros de versão para evitar o uso de CSS e JS antigos guardados em cache. A logo configurada no navegador e os orçamentos existentes permanecem salvos.
