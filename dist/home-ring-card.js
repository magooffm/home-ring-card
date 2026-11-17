/*
 * Home Ring card for Home Assistant
 * https://github.com/magooffm/home-ring-card  (MIT licence)
 *
 * Your home as a ring you drill into: the centre is where you are, the rings around it are floors, rooms,
 * kinds of thing and the things themselves. Tap to go in, tap the centre to come back out, hold to switch,
 * slide on a light to dim it. Everything comes from Home Assistant's own floors, areas and entities, so new
 * devices appear by themselves once they have a room.
 */
const HOME_RING_VERSION = '1.7.1';

const HR_CSS = `
:host{
  --bg:#0a0f16; --panel:#111924; --text:#eef4f9; --muted:#8a97a6; --dim:#5d6a79; --line:color-mix(in srgb,var(--ink) 8%,transparent);
  --light:#ffb638; --plug:#30d1b4; --heat:#ff7a45; --media:#39d98a; --alert:#ff5a5a; --fan:#4bc0e0; --cam:#b088ff;
  --hub:#0e151f; --wedge:#121a26; --cardgrad:linear-gradient(158deg,#151f2b 0%,#0c151f 100%);
  --ink:#fff; --scn:var(--scn-c,#18222f);
  display:block; container-type:inline-size; container-name:hr;
}
/* the look, chosen in Customise (or theme: in the card): dark is the default above */
:host([data-theme="light"]){
  --bg:#e9eef3; --panel:#fff; --text:#14202c; --muted:#56626f; --dim:#8893a0; --line:rgba(0,0,0,.10);
  --hub:#fff; --wedge:#d8e0e9; --cardgrad:linear-gradient(158deg,#fff 0%,#f1f4f8 100%); --ink:#000; --scn-c:#dce3eb;
}
:host([data-theme="ha"]){
  --bg:var(--card-background-color,#0a0f16); --panel:var(--card-background-color,#111924); --text:var(--primary-text-color,#eef4f9);
  --muted:var(--secondary-text-color,#8a97a6); --dim:var(--disabled-text-color,#5d6a79); --line:var(--divider-color,rgba(255,255,255,.08));
  --hub:var(--secondary-background-color,#0e151f); --ink:var(--primary-text-color,#fff);
  --wedge:color-mix(in srgb,var(--primary-text-color,#fff) 8%,var(--card-background-color,#121a26));
  --cardgrad:var(--card-background-color,#111924); --scn-c:color-mix(in srgb,var(--primary-text-color,#fff) 12%,var(--card-background-color,#18222f));
  --hr-font:var(--paper-font-body1_-_font-family,var(--ha-font-family-body,inherit));
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
ha-card{display:block;background:var(--bg);color:var(--text);overflow:hidden;border-radius:var(--ha-card-border-radius,16px);
  font-family:var(--hr-font,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif);}
#app{position:relative;height:var(--hr-height,min(78vh,760px));display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,32%);grid-template-rows:auto minmax(0,1fr);gap:12px 14px;padding:12px 14px;}
/* the bar across the top: kinds to show on the left (in as many rows as they need), how the ring is arranged on the right */
#bar{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;min-width:0;}
#filt{flex:1 1 300px;min-width:0;display:flex;flex-wrap:wrap;gap:6px;padding:2px;}
#filt button{all:unset;flex:0 0 auto;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;font-size:12.5px;font-weight:750;color:var(--muted);
  border:1px solid var(--line);background:color-mix(in srgb,var(--ink) 3.5%,transparent);white-space:nowrap;}
#filt button i{width:8px;height:8px;border-radius:50%;background:var(--kc,var(--muted));}
#filt button b{font-size:11px;font-weight:800;color:var(--text);}
#filt button.on{color:var(--text);border-color:color-mix(in srgb,var(--kc,var(--ink)) 60%,transparent);background:color-mix(in srgb,var(--kc,var(--ink)) 16%,transparent);}
#filt button.quiet:not(.on){border-style:dashed;}
#filt button.more{color:var(--text);background:none;}
#filt button:focus-visible{box-shadow:0 0 0 2px var(--ink);}
#bar .bset{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-left:auto;}
#app.mini #bar{display:none;}
#stage{position:relative;min-height:0;}
#ringbox{position:absolute;inset:0;}
.hots{display:contents;}
#ring{width:100%;height:100%;display:block;user-select:none;touch-action:none;}
#ring .w path{stroke:var(--bg);stroke-width:1.5;transition:filter .2s;}
#ring .w.k-floor path,#ring .w.k-area path,#ring .w.k-cat path{stroke-width:3;}
#ring .w{cursor:pointer;}
#ring .w.hl path{filter:brightness(1.35);}
#ring .w.active.k-ent path{stroke:color-mix(in srgb,var(--sc) 70%,transparent);stroke-width:1.5;}
#ring .w.sel path{stroke:var(--ink);stroke-width:2.5;}
#ring .w:focus{outline:none;} #ring .w:focus-visible path{stroke:var(--ink);stroke-width:2.5;}
#ring .w.flash path{filter:brightness(1.9);transition:filter .08s;}
#ring .lb{pointer-events:none;}
#ring .nm{fill:var(--text);font-weight:650;}
#ring .sub{fill:var(--muted);font-size:10.5px;font-weight:600;}
#ring .ctr .cn{fill:var(--text);font-weight:750;}
#ring .ctr .cs{fill:var(--muted);font-size:12px;font-weight:600;}
#ring circle.hub{fill:var(--hub);stroke:color-mix(in srgb,var(--ink) 12%,transparent);stroke-width:1.5;cursor:pointer;}
#ring .pulse{animation:hrpulse 2.2s ease-in-out infinite;}
@keyframes hrpulse{50%{filter:brightness(1.45);}}
#ring .w.moved path{animation:hrmoved 1.1s ease-out 3;}
@keyframes hrmoved{0%{filter:brightness(2.3) saturate(1.3);}100%{filter:none;}}
#ring .scn{cursor:pointer;}
#ring .scn path{fill:var(--scn);stroke:var(--bg);stroke-width:3;transition:fill .2s;}
#ring .scn.last path{fill:color-mix(in srgb,var(--light) 20%,var(--scn));}
#ring .scn.flash path{fill:color-mix(in srgb,var(--light) 60%,var(--scn));}
#ring .scn text{fill:var(--text);font-size:12.5px;font-weight:750;letter-spacing:.03em;pointer-events:none;}
#ring .scn:focus{outline:none;} #ring .scn:focus-visible path{stroke:var(--ink);}
@media (prefers-reduced-motion:reduce){ #ring .pulse{animation:none;} #ring .w.moved path{animation:none;filter:brightness(1.7);} .hot.armed{animation:none;} }
#slide{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(30%,220px);aspect-ratio:1;border-radius:50%;display:none;place-items:center;
  pointer-events:none;background:radial-gradient(closest-side,var(--hub) 78%,transparent 79%),conic-gradient(var(--light) calc(var(--p,0)*1%),color-mix(in srgb,var(--ink) 10%,transparent) 0);}
#slide div{display:flex;flex-direction:column;align-items:center;gap:2px;}
#slide b{font-size:34px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;}
#slide span{font-size:12px;color:var(--muted);font-weight:700;max-width:120px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
#toast{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:80%;padding:10px 18px;border-radius:14px;background:color-mix(in srgb,var(--bg) 95%,transparent);
  border:1px solid color-mix(in srgb,var(--ink) 16%,transparent);font-size:15px;font-weight:750;text-align:center;opacity:0;transition:opacity .25s;pointer-events:none;}
#toast.show{opacity:1;}
#wait{position:absolute;inset:0;display:grid;place-items:center;color:var(--muted);font-size:14px;}
/* hot buttons: the four corners around the ring */
.hot{all:unset;box-sizing:border-box;position:absolute;z-index:2;display:flex;flex-direction:column;gap:3px;width:138px;padding:10px 12px;border-radius:16px;cursor:pointer;
  background:color-mix(in srgb,var(--panel) 92%,transparent);border:1px solid color-mix(in srgb,var(--ink) 12%,transparent);user-select:none;touch-action:none;color:var(--text);transition:background .2s,border-color .2s;}
.hot.tl{left:0;top:0;} .hot.tr{right:0;top:0;} .hot.bl{left:0;bottom:0;} .hot.br{right:0;bottom:0;}
.hot .hi{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:800;}
.hot svg{width:22px;height:22px;fill:none;stroke:var(--hc);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto;}
.hot .hv{font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.hot .md{margin-left:auto;width:9px;height:9px;border-radius:50%;background:var(--alert);box-shadow:0 0 9px var(--alert);display:none;}
.hot.motion .md{display:block;}
.hot.lit{border-color:color-mix(in srgb,var(--hc) 55%,transparent);background:color-mix(in srgb,var(--hc) 13%,color-mix(in srgb,var(--panel) 94%,transparent));}
.hot.lit .hv{color:var(--text);}
.hot.open{box-shadow:0 0 0 2px color-mix(in srgb,var(--hc) 75%,transparent);}
.hot.armed{animation:hrarmed 2s ease-in-out infinite;}
@keyframes hrarmed{50%{box-shadow:0 0 26px -2px var(--alert);}}
.hot:active{transform:scale(.97);} .hot:focus-visible{box-shadow:0 0 0 2px var(--ink);}
.hot[hidden]{display:none;}
.hot .hn{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.hot.empty{opacity:.7;}
.hot.edit{border-style:dashed;border-color:color-mix(in srgb,var(--hc) 70%,transparent);animation:hrwiggle 1.4s ease-in-out infinite;}
.hot.picking{animation:none;box-shadow:0 0 0 2px var(--ink);background:color-mix(in srgb,var(--hc) 18%,color-mix(in srgb,var(--panel) 94%,transparent));}
@keyframes hrwiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-1.2deg)}75%{transform:rotate(1.2deg)}}
@media (prefers-reduced-motion:reduce){ .hot.edit{animation:none;} }
/* the gear: starts and ends Customise. Beside the top right corner button, or in the ring's own corner on a phone */
#gear{all:unset;box-sizing:border-box;position:absolute;z-index:3;top:0;right:146px;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;cursor:pointer;
  background:color-mix(in srgb,var(--panel) 92%,transparent);border:1px solid color-mix(in srgb,var(--ink) 12%,transparent);color:var(--muted);transition:color .2s,background .2s,border-color .2s;}
#gear[hidden]{display:none;}
#gear svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
#gear.on{color:#0a0f16;background:var(--light);border-color:var(--light);}
#gear:active{transform:scale(.94);} #gear:focus-visible{box-shadow:0 0 0 2px var(--ink);}
#app.nohots #gear{right:0;}
#app.ringonly:not(.editing):not(.mini){grid-template-columns:minmax(0,1fr);}
#app.ringonly:not(.editing) #side{display:none;}
#app.ringonly:not(.mini) .hots{display:none !important;}   /* also on narrow cards, where the corners otherwise become a row */
#ctl .txt{flex:1 1 140px;min-width:0;background:var(--hub);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;font-size:16px;}
#ctl .txt:focus{outline:none;border-color:var(--light);}
#ctl .seg{margin-top:8px;}
#ctl .btn.warn{display:inline-flex;align-items:center;gap:7px;color:var(--alert);}
#ctl .btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
#ctl .erows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:8px;}
#ctl .erow{display:flex;align-items:stretch;min-width:0;border-radius:12px;background:color-mix(in srgb,var(--ink) 3.5%,transparent);border:1px solid var(--line);}
#ctl .erow.off{border-style:dashed;} #ctl .erow.off .en{opacity:.55;}
#ctl .erow .en{all:unset;box-sizing:border-box;cursor:pointer;flex:1 1 auto;min-width:0;padding:7px 4px 7px 10px;font-size:12.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
#ctl .erow span.en{cursor:default;}
#ctl .erow .en small{display:block;font-size:11px;font-weight:650;color:var(--muted);overflow:hidden;text-overflow:ellipsis;}
#ctl .erow .eye{all:unset;cursor:pointer;flex:0 0 auto;display:grid;place-items:center;width:40px;color:var(--muted);border-left:1px solid var(--line);}
#ctl .erow .eye svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
#ctl .erow .eye:hover{color:var(--text);} #ctl .erow.off .eye{color:var(--light);}
#ctl .erow .en:focus-visible,#ctl .erow .eye:focus-visible{box-shadow:0 0 0 2px var(--ink);border-radius:10px;}
#ctl .opts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:9px;}
#ctl .opt{all:unset;cursor:pointer;display:flex;align-items:center;gap:7px;min-width:0;padding:8px 9px;border-radius:12px;background:color-mix(in srgb,var(--ink) 3.5%,transparent);border:1px solid var(--line);font-size:12.5px;font-weight:750;}
#ctl .opt span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
#ctl .opt svg{width:18px;height:18px;flex:0 0 auto;fill:none;stroke:var(--hc);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
#ctl .opt.on{border-color:color-mix(in srgb,var(--hc) 60%,transparent);background:color-mix(in srgb,var(--hc) 14%,transparent);}
#ctl .opt:focus-visible{box-shadow:0 0 0 2px var(--ink);}
#ctl .mrow{grid-template-columns:minmax(0,1fr) auto;}
#ctl .link2{all:unset;cursor:pointer;min-width:0;}
#ctl .scn2{grid-template-columns:repeat(2,minmax(0,1fr));}
/* the side panel */
#side{min-height:0;display:flex;flex-direction:column;gap:10px;}
.card{background:var(--cardgrad);border:1px solid color-mix(in srgb,var(--ink) 10%,transparent);border-radius:16px;padding:12px 14px;}
#crumbs{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;font-size:13px;font-weight:700;color:var(--muted);}
#crumbs button{all:unset;cursor:pointer;color:var(--muted);padding:2px 0;}
#crumbs button:hover{color:var(--text);}
#crumbs .cur{color:var(--text);} #crumbs .sep{color:var(--dim);}
#back{all:unset;cursor:pointer;font-size:12px;font-weight:700;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:4px 11px;margin-left:auto;white-space:nowrap;}
#back[hidden]{display:none;}
#title{font-size:22px;font-weight:800;letter-spacing:-.3px;margin-top:6px;}
#summary{font-size:12.5px;color:var(--muted);margin-top:3px;line-height:1.45;}
#summary b{color:var(--text);}
.tools{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:10px;}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:999px;padding:3px;gap:2px;}
.seg button{all:unset;cursor:pointer;font-size:12px;font-weight:800;color:var(--muted);padding:5px 12px;border-radius:999px;}
.seg button.on{background:color-mix(in srgb,var(--ink) 11%,transparent);color:var(--text);}
#lockseg[hidden],#tidy[hidden],#view[hidden]{display:none;}
#ring .w.hid path{opacity:.4;stroke-dasharray:5 4;}
#lock{display:inline-flex;align-items:center;gap:6px;}
#lock svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}
#lock.on{color:var(--light);}
#legend{display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--muted);font-weight:700;}
#legend i{width:96px;height:8px;border-radius:999px;background:linear-gradient(90deg,#4a8dff,color-mix(in srgb,var(--ink) 14%,transparent) 45%,color-mix(in srgb,var(--ink) 14%,transparent) 55%,#ff8a3d);}
#ctl{flex:1 1 auto;min-height:0;overflow:auto;}
#ctl:empty{display:none;}
#ctl .h{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:800;}
#ctl .h i{width:10px;height:10px;border-radius:50%;background:var(--sc,var(--muted));box-shadow:0 0 10px -1px var(--sc,transparent);}
#ctl .h i.off{background:var(--dim);box-shadow:none;}
#ctl .st{font-size:12.5px;color:var(--muted);margin-top:3px;}
#ctl .row{display:flex;align-items:center;gap:8px;margin-top:11px;flex-wrap:wrap;}
#ctl .x{all:unset;cursor:pointer;margin-left:auto;font-size:15px;color:var(--muted);padding:2px 8px;border:1px solid var(--line);border-radius:999px;}
#ctl .lbl{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);margin-top:14px;}
#ctl .pv{font-size:12.5px;font-weight:800;color:var(--muted);min-width:48px;text-align:right;font-variant-numeric:tabular-nums;}
#ctl .note{font-size:12.5px;color:var(--muted);margin-top:12px;}
#ctl .kvs{margin-top:10px;}
#ctl .kv{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:5px 0;border-top:1px solid color-mix(in srgb,var(--ink) 5%,transparent);color:var(--muted);}
#ctl button.kv{appearance:none;-webkit-appearance:none;background:none;border:0;border-top:1px solid color-mix(in srgb,var(--ink) 5%,transparent);font:inherit;font-size:12.5px;width:100%;text-align:left;cursor:pointer;margin:0;} #ctl button.kv:hover b{text-decoration:underline;}
#ctl .kv b{color:var(--text);font-weight:700;text-align:right;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
#ctl select{width:100%;margin-top:7px;background:var(--hub);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:9px 10px;font:inherit;font-size:13px;}
#ctl .hue{--h:0;height:28px;appearance:none;-webkit-appearance:none;border-radius:999px;background:linear-gradient(90deg,hsl(0 90% 55%),hsl(60 90% 55%),hsl(120 90% 55%),hsl(180 90% 55%),hsl(240 90% 55%),hsl(300 90% 55%),hsl(359 90% 55%));}
#ctl .hue::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:hsl(var(--h) 90% 55%);border:3px solid #fff;}
#ctl .ct{height:28px;appearance:none;-webkit-appearance:none;border-radius:999px;background:linear-gradient(90deg,#ff9b3d,#fff3e0,#cfe3ff);}
#ctl .ct::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:3px solid var(--hub);}
#ctl .sw{gap:7px;}
#ctl .cols{gap:8px;} #ctl .cols .dot{width:28px;height:28px;border-color:transparent;}
#ctl .dot.on{box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ink);}
#ctl .dot.pick{position:relative;overflow:hidden;background:conic-gradient(#ff5a5a,#ffb638,#39d98a,#4bc0e0,#5b8def,#b088ff,#ff5a5a);}
#ctl .dot.pick i{position:absolute;inset:7px;border-radius:50%;background:var(--c,var(--hub));}
#ctl .dot.pick input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:0;padding:0;}
#ctl .dialrow{display:flex;align-items:center;gap:14px;margin-top:8px;}
#ctl .dialrow .note{margin-top:0;}
#ctl .dial{width:124px;height:124px;flex:0 0 auto;}
#ctl .dial .track{fill:none;stroke:var(--line);stroke-width:7;}
#ctl .dial .pp{cursor:pointer;}
#ctl .dial .pp circle{fill:var(--hub);stroke:color-mix(in srgb,var(--ink) 28%,transparent);stroke-width:1.5;}
#ctl .dial .pp.taken circle{fill:var(--tc);}
#ctl .dial .pp.on circle{fill:var(--sc);stroke:var(--ink);stroke-width:2.5;}
#ctl .dial .pp text{fill:var(--muted);font-size:9px;font-weight:800;pointer-events:none;}
#ctl .dial .pp.on text{fill:#0a0f16;}
#ctl .dial .pp:focus{outline:none;} #ctl .dial .pp:focus-visible circle{stroke:var(--ink);stroke-width:3;}
#ctl .kchips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:8px;}
#ctl .kchips .chip i{width:12px;height:12px;background:var(--sc);box-shadow:none;} #ctl .dot{all:unset;cursor:pointer;width:30px;height:30px;border-radius:50%;border:2px solid color-mix(in srgb,var(--ink) 25%,transparent);}
#ctl .dot.white{background:linear-gradient(135deg,#fff3e0,#fff);}
#ctl .clim{display:grid;grid-template-columns:auto 1fr;gap:18px;margin-top:10px;align-items:end;}
#ctl .clim .big{font-size:40px;} #ctl .tgt{margin-top:2px;} #ctl .tgt .btn{font-size:20px;padding:6px 16px;}
#ctl .graph{margin-top:8px;font-size:12px;color:var(--muted);} #ctl .graph svg{width:100%;height:90px;display:block;background:color-mix(in srgb,var(--ink) 3%,transparent);border-radius:8px;}
#ctl .gl{display:flex;justify-content:space-between;font-size:10.5px;color:var(--dim);margin-top:3px;}
#ctl .art{width:100%;max-height:160px;object-fit:contain;border-radius:10px;margin-top:10px;background:#000;}
#ctl .trow{display:grid;grid-template-columns:minmax(0,1fr) auto 52px auto;align-items:center;gap:8px;padding:6px 0;border-top:1px solid color-mix(in srgb,var(--ink) 5%,transparent);}
#ctl .trow .tn{min-width:0;font-size:13px;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
#ctl .trow .tn small{display:block;font-size:11.5px;font-weight:650;color:var(--muted);}
#ctl .trow .tn small.on{color:var(--heat);}
#ctl .trow .tt{font-size:16px;font-weight:800;text-align:center;font-variant-numeric:tabular-nums;}
#ctl .trow .btn{padding:5px 12px;font-size:17px;}
#ctl .cams{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;}
#ctl .cam2{position:relative;border-radius:10px;overflow:hidden;background:#000;aspect-ratio:16/9;cursor:pointer;}
#ctl .cam2.big{grid-column:1/-1;}
#ctl .cam2 img{width:100%;height:100%;object-fit:cover;display:block;}
#ctl .cam2 span{position:absolute;left:9px;bottom:6px;font-size:12px;font-weight:800;text-shadow:0 1px 3px #000;}
#ctl .cam2 em{position:absolute;inset:0;display:none;place-items:center;color:var(--muted);font-size:12px;font-style:normal;}
#ctl .cam2.fail em{display:grid;} #ctl .cam2.fail img{visibility:hidden;}
#ctl .lchips{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:7px;}
#ctl .lchips .chip{padding:6px 8px;}
#ctl .link{all:unset;cursor:pointer;display:inline-block;margin-top:12px;font-size:12.5px;font-weight:750;color:var(--muted);}
.btn{all:unset;cursor:pointer;font-size:13px;font-weight:800;padding:9px 14px;border-radius:12px;background:color-mix(in srgb,var(--ink) 6%,transparent);border:1px solid var(--line);text-align:center;min-width:44px;}
.btn.on{background:color-mix(in srgb,var(--sc,var(--light)) 22%,transparent);border-color:color-mix(in srgb,var(--sc,var(--light)) 55%,transparent);}
.btn:active{transform:scale(.97);} .btn[disabled]{opacity:.4;pointer-events:none;}
.btn:focus-visible,.chip:focus-visible,.seg button:focus-visible,#back:focus-visible{box-shadow:0 0 0 2px var(--ink);}
input[type=range]{flex:1 1 auto;accent-color:var(--light);height:28px;}
.big{font-size:30px;font-weight:800;letter-spacing:-.5px;font-variant-numeric:tabular-nums;}
.cam{width:100%;border-radius:10px;margin-top:10px;display:block;background:#000;aspect-ratio:16/9;object-fit:cover;}
#list{flex:1 1 auto;min-height:0;overflow:auto;display:flex;flex-direction:column;}
#list .lh{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);margin:2px 0 8px;}
#rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;align-content:start;}
#rows.many{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;} #rows.many .chip{padding:6px 8px;}
.chip{all:unset;cursor:pointer;display:flex;align-items:center;gap:8px;min-width:0;padding:8px 10px;border-radius:12px;background:color-mix(in srgb,var(--ink) 3.5%,transparent);border:1px solid var(--line);}
.chip i{flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:var(--dim);}
.chip.on{border-color:color-mix(in srgb,var(--sc) 45%,transparent);background:color-mix(in srgb,var(--sc) 10%,transparent);}
.chip.on i{background:var(--sc);box-shadow:0 0 8px -1px var(--sc);}
.chip .t{min-width:0;flex:1 1 auto;}
.chip .n{font-size:12.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.chip .s{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
/* mini: floors and rooms only, a summary beside it, tap to open the full ring */
#minibox{display:none;}
ha-card.mini{background:transparent;box-shadow:none;border:0;}
#app.mini{height:var(--hr-height,220px);grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);grid-template-rows:minmax(0,1fr);gap:10px;padding:10px 12px;cursor:pointer;
  background:var(--cardgrad);border:1px solid color-mix(in srgb,var(--ink) 10%,transparent);border-radius:var(--ha-card-border-radius,16px);}
#app.mini #side,#app.mini .hots{display:none;}
.tools:not(:has(#legend:not([style*="none"]))){display:none;}
#app.mini #minibox{display:flex;flex-direction:column;justify-content:center;gap:7px;min-width:0;}
#minibox .mt{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:800;}
#minibox .mt span{margin-left:auto;font-size:12px;font-weight:700;color:var(--muted);}
#minibox .ml{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
#minibox .ml i{flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:var(--sc);box-shadow:0 0 8px -1px var(--sc);}
#minibox .ml.off{color:var(--dim);} #minibox .ml.off i{background:var(--dim);box-shadow:none;}
/* narrow (phones, small cards): the ring on top, the hot buttons as a row above it, the panel underneath */
@container hr (max-width: 760px){
  #app:not(.mini){height:auto;grid-template-columns:minmax(0,1fr);}
  #app:not(.mini) #stage{display:flex;flex-direction:column;gap:8px;}
  #app:not(.mini) .hots{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;}
  #app:not(.mini) .hot{position:relative;left:auto;top:auto;right:auto;bottom:auto;width:auto;padding:8px 9px;border-radius:13px;}
  #app:not(.mini) .hot .hi{font-size:12px;gap:5px;} #app:not(.mini) .hot svg{width:18px;height:18px;}
  #app:not(.mini) .hot .hv{font-size:11px;}
  #app:not(.mini) #ringbox{position:relative;inset:auto;width:100%;aspect-ratio:1;}
  #app:not(.mini) #gear{right:0;width:36px;height:36px;}
  #app:not(.mini) #ctl,#app:not(.mini) #list{overflow:visible;flex:none;}
  #app:not(.mini) #bar{flex-direction:column;align-items:stretch;}
  #app:not(.mini) #filt{flex:none;}
  #app:not(.mini) #bar .bset{margin-left:0;}
}
@container hr (max-width: 420px){
  #app:not(.mini) .hot .hv{display:none;}
  #app:not(.mini){padding:10px;}
  #app:not(.mini) .hots{gap:5px;}
  #app:not(.mini) .hot{padding:7px 6px;align-items:center;}
  #app:not(.mini) .hot .hi{flex-direction:column;gap:3px;font-size:11px;}
  #app:not(.mini) .hot .md{position:absolute;top:6px;right:6px;}
}
`;

