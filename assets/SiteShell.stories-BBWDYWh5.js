import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{a as t,i as n}from"./languageParam-dyZ4WZE3.js";import{h as r,n as i}from"./iframe-aRVavQD_.js";import{c as a,l as o,n as s,s as c,t as l}from"./useT-BORbKjvp.js";import{n as u}from"./joinClassNames-BbK_6p9Z.js";import{i as d,n as f,t as p}from"./config-C-JlIZ9m.js";import{n as m,t as ee}from"./AboutPage-OsWeOxYY.js";import{n as h,r as g}from"./platformPaper-5Q6ipIYj.js";import{n as _,t as v}from"./CiteButton-B3C0ylQr.js";import{n as te,t as ne}from"./SiteTheme-DOIzE1b8.js";import{n as re,t as y}from"./NavLink-CpSkUBO1.js";import{i as b,r as x}from"./EcosystemMenu-DrXpOwmS.js";import{n as S,t as C}from"./EcosystemButton-K3IWrDYJ.js";import{n as w,t as ie}from"./HiddenPartsProvider-1CeHB5Jv.js";import{n as T,t as E}from"./ShareControl-CBB01_XB.js";import{n as ae,t as oe}from"./SiteFooter-BVGSJAJe.js";import{i as se,n as ce,r as le,t as ue}from"./useCompactHeader-B2EAqWZl.js";function D(e){let t=O(),n=e.legacyAddress(t),r=e.languageAddress?.(n??t)??n;if(r===null)return e.parse(t);let i=a();return i?.replaceState(i.state,``,r),globalThis.dispatchEvent?.(new Event(k)),e.parse(r)}function de(e,t,n={}){let r=O(),i=pe(e,t,r,n.keep??[]),s=o(),c=a();if(s===void 0||c===void 0||(e.mode===`hash`?s.hash:`${s.pathname}${s.search}`)===i)return i;let l=n.history??`auto`,u=e.parse(r),d=e.parse(i),f=u.tab===d.tab&&u.language===d.language;return l===`replace`||l===`auto`&&f?c.replaceState(c.state,``,i):c.pushState(null,``,i),globalThis.dispatchEvent?.(new Event(k)),i}function fe(e,t){function n(){t(D(e))}return globalThis.addEventListener?.(`popstate`,n),globalThis.addEventListener?.(k,n),()=>{globalThis.removeEventListener?.(`popstate`,n),globalThis.removeEventListener?.(k,n)}}function O(){let e=o();return e===void 0?`/`:`${e.pathname}${e.search}${e.hash}`}function pe(e,t,r,i){let a=e.parse(r),o=t.language??a.language,s=e.format(o===void 0?t:{...t,language:o}),c=t.params??{},l=a.params,u=[];for(let e of new Set([p,f,...i])){if(Object.hasOwn(c,e))continue;let t=l[e];t!==void 0&&u.push([e,t])}return u.length===0?s:`${s}${s.includes(`?`)?`&`:`?`}${n(u)}`}var k;function A(){return(A=e((()=>{d(),c(),t(),k=`cheminfo:routechange`})))()}function me(e){let t=(0,j.useCallback)(t=>fe(e,t),[e]),n=(0,j.useSyncExternalStore)(t,O,O);return(0,j.useEffect)(()=>{D(e)},[e]),(0,j.useMemo)(()=>e.parse(n),[e,n])}var j;function M(){return(M=e((()=>{j=r(),A()})))()}function N(e){let{href:t,active:n=!1,onSelect:r,label:i,title:a,id:o=`about`,className:c}=e,l=s();return(0,P.jsx)(y,{item:{id:o,label:i??l(`chrome.about`),icon:`info-sign`,href:t,title:a??l(`chrome.aboutTitle`),onSelect:r},active:n,className:c})}var P;function F(){return(F=e((()=>{l(),re(),P=i(),N.__docgenInfo={description:`The About entry, which leads the utilities on every site of the family: a
real address rather than a dialog, so the page is indexed, linkable and
printable.

The glyph is \`info-sign\` on every site, and is not a site's to choose. It is
what the entry keeps once a narrow bar drops the labels, and the site's own
mark already stands at the other end of the same bar — drawn twice, nothing
in the row says which one is the site and which one is about it.
@param props - Where the About is, whether it is on show, and how the site
opens it.
@returns The entry.`,methods:[],displayName:`AboutButton`,props:{href:{required:!0,tsType:{name:`string`},description:`The site's About address, which the entry opens. It is written rather than
assumed, because a deployment may sit under a mount path and a translated
site under a language prefix.`},active:{required:!1,tsType:{name:`boolean`},description:`Whether the About is the page on show, which is what the brand tint is
spent on.
@default false`},onSelect:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`What the site does when the entry is picked, for a page that routes in
place. A modified click is left to the browser.
@default undefined`},label:{required:!1,tsType:{name:`string`},description:`What the entry reads. In a compact bar it is not written, but it stays what
the pointer and a screen reader are told.
@default the chrome's own word for it, in the language of the page`},title:{required:!1,tsType:{name:`string`},description:`What the pointer is told.
@default the chrome's own sentence, in the language of the page`},id:{required:!1,tsType:{name:`string`},description:`What the active entry is named by, for a site whose router spells its
addresses rather than its tabs.
@default 'about'`},className:{required:!1,tsType:{name:`string`},description:`Class names added after the component's own.
@default undefined`}}}})))()}function I(e){let{siteId:t,site:n,mark:r,markSize:i,nav:a,activeId:o,homeHref:s,onHome:c,renderNavItem:l,navPart:d=`tabs`,width:f=`page`,fit:p=!1,embedded:m=!1,hidden:h,about:g=!1,contact:_,belowHeader:v,mainClassName:te,mainTestId:re,mainElement:y=`main`,footer:b={},account:x,children:S}=e,C=ce(),w=b===!1?void 0:b.siteId??t,T=g!==!1&&g.active===!0,E=(0,z.jsxs)(z.Fragment,{children:[t===void 0?(0,z.jsx)(ne,{site:n}):(0,z.jsx)(ne,{siteId:t}),(0,z.jsxs)(`div`,{className:u(`site-shell`,p===!1?void 0:`site-shell--fit`),children:[(0,z.jsx)(le,{siteId:t,site:n,mark:r,markSize:i,embedded:m,width:f,nav:h?.includes(d)?[]:a,activeId:T?g.id??`about`:o,homeHref:s,onHome:c,renderNavItem:l,contact:_,actions:(0,z.jsx)(he,{...e,compact:C}),share:(0,z.jsx)(ge,{...e,compact:C}),account:x}),m?null:v,(0,z.jsx)(y,{className:u(`site-shell__main`,f===`full`?`site-shell__main--full`:void 0,p===!1?void 0:`site-shell__main--fit`,p===`row`?`site-shell__main--fit-row`:void 0,m?`site-shell__main--embedded`:void 0,te),"data-testid":re,children:T&&g.routed!==!0?g.page??(0,z.jsx)(ee,{content:g.content}):S})]}),b===!1||w===void 0?null:(0,z.jsxs)(oe,{siteId:w,embedded:m,width:f,heading:b.heading,layout:b.layout,children:[b.note===void 0?null:(0,z.jsx)(`p`,{className:`app-footer__note`,children:b.note}),b.children]})]});return h===void 0?E:(0,z.jsx)(ie,{hidden:h,children:E})}function he(e){let{siteId:t,site:n,about:r=!1,cite:i,ecosystem:a=!0,actionsBeforeAbout:o,actionsAfterAbout:s,actionsAfterCite:c,actions:l,language:u,compact:d}=e,f=i??(r===!1?[]:r.content.cite??[]);return(0,z.jsxs)(z.Fragment,{children:[L(o,d),r===!1?null:(0,z.jsx)(N,{id:r.id,href:r.href??`/about`,active:r.active,onSelect:r.onSelect,label:r.label,title:r.title}),L(s,d),f===!1||f.length===0?null:(0,z.jsx)(v,{works:f,compact:d}),L(c,d),a?(0,z.jsx)(C,{currentSiteId:t,atHome:b(n?.host),compact:d}):null,L(l,d),L(u,d)]})}function ge(e){let{share:t,siteId:n,compact:r}=e;return t===void 0?null:(0,R.isValidElement)(t)?t:(0,z.jsx)(E,{siteId:n,compact:r,...t})}function L(e,t){return typeof e==`function`?e(t):e}var R,z;function B(){return(B=e((()=>{R=r(),m(),F(),ae(),se(),ue(),_(),x(),S(),te(),w(),T(),z=i(),I.__docgenInfo={description:`Draw the shell.
@param props - The shell's props, the route already read.
@returns The page in its chrome.`,methods:[],displayName:`ShellFrame`,props:{siteId:{required:!1,tsType:{name:`union`,raw:`| 'learn'
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
| 'electrochemistry'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'iupac-name'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'isomers'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'spectroscopy'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'molecules'`},{name:`literal`,value:`'fair'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`},{name:`literal`,value:`'slides'`},{name:`literal`,value:`'chembio'`},{name:`literal`,value:`'wikidata'`},{name:`literal`,value:`'mz'`},{name:`literal`,value:`'plot'`},{name:`literal`,value:`'ml'`},{name:`literal`,value:`'vibrations'`},{name:`literal`,value:`'uv-vis'`},{name:`literal`,value:`'xps'`},{name:`literal`,value:`'cell'`},{name:`literal`,value:`'diagram'`},{name:`literal`,value:`'peptide'`},{name:`literal`,value:`'optics'`},{name:`literal`,value:`'circuits'`},{name:`literal`,value:`'mechanics'`},{name:`literal`,value:`'draw'`},{name:`literal`,value:`'plate'`},{name:`literal`,value:`'glassware'`},{name:`literal`,value:`'write'`},{name:`literal`,value:`'nmr'`},{name:`literal`,value:`'electrochemistry'`}]},description:"The site, named. One of `site` and `siteId` is required.\n@default undefined"},site:{required:!1,tsType:{name:`SiteRecord`},description:`The site, passed rather than named, for one outside the family's registry.
@default undefined`},mark:{required:!1,tsType:{name:`ReactNode`},description:`The site's own mark, for a site the shared glyphs do not hold.
@default the family's mark for the site`},markSize:{required:!1,tsType:{name:`number`},description:`Edge of the mark, in pixels.
@default 28`},router:{required:!1,tsType:{name:`TabRouter`,elements:[{name:`Tab`}],raw:`TabRouter<Tab>`},description:`The site's router. With it the shell follows the address itself: the
page on show is the tab it names, and the About tab is served as the About
page.
@default undefined — the page says which entry is active`},aboutTab:{required:!1,tsType:{name:`Tab`},description:`The tab the About is served at.
@default 'about'`},nav:{required:!0,tsType:{name:`unknown`},description:`The pages, in the order the bar lists them; About is not one of them.`},activeId:{required:!1,tsType:{name:`string`},description:`Which of the pages is on show.
@default the router's tab, or none without a router`},homeHref:{required:!1,tsType:{name:`string`},description:`Where the brand leads.
@default '/'`},onHome:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`What the site does when the brand is picked.
@default undefined`},renderNavItem:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(item: NavItem, isActive: boolean) => ReactNode`,signature:{arguments:[{type:{name:`NavItem`},name:`item`},{type:{name:`boolean`},name:`isActive`}],return:{name:`ReactNode`}}},description:`Draws one page the site's own way.
@default undefined`},navPart:{required:!1,tsType:{name:`string`},description:`The part a link hides the pages with; the bar then lists none.
@default 'tabs'`},width:{required:!1,tsType:{name:`union`,raw:`'page' | 'full'`,elements:[{name:`literal`,value:`'page'`},{name:`literal`,value:`'full'`}]},description:`How wide the bar, the page and the footer run, all three alike.
@default 'page'`},fit:{required:!1,tsType:{name:`union`,raw:`boolean | 'row'`,elements:[{name:`boolean`},{name:`literal`,value:`'row'`}]},description:`Whether the bar and the page fill the window, the page scrolling inside
itself — a workbench — rather than growing and scrolling the window. The
page is then a flex column, or a flex row with \`'row'\`, for a tool whose
panes sit straight in it. The footer, outside the shell, stays below the
fold either way.
@default false`},embedded:{required:!1,tsType:{name:`boolean`},description:`Whether the page is framed in another site: no bar, no footer, and the
frame as the margin.
@default false`},hidden:{required:!1,tsType:{name:`unknown`},description:"The parts the link switches off, provided to every `PagePart` below.\n@default undefined — no provider; the page brings its own"},about:{required:!1,tsType:{name:`union`,raw:`ShellAbout | false`,elements:[{name:`ShellAbout`},{name:`literal`,value:`false`}]},description:"The About entry and page; `false` leaves both out.\n@default false"},cite:{required:!1,tsType:{name:`union`,raw:`readonly CitedWork[] | false`,elements:[{name:`unknown`},{name:`literal`,value:`false`}]},description:"The works the Cite button offers; `false` leaves it out.\n@default the About's works, and no button when it has none"},ecosystem:{required:!1,tsType:{name:`boolean`},description:`Whether the Tools menu of the family is in the bar.
@default true`},actionsBeforeAbout:{required:!1,tsType:{name:`union`,raw:`ReactNode | ((compact: boolean) => ReactNode)`,elements:[{name:`ReactNode`},{name:`unknown`}]},description:`Entries before About — the help of a tool whose keys nobody guesses.
@default undefined`},actionsAfterAbout:{required:!1,tsType:{name:`union`,raw:`ReactNode | ((compact: boolean) => ReactNode)`,elements:[{name:`ReactNode`},{name:`unknown`}]},description:`Entries between About and Cite — an API link, a version.
@default undefined`},actionsAfterCite:{required:!1,tsType:{name:`union`,raw:`ReactNode | ((compact: boolean) => ReactNode)`,elements:[{name:`ReactNode`},{name:`unknown`}]},description:`Entries between Cite and Tools — a feedback form, a specification.
@default undefined`},actions:{required:!1,tsType:{name:`union`,raw:`ReactNode | ((compact: boolean) => ReactNode)`,elements:[{name:`ReactNode`},{name:`unknown`}]},description:`Entries after Tools — a unit picker, an admin action.
@default undefined`},language:{required:!1,tsType:{name:`union`,raw:`ReactNode | ((compact: boolean) => ReactNode)`,elements:[{name:`ReactNode`},{name:`unknown`}]},description:`The language switcher, after the site's own entries.
@default undefined`},account:{required:!1,tsType:{name:`ReactNode`},description:`Who is signed in, at the right end.
@default undefined`},share:{required:!1,tsType:{name:`union`,raw:`ShareControlProps<Codecs> | ReactElement`,elements:[{name:`ShareControlProps`,elements:[{name:`Codecs`}],raw:`ShareControlProps<Codecs>`},{name:`ReactElement`}]},description:`The Share entry: what \`ShareControl\` is given, the shell passing it the
site and the compact state, or a control of the site's own.
@default undefined — no Share entry`},contact:{required:!1,tsType:{name:`union`,raw:`string | false`,elements:[{name:`string`},{name:`literal`,value:`false`}]},description:"The contact form of the Contact entry, or `false` to leave it out.\n@default the family's form"},belowHeader:{required:!1,tsType:{name:`ReactNode`},description:`What sits between the bar and the page — a tagline, a banner — dropped
with the bar when the page is framed.
@default undefined`},mainClassName:{required:!1,tsType:{name:`string`},description:`Classes the main area carries beside the shell's own.
@default undefined`},mainTestId:{required:!1,tsType:{name:`string`},description:"`data-testid` of the main area.\n@default undefined"},mainElement:{required:!1,tsType:{name:`union`,raw:`'main' | 'div'`,elements:[{name:`literal`,value:`'main'`},{name:`literal`,value:`'div'`}]},description:"The element the page is drawn in: `div` for a page that brings its own\n`<main>` — an embedded Swagger UI — so the document keeps one landmark.\n@default 'main'"},footer:{required:!1,tsType:{name:`union`,raw:`ShellFooter | false`,elements:[{name:`ShellFooter`},{name:`literal`,value:`false`}]},description:"The strip under the page, or `false` for none on this page.\n@default the family's links alone"},children:{required:!0,tsType:{name:`ReactNode`},description:`The page the address names.`}}}})))()}function V(e){let{router:t}=e;return t===void 0?(0,H.jsx)(I,{...e}):(0,H.jsx)(_e,{...e,router:t})}function _e(e){let{router:t,aboutTab:n=`about`,about:r,activeId:i}=e,a=me(t),o=r===void 0||r===!1?!1:{...r,href:r.href??t.format({tab:n}),active:r.active??a.tab===n,onSelect:r.onSelect??(()=>{de(t,{tab:n})})};return(0,H.jsx)(I,{...e,about:o,activeId:i??a.tab})}var H;function U(){return(U=e((()=>{A(),M(),B(),H=i(),V.__docgenInfo={description:`The chrome every site of the family carries, around its page: the theme,
the bar with About · Cite · Tools · Contact · Share at its right, the page,
and the footer linking every sibling. A framed page gets the page alone.

Everything the bar holds is the shared components, in the family's order; a
site fills the slots between them and never re-orders them. With a router,
the shell also follows the address: it marks the tab on show and serves the
About tab as the shared About page.
@param props - See {@link SiteShellProps}.
@returns The page in its chrome.`,methods:[],displayName:`SiteShell`,props:{siteId:{required:!1,tsType:{name:`union`,raw:`| 'learn'
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
| 'electrochemistry'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'iupac-name'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'isomers'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'spectroscopy'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'molecules'`},{name:`literal`,value:`'fair'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`},{name:`literal`,value:`'slides'`},{name:`literal`,value:`'chembio'`},{name:`literal`,value:`'wikidata'`},{name:`literal`,value:`'mz'`},{name:`literal`,value:`'plot'`},{name:`literal`,value:`'ml'`},{name:`literal`,value:`'vibrations'`},{name:`literal`,value:`'uv-vis'`},{name:`literal`,value:`'xps'`},{name:`literal`,value:`'cell'`},{name:`literal`,value:`'diagram'`},{name:`literal`,value:`'peptide'`},{name:`literal`,value:`'optics'`},{name:`literal`,value:`'circuits'`},{name:`literal`,value:`'mechanics'`},{name:`literal`,value:`'draw'`},{name:`literal`,value:`'plate'`},{name:`literal`,value:`'glassware'`},{name:`literal`,value:`'write'`},{name:`literal`,value:`'nmr'`},{name:`literal`,value:`'electrochemistry'`}]},description:"The site, named. One of `site` and `siteId` is required.\n@default undefined"},site:{required:!1,tsType:{name:`SiteRecord`},description:`The site, passed rather than named, for one outside the family's registry.
@default undefined`},mark:{required:!1,tsType:{name:`ReactNode`},description:`The site's own mark, for a site the shared glyphs do not hold.
@default the family's mark for the site`},markSize:{required:!1,tsType:{name:`number`},description:`Edge of the mark, in pixels.
@default 28`},router:{required:!1,tsType:{name:`TabRouter`,elements:[{name:`Tab`}],raw:`TabRouter<Tab>`},description:`The site's router. With it the shell follows the address itself: the
page on show is the tab it names, and the About tab is served as the About
page.
@default undefined — the page says which entry is active`},aboutTab:{required:!1,tsType:{name:`Tab`},description:`The tab the About is served at.
@default 'about'`},nav:{required:!0,tsType:{name:`unknown`},description:`The pages, in the order the bar lists them; About is not one of them.`},activeId:{required:!1,tsType:{name:`string`},description:`Which of the pages is on show.
@default the router's tab, or none without a router`},homeHref:{required:!1,tsType:{name:`string`},description:`Where the brand leads.
@default '/'`},onHome:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`What the site does when the brand is picked.
@default undefined`},renderNavItem:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(item: NavItem, isActive: boolean) => ReactNode`,signature:{arguments:[{type:{name:`NavItem`},name:`item`},{type:{name:`boolean`},name:`isActive`}],return:{name:`ReactNode`}}},description:`Draws one page the site's own way.
@default undefined`},navPart:{required:!1,tsType:{name:`string`},description:`The part a link hides the pages with; the bar then lists none.
@default 'tabs'`},width:{required:!1,tsType:{name:`union`,raw:`'page' | 'full'`,elements:[{name:`literal`,value:`'page'`},{name:`literal`,value:`'full'`}]},description:`How wide the bar, the page and the footer run, all three alike.
@default 'page'`},fit:{required:!1,tsType:{name:`union`,raw:`boolean | 'row'`,elements:[{name:`boolean`},{name:`literal`,value:`'row'`}]},description:`Whether the bar and the page fill the window, the page scrolling inside
itself — a workbench — rather than growing and scrolling the window. The
page is then a flex column, or a flex row with \`'row'\`, for a tool whose
panes sit straight in it. The footer, outside the shell, stays below the
fold either way.
@default false`},embedded:{required:!1,tsType:{name:`boolean`},description:`Whether the page is framed in another site: no bar, no footer, and the
frame as the margin.
@default false`},hidden:{required:!1,tsType:{name:`unknown`},description:"The parts the link switches off, provided to every `PagePart` below.\n@default undefined — no provider; the page brings its own"},about:{required:!1,tsType:{name:`union`,raw:`ShellAbout | false`,elements:[{name:`ShellAbout`},{name:`literal`,value:`false`}]},description:"The About entry and page; `false` leaves both out.\n@default false"},cite:{required:!1,tsType:{name:`union`,raw:`readonly CitedWork[] | false`,elements:[{name:`unknown`},{name:`literal`,value:`false`}]},description:"The works the Cite button offers; `false` leaves it out.\n@default the About's works, and no button when it has none"},ecosystem:{required:!1,tsType:{name:`boolean`},description:`Whether the Tools menu of the family is in the bar.
@default true`},actionsBeforeAbout:{required:!1,tsType:{name:`union`,raw:`ReactNode | ((compact: boolean) => ReactNode)`,elements:[{name:`ReactNode`},{name:`unknown`}]},description:`Entries before About — the help of a tool whose keys nobody guesses.
@default undefined`},actionsAfterAbout:{required:!1,tsType:{name:`union`,raw:`ReactNode | ((compact: boolean) => ReactNode)`,elements:[{name:`ReactNode`},{name:`unknown`}]},description:`Entries between About and Cite — an API link, a version.
@default undefined`},actionsAfterCite:{required:!1,tsType:{name:`union`,raw:`ReactNode | ((compact: boolean) => ReactNode)`,elements:[{name:`ReactNode`},{name:`unknown`}]},description:`Entries between Cite and Tools — a feedback form, a specification.
@default undefined`},actions:{required:!1,tsType:{name:`union`,raw:`ReactNode | ((compact: boolean) => ReactNode)`,elements:[{name:`ReactNode`},{name:`unknown`}]},description:`Entries after Tools — a unit picker, an admin action.
@default undefined`},language:{required:!1,tsType:{name:`union`,raw:`ReactNode | ((compact: boolean) => ReactNode)`,elements:[{name:`ReactNode`},{name:`unknown`}]},description:`The language switcher, after the site's own entries.
@default undefined`},account:{required:!1,tsType:{name:`ReactNode`},description:`Who is signed in, at the right end.
@default undefined`},share:{required:!1,tsType:{name:`union`,raw:`ShareControlProps<Codecs> | ReactElement`,elements:[{name:`ShareControlProps`,elements:[{name:`Codecs`}],raw:`ShareControlProps<Codecs>`},{name:`ReactElement`}]},description:`The Share entry: what \`ShareControl\` is given, the shell passing it the
site and the compact state, or a control of the site's own.
@default undefined — no Share entry`},contact:{required:!1,tsType:{name:`union`,raw:`string | false`,elements:[{name:`string`},{name:`literal`,value:`false`}]},description:"The contact form of the Contact entry, or `false` to leave it out.\n@default the family's form"},belowHeader:{required:!1,tsType:{name:`ReactNode`},description:`What sits between the bar and the page — a tagline, a banner — dropped
with the bar when the page is framed.
@default undefined`},mainClassName:{required:!1,tsType:{name:`string`},description:`Classes the main area carries beside the shell's own.
@default undefined`},mainTestId:{required:!1,tsType:{name:`string`},description:"`data-testid` of the main area.\n@default undefined"},mainElement:{required:!1,tsType:{name:`union`,raw:`'main' | 'div'`,elements:[{name:`literal`,value:`'main'`},{name:`literal`,value:`'div'`}]},description:"The element the page is drawn in: `div` for a page that brings its own\n`<main>` — an embedded Swagger UI — so the document keeps one landmark.\n@default 'main'"},footer:{required:!1,tsType:{name:`union`,raw:`ShellFooter | false`,elements:[{name:`ShellFooter`},{name:`literal`,value:`false`}]},description:"The strip under the page, or `false` for none on this page.\n@default the family's links alone"},children:{required:!0,tsType:{name:`ReactNode`},description:`The page the address names.`}}}})))()}var W,G,K,q,J,Y,X,Z,Q,ve;function $(){return($=e((()=>{g(),U(),W=i(),G=[{id:`electrons`,label:`Electrons`,href:`#electrons`},{id:`neutrons`,label:`Neutrons`,href:`#neutrons`},{id:`lewis`,label:`Lewis`,href:`#lewis`},{id:`oxidation`,label:`Oxidation states`,href:`#oxidation`}],K={siteId:`atoms`,what:`Count electrons and neutrons, draw Lewis structures and find oxidation states.`,can:[`Count the electrons of an atom or an ion.`,`Check a Lewis structure atom by atom.`],credits:[`react`,`blueprint`],cite:[h]},q={title:`Shell/SiteShell`,component:V,args:{siteId:`atoms`,nav:G,activeId:`electrons`,about:{content:K,href:`#about`},share:{vocabulary:{parts:[]},title:`Electrons`,preview:!1},footer:{heading:`The rest of the cheminfo family`,note:`Every series of questions is a link you can hand out or frame in a course page.`},children:(0,W.jsxs)(`section`,{children:[(0,W.jsx)(`h1`,{style:{margin:`0 0 4px`,fontSize:`1.375rem`},children:`Count the electrons`}),(0,W.jsx)(`p`,{style:{margin:0,color:`var(--text-muted)`},children:`Type a formula, with its charge, and read the electron count.`})]})},decorators:[e=>(0,W.jsx)(`div`,{children:(0,W.jsx)(e,{})})],parameters:{layout:`fullscreen`,docs:{description:{component:`The chrome of a site around its page: theme, bar with About · Cite · Tools · Contact · Share, the page, and the footer. A framed page gets the page alone.`}}}},J={},Y={args:{about:{content:K,href:`#about`,active:!0}}},X={args:{embedded:!0}},Z={args:{width:`full`}},Q={args:{width:`full`,fit:!0,children:(0,W.jsx)(`div`,{style:{flex:`1 1 auto`,minHeight:0,overflow:`auto`},children:(0,W.jsx)(`p`,{style:{margin:0,padding:16,height:2e3},children:`A tool whose column scrolls inside the window.`})})}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{}`,...J.parameters?.docs?.source},description:{story:`A site of the family, opened on one of its pages.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    about: {
      content: ABOUT,
      href: '#about',
      active: true
    }
  }
}`,...Y.parameters?.docs?.source},description:{story:`The About tab on show: the shared About page, the entry tinted.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    embedded: true
  }
}`,...X.parameters?.docs?.source},description:{story:"Framed by a course with `?embed`: no bar, no footer.",...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'full'
  }
}`,...Z.parameters?.docs?.source},description:{story:`A workbench that fills the window: bar, page and footer run full width.`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'full',
    fit: true,
    children: <div style={{
      flex: '1 1 auto',
      minHeight: 0,
      overflow: 'auto'
    }}>
        <p style={{
        margin: 0,
        padding: 16,
        height: 2000
      }}>
          A tool whose column scrolls inside the window.
        </p>
      </div>
  }
}`,...Q.parameters?.docs?.source},description:{story:`A workbench: the bar and the tool own the window, the tool's column scrolls
inside itself, and the footer waits below the fold.`,...Q.parameters?.docs?.description}}},ve=[`Default`,`AboutOnShow`,`Embedded`,`FullWidth`,`Workbench`]})))()}$();export{Y as AboutOnShow,J as Default,X as Embedded,Z as FullWidth,Q as Workbench,ve as __namedExportsOrder,q as default};