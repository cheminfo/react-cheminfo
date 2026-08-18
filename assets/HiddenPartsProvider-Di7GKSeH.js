import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{f as t,n}from"./iframe-CGFjf9cs.js";import{h as r,m as i}from"./sharePanels-CsvMCeC9.js";function a(e){let{hidden:t,children:n}=e,r=(0,o.useMemo)(()=>new Set(t),[t]);return(0,s.jsx)(i.Provider,{value:r,children:n})}var o,s;function c(){return(c=e((()=>{o=t(),r(),s=n(),a.__docgenInfo={description:`Put the configuration of the current link where every part of the page can
read it, so nothing has to be threaded through props.
@param props - The parts the link switches off, and the page.
@returns The page, under the configuration.`,methods:[],displayName:`HiddenPartsProvider`,props:{hidden:{required:!1,tsType:{name:`unknown`},description:`The parts the link switches off — the \`hidden\` of the parsed
configuration.
@default [] — nothing is switched off`},children:{required:!0,tsType:{name:`ReactNode`},description:`The page, and everything in it that may ask what is hidden.`}}}})))()}export{c as n,a as t};