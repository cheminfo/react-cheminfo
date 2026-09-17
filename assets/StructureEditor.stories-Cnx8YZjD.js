const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./EditorCanvas-Dk7r8hUO.js","./rolldown-runtime-C0FnF6B9.js","./iframe-CrDw_Dpt.js","./preload-helper-BHmFeTtP.js","./chunk-5GYAEUAU-DRKDb1nO.js","./chunk-IMSF75WX-yvVUwIQZ.js","./lookup-DCkzqGBz.js","./iframe-CnpnNetz.css","./lib-CUEqlTdC.js","./openchemlib-D0Gg4RB5.js","./floating-ui.react-dom-DOGiuXK8.js","./react-dom-nhYvVqPK.js","./emotion-styled.browser.esm-CocKpSMj.js","./extends-D4puxXF7.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,t as n}from"./preload-helper-BHmFeTtP.js";import{h as r,n as i}from"./iframe-CrDw_Dpt.js";import{n as a,r as o}from"./familyTokens-DsQXXJV4.js";import{i as s,o as c,r as l}from"./structureFixtures-DYs_uddm.js";function u(e,t,n=2){let r=d(t),i=d(e);return i===0?r:Math.max(r,i+d(n))}function d(e){return Number.isFinite(e)&&e>0?e:0}function f(){return(f=e((()=>{})))()}function p(e={}){let{minHeight:t=320,revision:n=0}=e,r=(0,h.useRef)(null);return(0,h.useLayoutEffect)(()=>{let e=r.current;if(e===null)return;let n=null,i=null,a=()=>{let r=m(e);r!==null&&(i?.disconnect(),n=r,i=new ResizeObserver(()=>{let n=r.offsetHeight;n!==0&&(e.style.minHeight=`${u(n,t)}px`)}),i.observe(r))},o=new MutationObserver(()=>{n?.isConnected!==!0&&a()});return o.observe(e,{childList:!0,subtree:!0}),a(),()=>{o.disconnect(),i?.disconnect()}},[t,n]),r}function m(e){for(let t of e.querySelectorAll(`*`))for(let e of t.shadowRoot?.children??[])if(e instanceof HTMLCanvasElement)return e;return null}var h;function g(){return(g=e((()=>{h=r(),f()})))()}function _(e){let{onChange:t,fragment:n=!1,inputFormat:r=`idcode`,value:i=``,revision:a=0,debounce:o=300,minHeight:s=320,mode:c=`molecule`,className:l,style:u}=e,d=p({minHeight:s,revision:a}),f=v(t,o,a);return(0,b.jsx)(`div`,{ref:d,className:l,style:{...S,minHeight:s,...u},children:(0,b.jsx)(y.Suspense,{fallback:(0,b.jsx)(`div`,{style:C,children:`Loading the editor…`}),children:(0,b.jsx)(x,{onChange:f,fragment:n,inputFormat:r,value:i,mode:c},a)})})}function v(e,t,n){let r=(0,y.useRef)(null),i=(0,y.useRef)(e);return(0,y.useEffect)(()=>{i.current=e}),(0,y.useEffect)(()=>()=>{r.current!==null&&(clearTimeout(r.current),r.current=null)},[n]),(0,y.useCallback)(e=>{if(r.current!==null&&clearTimeout(r.current),t<=0){i.current(e);return}r.current=setTimeout(()=>{r.current=null,i.current(e)},t)},[t])}var y,b,x,S,C;function w(){return(w=e((()=>{y=r(),o(),g(),b=i(),t(),x=(0,y.lazy)(async()=>({default:(await n(()=>import(`./EditorCanvas-Dk7r8hUO.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13]),import.meta.url)).EditorCanvas})),S={position:`relative`,overflow:`hidden`,boxSizing:`border-box`,border:`1px solid ${a.border}`,borderRadius:6,background:`#fff`},C={position:`absolute`,inset:0,display:`flex`,alignItems:`center`,justifyContent:`center`,color:a.textFaint,fontSize:13},_.__docgenInfo={description:`The canvas structure editor, sized to fill its container and never to hide
part of its toolbar.
@param props - What to draw, when to reload it, and where to send it.
@returns The editor.`,methods:[],displayName:`StructureEditor`,props:{onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(change: StructureEditorChange) => void`,signature:{arguments:[{type:{name:`StructureEditorChange`},name:`change`}],return:{name:`void`}}},description:"Called after every edit, once the drawing has been still for `debounce`\nmilliseconds, with every notation read out of the editor."},fragment:{required:!1,tsType:{name:`boolean`},description:`Draw a query fragment rather than a whole structure, which is what a
substructure filter needs.
@default false`},inputFormat:{required:!1,tsType:{name:`CanvasEditorInputFormat`},description:"How `value` is written.\n@default 'idcode'"},value:{required:!1,tsType:{name:`string`},description:`What the canvas holds. Read once, when the editor appears and again on
every change of \`revision\`: the editor is uncontrolled, so feeding the
drawing back into it would replace the structure and reset every
coordinate under the pen.
@default ''`},revision:{required:!1,tsType:{name:`number`},description:`Bumped by the caller to load \`value\` into the canvas again, which is what
an example, a share link or a Clear button does. Changing it discards
whatever was being drawn.
@default 0`},debounce:{required:!1,tsType:{name:`number`},description:"How long the drawing has to be still before `onChange` is called, in\nmilliseconds. Long enough that drawing a ring does not publish six\nstructures; `0` reports every stroke.\n@default 300"},minHeight:{required:!1,tsType:{name:`number`},description:`Smallest height of the drawing area, in pixels. Raised to whatever the
toolbar needs, which is usually more.
@default 320`},mode:{required:!1,tsType:{name:`union`,raw:`'molecule' | 'reaction'`,elements:[{name:`literal`,value:`'molecule'`},{name:`literal`,value:`'reaction'`}]},description:`Whether the editor draws one structure or a reaction. A reaction canvas
has its own toolbar and its own arrow.
@default 'molecule'`},className:{required:!1,tsType:{name:`string`},description:`Class the container carries, so a site can reach it from its stylesheet.
@default undefined`},style:{required:!1,tsType:{name:`CSSProperties`},description:`Extra style for the container, merged over the packaged one.
@default undefined`}}}})))()}function T(e){let[t,n]=(0,O.useState)(0);return(0,k.jsxs)(`div`,{style:R,children:[(0,k.jsx)(`button`,{type:`button`,style:z,onClick:()=>n(e=>e+1),children:`Reload`}),(0,k.jsx)(_,{...e,revision:t})]})}function E(e){let[t,n]=(0,O.useState)(null);return(0,k.jsxs)(`div`,{style:R,children:[(0,k.jsx)(_,{...e,onChange:n}),t===null?(0,k.jsx)(`p`,{style:B,children:`Draw or edit the structure — its notations appear here.`}):(0,k.jsxs)(`div`,{style:V,children:[(0,k.jsx)(D,{label:`SMILES`,value:t.smiles}),(0,k.jsx)(D,{label:`idCode`,value:t.idCode}),(0,k.jsx)(D,{label:`Molfile`,value:t.molfile})]})]})}function D(e){return(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`div`,{style:H,children:e.label}),(0,k.jsx)(`pre`,{style:U,children:e.value===``?`—`:e.value})]})}var O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W;function G(){return(G=e((()=>{O=r(),w(),o(),c(),k=i(),A={title:`Structure/StructureEditor`,component:_,args:{onChange:()=>{},inputFormat:`smiles`,value:s,debounce:300,minHeight:320,style:{height:380}},argTypes:{fragment:{control:`boolean`},mode:{control:`inline-radio`,options:[`molecule`,`reaction`]},inputFormat:{control:`inline-radio`,options:[`idcode`,`molfile`,`smiles`]},debounce:{control:{type:`range`,min:0,max:1e3,step:50}},minHeight:{control:{type:`range`,min:200,max:640,step:20}},revision:{control:{type:`number`,min:0,step:1}}},parameters:{layout:`padded`,docs:{description:{component:"The canvas structure editor, sized so its toolbar is never clipped. It is uncontrolled: the value is read when the editor appears and again whenever `revision` changes, and an edit is reported once the drawing has been still."}}},render:e=>(0,k.jsx)(E,{...e})},j={},M={args:{inputFormat:`idcode`,value:``}},N={args:{fragment:!0,value:l}},P={args:{debounce:0}},F={args:{minHeight:200,style:{}}},I={args:{mode:`reaction`,inputFormat:`idcode`,value:``}},L={args:{minHeight:200,style:{},value:l},render:e=>(0,k.jsx)(T,{...e})},R={display:`grid`,width:`min(52rem, 92vw)`,gap:12},z={padding:`4px 10px`,border:`1px solid ${a.border}`,borderRadius:6,background:a.surface,color:a.text,cursor:`pointer`,fontSize:`0.8125rem`,justifySelf:`start`},B={margin:0,color:a.textMuted,fontSize:`0.8125rem`},V={display:`grid`,gap:10},H={color:a.textMuted,fontSize:`0.6875rem`,fontWeight:700,letterSpacing:`0.04em`,textTransform:`uppercase`},U={overflow:`auto`,maxHeight:`11rem`,padding:`6px 8px`,border:`1px solid ${a.border}`,borderRadius:6,margin:`2px 0 0`,background:a.surfaceSunken,fontFamily:`ui-monospace, SFMono-Regular, Menlo, monospace`,fontSize:`0.75rem`,whiteSpace:`pre`},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{}`,...j.parameters?.docs?.source},description:{story:`Draw on the caffeine and watch the three notations follow the canvas.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    inputFormat: 'idcode',
    value: ''
  }
}`,...M.parameters?.docs?.source},description:{story:`A blank canvas, which is what a page asking the visitor to draw opens on.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    fragment: true,
    value: BENZENE
  }
}`,...N.parameters?.docs?.source},description:{story:`Query mode, which is what a substructure filter draws in. Erasing the canvas
here leaves the idCode of the empty fragment rather than an empty string,
which is the case \`isEmptyIdCode\` exists to catch.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    debounce: 0
  }
}`,...P.parameters?.docs?.source},description:{story:`Every stroke reported, rather than only the last one of a burst.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    minHeight: 200,
    style: {}
  }
}`,...F.parameters?.docs?.source},description:{story:`A box smaller than the toolbar, which is the case the measured floor exists
for: the toolbar is one canvas of a fixed height, so a container shorter than
it cuts the last buttons off rather than scrolling them.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    mode: 'reaction',
    inputFormat: 'idcode',
    value: ''
  }
}`,...I.parameters?.docs?.source},description:{story:`The reaction canvas, with its own toolbar and its own arrow.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    minHeight: 200,
    style: {},
    value: BENZENE
  },
  render: args => <ReloadDemo {...args} />
}`,...L.parameters?.docs?.source},description:{story:`Reload puts the structure on the canvas again by bumping \`revision\`, which is
what an example, a share link or a Clear button does. The box is measured
again each time, so a reload never leaves the toolbar cut off.`,...L.parameters?.docs?.description}}},W=[`Default`,`Empty`,`Fragment`,`NoDebounce`,`SmallBox`,`Reaction`,`Reloadable`]})))()}G();export{j as Default,M as Empty,N as Fragment,P as NoDebounce,I as Reaction,L as Reloadable,F as SmallBox,W as __namedExportsOrder,A as default};