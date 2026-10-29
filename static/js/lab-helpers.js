// Shared canvas-drawing helpers and constants used by every simulation topic's
// d(c,t,v)/o(v) functions. Loaded before app.js (production topics) and before
// staff_topics.js (AI-generated topic previews) so both run against the exact
// same globals an AI-generated topic was told about and will actually run
// against once merged into the live page — never a reimplemented subset.
const W=800,H=340;
const M={'Soft tissue':[1.63,1540,'#38bdf8'],'Fat':[1.38,1450,'#fcd034'],'Muscle':[1.70,1580,'#f87171'],'Bone':[7.8,4080,'#e5e7eb'],'Air':[.0004,330,'#a78bfa']},K=Object.keys(M),AT=[.5,.6,1,5];
const T=(c,s,x,y,col='#9db4d8',z=13,al='left')=>{c.fillStyle=col;c.font=z+'px Segoe UI,sans-serif';c.textAlign=al;c.fillText(s,x,y)};
const ln=(c,a,b,x,y,col,w=2)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(a,b);c.lineTo(x,y);c.stroke()};
function P(v){const[z1,c1,k1]=M[K[v.a]],[z2,c2,k2]=M[K[v.b]],th=v.th*Math.PI/180,s=c2/c1*Math.sin(th);return{z1,c1,k1,z2,c2,k2,th,R:((z2-z1)/(z2+z1))**2,tir:s>1,tt:Math.asin(Math.min(s,1))}}
const HS=[],DB=x=>Math.max(-60,20*Math.log10(Math.max(x,1e-6))),HQ=v=>{const h=Math.min(.5,.0015*v.m*v.m*v.d),a1=Math.exp(-.0575*v.f*v.d),a2=h*Math.exp(-.115*v.f*v.d);return{a1,a2,r:Math.min(.5,a2/a1)}},
ZT=[['Air',.0004],['Fat',1.38],['Soft tissue',1.63],['Muscle',1.70],['Bone',7.8]],
VC={u:[0,1,2,3].map(()=>new Float32Array(84)),w:[0,1,2,3].map(()=>new Float32Array(84)),n:0,sm:0,k:0,p:0},pr=(i,r,d)=>((i*37+r*91+((i*i*13)%29)*7)%100)<d;
const WR=(c,s,x,y,w,lh,col,z)=>{c.font=z+'px Segoe UI,sans-serif';c.fillStyle=col;c.textAlign='left';let l='';s.split(' ').forEach(wd=>{const q=l?l+' '+wd:wd;if(c.measureText(q).width>w&&l){c.fillText(l,x,y);y+=lh;l=wd}else l=q});c.fillText(l,x,y);return y+lh};
const SCI=(()=>{const gw=100,gh=60,C={},F=[];let s=12345;const r=()=>{s=(s+1831565813)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
for(let k=0;k<9;k++){const f=new Float32Array(gw*gh);for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){const q=(x-30)**2+(y-30)**2<150?.12:(x-72)**2+(y-30)**2<60?2.6:1;f[y*gw+x]=q*Math.sqrt(-2*Math.log(1-r()))}F.push(f)}
return n=>C[n]||(C[n]=(()=>{const cv=document.createElement('canvas');cv.width=gw;cv.height=gh;const x=cv.getContext('2d'),im=x.createImageData(gw,gh);let sm=0,sq=0,cnt=0;
for(let i=0;i<gw*gh;i++){let a=0;for(let k=0;k<n;k++)a+=F[k][i];a/=n;const g=Math.min(255,100*a);im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=g;im.data[i*4+3]=255;const X=i%gw,Y=(i/gw)|0;if(X>=85&&X<98&&Y>=5&&Y<55){sm+=a;sq+=a*a;cnt++}}
x.putImageData(im,0,0);const m=sm/cnt;return{cv,s:Math.sqrt(sq/cnt-m*m)/m}})())})();
