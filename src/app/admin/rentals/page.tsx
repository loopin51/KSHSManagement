import { getRentals, getEquipment } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

export default async function AdminRentalsPage() {
  const rentals = await getRentals();
  const equipmentList = await getEquipment();
  const equipmentMap = new Map(equipmentList.map(e => [e.id, e]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">대여 기록 관리</h1>
        <p className="text-muted-foreground">모든 대여 요청을 확인하고 상태를 변경합니다.</p>
      </div>
      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>장비명</TableHead>
                <TableHead>대여자</TableHead>
                <TableHead>대여 기간</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map(rental => {
                const equipment = equipmentMap.get(rental.equipment_id);
                return (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">{equipment?.name || rental.equipment_id}</TableCell>
                    <TableCell>{rental.borrower_name}</TableCell>
                    <TableCell>
                      {format(rental.start_date, 'yyyy-MM-dd HH:mm')} ~ {format(rental.end_date, 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[rental.status]}>{statusText[rental.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">메뉴 열기</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rental.status === 'pending' && (
                            <>
                              <DropdownMenuItem>승인</DropdownMenuItem>
                              <DropdownMenuItem>거절</DropdownMenuItem>
                            </>
                          )}
                          {rental.status === 'approved' && (
                            <DropdownMenuItem>반납 처리</DropdownMenuItem>
                          )}
                           <DropdownMenuItem>상세 보기</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
