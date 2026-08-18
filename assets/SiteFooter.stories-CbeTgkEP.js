import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-DOiypc2O.js";import{i as n,r}from"./lookup-BPEw8KfH.js";import"./chrome-DvEgqYt1.js";import{n as i,t as a}from"./SiteFooter-CfuRQffm.js";var o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{i(),n(),o=t(),s=r.map(e=>e.id),c={display:`flex`,minHeight:`22rem`,flexDirection:`column`,justifyContent:`flex-end`,background:`var(--surface-sunken)`},l={padding:`1.25rem`,margin:0,color:`var(--text-muted)`,fontSize:`0.8125rem`},u={paddingTop:`0.75rem`,margin:0,color:`var(--text-muted)`,fontSize:`0.75rem`},d={title:`Chrome/SiteFooter`,component:a,args:{siteId:`smiles`,layout:`grid`,embedded:!1},argTypes:{siteId:{control:`select`,options:s},layout:{control:`inline-radio`,options:[`grid`,`row`]},heading:{control:`text`},embedded:{control:`boolean`},children:{control:!1}},parameters:{layout:`fullscreen`,docs:{description:{component:`The strip under every page of the family: each sibling site as a plain link, so a crawler and a reader walk from one of our tools to the next.`}}},render:e=>(0,o.jsx)(`div`,{style:c,children:(0,o.jsx)(a,{...e})})},f={},p={args:{layout:`row`}},m={args:{heading:`The rest of the cheminfo toolbox`}},h={args:{layout:`row`,children:(0,o.jsxs)(`p`,{style:u,children:[`MIT licensed · v2.4.0 ·`,` `,(0,o.jsx)(`a`,{href:`https://github.com/cheminfo/smiles.cheminfo.org`,children:`Source`})]})}},g={render:e=>(0,o.jsxs)(`div`,{style:c,children:[(0,o.jsxs)(`p`,{style:l,children:[`With `,(0,o.jsx)(`code`,{children:`embedded`}),`, nothing is drawn below this line.`]}),(0,o.jsx)(a,{...e,embedded:!0})]})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    layout: 'row'
  }
}`,...p.parameters?.docs?.source},description:{story:`The names only, for a footer with no room for fifteen taglines.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'The rest of the cheminfo toolbox'
  }
}`,...m.parameters?.docs?.source},description:{story:`What introduces the family is the site's to write.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    layout: 'row',
    children: <p style={SITE_LINE_STYLE}>
        MIT licensed · v2.4.0 ·{' '}
        <a href="https://github.com/cheminfo/smiles.cheminfo.org">Source</a>
      </p>
  }
}`,...h.parameters?.docs?.source},description:{story:`Whatever the site adds under the family: a licence, a version, the sources.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => <div style={PAGE_STYLE}>
      <p style={CAPTION_STYLE}>
        With <code>embedded</code>, nothing is drawn below this line.
      </p>
      <SiteFooter {...args} embedded />
    </div>
}`,...g.parameters?.docs?.source},description:{story:`A framed page is given no footer at all, exactly as it is given no bar.`,...g.parameters?.docs?.description}}},_=[`Default`,`Row`,`CustomHeading`,`WithSiteLine`,`Embedded`]})))()}v();export{m as CustomHeading,f as Default,g as Embedded,p as Row,h as WithSiteLine,_ as __namedExportsOrder,d as default};