import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{i as t,r as n}from"./lookup-D3jAqtm6.js";import{h as r,n as i}from"./iframe-CIDaH36i.js";import{i as a,n as o,r as s,t as c}from"./useT-GJnFLlyb.js";import{n as l,t as u}from"./Wordmark-C4W_Trn1.js";import{n as d,t as f}from"./marks-B1kxEr6K.js";import{n as p}from"./navItem-6b8YIPQN.js";import{n as m,t as h}from"./NavLink-BdMN6u0y.js";import{n as g,t as _}from"./NavMenuButton-BsZKbbux.js";function v(e,t=b){return t[e]??t.en??``}function y(e,t){let{site:n,page:r=``}=t;return e.replaceAll(`{site}`,encodeURIComponent(n)).replaceAll(`{page}`,encodeURIComponent(r))}var b;function x(){return(x=e((()=>{b={en:`https://docs.google.com/forms/d/e/1FAIpQLSd_1G3tUOEJh_qapmLn_xrybWa9Nu7B57bpYm76o4nwPKPWsg/viewform?usp=pp_url&entry.569380734={site}&entry.2103045774={page}`}})))()}function S(e){let{siteId:t,page:n=globalThis.location?.href??``,label:r,title:i,className:s}=e,c=o(),l=a(),u=e.formUrl??v(l);return u===``?null:(0,C.jsx)(h,{item:{id:`contact`,label:r??c(`chrome.contact`),icon:`chat`,href:y(u,{site:t,page:n}),external:!0,title:i??c(`chrome.contactTitle`)},className:s})}var C;function w(){return(w=e((()=>{m(),s(),c(),x(),C=i(),S.__docgenInfo={description:`The Contact entry of a site header: it opens the family's contact form in a new tab,
with the site and the page already filled in, so the reader only writes the message.
The form is opened, never embedded, so nothing is loaded from it before the click.
@param props - The site, and the form it opens.
@returns The entry, or nothing while no form address is set.`,methods:[],displayName:`ContactButton`,props:{siteId:{required:!0,tsType:{name:`string`},description:`The site the reader writes about, written into the form.`},formUrl:{required:!1,tsType:{name:`string`},description:"Address of the form, with `{site}` and `{page}` where they are written.\n@default the family's form in the language of the page (`CONTACT_FORM_URLS`)"},page:{required:!1,tsType:{name:`string`},description:`The page the reader is on, written into the form.
@default the address of the current page`},label:{required:!1,tsType:{name:`string`},description:`What the entry reads. In a compact bar it is not written, but it stays what
the pointer and a screen reader are told.
@default the chrome's own word for it, in the language of the page`},title:{required:!1,tsType:{name:`string`},description:`What the pointer is told.
@default the chrome's own sentence, in the language of the page`},className:{required:!1,tsType:{name:`string`},description:`Class names added after the component's own.
@default undefined`}}}})))()}function T(e){let{item:t,activeId:n}=e;return t.items===void 0?(0,D.jsx)(h,{item:t,active:t.id===n}):(0,D.jsx)(_,{label:E(t),icon:typeof t.icon==`string`?t.icon:void 0,items:t.items,activeId:n,placement:`bottom-start`})}function E(e){return typeof e.label==`string`?e.label:e.title??e.id}var D;function O(){return(O=e((()=>{m(),g(),D=i(),T.__docgenInfo={description:`One page of the bar: a link, or the menu it opens when the entry folds pages
of its own. A menu stands where its pages would, among them and not among the
utilities, because picking one of them changes what the page shows.
@param props - The entry and the page on show.
@param props.item - The entry.
@param props.activeId - The page on show.
@returns The entry.`,methods:[],displayName:`NavEntry`,props:{item:{required:!0,tsType:{name:`NavItem`},description:``},activeId:{required:!0,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:``}}}})))()}function k(e){let{siteId:n,site:r,mark:i,nav:s,activeId:c,actions:l,share:d,account:m,contact:h,renderNavItem:g,embedded:y=!1,homeHref:b=`/`,onHome:x,markSize:C=28,width:w=`page`,pagesLabel:E}=e,D=o(),O=a();if(y)return null;let k=r??(n===void 0?void 0:t(n));if(k===void 0)throw Error("SiteHeader needs one of its `site` and `siteId` props");let N=h===!1?``:h??v(O);return(0,j.jsx)(`header`,{className:`app-header no-print`,children:(0,j.jsxs)(`div`,{className:M[w],children:[(0,j.jsxs)(`a`,{className:`brand`,href:b,title:k.host,onClick:e=>{x===void 0||p(e)||(e.preventDefault(),x())},children:[i??(0,j.jsx)(f,{site:k,size:C}),(0,j.jsx)(u,{site:k})]}),(0,j.jsx)(`nav`,{className:`app-header-nav`,children:s.map(e=>(0,j.jsx)(A.Fragment,{children:g===void 0?(0,j.jsx)(T,{item:e,activeId:c}):g(e,e.id===c)},e.id))}),s.length>1?(0,j.jsx)(`div`,{className:`app-header-nav-menu`,children:(0,j.jsx)(_,{label:E??D(`chrome.pages`),icon:`menu`,compact:!0,items:s,activeId:c})}):null,(0,j.jsx)(`span`,{className:`spacer`}),l===void 0&&d===void 0&&m===void 0&&N===``?null:(0,j.jsxs)(`div`,{className:`app-header-actions`,children:[l,N===``?null:(0,j.jsx)(S,{siteId:k.id,formUrl:N}),d,m]})]})})}var A,j,M;function N(){return(N=e((()=>{A=r(),x(),w(),n(),l(),d(),s(),c(),O(),g(),j=i(),M={page:`app-header__inner`,full:`app-header__inner app-header__inner--full`},k.__docgenInfo={description:`The bar every site of the family carries: the brand linking home at the left,
the pages next to it, and the utilities pushed to the right edge by the
spacer.

The bar folds on its own width, with no hook to wire: under 48rem the
utilities keep only their icons, under 36rem the pages fold into one menu,
and under 22rem the name gives way to the mark.
@param props - The site, its pages, its utilities, and whether the page is
framed in another site.
@returns The bar, or nothing at all on an embedded page.
@throws {Error} When neither \`site\` nor \`siteId\` is given.`,methods:[],displayName:`SiteHeader`,props:{siteId:{required:!1,tsType:{name:`union`,raw:`| 'learn'
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
| 'vibrations'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'iupac-name'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'isomers'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'spectroscopy'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'molecules'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`},{name:`literal`,value:`'slides'`},{name:`literal`,value:`'chembio'`},{name:`literal`,value:`'wikidata'`},{name:`literal`,value:`'mz'`},{name:`literal`,value:`'vibrations'`}]},description:"The site the bar belongs to, which draws its mark and writes its name. One\nof `site` and `siteId` is required.\n@default undefined"},site:{required:!1,tsType:{name:`SiteRecord`},description:`The same site, passed rather than named — for a site that is deliberately
not one of \`ECOSYSTEM_SITES\`, and so is linked from no other site's menu.
@default undefined`},mark:{required:!1,tsType:{name:`ReactNode`},description:`The site's own mark, for a site the shared glyph set does not hold. It
stands where \`SiteMark\` would, at the size the site draws it.
@default undefined — the family's mark for that site`},nav:{required:!0,tsType:{name:`unknown`},description:`The pages, in the order the bar lists them.`},activeId:{required:!1,tsType:{name:`string`},description:"Which of the pages is on show, named by its `id`.\n@default undefined"},actions:{required:!1,tsType:{name:`ReactNode`},description:`The utilities pushed to the right edge — About, Cite, Tools, the language;
Share and the account have props of their own, so they always come last.
They arrive dressed as bar items, so a plain \`nav-link\` and a \`CiteButton\`
read alike beside each other.
@default undefined`},account:{required:!1,tsType:{name:`ReactNode`},description:"Who is signed in, drawn at the extreme right, after Share — usually an\n`AccountButton`. A site passes it only while somebody is signed in: signing\nin starts on the About (`AboutPage`'s `signIn`), never in the bar.\n@default undefined"},share:{required:!1,tsType:{name:`ReactNode`},description:`The Share entry, which closes the utilities on every site, after the
Contact entry. A site passes its own when it wraps the shared \`ShareButton\`
in a dialog of its own.
@default undefined`},contact:{required:!1,tsType:{name:`union`,raw:`string | false`,elements:[{name:`string`},{name:`literal`,value:`false`}]},description:"The contact form the Contact entry opens, drawn after the site's utilities\nand just before Share, with\n`{site}` and `{page}` where the site and the page are written; `false`\nleaves the entry out. No entry is drawn while there is no form.\n@default the family's form in the language of the page (`CONTACT_FORM_URLS`)"},renderNavItem:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(item: NavItem, isActive: boolean) => ReactNode`,signature:{arguments:[{type:{name:`NavItem`},name:`item`},{type:{name:`boolean`},name:`isActive`}],return:{name:`ReactNode`}}},description:`Draws one page the site's own way, for a bar whose entries need a tooltip
or a wrapper of their own.
@default undefined`},embedded:{required:!1,tsType:{name:`boolean`},description:`Whether the page is framed in another site, in which case no bar is drawn
at all — what a host page frames already carries its own navigation.
@default false`},homeHref:{required:!1,tsType:{name:`string`},description:`Where the brand leads.
@default '/'`},onHome:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`What the site does when the brand is picked, for a page that routes in
place. A modified click is left to the browser.
@default undefined`},markSize:{required:!1,tsType:{name:`number`},description:`Edge of the site's mark, in pixels.
@default 28`},width:{required:!1,tsType:{name:`union`,raw:`'page' | 'full'`,elements:[{name:`literal`,value:`'page'`},{name:`literal`,value:`'full'`}]},description:`How wide the bar's contents run.

\`page\` caps them at \`--page-max\` and centres them, so the brand sits over
the first word of a page that is capped the same way — which is what a
site of reading matter wants. \`full\` runs them to both edges, for a tool
that fills the window: there the cap leaves the brand floating inwards
with the tool running past it on both sides, and reads as a fault.
@default 'page'`},pagesLabel:{required:!1,tsType:{name:`string`},description:`What the menu the pages fold into on a phone is called, for the pointer
and a screen reader.
@default the chrome's own word for it, in the language of the page`}}}})))()}function P(e,t={}){let{maxWidth:n=z}=t,r=(0,R.useCallback)(t=>I(e?.current??null,t),[e]),i=(0,R.useCallback)(()=>F(e?.current??null,n),[e,n]);return(0,R.useSyncExternalStore)(r,i,L)}function F(e,t=z){let n=e===null?0:e.clientWidth,r=n>0?n:globalThis.innerWidth;return!Number.isFinite(r)||r<=0?!1:r<=t}function I(e,t){if(e!==null&&typeof ResizeObserver==`function`){let n=new ResizeObserver(t);return n.observe(e),()=>n.disconnect()}return globalThis.addEventListener(`resize`,t),()=>globalThis.removeEventListener(`resize`,t)}function L(){return!1}var R,z;function B(){return(B=e((()=>{R=r(),z=1e3})))()}export{N as i,P as n,k as r,B as t};