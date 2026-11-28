import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{d as t,f as n,m as r,p as i,u as a}from"./lookup-C9yAJC0b.js";import{r as o,t as s}from"./languageParam-dyZ4WZE3.js";import{h as c,n as l}from"./iframe-aRVavQD_.js";import{n as u,t as d}from"./icon-CKsxevtA.js";import{a as f,n as p,o as m,t as h}from"./useT-BORbKjvp.js";import{n as g}from"./joinClassNames-BbK_6p9Z.js";import{n as _,r as v}from"./familyTokens-CGGRwh4r.js";import{n as y,t as b}from"./FilterInput-B2xK-Gqo.js";import{i as x,n as S,r as C,t as w}from"./ecosystemStyles-Dk4pDWyv.js";function T(e={}){return o(`https://${D}/`,e.language)}function E(e){return e?.trim().toLowerCase()===D}var D;function O(){return(O=e((()=>{s(),D=`www.cheminfo.org`})))()}function k(e,t={}){let n=A(e);if(n.length===0)return[];let{texts:r,sites:i=a}=t,o=[];for(let e=0;e<i.length;e++){let t=i[e];if(t===void 0)continue;let a=j(t,n,r?.(t)??[]);a>0&&o.push({site:t,score:a,at:e})}return o.toSorted((e,t)=>t.score-e.score||e.at-t.at).map(e=>e.site)}function A(e){return M(e).split(/\s+/u).filter(e=>e!==``)}function j(e,t,n){let r=M(`${e.name.lead}${e.name.alt}`),a=M(e.host),o=M([e.id,e.name.lead,e.name.alt,e.host,...e.formerIds??[],...e.formerHosts??[],e.tagline,i.find(t=>t.id===e.group)?.label??``,...n].join(` `)),s=0;for(let e of t){if(!o.includes(e)&&!r.includes(e))return 0;r.startsWith(e)||a.startsWith(e)?s+=3:r.includes(e)?s+=2:s+=1}return s}function M(e){return e.normalize(`NFD`).replaceAll(/\p{M}/gu,``).toLowerCase()}function N(){return(N=e((()=>{r(),t()})))()}function P(e){let{className:t,currentSiteId:r,atHome:i=!1}=e,a=p(),o=m(),[s,c]=(0,F.useState)(``),l=A(s).length>0,u=k(s,{texts:e=>[a.or(`site.${e.id}.tagline`,e.tagline),a.or(`ecosystem.group.${e.group}.label`,``)]}),f=u.find(e=>e.id!==r);return(0,I.jsxs)(`div`,{className:g(`ecosystem-menu`,t),style:L,children:[(0,I.jsxs)(`div`,{style:R,children:[(0,I.jsx)(`div`,{style:z,children:a(`ecosystem.menuHeading`)}),(0,I.jsx)(`div`,{style:B,children:(0,I.jsx)(b,{autoFocus:!0,value:s,placeholder:a(`ecosystem.search`),ariaLabel:a(`ecosystem.search`),onValueChange:c,onEnter:()=>{f!==void 0&&globalThis.open(n(f,{language:o}),`_blank`,`noreferrer`)}})}),i?null:(0,I.jsxs)(`a`,{href:T({language:o}),target:`_blank`,rel:`noreferrer`,title:a(`ecosystem.homeTitle`),style:V,children:[(0,I.jsx)(d,{icon:`home`,size:12}),D]})]}),l&&u.length===0?(0,I.jsx)(`p`,{style:H,children:a(`ecosystem.noMatch`,{query:s.trim()})}):(0,I.jsx)(C,{currentSiteId:r,only:l?new Set(u.map(e=>e.id)):void 0,pointed:l?f?.id:void 0,lit:!0,newTab:!0})]})}var F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{u(),F=c(),h(),f(),y(),v(),O(),N(),t(),x(),S(),I=l(),L={display:`flex`,width:`min(62rem, 92vw)`,maxHeight:`min(72vh, 44rem)`,flexDirection:`column`,padding:`12px 16px 4px`,gap:10,overflowY:`auto`},R={display:`flex`,flexWrap:`wrap`,alignItems:`center`,gap:`6px 16px`},z={...w,flex:`1 1 auto`},B={width:`min(16rem, 100%)`},V={display:`inline-flex`,alignItems:`center`,color:_.textMuted,fontSize:`0.75rem`,fontWeight:600,gap:5,whiteSpace:`nowrap`},H={margin:`4px 0 16px`,color:_.textMuted,fontSize:`0.8125rem`},P.__docgenInfo={description:`What the ecosystem button opens: every site of the family, gathered under the
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
| 'nmr'
| 'electrochemistry'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'iupac-name'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'isomers'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'spectroscopy'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'molecules'`},{name:`literal`,value:`'fair'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`},{name:`literal`,value:`'slides'`},{name:`literal`,value:`'chembio'`},{name:`literal`,value:`'wikidata'`},{name:`literal`,value:`'mz'`},{name:`literal`,value:`'plot'`},{name:`literal`,value:`'ml'`},{name:`literal`,value:`'vibrations'`},{name:`literal`,value:`'uv-vis'`},{name:`literal`,value:`'xps'`},{name:`literal`,value:`'cell'`},{name:`literal`,value:`'diagram'`},{name:`literal`,value:`'peptide'`},{name:`literal`,value:`'optics'`},{name:`literal`,value:`'circuits'`},{name:`literal`,value:`'mechanics'`},{name:`literal`,value:`'draw'`},{name:`literal`,value:`'plate'`},{name:`literal`,value:`'glassware'`},{name:`literal`,value:`'write'`},{name:`literal`,value:`'nmr'`},{name:`literal`,value:`'electrochemistry'`}]},description:`The site the visitor is already on, which is shown but never linked.
@default undefined`},atHome:{required:!1,tsType:{name:`boolean`},description:`Whether the visitor is on the family's entrance, www.cheminfo.org, which
the menu then does not link back to.
@default false`},className:{required:!1,tsType:{name:`string`},description:`Class names added to the root element, after the component's own.
@default undefined`}}}})))()}export{E as i,U as n,O as r,P as t};