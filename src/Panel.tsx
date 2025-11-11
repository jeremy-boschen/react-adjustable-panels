import { forwardRef } from 'react';
import { normalizePanelProps } from './propNormalization';
import type { PanelProps } from './types';

/**
 * Panel component - A resizable panel within a PanelGroup.
 *
 * Panels can have fixed sizes (pixels or percentages) or flexible sizes ("auto" or "*").
 * They support constraints (min/max sizes) and can be collapsible with automatic
 * snap behavior.
 *
 * @example
 * ```tsx
 * // Fixed width sidebar
 * <Panel defaultSize="300px" minSize="200px" maxSize="500px">
 *   Sidebar content
 * </Panel>
 * ```
 *
 * @example
 * ```tsx
 * // Flexible panel that fills available space
 * <Panel defaultSize="auto">
 *   Main content area
 * </Panel>
 * ```
 *
 * @example
 * ```tsx
 * // Percentage-based sizing
 * <Panel defaultSize="30%" minSize="20%">
 *   Left panel
 * </Panel>
 * ```
 *
 * @example
 * ```tsx
 * // Collapsible panel with callback
 * <Panel
 *   defaultSize="250px"
 *   collapsedSize="40px"
 *   onCollapse={(collapsed) => console.log('Collapsed:', collapsed)}
 * >
 *   Collapsible sidebar
 * </Panel>
 * ```
 */
export const Panel = forwardRef<HTMLDivElement, PanelProps>((rawProps, ref) => {
  // Normalize props at component boundary - converts undefined → defaults
  const { defaultSize, minSize, maxSize, collapsedSize, defaultCollapsed, className, style } =
    normalizePanelProps(rawProps);

  // Extract Panel-specific props to avoid passing them to DOM
  const {
    children,
    defaultSize: _defaultSize,
    minSize: _minSize,
    maxSize: _maxSize,
    collapsedSize: _collapsedSize,
    defaultCollapsed: _defaultCollapsed,
    onCollapse: _onCollapse,
    ...restProps
  } = rawProps;

  // Store normalized constraints as data attributes for PanelGroup to read
  // Users can provide aria-label or aria-labelledby via restProps for better accessibility
  return (
    <div
      ref={ref}
      className={className}
      style={style}
      role="group"
      data-panel="true"
      data-default-size={defaultSize}
      data-min-size={minSize}
      data-max-size={maxSize}
      data-collapsed-size={collapsedSize}
      data-default-collapsed={defaultCollapsed}
      {...restProps}
    >
      {children}
    </div>
  );
});

Panel.displayName = 'Panel';
