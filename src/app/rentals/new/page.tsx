"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDays, format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';

import { getEquipmentById, checkRentalCollision, createRental } from '@/lib/data';
import type { Equipment } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, AlertTriangle, ArrowLeft } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

const rentalFormSchema = z.object({
  borrower_name: z.string().min(2, { message: '대여자는 2글자 이상이어야 합니다.' }),
  purpose: z.string().min(10, { message: '사용 목적은 10자 이상 입력해주세요.' }),
  date_range: z.object({
    from: z.date({ required_error: '시작일을 선택해주세요.' }),
    to: z.date({ required_error: '종료일을 선택해주세요.' }),
  }).refine(data => data.from <= data.to, {
    message: '종료일은 시작일보다 빠를 수 없습니다.',
    path: ['to'],
  }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "유효한 시간을 입력해주세요 (HH:MM)."),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "유효한 시간을 입력해주세요 (HH:MM)."),
}).refine((data) => {
    if (data.date_range.from && data.date_range.to && isSameDay(data.date_range.from, data.date_range.to)) {
        return data.endTime > data.startTime;
    }
    return true;
}, {
    message: "같은 날짜에 종료하는 경우, 종료 시간은 시작 시간보다 늦어야 합니다.",
    path: ["endTime"],
});

type RentalFormValues = z.infer<typeof rentalFormSchema>;

function NewRentalPageContents() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const itemIds = searchParams.get('items')?.split(',') || [];
  const selectedEquipment: (Equipment | undefined)[] = itemIds.map(id => getEquipmentById(id));

  const form = useForm<RentalFormValues>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues: {
      borrower_name: '',
      purpose: '',
      date_range: {
        from: new Date(),
        to: addDays(new Date(), 7),
      },
      startTime: '09:00',
      endTime: '17:00',
    },
  });

  const { control, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: RentalFormValues) => {
    const { date_range, borrower_name, purpose, startTime, endTime } = data;
    const { from, to } = date_range;

    if (!from || !to) {
        toast({
            variant: "destructive",
            title: "오류",
            description: "대여 기간을 선택해주세요.",
          });
      return;
    }
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const finalStartDate = new Date(from);
    finalStartDate.setHours(startHour, startMinute, 0, 0);

    const finalEndDate = new Date(to);
    finalEndDate.setHours(endHour, endMinute, 0, 0);

    if(finalEndDate <= finalStartDate) {
        toast({
            variant: "destructive",
            title: "오류",
            description: "종료일시가 시작일시보다 빠르거나 같을 수 없습니다.",
        });
        return;
    }

    const collisionCheck = checkRentalCollision(itemIds, finalStartDate, finalEndDate);

    if (collisionCheck.collision) {
      toast({
        variant: "destructive",
        title: "대여 충돌 발생",
        description: collisionCheck.message,
      });
    } else {
        itemIds.forEach(equipment_id => {
            createRental({
                equipment_id,
                borrower_name,
                purpose,
                start_date: finalStartDate,
                end_date: finalEndDate,
            });
        });

      toast({
        title: "대여 신청 완료",
        description: "대여 신청이 성공적으로 접수되었습니다. 관리자 승인 후 사용 가능합니다.",
        className: "bg-green-100 text-green-800",
      });
      router.push('/');
    }
  };

  if (itemIds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>잘못된 접근</CardTitle>
          <CardDescription>대여할 장비가 선택되지 않았습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              장비 선택 페이지로 돌아가기
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
    <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        뒤로가기
    </Link>
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">장비 대여 신청</CardTitle>
          <CardDescription>선택된 장비에 대한 대여 정보를 입력해주세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>대여 장비 목록</Label>
            <Card>
                <CardContent className="p-4 space-y-2">
                {selectedEquipment.map(item => item && (
                    <div key={item.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50">
                        <span>{item.name} ({item.id})</span>
                        <span className="text-muted-foreground">{item.department}</span>
                    </div>
                ))}
                </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="borrower_name">대여자 이름</Label>
                <Controller
                    name="borrower_name"
                    control={control}
                    render={({ field }) => <Input id="borrower_name" placeholder="홍길동" {...field} />}
                />
                {errors.borrower_name && <p className="text-sm text-destructive">{errors.borrower_name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>대여 기간</Label>
                <Controller
                    name="date_range"
                    control={control}
                    render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date_range"
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value.from && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value?.from ? (
                            field.value.to ? (
                                <>
                                {format(field.value.from, "yyyy-MM-dd")} - {format(field.value.to, "yyyy-MM-dd")}
                                </>
                            ) : (
                                format(field.value.from, "yyyy-MM-dd")
                            )
                            ) : (
                            <span>기간 선택</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            locale={ko}
                            mode="range"
                            defaultMonth={field.value.from}
                            selected={{ from: field.value.from, to: field.value.to }}
                            onSelect={(range) => field.onChange(range || { from: undefined, to: undefined })}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                    )}
                />
                {errors.date_range?.from && <p className="text-sm text-destructive">{errors.date_range.from.message}</p>}
                {errors.date_range?.to && <p className="text-sm text-destructive">{errors.date_range.to.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <Label htmlFor="startTime">시작 시간</Label>
                  <Controller
                      name="startTime"
                      control={control}
                      render={({ field }) => <Input id="startTime" type="time" {...field} />}
                  />
                  {errors.startTime && <p className="text-sm text-destructive">{errors.startTime.message}</p>}
              </div>
              <div className="space-y-2">
                  <Label htmlFor="endTime">종료 시간</Label>
                  <Controller
                      name="endTime"
                      control={control}
                      render={({ field }) => <Input id="endTime" type="time" {...field} />}
                  />
                  {errors.endTime && <p className="text-sm text-destructive">{errors.endTime.message}</p>}
              </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purpose">사용 목적</Label>
            <Controller
                name="purpose"
                control={control}
                render={({ field }) => <Textarea id="purpose" placeholder="예: 캡스톤 디자인 프로젝트용" {...field} />}
            />
            {errors.purpose && <p className="text-sm text-destructive">{errors.purpose.message}</p>}
          </div>

          <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>신청 전 확인사항</AlertTitle>
              <AlertDescription>
              대여 신청 후 관리자의 승인이 필요합니다. 승인 상태는 '사용 현황' 페이지에서 확인할 수 있습니다.
              </AlertDescription>
          </Alert>

        </CardContent>
        <CardFooter>
            <Button type="submit" className="w-full md:w-auto ml-auto">
              대여 가능 여부 확인 및 신청
            </Button>
        </CardFooter>
      </Card>
    </form>
    </div>
  );
}

export default function NewRentalPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewRentalPageContents />
        </Suspense>
    )
}
