import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{f as n,n as r}from"./iframe-7mmjFs_t.js";import{At as i,Ft as a,It as o,Jt as s,Lt as c,Mt as l,Rt as ee,c as u,en as d,l as f,t as p,ur as m,vr as h,yr as g}from"./classnames-D4oujWmV.js";import{n as _,t as v}from"./numericInput---vJD0cb.js";import{n as te,r as y,t as b}from"./buttons-D4nbEZqT.js";import{a as x,i as S}from"./html-B3TTFlU5.js";import{n as C,t as ne}from"./dialog-3oTV59Vw.js";import{i as re,n as ie,r as ae,t as oe}from"./dialogFooter-Bg8d-ZCl.js";import{i as se,t as ce}from"./controls-DeUQdsam.js";import{n as le,r as ue,t as de}from"./CopyButton-BjUmuiZw.js";import{n as fe,t as pe}from"./CodeBlock-B1TL4OUN.js";import{_ as w,b as me,c as he,d as T,g as ge,o as _e,p as ve,r as ye,s as be,t as xe,u as E,v as Se,y as D}from"./sharePanels-CFrrtlvw.js";import"./chrome-DvEgqYt1.js";import{n as Ce,t as we}from"./ShareButton-B28oqg0G.js";var O,k,A;function j(){return(j=e((()=>{O=r(),k=t(p()),h(),f(),A=e=>{let{children:t,className:n,contentClassName:r,disabled:u,fill:f,helperText:p,inline:h,intent:_,label:v,labelFor:te,labelInfo:y,style:b,subLabel:x,...S}=e,C=(0,k.default)(o,g(_),{[i]:u,[l]:f,[s]:h},n);return(0,O.jsxs)(`div`,{className:C,style:b,...S,children:[v&&(0,O.jsxs)(`label`,{className:d,htmlFor:te,children:[v,` `,(0,O.jsx)(`span`,{className:m,children:y})]}),x&&(0,O.jsx)(`div`,{className:c,children:x}),(0,O.jsxs)(`div`,{className:(0,k.default)(a,r),children:[t,p&&(0,O.jsx)(`div`,{className:ee,children:p})]})]})},A.displayName=`${u}.FormGroup`})))()}function Te(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`)}function M(e){return Te(e).replaceAll(`"`,`&quot;`)}function N(e){let{base:t,search:n=``,config:r,vocabulary:i}=e,a=ge(n,r,i),o=Ee(t);return a===``?o:`${o}?${a}`}function P(e){let{url:t,title:n,height:r=F,width:i=`100%`,border:a=`1px solid #ddd`}=e,o=`border: ${a}; border-radius: 8px`;return[`<iframe src="${M(t)}"`,`title="${M(n)}"`,`width="${M(De(i))}"`,`height="${Oe(r)}"`,`style="${M(o)}"`,`loading="lazy"></iframe>`].join(` `)}function Ee(e){let t=e.search(/[#?]/);return t===-1?e:e.slice(0,t)}function De(e){return typeof e==`number`?String(Math.max(1,Math.round(e))):e}function Oe(e){return String(Number.isFinite(e)?Math.max(1,Math.round(e)):F)}var F;function I(){return(I=e((()=>{w(),F=700})))()}function L(){return(L=e((()=>{fe(),le(),ue()})))()}function R(e){let{parts:t,hidden:n,onChange:r}=e;return(0,z.jsx)(z.Fragment,{children:t.map(e=>(0,z.jsxs)(`div`,{style:ke,className:`share-part`,children:[(0,z.jsx)(ce,{checked:!n.includes(e.key),label:e.label,onChange:t=>{r(e.key,!t.currentTarget.checked)}}),(0,z.jsx)(`span`,{style:Ae,className:`share-part-description`,children:e.description})]},e.key))})}var z,ke,Ae;function je(){return(je=e((()=>{se(),z=r(),ke={marginBottom:8},Ae={display:`block`,marginLeft:26,color:`#5b6875`,fontSize:12},R.__docgenInfo={description:`One box per part of the page, worded positively: a ticked box is a part the
link keeps, which is how somebody building a course tile thinks about it.
@param props - The parts, what is switched off, and how to change it.
@returns The list of boxes.`,methods:[],displayName:`SharePartOptions`,props:{parts:{required:!0,tsType:{name:`unknown`},description:`The parts this page can switch off, in the order the vocabulary lists them.`},hidden:{required:!0,tsType:{name:`unknown`},description:`The parts the draft currently switches off.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(part: string, hidden: boolean) => void`,signature:{arguments:[{type:{name:`string`},name:`part`},{type:{name:`boolean`},name:`hidden`}],return:{name:`void`}}},description:`Called with the part and whether the link should switch it off.`}}}})))()}function Me(e,t,n){let r=e.filter(e=>e!==t);return n?[...r,t]:r}function Ne(e){let{onClose:t,vocabulary:n,title:r,baseUrl:i,search:a,frameTitle:o,frameHeight:s,children:c}=e,l=globalThis.location,ee=i??l?.href??``,u=a??l?.search??``,[d,f]=(0,Fe.useState)(()=>Pe(u,n));function p(e){f(t=>({...t,embed:e}))}function m(e,t){f(n=>({...n,hidden:Me(n.hidden,e,t)}))}function h(e,t){f(n=>({...n,params:{...n.params,[e]:t}}))}let g={config:d,setEmbed:p,setPartHidden:m,setParam:h},_=N({base:ee,search:u,config:d,vocabulary:n}),v=P({url:_,title:o??r,height:s});return(0,B.jsxs)(B.Fragment,{children:[(0,B.jsxs)(ae,{children:[(0,B.jsxs)(`p`,{style:Ie,children:[`A link to `,(0,B.jsx)(`b`,{children:r}),` as you have it set up now.`]}),(0,B.jsxs)(`section`,{className:`share-section`,style:V,children:[(0,B.jsx)(S,{children:`Layout`}),(0,B.jsx)(ce,{checked:d.embed,label:`Embed in another page`,onChange:e=>{p(e.currentTarget.checked)}}),(0,B.jsx)(`span`,{style:Le,children:`Drops the site header and its navigation, so the page sits inside a page of your own.`})]}),n.parts.length>0?(0,B.jsxs)(`section`,{className:`share-section`,style:V,children:[(0,B.jsx)(S,{children:`Show on the page`}),(0,B.jsx)(R,{parts:n.parts,hidden:d.hidden,onChange:m})]}):null,c===void 0?null:(0,B.jsx)(`section`,{className:`share-section`,style:V,children:typeof c==`function`?c(g):c}),(0,B.jsxs)(`section`,{className:`share-section`,style:V,children:[(0,B.jsx)(S,{children:`Link`}),(0,B.jsx)(pe,{code:_,tone:`muted`}),(0,B.jsxs)(`div`,{style:H,children:[(0,B.jsx)(de,{content:_,label:`Copy the link`}),(0,B.jsx)(b,{icon:`share`,text:`Open in a new tab`,href:_,target:`_blank`,rel:`noopener noreferrer`})]})]}),(0,B.jsxs)(`section`,{className:`share-section`,style:V,children:[(0,B.jsx)(S,{children:`Iframe`}),(0,B.jsx)(pe,{code:v,tone:`muted`}),(0,B.jsx)(`div`,{style:H,children:(0,B.jsx)(de,{content:v,label:`Copy the iframe`})})]})]}),(0,B.jsx)(oe,{actions:(0,B.jsx)(te,{intent:`primary`,text:`Done`,onClick:t})})]})}function Pe(e,t){let n=D(e,t);return Se(n,t)?n:me(t)}var Fe,B,Ie,V,H,Le;function Re(){return(Re=e((()=>{y(),se(),re(),ie(),x(),Fe=n(),L(),I(),w(),je(),B=r(),Ie={marginTop:0,color:`#5b6875`},V={marginBottom:18},H={display:`flex`,flexWrap:`wrap`,gap:8,marginTop:8},Le={display:`block`,marginLeft:26,color:`#5b6875`,fontSize:12},Ne.__docgenInfo={description:`The sections of the share dialog: what the link says, what it hands out, and
the markup that frames it.
@param props - What the site's links can say, how the page is named, and the extra section.
@returns The body and the footer of the dialog.`,methods:[],displayName:`ShareDialogContent`}})))()}function ze(e){let{isOpen:t,onClose:n,usePortal:r=!0,...i}=e;return(0,U.jsx)(ne,{isOpen:t,onClose:n,usePortal:r,title:`Share or embed`,icon:`share`,className:`share-dialog`,style:Be,children:t?(0,U.jsx)(Ne,{...i,onClose:n}):null})}var U,Be;function Ve(){return(Ve=e((()=>{C(),Re(),U=r(),Be={width:`min(680px, 94vw)`},ze.__docgenInfo={description:`Hand the open page out as a link, or as the iframe that frames it in someone
else's site.

The dialog opens on the link one actually hands out: framed, and with the
parts a host page has no use for already switched off. A page that is itself
running a configuration shows that one instead.
@param props - Whether the dialog is open, what the site's links can say, and how the page is named.
@returns The dialog.`,methods:[],displayName:`ShareDialog`,props:{isOpen:{required:!0,tsType:{name:`boolean`},description:`Whether the dialog is on screen.`},onClose:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when the dialog is dismissed.`},vocabulary:{required:!0,tsType:{name:`ShareVocabulary`,elements:[{name:`Codecs`}],raw:`ShareVocabulary<Codecs>`},description:`What this site's links can say: the hideable parts, and the tool's own parameters.`},title:{required:!0,tsType:{name:`string`},description:`How the open page is named in the dialog, and in the frame.`},baseUrl:{required:!1,tsType:{name:`string`},description:"Where the page is served from — origin and path. Anything from the first\n`?` or `#` is dropped, so an address can be handed over as it is.\n@default the address of the page"},search:{required:!1,tsType:{name:`string`},description:`The address as it stands, so the tool's own inputs travel with the link and
a page already running a configuration opens on that one.
@default the query string of the page`},frameTitle:{required:!1,tsType:{name:`string`},description:`What a screen reader announces the frame as. A frame in someone else's page
is usually named after the site as well as the page.
@default the title`},frameHeight:{required:!1,tsType:{name:`number`},description:`Height of the frame, in pixels.
@default 700`},usePortal:{required:!1,tsType:{name:`boolean`},description:"Whether the dialog is rendered through a portal on `document.body`.\n@default true"},children:{required:!1,tsType:{name:`union`,raw:`ReactNode | ((draft: ShareDraft<Codecs>) => ReactNode)`,elements:[{name:`ReactNode`},{name:`unknown`}]},description:`An extra section for what only this tool can configure — a series length, a
difficulty, a seed. A function is handed the draft, so such a section can
write the tool's own parameters into the link.
@default undefined — the dialog shows the sections every site shares`}}}})))()}function He(e){let{action:t,children:n}=e;return(0,W.jsxs)(`div`,{style:Ge,children:[(0,W.jsxs)(`div`,{style:Ke,children:[(0,W.jsxs)(`div`,{className:`sb-header`,style:qe,children:[(0,W.jsx)(`span`,{style:Je,children:`smiles.cheminfo.org`}),t]}),(0,W.jsx)(xe,{})]}),n]})}function Ue(e){let[t,n]=(0,We.useState)(!1);return(0,W.jsx)(He,{action:(0,W.jsx)(we,{onClick:()=>{n(!0)}}),children:(0,W.jsx)(G,{...e,isOpen:t,onClose:()=>{n(!1)}})})}var We,W,G,Ge,Ke,qe,Je,K,q,Ye,Xe,Ze,J,Y,X,Z,Q,Qe;function $(){return($=e((()=>{j(),x(),_(),We=n(),I(),w(),Ce(),Ve(),ve(),ye(),W=r(),G=ze,Ge={position:`relative`,width:`100%`,height:`min(52rem, 100vh)`,overflow:`auto`,background:`var(--surface-sunken)`},Ke={display:`grid`,padding:`1rem`,gap:`1rem`,justifyItems:`stretch`},qe={justifyContent:`space-between`},Je={fontWeight:700},K={display:`grid`,width:`min(56rem, 92vw)`,gap:18},q={padding:`8px 10px`,border:`1px solid var(--border-strong)`,borderRadius:4,margin:`6px 0 0`,background:`#f6f7f9`,fontSize:12,overflowWrap:`anywhere`,whiteSpace:`pre-wrap`},Ye={margin:0,color:`var(--text-muted)`,fontSize:12},Xe=[{name:`The link the dialog opens on`,note:`Framed, with the hints and the result limit already switched off.`,config:me(T)},{name:`The whole site, at the 60 hits the link asks for`,note:`Nothing switched off, so nothing but the cap is written.`,config:D(`limit=60`,T)}],Ze={title:`Share/ShareDialog`,component:G,args:{isOpen:!0,onClose:()=>void 0,usePortal:!1,vocabulary:T,title:he,baseUrl:_e,search:E,frameTitle:be},argTypes:{title:{control:`text`},search:{control:`text`},frameHeight:{control:{type:`range`,min:200,max:1200,step:20}},vocabulary:{control:!1},children:{control:!1},onClose:{control:!1}},parameters:{layout:`fullscreen`,docs:{description:{component:`Hands the open page out as a link, or as the iframe that frames it in someone else’s site.`}}},render:e=>(0,W.jsx)(He,{children:(0,W.jsx)(G,{...e})})},J={},Y={args:{search:`${E}&limit=60`}},X={args:{children:e=>(0,W.jsxs)(W.Fragment,{children:[(0,W.jsx)(S,{children:`Results`}),(0,W.jsx)(A,{label:`How many hits the page comes back with`,children:(0,W.jsx)(v,{min:1,max:200,value:e.config.params.limit,onValueChange:t=>{Number.isFinite(t)&&e.setParam(`limit`,t)}})})]})}},Z={args:{isOpen:!1},render:e=>(0,W.jsx)(Ue,{...e})},Q={parameters:{layout:`padded`},render:e=>(0,W.jsx)(`div`,{style:K,children:Xe.map(({name:t,note:n,config:r})=>{let i=N({base:e.baseUrl??`https://smiles.cheminfo.org/search`,search:e.search,config:r,vocabulary:T});return(0,W.jsxs)(`section`,{children:[(0,W.jsx)(S,{children:t}),(0,W.jsx)(`p`,{style:Ye,children:n}),(0,W.jsx)(`pre`,{style:q,children:i}),(0,W.jsx)(`pre`,{style:q,children:P({url:i,title:e.frameTitle??e.title,height:e.frameHeight})})]},t)})})},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{}`,...J.parameters?.docs?.source},description:{story:`The link one actually hands out: framed, and with the parts a host page has
no use for already switched off.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    search: \`\${SHARE_SEARCH}&limit=60\`
  }
}`,...Y.parameters?.docs?.source},description:{story:`A page already running a configuration opens on that one — here nothing
switched off, at the 60 hits the address carries.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    children: draft => <>
        <H6>Results</H6>
        <FormGroup label="How many hits the page comes back with">
          <NumericInput min={1} max={MAX_RESULTS} value={draft.config.params.limit} onValueChange={value => {
          if (Number.isFinite(value)) draft.setParam('limit', value);
        }} />
        </FormGroup>
      </>
  }
}`,...X.parameters?.docs?.source},description:{story:`The section only this tool can offer: the result cap is written into the link
as it is changed, through the draft the dialog hands over.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: false
  },
  render: args => <ShareFromHeader {...args} />
}`,...Z.parameters?.docs?.source},description:{story:`Opened from a real Share button: closing it and opening it again starts the
draft over, so a page never hands out the boxes ticked half an hour ago.`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={COLUMN_STYLE}>
      {CONFIGURATIONS.map(({
      name,
      note,
      config
    }) => {
      const url = buildShareUrl({
        base: args.baseUrl ?? SHARE_BASE,
        search: args.search,
        config,
        vocabulary: SHARE_VOCABULARY
      });
      return <section key={name}>
            <H6>{name}</H6>
            <p style={NOTE_STYLE}>{note}</p>
            <pre style={PRE_STYLE}>{url}</pre>
            <pre style={PRE_STYLE}>
              {buildEmbedCode({
            url,
            title: args.frameTitle ?? args.title,
            height: args.frameHeight
          })}
            </pre>
          </section>;
    })}
    </div>
}`,...Q.parameters?.docs?.source},description:{story:`What a teacher copies out of the dialog, for both states of the link.`,...Q.parameters?.docs?.description}}},Qe=[`Default`,`EverythingShown`,`WithToolSection`,`FromTheHeader`,`TheLinkAndTheFrame`]})))()}$();export{J as Default,Y as EverythingShown,Z as FromTheHeader,Q as TheLinkAndTheFrame,X as WithToolSection,Qe as __namedExportsOrder,Ze as default};