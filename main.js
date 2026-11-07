import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const canvas=document.querySelector('#game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9caeae);scene.fog=new THREE.FogExp2(0x9caeae,.00082);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,900);
scene.add(new THREE.HemisphereLight(0xc9e4ee,0x35403b,2.1));
const sun=new THREE.DirectionalLight(0xffddb0,3.2);sun.position.set(-90,125,65);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-160;sun.shadow.camera.right=160;sun.shadow.camera.top=160;sun.shadow.camera.bottom=-160;sun.shadow.bias=-.00015;scene.add(sun);
const fill=new THREE.DirectionalLight(0x7ac4c3,.65);fill.position.set(80,40,-90);scene.add(fill);
const mat=(color,rough=.8,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const boxGeo=new THREE.BoxGeometry(1,1,1),sphereGeo=new THREE.SphereGeometry(1,12,10);
function box(parent,x,y,z,sx,sy,sz,material,cast=false,receive=true){const m=new THREE.Mesh(boxGeo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=cast;m.receiveShadow=receive;parent.add(m);return m}
function sphere(parent,x,y,z,r,material){const m=new THREE.Mesh(sphereGeo,material);m.position.set(x,y,z);m.scale.set(r,r,r);parent.add(m);return m}
function cylinder(parent,x,y,z,r,h,material,segments=12){const m=new THREE.Mesh(new THREE.CylinderGeometry(r*.83,r,h,segments),material);m.position.set(x,y,z);parent.add(m);return m}
const world=new THREE.Group();scene.add(world);
const asphalt=mat(0x252c2d),sidewalk=mat(0x858681),concrete=mat(0x65706b),dark=mat(0x182122,.55),glass=new THREE.MeshStandardMaterial({color:0x78a6a8,roughness:.22,metalness:.45,emissive:0x152729,emissiveIntensity:.3}),neon=new THREE.MeshStandardMaterial({color:0xc9ef75,emissive:0x9fca3c,emissiveIntensity:1.6}),redNeon=new THREE.MeshStandardMaterial({color:0xf07862,emissive:0xc54439,emissiveIntensity:1.5});
box(world,0,-.52,0,410,1,410,mat(0x697f78));box(world,0,-.34,195,410,.4,35,mat(0x397d82));
const roadPositions=[];for(let p=-175;p<=175;p+=50)roadPositions.push(p);
for(const p of roadPositions){box(world,p,.015,0,8,.08,360,asphalt);box(world,0,.016,p,360,.08,8,asphalt);box(world,p-5,.05,0,2,.15,360,sidewalk);box(world,p+5,.05,0,2,.15,360,sidewalk);box(world,0,.05,p-5,360,.15,2,sidewalk);box(world,0,.05,p+5,360,.15,2,sidewalk);for(let n=-170;n<175;n+=12){box(world,p,.07,n,.11,.025,4,mat(0xd4cfae));box(world,n,.07,p,4,.025,.11,mat(0xd4cfae));}}
let seed=74129;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}function range(a,b){return a+(b-a)*rand()}
const buildingMats=[0x49585a,0x646b68,0x7b786e,0x475357,0x8c8779,0x385158,0x6a7470].map(c=>mat(c,.72,.12));
const windowMat=new THREE.MeshStandardMaterial({color:0xe9d395,emissive:0xc29550,emissiveIntensity:.36,roughness:.38}),colliders=[];
// Neighborhoods: glass downtown, low-rise old town, workshops and a coastal strip.
for(let ix=0;ix<7;ix++)for(let iz=0;iz<7;iz++){
  const bx=-150+ix*50,bz=-150+iz*50,downtown=Math.hypot(bx+20,bz+20)<95;
  const district=ix<2?'old':iz>4?'beach':ix>4?'industrial':'central';
  const count=Math.floor(range(1,3)+(downtown?1:0));
  for(let j=0;j<count;j++){
    const w=range(downtown?13:15,downtown?23:27),d=range(13,25),x=bx+range(-9,9),z=bz+range(-9,9);
    let h=range(13,downtown?61:34);if(district==='industrial')h*=.7;if(district==='beach')h=Math.min(h,23);
    const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
    const facade=buildingMats[Math.floor(rand()*buildingMats.length)];
    box(g,0,h/2,0,w,h,d,facade,true);colliders.push({x,z,w,d,h});
    const floors=Math.floor(h/3.5),cols=Math.max(2,Math.floor(w/3.2));
    for(let f=1;f<floors;f++)for(let c=0;c<cols;c++){
      if(rand()<.13)continue;const wx=-w/2+(c+.5)*w/cols;
      box(g,wx,f*3.35,d/2+.02,w/cols*.53,1.35,.04,rand()<.13?windowMat:glass);
      if(rand()<.65)box(g,wx,f*3.35,-d/2-.02,w/cols*.53,1.35,.04,glass);
    }
    if(downtown&&h>38){box(g,0,h+.5,0,w*.38,1.1,d*.4,mat(0x364346),true);box(g,0,h+1.12,0,w*.22,.12,d*.22,neon);}
    if(district==='beach'&&j===0)box(g,0,h+.5,0,w*.8,.5,d*.75,mat(0xc3b08a));
    box(g,0,3.2,d/2+.65,w*.6,.22,1.2,j%2?redNeon:neon);
    if(rand()<.35)box(g,w*.38,4,d/2+.08,1.1,3,.12,district==='old'?redNeon:neon);
  }
  if(rand()<.55){
    box(world,bx,.24,bz,8,.35,8,mat(0x65786b));
    for(let k=0;k<4;k++){const tx=bx+range(-2.8,2.8),tz=bz+range(-2.8,2.8);cylinder(world,tx,2.2,tz,.25,4,mat(0x665342));
      for(let q=0;q<5;q++){const a=q*1.25,leaf=box(world,tx+Math.cos(a)*1.5,4.2+Math.sin(a*.7)*.4,tz+Math.sin(a)*1.5,.23,.2,2.2,mat(0x3e7054));leaf.rotation.y=a;leaf.rotation.z=-.22;}
    }
  }
}

// Playable district systems
const $=id=>document.getElementById(id), ui={start:$('start-screen'),pause:$('pause-overlay'),startBtn:$('start-button'),resume:$('resume-button'),mission:$('mission-count'),progress:$('progress-fill'),health:$('health-value'),healthBar:$('health-bar'),ammo:$('ammo'),vehicleHud:$('vehicle-hud'),speed:$('speed-value'),interaction:$('interaction'),crosshair:$('crosshair'),cover:$('cover-indicator'),toast:$('toast'),district:$('district-name')};
const player=new THREE.Group();world.add(player);player.position.set(23,0,29.5);
const skin=mat(0xb77f62), jacket=mat(0x293d42), pants=mat(0x202c30), boots=mat(0x14191a), gunMat=mat(0x161b1d,.35,.55);
box(player,0,1.05,0,.68,.78,.38,jacket,true);sphere(player,0,1.67,0,.25,skin);box(player,0,1.82,-.015,.48,.12,.43,mat(0x172326));
for(const side of [-1,1]){box(player,side*.19,.48,0,.22,.68,.28,pants,true);box(player,side*.19,.13,.06,.24,.2,.4,boots);box(player,side*.43,1.08,-.04,.18,.62,.2,jacket);}
box(player,.22,1.06,-.31,.13,.12,.52,gunMat);player.rotation.y=Math.PI;
const cameraTarget=new THREE.Vector3(),cameraOffset=new THREE.Vector3();let yaw=0,pitch=.12,started=false,paused=false,covering=false,health=100,ammo=18,reloading=false,inVehicle=null,toastTimer=0,shotCooldown=0;
const keys={};
function showToast(message){ui.toast.textContent=message;ui.toast.classList.add('show');toastTimer=2.2;}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
function blocked(x,z,r=.65){if(Math.abs(x)>196||Math.abs(z)>190)return true;for(const c of colliders){if(Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.d/2+r)return true;}return false;}
function moveEntity(obj,dx,dz,r=.65){const nx=obj.position.x+dx,nz=obj.position.z+dz;if(!blocked(nx,obj.position.z,r))obj.position.x=nx;if(!blocked(obj.position.x,nz,r))obj.position.z=nz;}

// Collectible surveillance beacons mark the small open-world activity.
const drones=[],droneMat=new THREE.MeshStandardMaterial({color:0x9fe5d6,emissive:0x3aa98f,emissiveIntensity:1.6,metalness:.65,roughness:.25});
for(let i=0;i<5;i++){const drone=new THREE.Group();const x=[-100,100,-150,150,0][i],z=[-100,-100,100,100,150][i];drone.position.set(x,5,z);world.add(drone);box(drone,0,0,0,1.05,.25,.72,gunMat);sphere(drone,0,.2,0,.2,droneMat);for(const side of [-1,1])for(const forward of [-1,1]){const arm=box(drone,side*.72,0,forward*.48,.6,.06,.06,gunMat);const rotor=cylinder(drone,side*1.03,.12,forward*.48,.19,.04,droneMat);rotor.rotation.x=Math.PI/2;}drones.push({group:drone,found:false,phase:i});}
let found=0;

// Parked driveable cars and roaming traffic share the same lightweight vehicle mesh.
const vehicles=[];
function makeCar(x,z,color=0x9b443a,heading=0,parked=true){const car=new THREE.Group();world.add(car);car.position.set(x,0,z);car.rotation.y=heading;const paint=mat(color,.3,.5),tire=mat(0x171b1c,.9),windowGlass=mat(0x25383b,.22,.45);box(car,0,.62,0,2.1,.62,4.2,paint,true);box(car,0,1.13,-.15,1.65,.58,2.15,windowGlass);box(car,0,.46,1.68,1.8,.12,.08,mat(0xf4d79a,.3));box(car,0,.46,-1.68,1.8,.12,.08,redNeon);const wheels=[];for(const sx of [-1,1])for(const sz of [-1,1]){const wheel=cylinder(car,sx*1.05,.38,sz*1.32,.39,.2,tire,14);wheel.rotation.z=Math.PI/2;wheels.push(wheel);}vehicles.push({group:car,speed:0,parked,heading, wheels});return vehicles[vehicles.length-1];}
const parkedCars=[[23,29.5,0x356878], [-8,13,0x356878], [9,-14,0xb17b3d], [-13,64,0x8c3d42], [14,-66,0x536d50], [-65,13,0x737d80], [64,-14,0x344c73], [-115,13,0x9d542d], [114,-14,0x667c78]];
parkedCars.forEach(([x,z,c])=>makeCar(x,z,c,0,true));
for(let i=0;i<12;i++){const lane=i%2?3:-3,road=roadPositions[Math.floor(i/2)%roadPositions.length];const horizontal=i%4<2;const car=makeCar(horizontal?range(-165,165):road+lane,horizontal?road+lane:range(-165,165),[0,0x4c7580,0x857043,0x496b56][i%4],horizontal?0:Math.PI/2,false);car.speed=range(5,9)*(i%2?1:-1);}

// Ambient pedestrians wander near sidewalks, avoiding architecture and each other.
const pedestrians=[];const cloths=[0x4e6260,0x8c6854,0x52667c,0x77734e,0x654e5c].map(c=>mat(c));
for(let i=0;i<20;i++){const p=new THREE.Group();world.add(p);const road=roadPositions[i%roadPositions.length];p.position.set(i%2?road+7:range(-160,160),0,i%2?range(-160,160):road+7);box(p,0,1.05,0,.48,.86,.3,cloths[i%cloths.length]);sphere(p,0,1.65,0,.2,skin);for(const s of [-1,1])box(p,s*.14,.43,0,.14,.55,.18,pants);p.userData={angle:range(0,Math.PI*2),speed:range(.35,.8),turn:range(1,4)};pedestrians.push(p);}

const minimap=$('minimap'),mapCtx=minimap.getContext('2d');function drawMap(){const w=minimap.width,h=minimap.height,ctx=mapCtx;ctx.clearRect(0,0,w,h);ctx.fillStyle='#182326';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#657170';ctx.lineWidth=4;for(const p of roadPositions){const mx=w/2+(p-player.position.x)*.42,my=h/2+(p-player.position.z)*.42;ctx.beginPath();ctx.moveTo(mx,0);ctx.lineTo(mx,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,my);ctx.lineTo(w,my);ctx.stroke();}ctx.fillStyle='#427e82';ctx.fillRect(0,167,w,13);for(const d of drones){if(!d.found){ctx.fillStyle='#d9f36a';ctx.beginPath();ctx.arc(w/2+(d.group.position.x-player.position.x)*.42,h/2+(d.group.position.z-player.position.z)*.42,3,0,Math.PI*2);ctx.fill();}}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(w/2,h/2,4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d9f36a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w/2,h/2);ctx.lineTo(w/2+Math.sin(yaw)*10,h/2-Math.cos(yaw)*10);ctx.stroke();}

function nearVehicle(){let best=null,dist=4;for(const v of vehicles){if(v.parked){const d=distance(player.position,v.group.position);if(d<dist){dist=d;best=v;}}}return best;}
function enterExitVehicle(){if(inVehicle){player.visible=true;inVehicle.parked=false;player.position.copy(inVehicle.group.position);player.position.x+=Math.cos(inVehicle.heading)*2.1;player.position.z-=Math.sin(inVehicle.heading)*2.1;inVehicle=null;ui.vehicleHud.classList.add('hidden');showToast('Has salido del vehículo');return;}const v=nearVehicle();if(v){inVehicle=v;player.visible=false;v.parked=false;ui.vehicleHud.classList.remove('hidden');$('vehicle-name').textContent='COUPE SPORT';showToast('Vehículo listo · W/S conducir, A/D girar');}}
function shoot(){if(!started||paused||inVehicle||shotCooldown>0)return;if(ammo<=0){showToast('Sin munición · pulsa R para recargar');return;}ammo--;ui.ammo.textContent=ammo;shotCooldown=.23;ui.crosshair.classList.remove('hidden');const origin=camera.position.clone(),dir=new THREE.Vector3();camera.getWorldDirection(dir);let target=null,best=80;for(const d of drones){if(d.found)continue;const to=d.group.position.clone().sub(origin),along=to.dot(dir);if(along<0)continue;const miss=to.addScaledVector(dir,-along).length();if(miss<2.1&&along<best){best=along;target=d;}}if(target){target.found=true;target.group.visible=false;found++;ui.mission.textContent=found;ui.progress.style.width=`${found*20}%`;showToast(found===5?'Actividad completada · + $2,500':'Señal localizada · + 500 XP');if(found===5){$('mission-card').classList.add('complete');}}}
function reload(){if(reloading||ammo===18)return;reloading=true;showToast('Recargando…');setTimeout(()=>{ammo=18;ui.ammo.textContent=ammo;reloading=false;},1000);}
function toggleCover(){covering=!covering;ui.cover.classList.toggle('active',covering);player.scale.y=covering ? .68 : 1;showToast(covering?'En cobertura':'Cobertura abandonada');}
function setPaused(value){paused=value;ui.pause.classList.toggle('hidden',!paused);if(paused&&document.pointerLockElement)document.exitPointerLock();}
ui.startBtn.addEventListener('click',()=>{started=true;ui.start.classList.add('hidden');canvas.requestPointerLock?.();showToast('Explora la ciudad · encuentra los 5 drones');});ui.resume.addEventListener('click',()=>setPaused(false));
canvas.addEventListener('click',()=>{if(started&&!paused&&document.pointerLockElement!==canvas)canvas.requestPointerLock?.();});
window.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas){yaw-=e.movementX*.0022;pitch=clamp(pitch-e.movementY*.0018,-.25,.62);}});
window.addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='Escape'&&started)setPaused(!paused);if(e.code==='KeyF'&&started)enterExitVehicle();if(e.code==='KeyQ'&&started&&!inVehicle)toggleCover();if(e.code==='KeyR')reload();if(e.code==='Space'&&started)shoot();});window.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('mousedown',e=>{if(e.button===0&&document.pointerLockElement===canvas)shoot();});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const clock=new THREE.Clock();let elapsed=0,mapTick=0;
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;if(started&&!paused){shotCooldown=Math.max(0,shotCooldown-dt);if(toastTimer>0&&(toastTimer-=dt)<=0)ui.toast.classList.remove('show');
  if(inVehicle){let steer=(keys.KeyA||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0),throttle=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);inVehicle.speed=clamp(inVehicle.speed+throttle*dt*12,-8,22);inVehicle.speed*=Math.pow(.985,dt*60);inVehicle.heading-=steer*dt*(.8+Math.abs(inVehicle.speed)*.035);inVehicle.group.rotation.y=inVehicle.heading;const old=inVehicle.group.position.clone();inVehicle.group.position.x+=Math.sin(inVehicle.heading)*inVehicle.speed*dt;inVehicle.group.position.z+=Math.cos(inVehicle.heading)*inVehicle.speed*dt;if(blocked(inVehicle.group.position.x,inVehicle.group.position.z,1.5)){inVehicle.group.position.copy(old);inVehicle.speed*=-.25;}inVehicle.wheels.forEach(w=>w.rotation.x+=inVehicle.speed*dt*2);$('speed-value').textContent=String(Math.round(Math.abs(inVehicle.speed)*6)).padStart(3,'0');$('speed-lines').classList.toggle('active',Math.abs(inVehicle.speed)>12);}
  else{let forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),strafe=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),speed=covering?2.1:5.2;if(forward||strafe){const len=Math.hypot(forward,strafe);forward/=len;strafe/=len;const dx=(Math.sin(yaw)*forward+Math.cos(yaw)*strafe)*speed*dt,dz=(Math.cos(yaw)*forward-Math.sin(yaw)*strafe)*speed*dt;moveEntity(player,dx,dz);player.rotation.y=yaw+Math.PI+(strafe*.18);}}
  for(const v of vehicles){if(!v.parked&&v!==inVehicle){v.group.position.x+=Math.sin(v.heading)*v.speed*dt;v.group.position.z+=Math.cos(v.heading)*v.speed*dt;if(Math.abs(v.group.position.x)>180||Math.abs(v.group.position.z)>175){v.group.position.x=clamp(v.group.position.x,-175,175);v.group.position.z=clamp(v.group.position.z,-170,170);v.speed*=-1;}}}
  for(const p of pedestrians){const data=p.userData;data.turn-=dt;if(data.turn<0){data.angle+=range(-1.6,1.6);data.turn=range(1,4);}const nx=p.position.x+Math.sin(data.angle)*data.speed*dt,nz=p.position.z+Math.cos(data.angle)*data.speed*dt;if(blocked(nx,nz,.4)){data.angle+=Math.PI*.7;}else{p.position.set(nx,0,nz);p.rotation.y=data.angle;}}
  for(const d of drones){d.group.position.y=5+Math.sin(elapsed*2+d.phase)*.35;d.group.rotation.y=elapsed*.8+d.phase;}
  const targetPos=inVehicle?inVehicle.group.position:player.position;cameraTarget.set(targetPos.x,targetPos.y+(inVehicle?1.4:covering?1.1:1.5),targetPos.z);cameraOffset.set(Math.sin(yaw)*Math.cos(pitch)*9.5,5.4+Math.sin(pitch)*5,Math.cos(yaw)*Math.cos(pitch)*9.5);camera.position.lerp(cameraTarget.clone().add(cameraOffset),1-Math.pow(.001,dt));camera.lookAt(cameraTarget);
  const near=nearVehicle();ui.interaction.innerHTML=!inVehicle&&near?'<b>F</b> ENTRAR EN COUPE SPORT':inVehicle?'<b>F</b> SALIR DEL VEHÍCULO':'';ui.interaction.classList.toggle('visible',!!near||!!inVehicle);ui.district.textContent=Math.abs(player.position.x)>110?'COSTA · DISTRITO 04':Math.abs(player.position.z)>110?'PUERTO · DISTRITO 03':Math.hypot(player.position.x+20,player.position.z+20)<95?'CENTRO · DISTRITO 01':'CASCO ANTIGUO · DISTRITO 02';
  mapTick-=dt;if(mapTick<=0){drawMap();mapTick=.12;}
 }
 renderer.render(scene,camera);}
frame();
