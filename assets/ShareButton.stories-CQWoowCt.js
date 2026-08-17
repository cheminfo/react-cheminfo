import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-BDQJEmVY.js";import"./chrome-DvEgqYt1.js";import{n,t as r}from"./ShareButton-CcsvRMV-.js";var i,a,o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{n(),i=t(),a={display:`grid`,width:`min(60rem, 90vw)`,gap:8},o={margin:0,color:`var(--text-muted)`,fontSize:12,textAlign:`right`},s={title:`Share/ShareButton`,component:r,args:{onClick:()=>void 0},argTypes:{variant:{control:`radio`,options:[`nav-link`,`blueprint`]},label:{control:`text`},title:{control:`text`},compact:{control:`boolean`},onClick:{control:!1}},parameters:{docs:{description:{component:`The Share entry of a site header, in the dress the surrounding bar asks for. What it opens is the site’s business.`}}}},c={},l={args:{variant:`blueprint`}},u={args:{compact:!0}},d={args:{label:`Embed this page`}},f={parameters:{layout:`padded`},render:e=>(0,i.jsxs)(`div`,{style:a,children:[(0,i.jsxs)(`div`,{className:`sb-header`,children:[(0,i.jsx)(r,{...e,variant:`nav-link`}),(0,i.jsx)(r,{...e,variant:`blueprint`})]}),(0,i.jsx)(`p`,{style:o,children:`nav-link on the left, blueprint on the right — the bar reads as one menu either way.`})]})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source},description:{story:"A plain entry of a site's own bar, carrying `nav-link` like the pages do.",...c.parameters?.docs?.description}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'blueprint'
  }
}`,...l.parameters?.docs?.source},description:{story:`The Blueprint dress, for a toolbar already made of Blueprint buttons.`,...l.parameters?.docs?.description}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...u.parameters?.docs?.source},description:{story:`Reduced to its icon for a bar out of room; still named to a screen reader.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Embed this page'
  }
}`,...d.parameters?.docs?.source},description:{story:`Renamed, for a site that hands out course tiles rather than links.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: args => <div style={COLUMN_STYLE}>
      <div className="sb-header">
        <ShareButton {...args} variant="nav-link" />
        <ShareButton {...args} variant="blueprint" />
      </div>
      <p style={CAPTION_STYLE}>
        nav-link on the left, blueprint on the right — the bar reads as one menu
        either way.
      </p>
    </div>
}`,...f.parameters?.docs?.source},description:{story:`The two dresses side by side, where the button lives: the right of a bar.`,...f.parameters?.docs?.description}}},p=[`Default`,`AsBlueprintButton`,`Compact`,`CustomLabel`,`InHeader`]})))()}m();export{l as AsBlueprintButton,u as Compact,d as CustomLabel,c as Default,f as InHeader,p as __namedExportsOrder,s as default};