const HR_HTML = `
<ha-card>
<div id="app">
  <div id="bar">
    <div id="filt" role="group" aria-label="Show these kinds"></div>
    <div class="bset">
      <div class="seg" id="mode" role="group" aria-label="Arrange by"><button data-m="rooms">By room</button><button data-m="systems">By system</button></div>
      <div class="seg" id="view" role="group" aria-label="Show" hidden><button data-v="mine" title="Your setup: hidden things left out, your groups shown">My view</button><button data-v="all" title="Every thing in its real room, with hidden ones dimmed">Everything</button></div>
      <div class="seg" id="lockseg" hidden><button id="lock" aria-pressed="false"></button><button id="tidy" hidden title="Lay the rooms out afresh and lock them there">Re-tidy</button></div>
    </div>
  </div>
  <div id="stage">
    <div class="hots">
      <button class="hot tl"></button><button class="hot tr"></button><button class="hot bl"></button><button class="hot br"></button>
    </div>
    <div id="ringbox"><svg id="ring" aria-label="Home ring"></svg><button id="gear" hidden></button><div id="slide"></div><div id="toast" role="status" aria-live="polite"></div></div>
    <div id="wait">Waiting for Home Assistant…</div>
  </div>
  <div id="minibox"></div>
  <div id="side">
    <div class="card">
      <div style="display:flex;align-items:center;gap:8px"><div id="crumbs"></div><button id="back" hidden></button></div>
      <div id="title">Home</div>
      <div id="summary"></div>
      <div class="tools"><div id="legend" title="Room colour shows its thermostat's temperature: blue = cold, orange = warm">Cold<i></i>Warm</div></div>
    </div>
    <div class="card" id="ctl"></div>
    <div class="card" id="list"><div class="lh" id="lh"></div><div id="rows"></div></div>
  </div>
</div>
</ha-card>`;

