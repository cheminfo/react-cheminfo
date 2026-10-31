import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-CFVqFo_y.js";import{o as r,s as i}from"./InlineText-B_YL2ki8.js";function a(e){let{glossary:t,renderExample:n,renderCode:i,renderMf:a,children:c}=e,l=(0,o.useMemo)(()=>({glossary:t,renderExample:n,renderCode:i,renderMf:a}),[t,n,i,a]);return(0,s.jsx)(r.Provider,{value:l,children:c})}var o,s;function c(){return(c=e((()=>{o=t(),i(),s=n(),a.__docgenInfo={description:`Hand a glossary to every piece of prose below it.

Wrap the whole tool once, high enough that a tutorial step, an exercise
description and a revealed hint all sit under it: they are the three places
jargon is linked, and they must define a term — and draw its examples — the
same way.
@param props - The terms, how their examples are drawn, and the tree that
uses them.
@returns The tree, with the glossary in reach.`,methods:[],displayName:`GlossaryProvider`,props:{glossary:{required:!0,tsType:{name:`Record`,elements:[{name:`string`},{name:`GlossaryEntry`,elements:[{name:`TExample`}],raw:`GlossaryEntry<TExample>`}],raw:`Record<
  string,
  GlossaryEntry<TExample>
>`},description:`Every term the site defines, keyed by the lowercased text of a marker.`},renderExample:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(example: TExample) => ReactNode`,signature:{arguments:[{type:{name:`TExample`},name:`example`}],return:{name:`ReactNode`}}},description:`Draws the illustration of an example, wherever a definition below shows
one: a structure for a SMILES, a typeset formula for LaTeX. The note of the
example is still written under it. Needed whenever the examples are not
\`{ code, input, note }\`.
@default undefined — an example is its code, and the input it runs on`},renderCode:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(code: string) => ReactNode`,signature:{arguments:[{type:{name:`string`},name:`code`}],return:{name:`ReactNode`}}},description:"Draws the code spans of the prose below.\n@default undefined — a plain `<code>`"},renderMf:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(mf: string) => ReactNode`,signature:{arguments:[{type:{name:`string`},name:`mf`}],return:{name:`ReactNode`}}},description:"Draws the `{{C6H6O}}` formulas of the prose below. A chemistry site passes\n`(mf) => <MF mf={mf} />` from `react-mf` here and every formula under the\nprovider — a step, a question, a hint, a definition — is then drawn by it.\n@default undefined — the formula as typed"},children:{required:!0,tsType:{name:`ReactNode`},description:`The part of the page whose prose resolves its markers against it.`}}}})))()}export{c as n,a as t};