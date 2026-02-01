import { aria, ARIA } from './plugin';

describe('plugin', () => {
  it('generates correct variants for each ARIA attribute', () => {
    const mockAddVariant = vi.fn();
    // plugin.withOptions returns a function that when called returns { handler, config }
    aria().handler({ addVariant: mockAddVariant } as any);

    const variants = mockAddVariant.mock.calls.map((call) => call[0]);

    Object.entries(ARIA).forEach(([key, values]) => {
      values.forEach((value) => {
        const standardVariant = value === 'true'
          ? `aria-${key}`
          : value === 'false'
            ? `aria-not-${key}`
            : `aria-${key}-${value}`;

        // Group and peer variants
        const groupVariant = `group-${standardVariant}`;
        const peerVariant = `peer-${standardVariant}`;

        // Check each variant is generated
        expect(variants).toContain(standardVariant);
        expect(variants).toContain(groupVariant);
        expect(variants).toContain(peerVariant);
      });
    });
  });

  it('generates only the filtered types', () => {
    const mockAddVariant = vi.fn();
    aria({
      rowcount: true,
      rowindex: true,
      rowspan: true,
    }).handler({ addVariant: mockAddVariant } as any);

    const variants = mockAddVariant.mock.calls.map((call) => call[0]);

    (['rowindex', 'rowcount', 'rowspan'] as (keyof typeof ARIA)[]).forEach((key) => {
      ARIA[key].forEach((value) => {
        const standardVariant = value === 'true'
          ? `aria-${key}`
          : value === 'false'
            ? `aria-not-${key}`
            : `aria-${key}-${value}`;

        // Group and peer variants
        const groupVariant = `group-${standardVariant}`;
        const peerVariant = `peer-${standardVariant}`;

        // Check each variant is generated
        expect(variants).toContain(standardVariant);
        expect(variants).toContain(groupVariant);
        expect(variants).toContain(peerVariant);
      });
    });

    // 3 => Chosen variants
    // 3 => base class, peer and group
    expect(mockAddVariant).toHaveBeenCalledTimes(3 * 3);
  });

  it('generates correct selectors for variants', () => {
    const mockAddVariant = vi.fn();
    aria({ disabled: true }).handler({ addVariant: mockAddVariant } as any);

    // Check specific selector format
    const disabledCall = mockAddVariant.mock.calls.find((call) => call[0] === 'aria-disabled');
    expect(disabledCall).toBeDefined();
    expect(disabledCall[1]).toEqual([
      '&[aria-disabled="true"]',
      '[aria-disabled="true"] &',
    ]);

    const groupDisabledCall = mockAddVariant.mock.calls.find((call) => call[0] === 'group-aria-disabled');
    expect(groupDisabledCall).toBeDefined();
    expect(groupDisabledCall[1]).toBe(':where(.group)[aria-disabled="true"] &');

    const peerDisabledCall = mockAddVariant.mock.calls.find((call) => call[0] === 'peer-aria-disabled');
    expect(peerDisabledCall).toBeDefined();
    expect(peerDisabledCall[1]).toBe(':where(.peer)[aria-disabled="true"] ~ &');
  });
});
