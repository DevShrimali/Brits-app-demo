import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Bell, Share2 } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface HistEntry { route: string; params: Record<string, string> }
interface Event {
  id: string; title: string; cat: string; artist?: string; venue: string; city: string;
  date: string; time: string; price: number; rating: number; feat?: number; trend?: number;
  c1: string; c2: string; listeners?: string; desc: string;
  director?: string; runtime?: string; cert?: string; imdb?: string;
  teamA?: string; teamB?: string; league?: string;
}
interface Card { id: string; type: string; last4: string; default: boolean }

// ─── Constants ─────────────────────────────────────────────────────────────
const EVENTS: Event[] = [
  {id:'e1',title:'After Hours Tour',cat:'music',artist:'The Midnight Echo',venue:'The O2 Arena',city:'London',date:'Jun 15',time:'20:00',price:65,rating:4.9,feat:1,trend:1,c1:'#F13C38',c2:'#7C2D8A',listeners:'48.2M',desc:'An immersive arena production blending synthwave, lasers and a live string section. One unforgettable night.'},
  {id:'e2',title:'Neon Nights Live',cat:'music',artist:'Aurora Vale',venue:'AO Arena',city:'Manchester',date:'Jul 02',time:'19:30',price:78,rating:4.8,feat:1,trend:0,c1:'#FF4FA3',c2:'#FF8A3D',listeners:'62.7M',desc:'Stadium pop at its most electric — full production, surprise guests and a city-shaking finale.'},
  {id:'c1',title:'Interstellar',cat:'cinema',director:'C. Nolan',venue:'Cineworld Leicester Sq',city:'London',date:'Today',time:'17:30',price:14,rating:4.7,feat:1,trend:0,c1:'#2E5BFF',c2:'#1A1B4B',runtime:'2h 49m',cert:'12A',imdb:'9.0',desc:'A team of explorers travel through a wormhole in search of a new home for humanity. Shown in glorious IMAX 70mm.'},
  {id:'c2',title:'Dune: Part Two',cat:'cinema',director:'D. Villeneuve',venue:'Everyman Mailbox',city:'Birmingham',date:'Today',time:'20:15',price:16,rating:4.8,feat:0,trend:1,c1:'#E8A33D',c2:'#5C3A1E',runtime:'2h 46m',cert:'12A',imdb:'8.6',desc:'Paul Atreides unites with the Fremen to wage war against the House Harkonnen. An epic on the biggest screen in Britain.'},
  {id:'s1',title:'Arsenal vs Chelsea',cat:'sports',league:'Premier League',teamA:'Arsenal',teamB:'Chelsea',venue:'Emirates Stadium',city:'London',date:'Jun 20',time:'15:00',price:45,rating:4.6,feat:1,trend:1,c1:'#1FB573',c2:'#0B5C4E',desc:'A capital derby with everything on the line. Feel the roar of 60,000 fans under the lights.'},
  {id:'s2',title:'England vs Australia',cat:'sports',league:'The Ashes',teamA:'England',teamB:'Australia',venue:'Headingley Stadium',city:'Leeds',date:'Aug 10',time:'11:00',price:55,rating:4.5,feat:0,trend:0,c1:'#1B2A6B',c2:'#B0202A',desc:'The oldest rivalry in cricket returns to the home of the game for a day-five thriller.'},
  {id:'cm1',title:'Live & Unfiltered',cat:'comedy',artist:'Marcus Reed',venue:'Hammersmith Apollo',city:'London',date:'Jun 28',time:'20:00',price:38,rating:4.7,feat:0,trend:1,c1:'#FF7A2C',c2:'#FFC93D',listeners:'2.1M',desc:'Razor-sharp stand-up with no filter and no script. Expect tears, mostly from laughing.'},
  {id:'th1',title:'Hamilton',cat:'theatre',venue:'Victoria Palace Theatre',city:'London',date:'Ongoing',time:'19:30',price:49,rating:4.9,feat:1,trend:0,c1:'#D4A537',c2:'#5C1A2E',desc:'The story of America then, told by America now. The award-winning musical phenomenon, live in the West End.'},
  {id:'cl1',title:'Warehouse Project',cat:'club',artist:'Various Artists',venue:'Motion Bristol',city:'Bristol',date:'Jun 21',time:'22:00',price:25,rating:4.4,feat:0,trend:1,c1:'#8A4FFF',c2:'#25D0E0',listeners:'—',desc:'Until-6am house and techno across three rooms with a world-class soundsystem.'},
  {id:'f1',title:'Wireless Festival',cat:'festival',venue:'Finsbury Park',city:'London',date:'Jul 05',time:'13:00',price:89,rating:4.6,feat:0,trend:0,c1:'#E0319A',c2:'#FF8A3D',desc:'Three days, four stages and the biggest names in hip-hop and R&B across one summer weekend.'},
  {id:'cm2',title:'Mock the Night',cat:'comedy',artist:'The Panel',venue:'Bristol Hippodrome',city:'Bristol',date:'Jul 12',time:'20:30',price:30,rating:4.3,feat:0,trend:0,c1:'#1FA8A0',c2:'#9BD63D',listeners:'1.4M',desc:'Britain\'s sharpest comedians go head to head in a live, unscripted panel show.'},
  {id:'m3',title:'Midnights Live',cat:'music',artist:'Stella Hart',venue:'Co-op Live',city:'Manchester',date:'Aug 03',time:'19:00',price:95,rating:4.9,feat:1,trend:1,c1:'#9B3DE0',c2:'#FF6FB5',listeners:'88.5M',desc:'The era-defining tour finally lands in London for three sold-out nights of pure spectacle.'}
];
const CATLABEL: Record<string,string> = {music:'Concert',cinema:'Movie',sports:'Sports',comedy:'Comedy',theatre:'Theatre',club:'Club',festival:'Festival'};
const CITIES = ['London','Manchester','Birmingham','Leeds','Bristol','Glasgow','Liverpool','Edinburgh','Cardiff','Newcastle'];
const CATS = ['All','Concerts','Movies','Sports','Comedy','Theatre','Club','Festivals'];
const CATMAP: Record<string,string> = {Concerts:'music',Movies:'cinema',Sports:'sports',Comedy:'comedy',Theatre:'theatre',Club:'club',Festivals:'festival'};
const INTERESTS = ['Music','Comedy','Theatre','Cinema','Sports','Clubbing','Festivals','Live Shows'];
const SHOWTIMES = ['11:30','14:45','17:30','20:15','22:30'];
const CAST = ['A. Rivera','J. Coleman','M. Okafor','S. Bennett','L. Tanaka'];
const GUESTLIMITS = ['You won\'t be able to save events to your wishlist','Tickets aren\'t backed up to an account','No personalised recommendations or alerts'];
const REVIEWS = [
  {name:'Priya S.',rating:5,when:'2 days ago',text:'Unreal atmosphere from start to finish. The production blew me away — worth every penny.'},
  {name:'Daniel K.',rating:4,when:'1 week ago',text:'Brilliant night out. Entry with the QR was instant, no queue at all. Sound could\'ve been louder in the back.'},
  {name:'Amara O.',rating:5,when:'3 weeks ago',text:'Best gig I\'ve been to this year. Booking on Brit Vibe was effortless and seats were exactly as shown.'}
];
const ONB_SLIDES = [
  {t:'Discover what moves you',d:'Concerts, films, sports and club nights — the best vibes in your city, one tap away.'},
  {t:'Book with total confidence',d:'Bank-grade security and instant, verified tickets. Your spot is always safe.'},
  {t:'Live the experience',d:'Skip the queue with QR entry and carry every ticket in your pocket.'}
];
const ONB_PATHS = ['M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M20 20l-4.76-4.76','M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z M9 12l2 2 4-4','M5 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H7a2 2 0 0 1-2-2 2 2 0 0 0 0-4z M9 6v12'];
const ONB_GR = ['linear-gradient(150deg,#F13C38,#7C2D8A)','linear-gradient(150deg,#2E5BFF,#1FB573)','linear-gradient(150deg,#FF7A2C,#E0319A)'];
const HC_CATS = [{label:'Music',emoji:'🎸',ev:'music'},{label:'Cinema',emoji:'🍿',ev:'cinema'},{label:'Sports',emoji:'⚽',ev:'sports'},{label:'Comedy',emoji:'😂',ev:'comedy'},{label:'Clubbing',emoji:'🪩',ev:'club'},{label:'Theatre',emoji:'🎭',ev:'theatre'},{label:'Student',emoji:'🎓',ev:'club'},{label:'Festivals',emoji:'🎡',ev:'festival'},{label:'Workshops',emoji:'🎨',ev:'theatre'},{label:'Jazz',emoji:'🎷',ev:'music'},{label:'Rock',emoji:'🤘',ev:'music'}];
const TIERS = [
  {id:'vip',name:'VIP Experience',desc:'Front section, lounge & fast-track entry',mult:2.2},
  {id:'premium',name:'Premium',desc:'Priority seating with the best views',mult:1.5},
  {id:'regular',name:'Regular',desc:'Standard seated ticket',mult:1},
  {id:'ga',name:'General Admission',desc:'Standing, first come first served',mult:0.7}
];
const PAYMENT_METHODS = [
  {id:'apple',name:'Apple Pay',sub:'Fast & secure checkout',bg:'#000',fg:'#fff',gl:'M16 4c-1 0-2 .7-2.6 1.5-.5.7-1 1.8-.8 2.8 1 .1 2-.6 2.6-1.4.5-.7.9-1.8.8-2.9z M18 12c0-2 1.6-3 1.7-3-1-1.4-2.4-1.6-3-1.6-1.3-.1-2.5.7-3.1.7s-1.6-.7-2.7-.7c-1.4 0-2.6.8-3.3 2-1.4 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.5 2 1-.1 1.4-.6 2.6-.6s1.5.6 2.6.6 1.7-1 2.4-2c.5-.7.9-1.5 1.1-2.3-1.6-.6-2.3-2-2.3-3z'},
  {id:'bank',name:'Bank Transfer',sub:'Pay directly from your bank',bg:'var(--color-bg-brand-tint)',fg:'var(--color-brand-primary)',gl:'M4 10h16 M4 10l8-5 8 5 M6 10v7 M10 10v7 M14 10v7 M18 10v7 M4 20h16'},
  {id:'google',name:'Google Pay',sub:'Pay with your Google account',bg:'#fff',fg:'#4285F4',gl:'M21 12c0-.6-.1-1.2-.2-1.8H12v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.2 2.7-7.1z M12 21c2.6 0 4.8-.9 6.3-2.3l-3.1-2.4c-.9.6-2 .9-3.2.9-2.5 0-4.6-1.7-5.3-3.9H3.4v2.5C5 19.4 8.2 21 12 21z M6.7 13.3c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.2H3.4C2.8 8.6 2.5 10 2.5 11.5s.3 2.9.9 4.3l3.3-2.5z M12 5.8c1.4 0 2.7.5 3.6 1.4l2.7-2.7C16.8 2.9 14.6 2 12 2 8.2 2 5 4.1 3.4 7.2l3.3 2.5C7.4 7.5 9.5 5.8 12 5.8z'},
  {id:'card',name:'Credit / Debit Card',sub:'Visa, Mastercard, Amex',bg:'var(--color-bg-brand-tint)',fg:'var(--color-brand-primary)',gl:'M3 7h18v10H3z M3 11h18'}
];
const SEAT_RESERVED: Record<string,boolean> = {A3:true,A4:true,A8:true,B7:true,B8:true,C8:true,D2:true,D3:true,E5:true,E6:true,F9:true,F10:true,G1:true,G6:true};
const CONFETTI_COLORS = ['#F13C38','#FFC93D','#22C55E','#3B82F6','#FF6FB5','#9B3DE0'];
const confettiPieces = Array.from({length:64},() => ({
  left:Math.random()*100, color:CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)],
  delay:Math.random()*0.7, dur:2.6+Math.random()*1.8, w:6+Math.random()*7, rot:Math.random()*360
}));

// ─── Organizer data ─────────────────────────────────────────────────────────
const ORGANIZERS: Record<string,{name:string,type:string,city:string,desc:string,c1:string,c2:string}> = {
  'o2-arena':          {name:'The O2 Arena',         type:'Venue',              city:'London',      desc:'London\'s iconic entertainment destination. Europe\'s most visited music venue, hosting 200+ events a year.',c1:'#2E5BFF',c2:'#1A1B4B'},
  'ao-arena':          {name:'AO Arena',              type:'Venue',              city:'Manchester',  desc:'One of the UK\'s premier entertainment arenas, welcoming over 1 million visitors annually.',c1:'#FF4FA3',c2:'#FF8A3D'},
  'cineworld-lsq':     {name:'Cineworld',             type:'Cinema',             city:'London',      desc:'The UK\'s largest cinema chain delivering premium film experiences, including IMAX and 4DX.',c1:'#2E5BFF',c2:'#9B3DE0'},
  'everyman-mailbox':  {name:'Everyman Cinema',       type:'Cinema',             city:'Birmingham',  desc:'Boutique cinema group with luxurious screens, craft drinks and exceptional dining.',c1:'#D4A537',c2:'#5C1A2E'},
  'arsenal-fc':        {name:'Arsenal FC',            type:'Sports Club',        city:'London',      desc:'Premier League football club based at Emirates Stadium. One of England\'s most decorated clubs.',c1:'#1FB573',c2:'#0B5C4E'},
  'ecb':               {name:'England Cricket Board', type:'Sports Organisation', city:'Leeds',       desc:'Governing body of cricket in England and Wales, staging international fixtures at iconic grounds.',c1:'#1B2A6B',c2:'#B0202A'},
  'apollo-hmrsmth':    {name:'Hammersmith Apollo',    type:'Venue',              city:'London',      desc:'One of London\'s most beloved live music venues with a rich 90-year history and 5,000-capacity.',c1:'#FF7A2C',c2:'#FFC93D'},
  'victoria-palace':   {name:'Victoria Palace Theatre',type:'Theatre',           city:'London',      desc:'Award-winning West End venue, home to some of the most acclaimed theatrical productions.',c1:'#D4A537',c2:'#5C1A2E'},
  'motion-bristol':    {name:'Motion Bristol',        type:'Club / Promoter',    city:'Bristol',     desc:'Bristol\'s flagship underground music venue and club space — techno, house and beyond.',c1:'#8A4FFF',c2:'#25D0E0'},
  'festival-republic': {name:'Festival Republic',     type:'Promoter',           city:'London',      desc:'UK\'s leading independent festival promoter, behind Wireless, Latitude, Reading & Leeds.',c1:'#E0319A',c2:'#FF8A3D'},
  'bristol-hippodrome':{name:'Bristol Hippodrome',    type:'Theatre',            city:'Bristol',     desc:'Bristol\'s premier theatre presenting top touring productions and world-class entertainment.',c1:'#1FA8A0',c2:'#9BD63D'},
  'coop-live':         {name:'Co-op Live',            type:'Venue',              city:'Manchester',  desc:'Manchester\'s newest arena — the UK\'s largest indoor venue with state-of-the-art acoustics.',c1:'#9B3DE0',c2:'#FF6FB5'},
};
const ORGANIZER_MAP: Record<string,string> = {
  e1:'o2-arena', e2:'ao-arena', c1:'cineworld-lsq', c2:'everyman-mailbox',
  s1:'arsenal-fc', s2:'ecb', cm1:'apollo-hmrsmth', th1:'victoria-palace',
  cl1:'motion-bristol', f1:'festival-republic', cm2:'bristol-hippodrome', m3:'coop-live',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const money = (n: number) => '£' + Math.round(n);
const money2 = (n: number) => '£' + n.toFixed(2);

function qr(seed: string): boolean[][] {
  const N=21; const g=Array.from({length:N},()=>Array(N).fill(false)) as boolean[][];
  const fp=(r:number,c:number)=>{ for(let i=0;i<7;i++)for(let j=0;j<7;j++){ g[r+i][c+j]=(i===0||i===6||j===0||j===6)||(i>=2&&i<=4&&j>=2&&j<=4); } };
  fp(0,0); fp(0,14); fp(14,0);
  let s=2166136261; for(const ch of (seed||'x')) s=Math.imul(s^ch.charCodeAt(0),16777619)>>>0;
  const rnd=()=>{ s=(Math.imul(s,1103515245)+12345)>>>0; return (s>>>16)/65536; };
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){ if((r<8&&c<8)||(r<8&&c>12)||(r>12&&c<8)) continue; g[r][c]=rnd()>0.5; }
  return g;
}

function vmEvent(e: Event, saved: string[], go: (p:string,params?:Record<string,string>)=>void, toggleSave: (id:string)=>void) {
  const isSaved = saved.includes(e.id);
  return {
    ...e,
    fill: {position:'absolute' as const,top:0,left:0,right:0,bottom:0,background:`linear-gradient(150deg, ${e.c1}, ${e.c2})`},
    saved: isSaved, heartFill: isSaved?'#F13C38':'none',
    priceLabel: money(e.price), catLabel: CATLABEL[e.cat], rate: e.rating.toFixed(1),
    on: ()=>go('/event/'+e.id,{eventId:e.id}),
    toggle: (ev?: React.MouseEvent)=>{ ev?.stopPropagation(); toggleSave(e.id); }
  };
}

const chip = (active: boolean) => ({
  padding:'9px 16px', borderRadius:'999px', fontSize:'13.5px', fontWeight:600, whiteSpace:'nowrap' as const,
  cursor:'pointer', flexShrink:0, border:`1px solid ${active?'var(--color-brand-primary)':'var(--color-border-default)'}`,
  background:active?'var(--color-brand-primary)':'var(--color-bg-surface)',
  color:active?'#fff':'var(--color-text-secondary)'
});

const btnIconStyle: React.CSSProperties = {width:40,height:40,borderRadius:'50%',background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',color:'var(--color-text-primary)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0};
const fieldStyle: React.CSSProperties = {background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:13,padding:15,fontSize:15,color:'var(--color-text-primary)',width:'100%',boxSizing:'border-box' as const,fontFamily:'inherit'};
const lblStyle: React.CSSProperties = {display:'flex',flexDirection:'column',gap:8,fontSize:13,fontWeight:600,color:'var(--color-text-secondary)'};
const swBg = (val:boolean): React.CSSProperties => ({width:46,height:26,borderRadius:99,position:'relative',background:val?'var(--color-brand-primary)':'var(--color-border-strong)',transition:'background .2s',flexShrink:0});
const swDot = (val:boolean): React.CSSProperties => ({width:20,height:20,borderRadius:'50%',background:'#fff',position:'absolute',top:3,left:val?23:3,transition:'left .2s',boxShadow:'0 2px 4px rgba(0,0,0,0.2)'});

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const ChevLeft = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevRight = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>;
const ChevDown = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
const ChevUp = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
const Heart = ({fill,size=20}:{fill:string,size?:number}) => <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6C19 16.5 12 21 12 21z"/></svg>;
const Star = ({fill='#FFC93D',size=14}:{fill?:string,size?:number}) => <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke="none"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/></svg>;
const Check = ({size=12,strokeWidth=3}:{size?:number,strokeWidth?:number}) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#fff" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>;
const SearchIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-text-placeholder)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M20 20l-4.76-4.76"/></svg>;
const LocPin = ({color='var(--color-brand-primary)'}:{color?:string}) => <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-5-7-11a7 7 0 1 1 14 0c0 6-7 11-7 11z M12 10a1 1 0 1 0 0 .01z"/></svg>;
const FilterIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16 M7 12h10 M10 18h4"/></svg>;
const ShareIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const CloseIcon = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18 M6 6l12 12"/></svg>;
const TicketIcon = () => <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4z M14 6v12"/></svg>;
const HomeIcon = () => <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8 M5 10v10h5v-6h4v6h5V10"/></svg>;
const ExploreIcon = () => <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M15.5 8.5l-2 5-5 2 2-5z"/></svg>;
const ProfileIcon = () => <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>;
const BackArrow = () => <svg viewBox="0 0 15 15" width="22" height="22" fill="currentColor"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.20711 7.5H13.5C13.7761 7.5 14 7.72386 14 8C14 8.27614 13.7761 8.5 13.5 8.5H3.20711L6.85355 12.1464C7.04882 12.3417 7.04882 12.6583 6.85355 12.8536C6.65829 13.0488 6.34171 13.0488 6.14645 12.8536L1.64645 8.35355C1.45118 8.15829 1.45118 7.84171 1.64645 7.64645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fillRule="evenodd" clipRule="evenodd"/></svg>;

// ─── Fill div (gradient background) ─────────────────────────────────────────
const Fill = ({style}:{style:React.CSSProperties}) => <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,...style}}/>;

