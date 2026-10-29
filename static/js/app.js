const $=s=>document.querySelector(s);
const LC=window.LAB_CONFIG||{},FREE_N=LC.freeTopicCount??10;
const isPremium=()=>!!LC.isPremium,hasTopic=(i)=>i<FREE_N||isPremium(),hasExam=isPremium,hasTutor=isPremium;
const csrfToken=()=>(document.cookie.match(/csrftoken=([^;]+)/)||[])[1]||'';
const S=[
{n:'Wave Properties',g:'See how frequency, wavelength and speed are linked: c = f × λ.',
ctl:[['f','Frequency','MHz',1,10,3,.5],['a','Amplitude','',1,10,5,1],['m','Medium',K.slice(0,4),0]],
d(c,t,v){const cs=M[K[v.m]][1],lam=cs/v.f/1e3,Lw=lam*80,A=v.a*13,mid=190;
c.setLineDash([4,5]);[-A,0,A].forEach(o=>ln(c,0,mid+o,W,mid+o,'#1d4d8f',1));c.setLineDash([]);
c.strokeStyle='#fcd034';c.lineWidth=3;c.beginPath();for(let x=0;x<=W;x++){const y=mid-A*Math.sin(6.2832*(x/Lw-t*.7));x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
let x1=Lw*((.25+t*.7)%1);while(x1<50)x1+=Lw;
ln(c,x1,44,x1+Lw,44,'#ff3b30',3);ln(c,x1,36,x1,52,'#ff3b30',3);ln(c,x1+Lw,36,x1+Lw,52,'#ff3b30',3);
T(c,'λ = '+lam.toFixed(2)+' mm',x1+Lw/2,28,'#ff3b30',14,'center');T(c,'Amplitude',W-10,mid-A-6,'#9db4d8',12,'right');T(c,'Wave travels →  (view width = 10 mm)',10,H-12)},
o:v=>{const cs=M[K[v.m]][1],lam=cs/v.f/1e3;return[['Wavelength',lam.toFixed(3)+' mm'],['Period',(1/v.f).toFixed(3)+' µs'],['Speed (c)',cs+' m/s'],['Check: f × λ',Math.round(v.f*lam*1e3)+' m/s']]},
tip:'Try this: raise the frequency and the wavelength shrinks. Switch the medium to bone: same frequency, longer wavelength. Frequency comes from the source, speed from the medium, wavelength follows.'},
{n:'Attenuation & Depth',g:'Why high-frequency probes see detail but not deep.',
ctl:[['f','Frequency','MHz',1,15,3,.5],['m','Tissue',K.slice(0,4),0]],
d(c,t,v){const a=AT[v.m]*v.f,x0=60,x1=770,y0=30,y1=290,Y=l=>y0+(y1-y0)*Math.min(l,80)/80,X=d=>x0+(x1-x0)*d/20;
for(let i=0;i<=4;i++){ln(c,x0,Y(i*20),x1,Y(i*20),'#12396b',1);T(c,i*20,x0-8,Y(i*20)+4,'#9db4d8',12,'right');T(c,i*5,X(i*5),y1+14,'#9db4d8',12,'center')}
T(c,'Depth (cm)',415,y1+28,'#9db4d8',12,'center');T(c,'Round-trip loss (dB)',x0+6,y0-10);
ln(c,x0,Y(60),x1,Y(60),'#ff3b30',1.5);T(c,'60 dB: echo lost in noise',x1,Y(60)-5,'#ff3b30',12,'right');
c.strokeStyle='#fcd034';c.lineWidth=3;c.beginPath();for(let d=0;d<=20;d+=.1){const x=X(d),y=Y(2*a*d);d?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
const dp=30/a;if(dp<=20){ln(c,X(dp),y0,X(dp),y1,'#ff3b30',1.5);T(c,'Max depth ≈ '+dp.toFixed(1)+' cm',X(dp)-6,y0+14,'#ff3b30',13,'right')}
const dd=(t*3)%20;c.fillStyle='#ff3b30';c.beginPath();c.arc(X(dd),Y(2*a*dd),7,0,7);c.fill();
for(let x=x0;x<x1;x+=4){const d=(x-x0)/(x1-x0)*20;c.fillStyle='rgba(252,208,52,'+Math.max(0,1-2*a*d/60)+')';c.fillRect(x,306,4,16)}
T(c,'Echo strength with depth',x0,336,'#9db4d8',11)},
o:v=>{const a=AT[v.m]*v.f;return[['Loss per cm (one-way)',a.toFixed(2)+' dB'],['Round-trip per cm',(2*a).toFixed(2)+' dB'],['Approx. max depth',(30/a).toFixed(1)+' cm'],['Tissue coefficient',AT[v.m]+' dB/cm/MHz']]},
tip:'Try this: compare 3 MHz with 10 MHz in soft tissue. Low frequency reaches deep (abdomen, obstetrics). High frequency gives finer detail but shallow reach (thyroid, MSK, vascular).'},
{n:'Reflection & Refraction',g:'What happens when a sound beam meets a boundary between two tissues.',
ctl:[['th','Incident angle','°',0,80,30,1],['a','Medium 1',K,0],['b','Medium 2',K,1]],
d(c,t,v){const p=P(v),mid=170,px=400;
c.globalAlpha=.16;c.fillStyle=p.k1;c.fillRect(0,0,W,mid);c.fillStyle=p.k2;c.fillRect(0,mid,W,H-mid);c.globalAlpha=1;
ln(c,0,mid,W,mid,'#fff',2);c.setLineDash([3,5]);ln(c,px,20,px,H-20,'#9db4d8',1);
c.setLineDash([12,8]);c.lineDashOffset=-t*50;const s=Math.sin(p.th),co=Math.cos(p.th);
ln(c,px-s*210,mid-co*210,px,mid,'#fcd034',6);
ln(c,px,mid,px+s*210,mid-co*210,'#ff3b30',p.tir?6:1+7*p.R);
if(!p.tir)ln(c,px,mid,px+Math.sin(p.tt)*200,mid+Math.cos(p.tt)*200,'#38bdf8',1+7*(1-p.R));
c.setLineDash([]);
T(c,'Medium 1: '+K[v.a]+'  (Z='+p.z1+', c='+p.c1+')',14,24,p.k1,14);T(c,'Medium 2: '+K[v.b]+'  (Z='+p.z2+', c='+p.c2+')',14,H-14,p.k2,14);
T(c,'Incident  θi='+v.th+'°',px-s*210-4,mid-co*210-8,'#fcd034',13,'right');T(c,'Reflected',px+s*210+6,mid-co*210+4,'#ff3b30');
if(!p.tir)T(c,'Transmitted  θt='+(p.tt*57.296).toFixed(1)+'°',px+Math.sin(p.tt)*200+6,mid+Math.cos(p.tt)*200,'#38bdf8');else T(c,'Total reflection: no transmitted beam',px+20,mid+40,'#ff3b30')},
o:v=>{const p=P(v);return[['Reflected (normal incid.)',(p.R*100).toFixed(p.R<.01?3:1)+'%'],['Transmitted',((1-p.R)*100).toFixed(p.R<.01?3:1)+'%'],['Refraction angle',p.tir?'none (TIR)':(p.tt*57.296).toFixed(1)+'°'],['Impedance Z1 → Z2',p.z1+' → '+p.z2]]},
tip:'Try this: soft tissue → air reflects ~100% (why we use gel). Soft tissue → bone gives a bright echo and shadow. Same medium on both sides gives no echo. Refraction needs an oblique angle AND different speeds.'},
{n:'Doppler Effect',g:'Moving blood changes the echo frequency: Δf = 2 · f · v · cos θ / c',
ctl:[['f','Transmit frequency','MHz',2,10,5,.5],['v','Blood velocity','cm/s',0,150,60,5],['th','Beam-to-flow angle','°',0,90,60,1]],
d(c,t,v){const th=v.th*Math.PI/180,cx=400,cy=250,Lp=170,kHz=2*v.f*1e6*(v.v/100)*Math.cos(th)/1540/1e3;
c.fillStyle='#4a1020';c.fillRect(70,cy-32,660,64);ln(c,70,cy-32,730,cy-32,'#ff7a7a',3);ln(c,70,cy+32,730,cy+32,'#ff7a7a',3);
c.fillStyle='#ff3b30';for(let i=0;i<26;i++){const x=70+(((i*97+(i%3)*40)-t*(20+v.v*3.5))%660+660)%660,y=cy-22+(i*53)%44;c.beginPath();c.arc(x,y,6,0,7);c.fill()}
T(c,'← blood flow',100,cy+54,'#ff7a7a',14);
c.save();c.translate(cx-Lp*Math.cos(th),cy-Lp*Math.sin(th));c.rotate(th);c.fillStyle='#fcd034';c.fillRect(-44,-16,44,32);ln(c,0,0,Lp,0,'rgba(252,208,52,.55)',8);c.restore();
c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(cx,cy,52,Math.PI,Math.PI+th);c.stroke();
T(c,'θ = '+v.th+'°',cx+80*Math.cos(Math.PI+th/2)-20,cy+80*Math.sin(Math.PI+th/2)+(v.th<30?-8:0),'#fff',14);
HS.push(kHz*(1+(Math.random()-.5)*.06));if(HS.length>130)HS.shift();
c.strokeStyle='#1d4d8f';c.lineWidth=1;c.strokeRect(520,24,260,120);T(c,'Doppler shift (kHz)',520,16,'#9db4d8',12);T(c,'0',514,144,'#9db4d8',11,'right');
c.strokeStyle='#fcd034';c.lineWidth=2;c.beginPath();HS.forEach((h,i)=>{const x=520+i*2,y=140-110*h/20;i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke()},
o:v=>{const co=Math.cos(v.th*Math.PI/180),k=2*v.f*(v.v/100)*co/1.54*1e3/1e3;return[['Doppler shift',(2*v.f*1e3*(v.v/100)*co/1540).toFixed(2)+' kHz'],['cos θ',co.toFixed(2)],['Velocity',v.v+' cm/s'],['Result',co<.02?'No shift at 90°':'Positive: flow toward probe']]},
tip:'Try this: keep velocity fixed and slide the angle to 90°. The shift collapses to zero. In practice keep θ ≤ 60°; errors grow steeply at larger angles.'},
{n:'Axial Resolution',g:'How close can two reflectors be, along the beam, and still appear separate?',
ctl:[['f','Frequency','MHz',2,15,5,.5],['n','Cycles per pulse','',1,8,3,1],['d','Reflector separation','mm',.1,3,1,.05]],
d(c,t,v){const lam=1540/v.f/1e3,res=v.n*lam/2,ppm=80,x0=400,sg=res/2.355*ppm,y0=200,ok=v.d>=res,p1=x0-v.d*ppm/2,p2=x0+v.d*ppm/2,g=(x,p)=>Math.exp(-.5*((x-p)/sg)**2);
c.beginPath();c.moveTo(0,y0);for(let x=0;x<=W;x++)c.lineTo(x,y0-75*(g(x,p1)+g(x,p2)));c.lineTo(W,y0);c.closePath();c.fillStyle='rgba(252,208,52,.25)';c.fill();c.strokeStyle='#fcd034';c.lineWidth=3;c.stroke();
T(c,'Echo signal along depth',14,24);[p1,p2].forEach((p,i)=>{c.fillStyle='#ff3b30';c.beginPath();c.arc(p,y0+16,6,0,7);c.fill()});
T(c,'Two reflectors  (d = '+v.d.toFixed(2)+' mm)',x0,y0+44,'#ff3b30',13,'center');
T(c,'What the image shows',14,262);const r=Math.min(14,Math.max(4,res*ppm/6)),col=ok?'#4ade80':'#ff3b30';
c.fillStyle=ok?'#fcd034':'#ff7a2f';c.strokeStyle=c.fillStyle;if(ok){[p1,p2].forEach(p=>{c.beginPath();c.arc(p,295,r,0,7);c.fill()})}else{c.lineWidth=2*r;c.lineCap='round';c.beginPath();c.moveTo(p1,295);c.lineTo(p2,295);c.stroke();c.lineCap='butt'}
T(c,ok?'Resolved: two separate dots':'Merged: seen as one structure',W-14,300,col,16,'right')},
o:v=>{const lam=1540/v.f/1e3,res=v.n*lam/2;return[['Wavelength',lam.toFixed(3)+' mm'],['Spatial pulse length',(v.n*lam).toFixed(2)+' mm'],['Axial resolution (SPL/2)',res.toFixed(2)+' mm'],['Verdict',v.d>=res?'Resolved':'Merged']]},
tip:'Try this: bring the reflectors together until they merge, then raise the frequency or cut the cycles per pulse (more damping) to separate them again. Shorter pulses give better axial resolution.'},
{n:'Nyquist & Aliasing',g:'Pulsed Doppler samples the blood-flow signal. Sample too slowly and the shift is misread (aliasing).',
ctl:[['p','PRF (sampling rate)','kHz',1,15,6,.5],['s','True Doppler shift','kHz',.5,12,2,.5]],
d(c,t,v){const P=v.p,fd=v.s,al=fd>P/2,fs=al?fd-Math.round(fd/P)*P:fd,fa=Math.abs(fs),mid=110,A=70;
ln(c,0,mid,W,mid,'#12396b',1);
c.strokeStyle='#fcd034';c.lineWidth=2;c.beginPath();for(let x=0;x<=W;x++){const y=mid-A*Math.cos(6.2832*fd*x/400);x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
if(al){c.setLineDash([8,6]);c.strokeStyle='#38bdf8';c.lineWidth=3;c.beginPath();for(let x=0;x<=W;x++){const y=mid-A*Math.cos(6.2832*fa*x/400);x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();c.setLineDash([])}
for(let k=0;k*400/P<=W;k++){const x=k*400/P,y=mid-A*Math.cos(6.2832*fd*k/P);ln(c,x,mid,x,y,'#ff3b30',1);c.fillStyle='#ff3b30';c.beginPath();c.arc(x,y,5,0,7);c.fill()}
T(c,'● samples (one per pulse)',14,22,'#ff3b30');T(c,'— true Doppler signal',14,40,'#fcd034');if(al)T(c,'- - signal the machine reconstructs (alias)',14,58,'#38bdf8');T(c,'Time → (2 ms window)',W-10,mid+A+16,'#9db4d8',12,'right');
const gx=400,gw=680,gy=265,xs=gx+fs/P*gw;
T(c,'Spectral display range = ± Nyquist limit (PRF/2)',gx,gy-24,'#9db4d8',13,'center');ln(c,gx-gw/2,gy,gx+gw/2,gy,'#9db4d8',2);
[-.5,0,.5].forEach(k=>{ln(c,gx+k*gw,gy-8,gx+k*gw,gy+8,'#9db4d8',2);T(c,(k>0?'+':'')+(k*P).toFixed(1)+' kHz',gx+k*gw,gy+26,'#9db4d8',12,'center')});
c.fillStyle=al?'#ff3b30':'#4ade80';c.beginPath();c.arc(xs,gy,10,0,7);c.fill();
T(c,al?'ALIASED: shown as '+fs.toFixed(1)+' kHz, wrapped to the opposite side (looks like reversed flow)':'Accurate: shift is below the Nyquist limit',gx,H-8,al?'#ff3b30':'#4ade80',14,'center')},
o:v=>{const al=v.s>v.p/2,fs=al?v.s-Math.round(v.s/v.p)*v.p:v.s;return[['Nyquist limit (PRF/2)',(v.p/2).toFixed(2)+' kHz'],['True shift',v.s+' kHz'],['Displayed shift',fs.toFixed(2)+' kHz'],['Status',al?'Aliasing':'Accurate']]},
tip:'Try this: raise the true shift above the Nyquist limit and watch the marker wrap round. Fix it by raising the PRF (scale), lowering the transmit frequency, increasing the beam angle, shifting the baseline, or using CW Doppler.'},
{n:'Tissue Harmonic Imaging',g:'As the beam travels, tissue distorts it and creates a new frequency at 2 × f₀. Imaging with it can reduce clutter.',
ctl:[['f','Transmit frequency f₀','MHz',1.5,5,2.5,.1],['d','Depth','cm',0,15,6,.5],['m','Output power (MI)','',1,10,5,1]],
d(c,t,v){const q=HQ(v),mid=100,A=65,ph=t*2;
T(c,'Waveform at this depth (shape only)  ·  blue dashed = undistorted, gold = distorted',14,20);
c.setLineDash([5,5]);c.strokeStyle='#38bdf8';c.lineWidth=1.5;c.beginPath();for(let x=0;x<=W;x++){const y=mid-A*Math.sin(18.85*x/W-ph);x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();c.setLineDash([]);
c.strokeStyle='#fcd034';c.lineWidth=3;c.beginPath();for(let x=0;x<=W;x++){const a=18.85*x/W-ph,y=mid-A*(Math.sin(a)+q.r*Math.sin(2*a))/(1+q.r*.6);x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
const B=310,hh=100;ln(c,100,B,700,B,'#9db4d8',1);T(c,'Signal strength at this depth (dB re. transmit)',14,188);
[[250,DB(q.a1),'Fundamental  '+v.f.toFixed(1)+' MHz','#fcd034'],[550,DB(q.a2),'2nd harmonic  '+(2*v.f).toFixed(1)+' MHz','#ff3b30']].forEach(([x,db,l,col])=>{const h=hh*(60+db)/60;c.fillStyle=col;c.fillRect(x-35,B-h,70,h);T(c,db.toFixed(1)+' dB',x,B-h-6,'#e9f0ff',13,'center');T(c,l,x,B+18,col,13,'center')})},
o:v=>{const q=HQ(v);return[['Fundamental',DB(q.a1).toFixed(1)+' dB'],['2nd harmonic',DB(q.a2).toFixed(1)+' dB'],['Harmonic frequency',(2*v.f).toFixed(1)+' MHz'],['Harmonic ÷ fundamental',(q.r*100).toFixed(0)+'%']]},
tip:'Try this: at depth 0 there is no harmonic. It builds with depth and power, then fades as attenuation wins. Near-field clutter is weak in harmonics, so filtering out the fundamental gives a cleaner image.'},
{n:'Acoustic Impedance',g:'Z = ρ × c. Echoes come from impedance differences between tissues, not from the tissues themselves.',
ctl:[['r','Density of medium 2 (ρ₂)','kg/m³',1,2000,1900,1],['c','Speed in medium 2 (c₂)','m/s',300,4100,4080,10]],
d(c,t,v){const z1=1.63,z2=v.r*v.c/1e6,R=((z2-z1)/(z2+z1))**2,X=z=>50+(Math.log10(Math.max(z,4e-4))+3.4)/4.4*700;
T(c,'Impedance scale (log)  ·  Z = ρ × c  (MRayl).  Medium 1 = soft tissue',50,24,'#e9f0ff',14);ln(c,50,110,750,110,'#9db4d8',2);
ZT.forEach(([n,z],i)=>{const x=X(z),y=[132,132,150,168,132][i],al=['left','right','right','left','center'][i];ln(c,x,110,x,y-12,'#9db4d8',1);T(c,n+' '+z,x+(i==3?5:i==0?0:i==4?0:-4),y,'#9db4d8',12,al)});
const mk=(x,col,y,l)=>{c.fillStyle=col;c.beginPath();c.moveTo(x,106);c.lineTo(x-8,92);c.lineTo(x+8,92);c.fill();ln(c,x,92,x,y+4,col,1);T(c,l,Math.min(710,Math.max(90,x)),y,col,14,'center')};
mk(X(z1),'#38bdf8',80,'Z₁');mk(X(z2),'#fcd034',60,'Z₂ = '+z2.toFixed(z2<.1?4:2));
T(c,'Reflected '+(R*100).toFixed(R<.01?2:1)+'%',50,222,'#ff3b30',14);T(c,'Transmitted '+((1-R)*100).toFixed(R<.01?2:1)+'%',750,222,'#38bdf8',14,'right');
c.fillStyle='#38bdf8';c.fillRect(50,230,700,36);c.fillStyle='#ff3b30';c.fillRect(50,230,700*R,36);
const g=Math.round(255*Math.sqrt(R));c.fillStyle='rgb('+g+','+g+','+g+')';c.fillRect(50,284,60,44);c.strokeStyle='#9db4d8';c.lineWidth=1;c.strokeRect(50,284,60,44);
T(c,'Echo brightness on screen',124,302,'#9db4d8',12);T(c,R<.01?'Almost no echo: boundary barely visible':R<.2?'Moderate echo: typical soft-tissue boundary':R<.9?'Strong echo: bright interface, shadow behind':'Near-total reflection: nothing passes (air or gas)',124,320,'#e9f0ff',14)},
o:v=>{const z2=v.r*v.c/1e6,R=((z2-1.63)/(z2+1.63))**2;return[['Z₁ (soft tissue)','1.63 MRayl'],['Z₂ = ρ₂ × c₂',z2.toFixed(z2<.1?4:2)+' MRayl'],['Reflected (IRC)',(R*100).toFixed(R<.01?2:1)+'%'],['Transmitted',((1-R)*100).toFixed(R<.01?2:1)+'%']]},
tip:'Try this: ρ₂ = 1 and c₂ = 330 (air) reflects ~99.9%, which is why gel matters. ρ₂ = 950 and c₂ = 1450 (fat) reflects under 1%. ρ₂ = 1900 and c₂ = 4080 (bone) reflects about 42%.'},
{n:'Why No Sound in Vacuum',g:'Sound is a mechanical wave: it needs particles to bump into each other and pass the vibration on.',
ctl:[['d','Particle density','%',0,100,100,1],['f','Source frequency','',1,5,2,.5]],
d(c,t,v){const N=84,A=3.5;
for(let s=0;s<2;s++){VC.n++;VC.p=A*Math.sin(6.2832*VC.n*v.f/60);
for(let r=0;r<4;r++){const u=VC.u[r],w=VC.w[r],ix=[];
for(let i=0;i<N;i++)pr(i,r,v.d)?ix.push(i):(u[i]=0,w[i]=0);
ix.forEach((i,q)=>{const lp=q?ix[q-1]:-1,F0=q?u[lp]:VC.p;let F=.25/((i-lp)**2)*(F0-u[i]);if(q<ix.length-1){const j=ix[q+1];F+=.25/((j-i)**2)*(u[j]-u[i])}w[i]+=F-(i>N-12?.17:.02)*w[i]});
ix.forEach(i=>u[i]+=w[i])}}
let m=0;
for(let r=0;r<4;r++){const u=VC.u[r],y=80+r*60;for(let i=0;i<N;i++)if(pr(i,r,v.d)){c.fillStyle='rgb(255,'+Math.round(208-Math.min(150,Math.abs(u[i])*45))+',52)';c.beginPath();c.arc(40+i*8.5+u[i],y,3.4,0,7);c.fill();if(i>N-26&&i<N-12)m=Math.max(m,Math.abs(u[i]))}}
VC.sm+=(m-VC.sm)*.05;VC.k=Math.min(1,VC.sm/A);
c.fillStyle='#ff7a2f';c.fillRect(16+VC.p,50,10,240);T(c,'Transducer',21+VC.p,44,'#ff7a2f',12,'center');
T(c,v.d==0?'VACUUM: no particles, so nothing can carry the vibration':'Particles at '+v.d+'% of normal density',W/2,24,v.d==0?'#ff3b30':'#e9f0ff',15,'center');
T(c,'Signal reaching the far end',50,322,'#9db4d8',12);c.fillStyle='#12396b';c.fillRect(230,311,300,12);c.fillStyle=VC.k>.05?'#4ade80':'#ff3b30';c.fillRect(230,311,300*VC.k,12)},
o:v=>[['Particle density',v.d+'%'],['Signal at far end',Math.round(VC.k*100)+'%'],['Verdict',v.d==0?'No sound: vacuum':VC.k<.05?'Practically silent':'Sound travels'],['Wave type','Mechanical: needs a medium']],
tip:'Try this: slide the density from 100% down to 0. With fewer particles the vibration is not passed on and the far end goes quiet. This is why air gaps and bowel gas block ultrasound. Light and radio waves are electromagnetic and need no medium.'}
,
{n:'Temporal Resolution',g:'Frame rate decides how well the image follows moving structures such as heart valves.',
ctl:[['d','Imaging depth','cm',4,20,10,1],['l','Scan lines per frame','',32,256,128,16],['z','Focal zones','',1,4,1,1]],
d(c,t,v){const fr=77000/(v.d*v.l*v.z),x0=40,pw=520,mid=165,A=110,y=s=>mid-A*Math.sin(12.566*s);
[-A,0,A].forEach(o=>ln(c,x0,mid+o,x0+pw,mid+o,'#12396b',1));
c.strokeStyle='#fcd034';c.lineWidth=2;c.beginPath();for(let x=0;x<=pw;x++){const s=x/pw*2;x?c.lineTo(x0+x,y(s)):c.moveTo(x0+x,y(s))}c.stroke();
c.strokeStyle='#38bdf8';c.lineWidth=3;c.beginPath();for(let x=0;x<=pw;x++){const s=Math.floor(x/pw*2*fr)/fr;x?c.lineTo(x0+x,y(s)):c.moveTo(x0+x,y(s))}c.stroke();
if(fr<=80){c.fillStyle='#ff3b30';for(let k=0;k/fr<2;k++){c.beginPath();c.arc(x0+k/fr/2*pw,y(k/fr),4,0,7);c.fill()}}
T(c,'— real motion (2 Hz)',x0,22,'#fcd034');T(c,'— displayed, updated once per frame',x0+190,22,'#38bdf8');T(c,'Time (2 s) →',x0+pw,mid+A+26,'#9db4d8',12,'right');
const tt=t%2;[640,720].forEach(x=>ln(c,x,mid-A,x,mid+A,'#12396b',2));
c.fillStyle='#fcd034';c.beginPath();c.arc(640,y(tt),11,0,7);c.fill();c.fillStyle='#38bdf8';c.beginPath();c.arc(720,y(Math.floor(tt*fr)/fr),11,0,7);c.fill();
T(c,'Real',640,mid+A+26,'#fcd034',13,'center');T(c,'Displayed',720,mid+A+26,'#38bdf8',13,'center')},
o:v=>{const fr=77000/(v.d*v.l*v.z);return[['PRF (77 ÷ depth)',(77/v.d).toFixed(1)+' kHz'],['Frame rate',fr.toFixed(1)+' fps'],['Time per frame',(1000/fr).toFixed(1)+' ms'],['Verdict',fr>=30?'Smooth':fr>=15?'Acceptable':'Jerky: fast motion missed']]},
tip:'Try this: raise the depth, line count or focal zones and the frame rate falls. For better temporal resolution use less depth, a narrower sector, fewer lines and fewer focal zones (important in echocardiography).'},
{n:'Elevational Resolution',g:'The beam also has a thickness, perpendicular to the image plane. Structures thinner than the beam get smeared into the image.',
ctl:[['f','Frequency','MHz',2,10,5,.5],['D','Aperture height','mm',5,15,10,1],['F','Focal depth','cm',2,10,5,.5],['z','Cyst depth','cm',1,14,8,.5]],
d(c,t,v){const lam=1.54/v.f,F=v.F*10,w0=Math.max(.3,1.22*lam*F/v.D),bw=z=>Math.sqrt(w0*w0+(v.D*(z-F)/F)**2),top=30,cx=250,k=8,yy=z=>top+z*1.9;
const Lp=[],Rp=[];for(let z=0;z<=150;z+=3){const h=Math.min(bw(z),50)*k/2;Lp.push([cx-h,yy(z)]);Rp.push([cx+h,yy(z)])}
c.beginPath();Lp.concat(Rp.reverse()).forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle='rgba(252,208,52,.2)';c.fill();c.strokeStyle='#fcd034';c.lineWidth=2;c.stroke();
c.fillStyle='#ff7a2f';c.fillRect(cx-v.D*k/2,top-12,v.D*k,12);T(c,'Probe (side view, beam thickness)',cx,top-18,'#ff7a2f',12,'center');
c.setLineDash([5,5]);ln(c,40,yy(F),480,yy(F),'#9db4d8',1);c.setLineDash([]);T(c,'focus',44,yy(F)-5,'#9db4d8',12);
const zc=v.z*10,bc=bw(zc),hw=Math.min(bc,50)*k/2;c.fillStyle='#000';c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(cx,yy(zc),16,0,7);c.fill();c.stroke();
ln(c,cx-hw,yy(zc)+26,cx+hw,yy(zc)+26,'#38bdf8',3);T(c,'beam thickness '+bc.toFixed(1)+' mm',cx,yy(zc)+44,'#38bdf8',13,'center');
const fr=Math.max(0,1-4/bc),g=Math.round(190*fr);T(c,'Image of a 4 mm cyst',670,70,'#e9f0ff',14,'center');
c.fillStyle='rgb('+g+','+g+','+g+')';c.beginPath();c.arc(670,170,44,0,7);c.fill();c.strokeStyle='#fff';c.stroke();
T(c,fr<.05?'Clean black cyst':'Filled in with false echoes',670,250,fr<.05?'#4ade80':'#ff3b30',14,'center');T(c,fr<.05?'':'(slice-thickness artifact)',670,270,'#ff3b30',13,'center')},
o:v=>{const lam=1.54/v.f,F=v.F*10,w0=Math.max(.3,1.22*lam*F/v.D),bc=Math.sqrt(w0*w0+(v.D*(v.z*10-F)/F)**2);return[['Thickness at focus',w0.toFixed(1)+' mm'],['Thickness at cyst',bc.toFixed(1)+' mm'],['Cyst fill-in',(Math.max(0,1-4/bc)*100).toFixed(0)+'%'],['Best detail at',v.F+' cm']]},
tip:'Try this: move the cyst depth to match the focal depth and the cyst turns black. Move it away and the thick beam averages echoes from outside the slice. A taller aperture or higher frequency gives a thinner beam.'},
{n:'Piezoelectric Effect & Resonance',g:'Voltage makes the crystal vibrate, and vibration makes voltage. It rings loudest when its thickness is half a wavelength.',
ctl:[['t','Crystal thickness','mm',.1,1,.3,.05],['f','Drive frequency','MHz',1,20,5,.5],['k','Backing-layer damping','',1,10,6,1]],
d(c,t,v){const fr=2/v.t,Q=12-v.k,Ar=f=>1/Math.sqrt(1+(Q*(f/fr-fr/f))**2),r=Ar(v.f),N=.733*Q,s=Math.sin(t*v.f*1.5),h=30+v.t*110+7*r*s;
c.fillStyle='#fcd034';c.fillRect(60,100-h/2,140,h);c.fillStyle=s>0?'#ff3b30':'#38bdf8';c.fillRect(56,100-h/2-6,148,6);c.fillStyle=s>0?'#38bdf8':'#ff3b30';c.fillRect(56,100+h/2,148,6);
T(c,s>0?'+':'−',34,100-h/2,'#e9f0ff',16);T(c,s>0?'−':'+',34,100+h/2+8,'#e9f0ff',16);T(c,'Piezoelectric crystal',130,170,'#9db4d8',13,'center');
ln(c,222,100-h/2,222,100+h/2,'#e9f0ff',2);T(c,'t = '+v.t+' mm',232,104,'#e9f0ff',13);
const X=f=>340+f/20*440,Y=a=>170-130*a;ln(c,340,170,780,170,'#9db4d8',1);T(c,'Response vs drive frequency (MHz)',340,22);
for(let i=0;i<=4;i++)T(c,i*5,X(i*5),186,'#9db4d8',11,'center');
c.strokeStyle='#fcd034';c.lineWidth=3;c.beginPath();for(let f=.3;f<=20;f+=.1){const x=X(f),y=Y(Ar(f));f>.35?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
c.setLineDash([5,4]);ln(c,X(fr),34,X(fr),170,'#ff3b30',1.5);c.setLineDash([]);T(c,'resonance '+fr.toFixed(1)+' MHz',Math.min(X(fr)+6,700),44,'#ff3b30',12);
c.fillStyle='#38bdf8';c.beginPath();c.arc(X(v.f),Y(r),7,0,7);c.fill();
T(c,'Pulse when struck: ring-down (more damping = shorter pulse)',40,212);const mid=268,x0=40;
c.setLineDash([4,4]);c.strokeStyle='#ff3b30';c.lineWidth=1.5;[-1,1].forEach(sg=>{c.beginPath();for(let x=0;x<=740;x++){const y=mid-sg*55*Math.exp(-3.1416*x/(12*Q));x?c.lineTo(x0+x,y):c.moveTo(x0+x,y)}c.stroke()});c.setLineDash([]);
c.strokeStyle='#fcd034';c.lineWidth=2;c.beginPath();for(let x=0;x<=740;x++){const y=mid-55*Math.exp(-3.1416*x/(12*Q))*Math.sin(6.2832*x/12);x?c.lineTo(x0+x,y):c.moveTo(x0+x,y)}c.stroke();
T(c,'≈ '+N.toFixed(1)+' cycles',x0+N*12+20,mid-30,'#e9f0ff',13)},
o:v=>{const fr=2/v.t,Q=12-v.k,r=1/Math.sqrt(1+(Q*(v.f/fr-fr/v.f))**2);return[['Resonant frequency',fr.toFixed(1)+' MHz'],['Response at drive',(r*100).toFixed(0)+'%'],['Bandwidth ≈ fr ÷ Q',(fr/Q).toFixed(1)+' MHz'],['Pulse length',(.733*Q).toFixed(1)+' cycles']]},
tip:'Try this: match the drive frequency to the resonance for the biggest response. A thinner crystal resonates at a higher frequency. More damping gives a shorter pulse and wider bandwidth (better axial resolution).'},
{n:'PRF & Range Ambiguity',g:'The machine waits for echoes before sending the next pulse. Echoes from very deep reflectors can arrive late and be misplaced.',
ctl:[['p','PRF','kHz',1,40,5,.5],['z','Reflector depth','cm',1,30,20,1]],
d(c,t,v){const PRP=1000/v.p,te=13*v.z,win=Math.max(3*PRP,te*1.1),X=u=>40+u/win*720,kk=Math.floor(te/PRP),dmax=1000/13/v.p,dd=(te-kk*PRP)/13,amb=te>PRP,y0=140,dx=d=>40+d/30*720;
ln(c,40,y0,760,y0,'#9db4d8',1);for(let k=0;k*PRP<=win;k++){const x=X(k*PRP);ln(c,x,y0,x,y0-60,'#ff3b30',3)}
T(c,'Pulses sent every '+PRP.toFixed(0)+' µs (red)',40,22,'#ff3b30');T(c,'Echo from the reflector (gold)',40,40,'#fcd034');ln(c,X(te),y0,X(te),y0-40,'#fcd034',3);
if(amb){const xs=X(kk*PRP);c.setLineDash([5,4]);ln(c,xs,y0+14,X(te),y0+14,'#38bdf8',2);c.setLineDash([]);T(c,'machine times the echo from the latest pulse',(xs+X(te))/2,y0+34,'#38bdf8',12,'center')}
c.fillStyle='#fff';c.beginPath();c.arc(X((t*win*.25)%win),y0,4,0,7);c.fill();T(c,'Time →',760,y0+54,'#9db4d8',12,'right');
ln(c,40,265,760,265,'#12396b',10);if(dmax<30){ln(c,dx(dmax),235,dx(dmax),295,'#ff3b30',2);T(c,'max unambiguous depth '+dmax.toFixed(1)+' cm',Math.min(dx(dmax)+6,600),232,'#ff3b30',12)}
c.fillStyle='#fcd034';c.beginPath();c.arc(dx(v.z),265,9,0,7);c.fill();c.strokeStyle=amb?'#ff3b30':'#4ade80';c.lineWidth=3;c.beginPath();c.arc(dx(amb?dd:v.z),265,14,0,7);c.stroke();
T(c,'True '+v.z+' cm',dx(v.z),300,'#fcd034',12,'center');if(amb)T(c,'Ghost at '+dd.toFixed(1)+' cm',dx(dd),318,'#ff3b30',13,'center');T(c,'0',40,330,'#9db4d8',11);T(c,'30 cm',760,330,'#9db4d8',11,'right')},
o:v=>{const PRP=1000/v.p,dmax=1000/13/v.p,amb=v.z>dmax,dd=(13*v.z%PRP)/13;return[['Pulse period',PRP.toFixed(0)+' µs'],['Max unambiguous depth',dmax.toFixed(1)+' cm'],['True depth',v.z+' cm'],['Displayed depth',(amb?dd:v.z).toFixed(1)+' cm'],['Status',amb?'Range ambiguity':'Correct']]},
tip:'Try this: a reflector deeper than the maximum depth shows up as a shallow ghost. Lower the PRF or reduce depth to fix it. Doppler needs a high PRF to avoid aliasing, so the two problems pull against each other (13 µs per cm of depth).'},
{n:'Fourier & Frequency Spectrum',g:'Any wave is a sum of pure sine waves. The spectrum shows which frequencies are inside it.',
ctl:[['s','Wave shape',['Pure sine','Square wave','Sawtooth','Short pulse'],0],['h','Frequencies added','',1,15,5,1]],
d(c,t,v){const N=v.h,AM=[k=>k==1?1:0,k=>k%2?1/k:0,k=>1/k,k=>1][v.s],mid=105,A=70,pts=[];let mx=1e-9;
for(let x=0;x<=W;x++){const a=12.566*x/W-t*1.5;let y=0;for(let k=1;k<=N;k++)y+=AM(k)*(v.s==3?Math.cos(k*a):Math.sin(k*a));pts.push(y);mx=Math.max(mx,Math.abs(y))}
ln(c,0,mid,W,mid,'#12396b',1);T(c,'Time domain: the wave you would see',14,20);
c.strokeStyle='#fcd034';c.lineWidth=3;c.beginPath();pts.forEach((y,x)=>x?c.lineTo(x,mid-A*y/mx):c.moveTo(x,mid-A*y/mx));c.stroke();
const B=310;ln(c,50,B,760,B,'#9db4d8',1);T(c,'Frequency spectrum (Fourier transform): bar height = how much of each frequency',14,188);
for(let k=1;k<=15;k++){const x=80+(k-1)*45,h=95*AM(k);if(h>0){if(k<=N){c.fillStyle=k==1?'#ff3b30':'#fcd034';c.fillRect(x-12,B-h,24,h)}else{c.strokeStyle='#1d4d8f';c.lineWidth=1;c.strokeRect(x-12,B-h,24,h)}}T(c,k==1?'f₀':k+'f₀',x,B+16,'#9db4d8',11,'center')}},
o:v=>[['Wave shape',['Pure sine','Square wave','Sawtooth','Short pulse'][v.s]],['Frequencies added',v.s==0?1:v.h],['Highest frequency',(v.s==0?1:v.h)+' × f₀'],['Bandwidth',v.s==0?'single frequency':'≈ '+(v.h-1)+' × f₀ wide']],
tip:'Try this: choose Short pulse and add frequencies one by one: the pulse gets narrower. Short pulses need wide bandwidth, which is why they give better axial resolution. A pure sine is a single frequency.'}
,
{n:'Spatial Compounding & Speckle',g:'Speckle is a grainy interference pattern. Averaging frames steered at different angles smooths it.',
ctl:[['n','Steering angles compounded','',1,9,5,1]],
d(c,t,v){const a=SCI(1),b=SCI(v.n);c.imageSmoothingEnabled=false;c.drawImage(a.cv,40,60,340,204);c.drawImage(b.cv,420,60,340,204);
T(c,'Single beam angle',40,50,'#e9f0ff',14);T(c,'Compounded: '+v.n+' angle'+(v.n>1?'s':''),420,50,'#fcd034',14);
T(c,'Speckle contrast '+a.s.toFixed(2),40,286,'#ff7a6e',14);T(c,'Speckle contrast '+b.s.toFixed(2),420,286,'#4ade80',14);
T(c,'Dark circle = cyst · bright spot = strong reflector · grain = speckle',W/2,322,'#9db4d8',13,'center')},
o:v=>{const a=SCI(1),b=SCI(v.n);return[['Angles averaged',v.n],['Speckle (single)',a.s.toFixed(2)],['Speckle (compound)',b.s.toFixed(2)],['Cost','Frame rate ÷ '+v.n]]},
tip:'Try this: raise the number of angles and the grain fades while the cyst edge and bright reflector stay clear. The price is a lower frame rate and some blurring of moving structures.'},
{n:'Intensity, Power & Amplitude',g:'Amplitude, power and intensity are linked by squares: double the amplitude and power and intensity rise fourfold.',
ctl:[['a','Amplitude (pressure units)','',1,10,6,.5],['A','Beam area','cm²',.1,2,.5,.1]],
d(c,t,v){const P=v.a*v.a,I=P/v.A,mid=100,Am=v.a*9;
T(c,'Wave amplitude',20,22);ln(c,20,mid,430,mid,'#12396b',1);[-1,1].forEach(s=>ln(c,20,mid+s*Am,430,mid+s*Am,'#1d4d8f',1));
c.strokeStyle='#fcd034';c.lineWidth=3;c.beginPath();for(let x=0;x<=410;x++){const y=mid-Am*Math.sin(x/16-t*5);x?c.lineTo(20+x,y):c.moveTo(20+x,y)}c.stroke();
const r=20+Math.sqrt(v.A)*40;c.fillStyle='rgba(252,208,52,'+(.1+.9*Math.sqrt(Math.min(1,I/1000)))+')';c.beginPath();c.arc(620,105,r,0,7);c.fill();c.strokeStyle='#fcd034';c.lineWidth=2;c.stroke();
T(c,'Beam cross-section (size = area)',620,22,'#9db4d8',13,'center');T(c,'brightness = intensity',620,205,'#9db4d8',13,'center');
[['Amplitude',v.a/10,v.a.toFixed(1)+' units','#38bdf8'],['Power',P/100,P.toFixed(0)+' mW','#ff7a2f'],['Intensity',Math.min(1,I/1000),I.toFixed(0)+' mW/cm²','#fcd034']].forEach(([n,f,l,col],i)=>{const y=235+i*32;T(c,n,20,y+14,'#e9f0ff',14);c.fillStyle='#12396b';c.fillRect(130,y,520,20);c.fillStyle=col;c.fillRect(130,y,520*f,20);T(c,l,140+520*f,y+15,'#e9f0ff',13)})},
o:v=>{const P=v.a*v.a,I=P/v.A;return[['Amplitude',v.a],['Power ∝ amplitude²',P.toFixed(0)+' mW'],['Intensity = power ÷ area',I.toFixed(0)+' mW/cm²'],['Level vs amplitude 3',(20*Math.log10(v.a/3)).toFixed(1)+' dB']]},
tip:'Try this: double the amplitude and power and intensity quadruple (+6 dB). Halve the beam area at the same power and intensity doubles. Power is the total energy per second, intensity is how concentrated it is. (Units are illustrative.)'},
{n:'Spectral Broadening',g:'A Doppler spectrum shows the range of velocities in the sample volume. A wider range gives a wider, filled-in trace.',
ctl:[['p','Flow pattern',['Laminar','Disturbed','Turbulent'],0],['s','Sample volume size','mm',1,10,3,1],['g','Doppler gain','',0,10,3,1]],
d(c,t,v){const SP=[.08,.45,1][v.p],cy=170,R=70;
T(c,'Vessel with sample volume',20,22);c.fillStyle='#4a1020';c.fillRect(20,cy-R,320,2*R);ln(c,20,cy-R,340,cy-R,'#ff7a7a',3);ln(c,20,cy+R,340,cy+R,'#ff7a7a',3);
for(let i=-4;i<=4;i++){const rr=i/4.5,pr=v.p==0?1-rr*rr:v.p==1?1-Math.pow(Math.abs(rr),4)*.9:.55+.45*Math.sin(t*9+i*2.3),L=Math.max(8,pr*120*(v.p==1?1+.2*Math.sin(t*7+i):1)),y=cy+i*R/4.6;ln(c,50,y,50+L,y,'#ff3b30',3);c.fillStyle='#ff3b30';c.beginPath();c.moveTo(50+L+9,y);c.lineTo(50+L,y-5);c.lineTo(50+L,y+5);c.fill()}
const h=Math.min(2*R-4,v.s*13);c.fillStyle='rgba(56,189,248,.25)';c.fillRect(242,cy-h/2,16,h);c.strokeStyle='#38bdf8';c.lineWidth=2;c.strokeRect(242,cy-h/2,16,h);T(c,'sample volume',250,cy+R+20,'#38bdf8',12,'center');
const Y=u=>300-190*u;T(c,'Doppler spectrum (time →, frequency ↑)',380,22);ln(c,380,300,780,300,'#9db4d8',1);ln(c,380,40,380,300,'#9db4d8',1);
for(let x=0;x<400;x++){const ph=(((x/130-t*.6)%1)+1)%1,m=.22+.78*Math.exp(-(((ph-.15)/.07)**2))+.1*Math.exp(-(((ph-.45)/.1)**2)),lo=Math.max(0,m*(1-SP-.025*v.s)),hi=m*(1+.04+.012*v.s+SP*.15);c.fillStyle='rgba(252,208,52,.5)';c.fillRect(380+x,Y(hi),1,Y(lo)-Y(hi));c.fillStyle='#fff';c.fillRect(380+x,Y(hi),1,2)}
c.fillStyle='rgba(252,208,52,.5)';for(let i=0;i<v.g*45;i++)c.fillRect(380+Math.random()*398,Y(Math.random()*1.3),2,2);
if(v.p==0&&v.g<4)T(c,'clear spectral window',590,294,'#9db4d8',12,'center')},
o:v=>{const SP=[.08,.45,1][v.p],lo=Math.max(0,1-SP-.025*v.s),hi=1.04+.012*v.s+SP*.15;return[['Flow pattern',['Laminar','Disturbed','Turbulent'][v.p]],['Width at peak',Math.round((hi-lo)*100)+'% of peak velocity'],['Sample volume',v.s+' mm'],['Gain noise',v.g>4?'adds false broadening':'low']]},
tip:'Try this: turbulent flow fills the clear window under the trace. A large sample volume and high gain also widen the spectrum, so not all broadening means disease.'},
{n:'Dynamic Range & Contrast',g:'Echoes span a huge range of strengths. Dynamic range sets how many dB are squeezed into the grey scale.',
ctl:[['r','Dynamic range','dB',20,100,60,5],['g','Gain','dB',-30,30,0,1]],
d(c,t,v){const gr=db=>255*Math.max(0,Math.min(1,(db+v.g+v.r)/v.r)),X=db=>50+(db+100)/120*280,Y=g=>290-g/255*230;
T(c,'Display curve: echo strength (dB) → grey level',40,22);ln(c,50,290,330,290,'#9db4d8',1);ln(c,50,290,50,60,'#9db4d8',1);
for(let d=-100;d<=20;d+=20)T(c,d,X(d),306,'#9db4d8',11,'center');T(c,'black',44,294,'#9db4d8',11,'right');T(c,'white',44,66,'#9db4d8',11,'right');
c.strokeStyle='#fcd034';c.lineWidth=3;c.beginPath();for(let d=-100;d<=20;d++){const x=X(d),y=Y(gr(d));d>-100?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
for(let i=0;i<8;i++){const db=-70+i*10,g=Math.round(gr(db));c.fillStyle='rgb('+g+','+g+','+g+')';c.fillRect(370,40+i*32,70,28);c.strokeStyle='#1d4d8f';c.lineWidth=1;c.strokeRect(370,40+i*32,70,28);T(c,db+' dB',448,59+i*32,'#9db4d8',12);c.fillStyle='#ff3b30';c.beginPath();c.arc(X(db),Y(g),4,0,7);c.fill()}
T(c,'Tissue phantom',540,50,'#e9f0ff',14);
for(let i=0;i<40;i++)for(let j=0;j<30;j++){const L=(i-20)**2+(j-15)**2<49,B=(i-33)**2+(j-6)**2<4;let db=L?-48:B?-8:-38;db+=((((i*73856093)^(j*19349663))>>>0)%1000/1000-.5)*10;const g=Math.round(gr(db));c.fillStyle='rgb('+g+','+g+','+g+')';c.fillRect(540+i*6,60+j*6,6,6)}
const ct=Math.abs(gr(-38)-gr(-48))/255;T(c,'Lesion is 10 dB below background',540,258,'#9db4d8',12);T(c,'Lesion contrast on screen: '+(ct*100).toFixed(0)+'%',540,278,ct>.3?'#4ade80':'#ff7a6e',14)},
o:v=>{const ct=Math.abs(Math.max(0,Math.min(1,(-38+v.g+v.r)/v.r))-Math.max(0,Math.min(1,(-48+v.g+v.r)/v.r)));return[['Dynamic range',v.r+' dB'],['Grey scale',v.r<40?'Short: high contrast, harsh':v.r>75?'Long: low contrast, smooth':'Medium'],['Lesion contrast',(ct*100).toFixed(0)+'%'],['Display window',(-v.g-v.r)+' to '+(-v.g)+' dB']]},
tip:'Try this: lower the dynamic range and the lesion pops out, but the image turns harsh with few greys. Raise it for smooth, subtle shading and lower contrast. Gain only slides the window: it brightens or darkens.'}
,
{n:'Backing Material & Q-Factor',g:'A backing block damps the crystal ringing: shorter pulses and wider bandwidth, at some cost in sensitivity.',
ctl:[['k','Backing damping','',0,10,5,1],['f','Centre frequency','MHz',2,10,5,.5]],
d(c,t,v){const Q=12-v.k,fr=v.f,N=.733*Q,s=Math.sin(t*fr*1.5),bh=14+v.k*9,cy=50+bh;
T(c,'Transducer cross-section',20,22);c.fillStyle='#4b5d7a';c.fillRect(60,50,170,bh);T(c,'Backing',145,50+bh/2+5,'#e9f0ff',13,'center');
c.fillStyle='#fcd034';c.fillRect(60,cy,170,44+4*s);T(c,'Piezo crystal',145,cy+26,'#1a0d00',13,'center');
c.fillStyle='#38bdf8';c.fillRect(60,cy+48,170,12);T(c,'Matching layer',240,cy+58,'#38bdf8',12);
ln(c,145,cy+68,145,cy+100,'#ff3b30',3);T(c,'sound into patient',155,cy+98,'#ff7a6e',12);
T(c,'Pulse in time (more damping = shorter pulse)',330,22);const mid=95,x0=330;
c.setLineDash([4,4]);c.strokeStyle='#ff3b30';c.lineWidth=1.5;[-1,1].forEach(sg=>{c.beginPath();for(let x=0;x<=450;x++){const y=mid-sg*55*Math.exp(-3.1416*x/(12*Q));x?c.lineTo(x0+x,y):c.moveTo(x0+x,y)}c.stroke()});c.setLineDash([]);
c.strokeStyle='#fcd034';c.lineWidth=2;c.beginPath();for(let x=0;x<=450;x++){const y=mid-55*Math.exp(-3.1416*x/(12*Q))*Math.sin(6.2832*x/12);x?c.lineTo(x0+x,y):c.moveTo(x0+x,y)}c.stroke();
T(c,'≈ '+N.toFixed(1)+' cycles',x0+Math.min(N*12+16,330),mid-34,'#e9f0ff',13);
const X=f=>330+f/20*450,Y=a=>310-120*a,Af=f=>1/Math.sqrt(1+(Q*(f/fr-fr/f))**2);
T(c,'Frequency spectrum (bandwidth)',330,172);ln(c,330,310,780,310,'#9db4d8',1);for(let i=0;i<=4;i++)T(c,i*5,X(i*5),326,'#9db4d8',11,'center');
c.strokeStyle='#fcd034';c.lineWidth=3;c.beginPath();for(let f=.5;f<=20;f+=.1){const x=X(f),y=Y(Af(f));f>.55?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
const f1=fr*(Math.sqrt(1+1/(4*Q*Q))-1/(2*Q)),f2=fr*(Math.sqrt(1+1/(4*Q*Q))+1/(2*Q));
c.setLineDash([4,4]);ln(c,330,Y(.707),780,Y(.707),'#9db4d8',1);c.setLineDash([]);ln(c,X(f1),Y(.707),X(f2),Y(.707),'#ff3b30',4);T(c,'bandwidth '+(fr/Q).toFixed(1)+' MHz',(X(f1)+X(f2))/2,Y(.707)-10,'#ff7a6e',13,'center')},
o:v=>{const Q=12-v.k,N=.733*Q;return[['Q-factor',Q.toFixed(1)],['Bandwidth',(v.f/Q).toFixed(1)+' MHz'],['Pulse length',N.toFixed(1)+' cycles'],['Axial resolution',(N*1.54/v.f/2).toFixed(2)+' mm'],['Sensitivity (illustrative)',(40+60*(Q-2)/10).toFixed(0)+'%']]},
tip:'Try this: add backing and Q falls: shorter pulses, wider bandwidth, better axial resolution, but less output. Q = centre frequency ÷ bandwidth. Imaging probes use heavy backing; therapy and CW devices use little.'},
{n:'Electronic Beam Steering',g:'A phased array steers the beam by firing its elements with tiny time delays. Nothing moves mechanically.',
ctl:[['th','Steering angle','°',-60,60,25,1],['n','Number of elements','',4,32,16,1],['p','Element pitch','λ',.25,1.5,.5,.05]],
d(c,t,v){const sp=14,lp=sp/v.p,y0=110,N=v.n,th=v.th*Math.PI/180,s=Math.sin(th),xs=[];for(let i=0;i<N;i++)xs.push(400+(i-(N-1)/2)*sp);
c.strokeStyle='rgba(252,208,52,.24)';c.lineWidth=1.5;c.beginPath();xs.forEach(x=>{const b=(((t*50-(x-400)*s)%lp)+lp)%lp;for(let r=b+lp;r<330;r+=lp){c.moveTo(x+r,y0);c.arc(x,y0,r,0,3.1416)}});c.stroke();
const dl=xs.map(x=>(x-400)*s),mn=Math.min(...dl),mx=Math.max(...dl);T(c,'Firing delay of each element (taller = fires later)',20,24);
xs.forEach((x,i)=>{const h=mx>mn?(dl[i]-mn)/(mx-mn)*36:0;c.fillStyle='#fcd034';c.fillRect(x-4,66-h-2,8,h+2);c.fillStyle='#ff7a2f';c.fillRect(x-4,y0-6,8,12)});
const lobe=(m)=>{const q=s+m/v.p;if(Math.abs(q)<=1){const a=Math.asin(q);c.setLineDash([6,5]);ln(c,400,y0,400+210*Math.sin(a),y0+210*Math.cos(a),'#ff3b30',2);c.setLineDash([]);T(c,'grating lobe',400+210*Math.sin(a),y0+210*Math.cos(a)+14,'#ff7a6e',12,'center')}};lobe(1);lobe(-1);
ln(c,400,y0,400+230*s,y0+230*Math.cos(th),'#4ade80',5);T(c,'main beam '+v.th+'°',400+230*s,y0+230*Math.cos(th)+16,'#4ade80',14,'center')},
o:v=>{const s=Math.sin(v.th*Math.PI/180),gl=[1,-1].some(m=>Math.abs(s+m/v.p)<=1);return[['Steering angle',v.th+'°'],['Max delay across array',((v.n-1)*v.p*.513*Math.abs(s)/1.54*1000).toFixed(0)+' ns'],['Array width',((v.n-1)*v.p*.513).toFixed(1)+' mm (at 3 MHz)'],['Grating lobes',gl?'Present: pitch too large':'None: pitch ≤ λ/2 is safe']]},
tip:'Try this: change the angle and the delay bars tilt while the wavefront turns. Raise the pitch beyond λ/2 and extra grating lobes appear, sending energy in unwanted directions. More elements give a narrower beam.'},
{n:'Anisotropy',g:'Tendons and other fibrous tissues reflect sound like a mirror: they look bright only when the beam hits them head-on.',
ctl:[['a','Probe angle','°',-30,30,0,1],['m','Tissue',['Tendon','Ligament','Nerve','Muscle'],0]],
d(c,t,v){const sg=[4,6,9,13][v.m],A=Math.exp(-((v.a/sg)**2)),th=v.a*Math.PI/180,px=220,py=205,L=150,sn=Math.sin(th),cs=Math.cos(th);
c.fillStyle='#3a1a2a';c.fillRect(20,py,400,70);for(let i=0;i<10;i++)ln(c,20,py+4+i*7,420,py+4+i*7,'#ffd2a8',2);T(c,'Fibres run left to right',24,py+88,'#9db4d8',12);
c.setLineDash([4,4]);ln(c,px,py-170,px,py,'#9db4d8',1);c.setLineDash([]);
c.save();c.translate(px-L*sn,py-L*cs);c.rotate(Math.PI/2-th);c.fillStyle='#fcd034';c.fillRect(-44,-16,44,32);ln(c,0,0,L,0,'rgba(252,208,52,.75)',6);c.restore();
ln(c,px,py,px+L*sn,py-L*cs,'rgba(255,59,48,.8)',3);T(c,'mirror-like reflection',px+L*sn+8,py-L*cs+4,'#ff7a6e',12);
ln(c,px,py,px-L*sn,py-L*cs,'rgba(56,189,248,'+(.1+.9*A)+')',4);T(c,'echo back to probe',20,40,'#38bdf8',13);
T(c,'Image of the tissue',470,50,'#e9f0ff',14);const g=Math.round(25+215*A);c.fillStyle='rgb('+g+','+g+','+g+')';c.fillRect(470,60,310,110);
for(let i=0;i<11;i++)ln(c,470,68+i*9.5,780,68+i*9.5,'rgba(0,0,0,.18)',1);
T(c,A>.7?'Bright: normal-looking tendon':A>.3?'Getting darker':'Dark: could be mistaken for a tear or fluid',470,190,A>.7?'#4ade80':A>.3?'#fcd034':'#ff7a6e',14);
const X=a=>470+(a+30)/60*310,Y=u=>320-100*u;T(c,'Echo strength vs probe angle',470,215,'#9db4d8',13);ln(c,470,320,780,320,'#9db4d8',1);[-30,0,30].forEach(a=>T(c,(a>0?'+':'')+a+'°',X(a),336,'#9db4d8',11,'center'));
c.strokeStyle='#fcd034';c.lineWidth=3;c.beginPath();for(let a=-30;a<=30;a+=.5){const x=X(a),y=Y(Math.exp(-((a/sg)**2)));a>-30?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();c.fillStyle='#ff3b30';c.beginPath();c.arc(X(v.a),Y(A),7,0,7);c.fill()},
o:v=>{const sg=[4,6,9,13][v.m],A=Math.exp(-((v.a/sg)**2));return[['Probe angle',v.a+'°'],['Tissue',['Tendon','Ligament','Nerve','Muscle'][v.m]],['Echo strength',(A*100).toFixed(0)+'%'],['Appearance',A>.7?'Bright (normal)':A>.3?'Fading':'Dark: artifact']]},
tip:'Try this: tilt the probe a few degrees on a tendon and it fades fast. Nerve and muscle fade more slowly. Re-angle the probe to be perpendicular, or rock it, before calling a dark tendon torn.'}
,
{n:'Lateral Resolution & Focusing',g:'The beam is narrowest at the focus. Two reflectors side by side can be separated only if they are further apart than the beam is wide.',
ctl:[['f','Frequency','MHz',2,10,5,.5],['D','Aperture width','mm',5,30,15,1],['F','Focal depth','cm',1,12,5,.5],['z','Depth of the two dots','cm',1,14,5,.5],['d','Distance between the dots','mm',.5,8,2,.1]],
d(c,t,v){const lam=1.54/v.f,F=v.F*10,z=v.z*10,w0=Math.max(.3,1.22*lam*F/v.D),bw=q=>Math.min(100,Math.sqrt(w0*w0+(v.D*(q-F)/F)**2)),k=3.4,top=40,cx=210,yy=q=>top+q*1.85,bz=bw(z),ok=v.d>=bz;
const Lp=[],Rp=[];for(let q=0;q<=140;q+=3){const h=Math.min(bw(q),60)*k/2;Lp.push([cx-h,yy(q)]);Rp.push([cx+h,yy(q)])}
c.beginPath();Lp.concat(Rp.reverse()).forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle='rgba(252,208,52,.2)';c.fill();c.strokeStyle='#fcd034';c.lineWidth=2;c.stroke();
c.fillStyle='#ff7a2f';c.fillRect(cx-v.D*k/2,top-12,v.D*k,12);T(c,'Probe and beam (side view)',cx,top-18,'#ff7a2f',12,'center');
c.setLineDash([5,5]);ln(c,40,yy(F),380,yy(F),'#9db4d8',1);c.setLineDash([]);T(c,'focus '+v.F+' cm',44,yy(F)-5,'#9db4d8',12);
[-1,1].forEach(s=>{c.fillStyle='#ff3b30';c.beginPath();c.arc(cx+s*v.d*k/2,yy(z),5,0,7);c.fill()});
const bh=Math.min(bz,60)*k/2;ln(c,cx-bh,yy(z)+16,cx+bh,yy(z)+16,'#38bdf8',3);T(c,'beam width '+bz.toFixed(1)+' mm',cx,yy(z)+34,'#38bdf8',13,'center');
const ppm=Math.min(60,300/(v.d+2*bz)),sg=bz/2.355*ppm,p1=620-v.d*ppm/2,p2=620+v.d*ppm/2,y0=190,g=x=>Math.exp(-.5*((x-p1)/sg)**2)+Math.exp(-.5*((x-p2)/sg)**2);
T(c,'Echo signal across the beam',620,top-6,'#e9f0ff',14,'center');
c.beginPath();c.moveTo(460,y0);for(let x=460;x<=780;x++)c.lineTo(x,y0-70*Math.min(1,g(x)*.75));c.lineTo(780,y0);c.closePath();c.fillStyle='rgba(252,208,52,.25)';c.fill();c.strokeStyle='#fcd034';c.lineWidth=3;c.stroke();
[p1,p2].forEach(p=>{c.fillStyle='#ff3b30';c.beginPath();c.arc(p,y0+14,5,0,7);c.fill()});
T(c,'What the image shows',460,246,'#9db4d8',13);const r=Math.min(14,Math.max(4,bz*ppm/6)),col=ok?'#4ade80':'#ff3b30';
c.fillStyle=ok?'#fcd034':'#ff7a2f';c.strokeStyle=c.fillStyle;if(ok){[p1,p2].forEach(p=>{c.beginPath();c.arc(p,278,r,0,7);c.fill()})}else{c.lineWidth=2*r;c.lineCap='round';c.beginPath();c.moveTo(p1,278);c.lineTo(p2,278);c.stroke();c.lineCap='butt'}
T(c,ok?'Resolved: two separate dots':'Merged: seen as one structure',780,320,col,15,'right')},
o:v=>{const lam=1.54/v.f,F=v.F*10,w0=Math.max(.3,1.22*lam*F/v.D),bz=Math.min(100,Math.sqrt(w0*w0+(v.D*(v.z*10-F)/F)**2));return[['Beam width at the focus',w0.toFixed(1)+' mm'],['Beam width at the dots',bz.toFixed(1)+' mm'],['Distance between dots',v.d.toFixed(1)+' mm'],['Near zone length',(v.D*v.D/(4*lam)/10).toFixed(0)+' cm'],['Verdict',v.d>=bz?'Resolved':'Merged']]},
tip:'Try this: put the dots at the focal depth and they separate easily. Move them well away from the focus and they merge. A higher frequency or a wider aperture narrows the focus, but the beam spreads faster beyond it.'},
{n:'Common Artifacts',g:'See how reverberation, shadowing, posterior enhancement and mirror images are made, and what to do about each.',
at:[{n:'Reverberation',cause:'Sound bounces back and forth between the probe and a strong reflector.',look:'Equally spaced repeat lines below the reflector, fading with depth.',fix:'Change the probe angle or position, reduce gain, or use tissue harmonics.'},
{n:'Acoustic shadowing',cause:'A stone or bone reflects or absorbs most of the sound, so little reaches the tissue behind it.',look:'A dark band behind the structure.',fix:'Scan from another angle. The shadow helps to confirm a stone.'},
{n:'Posterior enhancement',cause:'Fluid attenuates less than the tissue beside it, so the tissue behind a cyst receives more sound.',look:'A bright band behind a fluid-filled structure.',fix:'Use it as a sign of fluid. Check the TGC if it distracts.'},
{n:'Mirror image',cause:'A strong curved reflector such as the diaphragm bounces the beam to a structure and back, so a copy is drawn deeper than the reflector.',look:'A duplicate of the structure on the far side of the reflector.',fix:'Change the angle or scan window. The copy moves or vanishes.'}],
ctl:[['a','Artifact',['Reverberation','Acoustic shadowing','Posterior enhancement','Mirror image'],0],['z','Structure depth','cm',1,5.5,3,.5],['s','Strength or size','',1,10,6,1]],
d(c,t,v){const A=v.a,z=v.z,s=v.s,X1=40,X2=420,Y0=50,PW=336,PH=240,P=30,at=this.at[A],cx=21,L=2,cxp=X1+172,yz=Y0+z*P,
rn=(i,j)=>(((i*73856093)^(j*19349663))>>>0)%1000/1000-.5,dep=j=>(j+.5)*8/30,gy=g=>{g=Math.round(255*Math.max(0,Math.min(1,g)));return'rgb('+g+','+g+','+g+')'};
const B=(i,j)=>{const d=dep(j),a=Math.abs(i-cx),dx=a*8/30;let b=.2;
if(A==0){if(a<=7)for(let n=1;n<=8;n++){const dn=n*z;if(dn<=8&&Math.abs(d-dn)<.14)b=Math.max(b,Math.min(1,s/10*1.4*.55**(n-1)))}}
else if(A==1){if(a<=2&&Math.abs(d-z)<.22)b=1;else if(d>z+.22&&a<=3)b=.2*(1-s/11)}
else if(A==2){const rad=.3+.07*s;if(dx*dx+(d-z)**2<rad*rad)b=.03;else if(d>z+rad&&dx<=rad*1.15)b=Math.min(1,.2*(1+s*.14))}
else{if(Math.abs(d-z)<.12)b=.4+.6*s/10;else if(dx*dx+(d-L)**2<.12)b=.9;else if(z>L+.6&&dx*dx+(d-(2*z-L))**2<.12)b=.9*(.3+.7*s/10)}
return b+rn(i,j)*.1};
c.fillStyle='#0a1a30';c.fillRect(X1,Y0,PW,PH);
for(let i=0;i<42;i++)for(let j=0;j<30;j++){c.fillStyle=gy(B(i,j));c.fillRect(X2+i*8,Y0+j*8,8,8)}
c.strokeStyle='#1d4d8f';c.lineWidth=1;c.strokeRect(X1,Y0,PW,PH);c.strokeRect(X2,Y0,PW,PH);
for(let m=0;m<=8;m+=2)T(c,m+' cm',X1-6,Y0+m*P+4,'#9db4d8',11,'right');
T(c,'Real anatomy',X1,Y0-8,'#e9f0ff',14);T(c,'What the machine displays',X2,Y0-8,'#fcd034',14);
c.fillStyle='#ff7a2f';c.fillRect(cxp-20,Y0-5,40,5);c.fillRect(X2+172-20,Y0-5,40,5);
if(A==0){c.fillStyle='#fcd034';c.fillRect(cxp-56,yz-4,112,8);T(c,'strong reflector',cxp+62,yz+4,'#fcd034',12);c.setLineDash([4,3]);ln(c,cxp,Y0,cxp,yz,'#ff7a6e',2);ln(c,cxp+12,yz,cxp+12,Y0,'#ff7a6e',2);ln(c,cxp+24,Y0,cxp+24,yz,'#ff7a6e',2);c.setLineDash([]);T(c,'sound bounces between probe and plate',X1+8,Y0+PH-8,'#ff7a6e',12)}
else if(A==1){c.setLineDash([4,3]);c.strokeStyle='#9db4d8';c.lineWidth=1;c.strokeRect(cxp-24,yz+8,48,Y0+PH-yz-8);c.setLineDash([]);c.fillStyle='#fcd034';c.beginPath();c.arc(cxp,yz,8,0,7);c.fill();T(c,'stone',cxp+16,yz+4,'#fcd034',12);T(c,'little sound reaches here',cxp+30,Y0+PH-8,'#9db4d8',12)}
else if(A==2){c.strokeStyle='#38bdf8';c.lineWidth=2;c.beginPath();c.arc(cxp,yz,(.3+.07*s)*P,0,7);c.stroke();T(c,'fluid-filled cyst',cxp+(.3+.07*s)*P+8,yz+4,'#38bdf8',12)}
else{c.strokeStyle='#fcd034';c.lineWidth=5;c.beginPath();c.moveTo(X1,yz);c.lineTo(X1+PW,yz);c.stroke();T(c,'strong curved reflector',X1+8,yz-8,'#fcd034',12);c.fillStyle='#ff3b30';c.beginPath();c.arc(cxp,Y0+L*P,10,0,7);c.fill();T(c,'lesion',cxp+16,Y0+L*P+4,'#ff7a6e',12)}
const sy=Y0+((t*50)%PH);ln(c,X2,sy,X2+PW,sy,'rgba(252,208,52,.35)',2);
if(A==3&&z<=L+.6)T(c,'Move the reflector deeper than the lesion (2 cm)',X2+PW/2,Y0+PH+16,'#ff7a6e',12,'center');
WR(c,at.n+': '+at.cause,40,Y0+PH+36,720,16,'#9db4d8',13)},
o(v){const a=this.at[v.a];return[['Artifact',a.n],['Cause',a.cause],['Appearance',a.look],['What to do',a.fix]]},
tip:'Try this: switch between the four types and move the structure deeper or shallower. Reverberation lines sit at multiples of the reflector depth. A change of probe angle makes real structures stay put and artifacts move or vanish.'}
,
{n:'Bioeffects & Safety (ALARA)',g:'Use the lowest output and the shortest time that answers the clinical question. Watch the MI and TI on the screen.',
ctl:[['m','Mode',['B-mode','Colour Doppler','Spectral Doppler'],0],['p','Output power','%',10,100,60,5],['f','Frequency','MHz',2,10,3.5,.5],['t','Scan time','min',1,60,10,1]],
k(v){const MI=2.5*v.p/100/Math.sqrt(v.f),TI=v.p/100*[.35,.8,1.8][v.m]*Math.sqrt(v.f/3),lim=TI<=.7?Infinity:TI<=1?30:TI<=1.5?15:TI<=2?4:TI<=2.5?1:.5,ok=MI<=1.9&&(TI<=.7||v.t<=lim);return{MI,TI,lim,ok}},
d(c,t,v){const K=this.k(v),m=v.m,px=130,py=36,L=110,hot='rgba(255,59,48,'+Math.min(.7,K.TI/3)+')',ang=Math.sin(t*2)*.5;
c.fillStyle='#ff7a2f';c.fillRect(px-30,py-10,60,10);T(c,'Beam in the patient',px,py+L+22,'#9db4d8',12,'center');
if(m<2){c.fillStyle=hot;c.beginPath();c.moveTo(px,py);c.arc(px,py,L,Math.PI/2-.5,Math.PI/2+.5);c.closePath();c.fill();for(let i=-2;i<=2;i++)ln(c,px,py,px+L*Math.sin(i*.25),py+L*Math.cos(i*.25),'rgba(252,208,52,.25)',1);ln(c,px,py,px+L*Math.sin(ang),py+L*Math.cos(ang),'#fcd034',3);
if(m==1){c.strokeStyle='#38bdf8';c.lineWidth=2;c.strokeRect(px-35,py+40,70,45)}}
else{c.fillStyle=hot;c.beginPath();c.arc(px,py+85,24,0,7);c.fill();ln(c,px,py,px,py+L,'#fcd034',4);c.fillStyle='#38bdf8';c.fillRect(px-8,py+80,16,10)}
WR(c,['The beam sweeps across the field, so heat is spread out.','The beam sweeps, but the colour box adds extra pulses.','The beam stays in one place with long pulses, so heat builds up.'][m],30,py+L+42,200,15,'#e9f0ff',12);
[['Mechanical index (MI)',K.MI,2.5,1.9,'MI '+K.MI.toFixed(2),'1.9 is the usual upper limit'],['Thermal index (TI)',K.TI,3,.7,'TI '+K.TI.toFixed(2),'Up to 0.7: no time limit for fetal scanning (guide)'],['Scan time',v.t,60,K.lim,v.t+' min',isFinite(K.lim)?'Suggested limit at this TI: '+K.lim+' min':'No limit at this TI']].forEach(([n,val,mx,lm,lb,note],i)=>{const y=60+i*68,over=isFinite(lm)&&val>lm,col=i==1?(over?'#fcd034':'#4ade80'):(over?'#ff3b30':'#4ade80');T(c,n,270,y-8,'#e9f0ff',14);c.fillStyle='#12396b';c.fillRect(270,y,480,18);c.fillStyle=col;c.fillRect(270,y,480*Math.min(1,val/mx),18);if(isFinite(lm)&&lm<=mx)ln(c,270+480*lm/mx,y-4,270+480*lm/mx,y+22,'#fff',3);T(c,lb,750,y-8,'#e9f0ff',13,'right');T(c,note,270,y+36,'#9db4d8',12)});
T(c,K.ok?'✅ Within the simplified guidance':'❌ Reduce the power or the scan time',270,284,K.ok?'#4ade80':'#ff7a6e',16);T(c,'Teaching values only. Follow your machine display and your local guideline.',270,308,'#9db4d8',12)},
o(v){const K=this.k(v);return[['Mechanical index',K.MI.toFixed(2)],['Thermal index',K.TI.toFixed(2)],['Suggested time limit',isFinite(K.lim)?K.lim+' min':'None'],['Verdict',K.ok?'Within guidance':'Reduce output or time']]},
tip:'Try this: switch to spectral Doppler at full power and the TI jumps, because the beam stays in one place. Lower the power and shorten the scan to bring it back. At the same output, a lower frequency gives a higher MI.'},
{n:'Transducer Types',g:'Each probe shape gives a different image field. Match the probe to the task and the depth.',
pb:[{n:'Linear array',fr:'5 to 15 MHz',md:6,a:0,ha:0,sh:'Rectangular image with the best detail near the surface.',use:'Thyroid, breast, veins, tendons and other superficial structures.'},
{n:'Curvilinear array',fr:'2 to 6 MHz',md:20,a:4,ha:30,sh:'Wide curved sector with good depth and a wide view.',use:'Abdomen, pelvis and obstetric scanning through the abdominal wall.'},
{n:'Phased array',fr:'1 to 5 MHz',md:20,a:1,ha:35,sh:'Small footprint with a sector that widens with depth.',use:'Heart between the ribs, and deep structures through a small window.'},
{n:'Endocavity probe',fr:'5 to 10 MHz',md:8,a:1,ha:60,sh:'Very wide sector close to the probe.',use:'Transvaginal and transrectal scanning close to the target.'}],
tk:['Thyroid','Abdominal or obstetric scan','Heart between the ribs','Transvaginal pelvic scan','Leg vein'],
mt:[[2,0,0,0],[0,2,1,0],[0,0,2,0],[0,1,0,2],[2,1,0,0]],
ctl:[['p','Probe',['Linear array','Curvilinear array','Phased array','Endocavity probe'],0],['t','Task',['Thyroid','Abdominal or obstetric scan','Heart between the ribs','Transvaginal pelvic scan','Leg vein'],0],['z','Image depth','cm',2,20,8,1]],
d(c,t,v){const P=this.pb[v.p],sc=this.mt[v.t][v.p],X0=40,Y0=50,Wd=360,Ht=240,cx=220,K=12,ha=P.ha*Math.PI/180,Dm=Math.min(v.z,P.md),ay=Y0-K*P.a;
const path=D=>{c.beginPath();if(v.p==0){c.rect(cx-30,Y0,60,K*D)}else{for(let i=0;i<=20;i++){const th=-ha+2*ha*i/20,x=cx+K*P.a*Math.sin(th),y=ay+K*P.a*Math.cos(th);i?c.lineTo(x,y):c.moveTo(x,y)}for(let i=20;i>=0;i--){const th=-ha+2*ha*i/20,r=P.a+D;c.lineTo(cx+K*r*Math.sin(th),ay+K*r*Math.cos(th))}c.closePath()}};
c.save();c.beginPath();c.rect(X0,Y0-30,Wd,Ht+30);c.clip();
if(v.z>P.md){path(v.z);c.setLineDash([5,4]);c.strokeStyle='#ff3b30';c.lineWidth=2;c.stroke();c.setLineDash([])}
path(Dm);c.fillStyle='rgba(252,208,52,.22)';c.fill();c.strokeStyle='#fcd034';c.lineWidth=2;c.stroke();
const sw=Math.sin(t*3);if(v.p==0)ln(c,cx+sw*28,Y0,cx+sw*28,Y0+K*Dm,'#fcd034',2);else{const th=sw*ha;ln(c,cx+K*P.a*Math.sin(th),ay+K*P.a*Math.cos(th),cx+K*(P.a+Dm)*Math.sin(th),ay+K*(P.a+Dm)*Math.cos(th),'#fcd034',2)}
c.restore();c.fillStyle='#ff7a2f';c.fillRect(cx-Math.max(14,v.p==0?30:K*P.a*Math.sin(ha)),Y0-12,Math.max(28,v.p==0?60:2*K*P.a*Math.sin(ha)),12);
for(let m=0;m<=20;m+=5)T(c,m+' cm',X0+4,Y0+m*K+4,'#9db4d8',11);
if(v.z>P.md)T(c,'No usable signal beyond about '+P.md+' cm',cx,Y0+Ht-6,'#ff7a6e',12,'center');
T(c,P.n,420,Y0+10,'#fcd034',20);T(c,'Frequency: '+P.fr,420,Y0+36,'#e9f0ff',15);let y=WR(c,P.sh,420,Y0+62,350,19,'#e9f0ff',14);y=WR(c,'Used for: '+P.use,420,y+4,350,19,'#9db4d8',14);
T(c,'Task: '+this.tk[v.t],420,y+22,'#e9f0ff',15);const col=['#ff7a6e','#fcd034','#4ade80'][sc];T(c,['❌ Poor choice: change the probe.','⚠️ Works, but is not ideal.','✅ Best choice for this task.'][sc],420,y+50,col,17)},
o(v){const P=this.pb[v.p];return[['Probe',P.n],['Frequency',P.fr],['Max useful depth','about '+P.md+' cm'],['Match for the task',['Poor','Acceptable','Best'][this.mt[v.t][v.p]]]]},
tip:'Try this: pick each task and cycle through the four probes. Linear gives detail but little depth. Curvilinear gives a wide, deep view. Phased fits between ribs. Endocavity gets close to the target with a high frequency.'},
{n:'Time Gain Compensation (TGC)',g:'Echoes from deep tissue come back weaker. TGC adds gain with depth so that the same tissue looks equally bright from top to bottom.',
rs:[{f:3,a:0,b:0,c:0,e:0,g:0},{f:3,a:6,b:18,c:30,e:42,g:0},{f:3,a:0,b:20,c:45,e:50,g:0}],
ctl:[['sc','Preset',['Flat: no TGC','Well set TGC','Too much far-field gain'],0],['f','Frequency','MHz',2,8,3,.5],['a','TGC at 2 cm','dB',-20,50,0,1],['b','TGC at 6 cm','dB',-20,50,0,1],['c','TGC at 10 cm','dB',-20,50,0,1],['e','TGC at 14 cm','dB',-20,50,0,1],['g','Overall gain','dB',-20,20,0,1]],
tg(d,v){const p=[[2,v.a],[6,v.b],[10,v.c],[14,v.e]];if(d<=2)return v.a;if(d>=14)return v.e;for(let i=0;i<3;i++)if(d<=p[i+1][0])return p[i][1]+(p[i+1][1]-p[i][1])*(d-p[i][0])/(p[i+1][0]-p[i][0]);return v.e},
lv(d,v){return 50+v.g+this.tg(d,v)-v.f*d},
k(v){let mn=1e9,mx=-1e9,sm=0,n=0;for(let d=1;d<=15;d++){const L=this.lv(d,v);mn=Math.min(mn,L);mx=Math.max(mx,L);sm+=L;n++}const rg=mx-mn,mean=sm/n,a=this.lv(2,v),b=this.lv(14,v),ok=rg<=10&&mean>=35&&mean<=65;
return{ok,rg,a,b,msg:ok?'Even brightness from top to bottom.':a-b>10?'The deep image is darker than the near field: raise the deep TGC sliders.':b-a>10?'The deep image is too bright: lower the far TGC sliders.':mean<35?'The whole image is too dark: raise the overall gain.':mean>65?'The whole image is too bright: lower the overall gain.':'The brightness is uneven: adjust the middle sliders.'}},
d(c,t,v){const K=this.k(v),gy=g=>{g=Math.round(255*Math.max(0,Math.min(1,g)));return'rgb('+g+','+g+','+g+')'},rn=(i,j)=>(((i*73856093)^(j*19349663))>>>0)%1000/1000-.5,X=q=>60+(q+60)*270/160,Y=d=>50+d*15;
c.fillStyle='rgba(74,222,128,.14)';c.fillRect(X(45),50,X(55)-X(45),240);T(c,'target',X(50),46,'#4ade80',11,'center');
ln(c,X(0),50,X(0),290,'#12396b',1);ln(c,X(50),50,X(50),290,'#12396b',1);[-50,0,50,100].forEach(q=>T(c,q,X(q),304,'#9db4d8',11,'center'));T(c,'dB',X(-60)-4,304,'#9db4d8',11,'right');
for(let d=0;d<=15;d+=5)T(c,d+' cm',54,Y(d)+4,'#9db4d8',11,'right');
const pl=(fn,col)=>{c.strokeStyle=col;c.lineWidth=3;c.beginPath();for(let d=0;d<=16;d+=.5){const q=Math.max(-60,Math.min(100,fn(d))),x=X(q),y=Y(d);d?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()};
pl(d=>-v.f*d,'#ff7a6e');pl(d=>this.tg(d,v),'#38bdf8');pl(d=>this.lv(d,v),'#fcd034');
T(c,'loss',62,24,'#ff7a6e',13);T(c,'TGC',112,24,'#38bdf8',13);T(c,'echo level',160,24,'#fcd034',13);
T(c,'Image of uniform tissue with 3 small targets',440,40,'#e9f0ff',13);
for(let i=0;i<40;i++)for(let j=0;j<30;j++){const d=(j+.5)/30*16;c.fillStyle=gy((this.lv(d,v)+rn(i,j)*8-20)/50);c.fillRect(440+i*8,50+j*8,8,8)}
[3,8,13].forEach(d=>{c.fillStyle=gy((this.lv(d,v)+16-20)/50);c.beginPath();c.arc(600,Y(d),6,0,7);c.fill()});c.strokeStyle='#1d4d8f';c.lineWidth=1;c.strokeRect(440,50,320,240);
T(c,K.msg,400,326,K.ok?'#4ade80':'#ff7a6e',14,'center')},
o(v){const K=this.k(v);return[['Round-trip loss at 15 cm',(v.f*15).toFixed(0)+' dB'],['Echo level near and far',K.a.toFixed(0)+' and '+K.b.toFixed(0)+' dB'],['Spread over depth',K.rg.toFixed(0)+' dB'],['Verdict',K.ok?'Even':'Uneven'],['Ideal TGC at 2, 6, 10, 14 cm',[2,6,10,14].map(d=>Math.round(v.f*d)).join(', ')+' dB']]},
tip:'Try this: start with Flat and the deep image fades. Choose Well set TGC and it evens out. Then raise the frequency and the far image darkens again, so it needs more far-field gain. Overall gain lifts everything, TGC shapes brightness by depth.'}
,
{n:'Colour, Power & CW Doppler',g:'Four Doppler modes answer different questions. Change the angle, velocity and PRF and watch each mode respond.',
ctl:[['m','Doppler mode',['Colour Doppler','Power Doppler','Pulsed-wave Doppler','Continuous-wave Doppler'],0],['th','Beam-to-flow angle','°',0,90,60,1],['u','Artery velocity','cm/s',10,200,60,5],['p','PRF (scale)','kHz',2,12,6,.5]],
k(v){const cs=Math.cos(v.th*Math.PI/180),fa=.0649*v.u*cs,fv=-.0649*v.u*.5*cs,ny=v.p/2;return{cs,fa,fv,ny,al:(v.m==0||v.m==2)&&Math.abs(fa)>ny,n90:cs<.05}},
d(c,t,v){const K=this.k(v),m=v.m,th=v.th*Math.PI/180,cx=210,X0=40,Y0=50,Wd=340,Ht=240;
c.fillStyle='#02101f';c.fillRect(X0,Y0,Wd,Ht);c.strokeStyle='#1d4d8f';c.lineWidth=1;c.strokeRect(X0,Y0,Wd,Ht);c.fillStyle='#ff7a2f';c.fillRect(cx-24,Y0-6,48,6);
const ves=(cy,art)=>{c.save();c.beginPath();c.rect(X0,Y0,Wd,Ht);c.clip();c.translate(cx,cy);c.rotate(Math.PI/2-th);let col='#6b7280';
if(m==0){if(K.n90)col='#2a2a2a';else if(art)col=Math.abs(K.fa)<K.ny?'rgba(255,59,48,'+(.3+.7*Math.abs(K.fa)/K.ny)+')':'#38bdf8';else col=Math.abs(K.fv)<K.ny?'rgba(59,130,246,'+(.3+.7*Math.abs(K.fv)/K.ny)+')':'#ff9a3c'}
else if(m==1)col='rgba(255,154,60,'+(.35+.65*K.cs)+')';
c.fillStyle=col;c.fillRect(-75,-12,150,24);if(m==0&&art&&K.al&&!K.n90){c.fillStyle='#ff3b30';c.fillRect(-75,-12,150,6);c.fillRect(-75,6,150,6)}
const dr=art?-1:1;ln(c,-40*dr,0,40*dr,0,'#e9f0ff',2);c.fillStyle='#e9f0ff';c.beginPath();c.moveTo(48*dr,0);c.lineTo(36*dr,-6);c.lineTo(36*dr,6);c.fill();c.restore()};
ves(110,true);ves(215,false);
if(m==3){c.fillStyle='rgba(252,208,52,.14)';c.fillRect(cx-10,Y0,20,Ht)}c.setLineDash([5,4]);ln(c,cx,Y0,cx,Y0+Ht,'#fcd034',2);c.setLineDash([]);
if(m==2){c.strokeStyle='#38bdf8';c.lineWidth=3;c.strokeRect(cx-14,101,28,18)}
T(c,'artery (flow towards probe)',X0+6,Y0+16,'#e9f0ff',12);T(c,'vein (flow away, slower)',X0+6,Y0+Ht-8,'#e9f0ff',12);T(c,'angle '+v.th+'°',cx+22,Y0+34,'#fcd034',13);
const R0=420;
if(m<2){T(c,m==0?'Colour Doppler':'Power Doppler',R0,Y0+8,'#fcd034',20);
WR(c,m==0?(K.n90?'Almost no colour: the beam is nearly perpendicular to the flow (cos 90° = 0).':K.al?'Aliasing: the centre of the artery shows the wrong colour because the shift is above the Nyquist limit.':'Red is flow towards the probe and blue is flow away. Brighter colour means faster flow along the beam.'):'Shows how much moving blood is present, not its direction. It has no aliasing and is much less angle dependent, so it suits slow flow and small vessels.',R0,Y0+36,350,20,'#e9f0ff',15);
if(m==0){for(let i=0;i<20;i++){const f=(i-9.5)/9.5;c.fillStyle=f<0?'rgba(59,130,246,'+(.2+.8*-f)+')':'rgba(255,59,48,'+(.2+.8*f)+')';c.fillRect(R0+i*16,230,16,16)}T(c,'away',R0,262,'#9db4d8',12);T(c,'towards',R0+320,262,'#9db4d8',12,'right');T(c,'0',R0+160,262,'#9db4d8',12,'center')}}
else{const bl=190,sc=m==2?100/K.ny:100/13;T(c,m==2?'Pulsed-wave spectrum at the gate':'Continuous-wave spectrum along the beam',R0,Y0+8,'#fcd034',14);ln(c,R0,bl,780,bl,'#9db4d8',1);
if(m==2){c.setLineDash([5,4]);[-1,1].forEach(s=>ln(c,R0,bl-s*100,780,bl-s*100,'#ff3b30',1));c.setLineDash([]);T(c,'+Nyquist',R0+4,bl-104,'#ff7a6e',11);T(c,'-Nyquist',R0+4,bl+112,'#ff7a6e',11)}
for(let x=0;x<360;x++){const ph=(((x/110-t*.4)%1)+1)%1,pk=.25+.75*Math.exp(-(((ph-.2)/.08)**2))+.1*Math.exp(-(((ph-.5)/.1)**2));let a=K.fa*pk;if(m==2)a=(((a+K.ny)%(2*K.ny))+2*K.ny)%(2*K.ny)-K.ny;
ln(c,R0+x,bl,R0+x,bl-a*sc,'rgba(252,208,52,.35)',1);c.fillStyle=(m==2&&a<0&&K.fa>0)?'#ff7a6e':'#fff';c.fillRect(R0+x,bl-a*sc,1,2);
if(m==3){const b=K.fv*pk;ln(c,R0+x,bl,R0+x,bl-b*sc,'rgba(56,189,248,.35)',1);c.fillStyle='#38bdf8';c.fillRect(R0+x,bl-b*sc,1,2)}}
WR(c,m==2?'The gate picks one depth, so only the artery is shown. Peaks above the Nyquist limit wrap round the baseline.':'CW has no aliasing and measures very high velocities, but it cannot tell which vessel a signal came from. Here the artery (gold) and the vein (blue) both appear.',R0,Y0+224,360,17,'#e9f0ff',13)}},
o(v){const K=this.k(v),m=v.m;return[['Artery shift',K.fa.toFixed(2)+' kHz'],['Nyquist limit',(m==1||m==3)?'not applicable':K.ny.toFixed(1)+' kHz'],['Strength of this mode',['Direction and mean velocity','Sensitivity to slow flow','Velocity at one chosen depth','Very high velocities, no depth'][m]],['Problem now',m==1?'None: direction not shown':m==3?'None: no depth information':K.n90?'Angle near 90°: no signal':K.al?'Aliasing':'None']]},
tip:'Try this: in colour mode raise the velocity until the centre of the artery flips colour (aliasing), then raise the PRF. Set the angle to 90° and the colour disappears. Power Doppler still shows flow, and CW has no aliasing but no depth.'},
{n:'Display Modes: A, B & M',g:'The same moving structure shown three ways. A-mode plots amplitude, B-mode builds a picture, M-mode plots motion over time.',
ctl:[['m','Display mode',['A-mode','B-mode','M-mode'],2],['r','Heart rate','bpm',40,160,70,5],['a','Wall movement','cm',.2,2,1,.1]],
d(c,t,v){const m=v.m,fq=v.r/60,rf=tt=>[[.3,.9],[2,.4],[4+v.a*Math.sin(6.2832*fq*tt),1],[7,.8]],X0=60,Y0=50,Wd=680,Ht=240,gy=g=>{g=Math.round(255*Math.max(0,Math.min(1,g)));return'rgb('+g+','+g+','+g+')'},rn=(i,j)=>(((i*73856093)^(j*19349663))>>>0)%1000/1000-.5;
c.fillStyle='#02101f';c.fillRect(X0,Y0,Wd,Ht);
if(m==0){const pc=Wd/8,bl=Y0+Ht-20;ln(c,X0,bl,X0+Wd,bl,'#9db4d8',1);for(let q=0;q<=8;q++)T(c,q,X0+q*pc,bl+14,'#9db4d8',11,'center');T(c,'Depth (cm)',X0+Wd,bl+14,'#9db4d8',12,'right');
rf(t).forEach(([d,a],i)=>{const x=X0+d*pc,h=160*a;ln(c,x,bl,x,bl-h,'#fcd034',3);c.fillStyle='#ff3b30';c.beginPath();c.arc(x,bl-h,4,0,7);c.fill();if(i==2)T(c,'moving wall',x,bl-h-10,'#ff7a6e',12,'center')});T(c,'Echo strength',X0+6,Y0+16,'#9db4d8',12)}
else if(m==1){for(let i=0;i<85;i++)for(let j=0;j<30;j++){const d=(j+.5)*8/30,e=(i-42)/50,dw=4+v.a*Math.sin(6.2832*fq*t)*(1-e*e),L=[[.3,.9],[2+.4*Math.cos(e*3),.4],[dw,1],[7,.8]];let b=.12+rn(i,j)*.06;L.forEach(([dd,a])=>{if(Math.abs(d-dd)<.15)b=Math.max(b,a)});c.fillStyle=gy(b);c.fillRect(X0+i*8,Y0+j*8,8,8)}}
else{for(let x=0;x<Wd;x++){const tt=t-(Wd-1-x)/170;rf(tt).forEach(([d,a])=>{c.fillStyle=gy(.25+.75*a);c.fillRect(X0+x,Y0+d*30-1,1,3)})}ln(c,X0+Wd-1,Y0,X0+Wd-1,Y0+Ht,'rgba(252,208,52,.6)',1);T(c,'Time (4 s window) →',X0+Wd,Y0+Ht+14,'#9db4d8',12,'right')}
if(m>0)for(let q=0;q<=8;q+=2)T(c,q+' cm',X0-6,Y0+q*30+4,'#9db4d8',11,'right');
c.strokeStyle='#1d4d8f';c.lineWidth=1;c.strokeRect(X0,Y0,Wd,Ht);
T(c,['A-mode: one scan line, one graph. Each spike is an echo. Used for eye measurements.','B-mode: many scan lines build a 2D picture. The wall moves, but you only see snapshots.','M-mode: one scan line repeated over time. The wavy line is the moving wall.'][m],X0,Y0-12,'#e9f0ff',14)},
o:v=>[['Mode',['A-mode','B-mode','M-mode'][v.m]],['Shows',['Amplitude against depth','A 2D picture','Motion along one line over time'][v.m]],['Heart rate',v.r+' bpm = '+(60/v.r).toFixed(2)+' s per beat'],['Typical use',['Eye length','Most scanning','Heart valves and fetal heart rate'][v.m]]],
tip:'Try this: switch between the three modes and change the heart rate. In M-mode, the faster the rate, the closer the waves. A bigger wall movement makes taller waves. M-mode samples the line many times per second, so it has excellent temporal resolution.'},
{n:'Image Processing',g:'Persistence and the grey map change the noise, the lag and the contrast of what you see.',
st:{f:-1,b:[]},
ctl:[['n','Persistence','frames',1,8,1,1],['z','Noise level','',1,10,5,1],['c','Grey map',['Linear','High contrast','Low contrast'],0]],
d(c,t,v){const ST=this.st,fr=Math.floor(t*15),cols=40,rows=30,N=cols*rows,hs=(i,f)=>{let x=(i*73856093)^(f*19349663);x=Math.imul(x^(x>>>13),1274126177);return((((x^(x>>>16))>>>0)%1000)/1000)-.5};
if(ST.f!==fr){ST.f=fr;const lx=20+8*Math.sin(6.2832*.5*fr/15),a=new Float32Array(N);for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const L=((i-lx)**2+(j-15)**2)<20?.4:0;a[j*cols+i]=.3+L+hs(j*cols+i,fr)*v.z*.07}ST.b.push(a);if(ST.b.length>8)ST.b.shift()}
const n=Math.min(v.n,ST.b.length),raw=ST.b[ST.b.length-1],cv=x=>v.c==0?x:v.c==1?(x-.45)*2+.5:.25+.5*x,gy=g=>{g=Math.round(255*Math.max(0,Math.min(1,cv(g))));return'rgb('+g+','+g+','+g+')'};
for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const k=j*cols+i;let s=0;for(let q=0;q<n;q++)s+=ST.b[ST.b.length-1-q][k];c.fillStyle=gy(raw[k]);c.fillRect(40+i*8,60+j*8,8,8);c.fillStyle=gy(s/n);c.fillRect(440+i*8,60+j*8,8,8)}
c.strokeStyle='#1d4d8f';c.lineWidth=1;c.strokeRect(40,60,320,240);c.strokeRect(440,60,320,240);T(c,'Raw frame',40,50,'#e9f0ff',14);T(c,'After persistence ('+v.n+' frame'+(v.n>1?'s':'')+')',440,50,'#fcd034',14);
T(c,'A bright spot moves from side to side. Watch it smear as persistence rises.',40,322,'#9db4d8',13)},
o:v=>[['Persistence',v.n+' frames'],['Noise left','about '+Math.round(100/Math.sqrt(v.n))+'% of the raw noise'],['Motion lag','about '+Math.round((v.n-1)/2/15*1000)+' ms'],['Best for',v.n<=2?'Fast-moving structures (heart, fetus)':v.n>=5?'Still organs (thyroid, liver)':'General scanning']],
tip:'Try this: raise the persistence and the noise falls roughly with the square root of the number of frames, but the moving spot smears. Switch the grey map to see high and low contrast. Use high persistence only on still organs.'},
{n:'Quality Assurance (Phantom)',g:'A phantom with known targets shows faults before they affect patients. Choose a fault and read what the test image tells you.',
ctl:[['f','Fault',['No fault','Dead elements','Loss of sensitivity','Distance calibration error'],0],['s','Severity','',1,10,5,1]],
k(v){const f=v.f,s=v.s,pen=f==2?12-.9*s:12,err=f==3?1.2*s:.3,dead=f==1?Math.min(3,Math.ceil(s/3)):0,okP=pen>=10,okD=Math.abs(err)<=2,okE=dead==0;return{pen,err,dead,okP,okD,okE,ok:okP&&okD&&okE}},
d(c,t,v){const K=this.k(v),f=v.f,X0=40,Y0=50,Wd=360,P=17,cx=X0+Wd/2,gy=g=>{g=Math.round(255*Math.max(0,Math.min(1,g)));return'rgb('+g+','+g+','+g+')'},rn=(i,j)=>(((i*73856093)^(j*19349663))>>>0)%1000/1000-.5;
c.save();c.beginPath();c.rect(X0,Y0,Wd,238);c.clip();
for(let i=0;i<45;i++)for(let j=0;j<30;j++){const d=(j+.5)*8/P,fd=d<=K.pen-2?1:Math.max(0,(K.pen-d)/2);c.fillStyle=gy((.22+rn(i,j)*.14)*fd);c.fillRect(X0+i*8,Y0+j*8,8,8)}
[[cx+40,9,14],[cx+90,9,7]].forEach(([x,d,r])=>{c.fillStyle='#000';c.beginPath();c.arc(x,Y0+d*P,r,0,7);c.fill()});
const sc=1+K.err/100;for(let d=2;d<=14;d+=2)if(d<=K.pen){c.fillStyle='#fff';c.beginPath();c.arc(cx-70,Y0+d*P*sc,3,0,7);c.fill()}
for(let k=0;k<5;k++)if(4<=K.pen){c.fillStyle='#fff';c.beginPath();c.arc(cx+10+k*P,Y0+4*P,3,0,7);c.fill()}
for(let k=1;k<=K.dead;k++){c.fillStyle='#000';c.fillRect(X0+60+k*80,Y0,6,238)}
c.restore();c.strokeStyle='#1d4d8f';c.lineWidth=1;c.strokeRect(X0,Y0,Wd,238);T(c,'Phantom image (white pins, black cysts)',X0,Y0-10,'#e9f0ff',13);
for(let d=0;d<=14;d+=2)T(c,d+' cm',X0-4,Y0+d*P+4,'#9db4d8',11,'right');
const R=430;T(c,'Test results',R,Y0+6,'#fcd034',20);
[[K.okP,'Depth of penetration',K.pen.toFixed(1)+' cm (needs 10 or more)'],[K.okD,'Distance accuracy','error '+Math.abs(K.err).toFixed(1)+'% (needs 2% or less)'],[K.okE,'Dead elements',K.dead+' vertical dropout'+(K.dead==1?'':'s')+' (needs none)']].forEach(([ok,n,val],i)=>{const y=Y0+50+i*56;T(c,(ok?'✅ ':'❌ ')+n,R,y,ok?'#4ade80':'#ff7a6e',16);T(c,val,R+26,y+22,'#e9f0ff',14)});
WR(c,K.ok?'Pass: the system can stay in use. Keep this image to compare with the next test.':'Fail: report the fault and have the probe or machine serviced before scanning patients.',R,Y0+232,350,19,K.ok?'#4ade80':'#ff7a6e',15);
T(c,'Teaching values only. Use the manufacturer QA protocol for real tests.',R,Y0+292-5,'#9db4d8',11)},
o(v){const K=this.k(v);return[['Depth of penetration',K.pen.toFixed(1)+' cm'],['Distance error',Math.abs(K.err).toFixed(1)+'%'],['Dead-element lines',K.dead],['Result',K.ok?'Pass':'Fail']]},
tip:'Try this: pick each fault in turn and raise the severity. Dead elements show as dark vertical lines, lost sensitivity makes deep pins vanish, and a calibration error stretches the distances between pins. Compare against the No fault image.'},
{n:'Contrast Agents (CEUS)',g:'Microbubbles make blood light up. A lesion that enhances early and fades early shows a wash-in and washout pattern.',
ctl:[['t','Time after injection','s',0,120,20,1],['mi','Mechanical index','',.05,1.5,.1,.05]],
g2(tt,v){const D=v.mi<=.3?1:Math.exp(-(v.mi-.3)*tt/25),S=v.mi<.08?.5:1;return[(tt/15)*Math.exp(1-tt/15)*D*S,.6*(tt/35)*Math.exp(1-tt/35)*D*S]},
d(c,t,v){const [L,B]=this.g2(v.t,v),gy=g=>{g=Math.round(255*Math.max(0,Math.min(1,g)));return'rgb('+g+','+g+','+g+')'},rn=(i,j)=>(((i*73856093)^(j*19349663))>>>0)%1000/1000-.5;
for(let i=0;i<40;i++)for(let j=0;j<30;j++){const les=((i-20)**2+(j-15)**2)<49;c.fillStyle=gy(.08+.7*(les?L:B)+rn(i,j)*.08);c.fillRect(40+i*8,60+j*8,8,8)}
c.strokeStyle='#1d4d8f';c.lineWidth=1;c.strokeRect(40,60,320,240);T(c,'Contrast-enhanced image (liver and a lesion)',40,50,'#e9f0ff',14);
const X=s=>420+s*3,Y=a=>280-a*190;c.fillStyle='rgba(252,208,52,.1)';c.fillRect(X(10),70,X(40)-X(10),210);T(c,'arterial',X(25),84,'#fcd034',12,'center');T(c,'portal and late',X(80),84,'#9db4d8',12,'center');
ln(c,420,280,780,280,'#9db4d8',1);[0,30,60,90,120].forEach(s=>T(c,s,X(s),296,'#9db4d8',11,'center'));T(c,'Seconds after injection',780,312,'#9db4d8',12,'right');
[['#fcd034',0],['#38bdf8',1]].forEach(([col,k])=>{c.strokeStyle=col;c.lineWidth=3;c.beginPath();for(let s=0;s<=120;s++){const a=this.g2(s,v)[k],x=X(s),y=Y(Math.min(1.05,a));s?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()});
T(c,'lesion',428,Y(1)+14,'#fcd034',13);T(c,'liver',X(60),Y(.35)-8,'#38bdf8',13);ln(c,X(v.t),70,X(v.t),280,'#ff3b30',2);
const ph=v.t<10?'Before the bubbles arrive: no signal.':v.t<=40?'Arterial phase: '+(L>B*1.2?'the lesion is brighter than the liver (hyperenhancement).':'the lesion is not clearly brighter than the liver.'):'Portal and late phase: '+(L<B*.8?'the lesion is darker than the liver (washout).':'the lesion is similar to the liver.');
T(c,ph+(v.mi>.3?' High MI: bubbles are being destroyed.':''),40,326,'#e9f0ff',13)},
o(v){const [L,B]=this.g2(v.t,v);return[['Time',v.t+' s'],['Phase',v.t<10?'Before arrival':v.t<=40?'Arterial':'Portal and late'],['Lesion vs liver',L>B*1.2?'Brighter':L<B*.8?'Darker':'Similar'],['Bubbles',v.mi>.3?'Being destroyed (high MI)':'Preserved (low MI)']]},
tip:'Try this: slide the time from 0 to 120 s. The lesion lights up first, then fades below the liver. Raise the MI above 0.3 and the whole image fades, because the bubbles burst. This pattern is illustrative and real interpretation needs training and a protocol.'},
{n:'Shear Wave Elastography',g:'Shear waves travel faster in stiffer tissue. The machine turns wave speed into stiffness in kPa and colours the map.',
ctl:[['l','Lesion stiffness','kPa',3,80,40,1],['b','Liver stiffness','kPa',3,30,6,1]],
d(c,t,v){const cL=Math.sqrt(v.l/3),cB=Math.sqrt(v.b/3),gy=g=>{g=Math.round(255*Math.max(0,Math.min(1,g)));return'rgb('+g+','+g+','+g+')'},rn=(i,j)=>(((i*73856093)^(j*19349663))>>>0)%1000/1000-.5,hue=k=>240-240*Math.min(1,k/60);
for(let i=0;i<40;i++)for(let j=0;j<30;j++){const les=((i-28)**2+(j-14)**2)<36,k=(les?v.l:v.b)*(1+rn(i,j)*.12);c.fillStyle=gy(.3+rn(i,j)*.2);c.fillRect(40+i*8,60+j*8,8,8);c.fillStyle='hsl('+hue(k)+',85%,48%)';c.fillRect(440+i*8,60+j*8,8,8)}
c.strokeStyle='#1d4d8f';c.lineWidth=1;c.strokeRect(40,60,320,240);c.strokeRect(440,60,320,240);T(c,'B-mode image',40,50,'#e9f0ff',14);T(c,'Elastogram (colour = stiffness)',440,50,'#fcd034',14);
const xw=40+((t*55*cB/1.4)%320);ln(c,xw,60,xw,300,'rgba(56,189,248,.9)',3);T(c,'push',46,76,'#38bdf8',12);T(c,'shear wave front',44,292,'#38bdf8',12);
for(let q=0;q<24;q++){c.fillStyle='hsl('+hue(60*(1-q/23))+',85%,48%)';c.fillRect(770,60+q*10,10,10)}T(c,'60+',766,70,'#9db4d8',11,'right');T(c,'0 kPa',766,300,'#9db4d8',11,'right');
[[440+28*8+4,60+14*8+4,v.l,cL],[440+8*8,60+24*8,v.b,cB]].forEach(([x,y,k,cc])=>{c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(x,y,12,0,7);c.stroke();c.fillStyle='rgba(0,0,0,.65)';c.fillRect(x+14,y-10,92,20);T(c,k+' kPa  '+cc.toFixed(1)+' m/s',x+18,y+5,'#fff',12)});
T(c,'Stiffness E ≈ 3 × density × speed². Sample values: 6 kPa ≈ 1.4 m/s, 40 kPa ≈ 3.6 m/s.',40,326,'#9db4d8',13)},
o:v=>[['Lesion',v.l+' kPa, '+Math.sqrt(v.l/3).toFixed(1)+' m/s'],['Liver',v.b+' kPa, '+Math.sqrt(v.b/3).toFixed(1)+' m/s'],['Stiffness ratio',(v.l/v.b).toFixed(1)+' ×'],['Liver reading',v.b<7?'Within the usual normal range':v.b<=12?'Raised':'High: may suggest advanced fibrosis']],
tip:'Try this: make the lesion stiffer and the red area gets brighter while the shear wave speed rises. Raise the liver stiffness and the whole background shifts towards red. Cut-offs differ between devices and diseases, so these ranges are teaching values only.'},
{n:'Lung Ultrasound (POCUS)',g:'Air reflects almost all the sound, so lung signs are reverberation patterns rather than anatomy. Learn A-lines, B-lines and lung sliding.',
nm:['Normal lung','Interstitial syndrome (B-lines)','Consolidation (pneumonia)','Pneumothorax'],
ctl:[['c','Condition',['Normal lung','Interstitial syndrome (B-lines)','Consolidation (pneumonia)','Pneumothorax'],0],['d','Pleural line depth','cm',1,4,2,.5]],
d(c,t,v){const q=v.c,dp=v.d,gy=g=>{g=Math.round(255*Math.max(0,Math.min(1,g)));return'rgb('+g+','+g+','+g+')'},rn=(i,j)=>(((i*73856093)^(j*19349663))>>>0)%1000/1000-.5,off=Math.floor(t*14);
for(let i=0;i<42;i++)for(let j=0;j<30;j++){const d=(j+.5)*8/30;let b;
if(d<dp-.1)b=.3+.08*rn(i,j);
else if(Math.abs(d-dp)<.14)b=q==3?.9:.72+.2*Math.sin(i*.9-t*9);
else if(d<dp)b=.3;
else if(q==0||q==3){b=.04+(rn(i,j)+.5)*.05;for(let n=2;n<=4;n++)if(Math.abs(d-n*dp)<.1)b=Math.max(b,.5*Math.pow(.6,n-2))}
else if(q==1){b=.05+(rn(i,j)+.5)*.04;if([8,18,28,36].some(x=>Math.abs(i-x)<=1))b=Math.max(b,.65-.35*(d-dp)/(8-dp))}
else{b=.3+.1*rn(i,j);if(d>dp+.5&&d<dp+3&&rn(i,j)>.4)b=.85}
c.fillStyle=gy(b);c.fillRect(40+i*8,60+j*8,8,8);
let m;if(d<dp-.1)m=.25+.1*Math.sin(j*2.1);else if(Math.abs(d-dp)<.14)m=.9;else if(d<dp)m=.3;else if(q==0||q==1)m=.12+(rn(i+off,j)+.5)*.4;else if(q==2)m=.3+.12*rn(i+off,j);else m=.25+.12*Math.sin(j*2.1)+(Math.abs(d-2*dp)<.12?.3:0);
c.fillStyle=gy(m);c.fillRect(420+i*8,60+j*8,8,8)}
c.strokeStyle='#1d4d8f';c.lineWidth=1;c.strokeRect(40,60,336,240);c.strokeRect(420,60,336,240);T(c,'B-mode',40,50,'#e9f0ff',14);T(c,'M-mode (time across)',420,50,'#fcd034',14);
const py=60+dp*30;T(c,'pleural line',44,py-6,'#fcd034',12);if(q==0||q==3)T(c,'A-lines',44,60+2*dp*30-6,'#38bdf8',12);if(q==1)T(c,'B-lines',44,290,'#38bdf8',12);
T(c,['Seashore sign: waves above, sand below','Seashore sign: waves above, sand below','Tissue-like pattern below the pleura','Barcode sign: lines continue below the pleura'][q],420,316,q==3?'#ff7a6e':'#4ade80',13);
T(c,['Lung sliding present','Lung sliding present, B-lines erase A-lines','Pleura irregular, air bronchograms','No lung sliding'][q],40,316,'#e9f0ff',13)},
o:v=>[['Condition',['Normal lung','Interstitial syndrome (B-lines)','Consolidation (pneumonia)','Pneumothorax'][v.c]],['B-mode',['Pleural line that slides, A-lines below','Sliding pleura, vertical B-lines','Tissue-like lung with bright air dots','Pleural line without sliding, A-lines'][v.c]],['M-mode',['Seashore sign','Seashore sign','Tissue-like pattern','Barcode sign'][v.c]],['Why','Air reflects about 99.9% of sound at the pleura']],
tip:'Try this: change the pleural depth and watch the A-lines move: they sit at multiples of the pleural depth because they are reverberations. B-lines erase the A-lines. In pneumothorax the pleura does not slide, which gives the barcode sign. Always read signs together with the clinical picture.'}
,
{n:'Troubleshoot the Image',g:'Five real scanning problems. Choose the right control to fix each one: the wrong control will not help.',
nm:['Deep liver is dark','Doppler trace wraps','Ghost vessel at wrong depth','Lesion hidden in grey haze','Tendon looks torn'],
ds:['A large patient scanned with a 7 MHz probe. The deep liver is dark.','A uterine artery Doppler trace: the peaks are cut off and wrap below the baseline.','A deep vessel at 14 cm also appears as a second signal at the wrong depth.','A lesion 10 dB below the liver background is lost in a flat grey image.','A supraspinatus tendon looks dark and thin. Is it torn?'],
rs:[{f:7,g:0,D:14,p:8,r:60,t:0},{f:5,g:0,D:10,p:4,r:60,t:0},{f:3,g:0,D:14,p:8,r:60,t:0},{f:7,g:0,D:8,p:8,r:100,t:0},{f:7,g:0,D:8,p:8,r:60,t:8}],
ctl:[['sc','Case',['1. Deep liver is dark','2. Doppler trace wraps','3. Ghost vessel at wrong depth','4. Lesion hidden in grey haze','5. Tendon looks torn'],0],
['f','Probe frequency','MHz',2,12,7,.5],['g','Gain','dB',-20,30,0,1],['D','Depth','cm',4,20,14,1],['p','Doppler scale (PRF)','kHz',2,20,8,.5],['r','Dynamic range','dB',30,100,60,5],['t','Probe tilt','°',-15,15,0,1],['h','Hint',['Hide','Show'],0]],
k(v){const q=v.sc;
if(q==0){const L=60+v.g-v.f*v.D,ok=L>=10&&v.D>=12&&v.g<=15;return{ok,key:'Echo level at the bottom: '+L.toFixed(0)+' dB (needs 10 or more)',msg:ok?'The deep liver is clear. Lower frequency gave the penetration and gain only topped it up.':v.g>15?'Gain is too high: the whole image is noisy.':v.D<12?'Depth is too shallow: the deep liver is cut off.':'The deep liver is still too dark.',hint:'Gain cannot bring back echoes lost to attenuation. Change the frequency.'}}
if(q==1){const sh=.65*v.f,ny=v.p/2,ok=sh<=ny;return{ok,sh,ny,key:'Doppler shift '+sh.toFixed(1)+' kHz vs Nyquist limit '+ny.toFixed(1)+' kHz',msg:ok?'The full trace shows above the baseline. No aliasing.':'The peaks wrap round to the other side of the baseline: aliasing.',hint:'Raise the Doppler scale (PRF), or use a lower frequency.'}}
if(q==2){const mx=77/v.p,ok=14<=mx,dd=14-Math.floor(14/mx)*mx;return{ok,mx,dd,key:'Max unambiguous depth '+mx.toFixed(1)+' cm (vessel at 14 cm)',msg:ok?'No ghost: every echo returns before the next pulse. Remember that a lower PRF limits the fastest flow you can measure.':'The deep echo arrives after the next pulse and is drawn at '+dd.toFixed(1)+' cm.',hint:'Lower the PRF so each echo returns before the next pulse is sent.'}}
if(q==3){const G=d=>Math.max(0,Math.min(1,(d+v.g+v.r)/v.r)),b=G(-38),l=G(-48),ok=b-l>=.15&&b>=.25&&b<=.75;return{ok,key:'Lesion contrast '+Math.round((b-l)*100)+'% (needs 15% or more)',msg:ok?'The lesion now stands out against the liver.':b<.25?'The image is too dark: raise the gain.':b>.75?'The image is too bright: lower the gain.':'Everything is a similar grey: the dynamic range is too wide.',hint:'Lower the dynamic range for contrast, then adjust gain for brightness.'}}
const A=Math.exp(-((v.t/4)**2)),ok=A>=.6;return{ok,A,key:'Tendon echo strength '+Math.round(A*100)+'% at '+v.t+'° tilt',msg:ok?'The tendon is bright and fibrillar. It is intact: the dark look was anisotropy.':'The tendon is dark because the beam is not perpendicular to its fibres.',hint:'Rock or tilt the probe until it is perpendicular to the fibres.'}},
d(c,t,v){const K=this.k(v),q=v.sc,X0=40,Y0=44,Wd=320,Ht=240,gy=g=>{g=Math.round(255*Math.max(0,Math.min(1,g)));return'rgb('+g+','+g+','+g+')'},rn=(i,j)=>(((i*73856093)^(j*19349663))>>>0)%1000/1000-.5,yc=m=>Y0+m*12;
c.save();c.beginPath();c.rect(X0,Y0,Wd,Ht);c.clip();c.fillStyle='#000';c.fillRect(X0,Y0,Wd,Ht);
if(q==0){for(let i=0;i<40;i++)for(let j=0;j<30;j++){const dd=(j+.5)/30*v.D;let L=60+v.g-v.f*dd+rn(i,j)*16;if((i-20)**2*.5+(j-17)**2<26)L-=14;c.fillStyle=gy(L/60);c.fillRect(X0+i*8,Y0+j*8,8,8)}
if(v.D<12)T(c,'liver continues below this depth',X0+Wd/2,Y0+Ht-8,'#ff7a6e',12,'center')}
else if(q==1){const bl=Y0+Ht/2,pp=100/K.ny;c.setLineDash([5,4]);[-1,1].forEach(s=>ln(c,X0,bl-s*100,X0+Wd,bl-s*100,'#ff3b30',1));c.setLineDash([]);ln(c,X0,bl,X0+Wd,bl,'#9db4d8',1);
for(let x=0;x<Wd;x++){const ph=(((x/110-t*.4)%1)+1)%1,val=K.sh*(.25+.75*Math.exp(-(((ph-.2)/.08)**2))+.1*Math.exp(-(((ph-.5)/.1)**2))),w=(((val+K.ny)%(2*K.ny))+2*K.ny)%(2*K.ny)-K.ny,y=bl-w*pp;ln(c,X0+x,bl,X0+x,y,'rgba(252,208,52,.35)',1);c.fillStyle=w<0?'#ff7a6e':'#fff';c.fillRect(X0+x,y,1,2)}
T(c,'+Nyquist',X0+4,bl-104,'#ff7a6e',11);T(c,'-Nyquist',X0+4,bl+112,'#ff7a6e',11);T(c,'baseline',X0+Wd-4,bl-4,'#9db4d8',11,'right')}
else if(q==2){for(let i=0;i<40;i++)for(let j=0;j<30;j++){c.fillStyle=gy(.1+rn(i,j)*.14);c.fillRect(X0+i*8,Y0+j*8,8,8)}
for(let m=0;m<=20;m+=5)T(c,m+' cm',X0+Wd-4,yc(m)+12,'#9db4d8',11,'right');
if(K.mx<20){c.setLineDash([5,4]);ln(c,X0,yc(K.mx),X0+Wd,yc(K.mx),'#ff3b30',1.5);c.setLineDash([]);T(c,'max unambiguous depth '+K.mx.toFixed(1)+' cm',X0+6,yc(K.mx)-5,'#ff7a6e',12)}
c.fillStyle='#ff3b30';c.beginPath();c.arc(X0+100,yc(14),12,0,7);c.fill();T(c,'real vessel 14 cm',X0+120,yc(14)+4,'#e9f0ff',12);
if(!K.ok){c.strokeStyle='#38bdf8';c.lineWidth=3;c.setLineDash([4,3]);c.beginPath();c.arc(X0+100,yc(K.dd),12,0,7);c.stroke();c.setLineDash([]);T(c,'ghost at '+K.dd.toFixed(1)+' cm',X0+120,yc(K.dd)+4,'#38bdf8',12)}}
else if(q==3){for(let i=0;i<40;i++)for(let j=0;j<30;j++){const db=((i-20)**2+(j-15)**2<49?-48:-38)+rn(i,j)*8;c.fillStyle=gy((db+v.g+v.r)/v.r);c.fillRect(X0+i*8,Y0+j*8,8,8)}}
else{for(let i=0;i<40;i++)for(let j=0;j<30;j++){const bd=j>=11&&j<=19;c.fillStyle=gy(bd?.08+.82*K.A*(.65+.35*Math.abs(Math.sin(j*2.3+i*.15)))+rn(i,j)*.1:.2+rn(i,j)*.18);c.fillRect(X0+i*8,Y0+j*8,8,8)}
T(c,'probe tilt '+v.t+'°',X0+6,Y0+Ht-8,'#e9f0ff',13)}
c.restore();c.strokeStyle=K.ok?'#4ade80':'#ff3b30';c.lineWidth=3;c.strokeRect(X0,Y0,Wd,Ht);T(c,'Image on the screen',X0,Y0-10,'#e9f0ff',14);
const col=K.ok?'#4ade80':'#ff7a6e';T(c,'Case '+(q+1)+' of 5: '+this.nm[q],410,Y0-10,'#fcd034',15);
WR(c,this.ds[q],410,Y0+16,360,20,'#e9f0ff',15);T(c,K.ok?'✅ Fixed':'❌ Not fixed yet',410,Y0+112,col,24);
WR(c,K.msg,410,Y0+142,360,20,col,15);if(v.h)WR(c,'Hint: '+K.hint,410,Y0+222,360,19,'#fcd034',14)},
o(v){const K=this.k(v);return[['Case',(v.sc+1)+' of 5'],['Status',K.ok?'Fixed':'Not fixed yet'],['Key reading',K.key],['Hint',v.h?K.hint:'Choose Show in the Hint box']]},
tip:'Change one control at a time. If the image does not improve, you picked the wrong control. Switching case resets the sliders. Many real problems are fixed by choosing the right probe or PRF, not by turning up the gain.'}

];
const MK=['Probe choice: swap between, say, a 3.5 MHz curvilinear and a 10 MHz linear probe to change frequency and wavelength.',
'Probe choice, gain and TGC: use a lower-frequency probe for deep structures, then use TGC and gain to make up for loss with depth.',
'Always use gel and keep the probe perpendicular. Change the scan angle to reduce refraction and edge-shadow artifacts.',
'Angle-correct cursor: align it with the vessel flow and keep the Doppler angle at 60° or less.',
'Resolution or Res preset and a higher-frequency probe give shorter pulses and better axial detail.',
'Scale/PRF and baseline shift: raise the scale, move the baseline down or up, or switch to a lower-frequency probe to remove aliasing.',
'THI button (labelled Harm, THI or similar, depending on brand): switch it on to image with harmonics, especially in larger patients.',
'Coupling gel removes the air gap, which would otherwise cause a huge impedance mismatch between probe and skin.',
'Same reason we avoid air gaps and bowel gas: use gel, apply gentle pressure, fill the bladder or change the scan window.',
'Depth, sector width, focal zones and line density: reduce them to raise the frame rate shown on screen.',
'Elevation focus is fixed in the lens: place small structures at the focal depth and choose the right probe (small parts vs abdomen).',
'Probe and preset selection: every probe has a resonance range that sets the frequencies you can choose.',
'Depth and Doppler gate depth, plus PRF/scale: reduce the depth or change the PRF to remove ghost echoes.',
'Frequency presets (Pen/Gen/Res) and the Doppler spectral display show the frequencies contained in the echoes.',
'Compound button (often SonoCT, CrossXBeam or SRI, depending on brand): reduces speckle and shadows. Turn it off to see true shadowing.',
'Output power and the on-screen MI and TI: follow ALARA, using the lowest output that gives a diagnostic image, especially in obstetrics.',
'Gate (sample volume) size, Doppler gain and angle: use a small gate in the vessel centre and moderate gain for a clean spectrum.',
'Dynamic range or compression and overall gain: lower the range for contrast, raise it for smoother grey scale. Gain only brightens or darkens.',
'This is built into the probe, not a knob. Broadband probes with heavy backing give short pulses and better axial resolution.',
'Phased-array probes steer automatically. On linear probes you can steer the colour box and the Doppler cursor.',
'Probe angle: rock or tilt the probe so it is perpendicular to tendon fibres, and re-check before calling a dark tendon torn.',
'Focus position and number of focal zones: place the focus at or just below the structure of interest. More zones improve detail but lower the frame rate.',
'Probe angle and position, gain, harmonics (THI) and compound imaging all change how artifacts look. Re-check a finding from a second window or angle.',
'Output or power control, the on-screen MI and TI, and the Doppler preset: use the lowest output and the shortest time that answers the clinical question. Avoid routine spectral Doppler in early pregnancy.',
'Probe selection menu or probe connector: choose the probe by depth and scanning window, then pick the matching preset.',
'TGC sliders and the auto-optimize button: keep near-field sliders lower and far-field sliders higher so the image is evenly bright.',
'Doppler mode buttons (Colour, Power, PW, CW), the scale or PRF, beam steering and angle correction: pick the mode for the question, then set the scale and the angle.',
'Mode buttons (B, M and Doppler): in M-mode you place a cursor line on the B-mode image and the machine plots the motion along that line over time.',
'Persistence or frame averaging, and the grey map or curve menu: use more persistence on still organs and less on the heart or the fetus.',
'Your quality assurance routine: scan the phantom at set intervals, keep the images and report any fault. Compare each test with the first image taken when the machine was new.',
'Contrast mode or a low-MI preset, on machines that offer it. Contrast agents need training, a protocol and a trained team.',
'Elastography or shear wave mode: place the ROI in a uniform area, keep the probe still and ask the patient to hold their breath.',
'Lung preset or a curvilinear or phased probe, with M-mode: scan between the ribs with the probe perpendicular to the pleural line.',
'Good scanning habit: change one control at a time and see which one actually fixes the image. The right control is rarely gain.'],
QZ=[
[['If frequency doubles in soft tissue, wavelength…',['doubles','halves','stays the same'],1],['Speed of sound is set by…',['the source','the medium','the amplitude'],1],['Wavelength =',['speed ÷ frequency','speed × frequency','frequency ÷ speed'],0],['The average speed of sound in soft tissue is about…',['1540 m/s','330 m/s','4080 m/s'],0],['Diagnostic ultrasound frequencies are usually…',['2 to 18 MHz','20 Hz to 20 kHz','1 to 2 kHz'],0]],
[['Which probe penetrates deepest?',['3 MHz','10 MHz','15 MHz'],0],['Attenuation in soft tissue is about…',['0.5 dB/cm/MHz','5 dB/cm/MHz','50 dB/cm/MHz'],0],['Raising the frequency makes attenuation…',['increase','decrease','stay the same'],0],['Which loses sound the fastest?',['bone','soft tissue','water'],0],['The main cause of attenuation in soft tissue is…',['absorption (conversion to heat)','refraction','reflection at the skin'],0]],
[['Which boundary reflects most sound?',['Soft tissue to fat','Soft tissue to air','Soft tissue to muscle'],1],['Refraction needs…',['oblique incidence and different speeds','perpendicular incidence only','equal speeds'],0],['The angle of reflection equals…',['the angle of incidence','90°','twice the angle of incidence'],0],['Refraction is described by…',['Snell’s law','Ohm’s law','the Doppler equation'],0],['Refraction can cause…',['a lateral shift or duplicated image','acoustic enhancement','aliasing'],0]],
[['Doppler shift is zero when the angle is…',['0°','60°','90°'],2],['Doppler shift is proportional to…',['cos θ','sin θ','1 ÷ cos θ'],0],['Doppler shift increases when the blood speed…',['increases','decreases','stays constant'],0],['Angle correction should ideally be…',['60° or less','exactly 90°','more than 70°'],0],['Flow towards the probe gives…',['a positive shift (higher frequency)','a negative shift','no shift'],0]],
[['Axial resolution equals…',['spatial pulse length ÷ 2','beam width','pulse length × 2'],0],['Which improves axial resolution?',['higher frequency','lower frequency','longer pulses'],0],['Axial resolution is measured…',['along the beam','across the beam','through the slice'],0],['Fewer cycles per pulse gives…',['better axial resolution','worse axial resolution','no change'],0],['Axial resolution is also called…',['longitudinal or range resolution','lateral resolution','temporal resolution'],0]],
[['Nyquist limit =',['PRF','PRF ÷ 2','PRF × 2'],1],['Aliasing is reduced by…',['lowering the PRF','raising the PRF or scale','increasing gain'],1],['Aliasing appears when the Doppler shift is…',['above the Nyquist limit','below the Nyquist limit','exactly zero'],0],['Moving the baseline helps aliasing by…',['giving more room to one flow direction','raising the frequency','adding gain'],0],['Which Doppler mode never aliases?',['continuous-wave Doppler','pulsed-wave Doppler','colour Doppler'],0]],
[['The harmonic frequency is…',['f₀ ÷ 2','2 × f₀','f₀ + 1 MHz'],1],['Harmonics are created…',['in the tissue as the beam travels','inside the probe','by the monitor'],0],['Harmonic imaging mainly improves…',['contrast and clutter reduction','penetration','the Nyquist limit'],0],['Harmonics are strongest…',['in the centre of the beam at moderate depth','at the skin surface','far outside the beam'],0],['Harmonics come from…',['non-linear sound propagation in tissue','linear reflection only','the monitor'],0]],
[['Acoustic impedance Z =',['density × speed','density ÷ speed','speed ÷ density'],0],['Gel is used to…',['remove the air gap','warm the probe','raise the frequency'],0],['A large impedance difference gives…',['a strong reflection','a weak reflection','no reflection'],0],['The unit of acoustic impedance is the…',['rayl','hertz','decibel'],0],['The matching layer has an impedance…',['between the crystal and the skin','higher than the crystal','lower than air'],0]],
[['Sound cannot travel in a vacuum because…',['there are no particles','it is too cold','it is too bright'],0],['Sound is a…',['mechanical wave','electromagnetic wave','light wave'],0],['Sound in tissue travels as…',['compressions and rarefactions','photons','electric charges'],0],['Sound travels fastest in…',['solids','liquids','gases'],0],['Ultrasound in tissue is mainly a…',['longitudinal wave','transverse wave','radio wave'],0]],
[['Frame rate rises when you…',['reduce the depth','add focal zones','increase line density'],0],['Temporal resolution is the same as…',['frame rate','pulse length','beam width'],0],['Fewer focal zones gives…',['a higher frame rate','a lower frame rate','no change'],0],['A narrower sector gives…',['a higher frame rate','a lower frame rate','worse axial resolution'],0],['Good temporal resolution matters most for…',['fast-moving structures such as the heart','still organs','phantom tests'],0]],
[['Elevational resolution relates to…',['slice thickness','pulse length','PRF'],0],['A thick slice causes…',['partial-volume artifact','aliasing','enhancement'],0],['Elevational resolution is measured…',['perpendicular to the scan plane','along the beam','across the image width'],0],['Elevational focus is usually set by…',['an acoustic lens on the probe','the TGC','the PRF'],0],['Small cysts can look filled in because of…',['a thick slice','high frame rate','low gain'],0]],
[['The piezoelectric effect converts…',['voltage and vibration both ways','light into heat','sound into light'],0],['Resonant crystal thickness is…',['λ ÷ 2','λ','2λ'],0],['A thinner crystal gives…',['a higher frequency','a lower frequency','no change'],0],['A common piezoelectric material is…',['PZT (lead zirconate titanate)','copper','glass'],0],['Heating a crystal above the Curie point…',['destroys its piezoelectric property','improves resolution','raises the frequency'],0]],
[['Range ambiguity happens when…',['echoes return after the next pulse is sent','gain is too high','the probe is too wide'],0],['Round-trip time per cm of depth is…',['13 µs','1.3 µs','130 µs'],0],['A deeper image needs…',['a lower PRF','a higher PRF','no change to PRF'],0],['Maximum depth is limited by…',['the time before the next pulse','the probe width','the gain'],0],['Sound takes about how long to reach 10 cm and return?',['130 µs','13 µs','1.3 ms'],0]],
[['Fourier analysis says any wave is…',['a sum of sine waves','one sine only','just noise'],0],['A short pulse has…',['wide bandwidth','narrow bandwidth','one frequency'],0],['A long pulse has…',['narrow bandwidth','wide bandwidth','infinite bandwidth'],0],['Bandwidth is…',['the range of frequencies in the pulse','the pulse amplitude','the beam width'],0],['Broadband probes allow…',['multi-frequency and harmonic imaging','only one frequency','no imaging'],0]],
[['Spatial compounding mainly reduces…',['speckle','attenuation','Doppler shift'],0],['A cost of compounding is…',['lower frame rate','higher PRF','more aliasing'],0],['Speckle is caused by…',['interference of echoes from tiny scatterers','electrical noise only','gel bubbles'],0],['Compounding combines images taken from…',['several beam angles','several patients','several days'],0],['Compounding can reduce…',['shadowing and enhancement artifacts','axial resolution','Doppler shift'],0]],
[['If amplitude doubles, intensity becomes…',['×2','×4','×8'],1],['Intensity =',['power ÷ area','power × area','amplitude ÷ area'],0],['Halving the beam area at the same power makes intensity…',['double','halve','stay the same'],0],['Power is measured in…',['watts','W/cm²','decibels per cm'],0],['A +3 dB change means intensity…',['doubles','halves','increases tenfold'],0]],
[['Spectral broadening is increased by…',['turbulence','laminar flow','a small gate'],0],['Laminar flow shows…',['a clear spectral window','a filled-in window','no signal'],0],['A large sample gate in a small vessel gives…',['more spectral broadening','a clearer window','no signal'],0],['Turbulence is typical just after…',['a stenosis','a normal straight segment','the skin'],0],['Very high Doppler gain can…',['falsely widen the spectrum','remove aliasing','raise the Nyquist limit'],0]],
[['Lower dynamic range gives…',['higher contrast','lower contrast','no change'],0],['Gain controls…',['overall brightness','bandwidth','PRF'],0],['Dynamic range is measured in…',['decibels','hertz','millimetres'],0],['Wide dynamic range gives…',['more shades of grey and a smoother image','higher contrast','a higher frame rate'],0],['Too much gain can…',['hide weak lesions in a bright image','improve resolution','stop aliasing'],0]],
[['More backing damping gives…',['shorter pulses','longer pulses','a higher Q'],0],['Q-factor =',['f₀ ÷ bandwidth','bandwidth ÷ f₀','f₀ × bandwidth'],0],['A low Q probe has…',['wide bandwidth','narrow bandwidth','no bandwidth'],0],['Imaging probes are designed to be…',['low Q (heavily damped)','high Q (lightly damped)','undamped'],0],['Damping lowers the probe’s…',['sensitivity a little','bandwidth','axial resolution'],0]],
[['A phased array steers using…',['electronic time delays','probe movement','a change of frequency'],0],['Grating lobes appear when element pitch is…',['too large','λ/2 or less','zero'],0],['Electronic focusing uses…',['timed delays across the elements','a thicker crystal','higher gain'],0],['Grating lobes can cause…',['false echoes off the main beam','better resolution','acoustic enhancement'],0],['A phased array has a…',['small footprint and sector image','wide rectangular image','single element'],0]],
[['A tendon looks dark when…',['the beam is not perpendicular','the beam is perpendicular','gain is high'],0],['Best way to confirm?',['re-angle the probe','raise the PRF','reduce the depth'],0],['Anisotropy is strongest in…',['tendons and ligaments','liver','fluid'],0],['A tendon looks brightest when the beam is…',['perpendicular to the fibres','oblique to the fibres','parallel to the fibres'],0],['Anisotropy can mimic…',['a tendon tear or tendinopathy','a kidney stone','aliasing'],0]],
[['Lateral resolution is about equal to…',['beam width','pulse length','PRF'],0],['The beam is narrowest…',['at the focus','at the skin','at the deepest point'],0],['Lateral resolution is best when…',['the focus is at the target depth','the focus is at the skin','there is no focus'],0],['A wider aperture (larger probe face) gives…',['a narrower focus','a wider focus','no change'],0],['Lateral resolution separates structures…',['side by side, across the beam','along the beam','in time'],0]],
[['Fluid-filled cysts show…',['posterior enhancement','acoustic shadowing','aliasing'],0],['Reverberation produces…',['equally spaced repeat lines','a dark band','a duplicate image'],0],['Acoustic shadowing is seen behind…',['gallstones or bone','simple cysts','blood vessels'],0],['A mirror image artifact occurs near…',['strong reflectors such as the diaphragm','fluid','soft fat'],0],['Comet-tail artifact is a type of…',['reverberation','shadowing','enhancement'],0]],
[['The mechanical index (MI) estimates the risk of…',['cavitation (non-thermal effects)','tissue heating','aliasing'],0],['ALARA means…',['as low as reasonably achievable','as loud as reasonably allowed','always look at all angles'],0],['The thermal index (TI) estimates the risk of…',['tissue heating','cavitation','aliasing'],0],['Which mode usually has the highest output?',['spectral (pulsed-wave) Doppler','B-mode','M-mode'],0],['The best way to reduce exposure is to…',['lower the output and shorten scan time','raise the gain','use more gel'],0]],
[['Which probe suits a thyroid scan?',['linear array','curvilinear array','phased array'],0],['Which probe fits between the ribs to scan the heart?',['phased array','linear array','curvilinear array'],0],['Which probe is commonly used for abdominal scans?',['curvilinear array','linear array','pencil probe'],0],['An endocavity probe gives better detail because it…',['sits closer to the organ and uses higher frequency','uses lower frequency','has no crystals'],0],['A linear array produces a…',['rectangular image','sector image','circular image'],0]],
[['TGC compensates for…',['attenuation with depth','a low PRF','aliasing'],0],['To brighten only the deep image you…',['raise the far TGC sliders','raise the near TGC sliders','change nothing'],0],['TGC sliders near the top of the panel control…',['the near field','the far field','the PRF'],0],['Overall gain changes…',['the whole image equally','only deep echoes','only the Doppler trace'],0],['A correctly set TGC gives…',['uniform brightness at all depths','a bright near field and dark far field','only black and white'],0]],
[['Which Doppler mode shows direction in red and blue?',['colour Doppler','power Doppler','continuous-wave Doppler'],0],['Which mode has no aliasing but gives no depth information?',['continuous-wave Doppler','pulsed-wave Doppler','colour Doppler'],0],['Power Doppler is most sensitive to…',['slow, low-volume flow','flow direction','high velocities'],0],['Pulsed-wave Doppler allows…',['sampling at a chosen depth','no aliasing','no depth control'],0],['In colour Doppler, red usually means flow…',['towards the probe','away from the probe','no flow'],0]],
[['M-mode shows…',['motion over time along one line','a 2D picture','amplitude only'],0],['A-mode plots…',['amplitude against depth','brightness in 2D','velocity'],0],['B-mode shows echo strength as…',['brightness','amplitude spikes','sound'],0],['M-mode is especially useful in…',['cardiac and fetal heart rate imaging','thyroid texture','bone density'],0],['M-mode has very high…',['temporal resolution','elevational resolution','contrast'],0]],
[['More persistence gives…',['less noise but more motion lag','more noise','a higher frame rate'],0],['Persistence works by…',['averaging frames','raising the PRF','adding gel'],0],['Pre-processing happens…',['before the image is stored','only after freezing','on the printer'],0],['Edge enhancement makes…',['boundaries look sharper','the image darker','the frame rate higher'],0],['Changing the grey map after freezing is…',['post-processing','pre-processing','beam forming'],0]],
[['A thin vertical dark line on a phantom image suggests…',['dead elements','good gel contact','wrong frequency'],0],['A phantom test should be done…',['regularly, with the results kept','only when the machine breaks','never'],0],['A tissue-mimicking phantom has a speed of sound of about…',['1540 m/s','330 m/s','3000 m/s'],0],['Pin targets in a phantom check…',['resolution and distance accuracy','Doppler colour','patient comfort'],0],['Results from each phantom test should be…',['compared with baseline images','thrown away','only checked once'],0]],
[['Microbubbles give signal because they…',['resonate and scatter nonlinearly','absorb all the sound','are denser than bone'],0],['A high MI will…',['destroy the bubbles','improve the contrast','raise the frequency'],0],['Ultrasound contrast agents are…',['gas-filled microbubbles','iodine liquids','radioactive tracers'],0],['Contrast imaging uses…',['a low mechanical index','the highest MI','only CW Doppler'],0],['Microbubbles stay…',['inside the blood vessels','in the bone','in the gel'],0]],
[['Shear waves travel faster in…',['stiffer tissue','softer tissue','fluid'],0],['Stiffness in kPa is estimated from…',['shear wave speed','echo brightness','frame rate'],0],['Malignant or fibrotic tissue is usually…',['stiffer','softer','the same as normal'],0],['Shear waves are created by…',['an acoustic push pulse','raising the gain','moving the patient'],0],['For reliable liver stiffness readings the patient should…',['hold their breath and stay still','breathe deeply','cough'],0]],
[['A-lines are…',['reverberation artifacts of the pleural line','real lung vessels','shadows from ribs'],0],['The barcode sign on M-mode suggests…',['no lung sliding','normal lung','pneumonia'],0],['Normal lung sliding on M-mode gives the…',['seashore sign','barcode sign','target sign'],0],['Many B-lines usually suggest…',['fluid in the lung (interstitial syndrome)','normal lung','a pneumothorax'],0],['B-lines are…',['vertical lines from the pleura to the bottom of the screen','horizontal repeat lines','dark shadows'],0]],
[['A good way to check a suspected artifact is to…',['change the angle or settings and re-scan','turn up the gain','ignore it'],0],['Which control fixes aliasing on spectral Doppler?',['raise the scale (PRF)','raise the gain','lower the dynamic range'],0],['A deep image is too dark. Try first…',['raising the far TGC or lowering the frequency','lowering the near TGC','raising the PRF'],0],['Colour fills outside the vessel. Try…',['lowering the colour gain','raising the colour gain','switching off B-mode'],0],['The heart looks jumpy and slow. Try…',['reducing the depth or narrowing the sector','adding focal zones','raising persistence'],0]]];
// One explanation per quiz question, same order as QZ.
const QX=[["Wavelength and frequency are inversely related at a fixed speed: λ = c ÷ f. Doubling f in soft tissue (c = 1540 m/s) halves λ, for example 0.77 mm at 2 MHz becomes 0.385 mm at 4 MHz.","Propagation speed depends only on the medium's stiffness and density. The source sets frequency, and amplitude sets loudness or brightness, but neither changes how fast sound travels.","λ = c ÷ f, which comes from c = f × λ. In soft tissue a 5 MHz beam gives λ = 1540 ÷ 5,000,000 ≈ 0.31 mm.","Scanners assume 1540 m/s, which works out to about 13 µs of round-trip time per cm of depth. 330 m/s is roughly the speed in air, and 4080 m/s is closer to bone.","Diagnostic imaging uses roughly 2 to 18 MHz, well above the 20 kHz upper limit of human hearing. 20 Hz to 20 kHz is the audible range, not ultrasound."],["Lower frequencies attenuate less, so 3 MHz reaches the deepest. Higher frequencies such as 10 to 15 MHz give better resolution but lose energy quickly, so they suit superficial work.","The rule of thumb is 0.5 dB/cm/MHz in soft tissue. A 5 MHz beam therefore loses about 2.5 dB per cm travelled, or 5 dB per cm of depth counting the round trip.","Attenuation is roughly proportional to frequency (about 0.5 dB/cm/MHz), so a higher frequency loses more energy per cm and penetrates less deeply.","Bone attenuates very strongly through absorption and reflection, giving dense acoustic shadowing. Water attenuates the least, which is why fluid-filled structures show posterior enhancement.","In soft tissue, absorption, where sound energy is converted to heat, is the dominant cause of attenuation. Reflection and scattering contribute less, and refraction only redirects the beam."],["Air's impedance is tiny compared with soft tissue, so nearly 99.9% of the sound reflects at that boundary. Soft tissue to fat or muscle are small mismatches that reflect only a few per cent.","Refraction needs both oblique incidence and a change in propagation speed across the boundary. With perpendicular incidence or equal speeds, the transmitted beam continues without bending.","For specular reflection, the angle of reflection equals the angle of incidence. At oblique angles the echo can miss the probe, which is why perpendicular insonation gives the brightest echoes.","Snell's law, sin θt ÷ sin θi = c2 ÷ c1, links the transmitted angle to the change in speed. The Doppler equation deals with frequency shift, not bending.","The scanner assumes a straight beam path, so a refracted beam puts echoes in the wrong lateral position or creates a duplicate, as seen below the rectus muscles. Enhancement is caused by low attenuation, not refraction."],["The Doppler shift depends on cos θ, and cos 90° = 0. With the beam perpendicular to flow there is no measurable shift, even though blood is moving.","Δf = 2 f₀ v cos θ ÷ c, so the shift scales with cos θ. It is largest at 0° (cos = 1) and zero at 90°.","In Δf = 2 f₀ v cos θ ÷ c the shift is directly proportional to velocity v, so faster blood gives a larger shift.","Keep the insonation angle at 60° or less. Above 60° cos θ changes rapidly, so small angle-correction errors produce large velocity errors, and at 90° no velocity can be measured.","Flow towards the probe compresses the returning waves, raising the received frequency and giving a positive shift. Flow away gives a negative shift."],["Axial resolution = SPL ÷ 2, where SPL = number of cycles × λ. Two reflectors along the beam can be separated if they are more than half a pulse length apart. Beam width governs lateral resolution.","A higher frequency has a shorter wavelength, so the spatial pulse length is shorter and axial resolution improves. Lower frequencies and longer pulses make it worse.","Axial resolution is the ability to separate two reflectors lying one behind the other along the beam's path. Across the beam is lateral resolution, and through the slice is elevational.","SPL = cycles × λ, so fewer cycles per pulse (achieved with heavy backing-layer damping) shortens the pulse and improves axial resolution.","Axial resolution is also known as longitudinal, range, radial or depth resolution. Lateral resolution depends on beam width, and temporal resolution depends on frame rate."],["Nyquist limit = PRF ÷ 2. Each cycle of the Doppler shift needs at least two samples, so with a PRF of 10 kHz the highest shift you can measure without aliasing is 5 kHz.","Raising the PRF or scale raises the Nyquist limit (PRF ÷ 2), so higher shifts are displayed correctly. Lowering the PRF makes aliasing worse, and gain has no effect on it.","Aliasing occurs when the Doppler shift exceeds PRF ÷ 2. The sampling is then too slow, and the signal wraps around to the opposite side of the baseline.","Shifting the baseline gives more of the display range to the flow direction of interest. The Nyquist limit stays the same, but the wrap-around is removed.","Continuous-wave Doppler transmits and receives all the time, so there is no PRF and no Nyquist limit, which means it never aliases. The trade-off is that it cannot tell which depth the signal comes from."],["The second harmonic is twice the transmitted fundamental, 2 × f₀. Transmit at 2 MHz and the system listens at 4 MHz.","Harmonics build up in the tissue as the beam travels, because the pulse distorts non-linearly. The probe transmits only the fundamental, and the monitor only displays the result.","Harmonic imaging reduces clutter, reverberation and side-lobe artefact and improves contrast, for example making cyst contents clearer. It does not improve penetration, because the higher harmonic attenuates more.","Harmonics need distance to build up, so there are almost none at the skin. They are strongest along the high-intensity beam centre at moderate depth and weak in side lobes and in the far field.","Compressions travel slightly faster than rarefactions, so the waveform distorts as it propagates. This non-linear propagation creates energy at 2 × f₀."],["Z = ρ × c, density times propagation speed. Soft tissue is about 1.63 MRayl (1,630,000 rayl).","Even a thin layer of air between probe and skin reflects almost all the sound, because air's impedance is so low. Gel removes that air gap so sound can enter the body.","The intensity reflection coefficient is ((Z2 − Z1) ÷ (Z2 + Z1))², so a bigger impedance mismatch gives a stronger echo. Equal impedances give no reflection.","Impedance is measured in rayls (kg/m²/s). Hertz measures frequency, and decibels express relative intensity or attenuation.","The matching layer's impedance sits between the high-impedance PZT crystal and the much lower-impedance skin. It is usually a quarter wavelength thick, which improves transmission into the patient."],["Sound is a mechanical wave that needs particles to compress and rarefy, so it cannot pass through a vacuum, which has no medium.","Sound is a mechanical wave, a vibration passed from particle to particle in a medium. Electromagnetic waves such as light can cross a vacuum, but sound cannot.","Sound travels as alternating compressions (high pressure and density) and rarefactions (low pressure and density). It does not involve photons or electric charges.","Speed depends mostly on stiffness. Solids are stiffest, so sound is fastest in them (bone about 4080 m/s), slower in liquids and slowest in gases (air about 330 m/s).","In tissue, particles vibrate back and forth parallel to the direction the sound travels, which makes it a longitudinal wave. Shear (transverse) waves die out very quickly in soft tissue."],["Less depth means a shorter echo listening time per line, so each frame is built faster and the frame rate rises. Extra focal zones and higher line density both lower it.","Temporal resolution depends on frame rate: more frames per second captures motion more accurately. Pulse length governs axial resolution, and beam width governs lateral resolution.","Each extra focal zone needs its own pulse along every scan line. Fewer focal zones therefore means fewer pulses per frame and a higher frame rate.","A narrower sector has fewer scan lines per frame, so each frame takes less time and the frame rate goes up. Axial resolution is unaffected.","Rapidly moving structures, such as heart valves or the fetal heart, need a high frame rate to be shown accurately. Still organs show little benefit."],["Elevational resolution is set by slice thickness, the beam's width perpendicular to the scan plane. Pulse length governs axial resolution, and PRF relates to Doppler and frame rate.","A thick slice averages echoes from tissue just above and below the scan plane into one image. This partial-volume (slice-thickness) artefact can put false echoes into fluid-filled structures.","Elevational resolution is measured through the slice, perpendicular to the scan plane. Along the beam is axial resolution, and across the image width is lateral resolution.","On most 1D arrays a fixed curved acoustic lens on the probe face sets elevational focus. Only 1.5D or matrix arrays can focus electronically in that direction.","A thick slice picks up echoes from tissue beside the cyst and averages them into the image, so a small anechoic cyst can look filled in with low-level echoes."],["Piezoelectric crystals work both ways: applied voltage makes them vibrate to transmit, and returning echoes deform them to generate a voltage when receiving.","A crystal resonates when its thickness is half a wavelength in the crystal material, λ ÷ 2. This sets the operating frequency of a pulsed probe.","Thickness = λ ÷ 2, so a thinner crystal has a shorter resonant wavelength and a higher frequency. High-frequency probes use thin crystals.","PZT (lead zirconate titanate) is the standard man-made piezoelectric ceramic in transducers. Copper and glass are not piezoelectric.","Above the Curie point (about 300 to 365 °C for PZT), the crystal loses its polarisation and its piezoelectric property for good. This is why probes must never be heat-sterilised."],["If an echo from a deep reflector arrives after the next pulse has been sent, the system times it from the new pulse and plots it far too shallow. Gain and probe width do not cause this timing error.","Using 1540 m/s, sound travels 1 cm out and 1 cm back (2 cm) in about 13 µs. This is the 13 µs rule used to convert echo time into depth.","Each pulse must wait for echoes to return from the deepest point, so more depth means a longer listening time and fewer pulses per second. Maximum PRF is roughly 77,000 ÷ depth in cm.","The system must hear all echoes from one pulse before sending the next, so the listening time (pulse repetition period) sets the maximum imaging depth. Probe width and gain do not set depth limits.","Using the 13 µs per cm rule, 10 cm × 13 µs = 130 µs round trip. 13 µs is only 1 cm, and 1.3 ms would be 100 cm."],["Fourier's theorem shows any complex waveform, including an ultrasound pulse, can be broken down into a set of sine waves of different frequencies, amplitudes and phases.","A short pulse contains few cycles, which needs many frequencies to build it, so its bandwidth is wide. Bandwidth is roughly inversely proportional to pulse duration.","A long pulse with many cycles is close to a pure sine wave, so it contains a narrow range of frequencies. Only an endless continuous wave approaches a single frequency.","Bandwidth is the spread between the highest and lowest frequencies in the pulse. Amplitude describes strength and beam width describes lateral size, not frequency content.","A wide bandwidth covers many frequencies, so one probe can be switched between frequencies and can receive harmonics at twice the transmitted frequency."],["Speckle patterns change with beam angle, so averaging frames from several angles smooths out the random grainy texture. Attenuation and Doppler shift are not reduced by compounding.","Several frames from different angles are combined into one displayed image, so fewer final images are produced per second. It can also cause motion blur with moving structures.","Speckle is an interference pattern from many tiny scatterers smaller than the wavelength, whose echoes add and cancel. It is acoustic, not electrical noise or gel bubbles.","The beam is electronically steered to several angles and the overlapping frames are averaged into one image, smoothing speckle and improving edge definition.","Because the target is viewed from different directions, areas behind strong or weak attenuators are filled in, so shadowing and enhancement are reduced. This can hide useful diagnostic artifacts."],["Intensity is proportional to amplitude squared, so doubling the amplitude gives 2² = 4 times the intensity. ×2 is the tempting but wrong linear answer.","Intensity is power spread over an area, I = P ÷ A, measured in W/cm². Multiplying by area would give the wrong units.","With I = P ÷ A, halving the area while keeping power fixed concentrates the same energy into less space, so intensity doubles. This is why focusing raises intensity.","Power is the rate of energy transfer and is measured in watts (or milliwatts). W/cm² is the unit of intensity, power per unit area.","Every 3 dB corresponds to a factor of 2 in intensity, so +3 dB doubles it and −3 dB halves it. A tenfold increase is +10 dB."],["Turbulent flow contains many different velocities and directions, so the spectral trace spreads over a wide range and fills in the window. Laminar flow gives a narrow trace.","In laminar flow most red blood cells move at similar speeds, so the spectrum is a thin line with a clear dark area beneath it, the spectral window.","A large gate in a small vessel samples slow flow near the walls as well as fast central flow, so a wide range of velocities is shown and the window fills in.","Blood speeds up through the narrowing and then breaks into disordered, swirling flow just beyond it, so post-stenotic turbulence and spectral broadening are expected.","Excess Doppler gain amplifies weak signals and noise so the trace looks thicker and the window appears filled in. It does not change aliasing or the Nyquist limit (PRF ÷ 2)."],["A narrow dynamic range displays fewer shades of grey, so the image looks more black and white with higher contrast. Wider dynamic range gives a softer, greyer image.","Gain amplifies all received echoes equally, making the whole image brighter or darker. It does not change bandwidth or PRF.","Dynamic range is the ratio of the largest to smallest signal handled, expressed in decibels (dB). Hertz measures frequency and millimetres measure distance.","A wide dynamic range shows many grey levels, giving a smoother, lower-contrast image that can show subtle tissue differences. Higher contrast comes from a narrower range.","Overgaining makes everything bright, so subtle hypoechoic or isoechoic lesions blend in and are missed. Gain does not improve resolution or affect aliasing."],["Backing material absorbs the crystal's ringing, reducing the number of cycles per pulse. Shorter spatial pulse length improves axial resolution and lowers Q.","Q-factor is the resonant (main) frequency divided by the bandwidth, Q = f₀ ÷ BW. A 5 MHz probe with 5 MHz bandwidth has Q = 1.","Since Q = f₀ ÷ bandwidth, a low Q means the bandwidth is large relative to the operating frequency. Low Q probes produce short, broadband pulses.","Imaging needs short pulses for good axial resolution, so probes are heavily damped, giving low Q and wide bandwidth. High Q, lightly damped probes suit continuous wave Doppler.","Damping absorbs some of the crystal's vibration energy, so sensitivity drops slightly. In return, bandwidth widens and axial resolution improves, so those are not lowered."],["Firing the elements with tiny timed delays makes the combined wavefront tilt in the chosen direction, sweeping the beam without moving the probe or changing frequency.","If element spacing is larger than about λ/2, secondary beams form at an angle to the main beam. Keeping pitch at λ/2 or less suppresses them, and apodisation and subdivision help too.","Firing the outer elements first and the central ones last, in a curved delay pattern, makes the wavefronts converge to a focus at the chosen depth.","Grating lobes send energy off-axis, and echoes from those directions are wrongly placed along the main beam as false structures. They degrade lateral resolution.","A phased array fires all its elements with steering delays from a small face, giving a fan-shaped sector image ideal for scanning between ribs, as in cardiac work."],["Tendon fibres are strong specular reflectors, so if the beam strikes them obliquely the echoes are reflected away from the probe and the tendon looks falsely hypoechoic.","Tilting or heel-toeing the probe until the beam is perpendicular to the fibres restores normal brightness if the dark area was anisotropy. PRF and depth do not affect it.","Tendons and ligaments have highly ordered parallel fibres that act as specular reflectors, so their echogenicity depends strongly on beam angle. Liver and fluid scatter more uniformly.","At 90 degrees to the fibres most of the reflected sound returns to the probe, giving the bright fibrillar pattern. Oblique angles send echoes away and the tendon darkens.","A falsely dark area in a tendon can look like a tear or tendinopathy, so always re-angle the probe before diagnosing. It cannot mimic a stone or Doppler aliasing."],["Two structures side by side can only be separated if they are further apart than the beam width, so lateral resolution is roughly equal to beam width. Pulse length sets axial resolution.","The beam converges to its narrowest point at the focus, about half the transducer width for an unfocused probe. It is wider near the skin and diverges beyond the focus.","Placing the focal zone at or just below the area of interest makes the beam narrowest there, giving the best side-by-side detail at that depth.","A wider aperture produces a deeper but narrower focal region, improving lateral resolution at depth. This is why arrays use more active elements for deeper focal zones.","Lateral resolution separates two reflectors lying perpendicular to the beam, side by side. Separation along the beam path is axial resolution, and separation in time is temporal resolution."],["Fluid attenuates less than surrounding tissue, so tissue behind a cyst receives more sound and appears brighter. Shadowing occurs behind strong attenuators, not fluid.","Sound bounces back and forth between two strong parallel reflectors, and each extra round trip is displayed deeper, giving equally spaced lines that fade with depth.","Gallstones and bone strongly reflect or absorb sound, so little reaches deeper tissue and a dark band appears behind them. Simple cysts give enhancement instead.","A strong, smooth reflector such as the diaphragm bounces the beam off a second structure, so a false copy appears deeper on the other side, for example liver above the diaphragm.","Comet tail is a form of reverberation where closely spaced reflectors cause many short echoes that merge into a tapering bright line, as with cholesterol crystals or metal."],["MI = peak rarefactional pressure (MPa) divided by the square root of frequency (MHz), so it predicts mechanical effects such as cavitation. Heating is estimated by the thermal index instead.","ALARA stands for 'as low as reasonably achievable': use the lowest output and shortest exposure that still give a diagnostic image.","TI is the ratio of transmitted power to the power needed to raise tissue temperature by 1 °C, so it estimates heating. Cavitation risk is shown by the MI.","Pulsed-wave Doppler fires repeatedly along one line with long pulses and a high PRF, concentrating energy in one spot, so it usually has the highest intensity and thermal risk.","Exposure depends on output power and dwell time, so lower the output and scan efficiently. Raising receiver gain brightens the image without adding energy to the patient, and is the preferred alternative to more output."],["The thyroid is superficial, so a high-frequency linear array (about 7–15 MHz) gives the best resolution with a wide near field. Phased arrays are low frequency with a tiny near-field footprint.","A phased array has a small footprint that fits through an intercostal window yet steers a wide sector beam electronically, ideal for cardiac work.","A curvilinear array uses lower frequencies (about 2–5 MHz) for deep penetration and its convex face gives a wide field of view over the abdomen.","Being closer to the target means less tissue to cross, so a higher frequency (often 5–9 MHz) can be used without losing penetration, improving resolution.","Elements fire in groups along a straight face, sending parallel scan lines, so the image is rectangular. Sector images come from phased or curvilinear arrays."],["Echoes from deeper tissue are weaker because sound attenuates (about 0.5 dB/cm/MHz in soft tissue), so TGC adds more receiver gain with depth to even this out.","The lower sliders control the far field, so raising them amplifies only deep echoes. The near sliders affect the superficial image.","Sliders are arranged by depth, with the top ones matching the top of the screen, which is the near field nearest the transducer.","Overall gain amplifies all received echoes by the same amount at every depth. Depth-selective adjustment is the job of TGC.","Properly set TGC offsets attenuation so similar tissues look equally bright from top to bottom. A bright near field with a dark far field shows TGC set wrongly."],["Colour Doppler colour-codes mean velocity and direction, usually red and blue. Power Doppler shows only the strength of the signal, without direction.","CW Doppler uses separate crystals to transmit and receive all the time, so there is no PRF limit and no aliasing, but it cannot tell where along the beam the signal came from.","Power Doppler shows the amplitude (strength) of the Doppler signal, not its frequency shift, so it is less angle dependent and picks up slow, low-volume flow. It shows no direction.","Timing the listening window (range gating) lets PW Doppler sample a chosen depth. The cost is aliasing once the shift exceeds the Nyquist limit (PRF/2).","By the usual BART convention (Blue Away, Red Towards) red means flow towards the probe, though the colour map can be inverted, so check the colour bar."],["M-mode records a single scan line repeatedly and displays depth against time, showing how structures move, such as heart valves.","A-mode shows echoes as spikes whose height is amplitude, plotted against depth along one line.","In B-mode (brightness mode) each echo is a dot whose brightness matches its amplitude, building a 2D greyscale image.","Its very high sampling rate captures fast valve and wall motion and gives accurate heart rates, including fetal heart rate measured from M-mode rather than with Doppler.","Sampling one line thousands of times per second gives excellent temporal resolution, far better than a 2D frame rate of about 30 Hz."],["Persistence averages several frames, smoothing random noise, but fast-moving structures blur and lag. It does not raise the frame rate.","Persistence (frame averaging) combines current and previous frames so random speckle and noise are reduced.","Pre-processing (such as TGC, write zoom and compression) is applied to the signal before it is stored in the scan converter memory, so it cannot be changed on a frozen image.","Edge enhancement boosts sharp changes in brightness, making tissue boundaries look crisper, though it can also accentuate noise.","Anything that can be changed on a frozen, stored image, such as the grey map, black-and-white inversion or read zoom, is post-processing."],["Elements that no longer transmit or receive leave a vertical dropout running down the image from the skin line. This is a sign of a damaged transducer or cable.","Regular, documented tests catch gradual drift in performance early and are required by accreditation bodies. Waiting until a breakdown misses slow faults.","Phantoms are made to match the 1540 m/s assumed by the scanner, so measured distances and depths are accurate. 330 m/s is the speed of sound in air.","Pin (wire) targets at known positions test axial and lateral resolution and the accuracy of depth and distance measurements.","Comparing each test with baseline images taken when the machine was new or serviced shows any change in resolution, sensitivity or calibration over time."],["Microbubbles resonate at diagnostic frequencies and oscillate nonlinearly, producing strong harmonic echoes that harmonic or pulse inversion imaging can separate from tissue.","High acoustic pressure ruptures the fragile bubbles, so the contrast signal is lost. This is used on purpose only in destruction-replenishment techniques.","Agents are tiny gas-filled microbubbles (about 1–7 µm) in a lipid or protein shell, small enough to pass through the lungs. Iodine is used for CT.","A low MI (often below 0.2) makes the bubbles oscillate without bursting, so they keep giving signal. High MI would destroy them.","The bubbles are about red-cell size and too big to leave the circulation, so they act as pure blood-pool agents, unlike CT or MRI contrast."],["Shear wave speed rises with tissue stiffness (E ≈ 3ρc²). Shear waves barely travel in fluid because it has no shear rigidity.","Young's modulus is calculated from measured shear wave speed using E ≈ 3ρc², where ρ is density (about 1000 kg/m³). Brightness says nothing about stiffness.","Fibrosis and many cancers increase tissue stiffness, so shear waves travel faster and kPa readings are higher than in normal tissue.","A focused, high-intensity acoustic radiation force (push) pulse displaces tissue and creates sideways shear waves, which the probe then tracks with fast imaging.","Breath movement and probe motion disturb shear wave tracking, so readings are taken during a gentle breath-hold with the patient still. Deep breathing or coughing adds error."],["A-lines are evenly spaced horizontal reverberations of the bright pleural line, repeating at multiples of the probe-to-pleura distance. They are not real anatomy.","Without pleural sliding, M-mode shows only horizontal lines above and below the pleura, the barcode (stratosphere) sign, suggesting pneumothorax.","Sliding pleura produces a grainy 'sand' pattern below the pleural line under smooth 'waves' of chest wall, the seashore sign. The barcode sign means no sliding.","Three or more B-lines per intercostal space suggest thickened, fluid-filled interstitium, as in pulmonary oedema. B-lines effectively rule out pneumothorax at that spot.","B-lines are bright vertical comet-tail artefacts that start at the pleural line, reach the bottom of the screen without fading, and move with lung sliding."],["Real structures stay put when you change the angle, window or settings, but most artefacts move, change or disappear, so re-scanning confirms what is real.","Aliasing happens when the Doppler shift exceeds the Nyquist limit (PRF/2), so raising the scale raises that limit. Gain only changes brightness.","Deep echoes are weakened by attenuation, so add far-field TGC or use a lower frequency for better penetration. Lowering near TGC would not help the far field.","Too much colour gain amplifies noise and makes colour bleed past the vessel walls, so turn it down until the colour just fills the lumen.","Frame rate depends on depth and line count. Less depth or a narrower sector shortens each frame, raising the frame rate. More focal zones and persistence make it worse."]];

const CS=[
"At a rural outreach clinic a sonographer swaps a 3.5 MHz curvilinear probe for a 10 MHz linear probe to scan a swollen thyroid. The wavelength falls from about 0.44 mm to about 0.15 mm, and the gland looks much sharper.",
"At an antenatal outreach, a woman with a high BMI is scanned with a high-frequency probe and the fetal spine is barely visible. Switching to about 3 MHz restores the depth. Lower frequency trades some fine detail for penetration.",
"A sonographer scans a dry-skinned patient with too little gel and sees a patchy, bright near field with dark shadows below. The thin air layer reflects almost all the sound. Adding gel removes the problem.",
"A leg-vein Doppler for suspected DVT shows almost no flow because the beam meets the vein at nearly 90 degrees. Tilting the probe, or steering the beam, brings the angle to 60 degrees or less and the flow signal returns.",
"Two small gallstones lie close together and look like a single echo on a low-frequency setting. A higher frequency with a shorter pulse can show them as two separate stones.",
"On a uterine artery Doppler, the fast systolic peaks wrap below the baseline because the scale is too low. Raising the scale (PRF) and moving the baseline shows the true trace.",
"A patient with a thick abdominal wall has a hazy, noisy liver image in fundamental mode. Switching on tissue harmonic imaging clears much of the clutter and sharpens the walls of a cyst.",
"A loop of bowel gas sits in front of the aorta and blocks the view. Gas has an impedance far from tissue, so nearly all the sound is reflected. Gentle graded pressure or a different scan window can move the gas aside.",
"In lung ultrasound of a child with a cough, normal aerated lung stops the beam at the pleural line and shows A-lines. A consolidated lung lets sound in and looks like liver tissue. Air is not a vacuum, but the same idea applies: too few particles to carry the wave.",
"When scanning the mitral valve in a young patient, the leaflets look jumpy with a wide sector and large depth. Narrowing the sector and reducing depth raises the frame rate, and the valve motion becomes clearer.",
"A simple 3 mm thyroid cyst looks like it has internal echoes because the beam is thicker than the cyst. This is slice-thickness (partial volume) artifact. Placing the cyst at the focal depth or using a better small-parts probe reduces it.",
"A probe is dropped and the image now shows vertical dark lines. Some crystal elements no longer vibrate and generate sound. Report the probe and have it tested rather than carry on scanning.",
"A renal artery Doppler at 12 cm with a high PRF setting shows a second signal at a shallower depth. The echoes from a deeper vessel return after the next pulse is sent. Reducing the PRF or choosing the right preset removes the ghost.",
"A probe is sold as a 5 MHz probe but its spectrum actually covers about 3 to 7 MHz. The presets Pen, Gen and Res pick different parts of that band, which is why changing the preset changes the look of the image.",
"In a breast outreach screening, compound imaging smooths the speckle and makes a small nodule easier to outline. It can also hide the acoustic shadow behind a calcification, so switch it off and on to compare.",
"In first-trimester obstetric scanning, spectral Doppler uses more output than B-mode. Follow ALARA: use the lowest output, the shortest time and the on-screen thermal and mechanical indices as a guide.",
"A carotid Doppler shows a filled-in spectral window and broad trace. This can come from turbulent flow after a stenosis, but a large gate placed against the wall or very high gain can also widen the spectrum.",
"In a patient with chronic hepatitis B, a hypoechoic liver lesion is hard to see on a very smooth, low-contrast image. Lowering the dynamic range makes it stand out, but too low a range hides subtle texture.",
"A district hospital's old probe has long ringing pulses, so thin layers such as the gallbladder wall look blurred. A modern broadband probe with strong damping gives short pulses and separates the layers.",
"A phased-array probe is used between the ribs of a child with suspected rheumatic heart disease. Electronic steering lets the beam fan out from a small footprint without moving the probe.",
"A patient with shoulder pain shows a dark, thin supraspinatus tendon. Tilting the probe until it is perpendicular to the fibres makes the tendon bright and fibrillar again, avoiding a false diagnosis of a tear.",
"Two small cysts lie side by side in the breast. At the focal depth the beam is narrow and they look separate. A few centimetres deeper, outside the focus, the same cysts merge into one. Moving the focus to the cysts fixes it.",
"On a gallbladder scan a stone casts a dark shadow behind it, a simple liver cyst shows a bright band behind it, and gas or a metal clip can show repeating lines. Knowing each pattern helps tell real findings from artifacts.",
"A sonographer starts a first-trimester scan in B-mode and only uses spectral Doppler briefly to show the fetal heart. She keeps the Doppler window short, lowers the output and watches the thermal index on the screen. This is ALARA in practice.",
"A district hospital has only a curvilinear probe and a patient needs a thyroid scan. The image is coarse and shallow structures are poorly seen. Borrowing a linear probe of 7 to 12 MHz gives the detail the thyroid needs.",
"On a liver scan the top of the image is bright and the bottom is dark. The sonographer raises the deep TGC sliders instead of the overall gain, which would have burned out the near field.",
"A patient with a swollen calf is scanned for DVT. Colour Doppler shows no colour in a vein, but the beam is almost perpendicular to it. Steering the beam to a smaller angle brings the colour back, and power Doppler helps when the flow is very slow.",
"A sonographer measures the fetal heart rate with M-mode instead of counting beats on the B-mode image. The cursor goes across the heart and the trace shows each beat, so the rate can be read accurately and a copy kept.",
"A thyroid scan looks grainy. Raising the persistence smooths the image because the gland is still. The same setting on a fetal heart makes the beating look sluggish, so the sonographer lowers it.",
"Every month the team at a diagnostic centre scans the same phantom and keeps the image. One month, a pair of thin vertical dark lines appears. The probe is sent for service before it affects any patient.",
"A patient with chronic liver disease has a small liver lesion that is hard to characterise on B-mode. After a contrast injection, the lesion lights up early and then fades faster than the liver. The wash-in and washout pattern helps the team decide what to do next.",
"In a patient with chronic hepatitis B, shear wave elastography of the right lobe gives a high stiffness value. This suggests fibrosis and can guide follow-up, together with blood tests and the other findings.",
"A child with cough and fever is scanned in the emergency room. One side shows normal lung with sliding and A-lines. The other side shows a pleural line followed by tissue-like consolidation. Lung ultrasound is helpful where X-ray is not available.",
"A good habit: before calling a finding, change one control at a time and see whether the finding stays. If it appears or vanishes with probe angle, PRF, gain or range, it may be an artifact."];

const LO=[
"explain how frequency, wavelength and speed are linked, and work out the wavelength in soft tissue.",
"explain why higher frequencies attenuate more, and estimate how deep a probe can see.",
"predict how much sound reflects at a boundary, and when refraction happens.",
"use the Doppler equation and explain why the angle matters.",
"explain what limits axial resolution and how to improve it.",
"explain the Nyquist limit and list the ways to remove aliasing.",
"explain how tissue harmonics form and why they reduce clutter.",
"calculate acoustic impedance and relate it to the brightness of an echo.",
"explain why ultrasound needs a medium and why air gaps block the beam.",
"explain what sets the frame rate and how to improve temporal resolution.",
"explain slice-thickness artifact and where the elevation focus works best.",
"explain the piezoelectric effect and why crystal thickness sets the resonant frequency.",
"explain range ambiguity and the link between PRF and maximum depth.",
"explain that any wave is a sum of sine waves, and relate pulse length to bandwidth.",
"explain how spatial compounding reduces speckle, and what it costs.",
"relate amplitude, power and intensity, and convert changes to decibels.",
"explain spectral broadening and what else can widen a Doppler spectrum.",
"explain how dynamic range and gain change contrast and brightness.",
"explain how backing material changes pulse length, bandwidth and Q-factor.",
"explain how a phased array steers the beam and what causes grating lobes.",
"explain anisotropy and avoid mistaking a dark tendon for a tear.",
"explain what limits lateral resolution and place the focus well.",
"recognise reverberation, shadowing, enhancement and mirror image, and say what to do about each.",
"read the MI and TI and apply ALARA to your scanning.",
"choose the right probe for the task and the depth.",
"set the TGC so the image is evenly bright from top to bottom.",
"tell colour, power, pulsed-wave and continuous-wave Doppler apart, and say when each is best.",
"explain what A-mode, B-mode and M-mode show, and when to use each.",
"explain how persistence and the grey map change noise, lag and contrast.",
"recognise common probe and system faults from a phantom image.",
"explain how microbubble contrast works and read a wash-in and washout curve.",
"explain how shear wave speed relates to stiffness and read an elastogram.",
"explain A-lines, B-lines and lung sliding from the physics of air, and read the seashore and barcode signs.",
"work through real scanning problems and choose the right control to fix each one."],
KT=[
"c = f × λ: frequency comes from the source, speed from the medium, and wavelength follows.",
"Higher frequency gives better detail but less depth.",
"Echoes come from impedance differences, and gel removes the air gap.",
"The Doppler shift depends on cos θ, so keep the angle at 60° or less.",
"Axial resolution = SPL ÷ 2, so shorter pulses resolve better.",
"Nyquist limit = PRF ÷ 2. Raise the PRF, lower the frequency or move the baseline.",
"Harmonics build up in the tissue, so near-field clutter is reduced.",
"Z = ρ × c, and bigger impedance differences give stronger echoes.",
"Sound is a mechanical wave and needs particles to carry it.",
"Less depth, fewer lines and fewer focal zones give a higher frame rate.",
"Slice thickness blurs small structures that sit away from the elevation focus.",
"A crystal half a wavelength thick resonates, and damping shortens the pulse.",
"Maximum depth = 77 ÷ PRF (kHz) cm, and deeper echoes are drawn too shallow.",
"Short pulses contain many frequencies, which means wide bandwidth.",
"Compounding smooths speckle but lowers the frame rate.",
"Doubling the amplitude quadruples power and intensity (+6 dB).",
"Turbulence fills the spectral window, but gate size and gain can also do it.",
"Dynamic range sets contrast, while gain only brightens or darkens.",
"More backing means lower Q, shorter pulses and wider bandwidth.",
"Time delays steer the beam, and a pitch above λ ÷ 2 creates grating lobes.",
"Tendons are bright only when the beam is perpendicular, so re-angle before diagnosing a tear.",
"Lateral resolution is about the beam width and is best at the focus.",
"Real structures stay put when you change the angle, while artifacts often move or vanish.",
"Use the lowest output and the shortest time that answer the question.",
"Linear for detail, curvilinear for depth, phased for small windows, endocavity for close views.",
"TGC adds gain with depth, while overall gain lifts everything.",
"Colour shows direction, power is more sensitive, PW gives depth and CW gives high speeds.",
"A-mode shows depth, B-mode shows a picture and M-mode shows motion over time.",
"Persistence cuts noise but adds lag for moving structures.",
"Phantom tests reveal dropout, lost sensitivity and wrong distances before patients are affected.",
"Bubbles light up the blood, and a high MI destroys them.",
"Stiffer tissue carries shear waves faster: E ≈ 3ρc².",
"Air reflects nearly all the sound, so lung signs are reverberation patterns and not anatomy.",
"Change one control at a time and see which one fixes the image."];

// Staff-approved AI-generated topics (lab.GeneratedTopic, status=published) are
// never written into this file — they're merged in here, from LAB_CONFIG, right
// before the generic nav/DOM-build loop below, which already drives everything
// (nav, quizzes, mock-exam pooling, certificate counting) purely off S.length.
(LC.dynamicTopics||[]).forEach(dt=>{
  let d,o;
  try{d=new Function('c','t','v',dt.d);o=new Function('v',dt.o)}
  catch(e){d=c=>T(c,'⚠️ This topic failed to load.',20,40,'#ff3b30',14);o=()=>[['Status','Unavailable — failed to compile']]}
  S.push({n:dt.n,g:dt.g,ctl:dt.ctl,d,o,tip:dt.tip});
  LO.push(dt.lo);KT.push(dt.kt);CS.push(dt.cs);MK.push(dt.mk);QZ.push(dt.qz);QX.push(dt.qx);
});

const _reportedTopicErrors=new Set();
function reportTopicError(idx,err){
  if(_reportedTopicErrors.has(idx))return;_reportedTopicErrors.add(idx);
  fetch('/api/lab/topic-error',{method:'POST',headers:{'Content-Type':'application/json','X-CSRFToken':csrfToken()},
    body:JSON.stringify({topicIndex:idx,topicName:S[idx]&&S[idx].n,message:String(err&&err.message||err).slice(0,500)})}).catch(()=>{});
}

const V=[],cv=[],EMS=[];
S.forEach((s,i)=>{
try{
const b=document.createElement('button');b.textContent=(i+1)+'. '+s.n+(!hasTopic(i)?' 🔒':'');b.onclick=()=>go(i);$('nav').append(b);
const e=document.createElement('section');e.innerHTML=`<h2>${s.n}</h2><p class=goal>${s.g}</p><div class=lo>🎯 <b>After this tab you can:</b> ${LO[i]}</div><canvas width=800 height=340></canvas><div class=ctl></div><div class=rsrow><button class=rsb type=button>↺ Reset simulation</button></div><div class=out></div><div class=tip>💡 ${s.tip}</div><div class=kt>⭐ <b>Key takeaway:</b> ${KT[i]}</div><div class=cs>🌍 <b>Clinical case:</b> ${CS[i]}</div><div class=mk>🎛️ <b>On your machine:</b> ${MK[i]}</div><div class=qz></div>`;$('main').append(e);
const v=V[i]={},em=EMS[i]={};
s.ctl.forEach(k=>{const w=document.createElement('div');
if(Array.isArray(k[2])){w.innerHTML=`<label>${k[1]}</label><select>${k[2].map((o,j)=>`<option value=${j}>${o}</option>`).join('')}</select>`;const el=w.querySelector('select');v[k[0]]=k[3];el.value=k[3];em[k[0]]=el;el.onchange=()=>v[k[0]]=+el.value}
else{w.innerHTML=`<label>${k[1]}<b></b></label><input type=range min=${k[3]} max=${k[4]} step=${k[6]} value=${k[5]}>`;const el=w.querySelector('input'),o=w.querySelector('b'),u=()=>{v[k[0]]=+el.value;o.textContent=el.value+' '+k[2]};el.oninput=u;em[k[0]]=el;u()}
e.querySelector('.ctl').append(w)});if(s.rs){const sl=em.sc;sl.addEventListener('change',()=>{const r=s.rs[+sl.value];Object.keys(r).forEach(q=>{em[q].value=r[q];em[q].dispatchEvent(new Event('input'))});if(em.h){em.h.value=0;v.h=0}})}
const rb=e.querySelector('.rsb');rb.onclick=()=>{s.ctl.forEach(k=>{const el=em[k[0]];if(!el)return;if(Array.isArray(k[2])){el.value=k[3];v[k[0]]=+k[3]}else{el.value=k[5];el.dispatchEvent(new Event('input'))}});rb.textContent='✓ Back to the start';setTimeout(()=>rb.textContent='↺ Reset simulation',1200)};
cv[i]=[e,e.querySelector('canvas').getContext('2d'),e.querySelector('.out')];
}catch(err){
console.error('Topic',i,'failed to build:',err);reportTopicError(i,err);
const b=document.createElement('button');b.textContent=(i+1)+'. ⚠️ Unavailable';b.disabled=true;$('nav').append(b);
cv[i]=[document.createElement('div'),null,document.createElement('div')];V[i]=V[i]||{};EMS[i]=EMS[i]||{};
}
});
const RES=(()=>{try{return JSON.parse(localStorage.getItem('mpq')||'{}')}catch(e){return{}}})(),sv=()=>{try{localStorage.setItem('mpq',JSON.stringify(RES))}catch(e){}window.acPush&&acPush()};
function buildQuiz(i){const el=cv[i][0].querySelector('.qz'),Q=QZ[i],ans=[];let ok=0;el.innerHTML='<h3>📝 Quick check</h3>';
Q.forEach((q,qi)=>{const d=document.createElement('div');d.className='q';d.innerHTML='<p>'+(qi+1)+'. '+q[0]+'</p>';const B=[];
q[1].map((_,k)=>k).sort(()=>Math.random()-.5).forEach(k=>{const b=document.createElement('button');b.textContent=q[1][k];B[k]=b;b.onclick=()=>{if(ans[qi]!=null)return;ans[qi]=k;B[q[2]].className='good';const x=document.createElement('div');x.className='xe';x.textContent='💡 '+QX[i][qi];d.append(x);if(k==q[2])ok++;else{b.className='bad';if(LC.tutorEnabled)tutorWhy(d,q,k)}
if(ans.filter(x=>x!=null).length==Q.length){RES[i]=Math.max(RES[i]||0,ok);sv();upd();window.acNudge&&acNudge();const r=document.createElement('button');r.className='rt';r.textContent='Score '+ok+'/'+Q.length+' · Try again';r.onclick=()=>buildQuiz(i);el.append(r)}};d.append(b)});el.append(d)})}
const cm=document.createElement('div');cm.id='cert';cm.innerHTML='<div class=ci><div class=np><input id=cn placeholder="Type your full name" maxlength=60><button id=cp>🖨️ Print / Save as PDF</button><button id=cv hidden>🔒 Issue verified certificate</button><button id=cx>Close</button><span class=cms id=cms role=status aria-live=polite></span></div><div class=cp><img id=cl alt="Medprime Education Group"><div class=t>Certificate of Completion</div><div>This certifies that</div><div class=nm id=cnm>Your Name</div><div>has completed all the interactive simulations and quizzes of the</div><div class=t style="font-size:24px">Ultrasound Physics Interactive Lab</div><div>with an overall score of <b id=csc></b>%</div><div class=sg><b>Stephen Victor Cobbina, PhD, MSc, BSc</b><span>Founder, Medprime Education Group</span></div><p><small id=cdt></small></p><div class=cvf id=cvf hidden><div id=cqr></div><div><b>Certificate ID: <span id=cid></span></b><small>Check that this certificate is genuine at <span id=cvu></span> or scan the QR code.</small></div></div><small><a href="https://wa.me/233544296648" target="_blank" rel="noopener" style="color:inherit" title="Chat on WhatsApp">💬 WhatsApp: 0544296648</a> · <a href="https://mail.google.com/mail/?view=cm&fs=1&to=medprimeeducationgroup@gmail.com" target="_blank" rel="noopener" title="Email us via Gmail" style="color:inherit">✉️ medprimeeducationgroup@gmail.com</a></small></div></div>';document.body.append(cm);
cm.querySelector('#cn').oninput=e=>cm.querySelector('#cnm').textContent=e.target.value||'Your Name';cm.querySelector('#cx').onclick=()=>cm.classList.remove('on');cm.querySelector('#cp').onclick=()=>print();
function openCert(pc){cm.querySelector('#cl').src=document.querySelector('header img').src;cm.querySelector('#csc').textContent=pc;cm.querySelector('#cdt').textContent=new Date().toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});cm.classList.add('on');window.acCert&&acCert(pc)}
function upd(){const ks=Object.keys(RES),n=ks.length,tq=ks.reduce((a,k)=>a+QZ[k].length,0),sc=ks.reduce((a,k)=>a+RES[k],0),pc=tq?Math.round(100*sc/tq):0,ok=n==S.length&&pc>=70;
document.querySelectorAll('nav button').forEach((b,i)=>b.textContent=(RES[i]!=null?'✓ ':'')+(i+1)+'. '+S[i].n+(!hasTopic(i)?' 🔒':''));
$('#pg').innerHTML='<span>Progress: <b>'+n+'/'+S.length+'</b> quizzes done'+(tq?' · score <b>'+pc+'%</b>':'')+'</span><div class=bar><i style="width:'+100*n/S.length+'%"></i></div><button id=cb '+(ok?'':'disabled')+'>🎓 '+(ok?'Get your certificate':'Certificate: finish all quizzes with 70%+')+'</button>';$('#qa').innerHTML='<button id=xb class=qab><span class=qi>📝</span><span><b>Mock exam</b><small>Timed practice across all topics</small></span></button><button id=acb class=qab><span class=qi>👤</span><span><b>'+(window.acUser?'My progress':'Log in to save progress')+'</b><small>'+(window.acUser?'Dashboard, weak topics &amp; certificates':'Keep your scores &amp; earn a verified certificate')+'</small></span></button>';
$('#cb').onclick=()=>openCert(pc);$('#xb').onclick=()=>xOpen();$('#acb').onclick=()=>window.acOpen?acOpen():alert('Accounts are still loading. Please try again in a moment.')}
S.forEach((s,i)=>{try{buildQuiz(i)}catch(err){console.error('Quiz',i,'failed to build:',err);reportTopicError(i,err)}});upd();
const FM=[
['Wave speed','c = f × λ','Soft tissue: c ≈ 1540 m/s, so λ (mm) = 1.54 ÷ f (MHz)'],
['Period','T = 1 ÷ f','Period in µs = 1 ÷ frequency in MHz'],
['Acoustic impedance','Z = ρ × c','Unit: Rayl (MRayl for tissue). ρ = density'],
['Intensity reflection','IRC = ((Z₂ − Z₁) ÷ (Z₂ + Z₁))²','Transmitted = 1 − IRC (normal incidence)'],
['Snell’s law','sin θt ÷ sin θi = c₂ ÷ c₁','Refraction needs oblique incidence and different speeds'],
['Attenuation','≈ 0.5 dB/cm/MHz in soft tissue','Round trip = 2 × depth × f × 0.5'],
['Decibels','dB = 10 log (I₂ ÷ I₁) = 20 log (A₂ ÷ A₁)','+3 dB = double the intensity. +6 dB = double the amplitude'],
['Intensity','I = power ÷ area','Power ∝ amplitude²'],
['Doppler shift','Δf = 2 f v cos θ ÷ c','Keep θ at 60° or less. No shift at 90°'],
['Nyquist limit','= PRF ÷ 2','Shifts above this alias'],
['Go–return time','13 µs per cm of depth','Pulse repetition period must be longer than this × depth'],
['Maximum depth','= 77 ÷ PRF (kHz) cm','Deeper echoes cause range ambiguity'],
['PRF and PRP','PRP = 1 ÷ PRF','Duty factor = pulse duration ÷ PRP'],
['Frame rate','≈ 77 000 ÷ (depth in cm × lines)','Falls with more depth, lines or focal zones'],
['Spatial pulse length','SPL = n × λ','n = cycles per pulse'],
['Axial resolution','= SPL ÷ 2','Better with higher frequency and more damping'],
['Q-factor','Q = f₀ ÷ bandwidth','Heavy backing lowers Q'],
['Harmonic frequency','= 2 × f₀','Created by the tissue as the beam travels'],
['Crystal thickness','= λ(crystal) ÷ 2 at resonance','Thinner crystal gives higher frequency'],
['Array pitch','≤ λ ÷ 2','Larger pitch gives grating lobes'],
['Lateral resolution','≈ beam width','Narrowest at the focus. Better with a wider aperture and higher frequency'],
['Near zone length','= D² ÷ (4λ)','D = aperture diameter. The beam diverges beyond it'],
['Mechanical index','MI = peak rarefactional pressure (MPa) ÷ √f (MHz)','Estimates the risk of non-thermal effects such as cavitation'],
['Thermal index','TI ≈ expected maximum temperature rise (°C)','Rises with output, scan time and a fixed Doppler beam'],
['TGC to offset loss','≈ f × depth (dB)','Round-trip loss is about 1 dB per cm per MHz in soft tissue'],
['Shear wave stiffness','E ≈ 3ρc²','Faster shear waves mean stiffer tissue (E in kPa)'],
['Lung A-lines','at n × (pleural depth)','Reverberation between the probe and the pleural line']],
VL=[['Air','330','0.0004'],['Fat','1450','1.38'],['Soft tissue','1540','1.63'],['Muscle','1580','1.70'],['Bone','4080','7.8']],
GL=[
['Acoustic impedance','Density × speed. Echoes come from differences in impedance between tissues.'],
['Aliasing','Wrong display of a Doppler shift that is above the Nyquist limit. Peaks wrap to the other side of the baseline.'],
['Amplitude','Maximum change in pressure (or the size of the wave). Power and intensity depend on its square.'],
['Anisotropy','Tissue (such as tendon) looks bright only when the beam is perpendicular to its fibres.'],
['Attenuation','Loss of sound strength with depth from absorption, scatter and reflection. Rises with frequency.'],
['Axial resolution','Smallest distance along the beam at which two reflectors are seen as two. Equals SPL ÷ 2.'],
['Backing material','Damping block behind the crystal that shortens the pulse and widens the bandwidth.'],
['Bandwidth','Range of frequencies in a pulse.'],
['Compound imaging','Averaging frames steered at different angles to reduce speckle and some artifacts.'],
['Dynamic range','Range of echo strengths (in dB) shown in the grey scale. Lower gives more contrast.'],
['Doppler effect','Change in frequency of sound reflected from a moving target.'],
['Duty factor','Fraction of time the machine is transmitting.'],
['Elevational resolution','Resolution across the slice thickness, perpendicular to the image plane.'],
['Focus','Region where the beam is narrowest and lateral detail is best.'],
['Frame rate','Number of images per second. Sets temporal resolution.'],
['Frequency','Cycles per second (Hz). Set by the source, not the medium.'],
['Gain','Overall amplification of returning echoes. It does not change the transmitted sound.'],
['Grating lobes','Unwanted side beams from an array whose element pitch is too large.'],
['Harmonics','Frequencies at multiples of the transmitted frequency, created in tissue.'],
['Intensity','Power per unit area.'],
['Lateral resolution','Smallest distance across the beam at which two reflectors are seen as two. About equal to beam width.'],
['Matching layer','Layer on the crystal that improves the transfer of sound into the skin.'],
['Mechanical index (MI)','On-screen estimate of the risk of non-thermal effects such as cavitation.'],
['Nyquist limit','Highest Doppler shift that can be shown correctly: PRF ÷ 2.'],
['Piezoelectric effect','Certain crystals change shape with voltage and make voltage when squeezed.'],
['Power','Rate of energy flow, in watts.'],
['PRF','Pulses per second. Higher PRF allows higher velocities but reduces maximum depth.'],
['Pulse duration','Time the pulse lasts.'],
['Q-factor','Centre frequency divided by bandwidth.'],
['Range ambiguity','Echoes from deep reflectors are drawn at a shallower depth because they arrive after the next pulse.'],
['Reflection','Sound returning from a boundary between tissues of different impedance.'],
['Refraction','Change in direction of the beam when crossing a boundary at an angle with different speeds.'],
['Resonance','Crystal vibrates strongest when its thickness is half a wavelength.'],
['Speckle','Grainy interference pattern from scatter by very small structures.'],
['Spectral broadening','Widening of the Doppler spectrum from a wider range of velocities, as in turbulence.'],
['Spatial pulse length','Length of one pulse in space: cycles per pulse × wavelength.'],
['Temporal resolution','Ability to show moving structures at the right moment. Depends on frame rate.'],
['Thermal index (TI)','On-screen estimate of possible tissue heating.'],
['Wavelength','Distance covered by one cycle. Shorter at higher frequency.'],
['Near zone','Region between the transducer and the natural focus, where the beam narrows.'],
['Reverberation','Repeat echoes between the probe and a strong reflector, drawn as equally spaced lines.'],
['Acoustic shadowing','Dark band behind a structure that reflects or absorbs most of the sound.'],
['Posterior enhancement','Bright band behind a fluid-filled structure that attenuates less than its surroundings.'],
['Mirror image','Duplicate of a structure drawn beyond a strong curved reflector.'],
['ALARA','As low as reasonably achievable: the lowest output and shortest time that answer the clinical question.'],
['Cavitation','Formation and collapse of gas bubbles in a sound field. The MI estimates the risk.'],
['TGC','Time gain compensation: extra gain added with depth to offset attenuation.'],
['Linear array','Flat probe with a rectangular image. High frequency, shallow depth.'],
['Curvilinear array','Curved probe with a wide sector image. Lower frequency, greater depth.'],
['Phased array','Small probe that steers the beam electronically. Fits between ribs.'],
['Endocavity probe','High-frequency probe with a very wide sector for close, internal scanning.'],
['Footprint','The area of the probe that touches the skin.'],
['Colour Doppler','Shows the direction and mean velocity of flow as colour on the image.'],
['Power Doppler','Shows the amount of moving blood without direction. More sensitive to slow flow.'],
['Pulsed-wave Doppler','Measures velocity at a chosen depth. Can alias.'],
['Continuous-wave Doppler','Measures very high velocities along the whole beam. No aliasing, no depth information.'],
['A-mode','Amplitude against depth along one scan line.'],
['B-mode','Brightness mode: a 2D picture made of many scan lines.'],
['M-mode','Motion mode: one scan line plotted over time.'],
['Persistence','Averaging of successive frames to reduce noise, with some lag for moving structures.'],
['Phantom','A test object with known targets, used for quality assurance.'],
['Microbubble contrast agent','Tiny gas bubbles that scatter sound strongly and make blood show up.'],
['Elastography','Estimation of tissue stiffness. Shear wave elastography uses the speed of shear waves.'],
['A-lines','Horizontal reverberation lines below the pleural line, at multiples of its depth.'],
['B-lines','Vertical laser-like lines from the pleural line that erase the A-lines.'],
['Lung sliding','To-and-fro shimmer of the pleural line with breathing. Absent in pneumothorax.']];
const fsEl=document.createElement('div');fsEl.id='fs';
fsEl.innerHTML='<div class=ci><div class=np><input id=fq placeholder="Search a term, e.g. aliasing" maxlength=40><button id=fp>🖨️ Print / Save as PDF</button><button id=fx>Close</button></div><div class=fsh><div class=fh><img id=fl alt="Medprime Education Group"><div><h2>Ultrasound Physics: Formula Sheet & Glossary</h2><small>Medprime Education Group · <a href="https://wa.me/233544296648" target="_blank" rel="noopener" style="color:inherit" title="Chat on WhatsApp">💬 WhatsApp: 0544296648</a> · <a href="https://mail.google.com/mail/?view=cm&fs=1&to=medprimeeducationgroup@gmail.com" target="_blank" rel="noopener" title="Email us via Gmail" style="color:inherit">✉️ medprimeeducationgroup@gmail.com</a></small></div></div><h3>Key formulas</h3><table class=ft><tr><th>Quantity</th><th>Formula</th><th>Note</th></tr>'+FM.map(r=>'<tr><td>'+r[0]+'</td><td><b>'+r[1]+'</b></td><td>'+r[2]+'</td></tr>').join('')+'</table><h3>Typical values</h3><table class=ft><tr><th>Medium</th><th>Speed (m/s)</th><th>Impedance (MRayl)</th></tr>'+VL.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td></tr>').join('')+'</table><h3>Glossary</h3><div id=gl>'+GL.map(r=>'<p data-k="'+(r[0]+' '+r[1]).toLowerCase()+'"><b>'+r[0]+':</b> '+r[1]+'</p>').join('')+'</div><small>Simplified for teaching. Created by Stephen Victor Cobbina, PhD, MSc, BSc · © Medprime Education Group Limited</small></div></div>';
document.body.append(fsEl);
fsEl.querySelector('#fq').oninput=e=>{const q=e.target.value.trim().toLowerCase();fsEl.querySelectorAll('#gl p').forEach(p=>p.style.display=!q||p.dataset.k.includes(q)?'':'none')};
fsEl.querySelector('#fx').onclick=()=>fsEl.classList.remove('on');fsEl.querySelector('#fp').onclick=()=>print();
function openFS(e){if(e)e.preventDefault();fsEl.querySelector('#fl').src=document.querySelector('header img').src;fsEl.classList.add('on');fsEl.scrollTop=0}
document.querySelectorAll('.ct').forEach(b=>{const a=document.createElement('a');a.href='#';a.textContent='📘 Formula sheet & glossary';a.onclick=openFS;b.prepend(a)});
let cur=0;
function go(i){if(!hasTopic(i))return window.payOpen?payOpen():alert('Go Premium to unlock this topic. Log in and upgrade.');
cur=i;window.acPush&&acPush();document.querySelectorAll('nav button').forEach((b,j)=>b.classList.toggle('on',j==i));cv.forEach((x,j)=>x[0].classList.toggle('on',j==i))}
function loop(ms){const ctx=cv[cur];if(!ctx||!ctx[1]){requestAnimationFrame(loop);return}
const t=ms/1000,[,c,o]=ctx,s=S[cur];c.clearRect(0,0,W,H);c.setLineDash([]);c.lineDashOffset=0;
try{s.d(c,t,V[cur]);o.innerHTML=s.o(V[cur]).map(([a,b])=>`<div>${a}<b>${b}</b></div>`).join('')}
catch(err){T(c,'⚠️ This simulation hit an error and has been paused.',20,H/2,'#ff3b30',15);o.innerHTML='<div>This topic is temporarily unavailable.</div>';reportTopicError(cur,err)}
requestAnimationFrame(loop)}
go(0);requestAnimationFrame(loop);
const bg=document.createElement('canvas');bg.id='bg';document.body.prepend(bg);const bx=bg.getContext('2d');
function bgr(){bg.width=innerWidth;bg.height=innerHeight}bgr();addEventListener('resize',bgr);
function bgl(ms){const w=bg.width,h=bg.height,t=ms/1000;bx.clearRect(0,0,w,h);
for(let i=0;i<9;i++){const r=(t*40+i*90)%810;bx.strokeStyle='rgba(252,208,52,'+.16*(1-r/810)+')';bx.lineWidth=2;bx.beginPath();bx.arc(w*.82,-60,r,.2,2.9);bx.stroke()}
for(let i=0;i<5;i++){bx.strokeStyle='rgba(255,59,48,.08)';bx.lineWidth=2;bx.beginPath();for(let x=0;x<=w;x+=6){const y=h*(.25+i*.17)+Math.sin(x/90+t*.8+i)*18;x?bx.lineTo(x,y):bx.moveTo(x,y)}bx.stroke()}
if(!matchMedia('(prefers-reduced-motion:reduce)').matches)requestAnimationFrame(bgl)}
requestAnimationFrame(bgl);


// Medprime Physics AI Tutor: chat panel that knows which simulation and settings the learner is looking at.
// Part of Premium — hasTutor()/payOpen() gate every entry point (tBtn.onclick, tOpen() and tAsk() below).
const TH=[];let tBusy=false;
const tEl=document.createElement('div');tEl.id='tp';tEl.setAttribute('role','dialog');tEl.setAttribute('aria-label','Medprime Physics AI Tutor');
tEl.innerHTML='<div class=th><div><b>🤖 Medprime Physics AI Tutor</b><small id=tt></small></div><button id=tr type=button>New chat</button><button id=tx type=button aria-label="Close tutor">✕</button></div><div class=tl id=tl aria-live=polite></div><div class=tc id=tc></div><form class=tf id=tf><textarea id=ti placeholder="Ask about this simulation or any physics topic…" maxlength=1500></textarea><button id=ts>Send</button></form><div class=tn id=tq hidden></div><div class=tn>AI answers can be wrong. Check key facts against your textbook.</div>';
document.body.append(tEl);
const tBtn=document.createElement('button');tBtn.id='tb';tBtn.type='button';tBtn.textContent='🤖 Ask the Medprime AI Tutor';if(LC.tutorEnabled)document.body.append(tBtn);
const tl=tEl.querySelector('#tl'),ti=tEl.querySelector('#ti'),ts=tEl.querySelector('#ts');
const tEsc=x=>x.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function tMd(x){return tEsc(x).split(/\n{2,}/).map(p=>{const L=p.split('\n');const fmt=t=>t.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>');
if(L.every(l=>/^\s*([-*•]|\d+\.)\s/.test(l)))return'<ul>'+L.map(l=>'<li>'+fmt(l.replace(/^\s*([-*•]|\d+\.)\s/,''))+'</li>').join('')+'</ul>';return'<p style="margin:0 0 6px">'+fmt(L.join('<br>'))+'</p>'}).join('')}
function tAdd(cls,html){const m=document.createElement('div');m.className='tm '+cls;m.innerHTML=html;tl.append(m);tl.scrollTop=tl.scrollHeight;return m}
function tCtx(){const s=S[cur],v=V[cur];let out='';try{out=s.o(v).map(([a,b])=>a+' = '+b).join('; ')}catch(e){}
const st=s.ctl.map(k=>k[1]+': '+(Array.isArray(k[2])?k[2][v[k[0]]]:v[k[0]]+(k[2]?' '+k[2]:''))).join('; ');
return 'Simulation '+(cur+1)+' of '+S.length+': '+s.n+'\nGoal: '+s.g+'\nCurrent settings: '+st+'\nCurrent readouts: '+out+'\nTip shown on screen: '+s.tip+'\nKey takeaway: '+KT[cur]+'\nLearner quiz score on this topic: '+(RES[cur]!=null?RES[cur]+'/'+QZ[cur].length:'not attempted yet')+tHist()}
// Learner history across sessions (synced to their account when logged in), so the tutor can spot repeated weak areas.
function tHist(){const wk=xWeak().slice(0,5),H=XS.h.slice(-5);if(!wk.length&&!H.length)return'';
return '\nLearner history'+(window.acUser?' (saved to their account across devices)':'')+': quick checks done '+Object.keys(RES).length+'/'+S.length+(H.length?'; recent mock exams: '+H.map(h=>h.pc+'% ('+h.n+' q)').join(', '):'')+(wk.length?'; weakest topics so far: '+wk.map(t=>S[t].n).join(', '):'')}
// Daily question allowance, as reported by the server with each answer.
function tQ(n){if(n==null)return;const q=tEl.querySelector('#tq');q.hidden=false;q.textContent=(n==1?'1 tutor question':n+' tutor questions')+' left today.'}
function tTopic(){tEl.querySelector('#tt').textContent='Looking at: '+(cur+1)+'. '+S[cur].n}
function tChips(){const c=tEl.querySelector('#tc');c.innerHTML='';['Explain what I’m seeing','Why do these numbers change?','What should I try next?','Quiz me on this topic','How does this apply on my machine?'].forEach(q=>{const b=document.createElement('button');b.type='button';b.textContent=q;b.onclick=()=>tAsk(q);c.append(b)})}
function tHello(){tl.innerHTML='';tAdd('a',tMd('Hi! I’m the **Medprime Physics AI Tutor**. I can see the simulation you have open and its current settings, so ask me anything about it, or about any ultrasound physics topic.'))}
function tGate(){if(!LC.tutorEnabled){alert('The Medprime Physics AI Tutor isn’t available yet. Check back soon!');return false}if(hasTutor())return true;window.payOpen?payOpen():alert('Go Premium to use the Medprime Physics AI Tutor. Log in and upgrade.');return false}
function tOpen(){if(!tGate())return;tTopic();tEl.classList.add('on');tBtn.style.display='none';ti.focus()}
function tClose(){tEl.classList.remove('on');tBtn.style.display=''}
async function tAsk(q){if(!tGate())return;q=q.trim();if(!q||tBusy)return;tOpen();tBusy=true;ts.disabled=true;ti.value='';
TH.push({role:'user',content:q});tAdd('u',tEsc(q));const m=tAdd('a','<i>Thinking…</i>');let txt='';
try{const r=await fetch('/api/tutor/ask',{method:'POST',headers:{'Content-Type':'application/json','X-CSRFToken':csrfToken()},body:JSON.stringify({messages:TH.slice(-12),context:tCtx()})});
const tlft=r.headers.get('X-Tutor-Left');const d=await r.json().catch(()=>({}));
if(r.status==429||r.status==403){TH.pop();m.classList.add('e');m.textContent=d.error||'You’re asking questions very quickly. Please wait a minute and try again.';
tQ(r.status==429?0:null);
tBusy=false;ts.disabled=false;return}
if(!r.ok||!d.reply)throw 0;tQ(tlft);txt=d.reply;m.innerHTML=tMd(txt);tl.scrollTop=tl.scrollHeight;
if(!txt.trim())throw 0;TH.push({role:'assistant',content:txt})}
catch(e){TH.pop();m.classList.add('e');m.textContent=navigator.onLine?'Sorry, the tutor couldn’t answer just now. Please try again in a moment.':'📴 You’re offline. The tutor needs an internet connection, but the simulations, quizzes and exam all keep working.'}
tBusy=false;ts.disabled=false;ti.focus()}
function tutorWhy(d,q,k){const b=document.createElement('button');b.type='button';b.className='why';b.textContent='🤖 Why was that wrong?';
b.onclick=()=>{b.remove();tAsk('In the quiz I was asked: "'+q[0]+'" I chose "'+q[1][k]+'" but the correct answer is "'+q[1][q[2]]+'". Why is my choice wrong and the correct one right?')};d.append(b)}
tBtn.onclick=tOpen;tEl.querySelector('#tx').onclick=tClose;tEl.querySelector('#tr').onclick=()=>{if(tBusy)return;TH.length=0;tHello()};
tEl.querySelector('#tf').onsubmit=e=>{e.preventDefault();tAsk(ti.value)};
ti.onkeydown=e=>{if(e.key=='Enter'&&!e.shiftKey){e.preventDefault();tAsk(ti.value)}};
addEventListener('keydown',e=>{if(e.key=='Escape'&&tEl.classList.contains('on'))tClose()});
$('nav').addEventListener('click',tTopic);
if(LC.tutorEnabled)cv.forEach(([e])=>{const b=document.createElement('button');b.type='button';b.className='rsb';b.textContent='🤖 Ask the tutor about this';b.onclick=()=>tAsk('Explain what I’m seeing in this simulation with my current settings.');e.querySelector('.rsrow').append(b)});
tHello();tChips();
// Mock exam: timed exam mixed from every topic, then a score by topic and an explanation for every question.
const XL=[[25,30,'Quick practice','25 questions · 30 minutes'],[50,60,'Half exam','50 questions · 1 hour'],[110,120,'Full exam (SPI-style)','110 questions · 2 hours']],XP=70;
const XS=(()=>{try{const o=JSON.parse(localStorage.getItem('mpx')||'{}');return{h:o.h||[],t:o.t||{},a:o.a||null}}catch(e){return{h:[],t:{},a:null}}})(),xSv=()=>{try{localStorage.setItem('mpx',JSON.stringify(XS))}catch(e){}window.acPush&&acPush()};
const xSh=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a},xR=a=>a[Math.floor(Math.random()*a.length)],xN=(x,d=2)=>String(+x.toFixed(d)),
xT=s=>{s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),z=n=>String(n).padStart(2,'0');return(h?h+':'+z(m):m)+':'+z(s%60)};
// Calculation questions: [topic, generator]. Each generator returns [question, correct answer, wrong answers, explanation] with fresh numbers.
const XC=[
[0,()=>{const f=xR([2,2.5,3,3.5,5,7.5,10,12,15]),l=1.54/f;return['What is the wavelength in soft tissue at '+f+' MHz?',xN(l,3)+' mm',[xN(1.54*f)+' mm',xN(l/2,3)+' mm',xN(2*l,3)+' mm',xN(10*l,3)+' mm'],'λ = c ÷ f = 1.54 mm/µs ÷ '+f+' MHz = '+xN(l,3)+' mm. Higher frequency gives a shorter wavelength.']}],
[0,()=>{const f=xR([2,2.5,4,5,8,10]);return['What is the period of a wave with a frequency of '+f+' MHz?',xN(1/f,3)+' µs',[xN(f,3)+' µs',xN(2/f,3)+' µs',xN(1/(2*f),3)+' µs',xN(1.54/f,3)+' µs'],'Period = 1 ÷ frequency = 1 ÷ '+f+' MHz = '+xN(1/f,3)+' µs. Period and frequency are reciprocals.']}],
[12,()=>{const d=xR([1,2,3,4,5,6,8,10,12,15]),t=13*d;return['An echo arrives '+t+' µs after the pulse is sent. How deep is the reflector in soft tissue?',d+' cm',[2*d+' cm',xN(d/2,1)+' cm',xN(t/10,1)+' cm',4*d+' cm'],'Sound takes 13 µs to travel 1 cm and back, so depth = '+t+' ÷ 13 = '+d+' cm. Forgetting the round trip doubles the answer.']}],
[12,()=>{const p=xR([2,2.5,4,5,7,10]),m=77/p;return['The PRF is '+p+' kHz. What is the deepest a reflector can be without range ambiguity?',xN(m,1)+' cm',[xN(2*m,1)+' cm',xN(m/2,1)+' cm',xN(7.7*p,1)+' cm',xN(4*m,1)+' cm'],'Maximum depth ≈ 77 ÷ PRF in kHz = 77 ÷ '+p+' = '+xN(m,1)+' cm. Echoes from deeper return after the next pulse and are drawn too shallow.']}],
[5,()=>{const p=xR([3,4,5,6,8,10,12]);return['The PRF is '+p+' kHz. What is the Nyquist limit?',xN(p/2)+' kHz',[p+' kHz',2*p+' kHz',xN(p/4)+' kHz'],'Nyquist limit = PRF ÷ 2 = '+p+' ÷ 2 = '+xN(p/2)+' kHz. Doppler shifts higher than this alias.']}],
[1,()=>{const f=xR([2,3,5,7.5,10]),d=xR([2,3,4,6,8,10]),r=f*d;return['Using 0.5 dB/cm/MHz, what is the round-trip attenuation for a reflector '+d+' cm deep with a '+f+' MHz probe?',xN(r,1)+' dB',[xN(r/2,1)+' dB',xN(2*r,1)+' dB',xN(4*r,1)+' dB',xN(f+d,1)+' dB',xN(3*r,1)+' dB'],'Loss = 0.5 × frequency × distance. The sound goes '+d+' cm down and '+d+' cm back, so 0.5 × '+f+' × '+2*d+' = '+xN(r,1)+' dB.']}],
[3,()=>{const f=xR([2,2.5,3,4,5]),v=xR([.5,.77,1,1.54]),th=xR([0,60]),kn=2*f*v/1.54,c=th?kn/2:kn;return['A '+f+' MHz beam meets blood moving at '+Math.round(v*100)+' cm/s at '+th+'°. What is the Doppler shift?',xN(c)+' kHz',[xN(c/2)+' kHz',xN(2*c)+' kHz',xN(th?kn:kn/2)+' kHz',xN(4*c)+' kHz'],'Δf = 2 f v cos θ ÷ c = 2 × '+f+' MHz × '+v+' m/s × '+(th?'0.5':'1')+' ÷ 1540 m/s = '+xN(c)+' kHz. cos 0° = 1 and cos 60° = 0.5.']}],
[4,()=>{const n=xR([2,3,4]),f=xR([2,3,5,7.5,10]),l=1.54/f,s=n*l,r=s/2;return['A '+f+' MHz pulse has '+n+' cycles. What is the axial resolution in soft tissue?',xN(r)+' mm',[xN(s)+' mm',xN(l/2)+' mm',xN(2*s)+' mm',xN(r/2)+' mm'],'λ = 1.54 ÷ '+f+' = '+xN(l)+' mm. Spatial pulse length = '+n+' × λ = '+xN(s)+' mm. Axial resolution = SPL ÷ 2 = '+xN(r)+' mm.']}],
[15,()=>{const P=[[3,2],[6,4],[9,8],[10,10],[20,100],[30,1000]],[db,k]=xR(P);return['The intensity of a beam rises by '+db+' dB. By what factor has the intensity increased?','× '+k,xSh(P.filter(p=>p[1]!=k)).map(p=>'× '+p[1]),'dB = 10 log (I₂ ÷ I₁). Every 3 dB doubles the intensity and every 10 dB multiplies it by 10, so +'+db+' dB means × '+k+'.']}],
[7,()=>{const[[a,z1],[b,z2]]=xR([[['soft tissue',1.63],['fat',1.38]],[['soft tissue',1.63],['bone',7.8]],[['fat',1.38],['muscle',1.7]],[['soft tissue',1.63],['muscle',1.7]]]),q=(z2-z1)/(z2+z1),i=100*q*q,F=x=>xN(x,x<1?3:1)+'%';return['Sound passes at normal incidence from '+a+' (Z = '+z1+' MRayl) to '+b+' (Z = '+z2+' MRayl). About what percentage of the intensity is reflected?',F(i),[F(100*Math.abs(q)),F(100-i),F(2*i)],'IRC = ((Z₂ − Z₁) ÷ (Z₂ + Z₁))² = ('+xN(z2-z1)+' ÷ '+xN(z2+z1)+')² ≈ '+F(i)+'. Forgetting to square gives '+F(100*Math.abs(q))+'.']}],
[9,()=>{const d=xR([5,8,10,14,16,20]),L=xR([64,100,128,200]),r=77000/(d*L);return['With one focal zone, the depth is '+d+' cm and each frame has '+L+' scan lines. About what is the frame rate?',xN(r,0)+' fps',[xN(2*r,0)+' fps',xN(r/2,0)+' fps',xN(4*r,0)+' fps',xN(r/4,0)+' fps'],'PRF ≈ 77 000 ÷ depth = '+xN(77000/d,0)+' Hz. Frame rate = PRF ÷ lines = 77 000 ÷ ('+d+' × '+L+') ≈ '+xN(r,0)+' fps.']}],
[18,()=>{let f,b;do{f=xR([3,4,5,6,8,10]);b=xR([1,2,2.5,4,5])}while(b>=f);return['A transducer has a main frequency of '+f+' MHz and a bandwidth of '+b+' MHz. What is its Q-factor?',xN(f/b,1),[xN(b/f,2),xN(f*b,1),xN(f-b,1),xN(2*f/b,1)],'Q = f₀ ÷ bandwidth = '+f+' ÷ '+b+' = '+xN(f/b,1)+'. A low Q (wide bandwidth) gives the short pulses used for imaging.']}]];
function xBuild(n,tp){const by={};QZ.forEach((Q,t)=>{if(!tp||tp.has(t))by[t]=xSh(Q.map((q,k)=>({t,q:q[0],o:q[1],a:q[2],e:QX[t][k]})))});
const G=xSh(XC.filter(g=>!tp||tp.has(g[0]))),out=[],nc=G.length?Math.min(Math.round(n*.15),Math.max(2,Math.round(Object.keys(by).length*5/3))):0;
for(let i=0;i<nc;i++){const g=G[i%G.length];let r,tr=0;do r=g[1]();while(out.some(x=>x.q==r[0])&&++tr<6);const o=[r[1]];r[2].forEach(x=>{if(o.length<4&&!o.includes(x))o.push(x)});out.push({t:g[0],q:r[0],o,a:0,e:r[3],k:1})}
const ks=xSh(Object.keys(by));while(out.length<n&&ks.some(k=>by[k].length))ks.forEach(k=>{if(out.length<n&&by[k].length)out.push(by[k].pop())});
return xSh(out).map(q=>{const ix=xSh(q.o.map((_,i)=>i));return{...q,o:ix.map(i=>q.o[i]),a:ix.indexOf(q.a)}})}
// Weakest topics from quick checks and past exams (up to 8, only topics with at least one miss).
function xWeak(){const P=[];S.forEach((s,t)=>{let ok=0,n=0;if(RES[t]!=null){ok+=RES[t];n+=QZ[t].length}const x=XS.t[t];if(x){ok+=x[0];n+=x[1]}if(n&&ok<n)P.push([t,ok/n])});return P.sort((a,b)=>a[1]-b[1]).slice(0,8).map(p=>p[0])}
const xm=document.createElement('div');xm.id='xm';xm.setAttribute('role','dialog');xm.setAttribute('aria-label','Mock exam');xm.innerHTML='<div class=xi></div>';document.body.append(xm);
const xi=xm.querySelector('.xi');let xSel=0,xFocus='all',xTick=null,xLast=null,xFil='all';
function xOpen(){tClose();xm.classList.add('on');XS.a?xRun():xLast?xRes(1):xSetup();xm.scrollTop=0}
function xClose(){clearInterval(xTick);xm.classList.remove('on')}
function xSetup(){clearInterval(xTick);xLast=null;const wk=xWeak(),H=XS.h.slice(-5).reverse();if(!wk.length)xFocus='all';
xi.innerHTML='<div class=xh><h2>📝 Mock exam</h2><button type=button class=xb id=xc>Close</button></div><p class=goal>Practise under exam conditions: questions from every topic, a countdown timer and no feedback until you submit. Afterwards you get your score by topic and an explanation for every question.</p>'
+'<h3>1. Choose the length</h3><div class=xm>'+XL.map((l,i)=>'<button type=button data-i='+i+(i==xSel?' class=on':'')+'><b>'+l[2]+'</b>'+l[3]+(i==LC.premiumExamPresetIndex&&!hasExam()?' 🔒 tap to unlock':'')+'</button>').join('')+'</div>'
+'<h3>2. Choose the questions</h3><div class=xm><button type=button data-f=all'+(xFocus=='all'?' class=on':'')+'><b>All topics</b>Mixed from all '+S.length+' simulations, including calculation questions</button><button type=button data-f=weak'+(xFocus=='weak'?' class=on':'')+(wk.length?'':' disabled')+'><b>My weakest topics</b>'+(wk.length?tEsc(wk.map(t=>S[t].n).join(', ')):'Do some quick checks or an exam first')+'</button></div>'
+'<p>Pass mark: <b>'+XP+'%</b>. If you close the exam, the timer keeps running and you can come back to finish it.</p><button type=button class="xb p" id=xs>▶ Start exam</button>'
+(H.length?'<h3>Your recent exams</h3><table class=xhs><tr><th>Date</th><th>Exam</th><th>Score</th><th>Result</th></tr>'+H.map(h=>'<tr><td>'+new Date(h.d).toLocaleDateString()+'</td><td>'+tEsc(h.m)+'</td><td>'+h.ok+'/'+h.n+' · '+h.pc+'%</td><td>'+(h.pc>=XP?'✅ Pass':'❌ Not yet')+'</td></tr>').join('')+'</table>':'')}
function xStart(){if(xSel==LC.premiumExamPresetIndex&&!hasExam())xSel=0;const L=XL[xSel];
const tp=xFocus=='weak'?new Set(xWeak()):null;
const q=xBuild(L[0],tp),dur=Math.round(L[1]*60*q.length/L[0]);
XS.a={q,s:q.map(()=>null),f:q.map(()=>false),i:0,st:Date.now(),end:Date.now()+dur*1000,m:L[2]+(tp?' · weakest topics':'')};xRun();xm.scrollTop=0}
function xRun(){const A=XS.a;if(!A)return xSetup();if(Date.now()>=A.end)return xFinish(1);xSv();
const q=A.q[A.i],n=A.q.length,dn=A.s.filter(x=>x!=null).length;
xi.innerHTML='<div class=xh><h2>Question '+(A.i+1)+' of '+n+'</h2><span class=xt id=xt></span><button type=button class=xb id=xc>Save &amp; close</button><button type=button class="xb p" id=xd>Submit exam</button></div><div class=bar style="margin:10px 0 4px"><i style="width:'+100*dn/n+'%"></i></div><small style="color:var(--m)">'+dn+' answered · '+A.f.filter(Boolean).length+' flagged · '+tEsc(A.m)+'</small>'
+'<div class=xq>'+(q.k?'<span class=xk>🧮 Calculation</span>':'')+'<p>'+tEsc(q.q)+'</p>'+q.o.map((o,j)=>'<button type=button class="xo'+(A.s[A.i]==j?' sel':'')+'" data-j='+j+' aria-pressed='+(A.s[A.i]==j)+'><i>'+'ABCD'[j]+'</i><span>'+tEsc(o)+'</span></button>').join('')+'</div>'
+'<div class=xh><button type=button class=xb id=xp'+(A.i?'':' disabled')+'>← Previous</button><button type=button class=xb id=xfl>'+(A.f[A.i]?'🚩 Flagged':'⚑ Flag for review')+'</button><span style=flex:1></span><button type=button class="xb p" id=xn>'+(A.i<n-1?'Next →':'Finish & submit')+'</button></div>'
+'<div class=xg>'+A.q.map((_,j)=>'<button type=button data-g='+j+' class="'+(A.s[j]!=null?'a ':'')+(A.f[j]?'f ':'')+(j==A.i?'c':'')+'" aria-label="Question '+(j+1)+'">'+(j+1)+'</button>').join('')+'</div><p class=tn style="padding:10px 0 0">Keys: A–D to answer · ← → to move · F to flag. Flagged questions have a red dot.</p>';
const tk=()=>{const r=(A.end-Date.now())/1000,el=xi.querySelector('#xt');if(r<=0)return xFinish(1);if(el){el.textContent='⏱ '+xT(r);el.classList.toggle('low',r<300)}};clearInterval(xTick);xTick=setInterval(tk,1000);tk()}
function xSubmit(){const A=XS.a,u=A.s.filter(x=>x==null).length,f=A.f.filter(Boolean).length;
if((u||f)&&!confirm((u?u+(u>1?' questions are':' question is')+' not answered. ':'')+(f?f+' flagged for review. ':'')+'Submit the exam now?'))return;xFinish(0)}
function xFinish(up){clearInterval(xTick);const A=XS.a;if(!A)return;const n=A.q.length,ok=A.q.reduce((s,q,j)=>s+(A.s[j]==q.a),0),pc=Math.round(100*ok/n),bt={};
A.q.forEach((q,j)=>{const g=A.s[j]==q.a?1:0,x=bt[q.t]=bt[q.t]||[0,0],y=XS.t[q.t]=XS.t[q.t]||[0,0];x[0]+=g;x[1]++;y[0]+=g;y[1]++});
XS.h.push({d:Date.now(),m:A.m,ok,n,pc});XS.h=XS.h.slice(-20);xLast={...A,ok,n,pc,bt,up,tu:Math.min(A.end,Date.now())-A.st};XS.a=null;xSv();xFil='all';xRes(1)}
function xRes(top){const R=xLast,ps=R.pc>=XP,J=R.q.map((_,j)=>j),wr=J.filter(j=>R.s[j]!=R.q[j].a),fl=J.filter(j=>R.f[j]),L=xFil=='wrong'?wr:xFil=='flag'?fl:J,
tp=Object.keys(R.bt).map(Number).sort((a,b)=>R.bt[a][0]/R.bt[a][1]-R.bt[b][0]/R.bt[b][1]);
xi.innerHTML='<div class=xh><h2>📊 Exam results</h2><button type=button class=xb id=xr>New exam</button><button type=button class=xb id=xc>Close</button></div>'
+(R.up?'<p class=tip>⏰ Time ran out, so the exam was submitted automatically.</p>':'')
+'<div class="xs '+(ps?'ok':'no')+'"><b>'+R.pc+'%</b>'+(ps?'✅ Pass':'❌ Not yet. The pass mark is '+XP+'%')+'<div>'+R.ok+' of '+R.n+' correct · time used '+xT(R.tu/1000)+' · '+tEsc(R.m)+'</div></div>'
+'<h3>Score by topic</h3><p class=goal>Weakest topics first. Practise opens the simulation for that topic.</p>'+tp.map(t=>{const[a,b]=R.bt[t],p=Math.round(100*a/b),col=p>=XP?'#4ade80':p>=50?'#fcd034':'#ff3b30';return'<div class=xrow><span>'+(t+1)+'. '+tEsc(S[t].n)+'</span><div class=bar><i style="width:'+Math.max(p,2)+'%;background:'+col+'"></i></div><b>'+a+'/'+b+'</b><button type=button class=xb data-go='+t+'>Practise</button></div>'}).join('')
+(wr.length?'<p><button type=button class="xb p" id=xw>🎯 New exam on my weakest topics</button></p>':'')
+'<h3 id=xv>Review every question</h3><div class=xh style="justify-content:flex-start">'+[['all','All',J.length],['wrong','Wrong or skipped',wr.length],['flag','Flagged',fl.length]].map(([k,l,c])=>'<button type=button class="xb'+(xFil==k?' p':'')+'" data-v='+k+'>'+l+' ('+c+')</button>').join('')+'</div>'
+(L.length?L.map(j=>{const q=R.q[j],s=R.s[j],g=s==q.a;return'<div class=xq><small style="color:var(--m)">Question '+(j+1)+' · '+tEsc(S[q.t].n)+(q.k?' · 🧮 calculation':'')+(R.f[j]?' · 🚩 flagged':'')+'</small><p>'+(g?'✅ ':'❌ ')+tEsc(q.q)+'</p>'
+q.o.map((o,k)=>'<div class="xo'+(k==q.a?' good':k==s?' bad':'')+'"><i>'+'ABCD'[k]+'</i><span>'+tEsc(o)+(k==s?' <em>(your answer)</em>':'')+'</span></div>').join('')
+(s==null?'<p style="color:#ff7a6e;margin:6px 0 0">Not answered</p>':'')+'<div class=xe>💡 '+tEsc(q.e)+'</div>'+(g||!LC.tutorEnabled?'':'<button type=button class=why data-ask='+j+'>🤖 Ask the tutor about this</button>')+'</div>'}).join(''):'<p class=goal>No questions in this list.</p>');
if(top)xm.scrollTop=0}
xi.onclick=e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const A=XS.a,D=b.dataset,id=b.id;
if(id=='xc')return xClose();if(id=='xs')return xStart();if(id=='xr')return xSetup();if(id=='xw'){xFocus='weak';return xSetup()}
if(D.i!=null){const i=+D.i;if(i==LC.premiumExamPresetIndex&&!hasExam())return window.payOpen?payOpen():alert('Go Premium to unlock the full mock exam. Log in and upgrade.');xSel=i;return xSetup()}if(D.f){xFocus=D.f;return xSetup()}
if(A){if(D.j!=null)A.s[A.i]=+D.j;else if(D.g!=null)A.i=+D.g;else if(id=='xp')A.i--;else if(id=='xfl')A.f[A.i]=!A.f[A.i];else if(id=='xn'){if(A.i<A.q.length-1)A.i++;else return xSubmit()}else if(id=='xd')return xSubmit();return xRun()}
if(D.v){xFil=D.v;return xRes()}
if(D.go!=null){const t=+D.go;xClose();go(t);tTopic();cv[t][0].scrollIntoView({behavior:'smooth'});return}
if(D.ask!=null){const q=xLast.q[+D.ask],s=xLast.s[+D.ask];tAsk('In my mock exam I was asked: "'+q.q+'" '+(s==null?'I did not answer it.':'I chose "'+q.o[s]+'".')+' The correct answer is "'+q.o[q.a]+'". Please explain why, and why the other options are wrong.')}};
addEventListener('keydown',e=>{if(!xm.classList.contains('on')||/^(TEXTAREA|INPUT|SELECT)$/.test(e.target.tagName)||tEl.classList.contains('on'))return;if(e.key=='Escape')return xClose();const A=XS.a;if(!A||e.ctrlKey||e.metaKey||e.altKey)return;
const k=e.key.toUpperCase(),j=Math.max('ABCD'.indexOf(k),'1234'.indexOf(k));if(k.length==1&&j>=0&&j<A.q[A.i].o.length)A.s[A.i]=j;else if(e.key=='ArrowRight'&&A.i<A.q.length-1)A.i++;else if(e.key=='ArrowLeft'&&A.i)A.i--;else if(k=='F')A.f[A.i]=!A.f[A.i];else return;e.preventDefault();xRun()});
// Enquiry form: Netlify Forms, submitted with fetch so the learner stays on the page.
(()=>{const f=$('#eqf'),m=$('#eqm'),ok=$('#eqok'),ii=f.elements.institution,ir=$('#eqi .rq'),b=f.querySelector('[type=submit]');
const sync=()=>{const d=f.elements.enquiry_type.value=='Institutional demo';ii.required=d;ir.hidden=!d};f.addEventListener('change',sync);sync();
f.elements.preferred_date.min=new Date().toISOString().slice(0,10);
f.onsubmit=e=>{e.preventDefault();if(!f.reportValidity())return;b.disabled=true;b.textContent='Sending…';m.className='eqm';m.textContent='';
fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','X-CSRFToken':csrfToken()},body:new URLSearchParams(new FormData(f)).toString()}).then(r=>{if(!r.ok)throw 0;f.reset();sync();f.hidden=true;ok.hidden=false;ok.focus()}).catch(()=>{m.className='eqm er';m.textContent=navigator.onLine?'Sorry, the enquiry could not be sent. Please try again, or email medprimeeducationgroup@gmail.com.':'📴 You’re offline. Your details are still filled in, so press Send again once you’re connected.'}).finally(()=>{b.disabled=false;b.textContent='Send enquiry'})};
$('#eqn').onclick=()=>{ok.hidden=true;f.hidden=false;m.className='eqm';m.textContent='We usually reply within 1–2 working days.';f.elements.name.focus()};
})();
// Offline support: store the lab on this device so it opens without a connection.
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
