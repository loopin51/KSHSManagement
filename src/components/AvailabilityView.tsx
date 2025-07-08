"use client";

import React, { useState, useMemo } from 'react';
import type { Rental, Equipment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { eachDayOfInterval, format, isSameDay, parseISO, startOfDay, endOfDay, isWithinInterval, getHours, getMinutes } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AvailabilityViewProps {
  rentals: Rental[];
  equipment: Equipment[];
}

function DailyTimeline({ selectedDate, rentals, equipment }: { selectedDate: Date, rentals: Rental[], equipment: Equipment[] }) {
    const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23
    
    const relevantRentals = useMemo(() => rentals.filter(rental => {
        if (rental.status !== 'approved' && rental.status !== 'pending') return false;
        const interval = { start: rental.start_date, end: rental.end_date };
        return isWithinInterval(selectedDate, interval) || 
               isSameDay(rental.start_date, selectedDate) || 
               isSameDay(rental.end_date, selectedDate);
    }), [rentals, selectedDate]);

    const getRentalStyle = (rental: Rental) => {
        const dayStart = startOfDay(selectedDate);
        const dayEnd = endOfDay(selectedDate);

        const rentalStart = rental.start_date > dayStart ? rental.start_date : dayStart;
        const rentalEnd = rental.end_date < dayEnd ? rental.end_date : dayEnd;

        const startHour = getHours(rentalStart);
        const startMinute = getMinutes(rentalStart);
        const endHour = getHours(rentalEnd);
        const endMinute = getMinutes(rentalEnd);
        
        const effectiveEndHour = (endHour === 0 && endMinute === 0 && !isSameDay(rentalStart, rentalEnd)) || (endHour === 23 && endMinute === 59) ? 24 : endHour;
        const effectiveEndMinute = endHour === 0 && endMinute === 0 && !isSameDay(rentalStart, rentalEnd) ? 0 : endMinute;

        const left = (startHour + startMinute / 60) * (100 / 24);
        const width = Math.max(0, ((effectiveEndHour + effectiveEndMinute / 60) - (startHour + startMinute / 60)) * (100/24));

        return {
            left: `${left}%`,
            width: `${width}%`,
        };
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{format(selectedDate, 'yyyy-MM-dd')} 시간별 현황</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="w-full">
                    <div className="relative pt-4 pr-4">
                        <div className="grid gap-y-6" style={{ gridTemplateColumns: `120px 1fr`}}>
                            {/* Empty corner */}
                            <div></div>
                            {/* Time labels */}
                            <div className="relative flex h-8 items-end border-b">
                                {hours.map(hour => (
                                    <div key={hour} className="relative flex-1 text-center text-xs text-muted-foreground">
                                        <span className="absolute -bottom-4 -translate-x-1/2">{hour.toString().padStart(2, '0')}</span>
                                    </div>
                                ))}
                            </div>

                            {equipment.map(item => {
                                const itemRentals = relevantRentals.filter(r => r.equipment_id === item.id);
                                return (
                                    <React.Fragment key={item.id}>
                                        <div className="text-sm font-medium pr-2 text-right truncate">{item.name}</div>
                                        <div className="relative h-10 rounded-lg bg-muted">
                                            {itemRentals.map(rental => {
                                                const statusColor = rental.status === 'approved'
                                                    ? 'bg-primary/80'
                                                    : 'bg-yellow-500/80';
                                                
                                                const title = rental.status === 'approved'
                                                    ? `${rental.borrower_name} (${format(rental.start_date, 'HH:mm')} - ${format(rental.end_date, 'HH:mm')})`
                                                    : `승인 대기 (${format(rental.start_date, 'HH:mm')} - ${format(rental.end_date, 'HH:mm')})`;
                                                
                                                const text = rental.status === 'approved' ? rental.borrower_name : '승인 대기';

                                                return (
                                                    <div
                                                        key={rental.id}
                                                        className={cn(
                                                            "absolute top-0 h-full flex items-center justify-center p-1 rounded-md text-white",
                                                            statusColor
                                                        )}
                                                        style={getRentalStyle(rental)}
                                                        title={title}
                                                    >
                                                       <span className="text-xs truncate">{text}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                         {equipment.length > 0 && relevantRentals.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">선택한 날짜에 대여 기록이 없습니다.</p>
                        )}
                        {equipment.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">표시할 장비가 없습니다.</p>
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

export default function AvailabilityView({ rentals: rawRentals, equipment }: AvailabilityViewProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    
    const rentals = useMemo(() => rawRentals.map(r => ({
        ...r,
        start_date: typeof r.start_date === 'string' ? parseISO(r.start_date) : r.start_date,
        end_date: typeof r.end_date === 'string' ? parseISO(r.end_date) : r.end_date,
    })), [rawRentals]);


    const rentalsByDate = useMemo(() => {
        const grouped: Record<string, number> = {};
        rentals.forEach(rental => {
            if (rental.status === 'approved' || rental.status === 'pending') {
                const interval = eachDayOfInterval({ start: startOfDay(rental.start_date), end: startOfDay(rental.end_date) });
                interval.forEach(day => {
                    const dateString = format(day, 'yyyy-MM-dd');
                    grouped[dateString] = (grouped[dateString] || 0) + 1;
                });
            }
        });
        return grouped;
    }, [rentals]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
                <Card>
                    <CardContent className="p-2 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="p-0"
                            locale={ko}
                            modifiers={{
                                hasRentals: (date) => rentalsByDate[format(date, 'yyyy-MM-dd')] > 0,
                            }}
                            modifiersClassNames={{
                                hasRentals: 'has-rentals',
                            }}
                        />
                    </CardContent>
                </Card>
                 <style jsx global>{`
                    .has-rentals {
                        font-weight: bold;
                        border: 1px solid hsl(var(--primary));
                        border-radius: var(--radius);
                    }
                    .rdp-day_selected.has-rentals {
                        background-color: hsl(var(--primary));
                        color: hsl(var(--primary-foreground));
                    }
                 `}</style>
            </div>
            <div className="lg:col-span-2">
                {selectedDate && <DailyTimeline selectedDate={selectedDate} rentals={rentals} equipment={equipment} />}
            </div>
        </div>
    );
}
