import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-NL4eeIar.js";import{n as r,t as i}from"./numericInput-BGijjY7K.js";import{a,i as o}from"./html-DPumu6wy.js";import{n as s,t as c}from"./formGroup-C842ToL0.js";import{a as l,i as u,n as d,r as f,t as p}from"./ShareDialog-CdzrQSl6.js";import{i as m,o as h,s as g}from"./config-Dbeb2VWW.js";import{a as _,c as v,d as y,f as b,i as x,m as S,o as C,r as w,s as T,t as E,u as D}from"./sharePanels-CgHcRO7v.js";import{n as O,t as k}from"./ShareButton-D43LVh4J.js";function A(e){let{action:t,children:n}=e;return(0,N.jsxs)(`div`,{style:F,children:[(0,N.jsxs)(`div`,{style:I,children:[(0,N.jsxs)(`div`,{className:`sb-header`,style:L,children:[(0,N.jsx)(`span`,{style:R,children:`smiles.cheminfo.org`}),(0,N.jsx)(x,{part:`tabs`,children:(0,N.jsx)(`span`,{children:`Search · Exercises · Cheatsheet`})}),t]}),(0,N.jsx)(E,{})]}),n]})}function j(e){let[t,n]=(0,M.useState)(!1);return(0,N.jsx)(A,{action:(0,N.jsx)(k,{onClick:()=>{n(!0)}}),children:(0,N.jsx)(P,{...e,isOpen:t,onClose:()=>{n(!1)}})})}var M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X;function Z(){return(Z=e((()=>{s(),a(),r(),M=t(),l(),m(),_(),O(),d(),S(),w(),N=n(),P=p,F={position:`relative`,width:`100%`,height:`min(52rem, 100vh)`,overflow:`auto`,background:`var(--surface-sunken)`},I={display:`grid`,padding:`1rem`,gap:`1rem`,justifyItems:`stretch`},L={justifyContent:`space-between`},R={fontWeight:700},z={display:`grid`,width:`min(56rem, 92vw)`,gap:18},B={padding:`8px 10px`,border:`1px solid var(--border-strong)`,borderRadius:4,margin:`6px 0 0`,background:`#f6f7f9`,fontSize:12,overflowWrap:`anywhere`,whiteSpace:`pre-wrap`},V={margin:0,color:`var(--text-muted)`,fontSize:12},H=[{name:`The link the dialog opens on`,note:`Framed, with the hints and the result limit already switched off.`,config:g(b)},{name:`The whole site, at the 60 hits the link asks for`,note:`Nothing switched off, so nothing but the cap is written.`,config:h(`limit=60`,b)}],U={title:`Share/ShareDialog`,component:P,args:{isOpen:!0,onClose:()=>void 0,usePortal:!1,vocabulary:b,title:v,baseUrl:C,search:y,frameTitle:T},argTypes:{title:{control:`text`},search:{control:`text`},frameHeight:{control:{type:`range`,min:200,max:1200,step:20}},vocabulary:{control:!1},children:{control:!1},onClose:{control:!1}},parameters:{layout:`fullscreen`,docs:{description:{component:`Hands the open page out as a link, or as the iframe that frames it in someone else’s site.`}}},render:e=>(0,N.jsx)(A,{children:(0,N.jsx)(P,{...e})})},W={},G={args:{search:`${y}&limit=60`}},K={args:{children:e=>(0,N.jsxs)(N.Fragment,{children:[(0,N.jsx)(o,{children:`Results`}),(0,N.jsx)(c,{label:`How many hits the page comes back with`,children:(0,N.jsx)(i,{min:1,max:200,value:e.config.params.limit,onValueChange:t=>{Number.isFinite(t)&&e.setParam(`limit`,t)}})})]})}},q={args:{presets:D}},J={args:{isOpen:!1},render:e=>(0,N.jsx)(j,{...e})},Y={parameters:{layout:`padded`},render:e=>(0,N.jsx)(`div`,{style:z,children:H.map(({name:t,note:n,config:r})=>{let i=u({base:e.baseUrl??`https://smiles.cheminfo.org/search`,search:e.search,config:r,vocabulary:b});return(0,N.jsxs)(`section`,{children:[(0,N.jsx)(o,{children:t}),(0,N.jsx)(`p`,{style:V,children:n}),(0,N.jsx)(`pre`,{style:B,children:i}),(0,N.jsx)(`pre`,{style:B,children:f({url:i,title:e.frameTitle??e.title,height:e.frameHeight})})]},t)})})},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{}`,...W.parameters?.docs?.source},description:{story:`The link one actually hands out: framed, and with the parts a host page has
no use for already switched off.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    search: \`\${SHARE_SEARCH}&limit=60\`
  }
}`,...G.parameters?.docs?.source},description:{story:`A page already running a configuration opens on that one — here nothing
switched off, at the 60 hits the address carries.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source},description:{story:`The section only this tool can offer: the result cap is written into the link
as it is changed, through the draft the dialog hands over.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    presets: SHARE_PRESETS
  }
}`,...q.parameters?.docs?.source},description:{story:`The links a site knows people hand out, one tab each; Custom holds the boxes
and starts from the preset picked before it.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: false
  },
  render: args => <ShareFromHeader {...args} />
}`,...J.parameters?.docs?.source},description:{story:`Opened from a real Share button: closing it and opening it again starts the
draft over, so a page never hands out the boxes ticked half an hour ago.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source},description:{story:`What a teacher copies out of the dialog, for both states of the link.`,...Y.parameters?.docs?.description}}},X=[`Default`,`EverythingShown`,`WithToolSection`,`WithPresets`,`FromTheHeader`,`TheLinkAndTheFrame`]})))()}Z();export{W as Default,G as EverythingShown,J as FromTheHeader,Y as TheLinkAndTheFrame,q as WithPresets,K as WithToolSection,X as __namedExportsOrder,U as default};