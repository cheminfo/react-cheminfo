import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{i as t,r as n}from"./lookup-attq9aNX.js";import{n as r}from"./iframe-BfDMxkta.js";import{n as i,t as a}from"./useT-4S5aAz4G.js";import{n as o,t as s}from"./tooltip-DEQjlStQ.js";import{a as c,i as ee,n as l,r as u}from"./credits-DiSzmHLb.js";import{n as te,t as ne}from"./Wordmark-CQk30Jg4.js";import{n as re,t as ie}from"./marks-DrtREAYS.js";import{n as ae,r as oe}from"./platformPaper-CblS0mux.js";import{n as se,t as ce}from"./CiteButton-BjOydIOq.js";import{n as le}from"./navItem-6b8YIPQN.js";import{n as ue,t as de}from"./SiteTheme-Cnrc7k7H.js";function d(e){let t=e?.version;if(t!==void 0&&t!==`0.0.0`)return t}function f(e){let t=d(e);if(t!==void 0)return t;let n=e?.commit;return n===void 0?void 0:pe(n)}function fe(e){return`${e.slice(0,ge).replace(`T`,` `)} UTC`}function pe(e){return e.slice(0,he)}function me(e){return`${e.slice(0,_e).replace(`T`,` `)} UTC`}var he,ge,_e;function p(){return(p=e((()=>{he=7,ge=16,_e=19})))()}function ve(e){let t=[];for(let n of e){let e=ye.find(e=>e.id===n);if(e===void 0)throw Error(`unknown provider: ${n}`);t.push(e)}return t}var ye;function be(){return(be=e((()=>{ye=[{id:`epfl`,name:`EPFL`,fullName:`École polytechnique fédérale de Lausanne`,href:`https://www.epfl.ch`,location:`Lausanne, Switzerland`}]})))()}function xe(e){return{site:typeof e.siteId==`string`?t(e.siteId):e.siteId,what:e.what,paragraphs:e.paragraphs??[],can:e.can,credits:l(e.credits),cite:e.cite??[],people:e.people??[],providedBy:ve(e.providedBy??[]),build:e.build}}function m(){return(m=e((()=>{u(),n(),be()})))()}function h(e){let{works:t}=e,n=i();return(0,g.jsx)(`div`,{className:`about-citations`,style:_,children:t.map(e=>(0,g.jsxs)(`div`,{className:`about-citation`,children:[(0,g.jsx)(`div`,{style:v,children:e.what}),e.note===void 0?null:(0,g.jsx)(`p`,{style:y,children:e.note}),(0,g.jsx)(ce,{reference:e.reference,label:n(`about.citeWork`,{what:e.what}),placement:`bottom-start`})]},e.reference.doi))})}var g,_,v,y;function b(){return(b=e((()=>{se(),a(),g=r(),_={display:`flex`,flexDirection:`column`,gap:14},v={fontWeight:600},y={margin:`2px 0 6px`,color:`var(--text-muted)`,fontSize:13},h.__docgenInfo={description:`What to cite, and what citing each work credits: a reader handed two
references has to be told which is which before they can pick one. Each
work is cited through the shared Cite button, so the page offers the same
article link, styles and reference-manager files as the header does.
@param props - See {@link AboutCitationsProps}.
@returns The works, each with its Cite button.`,methods:[],displayName:`AboutCitations`,props:{works:{required:!0,tsType:{name:`unknown`},description:`The works the site asks for, in the order it names them.`}}}})))()}function x(e){let{people:t,providers:n}=e,r=i(),a=t.filter(e=>e.role!==void 0);return(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`div`,{style:C,children:[n.map(e=>(0,S.jsx)(`a`,{href:e.href,target:`_blank`,rel:`noopener noreferrer`,title:e.fullName,style:w,children:(0,S.jsx)(Ce,{provider:e})},e.id)),(0,S.jsxs)(`div`,{style:n.length===0?T:E,children:[t.length===0?null:(0,S.jsx)(`p`,{style:D,children:Se(t,r)}),n.map(e=>(0,S.jsxs)(`p`,{style:O,children:[e.fullName,(0,S.jsx)(`span`,{style:k,children:e.location})]},e.id))]})]}),a.length===0?null:(0,S.jsx)(`ul`,{style:A,children:a.map(e=>(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`strong`,{children:e.name}),` — `,e.role]},e.name))})]})}function Se(e,t){let n=e.map(e=>e.name);return n.length<2?n.join(``):t(`about.nameList`,{names:n.slice(0,-1).join(`, `),last:n.at(-1)??``})}function Ce(e){let{provider:t}=e,n=`${t.name} — ${t.fullName}`;switch(t.id){case`epfl`:return(0,S.jsx)(we,{label:n});default:return(0,S.jsx)(`span`,{children:t.name})}}function we(e){return(0,S.jsx)(`svg`,{width:112,height:5936/182.4,viewBox:`0 0 182.4 53`,role:`img`,"aria-label":e.label,style:{display:`block`},children:(0,S.jsxs)(`g`,{fill:`red`,children:[(0,S.jsx)(`polygon`,{points:`0 21.6 11.43 21.6 11.43 9.8 38.34 9.8 38.34 0 0 0 0 21.6`}),(0,S.jsx)(`polygon`,{points:`0 53 38.34 53 38.34 43.2 11.43 43.2 11.43 31.4 0 31.4 0 53`}),(0,S.jsx)(`rect`,{x:`11.43`,y:`21.6`,width:`24.61`,height:`9.8`}),(0,S.jsx)(`path`,{d:`M86,4.87a16.12,16.12,0,0,0-5.68-3.53A23.76,23.76,0,0,0,71.82,0H48.14V53H59.57V31.4H71.82a23.76,23.76,0,0,0,8.46-1.34A16.12,16.12,0,0,0,86,26.53a13.43,13.43,0,0,0,3.19-5,17.38,17.38,0,0,0,0-11.62A13.52,13.52,0,0,0,86,4.87ZM78,18.73a5.7,5.7,0,0,1-2.26,1.8,11.33,11.33,0,0,1-3.27.85,32,32,0,0,1-3.86.22H59.57V9.8h9.05a32,32,0,0,1,3.86.22,11,11,0,0,1,3.27.86A5.59,5.59,0,0,1,78,12.67a5,5,0,0,1,.86,3A5,5,0,0,1,78,18.73Z`}),(0,S.jsx)(`polygon`,{points:`155.47 43.2 155.47 0 144.04 0 144.04 53 182.38 53 182.38 43.2 155.47 43.2`}),(0,S.jsx)(`polygon`,{points:`97.42 21.6 108.85 21.6 108.85 9.8 135.76 9.8 135.76 0 97.42 0 97.42 21.6`}),(0,S.jsx)(`rect`,{x:`97.42`,y:`31.4`,width:`11.43`,height:`21.6`}),(0,S.jsx)(`rect`,{x:`108.85`,y:`21.6`,width:`24.61`,height:`9.8`})]})})}var S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{a(),S=r(),C={display:`flex`,flexWrap:`wrap`,alignItems:`center`,gap:20},w={flex:`0 0 auto`,display:`inline-block`,background:`white`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,padding:`14px 18px`},T={flex:`1 1 14rem`,minWidth:0},E={...T,borderLeft:`3px solid var(--accent)`,paddingLeft:16},D={margin:0,color:`var(--text)`,fontSize:19,fontWeight:600,lineHeight:1.3},O={margin:`4px 0 0`,color:`var(--text-muted)`,fontSize:14,lineHeight:1.4},k={display:`block`,color:`var(--text-faint)`,fontSize:13},A={margin:`16px 0 0`,paddingTop:12,paddingLeft:20,borderTop:`1px solid var(--border)`},x.__docgenInfo={description:`The lockup of who provides a site: the institution's logo, then the names
and the institution they work at, and under it what each one contributed
when the site says so.
@param props - See {@link AboutProvidedByProps}.
@returns The lockup.`,methods:[],displayName:`AboutProvidedBy`,props:{people:{required:!0,tsType:{name:`unknown`},description:`Who provides the site, in display order.`},providers:{required:!0,tsType:{name:`unknown`},description:`The institutions providing the site, drawn as linked logos.`}}}})))()}function M(e){let{title:t,className:n,children:r}=e;return(0,N.jsxs)(`section`,{className:n===void 0?`about-section`:`about-section ${n}`,style:P,children:[t===void 0?null:(0,N.jsx)(`h2`,{style:F,children:t}),r]})}var N,P,F;function Te(){return(Te=e((()=>{N=r(),P={padding:16,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,breakInside:`avoid`,lineHeight:1.55},F={margin:`0 0 8px`,color:`var(--accent)`,fontSize:16,fontWeight:600},M.__docgenInfo={description:`One block of the About page: a heading and what sits under it, on the
family's own surface rather than on a component library's card.
@param props - See {@link AboutSectionProps}.
@returns The section.`,methods:[],displayName:`AboutSection`,props:{title:{required:!1,tsType:{name:`string`},description:`What the section is called, written as its heading.
@default undefined — the section carries no heading`},className:{required:!1,tsType:{name:`string`},description:"Class the section carries, in addition to `about-section`.\n@default undefined"},children:{required:!0,tsType:{name:`ReactNode`},description:`What the section holds.`}}}})))()}function Ee(e){let{href:t,onSignIn:n,label:r}=e,a=i(),o=r??a(`account.signIn`);return t===void 0?(0,I.jsx)(`button`,{type:`button`,className:`about-sign-in`,onClick:n,children:o}):(0,I.jsx)(`a`,{className:`about-sign-in`,href:t,onClick:e=>{n===void 0||le(e)||(e.preventDefault(),n())},children:o})}var I;function L(){return(L=e((()=>{a(),I=r(),Ee.__docgenInfo={description:`Where the people who run a site sign in: one quiet line under the build
badge, in the corner of the About.

A visitor has nothing to sign in to, so the bar carries no invitation; the
About is the page the operators already know, and the corner is where they
already look for the build they run.
@param props - See {@link AboutSignInProps}.
@returns The entry.`,methods:[],displayName:`AboutSignIn`,props:{href:{required:!1,tsType:{name:`string`},description:`The address signing in happens at. Writing it keeps the entry a real link,
so a middle click opens a tab.
@default undefined`},onSignIn:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`What the site does when the entry is picked — route to that page, or open
a credentials dialog for a site that has no page. A modified click is left
to the browser.
@default undefined`},label:{required:!1,tsType:{name:`string`},description:`What the entry reads, for a site whose accounts are for one kind of person.
@default the chrome's own word for it, in the language of the page`}}}})))()}function De(e){let{build:t,version:n}=e,r=i();return(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(`div`,{className:`build-tooltip__header`,children:r(`about.buildVersion`,{version:n})}),(0,R.jsxs)(`dl`,{className:`build-tooltip__rows`,children:[(0,R.jsx)(`dt`,{children:r(`about.buildBuilt`)}),(0,R.jsx)(`dd`,{children:me(t.builtAt)}),t.commit===void 0?null:(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(`dt`,{children:r(`about.buildCommit`)}),(0,R.jsx)(`dd`,{children:pe(t.commit)})]}),t.reactCheminfo===void 0?null:(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(`dt`,{children:`react-cheminfo`}),(0,R.jsx)(`dd`,{children:t.reactCheminfo})]})]})]})}var R;function Oe(){return(Oe=e((()=>{p(),a(),R=r(),De.__docgenInfo={description:`What the badge of a release leaves to its hover: the commit it was built
from, the instant to the second, and the chrome it was built against.
@param props - The build and its released version.
@param props.build - What the build published about itself.
@param props.version - The release the badge names.
@returns The card's contents.`,methods:[],displayName:`AboutBuildDetails`,props:{build:{required:!0,tsType:{name:`BuildInfo`},description:``},version:{required:!0,tsType:{name:`string`},description:``}}}})))()}function ke(e){let{build:t}=e,n=f(t);if(t===void 0||n===void 0)return null;let r=`${n} · ${fe(t.builtAt)}`,i=d(t);return i===void 0?(0,z.jsx)(`span`,{style:B,className:`about-version`,children:r}):(0,z.jsx)(s,{content:(0,z.jsx)(De,{build:t,version:i}),placement:`left-start`,popoverClassName:`help-tooltip build-tooltip`,hoverOpenDelay:150,children:(0,z.jsx)(`span`,{style:B,className:`about-version`,tabIndex:0,children:r})})}var z,B;function Ae(){return(Ae=e((()=>{o(),p(),Oe(),z=r(),B={flex:`0 0 auto`,fontFamily:`var(--font-mono, ui-monospace, monospace)`,fontSize:13,color:`var(--text-muted)`,whiteSpace:`nowrap`},ke.__docgenInfo={description:`The build badge: the release a site is serving, or the commit it was built
from while it has no release yet, and when it was made. A release names its
commit and the exact instant in the card its hover opens.
@param props - See {@link AboutVersionProps}.
@returns The badge, or \`null\` when the build says nothing worth showing.`,methods:[],displayName:`AboutVersion`,props:{build:{required:!0,tsType:{name:`union`,raw:`BuildInfo | undefined`,elements:[{name:`BuildInfo`},{name:`undefined`}]},description:"What the build published about itself, or `undefined` when it published none."}}}})))()}function V(e){let{content:t,className:n,children:r,logo:a,mark:o,signIn:s}=e,c=i(),l=xe(t),u=l.site,te=f(l.build)!==void 0||s!==void 0;return(0,H.jsxs)(`div`,{className:n===void 0?`about-page`:`about-page ${n}`,style:je,children:[(0,H.jsxs)(`header`,{className:`about-hero`,style:Ne,children:[a===void 0?o??(0,H.jsx)(ie,{site:u,size:56}):null,(0,H.jsxs)(`div`,{style:Me,children:[(0,H.jsx)(`h1`,{style:a===void 0?Fe:Ie,children:a??(0,H.jsx)(ne,{site:u,size:26})}),(0,H.jsx)(`p`,{style:Le,children:c.or(`site.${u.id}.tagline`,u.tagline)}),(0,H.jsx)(`p`,{style:Re,children:l.what})]}),te?(0,H.jsxs)(`div`,{className:`about-corner`,style:Pe,children:[(0,H.jsx)(ke,{build:l.build}),s===void 0?null:(0,H.jsx)(Ee,{...s})]}):null]}),l.people.length===0&&l.providedBy.length===0?null:(0,H.jsx)(M,{title:c(`about.providedBy`),className:`about-provided-by`,children:(0,H.jsx)(x,{people:l.people,providers:l.providedBy})}),(0,H.jsx)(M,{title:c(`about.whatYouCanDo`),className:`about-can`,children:(0,H.jsx)(`ul`,{style:ze,children:l.can.map(e=>(0,H.jsx)(`li`,{children:e},e))})}),l.paragraphs.length===0?null:(0,H.jsx)(M,{className:`about-context`,children:l.paragraphs.map((e,t)=>(0,H.jsx)(`p`,{style:t===0?Be:Ve,children:e},e))}),r,(0,H.jsx)(M,{title:c(`about.builtOn`),className:`about-credits`,children:(0,H.jsx)(ee,{entries:l.credits})}),l.cite.length===0?null:(0,H.jsx)(M,{title:c(`about.howToCite`),className:`about-cite`,children:(0,H.jsx)(h,{works:l.cite})})]})}var H,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze,Be,Ve;function He(){return(He=e((()=>{p(),c(),te(),re(),a(),m(),b(),j(),Te(),L(),Ae(),H=r(),je={display:`flex`,flexDirection:`column`,maxWidth:980,marginInline:`auto`,gap:10},Me={flex:`1 1 auto`,minWidth:0},Ne={display:`flex`,alignItems:`flex-start`,padding:16,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,gap:16,lineHeight:1.55},Pe={display:`flex`,flex:`0 0 auto`,flexDirection:`column`,alignItems:`flex-end`,gap:2},Fe={margin:0,fontSize:26,fontWeight:700},Ie={margin:`0 0 4px`},Le={margin:`2px 0 8px`,color:`var(--text-muted)`,fontSize:14},Re={margin:0},ze={margin:0,paddingLeft:20},Be={margin:0},Ve={margin:`8px 0 0`},V.__docgenInfo={description:`The About page of a site of the family: what the tool is, who provides it,
what a visitor can do with it, what it is built on, and how to cite it —
always in that order.

The order is the point. A reader who has read one of our About pages knows
where the credits are on the other thirteen, and a site that writes its own
page is a site that will forget one of these sections.
@param props - See {@link AboutPageProps}.
@returns The page.
@throws {Error} When the record names a site or a credit that does not exist.`,methods:[],displayName:`AboutPage`,props:{content:{required:!0,tsType:{name:`AboutContent`},description:`What the site says about itself.`},className:{required:!1,tsType:{name:`string`},description:"Class the page carries, in addition to `about-page`.\n@default undefined"},children:{required:!1,tsType:{name:`ReactNode`},description:`The one section a site adds of its own — where its numbers come from, the
limitation it wants named. It lands under the context paragraphs, so the
credits, the citation and the licence keep the place a reader expects.
@default undefined`},mark:{required:!1,tsType:{name:`ReactNode`},description:"The site's own mark, for a site the shared glyph set does not hold —\none that is deliberately not listed in `ECOSYSTEM_SITES`. It stands where\n`SiteMark` would, and the hero is otherwise unchanged.\n@default undefined — the family's mark for that site"},logo:{required:!1,tsType:{name:`ReactNode`},description:`The site's own drawn lockup, for a site that has one. It stands in the
hero in place of the mark and the written name, above the tagline, and
must therefore carry the name itself. Anything else about the hero stays
where a reader of our other About pages expects it.
@default undefined`},signIn:{required:!1,tsType:{name:`AboutSignInProps`},description:`Where the people who run the site sign in, drawn under the build badge in
the corner of the hero. A site passes it while nobody is signed in, and
leaves it out once somebody is: the account is then in the bar.
@default undefined — the site has no account to sign in to`}}}})))()}var U,W,G,Ue,K,q,J,Y,X,Z,Q,We;function $(){return($=e((()=>{He(),oe(),ue(),U=r(),W={siteId:`smiles`,what:`Draw a structure and read its SMILES, or write SMILES and see the structure.`,can:[`Convert in both directions, in the browser.`,`Search a library by substructure.`,`Learn the notation from the tutorial and its exercises.`,`Share a structure as a link, or embed it in a course.`],credits:[`openchemlib`,`react-ocl`,`blueprint`,`react`,`vite`]},G={...W,cite:[ae],build:{version:`1.4.0`,builtAt:`2026-09-16T09:41:07Z`,commit:`a1b2c3d4e5f60718293a4b5c6d7e8f9012345678`}},Ue={title:`About/AboutPage`,component:V,args:{content:W},parameters:{layout:`fullscreen`,docs:{description:{component:`The About every site of the family shows at /about: the same sections, in the same order, from a record the site writes and a registry it does not.`}}},render:e=>(0,U.jsxs)(`div`,{style:{background:`var(--surface-sunken)`,padding:24},children:[(0,U.jsx)(de,{siteId:`smiles`}),(0,U.jsx)(V,{...e})]})},K={},q={args:{content:G}},J={args:{content:G,signIn:{href:`/admin`}}},Y={args:{content:{...G,build:{version:`0.0.0`,builtAt:`2026-09-16T09:41:07Z`,commit:`a1b2c3d4e5f60718293a4b5c6d7e8f9012345678`}}}},X={args:{content:{...G,people:[{name:`Luc Patiny`}],providedBy:[`epfl`]}}},Z={args:{content:{...G,people:[{name:`Daniel Kostro`,role:`wrote the solver every page runs on.`},{name:`Luc Patiny`,role:`maintains the tooling and the data.`}],providedBy:[`epfl`]}}},Q={args:{content:{...W,siteId:`regexp`,what:`Learn regular expressions by writing them against live text.`,can:[`Test a pattern against your own text, as you type.`,`Walk the tutorial, then solve the exercises.`,`Look a construct up on the cheatsheet.`],credits:[`blueprint`,`react`,`vite`]}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    content: CITED
  }
}`,...q.parameters?.docs?.source},description:{story:`A site with a paper of its own, and a version it knows.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    content: CITED,
    signIn: {
      href: '/admin'
    }
  }
}`,...J.parameters?.docs?.source},description:{story:`A site with accounts: signing in starts under the version, never in the bar.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    content: {
      ...CITED,
      build: {
        version: '0.0.0',
        builtAt: '2026-09-16T09:41:07Z',
        commit: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678'
      }
    }
  }
}`,...Y.parameters?.docs?.source},description:{story:`A site with no release yet is named by the commit it was built from.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    content: {
      ...CITED,
      people: [{
        name: 'Luc Patiny'
      }],
      providedBy: ['epfl']
    }
  }
}`,...X.parameters?.docs?.source},description:{story:`A site provided by one person at EPFL.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    content: {
      ...CITED,
      people: [{
        name: 'Daniel Kostro',
        role: 'wrote the solver every page runs on.'
      }, {
        name: 'Luc Patiny',
        role: 'maintains the tooling and the data.'
      }],
      providedBy: ['epfl']
    }
  }
}`,...Z.parameters?.docs?.source},description:{story:`Several people, each with the one line they contributed.`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    content: {
      ...SMILES,
      siteId: 'regexp',
      what: 'Learn regular expressions by writing them against live text.',
      can: ['Test a pattern against your own text, as you type.', 'Walk the tutorial, then solve the exercises.', 'Look a construct up on the cheatsheet.'],
      credits: ['blueprint', 'react', 'vite']
    }
  }
}`,...Q.parameters?.docs?.source},description:{story:`Another site, to show that only the two colours and the words change.`,...Q.parameters?.docs?.description}}},We=[`Default`,`WithCitation`,`WithSignIn`,`NeverReleased`,`ProvidedBy`,`ProvidedByATeam`,`AnotherSite`]})))()}$();export{Q as AnotherSite,K as Default,Y as NeverReleased,X as ProvidedBy,Z as ProvidedByATeam,q as WithCitation,J as WithSignIn,We as __namedExportsOrder,Ue as default};