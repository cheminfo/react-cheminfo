import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,d as n,f as r,l as i,u as a}from"./lookup-DmkUT9Bz.js";import{r as o,t as s}from"./languageParam-dyZ4WZE3.js";import{h as c,n as l}from"./iframe-OXIKjtTF.js";import{n as u,t as d}from"./icon-D920VX2a.js";import{a as f,n as p,o as m,t as h}from"./useT-CmymSdmP.js";import{n as g,r as _}from"./buttons-y_PxsdZU.js";import{n as v,t as y}from"./inputGroup-_HoymASF.js";import{n as b}from"./joinClassNames-BbK_6p9Z.js";import{n as x,r as S}from"./familyTokens-DsQXXJV4.js";import{i as C,n as w,r as T,t as E}from"./ecosystemStyles-B_CXx039.js";function D(e){let{label:t,onClick:n}=e;return(0,O.jsx)(g,{className:`no-print`,variant:`minimal`,icon:`cross`,"aria-label":t,title:t,onClick:n})}var O;function k(){return(k=e((()=>{_(),O=l(),D.__docgenInfo={description:`The cross that empties a box, worn inside it as Blueprint's \`rightElement\`.

Blueprint has no clearable input of its own; what it has is the slot, and a
minimal cross button in it is the shape its own examples use. Which is why
this carries no \`size\`: the input group sizes whatever is put in the slot
from its own size class — 20 square inside a small box, 24 inside a medium
one — so a button that stated a size of its own would only be able to
disagree with the box it is in.

One component rather than eight lines repeated at each box, because the
cross has to be the same size, the same colour and in the same place
everywhere or it reads as a different control each time.
@param props - What clearing achieves, and what to do about it.
@returns The button, for an \`InputGroup\`'s \`rightElement\`.`,methods:[],displayName:`ClearButton`,props:{label:{required:!0,tsType:{name:`string`},description:'What emptying the box does, said as the thing it achieves rather than as\n"clear" — a screen reader and a hovering pointer both get this one line,\nand `Leave green out` says what `Clear` does not.'},onClick:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when it is clicked, with the box left for the caller to empty.`}}}})))()}function A(e){let{value:t,onValueChange:n,placeholder:r,autoFocus:i=!1}=e,{ariaLabel:a,onEnter:o}=e,s=p();return(0,j.jsx)(y,{autoFocus:i,leftIcon:`search`,size:`small`,value:t,placeholder:r,"aria-label":a,spellCheck:!1,autoCapitalize:`off`,autoCorrect:`off`,autoComplete:`off`,rightElement:t.length>0?(0,j.jsx)(D,{label:s(`panel.clearFilter`),onClick:()=>n(``)}):void 0,onValueChange:n,onKeyDown:o===void 0?void 0:e=>{e.key!==`Enter`||e.nativeEvent.isComposing||(e.preventDefault(),o())}})}var j;function M(){return(M=e((()=>{v(),h(),k(),j=l(),A.__docgenInfo={description:`The box a list is filtered through, with a cross to empty it again.

A filter left behind hides entries that are still there, and a peak table is
exactly where that goes unnoticed — a spectrum with three peaks in it looks
like a spectrum with three peaks in it. So every list that offers a filter
also offers one click back to the whole of it rather than a held backspace.

Every correction the browser offers is turned off: a formula, an m/z and a
residue name are neither words nor sentences, and a mobile keyboard
capitalising \`mNa+\` or autocorrecting \`Hex\` is how a query stops matching
anything.
@param props - Component props.
@returns The box.`,methods:[],displayName:`FilterInput`,props:{value:{required:!0,tsType:{name:`string`},description:`What the user typed.`},onValueChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: string) => void`,signature:{arguments:[{type:{name:`string`},name:`value`}],return:{name:`void`}}},description:"Called with what the user typed, and with `''` when the cross is clicked."},placeholder:{required:!0,tsType:{name:`string`},description:`What the box says while it is empty.`},autoFocus:{required:!1,tsType:{name:`boolean`},description:`Whether the box takes the caret as it appears, for the times it is revealed
by a click on a toolbar item somewhere else.
@default false`},ariaLabel:{required:!1,tsType:{name:`string`},description:`What a screen reader calls the box.
@default undefined — the placeholder names it`},onEnter:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when Enter is pressed in the box, to open the entry the filter
leads to.
@default undefined — Enter does nothing`}}}})))()}function N(e={}){return o(`https://${F}/`,e.language)}function P(e){return e?.trim().toLowerCase()===F}var F;function I(){return(I=e((()=>{s(),F=`www.cheminfo.org`})))()}function L(e,n={}){let r=R(e);if(r.length===0)return[];let{texts:i,sites:a=t}=n,o=[];for(let e=0;e<a.length;e++){let t=a[e];if(t===void 0)continue;let n=z(t,r,i?.(t)??[]);n>0&&o.push({site:t,score:n,at:e})}return o.toSorted((e,t)=>t.score-e.score||e.at-t.at).map(e=>e.site)}function R(e){return B(e).split(/\s+/u).filter(e=>e!==``)}function z(e,t,r){let i=B(`${e.name.lead}${e.name.alt}`),a=B(e.host),o=B([e.id,e.name.lead,e.name.alt,e.host,...e.formerIds??[],...e.formerHosts??[],e.tagline,n.find(t=>t.id===e.group)?.label??``,...r].join(` `)),s=0;for(let e of t){if(!o.includes(e)&&!i.includes(e))return 0;i.startsWith(e)||a.startsWith(e)?s+=3:i.includes(e)?s+=2:s+=1}return s}function B(e){return e.normalize(`NFD`).replaceAll(/\p{M}/gu,``).toLowerCase()}function V(){return(V=e((()=>{r(),i()})))()}function H(e){let{className:t,currentSiteId:n,atHome:r=!1}=e,i=p(),o=m(),[s,c]=(0,U.useState)(``),l=R(s).length>0,u=L(s,{texts:e=>[i.or(`site.${e.id}.tagline`,e.tagline),i.or(`ecosystem.group.${e.group}.label`,``)]}),f=u.find(e=>e.id!==n);return(0,W.jsxs)(`div`,{className:b(`ecosystem-menu`,t),style:G,children:[(0,W.jsxs)(`div`,{style:K,children:[(0,W.jsx)(`div`,{style:q,children:i(`ecosystem.menuHeading`)}),(0,W.jsx)(`div`,{style:J,children:(0,W.jsx)(A,{autoFocus:!0,value:s,placeholder:i(`ecosystem.search`),ariaLabel:i(`ecosystem.search`),onValueChange:c,onEnter:()=>{f!==void 0&&globalThis.open(a(f,{language:o}),`_blank`,`noreferrer`)}})}),r?null:(0,W.jsxs)(`a`,{href:N({language:o}),target:`_blank`,rel:`noreferrer`,title:i(`ecosystem.homeTitle`),style:Y,children:[(0,W.jsx)(d,{icon:`home`,size:12}),F]})]}),l&&u.length===0?(0,W.jsx)(`p`,{style:X,children:i(`ecosystem.noMatch`,{query:s.trim()})}):(0,W.jsx)(T,{currentSiteId:n,only:l?new Set(u.map(e=>e.id)):void 0,pointed:l?f?.id:void 0,lit:!0,newTab:!0})]})}var U,W,G,K,q,J,Y,X;function Z(){return(Z=e((()=>{u(),U=c(),h(),f(),M(),S(),I(),V(),i(),C(),w(),W=l(),G={display:`flex`,width:`min(62rem, 92vw)`,maxHeight:`min(72vh, 44rem)`,flexDirection:`column`,padding:`12px 16px 4px`,gap:10,overflowY:`auto`},K={display:`flex`,flexWrap:`wrap`,alignItems:`center`,gap:`6px 16px`},q={...E,flex:`1 1 auto`},J={width:`min(16rem, 100%)`},Y={display:`inline-flex`,alignItems:`center`,color:x.textMuted,fontSize:`0.75rem`,fontWeight:600,gap:5,whiteSpace:`nowrap`},X={margin:`4px 0 16px`,color:x.textMuted,fontSize:`0.8125rem`},H.__docgenInfo={description:`What the ecosystem button opens: every site of the family, gathered under the
topic it belongs to, each behind its own little logo and the two colours it
owns, with a search over them and a link to the family's entrance.

The topics are what make the menu answer a question a flat grid of tiles
never could — which of these is for a first-year course, and which for
a research project. The search answers the other question, the one asked by
name: it keeps the topics, leaves out the sites that do not answer, lights
the best one, and Enter opens it. It lives in a popover, so a crawler never
reaches it; \`EcosystemLinks\` is what carries the family through the page
itself.
@param props - The site the visitor is already on.
@returns The search, the topics and their sites.`,methods:[],displayName:`EcosystemMenu`,props:{currentSiteId:{required:!1,tsType:{name:`union`,raw:`| 'learn'
| 'inchi'
| 'vcl'
| 'smiles'
| 'iupac-name'
| 'openbabel'
| 'chemcalc'
| 'dbe'
| 'metabo'
| 'derepflow'
| 'isomers'
| 'tex'
| 'lcao'
| 'regexp'
| 'pdb'
| 'elucidation'
| 'spectroscopy'
| 'equilibrium'
| 'polycarp'
| '3d'
| 'periodic-table'
| 'database'
| 'molecules'
| 'fair'
| 'symmetry'
| 'osiris'
| 'atoms'
| 'moles'
| 'inorganic'
| 'slides'
| 'chembio'
| 'wikidata'
| 'mz'
| 'plot'
| 'ml'
| 'vibrations'
| 'uv-vis'
| 'xps'
| 'cell'
| 'diagram'
| 'peptide'
| 'optics'
| 'circuits'
| 'mechanics'
| 'draw'
| 'plate'
| 'glassware'
| 'write'
| 'nmr'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'iupac-name'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'isomers'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'spectroscopy'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'molecules'`},{name:`literal`,value:`'fair'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`},{name:`literal`,value:`'slides'`},{name:`literal`,value:`'chembio'`},{name:`literal`,value:`'wikidata'`},{name:`literal`,value:`'mz'`},{name:`literal`,value:`'plot'`},{name:`literal`,value:`'ml'`},{name:`literal`,value:`'vibrations'`},{name:`literal`,value:`'uv-vis'`},{name:`literal`,value:`'xps'`},{name:`literal`,value:`'cell'`},{name:`literal`,value:`'diagram'`},{name:`literal`,value:`'peptide'`},{name:`literal`,value:`'optics'`},{name:`literal`,value:`'circuits'`},{name:`literal`,value:`'mechanics'`},{name:`literal`,value:`'draw'`},{name:`literal`,value:`'plate'`},{name:`literal`,value:`'glassware'`},{name:`literal`,value:`'write'`},{name:`literal`,value:`'nmr'`}]},description:`The site the visitor is already on, which is shown but never linked.
@default undefined`},atHome:{required:!1,tsType:{name:`boolean`},description:`Whether the visitor is on the family's entrance, www.cheminfo.org, which
the menu then does not link back to.
@default false`},className:{required:!1,tsType:{name:`string`},description:`Class names added to the root element, after the component's own.
@default undefined`}}}})))()}export{P as i,Z as n,I as r,H as t};