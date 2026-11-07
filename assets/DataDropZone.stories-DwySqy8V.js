import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-B09SP5Xl.js";import{n as r,t as i}from"./useT-DmkWpGuY.js";import{n as a,r as o}from"./buttons-C2MiDpyO.js";import{n as s,t as c}from"./nonIdealState-BYEuYG5I.js";import{n as l,t as u}from"./isEditingField-CpfQ7n5m.js";import{i as d,n as f,o as p,r as m,t as h}from"./useStructureDrop-D1coOIF0.js";function g(e){let{title:t,description:n,onFiles:i,onText:o,onPasteClick:s}=e,{accept:u,multiple:d=!0,actions:h,icon:g=`import`,className:y}=e,b=r(),x=(0,_.useRef)(null),S=(0,_.useCallback)(e=>{e.kind===`files`?i(e.files):o?.(e.text)},[i,o]),C=o!==void 0,w=f(S,C);return(0,_.useEffect)(()=>{function e(e){if(e.defaultPrevented||l(e.target)||l(document.activeElement))return;let t=p(e.clipboardData);t!==null&&(t.kind===`text`&&!C||(e.preventDefault(),S(t)))}return document.addEventListener(`paste`,e),()=>{document.removeEventListener(`paste`,e)}},[S,C]),(0,v.jsxs)(`div`,{className:[`data-drop-zone`,w.over?`data-drop-zone--over`:``,y??``].filter(Boolean).join(` `),...w.targetProps,children:[(0,v.jsx)(c,{icon:g,title:t,description:n,action:(0,v.jsxs)(`div`,{className:`data-drop-zone__actions no-print`,children:[(0,v.jsx)(a,{icon:`folder-open`,intent:`primary`,variant:`outlined`,text:b(`dropZone.open`),onClick:()=>{x.current?.click()}}),s?(0,v.jsx)(a,{icon:`clipboard`,intent:`primary`,variant:`outlined`,text:b(`dropZone.paste`),onClick:()=>{s()}}):null,h]})}),(0,v.jsx)(`input`,{ref:x,type:`file`,hidden:!0,accept:u,multiple:d,onChange:e=>{let t=Array.from(e.target.files??[]);e.target.value=``,t.length>0&&i(t)}}),w.over?(0,v.jsx)(m,{label:b(`dropZone.drop`),handlers:w.overlayProps}):null]})}var _,v;function y(){return(y=e((()=>{o(),s(),_=t(),i(),u(),d(),h(),v=n(),g.__docgenInfo={description:`What a page shows while it waits for data: one zone that takes a drop, a
paste from anywhere on the page, or a file chosen with its Open button. It
holds every way in, so a page needs no other button for them.
@param props - See {@link DataDropZoneProps}.
@returns The zone.`,methods:[],displayName:`DataDropZone`,props:{title:{required:!0,tsType:{name:`string`},description:`What the zone asks for, as its heading.`},description:{required:!1,tsType:{name:`ReactNode`},description:`What it takes, in a sentence under the heading.
@default undefined`},onFiles:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(files: File[]) => void`,signature:{arguments:[{type:{name:`Array`,elements:[{name:`File`}],raw:`File[]`},name:`files`}],return:{name:`void`}}},description:`Called with the files dropped, pasted or chosen, unread.`},onText:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(text: string) => void`,signature:{arguments:[{type:{name:`string`},name:`text`}],return:{name:`void`}}},description:`Called with text pasted, or dragged in from another page. Without it the
zone takes files only.
@default undefined`},onPasteClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`What the Paste button does. A button cannot read the clipboard without
asking for permission, and a frame may not be allowed to ask, so the page
opens a box to paste into. Without it there is no Paste button, and the
keyboard still pastes.
@default undefined`},accept:{required:!1,tsType:{name:`string`},description:`The file types Open offers, as the \`accept\` of a file input. A drop is not
filtered: the page knows what it can read.
@default undefined`},multiple:{required:!1,tsType:{name:`boolean`},description:`Whether Open takes several files at once.
@default true`},actions:{required:!1,tsType:{name:`ReactNode`},description:`More ways to start, after Open and Paste: an example menu, for instance.
@default undefined`},icon:{required:!1,tsType:{name:`IconName`},description:`The glyph above the heading.
@default 'import'`},className:{required:!1,tsType:{name:`string`},description:"Class of the zone, next to `data-drop-zone`.\n@default undefined"}}}})))()}var b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{o(),y(),b=n(),x={height:360,background:`var(--surface)`},S=()=>void 0,C={title:`Chrome/DataDropZone`,component:g,decorators:[e=>(0,b.jsx)(`div`,{style:x,children:(0,b.jsx)(e,{})})],parameters:{docs:{description:{component:`What a page shows while it waits for data: drop a file on it, paste anywhere on the page, or choose a file with Open. It holds every way in, so a page needs no other button for them.`}}},args:{title:`Drop, paste or open a mass spectrum`,description:`As JCAMP-DX, or as columns of m/z and intensity. Its peaks are picked and labelled.`,accept:`.jdx,.dx,.txt,.csv,.tsv`,onFiles:S,onText:S,onPasteClick:S}},w={},T={args:{title:`Drop or open a CIF file`,description:`The crystal is built from it, in your browser.`,accept:`.cif`,multiple:!1,onText:void 0,onPasteClick:void 0}},E={args:{actions:(0,b.jsx)(a,{icon:`chart`,variant:`minimal`,endIcon:`caret-down`,children:`Example`})}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{}`,...w.parameters?.docs?.source},description:{story:`Every way in.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Drop or open a CIF file',
    description: 'The crystal is built from it, in your browser.',
    accept: '.cif',
    multiple: false,
    onText: undefined,
    onPasteClick: undefined
  }
}`,...T.parameters?.docs?.source},description:{story:`A page that reads only files has no Paste button and leaves text alone.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    actions: <Button icon="chart" variant="minimal" endIcon="caret-down">
        Example
      </Button>
  }
}`,...E.parameters?.docs?.source},description:{story:`Whatever else starts the page sits after Open and Paste.`,...E.parameters?.docs?.description}}},D=[`Default`,`FilesOnly`,`WithAnExampleMenu`]})))()}O();export{w as Default,T as FilesOnly,E as WithAnExampleMenu,D as __namedExportsOrder,C as default};