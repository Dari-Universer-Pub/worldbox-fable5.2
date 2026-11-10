(function(AL){AL.DATA={"animals":{"rabbit":{"atlas":"creatures","size":16,"hp":8,"speed":1.25,"attack":0,"diet":"herb","herd":4,"lifespan":6,"meat":2,"fertility":1.6,"biomes":["grass","forest","hills","savanna"],"density":1.6,"courage":0},"deer":{"atlas":"creatures","size":24,"hp":30,"speed":1.3,"attack":4,"diet":"herb","herd":5,"lifespan":14,"meat":6,"fertility":1,"biomes":["forest","grass","hills","tundra"],"density":1,"courage":0.05},"sheep":{"atlas":"creatures","size":24,"hp":25,"speed":0.8,"attack":0,"diet":"herb","herd":6,"lifespan":12,"meat":5,"fertility":1.2,"biomes":["grass","hills"],"density":0.7,"courage":0,"livestock":true},"boar":{"atlas":"creatures","size":24,"hp":45,"speed":1,"attack":8,"diet":"herb","herd":3,"lifespan":12,"meat":7,"fertility":1.1,"biomes":["forest","swamp","jungle","savanna"],"density":0.7,"courage":0.3},"wolf":{"atlas":"creatures","size":24,"hp":40,"speed":1.35,"attack":9,"diet":"pred","herd":4,"lifespan":16,"meat":2,"fertility":1.3,"biomes":["forest","tundra","hills","snow"],"density":0.4,"courage":0.6},"bear":{"atlas":"creatures","size":32,"hp":110,"speed":0.95,"attack":18,"diet":"pred","herd":1,"lifespan":30,"meat":10,"fertility":0.9,"biomes":["forest","hills","tundra","snow"],"density":0.25,"courage":0.9},"eagle":{"atlas":"creatures","size":16,"hp":12,"speed":1.6,"attack":5,"diet":"pred","herd":1,"lifespan":18,"meat":1,"fertility":1,"biomes":["hills","mountain","savanna","desert","tundra","grass","forest"],"density":0.5,"fly":true,"courage":0.3},"salmon":{"atlas":"creatures","size":16,"hp":5,"speed":0.9,"attack":0,"diet":"herb","herd":5,"lifespan":6,"meat":3,"fertility":1.6,"biomes":["shallow"],"density":0.5,"swim":true,"courage":0}},"buildings":{"hall":{"id":0,"fp":[4,3],"cost":{"wood":0},"hp":400,"stage":0,"max":[1,0],"great":true,"light":true,"store":true,"cap":4},"house":{"id":1,"fp":[3,2],"cost":{"wood":12},"hp":150,"stage":0,"max":[2,4],"cap":5,"light":true},"farm":{"id":2,"fp":[3,2],"cost":{"wood":14},"hp":120,"stage":1,"max":[1,10],"job":"farmer","workers":3,"fields":true},"warehouse":{"id":3,"fp":[3,3],"cost":{"wood":20,"stone":5},"hp":220,"stage":1,"max":[1,60],"store":true},"sawmill":{"id":4,"fp":[3,2],"cost":{"wood":16},"hp":140,"stage":1,"max":[1,50],"job":"lumberjack","workers":3,"store":true},"mine":{"id":5,"fp":[3,2],"cost":{"wood":18},"hp":200,"stage":2,"max":[1,50],"job":"miner","workers":3,"store":true},"market":{"id":6,"fp":[4,3],"cost":{"wood":30,"stone":10},"hp":200,"stage":2,"max":[1,120],"job":"merchant","workers":2,"light":true},"temple":{"id":7,"fp":[4,3],"cost":{"wood":25,"stone":30},"hp":350,"stage":2,"max":[1,150],"job":"priest","workers":1,"light":true},"barracks":{"id":8,"fp":[4,3],"cost":{"wood":30,"stone":20},"hp":400,"stage":2,"max":[1,100],"job":"soldier","workers":0},"forge":{"id":9,"fp":[3,2],"cost":{"wood":20,"stone":25},"hp":250,"stage":3,"max":[1,120],"job":"blacksmith","workers":2,"light":true},"watchtower":{"id":10,"fp":[2,2],"cost":{"wood":10,"stone":20},"hp":300,"stage":2,"max":[0,40],"defense":true},"port":{"id":11,"fp":[4,3],"cost":{"wood":35},"hp":200,"stage":2,"max":[1,200],"job":"fisher","workers":3,"shore":true,"store":true},"tavern":{"id":12,"fp":[3,2],"cost":{"wood":25,"stone":5},"hp":180,"stage":3,"max":[1,120],"job":"bard","workers":1,"light":true},"library":{"id":13,"fp":[3,3],"cost":{"wood":25,"stone":25},"hp":220,"stage":3,"max":[1,200],"job":"scholar","workers":2,"light":true},"hospital":{"id":14,"fp":[3,3],"cost":{"wood":25,"stone":25},"hp":220,"stage":4,"max":[1,200],"job":"healer","workers":1,"light":true,"provisional":true},"wall":{"id":15,"fp":[1,1],"cost":{"stone":3},"hp":250,"stage":3,"max":[0,0],"wall":true},"gate":{"id":16,"fp":[1,1],"cost":{"stone":4,"wood":4},"hp":300,"stage":3,"max":[0,0],"wall":true,"gate":true}},"flora":{"oak":{"id":1,"kind":"tree","sprite":"tree/oak","biomes":["grass","forest","hills"],"wood":6,"grow":0.5,"lod":["forest",3]},"birch":{"id":2,"kind":"tree","sprite":"tree/birch","biomes":["hills","grass","forest"],"wood":4,"grow":0.7,"lod":["grass",3]},"pine":{"id":3,"kind":"tree","sprite":"tree/pine","biomes":["forest","tundra","hills"],"wood":6,"grow":0.4,"lod":["forest",2]},"snowpine":{"id":4,"kind":"tree","sprite":"tree/snowpine","biomes":["snow"],"wood":5,"grow":0.3,"lod":["forest",3]},"palm":{"id":5,"kind":"tree","sprite":"tree/palm","biomes":["sand","desert"],"wood":3,"grow":0.5,"lod":["jungle",3]},"jungletree":{"id":6,"kind":"tree","sprite":"tree/jungle","biomes":["jungle"],"wood":8,"grow":0.8,"lod":["jungle",2]},"acacia":{"id":7,"kind":"tree","sprite":"tree/acacia","biomes":["savanna"],"wood":4,"grow":0.4,"lod":["swamp",3]},"willow":{"id":8,"kind":"tree","sprite":"tree/willow","biomes":["swamp"],"wood":5,"grow":0.5,"lod":["swamp",2]},"deadtree":{"id":9,"kind":"tree","sprite":"tree/dead","biomes":["tundra","volcanic"],"wood":2,"grow":0.1,"lod":["stone",2]},"cactus":{"id":10,"kind":"tree","sprite":"tree/cactus","biomes":["desert"],"wood":1,"grow":0.2,"lod":["jungle",2]},"bush":{"id":11,"kind":"bush","sprite":"bush","biomes":["grass","forest","hills","savanna"],"grow":0.6},"berry":{"id":12,"kind":"bush","sprite":"berry","biomes":["grass","forest","hills"],"food":3,"grow":0.5},"grasstuft":{"id":13,"kind":"decor","sprite":"grasstuft","biomes":["grass","savanna","hills","forest"],"grow":1,"graze":1},"reeds":{"id":14,"kind":"decor","sprite":"reeds","biomes":["swamp"],"grow":0.8},"flower_red":{"id":15,"kind":"decor","sprite":"flower_red","biomes":["grass","hills"],"grow":0.6},"flower_gold":{"id":16,"kind":"decor","sprite":"flower_gold","biomes":["grass","savanna"],"grow":0.6},"flower_blue":{"id":17,"kind":"decor","sprite":"flower_blue","biomes":["forest","tundra"],"grow":0.5},"flower_pink":{"id":18,"kind":"decor","sprite":"flower_pink","biomes":["jungle","grass"],"grow":0.6},"mushroom":{"id":19,"kind":"decor","sprite":"mushroom","biomes":["forest","swamp"],"food":1,"grow":0.4},"glowcap":{"id":20,"kind":"decor","sprite":"glowcap","biomes":["swamp","jungle"],"grow":0.2,"light":1},"rock":{"id":21,"kind":"rock","sprite":"rock","biomes":["hills","tundra","volcanic","desert","savanna"],"stone":8},"ore_copper":{"id":22,"kind":"rock","sprite":"ore_copper","biomes":["hills","savanna"],"ore":"copper","stone":4},"ore_iron":{"id":23,"kind":"rock","sprite":"ore_iron","biomes":["hills","tundra"],"ore":"iron","stone":4},"ore_gold":{"id":24,"kind":"rock","sprite":"ore_gold","biomes":["hills","desert"],"ore":"gold","stone":4},"ore_aether":{"id":25,"kind":"rock","sprite":"ore_aether","biomes":["volcanic","snow"],"ore":"aetherite","stone":4},"stump":{"id":26,"kind":"decor","sprite":"stump","biomes":[]},"bones":{"id":27,"kind":"decor","sprite":"bones","biomes":["desert"]},"ember":{"id":28,"kind":"decor","sprite":"ember","biomes":[],"light":1},"wheat":{"id":29,"kind":"crop","sprite":"wheat","biomes":[],"food":4,"grow":1},"peak":{"id":30,"kind":"rock","sprite":"peak","biomes":[],"stone":30,"lod":["stone",4]},"snowpeak":{"id":31,"kind":"rock","sprite":"snowpeak","biomes":[],"stone":30,"lod":["ice",5]}},"grounds":{"deep":{"id":0,"rank":0,"cost":0,"water":2,"flat":["water",1],"fert":0,"flam":0,"biome":"ocean"},"shallow":{"id":1,"rank":1,"cost":0,"water":1,"flat":["water",3],"fert":0,"flam":0,"biome":"coast"},"lava":{"id":2,"rank":2,"cost":0,"water":0,"flat":["fire",2],"fert":0,"flam":0,"biome":"volcanic","emissive":true},"sand":{"id":3,"rank":3,"cost":1.2,"water":0,"flat":["sand",5],"fert":0.1,"flam":0,"biome":"beach"},"soil":{"id":4,"rank":4,"cost":1,"water":0,"flat":["sand",2],"fert":1,"flam":0.1,"biome":"plains"},"road":{"id":5,"rank":5,"cost":0.6,"water":0,"flat":["sand",3],"fert":0,"flam":0,"biome":"plains"},"desert":{"id":6,"rank":6,"cost":1.3,"water":0,"flat":["sand",4],"fert":0.05,"flam":0,"biome":"desert"},"savanna":{"id":7,"rank":7,"cost":1,"water":0,"flat":["sand",3],"fert":0.5,"flam":0.7,"biome":"savanna"},"grass":{"id":8,"rank":8,"cost":1,"water":0,"flat":["grass",4],"fert":1,"flam":0.4,"biome":"plains"},"swamp":{"id":9,"rank":9,"cost":1.8,"water":0,"flat":["swamp",4],"fert":0.4,"flam":0.1,"biome":"swamp"},"forest":{"id":10,"rank":10,"cost":1.2,"water":0,"flat":["grass",3],"fert":0.8,"flam":0.6,"biome":"forest"},"jungle":{"id":11,"rank":11,"cost":1.5,"water":0,"flat":["jungle",3],"fert":0.9,"flam":0.3,"biome":"jungle"},"tundra":{"id":12,"rank":12,"cost":1.2,"water":0,"flat":["stone",4],"fert":0.2,"flam":0.1,"biome":"tundra"},"hills":{"id":13,"rank":13,"cost":1.7,"water":0,"flat":["grass",3],"fert":0.5,"flam":0.3,"biome":"hills"},"mountain":{"id":14,"rank":14,"cost":0,"water":0,"flat":["stone",4],"fert":0,"flam":0,"biome":"mountains"},"volcanic":{"id":15,"rank":15,"cost":1.4,"water":0,"flat":["stone",3],"fert":0.3,"flam":0,"biome":"volcanic"},"snow":{"id":16,"rank":16,"cost":1.6,"water":0,"flat":["ice",5],"fert":0,"flam":0,"biome":"snow"},"ice":{"id":17,"rank":17,"cost":1.4,"water":0,"flat":["ice",3],"fert":0,"flam":0,"biome":"ice"}},"jobs":{"none":{"id":0,"look":"villager","task":"idle"},"lumberjack":{"id":1,"look":"lumberjack","task":"chop","res":"wood"},"miner":{"id":2,"look":"miner","task":"mine","res":"stone"},"farmer":{"id":3,"look":"farmer","task":"farm","res":"food","needs":"farm"},"builder":{"id":4,"look":"builder","task":"build"},"hunter":{"id":5,"look":"hunter","task":"hunt","res":"food"},"fisher":{"id":6,"look":"fisher","task":"fish","res":"food","needs":"port"},"herder":{"id":7,"look":"herder","task":"herd","res":"food"},"blacksmith":{"id":8,"look":"blacksmith","task":"smith","needs":"forge"},"merchant":{"id":9,"look":"merchant","task":"trade","needs":"market"},"soldier":{"id":10,"look":"soldier","task":"guard","needs":"barracks","military":true},"archer":{"id":11,"look":"archer","task":"guard","needs":"barracks","military":true,"ranged":true},"priest":{"id":12,"look":"priest","task":"preach","needs":"temple"},"scholar":{"id":13,"look":"scholar","task":"study","needs":"library"},"ruler":{"id":14,"look":"ruler","task":"rule"},"knight":{"id":15,"look":"knight","task":"guard","needs":"barracks","military":true,"minStage":4},"healer":{"id":16,"look":"priest","task":"heal","needs":"hospital"},"sailor":{"id":17,"look":"fisher","task":"sail","needs":"port"},"gatherer":{"id":18,"look":"villager","task":"gather","res":"food"},"engineer":{"id":19,"look":"builder","task":"siege","needs":"barracks","military":true,"minStage":4},"bard":{"id":20,"look":"merchant","task":"entertain","needs":"tavern"}},"keys":{"panLeft":{"codes":["KeyA","ArrowLeft"],"group":"camera"},"panRight":{"codes":["KeyD","ArrowRight"],"group":"camera"},"panUp":{"codes":["KeyW","ArrowUp"],"group":"camera"},"panDown":{"codes":["KeyS","ArrowDown"],"group":"camera"},"zoomIn":{"codes":["KeyE","NumpadAdd"],"group":"camera"},"zoomOut":{"codes":["KeyQ","NumpadSubtract"],"group":"camera"},"pause":{"codes":["Space"],"group":"time"},"slower":{"codes":["Comma"],"group":"time"},"faster":{"codes":["Period"],"group":"time"},"cancel":{"codes":["Escape"],"group":"ui"},"brushSmaller":{"codes":["BracketLeft"],"group":"tools"},"brushBigger":{"codes":["BracketRight"],"group":"tools"},"brushShape":{"codes":["KeyB"],"group":"tools"},"cat1":{"codes":["Digit1"],"group":"tools"},"cat2":{"codes":["Digit2"],"group":"tools"},"cat3":{"codes":["Digit3"],"group":"tools"},"cat4":{"codes":["Digit4"],"group":"tools"},"cat5":{"codes":["Digit5"],"group":"tools"},"cat6":{"codes":["Digit6"],"group":"tools"},"cat7":{"codes":["Digit7"],"group":"tools"},"nextPower":{"codes":["Tab"],"group":"tools"},"prevPower":{"codes":["Backquote"],"group":"tools"},"layerNext":{"codes":["KeyL"],"group":"view"},"minimap":{"codes":["KeyM"],"group":"view"},"cinema":{"codes":["KeyC"],"group":"view"},"follow":{"codes":["KeyF"],"group":"view"},"history":{"codes":["KeyH"],"group":"windows"},"kingdoms":{"codes":["KeyK"],"group":"windows"},"stats":{"codes":["KeyG"],"group":"windows"},"options":{"codes":["KeyO"],"group":"windows"},"saves":{"codes":["F5"],"group":"windows"},"fullscreen":{"codes":["F11"],"group":"ui"},"debug":{"codes":["F3"],"group":"ui"}},"monsters":{"zombie":{"atlas":"people_zombie","humanoid":true,"size":24,"hp":70,"speed":0.62,"attack":9,"lifespan":40,"contagion":true,"hostile":true,"courage":1,"night":false},"skeleton":{"atlas":"people_skeleton","humanoid":true,"size":24,"hp":45,"speed":1,"attack":11,"lifespan":30,"hostile":true,"courage":1},"demon":{"atlas":"people_demon","humanoid":true,"size":24,"hp":260,"speed":1.1,"attack":26,"lifespan":200,"hostile":true,"courage":1,"fire":true}},"music":{"instruments":{"lute":{"vol":0.9,"rev":0.25,"layers":[{"t":"pluck","g":0.55,"bright":0.55,"decay":0.994,"a":0.002,"sustained":true,"s":1,"r":0.5}]},"flute":{"vol":0.6,"rev":0.35,"layers":[{"t":"osc","w":"sine","g":0.4,"a":0.06,"d":0.2,"s":0.85,"sustained":true,"r":0.12,"vib":[5.2,0.006,0.25]},{"t":"osc","w":"triangle","ratio":2,"g":0.07,"a":0.08,"s":0.8,"sustained":true,"r":0.1},{"t":"noise","g":0.05,"a":0.02,"d":0.1,"s":0.4,"sustained":true,"r":0.08,"flt":["bandpass",2400,1.5],"fltTrack":false}]},"pad":{"vol":0.45,"rev":0.5,"layers":[{"t":"osc","w":"sawtooth","g":0.12,"a":0.5,"s":1,"sustained":true,"r":0.9,"detune":-7,"flt":["lowpass",900,0.6]},{"t":"osc","w":"sawtooth","g":0.12,"a":0.5,"s":1,"sustained":true,"r":0.9,"detune":8,"flt":["lowpass",900,0.6]},{"t":"osc","w":"sine","ratio":0.5,"g":0.12,"a":0.4,"s":1,"sustained":true,"r":0.8}]},"bass":{"vol":0.8,"layers":[{"t":"osc","w":"triangle","g":0.45,"a":0.01,"d":0.25,"s":0.7,"sustained":true,"r":0.12,"flt":["lowpass",500,0.7]}]},"bell":{"vol":0.5,"rev":0.5,"layers":[{"t":"osc","w":"sine","g":0.3,"a":0.002,"d":1.4,"dur":1.4,"r":0.4,"fm":[3.51,2.2,0.5,0.02]},{"t":"osc","w":"sine","ratio":2.76,"g":0.06,"a":0.002,"d":0.6,"dur":0.6,"r":0.2}]},"drum":{"vol":0.9,"layers":[{"t":"osc","w":"sine","f":[150,55,0.12],"g":0.7,"a":0.002,"d":0.2,"dur":0.2,"r":0.1},{"t":"noise","g":0.12,"a":0.001,"d":0.03,"dur":0.03,"r":0.03,"flt":["lowpass",1800,0.7]}]},"shaker":{"vol":0.35,"layers":[{"t":"noise","g":0.3,"a":0.004,"d":0.05,"dur":0.05,"r":0.04,"flt":["highpass",5000,0.8]}]}},"tracks":{"test":{"bpm":84,"form":["A"],"tracks":[{"inst":"lute","layer":"base","vel":0.6,"parts":{"A":"a2/4 e3/4 a3/4 e3/4 f2/4 c3/4 f3/4 c3/4"}},{"inst":"flute","layer":"melody","vel":0.5,"parts":{"A":"e5/6 d5/2 c5/4 a4/4 -/2 c5/6 a4/4 -/4"}}]}}},"peoples":{"human":{"id":0,"team":"red","atlas":"people_human","devSpeed":1,"strength":1,"fertility":1,"lifespan":70,"maturity":16,"speed":1,"courage":0.5,"hp":100,"likes":["grass","forest","hills"],"hates":["swamp","snow","desert"],"diet":"omni","buildSet":"human","lang":"human","culture":{"war":0.4,"trade":0.6,"land":0.7,"lore":0.5,"faith":0.5,"sea":0.4}},"orc":{"id":1,"team":"jungle","atlas":"people_orc","devSpeed":0.75,"strength":1.5,"fertility":1.2,"lifespan":50,"maturity":12,"speed":1.05,"courage":0.8,"hp":140,"likes":["savanna","hills","swamp","jungle"],"hates":["snow","ice"],"diet":"meat","buildSet":"orc","lang":"orc","culture":{"war":0.9,"trade":0.2,"land":0.4,"lore":0.15,"faith":0.5,"sea":0.2}},"elf":{"id":2,"team":"teal","atlas":"people_elf","provisional":true,"devSpeed":0.8,"strength":0.8,"fertility":0.5,"lifespan":220,"maturity":30,"speed":1.15,"courage":0.45,"hp":80,"likes":["forest","jungle"],"hates":["desert","volcanic"],"diet":"plants","buildSet":"human","lang":"elf","culture":{"war":0.3,"trade":0.4,"land":0.5,"lore":0.9,"faith":0.6,"sea":0.3}},"dwarf":{"id":3,"team":"fire","atlas":"people_dwarf","provisional":true,"devSpeed":0.9,"strength":1.3,"fertility":0.6,"lifespan":140,"maturity":25,"speed":0.85,"courage":0.75,"hp":130,"likes":["hills","tundra","snow"],"hates":["swamp","jungle"],"diet":"omni","buildSet":"human","lang":"dwarf","culture":{"war":0.5,"trade":0.6,"land":0.3,"lore":0.6,"faith":0.4,"sea":0.05}},"myrrin":{"id":4,"team":"magic","atlas":"people_myrrin","provisional":true,"devSpeed":0.9,"strength":0.6,"fertility":1.6,"lifespan":40,"maturity":8,"speed":0.9,"courage":0.25,"hp":60,"likes":["swamp","forest","jungle"],"hates":["desert","volcanic","snow"],"diet":"plants","buildSet":"human","lang":"myrrin","culture":{"war":0.1,"trade":0.5,"land":0.8,"lore":0.5,"faith":0.8,"sea":0.2}},"okari":{"id":5,"team":"royal","atlas":"people_okari","provisional":true,"devSpeed":1.1,"strength":0.7,"fertility":0.8,"lifespan":60,"maturity":14,"speed":1.2,"courage":0.4,"hp":70,"likes":["sand","grass","swamp"],"hates":["tundra","volcanic"],"diet":"fish","buildSet":"human","lang":"okari","culture":{"war":0.3,"trade":0.9,"land":0.3,"lore":0.6,"faith":0.4,"sea":1}}},"resources":{"wood":{"id":0,"icon":"res_wood"},"stone":{"id":1,"icon":"res_stone"},"food":{"id":2,"icon":"res_food"},"copper":{"id":3,"icon":"res_copper","ore":true},"iron":{"id":4,"icon":"res_iron","ore":true},"gold":{"id":5,"icon":"res_gold","ore":true},"aetherite":{"id":6,"icon":"res_aether","ore":true,"rare":true},"tools":{"id":7,"icon":"res_tools"},"weapons":{"id":8,"icon":"res_weapons"},"armor":{"id":9,"icon":"res_armor"}},"sounds":{"ui_click":{"cat":"ui","bus":"ui","expect":{"dur":[0.02,0.2],"centroid":[800,6000]},"pitchVar":0.02,"layers":[{"t":"osc","w":"triangle","f":[1400,900,0.04],"g":0.35,"a":0.002,"d":0.05,"dur":0.05,"r":0.03},{"t":"noise","g":0.08,"a":0.001,"d":0.015,"dur":0.015,"r":0.01,"flt":["highpass",3000,0.7]}]},"chop":{"cat":"work","expect":{"dur":[0.05,0.4],"centroid":[300,5000]},"variants":[[{"t":"noise","g":0.5,"a":0.001,"d":0.05,"dur":0.05,"r":0.04,"flt":["bandpass",1800,1.2]},{"t":"osc","w":"triangle","f":[220,110,0.08],"g":0.5,"a":0.001,"d":0.09,"dur":0.09,"r":0.05}],[{"t":"noise","g":0.5,"a":0.001,"d":0.04,"dur":0.04,"r":0.05,"flt":["bandpass",2300,1.4]},{"t":"osc","w":"triangle","f":[260,120,0.07],"g":0.45,"a":0.001,"d":0.08,"dur":0.08,"r":0.05}]]},"thunder":{"cat":"disaster","pitchVar":0.12,"expect":{"dur":[1,4],"centroid":[40,900]},"layers":[{"t":"noise","nc":"brown","g":0.9,"a":0.01,"d":1.6,"dur":1.8,"r":0.9,"flt":["lowpass",900,0.5,[[1.8,120]]],"rev":0.5},{"t":"noise","g":0.35,"a":0.001,"d":0.12,"dur":0.12,"r":0.1,"flt":["highpass",1500,0.5]},{"t":"osc","w":"sine","f":[70,38,1.5],"g":0.6,"a":0.01,"d":1.2,"dur":1.4,"r":0.6}]}},"stages":[{"name":"nomads","pop":0},{"name":"hamlet","pop":6,"need":["house"]},{"name":"village","pop":16,"need":["farm","warehouse"]},{"name":"town","pop":36,"need":["market","temple"]},{"name":"city","pop":80,"need":["forge","library","barracks"]},{"name":"realm","pop":150,"need":["tavern"]}],"traits":{"strong":{"id":0,"en":"Strong","fr":"Fort","mods":{"attack":1.3,"work":1.1},"opposite":"weak"},"weak":{"id":1,"en":"Weak","fr":"Faible","mods":{"attack":0.75},"opposite":"strong"},"swift":{"id":2,"en":"Swift","fr":"Rapide","mods":{"speed":1.25},"opposite":"slow"},"slow":{"id":3,"en":"Slow","fr":"Lent","mods":{"speed":0.8},"opposite":"swift"},"tough":{"id":4,"en":"Tough","fr":"Robuste","mods":{"hp":1.3},"opposite":"frail"},"frail":{"id":5,"en":"Frail","fr":"Frêle","mods":{"hp":0.75},"opposite":"tough"},"fertile":{"id":6,"en":"Fertile","fr":"Fertile","mods":{"fertility":1.6},"opposite":"barren"},"barren":{"id":7,"en":"Barren","fr":"Stérile","mods":{"fertility":0.1},"opposite":"fertile"},"longlived":{"id":8,"en":"Long-lived","fr":"Longévif","mods":{"lifespan":1.3},"opposite":"sickly"},"sickly":{"id":9,"en":"Sickly","fr":"Maladif","mods":{"lifespan":0.8,"hp":0.9},"opposite":"longlived"},"brave":{"id":10,"en":"Brave","fr":"Brave","mods":{"courage+":0.3},"opposite":"coward"},"coward":{"id":11,"en":"Cowardly","fr":"Lâche","mods":{"courage+":-0.3},"opposite":"brave"},"diligent":{"id":12,"en":"Diligent","fr":"Travailleur","mods":{"work":1.3},"opposite":"lazy"},"lazy":{"id":13,"en":"Lazy","fr":"Paresseux","mods":{"work":0.7},"opposite":"diligent"},"wise":{"id":14,"en":"Wise","fr":"Sage","mods":{"learn":1.5},"opposite":"dull"},"dull":{"id":15,"en":"Dull","fr":"Borné","mods":{"learn":0.6},"opposite":"wise"},"pious":{"id":16,"en":"Pious","fr":"Pieux","mods":{"faith":1.6},"opposite":"skeptic"},"skeptic":{"id":17,"en":"Skeptic","fr":"Sceptique","mods":{"faith":0.4},"opposite":"pious"},"gregarious":{"id":18,"en":"Gregarious","fr":"Sociable","mods":{"social":1.4},"opposite":"loner"},"loner":{"id":19,"en":"Loner","fr":"Solitaire","mods":{"social":0.5},"opposite":"gregarious"},"ambitious":{"id":20,"en":"Ambitious","fr":"Ambitieux","mods":{"ambition+":0.35},"opposite":"content"},"content":{"id":21,"en":"Content","fr":"Satisfait","mods":{"ambition+":-0.25,"mood+":8},"opposite":"ambitious"},"kind":{"id":22,"en":"Kind","fr":"Bienveillant","mods":{"honor+":0.25,"mood+":3},"opposite":"cruel"},"cruel":{"id":23,"en":"Cruel","fr":"Cruel","mods":{"honor+":-0.3,"attack":1.1},"opposite":"kind"},"honest":{"id":24,"en":"Honest","fr":"Honnête","mods":{"honor+":0.3},"opposite":"deceitful"},"deceitful":{"id":25,"en":"Deceitful","fr":"Fourbe","mods":{"honor+":-0.35},"opposite":"honest"},"glutton":{"id":26,"en":"Glutton","fr":"Glouton","mods":{"eat":1.4},"opposite":"frugal"},"frugal":{"id":27,"en":"Frugal","fr":"Frugal","mods":{"eat":0.7},"opposite":"glutton"},"keeneyed":{"id":28,"en":"Keen-eyed","fr":"Œil vif","mods":{"range":1.3,"hunt":1.3}},"greenthumb":{"id":29,"en":"Green thumb","fr":"Main verte","mods":{"farm":1.4}},"stonehand":{"id":30,"en":"Stone hand","fr":"Main de pierre","mods":{"mine":1.4}},"woodwise":{"id":31,"en":"Woodwise","fr":"Ami des bois","mods":{"chop":1.4}},"craftsman":{"id":32,"en":"Craftsman","fr":"Artisan","mods":{"build":1.4,"smith":1.3}},"seafarer":{"id":33,"en":"Seafarer","fr":"Marin","mods":{"fish":1.4,"sail":1.3}},"silver":{"id":34,"en":"Silver tongue","fr":"Beau parleur","mods":{"trade":1.4,"diplo+":0.2}},"leader":{"id":35,"en":"Born leader","fr":"Meneur né","mods":{"morale+":0.2,"renown":1.5}},"tactician":{"id":36,"en":"Tactician","fr":"Tacticien","mods":{"army":1.2}},"healerborn":{"id":37,"en":"Healing hands","fr":"Mains guérisseuses","mods":{"heal":1.6}},"nightowl":{"id":38,"en":"Night owl","fr":"Oiseau de nuit","mods":{"sleep":0.6}},"heavysleeper":{"id":39,"en":"Heavy sleeper","fr":"Gros dormeur","mods":{"sleep":1.4}},"hotblooded":{"id":40,"en":"Hot-blooded","fr":"Sang chaud","mods":{"attack":1.15,"honor+":-0.1,"ambition+":0.1},"opposite":"calm"},"calm":{"id":41,"en":"Calm","fr":"Calme","mods":{"mood+":5},"opposite":"hotblooded"},"lucky":{"id":42,"en":"Lucky","fr":"Chanceux","mods":{"dodge+":0.15},"opposite":"unlucky"},"unlucky":{"id":43,"en":"Unlucky","fr":"Malchanceux","mods":{"dodge+":-0.1},"opposite":"lucky"},"giant":{"id":44,"en":"Giant","fr":"Géant","mods":{"hp":1.4,"attack":1.25,"speed":0.9,"eat":1.3},"opposite":"small"},"small":{"id":45,"en":"Small","fr":"Petit","mods":{"hp":0.85,"dodge+":0.1},"opposite":"giant"},"immune":{"id":46,"en":"Immune","fr":"Immunisé","mods":{"disease":0.1}},"fireproof":{"id":47,"en":"Fire-touched","fr":"Enfant du feu","mods":{"fire":0.3}},"blessed":{"id":48,"en":"Blessed","fr":"Béni","mods":{"hp":1.2,"mood+":10,"fertility":1.2},"opposite":"cursed","acquired":true},"cursed":{"id":49,"en":"Cursed","fr":"Maudit","mods":{"hp":0.8,"mood+":-10,"dodge+":-0.1},"opposite":"blessed","acquired":true},"mad":{"id":50,"en":"Mad","fr":"Fou","mods":{"mood+":-5},"acquired":true},"raging":{"id":51,"en":"Enraged","fr":"Enragé","mods":{"attack":1.5,"courage+":0.5},"acquired":true},"inspired":{"id":52,"en":"Inspired","fr":"Inspiré","mods":{"work":1.3,"learn":1.5},"acquired":true},"prophet":{"id":53,"en":"Prophet","fr":"Prophète","mods":{"faith":2,"renown":2},"acquired":true},"hero":{"id":54,"en":"Hero","fr":"Héros","mods":{"attack":1.6,"hp":1.6,"courage+":0.4,"renown":2},"acquired":true},"veteran":{"id":55,"en":"Veteran","fr":"Vétéran","mods":{"attack":1.25,"hp":1.15},"acquired":true},"scarred":{"id":56,"en":"Scarred","fr":"Balafré","mods":{"hp":0.95,"courage+":0.1},"acquired":true},"plagued":{"id":57,"en":"Plagued","fr":"Pestiféré","mods":{"hp":0.6,"speed":0.8},"acquired":true},"poisoned":{"id":58,"en":"Poisoned","fr":"Empoisonné","mods":{"hp":0.8},"acquired":true},"mutant":{"id":59,"en":"Mutant","fr":"Mutant","mods":{"hp":1.1,"speed":1.1,"fertility":0.7},"acquired":true}}};})(typeof self!=="undefined"?(self.AL=self.AL||{}):(globalThis.AL=globalThis.AL||{}));
// AL core shared by the simulation and the client: constants, seeded RNG, hashing, noise, data lookups.
(function (AL) {
  'use strict';
  AL.TICK_HZ = 10; AL.DAY = 300; AL.YEAR = 1200; AL.TILE = 8; AL.SEA = 100;
  AL.SIZES = { small: 128, medium: 256, large: 384, giant: 512 };
  // xoshiro128** — every random number of the simulation comes from here
  function Rng(seed) { this.s = new Uint32Array(4); this.seed(seed); }
  Rng.prototype.seed = function (seed) { let z = (seed >>> 0) || 0x9e3779b9; for (let i = 0; i < 4; i++) { z = (z + 0x9e3779b9) >>> 0; let t = z; t = Math.imul(t ^ (t >>> 16), 0x85ebca6b); t = Math.imul(t ^ (t >>> 13), 0xc2b2ae35); this.s[i] = (t ^ (t >>> 16)) >>> 0; } };
  Rng.prototype.u32 = function () { const s = this.s, r = Math.imul(((Math.imul(s[1], 5) << 7) | (Math.imul(s[1], 5) >>> 25)), 9) >>> 0, t = s[1] << 9; s[2] ^= s[0]; s[3] ^= s[1]; s[1] ^= s[2]; s[0] ^= s[3]; s[2] ^= t; s[3] = (s[3] << 11) | (s[3] >>> 21); return r; };
  Rng.prototype.f = function () { return this.u32() / 4294967296; };
  Rng.prototype.int = function (n) { return (this.f() * n) | 0; };
  Rng.prototype.range = function (a, b) { return a + this.f() * (b - a); };
  Rng.prototype.chance = function (p) { return this.f() < p; };
  Rng.prototype.pick = function (arr) { return arr[(this.f() * arr.length) | 0]; };
  Rng.prototype.state = function () { return Array.from(this.s); };
  Rng.prototype.restore = function (a) { this.s.set(a); };
  AL.Rng = Rng;
  AL.hash2 = function (x, y, s) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  AL.strHash = function (str) { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; };
  // value noise + fbm (deterministic, seedable)
  const sm = t => t * t * (3 - 2 * t);
  AL.vnoise = function (x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), fx = sm(x - xi), fy = sm(y - yi), h = AL.hash2, a = h(xi, yi, s), b = h(xi + 1, yi, s), c = h(xi, yi + 1, s), d = h(xi + 1, yi + 1, s); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; };
  AL.fbm = function (x, y, s, oct) { let v = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < (oct || 4); i++) { v += AL.vnoise(x * f, y * f, s + i * 17) * a; n += a; a *= 0.5; f *= 2; } return v / n; };
  AL.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  // data lookups built once: ground list by id, flora by id
  AL.initData = function () {
    const D = AL.DATA; if (D._ready) return; D._ready = true;
    AL.G = {}; AL.GROUND = []; for (const k in D.grounds) { const g = D.grounds[k]; g.name = k; AL.G[k] = g.id; AL.GROUND[g.id] = g; }
    AL.F = {}; AL.FLORA = []; for (const k in D.flora) { const f = D.flora[k]; f.name = k; AL.F[k] = f.id; AL.FLORA[f.id] = f; }
    AL.NG = AL.GROUND.length;
    AL.gCost = new Float32Array(AL.NG); AL.gWater = new Uint8Array(AL.NG); AL.gFert = new Float32Array(AL.NG); AL.gFlam = new Float32Array(AL.NG);
    AL.GROUND.forEach((g, i) => { AL.gCost[i] = g.cost; AL.gWater[i] = g.water; AL.gFert[i] = g.fert; AL.gFlam[i] = g.flam; });
    AL.fKind = new Uint8Array(64); AL.FLORA.forEach((f, i) => { if (f) AL.fKind[i] = { tree: 1, bush: 2, decor: 3, rock: 4, crop: 5 }[f.kind]; });
    AL.floraByBiome = AL.GROUND.map(g => ({ trees: AL.FLORA.filter(f => f && f.kind === 'tree' && f.biomes.includes(g.name)).map(f => f.id), small: AL.FLORA.filter(f => f && (f.kind === 'decor' || f.kind === 'bush') && f.biomes.includes(g.name)).map(f => f.id), rocks: AL.FLORA.filter(f => f && f.kind === 'rock' && f.biomes.includes(g.name)).map(f => f.id) }));
  };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));
