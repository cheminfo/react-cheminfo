import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,l as n,n as r,o as i,r as a,s as o}from"./lookup-BWuR8Es2.js";import{h as s,n as c}from"./iframe-Bi73MxDJ.js";import{n as l,r as u}from"./familyTokens-DsQXXJV4.js";import{n as d,t as f}from"./nameColors-BYPKGqj-.js";import{n as p,t as m}from"./marks-BXsL87KO.js";function h(e){let{group:t,children:n}=e,r=`${(0,g.useId)()}ecosystem-${t.id}`;return(0,_.jsxs)(`section`,{style:v,"aria-labelledby":r,children:[(0,_.jsx)(`h3`,{id:r,style:y,children:t.label}),(0,_.jsx)(`p`,{style:b,children:t.blurb}),(0,_.jsx)(`div`,{style:x,children:n})]})}var g,_,v,y,b,x;function S(){return(S=e((()=>{g=s(),u(),_=c(),v={paddingTop:12,borderTop:`1px solid ${l.border}`,marginBottom:16},y={margin:0,color:l.text,fontSize:`0.6875rem`,fontWeight:700,letterSpacing:`0.07em`,textTransform:`uppercase`},b={margin:`2px 0 8px`,color:l.textFaint,fontSize:`0.72rem`,lineHeight:1.4},x={display:`flex`,flexDirection:`column`,gap:2},h.__docgenInfo={description:`One topic of the family: its heading, the line saying who it is for, and the
sites under it.
The heading id is unique to each render, because the footer and the open
Tools menu write the same topics into one document.
@param props - The topic, and its sites.
@returns The section.`,methods:[],displayName:`SiteGroupSection`,props:{group:{required:!0,tsType:{name:`SiteGroup`},description:`The topic being headed.`},children:{required:!0,tsType:{name:`ReactNode`},description:`The sites written under it.`}}}})))()}function C(){let e=(0,w.use)(T);return e===void 0?n(globalThis.location?.search??``):e}var w,T;function E(){return(E=e((()=>{w=s(),t(),T=(0,w.createContext)(void 0)})))()}function D(e){let t=C(),{className:n,site:r,isCurrent:i,isHovered:a=!1,onHover:s,newTab:c=!1}=e,l=a&&!i,u=d(r),f=(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(`div`,{style:{...M,transform:l?`scale(1.08) rotate(-6deg)`:`none`},children:(0,A.jsx)(m,{site:r})}),(0,A.jsxs)(`div`,{style:N,children:[(0,A.jsxs)(`div`,{style:P,children:[(0,A.jsxs)(`span`,{children:[(0,A.jsx)(`span`,{style:{color:u.lead},children:r.name.lead}),r.name.dot?(0,A.jsx)(`span`,{style:{color:u.dot},children:`.`}):null,(0,A.jsx)(`span`,{style:{color:u.alt},children:r.name.alt})]}),i?(0,A.jsx)(`span`,{style:{...F,color:r.brandAlt},children:`you are here`}):null]}),(0,A.jsx)(`div`,{style:I,children:r.tagline})]})]}),p={...j,background:O(r,i,l),borderColor:k(r,i,l),transform:l?`translateY(-1px)`:`none`,cursor:i?`default`:`pointer`};return i?(0,A.jsx)(`div`,{style:p,children:f}):(0,A.jsx)(`a`,{className:n,style:p,href:o(r,{language:t}),target:c?`_blank`:void 0,rel:c?`noreferrer`:void 0,onMouseEnter:()=>s?.(r.id),onMouseLeave:()=>s?.(null),onFocus:()=>s?.(r.id),onBlur:()=>s?.(null),children:f})}function O(e,t,n){return t?l.surfaceSunken:n?`color-mix(in oklab, ${e.brand} 9%, white)`:`transparent`}function k(e,t,n){return t?l.border:n?`color-mix(in oklab, ${e.brand} 32%, white)`:`transparent`}var A,j,M,N,P,F,I;function L(){return(L=e((()=>{E(),u(),f(),i(),p(),A=c(),j={display:`flex`,alignItems:`flex-start`,padding:`7px 8px`,border:`1px solid transparent`,borderRadius:10,color:l.text,gap:10,textDecoration:`none`,transition:`background 120ms, border-color 120ms, transform 120ms`},M={display:`flex`,marginTop:1,transition:`transform 160ms`},N={minWidth:0},P={display:`flex`,alignItems:`baseline`,fontSize:`0.9375rem`,fontWeight:700,letterSpacing:`-0.01em`,gap:6,whiteSpace:`nowrap`},F={fontSize:`0.625rem`,fontWeight:700,letterSpacing:`0.04em`,textTransform:`uppercase`},I={color:l.textMuted,fontSize:`0.75rem`,lineHeight:1.35},D.__docgenInfo={description:`One site: its mark, its name in its own colours, and what it does. The name
and the tagline are real text — that is what a crawler reads to know what it
is following, so neither is ever a \`title\` attribute.
@param props - The site, whether it is the current or the hovered one, and
how the link opens.
@returns The tile.`,methods:[],displayName:`SiteTile`,props:{site:{required:!0,tsType:{name:`EcosystemSite`},description:`The site the tile opens.`},isCurrent:{required:!0,tsType:{name:`boolean`},description:`Whether this is the site the visitor is already on.`},isHovered:{required:!1,tsType:{name:`boolean`},description:`Whether the pointer is on it, which lights it in its own colour.
@default false`},onHover:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(id: SiteId | null) => void`,signature:{arguments:[{type:{name:`union`,raw:`SiteId | null`,elements:[{name:`union`,raw:`| 'learn'
| 'inchi'
| 'vcl'
| 'smiles'
| 'openbabel'
| 'chemcalc'
| 'dbe'
| 'nmrium'
| 'metabo'
| 'derepflow'
| 'surge'
| 'tex'
| 'lcao'
| 'regexp'
| 'pdb'
| 'elucidation'
| 'equilibrium'
| 'polycarp'
| '3d'
| 'periodic-table'
| 'database'
| 'symmetry'
| 'osiris'
| 'atoms'
| 'moles'
| 'inorganic'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`}]},{name:`null`}]},name:`id`}],return:{name:`void`}}},description:`Told which site the pointer moved onto, or null when it left.
@default undefined`},newTab:{required:!1,tsType:{name:`boolean`},description:`Whether the link opens a tab of its own. A menu the visitor opened on
purpose does; a footer does not.
@default false`},className:{required:!1,tsType:{name:`string`},description:`Class names added to the root element.
@default undefined`}}}})))()}function R(e){let{currentSiteId:t,lit:n=!1,newTab:i=!1}=e,[a,o]=(0,z.useState)(null);return(0,B.jsx)(`div`,{style:V,children:r().map(({group:e,sites:r})=>(0,B.jsx)(h,{group:e,children:r.map(e=>(0,B.jsx)(D,{site:e,isCurrent:e.id===t,isHovered:n&&a===e.id,onHover:n?o:void 0,newTab:i},e.id))},e.id))})}var z,B,V;function H(){return(H=e((()=>{z=s(),a(),S(),L(),B=c(),V={display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(17rem, 1fr))`,alignItems:`start`,gap:`4px 28px`},R.__docgenInfo={description:`Every site of the family as a tile, gathered under its topic, in the columns
the footer and the Tools menu both draw.
@param props - The site it sits on, and how the tiles behave.
@returns The grid of topics.`,methods:[],displayName:`SiteGroupGrid`,props:{currentSiteId:{required:!1,tsType:{name:`union`,raw:`| 'learn'
| 'inchi'
| 'vcl'
| 'smiles'
| 'openbabel'
| 'chemcalc'
| 'dbe'
| 'nmrium'
| 'metabo'
| 'derepflow'
| 'surge'
| 'tex'
| 'lcao'
| 'regexp'
| 'pdb'
| 'elucidation'
| 'equilibrium'
| 'polycarp'
| '3d'
| 'periodic-table'
| 'database'
| 'symmetry'
| 'osiris'
| 'atoms'
| 'moles'
| 'inorganic'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`}]},description:`The site the visitor is already on, which is written but never linked.
@default undefined`},lit:{required:!1,tsType:{name:`boolean`},description:`Whether a tile lights up in its own colour under the pointer, which a menu
the visitor opened on purpose does and a footer does not.
@default false`},newTab:{required:!1,tsType:{name:`boolean`},description:`Whether each link opens a tab of its own.
@default false`}}}})))()}var U;function W(){return(W=e((()=>{u(),U={margin:0,color:l.textMuted,fontSize:`0.75rem`,fontWeight:600}})))()}export{E as a,H as i,W as n,C as o,R as r,U as t};