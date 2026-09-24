import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DtjHlAuk.js";import{n,r}from"./buttons-DtizMLnO.js";import{n as i,r as a,t as o}from"./useCopyToClipboard-Dz7iRJm5.js";function s(e){let{content:t,label:r,copiedLabel:i=`Copied`,failedLabel:s=`Copy failed`,minimal:u=!1,small:d=!1,icon:f=`clipboard`,disabled:p=!1,resetAfter:m=o,title:h=`Copy to clipboard`,className:g}=e,{copied:_,failed:v,copy:y}=a(m),b=c({copied:_,failed:v,icon:f,label:r,copiedLabel:i,failedLabel:s});return(0,l.jsx)(n,{className:g,variant:u?`minimal`:`solid`,size:d?`small`:`medium`,icon:b.icon,intent:b.intent,text:b.text,disabled:p,title:h,"aria-label":r??h,onClick:()=>{y(typeof t==`function`?t():t)}})}function c(e){let{copied:t,failed:n,icon:r,label:i,copiedLabel:a,failedLabel:o}=e,s=i!==void 0;return t?{icon:`tick`,intent:`success`,text:s?a:void 0}:n?{icon:`cross`,intent:`danger`,text:s?o:void 0}:{icon:r,intent:`none`,text:i}}var l;function u(){return(u=e((()=>{r(),i(),l=t(),s.__docgenInfo={description:`A button that puts a piece of text on the clipboard and says so — with a
tick when it worked, and a cross when the browser refused it.
@param props - What to copy, what the button reads, and how it looks.
@returns The copy button.`,methods:[],displayName:`CopyButton`,props:{content:{required:!0,tsType:{name:`union`,raw:`string | (() => string)`,elements:[{name:`string`},{name:`unknown`}]},description:`What to copy. A function is called when the button is pressed, which is
what a whole list has to be: writing ten thousand structures out on every
render, for a button nobody may press, is a page that stutters as it is
scrolled.`},label:{required:!1,tsType:{name:`string`},description:`Text of the button. Left out for an icon-only button, which is what a
dense row of them needs.
@default undefined — the button is reduced to its icon`},copiedLabel:{required:!1,tsType:{name:`string`},description:`Text shown while the copy is being confirmed, when there is a label.
@default 'Copied'`},failedLabel:{required:!1,tsType:{name:`string`},description:`Text shown while a refused copy is being reported, when there is a label.
@default 'Copy failed'`},minimal:{required:!1,tsType:{name:`boolean`},description:`Whether the button drops its background, for a toolbar or a code block.
@default false`},small:{required:!1,tsType:{name:`boolean`},description:`Whether the button is the small size.
@default false`},icon:{required:!1,tsType:{name:`IconName`},description:`Glyph shown at rest. A tick replaces it while the copy is confirmed.
@default 'clipboard'`},disabled:{required:!1,tsType:{name:`boolean`},description:`Whether there is nothing to copy.
@default false`},resetAfter:{required:!1,tsType:{name:`number`},description:`How long the button says it copied, in milliseconds.
@default 1500`},title:{required:!1,tsType:{name:`string`},description:`What the pointer and a screen reader are told.
@default 'Copy to clipboard'`},className:{required:!1,tsType:{name:`string`},description:`Class the button carries, so a site can reach it from its stylesheet.
@default undefined`}}}})))()}export{u as n,s as t};