import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,o as n,r,s as i}from"./lookup-DaL5dO87.js";import{h as a,n as o}from"./iframe-C_0-xZ4H.js";import{i as s,n as c,r as l,t as u}from"./useT-DdDrCs00.js";import{n as d,r as f}from"./familyTokens-DsQXXJV4.js";import{n as p,t as m}from"./nameColors-BYPKGqj-.js";import{n as h,t as g}from"./marks-B8lRDT-I.js";function _(e){let{group:t,children:n}=e,r=c(),i=`${(0,v.useId)()}ecosystem-${t.id}`;return(0,y.jsxs)(`section`,{style:b,"aria-labelledby":i,children:[(0,y.jsx)(`h3`,{id:i,style:x,children:r.or(`ecosystem.group.${t.id}.label`,t.label)}),(0,y.jsx)(`p`,{style:S,children:r.or(`ecosystem.group.${t.id}.blurb`,t.blurb)}),(0,y.jsx)(`div`,{style:C,children:n})]})}var v,y,b,x,S,C;function w(){return(w=e((()=>{v=a(),u(),f(),y=o(),b={paddingTop:12,borderTop:`1px solid ${d.border}`,marginBottom:16},x={margin:0,color:d.text,fontSize:`0.6875rem`,fontWeight:700,letterSpacing:`0.07em`,textTransform:`uppercase`},S={margin:`2px 0 8px`,color:d.textFaint,fontSize:`0.72rem`,lineHeight:1.4},C={display:`flex`,flexDirection:`column`,gap:2},_.__docgenInfo={description:`One topic of the family: its heading, the line saying who it is for, and the
sites under it.
The heading id is unique to each render, because the footer and the open
Tools menu write the same topics into one document.
@param props - The topic, and its sites.
@returns The section.`,methods:[],displayName:`SiteGroupSection`,props:{group:{required:!0,tsType:{name:`SiteGroup`},description:`The topic being headed.`},children:{required:!0,tsType:{name:`ReactNode`},description:`The sites written under it.`}}}})))()}function T(e){let t=s(),{className:n,site:r,isCurrent:a,isHovered:o=!1,onHover:l,newTab:u=!1}=e,d=c(),f=o&&!a,m=p(r),h=(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`div`,{style:{...A,transform:f?`scale(1.08) rotate(-6deg)`:`none`},children:(0,O.jsx)(g,{site:r})}),(0,O.jsxs)(`div`,{style:j,children:[(0,O.jsxs)(`div`,{style:M,children:[(0,O.jsxs)(`span`,{children:[(0,O.jsx)(`span`,{style:{color:m.lead},children:r.name.lead}),r.name.dot?(0,O.jsx)(`span`,{style:{color:m.dot},children:`.`}):null,(0,O.jsx)(`span`,{style:{color:m.alt},children:r.name.alt})]}),a?(0,O.jsx)(`span`,{style:{...N,color:r.brandAlt},children:d(`ecosystem.youAreHere`)}):null]}),(0,O.jsx)(`div`,{style:P,children:d.or(`site.${r.id}.tagline`,r.tagline)})]})]}),_={...k,background:E(r,a,f),borderColor:D(r,a,f),transform:f?`translateY(-1px)`:`none`,cursor:a?`default`:`pointer`};return a?(0,O.jsx)(`div`,{style:_,children:h}):(0,O.jsx)(`a`,{className:n,style:_,href:i(r,{language:t}),target:u?`_blank`:void 0,rel:u?`noreferrer`:void 0,onMouseEnter:()=>l?.(r.id),onMouseLeave:()=>l?.(null),onFocus:()=>l?.(r.id),onBlur:()=>l?.(null),children:h})}function E(e,t,n){return t?d.surfaceSunken:n?`color-mix(in oklab, ${e.brand} 9%, white)`:`transparent`}function D(e,t,n){return t?d.border:n?`color-mix(in oklab, ${e.brand} 32%, white)`:`transparent`}var O,k,A,j,M,N,P;function F(){return(F=e((()=>{u(),l(),f(),m(),n(),h(),O=o(),k={display:`flex`,alignItems:`flex-start`,padding:`7px 8px`,border:`1px solid transparent`,borderRadius:10,color:d.text,gap:10,textDecoration:`none`,transition:`background 120ms, border-color 120ms, transform 120ms`},A={display:`flex`,marginTop:1,transition:`transform 160ms`},j={minWidth:0},M={display:`flex`,alignItems:`baseline`,fontSize:`0.9375rem`,fontWeight:700,letterSpacing:`-0.01em`,gap:6,whiteSpace:`nowrap`},N={fontSize:`0.625rem`,fontWeight:700,letterSpacing:`0.04em`,textTransform:`uppercase`},P={color:d.textMuted,fontSize:`0.75rem`,lineHeight:1.35},T.__docgenInfo={description:`One site: its mark, its name in its own colours, and what it does. The name
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
@default undefined`}}}})))()}function I(e){let{currentSiteId:n,lit:r=!1,newTab:i=!1}=e,[a,o]=(0,L.useState)(null);return(0,R.jsx)(`div`,{style:z,children:t().map(({group:e,sites:t})=>(0,R.jsx)(_,{group:e,children:t.map(e=>(0,R.jsx)(T,{site:e,isCurrent:e.id===n,isHovered:r&&a===e.id,onHover:r?o:void 0,newTab:i},e.id))},e.id))})}var L,R,z;function B(){return(B=e((()=>{L=a(),r(),w(),F(),R=o(),z={display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(17rem, 1fr))`,alignItems:`start`,gap:`4px 28px`},I.__docgenInfo={description:`Every site of the family as a tile, gathered under its topic, in the columns
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
@default false`}}}})))()}var V;function H(){return(H=e((()=>{f(),V={margin:0,color:d.textMuted,fontSize:`0.75rem`,fontWeight:600}})))()}export{B as i,H as n,I as r,V as t};