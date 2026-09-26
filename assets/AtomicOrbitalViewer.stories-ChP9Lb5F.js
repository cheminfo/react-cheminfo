const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./AtomicOrbitalCanvas-qbOWncSZ.js","./rolldown-runtime-C0FnF6B9.js","./iframe-DzkT2GF_.js","./preload-helper-BHmFeTtP.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./lookup-DaL5dO87.js","./languageParam-B2tQW6WN.js","./iframe-smuW97hD.css","./useT-SaARZZCl.js","./buttons-Di_tSBMT.js","./icon-CCl7BR5X.js","./iconTypes-BdKrNP8V.js","./classnames-Bcwqlx8h.js","./useValidateProps-DRQdhWoC.js","./useInteractiveAttributes-F1PbvEcg.js","./keyboardUtils-DeBk3IyA.js","./refs-6HL0S0cT.js","./text-BsJR3ZOb.js","./HelpTooltip-BEENy6PR.js","./tooltip-z-SxvMGE.js","./abstractPureComponent-BOpyGpul.js","./popoverNextMigrationUtils-COPa16Fm.js","./react-dom-DjkuoR6j.js","./overlay2-Dmvvekzi.js","./extends-D4puxXF7.js","./floating-ui.react-dom-B4MaiQ_L.js","./joinClassNames-BbK_6p9Z.js","./view-model-D3Ljwm3a.js","./toError-DY-iNW4J.js","./useResizeObserver-h8hzG_NS.js","./familyTokens-DsQXXJV4.js","./palette-D-jM88dk.js","./hydrogenic-BkNhSxt9.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,t as n}from"./preload-helper-BHmFeTtP.js";import{h as r,n as i}from"./iframe-DzkT2GF_.js";import{n as a,t as o}from"./useT-SaARZZCl.js";import{n as s,t as c}from"./callout-BQAlT1ts.js";import{n as l,r as u}from"./familyTokens-DsQXXJV4.js";import{n as d,t as f}from"./palette-D-jM88dk.js";import{n as p}from"./capability-Cg3uaR0U.js";function m(e){let{fallback:t,renderUnsupported:n,className:r,...i}=e,o=a(),[s]=(0,h.useState)(p),[l,u]=(0,h.useState)(null);return s.supported?(0,g.jsxs)(`div`,{className:r,style:v,children:[(0,g.jsx)(h.Suspense,{fallback:(0,g.jsx)(`div`,{style:y,children:t??o(`molecule3d.loadingViewer`)}),children:(0,g.jsx)(_,{...i,onFailureChange:u})}),l!==null&&(0,g.jsx)(c,{intent:`danger`,compact:!0,title:o(`orbital.couldNotDraw`),children:l})]}):(0,g.jsx)(c,{intent:`warning`,compact:!0,className:r,children:n?.(s)??o.or(`viewer.capability.${s.reason}`,s.message)})}var h,g,_,v,y;function b(){return(b=e((()=>{s(),h=r(),o(),u(),g=i(),t(),_=(0,h.lazy)(async()=>({default:(await n(()=>import(`./AtomicOrbitalCanvas-qbOWncSZ.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33]),import.meta.url)).AtomicOrbitalCanvas})),v={display:`flex`,flexDirection:`column`,gap:6,minWidth:0},y={display:`flex`,alignItems:`center`,justifyContent:`center`,minHeight:260,padding:12,borderRadius:3,background:l.surfaceSunken,color:l.textMuted,fontSize:13,textAlign:`center`},m.__docgenInfo={description:`The 3D atomic orbital.
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
@default undefined`}}}})))()}var x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{d(),b(),x=i(),S={title:`Orbital/AtomicOrbitalViewer`,component:m,argTypes:{atomicNumber:{control:{type:`range`,min:1,max:118,step:1}},resolution:{control:{type:`range`,min:16,max:80,step:4}},axes:{control:`boolean`},spinning:{control:`boolean`}},args:{atomicNumber:26,orbitalId:`3dz2`},parameters:{layout:`padded`,docs:{description:{component:"One hydrogen-like atomic orbital, screened by Slater’s rules, sampled in the browser and drawn as a signed isosurface with molstar. The canvas is behind a `React.lazy` boundary, so a page that never shows an orbital never downloads molstar."}}},render:e=>(0,x.jsx)(`div`,{style:{width:`min(30rem, 90vw)`},children:(0,x.jsx)(m,{...e})})},C={},w={args:{atomicNumber:11,orbitalId:`3s`}},T={args:{atomicNumber:6,orbitalId:`2pz`}},E={args:{atomicNumber:92,orbitalId:`5fxyz`}},D={args:{palette:f.colorBlindSafe}},O={args:{atomicNumber:34,orbitalId:`3dyz`}},k={args:{axes:!1}},A={args:{spinning:!0}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source},description:{story:`Iron’s 3d z², the shape every crystal-field diagram starts from.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
    palette: PHASE_PALETTES.colorBlindSafe
  }
}`,...D.parameters?.docs?.source},description:{story:`The blue/amber pair, for the readers the blue/red one fails.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    atomicNumber: 34,
    orbitalId: '3dyz'
  }
}`,...O.parameters?.docs?.source},description:{story:"The labelled frame, which is what tells a `3d_xz` from a `3d_yz`.",...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    axes: false
  }
}`,...k.parameters?.docs?.source},description:{story:`Opening without the frame; the button in the corner brings it back.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    spinning: true
  }
}`,...A.parameters?.docs?.source},description:{story:`Turning makes a still screenshot of a 3D shape readable.`,...A.parameters?.docs?.description}}},j=[`Default`,`RadialNodes`,`Simple`,`FOrbital`,`ColourBlindSafe`,`WithAxes`,`WithoutAxes`,`Spinning`]})))()}M();export{D as ColourBlindSafe,C as Default,E as FOrbital,w as RadialNodes,T as Simple,A as Spinning,O as WithAxes,k as WithoutAxes,j as __namedExportsOrder,S as default};