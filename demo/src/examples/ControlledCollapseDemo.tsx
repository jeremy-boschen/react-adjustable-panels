import { useRef, useState } from 'react';
import { Panel, PanelGroup, type PanelGroupHandle } from '../../../src';

export default function ControlledCollapseDemo() {
  const [collapsed, setCollapsed] = useState(false);
  const groupRef = useRef<PanelGroupHandle>(null);

  const handleToggleCollapse = () => {
    // Use imperative API to toggle collapse
    if (collapsed) {
      groupRef.current?.expandPanel(0);
    } else {
      groupRef.current?.collapsePanel(0);
    }
  };

  const handleCollapsePanel = () => {
    // Explicit collapse using imperative API
    groupRef.current?.collapsePanel(0);
  };

  const handleExpandPanel = () => {
    // Explicit expand using imperative API
    groupRef.current?.expandPanel(0);
  };

  return (
    <div className="demo-example">
      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#fff' }}>Imperative Collapse API</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button onClick={handleToggleCollapse} style={{ padding: '8px 12px' }}>
            Toggle Collapse
          </button>
          <button onClick={handleCollapsePanel} style={{ padding: '8px 12px' }}>
            Collapse Sidebar
          </button>
          <button onClick={handleExpandPanel} style={{ padding: '8px 12px' }}>
            Expand Sidebar
          </button>
        </div>
        <div style={{ color: '#fff' }}>
          <strong>Sidebar State:</strong> {collapsed ? '🔒 Collapsed' : '📖 Expanded'}
        </div>
      </div>

      {/* @demo-code-start */}
      <PanelGroup ref={groupRef} direction="horizontal">
        <Panel
          defaultSize="300px"
          minSize="200px"
          collapsedSize="50px"
          defaultCollapsed={false}
          onCollapse={setCollapsed}
          className="panel-blue"
        >
          <div className="panel-content">
            {collapsed ? (
              <div
                className="panel-body"
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
              >
                <div style={{ writingMode: 'vertical-rl', fontSize: '14px', fontWeight: 'bold' }}>SIDEBAR</div>
              </div>
            ) : (
              <>
                <div className="panel-header">Programmable Sidebar</div>
                <div className="panel-body">
                  <p>This sidebar uses the imperative collapse API.</p>
                  <p>Click buttons above OR drag the handle to collapse/expand.</p>
                  <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
                    <li>minSize: 200px</li>
                    <li>collapsedSize: 50px</li>
                    <li>State: {collapsed ? 'collapsed' : 'expanded'}</li>
                  </ul>
                  <div
                    style={{
                      marginTop: '15px',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  >
                    💡 <strong>Tip:</strong> Both buttons and dragging work together! The <code>onCollapse</code>{' '}
                    callback keeps the UI state in sync.
                  </div>
                </div>
              </>
            )}
          </div>
        </Panel>

        <Panel defaultSize="auto" className="panel-purple">
          <div className="panel-content">
            <div className="panel-header">Main Content Area</div>
            <div className="panel-body">
              <p>This area automatically fills the remaining space.</p>
              <div
                style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}
              >
                <h4 style={{ marginTop: 0 }}>How imperative collapse API works:</h4>
                <ol style={{ paddingLeft: '20px' }}>
                  <li>
                    Use <code>collapsePanel(index)</code> to collapse a panel programmatically
                  </li>
                  <li>
                    Use <code>expandPanel(index)</code> to expand a panel programmatically
                  </li>
                  <li>Dragging across thresholds also triggers collapse/expand automatically</li>
                  <li>
                    <code>onCollapse</code> callback fires for any state change (drag or API)
                  </li>
                  <li>No synchronization required - component owns its state!</li>
                </ol>
              </div>
            </div>
          </div>
        </Panel>
      </PanelGroup>
      {/* @demo-code-end */}
    </div>
  );
}