// ---- kinds (every living species: peoples, animals, monsters), resources, jobs, buildings, traits lookups
(function (AL) {
  'use strict';
  const base = AL.initData;
  AL.initData = function () {
    const D = AL.DATA; if (D._ready) return; base();
    AL.KINDS = []; AL.K = {};
    const add = (name, cls, d) => { d.name = name; d.cls = cls; d.kid = AL.KINDS.length; AL.K[name] = d.kid; AL.KINDS.push(d); };
    for (const k in D.peoples) add(k, 0, D.peoples[k]);
    AL.NPEOPLE = AL.KINDS.length;
    if (D.animals) for (const k in D.animals) add(k, 1, D.animals[k]);
    if (D.monsters) for (const k in D.monsters) add(k, 2, D.monsters[k]);
    AL.RES = {}; AL.RESN = []; for (const k in D.resources) { AL.RES[k] = D.resources[k].id; AL.RESN[D.resources[k].id] = k; } AL.NRES = AL.RESN.length;
    AL.JOB = {}; AL.JOBS = []; for (const k in D.jobs) { const j = D.jobs[k]; j.name = k; AL.JOB[k] = j.id; AL.JOBS[j.id] = j; }
    AL.BT = {}; AL.BTYPES = []; for (const k in D.buildings) { const b = D.buildings[k]; b.name = k; AL.BT[k] = b.id; AL.BTYPES[b.id] = b; }
    AL.TRAIT = {}; AL.TRAITS = []; for (const k in D.traits) { const t = D.traits[k]; t.name = k; AL.TRAIT[k] = t.id; AL.TRAITS[t.id] = t; }
    AL.LOOKS = ['villager', 'lumberjack', 'miner', 'farmer', 'builder', 'hunter', 'fisher', 'herder', 'blacksmith', 'merchant', 'soldier', 'archer', 'knight', 'priest', 'scholar', 'ruler', 'child', 'elder'];
    AL.LOOK = {}; AL.LOOKS.forEach((l, i) => AL.LOOK[l] = i);
    AL.ANIM = { idle: 0, walk: 1, work: 2, attack: 3, hit: 4, pray: 5, joy: 6, death: 7, sleep: 8, run: 9, eat: 10, fly: 11, swim: 12, special: 13, inside: 14 };
    AL.ANIMN = Object.keys(AL.ANIM);
  };
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));

