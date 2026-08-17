import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-BDQJEmVY.js";import{a as r,d as i,h as a,i as o,n as s,o as c,p as l,s as u,t as d}from"./structureFixtures-shbxtD7u.js";function f(e){return g.test(e)?{version:`v3000`,atomCount:m(e,v)}:h.test(e)?{version:`v2000`,atomCount:m(e,_)}:{version:`unknown`,atomCount:0}}function p(e){return f(e).atomCount}function m(e,t){let n=t.exec(e)?.groups?.atoms;if(n===void 0)return 0;let r=Number.parseInt(n.trim(),10);return Number.isFinite(r)&&r>0?r:0}var h,g,_,v;function y(){return(y=e((()=>{h=/^[\d ]+V2000[^\S\n]*$/m,g=/^[\d ]+V3000[^\S\n]*$/m,_=/^(?<atoms>[\d ]{3})[\d ]*V2000[^\S\n]*$/m,v=/^M {2}V30 COUNTS +(?<atoms>\d+)/m})))()}function b(e){let[t=``,n]=e.trim().split(` `);return n===void 0?{idCode:t}:{idCode:t,coordinates:n}}function x(e){return S.has(b(e).idCode)}var S;function C(){return(C=e((()=>{S=new Set([``,`d@`,`dH`])})))()}function w(e){let{idCode:t,coordinates:n,molfile:r,smiles:i}=e;if(t!==void 0&&!x(t)){let e=b(t),r=e.coordinates??n;return r===void 0||r===``?{kind:`idcode`,value:e.idCode}:{kind:`idcode`,value:e.idCode,coordinates:r}}if(r!==void 0&&p(r)>0)return{kind:`molfile`,value:r};let a=i?.trim()??``;return a===``?{kind:`empty`,value:``}:{kind:`smiles`,value:a}}function T(){return(T=e((()=>{C(),y()})))()}function E(e){let{idCode:t,coordinates:n,molfile:r,smiles:o,width:s=200,height:c=140,labels:u={},autoCrop:d=!0,autoCropMargin:f=4,atomHighlight:p,atomHighlightColor:m=`#a5d8ff`,bondHighlight:h,bondHighlightColor:g=`#ffd8a8`,fallback:_=`—`}=e,v=w({idCode:t,coordinates:n,molfile:r,smiles:o}),y=(0,k.useMemo)(()=>O(_),[_]);if(v.kind===`empty`)return(0,A.jsx)(D,{width:s,height:c,children:_});let b={width:s,height:c,autoCrop:d,autoCropMargin:f,atomHighlight:p,atomHighlightColor:m,bondHighlight:h,bondHighlightColor:g,showAtomNumber:u.atoms??!1,showBondNumber:u.bonds??!1,showMapping:u.mapping??!1,label:u.caption,ErrorComponent:y};return v.kind===`idcode`?(0,A.jsx)(a,{idcode:v.value,coordinates:v.coordinates,...b}):v.kind===`molfile`?(0,A.jsx)(l,{molfile:v.value,...b}):(0,A.jsx)(i,{smiles:v.value,...b})}function D(e){let{width:t,height:n,children:r}=e;return(0,A.jsx)(`span`,{style:{...j,width:t,height:n},"aria-hidden":`true`,children:r})}function O(e){return function(t){return(0,A.jsx)(D,{width:t.width,height:t.height,children:e})}}var k,A,j;function M(){return(M=e((()=>{k=t(),u(),T(),A=n(),j={display:`inline-flex`,alignItems:`center`,justifyContent:`center`,color:`#8a96a3`,fontSize:`0.75rem`},E.__docgenInfo={description:`Draw a structure, from whichever notation the caller has.

Nothing here throws and nothing renders a broken box: a blank value, a
molfile with an empty atom block and a SMILES with a typo in it all come out
as the same quiet placeholder, sized like the picture that would have been
drawn so a list of structures keeps its rhythm.
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
@default '—'`}}}})))()}function N(e){return(0,P.jsxs)(`figure`,{style:G,children:[e.children,(0,P.jsx)(`figcaption`,{style:K,children:e.caption})]})}var P,F,I,L,R,z,B,V,H,U,W,G,K,q;function J(){return(J=e((()=>{M(),c(),P=n(),F=[{width:110,height:80},{width:200,height:150},{width:320,height:240}],I=[{caption:`a name, not a notation`,smiles:`benzene`},{caption:`a ring that never closes`,smiles:`C1CCCCC`},{caption:`a molfile with no atoms`,molfile:`
OCL MolfileCreator  2D

  0  0  0  0  0  0  0  0  0  0999 V2000