/* ---------- small helpers ---------- */
const NS = 'http://www.w3.org/2000/svg', TAU = Math.PI * 2;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { const x = parseFloat(v); return isFinite(x) ? x : null; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, easeIO = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const asList = v => v == null || v === false ? [] : Array.isArray(v) ? v : [v];
// a list of patterns: an entity id, or part of one with * wildcards ("light.tablet_*", "*_segment_*");
// anything else is a word looked for in the name ("screen")
function matcher(list) {
  const L = asList(list).map(String).filter(Boolean).map(p => !/\s/.test(p) && (p.includes('*') || /^[a-z_]+\.[a-z0-9_]+$/i.test(p))
    ? { re: new RegExp('^' + p.split('*').map(escRe).join('.*') + '$', 'i') } : { word: p.toLowerCase() });
  return (eid, name) => L.some(m => m.re ? m.re.test(eid) : (String(name || '') + ' ' + eid.replace(/_/g, ' ')).toLowerCase().includes(m.word));
}

/* ---------- the kinds of thing, and how they look ---------- */
const CATS = {
  lights:  { name: 'Lights', sc: 'var(--light)' },
  heating: { name: 'Heating', sc: 'var(--heat)' },
  media:   { name: 'TV & music', sc: 'var(--media)' },
  sensors: { name: 'Doors & motion', sc: 'var(--alert)' },
  safety:  { name: 'Safety', sc: 'var(--alert)' },
  alarm:   { name: 'Alarm', sc: 'var(--alert)' },
  locks:   { name: 'Locks', sc: 'var(--alert)' },
  cameras: { name: 'Cameras', sc: 'var(--cam)' },
  fans:    { name: 'Fans', sc: 'var(--fan)' },
  covers:  { name: 'Blinds', sc: 'var(--fan)' },
  valves:  { name: 'Valves', sc: 'var(--fan)' },
  vacuums: { name: 'Vacuums', sc: 'var(--media)' },
  sirens:  { name: 'Sirens', sc: 'var(--alert)' },
  plugs:   { name: 'Plugs', sc: 'var(--plug)' },
  readings: { name: 'Sensors', sc: 'var(--fan)' },
  other:   { name: 'Other', sc: 'var(--cam)' },
};
const NO_COUNT = ['readings', 'other'];                    // never counted in "… on" summaries
const CAT_ORDER = Object.keys(CATS);
CATS.power = { name: 'Power', sc: 'var(--light)' };     // energy readings only show in the By-system view
const SYSTEMS = [
  { id: 'lights', name: 'Lights', cats: ['lights'], hue: '#e0a33a' },
  { id: 'heating', name: 'Heating', cats: ['heating', 'fans'], hue: '#e4704f' },
  { id: 'energy', name: 'Energy', cats: ['power', 'plugs'], hue: '#2fb8a6' },
  { id: 'media', name: 'TV & music', cats: ['media'], hue: '#3fbf7f' },
  { id: 'security', name: 'Security', cats: ['alarm', 'safety', 'sensors', 'locks', 'sirens', 'cameras'], hue: '#a77cf2' },
  { id: 'covers', name: 'Blinds & valves', cats: ['covers', 'valves'], hue: '#5b8def' },
  { id: 'other', name: 'Other', cats: ['vacuums', 'readings', 'other'], hue: '#8a97a6' },
];
const ENERGY_COLOURS = { solar: 'var(--light)', battery: 'var(--plug)', battery_level: 'var(--plug)', grid: 'var(--alert)', load: 'var(--media)', other: 'var(--fan)' };
const SENSOR_CLASSES = ['door', 'window', 'garage_door', 'opening', 'motion', 'occupancy', 'presence'];
const SAFETY_LABEL = { moisture: 'Water leak', smoke: 'Smoke', gas: 'Gas', carbon_monoxide: 'Carbon monoxide', safety: 'Safety alarm' };
// never a thing of its own on the ring (scenes have their band; the rest is housekeeping)
const NEVER = ['scene', 'update', 'image', 'automation', 'zone', 'person', 'device_tracker', 'tts', 'stt', 'wake_word', 'conversation',
  'assist_satellite', 'sun', 'weather', 'calendar', 'todo', 'text', 'notify', 'ai_task', 'time', 'date', 'datetime'];
// what a device with no ring kind is shown by (its first match), before its readings
const PRIMARY = ['remote', 'script', 'button', 'input_button', 'select', 'input_select', 'number', 'input_number'];
const FLOOR_HUES = ['#5b8def', '#a77cf2', '#2fb8a6', '#e0a33a', '#e46f8f'];
// the built-in kind colours as plain hex, for the colour picker; and the quick choices it offers
const VAR_HEX = { 'var(--light)': '#ffb638', 'var(--plug)': '#30d1b4', 'var(--heat)': '#ff7a45', 'var(--media)': '#39d98a', 'var(--alert)': '#ff5a5a', 'var(--fan)': '#4bc0e0', 'var(--cam)': '#b088ff' };
const SWATCHES = ['#ffb638', '#ff7a45', '#ff5a5a', '#e46f8f', '#b088ff', '#5b8def', '#4bc0e0', '#30d1b4', '#39d98a', '#8a97a6'];
const okHex = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
const toHex = v => okHex(v) ? v.toLowerCase() : VAR_HEX[v] || '#8a97a6';
const PROFILE_V = 1;                                    // the setup format this version writes; a newer one is never written over
const RING_WT = { floor: 1, area: 1.12, cat: 0.82, ent: 1.08 };
const HOLD_MS = 480, MOVE_PX = 10, SLIDE_PX = 2.2;      // a 220 px slide covers 0-100 %
const MINI_LEVELS = 2;                                  // mini: floors + rooms

function normaliseConfig(c) {
  c = c || {};
  const heating = c.heating || {};
  return {
    mini: !!c.mini,
    height: c.height || null,
    mode: c.mode === 'systems' ? 'systems' : 'rooms',
    navigation_path: c.navigation_path || null,
    back_path: c.back_path || null,
    back_label: c.back_label || 'Back',
    exclude: matcher(c.exclude),
    exclude_areas: asList(c.exclude_areas).map(s => String(s).toLowerCase()),
    strip_prefixes: asList(c.strip_prefixes).map(String).filter(Boolean),
    lights_exclude: matcher(c.lights_exclude),
    scenes: c.scenes === undefined ? true : c.scenes,
    hot_buttons: c.hot_buttons === undefined ? true : c.hot_buttons,
    cameras: Array.isArray(c.cameras) ? c.cameras : null,
    camera_refresh: Math.max(1, num(c.camera_refresh) || 2),
    cameras_path: c.cameras_path || null,
    alarm: c.alarm || null,
    alarm_path: c.alarm_path || null,
    heating_entity: heating.entity || null,
    heating_hold_mode: heating.hold_mode || null,
    energy: asList(c.energy).map(e => typeof e === 'string' ? { entity: e } : e).filter(e => e && e.entity),
    voice_entity: c.voice_entity || null,
    temperature_tint: c.temperature_tint !== false,
    comfort: num(c.comfort_temperature) ?? 20.5,
    span: Math.max(0.5, num(c.temperature_span) ?? 4),
    motion_pulse: c.motion_pulse !== false,
    devices: c.devices !== false,
    safety_alerts: c.safety_alerts !== false,
    layout_lock: c.layout_lock !== false,
    layout_key: String(c.layout_key || 'home_ring_layout'),
    corners: c.corners || null,
    corners_key: String(c.corners_key || 'home_ring_corners'),
    customise: c.customise !== false,
    // 'ring': the ring on its own, tap to switch and Home Assistant's own dialog; 'full': with the corner buttons and the side panel
    layout: c.layout === 'full' ? 'full' : 'ring',
    profile_key: String(c.profile_key || 'home_ring_profile'),
    theme: ['light', 'ha'].includes(c.theme) ? c.theme : 'dark',
    animation_speed: clamp(num(c.animation_speed) ?? 100, 0, 100),
    // how many rings are drawn beyond where you are (0 = all of them); and kinds left out unless picked in the bar
    levels: c.levels === 'all' || c.levels === 0 ? 0 : clamp(Math.round(num(c.levels) ?? 2), 1, 4),
    quiet_kinds: c.quiet_kinds === undefined ? ['readings', 'other'] : asList(c.quiet_kinds).map(String),
  };
}

/* ======================================================================================================
   The ring itself. One per card; everything lives in the card's shadow root.
   ====================================================================================================== */
function createRing(sr, host, CFG) {
  const $ = id => sr.getElementById(id);
  const Q = s => sr.querySelector(s), QA = s => sr.querySelectorAll(s);
  const PFX = 'hr' + Math.random().toString(36).slice(2, 7) + '-';   // ids for the curved-label paths
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MINI = CFG.mini;
  if (MINI) { $('app').classList.add('mini'); Q('ha-card').classList.add('mini'); }
  if (CFG.height) $('app').style.setProperty('--hr-height', CFG.height);
  if (!CFG.hot_buttons) { QA('.hot').forEach(b => b.hidden = true); $('app').classList.add('nohots'); }
  if (!CFG.temperature_tint) $('legend').style.display = 'none';

  const LS = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  let MODE = LS.get('homeRingMode') || CFG.mode; if (MODE !== 'systems') MODE = 'rooms';
  // 'mine' = the Customise setup applied; 'all' = every thing in its real room, nothing hidden (hidden ones dimmed), no groups
  let VIEW = !MINI && LS.get('homeRingView') === 'all' ? 'all' : 'mine';
  // kinds picked in the bar (null = the usual: everything but the quiet kinds) and rings drawn at once; both per screen
  let FILTER = null; try { const v = JSON.parse(LS.get('homeRingFilter') || 'null'); if (Array.isArray(v) && v.length) FILTER = v.filter(c => CATS[c]); if (FILTER && !FILTER.length) FILTER = null; } catch (e) {}
  if (MINI) FILTER = null;
  let LEVELS = MINI ? MINI_LEVELS : (() => { const v = LS.get('homeRingLevels'); return v == null ? CFG.levels : clamp(+v || 0, 0, 4); })();
  const QUIET = new Set(CFG.quiet_kinds);
  let RINGONLY = !MINI && (LS.get('homeRingLayout') || CFG.layout) === 'ring';
  const applyLayout = () => { $('app').classList.toggle('ringonly', RINGONLY); $('app').classList.toggle('nohots', RINGONLY || !CFG.hot_buttons); };
  applyLayout();
  const shows = c => c === 'power' || (FILTER ? FILTER.includes(c) : !QUIET.has(c));
  const filtering = () => !MINI && (!!FILTER || QUIET.size > 0);
  // animation speed, per screen: 0 = instant, 100 = the normal glide (0.75 s). Set in Customise.
  const FULL_MS = 750;
  let SPEED = num(LS.get('homeRingSpeed')) ?? CFG.animation_speed; SPEED = clamp(SPEED, 0, 100);
  const animMs = () => Math.round(FULL_MS * SPEED / 100);
  const ENERGY_BY = Object.fromEntries(CFG.energy.map(e => [e.entity, e]));

  const navigate = p => { if (!p) return; window.history.pushState(null, '', p); window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } })); };
  const moreInfo = eid => { if (eid) host.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: eid }, bubbles: true, composed: true })); };

  /* ---------- what goes in the ring ---------- */
  const isMotion = (eid, a) => eid.startsWith('binary_sensor.') && (a.device_class === 'motion' || ((a.device_class === 'occupancy' || a.device_class === 'presence') && /person|motion/.test(eid)));
  function tempTint(t) { const k = clamp(Math.abs(t - CFG.comfort) / CFG.span, 0, 1); return k < .08 ? null : { col: t < CFG.comfort ? '#4a8dff' : '#ff8a3d', pct: Math.round(12 + 38 * k) }; }
  function catOf(eid, st) {
    const d = eid.split('.')[0], a = st.attributes || {};
    if (d === 'light') return 'lights';
    if (d === 'switch') return /light|lamp|bulb/i.test(eid + ' ' + (a.friendly_name || '')) ? 'lights' : 'plugs';
    if (d === 'climate' || d === 'water_heater') return 'heating';
    if (d === 'media_player') return 'media';
    if (d === 'camera') return 'cameras';
    if (d === 'fan') return 'fans';
    if (d === 'cover') return 'covers';
    if (d === 'binary_sensor') return SAFETY_LABEL[a.device_class] ? 'safety' : SENSOR_CLASSES.includes(a.device_class) ? 'sensors' : null;
    if (d === 'alarm_control_panel') return 'alarm';
    if (d === 'lock') return 'locks';
    if (d === 'valve') return 'valves';
    if (d === 'vacuum' || d === 'lawn_mower') return 'vacuums';
    if (d === 'siren') return 'sirens';
    if (d === 'humidifier') return 'heating';
    if (d === 'input_boolean') return 'other';
    return null;
  }
  function watts(eid, st) {
    const v = num(st && st.state); if (v == null) return null;
    const u = ((st.attributes || {}).unit_of_measurement || '').toLowerCase(), e = ENERGY_BY[eid];
    const w = u === 'kw' ? v * 1000 : u === 'w' ? v : null;
    return w == null ? null : (e && e.invert ? -w : w);
  }
  function isActive(eid, st) {
    if (!st) return false;
    const d = eid.split('.')[0], s = st.state, a = st.attributes || {};
    if (d === 'climate') return a.hvac_action === 'heating' || a.hvac_action === 'cooling';
    if (d === 'water_heater') return !['off', 'unavailable', 'unknown', 'idle'].includes(s) && a.operation_mode !== 'off';
    if (d === 'media_player') return s === 'playing';
    if (d === 'cover') return s === 'open' || s === 'opening';
    if (d === 'camera') return false;
    if (d === 'alarm_control_panel') return !['disarmed', 'unavailable', 'unknown'].includes(s);
    if (d === 'sensor') { const w = watts(eid, st); return w != null && Math.abs(w) >= 40; }
    if (d === 'lock') return ['unlocked', 'open', 'opening', 'unlocking', 'jammed'].includes(s);
    if (d === 'valve') return s === 'open' || s === 'opening';
    if (d === 'vacuum' || d === 'lawn_mower') return ['cleaning', 'mowing', 'returning'].includes(s);
    return s === 'on';
  }
  const unavail = st => !st || st.state === 'unavailable' || st.state === 'unknown';
  function stateText(eid, st) {
    if (!st) return 'missing';
    const d = eid.split('.')[0], s = st.state, a = st.attributes || {};
    if (s === 'unavailable') return 'unavailable';
    if (d === 'light') return s === 'on' ? (a.brightness != null ? Math.round(a.brightness / 2.55) + '%' : 'on') : 'off';
    if (d === 'climate') return (a.current_temperature != null ? a.current_temperature + '°' : '') + (a.temperature != null ? ' → ' + a.temperature + '°' : '') + (a.hvac_action === 'heating' ? ' · heating' : a.hvac_action === 'cooling' ? ' · cooling' : '');
    if (d === 'media_player') return s === 'playing' ? (a.media_title || 'playing') : s;
    if (d === 'alarm_control_panel') return s.replace(/_/g, ' ');
    if (d === 'lock' || d === 'valve' || d === 'vacuum' || d === 'lawn_mower') return nice(s);
    if (d === 'button' || d === 'input_button') return isFinite(Date.parse(s)) ? 'pressed ' + hhmm(s) : 'never pressed';
    if (d === 'event') return isFinite(Date.parse(s)) ? nice(a.event_type || 'event') + ' · ' + hhmm(s) : 'nothing yet';
    if (d === 'number' || d === 'input_number') return s + (a.unit_of_measurement ? ' ' + a.unit_of_measurement : '');
    if (d === 'binary_sensor') { const open = ['door', 'window', 'garage_door', 'opening'].includes(a.device_class); return s === 'on' ? (open ? 'open' : 'detected') : (open ? 'closed' : 'clear'); }
    if (d === 'sensor') {
      const v = num(s), u = a.unit_of_measurement || ''; if (v == null) return s;
      const w = watts(eid, st), kind = (ENERGY_BY[eid] || {}).kind;
      if (w != null) {
        const m = Math.abs(w), t = m >= 1000 ? (m / 1000).toFixed(1) + ' kW' : Math.round(m) + ' W';
        if (kind === 'grid') return m < 40 ? 'idle' : (w > 0 ? 'importing ' : 'exporting ') + t;
        if (kind === 'battery') return m < 40 ? 'idle' : (w > 0 ? 'charging ' : 'discharging ') + t;
        return t;
      }
      if (a.device_class === 'timestamp') return isFinite(Date.parse(s)) ? hhmm(s) : s;
      const r = Math.abs(v) >= 100 || Number.isInteger(v) ? Math.round(v) : Math.round(v * 10) / 10;
      return r + (u === '%' ? '%' : u ? ' ' + u : '');
    }
    if (a.device_class === 'timestamp' && isFinite(Date.parse(s))) return hhmm(s);
    return s;
  }
  const STRIP = CFG.strip_prefixes.length ? new RegExp('^(' + CFG.strip_prefixes.map(escRe).join('|') + ')\\s+', 'i') : null;
  function shortName(st, eid, area, text) {
    let n = text || (st && st.attributes && st.attributes.friendly_name) || eid.split('.')[1].replace(/_/g, ' ');
    if (STRIP) n = n.replace(STRIP, '');
    if (area) {          // "Kitchen Ceiling" in the Kitchen is just "Ceiling" (but "Utility Room" never becomes "Room")
      const re = new RegExp('^' + escRe(area).replace(/s\b/gi, "'?s") + '\\s+', 'i'), m = n.replace(re, '');
      if (m.length > 2 && !/^(room|lights?)$/i.test(m)) n = m;
    }
    n = n.replace(/\b(\w+)\s+\1\b/gi, '$1');   // "Microphone Microphone mute" -> "Microphone mute"
    return n.charAt(0).toUpperCase() + n.slice(1);
  }

  /* ---------- the tree: Home > floors > rooms > kinds > things ---------- */
  let nodes = [], root = null, focus = null, sel = null, hot = null, hoverN = null, H = null, lastStates = null;
  /* ---------- the setup made on screen with Customise: what is hidden, renamed, moved to another kind, and the corners.
     hide: 'e:<entity id>', 'd:<device id>', 'a:<area id>', 'f:<floor id>' or 'c:<area id>:<kind>' (one kind in one room)
     name: the same keys -> the name to show;  cat: entity id -> kind;  nol: lights left out of room and house switching
     groups: [{ id, name }] = rooms of your own, shown as area 'g:<id>' in a "Groups" segment;  grp: entity id -> group id.
     A thing in a group leaves its real room in My view; the Everything view shows it back where it really is. */
  // pos: kind (or system) -> where it sits, in degrees clockwise from the top;  col: 'k:<kind>', 'f:', 'a:' or 'e:' keys -> '#rrggbb'
  // theme: 'dark', 'light' or 'ha' (follow Home Assistant's theme)
  const emptyProfile = () => ({ v: PROFILE_V, hide: [], name: {}, cat: {}, nol: [], groups: [], grp: {}, corners: null, pos: {}, col: {}, theme: null });
  let PROF = emptyProfile(), HIDE = new Set(), NOL = new Set();
  const kindCol = c => PROF.col['k:' + c] || (CATS[c] ? CATS[c].sc : (SYSTEMS.find(x => x.id === c) || {}).hue || 'var(--light)');
  const kindName2 = c => (CATS[c] || SYSTEMS.find(x => x.id === c) || { name: c }).name;
  const anchorOf = k => k.kind === 'cat' ? PROF.pos[k.cat] : k.sys ? PROF.pos[k.sys] : undefined;
  // kinds (or systems) given a place: in that order round the ring, the rest together in the widest gap between them
  function placeKids(n) {
    const A = n.kids.filter(k => anchorOf(k) != null).sort((p, q) => anchorOf(p) - anchorOf(q)); if (!A.length) return;
    const free = n.kids.filter(k => anchorOf(k) == null);
    let gi = A.length - 1, best = -1;
    A.forEach((k, i) => { const g = i + 1 < A.length ? anchorOf(A[i + 1]) - anchorOf(k) : 360 - anchorOf(k) + anchorOf(A[0]); if (g > best) { best = g; gi = i; } });
    n.kids = A.slice(0, gi + 1).concat(free, A.slice(gi + 1)); n.anchored = true;
  }
  host.setAttribute('data-theme', CFG.theme);
  /* ---------- layout lock: every floor, room, kind and thing keeps its place and size ----------
     A saved layout lists, for every group, its children in order with their sizes, and where each room's centre
     was. While it is locked, known things keep their saved order and size, new ones join the end of their group,
     and the ring turns slightly so the rooms you know stay where they were. */
  const nodeKey = n => n.kind === 'home' ? 'h' : n.kind === 'floor' ? 'f:' + (n.id ?? '_') : n.kind === 'area' ? 'a:' + n.id : n.kind === 'cat' ? 'c:' + n.cat : 'e:' + n.eid;
  const pathKey = n => n.parent ? pathKey(n.parent) + '/' + nodeKey(n) : nodeKey(n);
  let LAYOUT = null;
  function applyLock(n, order) {
    if (!n.kids.length) return;
    const saved = order[pathKey(n)];
    if (saved) {
      const idx = new Map(saved.map((s, i) => [s[0], i])), wt = new Map(saved);
      n.kids.sort((a, b) => (idx.get(nodeKey(a)) ?? 1e9) - (idx.get(nodeKey(b)) ?? 1e9));   // stable: new ones stay in name order at the end
      // a new room or floor starts slim (Re-tidy gives it its full size); new things squeeze into their room
      n.kids.forEach(k => { const w = wt.get(nodeKey(k)); if (w != null) k.lw = w; else if (k.kind === 'area' || k.kind === 'floor') k.lw = 1; });
    }
    n.kids.forEach(k => applyLock(k, order));
    if (saved && n.kind === 'floor' && n.lw != null) {   // a floor grows or shrinks with the rooms it gains or loses
      const was = saved.reduce((s, x) => s + x[1], 0), now = n.kids.reduce((s, k) => s + (k.lw ?? 1), 0);
      if (was > 0 && now > 0) n.lw *= now / was;
    }
  }
  // whole = the whole house, whatever the bar shows (for the corners, alerts and room switching)
  function build(h, ignoreLock, whole) {
    const keep = c => whole || shows(c);
    const floors = h.floors || {}, devices = h.devices || {}, ents = h.entities || {}, states = h.states;
    const areas = Object.assign({}, h.areas || {});
    const raw = VIEW === 'all', gone = k => !raw && HIDE.has(k);
    for (const a of Object.keys(areas)) { const ar = areas[a]; if (gone('a:' + a) || CFG.exclude_areas.includes(String(a).toLowerCase()) || CFG.exclude_areas.includes(String(ar.name).toLowerCase())) delete areas[a]; }
    areas._energy = { area_id: '_energy', name: 'Energy system', floor_id: null };
    const GRP = {};
    if (!raw) for (const g of PROF.groups) { GRP[g.id] = 'g:' + g.id; areas['g:' + g.id] = { area_id: 'g:' + g.id, name: g.name, floor_id: '~groups', virtual: true }; }
    const place = (eid, area) => GRP[PROF.grp[eid]] || area;
    const flist = Object.values(floors).sort((a, b) => (a.level ?? 99) - (b.level ?? 99) || String(a.name).localeCompare(b.name));
    const byArea = {}, tempBy = {}, devShown = new Set(), left = {};
    const areaOf = r => r && (r.area_id || (r.device_id && devices[r.device_id] && devices[r.device_id].area_id));
    for (const eid in states) {
      const r = ents[eid]; if (!r) continue;                 // only things in the entity registry have rooms
      if (r.hidden || r.entity_category) continue;
      const st = states[eid], nm = (st.attributes || {}).friendly_name;
      if (CFG.exclude(eid, nm)) continue;
      const area = areaOf(r);
      if (!area || !areas[area]) continue;
      // hidden with Customise: its device counts as shown, so the rest of it does not come back as a slice of its own
      if (gone('e:' + eid)) { if (r.device_id) devShown.add(r.device_id); continue; }
      // a room's temperature = its thermostat (other temperature sensors are often batteries or device chips)
      if (eid.startsWith('climate.') && !tempBy[area] && num((st.attributes || {}).current_temperature) != null) tempBy[area] = eid;
      const c = PROF.cat[eid] || catOf(eid, st);
      if (c) { if (r.device_id) devShown.add(r.device_id); const at = place(eid, area); if (!gone('c:' + at + ':' + c) && keep(c)) (byArea[at] = byArea[at] || []).push({ eid, c }); continue; }
      // no ring kind of its own: it belongs to its device (or stands alone if it has none)
      if (!CFG.devices || NEVER.includes(eid.split('.')[0])) continue;
      const key = r.device_id || '~' + eid; (left[key] = left[key] || { area, eids: [] }).eids.push(eid);
    }
    // every device with a room is on the ring: one slice for a device that has nothing on it yet, shown by its most
    // useful entity, with the rest as readings on its card. A device already on the ring carries its extras the same way.
    READ = {};
    for (const key in left) {
      const L = left[key], dev = key[0] === '~' ? null : devices[key];
      if (dev && devShown.has(key)) { READ[key] = L.eids; continue; }
      const devName = dev ? (dev.name_by_user || dev.name || '') : '';
      if (dev && devName && CFG.exclude('', devName)) continue;
      if (dev && gone('d:' + key)) continue;
      const primary = pickPrimary(L.eids, states); if (!primary) continue;
      const c = L.eids.every(e => /^(sensor|binary_sensor|event)\./.test(e)) ? 'readings' : 'other';
      const at = place(primary, L.area);
      if (gone('c:' + at + ':' + c) || !keep(c)) continue;
      (byArea[at] = byArea[at] || []).push({ eid: primary, c, dev: dev ? key : null, devName });
      if (dev) READ[key] = L.eids;
    }
    const sysMode = MODE === 'systems' && !MINI;
    if (sysMode) for (const e of CFG.energy) {
      if (!states[e.entity] || gone('e:' + e.entity)) continue;
      const area = areaOf(ents[e.entity]), a = area && areas[area] ? area : '_energy';
      (byArea[a] = byArea[a] || []).push({ eid: e.entity, c: 'power' });
    }
    const mk = (kind, name, extra) => Object.assign({ kind, name, kids: [], parent: null }, extra || {});
    const entNode = (x, a, hue) => {
      const e = x.c === 'power' ? ENERGY_BY[x.eid] : null;
      const auto = e && e.name ? e.name : shortName(states[x.eid], x.eid, areas[a].name, x.devName);
      // a thing wears its kind's colour (or its own) in both views: faint when off, strong when on
      const own = PROF.col['e:' + x.eid] || (e ? (e.color || ENERGY_COLOURS[e.kind] || ENERGY_COLOURS.other) : kindCol(x.c));
      return mk('ent', PROF.name['e:' + x.eid] || auto,
        { auto, hid: raw && (HIDE.has('e:' + x.eid) || (!!x.dev && HIDE.has('d:' + x.dev))), hue: own, cat: x.c, sc: own, eid: x.eid, dev: x.dev || null });
    };
    const R = mk('home', 'Home');
    const aName = a => PROF.name['a:' + a] || areas[a].name;
    const byName = (a, b) => aName(a).localeCompare(aName(b));
    if (sysMode) {
      for (const sy of SYSTEMS) {
        if (gone('f:sys:' + sy.id)) continue;
        const sn = mk('floor', sy.name, { hid: raw && HIDE.has('f:sys:' + sy.id), hue: PROF.col['k:' + sy.id] || sy.hue, id: 'sys:' + sy.id, sys: sy.id });
        const areaIds = Object.keys(byArea).filter(a => byArea[a].some(x => sy.cats.includes(x.c))).sort(byName);
        for (const a of areaIds) {
          const an = mk('area', aName(a), { auto: areas[a].name, hid: raw && HIDE.has('a:' + a), virtual: !!areas[a].virtual, hue: sn.hue, id: a, tempEid: tempBy[a] });
          byArea[a].filter(x => sy.cats.includes(x.c)).map(x => entNode(x, a, sn.hue))
            .sort((p, q) => p.name.localeCompare(q.name)).forEach(e => { e.parent = an; an.kids.push(e); });
          an.parent = sn; sn.kids.push(an);
        }
        if (sn.kids.length) { sn.parent = R; R.kids.push(sn); }
      }
    } else {
      const roomNode = (a, hue) => {
        hue = PROF.col['a:' + a] || hue;
        const an = mk('area', aName(a), { auto: areas[a].name, hid: raw && HIDE.has('a:' + a), virtual: !!areas[a].virtual, hue, id: a, tempEid: tempBy[a] });
        // one kind picked in the bar: its things go straight into the room, without a ring that would only say its name
        if (!whole && FILTER && FILTER.length === 1) {
          byArea[a].map(x => entNode(x, a, hue)).sort((p, q) => p.name.localeCompare(q.name)).forEach(e => { e.parent = an; an.kids.push(e); });
          return an;
        }
        for (const c of CAT_ORDER) {
          const items = byArea[a].filter(x => x.c === c); if (!items.length) continue;
          const cn = mk('cat', CATS[c].name, { hid: raw && HIDE.has('c:' + a + ':' + c), hue: kindCol(c), cat: c, sc: kindCol(c) });
          items.map(x => entNode(x, a, hue)).sort((p, q) => p.name.localeCompare(q.name)).forEach(e => { e.parent = cn; cn.kids.push(e); });
          cn.parent = an; an.kids.push(cn);
        }
        return an;
      };
      const roomsOn = fid => Object.keys(areas).filter(a => a !== '_energy' && (areas[a].floor_id || null) === fid && byArea[a]).sort(byName);
      if (!flist.length) {                                    // no floors set up: the rooms go straight round the house
        roomsOn(null).concat(roomsOn('~groups')).forEach((a, i) => { const an = roomNode(a, FLOOR_HUES[i % FLOOR_HUES.length]); an.parent = R; R.kids.push(an); });
      } else {
        const groups = flist.map((f, i) => ({ f, hue: FLOOR_HUES[i % FLOOR_HUES.length] }));
        groups.push({ f: { floor_id: null, name: 'Other rooms' }, hue: '#8a97a6' });
        groups.push({ f: { floor_id: '~groups', name: 'Groups' }, hue: '#d98ac0', fixed: true });      // rooms of your own
        for (const g of groups) {
          if (gone('f:' + (g.f.floor_id ?? '_'))) continue;
          const fn = mk('floor', (g.f.floor_id && PROF.name['f:' + g.f.floor_id]) || g.f.name, { auto: g.f.name, hid: raw && HIDE.has('f:' + (g.f.floor_id ?? '_')), fixed: !!g.fixed, hue: PROF.col['f:' + (g.f.floor_id ?? '_')] || g.hue, id: g.f.floor_id });
          for (const a of roomsOn(g.f.floor_id || null)) { const an = roomNode(a, fn.hue); an.parent = fn; fn.kids.push(an); }
          if (fn.kids.length) { fn.parent = R; R.kids.push(fn); }
        }
      }
    }
    const snap = !ignoreLock && !raw && !whole && !FILTER && CFG.layout_lock && LAYOUT && LAYOUT.modes && LAYOUT.modes[sysMode ? 'systems' : 'rooms'];
    if (snap && snap.order) applyLock(R, snap.order);
    (function placeAll(n) { if (n.kids.length) { placeKids(n); n.kids.forEach(placeAll); } })(R);
    nodes = [];
    (function walk(n, d) { if (n.parent && n.parent.hid) n.hid = true; n.depth = d; n.i = nodes.length; nodes.push(n); n.kids.forEach((k, j) => { k.alt = j % 2 === 1; walk(k, d + 1); }); })(R, 0);
    (function weigh(n) { n.w = n.kids.length ? n.kids.reduce((s, k) => s + weigh(k), 0) : 1; return n.w; })(R);
    (function part(n, x0, x1) {   // sizes grow with the number of things, gently (a locked layout keeps its saved sizes)
      n.x0 = x0; n.x1 = x1; const ws = n.kids.map(k => k.lw ?? Math.pow(k.w, .6)), t = ws.reduce((a, b) => a + b, 0) || 1; let x = x0;
      n.kids.forEach((k, i) => { const x2 = x + (x1 - x0) * ws[i] / t; part(k, x, x2); x = x2; });
    })(R, 0, 1);
    // locked: turn the ring so the rooms you know sit, on average, exactly where they were saved
    R.rot = 0;
    if (snap && snap.centres && !R.anchored) {
      let s = 0, sw = 0;
      for (const n of nodes) {
        if (n.kind !== 'area') continue; const c = snap.centres[pathKey(n)]; if (c == null) continue;
        let d = c - (n.x0 + n.x1) / 2; d -= Math.round(d); const w = n.x1 - n.x0; s += d * w; sw += w;
      }
      if (sw) R.rot = s / sw;
    }
    // placed kinds: turn the ring, for that room (or for By system), so each sits as close to its place as the sizes allow
    for (const n of nodes) if (n.anchored) {
      let sx = 0, sy = 0;
      for (const k of n.kids) {
        const a = anchorOf(k); if (a == null) continue;
        const c = ((k.x0 + k.x1) / 2 - n.x0) / ((n.x1 - n.x0) || 1), d = a / 360 - (c - .5);
        sx += Math.cos(d * TAU); sy += Math.sin(d * TAU);
      }
      n.rot = Math.atan2(sy, sx) / TAU;
    }
    return R;
  }
  const leaves = n => n.kind === 'ent' ? [n] : n.kids.flatMap(leaves);
  // the whole house, even when the bar shows only some kinds: corners, alerts, motion and room switching use this
  let HOUSE = null, houseNodes = [], drawnBy = new Map(), houseBy = new Map();
  const house = () => HOUSE || root;
  const twinOf = n => n && (drawnBy.get(pathKey(n)) || (n.kind === 'ent' ? nodes.find(m => m.kind === 'ent' && m.eid === n.eid) : null) || null);   // the drawn slice for a place in the whole house
  const wholeOf = n => n && (houseBy.get(pathKey(n)) || n);   // and the other way round
  let READ = {};                                          // device id -> its entities that are not on the ring
  function pickPrimary(eids, states) {
    for (const d of PRIMARY) { const e = eids.find(x => x.startsWith(d + '.')); if (e) return e; }
    const ok = x => states[x] && !unavail(states[x]);
    const cls = c => eids.find(x => x.startsWith('sensor.') && ok(x) && (states[x].attributes || {}).device_class === c && num(states[x].state) != null);
    // a room sensor (temperature with humidity, or just a few readings) is best shown by its temperature;
    // bigger kit (inverters, chargers, batteries) by its power, then its charge
    const climate = cls('humidity') || eids.length <= 4;
    return (climate && cls('temperature')) || cls('power') || cls('battery') || cls('temperature') || cls('humidity') || eids.find(x => x.startsWith('binary_sensor.') && ok(x))
      || eids.find(x => x.startsWith('sensor.') && ok(x) && num(states[x].state) != null) || eids.find(x => !x.startsWith('event.') && ok(x)) || eids[0];
  }
  const devOf = n => n.dev || ((H && H.entities && H.entities[n.eid]) || {}).device_id || null;
  const findSame = n => { if (!n) return null; const k = pathKey(n); return nodes.find(m => m.kind === n.kind && pathKey(m) === k) || null; };   // by id, so a rename keeps your place

  /* ---------- geometry + drawing ---------- */
  const svg = $('ring'); let gW, gL, gC, gS, defs, S = 800, B = [], RMAX = 0, SCN = null, anim = null;
  const view = { x0: 0, x1: 1, d: 0, r: 0 };            // r: how far the ring is turned, in turns (the place you are in decides)
  function setup() {
    svg.innerHTML = '<defs></defs><g class="gw"></g><g class="gl"></g><g class="gs"></g><g class="gc"></g>';
    defs = svg.querySelector('defs'); gW = svg.querySelector('.gw'); gL = svg.querySelector('.gl'); gS = svg.querySelector('.gs'); gC = svg.querySelector('.gc');
  }
  function geom(at) {
    const r = $('ringbox').getBoundingClientRect(); S = Math.max(280, Math.floor(Math.min(r.width, r.height || r.width)));
    const n = at || focus || root, kinds = []; for (let q = n.kids[0]; q; q = q.kids[0]) kinds.push(q.kind);
    if (LEVELS) kinds.splice(LEVELS);
    const wt = (kinds.length ? kinds : ['ent']).map(k => RING_WT[k] || 1), sum = wt.reduce((a, b) => a + b, 0);
    const band = !MINI && n.kind === 'home' && sceneList().length > 1, SB = band ? clamp(S * .05, 28, 42) : 0;
    const R0 = clamp(S * .115, 48, 92), avail = S / 2 - 8 - R0 - (band ? SB + 8 : 0);
    B = [R0]; wt.forEach(w => B.push(B[B.length - 1] + avail * w / sum)); RMAX = B[B.length - 1];
    SCN = band ? [RMAX + 8, RMAX + 8 + SB] : null;
    svg.setAttribute('viewBox', `${-S / 2} ${-S / 2} ${S} ${S}`);
  }
  function edge(k) { if (k < 0) return Math.max(0, B[0] * (1 + k)); if (k >= B.length - 1) return RMAX; const i = Math.floor(k); return lerp(B[i], B[i + 1], k - i); }
  // the turn belongs to the place you are in: the locked layout's for the house, the placed kinds' for a room
  const ang = x => clamp((x - view.x0) / (view.x1 - view.x0), 0, 1) * TAU - Math.PI + view.r * TAU;
  const wrapA = a => a - TAU * Math.round(a / TAU);
  const pt = (a, r) => [r * Math.sin(a), -r * Math.cos(a)], f = v => v.toFixed(2);
  function arcD(a0, a1, r0, r1) {
    if (a1 - a0 >= TAU - 1e-5) {
      const o = `M0,${f(-r1)}A${f(r1)},${f(r1)} 0 1 1 0,${f(r1)}A${f(r1)},${f(r1)} 0 1 1 0,${f(-r1)}Z`;
      return r0 < .5 ? o : o + `M0,${f(-r0)}A${f(r0)},${f(r0)} 0 1 0 0,${f(r0)}A${f(r0)},${f(r0)} 0 1 0 0,${f(-r0)}Z`;
    }
    const L = a1 - a0 > Math.PI ? 1 : 0, [x0, y0] = pt(a0, r1), [x1, y1] = pt(a1, r1), [x2, y2] = pt(a1, r0), [x3, y3] = pt(a0, r0);
    return `M${f(x0)},${f(y0)}A${f(r1)},${f(r1)} 0 ${L} 1 ${f(x1)},${f(y1)}L${f(x2)},${f(y2)}A${f(r0)},${f(r0)} 0 ${L} 0 ${f(x3)},${f(y3)}Z`;
  }
  const states = () => (H && H.states) || {};
  const activeCount = n => leaves(n).filter(e => isActive(e.eid, states()[e.eid])).length;
  function roomTemp(n) { if (!n.tempEid) return null; const st = states()[n.tempEid]; return unavail(st) ? null : num((st.attributes || {}).current_temperature); }
  const deg = t => (Math.round(t * 10) / 10) + '°';
  function fillOf(n) {
    if (n.kind === 'home') return 'var(--hub)';
    if (n.kind === 'ent') {
      const st = states()[n.eid];
      if (unavail(st)) return `color-mix(in srgb, ${n.hue} 8%, var(--wedge))`;
      if (isActive(n.eid, st)) return `color-mix(in srgb, ${n.sc} 72%, var(--wedge))`;
      return `color-mix(in srgb, ${n.hue} ${n.alt ? 21 : 15}%, var(--wedge))`;
    }
    if (n.kind === 'cat' && activeCount(n)) return `color-mix(in srgb, ${n.sc} 42%, var(--wedge))`;
    // every other sibling a shade lighter, so two neighbours never share one colour
    const pct = ({ floor: 46, area: 32, cat: 22 }[n.kind] || 20) + (n.alt ? 7 : 0);
    const base = `color-mix(in srgb, ${n.hue} ${pct}%, var(--wedge))`;
    if (n.kind === 'area' && CFG.temperature_tint) { const t = roomTemp(n), tt = t != null && tempTint(t); if (tt) return `color-mix(in srgb, ${tt.col} ${tt.pct}%, ${base})`; }
    return base;
  }
  function draw() {
    for (const n of nodes) {
      const k = n.depth - view.d, a0 = ang(n.x0), a1 = ang(n.x1), r0 = edge(k - 1), r1 = edge(k);
      const vis = k > 0.01 && a1 - a0 > 1e-4 && r1 - r0 > .3 && (!LEVELS || k < LEVELS + .5);
      if (!n.g) { if (!vis) continue; makeWedge(n); }
      n.g.style.display = vis ? '' : 'none'; if (!vis) continue;
      Object.assign(n, { k, a0, a1, r0, r1 }); n.path.setAttribute('d', arcD(a0, a1, r0, r1));
    }
  }
  function makeWedge(n) {
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'w k-' + n.kind); g.dataset.i = n.i;
    g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', n.name);
    const p = document.createElementNS(NS, 'path'); g.appendChild(p); n.g = g; n.path = p; gW.appendChild(g); paint(n);
  }
  function paint(n) {
    if (!n.g) return;
    n.path.style.fill = fillOf(n);
    const act = n.kind !== 'ent' ? activeCount(n) > 0 : isActive(n.eid, states()[n.eid]);
    n.g.classList.toggle('active', act && n.kind !== 'floor'); if (n.sc) n.g.style.setProperty('--sc', n.sc);
    n.g.classList.toggle('pulse', n.kind === 'ent' && n.cat === 'media' && act);
    n.g.classList.toggle('sel', n === sel || n === editN); n.g.classList.toggle('hid', !!n.hid);
  }

  /* ---------- labels ---------- */
  const cv = document.createElement('canvas').getContext('2d');
  const textW = (s, font) => { cv.font = font; return cv.measureText(s).width; };
  const FONT = px => `650 ${px}px -apple-system,"Segoe UI",Roboto,sans-serif`;
  function fitText(s, px, avail) { if (textW(s, FONT(px)) <= avail) return s; while (s.length > 2 && textW(s + '…', FONT(px)) > avail) s = s.slice(0, -1); return s.length > 2 ? s + '…' : null; }
  function subOf(n) {
    if (n.kind === 'ent') return stateText(n.eid, states()[n.eid]);
    const on = activeCount(n);
    if (n.kind === 'cat') return on ? on + ' on' : '';
    const parts = CAT_ORDER.filter(c => !NO_COUNT.includes(c)).map(c => { const k = leaves(n).filter(e => e.cat === c && isActive(e.eid, states()[e.eid])).length; return k ? k + ' ' + CATS[c].name.toLowerCase() : null; }).filter(Boolean);
    const t = n.kind === 'area' ? roomTemp(n) : null;
    return [t != null ? deg(t) : null, ...parts.slice(0, 2)].filter(Boolean).join(' · ');
  }
  function labels() {
    gL.textContent = ''; gC.textContent = ''; defs.textContent = '';
    for (const n of nodes) {
      if (!n.g || n.g.style.display === 'none') continue;
      const k = Math.round(n.k); if (k < 1) continue;
      const { a0, a1, r0, r1 } = n, span = a1 - a0, rm = (r0 + r1) / 2, arc = span * rm, thick = r1 - r0;
      const px = k === 1 ? 15 : k === 2 ? 13.5 : 12.5, sub = subOf(n);
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'lb');
      if (arc > thick * 1.05 && arc > 64) {             // wide: the name curves along the ring
        const mid = wrapA((a0 + a1) / 2), bottom = Math.abs(mid) > Math.PI / 2;
        const name = fitText(n.name, px, arc - 16); if (!name) continue;
        const showS = sub && thick >= 40, rN = showS ? (bottom ? rm - 7 : rm + 7) : rm, rS = bottom ? rm + 10 : rm - 10;
        const mkp = (r, id) => {
          const pad = .004, s = bottom ? a1 - pad : a0 + pad, e = bottom ? a0 + pad : a1 - pad, [x0, y0] = pt(s, r), [x1, y1] = pt(e, r), L = span > Math.PI ? 1 : 0;
          const d = document.createElementNS(NS, 'path'); d.id = id; d.setAttribute('d', `M${f(x0)},${f(y0)}A${f(r)},${f(r)} 0 ${L} ${bottom ? 0 : 1} ${f(x1)},${f(y1)}`); defs.appendChild(d);
        };
        mkp(rN, PFX + 'ln' + n.i);
        g.innerHTML = `<text class="nm" style="font-size:${px}px" dominant-baseline="central"><textPath href="#${PFX}ln${n.i}" startOffset="50%" text-anchor="middle">${esc(name)}</textPath></text>`;
        if (showS) { const s2 = fitText(sub, 10.5, arc - 16); if (s2) { mkp(rS, PFX + 'ls' + n.i); g.innerHTML += `<text class="sub" dominant-baseline="central"><textPath href="#${PFX}ls${n.i}" startOffset="50%" text-anchor="middle">${esc(s2)}</textPath></text>`; } }
      } else {                                            // narrow: the name runs outwards
        const lh = 13, rpx = Math.min(px, 12.5), lines = Math.floor((arc - 3) / lh), avail = thick - 12;
        if (lines < 1 || avail < 20) continue;
        const rows = [[fitText(n.name, rpx, avail), 'nm']]; if (lines >= 2 && sub) rows.push([fitText(sub, 10.5, avail), 'sub']);
        const ok = rows.filter(r => r[0]); if (!ok.length) continue;
        const mid = wrapA((a0 + a1) / 2), dg = mid * 180 / Math.PI, right = mid >= 0, rot = right ? dg - 90 : dg + 90, x = right ? r0 + 7 : -(r0 + 7);
        g.setAttribute('transform', `rotate(${f(rot)})`);
        g.innerHTML = ok.map((r, i) => `<text class="${r[1]}" x="${f(x)}" y="${f((i - (ok.length - 1) / 2) * lh)}" text-anchor="${right ? 'start' : 'end'}" dominant-baseline="central"${r[1] === 'nm' ? ` style="font-size:${rpx}px"` : ''}>${esc(r[0])}</text>`).join('');
      }
      gL.appendChild(g);
    }
    // the centre: where you are
    const c = document.createElementNS(NS, 'g'); c.setAttribute('class', 'ctr');
    const r = B[0]; let nm = focus.name;
    const fpx = r > 70 ? 20 : 16; nm = fitText(nm, fpx, r * 1.75) || nm;
    const sub = focus.kind === 'home' ? homeSummary() : subOf(focus);
    c.innerHTML = `<circle class="hub" r="${f(r - 2)}"></circle><text class="lb cn" text-anchor="middle" dominant-baseline="central" y="${sub ? -9 : 0}" style="font-size:${fpx}px">${esc(nm)}</text>` +
      (sub ? `<text class="lb cs" text-anchor="middle" dominant-baseline="central" y="13">${esc(fitText(sub, 12, r * 1.7) || '')}</text>` : '') +
      (focus.kind !== 'home' ? `<text class="lb cs" text-anchor="middle" dominant-baseline="central" y="${f(r * .62)}">↑ back</text>` : '');
    gC.appendChild(c);
    c.querySelector('circle').addEventListener('click', () => { if (EDIT) { editPick(focus); return; } if (focus.parent) setFocus(focus.parent); });
    drawScenes();
  }
  function homeSummary() { const on = leaves(house()).filter(e => e.cat === 'lights' && isActive(e.eid, states()[e.eid])).length; return on + ' light' + (on === 1 ? '' : 's') + ' on'; }

  /* ---------- scenes: a band around the whole house; tap one to run it ---------- */
  const sceneName = eid => { const st = states()[eid]; return (st && st.attributes && st.attributes.friendly_name) || eid.split('.')[1].replace(/_/g, ' '); };
  function sceneList(noLock) {
    if (!H || !CFG.scenes) return [];
    if (Array.isArray(CFG.scenes)) return CFG.scenes.filter(e => H.states[e]);
    const ents = H.entities || {};
    const L = Object.keys(H.states).filter(e => e.startsWith('scene.') && !(ents[e] && (ents[e].hidden || ents[e].entity_category)) && !CFG.exclude(e, sceneName(e)))
      .sort((a, b) => sceneName(a).localeCompare(sceneName(b)));
    const saved = !noLock && CFG.layout_lock && LAYOUT && LAYOUT.scenes;      // locked: known scenes keep their place, new ones join the end
    if (saved) { const idx = new Map(saved.map((e, i) => [e, i])); L.sort((a, b) => (idx.get(a) ?? 1e9) - (idx.get(b) ?? 1e9)); }
    return L;
  }
  function drawScenes() {
    gS.textContent = '';
    if (!SCN || focus !== root || anim) return;
    const L = sceneList(), n = L.length; if (n < 2) return;
    const [r0, r1] = SCN, rm = (r0 + r1) / 2, gap = Math.min(.02, 6 / rm);
    let last = null, lt = 0;                          // the scene run most recently (within 6 h) stays lit
    L.forEach(e => { const t = Date.parse(states()[e].state); if (t > lt) { lt = t; last = e; } });
    if (Date.now() - lt > 6 * 3600e3) last = null;
    L.forEach((eid, i) => {
      const a0 = -Math.PI + i * TAU / n + gap, a1 = -Math.PI + (i + 1) * TAU / n - gap, mid = (a0 + a1) / 2, bottom = Math.abs(mid) > Math.PI / 2;
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'scn' + (eid === last ? ' last' : ''));
      g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', 'Run scene ' + sceneName(eid));
      const p = document.createElementNS(NS, 'path'); p.setAttribute('d', arcD(a0, a1, r0, r1)); g.appendChild(p);
      const [x0, y0] = pt(bottom ? a1 : a0, rm), [x1, y1] = pt(bottom ? a0 : a1, rm);
      const d = document.createElementNS(NS, 'path'); d.id = PFX + 'sc' + i; d.setAttribute('d', `M${f(x0)},${f(y0)}A${f(rm)},${f(rm)} 0 0 ${bottom ? 0 : 1} ${f(x1)},${f(y1)}`); defs.appendChild(d);
      const label = fitText(sceneName(eid), 12.5, (a1 - a0) * rm - 14);
      if (label) { const t = document.createElementNS(NS, 'g'); t.innerHTML = `<text dominant-baseline="central"><textPath href="#${PFX}sc${i}" startOffset="50%" text-anchor="middle">${esc(label)}</textPath></text>`; g.appendChild(t); }
      const run = () => { if (EDIT) { toast('Scenes run again once you tap Done'); return; } call('scene', 'turn_on', { entity_id: eid }); buzz(); g.classList.add('flash'); setTimeout(() => g.classList.remove('flash'), 600); toast(sceneName(eid) + ' scene on'); };
      g.addEventListener('click', run);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); } });
      gS.appendChild(g);
    });
  }

  /* ---------- focus + movement ---------- */
  function setFocus(n) {
    if (!n || n.kind === 'ent') return;
    if (sel && !leaves(n).includes(sel)) sel = null;
    editN = null;
    focus = n; hover(null); side(); controls(); geom(n);
    const from = { ...view }, dr = (n.rot || 0) - from.r, to = { x0: n.x0, x1: n.x1, d: n.depth, r: from.r + dr - Math.round(dr) };
    cancelAnimationFrame(anim);
    const dur = REDUCED ? 0 : animMs();
    if (dur < 20) { Object.assign(view, to); draw(); labels(); return; }
    const t0 = performance.now();
    const step = now => {
      const t = clamp((now - t0) / dur, 0, 1), e = easeIO(t);
      view.x0 = lerp(from.x0, to.x0, e); view.x1 = lerp(from.x1, to.x1, e); view.d = lerp(from.d, to.d, e); view.r = lerp(from.r, to.r, e); draw();
      if (t < 1) anim = requestAnimationFrame(step); else { anim = null; Object.assign(view, to); draw(); labels(); }
    };
    gL.textContent = ''; gS.textContent = ''; anim = requestAnimationFrame(step);
  }
  function hover(n) {
    if (hoverN === n) return;
    if (hoverN && hoverN.g) hoverN.g.style.transform = '';
    svg.querySelectorAll('.w.hl').forEach(g => g.classList.remove('hl'));
    hoverN = n; if (!n) return;
    for (let c = n; c && c !== focus; c = c.parent) if (c.g) c.g.classList.add('hl');
    if (!REDUCED) { const m = (n.a0 + n.a1) / 2; n.g.style.transform = `translate(${f(Math.sin(m) * 4)}px,${f(-Math.cos(m) * 4)}px)`; }
  }
  const nodeOf = el => { const g = el && el.closest && el.closest('.w'); return g ? nodes[+g.dataset.i] : null; };
  if (MINI) $('app').addEventListener('click', () => navigate(CFG.navigation_path));

  /* ---------- gestures: tap = go there (a thing: its card), hold = on/off, slide up/down on a light = brightness ---------- */
  let press = null;
  const domOf = n => n.eid.split('.')[0];
  const canToggle = n => n && n.kind === 'ent' && ['light', 'switch', 'fan', 'media_player', 'input_boolean'].includes(domOf(n)) && !unavail(states()[n.eid]);
  // ring only: a tap switches lights, switches, fans, speakers and blinds; anything else (and every hold) opens Home Assistant's
  // own dialog. Locks, sirens and the alarm never switch on a tap.
  const tapSwitches = n => canToggle(n) || (n && n.kind === 'ent' && domOf(n) === 'cover' && !unavail(states()[n.eid]));
  function tapThing(n) { if (tapSwitches(n)) toggleThing(n); else { buzz(); moreInfo(n.eid); } }
  const canDim = n => { if (!n || n.kind !== 'ent' || domOf(n) !== 'light') return false; const st = states()[n.eid]; return !unavail(st) && ((st.attributes || {}).supported_color_modes || []).some(m => m !== 'onoff'); };
  const briOf = n => { const st = states()[n.eid], a = (st && st.attributes) || {}; return st && st.state === 'on' ? (a.brightness != null ? Math.round(a.brightness / 2.55) : 100) : 0; };
  function select(n) {
    sel = n; hot = null; editN = null; editKind = null; if (editPos) { editPos = null; renderCorners(); }
    nodes.forEach(paint); controls(); hotBtns(); if (EDIT) reveal();
  }
  // Customise: the view stays where it is, and whatever you tap is the thing being changed (the centre = where you are)
  function editPick(n) {
    newGroup = false; editKind = null;
    if (n && n.kind === 'ent') { select(n); return; }
    sel = null; editPos = null; editN = n && n !== focus ? n : null;
    nodes.forEach(paint); renderCorners(); controls(); hotBtns(); reveal();
  }
  // Customise on a phone: the card is under the ring, so bring it into view
  function reveal() { try { $('ctl').scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' }); } catch (e) {} }
  function buzz() { try { navigator.vibrate && navigator.vibrate(30); } catch (e) {} }
  function flash(n) { if (!n.g) return; n.g.classList.add('flash'); setTimeout(() => n.g && n.g.classList.remove('flash'), 450); }
  function toggleThing(n) {
    if (domOf(n) === 'media_player') call('media_player', 'media_play_pause', { entity_id: n.eid });
    else call(domOf(n), 'toggle', { entity_id: n.eid });
    buzz(); flash(n);
  }
  let toastT = null;
  function toast(s) { const t = $('toast'); t.textContent = s; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1900); }
  // hold a room (or its Lights) = all its lights off if any is on, otherwise all on
  const roomLights = n => leaves(n).filter(e => e.cat === 'lights' && !unavail(states()[e.eid]) && !CFG.lights_exclude(e.eid, e.name) && !NOL.has(e.eid));
  function switchLights(list, turnOn) {
    for (const d of ['light', 'switch']) { const ids = list.filter(e => domOf(e) === d).map(e => e.eid); if (ids.length) call(d, turnOn ? 'turn_on' : 'turn_off', { entity_id: ids }); }
  }
  function toggleRoomLights(n) {
    const where = n.kind === 'home' ? 'House' : n.kind === 'cat' ? n.parent.name : n.name, L = roomLights(wholeOf(n));
    buzz(); flash(n);
    if (!L.length) { toast('No lights to switch in ' + where); return; }
    const on = L.filter(e => isActive(e.eid, states()[e.eid])), turnOn = !on.length, list = turnOn ? L : on;
    switchLights(list, turnOn);
    toast(`${where}: ${list.length} light${list.length === 1 ? '' : 's'} ${turnOn ? 'on' : 'off'}`);
  }
  // motion: a sensor that has just gone on makes its room (and itself) flash
  let motionSeen = {};
  function pulse(n) {
    if (!n || !n.g) return; n.g.classList.remove('moved'); n.g.getBoundingClientRect(); n.g.classList.add('moved');
    clearTimeout(n.mt); n.mt = setTimeout(() => n.g && n.g.classList.remove('moved'), 3400);
  }
  function motionCheck(h, quiet) {
    if (!CFG.motion_pulse) return;
    for (const e of leaves(house())) {
      const st = h.states[e.eid]; if (e.cat !== 'sensors' || !st || !isMotion(e.eid, st.attributes || {})) continue;
      const was = motionSeen[e.eid]; motionSeen[e.eid] = st.last_changed;
      if (quiet || was === undefined || was === st.last_changed || st.state !== 'on') continue;
      for (let c = e; c; c = c.parent) if (c === e || c.kind === 'area') pulse(twinOf(c));
    }
  }
  // safety: a leak, smoke, gas or CO sensor going off flashes its room and opens its card
  let safeSeen = {};
  function safetyCheck(h, quiet) {
    if (!root) return;
    for (const e of leaves(house())) {
      if (e.cat !== 'safety') continue;
      const st = h.states[e.eid]; if (!st) continue;
      const was = safeSeen[e.eid]; safeSeen[e.eid] = st.last_changed;
      if (quiet || !CFG.safety_alerts || MINI || was === undefined || was === st.last_changed || st.state !== 'on') continue;
      for (let c = e; c; c = c.parent) if (c === e || c.kind === 'area') pulse(twinOf(c));
      if (EDIT) { EDIT = false; editPos = null; editN = null; $('app').classList.remove('editing'); renderCorners(); }   // an alarm ends Customise
      if (!twinOf(e)) {                                     // the bar hides it: show everything again, then open it
        const eid = e.eid; FILTER = null; LS.set('homeRingFilter', 'null');
        setTimeout(() => { structKey = ''; update(H); const m = nodes.find(x => x.eid === eid); if (m) { sel = m; hot = null; nodes.forEach(paint); controls(); hotBtns(); } }, 0);
      } else { sel = twinOf(e); hot = null; nodes.forEach(paint); controls(); hotBtns(); }
      if (RINGONLY) moreInfo(e.eid);
      try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (x) {}
      toast((SAFETY_LABEL[(st.attributes || {}).device_class] || 'Alarm') + ' · ' + roomName(e));
    }
  }
  function showSlide(n, v) { const o = $('slide'); o.style.display = 'grid'; o.innerHTML = `<div><b>${v}%</b><span>${esc(n.name)}</span></div>`; o.style.setProperty('--p', v); }
  function hideSlide() { $('slide').style.display = 'none'; }
  svg.addEventListener('contextmenu', e => e.preventDefault());   // a long press must not open the browser's menu
  svg.addEventListener('pointerdown', e => {
    if (MINI) return; const n = nodeOf(e.target); if (!n) return;
    press = { n, x: e.clientX, y: e.clientY, held: false, sliding: false, bri0: 0, bri: null, id: e.pointerId };
    press.timer = setTimeout(() => {
      if (!press || press.sliding) return;
      press.held = true;
      if (EDIT) return;                                     // Customise: a hold is just a tap
      if (RINGONLY && n.kind === 'ent') { buzz(); moreInfo(n.eid); }
      else if (canToggle(n)) { toggleThing(n); select(n); }
      else if (n.kind === 'ent') { buzz(); select(n); }
      else if (n.kind === 'area' || (n.kind === 'cat' && n.cat === 'lights')) toggleRoomLights(n);
    }, HOLD_MS);
  });
  svg.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse' && !press) hover(nodeOf(e.target));
    if (!press || press.held) return;
    const dx = e.clientX - press.x, dy = e.clientY - press.y;
    if (!press.sliding && Math.hypot(dx, dy) > MOVE_PX) {
      clearTimeout(press.timer);
      if (EDIT || !canDim(press.n)) { press = null; return; }
      press.sliding = true; press.bri0 = briOf(press.n);
      try { svg.setPointerCapture(press.id); } catch (_) {}
      select(press.n);
    }
    if (press.sliding) { press.bri = clamp(Math.round(press.bri0 - dy / SLIDE_PX), 0, 100); showSlide(press.n, press.bri); }
  });
  svg.addEventListener('pointerup', () => {
    if (!press) return; const p = press; press = null; clearTimeout(p.timer);
    if (p.sliding) {
      hideSlide();
      if (p.bri != null) { if (p.bri <= 0) call('light', 'turn_off', { entity_id: p.n.eid }); else call('light', 'turn_on', { entity_id: p.n.eid, brightness_pct: p.bri }); buzz(); }
      return;
    }
    if (EDIT) { editPick(p.n); return; }
    if (p.held) return;
    if (p.n.kind === 'ent') { if (RINGONLY) tapThing(p.n); else select(p.n); } else setFocus(p.n);
  });
  svg.addEventListener('pointercancel', () => { if (press) { clearTimeout(press.timer); press = null; hideSlide(); } });
  svg.addEventListener('pointerleave', () => { if (!press) hover(null); });
  svg.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return; const n = nodeOf(e.target); if (!n) return; e.preventDefault();
    if (EDIT) { editPick(n); return; }
    if (n.kind === 'ent') { if (RINGONLY) tapThing(n); else select(n); } else setFocus(n);
  });

  /* ---------- the side: where you are, the selected thing's card, and everything under the focus ---------- */
  function crumbs() {
    const path = []; for (let c = focus; c; c = c.parent) path.unshift(c);
    $('crumbs').innerHTML = path.map((c, i) => i === path.length - 1 ? `<span class="cur">${esc(c.name)}</span>` : `<button data-i="${c.i}">${esc(c.name)}</button><span class="sep">›</span>`).join('');
    $('crumbs').querySelectorAll('button').forEach(b => b.onclick = () => { if (EDIT) { toast('Tap the tick first to move around'); return; } setFocus(nodes[+b.dataset.i]); });
  }
  const MINI_LINES = [['lights', 'lights on', 'no lights on'], ['heating', 'heating', 'heating idle'], ['media', 'playing', 'nothing playing'],
    ['sensors', 'doors & motion', 'doors closed, no motion'], ['plugs', 'plugs on', 'plugs off']];
  function miniBox() {
    const L = leaves(root);
    $('minibox').innerHTML = `<div class="mt">Home Ring${CFG.navigation_path ? '<span>open ›</span>' : ''}</div>` + MINI_LINES.map(([c, on, off]) => {
      const k = L.filter(e => e.cat === c && isActive(e.eid, states()[e.eid])).length;
      return `<div class="ml${k ? '' : ' off'}" style="--sc:${kindCol(c)}"><i></i>${k ? k + ' ' + on : off}</div>`;
    }).join('');
  }
  function side() {
    if (MINI) return miniBox();
    crumbs();
    $('title').textContent = focus.name;
    const L = leaves(focus), on = CAT_ORDER.filter(c => !NO_COUNT.includes(c)).map(c => { const k = L.filter(e => e.cat === c && isActive(e.eid, states()[e.eid])).length; return k ? `<b>${k}</b> ${esc(CATS[c].name.toLowerCase())}` : null; }).filter(Boolean);
    const off = L.filter(e => unavail(states()[e.eid])).length;
    $('summary').innerHTML = (on.length ? on.join(' · ') + ' on' : 'Nothing on') + ` · ${L.length} thing${L.length === 1 ? '' : 's'}` + (off ? ` · <span style="color:var(--alert)">${off} unavailable</span>` : '');
    $('mode').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.m === MODE));
    lockUi(); viewUi();
    $('legend').style.display = CFG.temperature_tint && (focus.kind === 'home' || focus.kind === 'floor') ? '' : 'none';
    // the list: rooms for the house and floors, things for a room or kind (By system at home: the systems)
    const sysHome = MODE === 'systems' && focus.kind === 'home';
    const items = sysHome ? focus.kids : focus.kind === 'home' || focus.kind === 'floor' ? nodes.filter(n => n.kind === 'area' && (focus.kind === 'home' || n.parent === focus)) : L;
    $('lh').textContent = sysHome ? 'Systems' : focus.kind === 'home' || focus.kind === 'floor' ? 'Rooms' : 'In ' + focus.name;
    $('rows').classList.toggle('many', items.length > 16);
    $('rows').innerHTML = items.map(n => {
      if (n.kind === 'area' || n.kind === 'floor') {
        const k = activeCount(n), s = subOf(n), txt = k ? s : (s ? s + ' · all off' : 'all off');
        return `<button class="chip${k ? ' on' : ''}" style="--sc:var(--light)" data-i="${n.i}"><i></i><span class="t"><div class="n">${esc(n.name)}</div><div class="s">${esc(txt)}</div></span></button>`;
      }
      const st = states()[n.eid], act = isActive(n.eid, st);
      return `<button class="chip${act ? ' on' : ''}" style="--sc:${n.sc}" data-i="${n.i}"><i></i><span class="t"><div class="n">${esc(n.name)}</div><div class="s">${esc(stateText(n.eid, st))}</div></span></button>`;
    }).join('');
    $('rows').querySelectorAll('.chip').forEach(b => b.onclick = () => { const n = nodes[+b.dataset.i]; if (n.kind !== 'ent') setFocus(n); else select(n); });
  }
  function call(domain, service, data) { try { H.callService(domain, service, data); } catch (e) { console.warn('home-ring-card', e); } }

  /* ---------- the detailed card for one thing (replaces the room list until closed) ---------- */
  const HIST = {};
  async function fetchHistory(eid, minimal) {               // last 24 h, cached 5 min
    const k = eid + (minimal ? '|m' : ''), c = HIST[k]; if (c && Date.now() - c.t < 300000) return c.v;
    const start = encodeURIComponent(new Date(Date.now() - 864e5).toISOString());
    let v = [];
    try { const r = await H.callApi('GET', `history/period/${start}?filter_entity_id=${eid}${minimal ? '&minimal_response&no_attributes' : ''}`); v = (r && r[0]) || []; } catch (e) {}
    HIST[k] = { t: Date.now(), v }; return v;
  }
  const hhmm = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const kv = (k, v) => v == null || v === '' ? '' : `<div class="kv"><span>${esc(k)}</span><b>${v}</b></div>`;
  const btns = (list, cur, act, label = x => x) => `<div class="row">${list.map(x => `<button class="btn${x === cur ? ' on' : ''}" data-a="${act}" data-v="${esc(x)}">${esc(label(x))}</button>`).join('')}</div>`;
  const nice = s => String(s).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
  let camTimer = null;
  function controls() {
    const el = $('ctl'); clearInterval(camTimer); stopCams();
    if (MINI) return;
    $('list').style.display = sel || hot || EDIT ? 'none' : '';
    if (EDIT && editPos) { chooserCard(el); return; }
    if (EDIT && editKind) { kindEdit(el); return; }
    if (EDIT && sel) { thingEdit(el); return; }
    if (EDIT) { groupEdit(el); return; }
    if (hot && !sel) { hotCard(el); return; }
    if (!sel) { el.innerHTML = ''; return; }
    const eid = sel.eid, st = states()[eid], d = eid.split('.')[0], a = (st && st.attributes) || {}, act = isActive(eid, st);
    el.style.setProperty('--sc', sel.sc);
    let h = `<div class="h"><i class="${act ? '' : 'off'}"></i>${esc(sel.name)}<button class="x" data-a="close" aria-label="Close">✕</button></div>
      <div class="st">${esc(stateText(eid, st))}${st && st.last_changed ? ' · since ' + hhmm(st.last_changed) : ''}</div>`;
    if (unavail(st)) { el.innerHTML = h + `<div class="note">Not reachable right now.</div>`; wire(el, eid, d, a); return; }
    if (d === 'light') {
      const modes = a.supported_color_modes || [], dim = modes.some(m => m !== 'onoff');
      h += `<div class="row"><button class="btn${act ? ' on' : ''}" data-a="toggle">${act ? 'Turn off' : 'Turn on'}</button>
        ${dim ? `<input type="range" min="1" max="100" step="1" value="${act && a.brightness ? Math.round(a.brightness / 2.55) : 1}" data-a="bri" aria-label="Brightness"><span class="pv">${act && a.brightness ? Math.round(a.brightness / 2.55) + '%' : 'off'}</span>` : ''}</div>`;
      if (modes.includes('color_temp') && a.min_color_temp_kelvin) {
        h += `<div class="lbl">Colour temperature</div><div class="row"><input class="ct" type="range" min="${esc(a.min_color_temp_kelvin)}" max="${esc(a.max_color_temp_kelvin)}" step="50"
          value="${a.color_temp_kelvin || Math.round((a.min_color_temp_kelvin + a.max_color_temp_kelvin) / 2)}" data-a="ct" aria-label="Colour temperature"><span class="pv">${a.color_temp_kelvin ? a.color_temp_kelvin + ' K' : ''}</span></div>`;
      }
      if (modes.some(m => ['hs', 'rgb', 'rgbw', 'rgbww', 'xy'].includes(m))) {
        const hue = (a.hs_color || [0, 0])[0];
        h += `<div class="lbl">Colour</div><div class="row"><input class="hue" type="range" min="0" max="359" step="1" value="${Math.round(hue)}" data-a="hue" aria-label="Colour" style="--h:${Math.round(hue)}">
          </div><div class="row sw">${[0, 30, 55, 120, 180, 220, 275, 320].map(x => `<button class="dot" style="background:hsl(${x} 90% 55%)" data-a="hs" data-v="${x}" aria-label="Colour ${x}"></button>`).join('')}
          <button class="dot white" data-a="white" aria-label="White"></button></div>`;
      }
      if ((a.effect_list || []).length && a.effect_list.length <= 60)
        h += `<div class="lbl">Effect</div><select data-a="effect"><option value="">—</option>${a.effect_list.map(x => `<option${x === a.effect ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`;
      h += `<div class="kvs">${kv('Colour mode', a.color_mode && esc(nice(a.color_mode)))}</div>`;
    } else if (d === 'switch' || d === 'fan' || d === 'input_boolean' || d === 'remote') {
      h += `<div class="row"><button class="btn${act ? ' on' : ''}" data-a="toggle">${act ? 'Turn off' : 'Turn on'}</button>
        ${d === 'fan' && a.percentage != null ? `<input type="range" min="0" max="100" step="${a.percentage_step || 1}" value="${a.percentage || 0}" data-a="fanpct" aria-label="Fan speed"><span class="pv">${a.percentage || 0}%</span>` : ''}</div>`;
    } else if (d === 'climate') {
      h += `<div class="clim"><div><div class="lbl">Room</div><div class="big">${a.current_temperature != null ? esc(a.current_temperature) + '°' : '—'}</div></div>
        <div><div class="lbl">Target</div><div class="row tgt"><button class="btn" data-a="t-">−</button><span class="big">${a.temperature != null ? esc(a.temperature) + '°' : '—'}</span><button class="btn" data-a="t+">+</button></div></div></div>
        <div class="kvs">${kv('Now', a.hvac_action ? esc(nice(a.hvac_action)) : null)}${kv('Humidity', a.current_humidity != null ? esc(a.current_humidity) + '%' : null)}${kv('Range', a.min_temp != null ? esc(a.min_temp) + '° – ' + esc(a.max_temp) + '°' : null)}</div>`;
      if ((a.hvac_modes || []).length) h += `<div class="lbl">Mode</div>` + btns(a.hvac_modes, st.state, 'hvac', nice);
      if ((a.preset_modes || []).length) h += `<div class="lbl">Preset</div>` + btns(a.preset_modes, a.preset_mode, 'preset', nice);
      h += `<div class="lbl">Last 24 hours</div><div class="graph" id="graph">loading…</div>`;
    } else if (d === 'water_heater') {
      h += `<div class="kvs">${kv('Temperature', a.current_temperature != null ? esc(a.current_temperature) + '°' : null)}${kv('Target', a.temperature != null ? esc(a.temperature) + '°' : null)}${kv('Mode', a.operation_mode && esc(modeLabel(a.operation_mode)))}</div>`;
      if ((a.operation_list || []).length) h += `<div class="lbl">Mode</div>` + btns(a.operation_list, a.operation_mode, 'wmode', modeLabel);
    } else if (d === 'media_player') {
      h += `${a.entity_picture ? `<img class="art" alt="" src="${esc(a.entity_picture)}">` : ''}
        <div class="kvs">${kv('Playing', a.media_title ? esc(a.media_title) : null)}${kv('By', a.media_artist ? esc(a.media_artist) : null)}${kv('Source', a.source ? esc(a.source) : null)}</div>
        <div class="row"><button class="btn" data-a="prev" aria-label="Previous">⏮</button><button class="btn${act ? ' on' : ''}" data-a="pp">${act ? 'Pause' : 'Play'}</button><button class="btn" data-a="next" aria-label="Next">⏭</button>
        ${st.state !== 'off' ? `<button class="btn" data-a="off">Turn off</button>` : `<button class="btn" data-a="on">Turn on</button>`}</div>`;
      if (a.volume_level != null) h += `<div class="lbl">Volume</div><div class="row"><input type="range" min="0" max="100" step="1" value="${Math.round(a.volume_level * 100)}" data-a="vol" aria-label="Volume"><span class="pv">${Math.round(a.volume_level * 100)}%</span></div>`;
      if ((a.source_list || []).length && a.source_list.length <= 40) h += `<div class="lbl">Source</div><select data-a="source">${a.source_list.map(x => `<option${x === a.source ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`;
    } else if (d === 'cover') {
      h += `<div class="row"><button class="btn" data-a="open">Open</button><button class="btn" data-a="stop">Stop</button><button class="btn" data-a="shut">Close</button></div>`;
      if (a.current_position != null) h += `<div class="row"><input type="range" min="0" max="100" value="${esc(a.current_position)}" data-a="pos" aria-label="Position"><span class="pv">${esc(a.current_position)}%</span></div>`;
    } else if (d === 'lock') {
      const locked = st.state === 'locked';
      h += `<div class="row"><button class="btn${locked ? ' on' : ''}" data-a="lock">Lock</button><button class="btn" data-a="confirm" data-v="unlock">Unlock…</button>${a.supported_features & 1 ? '<button class="btn" data-a="confirm" data-v="open">Open…</button>' : ''}</div>
        <div class="note">Unlocking asks you to tap twice${a.code_format ? ', and your lock needs its code: use More controls' : ''}.</div>`;
    } else if (d === 'valve') {
      h += `<div class="row"><button class="btn${act ? ' on' : ''}" data-a="vopen">Open</button><button class="btn" data-a="vclose">Close</button>${a.current_position != null ? '<button class="btn" data-a="vstop">Stop</button>' : ''}</div>`;
      if (a.current_position != null) h += `<div class="row"><input type="range" min="0" max="100" value="${esc(a.current_position)}" data-a="vpos" aria-label="Position"><span class="pv">${esc(a.current_position)}%</span></div>`;
    } else if (d === 'vacuum' || d === 'lawn_mower') {
      h += `<div class="row"><button class="btn${act ? ' on' : ''}" data-a="vstart">Start</button><button class="btn" data-a="vpause">Pause</button><button class="btn" data-a="vdock">Dock</button></div>
        <div class="kvs">${kv('Battery', a.battery_level != null ? esc(a.battery_level) + '%' : null)}${kv('Fan speed', a.fan_speed ? esc(a.fan_speed) : null)}</div>`;
    } else if (d === 'siren') {
      h += `<div class="row">${act ? '<button class="btn on" data-a="sirenoff">Turn off</button>' : '<button class="btn" data-a="confirm" data-v="siren">Sound it…</button>'}</div>`;
    } else if (d === 'humidifier') {
      h += `<div class="row"><button class="btn${act ? ' on' : ''}" data-a="toggle">${act ? 'Turn off' : 'Turn on'}</button>
        ${a.humidity != null ? `<input type="range" min="${a.min_humidity ?? 0}" max="${a.max_humidity ?? 100}" step="1" value="${a.humidity}" data-a="hum" aria-label="Target humidity"><span class="pv">${a.humidity}%</span>` : ''}</div>
        <div class="kvs">${kv('Humidity now', a.current_humidity != null ? esc(a.current_humidity) + '%' : null)}${kv('Mode', a.mode ? esc(nice(a.mode)) : null)}</div>`;
    } else if (d === 'button' || d === 'input_button') {
      h += `<div class="row"><button class="btn" data-a="press">Press</button></div>`;
    } else if (d === 'script') {
      h += `<div class="row"><button class="btn${act ? ' on' : ''}" data-a="run">${act ? 'Running…' : 'Run'}</button></div>`;
    } else if ((d === 'select' || d === 'input_select') && (a.options || []).length <= 60) {
      h += `<select data-a="opt">${(a.options || []).map(x => `<option${x === st.state ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`;
    } else if ((d === 'number' || d === 'input_number') && a.min != null && a.max != null) {
      h += `<div class="row"><input type="range" min="${esc(a.min)}" max="${esc(a.max)}" step="${esc(a.step || 1)}" value="${esc(st.state)}" data-a="num" aria-label="${esc(sel.name)}"><span class="pv">${esc(st.state)}${a.unit_of_measurement ? ' ' + esc(a.unit_of_measurement) : ''}</span></div>`;
    } else if (d === 'alarm_control_panel') {
      h += `<div class="row"><button class="btn" data-a="more">Open the keypad</button></div>`;
    } else if (d === 'camera' && a.entity_picture) {
      h += `<img class="cam" id="cam" alt="${esc(sel.name)}" src="${esc(withT(a.entity_picture))}"><div class="row"><button class="btn" data-a="more">Live view</button></div>`;
      camTimer = setInterval(() => { const i = $('cam'), s2 = states()[eid]; if (i && sel && sel.eid === eid && s2) i.src = withT(s2.attributes.entity_picture); }, 5000);
    } else if (d === 'binary_sensor') {
      h += `<div class="kvs" id="bsh">${kv('Since', st.last_changed ? hhmm(st.last_changed) : null)}</div>`;
    }
    h += readingsHtml(sel);
    // Home Assistant's own pop-up has the right controls for every kind of device, including ones this card has no buttons for
    if (d !== 'alarm_control_panel' && d !== 'camera') {
      const dev = devOf(sel), admin = H.user && H.user.is_admin;
      h += `<div class="row"><button class="btn" data-a="more">${/^(sensor|binary_sensor|event)$/.test(d) ? 'History' : 'More controls'}</button>${dev && admin ? '<button class="btn" data-a="devpage">Device page</button>' : ''}</div>`;
    }
    el.innerHTML = h;
    wire(el, eid, d, a);
    el.querySelectorAll('[data-mi]').forEach(b => b.onclick = () => moreInfo(b.dataset.mi));
    if (d === 'climate') fetchHistory(eid, false).then(v => { if (sel && sel.eid === eid) drawGraph(v); });
    if (d === 'binary_sensor') fetchHistory(eid, true).then(v => {
      if (!(sel && sel.eid === eid)) return; const n = v.filter((s, i) => s.state === 'on' && i > 0).length;
      const b = $('bsh'); if (b) b.innerHTML += kv('Last 24 hours', n + ' time' + (n === 1 ? '' : 's'));
    });
  }
  // the rest of a device: its readings and extra controls, each opening Home Assistant's own pop-up
  function readingsHtml(n) {
    const dev = devOf(n), L = ((dev && READ[dev]) || []).filter(x => x !== n.eid && states()[x]); if (!L.length) return '';
    const D = dev && H.devices && H.devices[dev], dn = D ? (D.name_by_user || D.name || '') : '';
    const label = x => { let t = (states()[x].attributes || {}).friendly_name || x.split('.')[1].replace(/_/g, ' ');
      if (dn && t.toLowerCase().startsWith(dn.toLowerCase() + ' ')) t = t.slice(dn.length + 1); return t.charAt(0).toUpperCase() + t.slice(1); };
    const rank = x => { const d = x.split('.')[0], c = (states()[x].attributes || {}).device_class || ''; return (d === 'sensor' ? (['power', 'temperature', 'humidity', 'energy', 'battery'].indexOf(c) + 1 || 6) : d === 'binary_sensor' ? 7 : 8); };
    const rows = L.slice().sort((p, q) => rank(p) - rank(q) || label(p).localeCompare(label(q)));
    const MAX = 14;
    return `<div class="lbl">${n.dev ? 'Readings' : 'Also on this device'}</div><div class="kvs">` +
      rows.slice(0, MAX).map(x => `<button class="kv kvb" data-mi="${esc(x)}"><span>${esc(label(x))}</span><b>${esc(stateText(x, states()[x]))}</b></button>`).join('') + '</div>' +
      (rows.length > MAX ? `<div class="note">and ${rows.length - MAX} more on the device page</div>` : '');
  }
  const withT = p => /^(data|blob):/.test(p) ? p : p + (p.includes('?') ? '&' : '?') + 't=' + Date.now();   // fresh still each time
  function wire(el, eid, d, a) {
    el.querySelectorAll('[data-a]').forEach(b => {
      const k = b.dataset.a, v = b.dataset.v;
      const live = b.nextElementSibling && b.nextElementSibling.classList.contains('pv') ? b.nextElementSibling : null;
      if (b.tagName === 'INPUT') {
        b.oninput = () => { if (live) live.textContent = k === 'ct' ? b.value + ' K' : b.value + '%'; if (k === 'hue') b.style.setProperty('--h', b.value); };
        b.onchange = () => {
          if (k === 'bri') call('light', 'turn_on', { entity_id: eid, brightness_pct: +b.value });
          if (k === 'ct') call('light', 'turn_on', { entity_id: eid, color_temp_kelvin: +b.value });
          if (k === 'hue') call('light', 'turn_on', { entity_id: eid, hs_color: [+b.value, 100] });
          if (k === 'fanpct') call('fan', 'set_percentage', { entity_id: eid, percentage: +b.value });
          if (k === 'vol') call('media_player', 'volume_set', { entity_id: eid, volume_level: +b.value / 100 });
          if (k === 'pos') call('cover', 'set_cover_position', { entity_id: eid, position: +b.value });
          if (k === 'vpos') call('valve', 'set_valve_position', { entity_id: eid, position: +b.value });
          if (k === 'hum') call('humidifier', 'set_humidity', { entity_id: eid, humidity: +b.value });
          if (k === 'num') call(d, 'set_value', { entity_id: eid, value: +b.value });
        };
        return;
      }
      if (b.tagName === 'SELECT') {
        b.onchange = () => {
          if (!b.value) return;
          if (k === 'effect') call('light', 'turn_on', { entity_id: eid, effect: b.value });
          if (k === 'source') call('media_player', 'select_source', { entity_id: eid, source: b.value });
          if (k === 'opt') call(d, 'select_option', { entity_id: eid, option: b.value });
        };
        return;
      }
      b.onclick = () => {
        if (k === 'close') { sel = null; nodes.forEach(paint); controls(); return; }
        if (k === 'more') { moreInfo(eid); return; }
        if (k === 'devpage') { navigate('/config/devices/device/' + devOf(sel)); return; }
        if (k === 'confirm') {                   // unlocking a door or sounding a siren takes a second tap within 4 s
          if (!b.dataset.armed || Date.now() - +b.dataset.armed > 4000) { b.dataset.armed = Date.now(); b.textContent = 'Tap again to ' + (v === 'siren' ? 'sound it' : v); b.classList.add('on'); buzz(); return; }
          if (v === 'unlock') call('lock', 'unlock', { entity_id: eid });
          if (v === 'open') call('lock', 'open', { entity_id: eid });
          if (v === 'siren') call('siren', 'turn_on', { entity_id: eid });
          delete b.dataset.armed; buzz(); toast(sel.name + ': ' + (v === 'siren' ? 'sounding' : v === 'open' ? 'opening' : 'unlocking')); return;
        }
        if (k === 'lock') call('lock', 'lock', { entity_id: eid });
        if (k === 'sirenoff') call('siren', 'turn_off', { entity_id: eid });
        if (k === 'vopen' || k === 'vclose' || k === 'vstop') call('valve', { vopen: 'open_valve', vclose: 'close_valve', vstop: 'stop_valve' }[k], { entity_id: eid });
        if (k === 'vstart' || k === 'vpause' || k === 'vdock') call(d, d === 'lawn_mower' ? { vstart: 'start_mowing', vpause: 'pause', vdock: 'dock' }[k] : { vstart: 'start', vpause: 'pause', vdock: 'return_to_base' }[k], { entity_id: eid });
        if (k === 'press') { call(d, 'press', { entity_id: eid }); buzz(); }
        if (k === 'run') { call('script', 'turn_on', { entity_id: eid }); buzz(); }
        if (k === 'toggle') call(d, 'toggle', { entity_id: eid });
        if (k === 'hs') call('light', 'turn_on', { entity_id: eid, hs_color: [+v, 100] });
        if (k === 'white') call('light', 'turn_on', { entity_id: eid, ...(a.min_color_temp_kelvin ? { color_temp_kelvin: Math.round((a.min_color_temp_kelvin + a.max_color_temp_kelvin) / 2) } : { hs_color: [0, 0] }) });
        if (k === 't-' || k === 't+') call('climate', 'set_temperature', { entity_id: eid, temperature: Math.round(((a.temperature || 20) + (k === 't+' ? .5 : -.5)) * 2) / 2 });
        if (k === 'hvac') call('climate', 'set_hvac_mode', { entity_id: eid, hvac_mode: v });
        if (k === 'preset') call('climate', 'set_preset_mode', { entity_id: eid, preset_mode: v });
        if (k === 'wmode') call('water_heater', 'set_operation_mode', { entity_id: eid, operation_mode: v });
        if (k === 'pp') call('media_player', 'media_play_pause', { entity_id: eid });
        if (k === 'prev') call('media_player', 'media_previous_track', { entity_id: eid });
        if (k === 'next') call('media_player', 'media_next_track', { entity_id: eid });
        if (k === 'on' || k === 'off') call('media_player', 'turn_' + k, { entity_id: eid });
        if (k === 'open' || k === 'stop' || k === 'shut') call('cover', (k === 'shut' ? 'close' : k) + '_cover', { entity_id: eid });
      };
    });
  }
  // 24 h of a thermostat: room temperature (line) and target (dashed), with the time it was heating shaded
  function drawGraph(hist) {
    const g = $('graph'); if (!g) return;
    const pts = hist.map(s => ({ t: new Date(s.last_changed || s.last_updated).getTime(), cur: num((s.attributes || {}).current_temperature), tgt: num((s.attributes || {}).temperature), heat: (s.attributes || {}).hvac_action === 'heating' })).filter(p => p.cur != null);
    if (pts.length < 2) { g.textContent = 'Not enough history yet.'; return; }
    const W = 300, Hh = 90, t0 = Date.now() - 864e5, t1 = Date.now(), vals = pts.flatMap(p => [p.cur, p.tgt]).filter(v => v != null && v > 0);
    const lo = Math.floor(Math.min(...vals) - 0.5), hi = Math.ceil(Math.max(...vals) + 0.5);
    const X = t => ((Math.max(t, t0) - t0) / (t1 - t0)) * W, Y = v => Hh - 6 - ((v - lo) / (hi - lo || 1)) * (Hh - 14);
    let heat = '', cur = '', tgt = '';
    pts.forEach((p, i) => {
      const x = X(p.t), x2 = i + 1 < pts.length ? X(pts[i + 1].t) : W;
      if (p.heat) heat += `<rect x="${f(x)}" y="0" width="${f(Math.max(.5, x2 - x))}" height="${Hh}" fill="rgba(255,122,69,.16)"/>`;
      cur += (i ? 'L' : 'M') + f(x) + ',' + f(Y(p.cur)) + 'L' + f(x2) + ',' + f(Y(p.cur));
      if (p.tgt != null && p.tgt > 0) tgt += (tgt ? 'L' : 'M') + f(x) + ',' + f(Y(p.tgt)) + 'L' + f(x2) + ',' + f(Y(p.tgt));
    });
    g.innerHTML = `<svg viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none">${heat}<path d="${tgt}" fill="none" stroke="var(--muted)" stroke-width="1.2" stroke-dasharray="4 3"/>
      <path d="${cur}" fill="none" stroke="var(--heat)" stroke-width="2"/></svg><div class="gl"><span>${lo}°</span><span>shaded = heating · dashed = target</span><span>${hi}°</span></div>`;
  }
  if (CFG.back_path) { const b = $('back'); b.hidden = false; b.textContent = '← ' + CFG.back_label; b.onclick = () => navigate(CFG.back_path); }

  /* ---------- corner buttons: tap = its card on the right, hold = its quick action ----------
     Each corner can be any of the kinds below, a room shortcut ("room:<area id>"), or empty. Choose them with
     Customise (the gear; saved with the rest of the setup) or with `corners:` in the card's YAML.
     Cameras: stills; opens by itself when a doorbell rings.   Lights: every light; hold = all off, or all on.
     Alarm: arm from here when no code is needed to arm.         Heating: thermostats -/+ and boiler modes; hold = your mode.
     TV & music: what's playing; hold = pause everything.        Scenes: run one.
     Doors & motion: what's open and recent movement.            Energy: your power readings and plugs.
     Blinds: open / stop / close; hold = close all, or open all. Fans: hold = all off.   Plugs: switch them. */
  const IC = {
    cams: '<path d="M3.5 8h3l1.8-2.5h7.4L17.5 8h3v11h-17z"/><circle cx="12" cy="13.2" r="3.6"/>',
    lights: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.1v.1h5v-.1c0-.8.4-1.5 1.1-2.1A6 6 0 0 0 12 3z"/>',
    alarm: '<path d="M12 3l7.5 3v5.6c0 4.6-3.2 8.2-7.5 9.4-4.3-1.2-7.5-4.8-7.5-9.4V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    heat: '<path d="M12 3c1 3.2 4.5 4.8 4.5 9.4a4.5 4.5 0 0 1-9 0c0-2.2 1-3.6 2.2-4.6 0 2 .8 3.4 2.2 3.6C11.5 8.6 10.8 5.8 12 3z"/>',
    media: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M10.5 8.8v4.8l4-2.4z"/>',
    scenes: '<path d="M11 3l1.8 4.7L17.5 9.5l-4.7 1.8L11 16l-1.8-4.7L4.5 9.5l4.7-1.8z"/><path d="M18 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    doors: '<path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21M4 21h16"/><circle cx="14.6" cy="12" r=".9"/>',
    energy: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
    blinds: '<path d="M4 4h16M5 4v10M19 4v10M5 7.5h14M5 11h14M5 14h14M12 14v3.5"/><circle cx="12" cy="19.2" r="1.3"/>',
    fans: '<circle cx="12" cy="12" r="1.8"/><path d="M12 10.2c-1-3.6.4-6.7 3-6.7 2.4 0 2.6 3.6-1.3 6.3M13.8 12.6c3.6 1 5.6 3.8 4.3 6-1.2 2.1-4.3.4-5.4-4M10.3 12.9c-2.6 2.7-6 3-7.3.8-1.2-2.1 1.9-3.9 6.3-2.8"/>',
    plugs: '<path d="M9 3v5M15 3v5M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0zM12 17v4"/>',
    room: '<path d="M3.5 11.5L12 4l8.5 7.5M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
    none: '<path d="M12 6v12M6 12h12"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    eye: '<path d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 3.5l16 17"/>',
  };
  const svgOf = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k] || IC.none}</svg>`;
  const KINDS = {
    cams: { name: 'Cameras', hc: 'var(--cam)' }, lights: { name: 'Lights', hc: 'var(--light)' },
    alarm: { name: 'Alarm', hc: 'var(--media)' }, heat: { name: 'Heating', hc: 'var(--heat)' },
    media: { name: 'TV & music', hc: 'var(--media)' }, scenes: { name: 'Scenes', hc: 'var(--light)' },
    doors: { name: 'Doors & motion', hc: 'var(--alert)' }, energy: { name: 'Energy', hc: 'var(--plug)' },
    blinds: { name: 'Blinds', hc: 'var(--fan)' }, fans: { name: 'Fans', hc: 'var(--fan)' },
    plugs: { name: 'Plugs', hc: 'var(--plug)' }, none: { name: 'Empty', hc: 'var(--dim)' },
  };
  // a corner shows its kind's colour; one you changed in Customise applies here too
  const CORNER_KIND = { cams: 'cameras', lights: 'lights', heat: 'heating', media: 'media', doors: 'sensors', energy: 'energy', blinds: 'covers', fans: 'fans', plugs: 'plugs' };
  const cornerCol = k => { const r = roomIdOf(k); if (r) return PROF.col['a:' + r] || 'var(--light)'; const c = CORNER_KIND[k]; return (c && PROF.col['k:' + c]) || (KINDS[k] || KINDS.none).hc; };
  const POS = ['tl', 'tr', 'bl', 'br'], POS_NAME = { tl: 'Top left', tr: 'Top right', bl: 'Bottom left', br: 'Bottom right' };
  const DEFAULT_CORNERS = ['cams', 'lights', 'alarm', 'heat'];
  const validCorner = k => typeof k === 'string' && (KINDS[k] || /^room:.+/.test(k));
  const cleanCorners = v => Array.isArray(v) && v.length === 4 && v.every(validCorner) ? v.slice() : null;
  let CORNERS = cleanCorners(CFG.corners) || DEFAULT_CORNERS.slice(), EDIT = false, editPos = null, editN = null, editKind = null, legacyCorners = null;
  const kindOf = pos => CORNERS[POS.indexOf(pos)];
  const roomIdOf = k => k.startsWith('room:') ? k.slice(5) : null;
  const roomNodeOf = id => houseNodes.find(n => n.kind === 'area' && n.id === id);
  const roomTitle = id => { const n = roomNodeOf(id); return n ? n.name : ((H && H.areas && H.areas[id]) || {}).name || 'Room'; };
  const kindName = k => roomIdOf(k) ? roomTitle(roomIdOf(k)) : (KINDS[k] || KINDS.none).name;

  let hotCam = null, hotAuto = null, camTimers = [], dingSeen = {}, pend = {};
  const roomName = e => { for (let c = e; c; c = c.parent) if (c.kind === 'area') return c.name; return e.name; };
  const areaNodeOf = e => { for (let c = e; c; c = c.parent) if (c.kind === 'area') return c; return null; };
  const alarmEid = () => CFG.alarm || Object.keys(states()).find(e => e.startsWith('alarm_control_panel.') && !CFG.exclude(e, ''));
  const heaterEid = () => CFG.heating_entity || (root ? (leaves(house()).find(e => domOf(e) === 'water_heater') || {}).eid : null);
  const thermostats = () => root ? leaves(house()).filter(e => domOf(e) === 'climate').sort((a, b) => roomName(a).localeCompare(roomName(b))) : [];
  const allLights = () => root ? roomLights(house()) : [];
  const ofCat = c => root ? leaves(house()).filter(e => e.cat === c && !unavail(states()[e.eid])) : [];
  const onOf = L => L.filter(e => isActive(e.eid, states()[e.eid]));
  const OPENING = ['door', 'window', 'garage_door', 'opening'];
  const openNow = () => ofCat('sensors').filter(e => { const st = states()[e.eid]; return st.state === 'on' && OPENING.includes((st.attributes || {}).device_class); });
  const recentMotion = ms => ofCat('sensors').filter(e => { const st = states()[e.eid]; return isMotion(e.eid, st.attributes || {}) && (st.state === 'on' || Date.now() - Date.parse(st.last_changed) < ms); })
    .sort((a, b) => Date.parse(states()[b.eid].last_changed) - Date.parse(states()[a.eid].last_changed));
  const energyNodes = () => CFG.energy.filter(e => states()[e.entity]);
  const lastScene = () => { let last = null, lt = 0; for (const e of sceneList()) { const t = Date.parse(states()[e].state); if (t > lt) { lt = t; last = e; } } return Date.now() - lt < 6 * 3600e3 ? last : null; };
  function camList() {
    if (CFG.cameras) return CFG.cameras.map((c, i) => {
      const srcs = asList(c.entities || c.entity);
      return { id: 'c' + i, name: c.name || (srcs[0] ? sceneName(srcs[0]) : 'Camera'), srcs, doorbell: c.doorbell || null, motion: asList(c.motion) };
    }).filter(c => c.srcs.some(s => states()[s]));
    if (!root) return [];
    return leaves(house()).filter(e => e.cat === 'cameras').map((e, i) => {
      const room = areaNodeOf(e);
      const motion = room ? leaves(room).filter(m => m.cat === 'sensors' && isMotion(m.eid, (states()[m.eid] || {}).attributes || {})).map(m => m.eid) : [];
      return { id: 'a' + i, name: e.name === 'Camera' && room ? room.name : e.name, srcs: [e.eid], doorbell: null, motion };
    });
  }
  function stopCams() { camTimers.forEach(clearInterval); camTimers = []; }
  // draw the four corners for their current kinds (the live values come from hotBtns)
  function renderCorners() {
    if (MINI) return;
    for (const pos of POS) {
      const b = Q('.hot.' + pos), k = kindOf(pos), rid = roomIdOf(k), kd = KINDS[k] || { hc: 'var(--light)' };
      b.dataset.h = k; b.hidden = !CFG.hot_buttons || (k === 'none' && !EDIT);
      b.style.setProperty('--hc', cornerCol(k));
      b.classList.toggle('empty', k === 'none'); b.classList.toggle('edit', EDIT); b.classList.toggle('picking', EDIT && editPos === pos);
      b.setAttribute('aria-label', EDIT ? `Change the ${POS_NAME[pos].toLowerCase()} button (${kindName(k)})` : kindName(k));
      b.innerHTML = `<span class="hi">${svgOf(rid ? 'room' : k)}<span class="hn">${esc(kindName(k))}</span><i class="md"></i></span><span class="hv"></span>`;
    }
    const gb = $('gear'); gb.hidden = !CFG.customise;
    gb.classList.toggle('on', EDIT); gb.innerHTML = svgOf(EDIT ? 'check' : 'gear');
    gb.title = EDIT ? 'Done' : 'Customise: hide, rename and move things, and choose the corner buttons';
    gb.setAttribute('aria-label', EDIT ? 'Finish customising' : 'Customise'); gb.setAttribute('aria-pressed', EDIT);
  }
  function hotBtns() {
    if (MINI || !root || !CFG.hot_buttons) return;
    for (const pos of POS) {
      const b = Q('.hot.' + pos), k = kindOf(pos), rid = roomIdOf(k), hv = b.querySelector('.hv'); if (!hv) continue;
      let lit = false, val = '', motion = false, armed = false;
      if (rid) {
        const n = roomNodeOf(rid);
        if (n) { lit = activeCount(n) > 0; val = subOf(n) || 'all off'; } else val = 'not on the ring';
      } else if (k === 'cams') {
        const cams = camList();
        motion = cams.some(c => c.motion.some(m => { const st = states()[m]; return st && (st.state === 'on' || Date.now() - Date.parse(st.last_changed) < 120e3); }));
        val = motion ? 'movement' : cams.length + ' camera' + (cams.length === 1 ? '' : 's');
      } else if (k === 'lights') { const on = onOf(allLights()).length; lit = on > 0; val = on ? on + ' on' : 'all off'; }
      else if (k === 'alarm') {
        const ast = states()[alarmEid()], s = ast ? ast.state : 'none'; armed = !!ast && !['disarmed', 'unavailable', 'unknown'].includes(s);
        lit = armed; val = ast ? nice(s) : 'not set up';
      } else if (k === 'heat') {
        const T = thermostats().map(e => states()[e.eid]).filter(st => !unavail(st)), cur = T.map(st => num(st.attributes.current_temperature)).filter(v => v != null);
        const heating = T.filter(st => st.attributes.hvac_action === 'heating').length; lit = heating > 0;
        val = (cur.length ? deg(cur.reduce((a, c) => a + c, 0) / cur.length) : '—') + (heating ? ' · ' + heating + ' heating' : '');
      } else if (k === 'media') {
        const p = onOf(ofCat('media')); lit = p.length > 0;
        val = p.length === 1 ? (states()[p[0].eid].attributes.media_title || p[0].name) : p.length ? p.length + ' playing' : 'nothing playing';
      } else if (k === 'scenes') { const l = lastScene(), n = sceneList().length; lit = !!l; val = l ? sceneName(l) : n + ' scene' + (n === 1 ? '' : 's'); }
      else if (k === 'doors') {
        const o = openNow(), m = recentMotion(120e3); lit = o.length > 0; motion = m.length > 0;
        val = o.length ? o.length + ' open' : m.length ? 'movement' : 'all closed';
      } else if (k === 'energy') {
        const sol = CFG.energy.find(e => e.kind === 'solar' && states()[e.entity]), load = CFG.energy.find(e => e.kind === 'load' && states()[e.entity]);
        const pick = sol || load; if (pick) { const w = watts(pick.entity, states()[pick.entity]); lit = !!sol && w != null && Math.abs(w) >= 40; val = (pick.name || (sol ? 'Solar' : 'Use')) + ' ' + stateText(pick.entity, states()[pick.entity]); }
        else { const on = onOf(ofCat('plugs')).length; lit = on > 0; val = on + ' plug' + (on === 1 ? '' : 's') + ' on'; }
      } else if (k === 'blinds') { const L = ofCat('covers'), o = onOf(L).length; lit = o > 0; val = L.length ? (o ? o + ' open' : 'all closed') : 'none'; }
      else if (k === 'fans') { const o = onOf(ofCat('fans')).length; lit = o > 0; val = o ? o + ' on' : 'all off'; }
      else if (k === 'plugs') { const o = onOf(ofCat('plugs')).length; lit = o > 0; val = o ? o + ' on' : 'all off'; }
      else if (k === 'none') val = EDIT ? 'tap to choose' : '';
      b.classList.toggle('lit', lit && !EDIT); b.classList.toggle('motion', motion && !EDIT); b.classList.toggle('armed', armed && !EDIT);
      if (k === 'alarm') b.style.setProperty('--hc', armed ? 'var(--alert)' : 'var(--media)');
      b.classList.toggle('open', !EDIT && (rid ? !!focus && focus.kind === 'area' && focus.id === rid : hot === k));
      hv.textContent = EDIT ? (editPos === pos ? 'choosing…' : 'tap to change') : val;
    }
  }
  function openHot(k, keep) {
    clearTimeout(hotAuto); hotAuto = null;
    const rid = roomIdOf(k);
    if (rid) { hot = null; sel = null; nodes.forEach(paint); goPlace('area:' + rid); controls(); hotBtns(); return; }
    if (k === 'none') return;
    if (hot === k && !keep) hot = null; else { hot = k; if (sel) { sel = null; nodes.forEach(paint); } }
    if (k === 'cams' && !keep) hotCam = null;
    controls(); hotBtns();
  }
  function switchAll(list, domain, on, off, one, many) {          // hold: everything off if any is on, otherwise all on
    const act = onOf(list); buzz();
    if (!list.length) { toast('No ' + many + ' to switch'); return; }
    const turnOn = !act.length, ids = (turnOn ? list : act).map(e => e.eid);
    call(domain, turnOn ? on : off, { entity_id: ids }); toast(`${ids.length} ${ids.length === 1 ? one : many} ${turnOn ? (on === 'open_cover' ? 'opening' : 'on') : (off === 'close_cover' ? 'closing' : 'off')}`);
  }
  function hotHold(k) {
    const rid = roomIdOf(k);
    if (rid) { const n = roomNodeOf(rid); if (n) toggleRoomLights(n); return; }
    if (k === 'lights') { toggleRoomLights(root); openHot('lights', true); return; }
    if (k === 'heat' && CFG.heating_hold_mode) {
      const w = heaterEid(); if (w) { call('water_heater', 'set_operation_mode', { entity_id: w, operation_mode: CFG.heating_hold_mode }); buzz(); toast(sceneName(w) + ': ' + modeLabel(CFG.heating_hold_mode).toLowerCase()); }
      openHot('heat', true); return;
    }
    if (k === 'media') {
      const p = onOf(ofCat('media')); buzz();
      if (p.length) { call('media_player', 'media_pause', { entity_id: p.map(e => e.eid) }); toast('Paused ' + p.length + ' player' + (p.length === 1 ? '' : 's')); }
      else toast('Nothing is playing');
      openHot('media', true); return;
    }
    if (k === 'blinds') { switchAll(ofCat('covers'), 'cover', 'open_cover', 'close_cover', 'blind', 'blinds'); openHot('blinds', true); return; }
    if (k === 'fans') { const on = onOf(ofCat('fans')); buzz(); if (on.length) { call('fan', 'turn_off', { entity_id: on.map(e => e.eid) }); toast(on.length + ' fan' + (on.length === 1 ? '' : 's') + ' off'); } else toast('No fans on'); openHot('fans', true); return; }
    if (k === 'none') return;
    buzz(); openHot(k, true);
  }
  QA('.hot').forEach(b => {
    let t = null, held = false;
    const pos = [...b.classList].find(c => POS.includes(c));
    b.addEventListener('pointerdown', () => { held = false; clearTimeout(t); if (EDIT) return; t = setTimeout(() => { held = true; hotHold(kindOf(pos)); }, HOLD_MS); });
    b.addEventListener('pointerup', () => { clearTimeout(t); if (EDIT) { pickCorner(pos); return; } if (!held) openHot(kindOf(pos)); });
    ['pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => clearTimeout(t)));
    b.addEventListener('contextmenu', e => e.preventDefault());
    b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (EDIT) pickCorner(pos); else openHot(kindOf(pos)); } });
  });
  // a doorbell press opens the Cameras card on that door (and closes it after a minute unless someone uses it)
  function dingCheck(h) {
    if (MINI || (!CFG.hot_buttons && !RINGONLY)) return;
    for (const c of camList()) {
      const eid = c.doorbell; if (!eid) continue;
      const st = h.states[eid]; if (!st) continue;
      const was = dingSeen[eid]; dingSeen[eid] = st.last_changed;
      if (was === undefined || was === st.last_changed || st.state !== 'on' || EDIT) continue;
      if (RINGONLY) { buzz(); toast(`Doorbell · ${c.name}`); moreInfo(c.srcs.find(x => states()[x]) || c.srcs[0]); continue; }
      hot = 'cams'; hotCam = c.id; if (sel) { sel = null; nodes.forEach(paint); }
      controls(); hotBtns(); buzz(); toast(`Doorbell · ${c.name}`);
      clearTimeout(hotAuto); hotAuto = setTimeout(() => { hotAuto = null; if (hot === 'cams') { hot = null; controls(); hotBtns(); } }, 60000);
    }
  }
  const modeLabel = x => /^boost_\d+$/.test(x) ? 'Boost ' + x.split('_')[1] + ' min' : /^off_\d+$/.test(x) ? 'Off ' + x.split('_')[1] + ' min' : nice(x);
  const thingChip = (e, act, sub) => `<button class="chip${act ? ' on' : ''}" style="--sc:${e.sc}" data-a="sel" data-v="${esc(e.eid)}"><i></i><span class="t"><div class="n">${esc(e.name)}</div><div class="s">${esc(sub)}</div></span></button>`;
  const toggleChip = (e, act) => `<button class="chip${act ? ' on' : ''}" style="--sc:${e.sc}" data-a="lt" data-v="${esc(e.eid)}"><i></i><span class="t"><div class="n">${esc(e.name)}</div><div class="s">${esc(roomName(e))}</div></span></button>`;
  const ago = t => { const m = Math.round((Date.now() - Date.parse(t)) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : hhmm(t); };
  function hotCard(el) {
    const head = (t, sc) => { el.style.setProperty('--sc', sc); return `<div class="h"><i></i>${t}<button class="x" data-a="close" aria-label="Close">✕</button></div>`; };
    let h = '';
    if (hot === 'cams') {
      const cams = camList(); if (!hotCam || !cams.find(c => c.id === hotCam)) hotCam = cams[0] && cams[0].id;
      cams.sort((a, b) => (b.id === hotCam) - (a.id === hotCam));
      h = head('Cameras', 'var(--cam)') + (cams.length ? `<div class="cams">${cams.map(c => `<div class="cam2${c.id === hotCam ? ' big' : ''}" data-a="cam" data-v="${c.id}"><img alt="${esc(c.name)}"><span>${esc(c.name)}</span><em>No picture right now</em></div>`).join('')}</div>
        <button class="link" data-a="camlive">${CFG.cameras_path ? 'Open your cameras ›' : 'Live view ›'}</button>` : `<div class="note">No cameras with a room yet.</div>`);
    } else if (hot === 'lights') {
      const L = allLights(), on = onOf(L), off = L.filter(e => !on.includes(e));
      h = head(`Lights · ${on.length} on`, 'var(--light)') + `<div class="row"><button class="btn" data-a="alloff"${on.length ? '' : ' disabled'}>All off</button><button class="btn" data-a="allon"${off.length ? '' : ' disabled'}>All on</button></div>
        ${on.length ? `<div class="lbl">On</div><div class="lchips">${on.map(e => toggleChip(e, true)).join('')}</div>` : ''}${off.length ? `<div class="lbl">Off</div><div class="lchips">${off.map(e => toggleChip(e, false)).join('')}</div>` : ''}`;
    } else if (hot === 'alarm') {
      const eid = alarmEid(), st = states()[eid], s = st ? st.state : 'none', armed = !!st && !['disarmed', 'unavailable', 'unknown'].includes(s);
      if (!st) h = head('Alarm', 'var(--media)') + `<div class="note">No alarm panel found. Set <b>alarm:</b> in the card if you have one.</div>`;
      else {
        const a = st.attributes || {}, sf = a.supported_features || 0, codeToArm = a.code_arm_required !== false && a.code_format != null;
        const modes = [[1, 'arm_home', 'Arm home', 'armed_home'], [2, 'arm_away', 'Arm away', 'armed_away'], [4, 'arm_night', 'Arm night', 'armed_night']].filter(m => sf & m[0]);
        h = head('Alarm', armed ? 'var(--alert)' : 'var(--media)') + `<div class="big" style="margin-top:8px;color:${armed ? 'var(--alert)' : 'var(--media)'}">${esc(nice(s))}</div>
          <div class="st">${st.last_changed ? 'since ' + hhmm(st.last_changed) : ''}</div>
          <div class="row">${codeToArm ? '' : modes.map(m => `<button class="btn${s === m[3] ? ' on' : ''}" data-a="arm" data-v="${m[1]}">${m[2]}</button>`).join('')}<button class="btn" data-a="keypad">${armed ? 'Disarm…' : codeToArm ? 'Arm…' : 'Keypad…'}</button></div>
          <div class="note">${codeToArm ? 'Your alarm needs its code to arm, so arming opens the keypad.' : 'Arming needs no code here. Disarming always asks for the code.'}</div>`;
      }
    } else if (hot === 'heat') {
      const w = heaterEid(), ws = w && states()[w], wa = (ws && ws.attributes) || {}, mode = wa.operation_mode || (ws && ws.state);
      const rows = thermostats().map(e => {
        const st = states()[e.eid]; if (unavail(st)) return ''; const a = st.attributes || {}, on = a.hvac_action === 'heating';
        const p = pend[e.eid], tgt = p && Date.now() - p.t < 6000 ? p.v : a.temperature;
        return `<div class="trow"><div class="tn">${esc(roomName(e))}<small class="${on ? 'on' : ''}">${a.current_temperature != null ? deg(a.current_temperature) + ' now' : ''}${on ? ' · heating' : ''}</small></div>
          <button class="btn" data-a="tm" data-v="${e.eid}" aria-label="Lower">−</button><div class="tt">${tgt != null ? deg(tgt) : '—'}</div><button class="btn" data-a="tp" data-v="${e.eid}" aria-label="Raise">+</button></div>`;
      }).join('');
      h = head('Heating', 'var(--heat)') + (rows ? `<div class="lbl">Rooms · target</div>${rows}` : `<div class="note">No thermostats with a room yet.</div>`);
      if (ws && (wa.operation_list || []).length) h += `<div class="lbl">${esc(sceneName(w))} · ${esc(modeLabel(mode || '—'))}</div>` + btns(wa.operation_list, mode, 'wm', modeLabel);
    } else if (hot === 'media') {
      const L = ofCat('media'), p = onOf(L);
      const rows = L.sort((a, b) => isActive(b.eid, states()[b.eid]) - isActive(a.eid, states()[a.eid])).map(e => {
        const st = states()[e.eid], a = st.attributes || {}, playing = st.state === 'playing';
        const sub = (a.media_title ? a.media_title + (a.media_artist ? ' · ' + a.media_artist : '') : st.state) + ' · ' + roomName(e);
        return `<div class="trow mrow"><button class="tn link2" data-a="sel" data-v="${esc(e.eid)}">${esc(e.name)}<small class="${playing ? 'on' : ''}">${esc(sub)}</small></button>
          <button class="btn${playing ? ' on' : ''}" data-a="pp" data-v="${esc(e.eid)}">${playing ? 'Pause' : 'Play'}</button></div>`;
      }).join('');
      h = head(`TV & music · ${p.length} playing`, 'var(--media)') + (p.length ? `<div class="row"><button class="btn" data-a="pauseall">Pause all</button></div>` : '') +
        (rows ? `<div class="lbl">Players</div>${rows}` : `<div class="note">No TVs or speakers with a room yet.</div>`);
    } else if (hot === 'scenes') {
      const L = sceneList(), last = lastScene();
      h = head('Scenes', 'var(--light)') + (L.length ? `<div class="lchips scn2">${L.map(e => `<button class="chip${e === last ? ' on' : ''}" style="--sc:var(--light)" data-a="scene" data-v="${esc(e)}"><i></i><span class="t"><div class="n">${esc(sceneName(e))}</div><div class="s">${e === last ? 'last run ' + hhmm(states()[e].state) : 'tap to run'}</div></span></button>`).join('')}</div>` : `<div class="note">No scenes yet.</div>`);
    } else if (hot === 'doors') {
      const o = openNow(), m = recentMotion(3600e3), al = onOf(ofCat('safety'));
      h = head('Doors & motion', 'var(--alert)') + (al.length ? `<div class="lbl">Going off now</div><div class="lchips">${al.map(e => thingChip(e, true, roomName(e) + ' · ' + (SAFETY_LABEL[(states()[e.eid].attributes || {}).device_class] || 'alarm'))).join('')}</div>` : '') +
        `<div class="lbl">Open now</div>` + (o.length ? `<div class="lchips">${o.map(e => thingChip(e, true, roomName(e) + ' · ' + ago(states()[e.eid].last_changed))).join('')}</div>` : `<div class="note">Everything is closed.</div>`) +
        `<div class="lbl">Movement in the last hour</div>` + (m.length ? `<div class="lchips">${m.map(e => thingChip(e, states()[e.eid].state === 'on', roomName(e) + ' · ' + ago(states()[e.eid].last_changed))).join('')}</div>` : `<div class="note">No movement.</div>`);
    } else if (hot === 'energy') {
      const E = energyNodes(), plugs = ofCat('plugs'), on = onOf(plugs);
      h = head('Energy', 'var(--plug)') + (E.length ? `<div class="kvs">${E.map(e => kv(e.name || sceneName(e.entity), esc(stateText(e.entity, states()[e.entity])))).join('')}</div>` : '') +
        `<div class="lbl">Plugs · ${on.length} on</div>` + (plugs.length ? `<div class="lchips">${plugs.sort((a, b) => isActive(b.eid, states()[b.eid]) - isActive(a.eid, states()[a.eid])).map(e => toggleChip(e, isActive(e.eid, states()[e.eid]))).join('')}</div>` : `<div class="note">No plugs with a room yet.</div>`) +
        (E.length ? '' : `<div class="note">Add your solar, battery and grid readings with <b>energy:</b> in the card.</div>`);
    } else if (hot === 'blinds') {
      const L = ofCat('covers'), o = onOf(L);
      h = head(`Blinds · ${o.length} open`, 'var(--fan)') + (L.length ? `<div class="row"><button class="btn" data-a="coverall" data-v="open">All open</button><button class="btn" data-a="coverall" data-v="close">All closed</button></div>` +
        L.map(e => `<div class="trow mrow"><button class="tn link2" data-a="sel" data-v="${esc(e.eid)}">${esc(e.name)}<small>${esc(roomName(e) + ' · ' + stateText(e.eid, states()[e.eid]))}</small></button>
          <span class="row" style="margin:0;flex-wrap:nowrap"><button class="btn" data-a="cv" data-v="open:${esc(e.eid)}">Open</button><button class="btn" data-a="cv" data-v="stop:${esc(e.eid)}">Stop</button><button class="btn" data-a="cv" data-v="close:${esc(e.eid)}">Close</button></span></div>`).join('')
        : `<div class="note">No blinds with a room yet.</div>`);
    } else if (hot === 'fans' || hot === 'plugs') {
      const L = ofCat(hot === 'fans' ? 'fans' : 'plugs'), on = onOf(L), off = L.filter(e => !on.includes(e)), label = hot === 'fans' ? 'Fans' : 'Plugs';
      h = head(`${label} · ${on.length} on`, hot === 'fans' ? 'var(--fan)' : 'var(--plug)') + (hot === 'fans' && on.length ? `<div class="row"><button class="btn" data-a="fansoff">All off</button></div>` : '') +
        (on.length ? `<div class="lbl">On</div><div class="lchips">${on.map(e => toggleChip(e, true)).join('')}</div>` : '') +
        (off.length ? `<div class="lbl">Off</div><div class="lchips">${off.map(e => toggleChip(e, false)).join('')}</div>` : '') + (L.length ? '' : `<div class="note">None with a room yet.</div>`);
    }
    el.innerHTML = h;
    el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const k = b.dataset.a, v = b.dataset.v;
      if (k !== 'close') { clearTimeout(hotAuto); hotAuto = null; }     // someone is using it: no auto-close
      if (k === 'close') { hot = null; controls(); hotBtns(); return; }
      if (k === 'cam') { hotCam = v; controls(); return; }
      if (k === 'camlive') { if (CFG.cameras_path) navigate(CFG.cameras_path); else { const c = camList().find(x => x.id === hotCam); moreInfo(c && c.srcs.find(s => states()[s])); } return; }
      if (k === 'sel') { const n = nodes.find(x => x.eid === v); if (n) select(n); return; }
      if (k === 'lt') call(v.split('.')[0], 'toggle', { entity_id: v });
      if (k === 'alloff') { switchLights(onOf(allLights()), false); buzz(); toast('All lights off'); }
      if (k === 'allon') { switchLights(allLights(), true); buzz(); toast('All lights on'); }
      if (k === 'arm') { call('alarm_control_panel', 'alarm_' + v, { entity_id: alarmEid() }); buzz(); toast(nice(v.replace('arm_', 'arming ').replace('_', ' '))); }
      if (k === 'keypad') { if (CFG.alarm_path) navigate(CFG.alarm_path); else moreInfo(alarmEid()); }
      if (k === 'tm' || k === 'tp') {
        const a = (states()[v] || {}).attributes || {}, p = pend[v], base = p && Date.now() - p.t < 6000 ? p.v : (a.temperature || 20), step = a.target_temp_step || .5;
        const t = clamp(Math.round((base + (k === 'tp' ? step : -step)) / step) * step, a.min_temp || 5, a.max_temp || 35);
        pend[v] = { v: t, t: Date.now() }; call('climate', 'set_temperature', { entity_id: v, temperature: t }); const tt = b.parentNode.querySelector('.tt'); if (tt) tt.textContent = deg(t);
      }
      if (k === 'wm') { call('water_heater', 'set_operation_mode', { entity_id: heaterEid(), operation_mode: v }); buzz(); toast(sceneName(heaterEid()) + ': ' + modeLabel(v).toLowerCase()); }
      if (k === 'pp') { call('media_player', 'media_play_pause', { entity_id: v }); buzz(); }
      if (k === 'pauseall') { const p = onOf(ofCat('media')); if (p.length) call('media_player', 'media_pause', { entity_id: p.map(e => e.eid) }); buzz(); toast('Paused everything'); }
      if (k === 'scene') { call('scene', 'turn_on', { entity_id: v }); buzz(); toast(sceneName(v) + ' scene on'); }
      if (k === 'coverall') { const L = ofCat('covers'); if (L.length) call('cover', v === 'open' ? 'open_cover' : 'close_cover', { entity_id: L.map(e => e.eid) }); buzz(); toast(v === 'open' ? 'Opening all blinds' : 'Closing all blinds'); }
      if (k === 'cv') { const [act, eid] = [v.slice(0, v.indexOf(':')), v.slice(v.indexOf(':') + 1)]; call('cover', act + '_cover', { entity_id: eid }); buzz(); }
      if (k === 'fansoff') { const on = onOf(ofCat('fans')); if (on.length) call('fan', 'turn_off', { entity_id: on.map(e => e.eid) }); buzz(); toast('Fans off'); }
    });
    if (hot === 'cams') el.querySelectorAll('.cam2').forEach(tile => {
      const c = camList().find(x => x.id === tile.dataset.v), img = tile.querySelector('img'), big = tile.classList.contains('big');
      if (!c) return;
      let i = 0, skip = 0;
      const next = () => { const st = states()[c.srcs[i]], p = st && !unavail(st) && st.attributes.entity_picture; if (!p) { fail(); return; } img.src = withT(p); };
      const fail = () => { if (i < c.srcs.length - 1) { i++; next(); } else { tile.classList.add('fail'); i = 0; skip = 5; } };
      img.onload = () => tile.classList.remove('fail'); img.onerror = fail;
      next();
      const every = CFG.camera_refresh * 1000;
      camTimers.push(setInterval(() => { if (skip > 0) { skip--; return; } next(); }, big ? Math.max(1000, every / 2) : every));
    });
  }

  /* ---------- Customise (the gear): hide, rename and move things, and choose what each corner does ----------
     The view stays where it is: tap any floor, room, kind or thing on it to change that one, or the centre for the place
     you are in. To change what is inside a room, tap the tick, go into the room and tap the gear again.
     Nothing is switched while Customise is on. Every change is saved at once, for the screens chosen under "This setup is for". */
  function setEdit(on) {
    EDIT = on; editPos = null; editN = null; editKind = null; hot = null;
    $('app').classList.toggle('editing', on);
    nodes.forEach(paint); renderCorners(); controls(); hotBtns();
    if (on) toast('Tap anything to change it');
  }
  function pickCorner(pos) {
    editPos = editPos === pos ? null : pos; sel = null; editN = null; editKind = null;
    nodes.forEach(paint); renderCorners(); controls(); hotBtns(); if (editPos) reveal();
  }
  const hideKeyOf = n => n.kind === 'ent' ? (n.dev ? 'd:' + n.dev : 'e:' + n.eid) : n.kind === 'cat' ? 'c:' + n.parent.id + ':' + n.cat : n.kind === 'area' ? 'a:' + n.id : 'f:' + (n.id ?? '_');
  const nameKeyOf = n => (n.kind === 'ent' ? 'e:' + n.eid : n.kind === 'area' ? 'a:' + n.id : 'f:' + n.id);
  const canHide = n => n.kind !== 'home' && n.id !== '_energy' && !n.virtual && !n.fixed;
  const canRename = n => n.kind === 'ent' || (n.kind === 'area' && n.id !== '_energy') || (n.kind === 'floor' && n.id != null && !n.sys && !n.fixed);
  const isHid = n => HIDE.has(hideKeyOf(n));                 // only seen in the Everything view, where hidden things stay on the ring
  const toggleHide = n => isHid(n) ? showKey(hideKeyOf(n), n.name) : hideNode(n);
  const realRoom = eid => { const r = (H.entities || {})[eid], a = r && (r.area_id || (r.device_id && H.devices && H.devices[r.device_id] && H.devices[r.device_id].area_id)); return (a && H.areas && H.areas[a] && H.areas[a].name) || 'its room'; };
  let newGroup = false;                                      // the thing card is asking for a new group's name
  function setGroup(n, gid, name) {
    change(p => { if (!gid) { delete p.grp[n.eid]; return; } if (name) p.groups.push({ id: gid, name }); p.grp[n.eid] = gid; },
      n.name + (gid ? ': in ' + (name || (PROF.groups.find(g => g.id === gid) || {}).name) : ': back in ' + realRoom(n.eid)));
  }
  function deleteGroup(t) {
    const gid = t.id.slice(2); if (focus === t) focus = t.parent || root; editN = null; sel = null;
    change(p => { p.groups = p.groups.filter(g => g.id !== gid); for (const e of Object.keys(p.grp)) if (p.grp[e] === gid) delete p.grp[e]; }, t.name + ' removed · its things are back in their rooms');
  }
  const KIND_WORD = { floor: 'Floor', area: 'Room', cat: 'Kind', ent: 'Thing' };
  const SAVED = { all: '', user: '', here: '', 'user!': ' · saved for your account', 'here!': ' · saved on this screen' };
  // change the setup: shown at once, then saved
  function change(mut, msg) {
    const next = JSON.parse(JSON.stringify(PROF)); mut(next);
    next.groups = next.groups.filter(g => Object.values(next.grp).includes(g.id));      // a group with nothing in it is gone
    saveProfile(next).then(where => {
      if (where === 'wait' || where === 'newer') {
        toast(where === 'wait' ? 'Still reading your setup from Home Assistant. Try again in a moment' : 'This setup was saved by a newer Home Ring. Reload this screen to change it');
        controls(); return;
      }
      if (msg) toast(msg + (SAVED[where] || ''));
    });
    buzz();
  }
  function hideNode(n) {
    const k = hideKeyOf(n), name = n.kind === 'cat' ? n.name + ' in ' + n.parent.name : n.name;
    if (VIEW !== 'all') {                                   // (Everything keeps it on the ring, dimmed)
      if (n === focus) focus = n.parent || root;            // hiding where you are: step back out
      if (sel && (sel === n || leaves(n).includes(sel))) sel = null;
      editN = null;
    }
    change(p => { if (!p.hide.includes(k)) p.hide.push(k); }, name + ' hidden');
  }
  const showKey = (k, name) => change(p => { p.hide = p.hide.filter(x => x !== k); }, name + ' is back');
  function rename(n, v) {
    v = String(v || '').trim().slice(0, 40); const k = nameKeyOf(n);
    if (n.virtual) {                                        // a group's name is its own
      if (!v || v === n.name) return false; const gid = n.id.slice(2);
      change(p => { const g = p.groups.find(x => x.id === gid); if (g) g.name = v; }, 'Renamed: ' + v); return true;
    }
    if (v === n.name || (!v && !PROF.name[k])) return false;
    change(p => { if (!v || v === n.auto) delete p.name[k]; else p.name[k] = v; }, !v || v === n.auto ? 'Name put back: ' + n.auto : 'Renamed: ' + v);
    return true;
  }
  // everything hidden with Customise, with where it belongs (so each room and floor can list its own)
  function hiddenList() {
    const ents = H.entities || {}, devs = H.devices || {}, areas = H.areas || {}, floors = H.floors || {};
    return PROF.hide.map(k => {
      const t = k[0], id = k.slice(2); let name = id, area = null, floor, what = 'Thing';
      if (t === 'e') { const r = ents[id]; name = PROF.name[k] || sceneName(id); area = (r && (r.area_id || (r.device_id && devs[r.device_id] && devs[r.device_id].area_id))) || null; }
      else if (t === 'd') { const dv = devs[id]; name = dv ? (dv.name_by_user || dv.name || id) : id; area = dv ? dv.area_id : null; }
      else if (t === 'c') { const i = id.lastIndexOf(':'), c = id.slice(i + 1); area = id.slice(0, i); name = (CATS[c] || {}).name || c; what = 'Kind'; }
      else if (t === 'a') { name = PROF.name[k] || (areas[id] ? areas[id].name : id); floor = areas[id] ? areas[id].floor_id || null : undefined; what = 'Room'; }
      else { const sy = SYSTEMS.find(x => 'sys:' + x.id === id); name = sy ? sy.name : id === '_' ? 'Other rooms' : (floors[id] || {}).name || id; what = sy ? 'System' : 'Floor'; }
      if (area) floor = areas[area] ? areas[area].floor_id || null : undefined;
      return { k, t, name, area, floor, where: area && areas[area] ? PROF.name['a:' + area] || areas[area].name : what };
    });
  }
  function hiddenUnder(t) {
    const L = hiddenList();
    if (t.kind === 'home') return L;
    if (t.kind === 'floor') return t.sys ? [] : L.filter(x => x.t !== 'f' && x.floor === (t.id ?? null));
    const a = t.kind === 'area' ? t.id : t.parent.id;
    return L.filter(x => x.t !== 'a' && x.t !== 'f' && x.area === a);
  }
  const SCOPE_NAME = { all: 'Every screen', user: 'My account', here: 'This screen' };
  const SCOPE_NOTE = {
    all: 'One setup shared by every screen and everyone.',
    user: 'Your own setup, on every device you sign in on. Everyone else keeps theirs.',
    here: 'This screen has its own setup, so a phone and a wall tablet can each show what suits them.',
  };
  const scopeNote = () => 'Saved for: ' + SCOPE_NAME[scopeOf()].toLowerCase() + '.';
  // a text box that is safe to type in: Home Assistant's keyboard shortcuts stay out of it, Enter saves
  function wireName(el, n) {
    const inp = el.querySelector('[data-a="name"]'); if (!inp) return;
    inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') { inp.value = n.name; inp.blur(); } });
    inp.onchange = () => { if (!rename(n, inp.value)) inp.value = n.name; };
    const b = el.querySelector('[data-a="save"]'); if (b) b.onclick = () => rename(n, inp.value);
  }
  const nameRow = n => `<div class="lbl">Name on the ring</div>
      <div class="row"><input class="txt" type="text" data-a="name" value="${esc(n.name)}" placeholder="${esc(n.auto || n.name)}" maxlength="40" autocomplete="off" autocapitalize="sentences" spellcheck="false" enterkeyhint="done" aria-label="Name on the ring"><button class="btn" data-a="save">Save</button></div>` +
      (n.auto && n.auto !== n.name && !n.virtual ? `<div class="note" style="margin-top:6px">In Home Assistant: ${esc(n.auto)}. Clear the box to put it back.</div>` : '');
  /* ---------- colours and places ----------
     A colour: one of the quick choices, your own (the browser's picker, shown on the ring while you pick), or automatic.
     A place: eight spots round the ring for a kind (in every room) or a system (in By system), or automatic. */
  let colPrev = 0;
  function colourRow(key, cur, label) {
    const mine = PROF.col[key], own = mine && !SWATCHES.includes(mine);
    return `<div class="lbl">${esc(label)}</div><div class="row sw cols">` +
      SWATCHES.map(c => `<button class="dot${mine === c ? ' on' : ''}" style="background:${c}" data-col="${c}" aria-label="Colour ${c}" title="${c}"></button>`).join('') +
      `<label class="dot pick${own ? ' on' : ''}" title="Your own colour" style="--c:${own ? mine : 'transparent'}"><i></i><input type="color" data-a="colpick" value="${toHex(cur)}" aria-label="Your own colour"></label>` +
      (mine ? `<button class="btn" data-a="colauto">Automatic</button>` : '') + `</div>`;
  }
  // which slices a colour changes, so a picker can show it on the ring before it is saved
  function colourTargets(key) {
    const t = key[0], id = key.slice(2), out = [];
    const sub = (n, f) => { if (n.kind !== 'floor' && n.kind !== 'area') return; f(n); n.kids.forEach(k => { if (!(k.kind === 'area' && PROF.col['a:' + k.id])) sub(k, f); }); };
    for (const n of nodes) {
      if (t === 'k') { if (n.cat === id && !(n.kind === 'ent' && PROF.col['e:' + n.eid])) out.push([n, 'sc'], [n, 'hue']); if (n.sys === id) sub(n, x => out.push([x, 'hue'])); }
      else if (t === 'e') { if (n.eid === id) out.push([n, 'sc'], [n, 'hue']); }
      else if ((t === 'a' && n.kind === 'area' && n.id === id) || (t === 'f' && n.kind === 'floor' && !n.sys && String(n.id ?? '_') === id)) sub(n, x => out.push([x, 'hue']));
    }
    return out;
  }
  function wireColour(el, key, name) {
    const set = v => change(p => { if (v) p.col[key] = v; else delete p.col[key]; }, name + (v ? ': new colour' : ': colour back to automatic'));
    el.querySelectorAll('[data-col]').forEach(b => b.onclick = () => set(b.dataset.col));
    const a = el.querySelector('[data-a="colauto"]'); if (a) a.onclick = () => set(null);
    const pick = el.querySelector('[data-a="colpick"]'); if (!pick) return;
    pick.oninput = () => {                        // show it on the ring at once; saved when the picker closes
      cancelAnimationFrame(colPrev); const v = pick.value;
      colPrev = requestAnimationFrame(() => { for (const [n, f] of colourTargets(key)) n[f] = v; nodes.forEach(paint); });
    };
    pick.onchange = () => set(pick.value);
  }
  const POS8 = [[0, 'Top'], [45, 'Top right'], [90, 'Right'], [135, 'Bottom right'], [180, 'Bottom'], [225, 'Bottom left'], [270, 'Left'], [315, 'Top left']];
  function posDial(key, where) {
    const cur = PROF.pos[key], R = 36, at = {};
    for (const [k, v] of Object.entries(PROF.pos)) if (k !== key && at[v] == null) at[v] = k;
    const dot = ([a, nm]) => { const x = (R * Math.sin(a * Math.PI / 180)).toFixed(1), y = (-R * Math.cos(a * Math.PI / 180)).toFixed(1), o = at[a];
      return `<g class="pp${cur === a ? ' on' : ''}${o ? ' taken' : ''}" data-pos="${a}" role="button" tabindex="0" aria-label="${nm}${o ? ' (' + esc(kindName2(o)) + ' is there)' : ''}"${o ? ` style="--tc:${kindCol(o)}"` : ''}><title>${nm}${o ? ' · ' + esc(kindName2(o)) : ''}</title><circle cx="${x}" cy="${y}" r="9.5"/></g>`; };
    const here = POS8.find(p => p[0] === cur);
    return `<div class="lbl">Place on the ring · ${esc(where)}</div><div class="dialrow"><svg class="dial" viewBox="-50 -50 100 100" role="group" aria-label="Place on the ring">
      <circle class="track" r="${R}"/>${POS8.map(dot).join('')}<g class="pp${cur == null ? ' on' : ''}" data-pos="" role="button" tabindex="0" aria-label="Automatic"><circle r="17"/><text text-anchor="middle" dominant-baseline="central">Auto</text></g></svg>
      <div class="note">${here ? `Sits at the <b>${here[1].toLowerCase()}</b>, as close as the sizes allow.` : 'Automatic: in the usual order.'} Coloured dots are taken by other kinds; two can share a place.</div></div>`;
  }
  function wirePos(el, key, name) {
    const set = v => { if ((v === '' ? undefined : +v) === PROF.pos[key]) return; change(p => { if (v === '') delete p.pos[key]; else p.pos[key] = +v; }, name + ': ' + (v === '' ? 'automatic place' : POS8.find(x => x[0] === +v)[1].toLowerCase())); };
    el.querySelectorAll('[data-pos]').forEach(g => {
      g.addEventListener('click', () => set(g.dataset.pos));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(g.dataset.pos); } });
    });
  }
  // a kind (or system) on its own: its place and colour everywhere. Opened from the kinds list on the first Customise card
  const kindSection = c => posDial(c, MODE === 'systems' ? 'on the By system ring' : 'in every room') + colourRow('k:' + c, kindCol(c), 'Colour · everywhere');
  function kindEdit(el) {
    const c = editKind;
    el.style.setProperty('--sc', kindCol(c));
    el.innerHTML = `<div class="h"><i></i>${esc(kindName2(c))}<button class="x" data-a="kback" aria-label="Close">✕</button></div>
      <div class="st">${MODE === 'systems' ? 'System' : 'Kind'} · ${esc(scopeNote())}</div>${kindSection(c)}
      <div class="row"><button class="btn" data-a="kback">Back</button></div>`;
    wirePos(el, c, kindName2(c)); wireColour(el, 'k:' + c, kindName2(c));
    el.querySelectorAll('[data-a="kback"]').forEach(b => b.onclick = () => { editKind = null; controls(); });
  }

  // Customise, one thing: its name, the kind it is shown under, whether its room switches it, and hiding it
  function thingEdit(el) {
    const n = sel, st = states()[n.eid], auto = st ? catOf(n.eid, st) : null, power = n.cat === 'power';
    el.style.setProperty('--sc', n.sc);
    let h = `<div class="h"><i></i>${esc(n.name)}<button class="x" data-a="close" aria-label="Close">✕</button></div>
      <div class="st">${esc(roomName(n))} · ${esc(CATS[n.cat].name)} · ${esc(n.eid)}</div>` + nameRow(n);
    if (!power) h += `<div class="lbl">Shown under</div><select data-a="kind" aria-label="Shown under"><option value="">Automatic${auto ? ' (' + esc(CATS[auto].name) + ')' : ''}</option>
      ${CAT_ORDER.map(c => `<option value="${c}"${PROF.cat[n.eid] === c ? ' selected' : ''}>${esc(CATS[c].name)}</option>`).join('')}</select>`;
    if (!power) {
      const cur = PROF.grp[n.eid] || '';
      h += `<div class="lbl">Group · a room of your own</div>` + (newGroup
        ? `<div class="row"><input class="txt" type="text" data-a="gname" placeholder="Name of the new group" maxlength="30" autocomplete="off" spellcheck="false" enterkeyhint="done" aria-label="Name of the new group"><button class="btn on" data-a="gadd">Create</button><button class="btn" data-a="gno">Cancel</button></div>`
        : `<select data-a="grp" aria-label="Group"><option value="">None · stays in ${esc(realRoom(n.eid))}</option>${PROF.groups.map(g => `<option value="${esc(g.id)}"${g.id === cur ? ' selected' : ''}>${esc(g.name)}</option>`).join('')}<option value="+">New group…</option></select>`) +
        (cur && VIEW === 'all' ? `<div class="note" style="margin-top:6px">In My view it is in this group, not in ${esc(realRoom(n.eid))}.</div>` : '');
    }
    h += colourRow('e:' + n.eid, n.sc, 'Colour');
    if (n.cat === 'lights') {
      const yaml = CFG.lights_exclude(n.eid, n.name), out = NOL.has(n.eid);
      h += `<div class="lbl">Holding its room, and “all lights”</div>` + (yaml ? `<div class="note" style="margin-top:6px">Left out by <b>lights_exclude</b> in the card's settings.</div>`
        : `<div class="row"><button class="btn${out ? '' : ' on'}" data-a="nol" data-v="in">Switches it</button><button class="btn${out ? ' on' : ''}" data-a="nol" data-v="out">Leaves it alone</button></div>`);
    }
    h += `<div class="row">${isHid(n) ? `<button class="btn on" data-a="hide">${svgOf('eye')}&nbsp;Show in My view again</button>` : n.hid ? '' : `<button class="btn warn" data-a="hide">${svgOf('eyeoff')}Hide from ${VIEW === 'all' ? 'My view' : 'the ring'}</button>`}<button class="btn" data-a="close">Back</button></div>
      <div class="note">${n.hid && !isHid(n) ? 'Hidden in My view along with its room, floor or kind. ' : ''}${esc(scopeNote())} A hidden thing is listed in its room's Customise card, to bring back.</div>`;
    el.innerHTML = h; wireName(el, n); wireColour(el, 'e:' + n.eid, n.name);
    const gi = el.querySelector('[data-a="gname"]');
    if (gi) {
      const add = () => { const v = gi.value.trim().slice(0, 30); if (!v) { gi.focus(); return; } newGroup = false; setGroup(n, 'g' + Date.now().toString(36), v); };
      gi.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') add(); if (e.key === 'Escape') { newGroup = false; controls(); } });
      el.querySelector('[data-a="gadd"]').onclick = add; el.querySelector('[data-a="gno"]').onclick = () => { newGroup = false; controls(); };
      gi.focus();
    }
    el.querySelectorAll('[data-a]').forEach(b => {
      const k = b.dataset.a;
      if (k === 'kind') { b.onchange = () => { const v = b.value; change(p => { if (v) p.cat[n.eid] = v; else delete p.cat[n.eid]; }, n.name + ': ' + (v ? CATS[v].name : 'automatic')); }; return; }
      if (k === 'grp') { b.onchange = () => { if (b.value === '+') { newGroup = true; controls(); } else setGroup(n, b.value); }; return; }
      if (k === 'close') b.onclick = () => { sel = null; nodes.forEach(paint); controls(); };
      if (k === 'hide') b.onclick = () => toggleHide(n);
      if (k === 'nol') b.onclick = () => { const out = b.dataset.v === 'out'; if (out === NOL.has(n.eid)) return; change(p => { p.nol = p.nol.filter(x => x !== n.eid); if (out) p.nol.push(n.eid); }, n.name + (out ? ': left alone' : ': switched with its room')); };
    });
  }
  // Customise, a floor, room or kind (or the whole house): rename or hide it, hide what is in it, and bring hidden things back.
  // The card for the place you are in also holds who the setup is for and this screen's animation speed.
  function groupEdit(el) {
    const t = editN || focus, home = t.kind === 'home', held = !!editN;
    const items = t.kind === 'area' ? leaves(t) : t.kids, hid = VIEW === 'all' ? [] : hiddenUnder(t), L = leaves(t).length;
    el.style.setProperty('--sc', 'var(--light)');
    let h = `<div class="h"><i></i>${home ? 'Customise' : 'Customise · ' + esc(t.name)}<button class="x" data-a="${held ? 'unhold' : 'done'}" aria-label="${held ? 'Close' : 'Done'}">✕</button></div>
      <div class="st">${home ? '' : esc(`${t.sys ? 'System' : t.virtual ? 'Group' : KIND_WORD[t.kind]} · ${L} thing${L === 1 ? '' : 's'}`) + (held ? '' : ' · ')}${held ? '' : 'Tap anything on the ring to rename, move or hide it' + (RINGONLY ? '.' : ', or a corner button to choose what it does.')}</div>`;
    if (canRename(t)) h += nameRow(t);
    if (items.length) h += `<div class="lbl">${home ? 'On the ring' : 'In ' + esc(t.name)} · tap the eye to hide</div><div class="erows">` + items.map(n =>
      `<div class="erow${isHid(n) ? ' off' : ''}"><button class="en" data-go="${n.i}">${esc(n.name)}<small>${esc(n.kind === 'ent' ? CATS[n.cat].name : leaves(n).length + ' thing' + (leaves(n).length === 1 ? '' : 's'))}</small></button>` +
      (canHide(n) && (isHid(n) || !n.hid) ? `<button class="eye" data-hide="${n.i}" aria-label="${isHid(n) ? 'Show' : 'Hide'} ${esc(n.name)}" title="${isHid(n) ? 'Bring back' : 'Hide'}">${svgOf(isHid(n) ? 'eyeoff' : 'eye')}</button>` : '') + `</div>`).join('') + `</div>`;
    if (hid.length) h += `<div class="lbl">Hidden${home ? '' : ' here'} · ${hid.length} · tap the eye to bring back</div><div class="erows">` + hid.map((x, i) =>
      `<div class="erow off"><span class="en">${esc(x.name)}<small>${esc(x.where)}</small></span><button class="eye" data-show="${i}" aria-label="Show ${esc(x.name)}" title="Bring back">${svgOf('eyeoff')}</button></div>`).join('') + `</div>`;
    const colKey = t.kind === 'cat' || t.sys ? 'k:' + (t.cat || t.sys) : t.kind === 'area' && t.id !== '_energy' && MODE === 'rooms' ? 'a:' + t.id : t.kind === 'floor' ? 'f:' + (t.id ?? '_') : null;
    if (t.kind === 'cat' || t.sys) h += kindSection(t.cat || t.sys);
    else if (colKey) h += colourRow(colKey, t.hue, t.kind === 'area' ? (t.virtual ? 'Colour of this group' : 'Colour of this room') : 'Colour of this floor');
    if (home) {
      const ks = MODE === 'systems' ? SYSTEMS.map(x => x.id).filter(c => root.kids.some(k => k.sys === c)) : CAT_ORDER.filter(c => leaves(house()).some(e => e.cat === c));
      const th = PROF.theme || CFG.theme;
      h += `<div class="lbl">${MODE === 'systems' ? 'Systems' : 'Kinds'} · place and colour</div><div class="kchips">` + ks.map(c => { const pp = POS8.find(p => p[0] === PROF.pos[c]);
        return `<button class="chip" style="--sc:${kindCol(c)}" data-kind="${esc(c)}"><i></i><span class="t"><div class="n">${esc(kindName2(c))}</div><div class="s">${pp ? esc(pp[1]) : 'automatic'}</div></span></button>`; }).join('') + `</div>
        <div class="lbl">Look</div><div class="seg" role="group" aria-label="Look">${[['dark', 'Dark'], ['light', 'Light'], ['ha', 'Home Assistant']].map(([k, nm]) => `<button data-theme="${k}" class="${k === th ? 'on' : ''}" aria-pressed="${k === th}">${nm}</button>`).join('')}</div>`;
    }
    const what = t.sys ? 'this system' : 'this ' + (KIND_WORD[t.kind] || '').toLowerCase();
    const foot = `<div class="row">${t.virtual ? `<button class="btn warn" data-a="gdel">Remove this group</button>` : !canHide(t) ? '' : isHid(t) ? `<button class="btn on" data-a="hide">${svgOf('eye')}&nbsp;Show ${esc(what)} in My view again</button>`
      : t.hid ? '' : `<button class="btn warn" data-a="hide">${svgOf('eyeoff')}Hide ${esc(what)}</button>`}${held ? '<button class="btn" data-a="unhold">Back</button>' : ''}<button class="btn on" data-a="done">Done</button></div>`;
    if (!held) {
      const sc = scopeOf(), speed = v => v <= 0 ? 'instant' : v >= 100 ? 'normal (0.75 s)' : (FULL_MS * v / 100 / 1000).toFixed(2).replace(/0$/, '') + ' s';
      h += `<div class="lbl">This setup is for</div><div class="seg" role="group" aria-label="This setup is for">${['all', 'user', 'here'].filter(x => x !== 'user' || profStore.user !== false || sc === 'user')
        .map(x => `<button data-scope="${x}" class="${x === sc ? 'on' : ''}" aria-pressed="${x === sc}">${SCOPE_NAME[x]}</button>`).join('')}</div>
        <div class="note" id="scopev" style="margin-top:8px">${esc(SCOPE_NOTE[sc])}${sc === 'all' && H.user && H.user.is_admin === false ? ' Only an admin can change it: your changes are saved for your account.' : ''}</div>
        <div class="lbl">Layout · this screen</div><div class="seg" role="group" aria-label="Layout">${[['ring', 'Ring only'], ['full', 'Ring, corners and panel']].map(([v, nm]) => `<button data-layout="${v}" class="${(v === 'ring') === RINGONLY ? 'on' : ''}" aria-pressed="${(v === 'ring') === RINGONLY}">${nm}</button>`).join('')}</div>
        <div class="note" style="margin-top:6px">${RINGONLY ? 'Tap a light, switch, fan, speaker or blind to switch it; tap anything else, or hold any thing, for Home Assistant’s own controls. The panel shows only while you customise.' : 'Tap a thing for its card in the panel; hold to switch it. The corner buttons open their cards.'}</div>
        <div class="lbl">Rings shown at once · this screen</div><div class="seg" role="group" aria-label="Rings shown at once">${[[2, 'Two'], [3, 'Three'], [0, 'All']].map(([v, nm]) => `<button data-levels="${v}" class="${v === LEVELS ? 'on' : ''}" aria-pressed="${v === LEVELS}">${nm}</button>`).join('')}</div>
        <div class="note" style="margin-top:6px">Fewer rings give each one more room, so names fit. Go into a room to see what is in it.</div>
        <div class="lbl">Animation speed · this screen</div>
        <div class="row"><span class="pv" style="min-width:auto;text-align:left">Instant</span><input type="range" min="0" max="100" step="5" value="${SPEED}" data-a="speed" aria-label="Animation speed"><span class="pv" style="min-width:auto">Normal</span></div>
        <div class="note" id="speedv" style="margin-top:4px">Going into a room: ${speed(SPEED)}</div>`;
      el.innerHTML = h + foot;
      const r = el.querySelector('[data-a="speed"]');
      r.oninput = () => { SPEED = +r.value; const n = el.querySelector('#speedv'); if (n) n.textContent = 'Going into a room: ' + speed(SPEED); };
      r.onchange = () => { LS.set('homeRingSpeed', String(SPEED)); buzz(); toast('Animation: ' + speed(SPEED)); };
      el.querySelectorAll('[data-layout]').forEach(b => b.onclick = () => {
        const v = b.dataset.layout === 'ring'; if (v === RINGONLY) return; RINGONLY = v; LS.set('homeRingLayout', b.dataset.layout); buzz();
        applyLayout(); renderCorners(); hotBtns(); controls(); toast(v ? 'Ring only' : 'Ring, corners and panel');
      });
      el.querySelectorAll('[data-levels]').forEach(b => b.onclick = () => {
        const v = +b.dataset.levels; if (v === LEVELS) return; LEVELS = v; LS.set('homeRingLevels', String(v)); buzz();
        toast(v ? 'Rings at once: ' + v : 'All rings at once'); geom(); draw(); labels(); controls();
      });
      el.querySelectorAll('[data-scope]').forEach(b => b.onclick = () => {
        const to = b.dataset.scope, rank = { all: 0, user: 1, here: 2 }; if (to === sc) return;
        // going wider drops the narrower setup, so it takes a second tap within 4 s
        if (rank[to] < rank[sc] && (!b.dataset.armed || Date.now() - +b.dataset.armed > 4000)) {
          b.dataset.armed = Date.now(); buzz();
          const n = el.querySelector('#scopev'); if (n) n.textContent = `Tap “${SCOPE_NAME[to]}” again: ${sc === 'here' ? "this screen's" : 'your'} own setup is dropped and ${to === 'all' ? 'the shared one' : "your account's"} is used.`;
          return;
        }
        setScope(to);
      });
    } else {
      el.innerHTML = h + foot + `<div class="note">${esc(scopeNote())}</div>`;
    }
    wireName(el, t);
    el.querySelectorAll('[data-a="done"]').forEach(b => b.onclick = () => setEdit(false));
    el.querySelectorAll('[data-a="unhold"]').forEach(b => b.onclick = () => { editN = null; nodes.forEach(paint); controls(); });
    el.querySelectorAll('[data-a="hide"]').forEach(b => b.onclick = () => toggleHide(t));
    el.querySelectorAll('[data-a="gdel"]').forEach(b => b.onclick = () => deleteGroup(t));
    el.querySelectorAll('[data-go]').forEach(b => b.onclick = () => editPick(nodes[+b.dataset.go]));
    el.querySelectorAll('[data-hide]').forEach(b => b.onclick = () => toggleHide(nodes[+b.dataset.hide]));
    el.querySelectorAll('[data-show]').forEach(b => b.onclick = () => { const x = hid[+b.dataset.show]; showKey(x.k, x.name); });
    if (t.kind === 'cat' || t.sys) wirePos(el, t.cat || t.sys, t.name);
    if (colKey) wireColour(el, colKey, t.name);
    el.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { editKind = b.dataset.kind; controls(); reveal(); });
    el.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => {
      const v = b.dataset.theme; if (v === (PROF.theme || CFG.theme)) return;
      change(p => { p.theme = v; }, 'Look: ' + b.textContent);
    });
  }
  function chooserCard(el) {
    const cur = kindOf(editPos);
    const opt = (k, label, icon, hc) => `<button class="opt${k === cur ? ' on' : ''}" style="--hc:${hc}" data-k="${esc(k)}">${svgOf(icon)}<span>${esc(label)}</span></button>`;
    const rooms = nodes.filter(n => n.kind === 'area').filter((n, i, a) => a.findIndex(m => m.id === n.id) === i).sort((a, b) => a.name.localeCompare(b.name));
    el.style.setProperty('--sc', 'var(--light)');
    el.innerHTML = `<div class="h"><i></i>${esc(POS_NAME[editPos])} button<button class="x" data-done="1" aria-label="Close">✕</button></div>
      <div class="st">Now: ${esc(kindName(cur))}. Pick what it should do.</div>
      <div class="opts">${Object.keys(KINDS).filter(k => k !== 'none').map(k => opt(k, KINDS[k].name, k, cornerCol(k))).join('')}</div>
      ${rooms.length ? `<div class="lbl">Or go straight to a room</div><div class="opts">${rooms.map(n => opt('room:' + n.id, n.name, 'room', 'var(--light)')).join('')}</div>` : ''}
      <div class="row">${opt('none', 'Leave it empty', 'none', 'var(--dim)')}</div>
      <div class="note">${esc(scopeNote())} Holding a corner does its quick action again once you tap Done.</div>`;
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
      const next = CORNERS.slice(), pos = editPos; next[POS.indexOf(pos)] = b.dataset.k;
      editPos = null;
      change(p => { p.corners = next; }, `${POS_NAME[pos]}: ${kindName(b.dataset.k)}`);
      renderCorners(); controls(); hotBtns();
    });
    el.querySelector('[data-done]').onclick = () => { editPos = null; renderCorners(); controls(); hotBtns(); };
  }
  $('gear').onclick = () => setEdit(!EDIT);
  renderCorners();

  /* ---------- saving in Home Assistant ----------
     The layout lock and the corner choices live in Home Assistant's shared frontend data, so every screen and
     every user sees the same thing and follows a change at once. Writing needs an admin; anyone else (or an older
     Home Assistant without shared data) saves in their own browser instead. */
  const stores = [];
  function makeStore(key, apply) { const s = { key, apply, shared: null, unsub: null, started: false }; stores.push(s); return s; }
  const localOf = s => { try { return JSON.parse(localStorage.getItem('homeRing:' + s.key) || 'null'); } catch (e) { return null; } };
  // A failed read is not "nothing saved": Home Assistant may still be starting (after a restart, an open screen reconnects
  // before everything is up). Keep trying, a little slower each time, and refuse to save over what could not be read.
  // Only an Home Assistant that does not know the command at all means there is no shared data.
  const unknownCmd = e => !!e && (e.code === 'unknown_command' || /unknown command/i.test(e.message || ''));
  const retryIn = n => Math.min(60000, 3000 * Math.pow(2, n));
  const timers = [];
  function startStore(s) {
    if (s.started || !H) return; s.started = true;
    const go = n => {
      if (destroyed) return;
      const conn = H.connection;
      if (!conn || !conn.subscribeMessage) { s.shared = false; s.apply(localOf(s)); return; }
      conn.subscribeMessage(m => { s.shared = true; s.apply(m && m.value != null ? m.value : localOf(s)); }, { type: 'frontend/subscribe_system_data', key: s.key })
        .then(u => { if (destroyed) u(); else s.unsub = u; }, e => {
          if (unknownCmd(e)) { s.shared = false; s.apply(localOf(s)); return; }
          timers.push(setTimeout(() => go(n + 1), retryIn(n)));
        });
    };
    go(0);
  }
  async function saveShared(s, v) {        // 'all' = every screen, 'here' = this browser, null = not allowed, 'wait' = not read yet
    if (s.shared === null && H.connection) return 'wait';
    if (s.shared && H.callWS) {
      try { await H.callWS({ type: 'frontend/set_system_data', key: s.key, value: v }); try { localStorage.removeItem('homeRing:' + s.key); } catch (e) {} return 'all'; }
      catch (e) { if (!v && !localOf(s)) return null; }     // clearing a shared value needs an admin
    }
    try { if (v) localStorage.setItem('homeRing:' + s.key, JSON.stringify(v)); else localStorage.removeItem('homeRing:' + s.key); } catch (e) {}
    s.apply(v); return 'here';
  }
  const layoutStore = makeStore(CFG.layout_key, v => setLayout(v));
  // corners chosen before 1.5 were saved on their own; they still apply until a setup below chooses its own
  const cornersStore = makeStore(CFG.corners_key, v => { legacyCorners = cleanCorners(v); refreshCorners(); });
  function refreshCorners() {
    const c = PROF.corners || legacyCorners || cleanCorners(CFG.corners) || DEFAULT_CORNERS.slice();
    if (c.join() === CORNERS.join()) return;
    CORNERS = c; renderCorners(); if (hot && !CORNERS.includes(hot) && hot !== 'cams') hot = null; controls(); hotBtns();
  }
  function startSync() { startProfile(); if (CFG.layout_lock) startStore(layoutStore); if (CFG.hot_buttons && !MINI) startStore(cornersStore); }

  /* ---------- the Customise setup, in three layers ----------
     all  = Home Assistant's shared frontend data: every screen and everyone (writing needs an admin)
     user = Home Assistant's data for the signed-in user: all of their devices
     here = this browser only
     The narrowest layer that exists is the one in use, and the one Customise writes to. Picking a narrower one copies
     what is on screen into it; picking a wider one drops the narrower ones. */
  const cleanProfile = v => {
    if (!v || typeof v !== 'object') return null;
    const strs = a => Array.isArray(a) ? a.filter(x => typeof x === 'string' && x) : [];
    const map = (o, ok) => Object.fromEntries(Object.entries(o && typeof o === 'object' ? o : {}).filter(([, x]) => typeof x === 'string' && x && ok(x)));
    const groups = (Array.isArray(v.groups) ? v.groups : []).filter(g => g && typeof g.id === 'string' && g.id && typeof g.name === 'string' && g.name).map(g => ({ id: g.id, name: g.name }));
    const pos = Object.fromEntries(Object.entries(v.pos && typeof v.pos === 'object' ? v.pos : {}).filter(([, x]) => typeof x === 'number' && x >= 0 && x < 360));
    // anything this version does not know is kept as it is, so saving here never strips what a newer version added
    return Object.assign({}, v, { v: typeof v.v === 'number' ? v.v : PROFILE_V, hide: strs(v.hide), name: map(v.name, () => true), cat: map(v.cat, x => CAT_ORDER.includes(x)), nol: strs(v.nol),
      groups, grp: map(v.grp, x => groups.some(g => g.id === x)), corners: cleanCorners(v.corners), pos, col: map(v.col, okHex), theme: ['dark', 'light', 'ha'].includes(v.theme) ? v.theme : null });
  };
  // st: whether each Home Assistant layer has been read ('ok'), is not there on this Home Assistant ('none'), or not yet ('wait')
  const profStore = { vals: { all: null, user: null, here: null }, st: { all: 'wait', user: 'wait' }, user: null, unsubs: [], started: false, sig: '', ls: 'homeRing:here:' + CFG.profile_key };
  const profReady = () => profStore.st.all !== 'wait' && profStore.st.user !== 'wait';
  const profNewer = () => Object.values(profStore.vals).some(v => v && v.v > PROFILE_V);
  const scopeOf = () => profStore.vals.here ? 'here' : profStore.vals.user ? 'user' : 'all';
  function applyProfile() {
    const P = profStore, v = P.vals.here || P.vals.user || P.vals.all || emptyProfile(), sig = JSON.stringify(v);
    if (sig === P.sig) return;
    P.sig = sig; PROF = v; HIDE = new Set(v.hide); NOL = new Set(v.nol);
    host.setAttribute('data-theme', v.theme || CFG.theme);
    refreshCorners();
    structKey = ''; if (H && root) update(H);
  }
  function startProfile() {
    const P = profStore; if (P.started || !H) return; P.started = true;
    try { P.vals.here = cleanProfile(JSON.parse(localStorage.getItem(P.ls) || 'null')); } catch (e) {}
    applyProfile();
    const conn = H.connection; if (!conn || !conn.subscribeMessage) { P.st.all = P.st.user = 'none'; P.user = false; return; }
    const got = (layer, v) => { P.vals[layer] = cleanProfile(v); P.st[layer] = 'ok'; if (layer === 'user') P.user = true; applyProfile(); if (EDIT && !sel && !editPos && !editKind) controls(); };
    const none = layer => { P.st[layer] = 'none'; if (layer === 'user') P.user = false; };
    const again = (layer, n) => timers.push(setTimeout(() => sub(layer, n + 1), retryIn(n)));
    const sub = (layer, n) => {
      if (destroyed) return;
      conn.subscribeMessage(m => got(layer, m && m.value), { type: layer === 'all' ? 'frontend/subscribe_system_data' : 'frontend/subscribe_user_data', key: CFG.profile_key })
        .then(u => { if (destroyed) u(); else P.unsubs.push(u); }, e => {
          if (!unknownCmd(e)) { again(layer, n); return; }
          if (layer === 'all' || !H.callWS) { none(layer); return; }
          // an older Home Assistant without the user subscription: read it once instead
          H.callWS({ type: 'frontend/get_user_data', key: CFG.profile_key }).then(r => got('user', r && r.value), e2 => unknownCmd(e2) ? none('user') : again(layer, n));
        });
    };
    sub('all', 0); sub('user', 0);
  }
  async function writeLayer(layer, v) {     // shown at once; put back if Home Assistant says no
    const P = profStore, old = P.vals[layer];
    P.vals[layer] = v; applyProfile();
    if (layer === 'here') { try { if (v) localStorage.setItem(P.ls, JSON.stringify(v)); else localStorage.removeItem(P.ls); } catch (e) {} return true; }
    try { await H.callWS({ type: layer === 'all' ? 'frontend/set_system_data' : 'frontend/set_user_data', key: CFG.profile_key, value: v }); return true; }
    catch (e) { P.vals[layer] = old; applyProfile(); return false; }
  }
  // save to the layer in use. Someone who may not write the shared setup gets their own from then on ('user!', or 'here!')
  async function saveProfile(next) {
    const s = scopeOf(), admin = !(H.user && H.user.is_admin === false);
    if (profNewer()) return 'newer';
    if (s !== 'here' && !profReady()) return 'wait';
    if (s === 'here') { await writeLayer('here', next); return 'here'; }
    if (s === 'all' && admin && await writeLayer('all', next)) return 'all';
    if (await writeLayer('user', next)) return s === 'user' ? 'user' : 'user!';
    await writeLayer('here', next); return 'here!';
  }
  async function setScope(to) {
    const P = profStore, cur = scopeOf(), rank = { all: 0, user: 1, here: 2 }; if (to === cur) return;
    if (!profReady() || profNewer()) { toast(profNewer() ? 'This setup was saved by a newer Home Ring. Reload this screen to change it' : 'Still reading your setup from Home Assistant. Try again in a moment'); return; }
    const now = JSON.parse(JSON.stringify(Object.assign({}, PROF, { corners: CORNERS })));
    let ok = true;
    if (rank[to] > rank[cur]) ok = await writeLayer(to, now);
    else {
      if (to === 'user' && !P.vals.user) ok = await writeLayer('user', now);
      if (ok && P.vals.here) await writeLayer('here', null);
      if (ok && to === 'all' && P.vals.user) ok = await writeLayer('user', null);
    }
    buzz(); toast(ok ? 'This setup is now for: ' + SCOPE_NAME[scopeOf()].toLowerCase() : "Home Assistant wouldn't save that"); controls();
  }

  /* ---------- layout lock ---------- */
  const LOCK_SVG = '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  const OPEN_SVG = '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/></svg>';
  function setLayout(v) {
    v = v || null;
    if (JSON.stringify(v) === JSON.stringify(LAYOUT)) return;
    LAYOUT = v; structKey = ''; if (H && root) update(H);
  }
  function makeLayout() {                 // the layout as it is now, unlocked, for both views
    const keep = MODE, keepV = VIEW, keepF = FILTER, modes = {}; VIEW = 'mine'; FILTER = null;
    for (const m of ['rooms', 'systems']) {
      MODE = m; const R = build(H, true), order = {}, centres = {};
      (function walk(n) {
        if (n.kids.length) { order[pathKey(n)] = n.kids.map(k => [nodeKey(k), +Math.pow(k.w, .6).toFixed(4)]); n.kids.forEach(walk); }
        if (n.kind === 'area') centres[pathKey(n)] = +((n.x0 + n.x1) / 2).toFixed(5);
      })(R);
      modes[m] = { order, centres };
    }
    MODE = keep; VIEW = keepV; FILTER = keepF;
    const out = { v: 1, at: new Date().toISOString(), modes, scenes: sceneList(true) };
    structKey = ''; update(H);            // building the snapshots replaced the ring's own tree: put it back
    return out;
  }
  function lockUi() {
    const seg = $('lockseg'); seg.hidden = !CFG.layout_lock || MINI || VIEW === 'all' || !!FILTER; if (seg.hidden) return;
    const b = $('lock'), on = !!LAYOUT;
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    b.innerHTML = (on ? LOCK_SVG : OPEN_SVG) + (on ? 'Locked' : 'Lock layout');
    b.title = on ? 'Rooms keep their places. Tap to unlock.' : 'Keep every room where it is now; new rooms join the end of their floor';
    $('tidy').hidden = !on;
  }
  $('lock').onclick = async () => {
    if (!H || !root) return;
    const r = await saveShared(layoutStore, LAYOUT ? null : makeLayout()); buzz();
    if (r === 'wait') { toast('Still reading the saved layout from Home Assistant. Try again in a moment'); return; }
    if (r === null) toast('Only an admin can unlock the shared layout');
    else toast(LAYOUT ? (r === 'all' ? 'Layout locked on every screen' : 'Layout locked in this browser') : 'Layout unlocked');
    lockUi();
  };
  $('tidy').onclick = async () => {
    if (!H || !root) return;
    const r = await saveShared(layoutStore, makeLayout()); buzz();
    if (r === 'wait') { toast('Still reading the saved layout from Home Assistant. Try again in a moment'); return; }
    toast(r === 'all' ? 'Rooms tidied and locked on every screen' : 'Rooms tidied and locked in this browser'); lockUi();
  };
  let destroyed = false;

  /* ---------- By room / By system ---------- */

  function setMode(m) { if (m === MODE) return; MODE = m; LS.set('homeRingMode', m); sel = null; focus = null; structKey = ''; if (H) update(H); }
  $('mode').querySelectorAll('button').forEach(b => b.onclick = () => setMode(b.dataset.m));
  // My view / Everything: only offered once the setup hides something or has a group, since otherwise they are the same
  function setView(v) { if (v === VIEW) return; VIEW = v; LS.set('homeRingView', v); sel = null; editN = null; structKey = ''; if (H) update(H); toast(v === 'all' ? 'Everything, in its real room' : 'My view'); }
  function viewUi() {
    const seg = $('view'); seg.hidden = MINI || !(VIEW === 'all' || PROF.hide.length || PROF.groups.length);
    seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === VIEW));
  }
  $('view').querySelectorAll('button').forEach(b => b.onclick = () => setView(b.dataset.v));
  // the kinds in the bar: tap one to show only it, tap more to add them, All for the usual picture
  function setFilter(next) {
    FILTER = next && next.length ? next : null; LS.set('homeRingFilter', JSON.stringify(FILTER));
    sel = null; editN = null; structKey = ''; if (H) update(H);
  }
  // on a narrow card only the main kinds (and any you picked) are shown, with "+ n more" for the rest
  const MAIN_KINDS = ['lights', 'heating', 'media', 'covers', 'plugs', 'sensors', 'fans', 'cameras'], MAIN_N = 5;
  let moreOpen = false;
  function filterUi() {
    const el = $('filt'); if (MINI || !H) return;
    const L = leaves(house()), all = CAT_ORDER.filter(c => L.some(e => e.cat === c));
    const narrow = host.getBoundingClientRect().width <= 760;
    const main = MAIN_KINDS.filter(c => all.includes(c)).slice(0, MAIN_N);
    const rest = all.filter(c => !main.includes(c) && !(FILTER && FILTER.includes(c)));
    const fold = narrow && rest.length > 1 && !moreOpen;
    const ks = fold ? all.filter(c => !rest.includes(c)) : all;
    const sig = JSON.stringify([ks, FILTER, ks.map(kindCol), narrow && rest.length > 1, moreOpen]);
    if (el.dataset.sig !== sig) {
      el.dataset.sig = sig;
      el.innerHTML = `<button data-k="" class="${FILTER ? '' : 'on'}" aria-pressed="${!FILTER}" title="${QUIET.size ? 'Everything except ' + esc([...QUIET].filter(c => CATS[c]).map(c => CATS[c].name).join(' and ')) : 'Everything'}">All</button>` +
        ks.map(c => { const on = !!FILTER && FILTER.includes(c);
          return `<button data-k="${c}" class="${on ? 'on' : ''}${QUIET.has(c) ? ' quiet' : ''}" aria-pressed="${on}" style="--kc:${kindCol(c)}"><i></i>${esc(CATS[c].name)}<b></b></button>`; }).join('') +
        (narrow && rest.length > 1 ? `<button data-more="1" class="more" aria-expanded="${moreOpen}">${moreOpen ? 'Fewer' : '+ ' + rest.length + ' more'}</button>` : '');
      el.querySelectorAll('button').forEach(b => b.onclick = () => {
        if (b.dataset.more) { moreOpen = !moreOpen; filterUi(); return; }
        const c = b.dataset.k; if (!c) { setFilter(null); return; }
        setFilter(!FILTER ? [c] : FILTER.includes(c) ? FILTER.filter(x => x !== c) : FILTER.concat(c));
      });
    }
    // how many of each kind are on, live
    el.querySelectorAll('button[data-k]').forEach(b => { const c = b.dataset.k; if (!c || NO_COUNT.includes(c)) return; const n = L.filter(e => e.cat === c && isActive(e.eid, states()[e.eid])).length; b.querySelector('b').textContent = n ? n : ''; });
  }

  /* ---------- voice (optional): an input_text set to "area:<id or name>|<unix seconds>", "floor:…|…" or "home|…" ---------- */
  let voiceSeen = null;
  function voiceCheck(h) {
    if (MINI || !CFG.voice_entity) return;
    const st = h.states[CFG.voice_entity]; if (!st) return;
    const v = String(st.state || ''); if (v === voiceSeen) return;
    const first = voiceSeen === null; voiceSeen = v;
    const [target, ts] = v.split('|'), age = ts ? Date.now() - (+ts || 0) * 1000 : Date.now() - Date.parse(st.last_changed);
    let done = null; try { done = sessionStorage.getItem('homeRingVoice'); } catch (e) {}
    if (!target || done === v || age > (first ? 90e3 : 300e3) || age < -120e3) return;
    try { sessionStorage.setItem('homeRingVoice', v); } catch (e) {}
    goPlace(target);
  }
  function goPlace(target) {
    const i = target.indexOf(':'), kind = (i < 0 ? target : target.slice(0, i)).trim().toLowerCase(), id = i < 0 ? '' : target.slice(i + 1).trim().toLowerCase();
    if (MODE !== 'rooms') { MODE = 'rooms'; LS.set('homeRingMode', 'rooms'); sel = null; focus = null; structKey = ''; update(H); }
    const find = () => kind === 'home' ? root : nodes.find(m => m.kind === kind && (String(m.id).toLowerCase() === id || String(m.name).toLowerCase() === id));
    let n = find();
    if (!n && FILTER) { FILTER = null; LS.set('homeRingFilter', 'null'); structKey = ''; update(H); n = find(); }
    if (!n) return;
    sel = null; setFocus(n);
  }

  /* ---------- live: rebuild when rooms change, repaint when states change ---------- */
  let structKey = '', ringSig = '', selSt = null, regRefs = [], regKey = '';
  // rooms, floors and what is in them; worked out again only when Home Assistant hands over a new registry
  function regKeyOf(h) {
    const refs = [h.areas, h.floors, h.entities, h.devices];
    if (refs.every((r, i) => r === regRefs[i])) return regKey;
    regRefs = refs;
    regKey = JSON.stringify([
      Object.values(h.areas || {}).map(a => a.area_id + ':' + a.name + ':' + (a.floor_id || '')),
      Object.values(h.floors || {}).map(x => x.floor_id + ':' + x.name + ':' + x.level),
      Object.values(h.entities || {}).map(e => e.entity_id + ':' + (e.area_id || '') + ':' + (e.hidden ? 1 : 0) + (e.entity_category || '') + ':' + (e.name || '')),
      Object.values(h.devices || {}).map(d => d.id + ':' + (d.area_id || ''))]);
    return regKey;
  }
  const sigOf = h => root ? leaves(house()).map(e => { const s = h.states[e.eid]; return s ? s.last_updated : '-'; }).join('|') : '';
  function update(h) {
    if (!h || !h.states) return;
    H = h; $('wait').style.display = 'none';
    startSync();
    const key = regKeyOf(h) + '|' + Object.keys(h.states).length + '|' + MODE;   // a new thing's state can arrive after its registry entry
    if (key !== structKey || !root) {
      structKey = key; const was = focus, wsel = sel;
      HOUSE = filtering() ? build(h, false, true) : null; houseNodes = nodes;
      root = build(h); setup();
      if (!HOUSE) houseNodes = nodes;
      drawnBy = new Map(nodes.map(n => [pathKey(n), n])); houseBy = new Map(houseNodes.map(n => [pathKey(n), n]));
      filterUi();
      editN = findSame(editN);
      focus = findSame(was) || root; sel = wsel ? nodes.find(n => n.eid === wsel.eid) || null : null; geom();
      Object.assign(view, { x0: focus.x0, x1: focus.x1, d: focus.depth, r: focus.rot || 0 }); draw(); labels(); side(); controls();
      lastStates = h.states; ringSig = sigOf(h); selSt = sel && h.states[sel.eid];
      renderCorners(); motionCheck(h, true); safetyCheck(h, true); dingCheck(h); hotBtns(); voiceCheck(h); return;
    }
    if (h.states === lastStates) return;
    lastStates = h.states;
    voiceCheck(h); dingCheck(h); hotBtns();
    const sig = sigOf(h); if (sig === ringSig) return;
    ringSig = sig; filterUi(); motionCheck(h, false); safetyCheck(h, false); nodes.forEach(paint); if (!anim) labels(); side();
    if (hot && hot !== 'cams' && !sel) controls();          // an open Lights / Alarm / Heating card follows the house
    if (sel && h.states[sel.eid] !== selSt) { selSt = h.states[sel.eid]; const ae = sr.activeElement; if (!ae || (ae.type !== 'range' && !(EDIT && /^(INPUT|SELECT)$/.test(ae.tagName)))) controls(); }
  }
  function resize() { if (root) { geom(); draw(); labels(); filterUi(); } }
  const clock = setInterval(() => { if (root) hotBtns(); }, 15000);     // "movement" fades after two minutes
  function destroy() { destroyed = true; for (const st of stores) if (st.unsub) { try { st.unsub(); } catch (e) {} st.unsub = null; } profStore.unsubs.splice(0).forEach(u => { try { u(); } catch (e) {} }); timers.splice(0).forEach(clearTimeout); clearInterval(clock); clearInterval(camTimer); stopCams(); clearTimeout(hotAuto); cancelAnimationFrame(anim); }
  return { update, resize, destroy };
}

