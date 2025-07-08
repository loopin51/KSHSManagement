"use client";

import { useState, useMemo } from 'react';
import type { Rental, Equipment } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { eachDayOfInterval, format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AvailabilityViewProps {
  rentals: Rental[];
  equipment: Equipment[];
}

function AvailabilityCalendar({ rentals }: { rentals: Rental[] }) {
    const [month, setMonth] = useState(new Date());

    const rentalsByDate = useMemo(() => {
        const grouped: Record<string, { equipment_name: string, borrower_name: string }[]> = {};
        rentals.forEach(rental => {
            if (rental.status === 'approved') {
                const equipmentDetails = equipment.find(e => e.id === rental.equipment_id);
                const interval = eachDayOfInterval({ start: rental.start_date, end: rental.end_date });
                interval.forEach(day => {
                    const dateString = format(day, 'yyyy-MM-dd');
                    if (!grouped[dateString]) {
                        grouped[dateString] = [];
                    }
                    grouped[dateString].push({
                        equipment_name: equipmentDetails?.name || rental.equipment_id,
                        borrower_name: rental.borrower_name
                    });
                });
            }
        });
        return grouped;
    }, [rentals]);

    return (
        <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            className="p-0"
            locale={ko}
            components={{
                DayContent: ({ date }) => {
                    const dateString = format(date, 'yyyy-MM-dd');
                    const dailyRentals = rentalsByDate[dateString];
                    return (
                        <div className="relative h-full w-full">
                            <span className="relative z-10">{format(date, 'd')}</span>
                            {dailyRentals && dailyRentals.length > 0 && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-0.5 z-0">
                                            {dailyRentals.slice(0, 3).map((_, i) => (
                                                <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            ))}
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-60">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">{format(date, 'yyyy-MM-dd')} 대여 현황</h4>
                                            <div className="text-sm space-y-1">
                                                {dailyRentals.map((r, i) => (
                                                    <p key={i}>• {r.equipment_name} ({r.borrower_name})</p>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                    );
                },
            }}
        />
    );
}


function AvailabilityTimeline({ rentals, equipment }: AvailabilityViewProps) {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const getDaysBetween = (start: Date, end: Date) => {
        return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    const getDayOffset = (date: Date) => {
        return Math.round((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return (
        <div className="relative">
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                <div className="grid" style={{ gridTemplateColumns: `150px repeat(${days.length}, 40px)` }}>
                    {/* Header: Equipment Names */}
                    <div className="sticky left-0 bg-background z-20 border-r p-2 font-semibold text-sm">장비</div>
                    {days.map(day => (
                        <div key={day.toISOString()} className={`p-2 border-b text-center text-xs ${isSameDay(day, today) ? 'bg-primary/10' : ''}`}>
                            {format(day, 'd')}
                        </div>
                    ))}
                    
                    {/* Equipment Rows */}
                    {equipment.map((item, index) => (
                        <div key={item.id} className="contents">
                            <div className="sticky left-0 bg-background z-20 border-r p-2 text-sm truncate" style={{ gridRow: index + 2 }}>
                                {item.name}
                            </div>
                            {/* Empty cells for timeline grid */}
                            {days.map(day => (
                                <div key={`${item.id}-${day.toISOString()}`} className={`border-r border-b ${isSameDay(day, today) ? 'bg-primary/10' : ''}`}></div>
                            ))}
                        </div>
                    ))}

                    {/* Rental Bars */}
                    {rentals.filter(r => r.status === 'approved').map(rental => {
                        const itemIndex = equipment.findIndex(e => e.id === rental.equipment_id);
                        if (itemIndex === -1) return null;

                        const rentalStart = rental.start_date > startDate ? rental.start_date : startDate;
                        const rentalEnd = rental.end_date < endDate ? rental.end_date : endDate;

                        const offset = getDayOffset(rentalStart);
                        const duration = getDaysBetween(rentalStart, rentalEnd);

                        if (offset < 0 || offset >= days.length || duration <= 0) return null;

                        return (
                            <div
                                key={rental.id}
                                className="absolute h-8 bg-primary/70 rounded-md z-10 flex items-center px-2 text-white text-xs truncate"
                                style={{
                                    gridRow: itemIndex + 2,
                                    gridColumnStart: offset + 2,
                                    gridColumnEnd: `span ${duration}`,
                                    top: `${(itemIndex + 1) * 3.1}rem`,
                                    left: `${150 + offset * 40}px`,
                                    width: `${duration * 40 - 4}px`,
                                    marginTop: '0.25rem',
                                    marginBottom: '0.25rem'
                                }}
                                title={`${equipment[itemIndex].name} - ${rental.borrower_name}`}
                            >
                                {rental.borrower_name}
                            </div>
                        )
                    })}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}

export default function AvailabilityView({ rentals, equipment }: AvailabilityViewProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <Tabs defaultValue="calendar">
          <TabsList>
            <TabsTrigger value="calendar">캘린더 뷰</TabsTrigger>
            <TabsTrigger value="timeline">타임라인 뷰</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="mt-4">
            <Card>
                <CardContent className="p-4">
                    <AvailabilityCalendar rentals={rentals} />
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="timeline" className="mt-4">
             <AvailabilityTimeline rentals={rentals} equipment={equipment} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
