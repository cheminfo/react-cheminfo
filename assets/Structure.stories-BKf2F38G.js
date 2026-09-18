const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./StructureSvg-BdLpRRZP.js","./rolldown-runtime-C0FnF6B9.js","./iframe-CsHOwSWu.js","./preload-helper-BHmFeTtP.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./lookup-DCkzqGBz.js","./iframe-CnpnNetz.css","./openchemlib-D0Gg4RB5.js","./lib-M-QfM0uX.js","./floating-ui.react-dom-0ZZ99PmJ.js","./react-dom-BnLvswtb.js","./emotion-styled.browser.esm-DswPHvbH.js","./extends-D4puxXF7.js"])))=>i.map(i=>d[i]);
import{n as e,r as t}from"./rolldown-runtime-C0FnF6B9.js";import{n,t as r}from"./preload-helper-BHmFeTtP.js";import{h as i,n as a}from"./iframe-CsHOwSWu.js";import{n as o,r as s}from"./familyTokens-DsQXXJV4.js";import{a as c,i as l,n as u,o as d,t as f}from"./structureFixtures-DYs_uddm.js";function p(e){let{width:t,height:n,children:r}=e;return(0,m.jsx)(`span`,{style:{...h,width:t,height:n},"aria-hidden":`true`,children:r})}var m,h;function g(){return(g=e((()=>{s(),m=a(),h={display:`inline-flex`,alignItems:`center`,justifyContent:`center`,color:o.textFaint,fontSize:`0.75rem`},p.__docgenInfo={description:`A box the size of the picture that is not there, holding whatever the caller
wants said instead.
@param props - See {@link StructurePlaceholderProps}.
@returns The placeholder.`,methods:[],displayName:`StructurePlaceholder`,props:{width:{required:!0,tsType:{name:`number`},description:`Width of the box, in pixels: the width the picture would have had.`},height:{required:!0,tsType:{name:`number`},description:`Height of the box, in pixels.`},children:{required:!1,tsType:{name:`ReactNode`},description:`What is written in the middle of the box.
@default undefined`}}}})))()}function _(e){return x.test(e)?{version:`v3000`,atomCount:y(e,C)}:b.test(e)?{version:`v2000`,atomCount:y(e,S)}:{version:`unknown`,atomCount:0}}function v(e){return _(e).atomCount}function y(e,t){let n=t.exec(e)?.groups?.atoms;if(n===void 0)return 0;let r=Number.parseInt(n.trim(),10);return Number.isFinite(r)&&r>0?r:0}var b,x,S,C;function w(){return(w=e((()=>{b=/^[\d ]+V2000[^\S\n]*$/m,x=/^[\d ]+V3000[^\S\n]*$/m,S=/^(?<atoms>[\d ]{3})[\d ]*V2000[^\S\n]*$/m,C=/^M {2}V30 COUNTS +(?<atoms>\d+)/m})))()}function T(e){let[t=``,n]=e.trim().split(` `);return n===void 0?{idCode:t}:{idCode:t,coordinates:n}}function ee(e){return E.has(T(e).idCode)}var E;function D(){return(D=e((()=>{E=new Set([``,`d@`,`dH`])})))()}function O(e){let{idCode:t,coordinates:n,molfile:r,smiles:i}=e;if(t!==void 0&&!ee(t)){let e=T(t),r=e.coordinates??n;return r===void 0||r===``?{kind:`idcode`,value:e.idCode}:{kind:`idcode`,value:e.idCode,coordinates:r}}if(r!==void 0&&v(r)>0)return{kind:`molfile`,value:r};let a=i?.trim()??``;return a===``?{kind:`empty`,value:``}:{kind:`smiles`,value:a}}function k(){return(k=e((()=>{D(),w()})))()}function A(e){let{idCode:t,coordinates:n,molfile:r,smiles:i,width:a=200,height:o=140,labels:s={},atomLabels:c,atomLabelPlacement:l=`beside`,autoCrop:u=!0,autoCropMargin:d=4,atomHighlight:f,atomHighlightColor:m=`#a5d8ff`,bondHighlight:h,bondHighlightColor:g=`#ffd8a8`,onAtomClick:_,onBondClick:v,fallback:y=`—`}=e,b=O({idCode:t,coordinates:n,molfile:r,smiles:i});return b.kind===`empty`?(0,M.jsx)(p,{width:a,height:o,children:y}):(0,M.jsx)(j.Suspense,{fallback:(0,M.jsx)(p,{width:a,height:o}),children:(0,M.jsx)(N,{source:b,width:a,height:o,autoCrop:u,autoCropMargin:d,atomHighlight:f,atomHighlightColor:m,bondHighlight:h,bondHighlightColor:g,showAtomNumber:s.atoms??!1,showBondNumber:s.bonds??!1,showMapping:s.mapping??!1,showCIPParity:s.stereo??!1,label:s.caption,atomLabels:c,atomLabelPlacement:l,onAtomClick:_,onBondClick:v,fallback:y})})}var j,M,N;function P(){return(P=e((()=>{j=i(),k(),g(),M=a(),n(),N=(0,j.lazy)(async()=>({default:(await r(()=>import(`./StructureSvg-BdLpRRZP.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13]),import.meta.url)).StructureSvg})),A.__docgenInfo={description:`Draw a structure, from whichever notation the caller has.

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
@default '—'`}}}})))()}var te=t({AtomLabels:()=>q,ClickableAtoms:()=>J,Default:()=>V,EverySize:()=>U,Highlighted:()=>K,Labels:()=>G,RealMolecules:()=>H,Unreadable:()=>W,__namedExportsOrder:()=>Q,default:()=>B});function ne(e){let t=new Map;for(let n=0;n<e;n++)t.set(n,String(n+1));return t}function re(e){let[t,n]=(0,I.useState)(null);return(0,L.jsx)(F,{caption:t===null?`click an atom`:`atom ${t}`,children:(0,L.jsx)(A,{...e,atomHighlight:t===null?void 0:[t],onAtomClick:n})})}function F(e){return(0,L.jsxs)(`figure`,{style:X,children:[e.children,(0,L.jsx)(`figcaption`,{style:Z,children:e.caption})]})}var I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{I=i(),P(),s(),d(),L=a(),R=[{width:110,height:80},{width:200,height:150},{width:320,height:240}],z=[{caption:`a name, not a notation`,smiles:`benzene`},{caption:`a ring that never closes`,smiles:`C1CCCCC`},{caption:`a molfile with no atoms`,molfile:`
OCL MolfileCreator  2D

  0  0  0  0  0  0  0  0  0  0999 V2000
M  END
`},{caption:`nothing at all`}],B={title:`Structure/Structure`,component:A,args:{smiles:l,width:220,height:160},argTypes:{width:{control:{type:`range`,min:80,max:480,step:10}},height:{control:{type:`range`,min:60,max:360,step:10}},autoCrop:{control:`boolean`},autoCropMargin:{control:{type:`range`,min:0,max:40,step:2}}},parameters:{docs:{description:{component:`A read-only depiction, drawn from whichever notation the caller has — an idCode, a molfile or a SMILES — and never a broken box when there is none.`}}}},V={},H={parameters:{layout:`padded`},render:e=>(0,L.jsx)(`div`,{style:Y,children:c.map(t=>(0,L.jsx)(A,{...e,autoCrop:!1,smiles:t.smiles,labels:{caption:t.name}},t.name))})},U={parameters:{layout:`padded`},render:e=>(0,L.jsx)(`div`,{style:Y,children:R.map(t=>(0,L.jsx)(A,{...e,autoCrop:!1,width:t.width,height:t.height},t.width))})},W={parameters:{layout:`padded`},render:e=>(0,L.jsx)(`div`,{style:Y,children:z.map(t=>(0,L.jsx)(F,{caption:t.caption,children:(0,L.jsx)(A,{...e,smiles:t.smiles,molfile:t.molfile,fallback:`no structure`})},t.caption))})},G={args:{width:260,height:200,autoCrop:!1,labels:{atoms:!0,bonds:!0,caption:`caffeine`}}},K={args:{smiles:f,width:280,height:200,autoCrop:!1,atomHighlight:u,labels:{caption:`acetyl`}}},q={args:{width:260,height:200,autoCrop:!1,atomLabels:ne(14)}},J={args:{smiles:f,width:280,height:200,autoCrop:!1},render:e=>(0,L.jsx)(re,{...e})},Y={display:`flex`,flexWrap:`wrap`,alignItems:`flex-end`,gap:16},X={display:`flex`,flexDirection:`column`,alignItems:`center`,padding:0,border:`1px dashed ${o.borderStrong}`,borderRadius:o.radius,margin:0,gap:4},Z={padding:`0 8px 6px`,color:o.textMuted,fontSize:`0.75rem`},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {DEMO_MOLECULES.map(molecule => <Structure key={molecule.name} {...args} autoCrop={false} smiles={molecule.smiles} labels={{
      caption: molecule.name
    }} />)}
    </div>
}`,...H.parameters?.docs?.source},description:{story:`Three molecules the sites show, each named inside its own picture.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {SIZES.map(size => <Structure key={size.width} {...args} autoCrop={false} width={size.width} height={size.height} />)}
    </div>
}`,...U.parameters?.docs?.source},description:{story:`The same molecule from a table row up to a panel of its own. Cropping is off
here, because a cropped picture keeps the atoms at the size the notation
lays them out and so barely follows the box it is given.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {UNREADABLE.map(entry => <Figure key={entry.caption} caption={entry.caption}>
          <Structure {...args} smiles={entry.smiles} molfile={entry.molfile} fallback="no structure" />
        </Figure>)}
    </div>
}`,...W.parameters?.docs?.source},description:{story:`What a page gets when the notation is wrong, empty, or simply absent: the
same quiet placeholder at the size of the picture that would have been
drawn, so a list of structures keeps its rhythm instead of gaining a red box.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source},description:{story:`Atom and bond indices written on the picture, which is what turns a
depiction into something an assignment or a highlight can point at.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source},description:{story:`The acetyl of aspirin painted, which is how a substructure hit is shown.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    width: 260,
    height: 200,
    autoCrop: false,
    atomLabels: numberedAtoms(14)
  }
}`,...q.parameters?.docs?.source},description:{story:`Text of the caller's own beside every atom — here each heavy atom numbered
from one, the way a guide or a ring count points at atoms.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    smiles: ASPIRIN,
    width: 280,
    height: 200,
    autoCrop: false
  },
  render: args => <ClickToHighlight {...args} />
}`,...J.parameters?.docs?.source},description:{story:`Clicking an atom paints it, which is how an attachment point is picked.`,...J.parameters?.docs?.description}}},Q=[`Default`,`RealMolecules`,`EverySize`,`Unreadable`,`Labels`,`Highlighted`,`AtomLabels`,`ClickableAtoms`]})))()}export{g as i,$ as n,p as r,te as t};