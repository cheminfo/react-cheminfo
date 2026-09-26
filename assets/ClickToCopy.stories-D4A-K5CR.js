import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{h as t,n}from"./iframe-Bi73MxDJ.js";import{n as r,t as i}from"./ClickToCopy-BghLo9aG.js";var a,o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{a=t(),r(),o=n(),s=`C=CC=O`,c=[{name:`ψ12`,energy:-10.28},{name:`ψ11`,energy:-13.19},{name:`ψ10`,energy:-14.02}],l={title:`Clipboard/ClickToCopy`,component:i,args:{value:s,label:`SMILES`,children:s},argTypes:{value:{control:`text`},label:{control:`text`},disabled:{control:`boolean`}},parameters:{docs:{description:{component:`A value copied by clicking it: a cursor carrying a clipboard and a tint announce it on hover, and a tick confirms the copy.`}}}},u={},d={args:{value:{text:`C3H4O`,html:`C<sub>3</sub>H<sub>4</sub>O`},label:`molecular formula`,children:(0,o.jsxs)(o.Fragment,{children:[`C`,(0,o.jsx)(`sub`,{children:`3`}),`H`,(0,o.jsx)(`sub`,{children:`4`}),`O`]})},parameters:{controls:{exclude:[`value`,`children`]}}},f={render:()=>(0,o.jsxs)(`table`,{className:`bp6-html-table bp6-compact`,children:[(0,o.jsx)(`thead`,{children:(0,o.jsxs)(`tr`,{children:[(0,o.jsx)(`th`,{children:`Orbital`}),(0,o.jsx)(`th`,{children:`Energy (eV)`})]})}),(0,o.jsx)(`tbody`,{children:c.map(e=>(0,o.jsxs)(`tr`,{children:[(0,o.jsx)(`td`,{children:e.name}),(0,o.jsx)(i,{as:`td`,value:e.energy.toFixed(2),label:`energy of ${e.name}`,children:e.energy.toFixed(2)})]},e.name))})]})},p={render:function(){let[e,t]=(0,a.useState)(0);return(0,o.jsxs)(`div`,{style:{display:`grid`,gap:8},children:[(0,o.jsxs)(`div`,{role:`button`,tabIndex:0,"data-testid":`row`,onClick:()=>t(e=>e+1),style:{padding:8,border:`1px solid var(--border)`},children:[`Acrolein —`,` `,(0,o.jsx)(i,{value:s,label:`SMILES`,children:s})]}),(0,o.jsxs)(`span`,{"data-testid":`opened`,children:[`Opened `,e,` times`]})]})}},m={render:function(){let[e,t]=(0,a.useState)(0);return(0,o.jsxs)(`div`,{style:{display:`grid`,gap:8},children:[(0,o.jsxs)(i,{value:`7847`,label:`PubChem CID`,children:[`CID 7847`,` `,(0,o.jsx)(`a`,{href:`#pubchem`,onClick:e=>{e.preventDefault(),t(e=>e+1)},children:`PubChem`})]}),(0,o.jsxs)(`span`,{"data-testid":`followed`,children:[`Followed `,e,` times`]})]})}},h={render:()=>(0,o.jsxs)(`div`,{style:{display:`grid`,gap:12,maxWidth:420},children:[(0,o.jsx)(`p`,{"data-testid":`tool-text`,children:`Hybrid orbitals are an idealised localised model of bonding: dragging across this paragraph selects nothing.`}),(0,o.jsx)(`input`,{className:`bp6-input`,"aria-label":`SMILES`,defaultValue:s}),(0,o.jsxs)(`p`,{className:`text-selectable`,"data-testid":`prose`,children:[`This paragraph carries `,(0,o.jsx)(`code`,{children:`text-selectable`}),`, so it can be quoted.`]}),(0,o.jsxs)(`p`,{children:[`The structure is`,` `,(0,o.jsx)(i,{value:s,label:`SMILES`,children:s}),`.`]})]})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    value: {
      text: 'C3H4O',
      html: 'C<sub>3</sub>H<sub>4</sub>O'
    },
    label: 'molecular formula',
    children: <>
        C<sub>3</sub>H<sub>4</sub>O
      </>
  },
  parameters: {
    controls: {
      exclude: ['value', 'children']
    }
  }
}`,...d.parameters?.docs?.source},description:{story:`A formula copied as text, and with its subscripts where the paste keeps HTML.`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <table className="bp6-html-table bp6-compact">
      <thead>
        <tr>
          <th>Orbital</th>
          <th>Energy (eV)</th>
        </tr>
      </thead>
      <tbody>
        {ORBITALS.map(orbital => <tr key={orbital.name}>
            <td>{orbital.name}</td>
            <ClickToCopy as="td" value={orbital.energy.toFixed(2)} label={\`energy of \${orbital.name}\`}>
              {orbital.energy.toFixed(2)}
            </ClickToCopy>
          </tr>)}
      </tbody>
    </table>
}`,...f.parameters?.docs?.source},description:{story:`Each cell of a column is its own target, and the table stays a table.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: function InsideClickableRow() {
    const [opened, setOpened] = useState(0);
    return <div style={{
      display: 'grid',
      gap: 8
    }}>
        <div role="button" tabIndex={0} data-testid="row" onClick={() => setOpened(count => count + 1)} style={{
        padding: 8,
        border: '1px solid var(--border)'
      }}>
          Acrolein —{' '}
          <ClickToCopy value={ACROLEIN_SMILES} label="SMILES">
            {ACROLEIN_SMILES}
          </ClickToCopy>
        </div>
        <span data-testid="opened">Opened {opened} times</span>
      </div>;
  }
}`,...p.parameters?.docs?.source},description:{story:`A value inside a clickable row copies without also opening the row.`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: function NestedLink() {
    const [followed, setFollowed] = useState(0);
    return <div style={{
      display: 'grid',
      gap: 8
    }}>
        <ClickToCopy value="7847" label="PubChem CID">
          CID 7847{' '}
          <a href="#pubchem" onClick={event => {
          event.preventDefault();
          setFollowed(count => count + 1);
        }}>
            PubChem
          </a>
        </ClickToCopy>
        <span data-testid="followed">Followed {followed} times</span>
      </div>;
  }
}`,...m.parameters?.docs?.source},description:{story:`A link inside the value keeps its own click and copies nothing.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gap: 12,
    maxWidth: 420
  }}>
      <p data-testid="tool-text">
        Hybrid orbitals are an idealised localised model of bonding: dragging
        across this paragraph selects nothing.
      </p>
      <input className="bp6-input" aria-label="SMILES" defaultValue={ACROLEIN_SMILES} />
      <p className="text-selectable" data-testid="prose">
        This paragraph carries <code>text-selectable</code>, so it can be
        quoted.
      </p>
      <p>
        The structure is{' '}
        <ClickToCopy value={ACROLEIN_SMILES} label="SMILES">
          {ACROLEIN_SMILES}
        </ClickToCopy>
        .
      </p>
    </div>
}`,...h.parameters?.docs?.source},description:{story:"The family's selection policy: the text of a tool is not selectable, a field\nis, and a region marked `selectable` is read and quoted.",...h.parameters?.docs?.description}}},g=[`Default`,`Formula`,`TableCells`,`InsideClickableRow`,`NestedLink`,`SelectionPolicy`]})))()}_();export{u as Default,d as Formula,p as InsideClickableRow,m as NestedLink,h as SelectionPolicy,f as TableCells,g as __namedExportsOrder,l as default};