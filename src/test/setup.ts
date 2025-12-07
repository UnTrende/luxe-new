import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Recharts
// Using React.createElement to avoid JSX in .ts file
vi.mock('recharts', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        ResponsiveContainer: ({ children }: { children: any }) => React.createElement('div', { style: { width: 500, height: 300 } }, children),
        BarChart: ({ children }: { children: any }) => React.createElement('div', null, children),
        LineChart: ({ children }: { children: any }) => React.createElement('div', null, children),
        PieChart: ({ children }: { children: any }) => React.createElement('div', null, children),
        Bar: () => React.createElement('div', null, 'Bar'),
        Line: () => React.createElement('div', null, 'Line'),
        Pie: () => React.createElement('div', null, 'Pie'),
        XAxis: () => React.createElement('div', null, 'XAxis'),
        YAxis: () => React.createElement('div', null, 'YAxis'),
        CartesianGrid: () => React.createElement('div', null, 'CartesianGrid'),
        Tooltip: () => React.createElement('div', null, 'Tooltip'),
        Legend: () => React.createElement('div', null, 'Legend'),
        Cell: () => React.createElement('div', null, 'Cell'),
    };
});

// Mock Toastify
vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
    },
    ToastContainer: () => React.createElement('div', null, 'ToastContainer'),
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};
