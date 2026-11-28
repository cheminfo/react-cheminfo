import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-BtRvkyr9.js";function n(e){return(0,i.jsx)(`dl`,{className:`shortcut-list`,children:e.rows.map(e=>(0,i.jsxs)(`div`,{className:`shortcut-list__row`,children:[(0,i.jsx)(`dt`,{children:(0,i.jsx)(r,{keys:e.keys})}),(0,i.jsx)(`dd`,{children:e.label})]},e.keys.join(` `)))})}function r(e){return(0,i.jsx)(`span`,{className:`shortcut-keys`,children:e.keys.map(e=>(0,i.jsx)(`kbd`,{children:e},e))})}var i;function a(){return(a=e((()=>{i=t(),n.__docgenInfo={description:`Keys and what they do, one line each, the caps in a column of their own so
the eye runs down them.
@param props - The lines.
@param props.rows - The keys and what they do.
@returns The list.`,methods:[],displayName:`ShortcutList`,props:{rows:{required:!0,tsType:{name:`unknown`},description:``}}},r.__docgenInfo={description:`Keys drawn as caps, in the grey of a guide.
@param props - The keys.
@param props.keys - The keys.
@returns The caps.`,methods:[],displayName:`ShortcutKeys`,props:{keys:{required:!0,tsType:{name:`unknown`},description:``}}}})))()}export{n,a as r,r as t};