// AL.World — tile map state, procedural generation, brushes and tile systems (flooding, lava, growth).
(function (AL) {
  'use strict';
  const SEA = AL.SEA;
  function World(n) {
    this.n = n; const N = n * n;
    this.ground = new Uint8Array(N); this.height = new Uint8Array(N); this.feature = new Uint8Array(N); this.fgrow = new Uint8Array(N);
    this.fire = new Uint8Array(N); this.owner = new Uint16Array(N); this.road = new Uint8Array(N); this.flags = new Uint8Array(N); // flags: 1 river, 2 building, 4 scorched, 8 farmland
    this.region = new Uint16Array(N); this.temp = new Uint8Array(N); this.moist = new Uint8Array(N);
    this.dirty = { x0: n, y0: n, x1: -1, y1: -1 }; this.regionsDirty = true; this.slice = 0;
  }
  World.LAYERS = ['ground', 'height', 'feature', 'fgrow', 'fire', 'owner', 'road', 'flags', 'temp', 'moist'];
  const P = World.prototype;
  P.mark = function (x, y) { const d = this.dirty; if (x < d.x0) d.x0 = x; if (y < d.y0) d.y0 = y; if (x > d.x1) d.x1 = x; if (y > d.y1) d.y1 = y; };
  P.markAll = function () { this.dirty = { x0: 0, y0: 0, x1: this.n - 1, y1: this.n - 1 }; };
  P.inb = function (x, y) { return x >= 0 && y >= 0 && x < this.n && y < this.n; };
  P.walk = function (i) { return AL.gCost[this.ground[i]] > 0; };
  // the natural land ground for a tile from its climate and height (used by generation, raising land, regrowth)
  P.natural = function (i) {
    const G = AL.G, h = this.height[i], t = this.temp[i] / 255, m = this.moist[i] / 255;
    if (h < SEA - 14) return G.deep; if (h < SEA) return t < 0.1 ? G.ice : G.shallow;
    if (h >= 205) return t < 0.62 ? G.snow : G.mountain; if (h >= 178) return G.mountain;
    if (t < 0.13) return G.snow; if (t < 0.26) return m > 0.55 && h < 150 ? G.snow : G.tundra;
    if (h >= 158) return G.hills;
    if (h < SEA + 4 && t > 0.2) return m > 0.8 && t < 0.75 ? G.swamp : G.sand;
    if (t > 0.66) return m < 0.3 ? G.desert : m < 0.5 ? G.savanna : G.jungle;
    if (t > 0.56 && m < 0.3) return G.savanna;
    if (m > 0.8 && h < SEA + 14) return G.swamp; if (m > 0.56) return G.forest; return G.grass;
  };
  // ------------------------------------------------------------------ generation
  World.generate = function (cfg) {
    const n = AL.SIZES[cfg.size] || cfg.size || 256, W = new World(n), N = n * n, seed = (cfg.seed >>> 0) || 1, rng = new AL.Rng(seed), G = AL.G;
    W.cfg = { size: n, seed, water: cfg.water == null ? 0.5 : cfg.water, continents: cfg.continents || 3, climate: cfg.climate || 'temperate', empty: !!cfg.empty };
    const waterShare = AL.clamp(W.cfg.water, 0.05, 0.9), sc = 256 / n;
    if (cfg.empty) { for (let i = 0; i < N; i++) { W.height[i] = SEA - 30; W.ground[i] = G.deep; W.temp[i] = 140; W.moist[i] = 128; } W.markAll(); return W; }
    // 1. continents: blobs around k centres, domain-warped noise
    const k = W.cfg.continents, cs = []; for (let i = 0; i < k; i++) { let bx = 0, by = 0, bd = -1; for (let t = 0; t < 12; t++) { const x = rng.range(0.16, 0.84), y = rng.range(0.16, 0.84); let d = 9; for (const c of cs) d = Math.min(d, Math.hypot(c[0] - x, c[1] - y)); if (d > bd) { bd = d; bx = x; by = y; } } cs.push([bx, by, rng.range(0.75, 1.2) * (0.62 / Math.sqrt(k))]); }
    const e = new Float32Array(N);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const u = x / n, v = y / n, wx = u + (AL.fbm(u * 3.1, v * 3.1, seed + 5, 3) - 0.5) * 0.28, wy = v + (AL.fbm(u * 3.1 + 9, v * 3.1 + 4, seed + 6, 3) - 0.5) * 0.28;
      let c = 0; for (const p of cs) { const d = Math.hypot(wx - p[0], wy - p[1]) / p[2]; c = Math.max(c, 1 - d * d); }
      const edge = Math.min(u, v, 1 - u, 1 - v), nz = AL.fbm(u * 6, v * 6, seed + 1, 5), ridge = 1 - Math.abs(AL.fbm(u * 4.5, v * 4.5, seed + 2, 4) - 0.5) * 2;
      e[y * n + x] = Math.max(c, -0.6) * 0.55 + nz * 0.5 + Math.pow(ridge, 3) * 0.22 * Math.max(0, c + 0.2) - (edge < 0.06 ? (0.06 - edge) * 9 : 0); }
    // 2. sea level by quantile -> exact water share; heights 0..255 with SEA at the shoreline
    const sorted = Float32Array.from(e).sort(), sea = sorted[Math.min(N - 1, Math.floor(N * waterShare))], lo = sorted[0], hi = sorted[N - 1];
    for (let i = 0; i < N; i++) { const v = e[i]; W.height[i] = v < sea ? Math.max(0, Math.round(SEA - 1 - (sea - v) / (sea - lo + 1e-6) * 99)) : Math.min(255, Math.round(SEA + Math.pow((v - sea) / (hi - sea + 1e-6), 1.35) * 155)); }
    // 3. distance to water (BFS) for moisture and beaches
    const dist = new Uint8Array(N).fill(255), q = new Int32Array(N); let qh = 0, qt = 0;
    for (let i = 0; i < N; i++) if (W.height[i] < SEA) { dist[i] = 0; q[qt++] = i; }
    while (qh < qt) { const i = q[qh++], x = i % n, y = (i / n) | 0, d = dist[i] + 1; if (d > 60) continue;
      if (x > 0 && dist[i - 1] > d) { dist[i - 1] = d; q[qt++] = i - 1; } if (x < n - 1 && dist[i + 1] > d) { dist[i + 1] = d; q[qt++] = i + 1; } if (y > 0 && dist[i - n] > d) { dist[i - n] = d; q[qt++] = i - n; } if (y < n - 1 && dist[i + n] > d) { dist[i + n] = d; q[qt++] = i + n; } }
    // 4. climate
    const cl = W.cfg.climate, tBase = cl === 'cold' ? -0.22 : cl === 'hot' ? 0.24 : 0, flat = cl === 'mixed';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const i = y * n + x, u = x / n, v = y / n, lat = 1 - Math.abs(v - 0.5) * 2;
      let t = (flat ? (AL.fbm(u * 2.2, v * 2.2, seed + 40, 3) - 0.5) * 2.4 + 0.5 : 0.16 + lat * 0.62) + tBase + (AL.fbm(u * 3.2, v * 3.2, seed + 41, 4) - 0.5) * 0.95 - Math.max(0, W.height[i] - SEA - 40) / 255 * 0.6;
      let m = (AL.fbm(u * 3.6 + 7, v * 3.6 + 3, seed + 42, 4) - 0.5) * 2.1 + 0.5 + Math.max(0, 0.16 - dist[i] * 0.01 * sc);
      W.temp[i] = AL.clamp(t, 0, 1) * 255; W.moist[i] = AL.clamp(m, 0, 1) * 255; }
    // 5. rivers: steepest descent from high sources, carving a bed
    const nr = Math.round(n / 14 * (1 - waterShare) * 2);
    for (let r = 0, tries = 0; r < nr && tries < nr * 30; tries++) { let x = rng.int(n), y = rng.int(n), i = y * n + x; if (W.height[i] < 165 || W.height[i] > 225 || W.temp[i] < 50) continue; r++;
      let h = W.height[i], len = 0; const path = [];
      while (len++ < n * 2) { path.push(i); if (W.height[i] < SEA || (W.flags[i] & 1)) break; let bi = -1, bh = 1e9;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 1 || Y < 1 || X >= n - 1 || Y >= n - 1) continue; const j = Y * n + X; if (path.includes(j, Math.max(0, path.length - 40))) continue; const hh = W.height[j] + AL.hash2(X, Y, seed + r) * 5; if (hh < bh) { bh = hh; bi = j; } }
        if (bi < 0) break; i = bi; x = i % n; y = (i / n) | 0; h = Math.min(h, W.height[i]); W.height[i] = Math.max(SEA - 2, Math.min(W.height[i], h)); }
      if (path.length > 12 && W.height[i] < SEA + 0 || (W.flags[i] & 1)) for (let p = 0; p < path.length; p++) { const j = path[p]; W.flags[j] |= 1; if (p > path.length * 0.25 && (j % n) < n - 1) W.flags[j + 1] |= 1; if (p > path.length * 0.6 && j + n < N) { W.flags[j + n] |= 1; if ((j % n) < n - 1) W.flags[j + n + 1] |= 1; } } }
    // 6. grounds
    for (let i = 0; i < N; i++) { let g = W.natural(i); if ((W.flags[i] & 1) && W.height[i] >= SEA) { g = W.temp[i] < 26 ? G.ice : G.shallow; W.height[i] = Math.min(W.height[i], 250); } else W.flags[i] &= ~1;
      if (g === G.sand && dist[i] > 2) g = W.natural2(i); W.ground[i] = g; }
    // beaches along warm coasts
    for (let i = 0; i < N; i++) { const g = W.ground[i]; if (dist[i] === 1 && W.temp[i] > 70 && W.height[i] < 140 && (g === G.grass || g === G.forest || g === G.savanna || g === G.jungle || g === G.desert) && AL.fbm((i % n) * 0.09, ((i / n) | 0) * 0.09, seed + 50, 2) > 0.38) W.ground[i] = G.sand; }
    // 7. smoothing: a tile surrounded by >= 6 tiles of another single land ground adopts it (removes speckles, softens borders)
    const cnt = new Uint8Array(AL.NG);
    for (let pass = 0; pass < 2; pass++) for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) { const i = y * n + x, g = W.ground[i]; if (W.flags[i] & 1) continue; cnt.fill(0); let best = g, bc = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const o = W.ground[i + dy * n + dx]; if (++cnt[o] > bc) { bc = cnt[o]; best = o; } }
      if (best !== g && bc >= 6 && (AL.gWater[best] > 0) === (AL.gWater[g] > 0)) W.ground[i] = best; }
    // 8. volcanoes
    const nv = Math.max(1, Math.round(n / 160)); for (let v = 0, tries = 0; v < nv && tries < 4000; tries++) { const x = rng.int(n - 20) + 10, y = rng.int(n - 20) + 10, i = y * n + x; if (W.ground[i] !== G.mountain && W.ground[i] !== G.hills) continue; v++; const R = 4 + rng.int(4);
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const d = Math.hypot(dx, dy) + (AL.hash2(x + dx, y + dy, seed) - 0.5) * 1.6; if (d > R) continue; const j = (y + dy) * n + x + dx; if (AL.gWater[W.ground[j]]) continue; W.ground[j] = d < 1.6 ? G.lava : G.volcanic; W.height[j] = Math.max(W.height[j], 200 - d * 6) | 0; } }
    // 9. flora
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const i = y * n + x, g = W.ground[i], fb = AL.floraByBiome[g]; if (!AL.gCost[g] && g !== G.mountain) continue;
      const dens = AL.fbm(x * 0.11, y * 0.11, seed + 60, 3), r = AL.hash2(x, y, seed + 61);
      const treeP = g === G.forest ? 0.55 : g === G.jungle ? 0.6 : g === G.swamp ? 0.22 : g === G.grass ? (dens > 0.62 ? 0.3 : 0.025) : g === G.hills ? 0.1 : g === G.snow ? 0.08 : g === G.tundra ? 0.05 : g === G.savanna ? 0.022 : g === G.desert ? 0.012 : g === G.sand ? 0.02 : g === G.volcanic ? 0.03 : 0;
      if (fb.trees.length && r < treeP * (0.5 + dens)) { W.feature[i] = fb.trees[(AL.hash2(x >> 3, y >> 3, seed + 62) * fb.trees.length * 0.999 + (AL.hash2(x, y, seed + 63) < 0.2 ? 1 : 0)) % fb.trees.length | 0]; W.fgrow[i] = 120 + AL.hash2(x, y, seed + 64) * 135; }
      else if (fb.rocks.length && r > 0.975 - (g === G.hills ? 0.03 : 0)) { W.feature[i] = fb.rocks[(AL.hash2(x, y, seed + 65) * fb.rocks.length) | 0]; W.fgrow[i] = 255; }
      else if (fb.small.length && r > 0.72 && r < 0.72 + (g === G.grass ? 0.14 : 0.08)) { W.feature[i] = fb.small[(AL.hash2(x, y, seed + 66) * fb.small.length) | 0]; W.fgrow[i] = 255; }
      else if ((g === G.mountain || (g === G.snow && W.height[i] >= 200)) && AL.hash2(x >> 1, y >> 1, seed + 69) < 0.4 && ((x + (y >> 1)) & 1) === 0 && (y & 1) === 0) { W.feature[i] = g === G.snow || W.height[i] > 215 ? AL.F.snowpeak : AL.F.peak; W.fgrow[i] = 255; }
      else if (g === G.mountain && r > 0.975) { W.feature[i] = AL.hash2(x, y, seed + 67) < 0.5 ? AL.F.rock : [AL.F.ore_copper, AL.F.ore_iron, AL.F.ore_iron, AL.F.ore_gold][(AL.hash2(x, y, seed + 68) * 4) | 0]; W.fgrow[i] = 255; } }
    W.markAll(); return W;
  };
  // natural ground ignoring the beach rule
  P.natural2 = function (i) { const G = AL.G, t = this.temp[i] / 255, m = this.moist[i] / 255; if (t > 0.66) return m < 0.3 ? G.desert : m < 0.5 ? G.savanna : G.jungle; if (t > 0.56 && m < 0.3) return G.savanna; return m > 0.56 ? G.forest : G.grass; };
  // ------------------------------------------------------------------ regions (connected walkable components)
  P.computeRegions = function () {
    const n = this.n, N = n * n, reg = this.region, q = this._q || (this._q = new Int32Array(N)); reg.fill(0); let id = 0; this.regionSize = [0];
    for (let s = 0; s < N; s++) { if (reg[s] || !this.walk(s)) continue; id++; let qh = 0, qt = 0, c = 0; q[qt++] = s; reg[s] = id;
      while (qh < qt) { const i = q[qh++], x = i % n; c++; if (x > 0 && !reg[i - 1] && this.walk(i - 1)) { reg[i - 1] = id; q[qt++] = i - 1; } if (x < n - 1 && !reg[i + 1] && this.walk(i + 1)) { reg[i + 1] = id; q[qt++] = i + 1; } if (i >= n && !reg[i - n] && this.walk(i - n)) { reg[i - n] = id; q[qt++] = i - n; } if (i < N - n && !reg[i + n] && this.walk(i + n)) { reg[i + n] = id; q[qt++] = i + n; } }
      this.regionSize.push(c); if (id >= 65534) break; }
    this.regionsDirty = false; this.regionVersion = (this.regionVersion || 0) + 1;
  };
  // ------------------------------------------------------------------ brushes
  // op: {tool, x, y, x0, y0, size, shape:'round'|'square', ground, strength}. Applies along the segment (x0,y0)-(x,y).
  P.brush = function (op, sim) {
    const n = this.n, r = Math.max(0, (op.size || 1) - 1) / 2, x0 = op.x0 == null ? op.x : op.x0, y0 = op.y0 == null ? op.y : op.y0, steps = Math.max(1, Math.ceil(Math.hypot(op.x - x0, op.y - y0)));
    const seen = this._seen || (this._seen = new Uint32Array(n * n)); const stamp = this._stamp = (this._stamp || 0) + 1; let changed = 0;
    for (let s = 0; s <= steps; s++) { const cx = x0 + (op.x - x0) * s / steps, cy = y0 + (op.y - y0) * s / steps;
      for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) { if (!this.inb(x, y)) continue; const dx = x - cx, dy = y - cy;
        if (op.shape === 'square' ? Math.max(Math.abs(dx), Math.abs(dy)) > r + 0.5 : dx * dx + dy * dy > (r + 0.5) * (r + 0.5)) continue; const i = y * n + x; if (seen[i] === stamp) continue; seen[i] = stamp;
        this.apply(op, i, x, y, sim); changed++; } }
    return changed;
  };
  P.setGround = function (i, g) { if (this.ground[i] === g) return; const was = AL.gCost[this.ground[i]] > 0, now = AL.gCost[g] > 0; this.ground[i] = g; if (was !== now) this.regionsDirty = true; this.mark(i % this.n, (i / this.n) | 0);
    const f = this.feature[i]; if (f && (AL.gWater[g] || g === AL.G.lava)) { this.feature[i] = 0; } if (AL.gWater[g] || g === AL.G.lava) { this.road[i] = 0; this.flags[i] &= ~8; } };
  P.apply = function (op, i, x, y, sim) {
    const G = AL.G, t = op.tool;
    if (t === 'raise' || t === 'lower' || t === 'dig') { const d = (op.strength || 10) * (t === 'raise' ? 1 : t === 'dig' ? -2.5 : -1), h = AL.clamp(this.height[i] + d, 0, 255) | 0; this.height[i] = h; if (t !== 'raise') this.flags[i] &= ~1; this.setGround(i, this.natural(i)); this.mark(x, y); }
    else if (t === 'ground') { const g = op.ground; this.setGround(i, g); const gw = AL.gWater[g];
      // keep heights coherent with the painted ground so that later raise/lower behave
      if (gw === 2) this.height[i] = Math.min(this.height[i], SEA - 20); else if (gw === 1) this.height[i] = AL.clamp(this.height[i], SEA - 10, SEA - 1); else if (this.height[i] < SEA) this.height[i] = SEA + 6;
      if (g === G.mountain) this.height[i] = Math.max(this.height[i], 185); else if (g === G.hills) this.height[i] = AL.clamp(this.height[i], 160, 176); else if (!gw && g !== G.snow && g !== G.volcanic && g !== G.lava && this.height[i] > 157) this.height[i] = 150; this.flags[i] &= ~1; }
    else if (t === 'river') { this.setGround(i, G.shallow); this.flags[i] |= 1; this.height[i] = Math.max(this.height[i], SEA); }
    else if (t === 'grass') { if (!AL.gWater[this.ground[i]] && this.ground[i] !== G.lava) { this.setGround(i, G.grass); if (this.height[i] > 157) this.height[i] = 150; if (!this.feature[i] && AL.hash2(x, y, this._stamp) < 0.15) { this.feature[i] = AL.F.grasstuft; this.fgrow[i] = 255; } } }
    else if (t === 'forest') { const g = this.ground[i], fb = AL.floraByBiome[g]; if (fb.trees.length && !(this.flags[i] & 2) && AL.hash2(x, y, this._stamp) < 0.6) { this.feature[i] = fb.trees[(AL.hash2(x, y, this._stamp + 1) * fb.trees.length) | 0]; this.fgrow[i] = 40 + AL.hash2(x, y, 9) * 200; this.mark(x, y); } }
    else if (t === 'lava') { this.setGround(i, G.lava); this.height[i] = Math.max(this.height[i], SEA + 4); }
    else if (t === 'erase') { if (this.feature[i]) { this.feature[i] = 0; this.mark(x, y); } this.fire[i] = 0; }
    else if (t === 'feature') { if (!AL.gWater[this.ground[i]]) { this.feature[i] = op.feature; this.fgrow[i] = 255; this.mark(x, y); } }
    if (sim && sim.onTileChanged) sim.onTileChanged(i, x, y, op);
  };
  // ------------------------------------------------------------------ tile systems, processed in slices of 1/32 of the map per tick
  P.tick = function (sim) {
    const n = this.n, G = AL.G, rows = Math.max(1, n >> 5), y0 = this.slice; this.slice = (this.slice + rows) % n; const rng = sim.rng;
    for (let y = y0; y < y0 + rows && y < n; y++) for (let x = 0; x < n; x++) { const i = y * n + x, g = this.ground[i];
      // flooding: land below sea level next to water becomes water (dug canals, lowered coasts)
      if (!AL.gWater[g] && this.height[i] < SEA && g !== G.lava) { if ((x > 0 && AL.gWater[this.ground[i - 1]]) || (x < n - 1 && AL.gWater[this.ground[i + 1]]) || (y > 0 && AL.gWater[this.ground[i - n]]) || (y < n - 1 && AL.gWater[this.ground[i + n]])) { this.setGround(i, this.height[i] < SEA - 14 ? G.deep : G.shallow); if (sim.onFlood) sim.onFlood(i, x, y); } }
      else if (g === G.lava) { // lava: ignites neighbours, creeps downhill a little, cools at the rim
        if (rng.chance(0.25)) { const d = rng.int(4), j = i + (d === 0 ? 1 : d === 1 ? -1 : d === 2 ? n : -n); if (j >= 0 && j < n * n) { const og = this.ground[j]; if (AL.gWater[og]) { if (rng.chance(0.5)) this.setGround(i, G.volcanic); } else if (og !== G.lava) { if (this.feature[j] && sim.ignite) sim.ignite(j); if (this.height[j] < this.height[i] - 3 && rng.chance(0.3)) { this.setGround(j, G.lava); if (sim.onLava) sim.onLava(j); } else if (rng.chance(0.012) && this.height[i] < 190) this.setGround(i, G.volcanic); } } } }
      if (sim.tileSystems) sim.tileSystems(i, x, y, g);
    }
  };
  AL.World = World;
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));

// AL.Sim — the simulation: owns the world, runs fixed ticks, executes commands, produces snapshots.
(function (AL) {
  'use strict';
  function Sim(cfg) {
    AL.initData();
    this.cfg = cfg; this.rng = new AL.Rng((cfg.seed >>> 0) ^ 0x5bd1e995); this.tick = 0; this.speed = 1; this.acc = 0; this.events = []; this.effSpeed = 1;
    this.world = AL.World.generate(cfg); this.world.computeRegions();
    for (const m of Sim.modules) if (m.init) m.init(this);
    this.tileMods = Sim.modules.filter(m => m.tile);
  }
  Sim.modules = []; // later steps register systems here: {init, tick, save, load, command, query}
  const P = Sim.prototype;
  // per-tile systems (crops, flora, fire…) called by the world sweep: every tile once per 32 ticks
  P.tileSystems = function (i, x, y, g) { const tm = this.tileMods; for (let k = 0; k < tm.length; k++) tm[k].tile(this, i, x, y, g); };
  P.step = function () {
    this.tick++; const w = this.world;
    w.tick(this);
    for (const m of Sim.modules) if (m.tick) m.tick(this);
    if (w.regionsDirty && this.tick % 10 === 0) w.computeRegions();
  };
  // advance by real seconds; returns ticks run. Budget keeps the worker responsive at x50.
  P.advance = function (dt, budgetMs) {
    if (this.speed <= 0) return 0; this.acc += dt * AL.TICK_HZ * this.speed; if (this.acc > AL.TICK_HZ * this.speed * 0.5) this.acc = AL.TICK_HZ * this.speed * 0.5;
    const t0 = Sim.now(); let nrun = 0; while (this.acc >= 1) { this.step(); this.acc -= 1; nrun++; if (Sim.now() - t0 > (budgetMs || 10)) { this.acc = Math.min(this.acc, 1); break; } }
    return nrun;
  };
  Sim.now = (typeof performance !== 'undefined' && performance.now) ? () => performance.now() : () => 0;
  P.emit = function (type, a, b, c, d) { this.events.push([type, a, b, c, d]); };
  P.command = function (m) {
    if (m.t === 'speed') this.speed = m.v;
    else if (m.t === 'brush') { this.world.brush(m.op, this); }
    else for (const mod of Sim.modules) if (mod.command && mod.command(this, m)) break;
  };
  P.query = function (m) { for (const mod of Sim.modules) if (mod.query) { const r = mod.query(this, m); if (r !== undefined) return r; } return null; };
  // tile data for the client: full layers or the dirty rectangle
  const TL = ['ground', 'height', 'feature', 'fgrow', 'fire', 'flags', 'owner', 'road'];
  P.takeTiles = function (full) {
    const w = this.world, d = w.dirty, n = w.n; if (!full && d.x1 < 0) return null;
    const x0 = full ? 0 : d.x0, y0 = full ? 0 : d.y0, x1 = full ? n - 1 : d.x1, y1 = full ? n - 1 : d.y1, rw = x1 - x0 + 1, rh = y1 - y0 + 1, out = { t: 'tiles', n, x: x0, y: y0, w: rw, h: rh, L: {} }, tr = [];
    for (const k of TL) { const src = w[k], a = new src.constructor(rw * rh); for (let y = 0; y < rh; y++) a.set(src.subarray((y0 + y) * n + x0, (y0 + y) * n + x0 + rw), y * rw); out.L[k] = a; tr.push(a.buffer); }
    w.dirty = { x0: n, y0: n, x1: -1, y1: -1 }; out._tr = tr; return out;
  };
  // low-resolution colour preview of a world config (for the creation screen): returns ground ids at 1/k scale
  Sim.preview = function (cfg, res) { AL.initData(); const w = AL.World.generate(cfg), n = w.n, k = Math.max(1, Math.floor(n / (res || 128))), m = Math.floor(n / k), g = new Uint8Array(m * m), f = new Uint8Array(m * m);
    for (let y = 0; y < m; y++) for (let x = 0; x < m; x++) { g[y * m + x] = w.ground[(y * k) * n + x * k]; f[y * m + x] = AL.fKind[w.feature[(y * k) * n + x * k]] === 1 ? w.feature[(y * k) * n + x * k] : 0; } return { t: 'preview', m, g, f }; };
  AL.Sim = Sim;

  // ---- host: message protocol (worker, or main-thread fallback through the same functions)
  AL.SimHost = function (post) {
    let sim = null, last = Sim.now(), lastSnap = 0, lastOwner = 0, timer = null;
    function send(msg) { const tr = msg._tr; delete msg._tr; post(msg, tr || []); }
    function loop() { const now = Sim.now(), dt = Math.min(0.25, (now - last) / 1000); last = now; if (!sim) return;
      const ran = sim.advance(dt, 12); sim.effSpeed = sim.effSpeed * 0.9 + (dt > 0 ? ran / (dt * AL.TICK_HZ) : 0) * 0.1;
      if (sim.ownerDirty && now - lastOwner >= 500) { lastOwner = now; sim.ownerDirty = false; const o = sim.world.owner.slice(); send({ t: 'owner', n: sim.world.n, owner: o, towns: sim.towns ? sim.towns.map(t => t.alive ? [t.kingdom, t.people, t.cx, t.cy] : null) : [], _tr: [o.buffer] }); }
      if (now - lastSnap >= 33) { lastSnap = now; const tl = sim.takeTiles(false); if (tl) send(tl); for (const m of Sim.modules) if (m.snapshot) { const s = m.snapshot(sim); if (s) send(s); }
        send({ t: 'hud', tick: sim.tick, speed: sim.speed, eff: sim.effSpeed, hud: sim.hud ? sim.hud() : null, ev: sim.events.splice(0) }); } }
    return { message(m) {
      if (m.t === 'new') { sim = new Sim(m.cfg); last = Sim.now(); send({ t: 'ready', n: sim.world.n, cfg: sim.world.cfg }); send(sim.takeTiles(true)); if (!timer) timer = setInterval(loop, 8); }
      else if (m.t === 'preview') send(Object.assign(Sim.preview(m.cfg, m.res), { id: m.id }));
      else if (m.t === 'query') send({ t: 'reply', id: m.id, r: sim ? sim.query(m) : null });
      else if (m.t === 'save') { const buf = AL.Save.write(sim); send({ t: 'saved', id: m.id, buf, _tr: [buf] }); }
      else if (m.t === 'load') { sim = AL.Save.read(m.buf); last = Sim.now(); send({ t: 'ready', n: sim.world.n, cfg: sim.world.cfg, loaded: true }); send(sim.takeTiles(true)); if (!timer) timer = setInterval(loop, 8); }
      else if (sim) sim.command(m); }, get sim() { return sim; } };
  };
  if (typeof self !== 'undefined' && typeof self.document === 'undefined' && typeof self.postMessage === 'function' && typeof importScripts === 'function') {
    const host = AL.SimHost((m, tr) => self.postMessage(m, tr)); self.onmessage = e => host.message(e.data);
  }
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));

