import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-ikZ4AUmb.js";import{n as r,t as i}from"./useT-jWQaM-Ym.js";import{n as a,r as o}from"./buttons-C3DK-MmN.js";import{n as s,r as c,t as l}from"./moleculeTable-CmKVt629.js";import{n as u,t as d}from"./DelimitedTextDialog-BycwGQ6n.js";function f(e){let{rows:t,text:n,icon:i=`th`,minimal:o=!0,small:s=!1,tooltip:c,disabled:l,testId:u,trigger:f,buttonClassName:g,..._}=e,v=r(),[y,b]=(0,p.useState)(null),x=c??v(`delimited.copyOrDownload`),S=l??(typeof t!=`function`&&t.length===0);function C(){b(typeof t==`function`?t():t)}return(0,m.jsxs)(m.Fragment,{children:[f?f(C):(0,m.jsx)(a,{className:g,icon:i,text:n,variant:o?`minimal`:`solid`,size:s?`small`:`medium`,disabled:S,title:x,"aria-label":n??x,"data-testid":u,onClick:C}),(0,m.jsx)(d,{..._,rows:y??h,isOpen:y!==null,onClose:()=>b(null)})]})}var p,m,h;function g(){return(g=e((()=>{o(),p=t(),i(),u(),m=n(),h=[],f.__docgenInfo={description:`The one control that takes a table off the page: copy it, or save it.

It is a button and a dialog together rather than a dialog a site has to hold
open itself, because the state behind it is the same three lines in every
site and because the wording is not a site's to choose. An audit in
September 2026 found the same affordance spelled \`Export as TSV\` on one
site, \`Copy as TSV\` on another and \`Copy or download data\` on a third, which
reads as three different features to anybody who uses two of our tools in a
week.

It is also deliberately not named after a separator. The dialog behind it
writes tab-, comma- or semicolon-separated text, so a button that says TSV
is wrong two times out of three — and a reader looking for CSV concludes the
tool cannot give it to them.
@param props - See {@link TableDataButtonProps}.
@returns The button and its dialog.`,methods:[],displayName:`TableDataButton`,props:{rows:{required:!0,tsType:{name:`union`,raw:`TableRows | (() => TableRows)`,elements:[{name:`ReadonlyArray`,elements:[{name:`unknown`}],raw:`ReadonlyArray<readonly string[]>`},{name:`unknown`}]},description:`The cells, one array per line. A function is called when the dialog opens
and not before, which is what a table built out of a computation has to
be: formatting a thousand points into strings on every render, for a
button nobody may press, is a page that stutters while it is used.`},text:{required:!1,tsType:{name:`string`},description:`Text of the button. Left out for an icon-only button, which is what a
dense toolbar over a table wants.
@default undefined — the button is reduced to its icon`},icon:{required:!1,tsType:{name:`IconName`},description:`Glyph on the button.
@default 'th'`},minimal:{required:!1,tsType:{name:`boolean`},description:`Whether the button drops its background, for a toolbar or a card header.
@default true`},small:{required:!1,tsType:{name:`boolean`},description:`Whether the button is the small size.
@default false`},tooltip:{required:!1,tsType:{name:`string`},description:`What the pointer and a screen reader are told. The dialog's own \`title\`
names the table — \`Titration curve as a table\` — while this names the
affordance, and the two are deliberately not the same string: the heading
is the site's to write, the button's name is the family's, so the control
reads the same on every tool a visitor opens that week.
@default the chrome's own line, in the language of the page`},disabled:{required:!1,tsType:{name:`boolean`},description:"Whether there is nothing to hand over. A table that has not been computed\nyet says so by being greyed rather than by opening an empty dialog.\n@default whether there are no rows — and `false` where `rows` is a\nfunction, which is not called to find out"},buttonClassName:{required:!1,tsType:{name:`string`},description:`Class the button carries, so a site can reach it from its stylesheet — a
terminal whose green the chrome's muted grey is unreadable against, a
toolbar with its own metrics.
@default undefined`},testId:{required:!1,tsType:{name:`string`},description:"Value of the `data-testid` attribute of the button.\n@default undefined"},trigger:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(open: () => void) => ReactNode`,signature:{arguments:[{type:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},name:`open`}],return:{name:`ReactNode`}}},description:`The control in place of the Blueprint button, for a page whose chrome is
not Blueprint's — a \`react-science\` toolbar, a site's own toolbar button.
It is handed the function that opens the dialog.

It exists so the dialog, the separator, the copy, the save and the wording
are shared even where the button cannot be: a site that keeps its own
trigger should not also be keeping its own dialog.
@default a Blueprint button carrying the glyph and the text`}},composes:[`Omit`]}})))()}function _(e){return(0,v.jsxs)(`div`,{style:y,children:[(0,v.jsxs)(`div`,{style:b,children:[(0,v.jsx)(`h3`,{style:{margin:0,fontSize:14},children:`Compounds`}),e.button]}),(0,v.jsxs)(`table`,{className:`bp6-html-table bp6-compact bp6-html-table-bordered`,children:[(0,v.jsx)(`thead`,{children:(0,v.jsx)(`tr`,{children:l.map(e=>(0,v.jsx)(`th`,{children:e},e))})}),(0,v.jsx)(`tbody`,{children:s.map(e=>(0,v.jsx)(`tr`,{children:e.map((e,t)=>(0,v.jsx)(`td`,{children:e},l[t]??t))},e.join(`|`)))})]})]})}var v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{g(),c(),v=n(),y={display:`grid`,padding:24,gap:12,justifyItems:`start`},b={display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:8,width:`100%`},x={title:`Delimited/TableDataButton`,component:f,args:{rows:s,header:l,fileName:`molecules`},argTypes:{text:{control:`text`},title:{control:`text`},minimal:{control:`boolean`},small:{control:`boolean`},disabled:{control:`boolean`},defaultDelimiter:{control:`inline-radio`,options:[`tab`,`comma`,`semicolon`]}},parameters:{layout:`fullscreen`,docs:{description:{component:`The one control that takes a table off the page. It is named after what it does rather than after a separator, because the dialog behind it writes tab-, comma- or semicolon-separated text and a button that says TSV is wrong two times out of three.`}}},render:e=>(0,v.jsx)(_,{button:(0,v.jsx)(f,{...e})})},S={},C={args:{text:`Copy or download`,small:!0}},w={args:{rows:[]}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{}`,...S.parameters?.docs?.source},description:{story:`The glyph alone, which is what a toolbar over a table wants.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Copy or download',
    small: true
  }
}`,...C.parameters?.docs?.source},description:{story:`Named, for a card header with room for words.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    rows: []
  }
}`,...w.parameters?.docs?.source},description:{story:`Greyed by itself while the table is empty, rather than opening on nothing.`,...w.parameters?.docs?.description}}},T=[`Default`,`WithALabel`,`NothingToHandOver`]})))()}E();export{S as Default,w as NothingToHandOver,C as WithALabel,T as __namedExportsOrder,x as default};