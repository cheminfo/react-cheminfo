import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-NhtRTM8t.js";import{n,r,t as i}from"./paper-DSkDr5Uk.js";import{n as a,t as o}from"./CiteButton-KaM9KNy_.js";import{r as s,t as c}from"./headerButton-DRQf5QD1.js";var l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{a(),s(),r(),l=t(),u={title:`Citation/CiteButton`,component:o,argTypes:c,parameters:{docs:{description:{component:"The Cite entry of a site header. Open it, hover an entry for the preview, and the styles sit in the submenu. A site built on several works passes `works` rather than `reference`, and each is listed behind what citing it credits."}}}},d={args:{reference:i}},f={args:{reference:i,label:`Cite this work`}},p={args:{reference:i,placement:`bottom-start`}},m={args:{reference:i,compact:!0}},h={args:{works:n}},g={args:{works:n,guidance:`Cite the calculator, and the platform it runs on`}},_={args:{reference:i},parameters:{layout:`padded`},render:e=>(0,l.jsx)(`div`,{className:`sb-header`,style:{width:`min(60rem, 90vw)`},children:(0,l.jsx)(o,{...e})})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    reference: PAPER
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    reference: PAPER,
    label: 'Cite this work'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    reference: PAPER,
    placement: 'bottom-start'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    reference: PAPER,
    compact: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    works: PAPERS
  }
}`,...h.parameters?.docs?.source},description:{story:`A site built on two works: what each one is, and both copied at once.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    works: PAPERS,
    guidance: 'Cite the calculator, and the platform it runs on'
  }
}`,...g.parameters?.docs?.source},description:{story:`The line heading the works is the site's to write.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    reference: PAPER
  },
  parameters: {
    layout: 'padded'
  },
  render: (args: CiteButtonProps) => <div className="sb-header" style={{
    width: 'min(60rem, 90vw)'
  }}>
      <CiteButton {...args} />
    </div>
}`,..._.parameters?.docs?.source},description:{story:`The button where it actually lives: pushed to the right of a site's bar.`,..._.parameters?.docs?.description}}},v=[`Default`,`CustomLabel`,`BottomStart`,`Compact`,`SeveralWorks`,`OwnGuidance`,`InHeader`]})))()}y();export{p as BottomStart,m as Compact,f as CustomLabel,d as Default,_ as InHeader,g as OwnGuidance,h as SeveralWorks,v as __namedExportsOrder,u as default};