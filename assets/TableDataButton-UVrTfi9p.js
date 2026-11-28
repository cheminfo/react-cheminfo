import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-BtRvkyr9.js";import{n as r,t as i}from"./useT-CTuLF7uC.js";import{n as a,r as o}from"./buttons-DNFHxDDC.js";import{n as s}from"./joinClassNames-BbK_6p9Z.js";import{n as c,t as l}from"./DelimitedTextDialog-DyRAxImq.js";function u(e){let{rows:t,text:n,icon:i=`th`,minimal:o=!0,small:c=!1,tooltip:u,disabled:m,testId:h,trigger:g,buttonClassName:_,...v}=e,y=r(),[b,x]=(0,d.useState)(null),S=u??y(`delimited.copyOrDownload`),C=m??(typeof t!=`function`&&t.length===0);function w(){x(typeof t==`function`?t():t)}return(0,f.jsxs)(f.Fragment,{children:[g?g(w):(0,f.jsx)(a,{className:s(`no-print`,_),icon:i,text:n,variant:o?`minimal`:`solid`,size:c?`small`:`medium`,disabled:C,title:S,"aria-label":n??S,"data-testid":h,onClick:w}),(0,f.jsx)(l,{...v,rows:b??p,isOpen:b!==null,onClose:()=>x(null)})]})}var d,f,p;function m(){return(m=e((()=>{o(),d=t(),i(),c(),f=n(),p=[],u.__docgenInfo={description:`The one control that takes a table off the page: copy it, or save it.

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
@default a Blueprint button carrying the glyph and the text`}},composes:[`Omit`]}})))()}export{m as n,u as t};