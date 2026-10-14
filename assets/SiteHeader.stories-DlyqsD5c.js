import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,r,s as i}from"./lookup-Cbp1oRe2.js";import{h as a,n as o}from"./iframe-4E4HN92I.js";import{i as s,n as c,r as l,t as u}from"./useT-CvCdo_Ob.js";import{n as d,t as ee}from"./Wordmark-OkM1v-vq.js";import{n as f,t as te}from"./marks-ZTbKFpDc.js";import{n as p,t as m}from"./CiteButton-Da-kDrVq.js";import{n as ne}from"./navItem-6b8YIPQN.js";import{a as h,c as g,i as _,l as v,o as y,s as re,t as b}from"./chromeFixtures-CIxnNPLL.js";import{r as x,t as ie}from"./paper-CJ-kXT2u.js";import{n as ae,t as oe}from"./EcosystemButton-C9IljVAW.js";import{n as se,t as S}from"./NavMenuButton-Ebrlq_m1.js";import{n as ce,t as le}from"./ShareButton-C8tKMpmu.js";import{n as ue,t as de}from"./SiteFooter-BUclxfCA.js";function fe(e,t=C){return t[e]??t.en??``}function pe(e,t){let{site:n,page:r=``}=t;return e.replaceAll(`{site}`,encodeURIComponent(n)).replaceAll(`{page}`,encodeURIComponent(r))}var C;function w(){return(w=e((()=>{C={en:`https://docs.google.com/forms/d/e/1FAIpQLSd_1G3tUOEJh_qapmLn_xrybWa9Nu7B57bpYm76o4nwPKPWsg/viewform?usp=pp_url&entry.569380734={site}&entry.2103045774={page}`}})))()}function T(e){let{siteId:t,page:n=globalThis.location?.href??``,label:r,title:i,className:a}=e,o=c(),l=s(),u=e.formUrl??fe(l);return u===``?null:(0,E.jsx)(g,{item:{id:`contact`,label:r??o(`chrome.contact`),icon:`chat`,href:pe(u,{site:t,page:n}),external:!0,title:i??o(`chrome.contactTitle`)},className:a})}var E;function D(){return(D=e((()=>{v(),l(),u(),w(),E=o(),T.__docgenInfo={description:`The Contact entry of a site header: it opens the family's contact form in a new tab,
with the site and the page already filled in, so the reader only writes the message.
The form is opened, never embedded, so nothing is loaded from it before the click.
@param props - The site, and the form it opens.
@returns The entry, or nothing while no form address is set.`,methods:[],displayName:`ContactButton`,props:{siteId:{required:!0,tsType:{name:`string`},description:`The site the reader writes about, written into the form.`},formUrl:{required:!1,tsType:{name:`string`},description:"Address of the form, with `{site}` and `{page}` where they are written.\n@default the family's form in the language of the page (`CONTACT_FORM_URLS`)"},page:{required:!1,tsType:{name:`string`},description:`The page the reader is on, written into the form.
@default the address of the current page`},label:{required:!1,tsType:{name:`string`},description:`What the entry reads. In a compact bar it is not written, but it stays what
the pointer and a screen reader are told.
@default the chrome's own word for it, in the language of the page`},title:{required:!1,tsType:{name:`string`},description:`What the pointer is told.
@default the chrome's own sentence, in the language of the page`},className:{required:!1,tsType:{name:`string`},description:`Class names added after the component's own.
@default undefined`}}}})))()}function O(e){let{siteId:t,site:r,mark:i,nav:a,activeId:o,actions:l,share:u,contact:d,renderNavItem:f,embedded:p=!1,homeHref:m=`/`,onHome:h,markSize:g=28,width:_=`page`,pagesLabel:v}=e,y=c(),re=s();if(p)return null;let b=r??(t===void 0?void 0:n(t));if(b===void 0)throw Error("SiteHeader needs one of its `site` and `siteId` props");let x=d===!1?``:d??fe(re);return(0,A.jsx)(`header`,{className:`app-header no-print`,children:(0,A.jsxs)(`div`,{className:j[_],children:[(0,A.jsxs)(`a`,{className:`brand`,href:m,title:b.host,onClick:e=>{h===void 0||ne(e)||(e.preventDefault(),h())},children:[i??(0,A.jsx)(te,{site:b,size:g}),(0,A.jsx)(ee,{site:b})]}),(0,A.jsx)(`nav`,{className:`app-header-nav`,children:a.map(e=>(0,A.jsx)(k.Fragment,{children:f===void 0?(0,A.jsx)(me,{item:e,activeId:o}):f(e,e.id===o)},e.id))}),a.length>1?(0,A.jsx)(`div`,{className:`app-header-nav-menu`,children:(0,A.jsx)(S,{label:v??y(`chrome.pages`),icon:`menu`,compact:!0,items:a,activeId:o})}):null,(0,A.jsx)(`span`,{className:`spacer`}),l===void 0&&u===void 0&&x===``?null:(0,A.jsxs)(`div`,{className:`app-header-actions`,children:[l,x===``?null:(0,A.jsx)(T,{siteId:b.id,formUrl:x}),u]})]})})}function me(e){let{item:t,activeId:n}=e;return t.items===void 0?(0,A.jsx)(g,{item:t,active:t.id===n}):(0,A.jsx)(S,{label:he(t),icon:typeof t.icon==`string`?t.icon:void 0,items:t.items,activeId:n,placement:`bottom-start`})}function he(e){return typeof e.label==`string`?e.label:e.title??e.id}var k,A,j;function M(){return(M=e((()=>{k=a(),w(),D(),r(),d(),f(),l(),u(),v(),se(),A=o(),j={page:`app-header__inner`,full:`app-header__inner app-header__inner--full`},O.__docgenInfo={description:`The bar every site of the family carries: the brand linking home at the left,
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
| 'molecules'
| 'symmetry'
| 'osiris'
| 'atoms'
| 'moles'
| 'inorganic'
| 'powerpoint'
| 'naturals'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'iupac-name'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'molecules'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`},{name:`literal`,value:`'powerpoint'`},{name:`literal`,value:`'naturals'`}]},description:"The site the bar belongs to, which draws its mark and writes its name. One\nof `site` and `siteId` is required.\n@default undefined"},site:{required:!1,tsType:{name:`SiteRecord`},description:`The same site, passed rather than named — for a site that is deliberately
not one of \`ECOSYSTEM_SITES\`, and so is linked from no other site's menu.
@default undefined`},mark:{required:!1,tsType:{name:`ReactNode`},description:`The site's own mark, for a site the shared glyph set does not hold. It
stands where \`SiteMark\` would, at the size the site draws it.
@default undefined — the family's mark for that site`},nav:{required:!0,tsType:{name:`unknown`},description:`The pages, in the order the bar lists them.`},activeId:{required:!1,tsType:{name:`string`},description:"Which of the pages is on show, named by its `id`.\n@default undefined"},actions:{required:!1,tsType:{name:`ReactNode`},description:`The utilities pushed to the right edge — About, Cite, Tools, the language,
sign in; Share has a prop of its own, so it always comes last. They
arrive dressed as bar items, so a plain \`nav-link\` and a \`CiteButton\` read
alike beside each other.
@default undefined`},share:{required:!1,tsType:{name:`ReactNode`},description:`The Share entry, which closes the utilities on every site, after the
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
@default the chrome's own word for it, in the language of the page`}}}})))()}function ge(e,t={}){let{maxWidth:n=P}=t,r=(0,N.useCallback)(t=>ve(e?.current??null,t),[e]),i=(0,N.useCallback)(()=>_e(e?.current??null,n),[e,n]);return(0,N.useSyncExternalStore)(r,i,ye)}function _e(e,t=P){let n=e===null?0:e.clientWidth,r=n>0?n:globalThis.innerWidth;return!Number.isFinite(r)||r<=0?!1:r<=t}function ve(e,t){if(e!==null&&typeof ResizeObserver==`function`){let n=new ResizeObserver(t);return n.observe(e),()=>n.disconnect()}return globalThis.addEventListener(`resize`,t),()=>globalThis.removeEventListener(`resize`,t)}function ye(){return!1}var N,P;function F(){return(F=e((()=>{N=a(),P=1e3})))()}function I(e){return e.siteId??`smiles`}function be(e){let t=(0,B.useRef)(null),n=ge(t,{maxWidth:640}),{nav:r,activeId:i}=e,a=I(e);return(0,V.jsx)(z,{siteId:a,children:(0,V.jsxs)(`div`,{style:{padding:`1.25rem`},children:[(0,V.jsx)(`div`,{ref:t,style:Te,children:(0,V.jsx)(O,{...e,nav:n?[Ee]:r,actions:(0,V.jsx)(L,{siteId:a,compact:n}),share:(0,V.jsx)(R,{compact:n}),renderNavItem:n?()=>(0,V.jsx)(S,{label:`Pages`,icon:`menu`,items:r,activeId:i}):void 0})}),(0,V.jsxs)(`p`,{style:{...W,padding:`0.75rem 0 0`},children:[`useCompactHeader: `,(0,V.jsx)(`code`,{children:String(n)}),` — drag the right edge of the bar past 640 px.`]})]})})}function L(e){let{siteId:t,compact:n=!1}=e;return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(m,{reference:ie,compact:n}),(0,V.jsx)(oe,{currentSiteId:t,compact:n})]})}function R(e){let{compact:t=!1}=e;return(0,V.jsx)(le,{onClick:re,compact:t})}function z(e){let t=n(e.siteId),r={"--brand":t.brand,"--brand-alt":t.brandAlt,"--accent":t.brand};return(0,V.jsx)(`div`,{style:r,children:e.children})}var B,V,H,U,W,G,K,q,J,Y,X,Z,xe,Se,Ce,we,Q,Te,Ee,De;function $(){return($=e((()=>{B=a(),v(),se(),ue(),M(),F(),p(),r(),t(),ae(),ce(),y(),x(),V=o(),H=i.map(e=>e.id),U=`
.sb-hovered {
  background: var(--surface-sunken);
  color: var(--text);
}`,W={padding:`0.75rem 1.25rem 0`,margin:0,color:`var(--text-muted)`,fontSize:`0.8125rem`},G={title:`Chrome/SiteHeader`,component:O,args:{siteId:`smiles`,nav:h,activeId:`draw`,markSize:28,homeHref:`/`,embedded:!1},argTypes:{siteId:{control:`select`,options:H},activeId:{control:`select`,options:h.map(e=>e.id)},markSize:{control:{type:`range`,min:16,max:48,step:2}},homeHref:{control:`text`},embedded:{control:`boolean`},nav:{control:!1},actions:{control:!1},share:{control:!1},renderNavItem:{control:!1},onHome:{control:!1}},parameters:{layout:`fullscreen`,docs:{description:{component:`The bar every site of the family carries: the brand linking home at the left, the pages next to it, and the utilities pushed to the right edge.`}}},render:e=>(0,V.jsx)(z,{siteId:I(e),children:(0,V.jsx)(O,{...e,actions:(0,V.jsx)(L,{siteId:I(e)}),share:(0,V.jsx)(R,{})})})},K={},q={render:()=>(0,V.jsx)(`div`,{style:xe,children:_.map(e=>(0,V.jsx)(z,{siteId:e.siteId,children:(0,V.jsx)(O,{siteId:e.siteId,nav:e.nav,activeId:e.activeId,actions:(0,V.jsx)(L,{siteId:e.siteId}),share:(0,V.jsx)(R,{})})},e.siteId))})},J={render:e=>(0,V.jsxs)(z,{siteId:I(e),children:[(0,V.jsx)(`style`,{children:U}),(0,V.jsx)(O,{...e,actions:(0,V.jsx)(L,{siteId:I(e)}),share:(0,V.jsx)(R,{}),renderNavItem:(e,t)=>(0,V.jsx)(g,{item:e,active:t,className:e.id===`tutorial`?`sb-hovered`:void 0})}),(0,V.jsx)(`p`,{style:W,children:`Draw is the page on show; Tutorial is drawn as the pointer leaves it.`})]})},Y={render:e=>(0,V.jsx)(be,{...e})},X={render:e=>(0,V.jsx)(z,{siteId:I(e),children:(0,V.jsxs)(`div`,{style:Se,children:[(0,V.jsx)(O,{...e,actions:(0,V.jsx)(L,{siteId:I(e)}),share:(0,V.jsx)(R,{})}),(0,V.jsx)(`main`,{style:Ce,children:(0,V.jsxs)(`div`,{style:we,children:[(0,V.jsx)(`h1`,{style:{margin:0,fontSize:`1.25rem`},children:b.name}),(0,V.jsxs)(`p`,{style:{margin:0,color:`var(--text-muted)`},children:[`Monoisotopic mass `,b.monoisotopicMass]}),(0,V.jsx)(`code`,{style:Q,children:b.smiles}),(0,V.jsx)(`code`,{style:Q,children:b.inchiKey})]})}),(0,V.jsx)(de,{siteId:I(e),layout:`row`})]})})},Z={render:e=>(0,V.jsxs)(z,{siteId:I(e),children:[(0,V.jsx)(O,{...e,actions:(0,V.jsx)(L,{siteId:I(e)}),share:(0,V.jsx)(R,{})}),(0,V.jsxs)(`p`,{style:W,children:[`Above, the bar. Below, the same bar with `,(0,V.jsx)(`code`,{children:`embedded`}),`, which draws nothing.`]}),(0,V.jsx)(O,{...e,embedded:!0})]})},xe={display:`flex`,minHeight:`100vh`,flexDirection:`column`,padding:`1.5rem`,background:`var(--surface-sunken)`,gap:`1.5rem`},Se={display:`flex`,minHeight:`100vh`,flexDirection:`column`,background:`var(--surface-sunken)`},Ce={width:`100%`,maxWidth:`var(--page-max)`,flex:`1 1 auto`,padding:`1.5rem 1.25rem`,margin:`0 auto`},we={display:`flex`,maxWidth:`32rem`,flexDirection:`column`,padding:`1rem 1.25rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,gap:`0.5rem`},Q={overflowWrap:`anywhere`,fontSize:`0.8125rem`},Te={overflow:`auto`,width:520,minWidth:320,maxWidth:`100%`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,resize:`horizontal`},Ee={id:`pages`,label:`Pages`},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => <div style={STACK_STYLE}>
      {SITE_BARS.map(bar => <SiteTokens key={bar.siteId} siteId={bar.siteId}>
          <SiteHeader siteId={bar.siteId} nav={bar.nav} activeId={bar.activeId} actions={<Utilities siteId={bar.siteId} />} share={<Share />} />
        </SiteTokens>)}
    </div>
}`,...q.parameters?.docs?.source},description:{story:`The same bar on four sites, one under the other: the geometry, the type and
the neutrals never move — only the two colours and the pages do.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: args => <SiteTokens siteId={familySite(args)}>
      <style>{HOVER_RULE}</style>
      <SiteHeader {...args} actions={<Utilities siteId={familySite(args)} />} share={<Share />} renderNavItem={(item, isActive) => <NavLink item={item} active={isActive} className={item.id === 'tutorial' ? 'sb-hovered' : undefined} />} />
      <p style={CAPTION_STYLE}>
        Draw is the page on show; Tutorial is drawn as the pointer leaves it.
      </p>
    </SiteTokens>
}`,...J.parameters?.docs?.source},description:{story:`The page on show, in the brand tint, beside a page under the pointer: the
hover is the neutral wash, so it never impersonates where you are.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: args => <NarrowBar {...args} />
}`,...Y.parameters?.docs?.source},description:{story:`A bar with no room left: \`useCompactHeader\` measures the bar itself, so the
utilities give up their labels and the pages fold into one menu rather than
being pushed off the edge. Drag the right edge to widen it.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: args => <SiteTokens siteId={familySite(args)}>
      <div style={PAGE_STYLE}>
        <SiteHeader {...args} actions={<Utilities siteId={familySite(args)} />} share={<Share />} />
        <main style={MAIN_STYLE}>
          <div style={CARD_STYLE}>
            <h1 style={{
            margin: 0,
            fontSize: '1.25rem'
          }}>{CAFFEINE.name}</h1>
            <p style={{
            margin: 0,
            color: 'var(--text-muted)'
          }}>
              Monoisotopic mass {CAFFEINE.monoisotopicMass}
            </p>
            <code style={CODE_STYLE}>{CAFFEINE.smiles}</code>
            <code style={CODE_STYLE}>{CAFFEINE.inchiKey}</code>
          </div>
        </main>
        <SiteFooter siteId={familySite(args)} layout="row" />
      </div>
    </SiteTokens>
}`,...X.parameters?.docs?.source},description:{story:`Header, page and footer together — the whole chrome a site imports.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: args => <SiteTokens siteId={familySite(args)}>
      <SiteHeader {...args} actions={<Utilities siteId={familySite(args)} />} share={<Share />} />
      <p style={CAPTION_STYLE}>
        Above, the bar. Below, the same bar with <code>embedded</code>, which
        draws nothing.
      </p>
      <SiteHeader {...args} embedded />
    </SiteTokens>
}`,...Z.parameters?.docs?.source},description:{story:`A framed page is given no bar at all: what frames it carries its own.`,...Z.parameters?.docs?.description}}},De=[`Default`,`EverySite`,`ActiveAndHovered`,`Narrow`,`WholePage`,`Embedded`]})))()}$();export{J as ActiveAndHovered,K as Default,Z as Embedded,q as EverySite,Y as Narrow,X as WholePage,De as __namedExportsOrder,G as default};