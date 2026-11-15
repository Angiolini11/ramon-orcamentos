/* Gerador PDF 100% local: desenha texto vetorial selecionável, tabelas paginadas e a logo real incorporada.
   Não requer conexão, bibliotecas externas, impressão ou serviços de terceiros. */
(() => {
'use strict';
const W=595.28,H=841.89,M=42,CW=W-2*M,RED=[.65,.17,.19],DARK=[.13,.15,.18],GRAY=[.40,.44,.49],PALE=[.967,.970,.975],LINE=[.88,.90,.92],WHITE=[1,1,1];
const cps={0x20ac:128,0x201a:130,0x0192:131,0x201e:132,0x2026:133,0x2020:134,0x2021:135,0x02c6:136,0x2030:137,0x0160:138,0x2039:139,0x0152:140,0x017d:142,0x2018:145,0x2019:146,0x201c:147,0x201d:148,0x2022:149,0x2013:150,0x2014:151,0x02dc:152,0x2122:153,0x0161:154,0x203a:155,0x0153:156,0x017e:158,0x0178:159};
function latinByteArray(text){const out=[];for(const c of String(text)){const code=c.codePointAt(0);if(code<256&&(code<128||code>=160))out.push(code);else if(cps[code]!=null)out.push(cps[code]);else out.push(63);}return new Uint8Array(out);}
function ascii(s){return new TextEncoder().encode(String(s));}
function binaryBytes(text){const s=String(text),bytes=new Uint8Array(s.length);for(let i=0;i<s.length;i++)bytes[i]=s.charCodeAt(i)&255;return bytes;}
function concat(...pieces){const len=pieces.reduce((n,v)=>n+v.length,0),result=new Uint8Array(len);let pos=0;for(const p of pieces){result.set(p,pos);pos+=p.length;}return result;}
function pdfEsc(s){let str='';for(const n of latinByteArray(s)){if(n===40||n===41||n===92)str+='\\'+String.fromCharCode(n);else if(n===10||n===13)str+=' ';else str+=String.fromCharCode(n);}return str;}
function parseDataURL(src){const encoded=String(src).split(',')[1];if(!encoded)throw Error('Imagem de logo inválida');const raw=atob(encoded),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;}
const measureCtx=document.createElement('canvas').getContext('2d');
function txtWidth(t,size=10,bold=false){measureCtx.font=`${bold?'bold ':''}${size}px Arial,Helvetica,sans-serif`;return measureCtx.measureText(String(t)).width*1.025;}
function fitText(t,maxW,size=10,bold=false){const src=String(t||'');if(txtWidth(src,size,bold)<=maxW)return src;let out=src;while(out.length>1&&txtWidth(out+'...',size,bold)>maxW)out=out.slice(0,-1);return out+'...';}
function wrap(t,maxWidth,size=9,bold=false){const all=[];for(const original of String(t??'').replace(/\r/g,'').split('\n')){const words=original.split(/\s+/).filter(Boolean);if(!words.length){all.push('');continue;}let line='';for(let word of words){if(!line&&txtWidth(word,size,bold)>maxWidth){let piece='';for(const ch of word){if(piece&&txtWidth(piece+ch,size,bold)>maxWidth){all.push(piece);piece='';}piece+=ch;}line=piece;continue;}if(!line)line=word;else if(txtWidth(line+' '+word,size,bold)<=maxWidth)line+=' '+word;else{all.push(line);line=word;}}if(line)all.push(line);}return all.length?all:[''];}
function val(v){return v==null?'A definir':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v/100);}
function pdfObject(content){return ascii(content+'\n');}
function pdfStream(bytes,attrs=''){return concat(ascii(`<< /Length ${bytes.length} ${attrs} >>\nstream\n`),bytes,ascii('\nendstream\n'));}
function jpegFromImage(img){const maxW=1080;const r=Math.min(1,maxW/img.width),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*r));c.height=Math.max(1,Math.round(img.height*r));const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);return {bytes:parseDataURL(c.toDataURL('image/jpeg',.85)),width:c.width,height:c.height};}
async function getLogo(config){const src=config.logo||window.RAMON_LOGO_DATA;if(!src)return null;try{const img=await new Promise((resolve,reject)=>{const x=new Image();x.onload=()=>resolve(x);x.onerror=()=>reject(Error('Logo não carregada'));x.src=src;});return jpegFromImage(img);}catch(error){console.warn('PDF sem logo: imagem inválida.');return null;}}
class Document{
 constructor(logo,photos=[]){this.logo=logo;this.photos=photos;this.pages=[];this.page=null;}
 addPage(){this.page={commands:[]};this.pages.push(this.page);return this.page;}
 cmd(s){this.page.commands.push(s);}
 color(c){return c.map(x=>Number(x).toFixed(3)).join(' ');}
 rect(x,y,w,h,fill=WHITE,stroke=null){this.cmd(`q ${this.color(fill)} rg ${stroke?this.color(stroke)+' RG 0.55 w ':''}${x.toFixed(2)} ${(H-y-h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${stroke?'B':'f'} Q`);}
 line(x1,y1,x2,y2,color=LINE,width=.65){this.cmd(`q ${this.color(color)} RG ${width.toFixed(2)} w ${x1.toFixed(2)} ${(H-y1).toFixed(2)} m ${x2.toFixed(2)} ${(H-y2).toFixed(2)} l S Q`);}
 text(t,x,y,size=10,opts={}){const bold=!!opts.bold,c=opts.color||DARK,align=opts.align||'left',s=String(t??'');if(align==='right')x-=txtWidth(s,size,bold);else if(align==='center')x-=txtWidth(s,size,bold)/2;this.cmd(`BT /${bold?'F2':'F1'} ${size.toFixed(2)} Tf ${this.color(c)} rg 1 0 0 1 ${x.toFixed(2)} ${(H-y-size).toFixed(2)} Tm (${pdfEsc(s)}) Tj ET`);}
 image(x,y,w,h){if(this.logo)this.cmd(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${(H-y-h).toFixed(2)} cm /Im1 Do Q`);}
 photoImage(index,x,y,w,h){if(!this.photos[index])return;this.cmd(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${(H-y-h).toFixed(2)} cm /Photo${index+1} Do Q`);}
 toBlob(){const objects=[null,null];const put=(v)=>{objects.push(v);return objects.length;};const fontRegular=put(pdfObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'));const fontBold=put(pdfObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'));const imageID=this.logo?put(pdfStream(this.logo.bytes,`/Type /XObject /Subtype /Image /Width ${this.logo.width} /Height ${this.logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`)):null;const photoIDs=this.photos.map(pic=>put(pdfStream(pic.bytes,`/Type /XObject /Subtype /Image /Width ${pic.width} /Height ${pic.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`)));const pageIds=[];for(const p of this.pages){const body=binaryBytes(p.commands.join('\n')+'\n'),contentID=put(pdfStream(body));const resources=`/Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> ${imageID||photoIDs.length?`/XObject << ${imageID?`/Im1 ${imageID} 0 R`:''} ${photoIDs.map((id,n)=>`/Photo${n+1} ${id} 0 R`).join(' ')} >>`:''}`;const pageID=put(pdfObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << ${resources} >> /Contents ${contentID} 0 R >>`));pageIds.push(pageID);}objects[0]=pdfObject('<< /Type /Catalog /Pages 2 0 R >>');objects[1]=pdfObject(`<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(i=>`${i} 0 R`).join(' ')}] >>`);const chunks=[ascii('%PDF-1.4\n%PDFmadeOffline\n')],offset=[0];let len=chunks[0].length;for(let n=0;n<objects.length;n++){offset.push(len);const bytes=concat(ascii(`${n+1} 0 obj\n`),objects[n],ascii('endobj\n'));chunks.push(bytes);len+=bytes.length;}const xrefStart=len;let xref=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;for(const at of offset.slice(1))xref+=`${String(at).padStart(10,'0')} 00000 n \n`;xref+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;chunks.push(ascii(xref));return new Blob(chunks,{type:'application/pdf'});}
}
// Diagramação compacta de A4: aproveita a primeira página, mantendo a paginação
// automática para orçamentos que realmente não caibam em uma folha legível.
const BOTTOM=758;
const COL=[133,164,70,71,73]; // soma = largura útil A4 (511,28 pt)
function panelDetails(primary,fields,width){
  const lines=[];
  wrap(primary||'Não informado',width-24,10,true).forEach(t=>lines.push({t,size:10,bold:true,step:12,color:DARK}));
  for(const detail of fields.filter(Boolean))wrap(detail,width-24,8.1).forEach(t=>lines.push({t,size:8.1,bold:false,step:10.7,color:GRAY}));
  return lines;
}
function drawInfoPanel(doc,x,y,w,h,title,lines){
  doc.rect(x,y,w,h,PALE);
  doc.text(title,x+10,y+7,7.6,{bold:true,color:RED});
  let at=y+22;
  for(let i=0;i<lines.length;i++){const l=lines[i];doc.text(l.t,x+10,at,l.size,{bold:l.bold,color:l.color});at+=l.step;if(i===0)at+=3;}
}
/** Desenha a logo dentro de uma área máxima fixa, sem distorção ou recorte.
 * Isso protege título, linha divisória e dados mesmo com logos quadradas ou verticais.
 */
function drawLogoContained(doc,x,y,maxWidth,maxHeight){
  if(!doc.logo)return;
  const width=Number(doc.logo.width),height=Number(doc.logo.height);
  if(!(width>0&&height>0))return;
  const scale=Math.min(maxWidth/width,maxHeight/height);
  const w=width*scale,h=height*scale;
  doc.image(x+(maxWidth-w)/2,y+(maxHeight-h)/2,w,h);
}
function drawHeader(doc,config,q,utils,first){
  doc.addPage();doc.rect(0,0,W,4.5,RED);
  const y=first?21:18;
  // Área reservada: página 1 = 150×62 pt; demais = 126×55 pt.
  // Nenhuma dimensão da imagem altera as posições dos outros elementos do PDF.
  // Ajuste óptico: a logo fica ligeiramente acima do centro geométrico
  // da área reservada para alinhar visualmente com o bloco de textos à direita.
  if(doc.logo)drawLogoContained(doc,M,y-(first?4:3),first?150:126,first?62:55);
  else doc.text(fitText(config.name||'Ramon Retoques Automotivos',160,12,true),M,y+7,12,{bold:true});
  const rx=first?210:191,aw=W-M-rx;
  doc.text(fitText(config.name||'Ramon Retoques Automotivos',aw,11.7,true),rx,y+1,11.7,{bold:true});
  if(config.responsible)doc.text(fitText(config.responsible,aw,8),rx,y+18,8,{color:GRAY});
  if(config.phone)doc.text(fitText('WhatsApp: '+config.phone,aw,8.5),rx,y+31,8.5);
  if(config.address)wrap(config.address,aw,7.7).slice(0,2).forEach((l,i)=>doc.text(l,rx,y+44+9.2*i,7.7,{color:GRAY}));
  const lineY=first?93:83;
  doc.line(M,lineY,W-M,lineY,RED,1.1);
  if(!first){
    doc.text(`ORÇAMENTO ${q.code}  -  Continuação`,M,91,10.6,{bold:true});
    return 114;
  }
  doc.text('ORÇAMENTO DE LANTERNAGEM E PINTURA',M,100,14.5,{bold:true});
  doc.text(`Nº ${q.code}`,M,125,8.9,{bold:true});
  doc.text(`Data: ${utils.prettyDate(q.date)}`,320,125,8.5,{color:GRAY});
  doc.text(`Validade: ${utils.prettyDate(utils.plusDays(q.date,q.validDays))}`,W-M,125,8.5,{color:GRAY,align:'right'});
  let next=145;
  const summary=utils.sums(q);
  if(summary.pending){doc.rect(M,next,CW,23,[1,.955,.93]);doc.text(`ORÇAMENTO PRELIMINAR - ${summary.pending} VALOR(ES) PENDENTE(S)`,M+10,next+5,8.9,{bold:true,color:RED});next+=30;}
  const gap=8,width=(CW-gap)/2;
  const cli=panelDetails(q.client,[q.phone?'Telefone: '+q.phone:'',q.document?'CPF/CNPJ: '+q.document:'',q.address?'Endereço: '+q.address:''],width);
  const car=panelDetails(q.vehicle,[q.plate?'Placa: '+q.plate:'', [q.color?'Cor: '+q.color:'',q.year?'Ano: '+q.year:''].filter(Boolean).join('   '),q.evaluator?'Avaliado por: '+q.evaluator:''],width);
  const h=Math.max(59,Math.max(cli.reduce((v,l)=>v+l.step,0),car.reduce((v,l)=>v+l.step,0))+35);
  drawInfoPanel(doc,M,next,width,h,'CLIENTE',cli);
  drawInfoPanel(doc,M+width+gap,next,width,h,'VEÍCULO',car);
  return next+h+12;
}
function tableHead(doc,y){
  const height=25;doc.rect(M,y,CW,height,DARK);
  const headers=['PEÇA','DESCRIÇÃO DO SERVIÇO','SERVIÇOS','MATERIAIS','TOTAL'];let x=M;
  headers.forEach((title,i)=>{doc.text(title,x+(i<2?7:COL[i]-4),y+7,i<2?8:7.3,{bold:true,color:WHITE,align:i<2?'left':'right'});x+=COL[i];});return y+height;
}
function drawTableRow(doc,y,entry,continuePage){
  const lineH=10.5;
  const names=wrap(entry.name,COL[0]-14,8.6,true),descs=wrap(entry.desc,COL[1]-13,8.0);
  let ni=0,di=0,first=true;
  while(ni<names.length||di<descs.length){
    if(y+29>BOTTOM)y=continuePage();
    const fit=Math.max(1,Math.floor((BOTTOM-y-12)/lineH));
    const ns=names.slice(ni,ni+fit),ds=descs.slice(di,di+fit);
    ni+=ns.length;di+=ds.length;
    const height=Math.max(29,Math.max(ns.length,ds.length)*lineH+12);
    if(y+height>BOTTOM){ // uma última linha comprida nunca ultrapassa a área segura
      ni-=ns.length;di-=ds.length;y=continuePage();continue;
    }
    const top=y;doc.rect(M,top,CW,height,WHITE);doc.line(M,top+height,W-M,top+height,LINE,.6);
    let x=M;for(let k=0;k<4;k++){x+=COL[k];doc.line(x,top,x,top+height,LINE,.42);}
    ns.forEach((t,i)=>doc.text(t,M+7,top+6+i*lineH,8.6,{bold:true}));
    ds.forEach((t,i)=>doc.text(t,M+COL[0]+7,top+6+i*lineH,8,{color:GRAY}));
    if(first){
      const bothKnown=entry.service!=null&&(entry.material!=null||entry.noMaterial);
      const amounts=[entry.service,entry.material,bothKnown?entry.service+(entry.material||0):null];let left=M+COL[0]+COL[1];
      for(let k=0;k<3;k++){doc.text(val(amounts[k]),left+COL[k+2]-4,top+8,7.35,{color:amounts[k]==null?RED:DARK,bold:k===2,align:'right'});left+=COL[k+2];}
    }
    first=false;y+=height;
  }
  return y;
}
function summaryHeight(totals,q){return 21+16*(2+(q.extras?.length?1:0)+(totals.discount?1:0))+32+(totals.pending?16:0)+8;}
function moneyRow(doc,y,label,amount){doc.text(label,309,y+2,8.7,{color:GRAY});doc.text(amount,545,y+2,9.1,{bold:true,align:'right'});return y+16;}
function drawSummary(doc,y,totals,q){
  y+=9;doc.text('RESUMO FINANCEIRO',M,y,9.2,{bold:true,color:RED});y+=20;
  y=moneyRow(doc,y,'Serviços das peças',val(totals.services));
  y=moneyRow(doc,y,'Peças e materiais',val(totals.materials));
  if(q.extras?.length)y=moneyRow(doc,y,'Serviços gerais',val(totals.extras));
  if(totals.discount)y=moneyRow(doc,y,'Desconto','- '+val(totals.discount));
  doc.rect(303,y+2,250,29,DARK);
  doc.text(totals.pending?'TOTAL PARCIAL':'TOTAL GERAL',314,y+9,10,{color:WHITE,bold:true});
  doc.text(val(Math.max(0,totals.total)),544,y+8,11.7,{color:WHITE,bold:true,align:'right'});
  y+=34;
  if(totals.pending){doc.text('Valores a definir não estão incluídos no total parcial.',M,y+1,8.1,{color:RED});y+=16;}
  return y+3;
}
function drawParagraph(doc,y,title,body,newPage){
  const lines=wrap(body,CW-6,8.5),titleH=14,lineH=11.5;
  // Evita um título solto no final da folha.
  if(y+titleH+lineH+4>BOTTOM)y=newPage();
  doc.text(title.toUpperCase(),M,y,8.7,{bold:true,color:RED});y+=titleH;
  for(const t of lines){
    if(y+lineH+2>BOTTOM)y=newPage();
    doc.text(t,M+2,y,8.5,{color:GRAY});y+=lineH;
  }
  return y+7;
}
function footer(doc,q,config){
  const pages=doc.pages.length;
  for(let i=0;i<pages;i++){
    const previous=doc.page;doc.page=doc.pages[i];
    doc.line(M,783,W-M,783,LINE,.6);
    if(config.footer)doc.text(fitText(config.footer,350,8),M,791,8,{color:GRAY});
    doc.text(`${q.code}    Página ${i+1} de ${pages}`,W-M,791,8,{color:GRAY,align:'right'});
    doc.page=previous;
  }
}
function drawPhotoPages(doc,photos,q,config,utils){
  // O anexo começa em uma nova folha e nunca muda a diagramação compacta do orçamento.
  const perPage=2;
  for(let start=0;start<photos.length;start+=perPage){
    doc.addPage();doc.rect(0,0,W,4.5,RED);
    // A mesma área fixa protege também o cabeçalho das páginas de fotos.
    if(doc.logo)drawLogoContained(doc,M,18,132,54);
    else doc.text(fitText(config.name||'Ramon Retoques Automotivos',260,12,true),M,27,12,{bold:true});
    if(doc.logo)doc.text(fitText(config.name||'Ramon Retoques Automotivos',290,10.7,true),225,22,10.7,{bold:true});
    doc.text(`Orçamento ${q.code}`,225,39,8.7,{color:GRAY});
    doc.line(M,82,W-M,82,RED,1.1);
    doc.text('REGISTRO FOTOGRÁFICO DO VEÍCULO',M,95,13.2,{bold:true});
    doc.text(fitText(`${q.vehicle||'Veículo'}  |  ${q.plate||'Sem placa'}  |  ${utils.prettyDate(q.date)}`,CW,8.8),M,116,8.8,{color:GRAY});
    for(let local=0;local<perPage && start+local<photos.length;local++){
      const i=start+local,photo=photos[i];
      const frameX=M+9,frameY=139+local*306,frameW=CW-18,frameH=262;
      doc.rect(M,frameY-9,CW,289,PALE);
      const scale=Math.min(frameW/photo.width,frameH/photo.height);
      const w=photo.width*scale,h=photo.height*scale;
      const left=frameX+(frameW-w)/2,top=frameY+(frameH-h)/2;
      doc.photoImage(i,left,top,w,h);
      doc.text(`FOTO ${i+1} DE ${photos.length}`,M+10,frameY+266,8,{bold:true,color:GRAY});
    }
  }
}
async function generate(q,config,utils,photoInputs=[]){
   const logo=await getLogo(config);
   const photos=await Promise.all(photoInputs.map(async p=>{
     if(!p?.blob||p.blob.type!=='image/jpeg')throw Error('Foto não suportada no PDF');
     let width=Number(p.width),height=Number(p.height);
     if(!width||!height){const objectUrl=URL.createObjectURL(p.blob);try{const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=objectUrl;});width=img.naturalWidth;height=img.naturalHeight;}finally{URL.revokeObjectURL(objectUrl);}}
     return {width,height,bytes:new Uint8Array(await p.blob.arrayBuffer())};
   }));
   const doc=new Document(logo,photos),totals=utils.sums(q);
  let y=drawHeader(doc,config,q,utils,true);
  const nextPage=(withTable=false)=>{let top=drawHeader(doc,config,q,utils,false);if(withTable)top=tableHead(doc,top);return top;};
  y=tableHead(doc,y);
  const entries=[];
  for(const i of utils.getSelected(q)){
    let desc=i.interventions.join(', ');
    if(i.description?.trim()&&i.description.trim().toLocaleLowerCase('pt-BR')!==desc.toLocaleLowerCase('pt-BR'))desc+=(desc?' | ':'')+i.description.trim();
    if(i.observation?.trim())desc+=(desc?' | ':'')+'Obs.: '+i.observation.trim();
    entries.push({name:i.name,desc:desc||'Serviço não descrito',service:i.service,material:i.noMaterial?0:i.material,noMaterial:!!i.noMaterial});
  }
  for(const e of q.extras||[])entries.push({name:'Serviço geral',desc:e.name||'Serviço não descrito',service:e.value,material:0,noMaterial:true});
  for(const entry of entries)y=drawTableRow(doc,y,entry,()=>nextPage(true));
  if(y+summaryHeight(totals,q)>BOTTOM)y=nextPage();
  y=drawSummary(doc,y,totals,q);
  const payment=[q.payments?.length?'Formas: '+q.payments.join(', '):'',q.paymentDetails?'Condições: '+q.paymentDetails:'',q.cashValue!=null?'À vista: '+val(q.cashValue):'',q.installmentValue!=null?'A prazo: '+val(q.installmentValue):''].filter(Boolean);
  if(payment.length)y=drawParagraph(doc,y+5,'Pagamento',payment.join('   |   '),()=>nextPage());
  if(q.vehicleNote)y=drawParagraph(doc,y+2,'Observações do veículo',q.vehicleNote,()=>nextPage());
  if(q.delivery)y=drawParagraph(doc,y+2,'Prazo estimado de execução',q.delivery,()=>nextPage());
  if(q.conditions)y=drawParagraph(doc,y+2,'Observações e condições',q.conditions,()=>nextPage());
  // A data e a validade já constam no cabeçalho. O lembrete é opcional:
  // não criar uma segunda folha quase vazia somente para repeti-las.
  if(y+21<=BOTTOM){
    doc.line(M,y+3,W-M,y+3,LINE,.65);
    doc.text(`Orçamento emitido em ${utils.prettyDate(q.date)}. Válido até ${utils.prettyDate(utils.plusDays(q.date,q.validDays))}.`,M,y+8,8.1,{color:GRAY});
  }
  if(photos.length)drawPhotoPages(doc,photos,q,config,utils);
  footer(doc,q,config);return doc.toBlob();
}
window.RamonPDF={generate};
})();