// ─── Gradient Event Card (shared) ────────────────────────────────────────────
function EventCard({ev,onClick,onToggle,height=148,showDate=true}:{ev:ReturnType<typeof vmEvent>,onClick:()=>void,onToggle:(e:React.MouseEvent)=>void,height?:number,showDate?:boolean}) {
  return (
    <div onClick={onClick} style={{cursor:'pointer'}}>
      <div style={{position:'relative',height,borderRadius:18,overflow:'hidden'}}>
        <Fill style={ev.fill}/>
        <div style={{position:'absolute',top:10,right:10,display:'flex',flexDirection:'column',gap:10}}>
          <button onClick={onToggle} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',color:'#fff',filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.6))'}}>
            <Heart fill={ev.heartFill} size={17}/>
          </button>
          <button onClick={e=>{e.stopPropagation();navigator.clipboard?.writeText(ev.title).catch(()=>{});}} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',color:'#fff',filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.6))'}}>
            <Share2 size={15}/>
          </button>
        </div>
        {showDate && <div style={{position:'absolute',left:8,bottom:8,background:'rgba(0,0,0,.45)',backdropFilter:'blur(6px)',color:'#fff',padding:'3px 9px',borderRadius:999,fontSize:10.5,fontWeight:700}}>{ev.date}</div>}
      </div>
      <div style={{padding:'9px 2px 0'}}>
        <div style={{fontSize:14.5,fontWeight:700,lineHeight:1.25,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--color-text-primary)'}}>{ev.title}</div>
        <div style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.venue}</div>
        <div style={{fontSize:13.5,fontWeight:700,color:'var(--color-text-brand)',marginTop:6}}>from {ev.priceLabel}</div>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const splashTimer = useRef<ReturnType<typeof setTimeout>>();
  const tickTimer = useRef<ReturnType<typeof setInterval>>();
  const navTimer = useRef<ReturnType<typeof setTimeout>>();
  const navTimer2 = useRef<ReturnType<typeof setTimeout>>();

  // ── State ──────────────────────────────────────────────────────────────────
  const [route, setRoute] = useState('/');
  const [params, setParams] = useState<Record<string,string>>({});
  const [hist, setHist] = useState<HistEntry[]>([]);
  const [onb, setOnb] = useState(0);
  const [loginStep, setLoginStep] = useState<'phone'|'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [loginLoading, setLoginLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [verify, setVerify] = useState<'idle'|'checking'|'success'>('idle');
  const [cat, setCat] = useState('All');
  const [homeCat, setHomeCat] = useState<string|null>(null);
  const [loc, setLoc] = useState('London');
  const [saved, setSaved] = useState(['e1','c1']);
  const [guest, setGuest] = useState(false);
  const [following, setFollowing] = useState<Record<string,boolean>>({});
  const [tier, setTier] = useState<string|null>(null);
  const [qty, setQty] = useState(2);
  const [seats, setSeats] = useState<string[]>([]);
  const [coupon, setCoupon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [payMethod, setPayMethod] = useState('apple');
  const [cardLoading, setCardLoading] = useState(false);
  const [apVerify, setApVerify] = useState(false);
  const [apSuccess, setApSuccess] = useState(false);
  const [tStatus, setTStatus] = useState('valid');
  const [histTab, setHistTab] = useState<'upcoming'|'past'>('upcoming');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [locSearch, setLocSearch] = useState('');
  const [evSearch, setEvSearch] = useState('');
  const [evChip, setEvChip] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [exploreFilterOpen, setExploreFilterOpen] = useState(false);
  const [drawer, setDrawer] = useState<string|null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [exploreCity, setExploreCity] = useState('All');
  const [exploreSort, setExploreSort] = useState('popular');
  const [exploreLocSearch, setExploreLocSearch] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeProfileOption, setActiveProfileOption] = useState<string|null>(null);
  const [activeFavSection, setActiveFavSection] = useState<string|null>(null);
  const [favSearch, setFavSearch] = useState('');
  const [profileAccordion, setProfileAccordion] = useState<Record<string,boolean>>({});
  const [favMovies, setFavMovies] = useState(['Interstellar','Dune: Part Two']);
  const [favActors, setFavActors] = useState(['Timothée Chalamet','Cillian Murphy']);
  const [favActresses, setFavActresses] = useState(['Zendaya','Florence Pugh']);
  const [favSingers, setFavSingers] = useState(['Dua Lipa','Fred again..']);
  const [favBands, setFavBands] = useState(['Coldplay','The 1975']);
  const [favVenues, setFavVenues] = useState(['The O2 Arena','AO Arena']);
  const [cardName, setCardName] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [activeSettingModal, setActiveSettingModal] = useState<string|null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifReminders, setNotifReminders] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(true);
  const [savedCards, setSavedCards] = useState<Card[]>([{id:'c1',type:'Apple Pay',last4:'4242',default:true}]);
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Adele Ticket Reminder 🎟️',
      body: 'Only 2 hours left to buy seats for Adele live at Wembley Stadium. Securing your booking now is highly recommended!',
      time: '2m ago',
      read: false,
      type: 'reminder'
    },
    {
      id: 'n2',
      title: 'Fred again.. Booking Confirmed! 🎉',
      body: 'Your ticket booking is verified for Fred again.. at Alexandra Palace on Oct 12. Check your Tickets tab to view the QR entry pass.',
      time: '1h ago',
      read: false,
      type: 'booking'
    },
    {
      id: 'n3',
      title: 'Gorillaz Tour Announcement 🎸',
      body: 'Gorillaz just announced their 2026 UK Tour! Tickets go on sale this Friday at 10:00 AM. Set a reminder in your preferences.',
      time: '4h ago',
      read: true,
      type: 'announcement'
    },
    {
      id: 'n4',
      title: '20% Off Drinks Voucher 🍹',
      body: 'Enjoy a 20% discount on all drinks at O2 Academy Brixton for your booking. Show your digital voucher to the bar staff.',
      time: 'Yesterday',
      read: true,
      type: 'offer'
    }
  ]);
  const [prefTheme, setPrefTheme] = useState('light');
  const [prefGenres, setPrefGenres] = useState(['Music','Cinema']);
  const [prefCity, setPrefCity] = useState('London');
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardNum, setNewCardNum] = useState('');
  const [newCardExp, setNewCardExp] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');
  const [showtime, setShowtime] = useState('17:30');
  const [stand, setStand] = useState('Lower Tier');

  // ── Navigation ─────────────────────────────────────────────────────────────
  const clearTimer = useCallback(() => { clearInterval(tickTimer.current); }, []);

  const go = useCallback((path: string, p?: Record<string,string>, replace?: boolean) => {
    clearTimer();
    setRoute(path);
    setParams(prev => ({...prev,...(p||{})}));
    setHist(prev => replace ? prev : [...prev, {route, params}]);
    setFilterOpen(false);
    setDrawer(null);
    setExploreFilterOpen(false);
    setTimeout(()=>{ if(scrollRef.current) scrollRef.current.scrollTop=0; },0);
    if(path==='/booking/checkout'){
      setTimeLeft(300);
      tickTimer.current = setInterval(()=>{
        setTimeLeft(t=>{ if(t<=1){clearInterval(tickTimer.current);return 0;} return t-1; });
      },1000);
    }
    if(path.endsWith('/pdf')){
      setPdfLoading(true);
      setTimeout(()=>setPdfLoading(false),2000);
    }
  }, [route, params, clearTimer]);

  const back = useCallback(() => {
    clearTimer();
    setHist(prev => {
      if(!prev.length) return prev;
      const h=[...prev]; const p=h.pop()!;
      setRoute(p.route); setParams(p.params);
      setFilterOpen(false); setDrawer(null);
      setTimeout(()=>{ if(scrollRef.current) scrollRef.current.scrollTop=0; },0);
      return h;
    });
  }, [clearTimer]);

  const showToast = useCallback((m: string) => {
    setToastMsg(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToastMsg(''),1800);
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSaved(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  }, []);

  // ── Splash auto-advance ────────────────────────────────────────────────────
  useEffect(() => {
    if(route==='/'){
      splashTimer.current = setTimeout(()=>go('/onboarding',{},true),2800);
    }
    return ()=>clearTimeout(splashTimer.current);
  }, []); // eslint-disable-line

  useEffect(()=>()=>{ clearTimeout(toastTimer.current); clearInterval(tickTimer.current); clearTimeout(navTimer.current); clearTimeout(navTimer2.current); },[]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', prefTheme);
  }, [prefTheme]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const events = EVENTS.map(e=>vmEvent(e,saved,go,toggleSave));
  const allFeatured = events.filter(e=>e.feat);
  const featured = homeCat==='trending'||homeCat===null ? allFeatured.filter(e=>e.trend)
    : homeCat==='foryou'   ? allFeatured
    : homeCat==='new'      ? allFeatured.slice(-3).reverse()
    : homeCat==='tonight'  ? allFeatured.filter(e=>e.date==='Today').concat(allFeatured.filter(e=>e.date!=='Today'))
    : homeCat==='toprated' ? [...allFeatured].sort((a,b)=>b.rating-a.rating)
    : allFeatured;
  const trending = events.filter(e=>e.trend).map((e,i)=>({...e,rank:String(i+1).padStart(2,'0')}));

  const curEvent = EVENTS.find(e=>e.id===params.eventId)||EVENTS[0];
  const curVM = vmEvent(curEvent,saved,go,toggleSave);

  const navRoutes=['/home','/events','/history','/profile','/featured','/trending'];
  const showNav = (navRoutes.includes(route)||route.startsWith('/category')||route.startsWith('/ticket/')) && !settingsOpen;
  let navTab='home';
  if(route==='/events') navTab='explore';
  else if(route==='/history'||route.startsWith('/ticket/')) navTab='tickets';
  else if(route==='/profile') navTab='profile';

  const catKey = cat==='All'?null:CATMAP[cat];
  const catResults = events.filter(e=>!catKey||e.cat===catKey);

  const EVCHIPS = [{label:'All',emoji:'✨'},{label:'Today',emoji:'📅'},{label:'Weekend',emoji:'🎉'},{label:'Music',emoji:'🎸'},{label:'Comedy',emoji:'😂'},{label:'Sports',emoji:'⚽'},{label:'Cinema',emoji:'🍿'}];
  const evMap: Record<string,string> = {Music:'music',Comedy:'comedy',Sports:'sports',Cinema:'cinema'};
  let evList = [...events];
  if(evMap[evChip]) evList=evList.filter(e=>e.cat===evMap[evChip]);
  else if(evChip==='Today') evList=evList.filter(e=>e.date==='Today');
  else if(evChip==='Weekend') evList=evList.filter(e=>e.date==='Today'||e.cat==='club'||['Jun 20','Jun 21','Jun 28'].includes(e.date));
  if(exploreCity&&exploreCity!=='All') evList=evList.filter(e=>e.city===exploreCity);
  if(evSearch) evList=evList.filter(e=>(e.title+' '+(e.artist||'')+' '+e.venue).toLowerCase().includes(evSearch.toLowerCase()));
  const parseDate=(d:string)=>{ if(d==='Today')return new Date(2026,5,28); if(d==='Ongoing')return new Date(2026,5,29); const [m,day]=d.split(' '); const mo={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11}; return new Date(2026,mo[m as keyof typeof mo]||0,parseInt(day)); };
  if(exploreSort==='popular') evList.sort((a,b)=>b.rating-a.rating);
  else if(exploreSort==='price-low') evList.sort((a,b)=>a.price-b.price);
  else if(exploreSort==='price-high') evList.sort((a,b)=>b.price-a.price);
  else if(exploreSort==='date') evList.sort((a,b)=>parseDate(a.date).getTime()-parseDate(b.date).getTime());

  const hcEv = (HC_CATS.find(t=>t.label===homeCat)||{ev:''}).ev;
  let forYou = hcEv?events.filter(e=>e.cat===hcEv):events; if(!forYou.length) forYou=events;

  const selTier = TIERS.find(t=>t.id===tier);
  const unit = selTier ? Math.round(curEvent.price*selTier.mult) : curEvent.price;
  const subtotal = unit * qty;
  const discount = coupon ? subtotal * 0.10 : 0;
  const total = subtotal - discount;
  const vat = total * 0.20 / 1.20;
  const subtotalExVat = subtotal / 1.20;
  const discountExVat = discount / 1.20;
  const mm=Math.floor(timeLeft/60), ss=timeLeft%60;
  const timerLabel=mm+':'+String(ss).padStart(2,'0');
  const timeLow=timeLeft<60; const timeUp=timeLeft<=0;

  const greeting=(guest?'Hello there':'Hey '+((name||'Alex').split(' ')[0]))+' 👋';

  const qrCells = qr(params.eventId||'e1').flat();
  const orderNo = 'BV-'+(params.eventId||'e1').toUpperCase()+'7Q2K';

  const evIsCinema=curEvent.cat==='cinema'; const evIsSports=curEvent.cat==='sports'; const evIsMusic=!(evIsCinema||evIsSports);
  const evSaved=saved.includes(curEvent.id);

  const profileAvatarChar=(editName?editName[0]:(name?name[0]:'A')).toUpperCase();

  const PML: Record<string,string> = {apple:'Apple Pay',google:'Google Pay',card:'Credit / Debit Card',bank:'Bank Transfer'};

  // ─── Screen renders ────────────────────────────────────────────────────────

  const renderSplash = () => (
    <div style={{flex:'1 0 auto',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:24,background:'radial-gradient(circle at 50% 34%, var(--color-bg-brand-tint), var(--color-bg-base) 68%)'}}>
      <div style={{width:98,height:98,borderRadius:28,background:'var(--color-brand-primary)',display:'flex',alignItems:'center',justifyContent:'center',animation:'pulse 2.2s ease-in-out infinite'}}>
        <span style={{fontSize:48,fontWeight:800,color:'#fff',lineHeight:1}}>B</span>
      </div>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:32,fontWeight:800,letterSpacing:'-.6px',color:'var(--color-text-primary)'}}>Brit Vibe</div>
        <div style={{fontSize:14,color:'var(--color-text-secondary)',marginTop:5}}>Feel the moment. Book the night.</div>
      </div>
      <div style={{position:'absolute',bottom:64,width:30,height:30,border:'3px solid var(--color-bg-subtle)',borderTopColor:'var(--color-brand-primary)',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div>
  );

  const renderOnboarding = () => {
    const slide = ONB_SLIDES[onb];
    return (
      <div style={{flex:'1 0 auto',display:'flex',flexDirection:'column',padding:'22px 24px 30px'}}>
        <div style={{display:'flex',justifyContent:'flex-end'}}>
          <button onClick={()=>go('/login')} style={{background:'none',border:'none',color:'var(--color-text-secondary)',fontSize:15,fontWeight:600,cursor:'pointer',padding:8,fontFamily:'inherit'}}>Skip</button>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:36,textAlign:'center'}}>
          <div style={{width:248,height:248,borderRadius:40,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',animation:'fadeUp .4s',background:ONB_GR[onb]}}>
            <svg viewBox="0 0 24 24" width="96" height="96" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d={ONB_PATHS[onb]}/></svg>
          </div>
          <div style={{animation:'fadeUp .5s'}}>
            <div style={{fontSize:25,fontWeight:800,letterSpacing:'-.4px',maxWidth:280,color:'var(--color-text-primary)'}}>{slide.t}</div>
            <div style={{fontSize:15,lineHeight:1.55,color:'var(--color-text-secondary)',marginTop:12,maxWidth:300}}>{slide.d}</div>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'center',gap:7,marginBottom:26}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{width:i===onb?22:8,height:8,borderRadius:999,background:i===onb?'var(--color-brand-primary)':'var(--color-border-strong)',transition:'all .3s'}}/>
          ))}
        </div>
        <button onClick={()=>{ if(onb>=2)go('/login'); else setOnb(o=>o+1); }} style={{width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:17,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
          {onb===2?'Get Started':'Next'}
        </button>
      </div>
    );
  };

  const renderLogin = () => (
    <div style={{flex:'1 0 auto',display:'flex',flexDirection:'column',padding:'28px 24px'}}>
      <div style={{marginTop:36,width:62,height:62,borderRadius:18,background:'var(--color-brand-primary)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <span style={{fontSize:30,fontWeight:800,color:'#fff'}}>B</span>
      </div>
      {loginStep==='phone' && (
        <div style={{marginTop:28}}>
          <div style={{fontSize:27,fontWeight:800,letterSpacing:'-.4px',color:'var(--color-text-primary)'}}>Welcome</div>
          <div style={{fontSize:15,color:'var(--color-text-secondary)',marginTop:8,lineHeight:1.5}}>Enter your mobile number and we'll send a one-time code.</div>
          <div style={{marginTop:30,display:'flex',alignItems:'center',gap:10,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:14,padding:'4px 14px'}}>
            <span
              style={{borderRight:'1px solid var(--color-border-default)',paddingRight:12,display:'flex',alignItems:'center',position:'relative',flexShrink:0}}
              ref={el=>{
                if(!el||(el as any)._cs)return;
                (el as any)._cs=true;
                const C=[
                  {f:'🇬🇧',c:'+44',n:'United Kingdom'},{f:'🇺🇸',c:'+1',n:'United States'},
                  {f:'🇨🇦',c:'+1',n:'Canada'},{f:'🇦🇺',c:'+61',n:'Australia'},
                  {f:'🇮🇳',c:'+91',n:'India'},{f:'🇵🇰',c:'+92',n:'Pakistan'},
                  {f:'🇧🇩',c:'+880',n:'Bangladesh'},{f:'🇳🇬',c:'+234',n:'Nigeria'},
                  {f:'🇩🇪',c:'+49',n:'Germany'},{f:'🇫🇷',c:'+33',n:'France'},
                  {f:'🇮🇹',c:'+39',n:'Italy'},{f:'🇪🇸',c:'+34',n:'Spain'},
                  {f:'🇳🇱',c:'+31',n:'Netherlands'},{f:'🇵🇱',c:'+48',n:'Poland'},
                  {f:'🇵🇹',c:'+351',n:'Portugal'},{f:'🇬🇭',c:'+233',n:'Ghana'},
                  {f:'🇿🇦',c:'+27',n:'South Africa'},{f:'🇯🇵',c:'+81',n:'Japan'},
                  {f:'🇧🇷',c:'+55',n:'Brazil'},{f:'🇲🇽',c:'+52',n:'Mexico'},
                  {f:'🇦🇪',c:'+971',n:'UAE'},{f:'🇸🇦',c:'+966',n:'Saudi Arabia'},
                  {f:'🇹🇷',c:'+90',n:'Turkey'},{f:'🇰🇪',c:'+254',n:'Kenya'},
                  {f:'🇵🇭',c:'+63',n:'Philippines'},{f:'🇮🇩',c:'+62',n:'Indonesia'},
                ];
                let sel=C[0], isOpen=false;
                const chevron=`<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
                const btn=document.createElement('button');
                btn.type='button';
                btn.style.cssText='background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:15px;font-weight:600;color:var(--color-text-secondary);padding:0;font-family:inherit;white-space:nowrap;';
                const upBtn=()=>{btn.innerHTML=`${sel.f} ${sel.c} ${chevron}`;};
                const drop=document.createElement('div');
                drop.style.cssText='position:absolute;top:calc(100% + 14px);left:-14px;z-index:300;background:var(--color-bg-surface);width:260px;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,.5);border:1px solid var(--color-border-default);display:none;flex-direction:column;overflow:hidden;';
                const sw=document.createElement('div');
                sw.style.cssText='padding:10px 10px 8px;border-bottom:1px solid var(--color-border-default);';
                const inp=document.createElement('input');
                inp.placeholder='Search country…';
                inp.style.cssText='width:100%;background:var(--color-bg-base);border:1px solid var(--color-border-default);border-radius:10px;padding:9px 12px;font-size:13.5px;color:var(--color-text-primary);outline:none;font-family:inherit;box-sizing:border-box;';
                sw.appendChild(inp);
                const list=document.createElement('div');
                list.style.cssText='max-height:210px;overflow-y:auto;scrollbar-width:none;';
                const render=(q='')=>{
                  list.innerHTML='';
                  C.filter(c=>(c.n+c.c).toLowerCase().includes(q.toLowerCase())).forEach(c=>{
                    const it=document.createElement('button');
                    it.type='button';
                    const isSel=c===sel;
                    it.style.cssText=`width:100%;display:flex;align-items:center;gap:10px;background:${isSel?'var(--color-bg-brand-tint)':'none'};border:none;padding:10px 14px;cursor:pointer;font-family:inherit;`;
                    it.innerHTML=`<span style="font-size:19px">${c.f}</span><span style="flex:1;font-size:13.5px;font-weight:600;color:var(--color-text-primary)">${c.n}</span><span style="font-size:12.5px;color:var(--color-text-secondary);font-weight:600">${c.c}</span>`;
                    it.onmouseenter=()=>{if(c!==sel)it.style.background='var(--color-bg-subtle)';};
                    it.onmouseleave=()=>{it.style.background=c===sel?'var(--color-bg-brand-tint)':'none';};
                    it.onclick=e=>{e.stopPropagation();sel=c;upBtn();close();};
                    list.appendChild(it);
                  });
                };
                const open=()=>{isOpen=true;drop.style.display='flex';render();setTimeout(()=>inp.focus(),30);};
                const close=()=>{isOpen=false;drop.style.display='none';inp.value='';};
                btn.onclick=e=>{e.stopPropagation();isOpen?close():open();};
                inp.oninput=()=>render(inp.value);
                document.addEventListener('click',e=>{if(!el.contains(e.target as Node))close();});
                drop.appendChild(sw);drop.appendChild(list);
                el.appendChild(btn);el.appendChild(drop);
                upBtn();
              }}
            />
            <input value={phone||'7700 900123'} onChange={e=>setPhone(e.target.value)} inputMode="tel" placeholder="7700 900123" style={{flex:1,border:'none',background:'none',color:'var(--color-text-primary)',fontSize:16,padding:'14px 0',outline:'none',fontFamily:'inherit'}}/>
          </div>
          <button onClick={()=>{ if((phone||'7700900123').replace(/\D/g,'').length<7){showToast('Enter a valid number');return;} setLoginStep('otp'); showToast('Demo code: 000000'); }} style={{marginTop:20,width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:17,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Send code</button>
          <div style={{display:'flex',alignItems:'center',gap:12,margin:'24px 0'}}>
            <div style={{flex:1,height:1,background:'var(--color-border-default)'}}/>
            <span style={{fontSize:13,color:'var(--color-text-placeholder)'}}>or</span>
            <div style={{flex:1,height:1,background:'var(--color-border-default)'}}/>
          </div>
          <button onClick={()=>go('/guest-entry')} style={{width:'100%',background:'var(--color-bg-surface)',color:'var(--color-text-primary)',border:'1px solid var(--color-border-default)',borderRadius:15,padding:16,fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Continue as guest</button>
        </div>
      )}
      {loginStep==='otp' && (
        <div style={{marginTop:28}}>
          <div style={{fontSize:27,fontWeight:800,letterSpacing:'-.4px',color:'var(--color-text-primary)'}}>Verify your number</div>
          <div style={{fontSize:15,color:'var(--color-text-secondary)',marginTop:8,lineHeight:1.5}}>Enter the 6-digit code sent to +44 {phone}.</div>
          <div ref={el=>{if(!el||(el as any)._otpSetup)return;(el as any)._otpSetup=true;}} style={{display:'flex',gap:9,marginTop:30}}>
            {otp.map((d,i)=>(
              <input
                key={i}
                id={`otp-${i}`}
                value={d}
                onChange={e=>{
                  const v=(e.target.value||'').replace(/\D/g,'').slice(-1);
                  const o=[...otp]; o[i]=v; setOtp(o);
                  if(v && i<5) (document.getElementById(`otp-${i+1}`) as HTMLInputElement|null)?.focus();
                  if(o.every(x=>x!=='')&&!loginLoading){ setLoginLoading(true); navTimer.current=setTimeout(()=>{ setLoginLoading(false); go('/setup-profile'); },1100); }
                }}
                onKeyDown={e=>{
                  if(e.key==='Backspace'&&!otp[i]&&i>0)(document.getElementById(`otp-${i-1}`) as HTMLInputElement|null)?.focus();
                }}
                inputMode="numeric" maxLength={1}
                style={{width:48,height:58,textAlign:'center',fontSize:22,fontWeight:700,background:'var(--color-bg-surface)',border:`1px solid ${d?'var(--color-brand-primary)':'var(--color-border-default)'}`,borderRadius:13,color:'var(--color-text-primary)',fontFamily:'inherit',outline:'none'}}
              />
            ))}
          </div>
          <button onClick={()=>{ if(loginLoading)return; setLoginLoading(true); navTimer.current=setTimeout(()=>{ setLoginLoading(false); go('/setup-profile'); },1100); }} style={{marginTop:26,width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:17,fontSize:16,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,fontFamily:'inherit'}}>
            {loginLoading && <span style={{width:18,height:18,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block'}}/>}
            {loginLoading?'Verifying…':'Verify & continue'}
          </button>
          <button onClick={()=>showToast('Code resent')} style={{marginTop:16,width:'100%',background:'none',border:'none',color:'var(--color-text-brand)',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Resend code</button>
        </div>
      )}
    </div>
  );

  const renderGuest = () => (
    <div style={{flex:'1 0 auto',display:'flex',flexDirection:'column',justifyContent:'center',padding:'28px 24px',gap:24}}>
      <div style={{width:74,height:74,borderRadius:22,background:'var(--color-bg-brand-tint)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="var(--color-brand-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4 M12 17v0 M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
      </div>
      <div>
        <div style={{fontSize:25,fontWeight:800,letterSpacing:'-.4px',color:'var(--color-text-primary)'}}>Browsing as a guest</div>
        <div style={{fontSize:15,color:'var(--color-text-secondary)',marginTop:10,lineHeight:1.6}}>You can explore and book, but a few things are limited until you create an account.</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {GUESTLIMITS.map((g,i)=>(
          <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:'var(--color-bg-subtle)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18 M6 6l12 12"/></svg>
            </div>
            <span style={{fontSize:14.5,color:'var(--color-text-secondary)',lineHeight:1.45}}>{g}</span>
          </div>
        ))}
      </div>
      <div style={{marginTop:8,display:'flex',flexDirection:'column',gap:12}}>
        <button onClick={()=>{ setGuest(true); go('/home',{},true); }} style={{width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:17,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Continue as guest</button>
        <button onClick={()=>go('/login')} style={{width:'100%',background:'none',border:'none',color:'var(--color-text-primary)',fontSize:15,fontWeight:600,cursor:'pointer',padding:8,fontFamily:'inherit'}}>Back to login</button>
      </div>
    </div>
  );

  const renderProfileSetup = () => (
    <div style={{flex:'1 0 auto',display:'flex',flexDirection:'column',padding:24}}>
      <div style={{display:'flex',alignItems:'center',gap:14,marginTop:10}}>
        <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
        <span style={{fontSize:13,color:'var(--color-text-placeholder)',fontWeight:600}}>STEP 1 OF 3</span>
      </div>
      <div style={{fontSize:26,fontWeight:800,letterSpacing:'-.4px',marginTop:18,color:'var(--color-text-primary)'}}>Set up your profile</div>
      <div style={{fontSize:15,color:'var(--color-text-secondary)',marginTop:6}}>Tell us a little about yourself.</div>
      <div style={{display:'flex',justifyContent:'center',margin:'28px 0 8px'}}>
        <button onClick={()=>showToast('Photo picker (demo)')} style={{position:'relative',width:104,height:104,borderRadius:'50%',background:'var(--color-bg-surface)',border:'2px dashed var(--color-border-strong)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--color-text-placeholder)'}}>
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9a2 2 0 0 1 2-2h1.5l1-2h7l1 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>
          <div style={{position:'absolute',bottom:0,right:4,width:30,height:30,borderRadius:'50%',background:'var(--color-brand-primary)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',border:'3px solid var(--color-bg-base)'}}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14 M5 12h14"/></svg>
          </div>
        </button>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:16,marginTop:14}}>
        <label style={lblStyle}>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Alex Sterling" style={fieldStyle}/></label>
        <label style={lblStyle}>
          Username — your Brit Vibe ID
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:15,top:'50%',transform:'translateY(-50%)',color:'var(--color-text-placeholder)',fontSize:15,fontWeight:700,pointerEvents:'none',userSelect:'none'}}>@</span>
            <input
              defaultValue="alexsterling"
              placeholder="yourhandle"
              style={{...fieldStyle,paddingLeft:34,paddingRight:100}}
              ref={el=>{
                if(!el||(el as any)._idSetup)return;
                (el as any)._idSetup=true;
                const badge=el.parentElement!.querySelector('[data-avail]') as HTMLElement;
                const update=()=>{
                  const val=el.value.replace(/[^a-z0-9_.]/gi,'').toLowerCase();
                  el.value=val;
                  if(badge){
                    if(val.length>=3){ badge.style.color='var(--color-status-success)'; badge.innerHTML='<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg> Available'; }
                    else if(val.length>0){ badge.style.color='var(--color-status-warning)'; badge.innerHTML='Too short'; }
                    else{ badge.style.color='var(--color-text-placeholder)'; badge.innerHTML='Required'; }
                  }
                };
                el.addEventListener('input',update);
                setTimeout(update,0);
              }}
            />
            <span data-avail="" style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',display:'inline-flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,pointerEvents:'none'}}/>
          </div>
          <span style={{fontSize:11.5,color:'var(--color-text-placeholder)',marginTop:2}}>Only letters, numbers, _ and . · Used to find and tag you</span>
        </label>
        <label style={lblStyle}>Email<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="alex@email.com" inputMode="email" style={fieldStyle}/></label>
        <label style={lblStyle}>Date of birth<input value={dob} onChange={e=>setDob(e.target.value)} placeholder="DD / MM / YYYY" style={fieldStyle}/></label>
      </div>
      <div style={{flex:1}}/>
      <button onClick={()=>go('/interests')} style={{marginTop:24,width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:17,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Continue</button>
    </div>
  );

  const renderInterests = () => (
    <div style={{flex:'1 0 auto',display:'flex',flexDirection:'column',padding:24}}>
      <div style={{display:'flex',alignItems:'center',gap:14,marginTop:10}}>
        <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
        <span style={{fontSize:13,color:'var(--color-text-placeholder)',fontWeight:600}}>STEP 2 OF 3</span>
      </div>
      <div style={{fontSize:26,fontWeight:800,letterSpacing:'-.4px',marginTop:18,color:'var(--color-text-primary)'}}>What's your vibe?</div>
      <div style={{fontSize:15,color:'var(--color-text-secondary)',marginTop:6}}>Pick a few interests to personalise your feed.</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gridTemplateRows:'repeat(4,1fr)',gap:12,marginTop:20,flex:1,minHeight:0}}>
        {INTERESTS.map(x=>{ const sel=interests.includes(x);
          const ICONS:Record<string,string>={Music:'🎸',Comedy:'😂',Theatre:'🎭',Cinema:'🍿',Sports:'⚽',Clubbing:'🪩',Festivals:'🎡','Live Shows':'🎤'};
          return (
          <button key={x} onClick={()=>setInterests(prev=>prev.includes(x)?prev.filter(i=>i!==x):[...prev,x])} style={{borderRadius:20,cursor:'pointer',border:`1.5px solid ${sel?'var(--color-brand-primary)':'var(--color-border-default)'}`,background:sel?'var(--color-bg-brand-tint)':'var(--color-bg-surface)',color:sel?'var(--color-text-brand)':'var(--color-text-secondary)',fontFamily:'inherit',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:9,position:'relative',boxShadow:sel?'0 4px 20px rgba(241,60,56,.2)':'none',transition:'box-shadow .15s',padding:0,width:'100%',height:'100%'}}>
            <span style={{fontSize:34,lineHeight:1}}>{ICONS[x]||'✨'}</span>
            <span style={{fontSize:13,fontWeight:700,lineHeight:1.2,textAlign:'center',paddingInline:8}}>{x}</span>
            {sel&&<div style={{position:'absolute',top:9,right:9,width:18,height:18,borderRadius:'50%',background:'var(--color-brand-primary)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
            </div>}
          </button>
        ); })}
      </div>
      <button onClick={()=>{ if(!interests.length){showToast('Pick at least one');return;} go('/verify-device'); }} style={{marginTop:24,width:'100%',border:'none',borderRadius:15,padding:17,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit',background:interests.length?'var(--color-brand-primary)':'var(--color-bg-subtle)',color:interests.length?'#fff':'var(--color-text-placeholder)'}}>
        Continue {interests.length?`(${interests.length})`:''}
      </button>
    </div>
  );

  const renderVerify = () => (
    <div style={{flex:'1 0 auto',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'28px 24px',textAlign:'center',gap:26}}>
      <div style={{position:'relative',width:150,height:150,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'3px solid var(--color-bg-subtle)'}}/>
        {verify==='checking' && <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'3px solid transparent',borderTopColor:'var(--color-brand-primary)',animation:'spin .9s linear infinite'}}/>}
        <div style={{width:104,height:104,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:verify==='success'?'var(--color-status-success)':'var(--color-brand-primary)'}}>
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d={verify==='success'?'M5 13l4 4L19 7':'M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z'}/>
          </svg>
        </div>
      </div>
      <div>
        <div style={{fontSize:24,fontWeight:800,letterSpacing:'-.4px',color:'var(--color-text-primary)'}}>{verify==='idle'?'Secure your device':verify==='checking'?'Verifying…':'You\'re all set'}</div>
        <div style={{fontSize:15,color:'var(--color-text-secondary)',marginTop:10,lineHeight:1.55,maxWidth:300}}>{verify==='idle'?'We\'ll run a quick security check to keep your tickets and payments protected.':verify==='checking'?'Running a secure handshake with our servers.':'Device verified. Taking you to your feed.'}</div>
      </div>
      {verify==='idle' && (
        <button onClick={()=>{ setVerify('checking'); navTimer.current=setTimeout(()=>{ setVerify('success'); navTimer2.current=setTimeout(()=>go('/home',{},true),1500); },1800); }} style={{width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:17,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Verify this device</button>
      )}
    </div>
  );

  const renderHome = () => (
    <div style={{paddingBottom:96}}>
      {/* Sticky header — greeting + icons + category strip */}
      <div style={{position:'sticky',top:0,zIndex:20,background:'var(--color-bg-base)'}}>
        <div style={{padding:'22px 20px 18px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontSize:22,fontWeight:800,letterSpacing:'-.4px',color:'var(--color-text-primary)',lineHeight:1.1}}>
            Hey <span style={{color:'var(--color-brand-primary)'}}>@{(name||'alexsterling').toLowerCase().replace(/\s+/g,'')}</span> 👋
          </div>
          <div style={{display:'flex',alignItems:'center',gap:20}}>
            <button onClick={()=>go('/select-location')} style={{background:'none',border:'none',cursor:'pointer',padding:0,color:'var(--color-text-secondary)',display:'flex',alignItems:'center'}}>
              <MapPin size={20}/>
            </button>
            <button onClick={()=>go('/notifications')} style={{background:'none',border:'none',cursor:'pointer',padding:0,color:'var(--color-text-primary)',display:'flex',alignItems:'center',position:'relative'}}>
              <Bell size={20}/>
              {notifications.some(n=>!n.read) && (
                <span style={{position:'absolute',top:-2,right:-2,width:7,height:7,borderRadius:'50%',background:'var(--color-brand-primary)',border:'1.5px solid var(--color-bg-base)'}}/>
              )}
            </button>
          </div>
        </div>

      {/* Category grid — also sticky under the greeting */}
      <div style={{padding:'0 0 10px'}}>
        <div
          style={{display:'flex',gap:12,overflowX:'auto',scrollbarWidth:'none',padding:'0 20px',WebkitOverflowScrolling:'touch',cursor:'grab',userSelect:'none',transition:'max-height .3s ease, opacity .3s ease, padding .3s ease',overflow:'hidden',maxHeight:'100px',opacity:1}}
          ref={el=>{
            if(!el||(el as any)._ch)return;
            (el as any)._ch=true;
            let last=0,gone=false;
            const find=(n:HTMLElement):HTMLElement|null=>{let p=n.parentElement;while(p&&p!==document.documentElement){if(/auto|scroll/.test(window.getComputedStyle(p).overflowY))return p;p=p.parentElement;}return null;};
            const sc=find(el);if(!sc)return;
            sc.addEventListener('scroll',()=>{
              const y=sc.scrollTop;
              if(y<=6){gone=false;el.style.maxHeight='100px';el.style.opacity='1';el.style.paddingTop='';el.style.paddingBottom='';}
              else if(y>last&&!gone){gone=true;el.style.maxHeight='0';el.style.opacity='0';el.style.paddingTop='0';el.style.paddingBottom='0';}
              else if(y<last&&gone){gone=false;el.style.maxHeight='100px';el.style.opacity='1';el.style.paddingTop='';el.style.paddingBottom='';}
              last=y;
            },{passive:true});
          }}
          onMouseDown={e=>{const el=e.currentTarget;el.dataset.down='1';el.dataset.sx=String(e.pageX);el.dataset.sl=String(el.scrollLeft);el.style.cursor='grabbing';}}
          onMouseMove={e=>{const el=e.currentTarget;if(!el.dataset.down)return;e.preventDefault();el.scrollLeft=Number(el.dataset.sl)-(e.pageX-Number(el.dataset.sx));}}
          onMouseUp={e=>{const el=e.currentTarget;delete el.dataset.down;el.style.cursor='grab';}}
          onMouseLeave={e=>{const el=e.currentTarget;delete el.dataset.down;el.style.cursor='grab';}}
        >
          {[{label:'See All',isSeeAll:true,emoji:'',on:()=>setHomeCat(null),sel:!homeCat},...HC_CATS.map(t=>({label:t.label,isSeeAll:false,emoji:t.emoji,on:()=>setHomeCat(prev=>prev===t.label?null:t.label),sel:homeCat===t.label}))].map((c,i)=>{
            const box: React.CSSProperties = {width:54,height:54,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,background:c.sel?'var(--color-brand-primary)':(c.isSeeAll?'var(--color-bg-subtle)':'var(--color-bg-surface)'),border:`1px solid ${c.sel?'var(--color-brand-primary)':(c.isSeeAll?'var(--color-border-strong)':'var(--color-border-default)')}`,boxShadow:c.sel?'0 6px 20px rgba(241,60,56,.4)':'none',color:c.sel?'#fff':'var(--color-text-secondary)',flexShrink:0};
            return (
              <button key={i} onClick={c.on} style={{background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:7,padding:0,flexShrink:0,width:68,fontFamily:'inherit'}}>
                <span style={box}>
                  {c.isSeeAll?<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>:c.emoji}
                </span>
                <span style={{fontSize:11,fontWeight:600,color:c.sel?'var(--color-text-brand)':'var(--color-text-secondary)',whiteSpace:'nowrap'}}>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured tab strip — inside sticky header */}
        <div
          style={{display:'flex',alignItems:'center',gap:4,overflowX:'auto',scrollbarWidth:'none',padding:'10px 20px 10px',cursor:'grab',userSelect:'none'}}
          onMouseDown={e=>{const el=e.currentTarget;el.dataset.down='1';el.dataset.sx=String(e.pageX);el.dataset.sl=String(el.scrollLeft);el.style.cursor='grabbing';}}
          onMouseMove={e=>{const el=e.currentTarget;if(!el.dataset.down)return;e.preventDefault();el.scrollLeft=Number(el.dataset.sl)-(e.pageX-Number(el.dataset.sx));}}
          onMouseUp={e=>{const el=e.currentTarget;delete el.dataset.down;el.style.cursor='grab';}}
          onMouseLeave={e=>{const el=e.currentTarget;delete el.dataset.down;el.style.cursor='grab';}}
        >
          {([{label:'Trending',val:'trending'},{label:'For You',val:'foryou'},{label:'New Drops',val:'new'},{label:'Tonight',val:'tonight'},{label:'Top Rated',val:'toprated'}] as {label:string,val:string}[]).map(tab=>{
            const active = (homeCat===null&&tab.val==='trending')||homeCat===tab.val;
            return (
              <button key={tab.label} onClick={()=>setHomeCat(tab.val)} style={{background:'none',border:'none',cursor:'pointer',padding:'6px 4px 10px',fontSize:13.5,fontWeight:active?700:400,color:active?'var(--color-text-primary)':'var(--color-text-placeholder)',position:'relative',flexShrink:0,fontFamily:'inherit',whiteSpace:'nowrap',marginRight:16}}>
                {tab.label}
                {active && <span style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:'var(--color-brand-primary)',borderRadius:2}}/>}
              </button>
            );
          })}
        </div>
      </div>{/* end sticky header */}

        <div style={{display:'flex',flexDirection:'column',gap:18,padding:'16px 20px 0'}}>
          {featured.map(ev=>(
            <div key={ev.id} style={{position:'relative',height:380,borderRadius:24,overflow:'hidden',flexShrink:0,boxShadow:'0 8px 30px rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.08)'}}>
              <Fill style={ev.fill}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.3) 100%)'}}/>
              <div style={{position:'absolute',top:20,left:0,background:'#F13C38',color:'#fff',padding:'5px 18px 5px 16px',fontSize:10,fontWeight:800,letterSpacing:1.2,textTransform:'uppercase',clipPath:'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)'}}>HOT VIBE</div>
              <div style={{position:'absolute',right:14,bottom:24,display:'flex',flexDirection:'column',alignItems:'center',gap:18,zIndex:10}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  <button onClick={ev.toggle} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',color:'#fff'}}>
                    <Heart fill={ev.heartFill} size={22}/>
                  </button>
                  <span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.85)'}}>Save</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  <button onClick={()=>showToast('Link copied to clipboard')} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',color:'#fff'}}>
                    <ShareIcon/>
                  </button>
                  <span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.85)'}}>Share</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                    <Star size={20}/>
                    <span style={{fontSize:11,fontWeight:800,color:'#fff',lineHeight:1}}>{ev.rate}</span>
                  </div>
                  <span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.85)'}}>Rating</span>
                </div>
              </div>
              <div style={{position:'absolute',left:20,bottom:20,right:80,color:'#fff',pointerEvents:'none'}}>
                <div style={{fontSize:22,fontWeight:800,lineHeight:1.25,letterSpacing:'-.4px',textShadow:'0 2px 4px rgba(0,0,0,0.6)'}}>{ev.title}</div>
                <div style={{marginTop:5}}><span style={{fontSize:11,fontWeight:700,background:'rgba(0,0,0,0.45)',backdropFilter:'blur(6px)',color:'#fff',padding:'3px 10px',borderRadius:999}}>{ev.catLabel}</span></div>
                <div style={{fontSize:13,opacity:.9,marginTop:5,display:'flex',alignItems:'center',gap:6,fontWeight:500,textShadow:'0 1px 2px rgba(0,0,0,0.5)'}}>
                  <span>{ev.venue}</span><span style={{opacity:.6}}>•</span><span>{ev.date}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginTop:14,pointerEvents:'auto'}}>
                  <div style={{background:'rgba(255,255,255,0.12)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,0.15)',padding:'6px 12px',borderRadius:12,display:'inline-flex',alignItems:'center',gap:5}}>
                    <span style={{fontSize:10.5,opacity:.75,fontWeight:500}}>from</span>
                    <span style={{fontSize:13.5,fontWeight:800,color:'var(--color-text-brand)'}}>{ev.priceLabel}</span>
                  </div>
                  <button onClick={ev.on} style={{background:'#fff',color:'#000',border:'none',borderRadius:12,padding:'8px 16px',fontSize:13,fontWeight:800,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:4,boxShadow:'0 4px 12px rgba(255,255,255,0.15)',fontFamily:'inherit'}}>
                    Book Now <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );

  const renderLocation = () => (
    <div style={{flex:'1 0 auto',padding:20,display:'flex',flexDirection:'column'}}>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
        <span style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>Choose location</span>
      </div>
      <div style={{marginTop:20,display:'flex',alignItems:'center',gap:10,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:14,padding:'0 14px'}}>
        <SearchIcon/>
        <input value={locSearch} onChange={e=>setLocSearch(e.target.value)} placeholder="Search city" style={{flex:1,border:'none',background:'none',color:'var(--color-text-primary)',fontSize:15,padding:'14px 0',outline:'none',fontFamily:'inherit'}}/>
      </div>
      <button onClick={()=>{ setLoc('London'); showToast('Located: London'); back(); }} style={{marginTop:16,width:'100%',display:'flex',alignItems:'center',gap:12,background:'var(--color-bg-brand-tint)',border:'1px solid var(--color-border-brand)',borderRadius:14,padding:15,cursor:'pointer',color:'var(--color-text-brand)',fontFamily:'inherit'}}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v3 M12 19v3 M2 12h3 M19 12h3"/></svg>
        <span style={{fontSize:15,fontWeight:700}}>Use my current location</span>
      </button>
      <div style={{fontSize:13,fontWeight:700,color:'var(--color-text-placeholder)',textTransform:'uppercase',letterSpacing:.5,margin:'24px 0 6px'}}>Popular cities</div>
      <div style={{display:'flex',flexDirection:'column'}}>
        {CITIES.filter(c=>c.toLowerCase().includes(locSearch.toLowerCase())).map(c=>(
          <button key={c} onClick={()=>{ setLoc(c); back(); }} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'none',border:'none',borderBottom:'1px solid var(--color-border-default)',padding:'17px 2px',cursor:'pointer',color:'var(--color-text-primary)',fontFamily:'inherit'}}>
            <span style={{display:'flex',alignItems:'center',gap:12,fontSize:15.5,fontWeight:600}}>
              <LocPin color="var(--color-text-placeholder)"/>{c}
            </span>
            {c===loc && <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--color-brand-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>}
          </button>
        ))}
      </div>
    </div>
  );

  const renderFeatured = () => (
    <div style={{padding:'20px 20px 96px'}}>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:6}}>
        <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
        <span style={{fontSize:21,fontWeight:800,color:'var(--color-text-primary)'}}>Featured Events</span>
      </div>
      <div style={{fontSize:14,color:'var(--color-text-secondary)',marginBottom:20,paddingLeft:54}}>Hand-picked vibes worth your night out</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 13px'}}>
        {featured.map(ev=>(
          <EventCard key={ev.id} ev={ev} onClick={ev.on} onToggle={ev.toggle} height={170} showDate={false}/>
        ))}
      </div>
    </div>
  );

  const renderTrending = () => (
    <div style={{padding:'20px 20px 96px'}}>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
        <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
        <span style={{fontSize:21,fontWeight:800,color:'var(--color-text-primary)'}}>Trending Now</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:18}}>
        {trending.map(ev=>(
          <div key={ev.id} onClick={ev.on} style={{display:'flex',gap:14,alignItems:'center',cursor:'pointer',background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:18,padding:12}}>
            <span style={{fontSize:28,fontWeight:800,color:'var(--color-brand-primary)',width:34,flexShrink:0,textAlign:'center'}}>{ev.rank}</span>
            <div style={{position:'relative',width:70,height:70,borderRadius:14,overflow:'hidden',flexShrink:0}}><Fill style={ev.fill}/></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15.5,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--color-text-primary)'}}>{ev.title}</div>
              <div style={{fontSize:12.5,color:'var(--color-text-secondary)',marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.venue}</div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginTop:6}}>
                <span style={{fontSize:13,fontWeight:700,color:'var(--color-text-brand)'}}>from {ev.priceLabel}</span>
                <span style={{display:'flex',alignItems:'center',gap:3,fontSize:12,fontWeight:600,color:'var(--color-text-secondary)'}}><Star size={12}/>{ev.rate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCategory = () => (
    <div style={{padding:'0 0 96px',position:'relative'}}>
      <div style={{position:'sticky',top:0,zIndex:10,background:'var(--color-bg-base)',padding:'20px 20px 12px',borderBottom:'1px solid var(--color-border-default)'}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
          <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
          <span style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>Browse</span>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <div style={{flex:1,display:'flex',alignItems:'center',gap:9,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:13,padding:'0 13px'}}>
            <SearchIcon/>
            <input value={evSearch} onChange={e=>setEvSearch(e.target.value)} placeholder="Search" style={{flex:1,border:'none',background:'none',color:'var(--color-text-primary)',fontSize:14.5,padding:'12px 0',outline:'none',fontFamily:'inherit'}}/>
          </div>
          <button onClick={()=>setFilterOpen(f=>!f)} style={{width:46,height:46,borderRadius:13,background:'var(--color-brand-primary)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><FilterIcon/></button>
        </div>
        <div style={{display:'flex',gap:9,overflowX:'auto',scrollbarWidth:'none',marginTop:14}}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{...chip(c===cat),fontFamily:'inherit'}}>{c}</button>
          ))}
        </div>
      </div>
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:13,color:'var(--color-text-secondary)',marginBottom:14}}>{catResults.length} events</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 13px'}}>
          {catResults.map(ev=>(
            <EventCard key={ev.id} ev={ev} onClick={ev.on} onToggle={ev.toggle} height={160} showDate={false}/>
          ))}
        </div>
      </div>
      {filterOpen && (
        <div onClick={()=>setFilterOpen(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.5)',zIndex:30,display:'flex',alignItems:'flex-end'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:'100%',background:'var(--color-bg-surface)',borderRadius:'24px 24px 0 0',padding:'22px 22px 28px',animation:'sheetUp .3s ease'}}>
            <div style={{width:40,height:4,borderRadius:99,background:'var(--color-border-strong)',margin:'0 auto 18px'}}/>
            <div style={{fontSize:19,fontWeight:800,marginBottom:18,color:'var(--color-text-primary)'}}>Filters</div>
            <div style={{fontSize:13,fontWeight:700,color:'var(--color-text-secondary)',marginBottom:10}}>Price range</div>
            <div style={{height:6,borderRadius:99,background:'var(--color-bg-subtle)',position:'relative',marginBottom:8}}>
              <div style={{position:'absolute',left:'8%',right:'32%',top:0,bottom:0,background:'var(--color-brand-primary)',borderRadius:99}}/>
              <div style={{position:'absolute',left:'8%',top:'50%',width:18,height:18,borderRadius:'50%',background:'#fff',border:'3px solid var(--color-brand-primary)',transform:'translate(-50%,-50%)'}}/>
              <div style={{position:'absolute',right:'32%',top:'50%',width:18,height:18,borderRadius:'50%',background:'#fff',border:'3px solid var(--color-brand-primary)',transform:'translate(50%,-50%)'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'var(--color-text-secondary)',marginBottom:20}}><span>£10</span><span>£120</span></div>
            <div style={{fontSize:13,fontWeight:700,color:'var(--color-text-secondary)',marginBottom:10}}>Availability</div>
            <div style={{display:'flex',gap:9,marginBottom:24}}>
              <span style={{padding:'9px 16px',borderRadius:999,fontSize:13,fontWeight:600,background:'var(--color-bg-brand-tint)',color:'var(--color-text-brand)',border:'1px solid var(--color-border-brand)'}}>Available</span>
              <span style={{padding:'9px 16px',borderRadius:999,fontSize:13,fontWeight:600,background:'var(--color-bg-base)',color:'var(--color-text-secondary)',border:'1px solid var(--color-border-default)'}}>This weekend</span>
            </div>
            <button onClick={()=>setFilterOpen(false)} style={{width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Show {catResults.length} events</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderExplore = () => (
    <div style={{padding:'0 0 96px',position:'relative'}}>
      <div style={{position:'sticky',top:0,zIndex:10,background:'var(--color-bg-base)',padding:'20px 20px 12px',borderBottom:'1px solid var(--color-border-default)'}}>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:'-.4px',marginBottom:16,color:'var(--color-text-primary)'}}>Explore</div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <div style={{flex:1,display:'flex',alignItems:'center',gap:9,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:13,padding:'0 13px'}}>
            <SearchIcon/>
            <input value={evSearch} onChange={e=>setEvSearch(e.target.value)} placeholder="Search events…" style={{flex:1,border:'none',background:'none',color:'var(--color-text-primary)',fontSize:14.5,padding:'12px 0',outline:'none',fontFamily:'inherit'}}/>
          </div>
          <button onClick={()=>setExploreFilterOpen(f=>!f)} style={{width:46,height:46,borderRadius:13,background:exploreCity!=='All'||evChip!=='All'||exploreSort!=='popular'?'var(--color-bg-brand-tint)':'var(--color-bg-surface)',border:`1px solid ${exploreCity!=='All'||evChip!=='All'||exploreSort!=='popular'?'var(--color-brand-primary)':'var(--color-border-default)'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
            <FilterIcon/>
          </button>
        </div>
        <div style={{display:'flex',gap:9,overflowX:'auto',scrollbarWidth:'none',marginTop:14}}>
          {EVCHIPS.map(c=>(
            <button key={c.label} onClick={()=>setEvChip(c.label)} style={{...chip(c.label===evChip),fontFamily:'inherit'}}>{c.emoji} {c.label}</button>
          ))}
        </div>
      </div>
      <div style={{padding:'16px 20px 0'}}>
        <div style={{fontSize:13,color:'var(--color-text-secondary)',marginBottom:14}}>{evList.length} {evList.length===1?'event':'events'}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 13px'}}>
          {evList.map(ev=>(
            <EventCard key={ev.id} ev={ev} onClick={ev.on} onToggle={ev.toggle} height={160} showDate={false}/>
          ))}
        </div>
      </div>
      {exploreFilterOpen && (
        <div onClick={()=>setExploreFilterOpen(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.5)',zIndex:30,display:'flex',alignItems:'flex-end'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:'100%',background:'var(--color-bg-surface)',borderRadius:'24px 24px 0 0',padding:'22px 22px 28px',animation:'sheetUp .3s ease',maxHeight:'85%',overflowY:'auto'}}>
            <div style={{width:40,height:4,borderRadius:99,background:'var(--color-border-strong)',margin:'0 auto 18px'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div style={{fontSize:22,fontWeight:800,color:'var(--color-text-primary)',letterSpacing:'-.4px'}}>Filters</div>
              <button onClick={()=>{ setExploreCity('All'); setEvChip('All'); setExploreSort('popular'); setExploreLocSearch(''); }} style={{background:'none',border:'none',color:'var(--color-brand-primary)',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Reset</button>
            </div>

            <div style={{fontSize:15,fontWeight:700,color:'var(--color-text-primary)',marginBottom:12}}>Select City</div>
            <div style={{position:'relative',width:'100%',marginBottom:14}}>
              <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--color-text-placeholder)',display:'flex',alignItems:'center'}}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/></svg>
              </span>
              <input
                value={exploreLocSearch}
                onChange={e=>setExploreLocSearch(e.target.value)}
                placeholder="Search cities..."
                style={{
                  width:'100%',
                  boxSizing:'border-box',
                  background:'var(--color-bg-base)',
                  border:'1px solid var(--color-border-default)',
                  borderRadius:12,
                  padding:'12px 14px 12px 42px',
                  fontSize:14.5,
                  color:'var(--color-text-primary)',
                  outline:'none',
                  fontFamily:'inherit'
                }}
              />
            </div>

            <div style={{display:'flex',gap:10,overflowX:'auto',scrollbarWidth:'none',paddingBottom:4,marginBottom:22,WebkitOverflowScrolling:'touch'}}>
              {['All','London','Manchester','Birmingham','Leeds','Bristol']
                .filter(c => c === 'All' || c.toLowerCase().includes(exploreLocSearch.toLowerCase()))
                .map(c=>(
                  <button key={c} onClick={()=>setExploreCity(c)} style={{...chip(exploreCity===c),fontFamily:'inherit'}}>{c==='All'?'All Cities':c}</button>
                ))
              }
            </div>

            <div style={{fontSize:15,fontWeight:700,color:'var(--color-text-primary)',marginBottom:12}}>Sort By</div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:22}}>
              {[
                {id:'popular',label:'🔥 Popularity'},
                {id:'price-low',label:'💸 Price: Low to High'},
                {id:'price-high',label:'💰 Price: High to Low'},
                {id:'date',label:'📅 Date'}
              ].map(o=>(
                <button key={o.id} onClick={()=>setExploreSort(o.id)} style={{...chip(exploreSort===o.id),fontFamily:'inherit'}}>{o.label}</button>
              ))}
            </div>

            <div style={{fontSize:15,fontWeight:700,color:'var(--color-text-primary)',marginBottom:12}}>Select Category</div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:28}}>
              {EVCHIPS.map(c=>(
                <button key={c.label} onClick={()=>setEvChip(c.label)} style={{...chip(evChip===c.label),fontFamily:'inherit'}}>{c.emoji} {c.label}</button>
              ))}
            </div>

            <button onClick={()=>setExploreFilterOpen(false)} style={{width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:16,padding:'16px 20px',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 15px rgba(241,60,56,.15)'}}>Show {evList.length} {evList.length===1?'event':'events'}</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderEventDetail = () => {
    const ev=curVM; const e=curEvent;
    const stands=[{name:'Lower Tier',price:e.price},{name:'Upper Tier',price:Math.round(e.price*0.7)},{name:'VIP Box Seat',price:e.price*2},{name:'Family Stand',price:Math.round(e.price*0.6)}];
    const isFollowingArtist=!!(e.artist&&following[e.artist]);
    return (
      <div style={{flex:'1 0 auto',paddingBottom:100,display:'flex',flexDirection:'column'}}>
        <div style={{position:'relative',height:300}}>
          <Fill style={ev.fill}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, var(--color-bg-base) 5%, rgba(0,0,0,0) 60%)'}}/>
          <div style={{position:'absolute',top:16,left:16}}>
            <button onClick={back} style={{...btnIconStyle,background:'rgba(0,0,0,.4)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.15)',color:'#fff'}}><ChevLeft/></button>
          </div>
          <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 16px'}}>
            <div style={{display:'inline-block',background:'var(--color-brand-primary)',color:'#fff',padding:'4px 12px',borderRadius:999,fontSize:11,fontWeight:700,marginBottom:8}}>{ev.catLabel}</div>
            <div style={{fontSize:26,fontWeight:800,lineHeight:1.2,letterSpacing:'-.4px',color:'#fff',textShadow:'0 2px 8px rgba(0,0,0,.6)'}}>{ev.title}</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:12}}>
              <button onClick={()=>showToast('Link copied to clipboard')} style={{background:'none',border:'none',cursor:'pointer',padding:0,color:'#fff',display:'flex',alignItems:'center',gap:6,filter:'drop-shadow(0 1px 3px rgba(0,0,0,0.7))'}}>
                <Share2 size={18}/><span style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.9)'}}>Share</span>
              </button>
              <button onClick={ev.toggle} style={{background:'none',border:'none',cursor:'pointer',padding:0,color:'#fff',display:'flex',alignItems:'center',gap:6,filter:'drop-shadow(0 1px 3px rgba(0,0,0,0.7))'}}>
                <span style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.9)'}}>Save</span><Heart fill={ev.heartFill} size={18}/>
              </button>
            </div>
          </div>
        </div>
        <div style={{padding:'18px 20px 0'}}>
          <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:18}}>
            {[{icon:'📅',val:ev.date},{icon:'🕐',val:ev.time},{icon:'📍',val:ev.venue}].map(({icon,val})=>(
              <div key={val} style={{display:'flex',alignItems:'center',gap:7,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:10,padding:'7px 12px'}}>
                <span>{icon}</span><span style={{fontSize:13,fontWeight:600,color:'var(--color-text-secondary)'}}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}><Star/><span style={{fontSize:14,fontWeight:700,color:'var(--color-text-primary)'}}>{ev.rate}</span><span style={{fontSize:13,color:'var(--color-text-secondary)'}}>({Math.floor(Math.random()*5000+500)} reviews)</span></div>
            <button onClick={()=>go('/media/'+e.id,{eventId:e.id})} style={{background:'none',border:'none',color:'var(--color-text-brand)',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>View media</button>
          </div>
          <div style={{fontSize:14.5,lineHeight:1.6,color:'var(--color-text-secondary)',marginBottom:20}}>{e.desc}</div>

          {/* Organizer card */}
          {(()=>{ const orgId=ORGANIZER_MAP[e.id]; const org=orgId&&ORGANIZERS[orgId]; if(!org)return null; return (
            <button onClick={()=>go('/organizer/'+orgId,{organizerId:orgId,eventId:e.id})} style={{width:'100%',display:'flex',alignItems:'center',gap:14,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:16,padding:14,cursor:'pointer',marginBottom:20,textAlign:'left',fontFamily:'inherit'}}>
              <div style={{width:46,height:46,borderRadius:14,background:`linear-gradient(135deg,${org.c1},${org.c2})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#fff',flexShrink:0}}>{org.name[0]}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,color:'var(--color-text-placeholder)',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:2}}>{org.type}</div>
                <div style={{fontSize:15,fontWeight:700,color:'var(--color-text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{org.name}</div>
                <div style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:1}}>{org.city} · Tap to see all events</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--color-text-placeholder)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
            </button>
          ); })()}

          {evIsCinema && (
            <>
              <div style={{fontSize:16,fontWeight:800,marginBottom:12,color:'var(--color-text-primary)'}}>Showtimes</div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:20}}>
                {SHOWTIMES.map(t=>(
                  <button key={t} onClick={()=>setShowtime(t)} style={{padding:'11px 16px',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',border:`1.5px solid ${showtime===t?'var(--color-brand-primary)':'var(--color-border-default)'}`,background:showtime===t?'var(--color-bg-brand-tint)':'var(--color-bg-surface)',color:showtime===t?'var(--color-text-brand)':'var(--color-text-primary)',fontFamily:'inherit'}}>{t}</button>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
                {[{k:'Runtime',val:e.runtime||'—'},{k:'Rating',val:e.cert||'—'},{k:'IMDb',val:e.imdb||'—'},{k:'Director',val:e.director||'—'}].map(({k,val})=>(
                  <div key={k} style={{background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:12,padding:'12px 14px'}}>
                    <div style={{fontSize:11,color:'var(--color-text-placeholder)',marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>{k}</div>
                    <div style={{fontSize:14,fontWeight:700,color:'var(--color-text-primary)'}}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:16,fontWeight:800,marginBottom:12,color:'var(--color-text-primary)'}}>Cast</div>
              <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:20}}>
                {CAST.map(c=>(
                  <div key={c} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                    <div style={{width:52,height:52,borderRadius:'50%',background:'var(--color-bg-subtle)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:'var(--color-text-secondary)'}}>{c.replace(/[^A-Za-z]/g,'')[0]}</div>
                    <span style={{fontSize:11,color:'var(--color-text-secondary)',textAlign:'center'}}>{c}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {evIsSports && (
            <>
              <div style={{background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:18,padding:18,marginBottom:20,textAlign:'center'}}>
                <div style={{fontSize:12,color:'var(--color-text-placeholder)',marginBottom:8}}>{e.league}</div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:24}}>
                  <div><div style={{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#1FB573,#0B5C4E)',margin:'0 auto 6px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'#fff'}}>{(e.teamA||'H')[0]}</div><div style={{fontSize:13,fontWeight:700,color:'var(--color-text-primary)'}}>{e.teamA}</div></div>
                  <div style={{fontSize:20,fontWeight:800,color:'var(--color-text-secondary)'}}>vs</div>
                  <div><div style={{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#B0202A,#1B2A6B)',margin:'0 auto 6px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'#fff'}}>{(e.teamB||'A')[0]}</div><div style={{fontSize:13,fontWeight:700,color:'var(--color-text-primary)'}}>{e.teamB}</div></div>
                </div>
              </div>
              <div style={{fontSize:16,fontWeight:800,marginBottom:12,color:'var(--color-text-primary)'}}>Choose your stand</div>
              <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:20}}>
                {stands.map(s=>(
                  <button key={s.name} onClick={()=>setStand(s.name)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:16,borderRadius:14,cursor:'pointer',border:`1.5px solid ${stand===s.name?'var(--color-brand-primary)':'var(--color-border-default)'}`,background:stand===s.name?'var(--color-bg-brand-tint)':'var(--color-bg-surface)',color:'var(--color-text-primary)',fontFamily:'inherit'}}>
                    <span style={{fontSize:15,fontWeight:600}}>{s.name}</span>
                    <span style={{fontSize:16,fontWeight:800,color:'var(--color-text-brand)'}}>{money(s.price)}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {evIsMusic && (
            <>
              <div style={{display:'flex',alignItems:'center',gap:14,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:16,padding:14,marginBottom:20}}>
                <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#F13C38,#7C2D8A)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'#fff',flexShrink:0}}>{(e.artist||'V')[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:700,color:'var(--color-text-primary)'}}>{e.artist}</div>
                  <div style={{fontSize:12.5,color:'var(--color-text-secondary)',marginTop:2}}>{e.listeners} monthly listeners</div>
                </div>
                <button onClick={()=>{ if(!e.artist)return; setFollowing(prev=>({...prev,[e.artist!]:!prev[e.artist!]})); showToast(following[e.artist!]?'Unfollowed':'Following '+e.artist); }} style={{padding:'9px 18px',borderRadius:20,fontSize:13,fontWeight:700,cursor:'pointer',border:'none',background:isFollowingArtist?'var(--color-bg-subtle)':'var(--color-brand-primary)',color:isFollowingArtist?'var(--color-text-primary)':'#fff',fontFamily:'inherit'}}>{isFollowingArtist?'Following':'Follow'}</button>
              </div>
              <div style={{display:'flex',gap:12,marginBottom:20}}>
                <button onClick={()=>go('/artist/'+e.id,{eventId:e.id})} style={{flex:1,padding:'12px',borderRadius:12,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',color:'var(--color-text-primary)',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Artist page</button>
                <button onClick={()=>go('/venue/'+e.id,{eventId:e.id})} style={{flex:1,padding:'12px',borderRadius:12,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',color:'var(--color-text-primary)',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Venue info</button>
              </div>
            </>
          )}

          <button onClick={()=>go('/reviews/'+e.id,{eventId:e.id})} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:14,padding:'14px 16px',cursor:'pointer',color:'var(--color-text-primary)',fontFamily:'inherit',marginBottom:20}}>
            <span style={{fontSize:15,fontWeight:600}}>Reviews</span>
            <div style={{display:'flex',alignItems:'center',gap:6}}><Star/><span style={{fontWeight:700,fontSize:14}}>{ev.rate}</span><ChevRight/></div>
          </button>
        </div>
        <div style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--color-bg-base)',borderTop:'1px solid var(--color-border-default)',padding:'14px 20px 18px',display:'flex',alignItems:'center',gap:16,zIndex:50}}>
          <div>
            <div style={{fontSize:11,color:'var(--color-text-placeholder)'}}>{evIsMusic?'from':evIsCinema?e.runtime+' · '+e.cert:e.league}</div>
            <div style={{fontSize:20,fontWeight:800,color:'var(--color-text-brand)'}}>{evIsMusic?money(e.price):evIsCinema?money(e.price):money(e.price)}</div>
          </div>
          <button onClick={()=>go('/booking/tickets/'+e.id,{eventId:e.id})} style={{flex:1,background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
            {evIsCinema?'Select seats':evIsSports?'Choose tickets':'Secure your spot'}
          </button>
        </div>
      </div>
    );
  };

  const renderOrganizer = () => {
    const orgId = params.organizerId || '';
    const org = ORGANIZERS[orgId];
    if(!org) return <div style={{padding:20,color:'var(--color-text-primary)'}}>Organizer not found.</div>;
    const orgEvents = EVENTS.filter(e=>ORGANIZER_MAP[e.id]===orgId).map(e=>vmEvent(e,saved,go,toggleSave));
    return (
      <div style={{paddingBottom:40}}>
        {/* Header gradient */}
        <div style={{position:'relative',height:220,background:`linear-gradient(150deg,${org.c1},${org.c2})`,overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.05),rgba(0,0,0,.6))'}}/>
          <button onClick={back} style={{position:'absolute',top:16,left:16,...btnIconStyle,background:'rgba(0,0,0,.35)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.15)',color:'#fff'}}><ChevLeft/></button>
        </div>

        {/* Avatar pulls up over the header */}
        <div style={{padding:'0 20px',marginTop:-36}}>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:12}}>
            <div style={{width:72,height:72,borderRadius:20,background:`linear-gradient(135deg,${org.c1},${org.c2})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:800,color:'#fff',border:'3px solid var(--color-bg-base)',flexShrink:0}}>{org.name[0]}</div>
            <span style={{display:'inline-block',background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',color:'var(--color-text-secondary)',padding:'5px 12px',borderRadius:999,fontSize:12,fontWeight:700,marginBottom:4}}>{org.type}</span>
          </div>
          <div style={{fontSize:22,fontWeight:800,letterSpacing:'-.4px',color:'var(--color-text-primary)',lineHeight:1.15}}>{org.name}</div>
          <div style={{fontSize:13,color:'var(--color-text-secondary)',marginTop:4,marginBottom:16}}>{org.city}</div>
        </div>

        <div style={{padding:'0 20px 0'}}>
          {/* About */}
          <div style={{fontSize:14.5,lineHeight:1.65,color:'var(--color-text-secondary)',marginBottom:24}}>{org.desc}</div>

          {/* Stats row */}
          <div style={{display:'flex',gap:12,marginBottom:24}}>
            {[{label:'Events',val:String(orgEvents.length)},{label:'City',val:org.city},{label:'Type',val:org.type}].map(s=>(
              <div key={s.label} style={{flex:1,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:14,padding:'12px 10px',textAlign:'center'}}>
                <div style={{fontSize:15,fontWeight:800,color:'var(--color-text-primary)'}}>{s.val}</div>
                <div style={{fontSize:11,color:'var(--color-text-secondary)',marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming events */}
          <div style={{fontSize:17,fontWeight:800,marginBottom:14,color:'var(--color-text-primary)'}}>
            {orgEvents.length ? 'Upcoming Events' : 'No upcoming events'}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {orgEvents.map(ev=>(
              <div key={ev.id} onClick={ev.on} style={{display:'flex',gap:14,alignItems:'center',cursor:'pointer',background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:18,padding:12}}>
                <div style={{position:'relative',width:72,height:72,borderRadius:14,overflow:'hidden',flexShrink:0}}><Fill style={ev.fill}/></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--color-text-primary)'}}>{ev.title}</div>
                  <div style={{fontSize:12.5,color:'var(--color-text-secondary)',marginTop:3}}>{ev.venue}</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:6}}>
                    <span style={{fontSize:13,fontWeight:700,color:'var(--color-text-brand)'}}>from {ev.priceLabel}</span>
                    <span style={{fontSize:12,color:'var(--color-text-secondary)'}}>{ev.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderArtist = () => {
    const e=curEvent; const ev=curVM;
    return (
      <div style={{flex:'1 0 auto',paddingBottom:96,display:'flex',flexDirection:'column'}}>
        <div style={{position:'relative',height:220}}>
          <Fill style={ev.fill}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, rgba(0,0,0,.3), var(--color-bg-base))'}}/>
          <button onClick={back} style={{position:'absolute',top:16,left:16,...btnIconStyle,background:'rgba(0,0,0,.4)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.15)',color:'#fff'}}><ChevLeft/></button>
        </div>
        <div style={{padding:'0 20px 20px',marginTop:-40}}>
          <div style={{width:84,height:84,borderRadius:'50%',background:'linear-gradient(135deg,#F13C38,#7C2D8A)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,fontWeight:800,color:'#fff',border:'3px solid var(--color-bg-base)',marginBottom:12,position:'relative',zIndex:2}}>{(e.artist||'V')[0]}</div>
          <div style={{fontSize:24,fontWeight:800,letterSpacing:'-.4px',color:'var(--color-text-primary)'}}>{e.artist}</div>
          <div style={{fontSize:13.5,color:'var(--color-text-secondary)',marginTop:4}}>{e.listeners} monthly listeners</div>
          <div style={{fontSize:14.5,lineHeight:1.6,color:'var(--color-text-secondary)',marginTop:14}}>With a sound that fills arenas and a reputation for unforgettable live shows, {e.artist} has become one of the most sought-after acts touring today. Expect a night of pure energy.</div>
          <div style={{display:'flex',gap:12,marginTop:18}}>
            {[{label:'Instagram',d:'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M17.5 6.5v0'},{label:'Twitter',d:'M22 5.8a8 8 0 0 1-2.3.6'},{label:'Spotify',d:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z'}].map(s=>(
              <button key={s.label} onClick={()=>showToast('Opening '+s.label)} style={{flex:1,padding:'10px',borderRadius:12,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',color:'var(--color-text-secondary)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{s.label}</button>
            ))}
          </div>
          <div style={{fontSize:17,fontWeight:800,marginTop:26,marginBottom:14,color:'var(--color-text-primary)'}}>Upcoming shows</div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {events.filter(ev2=>ev2.cat===e.cat).slice(0,4).map(ev2=>(
              <div key={ev2.id} onClick={ev2.on} style={{display:'flex',gap:12,alignItems:'center',cursor:'pointer',background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:14,padding:'12px 14px'}}>
                <div style={{position:'relative',width:52,height:52,borderRadius:12,overflow:'hidden',flexShrink:0}}><Fill style={ev2.fill}/></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--color-text-primary)'}}>{ev2.title}</div>
                  <div style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:2}}>{ev2.venue} · {ev2.date}</div>
                </div>
                <span style={{fontSize:14,fontWeight:800,color:'var(--color-text-brand)',flexShrink:0}}>{ev2.priceLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderVenue = () => {
    const e=curEvent;
    return (
      <div style={{flex:'1 0 auto',padding:'20px 20px 0',display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
          <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
          <span style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>{e.venue}</span>
        </div>
        <div style={{position:'relative',height:200,borderRadius:20,overflow:'hidden',marginBottom:20}}>
          <Fill style={curVM.fill}/>
        </div>
        <div style={{display:'flex',gap:10,marginBottom:20}}>
          {[{label:'Directions',icon:'M12 21s-7-5-7-11a7 7 0 1 1 14 0c0 6-7 11-7 11z'},{label:'Call',icon:'M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z'},{label:'Website',icon:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18'}].map(a=>(
            <button key={a.label} onClick={()=>showToast('Opening '+a.label)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'14px 8px',borderRadius:14,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',color:'var(--color-text-secondary)',cursor:'pointer',fontFamily:'inherit'}}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={a.icon}/></svg>
              <span style={{fontSize:12,fontWeight:700}}>{a.label}</span>
            </button>
          ))}
        </div>
        <div style={{background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:16,padding:'16px 18px'}}>
          <div style={{fontSize:16,fontWeight:800,marginBottom:8,color:'var(--color-text-primary)'}}>Address</div>
          <div style={{fontSize:14,color:'var(--color-text-secondary)',lineHeight:1.5}}>{e.venue}, {e.city}, UK</div>
          <div style={{fontSize:16,fontWeight:800,margin:'18px 0 8px',color:'var(--color-text-primary)'}}>Opening hours</div>
          <div style={{fontSize:14,color:'var(--color-text-secondary)',lineHeight:1.5}}>Box office: 10:00 – 22:00 on event days</div>
          <div style={{fontSize:16,fontWeight:800,margin:'18px 0 8px',color:'var(--color-text-primary)'}}>Venue policy</div>
          <div style={{fontSize:14,color:'var(--color-text-secondary)',lineHeight:1.6}}>Doors open 90 minutes before showtime. No professional cameras. Over 14s only unless accompanied.</div>
        </div>
      </div>
    );
  };

  const renderMedia = () => {
    const ev=curVM;
    return (
      <div style={{flex:'1 0 auto',padding:20,display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
          <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
          <span style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>Event media</span>
        </div>
        <div style={{position:'relative',borderRadius:20,overflow:'hidden',height:420,boxShadow:'var(--shadow)'}}>
          <Fill style={ev.fill}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, rgba(0,0,0,.8), rgba(0,0,0,0) 50%)'}}/>
          <div style={{position:'absolute',left:18,right:18,bottom:18,color:'#fff'}}>
            <span style={{fontSize:11,fontWeight:700,background:'var(--color-brand-primary)',padding:'4px 11px',borderRadius:999}}>{ev.catLabel}</span>
            <div style={{fontSize:24,fontWeight:800,marginTop:10,lineHeight:1.1}}>{ev.title}</div>
            <div style={{fontSize:13,opacity:.85,marginTop:6}}>{ev.venue} · {ev.date}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:12,marginTop:18}}>
          <button onClick={()=>showToast('Saved to your files')} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:9,background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:14,padding:15,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12 M7 11l5 5 5-5 M4 21h16"/></svg>Download
          </button>
          <button onClick={()=>showToast('Link copied to clipboard')} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:9,background:'var(--color-bg-surface)',color:'var(--color-text-primary)',border:'1px solid var(--color-border-default)',borderRadius:14,padding:15,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.6 13.5l6.8 4 M15.4 6.5l-6.8 4"/></svg>Share
          </button>
        </div>
        <div style={{marginTop:22,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:16,padding:16}}>
          <div style={{fontSize:14,fontWeight:800,marginBottom:8,color:'var(--color-text-primary)'}}>Terms & conditions</div>
          <div style={{fontSize:13,lineHeight:1.6,color:'var(--color-text-secondary)'}}>This artwork is provided for personal use only. Resale or commercial reproduction of Brit Vibe event media is prohibited. All event imagery remains the property of the respective rights holders.</div>
        </div>
      </div>
    );
  };

  const renderTickets = () => {
    const ev=curVM;
    return (
      <div style={{flex:'1 0 auto',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'20px 20px 0',display:'flex',alignItems:'center',gap:14}}>
          <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
          <div style={{minWidth:0}}>
            <div style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>Tickets</div>
            <div style={{fontSize:12.5,color:'var(--color-text-secondary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.title}</div>
          </div>
        </div>
        <div style={{flex:1,padding:'22px 20px 16px'}}>
          <div style={{background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:16,padding:16,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
            <div><div style={{fontSize:15,fontWeight:700,color:'var(--color-text-primary)'}}>Quantity</div><div style={{fontSize:12.5,color:'var(--color-text-secondary)',marginTop:2}}>Up to 10 per order</div></div>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:38,height:38,borderRadius:'50%',border:'1.5px solid var(--color-border-strong)',background:'none',color:'var(--color-text-primary)',fontSize:20,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>−</button>
              <span style={{fontSize:20,fontWeight:800,width:22,textAlign:'center',color:'var(--color-text-primary)'}}>{qty}</span>
              <button onClick={()=>setQty(q=>Math.min(10,q+1))} style={{width:38,height:38,borderRadius:'50%',border:'none',background:'var(--color-brand-primary)',color:'#fff',fontSize:20,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>+</button>
            </div>
          </div>
          <div style={{fontSize:17,fontWeight:800,marginBottom:14,color:'var(--color-text-primary)'}}>Choose ticket type</div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {TIERS.map(t=>{ const price=Math.round(curEvent.price*t.mult); const sel=tier===t.id; return (
              <button key={t.id} onClick={()=>setTier(t.id)} style={{width:'100%',textAlign:'left',display:'flex',alignItems:'center',gap:14,padding:16,borderRadius:16,cursor:'pointer',background:sel?'var(--color-bg-brand-tint)':'var(--color-bg-surface)',border:`1.5px solid ${sel?'var(--color-brand-primary)':'var(--color-border-default)'}`,color:'var(--color-text-primary)',fontFamily:'inherit'}}>
                <span style={{width:22,height:22,borderRadius:'50%',flexShrink:0,border:`2px solid ${sel?'var(--color-brand-primary)':'var(--color-border-strong)'}`,background:sel?'var(--color-brand-primary)':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>{sel&&<Check/>}</span>
                <span style={{flex:1,minWidth:0}}><span style={{display:'block',fontSize:15.5,fontWeight:700}}>{t.name}</span><span style={{display:'block',fontSize:12.5,color:'var(--color-text-secondary)',marginTop:3}}>{t.desc}</span></span>
                <span style={{fontSize:16,fontWeight:800,color:'var(--color-text-brand)',flexShrink:0}}>{money(price)}</span>
              </button>
            ); })}
          </div>
        </div>
        <div style={{position:'sticky',bottom:0,background:'var(--color-bg-base)',borderTop:'1px solid var(--color-border-default)',padding:'14px 20px 18px',display:'flex',alignItems:'center',gap:16}}>
          <div style={{flexShrink:0}}><div style={{fontSize:11,color:'var(--color-text-placeholder)'}}>Subtotal</div><div style={{fontSize:19,fontWeight:800,color:'var(--color-text-brand)'}}>{money2(unit*qty)}</div></div>
          <button onClick={()=>{ if(!tier){showToast('Select a ticket type');return;} go('/booking/seats'); }} style={{flex:1,background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Choose seats</button>
        </div>
      </div>
    );
  };

  const renderSeats = () => {
    const rows='ABCDEFG'.split('').map(r=>({row:r,seats:[1,2,3,4,5,6,7,8,9,10].map(c=>{const code=r+c; const reserved=!!SEAT_RESERVED[code]; const sel=seats.includes(code); return {code,reserved,sel}; })}));
    return (
      <div style={{flex:'1 0 auto',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'20px 20px 0',display:'flex',alignItems:'center',gap:14}}>
          <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
          <div><div style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>Select seats</div><div style={{fontSize:12.5,color:'var(--color-text-secondary)'}}>Choose {qty} seat(s)</div></div>
        </div>
        <div style={{flex:1,padding:'26px 16px 16px',display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{width:'80%',height:30,borderRadius:'0 0 60px 60px',background:'linear-gradient(to bottom,var(--color-bg-subtle),transparent)',borderBottom:'2px solid var(--color-brand-primary)',display:'flex',alignItems:'flex-start',justifyContent:'center',marginBottom:30}}>
            <span style={{fontSize:11,fontWeight:700,letterSpacing:3,color:'var(--color-text-secondary)'}}>STAGE</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {rows.map(({row,seats:rowSeats})=>(
              <div key={row} style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:'var(--color-text-placeholder)',width:14}}>{row}</span>
                <div style={{display:'flex',gap:6}}>
                  {rowSeats.map(s=>(
                    <button key={s.code} onClick={()=>{ if(s.reserved)return; setSeats(prev=>{ if(prev.includes(s.code))return prev.filter(x=>x!==s.code); if(prev.length>=qty){showToast(`You've selected ${qty} seat(s)`);return prev;} return [...prev,s.code]; }); }} style={{width:26,height:26,borderRadius:7,border:`1px solid ${s.sel?'var(--color-brand-primary)':'var(--color-border-default)'}`,background:s.sel?'var(--color-brand-primary)':s.reserved?'transparent':'var(--color-bg-subtle)',color:s.sel?'#fff':'var(--color-text-placeholder)',fontSize:11,fontWeight:700,cursor:s.reserved?'not-allowed':'pointer',opacity:s.reserved?0.45:1,display:'flex',alignItems:'center',justifyContent:'center',padding:0,fontFamily:'inherit'}}>{s.reserved?'×':''}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:18,marginTop:28}}>
            {[{c:'var(--color-bg-subtle)',b:'var(--color-border-default)',l:'Available'},{c:'var(--color-brand-primary)',b:'var(--color-brand-primary)',l:'Selected'},{c:'transparent',b:'var(--color-border-default)',l:'Reserved'}].map(x=>(
              <div key={x.l} style={{display:'flex',alignItems:'center',gap:7}}>
                <span style={{width:18,height:18,borderRadius:5,background:x.c,border:`1px solid ${x.b}`,display:'block'}}/>
                <span style={{fontSize:12,color:'var(--color-text-secondary)'}}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{position:'sticky',bottom:0,background:'var(--color-bg-base)',borderTop:'1px solid var(--color-border-default)',padding:'14px 20px 18px'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:12}}>
            <span style={{color:'var(--color-text-secondary)'}}>Selected ({seats.length}/{qty})</span>
            <span style={{fontWeight:700,color:'var(--color-text-primary)'}}>{seats.length?seats.join(', '):'Tap to choose'}</span>
          </div>
          <button onClick={()=>{ if(!seats.length){showToast('Pick your seats');return;} go('/booking/summary'); }} style={{width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Confirm seats</button>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const ev=curVM;
    return (
      <div style={{flex:'1 0 auto',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'20px 20px 0',display:'flex',alignItems:'center',gap:14}}>
          <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
          <span style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>Order summary</span>
        </div>
        <div style={{flex:1,padding:'22px 20px 16px'}}>
          <div style={{display:'flex',gap:14,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:18,padding:14,marginBottom:20}}>
            <div style={{position:'relative',width:78,height:78,borderRadius:14,overflow:'hidden',flexShrink:0}}><Fill style={ev.fill}/></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:16,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--color-text-primary)'}}>{ev.title}</div>
              <div style={{fontSize:12.5,color:'var(--color-text-secondary)',marginTop:3}}>{ev.venue}</div>
              <div style={{fontSize:12.5,color:'var(--color-text-secondary)',marginTop:1}}>{ev.date} · {ev.time}</div>
              <div style={{display:'inline-block',fontSize:11.5,fontWeight:700,color:'var(--color-text-brand)',background:'var(--color-bg-brand-tint)',padding:'3px 9px',borderRadius:999,marginTop:7}}>{selTier?.name||'No ticket'} · {seats.length?seats.join(', '):'GA'}</div>
            </div>
          </div>
          <div style={{background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:18,padding:18}}>
            {[{k:`Subtotal · ${qty} ticket(s) (excl. VAT)`,val:money2(subtotalExVat)},{k:'VAT (20%)',val:money2(vat)}].map(li=>(
              <div key={li.k} style={{display:'flex',justifyContent:'space-between',fontSize:14,marginBottom:13}}>
                <span style={{color:'var(--color-text-secondary)'}}>{li.k}</span>
                <span style={{fontWeight:600,color:'var(--color-text-primary)'}}>{li.val}</span>
              </div>
            ))}
            {coupon && <div style={{display:'flex',justifyContent:'space-between',fontSize:14,marginBottom:13}}><span style={{color:'var(--color-status-success)'}}>Discount (VIBE10) (excl. VAT)</span><span style={{fontWeight:600,color:'var(--color-status-success)'}}>−{money2(discountExVat)}</span></div>}
            <div style={{height:1,background:'var(--color-border-default)',margin:'4px 0 14px'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:16,fontWeight:800,color:'var(--color-text-primary)'}}>Total</span>
              <span style={{fontSize:20,fontWeight:800,color:'var(--color-text-brand)'}}>{money2(total)}</span>
            </div>
          </div>
          <button onClick={()=>setCoupon(c=>{ const next=!c; showToast(next?'VIBE10 applied — 10% off':'Coupon removed'); return next; })} style={{marginTop:16,width:'100%',display:'flex',alignItems:'center',gap:12,background:'var(--color-bg-surface)',border:'1.5px dashed var(--color-border-strong)',borderRadius:14,padding:15,cursor:'pointer',color:'var(--color-text-primary)',fontFamily:'inherit'}}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--color-brand-primary)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 6 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-6z M9 7v10"/></svg>
            <span style={{flex:1,textAlign:'left',fontSize:14.5,fontWeight:600}}>{coupon?'Promo code VIBE10 applied':'Add a promo code'}</span>
            {coupon && <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--color-status-success)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>}
          </button>
        </div>
        <div style={{position:'sticky',bottom:0,background:'var(--color-bg-base)',borderTop:'1px solid var(--color-border-default)',padding:'14px 20px 18px',display:'flex',alignItems:'center',gap:16}}>
          <div style={{flexShrink:0}}><div style={{fontSize:11,color:'var(--color-text-placeholder)'}}>Total</div><div style={{fontSize:19,fontWeight:800,color:'var(--color-text-brand)'}}>{money2(total)}</div></div>
          <button onClick={()=>go('/booking/checkout')} style={{flex:1,background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Proceed to checkout</button>
        </div>
      </div>
    );
  };

  const renderCheckout = () => {
    const ev=curVM;
    const timerBanner: React.CSSProperties = timeUp?{background:'var(--color-bg-brand-tint)',color:'var(--color-status-error)'}:timeLow?{background:'rgba(245,158,11,.16)',color:'var(--color-status-warning)'}:{background:'var(--color-bg-brand-tint)',color:'var(--color-text-brand)'};
    return (
      <div style={{flex:'1 0 auto',display:'flex',flexDirection:'column'}}>
        <div style={{...timerBanner,position:'sticky',top:0,zIndex:10,padding:'13px 20px',display:'flex',alignItems:'center',justifyContent:'center',gap:9}}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 2 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"/></svg>
          <span style={{fontSize:13.5,fontWeight:700}}>{timeUp?'Session expired — seats released':`Seats held · ${timerLabel} remaining`}</span>
        </div>
        <div style={{padding:'18px 20px 0',display:'flex',alignItems:'center',gap:14}}>
          <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
          <span style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>Checkout</span>
        </div>
        <div style={{flex:1,padding:'22px 20px 16px'}}>
          <div style={{fontSize:13,fontWeight:700,color:'var(--color-text-placeholder)',textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Payment method</div>
          <button onClick={()=>go('/payment/method')} style={{width:'100%',display:'flex',alignItems:'center',gap:13,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:16,padding:16,cursor:'pointer',color:'var(--color-text-primary)',marginBottom:22,fontFamily:'inherit'}}>
            <div style={{width:42,height:42,borderRadius:11,background:'var(--color-bg-brand-tint)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--color-brand-primary)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18v10H3z M3 11h18"/></svg>
            </div>
            <span style={{flex:1,textAlign:'left',fontSize:15,fontWeight:700}}>{PML[payMethod]||'Choose a method'}</span>
            <span style={{fontSize:13,fontWeight:700,color:'var(--color-text-brand)'}}>Change</span>
          </button>
          <div style={{background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:18,padding:18}}>
            <div style={{display:'flex',gap:13,marginBottom:16}}>
              <div style={{position:'relative',width:56,height:56,borderRadius:12,overflow:'hidden',flexShrink:0}}><Fill style={ev.fill}/></div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14.5,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--color-text-primary)'}}>{ev.title}</div>
                <div style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:3}}>{selTier?.name||'No ticket'} · {qty} ticket(s)</div>
                <div style={{fontSize:12,color:'var(--color-text-secondary)'}}>Seats {seats.length?seats.join(', '):'GA'}</div>
              </div>
            </div>
            <div style={{height:1,background:'var(--color-border-default)',marginBottom:14}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:15,fontWeight:800,color:'var(--color-text-primary)'}}>Total</span>
              <span style={{fontSize:19,fontWeight:800,color:'var(--color-text-brand)'}}>{money2(total)}</span>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:22,color:'var(--color-text-placeholder)'}}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z M9 12l2 2 4-4"/></svg>
            <span style={{fontSize:12.5}}>Secured by 256-bit SSL · PCI-DSS compliant</span>
          </div>
        </div>
        <div style={{position:'sticky',bottom:0,background:'var(--color-bg-base)',borderTop:'1px solid var(--color-border-default)',padding:'14px 20px 18px'}}>
          <button onClick={()=>go('/payment/method')} style={{width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Confirm & pay {money2(total)}</button>
        </div>
      </div>
    );
  };

  const renderPayMethod = () => (
    <div style={{flex:'1 0 auto',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'20px 20px 0',display:'flex',alignItems:'center',gap:14}}>
        <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
        <span style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>Payment method</span>
      </div>
      <div style={{flex:1,padding:'22px 20px 16px',display:'flex',flexDirection:'column',gap:12}}>
        {PAYMENT_METHODS.map(m=>{ const sel=payMethod===m.id; return (
          <button key={m.id} onClick={()=>setPayMethod(m.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:13,padding:14,borderRadius:16,cursor:'pointer',background:sel?'var(--color-bg-brand-tint)':'var(--color-bg-surface)',border:`1.5px solid ${sel?'var(--color-brand-primary)':'var(--color-border-default)'}`,color:'var(--color-text-primary)',fontFamily:'inherit'}}>
            <span style={{width:44,height:44,borderRadius:12,background:m.bg,color:m.fg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'1px solid var(--color-border-default)'}}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={m.gl}/></svg>
            </span>
            <span style={{flex:1,textAlign:'left',minWidth:0}}><span style={{display:'block',fontSize:15,fontWeight:700}}>{m.name}</span><span style={{display:'block',fontSize:12.5,color:'var(--color-text-secondary)',marginTop:2}}>{m.sub}</span></span>
            <span style={{width:22,height:22,borderRadius:'50%',flexShrink:0,border:`2px solid ${sel?'var(--color-brand-primary)':'var(--color-border-strong)'}`,background:sel?'var(--color-brand-primary)':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>{sel&&<Check/>}</span>
          </button>
        ); })}
      </div>
      <div style={{position:'sticky',bottom:0,background:'var(--color-bg-base)',borderTop:'1px solid var(--color-border-default)',padding:'14px 20px 18px'}}>
        <button onClick={()=>{ if(payMethod==='card')go('/payment/card'); else if(payMethod==='apple'||payMethod==='google')go('/payment/apple-pay'); else{ showToast('Processing…'); navTimer.current=setTimeout(()=>go('/payment/result',{},true),900); } }} style={{width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Continue</button>
      </div>
    </div>
  );

  const renderCard = () => (
    <div style={{flex:'1 0 auto',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'20px 20px 0',display:'flex',alignItems:'center',gap:14}}>
        <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
        <span style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>Card details</span>
      </div>
      <div style={{flex:1,padding:'22px 20px 16px'}}>
        <div style={{position:'relative',height:200,borderRadius:20,overflow:'hidden',background:'linear-gradient(135deg,#F13C38,#7C2D8A)',padding:22,color:'#fff',boxShadow:'var(--shadow)',marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{width:46,height:34,borderRadius:7,background:'linear-gradient(135deg,#FFD68A,#D4A537)'}}/>
            <span style={{fontSize:16,fontWeight:800,fontStyle:'italic'}}>VISA</span>
          </div>
          <div style={{fontSize:21,fontWeight:600,letterSpacing:2,marginTop:26}}>{cardNum||'•••• •••• •••• ••••'}</div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:22,fontSize:12}}>
            <div><div style={{opacity:.7,fontSize:9,letterSpacing:1}}>CARD HOLDER</div><div style={{fontWeight:700,marginTop:3}}>{(cardName||'YOUR NAME').toUpperCase()}</div></div>
            <div><div style={{opacity:.7,fontSize:9,letterSpacing:1}}>EXPIRES</div><div style={{fontWeight:700,marginTop:3}}>{cardExp||'MM/YY'}</div></div>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:15}}>
          <label style={lblStyle}>Cardholder name<input value={cardName} onChange={e=>setCardName(e.target.value)} placeholder="Alex Sterling" style={fieldStyle}/></label>
          <label style={lblStyle}>Card number<input value={cardNum} onChange={e=>{ let v=e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim(); setCardNum(v); }} inputMode="numeric" placeholder="1234 5678 9012 3456" style={fieldStyle}/></label>
          <div style={{display:'flex',gap:14}}>
            <label style={{...lblStyle,flex:1}}>Expiry<input value={cardExp} onChange={e=>{ let v=e.target.value.replace(/\D/g,'').slice(0,4).replace(/(.{2})(.+)/,'$1/$2'); setCardExp(v); }} inputMode="numeric" placeholder="MM/YY" style={fieldStyle}/></label>
            <label style={{...lblStyle,flex:1}}>CVV<input value={cardCvv} onChange={e=>setCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))} inputMode="numeric" placeholder="123" style={fieldStyle}/></label>
          </div>
        </div>
        <button onClick={()=>setSaveCard(s=>!s)} style={{marginTop:18,display:'flex',alignItems:'center',gap:11,background:'none',border:'none',cursor:'pointer',padding:0,color:'var(--color-text-primary)',fontFamily:'inherit'}}>
          <span style={{width:22,height:22,borderRadius:7,border:`2px solid ${saveCard?'var(--color-brand-primary)':'var(--color-border-strong)'}`,background:saveCard?'var(--color-brand-primary)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{saveCard&&<Check size={13} strokeWidth={3}/>}</span>
          <span style={{fontSize:14,fontWeight:600}}>Save card for next time</span>
        </button>
      </div>
      <div style={{position:'sticky',bottom:0,background:'var(--color-bg-base)',borderTop:'1px solid var(--color-border-default)',padding:'14px 20px 18px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:7,color:'var(--color-status-success)',marginBottom:12}}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 11V8a6 6 0 1 1 12 0v3 M5 11h14v9H5z"/></svg>
          <span style={{fontSize:12,fontWeight:600}}>Your details are encrypted</span>
        </div>
        <button onClick={()=>{ setCardLoading(true); navTimer.current=setTimeout(()=>{ setCardLoading(false); go('/payment/result',{},true); },2000); }} style={{width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:16,fontSize:16,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,fontFamily:'inherit'}}>
          {cardLoading&&<span style={{width:18,height:18,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block'}}/>}
          Pay {money2(total)}
        </button>
      </div>
    </div>
  );

  const renderApplePay = () => (
    <div style={{flex:'1 0 auto',position:'relative',background:'rgba(0,0,0,.55)',display:'flex',alignItems:'flex-end'}}>
      <div style={{width:'100%',background:'var(--color-bg-surface)',borderRadius:'24px 24px 0 0',padding:'22px 22px 28px',animation:'sheetUp .35s ease'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <span style={{display:'flex',alignItems:'center',gap:8,fontSize:18,fontWeight:800,color:'var(--color-text-primary)'}}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="var(--color-text-primary)" stroke="none"><path d="M16 4c-1 0-2 .7-2.6 1.5-.5.7-1 1.8-.8 2.8 1 .1 2-.6 2.6-1.4.5-.7.9-1.8.8-2.9z M18 12c0-2 1.6-3 1.7-3-1-1.4-2.4-1.6-3-1.6-1.3-.1-2.5.7-3.1.7s-1.6-.7-2.7-.7c-1.4 0-2.6.8-3.3 2-1.4 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.5 2 1-.1 1.4-.6 2.6-.6s1.5.6 2.6.6 1.7-1 2.4-2c.5-.7.9-1.5 1.1-2.3-1.6-.6-2.3-2-2.3-3z"/></svg>Pay
          </span>
          <button onClick={back} style={{width:32,height:32,borderRadius:'50%',border:'none',background:'var(--color-bg-subtle)',color:'var(--color-text-primary)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><CloseIcon/></button>
        </div>
        <div style={{background:'var(--color-bg-base)',border:'1px solid var(--color-border-default)',borderRadius:16,padding:16,marginBottom:18}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><span style={{fontSize:13,color:'var(--color-text-secondary)'}}>Pay Brit Vibe</span><span style={{fontSize:19,fontWeight:800,color:'var(--color-text-primary)'}}>{money2(total)}</span></div>
          <div style={{height:1,background:'var(--color-border-default)',marginBottom:14}}/>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:38,height:26,borderRadius:6,background:'linear-gradient(135deg,#F13C38,#7C2D8A)'}}/>
            <div style={{flex:1}}><div style={{fontSize:13.5,fontWeight:700,color:'var(--color-text-primary)'}}>Visa •••• 4291</div><div style={{fontSize:11.5,color:'var(--color-text-secondary)'}}>Default card</div></div>
          </div>
        </div>
        {!apVerify&&!apSuccess&&(
          <>
            <button onClick={()=>{ setApVerify(true); navTimer.current=setTimeout(()=>{ setApVerify(false); setApSuccess(true); navTimer2.current=setTimeout(()=>{ setApSuccess(false); go('/payment/result',{},true); },1200); },1600); }} style={{width:'100%',background:'#000',color:'#fff',border:'none',borderRadius:14,padding:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Confirm with Face ID</button>
            <div style={{textAlign:'center',fontSize:12,color:'var(--color-text-placeholder)',marginTop:12}}>Double-click to pay · Demo</div>
          </>
        )}
        {apVerify&&(
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,padding:'6px 0'}}>
            <div style={{width:54,height:54,borderRadius:'50%',border:'3px solid var(--color-bg-subtle)',borderTopColor:'var(--color-text-primary)',animation:'spin .8s linear infinite'}}/>
            <span style={{fontSize:14,fontWeight:600,color:'var(--color-text-secondary)'}}>Verifying with Face ID…</span>
          </div>
        )}
        {apSuccess&&(
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,padding:'6px 0'}}>
            <div style={{width:54,height:54,borderRadius:'50%',background:'var(--color-status-success)',display:'flex',alignItems:'center',justifyContent:'center',animation:'pop .4s ease'}}><Check size={28} strokeWidth={2.6}/></div>
            <span style={{fontSize:14,fontWeight:700,color:'var(--color-status-success)'}}>Payment authorised</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderResult = () => {
    const ev=curVM;
    return (
      <div style={{flex:'1 0 auto',position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'30px 24px',textAlign:'center'}}>
        <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
          {confettiPieces.map((c,i)=>(
            <div key={i} style={{position:'absolute',top:-24,left:`${c.left}%`,width:c.w,height:c.w*1.7,background:c.color,borderRadius:2,animation:`confetti ${c.dur}s linear ${c.delay}s infinite`}}/>
          ))}
        </div>
        <div style={{width:96,height:96,borderRadius:'50%',background:'var(--color-status-success)',display:'flex',alignItems:'center',justifyContent:'center',animation:'pop .5s ease',zIndex:2,boxShadow:'0 14px 44px rgba(34,197,94,.4)'}}><Check size={48} strokeWidth={2.6}/></div>
        <div style={{fontSize:26,fontWeight:800,marginTop:24,letterSpacing:'-.4px',zIndex:2,color:'var(--color-text-primary)'}}>You're going! 🎉</div>
        <div style={{fontSize:15,color:'var(--color-text-secondary)',marginTop:8,lineHeight:1.5,maxWidth:300,zIndex:2}}>Your booking is confirmed. We've sent the tickets to your account.</div>
        <div style={{zIndex:2,width:'100%',marginTop:26,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:18,padding:18,textAlign:'left'}}>
          <div style={{display:'flex',gap:13}}>
            <div style={{position:'relative',width:56,height:56,borderRadius:12,overflow:'hidden',flexShrink:0}}><Fill style={ev.fill}/></div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--color-text-primary)'}}>{ev.title}</div><div style={{fontSize:12.5,color:'var(--color-text-secondary)',marginTop:3}}>{ev.venue} · {ev.date}</div></div>
          </div>
          <div style={{height:1,background:'var(--color-border-default)',margin:'14px 0'}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}><span style={{color:'var(--color-text-secondary)'}}>Order no.</span><span style={{fontWeight:700,color:'var(--color-text-primary)'}}>{orderNo}</span></div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginTop:8}}><span style={{color:'var(--color-text-secondary)'}}>Total paid</span><span style={{fontWeight:700,color:'var(--color-text-brand)'}}>{money2(total)}</span></div>
        </div>
        <div style={{zIndex:2,width:'100%',marginTop:22,display:'flex',flexDirection:'column',gap:12}}>
          <button onClick={()=>go('/ticket/'+(params.eventId||'e1'),{eventId:params.eventId||'e1'})} style={{width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>View my ticket</button>
          <button onClick={()=>go('/home',{},true)} style={{width:'100%',background:'none',border:'none',color:'var(--color-text-primary)',fontSize:15,fontWeight:600,cursor:'pointer',padding:6,fontFamily:'inherit'}}>Back to home</button>
        </div>
      </div>
    );
  };

  const renderQR = () => {
    const ev=curVM;
    const TI: Record<string,{c:string,label:string,sub:string}> = {
      valid:{c:'var(--color-status-success)',label:'Valid ticket',sub:'Present this QR code at the gate'},
      used:{c:'var(--color-status-warning)',label:'Already checked in',sub:'This ticket was scanned at 20:14'},
      expired:{c:'var(--color-status-error)',label:'Ticket expired',sub:'This event has already taken place'},
      duplicate:{c:'var(--color-status-error)',label:'Duplicate detected',sub:'This QR has been flagged for review'}
    };
    const info=TI[tStatus];
    return (
      <div style={{padding:'20px 20px 96px'}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18}}>
          <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
          <span style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>My ticket</span>
        </div>
        <div style={{display:'flex',gap:4,background:'var(--color-bg-subtle)',borderRadius:12,padding:4,marginBottom:20}}>
          {['valid','used','expired','duplicate'].map(s=>(
            <button key={s} onClick={()=>setTStatus(s)} style={{flex:1,padding:'9px 4px',borderRadius:9,fontSize:12,fontWeight:700,cursor:'pointer',border:'none',background:tStatus===s?'var(--color-bg-base)':'transparent',color:tStatus===s?'var(--color-text-primary)':'var(--color-text-secondary)',boxShadow:tStatus===s?'0 1px 3px rgba(0,0,0,.2)':'none',fontFamily:'inherit',textTransform:'capitalize'}}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
        <div style={{background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:22,overflow:'hidden',boxShadow:'var(--shadow)'}}>
          <div style={{background:'linear-gradient(135deg,#F13C38,#7C2D8A)',padding:'18px 20px',color:'#fff'}}>
            <span style={{fontSize:11,fontWeight:700,opacity:.85}}>{ev.catLabel}</span>
            <div style={{fontSize:20,fontWeight:800,marginTop:4,lineHeight:1.15}}>{ev.title}</div>
            <div style={{fontSize:12.5,opacity:.9,marginTop:5}}>{ev.venue} · {ev.city}</div>
          </div>
          <div style={{padding:'24px 20px',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{position:'relative',padding:12,background:'#fff',borderRadius:16}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(21,1fr)',width:176,height:176}}>
                {qrCells.map((on,i)=>(
                  <div key={i} style={{background:on?'#16130f':'#ffffff',width:'100%',height:'100%'}}/>
                ))}
              </div>
              {tStatus!=='valid'&&(
                <div style={{position:'absolute',inset:12,background:'rgba(255,255,255,.82)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke={info.c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M9 9l6 6 M15 9l-6 6"/></svg>
                </div>
              )}
            </div>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 13px',borderRadius:999,fontSize:12.5,fontWeight:700,color:info.c,background:`color-mix(in srgb,${info.c} 15%, transparent)`,marginTop:18}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:info.c,display:'block'}}/>
              {info.label}
            </div>
            <div style={{fontSize:12.5,color:'var(--color-text-secondary)',marginTop:8,textAlign:'center'}}>{info.sub}</div>
          </div>
          <div style={{borderTop:'2px dashed var(--color-border-default)',padding:'18px 20px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {[{k:'Date',val:ev.date},{k:'Time',val:ev.time},{k:'Seat',val:seats.length?seats.join(', '):'GA'},{k:'Gate',val:'B'},{k:'Holder',val:name||'Alex Sterling'},{k:'Ticket',val:orderNo}].map(f=>(
              <div key={f.k}><div style={{fontSize:10.5,color:'var(--color-text-placeholder)',textTransform:'uppercase',letterSpacing:.5}}>{f.k}</div><div style={{fontSize:14.5,fontWeight:700,marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--color-text-primary)'}}>{f.val}</div></div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:12,marginTop:18}}>
          <button onClick={()=>go('/ticket/'+(params.eventId||'e1')+'/pdf',{eventId:params.eventId||'e1'})} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'var(--color-bg-surface)',color:'var(--color-text-primary)',border:'1px solid var(--color-border-default)',borderRadius:14,padding:14,fontSize:14.5,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12 M7 11l5 5 5-5 M4 21h16"/></svg>Save PDF
          </button>
          <button onClick={()=>go('/event/'+(params.eventId||'e1'),{eventId:params.eventId||'e1'})} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'var(--color-bg-surface)',color:'var(--color-text-primary)',border:'1px solid var(--color-border-default)',borderRadius:14,padding:14,fontSize:14.5,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16v-4 M12 8v0 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/></svg>Event info
          </button>
        </div>
      </div>
    );
  };

  const renderPDF = () => (
    <div style={{flex:'1 0 auto',padding:20,display:'flex',flexDirection:'column'}}>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:24}}>
        <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
        <span style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>PDF ticket</span>
      </div>
      {pdfLoading ? (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20,padding:'90px 0'}}>
          <div style={{width:48,height:48,border:'4px solid var(--color-bg-subtle)',borderTopColor:'var(--color-brand-primary)',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
          <div style={{textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:'var(--color-text-primary)'}}>Generating your PDF…</div><div style={{fontSize:13,color:'var(--color-text-secondary)',marginTop:6}}>Embedding QR code & event details</div></div>
        </div>
      ) : (
        <>
          <div style={{background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:18,padding:20,display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:56,height:70,borderRadius:8,background:'var(--color-bg-brand-tint)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'1px solid var(--color-border-brand)'}}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="var(--color-brand-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5"/></svg>
            </div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--color-text-primary)'}}>BritVibe-Ticket-{orderNo}.pdf</div><div style={{fontSize:12.5,color:'var(--color-text-secondary)',marginTop:3}}>248 KB · Ready offline</div></div>
          </div>
          <div style={{display:'flex',gap:12,marginTop:18}}>
            <button onClick={()=>showToast('Downloaded to Files')} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:14,padding:15,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12 M7 11l5 5 5-5 M4 21h16"/></svg>Download
            </button>
            <button onClick={()=>showToast('Link copied')} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'var(--color-bg-surface)',color:'var(--color-text-primary)',border:'1px solid var(--color-border-default)',borderRadius:14,padding:15,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.6 13.5l6.8 4 M15.4 6.5l-6.8 4"/></svg>Share
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderHistory = () => {
    const histUpcoming = events.slice(0,2).map(e=>({...e,badge:'Upcoming',badgeColor:'var(--color-status-success)',action:'View ticket',onAction:()=>go('/ticket/'+e.id,{eventId:e.id})}));
    const histPast = events.slice(4,7).map(e=>({...e,badge:'Attended',badgeColor:'var(--color-text-placeholder)',action:'Rate',onAction:()=>go('/reviews/'+e.id,{eventId:e.id})}));
    const histList = histTab==='upcoming'?histUpcoming:histPast;
    return (
      <div style={{padding:'20px 20px 96px'}}>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:'-.4px',marginBottom:18,color:'var(--color-text-primary)'}}>My bookings</div>
        <div style={{display:'flex',gap:4,background:'var(--color-bg-subtle)',borderRadius:13,padding:4,marginBottom:20}}>
          {(['upcoming','past'] as const).map(t=>(
            <button key={t} onClick={()=>setHistTab(t)} style={{flex:1,padding:11,borderRadius:11,fontSize:14,fontWeight:700,cursor:'pointer',border:'none',background:histTab===t?'var(--color-bg-base)':'transparent',color:histTab===t?'var(--color-text-primary)':'var(--color-text-secondary)',boxShadow:histTab===t?'0 1px 3px rgba(0,0,0,.2)':'none',fontFamily:'inherit'}}>
              {t==='upcoming'?'Upcoming':'Past vibes'}
            </button>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {histList.map(ev=>(
            <div key={ev.id} style={{display:'flex',gap:14,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:18,padding:12}}>
              <div style={{position:'relative',width:84,height:84,borderRadius:14,overflow:'hidden',flexShrink:0}}><Fill style={ev.fill}/></div>
              <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
                <div style={{display:'inline-flex',alignSelf:'flex-start',alignItems:'center',gap:5,fontSize:10.5,fontWeight:700,color:ev.badgeColor}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:ev.badgeColor,display:'block'}}/>
                  {ev.badge}
                </div>
                <div style={{fontSize:15,fontWeight:700,marginTop:5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--color-text-primary)'}}>{ev.title}</div>
                <div style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.venue} · {ev.date}</div>
                <button onClick={ev.onAction} style={{alignSelf:'flex-start',marginTop:9,background:'var(--color-bg-brand-tint)',color:'var(--color-text-brand)',border:'none',borderRadius:10,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{ev.action}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    const ev=curVM;
    const ratingWords=['Tap to rate','Poor','Fair','Good','Great','Amazing'];
    return (
      <div style={{flex:'1 0 auto',padding:20,display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:22}}>
          <button onClick={back} style={btnIconStyle}><ChevLeft/></button>
          <span style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>Reviews</span>
        </div>
        {reviewed ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',padding:'40px 0 30px',gap:16}}>
            <div style={{width:84,height:84,borderRadius:'50%',background:'var(--color-status-success)',display:'flex',alignItems:'center',justifyContent:'center',animation:'pop .5s ease'}}><Check size={42} strokeWidth={2.6}/></div>
            <div style={{fontSize:22,fontWeight:800,color:'var(--color-text-primary)'}}>Thanks for the vibe check!</div>
            <div style={{fontSize:14.5,color:'var(--color-text-secondary)',lineHeight:1.5,maxWidth:280}}>Your review helps other fans pick their next night out.</div>
            <button onClick={()=>go('/home',{},true)} style={{marginTop:8,width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Back to home</button>
          </div>
        ) : (
          <>
            <div style={{display:'flex',gap:14,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:18,padding:14,marginBottom:24}}>
              <div style={{position:'relative',width:64,height:64,borderRadius:13,overflow:'hidden',flexShrink:0}}><Fill style={ev.fill}/></div>
              <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',justifyContent:'center'}}>
                <div style={{fontSize:15.5,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--color-text-primary)'}}>{ev.title}</div>
                <div style={{fontSize:12.5,color:'var(--color-text-secondary)',marginTop:3}}>{ev.venue}</div>
              </div>
            </div>
            <div style={{textAlign:'center',fontSize:16,fontWeight:700,marginBottom:14,color:'var(--color-text-primary)'}}>How was it?</div>
            <div style={{display:'flex',justifyContent:'center',gap:12,marginBottom:8}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>setRating(n)} style={{background:'none',border:'none',cursor:'pointer',padding:2}}>
                  <svg viewBox="0 0 24 24" width="38" height="38" fill={n<=rating?'#FFC93D':'none'} stroke={n<=rating?'#FFC93D':'var(--color-border-strong)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.6 5.6L21 9.3l-4.5 4.3 1.1 6.4-5.6-3-5.6 3 1.1-6.4L3 9.3l6.4-.7z"/></svg>
                </button>
              ))}
            </div>
            <div style={{textAlign:'center',fontSize:14,fontWeight:700,color:'var(--color-text-brand)',marginBottom:22}}>{ratingWords[rating]}</div>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Tell others what made this night special…" style={{width:'100%',minHeight:110,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:14,padding:15,fontSize:14.5,color:'var(--color-text-primary)',resize:'none',lineHeight:1.5,fontFamily:'inherit',boxSizing:'border-box',outline:'none'}}/>
            <button onClick={()=>{ if(!rating){showToast('Tap to rate first');return;} setReviewed(true); }} style={{marginTop:16,width:'100%',background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:15,padding:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Submit review</button>
            <div style={{fontSize:16,fontWeight:800,margin:'28px 0 14px',color:'var(--color-text-primary)'}}>Community reviews</div>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {REVIEWS.map(r=>(
                <div key={r.name} style={{background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:16,padding:15}}>
                  <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:9}}>
                    <div style={{width:38,height:38,borderRadius:'50%',background:'var(--color-bg-subtle)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,color:'var(--color-text-secondary)'}}>{r.name[0]}</div>
                    <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:'var(--color-text-primary)'}}>{r.name}</div><div style={{fontSize:11.5,color:'var(--color-text-placeholder)'}}>{r.when}</div></div>
                    <div style={{display:'flex',gap:1}}>
                      {[1,2,3,4,5].map(n=><svg key={n} viewBox="0 0 24 24" width="13" height="13" fill={n<=r.rating?'#FFC93D':'none'} stroke="#FFC93D" strokeWidth="1.5"><path d="M12 3l2.6 5.6L21 9.3l-4.5 4.3 1.1 6.4-5.6-3-5.6 3 1.1-6.4L3 9.3l6.4-.7z"/></svg>)}
                    </div>
                  </div>
                  <div style={{fontSize:13.5,lineHeight:1.55,color:'var(--color-text-secondary)'}}>{r.text}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };
  const renderProfile = () => {
    const profileGroups = [
      {title:'Account',items:[
        {label:'Edit profile',d:'M7.5 1.5C6.11929 1.5 5 2.61929 5 4C5 5.38071 6.11929 6.5 7.5 6.5C8.88071 6.5 10 5.38071 10 4C10 2.61929 8.88071 1.5 7.5 1.5ZM4 4C4 2.067 5.567 0.5 7.5 0.5C9.433 0.5 11 2.067 11 4C11 5.933 9.433 7.5 7.5 7.5C5.567 7.5 4 5.933 4 4ZM2.5 13C2.5 11.067 4.067 9.5 6 9.5H9C10.933 9.5 12.5 11.067 12.5 13V14C12.5 14.2761 12.2761 14.5 12 14.5H3C2.72386 14.5 2.5 14.2761 2.5 14V13ZM6 10.5C4.61929 10.5 3.5 11.6193 3.5 13V13.5H11.5V13C11.5 11.6193 10.3807 10.5 9 10.5H6Z',on:()=>setActiveSettingModal('profile')},
        {label:'Payment methods',d:'M1 4C1 2.89543 1.89543 2 3 2H12C13.1046 2 14 2.89543 14 4V11C14 12.1046 13.1046 13 12 13H3C1.89543 13 1 12.1046 1 11V4ZM3 3H12C12.5523 3 13 3.44772 13 4v1H2V4C2 3.44772 2.44772 3 3 3ZM13 7H2V11C2 11.5523 2.44772 12 3 12H12C12.5523 12 13 11.5523 13 11V7ZM4.5 9.5C4.5 9.22386 4.72386 9 5 9H6C6.27614 9 6.5 9.22386 6.5 9.5C6.5 9.77614 6.27614 10 6 10H5C4.72386 10 4.5 9.77614 4.5 9.5Z',on:()=>setActiveSettingModal('payments')},
        {label:'Notifications',d:'M7.5 0.75C8.93294 0.75 10.1587 1.6212 10.6621 2.92318C11.5833 3.03784 12.25 3.73803 12.25 4.5V7.47223L13.1979 9.84196C13.3444 10.2082 13.0747 10.6 12.68 10.6H2.32001C1.92534 10.6 1.65561 10.2082 1.80211 9.84196L2.75 7.47223V4.5C2.75 3.73803 3.41669 3.03784 4.33792 2.92318C4.84127 1.6212 6.06706 0.75 7.5 0.75ZM7.5 1.75C6.51614 1.75 5.67926 2.37894 5.37887 3.32742C5.39279 3.32629 5.40683 3.32519 5.421 3.32408C5.8778 3.28828 6.42551 3.25 7.5 3.25C8.57449 3.25 9.1222 3.28828 9.579 3.32408C9.59317 3.32519 9.60721 3.32629 9.62113 3.32742C9.32074 2.37894 8.48386 1.75 7.5 1.75ZM3.75 4.5V7.6322C3.75 7.74786 3.72265 7.86175 3.66986 7.96443L3.10986 9.05443C3.06587 9.14008 3.09084 9.25 3.19795 9.25H11.8021C11.9092 9.25 11.9341 9.14008 11.8901 9.05443L11.3301 7.96443C11.2774 7.86175 11.25 7.74786 11.25 7.6322V4.5C11.25 4.14815 10.963 3.8611 10.6094 3.82902C10.2319 3.79469 9.71884 3.75 8.75 3.75V4C8.75 4.69036 8.19036 5.25 7.5 5.25C6.80964 5.25 6.25 4.69036 6.25 4V3.75C5.28116 3.75 4.76807 3.79469 4.39064 3.82902C4.03704 3.8611 3.75 4.14815 3.75 4.5ZM7.5 4.25C7.63807 4.25 7.75 4.13807 7.75 4V3.75H7.25V4C7.25 4.13807 7.36193 4.25 7.5 4.25ZM5.5 11.6C5.5 11.2686 5.76863 11 6.1 11H8.9C9.23137 11 9.5 11.2686 9.5 11.6C9.5 12.4284 8.60457 13.1 7.5 13.1C6.39543 13.1 5.5 12.4284 5.5 11.6ZM6.5 11.6C6.5 11.8344 6.9039 12.1 7.5 12.1C8.0961 12.1 8.5 11.8344 8.5 11.6H6.5Z',on:()=>setActiveSettingModal('notifications')}
      ]},
      {title:'Activity',items:[
        {label:'Wishlist',d:'M1.35017 5.75017C1.35017 3.45817 3.20818 1.60017 5.50018 1.60017C6.75883 1.60017 7.8825 2.15837 8.64966 3.03792C9.41683 2.15837 10.5405 1.60017 11.8002 1.60017C14.0922 1.60017 15.9502 3.45817 15.9502 5.75017C15.9502 9.17217 12.8711 11.9647 8.64966 15.7958L8.64966 15.7958L8.64966 15.7958L4.42851 11.9647C0.20708 9.17217 1.35017 5.75017 1.35017 5.75017ZM3.05018 5.75017C3.05018 6.94017 4.11667 8.87179 8.16781 12.5488L8.64966 12.9862L9.1315 12.5488C13.1827 8.87179 14.2502 6.94017 14.2502 5.75017C14.2502 4.36817 13.1322 3.25017 11.7502 3.25017C10.6031 3.25017 9.58557 4.02058 9.20761 5.10118H8.09171C7.71375 4.02058 6.69623 3.25017 5.55018 3.25017C4.16818 3.25017 3.05018 4.36817 3.05018 5.75017Z',on:()=>showToast(saved.length+' saved vibes')},
        {label:'Booking history',d:'M2.5 1C2.22386 1 2 1.22386 2 1.5V2.5H1.5C0.671573 2.5 0 3.17157 0 4V12.5C0 13.3284 0.671573 14 1.5 14H13.5C14.3284 14 15 13.3284 15 12.5V4C15 3.17157 14.3284 2.5 13.5 2.5H13V1.5C13 1.22386 12.7761 1 12.5 1C12.2239 1 12 1.22386 12 1.5V2.5H3V1.5C3 1.22386 2.77614 1 2.5 1ZM3 3.5V4.5C3 4.77614 2.77614 5 2.5 5C2.22386 5 2 4.77614 2 4.5V3.5H1.5C1.22386 3.5 1 3.72386 1 4V5.5H14V4C14 3.72386 13.7761 3.5 13.5 3.5H13V4.5C13 4.77614 12.7761 5 12.5 5C12.2239 5 12 4.77614 12 4.5V3.5H3ZM14 6.5H1V12.5C1 12.7761 1.22386 13 1.5 13H13.5C13.7761 13 14 12.7761 14 12.5V6.5Z',on:()=>go('/history')},
        {label:'My reviews',d:'M7.5 0.150174C7.66986 0.150174 7.82298 0.258844 7.87979 0.419515L9.61021 5.31885H14.5C14.6738 5.31885 14.8291 5.42944 14.8841 5.59247C14.9392 5.75549 14.881 5.9348 14.7401 6.036L10.7836 8.87415L12.2952 13.7547C12.3491 13.9287 12.2858 14.1105 12.1384 14.205C11.991 14.2995 11.7915 14.2862 11.66 14.172L7.5 10.748L3.34001 14.172C3.20853 14.2862 3.00902 14.2995 2.86161 14.205C2.7142 14.1105 2.65089 13.9287 2.70483 13.7547L4.21637 8.87415L0.259902 6.036C0.118991 5.9348 0.0607873 5.75549 0.115867 5.59247C0.170947 5.42944 0.326245 5.31885 0.5 5.31885H5.38979L7.12021 0.419515C7.17702 0.258844 7.33014 0.150174 7.5 0.150174ZM7.5 1.76185L6.04639 5.87785C5.98958 6.03852 5.83646 6.14719 5.6666 6.14719H1.47959L4.80215 8.52848C4.94306 8.62967 5.00127 8.80899 4.94619 8.97201L3.67683 13.0699L7.00282 10.3299C7.14324 10.2148 7.35676 10.2148 7.49718 10.3299L10.8232 13.0699L9.55381 8.97201C9.49873 8.80899 9.55694 8.62967 9.69785 8.52848L13.0204 6.14719H8.8334C8.66354 6.14719 8.51042 6.03852 8.45361 5.87785L7.5 1.76185Z',on:()=>go('/reviews/e1',{eventId:'e1'})}
      ]},
      {title:'System',items:[
        {label:'Appearance',d:'M7.5 1.5C4.18629 1.5 1.5 4.18629 1.5 7.5C1.5 10.8137 4.18629 13.5 7.5 13.5C10.8137 13.5 13.5 10.8137 13.5 7.5C13.5 4.18629 10.8137 1.5 7.5 1.5ZM0.5 7.5C0.5 3.63401 3.63401 0.5 7.5 0.5C11.366 0.5 14.5 3.63401 14.5 7.5C14.5 11.366 11.366 14.5 7.5 14.5C3.63401 14.5 0.5 11.366 0.5 7.5ZM7.5 4C5.567 4 4 5.567 4 7.5C4 9.433 5.567 11 7.5 11C9.433 11 11 9.433 11 7.5C11 5.567 9.433 4 7.5 4Z',on:()=>setActiveSettingModal('appearance')},
        {label:'Preferences',d:'M1.5 2.5C1.5 2.22386 1.72386 2 2 2H13C13.2761 2 13.5 2.22386 13.5 2.5V3.5C13.5 3.77614 13.2761 4 13 4H2C1.72386 4 1.5 3.77614 1.5 3.5V2.5ZM2 3H13V2.5H2V3ZM1.5 6.5C1.5 6.22386 1.72386 6 2 6H13C13.2761 6 13.5 6.22386 13.5 6.5V7.5C13.5 7.77614 13.2761 8 13 8H2C1.72386 8 1.5 7.77614 1.5 7.5V6.5ZM2 7H13V6.5H2V7ZM1.5 10.5C1.5 10.2239 1.72386 10 2 10H13C13.2761 10 13.5 10.2239 13.5 10.5V11.5C13.5 11.7761 13.2761 12 13 12H2C1.72386 12 1.5 11.7761 1.5 11.5V10.5ZM2 11H13V10.5H2V11Z',on:()=>setActiveSettingModal('preferences')},
        {label:'Language',d:'M7.5 14.5C11.366 14.5 14.5 11.366 14.5 7.5C14.5 3.63401 11.366 0.5 7.5 0.5C3.63401 0.5 0.5 3.63401 0.5 7.5C0.5 11.366 3.63401 14.5 7.5 14.5ZM7.5 1.5C8.01633 2.87532 8.35626 4.60228 8.46197 6.5H6.53803C6.64374 4.60228 6.98367 2.87532 7.5 1.5ZM8.46197 7.5H6.53803C6.64374 9.39772 6.98367 11.1247 7.5 12.5C8.01633 11.1247 8.35626 9.39772 8.46197 7.5ZM9.47545 6.5C9.36214 4.31682 8.95679 2.45781 8.39739 1.18247C10.7428 1.83155 12.6565 3.63583 13.3592 6.5H9.47545ZM9.47545 7.5H13.3592C12.6565 10.3642 10.7428 12.1685 8.39739 12.8175C8.95679 11.5422 9.36214 9.68318 9.47545 7.5ZM5.52455 7.5H1.64084C2.34346 10.3642 4.25718 12.1685 6.60261 12.8175C6.04321 11.5422 5.63786 9.68318 5.52455 7.5ZM5.52455 6.5H1.64084C2.34346 3.63583 4.25718 1.83155 6.60261 1.18247C6.04321 2.45781 5.63786 4.31682 5.52455 6.5Z',on:()=>showToast('English (UK)')},
        {label:'Privacy & security',d:'M7.5 0.75C7.57593 0.75 7.64966 0.776097 7.70889 0.82397L13.7089 5.67397C13.8242 5.76722 13.8596 5.92809 13.7937 6.06016C12.9839 7.68366 11.75 10.125 7.5 14.1562C3.25 10.125 2.01607 7.68366 1.20626 6.06016C1.14041 5.92809 1.17578 5.76722 1.29111 5.67397L7.29111 0.82397C7.35034 0.776097 7.42407 0.75 7.5 0.75ZM2.25 6.20869L7.5 1.96869L12.75 6.20869C12.0623 7.5872 11.0073 9.61196 7.5 12.9045C3.99268 9.61196 2.93774 7.5872 2.25 6.20869Z',on:()=>showToast('Privacy (demo)')}
      ]},
      {title:'Support',items:[
        {label:'Help centre',d:'M7.5 0.875C3.84112 0.875 0.875 3.84112 0.875 7.5C0.875 11.1589 3.84112 14.125 7.5 14.125C11.1589 14.125 14.125 11.1589 14.125 7.5C14.125 3.84112 11.1589 0.875 7.5 0.875ZM1.875 7.5C1.875 4.3934 4.3934 1.875 7.5 1.875C10.6066 1.875 13.125 4.3934 13.125 7.5C13.125 10.6066 10.6066 13.125 7.5 13.125C4.3934 13.125 1.875 10.6066 1.875 7.5ZM7.5 4C6.25736 4 5.25 5.00736 5.25 6.25C5.25 6.52614 5.47386 6.75 5.75 6.75C6.02614 6.75 6.25 6.52614 6.25 6.25C6.25 5.55964 6.80964 5 7.5 5C8.19036 5 8.75 5.55964 8.75 6.25C8.75 6.80928 8.35129 7.15197 7.9255 7.51731C7.75549 7.6632 7.58156 7.81242 7.42939 7.9713C7.14925 8.26372 7 8.59964 7 9C7 9.27614 7.22386 9.5 7.5 9.5C7.77614 9.5 8 9.27614 8 9C8 8.85964 8.04925 8.72372 8.17061 8.59714C8.28156 8.48128 8.41549 8.3668 8.5745 8.23049C9.05129 7.82197 9.75 7.22072 9.75 6.25C9.75 5.00736 8.74264 4 7.5 4ZM7.5 10.25C7.22386 10.25 7 10.4739 7 10.75C7 11.0261 7.22386 11.25 7.5 11.25H7.51C7.78614 11.25 8.01 10.75 8.01 10.75C8.01 10.4739 7.78614 10.25 7.51 10.25H7.5ZM7.5 10.25C7.22386 10.25 7 10.4739 7 10.75',on:()=>showToast('Help centre (demo)')},
        {label:'About Brit Vibe',d:'M7.5 0.875C3.84112 0.875 0.875 3.84112 0.875 7.5C0.875 11.1589 3.84112 14.125 7.5 14.125C11.1589 14.125 14.125 11.1589 14.125 7.5C14.125 3.84112 11.1589 0.875 7.5 0.875ZM1.875 7.5C1.875 4.3934 4.3934 1.875 7.5 1.875C10.6066 1.875 13.125 4.3934 13.125 7.5C13.125 10.6066 10.6066 13.125 7.5 13.125C4.3934 13.125 1.875 10.6066 1.875 7.5ZM7.5 4C7.77614 4 8 4.22386 8 4.5V5.5C8 5.77614 7.77614 6 7.5 6C7.22386 6 7 5.77614 7 5.5V4.5C7 4.22386 7.22386 4 7.5 4ZM7.5 7C7.77614 7 8 7.22386 8 7.5V10.5C8 10.7761 7.77614 11 7.5 11C7.22386 11 7 10.7761 7 10.5V7.5C7 7.22386 7.22386 7 7.5 7Z',on:()=>showToast('Brit Vibe v1.0')}
      ]}
    ];

    const favData: Record<string, {
      items: string[];
      setItems: React.Dispatch<React.SetStateAction<string[]>>;
      emoji: string;
    }> = {
      'Favorite Movies': { items: favMovies, setItems: setFavMovies, emoji: '🎬' },
      'Favorite Actors': { items: favActors, setItems: setFavActors, emoji: '🎭' },
      'Favorite Actresses': { items: favActresses, setItems: setFavActresses, emoji: '👩' },
      'Favorite Singers': { items: favSingers, setItems: setFavSingers, emoji: '🎤' },
      'Favorite Bands': { items: favBands, setItems: setFavBands, emoji: '🎸' },
      'Favorite Venues': { items: favVenues, setItems: setFavVenues, emoji: '🏟️' }
    };

    return (
      <div style={{paddingBottom:settingsOpen?24:96}}>
        {settingsOpen ? (
          <div style={{display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',alignItems:'center',gap:16,padding:'20px 20px 14px',borderBottom:'1px solid var(--color-border-default)',background:'var(--color-bg-base)',position:'sticky',top:0,zIndex:5}}>
              <button onClick={()=>setSettingsOpen(false)} style={{background:'none',border:'none',color:'var(--color-text-primary)',cursor:'pointer',padding:4,display:'flex',alignItems:'center',justifyContent:'center',marginLeft:-4}}><BackArrow/></button>
              <span style={{fontSize:19,fontWeight:800,letterSpacing:'-.4px',color:'var(--color-text-primary)'}}>Settings</span>
            </div>
            <div style={{padding:'8px 20px 0'}}>
              {profileGroups.map(grp=>(
                <div key={grp.title} style={{marginTop:22}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--color-text-placeholder)',textTransform:'uppercase',letterSpacing:.6,marginBottom:8}}>{grp.title}</div>
                  <div style={{background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:16,overflow:'hidden'}}>
                    {grp.items.map((it,i)=>(
                      <button key={it.label} onClick={it.on} style={{width:'100%',display:'flex',alignItems:'center',gap:13,background:'none',border:'none',borderBottom:i<grp.items.length-1?'1px solid var(--color-border-default)':'none',padding:'15px 16px',cursor:'pointer',color:'var(--color-text-primary)',fontFamily:'inherit'}}>
                        <svg viewBox="0 0 15 15" width="19" height="19" fill="currentColor" style={{color:'var(--color-text-secondary)'}}><path d={it.d} fillRule="evenodd" clipRule="evenodd"/></svg>
                        <span style={{flex:1,textAlign:'left',fontSize:15,fontWeight:600}}>{it.label}</span>
                        <svg viewBox="0 0 15 15" width="18" height="18" fill="currentColor" style={{color:'var(--color-text-placeholder)'}}><path d="M6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645L10.8536 7.14645C11.0488 7.34171 11.0488 7.65829 10.8536 7.85355L6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536C5.95118 11.6583 5.95118 11.3417 6.14645 11.1464L9.79289 7.5L6.14645 3.85355C5.95118 3.65829 5.95118 3.34171 6.14645 3.14645Z" fillRule="evenodd" clipRule="evenodd"/></svg>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={()=>setDrawer('logout')} style={{marginTop:22,width:'100%',background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:16,padding:16,fontSize:15,fontWeight:700,color:'var(--color-status-error)',cursor:'pointer',fontFamily:'inherit'}}>Log out</button>
              <div style={{textAlign:'center',fontSize:12,color:'var(--color-text-placeholder)',marginTop:18,paddingBottom:20}}>Brit Vibe v1.0 · Made for the night</div>
            </div>
          </div>
        ) : (
          <div style={{padding:'20px 20px 0',position:'relative'}}>
            <button onClick={()=>setSettingsOpen(true)} style={{position:'absolute',top:20,right:20,background:'none',border:'none',color:'var(--color-text-secondary)',cursor:'pointer',padding:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
            </button>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:16,marginBottom:32}}>
              <div style={{width:108,height:108,borderRadius:'50%',background:'linear-gradient(135deg,#F13C38,#7C2D8A)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:38,fontWeight:800,color:'#fff',boxShadow:'0 10px 25px rgba(241,60,56,0.22)',marginBottom:16}}>
                {(name||'Alex')[0]}
              </div>
              <div style={{fontSize:22,fontWeight:800,letterSpacing:'-.4px',color:'var(--color-text-primary)'}}>{name||'Alex Sterling'}</div>
              <div style={{fontSize:13.5,color:'var(--color-text-secondary)',marginTop:5}}>{'@' + (name||'Alex Sterling').toLowerCase().replace(/\s+/g, '_')}</div>
              <div style={{width:'100%',height:1,background:'var(--color-border-default)',marginTop:20}}/>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:24}}>
              {[
                {
                  id: 'collections',
                  name: 'My Collections',
                  items: [
                    { label: 'My Tickets', emoji: '🎟️', count: 0, action: () => go('/history') },
                    { label: 'Saved', emoji: '💖', count: saved.length, action: () => setActiveSettingModal('saved_vibes') }
                  ]
                },
                {
                  id: 'favourites',
                  name: 'My Favourites',
                  items: [
                    { label: 'Favorite Movies', emoji: '🎬', count: favMovies.length, action: () => setActiveFavSection(activeFavSection === 'Favorite Movies' ? null : 'Favorite Movies') },
                    { label: 'Favorite Actors', emoji: '🎭', count: favActors.length, action: () => setActiveFavSection(activeFavSection === 'Favorite Actors' ? null : 'Favorite Actors') },
                    { label: 'Favorite Actresses', emoji: '👩', count: favActresses.length, action: () => setActiveFavSection(activeFavSection === 'Favorite Actresses' ? null : 'Favorite Actresses') },
                    { label: 'Favorite Singers', emoji: '🎤', count: favSingers.length, action: () => setActiveFavSection(activeFavSection === 'Favorite Singers' ? null : 'Favorite Singers') },
                    { label: 'Favorite Bands', emoji: '🎸', count: favBands.length, action: () => setActiveFavSection(activeFavSection === 'Favorite Bands' ? null : 'Favorite Bands') }
                  ]
                },
                {
                  id: 'venues',
                  name: 'Venues & Reviews',
                  items: [
                    { label: 'Favorite Venues', emoji: '🏟️', count: favVenues.length, action: () => setActiveFavSection(activeFavSection === 'Favorite Venues' ? null : 'Favorite Venues') },
                    { label: 'My Reviews', emoji: '⭐', count: reviewed ? 1 : 0, action: () => go('/reviews/e1', { eventId: 'e1' }) }
                  ]
                }
              ].map(sec => (
                <div key={sec.id}>
                  <div style={{fontSize:17,fontWeight:800,color:'var(--color-text-primary)'}}>{sec.name}</div>
                  <div style={{height:1,background:'var(--color-border-default)',marginTop:8,marginBottom:16}}/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                    {sec.items.map(item => {
                      const isSelected = activeFavSection === item.label;
                      return (
                        <button
                          key={item.label}
                          onClick={item.action}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '18px 10px',
                            background: isSelected ? 'var(--color-bg-brand-tint)' : 'var(--color-bg-surface)',
                            border: `1.5px solid ${isSelected ? 'var(--color-brand-primary)' : 'var(--color-border-default)'}`,
                            borderRadius: 18,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            color: isSelected ? 'var(--color-text-brand)' : 'var(--color-text-primary)',
                            outline: 'none',
                            boxShadow: isSelected ? '0 4px 15px rgba(241,60,56,.12)' : '0 4px 10px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span style={{fontSize:24,marginBottom:8}}>{item.emoji}</span>
                          <span style={{fontSize:13.5,fontWeight:700,textAlign:'center',marginBottom:8}}>{item.label}</span>
                          <span style={{
                            fontSize:11,
                            fontWeight:700,
                            color: isSelected ? 'var(--color-text-brand)' : '#FF4D4D',
                            background: isSelected ? 'rgba(241,60,56,0.06)' : 'rgba(241,60,56,0.12)',
                            border: `1px solid ${isSelected ? 'rgba(241,60,56,0.12)' : 'rgba(241,60,56,0.2)'}`,
                            padding:'4px 12px',
                            borderRadius:999
                          }}>
                            {item.count} items
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Items List below cards */}
              {activeFavSection && favData[activeFavSection] && (
                <div style={{
                  background: 'var(--color-bg-surface)',
                  border: '1.5px solid var(--color-border-default)',
                  borderRadius: 20,
                  padding: '20px 18px',
                  marginTop: 8,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                  animation: 'fadeUp 0.3s ease'
                }}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:22}}>{favData[activeFavSection].emoji}</span>
                      <span style={{fontSize:16,fontWeight:800,color:'var(--color-text-primary)'}}>{activeFavSection}</span>
                      <span style={{fontSize:12,color:'var(--color-text-secondary)',background:'var(--color-bg-subtle)',padding:'2px 8px',borderRadius:999,fontWeight:700}}>
                        {favData[activeFavSection].items.length}
                      </span>
                    </div>
                    <button onClick={() => setActiveFavSection(null)} style={{background:'none',border:'none',color:'var(--color-text-placeholder)',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:'inherit'}}>Close</button>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const input = form.elements.namedItem('newItem') as HTMLInputElement;
                    const val = input.value.trim();
                    if (val) {
                      if (favData[activeFavSection].items.includes(val)) {
                        showToast('Already added!');
                      } else {
                        favData[activeFavSection].setItems(prev => [...prev, val]);
                        input.value = '';
                        showToast(`Added to ${activeFavSection}`);
                      }
                    }
                  }} style={{display:'flex',gap:10,marginBottom:14}}>
                    <input
                      name="newItem"
                      placeholder={`Add new ${activeFavSection.toLowerCase().replace('favorite ', '').replace('movies', 'movie').replace('actors', 'actor').replace('actresses', 'actress').replace('singers', 'singer').replace('bands', 'band').replace('venues', 'venue')}...`}
                      style={{
                        flex: 1,
                        background: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border-default)',
                        borderRadius: 12,
                        padding: '10px 14px',
                        fontSize: 13.5,
                        color: 'var(--color-text-primary)',
                        fontFamily: 'inherit'
                      }}
                    />
                    <button type="submit" style={{
                      background: 'var(--color-brand-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '0 16px',
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}>
                      Add
                    </button>
                  </form>

                  {favData[activeFavSection].items.length === 0 ? (
                    <div style={{textAlign:'center',color:'var(--color-text-placeholder)',fontSize:13.5,padding:'16px 0'}}>
                      No items yet. Add one above!
                    </div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {favData[activeFavSection].items.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--color-bg-base)',
                          border: '1px solid var(--color-border-default)',
                          borderRadius: 12,
                          padding: '10px 14px',
                          animation: 'fadeUp 0.15s ease'
                        }}>
                          <span style={{fontSize:14,color:'var(--color-text-primary)',fontWeight:600}}>{item}</span>
                          <button
                            onClick={() => {
                              favData[activeFavSection].setItems(prev => prev.filter(i => i !== item));
                              showToast('Removed item');
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-status-error)',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12.5C11 13.3284 10.3284 14 9.5 14H5.5C4.67157 14 4 13.3284 4 12.5V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5 5V11.5C5 11.7761 5.22386 12 5.5 12C5.77614 12 6 11.7761 6 11.5V5C6 4.72386 5.77614 4.5 5.5 4.5C5.22386 4.5 5 4.72386 5 5ZM9 5V11.5C9 11.7761 9.22386 12 9.5 12C9.77614 12 10 11.7761 10 11.5V5C10 4.72386 9.77614 4.5 9.5 4.5C9.22386 4.5 9 4.72386 9 5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings modals */}
        {activeSettingModal && (
          <div onClick={()=>setActiveSettingModal(null)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(8px)',zIndex:90,display:'flex',alignItems:'flex-end',justifyContent:'center',animation:'fade .25s ease'}}>
            <div onClick={e=>e.stopPropagation()} style={{width:'100%',background:'var(--color-bg-surface)',borderRadius:'24px 24px 0 0',padding:'16px 20px 32px',maxHeight:'85%',overflowY:'auto',display:'flex',flexDirection:'column',gap:18,animation:'sheetUp .3s ease',boxShadow:'0 -10px 40px rgba(0,0,0,0.3)',border:'1px solid var(--color-border-default)',borderBottom:'none',boxSizing:'border-box'}}>
              <div style={{width:40,height:4,borderRadius:99,background:'var(--color-border-strong)',margin:'0 auto 10px'}}/>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid var(--color-border-default)',paddingBottom:14,marginBottom:4}}>
                <span style={{fontSize:20,fontWeight:800,letterSpacing:'-.4px',color:'var(--color-text-primary)'}}>
                  {activeSettingModal==='profile'?'Profile Details':activeSettingModal==='notifications'?'Notifications':activeSettingModal==='payments'?'Payment Methods':activeSettingModal==='saved_vibes'?'Saved Vibes':activeSettingModal==='appearance'?'Appearance':'Preferences'}
                </span>
                <button onClick={()=>setActiveSettingModal(null)} style={{background:'var(--color-bg-base)',border:'none',borderRadius:'50%',width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--color-text-primary)'}}><CloseIcon/></button>
              </div>

              {activeSettingModal==='profile' && (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:18,width:'100%'}}>
                  <div style={{width:84,height:84,borderRadius:'50%',background:'linear-gradient(135deg, var(--color-brand-primary), #7c2d8a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,fontWeight:800,color:'#fff'}}>{profileAvatarChar}</div>
                  <div style={{display:'flex',flexDirection:'column',gap:14,width:'100%'}}>
                    <label style={lblStyle}>Full Name<input value={editName||name} onChange={e=>setEditName(e.target.value)} placeholder="Alex Sterling" style={fieldStyle}/></label>
                    <label style={lblStyle}>User ID<input value={"@" + (name || 'Alex Sterling').toLowerCase().replace(/\s+/g, '_')} readOnly style={{...fieldStyle, background:'rgba(0,0,0,0.15)', color:'var(--color-text-placeholder)', cursor:'not-allowed', border:'1px dashed var(--color-border-default)'}} /></label>
                    <label style={lblStyle}>Email Address<input value={editEmail||email} onChange={e=>setEditEmail(e.target.value)} placeholder="alex@email.com" style={fieldStyle}/></label>
                    <label style={lblStyle}>Phone Number<input value={editPhone||phone} onChange={e=>setEditPhone(e.target.value)} placeholder="+44 7911 123456" style={fieldStyle}/></label>
                  </div>
                  <div style={{display:'flex',gap:12,width:'100%',marginTop:10}}>
                    <button onClick={()=>setActiveSettingModal(null)} style={{flex:1,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:15,padding:15,fontSize:15,fontWeight:700,color:'var(--color-text-primary)',cursor:'pointer',fontFamily:'inherit'}}>Cancel</button>
                    <button onClick={()=>{ setName(editName||name); setEmail(editEmail||email); setActiveSettingModal(null); showToast('Profile updated'); }} style={{flex:1,background:'var(--color-brand-primary)',border:'none',borderRadius:15,padding:15,fontSize:15,fontWeight:700,color:'#fff',cursor:'pointer',fontFamily:'inherit'}}>Save Changes</button>
                  </div>
                </div>
              )}

              {activeSettingModal==='notifications' && (
                <div style={{display:'flex',flexDirection:'column',gap:18,width:'100%'}}>
                  <div style={{fontSize:14,color:'var(--color-text-secondary)',lineHeight:1.5}}>Configure how you would like to be notified about ticket sales, artist updates, and special discounts.</div>
                  {[{label:'Push Notifications',sub:'Instantly alert you about hot tickets',val:notifPush,set:setNotifPush},{label:'Email Newsletter',sub:'Weekly digest of top upcoming events',val:notifEmail,set:setNotifEmail},{label:'Ticket Reminders',sub:'Reminders before ticket sales close',val:notifReminders,set:setNotifReminders},{label:'Artist Alerts',sub:'Notify when favorite artists announce events',val:notifAlerts,set:setNotifAlerts}].map(n=>(
                    <div key={n.label} style={{background:'var(--color-bg-base)',border:'1px solid var(--color-border-default)',borderRadius:16,padding:16,display:'flex',alignItems:'center',justifyContent:'space-between',boxSizing:'border-box'}}>
                      <div><div style={{fontSize:15,fontWeight:700,color:'var(--color-text-primary)'}}>{n.label}</div><div style={{fontSize:12,color:'var(--color-text-placeholder)',marginTop:2}}>{n.sub}</div></div>
                      <button onClick={()=>n.set(v=>!v)} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center'}}>
                        <div style={swBg(n.val)}><div style={swDot(n.val)}/></div>
                      </button>
                    </div>
                  ))}
                  <div style={{display:'flex',gap:12,width:'100%',marginTop:10}}>
                    <button onClick={()=>setActiveSettingModal(null)} style={{flex:1,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:15,padding:15,fontSize:15,fontWeight:700,color:'var(--color-text-primary)',cursor:'pointer',fontFamily:'inherit'}}>Cancel</button>
                    <button onClick={()=>{ setActiveSettingModal(null); showToast('Notification preferences saved'); }} style={{flex:1,background:'var(--color-brand-primary)',border:'none',borderRadius:15,padding:15,fontSize:15,fontWeight:700,color:'#fff',cursor:'pointer',fontFamily:'inherit'}}>Save Settings</button>
                  </div>
                </div>
              )}

              {activeSettingModal==='payments' && (
                <div style={{display:'flex',flexDirection:'column',gap:14,width:'100%'}}>
                  {savedCards.map(card=>(
                    <div key={card.id} style={{background:'var(--color-bg-base)',border:'1px solid var(--color-border-default)',borderRadius:16,padding:16,display:'flex',alignItems:'center',gap:14}}>
                      <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#F13C38,#7C2D8A)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:800,flexShrink:0}}>{card.type[0]}</div>
                      <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:'var(--color-text-primary)'}}>{card.type} •••• {card.last4}</div><div style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:2}}>{card.default?'Default Payment':'Saved Card'}</div></div>
                      <button onClick={()=>{ setSavedCards(c=>c.filter(x=>x.id!==card.id)); showToast('Card removed'); }} style={{background:'none',border:'none',color:'var(--color-status-error)',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:'inherit'}}>Remove</button>
                    </div>
                  ))}
                  {!addCardOpen ? (
                    <button onClick={()=>setAddCardOpen(true)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:9,background:'var(--color-bg-brand-tint)',border:'1.5px dashed var(--color-brand-primary)',borderRadius:16,padding:15,color:'var(--color-text-brand)',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14 M5 12h14"/></svg>Add new card
                    </button>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:12}}>
                      <label style={lblStyle}>Card name<input value={newCardName} onChange={e=>setNewCardName(e.target.value)} placeholder="Alex Sterling" style={fieldStyle}/></label>
                      <label style={lblStyle}>Card number<input value={newCardNum} onChange={e=>setNewCardNum(e.target.value.replace(/\D/g,'').slice(0,16))} inputMode="numeric" placeholder="1234567890123456" style={fieldStyle}/></label>
                      <div style={{display:'flex',gap:12}}>
                        <label style={{...lblStyle,flex:1}}>Expiry<input value={newCardExp} onChange={e=>setNewCardExp(e.target.value)} inputMode="numeric" placeholder="MM/YY" style={fieldStyle}/></label>
                        <label style={{...lblStyle,flex:1}}>CVV<input value={newCardCvv} onChange={e=>setNewCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))} inputMode="numeric" placeholder="123" style={fieldStyle}/></label>
                      </div>
                      <div style={{display:'flex',gap:12}}>
                        <button onClick={()=>{ setAddCardOpen(false); setNewCardName(''); setNewCardNum(''); setNewCardExp(''); setNewCardCvv(''); }} style={{flex:1,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:15,padding:14,fontSize:14,fontWeight:700,color:'var(--color-text-primary)',cursor:'pointer',fontFamily:'inherit'}}>Cancel</button>
                        <button onClick={()=>{ if(!newCardNum||!newCardExp||!newCardCvv){showToast('Please fill all fields');return;} const newCard={id:'c'+Date.now(),type:newCardNum.startsWith('4')?'Visa':newCardNum.startsWith('5')?'Mastercard':'Card',last4:newCardNum.slice(-4)||'1111',default:false}; setSavedCards(c=>[...c,newCard]); setAddCardOpen(false); setNewCardName(''); setNewCardNum(''); setNewCardExp(''); setNewCardCvv(''); showToast('Card added successfully'); }} style={{flex:1,background:'var(--color-brand-primary)',border:'none',borderRadius:15,padding:14,fontSize:14,fontWeight:700,color:'#fff',cursor:'pointer',fontFamily:'inherit'}}>Add Card</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSettingModal==='appearance' && (
                <div style={{display:'flex',flexDirection:'column',gap:18,width:'100%'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:18,padding:'14px 18px',marginBottom:6}}>
                    <div style={{display:'flex',flexDirection:'column'}}>
                      <span style={{fontSize:15,fontWeight:800,color:'var(--color-text-primary)'}}>Theme Mode</span>
                      <span style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:3}}>Switch between Light and Dark themes</span>
                    </div>
                    <button onClick={()=>setPrefTheme(prefTheme==='light'?'dark':'light')} style={{position:'relative',width:66,height:34,borderRadius:999,background:'var(--color-bg-base)',border:'1.5px solid var(--color-border-strong)',cursor:'pointer',padding:0,outline:'none',display:'flex',alignItems:'center',justifyContent:'space-between',transition:'all 0.3s'}}>
                      {/* Sun Icon (Radix style) */}
                      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',zIndex:2,color:prefTheme==='light'?'var(--color-brand-primary)':'var(--color-text-placeholder)',transition:'color 0.3s'}}>
                        <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0.75C7.91421 0.75 8.25 1.08579 8.25 1.5V2.5C8.25 2.91421 7.91421 3.25 7.5 3.25C7.08579 3.25 6.75 2.91421 6.75 2.5V1.5C6.75 1.08579 7.08579 0.75 7.5 0.75ZM7.5 11.75C7.91421 11.75 8.25 12.0858 8.25 12.5V13.5C8.25 13.9142 7.91421 14.25 7.5 14.25C7.08579 14.25 6.75 13.9142 6.75 13.5V12.5C6.75 12.0858 7.08579 11.75 7.5 11.75ZM14.25 7.5C14.25 7.91421 13.9142 8.25 13.5 8.25H12.5C12.0858 8.25 11.75 7.91421 11.75 7.5C11.75 7.08579 12.0858 6.75 12.5 6.75H13.5C13.9142 6.75 14.25 7.08579 14.25 7.5ZM3.25 7.5C3.25 7.91421 2.91421 8.25 2.5 8.25H1.5C1.08579 8.25 0.75 7.91421 0.75 7.5C0.75 7.08579 1.08579 6.75 1.5 6.75H2.5C2.91421 6.75 3.25 7.08579 3.25 7.5ZM12.2701 2.7299C12.563 3.02279 12.563 3.49767 12.2701 3.79056L11.563 4.49767C11.2701 4.79056 10.7952 4.79056 10.5023 4.49767C10.2094 4.20478 10.2094 3.7299 10.5023 3.43701L11.2094 2.7299C11.5023 2.43701 11.9772 2.43701 12.2701 2.7299ZM4.49767 10.5023C4.79056 10.7952 4.79056 11.2701 4.49767 11.563L3.79056 12.2701C3.49767 12.563 3.02279 12.563 2.7299 12.2701C2.43701 11.9772 2.43701 11.5023 2.7299 11.2094L3.43701 10.5023C3.7299 10.2094 4.20478 10.2094 4.49767 10.5023ZM12.2701 12.2701C11.9772 12.563 11.5023 12.563 11.2094 12.2701L10.5023 11.563C10.2094 11.2701 10.2094 10.7952 10.5023 10.5023C10.7952 10.2094 11.2701 10.2094 11.563 10.5023L12.2701 11.2094C12.563 11.5023 12.563 11.9772 12.2701 12.2701ZM2.7299 2.7299C3.02279 2.43701 3.49767 2.43701 3.79056 2.7299L4.49767 3.43701C4.79056 3.7299 4.79056 4.20478 4.49767 4.49767C4.20478 4.79056 3.7299 4.79056 3.43701 4.49767L2.7299 3.79056C2.43701 3.49767 2.43701 3.02279 2.7299 2.7299ZM7.5 4.25C9.29493 4.25 10.75 5.70507 10.75 7.5C10.75 9.29493 9.29493 10.75 7.5 10.75C5.70507 10.75 4.25 9.29493 4.25 7.5C4.25 5.70507 5.70507 4.25 7.5 4.25Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/></svg>
                      </div>
                      {/* Moon Icon (Radix style) */}
                      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',zIndex:2,color:prefTheme==='dark'?'var(--color-brand-primary)':'var(--color-text-placeholder)',transition:'color 0.3s'}}>
                        <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.66016 7.23594C1.59724 5.92211 2.05436 4.62257 2.94636 3.59359C3.83836 2.56461 5.09341 1.88939 6.47631 1.70889C6.80902 1.66546 7.11306 1.87953 7.19927 2.19502C7.28548 2.51052 7.12141 2.83618 6.82736 2.93665C5.93922 3.2401 5.17646 3.86477 4.67389 4.69343C4.17132 5.52208 3.96781 6.50293 4.09886 7.45189C4.2299 8.40084 4.68656 9.25624 5.38555 9.87037C6.08453 10.4845 6.98064 10.8166 7.91745 10.8037C8.85427 10.7909 9.77051 10.434 10.5057 9.79979C11.2409 9.16558 11.7454 8.29747 11.9304 7.34861C12.1154 6.39975 11.9681 5.43169 11.5144 4.61339C11.3653 4.34448 11.4421 4.00424 11.6881 3.82914C11.934 3.65405 12.2709 3.70014 12.4602 3.93339C13.1257 4.75239 13.5284 5.76106 13.6062 6.80665C13.684 7.85223 13.4323 8.8778 12.8901 9.7281C12.3478 10.5784 11.5457 11.206 10.6052 11.5162C9.66479 11.8264 8.6415 11.8016 7.71261 11.4456C6.78372 11.0896 6.00281 10.4228 5.50742 9.56209C5.01202 8.70138 4.83103 7.6974 4.99616 6.72622C5.16128 5.75503 5.66318 4.87274 6.41372 4.2346C6.54924 4.11939 6.57723 3.92131 6.47895 3.77197C6.38066 3.62262 6.18241 3.56277 6.0152 3.63229C4.85876 4.11306 3.86438 4.96024 3.16723 6.05929C2.47007 7.15833 2.11181 8.44857 2.14081 9.75653C2.16982 11.0645 2.58436 12.3168 3.32832 13.3444C4.07228 14.372 5.10185 15.1147 6.27734 15.4715C7.45283 15.8284 8.70514 15.7788 9.85496 15.33C11.0048 14.8812 12.0084 14.0583 12.7291 12.9734C13.4498 11.8885 13.8471 10.6033 13.867 9.29074C13.8869 7.97818 13.5284 6.71183 12.8402 5.66359C12.7533 5.5312 12.5898 5.46747 12.4348 5.50074C12.2798 5.53401 12.1586 5.65876 12.1345 5.81594C12.1105 5.97311 12.1873 6.13845 12.3248 6.22359C12.7785 7.04189 12.9258 8.00995 12.7408 8.95881C12.5558 9.90767 12.0513 10.7758 11.3161 11.41C10.5809 12.0442 9.66467 12.4011 8.72785 12.414C7.79104 12.4269 6.89493 12.0948 6.19595 11.4806C5.49697 10.8665 5.04031 10.0111 4.90926 9.06214C4.77821 8.11319 4.98172 7.13233 5.48429 6.30368C5.98686 5.47502 6.74962 4.85035 7.63776 4.5469C7.93181 4.44643 8.09588 4.12078 8.00967 3.80528C7.92346 3.48979 7.61942 3.27572 7.28671 3.31915C5.90381 3.49965 4.64876 4.17487 3.75676 5.20385C2.86476 6.23283 2.40764 7.53237 2.47056 8.8462C2.47701 8.98064 2.58586 9.08803 2.72036 9.09139L7.5 7.23594Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/></svg>
                      </div>
                      {/* Sliding thumb */}
                      <div style={{position:'absolute',top:2,left:prefTheme==='light'?2:32,width:28,height:28,borderRadius:'50%',background:'#fff',boxShadow:'0 2px 6px rgba(0,0,0,0.18)',transition:'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1}}>
                      </div>
                    </button>
                  </div>
                  <div style={{display:'flex',gap:12,width:'100%',marginTop:10}}>
                    <button onClick={()=>setActiveSettingModal(null)} style={{flex:1,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:15,padding:15,fontSize:15,fontWeight:700,color:'var(--color-text-primary)',cursor:'pointer',fontFamily:'inherit'}}>Cancel</button>
                    <button onClick={()=>{ setActiveSettingModal(null); showToast('Appearance updated'); }} style={{flex:1,background:'var(--color-brand-primary)',border:'none',borderRadius:15,padding:15,fontSize:15,fontWeight:700,color:'#fff',cursor:'pointer',fontFamily:'inherit'}}>Save</button>
                  </div>
                </div>
              )}

              {activeSettingModal==='preferences' && (
                <div style={{display:'flex',flexDirection:'column',gap:18,width:'100%'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--color-text-secondary)',marginBottom:2}}>Pick your interests to customise your feed:</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,width:'100%'}}>
                    {INTERESTS.map(x => {
                      const sel = prefGenres.includes(x);
                      const ICONS: Record<string, string> = { Music: '🎸', Comedy: '😂', Theatre: '🎭', Cinema: '🍿', Sports: '⚽', Clubbing: '🪩', Festivals: '🎡', 'Live Shows': '🎤' };
                      return (
                        <button
                          key={x}
                          onClick={() => setPrefGenres(prev => prev.includes(x) ? prev.filter(i => i !== x) : [...prev, x])}
                          style={{
                            borderRadius: 20,
                            cursor: 'pointer',
                            border: `1.5px solid ${sel ? 'var(--color-brand-primary)' : 'var(--color-border-default)'}`,
                            background: sel ? 'var(--color-bg-brand-tint)' : 'var(--color-bg-surface)',
                            color: sel ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
                            fontFamily: 'inherit',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 9,
                            position: 'relative',
                            boxShadow: sel ? '0 4px 20px rgba(241,60,56,.2)' : 'none',
                            transition: 'all 0.15s ease',
                            padding: '16px 8px',
                            width: '100%',
                            minHeight: 100
                          }}
                        >
                          <span style={{ fontSize: 30, lineHeight: 1 }}>{ICONS[x] || '✨'}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>{x}</span>
                          {sel && (
                            <div style={{ position: 'absolute', top: 9, right: 9, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{margin:'auto'}}><path d="M5 13l4 4L19 7"/></svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{display:'flex',gap:12,width:'100%',marginTop:10}}>
                    <button onClick={()=>setActiveSettingModal(null)} style={{flex:1,background:'var(--color-bg-surface)',border:'1px solid var(--color-border-default)',borderRadius:15,padding:15,fontSize:15,fontWeight:700,color:'var(--color-text-primary)',cursor:'pointer',fontFamily:'inherit'}}>Cancel</button>
                    <button onClick={()=>{ if(!prefGenres.length){showToast('Pick at least one interest');return;} setActiveSettingModal(null); showToast('Preferences updated'); }} style={{flex:1,background:'var(--color-brand-primary)',border:'none',borderRadius:15,padding:15,fontSize:15,fontWeight:700,color:'#fff',cursor:'pointer',fontFamily:'inherit'}}>Save</button>
                  </div>
                </div>
              )}

              {activeSettingModal==='saved_vibes' && (
                <div style={{display:'flex',flexDirection:'column',gap:16,width:'100%',paddingBottom:10}}>
                  {saved.length === 0 ? (
                    <div style={{textAlign:'center',padding:'40px 20px',color:'var(--color-text-placeholder)'}}>
                      <div style={{fontSize:48,marginBottom:12}}>💖</div>
                      <div style={{fontSize:16,fontWeight:700,color:'var(--color-text-secondary)',marginBottom:6}}>No saved vibes yet</div>
                      <div style={{fontSize:13.5,marginBottom:20}}>Start exploring events to save them here.</div>
                      <button onClick={()=>{ setActiveSettingModal(null); go('/events'); }} style={{background:'var(--color-brand-primary)',color:'#fff',border:'none',borderRadius:12,padding:'10px 20px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Explore Events</button>
                    </div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:12,maxHeight:'350px',overflowY:'auto',paddingRight:4}}>
                      {saved.map(id => {
                        const ev = EVENTS.find(e => e.id === id);
                        if (!ev) return null;
                        const vm = vmEvent(ev, saved, go, toggleSave);
                        return (
                          <div key={ev.id} style={{display:'flex',alignItems:'center',gap:12,background:'var(--color-bg-base)',border:'1px solid var(--color-border-default)',borderRadius:16,padding:12}}>
                            <div style={{width:50,height:50,borderRadius:10,background:`linear-gradient(150deg, ${ev.c1}, ${ev.c2})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{ev.emoji}</div>
                            <div style={{flex:1,minWidth:0,cursor:'pointer'}} onClick={() => { setActiveSettingModal(null); vm.on(); }}>
                              <div style={{fontSize:14.5,fontWeight:700,color:'var(--color-text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.title}</div>
                              <div style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:3}}>{ev.date} · {ev.venue}</div>
                            </div>
                            <button onClick={() => toggleSave(ev.id)} style={{background:'none',border:'none',color:'var(--color-status-error)',cursor:'pointer',padding:8}}><Heart fill="#F13C38" size={18}/></button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logout drawer */}
        {drawer==='logout' && (
          <div onClick={()=>setDrawer(null)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.5)',zIndex:80,display:'flex',alignItems:'flex-end'}}>
            <div onClick={e=>e.stopPropagation()} style={{width:'100%',background:'var(--color-bg-surface)',borderRadius:'24px 24px 0 0',padding:'22px 22px 28px',animation:'sheetUp .3s ease'}}>
              <div style={{width:40,height:4,borderRadius:99,background:'var(--color-border-strong)',margin:'0 auto 18px'}}/>
              <div style={{fontSize:18,fontWeight:800,marginBottom:8,color:'var(--color-text-primary)'}}>Log out?</div>
              <div style={{fontSize:14,color:'var(--color-text-secondary)',marginBottom:22}}>You'll need to sign in again to access your tickets and bookings.</div>
              <div style={{display:'flex',gap:12}}>
                <button onClick={()=>setDrawer(null)} style={{flex:1,background:'var(--color-bg-base)',border:'1px solid var(--color-border-default)',borderRadius:14,padding:15,fontSize:15,fontWeight:700,color:'var(--color-text-primary)',cursor:'pointer',fontFamily:'inherit'}}>Cancel</button>
                <button onClick={()=>{ setDrawer(null); setHist([]); go('/login',{},true); }} style={{flex:1,background:'var(--color-status-error)',border:'none',borderRadius:14,padding:15,fontSize:15,fontWeight:700,color:'#fff',cursor:'pointer',fontFamily:'inherit'}}>Log out</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNotifications = () => {
    const markAllRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read');
    };

    const toggleRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
    };

    const deleteNotif = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast('Notification deleted');
    };

    return (
      <div style={{flex:'1 0 auto',padding:20,display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <button onClick={back} style={btnIconStyle}><BackArrow/></button>
            <span style={{fontSize:20,fontWeight:800,color:'var(--color-text-primary)'}}>Notifications</span>
          </div>
          {notifications.some(n => !n.read) && (
            <button onClick={markAllRead} style={{background:'none',border:'none',color:'var(--color-brand-primary)',cursor:'pointer',fontSize:13.5,fontWeight:700,fontFamily:'inherit'}}>
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:'60px 20px',textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:16}}>🔔</div>
            <div style={{fontSize:16,fontWeight:800,color:'var(--color-text-primary)',marginBottom:6}}>All caught up!</div>
            <div style={{fontSize:13.5,color:'var(--color-text-secondary)'}}>You have no new notifications at the moment.</div>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {notifications.map(n => {
              const bg = n.read ? 'var(--color-bg-surface)' : 'var(--color-bg-brand-tint)';
              const border = n.read ? '1px solid var(--color-border-default)' : '1.5px solid var(--color-brand-primary)';
              const titleColor = n.read ? 'var(--color-text-primary)' : 'var(--color-text-brand)';
              
              return (
                <div
                  key={n.id}
                  onClick={() => toggleRead(n.id)}
                  style={{
                    background: bg,
                    border: border,
                    borderRadius: 18,
                    padding: 16,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    position: 'relative',
                    boxShadow: n.read ? 'none' : '0 4px 15px rgba(241,60,56,.06)',
                    transition: 'all 0.2s ease',
                    animation: 'fadeUp 0.2s ease'
                  }}
                >
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
                    <div style={{fontSize:15,fontWeight:800,color:titleColor}}>{n.title}</div>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                      <span style={{fontSize:11.5,color:'var(--color-text-placeholder)',fontWeight:600}}>{n.time}</span>
                      <button
                        onClick={(e) => deleteNotif(n.id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-placeholder)',
                          cursor: 'pointer',
                          padding: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12.5C11 13.3284 10.3284 14 9.5 14H5.5C4.67157 14 4 13.3284 4 12.5V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5 5V11.5C5 11.7761 5.22386 12 5.5 12C5.77614 12 6 11.7761 6 11.5V5C6 4.72386 5.77614 4.5 5.5 4.5C5.22386 4.5 5 4.72386 5 5ZM9 5V11.5C9 11.7761 9.22386 12 9.5 12C9.77614 12 10 11.7761 10 11.5V5C10 4.72386 9.77614 4.5 9.5 4.5C9.22386 4.5 9 4.72386 9 5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/></svg>
                      </button>
                    </div>
                  </div>
                  <div style={{fontSize:13,lineHeight:1.5,color: n.read ? 'var(--color-text-secondary)' : 'var(--color-text-brand)'}}>{n.body}</div>
                  {!n.read && (
                    <span style={{position:'absolute',bottom:16,right:16,width:8,height:8,borderRadius:'50%',background:'var(--color-brand-primary)'}}/>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── Route → screen ─────────────────────────────────────────────────────────
  const renderScreen = () => {
    if(route==='/') return renderSplash();
    if(route==='/onboarding') return renderOnboarding();
    if(route==='/login') return renderLogin();
    if(route==='/guest-entry') return renderGuest();
    if(route==='/setup-profile') return renderProfileSetup();
    if(route==='/interests') return renderInterests();
    if(route==='/verify-device') return renderVerify();
    if(route==='/home') return renderHome();
    if(route==='/notifications') return renderNotifications();
    if(route==='/select-location') return renderLocation();
    if(route==='/featured') return renderFeatured();
    if(route==='/trending') return renderTrending();
    if(route==='/events') return renderExplore();
    if(route.startsWith('/category')) return renderCategory();
    if(route.startsWith('/event/')) return renderEventDetail();
    if(route.startsWith('/organizer/')) return renderOrganizer();
    if(route.startsWith('/artist/')) return renderArtist();
    if(route.startsWith('/venue/')) return renderVenue();
    if(route.startsWith('/media/')) return renderMedia();
    if(route.startsWith('/booking/tickets')) return renderTickets();
    if(route==='/booking/seats') return renderSeats();
    if(route==='/booking/summary') return renderSummary();
    if(route==='/booking/checkout') return renderCheckout();
    if(route==='/payment/method') return renderPayMethod();
    if(route==='/payment/card') return renderCard();
    if(route==='/payment/apple-pay') return renderApplePay();
    if(route==='/payment/result') return renderResult();
    if(route.endsWith('/pdf')) return renderPDF();
    if(route.startsWith('/ticket/')) return renderQR();
    if(route==='/history') return renderHistory();
    if(route.startsWith('/reviews/')) return renderReviews();
    if(route==='/profile') return renderProfile();
    return renderHome();
  };

  // ── Bottom nav ─────────────────────────────────────────────────────────────
  const NAV_ITEMS = [
    {key:'home',label:'Home',icon:<HomeIcon/>,on:()=>go('/home',{},true)},
    {key:'explore',label:'Explore',icon:<ExploreIcon/>,on:()=>go('/events')},
    {key:'tickets',label:'Tickets',icon:<TicketIcon/>,on:()=>go('/history')},
    {key:'profile',label:'Profile',icon:<ProfileIcon/>,on:()=>go('/profile')}
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={{position:'fixed',inset:0,background:'var(--color-bg-base)',display:'flex',flexDirection:'column',color:'var(--color-text-primary)'}}>
        <div ref={scrollRef} style={{flex:1,overflowY:'auto',overflowX:'hidden',scrollbarWidth:'none',display:'flex',flexDirection:'column'}}>
          {renderScreen()}
        </div>

        {/* Bottom nav — outside scroll container so it never scrolls away */}
        {showNav && (
          <div style={{flexShrink:0,height:80,background:'var(--color-bg-surface)',borderTop:'1px solid var(--color-border-default)',display:'flex',alignItems:'flex-start',justifyContent:'space-around',paddingTop:12,backdropFilter:'blur(12px)'}}>
            {NAV_ITEMS.map(n=>(
              <button key={n.key} onClick={n.on} style={{background:'none',border:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer',width:64,color:n.key===navTab?'var(--color-brand-primary)':'var(--color-text-placeholder)',fontFamily:'inherit'}}>
                {n.icon}
                <span style={{fontSize:11,fontWeight:600}}>{n.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Toast */}
        {toastMsg && (
          <div style={{position:'absolute',bottom:showNav?96:20,left:'50%',transform:'translateX(-50%)',background:'var(--color-text-primary)',color:'var(--color-bg-base)',padding:'11px 20px',borderRadius:999,fontSize:13,fontWeight:600,zIndex:55,animation:'fadeUp .2s',boxShadow:'var(--shadow)',whiteSpace:'nowrap'}}>
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}
