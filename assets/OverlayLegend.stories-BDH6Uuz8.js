import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-D72pBctd.js";import{gt as r,h as i,m as a,n as o,o as s,r as c,s as l,st as u}from"./projectionFixtures-DkPtYRxh.js";import{S as d,v as f,x as p}from"./OverlayToggle-CENyE56L.js";import{t as m}from"./ui-CJ2GDaC3.js";import{t as h}from"./ScatterPlot-v_Ruqsxt.js";import{t as g}from"./ui-BMorNvX9.js";function _(e){let{overlay:t,muted:n}=e;return(0,S.jsx)(h,{x:s,y:l,width:C.width,height:C.height,xAxis:i(0),yAxis:i(1),groupOf:c,groups:o,ellipse:{kind:`coverage`,probability:.95},mutedGroups:n===void 0?void 0:new Set([n]),overlay:t})}function v(e){let[t,n]=(0,x.useState)(new Set);return(0,S.jsxs)(`div`,{style:I,children:[(0,S.jsx)(h,{x:s,y:l,width:C.width,height:C.height,xAxis:i(0),yAxis:i(1),groupOf:c,groups:o,ellipse:{kind:`coverage`,probability:.95},mutedGroups:t,overlay:(0,S.jsx)(f,{placement:`top-left`,title:e.title,entries:E.map(e=>({...e,muted:t.has(e.id)})),onToggle:e=>{let r=new Set(t);r.delete(e)||r.add(e),n(r)}})}),(0,S.jsx)(`p`,{style:L,children:y(t)})]})}function y(e){if(e.size===0)return`Every species is drawn in full.`;let t=[];for(let n of o)e.has(n.id)&&t.push(n.label);return`Drawn faint: ${t.join(`, `)}.`}function b(){let e=new Int32Array(o.length);for(let t of c)t>=0&&(e[t]=(e[t]??0)+1);return e}var x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R;function z(){return(z=e((()=>{x=t(),u(),d(),m(),g(),a(),S=n(),C={width:720,height:420},w=`Colour = species, ring = 95% of that species`,T=b(),E=o.map((e,t)=>({...e,count:T[t]??0})),D={dot:`Sample the model was fitted on`,ring:`Sample placed into the finished model`,square:`Group mean`,line:`Component`,dashed:`Outline of a group`,cross:`Cluster centre`},O=[0,1,2,3,5,6],k=p.map((e,t)=>({id:e,label:D[e]??e,color:r(O[t]??0),shape:e})),A={title:`Overlay/OverlayLegend`,component:f,args:{title:w,entries:E,placement:`top-left`},parameters:{layout:`padded`,docs:{description:{component:"The card that says what colour and shape mean on a figure. Give it an `onToggle` and the same card becomes the filter: pressing an entry hides what it names. Its title has no default on purpose — a legend that does not name its encoding is how a reader carries the wrong meaning from one tab to the next."}}},render:e=>(0,S.jsx)(_,{overlay:(0,S.jsx)(f,{...e})})},j={},M={args:{title:`What each mark stands for`,entries:k,placement:`below`},render:e=>(0,S.jsx)(f,{...e})},N={render:e=>(0,S.jsx)(v,{title:e.title})},P={args:{entries:E.map(e=>e.id===`versicolor`?{...e,muted:!0}:e)},render:e=>(0,S.jsx)(_,{muted:`versicolor`,overlay:(0,S.jsx)(f,{...e})})},F={args:{title:`Colour = species, ring = 95% of that species`,entries:[...E,{id:`outline`,label:`Outline`,color:`var(--text-muted)`,shape:`dashed`,note:`Drawn only for a species with at least three flowers.`}]}},I={display:`flex`,flexDirection:`column`,gap:8},L={margin:0,color:`var(--text-muted)`,fontSize:13},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{}`,...j.parameters?.docs?.source},description:{story:`Three species, each with the count it covers, over the map they are read from.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'What each mark stands for',
    entries: EVERY_MARK,
    placement: 'below'
  },
  render: args => <OverlayLegend {...args} />
}`,...M.parameters?.docs?.source},description:{story:`The six marks. The first three separate one filled thing from another by
colour alone; the last three carry a second meaning on the same figure — a
line for a component beside dots for the samples — which is what keeps a
figure readable when the colours run out or the reader does not separate two
of them.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => <FilterDemo title={args.title} />
}`,...N.parameters?.docs?.source},description:{story:`The legend as the map's filter. Press an entry: the species is struck
through and dimmed here, and drawn faint on the map — the state is written
into the shape of the words as well as into their strength, so it survives a
screenshot, a greyscale print, and a reader who does not separate two of the
colours.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    entries: SPECIES.map(entry => entry.id === 'versicolor' ? {
      ...entry,
      muted: true
    } : entry)
  },
  render: args => <IrisMap muted="versicolor" overlay={<OverlayLegend {...args} />} />
}`,...P.parameters?.docs?.source},description:{story:`One species switched off, shown standing still.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Colour = species, ring = 95% of that species',
    entries: [...SPECIES, {
      id: 'outline',
      label: 'Outline',
      color: 'var(--text-muted)',
      shape: 'dashed',
      note: 'Drawn only for a species with at least three flowers.'
    }]
  }
}`,...F.parameters?.docs?.source},description:{story:`A note under an entry, for the one line that says why a mark is not drawn in
full. It is the honest alternative to leaving the entry out, which teaches
the reader that the thing does not exist.`,...F.parameters?.docs?.description}}},R=[`Default`,`EveryMark`,`Interactive`,`Muted`,`WithNote`]})))()}z();export{j as Default,M as EveryMark,N as Interactive,P as Muted,F as WithNote,R as __namedExportsOrder,A as default};