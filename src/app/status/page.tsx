import AvailabilityView from '@/components/AvailabilityView';
import { getEquipment, getRentals, getEquipmentById } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RentalStatus } from "@/lib/types";
import { format } from 'date-fns';

const statusColors: Record<RentalStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  returned: "bg-blue-100 text-blue-800",
};

const statusText: Record<RentalStatus, string> = {
    pending: "승인 대기",
    approved: "대여중",
    rejected: "거절됨",
    returned: "반납 완료",
  };

export default function StatusPage() {
  const rentals = getRentals();
  const equipment = getEquipment();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">장비 사용 현황</h1>
        <p className="text-muted-foreground mt-2">
          캘린더를 클릭하여 날짜별 현황을 확인하거나, 아래에서 전체 기록을 조회하세요.
        </p>
      </div>
      <AvailabilityView rentals={rentals} equipment={equipment} />

      <Card>
        <CardHeader>
            <CardTitle>전체 대여 기록</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>장비명</TableHead>
                  <TableHead>대여자</TableHead>
                  <TableHead>대여 기간</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentals.map(rental => {
                  const equipmentItem = getEquipmentById(rental.equipment_id);
                  return (
                    <TableRow key={rental.id}>
                      <TableCell className="font-medium">{equipmentItem?.name || rental.equipment_id}</TableCell>
                      <TableCell>{rental.borrower_name}</TableCell>
                      <TableCell>
                        {format(rental.start_date, 'yyyy-MM-dd HH:mm')} ~ {format(rental.end_date, 'yyyy-MM-dd HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[rental.status]}>{statusText[rental.status]}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
