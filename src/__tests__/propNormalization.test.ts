import { describe, expect, it } from 'vitest';
import { normalizePanelGroupProps, normalizePanelProps } from '../propNormalization';
import type { PanelGroupProps, PanelProps } from '../types';

describe('propNormalization', () => {
  describe('normalizePanelGroupProps', () => {
    it('uses default direction when not provided', () => {
      const props: PanelGroupProps = {
        children: null,
      };

      const normalized = normalizePanelGroupProps(props);

      expect(normalized.direction).toBe('horizontal');
    });

    it('preserves provided direction', () => {
      const props: PanelGroupProps = {
        children: null,
        direction: 'vertical',
      };

      const normalized = normalizePanelGroupProps(props);

      expect(normalized.direction).toBe('vertical');
    });

    it('preserves all optional props', () => {
      const onResize = (_info: any) => undefined;
      const onResizeStart = (_info: any) => {};
      const onResizeEnd = (_info: any) => undefined;

      const props: PanelGroupProps = {
        children: null,
        direction: 'horizontal',
        className: 'test-class',
        style: { background: 'red' },
        onResize,
        onResizeStart,
        onResizeEnd,
      };

      const normalized = normalizePanelGroupProps(props);

      expect(normalized.direction).toBe('horizontal');
      expect(normalized.className).toBe('test-class');
      expect(normalized.style).toEqual({ background: 'red' });
      expect(normalized.onResize).toBe(onResize);
      expect(normalized.onResizeStart).toBe(onResizeStart);
      expect(normalized.onResizeEnd).toBe(onResizeEnd);
    });
  });

  describe('normalizePanelProps', () => {
    it('normalizes all size props', () => {
      const props: PanelProps = {
        defaultSize: '100px',
        minSize: '50px',
        maxSize: '200px',
      };

      const normalized = normalizePanelProps(props);

      expect(normalized.defaultSize).toBe('100px');
      expect(normalized.minSize).toBe('50px');
      expect(normalized.maxSize).toBe('200px');
    });

    it('converts undefined size props to auto', () => {
      const props: PanelProps = {};

      const normalized = normalizePanelProps(props);

      expect(normalized.defaultSize).toBe('auto');
      expect(normalized.minSize).toBe('auto');
      expect(normalized.maxSize).toBe('auto');
      expect(normalized.defaultCollapsed).toBe(false);
    });

    it('preserves collapse props', () => {
      const onCollapse = () => {};

      const props: PanelProps = {
        defaultCollapsed: true,
        collapsedSize: '20px',
        onCollapse,
      };

      const normalized = normalizePanelProps(props);

      expect(normalized.defaultCollapsed).toBe(true);
      expect(normalized.collapsedSize).toBe('20px');
      expect(normalized.onCollapse).toBe(onCollapse);
    });

    it('preserves className and style', () => {
      const props: PanelProps = {
        className: 'panel-class',
        style: { color: 'blue' },
      };

      const normalized = normalizePanelProps(props);

      expect(normalized.className).toBe('panel-class');
      expect(normalized.style).toEqual({ color: 'blue' });
    });
  });
});