// AL.Ents — entity store (struct of arrays, fixed capacity), spatial hash, trait modifiers.
(function (AL) {
  'use strict';
  const CAP = 8192, PATH = 40;
  function Ents() {
    const f32 = () => new Float32Array(CAP), i32 = () => new Int32Array(CAP).fill(-1), u8 = () => new Uint8Array(CAP), i16 = () => new Int16Array(CAP).fill(-1), u16 = () => new Uint16Array(CAP), u32 = () => new Uint32Array(CAP);
    this.cap = CAP; this.hi = 0; this.count = 0; this.free = []; 
    this.alive = u8(); this.gen = u16(); this.kind = u8(); this.x = f32(); this.y = f32(); this.hp = f32(); this.hpMax = f32();
    this.hunger = f32(); this.energy = f32(); this.social = f32(); this.faith = f32(); this.mood = f32();
    this.born = i32(); this.life = i32(); this.sex = u8(); this.act = u8(); this.phase = u8(); this.timer = i32(); this.tx = i16(); this.ty = i16(); this.tE = i32(); this.tB = i32();
    this.job = u8(); this.town = i16(); this.kingdom = i16(); this.home = i32(); this.work = i32(); this.traits0 = u32(); this.traits1 = u32();
    this.mother = i32(); this.father = i32(); this.spouse = i32(); this.religion = i16(); this.culture = i16(); this.carry = u8(); this.carryN = u8();
    this.anim = u8(); this.dir = u8(); this.flags = u16(); this.look = u8(); this.army = i16(); this.kills = u16(); this.seed = u32(); this.cool = u16(); this.stuck = u8(); this.preg = i32();
    // stats derived from kind + traits
    this.spd = f32(); this.atk = f32(); this.workMul = f32(); this.courage = f32();
    // paths
    this.pathLen = u8(); this.pathPos = u8(); this.path = new Int32Array(CAP * PATH); this.flow = i32(); this.PATH = PATH;
    // spatial hash (cells of 8x8 tiles), rebuilt every tick
    this.cellOf = new Int32Array(CAP); this.cellStart = null; this.cellItems = new Int32Array(CAP); this.near = new Int32Array(512);
  }
  // flags bits
  Ents.F = { DEAD: 1, CHILD: 2, ELDER: 4, SICK: 8, INFECTED: 16, BURNING: 32, CONTROLLED: 64, SETTLER: 128, FLEEING: 256, PREGNANT: 512, RULER: 1024, NOTABLE: 2048, MOBILIZED: 4096, SWIMMING: 8192, FLYING: 16384, ASLEEP: 32768 };
  const P = Ents.prototype;
  P.spawn = function (sim, kind, x, y, opt) {
    const E = this, i = E.free.length ? E.free.pop() : (E.hi < CAP ? E.hi++ : -1); if (i < 0) return -1; opt = opt || {}; const K = AL.KINDS[kind], rng = sim.rng;
    E.alive[i] = 1; E.gen[i]++; E.kind[i] = kind; E.x[i] = x; E.y[i] = y; E.seed[i] = rng.u32();
    E.hunger[i] = 20 + rng.f() * 20; E.energy[i] = 70 + rng.f() * 30; E.social[i] = 60; E.faith[i] = 50; E.mood[i] = 60;
    E.sex[i] = rng.int(2); E.act[i] = 0; E.phase[i] = 0; E.timer[i] = 0; E.tx[i] = -1; E.ty[i] = -1; E.tE[i] = -1; E.tB[i] = -1;
    E.job[i] = 0; E.town[i] = opt.town == null ? -1 : opt.town; E.kingdom[i] = opt.kingdom == null ? -1 : opt.kingdom; E.home[i] = -1; E.work[i] = -1; E.traits0[i] = 0; E.traits1[i] = 0;
    E.mother[i] = opt.mother == null ? -1 : opt.mother; E.father[i] = opt.father == null ? -1 : opt.father; E.spouse[i] = -1; E.religion[i] = opt.religion == null ? -1 : opt.religion; E.culture[i] = opt.culture == null ? -1 : opt.culture;
    E.carry[i] = 0; E.carryN[i] = 0; E.anim[i] = 0; E.dir[i] = 0; E.flags[i] = 0; E.look[i] = 0; E.army[i] = -1; E.kills[i] = 0; E.cool[i] = 0; E.stuck[i] = 0; E.preg[i] = -1; E.pathLen[i] = 0; E.pathPos[i] = 0; E.flow[i] = -1;
    const years = K.lifespan || 20, life = years * AL.YEAR * (0.85 + rng.f() * 0.3); E.life[i] = life | 0;
    const ageFrac = opt.age == null ? (K.cls === 0 ? 0.25 + rng.f() * 0.3 : 0.2 + rng.f() * 0.5) : opt.age; E.born[i] = (sim.tick - ageFrac * life) | 0;
    if (opt.traits) { E.traits0[i] = opt.traits[0]; E.traits1[i] = opt.traits[1]; } else if (K.cls === 0) { const n = 1 + rng.int(3); for (let k = 0; k < n; k++) E.addTrait(i, rng.int(48), true); }
    E.recalc(i); E.hp[i] = E.hpMax[i]; E.count++; return i;
  };
  P.kill = function (sim, i, cause) { const E = this; if (!E.alive[i] || (E.flags[i] & 1)) return; E.flags[i] |= 1; E.anim[i] = AL.ANIM.death; E.act[i] = 255; E.timer[i] = 90; E.pathLen[i] = 0; E.flow[i] = -1; for (const m of AL.Sim.modules) if (m.onDeath) m.onDeath(sim, i, cause); };
  P.remove = function (i) { const E = this; if (!E.alive[i]) return; E.alive[i] = 0; E.count--; E.free.push(i); };
  P.hasTrait = function (i, t) { return t < 32 ? (this.traits0[i] >>> t) & 1 : (this.traits1[i] >>> (t - 32)) & 1; };
  P.addTrait = function (i, t, soft) { const T = AL.TRAITS[t]; if (!T) return; if (T.opposite) { const o = AL.TRAIT[T.opposite]; if (this.hasTrait(i, o)) { if (soft) return; this.delTrait(i, o); } } if (t < 32) this.traits0[i] |= (1 << t) >>> 0; else this.traits1[i] |= (1 << (t - 32)) >>> 0; if (!soft) this.recalc(i); };
  P.delTrait = function (i, t) { if (t < 32) this.traits0[i] &= ~(1 << t); else this.traits1[i] &= ~(1 << (t - 32)); };
  // product of a multiplicative modifier over the unit's traits
  P.mod = function (i, key) { let v = 1; const a = this.traits0[i], b = this.traits1[i]; if (!a && !b) return 1; for (let t = 0; t < 60; t++) { if (!(t < 32 ? (a >>> t) & 1 : (b >>> (t - 32)) & 1)) continue; const m = AL.TRAITS[t].mods[key]; if (m != null) v *= m; } return v; };
  P.modAdd = function (i, key) { let v = 0; const a = this.traits0[i], b = this.traits1[i]; for (let t = 0; t < 60; t++) { if (!(t < 32 ? (a >>> t) & 1 : (b >>> (t - 32)) & 1)) continue; const m = AL.TRAITS[t].mods[key]; if (m != null) v += m; } return v; };
  P.recalc = function (i) { const K = AL.KINDS[this.kind[i]], E = this; const old = E.hpMax[i]; E.hpMax[i] = (K.hp || 50) * E.mod(i, 'hp'); if (old > 0) E.hp[i] = Math.min(E.hpMax[i], E.hp[i] * E.hpMax[i] / old);
    E.spd[i] = 0.22 * (K.speed || 1) * E.mod(i, 'speed'); E.atk[i] = (K.attack || 8 * (K.strength || 1)) * E.mod(i, 'attack'); E.workMul[i] = E.mod(i, 'work'); E.courage[i] = (K.courage == null ? 0.5 : K.courage) + E.modAdd(i, 'courage+'); };
  P.age = function (sim, i) { return (sim.tick - this.born[i]) / AL.YEAR; };
  // spatial hash
  P.rebuildHash = function (n) { const E = this, cw = (n + 7) >> 3, nc = cw * cw; if (!E.cellStart || E.cellStart.length !== nc + 1) { E.cellStart = new Int32Array(nc + 1); E.cw = cw; } const cs = E.cellStart; cs.fill(0);
    for (let i = 0; i < E.hi; i++) { if (!E.alive[i]) continue; const c = ((E.y[i] | 0) >> 3) * cw + ((E.x[i] | 0) >> 3); E.cellOf[i] = c; cs[c + 1]++; }
    for (let c = 0; c < nc; c++) cs[c + 1] += cs[c];
    const fill = E._fill || (E._fill = new Int32Array(nc)); if (fill.length !== nc) E._fill = new Int32Array(nc); const fl = E._fill; fl.set(cs.subarray(0, nc));
    for (let i = 0; i < E.hi; i++) { if (!E.alive[i]) continue; E.cellItems[fl[E.cellOf[i]]++] = i; } };
  // fills E.near with entities within r tiles of (x,y); returns count (max 512)
  P.query = function (x, y, r) { const E = this, cw = E.cw, c0x = Math.max(0, ((x - r) | 0) >> 3), c1x = Math.min(cw - 1, ((x + r) | 0) >> 3), c0y = Math.max(0, ((y - r) | 0) >> 3), c1y = Math.min(cw - 1, ((y + r) | 0) >> 3), r2 = r * r, out = E.near; let n = 0;
    for (let cy = c0y; cy <= c1y; cy++) for (let cx = c0x; cx <= c1x; cx++) { const c = cy * cw + cx; for (let k = E.cellStart[c]; k < E.cellStart[c + 1]; k++) { const j = E.cellItems[k], dx = E.x[j] - x, dy = E.y[j] - y; if (dx * dx + dy * dy <= r2 && n < 512) out[n++] = j; } } return n; };
  AL.Ents = Ents;
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));

// AL.Path — bounded A* for individual trips, cached flow fields (Dijkstra) for shared/long destinations.
(function (AL) {
  'use strict';
  function Path(world) { const N = world.n * world.n; this.w = world; this.g = new Float32Array(N); this.stamp = new Uint32Array(N); this.par = new Int32Array(N); this.closed = new Uint32Array(N); this.cur = 0;
    this.heap = new Int32Array(8192); this.hf = new Float32Array(8192); this.hn = 0; this.fields = new Map(); this.maxFields = N > 200000 ? 14 : 28; this.fq = new Int32Array(N); this.stats = { astar: 0, fail: 0, fields: 0 }; this.budget = 0; }
  const P = Path.prototype;
  P.push = function (i, f) { let k = this.hn++; const h = this.heap, hf = this.hf; while (k > 0) { const p = (k - 1) >> 1; if (hf[p] <= f) break; h[k] = h[p]; hf[k] = hf[p]; k = p; } h[k] = i; hf[k] = f; };
  P.pop = function () { const h = this.heap, hf = this.hf, top = h[0], n = --this.hn; if (n > 0) { const li = h[n], lf = hf[n]; let k = 0; for (;;) { let c = k * 2 + 1; if (c >= n) break; if (c + 1 < n && hf[c + 1] < hf[c]) c++; if (hf[c] >= lf) break; h[k] = h[c]; hf[k] = hf[c]; k = c; } h[k] = li; hf[k] = lf; } return top; };
  // cost to enter tile j (0 = blocked). Buildings block; water blocks walkers.
  P.cost = function (j) { const w = this.w; if (w.flags[j] & 2) return 0; const c = AL.gCost[w.ground[j]]; return c > 0 && w.road[j] > 120 ? c * 0.6 : c; };
  // A* from (sx,sy) to (tx,ty). Writes the path (tile indices, start excluded) into out at offset, max len. Returns length, 0 if none, -1 if too far (use a flow field).
  P.find = function (sx, sy, tx, ty, out, off, max, limit) {
    const w = this.w, n = w.n, s = sy * n + sx, t = ty * n + tx; if (s === t) return 0; if (w.region[s] !== w.region[t] && w.region[t] !== 0 && w.region[s] !== 0) return 0;
    const cur = ++this.cur, g = this.g, st = this.stamp, par = this.par, cl = this.closed; this.hn = 0; g[s] = 0; st[s] = cur; par[s] = -1; this.push(s, 0); let exp = 0; const lim = limit || 1800; this.stats.astar++;
    while (this.hn > 0) { const i = this.pop(); if (i === t) break; if (cl[i] === cur) continue; cl[i] = cur; if (++exp > lim || this.hn > 8000) { this.stats.fail++; return -1; } const x = i % n, y = (i / n) | 0, gi = g[i];
      for (let d = 0; d < 8; d++) { const dx = d === 0 ? 1 : d === 1 ? -1 : d < 4 ? 0 : (d & 1 ? 1 : -1), dy = d === 2 ? 1 : d === 3 ? -1 : d < 4 ? 0 : (d < 6 ? 1 : -1), X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= n || Y >= n) continue; const j = Y * n + X; let c = this.cost(j); if (c <= 0) { if (j !== t) continue; c = 1; }
        if (d >= 4) { if (this.cost(y * n + X) <= 0 || this.cost(Y * n + x) <= 0) continue; c *= 1.414; } const ng = gi + c; if (st[j] === cur && g[j] <= ng) continue; g[j] = ng; st[j] = cur; par[j] = i; const hx = Math.abs(X - tx), hy = Math.abs(Y - ty); this.push(j, ng + (hx + hy) * 0.6 + Math.max(hx, hy) * 0.35); } }
    if (st[t] !== cur) return 0; let len = 0, k = t; while (k !== s && k >= 0) { len++; k = par[k]; } if (len > max) { // keep only the first `max` steps (the unit re-plans when it gets there)
      let skip = len - max; k = t; while (skip-- > 0) k = par[k]; len = max; let q = len - 1; while (k !== s && q >= 0) { out[off + q--] = k; k = par[k]; } return len; }
    let q = len - 1; k = t; while (k !== s) { out[off + q--] = k; k = par[k]; } return len;
  };
  // flow field toward tile t: Uint16 distance (x8 fixed point), 65535 unreachable. Cached.
  P.field = function (t) { const w = this.w, n = w.n, N = n * n; let f = this.fields.get(t); if (f && f.ver === w.regionVersion) { f.use = ++this.cur; return f; }
    if (!f) { if (this.fields.size >= this.maxFields) { let ok = -1, ou = Infinity; for (const [k, v] of this.fields) if (v.use < ou) { ou = v.use; ok = k; } f = this.fields.get(ok); this.fields.delete(ok); } else f = { d: new Uint16Array(N) }; this.fields.set(t, f); }
    f.ver = w.regionVersion; f.use = ++this.cur; const d = f.d; d.fill(65535); this.hn = 0; d[t] = 0; this.push(t, 0); this.stats.fields++;
    // Dijkstra with the heap; heap may hold up to 8192 entries: frontier of a grid stays far below that
    while (this.hn > 0) { const i = this.pop(), di = d[i], x = i % n, y = (i / n) | 0; for (let k = 0; k < 4; k++) { const X = x + (k === 0 ? 1 : k === 1 ? -1 : 0), Y = y + (k === 2 ? 1 : k === 3 ? -1 : 0); if (X < 0 || Y < 0 || X >= n || Y >= n) continue; const j = Y * n + X, c = this.cost(j); if (c <= 0) continue; const nd = di + Math.max(1, (c * 8) | 0); if (nd < d[j] && nd < 65000) { d[j] = nd; if (this.hn < 8190) this.push(j, nd); } } }
    return f; };
  // next tile from (x,y) following field f (lowest neighbour); -1 if none
  P.follow = function (f, x, y) { const n = this.w.n, d = f.d, i = y * n + x; let best = d[i], bj = -1; for (let k = 0; k < 8; k++) { const dx = k === 0 ? 1 : k === 1 ? -1 : k < 4 ? 0 : (k & 1 ? 1 : -1), dy = k === 2 ? 1 : k === 3 ? -1 : k < 4 ? 0 : (k < 6 ? 1 : -1), X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= n || Y >= n) continue; const j = Y * n + X; if (d[j] >= best) continue; if (k >= 4 && (d[y * n + X] === 65535 || d[Y * n + x] === 65535)) continue; best = d[j]; bj = j; } return bj; };
  AL.Path = Path;
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));

