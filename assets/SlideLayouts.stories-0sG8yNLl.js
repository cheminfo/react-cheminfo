const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./MoleculeGrid-BQUeVwkw.js","./rolldown-runtime-C0FnF6B9.js","./iframe-aRVavQD_.js","./preload-helper-BHmFeTtP.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./lookup-C9yAJC0b.js","./languageParam-dyZ4WZE3.js","./iframe-DCeCgLga.css","./openchemlib-um1Sd8xk.js","./useT-BORbKjvp.js","./languages-BRg0bq_H.js","./lib-FmB2i3eC.js","./floating-ui.react-dom-CMJh5yWp.js","./react-dom-sEILlHQf.js","./emotion-styled.browser.esm-CgWdOn85.js","./extends-D4puxXF7.js"])))=>i.map(i=>d[i]);
import{n as e,r as t}from"./rolldown-runtime-C0FnF6B9.js";import{n,t as r}from"./preload-helper-BHmFeTtP.js";import{h as i,n as a}from"./iframe-aRVavQD_.js";import{n as o,t as s}from"./useT-BORbKjvp.js";import{n as c}from"./joinClassNames-BbK_6p9Z.js";import{_ as l,a as u,c as d,d as f,f as p,g as ee,h as te,i as m,l as ne,m as h,n as re,o as g,p as _,r as ie,s as v,t as y,u as b}from"./Slideshow-B9Tps4VN.js";import"./slides-UXgU1z5v.js";function x(e){let t=[];for(let n of(e??``).split(`
`)){let e=n.trim().split(/\s+/),r=e.pop()??``;if(r!==``&&(t.push({label:e.join(` `),smiles:r}),t.length===6))break}return t}function ae(e){return e<=3?{columns:Math.max(1,e),rows:1}:e===4?{columns:2,rows:2}:{columns:3,rows:2}}function S(){return(S=e((()=>{})))()}function C(e){let t=e.trim();if(!t.startsWith(`#`))return{heading:``,rest:t};let n=t.indexOf(`
`);return n===-1?{heading:t,rest:``}:{heading:t.slice(0,n).trim(),rest:t.slice(n+1).trim()}}function w(){return(w=e((()=>{})))()}function T(e){let{body:t,figure:n,placement:r=`side`,slide:i,renderLink:a,talkOrigin:o}=e,{body:s,demos:c}=p(t),{heading:l,rest:d}=C(s),f=b(e);return(0,O.jsx)(`div`,{className:`slide slide--content figure-slide figure-slide--${r}`,"data-layout":i.layout,children:(0,O.jsxs)(`div`,{className:`slide-content`,children:[l===``?null:(0,O.jsx)(v,{body:l,origin:f,renderLink:a}),(0,O.jsxs)(`div`,{className:`figure-slide__body`,children:[d===``?null:(0,O.jsx)(`div`,{className:`figure-slide__text`,children:(0,O.jsx)(v,{body:d,origin:f,renderLink:a})}),(0,O.jsx)(`div`,{className:`figure-slide__figure`,children:n})]}),(0,O.jsx)(u,{demos:c,origin:f,renderLink:a,talkOrigin:o})]})})}function E(e){return(0,O.jsx)(`p`,{className:`chem-figure-message`,children:e.children})}function D(){return(0,O.jsx)(`div`,{className:`chem-figure-loading`,"aria-busy":`true`})}var O;function k(){return(k=e((()=>{f(),w(),ne(),d(),g(),O=a(),T.__docgenInfo={description:`The frame a site's figure layout draws in: the slide's heading pinned at the
top as on any content slide, then its text and the figure — side by side, or
the figure under the text — and the demo links the slide ends on. A
registered layout draws itself whole, so this repeats around a figure what
the player's own content slide does around a body.
@param props - See {@link FigureSlideProps}.
@returns The slide.`,methods:[],displayName:`FigureSlide`,props:{slide:{required:!0,tsType:{name:`SlideData`},description:`The slide to draw.`},talkId:{required:!0,tsType:{name:`string`},description:`How the publishing site names the talk in its addresses.`},slideIndex:{required:!0,tsType:{name:`number`},description:`Which slide of the talk this is, zero-based.`},site:{required:!1,tsType:{name:`string`},description:`Which site published the deck, written into the way back.
@default undefined — the site playing it`},talkOrigin:{required:!1,tsType:{name:`string`},description:`Where the publishing site lives, which a relative address in the deck is
resolved against.
@default undefined — the addresses are this site's own`},meta:{required:!0,tsType:{name:`TalkMeta`},description:`What the talk's front-matter said, for a layout that draws from it.`},renderLink:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(link: {
  /** The address the link opens, \`from\` parameter included. */
  href: string;
  /** What the link reads. */
  children: ReactNode;
}) => ReactElement`,signature:{arguments:[{type:{name:`signature`,type:`object`,raw:`{
  /** The address the link opens, \`from\` parameter included. */
  href: string;
  /** What the link reads. */
  children: ReactNode;
}`,signature:{properties:[{key:`href`,value:{name:`string`,required:!0},description:"The address the link opens, `from` parameter included."},{key:`children`,value:{name:`ReactNode`,required:!0},description:`What the link reads.`}]}},name:`link`}],return:{name:`ReactElement`}}},description:`The site's own link, used for the in-app links of the slide.
@default undefined — a plain anchor`},step:{required:!1,tsType:{name:`number`},description:`The step on show, on a slide walked one step at a time.
@default 0`},onStep:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(step: number) => void`,signature:{arguments:[{type:{name:`number`},name:`step`}],return:{name:`void`}}},description:`Called with the step to show, from a click on one of the slide's steps.
@default undefined — the steps are not clickable`},body:{required:!0,tsType:{name:`string`},description:`The slide's Markdown, the figure's marker already taken out.`},figure:{required:!0,tsType:{name:`ReactNode`},description:`What the layout draws beside the text.`},placement:{required:!1,tsType:{name:`union`,raw:`'side' | 'below'`,elements:[{name:`literal`,value:`'side'`},{name:`literal`,value:`'below'`}]},description:`Where the figure sits: beside the text, or under it across the slide.
@default 'side'`}}},E.__docgenInfo={description:`What a figure slide shows in place of its figure when the marker asks for
something that does not exist: the deck's author reads it while rehearsing
and fixes the marker.
@param props - See {@link FigureMessageProps}.
@returns The message.`,methods:[],displayName:`FigureMessage`,props:{children:{required:!0,tsType:{name:`ReactNode`},description:`The message.`}}},D.__docgenInfo={description:`What a figure slide shows while the code drawing its figure loads: an empty
box the size of the figure, so the text beside it does not move.
@returns The box.`,methods:[],displayName:`FigureLoading`}})))()}function A(e){let t=o(),{value:n,body:r}=te(e.slide.body,`molecules`),i=(0,j.useMemo)(()=>x(n),[n]),a=i.length===0?(0,M.jsx)(E,{children:t(`slides.listMolecules`)}):(0,M.jsx)(j.Suspense,{fallback:(0,M.jsx)(D,{}),children:(0,M.jsx)(N,{molecules:i})});return(0,M.jsx)(T,{...e,body:r,figure:a})}var j,M,N;function P(){return(P=e((()=>{j=i(),s(),S(),_(),k(),M=a(),n(),N=(0,j.lazy)(async()=>{let{MoleculeGrid:e}=await r(async()=>{let{MoleculeGrid:e}=await import(`./MoleculeGrid-BQUeVwkw.js`);return{MoleculeGrid:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]),import.meta.url);return{default:e}}),A.__docgenInfo={description:"The `molecules` layout: the slide's text beside up to six structures, each\nover its name, listed one per line in a `<!-- molecules: … -->` marker as\n`<name> <SMILES>`. Every structure of a slide is drawn with one bond length,\nso their sizes compare as the molecules' do.\n@param props - The slide, as the player hands it to every layout.\n@returns The slide.",methods:[],displayName:`MoleculesSlide`,props:{slide:{required:!0,tsType:{name:`SlideData`},description:`The slide to draw.`},talkId:{required:!0,tsType:{name:`string`},description:`How the publishing site names the talk in its addresses.`},slideIndex:{required:!0,tsType:{name:`number`},description:`Which slide of the talk this is, zero-based.`},site:{required:!1,tsType:{name:`string`},description:`Which site published the deck, written into the way back.
@default undefined — the site playing it`},talkOrigin:{required:!1,tsType:{name:`string`},description:`Where the publishing site lives, which a relative address in the deck is
resolved against.
@default undefined — the addresses are this site's own`},meta:{required:!0,tsType:{name:`TalkMeta`},description:`What the talk's front-matter said, for a layout that draws from it.`},renderLink:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(link: {
  /** The address the link opens, \`from\` parameter included. */
  href: string;
  /** What the link reads. */
  children: ReactNode;
}) => ReactElement`,signature:{arguments:[{type:{name:`signature`,type:`object`,raw:`{
  /** The address the link opens, \`from\` parameter included. */
  href: string;
  /** What the link reads. */
  children: ReactNode;
}`,signature:{properties:[{key:`href`,value:{name:`string`,required:!0},description:"The address the link opens, `from` parameter included."},{key:`children`,value:{name:`ReactNode`,required:!0},description:`What the link reads.`}]}},name:`link`}],return:{name:`ReactElement`}}},description:`The site's own link, used for the in-app links of the slide.
@default undefined — a plain anchor`},step:{required:!1,tsType:{name:`number`},description:`The step on show, on a slide walked one step at a time.
@default 0`},onStep:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(step: number) => void`,signature:{arguments:[{type:{name:`number`},name:`step`}],return:{name:`void`}}},description:`Called with the step to show, from a click on one of the slide's steps.
@default undefined — the steps are not clickable`}}}})))()}function F(e){let{glyphs:t,id:n,place:r=`corner`,className:i}=e,a=Object.hasOwn(t,n)?t[n]:void 0;return a===void 0?null:(0,I.jsx)(`svg`,{className:c(`slide-glyph`,`slide-glyph--${r}`,`keep-motion`,i,i!==void 0&&`${i}--${r}`),viewBox:`0 0 620 240`,"aria-hidden":`true`,children:(0,I.jsx)(a,{})})}var I;function L(){return(L=e((()=>{I=a(),F.__docgenInfo={description:`The cartoon a slide asks for, on a 620 × 240 canvas. A name nothing answers
draws nothing: a deck is written before the site knows how to draw it, and a
talk must never fail to open in front of a room.
@param props - See {@link SlideGlyphProps}.
@returns The drawing, or \`null\`.`,methods:[],displayName:`SlideGlyph`,props:{glyphs:{required:!0,tsType:{name:`Readonly`,elements:[{name:`Record`,elements:[{name:`string`},{name:`ComponentType`}],raw:`Record<string, ComponentType>`}],raw:`Readonly<Record<string, ComponentType>>`},description:`The cartoons the site draws.`},id:{required:!0,tsType:{name:`string`},description:`The name the slide wrote.`},place:{required:!1,tsType:{name:`union`,raw:`'corner' | 'figure'`,elements:[{name:`literal`,value:`'corner'`},{name:`literal`,value:`'figure'`}]},description:`How the drawing sits on the slide: in the corner of a divider, or as the
figure the slide is about.
@default 'corner'`},className:{required:!1,tsType:{name:`string`},description:`The site's own class, which its drawings' colours and motion hang off; the
drawing also carries it suffixed with \`--<place>\`.
@default undefined`}}}})))()}function R(e,t={}){let{className:n}=t;function r(t){let{glyph:r,body:i}=h(t.slide.body);return(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(ie,{body:i}),(0,z.jsx)(F,{glyphs:e,id:r,className:n})]})}return r}var z;function B(){return(B=e((()=>{_(),m(),L(),z=a()})))()}var V=t({ClosingSlide:()=>Z,Molecules:()=>X,SectionWithACartoon:()=>Y,__namedExportsOrder:()=>Q,default:()=>J});function H(){return(0,G.jsx)(`circle`,{cx:310,cy:120,r:96,fill:`none`,stroke:`var(--accent)`,strokeWidth:8})}function U(e){let[t,n]=(0,W.useState)(e.index);return(0,G.jsx)(`div`,{style:{height:`100vh`},children:(0,G.jsx)(y,{...e,index:t,onIndex:n})})}var W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{W=i(),ee(),P(),re(),B(),G=a(),K=l(`---
title: Two stimulants
event: Pharmacology, week 5
---

# Two stimulants

---

<!-- layout: section -->

<!-- glyph: ring -->

# 1 · The ring they share

---

<!-- layout: molecules -->

## Two stimulants

- one blocks a transporter
- one blocks a receptor

<!-- molecules:
Cocaine CN1[C@H]2CC[C@@H]1[C@H]([C@H](C2)OC(=O)c1ccccc1)C(=O)OC
Caffeine Cn1cnc2c1c(=O)n(C)c(=O)n2C
-->

---

<!-- layout: end -->

# What you can do now

- Draw both structures
- Find the ring they share
- Name the target of each

<!-- sites: draw, nmr -->
`),q={section:R({ring:H}),molecules:A},J={title:`Slides/Layouts`,component:y,args:{talk:K,index:1,onIndex:()=>void 0,talkId:`week-5`,layouts:q},parameters:{layout:`fullscreen`,docs:{description:{component:`The layouts a site takes from the library: a section divider with the cartoon its marker names, structures over their names, and the closing slide naming the sites the talk showed.`}}},render:e=>(0,G.jsx)(U,{...e})},Y={},X={args:{index:2}},Z={args:{index:3}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{}`,...Y.parameters?.docs?.source},description:{story:"A section divider with the cartoon `<!-- glyph: ring -->` names.",...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    index: 2
  }
}`,...X.parameters?.docs?.source},description:{story:`Up to six structures, each over its name, beside the slide's text.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    index: 3
  }
}`,...Z.parameters?.docs?.source},description:{story:`What the talk covered, beside every site it showed.`,...Z.parameters?.docs?.description}}},Q=[`SectionWithACartoon`,`Molecules`,`ClosingSlide`]})))()}export{ae as i,$ as n,S as r,V as t};