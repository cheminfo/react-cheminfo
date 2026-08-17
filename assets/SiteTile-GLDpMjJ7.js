import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-d1eXCcja.js";import{a as n,i as r}from"./lookup-C_zzqmKr.js";import{n as i,t as a}from"./marks-4pmrBkTl.js";function o(e){let{site:t,isCurrent:r,isHovered:i=!1,onHover:o,newTab:g=!1}=e,_=i&&!r,v=(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(`div`,{style:{...d,transform:_?`scale(1.08) rotate(-6deg)`:`none`},children:(0,l.jsx)(a,{site:t})}),(0,l.jsxs)(`div`,{style:f,children:[(0,l.jsxs)(`div`,{style:p,children:[(0,l.jsxs)(`span`,{children:[(0,l.jsx)(`span`,{style:{color:t.brand},children:t.name.lead}),t.name.dot?(0,l.jsx)(`span`,{style:{color:`#8a96a3`},children:`.`}):null,(0,l.jsx)(`span`,{style:{color:t.brandAlt},children:t.name.alt})]}),r?(0,l.jsx)(`span`,{style:{...m,color:t.brandAlt},children:`you are here`}):null]}),(0,l.jsx)(`div`,{style:h,children:t.tagline})]})]}),y={...u,background:s(t,r,_),borderColor:c(t,r,_),transform:_?`translateY(-1px)`:`none`,cursor:r?`default`:`pointer`};return r?(0,l.jsx)(`div`,{style:y,children:v}):(0,l.jsx)(`a`,{style:y,href:n(t),target:g?`_blank`:void 0,rel:g?`noreferrer`:void 0,onMouseEnter:()=>o?.(t.id),onMouseLeave:()=>o?.(null),onFocus:()=>o?.(t.id),onBlur:()=>o?.(null),children:v})}function s(e,t,n){return t?`#f5f7fa`:n?`color-mix(in oklab, ${e.brand} 9%, white)`:`transparent`}function c(e,t,n){return t?`#dfe3e8`:n?`color-mix(in oklab, ${e.brand} 32%, white)`:`transparent`}var l,u,d,f,p,m,h;function g(){return(g=e((()=>{r(),i(),l=t(),u={display:`flex`,alignItems:`center`,padding:`7px 8px`,border:`1px solid transparent`,borderRadius:10,color:`#16202c`,gap:10,textDecoration:`none`,transition:`background 120ms, border-color 120ms, transform 120ms`},d={display:`flex`,transition:`transform 160ms`},f={minWidth:0},p={display:`flex`,alignItems:`baseline`,fontSize:`0.9375rem`,fontWeight:700,letterSpacing:`-0.01em`,gap:6,whiteSpace:`nowrap`},m={fontSize:`0.625rem`,fontWeight:700,letterSpacing:`0.04em`,textTransform:`uppercase`},h={color:`#5b6875`,fontSize:`0.75rem`,lineHeight:1.35},o.__docgenInfo={description:`One site: its mark, its name in its own colours, and what it does. The name
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
| 'polycarp'
| '3d'
| 'pt'`,elements:[{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'pt'`}]},{name:`null`}]},name:`id`}],return:{name:`void`}}},description:`Told which site the pointer moved onto, or null when it left.
@default undefined`},newTab:{required:!1,tsType:{name:`boolean`},description:`Whether the link opens a tab of its own. A menu the visitor opened on
purpose does; a footer does not.
@default false`}}}})))()}export{g as n,o as t};