// AL.Towns — buildings (struct of arrays), towns (stock, territory, planner, job assignment, development stages).
(function (AL) {
  'use strict';
  const BCAP = 2048;
  function Blds() { const u8 = () => new Uint8Array(BCAP), i16 = () => new Int16Array(BCAP), f32 = () => new Float32Array(BCAP);
    this.cap = BCAP; this.hi = 0; this.free = []; this.alive = u8(); this.type = u8(); this.town = i16(); this.x = i16(); this.y = i16(); this.w = u8(); this.h = u8(); this.hp = f32(); this.hpMax = f32(); this.prog = f32(); this.state = u8(); // 0 site, 1 done, 3 ruin
    this.stage = u8(); this.fire = u8(); this.timer = new Int32Array(BCAP); this.occ = u8(); this.workers = u8(); this.aux = []; this.dirty = true; this.gen = new Uint16Array(BCAP); }
  AL.Blds = Blds;
  const T = AL.Towns = {};
  // ---------------------------------------------------------------- buildings
  T.doorX = (B, b) => B.x[b] + (B.w[b] >> 1); T.doorY = (B, b) => B.y[b] + B.h[b];
  T.canPlace = function (sim, town, bt, x, y) { const W = sim.world, n = W.n, w = bt.fp[0], h = bt.fp[1], own = town.id + 1; if (x < 2 || y < 2 || x + w >= n - 2 || y + h >= n - 3) return false;
    for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) { const t = (y + j) * n + x + i, g = W.ground[t]; if (AL.gCost[g] <= 0 || (W.flags[t] & (2 | 8))) return false; if (i >= 0 && j >= 0 && i < w && j < h) { if (W.owner[t] && W.owner[t] !== own) return false; if (g === AL.G.swamp && !bt.shore) return false; } }
    if (bt.shore) { let water = false; for (let j = -3; j <= h + 2 && !water; j++) for (let i = -3; i <= w + 2; i++) { const X = x + i, Y = y + j; if (W.inb(X, Y) && AL.gWater[W.ground[Y * n + X]]) { water = true; break; } } if (!water) return false; }
    return true; };
  T.place = function (sim, town, btName, x, y, done) { const B = sim.B, W = sim.world, n = W.n, bt = AL.DATA.buildings[btName], b = B.free.length ? B.free.pop() : (B.hi < BCAP ? B.hi++ : -1); if (b < 0) return -1;
    B.alive[b] = 1; B.gen[b]++; B.type[b] = bt.id; B.town[b] = town ? town.id : -1; B.x[b] = x; B.y[b] = y; B.w[b] = bt.fp[0]; B.h[b] = bt.fp[1]; B.hpMax[b] = bt.hp; B.hp[b] = done ? bt.hp : bt.hp * 0.3; B.prog[b] = done ? 100 : 0; B.state[b] = done ? 1 : 0; B.stage[b] = town ? Math.min(2, town.stage >> 1) : 0; B.fire[b] = 0; B.timer[b] = 0; B.occ[b] = 0; B.workers[b] = 0; B.aux[b] = null; B.dirty = true;
    for (let j = 0; j < bt.fp[1]; j++) for (let i = 0; i < bt.fp[0]; i++) { const t = (y + j) * n + x + i; W.flags[t] |= 2; sim.bmap[t] = b + 1; if (W.feature[t]) W.feature[t] = 0; W.road[t] = 0; if (town) W.owner[t] = town.id + 1; W.mark(x + i, y + j); }
    W.regionsDirty = true; if (town) { town.blds.push(b); town.count[bt.id] = (town.count[bt.id] || 0) + 1; }
    // push units out of the footprint
    const E = sim.E; for (let i = 0; i < E.hi; i++) if (E.alive[i] && E.x[i] >= x && E.x[i] < x + bt.fp[0] && E.y[i] >= y && E.y[i] < y + bt.fp[1]) { E.x[i] = x + (bt.fp[0] >> 1) + 0.5; E.y[i] = y + bt.fp[1] + 0.5; E.pathLen[i] = 0; }
    if (done) T.complete(sim, b); return b; };
  T.complete = function (sim, b) { const B = sim.B, W = sim.world, n = W.n, bt = AL.BTYPES[B.type[b]], town = sim.towns[B.town[b]]; B.state[b] = 1; B.prog[b] = 100; B.hp[b] = B.hpMax[b]; B.dirty = true;
    if (bt.fields && town) { // claim fertile tiles around the farm as fields
      const f = [], cx = B.x[b] + 1, cy = B.y[b] + 1; for (let r = 2; r <= 5 && f.length < 14; r++) for (let dy = -r; dy <= r && f.length < 14; dy++) for (let dx = -r; dx <= r && f.length < 14; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const X = cx + dx, Y = cy + dy; if (!W.inb(X, Y)) continue; const t = Y * n + X, g = W.ground[t]; if ((W.flags[t] & (2 | 8)) || AL.gFert[g] < 0.4 || AL.gCost[g] <= 0 || (W.owner[t] && W.owner[t] !== town.id + 1)) continue; if (X === T.doorX(B, b) && Y === T.doorY(B, b)) continue;
          W.setGround(t, AL.G.soil); W.flags[t] |= 8; W.feature[t] = AL.F.wheat; W.fgrow[t] = sim.rng.int(60); W.owner[t] = town.id + 1; W.mark(X, Y); f.push(t); }
      B.aux[b] = f; }
    if (town) { town.popCap += bt.cap || 0; sim.emit('built', B.x[b] + B.w[b] / 2, B.y[b] + B.h[b], bt.id, town.id); } };
  T.destroy = function (sim, b, ruin) { const B = sim.B, W = sim.world, n = W.n; if (!B.alive[b]) return; const bt = AL.BTYPES[B.type[b]], town = sim.towns[B.town[b]];
    if (B.state[b] === 1 && town) town.popCap -= bt.cap || 0; if (B.aux[b]) for (const t of B.aux[b]) { W.flags[t] &= ~8; if (W.feature[t] === AL.F.wheat) W.feature[t] = 0; W.mark(t % n, (t / n) | 0); }
    if (town) { const k = town.blds.indexOf(b); if (k >= 0) town.blds.splice(k, 1); town.count[bt.id]--; }
    if (ruin && B.state[b] !== 3) { B.state[b] = 3; B.timer[b] = 3000; B.town[b] = -1; B.dirty = true; sim.emit('collapse', B.x[b] + B.w[b] / 2, B.y[b] + B.h[b], bt.id); return; }
    for (let j = 0; j < B.h[b]; j++) for (let i = 0; i < B.w[b]; i++) { const t = (B.y[b] + j) * n + B.x[b] + i; W.flags[t] &= ~2; sim.bmap[t] = 0; W.mark(B.x[b] + i, B.y[b] + j); }
    B.alive[b] = 0; B.free.push(b); B.dirty = true; W.regionsDirty = true; const E = sim.E; for (let i = 0; i < E.hi; i++) if (E.alive[i]) { if (E.home[i] === b) E.home[i] = -1; if (E.work[i] === b) E.work[i] = -1; if (E.tB[i] === b) { E.tB[i] = -1; if (E.act[i] !== 255) E.act[i] = 0; } } };
  T.damage = function (sim, b, dmg, by) { const B = sim.B; if (!B.alive[b] || B.state[b] === 3) return; B.hp[b] -= dmg; B.dirty = true; if (B.hp[b] <= 0) { const town = sim.towns[B.town[b]], isHall = B.type[b] === AL.BT.hall; T.destroy(sim, b, true); if (isHall && town && town.alive && T.onHallLost) T.onHallLost(sim, town, by); } };
  // ---------------------------------------------------------------- towns
  T.found = function (sim, people, x, y, kingdom, founder) { const W = sim.world, id = sim.towns.length, K = AL.KINDS[people];
    const town = { id, alive: true, people, kingdom: kingdom == null ? -1 : kingdom, cx: x, cy: y, pop: 0, adults: 0, popCap: 0, stock: new Float32Array(AL.NRES), stage: 0, founded: sim.tick, knowledge: 0, blds: [], count: {}, want: new Uint8Array(32), have: new Uint8Array(32), radius: 7, culture: -1, religion: -1, loyalty: 80, name: '', seed: sim.rng.u32(), trees: [], rocks: [], scanAt: -999, hall: -1, sites: 0, famine: 0, soldiers: 0, lastGrow: sim.tick, history: [] };
    sim.towns.push(town); town.stock[AL.RES.wood] = 24; town.stock[AL.RES.food] = 30; town.stock[AL.RES.stone] = 4;
    // the hall (a tent at first) is placed at once
    let hx = x - 2, hy = y - 2, ok = false; for (let r = 0; r < 6 && !ok; r++) for (let dy = -r; dy <= r && !ok; dy++) for (let dx = -r; dx <= r && !ok; dx++) if (T.canPlace(sim, town, AL.DATA.buildings.hall, x - 2 + dx, y - 2 + dy)) { hx = x - 2 + dx; hy = y - 2 + dy; ok = true; }
    if (!ok) { sim.towns.pop(); return null; } town.cx = hx + 2; town.cy = hy + 3; town.hall = T.place(sim, town, 'hall', hx, hy, true); T.claim(sim, town);
    for (const m of AL.Sim.modules) if (m.onTownFounded) m.onTownFounded(sim, town, founder);
    sim.emit('town', town.cx, town.cy, town.id); return town; };
  T.claim = function (sim, town) { const W = sim.world, n = W.n, r = town.radius, own = town.id + 1; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (dx * dx + dy * dy > r * r) continue; const X = town.cx + dx, Y = town.cy + dy; if (!W.inb(X, Y)) continue; const t = Y * n + X; if (!W.owner[t] && !AL.gWater[W.ground[t]] ) { W.owner[t] = own; sim.ownerDirty = true; } } };
  T.unclaim = function (sim, town) { const W = sim.world, own = town.id + 1, o = W.owner; for (let t = 0; t < o.length; t++) if (o[t] === own) o[t] = 0; sim.ownerDirty = true; };
  T.remove = function (sim, town, cause) { if (!town.alive) return; town.alive = false; for (const b of town.blds.slice()) T.destroy(sim, b, true); T.unclaim(sim, town); const E = sim.E; for (let i = 0; i < E.hi; i++) if (E.alive[i] && E.town[i] === town.id) { E.town[i] = -1; E.home[i] = -1; E.work[i] = -1; E.job[i] = 0; }
    for (const m of AL.Sim.modules) if (m.onTownRemoved) m.onTownRemoved(sim, town, cause); sim.emit('townlost', town.cx, town.cy, town.id); };
  // nearest finished storage building door for a town (hall, warehouse, sawmill, mine, port)
  T.nearestStore = function (sim, town, x, y, kindKey) { const B = sim.B; let best = -1, bd = 1e9; for (const b of town.blds) { if (B.state[b] !== 1) continue; const bt = AL.BTYPES[B.type[b]]; if (!(kindKey ? bt[kindKey] : bt.store)) continue; const d = Math.abs(T.doorX(B, b) - x) + Math.abs(T.doorY(B, b) - y); if (d < bd) { bd = d; best = b; } } return best; };
  T.findType = function (sim, town, typeId, x, y) { const B = sim.B; let best = -1, bd = 1e9; for (const b of town.blds) { if (B.state[b] !== 1 || B.type[b] !== typeId) continue; const d = x == null ? 0 : Math.abs(B.x[b] - x) + Math.abs(B.y[b] - y); if (d < bd) { bd = d; best = b; } } return best; };
  // scan the surroundings for work targets (trees, rocks, berries), refreshed now and then
  T.scan = function (sim, town) { const W = sim.world, n = W.n, r = Math.min(26, town.radius + 8); town.trees.length = 0; town.rocks.length = 0; town.berries = town.berries || []; town.berries.length = 0; town.shore = town.shore || []; town.shore.length = 0;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = town.cx + dx, Y = town.cy + dy; if (!W.inb(X, Y)) continue; const t = Y * n + X, f = W.feature[t], k = AL.fKind[f]; if (W.owner[t] && W.owner[t] !== town.id + 1) continue;
      if (k === 1 && W.fgrow[t] > 110 && !W.fire[t]) town.trees.push(t); else if (k === 4 && AL.gCost[W.ground[t]] > 0) town.rocks.push(t); else if ((f === AL.F.berry || f === AL.F.mushroom) && W.fgrow[t] > 200) town.berries.push(t);
      else if (!f && AL.gCost[W.ground[t]] > 0 && !(W.flags[t] & 2) && ((X + Y) & 1) === 0) { if ((X + 1 < n && AL.gWater[W.ground[t + 1]] === 1) || (X > 0 && AL.gWater[W.ground[t - 1]] === 1) || (Y + 1 < n && AL.gWater[W.ground[t + n]] === 1) || (Y > 0 && AL.gWater[W.ground[t - n]] === 1)) town.shore.push(t); } }
    town.scanAt = sim.tick; };
  // ---------------------------------------------------------------- planner (every 40 ticks per town)
  const ORDER = ['house', 'farm', 'warehouse', 'sawmill', 'mine', 'port', 'market', 'temple', 'barracks', 'forge', 'library', 'tavern', 'watchtower', 'hospital'];
  T.wantCount = function (town, bt) { const base = bt.max[0], per = bt.max[1]; return base + (per ? Math.floor(town.pop / per) : 0); };
  T.plan = function (sim, town) { const D = AL.DATA.buildings, B = sim.B, st = town.stock; if (town.sites >= (town.pop > 40 ? 2 : 1)) return;
    let pick = null; const cv = town.cultureValues || AL.KINDS[town.people].culture;
    for (const name of ORDER) { const bt = D[name]; if (bt.stage > town.stage || bt.provisional) continue; let want = T.wantCount(town, bt);
      if (name === 'house') { want = Math.max(1, Math.ceil((town.pop + 3 - 4) / bt.cap)); if (town.popCap > town.pop + 2) continue; }
      if (name === 'farm') { const perCap = st[AL.RES.food] / Math.max(1, town.pop); want = Math.max(want, perCap < 3 ? (town.count[bt.id] || 0) + 1 : 0); want = Math.min(want, 1 + Math.floor(town.pop / 7)); if (AL.KINDS[town.people].diet === 'meat') want = Math.ceil(want / 2); }
      if (name === 'port' && (!town.shore || town.shore.length < 3)) continue;
      if (name === 'barracks' && cv.war < 0.25 && town.stage < 4 && !town.threat) continue; if (name === 'library' && cv.lore < 0.2) continue; if (name === 'market' && cv.trade < 0.15) continue;
      if (name === 'watchtower') want = Math.min(4, Math.floor(want * (0.4 + cv.war)));
      if ((town.count[bt.id] || 0) >= want) continue; let afford = true; for (const r in bt.cost) if (st[AL.RES[r]] < bt.cost[r]) afford = false; if (!afford) { if (name === 'house' || name === 'farm') return; continue; } pick = name; break; }
    if (!pick) return; const bt = D[pick], rng = sim.rng, W = sim.world;
    // site search: random samples in rings of growing radius, keep the best-scored
    let best = null, bs = -1e9; const maxR = Math.min(30, 6 + Math.sqrt(town.pop) * 2.4 + town.blds.length * 0.5);
    for (let k = 0; k < 70; k++) { const a = rng.f() * 6.283, r = 3 + rng.f() * maxR * (0.4 + 0.6 * (k / 70)), x = Math.round(town.cx + Math.cos(a) * r - bt.fp[0] / 2), y = Math.round(town.cy + Math.sin(a) * r * 0.85 - bt.fp[1] / 2); if (!T.canPlace(sim, town, bt, x, y)) continue;
      const dreg = W.region[(y + bt.fp[1]) * W.n + x + (bt.fp[0] >> 1)]; if (dreg !== W.region[town.cy * W.n + town.cx]) continue;
      let s = -r * (bt.fields ? 0.4 : 1) + rng.f() * 2; if (bt.fields) { let fert = 0; for (let dy = -3; dy <= 4; dy++) for (let dx = -3; dx <= 5; dx++) { const X = x + dx, Y = y + dy; if (W.inb(X, Y)) { const t = Y * W.n + X; if (!(W.flags[t] & 10) && AL.gFert[W.ground[t]] >= 0.4) fert++; } } if (fert < 20) continue; s += fert * 0.3 + (r < 5 ? -6 : 0); }
      if (pick === 'mine') { let rock = 0; for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const X = x + dx, Y = y + dy; if (W.inb(X, Y)) { const g = W.ground[Y * W.n + X]; if (g === AL.G.mountain || g === AL.G.hills) rock++; } } s += rock * 0.25; }
      if (pick === 'watchtower') s += r * 1.6;
      if (s > bs) { bs = s; best = [x, y]; } }
    if (!best) return; for (const r in bt.cost) st[AL.RES[r]] -= bt.cost[r]; T.place(sim, town, pick, best[0], best[1], false); town.sites++; };
  // ---------------------------------------------------------------- jobs (every 20 ticks per town)
  T.assign = function (sim, town) { const E = sim.E, J = AL.JOB, want = town.want, have = town.have, st = town.stock, pop = town.adults, cnt = town.count, BT = AL.BT, cv = town.cultureValues || AL.KINDS[town.people].culture; want.fill(0); have.fill(0);
    const done = id => { let c = 0; for (const b of town.blds) if (sim.B.type[b] === id && sim.B.state[b] === 1) c++; return c; };
    const foodPer = st[AL.RES.food] / Math.max(1, town.pop), farms = done(BT.farm), meat = AL.KINDS[town.people].diet === 'meat';
    want[J.builder] = town.sites ? Math.max(1, Math.min(4, Math.ceil(pop / 8))) : 0;
    want[J.farmer] = Math.min(farms * 3, Math.ceil(pop * (foodPer < 4 ? 0.4 : foodPer > 14 ? 0.1 : 0.25)));
    // granaries are finite: what exceeds the storage spoils slowly
    const cap = 40 + town.pop * 12 + (cnt[BT.warehouse] || 0) * 150; if (st[AL.RES.food] > cap) st[AL.RES.food] -= (st[AL.RES.food] - cap) * 0.02;
    want[J.hunter] = Math.ceil(pop * (meat ? 0.22 : 0.06)) + (farms ? 0 : 1);
    want[J.gatherer] = farms ? (foodPer < 2 ? Math.ceil(pop * 0.2) : 0) : Math.ceil(pop * 0.35);
    want[J.fisher] = done(BT.port) ? Math.min(4, Math.ceil(pop * 0.1)) : 0;
    want[J.lumberjack] = st[AL.RES.wood] < 30 + town.pop ? Math.max(1, Math.ceil(pop * 0.2)) : (st[AL.RES.wood] < 120 ? Math.ceil(pop * 0.08) : 0);
    want[J.miner] = town.stage >= 1 ? (st[AL.RES.stone] < 30 + town.pop * 0.5 ? Math.max(1, Math.ceil(pop * 0.12)) : (done(BT.mine) ? 1 : 0)) : 0;
    want[J.blacksmith] = done(BT.forge) ? Math.min(2, 1 + (pop > 60 ? 1 : 0)) : 0; want[J.merchant] = done(BT.market) ? 1 + (cv.trade > 0.6 && pop > 50 ? 1 : 0) : 0; want[J.priest] = done(BT.temple) ? 1 + (pop > 80 ? 1 : 0) : 0;
    want[J.scholar] = done(BT.library) ? 1 + (cv.lore > 0.6 ? 1 : 0) : 0; want[J.bard] = done(BT.tavern) ? 1 : 0; want[J.herder] = town.herd ? 1 : 0;
    const mil = done(BT.barracks) ? Math.ceil(pop * (0.06 + cv.war * 0.14 + (town.atWar ? 0.15 : 0))) : (town.threat ? Math.ceil(pop * 0.1) : 0); want[J.soldier] = Math.ceil(mil * 0.6); want[J.archer] = Math.floor(mil * 0.3); want[J.knight] = town.stage >= 4 ? Math.floor(mil * 0.1) : 0;
    let free = 0, ruler = -1; const idle = T._idle || (T._idle = []); idle.length = 0; town.pop = 0; town.adults = 0; town.soldiers = 0;
    for (let i = 0; i < E.hi; i++) { if (!E.alive[i] || E.town[i] !== town.id || (E.flags[i] & 1)) continue; town.pop++; if (E.flags[i] & 2) continue; town.adults++; const j = E.job[i]; if (j === J.ruler) { ruler = i; continue; } if (AL.JOBS[j].military) town.soldiers++;
      if (j === 0) idle.push(i); else if (have[j] >= want[j] && !(E.flags[i] & 4096) && !(AL.JOBS[j].military && town.atWar)) { E.job[i] = 0; E.work[i] = -1; T.setLook(E, i); idle.push(i); } else have[j]++; }
    // fill the most under-staffed jobs first
    for (let guard = 0; guard < 64 && idle.length; guard++) { let bj = -1, br = 1; for (let j = 1; j < 21; j++) { if (want[j] <= have[j]) continue; const r = have[j] / want[j]; if (r < br) { br = r; bj = j; } } if (bj < 0) break; const i = idle.pop(); if (E.flags[i] & 4 && AL.JOBS[bj].military) { continue; } E.job[i] = bj; E.work[i] = -1; have[bj]++; T.setLook(E, i); if (E.act[i] !== 255 && E.act[i] !== 3) E.act[i] = 0; }
    town.idle = idle.length; };
  T.setLook = function (E, i) { const f = E.flags[i]; E.look[i] = (f & 2) ? AL.LOOK.child : (f & 4) && !(f & 1024) ? AL.LOOK.elder : AL.LOOK[AL.JOBS[E.job[i]].look] || 0; };
  T.updateStage = function (sim, town) { const S = AL.DATA.stages; let st = town.stage; while (st < S.length - 1) { const nx = S[st + 1]; if (town.pop < nx.pop * (1 / (AL.KINDS[town.people].devSpeed || 1)) ) break; let ok = true; for (const nb of nx.need || []) if (!T.hasDone(sim, town, AL.BT[nb])) ok = false; if (!ok) break; st++; }
    if (st !== town.stage) { town.stage = st; const B = sim.B; for (const b of town.blds) B.stage[b] = Math.min(2, st >> 1); B.dirty = true; sim.emit('stage', town.cx, town.cy, town.id, st); for (const m of AL.Sim.modules) if (m.onTownStage) m.onTownStage(sim, town); }
    const r = Math.min(34, Math.round(7 + Math.sqrt(town.pop) * 1.9)); if (r > town.radius) { town.radius = r; T.claim(sim, town); } };
  T.hasDone = function (sim, town, typeId) { for (const b of town.blds) if (sim.B.type[b] === typeId && sim.B.state[b] === 1) return true; return false; };
  // ---------------------------------------------------------------- module
  AL.Sim.modules.push({
    name: 'towns',
    // crops ripen on their own in about a year (tending speeds them up); berries and mushrooms regrow
    tile(sim, i, x, y, g) { const W = sim.world, f = W.feature[i]; if (!f) return; if (f === AL.F.wheat) { const v = W.fgrow[i]; if (v < 250) { const nv = Math.min(250, v + 7); W.fgrow[i] = nv; if ((nv >> 6) !== (v >> 6) || nv === 250) W.mark(x, y); } }
      else if ((f === AL.F.berry || f === AL.F.mushroom) && W.fgrow[i] < 255) { const v = W.fgrow[i], nv = Math.min(255, v + 4); W.fgrow[i] = nv; if (v <= 200 && nv > 200) W.mark(x, y); } },
    init(sim) { sim.B = new Blds(); sim.towns = []; sim.bmap = new Int16Array(sim.world.n * sim.world.n); sim.ownerDirty = true; },
    tick(sim) { const towns = sim.towns, B = sim.B;
      for (let k = 0; k < towns.length; k++) { const town = towns[k]; if (!town.alive) continue; const ph = (sim.tick + k * 7) % 40;
        if (ph === 0) { if (sim.tick - town.scanAt > 300) T.scan(sim, town); T.assign(sim, town); T.updateStage(sim, town); if (town.pop === 0 && sim.tick - town.founded > 200) { T.remove(sim, town, 'abandoned'); continue; } }
        else if (ph === 20) { T.assign(sim, town); T.plan(sim, town); } }
      // buildings: ruins fade, fires are handled by the disasters module
      if (sim.tick % 16 === 0) for (let b = 0; b < B.hi; b++) { if (!B.alive[b]) continue; if (B.state[b] === 3) { B.timer[b] -= 16; if (B.timer[b] <= 0) T.destroy(sim, b, false); } } },
    query(sim, m) { if (m.q === 'towns') return sim.towns.filter(t => t.alive).map(t => ({ id: t.id, name: t.name, people: t.people, kingdom: t.kingdom, cx: t.cx, cy: t.cy, pop: t.pop, adults: t.adults, popCap: t.popCap, stage: t.stage, stock: Array.from(t.stock), blds: t.blds.length, done: t.blds.filter(b => sim.B.state[b] === 1).length, founded: t.founded }));
      if (m.q === 'stats') return Object.assign({ tick: sim.tick, units: sim.E.count, towns: sim.towns.filter(t => t.alive).length }, sim.stats); },
    snapshot(sim) { const B = sim.B; let out = null; if (B.dirty) { B.dirty = false; const n = B.hi; out = { t: 'blds', n, alive: B.alive.slice(0, n), type: B.type.slice(0, n), town: B.town.slice(0, n), x: B.x.slice(0, n), y: B.y.slice(0, n), prog: Uint8Array.from(B.prog.subarray(0, n)), state: B.state.slice(0, n), stage: B.stage.slice(0, n), hp: Uint8Array.from(B.hp.subarray(0, n), (v, i) => Math.max(0, Math.min(255, 255 * v / (B.hpMax[i] || 1)))), fire: B.fire.slice(0, n), tk: sim.towns.map(t => t.kingdom), tp: sim.towns.map(t => t.people) }; }
      return out; },
  });
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));

