const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./MoleculeCanvas3D-DiPzTALh.js","./rolldown-runtime-C0FnF6B9.js","./preload-helper-BHmFeTtP.js","./iframe-C_0-xZ4H.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./lookup-DaL5dO87.js","./languageParam-B2tQW6WN.js","./iframe-smuW97hD.css","./figurePng-BrXH6xzm.js","./useT-DdDrCs00.js","./OverlaySegmented-DoJcKDZr.js","./components-BOAVfrns.js","./iconTypes-BdKrNP8V.js","./icon-CiSLA9df.js","./classnames-BSeVzBzT.js","./react-dom-BH-X-wG0.js","./shim-DDM-qbpi.js","./esm-CVV7O0lL.js","./numericInput-JzEn723Q.js","./keyboardUtils-DeBk3IyA.js","./refs-6HL0S0cT.js","./abstractPureComponent-DnHhzzDP.js","./buttons-DFytC0DQ.js","./useValidateProps-0LsS1rzi.js","./useInteractiveAttributes-DdZi5Rb-.js","./text-DLWaJCxP.js","./inputGroup-CS4BGVjg.js","./tag-9nLywBKt.js","./small-cross-VbTaauUT.js","./menuItem-dkOP7yB8.js","./popoverNextMigrationUtils-C3Dey-cH.js","./overlay2-CWOWsIX7.js","./extends-D4puxXF7.js","./floating-ui.react-dom-CeBw8VTl.js","./callout-B3uhVPTF.js","./html-ClRE3aP8.js","./dialog-CmjPumpu.js","./collapse-Bi2jYauM.js","./tooltip-BDGGu7Ta.js","./controls-Dh7aIPIF.js","./emotion-styled.browser.esm-DixJbAfb.js","./HelpTooltip-DUZQf2Lx.js","./joinClassNames-BbK_6p9Z.js","./overlaySurface-3HUk1h6W.js","./listNavigation-DiDrqnQ0.js","./keyTargets-DrtppKcc.js","./HelpIcon-Cu3940ee.js","./helpName-uK3f7RM1.js","./overlayPanelStyles-CtbCJkvT.js","./segmentedControl-DaolgEO2.js","./numbers-BxzU8aH2.js","./clamp-M7_x50VL.js","./view-model-D3Ljwm3a.js","./downloadBlob-BXFxYCsP.js","./sanitizeFileName-DTX4aT6A.js"])))=>i.map(i=>d[i]);
import{n as e,r as t}from"./rolldown-runtime-C0FnF6B9.js";import{n,t as r}from"./preload-helper-BHmFeTtP.js";import{h as i,n as a}from"./iframe-C_0-xZ4H.js";import{n as o,t as s}from"./useT-DdDrCs00.js";import{n as c,t as l}from"./callout-B3uhVPTF.js";import{t as u}from"./clamp-M7_x50VL.js";import{n as d,t as f}from"./roundTo-BbWJSCmm.js";import{n as p}from"./capability-Cg3uaR0U.js";function m(e){let{rotation:t,zoom:n,offset:r}=h(e),i=[];for(let e=0;e<4;e++)i.push(String(d(t[e]??0,S)));if(i.push(String(d(n,C))),r[0]!==0||r[1]!==0||r[2]!==0)for(let e of r)i.push(String(d(e,C)));return i.join(`,`)}function h(e){let t=g(e.rotation);return t===null?y:{rotation:t,zoom:_(e.zoom),offset:[v(e.offset[0]),v(e.offset[1]),v(e.offset[2])]}}function g(e){let t=0;for(let n=0;n<4;n++){let r=e[n]??0;if(!Number.isFinite(r))return null;t+=r*r}if(t<=0)return null;let n=1/Math.sqrt(t);return[e[0]*n,e[1]*n,e[2]*n,e[3]*n]}function _(e){let{minimum:t,maximum:n}=b;return u(e,t,n,1)}function v(e){return u(e,-100,x,0)}var y,b,x,S,C;function w(){return(w=e((()=>{f(),y={rotation:[0,0,0,1],zoom:1,offset:[0,0,0]},b={minimum:.01,maximum:100},x=100,S=4,C=3})))()}function T(e){let{fallback:t,renderUnsupported:n,...r}=e,i=o(),[a]=(0,E.useState)(p),[s,c]=(0,E.useState)(null);return a.supported?(0,D.jsxs)(`div`,{style:k,children:[(0,D.jsx)(E.Suspense,{fallback:(0,D.jsx)(`div`,{style:A,children:t??i(`molecule3d.loadingViewer`)}),children:(0,D.jsx)(O,{...r,onFailureChange:c})}),s!==null&&(0,D.jsx)(l,{intent:`danger`,compact:!0,title:i(`molecule3d.couldNotDraw`),children:s})]}):(0,D.jsx)(l,{intent:`warning`,compact:!0,children:n?.(a)??i.or(`viewer.capability.${a.reason}`,a.message)})}var E,D,O,k,A;function j(){return(j=e((()=>{c(),E=i(),s(),D=a(),n(),O=(0,E.lazy)(async()=>({default:(await r(()=>import(`./MoleculeCanvas3D-DiPzTALh.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55]),import.meta.url)).MoleculeCanvas3D})),k={display:`flex`,flexDirection:`column`,gap:6,flex:`1 0 auto`,minWidth:0},A={display:`flex`,alignItems:`center`,justifyContent:`center`,minHeight:320,fontSize:13},T.__docgenInfo={description:`The 3D molecule viewer.
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
@default 'Loading the 3D viewer…'`},renderUnsupported:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(capability: ViewerCapability) => ReactNode`,signature:{arguments:[{type:{name:`ViewerCapability`},name:`capability`}],return:{name:`ReactNode`}}},description:"What to show when the machine cannot render at all.\n@default undefined — `capability.message` is written"}}}})))()}var M=t({Default:()=>L,PolarSurface:()=>H,SharedCamera:()=>U,SurfaceAndSpin:()=>B,ViewOnly:()=>R,WithMeasurement:()=>z,__namedExportsOrder:()=>K,default:()=>I});function N(e){let[t,n]=(0,P.useState)(e.initialCamera??null),[r,i]=(0,P.useState)(null),[a,o]=(0,P.useState)(0);return(0,F.jsxs)(`div`,{style:W,children:[(0,F.jsx)(`div`,{style:G,children:(0,F.jsx)(T,{...e,initialCamera:t,onCameraChange:i},a)}),(0,F.jsx)(`button`,{type:`button`,disabled:r===null,onClick:()=>{n(r),i(null),o(e=>e+1)},children:`Open the link`}),(0,F.jsx)(`code`,{"data-testid":`molecule3d-camera`,children:r===null?`—`:m(r)})]})}var P,F,I,L,R,z,B,V,H,U,W,G,K;function q(){return(q=e((()=>{P=i(),w(),j(),F=a(),I={title:`Molecule3D/MoleculeViewer3D`,component:T,args:{molfile:{format:`mol`,data:`#1
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
`}},parameters:{layout:`padded`,docs:{description:{component:`A molecule in 3D with molstar, and a react-science toolbar over the canvas: distance, angle and dihedral measurements, spin, the molecular surface, a view reset and a popover of display options. Each tool can be switched off, and settings, spin and measurements can be owned by the site or left to the component.`}}},render:e=>(0,F.jsx)(`div`,{style:{width:`min(36rem, 90vw)`,height:420,display:`flex`},children:(0,F.jsx)(T,{...e})})},L={},R={args:{tools:{measure:!1,options:!1}}},z={args:{defaultSettings:{representation:`stick`},measurements:[{kind:`dihedral`,atoms:[{unit:0,element:0},{unit:0,element:1},{unit:0,element:2},{unit:0,element:3}]}]}},B={args:{defaultSettings:{showSurface:!0},defaultSpinning:!0}},V=`ethanol
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
`,H={args:{molfile:{format:`mol`,data:V},defaultSettings:{showSurface:!0,surfaceColoring:`polarity`}}},U={args:{initialCamera:{rotation:[0,Math.SQRT1_2,0,Math.SQRT1_2],zoom:1,offset:[0,0,0]}},render:e=>(0,F.jsx)(N,{...e})},W={display:`grid`,gap:8,justifyItems:`start`},G={width:`min(36rem, 90vw)`,height:420,display:`flex`},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{}`,...L.parameters?.docs?.source},description:{story:`Every tool on.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    tools: {
      measure: false,
      options: false
    }
  }
}`,...R.parameters?.docs?.source},description:{story:`Only the view tools: no measuring, no options popover.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source},description:{story:`A dihedral already drawn, down the C1–C2–C3–C4 backbone.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSettings: {
      showSurface: true
    },
    defaultSpinning: true
  }
}`,...B.parameters?.docs?.source},description:{story:`The surface on, and the model turning.`,...B.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source},description:{story:`The surface of ethanol, its hydroxyl coloured as the polar part.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    // A quarter turn about the vertical axis.
    initialCamera: {
      rotation: [0, Math.SQRT1_2, 0, Math.SQRT1_2],
      zoom: 1,
      offset: [0, 0, 0]
    }
  },
  render: args => <SharedCameraDemo {...args} />
}`,...U.parameters?.docs?.source},description:{story:`A camera carried by a link: the viewer opens on butane seen from the side,
reports where the reader leaves the camera once it settles, and "Open the
link" reopens it from that report, as a visitor following the link would.`,...U.parameters?.docs?.description}}},K=[`Default`,`ViewOnly`,`WithMeasurement`,`SurfaceAndSpin`,`PolarSurface`,`SharedCamera`]})))()}export{h as a,w as i,q as n,m as r,M as t};