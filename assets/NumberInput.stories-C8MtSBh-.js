import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-Bd-zJEJD.js";import{n as r,t as i}from"./NumberInput-C8XC-aQI.js";function a(e){let[t,n]=(0,s.useState)(e.value);return(0,c.jsxs)(`div`,{style:m,children:[(0,c.jsx)(i,{...e,allowEmpty:!0,value:t,onChange:e=>n(e)}),(0,c.jsx)(`code`,{style:h,"data-testid":`held`,children:t===void 0?`nothing`:String(t)})]})}function o(){}var s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{s=t(),r(),c=n(),l={title:`Number/NumberInput`,component:i,args:{value:.1,step:.01,min:0,ariaLabel:`Concentration`,onChange:o},argTypes:{value:{control:`number`},step:{control:`number`},min:{control:`number`},max:{control:`number`},integer:{control:`boolean`},buttons:{control:`boolean`}},parameters:{layout:`padded`,docs:{description:{component:`A number typed a keystroke at a time: the box keeps the text, the page keeps the number, and the bounds wait until the box is left.`}}},render:e=>(0,c.jsx)(`div`,{style:{width:200},children:(0,c.jsx)(a,{...e})})},u={},d={args:{value:200,min:10,max:2e3,step:50,integer:!0}},f={args:{value:-1.5,min:-5,max:5,step:.1,buttons:!1}},p={args:{value:void 0,allowEmpty:!0,stepFrom:12,min:1,step:.5,placeholder:`Mixed`}},m={display:`flex`,flexDirection:`column`,gap:8},h={fontSize:12},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source},description:{story:"A concentration in mol/L, where `0.2` has to survive being typed.",...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:`A box in a table, where the buttons would not fit.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: undefined,
    allowEmpty: true,
    stepFrom: 12,
    min: 1,
    step: 0.5,
    placeholder: 'Mixed'
  }
}`,...p.parameters?.docs?.source},description:{story:`A box standing for the heights of shapes selected together, which differ:
it is empty, and its steppers start from the first shape's 12.`,...p.parameters?.docs?.description}}},g=[`Default`,`WholeNumbers`,`NoButtons`,`Mixed`]})))()}_();export{u as Default,p as Mixed,f as NoButtons,d as WholeNumbers,g as __namedExportsOrder,l as default};