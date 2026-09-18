const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./AtomicOrbitalCanvas-CucnrNeK.js","./rolldown-runtime-C0FnF6B9.js","./iframe-X62GV0XO.js","./preload-helper-BHmFeTtP.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./lookup-A54Q-qDE.js","./iframe-CnpnNetz.css","./buttons-WcYIUGTa.js","./icon-DTsLHYk6.js","./iconTypes-BdKrNP8V.js","./classnames-B8f4U9f2.js","./useValidateProps-CwiIMAVW.js","./useInteractiveAttributes-6qRN5HBU.js","./keyboardUtils-DeBk3IyA.js","./refs-6HL0S0cT.js","./text-BeXGHZkw.js","./HelpTooltip-DMpqTL1f.js","./tooltip-BZ4DnBHb.js","./abstractPureComponent-DNIrznLU.js","./popoverNextMigrationUtils-D4KIIo4-.js","./react-dom-C17QPc3k.js","./overlay2-D-9AoRHy.js","./extends-D4puxXF7.js","./floating-ui.react-dom-kuzR5jyd.js","./joinClassNames-BbK_6p9Z.js","./view-model-D3Ljwm3a.js","./toError-DY-iNW4J.js","./useResizeObserver-BriAbWkL.js","./familyTokens-DsQXXJV4.js","./palette-D-jM88dk.js","./hydrogenic-BPmWJk6Y.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,t as n}from"./preload-helper-BHmFeTtP.js";import{h as r,n as i}from"./iframe-X62GV0XO.js";import{n as a,t as o}from"./callout-46z7xTEH.js";import{n as s,r as c}from"./familyTokens-DsQXXJV4.js";import{n as l,t as u}from"./palette-D-jM88dk.js";import{n as d}from"./capability-BsxvbEdj.js";function f(e){let{fallback:t=`Loading the 3D viewer…`,renderUnsupported:n,className:r,...i}=e,[a]=(0,p.useState)(d),[s,c]=(0,p.useState)(null);return a.supported?(0,m.jsxs)(`div`,{className:r,style:g,children:[(0,m.jsx)(p.Suspense,{fallback:(0,m.jsx)(`div`,{style:_,children:t}),children:(0,m.jsx)(h,{...i,onFailureChange:c})}),s!==null&&(0,m.jsx)(o,{intent:`danger`,compact:!0,title:`This orbital could not be drawn`,children:s})]}):(0,m.jsx)(o,{intent:`warning`,compact:!0,className:r,children:n?.(a)??a.message})}var p,m,h,g,_;function v(){return(v=e((()=>{a(),p=r(),c(),m=i(),t(),h=(0,p.lazy)(async()=>({default:(await n(()=>import(`./AtomicOrbitalCanvas-CucnrNeK.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]),import.meta.url)).AtomicOrbitalCanvas})),g={display:`flex`,flexDirection:`column`,gap:6,minWidth:0},_={display:`flex`,alignItems:`center`,justifyContent:`center`,minHeight:260,padding:12,borderRadius:3,background:s.surfaceSunken,color:s.textMuted,fontSize:13,textAlign:`center`},f.__docgenInfo={description:`The 3D atomic orbital.
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
@default undefined`},className:{required:!1,tsType:{name:`string`},description:`Class of the outermost element, so a site can size or place the viewer
from its stylesheet.
@default undefined`}}}})))()}var y,b,x,S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{l(),v(),y=i(),b={title:`Orbital/AtomicOrbitalViewer`,component:f,argTypes:{atomicNumber:{control:{type:`range`,min:1,max:118,step:1}},resolution:{control:{type:`range`,min:16,max:80,step:4}},axes:{control:`boolean`},spinning:{control:`boolean`}},args:{atomicNumber:26,orbitalId:`3dz2`},parameters:{layout:`padded`,docs:{description:{component:"One hydrogen-like atomic orbital, screened by Slater’s rules, sampled in the browser and drawn as a signed isosurface with molstar. The canvas is behind a `React.lazy` boundary, so a page that never shows an orbital never downloads molstar."}}},render:e=>(0,y.jsx)(`div`,{style:{width:`min(30rem, 90vw)`},children:(0,y.jsx)(f,{...e})})},x={},S={args:{atomicNumber:11,orbitalId:`3s`}},C={args:{atomicNumber:6,orbitalId:`2pz`}},w={args:{atomicNumber:92,orbitalId:`5fxyz`}},T={args:{palette:u.colorBlindSafe}},E={args:{atomicNumber:34,orbitalId:`3dyz`}},D={args:{axes:!1}},O={args:{spinning:!0}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{}`,...x.parameters?.docs?.source},description:{story:`Iron’s 3d z², the shape every crystal-field diagram starts from.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
    palette: PHASE_PALETTES.colorBlindSafe
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