const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./AtomicOrbitalCanvas-fTIB3mjD.js","./rolldown-runtime-C0FnF6B9.js","./iframe-NhtRTM8t.js","./preload-helper-BHmFeTtP.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./iframe-B-cIiNHy.css","./tslib.es6-CNVH6t1f.js"])))=>i.map(i=>d[i]);
import{n as e,r as t}from"./rolldown-runtime-C0FnF6B9.js";import{n,t as r}from"./preload-helper-BHmFeTtP.js";import{f as i,n as a}from"./iframe-NhtRTM8t.js";var o;function s(){return(s=e((()=>{o={textbook:{id:`textbook`,label:`Blue / red (textbook)`,positive:`#2563eb`,negative:`#dc2626`,neutral:`#9ca3af`,node:`#64748b`},colourBlindSafe:{id:`colourBlindSafe`,label:`Blue / yellow (colour-blind safe)`,positive:`#0072b2`,negative:`#e69f00`,neutral:`#9ca3af`,node:`#56606b`}}})))()}function c(){if(typeof document>`u`)return{supported:!1,gpuOrbitals:!1,message:`The 3D viewer needs a browser window.`};let e=l(document.createElement(`canvas`));if(e===null)return{supported:!1,gpuOrbitals:!1,message:`This browser could not create a WebGL context, so the 3D viewer cannot start. Enable hardware acceleration, or update the graphics driver.`};let t=u(e);return d(e.context),t?{supported:!0,gpuOrbitals:!0,message:`This browser can render the 3D viewer and computed orbitals.`}:{supported:!0,gpuOrbitals:!1,message:`This graphics driver has no floating-point textures, so computed orbitals are built on the processor instead. Everything works, but each orbital takes a few seconds.`}}function l(e){let t={failIfMajorPerformanceCaveat:!1},n=e.getContext(`webgl2`,t);if(n!==null)return{context:n,isWebGL2:!0};let r=e.getContext(`webgl`,t);return r===null?null:{context:r,isWebGL2:!1}}function u(e){return e.isWebGL2?!0:e.context.getExtension(`OES_texture_float`)!==null}function d(e){e.getExtension(`WEBGL_lose_context`)?.loseContext()}function f(e){let{fallback:t=`Loading the 3D viewer…`,renderUnsupported:n,...r}=e,[i]=(0,p.useState)(c),[a,o]=(0,p.useState)(null);return i.supported?(0,m.jsxs)(`div`,{style:g,children:[(0,m.jsx)(p.Suspense,{fallback:(0,m.jsx)(`div`,{style:_,children:t}),children:(0,m.jsx)(h,{...r,onError:e=>{o(e)}})}),a!==null&&(0,m.jsxs)(`div`,{style:v,children:[`This orbital could not be drawn: `,a]})]}):(0,m.jsx)(`div`,{style:_,children:n?.(i)??i.message})}var p,m,h,g,_,v;function y(){return(y=e((()=>{p=i(),m=a(),n(),h=(0,p.lazy)(async()=>({default:(await r(()=>import(`./AtomicOrbitalCanvas-fTIB3mjD.js`),__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url)).AtomicOrbitalCanvas})),g={display:`flex`,flexDirection:`column`,gap:6,minWidth:0},_={display:`flex`,alignItems:`center`,justifyContent:`center`,minHeight:260,padding:12,borderRadius:3,background:`rgb(241 245 249)`,color:`#5f6b7c`,fontSize:13,textAlign:`center`},v={padding:`6px 9px`,borderRadius:3,background:`#fdeaea`,color:`#8c2b2b`,fontSize:12},f.__docgenInfo={description:`The 3D atomic orbital.
@param props - See {@link AtomicOrbitalViewerProps}.
@returns The viewer, or an explanation of why this machine cannot show one.`,methods:[],displayName:`AtomicOrbitalViewer`,props:{atomicNumber:{required:!0,tsType:{name:`number`},description:`Proton count of the element, 1 to 118.`},orbitalId:{required:!0,tsType:{name:`string`},description:"Which orbital of it, e.g. `3dz2`; ids come from `atomicOrbitalsOf`."},palette:{required:!1,tsType:{name:`PhasePalette`},description:`Colours the two phases are drawn in.
@default PHASE_PALETTES.textbook`},resolution:{required:!1,tsType:{name:`union`,raw:`number | ResolutionLimits`,elements:[{name:`number`},{name:`ResolutionLimits`}]},description:`Samples along each edge of the cube; the cost is the cube of it.

A number fixes it. A {@link ResolutionLimits} pair lets each orbital's own
shape pick a resolution between the two.
@default 56`},spinning:{required:!1,tsType:{name:`boolean`},description:`Whether the scene turns on its own.
@default false`},spinSpeed:{required:!1,tsType:{name:`number`},description:`How fast it turns, in molstar's own spin unit. Lower is slower.
@default 0.3`},sample:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(
  request: AtomicSampleRequest,
) => Promise<AtomicSampleResult>`,signature:{arguments:[{type:{name:`AtomicSampleRequest`},name:`request`}],return:{name:`Promise`,elements:[{name:`AtomicSampleResult`}],raw:`Promise<AtomicSampleResult>`}}},description:`How the field is produced. Supply a worker-backed sampler to keep the main
thread free; the default runs in process.
@default sampleInProcess`},onNodeRadii:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(radii: number[]) => void`,signature:{arguments:[{type:{name:`Array`,elements:[{name:`number`}],raw:`number[]`},name:`radii`}],return:{name:`void`}}},description:`Called with the radial node radii, ångström, each time an orbital is
sampled.
@default undefined`},fallback:{required:!1,tsType:{name:`ReactNode`},description:`What to show while molstar is downloading.
@default 'Loading the 3D viewer…'`},renderUnsupported:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(capability: ViewerCapability) => ReactNode`,signature:{arguments:[{type:{name:`ViewerCapability`},name:`capability`}],return:{name:`ReactNode`}}},description:`What to show when the machine cannot render at all. Receives the probe, so
a site can word the refusal in its own voice; the default writes
\`capability.message\`.
@default undefined`}}}})))()}var b=t({ColourBlindSafe:()=>D,Default:()=>C,FOrbital:()=>E,RadialNodes:()=>w,Simple:()=>T,Spinning:()=>O,__namedExportsOrder:()=>k,default:()=>S}),x,S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{s(),y(),x=a(),S={title:`Orbital/AtomicOrbitalViewer`,component:f,argTypes:{atomicNumber:{control:{type:`range`,min:1,max:118,step:1}},resolution:{control:{type:`range`,min:16,max:80,step:4}},spinning:{control:`boolean`}},args:{atomicNumber:26,orbitalId:`3dz2`},parameters:{layout:`padded`,docs:{description:{component:"One hydrogen-like atomic orbital, screened by Slater’s rules, sampled in the browser and drawn as a signed isosurface with molstar. The canvas is behind a `React.lazy` boundary, so a page that never shows an orbital never downloads molstar."}}},render:e=>(0,x.jsx)(`div`,{style:{width:`min(30rem, 90vw)`},children:(0,x.jsx)(f,{...e})})},C={},w={args:{atomicNumber:11,orbitalId:`3s`}},T={args:{atomicNumber:6,orbitalId:`2pz`}},E={args:{atomicNumber:92,orbitalId:`5fxyz`}},D={args:{palette:o.colourBlindSafe}},O={args:{spinning:!0}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source},description:{story:`Iron’s 3d z², the shape every crystal-field diagram starts from.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    atomicNumber: 11,
    orbitalId: '3s'
  }
}`,...w.parameters?.docs?.source},description:{story:`Sodium’s 3s: two radial nodes, so three nested shells of alternating sign.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    atomicNumber: 6,
    orbitalId: '2pz'
  }
}`,...T.parameters?.docs?.source},description:{story:`Carbon’s 2p z — one angular node, and nothing else to confuse it with.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    atomicNumber: 92,
    orbitalId: '5fxyz'
  }
}`,...E.parameters?.docs?.source},description:{story:`An f orbital, which is where a nodeless Slater basis stops being enough.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    palette: PHASE_PALETTES.colourBlindSafe
  }
}`,...D.parameters?.docs?.source},description:{story:`The blue/amber pair, for the readers the blue/red one fails.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    spinning: true
  }
}`,...O.parameters?.docs?.source},description:{story:`Turning makes a still screenshot of a 3D shape readable.`,...O.parameters?.docs?.description}}},k=[`Default`,`RadialNodes`,`Simple`,`FOrbital`,`ColourBlindSafe`,`Spinning`]})))()}export{s as i,A as n,o as r,b as t};