"use strict";
/* Fond d'écran personnalisable (admin) : upload photo → compression canvas →
   stockage local → application immédiate → diffusion aux tiers via pack MAJ. */
const Wallpaper = (() => {
  const K = "mtk_wallpaper_v1";
  const MAXW = 1920, MAXH = 1080, QUAL = 0.82;

  function get(){
    try{ const v = localStorage.getItem(K); return (v && v.startsWith("data:image")) ? v : null; }catch(e){ return null; }
  }
  function set(dataURL){
    try{ localStorage.setItem(K, dataURL); }catch(e){ return false; }
    apply(); return true;
  }
  function reset(){ try{ localStorage.removeItem(K); }catch(e){} apply(); }

  function apply(){
    const v = get();
    const b = document.body.style;
    b.backgroundImage = v ? `url("${v}")` : "";
    b.backgroundSize = "cover";
    b.backgroundPosition = "center center";
    b.backgroundAttachment = "fixed";
    b.backgroundRepeat = "no-repeat";
  }

  function fromFile(file){
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) return reject(new Error("Fichier non image"));
      const fr = new FileReader();
      fr.onerror = () => reject(new Error("Lecture impossible"));
      fr.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Image invalide"));
        img.onload = () => {
          let w = img.naturalWidth, h = img.naturalHeight;
          const r = Math.min(1, MAXW / w, MAXH / h);
          w = Math.max(1, Math.round(w * r)); h = Math.max(1, Math.round(h * r));
          const c = document.createElement("canvas"); c.width = w; c.height = h;
          const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL("image/jpeg", QUAL));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  return { get, set, reset, apply, fromFile };
})();
