(function(){
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData=navigator.connection&&navigator.connection.saveData;

  /* ---- nav ---- */
  var nav=$('.nav'), burger=$('.burger'), menu=$('#menu');
  function setMenu(o){menu.classList.toggle('open',o);burger.setAttribute('aria-expanded',o?'true':'false')}
  burger.addEventListener('click',function(){setMenu(!menu.classList.contains('open'))});
  $$('#menu a').forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
  document.addEventListener('click',function(e){if(!nav.contains(e.target))setMenu(false)});
  window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>10)},{passive:true});

  /* ---- open / closed chip (clinic time = IST) ---- */
  (function(){
    var chip=$('#openChip'); if(!chip)return;
    try{
      var p=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
      var o={}; p.forEach(function(x){o[x.type]=x.value});
      var m=(+o.hour%24)*60+(+o.minute), sun=o.weekday==='Sun', txt, open=false;
      if(!sun&&m>=600&&m<840){open=true;txt='Open now · until 2:00 PM'}
      else if(!sun&&m>=900&&m<1080){open=true;txt='Open now · until 6:00 PM'}
      else if(!sun&&m>=840&&m<900){txt='Lunch break · opens 3:00 PM'}
      else if(!sun&&m<600){txt='Closed now · opens 10:00 AM'}
      else if(o.weekday==='Sat'||sun){txt='Closed now · opens Monday 10 AM'}
      else{txt='Closed now · opens tomorrow 10 AM'}
      chip.classList.add(open?'open':'closed'); $('span',chip).textContent=txt;
    }catch(e){}
  })();

  /* ---- hero video ---- */
  var hv=$('#heroVideo'), sb=$('#soundBtn');
  if(reduce||saveData){hv.removeAttribute('autoplay');hv.pause();hv.setAttribute('controls','')}
  sb.addEventListener('click',function(){
    hv.muted=!hv.muted;
    $('use',sb).setAttribute('href',hv.muted?'#i-mute':'#i-sound');
    sb.setAttribute('aria-label',hv.muted?'Turn sound on':'Turn sound off');
    var pr=hv.play(); if(pr&&pr.catch)pr.catch(function(){});
  });
  if('IntersectionObserver' in window&&!reduce&&!saveData){
    new IntersectionObserver(function(en){
      en.forEach(function(x){
        if(x.isIntersecting){var pr=hv.play();if(pr&&pr.catch)pr.catch(function(){})}
        else hv.pause();
      });
    },{threshold:.25}).observe(hv);
  }

  /* ---- reels: one at a time ---- */
  var reels=$$('#reels video');
  reels.forEach(function(v){v.addEventListener('play',function(){
    reels.forEach(function(o){if(o!==v)o.pause()});
    if(!hv.muted){hv.muted=true;$('use',sb).setAttribute('href','#i-mute')}
  })});

  /* ---- conditions tabs ---- */
  var data=[
    {t:'Neck & Shoulder',d:'Desk work, sleeping posture and overuse often leave the neck and shoulders tight and painful. We release the tightness and rebuild free, comfortable movement.',l:['Neck pain','Frozen shoulder','Shoulder stiffness','Cervical spondylosis','Headache from neck']},
    {t:'Back & Spine',d:'From long hours of sitting to heavy lifting, back pain is one of the most common reasons people visit us. We treat the cause, not just the pain.',l:['Lower back pain','Sciatica','Slipped disc','Posture problems','Muscle spasm']},
    {t:'Knee, Hip & Legs',d:'Joint pain should not stop you from walking, climbing stairs or working. Get stronger, steadier joints with a guided plan.',l:['Knee pain','Arthritis','Hip pain','Heel pain','Ankle sprain']},
    {t:'Nerves & Stroke',d:'Neuro physiotherapy helps regain strength, balance and independence after nerve and brain-related problems.',l:['Stroke recovery','Facial palsy','Numbness & tingling','Balance problems','Paralysis rehab']},
    {t:'Children',d:'Gentle, patient therapy that makes exercise feel like play, supporting healthy growth and development.',l:['Developmental delay','Cerebral palsy','Poor posture','Walking difficulty','Muscle weakness']},
    {t:'Elders',d:'Safe, comfortable care to keep older adults active, independent and confident on their feet.',l:['Joint stiffness','Fall prevention','Osteoporosis care','Post-fracture rehab','General weakness']},
    {t:'Sports Injury',d:'Whether you play cricket, football or just stay active, we help you recover well and return stronger.',l:['Muscle strain','Ligament injury','Tendon pain','Post-surgery rehab','Return to play']}
  ];
  var panel=$('#panel'), tabs=$$('.tabs button'), probSel=$('select[name=problem]');
  function show(i,focus){
    var x=data[i], ul=$('ul',panel);
    $('h3',panel).textContent=x.t; $('p',panel).textContent=x.d; ul.textContent='';
    x.l.forEach(function(s){var li=document.createElement('li');li.textContent=s;ul.appendChild(li)});
    tabs.forEach(function(b,k){b.setAttribute('aria-selected',k===i?'true':'false');b.tabIndex=k===i?0:-1});
    panel.setAttribute('aria-labelledby','tab'+i);
    if(probSel)probSel.selectedIndex=i;
    if(focus){tabs[i].focus();if(tabs[i].scrollIntoView)tabs[i].scrollIntoView({block:'nearest',inline:'center',behavior:reduce?'auto':'smooth'})}
  }
  tabs.forEach(function(b,i){
    b.addEventListener('click',function(){show(i,true)});
    b.addEventListener('keydown',function(e){
      var n=e.key==='ArrowRight'||e.key==='ArrowDown'?1:e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:0;
      if(n){e.preventDefault();show((i+n+tabs.length)%tabs.length,true)}
    });
  });

  /* ---- booking -> WhatsApp ---- */
  var form=$('#bookForm'), err=$('#formErr');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var n=form.elements.name, p=form.elements.phone;
    var digits=p.value.replace(/\D/g,'');
    var badN=n.value.trim().length<2, badP=digits.length<10||digits.length>13;
    n.classList.toggle('err',badN); p.classList.toggle('err',badP);
    n.setAttribute('aria-invalid',badN); p.setAttribute('aria-invalid',badP);
    err.hidden=!(badN||badP);
    if(badN||badP){(badN?n:p).focus();return}
    var msg='Hello Flyphysio Clinic, I would like to book an appointment.\n'+
      'Name: '+n.value.trim()+'\nPhone: '+p.value.trim()+
      '\nProblem: '+form.elements.problem.value+
      '\nPreferred: '+form.elements.day.value+', '+form.elements.slot.value;
    window.open('https://wa.me/919706214277?text='+encodeURIComponent(msg),'_blank','noopener');
  });

  /* ---- dock: step aside while the booking form is on screen ---- */
  var dock=$('#dock');
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){dock.classList.toggle('hide',en[0].isIntersecting)},{threshold:.35}).observe(form);
  }

  /* ---- reveal on scroll ---- */
  var els=$$('.card,.panel,.steps li,.about-img,.about-copy,.ba,.results>div,.faq details,.form,.visit>div,.head');
  if('IntersectionObserver' in window&&!reduce){
    els.forEach(function(el){el.classList.add('rv')});
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.1,rootMargin:'0px 0px -5% 0px'});
    els.forEach(function(el){io.observe(el)});
  }

  $('#yr').textContent=new Date().getFullYear();
})();
