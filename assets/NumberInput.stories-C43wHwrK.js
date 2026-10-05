import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-C7WJnCty.js";import{n as r,t as i}from"./NumberInput-BJhuMDUP.js";function a(e){let[t,n]=(0,s.useState)(e.value);return(0,c.jsxs)(`div`,{style:p,children:[(0,c.jsx)(i,{...e,allowEmpty:!0,value:t,onChange:e=>n(e)}),(0,c.jsx)(`code`,{style:m,"data-testid":`held`,children:t===void 0?`nothing`:String(t)})]})}function o(){}var s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{s=t(),r(),c=n(),l={title:`Number/NumberInput`,component:i,args:{value:.1,step:.01,min:0,ariaLabel:`Concentration`,onChange:o},argTypes:{value:{control:`number`},step:{control:`number`},min:{control:`number`},max:{control:`number`},integer:{control:`boolean`},buttons:{control:`boolean`}},parameters:{layout:`padded`,docs:{description:{component:`A number typed a keystroke at a time: the box keeps the text, the page keeps the number, and the bounds wait until the box is left.`}}},render:e=>(0,c.jsx)(`div`,{style:{width:200},children:(0,c.jsx)(a,{...e})})},u={},d={args:{value:200,min:10,max:2e3,step:50,integer:!0}},f={args:{value:-1.5,min:-5,max:5,step:.1,buttons:!1}},p={display:`flex`,flexDirection:`column`,gap:8},m={fontSize:12},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source},description:{story:"A concentration in mol/L, where `0.2` has to survive being typed.",...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    value: 200,
    min: 10,
    max: 2000,
    step: 50,
    integer: true
  }
}`,...d.parameters?.docs?.source},description:{story:`A count of points, where a typed decimal is rounded when the box is left.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    value: -1.5,
    min: -5,
    max: 5,
    step: 0.1,
    buttons: false
  }
}`,...f.parameters?.docs?.source},description:{story:`A box in a table, where the buttons would not fit.`,...f.parameters?.docs?.description}}},h=[`Default`,`WholeNumbers`,`NoButtons`]})))()}g();export{u as Default,f as NoButtons,d as WholeNumbers,h as __namedExportsOrder,l as default};