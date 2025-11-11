import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PanelSize } from '../types';
import {
  calculateSizes,
  calculateSizesWithPixelConstraints,
  convertFromPixels,
  convertToPixels,
  formatSize,
  normalizePanelSize,
  parseSize,
  throttle,
} from '../utils';

describe('utils', () => {
  describe('parseSize', () => {
    it('parses pixel values correctly', () => {
      const result = parseSize('100px' as PanelSize);
      expect(result.value).toBe(100);
      expect(result.unit).toBe('px');
      expect(result.original).toBe('100px');
    });

    it('parses percentage values correctly', () => {
      const result = parseSize('50%' as PanelSize);
      expect(result.value).toBe(50);
      expect(result.unit).toBe('%');
      expect(result.original).toBe('50%');
    });

    it('parses auto size correctly', () => {
      const result = parseSize('auto');
      expect(result.value).toBe(0);
      expect(result.unit).toBe('auto');
      expect(result.original).toBe('auto');
    });

    it('parses * size correctly', () => {
      const result = parseSize('*');
      expect(result.value).toBe(0);
      expect(result.unit).toBe('auto');
      expect(result.original).toBe('*');
    });

    it('parses undefined as auto', () => {
      const result = parseSize(undefined);
      expect(result.value).toBe(0);
      expect(result.unit).toBe('auto');
      expect(result.original).toBe('auto');
    });

    it('parses plain numbers as pixels (auto-conversion)', () => {
      const result = parseSize('100' as PanelSize);
      expect(result.value).toBe(100);
      expect(result.unit).toBe('px');
      expect(result.original).toBe('100px');
    });

    it('parses decimal plain numbers as pixels (auto-conversion)', () => {
      const result = parseSize('50.5' as PanelSize);
      expect(result.value).toBe(50.5);
      expect(result.unit).toBe('px');
      expect(result.original).toBe('50.5px');
    });

    it('throws on invalid format', () => {
      expect(() => parseSize('invalid' as PanelSize)).toThrow();
    });

    it('provides detailed error message for invalid format', () => {
      expect(() => parseSize('invalid' as PanelSize)).toThrow(
        /\[react-adjustable-panels\] Invalid size format: "invalid" \(type: string\)/
      );
    });

    it('provides helpful error message for NaNundefined case', () => {
      // This simulates the error that would occur if formatSize returned "NaNundefined"
      expect(() => parseSize('NaNundefined' as PanelSize)).toThrow(
        /If you're seeing "NaNundefined", this may indicate an internal state synchronization issue/
      );
    });
  });

  describe('formatSize', () => {
    it('formats pixel values correctly', () => {
      expect(formatSize(100, 'px')).toBe('100px');
    });

    it('formats percentage values correctly', () => {
      expect(formatSize(50, '%')).toBe('50%');
    });

    it('formats auto size correctly', () => {
      expect(formatSize(0, 'auto')).toBe('auto');
    });

    it('handles NaN value gracefully (state sync safety)', () => {
      // This can occur during state synchronization issues where refs get out of sync
      expect(formatSize(NaN, 'px')).toBe('auto');
    });
  });

  describe('normalizePanelSize', () => {
    it('returns size unchanged if already defined', () => {
      expect(normalizePanelSize('100px' as PanelSize)).toBe('100px');
      expect(normalizePanelSize('50%' as PanelSize)).toBe('50%');
      expect(normalizePanelSize('auto')).toBe('auto');
    });

    it('converts undefined to auto', () => {
      expect(normalizePanelSize(undefined)).toBe('auto');
    });
  });

  describe('convertToPixels', () => {
    it('returns pixel value unchanged', () => {
      const size = parseSize('100px' as PanelSize);
      expect(convertToPixels(size, 1000)).toBe(100);
    });

    it('converts percentage to pixels', () => {
      const size = parseSize('50%' as PanelSize);
      expect(convertToPixels(size, 1000)).toBe(500);
    });

    it('returns 0 for auto size', () => {
      const size = parseSize('auto');
      expect(convertToPixels(size, 1000)).toBe(0);
    });
  });

  describe('convertFromPixels', () => {
    it('returns pixel value unchanged', () => {
      expect(convertFromPixels(100, 1000, 'px')).toBe(100);
    });

    it('converts pixels to percentage', () => {
      expect(convertFromPixels(500, 1000, '%')).toBe(50);
    });

    it('returns pixel value for auto unit', () => {
      expect(convertFromPixels(300, 1000, 'auto')).toBe(300);
    });
  });

  describe('calculateSizes', () => {
    it('calculates sizes correctly for percentages', () => {
      const sizes: PanelSize[] = ['50%' as PanelSize, '50%' as PanelSize];
      const result = calculateSizes(sizes, 1000, [{}, {}]);
      expect(result).toEqual([500, 500]);
    });

    it('calculates sizes correctly for pixels', () => {
      const sizes: PanelSize[] = ['200px' as PanelSize, '800px' as PanelSize];
      const result = calculateSizes(sizes, 1000, [{}, {}]);
      expect(result).toEqual([200, 800]);
    });

    it('handles mixed units correctly', () => {
      const sizes: PanelSize[] = ['200px' as PanelSize, '80%' as PanelSize];
      const result = calculateSizes(sizes, 1000, [{}, {}]);
      expect(result[0]).toBe(200);
      expect(result[1]).toBe(800);
    });

    it('applies min constraints', () => {
      const sizes: PanelSize[] = ['10px' as PanelSize, '990px' as PanelSize];
      const constraints = [{ minSize: '50px' as PanelSize }, {}];
      const result = calculateSizes(sizes, 1000, constraints);
      expect(result[0]).toBeGreaterThanOrEqual(50);
    });

    it('applies max constraints', () => {
      const sizes: PanelSize[] = ['900px' as PanelSize, '100px' as PanelSize];
      const constraints = [{ maxSize: '700px' as PanelSize }, {}];
      const result = calculateSizes(sizes, 1000, constraints);
      expect(result[0]).toBeLessThanOrEqual(700);
    });

    describe('auto-size behavior', () => {
      it('handles two auto panels splitting space equally', () => {
        const sizes: (PanelSize | undefined)[] = [undefined, undefined];
        const result = calculateSizes(sizes, 1000, [{}, {}]);
        expect(result).toEqual([500, 500]);
      });

      it('handles one auto panel filling remaining space', () => {
        const sizes: (PanelSize | undefined)[] = ['200px' as PanelSize, undefined];
        const result = calculateSizes(sizes, 1000, [{}, {}]);
        expect(result).toEqual([200, 800]);
      });

      it('handles auto panel with "auto" keyword', () => {
        const sizes: PanelSize[] = ['200px' as PanelSize, 'auto'];
        const result = calculateSizes(sizes, 1000, [{}, {}]);
        expect(result).toEqual([200, 800]);
      });

      it('handles auto panel with "*" keyword', () => {
        const sizes: PanelSize[] = ['200px' as PanelSize, '*'];
        const result = calculateSizes(sizes, 1000, [{}, {}]);
        expect(result).toEqual([200, 800]);
      });

      it('distributes space among multiple auto panels', () => {
        const sizes: PanelSize[] = ['200px' as PanelSize, 'auto', 'auto', 'auto'];
        const result = calculateSizes(sizes, 1000, [{}, {}, {}, {}]);
        expect(result[0]).toBe(200);
        // Remaining 800px split among 3 auto panels
        expect(result[1]).toBeCloseTo(266.67, 1);
        expect(result[2]).toBeCloseTo(266.67, 1);
        expect(result[3]).toBeCloseTo(266.67, 1);
        // Sum should equal container
        const sum = result.reduce((a, b) => a + b, 0);
        expect(sum).toBeCloseTo(1000, 0);
      });

      it('applies constraints to auto panels', () => {
        const sizes: PanelSize[] = ['200px' as PanelSize, 'auto'];
        const constraints = [{}, { minSize: '900px' as PanelSize }];
        const result = calculateSizes(sizes, 1000, constraints);
        expect(result[0]).toBe(200);
        expect(result[1]).toBeGreaterThanOrEqual(900);
      });

      it('handles auto panel with max constraint', () => {
        const sizes: PanelSize[] = ['200px' as PanelSize, 'auto'];
        const constraints = [{}, { maxSize: '600px' as PanelSize }];
        const result = calculateSizes(sizes, 1000, constraints);
        expect(result[0]).toBe(200);
        expect(result[1]).toBeLessThanOrEqual(600);
      });

      it('handles mixed fixed and auto panels', () => {
        const sizes: PanelSize[] = ['100px' as PanelSize, '20%' as PanelSize, 'auto', '150px' as PanelSize];
        const result = calculateSizes(sizes, 1000, [{}, {}, {}, {}]);
        expect(result[0]).toBe(100);
        expect(result[1]).toBe(200);
        expect(result[3]).toBe(150);
        // Auto panel fills remaining: 1000 - 100 - 200 - 150 = 550
        expect(result[2]).toBe(550);
      });
    });
  });

  describe('dev mode warnings', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
      vi.unstubAllGlobals();
    });

    it('warns when fixed panels do not sum to container size', () => {
      // Mock process.env for browser mode
      vi.stubGlobal('process', {
        env: { NODE_ENV: 'development' },
      });

      const sizes: PanelSize[] = ['300px' as PanelSize, '400px' as PanelSize];
      calculateSizes(sizes, 1000, [{}, {}]);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[react-adjustable-panels] Panel sizes sum to 700.0px but container is 1000.0px')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Consider using size="auto"'));
    });

    it('warns when fixed panels exceed container size with auto panels', () => {
      vi.stubGlobal('process', {
        env: { NODE_ENV: 'development' },
      });

      const sizes: PanelSize[] = ['600px' as PanelSize, '500px' as PanelSize, 'auto'];
      calculateSizes(sizes, 1000, [{}, {}, {}]);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[react-adjustable-panels] Fixed panel sizes sum to 1100.0px but container is only 1000.0px'
        )
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Auto panels have -100.0px of space (negative)')
      );
    });

    it('does not warn when sizes correctly sum to container', () => {
      vi.stubGlobal('process', {
        env: { NODE_ENV: 'development' },
      });

      const sizes: PanelSize[] = ['500px' as PanelSize, '500px' as PanelSize];
      calculateSizes(sizes, 1000, [{}, {}]);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('does not warn when auto panels are used', () => {
      vi.stubGlobal('process', {
        env: { NODE_ENV: 'development' },
      });

      const sizes: PanelSize[] = ['300px' as PanelSize, 'auto'];
      calculateSizes(sizes, 1000, [{}, {}]);

      // Should not warn because auto panel fills the gap
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('does not warn in production mode', () => {
      vi.stubGlobal('process', {
        env: { NODE_ENV: 'production' },
      });

      const sizes: PanelSize[] = ['300px' as PanelSize, '400px' as PanelSize];
      calculateSizes(sizes, 1000, [{}, {}]);

      // Should not warn in production
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('executes function immediately on first call', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('arg1');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('arg1');
    });

    it('throttles subsequent calls within wait period', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('call1');
      throttled('call2');
      throttled('call3');

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('call1');
    });

    it('executes after wait period has elapsed', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);
      const startTime = 1000000; // Use fixed start time
      vi.setSystemTime(startTime);

      throttled('call1');
      expect(fn).toHaveBeenCalledTimes(1);

      vi.setSystemTime(startTime + 50);
      throttled('call2');
      expect(fn).toHaveBeenCalledTimes(1); // Still throttled

      vi.setSystemTime(startTime + 110);
      throttled('call3');
      expect(fn).toHaveBeenCalledTimes(2); // Now executes
      expect(fn).toHaveBeenCalledWith('call3');
    });

    it('schedules delayed execution when called within wait period', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);
      const startTime = 1000000;
      vi.setSystemTime(startTime);

      throttled('call1');
      expect(fn).toHaveBeenCalledTimes(1);

      throttled('call2'); // Should schedule
      expect(fn).toHaveBeenCalledTimes(1);

      vi.setSystemTime(startTime + 100);
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenCalledWith('call2');
    });

    it('handles multiple arguments', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('arg1', 'arg2', 'arg3');
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });

  describe('calculateSizesWithPixelConstraints', () => {
    it('calculates sizes using pre-computed pixel constraints', () => {
      const sizes: PanelSize[] = ['200px' as PanelSize, 'auto'];
      const pixelConstraints = [
        { minPx: 150, maxPx: 300 },
        { minPx: 100, maxPx: undefined },
      ];

      const result = calculateSizesWithPixelConstraints(sizes, 1000, pixelConstraints);

      expect(result[0]).toBe(200);
      expect(result[1]).toBe(800);
    });

    it('applies pixel constraints without re-parsing', () => {
      const sizes: PanelSize[] = ['100px' as PanelSize, 'auto'];
      const pixelConstraints = [
        { minPx: 200, maxPx: undefined }, // Min constraint will clamp 100px to 200px
        { minPx: undefined, maxPx: undefined },
      ];

      const result = calculateSizesWithPixelConstraints(sizes, 1000, pixelConstraints);

      expect(result[0]).toBe(200); // Clamped to min
      expect(result[1]).toBe(800);
    });

    it('handles multiple auto panels with constraints', () => {
      const sizes: PanelSize[] = ['200px' as PanelSize, 'auto', 'auto'];
      const pixelConstraints = [
        { minPx: undefined, maxPx: undefined },
        { minPx: 300, maxPx: undefined },
        { minPx: undefined, maxPx: 400 },
      ];

      const result = calculateSizesWithPixelConstraints(sizes, 1000, pixelConstraints);

      expect(result[0]).toBe(200);
      expect(result[1]).toBeGreaterThanOrEqual(300);
      expect(result[2]).toBeLessThanOrEqual(400);
      expect(result[1] + result[2] + result[0]).toBeCloseTo(1000, 0);
    });

    it('redistributes space when auto panel is clamped', () => {
      const sizes: PanelSize[] = ['200px' as PanelSize, 'auto', 'auto'];
      const pixelConstraints = [
        { minPx: undefined, maxPx: undefined },
        { minPx: undefined, maxPx: 200 }, // Clamp this auto panel
        { minPx: undefined, maxPx: undefined },
      ];

      const result = calculateSizesWithPixelConstraints(sizes, 1000, pixelConstraints);

      expect(result[0]).toBe(200);
      expect(result[1]).toBeLessThanOrEqual(200);
      // Last auto panel gets the adjustment
      const sum = result[0] + result[1] + result[2];
      expect(sum).toBeCloseTo(1000, 0);
    });

    it('handles percentage sizes with pixel constraints', () => {
      const sizes: PanelSize[] = ['20%' as PanelSize, 'auto'];
      const pixelConstraints = [
        { minPx: 150, maxPx: 250 },
        { minPx: undefined, maxPx: undefined },
      ];

      const result = calculateSizesWithPixelConstraints(sizes, 1000, pixelConstraints);

      expect(result[0]).toBe(200); // 20% of 1000
      expect(result[1]).toBe(800);
    });

    describe('dev mode warnings', () => {
      let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

      beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      });

      afterEach(() => {
        consoleWarnSpy.mockRestore();
        vi.unstubAllGlobals();
      });

      it('warns when no auto panels and sizes do not match container', () => {
        vi.stubGlobal('process', {
          env: { NODE_ENV: 'development' },
        });

        const sizes: PanelSize[] = ['300px' as PanelSize, '400px' as PanelSize];
        const pixelConstraints = [
          { minPx: undefined, maxPx: undefined },
          { minPx: undefined, maxPx: undefined },
        ];

        calculateSizesWithPixelConstraints(sizes, 1000, pixelConstraints);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Panel sizes sum to 700.0px but container is 1000.0px')
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Consider using size="auto"'));
      });

      it('warns when auto panels have negative space', () => {
        vi.stubGlobal('process', {
          env: { NODE_ENV: 'development' },
        });

        const sizes: PanelSize[] = ['800px' as PanelSize, 'auto'];
        const pixelConstraints = [
          { minPx: undefined, maxPx: undefined },
          { minPx: undefined, maxPx: undefined },
        ];

        calculateSizesWithPixelConstraints(sizes, 500, pixelConstraints);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Fixed panel sizes sum to 800.0px but container is only 500.0px')
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Auto panels have -300.0px of space'));
      });

      it('does not warn in production mode', () => {
        vi.stubGlobal('process', {
          env: { NODE_ENV: 'production' },
        });

        const sizes: PanelSize[] = ['300px' as PanelSize, '400px' as PanelSize];
        const pixelConstraints = [
          { minPx: undefined, maxPx: undefined },
          { minPx: undefined, maxPx: undefined },
        ];

        calculateSizesWithPixelConstraints(sizes, 1000, pixelConstraints);

        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('parseSize with plain numbers', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
      vi.unstubAllGlobals();
    });

    it('warns in development mode for plain numbers', () => {
      vi.stubGlobal('process', {
        env: { NODE_ENV: 'development' },
      });

      parseSize('100' as PanelSize);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[react-adjustable-panels] Size value "100" is missing a unit')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Automatically treating it as "100px"')
      );
    });

    it('does not warn in production mode for plain numbers', () => {
      vi.stubGlobal('process', {
        env: { NODE_ENV: 'production' },
      });

      const result = parseSize('100' as PanelSize);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(result.value).toBe(100);
      expect(result.unit).toBe('px');
    });

    it('does not warn for undefined process', () => {
      vi.stubGlobal('process', undefined);

      const result = parseSize('100' as PanelSize);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(result.value).toBe(100);
      expect(result.unit).toBe('px');
    });
  });
});
