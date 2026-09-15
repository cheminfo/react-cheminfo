const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./MoleculeCanvas3D-BQn29D_K.js","./rolldown-runtime-C0FnF6B9.js","./preload-helper-BHmFeTtP.js","./iframe-vuJI5ajg.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./lookup-3sQpxIQz.js","./iframe-CnpnNetz.css","./figurePng-C2_QsYj_.js","./OverlaySegmented-Bvu8PDZy.js","./components-D_4HRFR0.js","./iconTypes-BdKrNP8V.js","./icon-CvEvlnQN.js","./classnames-Bs_Skv4c.js","./react-dom-BTEGHXhr.js","./shim-BLFY6icr.js","./esm-CVV7O0lL.js","./numericInput-Co1l0RKD.js","./keyboardUtils-DeBk3IyA.js","./refs-6HL0S0cT.js","./abstractPureComponent-BH0edjj4.js","./buttons-DL0wsVy9.js","./useValidateProps-CgPfnqhk.js","./useInteractiveAttributes-BeTtxc_Y.js","./text-DIDhbtzQ.js","./inputGroup-ze2KNlIm.js","./tag-B_8r3t4J.js","./small-cross-Cpof4B1K.js","./menuItem-l5ndxX0y.js","./popoverNextMigrationUtils-DYxerxyT.js","./overlay2-Qej3DVab.js","./extends-D4puxXF7.js","./floating-ui.react-dom-BQI65oRm.js","./callout-DofL2wmh.js","./html-KZeMAQBZ.js","./dialog-BmWJbOrc.js","./collapse-cCpHgxG1.js","./tooltip-Axb_E8Wr.js","./controls-BhMc5Npj.js","./emotion-styled.browser.esm-5D_W7QOr.js","./HelpTooltip-D_XEIzRL.js","./joinClassNames-BbK_6p9Z.js","./overlaySurface-B-_PBqFf.js","./listNavigation-nzLFK1Vx.js","./keyTargets-Brm1xBjF.js","./HelpIcon-Cc-p1oAL.js","./helpName-DxpXVq-8.js","./overlayPanelStyles-CdoKtsor.js","./segmentedControl-C5XQbDu-.js","./numbers-BxzU8aH2.js","./clamp-M7_x50VL.js","./view-model-BeLJGGRi.js","./downloadBlob-BXFxYCsP.js","./sanitizeFileName-DTX4aT6A.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,t as n}from"./preload-helper-BHmFeTtP.js";import{h as r,n as i}from"./iframe-vuJI5ajg.js";import{n as a,t as o}from"./callout-DofL2wmh.js";import{n as s}from"./capability-BsxvbEdj.js";function c(e){let{fallback:t=`Loading the 3D viewer…`,renderUnsupported:n,...r}=e,[i]=(0,l.useState)(s),[a,c]=(0,l.useState)(null);return i.supported?(0,u.jsxs)(`div`,{style:f,children:[(0,u.jsx)(l.Suspense,{fallback:(0,u.jsx)(`div`,{style:p,children:t}),children:(0,u.jsx)(d,{...r,onFailureChange:c})}),a!==null&&(0,u.jsx)(o,{intent:`danger`,compact:!0,title:`The viewer could not draw this`,children:a})]}):(0,u.jsx)(o,{intent:`warning`,compact:!0,children:n?.(i)??i.message})}var l,u,d,f,p;function m(){return(m=e((()=>{a(),l=r(),u=i(),t(),d=(0,l.lazy)(async()=>({default:(await n(()=>import(`./MoleculeCanvas3D-BQn29D_K.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53]),import.meta.url)).MoleculeCanvas3D})),f={display:`flex`,flexDirection:`column`,gap:6,flex:`1 0 auto`,minWidth:0},p={display:`flex`,alignItems:`center`,justifyContent:`center`,minHeight:320,fontSize:13},c.__docgenInfo={description:`The 3D molecule viewer.
@param props - See {@link MoleculeViewer3DProps}.
@returns The viewer, or an explanation of why this machine cannot show one.`,methods:[],displayName:`MoleculeViewer3D`,props:{molfile:{required:!0,tsType:{name:`union`,raw:`Molecule3DFile | null`,elements:[{name:`Molecule3DFile`},{name:`null`}]},description:"The molecule to draw, with 3D coordinates, or `null` for none."},tools:{required:!1,tsType:{name:`Partial`,elements:[{name:`Molecule3DTools`}],raw:`Partial<Molecule3DTools>`},description:`Which buttons the toolbar over the canvas shows; tools not named stay on.
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
@default undefined`},fileName:{required:!1,tsType:{name:`string`},description:`Name of an exported image, without its extension.
@default 'molecule'`},background:{required:!1,tsType:{name:`string`},description:"Scene background, as `#rrggbb`.\n@default '#ffffff'"},minHeight:{required:!1,tsType:{name:`number`},description:`Smallest height of the canvas, pixels.
@default 320`},fallback:{required:!1,tsType:{name:`ReactNode`},description:`What to show while molstar is downloading.
@default 'Loading the 3D viewer…'`},renderUnsupported:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(capability: ViewerCapability) => ReactNode`,signature:{arguments:[{type:{name:`ViewerCapability`},name:`capability`}],return:{name:`ReactNode`}}},description:"What to show when the machine cannot render at all.\n@default undefined — `capability.message` is written"}}}})))()}var h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{m(),h=i(),g={title:`Molecule3D/MoleculeViewer3D`,component:c,args:{molfile:{format:`mol`,data:`#1
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
`}},parameters:{layout:`padded`,docs:{description:{component:`A molecule in 3D with molstar, and a react-science toolbar over the canvas: distance, angle and dihedral measurements, spin, the molecular surface, a view reset and a popover of display options. Each tool can be switched off, and settings, spin and measurements can be owned by the site or left to the component.`}}},render:e=>(0,h.jsx)(`div`,{style:{width:`min(36rem, 90vw)`,height:420,display:`flex`},children:(0,h.jsx)(c,{...e})})},_={},v={args:{tools:{measure:!1,options:!1}}},y={args:{defaultSettings:{representation:`stick`},measurements:[{kind:`dihedral`,atoms:[{unit:0,element:0},{unit:0,element:1},{unit:0,element:2},{unit:0,element:3}]}]}},b={args:{defaultSettings:{showSurface:!0},defaultSpinning:!0}},x=`ethanol
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
`,S={args:{molfile:{format:`mol`,data:x},defaultSettings:{showSurface:!0,surfaceColoring:`polarity`}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{}`,..._.parameters?.docs?.source},description:{story:`Every tool on.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tools: {
      measure: false,
      options: false
    }
  }
}`,...v.parameters?.docs?.source},description:{story:`Only the view tools: no measuring, no options popover.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`A dihedral already drawn, down the C1–C2–C3–C4 backbone.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSettings: {
      showSurface: true
    },
    defaultSpinning: true
  }
}`,...b.parameters?.docs?.source},description:{story:`The surface on, and the model turning.`,...b.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source},description:{story:`The surface of ethanol, its hydroxyl coloured as the polar part.`,...S.parameters?.docs?.description}}},C=[`Default`,`ViewOnly`,`WithMeasurement`,`SurfaceAndSpin`,`PolarSurface`]})))()}w();export{_ as Default,S as PolarSurface,b as SurfaceAndSpin,v as ViewOnly,y as WithMeasurement,C as __namedExportsOrder,g as default};