/* ======================================================================================================
   The Lovelace card
   ====================================================================================================== */
class HomeRingCard extends HTMLElement {
  setConfig(config) {
    if (!config || typeof config !== 'object') throw new Error('home-ring-card: no configuration');
    if (config.cameras != null && !Array.isArray(config.cameras)) throw new Error('home-ring-card: cameras must be a list');
    if (config.energy != null && !Array.isArray(config.energy)) throw new Error('home-ring-card: energy must be a list');
    this._raw = config;
    this._cfg = normaliseConfig(config);
    if (this._ring) { this._teardown(); this._mount(); }
  }
  set hass(h) {
    this._hass = h;
    if (!this._ring && this.isConnected && this._cfg) this._mount();
    if (this._ring) this._ring.update(h);
  }
  get hass() { return this._hass; }
  connectedCallback() { if (!this._ring && this._cfg) this._mount(); }
  disconnectedCallback() { this._teardown(); }
  _mount() {
    const sr = this.shadowRoot || this.attachShadow({ mode: 'open' });
    sr.innerHTML = `<style>${HR_CSS}</style>${HR_HTML}`;
    this._ring = createRing(sr, this, this._cfg);
    this._ro = new ResizeObserver(() => this._ring && this._ring.resize());
    this._ro.observe(sr.getElementById('ringbox'));
    if (this._hass) this._ring.update(this._hass);
  }
  _teardown() {
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    if (this._ring) { this._ring.destroy(); this._ring = null; }
  }
  getCardSize() { return this._cfg && this._cfg.mini ? 4 : 12; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  static getStubConfig() { return {}; }
}
if (!customElements.get('home-ring-card')) customElements.define('home-ring-card', HomeRingCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'home-ring-card'))
  window.customCards.push({ type: 'home-ring-card', name: 'Home Ring', description: 'Your home as a ring you drill into: floors, rooms, kinds of thing and the things themselves.', preview: false, documentationURL: 'https://github.com/magooffm/home-ring-card' });
console.info(`%c HOME-RING-CARD %c ${HOME_RING_VERSION} `, 'color:#0a0f16;background:#ffb638;font-weight:700', 'color:#ffb638;background:#0a0f16');
