const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./AtomicOrbitalCanvas-CdHFQt4L.js","./rolldown-runtime-C0FnF6B9.js","./iframe-D72pBctd.js","./preload-helper-BHmFeTtP.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./iframe-B-cIiNHy.css","./iconTypes-BdKrNP8V.js","./buttons-CxP-y-JT.js","./icon-BlJt7NJz.js","./classnames-BdogO3TY.js","./useValidateProps-nR0N0sxc.js","./useInteractiveAttributes-Buj-zYFB.js","./keyboardUtils-B7-CDIhA.js","./refs-6HL0S0cT.js","./text-LWRZIJQV.js","./HelpTooltip-D1R2wOWf.js","./tooltip-7XAZvSs9.js","./abstractPureComponent-C751gVJ5.js","./popoverNextMigrationUtils-DfPthqdx.js","./react-dom-CzW0DSIp.js","./overlay2-Br5h6I4y.js","./extends-D4puxXF7.js","./floating-ui.react-dom-C9itKYwo.js","./palette-Co4GHdjv.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,t as n}from"./preload-helper-BHmFeTtP.js";import{f as r,n as i}from"./iframe-D72pBctd.js";import{n as a,t as o}from"./palette-Co4GHdjv.js";function s(){if(typeof document>`u`)return{supported:!1,gpuOrbitals:!1,message:`The 3D viewer needs a browser window.`};let e=c(document.createElement(`canvas`));if(e===null)return{supported:!1,gpuOrbitals:!1,message:`This browser could not create a WebGL context, so the 3D viewer cannot start. Enable hardware acceleration, or update the graphics driver.`};let t=l(e);return u(e.context),t?{supported:!0,gpuOrbitals:!0,message:`This browser can render the 3D viewer and computed orbitals.`}:{supported:!0,gpuOrbitals:!1,message:`This graphics driver has no floating-point textures, so computed orbitals are built on the processor instead. Everything works, but each orbital takes a few seconds.`}}function c(e){let t={failIfMajorPerformanceCaveat:!1},n=e.getContext(`webgl2`,t);if(n!==null)return{context:n,isWebGL2:!0};let r=e.getContext(`webgl`,t);return r===null?null:{context:r,isWebGL2:!1}}function l(e){return e.isWebGL2?!0:e.context.getExtension(`OES_texture_float`)!==null}function u(e){e.getExtension(`WEBGL_lose_context`)?.loseContext()}function d(e){let{fallback:t=`Loading the 3D viewer…`,renderUnsupported:n,...r}=e,[i]=(0,f.useState)(s),[a,o]=(0,f.useState)(null);return i.supported?(0,p.jsxs)(`div`,{style:h,children:[(0,p.jsx)(f.Suspense,{fallback:(0,p.jsx)(`div`,{style:g,children:t}),children:(0,p.jsx)(m,{...r,onError:e=>{o(e)}})}),a!==null&&(0,p.jsxs)(`div`,{style:_,children:[`This orbital could not be drawn: `,a]})]}):(0,p.jsx)(`div`,{style:g,children:n?.(i)??i.message})}var f,p,m,h,g,_;function v(){return(v=e((()=>{f=r(),p=i(),t(),m=(0,f.lazy)(async()=>({default:(await n(()=>import(`./AtomicOrbitalCanvas-CdHFQt4L.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]),import.meta.url)).AtomicOrbitalCanvas})),h={display:`flex`,flexDirection:`column`,gap:6,minWidth:0},g={display:`flex`,alignItems:`center`,justifyContent:`center`,minHeight:260,padding:12,borderRadius:3,background:`rgb(241 245 249)`,color:`var(--text-muted, #5f6b7c)`,fontSize:13,textAlign:`center`},_={padding:`6px 9px`,borderRadius:3,background:`#fdeaea`,color:`#8c2b2b`,fontSize:12},d.__docgenInfo={description:`The 3D atomic orbital.
@param props - See {@link AtomicOrbitalViewerProps}.
@returns The viewer, or an explanation of why this machine cannot show one.`,methods:[],displayName:`AtomicOrbitalViewer`,props:{atomicNumber:{required:!0,tsType:{name:`number`},description:`Proton count of the element, 1 to 118.`},orbitalId:{required:!0,tsType:{name:`string`},description:"Which orbital of it, e.g. `3dz2`; ids come from `atomicOrbitalsOf`."},palette:{required:!1,tsType:{name:`PhasePalette`},description:`Colours the two phases are drawn in.
@default PHASE_PALETTES.textbook`},resolution:{required:!1,tsType:{name:`union`,raw:`number | ResolutionLimits`,elements:[{name:`number`},{name:`ResolutionLimits`}]},description:`Samples along each edge of the cube; the cost is the cube of it.

A number fixes it. A {@link ResolutionLimits} pair lets each orbital's own
shape pick a resolution between the two.
@default 56`},axes:{required:!1,tsType:{name:`boolean`},description:"Whether the labelled x, y, z frame is drawn through the nucleus when the\ncanvas opens — it is what tells a `3d_xz` from a `3d_yz`. The button in the\ncanvas's corner flips it from there.\n@default true"},onAxesChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(axes: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`axes`}],return:{name:`void`}}},description:`Called when the student flips the frame, with its new state — so a site can
persist the choice and pass it back as \`axes\`.
@default undefined`},spinning:{required:!1,tsType:{name:`boolean`},description:`Whether the scene turns on its own.
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
@default undefined`}}}})))()}var y,b,x,S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{a(),v(),y=i(),b={title:`Orbital/AtomicOrbitalViewer`,component:d,argTypes:{atomicNumber:{control:{type:`range`,min:1,max:118,step:1}},resolution:{control:{type:`range`,min:16,max:80,step:4}},axes:{control:`boolean`},spinning:{control:`boolean`}},args:{atomicNumber:26,orbitalId:`3dz2`},parameters:{layout:`padded`,docs:{description:{component:"One hydrogen-like atomic orbital, screened by Slater’s rules, sampled in the browser and drawn as a signed isosurface with molstar. The canvas is behind a `React.lazy` boundary, so a page that never shows an orbital never downloads molstar."}}},render:e=>(0,y.jsx)(`div`,{style:{width:`min(30rem, 90vw)`},children:(0,y.jsx)(d,{...e})})},x={},S={args:{atomicNumber:11,orbitalId:`3s`}},C={args:{atomicNumber:6,orbitalId:`2pz`}},w={args:{atomicNumber:92,orbitalId:`5fxyz`}},T={args:{palette:o.colourBlindSafe}},E={args:{atomicNumber:34,orbitalId:`3dyz`}},D={args:{axes:!1}},O={args:{spinning:!0}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{}`,...x.parameters?.docs?.source},description:{story:`Iron’s 3d z², the shape every crystal-field diagram starts from.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    atomicNumber: 11,
    orbitalId: '3s'
  }
}`,...S.parameters?.docs?.source},description:{story:`Sodium’s 3s: two radial nodes, so three nested shells of alternating sign.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    atomicNumber: 6,
    orbitalId: '2pz'
  }
}`,...C.parameters?.docs?.source},description:{story:`Carbon’s 2p z — one angular node, and nothing else to confuse it with.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    atomicNumber: 92,
    orbitalId: '5fxyz'
  }
}`,...w.parameters?.docs?.source},description:{story:`An f orbital, which is where a nodeless Slater basis stops being enough.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    palette: PHASE_PALETTES.colourBlindSafe
  }
}`,...T.parameters?.docs?.source},description:{story:`The blue/amber pair, for the readers the blue/red one fails.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    atomicNumber: 34,
    orbitalId: '3dyz'
  }
}`,...E.parameters?.docs?.source},description:{story:"The labelled frame, which is what tells a `3d_xz` from a `3d_yz`.",...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    axes: false
  }
}`,...D.parameters?.docs?.source},description:{story:`Opening without the frame; the button in the corner brings it back.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    spinning: true
  }
}`,...O.parameters?.docs?.source},description:{story:`Turning makes a still screenshot of a 3D shape readable.`,...O.parameters?.docs?.description}}},k=[`Default`,`RadialNodes`,`Simple`,`FOrbital`,`ColourBlindSafe`,`WithAxes`,`WithoutAxes`,`Spinning`]})))()}A();export{T as ColourBlindSafe,x as Default,w as FOrbital,S as RadialNodes,C as Simple,O as Spinning,E as WithAxes,D as WithoutAxes,k as __namedExportsOrder,b as default};