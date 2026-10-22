const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./MoleculeCanvas3D-T7v6OQMX.js","./rolldown-runtime-C0FnF6B9.js","./preload-helper-BHmFeTtP.js","./iframe-md6M1udn.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./lookup-attq9aNX.js","./languageParam-Df9LHAQM.js","./iframe-C6zn77S7.css","./view-model-C6MwoMCx.js","./iconTypes-BdKrNP8V.js","./figurePng-DDBczyt8.js","./clipboardItem-DgnwasWh.js","./useT-hQc5688x.js","./classnames-h4eSfqWI.js","./components-BHh413ob.js","./icon-BSvpnYwc.js","./react-dom-D3J1MuSr.js","./shim-NjghvuDz.js","./esm-CVV7O0lL.js","./compareUtils-BNJHdftm.js","./refs-DM6K3Fls.js","./functionUtils-Dvcj2yDM.js","./abstractPureComponent-JT2tNFfY.js","./useValidateProps-COqPEMaK.js","./menuItem-BkT4qZgY.js","./text-Btuy2CRc.js","./popoverNextMigrationUtils-DdOWiyXU.js","./overlay2-D0NV21Mo.js","./extends-D4puxXF7.js","./floating-ui.react-dom-iqyooTxm.js","./numericInput-BgHEEyMo.js","./buttons-YKR8yP06.js","./useInteractiveAttributes-BW09uHvP.js","./controlGroup-CvhRnfLN.js","./inputGroup-CQMrJROz.js","./callout-Duj0Aoor.js","./html-GlzW7KVP.js","./dialog-BxVIife4.js","./small-cross-OHO7oL7s.js","./collapse-iFQPqDoH.js","./tooltip-47eAh837.js","./controls-CcEzbQuG.js","./htmlTable-BnHLiTLG.js","./tag-RUu3MF-a.js","./emotion-styled.browser.esm-DGy155iJ.js","./segmentedControl-C6zM7w2c.js","./slider-7k_TO3x3.js","./multiSlider-D-59YAWw.js","./useFigureTask-BMzTqxIc.js","./OverlaySegmented-spcGcG7s.js","./HelpTooltip-Dxpb_Nyg.js","./joinClassNames-BbK_6p9Z.js","./overlayRowStyles-ZmfttMho.js","./overlaySurface-C_yaWLTS.js","./listNavigation-DiDrqnQ0.js","./keyTargets-DrtppKcc.js","./OverlaySelect-DrHECRn3.js","./htmlSelect-DkwkpIFi.js","./menuDivider-CKWi4506.js","./OverlayValueButton-ChIhG7Zn.js","./useOverlayInteraction-CHH8Yjl4.js","./HelpIcon-CQHgQnUH.js","./helpName-uK3f7RM1.js","./overlayPanelStyles-0bk36ILE.js","./numbers-BxzU8aH2.js","./clamp-M7_x50VL.js","./familyTokens-DsQXXJV4.js","./downloadBlob-BXFxYCsP.js","./sanitizeFileName-DTX4aT6A.js"])))=>i.map(i=>d[i]);
import{n as e,r as t}from"./rolldown-runtime-C0FnF6B9.js";import{n,t as r}from"./preload-helper-BHmFeTtP.js";import{h as i,n as a}from"./iframe-md6M1udn.js";import{t as o}from"./clamp-M7_x50VL.js";import{n as s,t as ee}from"./roundTo-BbWJSCmm.js";import{n as te,t as ne}from"./useT-hQc5688x.js";import{n as re,t as c}from"./callout-Duj0Aoor.js";import{n as ie}from"./capability-Cg3uaR0U.js";function l(e){let{rotation:t,zoom:n,offset:r}=u(e),i=[];for(let e=0;e<4;e++)i.push(String(s(t[e]??0,h)));if(i.push(String(s(n,g))),r[0]!==0||r[1]!==0||r[2]!==0)for(let e of r)i.push(String(s(e,g)));return i.join(`,`)}function u(e){let t=ae(e.rotation);return t===null?f:{rotation:t,zoom:oe(e.zoom),offset:[d(e.offset[0]),d(e.offset[1]),d(e.offset[2])]}}function ae(e){let t=0;for(let n=0;n<4;n++){let r=e[n]??0;if(!Number.isFinite(r))return null;t+=r*r}if(t<=0)return null;let n=1/Math.sqrt(t);return[e[0]*n,e[1]*n,e[2]*n,e[3]*n]}function oe(e){let{minimum:t,maximum:n}=p;return o(e,t,n,1)}function d(e){return o(e,-100,m,0)}var f,p,m,h,g;function _(){return(_=e((()=>{ee(),f={rotation:[0,0,0,1],zoom:1,offset:[0,0,0]},p={minimum:.01,maximum:100},m=100,h=4,g=3})))()}function v(e){let{fallback:t,renderUnsupported:n,...r}=e,i=te(),[a]=(0,y.useState)(ie),[o,s]=(0,y.useState)(null);return a.supported?(0,b.jsxs)(`div`,{style:S,children:[(0,b.jsx)(y.Suspense,{fallback:(0,b.jsx)(`div`,{style:C,children:t??i(`molecule3d.loadingViewer`)}),children:(0,b.jsx)(x,{...r,onFailureChange:s})}),o!==null&&(0,b.jsx)(c,{intent:`danger`,compact:!0,title:i(`molecule3d.couldNotDraw`),children:o})]}):(0,b.jsx)(c,{intent:`warning`,compact:!0,children:n?.(a)??i.or(`viewer.capability.${a.reason}`,a.message)})}var y,b,x,S,C;function w(){return(w=e((()=>{re(),y=i(),ne(),b=a(),n(),x=(0,y.lazy)(async()=>({default:(await r(()=>import(`./MoleculeCanvas3D-T7v6OQMX.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69]),import.meta.url)).MoleculeCanvas3D})),S={display:`flex`,flexDirection:`column`,gap:6,flex:`1 0 auto`,minWidth:0},C={display:`flex`,alignItems:`center`,justifyContent:`center`,minHeight:320,fontSize:13},v.__docgenInfo={description:`The 3D molecule viewer.
@param props - See {@link MoleculeViewer3DProps}.
@returns The viewer, or an explanation of why this machine cannot show one.`,methods:[],displayName:`MoleculeViewer3D`,props:{molfile:{required:!0,tsType:{name:`union`,raw:`Molecule3DFile | null`,elements:[{name:`Molecule3DFile`},{name:`null`}]},description:"The molecule to draw, with 3D coordinates, or `null` for none."},frameNewMolecule:{required:!1,tsType:{name:`union`,raw:`'keep' | 'front'`,elements:[{name:`literal`,value:`'keep'`},{name:`literal`,value:`'front'`}]},description:`How the camera meets a new molecule. \`keep\` glides to it along the current
direction, which suits conformers of one molecule; \`front\` jumps to it
looking down -z with y up, so unrelated molecules, each laid out in its
file the way it reads best, never swing in from the previous view.
@default 'keep'`},tools:{required:!1,tsType:{name:`Partial`,elements:[{name:`Molecule3DTools`}],raw:`Partial<Molecule3DTools>`},description:`Which buttons the toolbar over the canvas shows; tools not named stay on.
@default every tool`},settings:{required:!1,tsType:{name:`Molecule3DSettings`},description:`How the model is drawn, when the site owns it.
@default undefined`},defaultSettings:{required:!1,tsType:{name:`Partial`,elements:[{name:`Molecule3DSettings`}],raw:`Partial<Molecule3DSettings>`},description:`Starting settings when the component owns them, and what the options'
reset button returns to either way.
@default DEFAULT_MOLECULE_3D_SETTINGS`},onSettingsChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(settings: Molecule3DSettings) => void`,signature:{arguments:[{type:{name:`Molecule3DSettings`},name:`settings`}],return:{name:`void`}}},description:`Called with the new settings after any change from the toolbar.
@default undefined`},spinning:{required:!1,tsType:{name:`boolean`},description:`Whether the model turns on its own, when the site owns it.
@default undefined`},defaultSpinning:{required:!1,tsType:{name:`boolean`},description:`Starting spin when the component owns it.
@default false`},onSpinningChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(spinning: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`spinning`}],return:{name:`void`}}},description:`Called when the spin toggle is pressed.
@default undefined`},spinSpeed:{required:!1,tsType:{name:`number`},description:`Turn rate, in molstar's own spin unit.
@default 1 / 3`},measurements:{required:!1,tsType:{name:`unknown`},description:`The measurements drawn over the model, when the site owns them. They name
atoms by position, so they carry over to another conformer of the same
molecule; a site showing an unrelated molecule should clear them.
@default undefined`},onMeasurementsChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(measurements: readonly Measurement[]) => void`,signature:{arguments:[{type:{name:`unknown`},name:`measurements`}],return:{name:`void`}}},description:`Called with the whole list after a measurement is added or cleared.
@default undefined`},highlights:{required:!1,tsType:{name:`unknown`},description:`The parts of the model to emphasise in the site's accent colour, each a
bonded path of atoms named as measurements name them: two atoms are that
bond, three the two bonds of an angle, four the three bonds of a dihedral,
and one atom is that atom alone. Only the bonds between consecutive atoms
of one path are emphasised, never another bond between two highlighted
atoms, and an atom the structure lacks is skipped. Changing them repaints
the model and nothing else: the camera, the measurements and the hover are
left as they are.
@default [] — nothing is emphasised`},initialCamera:{required:!1,tsType:{name:`union`,raw:`Molecule3DCamera | null`,elements:[{name:`Molecule3DCamera`},{name:`null`}]},description:`Where the camera stands when the first molecule is framed — what a shared
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
@default 'Loading the 3D viewer…'`},renderUnsupported:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(capability: ViewerCapability) => ReactNode`,signature:{arguments:[{type:{name:`ViewerCapability`},name:`capability`}],return:{name:`ReactNode`}}},description:"What to show when the machine cannot render at all.\n@default undefined — `capability.message` is written"}}}})))()}function T(...e){let t=[];for(let n of e){let e=[];for(let t of n)e.push({unit:0,element:t});t.push({atoms:e})}return t}var E,D;function O(){return(O=e((()=>{E=`acetone
OCL MolfileCreator  3D

 10  9  0  0  0  0  0  0  0  0999 V2000
    3.2536   -1.3365    2.4418 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.0458   -0.7612    1.7529 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.7765   -1.0376    0.5849 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.1837    0.1689    2.5629 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7939   -1.9918    1.7529 H   0  0  0  0  0  0  0  0  0  0  0  0
    3.9178   -0.5268    2.7536 H   0  0  0  0  0  0  0  0  0  0  0  0
    2.9368   -1.9203    3.3096 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.3443    0.5172    1.9547 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.7925   -0.3607    3.4350 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.7735    1.0328    2.8790 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  2  0  0  0  0
  2  4  1  0  0  0  0
  1  5  1  0  0  0  0
  1  6  1  0  0  0  0
  1  7  1  0  0  0  0
  4  8  1  0  0  0  0
  4  9  1  0  0  0  0
  4 10  1  0  0  0  0
M  END
`,D=[{label:`None`,highlights:[]},{label:`C–C 1.505 Å ×2`,highlights:T([0,1],[1,3])},{label:`C=O 1.230 Å`,highlights:T([1,2])},{label:`C–H 1.093 Å ×6`,highlights:T([0,4],[0,5],[0,6],[3,7],[3,8],[3,9])},{label:`C–C–C 116.7°`,highlights:T([0,1,3])},{label:`C–C=O 121.6° ×2`,highlights:T([0,1,2],[3,1,2])},{label:`C1 and C4`,highlights:T([0],[3])}]})))()}function k(e){let[t,n]=(0,A.useState)(M),[r,i]=(0,A.useState)(null),a=D[r??t]??D[0];return(0,j.jsxs)(`div`,{style:N,children:[(0,j.jsx)(`div`,{style:P,children:(0,j.jsx)(v,{...e,highlights:a?.highlights})}),(0,j.jsx)(`div`,{style:F,role:`group`,"aria-label":`Geometry`,children:D.map((e,r)=>(0,j.jsx)(`button`,{type:`button`,"aria-pressed":r===t,style:r===t?L:I,onClick:()=>n(r),onPointerEnter:()=>i(r),onPointerLeave:()=>i(null),onFocus:()=>i(r),onBlur:()=>i(null),children:e.label},e.label))})]})}var A,j,M,N,P,F,I,L;function R(){return(R=e((()=>{A=i(),w(),O(),j=a(),M=3,N={display:`grid`,gridTemplateColumns:`minmax(0, 1fr) auto`,alignItems:`start`,gap:12,width:`min(48rem, 92vw)`},P={height:420,display:`flex`},F={display:`grid`,gap:4,fontSize:13},I={padding:`4px 10px`,borderWidth:1,borderStyle:`solid`,borderColor:`var(--border)`,borderRadius:6,background:`var(--surface)`,color:`var(--text)`,font:`inherit`,textAlign:`left`,cursor:`pointer`},L={...I,borderColor:`var(--accent)`,color:`var(--accent)`},k.__docgenInfo={description:`The viewer beside the rows of a geometry card. The row under the pointer or
holding the focus is highlighted on the model, as on the card; otherwise the
row last clicked is.
@param props - Whatever the story's controls hold.
@returns The viewer and the rows.`,methods:[],displayName:`GeometryHighlightsDemo`,props:{molfile:{required:!0,tsType:{name:`union`,raw:`Molecule3DFile | null`,elements:[{name:`Molecule3DFile`},{name:`null`}]},description:"The molecule to draw, with 3D coordinates, or `null` for none."},frameNewMolecule:{required:!1,tsType:{name:`union`,raw:`'keep' | 'front'`,elements:[{name:`literal`,value:`'keep'`},{name:`literal`,value:`'front'`}]},description:`How the camera meets a new molecule. \`keep\` glides to it along the current
direction, which suits conformers of one molecule; \`front\` jumps to it
looking down -z with y up, so unrelated molecules, each laid out in its
file the way it reads best, never swing in from the previous view.
@default 'keep'`},tools:{required:!1,tsType:{name:`Partial`,elements:[{name:`Molecule3DTools`}],raw:`Partial<Molecule3DTools>`},description:`Which buttons the toolbar over the canvas shows; tools not named stay on.
@default every tool`},settings:{required:!1,tsType:{name:`Molecule3DSettings`},description:`How the model is drawn, when the site owns it.
@default undefined`},defaultSettings:{required:!1,tsType:{name:`Partial`,elements:[{name:`Molecule3DSettings`}],raw:`Partial<Molecule3DSettings>`},description:`Starting settings when the component owns them, and what the options'
reset button returns to either way.
@default DEFAULT_MOLECULE_3D_SETTINGS`},onSettingsChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(settings: Molecule3DSettings) => void`,signature:{arguments:[{type:{name:`Molecule3DSettings`},name:`settings`}],return:{name:`void`}}},description:`Called with the new settings after any change from the toolbar.
@default undefined`},spinning:{required:!1,tsType:{name:`boolean`},description:`Whether the model turns on its own, when the site owns it.
@default undefined`},defaultSpinning:{required:!1,tsType:{name:`boolean`},description:`Starting spin when the component owns it.
@default false`},onSpinningChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(spinning: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`spinning`}],return:{name:`void`}}},description:`Called when the spin toggle is pressed.
@default undefined`},spinSpeed:{required:!1,tsType:{name:`number`},description:`Turn rate, in molstar's own spin unit.
@default 1 / 3`},measurements:{required:!1,tsType:{name:`unknown`},description:`The measurements drawn over the model, when the site owns them. They name
atoms by position, so they carry over to another conformer of the same
molecule; a site showing an unrelated molecule should clear them.
@default undefined`},onMeasurementsChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(measurements: readonly Measurement[]) => void`,signature:{arguments:[{type:{name:`unknown`},name:`measurements`}],return:{name:`void`}}},description:`Called with the whole list after a measurement is added or cleared.
@default undefined`},highlights:{required:!1,tsType:{name:`unknown`},description:`The parts of the model to emphasise in the site's accent colour, each a
bonded path of atoms named as measurements name them: two atoms are that
bond, three the two bonds of an angle, four the three bonds of a dihedral,
and one atom is that atom alone. Only the bonds between consecutive atoms
of one path are emphasised, never another bond between two highlighted
atoms, and an atom the structure lacks is skipped. Changing them repaints
the model and nothing else: the camera, the measurements and the hover are
left as they are.
@default [] — nothing is emphasised`},initialCamera:{required:!1,tsType:{name:`union`,raw:`Molecule3DCamera | null`,elements:[{name:`Molecule3DCamera`},{name:`null`}]},description:`Where the camera stands when the first molecule is framed — what a shared
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
@default 'Loading the 3D viewer…'`},renderUnsupported:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(capability: ViewerCapability) => ReactNode`,signature:{arguments:[{type:{name:`ViewerCapability`},name:`capability`}],return:{name:`ReactNode`}}},description:"What to show when the machine cannot render at all.\n@default undefined — `capability.message` is written"}}}})))()}var se=t({Default:()=>H,Highlights:()=>G,PolarSurface:()=>J,SharedCamera:()=>Y,SurfaceAndSpin:()=>K,ViewOnly:()=>U,WithMeasurement:()=>W,__namedExportsOrder:()=>Q,default:()=>V});function ce(e){let[t,n]=(0,z.useState)(e.initialCamera??null),[r,i]=(0,z.useState)(null),[a,o]=(0,z.useState)(0);return(0,B.jsxs)(`div`,{style:X,children:[(0,B.jsx)(`div`,{style:Z,children:(0,B.jsx)(v,{...e,initialCamera:t,onCameraChange:i},a)}),(0,B.jsx)(`button`,{type:`button`,disabled:r===null,onClick:()=>{n(r),i(null),o(e=>e+1)},children:`Open the link`}),(0,B.jsx)(`code`,{"data-testid":`molecule3d-camera`,children:r===null?`—`:l(r)})]})}var z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{z=i(),_(),w(),R(),O(),B=a(),V={title:`Molecule3D/MoleculeViewer3D`,component:v,args:{molfile:{format:`mol`,data:`#1
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
`}},parameters:{layout:`padded`,docs:{description:{component:`A molecule in 3D with molstar, and a react-science toolbar over the canvas: distance, angle and dihedral measurements, spin, the molecular surface, a view reset and a popover of display options. Each tool can be switched off, and settings, spin and measurements can be owned by the site or left to the component.`}}},render:e=>(0,B.jsx)(`div`,{style:{width:`min(36rem, 90vw)`,height:420,display:`flex`},children:(0,B.jsx)(v,{...e})})},H={},U={args:{tools:{measure:!1,options:!1}}},W={args:{defaultSettings:{representation:`stick`},measurements:[{kind:`dihedral`,atoms:[{unit:0,element:0},{unit:0,element:1},{unit:0,element:2},{unit:0,element:3}]}]}},G={args:{molfile:{format:`mol`,data:E}},render:e=>(0,B.jsx)(k,{...e})},K={args:{defaultSettings:{showSurface:!0},defaultSpinning:!0}},q=`ethanol
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
`,J={args:{molfile:{format:`mol`,data:q},defaultSettings:{showSurface:!0,surfaceColoring:`polarity`}}},Y={args:{initialCamera:{rotation:[0,Math.SQRT1_2,0,Math.SQRT1_2],zoom:1,offset:[0,0,0]}},render:e=>(0,B.jsx)(ce,{...e})},X={display:`grid`,gap:8,justifyItems:`start`},Z={width:`min(36rem, 90vw)`,height:420,display:`flex`},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{}`,...H.parameters?.docs?.source},description:{story:`Every tool on.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    tools: {
      measure: false,
      options: false
    }
  }
}`,...U.parameters?.docs?.source},description:{story:`Only the view tools: no measuring, no options popover.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source},description:{story:`A dihedral already drawn, down the C1–C2–C3–C4 backbone.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    molfile: {
      format: 'mol',
      data: ACETONE
    }
  },
  render: args => <GeometryHighlightsDemo {...args} />
}`,...G.parameters?.docs?.source},description:{story:`Acetone beside its geometry, as a 3D answer card lists it. The row under the
pointer, or the one last clicked, is highlighted on the model: C–H ×6 to
begin with, whose six bonds and eight atoms take the site's accent while the
C–C and C=O bonds between them keep their colours.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSettings: {
      showSurface: true
    },
    defaultSpinning: true
  }
}`,...K.parameters?.docs?.source},description:{story:`The surface on, and the model turning.`,...K.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source},description:{story:`The surface of ethanol, its hydroxyl coloured as the polar part.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    // A quarter turn about the vertical axis.
    initialCamera: {
      rotation: [0, Math.SQRT1_2, 0, Math.SQRT1_2],
      zoom: 1,
      offset: [0, 0, 0]
    }
  },
  render: args => <SharedCameraDemo {...args} />
}`,...Y.parameters?.docs?.source},description:{story:`A camera carried by a link: the viewer opens on butane seen from the side,
reports where the reader leaves the camera once it settles, and "Open the
link" reopens it from that report, as a visitor following the link would.`,...Y.parameters?.docs?.description}}},Q=[`Default`,`ViewOnly`,`WithMeasurement`,`Highlights`,`SurfaceAndSpin`,`PolarSurface`,`SharedCamera`]})))()}export{u as a,_ as i,$ as n,l as r,se as t};