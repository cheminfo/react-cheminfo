import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-C_0-xZ4H.js";import{n,t as r}from"./useT-DdDrCs00.js";import{n as i,r as a}from"./buttons-DFytC0DQ.js";import{n as o,r as s,t as c}from"./useCopyToClipboard-BPtpijWE.js";function l(e){let{content:t,label:r,copiedLabel:a,failedLabel:o,minimal:l=!1,small:f=!1,icon:p=`clipboard`,disabled:m=!1,resetAfter:h=c,title:g,className:_}=e,v=n(),{copied:y,failed:b,copy:x}=s(h),S=g??v(`clipboard.copyToClipboard`),C=u({copied:y,failed:b,icon:p,label:r,copiedLabel:a??v(`clipboard.copied`),failedLabel:o??v(`clipboard.failed`)});return(0,d.jsx)(i,{className:_,variant:l?`minimal`:`solid`,size:f?`small`:`medium`,icon:C.icon,intent:C.intent,text:C.text,disabled:m,title:S,"aria-label":r??S,onClick:()=>{x(typeof t==`function`?t():t)}})}function u(e){let{copied:t,failed:n,icon:r,label:i,copiedLabel:a,failedLabel:o}=e,s=i!==void 0;return t?{icon:`tick`,intent:`success`,text:s?a:void 0}:n?{icon:`cross`,intent:`danger`,text:s?o:void 0}:{icon:r,intent:`none`,text:i}}var d;function f(){return(f=e((()=>{a(),r(),o(),d=t(),l.__docgenInfo={description:`A button that puts a piece of text on the clipboard and says so — with a
tick when it worked, and a cross when the browser refused it.
@param props - What to copy, what the button reads, and how it looks.
@returns The copy button.`,methods:[],displayName:`CopyButton`,props:{content:{required:!0,tsType:{name:`union`,raw:`string | (() => string)`,elements:[{name:`string`},{name:`unknown`}]},description:`What to copy. A function is called when the button is pressed, which is
what a whole list has to be: writing ten thousand structures out on every
render, for a button nobody may press, is a page that stutters as it is
scrolled.`},label:{required:!1,tsType:{name:`string`},description:`Text of the button. Left out for an icon-only button, which is what a
dense row of them needs.
@default undefined — the button is reduced to its icon`},copiedLabel:{required:!1,tsType:{name:`string`},description:`Text shown while the copy is being confirmed, when there is a label.
@default the chrome's own word for it, in the language of the page`},failedLabel:{required:!1,tsType:{name:`string`},description:`Text shown while a refused copy is being reported, when there is a label.
@default the chrome's own line, in the language of the page`},minimal:{required:!1,tsType:{name:`boolean`},description:`Whether the button drops its background, for a toolbar or a code block.
@default false`},small:{required:!1,tsType:{name:`boolean`},description:`Whether the button is the small size.
@default false`},icon:{required:!1,tsType:{name:`IconName`},description:`Glyph shown at rest. A tick replaces it while the copy is confirmed.
@default 'clipboard'`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether there is nothing to copy.
@default false`},resetAfter:{required:!1,tsType:{name:`number`},description:`How long the button says it copied, in milliseconds.
@default 1500`},title:{required:!1,tsType:{name:`string`},description:`What the pointer and a screen reader are told.
@default the chrome's own line, in the language of the page`},className:{required:!1,tsType:{name:`string`},description:`Class the button carries, so a site can reach it from its stylesheet.
@default undefined`}}}})))()}export{f as n,l as t};