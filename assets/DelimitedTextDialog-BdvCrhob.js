import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-cfLMuLPB.js";import{n,t as r}from"./useT-CSBgn-9q.js";import{n as i,r as a}from"./buttons-usrako6t.js";import{n as o,t as s}from"./dialog-DkZ4tyxU.js";import{n as c,t as l}from"./dialogBody-DZZ2KjqF.js";import{n as u,t as d}from"./dialogFooter-dwl0dpeN.js";import{n as f,t as p}from"./DelimitedTextPanel-Crh-sfCM.js";function m(e){let{isOpen:t,onClose:r,title:a,className:o,...c}=e,u=n(),f=a??u(`delimited.copyTable`);return(0,h.jsxs)(s,{isOpen:t,onClose:r,title:f,icon:`th`,className:o,style:g,children:[(0,h.jsx)(l,{children:(0,h.jsx)(p,{...c,label:c.label??f})}),(0,h.jsx)(d,{actions:(0,h.jsx)(i,{text:u(`delimited.close`),onClick:r})})]})}var h,g;function _(){return(_=e((()=>{a(),o(),c(),u(),r(),f(),h=t(),g={width:`min(900px, 92vw)`},m.__docgenInfo={description:`The dialog every site rebuilt to hand a table over: the text, a choice of
separator, and a way to copy or save it.
@param props - See {@link DelimitedTextDialogProps}.
@returns The dialog.`,methods:[],displayName:`DelimitedTextDialog`,props:{rows:{required:!0,tsType:{name:`ReadonlyArray`,elements:[{name:`unknown`}],raw:`ReadonlyArray<readonly string[]>`},description:`The cells, one array per line.`},header:{required:!1,tsType:{name:`unknown`},description:`Column names, written as the first line.
@default undefined — the table is handed over without a header line`},description:{required:!1,tsType:{name:`ReactNode`},description:`What the visitor is told above the text. A sentence naming what the table
holds beats the generic one, which only counts the rows.
@default a line saying how many rows there are and what to do with them`},fileName:{required:!1,tsType:{name:`string`},description:`Base name of the saved file, without the extension — the extension follows
the chosen separator.
@default 'table'`},defaultDelimiter:{required:!1,tsType:{name:`union`,raw:`'tab' | 'comma' | 'semicolon'`,elements:[{name:`literal`,value:`'tab'`},{name:`literal`,value:`'comma'`},{name:`literal`,value:`'semicolon'`}]},description:`Which separator the panel opens on.
@default 'tab'`},downloadable:{required:!1,tsType:{name:`boolean`},description:`Whether a save button is offered beside the copy one.
@default true`},label:{required:!1,tsType:{name:`string`},description:`What the text area is called, for a screen reader reaching it.
@default 'The table, as text'`},height:{required:!1,tsType:{name:`number`},description:`Height of the text area, in pixels.
@default 320`},preview:{required:!1,tsType:{name:`ReactNode`},description:`What is shown in place of the text area. A caller with more rows than a
text area can hold — a spectrum of a hundred thousand points — passes its
own virtualized table here; what is copied and what is saved stay the
serialized text either way, so the preview can shorten a number the file
keeps in full.
@default undefined — the text itself, in a read-only text area`},className:{required:!1,tsType:{name:`string`},description:`Class names added to the root element, after the component's own.
@default undefined`},isOpen:{required:!0,tsType:{name:`boolean`},description:`Whether the dialog is open.`},onClose:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when the dialog is dismissed.`},title:{required:!1,tsType:{name:`string`},description:`Title of the dialog.
@default 'Copy the table'`}}}})))()}export{_ as n,m as t};