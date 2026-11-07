import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{a as t,i as n}from"./languageParam-dyZ4WZE3.js";import{h as r,n as i}from"./iframe-CJ6VHgF7.js";import{c as a,l as o,n as s,s as c,t as l}from"./useT-D8skuMh3.js";import{n as u}from"./joinClassNames-BbK_6p9Z.js";import{i as d,n as f,t as p}from"./config-Dbeb2VWW.js";import{n as m,t as ee}from"./AboutPage-5GkowImt.js";import{n as h,r as g}from"./platformPaper-DLH753xx.js";import{n as _,t as v}from"./CiteButton-CVI1BoME.js";import{n as te,t as y}from"./SiteTheme-30Z08IVU.js";import{n as b,t as x}from"./NavLink-BRBaPU4S.js";import{n as S,t as C}from"./EcosystemButton-D3PsIV44.js";import{n as w,t as ne}from"./HiddenPartsProvider-Y8bN_UO8.js";import{n as T,t as E}from"./ShareControl-BOyKwCLF.js";import{n as D,t as re}from"./SiteFooter-DypIiHFo.js";import{i as ie,n as ae,r as oe,t as se}from"./useCompactHeader-CI8p-1RP.js";var ce;function O(){return(O=e((()=>{ce=`figure`})))()}function k(e){let t=A(),n=e.legacyAddress(t),r=e.languageAddress?.(n??t)??n;if(r===null)return e.parse(t);let i=a();return i?.replaceState(i.state,``,r),globalThis.dispatchEvent?.(new Event(j)),e.parse(r)}function le(e,t,n={}){let r=A(),i=de(e,t,r,n.keep??[]),s=o(),c=a();if(s===void 0||c===void 0||(e.mode===`hash`?s.hash:`${s.pathname}${s.search}`)===i)return i;let l=n.history??`auto`,u=e.parse(r),d=e.parse(i),f=u.tab===d.tab&&u.language===d.language;return l===`replace`||l===`auto`&&f?c.replaceState(c.state,``,i):c.pushState(null,``,i),globalThis.dispatchEvent?.(new Event(j)),i}function ue(e,t){function n(){t(k(e))}return globalThis.addEventListener?.(`popstate`,n),globalThis.addEventListener?.(j,n),()=>{globalThis.removeEventListener?.(`popstate`,n),globalThis.removeEventListener?.(j,n)}}function A(){let e=o();return e===void 0?`/`:`${e.pathname}${e.search}${e.hash}`}function de(e,t,r,i){let a=e.parse(r),o=t.language??a.language,s=e.format(o===void 0?t:{...t,language:o}),c=t.params??{},l=a.params,u=[];for(let e of new Set([p,f,ce,...i])){if(Object.hasOwn(c,e))continue;let t=l[e];t!==void 0&&u.push([e,t])}return u.length===0?s:`${s}${s.includes(`?`)?`&`:`?`}${n(u)}`}var j;function M(){return(M=e((()=>{d(),O(),c(),t(),j=`cheminfo:routechange`})))()}function fe(e){let t=(0,N.useCallback)(t=>ue(e,t),[e]),n=(0,N.useSyncExternalStore)(t,A,A);return(0,N.useEffect)(()=>{k(e)},[e]),(0,N.useMemo)(()=>e.parse(n),[e,n])}var N;function P(){return(P=e((()=>{N=r(),M()})))()}function F(e){let{href:t,active:n=!1,onSelect:r,label:i,title:a,id:o=`about`,className:c}=e,l=s();return(0,I.jsx)(x,{item:{id:o,label:i??l(`chrome.about`),icon:`info-sign`,href:t,title:a??l(`chrome.aboutTitle`),onSelect:r},active:n,className:c})}var I;function L(){return(L=e((()=>{l(),b(),I=i(),F.__docgenInfo={description:`The About entry, which leads the utilities on every site of the family: a
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
@default undefined`}}}})))()}function R(e){let{siteId:t,site:n,mark:r,markSize:i,nav:a,activeId:o,homeHref:s,onHome:c,renderNavItem:l,navPart:d=`tabs`,width:f=`page`,embedded:p=!1,hidden:m,about:h=!1,contact:g,belowHeader:_,mainClassName:v,mainTestId:te,mainElement:b=`main`,footer:x={},account:S,children:C}=e,w=ae(),T=x===!1?void 0:x.siteId??t,E=h!==!1&&h.active===!0,D=(0,V.jsxs)(V.Fragment,{children:[t===void 0?(0,V.jsx)(y,{site:n}):(0,V.jsx)(y,{siteId:t}),(0,V.jsxs)(`div`,{className:`site-shell`,children:[(0,V.jsx)(oe,{siteId:t,site:n,mark:r,markSize:i,embedded:p,width:f,nav:m?.includes(d)?[]:a,activeId:E?h.id??`about`:o,homeHref:s,onHome:c,renderNavItem:l,contact:g,actions:(0,V.jsx)(pe,{...e,compact:w}),share:(0,V.jsx)(me,{...e,compact:w}),account:S}),p?null:_,(0,V.jsx)(b,{className:u(`site-shell__main`,f===`full`?`site-shell__main--full`:void 0,p?`site-shell__main--embedded`:void 0,v),"data-testid":te,children:E&&h.routed!==!0?h.page??(0,V.jsx)(ee,{content:h.content}):C})]}),x===!1||T===void 0?null:(0,V.jsxs)(re,{siteId:T,embedded:p,width:f,heading:x.heading,layout:x.layout,children:[x.note===void 0?null:(0,V.jsx)(`p`,{className:`app-footer__note`,children:x.note}),x.children]})]});return m===void 0?D:(0,V.jsx)(ne,{hidden:m,children:D})}function pe(e){let{siteId:t,about:n=!1,cite:r,ecosystem:i=!0,actionsBeforeAbout:a,actionsAfterAbout:o,actionsAfterCite:s,actions:c,language:l,compact:u}=e,d=r??(n===!1?[]:n.content.cite??[]);return(0,V.jsxs)(V.Fragment,{children:[z(a,u),n===!1?null:(0,V.jsx)(F,{id:n.id,href:n.href??`/about`,active:n.active,onSelect:n.onSelect,label:n.label,title:n.title}),z(o,u),d===!1||d.length===0?null:(0,V.jsx)(v,{works:d,compact:u}),z(s,u),i?(0,V.jsx)(C,{currentSiteId:t,compact:u}):null,z(c,u),z(l,u)]})}function me(e){let{share:t,siteId:n,compact:r}=e;return t===void 0?null:(0,B.isValidElement)(t)?t:(0,V.jsx)(E,{siteId:n,compact:r,...t})}function z(e,t){return typeof e==`function`?e(t):e}var B,V;function H(){return(H=e((()=>{B=r(),m(),L(),D(),ie(),se(),_(),S(),te(),w(),T(),V=i(),R.__docgenInfo={description:`Draw the shell.
@param props - The shell's props, the route already read.
@returns The page in its chrome.`,methods:[],displayName:`ShellFrame`,props:{siteId:{required:!1,tsType:{name:`union`,raw:`| 'learn'
| 'inchi'
| 'vcl'
| 'smiles'
| 'iupac-name'
| 'openbabel'
| 'chemcalc'
| 'dbe'
| 'nmrium'
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
| 'symmetry'
| 'osiris'
| 'atoms'
| 'moles'
| 'inorganic'
| 'slides'
| 'chembio'
| 'wikidata'
| 'mz'
| 'vibrations'
| 'draw'
| 'tlc'
| 'glassware'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'iupac-name'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'isomers'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'spectroscopy'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'molecules'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`},{name:`literal`,value:`'slides'`},{name:`literal`,value:`'chembio'`},{name:`literal`,value:`'wikidata'`},{name:`literal`,value:`'mz'`},{name:`literal`,value:`'vibrations'`},{name:`literal`,value:`'draw'`},{name:`literal`,value:`'tlc'`},{name:`literal`,value:`'glassware'`}]},description:"The site, named. One of `site` and `siteId` is required.\n@default undefined"},site:{required:!1,tsType:{name:`SiteRecord`},description:`The site, passed rather than named, for one outside the family's registry.
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
@default 'page'`},embedded:{required:!1,tsType:{name:`boolean`},description:`Whether the page is framed in another site: no bar, no footer, and the
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
@default undefined`},mainTestId:{required:!1,tsType:{name:`string`},description:"`data-testid` of the main area.\n@default undefined"},mainElement:{required:!1,tsType:{name:`union`,raw:`'main' | 'div'`,elements:[{name:`literal`,value:`'main'`},{name:`literal`,value:`'div'`}]},description:"The element the page is drawn in: `div` for a page that brings its own\n`<main>` — an embedded Swagger UI — so the document keeps one landmark.\n@default 'main'"},footer:{required:!1,tsType:{name:`union`,raw:`ShellFooter | false`,elements:[{name:`ShellFooter`},{name:`literal`,value:`false`}]},description:"The strip under the page, or `false` for none on this page.\n@default the family's links alone"},children:{required:!0,tsType:{name:`ReactNode`},description:`The page the address names.`}}}})))()}function U(e){let{router:t}=e;return t===void 0?(0,W.jsx)(R,{...e}):(0,W.jsx)(he,{...e,router:t})}function he(e){let{router:t,aboutTab:n=`about`,about:r,activeId:i}=e,a=fe(t),o=r===void 0||r===!1?!1:{...r,href:r.href??t.format({tab:n}),active:r.active??a.tab===n,onSelect:r.onSelect??(()=>{le(t,{tab:n})})};return(0,W.jsx)(R,{...e,about:o,activeId:i??a.tab})}var W;function G(){return(G=e((()=>{M(),P(),H(),W=i(),U.__docgenInfo={description:`The chrome every site of the family carries, around its page: the theme,
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
| 'nmrium'
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
| 'symmetry'
| 'osiris'
| 'atoms'
| 'moles'
| 'inorganic'
| 'slides'
| 'chembio'
| 'wikidata'
| 'mz'
| 'vibrations'
| 'draw'
| 'tlc'
| 'glassware'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'iupac-name'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'isomers'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'spectroscopy'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'molecules'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`},{name:`literal`,value:`'slides'`},{name:`literal`,value:`'chembio'`},{name:`literal`,value:`'wikidata'`},{name:`literal`,value:`'mz'`},{name:`literal`,value:`'vibrations'`},{name:`literal`,value:`'draw'`},{name:`literal`,value:`'tlc'`},{name:`literal`,value:`'glassware'`}]},description:"The site, named. One of `site` and `siteId` is required.\n@default undefined"},site:{required:!1,tsType:{name:`SiteRecord`},description:`The site, passed rather than named, for one outside the family's registry.
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
@default 'page'`},embedded:{required:!1,tsType:{name:`boolean`},description:`Whether the page is framed in another site: no bar, no footer, and the
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
@default undefined`},mainTestId:{required:!1,tsType:{name:`string`},description:"`data-testid` of the main area.\n@default undefined"},mainElement:{required:!1,tsType:{name:`union`,raw:`'main' | 'div'`,elements:[{name:`literal`,value:`'main'`},{name:`literal`,value:`'div'`}]},description:"The element the page is drawn in: `div` for a page that brings its own\n`<main>` — an embedded Swagger UI — so the document keeps one landmark.\n@default 'main'"},footer:{required:!1,tsType:{name:`union`,raw:`ShellFooter | false`,elements:[{name:`ShellFooter`},{name:`literal`,value:`false`}]},description:"The strip under the page, or `false` for none on this page.\n@default the family's links alone"},children:{required:!0,tsType:{name:`ReactNode`},description:`The page the address names.`}}}})))()}var K,q,J,ge,Y,X,Z,Q,$;function _e(){return(_e=e((()=>{g(),G(),K=i(),q=[{id:`electrons`,label:`Electrons`,href:`#electrons`},{id:`neutrons`,label:`Neutrons`,href:`#neutrons`},{id:`lewis`,label:`Lewis`,href:`#lewis`},{id:`oxidation`,label:`Oxidation states`,href:`#oxidation`}],J={siteId:`atoms`,what:`Count electrons and neutrons, draw Lewis structures and find oxidation states.`,can:[`Count the electrons of an atom or an ion.`,`Check a Lewis structure atom by atom.`],credits:[`react`,`blueprint`],cite:[h]},ge={title:`Shell/SiteShell`,component:U,args:{siteId:`atoms`,nav:q,activeId:`electrons`,about:{content:J,href:`#about`},share:{vocabulary:{parts:[]},title:`Electrons`,preview:!1},footer:{heading:`The rest of the cheminfo family`,note:`Every series of questions is a link you can hand out or frame in a course page.`},children:(0,K.jsxs)(`section`,{children:[(0,K.jsx)(`h1`,{style:{margin:`0 0 4px`,fontSize:`1.375rem`},children:`Count the electrons`}),(0,K.jsx)(`p`,{style:{margin:0,color:`var(--text-muted)`},children:`Type a formula, with its charge, and read the electron count.`})]})},decorators:[e=>(0,K.jsx)(`div`,{children:(0,K.jsx)(e,{})})],parameters:{layout:`fullscreen`,docs:{description:{component:`The chrome of a site around its page: theme, bar with About · Cite · Tools · Contact · Share, the page, and the footer. A framed page gets the page alone.`}}}},Y={},X={args:{about:{content:J,href:`#about`,active:!0}}},Z={args:{embedded:!0}},Q={args:{width:`full`}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{}`,...Y.parameters?.docs?.source},description:{story:`A site of the family, opened on one of its pages.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    about: {
      content: ABOUT,
      href: '#about',
      active: true
    }
  }
}`,...X.parameters?.docs?.source},description:{story:`The About tab on show: the shared About page, the entry tinted.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    embedded: true
  }
}`,...Z.parameters?.docs?.source},description:{story:"Framed by a course with `?embed`: no bar, no footer.",...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'full'
  }
}`,...Q.parameters?.docs?.source},description:{story:`A workbench that fills the window: bar, page and footer run full width.`,...Q.parameters?.docs?.description}}},$=[`Default`,`AboutOnShow`,`Embedded`,`FullWidth`]})))()}_e();export{X as AboutOnShow,Y as Default,Z as Embedded,Q as FullWidth,$ as __namedExportsOrder,ge as default};