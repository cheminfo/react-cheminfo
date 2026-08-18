import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./iframe-Ce8kprmR.js";import{c as n,l as r,o as i,s as a}from"./chromeFixtures-D6r5xMBu.js";import"./chrome-DvEgqYt1.js";var o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{r(),i(),o=t(),s={display:`flex`,height:`var(--header-height)`,alignItems:`center`,padding:`0 1.25rem`,border:`1px solid var(--border)`,borderRadius:`var(--radius)`,background:`var(--surface)`,boxShadow:`var(--shadow-sm)`,gap:`0.15rem`},c={margin:`0.75rem 0 0`,color:`var(--text-muted)`,fontSize:`0.8125rem`},l={padding:`0 0.35rem`,borderRadius:999,background:`var(--surface-sunken)`,color:`var(--text-muted)`,fontSize:`0.75rem`},u={title:`Chrome/NavLink`,component:n,args:{item:{id:`tutorial`,label:`Tutorial`,href:`/tutorial`},active:!1},argTypes:{item:{control:!1},active:{control:`boolean`},className:{control:`text`}},parameters:{docs:{description:{component:`One entry of a site bar, drawn as a link when it has an address and as a button when it has none.`}}}},d={},f={args:{active:!0}},p={args:{item:{id:`exercises`,label:`Exercises`,href:`/exercises`,icon:`lab-test`}}},m={args:{item:{id:`clear`,label:`Clear answers`,icon:`eraser`,onSelect:a}}},h={parameters:{layout:`padded`},render:()=>(0,o.jsxs)(`div`,{children:[(0,o.jsxs)(`div`,{style:s,children:[(0,o.jsx)(n,{item:{id:`draw`,label:`Draw`,href:`/`},active:!0}),(0,o.jsx)(n,{item:{id:`tutorial`,label:`Tutorial`,href:`/tutorial`}}),(0,o.jsx)(n,{item:{id:`clear`,label:`Clear answers`,onSelect:a}})]}),(0,o.jsx)(`p`,{style:c,children:`Draw and Tutorial are links. Clear answers is a button.`})]})},g={args:{item:{id:`specification`,label:`OpenSMILES`,href:`https://opensmiles.org/opensmiles.html`,icon:`document-open`,external:!0,title:`The OpenSMILES specification`}}},_={args:{item:{id:`exercises`,label:`Exercises`,href:`/exercises`,icon:`lab-test`,after:(0,o.jsx)(`span`,{style:l,children:`7/20`})}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    active: true
  }
}`,...f.parameters?.docs?.source},description:{story:`The one entry of a bar the brand tint is ever spent on.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    item: {
      id: 'exercises',
      label: 'Exercises',
      href: '/exercises',
      icon: 'lab-test'
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    item: {
      id: 'clear',
      label: 'Clear answers',
      icon: 'eraser',
      onSelect: noop
    }
  }
}`,...m.parameters?.docs?.source},description:{story:"An entry with no address is a button, and carries `nav-link` all the same.",...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: () => <div>
      <div style={BAR_STYLE}>
        <NavLink item={{
        id: 'draw',
        label: 'Draw',
        href: '/'
      }} active />
        <NavLink item={{
        id: 'tutorial',
        label: 'Tutorial',
        href: '/tutorial'
      }} />
        <NavLink item={{
        id: 'clear',
        label: 'Clear answers',
        onSelect: noop
      }} />
      </div>
      <p style={CAPTION_STYLE}>
        Draw and Tutorial are links. Clear answers is a button.
      </p>
    </div>
}`,...h.parameters?.docs?.source},description:{story:`A link and a button beside each other: the row has to read as one menu, so
nothing in either says which is which.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    item: {
      id: 'specification',
      label: 'OpenSMILES',
      href: 'https://opensmiles.org/opensmiles.html',
      icon: 'document-open',
      external: true,
      title: 'The OpenSMILES specification'
    }
  }
}`,...g.parameters?.docs?.source},description:{story:`An address that leaves the site opens in a tab of its own.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    item: {
      id: 'exercises',
      label: 'Exercises',
      href: '/exercises',
      icon: 'lab-test',
      after: <span style={COUNT_STYLE}>7/20</span>
    }
  }
}`,..._.parameters?.docs?.source},description:{story:`What follows the label — a count, a tag, anything the page reports.`,..._.parameters?.docs?.description}}},v=[`Default`,`Active`,`WithIcon`,`AsButton`,`LinkAndButton`,`External`,`WithCount`]})))()}y();export{f as Active,m as AsButton,d as Default,g as External,h as LinkAndButton,_ as WithCount,p as WithIcon,v as __namedExportsOrder,u as default};