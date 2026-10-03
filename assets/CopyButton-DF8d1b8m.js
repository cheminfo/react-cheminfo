import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DS2CryJ6.js";import{n,t as r}from"./useT-DBVeIM0y.js";import{n as i,r as a}from"./buttons-B8YFhXAZ.js";import{n as o}from"./joinClassNames-BbK_6p9Z.js";import{n as s,r as c,t as l}from"./useCopyToClipboard-CsPGPGdk.js";function u(e){let{content:t,label:r,copiedLabel:a,failedLabel:s,minimal:u=!1,small:p=!1,icon:m=`clipboard`,disabled:h=!1,resetAfter:g=l,title:_,className:v}=e,y=n(),{copied:b,failed:x,copy:S}=c(g),C=_??y(`clipboard.copyToClipboard`),w=d({copied:b,failed:x,icon:m,label:r,copiedLabel:a??y(`clipboard.copied`),failedLabel:s??y(`clipboard.failed`)});return(0,f.jsx)(i,{className:o(`no-print`,v),variant:u?`minimal`:`solid`,size:p?`small`:`medium`,icon:w.icon,intent:w.intent,text:w.text,disabled:h,title:C,"aria-label":r??C,onClick:()=>{S(typeof t==`function`?t():t)}})}function d(e){let{copied:t,failed:n,icon:r,label:i,copiedLabel:a,failedLabel:o}=e,s=i!==void 0;return t?{icon:`tick`,intent:`success`,text:s?a:void 0}:n?{icon:`cross`,intent:`danger`,text:s?o:void 0}:{icon:r,intent:`none`,text:i}}var f;function p(){return(p=e((()=>{a(),r(),s(),f=t(),u.__docgenInfo={description:`A button that puts a piece of text on the clipboard and says so — with a
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
@default 1500`},title:{required:!1,tsType:{name:`string`},description:`What the pointer and a screen reader are told. An empty string drops the
hover title, for a button that already sits in a tooltip of its own.
@default the chrome's own line, in the language of the page`},className:{required:!1,tsType:{name:`string`},description:`Class the button carries, so a site can reach it from its stylesheet.
@default undefined`}}}})))()}export{p as n,u as t};