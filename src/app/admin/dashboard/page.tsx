import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEquipment, getRentals } from "@/lib/data";
import { HardDrive, CalendarClock, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function AdminDashboard() {
  const equipment = getEquipment();
  const rentals = getRentals();

  const totalEquipment = equipment.reduce((sum, item) => sum + item.total_quantity, 0);
  const pendingRentals = rentals.filter(r => r.status === 'pending').length;
  const approvedRentals = rentals.filter(r => r.status === 'approved').length;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">관리자 대시보드</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 장비 수량</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipment}</div>
            <p className="text-xs text-muted-foreground">
              {equipment.length} 종류의 장비
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행중인 대여</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRentals}</div>
            <p className="text-xs text-muted-foreground">
              현재 승인되어 대여중인 항목
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인 대기중</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRentals}</div>
            <p className="text-xs text-muted-foreground">
              승인이 필요한 대여 요청
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 대여 기록</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rentals.length}</div>
            <p className="text-xs text-muted-foreground">
              모든 상태의 대여 기록
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>최근 대여 요청</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Placeholder for recent rentals list */}
                <p className="text-sm text-muted-foreground">최근 대여 요청 목록이 여기에 표시됩니다.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>재고 부족 장비</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Placeholder for low stock items */}
                <p className="text-sm text-muted-foreground">재고가 부족한 장비 목록이 여기에 표시됩니다.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
