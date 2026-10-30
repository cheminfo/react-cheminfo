const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./StructureSvg-_YBVtHEM.js","./rolldown-runtime-C0FnF6B9.js","./iframe-CtxtnG3J.js","./preload-helper-BHmFeTtP.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./lookup-BVzte1y8.js","./languageParam-dyZ4WZE3.js","./iframe-B_TyrEAy.css","./openchemlib-um1Sd8xk.js","./lib-SsnhyP4Y.js","./floating-ui.react-dom-Bf9jZeaJ.js","./react-dom-DwtKO7Vx.js","./emotion-styled.browser.esm-BRB8HT2z.js","./extends-D4puxXF7.js","./sourceMolecule-BNSS7cqC.js","./structureSource-DwNACzj-.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,t as n}from"./preload-helper-BHmFeTtP.js";import{h as r,n as i}from"./iframe-CtxtnG3J.js";import{n as a,r as o}from"./familyTokens-DsQXXJV4.js";import{n as s,t as c}from"./structureSource-DwNACzj-.js";function l(e){let{width:t,height:n,children:r}=e;return(0,u.jsx)(`span`,{style:{...d,width:t,height:n},"aria-hidden":`true`,children:r})}var u,d;function f(){return(f=e((()=>{o(),u=i(),d={display:`inline-flex`,alignItems:`center`,justifyContent:`center`,color:a.textFaint,fontSize:`0.75rem`},l.__docgenInfo={description:`A box the size of the picture that is not there, holding whatever the caller
wants said instead.
@param props - See {@link StructurePlaceholderProps}.
@returns The placeholder.`,methods:[],displayName:`StructurePlaceholder`,props:{width:{required:!0,tsType:{name:`number`},description:`Width of the box, in pixels: the width the picture would have had.`},height:{required:!0,tsType:{name:`number`},description:`Height of the box, in pixels.`},children:{required:!1,tsType:{name:`ReactNode`},description:`What is written in the middle of the box.
@default undefined`}}}})))()}function p(e){let{idCode:t,coordinates:n,molfile:r,smiles:i,width:a=200,height:o=140,labels:c={},atomLabels:u,atomLabelPlacement:d=`beside`,autoCrop:f=!0,autoCropMargin:p=4,atomHighlight:_,atomHighlightColor:v=`#a5d8ff`,bondHighlight:y,bondHighlightColor:b=`#ffd8a8`,substructure:x,substructureColor:S=`#ffd500`,substructureOpacity:C=.15,onAtomClick:w,onBondClick:T,fallback:E=`—`}=e,D=s({idCode:t,coordinates:n,molfile:r,smiles:i});return D.kind===`empty`?(0,h.jsx)(l,{width:a,height:o,children:E}):(0,h.jsx)(m.Suspense,{fallback:(0,h.jsx)(l,{width:a,height:o}),children:(0,h.jsx)(g,{source:D,width:a,height:o,autoCrop:f,autoCropMargin:p,atomHighlight:_,atomHighlightColor:v,bondHighlight:y,bondHighlightColor:b,substructure:x,substructureColor:S,substructureOpacity:C,showAtomNumber:c.atoms??!1,showBondNumber:c.bonds??!1,showMapping:c.mapping??!1,showCIPParity:c.stereo??!1,label:c.caption,atomLabels:u,atomLabelPlacement:d,onAtomClick:w,onBondClick:T,fallback:E})})}var m,h,g;function _(){return(_=e((()=>{m=r(),c(),f(),h=i(),t(),g=(0,m.lazy)(async()=>({default:(await n(()=>import(`./StructureSvg-_YBVtHEM.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]),import.meta.url)).StructureSvg})),p.__docgenInfo={description:`Draw a structure, from whichever notation the caller has.

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
@default '#ffd8a8'`},substructure:{required:!1,tsType:{name:`string`},description:"A query fragment, as an openchemlib idCode, whose every match is painted —\natoms and bonds alike, so the hit reads as one shape. When set, it takes\nthe place of `atomHighlight` and `bondHighlight`.\n@default undefined"},substructureColor:{required:!1,tsType:{name:`string`},description:"The colour the `substructure` match is painted.\n@default '#ffd500'"},substructureOpacity:{required:!1,tsType:{name:`number`},description:`How opaque the \`substructure\` match is painted, from 0 to 1. Light, so the
bonds and the atom labels under it stay legible.
@default 0.15`},onAtomClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(atom: number) => void`,signature:{arguments:[{type:{name:`number`},name:`atom`}],return:{name:`void`}}},description:`Called with the index of the atom that was clicked, counted from 0 as
openchemlib counts atoms.
@default undefined`},onBondClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(bond: number) => void`,signature:{arguments:[{type:{name:`number`},name:`bond`}],return:{name:`void`}}},description:`Called with the index of the bond that was clicked, counted from 0.
@default undefined`},fallback:{required:!1,tsType:{name:`ReactNode`},description:`What is shown when there is no structure, or when the one supplied cannot
be read. An em dash rather than a red box: a missing structure is a row of
a table far more often than it is a bug worth shouting about.
@default '—'`}}}})))()}export{f as i,_ as n,l as r,p as t};