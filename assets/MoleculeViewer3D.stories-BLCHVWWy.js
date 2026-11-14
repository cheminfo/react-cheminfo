const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./MoleculeCanvas3D-DuHpCAv9.js","./rolldown-runtime-C0FnF6B9.js","./preload-helper-BHmFeTtP.js","./iframe-DWcMHbPi.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./lookup-CpV0sFxC.js","./languageParam-dyZ4WZE3.js","./iframe-IQqMMwgO.css","./useT-D6_6ezoi.js","./exportMoleculeImage-2KaFYeMH.js","./iconTypes-BdKrNP8V.js","./clamp-M7_x50VL.js","./escape-B91KP0sZ.js","./downloadBlob-BXFxYCsP.js","./sanitizeFileName-DTX4aT6A.js","./pageFigureSource-CH-urGJO.js","./figureFileName-BjJMtCwp.js","./classnames-i1QMHG1H.js","./components-D9RsahCW.js","./icon-CtlGGNpi.js","./react-dom-BBb6VqzA.js","./shim-gYRo2W-f.js","./esm-CVV7O0lL.js","./compareUtils-BNJHdftm.js","./refs-DM6K3Fls.js","./functionUtils-Dvcj2yDM.js","./abstractPureComponent-BnCWjvpt.js","./useValidateProps-BN1U-KdV.js","./menuItem-DtaKxc2i.js","./text-DQKxwO6X.js","./popoverNextMigrationUtils-Bvi5PJHu.js","./overlay2-Dkuuw0qb.js","./extends-D4puxXF7.js","./floating-ui.react-dom-R63ua83k.js","./numericInput-C3qQrX8N.js","./buttons-DiDGo5HE.js","./useInteractiveAttributes-DY1FuKex.js","./buttonGroup-CqaC2Lf2.js","./controlGroup-BPWGSAJJ.js","./inputGroup-V6S2uKuz.js","./callout-6I0fxH5K.js","./html-B0iJiWOF.js","./dialog-C4y8p1wb.js","./small-cross-zFt6NyGh.js","./collapse-9C_xtKqv.js","./tooltip-D1_vkjKl.js","./dialogBody-DJb2f9qw.js","./controls-j5Z3w7A8.js","./htmlTable-PVmDxtBn.js","./tag-DhlR-nUM.js","./emotion-styled.browser.esm-No5LDfDW.js","./segmentedControl-CI3wa1hH.js","./slider-VvFNmj7d.js","./multiSlider-CI2EGtCj.js","./OverlaySegmented-wNGYhmax.js","./HelpTooltip-DrBXxpBc.js","./joinClassNames-BbK_6p9Z.js","./overlayRowStyles-ZmfttMho.js","./overlaySurface-Dy2h4aeq.js","./listNavigation-DJviafMM.js","./keyTargets-DZXROCyP.js","./useFigureTask-V5WV5Fix.js","./roundTo-BbWJSCmm.js","./OverlaySelect-BJWFSUTA.js","./htmlSelect-BLvbpbYY.js","./menuDivider-9pKEFQeE.js","./OverlayValueButton-Dotq_5Pc.js","./useOverlayInteraction-CF-PYMr4.js","./OverlayGroup-l_mU307_.js","./overlayControlStyles-Cp84ya1b.js","./HelpIcon-gKqBGT7L.js","./helpName-uK3f7RM1.js","./writeToClipboard-BdDspRGP.js","./familyTokens-DsQXXJV4.js","./copySvg-BvYrQFND.js","./NumberInput-CPsf_eHt.js","./numberText-D1zMExL9.js","./useAsync-Dwg0mXG2.js","./toError-DY-iNW4J.js","./downloadText-CyPIj0Pc.js","./molfile-CbOeyHgM.js","./structureNotationText-DqoCCjHj.js","./numbers-BxzU8aH2.js","./FullscreenStage-BQC98sn2.js","./copyFigure-TVNyqkKs.js"])))=>i.map(i=>d[i]);
import{n as e,r as t}from"./rolldown-runtime-C0FnF6B9.js";import{n,t as r}from"./preload-helper-BHmFeTtP.js";import{h as i,n as a}from"./iframe-DWcMHbPi.js";import{n as o,t as s}from"./useT-D6_6ezoi.js";import{t as c}from"./clamp-M7_x50VL.js";import{n as l,t as ee}from"./roundTo-BbWJSCmm.js";import{n as te,t as u}from"./callout-6I0fxH5K.js";import{n as ne}from"./capability-Cg3uaR0U.js";function d(e){let{rotation:t,zoom:n,offset:r}=f(e),i=[];for(let e=0;e<4;e++)i.push(String(l(t[e]??0,_)));if(i.push(String(l(n,v))),r[0]!==0||r[1]!==0||r[2]!==0)for(let e of r)i.push(String(l(e,v)));return i.join(`,`)}function f(e){let t=re(e.rotation);return t===null?m:{rotation:t,zoom:ie(e.zoom),offset:[p(e.offset[0]),p(e.offset[1]),p(e.offset[2])]}}function re(e){let t=0;for(let n=0;n<4;n++){let r=e[n]??0;if(!Number.isFinite(r))return null;t+=r*r}if(t<=0)return null;let n=1/Math.sqrt(t);return[e[0]*n,e[1]*n,e[2]*n,e[3]*n]}function ie(e){let{minimum:t,maximum:n}=h;return c(e,t,n,1)}function p(e){return c(e,-100,g,0)}var m,h,g,_,v;function y(){return(y=e((()=>{ee(),m={rotation:[0,0,0,1],zoom:1,offset:[0,0,0]},h={minimum:.01,maximum:100},g=100,_=4,v=3})))()}function b(e){let{fallback:t,renderUnsupported:n,...r}=e,i=o(),[a]=(0,x.useState)(ne),[s,c]=(0,x.useState)(null);return a.supported?(0,S.jsxs)(`div`,{style:w,children:[(0,S.jsx)(x.Suspense,{fallback:(0,S.jsx)(`div`,{style:T,children:t??i(`molecule3d.loadingViewer`)}),children:(0,S.jsx)(C,{...r,onFailureChange:c})}),s!==null&&(0,S.jsx)(u,{intent:`danger`,compact:!0,title:i(`molecule3d.couldNotDraw`),children:s})]}):(0,S.jsx)(u,{intent:`warning`,compact:!0,children:n?.(a)??i.or(`viewer.capability.${a.reason}`,a.message)})}var x,S,C,w,T;function E(){return(E=e((()=>{te(),x=i(),s(),S=a(),n(),C=(0,x.lazy)(async()=>({default:(await r(()=>import(`./MoleculeCanvas3D-DuHpCAv9.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85]),import.meta.url)).MoleculeCanvas3D})),w={display:`flex`,flexDirection:`column`,gap:6,flex:`1 0 auto`,minWidth:0},T={display:`flex`,alignItems:`center`,justifyContent:`center`,minHeight:320,fontSize:13},b.__docgenInfo={description:`The 3D molecule viewer.
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
@default 1 / 3`},playing:{required:!1,tsType:{name:`boolean`},description:`Whether the frames of a file holding several are played in a loop. A file
of one model stays still whatever this says.
@default false`},framesPerSecond:{required:!1,tsType:{name:`number`},description:`How many frames are shown per second while playing, and in an animated
PNG; molstar plays between 5 and 60.
@default 25`},measurements:{required:!1,tsType:{name:`unknown`},description:`The measurements drawn over the model, when the site owns them. They name
atoms by position, so they carry over to another conformer of the same
molecule; a site showing an unrelated molecule should clear them. Changing
them redraws the measurements and nothing else: the model, its highlights
and the camera are left as they are.
@default undefined`},onMeasurementsChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(measurements: readonly Measurement[]) => void`,signature:{arguments:[{type:{name:`unknown`},name:`measurements`}],return:{name:`void`}}},description:`Called with the whole list after a measurement is added or cleared.
@default undefined`},highlights:{required:!1,tsType:{name:`unknown`},description:`The parts of the model to emphasise in the site's accent colour, each a
bonded path of atoms named as measurements name them: two atoms are that
bond, three the two bonds of an angle, four the three bonds of a dihedral,
and one atom is that atom alone. Only the bonds between consecutive atoms
of one path are emphasised, never another bond between two highlighted
atoms, and an atom the structure lacks is skipped. Changing them repaints
the model and nothing else: the camera, the measurements and the hover are
left as they are.
@default [] — nothing is emphasised`},onAtomHover:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(atom: AtomReference | null) => void`,signature:{arguments:[{type:{name:`union`,raw:`AtomReference | null`,elements:[{name:`AtomReference`},{name:`null`}]},name:`atom`}],return:{name:`void`}}},description:"Called with the atom the pointer comes to rest on, addressed as\n`highlights` address atoms, and with `null` once it leaves the atoms — so\na table read beside the model can light the row of that atom.\n@default undefined"},initialCamera:{required:!1,tsType:{name:`union`,raw:`Molecule3DCamera | null`,elements:[{name:`Molecule3DCamera`},{name:`null`}]},description:`Where the camera stands when the first molecule is framed — what a shared
link carries. The camera belongs to whoever is dragging it afterwards, so
this is read once and a later change is ignored; the viewer reports every
move through \`onCameraChange\` instead.
@default null — the molecule is framed as \`frameNewMolecule\` says`},onCameraChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(camera: Molecule3DCamera) => void`,signature:{arguments:[{type:{name:`Molecule3DCamera`},name:`camera`}],return:{name:`void`}}},description:`Called once the camera has come to rest, with where it stands. Not called
while the model is spinning: a spinning camera has no orientation to keep.
@default undefined`},cameraSettleDelay:{required:!1,tsType:{name:`number`},description:`How long the camera must be still before \`onCameraChange\` is called,
milliseconds, so one drag is one report rather than one per frame.
@default 400`},fileName:{required:!1,tsType:{name:`string`},description:`Name of an exported image, without its extension.
@default 'molecule'`},onCapture:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(capture: Molecule3DCapture | null) => void`,signature:{arguments:[{type:{name:`union`,raw:`Molecule3DCapture | null`,elements:[{name:`Molecule3DCapture`},{name:`null`}]},name:`capture`}],return:{name:`void`}}},description:`Handed the means to render the scene on screen once the viewer exists, and
\`null\` when it goes — for a page that hands the picture on, to a host
framing it. Keep it stable: a new function is handed the means again.
@default undefined`},background:{required:!1,tsType:{name:`string`},description:"Scene background, as `#rrggbb`.\n@default '#ffffff'"},minHeight:{required:!1,tsType:{name:`number`},description:`Smallest height of the canvas, pixels.
@default 320`},fallback:{required:!1,tsType:{name:`ReactNode`},description:`What to show while molstar is downloading.
@default 'Loading the 3D viewer…'`},renderUnsupported:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(capability: ViewerCapability) => ReactNode`,signature:{arguments:[{type:{name:`ViewerCapability`},name:`capability`}],return:{name:`ReactNode`}}},description:"What to show when the machine cannot render at all.\n@default undefined — `capability.message` is written"}}}})))()}function D(...e){let t=[];for(let n of e){let e=[];for(let t of n)e.push({unit:0,element:t});t.push({atoms:e})}return t}var ae,O;function k(){return(k=e((()=>{ae=`acetone
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
`,O=[{label:`None`,highlights:[]},{label:`C–C 1.505 Å ×2`,highlights:D([0,1],[1,3])},{label:`C=O 1.230 Å`,highlights:D([1,2])},{label:`C–H 1.093 Å ×6`,highlights:D([0,4],[0,5],[0,6],[3,7],[3,8],[3,9])},{label:`C–C–C 116.7°`,highlights:D([0,1,3])},{label:`C–C=O 121.6° ×2`,highlights:D([0,1,2],[3,1,2])},{label:`C1 and C4`,highlights:D([0],[3])}]})))()}function A(e){let[t,n]=(0,j.useState)(N),[r,i]=(0,j.useState)(null),[a,o]=(0,j.useState)(null),s=O[r??t]??O[0];return(0,M.jsxs)(`div`,{style:P,children:[(0,M.jsx)(`div`,{style:F,children:(0,M.jsx)(b,{...e,highlights:s?.highlights,onAtomHover:o})}),(0,M.jsxs)(`div`,{style:I,role:`group`,"aria-label":`Geometry`,children:[O.map((e,r)=>(0,M.jsx)(`button`,{type:`button`,"aria-pressed":r===t,style:r===t?R:L,onClick:()=>n(r),onPointerEnter:()=>i(r),onPointerLeave:()=>i(null),onFocus:()=>i(r),onBlur:()=>i(null),children:e.label},e.label)),(0,M.jsx)(`output`,{"aria-label":`Atom under the pointer`,children:a===null?`none`:`atom ${a.element+1}`})]})]})}var j,M,N,P,F,I,L,R;function z(){return(z=e((()=>{j=i(),E(),k(),M=a(),N=3,P={display:`grid`,gridTemplateColumns:`minmax(0, 1fr) auto`,alignItems:`start`,gap:12,width:`min(48rem, 92vw)`},F={height:420,display:`flex`},I={display:`grid`,gap:4,fontSize:13},L={padding:`4px 10px`,borderWidth:1,borderStyle:`solid`,borderColor:`var(--border)`,borderRadius:6,background:`var(--surface)`,color:`var(--text)`,font:`inherit`,textAlign:`left`,cursor:`pointer`},R={...L,borderColor:`var(--accent)`,color:`var(--accent)`},A.__docgenInfo={description:`The viewer beside the rows of a geometry card. The row under the pointer or
holding the focus is highlighted on the model, as on the card; otherwise the
row last clicked is. Under the rows, the atom the pointer rests on in the
model, numbered from 1 as the molfile numbers it.
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
@default 1 / 3`},playing:{required:!1,tsType:{name:`boolean`},description:`Whether the frames of a file holding several are played in a loop. A file
of one model stays still whatever this says.
@default false`},framesPerSecond:{required:!1,tsType:{name:`number`},description:`How many frames are shown per second while playing, and in an animated
PNG; molstar plays between 5 and 60.
@default 25`},measurements:{required:!1,tsType:{name:`unknown`},description:`The measurements drawn over the model, when the site owns them. They name
atoms by position, so they carry over to another conformer of the same
molecule; a site showing an unrelated molecule should clear them. Changing
them redraws the measurements and nothing else: the model, its highlights
and the camera are left as they are.
@default undefined`},onMeasurementsChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(measurements: readonly Measurement[]) => void`,signature:{arguments:[{type:{name:`unknown`},name:`measurements`}],return:{name:`void`}}},description:`Called with the whole list after a measurement is added or cleared.
@default undefined`},highlights:{required:!1,tsType:{name:`unknown`},description:`The parts of the model to emphasise in the site's accent colour, each a
bonded path of atoms named as measurements name them: two atoms are that
bond, three the two bonds of an angle, four the three bonds of a dihedral,
and one atom is that atom alone. Only the bonds between consecutive atoms
of one path are emphasised, never another bond between two highlighted
atoms, and an atom the structure lacks is skipped. Changing them repaints
the model and nothing else: the camera, the measurements and the hover are
left as they are.
@default [] — nothing is emphasised`},onAtomHover:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(atom: AtomReference | null) => void`,signature:{arguments:[{type:{name:`union`,raw:`AtomReference | null`,elements:[{name:`AtomReference`},{name:`null`}]},name:`atom`}],return:{name:`void`}}},description:"Called with the atom the pointer comes to rest on, addressed as\n`highlights` address atoms, and with `null` once it leaves the atoms — so\na table read beside the model can light the row of that atom.\n@default undefined"},initialCamera:{required:!1,tsType:{name:`union`,raw:`Molecule3DCamera | null`,elements:[{name:`Molecule3DCamera`},{name:`null`}]},description:`Where the camera stands when the first molecule is framed — what a shared
link carries. The camera belongs to whoever is dragging it afterwards, so
this is read once and a later change is ignored; the viewer reports every
move through \`onCameraChange\` instead.
@default null — the molecule is framed as \`frameNewMolecule\` says`},onCameraChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(camera: Molecule3DCamera) => void`,signature:{arguments:[{type:{name:`Molecule3DCamera`},name:`camera`}],return:{name:`void`}}},description:`Called once the camera has come to rest, with where it stands. Not called
while the model is spinning: a spinning camera has no orientation to keep.
@default undefined`},cameraSettleDelay:{required:!1,tsType:{name:`number`},description:`How long the camera must be still before \`onCameraChange\` is called,
milliseconds, so one drag is one report rather than one per frame.
@default 400`},fileName:{required:!1,tsType:{name:`string`},description:`Name of an exported image, without its extension.
@default 'molecule'`},onCapture:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(capture: Molecule3DCapture | null) => void`,signature:{arguments:[{type:{name:`union`,raw:`Molecule3DCapture | null`,elements:[{name:`Molecule3DCapture`},{name:`null`}]},name:`capture`}],return:{name:`void`}}},description:`Handed the means to render the scene on screen once the viewer exists, and
\`null\` when it goes — for a page that hands the picture on, to a host
framing it. Keep it stable: a new function is handed the means again.
@default undefined`},background:{required:!1,tsType:{name:`string`},description:"Scene background, as `#rrggbb`.\n@default '#ffffff'"},minHeight:{required:!1,tsType:{name:`number`},description:`Smallest height of the canvas, pixels.
@default 320`},fallback:{required:!1,tsType:{name:`ReactNode`},description:`What to show while molstar is downloading.
@default 'Loading the 3D viewer…'`},renderUnsupported:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(capability: ViewerCapability) => ReactNode`,signature:{arguments:[{type:{name:`ViewerCapability`},name:`capability`}],return:{name:`ReactNode`}}},description:"What to show when the machine cannot render at all.\n@default undefined — `capability.message` is written"}}}})))()}var oe=t({Default:()=>U,Highlights:()=>K,PolarSurface:()=>Y,SharedCamera:()=>X,SurfaceAndSpin:()=>q,Trajectory:()=>Q,ViewOnly:()=>W,WithMeasurement:()=>G,__namedExportsOrder:()=>$,default:()=>H});function se(e){let[t,n]=(0,B.useState)(e.initialCamera??null),[r,i]=(0,B.useState)(null),[a,o]=(0,B.useState)(0);return(0,V.jsxs)(`div`,{style:Z,children:[(0,V.jsx)(`div`,{style:le,children:(0,V.jsx)(b,{...e,initialCamera:t,onCameraChange:i},a)}),(0,V.jsx)(`button`,{type:`button`,disabled:r===null,onClick:()=>{n(r),i(null),o(e=>e+1)},children:`Open the link`}),(0,V.jsx)(`code`,{"data-testid":`molecule3d-camera`,children:r===null?`—`:d(r)})]})}function ce(e){let t=[];for(let n=0;n<e;n++){let r=.25*Math.sin(2*Math.PI*n/e),i=.7572*(1+r),a=-.4692*(1+r);t.push(`3\nframe ${n+1}\nO 0.0000 0.0000 0.1173\nH 0.0000 ${i.toFixed(4)} ${a.toFixed(4)}\nH 0.0000 ${(-i).toFixed(4)} ${a.toFixed(4)}\n`)}return t.join(``)}var B,V,H,U,W,G,K,q,J,Y,X,Z,le,Q,$;function ue(){return(ue=e((()=>{B=i(),y(),E(),z(),k(),V=a(),H={title:`Molecule3D/MoleculeViewer3D`,component:b,args:{molfile:{format:`mol`,data:`#1
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
`}},parameters:{layout:`padded`,docs:{description:{component:`A molecule in 3D with molstar, and a react-science toolbar over the canvas: distance, angle and dihedral measurements, spin, the molecular surface, a view reset and a popover of display options. Each tool can be switched off, and settings, spin and measurements can be owned by the site or left to the component.`}}},render:e=>(0,V.jsx)(`div`,{style:{width:`min(36rem, 90vw)`,height:420,display:`flex`},children:(0,V.jsx)(b,{...e})})},U={},W={args:{tools:{measure:!1,options:!1}}},G={args:{defaultSettings:{representation:`stick`},measurements:[{kind:`dihedral`,atoms:[{unit:0,element:0},{unit:0,element:1},{unit:0,element:2},{unit:0,element:3}]}]}},K={args:{molfile:{format:`mol`,data:ae}},render:e=>(0,V.jsx)(A,{...e})},q={args:{defaultSettings:{showSurface:!0},defaultSpinning:!0}},J=`ethanol
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
`,Y={args:{molfile:{format:`mol`,data:J},defaultSettings:{showSurface:!0,surfaceColoring:`polarity`}}},X={args:{initialCamera:{rotation:[0,Math.SQRT1_2,0,Math.SQRT1_2],zoom:1,offset:[0,0,0]}},render:e=>(0,V.jsx)(se,{...e})},Z={display:`grid`,gap:8,justifyItems:`start`},le={width:`min(36rem, 90vw)`,height:420,display:`flex`},Q={args:{molfile:{format:`xyz`,data:ce(20)},playing:!0,framesPerSecond:20}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{}`,...U.parameters?.docs?.source},description:{story:`Every tool on.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    tools: {
      measure: false,
      options: false
    }
  }
}`,...W.parameters?.docs?.source},description:{story:`Only the view tools: no measuring, no options popover.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source},description:{story:`A dihedral already drawn, down the C1–C2–C3–C4 backbone.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    molfile: {
      format: 'mol',
      data: ACETONE
    }
  },
  render: args => <GeometryHighlightsDemo {...args} />
}`,...K.parameters?.docs?.source},description:{story:`Acetone beside its geometry, as a 3D answer card lists it. The row under the
pointer, or the one last clicked, is highlighted on the model: C–H ×6 to
begin with, whose six bonds and eight atoms take the site's accent while the
C–C and C=O bonds between them keep their colours.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSettings: {
      showSurface: true
    },
    defaultSpinning: true
  }
}`,...q.parameters?.docs?.source},description:{story:`The surface on, and the model turning.`,...q.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source},description:{story:`The surface of ethanol, its hydroxyl coloured as the polar part.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    // A quarter turn about the vertical axis.
    initialCamera: {
      rotation: [0, Math.SQRT1_2, 0, Math.SQRT1_2],
      zoom: 1,
      offset: [0, 0, 0]
    }
  },
  render: args => <SharedCameraDemo {...args} />
}`,...X.parameters?.docs?.source},description:{story:`A camera carried by a link: the viewer opens on butane seen from the side,
reports where the reader leaves the camera once it settles, and "Open the
link" reopens it from that report, as a visitor following the link would.`,...X.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    molfile: {
      format: 'xyz',
      data: waterStretch(20)
    },
    playing: true,
    framesPerSecond: 20
  }
}`,...Q.parameters?.docs?.source},description:{story:`A file of several frames — the symmetric stretch of water, one period in 20
frames — played in a loop. The export panel offers every frame as an
animated PNG.`,...Q.parameters?.docs?.description}}},$=[`Default`,`ViewOnly`,`WithMeasurement`,`Highlights`,`SurfaceAndSpin`,`PolarSurface`,`SharedCamera`,`Trajectory`]})))()}export{f as a,y as i,ue as n,d as r,oe as t};