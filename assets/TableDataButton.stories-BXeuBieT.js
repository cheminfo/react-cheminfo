import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-B0AZ9GiM.js";import{n as r,t as i}from"./useT-j0duCwtG.js";import{n as a,r as o}from"./buttons-B0DwqJUy.js";import{n as s}from"./joinClassNames-BbK_6p9Z.js";import{n as c,r as l,t as u}from"./moleculeTable-CmKVt629.js";import{n as d,t as f}from"./DelimitedTextDialog-DHvTJtKc.js";function p(e){let{rows:t,text:n,icon:i=`th`,minimal:o=!0,small:c=!1,tooltip:l,disabled:u,testId:d,trigger:p,buttonClassName:_,...v}=e,y=r(),[b,x]=(0,m.useState)(null),S=l??y(`delimited.copyOrDownload`),C=u??(typeof t!=`function`&&t.length===0);function w(){x(typeof t==`function`?t():t)}return(0,h.jsxs)(h.Fragment,{children:[p?p(w):(0,h.jsx)(a,{className:s(`no-print`,_),icon:i,text:n,variant:o?`minimal`:`solid`,size:c?`small`:`medium`,disabled:C,title:S,"aria-label":n??S,"data-testid":d,onClick:w}),(0,h.jsx)(f,{...v,rows:b??g,isOpen:b!==null,onClose:()=>x(null)})]})}var m,h,g;function _(){return(_=e((()=>{o(),m=t(),i(),d(),h=n(),g=[],p.__docgenInfo={description:`The one control that takes a table off the page: copy it, or save it.

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
@default a Blueprint button carrying the glyph and the text`}},composes:[`Omit`]}})))()}function v(e){return(0,y.jsxs)(`div`,{style:b,children:[(0,y.jsxs)(`div`,{style:x,children:[(0,y.jsx)(`h3`,{style:{margin:0,fontSize:14},children:`Compounds`}),e.button]}),(0,y.jsxs)(`table`,{className:`bp6-html-table bp6-compact bp6-html-table-bordered`,children:[(0,y.jsx)(`thead`,{children:(0,y.jsx)(`tr`,{children:u.map(e=>(0,y.jsx)(`th`,{children:e},e))})}),(0,y.jsx)(`tbody`,{children:c.map(e=>(0,y.jsx)(`tr`,{children:e.map((e,t)=>(0,y.jsx)(`td`,{children:e},u[t]??t))},e.join(`|`)))})]})]})}var y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{_(),l(),y=n(),b={display:`grid`,padding:24,gap:12,justifyItems:`start`},x={display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:8,width:`100%`},S={title:`Delimited/TableDataButton`,component:p,args:{rows:c,header:u,fileName:`molecules`},argTypes:{text:{control:`text`},title:{control:`text`},minimal:{control:`boolean`},small:{control:`boolean`},disabled:{control:`boolean`},defaultDelimiter:{control:`inline-radio`,options:[`tab`,`comma`,`semicolon`]}},parameters:{layout:`fullscreen`,docs:{description:{component:`The one control that takes a table off the page. It is named after what it does rather than after a separator, because the dialog behind it writes tab-, comma- or semicolon-separated text and a button that says TSV is wrong two times out of three.`}}},render:e=>(0,y.jsx)(v,{button:(0,y.jsx)(p,{...e})})},C={},w={args:{text:`Copy or download`,small:!0}},T={args:{rows:[]}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source},description:{story:`The glyph alone, which is what a toolbar over a table wants.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Copy or download',
    small: true
  }
}`,...w.parameters?.docs?.source},description:{story:`Named, for a card header with room for words.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    rows: []
  }
}`,...T.parameters?.docs?.source},description:{story:`Greyed by itself while the table is empty, rather than opening on nothing.`,...T.parameters?.docs?.description}}},E=[`Default`,`WithALabel`,`NothingToHandOver`]})))()}D();export{C as Default,T as NothingToHandOver,w as WithALabel,E as __namedExportsOrder,S as default};