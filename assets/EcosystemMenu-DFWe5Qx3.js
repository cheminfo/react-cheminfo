import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-BDQJEmVY.js";import{i as r,r as i}from"./lookup-BebdeTGz.js";import{n as a,t as o}from"./SiteTile-2DUEgvtT.js";function s(e){let{currentSiteId:t}=e,[n,r]=(0,c.useState)(null);return(0,l.jsxs)(`div`,{className:`ecosystem-menu`,style:u,children:[(0,l.jsx)(`div`,{style:d,children:`Our other tools, all in the browser`}),(0,l.jsx)(`div`,{style:f,children:i.map(e=>(0,l.jsx)(o,{site:e,isCurrent:e.id===t,isHovered:n===e.id,onHover:r,newTab:!0},e.id))})]})}var c,l,u,d,f;function p(){return(p=e((()=>{c=t(),r(),a(),l=n(),u={display:`flex`,width:`min(34rem, 90vw)`,flexDirection:`column`,padding:12,gap:8},d={color:`#5b6875`,fontSize:`0.75rem`,fontWeight:600},f={display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(15rem, 1fr))`,gap:2},s.__docgenInfo={description:`What the ecosystem button opens: every site of the family, each behind its
own little logo and the two colours it owns. It lives in a popover, so a
crawler never reaches it — \`EcosystemLinks\` is what carries the family
through the page itself.
@param props - The site the visitor is already on.
@returns The grid of sites.`,methods:[],displayName:`EcosystemMenu`,props:{currentSiteId:{required:!1,tsType:{name:`union`,raw:`| 'inchi'
| 'vcl'
| 'smiles'
| 'chemcalc'
| 'nmrium'
| 'surge'
| 'tex'
| 'lcao'
| 'regexp'
| 'pdb'
| 'elucidation'
| 'equilibrium'
| 'polycarp'
| '3d'
| 'pt'`,elements:[{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'pt'`}]},description:`The site the visitor is already on, which is shown but never linked.
@default undefined`}}}})))()}export{p as n,s as t};