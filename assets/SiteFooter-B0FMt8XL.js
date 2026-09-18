import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,o as n,r,s as i}from"./lookup-A54Q-qDE.js";import{n as a}from"./iframe-X62GV0XO.js";import{n as o}from"./joinClassNames-BbK_6p9Z.js";import{n as s,r as c}from"./familyTokens-DsQXXJV4.js";import{i as l,n as u,r as d,t as f}from"./ecosystemStyles-DTdfi8yS.js";function p(e){let{className:n,currentSiteId:r,heading:a=`Our other tools`,layout:s=`grid`}=e;return(0,m.jsxs)(`nav`,{className:o(`ecosystem-links`,n),style:h,"aria-label":a,children:[(0,m.jsx)(`h2`,{style:f,children:a}),s===`grid`?(0,m.jsx)(d,{currentSiteId:r}):(0,m.jsx)(`div`,{style:g,children:t().map(({group:e,sites:t})=>(0,m.jsxs)(`div`,{style:_,children:[(0,m.jsx)(`span`,{style:v,children:e.label}),t.map(e=>e.id===r?(0,m.jsx)(`span`,{style:b,children:e.host},e.id):(0,m.jsx)(`a`,{style:{...y,color:e.brand},href:i(e),children:e.host},e.id))]},e.id))})]})}var m,h,g,_,v,y,b;function x(){return(x=e((()=>{c(),r(),n(),l(),u(),m=a(),h={display:`flex`,flexDirection:`column`,gap:8},g={display:`flex`,flexDirection:`column`,gap:6},_={display:`flex`,flexWrap:`wrap`,alignItems:`baseline`,gap:`0.3rem 0.85rem`},v={color:s.textFaint,fontSize:`0.6875rem`,fontWeight:700,letterSpacing:`0.06em`,textTransform:`uppercase`},y={fontSize:`0.8125rem`,fontWeight:600,textDecoration:`none`,whiteSpace:`nowrap`},b={...y,color:s.textFaint,cursor:`default`},p.__docgenInfo={description:`Every site of the family as a plain link, gathered under its topic, for the
footer of a site. It is what lets a crawler — and a visitor with no patience
for menus — walk from one of our tools to the next, so it is rendered on
every page rather than behind a button.
@param props - The site it sits on, what introduces the section, and how much
of each site is written.
@returns The section of links.`,methods:[],displayName:`EcosystemLinks`,props:{currentSiteId:{required:!1,tsType:{name:`union`,raw:`| 'learn'
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
@default undefined`},heading:{required:!1,tsType:{name:`string`},description:`What introduces the section.
@default 'Our other tools'`},layout:{required:!1,tsType:{name:`union`,raw:`'grid' | 'row'`,elements:[{name:`literal`,value:`'grid'`},{name:`literal`,value:`'row'`}]},description:`How much of each site is written. \`grid\` gives every site its mark, its
name and the line saying what it does — which is what a crawler reads to
know what it is following, so it is the default. \`row\` writes one line per
topic, the names only, for a footer with no room.
@default 'grid'`},className:{required:!1,tsType:{name:`string`},description:`Class names added to the root element, after the component's own.
@default undefined`}}}})))()}function S(e){let{siteId:t,layout:n=`grid`,heading:r,embedded:i=!1,children:a,width:o=`page`}=e;return i?null:(0,C.jsx)(`footer`,{className:`app-footer no-print`,children:(0,C.jsxs)(`div`,{className:w[o],children:[(0,C.jsx)(p,{currentSiteId:t,layout:n,heading:r}),a]})})}var C,w;function T(){return(T=e((()=>{x(),C=a(),w={page:`app-footer__inner`,full:`app-footer__inner app-footer__inner--full`},S.__docgenInfo={description:`The strip under every page of the family: each sibling site as a plain link,
so a crawler — and a reader with no patience for menus — walks from one of
our tools to the next. It carries \`no-print\`, because it is chrome.
@param props - The site it sits on, how much of each sibling is written, and
whatever the site adds below.
@returns The footer, or nothing at all on an embedded page.`,methods:[],displayName:`SiteFooter`,props:{siteId:{required:!0,tsType:{name:`union`,raw:`| 'learn'
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
| 'osiris'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`}]},description:`The site the footer sits on, which is written but never linked.`},layout:{required:!1,tsType:{name:`union`,raw:`'grid' | 'row'`,elements:[{name:`literal`,value:`'grid'`},{name:`literal`,value:`'row'`}]},description:"How much of each sibling site is written. `grid` gives every one its mark,\nits name and the line saying what it does; `row` writes the names only.\n@default 'grid'"},heading:{required:!1,tsType:{name:`string`},description:`What introduces the family.
@default undefined`},embedded:{required:!1,tsType:{name:`boolean`},description:`Whether the page is framed in another site, in which case no footer is
drawn at all.
@default false`},children:{required:!1,tsType:{name:`ReactNode`},description:`What the site adds under the family — a licence line, a version, a link to
the sources.
@default undefined`},width:{required:!1,tsType:{name:`union`,raw:`'page' | 'full'`,elements:[{name:`literal`,value:`'page'`},{name:`literal`,value:`'full'`}]},description:"How wide the footer's contents run, read exactly as `SiteHeader`'s: `page`\ncaps them at `--page-max`, `full` runs them to both edges. A site sets the\ntwo alike, or its chrome is capped at one end of the page and not at the\nother.\n@default 'page'"}}}})))()}export{T as n,S as t};