import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-PyJ4qDGk.js";import{a as n,i as r,r as i}from"./lookup-BebdeTGz.js";import{n as a,t as o}from"./SiteTile-DwesysTh.js";function s(e){let{currentSiteId:t,heading:r=`Our other tools`,layout:a=`grid`}=e;return(0,c.jsxs)(`nav`,{className:`ecosystem-links`,style:l,"aria-label":r,children:[(0,c.jsx)(`h2`,{style:u,children:r}),a===`grid`?(0,c.jsx)(`div`,{style:d,children:i.map(e=>(0,c.jsx)(o,{site:e,isCurrent:e.id===t},e.id))}):(0,c.jsx)(`div`,{style:f,children:i.map(e=>e.id===t?(0,c.jsx)(`span`,{style:m,children:e.host},e.id):(0,c.jsx)(`a`,{style:{...p,color:e.brand},href:n(e),children:e.host},e.id))})]})}var c,l,u,d,f,p,m;function h(){return(h=e((()=>{r(),a(),c=t(),l={display:`flex`,flexDirection:`column`,gap:8},u={margin:0,color:`#5b6875`,fontSize:`0.75rem`,fontWeight:600},d={display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(15rem, 1fr))`,gap:2},f={display:`flex`,flexWrap:`wrap`,alignItems:`baseline`,gap:`0.35rem 0.9rem`},p={fontSize:`0.8125rem`,fontWeight:600,textDecoration:`none`,whiteSpace:`nowrap`},m={...p,color:`#8a96a3`,cursor:`default`},s.__docgenInfo={description:`Every site of the family as a plain link, for the footer of a site. It is
what lets a crawler — and a visitor with no patience for menus — walk from
one of our tools to the next, so it is rendered on every page rather than
behind a button.
@param props - The site it sits on, what introduces the section, and how much
of each site is written.
@returns The section of links.`,methods:[],displayName:`EcosystemLinks`,props:{currentSiteId:{required:!1,tsType:{name:`union`,raw:`| 'inchi'
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
| 'pt'`,elements:[{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'pt'`}]},description:`The site the visitor is already on, which is written but never linked.
@default undefined`},heading:{required:!1,tsType:{name:`string`},description:`What introduces the section.
@default 'Our other tools'`},layout:{required:!1,tsType:{name:`union`,raw:`'grid' | 'row'`,elements:[{name:`literal`,value:`'grid'`},{name:`literal`,value:`'row'`}]},description:`How much of each site is written. \`grid\` gives every site its mark, its
name and the line saying what it does — which is what a crawler reads to
know what it is following, so it is the default. \`row\` writes the names
only, for a footer with no room.
@default 'grid'`}}}})))()}function g(e){let{siteId:t,layout:n=`grid`,heading:r,embedded:i=!1,children:a}=e;return i?null:(0,_.jsx)(`footer`,{className:`app-footer no-print`,children:(0,_.jsxs)(`div`,{className:`app-footer__inner`,children:[(0,_.jsx)(s,{currentSiteId:t,layout:n,heading:r}),a]})})}var _;function v(){return(v=e((()=>{h(),_=t(),g.__docgenInfo={description:`The strip under every page of the family: each sibling site as a plain link,
so a crawler — and a reader with no patience for menus — walks from one of
our tools to the next. It carries \`no-print\`, because it is chrome.
@param props - The site it sits on, how much of each sibling is written, and
whatever the site adds below.
@returns The footer, or nothing at all on an embedded page.`,methods:[],displayName:`SiteFooter`,props:{siteId:{required:!0,tsType:{name:`union`,raw:`| 'inchi'
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
| 'pt'`,elements:[{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'pt'`}]},description:`The site the footer sits on, which is written but never linked.`},layout:{required:!1,tsType:{name:`union`,raw:`'grid' | 'row'`,elements:[{name:`literal`,value:`'grid'`},{name:`literal`,value:`'row'`}]},description:"How much of each sibling site is written. `grid` gives every one its mark,\nits name and the line saying what it does; `row` writes the names only.\n@default 'grid'"},heading:{required:!1,tsType:{name:`string`},description:`What introduces the family.
@default undefined`},embedded:{required:!1,tsType:{name:`boolean`},description:`Whether the page is framed in another site, in which case no footer is
drawn at all.
@default false`},children:{required:!1,tsType:{name:`ReactNode`},description:`What the site adds under the family — a licence line, a version, a link to
the sources.
@default undefined`}}}})))()}export{v as n,g as t};