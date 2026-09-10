const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./StructureSvg-C0iQ-IpQ.js","./rolldown-runtime-C0FnF6B9.js","./iframe-CsLeyY0n.js","./preload-helper-BHmFeTtP.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./iframe-B-cIiNHy.css","./lib-ZJKsAvoo.js","./floating-ui.react-dom-BdCW4lml.js","./react-dom-BtzDsBP-.js","./emotion-styled.browser.esm-Cf1FwhsN.js","./extends-D4puxXF7.js","./StructurePlaceholder-B_EV30ys.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,t as n}from"./preload-helper-BHmFeTtP.js";import{f as r,n as i}from"./iframe-CsLeyY0n.js";import{n as a,t as o}from"./StructurePlaceholder-B_EV30ys.js";import{a as s,i as c,n as l,o as u,t as d}from"./structureFixtures-DYs_uddm.js";function f(e){return g.test(e)?{version:`v3000`,atomCount:m(e,v)}:h.test(e)?{version:`v2000`,atomCount:m(e,_)}:{version:`unknown`,atomCount:0}}function p(e){return f(e).atomCount}function m(e,t){let n=t.exec(e)?.groups?.atoms;if(n===void 0)return 0;let r=Number.parseInt(n.trim(),10);return Number.isFinite(r)&&r>0?r:0}var h,g,_,v;function y(){return(y=e((()=>{h=/^[\d ]+V2000[^\S\n]*$/m,g=/^[\d ]+V3000[^\S\n]*$/m,_=/^(?<atoms>[\d ]{3})[\d ]*V2000[^\S\n]*$/m,v=/^M {2}V30 COUNTS +(?<atoms>\d+)/m})))()}function b(e){let[t=``,n]=e.trim().split(` `);return n===void 0?{idCode:t}:{idCode:t,coordinates:n}}function x(e){return S.has(b(e).idCode)}var S;function C(){return(C=e((()=>{S=new Set([``,`d@`,`dH`])})))()}function w(e){let{idCode:t,coordinates:n,molfile:r,smiles:i}=e;if(t!==void 0&&!x(t)){let e=b(t),r=e.coordinates??n;return r===void 0||r===``?{kind:`idcode`,value:e.idCode}:{kind:`idcode`,value:e.idCode,coordinates:r}}if(r!==void 0&&p(r)>0)return{kind:`molfile`,value:r};let a=i?.trim()??``;return a===``?{kind:`empty`,value:``}:{kind:`smiles`,value:a}}function T(){return(T=e((()=>{C(),y()})))()}function E(e){let{idCode:t,coordinates:n,molfile:r,smiles:i,width:a=200,height:s=140,labels:c={},autoCrop:l=!0,autoCropMargin:u=4,atomHighlight:d,atomHighlightColor:f=`#a5d8ff`,bondHighlight:p,bondHighlightColor:m=`#ffd8a8`,fallback:h=`—`}=e,g=w({idCode:t,coordinates:n,molfile:r,smiles:i});return g.kind===`empty`?(0,O.jsx)(o,{width:a,height:s,children:h}):(0,O.jsx)(D.Suspense,{fallback:(0,O.jsx)(o,{width:a,height:s}),children:(0,O.jsx)(k,{source:g,width:a,height:s,autoCrop:l,autoCropMargin:u,atomHighlight:d,atomHighlightColor:f,bondHighlight:p,bondHighlightColor:m,showAtomNumber:c.atoms??!1,showBondNumber:c.bonds??!1,showMapping:c.mapping??!1,label:c.caption,fallback:h})})}var D,O,k;function A(){return(A=e((()=>{D=r(),T(),a(),O=i(),t(),k=(0,D.lazy)(async()=>({default:(await n(()=>import(`./StructureSvg-C0iQ-IpQ.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12]),import.meta.url)).StructureSvg})),E.__docgenInfo={description:`Draw a structure, from whichever notation the caller has.

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
@default {}`},autoCrop:{required:!1,tsType:{name:`boolean`},description:`Crop the picture to the atoms rather than centring them in the box.
@default true`},autoCropMargin:{required:!1,tsType:{name:`number`},description:`Blank space kept around the structure when it is cropped, in pixels.
@default 4`},atomHighlight:{required:!1,tsType:{name:`Array`,elements:[{name:`number`}],raw:`number[]`},description:`Atoms to paint, which is how a substructure match is shown.
@default undefined`},atomHighlightColor:{required:!1,tsType:{name:`string`},description:`The colour the highlighted atoms are painted.
@default '#a5d8ff'`},bondHighlight:{required:!1,tsType:{name:`Array`,elements:[{name:`number`}],raw:`number[]`},description:`Bonds to paint.
@default undefined`},bondHighlightColor:{required:!1,tsType:{name:`string`},description:`The colour the highlighted bonds are painted.
@default '#ffd8a8'`},fallback:{required:!1,tsType:{name:`ReactNode`},description:`What is shown when there is no structure, or when the one supplied cannot
be read. An em dash rather than a red box: a missing structure is a row of
a table far more often than it is a bug worth shouting about.
@default '—'`}}}})))()}function j(e){return(0,M.jsxs)(`figure`,{style:U,children:[e.children,(0,M.jsx)(`figcaption`,{style:W,children:e.caption})]})}var M,N,P,F,I,L,R,z,B,V,H,U,W,G;function K(){return(K=e((()=>{A(),u(),M=i(),N=[{width:110,height:80},{width:200,height:150},{width:320,height:240}],P=[{caption:`a name, not a notation`,smiles:`benzene`},{caption:`a ring that never closes`,smiles:`C1CCCCC`},{caption:`a molfile with no atoms`,molfile:`
OCL MolfileCreator  2D

  0  0  0  0  0  0  0  0  0  0999 V2000
M  END
`},{caption:`nothing at all`}],F={title:`Structure/Structure`,component:E,args:{smiles:c,width:220,height:160},argTypes:{width:{control:{type:`range`,min:80,max:480,step:10}},height:{control:{type:`range`,min:60,max:360,step:10}},autoCrop:{control:`boolean`},autoCropMargin:{control:{type:`range`,min:0,max:40,step:2}}},parameters:{docs:{description:{component:`A read-only depiction, drawn from whichever notation the caller has — an idCode, a molfile or a SMILES — and never a broken box when there is none.`}}}},I={},L={parameters:{layout:`padded`},render:e=>(0,M.jsx)(`div`,{style:H,children:s.map(t=>(0,M.jsx)(E,{...e,autoCrop:!1,smiles:t.smiles,labels:{caption:t.name}},t.name))})},R={parameters:{layout:`padded`},render:e=>(0,M.jsx)(`div`,{style:H,children:N.map(t=>(0,M.jsx)(E,{...e,autoCrop:!1,width:t.width,height:t.height},t.width))})},z={parameters:{layout:`padded`},render:e=>(0,M.jsx)(`div`,{style:H,children:P.map(t=>(0,M.jsx)(j,{caption:t.caption,children:(0,M.jsx)(E,{...e,smiles:t.smiles,molfile:t.molfile,fallback:`no structure`})},t.caption))})},B={args:{width:260,height:200,autoCrop:!1,labels:{atoms:!0,bonds:!0,caption:`caffeine`}}},V={args:{smiles:d,width:280,height:200,autoCrop:!1,atomHighlight:l,labels:{caption:`acetyl`}}},H={display:`flex`,flexWrap:`wrap`,alignItems:`flex-end`,gap:16},U={display:`flex`,flexDirection:`column`,alignItems:`center`,padding:0,border:`1px dashed var(--border-strong, #c3cad3)`,borderRadius:`var(--radius, 10px)`,margin:0,gap:4},W={padding:`0 8px 6px`,color:`var(--text-muted, #5b6875)`,fontSize:`0.75rem`},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {DEMO_MOLECULES.map(molecule => <Structure key={molecule.name} {...args} autoCrop={false} smiles={molecule.smiles} labels={{
      caption: molecule.name
    }} />)}
    </div>
}`,...L.parameters?.docs?.source},description:{story:`Three molecules the sites show, each named inside its own picture.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {SIZES.map(size => <Structure key={size.width} {...args} autoCrop={false} width={size.width} height={size.height} />)}
    </div>
}`,...R.parameters?.docs?.source},description:{story:`The same molecule from a table row up to a panel of its own. Cropping is off
here, because a cropped picture keeps the atoms at the size the notation
lays them out and so barely follows the box it is given.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {UNREADABLE.map(entry => <Figure key={entry.caption} caption={entry.caption}>
          <Structure {...args} smiles={entry.smiles} molfile={entry.molfile} fallback="no structure" />
        </Figure>)}
    </div>
}`,...z.parameters?.docs?.source},description:{story:`What a page gets when the notation is wrong, empty, or simply absent: the
same quiet placeholder at the size of the picture that would have been
drawn, so a list of structures keeps its rhythm instead of gaining a red box.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source},description:{story:`Atom and bond indices written on the picture, which is what turns a
depiction into something an assignment or a highlight can point at.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source},description:{story:`The acetyl of aspirin painted, which is how a substructure hit is shown.`,...V.parameters?.docs?.description}}},G=[`Default`,`RealMolecules`,`EverySize`,`Unreadable`,`Labels`,`Highlighted`]})))()}K();export{I as Default,R as EverySize,V as Highlighted,B as Labels,L as RealMolecules,z as Unreadable,G as __namedExportsOrder,F as default};