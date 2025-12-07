import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminBookingsManager } from '../AdminBookingsManager';
import { api } from '../../../services/api';
import React from 'react';

// Mock API
vi.mock('../../../services/api', () => ({
    api: {
        updateBookingStatus: vi.fn(),
        getAllBookings: vi.fn(),
    },
}));

// Mock Toast
vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('AdminBookingsManager', () => {
    const mockBookings = [
        {
            id: '1',
            date: '2023-10-27',
            timeSlot: '10:00',
            status: 'confirmed',
            userName: 'John Doe',
            barberId: 'barber1',
            serviceIds: ['service1'],
            totalPrice: 50,
        },
        {
            id: '2',
            date: '2023-10-27',
            timeSlot: '11:00',
            status: 'pending',
            userName: 'Jane Smith',
            barberId: 'barber2',
            serviceIds: ['service2'],
            totalPrice: 60,
        },
    ];

    const mockServices = [
        { id: 'service1', name: 'Haircut', duration: 30, price: 50, category: 'Hair', active: true },
        { id: 'service2', name: 'Shave', duration: 20, price: 60, category: 'Beard', active: true },
    ];

    const mockBarbers = [
        { id: 'barber1', name: 'Barber One', bio: '', active: true, specialties: [] },
        { id: 'barber2', name: 'Barber Two', bio: '', active: true, specialties: [] },
    ];

    const setBookings = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders bookings table correctly', () => {
        render(
            <AdminBookingsManager
                bookings={mockBookings as any}
                setBookings={setBookings}
                services={mockServices as any}
                barbers={mockBarbers as any}
            />
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Haircut')).toBeInTheDocument();
        expect(screen.getByText('confirmed')).toBeInTheDocument();
    });

    it('filters bookings by search term', () => {
        render(
            <AdminBookingsManager
                bookings={mockBookings as any}
                setBookings={setBookings}
                services={mockServices as any}
                barbers={mockBarbers as any}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search bookings...');
        fireEvent.change(searchInput, { target: { value: 'Jane' } });

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('filters bookings by status', () => {
        render(
            <AdminBookingsManager
                bookings={mockBookings as any}
                setBookings={setBookings}
                services={mockServices as any}
                barbers={mockBarbers as any}
            />
        );

        // Find the filter dropdown. There are multiple selects.
        // The filter select is the one that has "All Statuses" as an option or initial value.
        // AdminBookingsManager.tsx: value={statusFilter} ... <option value="all">All Statuses</option>

        // Try finding by display value
        const selects = screen.getAllByRole('combobox');
        // The first one is likely the filter if it appears before the table rows.
        const statusFilterSelect = selects.find(s => s.innerHTML.includes('All Statuses'));

        if (!statusFilterSelect) throw new Error('Status filter select not found');

        fireEvent.change(statusFilterSelect, { target: { value: 'pending' } });

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('calls API when updating status', async () => {
        render(
            <AdminBookingsManager
                bookings={mockBookings as any}
                setBookings={setBookings}
                services={mockServices as any}
                barbers={mockBarbers as any}
            />
        );

        // Find the row action select for John Doe
        // Since there are multiple selects, let's find the row first
        // Or simpler: getAllByRole('combobox') and check value.
        // Booking 1 is 'confirmed'.

        const rowSelects = screen.getAllByRole('combobox');
        // Filter out the header filter select details...
        // Let's target the one with value 'confirmed' (booking 1) that is NOT the main filter
        // The main filter starts with 'all' usually but we changed it in previous test? No, each test re-renders.

        const rowSelect = rowSelects.find(s => (s as HTMLSelectElement).value === 'confirmed' && !s.innerHTML.includes('All Statuses'));

        if (!rowSelect) throw new Error('Row select not found');

        (api.updateBookingStatus as any).mockResolvedValue({ success: true });

        fireEvent.change(rowSelect, { target: { value: 'completed' } });

        await waitFor(() => {
            expect(api.updateBookingStatus).toHaveBeenCalledWith('1', 'completed');
            expect(setBookings).toHaveBeenCalled();
        });
    });
});
