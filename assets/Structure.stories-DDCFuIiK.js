const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./StructureSvg-DSXKJd5D.js","./rolldown-runtime-C0FnF6B9.js","./iframe-Bx_6GVVU.js","./preload-helper-BHmFeTtP.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./lookup-Cbp1oRe2.js","./languageParam-B2tQW6WN.js","./iframe-CdOhXsR0.css","./lib-BJqtxIIr.js","./openchemlib-5aAvE16G.js","./floating-ui.react-dom-BABDKVaR.js","./react-dom-C3BniNne.js","./emotion-styled.browser.esm-BBhqWiI5.js","./extends-D4puxXF7.js","./sourceMolecule-BF9-RONI.js"])))=>i.map(i=>d[i]);
import{n as e,r as t}from"./rolldown-runtime-C0FnF6B9.js";import{n,t as r}from"./preload-helper-BHmFeTtP.js";import{h as i,n as a}from"./iframe-Bx_6GVVU.js";import{n as o,r as s}from"./familyTokens-DsQXXJV4.js";import{n as c,t as l}from"./structureSource-DQOWoGhN.js";import{c as u,i as d,o as f,r as p,s as m}from"./structureFixtures-JUAU2ivx.js";function h(e){let{width:t,height:n,children:r}=e;return(0,g.jsx)(`span`,{style:{..._,width:t,height:n},"aria-hidden":`true`,children:r})}var g,_;function v(){return(v=e((()=>{s(),g=a(),_={display:`inline-flex`,alignItems:`center`,justifyContent:`center`,color:o.textFaint,fontSize:`0.75rem`},h.__docgenInfo={description:`A box the size of the picture that is not there, holding whatever the caller
wants said instead.
@param props - See {@link StructurePlaceholderProps}.
@returns The placeholder.`,methods:[],displayName:`StructurePlaceholder`,props:{width:{required:!0,tsType:{name:`number`},description:`Width of the box, in pixels: the width the picture would have had.`},height:{required:!0,tsType:{name:`number`},description:`Height of the box, in pixels.`},children:{required:!1,tsType:{name:`ReactNode`},description:`What is written in the middle of the box.
@default undefined`}}}})))()}function y(e){let{idCode:t,coordinates:n,molfile:r,smiles:i,width:a=200,height:o=140,labels:s={},atomLabels:l,atomLabelPlacement:u=`beside`,autoCrop:d=!0,autoCropMargin:f=4,atomHighlight:p,atomHighlightColor:m=`#a5d8ff`,bondHighlight:g,bondHighlightColor:_=`#ffd8a8`,onAtomClick:v,onBondClick:y,fallback:C=`—`}=e,w=c({idCode:t,coordinates:n,molfile:r,smiles:i});return w.kind===`empty`?(0,x.jsx)(h,{width:a,height:o,children:C}):(0,x.jsx)(b.Suspense,{fallback:(0,x.jsx)(h,{width:a,height:o}),children:(0,x.jsx)(S,{source:w,width:a,height:o,autoCrop:d,autoCropMargin:f,atomHighlight:p,atomHighlightColor:m,bondHighlight:g,bondHighlightColor:_,showAtomNumber:s.atoms??!1,showBondNumber:s.bonds??!1,showMapping:s.mapping??!1,showCIPParity:s.stereo??!1,label:s.caption,atomLabels:l,atomLabelPlacement:u,onAtomClick:v,onBondClick:y,fallback:C})})}var b,x,S;function C(){return(C=e((()=>{b=i(),l(),v(),x=a(),n(),S=(0,b.lazy)(async()=>({default:(await r(()=>import(`./StructureSvg-DSXKJd5D.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]),import.meta.url)).StructureSvg})),y.__docgenInfo={description:`Draw a structure, from whichever notation the caller has.

Nothing here throws and nothing renders a broken box: a blank value, a
molfile with an empty atom block and a SMILES with a typo in it all come out
as the same quiet placeholder, sized like the picture that would have been
drawn so a list of structures keeps its rhythm. The box the renderers load
into is that same placeholder, so nothing moves once they arrive.
@param props - The structure, its size and what is written on it.
@returns The picture, or the placeholder.`,methods:[],displayName:`Structure`,props:{idCode:{required:!1,tsType:{name:`string`},description:`A canonical openchemlib idCode, coordinates included or not. The most
exact notation, so it is drawn in preference to the others.
@default undefined`},coordinates:{required:!1,tsType:{name:`string`},description:`Encoded 2D coordinates, when they did not travel with the idCode.
@default undefined`},molfile:{required:!1,tsType:{name:`string`},description:`A molfile, V2000 or V3000, drawn when there is no usable idCode.
@default undefined`},smiles:{required:!1,tsType:{name:`string`},description:`A SMILES, drawn when there is neither an idCode nor a molfile. The layout
is invented, so two depictions of the same molecule may differ.
@default undefined`},width:{required:!1,tsType:{name:`number`},description:`Width of the picture, in pixels.
@default 200`},height:{required:!1,tsType:{name:`number`},description:`Height of the picture, in pixels.
@default 140`},labels:{required:!1,tsType:{name:`StructureLabels`},description:`What is written on the picture besides the structure itself.
@default {}`},atomLabels:{required:!1,tsType:{name:`ReadonlyMap`,elements:[{name:`number`},{name:`string`}],raw:`ReadonlyMap<number, string>`},description:`Text of the caller's own written on atoms — ring numbers, canonical
numbers, an assignment — keyed by atom index as openchemlib counts atoms,
from 0. An empty text, or an index the structure has no atom at, writes
nothing.
@default undefined`},atomLabelPlacement:{required:!1,tsType:{name:`union`,raw:`'beside' | 'instead'`,elements:[{name:`literal`,value:`'beside'`},{name:`literal`,value:`'instead'`}]},description:`Where the \`atomLabels\` go: beside each element symbol, as a small
superscript, or in place of it.
@default 'beside'`},autoCrop:{required:!1,tsType:{name:`boolean`},description:`Crop the picture to the atoms rather than centring them in the box.
@default true`},autoCropMargin:{required:!1,tsType:{name:`number`},description:`Blank space kept around the structure when it is cropped, in pixels.
@default 4`},atomHighlight:{required:!1,tsType:{name:`Array`,elements:[{name:`number`}],raw:`number[]`},description:`Atoms to paint, which is how a substructure match is shown.
@default undefined`},atomHighlightColor:{required:!1,tsType:{name:`string`},description:`The colour the highlighted atoms are painted.
@default '#a5d8ff'`},bondHighlight:{required:!1,tsType:{name:`Array`,elements:[{name:`number`}],raw:`number[]`},description:`Bonds to paint.
@default undefined`},bondHighlightColor:{required:!1,tsType:{name:`string`},description:`The colour the highlighted bonds are painted.
@default '#ffd8a8'`},onAtomClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(atom: number) => void`,signature:{arguments:[{type:{name:`number`},name:`atom`}],return:{name:`void`}}},description:`Called with the index of the atom that was clicked, counted from 0 as
openchemlib counts atoms.
@default undefined`},onBondClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(bond: number) => void`,signature:{arguments:[{type:{name:`number`},name:`bond`}],return:{name:`void`}}},description:`Called with the index of the bond that was clicked, counted from 0.
@default undefined`},fallback:{required:!1,tsType:{name:`ReactNode`},description:`What is shown when there is no structure, or when the one supplied cannot
be read. An em dash rather than a red box: a missing structure is a row of
a table far more often than it is a bug worth shouting about.
@default '—'`}}}})))()}var w=t({AtomLabels:()=>z,ClickableAtoms:()=>B,Default:()=>N,EverySize:()=>F,Highlighted:()=>R,Labels:()=>L,RealMolecules:()=>P,Unreadable:()=>I,__namedExportsOrder:()=>W,default:()=>M});function T(e){let t=new Map;for(let n=0;n<e;n++)t.set(n,String(n+1));return t}function E(e){let[t,n]=(0,O.useState)(null);return(0,k.jsx)(D,{caption:t===null?`click an atom`:`atom ${t}`,children:(0,k.jsx)(y,{...e,atomHighlight:t===null?void 0:[t],onAtomClick:n})})}function D(e){return(0,k.jsxs)(`figure`,{style:H,children:[e.children,(0,k.jsx)(`figcaption`,{style:U,children:e.caption})]})}var O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W;function G(){return(G=e((()=>{O=i(),C(),s(),u(),k=a(),A=[{width:110,height:80},{width:200,height:150},{width:320,height:240}],j=[{caption:`a name, not a notation`,smiles:`benzene`},{caption:`a ring that never closes`,smiles:`C1CCCCC`},{caption:`a molfile with no atoms`,molfile:`
OCL MolfileCreator  2D

  0  0  0  0  0  0  0  0  0  0999 V2000
M  END
`},{caption:`nothing at all`}],M={title:`Structure/Structure`,component:y,args:{smiles:f,width:220,height:160},argTypes:{width:{control:{type:`range`,min:80,max:480,step:10}},height:{control:{type:`range`,min:60,max:360,step:10}},autoCrop:{control:`boolean`},autoCropMargin:{control:{type:`range`,min:0,max:40,step:2}}},parameters:{docs:{description:{component:`A read-only depiction, drawn from whichever notation the caller has — an idCode, a molfile or a SMILES — and never a broken box when there is none.`}}}},N={},P={parameters:{layout:`padded`},render:e=>(0,k.jsx)(`div`,{style:V,children:m.map(t=>(0,k.jsx)(y,{...e,autoCrop:!1,smiles:t.smiles,labels:{caption:t.name}},t.name))})},F={parameters:{layout:`padded`},render:e=>(0,k.jsx)(`div`,{style:V,children:A.map(t=>(0,k.jsx)(y,{...e,autoCrop:!1,width:t.width,height:t.height},t.width))})},I={parameters:{layout:`padded`},render:e=>(0,k.jsx)(`div`,{style:V,children:j.map(t=>(0,k.jsx)(D,{caption:t.caption,children:(0,k.jsx)(y,{...e,smiles:t.smiles,molfile:t.molfile,fallback:`no structure`})},t.caption))})},L={args:{width:260,height:200,autoCrop:!1,labels:{atoms:!0,bonds:!0,caption:`caffeine`}}},R={args:{smiles:p,width:280,height:200,autoCrop:!1,atomHighlight:d,labels:{caption:`acetyl`}}},z={args:{width:260,height:200,autoCrop:!1,atomLabels:T(14)}},B={args:{smiles:p,width:280,height:200,autoCrop:!1},render:e=>(0,k.jsx)(E,{...e})},V={display:`flex`,flexWrap:`wrap`,alignItems:`flex-end`,gap:16},H={display:`flex`,flexDirection:`column`,alignItems:`center`,padding:0,border:`1px dashed ${o.borderStrong}`,borderRadius:o.radius,margin:0,gap:4},U={padding:`0 8px 6px`,color:o.textMuted,fontSize:`0.75rem`},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {DEMO_MOLECULES.map(molecule => <Structure key={molecule.name} {...args} autoCrop={false} smiles={molecule.smiles} labels={{
      caption: molecule.name
    }} />)}
    </div>
}`,...P.parameters?.docs?.source},description:{story:`Three molecules the sites show, each named inside its own picture.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {SIZES.map(size => <Structure key={size.width} {...args} autoCrop={false} width={size.width} height={size.height} />)}
    </div>
}`,...F.parameters?.docs?.source},description:{story:`The same molecule from a table row up to a panel of its own. Cropping is off
here, because a cropped picture keeps the atoms at the size the notation
lays them out and so barely follows the box it is given.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {UNREADABLE.map(entry => <Figure key={entry.caption} caption={entry.caption}>
          <Structure {...args} smiles={entry.smiles} molfile={entry.molfile} fallback="no structure" />
        </Figure>)}
    </div>
}`,...I.parameters?.docs?.source},description:{story:`What a page gets when the notation is wrong, empty, or simply absent: the
same quiet placeholder at the size of the picture that would have been
drawn, so a list of structures keeps its rhythm instead of gaining a red box.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    width: 260,
    height: 200,
    autoCrop: false,
    labels: {
      atoms: true,
      bonds: true,
      caption: 'caffeine'
    }
  }
}`,...L.parameters?.docs?.source},description:{story:`Atom and bond indices written on the picture, which is what turns a
depiction into something an assignment or a highlight can point at.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    smiles: ASPIRIN,
    width: 280,
    height: 200,
    autoCrop: false,
    atomHighlight: ASPIRIN_ACETYL,
    labels: {
      caption: 'acetyl'
    }
  }
}`,...R.parameters?.docs?.source},description:{story:`The acetyl of aspirin painted, which is how a substructure hit is shown.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    width: 260,
    height: 200,
    autoCrop: false,
    atomLabels: numberedAtoms(14)
  }
}`,...z.parameters?.docs?.source},description:{story:`Text of the caller's own beside every atom — here each heavy atom numbered
from one, the way a guide or a ring count points at atoms.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    smiles: ASPIRIN,
    width: 280,
    height: 200,
    autoCrop: false
  },
  render: args => <ClickToHighlight {...args} />
}`,...B.parameters?.docs?.source},description:{story:`Clicking an atom paints it, which is how an attachment point is picked.`,...B.parameters?.docs?.description}}},W=[`Default`,`RealMolecules`,`EverySize`,`Unreadable`,`Labels`,`Highlighted`,`AtomLabels`,`ClickableAtoms`]})))()}export{v as i,G as n,h as r,w as t};