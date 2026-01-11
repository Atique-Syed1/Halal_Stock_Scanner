import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Test a simple component
describe('MobileBottomNav', () => {
    it('should render all navigation items', async () => {
        // Dynamically import to avoid issues with lazy loading
        const { MobileBottomNav } = await import('../components/common/MobileBottomNav');

        render(
            <MobileBottomNav
                activeTab="dashboard"
                onTabChange={() => { }}
                onOpenPortfolio={() => { }}
                onOpenAlerts={() => { }}
                onOpenSearch={() => { }}
            />
        );

        expect(screen.getByText('Home')).toBeDefined();
        expect(screen.getByText('Scanner')).toBeDefined();
        expect(screen.getByText('Search')).toBeDefined();
        expect(screen.getByText('Portfolio')).toBeDefined();
        expect(screen.getByText('Alerts')).toBeDefined();
    });

    it('should highlight active tab', async () => {
        const { MobileBottomNav } = await import('../components/common/MobileBottomNav');

        const { container } = render(
            <MobileBottomNav
                activeTab="scanner"
                onTabChange={() => { }}
                onOpenPortfolio={() => { }}
                onOpenAlerts={() => { }}
                onOpenSearch={() => { }}
            />
        );

        // Check that Scanner button has emerald color (active state)
        const scannerButton = screen.getByText('Scanner').closest('button');
        expect(scannerButton?.className).toContain('emerald');
    });

    it('should call onTabChange when tab is clicked', async () => {
        const { MobileBottomNav } = await import('../components/common/MobileBottomNav');
        const onTabChange = vi.fn();

        render(
            <MobileBottomNav
                activeTab="dashboard"
                onTabChange={onTabChange}
                onOpenPortfolio={() => { }}
                onOpenAlerts={() => { }}
                onOpenSearch={() => { }}
            />
        );

        const scannerTab = screen.getByText('Scanner').closest('button');
        scannerTab?.click();

        expect(onTabChange).toHaveBeenCalledWith('scanner');
    });
});
