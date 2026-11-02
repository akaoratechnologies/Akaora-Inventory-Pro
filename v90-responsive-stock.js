/* v90: rerender Products when crossing the mobile/desktop breakpoint. */
(function(){
  'use strict';
  const query=window.matchMedia('(max-width: 740px)');
  let previousMobile=query.matches;
  let scheduled=false;
  function refreshOnBreakpointChange(){
    const mobile=query.matches;
    if (mobile===previousMobile) return;
    previousMobile=mobile;
    if ((typeof page==='undefined' || page!=='products') || typeof window.pageRender!=='function') return;
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      if((typeof page==='undefined' || page!=='products'))return;
      try{
        window.pageRender();
      }catch(error){console.error('[Akaora v90] Responsive stock refresh:',error)}
    });
  }
  if(typeof query.addEventListener==='function')query.addEventListener('change',refreshOnBreakpointChange);
  else if(typeof query.addListener==='function')query.addListener(refreshOnBreakpointChange);
  window.addEventListener('orientationchange',refreshOnBreakpointChange,{passive:true});
  window.addEventListener('resize',refreshOnBreakpointChange,{passive:true});
})();
