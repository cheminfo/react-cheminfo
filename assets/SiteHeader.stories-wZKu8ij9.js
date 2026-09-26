import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{a as t,i as n,o as r,r as i}from"./lookup-DaL5dO87.js";import{h as a,n as o}from"./iframe-C_0-xZ4H.js";import{n as ee,t as s}from"./useT-DdDrCs00.js";import{n as c,t as te}from"./Wordmark-BQOkdrH_.js";import{n as l,t as ne}from"./marks-B8lRDT-I.js";import{n as u,t as d}from"./CiteButton-BMYef7vo.js";import{r as f,t as p}from"./paper-DUTshqQY.js";import{n as m,t as h}from"./EcosystemButton-C45v5TEi.js";import{n as re}from"./navItem-6b8YIPQN.js";import{a as g,c as _,i as ie,l as v,o as ae,s as oe,t as y}from"./chromeFixtures-rLrXzL-q.js";import{n as b,t as x}from"./NavMenuButton-CETH-TQS.js";import{n as se,t as ce}from"./ShareButton-DVBr2Rzy.js";import{n as le,t as ue}from"./SiteFooter-DcFt87cO.js";function S(e){let{siteId:t,site:r,mark:i,nav:a,activeId:o,actions:s,renderNavItem:c,embedded:l=!1,homeHref:u=`/`,onHome:d,markSize:f=28,width:p=`page`,pagesLabel:m}=e,h=ee();if(l)return null;let g=r??(t===void 0?void 0:n(t));if(g===void 0)throw Error("SiteHeader needs one of its `site` and `siteId` props");return(0,w.jsx)(`header`,{className:`app-header no-print`,children:(0,w.jsxs)(`div`,{className:T[p],children:[(0,w.jsxs)(`a`,{className:`brand`,href:u,title:g.host,onClick:e=>{d===void 0||re(e)||(e.preventDefault(),d())},children:[i??(0,w.jsx)(ne,{site:g,size:f}),(0,w.jsx)(te,{site:g})]}),(0,w.jsx)(`nav`,{className:`app-header-nav`,children:a.map(e=>(0,w.jsx)(C.Fragment,{children:c===void 0?(0,w.jsx)(_,{item:e,active:e.id===o}):c(e,e.id===o)},e.id))}),a.length>1?(0,w.jsx)(`div`,{className:`app-header-nav-menu`,children:(0,w.jsx)(x,{label:m??h(`chrome.pages`),icon:`menu`,compact:!0,items:a,activeId:o})}):null,(0,w.jsx)(`span`,{className:`spacer`}),s===void 0?null:(0,w.jsx)(`div`,{className:`app-header-actions`,children:s})]})})}var C,w,T;function E(){return(E=e((()=>{C=a(),i(),c(),l(),s(),v(),b(),w=o(),T={page:`app-header__inner`,full:`app-header__inner app-header__inner--full`},S.__docgenInfo={description:`The bar every site of the family carries: the brand linking home at the left,
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
| 'inorganic'`,elements:[{name:`literal`,value:`'learn'`},{name:`literal`,value:`'inchi'`},{name:`literal`,value:`'vcl'`},{name:`literal`,value:`'smiles'`},{name:`literal`,value:`'openbabel'`},{name:`literal`,value:`'chemcalc'`},{name:`literal`,value:`'dbe'`},{name:`literal`,value:`'nmrium'`},{name:`literal`,value:`'metabo'`},{name:`literal`,value:`'derepflow'`},{name:`literal`,value:`'surge'`},{name:`literal`,value:`'tex'`},{name:`literal`,value:`'lcao'`},{name:`literal`,value:`'regexp'`},{name:`literal`,value:`'pdb'`},{name:`literal`,value:`'elucidation'`},{name:`literal`,value:`'equilibrium'`},{name:`literal`,value:`'polycarp'`},{name:`literal`,value:`'3d'`},{name:`literal`,value:`'periodic-table'`},{name:`literal`,value:`'database'`},{name:`literal`,value:`'symmetry'`},{name:`literal`,value:`'osiris'`},{name:`literal`,value:`'atoms'`},{name:`literal`,value:`'moles'`},{name:`literal`,value:`'inorganic'`}]},description:"The site the bar belongs to, which draws its mark and writes its name. One\nof `site` and `siteId` is required.\n@default undefined"},site:{required:!1,tsType:{name:`SiteRecord`},description:`The same site, passed rather than named — for a site that is deliberately
not one of \`ECOSYSTEM_SITES\`, and so is linked from no other site's menu.
@default undefined`},mark:{required:!1,tsType:{name:`ReactNode`},description:`The site's own mark, for a site the shared glyph set does not hold. It
stands where \`SiteMark\` would, at the size the site draws it.
@default undefined — the family's mark for that site`},nav:{required:!0,tsType:{name:`unknown`},description:`The pages, in the order the bar lists them.`},activeId:{required:!1,tsType:{name:`string`},description:"Which of the pages is on show, named by its `id`.\n@default undefined"},actions:{required:!1,tsType:{name:`ReactNode`},description:"The utilities pushed to the right edge — Cite, Tools, Share, sign in. They\narrive dressed as bar items, so a plain `nav-link` and a `CiteButton` read\nalike beside each other.\n@default undefined"},renderNavItem:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(item: NavItem, isActive: boolean) => ReactNode`,signature:{arguments:[{type:{name:`NavItem`},name:`item`},{type:{name:`boolean`},name:`isActive`}],return:{name:`ReactNode`}}},description:`Draws one page the site's own way, for a bar whose entries need a tooltip
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
@default the chrome's own word for it, in the language of the page`}}}})))()}function de(e,t={}){let{maxWidth:n=O}=t,r=(0,D.useCallback)(t=>pe(e?.current??null,t),[e]),i=(0,D.useCallback)(()=>fe(e?.current??null,n),[e,n]);return(0,D.useSyncExternalStore)(r,i,me)}function fe(e,t=O){let n=e===null?0:e.clientWidth,r=n>0?n:globalThis.innerWidth;return!Number.isFinite(r)||r<=0?!1:r<=t}function pe(e,t){if(e!==null&&typeof ResizeObserver==`function`){let n=new ResizeObserver(t);return n.observe(e),()=>n.disconnect()}return globalThis.addEventListener(`resize`,t),()=>globalThis.removeEventListener(`resize`,t)}function me(){return!1}var D,O;function k(){return(k=e((()=>{D=a(),O=1e3})))()}function A(e){return e.siteId??`smiles`}function he(e){let t=(0,N.useRef)(null),n=de(t,{maxWidth:640}),{nav:r,activeId:i}=e,a=A(e);return(0,P.jsx)(M,{siteId:a,children:(0,P.jsxs)(`div`,{style:{padding:`1.25rem`},children:[(0,P.jsx)(`div`,{ref:t,style:X,children:(0,P.jsx)(S,{...e,nav:n?[Z]:r,actions:(0,P.jsx)(j,{siteId:a,compact:n}),renderNavItem:n?()=>(0,P.jsx)(x,{label:`Pages`,icon:`menu`,items:r,activeId:i}):void 0})}),(0,P.jsxs)(`p`,{style:{...L,padding:`0.75rem 0 0`},children:[`useCompactHeader: `,(0,P.jsx)(`code`,{children:String(n)}),` — drag the right edge of the bar past 640 px.`]})]})})}function j(e){let{siteId:t,compact:n=!1}=e;return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(d,{reference:p,compact:n}),(0,P.jsx)(h,{currentSiteId:t,compact:n}),(0,P.jsx)(ce,{onClick:oe,compact:n})]})}function M(e){let t=n(e.siteId),r={"--brand":t.brand,"--brand-alt":t.brandAlt,"--accent":t.brand};return(0,P.jsx)(`div`,{style:r,children:e.children})}var N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{N=a(),v(),b(),le(),E(),k(),u(),i(),r(),m(),se(),ae(),f(),P=o(),F=t.map(e=>e.id),I=`
.sb-hovered {
  background: var(--surface-sunken);
  color: var(--text);
}`,L={padding:`0.75rem 1.25rem 0`,margin:0,color:`var(--text-muted)`,fontSize:`0.8125rem`},R={title:`Chrome/SiteHeader`,component:S,args:{siteId:`smiles`,nav:g,activeId:`draw`,markSize:28,homeHref:`/`,embedded:!1},argTypes:{siteId:{control:`select`,options:F},activeId:{control:`select`,options:g.map(e=>e.id)},markSize:{control:{type:`range`,min:16,max:48,step:2}},homeHref:{control:`text`},embedded:{control:`boolean`},nav:{control:!1},actions:{control:!1},renderNavItem:{control:!1},onHome:{control:!1}},parameters:{layout:`fullscreen`,docs:{description:{component:`The bar every site of the family carries: the brand linking home at the left, the pages next to it, and the utilities pushed to the right edge.`}}},render:e=>(0,P.jsx)(M,{siteId:A(e),children:(0,P.jsx)(S,{...e,actions:(0,P.jsx)(j,{siteId:A(e)})})})},z={},B={render:()=>(0,P.jsx)(`div`,{style:G,children:ie.map(e=>(0,P.jsx)(M,{siteId:e.siteId,children:(0,P.jsx)(S,{siteId:e.siteId,nav:e.nav,activeId:e.activeId,actions:(0,P.jsx)(j,{siteId:e.siteId})})},e.siteId))})},V={render:e=>(0,P.jsxs)(M,{siteId:A(e),children:[(0,P.jsx)(`style`,{children:I}),(0,P.jsx)(S,{...e,actions:(0,P.jsx)(j,{siteId:A(e)}),renderNavItem:(e,t)=>(0,P.jsx)(_,{item:e,active:t,className:e.id===`tutorial`?`sb-hovered`:void 0})}),(0,P.jsx)(`p`,{style:L,children:`Draw is the page on show; Tutorial is drawn as the pointer leaves it.`})]})},H={render:e=>(0,P.jsx)(he,{...e})},U={render:e=>(0,P.jsx)(M,{siteId:A(e),children:(0,P.jsxs)(`div`,{style:K,children:[(0,P.jsx)(S,{...e,actions:(0,P.jsx)(j,{siteId:A(e)})}),(0,P.jsx)(`main`,{style:q,children:(0,P.jsxs)(`div`,{style:J,children:[(0,P.jsx)(`h1`,{style:{margin:0,fontSize:`1.25rem`},children:y.name}),(0,P.jsxs)(`p`,{style:{margin:0,color:`var(--text-muted)`},children:[`Monoisotopic mass `,y.monoisotopicMass]}),(0,P.jsx)(`code`,{style:Y,children:y.smiles}),(0,P.jsx)(`code`,{style:Y,children:y.inchiKey})]})}),(0,P.jsx)(ue,{siteId:A(e),layout:`row`})]})})},W={render:e=>(0,P.jsxs)(M,{siteId:A(e),children:[(0,P.jsx)(S,{...e,actions:(0,P.jsx)(j,{siteId:A(e)})}),(0,P.jsxs)(`p`,{style:L,children:[`Above, the bar. Below, the same bar with `,(0,P.jsx)(`code`,{children:`embedded`}),`, which draws nothing.`]}),(0,P.jsx)(S,{...e,embedded:!0})]})},G={display:`flex`,minHeight:`100vh`,flexDirection:`column`,padding:`1.5rem`,background:`var(--surface-sunken)`,gap:`1.5rem`},K={display:`flex`,minHeight:`100vh`,flexDirection:`column`,background:`var(--surface-sunken)`},q={width:`100%`,maxWidth:`var(--page-max)`,flex:`1 1 auto`,padding:`1.5rem 1.25rem`,margin:`0 auto`},J={display:`flex`,maxWidth:`32rem`,flexDirection:`column`,padding:`1rem 1.25rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,gap:`0.5rem`},Y={overflowWrap:`anywhere`,fontSize:`0.8125rem`},X={overflow:`auto`,width:520,minWidth:320,maxWidth:`100%`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,resize:`horizontal`},Z={id:`pages`,label:`Pages`},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <div style={STACK_STYLE}>
      {SITE_BARS.map(bar => <SiteTokens key={bar.siteId} siteId={bar.siteId}>
          <SiteHeader siteId={bar.siteId} nav={bar.nav} activeId={bar.activeId} actions={<Utilities siteId={bar.siteId} />} />
        </SiteTokens>)}
    </div>
}`,...B.parameters?.docs?.source},description:{story:`The same bar on four sites, one under the other: the geometry, the type and
the neutrals never move — only the two colours and the pages do.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => <SiteTokens siteId={familySite(args)}>
      <style>{HOVER_RULE}</style>
      <SiteHeader {...args} actions={<Utilities siteId={familySite(args)} />} renderNavItem={(item, isActive) => <NavLink item={item} active={isActive} className={item.id === 'tutorial' ? 'sb-hovered' : undefined} />} />
      <p style={CAPTION_STYLE}>
        Draw is the page on show; Tutorial is drawn as the pointer leaves it.
      </p>
    </SiteTokens>
}`,...V.parameters?.docs?.source},description:{story:`The page on show, in the brand tint, beside a page under the pointer: the
hover is the neutral wash, so it never impersonates where you are.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: args => <NarrowBar {...args} />
}`,...H.parameters?.docs?.source},description:{story:`A bar with no room left: \`useCompactHeader\` measures the bar itself, so the
utilities give up their labels and the pages fold into one menu rather than
being pushed off the edge. Drag the right edge to widen it.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: args => <SiteTokens siteId={familySite(args)}>
      <div style={PAGE_STYLE}>
        <SiteHeader {...args} actions={<Utilities siteId={familySite(args)} />} />
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
}`,...U.parameters?.docs?.source},description:{story:`Header, page and footer together — the whole chrome a site imports.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => <SiteTokens siteId={familySite(args)}>
      <SiteHeader {...args} actions={<Utilities siteId={familySite(args)} />} />
      <p style={CAPTION_STYLE}>
        Above, the bar. Below, the same bar with <code>embedded</code>, which
        draws nothing.
      </p>
      <SiteHeader {...args} embedded />
    </SiteTokens>
}`,...W.parameters?.docs?.source},description:{story:`A framed page is given no bar at all: what frames it carries its own.`,...W.parameters?.docs?.description}}},Q=[`Default`,`EverySite`,`ActiveAndHovered`,`Narrow`,`WholePage`,`Embedded`]})))()}$();export{V as ActiveAndHovered,z as Default,W as Embedded,B as EverySite,H as Narrow,U as WholePage,Q as __namedExportsOrder,R as default};