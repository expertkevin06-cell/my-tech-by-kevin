"use strict";
/* Générateur PDF minimaliste sans dépendance (Helvetica, WinAnsi, multi-pages). */
const PDF = (() => {
  function escPdf(s){ return String(s).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)"); }
  function clean(s){
    return String(s)
      .replace(/€/g,"EUR").replace(/œ/g,"oe").replace(/Œ/g,"OE")
      .replace(/[–—]/g,"-").replace(/[’‘]/g,"'").replace(/[“”]/g,'"')
      .replace(/→/g,"->").replace(/•/g,"-")
      .replace(/[⚙🧰📚📢⚡🩺✅⚠🔧🚗🛰📧🔗📥🔄⬆🗑📟]/g,"")
      .replace(/[^\x00-\xFF]/g,"");
  }
  function wrap(text, width){
    const words=String(text).split(/\s+/); const lines=[]; let cur="";
    for(const w of words){ const t=(cur?cur+" ":"")+w; if(t.length>width){ if(cur) lines.push(cur); cur=w; } else cur=t; }
    if(cur) lines.push(cur); return lines.length?lines:[""];
  }
  function build(title, sections){
    const PER=46; const pages=[]; let cur=[];
    const flush=()=>{ if(cur.length){ pages.push(cur); cur=[]; } };
    const add=(t,s)=>{ wrap(clean(t), s>=14?68:92).forEach(ln=>{ if(cur.length>=PER) flush(); cur.push({t:ln,s:s}); }); };
    add(title,16); add("Ma Tech by Kevin - généré le "+new Date().toLocaleString("fr-FR"),9); add("",9);
    (sections||[]).forEach(sec=>{ if(cur.length>PER-10) flush(); add(sec.h,12); (sec.lines||[]).forEach(l=>add(l,10)); add("",9); });
    flush(); if(!pages.length) pages.push([{t:"(document vide)",s:10}]);
    const nP=pages.length; const fontId=3+2*nP; const objs={};
    objs[1]="<</Type/Catalog/Pages 2 0 R>>";
    objs[2]="<</Type/Pages/Kids["+pages.map((_,i)=>(3+2*i)+" 0 R").join(" ")+"]/Count "+nP+">>";
    pages.forEach((lines,i)=>{
      const pid=3+2*i, cid=4+2*i;
      objs[pid]="<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 "+fontId+" 0 R>>>>/Contents "+cid+" 0 R>>";
      let y=790, st="";
      lines.forEach(l=>{ st+="BT /F1 "+l.s+" Tf 50 "+y+" Td ("+escPdf(l.t)+") Tj ET\n"; y-=(l.s+7); });
      objs[cid]="<</Length "+st.length+">>\nstream\n"+st+"endstream";
    });
    objs[fontId]="<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>";
    let file="%PDF-1.4\n"; const offsets={};
    const ids=Object.keys(objs).map(Number).sort((a,b)=>a-b);
    ids.forEach(id=>{ offsets[id]=file.length; file+=id+" 0 obj\n"+objs[id]+"\nendobj\n"; });
    const xref=file.length;
    file+="xref\n0 "+(ids.length+1)+"\n0000000000 65535 f \n"+ids.map(id=>String(offsets[id]).padStart(10,"0")+" 00000 n \n").join("");
    file+="trailer\n<</Size "+(ids.length+1)+"/Root 1 0 R>>\nstartxref\n"+xref+"\n%%EOF";
    const bytes=new Uint8Array(file.length);
    for(let i=0;i<file.length;i++) bytes[i]=file.charCodeAt(i)&0xFF;
    return new Blob([bytes], { type:"application/pdf" });
  }
  function download(name, title, sections){
    const blob=build(title, sections);
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob); a.download=name; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
  }
  return { build, download };
})();
