import { render } from '@testing-library/react';
import { bench, describe } from 'vitest';
import { Panel } from '../Panel';
import { PanelGroup } from '../PanelGroup';
import { ResizeHandle } from '../ResizeHandle';

describe('PanelGroup Performance Benchmarks', () => {
  describe('Child Discovery Performance', () => {
    bench('2 direct panels (baseline)', () => {
      render(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize="50%">Panel 1</Panel>
            <Panel defaultSize="50%">Panel 2</Panel>
          </PanelGroup>
        </div>
      );
    });

    bench('2 panels wrapped in divs (1 level)', () => {
      render(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            <div>
              <Panel defaultSize="50%">Panel 1</Panel>
            </div>
            <div>
              <Panel defaultSize="50%">Panel 2</Panel>
            </div>
          </PanelGroup>
        </div>
      );
    });

    bench('2 panels wrapped in divs (3 levels deep)', () => {
      render(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            <div>
              <div>
                <div>
                  <Panel defaultSize="50%">Panel 1</Panel>
                </div>
              </div>
            </div>
            <div>
              <div>
                <div>
                  <Panel defaultSize="50%">Panel 2</Panel>
                </div>
              </div>
            </div>
          </PanelGroup>
        </div>
      );
    });

    bench('4 direct panels', () => {
      render(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize="25%">Panel 1</Panel>
            <Panel defaultSize="25%">Panel 2</Panel>
            <Panel defaultSize="25%">Panel 3</Panel>
            <Panel defaultSize="25%">Panel 4</Panel>
          </PanelGroup>
        </div>
      );
    });

    bench('4 wrapped panels', () => {
      render(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            <div>
              <Panel defaultSize="25%">Panel 1</Panel>
            </div>
            <div>
              <Panel defaultSize="25%">Panel 2</Panel>
            </div>
            <div>
              <Panel defaultSize="25%">Panel 3</Panel>
            </div>
            <div>
              <Panel defaultSize="25%">Panel 4</Panel>
            </div>
          </PanelGroup>
        </div>
      );
    });

    bench('10 direct panels (high count)', () => {
      render(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            {Array.from({ length: 10 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Static test array, order never changes
              <Panel key={i} defaultSize="10%">
                Panel {i + 1}
              </Panel>
            ))}
          </PanelGroup>
        </div>
      );
    });

    bench('10 wrapped panels (high count)', () => {
      render(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            {Array.from({ length: 10 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Static test array, order never changes
              <div key={i}>
                <Panel defaultSize="10%">Panel {i + 1}</Panel>
              </div>
            ))}
          </PanelGroup>
        </div>
      );
    });
  });

  describe('Complex Nesting Scenarios', () => {
    bench('Nested PanelGroups (2 levels)', () => {
      render(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize="50%">
              <PanelGroup direction="vertical">
                <Panel defaultSize="50%">Nested 1</Panel>
                <Panel defaultSize="50%">Nested 2</Panel>
              </PanelGroup>
            </Panel>
            <Panel defaultSize="50%">Panel 2</Panel>
          </PanelGroup>
        </div>
      );
    });

    bench('Mixed wrapped and unwrapped panels', () => {
      render(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize="25%">Direct Panel</Panel>
            <div>
              <Panel defaultSize="25%">Wrapped Panel 1</Panel>
            </div>
            <Panel defaultSize="25%">Fragment Panel</Panel>
            <div>
              <div>
                <Panel defaultSize="25%">Deep Wrapped Panel</Panel>
              </div>
            </div>
          </PanelGroup>
        </div>
      );
    });

    bench('Custom ResizeHandles with wrapping', () => {
      render(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            <div>
              <Panel defaultSize="50%">Panel 1</Panel>
            </div>
            <div>
              <ResizeHandle size={10} />
            </div>
            <div>
              <Panel defaultSize="50%">Panel 2</Panel>
            </div>
          </PanelGroup>
        </div>
      );
    });
  });

  describe('Re-render Performance', () => {
    bench('Re-render with direct panels', () => {
      const { rerender } = render(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize="50%">Panel 1</Panel>
            <Panel defaultSize="50%">Panel 2</Panel>
          </PanelGroup>
        </div>
      );

      // Simulate re-render
      rerender(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize="50%">Panel 1 Updated</Panel>
            <Panel defaultSize="50%">Panel 2 Updated</Panel>
          </PanelGroup>
        </div>
      );
    });

    bench('Re-render with wrapped panels', () => {
      const { rerender } = render(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            <div>
              <Panel defaultSize="50%">Panel 1</Panel>
            </div>
            <div>
              <Panel defaultSize="50%">Panel 2</Panel>
            </div>
          </PanelGroup>
        </div>
      );

      // Simulate re-render
      rerender(
        <div style={{ width: '1000px', height: '600px' }}>
          <PanelGroup direction="horizontal">
            <div>
              <Panel defaultSize="50%">Panel 1 Updated</Panel>
            </div>
            <div>
              <Panel defaultSize="50%">Panel 2 Updated</Panel>
            </div>
          </PanelGroup>
        </div>
      );
    });
  });
});
