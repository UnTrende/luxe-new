import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AdminAnalytics } from '../AdminAnalytics';
import { api } from '../../../services/api';
import React from 'react';

// Mock API
vi.mock('../../../services/api', () => ({
    api: {
        getAnalyticsOverview: vi.fn(),
        getDetailedReports: vi.fn(),
        exportData: vi.fn(),
    },
}));

describe('AdminAnalytics', () => {
    const mockProps = {
        services: [],
        products: [],
        barbers: [],
        users: [],
        bookings: [],
        rosters: [],
        orders: [],
        attendanceRecords: [],
        stats: {
            totalRevenue: 1000,
            weeklyGrowth: '10',
            customerSatisfaction: 4.8,
            topService: 'Haircut',
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders and loads initial analytics data', async () => {
        (api.getAnalyticsOverview as any).mockResolvedValue({
            stats: { totalRevenue: 2000, weeklyGrowth: '15' },
            charts: { topServices: [] }
        });
        (api.getDetailedReports as any).mockResolvedValue({
            overview: { single: 10, repeat: 5 },
            retentionRate: 33.3
        });

        render(<AdminAnalytics {...mockProps} />);

        // Check header presence
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();

        // Wait for data load
        await waitFor(() => {
            expect(api.getAnalyticsOverview).toHaveBeenCalled();
        });
    });

    it('handles export actions', async () => {
        (api.getAnalyticsOverview as any).mockResolvedValue({});
        (api.getDetailedReports as any).mockResolvedValue({});

        // Mock return for export
        (api.exportData as any).mockResolvedValue({
            csv: 'id,name\n1,Test',
            filename: 'test.csv'
        });

        // Mock window URL methods
        window.URL.createObjectURL = vi.fn();
        window.URL.revokeObjectURL = vi.fn();

        render(<AdminAnalytics {...mockProps} />);

        const exportBtn = screen.getByText('Export Bookings (CSV)');
        fireEvent.click(exportBtn);

        await waitFor(() => {
            expect(api.exportData).toHaveBeenCalledWith('bookings', 'csv');
        });
    });
});
