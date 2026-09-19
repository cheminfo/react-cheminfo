const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./MoleculeCanvas3D-ClRhYODy.js","./rolldown-runtime-C0FnF6B9.js","./preload-helper-BHmFeTtP.js","./iframe-Gi02zF1q.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./lookup-A54Q-qDE.js","./iframe-BokPUqzJ.css","./figurePng-BjUtqJD_.js","./OverlaySegmented-D-zI_CYe.js","./components-CgxeQAEZ.js","./iconTypes-BdKrNP8V.js","./icon-DtlLmDGl.js","./classnames-DbE4yODi.js","./react-dom-MgfC6mEt.js","./shim-Dgbftk7g.js","./esm-CVV7O0lL.js","./numericInput-CVTxseVH.js","./keyboardUtils-DeBk3IyA.js","./refs-6HL0S0cT.js","./abstractPureComponent-CkpgnYbT.js","./buttons-0fkf8QDQ.js","./useValidateProps-w6dJcJry.js","./useInteractiveAttributes-B-irG2tI.js","./text-DSplbqVL.js","./inputGroup-DGe_bita.js","./tag-ziPNCnvP.js","./small-cross-CWMqYscw.js","./menuItem-CVgs_bj3.js","./popoverNextMigrationUtils-BnolLOBg.js","./overlay2-B6Z6QHYs.js","./extends-D4puxXF7.js","./floating-ui.react-dom-CMdUaoqx.js","./callout-B-tEW-Ff.js","./html-BWAQeIkI.js","./dialog-B4b2rUQH.js","./collapse-CL7465Rj.js","./tooltip-h_YfZH6P.js","./controls-Blv-tIzf.js","./emotion-styled.browser.esm-BCMz877a.js","./HelpTooltip-CvTxanNq.js","./joinClassNames-BbK_6p9Z.js","./overlaySurface-Dg4ipkAG.js","./listNavigation-DiDrqnQ0.js","./keyTargets-DrtppKcc.js","./HelpIcon-pJd_bFzc.js","./helpName-DxpXVq-8.js","./overlayPanelStyles-Bb6EWtGt.js","./segmentedControl-BErepLMw.js","./numbers-BxzU8aH2.js","./clamp-M7_x50VL.js","./view-model-D3Ljwm3a.js","./downloadBlob-BXFxYCsP.js","./sanitizeFileName-DTX4aT6A.js"])))=>i.map(i=>d[i]);
import{n as e,r as t}from"./rolldown-runtime-C0FnF6B9.js";import{n,t as r}from"./preload-helper-BHmFeTtP.js";import{h as i,n as a}from"./iframe-Gi02zF1q.js";import{n as o,t as s}from"./callout-B-tEW-Ff.js";import{t as c}from"./clamp-M7_x50VL.js";import{n as l,t as u}from"./roundTo-BbWJSCmm.js";import{n as d}from"./capability-BsxvbEdj.js";function f(e){let{rotation:t,zoom:n,offset:r}=p(e),i=[];for(let e=0;e<4;e++)i.push(String(l(t[e]??0,b)));if(i.push(String(l(n,x))),r[0]!==0||r[1]!==0||r[2]!==0)for(let e of r)i.push(String(l(e,x)));return i.join(`,`)}function p(e){let t=m(e.rotation);return t===null?_:{rotation:t,zoom:h(e.zoom),offset:[g(e.offset[0]),g(e.offset[1]),g(e.offset[2])]}}function m(e){let t=0;for(let n=0;n<4;n++){let r=e[n]??0;if(!Number.isFinite(r))return null;t+=r*r}if(t<=0)return null;let n=1/Math.sqrt(t);return[e[0]*n,e[1]*n,e[2]*n,e[3]*n]}function h(e){let{minimum:t,maximum:n}=v;return c(e,t,n,1)}function g(e){return c(e,-100,y,0)}var _,v,y,b,x;function S(){return(S=e((()=>{u(),_={rotation:[0,0,0,1],zoom:1,offset:[0,0,0]},v={minimum:.01,maximum:100},y=100,b=4,x=3})))()}function C(e){let{fallback:t=`Loading the 3D viewer…`,renderUnsupported:n,...r}=e,[i]=(0,w.useState)(d),[a,o]=(0,w.useState)(null);return i.supported?(0,T.jsxs)(`div`,{style:D,children:[(0,T.jsx)(w.Suspense,{fallback:(0,T.jsx)(`div`,{style:O,children:t}),children:(0,T.jsx)(E,{...r,onFailureChange:o})}),a!==null&&(0,T.jsx)(s,{intent:`danger`,compact:!0,title:`The viewer could not draw this`,children:a})]}):(0,T.jsx)(s,{intent:`warning`,compact:!0,children:n?.(i)??i.message})}var w,T,E,D,O;function k(){return(k=e((()=>{o(),w=i(),T=a(),n(),E=(0,w.lazy)(async()=>({default:(await r(()=>import(`./MoleculeCanvas3D-ClRhYODy.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53]),import.meta.url)).MoleculeCanvas3D})),D={display:`flex`,flexDirection:`column`,gap:6,flex:`1 0 auto`,minWidth:0},O={display:`flex`,alignItems:`center`,justifyContent:`center`,minHeight:320,fontSize:13},C.__docgenInfo={description:`The 3D molecule viewer.
@param props - See {@link MoleculeViewer3DProps}.
@returns The viewer, or an explanation of why this machine cannot show one.`,methods:[],displayName:`MoleculeViewer3D`,props:{molfile:{required:!0,tsType:{name:`union`,raw:`Molecule3DFile | null`,elements:[{name:`Molecule3DFile`},{name:`null`}]},description:"The molecule to draw, with 3D coordinates, or `null` for none."},frameNewMolecule:{required:!1,tsType:{name:`union`,raw:`'keep' | 'front'`,elements:[{name:`literal`,value:`'keep'`},{name:`literal`,value:`'front'`}]},description:`How the camera meets a new molecule. \`keep\` glides to it along the current
direction, which suits conformers of one molecule; \`front\` jumps to it
looking down -z with y up, so unrelated molecules, each laid out in its
file the way it reads best, never swing in from the previous view.
@default 'keep'`},tools:{required:!1,tsType:{name:`Partial`,elements:[{name:`Molecule3DTools`}],raw:`Partial<Molecule3DTools>`},description:`Which buttons the toolbar over the canvas shows; tools not named stay on.
@default every tool`},settings:{required:!1,tsType:{name:`Molecule3DSettings`},description:`How the model is drawn, when the site owns it.
@default undefined`},defaultSettings:{required:!1,tsType:{name:`Partial`,elements:[{name:`Molecule3DSettings`}],raw:`Partial<Molecule3DSettings>`},description:`Starting settings when the component owns them.
@default DEFAULT_MOLECULE_3D_SETTINGS`},onSettingsChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(settings: Molecule3DSettings) => void`,signature:{arguments:[{type:{name:`Molecule3DSettings`},name:`settings`}],return:{name:`void`}}},description:`Called with the new settings after any change from the toolbar.
@default undefined`},spinning:{required:!1,tsType:{name:`boolean`},description:`Whether the model turns on its own, when the site owns it.
@default undefined`},defaultSpinning:{required:!1,tsType:{name:`boolean`},description:`Starting spin when the component owns it.
@default false`},onSpinningChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(spinning: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`spinning`}],return:{name:`void`}}},description:`Called when the spin toggle is pressed.
@default undefined`},spinSpeed:{required:!1,tsType:{name:`number`},description:`Turn rate, in molstar's own spin unit.
@default 1 / 3`},measurements:{required:!1,tsType:{name:`unknown`},description:`The measurements drawn over the model, when the site owns them. They name
atoms by position, so they carry over to another conformer of the same
molecule; a site showing an unrelated molecule should clear them.
@default undefined`},onMeasurementsChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(measurements: readonly Measurement[]) => void`,signature:{arguments:[{type:{name:`unknown`},name:`measurements`}],return:{name:`void`}}},description:`Called with the whole list after a measurement is added or cleared.
@default undefined`},initialCamera:{required:!1,tsType:{name:`union`,raw:`Molecule3DCamera | null`,elements:[{name:`Molecule3DCamera`},{name:`null`}]},description:`Where the camera stands when the first molecule is framed — what a shared
link carries. The camera belongs to whoever is dragging it afterwards, so
this is read once and a later change is ignored; the viewer reports every
move through \`onCameraChange\` instead.
@default null — the molecule is framed as \`frameNewMolecule\` says`},onCameraChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(camera: Molecule3DCamera) => void`,signature:{arguments:[{type:{name:`Molecule3DCamera`},name:`camera`}],return:{name:`void`}}},description:`Called once the camera has come to rest, with where it stands. Not called
while the model is spinning: a spinning camera has no orientation to keep.
@default undefined`},cameraSettleDelay:{required:!1,tsType:{name:`number`},description:`How long the camera must be still before \`onCameraChange\` is called,
milliseconds, so one drag is one report rather than one per frame.
@default 400`},fileName:{required:!1,tsType:{name:`string`},description:`Name of an exported image, without its extension.
@default 'molecule'`},background:{required:!1,tsType:{name:`string`},description:"Scene background, as `#rrggbb`.\n@default '#ffffff'"},minHeight:{required:!1,tsType:{name:`number`},description:`Smallest height of the canvas, pixels.
@default 320`},fallback:{required:!1,tsType:{name:`ReactNode`},description:`What to show while molstar is downloading.
@default 'Loading the 3D viewer…'`},renderUnsupported:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(capability: ViewerCapability) => ReactNode`,signature:{arguments:[{type:{name:`ViewerCapability`},name:`capability`}],return:{name:`ReactNode`}}},description:"What to show when the machine cannot render at all.\n@default undefined — `capability.message` is written"}}}})))()}var A=t({Default:()=>F,PolarSurface:()=>B,SharedCamera:()=>V,SurfaceAndSpin:()=>R,ViewOnly:()=>I,WithMeasurement:()=>L,__namedExportsOrder:()=>W,default:()=>P});function j(e){let[t,n]=(0,M.useState)(e.initialCamera??null),[r,i]=(0,M.useState)(null),[a,o]=(0,M.useState)(0);return(0,N.jsxs)(`div`,{style:H,children:[(0,N.jsx)(`div`,{style:U,children:(0,N.jsx)(C,{...e,initialCamera:t,onCameraChange:i},a)}),(0,N.jsx)(`button`,{type:`button`,disabled:r===null,onClick:()=>{n(r),i(null),o(e=>e+1)},children:`Open the link`}),(0,N.jsx)(`code`,{"data-testid":`molecule3d-camera`,children:r===null?`—`:f(r)})]})}var M,N,P,F,I,L,R,z,B,V,H,U,W;function G(){return(G=e((()=>{M=i(),S(),k(),N=a(),P={title:`Molecule3D/MoleculeViewer3D`,component:C,args:{molfile:{format:`mol`,data:`#1
OCL MolfileCreator  3D

 14 13  0  0  0  0  0  0  0  0999 V2000
    4.4226   -0.5543    0.4435 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0169    0.0827    0.6138 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.5065   -0.1174    2.0683 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.1008    0.5195    2.2385 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.3647   -1.6198    0.5445 H   0  0  0  0  0  0  0  0  0  0  0  0
    4.8209   -0.3327   -0.5231 H   0  0  0  0  0  0  0  0  0  0  0  0
    5.0966   -0.1900    1.1895 H   0  0  0  0  0  0  0  0  0  0  0  0
    2.3348   -0.3621   -0.0760 H   0  0  0  0  0  0  0  0  0  0  0  0
    3.0686    1.1316    0.3896 H   0  0  0  0  0  0  0  0  0  0  0  0
    2.4595   -1.1586    2.2977 H   0  0  0  0  0  0  0  0  0  0  0  0
    3.1924    0.3370    2.7582 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.3786   -0.0048    1.6450 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.7888    0.4738    3.2596 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.1067    1.5409    1.9218 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  1  5  1  0  0  0  0
  1  6  1  0  0  0  0
  1  7  1  0  0  0  0
  2  8  1  1  0  0  0
  2  9  1  0  0  0  0
  3 10  1  1  0  0  0
  3 11  1  0  0  0  0
  4 12  1  0  0  0  0
  4 13  1  0  0  0  0
  4 14  1  0  0  0  0
M  END
`}},parameters:{layout:`padded`,docs:{description:{component:`A molecule in 3D with molstar, and a react-science toolbar over the canvas: distance, angle and dihedral measurements, spin, the molecular surface, a view reset and a popover of display options. Each tool can be switched off, and settings, spin and measurements can be owned by the site or left to the component.`}}},render:e=>(0,N.jsx)(`div`,{style:{width:`min(36rem, 90vw)`,height:420,display:`flex`},children:(0,N.jsx)(C,{...e})})},F={},I={args:{tools:{measure:!1,options:!1}}},L={args:{defaultSettings:{representation:`stick`},measurements:[{kind:`dihedral`,atoms:[{unit:0,element:0},{unit:0,element:1},{unit:0,element:2},{unit:0,element:3}]}]}},R={args:{defaultSettings:{showSurface:!0},defaultSpinning:!0}},z=`ethanol
OCL MolfileCreator  3D

  9  8  0  0  0  0  0  0  0  0999 V2000
    0.0834   -0.2326    0.0236 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.8608    0.5737   -0.8316 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.6677    1.9569   -0.5769 O   0  0  0  0  0  0  0  0  0  0  0  0
   -0.0455   -1.1877   -0.1496 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.0931   -0.0508    0.9693 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.0084    0.0115   -0.1879 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.6827    0.3747   -1.7867 H   0  0  0  0  0  0  0  0  0  0  0  0
   -1.7938    0.3223   -0.6150 H   0  0  0  0  0  0  0  0  0  0  0  0
   -1.1293    2.4241   -1.1004 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  1  4  1  0  0  0  0
  1  5  1  0  0  0  0
  1  6  1  0  0  0  0
  2  7  1  0  0  0  0
  2  8  1  0  0  0  0
  3  9  1  0  0  0  0
M  END
`,B={args:{molfile:{format:`mol`,data:z},defaultSettings:{showSurface:!0,surfaceColoring:`polarity`}}},V={args:{initialCamera:{rotation:[0,Math.SQRT1_2,0,Math.SQRT1_2],zoom:1,offset:[0,0,0]}},render:e=>(0,N.jsx)(j,{...e})},H={display:`grid`,gap:8,justifyItems:`start`},U={width:`min(36rem, 90vw)`,height:420,display:`flex`},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{}`,...F.parameters?.docs?.source},description:{story:`Every tool on.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    tools: {
      measure: false,
      options: false
    }
  }
}`,...I.parameters?.docs?.source},description:{story:`Only the view tools: no measuring, no options popover.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSettings: {
      representation: 'stick'
    },
    measurements: [{
      kind: 'dihedral',
      atoms: [{
        unit: 0,
        element: 0
      }, {
        unit: 0,
        element: 1
      }, {
        unit: 0,
        element: 2
      }, {
        unit: 0,
        element: 3
      }]
    }]
  }
}`,...L.parameters?.docs?.source},description:{story:`A dihedral already drawn, down the C1–C2–C3–C4 backbone.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSettings: {
      showSurface: true
    },
    defaultSpinning: true
  }
}`,...R.parameters?.docs?.source},description:{story:`The surface on, and the model turning.`,...R.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    molfile: {
      format: 'mol',
      data: ETHANOL
    },
    defaultSettings: {
      showSurface: true,
      surfaceColoring: 'polarity'
    }
  }
}`,...B.parameters?.docs?.source},description:{story:`The surface of ethanol, its hydroxyl coloured as the polar part.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    // A quarter turn about the vertical axis.
    initialCamera: {
      rotation: [0, Math.SQRT1_2, 0, Math.SQRT1_2],
      zoom: 1,
      offset: [0, 0, 0]
    }
  },
  render: args => <SharedCameraDemo {...args} />
}`,...V.parameters?.docs?.source},description:{story:`A camera carried by a link: the viewer opens on butane seen from the side,
reports where the reader leaves the camera once it settles, and "Open the
link" reopens it from that report, as a visitor following the link would.`,...V.parameters?.docs?.description}}},W=[`Default`,`ViewOnly`,`WithMeasurement`,`SurfaceAndSpin`,`PolarSurface`,`SharedCamera`]})))()}export{p as a,S as i,G as n,f as r,A as t};