// AL.Units — people: movement, needs, utility AI, jobs, life cycle. (Animals and monsters live in creatures.js and reuse the movement.)
(function (AL) {
  'use strict';
  const U = AL.Units = {}, ACT = U.ACT = { NONE: 0, WANDER: 1, EAT: 2, SLEEP: 3, WORK: 4, HAUL: 5, BUILD: 6, SOCIAL: 7, PRAY: 8, FLEE: 9, FIGHT: 10, FOUND: 11, SETTLE: 12, FORAGE: 13, GUARD: 14, MARCH: 15, GOTO: 16, CONTROL: 17, BOARD: 18, CORPSE: 255 };
  const F = AL.Ents.F, T = AL.Towns;
  U.ACTN = Object.keys(ACT);
  U.dayPhase = sim => (sim.tick % AL.DAY) / AL.DAY;       // 0..1; night when > 0.7
  U.isNight = sim => { const p = (sim.tick % AL.DAY) / AL.DAY; return p > 0.72 || p < 0.04; };
  // ------------------------------------------------------------ movement
  // start a trip. returns 1 arrived already, 2 started, 0 failed/unreachable, -1 deferred (budget)
  U.goTo = function (sim, i, tx, ty) { const E = sim.E, W = sim.world, n = W.n, sx = E.x[i] | 0, sy = E.y[i] | 0; E.tx[i] = tx; E.ty[i] = ty; E.flow[i] = -1; E.pathLen[i] = 0; E.pathPos[i] = 0;
    if (sx === tx && sy === ty) return 1; if (!W.inb(tx, ty)) return 0; const t = ty * n + tx, s = sy * n + sx;
    if (W.region[s] && W.region[t] && W.region[s] !== W.region[t]) return 0; if (!W.region[t] && !(W.flags[t] & 2)) return 0;
    const dist = Math.abs(tx - sx) + Math.abs(ty - sy);
    if (dist > 46) { E.flow[i] = t; return 2; }
    if (sim.pathBudget <= 0) return -1; sim.pathBudget--;
    const len = sim.path.find(sx, sy, tx, ty, E.path, i * E.PATH, E.PATH, 1500); if (len > 0) { E.pathLen[i] = len; return 2; } if (len === -1) { E.flow[i] = t; return 2; } return 0; };
  // advance along the path / flow field. returns true when the destination tile is reached
  U.move = function (sim, i) { const E = sim.E, W = sim.world, n = W.n; let nt = -1;
    if (E.pathPos[i] < E.pathLen[i]) nt = E.path[i * E.PATH + E.pathPos[i]];
    else if (E.flow[i] >= 0) { const x = E.x[i] | 0, y = E.y[i] | 0, t = E.flow[i]; if (x === t % n && y === ((t / n) | 0)) { E.flow[i] = -1; return true; } // (a field is followed to its end: retrying A* near the goal failed every tick on long detours)
      if (sim.fieldBudget <= 0 && !(sim.path.fields.get(t) && sim.path.fields.get(t).ver === W.regionVersion)) return false; const had = sim.path.stats.fields, f = sim.path.field(t); if (sim.path.stats.fields !== had) sim.fieldBudget--; nt = sim.path.follow(f, x, y); if (nt < 0) { E.flow[i] = -1; return f.d[y * n + x] === 0; } }
    else return (E.x[i] | 0) === E.tx[i] && (E.y[i] | 0) === E.ty[i];
    const tx = nt % n + 0.5, ty = ((nt / n) | 0) + 0.5, dx = tx - E.x[i], dy = ty - E.y[i], d = Math.sqrt(dx * dx + dy * dy);
    if ((W.flags[nt] & 2) && nt !== E.ty[i] * n + E.tx[i]) { E.pathLen[i] = 0; E.pathPos[i] = 0; return false; }
    const here = (E.y[i] | 0) * n + (E.x[i] | 0), c = AL.gCost[W.ground[here]] || 1.5; let step = E.spd[i] / (W.road[here] > 120 ? c * 0.6 : c); if (E.flags[i] & F.CHILD) step *= 0.85; if (E.carryN[i]) step *= 0.88;
    if (d <= step) { E.x[i] = tx; E.y[i] = ty; if (E.pathPos[i] < E.pathLen[i]) E.pathPos[i]++; if (W.road[nt] < 250 && !(W.flags[nt] & 8)) W.road[nt] += 2; if (E.pathPos[i] >= E.pathLen[i] && E.flow[i] < 0) { E.pathLen[i] = 0; E.pathPos[i] = 0; return (nt % n) === E.tx[i] && ((nt / n) | 0) === E.ty[i]; } }
    else { E.x[i] += dx / d * step; E.y[i] += dy / d * step; }
    E.dir[i] = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 1) : (dy > 0 ? 0 : 2); E.anim[i] = AL.ANIM.walk; return false; };
  U.moving = (E, i) => E.pathPos[i] < E.pathLen[i] || E.flow[i] >= 0;
  U.stop = function (E, i) { E.pathLen[i] = 0; E.pathPos[i] = 0; E.flow[i] = -1; };
  U.face = function (E, i, x, y) { const dx = x - E.x[i], dy = y - E.y[i]; E.dir[i] = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 1) : (dy > 0 ? 0 : 2); };
  function begin(sim, i, act, tx, ty) { const E = sim.E, r = U.goTo(sim, i, tx, ty); if (r === 0) { E.act[i] = ACT.NONE; E.cool[i] = 24; E.stuck[i]++; return false; } if (r === -1) { E.act[i] = ACT.NONE; return false; } E.act[i] = act; E.phase[i] = r === 1 ? 1 : 0; E.timer[i] = 0; E.stuck[i] = 0; return true; }
  U.begin = begin;
  // random walkable tile near (x,y)
  U.randomNear = function (sim, x, y, r) { const W = sim.world, n = W.n, rng = sim.rng, reg = W.region[(y | 0) * n + (x | 0)]; for (let k = 0; k < 8; k++) { const X = (x + rng.range(-r, r)) | 0, Y = (y + rng.range(-r, r)) | 0; if (!W.inb(X, Y)) continue; const t = Y * n + X; if (W.region[t] === reg && reg && !(W.flags[t] & 2)) return t; } return -1; };
  // ------------------------------------------------------------ thinking (utility scores)
  const sc = U.scores = new Float32Array(8); // eat, sleep, work, social, pray, wander, haul (kept for the debug line of the sheet)
  U.think = function (sim, i) { const E = sim.E, W = sim.world, n = W.n, town = sim.towns[E.town[i]], night = U.isNight(sim), fl = E.flags[i];
    if (E.cool[i] > 0) { E.cool[i] = E.cool[i] > 8 ? E.cool[i] - 8 : 0; if (E.act[i] === ACT.NONE) { E.anim[i] = AL.ANIM.idle; } return; }
    if (AL.Creatures && AL.Creatures.threat(sim, i)) return;
    if (!town || !town.alive) return U.thinkNomad(sim, i);
    const h = E.hunger[i], en = E.energy[i], child = fl & F.CHILD;
    const dp = U.dayPhase(sim), evening = dp > 0.56 && dp <= 0.72;
    // hunger grows into the strongest drive: a villager eats before sleeping and never works on an empty stomach
    sc[0] = h > 45 ? 0.3 + (h - 45) / 55 * 1.3 : 0; sc[1] = (night ? 0.55 : 0) + (en < 35 ? (1 - en / 100) * 1.1 : 0); sc[6] = E.carryN[i] ? 0.95 : 0;
    sc[2] = (!child && !night) ? (E.job[i] ? (evening ? 0.45 : 0.6) : 0.3) : 0; sc[3] = (1 - E.social[i] / 100) * (night ? 0.2 : 0.75) + (evening ? 0.22 : 0); sc[4] = town.temple ? (1 - E.faith[i] / 100) * 0.35 : 0; sc[5] = child ? 0.3 : 0.12;
    let b = 0; for (let k = 1; k < 7; k++) if (sc[k] > sc[b]) b = k; E.lastScore = b;
    if (b === 0) return U.startEat(sim, i, town); if (b === 6) return U.startHaul(sim, i, town); if (b === 1) return U.startSleep(sim, i, town);
    if (b === 2) { if (U.startWork(sim, i, town)) return; b = 5; }
    if (b === 3) { const t = U.randomNear(sim, town.cx, town.cy, 5); if (t >= 0 && begin(sim, i, ACT.SOCIAL, t % n, (t / n) | 0)) return; }
    if (b === 4) { const tb = T.findType(sim, town, AL.BT.temple, E.x[i], E.y[i]); if (tb >= 0 && begin(sim, i, ACT.PRAY, T.doorX(sim.B, tb), T.doorY(sim.B, tb))) { E.tB[i] = tb; return; } }
    const t = U.randomNear(sim, child ? E.x[i] : (E.x[i] + town.cx) / 2, child ? E.y[i] : (E.y[i] + town.cy) / 2, 6); if (t >= 0) begin(sim, i, ACT.WANDER, t % n, (t / n) | 0); };
  U.startEat = function (sim, i, town) { const E = sim.E, B = sim.B; if (town.stock[AL.RES.food] >= 1) { const b = T.nearestStore(sim, town, E.x[i], E.y[i]); if (b >= 0 && begin(sim, i, ACT.EAT, T.doorX(B, b), T.doorY(B, b))) { E.tB[i] = b; return; } } U.startForage(sim, i, town); };
  U.startForage = function (sim, i, town) { const E = sim.E, W = sim.world, n = W.n, x = E.x[i] | 0, y = E.y[i] | 0; let best = -1, bd = 1e9;
    if (town && town.berries) for (const t of town.berries) { if (W.fgrow[t] < 200) continue; const d = Math.abs(t % n - x) + Math.abs(((t / n) | 0) - y); if (d < bd) { bd = d; best = t; } }
    if (best < 0) for (let k = 0; k < 24; k++) { const X = x + sim.rng.int(17) - 8, Y = y + sim.rng.int(17) - 8; if (!W.inb(X, Y)) continue; const t = Y * n + X, f = W.feature[t]; if ((f === AL.F.berry || f === AL.F.mushroom) && W.fgrow[t] > 200) { best = t; break; } }
    if (best >= 0 && begin(sim, i, ACT.FORAGE, best % n, (best / n) | 0)) return true;
    const t = U.randomNear(sim, E.x[i], E.y[i], 9); if (t >= 0) begin(sim, i, ACT.WANDER, t % n, (t / n) | 0); return false; };
  U.startHaul = function (sim, i, town) { const E = sim.E, B = sim.B, b = T.nearestStore(sim, town, E.x[i], E.y[i]); if (b < 0) { E.carryN[i] = 0; return; } if (begin(sim, i, ACT.HAUL, T.doorX(B, b), T.doorY(B, b))) E.tB[i] = b; };
  U.startSleep = function (sim, i, town) { const E = sim.E, B = sim.B; let b = E.home[i]; if (b < 0 || !B.alive[b] || B.state[b] !== 1) { b = -1; E.home[i] = -1;
      for (const hb of town.blds) { if (B.state[hb] !== 1) continue; const cap = AL.BTYPES[B.type[hb]].cap; if (cap && B.occ[hb] < cap) { b = hb; B.occ[hb]++; E.home[i] = hb; break; } } }
    if (b >= 0) { if (begin(sim, i, ACT.SLEEP, T.doorX(B, b), T.doorY(B, b))) E.tB[i] = b; }
    else { const t = U.randomNear(sim, town.cx, town.cy, 4); if (t >= 0 && begin(sim, i, ACT.SLEEP, t % sim.world.n, (t / sim.world.n) | 0)) E.tB[i] = -1; } };
  // pick the nearest of a few random candidates from a target list
  function pickTarget(sim, list, x, y, valid) { const n = sim.world.n; let best = -1, bd = 1e9; const m = Math.min(list.length, 10); for (let k = 0; k < m; k++) { const t = list[sim.rng.int(list.length)]; if (!valid(t)) continue; const d = Math.abs(t % n - x) + Math.abs(((t / n) | 0) - y); if (d < bd) { bd = d; best = t; } } return best; }
  // a walkable tile next to t (to work on a blocked or occupied target)
  function standBy(sim, t, fx, fy) { const W = sim.world, n = W.n, x = t % n, y = (t / n) | 0; let best = -1, bd = 1e9; for (let d = 0; d < 4; d++) { const X = x + (d === 0 ? 1 : d === 1 ? -1 : 0), Y = y + (d === 2 ? 1 : d === 3 ? -1 : 0); if (!W.inb(X, Y)) continue; const j = Y * n + X; if (AL.gCost[W.ground[j]] <= 0 || (W.flags[j] & 2)) continue; const dd = Math.abs(X - fx) + Math.abs(Y - fy); if (dd < bd) { bd = dd; best = j; } } return best; }
  U.standBy = standBy;
  U.startWork = function (sim, i, town) { const E = sim.E, W = sim.world, n = W.n, B = sim.B, job = AL.JOBS[E.job[i]], task = job.task, x = E.x[i] | 0, y = E.y[i] | 0; let t = -1;
    E.tB[i] = -1;
    if (task === 'chop') { t = pickTarget(sim, town.trees, x, y, t => AL.fKind[W.feature[t]] === 1 && W.fgrow[t] > 110); if (t < 0) { town.scanAt = Math.min(town.scanAt, sim.tick - 200); return false; } const s = standBy(sim, t, x, y); if (s < 0) return false; if (begin(sim, i, ACT.WORK, s % n, (s / n) | 0)) { E.tE[i] = t; return true; } return false; }
    if (task === 'mine') { t = pickTarget(sim, town.rocks, x, y, t => AL.fKind[W.feature[t]] === 4); if (t >= 0) { const s = standBy(sim, t, x, y); if (s >= 0 && begin(sim, i, ACT.WORK, s % n, (s / n) | 0)) { E.tE[i] = t; return true; } }
      const mb = T.findType(sim, town, AL.BT.mine, x, y); if (mb >= 0 && begin(sim, i, ACT.WORK, T.doorX(B, mb), T.doorY(B, mb))) { E.tE[i] = -1; E.tB[i] = mb; return true; } return false; }
    if (task === 'farm') { let fb = E.work[i]; if (fb < 0 || !B.alive[fb] || B.type[fb] !== AL.BT.farm || B.state[fb] !== 1) { fb = -1; let bw = 99; for (const b of town.blds) if (B.type[b] === AL.BT.farm && B.state[b] === 1 && B.workers[b] < bw) { bw = B.workers[b]; fb = b; } if (fb < 0) return false; E.work[i] = fb; B.workers[fb]++; }
      const f = B.aux[fb]; if (!f || !f.length) return false; let best = -1, bg = -1; const o = sim.rng.int(f.length); for (let k = 0; k < f.length; k++) { const tt = f[(k + o) % f.length]; const g = W.feature[tt] === AL.F.wheat ? (W.fgrow[tt] >= 250 ? 600 : 255 - W.fgrow[tt]) : 400; if (g > bg) { bg = g; best = tt; } }
      if (best >= 0 && begin(sim, i, ACT.WORK, best % n, (best / n) | 0)) { E.tE[i] = best; return true; } return false; }
    if (task === 'build') { let sb = -1, bd = 1e9; for (const b of town.blds) if (B.state[b] === 0) { const d = Math.abs(B.x[b] - x) + Math.abs(B.y[b] - y); if (d < bd) { bd = d; sb = b; } } if (sb < 0) return false; if (begin(sim, i, ACT.BUILD, T.doorX(B, sb), T.doorY(B, sb))) { E.tB[i] = sb; return true; } return false; }
    if (task === 'gather' || task === 'hunt' || task === 'herd' || task === 'idle') { if (task !== 'gather' && task !== 'idle' && AL.Creatures && AL.Creatures.startHunt(sim, i, town, task)) return true;
      t = town.berries && town.berries.length ? pickTarget(sim, town.berries, x, y, t => W.fgrow[t] > 200) : -1; if (t >= 0 && begin(sim, i, ACT.WORK, t % n, (t / n) | 0)) { E.tE[i] = t; return true; }
      const r = U.randomNear(sim, town.cx, town.cy, town.radius + 4); if (r >= 0 && AL.gFert[W.ground[r]] > 0.3 && begin(sim, i, ACT.WORK, r % n, (r / n) | 0)) { E.tE[i] = -2; return true; } return false; }
    if (task === 'fish') { if (!town.shore || !town.shore.length) return false; t = pickTarget(sim, town.shore, x, y, t => !(W.flags[t] & 2)); if (t >= 0 && begin(sim, i, ACT.WORK, t % n, (t / n) | 0)) { E.tE[i] = -3; return true; } return false; }
    // jobs done at a building: smith, study, preach, trade, entertain, heal
    const need = job.needs ? AL.BT[job.needs] : -1; if (task === 'guard' || task === 'siege') { if (AL.War && AL.War.unitDuty(sim, i, town)) return true; const r = U.randomNear(sim, town.cx, town.cy, town.radius * 0.8); if (r >= 0 && begin(sim, i, ACT.GUARD, r % n, (r / n) | 0)) return true; return false; }
    if (task === 'trade' && AL.Trade && AL.Trade.startTrip(sim, i, town)) return true;
    if (task === 'rule') { const r = U.randomNear(sim, town.cx, town.cy, 4); if (r >= 0 && begin(sim, i, ACT.WANDER, r % n, (r / n) | 0)) return true; return false; }
    if (need >= 0) { const b = T.findType(sim, town, need, x, y); if (b >= 0 && begin(sim, i, ACT.WORK, T.doorX(B, b), T.doorY(B, b))) { E.tE[i] = -4; E.tB[i] = b; return true; } }
    return false; };
  // ------------------------------------------------------------ acting (called every tick when not travelling)
  const WORKT = { chop: 50, mine: 60, farm: 34, gather: 40, hunt: 40, herd: 40, fish: 70, smith: 90, study: 80, preach: 80, trade: 60, entertain: 80, heal: 60 };
  U.act = function (sim, i) { const E = sim.E, W = sim.world, n = W.n, B = sim.B, a = E.act[i], town = sim.towns[E.town[i]], A = AL.ANIM, R = AL.RES;
    if (a === ACT.NONE) { E.anim[i] = A.idle; return; }
    if (E.phase[i] === 0) { E.phase[i] = 1; E.timer[i] = 0; }
    const tm = ++E.timer[i];
    switch (a) {
      case ACT.WANDER: E.anim[i] = A.idle; if (tm > 20 + (E.seed[i] & 31)) E.act[i] = ACT.NONE; break;
      case ACT.GOTO: E.act[i] = ACT.NONE; break;
      case ACT.EAT: E.anim[i] = A.idle; if (tm > 14) { if (town && town.stock[R.food] >= 1) { town.stock[R.food] -= 1; E.hunger[i] = Math.max(0, E.hunger[i] - 60); if (E.hunger[i] > 35 && town.stock[R.food] >= 1) { town.stock[R.food] -= 1; E.hunger[i] = Math.max(0, E.hunger[i] - 60); } E.mood[i] = Math.min(100, E.mood[i] + 4); } else E.cool[i] = 8; E.act[i] = ACT.NONE; } break;
      case ACT.FORAGE: E.anim[i] = A.work; if (tm > 30) { const t = (E.y[i] | 0) * n + (E.x[i] | 0), f = W.feature[t]; if ((f === AL.F.berry || f === AL.F.mushroom) && W.fgrow[t] > 200) { W.fgrow[t] = 20; W.mark(t % n, (t / n) | 0); E.hunger[i] = Math.max(0, E.hunger[i] - 45); } E.act[i] = ACT.NONE; } break;
      case ACT.SLEEP: { E.anim[i] = E.tB[i] >= 0 ? A.inside : A.sleep; E.flags[i] |= F.ASLEEP; E.energy[i] = Math.min(100, E.energy[i] + (E.tB[i] >= 0 ? 0.55 : 0.35)); if (E.hp[i] < E.hpMax[i]) E.hp[i] += 0.05;
        if ((E.energy[i] >= 99 && !U.isNight(sim)) || E.hunger[i] > 78 || tm > 260) { E.flags[i] &= ~F.ASLEEP; E.act[i] = ACT.NONE; if (E.tB[i] < 0) E.mood[i] = Math.max(0, E.mood[i] - 6); } break; }
      case ACT.SOCIAL: E.anim[i] = (tm % 50) > 38 ? A.joy : A.idle; E.social[i] = Math.min(100, E.social[i] + 0.7); if (tm === 30) U.socialize(sim, i); if (tm > 70) E.act[i] = ACT.NONE; break;
      case ACT.PRAY: E.anim[i] = A.pray; E.faith[i] = Math.min(100, E.faith[i] + 0.8); if (tm > 80) { E.act[i] = ACT.NONE; if (AL.Faith) AL.Faith.onPray(sim, i, town); } break;
      case ACT.GUARD: E.anim[i] = A.idle; if (tm > 40) E.act[i] = ACT.NONE; break;
      case ACT.HAUL: { const b = E.tB[i]; if (town && b >= 0) { town.stock[E.carry[i]] += E.carryN[i]; } E.carryN[i] = 0; E.act[i] = ACT.NONE; break; }
      case ACT.BUILD: { const b = E.tB[i]; if (b < 0 || !B.alive[b] || B.state[b] !== 0) { E.act[i] = ACT.NONE; break; } E.anim[i] = A.work; U.face(E, i, B.x[b] + B.w[b] / 2, B.y[b]);
        if (tm % 10 === 0) { B.prog[b] += 2.6 * E.workMul[i] * E.mod(i, 'build') * (200 / (AL.BTYPES[B.type[b]].hp + 80)); B.dirty = true; sim.emit('hammer', E.x[i], E.y[i]); if (B.prog[b] >= 100) { T.complete(sim, b); if (town) town.sites = Math.max(0, town.sites - 1); E.act[i] = ACT.NONE; } }
        if (tm > 300) E.act[i] = ACT.NONE; break; }
      case ACT.WORK: { const job = AL.JOBS[E.job[i]], task = job.task, tgt = E.tE[i]; E.anim[i] = tgt === -4 ? A.inside : A.work; if (tgt >= 0) U.face(E, i, tgt % n + 0.5, ((tgt / n) | 0) + 0.5);
        const need = (WORKT[task] || 60) / (E.workMul[i] * (town && town.stock[R.tools] > 0 ? 1.25 : 1));
        if (task === 'chop' && tm % 17 === 5) sim.emit('chop', E.x[i], E.y[i]); else if (task === 'mine' && tm % 20 === 5) sim.emit('mine', E.x[i], E.y[i]);
        if (tm < need) break; E.act[i] = ACT.NONE; if (!town) break;
        if (task === 'chop') { if (tgt >= 0 && AL.fKind[W.feature[tgt]] === 1) { const f = AL.FLORA[W.feature[tgt]]; W.feature[tgt] = AL.F.stump; W.fgrow[tgt] = 0; W.mark(tgt % n, (tgt / n) | 0); E.carry[i] = R.wood; E.carryN[i] = Math.round(f.wood * E.mod(i, 'chop')); sim.emit('treefall', tgt % n, (tgt / n) | 0); } }
        else if (task === 'mine') { let ore = -1; if (tgt >= 0 && AL.fKind[W.feature[tgt]] === 4) { const f = AL.FLORA[W.feature[tgt]]; if (f.ore) ore = R[f.ore]; if (W.feature[tgt] !== AL.F.peak && W.feature[tgt] !== AL.F.snowpeak) { if (W.fgrow[tgt] <= 70) { W.feature[tgt] = 0; W.mark(tgt % n, (tgt / n) | 0); } else W.fgrow[tgt] -= 64; } }
          else if (sim.rng.chance(0.3)) ore = sim.rng.chance(0.55) ? R.iron : sim.rng.chance(0.75) ? R.copper : sim.rng.chance(0.85) ? R.gold : R.aetherite;
          if (ore >= 0 && sim.rng.chance(0.6)) { E.carry[i] = ore; E.carryN[i] = 1; town.stock[R.stone] += 1; } else { E.carry[i] = R.stone; E.carryN[i] = Math.round(3 * E.mod(i, 'mine')); } }
        else if (task === 'farm') { if (tgt >= 0 && (W.flags[tgt] & 8)) { if (W.feature[tgt] !== AL.F.wheat) { W.feature[tgt] = AL.F.wheat; W.fgrow[tgt] = 0; } else if (W.fgrow[tgt] >= 250) { W.fgrow[tgt] = 0; E.carry[i] = R.food; E.carryN[i] = Math.round(6 * E.mod(i, 'farm') * (sim.cropMul || 1)); } else W.fgrow[tgt] = Math.min(250, W.fgrow[tgt] + 40); W.mark(tgt % n, (tgt / n) | 0); } }
        else if (task === 'gather' || task === 'hunt' || task === 'herd' || task === 'idle') { if (tgt >= 0 && W.fgrow[tgt] > 200) { W.fgrow[tgt] = 20; W.mark(tgt % n, (tgt / n) | 0); E.carry[i] = R.food; E.carryN[i] = 3; } else if (tgt === -2 && sim.rng.chance(0.6)) { E.carry[i] = R.food; E.carryN[i] = 1; } }
        else if (task === 'fish') { E.carry[i] = R.food; E.carryN[i] = Math.round(3 * E.mod(i, 'fish')); sim.emit('splash', E.x[i], E.y[i]); }
        else if (task === 'smith') { const st = town.stock; const ore = st[R.iron] >= 1 ? R.iron : st[R.copper] >= 1 ? R.copper : -1; if (ore >= 0 && st[R.wood] >= 1) { st[ore] -= 1; st[R.wood] -= 1; const k = st[R.tools] < town.pop * 0.3 ? R.tools : st[R.weapons] <= st[R.armor] ? R.weapons : R.armor; st[k] += ore === R.iron ? 2 : 1; sim.emit('anvil', E.x[i], E.y[i]); } }
        else if (task === 'study') { town.knowledge += 1 * E.mod(i, 'learn'); }
        else if (task === 'preach') { if (AL.Faith) AL.Faith.preach(sim, i, town); }
        else if (task === 'entertain') { town.cheer = (town.cheer || 0) + 1; }
        break; }
      default: if (AL.UnitsExtra && AL.UnitsExtra(sim, i, a, tm)) break; E.act[i] = ACT.NONE;
    }
  };
  // meeting another villager: friendships, couples
  U.socialize = function (sim, i) { const E = sim.E, c = E.query(E.x[i], E.y[i], 3); for (let k = 0; k < c; k++) { const j = E.near[k]; if (j === i || E.town[j] !== E.town[i] || (E.flags[j] & (F.DEAD | F.CHILD)) || (E.flags[i] & F.CHILD)) continue;
      if (E.spouse[i] < 0 && E.spouse[j] < 0 && E.sex[i] !== E.sex[j] && E.kind[i] === E.kind[j] && E.mother[i] !== j && E.mother[j] !== i && !(E.mother[i] >= 0 && E.mother[i] === E.mother[j]) && sim.rng.chance(0.35)) { E.spouse[i] = j; E.spouse[j] = i; sim.emit('love', E.x[i], E.y[i]); E.mood[i] = Math.min(100, E.mood[i] + 15); E.mood[j] = Math.min(100, E.mood[j] + 15); }
      E.social[j] = Math.min(100, E.social[j] + 10); break; } };
  // ------------------------------------------------------------ nomads: bands without a town; they look for a place to settle
  U.thinkNomad = function (sim, i) { const E = sim.E, W = sim.world, n = W.n, x = E.x[i] | 0, y = E.y[i] | 0, t = y * n + x;
    if (E.hunger[i] > 60) { if (U.startForage(sim, i, null)) return; if (E.hunger[i] > 60 && sim.rng.chance(0.15)) E.hunger[i] -= 25; }
    // join a nearby town of the same people
    const c = E.query(x, y, 10); let band = 0; for (let k = 0; k < c; k++) { const j = E.near[k]; if (E.kind[j] !== E.kind[i] || (E.flags[j] & F.DEAD)) continue; if (E.town[j] >= 0 && sim.towns[E.town[j]].alive && !(E.flags[i] & F.SETTLER)) { U.joinTown(sim, i, sim.towns[E.town[j]]); return; } if (E.town[j] < 0) band++; }
    const age = sim.tick - (E.nomadSince ? 0 : 0);
    if (band >= 2 && !(W.owner[t]) && U.siteQuality(sim, x, y) > 0.55 && sim.rng.chance(E.flags[i] & F.SETTLER ? 0.5 : 0.12)) { let far = true; for (const tw of sim.towns) if (tw.alive && Math.abs(tw.cx - x) + Math.abs(tw.cy - y) < 30) far = false;
      if (far) { const town = T.found(sim, E.kind[i], x, y, (E.flags[i] & F.SETTLER) ? E.kingdom[i] : null, i); if (town) { const c2 = E.query(x, y, 14); for (let k = 0; k < c2; k++) { const j = E.near[k]; if (E.kind[j] === E.kind[i] && E.town[j] < 0 && !(E.flags[j] & F.DEAD)) U.joinTown(sim, j, town); } return; } } }
    // wander, biased toward land the people likes; settlers keep their heading
    let r = -1; if ((E.flags[i] & F.SETTLER) && E.tx[i] >= 0 && Math.abs(E.tx[i] - x) + Math.abs(E.ty[i] - y) > 6 && E.stuck[i] < 3) { if (begin(sim, i, ACT.WANDER, E.tx[i], E.ty[i])) return; }
    r = U.randomNear(sim, E.x[i], E.y[i], 12); if (r >= 0) begin(sim, i, ACT.WANDER, r % n, (r / n) | 0); };
  U.siteQuality = function (sim, x, y) { const W = sim.world, n = W.n; let good = 0, tot = 0; for (let dy = -6; dy <= 6; dy += 2) for (let dx = -6; dx <= 6; dx += 2) { const X = x + dx, Y = y + dy; tot++; if (!W.inb(X, Y)) continue; const t = Y * n + X, g = W.ground[t]; if (AL.gCost[g] > 0 && !W.owner[t] && !(W.flags[t] & 2)) good += 0.6 + AL.gFert[g] * 0.4; } return good / tot; };
  U.joinTown = function (sim, i, town) { const E = sim.E; E.town[i] = town.id; E.kingdom[i] = town.kingdom; E.flags[i] &= ~F.SETTLER; E.job[i] = 0; E.home[i] = -1; E.work[i] = -1; if (E.culture[i] < 0) E.culture[i] = town.culture; if (E.religion[i] < 0) E.religion[i] = town.religion; T.setLook(E, i); town.pop++; };
  // ------------------------------------------------------------ life cycle
  U.lifeTick = function (sim, i) { const E = sim.E, K = AL.KINDS[E.kind[i]], age = sim.tick - E.born[i], fl = E.flags[i];
    if (age >= E.life[i]) { E.kill(sim, i, 'age'); return; }
    const mat = (K.maturity || 16) * AL.YEAR; if (age < mat) { if (!(fl & F.CHILD)) { E.flags[i] |= F.CHILD; T.setLook(E, i); } } else if (fl & F.CHILD) { E.flags[i] &= ~F.CHILD; T.setLook(E, i); sim.emit('grownup', E.x[i], E.y[i]); }
    if (age > E.life[i] * 0.78 && !(fl & F.ELDER)) { E.flags[i] |= F.ELDER; if (!AL.JOBS[E.job[i]].military) T.setLook(E, i); }
    // births
    if (E.preg[i] >= 0 && sim.tick >= E.preg[i]) { E.preg[i] = -1; E.flags[i] &= ~F.PREGNANT; const town = sim.towns[E.town[i]]; if (town && town.alive) U.birth(sim, i, E.spouse[i], town); }
    else if (E.sex[i] === 1 && E.spouse[i] >= 0 && E.preg[i] < 0 && !(fl & (F.CHILD | F.ELDER)) && E.town[i] >= 0) { const town = sim.towns[E.town[i]], sp = E.spouse[i];
      if (!E.alive[sp] || (E.flags[sp] & F.DEAD)) { E.spouse[i] = -1; } else if (town.alive && town.pop < town.popCap && town.pop - town.adults < town.adults * 0.7 + 1 && town.stock[AL.RES.food] > town.pop * 1.5 && E.count < E.cap - 200) { const p = 0.06 * (K.fertility || 1) * E.mod(i, 'fertility') * (sim.fertMul || 1) * (town.pop < 12 ? 1.8 : 1); if (sim.rng.chance(p)) { E.preg[i] = sim.tick + 300; E.flags[i] |= F.PREGNANT; } } } };
  U.birth = function (sim, mother, father, town) { const E = sim.E, rng = sim.rng; const c = E.spawn(sim, E.kind[mother], E.x[mother], E.y[mother], { age: 0, town: town.id, kingdom: town.kingdom, mother, father, culture: E.culture[mother], religion: E.religion[mother], traits: [0, 0] }); if (c < 0) return -1;
    // inheritance: each parental inborn trait passes with 45%; 3% mutation adds a random inborn trait
    for (let t = 0; t < 48; t++) { const m = E.hasTrait(mother, t), f = father >= 0 && E.alive[father] ? E.hasTrait(father, t) : 0; if ((m && rng.chance(0.45)) || (f && rng.chance(0.45))) E.addTrait(c, t, true); } if (rng.chance(0.03 * (sim.mutMul || 1))) E.addTrait(c, rng.int(48), true); if (rng.chance(0.004 * (sim.mutMul || 1))) E.addTrait(c, AL.TRAIT.mutant, true);
    E.recalc(c); E.hp[c] = E.hpMax[c]; E.flags[c] |= F.CHILD; E.look[c] = AL.LOOK.child; E.home[c] = E.home[mother]; town.pop++; sim.stats.births++; sim.emit('birth', E.x[c], E.y[c]); return c; };
  // ------------------------------------------------------------ module
  AL.Sim.modules.push({
    name: 'units',
    init(sim) { sim.E = new AL.Ents(); sim.path = new AL.Path(sim.world); sim.stats = { births: 0, deaths: 0, starved: 0, killed: 0 }; },
    tick(sim) { const E = sim.E, tk = sim.tick; sim.pathBudget = 50; sim.fieldBudget = 1; if (sim.path.w.regionsDirty && false) { } E.rebuildHash(sim.world.n);
      const np = AL.NPEOPLE;
      for (let i = 0; i < E.hi; i++) { if (!E.alive[i]) continue; if (E.kind[i] >= np) continue; // creatures are ticked by their module
        if (E.flags[i] & F.DEAD) { if (--E.timer[i] <= 0) E.remove(i); continue; }
        // needs
        const asleep = E.flags[i] & F.ASLEEP; E.hunger[i] += asleep ? 0.1 : 0.2; if (!asleep) E.energy[i] -= 0.13; E.social[i] -= 0.04; E.faith[i] -= 0.015;
        if (E.hunger[i] >= 100) { E.hunger[i] = 100; E.hp[i] -= 0.15; if (E.hp[i] <= 0) { sim.stats.starved++; E.kill(sim, i, 'hunger'); continue; } } else if (E.hp[i] < E.hpMax[i] && E.hunger[i] < 60) E.hp[i] += 0.02;
        if (E.energy[i] < 0) E.energy[i] = 0; if (E.social[i] < 0) E.social[i] = 0; if (E.faith[i] < 0) E.faith[i] = 0;
        if (((i + tk) & 63) === 0) { U.lifeTick(sim, i); if (E.flags[i] & F.DEAD) continue; }
        if (E.flags[i] & F.CONTROLLED) { if (U.moving(E, i)) U.move(sim, i); else if (E.act[i] === ACT.NONE) E.anim[i] = AL.ANIM.idle; else U.act(sim, i); continue; }
        if (AL.War && AL.War.unitTick(sim, i)) continue;
        if (E.act[i] === ACT.FIGHT) U.act(sim, i);
        else if (U.moving(E, i)) { if (U.move(sim, i)) { /* arrived: act next tick */ } else if (!U.moving(E, i) && E.act[i] !== ACT.NONE && E.phase[i] === 0) { // path lost before arriving
            if ((E.x[i] | 0) !== E.tx[i] || (E.y[i] | 0) !== E.ty[i]) { const r = U.goTo(sim, i, E.tx[i], E.ty[i]); if (r === 0) { E.act[i] = ACT.NONE; E.cool[i] = 16; } } } }
        else if (E.act[i] !== ACT.NONE) U.act(sim, i);
        if (((i + tk) & 7) === 0 && E.act[i] === ACT.NONE && !(E.flags[i] & F.DEAD)) U.think(sim, i);
        else if (((i + tk) & 31) === 0 && AL.Creatures && E.act[i] !== ACT.FIGHT && E.act[i] !== ACT.FLEE && E.act[i] !== 255 && !(E.flags[i] & F.ASLEEP && false) && AL.Creatures.near(sim, i)) { U.stop(E, i); E.flags[i] &= ~F.ASLEEP; E.act[i] = ACT.NONE; E.cool[i] = 0; U.think(sim, i); }
        else if (((i + tk) & 31) === 0 && E.hunger[i] > 80 && (E.act[i] === ACT.WANDER || E.act[i] === ACT.SOCIAL || E.act[i] === ACT.GUARD || E.act[i] === ACT.WORK && E.phase[i] === 0)) { U.stop(E, i); E.act[i] = ACT.NONE; }
      } },
    onDeath(sim, i, cause) { const E = sim.E; if (E.kind[i] >= AL.NPEOPLE) return; sim.stats.deaths++; const town = sim.towns[E.town[i]]; if (town) town.pop = Math.max(0, town.pop - 1); const h = E.home[i]; if (h >= 0 && sim.B.occ[h] > 0) sim.B.occ[h]--; const w = E.work[i]; if (w >= 0 && sim.B.workers[w] > 0) sim.B.workers[w]--; const sp = E.spouse[i]; if (sp >= 0 && E.spouse[sp] === i) E.spouse[sp] = -1; sim.emit('death', E.x[i], E.y[i], E.kind[i], cause === 'age' ? 0 : cause === 'hunger' ? 1 : 2); },
    command(sim, m) { if (m.t === 'spawn') { const W = sim.world, n = W.n, k = AL.K[m.kind]; if (k == null) return true; for (let c = 0; c < (m.count || 1); c++) { const x = m.x + (c ? sim.rng.range(-1.5, 1.5) : 0), y = m.y + (c ? sim.rng.range(-1.5, 1.5) : 0); if (!W.inb(x | 0, y | 0)) continue; const t = (y | 0) * n + (x | 0); const K = AL.KINDS[k]; if (K.cls === 0 && (AL.gCost[W.ground[t]] <= 0 || (W.flags[t] & 2))) continue; if (AL.Creatures && K.cls !== 0) { AL.Creatures.spawn(sim, k, x, y); continue; } const i = sim.E.spawn(sim, k, x, y, {}); if (i >= 0) { const tid = W.owner[t] - 1, town = sim.towns[tid]; if (town && town.alive && town.people === k) U.joinTown(sim, i, town); sim.emit('spawn', x, y, k); } } return true; } },
    snapshot(sim) { const E = sim.E, n = E.hi; if (!n) return { t: 'ents', n: 0 }; const fr = new Uint8Array(n);
      const m = { t: 'ents', n, tick: sim.tick, x: E.x.slice(0, n), y: E.y.slice(0, n), alive: E.alive.slice(0, n), kind: E.kind.slice(0, n), look: E.look.slice(0, n), anim: E.anim.slice(0, n), dir: E.dir.slice(0, n), flags: E.flags.slice(0, n), gen: E.gen.slice(0, n), kd: E.kingdom.slice(0, n), tw: E.town.slice(0, n), hp: fr, carry: E.carryN.slice(0, n) };
      for (let i = 0; i < n; i++) fr[i] = E.hpMax[i] > 0 ? Math.max(0, Math.min(255, 255 * E.hp[i] / E.hpMax[i])) : 0; m._tr = [m.x.buffer, m.y.buffer, m.alive.buffer, m.kind.buffer, m.look.buffer, m.anim.buffer, m.dir.buffer, m.flags.buffer, m.gen.buffer, m.kd.buffer, m.tw.buffer, m.hp.buffer, m.carry.buffer]; return m; },
  });
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));

