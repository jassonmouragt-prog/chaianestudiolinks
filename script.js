(function(){
'use strict';

var CFG     = window.LINKS || {};
var REDUZIR = matchMedia('(prefers-reduced-motion: reduce)').matches;
var TOQUE   = !matchMedia('(hover:hover) and (pointer:fine)').matches;

/* ═══════════════════════════════════════════════════════════════
   WIRING
   ═══════════════════════════════════════════════════════════════ */
(function wiring(){
  var mapa = {}, usados = {};
  (CFG.destinos || []).forEach(function(d){ mapa[d.id] = d; });

  var pagina   = new URLSearchParams(location.search);
  var repassar = ['utm_source','utm_medium','utm_campaign','utm_term',
                  'utm_id','gclid','fbclid','ttclid'];

  document.querySelectorAll('[data-link]').forEach(function(el){
    var id = el.getAttribute('data-link'), d = mapa[id];
    if(!d){
      console.warn('[LINKS] data-link="' + id + '" não existe em window.LINKS.destinos');
      return;
    }
    usados[id] = true;
    var u;
    try { u = new URL(d.url); }
    catch(e){
      if(!/^\[[A-Z0-9_ ]+\]$/.test(d.url || '')){
        console.warn('[LINKS] URL inválida em "' + id + '":', d.url);
      }
      return;
    }

    if(CFG.PASSAR_UTMS){
      repassar.forEach(function(k){ if(pagina.has(k)) u.searchParams.set(k, pagina.get(k)); });
      u.searchParams.set('utm_content', id);
    }
    el.href   = u.toString();
    el.target = '_blank';
    el.rel    = 'noopener noreferrer';
  });

  Object.keys(mapa).forEach(function(id){
    if(!usados[id]) console.warn('[LINKS] destino "' + id + '" está no config, mas nenhum card usa data-link="' + id + '"');
  });
})();

/* ═══════════════════════════════════════════════════════════════
   REVEAL · M-03 — tudo entra junto, no primeiro frame
   ═══════════════════════════════════════════════════════════════ */
(function reveal(){
  var els = document.querySelectorAll('.rv');
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      els.forEach(function(el){ el.classList.add('in'); });
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   MOTIONS · M-02 parallax · M-07 spotlight
   ═══════════════════════════════════════════════════════════════ */
(function motions(){
  var img = document.getElementById('heroImg');
  if(img){
    var pronto = function(){ img.classList.add('is-ready'); };
    if(img.complete) pronto();
    else { img.addEventListener('load', pronto); img.addEventListener('error', pronto); }
  }
  if(REDUZIR) return;

  var media = document.getElementById('heroMedia');
  var hero  = document.querySelector('.hero');
  if(media && hero){
    var esperando = false, altura = hero.offsetHeight;
    var desenha = function(){
      esperando = false;
      var y = window.pageYOffset || 0;
      if(y > altura + 40) return;
      media.style.transform = 'translate3d(0,' + (y * .25).toFixed(2) + 'px,0)';
    };
    addEventListener('scroll', function(){
      if(!esperando){ esperando = true; requestAnimationFrame(desenha); }
    }, {passive:true});
    addEventListener('resize', function(){ altura = hero.offsetHeight; }, {passive:true});
    desenha();
  }

  if(!TOQUE){
    var spot  = document.getElementById('spot');
    var stack = document.querySelector('.stack');
    if(spot && stack){
      var mx = 0, my = 0, agendado = false, topo = 0, base = 0;
      var mede = function(){
        var r = stack.getBoundingClientRect();
        topo = r.top - 90; base = r.bottom + 90;
      };
      var pinta = function(){
        agendado = false;
        spot.style.setProperty('--mx', mx + 'px');
        spot.style.setProperty('--my', my + 'px');
        spot.classList.toggle('is-on', my > topo && my < base);
      };
      mede();
      addEventListener('mousemove', function(e){
        mx = e.clientX; my = e.clientY;
        if(!agendado){ agendado = true; requestAnimationFrame(pinta); }
      }, {passive:true});
      addEventListener('scroll', mede, {passive:true});
      addEventListener('resize', mede, {passive:true});
    }
  }
})();

/* ═══════════════════════════════════════════════════════════════
   CLIPBOARD · M-09
   ═══════════════════════════════════════════════════════════════ */
(function clipboard(){
  var btn = document.getElementById('handle');
  if(!btn) return;
  var alvo   = document.getElementById('handleTxt');
  var aviso  = document.getElementById('say');
  var handle = (CFG.perfil && CFG.perfil.handle) || '@chaianestudio';
  var origem = alvo.innerHTML, timer;

  function troca(html){
    alvo.style.opacity = '0';
    setTimeout(function(){ alvo.innerHTML = html; alvo.style.opacity = '1'; }, 130);
  }
  function ok(){
    clearTimeout(timer);
    troca('copiado ✓');
    btn.setAttribute('data-copied','1');
    aviso.textContent = handle + ' copiado';
    timer = setTimeout(function(){
      troca(origem);
      btn.removeAttribute('data-copied');
      aviso.textContent = '';
    }, 1400);
  }
  function manual(){
    try{
      var ta = document.createElement('textarea');
      ta.value = handle; ta.setAttribute('readonly','');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
      ok();
    }catch(e){}
  }
  btn.addEventListener('click', function(){
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(handle).then(ok, manual);
    } else manual();
  });
})();

/* ═══════════════════════════════════════════════════════════════
   STICKY · M-10
   ═══════════════════════════════════════════════════════════════ */
(function sticky(){
  var dock = document.getElementById('dock');
  var fim  = document.getElementById('sHero');
  if(!dock || !fim || !('IntersectionObserver' in window)) return;

  var passouHero = false;
  var atualiza = function(){ dock.classList.toggle('is-on', passouHero); };

  new IntersectionObserver(function(e){
    passouHero = !e[0].isIntersecting; atualiza();
  }).observe(fim);
})();

})();