const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./StructureSvg-CWxbVaHw.js","./rolldown-runtime-C0FnF6B9.js","./iframe-CGFjf9cs.js","./preload-helper-BHmFeTtP.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./iframe-B-cIiNHy.css","./lib-DOO-SNEm.js","./floating-ui.react-dom-DmSEIAdJ.js","./react-dom-CbgKcDPk.js","./emotion-styled.browser.esm-BLGITWEb.js","./extends-D4puxXF7.js"])))=>i.map(i=>d[i]);
import{n as e,r as t}from"./rolldown-runtime-C0FnF6B9.js";import{n,t as r}from"./preload-helper-BHmFeTtP.js";import{f as i,n as a}from"./iframe-CGFjf9cs.js";import{a as o,i as s,n as c,o as l,t as u}from"./structureFixtures-DYs_uddm.js";function d(e){let{width:t,height:n,children:r}=e;return(0,f.jsx)(`span`,{style:{...p,width:t,height:n},"aria-hidden":`true`,children:r})}var f,p;function m(){return(m=e((()=>{f=a(),p={display:`inline-flex`,alignItems:`center`,justifyContent:`center`,color:`#8a96a3`,fontSize:`0.75rem`},d.__docgenInfo={description:`A box the size of the picture that is not there, holding whatever the caller
wants said instead.
@param props - See {@link StructurePlaceholderProps}.
@returns The placeholder.`,methods:[],displayName:`StructurePlaceholder`,props:{width:{required:!0,tsType:{name:`number`},description:`Width of the box, in pixels: the width the picture would have had.`},height:{required:!0,tsType:{name:`number`},description:`Height of the box, in pixels.`},children:{required:!1,tsType:{name:`ReactNode`},description:`What is written in the middle of the box.
@default undefined`}}}})))()}function h(e){return y.test(e)?{version:`v3000`,atomCount:_(e,x)}:v.test(e)?{version:`v2000`,atomCount:_(e,b)}:{version:`unknown`,atomCount:0}}function g(e){return h(e).atomCount}function _(e,t){let n=t.exec(e)?.groups?.atoms;if(n===void 0)return 0;let r=Number.parseInt(n.trim(),10);return Number.isFinite(r)&&r>0?r:0}var v,y,b,x;function S(){return(S=e((()=>{v=/^[\d ]+V2000[^\S\n]*$/m,y=/^[\d ]+V3000[^\S\n]*$/m,b=/^(?<atoms>[\d ]{3})[\d ]*V2000[^\S\n]*$/m,x=/^M {2}V30 COUNTS +(?<atoms>\d+)/m})))()}function C(e){let[t=``,n]=e.trim().split(` `);return n===void 0?{idCode:t}:{idCode:t,coordinates:n}}function w(e){return T.has(C(e).idCode)}var T;function E(){return(E=e((()=>{T=new Set([``,`d@`,`dH`])})))()}function D(e){let{idCode:t,coordinates:n,molfile:r,smiles:i}=e;if(t!==void 0&&!w(t)){let e=C(t),r=e.coordinates??n;return r===void 0||r===``?{kind:`idcode`,value:e.idCode}:{kind:`idcode`,value:e.idCode,coordinates:r}}if(r!==void 0&&g(r)>0)return{kind:`molfile`,value:r};let a=i?.trim()??``;return a===``?{kind:`empty`,value:``}:{kind:`smiles`,value:a}}function O(){return(O=e((()=>{E(),S()})))()}function k(e){let{idCode:t,coordinates:n,molfile:r,smiles:i,width:a=200,height:o=140,labels:s={},autoCrop:c=!0,autoCropMargin:l=4,atomHighlight:u,atomHighlightColor:f=`#a5d8ff`,bondHighlight:p,bondHighlightColor:m=`#ffd8a8`,fallback:h=`—`}=e,g=D({idCode:t,coordinates:n,molfile:r,smiles:i});return g.kind===`empty`?(0,j.jsx)(d,{width:a,height:o,children:h}):(0,j.jsx)(A.Suspense,{fallback:(0,j.jsx)(d,{width:a,height:o}),children:(0,j.jsx)(M,{source:g,width:a,height:o,autoCrop:c,autoCropMargin:l,atomHighlight:u,atomHighlightColor:f,bondHighlight:p,bondHighlightColor:m,showAtomNumber:s.atoms??!1,showBondNumber:s.bonds??!1,showMapping:s.mapping??!1,label:s.caption,fallback:h})})}var A,j,M;function N(){return(N=e((()=>{A=i(),O(),m(),j=a(),n(),M=(0,A.lazy)(async()=>({default:(await r(()=>import(`./StructureSvg-CWxbVaHw.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url)).StructureSvg})),k.__docgenInfo={description:`Draw a structure, from whichever notation the caller has.

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
@default '—'`}}}})))()}var P=t({Default:()=>B,EverySize:()=>H,Highlighted:()=>G,Labels:()=>W,RealMolecules:()=>V,Unreadable:()=>U,__namedExportsOrder:()=>Y,default:()=>z});function F(e){return(0,I.jsxs)(`figure`,{style:q,children:[e.children,(0,I.jsx)(`figcaption`,{style:J,children:e.caption})]})}var I,L,R,z,B,V,H,U,W,G,K,q,J,Y;function X(){return(X=e((()=>{N(),l(),I=a(),L=[{width:110,height:80},{width:200,height:150},{width:320,height:240}],R=[{caption:`a name, not a notation`,smiles:`benzene`},{caption:`a ring that never closes`,smiles:`C1CCCCC`},{caption:`a molfile with no atoms`,molfile:`
OCL MolfileCreator  2D

  0  0  0  0  0  0  0  0  0  0999 V2000
M  END
`},{caption:`nothing at all`}],z={title:`Structure/Structure`,component:k,args:{smiles:s,width:220,height:160},argTypes:{width:{control:{type:`range`,min:80,max:480,step:10}},height:{control:{type:`range`,min:60,max:360,step:10}},autoCrop:{control:`boolean`},autoCropMargin:{control:{type:`range`,min:0,max:40,step:2}}},parameters:{docs:{description:{component:`A read-only depiction, drawn from whichever notation the caller has — an idCode, a molfile or a SMILES — and never a broken box when there is none.`}}}},B={},V={parameters:{layout:`padded`},render:e=>(0,I.jsx)(`div`,{style:K,children:o.map(t=>(0,I.jsx)(k,{...e,autoCrop:!1,smiles:t.smiles,labels:{caption:t.name}},t.name))})},H={parameters:{layout:`padded`},render:e=>(0,I.jsx)(`div`,{style:K,children:L.map(t=>(0,I.jsx)(k,{...e,autoCrop:!1,width:t.width,height:t.height},t.width))})},U={parameters:{layout:`padded`},render:e=>(0,I.jsx)(`div`,{style:K,children:R.map(t=>(0,I.jsx)(F,{caption:t.caption,children:(0,I.jsx)(k,{...e,smiles:t.smiles,molfile:t.molfile,fallback:`no structure`})},t.caption))})},W={args:{width:260,height:200,autoCrop:!1,labels:{atoms:!0,bonds:!0,caption:`caffeine`}}},G={args:{smiles:u,width:280,height:200,autoCrop:!1,atomHighlight:c,labels:{caption:`acetyl`}}},K={display:`flex`,flexWrap:`wrap`,alignItems:`flex-end`,gap:16},q={display:`flex`,flexDirection:`column`,alignItems:`center`,padding:0,border:`1px dashed var(--border-strong, #c3cad3)`,borderRadius:`var(--radius, 10px)`,margin:0,gap:4},J={padding:`0 8px 6px`,color:`var(--text-muted, #5b6875)`,fontSize:`0.75rem`},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {DEMO_MOLECULES.map(molecule => <Structure key={molecule.name} {...args} autoCrop={false} smiles={molecule.smiles} labels={{
      caption: molecule.name
    }} />)}
    </div>
}`,...V.parameters?.docs?.source},description:{story:`Three molecules the sites show, each named inside its own picture.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {SIZES.map(size => <Structure key={size.width} {...args} autoCrop={false} width={size.width} height={size.height} />)}
    </div>
}`,...H.parameters?.docs?.source},description:{story:`The same molecule from a table row up to a panel of its own. Cropping is off
here, because a cropped picture keeps the atoms at the size the notation
lays them out and so barely follows the box it is given.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={ROW_STYLE}>
      {UNREADABLE.map(entry => <Figure key={entry.caption} caption={entry.caption}>
          <Structure {...args} smiles={entry.smiles} molfile={entry.molfile} fallback="no structure" />
        </Figure>)}
    </div>
}`,...U.parameters?.docs?.source},description:{story:`What a page gets when the notation is wrong, empty, or simply absent: the
same quiet placeholder at the size of the picture that would have been
drawn, so a list of structures keeps its rhythm instead of gaining a red box.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source},description:{story:`Atom and bond indices written on the picture, which is what turns a
depiction into something an assignment or a highlight can point at.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source},description:{story:`The acetyl of aspirin painted, which is how a substructure hit is shown.`,...G.parameters?.docs?.description}}},Y=[`Default`,`RealMolecules`,`EverySize`,`Unreadable`,`Labels`,`Highlighted`]})))()}export{m as i,X as n,d as r,P as t};