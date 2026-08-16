import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-Dv2NUrie.js";import{a as r,i,n as a,r as o,t as s}from"./marks-CQUBtBjX.js";function c(e){let{site:t,isCurrent:n,isHovered:i=!1,onHover:a,newTab:o=!1}=e,c=i&&!n,v=(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`div`,{style:{...p,transform:c?`scale(1.08) rotate(-6deg)`:`none`},children:(0,d.jsx)(s,{site:t})}),(0,d.jsxs)(`div`,{style:m,children:[(0,d.jsxs)(`div`,{style:h,children:[(0,d.jsxs)(`span`,{children:[(0,d.jsx)(`span`,{style:{color:t.brand},children:t.name.lead}),t.name.dot?(0,d.jsx)(`span`,{style:{color:`#8a96a3`},children:`.`}):null,(0,d.jsx)(`span`,{style:{color:t.brandAlt},children:t.name.alt})]}),n?(0,d.jsx)(`span`,{style:{...g,color:t.brandAlt},children:`you are here`}):null]}),(0,d.jsx)(`div`,{style:_,children:t.tagline})]})]}),y={...f,background:l(t,n,c),borderColor:u(t,n,c),transform:c?`translateY(-1px)`:`none`,cursor:n?`default`:`pointer`};return n?(0,d.jsx)(`div`,{style:y,children:v}):(0,d.jsx)(`a`,{style:y,href:r(t),target:o?`_blank`:void 0,rel:o?`noreferrer`:void 0,onMouseEnter:()=>a?.(t.id),onMouseLeave:()=>a?.(null),onFocus:()=>a?.(t.id),onBlur:()=>a?.(null),children:v})}function l(e,t,n){return t?`#f5f7fa`:n?`color-mix(in oklab, ${e.brand} 9%, white)`:`transparent`}function u(e,t,n){return t?`#dfe3e8`:n?`color-mix(in oklab, ${e.brand} 32%, white)`:`transparent`}var d,f,p,m,h,g,_;function v(){return(v=e((()=>{i(),a(),d=n(),f={display:`flex`,alignItems:`center`,padding:`7px 8px`,border:`1px solid transparent`,borderRadius:10,color:`#16202c`,gap:10,textDecoration:`none`,transition:`background 120ms, border-color 120ms, transform 120ms`},p={display:`flex`,transition:`transform 160ms`},m={minWidth:0},h={display:`flex`,alignItems:`baseline`,fontSize:`0.9375rem`,fontWeight:700,letterSpacing:`-0.01em`,gap:6,whiteSpace:`nowrap`},g={fontSize:`0.625rem`,fontWeight:700,letterSpacing:`0.04em`,textTransform:`uppercase`},_={color:`#5b6875`,fontSize:`0.75rem`,lineHeight:1.35},c.__docgenInfo={description:`One site: its mark, its name in its own colours, and what it does. The name
and the tagline are real text — that is what a crawler reads to know what it
is following, so neither is ever a \`title\` attribute.
@param props - The site, whether it is the current or the hovered one, and
how the link opens.
@returns The tile.`,methods:[],displayName:`SiteTile`,props:{site:{required:!0,tsType:{name:`EcosystemSite`},description:`The site the tile opens.`},isCurrent:{required:!0,tsType:{name:`boolean`},description:`Whether this is the site the visitor is already on.`},isHovered:{required:!1,tsType:{name:`boolean`},description:`Whether the pointer is on it, which lights it in its own colour.
@default false`},onHover:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(id: SiteId | null) => void`,signature:{arguments:[{type:{name:`union`,raw:`SiteId | null`,elements:[{name:`union`,raw:`| 'inchi'
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
| 'polycarp'`,elements:[{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`}]},{name:`null`}]},name:`id`}],return:{name:`void`}}},description:`Told which site the pointer moved onto, or null when it left.
@default undefined`},newTab:{required:!1,tsType:{name:`boolean`},description:`Whether the link opens a tab of its own. A menu the visitor opened on
purpose does; a footer does not.
@default false`}}}})))()}function y(e){let{currentSiteId:t}=e,[n,r]=(0,b.useState)(null);return(0,x.jsxs)(`div`,{className:`ecosystem-menu`,style:S,children:[(0,x.jsx)(`div`,{style:C,children:`Our other tools, all in the browser`}),(0,x.jsx)(`div`,{style:w,children:o.map(e=>(0,x.jsx)(c,{site:e,isCurrent:e.id===t,isHovered:n===e.id,onHover:r,newTab:!0},e.id))})]})}var b,x,S,C,w;function T(){return(T=e((()=>{b=t(),i(),v(),x=n(),S={display:`flex`,width:`min(34rem, 90vw)`,flexDirection:`column`,padding:12,gap:8},C={color:`#5b6875`,fontSize:`0.75rem`,fontWeight:600},w={display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(15rem, 1fr))`,gap:2},y.__docgenInfo={description:`What the ecosystem button opens: every site of the family, each behind its
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
| 'polycarp'`,elements:[{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`}]},description:`The site the visitor is already on, which is shown but never linked.
@default undefined`}}}})))()}export{T as n,y as t};