M  END
`},{caption:`nothing at all`}],L={title:`Structure/Structure`,component:E,args:{smiles:o,width:220,height:160},argTypes:{width:{control:{type:`range`,min:80,max:480,step:10}},height:{control:{type:`range`,min:60,max:360,step:10}},autoCrop:{control:`boolean`},autoCropMargin:{control:{type:`range`,min:0,max:40,step:2}}},parameters:{docs:{description:{component:`A read-only depiction, drawn from whichever notation the caller has — an idCode, a molfile or a SMILES — and never a broken box when there is none.`}}}},R={},z={parameters:{layout:`padded`},render:e=>(0,P.jsx)(`div`,{style:W,children:r.map(t=>(0,P.jsx)(E,{...e,autoCrop:!1,smiles:t.smiles,labels:{caption:t.name}},t.name))})},B={parameters:{layout:`padded`},render:e=>(0,P.jsx)(`div`,{style:W,children:F.map(t=>(0,P.jsx)(E,{...e,autoCrop:!1,width:t.width,height:t.height},t.width))})},V={parameters:{layout:`padded`},render:e=>(0,P.jsx)(`div`,{style:W,children:I.map(t=>(0,P.jsx)(N,{caption:t.caption,children:(0,P.jsx)(E,{...e,smiles:t.smiles,molfile:t.molfile,fallback:`no structure`})},t.caption))})},H={args:{width:260,height:200,autoCrop:!1,labels:{atoms:!0,bonds:!0,caption:`caffeine`}}},U={args:{smiles:d,width:280,height:200,autoCrop:!1,atomHighlight:s,labels:{caption:`acetyl`}}},W={display:`flex`,flexWrap:`wrap`,alignItems:`flex-end`,gap:16},G={display:`flex`,flexDirection:`column`,alignItems:`center`,padding:0,border:`1px dashed var(--border-strong, #c3cad3)`,borderRadius:`var(--radius, 10px)`,margin:0,gap:4},K={padding:`0 8px 6px`,color:`var(--text-muted, #5b6875)`,fontSize:`0.75rem`},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {DEMO_MOLECULES.map(molecule => <Structure key={molecule.name} {...args} autoCrop={false} smiles={molecule.smiles} labels={{
      caption: molecule.name
    }} />)}
    </div>
}`,...z.parameters?.docs?.source},description:{story:`Three molecules the sites show, each named inside its own picture.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {SIZES.map(size => <Structure key={size.width} {...args} autoCrop={false} width={size.width} height={size.height} />)}
    </div>
}`,...B.parameters?.docs?.source},description:{story:`The same molecule from a table row up to a panel of its own. Cropping is off
here, because a cropped picture keeps the atoms at the size the notation
lays them out and so barely follows the box it is given.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {UNREADABLE.map(entry => <Figure key={entry.caption} caption={entry.caption}>
          <Structure {...args} smiles={entry.smiles} molfile={entry.molfile} fallback="no structure" />
        </Figure>)}
    </div>
}`,...V.parameters?.docs?.source},description:{story:`What a page gets when the notation is wrong, empty, or simply absent: the
same quiet placeholder at the size of the picture that would have been
drawn, so a list of structures keeps its rhythm instead of gaining a red box.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source},description:{story:`Atom and bond indices written on the picture, which is what turns a
depiction into something an assignment or a highlight can point at.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source},description:{story:`The acetyl of aspirin painted, which is how a substructure hit is shown.`,...U.parameters?.docs?.description}}},q=[`Default`,`RealMolecules`,`EverySize`,`Unreadable`,`Labels`,`Highlighted`]})))()}J();export{R as Default,B as EverySize,U as Highlighted,H as Labels,z as RealMolecules,V as Unreadable,q as __namedExportsOrder,L as default};