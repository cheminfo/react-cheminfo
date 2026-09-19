import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,o as n,r,s as i}from"./lookup-A54Q-qDE.js";import{h as a,n as o}from"./iframe-t3BKuE7o.js";import{n as s,r as c}from"./familyTokens-DsQXXJV4.js";import{n as l,t as u}from"./nameColors-BYPKGqj-.js";import{n as d,t as f}from"./marks-DKsW6zBZ.js";function p(e){let{group:t,children:n}=e,r=`${(0,m.useId)()}ecosystem-${t.id}`;return(0,h.jsxs)(`section`,{style:g,"aria-labelledby":r,children:[(0,h.jsx)(`h3`,{id:r,style:_,children:t.label}),(0,h.jsx)(`p`,{style:v,children:t.blurb}),(0,h.jsx)(`div`,{style:y,children:n})]})}var m,h,g,_,v,y;function b(){return(b=e((()=>{m=a(),c(),h=o(),g={paddingTop:12,borderTop:`1px solid ${s.border}`,marginBottom:16},_={margin:0,color:s.text,fontSize:`0.6875rem`,fontWeight:700,letterSpacing:`0.07em`,textTransform:`uppercase`},v={margin:`2px 0 8px`,color:s.textFaint,fontSize:`0.72rem`,lineHeight:1.4},y={display:`flex`,flexDirection:`column`,gap:2},p.__docgenInfo={description:`One topic of the family: its heading, the line saying who it is for, and the
sites under it.
The heading id is unique to each render, because the footer and the open
Tools menu write the same topics into one document.
@param props - The topic, and its sites.
@returns The section.`,methods:[],displayName:`SiteGroupSection`,props:{group:{required:!0,tsType:{name:`SiteGroup`},description:`The topic being headed.`},children:{required:!0,tsType:{name:`ReactNode`},description:`The sites written under it.`}}}})))()}function x(e){let{className:t,site:n,isCurrent:r,isHovered:a=!1,onHover:o,newTab:s=!1}=e,c=a&&!r,u=l(n),d=(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(`div`,{style:{...E,transform:c?`scale(1.08) rotate(-6deg)`:`none`},children:(0,w.jsx)(f,{site:n})}),(0,w.jsxs)(`div`,{style:D,children:[(0,w.jsxs)(`div`,{style:O,children:[(0,w.jsxs)(`span`,{children:[(0,w.jsx)(`span`,{style:{color:u.lead},children:n.name.lead}),n.name.dot?(0,w.jsx)(`span`,{style:{color:u.dot},children:`.`}):null,(0,w.jsx)(`span`,{style:{color:u.alt},children:n.name.alt})]}),r?(0,w.jsx)(`span`,{style:{...k,color:n.brandAlt},children:`you are here`}):null]}),(0,w.jsx)(`div`,{style:A,children:n.tagline})]})]}),p={...T,background:S(n,r,c),borderColor:C(n,r,c),transform:c?`translateY(-1px)`:`none`,cursor:r?`default`:`pointer`};return r?(0,w.jsx)(`div`,{style:p,children:d}):(0,w.jsx)(`a`,{className:t,style:p,href:i(n),target:s?`_blank`:void 0,rel:s?`noreferrer`:void 0,onMouseEnter:()=>o?.(n.id),onMouseLeave:()=>o?.(null),onFocus:()=>o?.(n.id),onBlur:()=>o?.(null),children:d})}function S(e,t,n){return t?s.surfaceSunken:n?`color-mix(in oklab, ${e.brand} 9%, white)`:`transparent`}function C(e,t,n){return t?s.border:n?`color-mix(in oklab, ${e.brand} 32%, white)`:`transparent`}var w,T,E,D,O,k,A;function j(){return(j=e((()=>{c(),u(),n(),d(),w=o(),T={display:`flex`,alignItems:`flex-start`,padding:`7px 8px`,border:`1px solid transparent`,borderRadius:10,color:s.text,gap:10,textDecoration:`none`,transition:`background 120ms, border-color 120ms, transform 120ms`},E={display:`flex`,marginTop:1,transition:`transform 160ms`},D={minWidth:0},O={display:`flex`,alignItems:`baseline`,fontSize:`0.9375rem`,fontWeight:700,letterSpacing:`-0.01em`,gap:6,whiteSpace:`nowrap`},k={fontSize:`0.625rem`,fontWeight:700,letterSpacing:`0.04em`,textTransform:`uppercase`},A={color:s.textMuted,fontSize:`0.75rem`,lineHeight:1.35},x.__docgenInfo={description:`One site: its mark, its name in its own colours, and what it does. The name
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
| 'osiris'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`}]},{name:`null`}]},name:`id`}],return:{name:`void`}}},description:`Told which site the pointer moved onto, or null when it left.
@default undefined`},newTab:{required:!1,tsType:{name:`boolean`},description:`Whether the link opens a tab of its own. A menu the visitor opened on
purpose does; a footer does not.
@default false`},className:{required:!1,tsType:{name:`string`},description:`Class names added to the root element.
@default undefined`}}}})))()}function M(e){let{currentSiteId:n,lit:r=!1,newTab:i=!1}=e,[a,o]=(0,N.useState)(null);return(0,P.jsx)(`div`,{style:F,children:t().map(({group:e,sites:t})=>(0,P.jsx)(p,{group:e,children:t.map(e=>(0,P.jsx)(x,{site:e,isCurrent:e.id===n,isHovered:r&&a===e.id,onHover:r?o:void 0,newTab:i},e.id))},e.id))})}var N,P,F;function I(){return(I=e((()=>{N=a(),r(),b(),j(),P=o(),F={display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(17rem, 1fr))`,alignItems:`start`,gap:`4px 28px`},M.__docgenInfo={description:`Every site of the family as a tile, gathered under its topic, in the columns
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
| 'osiris'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`}]},description:`The site the visitor is already on, which is written but never linked.
@default undefined`},lit:{required:!1,tsType:{name:`boolean`},description:`Whether a tile lights up in its own colour under the pointer, which a menu
the visitor opened on purpose does and a footer does not.
@default false`},newTab:{required:!1,tsType:{name:`boolean`},description:`Whether each link opens a tab of its own.
@default false`}}}})))()}var L;function R(){return(R=e((()=>{c(),L={margin:0,color:s.textMuted,fontSize:`0.75rem`,fontWeight:600}})))()}export{I as i,R as n,M as r,L as t};