// Readable source of people.json (chantier C.1): the hand list of touch-ups, checked against the villager's frame 0.   node tools/art/patches/people-src.js
const path=require('path'),fs=require('fs');const { Atlas } = require(path.resolve('tools/lib/atlas'));
const RN=['gr','fo','ju','sa','ea','st','wa','ic','sk','re','fi','ma','sw','te','ro','pi'];
const ix=s=>s==='T'?255:s.startsWith('tm')?128+ +s[2]:RN.indexOf(s.slice(0,2))*6+ +s[2];
// people, direction, [x, y, from, to] ...
const L=[
['human','down',[8,15,'tm2','tm3'],[8,16,'tm2','tm3'],[8,17,'tm2','tm3'],[15,15,'tm3','tm2'],[15,16,'tm3','tm2'],[15,17,'tm3','tm2'],[9,21,'ea0','ea1'],[10,21,'ea0','ea1'],[13,21,'ea0','ea1'],[14,21,'ea0','ea1'],[9,23,'ea0','T'],[10,23,'ea0','T'],[13,23,'ea0','T'],[14,23,'ea0','T']],
['human','left',[11,21,'sk3','ea3'],[12,21,'sk2','ea2'],[11,22,'sk2','ea1'],[12,22,'sk2','ea1']],
['human','right',[11,21,'sk3','ea3'],[12,21,'sk2','ea2'],[11,22,'sk2','ea1'],[12,22,'sk2','ea1']],
['orc','down',[11,20,'fo0','ea0'],[10,21,'ea0','ea1'],[9,23,'ea0','T'],[10,23,'ea0','T'],[13,23,'ea0','T'],[14,23,'ea0','T']],
['orc','left',[9,22,'fo0','ea0'],[10,22,'ju2','ea2'],[11,22,'ju2','ea2'],[12,22,'ju2','ea1'],[13,22,'ju2','ea1'],[14,22,'fo0','ea0'],[9,23,'fo0','ea0'],[10,23,'ju2','ea1'],[11,23,'ju2','ea1'],[12,23,'ju2','ea1'],[13,23,'fo0','ea0']],
['orc','right',[9,22,'fo0','ea0'],[10,22,'ju2','ea2'],[11,22,'ju2','ea2'],[12,22,'ju2','ea1'],[13,22,'ju2','ea1'],[14,22,'fo0','ea0'],[10,23,'fo0','ea0'],[11,23,'ju3','ea1'],[12,23,'ju2','ea1'],[13,23,'ju2','ea1'],[14,23,'fo0','ea0']],
['elf','down',[9,14,'tm2','tm3'],[9,15,'tm2','tm3']],
['dwarf','down',[11,22,'re0','st0']],
['dwarf','left',[11,23,'sk3','st2'],[12,23,'sk2','st1'],[13,23,'sk2','st1']],
['dwarf','right',[10,23,'sk3','st2'],[11,23,'sk3','st1'],[12,23,'sk2','st1']],
['myrrin','left',[11,22,'sa3','ea2'],[12,22,'sa3','ea2']],
['myrrin','right',[11,22,'sa3','ea2'],[12,22,'sa3','ea1']],
['okari','down',[10,15,'tm4','tm3']],
['okari','left',[14,19,'re1','re0']],
['okari','right',[9,19,'re1','re0']],
];
const out={};let bad=0;const ats={};
for(const [p,dir,...es] of L){const at=ats[p]||(ats[p]=Atlas.load('people_'+p)),f=at.frame(p+'/villager/idle/'+dir+'/0');const arr=[];
 for(const [x,y,from,to] of es){const v=f.get(x,y);if(v!==ix(from)&&v!==ix(to)){console.log('MISMATCH',p,dir,x,y,'has',v,'expected',from,ix(from));bad++;}arr.push([x,y,ix(to),ix(from)]);}
 out[p+'/*/idle/'+dir+'/*']=arr;}
if(bad)process.exit(1);fs.mkdirSync('tools/art/patches',{recursive:true});
fs.writeFileSync('tools/art/patches/people.json','{\n'+Object.keys(out).map(k=>' '+JSON.stringify(k)+': '+JSON.stringify(out[k])).join(',\n')+'\n}\n');console.log('patch entries',Object.values(out).reduce((a,b)=>a+b.length,0));
