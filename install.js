// Install: Android/Chrome shows a real install button; iPhone shows the Share → Add to Home Screen steps.
(function(){
  const box = document.getElementById("install");
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true || document.referrer.startsWith("android-app://");
  let later = false; try{ later = localStorage.getItem("sos-install-later") === "1"; }catch(_){}
  if(standalone || later) return;
  const hide = () => { box.hidden = true; try{ localStorage.setItem("sos-install-later","1"); }catch(_){} };
  box.querySelectorAll("[data-later]").forEach(b => b.addEventListener("click", hide));
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if(isIOS){ document.getElementById("inst-ios").hidden = false; box.hidden = false; return; }
  let deferred = null;
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault(); deferred = e;
    document.getElementById("inst-android").hidden = false; box.hidden = false;
  });
  document.getElementById("btn-install").addEventListener("click", async () => {
    if(!deferred) return;
    deferred.prompt();
    try{ await deferred.userChoice; }catch(_){}
    deferred = null; box.hidden = true;
  });
  window.addEventListener("appinstalled", () => { box.hidden = true; });
})();