// AL.Creatures — animals and monsters (same entity store as people), the ecosystem (grazing, hunting, breeding, flora growth)
// and AL.Fight, the shared melee/ranged resolution used by people, animals and monsters.
(function (AL) {
  'use strict';
  const C = AL.Creatures = {}, U = AL.Units, F = AL.Ents.F, ACT = U.ACT, Fi = AL.Fight = {};
  const CA = C.ACT = { IDLE: 0, WANDER: 1, GRAZE: 30, FLEE: 31, CHASE: 32, ATTACK: 33, SLEEP: 34 };
  ACT.HUNT = 19;
  // ------------------------------------------------------------ fight
  // a hits t. cause: 'fight' | 'zombie' | 'hunt' | 'beast'
  Fi.hit = function (sim, a, t, dmg, cause) { const E = sim.E; if (!E.alive[t] || (E.flags[t] & F.DEAD)) return false; const np = AL.NPEOPLE;
    if (E.kind[t] < np) { const town = sim.towns[E.town[t]]; if (town && town.stock[AL.RES.armor] > 0 && AL.JOBS[E.job[t]].military) dmg *= 0.7; }
    E.hp[t] -= dmg; sim.emit('hit', E.x[t], E.y[t], t, dmg | 0); if (E.act[t] !== 255 && E.kind[t] >= np && E.act[t] !== CA.ATTACK) { E.tE[t] = a; if (AL.KINDS[E.kind[t]].courage > 0.4) { E.act[t] = CA.CHASE; U.stop(E, t); } else E.act[t] = CA.IDLE; }
    if (E.hp[t] > 0) return false;
    E.kill(sim, t, cause); sim.stats.killed++; if (a >= 0 && E.alive[a]) { E.kills[a]++; const Ka = AL.KINDS[E.kind[a]], Kt = AL.KINDS[E.kind[t]];
      if (E.kind[a] < np && Kt.cls === 1) { E.carry[a] = AL.RES.food; E.carryN[a] = Kt.meat || 2; }           // a hunter brings the meat home
      else if (Ka.cls === 1 && Ka.diet === 'pred') { E.hunger[a] = 0; E.act[a] = CA.GRAZE; E.timer[a] = 0; } }  // a predator eats on the spot
    if (cause === 'zombie' && E.kind[t] < np) C.rise.push(E.x[t], E.y[t]);
    return true; };
  C.rise = [];
  // pursuit without path search: walk straight at the target while the next tile is free. Returns false when blocked.
  U.steer = function (sim, i, tx, ty) { const E = sim.E, W = sim.world, n = W.n, dx = tx - E.x[i], dy = ty - E.y[i], d = Math.sqrt(dx * dx + dy * dy); if (d < 0.01) return true; const here = (E.y[i] | 0) * n + (E.x[i] | 0), sp = Math.min(d, E.spd[i] / (AL.gCost[W.ground[here]] || 1.5));
    let nx = E.x[i] + dx / d * sp, ny = E.y[i] + dy / d * sp, t = (ny | 0) * n + (nx | 0);
    if (t !== here && (AL.gCost[W.ground[t]] <= 0 || (W.flags[t] & 2))) { // slide along one axis
      const tx1 = (E.y[i] | 0) * n + (nx | 0), ty1 = (ny | 0) * n + (E.x[i] | 0); if (Math.abs(dx) > 0.2 && AL.gCost[W.ground[tx1]] > 0 && !(W.flags[tx1] & 2)) ny = E.y[i]; else if (Math.abs(dy) > 0.2 && AL.gCost[W.ground[ty1]] > 0 && !(W.flags[ty1] & 2)) nx = E.x[i]; else return false; }
    E.x[i] = nx; E.y[i] = ny; E.dir[i] = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 1) : (dy > 0 ? 0 : 2); return true; };
  const dist2 = (E, a, b) => { const dx = E.x[a] - E.x[b], dy = E.y[a] - E.y[b]; return dx * dx + dy * dy; };
  C.hostileTo = function (sim, a, t) { const E = sim.E, Ka = AL.KINDS[E.kind[a]]; return Ka.cls === 2 || ((E.act[a] === CA.CHASE || E.act[a] === CA.ATTACK) && E.tE[a] === t); };
  // people: react to a nearby danger. Returns true when the unit now flees or fights.
  C.threat = function (sim, i) { const E = sim.E, n = sim.world.n, c = E.query(E.x[i], E.y[i], 6), np = AL.NPEOPLE; let h = -1, bd = 1e9; for (let k = 0; k < c; k++) { const j = E.near[k]; if (E.kind[j] < np || (E.flags[j] & F.DEAD)) continue; const K = AL.KINDS[E.kind[j]];
      if (!(K.cls === 2 || ((E.act[j] === CA.CHASE || E.act[j] === CA.ATTACK) && E.tE[j] >= 0 && E.kind[E.tE[j]] < np))) continue; const d = dist2(E, i, j); if (d < bd) { bd = d; h = j; } }
    if (h < 0) return false; const mil = AL.JOBS[E.job[i]].military || AL.JOBS[E.job[i]].name === 'hunter';
    if (!(E.flags[i] & (F.CHILD | F.ELDER)) && (mil || E.courage[i] > 0.72 || (bd < 2.5 && E.courage[i] > 0.45))) { U.stop(E, i); E.act[i] = ACT.FIGHT; E.tE[i] = h; E.phase[i] = 1; E.timer[i] = 0; return true; }
    const town = sim.towns[E.town[i]]; let tx, ty; const dx = E.x[i] - E.x[h], dy = E.y[i] - E.y[h], l = Math.sqrt(dx * dx + dy * dy) || 1;
    if (town && town.alive && Math.abs(town.cx - E.x[h]) + Math.abs(town.cy - E.y[h]) > 6) { tx = town.cx; ty = town.cy; } else { const t = U.randomNear(sim, E.x[i] + dx / l * 8, E.y[i] + dy / l * 8, 3); if (t < 0) return false; tx = t % n; ty = (t / n) | 0; }
    if (U.begin(sim, i, ACT.FLEE, tx, ty)) { E.flags[i] |= F.FLEEING; E.mood[i] = Math.max(0, E.mood[i] - 3); return true; } return false; };
  // cheap check: is something hostile within 4 tiles of this person?
  C.near = function (sim, i) { const E = sim.E, c = E.query(E.x[i], E.y[i], 4), np = AL.NPEOPLE; for (let k = 0; k < c; k++) { const j = E.near[k]; if (E.kind[j] < np || (E.flags[j] & F.DEAD)) continue; if (AL.KINDS[E.kind[j]].cls === 2 || ((E.act[j] === CA.CHASE || E.act[j] === CA.ATTACK) && E.tE[j] >= 0 && E.kind[E.tE[j]] < np)) return true; } return false; };
  // hunters and herders: find game around the town
  C.startHunt = function (sim, i, town, task) { const E = sim.E, c = E.query(E.x[i], E.y[i], 16), np = AL.NPEOPLE; let best = -1, bd = 1e9; for (let k = 0; k < c; k++) { const j = E.near[k]; if (E.kind[j] < np || (E.flags[j] & F.DEAD)) continue; const K = AL.KINDS[E.kind[j]]; if (K.cls !== 1 || K.fly || K.swim || K.diet === 'pred') continue; const d = dist2(E, i, j); if (d < bd) { bd = d; best = j; } }
    if (best < 0) return false; E.act[i] = ACT.FIGHT; E.tE[i] = best; E.phase[i] = 1; E.timer[i] = 0; return true; };
  // executors for the people actions owned by this module (called from Units.act)
  AL.UnitsExtra = function (sim, i, a, tm) { const E = sim.E, n = sim.world.n;
    if (a === ACT.FLEE) { E.flags[i] &= ~F.FLEEING; E.act[i] = ACT.NONE; E.cool[i] = 8; return true; }
    if (a === ACT.FIGHT) { const t = E.tE[i]; if (t < 0 || !E.alive[t] || (E.flags[t] & F.DEAD)) { E.act[i] = ACT.NONE; E.tE[i] = -1; return true; } const job = AL.JOBS[E.job[i]], ranged = job.ranged || job.name === 'hunter', r = ranged ? 5.5 : 1.5, d2 = dist2(E, i, t);
      if (d2 > 24 * 24 || E.hunger[i] > 92) { E.act[i] = ACT.NONE; E.tE[i] = -1; return true; }
      if (d2 > r * r) { E.anim[i] = AL.ANIM.walk; if (!U.steer(sim, i, E.x[t], E.y[t])) { if (++E.stuck[i] > 20) { E.stuck[i] = 0; E.act[i] = ACT.NONE; E.tE[i] = -1; E.cool[i] = 24; } } E.timer[i] = 0; return true; }
      U.stop(E, i); U.face(E, i, E.x[t], E.y[t]); E.anim[i] = AL.ANIM.attack; const cyc = tm % 14;
      if (cyc === 6) { const town = sim.towns[E.town[i]]; let dmg = E.atk[i] * (job.military ? 1.8 : 1) * (town && town.stock[AL.RES.weapons] > 0 ? 1.3 : 1) * (0.8 + sim.rng.f() * 0.4); if (ranged) sim.emit('arrow', E.x[i], E.y[i], E.x[t], E.y[t]); Fi.hit(sim, i, t, dmg, AL.KINDS[E.kind[t]].cls === 1 ? 'hunt' : 'fight'); }
      return true; }
    return false; };
  // ------------------------------------------------------------ spawning
  C.spawn = function (sim, kind, x, y, opt) { const W = sim.world, n = W.n, K = AL.KINDS[kind], t = (y | 0) * n + (x | 0), g = W.ground[t]; if (K.swim ? !AL.gWater[g] : (!K.fly && AL.gCost[g] <= 0)) return -1;
    const i = sim.E.spawn(sim, kind, x, y, opt || {}); if (i < 0) return -1; const E = sim.E; E.hunger[i] = 10 + sim.rng.f() * 30; E.act[i] = 0; E.anim[i] = K.fly ? AL.ANIM.fly : K.swim ? AL.ANIM.swim : 0; if (K.fly) E.flags[i] |= F.FLYING; if (K.swim) E.flags[i] |= F.SWIMMING; return i; };
  C.populate = function (sim, share) { const W = sim.world, n = W.n, rng = sim.rng, tries = Math.round(n * n / 150 * share); for (let k = 0; k < tries; k++) { const x = 3 + rng.int(n - 6), y = 3 + rng.int(n - 6), t = y * n + x, list = C.byGround[W.ground[t]]; if (!list || !list.length || W.owner[t]) continue; const kind = list[rng.int(list.length)], K = AL.KINDS[kind]; if (rng.f() > K.density) continue;
      const m = 1 + rng.int(K.herd); for (let j = 0; j < m; j++) C.spawn(sim, kind, x + rng.range(-2, 2), y + rng.range(-2, 2), null); } };
  // straight-line movement for flyers and swimmers; returns true on arrival
  function glide(sim, i, K) { const E = sim.E, W = sim.world, n = W.n, dx = E.tx[i] + 0.5 - E.x[i], dy = E.ty[i] + 0.5 - E.y[i], d = Math.sqrt(dx * dx + dy * dy), sp = E.spd[i]; if (d <= sp) { E.x[i] = E.tx[i] + 0.5; E.y[i] = E.ty[i] + 0.5; return true; }
    const nx = E.x[i] + dx / d * sp, ny = E.y[i] + dy / d * sp; if (K.swim && !AL.gWater[W.ground[(ny | 0) * n + (nx | 0)]]) return true; E.x[i] = nx; E.y[i] = ny; E.dir[i] = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 1) : (dy > 0 ? 0 : 2); return false; }
  function go(sim, i, K, tx, ty, act) { const E = sim.E, W = sim.world; if (!W.inb(tx, ty)) return false; if (K.fly || K.swim) { if (K.swim && !AL.gWater[W.ground[ty * W.n + tx]]) return false; E.tx[i] = tx; E.ty[i] = ty; E.act[i] = act; E.phase[i] = 0; E.timer[i] = 0; return true; }
    const r = U.goTo(sim, i, tx, ty); if (r <= 0) { E.cool[i] = 16; return false; } E.act[i] = act; E.phase[i] = r === 1 ? 1 : 0; E.timer[i] = 0; return true; }
  function wander(sim, i, K, r) { const E = sim.E, W = sim.world, n = W.n, rng = sim.rng; if (K.fly || K.swim) { for (let k = 0; k < 6; k++) { const X = (E.x[i] + rng.range(-r, r)) | 0, Y = (E.y[i] + rng.range(-r, r)) | 0; if (W.inb(X, Y) && go(sim, i, K, X, Y, CA.WANDER)) return true; } return false; }
    // herd animals drift toward one of their kind
    let cx = E.x[i], cy = E.y[i]; if (K.herd > 1 && rng.chance(0.5)) { const c = E.query(cx, cy, 9); for (let k = 0; k < c; k++) { const j = E.near[(k + (rng.int(c))) % c]; if (j !== i && E.kind[j] === E.kind[i]) { cx = (cx + E.x[j]) / 2; cy = (cy + E.y[j]) / 2; break; } } }
    const t = U.randomNear(sim, cx, cy, r); return t >= 0 && go(sim, i, K, t % n, (t / n) | 0, CA.WANDER); }
  // ------------------------------------------------------------ thinking
  C.think = function (sim, i, K) { const E = sim.E, W = sim.world, n = W.n, rng = sim.rng, np = AL.NPEOPLE, x = E.x[i], y = E.y[i]; if (E.cool[i] > 0) { E.cool[i] = E.cool[i] > 16 ? E.cool[i] - 16 : 0; return; }
    const hostile = K.cls === 2, pred = K.diet === 'pred';
    if (hostile || (pred && E.hunger[i] > 45)) { // look for a victim
      const c = E.query(x, y, hostile ? 13 : 11); let best = -1, bd = 1e9; for (let k = 0; k < c; k++) { const j = E.near[k]; if (j === i || (E.flags[j] & F.DEAD)) continue; const Kj = AL.KINDS[E.kind[j]]; let ok;
        if (hostile) ok = Kj.cls === 0 || (Kj.cls === 1 && K.fire); else ok = (Kj.cls === 1 && Kj.diet !== 'pred' && (K.fly ? Kj.size <= 16 : !Kj.fly && !Kj.swim || (K.fly && Kj.swim))) || (Kj.cls === 0 && E.hunger[i] > 82 && !K.fly);
        if (!ok) continue; const d = dist2(E, i, j) * (Kj.cls === 0 && !hostile ? 3 : 1); if (d < bd) { bd = d; best = j; } }
      if (best >= 0) { E.tE[i] = best; E.act[i] = CA.CHASE; E.timer[i] = 0; U.stop(E, i); return; } }
    if (K.cls === 1 && !pred) { // prey: run from hunters and predators
      const c = E.query(x, y, 5); for (let k = 0; k < c; k++) { const j = E.near[k]; if (j === i || (E.flags[j] & F.DEAD)) continue; const Kj = AL.KINDS[E.kind[j]]; if (!(Kj.cls === 2 || Kj.diet === 'pred' && !Kj.fly || (Kj.cls === 0 && (E.act[j] === ACT.FIGHT) && E.tE[j] >= 0 && E.kind[E.tE[j]] >= np))) continue;
        if (K.courage > 0.5 && Kj.cls !== 2 && rng.chance(0.5)) { E.tE[i] = j; E.act[i] = CA.CHASE; E.timer[i] = 0; return; }
        const dx = x - E.x[j], dy = y - E.y[j], l = Math.sqrt(dx * dx + dy * dy) || 1; let t = -1; if (K.swim) { if (go(sim, i, K, (x + dx / l * 6) | 0, (y + dy / l * 6) | 0, CA.FLEE)) return; } else t = U.randomNear(sim, x + dx / l * 9, y + dy / l * 9, 3); if (t >= 0 && go(sim, i, K, t % n, (t / n) | 0, CA.FLEE)) { E.spd[i] = 0.22 * K.speed * 1.5; return; } break; }
      if (E.hunger[i] > 35) { const t = (y | 0) * n + (x | 0), g = W.ground[t]; if (K.swim || AL.gFert[g] > 0.25 || W.feature[t]) { E.act[i] = CA.GRAZE; E.timer[i] = 0; return; } } }
    if (U.isNight(sim) && !K.swim && !hostile && rng.chance(0.6)) { E.act[i] = CA.SLEEP; E.timer[i] = 0; return; }
    if (rng.chance(0.55)) wander(sim, i, K, hostile ? 14 : K.fly ? 16 : 7); else { E.act[i] = CA.IDLE; E.cool[i] = 16 + rng.int(40); } };
  // ------------------------------------------------------------ acting
  C.act = function (sim, i, K) { const E = sim.E, W = sim.world, n = W.n, A = AL.ANIM, a = E.act[i], tm = ++E.timer[i], rest = K.fly ? A.fly : K.swim ? A.swim : A.idle;
    if (a === CA.IDLE) { E.anim[i] = rest; return; }
    if (a === CA.WANDER || a === CA.FLEE) { E.act[i] = CA.IDLE; E.spd[i] = 0.22 * K.speed; E.anim[i] = rest; return; }
    if (a === CA.GRAZE) { E.anim[i] = K.swim ? A.swim : K.fly ? A.idle : A.eat; if (tm > 36) { E.hunger[i] = Math.max(0, E.hunger[i] - 45); E.act[i] = CA.IDLE; const t = (E.y[i] | 0) * n + (E.x[i] | 0); if (W.feature[t] === AL.F.grasstuft && sim.rng.chance(0.3)) { W.feature[t] = 0; W.mark(t % n, (t / n) | 0); } } return; }
    if (a === CA.SLEEP) { E.anim[i] = K.fly ? A.idle : A.sleep; if (tm > 200 || !U.isNight(sim)) E.act[i] = CA.IDLE; return; }
    if (a === CA.CHASE || a === CA.ATTACK) { const t = E.tE[i]; if (t < 0 || !E.alive[t] || (E.flags[t] & F.DEAD)) { E.act[i] = CA.IDLE; E.tE[i] = -1; E.spd[i] = 0.22 * K.speed; return; } const d2 = dist2(E, i, t);
      if (a === CA.CHASE) { if (d2 > 20 * 20 || tm > 400) { E.act[i] = CA.IDLE; E.tE[i] = -1; E.cool[i] = 32; E.spd[i] = 0.22 * K.speed; return; }
        if (d2 <= 1.7 * 1.7) { U.stop(E, i); E.act[i] = CA.ATTACK; E.timer[i] = 0; return; } E.spd[i] = 0.22 * K.speed * (K.cls === 1 ? 1.6 : 1); E.anim[i] = K.fly ? A.fly : K.cls === 1 ? A.run : A.walk;
        if (K.fly) { E.tx[i] = E.x[t] | 0; E.ty[i] = E.y[t] | 0; glide(sim, i, K); } else if (!U.steer(sim, i, E.x[t], E.y[t])) { if (++E.stuck[i] > 25) { E.stuck[i] = 0; E.act[i] = CA.IDLE; E.tE[i] = -1; E.cool[i] = 64; } } return; }
      // attack: frames 0-1 are the warning gesture, the blow lands at tick 7
      U.face(E, i, E.x[t], E.y[t]); E.anim[i] = A.attack; if (tm === 7 && d2 <= 2.4 * 2.4) Fi.hit(sim, i, t, E.atk[i] * (0.8 + sim.rng.f() * 0.4), K.contagion ? 'zombie' : K.cls === 2 ? 'fight' : 'beast'); if (tm >= 14) { if (E.act[i] === CA.ATTACK) { E.act[i] = CA.CHASE; E.timer[i] = 0; } } return; }
    E.act[i] = CA.IDLE; };
  C.life = function (sim, i, K) { const E = sim.E, age = sim.tick - E.born[i], rng = sim.rng; if (age >= E.life[i]) { E.kill(sim, i, 'age'); return; } if (K.cls !== 1) return;
    if (E.sex[i] === 1 && E.hunger[i] < 55 && age > E.life[i] * 0.15 && sim.nAnimals < sim.animalCap && rng.chance(0.05 * K.fertility)) { const c = E.query(E.x[i], E.y[i], 12); let same = 0, male = false; for (let k = 0; k < c; k++) { const j = E.near[k]; if (E.kind[j] === E.kind[i] && !(E.flags[j] & F.DEAD)) { same++; if (E.sex[j] === 0) male = true; } }
      if (male && same < K.herd * 2 + 3) { const b = C.spawn(sim, E.kind[i], E.x[i], E.y[i], { age: 0 }); if (b >= 0) sim.emit('cub', E.x[i], E.y[i]); } } };
  // ------------------------------------------------------------ module
  AL.Sim.modules.push({
    name: 'creatures',
    init(sim) { C.byGround = AL.GROUND.map(g => AL.KINDS.filter(K => K.cls === 1 && K.biomes && K.biomes.includes(g.name)).map(K => K.kid)); sim.nAnimals = 0; sim.animalCap = Math.round(sim.world.n * sim.world.n / 70); C.rise.length = 0; if (!sim.cfg.noFauna && !sim.cfg.empty) C.populate(sim, 1); },
    tick(sim) { const E = sim.E, tk = sim.tick, np = AL.NPEOPLE; let na = 0;
      for (let i = 0; i < E.hi; i++) { if (!E.alive[i] || E.kind[i] < np) continue; if (E.flags[i] & F.DEAD) { if (--E.timer[i] <= 0) E.remove(i); continue; } const K = AL.KINDS[E.kind[i]]; if (K.cls === 1) na++;
        E.hunger[i] += K.cls === 2 ? 0 : K.diet === 'pred' ? 0.022 : 0.06; if (K.diet === 'pred' && E.hunger[i] > 92 && ((i + tk) & 255) === 0 && sim.rng.chance(0.5)) E.hunger[i] -= 35; // mice, carrion
        if (E.hunger[i] >= 100) { E.hunger[i] = 100; E.hp[i] -= 0.1; if (E.hp[i] <= 0) { E.kill(sim, i, 'hunger'); continue; } } else if (E.hp[i] < E.hpMax[i]) E.hp[i] += 0.01;
        if (((i + tk) & 127) === 0) { C.life(sim, i, K); if (E.flags[i] & F.DEAD) continue; }
        if (E.flags[i] & F.CONTROLLED) { if (U.moving(E, i)) U.move(sim, i); else if (E.act[i] === CA.ATTACK) C.act(sim, i, K); else E.anim[i] = AL.ANIM.idle; continue; }
        const a = E.act[i];
        if (a === CA.CHASE || a === CA.ATTACK) C.act(sim, i, K);
        else if ((K.fly || K.swim) && (a === CA.WANDER || a === CA.FLEE) && E.phase[i] === 0) { E.anim[i] = K.fly ? AL.ANIM.fly : AL.ANIM.swim; if (glide(sim, i, K)) E.phase[i] = 1; }
        else if (U.moving(E, i)) { U.move(sim, i); if (a === CA.FLEE) E.anim[i] = AL.ANIM.run; }
        else if (a !== CA.IDLE) C.act(sim, i, K); else E.anim[i] = K.fly ? AL.ANIM.fly : K.swim ? AL.ANIM.swim : AL.ANIM.idle;
        if (((i + tk) & 15) === 0 && (E.act[i] === CA.IDLE || (E.act[i] === CA.WANDER && K.cls !== 1) || E.act[i] === CA.GRAZE && K.cls === 1 && K.diet !== 'pred' && false)) C.think(sim, i, K);
        else if (((i + tk) & 31) === 0 && K.cls === 1 && K.diet !== 'pred' && (E.act[i] === CA.WANDER || E.act[i] === CA.GRAZE || E.act[i] === CA.SLEEP)) { const c = E.query(E.x[i], E.y[i], 4); for (let k = 0; k < c; k++) { const j = E.near[k], Kj = AL.KINDS[E.kind[j]]; if (j !== i && (Kj.cls === 2 || (Kj.diet === 'pred' && !Kj.fly) || (Kj.cls === 0 && E.act[j] === ACT.FIGHT && E.tE[j] === i))) { U.stop(E, i); E.act[i] = CA.IDLE; E.cool[i] = 0; C.think(sim, i, K); break; } } } }
      sim.nAnimals = na;
      // the dead bitten by zombies rise again
      if (C.rise.length) { const zk = AL.K.zombie; for (let k = 0; k < C.rise.length; k += 2) if (zk != null) { const z = C.spawn(sim, zk, C.rise[k], C.rise[k + 1], { age: 0.2 }); if (z >= 0) sim.emit('rise', C.rise[k], C.rise[k + 1]); } C.rise.length = 0; }
      // wildlife wanders in from the wild when the world gets empty
      if (tk % 900 === 0 && na < sim.animalCap * 0.25 && !sim.cfg.noFauna && !sim.cfg.empty) C.populate(sim, 0.12); },
    // flora: saplings grow, forests spread and come back from stumps, meadows regrow
    tile(sim, i, x, y, g) { const W = sim.world, f = W.feature[i], rng = sim.rng; if (W.fire[i]) return;
      if (!f) { if (AL.gFert[g] > 0.3 && !(W.flags[i] & 10) && rng.chance(0.0015)) { const fb = AL.floraByBiome[g]; if (fb.small.length) { W.feature[i] = fb.small[rng.int(fb.small.length)]; W.fgrow[i] = 255; W.mark(x, y); } } return; }
      const k = AL.fKind[f]; if (k === 1) { const v = W.fgrow[i]; if (v < 255) { const nv = Math.min(255, v + 2 + ((AL.FLORA[f].grow * 4 * (sim.growMul || 1)) | 0)); W.fgrow[i] = nv; if ((v < 70 && nv >= 70) || (v < 110 && nv >= 110)) W.mark(x, y); }
        else if (rng.chance(0.003)) { const n = W.n, X = x + rng.int(5) - 2, Y = y + rng.int(5) - 2; if (W.inb(X, Y)) { const j = Y * n + X, gj = W.ground[j]; if (!W.feature[j] && !(W.flags[j] & 10) && AL.gFert[gj] > 0.3 && AL.floraByBiome[gj].trees.includes(f) && W.road[j] < 60) { let near = 0; for (let d = 0; d < 4; d++) { const q = j + (d === 0 ? 1 : d === 1 ? -1 : d === 2 ? n : -n); if (q >= 0 && q < n * n && AL.fKind[W.feature[q]] === 1) near++; } if (near < 3) { W.feature[j] = f; W.fgrow[j] = 8; W.mark(X, Y); } } } } }
      else if (f === AL.F.stump && rng.chance(0.03)) { const fb = AL.floraByBiome[g]; if (fb.trees.length && rng.chance(0.55) && !(W.flags[i] & 10) && W.road[i] < 60) { W.feature[i] = fb.trees[rng.int(fb.trees.length)]; W.fgrow[i] = 8; } else W.feature[i] = 0; W.mark(x, y); } },
    query(sim, m) { if (m.q === 'census') { const E = sim.E, c = {}; for (let i = 0; i < E.hi; i++) if (E.alive[i] && !(E.flags[i] & F.DEAD)) { const k = AL.KINDS[E.kind[i]].name; c[k] = (c[k] || 0) + 1; } return c; } },
    onDeath(sim, i, cause) { const E = sim.E; if (E.kind[i] >= AL.NPEOPLE) sim.emit('death', E.x[i], E.y[i], E.kind[i], 2); },
  });
})(typeof self !== 'undefined' ? (self.AL = self.AL || {}) : (globalThis.AL = globalThis.AL || {}));

module.exports=globalThis.AL;
