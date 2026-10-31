import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-BREZSgVw.js";import{n,t as r}from"./useT-CYnDXP0o.js";import{n as i,r as a}from"./buttons-TVWsTnML.js";function o(e){let{onCheck:t,checkLabel:r,checkDisabled:a=!1,onRevealHint:o,hintsRevealed:l=0,hintCount:u=0,onToggleSolution:d,showSolution:f=!1,onReset:p,children:m,className:h}=e,g=n();return(0,s.jsxs)(`div`,{className:h,style:c,children:[t!==void 0&&(0,s.jsx)(i,{intent:`primary`,icon:`tick`,text:r??g(`pedagogy.check`),disabled:a,onClick:t}),o!==void 0&&(0,s.jsx)(i,{icon:`lightbulb`,text:g(`pedagogy.revealHintCount`,{revealed:Math.min(l,u),total:u}),disabled:l>=u,onClick:o}),d!==void 0&&(0,s.jsx)(i,{icon:f?`eye-off`:`key`,text:g(f?`pedagogy.hideSolution`:`pedagogy.revealSolution`),onClick:d}),p!==void 0&&(0,s.jsx)(i,{icon:`reset`,text:g(`pedagogy.reset`),onClick:p}),m]})}var s,c;function l(){return(l=e((()=>{a(),r(),s=t(),c={display:`flex`,flexWrap:`wrap`,gap:6},o.__docgenInfo={description:`The row of controls under an exercise: Check, Reveal hint, the solution, and
Reset.

Every one of them is optional, because a tool that grades live has no Check
and a tool with a single-field answer has no Reset — what matters is that the
ones a tool does offer read the same and sit in the same order everywhere.
@param props - The actions the exercise offers.
@returns The row.`,methods:[],displayName:`ExerciseActions`,props:{onCheck:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Records the attempt. Grading itself runs on every keystroke, so this
button commits the verdict rather than producing it.
@default undefined — no Check button`},checkLabel:{required:!1,tsType:{name:`string`},description:`Text of the Check button.
@default the chrome's own words for it, in the language of the page`},checkDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether checking is impossible yet — nothing typed, nothing drawn.
@default false`},onRevealHint:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Opens the next hint.
@default undefined — no hint button; the ladder may carry its own`},hintsRevealed:{required:!1,tsType:{name:`number`},description:`How many hints are already open, for the button's count.
@default 0`},hintCount:{required:!1,tsType:{name:`number`},description:`How many hints the exercise has, for the button's count.
@default 0`},onToggleSolution:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Shows or hides the sample answer. Never gated behind anything: getting
stuck and reading the answer is part of how the intuition is built.
@default undefined — no solution button`},showSolution:{required:!1,tsType:{name:`boolean`},description:`Whether the sample answer is on screen, which is what the button offers to
undo.
@default false`},onReset:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Puts the exercise back to a blank answer, no hints and no solution.
@default undefined — no Reset button`},children:{required:!1,tsType:{name:`ReactNode`},description:`The buttons this tool adds — show the diagram, show the 3D view — rendered
after the four standard ones.
@default undefined`},className:{required:!1,tsType:{name:`string`},description:`Class the row carries, so a site can reach it from its stylesheet.
@default undefined`}}}})))()}export{l as n,o as t};